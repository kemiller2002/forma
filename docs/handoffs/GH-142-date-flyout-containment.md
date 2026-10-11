# GH-142: temporal field and flyout containment

## Objective

Repair the reported iPhone date-field overflow and shrinking/reparented flyout
exit while keeping native HTML state, CSS-only motion and reciprocal timing.

## Changes

- Normalize native date/time/datetime-local appearance and constrain the input
  border box, while retaining native input types and picker behavior.
- Make the flyout surface's column explicitly shrinkable.
- Gate dialog/flyout/backdrop display retention on `overlay: auto` support.
  Without that support, native closing is immediate rather than retaining a
  visible element after losing its viewport/top-layer containing block.
- Update component documentation, generated inventory and stale agent guidance.
- Add regressions using the actual filter example at 320/390px, empty/filled
  temporal inputs, 200% root text size, layout-containing ancestors, retained
  exit geometry and forced absence of overlay-retention enhancement.

The layout-containing-block explanation is an implementation hypothesis, not a
completed reproduction on the user's iOS version. CSS feature detection cannot
prove every engine's retention implementation is bug-free.

## Verification

- Visual Engineering 1.0.1 verification passed; source context
  `b648cdef291d39c443ccb10215529ad69afe8b32`. Applied native-first behavior,
  responsive containment and correct static progressive fallback.
- Motion: 38 tests passed, strict audit zero findings.
- Zero-runtime: 4 tests passed.
- CSS-source: 2 tests passed, including parsed retention-guard coverage.
- Catalog validation passed for 166 components; generated inventory is current.
- Playwright discovers all 12 new browser cases; discovery is not execution.
- Browser installation failed with truncated archive downloads.
- `npm run site:check` cannot build: `dotnet` is unavailable.

## Next action

Run full build, browser and generated-site/mobile suites in CI. Investigate any
failure before merging. Verify the deployed filter flyout on iPhone Safari,
including native picker activation, both directions, Escape/close/submit,
interrupted closing and orientation/toolbar changes. Physical-device behavior,
screen-reader verification and visual exit quality remain unverified.
