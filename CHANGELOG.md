# Changelog

Forma follows semantic versioning for its public HTML, class, and token
contracts (`requirements/QUALITY-AND-DISTRIBUTION.md`, QD-004). Releases are
published as GitHub release tarballs
(`https://github.com/kemiller2002/forma/releases/download/vX.Y.Z/echelon-foundry-design-system-X.Y.Z.tgz`)
and to npm. Earlier releases are described in `docs/CONSUMING-FORMA.md` and
`HANDOFF.md`.

## 0.12.0

Minor release: diagram non-text contrast and status tokens.

**Behaviour change: workflow validation is stricter.** Diagram non-text contrast (R7-REM-009, `.praxis/inbox/documents/2026-10-29-R7-REM-009-diagram-nontext-contrast.md`).
Documents that validated before can now fail with `A11Y-NONTEXT-CONTRAST`, and `forma-workflow render` refuses them (exit 1). The status tokens are additive.

### Migration
- Prefer Forma tokens for outlines and connectors: `token:status-*` or `token:border-functional` follow the theme and are not judged by the document rule.
- If the host pins a theme, pass it: `--theme light|dark` on `validate` and `render`, or `ValidationOptions.Theme` with `Validation.loadWith`. Default-surface contrast is then judged for that theme only.
- Otherwise adjust literal colours to reach 3:1 against the light (`#f2efe7`) and dark (`#171a18`) surfaces, or against the node's literal fill.

### Added
- **Status colour tokens in the workflow vocabulary.** `token:status-warning`, `token:status-danger`, `token:status-success` and `token:status-info` are accepted wherever a workflow colour is (`fill`, `stroke`, `accent`, `foreground`, edge `stroke`, palette slots) and render to `var(--ef-color-status-*)`. The workflow schema enum and `contracts/diagram-presentation.json` list them. An application can draw an attention outline with a Forma token instead of a brand literal.
- **Validation rule `A11Y-NONTEXT-CONTRAST`** (error, accessibility; WCAG 1.4.11, 3:1). Literal (or literal-palette) colours on nodes, groups, legend swatches and edges. Without an authored fill, strokes, accents, legend swatches and edge strokes are judged against both default surfaces, light `#f2efe7` and dark `#171a18`, and the weaker theme is named; a pinned host theme (`--theme`, `ValidationOptions`) limits this to that theme's surface. With a literal fill, the accent must reach 3:1 against the fill; the stroke is reported only when it is below 3:1 against the fill and neither stroke nor fill reaches 3:1 against a default surface, so borderless filled shapes stay valid. Token values and token/literal mixes are not judged by the document rule; `tests/nontext-contrast.test.mjs` checks every status token and `border-functional` at 3:1 on surface-primary and surface-secondary in every shipped theme and brand. Rehearsal 6 regression: Causa's `#e9a23b` outline on `#f5f3ed` measured 1.95:1 and passed validation. See `docs/workflow/VALIDATION.md`, "Non-text contrast".
- **Contract.** `contracts/diagram-presentation.json` marks `fill`, `stroke`, `accent` and `connectorStroke` `"contrast": "consumer"` (as `foreground` already was): colours set through the CSS custom properties bypass document validation and must be measured by the application.
- **Browser regression.** `tests/browser/diagram-nontext-contrast.spec.mjs` measures real Forma.Workflow output (golden documents in `tests/fixtures/workflow-nontext/`, checked by the F# suite) in Chromium: status-token outlines, a diamond node and an edge reach 3:1 in light, dark and forced colours; the Rehearsal 6 document is reported by the validator and measures below 3:1.

### Changed
- **Validation is stricter** (see Migration above).
- **`Validation.loadWith` / `ofJsonWith` / `semanticWith`** take `ValidationOptions` (`{ Theme }`); `load`, `ofJson` and `semantic` keep their behaviour with no pinned theme. The CLI's `validate` accepts `--theme`, and `render --theme` now also scopes validation.
- `examples/workflows/forma/workflows/colored.forma-workflow.json`: connector `c2` stroke `#2f5fb3` → `#3d6cc0`. The old value is 2.85:1 on the dark surface and is now an `A11Y-NONTEXT-CONTRAST` error. Existing documents with literal colours may newly fail this rule.


## 0.11.0

Minor release: typography roles (EII-F, `.praxis/inbox/documents/2026-10-28-EII-F-typography-roles.md`).

### Added
- **Typography roles.** `data-ef-type="application"`, `"dense"` and `"accessible"` select fixed heading and body steps from existing tokens: application h1/h2/h3 2xl/xl/lg with no ch caps; dense one step smaller with snug leading; accessible one step larger with relaxed leading. Marketing stays the default. Roles work in the `.ef-site` shell and on the application layer alone. See `docs/CONSUMING-FORMA.md`, "Typography roles".
- **Role tokens `--ef-type-measure-h1` / `--ef-type-measure-h2`.** They carry the existing 14ch/18ch marketing heading measures so a role can lift them.
- **`@echelon-foundry/forma-conformance`: rendered corner check.** `evaluateCornerContainment`, `resolveCornerRadius`, `measureCornerContainment` and `expectTextInsideCorners` port the layout probe's `boundary.corner` (LCE-001) to consumers. Released with the package's next version.
- **Browser regressions.** `tests/browser/type-roles.spec.mjs` (R5 heading scale, role steps, containment, overlap, clipping, focus, keyboard, 320-1280px, 200% text) and `tests/browser/corner-containment.spec.mjs` (LCE-001 padding cap under pill and 50% brand radii).

### Fixed (opt-in)
- An application screen on the `.ef-site` shell no longer has to inherit the marketing display scale (h1 up to 7.25rem at 14ch), which the R5 rehearsal overrode locally.
- On the application layer, wrapped h1/h2 lines under a role use snug leading; with the core 1.02 line-height their glyph boxes overlapped at 200% text.


## 0.10.0

Minor release: layout constraint enforcement (LCE-001, `experiments/LCE-001/REPORT.md`). `@echelon-foundry/forma-workflow` 1.1.0 ships the matching engine.

### Fixed
- **Pill diagram nodes.** The curve no longer cuts multi-line text. The corner radius is bounded by the node padding, so a short pill stays a stadium.
- **Ellipse diagram nodes.** Padding is the inscribed bound (14.65% plus clearance).
- **Diamond diagram nodes.** Padding is now 25% plus clearance; at 20%, the content corners fell outside the diamond.
- **Marketing card, badge and button.** A brand `--ef-shape-radius` is capped by each component's padding, so a pill or 50% brand radius cannot cut multi-line content.
- **Marketing button and badge.** They use `overflow-wrap: anywhere`, so a word wider than the row breaks instead of overflowing.
- **Diagrams inside `.ef-site`.** They keep their own type metrics: `.ef-diagram` pins its type context, and `revert-layer` stops site prose defaults at the diagram.
- **Wizard step indicators.** They widen into a pill for multi-digit text instead of overflowing the circle.
- **Connector labels.** They wrap at 12rem.

### Changed
- **Node sizing in `Forma.Workflow`.** Sizing is shape-aware and uses a script-aware text estimate (`LayoutText`) that reserves WCAG 1.4.12 text-spacing room. Nodes can be taller than before.
- **Rank gaps.** They fit the widest connector label.
- **Connector routing.** Connectors avoid unrelated nodes.
- **Label placement.** Labels are placed without collisions.
- **Diagram geometry.** It is emitted in rem (1rem = 16 canvas units), so it scales with enlarged text. The exported example documents were regenerated.

### Added
- **`Forma.Workflow.LayoutGeometry`.** Shape geometry: CSS radius normalisation, inner borders, curved and rotated boundaries.
- **`Forma.Workflow.LayoutCheck`.** Static layout validation: authored sizes too small for their content, node overlap, connectors through nodes, and label collisions.
- **`tests/layout` and `npm run test:layout`.** An adversarial F# layout probe with browser measurement, plus 50 regression fixtures, including the three Causa historical diagrams.

## 0.9.1

Patch release: deterministic browser runtime version diagnostics.

### Added
- The `@echelon-foundry/design-system/runtime` entry point, generated from the package version, registers Forma 0.9.1 in `window.__ECHELON_RUNTIME__` and emits one compact console diagnostic.
- Cross-browser Playwright coverage for actual build metadata, independent load order, duplicate initialization, conflict diagnostics, and the combined Echelon registry.

Component HTML and CSS remain behavior-free. The diagnostic does not inspect or modify the DOM and adds no production dependency.

## 0.9.0

Minor release: public semantic color contracts and rendered state validation.

### Added
- A generated `forma.color-contract/1.0.0` manifest for every shipped theme and brand, with public/internal separation, source provenance, semantic pairings, forced-colors behavior and explicit application-extension boundaries.
- The zero-dependency `forma-color` CLI and `color-contract` Node API, which refuse unknown `--ef-color-*` references and reserved internal color variables with source locations and supported-role suggestions while ignoring application-owned variables.
- Public success, warning, danger and information tokens across all core themes and shipped brands, plus rendered light/dark/forced-colors and non-hue state evidence.

### Changed
- Status lozenges use the public status foregrounds while retaining explicit text, glyph and border cues.
- Brand status overrides remain optional for schema 1.0 compatibility and inherit from the active core theme when absent.

The contract documents Summa's four unsupported spellings and their supported replacements. A valid token and passing contrast establish compatibility, not product-palette appropriateness or semantic comprehension.

## 0.8.0

Minor release: Design by Construction forms and fully operable form examples.

### Added
- A versioned `forma.design/1.0.0` JSON contract, capability declaration, validator, deterministic HTML renderer, valid NASA fixture and refusal fixtures for unsupported versions, presentation overrides, invalid nesting, misalignment and unbound actions.
- A complete form catalog page with functional basic, advanced, validation and mobile examples built from native custom-element HTML.
- Package exports for the design schema, capabilities and examples, while preserving hand-authored HTML and audited extended/custom escape paths.

### Fixed
- Forms now have a bounded responsive root, aligned grid-field tracks, stable validation-message placement and visible fragment-targeted success feedback.
- Native controls and buttons have explicit disabled, read-only and invalid presentation without relying on colour alone.
- Catalog reset examples are outcome-tested by preparing and observing a native field value; submit examples remain URL-outcome tested.

No existing component, class, token or icon was renamed or removed. Forma remains zero-runtime HTML and CSS; design validation and rendering are build-time tools.

## 0.7.0

Minor release: shared layout and interaction conformance with
`visual-engineering/UI-LAYOUT-INTERACTION@1.0.0` (forma#156).

### Added
- **Form row** (`.ef-form-row`, `patterns/form-row.html`). Peer fields share label, description, control and validation-message subgrid rows, so controls keep one top edge whatever their labels, help or errors say (ULI-L01, L13). Fields wrap by available width with no breakpoints.
- Catalog interaction declarations: every example that renders an enabled action is a declared **live demo** with outcome-tested native actions, or a labelled, inert **static specimen**. The documentation site shows the label, and `npm run catalog:check` enforces the declarations.
- `npm run ui:conformance` runs the conformance evidence suites (Chromium).
- `@echelon-foundry/forma-conformance` 0.1.0, a separate dev-only package of Playwright helpers. The design-system package does not include or depend on it.

### Fixed
- Single-line text, date, time, number and select controls share one em-based intrinsic height. In Chromium they previously measured 49.97, 51.97 and 46.38 px (ULI-L02).
- At 320 and 390 px with 200% text, these no longer overflow (ULI-L05):
  - the data grid's stacked label column;
  - status lozenges;
  - the record header;
  - best-worst options with long words;
  - key-value lists, metric cards and the mobile action bar;
  - the command palette, conversation, diagnostic status, provenance trail, readiness checklist, security blockers, wizard steps and semantic differential;
  - the collection toolbar filters, disclosure and code figure captions.
- A collapsed resizable split pane now stacks on narrow screens instead of keeping three columns and squeezing the secondary pane.
- The record-header status is centred on the title row rather than on the type label and title together (ULI-L07).
- Action labels no longer split mid-word inside table cells or link buttons, and an action row can no longer push past its container.
- The marketing layer keeps index links on one line while they fit, gives steps and toned sections readable line lengths at large text sizes, and caps link buttons at their row width.
- `fieldset` no longer keeps a min-content width, and a stretched `.ef-field` keeps its control under its label.

No class, token or icon was renamed or removed. Visual changes appear only where the previous geometry overflowed, staggered or mismatched.

## 0.6.1

Patch release: responsive navigation and native date/time field containment.
- Site navigation labels no longer break mid-word or overlap the header at tablet sizes, mobile widths, or larger text scales. Navigation reflows into its own bounded, keyboard-accessible horizontal scroll region.
- Shared native date, time, and datetime-local fields constrain their intrinsic width within grid columns, including Safari, without replacing the browser picker.
- Documentation example previews and code snippets scroll within their own containers instead of widening the page.
- Documentation navigation now highlights only the current section, with `aria-current="page"` on section index pages and `aria-current="location"` on descendants; the Agent use link is not a permanently highlighted call-to-action.
- Adds generated-page and WebKit responsive tests at eight widths, including the reported date-time-field examples and enlarged text.

No public icon identifiers, assets, or component semantics were renamed.

## 0.6.0

Additive icon-library expansion: **80 icons in total**, up from 40, with no changes to existing icon identifiers or their geometry.

### Added
- Email and collaboration: `email`, `email-open`, `inbox`, `send`, `reply`, `reply-all`, `forward`, `attachment`, `message`, `chat`, `phone`, `video-call`.
- Common actions: `archive`, `bookmark`, `link`, `unlink`, `share`, `star`, `eye`, `eye-off`, `minus`, `more-vertical`, `maximize`, `minimize`.
- Documents and media: `file-text`, `image`, `camera`, `video`, `microphone`, `clipboard`.
- Navigation and places: `chevron-left`, `chevron-right`, `map-pin`, `globe`, `compass`.
- Status and assistance: `info`, `error`, `help-circle`, `pending`, `wifi-off`.

Each new icon includes a canonical source geometry definition, search metadata, standalone and inert inline SVG build outputs, dedicated usage guidance, accessible action examples, and a generated individual documentation page. Icons remain static, offline, brand-neutral, `currentColor`-based, and safe for print.

### Validation
- Extended source-contract tests protect the previous 40 IDs, new icon names, distinct messaging glyphs and safe geometry.
- Expanded browser coverage checks labelled native message controls at 320px and static embedding of the complete registry.
- Source/documentation parity remains mandatory for every icon.

Consumer migration is opt-in. Apps pinned to 0.5.0 will not automatically acquire the new artwork. Publish 0.6.0 only after Praxis, package, site, accessibility and browser CI pass.

## 0.5.0

Additive minor release: Forma's static icon system. Forma core remains
zero-runtime; no existing HTML class or token contract was renamed, so no
consumer migration is required.

### Added

- **`ef-icon` catalog pattern** (`patterns/icon.html`): decorative inline SVG
  inside a natively named control. The SVG is `aria-hidden` and never names,
  operates or signals state on its own.
- **40 original, brand-neutral outline icons** in `icons/registry.json`
  (24-unit grid, 1.8 stroke, round caps and joins), validated by
  `schemas/icon-registry.schema.json` and compiled at build time by
  `tools/icons/build.mjs`. Third-party geometry, scripts, external `href`s and
  embedded media are rejected.
- **Package assets** under `@echelon-foundry/design-system/icons/*`:
  `icons/<name>.svg`, decorative `icons/html/<name>.html` snippets, and
  `icons/registry.json`. The compiled registry records `formaVersion` (the
  producing release) and each icon's `svgSha256`, so consumers can pin and
  verify bundled release geometry offline.
- **Generated icon gallery** at `/icons/` on the documentation site.
- Tests for deterministic compilation, offline/static output, SVG security,
  accessibility, forced colors, and 320px layout.

Studio and Folio pin 0.5.0 only after this version is published and their own
end-to-end verification passes.

## 0.4.1

Patch release. There are no markup, class, or token-name changes, so no
consumer migration is required.

### Fixed

- **WCAG AA contrast on the secondary surface (FORMA-A11Y-002).** Body,
  severity, reference, hint, and link text inside components that paint
  `--ef-color-surface-secondary` now meets 4.5:1 in every theme and brand.
  Affected components include `.ef-fault--inline`, `.ef-surface`, assistant
  conversation turns, file drop zones, master-detail rows, evidence-age rows,
  and checked choices. Previously, text inside them used `text-secondary` or
  an accent role. For example, inline-fault text was `#686d68` on `#e3e0d7`,
  4.0:1. Every rule that paints the secondary surface now rebinds secondary
  and muted text to `text-on-secondary-surface`, and links and accent labels
  to `text-primary`, through the new `--ef-surface-accent-text-color` hook.
  Consumer workarounds such as `.operational-fault p { color: inherit }` can
  be removed.
- **Forced colors.** In Chromium, ibm-3270 character-grid text was painted in
  the profile palette on the forced white Canvas, at 1.1 to 2.4:1. Profile
  tokens now resolve to system colors under `forced-colors: active`.
- **Built CSS.** Forma 0.3.0 shipped a literal `\n` before
  `.ef-surface :where(h1, …, p)` in `foundations.css` and `all.css`, so that
  rule never applied. The source was corrected in 0.4.0. 0.4.1 adds a check of
  the built output that would have caught it.

### Added checks

- `tests/browser/pattern-contrast.spec.mjs` runs axe color-contrast over every
  documented pattern, in every theme, every brand (light and dark), and forced
  colors.
- `tests/contrast-pairs.test.mjs` checks documented token pairs and
  secondary-surface pairing for every compiled theme and brand.
- `tests/dist-css.test.mjs` parses every built stylesheet and fails on stray
  escape sequences, unbalanced blocks, selectors that name nonexistent
  elements, and composed outputs whose selectors differ from their sources.
