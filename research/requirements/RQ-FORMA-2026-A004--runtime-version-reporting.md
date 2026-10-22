---
id: RQ-FORMA-2026-A004
title: Browser runtime version reporting
status: accepted
version: 1.0.0
owners:
  - design-system
created: 2026-10-21
updated: 2026-10-21
related_documents:
  - docs/decisions/ADR-0002-zero-runtime-html-css-components.md
  - research/decisions/DF-FORMA-2026-0002--allow-build-stamped-runtime-version-diagnostics.md
  - requirements/QUALITY-AND-DISTRIBUTION.md
  - tests/browser/runtime-version.spec.mjs
tags: [runtime-metadata, versioning, diagnostics, machine-operability, playwright]
provenance:
  contributions:
    EXE-20261021T081649625Z-5b3dab6b:
      operations: [created]
      at: 2026-10-21T08:41:07.774Z
      actor:
        kind: agent
        id: openai/codex
        provider: openai
        model: unknown
        runtime: codex
      reason: "Define and implement the shared runtime version contract for Forma"
---

# Browser runtime version reporting

Forma implements the shared `ECHELON-RUNTIME-1` browser contract without
adding component behavior or a shared runtime dependency.

## Functional behavior

1. Loading Forma's supported runtime entry point MUST create or reuse
   `window.__ECHELON_RUNTIME__` with `schemaVersion: 1` and register only
   `libraries.forma`.
2. The registered `version` MUST be the version of the distributed Forma
   artifact that is executing. Optional `commit` and `buildTime` values MAY be
   omitted.
3. Registration MUST be independent, idempotent, and order-insensitive.
   Compatible duplicates MUST be silent. A conflicting version MUST produce a
   clear warning and MUST NOT replace the original registration.
4. Registration MUST emit one concise production console message for the new
   library. The registry is authoritative; console output is diagnostic only.
5. Metadata MUST be allow-listed and MUST NOT expose environment variables,
   credentials, or other secrets.

## Compatibility expectations

- The runtime entry point MUST work in Forma's supported modern browsers and
  package import flow.
- Existing semantic HTML, CSS, inert authoring tags, web-platform behavior,
  print behavior, and consuming applications MUST remain unchanged.
- The implementation MUST NOT add a production dependency, register custom
  elements, or make a component depend on JavaScript.
- The shared registry MUST permit future lowercase library identifiers and
  independently loaded Folio and Limen registrations.

## Build and release integration

The normal build MUST generate Forma's runtime constant from `package.json`.
The package export, packed files, demonstration site, and browser fixture MUST
consume that generated artifact. No manually maintained duplicate version or
clock-derived build value is permitted.

## Acceptance criteria and verification

- Playwright reads `window.__ECHELON_RUNTIME__` and compares
  `libraries.forma.version` with the package manifest.
- Browser tests cover Forma alone, Forma with Folio, all three library names,
  reversed initialization order, repeated initialization, and a conflicting
  second version.
- The generated production site exposes the registry and contains no other
  component behavior script.
- Package-contract, zero-component-runtime, accessibility, site, and existing
  supported-browser checks pass.
- Verification evidence is attached to `WI-0032`; the requirement is not
  complete merely because this document exists.

## Machine-operability

Automation MUST inspect the registry as structured data. It MUST NOT scrape
console text or infer a version from a filename.
