# WI-0029: Motion, transition and layout quality pass

Objective: a comprehensive motion and layout quality pass. Structural
motion settles directly; fades no longer pop; expand and collapse are
continuous; the motion policy is encoded so the problems do not recur; and
the documentation site has one vertical rhythm with related polish fixed.
Branch `fix/motion-quality-pass`.

## Root causes (measured in Chromium)

- Flyout rebound: the shared `--ef-motion-spring-easing` peaks at 1.055 and
  then undershoots to 0.988. A right flyout travelled about 24px past the
  viewport edge on entry, and on exit swung back into view before
  disappearing. Dialog, toast, alert, tab indicator and glyph rotations
  used the same curve.
- Fade pop: the 120ms `cubic-bezier(0.65, 0, 0.35, 1)` fade changed about
  2% in the first 60Hz frame and then about 38% in a single frame. The
  modal dialog had no opacity transition at all.
- Disclosure: the damped easing moved 40–57% of the height in the first
  frame. A first child's margin collapsed through `::details-content`
  (`overflow: clip` creates no formatting context), so 16px appeared or
  vanished in one frame. The `@starting-style` content fade ran on the
  first open only.
- Site whitespace: Accessibility and Agent use (and Branding) stacked
  `.content-section`'s home-section margin with `.agent-page`/`.brand-lab`
  top padding: about 300px at 1440px, 437px to the Accessibility heading.
- Branding title: its margin and phone size lived in `echelon.site`. The
  heading reset and phone title size in the later `forma.site` layer won,
  leaving 4px instead of 20px between eyebrow and title, and a 48px phone
  title against 54.6px elsewhere.
- Flyout edge strip: the 3rem shadow bled into the viewport at the closed
  position (100%) and popped in and out with display.

## Shared changes

- `--ef-motion-settle-easing`: the critically damped step response (zeta 1,
  omega × T 7) sampled into `linear()`. It is the default for structural and
  in-place travel.
- `--ef-motion-exit-easing` (`cubic-bezier(0.4, 0, 1, 1)`) for surfaces
  leaving. `--ef-motion-exit-duration` is now 0.8 × entry, clamped 90–340ms.
- Fades: `--ef-motion-fade-in-duration` 180ms and `-out` 120ms, with
  `--ef-motion-fade-easing` `cubic-bezier(0, 0, 0.58, 1)`.
- `--ef-motion-spring-easing` is kept only for the switch thumb latch and
  the checkbox glyph confirmation, with purposes recorded in
  `catalog/motion/classification.json`.
- Motion audit: `overshoot-unjustified` and `easing-definition-overshoots`.
  `catalog/motion/models.json` declares `overshootTokens`.
- Policy: MOT-033 in `requirements/MOTION-AND-INTERACTION.md` (amends
  MOT-008, section 7, MOT-010, MOT-018, MOT-030, MOT-031 and MOT-032).
  Decision: `docs/decisions/ADR-0033-settled-structural-motion.md`, which
  supersedes ADR-0030 in part.
- Site: `--site-page-start`, `--site-page-end`, `--site-section-gap` and a
  shared `.page-shell`.

## Components changed

- Flyout: settle entry, exit easing and duration, and shadow clearance.
- Dialog: opacity fade added, settle entry, shorter exit.
- Toast and command palette: settle entry, exit easing and duration,
  asymmetric fades.
- Popover, menu, tooltip: asymmetric fades.
- Alert, tab panel, fault notification and banner entries: settle easing.
- Tabs: no selection translate; the indicator settles.
- Segmented indicator, select chevron, disclosure glyph, checkbox glyph
  rotation, drag settling, split pane, View Transition group: settle easing.
- Disclosure: `flow-root` content box, block-axis-only clipping, content
  fade on every toggle, collapse at the exit duration.

## Removed, retained and not added

- Intentionally removed:
  - the tab 0.08rem rise on selection;
  - the disclosure content translate;
  - overshoot on all structural and indicator motion.
- Intentionally retained:
  - the switch thumb latch spring and checkbox glyph scale spring (input
    feedback within the control);
  - press compression;
  - skeleton and spinner cadence (only while the activity runs);
  - the value-change tint;
  - the opt-in View Transitions and scroll progress.
- Intentionally not animated: the site's navigation `<details>` groups stay
  instant.

## Polish fixes

- The current navigation section was clipped off-screen on phones. It is
  now kept in view with `scroll-initial-target`, end-aligned.
- Hover-only styles stuck on touch. They are now gated with
  `@media (hover: hover)` in site, foundations, components, assessment and
  marketing CSS.
- Agent use and Branding got breadcrumbs, so every content page has the
  same structure.
- American English in site-visible catalog prose, icon pages and comments.
- The Branding title's spacing and phone size, lost to cascade-layer order,
  are restored.

## Tests

New tests:

- `tests/browser/structural-motion.spec.mjs` (23 tests: flyout, modal,
  interruption, rapid toggling, keyboard focus, input pass-through, reduced
  motion, expand/collapse, tab indicator, switch latch bounds; desktop and
  mobile);
- `tests/site-browser/page-rhythm.spec.mjs`;
- overshoot and settle-curve unit tests in `tests/motion-audit.test.mjs`.

Updated: the overlay-motion, surface-physics, surface-fade (real
transitions sampled at 60Hz and 120Hz), tooltip, motion-foundation,
value-change, aegis and accessibility specs. Axe now waits for animation
promises through `motionSettled`.

## Validation

All results below are from 2026-10-12 on the local machine.

- `npm run build` passed, as did the check steps: icons, tokens, brands,
  runtime, motion (44 tests; strict audit at 98 tracks and 0 findings),
  marketing, character-grid, figma, css, package, workflow test, build and
  package.
- Browser suite in Chromium: 1186 of 1187 passed. The one failure is
  `workflow-embed.spec.mjs:126`, a color-contrast finding on
  `.ef-workflow-editor__hint`. It fails identically on the untouched
  baseline and is filed as a follow-up.
- `npm run site:check` passed: catalog valid with 166 components, 39 site
  unit tests, 72 site browser tests.
- Not run locally:
  - Firefox and WebKit, because those Playwright browsers are not
    installed. CI must run them; dialog exit retention differs there, and
    the tests branch on it.
  - The Visual Engineering CLI: the package is not installed, and
    `npx --no-install` refused to fetch it. Context 1.0.1 at `b648cdef` was
    consulted by hand.
  - Physical devices.
- Visual review: frame-by-frame filmstrips of the flyout at 1280px and the
  modal at 390px, and screenshots of Accessibility, Agent use, Branding,
  Compositions, Icons and a component page at 1440, 1024, 768 and 390px.

## Known issues and next steps

- Web fonts swap after first paint (`display=swap`), reflowing pages by
  about 37px. Filed as a follow-up; the site hover test waits for
  `document.fonts.ready`.
- A disclosure opened in the same frame it is inserted opens at its final
  size, because CSS transitions need a rendered starting style. The final
  state is unaffected.
- After collapse, closed disclosure content may report opacity just above
  0, because the engine stops ticking `content-visibility: hidden`
  subtrees. It is invisible either way.
- Next: run CI across Chromium, Firefox and WebKit on this branch, resolve
  any engine differences, and integrate through the repository gates.
