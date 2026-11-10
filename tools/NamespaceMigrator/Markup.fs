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
let private urlAttribute =
    Regex(@"\G(?<![A-Za-z0-9_$.\-:@])(?:src|href|srcset|action|formaction|poster|data|cite|background|xlink:href|manifest|ping)\s*=\s*", RegexOptions.CultureInvariant)

/// A safety bound on one tag's scan, far above any real tag (a long data
/// attribute, a large JSX prop object). The scan normally ends at the tag's
/// `>` or at the next bare `<`, which keeps the total work linear: a stray
/// `<b` in script (`if (a <b && c)`) stops at the next `<`.
let private tagScanLimit = 1 <<< 20

/// The index just past a quoted string whose opening quote is just before
/// `pos`, or `limit`. `escapes`: a backslash escapes the next character (in
/// script strings and JSX expressions, never in HTML attribute values).
let rec private skipQuoted (text: string) (limit: int) (escapes: bool) (quote: char) (pos: int) =
    if pos >= limit then limit
    elif escapes && text[pos] = '\\' then skipQuoted text limit escapes quote (pos + 2)
    elif text[pos] = quote then pos + 1
    else skipQuoted text limit escapes quote (pos + 1)

/// Where every `{...}` group ends, from one pass over the text: brace depth
/// with script strings skipped inside braces (outside braces quotes are prose
/// or markup and are not tracked). An unclosed `{` ends at the end of the
/// text. The tag scan looks groups up here, so a JSX expression of any size
/// is skipped in constant time and unbalanced braces cannot make the scan
/// quadratic.
let private braceEnds (text: string) =
    let ends = Collections.Generic.Dictionary<int, int>()
    let rec loop (opens: int list) pos =
        if pos >= text.Length then
            for start in opens do ends[start] <- text.Length
        else
            match text[pos], opens with
            | ('"' | '\'' | '`' as quote), _ :: _ -> loop opens (skipQuoted text text.Length true quote (pos + 1))
            | '{', _ -> loop (pos :: opens) (pos + 1)
            | '}', start :: rest ->
                ends[start] <- pos + 1
                loop rest (pos + 1)
            | _ -> loop opens (pos + 1)
    loop [] 0
    ends

/// The longest `{...}` group followed by a local scan, used only for a `{`
/// the one-pass table did not reach (inside an unclosed script string).
let private braceGroupLimit = 16384

/// The index just past a balanced `{...}` group that opens at `start`, skipping
/// script strings inside it, or the bound.
let private scanBraces (text: string) (limit: int) (start: int) =
    let bound = min limit (start + braceGroupLimit)
    let rec loop depth pos =
        if pos >= bound then bound
        else
            match text[pos] with
            | '"' | '\'' | '`' as quote -> loop depth (skipQuoted text bound true quote (pos + 1))
            | '{' -> loop (depth + 1) (pos + 1)
            | '}' -> if depth = 1 then pos + 1 else loop (depth - 1) (pos + 1)
            | _ -> loop depth (pos + 1)
    loop 0 start

let private skipBraces (ends: Collections.Generic.Dictionary<int, int>) (text: string) (limit: int) (start: int) =
    match ends.TryGetValue start with
    | true, finish -> finish
    | _ -> scanBraces text limit start

/// The span of an attribute value that starts at `pos`, and the index after it.
let private attributeValue (ends: Collections.Generic.Dictionary<int, int>) (text: string) (limit: int) (pos: int) =
    if pos >= limit then (pos, pos), pos
    else
        match text[pos] with
        | '{' -> let finish = skipBraces ends text limit pos in (pos, finish), finish
        | '"' | '\'' as quote ->
            // Razor: "@Url.Action("ef-index")" holds C# strings inside parentheses.
            let rec loop parens i =
                if i >= limit then limit
                else
                    match text[i] with
                    | '(' -> loop (parens + 1) (i + 1)
                    | ')' -> loop (max 0 (parens - 1)) (i + 1)
                    | c when c = quote && parens = 0 -> i + 1
                    | '"' | '\'' as inner when parens > 0 -> loop parens (skipQuoted text limit true inner (i + 1))
                    | _ -> loop parens (i + 1)
            let finish =
                if pos + 1 < limit && text[pos + 1] = '@' then loop 0 (pos + 1)
                else skipQuoted text limit false quote (pos + 1)
            (pos, finish), finish
        | _ ->
            let rec loop i = if i < limit && not (Char.IsWhiteSpace text[i]) && text[i] <> '>' then loop (i + 1) else i
            let finish = loop pos
            (pos, finish), finish

/// URL-valued attribute values inside the tag that opens at `start`. The scan
/// ends at the tag's `>`, at a bare `<` (`title=a<b`), at the end of the text
/// or at the safety bound; values found before the end are kept. Script that
/// only looks like a tag start (`if (a <b && c) { x.src = s; }`) is harmless:
/// `{...}` is skipped, the attribute must follow whitespace (so `x.src` never
/// matches) and the scan stops at the next `<`. Braces are looked up, so each
/// scan reads only the tag's own top-level text and the total stays linear.
let private tagLocations (ends: Collections.Generic.Dictionary<int, int>) (text: string) (start: int) =
    let limit = min text.Length (start + tagScanLimit)
    let rec loop pos acc =
        if pos >= limit then acc
        else
            match text[pos] with
            | '>' | '<' -> acc
            | '"' | '\'' as quote -> loop (skipQuoted text limit false quote (pos + 1)) acc
            | '{' -> loop (skipBraces ends text limit pos) acc
            | c when Char.IsWhiteSpace c ->
                let m = urlAttribute.Match(text, pos + 1)
                if m.Success && m.Index + m.Length <= limit then
                    let span, after = attributeValue ends text limit (m.Index + m.Length)
                    loop after (span :: acc)
                else loop (pos + 1) acc
            | _ -> loop (pos + 1) acc
    loop start []

/// The (start, end) spans of URL-valued attribute values inside markup tags.
let markupLocations (text: string) =
    let starts = tagStart.Matches text
    if starts.Count = 0 then []
    else
        let ends = braceEnds text
        [ for m in starts do yield! tagLocations ends text (m.Index + m.Length) ]
