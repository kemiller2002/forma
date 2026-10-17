# Semantic color contract

Forma 0.9.0 publishes its machine-readable color vocabulary at
`contracts/color-contract.json`. The file is generated from the token source,
shipped brand manifests, and `package.json`; consumers must use the contract
from the exact Forma version they pin. The manifest separates public
`--ef-color-*` properties from internal component variables, records every
theme and shipped brand value, and declares supported semantic pairings.

Validate application CSS without copying Forma CSS:

```bash
npx forma-color validate src/**/*.css
```

The programmatic API is exported as
`@echelon-foundry/design-system/color-contract`. `validateCssColorReferences`
reports the source file, line, column, unsupported name, and supported role.
Public `--ef-color-*` references and reserved internal color-related prefixes
are governed; other Forma APIs keep their own contracts. Application variables
such as `--summa-*` are deliberately ignored. Internal variables reported by
the validator are not consumer APIs even when they appear in compiled CSS.

## Fallback policy

An unknown `--ef-*` name is invalid even when `var()` supplies a literal
fallback. For a known public color token, a six-digit literal fallback is
allowed only when it exactly repeats that release's light-theme value. This
narrow exception supports loading a standalone Forma layer; it is not a way to
invent a brand or semantic value. Prefer no literal fallback when the complete
Forma stylesheet is loaded.

## Supported pairings

The manifest is the canonical exhaustive table. In summary:

| Meaning | Foreground | Surface or boundary | Non-color requirement |
| --- | --- | --- | --- |
| Primary action | `text-inverse` | `surface-inverse` | visible label and native action semantics |
| Secondary action | `text-primary` | `surface-primary`, `border-functional` | visible label and boundary |
| Link | `accent-primary` | `surface-primary` | underline or link context; Forma re-pairs links on secondary surfaces |
| Selection/current | `text-inverse` | `surface-inverse` | native checked/selected state or `aria-current` |
| Notice/pending/unknown | `status-info` | `surface-primary` | explicit state text plus glyph, border, or accessible name |
| Warning | `status-warning` | `surface-primary` | explicit state text plus glyph, border, or accessible name |
| Danger | `status-danger` | `surface-primary` | explicit state text plus glyph, border, or accessible name |
| Success | `status-success` | `surface-primary` | explicit state text plus glyph, border, or accessible name |
| Disabled | `text-primary` | `surface-secondary`, dashed `border-functional` | native `disabled`; opacity is supplemental |
| Focus | `focus-ring` | effective rendered surface, separated by `focus-gap` | keyboard-visible outline geometry |

Every shipped theme and brand provides the four status roles. Each status
foreground is contrast-gated at 4.5:1 on `surface-primary`. In forced colors,
foreground and status roles project to `CanvasText`, surfaces to `Canvas`, and
selection to `Highlight`/`HighlightText` where a component owns selection.
Derived `color-mix()` and translucent colors must be tested after browser
composition against their effective surface.

Categorical and ordinal data-visualization palettes are application-level
extensions, not Forma primitives. Applications must provide direct labels,
shapes, patterns, ordered position, or a text/table alternative and validate
the complete rendered palette. Grayscale and protan/deutan/tritan simulations
are useful regression screens, not proof of perception or aesthetic quality.

## Summa migration

The plausible-looking names below have never been public Forma tokens and must
remain refused, including against the 0.6.1 compatibility fixture:

| Unsupported name | Supported role | Required pairing |
| --- | --- | --- |
| `--ef-color-action-primary` | `--ef-color-surface-inverse` | `--ef-color-text-inverse` |
| `--ef-color-text-link` | `--ef-color-accent-primary` | `--ef-color-surface-primary` or Forma's secondary-surface link hook |
| `--ef-color-focus` | `--ef-color-focus-ring` | `--ef-color-focus-gap` on the effective surface |
| `--ef-color-text-danger` | `--ef-color-status-danger` | `--ef-color-surface-primary` plus explicit error text |

A valid token reference proves compatibility only. It does not prove that the
role is the right product-level palette, emphasis, hierarchy, or cultural
choice. Those decisions require contextual design review.
