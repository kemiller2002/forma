# Consuming Forma

Forma is the zero-component-runtime Echelon Foundry presentation package.

## Canonical version

The current application baseline is **Forma 0.10.0**.

Applications must pin a concrete Forma version. Do not copy CSS files into an
application and do not depend on the moving repository branch.

The release artifact is produced by the repository release workflow and
attached to the matching GitHub release. Until npm Trusted Publishing is
configured for this package, the canonical dependency form is the immutable
GitHub release tarball:

```json
{
  "dependencies": {
    "@echelon-foundry/design-system": "https://github.com/kemiller2002/echelon-design-system/releases/download/v0.3.0/echelon-foundry-design-system-0.3.0.tgz"
  }
}
```

When the npm package is published, applications may replace the tarball URL
with the exact version `0.3.0`. Do not use a floating range for the application
baseline.

## Marketing and public websites

Marketing sites do not need npm. They pin flat release assets with
`forma.lock` and install them with `actions/install-presentation`. The most
common asset is `forma-echelon-marketing.css`. See `docs/MARKETING-SITES.md`
and ADR-0003.

## CSS

Most applications should load the complete presentation surface:

```css
@import "@echelon-foundry/design-system/all.css";
```

More selective imports are available:

- `@echelon-foundry/design-system/tokens.css`
- `@echelon-foundry/design-system/foundations.css`
- `@echelon-foundry/design-system/components.css`
- `@echelon-foundry/design-system/assessment.css`
- `@echelon-foundry/design-system/skins.css`
- `@echelon-foundry/design-system/marketing.css` (brand-neutral marketing layer, also included in `all.css`)
- `@echelon-foundry/design-system/marketing/*` (versioned marketing release artifacts, including the Echelon theme)
- `@echelon-foundry/design-system/brands/<brand-id>.css`

Canonical HTML patterns are exported under `patterns/*` and documented at
https://forma.echelonfoundry.com/.

## Runtime version diagnostic

Browser applications load the behavior-free diagnostic once alongside their
Forma CSS:

```js
import "@echelon-foundry/design-system/runtime";
```

It records the exact built package version at
`window.__ECHELON_RUNTIME__.libraries.forma` and writes one compact console
message. It does not register custom elements, inspect markup, or add component
behavior. Loading the same version repeatedly is silent; a second, different
Forma version produces a warning and leaves the first registration intact.

## Semantic color validation

Forma 0.9.0 publishes `contracts/color-contract.json` and the build-time
`color-contract` API / `forma-color` CLI. Validate CSS against the artifact
from the exact package version the application pins:

```bash
npx forma-color validate src/**/*.css
```

The validator rejects unknown `--ef-color-*` names and reserved internal color
variables even when they include literal fallbacks, and ignores
application-owned custom properties. See `docs/COLOR.md`
for supported pairings, forced-colors behavior, data-visualization boundaries,
and the Summa migration map.

## Design by Construction forms

Forma 0.8.0 adds an optional, build-time `forma.design/1.0.0` contract for
constructing semantic forms. The schema, capability contract and examples are
available through these package exports:

- `@echelon-foundry/design-system/design/forma-design.schema.json`
- `@echelon-foundry/design-system/contracts/design-capabilities.json`
- `@echelon-foundry/design-system/design/examples/*`

Validate and render before deployment; the rendered result is ordinary HTML
and uses Forma's existing zero-runtime CSS. Hand-authored HTML remains a
supported escape path. See `docs/DESIGN-CONTRACT.md` for mode and refusal
rules.


## Component authoring tags

Consumer markup should use the documented inert `<ef-*>` wrapper around the
canonical pattern. The tag is `ef-` plus the pattern slug.

```html
<ef-dialog class="ef-component-tag">
  <button type="button" commandfor="confirm-dialog" command="show-modal">Open</button>
  <dialog class="ef-dialog" id="confirm-dialog" aria-labelledby="confirm-title">
    <div class="ef-dialog__body">
      <h2 id="confirm-title">Confirm action</h2>
    </div>
  </dialog>
</ef-dialog>
```

The wrapper has no runtime registration or lifecycle. Do not call
`customElements.define()` for Forma tags. Native HTML inside the wrapper
remains the semantic and interaction authority; Limen supplies behavior beyond
the browser-native baseline.

## Branding and skins

White-label identity is supplied through a versioned Brand Manifest and compiled
to static scoped CSS. Load a generated brand stylesheet after Forma and apply
`data-ef-brand="<brand-id>"` at the document root or on a subtree.

Presentation-only skins use `data-ef-skin="compact"`,
`data-ef-skin="comfortable"`, or `data-ef-skin="square"`.

Do not copy or fork Forma CSS for customer branding. See
`docs/BRANDING.md` for the manifest, scoping, theme, accessibility, and Limen
boundary contracts.

## Workflows

Forma 0.4.0 adds the portable workflow format. The JSON Schema and capability
contract are package files:

- `@echelon-foundry/design-system/workflow/forma-workflow.schema.json`
- `@echelon-foundry/design-system/contracts/workflow-capabilities.json`

Static workflow HTML needs only `tokens.css`, `foundations.css` and
`components.css`. An interactive viewer or editor needs the separate opt-in
package `@echelon-foundry/forma-workflow`. See `docs/workflow/`.

## 0.10.0

Minor upgrade from 0.9.1, with `@echelon-foundry/forma-workflow` 1.1.0. No
class, token, component or icon was removed. Visible changes to check:

- Diagram nodes are sized for their shape and reserve WCAG 1.4.12 text-spacing
  room, so nodes are taller and default layouts move.
- Diagram geometry custom properties are emitted in rem.
- Tall pill nodes keep bounded corners.
- A brand `--ef-shape-radius` on marketing cards, badges and buttons is capped
  by each component's padding.

`Forma.Workflow.LayoutCheck` (in forma-workflow 1.1.0) reports authored layouts
that cannot hold their content. Run it before publishing diagrams.

## 0.9.1

Patch upgrade from 0.9.0. It adds the opt-in `runtime` entry point and the
`ECHELON-RUNTIME-1` browser registry contract. Component markup and CSS are
unchanged.

## 0.9.0

Minor upgrade from 0.8.0. It adds the public semantic color manifest,
validator, four cross-theme status roles, and rendered non-hue evidence. No
existing token, class, component, or icon was removed. Brand manifest schema
1.0 remains compatible because status overrides are optional.

## 0.8.0

Minor upgrade from 0.7.0. It adds the optional `forma.design/1.0.0` build-time
contract and the responsive `.ef-form` composition. Existing hand-authored
HTML remains valid, and no class, token, component or icon was removed. Pin
the immutable 0.8.0 release once it is published; a Git commit alone does not
establish publication.

## 0.4.1

Forma 0.4.1 is a patch release. Text on the secondary surface now meets WCAG
AA in every theme and brand, including inline faults, `.ef-surface` hints and
links. Character-grid profiles respect forced colors. See `CHANGELOG.md`.
There are no markup or token changes. Remove local contrast workarounds such
as `p { color: inherit }` inside Forma faults.

## 0.5.0

Forma 0.5.0 adds static icons. Install or pin 0.5.0, then copy the generated
assets you need from `@echelon-foundry/design-system/icons/*`; do not
hand-copy path geometry. Inline `icons/html/<name>.html` snippets are
decorative (`aria-hidden`), so the surrounding control or text must carry the
accessible name and any status meaning. `icons/registry.json` records
`formaVersion` and each icon's `svgSha256` for offline verification. Icon
IDs that a consumer does not recognize should be preserved as inert data, not
rendered or rejected. There are no markup or token changes for existing
components. See `docs/ICONS.md`.

## 0.7.0

Minor upgrade from 0.6.1. It adds the `.ef-form-row` primitive for peer fields and fixes shared geometry: one intrinsic height for single-line controls, and no overflow at 320/390 px with 200% text across the catalog. No markup, class or token is removed. Pages that lined up side-by-side fields with local margins can switch to `.ef-form-row` and delete those margins. Pin the immutable 0.7.0 release once it is published; a Git commit alone does not establish publication. Consumers that copied Forma's Playwright conformance helpers can depend on the dev-only `@echelon-foundry/forma-conformance` instead (see `packages/conformance/README.md`).

## 0.6.1

Patch upgrade from 0.6.0. The new version constrains native date/time input width inside responsive `.ef-field` grids while keeping native browser pickers, labels, values, and events unchanged. The Forma documentation site also presents unbroken navigation labels and internally scrollable code examples on narrow screens. Consumers must pin the actual immutable 0.6.1 release once available; do not assume a Git commit alone establishes publication.

## 0.6.0

Forma 0.6.0 extends the static icon registry from 40 to 80 first-party glyphs. Existing icon names and their geometry remain unchanged; no prior component, class, token or runtime contract changes. Additions include `email`, `email-open`, `inbox`, `send`, `reply`, `reply-all`, `forward`, `attachment`, `message`, `chat`, `phone`, `video-call`, common media controls, navigation, and additional status indicators.

When 0.6.0 is published, consumers may explicitly upgrade the exact Forma package pin. Take the icon SVG and inline HTML only from that version's `dist/icons/` assets and verify `formaVersion` plus the SHA-256 digest in `icons/registry.json`. Existing 0.5.0 consumers need no migration unless they opt into new names.

Icons never operate or label controls on their own. Native buttons and links retain semantic names and state; consequences and statuses must also be written in text. Static Folio exports must embed the pinned artwork without remote requests; Forma Studio must preserve unknown future icon names as inert data. See `docs/ICONS.md`.

## Ownership boundary

Forma owns semantic HTML contracts, CSS, design tokens, responsive
recomposition, accessibility presentation, and non-color state cues.

The consuming application owns labels, content, application state, data,
routing, asynchronous behavior, and domain-specific meaning.

Limen owns browser/application interaction beyond native HTML.

Ordo/application state owns legal transitions, capabilities, obligations,
permissions, scoring, and domain invariants.

## Mobile

Every canonical pattern has an explicit 320px presentation. Applications must
not fork the pattern solely to make a phone layout. If an application exposes a
new responsive need, record the gap in Forma and improve the shared contract.

## Upgrade rule

A Forma version change is an explicit application dependency change:

1. update the pinned version;
2. run the application's build and browser/accessibility tests;
3. inspect any changed canonical pattern used by the application;
4. record material migration decisions through ROS.

Do not silently track Forma `main`.
