/// forma-namespace-migrator: rewrites Forma's pre-1.0 `ef-` namespace to
/// `forma-` (FORMA-NS-001) in HTML, CSS, JS/MJS, F#, JSON and Markdown.
///
///   dotnet run --project node_modules/@echelon-foundry/design-system/tools/NamespaceMigrator/NamespaceMigrator.fsproj -- --check src
///
/// Exit status: 0 success (and, with --check, nothing to change), 2 invalid
/// arguments or unreadable input, 3 --check found files that would change.
module Forma.NamespaceMigrator.Program

open System
open System.IO
open Forma.NamespaceMigrator.Migration

let private usage =
    """usage: NamespaceMigrator [--check | --dry-run] [--exclude TEXT]... PATH...

  (default)   Rewrite files in place.
  --check     Report what would change; write nothing. Exit 3 when anything
              would change, 0 when the tree already uses the forma- namespace.
  --dry-run   Print every line that would change (before and after); write
              nothing. Exit 0.
  --exclude   Skip files whose path contains TEXT (repeatable).
  PATH...     Files or directories. Directories are searched recursively for
              .html .htm .css .js .mjs .cjs .fs .fsi .fsx .json .md files,
              skipping node_modules, .git, bin and obj.

Rewrites only namespace tokens: --ef-* -> --forma-*, data-ef-* ->
data-forma-*, ef-* (classes, tags, ids, strings) -> forma-*, and
dataset.efX -> dataset.formaX. ref-, chef-, --ref-, beef- are untouched."""

type private Mode =
    | Write
    | Check
    | DryRun

type private Options =
    { Mode: Mode
      Excludes: string list
      Paths: string list }

let rec private parse (options: Options) (args: string list) =
    match args with
    | [] when options.Paths.IsEmpty -> Error "no PATH given"
    | [] -> Ok { options with Paths = List.rev options.Paths }
    | "--check" :: rest when options.Mode = Write -> parse { options with Mode = Check } rest
    | "--dry-run" :: rest when options.Mode = Write -> parse { options with Mode = DryRun } rest
    | ("--check" | "--dry-run") :: _ -> Error "--check and --dry-run are exclusive"
    | "--exclude" :: text :: rest -> parse { options with Excludes = text :: options.Excludes } rest
    | ("--help" | "-h") :: _ -> Error ""
    | flag :: _ when flag.StartsWith("--") -> Error $"unknown option {flag}"
    | path :: rest -> parse { options with Paths = path :: options.Paths } rest

let private normalize (path: string) = path.Replace('\\', '/')

let rec private files (path: string) : string list =
    if Directory.Exists path then
        let nested =
            Directory.GetDirectories path
            |> Array.filter (fun dir -> not (skippedDirectories.Contains(Path.GetFileName dir)))
            |> Array.sort
            |> Array.toList
            |> List.collect files
        let own = Directory.GetFiles path |> Array.filter isSupported |> Array.sort |> Array.toList
        own @ nested
    elif File.Exists path then
        [ path ]
    else
        failwith $"no such file or directory: {path}"

type private Outcome =
    { File: string
      Changes: Change list
      Original: string
      Migrated: string }

let private examine (file: string) =
    let original = File.ReadAllText file
    let migrated = migrate original
    { File = normalize file
      Changes = if migrated = original then [] else changes original
      Original = original
      Migrated = migrated }

let private report (mode: Mode) (outcomes: Outcome list) =
    let changed = outcomes |> List.filter (fun o -> o.Migrated <> o.Original)
    for outcome in changed do
        match mode with
        | DryRun ->
            for change in outcome.Changes do
                printfn "%s:%d [%s]" outcome.File change.Line change.Rule
                printfn "  - %s" (change.Before.Trim())
                printfn "  + %s" (change.After.Trim())
        | Check
        | Write ->
            printfn "%s: %d line(s)" outcome.File outcome.Changes.Length
    let lineCount = changed |> List.sumBy (fun o -> o.Changes.Length)
    let verb =
        match mode with
        | Write -> "rewrote"
        | Check
        | DryRun -> "would rewrite"
    printfn "namespace migration: %s %d line(s) in %d of %d file(s)" verb lineCount changed.Length outcomes.Length
    changed

[<EntryPoint>]
let main argv =
    match parse { Mode = Write; Excludes = []; Paths = [] } (List.ofArray argv) with
    | Error message ->
        if message <> "" then eprintfn "error: %s" message
        eprintfn "%s" usage
        if message = "" then 0 else 2
    | Ok options ->
        try
            let outcomes =
                options.Paths
                |> List.collect files
                |> List.distinct
                |> List.filter (fun file -> options.Excludes |> List.forall (fun text -> not ((normalize file).Contains text)))
                |> List.map examine
            let changed = report options.Mode outcomes
            match options.Mode with
            | Write ->
                for outcome in changed do
                    File.WriteAllText(outcome.File, outcome.Migrated)
                0
            | Check -> if changed.IsEmpty then 0 else 3
            | DryRun -> 0
        with ex ->
            eprintfn "error: %s" ex.Message
            2
