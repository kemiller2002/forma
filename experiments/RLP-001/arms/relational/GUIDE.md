# Layout guide: relational layout

You do not write layout CSS. You declare relationships between elements with
`data-rl-*` attributes, and the relational layout engine
(`assets/rlp/rlp.mjs`) computes padding, spacing, sizing, line breaks and
alignment from those relationships. It re-resolves automatically when the
viewport, text size or content changes.

## What is provided

- `assets/rlp/rlp.mjs`: the engine (the starter page already loads it).
- `assets/base.css`: shared typography, colors, control and button appearance.
  Elements with `data-rl="container"` automatically get a panel background
  and border. `button.secondary` is the secondary button style; `.error`
  styles messages.
- `assets/placeholder.svg` for illustrations.

## Vocabulary

Mark the layout root with `data-rl-root`. Inside it, every element is one of:

| Markup | Meaning |
|---|---|
| `data-rl="container"` | A visible boundary. Its children are kept inside with clearance. |
| `data-rl="group"` | A relationship without a boundary. |
| (no `data-rl`) | A leaf. Its own content flows normally inside the box the engine gives it. |

Wrap loose text in an element; text directly inside a group or container is
not placed.

### Attributes on a container or group

| Attribute | Values | Meaning |
|---|---|---|
| `data-rl-flow` | `column` (default), `row`, `wrap` | `row`: children on one line if they fit, otherwise stacked. `wrap`: as many per line as fit. |
| `data-rl-bond` | `tight`, `related` (default), `loose`, `section` | How strongly children belong together; tighter bonds sit closer. Use tighter bonds inside a group than between groups. |
| `data-rl-clearance` | `none`, `inset`, `surface` (default for containers), `spacious` | Space between the boundary and children. |
| `data-rl-clearance-block`, `data-rl-clearance-inline` | same values | Asymmetric clearance when it is justified. |
| `data-rl-align` | `start`, `center`, `end`, `stretch` (default) | Cross-axis alignment of children. |
| `data-rl-equal` | (present) | Children sharing a line get equal widths. |

### Attributes on any child

| Attribute | Values | Meaning |
|---|---|---|
| `data-rl-min` | length in `rem` or `px` | Comfortable minimum width; decides when siblings wrap. |
| `data-rl-max` | length in `rem` or `px` | Maximum width. |
| `data-rl-fill` | (present) | Takes the remaining space on its line. |
| `data-rl-size` | `content` | Keep content width instead of stretching. |
| `data-rl-anchor` | `end` | Pushed to the end of its line. |
| `data-rl-align-edge` | a name | Elements with the same name on the same line share their top edge. |
| `data-rl-scroll` | (present, on a leaf) | The leaf scrolls horizontally instead of forcing its content's width (for wide tables). Give it `tabindex="0"` and an accessible name. |

Reading order is document order; the engine never reorders content.

## Diagnostics

`window.__rlp.status` is `valid` or `invalid`, and `window.__rlp.diagnostics`
lists structured problems (for example unsatisfiable constraints). The
validator reports them.

## Example

```html
<main data-rl-root data-rl="group">
  <form data-rl="container" data-rl-bond="loose">
    <h1>Title</h1>
    <div data-rl="group" data-rl-flow="wrap">
      <div data-rl="group" data-rl-bond="tight" data-rl-min="14rem">
        <label for="a">First</label>
        <input id="a" data-rl-align-edge="control">
      </div>
      <div data-rl="group" data-rl-bond="tight" data-rl-min="14rem">
        <label for="b">Second</label>
        <input id="b" data-rl-align-edge="control">
      </div>
    </div>
    <div data-rl="group" data-rl-flow="row">
      <button class="secondary" data-rl-anchor="end">Cancel</button>
      <button>Save</button>
    </div>
  </form>
</main>
```
