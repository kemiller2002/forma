# Feature Manifest — motion model vocabulary and audit

## Purpose

Make every Forma animation select one of the five canonical motion models before it selects timing (requirements/MOTION-AND-INTERACTION.md, MOT-010 to MOT-030), and make that selection machine-checkable.

## Models and variables

| Model | Variables (defined in `src/styles/components.css`) | Reduced motion |
| --- | --- | --- |
| inertial / spring | `--ef-motion-inertia-duration`, `--ef-motion-exit-duration`, `--ef-motion-press-duration`, `--ef-motion-spring-easing`, `--ef-motion-damped-easing`; inputs `--ef-motion-mass`, `--ef-motion-stiffness`, `--ef-motion-damping`, `--ef-motion-base-duration` | remove travel, overshoot and compression; final state immediate |
| gravity-derived | `--ef-motion-gravity-duration` from `--ef-motion-distance`, `--ef-motion-gravity` | remove spatial travel |
| constant-velocity / cadence | `--ef-motion-cadence-period` (1600ms), `--ef-motion-cadence-easing` (linear); CharacterGrid SequentialReveal uses its documented `--ef-reveal-*` cadence parameters | stop repeated motion; keep static status |
| direct manipulation / authoritative value | `--ef-motion-direct-duration` (0ms), `--ef-motion-direct-easing` (linear) | preserve the direct mapping |
| perceptual interpolation | `--ef-motion-perceptual-duration` (primitive fast), `--ef-motion-perceptual-emphasis-duration` (primitive standard), `--ef-motion-perceptual-easing` (primitive standard easing) | brief non-spatial change may remain |

Perceptual, cadence and direct variables are defined once on `:where(:root)`. They are independent of perceived mass. Inertial and gravity variables are derived per component scope because they depend on that scope's preset:

- `T_inertia = clamp(110ms, base × sqrt(m / k) / ζ, 420ms)`
- `T_gravity = clamp(100ms, base × sqrt(2s / g), 420ms)`; mass is not an input
- exit `0.68 × T_inertia`, press `0.5 × T_inertia`, legacy state `0.72 × T_inertia`, each clamped

Static fallbacks for browsers without typed CSS math are the standard preset rounded to whole milliseconds: 214ms inertia, 255ms gravity, 154ms state, 107ms press, 146ms exit. `tools/motion-model.mjs` mirrors these derivations, and the tests check the CSS against it.

## Perceived-weight defaults

- light: disclosure, popover, ordinary action menu, tab indicator
- standard: alert, toast, Aegis fault notification, Aegis fault banner
- heavy: modal dialog, flyout, command palette, Aegis blocking fault

Weight is presentation only. It never encodes severity, risk, permission or domain importance.

## Core controls (FORMA-MOT-002)

- Switch, checkbox, select, slider, tab and segment color/background/opacity/filter changes use perceptual interpolation.
- Spatial responses keep the inertial or gravity model: switch thumb travel, checkbox glyph, select indicator rotation and gravity cue, disclosure glyph, tab indicator.
- Buttons (`button`, `.ef-button` in foundations.css): hover and press change the surface only. Press onset uses the direct response (0ms) so activation is never delayed. Release returns by perceptual interpolation.
- Segmented control: native radios own selection, and the checked segment is styled immediately. Where anchor positioning and `anchor-scope` are supported, one `::before` selection indicator travels between segments with the light inertial duration and damped easing. It has no overshoot, so it never implies a neighbouring option, and rapid input retargets it. Without support, or in forced colors, the checked segment's own background carries the selection. Press compression applies to the label text layer, never the hit target.
- Slider: the native value is never transitioned; only hover/active emphasis is.

## Machine-readable catalog

- `catalog/motion/models.json`: taxonomy, the variables each model may use, legacy and generic tokens, spatial properties, audited sources and bundles.
- `catalog/motion/classification.json`: maps every shipped animated selector/property to a model and a reduced-motion strategy.
- `catalog/motion/debt.json`: pre-existing findings, each owned by an open migration issue. It may only shrink; FORMA-MOT-010 empties it.

## Audit

`tools/motion-audit.mjs` (library and CLI) reads core, assessment, marketing and documentation-site CSS. It enumerates every transition, animation, `@keyframes`, `@starting-style`, View Transition and scroll-timeline declaration. It then categorises each duration and easing:

- canonical model variable;
- canonical definition;
- approved fallback (a var() fallback equal to the token it restates);
- reduced-motion collapse constant;
- literal approved on the classification entry;
- a finding: unexplained literal, implicit easing, generic design-token timing, mismatched fallback, legacy token, model/token mismatch, missing/unverified/invalid reduced-motion substitution, repeated motion that does not stop, unclassified keyframes/starting styles/progressive features, stale classification, undefined canonical variable in a standalone bundle, conflicting definitions, or physics fallback/preset drift.

`npm run test:motion` runs the audit's unit tests and the audit itself. It is part of `npm run check`, `npm run release:check` and the conformance and design-system CI workflows.

## Tests and verification

- `tests/motion-audit.test.mjs`: model derivation, CSS reader, audit behavior on fixtures, repository coverage and debt ratchet
- `tests/browser/core-controls-motion.spec.mjs`: segmented indicator placement, retargeting, keyboard/pointer equivalence, hit-target stability, button press, slider directness, perceptual timing, reduced motion, anchor fallback, forced colors
- `tests/browser/motion-foundation.spec.mjs`: resolved vocabulary, perceived-weight defaults (including the Aegis defaults), mass-independent gravity, reduced-motion collapse
- `tests/browser/physics-motion.spec.mjs`, `tests/browser/surface-physics.spec.mjs`, `tests/browser/overlay-motion.spec.mjs`

## Ownership

- Motion variables, model classification, audit: Forma
- Pointer capture, drag routing, View Transition orchestration, scroll-state integration: consuming application / Limen
- Legal state and semantic meaning: Ordo / application state

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-29
