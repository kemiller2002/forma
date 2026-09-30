---
id: ADR-0005
title: The documentation site is a projection of one component catalog
status: accepted
date: 2026-09-30
supersedes: null
related:
  - docs/CATALOG-AUTHORING.md
  - docs/COMPONENT-INVENTORY.md
  - tools/catalog/
  - tests/catalog-coverage.test.mjs
  - tests/site-browser/catalog.spec.mjs
work_item: WI-0011
---

# Decision

The Forma documentation site is generated from a single component catalog:

```text
patterns/<slug>.html            canonical minimal markup (Basic example, packaged)
dist/all.css                    implementation → derived CSS hook surface
catalog/components/<slug>.mjs   explanation, examples, native API, states, a11y, …
catalog/categories.json         families and navigation order
catalog/compositions/*.mjs      multi-component showcases
        ↓ tools/catalog/load.mjs
component pages · category pages · A–Z index · mobile reference ·
compositions · site-manifest.json · docs/COMPONENT-INVENTORY.md
```

`tools/component-meta.mjs` and `tools/site-examples.mjs` are removed; their
data moved into the catalog entries so there is one place per fact.

## Rules that prevent drift

- **CSS hooks are derived, not written.** `tools/catalog/css-hooks.mjs`
  extracts elements, modifiers, attribute hooks and `--ef-<root>-*` custom
  properties from `dist/all.css`. Entries may only describe hooks that exist,
  and must describe every modifier, attribute hook and custom property of the
  blocks they own.
- **Every CSS block has one owner.** Each `.ef-*` block class in the stylesheet
  is owned by exactly one entry. A new public block without documentation
  fails CI.
- **Every pattern has an entry.** `patterns/*.html` and
  `catalog/components/*.mjs` must match one to one.
- **Rendered equals shown.** Each example string is rendered live and shown as
  source verbatim; tests compare the two. Only generated specimens (motion
  weights, stress screens, category previews) are namespaced copies.
- **Examples use the real API.** Every `ef-*` class in an example exists in
  the stylesheet or a canonical pattern; every `<ef-*>` tag is a catalog
  component; native attributes documented in the API table appear in markup.

## Constraints honored

- **Zero runtime.** The site ships no JavaScript
  (`tests/site-build.test.mjs`, ADR-0002). Consequences:
  - copying is one-tap *select all* (`user-select: all`) plus a raw `.txt`
    source link, not a clipboard button;
  - the viewport switcher and the A–Z family filter are radio-backed Forma
    segmented controls driven by CSS `:has()`;
  - there is no full-text search box; the A–Z page supports browser find.
- **No new dependencies.** Node standard library only; Playwright and
  axe-core were already dev dependencies.
- **Dogfooding.** The code viewer is Forma's `code-sample`; controls use
  `segmented-control`; tables use `bounded-overflow`; pages use
  `visually-hidden`. The site chrome (header, sidebar, palette) remains the
  existing Echelon Foundry site CSS required by `tests/site-build.test.mjs`.

## Consequences

- Adding a component means adding a pattern, CSS, a Figma entry and a catalog
  entry; `npm run catalog:check` explains what is missing.
- Revisit the no-script constraint for the documentation site only if a
  clipboard button or search is judged worth a documented exception; that
  would be a change to ADR-0002's scope and needs its own decision.
