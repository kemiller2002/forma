/// forma-namespace-migrator: rewrites Forma's pre-1.0 `ef-` namespace to
/// `forma-` (FORMA-NS-001) in HTML, CSS/SCSS/Sass/Less, JS/TS (and JSX/TSX),
/// Vue, Svelte, Razor, F#, JSON and Markdown.
///
///   dotnet run --project node_modules/@echelon-foundry/design-system/tools/NamespaceMigrator/NamespaceMigrator.fsproj -- --check src
///
/// Exit status: 0 success (and, with --check, nothing to change or review),
/// 2 invalid arguments or unreadable input, 3 --check found files that would
/// change or text files of another kind that contain namespace tokens.
module Forma.NamespaceMigrator.Program

open System
open System.IO
open System.Text
open Forma.NamespaceMigrator.Migration

let private usage =
    """usage: NamespaceMigrator [--check | --dry-run] [--exclude TEXT]... [--include-vendored] PATH...

  (default)          Rewrite files in place. Encoding (UTF-8, with or without a
                     byte-order mark) and line endings are preserved.
  --check            Report what would change; write nothing. Exit 3 when a
                     file would change, or when a text file this tool does not
                     rewrite (another kind, or a supported kind that is not
                     UTF-8) contains namespace tokens, or when a quoted string
                     could be a selector or a file name (".ef-icon.svg"; left
                     unrewritten unless it is a querySelector/closest/matches
                     argument), all listed as "review"; exit 0 only when
                     nothing needs attention.
  --dry-run          Print every line that would change (before and after);
                     write nothing. Exit 0.
  --exclude TEXT     Skip files whose path contains TEXT (repeatable).
  --include-vendored Also descend into vendor, bower_components, jspm_packages,
                     dist and wwwroot/lib, which are skipped by default as
                     third-party copies or build output. node_modules, .git,
                     bin and obj are always skipped.
  PATH...            Files or directories. Rewritten kinds: .html .htm .css
                     .scss .sass .less .js .mjs .cjs .jsx .ts .mts .cts .tsx
                     .vue .svelte .razor .cshtml .fs .fsi .fsx .json .md.

Rewrites only namespace tokens: --ef-* -> --forma-*, data-ef-* ->
data-forma-*, ef-* (classes, tags, ids, class strings) -> forma-*,
dataset.efX / dataset["efX"] -> formaX, and dataset destructuring
{ efX } -> { formaX: efX } (also with a type annotation). Words (ref-, chef-,
--ref-, beef-) and locations (URLs, url(), @import, src/href values inside a
markup tag, Markdown link targets in .md files, module specifiers,
@scope/packages, file and host names) are untouched; `.ef-x` is always a
class selector."""

type private Mode =
    | Write
    | Check
    | DryRun

type private Options =
    { Mode: Mode
      Excludes: string list
      IncludeVendored: bool
      Paths: string list }

let rec private parse (options: Options) (args: string list) =
    match args with
    | [] when options.Paths.IsEmpty -> Error "no PATH given"
    | [] -> Ok { options with Paths = List.rev options.Paths }
    | "--check" :: rest when options.Mode = Write -> parse { options with Mode = Check } rest
    | "--dry-run" :: rest when options.Mode = Write -> parse { options with Mode = DryRun } rest
    | ("--check" | "--dry-run") :: _ -> Error "--check and --dry-run are exclusive"
    | "--exclude" :: text :: rest -> parse { options with Excludes = text :: options.Excludes } rest
    | "--include-vendored" :: rest -> parse { options with IncludeVendored = true } rest
    | ("--help" | "-h") :: _ -> Error ""
    | flag :: _ when flag.StartsWith("--") -> Error $"unknown option {flag}"
    | path :: rest -> parse { options with Paths = path :: options.Paths } rest

let private normalize (path: string) = path.Replace('\\', '/')

let rec private files (includeVendored: bool) (path: string) : string list =
    if Directory.Exists path then
        let descend (dir: string) =
            let name = Path.GetFileName dir
            not (alwaysSkipped.Contains name) && (includeVendored || not (isVendored path name))
        let nested =
            Directory.GetDirectories path
            |> Array.filter descend
            |> Array.sort
            |> Array.toList
            |> List.collect (files includeVendored)
        (Directory.GetFiles path |> Array.sort |> Array.toList) @ nested
    elif File.Exists path then
        [ path ]
    else
        failwith $"no such file or directory: {path}"

/// A file's text with its encoding facts, so a rewrite writes back exactly
/// what it read except for the tokens.
type private Source =
    { Text: string
      Bom: bool }

let private utf8Bom = [| 0xEFuy; 0xBBuy; 0xBFuy |]
let private strictUtf8 = UTF8Encoding(false, true)

/// What a file holds: UTF-8 text (rewritten), other text (never rewritten,
/// so it cannot be corrupted, but inspected through a Latin-1 view and
/// listed for review when it holds Forma names), or binary (ignored).
type private Content =
    | Utf8 of Source
    | OtherText of string
    | Binary

let private latin1 = Encoding.Latin1

let private read (file: string) : Content =
    let bytes = File.ReadAllBytes file
    let bom = bytes.Length >= 3 && bytes[0..2] = utf8Bom
    let body = if bom then bytes[3..] else bytes
    if Array.contains 0uy body[.. min (body.Length - 1) 8191] then
        Binary
    else
        try
            Utf8 { Text = strictUtf8.GetString body; Bom = bom }
        with :? DecoderFallbackException ->
            OtherText(latin1.GetString body)

let private write (file: string) (source: Source) (text: string) =
    let body = strictUtf8.GetBytes text
    File.WriteAllBytes(file, (if source.Bom then Array.append utf8Bom body else body))

type private Outcome =
    { File: string
      Source: Source
      Changes: Change list
      Migrated: string
      Ambiguous: (int * string) list
      Uncertain: int list
      Possible: int list }

let private examine (file: string) (source: Source) =
    let kind = kindOf file
    let migrated = migrateAs kind source.Text
    { File = normalize file
      Source = source
      Changes = if migrated = source.Text then [] else changes kind source.Text
      Migrated = migrated
      Ambiguous = ambiguous source.Text
      Uncertain = fst (tagReview kind source.Text)
      Possible = snd (tagReview kind source.Text) }

/// Report lines go through one buffered writer (flushed at exit): a review
/// list can be long, and `printfn` per line is slow.
let private say (line: string) = Console.Out.WriteLine line

let private report (mode: Mode) (outcomes: Outcome list) (review: string list) =
    let changed = outcomes |> List.filter (fun o -> o.Migrated <> o.Source.Text)
    for outcome in changed do
        match mode with
        | DryRun ->
            for change in outcome.Changes do
                say $"{outcome.File}:{change.Line} [{change.Rule}]"
                say $"  - {change.Before.Trim()}"
                say $"  + {change.After.Trim()}"
        | Check
        | Write -> say $"{outcome.File}: {outcome.Changes.Length} line(s)"
    let ambiguousCount = outcomes |> List.sumBy (fun o -> o.Ambiguous.Length)
    let uncertainCount = outcomes |> List.sumBy (fun o -> o.Uncertain.Length + o.Possible.Length)
    for outcome in outcomes do
        for line, value in outcome.Ambiguous do
            say $"review: {outcome.File}:{line} \"{value}\" is either a class selector or a file name and was left unrewritten; rewrite it by hand if it is a selector"
        // Each uncertain tag is counted; the first 20 per file are listed.
        for line in List.truncate 20 outcome.Uncertain do
            say $"review: {outcome.File}:{line} a tag here could not be read with certainty (an unclosed or ambiguous {{...}} expression, or over 1 MiB); src/href values in the next 4 KiB were left unrewritten; check them by hand"
        if outcome.Uncertain.Length > 20 then
            say $"review: {outcome.File}: {outcome.Uncertain.Length - 20} more tag(s) could not be read with certainty"
        for line in List.truncate 20 outcome.Possible do
            say $"review: {outcome.File}:{line} a <name here may be a tag; its src/href value was left unrewritten; check it by hand"
        if outcome.Possible.Length > 20 then
            say $"review: {outcome.File}: {outcome.Possible.Length - 20} more possible tag(s) with src/href values left unrewritten"
    for file in review do
        say $"review: {file} contains namespace tokens this tool does not rewrite (another file kind, or not UTF-8); fix it by hand or --exclude it"
    let lineCount = changed |> List.sumBy (fun o -> o.Changes.Length)
    let verb =
        match mode with
        | Write -> "rewrote"
        | Check
        | DryRun -> "would rewrite"
    printfn "namespace migration: %s %d line(s) in %d of %d file(s); %d other file(s) to review; %d ambiguous string(s) to review; %d uncertain tag(s) to review" verb lineCount changed.Length outcomes.Length review.Length ambiguousCount uncertainCount
    changed, ambiguousCount + uncertainCount

let private run (argv: string[]) =
    match parse { Mode = Write; Excludes = []; IncludeVendored = false; Paths = [] } (List.ofArray argv) with
    | Error message ->
        if message <> "" then eprintfn "error: %s" message
        eprintfn "%s" usage
        if message = "" then 0 else 2
    | Ok options ->
        try
            let candidates =
                options.Paths
                |> List.collect (files options.IncludeVendored)
                |> List.distinct
                |> List.filter (fun file -> options.Excludes |> List.forall (fun text -> not ((normalize file).Contains text)))
            let supported, other = candidates |> List.partition isSupported
            let contents = supported |> List.map (fun file -> file, read file)
            let outcomes =
                contents |> List.choose (fun (file, content) -> match content with Utf8 source -> Some(examine file source) | _ -> None)
            // Supported files that are not UTF-8 are never rewritten, but a
            // Forma name in them is listed for review instead of passing silently.
            let notUtf8 =
                contents
                |> List.choose (fun (file, content) ->
                    match content with
                    | OtherText text when hasTokens text -> Some(normalize file + " (not UTF-8)")
                    | _ -> None)
            let otherKinds =
                other
                |> List.filter (fun file -> FileInfo(file).Length < 5_000_000L)
                |> List.choose (fun file ->
                    match read file with
                    | Utf8 source when hasTokens source.Text -> Some(normalize file)
                    | OtherText text when hasTokens text -> Some(normalize file)
                    | _ -> None)
            let review = notUtf8 @ otherKinds
            let changed, ambiguousCount = report options.Mode outcomes review
            match options.Mode with
            | Write ->
                for outcome in changed do
                    write outcome.File outcome.Source outcome.Migrated
                0
            | Check -> if changed.IsEmpty && review.IsEmpty && ambiguousCount = 0 then 0 else 3
            | DryRun -> 0
        with ex ->
            eprintfn "error: %s" ex.Message
            2

[<EntryPoint>]
let main argv =
    let out = new StreamWriter(Console.OpenStandardOutput(), UTF8Encoding(false), 65536)
    Console.SetOut out
    try run argv finally out.Flush()
