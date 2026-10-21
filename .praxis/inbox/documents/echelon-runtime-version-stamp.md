# Echelon Runtime Version Stamp — Forma input

Status: proposed source input for Praxis.
Stable requirement: `RQ-FORMA-2026-A004`.
Shared contract: `ECHELON-RUNTIME-1`.

## Objective

When Forma's browser runtime entry point is loaded, expose Forma's actual
distributed package version through `window.__ECHELON_RUNTIME__` and emit one
concise production-safe console diagnostic. Preserve Forma's zero-component-
runtime architecture: the entry point reports metadata only and does not own
component behavior.

## Functional and compatibility requirements

- Register `libraries.forma.version` under schema version 1, independently of
  Folio, Limen, load order, or load timing.
- Repeated compatible registration is silent and idempotent. A different
  version for the same library warns clearly and preserves the first value.
- Do not list unloaded libraries or copy arbitrary environment data into the
  registry. Optional commit/build-time fields may be absent.
- Ship the entry point in every supported package format and load it in the
  Forma demonstration site without changing native component behavior.
- Keep production dependencies empty and support Chrome, Edge, Firefox, and
  Safari through the existing browser baseline.

## Build and release integration

Generate the runtime constant from the package manifest during the normal
build. The package export, packed artifact, demonstration site, and browser
fixture must all consume that generated file. Do not maintain a second version
literal or include clock-derived metadata.

## Acceptance and verification

- Playwright reads `window.__ECHELON_RUNTIME__` and compares Forma's value with
  the package version.
- Tests cover Forma only, all three shared-contract names, reverse load order,
  repeated initialization, conflicting versions, and the production site.
- The package contract proves the generated runtime file is distributed.
- Existing component, accessibility, and cross-browser tests continue to pass.

Machine-operability is satisfied only by reading the registry itself; console
text is diagnostic presentation and is not the authoritative interface.
