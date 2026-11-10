# Consuming Forma

Forma is a zero-component-runtime, brand-neutral presentation package. An
organization's identity comes from its own brand or theme package, loaded after
Forma (see "Migrating to Forma 1.0.0" for Echelon applications).

## Migrating to Forma 1.0.0

Forma 1.0.0 is one major release with two breaking changes, so an application
migrates once:

1. **Brand neutrality (EDS-ADR-002).** Forma ships no organization identity.
   The default `:root` palette is a neutral Forma palette, and the Echelon
   brand, marketing theme and assets moved to the
   `@echelon-foundry/echelon-theme` package
   (`kemiller2002/echelon-design-system`).
2. **Namespace rename (FORMA-NS-001).** Every Forma name moved from the `ef-`
   namespace to `forma-`:

   | 0.x | 1.0.0 |
   | --- | --- |
   | `.ef-*` classes | `.forma-*` |
   | `--ef-*` custom properties | `--forma-*` |
   | `data-ef-*` attributes | `data-forma-*` |
   | `<ef-*>` authoring tags | `<forma-*>` |
   | `ef-component-tag` | `forma-component-tag` |
   | `element.dataset.efX` | `element.dataset.formaX` |
   | `@layer echelon.*` | `@layer forma.*` |

The CHANGELOG (1.0.0) lists every breaking change.

### Step 1: run the codemod

The F# codemod ships in the package (`tools/NamespaceMigrator`, .NET 10 SDK,
no package references). It rewrites `.html .htm .css .scss .sass .less .js
.mjs .cjs .jsx .ts .mts .cts .tsx .vue .svelte .razor .cshtml .fs .fsi .fsx
.json .md`, keeps each file's encoding (UTF-8 with or without a byte-order
mark) and line endings, and changes only Forma names:

- classes, element names, ids and class strings (`ef-x` -> `forma-x`,
  `</ef-x>`, a regular-expression literal such as `/^\.ef-x/`);
- custom properties (`--ef-x`) and attributes (`data-ef-x`);
- the DOM dataset: `el.dataset.efX`, `el.dataset["efX"]` and destructuring
  `const { efTone } = el.dataset` (also with a type annotation such as
  `: DOMStringMap`), which becomes `const { formaTone: efTone } = el.dataset`
  so the local name is kept.
- `.ef-x` is a class selector, even when a file- or host-like suffix follows
  (`.ef-icon.svg`, `.ef-shell.app` in CSS), but not after `/` in a path
  (`"/.ef-rc.json"`, `"assets/.ef-cache/x"`).
- A whole quoted string that could be a selector or a file name
  (`".ef-icon.svg"`, `".ef-config.json"`, `"div.ef-card.md"`) is migrated as
  the argument of `querySelector`, `querySelectorAll`, `closest` or `matches`.
  Anywhere else it is left unchanged and listed as `review:` with its line, and
  `--check` exits 3 until you decide: rewrite it by hand if it is a selector,
  or `--exclude` the file if it is a file name.
  A plain word prefix that is not an HTML or SVG element (`"logo.ef-x.png"`)
  makes it a file name, left alone; an element-like prefix (`"path.ef-icon.svg"`,
  `"my-widget.ef-x.md"`, `"ef-tabs.ef-active.md"`) keeps it listed for review.
  A URL attribute selector value (`img[src=ef-a.png]`, `a[href='ef-c']`,
  `a[HREF="ef-x"]`) is a location wherever it appears: in a selector argument,
  in a selector held in a variable, or in CSS (`a[href^="ef-"]`).

Words (`ref-`, `chef-`, `--ref-`, `beef-`) and locations are never touched:
URLs and host names (`https://ef-cdn.example.org/...`), paths
(`/assets/ef-logo.svg`), file names (`ef-page.html`), CSS `url(...)` and
`@import` targets, URL-valued attributes (`src`, `href`, `srcset`, ...) inside
an HTML, Razor, Vue or JSX tag, in any letter case (`HREF`, React `srcSet`,
`formAction`, `xlinkHref`) and as Vue or Angular bindings (`:href`,
`v-bind:href`, `[href]`), including JSX `{...}` and Razor `@...(...)`
values, Markdown link targets and reference definitions (`[d]: /ef-doc`) in
Markdown files, dotfile and dot-directory paths (`"/.ef-rc.json"`,
`"assets/.ef-cache/x"`), module
specifiers (`import ... from "..."`, `require("...")`) and scoped packages
(`@ef-labs/widget`). A script variable named `src`, `data` or `href` is not a
location: `const src = "ef-button"` is migrated.

How tags are read, and its limits:

- In JS, TS and F# files the lexer decides where markup stands: a JSX
  element (after `=`, `(`, `=>`, `return`, `:`, `?`, `&&` and the like), JSX
  children of any length and wording (`<p>Price: $5. See <a href="...">`),
  strings (`el.innerHTML = 'Click <a href="...">'`, F# strings including
  triple-quoted ones), template literals (multi-line Lit ``html`...` `` templates),
  regular expressions and comments. There every `<name` is a tag. In HTML,
  Razor, Vue, Svelte, Markdown, CSS and JSON every `<name` is a tag, so prose
  such as `a <b and data = ef-x` in Markdown reads `data = ef-x` as an
  attribute and leaves it.
- A `<name` in script code after an operand is a comparison or a type
  argument (`if (a <b && c) data = "ef-card"` is migrated). If attribute
  syntax (also past a spread, `{...p}`) and a URL attribute follow it
  (`n <a href="ef-x">`), the tool cannot
  tell: the value is left unrewritten and listed as `review: FILE:LINE a
  <name here may be a tag`, and `--check` exits 3.
- `{...}` expressions are lexed as script (strings, template literals,
  comments, regular expressions and JSX text are skipped; TSX type
  parameters such as `<T extends U>(...)` are script). A tag is listed as
  `review: FILE:LINE a tag here could not be read with certainty`, and
  `--check` exits 3, when a `{...}` group in it never closes, spans a place
  where the lexer had to guess (an unclosed string, a `/` that reads both as
  division and as a regular expression holding a brace or quote, such as
  `if (ok) /{/.test(s)`), was matched without the lexer (a tag inside a
  string or comment, `'<a x={f("}")} href="...">'`), or opens inside a JSX
  element or template literal that never closes, or an attribute quote in
  it never closes; or when the tag is longer than 1 MiB. These lines appear
  only when a Forma name is at stake: a tag with no Forma name in its unread
  extent (up to 1 MiB after it, since its `>` cannot be found) is not
  reported, so a codebase without Forma names checks clean. A URL attribute
  value in that extent that is followed by the rest of an attribute list is
  left unrewritten too, and each one that holds
  a Forma name is listed at its own line (`a src/href value here holds a
  Forma name and was left unrewritten`), also by `--dry-run`. The lexer is not
  a full parser, so a misreading it does not notice could still go
  unreported: read the `--dry-run` diff of files with complex JSX.

It always skips `node_modules`, `.git`, `bin` and `obj`, and by default also
`vendor`, `bower_components`, `jspm_packages`, `dist` and `wwwroot/lib`
(third-party copies and build output); `--include-vendored` includes them.

```bash
M=node_modules/@echelon-foundry/design-system/tools/NamespaceMigrator/NamespaceMigrator.fsproj
dotnet run --project "$M" -- --check src wwwroot     # report; exit 3 when anything needs attention
dotnet run --project "$M" -- --dry-run src wwwroot   # every changed line, before and after
dotnet run --project "$M" -- src wwwroot             # rewrite in place
dotnet run --project "$M" -- --check src wwwroot     # exit 0 once nothing is left
```

The second `--check` exits 0 only after you have acted on every `review:`
line of the first: the write leaves reviewed strings, tags and values
unrewritten, so `--check` keeps exiting 3 until you rewrite them by hand,
confirm them as locations and `--exclude` the file, or change the code so it
reads unambiguously.

`--check` never gives a false all-clear: a text file of another kind (a
`.txt`, a template, a `.yml`), or a supported file that is not UTF-8 (for
example a Latin-1 stylesheet, which is never rewritten so it cannot be
corrupted), that contains Forma names is listed as
`review: ...` and keeps the exit status at 3 until you fix it by hand or
exclude it. `--exclude TEXT` (repeatable) skips paths that contain `TEXT`, for
example a changelog that must keep the old names. Review the diff and commit
it as one change.

Fix by hand what no text rewrite can see:

- a name assembled from pieces (`"e" + "f-" + slug`, `` `${prefix}-card` ``);
- a dataset key computed at run time (`el.dataset[key]` where `key` holds
  `"efTone"`);
- Forma names inside a location you own (a `/ef-icons/` asset folder you
  serve yourself): rename the folder and its references together;
- files in skipped directories or of kinds listed for review.

`TokenValidator` reports a remaining `--ef-*` reference as a `namespace`
finding with the `--forma-*` suggestion.

Then upgrade the pin to `1.0.0`.

### Step 2: Echelon applications add the Echelon theme

Forma no longer contains `dist/brands/echelon.css`, the Echelon marketing
theme or Echelon logo paths. An Echelon application:

1. adds `@echelon-foundry/echelon-theme` (from
   `kemiller2002/echelon-design-system`, theme 1.0.0 or later, built against
   Forma 1.0.0) at an exact version;
2. loads the theme's `dist/echelon.css` **after** Forma's CSS:

   ```html
   <link rel="stylesheet" href="/assets/forma/all.css">
   <link rel="stylesheet" href="/assets/echelon-theme/echelon.css">
   ```

3. sets `data-forma-brand="echelon"` on `<html>` (or on the branded subtree);
4. serves logo assets from the theme package's files (listed in its
   `dist/asset-manifest.json`) at deployed URLs. Application marks stay owned
   by the application.

Without step 2 an application renders with the neutral Forma palette; nothing
breaks, but it no longer looks like Echelon.

### Step 3: marketing sites

`forma-echelon-marketing.css` and `forma-marketing-theme-echelon.css` are no
longer release assets. A marketing site pins `forma-marketing.css` in
`forma.lock` and loads the theme's `dist/echelon-marketing.css` after it:

```html
<link rel="stylesheet" href="assets/forma/forma-marketing.css">
<link rel="stylesheet" href="assets/echelon-theme/echelon-marketing.css">
```

### Other organizations

Any organization compiles its own brand manifest
(`schemas/brand-manifest.schema.json`, schema 1.0, unchanged) with the packaged
compiler and loads the result after Forma; see `docs/BRANDING.md`. The packaged
compiler's output is byte-identical to Forma's own build.

## Canonical version

The current application baseline is **Forma 1.0.0**.

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
common asset is `forma-marketing.css`, followed by the organization's own
marketing theme. See `docs/MARKETING-SITES.md` and ADR-0003.

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
- `@echelon-foundry/design-system/marketing/*` (versioned, brand-neutral marketing release artifacts)
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

The validator rejects unknown `--forma-color-*` names and reserved internal color
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

Consumer markup should use the documented inert `<forma-*>` wrapper around the
canonical pattern. The tag is `forma-` plus the pattern slug.

```html
<forma-dialog class="forma-component-tag">
  <button type="button" commandfor="confirm-dialog" command="show-modal">Open</button>
  <dialog class="forma-dialog" id="confirm-dialog" aria-labelledby="confirm-title">
    <div class="forma-dialog__body">
      <h2 id="confirm-title">Confirm action</h2>
    </div>
  </dialog>
</forma-dialog>
```

The wrapper has no runtime registration or lifecycle. Do not call
`customElements.define()` for Forma tags. Native HTML inside the wrapper
remains the semantic and interaction authority; Limen supplies behavior beyond
the browser-native baseline.

## Branding and skins

White-label identity is supplied through a versioned Brand Manifest and compiled
to static scoped CSS. Load a generated brand stylesheet after Forma and apply
`data-forma-brand="<brand-id>"` at the document root or on a subtree.

Presentation-only skins use `data-forma-skin="compact"`,
`data-forma-skin="comfortable"`, or `data-forma-skin="square"`.

Do not copy or fork Forma CSS for customer branding. See
`docs/BRANDING.md` for the manifest, scoping, theme, accessibility, and Limen
boundary contracts.

## Typography roles

Forma has four typography roles. Select one with `data-forma-type` on any
element, usually `<html>` or `<body>`; the nearest role wins, so a region can
use another role than its page. Marketing is the default and needs no
attribute.

| Role | Attribute | h1 / h2 / h3 / h4 | Body | Leading (body) | Heading measure |
|---|---|---|---|---|---|
| Marketing | none (or `data-forma-type="marketing"` at the root) | fluid display-1 / display-2 / lg / md | md | the theme's | 14ch / 18ch |
| Application | `data-forma-type="application"` | 2xl / xl / lg / md | md | normal | none |
| Dense administrative | `data-forma-type="dense"` | xl / lg / md / sm | sm | snug | none |
| Accessible large text | `data-forma-type="accessible"` | 3xl / 2xl / xl / lg | lg | relaxed | none |

Every value is an existing `--forma-primitive-font-size-*` or
`--forma-primitive-line-height-*` token. A role restates the type role tokens
(`--forma-type-size-*`, `--forma-type-leading-*`, `--forma-type-measure-h1/h2`), so it
works both inside the `.forma-site` shell and on the application layer alone
(`tokens.css` + `foundations.css` + `components.css`), where it also gives
headings and body text their sizes. Component headings keep their own sizes.
Body text takes the role on `<body>` (or the role element), never on `<html>`,
so `rem` keeps meaning the reader's text size. Roles are defined in
`foundations.css`, which every bundle includes; there is nothing extra to load.

Nesting `data-forma-type="marketing"` inside another role is not supported: the
marketing values come from the page root and its theme.

**Why.** An application screen built on the `.forma-site` shell used to inherit
the marketing display scale: h1 up to 7.25rem at 1280px and wider, capped at
14ch, so "Connect a data repository" wrapped to three lines on a phone. On the
application layer alone, wrapped h1/h2 lines used a line-height of 1.02, so at
200% text their glyph boxes overlapped. The R5 rehearsal
(`indy-init-rehearsal-005`, `f207cd4`) had to override Forma in its own CSS.
`tests/browser/type-roles.spec.mjs` reproduces both failures and checks each
role for containment, overlap, clipping, focus visibility, keyboard order,
long unbroken content and 200% text at 320-1280px.

**Adopting it.** An application on the site shell sets the role and deletes
its local heading overrides. For the R5 rehearsal this would be (described
only; R5 is not changed by this release):

1. `src/kernel/index.html`: `<body class="forma-site causa" data-forma-type="application" ...>`.
2. `src/kernel/causa.css`: delete the "Application type scale (UI-014)" block
   (lines 342-353: the `--forma-type-size-h1/h2/h3` restatement, the
   `max-inline-size: none` / `line-height: 1.2` rule and the three
   `font-size` rules). The role gives h1/h2 the snug leading (1.25).
3. Keep `tests/browser/identity.spec.js` (h1 = 2 x root, one line, two at
   320px) as the consumer check.

Rounded-corner text containment (LCE-001) is now also available to consumers:
`measureCornerContainment(locator)` / `expectTextInsideCorners(locator)` in
`@echelon-foundry/forma-conformance` check rendered text against the visible
curved boundary.

## Workflows

Forma 0.4.0 adds the portable workflow format. The JSON Schema and capability
contract are package files:

- `@echelon-foundry/design-system/workflow/forma-workflow.schema.json`
- `@echelon-foundry/design-system/contracts/workflow-capabilities.json`

Static workflow HTML needs only `tokens.css`, `foundations.css` and
`components.css`. An interactive viewer or editor needs the separate opt-in
package `@echelon-foundry/forma-workflow`. See `docs/workflow/`.

## Design-token validation

Forma 0.13.0 ships an F# validator for every `--forma-*` reference, not only colors. Run it in application CI against the exact package the application pins (requires the .NET 10 SDK):

```bash
dotnet run --project node_modules/@echelon-foundry/design-system/tools/TokenValidator/TokenValidator.fsproj -- \
  --forma node_modules/@echelon-foundry/design-system  src/styles/   # files or directories; --json for machine output
```

It exits 1 on any error. The installed package is the source of truth: its token JSON, its built `dist/` CSS, and `contracts/color-contract.json`. A name is valid when that Forma version defines it, or reads it with a fallback as a documented input (for example `--forma-stack-gap`). The validator reports:

- unknown and deprecated tokens. A fallback such as `var(--forma-nonexistent, white)` does not make an unknown token valid.
- wrong namespaces: `--forma-*`, `--ef_*`, or a dropped segment such as `--forma-spacing-4` for `--forma-primitive-spacing-4`.
- new names an application declares in the `--forma-` namespace.
- reads of internal implementation variables.
- custom properties that refer to each other in a cycle.

Application-owned properties such as `--causa-*` are never reported. Keep `forma-color` for color-role pairing rules; the two validators agree on the color namespace.

## 1.0.2

Patch: the namespace codemod keeps URL attributes after a JSX expression or a
quoted value that contains `>` as locations, leaves dotfile paths and Markdown
reference definitions alone, lists strings that could be a selector or a file
name (`".ef-icon.svg"` outside `querySelector`) for review instead of guessing, keeps Razor `@Url.Action("...")` values and URL attributes after `&`, `(`, `)` or `;` in a tag intact,
and its `--check`/`--dry-run` reports match write mode for tags that span
lines. It lexes `{...}` expressions as script, lists a tag whose `{` never
closes for review, no longer reads a `<` after an operand in script as a tag,
and stays linear on adversarial input. If you ran 1.0.1's codemod on JSX, Razor or Markdown, review its diff
for those cases. No CSS, class or token changed.

## 1.0.1

Patch: the namespace codemod migrates names that 1.0.0 mistook for locations
(script variables named `src`, `data` or `href`; calls such as
`handlers[0]("ef-x")`; class selectors such as `.ef-icon.svg`; typed dataset
destructuring) and lists non-UTF-8 files that hold Forma names for review. If
you migrated with 1.0.0, upgrade and run the codemod with `--check` again. No
CSS, class or token changed.

## 1.0.0

Brand-neutral, and the `ef-` namespace is now `forma-`. Follow "Migrating to
Forma 1.0.0" above. The sections below describe earlier releases in the
names they used (`ef-`).

## 0.14.0

Additive minor release. No class, token or component was removed or renamed. A button that already carries `aria-busy="true"` now shows the pending ring.

- **Application identity:** render your application's mark and name with `.ef-app-identity` (`patterns/app-identity.html`). Prefer an inline SVG mark drawn with `currentColor`: it needs no request and survives a strict Content-Security-Policy. For an external mark, use an `<object>` with a `.ef-app-identity__monogram` inside it as the fallback, serve it same-origin and script-free, and allow it in `object-src`; under `object-src 'none'` the monogram shows. If you have light and dark external marks, give each the class `ef-app-identity__variant` and `data-ef-scheme="light"` or `"dark"`.
- **Pre-runtime start-up:** put `.ef-startup` (`patterns/startup.html`) in the initial HTML of the page your WebAssembly or script mounts into. Your loader sets `data-ef-state` to `slow`, `failed` or `timed-out`, and removes the screen or sets `hidden` once the application has mounted.
- **Pending actions:** set `aria-busy="true"` and `aria-disabled="true"` on the action in flight, and ignore repeated activation in the application. For a pending form, also set `aria-busy="true"` on the form and wrap its fields in `<fieldset disabled>`.

## 0.13.1

Patch release with two fixes. No class, token or component was removed or renamed.

- **Record header (GH-179):** below 24em, `.ef-record-header`'s type label collapsed onto the record title in 0.13.0. It now sits above the title again, as it did in 0.6.1. Applications that worked around the overlap should remove the workaround.
- **Marketing containment (MKT-CONTAIN):** long tokens in marketing components (`.ef-card`, `.ef-hero`, `.ef-cta` and others under `.ef-site`) break inside the component instead of escaping it, as application containers already did in 0.13.0. At narrow widths, a toned `.ef-cta` caps its inline padding.

## 0.13.0

Layout reliability. No class, token or component was removed.

**Behaviour change:** a token too long for its line (a URL, SHA, path or identifier) in a `span`, `strong`, `em`, `div` or `li` now breaks inside Forma containers instead of escaping them. Words that fit are not split. `CHANGELOG.md` 0.13.0 lists the containers. Check any screen that relied on such text overflowing. Text that must not wrap should say so explicitly, with `white-space: nowrap` (or `pre`), or sit in `.ef-bounded-overflow`, which scrolls.

Other visible changes to check:

- **Rows:** children of `.ef-cluster` and `.ef-actions` are no wider than the row. A full-bleed child with negative margins is capped too.
- **Forms:** in WebKit, a `select` in `.ef-form-row` no longer widens the page.
- **Focus:** date and time pickers show the focus ring on their picker button, and focus scrolling keeps the whole ring in view.

New tools:

- `tools/TokenValidator`; see "Design-token validation".
- `forma-conformance` 0.3.0 `expectContained` and `expectFocusVisible`, for application geometry tests.

Known limitations (`CHANGELOG.md` 0.13.0):

- `.ef-dashboard-grid`, `.ef-split-pane` and `.ef-operation-status` reflow on the viewport, not their container.
- A narrowed SVG chart with `width`/`height` attributes keeps a too-tall box.

## 0.12.0

Behaviour change for workflow documents; no CSS class or component changed.
`forma-workflow validate` reports the new error `A11Y-NONTEXT-CONTRAST`
(WCAG 1.4.11, 3:1) for literal diagram colours, and `render` refuses those
documents. Prefer `token:status-*` or `token:border-functional`, pass the
host's pinned theme with `--theme`, or adjust literal colours. The four status
tokens (`token:status-warning|danger|success|info`) are additive. See
`CHANGELOG.md` 0.12.0 and `docs/workflow/VALIDATION.md`, "Non-text contrast".

## 0.11.0

Additive. No class, token or component changed for pages without
`data-ef-type`; marketing pages render as before. Opt in to a typography role
with `data-ef-type` (see "Typography roles"). The marketing heading measures
are now the role tokens `--ef-type-measure-h1` (14ch) and
`--ef-type-measure-h2` (18ch); a site that overrode `max-inline-size` on
`.ef-site h1/h2` can set those tokens instead.

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
