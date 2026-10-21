---
id: DF-FORMA-2026-0002
title: Allow build-stamped runtime version diagnostics
status: accepted
type: decision-record
created: 2026-10-21
updated: 2026-10-21
tags: [architecture, runtime-metadata, diagnostics, versioning]
supersedes: []
superseded_by: []
related_documents:
  - docs/decisions/ADR-0002-zero-runtime-html-css-components.md
  - research/requirements/RQ-FORMA-2026-A004--runtime-version-reporting.md
provenance:
  contributions:
    EXE-20261021T081649625Z-5b3dab6b:
      operations: [created]
      at: 2026-10-21T08:41:07.965Z
      actor:
        kind: agent
        id: openai/codex
        provider: openai
        model: unknown
        runtime: codex
      reason: "Record the narrow metadata-only exception to Forma's zero-component-runtime architecture"
---

# Context

Forma's components intentionally use semantic HTML and CSS without a browser
behavior runtime. Applications nevertheless need to identify which published
Forma artifact is actually loaded, alongside Folio and Limen, using one
machine-readable browser contract.

# Decision

Forma permits one generated, dependency-free `./runtime` module whose sole
responsibility is registering build-stamped package metadata under
`ECHELON-RUNTIME-1` and presenting its diagnostic console message. The module
does not register elements, inspect or mutate the document, implement
interaction, or become a component prerequisite.

The demonstration site loads this module so its deployed artifact is
observable. Package consumers may import it when they require runtime
reporting. The version is generated from `package.json`; clock-derived metadata
is omitted.

# Consequences

- Forma remains zero-component-runtime and retains zero component JavaScript.
- `dist/runtime.js` is an explicit, narrowly scoped exception to the older
  absolute prohibition on JavaScript in `dist/`.
- The diagnostic contract is testable in production builds without a shared
  package or a dependency between Forma, Folio, and Limen.
- Consumers that never load the runtime entry point do not receive a false
  Forma registration.

# Validation

Package, source-policy, site, and Playwright tests must prove the runtime file
is the only JavaScript exception and does not own component behavior.
