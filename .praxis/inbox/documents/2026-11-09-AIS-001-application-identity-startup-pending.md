# Pending Praxis intake: AIS-001 application identity, pre-WASM startup, pending actions and brand-neutrality guard

**Status:** Unprocessed source material. This is **not** a canonical requirement record, work item, approved decision, or proof of implementation.

- Submitted for Praxis ingestion: 2026-11-09
- Target repository: `kemiller2002/forma`
- Source: owner assignment "Echelon Forma: Design System Implementation" (2026-11-09), phases 1-3 and 7, plus the external normative drafts in `kemiller2002/echelon-design-system` at `f2c118d`: EDS-ARCH-THEME-001 (`docs/forma-brand-neutral-architecture.md`), EDS-BRAND-APP-001 (`brand/application-logos.md`), EDS-UX-WAIT-001 (`patterns/waiting-and-progress.md`), EDS-UX-LANDING-001 (`patterns/application-landing-pages.md`)
- Proposed scope identifier: `AIS-001`
- First consumer: `kemiller2002/signal` (no logo, no favicon, no pre-WASM startup content, no landing route at `main` `d84dfe2`)

## Owner decisions recorded with the assignment (2026-11-09)

1. Brand neutrality is **additive in this pass**: ship brand-neutral components and a guard that forbids new Echelon identity in Forma's generic CSS. The framework default palette (oxide-bronze/verdigris) and the in-repository `echelon` brand and marketing theme stay for now; swapping the default is a separate release with a migration.
2. Forma stays zero-runtime (AGENTS.md "Forma component usage"). "Typed F# contracts" are satisfied by Forma's F# tooling (BrandCompiler, TokenValidator), not by an F# UI runtime package.

## Audit baseline (Forma `main` `755df9a`, v0.13.1)

Already present and reused, not duplicated: brand manifests compiled to scoped `data-ef-brand` CSS by `tools/BrandCompiler` (two brands: `echelon`, `example-harbor`), light/dark/forced-colors projection, skins, skeleton, spinner, progress bar, empty state, the fault family, recovery actions, navigation and workspace shells, hero, marketing shell.

Verified gaps:

- no application identity (logo plus application name) presentation contract;
- no pre-WASM startup presentation that renders before any runtime and covers slow, failed and timed-out startup;
- no pending (in-flight) state for buttons and forms;
- no automated guard against Echelon identity or palette literals spreading in Forma's generic CSS. Baseline: the core stylesheets carry hundreds of Echelon-palette `var()` fallbacks (for example `#905831` 26 times).

## Requirements

**AIS-001.1 Application identity.** A brand-neutral `.ef-app-identity` pattern renders an application-supplied mark and name. It accepts light and dark mark variants, renders at 16, 24, 32 and 64 CSS pixels, has a single accessible name, and shows a meaningful text monogram when the mark asset fails to load, without script. Forma ships no organization's mark.

**AIS-001.2 Pre-WASM startup.** A brand-neutral `.ef-startup` pattern is authored in the application's initial HTML and needs only Forma CSS. It shows the application identity, a visible indicator and a meaningful status message (not the word "Loading" alone) in a polite status region. It reveals a "still starting" message after a delay with no script, honours reduced motion with a static but perceivable equivalent, and presents failed and timed-out states (set by the host) with a recovery action. It never shows fabricated progress.

**AIS-001.3 Pending actions.** Buttons and button-styled links with `aria-busy="true"` show an in-place busy indicator, keep their label, and look unavailable; a form with `aria-busy="true"` presents its pending state. Duplicate-submission prevention remains the application's duty and is documented (zero-runtime).

**AIS-001.4 Brand-neutrality guard.** A test fails when Forma's generic stylesheets gain new Echelon identity (names, logo paths) or additional Echelon-palette literals beyond the recorded baseline, and when the new AIS-001 rules contain any hex color literal.

**AIS-001.5 Documentation and evidence.** Catalog entries, browser tests (both shipped brands, light/dark, reduced motion, 320 px), changelog, and a minor release.
