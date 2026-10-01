---
id: ADR-0006
title: Forma owns the portable workflow standard; its interactive editor ships as a separate opt-in runtime package
status: accepted
date: 2026-10-01
supersedes: null
amends:
  - ADR-0002 (scope of the zero-runtime rule)
  - ADR-0004 (who may implement workflow selection and editing)
related:
  - requirements/PORTABLE-WORKFLOW-INTERCHANGE.md
  - requirements/OBJECT-METADATA-AND-DIAGRAM-PRESENTATION.md
  - requirements/QUALITY-AND-DISTRIBUTION.md
work_item: FORMA-GH-93, FORMA-GH-94
---

# Context

`requirements/PORTABLE-WORKFLOW-INTERCHANGE.md` (2026-10-01) makes Forma the
owner of a portable workflow format, independent validation, HTML rendering
and an **embeddable renderer/editor** with view, inspect, edit, select/pick and
runtime-visualization modes.

Two older records constrain that:

- ADR-0002 and QD-001/QD-TEST-003 say the design-system package ships HTML
  and CSS only, with 0 bytes of JavaScript or WebAssembly.
- ADR-0004 and FMD-DIA-002 say Forma does not implement selection, dragging,
  hit testing or command history for diagrams.

An editor cannot be built from HTML and CSS alone. The newer requirement is the
narrower, more specific record (AGENTS.md "Authority"), so it governs the
workflow capability. The older records keep governing everything else. This
decision records where the line falls so that neither record is silently
weakened.

Limen 0.6.2's `BrowserKernel` is "one per page" and binds `document.body`.
It cannot host a component inside a page whose host already runs its own
kernel, or inside a host with no Limen at all. That makes it the wrong tool for
an embeddable island. The gap is recorded in the Limen backlog note below. It
is not solved inside Forma.

# Decision

Forma's workflow capability has four layers. Each layer has its own
distribution rule.

| Layer | What it is | Ships in | Runtime? |
|---|---|---|---|
| Standard | `schemas/workflow/1.0/forma-workflow.schema.json`, `contracts/workflow-capabilities.json`, the format specification | `@echelon-foundry/design-system` (data files, like `brand-manifest.schema.json`) | No |
| Presentation | `.ef-diagram*` contract 2.1.0, with ports and node status added for workflows | `@echelon-foundry/design-system` CSS | No |
| Library | `Forma.Workflow`: an F# model, lossless codec, schema validator, semantic validator, deterministic layout, static HTML renderer and the pure editor engine | `src/workflow/Forma.Workflow`, used by the CLI, by .NET hosts such as Forma Studio, and by the WebAssembly bundle | Build/server-time, or inside a host's own .NET runtime |
| Embeddable editor | .NET WebAssembly build of the library, plus a minimal host element (`<forma-workflow>`), editor chrome CSS and the iframe message contract | **`@echelon-foundry/forma-workflow`**, a separately versioned package in `packages/workflow` | Yes, opt-in |

Rules:

1. **The core package stays zero-runtime.** `@echelon-foundry/design-system`
   never contains `.js`, `.mjs` or `.wasm`, and never depends on the workflow
   package. `tests/zero-runtime.test.mjs` keeps enforcing this.
2. **Static workflow output is HTML and CSS.** The static renderer emits the
   public `.ef-diagram*` contract and needs no script. Script appears in output
   only when the author asks for interaction, and then it is exactly the
   public `@echelon-foundry/forma-workflow` module, declared as a dependency.
3. **All decisions are F#.** Legality, validation, layout, selection and
   command history live in `Forma.Workflow`. The browser host element only
   moves serialized messages and DOM events. It encodes nothing and decides
   nothing.
4. **Editor chrome is separate from production presentation.** Selection,
   handles, focus rings for the canvas and the inspector use `ef-workflow-editor*`
   classes from the workflow package. They never use `.ef-diagram*` and never
   appear in static output (FMD-DIA-007 still holds).
5. **Hosts own domain behavior.** Interactions in a workflow are declarative
   intents. The engine reports them as events. The host decides what they mean.
6. **One model for every host.** Same-application embedding uses the element
   directly, with no iframe. The optional iframe mode carries the same
   portable document over the versioned message contract
   `forma-workflow-host/1`.
7. **.NET hosts link the library.** A host that already runs .NET (such as
   Forma Studio) supplies its own transport: an object with
   `dispatch(json) -> json` backed by `Forma.Workflow.Embed`. It does not load
   a second .NET runtime.

# Consequences

- ADR-0002's rule is now explicitly scoped to the design-system package. The
  workflow package has its own budget and its own CI gate (`npm run
  workflow:check`).
- ADR-0004's "Forma never owns selection or dragging" now reads "the
  presentation family never owns them". The workflow editor engine does, as a
  separate capability.
- Forma CI builds .NET WebAssembly for the workflow package.
- Publishing the workflow package needs the same npm trusted publishing as
  the core package. No new secret is introduced.

# Rejected alternatives

- **A workflow editor inside Forma Studio only.** This violates the
  requirement's ownership clause, and every other host would need Studio.
- **Limen `BrowserKernel` as the embedding host.** It is page-scoped and has
  no unmount, so it cannot be an island in another application.
- **TypeScript or Fable for the editor.** TypeScript would move decisions into
  JavaScript. Fable would be a new compiler dependency that needs permission.
  The established F#/.NET WebAssembly path does the job.
- **Behavior inside `@echelon-foundry/design-system`.** This breaks the 0-byte
  runtime promise that every existing consumer relies on.

# Limen backlog note

Limen needs a scoped, unmountable kernel, for example
`new BrowserKernel(transport, rootElement)` with `stop()`, before a
Limen-driven component can be embedded inside another page. Until then,
`<forma-workflow>` uses its own minimal host.

# Validation

- `tests/zero-runtime.test.mjs` still passes for `dist/`.
- `tests/workflow/*` prove static output has no `<script>` and the workflow
  package boundary holds.
- The browser tests in `tests/browser/workflow-*.spec.mjs` prove embedding
  without an iframe, the iframe mode, keyboard, touch, 320px, reduced motion
  and forced colors.
