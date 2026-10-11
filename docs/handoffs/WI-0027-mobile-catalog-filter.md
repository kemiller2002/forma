# WI-0027: Mobile catalog family filter

The iPhone screenshot showed a nineteen-choice segmented control consuming most
of the All Components page. Replaced it with the canonical labeled native
select. Every family still filters through CSS `:has(option:checked)` and the
page remains free of runtime scripts. The same control serves all viewport sizes.

The native select now has shrinkable grid tracks and bounded intrinsic sizing;
closed option text clips with an ellipsis rather than overflowing at 200% text.
Catalog columns use flexible minimums, and alphabet jump links keep 44px targets.
Updated select catalog documentation and browser tests for the new semantics.

Validation:
- Full generated-site build passed with .NET 10.0.401.
- Catalog validation passed for 166 components; 39 generated-site tests passed.
- 44 CSS tests, 36 marketing checks and 38 motion checks passed; strict motion audit has zero findings.
- WebKit responsive suite: 16 passed, including widths 320, 390, 430 and 1280,
  200% text, focus, touch targets, all 18 families and forced colors.
- Visual review of the rendered 390px page confirmed the compact filter layout.
- Chromium download is unavailable in this environment; physical iPhone review
  and full multi-engine CI are not claimed.

Also repaired the preceding fade PR's tests in a separate parent commit:
all overlay feature blocks are disabled in fallback tests, and tooltip dismissal
moves hover/focus away so native interest does not reopen it. All 19 targeted
WebKit fade/containment tests passed after that repair.

Visual Engineering context 1.0.1 at b648cdef291d39c443ccb10215529ad69afe8b32
verified successfully. Provider usage metrics are unavailable.

This branch is stacked on fix/stationary-surface-dismissal (PR 149). Next:
inspect exact-head CI and retarget to main after the parent merges; merge and
website deployment remain pending authorization and repository gates.

## CI follow-up: tooltip endpoint synchronization

Exact-head CI at c5de7e491a040319fc8a59aba68b27d3260e4855 passed Praxis and
workflow validation but failed WebKit's tooltip reopening endpoint assertion:
opacity was 0.998604 rather than 1 after an animation snapshot had resolved.
The animation snapshot did not establish that the rendered endpoint was ready.
Changed the stationary-dismissal test to poll for exact computed opacity 1
before measuring dismissal and after interrupted reopening. The assertion still
requires full opacity, and the real exit animation, fixed geometry, immediate
native closed state and eventual removal checks remain intact. No production
CSS, animation duration or numerical tolerance was changed.

Validation after the test fix: 19 targeted WebKit fade/containment tests passed;
both tooltip widths repeated 20 times each passed (40/40, four workers).
Syntax and diff checks passed. Full CI must rerun on the new branch head.
