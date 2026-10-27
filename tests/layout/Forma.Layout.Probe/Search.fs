namespace Forma.Layout.Probe

open System
open System.IO
open Forma.Workflow

type Evaluated =
    { Case: Case
      Page: MeasuredPage
      Measured: MeasuredCase
      Findings: Violation list
      /// Forma.Workflow LayoutCheck issues for a diagram subject: what static validation predicted.
      Static: LayoutIssue list }

/// Rendering, boundary search and minimisation (Sections 8 and 9). Every
/// search batches its candidates into one browser run, so a search costs a
/// handful of page loads rather than one per step.
[<RequireQualifiedAccess>]
module Search =
    let errors (fs: Violation list) = fs |> List.filter (fun f -> f.Severity = "error")

    /// Renders and evaluates cases. `repeat` re-renders each page to check determinism.
    let rec staticIssues (s: Subject) =
        match s with
        | DiagramCase d -> (match Cases.workflow d with Ok w -> LayoutCheck.check w | Error _ -> [])
        | Nested(_, inner) -> staticIssues inner
        | _ -> []

    let run (root: string) (workDir: string) (repeat: bool) (cases: Case list) : Evaluated list * string =
        Directory.CreateDirectory workDir |> ignore
        let written = Pages.write root workDir cases
        let pages, browser = Measure.run root workDir (written |> List.map (fun (f, setup, _) -> f, setup, repeat))
        let byId = cases |> List.map (fun c -> c.Id, c) |> Map.ofList
        let evaluated =
            pages
            |> List.collect (fun page ->
                page.Cases
                |> List.choose (fun mc ->
                    byId
                    |> Map.tryFind mc.Id
                    |> Option.map (fun c -> { Case = c; Page = page; Measured = mc; Findings = Constraints.evaluate c page mc; Static = staticIssues c.Subject })))
        evaluated, browser

    // ---- Sweeps ---------------------------------------------------------------

    let private sweepCase family (name: string) (page: PageSetup) (subject: Subject) =
        { Id = $"{family}-{name}"
          Family = family
          Seed = Seed.derive 0UL $"{family}/{name}"
          Page = page
          Subject = subject
          Script = Corpus.Latin
          Note = name }

    let sweepRadii = [ 0; 2; 4; 6; 8; 10; 12; 14; 16; 18; 20; 22; 24; 28; 32; 40; 48; 64 ]
    let sweepPaddings = [ 4.0; 8.0; 12.0; 16.0; 24.0 ]

    /// Section 5.2: identical content and dimensions; the radius rises in steps
    /// for each padding. Border 2px, as Forma's diagram nodes.
    let radiusPaddingCases () =
        [ for pad in sweepPaddings do
              for r in sweepRadii ->
                  sweepCase
                      "sweep-radius"
                      $"p{int pad}-r{r:D2}"
                      Cases.desktop
                      (ProbeCase
                          { Width = 200.0
                            Height = None
                            Padding = LayoutGeometry.even pad
                            Border = 2.0
                            Radius = $"{r}px"
                            Text = (Corpus.byKind "medium").Text
                            Center = false }) ]

    /// The smallest failing radius per padding: (padding, first failing radius, analytic bound).
    let radiusTransitions (evaluated: Evaluated list) =
        sweepPaddings
        |> List.map (fun pad ->
            let failing =
                sweepRadii
                |> List.filter (fun r ->
                    evaluated
                    |> List.exists (fun e -> e.Case.Note = $"p{int pad}-r{r:D2}" && e.Findings |> List.exists (fun f -> f.Constraint = "boundary.corner")))
            // Analytic: the largest radius whose arc keeps a corner of the content box
            // inside, with the 2px border taken off the radius (CSS inner radius).
            let analytic =
                sweepRadii
                |> List.tryFind (fun r ->
                    let innerR = max 0.0 (float r - 2.0)
                    LayoutGeometry.safeInlinePadding (LayoutGeometry.circular innerR) pad 0.0 > pad + 1e-9)
            pad, List.tryHead failing, analytic)

    /// A pill (Start/End) node whose label grows word by word.
    let pillLengthCases () =
        let words = (Corpus.byKind "extreme-paragraph").Text.Split(' ')
        [ for n in [ 1; 2; 3; 4; 6; 8; 10; 12; 16; 20; 28; 40 ] ->
              sweepCase
                  "sweep-pill"
                  $"w{n:D2}"
                  Cases.desktop
                  (DiagramCase
                      { Title = "Pill length"
                        Direction = "right"
                        Nodes = [ { Id = "n1"; Kind = "end"; Label = String.Join(" ", words |> Array.truncate n); Description = None; Shape = None; Width = None; Height = None; Status = None } ]
                        Edges = []
                        Groups = []
                        Zoom = 1.0 }) ]

    /// The same diagram at every zoom: geometry divided by zoom must agree.
    let zoomCases (spec: DiagramSpec) =
        [ for z in [ 0.5; 0.75; 1.0; 1.25; 1.5; 2.0 ] -> sweepCase "sweep-zoom" $"z{int (z * 100.0):D3}" Cases.desktop (DiagramCase { spec with Zoom = z }) ]

    /// Zoom consistency: each node's rendered size / zoom, compared with zoom 1.
    let zoomDrift (evaluated: Evaluated list) =
        let sizes (e: Evaluated) =
            let z = e.Measured.Zoom
            e.Measured.Subjects |> List.filter (fun s -> s.Role = "node") |> List.map (fun s -> s.Name.Substring(s.Name.LastIndexOf "-n-"), (s.Rect.W / z, s.Rect.H / z))
        match evaluated |> List.tryFind (fun e -> e.Case.Note = "z100") with
        | None -> []
        | Some baseline ->
            let reference = sizes baseline |> Map.ofList
            evaluated
            |> List.map (fun e ->
                let drift =
                    sizes e
                    |> List.choose (fun (id, (w, h)) -> reference |> Map.tryFind id |> Option.map (fun (w0, h0) -> max (abs (w - w0)) (abs (h - h0))))
                    |> List.fold max 0.0
                e.Case.Note, drift, (errors e.Findings).Length)

    /// Root font size sweep (browser text enlargement) for one subject.
    let textScaleCases (subject: Subject) =
        [ for pct in [ 100; 125; 150; 175; 200; 250; 300 ] ->
              sweepCase "sweep-text" $"t{pct:D3}" { Cases.desktop with Typography = { Cases.defaultTypography with RootPercent = pct } } subject ]

    // ---- Minimisation ----------------------------------------------------------

    let private halveText (s: string) =
        let words = s.Split(' ', StringSplitOptions.RemoveEmptyEntries)
        if words.Length > 1 then String.Join(" ", words |> Array.truncate (max 1 (words.Length / 2)))
        elif s.Length > 1 then s.Substring(0, s.Length / 2)
        else s

    /// Single-step reductions of a subject, smallest-first is not required: the
    /// minimiser keeps whichever still fails and is smaller.
    let rec private reductions (s: Subject) : Subject list =
        match s with
        | DiagramCase d ->
            let withoutNode (id: string) =
                { d with
                    Nodes = d.Nodes |> List.filter (fun n -> n.Id <> id)
                    Edges = d.Edges |> List.filter (fun e -> e.Source <> id && e.Target <> id)
                    Groups = d.Groups |> List.map (fun g -> { g with Members = g.Members |> List.filter ((<>) id) }) |> List.filter (fun g -> not g.Members.IsEmpty) }
            let nodeEdits (n: DiagramNode) =
                [ if n.Description.IsSome then yield { n with Description = None }
                  if halveText n.Label <> n.Label then yield { n with Label = halveText n.Label }
                  if n.Width.IsSome || n.Height.IsSome then yield { n with Width = None; Height = None } ]
            [ if d.Nodes.Length > 1 then yield! d.Nodes |> List.map (fun n -> DiagramCase(withoutNode n.Id))
              for n in d.Nodes do
                  for edited in nodeEdits n -> DiagramCase { d with Nodes = d.Nodes |> List.map (fun x -> if x.Id = n.Id then edited else x) }
              for i, e in List.indexed d.Edges do
                  if e.Label.IsSome then yield DiagramCase { d with Edges = d.Edges |> List.mapi (fun j x -> if i = j then { x with Label = None } else x) }
              if d.Zoom <> 1.0 then yield DiagramCase { d with Zoom = 1.0 } ]
        | ProbeCase p -> if halveText p.Text <> p.Text then [ ProbeCase { p with Text = halveText p.Text } ] else []
        | ComponentCase(c, t, r, w) -> if halveText t <> t then [ ComponentCase(c, halveText t, r, w) ] else []
        | Nested(h, inner) -> (inner :: (reductions inner |> List.map (fun i -> Nested(h, i))))

    let rec private size (s: Subject) =
        match s with
        | DiagramCase d -> d.Nodes |> List.sumBy (fun n -> 10 + n.Label.Length + (n.Description |> Option.map String.length |> Option.defaultValue 0)) |> (+) (d.Edges.Length * 3) |> (+) (if d.Zoom <> 1.0 then 1 else 0)
        | ProbeCase p -> p.Text.Length
        | ComponentCase(_, t, _, _) -> t.Length
        | Nested(_, inner) -> 50 + size inner

    /// Delta debugging: keep the smallest single-step reduction that still
    /// violates `constraintId`, until none does or the round budget is spent.
    let minimize (root: string) (workDir: string) (rounds: int) (constraintId: string) (c: Case) =
        let rec loop (current: Case) (round: int) (trail: string list) =
            let candidates = reductions current.Subject |> List.mapi (fun i s -> { current with Id = $"{c.Id}-m{round}-{i}"; Subject = s })
            if round >= rounds || candidates.IsEmpty then current, List.rev trail
            else
                let evaluated, _ = run root (Path.Combine(workDir, $"round-{round}")) false candidates
                let failing =
                    evaluated
                    |> List.filter (fun e -> e.Findings |> List.exists (fun f -> f.Constraint = constraintId))
                    |> List.sortBy (fun e -> size e.Case.Subject)
                match failing with
                | best :: _ when size best.Case.Subject < size current.Subject -> loop best.Case (round + 1) ($"round {round}: {candidates.Length} candidates, kept size {size best.Case.Subject}" :: trail)
                | _ -> current, List.rev ($"round {round}: {candidates.Length} candidates, none smaller still fails" :: trail)
        loop c 0 []
