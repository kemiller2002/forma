# Feature Manifest: Marketing presentation

## Purpose

Brand-neutral foundations, components, and layouts for Echelon marketing,
product, and documentation websites (GH-49).

## Ownership

- State, including presentation state: CSS only. Native states (`:hover`,
  `:focus-visible`, `aria-current`) and declarative attributes (`data-ef-tone`,
  `data-ef-variant`, `data-ef-columns`, `data-ef-status`, `data-ef-width`,
  `data-ef-layout`).
- Transitions, commands, messages: none.
- Invariants and guards:
  - only role and core semantic tokens;
  - marketing foundations scoped to `.ef-site`;
  - contrast-safe surface tones;
  - no CSS reordering;
  - 44 px targets;
  - visible focus.
- Capabilities and authority: styling only. Content, routing, and behavior
  belong to the site.
- Effects: none.

## Interfaces

- Inbound: core tokens (`dist/tokens.css`), role tokens (`roles.css`), themes
  (`themes/*`).
- Outbound: `ef-*` classes documented in `patterns/` and the MarketingShell
  (`.ef-site`).

## Tests and verification

- `tests/marketing-*.test.mjs`
- `tests/site-css-policy.test.mjs`
- `tests/browser/marketing.spec.mjs`
- layout catalog and theme-matrix specs
- site mobile spec

## Dependencies

- Allowed: core tokens and foundations.
- Not allowed: application components, brand values.

## Modification boundaries

- Normal: `src/marketing/**`, `patterns/{marketing-shell,site-header,…}.html`.
- Escalation required:
  - removing or renaming a class or token (breaking; ADR-0003);
  - adding a breakpoint (record it in `requirements/MARKETING-PRESENTATION.md` MKT-RESP).

## Maintenance

- Owner: Forma.
- Last checked against implementation: 2026-09-28.
- Known gaps: GAP-MKT-01 to GAP-MKT-14 in `requirements/MARKETING-PRESENTATION.md`.
