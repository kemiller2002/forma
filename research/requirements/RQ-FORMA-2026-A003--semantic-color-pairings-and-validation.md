---
id: RQ-FORMA-2026-A003
title: Semantic Color Pairings and Rendered Validation
status: draft
version: 0.2.0
owners:
  - design-system
created: 2026-10-16
updated: 2026-10-16
related_documents:
  - research/requirements/RQ-FORMA-2026-A002--public-semantic-color-contract.md
  - requirements/WHITE-LABEL-AND-SKINNING.md
  - requirements/QUALITY-AND-DISTRIBUTION.md
  - docs/COLOR.md
  - contracts/color-contract.json
tags: [color, themes, contrast, forced-colors, visual-regression, accessibility]
derived_from: [INPUT-a8ac4002e79dce7d]
provenance:
  contributions:
    EXE-20261016T154358749Z-1c5d95dd:
      operations: [created]
      at: 2026-10-16T15:47:19.335Z
      actor:
        kind: agent
        id: openai/codex
        provider: openai
        model: unknown
        runtime: codex
      reason: "Ingest FORMA-COLOR-002 as a draft canonical requirement preserving its dependency and human-judgment boundary"
    EXE-20261016T214249263Z-6b460da6:
      operations: [modified]
      at: 2026-10-16T21:50:52.561Z
      actor:
        kind: agent
        id: openai/codex
        provider: openai
        model: unknown
        runtime: codex
      reason: "Implement semantic pairings, cross-theme status roles, and rendered non-color accessibility evidence"
---

# Semantic Color Pairings and Rendered Validation

Status: **Draft requirement**. Source: `INPUT-a8ac4002e79dce7d`, preserving GitHub issue [#160](https://github.com/kemiller2002/forma/issues/160). Ingestion records the obligation; it does not approve a palette or claim implementation.

## Problem and boundary

Formula-only contrast checks do not prove that downstream screens use semantic roles coherently or communicate priority and state. This requirement defines supported role pairings and executable rendered evidence while keeping product-level aesthetic and hierarchy judgments explicit.

It depends on the public, release-pinned token contract in `RQ-FORMA-2026-A002` and extends current contrast, brand, theme, and accessibility checks rather than replacing them.

## Requirements

- **FORMA-COLOR-002.1 — Roles and pairings.** Define documented foreground/background pairs and semantic roles for primary and secondary actions, links, selection, notice, warning, danger, success, disabled, pending or unknown, focus, and categorical and ordinal data-visualization marks. Identify which roles are application-level extensions, supported Forma primitives, or not applicable.
- **FORMA-COLOR-002.2 — Theme behavior.** Define light, dark, and forced-colors or high-contrast behavior for every exposed role. Derived colors, including `color-mix`, translucent overlays, and computed backgrounds, are validated against their rendered effective surface rather than source hex values alone.
- **FORMA-COLOR-002.3 — Meaning without hue.** Critical meaning remains available without hue alone through text, icon, pattern, position, border, or accessible name as appropriate, including charts and status badges.
- **FORMA-COLOR-002.4 — Executable fixtures.** Add representative fixtures for navigation and current state, focus, notices, errors, tables, disabled and unknown states, and charts. Verify normal text at WCAG AA 4.5:1 and meaningful nontext or large-text contrast at the applicable thresholds without implying that AA contrast proves aesthetic quality.
- **FORMA-COLOR-002.5 — Human judgment boundary.** Document areas where product-level palette and hierarchy judgment is required and cannot be certified by automated contrast tests.

## Acceptance criteria

- Light and dark fixtures use valid public Forma roles and verify rendered or computed colors on real components.
- A fixture exercises grayscale and protan, deutan, and tritan simulation as screening, plus forced colors, keyboard focus, and status interpretation without color.
- Regression tests fail on dark-theme foreground/surface mismatches and unrecognizable state meaning.
- At least one negative test proves that a contrast calculation alone cannot produce a false success for semantic comprehension.
- Existing contrast, brand, theme, and accessibility checks are reused and extended, not replaced.

## Resolved implementation decisions

- `RQ-FORMA-2026-A002` defines the public vocabulary in the generated release-pinned contract.
- Preserve the brand/skin architecture in issue #22, forced-colors work in issue #55, and the Visual Engineering controlled-theme evaluation tracked by visual-engineering issue #14.
- The executable fixture composes existing navigation, status, callout, form, table, disabled-state, and focus patterns plus a labelled/patterned application-owned chart. Browser tests cover light, dark, forced colors, computed contrast, keyboard focus, grayscale and protan/deutan/tritan matrix screening. Automated simulation remains screening evidence, not proof of human perception or aesthetic quality.

## Implementation work

Tracked by GitHub issue #160 and repository work item `GH-160`. Forma 0.9.0 implements the role table, public status vocabulary, rendered fixture, theme/brand contrast gates, non-hue assertions, dark-pair mismatch fixture, and contrast-only semantic-comprehension refusal. Independent review of this still-draft requirement and product-level aesthetic judgment remains pending.
