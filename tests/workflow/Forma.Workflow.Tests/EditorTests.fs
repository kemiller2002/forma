/// The embeddable editor engine and its host protocol.
module EditorTests

open Harness
open Forma.Workflow

let private ui name key value =
    Ui { Name = name; Key = key; Arg = None; Value = value; Fields = []; Toggle = false; Shift = false }

let private start mode id =
    let s, events = Embed.update (Init(mode, Some(fixtureText id))) (Embed.initial mode "t1")
    expect (events |> List.exists (function Loaded r -> Validation.isValid r | _ -> false)) "loaded"
    s

let private run msgs s = msgs |> List.fold (fun (st, acc) m -> let st, ev = Embed.update m st in st, acc @ ev) (s, [])
let private changes events = events |> List.choose (function Changed c -> Some c | _ -> None)
let private doc (s: EmbedState) = Option.get s.Workflow

let all =
    [ test "Edit mode: add, connect, rename, move, resize, undo and redo go through validated commands" (fun () ->
          let s = start EditMode "multi-step"
          let s, ev = run [ ui "add-node" None None ] s
          let added = (doc s).Nodes |> List.last
          equal 1 (changes ev).Length "one change"
          equal [ NodeRef added.Id ] s.Selection "new node selected"
          let s, _ = run [ ui "connect-start" None None; ui "select" (Some "node:ship") None ] s
          expect ((doc s).Edges |> List.exists (fun e -> e.Source.Node = added.Id && e.Target.Node.Value = "ship")) "connected"
          let s, _ = run [ ui "set-label" (Some(ObjectRef.key (NodeRef added.Id))) (Some "Range safety review") ] s
          equal "Range safety review" ((doc s).Nodes |> List.find (fun n -> n.Id = added.Id)).Label "renamed"
          let before = ((doc s).Nodes |> List.find (fun n -> n.Id.Value = "test")).Layout.Position
          let s, _ = run [ SelectObjects [ NodeRef(ObjectId.create "test") ]; ui "key" (Some "node:test") (Some "ArrowRight") ] s
          let after = ((doc s).Nodes |> List.find (fun n -> n.Id.Value = "test")).Layout.Position
          expect (after.Value.X = (Layout.resolve (Option.get (Embed.update Undo s |> fst).Workflow)).Nodes[ObjectId.create "test"].X + 8.0 || before <> after) "moved by keyboard"
          let s, _ = run [ ui "gesture-resize" (Some "node:test") (Some "40 16") ] s
          let s2, _ = run [ Undo; Undo ] s
          let s3, _ = run [ Redo; Redo ] s2
          equal (doc s) (doc s3) "redo restores"
          expect (Validation.isValid (Validation.check (doc s))) "still valid")

      test "Commands that would break the workflow are refused and change nothing" (fun () ->
          let s = start EditMode "runtime-ports"
          let bad = Execute(Connect({ Node = ObjectId.create "vent"; Port = None }, { Node = ObjectId.create "tank"; Port = Some(LocalId.create "fill") }, None))
          let s2, ev = run [ bad ] s
          expect (ev |> List.exists (function Refused _ -> true | _ -> false)) "refused (port cardinality)"
          equal (doc s) (doc s2) "unchanged"
          let _, ev = run [ Execute(SetText(NodeRef(ObjectId.create "tank"), LabelText, Some "  ")) ] s
          expect (ev |> List.exists (function Refused _ -> true | _ -> false)) "blank name refused")

      test "Read-only modes never change the document" (fun () ->
          for mode in [ ViewMode; InspectMode; PickMode; RuntimeMode ] do
              let s = start mode "multi-step"
              let s2, ev = run [ ui "add-node" None None; Execute AutoLayout; ui "delete" None None; Undo ] s
              equal (doc s) (doc s2) $"{mode}"
              expect (changes ev).IsEmpty $"{mode}: no change events")

      test "Unknown metadata and extensions survive editing in the component" (fun () ->
          let s = start EditMode "extensions"
          let original = parse (fixtureText "extensions")
          let s, _ = run [ ui "set-label" (Some "node:approve") (Some "Range approval (revised)"); Execute AutoLayout; ui "add-node" None None ] s
          let out = Codec.encode (doc s)
          equal (Json.field "extensions" original) (Json.field "extensions" out) "workflow extensions"
          let nodeExt (j: Json) = match Json.field "nodes" j with Some(Json.Array ns) -> Json.field "extensions" ns[1] | _ -> None
          equal (nodeExt original) (nodeExt out) "node extensions")

      test "Metadata is edited with explicit types and unknown fields are kept" (fun () ->
          let s = start EditMode "node-metadata"
          let add key kind value =
              Ui { Name = "add-metadata"; Key = Some "node:qualify"; Arg = None; Value = None; Fields = [ "key", key; "type", kind; "value", value ]; Toggle = false; Shift = false }
          let s, _ = run [ add "risk" "text" "low"; add "hours" "number" "12.50"; add "flight" "boolean" "yes"; add "limits" "json" "{\"max\":3}" ] s
          let meta = ((doc s).Nodes |> List.find (fun n -> n.Id.Value = "qualify")).Metadata.Value
          equal (Json.String "low") (meta |> List.find (fst >> (=) "risk") |> snd) "text"
          equal (Json.Number "12.50") (meta |> List.find (fst >> (=) "hours") |> snd) "number spelling"
          equal (Json.Bool true) (meta |> List.find (fst >> (=) "flight") |> snd) "boolean"
          expect (meta |> List.exists (fst >> (=) "procedure")) "existing field kept"
          let _, ev = run [ add "bad" "number" "twelve" ] s
          expect (ev |> List.exists (function Refused _ -> true | _ -> false)) "bad number refused")

      test "Selection, pick and intents are reported to the host as events" (fun () ->
          let s = start PickMode "multi-step"
          let s, ev = run [ ui "select" (Some "node:inspect") None; ui "select" (Some "node:test") None; ui "pick-confirm" None None ] s
          expect (ev |> List.exists (function Picked [ NodeRef a; NodeRef b ] -> a.Value = "inspect" && b.Value = "test" | _ -> false)) "picked both"
          let s = start ViewMode "embedded-edit"
          let _, ev = run [ ui "intent" (Some "node:peer") None ] s
          expect (ev |> List.exists (function IntentActivated(_, Command(q, _, _)) -> q.Value = "com.example.lab:open-review" | _ -> false)) "intent")

      test "Runtime state is an overlay: the view changes, the document does not" (fun () ->
          let s = start RuntimeMode "embedded-view"
          let s2, _ = run [ SetRuntimeState [ ObjectId.create "land", Some { State = CoreStatus(Active, Some "Descending"); Detail = None; UpdatedAt = None } ] ] s
          equal (doc s) (doc s2) "document unchanged"
          let html = Markup.toCompactHtml (EmbedView.view RenderOptions.defaults s2)
          expect (html.Contains "Descending") "overlay rendered")

      test "Host protocol: versioned JSON in, HTML and public events out" (fun () ->
          let msg = Json.compact (Json.Object [ "protocol", Json.String Embed.protocol; "instance", Json.String "a1"; "type", Json.String "init"; "mode", Json.String "edit"; "document", parse (fixtureText "minimal") ])
          let sessions, reply = EmbedHost.dispatch RenderOptions.defaults msg EmbedHost.empty
          let r = parse reply
          equal (Some(Json.String Embed.protocol)) (Json.field "protocol" r) "protocol"
          expect (match Json.field "html" r with Some(Json.String h) -> h.Contains "ef-workflow-editor" | _ -> false) "html"
          let cmd = Json.compact (Json.Object [ "protocol", Json.String Embed.protocol; "instance", Json.String "a1"; "type", Json.String "command"; "command", Json.Object [ "name", Json.String "addNode"; "label", Json.String "Added by host" ] ])
          let sessions, reply = EmbedHost.dispatch RenderOptions.defaults cmd sessions
          expect (reply.Contains "\"type\":\"change\"") "change event"
          expect ((EmbedHost.document "a1" sessions).Value.Contains "Added by host") "document"
          let _, wrong = EmbedHost.dispatch RenderOptions.defaults (cmd.Replace(Embed.protocol, "forma-workflow-host/9")) sessions
          expect (wrong.Contains "unsupported protocol") "version checked")

      test "The editor view escapes untrusted content and emits no script" (fun () ->
          let report = mutate "minimal" [ [ "nodes"; "0"; "label" ], Json.String "<img src=x onerror=alert(1)>"; [ "nodes"; "0"; "metadata" ], Json.Object [ "x", Json.String "<script>alert(2)</script>" ] ]
          let s, _ = Embed.update (Init(EditMode, Some(Json.serialize (Codec.encode (Option.get report.Workflow))))) (Embed.initial EditMode "t")
          let s, _ = Embed.update (SelectObjects [ NodeRef(ObjectId.create "start") ]) s
          let html = Markup.toCompactHtml (EmbedView.view RenderOptions.defaults s)
          expect (not (html.Contains "<img") && not (html.Contains "<script")) "escaped") ]
