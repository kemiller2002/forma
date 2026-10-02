# Forma Machine-Operability Contract

Status: required baseline  
Date: 2026-10-02  
Reference automation: Playwright  
Applies to: every public interactive Forma pattern and every application interaction surface built from Forma

## 1. Principle

Every action available to a human through a Forma-based interface MUST have a deterministic, semantically discoverable machine-operable path that reaches the same authoritative application state.

Automation MUST NOT need visual guessing, image recognition, generated CSS classes, DOM position, coordinate-only input, or arbitrary sleeps to perform an action or determine that it completed.

Playwright is the reference conformance tool, not the architecture. The contract must remain usable by WebDriver, Selenium, accessibility tooling, AI browser agents, and future automation systems.

## 2. Ownership

Forma owns semantic markup, accessible naming, public structure, documented presentation-state hooks, and the requirement that a non-pointer path exists.

The consuming application or Limen owns behavior beyond native HTML, including drag geometry, async actions, command dispatch, focus orchestration, and application state synchronization.

Ordo/application domain state owns legality, capabilities, obligations, permissions, and consequential transitions.

Automation uses the same public semantic surface a user does. It does not receive a private bypass around domain rules.

## 3. Requirements

### FMO-001 Human/machine action parity

Every supported human action MUST have a machine-operable equivalent that produces the same authoritative state transition.

### FMO-002 Native semantics first

If native HTML exposes the action and state, automation MUST be able to use that native semantic contract. Prefer buttons, links, labeled form controls, details/summary, dialog, popover, and other platform semantics over custom click targets.

### FMO-003 Semantic discovery

Interactive controls MUST expose an appropriate role and accessible name through native HTML or valid ARIA. Automation MUST be able to locate an action by meaning, not presentation.

### FMO-004 Stable identity

Objects that must be addressed across renders, reordering, panning, or document regeneration MUST expose a stable consumer-owned identity. Prefer native `id`, `name`/value, URL/hash targets, or an application-owned domain key. Identity MUST NOT depend on DOM index, generated CSS classes, visual coordinates, or transient layout.

### FMO-005 Observable state

Meaningful UI state MUST be observable through native state, valid ARIA, text/status output, or a documented public state hook. Color, animation, pixel position, or visual styling alone MUST NOT be the authoritative state channel.

### FMO-006 Observable completion

Every machine-operated action MUST have a deterministic completion condition such as native state change, a documented state attribute, navigation, live/status output, or application state rendered back into the DOM.

Tests MUST NOT require fixed sleeps to guess when an operation finished.

### FMO-007 Direct manipulation equivalence

Drag, resize, pan, draw, connect, reorder, and similar direct-manipulation features MUST provide a non-coordinate semantic action path when the operation changes meaningful application state.

Examples include move buttons, named commands, form controls, keyboard actions, or an application/Limen command surface that reaches the same transition.

### FMO-008 No pointer-only or hover-only actions

Pointer gestures and hover MAY be convenience paths. They MUST NOT be the only way to discover or invoke an action.

### FMO-009 Coordinate input is not a public contract

Automation MAY test gesture rendering with coordinates, but business or workflow automation MUST NOT require clicking or dragging to hard-coded pixels.

### FMO-010 Animation is non-authoritative

Animation and physics MAY communicate continuity or feedback, but they MUST NOT determine transition legality or completion. Reduced motion or zero-duration rendering MUST preserve the same final state.

### FMO-011 Public DOM boundary

Required machine interaction surfaces MUST remain reachable through the public DOM/accessibility tree. Forma MUST NOT introduce closed Shadow DOM or opaque rendering surfaces that hide required controls or state.

### FMO-012 Locator priority

Reference automation SHOULD locate controls in this order:

1. semantic role plus accessible name;
2. native relationships and stable values such as label, `id`, `name`, value, or URL/hash target;
3. documented application-owned stable object identity;
4. documented public state attributes for inspection.

Canonical conformance tests MUST NOT invoke actions through `nth-child`, generated class names, transient DOM position, or private implementation selectors.

### FMO-013 Test IDs are not the architecture

A consumer MAY add test-specific identifiers for local needs, but Forma MUST NOT require `data-testid` or equivalent identifiers when semantic/native identity is sufficient.

### FMO-014 Recomposition stability

Responsive layout, skinning, theming, localization, animation, and visual reordering MUST NOT change the semantic identity or meaning of an action.

### FMO-015 Same legality for every actor

Machine invocation MUST pass through the same application/domain legality checks as human invocation. A machine-operable path MUST NOT become an authorization or validation bypass.

### FMO-016 Error and rejection observability

Rejected, unavailable, disabled, invalid, or failed actions MUST expose a machine-observable state or message. A visual shake, color change, or return animation alone is insufficient.

### FMO-017 Tool neutrality

The contract MUST be expressible through standard browser semantics and documented public application contracts. It MUST NOT depend on Playwright-specific APIs.

### FMO-018 Compatibility

Machine-operable identity, action semantics, and observable state are part of the public interaction contract. A change that removes or materially changes an established machine path requires migration treatment equivalent to other public interaction contract changes.

## 4. Reference Playwright rules

Playwright conformance tests SHOULD:

- use `getByRole`, `getByLabel`, or equivalent semantic locators for actions;
- use stable public identity only when role/name cannot distinguish repeated domain objects;
- wait for state, navigation, status, or another deterministic completion signal;
- demonstrate keyboard/non-pointer equivalence for direct-manipulation features;
- prove rejected/disabled paths are observable;
- avoid fixed `waitForTimeout` sleeps for correctness;
- avoid CSS-class or positional selectors when invoking user actions.

CSS selectors remain appropriate for inspecting Forma presentation hooks or scoping a fixture; they are not the preferred action interface.

## 5. Definition of done

For each supported interaction, a reviewer or automation agent must be able to answer from the public interface:

1. What is this object or control?
2. Which instance is it?
3. What state is it in?
4. What actions are available?
5. How is an action invoked without visual guessing?
6. How do I know the action succeeded, failed, or was rejected?

If one of those questions cannot be answered through the public interaction contract, the interaction is not complete.

## 6. CI gate

Machine-operability conformance MUST run as part of normal browser and release validation. A regression in an established machine identity, semantic action path, or observable completion contract blocks merge/release unless the public contract is intentionally versioned with migration guidance.
