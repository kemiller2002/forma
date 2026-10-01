# Requirements-to-evidence audit: portable workflows, embedding and HTML export

Date: 2026-10-01. Scope: kemiller2002/forma PR #95 (FORMA-GH-93, FORMA-GH-94)
and kemiller2002/forma-studio PR #17 (STUDIO-GH-14, STUDIO-GH-15).

**Paths.** "Forma" paths are in kemiller2002/forma; "Studio" paths are in
kemiller2002/forma-studio.

**Test counts** are local results from Chromium 1194. Forma has 58 F# workflow
tests and 25 workflow browser tests. Studio has 68 engine tests and 46 browser
tests. CI also runs Firefox and WebKit for Forma.

| # | Requirement | Implementation | Evidence |
|---|---|---|---|
| 3 | Forma owns the format: `.forma-workflow.json`, `forma/workflows/<id>`, versioned schema at a stable package path; all listed top-level, node and edge fields | Forma: `schemas/workflow/1.0/forma-workflow.schema.json`; package export `./workflow/forma-workflow.schema.json`; `src/workflow/Forma.Workflow/Model.fs` | Forma: `CoreTests` (fixture classes, round trip, paths); `tests/workflow-package.test.mjs` |
| 3 | Unknown metadata and namespaced extensions round-trip | `Codec` keeps metadata as ordered JSON with number spelling preserved | Forma: `CoreTests` "Unknown metadata …", "Namespaced extensions …"; `EditorTests`. Studio: `WorkflowStudioTests` |
| 4 | Semantics separate from layout; valid without coordinates; deterministic default layout; layout never changes semantics | Forma: `Layout.resolve`, `Layout.apply`, `Layout.strip` | Forma: `CoreTests` layout invariance, determinism, no overlap, lanes contain members |
| 5 | Validation independent of Studio; six classes; schema, ids, references, ports, groups, extensions, compatibility, static accessibility | Forma: `Validation.fs`, `JsonSchema.fs` (runs the published schema), `forma-workflow validate` | Forma: `CoreTests`, `AdversarialTests`, `tests/workflow-external.test.mjs`; `docs/workflow/VALIDATION.md` |
| 6 | Reusable renderer and editor in Forma: view, inspect, edit, pick and runtime; small versioned host boundary | Forma: `Editor.fs`, `Embed.fs`, `EmbedView.fs`, `EmbedProtocol.fs` (`forma-workflow-host/1`); `packages/workflow` | Forma: `EditorTests`; `tests/browser/workflow-embed.spec.mjs` |
| 7 | Embedding without an iframe; optional iframe with a versioned message contract; styling, brand, accessibility, keyboard, responsive, touch and reduced motion preserved; example outside Studio | Forma: `<forma-workflow>`, `frame.html`/`frame.js`, `examples/workflow-embedding` | Forma: `workflow-embed.spec.mjs` (no iframe, isolated mode, keyboard, pointer, touch at 390px, axe, forced colours and reduced motion, runtime, pick, intents) |
| 8 | Studio workflow editor uses the public component (dogfooding); selection, multi-selection, drag, move, resize, nodes, connections, ports, groups, lanes, metadata, colour, states, references, interactions, zoom, pan, keyboard, touch, validation, responsive | Studio: `src/kernel/workflows.js`, `StudioWorkflowInterop`, `WorkflowLibrary`; the component's capabilities | Studio: `tests/browser/workflow.spec.mjs`. Forma: `workflow-embed.spec.mjs` |
| 9 | Metadata is first-class, editable, and preserved when unknown | Inspector metadata editor (typed); extensions displayed and preserved | Forma: `EditorTests` metadata test, embed browser metadata test. Studio: lifecycle test |
| 10 | HTML fragment and complete document for a page, composition, component hierarchy or workflow; no Studio runtime, plugin or format | Studio: `HtmlExport.page`, `componentTree`, `workflow`; export panel; CLI `html`/`workflow-html` | Studio: `WorkflowStudioTests` export tests; `html-consumer.spec.mjs` |
| 11 | Static stays static; runtime only from the public contract, declared | Static by default; opt-in interactive output declares `@echelon-foundry/forma-workflow` | Studio: interactive export tests. Forma: `RenderTests` "Static output has no script", interactive golden |
| 12 | Maintainable, deterministic, public-contract HTML | Forma `Markup` tree; component-to-pattern map | Forma: `RenderTests` (public classes, determinism, goldens). Studio: `npm run html:check` |
| 13 | Workflow fragment and document, static and interactive, with an accessible relationship representation | Forma: `Render.figure`, `WorkflowDocument`; `ol.ef-diagram__relations`, `dl.ef-diagram__membership` | Forma: `RenderTests`, `workflow-static.spec.mjs` (axe, 320px, forced colours, brand) |
| 14 | Security: data only; escaping; no execution; adversarial tests | Typed intents; escaping Markup; URL policy; JSON depth and size limits; duplicate-key rejection | Forma: `AdversarialTests`, `RenderTests` escaping and data-block tests, `EditorTests` escaping. Studio: export escaping test |
| 15 | 17 reference fixtures as executable compatibility fixtures | Forma: `examples/workflows/forma/workflows` (19) and `fixtures.json` | Forma: `CoreTests` (every fixture validated with its expected class; required list) |
| 16 | External producer → validation → Studio open, edit, save → external consumer | Forma: `examples/external-producer`. Studio: the round-trip test | Studio: `docs/evidence/external-workflow-roundtrip.md` (39 preserved, 0 lost) |
| 17 | Studio design → HTML → ordinary web project → render, for application, responsive, workflow and branded compositions, with accessibility verified | Studio: `examples/html-consumer` | Studio: `html-consumer.spec.mjs`; `docs/evidence/html-consumer.md` |
| 18 | Forma gaps fixed in Forma, not Studio | Diagram contract 2.1.0 (ports, status, description, membership); `.ef-actions`; description contrast on surfaces | Forma: `tests/diagram-contract.test.mjs`, catalog check, commits on PR #95 |
| 19 | F#, explicit state, minimal JavaScript, Limen where appropriate | All decisions in F#. The element and adapters are plumbing. Limen is page-scoped, so it is not used for the embeddable island (ADR-0006) | `tests/workflow-package.test.mjs` (no decision code in the element); Studio: `limen verify --strict` |
| 20 | Unit, schema, integration, accessibility, responsive, serialization, round-trip, rendering, embedding and export tests | As listed above | As listed above |
| 21 | Documentation | Forma: `docs/workflow/*` (format, validation, rendering, embedding, producers), README, agent usage, diagram catalog example. Studio: `docs/WORKFLOWS.md`, `docs/HTML-EXPORT.md`, README | |
| 22 | Package surface: small, and usable without Studio | Forma core exports the schema, contract and examples; `@echelon-foundry/forma-workflow` exports the element, CSS, frame, schema and engine | Forma: `tests/workflow-package.test.mjs`, `tests/zero-runtime.test.mjs` |
| 23 | CI and publishing | Forma: `workflow-validation.yml`; browser jobs build the package; the publish job publishes the workflow package. Studio: vendor check, export determinism, browser suite | CI on PR #95 and PR #17 |
| 24 | Durable checkpoints | ROS work items FORMA-GH-93/94 and STUDIO-GH-14/15; HANDOFF and CURRENT-STATE entries | `./ros validate` (PR mode) passes in both repositories |

## Open items (not hidden)

1. **Flow convergence (forma-studio#16).** Studio's existing Flow surface, with
   its profiles, named styles, mappings and merge, is not yet migrated onto the
   portable format. Portable workflow authoring in Studio already uses the
   public component. The broader Flow requirements in Studio's
   `requirements/16` remain the Flow surface's backlog.
2. **Release pinning.** Studio vendors Forma from PR #95 with a hash manifest.
   The pinned npm artifacts become available when PR #95 merges and the
   publish workflow releases Forma 0.4.0 and `@echelon-foundry/forma-workflow`
   1.0.0.
3. **Cross-engine browser runs.** Firefox and WebKit run in Forma CI. They were
   not available in the implementing environment. Studio CI is Chromium only,
   which matches its existing configuration.
4. **Site pages.** The Forma site shows generated workflow markup in the
   diagram catalog. The format, embedding and validation guides are repository
   documentation (`docs/workflow/`), not separate generated site pages.
