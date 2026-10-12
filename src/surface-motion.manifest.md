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
- exit: `0.8 ×` the inertial entry duration (clamped 90–340ms) with `--ef-motion-exit-easing`, so exits are shorter than entries (standard 214ms entry, 171ms exit; heavy about 331ms and 265ms; light 144ms and 115ms)
- entry and in-place travel: `--ef-motion-settle-easing`, critically damped, no overshoot or rebound
- popover, menu and tooltip: stationary perceptual fades, 180ms in and 120ms out with the decelerating `--ef-motion-fade-easing`; retain top-layer geometry until opacity is zero (MOT-032)
- dialog and flyout backdrop: dims and blurs with the same fade tokens, independent of mass
- reduced motion: effectively immediate spatial change with final visual state preserved
- model vocabulary, classification and audit: see `src/motion.manifest.md`

## Settling and overshoot (MOT-033)

Structural motion settles directly; overshoot needs a documented purpose; exits are shorter than entries. Surfaces stop exactly at their destination, and a flyout never swings back into view on close. The restrained `--ef-motion-spring-easing` remains only for the switch thumb latch and the checkbox glyph's scale, which confirm input the user just gave.

## Native authority

- `details[open]` owns disclosure state
- `:popover-open` owns Popover state
- `dialog[open]` owns modal/flyout state
- `aria-selected` supplied by the application owns tab semantics

CSS must never create a parallel semantic state machine.

## Tests and verification

- `tests/browser/surface-physics.spec.mjs`
- `tests/browser/overlay-motion.spec.mjs`
- `tests/browser/structural-motion.spec.mjs`
- `tests/browser/motion-foundation.spec.mjs`
- `tests/motion-audit.test.mjs`
- repository-wide mobile, accessibility, zero-runtime, package and cross-browser checks

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-10-12

## Native exit fallback

Browser support for retaining native dialog display/overlay during closing varies. Retained CSS transitions reverse from the rendered position; engines that immediately hide the dialog use the correct static closed endpoint. Forma preserves native semantics in both cases and adds no runtime workaround.
