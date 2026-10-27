namespace Forma.Layout.Probe

open System
open System.IO
open Forma.Workflow

/// Machine-readable findings, summaries and the fixture codec that keeps
/// minimised failures as permanent regression inputs (Section 16).
[<RequireQualifiedAccess>]
module Report =
    let private s (v: string) = Json.String v
    let private n (v: float) = Json.number v
    let private field = Json.field
    let private str name json = match field name json with Some(Json.String v) -> v | _ -> ""
    let private num name json = field name json |> Option.bind Json.tryFloat
    let private items name json = match field name json with Some(Json.Array xs) -> xs | _ -> []

    let finding (f: Violation) =
        Json.Object
            [ "case", s f.Case; "family", s f.Family; "seed", s f.Seed; "component", s f.Component; "subject", s f.Subject
              "constraint", s f.Constraint; "severity", s f.Severity; "expected", s f.Expected; "observed", s f.Observed
              "excess", n f.Excess; "viewport", s f.Viewport; "typography", s f.Typography; "styles", s f.Styles; "note", s f.Note ]

    // ---- Case codec -------------------------------------------------------------

    let private sidesJson (x: Sides) = Json.Array [ n x.Top; n x.Right; n x.Bottom; n x.Left ]
    let private sidesOf json = match json with Json.Array [ t; r; b; l ] -> LayoutGeometry.sides (Json.tryFloat t |> Option.defaultValue 0.0) (Json.tryFloat r |> Option.defaultValue 0.0) (Json.tryFloat b |> Option.defaultValue 0.0) (Json.tryFloat l |> Option.defaultValue 0.0) | _ -> LayoutGeometry.noSides

    let private probeJson (p: Probe) =
        Json.Object
            [ yield "width", n p.Width
              match p.Height with Some h -> yield "height", n h | None -> ()
              yield "padding", sidesJson p.Padding
              yield "border", n p.Border
              yield "radius", s p.Radius
              yield "text", s p.Text
              yield "center", Json.Bool p.Center ]

    let private probeOf json =
        { Width = num "width" json |> Option.defaultValue 200.0
          Height = num "height" json
          Padding = field "padding" json |> Option.map sidesOf |> Option.defaultValue LayoutGeometry.noSides
          Border = num "border" json |> Option.defaultValue 0.0
          Radius = str "radius" json
          Text = str "text" json
          Center = field "center" json = Some(Json.Bool true) }

    let private components = [ Card; Badge; Button; Alert; MetricCard; Callout; WizardStep; TooltipTrigger ]

    let rec subjectJson (x: Subject) =
        match x with
        | ComponentCase(c, t, r, w) -> Json.Object [ "type", s "component"; "component", s (Cases.componentName c); "text", s t; "radius", s r; "hostWidth", n w ]
        | ProbeCase p -> Json.Object [ "type", s "probe"; "probe", probeJson p ]
        | DiagramCase d -> Json.Object [ "type", s "diagram"; "zoom", n d.Zoom; "workflow", Cases.workflowJson d ]
        | Nested(h, inner) ->
            let host = match h with CardHost r -> Json.Object [ "card", s r ] | ProbeHost p -> Json.Object [ "probe", probeJson p ]
            Json.Object [ "type", s "nested"; "host", host; "inner", subjectJson inner ]

    let private diagramOf (zoom: float) (w: Json) =
        let opt name json = match field name json with Some(Json.String v) -> Some v | _ -> None
        { Title = str "title" w
          Direction = (match field "layout" w |> Option.bind (field "direction") with Some(Json.String d) -> d | _ -> "right")
          Nodes =
            items "nodes" w
            |> List.map (fun nd ->
                let layout = field "layout" nd |> Option.defaultValue (Json.Object [])
                { Id = str "id" nd; Kind = str "kind" nd; Label = str "label" nd; Description = opt "description" nd; Shape = opt "variant" nd
                  Width = num "width" layout; Height = num "height" layout
                  Status = field "status" nd |> Option.bind (opt "state") })
          Edges =
            items "edges" w
            |> List.map (fun e ->
                { Source = field "source" e |> Option.map (str "node") |> Option.defaultValue ""
                  Target = field "target" e |> Option.map (str "node") |> Option.defaultValue ""
                  Label = opt "label" e
                  Direction = opt "direction" e })
          Groups =
            items "groups" w
            |> List.map (fun g -> { GroupId = str "id" g; GroupKind = str "kind" g; GroupLabel = str "label" g; Members = items "members" g |> List.choose (function Json.String m -> Some m | _ -> None) })
          Zoom = zoom }

    let rec subjectOf (json: Json) : Subject =
        match str "type" json with
        | "component" ->
            let c = components |> List.find (fun c -> Cases.componentName c = str "component" json)
            ComponentCase(c, str "text" json, str "radius" json, num "hostWidth" json |> Option.defaultValue 600.0)
        | "probe" -> ProbeCase(field "probe" json |> Option.map probeOf |> Option.defaultValue (probeOf (Json.Object [])))
        | "diagram" -> DiagramCase(diagramOf (num "zoom" json |> Option.defaultValue 1.0) (field "workflow" json |> Option.defaultValue (Json.Object [])))
        | "nested" ->
            let host = field "host" json |> Option.defaultValue (Json.Object [])
            let h = match field "card" host, field "probe" host with Some(Json.String r), _ -> CardHost r | _, Some p -> ProbeHost(probeOf p) | _ -> CardHost "0px"
            Nested(h, field "inner" json |> Option.map subjectOf |> Option.defaultValue (ProbeCase(probeOf (Json.Object []))))
        | other -> failwithf "unknown subject type %s" other

    let private scripts = [ Corpus.Latin; Corpus.Accented; Corpus.Cjk; Corpus.Hebrew; Corpus.Arabic; Corpus.Emoji; Corpus.Combining ]

    let caseJson (c: Case) =
        let t = c.Page.Typography
        Json.Object
            [ "id", s c.Id; "family", s c.Family; "seed", s (Seed.text c.Seed); "note", s c.Note; "script", s (Corpus.scriptName c.Script)
              "page",
              Json.Object
                  [ yield "viewport", Json.Array [ n (float c.Page.ViewportW); n (float c.Page.ViewportH) ]
                    yield "rootPercent", n (float t.RootPercent)
                    yield "letterSpacingEm", n t.LetterSpacingEm
                    match t.LineHeight with Some lh -> yield "lineHeight", n lh | None -> ()
                    yield "weight", n (float t.Weight) ]
              "subject", subjectJson c.Subject ]

    let caseOf (json: Json) : Case =
        let page = field "page" json |> Option.defaultValue (Json.Object [])
        let vw, vh = match field "viewport" page with Some(Json.Array [ w; h ]) -> (Json.tryInt w |> Option.defaultValue 1280), (Json.tryInt h |> Option.defaultValue 900) | _ -> 1280, 900
        { Id = str "id" json
          Family = str "family" json
          Seed = (let v = str "seed" json in if v = "" then 0UL else Seed.parse v)
          Page =
            { ViewportW = vw
              ViewportH = vh
              Typography =
                { RootPercent = num "rootPercent" page |> Option.map int |> Option.defaultValue 100
                  LetterSpacingEm = num "letterSpacingEm" page |> Option.defaultValue 0.0
                  LineHeight = num "lineHeight" page
                  Weight = num "weight" page |> Option.map int |> Option.defaultValue 400 } }
          Subject = field "subject" json |> Option.map subjectOf |> Option.defaultValue (ProbeCase(probeOf (Json.Object [])))
          Script = scripts |> List.tryFind (fun x -> Corpus.scriptName x = str "script" json) |> Option.defaultValue Corpus.Latin
          Note = str "note" json }

    // ---- Summaries ----------------------------------------------------------------

    type Summary =
        { Label: string
          Cases: int
          Families: (string * int * int) list
          Constraints: (string * int * int) list
          Severities: (string * int) list
          Fonts: (string * bool) list
          /// Diagram cases: (rendered error and static issue, rendered error only, static issue only, neither).
          StaticAgreement: int * int * int * int
          RenderMs: int
          TotalMs: int64
          Browser: string }

    let summarize (label: string) (browser: string) (elapsedMs: int64) (evaluated: Evaluated list) =
        let failingCase (sev: string) (e: Evaluated) = e.Findings |> List.exists (fun f -> f.Severity = sev)
        let all = evaluated |> List.collect _.Findings
        { Label = label
          Cases = evaluated.Length
          Families =
            evaluated
            |> List.groupBy _.Case.Family
            |> List.map (fun (fam, es) -> fam, es.Length, es |> List.filter (failingCase "error") |> List.length)
          Constraints =
            Constraints.catalog
            |> List.map fst
            |> List.map (fun cid ->
                let fs = all |> List.filter (fun f -> f.Constraint = cid)
                cid, fs.Length, fs |> List.map _.Case |> List.distinct |> List.length)
          Severities = all |> List.countBy _.Severity
          Fonts = evaluated |> List.collect _.Page.Fonts |> List.distinct
          StaticAgreement =
            let diagrams = evaluated |> List.filter (fun e -> (Cases.subjectName e.Case.Subject).EndsWith "diagram")
            let rendered (e: Evaluated) = e.Findings |> List.exists (fun f -> f.Severity = "error")
            let predicted (e: Evaluated) = not e.Static.IsEmpty
            let count p = diagrams |> List.filter p |> List.length
            count (fun e -> rendered e && predicted e), count (fun e -> rendered e && not (predicted e)), count (fun e -> predicted e && not (rendered e)), count (fun e -> not (rendered e) && not (predicted e))
          RenderMs = evaluated |> List.map _.Page |> List.distinctBy _.File |> List.sumBy _.Ms
          TotalMs = elapsedMs
          Browser = browser }

    let summaryJson (x: Summary) =
        Json.Object
            [ "label", s x.Label
              "browser", s x.Browser
              "cases", n (float x.Cases)
              "renderMs", n (float x.RenderMs)
              "totalMs", n (float x.TotalMs)
              "fonts", Json.Object(x.Fonts |> List.map (fun (k, v) -> k, Json.Bool v))
              "families", Json.Array(x.Families |> List.map (fun (f, c, e) -> Json.Object [ "family", s f; "cases", n (float c); "casesWithErrors", n (float e) ]))
              "constraints", Json.Array(x.Constraints |> List.map (fun (c, f, k) -> Json.Object [ "constraint", s c; "findings", n (float f); "cases", n (float k) ]))
              "severities", Json.Object(x.Severities |> List.map (fun (k, v) -> k, n (float v)))
              "staticAgreement",
              (let both, renderedOnly, staticOnly, neither = x.StaticAgreement
               Json.Object [ "renderedAndStatic", n (float both); "renderedOnly", n (float renderedOnly); "staticOnly", n (float staticOnly); "neither", n (float neither) ]) ]

    let summaryMarkdown (x: Summary) =
        [ yield $"## {x.Label}"
          yield ""
          yield $"{x.Cases} cases; browser rendering {x.RenderMs} ms; end to end {x.TotalMs} ms; Chromium {x.Browser}."
          yield ""
          yield "| family | cases | cases with an error |"
          yield "|---|---:|---:|"
          for f, c, e in x.Families -> $"| {f} | {c} | {e} |"
          yield ""
          yield "| constraint | findings | cases |"
          yield "|---|---:|---:|"
          for c, f, k in x.Constraints -> $"| `{c}` | {f} | {k} |"
          yield ""
          let both, renderedOnly, staticOnly, neither = x.StaticAgreement
          yield $"Diagram cases, static LayoutCheck against rendered errors: both {both}, rendered only {renderedOnly}, static only {staticOnly}, neither {neither}."
          yield ""
          let rendered (k: string, v: bool) = k + (if v then " yes" else " NO")
          yield "Fonts rendered: " + String.Join(", ", x.Fonts |> List.map rendered) ]
        |> String.concat "\n"

    let write (dir: string) (name: string) (json: Json) =
        Directory.CreateDirectory dir |> ignore
        File.WriteAllText(Path.Combine(dir, name), Json.serialize json + "\n")
