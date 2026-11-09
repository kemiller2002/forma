# Forma Branding and Skinning

Forma treats branding and skinning as separate presentation contracts.

- A **brand** changes identity and brand-level design tokens.
- A **skin** changes presentation density/shape without changing identity.
- Neither contract owns application behavior or domain state.

## Brand Manifest

Create a JSON manifest that conforms to `schemas/brand-manifest.schema.json`.
Repository-owned manifests live in `brands/*.brand.json`.

A manifest contains a stable brand ID, identity metadata, optional typography
and shape values, complete light/dark semantic colors, and optional application
terminology.

The manifest is data. Do not place CSS, script, credentials, or executable
configuration in it.

## Forma is brand-neutral

Forma ships no organization's brand (EDS-ADR-002). The default `:root` light
and dark palette is a neutral, accessible Forma palette; an organization's
identity arrives as a brand or theme package that the application loads after
Forma. Forma's own `brands/` directory holds only two unrelated example
brands, `example-harbor` and `example-orchard`, which exist to prove that
scoping, isolation and contrast gates work for any organization.

## Compile an external brand

The F# `BrandCompiler` and `TokenCompiler` sources and project files ship in
the npm package, so a theme package compiles its own manifest with exactly the
compiler Forma uses (requires the .NET 10 SDK; the projects have no package
references):

```bash
dotnet run --project node_modules/@echelon-foundry/design-system/tools/BrandCompiler/BrandCompiler.fsproj -- theme/ dist/
```

The output for a manifest is byte-identical to what Forma's own build emits for
the same manifest (`tests/external-brand-compiler.test.mjs` proves it against
the packed tarball). Load the result after Forma's CSS.

## Build

Compile all repository brand manifests with:

```bash
npm run brands:build
```

The F# compiler writes static files to:

```text
dist/brands/<brand-id>.css
dist/brands/index.json
```

Invalid six-digit colors, unsafe font values, invalid dimensions, unsupported
schema versions, or insufficient required contrast fail the build.

## Load and apply a brand

Load Forma first, then the desired generated brand CSS:

```html
<link rel="stylesheet" href="/forma/all.css">
<link rel="stylesheet" href="/forma/brands/acme.css">
```

Apply the brand at the document root:

```html
<html data-forma-brand="acme">
```

or to a subtree:

```html
<section data-forma-brand="acme">
  <!-- canonical Forma markup -->
</section>
```

Because brands override the same documented `--forma-*` variables consumed by
Forma, canonical component markup does not change.

Multiple brand scopes can coexist on one page. This is useful for previews,
embedded products, partner portals, accessibility comparison, and design-system
testing.

## Themes

Forma still uses `data-forma-theme="light"` and `data-forma-theme="dark"`.
The brand compiler emits both semantic maps and also honors operating-system dark
preference when an explicit theme is absent.

```html
<section data-forma-brand="acme" data-forma-theme="dark">
  ...
</section>
```

Theme selection or persistence at runtime belongs to the consuming application,
normally through Limen. Forma only supplies the static presentation contract.

## Skins

`dist/skins.css` defines the initial zero-runtime skin presets:

- `compact`
- `comfortable`
- `square`

Use a skin independently of brand:

```html
<main data-forma-brand="acme" data-forma-skin="compact">
  ...
</main>
```

A skin must not change labels, identity, permissions, workflow, validation,
scoring, or domain state.

## Terminology and assets

Brand terminology and identity assets are intentionally not converted into CSS.
Applications/build tooling consume those fields because they affect content and
metadata rather than component presentation.

This keeps a strong boundary:

```text
Brand Manifest
  ├─ identity / assets / terms -> application/build adapters
  └─ presentation             -> BrandCompiler -> scoped CSS variables

Skin
  └─ presentation only        -> skins.css

Application / Limen
  └─ runtime selection, persistence, remote loading, preview behavior

Ordo / domain
  └─ legal state and transitions
```

## Accessibility

The brand compiler validates the relationships that are most likely to make a
branded interface unreadable: primary and secondary text, text on secondary
surfaces, inverse text, primary/secondary accents, focus rings, and every
declared status role. Shipped brands override success, warning, danger, and
info; a third-party 1.0 manifest may omit them and inherit the active core
theme, preserving schema compatibility.

A failed brand does not get a best-effort output. Fix the manifest and compile
again.

Forced-colors behavior and non-color state cues remain part of Forma's existing
component accessibility contract. Under `forced-colors: active`, Forma projects
every semantic color token to a system color for every theme, brand and skin
scope (foreground, accent, border and status roles become `CanvasText`;
surfaces become `Canvas`). Brands and themes cannot opt out: the user's
forced-colors choice always wins. Selection and state presentation that needs
`Highlight` keeps its explicit component rules (FORMA-A11Y-001).

## Application identity and start-up

A brand manifest's `identity.assets` (`mark`, `logo`, `logoDark`, `favicon`)
name files; Forma never ships them. An application renders its own identity
with `.forma-app-identity` (`patterns/app-identity.html`): preferably an inline
SVG mark drawn with `currentColor`, otherwise an `<object>` with a text
monogram as its fallback content, with light and dark variants marked by
`.forma-app-identity__variant` and `data-forma-scheme`. The pre-runtime start-up screen
`.forma-startup` (`patterns/startup.html`) shows the same identity before a
WebAssembly or script runtime has loaded. Both are brand-neutral: every color
comes from the active theme or brand. `tools/brand-neutrality.mjs` (run by
`tests/brand-neutrality.test.mjs` and by the release workflow) fails on any
organization identity, any literal from the organization palette Forma used
before 1.0.0, or a legacy organization cascade-layer name in Forma's source
CSS, `dist/` or the packed tarball.

## White-labeling rules for applications

Applications should not fork Forma component CSS just to implement customer
branding. Add or update a Brand Manifest and consume its generated CSS.

Arbitrary customer CSS is not the supported extension mechanism. Internal
component structure is not a theming API.

If a required presentation concept cannot be expressed through the current
manifest/token contract, record the gap in Forma and extend the public contract
deliberately.
