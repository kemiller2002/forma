/// Layout constraints (LCE-001): shape geometry, the text estimate, the
/// shape-aware layout and static layout validation. The browser-measured
/// counterpart is tests/layout (forma-layout-probe).
module LayoutTests

open System
open Harness
open Forma.Workflow

let private box x y w h : Rect = { X = x; Y = y; W = w; H = h }
let private str (s: string) = Json.String s

/// A workflow document from (id, kind, label, variant, width, height) nodes and (source, target, label) edges.
let private doc (direction: string) (nodes: (string * string * string * string option * float option * float option) list) (edges: (string * string * string option) list) =
    let node (id, kind, label, variant, width, height) =
        Json.Object(
            [ yield "id", str id
              yield "kind", str kind
              yield "label", str label
              match variant with Some v -> yield "variant", str v | None -> ()
              let size =
                  [ yield! width |> Option.map (fun w -> "width", Json.number w) |> Option.toList
                    yield! height |> Option.map (fun h -> "height", Json.number h) |> Option.toList ]
              if not size.IsEmpty then yield "layout", Json.Object size ]
        )
    let edge i (s, t, label) =
        Json.Object(
            [ yield "id", str $"e{i}"
              yield "source", Json.Object [ "node", str s ]
              yield "target", Json.Object [ "node", str t ]
              match label with Some l -> yield "label", str l | None -> () ]
        )
    let json =
        Json.Object
            [ "format", str "forma-workflow"; "formatVersion", str "1.0.0"; "id", str "layout-test"; "title", str "Layout test"
              "forma", Json.Object [ "version", str "0.9.0" ]; "layout", Json.Object [ "direction", str direction ]
              "nodes", Json.Array(nodes |> List.map node); "edges", Json.Array(edges |> List.mapi edge) ]
    let report = Validation.load (Json.serialize json)
    match report.Workflow with
    | Some w when Validation.isValid report -> w
    | _ -> fail (sprintf "test document invalid: %A" report.Findings)

let private paragraph = "Counter interrupts from the rendezvous radar coupling data units stole computer capacity, and the executive raised a program alarm each time its queue overflowed."
let private texts = [ "A"; "Root cause"; paragraph; String.replicate 3 paragraph; "Pneumonoultramicroscopicsilicovolcanoconiosis_and_more"; "原因分析の結果として酸素環境下での電気的故障"; "ניתוח שורש הבעיה הראה כשל"; "🚀 Launch ✅ Verified 🧑‍🚀 Crew"; "https://www.example.com/a/very/long/path?with=query" ]
let private kinds = [ "task"; "start"; "end"; "decision"; "event"; "subprocess" ]

/// A deterministic family of graphs: every shape, every text class, fan-in with labels.
let private graphs =
    [ for dir in [ "right"; "down" ] do
          for i, t in List.indexed texts ->
              let nodes = [ for j, k in List.indexed kinds -> $"n{j}", k, (if j % 2 = 0 then t else texts[(i + j) % texts.Length]), None, None, None ]
              let edges = [ for j in 1 .. kinds.Length - 1 -> $"n{j - 1}", $"n{j}", Some(if j % 2 = 0 then "contributing factor" else "yes") ] @ [ "n0", "n5", Some "root cause"; "n1", "n5", None ]
              doc dir nodes edges ]

let private pairs xs = [ for i, a in List.indexed xs do for b in List.skip (i + 1) xs -> a, b ]

let all =
    [ test "Geometry: CSS radius normalisation makes a 999px radius half the shorter side" (fun () ->
          match LayoutGeometry.roundedBox (box 0.0 0.0 200.0 80.0) (LayoutGeometry.uniformCorners (LayoutGeometry.circular 999.0)) with
          | RoundedBox(_, c) -> equal 40.0 (Math.Round(c.TopLeft.Rx, 6)) "rx"; equal 40.0 (Math.Round(c.BottomRight.Ry, 6)) "ry"
          | other -> fail $"{other}")

      test "Geometry: a point inside the bounding box can be outside a rounded corner" (fun () ->
          let b = LayoutGeometry.roundedBox (box 0.0 0.0 100.0 100.0) (LayoutGeometry.uniformCorners (LayoutGeometry.circular 40.0))
          expect (LayoutGeometry.excess b { X = 2.0; Y = 2.0 } > 10.0) "corner point outside the curve"
          equal 0.0 (LayoutGeometry.excess b { X = 50.0; Y = 1.0 }) "edge midpoint inside"
          equal 0.0 (LayoutGeometry.rectExcess b (box 20.0 20.0 60.0 60.0)) "inscribed content inside")

      test "Geometry: the inner boundary loses the border from each radius" (fun () ->
          match LayoutGeometry.inset (LayoutGeometry.sides 2.0 2.0 2.0 6.0) (LayoutGeometry.roundedBox (box 0.0 0.0 100.0 100.0) (LayoutGeometry.uniformCorners (LayoutGeometry.circular 10.0))) with
          | RoundedBox(r, c) ->
              equal (box 6.0 2.0 92.0 96.0) r "rect"
              equal { Rx = 4.0; Ry = 8.0 } c.TopLeft "elliptical inner corner on the accent side"
          | other -> fail $"{other}")

      test "Geometry: the inscribed square of a circle has side r·√2, of a diamond half its side" (fun () ->
          let circle = LayoutGeometry.roundedBox (box 0.0 0.0 100.0 100.0) (LayoutGeometry.uniformCorners (LayoutGeometry.circular 50.0))
          expect (abs ((LayoutGeometry.inscribed 1.0 circle).W - 70.71) < 0.1) "circle"
          let diamond = RotatedBox(box 14.645 14.645 70.71 70.71, 45.0)
          expect (abs ((LayoutGeometry.inscribed 1.0 diamond).W - 50.0) < 0.1) "diamond")

      test "Geometry: segment crossing ignores segments that only touch an edge" (fun () ->
          let r = box 10.0 10.0 20.0 20.0
          expect (LayoutGeometry.segmentCrosses r { X = 0.0; Y = 20.0 } { X = 40.0; Y = 20.0 }) "through"
          expect (not (LayoutGeometry.segmentCrosses r { X = 0.0; Y = 5.0 } { X = 40.0; Y = 5.0 })) "above"
          expect (not (LayoutGeometry.segmentCrosses r { X = 30.0; Y = 0.0 } { X = 30.0; Y = 40.0 })) "along the right edge")

      test "Geometry: the safe inline padding grows with the radius and is the clearance when corners do not reach" (fun () ->
          let pads = [ 0.0 .. 4.0 .. 96.0 ] |> List.map (fun r -> LayoutGeometry.safeInlinePadding (LayoutGeometry.circular r) 12.0 2.0)
          expect (pads |> List.pairwise |> List.forall (fun (a, b) -> b >= a - 1e-9)) "monotone in radius"
          equal 2.0 (LayoutGeometry.safeInlinePadding (LayoutGeometry.circular 12.0) 12.0 2.0) "corner above the content")

      test "Geometry: Forma's radius caps keep the content box clear of the corner" (fun () ->
          // pi + pb·(1 + √2) - c·(1 + √2) + b, the bound in components.css (pill) and marketing/components.css.
          for pi, pb, border, c in [ 24.0, 12.0, 2.0, 4.0; 8.0, 4.0, 1.0, 1.0; 24.0, 12.0, 1.0, 1.0; 24.0, 24.0, 1.0, 1.0; 43.0, 43.0, 1.0, 1.0 ] do
              let r = pi + pb * 2.414 - c * 2.414 + (if c = 4.0 then border else 0.0)
              let outer = LayoutGeometry.roundedBox (box 0.0 0.0 400.0 400.0) (LayoutGeometry.uniformCorners (LayoutGeometry.circular r))
              let inner = outer |> LayoutGeometry.inset (LayoutGeometry.even border)
              let content = box (border + pi) (border + pb) (400.0 - 2.0 * (border + pi)) (400.0 - 2.0 * (border + pb))
              let e = LayoutGeometry.rectExcess (LayoutGeometry.inset (LayoutGeometry.even c) inner) content
              expect (e <= 1e-6) $"pi={pi} pb={pb} r={r:F1}: content crosses by {e:F2}px")

      test "Text: character count is not width (CJK and emoji are wide, combining marks add nothing)" (fun () ->
          let s: LayoutText.Style = { SizePx = 16.0; LineHeightPx = 20.0; Bold = false; Uppercase = false; LetterSpacingEm = 0.0; WordSpacingEm = 0.0 }
          expect (LayoutText.width s "原因分析" > LayoutText.width s "abcd" * 1.4) "CJK wider"
          equal (LayoutText.width s "e") (LayoutText.width s "ẹ́") "combining marks"
          expect (LayoutText.width s "🚀" > LayoutText.width s "m") "emoji")

      test "Text: wrapping never needs more lines at a greater width" (fun () ->
          let s: LayoutText.Style = { SizePx = 16.0; LineHeightPx = 20.0; Bold = true; Uppercase = false; LetterSpacingEm = 0.12; WordSpacingEm = 0.16 }
          for t in texts do
              let counts = [ 40.0 .. 8.0 .. 600.0 ] |> List.map (fun w -> LayoutText.lines s w t)
              expect (counts |> List.pairwise |> List.forall (fun (a, b) -> b <= a)) $"monotone for {t}")

      test "Text: an unbroken run wider than the line breaks anywhere instead of overflowing" (fun () ->
          let s: LayoutText.Style = { SizePx = 16.0; LineHeightPx = 20.0; Bold = false; Uppercase = false; LetterSpacingEm = 0.0; WordSpacingEm = 0.0 }
          expect (LayoutText.lines s 100.0 (String.replicate 60 "x") >= 3) "three or more lines")

      test "Layout: identical input gives identical geometry" (fun () ->
          for w in graphs do equal (Layout.resolve w) (Layout.resolve w) "deterministic")

      test "Layout: a wider box node never needs more height" (fun () ->
          // A candidate property that holds for boxes only: an ellipse's content
          // width grows with its width, so a wider ellipse can need a few px more
          // height (LCE-001 records this), and a diamond's side is its height.
          for t in texts do
              for k in kinds do
                  let n = (doc "right" [ "a", k, t, None, None, None ] []).Nodes.Head
                  let hs = [ 96.0 .. 16.0 .. 480.0 ] |> List.map (Layout.requiredHeight n)
                  match Layout.shapeOf n with
                  | Rectangle | Rounded | Pill -> expect (hs |> List.pairwise |> List.forall (fun (a, b) -> b <= a)) $"{k}: {t}"
                  | _ -> ())

      test "Layout: ellipse and diamond content stays inside the shape's visible region" (fun () ->
          for t in texts do
              for shape in [ "ellipse"; "diamond" ] do
                  let w = doc "right" [ "a", "task", t, Some shape, None, None ] []
                  let r = (Layout.resolve w).Nodes[w.Nodes.Head.Id]
                  let n = w.Nodes.Head
                  let cw = Layout.contentWidth (Layout.shapeOf n) r.W
                  let ch = Layout.contentHeight n cw
                  let content = box (r.CenterX - cw / 2.0) (r.CenterY - ch / 2.0) cw ch
                  let boundary =
                      if shape = "diamond" then RotatedBox(box (r.X + r.W * 0.14645) (r.Y + r.H * 0.14645) (r.W * 0.7071) (r.H * 0.7071), 45.0) |> LayoutGeometry.inset (LayoutGeometry.sides 2.0 2.0 2.0 6.0)
                      else LayoutGeometry.roundedBox r (LayoutGeometry.uniformCorners (LayoutGeometry.corner (r.W / 2.0) (r.H / 2.0))) |> LayoutGeometry.inset (LayoutGeometry.sides 2.0 2.0 6.0 2.0)
                  let e = LayoutGeometry.rectExcess boundary content
                  expect (e <= 0.5) $"{shape} {t}: content crosses by {e:F2}px")

      test "Layout: default layouts keep nodes apart, connectors out of other nodes and labels clear" (fun () ->
          for w in graphs do
              let r = Layout.resolve w
              let nodes = r.Nodes |> Map.toList
              for (a, ra), (b, rb) in pairs nodes do
                  expect (LayoutGeometry.overlapArea ra rb = 0.0) $"{a.Value} overlaps {b.Value}"
              for e in w.Edges do
                  let route = r.Edges[e.Id]
                  for id, rect in nodes do
                      if id <> e.Source.Node && id <> e.Target.Node then
                          let inner = LayoutGeometry.insetRect (LayoutGeometry.even 2.0) rect
                          expect (not (route.Points |> List.pairwise |> List.exists (fun (p, q) -> LayoutGeometry.segmentCrosses inner p q))) $"{e.Id.Value} crosses {id.Value}"
              let issues = LayoutCheck.check w
              expect issues.IsEmpty (sprintf "static issues in a default layout: %A" (issues |> List.map (fun i -> i.Code, i.Message))))

      test "Layout: labels and nodes lie inside the canvas" (fun () ->
          for w in graphs do
              let r = Layout.resolve w
              let cw, ch = r.Canvas
              for e in w.Edges do
                  match e.Label with
                  | Some l ->
                      let lw, lh = Layout.labelSize l
                      let at = r.Edges[e.Id].LabelAt
                      expect (at.X >= 0.0 && at.Y >= 0.0 && at.X + lw <= cw && at.Y + lh <= ch) $"label {e.Id.Value} outside the canvas"
                  | None -> ()
              for KeyValue(id, n) in r.Nodes do expect (n.X >= 0.0 && n.Y >= 0.0 && n.Right <= cw && n.Bottom <= ch) $"node {id.Value} outside the canvas")

      test "LayoutCheck: authored geometry too small for its content is reported" (fun () ->
          let w = doc "right" [ "a", "task", paragraph, None, Some 120.0, Some 48.0; "b", "decision", paragraph, None, Some 120.0, None ] []
          let codes = LayoutCheck.check w |> List.map (fun i -> i.Code, i.Subject)
          expect (List.contains ("layout.node.too-small", "a") codes) "box too short"
          expect (List.contains ("layout.node.too-small", "b") codes) "diamond too small"
          let roomy = doc "right" [ "a", "task", "Short", None, Some 200.0, Some 200.0 ] []
          expect (LayoutCheck.check roomy).IsEmpty "a roomy authored node is fine")

      test "Render: diagram geometry is in rem, so it scales with enlarged text" (fun () ->
          let html = Markup.toHtml (Render.figure RenderOptions.defaults (doc "right" [ "a", "task", "A", None, None, None ] []))
          expect (html.Contains "--ef-diagram-x: 1.5rem") "node x in rem"
          expect (not (html.Contains "--ef-diagram-w: 200px")) "no px geometry") ]
