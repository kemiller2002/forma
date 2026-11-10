/// FORMA-NS-001: the script lexer behind the namespace migrator's tag scan.
/// One linear pass finds where every `{...}` group ends, which `<` stand where
/// markup can (JSX, strings, template literals, regular expressions,
/// comments, markup text), and where the lexer had to guess. No I/O lives here.
module Forma.NamespaceMigrator.Lexer

open System

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

let isIdentifier (c: char) = Char.IsLetterOrDigit c || c = '_' || c = '$'

/// Words after which `/` opens a regular expression and `<` a JSX element.
let operatorWords =
    Collections.Generic.HashSet<string>(
        [ "return"; "typeof"; "case"; "do"; "else"; "in"; "of"; "new"; "delete"; "void"; "throw"; "yield"; "await"; "default" ]
    )

/// The end recorded for a `{` that is never closed: past the text, so a group
/// that closes on the last character (`…}` at the end of a file) is closed.
let unclosed (text: string) = text.Length + 1

/// The index of the line end at or after `pos`, or the end of the text.
let lineEnd (text: string) (pos: int) =
    let i = text.IndexOf('\n', pos)
    if i < 0 then text.Length else i

/// A script string: a backslash escapes, and it ends at its quote or, unclosed,
/// at the line end (a JS string cannot span lines), so a stray quote never
/// swallows more than its line.
let skipScriptString (text: string) (quote: char) (pos: int) =
    let rec loop i =
        if i >= text.Length || text[i] = '\n' then i
        elif text[i] = '\\' then loop (i + 2)
        elif text[i] = quote then i + 1
        else loop (i + 1)
    loop pos

/// The longest regular-expression literal looked for (a longer one is read
/// as division and recorded as a guess), so a line of unclosed `/[` costs
/// linear time.
let regexLimit = 512

/// Why a `/` does not open a regular-expression literal.
type NoRegex =
    /// No closing `/` on the line and no `[` class entered: no later `/` on
    /// the line closes one either.
    | LineHasNone
    /// Not a valid literal (unbalanced parentheses, bad flags, a class left open).
    | Invalid
    /// Longer than the bound: the lexer guesses division.
    | TooLong

/// A regular-expression literal whose `/` is at `pos`: Ok with the index after
/// its flags, or Error when no closing `/` comes before the line end or the
/// bound. Error carries whether the scan never entered a `[...]` class and
/// reached the line end: then no later `/` on that line closes a literal
/// either, and the caller skips them.
let skipRegex (text: string) (pos: int) =
    let bound = min text.Length (pos + regexLimit)
    // A literal must be valid: parentheses balance outside classes and the
    // flags are regular-expression flags (`b / c; }} href="x">x</a>` is not one).
    let rec loop i inClass entered parens =
        if i >= text.Length || text[i] = '\n' then Error(if entered then Invalid else LineHasNone)
        elif i >= bound then Error TooLong
        else
            match text[i] with
            | '\\' -> loop (i + 2) inClass entered parens
            | '[' when not inClass -> loop (i + 1) true true parens
            | ']' -> loop (i + 1) false entered parens
            | '(' when not inClass -> loop (i + 1) inClass entered (parens + 1)
            | ')' when not inClass -> if parens = 0 then Error Invalid else loop (i + 1) inClass entered (parens - 1)
            | '/' when not inClass ->
                let mutable j = i + 1
                while j < text.Length && Char.IsLetter text[j] && "dgimsuyv".IndexOf text[j] >= 0 do j <- j + 1
                if parens <> 0 || (j < text.Length && isIdentifier text[j]) then Error Invalid else Ok j
            | _ -> loop (i + 1) inClass entered parens
    loop (pos + 1) false false 0

/// The end of a JSX tag name that starts at `pos` (a letter), when it is
/// followed by whitespace, `/` or `>` as a tag name must be.
let jsxName (text: string) (pos: int) =
    let mutable j = pos
    while j < text.Length && (Char.IsLetterOrDigit text[j] || text[j] = ':' || text[j] = '.' || text[j] = '_' || text[j] = '-') do
        j <- j + 1
    if j < text.Length && (Char.IsWhiteSpace text[j] || text[j] = '/' || text[j] = '>') then Some j else None

/// Where every `{...}` group ends, from one pass over the text. Inside braces
/// (and throughout a script file) the text is lexed as script: strings,
/// template literals, `//` and `/* */` comments and regular-expression
/// literals are skipped, and in JS, JSX and TSX a JSX element's children are
/// text, so a quote in `/* don't */`, `/'/g` or `<p>It's</p>` never hides a
/// closing brace. An unclosed `{` gets `unclosed text` as its end. The pass
/// is linear, and the tag scan looks groups up here.
///
/// It also records every `<` where markup can stand: in markup text, a JSX
/// element start, JSX children, a string, a template literal, a regular
/// expression or a comment.
/// Any other `<` (in script code after an operand, `a <b && c`) is not a tag.
let lex (syntax: Syntax) (text: string) =
    let ends = Collections.Generic.Dictionary<int, int>()
    let markup = Collections.Generic.HashSet<int>()
    // Where the lexer had to guess (an unclosed string, a `/` that could be
    // division or a regular expression holding a brace or quote): a `{...}`
    // group that spans one of these may end at the wrong brace.
    let guesses = Collections.Generic.List<int>()
    let markRange (first: int) (last: int) =
        let mutable i = text.IndexOf('<', first, max 0 (min text.Length last - first))
        while i >= 0 do
            markup.Add i |> ignore
            i <- if i + 1 < last then text.IndexOf('<', i + 1, min text.Length last - i - 1) else -1
    // No `/` before this index closes a regular expression (see skipRegex).
    let mutable noRegexUntil = -1
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
            if c = '{' then openBrace ()
            else
                if c = '<' then markup.Add pos |> ignore
                pos <- pos + 1
        else
            match stack.Peek() with
            | Frame.Code start ->
                let next = if pos + 1 < text.Length then text[pos + 1] else '\000'
                match c with
                | '"' | '\'' ->
                    let after = skipScriptString text c (pos + 1)
                    if not (after - 1 > pos && text[after - 1] = c) then guesses.Add pos
                    markRange pos after
                    pos <- after
                    expression <- false
                | '`' ->
                    stack.Push Frame.Template
                    pos <- pos + 1
                | '/' when next = '/' ->
                    let after = lineEnd text pos
                    markRange pos after
                    pos <- after
                | '/' when next = '*' ->
                    let close = text.IndexOf("*/", pos + 2, StringComparison.Ordinal)
                    let after = if close < 0 then text.Length else close + 2
                    markRange pos after
                    pos <- after
                | '/' when expression && pos >= noRegexUntil ->
                    match skipRegex text pos with
                    | Ok after ->
                        // A regular expression may match markup: its `<` count too.
                        markRange pos after
                        pos <- after
                        expression <- false
                    | Error reason ->
                        if reason = LineHasNone then noRegexUntil <- lineEnd text pos
                        guesses.Add pos
                        pos <- pos + 1
                | '<' when jsx && expression && (next = '>' || Char.IsLetter next) ->
                    markup.Add pos |> ignore
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
                    // A block ends a statement, so an expression may follow
                    // (`} <a …>`, `} /re/`).
                    expression <- true
                | ')' | ']' ->
                    pos <- pos + 1
                    expression <- false
                | c when isIdentifier c ->
                    let first = pos
                    while pos < text.Length && isIdentifier text[pos] do pos <- pos + 1
                    // Operator words are 2 to 7 letters: skip the lookup for others.
                    let length = pos - first
                    expression <- length >= 2 && length <= 7 && operatorWords.Contains(text.Substring(first, length))
                | c when Char.IsWhiteSpace c -> pos <- pos + 1
                | '/' ->
                    // Read as division; if it also reads as a regular
                    // expression that holds a brace or quote, that is a guess.
                    if pos >= noRegexUntil then
                        match skipRegex text pos with
                        | Ok after when text.IndexOfAny([| '{'; '}'; '\''; '"'; '`' |], pos + 1, after - pos - 1) >= 0 -> guesses.Add pos
                        | Error LineHasNone -> noRegexUntil <- lineEnd text pos
                        | Error TooLong -> guesses.Add pos
                        | _ -> ()
                    pos <- pos + 1
                    expression <- true
                | _ ->
                    pos <- pos + 1
                    expression <- true
            | Frame.Template ->
                match c with
                | '<' ->
                    markup.Add pos |> ignore
                    pos <- pos + 1
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
                    if close < 0 then guesses.Add pos
                    let after = if close < 0 then text.Length else close + 1
                    markRange pos after
                    pos <- after
                | '{' -> openBrace ()
                | '/' when pos + 1 < text.Length && text[pos + 1] = '>' ->
                    stack.Pop() |> ignore
                    pos <- pos + 2
                    // After a JSX element only another element (siblings in
                    // text) or an operator is plausible.
                    expression <- true
                | '>' ->
                    stack.Pop() |> ignore
                    stack.Push Frame.JsxChildren
                    pos <- pos + 1
                | _ -> pos <- pos + 1
            | Frame.JsxChildren ->
                let next = if pos + 1 < text.Length then text[pos + 1] else '\000'
                if c = '<' then markup.Add pos |> ignore
                match c with
                | '{' -> openBrace ()
                | '<' when next = '/' ->
                    let close = text.IndexOf('>', pos)
                    stack.Pop() |> ignore
                    pos <- if close < 0 then text.Length else close + 1
                    expression <- true
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
        | Frame.Code start when start >= 0 -> ends[start] <- unclosed text
        | _ -> ()
    ends, markup, guesses.ToArray()

/// Where every `{` ends by brace depth alone, ignoring strings: the fallback
/// for a `{` the lexer skipped (inside a script string or comment, such as
/// `'<a onclick="{x}" href="…">'`). Built once, on first use; linear.
let plainBraceEnds (text: string) =
    let ends = Collections.Generic.Dictionary<int, int>()
    let opens = Collections.Generic.Stack<int>()
    for i in 0 .. text.Length - 1 do
        match text[i] with
        | '{' -> opens.Push i
        | '}' when opens.Count > 0 -> ends[opens.Pop()] <- i + 1
        | _ -> ()
    for start in opens do ends[start] <- unclosed text
    ends
