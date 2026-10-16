---
id: RQ-FORMA-2026-DBC01
title: Forma Design by Construction
status: accepted
version: 1.0.0
owners:
  - design-system
created: 2026-10-15
updated: 2026-10-15
related_documents:
  - docs/DESIGN-CONTRACT.md
  - contracts/design-capabilities.json
  - schemas/design/1.0/forma-design.schema.json
tags: [design-by-construction, forms, accessibility, responsive-design, machine-operability]
provenance:
  contributions:
    EXE-20261016T001518995Z-0d7c3c0e:
      operations: [created]
      at: 2026-10-16T01:01:25.946Z
      actor:
        kind: agent
        id: openai/codex
        provider: openai
        model: gpt-5
        runtime: codex
      reason: "Ingest claimed Design by Construction form requirements into the canonical Forma requirement surface"
derived_from: [INPUT-55d9f31e1426fc19]
---

# Forma Design by Construction

Status: **Required first slice**. Contract version: **1.0.0**. Source: `INPUT-55d9f31e1426fc19`.

## Purpose and boundary

Forma shall make common invalid form compositions rejectable before HTML is emitted while preserving ordinary, accessible HTML and CSS as the consumer-facing result. The contract is an optional build-time interchange for agents, CI, and authoring tools; consumers may continue to author the documented HTML patterns directly.

The first supported slice is a semantic form with fields, a responsive stack or grid, native validation, an action group, and observable native submit/reset behavior. Domain legality, persistence, asynchronous work, and state-dependent commands remain application or Limen responsibilities.

## Contract requirements

- **FORMA-DBC-001 — Version and compatibility.** A design document identifies `forma.design`, uses semantic contract version `1.0.0`, and declares a Forma compatibility range. Unsupported versions fail with a migration diagnostic; a later breaking format requires a new versioned schema path and migration guide.
- **FORMA-DBC-002 — Modes.** `standard` mode accepts only documented semantic structure and tokens. `extended` mode may carry namespaced extension data. `custom` mode must state a reason and validation-evidence references. None of the modes may disable semantic or accessibility checks.
- **FORMA-DBC-003 — Native output.** Valid documents render to semantic HTML with native forms, labels, controls, buttons, validation, and URL-backed outcomes. Generated output contains no script, inline handler, proprietary runtime, or custom-element registration.
- **FORMA-DBC-004 — Structural refusal.** Validation occurs before rendering and returns stable codes plus JSON paths. It rejects unknown versions, duplicate IDs, invalid parent-child relationships, unsupported standard-mode overrides, unbound actions, action/type mismatches, missing labels, unassociated validation, and nonresponsive standard form layout.
- **FORMA-DBC-005 — Standard field alignment.** A standard grid form uses the `.ef-form-row` contract, aligns peer controls, wraps rather than clipping or widening the page, preserves source/focus order, and becomes one column when available inline size is below the declared semantic minimum.
- **FORMA-DBC-006 — Controls and state.** Supported controls use native input, textarea, select, checkbox, radio, toggle, and date/time semantics. Labels and descriptions are programmatically associated. Required, invalid, readonly, and disabled states remain native and visibly distinguishable; invalid state includes a non-colour text message.
- **FORMA-DBC-007 — Actions.** Every enabled action has a declared binding. The 1.0 standard form bindings are `form.submit` and `form.reset`; they render as explicit native button types. Submit uses native constraint validation and has an observable URL/target outcome. Reset restores initial control values.
- **FORMA-DBC-008 — Responsive and motion.** Standard documents declare container-responsive stacking down to 320 CSS px, wrapping overflow, and a reduced-motion policy that preserves state. Form layout and validation introduce no required animation.
- **FORMA-DBC-009 — Operability.** Controls and actions are reachable in logical keyboard order, expose stable accessible roles/names, retain visible focus, and can be operated with role/name Playwright locators without coordinates or timing guesses.
- **FORMA-DBC-010 — Escape path.** Unsupported but legitimate designs use `extended` namespaced data or a reasoned `custom` document with additional evidence. Implementations must distinguish unsupported capability from structural invalidity rather than silently discarding intent.

## Supported 1.0 form model

The root is one `form`. Its direct children are field layouts, one action group, and optional feedback. A form layout is `stack` or `grid` and contains only fields. A standard grid must set `alignControls: true` and `overflow: "wrap"`. Fields may use text-like inputs, textarea, select, checkbox, radio group, toggle, or native date/time controls. An action group contains only bound actions. Feedback is addressable by the form action fragment so a successful native submission has an observable outcome.

Forma's broader component catalog already supplies stack, grid, split, dock-like rail/sidebar, flow, spatial canvas, overlay, page, and repeating collection patterns where those models are appropriate. Contract 1.0 does not pretend that every model is valid inside a standard form. Cross-repository certification of twenty diverse layouts, computed values, asynchronous commands, virtualization, and specialist chart/map/media extensions remains proposed follow-up work and must not be reported as implemented by this slice.

## Compatibility and migration

Schema and capability documents are published at:

- `schemas/design/1.0/forma-design.schema.json`
- `contracts/design-capabilities.json`

Version 1.0.x is additive only. A producer using an unsupported pre-1.0 or future major version receives `DBC_VERSION_UNSUPPORTED`; it must migrate to a supported schema instead of having intent guessed. Ordinary hand-authored Forma HTML remains supported and does not require migration into this format.

## Acceptance evidence

- `tests/design-contract.test.mjs` proves valid rendering, deterministic invalid-fixture diagnostics, compatibility refusal, native output, and the customer-form snapshot.
- `tests/site-browser/form-contract.spec.mjs` proves desktop/tablet/mobile alignment and overflow, native email refusal, submit/reset outcomes, keyboard order, accessible roles/names, forced-colours, and reduced motion.
- The `Form` catalog page publishes functional basic, advanced, and mobile examples using actual `<ef-form>` HTML.

## Follow-up requirements

The following source obligations remain outside this repository-local first slice: cross-repository layout certification, Forma Studio constrained authoring, Ordo/Praxis preservation, Folio print pagination/safe areas, agent-effort measurement across repositories, and validation of the proposed custom-exception target. They require their owning repositories and are not prerequisites for the Forma 1.0 form contract.
