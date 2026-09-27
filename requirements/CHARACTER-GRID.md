# CharacterGrid Presentation Contract

## Purpose

CharacterGrid is Forma's reusable presentation contract for keyboard-first
interfaces laid out on a fixed grid of equal-width character cells: IBM
3270-style and 5250-style screens, DOS/text-mode and BBS-style screens,
terminal/TUI applications, and modern character-grid tools.

It is **not** a 3270 component. The IBM 3270 is the first reference profile
(`character-grid-3270`); nothing 3270-specific is part of the primitive.

## Source evidence

This contract implements relationships recorded by Visual Engineering (branch
`claude/terminal-character-grid-ui-zz0q4q`, kemiller2002/visual-engineering#21):

- `CN-VE-TCG-2026-6CA0` — abstraction boundary, invariants I-1…I-11, boundary
  rules B-1…B-8;
- `LAY-TERMINAL-CHARACTER-GRID` — layout catalog entry (content/layouts);
- `CN-VE-TCG-2026-F9F1` — SequentialReveal behavior;
- `EX-VE-TCG-2026-5437` — three-screen reference workflow validation and
  capability gaps GAP-TCG-01…10.

The installed `.visual-engineering` context (1.0.0, source commit `0be73c8`)
predates these records; they were read from the Visual Engineering branch.

## Ownership

| Concern | Owner |
| --- | --- |
| Grid geometry, cell placement, typography, color, boundaries, focus appearance, narrow-screen containment, reveal presentation | Forma |
| Native field state (`required`, `disabled`, `readonly`, value, validity) and `aria-invalid` | Native HTML rendered by the application |
| Mapping physical keys (F1–F24, Enter, Escape, Pause…) to actions; Enter/Clear/Reset processing; input inhibition; initial cursor field; screen transitions; starting, completing, and replaying a reveal | Consuming application / Limen |
| Whether a transition or action is legal | Ordo / application domain |

Forma adds no JavaScript, no WebAssembly, no registered custom elements, and
no hidden behavior for this family.

## Public contract

```html
<div class="ef-character-grid" data-ef-rows="24" data-ef-columns="80" data-ef-narrow="contained">
  <div class="ef-character-grid__viewport" role="region" aria-labelledby="screen-title" tabindex="0">
    <div class="ef-character-grid__surface">               <!-- or <form class="ef-character-grid__surface"> -->
      <h1 class="ef-character-grid__text" id="screen-title"
          data-ef-row="1" data-ef-col="33" data-ef-len="16">CUSTOMER INQUIRY</h1>
      <!-- more positioned runs, in row-major order -->
    </div>
  </div>
</div>
```

| Element / attribute | Meaning |
| --- | --- |
| `.ef-character-grid` | Grid scope and container-query container. |
| `data-ef-rows`, `data-ef-columns` | Geometry, integers. Supported up to 50 rows and 132 columns. |
| `data-ef-narrow` | `contained` (default) or `reflow`. |
| `.ef-character-grid__viewport` | The contained scroller. Required: `role="region"`, an accessible name (`aria-labelledby` the screen title), `tabindex="0"`. |
| `.ef-character-grid__surface` | The cell grid. Use `<form>` when the screen has editable fields, otherwise `<div>`. |
| `data-ef-row`, `data-ef-col` | 1-based origin cell of a run. |
| `data-ef-len` | Run length in cells. |
| `data-ef-height` | Run height in rows (default 1). |
| `.ef-character-grid__group` | Semantic container (`dl`, `div role="group"`, `section`, …) that spans the grid as a subgrid, so its children keep **absolute** coordinates. |
| `.ef-character-grid__text` | Protected text (labels, headings, prose). `data-ef-emphasis="intensified"` or `"muted"`. |
| `.ef-character-grid__value` | Protected value. `data-ef-align="end"` for amounts; `data-ef-state="missing"` for explicit missing text. |
| `.ef-character-grid__table` | A positioned run holding a `<table>` of repeated rows; `th[data-ef-len]` sets column widths; `table[data-ef-gutter]` sets the gap in cells (0–4, default 1). |

Coordinates are attributes, not inline `style`, so applications can keep a
strict `style-src` Content-Security-Policy. `tools/character-grid-css.mjs`
generates one rule per supported value that maps the attribute to a registered
custom property (`--ef-row`, `--ef-col`, `--ef-len`, `--ef-height`,
`--ef-gutter`); the layout rules read only those properties. The coordinate
properties are registered with `inherits: false`, so a run's position never
leaks to its descendants.

### Reference geometries

| Geometry | Status |
| --- | --- |
| 24 × 80 | Reference (IBM 3270 default, 5250 default). Exercised by `character-grid-3270` and the reference workflow. |
| 32 × 80 | Reference (IBM 3270 Model 3). Exercised by a 32 × 80 browser test. |
| 43 × 80, 27 × 132 | Supported by the generated rules; not separately exercised. |
| Any R × C with R ≤ 50, C ≤ 132 | Supported. The base pattern uses 8 × 40. |

## Rules

### Coordinates and bounds

- **CG-1 Geometry.** `data-ef-rows` and `data-ef-columns` are integers within
  the supported limits; `data-ef-narrow` is `contained` or `reflow`; the
  viewport has an accessible name.
- **CG-2 Complete coordinates.** Every run declares integer `data-ef-row`,
  `data-ef-col`, and `data-ef-len`.
- **CG-3 In bounds.** `1 ≤ row` and `row + height − 1 ≤ rows`; `col ≥ 1`.
- **CG-4 No row wrap.** `col + len − 1 ≤ columns`. Multi-line content is
  multiple runs, or one run with `data-ef-height`.

### Collisions, clipping, and overflow

- **CG-5 No collisions.** Two runs never share a cell. CSS cannot prevent a
  collision — the later run would paint over the earlier one — so collisions
  are authoring errors caught by the conformance check, never resolved by
  "last writer wins".
- **CG-7 Overflow is an error, not a clip.** Protected text longer than its
  run fails conformance. At runtime Forma never clips: runs use
  `overflow: visible`, so an over-length value stays readable and visibly
  wrong rather than silently truncated.
- Message regions whose text is produced at runtime (GAP-TCG-09) may reserve
  more than one row with `data-ef-height`; Forma wraps them within the run and
  never clips them. Whether to shorten a message is the application's content
  decision.

### Order

- **CG-6 Source order is row-major order.** Runs appear in ascending
  `(row − 1) × columns + col`. Reading order, focus order, and visual order are
  therefore the same sequence with no `tabindex` values; Tab and Shift+Tab
  follow row-major order natively.
- **CG-11** Positive `tabindex` is prohibited. The viewport uses
  `tabindex="0"` so the contained region is keyboard-scrollable.
- No CSS reordering is applied in any mode.

### Semantics

- **CG-9** Protected runs are never form controls. Use text elements; do not
  render protected values as `readonly` inputs (they are focusable and are
  announced as edit fields).
- **CG-10** No inline `style` attributes inside a grid.
- Semantic groupings use `.ef-character-grid__group` on the semantic element
  itself (`dl` with `dt`/`dd`, `div role="group"` with a name, `section` with a
  heading). Tables keep native table semantics.
- **CG-12** Table column widths (`th[data-ef-len]`) plus gutters fit the
  table run.

### Narrow screens

- **Contained (default).** The grid keeps its geometry inside the viewport,
  which scrolls horizontally when narrower than the grid. The page never
  scrolls horizontally. This follows WCAG 2.2 SC 1.4.10's exception for
  content that requires two-dimensional layout for usage or meaning; authors
  must be able to justify that the positions carry meaning.
- **Reflow (opt-in).** `data-ef-narrow="reflow"` linearizes runs in source
  order when the grid's container is narrower than 82 cells. Positions are
  not preserved; tables keep their own contained scroll. Use it for screens
  whose positions carry no meaning. For geometries wider than 80 columns the
  82-cell threshold still applies; between 82 and C + 2 cells the contained
  scroller is used.
- **Touch pitch.** Below 40rem viewport width, or on a coarse pointer, the row
  pitch grows to at least 2.75rem (44px) so fields and keys meet Forma's
  target-size guideline. Columns stay one `ch` wide, so positions are
  preserved.

### Zoom and text scaling

- The cell is `1ch` of the grid's monospaced face and the row pitch is a
  multiple of `1em`, so the grid scales with text size rather than viewport
  width. At 200 % text size positions still correspond exactly and the grid
  remains contained (browser-tested).
- **Known limitation (GAP-TCG-11).** WCAG 2.2 SC 1.4.12 text-spacing overrides
  (letter-spacing ≥ 0.12em) widen glyphs but not the `1ch` cell, so overridden
  text overflows its run and can overlap the next run. No CSS-only fix keeps a
  fixed character grid; `data-ef-narrow="reflow"` is the conforming
  alternative for screens that must support text-spacing overrides.

### Forced colors

The viewport border, table header underline, field boundaries, and focus
indicators use `CanvasText`/system colors so the structure survives forced
colors.

## Conformance checking

`tools/character-grid-conformance.mjs` checks CG-1 to CG-12 on any HTML file:

```bash
node tools/character-grid-conformance.mjs patterns/character-grid.html
```

`tests/character-grid.test.mjs` runs it over every canonical pattern that
contains a grid and proves each rule fails closed on a counterexample.
`tests/browser/character-grid.spec.mjs` verifies rendered geometry against
declared coordinates at 1280, 390, and 320 CSS px and at 200 % text size.

## Capability gaps

| Gap (from Visual Engineering) | Status in Forma |
| --- | --- |
| GAP-TCG-01 character-cell positioning | Closed by this contract. |
| GAP-TCG-05 named, focusable contained viewport | Closed by `.ef-character-grid__viewport`. |
| GAP-TCG-07 positioned repeated-row table | Closed by `.ef-character-grid__table`. |
| GAP-TCG-06 wide-glyph (two-cell) and right-to-left grids | Open. Forma does not assign two cells to wide glyphs. |
| GAP-TCG-11 text-spacing overrides vs fixed cells | New; open (see above). |
