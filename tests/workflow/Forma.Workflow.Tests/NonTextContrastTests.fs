/// R7-REM-009: non-text contrast of authored outlines, accents and connectors
/// (A11Y-NONTEXT-CONTRAST, WCAG 1.4.11) and the status colour tokens.
module NonTextContrastTests

open System
open System.IO
open Harness
open Forma.Workflow

let private str (s: string) = Json.String s
let private obj props = Json.Object props
let private arr items = Json.Array items

let private node id (color: (string * Json) list) =
    obj [ yield "id", str id; yield "kind", str "task"; yield "label", str id
          if not color.IsEmpty then yield "color", obj color ]

/// A two-node, one-edge, one-group document with the given authored colours
/// and an optional legend entry.
let private docWith (nodeColor: (string * Json) list) (edgeColor: (string * Json) list) (groupColor: (string * Json) list) (palette: (string * Json) list) (legendColor: (string * Json) list) =
    obj [ yield "format", str "forma-workflow"
          yield "formatVersion", str "1.0.0"
          yield "id", str "nontext"
          yield "title", str "Non-text contrast"
          yield "forma", obj [ "version", str "0.4.0" ]
          if not palette.IsEmpty then yield "palette", obj palette
          if not legendColor.IsEmpty then
              yield "presentation", obj [ "legend", arr [ obj [ "id", str "tone"; "label", str "Open"; "color", obj legendColor ] ] ]
          yield "nodes", arr [ node "cause" nodeColor; node "effect" [] ]
          yield "edges", arr [ obj [ yield "id", str "link"
                                     yield "source", obj [ "node", str "cause" ]
                                     yield "target", obj [ "node", str "effect" ]
                                     if not edgeColor.IsEmpty then yield "color", obj edgeColor ] ]
          yield "groups", arr [ obj [ yield "id", str "cluster"; yield "kind", str "group"; yield "label", str "Cluster"
                                      yield "members", arr [ str "cause"; str "effect" ]
                                      if not groupColor.IsEmpty then yield "color", obj groupColor ] ] ]
    |> Json.serialize
    |> Validation.load

let private doc nodeColor edgeColor groupColor palette = docWith nodeColor edgeColor groupColor palette []

/// The non-text findings of a document that decoded (so an empty list is a real pass).
let private nonText (report: ValidationReport) =
    expect report.Workflow.IsSome (sprintf "document did not decode: %A" report.Findings)
    report.Findings |> List.filter (fun f -> f.Code = "A11Y-NONTEXT-CONTRAST")

let private ratio a b = HexColor.contrast (HexColor.create a) (HexColor.create b)
let private shown (r: float) = r.ToString("0.00", Globalization.CultureInfo.InvariantCulture)
let private amberOnLight = shown (ratio "#e9a23b" "#f2efe7")

let private single label (findings: Finding list) =
    match findings with
    | [ f ] -> f
    | other -> fail (sprintf "%s: expected one A11Y-NONTEXT-CONTRAST finding, got %A" label (other |> List.map (fun f -> f.Pointer, f.Message)))

let private statusTokens =
    [ "token:status-warning", StatusWarning, "var(--ef-color-status-warning)"
      "token:status-danger", StatusDanger, "var(--ef-color-status-danger)"
      "token:status-success", StatusSuccess, "var(--ef-color-status-success)"
      "token:status-info", StatusInfo, "var(--ef-color-status-info)" ]

// -- the real pipeline, shared with tests/browser/diagram-nontext-contrast.spec.mjs --

let private pipelineDir = [ "tests"; "fixtures"; "workflow-nontext" ]

/// Golden outputs of the real validator and renderer for the browser test;
/// regenerate with FORMA_UPDATE_GOLDEN=1.
let private pipelineGolden (name: string) (actual: string) =
    let file = path (pipelineDir @ [ name ])
    if Environment.GetEnvironmentVariable "FORMA_UPDATE_GOLDEN" = "1" then File.WriteAllText(file, actual)
    expect (File.Exists file) $"golden file {name} is missing (run with FORMA_UPDATE_GOLDEN=1)"
    equal (File.ReadAllText file) actual $"golden {name}"

let private pipeline (id: string) =
    let report = Validation.load (readText (pipelineDir @ [ id + Format.suffix ]))
    let w = report.Workflow |> Option.defaultWith (fun () -> fail (sprintf "%s did not decode: %A" id report.Findings))
    report, (WorkflowDocument.document DocumentOptions.defaults w).Html

let all =
    [ test "Rehearsal 6 regression: identity amber #e9a23b outline on ivory #f5f3ed is a 1.95:1 non-text contrast error" (fun () ->
          equal "1.95" (shown (ratio "#e9a23b" "#f5f3ed")) "measured ratio"
          let report = doc [ "fill", str "#f5f3ed"; "stroke", str "#e9a23b" ] [] [] []
          equal SemanticallyInvalid report.Class "class"
          let f = single "R6" (nonText report)
          equal Severity.Error f.Severity "severity"
          equal FindingCategory.Accessibility f.Category "category"
          equal "/nodes/0/color/stroke" f.Pointer "pointer"
          equal (Some "cause") f.Subject "subject"
          equal "Stroke colour #e9a23b on fill #f5f3ed has contrast 1.95:1, and neither reaches 3:1 against the light surface #f2efe7, so the shape has no perceivable boundary; non-text indicators need at least 3:1 (WCAG 1.4.11)." f.Message "message")

      test "The corrected Causa derived indicator #9e6410 on #f5f3ed (4.42:1) passes" (fun () ->
          equal "4.42" (shown (ratio "#9e6410" "#f5f3ed")) "measured ratio"
          let report = doc [ "fill", str "#f5f3ed"; "stroke", str "#9e6410"; "accent", str "#9e6410" ] [] [] []
          equal [] (nonText report) "findings"
          expect (Validation.isValid report) (sprintf "%A" report.Findings))

      test "A borderless filled node validates: its fill is the boundary where it stands out from the surface" (fun () ->
          // Reviewer case: stroke = fill = #3a403c is 1.00:1, but the fill is 9.24:1 on the light surface.
          let light = single "borderless #3a403c" (nonText (doc [ "fill", str "#3a403c"; "stroke", str "#3a403c" ] [] [] []))
          // ... which leaves it 1.65:1 on the dark surface: that, not the light case, is reported.
          expect (light.Message.Contains "the dark surface #171a18") light.Message
          expect (not (light.Message.Contains "light surface")) light.Message
          // A fill that stands out on both default surfaces validates however its stroke is set.
          for fill in [ "#6b7280"; "#7a6f5a" ] do
              let report = doc [ "fill", str fill; "stroke", str fill ] [] [] []
              equal [] (nonText report) fill
          // A stroke matching a pale fill still fails when neither stands out on the light surface.
          let pale = single "pale" (nonText (doc [ "fill", str "#f5f3ed"; "stroke", str "#f5f3ed" ] [] [] []))
          expect (pale.Message.Contains "light surface #f2efe7") pale.Message)

      test "An accent below 3:1 against its fill is an error even when the boundary is perceivable" (fun () ->
          let f = single "accent" (nonText (doc [ "fill", str "#f5f3ed"; "stroke", str "#3a403c"; "accent", str "#e9a23b" ] [] [] []))
          equal "/nodes/0/color/accent" f.Pointer "pointer"
          equal "Accent colour #e9a23b on fill #f5f3ed has contrast 1.95:1; non-text indicators need at least 3:1 (WCAG 1.4.11)." f.Message "message"
          // Strict: a dark accent on a dark fill fails although the fill stands out on the light surface.
          let dark = single "dark accent" (nonText (doc [ "fill", str "#14283f"; "stroke", str "#ffffff"; "accent", str "#3a403c" ] [] [] []))
          equal "/nodes/0/color/accent" dark.Pointer "dark accent pointer")

      test "Group outlines are judged like node outlines" (fun () ->
          let f = single "group" (nonText (doc [] [] [ "fill", str "#ffffff"; "stroke", str "#cccccc" ] []))
          equal "/groups/0/color/stroke" f.Pointer "pointer")

      test "An edge stroke below 3:1 against the light or the dark surface is an error naming the theme" (fun () ->
          let amber = single "amber edge" (nonText (doc [] [ "stroke", str "#e9a23b" ] [] []))
          equal "/edges/0/color/stroke" amber.Pointer "pointer"
          equal (Some "link") amber.Subject "subject"
          equal $"Edge colour #e9a23b on the light surface #f2efe7 has contrast {amberOnLight}:1; non-text indicators need at least 3:1 (WCAG 1.4.11)." amber.Message "amber message"
          let dark = single "dark edge" (nonText (doc [] [ "stroke", str "#3a403c" ] [] []))
          equal "Edge colour #3a403c on the dark surface #171a18 has contrast 1.65:1; non-text indicators need at least 3:1 (WCAG 1.4.11)." dark.Message "dark message"
          equal [] (nonText (doc [] [ "stroke", str "#6b7280" ] [] [])) "mid-tone edge passes on both surfaces")

      test "Without an authored fill an outline is judged against both default surfaces, the worst reported" (fun () ->
          equal "#f2efe7" Validation.defaultSurface.Value "default surface"
          equal [ "light", "#f2efe7"; "dark", "#171a18" ] (Validation.defaultSurfaces |> List.map (fun (t, h) -> t, h.Value)) "default surfaces"
          let amber = single "amber" (nonText (doc [ "stroke", str "#e9a23b" ] [] [] []))
          equal $"Stroke colour #e9a23b on the light surface #f2efe7 has contrast {amberOnLight}:1; non-text indicators need at least 3:1 (WCAG 1.4.11)." amber.Message "light message"
          // Rehearsal reviewer: #3a403c passes on light (9.24:1) but is 1.65:1 under prefers-color-scheme: dark.
          let dark = single "dark" (nonText (doc [ "stroke", str "#3a403c" ] [] [] []))
          equal "/nodes/0/color/stroke" dark.Pointer "pointer"
          equal "Stroke colour #3a403c on the dark surface #171a18 has contrast 1.65:1; non-text indicators need at least 3:1 (WCAG 1.4.11)." dark.Message "dark message"
          equal [] (nonText (doc [ "stroke", str "#9e6410" ] [] [] [])) "derived indicator passes on both default surfaces")

      test "Legend swatches are judged against the default surfaces (Rehearsal 6 palette:amber legend)" (fun () ->
          let f = single "legend" (nonText (docWith [] [] [] [ "amber", str "#e9a23b" ] [ "stroke", str "palette:amber" ]))
          equal "/presentation/legend/0/color/stroke" f.Pointer "pointer"
          equal (Some "tone") f.Subject "subject"
          expect (f.Message.StartsWith "Stroke colour #e9a23b on the light surface #f2efe7 has contrast 1.88:1") f.Message
          let accent = single "legend accent" (nonText (docWith [] [] [] [] [ "accent", str "#3a403c" ]))
          expect (accent.Message.Contains "the dark surface #171a18") accent.Message
          equal [] (nonText (docWith [] [] [] [] [ "stroke", str "token:status-warning" ])) "token legend")

      test "Palette slots holding literals are resolved; token values and token/literal mixes are not judged" (fun () ->
          let f = single "palette" (nonText (doc [ "fill", str "#f5f3ed"; "stroke", str "palette:identity" ] [] [] [ "identity", str "#e9a23b" ]))
          expect (f.Message.StartsWith "Stroke colour #e9a23b") f.Message
          for token, _, _ in statusTokens @ [ "token:border-subtle", BorderSubtle, "" ] do
              equal [] (nonText (doc [ "fill", str "#f5f3ed"; "stroke", str token; "accent", str token ] [ "stroke", str token ] [ "stroke", str token ] [])) token
              equal [] (nonText (doc [ "fill", str "#f5f3ed"; "stroke", str "palette:p" ] [] [] [ "p", str token ])) ("palette " + token)
          // An authored but unresolvable fill leaves the pair undecided.
          equal [] (nonText (doc [ "fill", str "token:surface-secondary"; "stroke", str "#e9a23b" ] [] [] [])) "token fill")

      test "Status tokens round-trip through the codec and render to the Forma status custom properties" (fun () ->
          for text, token, css in statusTokens do
              equal (Ok(TokenColor token)) (Codec.colorValue "colour" (Json.String text)) text
              equal css (Render.tokenVar token) text
              let report = doc [ "stroke", str text; "accent", str text ] [ "stroke", str text ] [ "stroke", str text ] [ "attention", str text ]
              expect (Validation.isValid report) (sprintf "%s: %A" text report.Findings)
              let w = Option.get report.Workflow
              equal (Some(TokenColor token)) w.Nodes[0].Color.Stroke $"{text}: decoded"
              let again = Validation.load (Codec.serialize w)
              equal (Some w) again.Workflow $"{text}: round trip"
              expect ((Codec.serialize w).Contains("\"" + text + "\"")) $"{text}: serialized"
              let html = (WorkflowDocument.fragment DocumentOptions.defaults w).Html
              expect (html.Contains("--ef-diagram-stroke:" + css) || html.Contains("--ef-diagram-stroke: " + css)) $"{text}: node stroke not rendered as {css}"
              expect (html.Contains("--ef-diagram-connector-stroke:" + css) || html.Contains("--ef-diagram-connector-stroke: " + css)) $"{text}: edge stroke not rendered as {css}")

      test "The schema, the diagram presentation contract and the codec agree on the token vocabulary" (fun () ->
          let schema = readText [ "schemas"; "workflow"; "1.0"; "forma-workflow.schema.json" ]
          let contract = readText [ "contracts"; "diagram-presentation.json" ]
          for text, _ in Codec.tokens do
              expect (schema.Contains("\"" + text + "\"")) $"schema omits {text}"
              let property = "--ef-color-" + text.Substring("token:".Length)
              expect (contract.Contains("\"" + property + "\"")) $"diagram-presentation.json omits {property}")

      test "Browser pipeline fixtures: the validator and renderer outputs the browser test measures are current" (fun () ->
          let report, html = pipeline "status-outlines"
          expect (Validation.isValid report) (sprintf "status-outlines: %A" report.Findings)
          equal [] (nonText report) "status-outlines findings"
          expect (html.Contains "var(--ef-color-status-warning)" && html.Contains "data-ef-shape=\"diamond\"") "status-outlines render"
          pipelineGolden "status-outlines.document.html" html
          let regression, regressionHtml = pipeline "r6-regression"
          let findings = nonText regression
          equal [ "/nodes/0/color/stroke"; "/nodes/1/color/stroke"; "/nodes/1/color/accent" ] (findings |> List.map _.Pointer) "r6 pointers"
          expect (findings |> List.forall (fun f -> f.Message.Contains "1.95:1")) (sprintf "%A" findings)
          pipelineGolden "r6-regression.document.html" regressionHtml
          pipelineGolden "r6-regression.findings.txt" (findings |> List.map (fun f -> $"{f.Code} {f.Pointer} {f.Message}\n") |> String.concat "")) ]
