# Feature Manifest: Echelon Marketing Theme

## Purpose

Apply Echelon Foundry brand decisions to Forma's generic marketing role
tokens without duplicating any component implementation.

## Ownership

| File | Contents | Constraints |
|---|---|---|
| `marketing.tokens.json` | DTCG role choices for light and dark themes | Every value is an alias to a core primitive; compiled with `tools/TokenCompiler --reference tokens/echelon.tokens.json`, which enforces contrast gates |
| `marketing.css` | Non-scalar hooks only (the drafting-grid backdrop) | Colors derived from tokens via `color-mix` |

## Tests and verification

`tests/marketing-tokens.test.mjs`:

- required roles;
- aliases only;
- determinism;
- contrast rejection;
- no unresolved references.

## Modification boundaries

- A brand decision changes a value here.
- A new capability goes into `src/marketing` first, never into the theme.

## Maintenance

- Owner: Forma with Echelon brand review.
- New palette values introduced by GH-49, flagged for brand review:
  - `parchment-light` (elevated surface);
  - `oxide-bronze-deep` and `oxide-bronze-pale` (hover);
  - `status-*` light and dark.
