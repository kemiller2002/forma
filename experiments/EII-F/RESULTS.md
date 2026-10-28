# EII-F: typography roles and layout-constraint regressions

Work item `EII-F` (source: `.praxis/inbox/documents/2026-10-28-EII-F-typography-roles.md`).
Baseline: `main` at `e0b088d` (Forma 0.10.0). All browser runs are Chromium
only: this environment has Chromium 1243 at `/opt/pw-browsers` and no Firefox
or WebKit build, so the `firefox` and `webkit` projects were not run.

## Reproduce before fix

`tests/browser/type-roles.spec.mjs` was written first and run against the
`main` CSS (the three changed CSS sources stashed, Forma rebuilt):

| Run | Result | Log |
|---|---|---|
| `main` CSS | 21 failed, 10 passed | `results/type-roles-before-main.log` |
| this change | 31 passed | `results/type-roles-after.log` |

Failures on `main` that the change removes:

- R5 scenario (site shell, `data-ef-type="application"`): h1 is the fluid
  display size (47.2px at 320px, larger at 820-1440px) instead of the 2xl step
  (32px); the 14ch/18ch caps stay; h1 wraps beyond the R5 limit.
- Every role's fixed steps and leading, on `<html>` and `<body>`, in the site
  shell and on the application layer alone (12 tests), and the role ordering
  and nesting tests.
- Element overlap on the application layer at 200% text, 320-375px: wrapped
  h1/h2 line boxes overlap by 4.0-5.7px (core line-height 1.02).

Passing on `main` and after (the change must not regress them): the
marketing default (no attribute and `data-ef-type="marketing"`), site-shell
containment/overlap/clipping, and focus visibility and keyboard order.

## Rounded-corner regression (LCE-001 padding cap)

The cap was reverted locally (`results/corner-cap-revert.diff`), observed
failing, and restored; the revert was never committed.

| Check | Cap in place | Cap removed |
|---|---|---|
| `npm run test:layout` (internal probe, not in CI) | 50/50 as expected | 31/50, 19 unexpected `boundary.corner` failures (badge, card, diagram, nested badge, 15 Causa fixtures) |
| `tests/browser/corner-containment.spec.mjs` (new, in the browser suite) | 4 passed | 3 failed, 1 passed (badge, button, card crossing by 0.6-11.5px) |

The probe's button fixture did not detect the removed button cap; the new
browser test does (50% radius at 320px).

## Suites

| Suite | Before (`main`) | After |
|---|---|---|
| `npm run test:browser` (Chromium) | 1174 tests: 1161 passed, 13 failed (all `workflow-embed`, package not built); after `npm run workflow:build` those 13 pass on `main` CSS | 1209 tests: 1208 passed, 1 failed (`overlay-motion` interrupted flyout; passed 5/5 on rerun) |
| `npm run test:layout` | 50/50 as expected | 50/50 as expected |
| `npm run site:check` | not run on `main` in full | catalog, site tests 45/45; site:mobile 434 passed, 1 failed (`ULI-A02 tooltip` interactions, also flaky on `main`: 1/15 failed there, 2/15 here) |
| node unit suites (tokens, brands, runtime, design, color, motion, marketing, character-grid, figma, css, package, icons) | pass | pass (package suite 10 tests, including the new corner evaluator test) |

## Forma Studio

Scratch copy of `forma-studio` at `904d3b4`, never committed. Baseline with
its vendored Forma 0.10.0: engine 113/113, browser 74/74 (one `workflow.spec`
test first failed for lack of .NET on PATH and passed on rerun). After
re-vendoring from this build (`scripts/sync-forma.mjs`; only
`foundations.css` changed) and installing this build's package: engine
113/113, browser 74/74, `npm run check` passes.

## Percepta

Not run. `percepta verify` needs a screen contract, bindings and state
fixtures for a Limen application and rejects HTTP targets; `verify-app` needs
`.percepta/bindings.json`. Forma's fixtures are static pages with none of
these, and authoring Percepta contracts in Forma is out of scope. Its checks
(page-level overflow, region visibility, focus indicator) are covered here by
the conformance helpers and `type-roles.spec.mjs`; Percepta has no element
containment, overlap or corner check.
