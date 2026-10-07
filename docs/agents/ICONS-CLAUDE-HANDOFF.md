# Claude implementation handoff: Forma icon system

**Read this document first, then the repository's AGENTS.md, installed Ordo/SDE, Praxis/ROS, Dokimos and Visual Engineering rules before modifying anything.**

## Exact repositories

1. `kemiller2002/forma` (authoritative icons, registry, static compiler, package, accessibility): https://github.com/kemiller2002/forma
2. `kemiller2002/forma-studio` (icon picker, authoring, workflow and portable HTML export): https://github.com/kemiller2002/forma-studio
3. `kemiller2002/folio` (print/PDF rendering and offline deterministic proofs): https://github.com/kemiller2002/folio

Do not infer alternate repositories or create another icons repo.

## Baseline, branch and issues

- Foundation draft PR: https://github.com/kemiller2002/forma/pull/109 (branch `feature/forma-icon-foundation`)
- Forma public catalog, browser and a11y: https://github.com/kemiller2002/forma/issues/110
- Forma icon expansion and artwork review: https://github.com/kemiller2002/forma/issues/111
- Forma Studio: https://github.com/kemiller2002/forma-studio/issues/27
- Folio: https://github.com/kemiller2002/folio/issues/45
- Canonical contract: `forma/requirements/ICON-SYSTEM.md`
- Decision: `forma/docs/decisions/ADR-2026-10-07-icon-foundation.md`
- Source: `forma/icons/registry.json`; do NOT hand-edit compiled output.

## Execution protocol

1. Recheck the latest main/PR state and baseline statuses; avoid overwriting work already done by other agents. Run foundation compiler, package, catalog, browser, and site CI locally before further changes. File any failures as evidence, not as handwaved passing checks.
2. Spawn independent subagents as appropriate: **contract/security audit**, **catalog/UX+visual review**, **Studio integration**, **Folio print integration**, and **adversarial test/quality review**. Give each explicit file ownership and avoid parallel edits to the same files.
3. Repair all foundation defects on its PR branch before promoting it. In particular, independently verify that invalid SVG/unknown geometry is rejected, output is byte-for-byte stable, generated SVG is safe offline, package exports resolve, and existing Forma builds remain intact.
4. Complete Forma catalog/browser issue #110 first; pin and publish a NEW version only after CI and migration review. Do not overwrite version 0.4.1 or claim a release happened without evidence.
5. Expand icon vocabulary under #111 only after geometry grammar and design review; prefer first-party originals over copying external SVG paths. Keep source and licensing audit.
6. Coordinate Studio issue #27 and Folio issue #45 once the versioned Forma assets are available. Use separate branches and PRs per repo. Consumers pin the released artifact rather than vendor copying.
7. Conduct blind/independent evaluation of changes and regression evidence. Record design decisions, tests, unresolved limitations, and any AI drift or expedient shortcuts in existing ROS/Ordo work items.
8. Leave a concrete handoff: PR links, all commits, actual test commands + results, known failures, current release/version, and downstream work dependencies. Do not report work as complete if CI, portability or accessibility evidence is missing.

## Invariants

- Forma core stays zero-runtime. `<ef-icon>` is inert; native HTML has semantics and controls.
- Forma owns drawing geometry, labels as suggested metadata, styling and packaging, **never** executable actions, authoritative state or workflow semantics.
- Limen owns browser capabilities and application commands. F# and Ordo own Studio state and legality. Folio owns pagination and print.
- The same static SVG shapes must work in light/dark/custom brands, 320px/mobile, offline HTML, grayscale/forced colors, and printed PDF without remote assets.
- Do not mark icons as valid accessibility names for buttons. Use semantic button name, plain text for consequence/status, and hide purely decorative SVG.
- Machine operability: role+name locators and observable native/domain state, never coordinate/image selectors, animation completion or SVG path matching.
- No injected SVG scripts, event attributes, foreignObject, external references, third-party licensing ambiguity or undocumented runtime dependencies.
- Respect existing installed quality requirements; no green-but-meaningless tests, snapshots in place of accessibility checks, skipping checks, or CSS overrides as shortcuts.

## Definition of done

All linked issues have independently validated code, not just requirements; catalog and docs expose at least three examples with a real mobile scenario, portable Studio HTML works without JavaScript or network, Folio print/PDF output is demonstrated, and releases are pinned and auditable. Until then the foundation PR remains a preview rather than a complete shipped icon system.
