/// Static HTML rendering: determinism, safety, public contracts, accessibility.
module RenderTests

open System
open System.IO
open System.Text.RegularExpressions
open Harness
open Forma.Workflow

let private publicCss =
    lazy
        ([ "tokens.css"; "foundations.css"; "components.css" ]
         |> List.choose (fun f -> let p = path [ "src"; "styles"; f ] in if File.Exists p then Some(File.ReadAllText p) else None)
         |> String.concat "\n")

let private classes (html: string) =
    Regex.Matches(html, "class=\"([^\"]*)\"") |> Seq.collect (fun m -> m.Groups[1].Value.Split(' ', StringSplitOptions.RemoveEmptyEntries)) |> Seq.distinct |> List.ofSeq

let private ids (html: string) = Regex.Matches(html, " id=\"([^\"]*)\"") |> Seq.map (fun m -> m.Groups[1].Value) |> List.ofSeq

let private fragmentOf w = (WorkflowDocument.fragment DocumentOptions.defaults w).Html

let private golden (name: string) (actual: string) =
    let file = path [ "examples"; "workflows"; "exports"; name ]
    if Environment.GetEnvironmentVariable "FORMA_UPDATE_GOLDEN" = "1" then
        Directory.CreateDirectory(Path.GetDirectoryName file) |> ignore
        File.WriteAllText(file, actual)
    expect (File.Exists file) $"golden file {name} is missing (run with FORMA_UPDATE_GOLDEN=1)"
    equal (File.ReadAllText file) actual $"golden {name}"

let private interactiveOptions mode =
    { DocumentOptions.defaults with Interactivity = InteractiveOutput(mode, "node_modules/@echelon-foundry/forma-workflow/dist/") }

let all =
    [ test "Rendering is deterministic: the same workflow and options give byte-identical HTML" (fun () ->
          for (id, _) in fixtureIds do
              let w = fixture id
              equal (fragmentOf w) (fragmentOf (Option.get (Validation.load (Codec.serialize w)).Workflow)) id
              equal (WorkflowDocument.document DocumentOptions.defaults w).Html (WorkflowDocument.document DocumentOptions.defaults w).Html id)

      test "Static output has no script, no event handlers and no script URLs" (fun () ->
          for (id, _) in fixtureIds do
              for html in [ fragmentOf (fixture id); (WorkflowDocument.document DocumentOptions.defaults (fixture id)).Html ] do
                  expect (not (html.Contains "<script")) $"{id}: script"
                  expect (not (Regex.IsMatch(html, "\\son[a-z]+=", RegexOptions.IgnoreCase))) $"{id}: event handler"
                  expect (not (html.Contains "javascript:")) $"{id}: javascript URL")

      test "Static output uses only public Forma classes and no Studio or editor-only classes" (fun () ->
          for (id, _) in fixtureIds do
              for c in classes (fragmentOf (fixture id)) do
                  expect (c.StartsWith "ef-") $"{id}: non-Forma class {c}"
                  expect (not (c.Contains "studio") && not (c.Contains "editor")) $"{id}: editor class {c}"
                  expect (Regex.IsMatch(publicCss.Value, "\\." + Regex.Escape c + "(?![a-zA-Z0-9_-])")) $"{id}: {c} is not in the public Forma CSS")

      test "Element ids are unique and every aria-labelledby/aria-describedby reference resolves" (fun () ->
          for (id, _) in fixtureIds do
              let html = fragmentOf (fixture id)
              let all = ids html
              equal (List.distinct all) all $"{id}: duplicate ids"
              for m in Regex.Matches(html, "aria-(?:labelledby|describedby)=\"([^\"]*)\"") do
                  for target in m.Groups[1].Value.Split ' ' do
                      expect (List.contains target all) $"{id}: dangling reference {target}")

      test "Every connector has a text equivalent and every group lists its members" (fun () ->
          for (id, _) in fixtureIds do
              let w = fixture id
              let html = fragmentOf w
              let items = Regex.Matches(html, "<ol class=\"ef-diagram__relations\"[^>]*>([\\s\\S]*?)</ol>")
              let count = if items.Count = 0 then 0 else Regex.Matches(items[0].Value, "<li>").Count
              equal w.Edges.Length count $"{id}: relationship items"
              for g in w.Groups do
                  expect (html.Contains("<dt>" + Markup.escapeText (Phrases.english.GroupKind g.Kind + ": " + g.Label))) $"{id}: group {g.Id} in membership list")

      test "Every node is named and states its kind and status in text, not colour" (fun () ->
          let w = fixture "embedded-view"
          let html = fragmentOf w
          for n in w.Nodes do
              expect (html.Contains(Markup.escapeText n.Label)) $"label {n.Id}"
          expect (Regex.IsMatch(html, "<dt>Status</dt>\\s*<dd>In progress</dd>")) "status text"
          expect (html.Contains "data-ef-status=\"active\"") "secondary status cue")

      test "Untrusted text is escaped everywhere it is rendered" (fun () ->
          let payload = "<script>alert(1)</script><img src=x onerror=alert(2)>\"'&"
          let report =
              mutate
                  "node-metadata"
                  [ [ "title" ], Json.String payload
                    [ "nodes"; "0"; "label" ], Json.String payload
                    [ "nodes"; "0"; "description" ], Json.String payload
                    [ "nodes"; "0"; "metadata"; "owner" ], Json.String payload
                    [ "nodes"; "2"; "references"; "0"; "label" ], Json.String payload
                    [ "edges"; "0"; "label" ], Json.String payload ]
          let w = Option.get report.Workflow
          let opts = { DocumentOptions.defaults with Render = { RenderOptions.defaults with VisibleMetadata = [ "owner" ] } }
          for html in [ (WorkflowDocument.fragment opts w).Html; (WorkflowDocument.document opts w).Html; (WorkflowDocument.document (interactiveOptions EditMode) w).Html ] do
              expect (not (html.Contains "<img")) "raw img"
              expect (not (html.Contains "<script>alert")) "raw script"
              expect (html.Contains "&lt;script&gt;alert(1)&lt;/script&gt;") "escaped text present")

      test "The JSON source embedded for interactive output cannot close its script element" (fun () ->
          let report = mutate "minimal" [ [ "nodes"; "0"; "label" ], Json.String "</script><script>alert(1)</script>" ]
          let html = (WorkflowDocument.fragment (interactiveOptions ViewMode) (Option.get report.Workflow)).Html
          equal 1 (Regex.Matches(html, "</script>").Count) "only the data block closes"
          expect (html.Contains "\\u003c/script\\u003e") "escaped in JSON")

      test "Unsafe reference links are not emitted even if a host renders without validating" (fun () ->
          let w = fixture "node-metadata"
          let evil =
              { w with
                  Nodes =
                      w.Nodes
                      |> List.map (fun n -> { n with References = n.References |> List.map (fun r -> { r with Href = Some "javascript:alert(1)" }) }) }
          let html = fragmentOf evil
          expect (not (html.Contains "javascript:")) "link suppressed"
          expect (html.Contains "Change request CR-2291") "text kept")

      test "Metadata stays out of the HTML unless the host asks for named fields" (fun () ->
          let w = fixture "node-metadata"
          expect (not ((fragmentOf w).Contains "FSW team")) "hidden by default"
          let shown = (WorkflowDocument.fragment { DocumentOptions.defaults with Render = { RenderOptions.defaults with VisibleMetadata = [ "owner"; "requirements" ] } } w).Html
          expect (Regex.IsMatch(shown, "<dt>owner</dt>\\s*<dd>FSW team</dd>")) "owner shown"
          expect (shown.Contains "FSW-12, FSW-31") "list shown")

      test "Fragments declare their public asset requirements; documents link them" (fun () ->
          let w = fixture "static-export"
          let fragment = WorkflowDocument.fragment DocumentOptions.defaults w
          expect (fragment.Html.StartsWith "<!-- Requires @echelon-foundry/design-system@0.4.0/tokens.css") fragment.Html
          let doc = WorkflowDocument.document { DocumentOptions.defaults with FormaBase = "/assets/forma/"; Brand = Some "echelon" } w
          for css in [ "tokens.css"; "foundations.css"; "components.css"; "brands/echelon.css" ] do
              expect (doc.Html.Contains $"<link rel=\"stylesheet\" href=\"/assets/forma/{css}\">") css
          expect (doc.Html.Contains "data-ef-brand=\"echelon\"") "brand applied"
          equal 4 doc.Dependencies.Length "dependencies")

      test "A complete document is valid HTML structure with doctype, language, charset, viewport and title" (fun () ->
          let html = (WorkflowDocument.document DocumentOptions.defaults (fixture "accessible")).Html
          expect (html.StartsWith "<!doctype html>\n<html lang=\"en\" dir=\"ltr\">") "doctype and lang"
          for part in [ "<meta charset=\"utf-8\">"; "<meta name=\"viewport\""; "<title>Docking approach</title>"; "<main>"; "</html>" ] do
              expect (html.Contains part) part)

      test "Interactive output adds exactly the public runtime, declared, and keeps the static fallback" (fun () ->
          let w = fixture "interactive-export"
          let doc = WorkflowDocument.document (interactiveOptions ViewMode) w
          expect (doc.Html.Contains "<script type=\"module\" src=\"node_modules/@echelon-foundry/forma-workflow/dist/forma-workflow.js\"></script>") "module"
          expect (doc.Html.Contains "<forma-workflow mode=\"view\" workflow=\"interactive-export\">") "element"
          expect (doc.Html.Contains "<figure class=\"ef-diagram\"") "static fallback"
          expect (doc.Dependencies |> List.exists (function RuntimeModule(p, _, _) -> p = "@echelon-foundry/forma-workflow" | _ -> false)) "declared"
          expect (not (doc.Html.Contains "studio")) "no Studio")

      test "Brand and theme values are restricted to safe identifiers" (fun () ->
          let doc = WorkflowDocument.document { DocumentOptions.defaults with Brand = Some "\"><script>"; Theme = Some "neon" } (fixture "minimal")
          expect (not (doc.Html.Contains "data-ef-brand")) "brand rejected"
          expect (not (doc.Html.Contains "data-ef-theme")) "theme rejected")

      test "Golden output: static fragment, static document and interactive document" (fun () ->
          let w = fixture "static-export"
          golden "static-export.fragment.html" (fragmentOf w)
          golden "static-export.document.html" (WorkflowDocument.document DocumentOptions.defaults w).Html
          golden "interactive-export.document.html" (WorkflowDocument.document (interactiveOptions ViewMode) (fixture "interactive-export")).Html
          golden "branded.document.html" (WorkflowDocument.document { DocumentOptions.defaults with Brand = Some "example-harbor" } (fixture "branded")).Html
          golden "mobile.document.html" (WorkflowDocument.document DocumentOptions.defaults (fixture "mobile")).Html
          golden "swimlanes.document.html" (WorkflowDocument.document DocumentOptions.defaults (fixture "swimlanes")).Html) ]
