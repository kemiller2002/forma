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
/// `href`, `srcset`, `action`, `poster`, ...) inside a markup tag (see Markup.fs: scanned so a
/// `>` in a JSX or Razor expression does not end it), Markdown link targets
/// and reference definitions (Markdown only), dotfile names, module
/// specifiers (`import … from "…"`, `import("…")`, `require("…")`), scoped
/// package names (`@scope/name`), file names (`ef-page.html`) and host names
/// (`ef-cdn.example.org`).
module Forma.NamespaceMigrator.Migration

open System
open System.Text.RegularExpressions
open Forma.NamespaceMigrator.Lexer
open Forma.NamespaceMigrator.Markup

let private options = RegexOptions.CultureInvariant ||| RegexOptions.Compiled ||| RegexOptions.Multiline

let private regex pattern = Regex(pattern, options)

/// `/` ends a path segment (`assets/ef-x`, `"/ef-x"`) unless it opens a closing
/// tag (`</ef-x>`) or a regular-expression literal (`.match(/--ef-x/)`, `= /ef-/`).
let private boundary =
    @"(?:(?<![A-Za-z0-9_$\-/@])|(?<=</)|(?<=\\b)|(?<=(?:^|[\s(,=:\[!&|?{};])/))"

/// What kind of text is rewritten: Markdown link targets are locations only in
/// Markdown; in script (JS and TS with or without JSX, F#) a `<name` starts a
/// tag only where a tag can stand (see Markup.mayStartTag).
type Kind =
    | Markdown
    | Other
    | JsxScript
    | PlainScript

/// The kind of a file, by extension.
let kindOf (path: string) =
    match IO.Path.GetExtension(path).ToLowerInvariant() with
    | ".md"
    | ".markdown" -> Markdown
    | ".js" | ".mjs" | ".cjs" | ".jsx" | ".tsx" -> JsxScript
    | ".ts" | ".mts" | ".cts" | ".fs" | ".fsi" | ".fsx" -> PlainScript
    | _ -> Other

let private syntaxOf (kind: Kind) =
    match kind with
    | JsxScript -> Script true
    | PlainScript -> Script false
    | Markdown
    | Other -> MarkupText

/// File extensions that make a name a file name.
let private fileExtensions =
    @"(?:html?|css|s[ac]ss|less|[cm]?js|jsx|[cm]?ts|tsx|json|md|svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|eot|map|txt|xml|pdf|zip|razor|cshtml|vue|svelte|ya?ml|toml)"

/// A file or host name continues the token: `ef-page.html`, `ef-cdn.example.org`.
/// A host name is read up to 8 labels, so the look-ahead is bounded.
let private notLocation =
    @"(?![A-Za-z0-9_\-]*\." + fileExtensions + @"(?![A-Za-z0-9_\-]))"
    + @"(?![A-Za-z0-9_\-]*\.(?:[a-z0-9\-]+\.){0,8}(?:com|org|net|io|dev|app|co|edu|gov|cloud|example|test|local|localhost)(?![A-Za-z0-9_\-]))"

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
        // The look-behind reads at most 8 classes back, so a long `.ef-a.ef-a…`
        // chain costs linear time; a longer compound falls to the `name` rule.
        + @"|(?<classname>(?<=(?<![A-Za-z0-9_$\-/])(?:\.[A-Za-z_][A-Za-z0-9_\-]*){0,8}\.)ef-)"
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

// --- Ambiguous strings --------------------------------------------------------
//
// A whole quoted string such as ".ef-icon.svg", "div.ef-card.md" or
// ".ef-config.json" is either a selector or a file name. Outside a selector
// API it is left unrewritten and reported for review; as the argument of
// querySelector, querySelectorAll, closest, matches or webkitMatchesSelector
// it is a selector and is migrated.

/// A whole quoted run of name characters and dots. The run is atomic and its
/// structure is checked in code (`ambiguousValue`), so an unclosed quote
/// before a long `.ef-a.ef-a…` chain costs linear time, not backtracking.
let private quotedDottedRun =
    regex @"(?<![A-Za-z0-9_$])(?<q>[""'`])(?<value>(?>[A-Za-z0-9_\-.]+))(?=\k<q>)"

let private fileExtension = Regex(@"\A" + fileExtensions + @"\z", RegexOptions.CultureInvariant)
let private prefixWord = Regex(@"\A[A-Za-z][A-Za-z0-9_\-]*\z", RegexOptions.CultureInvariant)
let private classWord = Regex(@"\A[A-Za-z_][A-Za-z0-9_\-]*\z", RegexOptions.CultureInvariant)

/// Whether a dotted run reads both as a selector and as a file name: an
/// optional element-or-word prefix, class names, a `.ef-` class that is not
/// last, and a file extension last (`.ef-icon.svg`, `div.ef-card.md`).
/// Returns the prefix ("" when none).
let private ambiguousValue (value: string) =
    let parts = value.Split('.')
    let n = parts.Length
    if n < 3 || not (parts[0] = "" || prefixWord.IsMatch parts[0]) then None
    elif parts |> Array.skip 1 |> Array.exists (fun part -> part = "") then None
    elif not (fileExtension.IsMatch parts[n - 1]) then None
    else
        // The first `ef-` part before the extension, with class names before it.
        let rec find i =
            if i > n - 2 then None
            elif parts[i].StartsWith "ef-" then Some parts[0]
            elif classWord.IsMatch parts[i] then find (i + 1)
            else None
        find 1

let private selectorApi = regex @"\b(?:querySelector(?:All)?|closest|matches|webkitMatchesSelector)\s*\(\s*$"

/// A selector API argument: unambiguously a selector, so every Forma class in
/// it is migrated, whatever suffix follows (`"div.ef-card.md"`).
let private selectorArgument =
    regex @"\b(?:querySelector(?:All)?|closest|matches|webkitMatchesSelector)\s*\(\s*(?<q>[""'`])(?<value>(?:\\.|(?!\k<q>)[^\n\\])*)\k<q>"
let private selectorToken = regex @"(?<customproperty>(?<![A-Za-z0-9_$\-])--ef-)|(?<attribute>(?<![A-Za-z0-9_$\-])data-ef-)|(?<name>(?<![A-Za-z0-9_$\-])ef-)"

/// URL-valued attribute selectors keep their value: `img[src=ef-a.png]`, in
/// any letter case (`a[HREF="ef-x"]`), in a selector argument or anywhere else
/// (`const sel = 'a[href="ef-x"]'`, CSS `a[href^="ef-"]`). A value is read up
/// to 512 characters, so a long line of unclosed `[href=` costs linear time.
let private selectorLocation =
    Regex(@"\[\s*(?:src|href|srcset|action|formaction|poster|data|cite|background|xlink:href|manifest|ping)\s*[~|^$*]?=\s*(?<value>[^\]\n]{0,512})\]", RegexOptions.CultureInvariant ||| RegexOptions.IgnoreCase)

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
          "track"; "base"; "meta"; "datalist"; "hgroup"; "rp"; "rt" ]

/// SVG element names: "path.ef-icon.svg" may be a selector for an SVG element.
let private svgElements =
    set
        [ "svg"; "g"; "path"; "use"; "symbol"; "circle"; "rect"; "line"; "polyline"; "polygon"; "ellipse"; "text"; "tspan"
          "defs"; "clippath"; "mask"; "pattern"; "image"; "marker"; "lineargradient"; "radialgradient"; "stop"; "filter"
          "foreignobject"; "textpath"; "desc"; "title"; "view"; "switch"; "animate"; "animatemotion"; "animatetransform"
          "set"; "mpath"; "metadata"; "feblend"; "fecolormatrix"; "fecomponenttransfer"; "fecomposite"
          "feconvolvematrix"; "fediffuselighting"; "fedisplacementmap"; "fedistantlight"; "fedropshadow"; "feflood"
          "fefunca"; "fefuncb"; "fefuncg"; "fefuncr"; "fegaussianblur"; "feimage"; "femerge"; "femergenode"
          "femorphology"; "feoffset"; "fepointlight"; "fespecularlighting"; "fespotlight"; "fetile"; "feturbulence" ]

/// A prefix that may name an element: HTML or SVG, a custom element (it has a
/// `-`, such as `my-widget`) or a Forma element (`ef-tabs`).
let private mayBeElement (prefix: string) =
    let name = prefix.ToLowerInvariant()
    htmlElements.Contains name || svgElements.Contains name || name.Contains '-' || name.StartsWith "ef-"

/// Whole quoted strings that read as a selector or as a file name, outside a
/// selector API: (index, length, value, ambiguous). A string whose prefix is
/// not an HTML element name is a file name: masked, not reported.
let private ambiguousStrings (text: string) =
    [ for m in quotedDottedRun.Matches text do
          let value = m.Groups["value"].Value
          match ambiguousValue value with
          | Some prefix ->
              let before = text.Substring(max 0 (m.Index - 64), min 64 m.Index)
              if not (selectorApi.IsMatch before) then
                  let isFileName = prefix <> "" && not (mayBeElement prefix)
                  yield m.Index, value.Length + 2, value, not isFileName
          | None -> () ]

/// The markup scan of the last text, reused: a file's rewrite, report and
/// review list all scan the same text.
let mutable private lastScan : (Kind * string * MarkupScan) option = None

let private scanMarkup (kind: Kind) (text: string) =
    match lastScan with
    | Some(k, t, result) when k = kind && Object.ReferenceEquals(t, text) -> result
    | _ ->
        let tokenStarts = lazy [| for m in token.Matches text -> m.Index |]
        let result = markupScan (syntaxOf kind) tokenStarts text
        lastScan <- Some(kind, text, result)
        result

let private maskedSpans (kind: Kind) (text: string) =
    let links =
        match kind with
        | Markdown ->
            [ for pattern in [ markdownLink; markdownReference ] do
                  for m in pattern.Matches text -> m.Groups["target"].Index, m.Groups["target"].Index + m.Groups["target"].Length ]
        | Other | JsxScript | PlainScript -> []
    links
    @ (scanMarkup kind text).Spans
    @ [ for m in selectorLocation.Matches text -> m.Groups["value"].Index, m.Groups["value"].Index + m.Groups["value"].Length ]
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

/// What to review about tags (1-based lines). `Uncertain`: a tag whose
/// `{...}` expression is never closed, is resolved without the lexer's
/// certainty, or that is over 1 MiB. `Possible`: a `<name` in script code that
/// may be a tag, with a URL attribute after it left unrewritten. `Suppressed`:
/// a value after an uncertain tag that holds a Forma name and was left
/// unrewritten, each at its own line.
type TagReview =
    { Uncertain: int list
      Possible: int list
      /// (line of the value, line of the uncertain tag before it)
      Suppressed: (int * int) list }

let tagReview (kind: Kind) (text: string) =
    let lineOf = lineIndex (lines text)
    let scan = scanMarkup kind text
    { Uncertain = scan.Uncertain |> List.map (fun index -> lineOf index + 1)
      Possible = scan.PossibleTags |> List.map (fun index -> lineOf index + 1)
      Suppressed =
        scan.Suppressed
        |> List.distinctBy (fun (start, _, _) -> start)
        |> List.filter (fun (start, finish, _) -> token.IsMatch(text.Substring(start, finish - start)))
        |> List.map (fun (start, _, tag) -> lineOf start + 1, lineOf tag + 1)
        // A value on its tag's own line is covered by that tag's line.
        |> List.filter (fun (line, tag) -> line <> tag) }

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
