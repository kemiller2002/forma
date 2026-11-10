/// FORMA-NS-001: markup tags for the namespace migrator. A URL-valued
/// attribute (`src`, `href`, ...) is a location only inside an HTML, Razor, Vue
/// or JSX tag; this module finds those values. No I/O lives here.
module Forma.NamespaceMigrator.Markup

open System
open System.Text.RegularExpressions
open Forma.NamespaceMigrator.Lexer

let private regex pattern = Regex(pattern, RegexOptions.CultureInvariant ||| RegexOptions.Compiled ||| RegexOptions.Multiline)

// --- Markup tags -------------------------------------------------------------
//
// A URL-valued attribute is a location only inside an HTML, Razor, Vue or JSX
// tag. A tag is scanned character by character, so a `>` inside a quoted
// value, a JSX expression (`onClick={() => go()}`, `{x > 1}`) or a Razor
// expression (`href="@Url.Action("ef-index")"`) does not end it.

let private tagStart = regex @"<[A-Za-z][A-Za-z0-9:._\-]*(?=[\s/>])"
/// A URL-valued attribute name, in any letter case (`HREF`, React `srcSet`,
/// `formAction`, `xlinkHref`), also as a Vue or Angular binding (`:href`,
/// `v-bind:href`, `[href]`), whose value is then an expression that holds the URL.
let private urlAttribute =
    Regex(
        @"\G(?<![A-Za-z0-9_$.\-:@])(?:v-bind:|:|\[)?(?:src|href|srcset|action|formaction|poster|data|cite|background|xlink:href|xlinkhref|manifest|ping)\]?\s*=\s*",
        RegexOptions.CultureInvariant ||| RegexOptions.IgnoreCase
    )

/// A safety bound on one tag's scan, far above any real tag (a long data
/// attribute, a large JSX prop object). The scan normally ends at the tag's
/// `>` or at the next bare `<`, which keeps the total work linear.
let private tagScanLimit = 1 <<< 20

/// The index just past a quoted string whose opening quote is just before
/// `pos`, or `limit`. `escapes`: a backslash escapes the next character (in
/// script strings and JSX expressions, never in HTML attribute values).
let rec private skipQuoted (text: string) (limit: int) (escapes: bool) (quote: char) (pos: int) =
    if pos >= limit then limit
    elif escapes && text[pos] = '\\' then skipQuoted text limit escapes quote (pos + 2)
    elif text[pos] = quote then pos + 1
    else skipQuoted text limit escapes quote (pos + 1)

/// Brace-group ends: the lexer's table, then the plain fallback.
type private Braces =
    { Lexed: Collections.Generic.Dictionary<int, int>
      Plain: Lazy<Collections.Generic.Dictionary<int, int>>
      Guesses: int[] }

/// Whether a `{...}` group from `start` to `finish` is uncertain: never
/// closed, or spanning a place where the lexer guessed.
let private uncertainGroup (braces: Braces) (text: string) (start: int) (finish: int) =
    if finish > text.Length then true
    else
        let i = Array.BinarySearch(braces.Guesses, start)
        let i = if i < 0 then ~~~i else i
        i < braces.Guesses.Length && braces.Guesses[i] < finish

let private skipBraces (braces: Braces) (start: int) =
    match braces.Lexed.TryGetValue start with
    | true, finish -> finish
    | _ -> braces.Plain.Value[start]

/// The span of an attribute value that starts at `pos`, the index after it,
/// and whether its `{...}` group runs to the end of the text (unclosed).
let private attributeValue (braces: Braces) (text: string) (limit: int) (pos: int) =
    if pos >= limit then (pos, pos), pos, false
    else
        match text[pos] with
        | '{' ->
            let finish = skipBraces braces pos
            (pos, min finish limit), min finish text.Length, uncertainGroup braces text pos finish
        | '"' | '\'' as quote ->
            // Razor: "@Url.Action("ef-index")" holds C# strings inside
            // parentheses. A Razor expression ends at its line end at most, so
            // an unclosed `@(` costs one line.
            let rec loop parens i =
                if i >= limit then limit
                else
                    match text[i] with
                    | '\n' when parens > 0 -> i
                    | '(' -> loop (parens + 1) (i + 1)
                    | ')' -> loop (max 0 (parens - 1)) (i + 1)
                    | c when c = quote && parens = 0 -> i + 1
                    | '"' | '\'' as inner when parens > 0 -> loop parens (min limit (skipScriptString text inner (i + 1)))
                    | _ -> loop parens (i + 1)
            let finish =
                if pos + 1 < limit && text[pos + 1] = '@' then loop 0 (pos + 1)
                else skipQuoted text limit false quote (pos + 1)
            (pos, finish), finish, false
        | _ ->
            let rec loop i = if i < limit && not (Char.IsWhiteSpace text[i]) && text[i] <> '>' then loop (i + 1) else i
            let finish = loop pos
            (pos, finish), finish, false

/// The URL-valued attribute values inside the tag that opens at `start`, and
/// whether the tag could not be read to its end (a `{...}` group in it is
/// never closed, or the tag is longer than the safety bound): such a tag is
/// listed for review, since an `href` after that point is not seen.
/// The scan ends at the tag's `>` or at a bare `<` (`title=a<b`); values found
/// before the end are kept. Braces are looked up, so each scan reads only the
/// tag's own top-level text and the total stays linear.
let private tagLocations (braces: Braces) (text: string) (start: int) =
    let limit = min text.Length (start + tagScanLimit)
    let rec loop pos acc =
        // The end of the text ends the tag; only the safety bound leaves it unread.
        if pos >= limit then acc, limit < text.Length
        else
            match text[pos] with
            | '>' | '<' -> acc, false
            | '"' | '\'' as quote -> loop (skipQuoted text limit false quote (pos + 1)) acc
            | '{' ->
                let finish = skipBraces braces pos
                if uncertainGroup braces text pos finish then acc, true else loop finish acc
            | c when Char.IsWhiteSpace c ->
                let m = urlAttribute.Match(text, pos + 1)
                if m.Success && m.Index + m.Length <= limit then
                    let span, after, unclosed = attributeValue braces text limit (m.Index + m.Length)
                    if unclosed then span :: acc, true else loop after (span :: acc)
                else loop (pos + 1) acc
            | _ -> loop (pos + 1) acc
    loop start []

/// Whether `c` may start an attribute name, including framework forms
/// (`:href`, `@click`, `[src]`, `(click)`, `#ref`, `{...spread}` aside).
let private isAttributeStart (c: char) =
    Char.IsLetter c || c = '_' || c = ':' || c = '@' || c = '[' || c = '(' || c = '#'

let private isAttributeChar (c: char) =
    Char.IsLetterOrDigit c || c = '_' || c = ':' || c = '.' || c = '-' || c = '@' || c = '[' || c = ']' || c = '(' || c = ')' || c = '#'

/// For a `<name` the lexer did not place where markup stands (script code
/// after an operand): the URL attribute values that follow it through
/// attribute syntax only (`name`, `name=value`, `name="…"`, `name={…}`). Any
/// other character (`&&`, `)`, `;`, `|`) ends it, so `if (a <b && c) data =
/// "ef-card"` yields none. A value found here is masked and the tag reported,
/// never rewritten: the tool cannot tell whether this is a tag. In TS and F#
/// (no JSX) markup in code can only be a misread string, which is one line,
/// so there the attributes end at the line end (`if a <b then` / `let data =
/// "ef-fs"` on the next line is script).
let private possibleTagLocations (multiline: bool) (braces: Braces) (text: string) (start: int) =
    let limit = min text.Length (start + tagScanLimit)
    let rec loop pos acc =
        if pos >= limit then acc
        elif text[pos] = '\n' && not multiline then acc
        elif Char.IsWhiteSpace text[pos] then
            let next = pos + 1
            if next < limit && isAttributeStart text[next] then
                let m = urlAttribute.Match(text, next)
                if m.Success && m.Index + m.Length <= limit then
                    let span, after, unclosedValue = attributeValue braces text limit (m.Index + m.Length)
                    if unclosedValue then span :: acc else loop after (span :: acc)
                else
                    let mutable j = next
                    while j < limit && isAttributeChar text[j] do j <- j + 1
                    let mutable k = j
                    while k < limit && (text[k] = ' ' || text[k] = '\t') do k <- k + 1
                    if k < limit && text[k] = '=' then
                        k <- k + 1
                        while k < limit && Char.IsWhiteSpace text[k] do k <- k + 1
                        if k < limit && (text[k] = '"' || text[k] = '\'' || text[k] = '{') then
                            let _, after, unclosedValue = attributeValue braces text limit k
                            if unclosedValue then acc else loop after acc
                        else
                            while k < limit && not (Char.IsWhiteSpace text[k]) && text[k] <> '>' && text[k] <> '<' do k <- k + 1
                            loop k acc
                    else loop j acc
            else loop next acc
        else acc
    loop start []

/// How far after an uncertain tag URL-attribute values are left unrewritten.
let private uncertainRegion = 4096

/// What the markup scan found: URL value spans to mask, tags that could not be
/// read to their end, and `<name`s that may be tags (outside a place where
/// markup stands) with a URL attribute after them. The last two are reported
/// for review; their values are masked, never rewritten.
type MarkupScan =
    { Spans: (int * int) list
      Uncertain: int list
      PossibleTags: int list }

/// Scan every `<name` in the text. In markup text each one is a tag. In script,
/// the lexer's own state decides: a JSX element, JSX children, a string, a
/// template literal or a comment holds markup; a `<` in script code after an
/// operand does not, and is only checked for a URL attribute after it.
let markupScan (syntax: Syntax) (text: string) =
    let starts = tagStart.Matches text
    if starts.Count = 0 then { Spans = []; Uncertain = []; PossibleTags = [] }
    else
        let ends, markup, guesses = lex syntax text
        let braces = { Lexed = ends; Plain = lazy (plainBraceEnds text); Guesses = guesses }
        let results =
            [ for m in starts do
                  let after = m.Index + m.Length
                  match syntax with
                  | Script jsx when not (markup.Contains m.Index) ->
                      let spans = possibleTagLocations jsx braces text after
                      yield m.Index, spans, false, not spans.IsEmpty
                  | _ ->
                      let spans, uncertain = tagLocations braces text after
                      yield m.Index, spans, uncertain, false ]
        // An uncertain tag cannot be trusted to show where its `href` is, so
        // every URL-attribute-shaped value in the next 4 KiB is masked too
        // (a cursor keeps the total linear).
        let mutable cursor = 0
        let loose =
            [ for index, _, uncertain, _ in results do
                  if uncertain then
                      let regionEnd = min text.Length (index + uncertainRegion)
                      let mutable pos = max cursor index
                      while pos < regionEnd do
                          if Char.IsWhiteSpace text[pos] then
                              let m = urlAttribute.Match(text, pos + 1)
                              if m.Success && m.Index + m.Length <= regionEnd then
                                  let valueStart = m.Index + m.Length
                                  let finish =
                                      if valueStart < regionEnd && text[valueStart] = '{' then min regionEnd (skipBraces braces valueStart)
                                      else
                                          let _, after, _ = attributeValue braces text regionEnd valueStart
                                          after
                                  yield valueStart, finish
                                  pos <- max (pos + 1) finish
                              else pos <- pos + 1
                          else pos <- pos + 1
                      cursor <- max cursor regionEnd ]
        { Spans = loose @ [ for _, spans, _, _ in results do yield! spans ]
          Uncertain = [ for index, _, uncertain, _ in results do if uncertain then yield index ]
          PossibleTags = [ for index, _, _, possible in results do if possible then yield index ] }

/// The (start, end) spans of URL-valued attribute values inside markup tags.
let markupLocations (syntax: Syntax) (text: string) = (markupScan syntax text).Spans
