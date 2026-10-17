---
id: RQ-FORMA-2026-A002
title: Public Semantic Color Token Contract
status: draft
version: 0.2.0
owners:
  - design-system
created: 2026-10-16
updated: 2026-10-16
related_documents:
  - tokens/echelon.tokens.json
  - requirements/WHITE-LABEL-AND-SKINNING.md
  - docs/BRANDING.md
  - docs/COLOR.md
  - contracts/color-contract.json
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
    EXE-20261016T214249100Z-e1c09473:
      operations: [modified]
      at: 2026-10-16T21:50:52.393Z
      actor:
        kind: agent
        id: openai/codex
        provider: openai
        model: unknown
        runtime: codex
      reason: "Implement the generated public color contract, validator, fallback policy, packaging, and Summa migration evidence"
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

## Resolved implementation decisions

- Preserve, rather than duplicate, the brand/skin architecture tracked by issue #22 and forced-colors behavior tracked by issue #55.
- Summa primary action uses `surface-inverse` with `text-inverse`; link uses `accent-primary` on `surface-primary` (or Forma's secondary-surface hook); focus uses `focus-ring` with `focus-gap`; danger text uses `status-danger` on `surface-primary` with explicit error text.
- The generated `forma.color-contract/1.0.0` JSON artifact and `forma-color validate` CLI are the release-pinned surfaces. Unknown `--ef-*` names fail even with fallbacks; application-owned variables are ignored.

## Implementation work

Tracked by GitHub issue #159 and repository work item `GH-159`. Forma 0.9.0 implements the generated manifest, API/CLI, fallback policy, compatibility fixture, package exports, release notes, and Summa migration map. Independent review of this still-draft requirement and product palette choices remains pending; implementation does not self-approve either.
