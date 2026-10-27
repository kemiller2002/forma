#r "/home/user/repos/forma-studio/src/engine/FormaStudio.Engine/bin/Release/net8.0/FormaStudio.Engine.dll"
#r "/home/user/repos/forma-studio/src/engine/FormaStudio.Engine/bin/Release/net8.0/Forma.Workflow.dll"
open FormaStudio.Engine
let d : DiagramId = Samples.idOf "probe"
let paragraph = "Counter interrupts from the rendezvous radar coupling data units stole computer capacity, and the executive raised a program alarm each time its queue overflowed."
let steps =
    [ "add diagram", Flow(AddDiagram(d, "Probe", { Id = "workflow"; Version = "1.0.0" }))
      "add node with a paragraph label in an 8x8 box", Flow(AddNode(d, Samples.idOf "a", "activity", paragraph, 40.0, 40.0, 8.0, 8.0))
      "add a second node overlapping the first", Flow(AddNode(d, Samples.idOf "b", "activity", "Overlapping", 42.0, 42.0, 200.0, 120.0))
      "resize node a to 8x8 again", Flow(ResizeNode(d, Samples.idOf "a", 8.0, 8.0))
      "rename node b to a 600-character label", Flow(SetNodeLabel(d, Samples.idOf "b", String.replicate 4 paragraph)) ]
let final =
    steps
    |> List.fold (fun (p: Project) (name, cmd) ->
        match Commands.execute cmd p with
        | Ok applied -> printfn "ACCEPTED  %s (obligations: %d)" name applied.Obligations.Length; applied.Project
        | Error fs -> printfn "REFUSED   %s: %A" name (fs |> List.map (fun f -> f.Code)); p) (Samples.emptyProject "lce" "LCE probe")
printfn "%A" (LayoutChecks.page |> ignore; "Studio LayoutChecks apply to Layout pages only; no diagram geometry check exists.")
let findings = Validation.run final
printfn "Studio Validation.project findings: %d %A" findings.Length (findings |> List.map (fun f -> f.Code))
