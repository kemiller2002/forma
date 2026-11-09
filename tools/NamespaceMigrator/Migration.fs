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
    @"(?:html?|css|s[ac]ss|less|[cm]?js|jsx|[cm]?ts|tsx|json|md|svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|eot|map|txt|xml|pdf|zip|razor|cshtml|vue|svelte|ya?ml|toml|rc|ini|lock)"

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
        // Not a dotfile path: after `/` (`"/.ef-rc.json"`), or a whole quoted
        // string that ends in a file extension (`".ef-config.json"`).
        + @"|(?<classname>(?<=(?<![A-Za-z0-9_$\-/])(?:\.[A-Za-z_][A-Za-z0-9_\-]*)*\.)(?!(?<=[""'`]\.)ef-[A-Za-z0-9_\-]*(?:\.[A-Za-z0-9_\-]+)*\." + fileExtensions + @"[""'`])ef-)"
        + $"|(?<name>{boundary}ef-{notLocation})"
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

/// The index just past a quoted string that starts at `start` (the quote).
let rec private skipQuoted (text: string) (quote: char) (pos: int) =
    if pos >= text.Length then text.Length
    elif text[pos] = '\\' then skipQuoted text quote (pos + 2)
    elif text[pos] = quote then pos + 1
    else skipQuoted text quote (pos + 1)

/// The index just past a balanced group that opens at `start`, skipping
/// quoted strings inside it.
let private skipBalanced (text: string) (opening: char) (closing: char) (start: int) =
    let rec loop depth pos =
        if pos >= text.Length then text.Length
        else
            match text[pos] with
            | '"' | '\'' | '`' as quote -> loop depth (skipQuoted text quote (pos + 1))
            | c when c = opening -> loop (depth + 1) (pos + 1)
            | c when c = closing -> if depth = 1 then pos + 1 else loop (depth - 1) (pos + 1)
            | _ -> loop depth (pos + 1)
    loop 0 start

/// The span of an attribute value that starts at `pos`, and the index after it.
let private attributeValue (text: string) (pos: int) =
    if pos >= text.Length then (pos, pos), pos
    else
        match text[pos] with
        | '{' -> let finish = skipBalanced text '{' '}' pos in (pos, finish), finish
        | '"' | '\'' as quote ->
            // Razor: "@Url.Action("ef-index")" holds quotes inside parentheses.
            let rec loop parens i =
                if i >= text.Length then text.Length
                else
                    match text[i] with
                    | '(' -> loop (parens + 1) (i + 1)
                    | ')' -> loop (max 0 (parens - 1)) (i + 1)
                    | c when c = quote && parens = 0 -> i + 1
                    | '"' | '\'' as inner when parens > 0 -> loop parens (skipQuoted text inner (i + 1))
                    | _ -> loop parens (i + 1)
            let finish = if pos + 1 < text.Length && text[pos + 1] = '@' then loop 0 (pos + 1) else skipQuoted text quote (pos + 1)
            (pos, finish), finish
        | _ ->
            let rec loop i = if i < text.Length && not (Char.IsWhiteSpace text[i]) && text[i] <> '>' then loop (i + 1) else i
            let finish = loop pos
            (pos, finish), finish

/// URL-valued attribute values inside the tag that opens at `start`.
let private tagLocations (text: string) (start: int) =
    let rec loop pos acc =
        if pos >= text.Length then acc
        else
            match text[pos] with
            | '>' -> acc
            | '"' | '\'' as quote -> loop (skipQuoted text quote (pos + 1)) acc
            | '{' -> loop (skipBalanced text '{' '}' pos) acc
            | c when Char.IsWhiteSpace c ->
                let m = urlAttribute.Match(text, pos + 1)
                if m.Success then
                    let span, after = attributeValue text (m.Index + m.Length)
                    loop after (span :: acc)
                else loop (pos + 1) acc
            | _ -> loop (pos + 1) acc
    loop start []

let private markupLocations (text: string) =
    [ for m in tagStart.Matches text do yield! tagLocations text (m.Index + m.Length) ]

let private maskedSpans (kind: Kind) (text: string) =
    let links =
        match kind with
        | Markdown ->
            [ for pattern in [ markdownLink; markdownReference ] do
                  for m in pattern.Matches text -> m.Groups["target"].Index, m.Groups["target"].Index + m.Groups["target"].Length ]
        | Other -> []
    links
    @ markupLocations text
    @ (locations
       |> List.collect (fun pattern -> [ for m in pattern.Matches text -> m.Index, m.Index + m.Length ]))

let private inside (spans: (int * int) list) (index: int) =
    spans |> List.exists (fun (start, finish) -> index >= start && index < finish)

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
    let spans = maskedSpans kind text
    [ for m in token.Matches text do
          if not (inside spans m.Index) then
              yield m, fst (replacementFor m) ]

/// The text with every namespace token rewritten. Idempotent: `forma-` never
/// matches a rule.
let migrateAs (kind: Kind) (text: string) =
    let spans = maskedSpans kind text
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

/// Line-level changes, for --dry-run and --check reports. They come from the
/// same whole-file rewrite as write mode (a tag or a JSX expression can span
/// lines), so a report never shows a change that writing would not make.
/// Rewrites never add or remove a newline, so lines correspond one to one.
let changes (kind: Kind) (text: string) =
    let before = lines text
    let after = lines (migrateAs kind text)
    let starts = before |> Array.scan (fun offset (line: string) -> offset + line.Length + 1) 0
    let ruleAt =
        tokens kind text
        |> List.map (fun (m, rule) -> (before.Length - 1 |> min (Array.findIndexBack (fun start -> start <= m.Index) starts[.. before.Length - 1])), rule)
    [ for index in 0 .. before.Length - 1 do
          if before[index] <> after[index] then
              let named = ruleAt |> List.filter (fst >> (=) index) |> List.map snd |> List.distinct
              yield
                  { Line = index + 1
                    Rule = if named.IsEmpty then "dataset-destructuring" else String.concat "," named
                    Before = before[index].TrimEnd('\r')
                    After = after[index].TrimEnd('\r') } ]

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
