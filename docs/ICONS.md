# Forma icons (foundation preview)

The icon registry is in `icons/registry.json`, validated by `schemas/icon-registry.schema.json` and compiled by `tools/icons/build.mjs`. It now contains forty first-party outline icons, including the eight foundation icons: add, agent, close, edit, search, success, warning and workflow. The compiler and public catalog are implemented, but Forma Studio/Folio consumer integration and independent visual review remain open.

## Build and validate

```sh
npm run icons:check
npm run build
npm pack --dry-run
```

The documentation site also publishes a complete categorized, copyable gallery at `/icons/`. The normal Forma build generates:

- `dist/icons/<name>.svg`: static SVG for `<img>`, CSS or print use
- `dist/icons/html/<name>.html`: pre-rendered decorative inline SVG with inert `<ef-icon>` authoring tag and `.ef-icon` presentation span
- `dist/icons/registry.json`: metadata for static galleries, consumers and tools, stamped with `formaVersion` (the producing package release) and each icon's `svgSha256` so a consumer can verify that bundled geometry matches its pinned release

The icon assets are part of the versioned `@echelon-foundry/design-system` tarball; the wildcard export path is `@echelon-foundry/design-system/icons/<name>.svg` and `.../icons/html/<name>.html`. Nothing fetches a CDN and no runtime JavaScript is required.

## HTML usage

Use the *generated* HTML snippet from `dist/icons/html/search.html`, rather than hand-copying path geometry. For an application button, put that snippet inside a real button that also carries an accessible name:

```html
<button type="button" aria-label="Search">
  <!-- paste the version-pinned, generated decorative search snippet here -->
</button>
```

Static image alternative, when the icon conveys meaning by itself:

```html
<img src="/assets/forma/icons/workflow.svg" alt="Workflow" width="24" height="24">
```

Use `alt=""` on an image that is purely decorative. The generated *inline HTML* SVG is intentionally `aria-hidden="true"`; never depend on it to label a button or convey status. A meaningful standalone inline SVG requires an explicit application-authored `role="img"` and a correct accessible name. Icon names are not translated accessible labels.

Default size is `1.25em`. Set `--ef-icon-size: 1rem` or `2rem` on an icon's presentation span or ancestor. Icons inherit text color through `currentColor`; brands and skins must not rewrite the geometry. Avoid assigning only color or icons to communicate success, failure or warning.

## Contribution rules

1. Choose a stable lower-kebab-case ID and an appropriate semantic category.
2. Submit new source geometry in the registry (24-unit grid, 1.8-unit strokes, round caps and joins).
3. Mark original art as `origin: original`. Third-party assets are currently disallowed by the compiler until provenance/source/license extension and review are implemented.
4. Run `npm run icons:check`, `npm run build`, and `npm run release:check`.
5. Review at 16, 20, 24, 32 CSS px; light/dark/brand; forced colors; 320px layout; and print.
6. Never edit the generated `dist/icons` files, add scripts/filters/external hrefs, or make icons interactive themselves.

See `requirements/ICON-SYSTEM.md` and `docs/decisions/ADR-2026-10-07-icon-foundation.md`. Additional work items own production catalog integration, comprehensive browser visual/a11y tests, Forma Studio and Folio consumers, and the next icon batch.
