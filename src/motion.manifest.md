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
- Segmented control: native radios own selection, and the checked segment is styled immediately. Where anchor positioning and `anchor-scope` are supported, one `::before` selection indicator travels between segments with the light inertial duration and damped easing. It has no overshoot, so it never implies a neighbouring option, and rapid input retargets it. Without support, in forced colors, or under reduced motion (where the indicator would not travel), the checked segment's own background carries the selection. Press compression applies to the label text layer, never the hit target.
- Slider: the native value is never transitioned; only hover/active emphasis is.

## Loading and progress (FORMA-MOT-005)

- Skeleton shimmer: cadence at `--ef-motion-cadence-period` (1600ms), linear, runs only while `aria-busy="true"`.
- Spinner: one turn per `--ef-motion-cadence-rotation-period` (1000ms), linear; `data-ef-state="idle"` stops it while the label reports the outcome.
- Neither period encodes importance or expected completion time. Changing the label or other attributes does not restart the cycle. Re-inserting the element does restart it, so applications keep the same element in place while an activity continues.
- Determinate progress: the native `progress` element with no transition, a direct projection that cannot overshoot and shows a reconciliation decrease truthfully.
- Reduced motion: repeated activity stops; visible text and busy semantics remain.

## Tooltip / contextual hint (FORMA-MOT-004)

- `.ef-tooltip` is in the light perceived-weight scope. The surface enters with a 0.25rem origin-related displacement over the light inertial duration and exits over the shorter derived exit duration; opacity is perceptual interpolation in both directions.
- Native popover state is authoritative. The surface is display:none once closed, so there is no invisible interactive state.
- Placement uses spanning `position-area` options with `position-try-order: most-inline-size`, and the hint never grows beyond its area, so it stays inside the viewport even at 320px. Without anchor positioning, the top-layer fallback stays readable.
- Reduced motion removes the displacement; forced colors uses system colors.

## Direct manipulation and settling (FORMA-MOT-006)

Forma exposes presentation hooks only. The application or Limen owns pointer capture, velocity, routing, auto-scroll, legal drop validation, resize state and domain transitions.

| Hook | Meaning | Motion |
| --- | --- | --- |
| `data-ef-manipulation="dragging"` + `--ef-drag-x/-y` | direct phase | direct: 0ms, the visual is the application offset |
| `data-ef-manipulation="settling"` / `"displaced"` | post-release, sibling preview | inertial, damped easing, no overshoot |
| `data-ef-drop="candidate" / "accepted" / "rejected"` | drop presentation | dashed / solid / dashed + surface cue, non-color |
| `.ef-split-pane[data-ef-resizable]` + `--ef-split-size` | resizable split pane | clamped to `--ef-split-min`/`--ef-split-max` in CSS; `resizing` is direct, release and keyboard steps settle |
| `data-ef-collapsed` | collapsed pane | settles to the minimum |

A rejected drop returns to its authoritative position, and the text explanation belongs in the application's live region. Keyboard reorder and resize write the same hooks and end in the same state. Reduced motion places items directly at their final position. Patterns: `patterns/reorder-states.html`, `patterns/resizable-split-pane.html`.

## Progressive motion (FORMA-MOT-007)

Every enhancement below degrades to a correct static presentation, and none of them gates state.

| Feature | Contract | Model | Fallback / reduced motion |
| --- | --- | --- | --- |
| `.ef-disclosure::details-content` with `interpolate-size: allow-keywords` | the native `open` state is immediate; the panel height settles to `auto`, collapsed content stays unfocusable (`content-visibility`) | inertial, damped easing | opens instantly and fully; reduced motion sets `transition: none` |
| `:root[data-ef-view-transitions]` | opt-in crossfade for application-initiated `document.startViewTransition()`; the DOM update happens before snapshots animate | perceptual emphasis | without the API the application updates state directly; reduced motion removes the animation |
| `.ef-scroll-progress` | `scale` is a direct projection of `animation-timeline: scroll()`; no spring, smoothing or lag | direct | hidden without scroll timelines and under reduced motion; decorative (`aria-hidden`) |
| Concurrent composition | press uses `scale`, selection uses `translate`/insets, colors use perceptual properties, so concurrent layers never clobber each other; the `transform` shorthand is reported as `transform-shorthand-motion` | per layer | each layer degrades independently |

Patterns: `patterns/disclosure.html`, `patterns/scroll-progress.html`. View Transitions are opt-in on the root element because Forma never starts them.

## Marketing presentation (FORMA-MOT-008)

- Marketing buttons and interactive cards change color and background by perceptual interpolation. The role tokens `--ef-effect-transition-duration` and `--ef-effect-transition-easing` keep their names; their defaults restate `--ef-motion-perceptual-duration` and `--ef-motion-perceptual-easing`, and the Echelon Marketing Theme aliases the same fast primitive, so a theme cannot silently reintroduce generic standard timing.
- The former `translateY(-2px)` hover lift is removed: hover is emphasis, not a physical event, and moving the hit target under the pointer violates MOT-014. No marketing effect uses spatial motion.
- Smooth scrolling stays browser-controlled, enabled only under `prefers-reduced-motion: no-preference`; reduced motion removes marketing transitions and smooth scrolling entirely.

## Documentation site (FORMA-MOT-009)

- `site/site.css` is a reference implementation of this standard: site buttons use `--ef-motion-perceptual-duration` and `--ef-motion-perceptual-easing` for background and color, with no site-local durations or easing.
- The former `.18s` transitions and `translateY(-2px)` hover lift are removed (the lift moved the hit target under the pointer, MOT-014).
- Smooth scrolling is enabled only under `prefers-reduced-motion: no-preference`; reduced motion removes site transitions entirely.

## Changing values and non-spatial state (FORMA-MOT-011)

- **Values are authoritative immediately.** The application writes the new value; Forma never counts through invented intermediate numbers (odometer or count-through behavior requires a demonstrated task benefit and is not provided). To mark an update, insert the new value element with `data-ef-value-change` (not on first render). The text is fully legible from the first frame; a neutral surface tint fades over `--ef-motion-perceptual-emphasis-duration` with perceptual easing. The treatment is identical for increases, decreases and unchanged values, so motion implies no improvement, decline, success, failure or severity. Announce the change in the application's live region. Pattern: `patterns/metric-value-change.html`.
- **Status** changes are immediate: the status lozenge glyph and text change with the state, so color is never the only cue.
- **Overlay opacity** (popover, menu, toast, command palette, fault notification and banner) and **backdrop dimming** (`background`, `backdrop-filter`) are perceptual interpolation, not mass-derived or linear timing. Spatial entry and exit keep the inertial model; the discrete `display`/`overlay` carriers keep the exit duration.
- **Theme changes** introduce no spatial motion; only existing perceptual color interpolation may run.
- Reduced motion and forced colors show new values immediately with no emphasis motion.
- The debt ledger is empty: `node tools/motion-audit.mjs --strict` passes.

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
- `tests/browser/core-controls-motion.spec.mjs`: segmented indicator placement (verified on rendered pixels, including after pointer selection), retargeting, keyboard/pointer equivalence, hit-target stability, button press, slider directness, perceptual timing, reduced motion, anchor fallback, forced colors
- `tests/browser/motion-foundation.spec.mjs`: resolved vocabulary, perceived-weight defaults (including the Aegis defaults), mass-independent gravity, reduced-motion collapse
- `tests/browser/physics-motion.spec.mjs`, `tests/browser/surface-physics.spec.mjs`, `tests/browser/overlay-motion.spec.mjs`

## Ownership

- Motion variables, model classification, audit: Forma
- Pointer capture, drag routing, View Transition orchestration, scroll-state integration: consuming application / Limen
- Legal state and semantic meaning: Ordo / application state

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-29
