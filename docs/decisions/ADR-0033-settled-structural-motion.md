# Settled structural motion

Accepted 2026-10-12 under the user-requested motion, transition and layout quality pass (WI-0029). Supersedes the equal-timing parts of ADR-0030.

## Context

Flyouts rebounded at their destination: the shared `--ef-motion-spring-easing` (`linear(0, 0.42 24%, 0.82 48%, 1.055 70%, 0.988 88%, 1)`) overshot by 5.5% and undershot on return. Measured in Chromium, a right flyout travelled about 24px past the viewport edge on entry, and on exit overshot and swung back into view before disappearing. Dialogs, toasts, alerts, tab indicators and glyph rotations used the same curve. ADR-0030 had also made exit share entry's duration and easing.

Fades popped. The 120ms `cubic-bezier(0.65, 0, 0.35, 1)` fade changed opacity by about 2% in its first 60Hz frame and then by about 38% in a single frame. The modal dialog had no opacity transition, so the opaque surface appeared and disappeared in one frame.

Disclosure expansion snapped and then jumped. The damped easing moved 40–57% of the height in the first frame at light-preset durations. A first child's top margin collapsed through `::details-content` (`overflow: clip` does not create a formatting context), so 16px appeared or vanished in one frame at the ends of the animation. The content fade relied on `@starting-style`, which ran on the first open only.

## Decision

- Physical models choose motion; a critically damped response is the correct model for a body that must stop at a destination. Add `--ef-motion-settle-easing`, the step response of a critically damped system (zeta = 1, omega × T = 7) sampled into `linear()` within 0.002, and use it for structural and in-place travel.
- Exits are shorter than entries: `--ef-motion-exit-duration` = `0.8 × T_inertia`, clamped to 90–340ms. Surfaces leaving the viewport or becoming transparent use `--ef-motion-exit-easing` (`cubic-bezier(0.4, 0, 1, 1)`).
- Fades use a decelerating curve that changes from the first frame: 180ms in, 120ms out. The modal dialog fades.
- Overshoot is an exception. `--ef-motion-spring-easing` stays only for the switch thumb latch and the checkbox glyph confirmation, each with a documented purpose. The motion audit rejects any other overshooting easing.
- Disclosure content box becomes `display: flow-root`. It clips only the block axis, so focus indicators are not cut at the inline edges. Its content fade follows the native open state in both directions.
- Tabs no longer move when selected.

The policy is MOT-033 in `requirements/MOTION-AND-INTERACTION.md`.

## Alternatives rejected

- Reducing the spring's amplitude. Rebound becomes harder to see without removing the inappropriate behavior.
- Lengthening fades to hide the step. This slows every interaction and leaves the single-frame jump in place at 120Hz and under load.
- A runtime spring simulator. It would break Forma's zero-runtime contract, and CSS `linear()` already expresses the critically damped curve exactly enough.

## Consequences

Consumers that relied on exit equalling entry, or on `--ef-motion-exit-duration` equalling `--ef-motion-inertia-duration`, see shorter exits. Consumers using `--ef-motion-spring-easing` on their own selectors keep the same curve; Forma's audit applies only to Forma's own CSS. Axe or screenshot tooling that samples immediately after opening a dialog now observes a fade in progress, so it should await the browser's animation promises (`tests/browser/helpers.mjs` `motionSettled`).

A disclosure opened in the same frame it is inserted has no rendered starting style, so it opens at its final size. This is correct CSS transition semantics, and the final state is unaffected.

Reverting the commit restores the previous behavior.
