# Building a marketing site with Forma

This guide is for agents and engineers who create or migrate a marketing site
on Forma. Forma is brand-neutral: it ships the generic marketing layer, and an
organization's marketing theme (its colors, typography and backdrop) ships in
that organization's own theme package and loads after Forma.

- Rules: [`requirements/MARKETING-PRESENTATION.md`](../requirements/MARKETING-PRESENTATION.md)
- Distribution decision: [ADR-0003](decisions/ADR-0003-marketing-presentation-distribution.md)
- Working reference: [`examples/marketing-site`](../examples/marketing-site) (a fictional organization)
- Migrating an existing site: [`docs/marketing/MIGRATION-CONTRACT.md`](marketing/MIGRATION-CONTRACT.md)

## 1. How do I make a new marketing site?

1. Create `forma.lock` (see question 2) and install the pinned assets.
2. Start every page from the MarketingShell (`patterns/marketing-shell.html`).
3. Compose each page from Forma components:
   - hero;
   - section heading;
   - card grid;
   - facts;
   - entry index;
   - steps;
   - badges;
   - CTA;
   - prose;
   - callout;
   - code sample;
   - documentation layout.
4. Write content, not CSS. Add `site.css` only for what question 5 allows.
5. Add the checks from question 8 to CI and deploy with question 9.

### Minimal new site

```text
my-site/
  forma.lock
  index.html
  site.css            # optional; often empty
  .github/workflows/deploy-pages.yml
```

`forma.lock`:

```text
forma 0.3.0
repository kemiller2002/forma
destination assets/forma
asset forma-marketing.css sha256:<filled in by install.sh --update>
```

`index.html`:

```html
<!doctype html>
<html lang="en" data-forma-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Product | Example Organization</title>
  <link rel="stylesheet" href="/assets/forma/forma-marketing.css">
  <!-- Optional: the organization's marketing theme, after Forma. -->
  <link rel="stylesheet" href="/assets/theme/marketing-theme.css">
</head>
<body class="forma-site" data-forma-layout="product">
  <a class="forma-skip-link" href="#main-content">Skip to main content</a>
  <header class="forma-site-header">
    <div class="forma-site-header__inner">
      <div class="forma-site-header__identity">
        <a class="forma-site-header__brand" href="/"><span class="forma-site-header__mark" aria-hidden="true">PX</span><span class="forma-site-header__name">Example / Product</span></a>
      </div>
      <nav class="forma-site-nav" aria-label="Primary">
        <ul class="forma-site-nav__list">
          <li><a class="forma-site-nav__link" href="/" aria-current="page">Overview</a></li>
          <li><a class="forma-site-nav__link" href="/docs/">Documentation</a></li>
          <li><a class="forma-site-nav__link" data-forma-variant="action" href="/start/">Get started</a></li>
        </ul>
      </nav>
    </div>
  </header>
  <main class="forma-site__main" id="main-content" tabindex="-1">
    <section class="forma-hero" aria-labelledby="hero-title">
      <div class="forma-hero__content">
        <p class="forma-eyebrow">Product</p>
        <h1 class="forma-hero__title" id="hero-title">One clear promise</h1>
        <p class="forma-lead">What it does and for whom.</p>
        <div class="forma-actions"><a class="forma-button" data-forma-variant="primary" href="/start/">Get started</a></div>
      </div>
    </section>
  </main>
  <footer class="forma-site-footer" data-forma-tone="inverse">
    <div class="forma-site-footer__inner">
      <p class="forma-site-footer__note"><span>&copy; 2026 Example Organization</span></p>
    </div>
  </footer>
</body>
</html>
```

### Callouts in long-form content

Most prose needs no callout. Use `.forma-callout` (`patterns/callout.html`) only when a reader must notice one of four kinds of supporting material:

| `data-forma-callout` | Use for | Element |
|---|---|---|
| `note` | Context the reader can skip without losing the argument | `aside` |
| `caution` | A consequence to weigh before acting on the surrounding text | `aside` |
| `evidence` | Quoted or cited source material, with its source | `figure` holding a `blockquote` and a `figcaption` |
| `decision` | A settled outcome that later sections refer to | `aside` |

Every callout starts with a visible `.forma-callout__label` naming its kind, and the container is named by that label (`aria-labelledby`). The label is the primary cue. Each kind also has its own rule pattern, so kinds stay distinct in grayscale, forced colors and print. Do not use a callout for decoration, pull quotes or ordinary emphasis: use `<strong>`, a `blockquote` or a heading instead. Callouts have no runtime and no state. Static Markdown pipelines can emit the markup directly.

## 2. How do I consume Forma?

Pin a release. Never copy Forma CSS into the site, and never link Forma `main`
or the Forma documentation site.

```bash
# once, and on every deliberate upgrade: download, verify against the
# release checksums, and record each file's sha256 in forma.lock
curl -fsSLO https://raw.githubusercontent.com/kemiller2002/forma/v0.3.0/actions/install-presentation/install.sh
bash install.sh --update

# every build: install exactly what the lock pins, or fail
bash install.sh
```

The installer needs only bash, curl, and `sha256sum` or `shasum`. It does not
need Node, npm, or .NET.

- `--source DIR` installs from a local directory, such as a Forma checkout's
  `dist/marketing` or an offline cache.
- Commit `forma.lock`. Do not commit the installed `assets/forma/` directory:
  add it to `.gitignore`, because the build recreates it.

Sites that already use npm may instead depend on
`@echelon-foundry/design-system` at an exact version and copy
`node_modules/@echelon-foundry/design-system/dist/marketing/forma-marketing.css`
at build time. The lock file is still the recommended record, because it
carries the checksum.

Available assets for each release:

| Asset | Use |
|---|---|
| `forma-marketing.css` | The brand-neutral marketing layer. An organization theme, if any, loads after it |
| `forma-all.css` | Adds Forma application patterns (data grid, dense ledger, status lozenge, provenance trail); load it instead of `forma-marketing.css` when needed |
| `forma-marketing.manifest.json`, `forma-marketing.sha256` | Version, sizes, sources, checksums |

## 3. How do I apply an organization's marketing theme?

Load `forma-marketing.css`, then the organization's theme stylesheet from its
own pinned package (Forma ships none). Without a theme, the neutral Forma
defaults apply. On `<html>`:

- Set `data-forma-theme="light"` for a light-only site.
- Set `data-forma-theme="dark"` for the validated dark map.
- Omit the attribute to follow the operating-system preference.

For product identity, retarget only the identity tokens, and only to other
Forma tokens:

```css
/* site.css */
:root {
  --forma-color-accent-primary: var(--forma-color-accent-secondary);
  --forma-color-accent-hover: var(--forma-color-text-primary);
}
```

A product that needs its own validated palette gets a brand manifest in Forma
(`brands/<product>.brand.json`), including the optional extended roles.
Apply it with `data-forma-brand="<product>"`. The BrandCompiler rejects any role
pair below its contrast floor.

## 4. How do I use the Marketing Shell?

`.forma-site` on `<body>` is the shell. Its structure is fixed and appears in
this order:

1. `.forma-skip-link`: first element in `<body>`, targeting `#main-content`.
2. `header.forma-site-header` > `.forma-site-header__inner`, containing:
   - `.forma-site-header__identity`: brand link with `__mark` (`aria-hidden`)
     and `__name`, plus an optional `__tagline`;
   - `nav.forma-site-nav[aria-label="Primary"]` > `ul.forma-site-nav__list` >
     `a.forma-site-nav__link`. Mark exactly one link `aria-current="page"`. At
     most one link uses `data-forma-variant="action"`.
3. `main.forma-site__main#main-content[tabindex="-1"]`, which holds:
   - `section.forma-hero` first;
   - `section.forma-section` regions;
   - `.forma-cta`.
4. `footer.forma-site-footer[data-forma-tone="inverse"]` > `.forma-site-footer__inner`.

Page layouts compose inside `main`:

- **Marketing page**: hero → sections → CTA. Specimen: `index.html`.
- **Product page**: hero with status badges and facts → capability card grid
  → install steps with a code sample → CTA. Specimen: `product.html`.
- **Documentation page**: `.forma-doc` with `__nav`, `__content` (with
  `.forma-prose`), and optional `__aside`. Specimen: `docs.html`.

Set `data-forma-layout="marketing|product|documentation"` on `.forma-site` to
declare the page type.

Surfaces use `data-forma-tone="surface|elevated|inverse"`. Text, link, label,
and rule colors adapt to the tone automatically. Use one
`data-forma-variant="primary"` action per hero, section, or CTA.

## 5. What belongs in local CSS?

Only the following:

- identity imagery, such as illustrations or a product mark image;
- presentation unique to the site's content, such as charts, diagrams,
  interactive demos, and bespoke figures;
- identity retargets from the allowlist (question 3);
- experiments pending promotion, each preceded by
  `/* forma-exception: GAP-MKT-xx or issue URL */`.

Keep local class names out of the `forma-` namespace. Use a site prefix such as
`dk-` or `site-`.

## 6. What must go back into Forma?

Anything another site could use, and anything that would otherwise
redefine:

- global typography, containers, or the spacing scale;
- buttons, navigation, cards, or the footer;
- the responsive system, focus behavior, or section composition.

The policy checker rejects these locally. Record the need as a Forma
capability gap and add it to Forma. Once it is released, upgrade and delete
the local rule.

## 7. How do I upgrade Forma?

1. Read the release notes for every version between yours and the target.
2. Edit `forma.lock` to the new version, then run `bash install.sh --update`.
   The installer verifies the downloads against the release checksums and
   records the new hashes.
3. Run the site checks (question 8). Review changed patterns you use:
   `patterns/*.html` at the new tag.
4. Commit `forma.lock`, plus any markup changes the release notes require, as
   one reviewable change.

Nothing upgrades automatically. Forma `main` never reaches a site.

## 8. How do I test the site before deployment?

Run these checks in CI:

- **Install:** `bash install.sh`. It fails on any drift.
- **Local-CSS policy:** use `kemiller2002/forma/actions/check-site-css@v<version>`
  with `files: site.css`, or run
  `dotnet run --project <forma>/tools/SiteCssPolicy/SiteCssPolicy.fsproj -- --forma assets/forma/forma-marketing.css site.css`.
- **Structure:** at least the checks in Forma's
  `tests/marketing-structure.test.mjs`:
  - skip link first;
  - one `h1`;
  - no skipped heading levels;
  - one `aria-current` link;
  - at most one primary action per region;
  - only Forma or declared local classes.
- **Browser:** at 1280, 768, 390, and 320 px, check for:
  - no horizontal overflow;
  - axe WCAG 2.2 A/AA clean;
  - visible keyboard focus;
  - 44px targets.

  Forma's `tests/browser/marketing.spec.mjs` is the template.

## 9. How does GitHub Pages deployment obtain the correct Forma assets?

The deploy workflow installs exactly what the lock pins, before the site
build:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: kemiller2002/forma/actions/install-presentation@v0.3.0
        with:
          lock: forma.lock
      - uses: kemiller2002/forma/actions/check-site-css@v0.3.0
        with:
          files: site.css
      - run: ./build.sh            # the site's own build; copies assets/forma into the output
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
```

Keep the `@v<version>` of the Forma actions equal to the version in
`forma.lock`. The download URL is the immutable release asset
`https://github.com/kemiller2002/forma/releases/download/v<version>/<asset>`.

## 10. How do I propose a new reusable marketing component?

1. Check first whether an existing component, tone, variant, or layout can
   already express it:
   - `patterns/`
   - `requirements/COMPONENT-CATALOG.md`
   - `catalog/layouts.json`
2. Open a Forma issue that describes the relationship it must preserve, not
   just its appearance:
   - which sites need it;
   - narrow-screen behavior;
   - accessibility semantics;
   - Visual Engineering basis.
3. Add it in Forma:
   - pattern HTML;
   - CSS in `src/marketing/` using role tokens only;
   - a catalog entry in `catalog/components/<slug>.mjs` (see `docs/CATALOG-AUTHORING.md`);
   - tests (structure, browser, axe, 320 px);
   - a gap entry closed in `requirements/MARKETING-PRESENTATION.md`.
4. Release it. The sites then upgrade (question 7) and remove any local
   stand-in.
