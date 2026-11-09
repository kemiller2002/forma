# Pending Praxis intake: BNR-001 brand-neutral Forma (EDS-ADR-002)

**Status:** Unprocessed source material. This is **not** a canonical requirement record, work item, approved decision, or proof of implementation.

- Submitted for Praxis ingestion: 2026-11-09
- Target repository: `kemiller2002/forma`
- Source: owner decision **EDS-ADR-002** "Echelon brand ownership and logo asset resolution" (`kemiller2002/echelon-design-system`, `docs/adr-002-brand-asset-ownership.md`), and the coordinator's shared interface "Forma 1.0.0", commit 1
- Proposed scope identifier: `BNR-001`
- Baseline: Forma `main` `7372886` (v0.14.0)
- Released with: FORMA-NS-001 as Forma 1.0.0 (one major release, consumers migrate once)
- Supersedes: AIS-001 owner decision 1 ("brand neutrality is additive in this pass"); this is the separate release with a migration it anticipated

## Decision being implemented

EDS-ADR-002: Forma MUST remain brand-neutral and MUST NOT carry an Echelon-branded default theme, Echelon logo asset paths, or other organization-specific identity. Echelon's brand definition and assets move to `echelon-design-system` (package `@echelon-foundry/echelon-theme`). Publisher metadata (the npm scope and homepage) may stay.

## Requirements

**BNR-001.1 No organization identity.** Remove `brands/echelon.brand.json`, `themes/echelon/`, `bundles/echelon-marketing.bundle.json`, `examples/echelon-marketing-site/`, the release assets `dist/brands/echelon.css`, `forma-echelon-marketing.css` and `forma-marketing-theme-echelon.css`, every Echelon-palette CSS fallback, and the `@layer echelon.*` names (renamed `@layer forma.*`). The neutral `forma-marketing.css` keeps working.

**BNR-001.2 Neutral default palette.** The default `:root` light and dark semantic colors become a neutral, accessible Forma palette, built on the neutral families already present. The token source moves to `tokens/forma.tokens.json`. Every contrast, color-contract, pattern-contrast, non-text-contrast and forced-colors check passes in light and dark.

**BNR-001.3 Shipped compilers.** The F# BrandCompiler and TokenCompiler sources and `.fsproj` files ship in the npm package. An external manifest compiled with the packed compiler is byte-identical to Forma's own build.

**BNR-001.4 Unrelated example brands.** At least two: `example-harbor` and one new unrelated organization. A browser test proves third-party isolation: Forma plus an example brand shows no Echelon value in any computed style.

**BNR-001.5 Absolute guard.** Zero Echelon identity, zero Echelon-palette literals and zero `@layer echelon` in source CSS, `dist/` and the `npm pack` tarball, with adversarial fixtures (including a reappearing Echelon brand manifest).

## Ingestion instructions

Process through the documented inbox/work flow. Preserve each numbered requirement. No GitHub Issues are created for this work.
