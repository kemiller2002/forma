# Echelon Design System handoff

## Objective

Bootstrap Echelon Design System as a greenfield Repository Operating System pilot.

## Current state

- ROS 3.1.4 greenfield profile installed on 2026-09-22.
- Project charter is a draft.
- No first vertical slice, evidence record, hypothesis, or experiment has been
  accepted.
- The operating system is under evaluation.

## Validation

Run:

```bash
./ros registry check
./ros validate
```

## Unresolved questions

1. What concrete communication problem and user should the first slice serve?
2. What baseline workflow will be used for comparison?
3. What data, privacy, safety, and accessibility constraints apply?
4. Which outcome would distinguish useful engineering from additional process?

## Next action

Complete `PROJECT-CHARTER.md`, choose the first bounded outcome, and record its
baseline and acceptance criteria in `context/CURRENT-STATE.md`.


## Aegis fault presentation family — 2026-09-23

Objective: provide a complete zero-runtime Forma presentation family for safe Aegis fault output.

Completed on `feature/aegis-fault-presentation`:

- added fault, inline, notification, banner, blocking, summary, recovery-actions, reference, diagnostic-status, and safe-details patterns;
- added shared CSS including mobile, forced-colors, focus, severity/non-color cues, and physics-derived notification/banner/blocking motion;
- documented the strict `Aegis Fault → Presentation.T → Limen/application → Forma` boundary;
- documented recovery capability revalidation and blocking-dialog ownership;
- added generated-site metadata and physics examples;
- added browser accessibility/mobile/reduced-motion tests;
- added requirement, catalog, cross-application, motion, accessibility, declarative-capability, and agent integration documentation.

Validation note: this execution environment has repository write access through the GitHub connector but no networked repository checkout, so local `npm run check`, `npm run site:check`, and `./ros validate` cannot be truthfully claimed. A pull request should be used to run the repository's existing PR validation workflows before merge.

## Terminal / CharacterGrid family — 2026-09-27

Objective: GitHub #37 (#38–#45). A reusable, zero-runtime character-grid
presentation family with IBM 3270 as the first reference profile.

Completed on `claude/terminal-character-grid-ui-zz0q4q` (PR #46), one ROS work
item and commit per issue (`GH-38` … `GH-45`):

- patterns: `character-grid`, `character-grid-field`, `character-grid-keys`,
  `character-grid-status`, `character-grid-reveal`, `character-grid-3270`,
  `character-grid-workflow`;
- CSS in `src/styles/components.css` (registered coordinate properties, a
  generated coordinate block from `tools/character-grid-css.mjs`, profile
  tokens, reveal);
- `tools/character-grid-conformance.mjs` (rules CG-1…CG-16);
- contract `requirements/CHARACTER-GRID.md`, guide
  `docs/CHARACTER-GRID-AUTHORING.md`, catalog entries, agent usage;
- tests: `tests/character-grid.test.mjs` (in the conformance workflow), seven
  `tests/browser/character-grid*.spec.mjs` files, coverage matrix
  `tests/character-grid-coverage.json`.

Validation in the implementing session was Chromium only (Firefox/WebKit
unavailable; CI runs them). Literal `npm run site:check` could not launch its
pinned Chromium revision in that sandbox; the equivalent run with the local
Chromium passed. See PR #46 for exact results.

Open: GAP-TCG-06 (wide glyphs/RTL), GAP-TCG-10 (per-row selection fields),
GAP-TCG-11 (text-spacing overrides vs fixed cells), layout family status is
`supported` until a CI conformance run is recorded as `verified`; user
testing of HY-VE-TCG-2026-9151/-8750 in Visual Engineering.

Next action: confirm cross-engine CI, then record the catalog conformance run
and promote `LAY-TERMINAL-CHARACTER-GRID` to `verified`.

## Terminal / CharacterGrid follow-up — 2026-09-28 (third session)

Objective: implement Visual Engineering DF-VE-TCG-2026-1320 (GAP-TCG-12).
The 3270 status line (OIA) lies outside the application's rows, but the
reference screens drew status on application row 24.

Completed on `claude/terminal-character-grid-ui-kg0kec` under ROS work item
WI-0010:

- Generic `data-ef-status-rows` (1–2). The rows follow `data-ef-rows` in the
  same column tracks and are reserved at full pitch even when status is
  empty, so there is no layout shift. The generator emits
  `--ef-grid-status-rows` and row mappings up to 52.
- Conformance rule CG-18: only `.ef-character-grid__status` may occupy status
  rows, and a grid that declares them keeps its status there. CG-1 validates
  the attribute. CG-3 bounds status runs to `rows + status-rows` and all
  other runs to `rows`. No 3270 logic was added to generic tooling; the
  existing test enforces this.
- The `ibm-3270` profile may rule a muted line over the status row (a
  `box-shadow`, allowed profile property; stylistic).
- `character-grid-3270`, `character-grid-workflow`, and the catalog
  specimen use `data-ef-status-rows="1"` with status on row 25 (33 at
  32 × 80).
- Contract, authoring guide (a status-rows column per terminal style), agent
  usage, component catalog, layout catalog, and coverage matrix updated.

Validation: see the pull request for exact results. .NET 10 came from the
Ubuntu archive (`dotnet-sdk-10.0`), because `builds.dotnet.microsoft.com`
is blocked. Browser tests ran on Chromium 1194 through a scratch config (the
pinned Playwright wants revision 1243). CI runs all three engines.

Open: GAP-TCG-06 (wide glyphs/RTL). The family `verified` promotion waits
on a green cross-engine *Forma conformance* run on main.

Next action: after merge, record the conformance run in
`catalog/layouts.json` and promote `LAY-TERMINAL-CHARACTER-GRID`.

## Echelon marketing presentation system, 2026-09-28 (GH-49)

### Objective

Make Forma the one shared presentation and layout system for all Echelon
marketing sites. The Echelon Foundry site is the visual reference and becomes
a consumer.

### Completed

Completed on `claude/forma-marketing-system-odvybu` under ROS work item
GH-49 (GitHub #49).

- **Analysis.** EV-DESIGN-2026-0014 analyses the reference site (catalog,
  owner classification, 10 defects). EV-DESIGN-2026-0015 traces the work to
  Visual Engineering (VE commit `007cbf0`).
- **Tokens.** Core primitive scales in `tokens/echelon.tokens.json`:
  - font-size (static and fluid), line-height, weight, letter-spacing;
  - size (static and fluid);
  - rem space scale, spacing 9–10;
  - border width, focus, shadow;
  - Echelon palette extensions.

  TokenCompiler changes:
  - new `fluidDimension` and `shadow` types;
  - alpha colors;
  - `--reference` sources;
  - optional extended-role contrast gates;
  - per-source header.
- **Brand-neutral marketing layer** in `src/marketing/`:
  - `roles.css` (the role contract);
  - `foundations.css` (scoped to `.ef-site`, with contrast-safe `data-ef-tone` surfaces);
  - `components.css`;
  - `layouts.css`.

  It is included in `all.css` and `dist/marketing.css`.
- **Patterns.** 14 marketing patterns: `marketing-shell`, `site-header`,
  `hero`, `section-heading`, `card-grid`, `facts`, `entry-index`, `steps`,
  `badge`, `cta`, `code-sample`, `prose`, `site-footer`,
  `documentation-layout`. Each has documentation metadata.
- **Echelon Marketing Theme.** `themes/echelon/marketing.tokens.json` (aliases
  only, validated light and dark) and `themes/echelon/marketing.css`
  (backdrop hook).
- **Layout catalog.** `LAY-MARKETING-PAGE`, `LAY-PRODUCT-PAGE`, and
  `LAY-DOCUMENTATION-PAGE` families with specimens, all `supported`. The
  marketing page was added to the theme×layout matrix.
- **Distribution (ADR-0003):**
  - the F# `tools/PresentationBundler` builds deterministic, self-contained
    `dist/marketing/*` artifacts with a manifest and sha256;
  - the release workflow uploads them as flat release assets;
  - `actions/install-presentation` (bash) installs a pinned `forma.lock`.

  Version bumped to 0.3.0.
- **Local-CSS policy.** The F# `tools/SiteCssPolicy` with composite action
  `actions/check-site-css`, allowing an identity-token allowlist and
  `forma-exception` annotations.
- **Product identity.** The BrandCompiler and schema accept optional extended
  roles (elevated, muted, hover, status), each contrast-gated.
- **Reference fixture.** `examples/echelon-marketing-site` (home, product,
  docs) consumes the installed bundle through the real installer.
- **Documentation:**
  - `requirements/MARKETING-PRESENTATION.md`;
  - `docs/MARKETING-SITES.md` (the ten consumer questions and a minimal site);
  - `docs/marketing/MIGRATION-INVENTORY.md`;
  - `docs/marketing/MIGRATION-CONTRACT.md` (Dokimos first, with its
    requirement revisions);
  - updates to CONSUMING-FORMA, AGENT-USAGE, COMPONENT-CATALOG, and README.
- **Hygiene.** F# `bin/obj` outputs are no longer tracked (gitignored). Stale
  committed binaries could be treated as up to date after a fresh checkout.

### Validation in this session

.NET 10.0.112 came from the Ubuntu archive. Browsers ran on Chromium 1194 via
a local config, because the pinned Playwright expects 1243. CI runs
Chromium, Firefox, and WebKit.

- `npm run build`: passed from a clean F# state.
- Node suites, all passing:
  - tokens: 3
  - brands: 4
  - runtime: 4
  - marketing: 35
  - character-grid: 29
  - package: 2
- Site build test: 14 passed. Site mobile spec: 3 passed.
- Browser suite: 907 passed, 33 failed. Baseline `main`, in a separate
  worktree with the same environment, fails the identical 33 tests: dark,
  forced-colors, and live-operations contrast cases in existing specimens. No
  new failures. All 27 marketing browser tests pass, including axe WCAG 2.2
  A/AA in light, dark, desktop, and phone.
- `npx @echelon-foundry/visual-engineering verify` was not run. Executing the
  external package was not permitted in this session (GAP-MKT-13).

### Open

GAP-MKT-01 is partially closed. GAP-MKT-02 to GAP-MKT-14 remain open (see the
requirement). Layout families stay `supported` until a green cross-engine CI
conformance run is recorded. Three new palette values are flagged for brand
review in `themes/echelon/manifest.md`.

### Next action

1. After merge and the v0.3.0 release, migrate Dokimos under
   `docs/marketing/MIGRATION-CONTRACT.md`.
2. Migrate the Echelon Foundry main site.
3. Open a Forma work item for making the Forma documentation site its own
   consumer.

## Component catalog site, 2026-09-30 (WI-0011, PR #87)

Objective: make the documentation site a complete, standardized reference for
every public Forma component (purpose, examples, mobile, HTML, API, states,
accessibility, responsive, motion, guidance, related) with coverage enforced
in CI.

Work completed:

- Catalog pipeline (ADR-0005): `patterns/<slug>.html` + `catalog/components/<slug>.mjs`
  + CSS hooks derived from `dist/all.css` (`tools/catalog/`) generate every
  page, 18 category pages, the A–Z index, a mobile reference, an accessibility
  statement, five compositions and `site-manifest.json`. `tools/component-meta.mjs`
  and `tools/site-examples.mjs` were removed.
- 165 components documented (151 existing patterns + 14 new canonical patterns
  for styled primitives that had no page); 710 live examples; every component
  has ≥2 scenario examples + a mobile example rendered in a real narrow viewport.
- Enforcement: `npm run catalog:check` (validator + generated inventory check),
  `tests/catalog-coverage.test.mjs`, `tests/site-browser/catalog.spec.mjs`
  (overflow at 320–1280px, landscape, 200% zoom and text, mobile frames,
  navigation, switcher, filter, focus, two-pass axe with an explicit baseline).
- `docs/COMPONENT-INVENTORY.md` (generated), `catalog/planned.json` (29 required
  but unimplemented), `catalog/known-issues.json` (component defects found while
  documenting), `docs/CATALOG-AUTHORING.md`, AGENTS.md rule 9.

Decisions and constraints: the site stays zero-runtime (copy = select-all +
raw `.txt`; filters/switchers are CSS `:has()` on Forma segmented controls);
site.css rules are scoped away from live examples because its cascade layer
outranks Forma; page-level patterns (containing `<main>`) render their Basic
example in a frame.

Validation run: catalog check, coverage/site-build node tests (28), Figma,
runtime, CSS, package, character-grid, motion and marketing node tests,
pattern mobile/accessibility/marketing browser specs (Chromium), full
`tests/site-browser` suite (Chromium). Firefox/WebKit were not run locally.

Follow-ups: WI-0012 token contrast on secondary surfaces; WI-0013 known
component defects; WI-0014 P0 planned components; WI-0015 docs-site script
decision (clipboard/search); WI-0016 settings-row primitive candidate.

## Portable workflow standard, 2026-10-01 (FORMA-GH-93, FORMA-GH-94)

**Objective.** Implement `requirements/PORTABLE-WORKFLOW-INTERCHANGE.md`. Forma
owns the `.forma-workflow.json` standard, independent validation, layout, HTML
rendering and the embeddable renderer and editor.

**Completed** on `claude/forma-workflow-interchange-wo5aq3` (PR #95):

- **Schema.** `schemas/workflow/1.0/forma-workflow.schema.json`, plus
  `contracts/workflow-capabilities.json`.
- **`src/workflow/Forma.Workflow` (F#, no package dependencies).**
  - JSON layer and a schema validator over the published file.
  - Model and lossless codec.
  - Validation with the six compatibility classes.
  - Deterministic layout using nested bands.
  - Static HTML fragment and document rendering.
  - Editor core and `Embed`/`EmbedView`/`EmbedProtocol` (`forma-workflow-host/1`).
- **CLI:** `src/workflow/Forma.Workflow.Cli` (`forma-workflow`).
- **`packages/workflow`** (`@echelon-foundry/forma-workflow`): the
  `<forma-workflow>` element, editor CSS, an iframe bridge, and the trimmed
  .NET WebAssembly engine (`npm run workflow:build`).
- **Diagram contract 2.1.0:** ports, status cues, descriptions and membership.
- **Foundation fixes:** `.ef-actions` is now styled in the application layer,
  and field descriptions have AA contrast on surfaces.
- **Examples:**
  - `examples/workflows`: 19 fixtures and golden exports;
  - `examples/workflow-embedding`: a host application outside Studio;
  - `examples/external-producer`.
- **Docs:** `docs/workflow/*` and ADR-0006. The package version is 0.4.0.
- **CI:** `.github/workflows/workflow-validation.yml`; the publish job publishes
  the workflow package.

**Validation (local, Chromium 1194).**

- `npm run workflow:test`: 58 passed.
- Package, external, CSS, runtime, contract, marketing and token suites: pass.
- Workflow static and embed browser specs: 25 passed.
- Existing diagram, accessibility and mobile specs: pass.
- Site check: pass when run without concurrent Playwright sessions. Concurrent
  runs produced artifact ENOENT and contrast-timing failures that did not
  reproduce alone.
- Firefox and WebKit were not available locally; CI runs them.

**Next action.** Confirm cross-engine CI on PR #95, then merge. After the npm
publish, forma-studio#17 replaces its vendored copy with the released artifacts.

## Contrast pairing and built-CSS guard, 2026-10-06 (FORMA-A11Y-002)

**Objective.** Fix two defects reported while Vigila upgraded to Forma 0.3.0,
and add checks that stop both classes of defect recurring.

**Root causes.**

- *Contrast.* The token compilers validate `text-secondary`, `text-muted` and
  the accent roles against `surface-primary` only. Twenty-one rules paint
  `surface-secondary` (for example `.ef-fault--inline`, assistant turns, file
  drop zones, master-detail current row, evidence-age rows) while their
  paragraphs and hints keep `text-secondary` from `:where(p)` and links keep
  `accent-primary`. Graphite `#686d68` on stone `#e3e0d7` is 4.0:1. Accent on
  the secondary surface is 3.8 to 4.4:1 in light, dark, paper-ink and
  warm-earth. Separately, in forced colors Chromium paints text with
  `-webkit-text-fill-color`, which keeps the author colour. The ibm-3270
  character-grid profile uses literal palette colours that the forced-colors
  token projection does not reach, so its text was 1.1 to 2.4:1 on a forced
  white Canvas.
- *Build.* Commit 9fd29f0 wrote a literal `\n` into
  `src/styles/foundations.css`. `tools/build-assets.mjs` copies that file
  verbatim, and Forma 0.3.0 shipped it. The selector became
  `n .ef-surface :where(...)`. aeb4f17 fixed the source before 0.4.0 and added
  a source-only check. No check covered the built output.

**Fixes.**

- Every rule that paints the secondary surface (21 rules across
  foundations, components and assessment) now rebinds `--ef-color-text-secondary`
  and `--ef-color-text-muted` to `text-on-secondary-surface`. It also sets
  `--ef-surface-accent-text-color` to `text-primary`. Links and the three
  accent-coloured text rules read that hook. This is the same pattern as the
  marketing `[data-ef-tone="surface"]`.
- Character-grid profile tokens project to Canvas, CanvasText or Highlight
  under `forced-colors: active`.

**New checks.**

- `tests/browser/pattern-contrast.spec.mjs` runs axe color-contrast on every
  pattern plus three surface compositions. It covers all 18 token themes, OS dark, each
  brand in light and dark, and forced colors. Against main it fails 12 of 27
  contexts.
- `tests/contrast-pairs.test.mjs` checks the pairing lint, accent-text routing
  and the documented token pairs across every compiled theme and brand. Against main the pairing
  tests fail.
- `tests/dist-css.test.mjs` checks every `dist/**/*.css` file for stray
  escapes, unbalanced blocks, nonexistent element selectors, and selectors
  that match their sources. It passes on main, because the source was already
  fixed. It fails on a v0.3.0 build (run with `FORMA_DIST_ROOT=<worktree>`).
- `test:css` now runs in the PR workflow (`design-system-pilot-validation.yml`).
- 17 `color-contrast` entries in `tests/site-browser/axe-baseline.json` and the
  matching `catalog/known-issues.json` entry no longer reproduce, so they were
  removed.

**Next action.** Merge the release PR (0.4.1) only when ready to release.
Merging it triggers `release-forma.yml`, which creates the `v0.4.1` tag and
GitHub release with the tarball, and `publish.yml`, which publishes to npm.
