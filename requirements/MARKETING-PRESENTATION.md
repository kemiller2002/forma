# Marketing Presentation Requirements

Status: canonical Forma requirement (GH-49)
Reference specimen: Echelon Foundry site at `cb638dc` (EV-DESIGN-2026-0014)
Visual Engineering trace: EV-DESIGN-2026-0015
Distribution decision: `docs/decisions/ADR-0003-marketing-presentation-distribution.md`
Consumer guide: `docs/MARKETING-SITES.md`

## Purpose

Forma is the reusable presentation and layout system for every Echelon
marketing website. Sites consume a pinned Forma release and supply content.
They do not copy, fork, or recreate Forma's visual language.

```text
Visual Engineering -> Forma -> Echelon Marketing Theme -> MarketingShell -> sites
```

The Echelon Foundry main site is the visual reference, not a dependency. It
becomes one consumer among the others.

## MKT-OWN: Ownership model

| Layer | Owns | Source | Must not contain |
|---|---|---|---|
| Forma foundations | Reset, box sizing, typography mechanics, link and focus treatment, surface tones, reduced motion, forced colors | `src/styles/foundations.css`, `src/marketing/foundations.css` | Brand values, product names |
| Forma components | Skip link, site header and navigation, eyebrow/lead/statement, buttons, badges, cards and card grids, facts, section heading, entry index, steps, CTA, prose, code, site footer | `src/marketing/components.css`, `patterns/*.html` | Page placement, site names, arbitrary style switches |
| Forma layouts | MarketingShell frame, containers, section rhythm, split, hero, documentation layout | `src/marketing/layouts.css` | Content |
| Role contract | Brand-neutral defaults for every role token | `src/marketing/roles.css` | Literal colors |
| Echelon Marketing Theme | Echelon values for every role (light and dark), backdrop hook | `themes/echelon/marketing.tokens.json`, `themes/echelon/marketing.css` | Component rules, raw hex (aliases only) |
| MarketingShell | Common frame and behavior | `.ef-site` and the `marketing-shell` pattern | Site content |
| Site | Content, imagery, font delivery, identity retargets, unique presentation | Site repository | Anything listed above |

- **MKT-OWN-1.** Generic foundations, components, and layouts read only role
  tokens and core semantic tokens. Tested: no literal colors in `roles.css`;
  patterns contain no brand names.
- **MKT-OWN-2.** Marketing foundations apply only inside `.ef-site`, so an
  application loading `all.css` is not restyled.
- **MKT-OWN-3.** A product may differ from Echelon through:
  - content and imagery;
  - the identity allowlist (MKT-LOCAL-2);
  - a Forma brand manifest (`brands/*.brand.json`, scoped with
    `data-ef-brand`), when it needs a validated palette of its own.

  It must not do so through a separate component stylesheet.

## Layouts

| Layout | Specimen | Materially different because |
|---|---|---|
| Marketing page (`LAY-MARKETING-PAGE`) | `catalog/specimens/LAY-MARKETING-PAGE.html`, `examples/echelon-marketing-site/index.html` | Base anatomy: hero promise, sections, proof, closing CTA |
| Product page (`LAY-PRODUCT-PAGE`) | `.../LAY-PRODUCT-PAGE.html`, `examples/.../product.html` | Adds release status and version facts, install steps, and a technical sample to the recognition path |
| Documentation page (`LAY-DOCUMENTATION-PAGE`) | `.../LAY-DOCUMENTATION-PAGE.html`, `examples/.../docs.html` | Three-region structure (navigation, article, outline) with its own regrouping |

**A Landing page is not created.** A single-offer page is the Marketing page
with fewer sections, and its relationships do not differ. Product names never
become layout names.

## MKT-TOK: Token contract

Tokens reach the browser as CSS custom properties. They are compiled from DTCG
JSON by `tools/TokenCompiler` (F#).

- The Echelon theme compiles with `--reference tokens/echelon.tokens.json`.
- Every theme value aliases a core primitive.
- The compiler fails the build when a role pair misses its contrast floor.

### Color roles

| Requirement term | Token | Contrast gate (compiler) |
|---|---|---|
| Page background | `--ef-color-surface-primary` | — |
| Surface | `--ef-color-surface-secondary` | text on secondary surface ≥ 4.5 |
| Elevated surface | `--ef-color-surface-elevated` | primary text ≥ 4.5 |
| Primary text | `--ef-color-text-primary` | ≥ 4.5 on page |
| Secondary text | `--ef-color-text-secondary` | ≥ 4.5 on page |
| Muted text | `--ef-color-text-muted` | ≥ 4.5 on page (never lowered below AA) |
| Accent | `--ef-color-accent-primary`, `--ef-color-accent-secondary` | ≥ 4.5 on page |
| Accent hover | `--ef-color-accent-hover` | ≥ 4.5 on page |
| Border | `--ef-color-border-subtle` | Decorative; never the only boundary cue |
| Strong border | `--ef-color-border-functional` | — |
| Success, warning, danger, informational | `--ef-color-status-{success,warning,danger,info}` | ≥ 4.5 on page; always paired with text |
| Focus | `--ef-color-focus-ring`, `--ef-color-focus-gap` | ring ≥ 3 on page |
| Inverse | `--ef-color-surface-inverse`, `--ef-color-text-inverse` | ≥ 4.5 |

Surface tones (`data-ef-tone="page|surface|elevated|inverse"`) map these to
`--ef-tone-*` context variables. They use only validated pairs; for example,
links on the secondary surface fall back to primary text, because bronze on
stone is below 4.5:1.

### Typography, layout, shape, and effect roles

| Family | Tokens |
|---|---|
| Families | `--ef-type-family-{body,display,mono}` |
| Sizes | `--ef-type-size-{label,small,body,lead,h1,h2,h3,h4,statement}` |
| Line heights | `--ef-type-leading-{body,lead,heading,snug}` |
| Weights | `--ef-type-weight-{body,strong,heading,label,nav}` |
| Letter spacing | `--ef-type-tracking-{display,label,body}` |
| Layout | `--ef-layout-{measure,measure-narrow,width-narrow,width-standard,width-wide,width-max,gutter,section-space,block-space,grid-gap,stack-space,target-min,header-offset,card-min,fact-min}` |
| Shape | `--ef-shape-{radius,border-width,border-width-accent}` |
| Effects | `--ef-effect-{shadow-raised,transition-duration,transition-easing}` |
| Focus | `--ef-focus-{ring-width,ring-offset,halo-width}` |

The core primitive scales behind them live in `tokens/echelon.tokens.json`:

- `font-size`, `font-size-fluid`, `line-height`, `font-weight`, `letter-spacing`
- `size`, `size-fluid`
- `spacing` 1–10
- `border-width`, `focus`, `shadow`

The compiler supports two new types:

- `fluidDimension`: rendered as `clamp()`, and the preferred value always
  keeps a rem term;
- `shadow`: DTCG composite shadows.

## MKT-DIST and MKT-VER: Distribution and versioning

See ADR-0003.

- **MKT-DIST-1.** Artifacts are single, self-contained CSS files (tested).
- **MKT-DIST-2.** Builds are deterministic (tested by building twice).
- **MKT-DIST-3.** Each release publishes the artifacts, a manifest, and
  checksums as flat release assets. The npm package carries the same files.
- **MKT-VER-1.** A site pins an exact version and a sha256 per asset in
  `forma.lock`. The installer refuses:
  - floating versions (exit 2);
  - changed files (exit 3);
  - missing assets (exit 4).
- **MKT-VER-2.** Upgrades are deliberate: change the version, run
  `install.sh --update`, review the release notes, run the site checks, and
  commit the lock.

## MKT-LOCAL: Local CSS policy

- **MKT-LOCAL-1.** A marketing site must not recreate a presentation capability
  Forma supplies. `tools/SiteCssPolicy` (F#; composite action
  `actions/check-site-css`) enforces this:

  | Code | Meaning |
  |---|---|
  | `FORMA-COMPONENT` | A selector restyles an `ef-*` class |
  | `GLOBAL-ELEMENT` | A selector restyles unqualified elements such as `body`, headings, `p`, `a`, `nav`, or `*` |
  | `TOKEN-OVERRIDE` | A declaration redefines an `--ef-*` token outside the identity allowlist |
  | `IDENTITY-VALUE` | An identity token is set to a literal instead of a Forma token |
  | `PALETTE-COPY` | A literal color equals a Forma palette value |

- **MKT-LOCAL-2.** Identity allowlist:
  - `--ef-color-accent-primary`, `--ef-color-accent-hover`, `--ef-color-accent-secondary`
  - `--ef-site-backdrop`, `--ef-site-backdrop-size`, `--ef-site-backdrop-opacity`

  Values must reference Forma tokens, so contrast stays validated. A rule that
  contains only allowlisted retargets may use any selector, such as `:root` or
  `[data-ef-layout="product"]`.
- **MKT-LOCAL-3.** Allowed local CSS:
  - identity-specific imagery;
  - content presentation unique to the site (charts, diagrams, demos);
  - intentional product differentiation through the allowlist;
  - experiments pending promotion.

  Each experiment is annotated
  `/* forma-exception: <gap id or issue> */`, which the checker counts and
  reports.
- **MKT-LOCAL-4.** The capability-gap process:

  ```text
  Site requirement
        |
  Can Forma express it? -- yes --> consume it
        | no
  Record GAP-MKT-* / issue in Forma --> add capability to Forma --> test --> release
        |
  (meanwhile) local rule with forma-exception annotation --> remove after upgrade
  ```

## MKT-A11Y: Accessibility built into the shared layer

| Requirement | Implementation | Test |
|---|---|---|
| Keyboard navigation and skip link | `.ef-skip-link` first in the shell; `main` has `tabindex="-1"` | `marketing.spec.mjs` skip-link test |
| Visible, unobscured focus | Tokenized ring and halo on every tone; card focus drawn on the card; sticky header gated | Focus-sweep test (outline ≥ 2px, never under the header) |
| Semantic content order | No CSS reordering; source-order specimens | Layout catalog order test; hero order test |
| Contrast-compatible themes | Compiler gates; tone pairs | axe WCAG 2.2 A/AA in light, dark, wide, and phone |
| Responsive text | rem sizes; fluid values with a rem term | Compiler test; 200% text test |
| Touch targets | Nav, brand, and buttons ≥ `--ef-layout-target-min` (2.75rem) | 44px target test at 390 and 320 |
| Reduced motion | Hover lift only under `no-preference`; transitions removed | Reduced-motion test |
| High zoom | No overflow at 320px (≈ 400% of 1280) or with 200% text | Containment and zoom tests |
| Narrow screens | Navigation wraps, brand name never hidden, documentation navigation compacts | Navigation and documentation tests |
| Forced colors | Borders on buttons, badges, tones, current nav | Forced-colors test |
| Text spacing (WCAG 1.4.12) | No fixed heights on text containers | Text-spacing test |
| Print | Navigation and backdrop removed, tones flattened | Print test |

## MKT-RESP: Responsive system and breakpoint register

Recomposition is content-driven: wrapping flex rows (header, hero, section
heading, CTA, footer) and auto-fit grids with minimums (cards, facts). Every
breakpoint that remains is listed here with its reason:

| Breakpoint | Where | Why it exists |
|---|---|---|
| `min-width: 40rem and min-height: 36rem` (media) | Sticky header, scroll padding | A sticky header on short or narrow viewports, or at high zoom, consumes reading space and can obscure focus (WCAG 2.4.11) |
| `min-width: 64rem and min-height: 36rem` (media) | Sticky documentation rails | Rails only stick where two columns exist and there is room |
| Container `ef-site-header < 56rem` | Hides the supplementary tagline | Keeps navigation to at most two lines; the brand name itself never hides |
| Container `ef-index < 56rem`, `< 28rem` | Entry index regrouping | Four disparate columns cannot degrade by a minimum item size |
| Container `ef-main ≥ 48rem`, `≥ 72rem`; `ef-doc < 48rem` | Documentation layout | Three regions with different roles regroup by the main region's width; compact navigation below 48rem |

## MKT-API: Component API philosophy

Components use:

- small primitives;
- semantic variants: `data-ef-variant="primary|action"`,
  `data-ef-tone`, `data-ef-status`, `data-ef-columns="2–5"`,
  `data-ef-width`;
- composition, never switch collections.

There are no site names in class names, no per-product component variants,
no style escape hatches beyond documented role tokens, and no `marketing` mode
flags on generic components (VE F-004).

## MKT-TEST: Required verification

| Area | Test file |
|---|---|
| Token integrity: required roles, theme values, alias-only theme, no unresolved references, contrast gate, determinism | `tests/marketing-tokens.test.mjs` |
| Distribution: artifacts, manifest, checksums, determinism, layers, self-containment, installer lifecycle, npm package | `tests/marketing-distribution.test.mjs` |
| Component structure and reference fixture: Forma-only classes, policy compliance, landmarks, headings, primary-action budget | `tests/marketing-structure.test.mjs` |
| Local-CSS policy rules | `tests/site-css-policy.test.mjs` |
| Responsive, keyboard, focus, zoom, motion, forced colors, print, theme application, axe | `tests/browser/marketing.spec.mjs` |
| Specimen containment and axe for the new layout families; brand-neutral layer under every implemented app theme | `tests/browser/layout-catalog.spec.mjs`, `tests/browser/theme-layout-matrix.spec.mjs` |
| Every marketing pattern at 320 and 390 px in the generated documentation site | `tests/site-browser/mobile.spec.mjs` |

## Visual Engineering trace

EV-DESIGN-2026-0015 holds the full table. In summary:

- LAW-COMP-001–007, 030, 031, 036;
- MODEL-COMP-002;
- EX-VE-TYP-001;
- REP-VE-COL-001;
- UI-FOUNDATIONS and UI-DECISION-CHECKLIST;
- HY-BEAUTY-002/010/012/015;
- F-004 / A-011.

Each maps to a token, component, layout rule, or test listed above.

## Capability gaps

| ID | Gap | Owner / next step |
|---|---|---|
| GAP-MKT-01 | Partially closed. Brand manifests now accept optional extended roles (`surface.elevated`, `text.muted`, `accent.hover`, `status.*`), which the BrandCompiler contrast-gates. Compiled brand CSS still ships only in the npm package (`dist/brands/*`), not as a flat release asset | Add brand stylesheets to the release bundle when the first product needs a full palette of its own |
| GAP-MKT-02 | Webfont files are not packaged. Sites load Newsreader, Manrope, and IBM Plex Mono themselves; fallbacks are defined | Decide self-hosting and licensing; add an optional font artifact |
| GAP-MKT-03 | No scrim or media-hero primitive. Text over imagery cannot be contrast-verified by token pairs (VE REP-VE-COL-001) | Add `ef-hero` media variant with a mandatory scrim when a site needs it |
| GAP-MKT-04 | Emphasis budget and first-glance hierarchy are enforced only by the fixture's structural test, not for sites | Offer the one-primary check as a reusable site test |
| GAP-MKT-05 | Marketing-tone data and comparison tables (Dokimos, Ordo, Limen) | Verify `dense-ledger` and `data-grid` inside `.ef-site` tones, or add a marketing table |
| GAP-MKT-06 | Build-time chart or diagram figure with a data-table companion (Dokimos, Ordo, Praxis) | New `ef-figure` contract |
| GAP-MKT-07 | Provenance and citation labels for public pages (Dokimos, Ordo) | Adapt `provenance-trail` to marketing tones |
| GAP-MKT-08 | Status tones with glyphs. `ef-badge[data-ef-status]` has a colored edge only | Add optional glyph slot |
| GAP-MKT-09 | Syntax-highlight token colors for `.ef-code` (Limen) | Add validated code token roles |
| GAP-MKT-10 | Navigation with more than about 7 destinations. Wrapping becomes three or more lines | Native `<details>` compact-navigation variant |
| GAP-MKT-11 | Five research sites use the external `research-publisher` generator with its own CSS | Migrate `research-publisher` to emit Forma classes |
| GAP-MKT-12 | `catalog/themes.json` lacks an acceptance-context field (marketing vs application), per VE theme protocol | Add `acceptedContexts` |
| GAP-MKT-13 | Visual Engineering context is not installed in Forma (`.visual-engineering/` absent; `verify` not run in GH-49) | Run `npx @echelon-foundry/visual-engineering init` in a permitted environment |
| GAP-MKT-14 | Core Forma defaults (light theme, foundation fallbacks) are the Echelon palette, so the core is not brand-neutral. The marketing layer is | Consider a neutral core default in a future major version |
