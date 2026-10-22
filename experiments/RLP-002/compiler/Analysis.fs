/// Pure analysis of a relational page: which relationships compile exactly to
/// static CSS, which are approximated, and which are unsupported, plus the
/// per-element values the static ruleset needs (as custom properties and
/// `data-rlc` flags). No measurement and no optimization: every decision is a
/// function of the markup alone.
module Rlc.Analysis

open System.Text.RegularExpressions
open Rlc.Html

type Status =
    | Exact
    | Approximated
    | Unsupported

type Finding =
    { Element: string
      Feature: string
      Status: Status
      Reason: string }

type Patch =
    { Element: int
      Flags: string list
      Props: (string * string) list }

let private bondGap =
    Map [ "tight", "0.5rem"; "related", "1rem"; "loose", "1.5rem"; "section", "2rem" ]

let private skipped = set [ "script"; "style"; "template"; "link"; "meta" ]

let private lengthPattern = Regex(@"^\s*(\d*\.?\d+)\s*(rem|px)\s*$")

let isNode (el: Element) =
    match value "data-rl" el with
    | Some "container" | Some "group" -> true
    | _ -> has "data-rl-root" el

let children (els: Element array) (el: Element) =
    el.Children |> List.map (fun i -> els.[i]) |> List.filter (fun c -> not (skipped.Contains c.Tag))

let flow el =
    match value "data-rl-flow" el with
    | Some "row" -> "row"
    | Some "wrap" -> "wrap"
    | _ -> "column"

let gap el =
    value "data-rl-bond" el |> Option.bind bondGap.TryFind |> Option.defaultValue "1rem"

let label (el: Element) =
    value "data-rlp" el |> Option.defaultValue (sprintf "%s#%d" el.Tag el.Id)

let length name el =
    value name el
    |> Option.bind (fun v ->
        let m = lengthPattern.Match v
        if m.Success then Some(m.Groups.[1].Value + m.Groups.[2].Value) else None)

let private finding el feature status reason =
    { Element = label el; Feature = feature; Status = status; Reason = reason }

let private patch el flags props = { Element = el.Id; Flags = flags; Props = props }

let private cssMax (values: string list) =
    match values |> List.distinct with
    | [ one ] -> one
    | many -> sprintf "max(%s)" (String.concat ", " many)

/// Sizing values on any element: comfortable minimum and maximum width.
let private sizing (el: Element) : Patch list * Finding list =
    let one name prop =
        match value name el, length name el with
        | None, _ -> [], []
        | Some _, Some v -> [ patch el [] [ prop, v ] ], []
        | Some raw, None ->
            [], [ finding el name Unsupported (sprintf "%s=\"%s\" is not a non-negative rem or px length" name raw) ]
    let p1, f1 = one "data-rl-min" "--rl-min"
    let p2, f2 = one "data-rl-max" "--rl-max"
    p1 @ p2, f1 @ f2

/// The all-or-nothing row threshold: the sum of every child's comfortable
/// minimum plus the gaps. Static only when every child declares data-rl-min.
let private rowSwitch (node: Element) (items: Element list) (mins: string option list) =
    if flow node <> "row" || items.Length <= 1 then None, []
    elif List.forall Option.isSome mins then
        let parts = (List.choose id mins) @ List.replicate (items.Length - 1) (gap node)
        Some(sprintf "calc(%s)" (String.concat " + " parts)), []
    else
        None,
        [ finding node "flow=row" Approximated
              "one-line-or-stacked switching depends on content widths; compiled as per-item wrapping" ]

/// Shared edges. Members that are line items align by construction (items
/// start at the line's cross start). Members one level inside a tightly
/// bonded item align through subgrid rows when every such member sits at the
/// same index and every item declares data-rl-min.
let private edges (els: Element array) (node: Element) (items: Element list) (allMin: bool) =
    let direct = items |> List.filter (has "data-rl-align-edge")
    let directFindings =
        match value "data-rl-align" node with
        | Some "center" | Some "end" when not direct.IsEmpty ->
            [ finding node "align-edge" Approximated "item edges under center or end alignment follow the alignment, not the edge" ]
        | _ -> []
    let nested =
        items
        |> List.choose (fun it ->
            if isNode it && value "data-rl-bond" it = Some "tight" then
                children els it
                |> List.tryFindIndex (has "data-rl-align-edge")
                |> Option.map (fun k -> it, k)
            else
                None)
    let indices = nested |> List.map snd |> List.distinct
    match nested, indices with
    | [], _ -> false, [], directFindings
    | _, [ k ] when allMin ->
        let span = items |> List.map (children els >> List.length) |> List.max
        let itemPatches =
            nested
            |> List.collect (fun (it, _) ->
                patch it [ "edge-item" ] [ "--rl-span", string span ]
                :: (children els it |> List.take k |> List.map (fun pre -> patch pre [ "edge-pre" ] [])))
        true, itemPatches, directFindings
    | _ ->
        let why = if allMin then "members sit at different positions inside their items" else "not every item declares data-rl-min"
        false, [], directFindings @ [ finding node "align-edge (nested)" Unsupported (why + "; no static alignment emitted") ]

/// Analysis of one row or wrap line container.
let private line (els: Element array) (node: Element) : Patch list * Finding list =
    let items = children els node
    let mins = items |> List.map (length "data-rl-min")
    let allMin = not items.IsEmpty && List.forall Option.isSome mins
    let switch, switchFindings = rowSwitch node items mins
    let edgeGrid, edgePatches, edgeFindings = edges els node items allMin
    let equal = has "data-rl-equal" node
    let equalFindings =
        if equal && not allMin then
            [ finding node "equal" Approximated "equal widths without data-rl-min on every child use equal flex shares on one line" ]
        else []
    let grid = allMin && (edgeGrid || equal)
    let gridFindings =
        if grid && not equal && (mins |> List.distinct |> List.length) > 1 then
            [ finding node "align-edge grid" Approximated "unequal item minimums share equal grid tracks" ]
        else []
    let track = mins |> List.choose id |> cssMax
    let nodePatch =
        if grid then
            let col =
                match switch with
                | Some t -> sprintf "max(%s, calc((%s - 100%%) * 999))" track t
                | None -> track
            [ patch node [ "grid" ] [ "--rl-col", col ] ]
        else
            match switch with
            | Some t -> [ patch node [ "switch" ] [ "--rl-switch", t ] ]
            | None -> []
    nodePatch @ edgePatches, switchFindings @ edgeFindings @ equalFindings @ gridFindings

/// Whole-page analysis: patches for the emitter and the support report.
let analyze (els: Element array) : Patch list * Finding list =
    let perElement (el: Element) =
        let p1, f1 = sizing el
        let p2, f2 = if isNode el && flow el <> "column" then line els el else [], []
        p1 @ p2, f1 @ f2
    let results = els |> Array.toList |> List.map perElement
    List.collect fst results, List.collect snd results
