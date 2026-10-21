# Layout guide: conventional CSS

You build the layout with standard CSS: Grid, Flexbox, padding, margins,
gaps, sizing, positioning and media or container queries. You decide every
layout value yourself.

## What is provided

- `assets/base.css` (already linked by the starter page). It sets typography,
  colors, form-control and button appearance, focus rings, and resets default
  margins. It makes no layout decisions. Useful hooks it styles:
  - `.surface` gives a panel a white background, border and rounded corners
    (no padding; you choose clearance).
  - `button.secondary` is the secondary button style.
  - `.error` / `[role=alert]` style validation messages.
- `assets/placeholder.svg` for illustrations.

## How to write the layout

- Put all your CSS in one `<style>` element inside `index.html`.
- Use any CSS you like. Prefer relative units (`rem`) so the layout follows
  the user's text size.
- Wide content such as a table may scroll inside its own region
  (`overflow-x: auto`, with `tabindex="0"` and an accessible name) instead of
  widening the page.
- You are responsible for: padding inside panels, spacing between elements,
  alignment of peers, grouping, responsive behavior at every width from 320
  to 1440 CSS px, sizing, and keeping content inside its containers.

## Example

```html
<section class="surface card">
  <h2 data-rlp="title">Title</h2>
  <p data-rlp="text">Text</p>
</section>
<style>
  .card { padding: 1.25rem; display: grid; gap: 0.5rem; }
  @media (min-width: 48rem) { .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; } }
</style>
```
