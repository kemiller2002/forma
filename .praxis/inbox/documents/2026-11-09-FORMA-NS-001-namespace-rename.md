# Pending Praxis intake: FORMA-NS-001 rename the `ef-` namespace to `forma-`

**Status:** Unprocessed source material. This is **not** a canonical requirement record, work item, approved decision, or proof of implementation.

- Submitted for Praxis ingestion: 2026-11-09
- Target repository: `kemiller2002/forma`
- Source: owner decision 2026-11-09 09:24 local, "Do the major break", and the coordinator's shared interface "Forma 1.0.0", commit 2
- Proposed scope identifier: `FORMA-NS-001`
- Released with: BNR-001 as Forma 1.0.0 (QD-004: a breaking change is a major version)

## Requirements

**FORMA-NS-001.1 Rename.** `.ef-*` becomes `.forma-*`, `--ef-*` becomes `--forma-*`, `data-ef-*` becomes `data-forma-*`, `<ef-*>` becomes `<forma-*>` and `ef-component-tag` becomes `forma-component-tag`, across CSS, patterns, catalog, site, tests, contracts, schemas, Figma contracts, Forma.Workflow (including its F# emitters), `packages/conformance`, tools and docs.

**FORMA-NS-001.2 Codemod.** A shipped F# tool `tools/NamespaceMigrator` (functional style, no package references) with `--check` (report only, exit 3 when anything would change), `--dry-run` and write modes over HTML, CSS, JS/MJS, F#, JSON and Markdown. It matches namespace tokens only (`ef-` class, attribute, tag and custom-property forms at a proper boundary) and leaves `ref-`, `chef-`, `--ref-`, `beef-` and similar words alone. Unit tests and adversarial fixtures.

**FORMA-NS-001.3 Tool outputs.** TokenValidator treats `--forma-*` as valid and reports `--ef-*`. BrandCompiler emits `[data-forma-brand="<id>"]`, `[data-forma-theme=...]` and `--forma-*`. The brand-manifest schema 1.0 data fields are unchanged.

**FORMA-NS-001.4 Guard.** A test fails on any remaining `ef-` namespace token in source CSS, `dist/` and the packed tarball.

**FORMA-NS-001.5 Release.** Version 1.0.0; the CHANGELOG lists every breaking change; `docs/CONSUMING-FORMA.md` has a migration guide (codemod `--check` then write; add `@echelon-foundry/echelon-theme`, load its `dist/echelon.css` after Forma, set `data-forma-brand="echelon"`; marketing sites use `forma-marketing.css` plus the theme's `dist/echelon-marketing.css`).

## Ingestion instructions

Process through the documented inbox/work flow. Preserve each numbered requirement. No GitHub Issues are created for this work.
