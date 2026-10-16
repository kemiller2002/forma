---
id: RQ-FORMA-2026-A002
title: Public Semantic Color Token Contract
status: draft
version: 0.1.0
owners:
  - design-system
created: 2026-10-16
updated: 2026-10-16
related_documents:
  - tokens/echelon.tokens.json
  - requirements/WHITE-LABEL-AND-SKINNING.md
  - docs/BRANDING.md
tags: [color, design-tokens, validation, compatibility, accessibility]
derived_from: [INPUT-a452dd045071032e]
provenance:
  contributions:
    EXE-20261016T154358749Z-1c5d95dd:
      operations: [created]
      at: 2026-10-16T15:47:18.335Z
      actor:
        kind: agent
        id: openai/codex
        provider: openai
        model: unknown
        runtime: codex
      reason: "Ingest FORMA-COLOR-001 as a draft canonical requirement without claiming implementation or palette approval"
---

# Public Semantic Color Token Contract

Status: **Draft requirement**. Source: `INPUT-a452dd045071032e`, preserving GitHub issue [#159](https://github.com/kemiller2002/forma/issues/159). Ingestion records the obligation; it does not approve a palette or claim implementation.

## Problem and boundary

Consumers can reference plausible `--ef-*` names with literal fallbacks even when those names are absent from the released Forma contract. That makes independent colors appear to be Forma-compatible. This requirement governs whether a token reference is valid for a pinned Forma release. It does not certify that a valid role is the appropriate product palette choice.

Existing brand, skin, forced-colors, and public-token behavior remain authoritative where they already apply. This requirement must extend those contracts rather than duplicate or weaken them.

## Requirements

- **FORMA-COLOR-001.1 — Public manifest.** Publish a versioned, generated, consumable manifest of public semantic CSS properties for every released theme and brand. Each entry identifies its name, semantic role, applicable scopes, supported theme variants, source and provenance, and any deprecated aliases. Public tokens are explicitly separated from internal implementation variables.
- **FORMA-COLOR-001.2 — Deterministic validation.** Provide a deterministic API and CLI usable by applications and Dokimos CI. Validation identifies unknown `var(--ef-*)` references, distinguishes unsupported Forma names from legitimate application-local variables, and reports the file, line, and suggested supported role.
- **FORMA-COLOR-001.3 — Fallback policy.** Specify whether literal fallbacks are permitted for public tokens. A fallback must not silently substitute an unapproved brand or semantic color for an unknown token. Exceptions identify a documented use case, and generated styling must not depend on guessed aliases.
- **FORMA-COLOR-001.4 — Release compatibility.** Token and compiler outputs are deterministic, versioned, and release-compatible. Consumers validate against the contract for their pinned Forma release rather than an arbitrary branch tip.
- **FORMA-COLOR-001.5 — Summa migration.** Document intended replacements for Summa's unresolved primary-action, link, focus, and danger references. Do not bless the current spellings without an explicit semantic decision.

## Acceptance criteria

- Automated fixtures reject `--ef-color-action-primary`, `--ef-color-text-link`, `--ef-color-focus`, and `--ef-color-text-danger` against the Forma 0.6.1 contract while accepting supported public variables.
- A negative fixture proves that a legitimate application-owned `--summa-*` variable is not reported as an unsupported Forma token.
- A consumer can run validation without copying or redefining Forma component CSS.
- Contract changes carry versioned release notes and tests, and diagnostics are reproducible and actionable.
- Documentation distinguishes valid token use from appropriate palette selection; this requirement guarantees only the former.

## Dependencies and unknowns

- Preserve, rather than duplicate, the brand/skin architecture tracked by issue #22 and forced-colors behavior tracked by issue #55.
- The replacement roles for Summa's four unresolved names remain design decisions; ingestion does not select them.
- The public-manifest serialization format and CLI command surface remain implementation decisions constrained by deterministic, release-pinned consumption.

## Implementation work

Tracked by GitHub issue #159 and repository work item `GH-159`. Implementation and visual approval remain pending.
