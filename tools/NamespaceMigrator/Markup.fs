/// FORMA-NS-001: markup tags for the namespace migrator. A URL-valued
/// attribute (`src`, `href`, ...) is a location only inside an HTML, Razor, Vue
/// or JSX tag; this module finds those values. No I/O lives here.
module Forma.NamespaceMigrator.Markup

open System
open System.Text.RegularExpressions

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

/// How a file's text outside markup tags reads: markup text (HTML, Razor,
/// Vue, Svelte, Markdown, CSS, JSON), where every `<name` starts a tag and
/// only `{...}` holds script; or script (JS, TS, F#), lexed throughout, with
/// JSX elements only where `jsx` is set (JS, JSX, TSX).
type Syntax =
    | MarkupText
    | Script of jsx: bool

/// One level of the brace lexer's context.
[<RequireQualifiedAccess>]
type private Frame =
    /// Script inside `{` at `start` (-1: a script file's top level).
    | Code of start: int
    /// Template-literal text.
    | Template
    /// A JSX opening tag's attributes.
    | JsxTag
    /// A JSX element's children (text, not script).
    | JsxChildren

let private isIdentifier (c: char) = Char.IsLetterOrDigit c || c = '_' || c = '$'

/// Words after which `/` opens a regular expression and `<` a JSX element.
let private operatorWords =
    Collections.Generic.HashSet<string>(
        [ "return"; "typeof"; "case"; "do"; "else"; "in"; "of"; "new"; "delete"; "void"; "throw"; "yield"; "await"; "default" ]
    )

/// The index of the line end at or after `pos`, or the end of the text.
let private lineEnd (text: string) (pos: int) =
    let i = text.IndexOf('\n', pos)
    if i < 0 then text.Length else i

/// A script string: a backslash escapes, and it ends at its quote or, unclosed,
/// at the line end (a JS string cannot span lines), so a stray quote never
/// swallows more than its line.
let private skipScriptString (text: string) (quote: char) (pos: int) =
    let rec loop i =
        if i >= text.Length || text[i] = '\n' then i
        elif text[i] = '\\' then loop (i + 2)
        elif text[i] = quote then i + 1
        else loop (i + 1)
    loop pos

/// A regular-expression literal whose `/` is at `pos`: the index after its
/// flags, or None when no closing `/` comes before the line end.
let private skipRegex (text: string) (pos: int) =
    let rec loop i inClass =
        if i >= text.Length || text[i] = '\n' then None
        else
            match text[i] with
            | '\\' -> loop (i + 2) inClass
            | '[' -> loop (i + 1) true
            | ']' -> loop (i + 1) false
            | '/' when not inClass ->
                let mutable j = i + 1
                while j < text.Length && Char.IsLetter text[j] do j <- j + 1
                Some j
            | _ -> loop (i + 1) inClass
    loop (pos + 1) false

/// The end of a JSX tag name that starts at `pos` (a letter), when it is
/// followed by whitespace, `/` or `>` as a tag name must be.
let private jsxName (text: string) (pos: int) =
    let mutable j = pos
    while j < text.Length && (Char.IsLetterOrDigit text[j] || text[j] = ':' || text[j] = '.' || text[j] = '_' || text[j] = '-') do
        j <- j + 1
    if j < text.Length && (Char.IsWhiteSpace text[j] || text[j] = '/' || text[j] = '>') then Some j else None

/// Where every `{...}` group ends, from one pass over the text. Inside braces
/// (and throughout a script file) the text is lexed as script: strings,
/// template literals, `//` and `/* */` comments and regular-expression
/// literals are skipped, and in JS, JSX and TSX a JSX element's children are
/// text, so a quote in `/* don't */`, `/'/g` or `<p>It's</p>` never hides a
/// closing brace. An unclosed `{` ends at the end of the text. The pass is
/// linear, and the tag scan looks groups up here.
let private braceEnds (syntax: Syntax) (text: string) =
    let ends = Collections.Generic.Dictionary<int, int>()
    let jsx = match syntax with Script jsx -> jsx | MarkupText -> false
    let stack = Collections.Generic.Stack<Frame>()
    match syntax with
    | Script _ -> stack.Push(Frame.Code -1)
    | MarkupText -> ()
    let mutable pos = 0
    // Whether the next script token starts an expression (so `/` opens a
    // regular expression and `<` a JSX element).
    let mutable expression = true
    let openBrace () =
        stack.Push(Frame.Code pos)
        pos <- pos + 1
        expression <- true
    while pos < text.Length do
        let c = text[pos]
        if stack.Count = 0 then
            (if c = '{' then openBrace () else pos <- pos + 1)
        else
            match stack.Peek() with
            | Frame.Code start ->
                let next = if pos + 1 < text.Length then text[pos + 1] else '\000'
                match c with
                | '"' | '\'' ->
                    pos <- skipScriptString text c (pos + 1)
                    expression <- false
                | '`' ->
                    stack.Push Frame.Template
                    pos <- pos + 1
                | '/' when next = '/' -> pos <- lineEnd text pos
                | '/' when next = '*' ->
                    let close = text.IndexOf("*/", pos + 2, StringComparison.Ordinal)
                    pos <- if close < 0 then text.Length else close + 2
                | '/' when expression ->
                    match skipRegex text pos with
                    | Some after ->
                        pos <- after
                        expression <- false
                    | None -> pos <- pos + 1
                | '<' when jsx && expression && (next = '>' || Char.IsLetter next) ->
                    if next = '>' then
                        stack.Push Frame.JsxChildren
                        pos <- pos + 2
                    else
                        match jsxName text (pos + 1) with
                        | Some after ->
                            stack.Push Frame.JsxTag
                            pos <- after
                        | None ->
                            pos <- pos + 1
                            expression <- true
                | '{' -> openBrace ()
                | '}' ->
                    if start >= 0 then
                        ends[start] <- pos + 1
                        stack.Pop() |> ignore
                    pos <- pos + 1
                    expression <- false
                | ')' | ']' ->
                    pos <- pos + 1
                    expression <- false
                | c when isIdentifier c ->
                    let first = pos
                    while pos < text.Length && isIdentifier text[pos] do pos <- pos + 1
                    // Operator words are 2 to 6 letters: skip the lookup for others.
                    let length = pos - first
                    expression <- length >= 2 && length <= 6 && operatorWords.Contains(text.Substring(first, length))
                | c when Char.IsWhiteSpace c -> pos <- pos + 1
                | _ ->
                    pos <- pos + 1
                    expression <- true
            | Frame.Template ->
                match c with
                | '\\' -> pos <- pos + 2
                | '`' ->
                    stack.Pop() |> ignore
                    pos <- pos + 1
                    expression <- false
                | '$' when pos + 1 < text.Length && text[pos + 1] = '{' ->
                    pos <- pos + 1
                    openBrace ()
                | _ -> pos <- pos + 1
            | Frame.JsxTag ->
                match c with
                | '"' | '\'' ->
                    let close = text.IndexOf(c, pos + 1)
                    pos <- if close < 0 then text.Length else close + 1
                | '{' -> openBrace ()
                | '/' when pos + 1 < text.Length && text[pos + 1] = '>' ->
                    stack.Pop() |> ignore
                    pos <- pos + 2
                    expression <- false
                | '>' ->
                    stack.Pop() |> ignore
                    stack.Push Frame.JsxChildren
                    pos <- pos + 1
                | _ -> pos <- pos + 1
            | Frame.JsxChildren ->
                let next = if pos + 1 < text.Length then text[pos + 1] else '\000'
                match c with
                | '{' -> openBrace ()
                | '<' when next = '/' ->
                    let close = text.IndexOf('>', pos)
                    stack.Pop() |> ignore
                    pos <- if close < 0 then text.Length else close + 1
                    expression <- false
                | '<' when next = '>' ->
                    stack.Push Frame.JsxChildren
                    pos <- pos + 2
                | '<' when Char.IsLetter next ->
                    match jsxName text (pos + 1) with
                    | Some after ->
                        stack.Push Frame.JsxTag
                        pos <- after
                    | None -> pos <- pos + 1
                | _ -> pos <- pos + 1
    for frame in stack do
        match frame with
        | Frame.Code start when start >= 0 -> ends[start] <- text.Length
        | _ -> ()
    ends

/// Where every `{` ends by brace depth alone, ignoring strings: the fallback
/// for a `{` the lexer skipped (inside a script string or comment, such as
/// `'<a onclick="{x}" href="…">'`). Built once, on first use; linear.
let private plainBraceEnds (text: string) =
    let ends = Collections.Generic.Dictionary<int, int>()
    let opens = Collections.Generic.Stack<int>()
    for i in 0 .. text.Length - 1 do
        match text[i] with
        | '{' -> opens.Push i
        | '}' when opens.Count > 0 -> ends[opens.Pop()] <- i + 1
        | _ -> ()
    for start in opens do ends[start] <- text.Length
    ends

/// Brace-group ends: the lexer's table, then the plain fallback.
type private Braces = { Lexed: Collections.Generic.Dictionary<int, int>; Plain: Lazy<Collections.Generic.Dictionary<int, int>> }

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
            (pos, min finish limit), finish, finish >= text.Length
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
                if finish >= text.Length then acc, true else loop finish acc
            | c when Char.IsWhiteSpace c ->
                let m = urlAttribute.Match(text, pos + 1)
                if m.Success && m.Index + m.Length <= limit then
                    let span, after, unclosed = attributeValue braces text limit (m.Index + m.Length)
                    if unclosed then span :: acc, true else loop after (span :: acc)
                else loop (pos + 1) acc
            | _ -> loop (pos + 1) acc
    loop start []

/// Characters that may come before a tag in script: an operator or opening
/// punctuation (`= <a`, `(<a`, `&& <a`, `? <a :`), a closing `>` or `}` (JSX
/// children) or a quote (markup in a string, `'<a href="…">'`).
let private beforeTag = "(=,?:{[&|!;>}'\"`+"

/// Characters of prose, walked back over to find what a word before a tag follows.
let private isProse (c: char) =
    Char.IsLetterOrDigit c || c = ' ' || c = '\t' || c = '.' || c = ',' || c = '!' || c = '?' || c = '\'' || c = '"' || c = '-'

/// Whether `<name` at `index` may start a tag. In markup text, always. In
/// script, `<` after an operand (`a <b && c`, `i <n )`, `Array<Foo | Bar`) is
/// a comparison or a type argument, not a tag, so the text after it is not
/// read as attributes: a tag must start its line or follow an operator,
/// opening punctuation, `return`-like word, quote, `>` or `}`. A word before it
/// is JSX text only when prose leads back to a `>` or `}` (`<p>See <a …>`);
/// in TS and F# (no JSX) that walk stops at the line start. The walk reads at
/// most 256 characters, so the check is constant time.
let private mayStartTag (syntax: Syntax) (text: string) (index: int) =
    match syntax with
    | MarkupText -> true
    | Script jsx ->
        let mutable j = index - 1
        while j >= 0 && (text[j] = ' ' || text[j] = '\t' || text[j] = '\r') do j <- j - 1
        if j < 0 || text[j] = '\n' || beforeTag.IndexOf text[j] >= 0 then true
        elif isIdentifier text[j] then
            let wordEnd = j + 1
            while j >= 0 && isIdentifier text[j] do j <- j - 1
            if operatorWords.Contains(text.Substring(j + 1, wordEnd - j - 1)) then true
            else
                let bound = max 0 (index - 256)
                while j >= bound && (isProse text[j] || (jsx && (text[j] = '\n' || text[j] = '\r'))) do j <- j - 1
                j >= bound && (text[j] = '>' || text[j] = '}')
        else false

/// The (start, end) spans of URL-valued attribute values inside markup tags,
/// and the indices of tags that could not be read to their end.
let markupScan (syntax: Syntax) (text: string) =
    let starts = tagStart.Matches text
    if starts.Count = 0 then [], []
    else
        let braces = { Lexed = braceEnds syntax text; Plain = lazy (plainBraceEnds text) }
        let results =
            [ for m in starts do
                  if mayStartTag syntax text m.Index then
                      let spans, uncertain = tagLocations braces text (m.Index + m.Length)
                      yield m.Index, spans, uncertain ]
        [ for _, spans, _ in results do yield! spans ], [ for index, _, uncertain in results do if uncertain then yield index ]

/// The (start, end) spans of URL-valued attribute values inside markup tags.
let markupLocations (syntax: Syntax) (text: string) = fst (markupScan syntax text)
