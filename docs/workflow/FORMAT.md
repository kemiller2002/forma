# Forma portable workflow format 1.0

Status: **normative**. Requirement: [`requirements/PORTABLE-WORKFLOW-INTERCHANGE.md`](../../requirements/PORTABLE-WORKFLOW-INTERCHANGE.md).
Decision: [ADR-0006](../decisions/ADR-0006-portable-workflow-capability.md).

A Forma workflow is a JSON document. Any system can write one: an application,
an agent, a backend service, a CLI or Forma Studio. Forma validates it, lays it
out, renders it to HTML and edits it. You do not need Forma Studio for any of
these.

| Item | Value |
|---|---|
| File suffix | `.forma-workflow.json` |
| Repository convention | `forma/workflows/<workflow-id>.forma-workflow.json` |
| Format identifier | `"format": "forma-workflow"` |
| Format version | `"formatVersion": "1.0.0"` (semantic versioning) |
| JSON Schema (repository) | [`schemas/workflow/1.0/forma-workflow.schema.json`](../../schemas/workflow/1.0/forma-workflow.schema.json) |
| JSON Schema (package) | `@echelon-foundry/design-system/workflow/forma-workflow.schema.json` |
| JSON Schema (`$id`) | `https://forma.echelonfoundry.com/schemas/workflow/1.0/forma-workflow.schema.json` |
| Capability contract | `@echelon-foundry/design-system/contracts/workflow-capabilities.json` |
| Reference fixtures | [`examples/workflows/forma/workflows/`](../../examples/workflows/forma/workflows/) with [`fixtures.json`](../../examples/workflows/fixtures.json) |

## The smallest workflow

```json
{
  "format": "forma-workflow",
  "formatVersion": "1.0.0",
  "id": "minimal",
  "title": "Minimal workflow",
  "forma": { "version": "0.4.0" },
  "nodes": [ { "id": "start", "kind": "start", "label": "Start" } ]
}
```

## A realistic workflow

```json
{
  "$schema": "https://forma.echelonfoundry.com/schemas/workflow/1.0/forma-workflow.schema.json",
  "format": "forma-workflow",
  "formatVersion": "1.0.0",
  "id": "launch-readiness",
  "title": "Launch readiness poll",
  "forma": { "version": "0.4.0" },
  "metadata": { "program": "Example mission", "revision": 3 },
  "nodes": [
    { "id": "poll", "kind": "start", "label": "Begin readiness poll" },
    { "id": "go", "kind": "decision", "label": "All stations go?",
      "metadata": { "owner": "Launch director" } },
    { "id": "hold", "kind": "task", "label": "Call a hold",
      "status": { "state": "pending" },
      "color": { "fill": "#fff1d6", "foreground": "#1d1d1b" } },
    { "id": "launch", "kind": "end", "label": "Proceed to launch",
      "references": [ { "id": "count", "system": "gov.nasa.example.range", "type": "Countdown", "key": "CD-77" } ],
      "extensions": { "com.example.console": { "panel": 4 } } }
  ],
  "edges": [
    { "id": "e1", "source": { "node": "poll" }, "target": { "node": "go" } },
    { "id": "e2", "source": { "node": "go" }, "target": { "node": "launch" }, "kind": "conditional", "label": "Go" },
    { "id": "e3", "source": { "node": "go" }, "target": { "node": "hold" }, "kind": "conditional", "label": "No go", "line": "dashed",
      "metadata": { "logged": true } }
  ]
}
```

No coordinates appear anywhere. Forma places the nodes with its deterministic
default layout.

## Top-level properties

| Property | Required | Meaning |
|---|---|---|
| `format`, `formatVersion` | yes | Identify the format and its version. |
| `id` | yes | Stable workflow id: lowercase letters, digits and hyphens. It is also the file stem. |
| `title` | yes | Human name. It becomes the accessible name of the rendered diagram. |
| `description`, `language`, `direction` | no | Description, BCP 47 language and base text direction (`ltr`, `rtl`, `auto`). |
| `forma` | yes | `{ "version": "0.4.0", "requires": ["workflow.ports"] }`: the target Forma release and, optionally, the capabilities it requires. |
| `metadata` | no | Arbitrary JSON object. It is preserved and never interpreted. |
| `palette` | no | Named colour slots, `{ "finance": "token:accent-primary" }`. |
| `nodes` | yes | Steps or items. |
| `edges` | no | Connections. |
| `groups` | no | Groups, containers, swimlanes and phases. |
| `layout` | no | Workflow layout settings: `direction` (`right` or `down`), `mode` (`authored` or `auto`) and `canvas`. |
| `presentation` | no | `density` and a `legend` that explains colour and line meaning in text. |
| `extensions` | no | Producer data by namespace. |
| `provenance` | no | `producer`, `createdAt`, `modifiedAt`, `source` and `modifiedBy`. |

## Identity

Every addressable object has a stable `id`. Nodes, edges and groups share one id
namespace per workflow. Ports are unique within their node. References are
unique within their owner. Legend entries are unique within the legend.

Connections and memberships always point at ids. They never use array
positions, DOM identity or editor-only ids. Ids survive editing, re-layout and
saving.

## Nodes

| Property | Meaning |
|---|---|
| `kind` | `start`, `end`, `task`, `decision`, `merge`, `event`, `subprocess`, `data`, `note` or `external`. A producer kind is `<namespace>:<name>`, such as `com.example.erp:approval`, and must carry `kindLabel`. |
| `kindLabel` | Display text for the kind. Optional for core kinds. |
| `label`, `description` | Visible text. |
| `variant` | Forma shape: `rectangle`, `rounded`, `pill`, `ellipse` or `diamond`. Presentation only; a shape never implies a kind. |
| `color` | `fill`, `stroke`, `accent` and `foreground`. Each is a `#rrggbb` literal, a Forma token (`token:accent-primary`) or a palette slot (`palette:finance`). |
| `status` | `{ "state": "active", "label": "In progress", "detail": "...", "updatedAt": "..." }`. Core states are `none`, `pending`, `ready`, `active`, `waiting`, `complete`, `blocked`, `failed`, `skipped`, `cancelled` and `unknown`. A namespaced state needs a `label`. |
| `ports` | Connection points: `id`, `side` (`top`, `right`, `bottom`, `left`), `direction` (`in`, `out`, `inout`), `label`, `maxConnections`. |
| `references` | Domain references: `id`, `system` (a namespace), `type`, `key`, `label` and `href`. Forma displays them and never dereferences them. |
| `metadata` | Arbitrary JSON object. It is preserved unchanged. |
| `accessibility` | `name` and `description` for assistive technology, when they should differ from the visible text. |
| `interaction` | A declarative intent (see below). |
| `layout` | Optional geometry and layout intent: `x`/`y` (together or not at all), `width`, `height`, `rank`, `order` and `size` (`compact`, `standard`, `wide`). |
| `extensions` | Producer data by namespace. |

## Edges

`id`, `source` and `target` are required. `source` and `target` are
`{ "node": "...", "port": "..." }`. Edges also accept these properties:

- `direction`: `forward` (the default), `backward`, `both` or `none`.
- `kind`: `sequence` (the default), `conditional`, `default`, `exception`, `message`, `association`, `data` or a namespaced kind with `kindLabel`.
- `label`, `description`, `line` (`solid`, `dashed`, `dotted`), `width` (1 to 8) and `color.stroke`.
- `status`, `references`, `metadata`, `accessibility`, `interaction`.
- `layout`: `routing` (`straight` or `orthogonal`), `waypoints` and the label position.
- `extensions`.

## Groups, containers, swimlanes and phases

`kind` is one of `group`, `container`, `swimlane` or `phase`. A group lists its
`members` (node ids) explicitly. Nesting uses `parent`. Canvas overlap never
implies membership. A node belongs to at most one swimlane. A phase may cut
across swimlanes.

## Interactions are intents, not code

```json
{ "action": "command", "command": "com.example.lab:open-review", "label": "Open review",
  "parameters": { "queue": "peer" } }
```

`action` is one of the following:

- `none`, `select`, `inspect`.
- `navigate` or `open`, each with a `target` naming exactly one destination: `workflow`, `node`, `edge`, `group`, `reference` or `url`.
- `command`, which needs a namespaced `command` and a `label`.

A renderer or editor reports intents to the host application. The host decides
what they do. Nothing in a workflow file ever executes.

## Semantics versus layout

Everything about meaning is outside `layout`. Remove every `layout` object and
the workflow means the same thing. Layout operations only write `layout` fields.

- **Default layout** (`Layout.resolve`) is deterministic. Ranks come from the
  graph (longest path, with cycles broken in document order). Swimlanes, groups
  and containers become nested bands, so members stay inside their boundary.
  Authored positions are kept.
- **Explicit layout** (`Layout.apply FillMissing` or `Layout.apply Recompute`,
  or `forma-workflow layout [--recompute]`) writes positions into `layout`
  fields. Tests prove it never changes ids, semantics, metadata, references or
  extensions.

## Extensions and metadata

- `metadata` is the application's own descriptive data. It can be any JSON
  object. Numbers keep their spelling (`1.50` stays `1.50`), and key order is
  kept.
- `extensions` are keyed by a reverse-DNS namespace (`com.example.erp`). Each
  value is a JSON object. The `forma` and `forma.*` namespaces are reserved.
  Unknown extensions survive load, edit and save unchanged.
- Interoperable meaning (kinds, status, colour, references, membership) is
  always in core fields. Never put it only in an extension.

## Canonical serialization

`Codec.serialize` and `forma-workflow normalize` write a fixed property order,
two-space indentation and a final newline. Empty optional arrays are omitted.
Canonical output is a fixed point: serializing a loaded canonical file gives the
same bytes.

## Versioning

`formatVersion` follows semantic versioning. This library reads `1.0.0`.

- A pre-release of the current version (`1.0.0-rc.1`) migrates automatically. It is reported as *migration required, automatic*.
- Any other version is reported as *migration required* with the reason. The document is not decoded.

The Forma release a workflow needs is declared separately in `forma.version`
and `forma.requires`. It is checked against
[`contracts/workflow-capabilities.json`](../../contracts/workflow-capabilities.json).

See also [VALIDATION.md](VALIDATION.md), [RENDERING.md](RENDERING.md),
[EMBEDDING.md](EMBEDDING.md) and [EXTERNAL-PRODUCERS.md](EXTERNAL-PRODUCERS.md).
