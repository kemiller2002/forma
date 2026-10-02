---
id: DF-FORMA-2026-0001
title: Adopt semantic machine operability as a public interaction contract
status: accepted
date: 2026-10-02
work_item: FORMA-GH-98
related:
  - requirements/MACHINE-OPERABILITY.md
  - contracts/machine-operability.json
  - docs/AGENT-USAGE.md
---

# Context

Forma already requires semantic native HTML, keyboard alternatives, non-color state cues, and application/Limen ownership of non-native behavior. Those properties make browser automation possible, but machine operability was an emergent benefit rather than an explicit compatibility contract.

A test suite could instead standardize on CSS classes, generated test IDs, coordinate clicks, and fixed waits. That would automate today's rendering while coupling agents to implementation details and would not guarantee accessibility, tool independence, or equivalence with human actions.

# Decision

Forma treats machine operability as part of every interaction's public contract.

Every human-operable action must have a deterministic semantic machine path to the same authoritative application state. Native role/name/state is preferred. Stable consumer-owned identity is used where repeated domain objects need addressing. Direct manipulation must retain a non-coordinate semantic equivalent for meaningful state changes.

Playwright is the reference conformance tool, but no Playwright-specific API becomes part of the production contract.

Forma remains zero-runtime. Native HTML exposes native behavior; application/Limen code owns behavior beyond HTML; Ordo/application domain state owns legality and consequential transitions. Machine actors receive no bypass around those layers.

# Consequences

- Machine operability becomes a definition-of-done property rather than a testing convenience.
- Responsive layout, skins, animation, DOM refactoring, and visual reordering may not silently break established semantic automation paths.
- Coordinate gestures may still be tested for presentation fidelity, but workflow automation cannot depend on coordinates alone.
- Fixed sleeps are not valid completion evidence when observable state exists.
- Semantic accessibility work and automation reliability reinforce the same public structure.
- Breaking an established machine identity/action/state contract requires migration treatment.

# Rejected alternatives

## Standardize on data-testid

Rejected as the default because it creates a parallel machine-only interface and does not prove that controls are semantic or human-accessible. Consumers may still add local test identifiers when semantic identity cannot express a local need.

## Standardize on Playwright selectors

Rejected because Playwright is a verifier, not the architecture. The public contract must survive a change of automation tool.

## Expose a privileged automation API

Rejected because it could bypass the same legality, validation, permission, and state-transition rules that govern human actions.

# Validation

The contract is executable through `tests/browser/machine-operability.spec.mjs` and the normal Playwright suite. The reference checks intentionally invoke actions by semantic role/name and verify deterministic DOM state instead of timing or pixel position.
