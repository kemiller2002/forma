# Echelon marketing-site migration inventory

- Work item: GH-49
- Surveyed: 2026-09-28
- Method: read-only shallow clones of each candidate repository's default
  branch, plus the Echelon Foundry site at `cb638dc`.
- Line counts come from the site stylesheets at survey time. Duplicate and
  site-specific splits are estimates from reading each stylesheet section.

Forma target version: **0.3.0** (`forma-echelon-marketing.css`). This
inventory does not migrate any site. Each migration is its own work item in
the site's repository, performed under
[`MIGRATION-CONTRACT.md`](MIGRATION-CONTRACT.md).

## Summary

| Site | Repository / path | Build and deploy | Domain | Site CSS lines | Copies EF palette | Estimated duplicate lines | Difficulty | Order |
|---|---|---|---|---|---|---|---|---|
| **Dokimos** | `dokimos` `site/` | Node ESM `build.mjs` → Pages | dokimos.echelonfoundry.com | 449 | Yes (`--ef-*` verbatim) | ~190 | Medium | **1 (early target)** |
| Echelon Foundry | `echelon-foundry` | Node `build.js` → Pages | echelonfoundry.com | 190 | Is the reference | ~175 | Low | 2 |
| Ordo | `ordo` `site/` + `src/Ordo.Site` (F#) | .NET F# generator → Pages | ordo.echelonfoundry.com | 727 | Yes | ~430 | Medium | 3 |
| Limen | `limen` `site/` | F# WASM + TS build → Pages | kemiller2002.github.io/limen | 398 | Yes ("adapted from" EF) | ~190 | Medium | 4 |
| Folio docs | `folio` `site/` | Node `build-site.mjs` → Pages | none found | 763 (+294 demo) | Yes | ~400 | Medium | 5 |
| Praxis | `praxis` `site/` | Node `assemble.mjs` → Pages | kemiller2002.github.io/praxis | 1,823 | Yes (renamed `--parchment`) | ~560 | Medium–high | 6 |
| Echelon Culinary | `echelon-culinary` | React/vinext + Tailwind 4 → Pages | culinary.echelonfoundry.com | 1,882 | Yes (renamed `--paper`, `--burgundy`) | ~650 | High | 7 |
| Research sites ×5 | AI-, communication-, framework-, software-, visual-engineering | `research-publisher build` → Pages | {ai,communication,framework,software,visual}.echelonfoundry.com | Generated (~9 KB inline per page) | No (own palette) | All generated CSS | Medium, upstream | Via `research-publisher` (GAP-MKT-11) |
| HelixNote | `Helix-Note-Website` | Hand-written static, branch Pages | helixnote.com | 467 | No (separate dark brand) | ~150 structural | High / likely out of scope | Decide brand first |

- **Vigila and Tutela:** neither has a marketing site. `vigila/web` is an
  application UI that already imports Forma `all.css`.
- **Tutoris:** no repository, registry entry, or reference exists in any
  surveyed repository. It needs a site repository before it can be
  inventoried.
- **Registry:** `echelon-registry` lists only praxis, vigila, chrona, and
  summa as systems, with no site metadata.
- **No marketing site:** aegis, chrona, conditor, percepta, signal, strata,
  summa, tutela, vigila, echelon-registry.

Six sites copy the Echelon palette by hand in three token dialects, which is
about 2,400 lines of duplicated presentation CSS. None consumes Forma today.

## Per-site detail

### Dokimos (early migration target)

- **Current:** `site/assets/css/dokimos.css`, 449 lines:
  - lines 10–18: a verbatim copy of the Echelon palette;
  - lines 21–29: `--dk-*` extensions.

  Newsreader, Manrope, and Plex come from Google Fonts. The site is a
  hash-named single stylesheet built by `site/build.mjs`.
- **Duplicate (~190 lines):**

  | Lines | Content |
  |---|---|
  | 1–109 | Tokens, reset, typography, skip link |
  | 110–149 | Header and navigation |
  | 150–205 | Hero, buttons, section heading, prose, band |
  | 367–377 | Code |
  | 393–404 | Footer |
  | 405–449 | Generic responsive, motion, and print rules |

- **Forma already sufficient:**
  - tokens and theme;
  - MarketingShell;
  - hero, section heading, prose, buttons, code;
  - CTA (`.band`);
  - badges;
  - facts (`.readout-list`);
  - steps.
- **Remaining gaps:**
  - GAP-MKT-05: comparison tables with a current-row highlight;
  - GAP-MKT-06: build-time SVG trajectory charts with table companions;
  - GAP-MKT-07: provenance labels;
  - GAP-MKT-08: status tones with glyphs.

  The verdigris accent is covered by the identity allowlist.
- **Stays local:**
  - charts, readouts, provenance, tones, and data tables until Forma absorbs
    them;
  - pipeline, lifecycle, and drill-down figures;
  - brand mark;
  - graph-paper backdrop value through `--ef-site-backdrop`.
- **Obsolete after migration:** the palette copy, reset, typography, header,
  navigation, footer, hero, buttons, section heading, prose, code, and generic
  responsive rules.
- **Requirement revisions needed:** see the Dokimos section of the migration
  contract.

### Echelon Foundry (reference)

- **Current:** `assets/css/style.css`, 190 lines, all of it analysed in
  EV-DESIGN-2026-0014. It already pins `@echelon-foundry/design-system` 0.2.0
  as a dev dependency but does not use it.
- **Forma already sufficient:** everything except content. Class mapping:

  | Existing class | Forma replacement |
  |---|---|
  | `.site-header` / `.nav-shell` / `.brand*` | `.ef-site-header*` |
  | `nav a` / `.pill-link` | `.ef-site-nav__link[data-ef-variant="action"]` |
  | `.hero*` | `.ef-hero*` |
  | `.section-heading` | `.ef-section-heading` |
  | `.grid`, `.columns`, `.pillars` | `.ef-card-grid[data-ef-columns]` |
  | `.card` / `.card-link` | `.ef-card` / `.ef-card__link` |
  | `.stat-blocks` | `.ef-facts` |
  | `.research-row` | `.ef-index__item` |
  | `.method-band` | inverse `.ef-section` + `.ef-split` + `.ef-steps` |
  | `.chip`, `.tag`, `.list-inline` | `.ef-badge`, `.ef-badge-list` |
  | `.signal` | `.ef-statement` |
  | `.site-footer` | `.ef-site-footer` |
  | `.case-body` | `.ef-prose` |

- **Remaining gaps:** GAP-MKT-02 (fonts stay site-loaded). The contact form
  uses core Forma form foundations.
- **Stays local:** content, case-study data, images, font `<link>`, the
  contact script.
- **Obsolete:** the whole stylesheet, and `test/color-contrast.test.js` (the
  Forma compiler owns palette contrast).
- **Also fixes the reference defects** listed in EV-DESIGN-2026-0014, such as
  the brand link's accessible name at narrow widths.

### Ordo

- **Current:** `site/assets/css/ordo.css`, 727 lines, including an explicit
  "Echelon Foundry-aligned composition" block (428–588). The F# generator
  emits the CNAME.
- **Duplicate (~430 lines):**

  | Lines | Content |
  |---|---|
  | 1–234 | Tokens, reset, grid motif, header, footer, layout, card grids |
  | 305–320 | Badges |
  | 392–427 | Responsive |
  | 428–588 | Composition |
  | 589–622 | Code |

- **Forma already sufficient:** tokens, shell, hero, section heading, ruled
  card grid, badges, facts, code, prose, CTA, entry index.
- **Remaining gaps:** GAP-MKT-06 (diagrams), GAP-MKT-07 (citations),
  GAP-MKT-05 (evidence tables). A glossary definition list could use prose.
- **Stays local:** diagrams, metric citations, glossary, teaching-example
  panels.
- **Obsolete:** about 430 lines.
- **Note:** no Node is needed. Run the installer script in the Pages
  workflow before `dotnet run`.

### Limen

- **Current:** `site/assets/css/limen.css`, 398 lines. Lines 1–167 are the
  Echelon system.
- **Forma already sufficient:** tokens, shell, hero, sections, cards, buttons,
  code, badges, documentation layout (`docs.html`), CTA.
- **Remaining gaps:** GAP-MKT-09 (syntax colors), the boundary table
  (GAP-MKT-05), and interactive WASM demos, which are site behavior and stay
  local.
- **Stays local:** demo panels, event trace, quiz, state board.
- **Obsolete:** lines 1–167.

### Folio documentation site

- **Current:** `site/site.css`, 763 lines, with the palette copied, plus
  `demo.css` (294 lines, print-preview canvas).
- **Forma already sufficient:** shell, hero, facts, card grid, badges,
  buttons, documentation layout, prose, code.
- **Remaining gaps:** breadcrumbs, contract and property grids, example
  galleries. These are shared with the Forma documentation site itself (see
  below).
- **Stays local:** `demo.css`, print previews.
- **Obsolete:** about 400 lines.

### Praxis

- **Current:** one long page and `site.css` (1,823 lines, "Echelon Foundry
  visual language (PRAXIS-SITE-02)"), with tokens renamed.
- **Forma already sufficient:** tokens, shell, hero, section heading, buttons,
  badges, steps (execution chain, get started), facts, card grid, CTA, code.
- **Remaining gaps:**
  - GAP-MKT-06: chain and timeline diagrams;
  - the reconciliation comparison (GAP-MKT-05);
  - the claim or execution-record data component.
- **Stays local:** about 1,000–1,200 lines of narrative section styling. This
  should shrink as sections are rewritten onto Forma grids and steps.
- **Obsolete:** about 560 lines.

### Echelon Culinary

- **Current:** React, vinext, Tailwind 4, and shadcn. `app/globals.css` is
  1,882 lines, with the palette renamed. About 60 unused shadcn components.
- **Forma already sufficient:** tokens, shell, hero, section heading, card
  grid, CTA, steps, facts, entry index, buttons, prose.
- **Remaining gaps:**
  - coexistence with Tailwind preflight (load Forma after preflight, or drop
    Tailwind);
  - pull quotes (`.ef-statement` may suffice);
  - the state-flow figure (GAP-MKT-06).
- **Stays local:** service tickets, engagement and credibility ledgers,
  speaker and workshop grids.
- **Obsolete:** about 650 lines, plus the unused shadcn components.
- **Difficulty: high.** Different stack. Migrate last among the EF-palette
  sites.

### Research sites (AI, Communication, Framework, Software, Visual Engineering)

- **Current:** the `@echelon-foundry/research-publisher` generator inlines its
  own CSS (Fraunces and Source Sans, accent `#b7471a`). Versions differ:
  `^0.1.0` versus `github:…#main`, which is a floating dependency.
- **Forma already sufficient:** shell, entry index (research catalog), prose,
  code, documentation layout, badges.
- **Remaining gaps:** GAP-MKT-11. Migrate `research-publisher` once. Also:
  Pagefind search UI, facet pages, backlinks.
- **Also fix:** the floating `#main` dependency in three repositories.

### HelixNote

- **Current:** separate product brand (dark gradient, rounded cards, system
  fonts) on its own domain.
- **Decision required first:** either keep HelixNote as a separate brand, in
  which case it would need a Forma brand manifest plus GAP-MKT-01, or
  rebrand it into the Echelon family. Until that decision is made, HelixNote
  is out of scope.

### Forma documentation site (this repository)

- **Current:** `site/site.css` is 1,099 lines. Its first block is a copy of
  the Echelon palette, recorded as "from consulting-company/assets/css/style.css".
- **Forma already sufficient:** the site header, hero, card grid, and footer
  could consume `forma-echelon-marketing.css`.
- **Gap:** component-documentation specifics (example canvases, contract
  grids, breadcrumbs), shared with Folio.
- **Follow-up:** Forma should become its own consumer. Record it as a
  separate Forma work item.
