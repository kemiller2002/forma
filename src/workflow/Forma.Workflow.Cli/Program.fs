module Forma.Workflow.Cli.Program

open System
open System.IO
open Forma.Workflow

/// Exit codes: 0 success, 1 a document is invalid, 2 invalid arguments, 3 an input could not be read.
let usage =
    """forma-workflow <command> [options]

Commands
  validate <file>...           Classify and validate workflow files.
      --json                   Print the machine-readable report.
  normalize <file> [--out F]   Write the canonical serialization.
  layout <file> [--recompute] [--out F]
                               Write default layout geometry into layout fields only.
  render <file> [--document] [--out F] [--deps F]
      --forma-base URL         Where Forma dist files are served (document only).
      --brand ID               Public Forma brand to load and apply.
      --theme light|dark       Explicit theme (document only).
      --interactive MODE       view|inspect|edit|pick|runtime: wrap in <forma-workflow>.
      --runtime-base URL       Where @echelon-foundry/forma-workflow files are served.
      --metadata KEY[,KEY]     Metadata keys to show on nodes.
  schema                       Print the published JSON Schema.
"""

type private Args = { Positional: string list; Flags: Map<string, string> }

let private parse (argv: string list) =
    let rec go (acc: Args) (rest: string list) =
        match rest with
        | [] -> { acc with Positional = List.rev acc.Positional }
        | ("--json" | "--recompute" | "--document" as flag) :: tail -> go { acc with Flags = acc.Flags.Add(flag, "") } tail
        | flag :: value :: tail when flag.StartsWith "--" -> go { acc with Flags = acc.Flags.Add(flag, value) } tail
        | [ flag ] when flag.StartsWith "--" -> go { acc with Flags = acc.Flags.Add(flag, "") } []
        | value :: tail -> go { acc with Positional = value :: acc.Positional } tail
    go { Positional = []; Flags = Map.empty } argv

let private write (target: string option) (text: string) =
    match target with
    | Some path ->
        Path.GetDirectoryName(Path.GetFullPath path) |> Directory.CreateDirectory |> ignore
        File.WriteAllText(path, text)
    | None -> Console.Out.Write text

let private read path =
    try Ok(File.ReadAllText path) with ex -> Result.Error ex.Message

let private loadValid path =
    match read path with
    | Result.Error e -> Result.Error(3, $"{path}: {e}")
    | Ok text ->
        let report = Validation.load text
        match report.Workflow with
        | Some w when Validation.isValid report -> Ok w
        | _ ->
            let errors = report.Findings |> List.filter (fun f -> f.Severity = Severity.Error) |> List.map (fun f -> $"  {f.Pointer}: {f.Message}")
            Result.Error(1, $"{path}: {Validation.classText report.Class}\n" + String.Join("\n", errors))

let private validate (args: Args) =
    if args.Positional.IsEmpty then (eprintfn "%s" usage; 2)
    else
        let results =
            args.Positional
            |> List.map (fun path ->
                match read path with
                | Result.Error e -> path, None, Some e
                | Ok text -> path, Some(Validation.load text), None)
        if args.Flags.ContainsKey "--json" then
            let items =
                results
                |> List.map (fun (path, report, err) ->
                    match report, err with
                    | Some r, _ -> Json.Object [ "file", Json.String path; "report", Validation.reportJson r ]
                    | None, Some e -> Json.Object [ "file", Json.String path; "error", Json.String e ]
                    | None, None -> Json.Null)
            Console.Out.Write(Json.serialize (Json.Array items))
        else
            for (path, report, err) in results do
                match report, err with
                | Some r, _ ->
                    printfn "%s: %s" path (Validation.classText r.Class)
                    for f in r.Findings do
                        printfn "  %s %s %s %s" (Validation.severityText f.Severity) f.Code f.Pointer f.Message
                | None, Some e -> printfn "%s: unreadable (%s)" path e
                | None, None -> ()
        if results |> List.exists (fun (_, _, e) -> e.IsSome) then 3
        elif results |> List.forall (fun (_, r, _) -> r |> Option.exists Validation.isValid) then 0
        else 1

let private withWorkflow (args: Args) (f: Workflow -> int) =
    match args.Positional with
    | [ path ] ->
        match loadValid path with
        | Ok w -> f w
        | Result.Error(code, message) -> (eprintfn "%s" message; code)
    | _ -> (eprintfn "%s" usage; 2)

let private render (args: Args) =
    withWorkflow args (fun w ->
        let flag k = args.Flags.TryFind k
        let interactivity =
            match flag "--interactive" with
            | None -> Ok StaticOutput
            | Some m ->
                match HostMode.tryParse m with
                | Some mode -> Ok(InteractiveOutput(mode, flag "--runtime-base" |> Option.defaultValue "node_modules/@echelon-foundry/forma-workflow/dist/"))
                | None -> Result.Error $"unknown mode {m}"
        match interactivity with
        | Result.Error e -> (eprintfn "%s" e; 2)
        | Ok interactivity ->
            let renderOptions =
                { RenderOptions.defaults with
                    VisibleMetadata = flag "--metadata" |> Option.map (fun s -> s.Split(',', StringSplitOptions.RemoveEmptyEntries) |> List.ofArray) |> Option.defaultValue [] }
            let opts =
                { DocumentOptions.defaults with
                    Render = renderOptions
                    FormaBase = flag "--forma-base" |> Option.defaultValue DocumentOptions.defaults.FormaBase
                    Brand = flag "--brand"
                    Theme = flag "--theme"
                    Interactivity = interactivity }
            let output = if args.Flags.ContainsKey "--document" then WorkflowDocument.document opts w else WorkflowDocument.fragment opts w
            write (flag "--out") output.Html
            flag "--deps" |> Option.iter (fun p -> write (Some p) (Json.serialize (WorkflowDocument.dependencyJson output.Dependencies)))
            0)

[<EntryPoint>]
let main argv =
    let args = parse (List.ofArray argv |> List.skip (min 1 argv.Length))
    match List.ofArray argv with
    | "validate" :: _ -> validate args
    | "normalize" :: _ -> withWorkflow args (fun w -> write (args.Flags.TryFind "--out") (Codec.serialize w); 0)
    | "layout" :: _ ->
        withWorkflow args (fun w ->
            let request = if args.Flags.ContainsKey "--recompute" then Recompute else FillMissing
            write (args.Flags.TryFind "--out") (Codec.serialize (Layout.apply request w))
            0)
    | "render" :: _ -> render args
    | "schema" :: _ -> (Console.Out.Write(Validation.schemaJson ()); 0)
    | _ -> (eprintfn "%s" usage; 2)
