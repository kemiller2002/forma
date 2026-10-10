# Feature Manifest — physics-derived surface motion

## Purpose

Provide one deterministic CSS-only motion grammar for controls and transient surfaces so perceived mass, entry, settling, and dismissal remain coherent across Forma.

## Ownership

- Semantic open/closed/selected state: native HTML or consuming application
- Motion variables, perceived-weight presets, visual entry/exit response: Forma CSS
- Domain legality, permissions, destructive meaning, obligations, and authorization: application/Ordo
- Non-native interaction models such as full ARIA menu behavior, async command palettes, nonmodal drawers, gesture handling, and tab coordination: Limen/application

## Surface defaults

- light: disclosure, popover, ordinary action menu, tab indicator
- standard: alert, toast notification, Aegis fault notification, Aegis fault banner
- heavy: modal dialog, flyout / modal drawer baseline, command palette, Aegis blocking fault

These defaults describe visual inertia only.

## Derived behavior

- inertial entry: `sqrt(mass / stiffness) / damping`
- gravity cue: `sqrt(2 * distance / gravity)`
- exit: identical to inertial entry, with the same easing and clamp bounds
- reduced motion: effectively immediate spatial change with final visual state preserved
- model vocabulary, classification and audit: see `src/motion.manifest.md`

## Native authority

- `details[open]` owns disclosure state
- `:popover-open` owns Popover state
- `dialog[open]` owns modal/flyout state
- `aria-selected` supplied by the application owns tab semantics

CSS must never create a parallel semantic state machine.

## Tests and verification

- `tests/browser/surface-physics.spec.mjs`
- `tests/browser/overlay-motion.spec.mjs`
- `tests/browser/motion-foundation.spec.mjs`
- `tests/motion-audit.test.mjs`
- repository-wide mobile, accessibility, zero-runtime, package and cross-browser checks

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-29

## Native exit fallback

Browser support for retaining native dialog display/overlay during closing varies. Retained CSS transitions reverse from the rendered position; engines that immediately hide the dialog use the correct static closed endpoint. Forma preserves native semantics in both cases and adds no runtime workaround.
