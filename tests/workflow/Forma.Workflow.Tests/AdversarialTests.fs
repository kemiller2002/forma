/// Structural, semantic and security failures. Workflow files are untrusted data.
module AdversarialTests

open Harness
open Forma.Workflow

let private str (s: string) = Json.String s
let private obj props = Json.Object props

let private structural (report: ValidationReport) label =
    equal StructurallyInvalid report.Class label
    expect report.Workflow.IsNone $"{label}: no workflow"

let private semantic (report: ValidationReport) code =
    equal SemanticallyInvalid report.Class code
    expect report.Workflow.IsSome $"{code}: an editor can still open the document"
    hasCode code report

let all =
    [ test "Not JSON, duplicate keys, comments and trailing commas are structurally invalid" (fun () ->
          for text in [ "not json"; "{\"format\":\"forma-workflow\",\"format\":\"x\"}"; "{ /* c */ }"; "{\"a\":1,}"; "[]"; "\"text\"" ] do
              structural (Validation.load text) text)

      test "Excessive nesting and oversize input are rejected before decoding" (fun () ->
          let deep = String.replicate 200 "[" + String.replicate 200 "]"
          structural (Validation.load deep) "depth"
          match Json.parseWith { MaxBytes = 100; MaxDepth = 64 } (String.replicate 200 " " + "{}") with
          | Ok _ -> fail "oversize accepted"
          | Error e -> expect (e.Contains "exceeds") e)

      test "Another format, a missing format and schema violations are structurally invalid" (fun () ->
          structural (mutate "minimal" [ [ "format" ], str "bpmn" ]) "format"
          structural (mutate "minimal" [ [ "nodes"; "0"; "colour" ], str "#ffffff" ]) "unknown property"
          structural (mutate "minimal" [ [ "nodes"; "0"; "id" ], str "has space" ]) "id pattern"
          structural (mutate "minimal" [ [ "id" ], str "Not-A-File-Stem" ]) "workflow id pattern"
          structural (mutate "minimal" [ [ "nodes"; "0"; "label" ], str "" ]) "empty label"
          structural (mutate "minimal" [ [ "nodes"; "0"; "kind" ], str "teleport" ]) "unknown core kind"
          structural (mutate "minimal" [ [ "nodes"; "0"; "kind" ], str "com.example:teleport" ]) "namespaced kind without kindLabel"
          structural (mutate "minimal" [ [ "nodes"; "0"; "color" ], obj [ "fill", str "red" ] ]) "named colour"
          structural (mutate "minimal" [ [ "nodes"; "0"; "color" ], obj [ "fill", str "#FFFFFF" ] ]) "uppercase hex"
          structural (mutate "minimal" [ [ "nodes"; "0"; "layout" ], obj [ "x", Json.Number "1" ] ]) "x without y"
          structural (mutate "minimal" [ [ "nodes"; "0"; "layout" ], obj [ "width", Json.Number "-5" ] ]) "negative width"
          structural (mutate "minimal" [ [ "extensions" ], obj [ "noNamespace", obj [] ] ]) "extension key"
          structural (mutate "minimal" [ [ "extensions" ], obj [ "com.example", str "not an object" ] ]) "extension value"
          structural (mutate "minimal" [ [ "nodes"; "0"; "interaction" ], obj [ "action", str "navigate" ] ]) "navigate without target"
          structural (mutate "minimal" [ [ "nodes"; "0"; "interaction" ], obj [ "action", str "command"; "command", str "com.example:go" ] ]) "command without label"
          structural (mutate "minimal" [ [ "nodes"; "0"; "interaction" ], obj [ "action", str "script"; "code", str "alert(1)" ] ]) "executable action")

      test "A schema-invalid document reports JSON pointers" (fun () ->
          let report = mutate "minimal" [ [ "nodes"; "0"; "colour" ], str "#ffffff" ]
          expect (report.Findings |> List.exists (fun f -> f.Pointer = "/nodes/0/colour")) $"%A{report.Findings}")

      test "Duplicate ids across nodes, edges and groups are semantically invalid" (fun () ->
          semantic (mutate "multi-step" [ [ "edges"; "0"; "id" ], str "inspect" ]) "ID-DUPLICATE"
          semantic (mutate "multi-step" [ [ "nodes"; "1"; "id" ], str "receive" ]) "ID-DUPLICATE")

      test "Dangling edges, missing ports and port direction violations are reported, not deleted" (fun () ->
          let dangling = mutate "multi-step" [ [ "edges"; "0"; "target"; "node" ], str "ghost" ]
          semantic dangling "REF-DANGLING-EDGE"
          // The data is preserved for repair: the dangling edge is still in the model.
          let w = Option.get dangling.Workflow
          expect (w.Edges |> List.exists (fun e -> e.Target.Node.Value = "ghost")) "dangling edge kept"
          semantic (mutate "runtime-ports" [ [ "edges"; "0"; "source"; "port" ], str "nope" ]) "REF-MISSING-PORT"
          semantic (mutate "runtime-ports" [ [ "edges"; "0"; "source"; "port" ], str "out"; [ "edges"; "0"; "source"; "node" ], str "engine" ]) "REF-MISSING-PORT"
          semantic (mutate "runtime-ports" [ [ "edges"; "1"; "source" ], obj [ "node", str "tank"; "port", str "fill" ] ]) "PORT-DIRECTION")

      test "Port cardinality is enforced" (fun () ->
          let extra = obj [ "id", str "r9"; "source", obj [ "node", str "vent" ]; "target", obj [ "node", str "tank"; "port", str "fill" ] ]
          let json = parse (fixtureText "runtime-ports")
          let edges = match Json.field "edges" json with Some(Json.Array es) -> es | _ -> []
          let report = setAt [ "edges" ] (Json.Array(edges @ [ extra ])) json |> Json.serialize |> Validation.load
          semantic report "PORT-CARDINALITY")

      test "Group members, parents, cycles and conflicting lanes are checked" (fun () ->
          semantic (mutate "groups" [ [ "groups"; "0"; "members"; "0" ], str "ghost" ]) "GROUP-MISSING-MEMBER"
          semantic (mutate "groups" [ [ "groups"; "0"; "parent" ], str "ghost" ]) "GROUP-MISSING-PARENT"
          semantic (mutate "groups" [ [ "groups"; "2"; "parent" ], str "avionics" ]) "GROUP-CYCLE"
          semantic (mutate "swimlanes" [ [ "groups"; "1"; "members" ], Json.Array [ str "safe"; str "detect" ] ]) "GROUP-LANE-CONFLICT")

      test "Interaction targets and palette slots must exist" (fun () ->
          semantic (mutate "embedded-edit" [ [ "nodes"; "2"; "interaction"; "target" ], obj [ "reference", str "missing" ] ]) "REF-INTERACTION-TARGET"
          semantic (mutate "embedded-edit" [ [ "nodes"; "2"; "interaction"; "target" ], obj [ "node", str "missing" ] ]) "REF-INTERACTION-TARGET"
          semantic (mutate "branded" [ [ "nodes"; "0"; "color"; "fill" ], str "palette:nope" ]) "REF-PALETTE")

      test "Script, data and disguised URLs are rejected wherever URLs appear" (fun () ->
          let bad =
              [ "javascript:alert(1)"; "JaVaScRiPt:alert(1)"; " javascript:alert(1)"; "java\tscript:alert(1)"; "data:text/html,<script>alert(1)</script>"
                "vbscript:msgbox(1)"; "file:///etc/passwd"; "\\\\server\\share" ]
          for url in bad do
              expect (not (Validation.isSafeUrl url)) $"accepted {url}"
              semantic (mutate "node-metadata" [ [ "nodes"; "2"; "references"; "0"; "href" ], str url ]) "SEC-UNSAFE-URL"
              semantic (mutate "interactive-export" [ [ "nodes"; "2"; "interaction"; "target"; "url" ], str url ]) "SEC-UNSAFE-URL"
          for url in [ "https://example.org/a?b=c"; "http://example.org"; "mailto:ops@example.org"; "/relative/path"; "../up"; "#node"; "page.html" ] do
              expect (Validation.isSafeUrl url) $"rejected {url}")

      test "The forma extension namespace is reserved" (fun () ->
          semantic (mutate "minimal" [ [ "extensions" ], obj [ "forma.studio", obj [] ] ]) "EXT-RESERVED")

      test "Insufficient text contrast on authored colours is an accessibility error" (fun () ->
          semantic (mutate "colored" [ [ "nodes"; "0"; "color"; "foreground" ], str "#eeeeee" ]) "A11Y-CONTRAST"
          let report = mutate "minimal" [ [ "title" ], str "   " ]
          semantic report "A11Y-TITLE")

      test "Unlabelled branches and bidirectional override text are warned about" (fun () ->
          let report = mutate "branching" [ [ "edges"; "1"; "label" ], Json.Null ]
          // Null is not a string: removing the label must be done structurally.
          equal StructurallyInvalid report.Class "null label"
          let json = parse (fixtureText "branching")
          let edges = match Json.field "edges" json with Some(Json.Array es) -> es | _ -> []
          let stripped = edges |> List.map (function Json.Object p -> Json.Object(p |> List.filter (fun (k, _) -> k <> "label")) | e -> e)
          let unlabelled = setAt [ "edges" ] (Json.Array stripped) json |> Json.serialize |> Validation.load
          hasCode "A11Y-BRANCH-LABEL" unlabelled
          let bidi = mutate "minimal" [ [ "nodes"; "0"; "label" ], str "Approve‮evil" ]
          hasCode "SEC-BIDI-CONTROL" bidi)

      test "Executable-looking content in labels, metadata and extensions is just data" (fun () ->
          let payload = "<script>alert(1)</script><img src=x onerror=alert(2)>"
          let report =
              mutate
                  "minimal"
                  [ [ "nodes"; "0"; "label" ], str payload
                    [ "nodes"; "0"; "metadata" ], obj [ "html", str payload; "onclick", str "alert(3)" ]
                    [ "extensions" ], obj [ "com.example.evil", obj [ "script", str payload ] ] ]
          equal (SupportedWithPreservedExtensions [ Namespace.create "com.example.evil" ]) report.Class "valid data"
          let w = Option.get report.Workflow
          equal payload w.Nodes[0].Label "label kept verbatim as data")

      test "Semantically invalid documents round-trip without losing anyone's data" (fun () ->
          let report = mutate "extensions" [ [ "edges"; "0"; "target"; "node" ], str "ghost" ]
          let w = Option.get report.Workflow
          let again = Validation.load (Codec.serialize w)
          equal SemanticallyInvalid again.Class "still invalid"
          equal report.Workflow again.Workflow "nothing lost") ]
