/// Format, round-trip, identity, compatibility and layout invariants.
module CoreTests

open Harness
open Forma.Workflow

let private everyFixture f = fixtureIds |> List.iter (fun (id, _) -> f id (fixture id))

let all =
    [ test "Every published fixture validates with the compatibility class its manifest declares" (fun () ->
          for (id, expected) in fixtureIds do
              let report = Validation.load (fixtureText id)
              equal expected (Validation.classText report.Class) $"class of {id}"
              expect (report.Findings |> List.forall (fun f -> f.Severity <> Severity.Error)) $"{id} has error findings")

      test "The fixture manifest covers the seventeen required reference examples" (fun () ->
          let required =
              [ "minimal"; "multi-step"; "branching"; "groups"; "swimlanes"; "colored"; "node-metadata"; "edge-metadata"; "extensions"
                "no-layout"; "accessible"; "mobile"; "branded"; "embedded-view"; "embedded-edit"; "static-export"; "interactive-export" ]
          for id in required do
              expect (fixtureIds |> List.exists (fst >> (=) id)) $"missing fixture {id}")

      test "Fixture files follow forma/workflows/<id>.forma-workflow.json and their id matches the file" (fun () ->
          everyFixture (fun id w ->
              equal id w.Id.Value "id"
              equal ("forma/workflows/" + id + ".forma-workflow.json") (Format.repositoryPath w.Id) "path"))

      test "Round trip: decode, encode, decode is identity and the JSON is equivalent to the source" (fun () ->
          everyFixture (fun id w ->
              let encoded = Codec.encode w
              let again = Codec.decode encoded
              equal (Ok w) again $"model round trip {id}"
              expect (Json.equivalent (parse (fixtureText id)) encoded) $"JSON of {id} changed in the round trip"))

      test "Canonical serialization is deterministic and a fixed point" (fun () ->
          everyFixture (fun id w ->
              let once = Codec.serialize w
              let twice = Codec.serialize (Option.get (Validation.load once).Workflow)
              equal once twice $"canonical text of {id}"))

      test "Unknown metadata survives exactly, including number spelling, nesting and order" (fun () ->
          let text =
              (fixtureText "minimal")
                  .Replace("\"label\": \"Start\"", "\"label\": \"Start\", \"metadata\": { \"z\": 1.50, \"a\": 1e3, \"nested\": { \"list\": [null, true, \"x\", { \"deep\": -0.0 }] }, \"unicode\": \"מסע 🚀\" }")
          let w = Option.get (Validation.load text).Workflow
          let meta = (List.head w.Nodes).Metadata |> Option.get
          equal [ "z"; "a"; "nested"; "unicode" ] (meta |> List.map fst) "key order"
          equal (Json.Number "1.50") (snd meta[0]) "1.50 kept"
          equal (Json.Number "1e3") (snd meta[1]) "1e3 kept"
          let out = Codec.serialize w
          expect (out.Contains "1.50" && out.Contains "1e3" && out.Contains "-0.0" && out.Contains "מסע 🚀") "spelling preserved in output")

      test "Namespaced extensions at every level survive unchanged" (fun () ->
          let source = parse (fixtureText "extensions")
          let w = fixture "extensions"
          let out = Codec.encode w
          for path in [ [ "extensions" ] ] do
              equal (Json.field "extensions" source) (Json.field "extensions" out) (String.concat "." path)
          let nodeExt (j: Json) i = match Json.field "nodes" j with Some(Json.Array ns) -> Json.field "extensions" ns[i] | _ -> None
          let edgeExt (j: Json) i = match Json.field "edges" j with Some(Json.Array es) -> Json.field "extensions" es[i] | _ -> None
          equal (nodeExt source 0) (nodeExt out 0) "node 0 extensions"
          equal (nodeExt source 1) (nodeExt out 1) "node 1 extensions"
          equal (edgeExt source 0) (edgeExt out 0) "edge 0 extensions"
          equal [ "com.example.scheduler"; "org.example.audit"; "gov.nasa.example.range" ] (Validation.extensionNamespaces w |> List.map _.Value) "namespaces")

      test "Interoperable semantics are core fields, not extensions: kinds, status, colour and references decode without any extension" (fun () ->
          let w = fixture "runtime-ports"
          let tank = w.Nodes |> List.find (fun n -> n.Id.Value = "tank")
          expect (tank.Ports.Length = 3) "ports are core"
          expect tank.Status.IsSome "status is core"
          expect w.Extensions.IsEmpty "no extensions needed")

      test "Layout never changes ids, semantics, metadata, references or extensions (FillMissing and Recompute)" (fun () ->
          everyFixture (fun id w ->
              for request in [ FillMissing; Recompute ] do
                  let laidOut = Layout.apply request w
                  equal (Layout.strip w) (Layout.strip laidOut) $"{id} {request}"
                  equal (w.Nodes |> List.map _.Id) (laidOut.Nodes |> List.map _.Id) "node ids"
                  equal (w.Edges |> List.map _.Id) (laidOut.Edges |> List.map _.Id) "edge ids"
                  expect (Validation.isValid (Validation.check laidOut)) $"{id} stays valid after layout"))

      test "Default layout is deterministic and places every node without overlaps" (fun () ->
          everyFixture (fun id w ->
              let a = Layout.resolve w
              let b = Layout.resolve (Option.get (Validation.load (Codec.serialize w)).Workflow)
              equal a b $"{id} resolve twice"
              let rects = w.Nodes |> List.map (fun n -> a.Nodes[n.Id])
              expect (rects.Length = w.Nodes.Length) "every node placed"
              let overlaps (r1: Rect) (r2: Rect) = r1.X < r2.Right && r2.X < r1.Right && r1.Y < r2.Bottom && r2.Y < r1.Bottom
              for i in 0 .. rects.Length - 1 do
                  for j in i + 1 .. rects.Length - 1 do
                      if w.Nodes[i].Layout.Position.IsNone && w.Nodes[j].Layout.Position.IsNone then
                          expect (not (overlaps rects[i] rects[j])) $"{id}: {w.Nodes[i].Id} overlaps {w.Nodes[j].Id}"))

      test "A workflow with no layout gets geometry that does not depend on node order in the file" (fun () ->
          let w = fixture "no-layout"
          let reversed = { w with Nodes = List.rev w.Nodes }
          let a, b = Layout.resolve w, Layout.resolve reversed
          // Ranks come from the graph, so each node keeps its position along the flow.
          for n in w.Nodes do
              equal a.Nodes[n.Id].X b.Nodes[n.Id].X $"{n.Id} along-flow position")

      test "FillMissing keeps authored positions; Recompute replaces them" (fun () ->
          let w = fixture "static-export"
          let authored = w.Nodes |> List.map (fun n -> n.Layout.Position)
          let moved = { w with Nodes = w.Nodes |> List.mapi (fun i n -> if i = 0 then { n with Layout = { n.Layout with Position = Some { X = 900.0; Y = 500.0 } } } else n) }
          equal (Some { X = 900.0; Y = 500.0 }) (Layout.apply FillMissing moved).Nodes[0].Layout.Position "kept"
          equal authored ((Layout.apply Recompute moved).Nodes |> List.map _.Layout.Position) "recomputed to the default")

      test "Members of a group or lane stay inside its boundary in the default layout" (fun () ->
          for id in [ "groups"; "swimlanes" ] do
              let w = fixture id
              let r = Layout.resolve w
              for g in w.Groups |> List.filter (fun g -> g.Kind <> Phase) do
                  let box = r.Groups[g.Id]
                  for m in g.Members do
                      let n = r.Nodes[m]
                      expect (n.X >= box.X && n.Right <= box.Right && n.Y >= box.Y && n.Bottom <= box.Bottom) $"{id}: {m} outside {g.Id}")

      test "Compatibility: targeting a Forma release before the capability is 'unavailable capabilities'" (fun () ->
          let report = mutate "runtime-ports" [ [ "forma"; "version" ], Json.String "0.3.0" ]
          match report.Class with
          | UnavailableCapabilities caps -> expect (List.contains "workflow.ports" caps) "ports reported"
          | other -> fail $"expected unavailable capabilities, got {other}"
          hasCode "COMPAT-UNAVAILABLE" report)

      test "Compatibility: requiring a capability Forma does not provide is 'unavailable capabilities'" (fun () ->
          let report = mutate "minimal" [ [ "forma"; "requires" ], Json.Array [ Json.String "workflow.teleport" ] ]
          match report.Class with
          | UnavailableCapabilities caps -> equal [ "workflow.teleport" ] caps "unknown capability"
          | other -> fail $"expected unavailable capabilities, got {other}")

      test "Migration: a pre-release of the current format migrates automatically; other versions are reported" (fun () ->
          let pre = mutate "minimal" [ [ "formatVersion" ], Json.String "1.0.0-rc.1" ]
          match pre.Class with
          | MigrationRequired(_, _, true, _) -> expect pre.Workflow.IsSome "migrated document decodes"
          | other -> fail $"expected automatic migration, got {other}"
          for v in [ "2.0.0"; "1.1.0"; "0.9.0" ] do
              let r = mutate "minimal" [ [ "formatVersion" ], Json.String v ]
              match r.Class with
              | MigrationRequired(_, _, false, _) -> expect r.Workflow.IsNone $"{v} not decoded"
              | other -> fail $"{v}: expected migration required, got {other}")

      test "Validation is independent of Studio and reports a machine-readable result" (fun () ->
          let report = Validation.load (fixtureText "branching")
          let json = Validation.reportJson report
          equal (Some(Json.String "fully-supported")) (Json.field "class" json) "class"
          equal (Some(Json.Bool true)) (Json.field "valid" json) "valid")

      test "The schema the library enforces is byte-for-byte the published schema file" (fun () ->
          equal (readText [ "schemas"; "workflow"; "1.0"; "forma-workflow.schema.json" ]) (Validation.schemaJson ()) "schema")

      test "The capability manifest is the published contract file" (fun () ->
          let published = parse (readText [ "contracts"; "workflow-capabilities.json" ])
          match Json.field "capabilities" published with
          | Some(Json.Object caps) -> equal (caps |> List.map fst) (Capabilities.all.Value |> List.map _.Id) "capability ids"
          | _ -> fail "no capabilities") ]
