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

## Protected text and editable fields

```html
<label class="ef-character-grid__label" for="acct" data-ef-row="3" data-ef-col="2" data-ef-len="16">Account<span class="ef-character-grid__leader" aria-hidden="true">  . . . :</span></label>
<input class="ef-character-grid__field" id="acct" name="account" type="text" inputmode="numeric"
       maxlength="12" required aria-describedby="acct-hint" data-ef-row="3" data-ef-col="20" data-ef-len="12">
<span class="ef-character-grid__text" id="acct-hint" data-ef-row="3" data-ef-col="34" data-ef-len="21">(required, 12 digits)</span>
<span class="ef-character-grid__value" data-ef-row="7" data-ef-col="20" data-ef-len="10">2014-03-11</span>
```

| Concern | Contract |
| --- | --- |
| Editable field | Native `<input class="ef-character-grid__field">` (or `select`), never a styled `div`. Tab/Shift+Tab, typing, selection, and form submission are native. |
| Capacity | `maxlength` equals `data-ef-len` (CG-8); the rendered width equals the declared cells. |
| Label | A preceding `<label for>` run (CG-8). Leader characters are wrapped in `.ef-character-grid__leader` with `aria-hidden="true"` so the accessible name is "Account", not "Account dot dot dot colon". |
| Hint / error | `aria-describedby` lists one or more IDs (hint and error together). An `aria-invalid="true"` field must reference its message (CG-8). |
| Required | Native `required`; cue: double underline. State the requirement in the label or hint text as well. |
| Invalid | `aria-invalid="true"` set by the application; cue: dashed box. Forma does not use `:invalid`, because validity policy is the application's. |
| Disabled | Native `disabled`; cue: dotted underline, muted text; removed from the Tab sequence natively. |
| Read-only | Native `readonly` **only** for genuine read-only form values the application reads back; cue: thin underline, no field surface. Otherwise use protected text. |
| Protected | `.ef-character-grid__text` / `.ef-character-grid__value` elements; never controls (CG-9); never focusable. |
| Focus | `:focus-visible` outline in `--ef-grid-focus`; `Highlight` in forced colors. Profiles may add a cursor treatment but may not remove the outline. |
| Initial focus | Which field receives focus when a screen appears (the 3270 "insert cursor") is application/Limen behavior; native `autofocus` is the only markup Forma needs. |

State cues differ in **shape** (solid, double, dashed box, dotted, thin), so
they survive grayscale, color-vision deficiency, and forced colors, where they
are rendered in `CanvasText`/`GrayText` (browser-tested).

### Target size

- **CG-13.** At the touch pitch fields are at least 2.75rem wide. A field
  shorter than five cells must therefore be followed by enough blank cells
  that the widened field cannot overlap the next run.
- **Row-pitch floor (finding).** The first implementation used a 1.25em row
  pitch (20px at 16px text). Automated axe checks reported WCAG 2.2 SC 2.5.8
  Target Size (Minimum) violations for fields in adjacent rows. The pitch is
  therefore `max(1.25em, 1.5rem)`: never below 24px. This is a deliberate
  accessibility cost to terminal density and applies to every profile.

## Action keys

```html
<div class="ef-character-grid__group" role="group" aria-label="Function keys">
  <button class="ef-character-grid__key" type="submit" name="action" value="enter" data-ef-action="enter"
          data-ef-row="22" data-ef-col="2" data-ef-len="12"><kbd>Enter</kbd>=Search</button>
  <button class="ef-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-ef-action="pf3"
          data-ef-row="22" data-ef-col="53" data-ef-len="8"><kbd>PF3</kbd>=Exit</button>
  <button class="ef-character-grid__key" type="button" data-ef-action="reset"
          data-ef-row="23" data-ef-col="2" data-ef-len="12"><kbd>Reset</kbd>=Unlock</button>
</div>
```

Forma **presents** action affordances. It does not implement them.

| Concern | Contract |
| --- | --- |
| Element | Native `<button class="ef-character-grid__key">` with an explicit `type` (CG-14). Never a styled `span`. |
| Identity | `data-ef-action` names the action. The vocabulary is open: `enter`, `clear`, `reset`, `pf1`…`pf24`, `pa1`…`pa3`, `help`, `roll-up`, `field-exit`, or any application name such as `export`. |
| Visible key and label | `<kbd>` holds the key name; the separator and label are ordinary text. The accessible name is exactly the visible text ("PF3=Exit"). A modern profile may use a space instead of `=`. |
| Enter | `type="submit"` and the **first** submit key in the form, so pressing Enter in any field submits through it (native implicit submission uses the form's first submit button) (CG-14). |
| PF / PA / named keys | `type="submit"` with `name`/`value`, so the application reads `SubmitEvent.submitter` or the form data. Add `formnovalidate` where native validation must not block the action (Exit, Cancel, Help, paging). |
| Clear | Presented as a submit key (`value="clear"`, `formnovalidate`). In the 3270, Clear erases locally *and* notifies the host; whether an application erases, notifies, or both is its behavior. |
| Reset | `type="button"`. In the 3270 architecture Reset is a local keyboard function, not an attention identifier; it is application/Limen behavior (for example, unlocking input after an error). |
| `type="reset"` | **Prohibited.** HTML form reset restores initial values; it is neither terminal Reset nor Clear. |
| Unavailable | Native `disabled`; cue: strike-through plus muted text (GrayText in forced colors). Prefer omitting keys that are never available on a screen. |
| Physical keys | Mapping F1–F24, Pause, Escape, etc. to these buttons is application/Limen behavior. When implemented, the application may add `aria-keyshortcuts` to the button. Do not bind bare printable characters (WCAG 2.1.4). Forma patterns do not declare shortcuts they cannot honor. |

## Messages and system status

```html
<p class="ef-character-grid__message" role="alert" data-ef-severity="error"
   data-ef-row="21" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__severity"><span>ERROR</span></span> BTX009E Transfer service did not respond.</p>
<p class="ef-character-grid__status" role="status" data-ef-row="24" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__indicator" data-ef-state="inhibited"><span>X SYSTEM</span></span>  Input inhibited</p>
```

| Concern | Contract |
| --- | --- |
| Severities | `data-ef-severity`: `information`, `success`, `warning`, `validation`, `error` (CG-15). |
| Live region | `role="status"` for information, success, and warning; `role="alert"` for validation and error that need immediate attention. The element must exist before its text changes; the application updates its content. |
| Non-color cue | A visible severity word in `.ef-character-grid__severity` is required (CG-15). Shape cues add to it: underline (warning), double underline (validation), reverse video with an outline (error). In forced colors the reverse video becomes an outlined box. |
| Field association | Fields reference the message with `aria-describedby` (and `aria-invalid="true"` when invalid). |
| Runtime length | Reserve rows with `data-ef-height` when messages may be long; Forma wraps within the run and never clips (GAP-TCG-09). |
| System status | `.ef-character-grid__status` with `role="status"`; `.ef-character-grid__indicator` shows states such as input inhibited. Whether input is actually inhibited (for example, disabling fields while waiting) is application behavior. |

## SequentialReveal presentation

Implements the presentation part of Visual Engineering `CN-VE-TCG-2026-F9F1`.
SequentialReveal is a **new Echelon behavior**, not authentic IBM 3270
behavior, and it is never required.

```html
<div class="ef-character-grid" data-ef-rows="8" data-ef-columns="60"
     data-ef-reveal="sequential" data-ef-reveal-rows="3">
  …
  <h2 class="ef-character-grid__text" data-ef-reveal-run data-ef-row="1" data-ef-col="23" data-ef-len="15">ECHELON FOUNDRY</h2>
```

| Concern | Contract |
| --- | --- |
| Default | Static. Nothing animates unless the grid has `data-ef-reveal="sequential"` **and** a run has `data-ef-reveal-run`. |
| What may reveal | Only `.ef-character-grid__text` runs (CG-16). Values, fields, keys, messages, status, and tables are never staged; the CSS selector cannot match them. |
| Mechanism | A stepped `clip-path` mask over text already in the DOM (`steps(len)`, one step per character). The text is in the accessibility tree and in source order from time zero; staged text is not a live region. |
| Order | Delay derives from the run's position: `((row − 1) × (columns × char + line) + (col − 1) × char) × scale`. Reveal order is therefore row-major order: left to right, then top to bottom. |
| Timing tokens | `--ef-reveal-char-ms` (12), `--ef-reveal-line-ms` (40), `--ef-reveal-max-ms` (1500) on `.ef-character-grid`. `data-ef-reveal-rows` limits the timing window to the first N rows. |
| Cap | `scale = min(1, max ÷ (rows × (columns × char + line)))`: delays and durations are compressed proportionally so the whole reveal ends within the cap, well under WCAG 2.2.2's five seconds. |
| Reduced motion | `prefers-reduced-motion: reduce` (and print) removes the animation and the mask: immediate, static presentation. |
| Interruption | The application/Limen sets `data-ef-reveal="complete"` on the grid on any key, pointer, or focus input (without consuming that input). `complete` is a static state. |
| Replay / restart | The application/Limen removes and re-adds `data-ef-reveal="sequential"` (or renders a new screen). Forma never loops. The application must not replay on re-render of unchanged content. |
| Why interruption is not CSS | A CSS-only interruption (for example `:focus-within { animation: none }`) is not sticky: when focus leaves, the animation is re-applied and replays or re-hides text, which violates the behavior's "never rewind, never repeat" rules. |

**Relationship to the reference model.** Visual Engineering's
`scripts/sequential-reveal.mjs` is the normative model. Forma's CSS is
equivalent to that model with `skipBlank: false` (timing is derived from cell
position, so blank cells cost time) and exclusions expressed structurally.
Per-character blank skipping requires computing cumulative timing from
content, which is runtime work: an application that needs it sets
`animation-delay`/`animation-duration` from the model through the CSSOM.

## Profiles

A profile sets **presentation tokens only** on the grid:
`data-ef-profile="<name>"`. It may change palette, border and shadow color,
caret treatment, and focus background. It may not change geometry, placement,
display, order, or semantics (Visual Engineering rule B-8). A Node test
enforces the allowed property list and that the generic tooling contains no
profile-specific logic.

| Token | Purpose |
| --- | --- |
| `--ef-grid-background`, `--ef-grid-foreground` | Screen |
| `--ef-grid-protected`, `--ef-grid-emphasis`, `--ef-grid-muted` | Protected text, values/intensified text, secondary text |
| `--ef-grid-field`, `--ef-grid-field-surface`, `--ef-grid-boundary` | Editable fields |
| `--ef-grid-focus` | Focus outline |
| `--ef-grid-information`, `-success`, `-warning`, `-validation`, `-error` | Message text |
| `--ef-grid-font-size`, `--ef-grid-line-height`, `--ef-grid-inset` | Scale (geometry is unchanged: cells stay 1ch; pitch never drops below 1.5rem) |

The default (no profile) uses Forma's semantic color tokens and therefore
follows the application's light or dark scheme.

### `ibm-3270` reference profile

`patterns/character-grid-3270.html` is a 24 × 80 operations menu using the
profile. The palette evokes the 3279 base colors — protected text blue,
intensified white, unprotected fields green, on black — plus a block caret
(`caret-shape: block`, progressive enhancement) layered on the standard focus
outline. This is a stylistic choice (category 3 in `CN-VE-TCG-2026-6CA0`), not
an emulation: no 3270 data stream, attribute byte, autoskip, wraparound Tab,
or uppercase transformation is reproduced.

- **24 × 80:** canonical pattern; every run verified on its declared cell.
- **32 × 80:** verified by a browser test that renders the same screen with
  `data-ef-rows="32"` and the reserved rows moved to 29–32, and by a Node test
  that the transformed markup conforms.
- **Contrast:** all profile colors pass axe's WCAG AA color-contrast rule on
  the black screen; forced colors replace the palette while boundaries and
  focus remain.

Other terminal styles (5250, DOS/TUI, BBS, modern) use the same markup with a
different geometry, key vocabulary, and, where wanted, a profile. Forma ships
no 5250/DOS/BBS profile because no visual evidence for one was gathered; see
`docs/CHARACTER-GRID-AUTHORING.md`.

**Finding.** Building this profile exposed a real defect in the generic
primitive, not in the profile: Forma's foundation rules for `p` (72ch measure,
secondary text color) and headings leaked into grid runs, shrinking a 78-cell
message run to 72 cells and recoloring paragraphs. The fix is in the
primitive (runs reset `max-inline-size` and inherit color), with a regression
test.

## Reference application: Customer Inquiry → Account Detail → Transaction History

`patterns/character-grid-workflow.html` implements the Visual Engineering
reference workflow (`EX-VE-TCG-2026-5437`) with the `ibm-3270` profile at
24 × 80, using **only** public contracts: `ef-character-grid*` classes and
`ef-stack` (enforced by a Node test; no inline style, no product CSS).

| Screen | Exercises |
| --- | --- |
| `CINQ` Customer Inquiry | Six labelled editable fields (one with a format hint), Enter/Clear/Reset/PF1/PF3, information message, SequentialReveal on the title only. |
| `ACCD` Account Detail | Protected data only, grouping headings, end-aligned amounts, explicit missing value, Enter/PF3/PF5/PF12/PF1. |
| `TRNH` Transaction History | Two required date fields, a positioned 12-row table (Date, Description, Amount, Balance, Status) with a 2-cell gutter, paging position, PF7/PF8 navigation, Reset. |

Application-rendered states (`tests/character-grid-workflow-states.mjs`):
inquiry validation (invalid field described by hint and message), inquiry
no-criteria error, history empty (explicit empty-state row), and history error
(service failure message plus `X SYSTEM` indicator). Every state passes the
conformance checks and axe.

### Transitions are not Forma's

The screens are three independent grids on one page. Moving between them is
application/Limen behavior driven by the native submitter value:

| From | Submitter | To (application decides) |
| --- | --- | --- |
| CINQ | `enter` | ACCD when exactly one customer matches; otherwise CINQ with a message |
| CINQ | `clear` | CINQ, fields erased |
| CINQ | `reset` (button) | CINQ, local unlock only |
| CINQ | `pf3` | leave the application |
| ACCD | `pf5` | TRNH |
| ACCD | `pf3`, `pf12` | CINQ |
| TRNH | `enter` | TRNH with the new date range |
| TRNH | `pf7`, `pf8` | TRNH previous/next page |
| TRNH | `pf3` | ACCD |
| TRNH | `pf12` | CINQ |

Whether a transition is legal (for example, whether a restricted account may
be displayed) is Ordo/application-domain state.

### Sufficiency

No product-specific concept was needed. One generic defect was found and
fixed at the primitive level while building the screens (the foundation `p`
leak, see Profiles). The row-selection idiom (GAP-TCG-10) was not exercised.

## Conformance checking

`tools/character-grid-conformance.mjs` checks CG-1 to CG-16 on any HTML file:

```bash
node tools/character-grid-conformance.mjs patterns/character-grid.html
```

`tests/character-grid.test.mjs` runs it over every canonical pattern that
contains a grid and proves each rule fails closed on a counterexample.
`tests/browser/character-grid.spec.mjs` verifies rendered geometry against
declared coordinates at 1280, 390, and 320 CSS px and at 200 % text size.

## Verification matrix

`tests/character-grid-coverage.json` maps every GH-44 requirement to named
tests; `tests/character-grid.test.mjs` fails if a referenced test disappears.

| Area | Where |
| --- | --- |
| Static rules CG-1…CG-16, generated CSS sync, no 3270 logic, workflow states, coverage matrix | `tests/character-grid.test.mjs` (`npm run test:character-grid`, run in *Forma conformance* CI) |
| Rendered geometry, 1280/390/320 px, 200 % text, contained region, reflow, `dl` semantics | `tests/browser/character-grid.spec.mjs` |
| Fields: names, states, Tab/Shift+Tab, capacity, forced colors, target size | `tests/browser/character-grid-field.spec.mjs` |
| Keys and status: native submitters, validation bypass, local Reset, live regions, severity cues | `tests/browser/character-grid-keys-status.spec.mjs` |
| SequentialReveal: row-major timing, cap, tokens, exclusions, time-zero availability, reduced motion, complete | `tests/browser/character-grid-reveal.spec.mjs` |
| 3270 profile: 24 × 80, 32 × 80, profile-only geometry, contrast, block caret, forced colors | `tests/browser/character-grid-3270.spec.mjs` |
| Reference workflow: three screens, states, Tab order, dense rows, containment, axe | `tests/browser/character-grid-workflow.spec.mjs` |
| Runtime overflow, text spacing, focus not obscured, CSS collision behavior | `tests/browser/character-grid-verification.spec.mjs` |
| Every pattern at 320/390 px (containment, 44px targets) and the generated site | existing `tests/browser/mobile.spec.mjs`, `tests/site-build.test.mjs`, `tests/site-browser/mobile.spec.mjs` |

Browser tests run on Chromium, Firefox, and WebKit in the *Forma conformance*
workflow. The implementing session could run Chromium only (see the pull
request for exact local results).

## Capability gaps

| Gap (from Visual Engineering) | Status in Forma |
| --- | --- |
| GAP-TCG-01 character-cell positioning | Closed by this contract. |
| GAP-TCG-05 named, focusable contained viewport | Closed by `.ef-character-grid__viewport`. |
| GAP-TCG-07 positioned repeated-row table | Closed by `.ef-character-grid__table`. |
| GAP-TCG-02 field width tied to maximum length | Closed: `maxlength` = `data-ef-len` = rendered cells. |
| GAP-TCG-08 field referencing hint and message | Closed: `aria-describedby` with several IDs. |
| GAP-TCG-03 named keyboard actions presented separately from behavior | Closed by `.ef-character-grid__key`. |
| GAP-TCG-04 staged text reveal with a static fallback | Closed for presentation by `data-ef-reveal`; orchestration remains application/Limen. |
| GAP-TCG-09 runtime message length | Partially closed: multi-row message runs wrap and never clip; the length policy remains application content. |
| GAP-TCG-06 wide-glyph (two-cell) and right-to-left grids | Open. Forma does not assign two cells to wide glyphs. |
| GAP-TCG-11 text-spacing overrides vs fixed cells | New; open (see above). Behavior is regression-tested: contained runs overflow visibly and never clip; reflow has no overlap. |
