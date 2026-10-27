module Program

open System
open System.Diagnostics
open System.IO
open Forma.Workflow
open Forma.Layout.Probe

/// The repository root (the directory holding dist/ and schemas/workflow).
let root =
    let rec up (dir: DirectoryInfo) =
        if isNull dir then failwith "repository root not found"
        elif File.Exists(Path.Combine(dir.FullName, "schemas", "workflow", "1.0", "forma-workflow.schema.json")) then dir.FullName
        else up dir.Parent
    up (DirectoryInfo(AppContext.BaseDirectory))

let fixturesDir = Path.Combine(root, "tests", "layout", "fixtures")

let private option (name: string) (args: string list) =
    args |> List.pairwise |> List.tryFind (fst >> (=) name) |> Option.map snd

let private flag (name: string) (args: string list) = List.contains name args

let private outDir args = option "--out" args |> Option.defaultValue (Path.Combine(root, "tests", "layout", "out")) |> Path.GetFullPath

let private timed f =
    let sw = Stopwatch.StartNew()
    let r = f ()
    r, sw.ElapsedMilliseconds

let private writeEvaluation (out: string) (label: string) (browser: string) (ms: int64) (evaluated: Evaluated list) =
    let summary = Report.summarize label browser ms evaluated
    Report.write out "findings.json" (Json.Array(evaluated |> List.collect _.Findings |> List.map Report.finding))
    Report.write out "summary.json" (Report.summaryJson summary)
    Report.write out "cases.json" (Json.Array(evaluated |> List.map (fun e -> Report.caseJson e.Case)))
    File.WriteAllText(Path.Combine(out, "summary.md"), Report.summaryMarkdown summary + "\n")
    printfn "%s" (Report.summaryMarkdown summary)

/// The adversarial batch: N cases per family from one run seed.
let runBatch (args: string list) =
    let seed = option "--seed" args |> Option.map Seed.parse |> Option.defaultValue 0x1ce0001UL
    let count = option "--count" args |> Option.map int |> Option.defaultValue 100
    let families = option "--families" args |> Option.map (fun s -> s.Split(',') |> List.ofArray) |> Option.defaultValue []
    let label = option "--label" args |> Option.defaultValue "run"
    let out = outDir args
    let cases = Families.generate seed count families
    let (evaluated, browser), ms = timed (fun () -> Search.run root (Path.Combine(out, "pages")) (flag "--repeat" args) cases)
    writeEvaluation out $"{label} (seed {Seed.text seed}, {count} per family)" browser ms evaluated
    0

/// The bounded searches of Sections 5.2 and 9.
let runSweeps (args: string list) =
    let out = outDir args
    let measure name cases = Search.run root (Path.Combine(out, name)) false cases |> fst
    let radius = measure "radius" (Search.radiusPaddingCases ())
    let transitions = Search.radiusTransitions radius
    let pill = measure "pill" (Search.pillLengthCases ())
    let causaLike =
        { Title = "Zoom"
          Direction = "right"
          Nodes =
            [ { Id = "h"; Kind = "task"; Label = (Corpus.byKind "paragraph").Text; Description = Some "Hypothesis · Supported · 3 supporting, 0 contradicting evidence"; Shape = None; Width = None; Height = None; Status = None }
              { Id = "c"; Kind = "end"; Label = (Corpus.byKind "medium").Text; Description = Some "Outcome · causal relationship Confirmed"; Shape = None; Width = None; Height = None; Status = None } ]
          Edges = [ { Source = "h"; Target = "c"; Label = Some "Contributing factor"; Direction = None } ]
          Groups = []
          Zoom = 1.0 }
    let zoom = measure "zoom" (Search.zoomCases causaLike)
    let text = measure "text" (Search.textScaleCases (ComponentCase(WizardStep, "10", "50%", 600.0)) @ (Search.textScaleCases (DiagramCase causaLike) |> List.map (fun c -> { c with Id = c.Id + "-diagram"; Note = c.Note + "-diagram" })))
    let row (e: Evaluated) = Json.Object [ "case", Json.String e.Case.Id; "note", Json.String e.Case.Note; "errors", Json.Array(Search.errors e.Findings |> List.map (fun f -> Json.String $"{f.Constraint} ({f.Excess}px)")) ]
    let json =
        Json.Object
            [ "radiusPadding",
              Json.Object
                  [ "rows", Json.Array(radius |> List.map row)
                    "transitions",
                    Json.Array(
                        transitions
                        |> List.map (fun (pad, failing, analytic) ->
                            Json.Object
                                [ "padding", Json.number pad
                                  "firstFailingRadius", (failing |> Option.map (float >> Json.number) |> Option.defaultValue Json.Null)
                                  "analyticFirstFailingRadius", (analytic |> Option.map (float >> Json.number) |> Option.defaultValue Json.Null) ])
                    ) ]
              "pillLength", Json.Array(pill |> List.map row)
              "zoom", Json.Array(Search.zoomDrift zoom |> List.map (fun (note, drift, errs) -> Json.Object [ "zoom", Json.String note; "maxSizeDriftPx", Json.number (Math.Round(drift, 2)); "errors", Json.number (float errs) ]))
              "zoomRows", Json.Array(zoom |> List.map row)
              "textScale", Json.Array(text |> List.map row) ]
    Report.write out "sweeps.json" json
    for pad, failing, analytic in transitions do
        printfn "padding %4.0f: first failing radius %s (analytic %s)" pad (failing |> Option.map string |> Option.defaultValue "none") (analytic |> Option.map string |> Option.defaultValue "none in sweep")
    for e in pill do printfn "pill %s: %s" e.Case.Note (String.Join(", ", Search.errors e.Findings |> List.map _.Constraint |> List.distinct))
    for note, drift, errs in Search.zoomDrift zoom do printfn "zoom %s: drift %.2fpx, %d errors" note drift errs
    for e in text do printfn "text %s: %s" e.Case.Note (String.Join(", ", Search.errors e.Findings |> List.map _.Constraint |> List.distinct))
    0

/// Minimises the first failing case of each error constraint in a run's output and stores it as a regression fixture.
let runMinimize (args: string list) =
    let out = outDir args
    let source = option "--from" args |> Option.defaultValue out
    let rounds = option "--rounds" args |> Option.map int |> Option.defaultValue 6
    let cases =
        match Json.parse (File.ReadAllText(Path.Combine(source, "cases.json"))) with
        | Ok(Json.Array xs) -> xs |> List.map Report.caseOf |> List.map (fun c -> c.Id, c) |> Map.ofList
        | _ -> failwith "cases.json missing"
    let findings =
        match Json.parse (File.ReadAllText(Path.Combine(source, "findings.json"))) with
        | Ok(Json.Array xs) -> xs
        | _ -> failwith "findings.json missing"
    let str name json = match Json.field name json with Some(Json.String v) -> v | _ -> ""
    let firsts =
        findings
        |> List.filter (fun f -> str "severity" f = "error")
        |> List.groupBy (fun f -> str "constraint" f, str "component" f)
        |> List.choose (fun (key, fs) -> fs |> List.tryHead |> Option.bind (fun f -> cases |> Map.tryFind (str "case" f) |> Option.map (fun c -> key, c)))
    let dir = Path.Combine(fixturesDir, "minimized")
    Directory.CreateDirectory dir |> ignore
    for (constraintId, comp), c in firsts do
        let minimal, trail = Search.minimize root (Path.Combine(out, "minimize", c.Id)) rounds constraintId c
        let name = $"{constraintId}--{comp}--{c.Id}"
        let fixture =
            Json.Object
                [ "constraint", Json.String constraintId
                  "origin", Json.Object [ "case", Json.String c.Id; "seed", Json.String(Seed.text c.Seed); "family", Json.String c.Family ]
                  "minimization", Json.Array(trail |> List.map Json.String)
                  "case", Report.caseJson { minimal with Id = name }
                  "expect", Json.String "fail" ]
        Report.write dir (name + ".json") fixture
        printfn "%s: %s" name (String.Join("; ", trail))
    0

/// Renders every stored fixture and compares with its expectation. A fixture
/// whose defect has been corrected is marked "pass" and must keep passing; one
/// that still fails names the static LayoutCheck codes that must keep reporting
/// it, so a known invalid layout is never silently accepted. `--accept`
/// rewrites each fixture's expectation from what was observed.
let runRegress (args: string list) =
    let out = outDir args
    let accept = flag "--accept" args
    let files = Directory.GetFiles(fixturesDir, "*.json", SearchOption.AllDirectories) |> Array.sort |> List.ofArray
    let str name json = match Json.field name json with Some(Json.String v) -> v | _ -> ""
    let fixtures =
        files
        |> List.choose (fun f ->
            match Json.parse (File.ReadAllText f) with
            | Ok json ->
                match Json.field "case" json with
                | Some c -> Some(f, json, Report.caseOf c)
                | None -> None
            | Error _ -> None)
    let evaluated, _ = Search.run root (Path.Combine(out, "regress")) true (fixtures |> List.map (fun (_, _, c) -> c))
    let results =
        fixtures
        |> List.map (fun (file, json, c) ->
            let cid, expect = str "constraint" json, str "expect" json
            let mine = evaluated |> List.filter (fun e -> e.Case.Id = c.Id)
            let violated =
                mine
                |> List.collect _.Findings
                |> List.filter (fun f -> f.Severity = "error" && (cid = "*" || f.Constraint = cid))
                |> List.map _.Constraint
                |> List.distinct
            let staticCodes = mine |> List.collect _.Static |> List.map _.Code |> List.distinct
            let required = match Json.field "static" json with Some(Json.Array xs) -> xs |> List.choose (function Json.String v -> Some v | _ -> None) | _ -> []
            let fails = not violated.IsEmpty
            let deterministic = mine |> List.forall (fun e -> e.Findings |> List.forall (fun f -> f.Constraint <> "determinism"))
            let reported = required |> List.forall (fun code -> List.contains code staticCodes)
            let ok = deterministic && reported && ((expect = "fail") = fails)
            let name = Path.GetFileNameWithoutExtension file
            let observed = if fails then "violates " + String.Join(", ", violated) else "satisfies"
            let statics = if staticCodes.IsEmpty then "" else " | static: " + String.Join(", ", staticCodes)
            printfn "%s %s (expect %s, %s%s)" (if ok then "ok    " else "FAILED") name expect observed statics
            if accept then
                let keep = match json with Json.Object props -> props |> List.filter (fun (k, _) -> k <> "expect" && k <> "static") | _ -> []
                let updated =
                    Json.Object(
                        keep
                        @ [ yield "expect", Json.String(if fails then "fail" else "pass")
                            if fails && not staticCodes.IsEmpty then yield "static", Json.Array(staticCodes |> List.map Json.String) ]
                    )
                File.WriteAllText(file, Json.serialize updated + "\n")
            ok || accept)
    let failed = results |> List.filter not |> List.length
    printfn "\n%d fixtures, %d as expected, %d unexpected" results.Length (results.Length - failed) failed
    if failed = 0 then 0 else 1

/// Derives the Causa causal-analysis diagrams from a causa-data checkout the
/// way the Causa app does (indy-init-rehearsal-004 src/app/View.fs graphDocument),
/// so the integration scenario runs offline.
let runCausa (args: string list) =
    let data = option "--data" args |> Option.defaultWith (fun () -> failwith "--data <causa-data checkout> is required")
    let dir = Path.Combine(data, "workspaces", "demo", "historical-v1", "investigations")
    let str name json = match Json.field name json with Some(Json.String v) -> v | _ -> ""
    let items name json = match Json.field name json with Some(Json.Array xs) -> xs | _ -> []
    let label (v: string) =
        match v with
        | "rootCause" -> "Root cause" | "contributingFactor" -> "Contributing factor" | "trigger" -> "Trigger" | "enablingCondition" -> "Enabling condition"
        | "proposed" -> "Proposed" | "plausible" -> "Plausible" | "supported" -> "Supported" | "weakened" -> "Weakened" | "falsified" -> "Falsified"
        | "superseded" -> "Superseded" | "confirmed" -> "Confirmed" | "reopened" -> "Reopened" | "" -> "Not recorded" | other -> other
    let target = Path.Combine(fixturesDir, "causa")
    Directory.CreateDirectory target |> ignore
    for inv in Directory.GetDirectories dir |> Array.sort do
        match Json.parseWith { MaxBytes = Int32.MaxValue; MaxDepth = 64 } (File.ReadAllText(Path.Combine(inv, "snapshot.json"))) with
        | Ok snapshot ->
            let state = Json.field "state" snapshot |> Option.defaultValue (Json.Object [])
            let rels = items "relationships" state
            let count h kind = rels |> List.filter (fun r -> str "hypothesisId" r = h && str "kind" r = kind) |> List.length
            let causes = items "causes" state
            let members = causes |> List.collect (fun c -> items "members" c |> List.map (str "hypothesisId")) |> Set.ofList
            let hypotheses =
                items "hypotheses" state
                |> List.filter (fun h -> members.Contains(str "id" h))
                |> List.map (fun h ->
                    let id = str "id" h
                    let state, supports, contradicts = label (str "state" h), count id "supports", count id "contradicts"
                    { Id = "h-" + id; Kind = "task"; Label = str "statement" h; Shape = None; Width = None; Height = None; Status = None
                      Description = Some $"Hypothesis · {state} · {supports} supporting, {contradicts} contradicting evidence" })
            let outcomes =
                causes
                |> List.map (fun c ->
                    let state = label (str "state" c)
                    { Id = "c-" + str "id" c; Kind = "end"; Label = str "outcome" c; Shape = None; Width = None; Height = None; Status = None; Description = Some $"Outcome · causal relationship {state}" })
            let edges = causes |> List.collect (fun c -> items "members" c |> List.map (fun m -> { Source = "h-" + str "hypothesisId" m; Target = "c-" + str "id" c; Label = Some(label (str "role" m)); Direction = None }))
            let title = str "title" state
            let spec = { Title = "Causal analysis: " + title; Direction = "right"; Nodes = hypotheses @ outcomes; Edges = edges; Groups = []; Zoom = 1.0 }
            let id = Path.GetFileName inv
            for vw, zoom, text in [ 1280, 1.0, 100; 375, 1.0, 100; 1280, 0.5, 100; 1280, 1.5, 100; 1280, 1.0, 200 ] do
                let name = $"causa-{id.Substring(0, 8)}-{vw}-z{int (zoom * 100.0)}-t{text}"
                let page = { Cases.desktop with ViewportW = vw; Typography = { Cases.defaultTypography with RootPercent = text } }
                let c =
                    { Id = name; Family = "causa"; Seed = 0UL; Page = page; Subject = DiagramCase { spec with Zoom = zoom }; Script = Corpus.Latin; Note = title }
                let fixture =
                    Json.Object
                        [ "constraint", Json.String "*"
                          "origin", Json.Object [ "source", Json.String $"kemiller2002/causa-data workspaces/demo/historical-v1/investigations/{id}/snapshot.json"; "derivation", Json.String "indy-init-rehearsal-004 src/app/View.fs graphDocument" ]
                          "case", Report.caseJson c
                          "expect", Json.String "fail" ]
                Report.write target (name + ".json") fixture
                printfn "%s: %d nodes, %d edges" name spec.Nodes.Length spec.Edges.Length
        | Error e -> eprintfn "%s: %s" inv e
    0

/// Reproduces the stored Causa diagrams through pinned published packages (the
/// <forma-workflow> WebAssembly runtime in view mode, as the Causa app embeds
/// it) instead of this checkout's engine: `--packages DIR` holds the unpacked
/// design-system and forma-workflow tarballs as DIR/ds/package and DIR/fw/package.
let runPinned (args: string list) =
    let packages = option "--packages" args |> Option.defaultWith (fun () -> failwith "--packages DIR is required") |> Path.GetFullPath
    let out = outDir args
    let work = Path.Combine(packages, "pages")
    Directory.CreateDirectory work |> ignore
    let cases =
        Directory.GetFiles(Path.Combine(fixturesDir, "causa"), "*.json")
        |> Array.sort
        |> Array.choose (fun f -> match Json.parse (File.ReadAllText f) with Ok j -> Json.field "case" j |> Option.map Report.caseOf | Error _ -> None)
        |> List.ofArray
    let page (c: Case) =
        let spec = match c.Subject with DiagramCase d -> d | _ -> failwith "diagram fixture expected"
        let source = Json.serialize (Cases.workflowJson spec) |> fun t -> t.Replace("</", "<\\/")
        let css = [ "tokens.css"; "foundations.css"; "components.css" ] |> List.map (fun f -> $"<link rel=\"stylesheet\" href=\"../ds/package/dist/{f}\">") |> String.concat "\n"
        let html =
            String.concat
                "\n"
                [ "<!doctype html>"; "<html lang=\"en\">"; "<head>"; "<meta charset=\"utf-8\">"; "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
                  "<title>LCE-001 pinned</title>"; css; "<link rel=\"stylesheet\" href=\"../fw/package/dist/forma-workflow.css\">"
                  "<style>html { font-size: " + string c.Page.Typography.RootPercent + "%; } body { margin: 16px; } .ef-workflow-editor__canvas { --ef-workflow-zoom: " + string spec.Zoom + "; }</style>"
                  "<script type=\"module\" src=\"../fw/package/dist/forma-workflow.js\"></script>"; "</head>"; "<body>"
                  "<section data-lc-case=\"" + c.Id + "\"><forma-workflow mode=\"view\"><script type=\"application/json\" class=\"forma-workflow-source\">" + source + "</script></forma-workflow></section>"
                  "</body>"; "</html>"; "" ]
        let file = Path.Combine(work, c.Id + ".html")
        File.WriteAllText(file, html)
        { Measure.File = file; Measure.Setup = c.Page; Measure.Repeat = false; Measure.WaitFor = Some ".ef-workflow-host .ef-diagram__canvas" }
    let (pages, browser), ms = timed (fun () -> Measure.runServed root (Directory.CreateDirectory(out).FullName) (Some packages) (cases |> List.map page))
    let byId = cases |> List.map (fun c -> c.Id, c) |> Map.ofList
    let evaluated =
        pages
        |> List.collect (fun p -> p.Cases |> List.choose (fun mc -> byId |> Map.tryFind mc.Id |> Option.map (fun c -> { Case = c; Page = p; Measured = mc; Findings = Constraints.evaluate c p mc; Static = [] })))
    for e in evaluated do
        let violated = Search.errors e.Findings |> List.map _.Constraint |> List.distinct
        printfn "%s: %d nodes measured; %s" e.Case.Id (e.Measured.Subjects |> List.filter (fun s -> s.Role = "node") |> List.length) (if violated.IsEmpty then "satisfies every constraint" else "violates " + String.Join(", ", violated))
    writeEvaluation out (option "--label" args |> Option.defaultValue "Pinned packages") browser ms evaluated
    0

[<EntryPoint>]
let main argv =
    match List.ofArray argv with
    | "run" :: rest -> runBatch rest
    | "sweeps" :: rest -> runSweeps rest
    | "minimize" :: rest -> runMinimize rest
    | "regress" :: rest -> runRegress rest
    | "causa" :: rest -> runCausa rest
    | "pinned" :: rest -> runPinned rest
    | _ ->
        eprintfn "usage: forma-layout-probe (run [--seed HEX] [--count N] [--families a,b] [--repeat] | sweeps | minimize [--from DIR] | regress | causa --data DIR) [--out DIR]"
        2
