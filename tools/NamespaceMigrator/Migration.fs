/// FORMA-NS-001: the pure rewrite from Forma's pre-1.0 `ef-` namespace to the
/// 1.0 `forma-` namespace. No I/O lives here.
///
/// Only namespace tokens are rewritten, in the contexts where Forma names
/// live: selectors, class strings, element names, attributes, custom
/// properties and the DOM dataset.
///
///   --ef-*            custom property          -> --forma-*
///   data-ef-*         attribute                -> data-forma-*
///   ef-*              class, tag, id, string   -> forma-*   (.ef-x, <ef-x>, </ef-x>, "ef-component-tag")
///   dataset.efX       DOM dataset property     -> dataset.formaX
///   dataset["efX"]    DOM dataset index        -> dataset["formaX"]
///   { efX } = …dataset  dataset destructuring  -> { formaX: efX } (the local name is kept)
///
/// A token starts at a boundary: the preceding character is not part of an
/// identifier (a letter, digit, `_`, `$` or `-`), not `/` (except in `</` or
/// at the start of a regular-expression literal) and not `@`; or it follows a
/// regular-expression `\b`. So `ref-`, `chef-`,
/// `beef-`, `--ref-`, `x-ef-`, `@ef-labs` and `/ef-icons` are left alone.
///
/// Locations are never rewritten: absolute and protocol-relative URLs,
/// CSS `url(...)` and `@import` targets, URL-valued attributes (`src`,
/// `href`, `srcset`, `action`, `poster`, ...) inside a markup tag (scanned so a
/// `>` in a JSX or Razor expression does not end it), Markdown link targets
/// and reference definitions (Markdown only), dotfile names, module
/// specifiers (`import … from "…"`, `import("…")`, `require("…")`), scoped
/// package names (`@scope/name`), file names (`ef-page.html`) and host names
/// (`ef-cdn.example.org`).
module Forma.NamespaceMigrator.Migration

open System
open System.Text.RegularExpressions

let private options = RegexOptions.CultureInvariant ||| RegexOptions.Compiled ||| RegexOptions.Multiline

let private regex pattern = Regex(pattern, options)

/// `/` ends a path segment (`assets/ef-x`, `"/ef-x"`) unless it opens a closing
/// tag (`</ef-x>`) or a regular-expression literal (`.match(/--ef-x/)`, `= /ef-/`).
let private boundary =
    @"(?:(?<![A-Za-z0-9_$\-/@])|(?<=</)|(?<=\\b)|(?<=(?:^|[\s(,=:\[!&|?{};])/))"

/// What kind of text is rewritten: Markdown link targets are locations only in
/// Markdown.
type Kind =
    | Markdown
    | Other

/// The kind of a file, by extension.
let kindOf (path: string) =
    match IO.Path.GetExtension(path).ToLowerInvariant() with
    | ".md"
    | ".markdown" -> Markdown
    | _ -> Other

/// File extensions that make a name a file name.
let private fileExtensions =
    @"(?:html?|css|s[ac]ss|less|[cm]?js|jsx|[cm]?ts|tsx|json|md|svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|eot|map|txt|xml|pdf|zip|razor|cshtml|vue|svelte|ya?ml|toml)"

/// A file or host name continues the token: `ef-page.html`, `ef-cdn.example.org`.
let private notLocation =
    @"(?![A-Za-z0-9_\-]*\." + fileExtensions + @"(?![A-Za-z0-9_\-]))"
    + @"(?![A-Za-z0-9_\-]*\.(?:[a-z0-9\-]+\.)*(?:com|org|net|io|dev|app|co|edu|gov|cloud|example|test|local|localhost)(?![A-Za-z0-9_\-]))"

/// The rule names, reported by --dry-run.
let ruleNames = [ "custom-property"; "attribute"; "dataset"; "dataset-index"; "name" ]

/// One alternation, so a text is rewritten in a single pass and a masked
/// location is skipped as a whole.
let private token =
    regex (
        $"(?<customproperty>{boundary}--ef-)"
        + $"|(?<attribute>{boundary}data-ef-{notLocation})"
        + @"|(?<dataset>(?<=\bdataset\??\.)ef(?=[A-Z]))"
        + @"|(?<datasetindex>(?<=\bdataset\??\.?\[\s*[""'`])ef(?=[A-Z]))"
        // `.ef-x` is a class selector even when a host- or file-like suffix
        // follows (`.ef-shell.app`, `.ef-icon.svg`): a location never has a
        // `.` right before the name, unless that `.` follows a host label
        // (`www.ef-cdn.example.org`); a compound selector (`.a.ef-x`) still counts.
        // Not a dotfile path after `/` (`"/.ef-rc.json"`). A whole quoted string
        // that could be either a selector or a file name (`".ef-icon.svg"`) is
        // ambiguous: it is masked and reported for review (see `ambiguous`).
        + @"|(?<classname>(?<=(?<![A-Za-z0-9_$\-/])(?:\.[A-Za-z_][A-Za-z0-9_\-]*)*\.)ef-)"
        // `/.ef-` inside a path is a dot-directory or dotfile (`assets/.ef-cache/x`).
        + $"|(?<name>(?<!/\.){boundary}ef-{notLocation})"
    )

let private replacementFor (m: Match) =
    if m.Groups["customproperty"].Success then "custom-property", "--forma-"
    elif m.Groups["attribute"].Success then "attribute", "data-forma-"
    elif m.Groups["dataset"].Success then "dataset", "forma"
    elif m.Groups["datasetindex"].Success then "dataset-index", "forma"
    elif m.Groups["classname"].Success then "name", "forma-"
    else "name", "forma-"

/// Spans that are locations, never names.
let private locations =
    [ @"\b[A-Za-z][A-Za-z0-9+.\-]*://[^\s""'`<>()\]]*"
      @"(?<![:\w])//[A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)+[^\s""'`<>()]*"
      @"\burl\(\s*(?:""[^""]*""|'[^']*'|[^)]*)\)"
      @"@import\s+(?:url\()?\s*(?:""[^""]*""|'[^']*')"
      @"\bfrom\s+(?:""[^""]*""|'[^']*')"
      @"\bimport\s*(?:\(\s*)?(?:""[^""]*""|'[^']*')"
      @"\brequire\s*\(\s*(?:""[^""]*""|'[^']*')"
      @"@[a-z0-9][a-z0-9._\-]*/[a-z0-9][a-z0-9._\-/]*" ]
    |> List.map regex

/// A Markdown link target, `[text](target)`, or a reference definition,
/// `[label]: target`: only in Markdown, and never a quoted call argument such
/// as `handlers[0]("ef-x")`.
let private markdownLink = regex @"\[[^\]\n]*\]\((?<target>[^)\s""'`]+)\)"
let private markdownReference = regex @"^[ ]{0,3}\[[^\]\n]+\]:[ \t]*(?<target>\S+)"

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

let private markupLocations (text: string) =
    let starts = tagStart.Matches text
    if starts.Count = 0 then []
    else
        let ends = braceEnds text
        [ for m in starts do yield! tagLocations ends text (m.Index + m.Length) ]

// --- Ambiguous strings --------------------------------------------------------
//
// A whole quoted string such as ".ef-icon.svg", "div.ef-card.md" or
// ".ef-config.json" is either a selector or a file name. Outside a selector
// API it is left unrewritten and reported for review; as the argument of
// querySelector, querySelectorAll, closest, matches or webkitMatchesSelector
// it is a selector and is migrated.

let private ambiguousString =
    regex (
        @"(?<![A-Za-z0-9_$])(?<q>[""'`])(?<value>(?<prefix>[A-Za-z][A-Za-z0-9_\-]*)?(?:\.[A-Za-z_][A-Za-z0-9_\-]*)*?\.ef-[A-Za-z0-9_\-]*(?:\.[A-Za-z0-9_\-]+)*?\."
        + fileExtensions
        + @")\k<q>"
    )

let private selectorApi = regex @"\b(?:querySelector(?:All)?|closest|matches|webkitMatchesSelector)\s*\(\s*$"

/// A selector API argument: unambiguously a selector, so every Forma class in
/// it is migrated, whatever suffix follows (`"div.ef-card.md"`).
let private selectorArgument =
    regex @"\b(?:querySelector(?:All)?|closest|matches|webkitMatchesSelector)\s*\(\s*(?<q>[""'`])(?<value>(?:(?!\k<q>)[^\n])*)\k<q>"
let private selectorToken = regex @"(?<customproperty>(?<![A-Za-z0-9_$\-])--ef-)|(?<attribute>(?<![A-Za-z0-9_$\-])data-ef-)|(?<name>(?<![A-Za-z0-9_$\-])ef-)"

/// URL-valued attribute selectors keep their value: `img[src=ef-a.png]`.
let private selectorLocation =
    regex @"\[\s*(?:src|href|srcset|action|formaction|poster|data|cite|background|xlink:href|manifest|ping)\s*[~|^$*]?=\s*(?<value>[^\]]*)\]"

let private selectorProtected (value: string) =
    [ for m in selectorLocation.Matches value -> m.Groups["value"].Index, m.Groups["value"].Index + m.Groups["value"].Length ]

let private rewriteSelectorArguments (text: string) =
    selectorArgument.Replace(
        text,
        MatchEvaluator(fun m ->
            let value = m.Groups["value"]
            let protectedSpans = selectorProtected value.Value
            let rewritten =
                selectorToken.Replace(
                    value.Value,
                    MatchEvaluator(fun t ->
                        if protectedSpans |> List.exists (fun (a, b) -> t.Index >= a && t.Index < b) then t.Value
                        elif t.Groups["customproperty"].Success then "--forma-"
                        elif t.Groups["attribute"].Success then "data-forma-"
                        else "forma-"))
            m.Value.Substring(0, value.Index - m.Index) + rewritten + m.Value.Substring(value.Index - m.Index + value.Length))
    )

/// Selector-argument tokens, for reports: (index, rule).
let private selectorTokens (text: string) =
    [ for m in selectorArgument.Matches text do
          let value = m.Groups["value"]
          let protectedSpans = selectorProtected value.Value
          for t in selectorToken.Matches value.Value do
              if not (protectedSpans |> List.exists (fun (a, b) -> t.Index >= a && t.Index < b)) then
                  yield value.Index + t.Index, "selector" ]

/// HTML element names: a string such as "div.ef-card.md" may be a selector
/// (element and class), but "logo.ef-x.png" can only be a file name.
let private htmlElements =
    set
        [ "a"; "abbr"; "address"; "article"; "aside"; "audio"; "b"; "blockquote"; "body"; "button"; "canvas"; "caption"
          "code"; "col"; "dd"; "details"; "dialog"; "div"; "dl"; "dt"; "em"; "fieldset"; "figcaption"; "figure"; "footer"
          "form"; "h1"; "h2"; "h3"; "h4"; "h5"; "h6"; "header"; "hr"; "html"; "i"; "iframe"; "img"; "input"; "label"
          "legend"; "li"; "main"; "mark"; "menu"; "meter"; "nav"; "object"; "ol"; "optgroup"; "option"; "output"; "p"
          "picture"; "pre"; "progress"; "q"; "s"; "section"; "select"; "small"; "source"; "span"; "strong"; "sub"
          "summary"; "sup"; "svg"; "table"; "tbody"; "td"; "template"; "textarea"; "tfoot"; "th"; "thead"; "time"; "tr"
          "u"; "ul"; "video"; "link"; "script"; "style"; "slot"; "area"; "br"; "head"; "title"; "kbd"; "var"; "del"
          "ins"; "colgroup"; "map"; "noscript"; "ruby"; "samp"; "search"; "wbr"; "cite"; "data"; "dfn"; "bdi"; "bdo"; "embed"
          "track"; "base"; "meta" ]

/// SVG element names: "path.ef-icon.svg" may be a selector for an SVG element.
let private svgElements =
    set
        [ "svg"; "g"; "path"; "use"; "symbol"; "circle"; "rect"; "line"; "polyline"; "polygon"; "ellipse"; "text"; "tspan"
          "defs"; "clippath"; "mask"; "pattern"; "image"; "marker"; "lineargradient"; "radialgradient"; "stop"; "filter"
          "foreignobject"; "textpath"; "desc"; "title"; "view"; "switch" ]

/// A prefix that may name an element: HTML or SVG, a custom element (it has a
/// `-`, such as `my-widget`) or a Forma element (`ef-tabs`).
let private mayBeElement (prefix: string) =
    let name = prefix.ToLowerInvariant()
    htmlElements.Contains name || svgElements.Contains name || name.Contains '-' || name.StartsWith "ef-"

/// Whole quoted strings that read as a selector or as a file name, outside a
/// selector API: (index, length, value, ambiguous). A string whose prefix is
/// not an HTML element name is a file name: masked, not reported.
let private ambiguousStrings (text: string) =
    [ for m in ambiguousString.Matches text do
          let before = text.Substring(max 0 (m.Index - 64), min 64 m.Index)
          if not (selectorApi.IsMatch before) then
              let prefix = m.Groups["prefix"]
              let isFileName = prefix.Success && not (mayBeElement prefix.Value)
              yield m.Index, m.Length, m.Groups["value"].Value, not isFileName ]

let private maskedSpans (kind: Kind) (text: string) =
    let links =
        match kind with
        | Markdown ->
            [ for pattern in [ markdownLink; markdownReference ] do
                  for m in pattern.Matches text -> m.Groups["target"].Index, m.Groups["target"].Index + m.Groups["target"].Length ]
        | Other -> []
    links
    @ markupLocations text
    @ [ for index, length, _, _ in ambiguousStrings text -> index, index + length ]
    // Selector API arguments are rewritten separately (rewriteSelectorArguments).
    @ [ for m in selectorArgument.Matches text -> m.Groups["value"].Index, m.Groups["value"].Index + m.Groups["value"].Length ]
    @ (locations
       |> List.collect (fun pattern -> [ for m in pattern.Matches text -> m.Index, m.Index + m.Length ]))

/// Masked spans, sorted and merged, so a lookup is a binary search.
type private Mask = { Starts: int[]; Ends: int[] }

let private toMask (spans: (int * int) list) =
    let merged =
        spans
        |> List.filter (fun (start, finish) -> finish > start)
        |> List.sortBy fst
        |> List.fold
            (fun acc (start, finish) ->
                match acc with
                | (s0, f0) :: rest when start <= f0 -> (s0, max f0 finish) :: rest
                | _ -> (start, finish) :: acc)
            []
        |> List.rev
        |> Array.ofList
    { Starts = merged |> Array.map fst; Ends = merged |> Array.map snd }

let private inside (mask: Mask) (index: int) =
    // The last span that starts at or before `index`.
    let rec search lo hi =
        if lo > hi then hi
        else
            let mid = (lo + hi) / 2
            if mask.Starts[mid] <= index then search (mid + 1) hi else search lo (mid - 1)
    let i = search 0 (mask.Starts.Length - 1)
    i >= 0 && index < mask.Ends[i]

/// `const { efTone, efState: state } = el.dataset` -> `{ formaTone: efTone, formaState: state }`.
/// An optional type annotation (`: DOMStringMap`) may sit between the pattern and `=`.
let private destructuring =
    regex @"\{(?<body>[^{}]*)\}(?=\s*(?::\s*[A-Za-z0-9_$.<>\[\]|&, ]+?)?\s*=\s*[A-Za-z0-9_$.?!\[\]""'`()]*\bdataset\b)"
/// A key is the first name of an entry (after `{` or `,`); `formaX: efX`
/// keeps its local name `efX` on a second run, which stays idempotent.
let private destructuredKey = regex @"(?<=(?:\A|,)\s*)ef(?<rest>[A-Z][A-Za-z0-9_$]*)(?<alias>\s*:)?"

let private rewriteDestructuring (text: string) =
    destructuring.Replace(
        text,
        MatchEvaluator(fun m ->
            let body =
                destructuredKey.Replace(
                    m.Groups["body"].Value,
                    MatchEvaluator(fun key ->
                        let rest = key.Groups["rest"].Value
                        let renamed = "forma" + rest
                        if key.Groups["alias"].Success then renamed + key.Groups["alias"].Value
                        else renamed + ": ef" + rest))
            "{" + body + "}")
    )

/// Matches of namespace tokens outside locations, with their rule name.
let private tokens (kind: Kind) (text: string) =
    let spans = toMask (maskedSpans kind text)
    [ for m in token.Matches text do
          if not (inside spans m.Index) then
              yield m, fst (replacementFor m) ]

/// The text with every namespace token rewritten. Idempotent: `forma-` never
/// matches a rule.
let migrateAs (kind: Kind) (original: string) =
    let text = rewriteSelectorArguments original
    let spans = toMask (maskedSpans kind text)
    let rewritten =
        token.Replace(
            text,
            MatchEvaluator(fun m -> if inside spans m.Index then m.Value else snd (replacementFor m))
        )
    rewriteDestructuring rewritten

/// `migrateAs` for text that is not Markdown.
let migrate (text: string) = migrateAs Other text

/// Occurrences per rule in a text, before rewriting.
let count (kind: Kind) (text: string) =
    tokens kind text |> List.countBy snd

let private lines (text: string) = text.Split('\n')

/// One rewritten line: 1-based line, the rules that matched, before and after.
type Change =
    { Line: int
      Rule: string
      Before: string
      After: string }

/// A 0-based line lookup for character offsets: line starts once, then a
/// binary search per offset, so reporting stays n log n.
let private lineIndex (lineTexts: string[]) =
    let starts = Array.zeroCreate (max 1 lineTexts.Length)
    for i in 1 .. lineTexts.Length - 1 do
        starts[i] <- starts[i - 1] + lineTexts[i - 1].Length + 1
    fun (index: int) ->
        let rec search lo hi =
            if lo > hi then hi
            else
                let mid = (lo + hi) / 2
                if starts[mid] <= index then search (mid + 1) hi else search lo (mid - 1)
        max 0 (search 0 (starts.Length - 1))

/// Line-level changes, for --dry-run and --check reports. They come from the
/// same whole-file rewrite as write mode (a tag or a JSX expression can span
/// lines), so a report never shows a change that writing would not make.
/// Rewrites never add or remove a newline, so lines correspond one to one.
let changes (kind: Kind) (text: string) =
    let before = lines text
    let after = lines (migrateAs kind text)
    let lineOf = lineIndex before
    let rulesByLine =
        (tokens kind text |> List.map (fun (m, rule) -> m.Index, rule)) @ selectorTokens text
        |> List.map (fun (index, rule) -> lineOf index, rule)
        |> List.groupBy fst
        |> List.map (fun (line, rules) -> line, rules |> List.map snd |> List.distinct)
        |> dict
    [ for index in 0 .. before.Length - 1 do
          if before[index] <> after[index] then
              let named = match rulesByLine.TryGetValue index with | true, rules -> rules | _ -> []
              yield
                  { Line = index + 1
                    Rule = if named.IsEmpty then "dataset-destructuring" else String.concat "," named
                    Before = before[index].TrimEnd('\r')
                    After = after[index].TrimEnd('\r') } ]

/// Whole quoted strings that may be a selector or a file name and are left
/// unrewritten (reported for review): 1-based line and the string.
let ambiguous (text: string) =
    let lineOf = lineIndex (lines text)
    ambiguousStrings text
    |> List.filter (fun (_, _, _, isAmbiguous) -> isAmbiguous)
    |> List.map (fun (index, _, value, _) -> lineOf index + 1, value)

/// Whether a text still holds a namespace token (for files of a kind the
/// migrator does not rewrite: they are reported, never silently passed).
let hasTokens (text: string) = migrateAs Markdown text <> text || migrate text <> text

/// The file kinds the migrator rewrites.
let supportedExtensions =
    set
        [ ".html"; ".htm"; ".css"; ".scss"; ".sass"; ".less"
          ".js"; ".mjs"; ".cjs"; ".jsx"; ".ts"; ".mts"; ".cts"; ".tsx"
          ".vue"; ".svelte"; ".razor"; ".cshtml"
          ".fs"; ".fsi"; ".fsx"; ".json"; ".md"; ".markdown" ]

let isSupported (path: string) =
    supportedExtensions.Contains(IO.Path.GetExtension(path).ToLowerInvariant())

/// Directories never descended into.
let alwaysSkipped = set [ ".git"; "node_modules"; "bin"; "obj" ]

/// Conventional vendored or generated directories, skipped unless
/// --include-vendored is given: third-party copies and build output are not
/// the application's source.
let vendoredDirectories = set [ "vendor"; "bower_components"; "jspm_packages"; "dist"; "lib" ]

/// `lib` is vendored only as `wwwroot/lib` (the ASP.NET client-library folder).
let isVendored (parent: string) (name: string) =
    vendoredDirectories.Contains name
    && (name <> "lib" || String.Equals(IO.Path.GetFileName(parent.TrimEnd('/', '\\')), "wwwroot", StringComparison.OrdinalIgnoreCase))
