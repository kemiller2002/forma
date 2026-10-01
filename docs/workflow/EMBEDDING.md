# Embedding the workflow renderer and editor

`@echelon-foundry/forma-workflow` is the reusable workflow component. It
provides the public `<forma-workflow>` element and runs the F# engine
(`Forma.Workflow`) on .NET WebAssembly. It is a separate, opt-in package. The
design-system package stays zero-runtime (ADR-0006). You do not need Forma
Studio.

A complete host application that is not Studio lives in
[`examples/workflow-embedding/`](../../examples/workflow-embedding/). It shows
runtime, edit, pick and isolated modes and a partner brand. Its browser tests
are in [`tests/browser/workflow-embed.spec.mjs`](../../tests/browser/workflow-embed.spec.mjs).

## Same-page embedding (no iframe)

```html
<link rel="stylesheet" href="/assets/forma/tokens.css">
<link rel="stylesheet" href="/assets/forma/foundations.css">
<link rel="stylesheet" href="/assets/forma/components.css">
<link rel="stylesheet" href="/assets/forma-workflow/forma-workflow.css">
<script type="module" src="/assets/forma-workflow/forma-workflow.js"></script>

<forma-workflow id="designer" mode="edit"></forma-workflow>
<script type="module">
  const designer = document.getElementById("designer");
  const workflow = await (await fetch("/forma/workflows/launch.forma-workflow.json")).json();
  await designer.load(workflow);
  designer.addEventListener("forma-workflow-change", (e) => save(e.detail.workflow));
</script>
```

You can also put the document inline as an inert data block. The element then
loads it on start, and the static figure inside the element is the
no-script fallback:

```html
<forma-workflow mode="view">
  <script type="application/json" class="forma-workflow-source">{ "format": "forma-workflow", … }</script>
  <figure class="ef-diagram">…static rendering…</figure>
</forma-workflow>
```

The element inherits Forma tokens, brands (`data-ef-brand` on any ancestor),
themes, forced colours, reduced motion and responsive behaviour from the host
page.

## Host modes

| `mode` | What people can do |
|---|---|
| `view` | Read. Zoom. Activate declared intents. |
| `inspect` | Select objects and read their metadata, references, status and extensions. |
| `edit` | Create, connect, reconnect, move, resize, rename and recolour. Set status, ports, groups and lanes, metadata, references, interactions and accessibility. Arrange. Undo and redo. |
| `pick` | Choose one or more objects; the host receives them on "Use selection". |
| `runtime` | Read. The host projects live state with `setRuntimeState`. The document is never changed. |

## Host contract `forma-workflow-host/1`

The contract is small and versioned. Hosts never see the engine's internal state.

**Attributes:** `mode`, `instance` (optional stable id), `engine` (optional URL of the engine directory).

**Methods** (each returns a promise):

| Method | Effect |
|---|---|
| `load(workflow)` | Load a document (object or JSON text). Emits `forma-workflow-load`. |
| `getWorkflow()` | The current document, canonical JSON. |
| `execute(command)` | Run a validated command, for example `{ name: "addNode", kind: "task", label: "Review" }`, `{ name: "connect", source: { node: "a" }, target: { node: "b" } }`, `{ name: "setLabel", object: "node:a", value: "…" }`, `{ name: "setMetadata", object: "node:a", key: "owner", value: "Ops" }`, `{ name: "setStatus", object: "node:a", status: { state: "active" } }`, `{ name: "setColor", object: "node:a", property: "fill", value: "#e8f0ff" }`, `{ name: "move", nodes: ["a"], dx: 8, dy: 0 }`, `{ name: "delete", objects: ["edge:e1"] }`, `{ name: "autoLayout" }`. |
| `undo()`, `redo()` | History. |
| `select(objects)` | `["node:a", { type: "edge", id: "e1" }]`. |
| `focusObject(object)` | Move keyboard focus to an object. |
| `setRuntimeState(states)` | `{ "nodeId": { state: "active", label: "In progress" }, "other": null }`. |
| `validate(workflow)` | The validation report, without loading. |

**Events** (bubbling `CustomEvent`s; `detail` is JSON):

| Event | `detail` |
|---|---|
| `forma-workflow-ready` | Engine started. |
| `forma-workflow-load` | `valid`, `class`, `findings`, `workflow`. |
| `forma-workflow-change` | `description`, `workflow` (the new document), `valid`, `class`, `findings`. Only legal, validated changes arrive. |
| `forma-workflow-selection` | `objects: [{ type, id }]`. |
| `forma-workflow-focus` | `object`. |
| `forma-workflow-intent` | `object`, `action`, `target`, `command`, `label`, `parameters`. The host decides what to do. |
| `forma-workflow-pick` | `objects`. |
| `forma-workflow-refused` | `message`. A command was refused and nothing changed. |
| `forma-workflow-error` | `message` (the engine failed to start). |

A command that would introduce a new validation error is refused. Examples are a
dangling connection, a port over its limit, or a blank name. Unknown metadata
and extensions survive every edit.

## Interaction model

- **Keyboard.** Every object is a button in the Objects list. Arrow keys move the selected steps (Shift moves further). Delete removes them. Escape cancels. All inspector fields are native form controls.
- **Pointer.** Click selects. Ctrl, Cmd or Shift-click adds to the selection. Drag a selected step to move it; it is one change when released. Drag the corner handle to resize. Drag the round handle onto another step to connect.
- **Touch and mobile.** Tap selects. No operation needs dragging: "Connect" then tap a target, the Connect form, the Move buttons and the Position and size fields all work without it. Handles have a 44px hit area. Below 64rem the layout stacks, with the canvas first, and the canvas scrolls inside its own region.
- **Zoom and pan.** Use the zoom buttons. Pan by scrolling the canvas. Zoom is view state and is never saved.
- **Announcements.** A polite live region reports each change, refusal and selection.

## .NET hosts

A host that already runs .NET, such as Forma Studio, links `Forma.Workflow`.
It supplies the element's transport itself instead of loading a second runtime:

```js
element.transport = {
  async dispatch(json) { return myExports.WorkflowDispatch(json); }, // backed by EmbedHost.dispatch
  async document(id) { return myExports.WorkflowDocument(id); },
  async dispose(id) { myExports.WorkflowDispose(id); },
  async validate(text) { return JSON.parse(myExports.WorkflowValidate(text)); }
};
```

## Isolated mode (iframe)

Use isolated mode only when you need stronger separation. It carries the same
portable document over the same `forma-workflow-host/1` contract, through
`postMessage`:

```html
<iframe src="/assets/forma-workflow/frame.html?parent=https://app.example.org&forma=https://app.example.org/assets/forma/&brand=echelon"></iframe>
```

| From the parent | Fields |
|---|---|
| `{ protocol, id, type: "load", document }` | |
| `{ protocol, id, type: "mode", mode }` | |
| `{ protocol, id, type: "command", command }` | |
| `{ protocol, id, type: "select", objects }`, `"focus"`, `"runtime"`, `"undo"`, `"redo"`, `"get"` | |

| From the frame | Fields |
|---|---|
| `{ protocol, type: "frame-ready" }` | |
| `{ protocol, type: "reply", id, ok, workflow?, error? }` | |
| `{ protocol, type: "event", event: { type, … } }` | the same events as above |

The frame accepts messages only from the origin in `?parent=`, and only from
`window.parent`. It posts only to that origin.

## Security

Workflow files are data. The engine builds every view from a typed HTML tree
that escapes all text and attributes. It never emits event-handler attributes
or `javascript:` URLs. Intents are reported, never executed. The host element
has no `eval`, no `new Function` and no decision logic; a package test checks
this.
