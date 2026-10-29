# Pending Praxis intake: R7-REM-009 diagram non-text contrast

**Status:** Unprocessed source material. This is **not** a canonical requirement record, work item, approved decision, or proof of implementation.

- Submitted for Praxis ingestion: 2026-10-29
- Target repository: `kemiller2002/forma`
- Source: Indy-init Rehearsal 6 findings UI-016-O11 / PF-016-O1, remediation item R7-REM-009
- Proposed scope identifier: `R7-REM-009`
- Tracking work item: `WI-0041`
- Related: FORMA-A11Y-002 (`tests/contrast-pairs.test.mjs`), `contracts/diagram-presentation.json`, `docs/workflow/VALIDATION.md`

## Problem

Causa rendered its causal graph with Forma's workflow diagram (`article.ef-diagram-node`; the node outline comes from `--ef-diagram-stroke`, which `src/workflow/Forma.Workflow/Render.fs` sets from a node's `color.stroke`). Causa passed its identity amber `#e9a23b` as a node stroke on ivory `#f5f3ed`: 1.95:1, below the WCAG 1.4.11 non-text minimum of 3:1. Nothing in Forma caught it:

- `src/workflow/Forma.Workflow/Validation.fs` checked text contrast only (`A11Y-CONTRAST`, foreground against fill, 4.5:1). Strokes and accents against the fill, and edge strokes against the canvas, were not checked.
- The workflow colour vocabulary (`token:`) had no status tokens although Forma ships `--ef-color-status-warning`, `-danger`, `-success` and `-info`, so an application could not express an attention outline with a Forma token and fell back to a brand literal.

## Ingestion instructions

Process through the documented inbox/work flow. Preserve each numbered requirement. No GitHub Issues are created for this work.

## Requirements

**R7-REM-009.1:** Add `token:status-warning`, `token:status-danger`, `token:status-success` and `token:status-info` to the workflow vocabulary end to end: model, codec read/write, render to `var(--ef-color-status-*)`, the workflow JSON schema enum, `contracts/diagram-presentation.json`, documentation and every editor/embed path that enumerates tokens.

**R7-REM-009.2:** Add validation rule `A11Y-NONTEXT-CONTRAST` (error, accessibility) next to `A11Y-CONTRAST`: for nodes and groups a statically resolvable stroke and accent must reach 3:1 against the resolvable fill, or against Forma's light surface-primary `#f2efe7` when no fill is authored; a resolvable edge stroke must reach 3:1 against that surface. Unresolvable (token) values are not judged by this rule.

**R7-REM-009.3:** A token-level test proves every status token and `border-functional` reaches 3:1 against surface-primary and surface-secondary in every theme and brand Forma ships, enumerating any failing pair. Theme colour values are not changed by this item.

**R7-REM-009.4:** Unit tests cover the Rehearsal 6 regression (`#e9a23b` on `#f5f3ed`, 1.95:1, error), the corrected Causa derived indicator (`#9e6410` on `#f5f3ed`, 4.42:1, passes), accent, edge, default fill, token values not judged, and the new tokens' codec round trip and CSS rendering.

**R7-REM-009.5:** A browser test renders a node with a status-token stroke and measures the computed border colour against the computed background in Chromium (light theme).

**R7-REM-009.6:** Record the additive change under Unreleased in `CHANGELOG.md` without bumping versions.
