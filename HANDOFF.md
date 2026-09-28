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
