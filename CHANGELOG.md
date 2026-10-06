# Changelog

Forma follows semantic versioning for its public HTML, class, and token
contracts (`requirements/QUALITY-AND-DISTRIBUTION.md`, QD-004). Releases are
published as GitHub release tarballs
(`https://github.com/kemiller2002/forma/releases/download/vX.Y.Z/echelon-foundry-design-system-X.Y.Z.tgz`)
and to npm. Earlier releases are described in `docs/CONSUMING-FORMA.md` and
`HANDOFF.md`.

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
