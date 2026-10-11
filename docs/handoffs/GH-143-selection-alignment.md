# GH-143: selection alignment audit

## PR #144 CI repair, October 11

Both failed CI workflows on `ac7648d` identified the same persistent WebKit
320px failure. Reproduced locally with WebKit 26.6: narrowing a grid fieldset
from 1280px to 320px left choice cards at 76.375px while their wrapped content
needed 97.171875px including padding. The marker was 10.3984375px above the
content center. Waiting for two animation frames did not repair the geometry.

Use a column flex layout for `.ef-choice-group`, retaining its gap, native
fieldset/legend semantics and full-width cards. The cards now size from their
wrapped content. Keep the one-pixel alignment tolerance and additionally test
that text fits both top and bottom padding at 100% and 200% text size.

Also scope the callout reduced-motion animation assertion to the callout and
its descendants. The fixture initially loads other controls before replacing
its document; counting all document animations intermittently included those
unrelated outgoing transitions. The callout must still declare no motion and
have zero animations in its own subtree.

Verification: full package build passed using .NET 10.0.401; the 19 targeted
WebKit alignment, callout and flyout-containment tests passed. Motion checks,
strict audit, 44 CSS tests, four zero-runtime tests and catalog checks passed.
Visual Engineering 1.0.1 verification passed, source commit
`b648cdef291d39c443ccb10215529ad69afe8b32`. Principles applied: responsive reflow,
text enlargement, content containment and model-specific reduced motion.
Chromium/Firefox, full CI and physical iPhone verification are pending at this
checkpoint. The earlier local-only publication notes below are historical;
the original fixes were published on PR #144 with explicit user authorization.

## Confirmed defect and repair

The desktop ordinal label declares `align-self: start`. The below-44rem layout
places marker and label side by side but did not override that property, so the
label ignored the option's center alignment. Override only the narrow-layout
label with `align-self: center`; preserve desktop stacked label alignment.

## Other areas inspected

Choice-group and multi-choice cards center their content blocks; their absolute
radio/checkbox marker uses the card's vertical midpoint. Switch/checkbox text
and marker use centered grid alignment. The select indicator uses centered grid
placement plus a small intentional directional offset. Binary choice, matrix,
symbol rating and special-choice layouts use centered placement. Pairwise
options center their content; ranking and obligation rows intentionally use
top alignment for multiline task content. No second identical override defect
was identified from source inspection. This is not physical-device verification.

## Tests and limitations

- CSS-source 3/3 and motion 38/38 pass; strict motion audit has zero findings.
- Catalog validation passes; inventory regenerated.
- Visual Engineering 1.0.1 verification passes, source context
  `b648cdef291d39c443ccb10215529ad69afe8b32`.
- Added 21 browser cases across Chromium/Firefox/WebKit for ordinal alignment
  at 320/390/700px, desktop layout preservation, and choice/switch/checkbox/select
  alignment at 320/390/1280px with 100%/200% root text size.
- Playwright test discovery passes. Actual browser execution remains unavailable
  because downloads failed; full build requires unavailable .NET. No browser
  case is claimed as passed.
- Changes are local only; publication awaits explicit user approval after the
  previous push was rejected by automated review.

Next: publish when authorized, run CI build/browser/mobile checks, and verify
the ordinal and specific reported selection example on iPhone Safari. If the
selection issue persists, capture its page/example and whether the marker is
misaligned with the title alone or with the whole title/description block.
