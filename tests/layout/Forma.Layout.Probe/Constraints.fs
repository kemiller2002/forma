namespace Forma.Layout.Probe

open System
open Forma.Workflow

/// One constraint violation, machine-readable (Section 7 output).
type Violation =
    { Case: string
      Family: string
      Seed: string
      Component: string
      Subject: string
      Constraint: string
      Severity: string
      Expected: string
      Observed: string
      /// Excess in CSS px where the constraint is geometric (0 otherwise).
      Excess: float
      Viewport: string
      Typography: string
      Styles: string
      Note: string }

/// Rendered-geometry constraints (Section 6), evaluated on what the browser
/// measured. Tolerances are half a CSS pixel for containment (sub-pixel text
/// positioning) and one pixel for allocation and overlap.
[<RequireQualifiedAccess>]
module Constraints =
    let tolerance = 0.5
    let clearance = 2.0
    let minTextPx = 12.0
    let minTargetPx = 24.0

    /// Constraint identifiers and what each one requires.
    let catalog =
        [ "contain.overflow", "Every text fragment lies inside its component's border box."
          "contain.clipped", "Content is never silently clipped by overflow: hidden or clip."
          "padding.preserved", "Text stays inside the content box: padding is kept whatever the wrapping."
          "boundary.corner", "Text stays inside the visible boundary, including curved corners (inner border edge)."
          "boundary.clearance", $"Text keeps {clearance}px clearance from the visible boundary."
          "allocation.exceeded", "A diagram node renders within the geometry the layout allocated to it."
          "separation.nodes", "Diagram nodes do not overlap."
          "connector.crosses-node", "A connector does not pass through a node it does not connect."
          "connector.starts-inside", "A connector leaves and enters at its nodes' visible edges, not inside them."
          "label.overlaps-node", "A connector label does not overlap a node."
          "label.overlaps-label", "Connector labels do not overlap each other."
          "canvas.containment", "Every node and label lies inside the diagram canvas, where the viewport can scroll to it."
          "nest.containment", "A nested component lies inside its parent's visible boundary."
          "viewport.overflow", "Content never causes page-level horizontal overflow (the diagram viewport scrolls)."
          "a11y.min-text", $"Rendered text is at least {minTextPx}px at zoom 1."
          "a11y.target-size", $"A standalone interactive target is at least {minTargetPx}px square."
          "determinism", "Rendering the same input twice gives identical geometry." ]

    /// Splits a CSS value at top-level occurrences of `sep` (outside parentheses).
    let private splitTop (sep: char) (value: string) =
        let parts, current, _ =
            value
            |> Seq.fold
                (fun (parts: string list, current: string, depth: int) ch ->
                    if ch = sep && depth = 0 then (if current.Trim() = "" then parts else current.Trim() :: parts), "", depth
                    else parts, current + string ch, depth + (if ch = '(' then 1 elif ch = ')' then -1 else 0))
                ([], "", 0)
        List.rev (if current.Trim() = "" then parts else current.Trim() :: parts)

    /// Resolves one computed length: px (times the element's zoom), %, or min()/max() of those.
    let rec private length (zoom: float) (basis: float) (token: string) : float =
        let t = token.Trim()
        let inv = Globalization.CultureInfo.InvariantCulture
        let args (prefix: string) = splitTop ',' (t.Substring(prefix.Length, t.Length - prefix.Length - 1)) |> List.map (length zoom basis)
        if t.StartsWith "min(" then args "min(" |> List.min
        elif t.StartsWith "max(" then args "max(" |> List.max
        elif t.EndsWith "%" then Double.Parse(t.TrimEnd('%'), inv) / 100.0 * basis
        elif t.EndsWith "px" then Double.Parse(t.Substring(0, t.Length - 2), inv) * zoom
        else match Double.TryParse(t, Globalization.NumberStyles.Float, inv) with | true, v -> v * zoom | _ -> 0.0

    /// A computed `border-*-radius` value ("8px", "50%", "24px 8px", "min(50%, 79px)") resolved against a box.
    let radius (zoom: float) (r: Rect) (value: string) : CornerRadius =
        match splitTop ' ' value with
        | [ a ] -> LayoutGeometry.corner (length zoom r.W a) (length zoom r.H a)
        | a :: b :: _ -> LayoutGeometry.corner (length zoom r.W a) (length zoom r.H b)
        | [] -> LayoutGeometry.circular 0.0

    let corners (m: Measured) =
        match m.Radii |> List.map (radius m.Zoom m.Rect) with
        | [ tl; tr; br; bl ] -> { TopLeft = tl; TopRight = tr; BottomRight = br; BottomLeft = bl }
        | _ -> LayoutGeometry.square

    /// The outer visible boundary of a measured element.
    let outer (m: Measured) : Boundary =
        match m.Shape with
        | Some "diamond" ->
            // Forma draws the diamond as ::before, inset 14.645% and rotated 45°.
            let k = 0.14645
            RotatedBox({ X = m.Rect.X + m.Rect.W * k; Y = m.Rect.Y + m.Rect.H * k; W = m.Rect.W * (1.0 - 2.0 * k); H = m.Rect.H * (1.0 - 2.0 * k) }, 45.0)
        | _ -> LayoutGeometry.roundedBox m.Rect (corners m)

    /// The inner (padding-edge) boundary: where the visible border stops.
    let inner (m: Measured) =
        match m.Shape with
        | Some "diamond" -> outer m |> LayoutGeometry.inset (LayoutGeometry.sides (2.0 * m.Zoom) (2.0 * m.Zoom) (2.0 * m.Zoom) (6.0 * m.Zoom))
        | _ -> outer m |> LayoutGeometry.inset m.Border

    let private styles (m: Measured) =
        let s (x: Sides) = $"{x.Top:F1} {x.Right:F1} {x.Bottom:F1} {x.Left:F1}"
        $"radius=[{String.Join(',', m.Radii)}] border=[{s m.Border}] padding=[{s m.Padding}] font={m.FontSize:F1}px/{m.LineHeight} ls={m.LetterSpacing} overflow={String.Join('/', m.Overflow)} dir={m.Direction}"

    let private rectText (r: Rect) = $"{r.X:F1},{r.Y:F1} {r.W:F1}x{r.H:F1}"

    type private Ctx = { Case: Case; Violation: string -> string -> Measured option -> string -> string -> float -> Violation }

    let private context (c: Case) =
        let make constraintId severity (m: Measured option) expected observed (excess: float) =
            { Case = c.Id
              Family = c.Family
              Seed = Seed.text c.Seed
              Component = Cases.subjectName c.Subject
              Subject = m |> Option.map (fun m -> $"{m.Role}:{m.Name}") |> Option.defaultValue "case"
              Constraint = constraintId
              Severity = severity
              Expected = catalog |> List.tryFind (fst >> (=) constraintId) |> Option.map snd |> Option.defaultValue expected
              Observed = observed
              Excess = Math.Round(excess, 2)
              Viewport = $"{c.Page.ViewportW}x{c.Page.ViewportH}"
              Typography = Cases.pageKey c.Page
              Styles = m |> Option.map styles |> Option.defaultValue ""
              Note = c.Note }
        { Case = c; Violation = make }

    /// Text inside one element: overflow, clipping, padding, curved boundary, clearance.
    let private textChecks (ctx: Ctx) (m: Measured) =
        let boundary = inner m
        let contentBox = LayoutGeometry.insetRect m.Padding (LayoutGeometry.insetRect m.Border m.Rect)
        let clipped = m.Overflow |> List.exists (fun o -> o = "hidden" || o = "clip")
        let worst (f: Rect -> float) =
            m.Text
            |> List.collect (fun fr -> fr.Rects |> List.map (fun r -> f r, fr, r))
            |> function [] -> None | xs -> xs |> List.maxBy (fun (e, _, _) -> e) |> fun (e, fr, r) -> if e > tolerance then Some(e, fr, r) else None
        let describe (fr: Fragment) (r: Rect) = $"\"{fr.Text}\" ({fr.Owner}) at {rectText r} in {rectText m.Rect}"
        let outside = worst (LayoutGeometry.rectExcess (LayoutGeometry.roundedBox m.Rect LayoutGeometry.square))
        match outside with
        | Some(e, fr, r) -> [ ctx.Violation (if clipped then "contain.clipped" else "contain.overflow") "error" (Some m) "" (describe fr r) e ]
        | None ->
            let crossing = worst (LayoutGeometry.rectExcess boundary)
            let intrusion =
                // Only meaningful for boxes: a diamond or ellipse places content by its own rule.
                if m.Shape = Some "diamond" then None else worst (LayoutGeometry.rectExcess (LayoutGeometry.roundedBox contentBox LayoutGeometry.square))
            [ match crossing with
              | Some(e, fr, r) -> yield ctx.Violation "boundary.corner" "error" (Some m) "" (describe fr r) e
              | None ->
                  match worst (LayoutGeometry.rectExcess (LayoutGeometry.inset (LayoutGeometry.even clearance) boundary)) with
                  | Some(e, fr, r) -> yield ctx.Violation "boundary.clearance" "warning" (Some m) "" (describe fr r) e
                  | None -> ()
              match intrusion with
              | Some(e, fr, r) when crossing.IsNone -> yield ctx.Violation "padding.preserved" "warning" (Some m) "" (describe fr r) e
              | _ -> () ]

    let rec private diagramOf (s: Subject) =
        match s with
        | DiagramCase d -> Some d
        | Nested(_, inner) -> diagramOf inner
        | _ -> None

    /// Node allocation, node overlap, connector routing and label placement.
    let private diagramChecks (ctx: Ctx) (mc: MeasuredCase) =
        let nodes = mc.Subjects |> List.filter (fun s -> s.Role = "node")
        let labels = mc.Subjects |> List.filter (fun s -> s.Role = "label")
        let suffix (id: string) = let i = id.LastIndexOf "-n-" in if i >= 0 then id.Substring(i + 3) else id
        let allocation =
            match mc.Canvas with
            | None -> []
            | Some canvas ->
                nodes
                |> List.choose (fun n ->
                    n.Allocation
                    |> Option.bind (fun a ->
                        let z = mc.Zoom
                        let allotted = { X = canvas.X + a.X * z; Y = canvas.Y + a.Y * z; W = a.W * z; H = a.H * z }
                        let excess = max (n.Rect.Bottom - allotted.Bottom) (n.Rect.Right - allotted.Right)
                        if excess > 1.0 then
                            Some(ctx.Violation "allocation.exceeded" "error" (Some n) "" $"allocated {rectText allotted}, rendered {rectText n.Rect}" excess)
                        else None))
        let pairs xs = [ for i, a in List.indexed xs do for b in List.skip (i + 1) xs -> a, b ]
        let overlaps =
            pairs nodes
            |> List.choose (fun (a, b) ->
                let area = LayoutGeometry.overlapArea a.Rect b.Rect
                if area > 1.0 then Some(ctx.Violation "separation.nodes" "error" (Some a) "" $"{suffix a.Name} {rectText a.Rect} overlaps {suffix b.Name} {rectText b.Rect}" (sqrt area)) else None)
        let edges = diagramOf ctx.Case.Subject |> Option.map _.Edges |> Option.defaultValue []
        let shrink (r: Rect) = LayoutGeometry.insetRect (LayoutGeometry.even 2.0) r
        let connectorChecks =
            mc.Connectors
            |> List.collect (fun con ->
                let index = let i = con.Id.LastIndexOf "-e-e" in if i >= 0 then Int32.TryParse(con.Id.Substring(i + 4)) |> function | true, v -> Some v | _ -> None else None
                let ends = index |> Option.bind (fun i -> List.tryItem i edges) |> Option.map (fun e -> set [ e.Source; e.Target ]) |> Option.defaultValue Set.empty
                let segments = con.Points |> List.pairwise
                let crossing =
                    nodes
                    |> List.filter (fun n -> not (ends.Contains(suffix n.Name)))
                    |> List.choose (fun n ->
                        if segments |> List.exists (fun (a, b) -> LayoutGeometry.segmentCrosses (shrink n.Rect) a b) then
                            Some(ctx.Violation "connector.crosses-node" "error" (Some n) "" $"{con.Id} passes through {suffix n.Name} {rectText n.Rect}" 0.0)
                        else None)
                let inside =
                    match con.Points, index |> Option.bind (fun i -> List.tryItem i edges) with
                    | first :: _, Some e ->
                        let last = List.last con.Points
                        let endpoint (id: string) (p: Point) =
                            nodes
                            |> List.tryFind (fun n -> suffix n.Name = id)
                            |> Option.bind (fun n ->
                                let r = shrink n.Rect
                                if p.X > r.X && p.X < r.Right && p.Y > r.Y && p.Y < r.Bottom then
                                    Some(ctx.Violation "connector.starts-inside" "error" (Some n) "" $"{con.Id} meets {id} at {p.X:F1},{p.Y:F1}, inside {rectText n.Rect}" (min (p.Y - n.Rect.Y) (n.Rect.Bottom - p.Y)))
                                else None)
                        [ endpoint e.Source first; endpoint e.Target last ] |> List.choose id
                    | _ -> []
                crossing @ inside)
        let labelNode =
            labels
            |> List.collect (fun l ->
                nodes
                |> List.choose (fun n ->
                    let area = LayoutGeometry.overlapArea l.Rect n.Rect
                    if area > 1.0 then Some(ctx.Violation "label.overlaps-node" "error" (Some l) "" $"label \"{l.Text |> List.tryHead |> Option.map _.Text |> Option.defaultValue String.Empty}\" {rectText l.Rect} overlaps {suffix n.Name} {rectText n.Rect}" (sqrt area))
                    else None))
        let labelLabel =
            pairs labels
            |> List.choose (fun (a, b) ->
                let area = LayoutGeometry.overlapArea a.Rect b.Rect
                if area > 1.0 then Some(ctx.Violation "label.overlaps-label" "error" (Some a) "" $"{rectText a.Rect} overlaps {rectText b.Rect}" (sqrt area)) else None)
        let outside =
            match mc.Canvas with
            | None -> []
            | Some canvas ->
                nodes @ labels
                |> List.choose (fun s ->
                    let e = LayoutGeometry.rectExcess (LayoutGeometry.roundedBox canvas LayoutGeometry.square) s.Rect
                    if e > 1.0 then Some(ctx.Violation "canvas.containment" "error" (Some s) "" $"{rectText s.Rect} outside canvas {rectText canvas}" e) else None)
        allocation @ overlaps @ connectorChecks @ labelNode @ labelLabel @ outside

    let private nestChecks (ctx: Ctx) (mc: MeasuredCase) =
        match mc.Subjects |> List.tryFind (fun s -> s.Role = "host") with
        | None -> []
        | Some host ->
            let boundary = inner host
            mc.Subjects
            |> List.filter (fun s -> s.Role = "component" || s.Role = "probe")
            |> List.choose (fun s ->
                let e = LayoutGeometry.rectExcess boundary s.Rect
                if e > tolerance then Some(ctx.Violation "nest.containment" "error" (Some s) "" $"{rectText s.Rect} in host {rectText host.Rect} ({String.Join(',', host.Radii)})" e) else None)

    let private accessibilityChecks (ctx: Ctx) (mc: MeasuredCase) =
        let small =
            if mc.Zoom = 1.0 then
                mc.Subjects
                |> List.filter (fun s -> s.Role <> "host" && not s.Text.IsEmpty && s.FontSize > 0.0 && s.FontSize < minTextPx)
                |> List.map (fun s -> ctx.Violation "a11y.min-text" "warning" (Some s) "" $"{s.FontSize:F1}px" (minTextPx - s.FontSize))
            else []
        let targets =
            mc.Subjects
            |> List.filter (fun s -> s.Name = "tooltip-trigger" && (s.Rect.W < minTargetPx || s.Rect.H < minTargetPx))
            |> List.map (fun s -> ctx.Violation "a11y.target-size" "error" (Some s) "" (rectText s.Rect) (minTargetPx - min s.Rect.W s.Rect.H))
        small @ targets

    let private viewportChecks (ctx: Ctx) (page: MeasuredPage) (mc: MeasuredCase) =
        mc.Subjects
        |> List.filter (fun s -> s.Role <> "label" && s.Rect.Right > page.ViewportW + 1.0)
        // Diagram nodes scroll inside the diagram viewport; only the figure itself may not overflow the page.
        |> List.filter (fun s -> s.Role <> "node")
        |> List.truncate 1
        |> List.map (fun s -> ctx.Violation "viewport.overflow" "error" (Some s) "" $"right edge {s.Rect.Right:F1} > viewport {page.ViewportW:F0}" (s.Rect.Right - page.ViewportW))

    let private determinism (ctx: Ctx) (page: MeasuredPage) (mc: MeasuredCase) =
        match page.Repeat |> Option.bind (List.tryFind (fun r -> r.Id = mc.Id)) with
        | Some again ->
            let differs = List.zip (mc.Subjects |> List.map _.Rect) (again.Subjects |> List.map _.Rect) |> List.exists (fun (a, b) -> a <> b)
            if mc.Subjects.Length <> again.Subjects.Length || differs then [ ctx.Violation "determinism" "error" None "" "geometry changed between two renders" 0.0 ] else []
        | None -> []

    /// Every rendered-geometry finding for one case.
    let evaluate (c: Case) (page: MeasuredPage) (mc: MeasuredCase) : Violation list =
        let ctx = context c
        match mc.Invalid with
        | Some reason -> [ ctx.Violation "input.invalid" "info" None "" reason 0.0 ]
        | None ->
            // Computed lengths are unzoomed; scale them for elements inside a zoomed diagram.
            let scale (x: Sides) = LayoutGeometry.sides (x.Top * mc.Zoom) (x.Right * mc.Zoom) (x.Bottom * mc.Zoom) (x.Left * mc.Zoom)
            let mc =
                { mc with
                    Subjects =
                        mc.Subjects
                        |> List.map (fun s -> if s.Role = "node" || s.Role = "label" then { s with Zoom = mc.Zoom; Border = scale s.Border; Padding = scale s.Padding } else s) }
            let textSubjects = mc.Subjects |> List.filter (fun s -> s.Role <> "host" && s.Role <> "label")
            (textSubjects |> List.collect (textChecks ctx))
            @ diagramChecks ctx mc
            @ nestChecks ctx mc
            @ accessibilityChecks ctx mc
            @ viewportChecks ctx page mc
            @ determinism ctx page mc
