module Forma.TokenValidator.Program

open System
open System.IO
open System.Text.Json
open Forma.TokenValidator.Validation

let private usage =
    """usage: TokenValidator [--forma DIR] [--json] (--self | PATH...)

  --forma DIR  Forma root to validate against: an installed package
               (node_modules/@echelon-foundry/design-system) or a built
               checkout. Default: the current directory.
  --self       Validate Forma itself: token sources (aliases, cycles, theme
               completeness), brand manifests, and every var() in the built
               stylesheets.
  PATH...      Application CSS files or directories (searched for *.css,
               skipping node_modules) to validate against that Forma version.
  --json       Print findings as JSON.

Exit status: 0 no errors, 1 errors found, 2 invalid arguments or unreadable input."""

type private Options =
    { Forma: string
      Self: bool
      Json: bool
      Paths: string list }

let rec private parse (options: Options) (args: string list) =
    match args with
    | [] -> Ok { options with Paths = List.rev options.Paths }
    | "--forma" :: dir :: rest -> parse { options with Forma = dir } rest
    | "--self" :: rest -> parse { options with Self = true } rest
    | "--json" :: rest -> parse { options with Json = true } rest
    | ("--help" | "-h") :: _ -> Error ""
    | flag :: _ when flag.StartsWith("--") -> Error $"unknown option {flag}"
    | path :: rest -> parse { options with Paths = path :: options.Paths } rest

let private cssFiles (path: string) =
    if Directory.Exists path then
        Directory.EnumerateFiles(path, "*.css", SearchOption.AllDirectories)
        |> Seq.filter (fun file -> not (file.Split(Path.DirectorySeparatorChar) |> Array.contains "node_modules"))
        |> Seq.sort
        |> Seq.toList
    elif File.Exists path then [ path ]
    else failwith $"no such file or directory: {path}"

let private relative (file: string) =
    if String.IsNullOrEmpty file then file else Path.GetRelativePath(Environment.CurrentDirectory, file)

let private render json (findings: Finding list) =
    if json then
        let rows =
            findings
            |> List.map (fun f ->
                dict [ "code", box f.Code
                       "severity", box (match f.Severity with Blocking -> "error" | Advisory -> "warning")
                       "file", box (relative f.File)
                       "line", box f.Line
                       "name", box f.Name
                       "message", box f.Message ])
        printfn "%s" (JsonSerializer.Serialize(rows, JsonSerializerOptions(WriteIndented = true)))
    else
        findings
        |> List.iter (fun f ->
            let location = if f.Line > 0 then $"{relative f.File}:{f.Line}" else relative f.File
            let severity = match f.Severity with Blocking -> "error" | Advisory -> "warning"
            printfn $"{location}: {severity} [{f.Code}] {f.Message}")

[<EntryPoint>]
let main argv =
    match parse { Forma = "."; Self = false; Json = false; Paths = [] } (List.ofArray argv) with
    | Error message ->
        if message <> "" then eprintfn "%s" message
        eprintfn "%s" usage
        if message = "" then 0 else 2
    | Ok options when not options.Self && options.Paths.IsEmpty ->
        eprintfn "%s" usage
        2
    | Ok options ->
        try
            let root = Path.GetFullPath options.Forma
            let registry = registryOf root
            let selfFindings =
                if options.Self then
                    let tokens = validateTokens registry.Tokens
                    let brands =
                        let directory = Path.Combine(root, "brands")
                        if Directory.Exists directory then
                            Directory.EnumerateFiles(directory, "*.brand.json") |> Seq.sort |> Seq.toList |> List.collect validateBrand
                        else []
                    tokens @ brands @ validateFormaCss registry
                else []
            let appFindings =
                options.Paths |> List.collect cssFiles |> declarationsOf |> validateCss registry
            let findings = (selfFindings @ appFindings) |> List.distinct |> List.sortBy (fun f -> f.File, f.Line, f.Name, f.Code)
            render options.Json findings
            let errors = findings |> List.filter (fun f -> f.Severity = Blocking) |> List.length
            if not options.Json then
                eprintfn $"token validation: {errors} error(s); {registry.Defined.Count} defined Forma properties and {registry.Hooks.Count} documented inputs in {relative root}"
            if errors > 0 then 1 else 0
        with ex ->
            eprintfn $"ERROR {ex.Message}"
            2
