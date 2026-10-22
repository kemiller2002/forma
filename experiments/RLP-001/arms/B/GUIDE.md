# Layout guide: Forma standardized primitives

You build the layout with Forma, Echelon Foundry's design system: layout
primitives, semantic groups and spacing tokens. Use the primitives first and
write custom CSS only where no primitive fits; custom spacing must use the
spacing tokens.

## What is provided

- `assets/forma.css`: Forma tokens, foundations and components (the starter
  page links it after `assets/base.css`, so Forma's styles take precedence).
- `assets/base.css`: shared typography, colors, control and button appearance.
  `button.secondary` is the secondary button style; `.error` styles messages.
- `assets/placeholder.svg` for illustrations.

## Spacing tokens

`--ef-primitive-spacing-1` 4px · `-2` 8px · `-3` 12px · `-4` 16px ·
`-5` 24px · `-6` 32px · `-7` 48px · `-8` 64px.

## Layout primitives

| Class | Behavior | Adjust with |
|---|---|---|
| `ef-stack` | Vertical sequence with consistent spacing | `--ef-stack-gap` |
| `ef-cluster` | Horizontal group that wraps, items centered | `--ef-cluster-gap` |
| `ef-grid` | Responsive equal-width columns (auto-fit) | `--ef-grid-min` (min column), `--ef-grid-gap` |
| `ef-switcher` | Two regions side by side, stacking below a threshold | children `ef-switcher__primary`, `ef-switcher__secondary`; `--ef-switcher-space` |
| `ef-sidebar` | Side column plus fluid content, stacking when narrow | children `ef-sidebar__side`, `ef-sidebar__content`; `--ef-sidebar-width` |
| `ef-actions` | Row of related actions that wraps | — |
| `ef-surface` | Panel with background, border and inner clearance | `--ef-surface-space` |
| `ef-measure` | Comfortable text line length | `--ef-measure` |
| `ef-bounded-overflow` | Scroll region for wide content (for example a table) that must not widen the page; give it `tabindex="0"` and an accessible name | — |

## Form primitives

| Class | Behavior |
|---|---|
| `ef-form` | Form container: vertical rhythm, max width (`--ef-form-gap`, `--ef-form-max`) |
| `ef-form-row` | Peer fields side by side; controls share a top edge; wraps by width (`--ef-form-row-min`) |
| `ef-field` | One field: label, optional `ef-field__description`, control, `ef-validation-message` |
| `ef-field__label` | Field label |

## How to write the layout

- Compose the page from these classes. Put any custom CSS in one `<style>`
  element inside `index.html`, using the spacing tokens for spacing values.
- Prefer relative units (`rem`).

## Example

```html
<section class="ef-surface ef-stack">
  <h2 data-rlp="title">Title</h2>
  <div class="ef-grid" style="--ef-grid-min: 14rem">
    <article class="ef-surface">…</article>
    <article class="ef-surface">…</article>
  </div>
</section>
```
