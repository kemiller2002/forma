namespace Forma.Layout.Probe

open Forma.Workflow

/// The adversarial generators (Sections 4, 5 and 9). Each family is a pure
/// function of (run seed, index): no case depends on another, so any case can
/// be regenerated from the seed recorded beside a finding.
[<RequireQualifiedAccess>]
module Families =
    let radii = [ "0px"; "2px"; "4px"; "8px"; "16px"; "24px"; "32px"; "50%"; "999px"; "24px / 8px"; "8px / 24px" ]
    let hostWidths = [ 96.0; 120.0; 160.0; 200.0; 280.0; 360.0; 600.0 ]
    let shapes = [ "rectangle"; "rounded"; "pill"; "ellipse"; "diamond" ]
    let edgeLabels = [ "root cause"; "trigger"; "contributing factor"; "enabling condition"; "yes"; "no"; "1202 alarm"; "原因" ]

    let private sampleFor seed (kinds: string list) = Corpus.byKind (Seed.pick seed kinds)

    let private probe seed (text: string) (radius: string) (square: bool) =
        let w = Seed.pick (Seed.derive seed "w") [ 48.0; 80.0; 120.0; 160.0; 200.0; 280.0; 400.0 ]
        let pad axis = Seed.pick (Seed.derive seed axis) [ 0.0; 2.0; 4.0; 8.0; 12.0; 16.0; 24.0 ]
        { Width = w
          Height = (if square then Some w elif Seed.chance (Seed.derive seed "fixed") 0.3 then Some(Seed.pick (Seed.derive seed "h") [ 32.0; 48.0; 80.0; 120.0 ]) else None)
          Padding = LayoutGeometry.sides (pad "pt") (pad "pr") (pad "pb") (pad "pl")
          Border = Seed.pick (Seed.derive seed "border") [ 0.0; 1.0; 2.0; 4.0; 8.0 ]
          Radius = radius
          Text = text
          Center = Seed.chance (Seed.derive seed "center") 0.5 }

    let private node seed (id: string) (shape: string option) (sample: Corpus.Sample) =
        let describe = Seed.chance (Seed.derive seed "desc") 0.5
        let authored = Seed.chance (Seed.derive seed "authored") 0.25
        let w = Seed.pick (Seed.derive seed "nw") [ 96.0; 120.0; 160.0; 200.0; 264.0 ]
        { Id = id
          Kind = Seed.pick (Seed.derive seed "kind") [ "task"; "end"; "start"; "decision"; "event"; "subprocess" ]
          Label = (if sample.Text = "" then "·" else sample.Text)
          Description = (if describe then Some (Corpus.byKind (Seed.pick (Seed.derive seed "dk") [ "medium"; "paragraph"; "short" ])).Text else None)
          Shape = shape
          Width = (if authored then Some w else None)
          Height = (if authored && Seed.chance (Seed.derive seed "ah") 0.5 then Some(Seed.pick (Seed.derive seed "nh") [ 48.0; 80.0; 120.0; 200.0 ]) else None)
          Status = None }

    let private singleNode seed shape sample =
        DiagramCase
            { Title = "Probe"
              Direction = "right"
              Nodes = [ node seed "n1" (Some shape) sample ]
              Edges = []
              Groups = []
              Zoom = 1.0 }

    /// A random small DAG: every node after the first gets one or two earlier predecessors.
    let graph seed =
        let count = Seed.int (Seed.derive seed "count") 2 6
        let nodes =
            [ for i in 1..count ->
                  let s = Seed.derive seed $"node{i}"
                  let shape = if Seed.chance (Seed.derive s "variant") 0.6 then Some(Seed.pick (Seed.derive s "shape") shapes) else None
                  node s $"n{i}" shape (sampleFor (Seed.derive s "text") [ "short"; "medium"; "paragraph"; "cjk"; "hebrew"; "unbroken"; "url"; "emoji"; "long-words" ]) ]
        let edges =
            [ for i in 2..count do
                  let s = Seed.derive seed $"edge{i}"
                  let preds = if Seed.chance (Seed.derive s "two") 0.4 && i > 2 then [ Seed.int s 1 (i - 1); Seed.int (Seed.derive s "b") 1 (i - 1) ] |> List.distinct else [ Seed.int s 1 (i - 1) ]
                  for p in preds ->
                      { Source = $"n{p}"; Target = $"n{i}"; Label = (if Seed.chance (Seed.derive s $"lab{p}") 0.7 then Some(Seed.pick (Seed.derive s $"l{p}") edgeLabels) else None); Direction = None } ]
        { Title = "Generated graph"
          Direction = Seed.pick (Seed.derive seed "dir") [ "right"; "down" ]
          Nodes = nodes
          Edges = edges
          Groups = []
          Zoom = Seed.pick (Seed.derive seed "zoom") [ 0.5; 0.75; 1.0; 1.0; 1.5; 2.0 ] }

    let private case family runSeed index (page: PageSetup) (build: uint64 -> Subject * Corpus.Script * string) =
        let seed = Seed.derive runSeed $"{family}/{index}"
        let subject, script, note = build seed
        { Id = $"{family}-{index:D3}"
          Family = family
          Seed = seed
          Page = page
          Subject = subject
          Script = script
          Note = note }

    let rectangle runSeed index =
        case "rectangle" runSeed index Cases.desktop (fun seed ->
            let sample = sampleFor (Seed.derive seed "text") Corpus.kinds
            let subject =
                match Seed.int (Seed.derive seed "what") 0 3 with
                | 0 ->
                    let c = Seed.pick (Seed.derive seed "component") [ Card; Badge; Button; Alert; MetricCard; Callout ]
                    ComponentCase(c, sample.Text, "0px", Seed.pick (Seed.derive seed "host") hostWidths)
                | 1 -> ProbeCase(probe seed sample.Text "0px" false)
                | _ -> singleNode seed "rectangle" sample
            subject, sample.Script, sample.Kind)

    let rounded runSeed index =
        case "rounded" runSeed index Cases.desktop (fun seed ->
            let sample = sampleFor (Seed.derive seed "text") Corpus.kinds
            let radius = Seed.pick (Seed.derive seed "radius") radii
            let subject =
                match Seed.int (Seed.derive seed "what") 0 3 with
                | 0 ->
                    let c = Seed.pick (Seed.derive seed "component") [ Card; Badge; Button ]
                    ComponentCase(c, sample.Text, radius, Seed.pick (Seed.derive seed "host") hostWidths)
                | 1 -> ProbeCase(probe seed sample.Text radius false)
                | _ -> singleNode seed (Seed.pick (Seed.derive seed "shape") [ "rounded"; "pill" ]) sample
            subject, sample.Script, $"{sample.Kind} radius={radius}")

    let circle runSeed index =
        case "circle" runSeed index Cases.desktop (fun seed ->
            match Seed.int (Seed.derive seed "what") 0 4 with
            | 0 ->
                let t = Seed.pick (Seed.derive seed "glyph") Corpus.indicatorTexts
                ComponentCase(WizardStep, t, "50%", 600.0), Corpus.Latin, $"indicator {t}"
            | 1 ->
                let t = Seed.pick (Seed.derive seed "glyph") Corpus.indicatorTexts
                ComponentCase(TooltipTrigger, t, "50%", 600.0), Corpus.Latin, $"glyph {t}"
            | 2 ->
                let sample = sampleFor (Seed.derive seed "text") [ "one-char"; "short"; "medium"; "paragraph"; "cjk-short"; "numbers"; "hebrew" ]
                ProbeCase(probe seed sample.Text "50%" true), sample.Script, sample.Kind
            | _ ->
                let sample = sampleFor (Seed.derive seed "text") [ "one-char"; "short"; "medium"; "paragraph"; "cjk"; "unbroken"; "hebrew" ]
                let shape = Seed.pick (Seed.derive seed "shape") [ "ellipse"; "ellipse"; "diamond" ]
                let spec =
                    match singleNode seed shape sample with
                    | DiagramCase d ->
                        // Half the ellipses are authored circles (width = height).
                        let circle = shape = "ellipse" && Seed.chance (Seed.derive seed "circle") 0.5
                        let w = Seed.pick (Seed.derive seed "cw") [ 96.0; 120.0; 160.0; 200.0 ]
                        DiagramCase { d with Nodes = d.Nodes |> List.map (fun n -> if circle then { n with Width = Some w; Height = Some w } else n) }
                    | other -> other
                spec, sample.Script, $"{sample.Kind} {shape}")

    let nested runSeed index =
        case "nested" runSeed index Cases.desktop (fun seed ->
            let sample = sampleFor (Seed.derive seed "text") [ "short"; "medium"; "paragraph"; "unbroken"; "cjk"; "url" ]
            let radius = Seed.pick (Seed.derive seed "radius") radii
            let inner =
                match Seed.int (Seed.derive seed "inner") 0 3 with
                | 0 -> ComponentCase(Seed.pick (Seed.derive seed "c") [ Button; Badge ], sample.Text, Seed.pick (Seed.derive seed "ir") radii, 600.0)
                | 1 -> ProbeCase(probe (Seed.derive seed "ip") sample.Text (Seed.pick (Seed.derive seed "ir") radii) false)
                | 2 -> DiagramCase(graph (Seed.derive seed "g"))
                | _ -> singleNode (Seed.derive seed "sn") (Seed.pick (Seed.derive seed "s") shapes) sample
            let host =
                if Seed.chance (Seed.derive seed "host") 0.5 then CardHost radius
                else ProbeHost(probe (Seed.derive seed "op") "" radius false)
            Nested(host, inner), sample.Script, $"{sample.Kind} host-radius={radius}")

    let responsive runSeed index =
        let seed0 = Seed.derive runSeed $"responsive/{index}/page"
        let page =
            { ViewportW = Seed.pick (Seed.derive seed0 "vw") [ 320; 375; 768; 1280 ]
              ViewportH = 800
              Typography =
                { RootPercent = Seed.pick (Seed.derive seed0 "root") [ 100; 125; 150; 200 ]
                  LetterSpacingEm = Seed.pick (Seed.derive seed0 "ls") [ 0.0; 0.0; 0.05; 0.12 ]
                  LineHeight = Seed.pick (Seed.derive seed0 "lh") [ None; None; Some 1.0; Some 1.5; Some 2.0 ]
                  Weight = Seed.pick (Seed.derive seed0 "fw") [ 400; 400; 700 ] } }
        case "responsive" runSeed index page (fun seed ->
            if Seed.chance (Seed.derive seed "diagram") 0.6 then
                DiagramCase(graph seed), Corpus.Latin, "graph"
            else
                let sample = sampleFor (Seed.derive seed "text") Corpus.kinds
                let c = Seed.pick (Seed.derive seed "component") [ Card; Badge; Button; Alert; MetricCard; Callout; WizardStep ]
                ComponentCase(c, sample.Text, Seed.pick (Seed.derive seed "radius") radii, Seed.pick (Seed.derive seed "host") hostWidths), sample.Script, sample.Kind)

    /// Round 2 (Section 8, step 8): cases built to defeat the corrections. Each
    /// index takes one hypothesis in turn.
    let challenge runSeed index =
        let hypotheses =
            [ "fan-in"; "long-labels"; "lanes"; "cycle"; "meta"; "extreme-text"; "text-300"; "narrow-authored"; "mixed-shapes-down"; "causa-like" ]
        let h = hypotheses[index % hypotheses.Length]
        let seed0 = Seed.derive runSeed $"challenge/{index}/page"
        let page =
            match h with
            | "text-300" ->
                { Cases.desktop with
                    ViewportW = Seed.pick seed0 [ 320; 1280 ]
                    Typography = { Cases.defaultTypography with RootPercent = Seed.pick (Seed.derive seed0 "r") [ 200; 250; 300 ]; LetterSpacingEm = 0.12; LineHeight = Some 1.5 } }
            | _ -> Cases.desktop
        case "challenge" runSeed index page (fun seed ->
            let text k = sampleFor (Seed.derive seed k) [ "medium"; "paragraph"; "cjk"; "hebrew"; "unbroken"; "url"; "emoji"; "combining"; "long-words"; "identifier" ]
            let plain (id: string) (kind: string) (label: string) =
                { Id = id; Kind = kind; Label = label; Description = None; Shape = None; Width = None; Height = None; Status = None }
            let base' = graph seed
            let spec =
                match h with
                | "fan-in" ->
                    let n = Seed.int (Seed.derive seed "n") 4 9
                    { base' with
                        Direction = Seed.pick (Seed.derive seed "dir") [ "right"; "down" ]
                        Nodes = [ for i in 1..n -> plain $"h{i}" "task" (text $"t{i}").Text ] @ [ plain "out" "end" (text "out").Text ]
                        Edges = [ for i in 1..n -> { Source = $"h{i}"; Target = "out"; Label = Some(Seed.pick (Seed.derive seed $"l{i}") edgeLabels); Direction = None } ]
                        Zoom = 1.0 }
                | "long-labels" ->
                    { base' with Edges = base'.Edges |> List.mapi (fun i e -> { e with Label = Some((text $"el{i}").Text) }); Zoom = 1.0 }
                | "lanes" ->
                    let ids = base'.Nodes |> List.map _.Id
                    let half = max 1 (ids.Length / 2)
                    { base' with
                        Groups =
                            [ { GroupId = "lane-a"; GroupKind = "swimlane"; GroupLabel = (text "la").Text; Members = List.take half ids }
                              { GroupId = "lane-b"; GroupKind = "swimlane"; GroupLabel = "Operations"; Members = List.skip half ids } ] }
                | "cycle" ->
                    let first, last = base'.Nodes.Head.Id, (List.last base'.Nodes).Id
                    { base' with Edges = base'.Edges @ [ { Source = last; Target = first; Label = Some "retry"; Direction = None }; { Source = first; Target = first; Label = Some "loop"; Direction = None } ] }
                | "meta" ->
                    { base' with Nodes = base'.Nodes |> List.mapi (fun i n -> { n with Status = Some(Seed.pick (Seed.derive seed $"st{i}") [ "active"; "blocked"; "waiting"; "complete" ]) }) }
                | "extreme-text" ->
                    let k = Seed.pick (Seed.derive seed "x") [ "extreme-paragraph"; "unbroken"; "cjk"; "emoji"; "combining" ]
                    let t = String.concat " " (List.replicate 4 (Corpus.byKind k).Text)
                    { base' with Nodes = base'.Nodes |> List.map (fun n -> { n with Label = t; Shape = Some(Seed.pick (Seed.derive seed n.Id) shapes); Width = None; Height = None }); Zoom = 1.0 }
                | "narrow-authored" ->
                    { base' with Nodes = base'.Nodes |> List.mapi (fun i n -> { n with Width = Some(Seed.pick (Seed.derive seed $"w{i}") [ 96.0; 120.0 ]); Height = None }) }
                | "mixed-shapes-down" ->
                    { base' with Direction = "down"; Nodes = base'.Nodes |> List.mapi (fun i n -> { n with Shape = Some(List.item (i % shapes.Length) shapes); Width = None; Height = None }) }
                | _ ->
                    // Causa-shaped: long statements fan into one long outcome pill, role labels on every edge.
                    let n = Seed.int (Seed.derive seed "n") 3 10
                    let statement i = (Corpus.byKind (Seed.pick (Seed.derive seed $"s{i}") [ "paragraph"; "long-paragraph"; "medium" ])).Text
                    { base' with
                        Direction = "right"
                        Nodes =
                            [ for i in 1..n -> { plain $"h{i}" "task" (statement i) with Description = Some "Hypothesis · Supported · 4 supporting, 1 contradicting evidence" } ]
                            @ [ { plain "out" "end" (Corpus.byKind "long-paragraph").Text with Description = Some "Outcome · causal relationship Confirmed" } ]
                        Edges = [ for i in 1..n -> { Source = $"h{i}"; Target = "out"; Label = Some(Seed.pick (Seed.derive seed $"r{i}") [ "Root cause"; "Trigger"; "Contributing factor"; "Enabling condition" ]); Direction = None } ]
                        Zoom = Seed.pick (Seed.derive seed "z") [ 0.5; 1.0; 1.5 ] }
            DiagramCase spec, Corpus.Latin, h)

    let all = [ "rectangle", rectangle; "rounded", rounded; "circle", circle; "nested", nested; "responsive", responsive; "challenge", challenge ]

    let generate (runSeed: uint64) (perFamily: int) (families: string list) =
        all
        |> List.filter (fun (name, _) -> (families.IsEmpty && name <> "challenge") || List.contains name families)
        |> List.collect (fun (_, gen) -> [ for i in 0 .. perFamily - 1 -> gen runSeed i ])
