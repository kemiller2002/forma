# Indy Init compatibility: Forma 0.13.0 layout reliability (LRP-001)

Assessed 2026-10-30 for work item `WI-0042`. Indy Init (`kemiller2002/Indy-init`) was read only; nothing there was changed, and its lock is untouched.

## What was and was not executed

- **Executed.** `tests/browser/causa-representative.spec.mjs` and `tests/fixtures`-based checks:
  - The Causa-shaped regions are built from canonical Forma patterns with realistic Causa content (SHAs, evidence paths, hypothesis IDs).
  - They were measured in Chromium, Firefox and WebKit (WebKit stands in for iPad Safari).
  - Viewports: 320px, iPad portrait 820×1180, iPad landscape 1180×820 and 1440px desktop, each at default and 200% text.
- **Not executed.** No Causa application exists to test. Indy Init is a planning repository: the application is built from zero at kickoff (`docs/HACKATHON-BOUNDARIES.md`). It contains no CSS and no `ef-*` usage to run the token validator against.
  - Integration with Limen, Folio and Arca, and the exact-SHA deployment acceptance (DEP-CURRENT-004), are therefore **not** claimed.
  - The fixtures are evidence about Forma's components with Causa-like content. They are not evidence about Causa.

## Indy Init requirements this bears on

| Requirement | Source |
|---|---|
| Visible focus, narrow mobile, iPad portrait and landscape, desktop, 200% text reflow | `docs/CAUSA-UI-EXPERIENCE-REQUIREMENTS.md` UI-011 |
| Colors only through named Forma tokens; WCAG AA | UI-016 |
| Save indicator readable at 320px, at 200% text and on iPad; Chromium and WebKit | `docs/CAUSA-PERSISTENCE-REQUIREMENTS.md` (line 84; line 146 for the engines) |
| No fixed-height clipping at high zoom; no horizontal scrolling for primary tasks | `docs/INVESTIGATION-WORKSPACE.md` |
| Page and element overflow at 320px and 200%, corner containment, axe A/AA in the application | `docs/engineering-improvement/investigations/regression-preservation.md` ESO-R6-10 |

## Verified improvements

| Causa area | Forma pieces | Result on 0.13.0 |
|---|---|---|
| Save-state indicators | `.ef-status-lozenge`, `.ef-freshness`, `.ef-identifier` with a repository@SHA | Contained, with no page scroll, at every viewport and text size in all three engines. |
| Conflict dialogs | `.ef-conflict-review` with long paths and SHAs; `dialog.ef-dialog` with a validation summary | Contained at every viewport. The modal dialog stays in the viewport at 320 and 768px at both text sizes, and focus is visible. On 0.12.0 a validation-summary SHA escaped the dialog by 175px. |
| Command interface | `.ef-command-palette` opened modally | Contained and on screen at 320px and iPad portrait at both text sizes. Before this patch a long command label overflowed by 5px at 320px with 200% text. |
| Evidence inspector and timeline | `.ef-split-pane` with `.ef-timeline` and `.ef-key-value-list` | Contained everywhere except iPad portrait at 200% text; see the limitations. |
| Causal graph container | `.ef-bounded-overflow` holding an 84rem canvas | The canvas scrolls inside its region and the page does not scroll. |
| Investigation dashboard | `.ef-dashboard-grid` with `.ef-metric-card` | Contained except at iPad portrait with 200% text; see the limitations. |
| Navigation | `.ef-navigation-shell`, and `.ef-landmark-region` with 10 items | Contained with no page scroll. |
| Forms, iPad Safari | `.ef-form-row` with a long-option `select` | On 0.12.0, WebKit scrolled the page sideways by 300px at 320px. On 0.13.0 it does not. |
| Rounded panels | Brand radius on `.ef-surface` | Text stays inside the curve (corner check) at 320px and at 200%. |
| Accessibility | axe WCAG 2.0/2.1/2.2 A/AA | No violations on the Causa-shaped page at iPad portrait, or on the layout fixtures at 375px. |

Rehearsal defects these address:

- **Text escaping rounded pills (R5).** The 0.10.0 radius bound already covered Forma's own components. 0.13.0 adds containment for arbitrary text inside Forma containers.
- **Unexpected horizontal scrolling on iPad.** Fixed for the WebKit select case.
- **Invalid tokens.** Indy Init records no instance. UI-016's "colors only through named Forma tokens" is now checkable with `tools/TokenValidator` (see below).

## Remaining limitations

1. **Some components reflow only on a viewport media query.** This affects `.ef-dashboard-grid`, `.ef-split-pane` and `.ef-operation-status`.
   - Under page-level 200% text at iPad portrait width (820px), these stay wider than their region and the page scrolls sideways. The containment measurements give the sizes.
   - With the browser's own text-size setting, media queries in `em` respond, so this applies to page-level scaling and to these components inside narrower containers.
   - It is the same class as the open `.ef-alert` item (`env-and-forma.md`).
   - The spec asserts these still fail, so a fix will be noticed.
   - **Causa impact:** at iPad portrait with 200% text, put the dashboard, inspector and operation-status regions in a single column, or a container that collapses them, until Forma provides container-relative reflow.
2. **Narrowed SVG charts.** A narrowed SVG with `width`/`height` attributes keeps a box taller than its drawing. No cross-engine fix exists without regressing icons. Give Causa charts `block-size: auto`, or omit the `height` attribute.
3. **Firefox focus scrolling.** Firefox does not honour `scroll-margin` when tabbing, so a focus ring can sit partly past a scroll edge. The element stays visible (WCAG 2.4.11).
4. **Narrow dialogs at 200% text.** At 320px with 200% text, the dialog's nested padding leaves a narrow column (about 80px) for validation-summary text. The text is contained but cramped.
5. **Unverified application integration.** See "What was and was not executed" above.

## F#, Limen and package compatibility

- **No breaking API change.**
  - No `ef-*` class, `--ef-*` token, pattern, export or attribute was removed or renamed.
  - `@echelon-foundry/forma-workflow` 1.2.0 and the `Forma.Workflow` F# engine are unchanged. The Causa graph path (forma-workflow frame) is unaffected.
  - Forma remains zero-runtime: `dist/runtime.js` is byte-identical in size (3,030 bytes), there are no new runtime dependencies, and no JavaScript layout engine was added. Limen's boundary is untouched.
- **Token validator.**
  - It targets `net10.0`.
  - Indy Init pins .NET SDK `10.0.402` with `rollForward: disable`. The validator was built and run here with 10.0.403, not 10.0.402. A feature-band match is expected to build, but that was not executed.
  - It needs only the base class library: no NuGet packages.
- **Behaviour change Causa should know about.**
  - Long unbroken tokens inside Forma containers now break at the container edge instead of overflowing.
  - Text that must not wrap needs `white-space: nowrap`, or `.ef-bounded-overflow` to scroll.

## Required consuming-application changes

None are required to adopt 0.13.0. Recommended:

1. Run the token validator in Causa CI:
   ```bash
   dotnet run --project node_modules/@echelon-foundry/design-system/tools/TokenValidator/TokenValidator.fsproj -- --forma node_modules/@echelon-foundry/design-system src/
   ```
   Use application-owned names (`--causa-*`) for Causa's own properties. Declaring new `--ef-*` names is reported.
2. Use `@echelon-foundry/forma-conformance` 0.3.0 in Causa's Playwright suite. It covers ESO-R6-10:
   - `expectContained` on each screen region;
   - `expectFocusVisible` while tabbing;
   - `expectTextInsideCorners` on rounded tags;
   - `expectNoOverflow` at 320px and 200%.

   Version 0.3.0 is the first npm release that carries the corner check. Earlier releases did not publish the 0.11.0 corner helpers.
3. Plan the iPad-portrait 200% layout around limitation 1.

## Recommended version and lock decision

- **Recommended Forma version:** `@echelon-foundry/design-system` **0.13.0**, with `@echelon-foundry/forma-conformance` 0.3.0 as a dev dependency. forma-workflow stays at 1.2.0.
- **Is it safe to include in the Indy Init dependency lock?** It is a candidate, **not** a pre-approved lock entry.
  - The Rehearsal 7 kickoff set (echelon-current 1.33.0, DEC-R7-011) pins Forma 0.12.0. Under `docs/REHEARSAL-DEPENDENCY-LOCK.md` DEP-CURRENT-002 to -006, only the owner admits a newer release, through a Registry release set and its verification gates.
  - On the Forma side, the evidence is:
    - the full three-engine browser suite on the release commit (3,690 passed, 0 failed, 72 skipped);
    - the node, F#, layout-probe and token-validation suites;
    - PR CI;
    - `release:check`, which `release-forma.yml` runs before it tags.

    The release workflow's outcome and the published digest are recorded in the PR (kemiller2002/forma#176) and in the work-item handoff, not here.
  - Everything else belongs to the Indy Init process: owner approval of a release set that includes 0.13.0, and the DEP-CURRENT-004 verification.
  - Do not edit the frozen requirements or lock to adopt it.
