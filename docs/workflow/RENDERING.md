# Rendering workflows to HTML

Forma renders a workflow to standards-based HTML with its public diagram
contract (`.ef-diagram*`, contract 2.1.0). Static output is HTML and CSS only.
Forma Studio is never involved.

## Fragment

```bash
forma-workflow render forma/workflows/launch.forma-workflow.json --out launch.html --deps launch.deps.json
```

The fragment starts with a comment that declares what it needs:

```html
<!-- Requires @echelon-foundry/design-system@0.4.0/tokens.css, @echelon-foundry/design-system@0.4.0/foundations.css, @echelon-foundry/design-system@0.4.0/components.css -->
<figure class="ef-diagram" id="wf-static-export" aria-labelledby="wf-static-export-title">
  <figcaption id="wf-static-export-title">Static export reference</figcaption>
  <div class="ef-diagram__viewport" tabindex="0" role="group" aria-label="Static export reference diagram, scroll to see all items">
    <div class="ef-diagram__canvas" style="--ef-diagram-canvas-w: 792px; --ef-diagram-canvas-h: 136px;">
      <svg class="ef-diagram__wires" viewBox="0 0 792 136" aria-hidden="true" focusable="false">…</svg>
      <article class="ef-diagram-node" id="wf-static-export-n-a" data-ef-shape="pill" aria-labelledby="wf-static-export-n-a-label" style="…">
        <p class="ef-diagram-node__kind">Start</p>
        <h3 class="ef-diagram-node__label" id="wf-static-export-n-a-label">Request</h3>
      </article>
      …
    </div>
  </div>
  <ol class="ef-diagram__relations" aria-label="Relationships">
    <li>Request leads to Review.</li>
    <li>Review leads to Done: “Approved”.</li>
  </ol>
</figure>
```

The complete reference outputs are in
[`examples/workflows/exports/`](../../examples/workflows/exports/). Tests
check them byte for byte.

## Complete document

```bash
forma-workflow render launch.forma-workflow.json --document --forma-base /assets/forma/ --brand example-harbor --out launch.html
```

The document contains a doctype, `lang` and `dir`, charset, viewport, title,
description and generator metadata. It links exactly the declared stylesheets,
applies an optional public brand (`data-ef-brand`) and theme, and puts the
figure in `<main>`.

## Interactive output

```bash
forma-workflow render launch.forma-workflow.json --document --interactive view \
  --runtime-base /assets/forma-workflow/ --out launch.html
```

This wraps the same static figure in the public `<forma-workflow>` element. It
adds the workflow source as an inert `<script type="application/json">` data
block and one module script from `@echelon-foundry/forma-workflow`. The
dependency list names that runtime. Without script, the static figure still
renders. Nothing private to Studio is ever emitted.

## What the output guarantees

Each guarantee is tested in `tests/workflow` and `tests/browser/workflow-static.spec.mjs`.

- **Deterministic.** The same workflow and options give byte-identical HTML.
- **Public contracts only.** Every class is a public Forma class that exists in Forma CSS. There are no Studio or editor classes and no editor-only ids.
- **No script unless asked.** Static output has no `<script>`, no event-handler attributes and no `javascript:` URLs.
- **Safe.** Every label, description, metadata value, reference and extension value is escaped. Unsafe URLs are dropped even if a host skips validation. The JSON data block cannot close its `<script>` element.
- **Accessible.** The figure is named by the title. Each node is named by its label (or its accessible name). Kind and status are text. Every connector has a sentence in `ol.ef-diagram__relations`, so relationships never depend on lines alone. Groups and lanes list their members in `dl.ef-diagram__membership`. A legend explains colour. Reading order follows the flow, not the paint order.
- **Responsive.** There is no page-level overflow at 320px. The canvas scrolls inside its focusable, named viewport. The relationship and membership lists reflow.
- **Forced colours, print and grayscale.** These follow the diagram contract fallbacks.

## Metadata in output

Metadata stays in the workflow file. It is not rendered unless the host names
fields to show (`--metadata owner,requirements` or
`RenderOptions.VisibleMetadata`). This follows FMD-META-006/007 and the
disclosure rules.

## .NET

```fsharp
let w = (Validation.load text).Workflow.Value
let fragment = WorkflowDocument.fragment DocumentOptions.defaults w
let page = WorkflowDocument.document { DocumentOptions.defaults with FormaBase = "/assets/forma/"; Brand = Some "echelon" } w
// fragment.Html, page.Html, page.Dependencies
```
