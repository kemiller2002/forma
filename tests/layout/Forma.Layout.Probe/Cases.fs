namespace Forma.Layout.Probe

open Forma.Workflow

/// Page-level typography. RootPercent is the root font size as a percentage
/// of the browser default, which is how browser text enlargement reaches
/// rem-based Forma components.
type Typography =
    { RootPercent: int
      LetterSpacingEm: float
      LineHeight: float option
      Weight: int }

type PageSetup =
    { ViewportW: int
      ViewportH: int
      Typography: Typography }

/// Real Forma components with text inside a bounded region.
type Component =
    | Card
    | Badge
    | Button
    | Alert
    | MetricCard
    | Callout
    | WizardStep
    | TooltipTrigger

/// A bare geometric box for the controlled radius × padding experiments
/// (Section 5.2): one variable changes while the others are held.
type Probe =
    { Width: float
      Height: float option
      Padding: Sides
      Border: float
      Radius: string
      Text: string
      Center: bool }

type DiagramNode =
    { Id: string
      Kind: string
      Label: string
      Description: string option
      Shape: string option
      Width: float option
      Height: float option
      /// A core status state ("active", "blocked"), shown as a meta row.
      Status: string option }

type DiagramEdge =
    { Source: string
      Target: string
      Label: string option
      /// "backward" for a connector drawn against the flow.
      Direction: string option }

type DiagramGroup =
    { GroupId: string
      GroupKind: string
      GroupLabel: string
      Members: string list }

type DiagramSpec =
    { Title: string
      Direction: string
      Nodes: DiagramNode list
      Edges: DiagramEdge list
      Groups: DiagramGroup list
      Zoom: float }

/// Where a nested subject sits.
type Host =
    | CardHost of radius: string
    | ProbeHost of Probe

type Subject =
    | ComponentCase of Component * text: string * radius: string * hostWidth: float
    | ProbeCase of Probe
    | DiagramCase of DiagramSpec
    | Nested of Host * Subject

type Case =
    { Id: string
      Family: string
      Seed: uint64
      Page: PageSetup
      Subject: Subject
      Script: Corpus.Script
      /// The text sample kind or sweep variable, for grouping results.
      Note: string }

[<RequireQualifiedAccess>]
module Cases =
    let defaultTypography = { RootPercent = 100; LetterSpacingEm = 0.0; LineHeight = None; Weight = 400 }
    let desktop = { ViewportW = 1280; ViewportH = 900; Typography = defaultTypography }

    let componentName (c: Component) =
        match c with
        | Card -> "card"
        | Badge -> "badge"
        | Button -> "button"
        | Alert -> "alert"
        | MetricCard -> "metric-card"
        | Callout -> "callout"
        | WizardStep -> "wizard-step"
        | TooltipTrigger -> "tooltip-trigger"

    let rec subjectName (s: Subject) =
        match s with
        | ComponentCase(c, _, _, _) -> componentName c
        | ProbeCase _ -> "probe"
        | DiagramCase _ -> "diagram"
        | Nested(_, inner) -> "nested-" + subjectName inner

    let pageKey (p: PageSetup) =
        let t = p.Typography
        let lh = t.LineHeight |> Option.map (fun v -> $"{v:F2}") |> Option.defaultValue "n"
        $"{p.ViewportW}x{p.ViewportH}-r{t.RootPercent}-ls{t.LetterSpacingEm:F3}-lh{lh}-w{t.Weight}"

    /// The workflow document a diagram spec stands for, through the public format.
    let workflowJson (d: DiagramSpec) : Json =
        let str (s: string) = Json.String s
        let num (v: float) = Json.number v
        let node (n: DiagramNode) =
            Json.Object(
                [ yield "id", str n.Id
                  yield "kind", str n.Kind
                  yield "label", str n.Label
                  match n.Description with Some d -> yield "description", str d | None -> ()
                  match n.Shape with Some s -> yield "variant", str s | None -> ()
                  match n.Status with Some st -> yield "status", Json.Object [ "state", str st ] | None -> ()
                  let size =
                      [ yield! n.Width |> Option.map (fun w -> "width", num w) |> Option.toList
                        yield! n.Height |> Option.map (fun h -> "height", num h) |> Option.toList ]
                  if not size.IsEmpty then yield "layout", Json.Object size ]
            )
        let edge (i: int) (e: DiagramEdge) =
            Json.Object(
                [ yield "id", str $"e{i}"
                  yield "source", Json.Object [ "node", str e.Source ]
                  yield "target", Json.Object [ "node", str e.Target ]
                  match e.Label with Some l -> yield "label", str l | None -> ()
                  match e.Direction with Some d -> yield "direction", str d | None -> () ]
            )
        let group (g: DiagramGroup) =
            Json.Object [ "id", str g.GroupId; "kind", str g.GroupKind; "label", str g.GroupLabel; "members", Json.Array(g.Members |> List.map str) ]
        Json.Object
            [ "format", str "forma-workflow"
              "formatVersion", str "1.0.0"
              "id", str "probe"
              "title", str d.Title
              "forma", Json.Object [ "version", str "0.9.0" ]
              "layout", Json.Object [ "direction", str d.Direction ]
              "nodes", Json.Array(d.Nodes |> List.map node)
              "edges", Json.Array(d.Edges |> List.mapi edge)
              "groups", Json.Array(d.Groups |> List.map group) ]

    let workflow (d: DiagramSpec) : Result<Workflow, string> =
        let report = Validation.load (Json.serialize (workflowJson d))
        match report.Workflow with
        | Some w when Validation.isValid report -> Ok w
        | _ -> Error(report.Findings |> List.map (fun f -> f.Code + ": " + f.Message) |> String.concat "; ")
