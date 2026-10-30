# Layout reliability baseline (LRP-001)

Recorded 2026-10-30 before any LRP-001 change, for work item `WI-0042`
(`.praxis/inbox/documents/2026-10-30-LRP-001-layout-reliability.md`).
Every number below was produced in this session. Nothing is estimated.

## Identity

| Item | Value |
|---|---|
| Baseline commit | `8f34a329791e4acad9376b5f95acfca831b8a2aa` (`main`, merge of #175) |
| Package | `@echelon-foundry/design-system` **0.12.0** |
| Latest approved release | `v0.12.0`, published 2026-10-29 (GitHub release and npm) |
| Companion packages | `@echelon-foundry/forma-workflow` 1.2.0, `@echelon-foundry/forma-conformance` 0.2.0 |
| Toolchain | .NET SDK 10.0.403, Node 22.22.0, Playwright 1.63.0 |

## Architecture as found

- **Zero component runtime.** Forma is semantic HTML plus CSS. `dist/runtime.js` (3,030 bytes) is a version diagnostic only.
- **CSS organisation.** CSS lives in cascade layers:
  - `echelon.tokens` is generated from `tokens/echelon.tokens.json` by the F# `tools/TokenCompiler`.
  - `echelon.foundations` is `src/styles/foundations.css`: element defaults, composition primitives and typography roles.
  - The component layers come from `src/styles/components.css` and `assessment.css`.
  - The marketing layer is `src/marketing/*`.
  - `echelon.brand` is generated from `brands/*.brand.json` by `tools/BrandCompiler`.
  - Skins (`src/styles/skins.css`) are unlayered.
  - `dist/all.css` concatenates them.
- **Tokens.**
  - The source is DTCG JSON: `primitive.*` and `semantic.<theme>.*`, with `light` and `dark` themes. Names are `--ef-<path>`, and semantic names drop `semantic.<theme>`.
  - The compiler rejects unknown aliases, alias cycles and theme mismatches, but it stops at the first error.
  - `contracts/color-contract.json` and the JS `forma-color` CLI validate `--ef-color-*` references and reserved internal prefixes.
- **Themes.** Themes are switched with `data-ef-theme`. Brands use `data-ef-brand` and skins use `data-ef-skin`. Type roles (0.11.0) use `data-ef-type`.
- **Layout primitives.**
  - Foundations: `.ef-stack`, `.ef-cluster`, `.ef-actions`, `.ef-grid`, `.ef-rail`, `.ef-responsive-grid`, `.ef-mosaic`, `.ef-priority-stack`, `.ef-focus-stage`, `.ef-bounded-overflow`.
  - Components: `.ef-sidebar`, `.ef-switcher`, `.ef-split-pane`, `.ef-frame`, `.ef-measure`, `.ef-form-row`, `.ef-field`.
- **Browser tests.** Playwright runs Chromium, Firefox and WebKit (`playwright.config.mjs`, 58 specs in `tests/browser`), plus the site suites. The F# layout probe (`tests/layout`, LCE-001) runs offline from CI.
- **Release procedure.**
  - Merging a new `package.json` version to `main` runs `release-forma.yml`. That workflow runs `npm run release:check`, packs and verifies the tarball, exercises it as a consumer, and creates the immutable `vX.Y.Z` GitHub release. It publishes to npm only when `NPM_PUBLISH_ENABLED` is set.
  - `publish.yml` publishes the npm packages.
  - A release-path change merged without a version bump fails the immutable-tag guard.
  - `tests/package-contract.test.mjs` requires the newest `CHANGELOG.md` heading to equal the package version and to not be marked unreleased.

## Baseline test results

| Suite | Result |
|---|---|
| `npm run build` | pass (≈20 s) |
| `test:tokens` | 4/4 |
| `test:brands` | 4/4 |
| `test:runtime` | 4/4 |
| `test:design` | 7/7 |
| `test:color` | 7/7 |
| `test:motion` | 38/38 |
| `test:marketing` | 36/36 |
| `test:character-grid` | 29/29 |
| `test:figma` | 3/3 |
| `test:css` | 48/48 |
| `test:package` | 10/10 |
| `icons:check` | 13/13 |
| `workflow:test` (F#) | 88/88 |
| `test:workflow-package` | 4/4 after `workflow:build`. Run before the build it fails 2/4: an ordering artefact, not a defect. |
| Browser, Chromium (`playwright test --project=chromium`) | 1,213 tests, 7.7 min. 1,208 passed on the first run. The other 5 failed with `ENOENT` on trace files because a concurrent Playwright run in the same checkout deleted `test-results/`. All 5 passed when re-run alone. **Effective baseline: 1,213/1,213.** |
| Browser, Firefox and WebKit | Not installed in the container at baseline. They were installed later (`playwright install firefox webkit`, `install-deps`) for the after-patch run. CI runs all three. |

## Known layout defects

The defects carried in `catalog/known-issues.json` that bear on layout:

- `status-lozenge` and `entry-index` use `nowrap`, which can overflow at 320px.
- Popover, menu and tooltip have no anchor-positioning fallback.
- `data-grid` hides `thead` at 30rem.
- Toast stacking.
- Stack spacing is doubled.
- `.ef-breakout` does not break out.

The Indy Init rehearsal records add three more: unbounded pills (fixed in 0.10.0), the marketing h1 scale in applications (fixed in 0.11.0), and `.ef-alert` stacking on the viewport instead of its container (still open).

## Defects measured at baseline with the LRP-001 fixtures

`tests/browser/layout-reliability.spec.mjs` runs the fixtures in `tests/browser/fixture/layout-reliability.html`. It was run against the **unpatched** `dist/all.css` in all three engines: **30 of 78 checks passed and 48 failed.** The failures fall into these classes:

| # | Failure class | Observation (unpatched) | Root cause |
|---|---|---|---|
| D1 | Long unbroken text escapes cards and panels | A URL in a `span` crossed an `.ef-surface` card by 294.6px at 320px. A trace ID in nested grid cards crossed by up to 394px. Long `li` text in a dialog's validation summary crossed by 175px. A field description in a narrow form crossed by 234px. An `em` in a rounded brand panel crossed by 10px. | `overflow-wrap: anywhere` is set on `p`, `dd`, `td` and headings but not on `span`, `strong`, `em`, `div` or `li` text. No Forma container passes it down, so the min-content width is the whole token. |
| D2 | Flex items refuse to shrink | In an `.ef-cluster` or `.ef-actions` row, a long label item crossed its surface by 168–716px. | A flex item's automatic minimum is its min-content width, and nothing caps it at the row. |
| D3 | Large SVG distorts | A 1200×400 `<svg viewBox>` at 320px rendered 316×400 (ratio 2.53 instead of 0.33). | `max-inline-size: 100%` narrows the width while the height attribute is kept. |
| D4 | Horizontal page scrolling | Chromium and Firefox showed page overflow at 320, 375 and 768px from D1 and D2. WebKit showed page overflow from 620px up to 1,849px, including when D1 and D2 were absent. | D1 and D2. In WebKit there is a second cause: a `select` with a long option inside the subgridded `.ef-form-row > .ef-field` adds the option's width as scrollable overflow. Safari is Indy Init's primary target. |
| D5 | Focus indicator missing | Tab onto the calendar button of `input[type=datetime-local]` (Chromium) painted **no** indicator; screenshot evidence was taken during the investigation. | Focus inside the control's shadow parts leaves the host `:focus-within` only, so `:focus-visible` never matches. |
| D6 | Focus ring below the fold after Tab | At 375px with 200% text, Chromium scrolled a focused button exactly into view and its 5px ring stayed below the viewport. | Focus scrolling brings only the border box into view. |

Rounded-panel escapes (D1 in a rounded panel) have the same cause as D1: an oversized child. The cause was not missing clipping, padding, positioning or stacking. Forma's application layer sets no radius on `.ef-surface`. The LCE-001 radius-by-padding cap already covers the marketing card, badge and button.

## Not reproduced at baseline

- The dropdown fixture: an `.ef-menu` popover at the viewport edge stayed on screen in all three engines.
- Icon sizing.
- The intentional scroller.
- Containment under themes and skins once D1 and D2 were excluded.
- axe WCAG A/AA on the fixtures.
