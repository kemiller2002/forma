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
      Guesses: int[]
      /// Groups opened at or after this index lie inside a JSX element or
      /// template literal the lexer never saw close.
      UncertainFrom: int }

/// Where a `{...}` group that opens at `start` ends, and whether the lexer
/// resolved it (false: the plain fallback, which ignores strings).
let private skipBraces (braces: Braces) (start: int) =
    match braces.Lexed.TryGetValue start with
    | true, finish -> finish, true
    | _ -> braces.Plain.Value[start], false

/// Whether the `{...}` group at `start` is uncertain: resolved by the plain
/// fallback (a `}` in a string would end it early), never closed, opened
/// inside a JSX element or template literal the lexer lost, or spanning a
/// place where the lexer guessed.
let private uncertainGroup (braces: Braces) (text: string) (start: int) =
    let finish, lexed = skipBraces braces start
    let uncertain =
        if not lexed || finish > text.Length || start >= braces.UncertainFrom then true
        else
            let i = Array.BinarySearch(braces.Guesses, start)
            let i = if i < 0 then ~~~i else i
            i < braces.Guesses.Length && braces.Guesses[i] < finish
    finish, uncertain

/// The span of an attribute value that starts at `pos`, the index after it,
/// and whether its `{...}` group runs to the end of the text (unclosed).
let private attributeValue (braces: Braces) (text: string) (limit: int) (pos: int) =
    if pos >= limit then (pos, pos), pos, false
    else
        match text[pos] with
        | '{' ->
            let finish, uncertain = uncertainGroup braces text pos
            (pos, min finish limit), min finish text.Length, uncertain
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
            // A value whose quote never closes runs to the end: uncertain.
            let closed = finish - 1 > pos && text[finish - 1] = quote
            (pos, finish), finish, not closed
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
let private tagLocations (comments: bool) (braces: Braces) (text: string) (start: int) =
    let limit = min text.Length (start + tagScanLimit)
    let rec loop pos acc =
        // The end of the text ends the tag; only the safety bound leaves it unread.
        if pos >= limit then acc, limit < text.Length
        else
            let next = if pos + 1 < limit then text[pos + 1] else '\000'
            match text[pos] with
            | '>' | '<' -> acc, false
            // In script, comments may stand between JSX attributes.
            | '/' when comments && next = '/' && commentBoundary text pos -> loop (lineEnd text pos) acc
            | '/' when comments && next = '*' && commentBoundary text pos ->
                let close = text.IndexOf("*/", pos + 2, StringComparison.Ordinal)
                if close < 0 then acc, true else loop (close + 2) acc
            | '"' | '\'' as quote ->
                let after = skipQuoted text limit false quote (pos + 1)
                // A quote that never closes runs to the end of the text: uncertain.
                if after - 1 > pos && text[after - 1] = quote then loop after acc else acc, true
            | '{' ->
                let finish, uncertain = uncertainGroup braces text pos
                if uncertain then acc, true else loop finish acc
            | c when Char.IsWhiteSpace c ->
                let m = urlAttribute.Match(text, pos + 1)
                if m.Success && m.Index + m.Length <= limit then
                    let span, after, unclosed = attributeValue braces text limit (m.Index + m.Length)
                    if unclosed then span :: acc, true else loop after (span :: acc)
                else loop (pos + 1) acc
            | _ -> loop (pos + 1) acc
    loop start []

/// Whether `c` may start an attribute name, including framework forms
/// (`:href`, `@click`, `[src]`, `(click)`, `#ref`; a `{...spread}` is handled apart).
let private isAttributeStart (c: char) =
    Char.IsLetter c || c = '_' || c = ':' || c = '@' || c = '[' || c = '(' || c = '#'

let private isAttributeChar (c: char) =
    Char.IsLetterOrDigit c || c = '_' || c = ':' || c = '.' || c = '-' || c = '@' || c = '[' || c = ']' || c = '(' || c = ')' || c = '#'

/// How far after an uncertain tag URL-attribute values are left unrewritten:
/// the tag's unread extent, whose `>` cannot be found reliably, so up to the
/// same 1 MiB bound at which a tag is anyway unread.
let private uncertainRegion = tagScanLimit

/// The extent an uncertain tag always gets, even when a certain tag starts
/// inside it.
let private shortRegion = 4096

/// Whether the text from `pos` reads as the rest of a tag's attribute list up
/// to its `>` or `/>` (more attributes, quoted, unquoted or `{...}` values,
/// comments) or that runs on to the end of the region or into another `<`
/// without closing: a value before it may belong to the tag. Script right
/// after it (`;`, `)`, `,`) means no; inside an unquoted attribute value they are
/// allowed (`style=color:red;`, `onclick=go()`, `data-y=@(Model.Y)`).
/// The last attribute run endsLikeTag read: a later call that starts inside
/// it (at a boundary that scan passed) has the same answer, so a long run of
/// URL-shaped values is read once, not once per value.
type private RunMemo = { mutable From: int; mutable Until: int; mutable Limit: int; mutable Result: bool }

let private newMemo () = { From = -1; Until = -1; Limit = -1; Result = false }

let private endsLikeTag (memo: RunMemo) (braces: Braces) (text: string) (limit: int) (pos: int) =
    if memo.Limit = limit && pos > memo.From && pos <= memo.Until then memo.Result
    else
    // Returns the answer and where the run ended.
    let rec loop pos =
        // Attribute syntax that runs to the end of the region or the text, or
        // into another `<` (a tag never closed), cannot be told from a tag.
        if pos >= limit then true, limit
        else
            let next = if pos + 1 < limit then text[pos + 1] else '\000'
            match text[pos] with
            | '>' | '<' -> true, pos
            | '/' when next = '/' && commentBoundary text pos -> loop (lineEnd text pos)
            | '/' when next = '*' && commentBoundary text pos ->
                let close = text.IndexOf("*/", pos + 2, StringComparison.Ordinal)
                if close < 0 then true, limit else loop (close + 2)
            | '/' -> next = '>', pos
            | c when Char.IsWhiteSpace c -> loop (pos + 1)
            | '{' ->
                let finish, _ = skipBraces braces pos
                if finish > text.Length then true, limit else loop finish
            | c when isAttributeStart c ->
                let mutable j = pos
                while j < limit && isAttributeChar text[j] do j <- j + 1
                if j < limit && text[j] = '=' then
                    let k = j + 1
                    if k < limit && (text[k] = '"' || text[k] = '\'') then loop (skipQuoted text limit false text[k] (k + 1))
                    elif k < limit && text[k] = '{' then
                        let finish, _ = skipBraces braces k
                        if finish > text.Length then true, limit else loop finish
                    else
                        let mutable e = k
                        while e < limit && not (Char.IsWhiteSpace text[e]) && text[e] <> '>' do e <- e + 1
                        loop e
                else loop j
            | _ -> false, pos
    let result, until = loop pos
    memo.From <- pos
    memo.Until <- until
    memo.Limit <- limit
    memo.Result <- result
    result

/// URL attribute values between `first` and `last` that are followed by the
/// rest of an attribute list (see endsLikeTag). `cursor` marks text already
/// scanned, so overlapping regions cost linear time in total.
let private looseValues (cursor: int ref) (braces: Braces) (text: string) (first: int) (last: int) =
    let memo = newMemo ()
    [ let mutable pos = max cursor.Value first
      cursor.Value <- max cursor.Value last
      while pos < last do
          if Char.IsWhiteSpace text[pos] then
              let m = urlAttribute.Match(text, pos + 1)
              if m.Success && m.Index + m.Length <= last then
                  let valueStart = m.Index + m.Length
                  let _, after, _ = attributeValue braces text last valueStart
                  if endsLikeTag memo braces text last after then yield valueStart, after
                  pos <- max (pos + 1) after
              else pos <- pos + 1
          else pos <- pos + 1 ]

/// For a `<name` the lexer did not place where markup stands (script code
/// after an operand): the URL attribute values that follow it through
/// attribute syntax only (`name`, `name=value`, `name="…"`, `name={…}`). Any
/// other character (`&&`, `)`, `;`, `|`) ends it, so `if (a <b && c) data =
/// "ef-card"` yields none. A value found here is masked and the tag reported,
/// never rewritten: the tool cannot tell whether this is a tag. In TS and F#
/// (no JSX) markup in code can only be a misread string, which is one line,
/// so there the attributes end at the line end (`if a <b then` / `let data =
/// "ef-fs"` on the next line is script).
let private possibleTagLocations (cursor: int ref) (extentEnd: int -> int) (multiline: bool) (braces: Braces) (text: string) (start: int) =
    let limit = min text.Length (start + tagScanLimit)
    let rec loop pos acc =
        if pos >= limit then acc
        elif text[pos] = '\n' && not multiline then acc
        elif Char.IsWhiteSpace text[pos] then
            let next = pos + 1
            if next < limit && text[next] = '{' then
                // A spread (`{...props}`) may stand among attributes. One that
                // never closes hides the rest: URL values after it that read
                // as attributes up to a `>` are masked.
                let finish, uncertain = uncertainGroup braces text next
                if uncertain then looseValues cursor braces text next (extentEnd next) @ acc
                // The spread itself may carry a URL (`{...{href: "ef-x"}}`):
                // it is masked with the rest and reported if it holds a name.
                else loop (min finish limit) ((next, min finish limit) :: acc)
            elif next < limit && isAttributeStart text[next] then
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
                            // A value that never closes hides the rest, as a spread does.
                            if unclosedValue then looseValues cursor braces text k (extentEnd k) @ acc
                            else loop after acc
                        else
                            // An unquoted value; script punctuation (`c=d;`) means script.
                            while k < limit && not (Char.IsWhiteSpace text[k]) && text[k] <> '>' && text[k] <> '<' && ";(),".IndexOf text[k] < 0 do
                                k <- k + 1
                            if k < limit && ";(),".IndexOf text[k] >= 0 then acc else loop k acc
                    else loop j acc
            else loop next acc
        else acc
    loop start []

/// What the markup scan found: URL value spans to mask, tags that could not be
/// read to their end, and `<name`s that may be tags (outside a place where
/// markup stands) with a URL attribute after them. The last two are reported
/// for review; their values are masked, never rewritten.
type MarkupScan =
    { Spans: (int * int) list
      Uncertain: int list
      PossibleTags: int list
      /// Values masked after an uncertain tag or with a possible tag, with the
      /// tag's index: each gets its own review line.
      Suppressed: (int * int * int) list }

/// Scan every `<name` in the text. In markup text each one is a tag. In script,
/// the lexer's own state decides: a JSX element, JSX children, a string, a
/// template literal or a comment holds markup; a `<` in script code after an
/// operand does not, and is only checked for a URL attribute after it.
///
/// `tokens` holds the sorted start indices of Forma tokens in the text (computed
/// only when a tag needs it). A tag
/// or value is reported only when a token lies in what it would leave
/// unrewritten: without one, nothing can be rewritten wrongly.
let markupScan (syntax: Syntax) (tokens: Lazy<int[]>) (text: string) =
    let hasToken (first: int) (last: int) =
        let tokens = tokens.Value
        let i = Array.BinarySearch(tokens, first)
        let i = if i < 0 then ~~~i else i
        i < tokens.Length && tokens[i] < last
    let starts = tagStart.Matches text
    if starts.Count = 0 then { Spans = []; Uncertain = []; PossibleTags = []; Suppressed = [] }
    else
        let ends, markup, jsxTags, guesses, uncertainFrom = lex syntax text
        let braces = { Lexed = ends; Plain = lazy (plainBraceEnds text); Guesses = guesses; UncertainFrom = uncertainFrom }
        // Where tags certainly start: every tag in markup text, real JSX
        // elements in script. A value after the next such start cannot belong
        // to an earlier uncertain tag's attribute list.
        let definite =
            [| for m in starts do
                   match syntax with
                   | Script _ -> if jsxTags.Contains m.Index then yield m.Index
                   | MarkupText -> yield m.Index |]
        // An uncertain tag's unread extent: its own attribute list, which
        // cannot be read, so up to the next certain tag start (at least 4 KiB,
        // since a JSX value such as `footer={<b/>}` may hold one), and never
        // past the 1 MiB bound. Script after it is not held back for 1 MiB.
        let extentEnd (index: int) =
            let i = Array.BinarySearch(definite, index + 1)
            let i = if i < 0 then ~~~i else i
            let next = if i < definite.Length then definite[i] else Int32.MaxValue
            min text.Length (min (index + uncertainRegion) (max (index + shortRegion) next))
        let possibleCursor = ref 0
        let results =
            [ for m in starts do
                  let after = m.Index + m.Length
                  match syntax with
                  | Script jsx when not (markup.Contains m.Index) ->
                      let spans = possibleTagLocations possibleCursor extentEnd jsx braces text after
                      yield m.Index, spans, false, spans |> List.exists (fun (a, b) -> hasToken a b), false
                  | _ ->
                      // Comments between attributes only in a real JSX element.
                      let spans, uncertain = tagLocations (jsxTags.Contains m.Index) braces text after
                      let uncertain = uncertain && hasToken m.Index (extentEnd m.Index)
                      yield m.Index, spans, uncertain, false, true ]
        // An uncertain tag cannot be trusted to show where its `href` is, so a
        // URL attribute value in the next 4 KiB that is followed by the rest
        // of an attribute list (up to `>`) is masked too and reported at its
        // own line; script such as `data = "x";` is not. A cursor keeps the
        // total linear.
        let mutable cursor = 0
        let memo = newMemo ()
        let loose =
            [ for index, _, uncertain, _, _ in results do
                  if uncertain then
                      let regionEnd = extentEnd index
                      let mutable pos = max cursor index
                      while pos < regionEnd do
                          if Char.IsWhiteSpace text[pos] then
                              let m = urlAttribute.Match(text, pos + 1)
                              if m.Success && m.Index + m.Length <= regionEnd then
                                  let valueStart = m.Index + m.Length
                                  let finish =
                                      if valueStart < regionEnd && text[valueStart] = '{' then min regionEnd (fst (skipBraces braces valueStart))
                                      else
                                          let _, after, _ = attributeValue braces text regionEnd valueStart
                                          after
                                  if endsLikeTag memo braces text regionEnd finish then yield valueStart, finish, index
                                  pos <- max (pos + 1) finish
                              else pos <- pos + 1
                          else pos <- pos + 1
                      cursor <- max cursor regionEnd ]
        // Values a definite tag scan found are locations; every other masked
        // value (after an uncertain tag, or after a possible tag) is listed.
        let found = Collections.Generic.HashSet<int>([ for _, spans, _, _, definite in results do if definite then for start, _ in spans -> start ])
        { Spans = [ for start, finish, _ in loose -> start, finish ] @ [ for _, spans, _, _, _ in results do yield! spans ]
          Suppressed =
            (loose |> List.filter (fun (start, _, _) -> not (found.Contains start)))
            @ [ for index, spans, _, _, definite in results do
                    if not definite then
                        for start, finish in spans -> start, finish, index ]
          Uncertain = [ for index, _, uncertain, _, _ in results do if uncertain then yield index ]
          PossibleTags = [ for index, _, _, possible, _ in results do if possible then yield index ] }
