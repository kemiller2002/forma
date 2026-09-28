---
id: EV-DESIGN-2026-0014
title: Echelon Foundry marketing site as the reference visual language
research_area: design-system
evidence_type: primary
source_title: kemiller2002/echelon-foundry assets/css/style.css and src/templates
source_author: Echelon Foundry
source_uri: https://github.com/kemiller2002/echelon-foundry/blob/cb638dc0309302f52d2a8c9ab6ed617a171bf2b3/assets/css/style.css
source_date: 2026-09-24
retrieved: 2026-09-28
created_by_agent: claude-code
confidence: high
supports: []
contradicts: []
related_theories: []
tags: [marketing, reference-implementation, tokens, layout, GH-49]
---

# Evidence Record

## Evidence summary

The Echelon Foundry marketing site at commit `cb638dc` is the reference
specimen for Forma's marketing presentation (GH-49). Its visual language comes
from one 190-line stylesheet (`assets/css/style.css`), three templates
(`src/templates/{layout,header,footer}.html`), and page fragments rendered by
`build.js`. This record catalogs that language, classifies each
characteristic by owner, and lists the defects found. Forma reproduces the
characteristics through shared contracts, not by copying the stylesheet.

## Exact claim supported or contradicted

The reference language can be expressed as:

1. brand-neutral Forma foundations, components, and layouts driven by
   semantic role tokens;
2. an Echelon theme that supplies those tokens;
3. a very small amount of site-specific CSS.

The reference stylesheet mixes all three layers, hard-codes values, and has
accessibility defects that the shared layer must not inherit.

## Source provenance

Primary source, read directly from the repository at the commit above and
rendered locally with Chromium at 1280 and 390 CSS px for comparison. The
screenshots were taken during GH-49 but not retained. The comparison is
reproducible from `examples/echelon-marketing-site`.

## Catalog and classification

Owner key:

- **F**: Forma foundation
- **C**: Forma component
- **L**: Forma layout
- **T**: Echelon theme decision
- **S**: site-specific content or presentation

| Characteristic | Reference implementation | Owner | Forma expression |
|---|---|---|---|
| Reset / box sizing | `*, *::before, *::after { box-sizing }`, `body { margin: 0 }` | F | `foundations.css` (core) |
| Page background | `--ef-surface-primary` (parchment) | T | `--ef-color-surface-primary` in the Echelon theme |
| Background texture | `body::before`, 48px grid lines at 6% alpha, opacity .18 | T (hook F) | Generic `.ef-site::before` hook; the Echelon theme sets `--ef-site-backdrop*` from tokens via `color-mix` |
| Font stacks | Newsreader display, Manrope body, IBM Plex Mono | T | `--ef-type-family-*` → core font primitives |
| Webfont delivery | Google Fonts `<link>` in the layout template | S | Stays site-owned (GAP-MKT-02) |
| Body size and line height | 1rem, 1.65 | T | `--ef-type-size-body`, `--ef-type-leading-body` |
| Heading hierarchy | h1 `clamp(3.5rem, 8vw, 7.4rem)`, h2 `clamp(2.25rem, 4.8vw, 4.6rem)`, h3 1.2rem; display tracking −.035em; line height .98 | T (scale F) | Fluid primitives with a rem term; theme maps h1/h2/h3/statement |
| Text widths | h1 12ch, h2 16ch, lead 62ch, case body 72ch | F | `--ef-layout-measure(-narrow)`; heading measures in marketing foundations |
| Color tokens | 8-color palette plus semantic roles in `:root` | T | Core primitives; theme semantic map (light and dark) |
| Semantic colors | text primary/heading/secondary/inverse; surfaces; accents; borders; focus | F (roles) / T (values) | Role contract plus extended roles (elevated, muted, hover, status) |
| Spacing scale | Ad-hoc rem values (.2 to 10rem) | F | Core spacing 1–10, fluid block/section space |
| Container widths | `min(1440px, 100%)` main and header | F / T | `--ef-layout-width-{narrow,standard,wide,max}` |
| Gutters | `clamp(1rem, 4vw, 4.5rem)` | T | `--ef-layout-gutter` |
| Breakpoints | 900px and 680px viewport media queries | F | Replaced by content-driven wrapping plus three justified breakpoints (see requirements) |
| Borders | 1px functional/decorative rules; 4–5px accent rules | F / T | `--ef-shape-border-width(-accent)` |
| Radii | None (square) | T | `--ef-shape-radius: 0` in theme; generic default small radius |
| Shadows | None | T | `--ef-effect-shadow-raised` used only on elevated tone |
| Navigation | Horizontal links, underline-on-hover, pill CTA | C | `.ef-site-nav` with `data-ef-variant="action"` |
| Mobile navigation | Wraps at 680px, brand text hidden, link padding shrinks | C | Wraps by content, keeps 44px targets, never hides the brand name |
| Hero | Two-column grid (1.6fr/.8fr), stacks at 900px | L | `.ef-hero` content/aside, flex-wrap with minimums |
| Section composition | `section` margin 5–10rem; `.section-heading` grid with rule | L / C | `.ef-section` rhythm; `.ef-section-heading` |
| Cards / panels | Stone cards in ruled grids (`.grid`, `.columns`, `.pillars`) | C | `.ef-card`, `.ef-card-grid[data-ef-columns]` |
| Feature sections | `.pillars` (5), `.columns` (auto-fit 17rem), `.grid` (2) | C | One card grid with a column cap and minimum size |
| Buttons | `.button`, `.primary`, `.ghost`, hover lift | C | `.ef-button[data-ef-variant]`; lift only without reduced motion |
| Links | Bronze, underlined | F | Tone-aware link color, always underlined in prose |
| Calls to action | `.cta-row`, closing section heading | C | `.ef-cta` with optional inverse tone |
| Badges / labels | `.chip`, `.tag`, `.list-inline li`, eyebrow mono labels | C | `.ef-badge`, `.ef-badge-list`, `.ef-eyebrow` |
| Technical presentation | None on the main site | C | `.ef-code` (needed by product and documentation pages) |
| Stats | `.stat-blocks` ruled 2-column grid | C | `.ef-facts` (description list) |
| Research rows | `.research-row` 4-column grid | C | `.ef-index` (container-query regrouping) |
| Method band | `.method-band` inverse grid with numbered list | C / L | `.ef-steps` inside an inverse-tone `.ef-split` section |
| Footer | Inverse band, flex, note row | C | `.ef-site-footer` with `data-ef-tone="inverse"` |
| Case study body | `.case-body` measure and heading rhythm | C | `.ef-prose` |
| Contact form | `.contact-form` fields | S / F | Core Forma form foundations; the form itself is site content |
| Skip link | `.skip-link` translate-in on focus | C | `.ef-skip-link` |
| Focus states | 3px parchment outline + 5px carbon halo | F / T | Tokenized ring, offset, and halo widths |
| Reduced motion | Disables smooth scroll and transitions | F | Core foundations plus marketing-scoped guard |
| Forced colors | Borders on inverse regions, chips | F | Extended to buttons, badges, current nav, statement rule |
| Print | None | F | Added: drop navigation and backdrop, flatten tones, show external URLs in prose |
| Dark/light | Light only (no dark rules) | T | Theme ships validated light and dark; reference pages pin `data-ef-theme="light"` |
| Page composition | Header → main (hero, sections) → footer | L | MarketingShell (`.ef-site`) plus Marketing/Product/Documentation layouts |
| Case-study data, copy, imagery, HelixNote card | Content | S | Stays in the site |

## Defects found in the reference (not carried into Forma)

1. At ≤680px, `.brand-link > span:last-child { display: none }` hides the only
   text in the home link while the "EF" mark is `aria-hidden`. The link loses
   its accessible name. Forma keeps the name visible and lets it wrap.
2. There is no current-page indication in the navigation (WCAG 2.4.8 support;
   VE LAW-COMP-005). Forma marks `aria-current` with a persistent rule.
3. Label text renders at .63–.66rem (about 10px). Forma's label floor is .75rem.
4. `.card-link` makes the entire card the link, so its accessible name is the
   full card text. Forma uses a stretched title link.
5. `.muted-link` is used in the footer template but defined nowhere.
6. The header background is a hard-coded `rgb(242 239 231 / .94)` that
   duplicates a token. Forma derives it with `color-mix` from the surface token.
7. The sticky header is unconditional. At high zoom or short viewports it
   consumes the reading area and can obscure focus (WCAG 2.4.11). Forma makes
   it sticky only with at least 40rem width and 36rem height.
8. Hover lift is not tied to reduced-motion preference. Only transitions are
   removed.
9. Viewport-only fluid type (`8vw` preferred values) does not scale with user
   font size between the clamp bounds. Forma's fluid values keep a rem term.
10. The palette contrast test (`test/color-contrast.test.js`) checks color
    pairs, not rendered tokens. Forma's F# token compiler now fails the build on
    any failing role pair, including status, hover, muted, and inverse text.

## Interpretation

Forma should own every row marked F, C, or L. The Echelon theme should own
only T rows, and only as token values or as hooks that token values fill.
After migration, the main site should keep only the S rows: content,
imagery, font delivery, and the contact form's content.

The reference implementation remains the visual specimen, not an upstream
dependency. It becomes a consumer.
