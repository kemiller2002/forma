# Portable Workflow Interchange and Embedding

Status: **Required**

## Ownership

Forma owns the public workflow interchange, rendering, and embedding contract. Forma Studio is a conforming authoring application and MUST NOT own a private replacement for this standard.

The contract MUST remain usable without Forma Studio. Applications, agents, CLI tools, backend services, and third-party systems MUST be able to create, validate, render, exchange, and consume workflows from the published specification.

## Canonical workflow format

The normative interchange encoding MUST be human-readable JSON unless a later governed version replaces it. The canonical filename suffix is:

```text
.forma-workflow.json
```

The recommended repository layout is:

```text
forma/
  workflows/
    <workflow-id>.forma-workflow.json
```

The normative top-level model MUST include at least:

- format identifier and schema version,
- stable workflow identifier,
- name/title and optional description,
- target Forma compatibility,
- metadata,
- nodes/items,
- connections/edges,
- optional groups, containers, or swimlanes,
- semantic interaction/navigation intent where applicable,
- presentation/layout information,
- extension data,
- and optional provenance identifying the producer.

Every addressable object MUST have a stable identifier. References MUST use stable identifiers rather than array positions, transient DOM identity, or editor-only identifiers.

## Nodes and connections

Nodes MUST support semantic type/kind, label, description, layout intent, position/size where supplied, visual variant, semantic/token-based color, state/status, ports where applicable, domain references, metadata, accessibility semantics, interaction intent, and namespaced extensions.

Connections MUST be first-class stable objects and support source, target, optional ports, direction, semantic kind, label, visual treatment, state, metadata, and namespaced extensions.

Object and connection metadata MUST round-trip even when Forma does not understand the producer's domain meaning.

## Extensions

Producer-specific extension data MUST be namespaced. Unknown valid extensions MUST survive load/edit/save unchanged.

Interoperable rendering semantics MUST remain in the core contract rather than being hidden in a producer extension.

## Semantics versus layout

Semantic workflow data MUST be separable from editor layout. External producers MUST be able to create a valid workflow without calculating exact pixel positions.

Layout MAY be omitted. A conforming renderer/editor MUST be able to apply a deterministic default layout or a separately invoked layout operation without altering stable identifiers, metadata, domain references, or workflow semantics.

## Embeddable workflow capability

Forma MUST expose the workflow renderer/editor as a reusable public capability that can be embedded in applications independently of the full Forma Studio shell.

Supported host modes MUST include at least read-only/view, inspect, edit, select/pick, and runtime visualization.

The host boundary MUST be small and versioned and MUST support loading a workflow, receiving validated changes, selection/focus, validation findings, and supported commands/events.

Embedding MUST preserve Forma responsive, mobile/touch, accessibility, keyboard, theme/skin, and reduced-motion contracts.

A same-application integration MUST NOT require an iframe. An optional isolated/iframe integration MAY be provided, but it MUST use the same portable workflow model through a documented versioned message boundary.

## Declarative and safe

Workflow files are data, not executable code. The core format MUST NOT execute arbitrary JavaScript, inline event handlers, executable HTML, or producer-supplied code when opened or rendered.

Interactions MUST be declarative intents/actions whose implementation is provided by the embedding application or another approved runtime capability.

Untrusted labels, descriptions, metadata, and extension data MUST be rendered safely.

## Published schema and independent validation

Forma MUST publish the JSON Schema at a stable repository and package path. Validation MUST be usable without Forma Studio so CI, Praxis, agents, and external producers can verify generated workflows.

Compatibility results MUST distinguish fully supported, supported with preserved unknown extensions, migration required, structurally invalid, semantically invalid, and valid format requiring unavailable Forma capabilities.

## HTML output

A workflow MUST be renderable to standards-based HTML using public Forma presentation contracts. HTML output MUST NOT require Forma Studio.

Where interactivity is not requested, the workflow SHOULD be exportable as semantic static HTML. Where approved interaction is required, the HTML MUST use public Forma/Limen/runtime contracts rather than Studio-private behavior.

Generated HTML MUST preserve accessible names, meaningful workflow relationships, semantic status, and a usable non-visual representation of connections where purely graphical relationships would otherwise be inaccessible.

## Round-trip and evidence

Forma MUST maintain compatibility fixtures covering a minimal workflow, multi-step workflow, groups/swimlanes, object and edge metadata, namespaced extensions, omitted-layout input, and embedding.

Tests MUST prove the lifecycle:

```text
external producer
  -> .forma-workflow.json
  -> Forma/Studio validate and render
  -> Studio edit
  -> .forma-workflow.json
  -> external consumer
```

Stable identifiers, semantic fields, connections, metadata, and unknown namespaced extensions MUST survive the round trip.
