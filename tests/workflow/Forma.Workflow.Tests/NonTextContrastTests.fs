/// R7-REM-009: non-text contrast of authored outlines, accents and connectors
/// (A11Y-NONTEXT-CONTRAST, WCAG 1.4.11) and the status colour tokens.
module NonTextContrastTests

open Harness
open Forma.Workflow

let private str (s: string) = Json.String s
let private obj props = Json.Object props
let private arr items = Json.Array items

let private node id (color: (string * Json) list) =
    obj [ yield "id", str id; yield "kind", str "task"; yield "label", str id
          if not color.IsEmpty then yield "color", obj color ]

/// A two-node, one-edge, one-group document with the given authored colours.
let private doc (nodeColor: (string * Json) list) (edgeColor: (string * Json) list) (groupColor: (string * Json) list) (palette: (string * Json) list) =
    obj [ yield "format", str "forma-workflow"
          yield "formatVersion", str "1.0.0"
          yield "id", str "nontext"
          yield "title", str "Non-text contrast"
          yield "forma", obj [ "version", str "0.4.0" ]
          if not palette.IsEmpty then yield "palette", obj palette
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

/// The non-text findings of a document that decoded (so an empty list is a real pass).
let private nonText (report: ValidationReport) =
    expect report.Workflow.IsSome (sprintf "document did not decode: %A" report.Findings)
    report.Findings |> List.filter (fun f -> f.Code = "A11Y-NONTEXT-CONTRAST")

let private ratio a b = HexColor.contrast (HexColor.create a) (HexColor.create b)

let private statusTokens =
    [ "token:status-warning", StatusWarning, "var(--ef-color-status-warning)"
      "token:status-danger", StatusDanger, "var(--ef-color-status-danger)"
      "token:status-success", StatusSuccess, "var(--ef-color-status-success)"
      "token:status-info", StatusInfo, "var(--ef-color-status-info)" ]

let all =
    [ test "Rehearsal 6 regression: identity amber #e9a23b outline on ivory #f5f3ed is a 1.95:1 non-text contrast error" (fun () ->
          equal "1.95" ((ratio "#e9a23b" "#f5f3ed").ToString("0.00", System.Globalization.CultureInfo.InvariantCulture)) "measured ratio"
          let report = doc [ "fill", str "#f5f3ed"; "stroke", str "#e9a23b" ] [] [] []
          equal SemanticallyInvalid report.Class "class"
          match nonText report with
          | [ f ] ->
              equal Severity.Error f.Severity "severity"
              equal FindingCategory.Accessibility f.Category "category"
              equal "/nodes/0/color/stroke" f.Pointer "pointer"
              equal (Some "cause") f.Subject "subject"
              equal "Stroke colour #e9a23b on fill #f5f3ed has contrast 1.95:1; non-text indicators need at least 3:1 (WCAG 1.4.11)." f.Message "message"
          | other -> fail (sprintf "expected one A11Y-NONTEXT-CONTRAST finding, got %A" other))

      test "The corrected Causa derived indicator #9e6410 on #f5f3ed (4.42:1) passes" (fun () ->
          equal "4.42" ((ratio "#9e6410" "#f5f3ed").ToString("0.00", System.Globalization.CultureInfo.InvariantCulture)) "measured ratio"
          let report = doc [ "fill", str "#f5f3ed"; "stroke", str "#9e6410"; "accent", str "#9e6410" ] [] [] []
          equal [] (nonText report) "findings"
          expect (Validation.isValid report) (sprintf "%A" report.Findings))

      test "An accent below 3:1 against its fill is a non-text contrast error, independent of the stroke" (fun () ->
          let report = doc [ "fill", str "#f5f3ed"; "stroke", str "#3a403c"; "accent", str "#e9a23b" ] [] [] []
          match nonText report with
          | [ f ] ->
              equal "/nodes/0/color/accent" f.Pointer "pointer"
              expect (f.Message.StartsWith "Accent colour #e9a23b on fill #f5f3ed has contrast 1.95:1") f.Message
          | other -> fail (sprintf "expected one accent finding, got %A" other))

      test "Group outlines are judged like node outlines" (fun () ->
          let report = doc [] [] [ "fill", str "#ffffff"; "stroke", str "#cccccc" ] []
          match nonText report with
          | [ f ] -> equal "/groups/0/color/stroke" f.Pointer "pointer"
          | other -> fail (sprintf "expected one group finding, got %A" other))

      test "An edge stroke below 3:1 against the diagram surface is a non-text contrast error" (fun () ->
          let report = doc [] [ "stroke", str "#e9a23b" ] [] []
          match nonText report with
          | [ f ] ->
              equal "/edges/0/color/stroke" f.Pointer "pointer"
              equal (Some "link") f.Subject "subject"
              expect (f.Message.StartsWith "Edge colour #e9a23b on the diagram surface #f2efe7 has contrast") f.Message
          | other -> fail (sprintf "expected one edge finding, got %A" other)
          equal [] (nonText (doc [] [ "stroke", str "#3a403c" ] [] [])) "dark edge passes")

      test "Without an authored fill the outline is judged against Forma's light surface-primary #f2efe7" (fun () ->
          equal "#f2efe7" Validation.defaultSurface.Value "default surface"
          match nonText (doc [ "stroke", str "#e9a23b" ] [] [] []) with
          | [ f ] ->
              let shown = (ratio "#e9a23b" "#f2efe7").ToString("0.00", System.Globalization.CultureInfo.InvariantCulture)
              equal $"Stroke colour #e9a23b on the default surface #f2efe7 has contrast {shown}:1; non-text indicators need at least 3:1 (WCAG 1.4.11)." f.Message "message"
          | other -> fail (sprintf "expected one default-fill finding, got %A" other)
          equal [] (nonText (doc [ "stroke", str "#9e6410" ] [] [] [])) "derived indicator passes on the default surface")

      test "Palette slots holding literals are resolved; token values are not judged by the document rule" (fun () ->
          match nonText (doc [ "fill", str "#f5f3ed"; "stroke", str "palette:identity" ] [] [] [ "identity", str "#e9a23b" ]) with
          | [ f ] -> expect (f.Message.StartsWith "Stroke colour #e9a23b") f.Message
          | other -> fail (sprintf "expected one palette finding, got %A" other)
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
              expect (contract.Contains("\"" + property + "\"")) $"diagram-presentation.json omits {property}") ]
