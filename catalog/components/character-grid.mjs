export default {
  name: "Character grid",
  category: "keyboard",
  behavior: "Application / Limen",
  summary: "Fixed rows-by-columns grid of equal-width cells where every run declares its cell coordinates and source order is row-major order; contained horizontal scroll by default.",
  purpose: {
    description: "The character grid is the presentation primitive for keyboard-first screens laid out on equal-width character cells: 3270 and 5250 style screens, DOS and TUI tools, and modern character-grid interfaces. Each run (a heading, a value, a field, a key, a message) is a real HTML element that declares its origin cell and length with `data-ef-row`, `data-ef-col` and `data-ef-len`. Runs are written in row-major order, so reading order, focus order and visual order are the same sequence without any `tabindex`. Forma owns geometry, placement, typography, state cues, narrow-screen containment and profiles. The application owns content, key processing, input inhibition, initial focus and screen transitions.",
    useWhen: [
      "Positions on the screen carry meaning to trained operators, such as a host screen being re-platformed without retraining.",
      "A keyboard-first data entry or inquiry screen must keep fields, labels and function keys at fixed cells.",
      "A tool deliberately presents a terminal-style layout and needs the grid to scale with text size rather than viewport width."
    ],
    avoidWhen: [
      "Ordinary forms and detail pages: use [[text-field]], [[key-value-list]] and [[facts]], which reflow naturally.",
      "Tabular data that users sort, filter or select: use [[data-grid]] or [[dense-ledger]].",
      "Showing source code or command output: use [[code-sample]].",
      "Wide-glyph (two-cell) or right-to-left content: the grid does not assign two cells to wide glyphs (GAP-TCG-06 is open)."
    ],
    characteristics: [
      "One cell is `1ch` of the grid's monospaced face and the row pitch is at least 1.5rem (24px), so positions stay exact at 200% text size.",
      "Coordinates are attributes, not inline styles, so a strict `style-src` Content-Security-Policy is kept.",
      "The viewport is a named, focusable region that scrolls horizontally inside itself; the page never scrolls sideways.",
      "Overlong text widens its column tracks instead of being clipped, so authoring errors stay visible.",
      "Field, key, message and reveal presentation are documented on the family pages; this page owns the grid and every `data-ef-*` hook."
    ]
  },
  examples: [
    {
      id: "print-queue",
      title: "Print queue with repeated rows",
      description: "A 10 by 60 screen with a positioned table run. Column widths come from `th[data-ef-len]` and a two-cell gutter from `data-ef-gutter`; the table keeps native table semantics and a visually hidden caption.",
      html: `<ef-character-grid class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="10" data-ef-columns="60" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-print-queue-title" tabindex="0">
      <div class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-print-queue-title" data-ef-row="1" data-ef-col="22" data-ef-len="18" data-ef-emphasis="intensified">PRINT QUEUE STATUS</h2>
        <span class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="11">Queue<span class="ef-character-grid__leader" aria-hidden="true"> . . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="3" data-ef-col="14" data-ef-len="8">PRTQ01</span>
        <span class="ef-character-grid__text" data-ef-row="3" data-ef-col="30" data-ef-len="11">Printer<span class="ef-character-grid__leader" aria-hidden="true"> . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="3" data-ef-col="42" data-ef-len="10">FLOOR3-HP</span>
        <div class="ef-character-grid__table" data-ef-row="5" data-ef-col="2" data-ef-len="57" data-ef-height="5">
          <table data-ef-gutter="2">
            <caption>Jobs in queue PRTQ01, oldest first</caption>
            <thead><tr><th scope="col" data-ef-len="8">Job</th><th scope="col" data-ef-len="10">Owner</th><th scope="col" data-ef-len="5" data-ef-align="end">Pages</th><th scope="col" data-ef-len="10">Status</th><th scope="col" data-ef-len="16">Submitted</th></tr></thead>
            <tbody>
            <tr><td>J004812</td><td>OKAFOR</td><td data-ef-align="end">12</td><td>PRINTING</td><td>2026-09-30 08:14</td></tr>
            <tr><td>J004815</td><td>RIVERA</td><td data-ef-align="end">3</td><td>WAITING</td><td>2026-09-30 08:16</td></tr>
            <tr><td>J004817</td><td>NAKAMURA</td><td data-ef-align="end">21</td><td>HELD</td><td>2026-09-30 08:21</td></tr>
            <tr><td>J004820</td><td>RIVERA</td><td data-ef-align="end">2</td><td>WAITING</td><td>2026-09-30 08:25</td></tr>
            </tbody>
          </table>
        </div>
        <p class="ef-character-grid__text" data-ef-row="10" data-ef-col="2" data-ef-len="16" data-ef-emphasis="muted">4 jobs, 38 pages</p>
      </div>
    </div>
  </div>
</ef-character-grid>`
    },
    {
      id: "supplier-profile",
      title: "Missing data and grouped values",
      description: "A description list placed with `ef-character-grid__group`, so its terms and values keep absolute coordinates. A contact that is not on file is shown in words with `data-ef-state=\"missing\"`, and amounts are end-aligned inside their runs.",
      html: `<ef-character-grid class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="9" data-ef-columns="50" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-supplier-profile-title" tabindex="0">
      <div class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-supplier-profile-title" data-ef-row="1" data-ef-col="17" data-ef-len="16" data-ef-emphasis="intensified">SUPPLIER PROFILE</h2>
        <dl class="ef-character-grid__group">
          <dt class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="12">Supplier<span class="ef-character-grid__leader" aria-hidden="true"> . :</span></dt>
          <dd class="ef-character-grid__value" data-ef-row="3" data-ef-col="15" data-ef-len="20">HARBOR FREIGHT CO</dd>
          <dt class="ef-character-grid__text" data-ef-row="4" data-ef-col="2" data-ef-len="12">Contact<span class="ef-character-grid__leader" aria-hidden="true">  . :</span></dt>
          <dd class="ef-character-grid__value" data-ef-row="4" data-ef-col="15" data-ef-len="20" data-ef-state="missing">not on file</dd>
          <dt class="ef-character-grid__text" data-ef-row="5" data-ef-col="2" data-ef-len="12">Balance<span class="ef-character-grid__leader" aria-hidden="true">  . :</span></dt>
          <dd class="ef-character-grid__value" data-ef-row="5" data-ef-col="15" data-ef-len="12" data-ef-align="end">4,210.00</dd>
          <dt class="ef-character-grid__text" data-ef-row="6" data-ef-col="2" data-ef-len="12">Overdue<span class="ef-character-grid__leader" aria-hidden="true">  . :</span></dt>
          <dd class="ef-character-grid__value" data-ef-row="6" data-ef-col="15" data-ef-len="12" data-ef-align="end">0.00</dd>
        </dl>
        <p class="ef-character-grid__text" data-ef-row="8" data-ef-col="2" data-ef-len="45" data-ef-emphasis="muted">Contact details are maintained by Purchasing.</p>
      </div>
    </div>
  </div>
</ef-character-grid>`
    },
    {
      id: "build-summary",
      title: "Reflow for a modern tool",
      description: "A build summary whose positions carry no meaning opts into `data-ef-narrow=\"reflow\"`. When the grid's container is narrower than 82 cells the runs stack in source order; at wider sizes it is an ordinary grid.",
      html: `<ef-character-grid class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="7" data-ef-columns="60" data-ef-narrow="reflow">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-build-summary-title" tabindex="0">
      <div class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-build-summary-title" data-ef-row="1" data-ef-col="2" data-ef-len="18" data-ef-emphasis="intensified">BUILD 2231 SUMMARY</h2>
        <span class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="11">Branch<span class="ef-character-grid__leader" aria-hidden="true">  . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="3" data-ef-col="14" data-ef-len="16">release/2026.10</span>
        <span class="ef-character-grid__text" data-ef-row="4" data-ef-col="2" data-ef-len="11">Commit<span class="ef-character-grid__leader" aria-hidden="true">  . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="4" data-ef-col="14" data-ef-len="7">4f9c2e1</span>
        <span class="ef-character-grid__text" data-ef-row="5" data-ef-col="2" data-ef-len="11">Duration<span class="ef-character-grid__leader" aria-hidden="true"> :</span></span>
        <span class="ef-character-grid__value" data-ef-row="5" data-ef-col="14" data-ef-len="6">6m 42s</span>
        <p class="ef-character-grid__text" data-ef-row="7" data-ef-col="2" data-ef-len="56">All 1,482 checks passed. Artifacts retained for 30 days.</p>
      </div>
    </div>
  </div>
</ef-character-grid>`
    },
    {
      id: "node-list-mobile",
      title: "Contained node list on a phone",
      description: "A 7 by 60 screen plus one device status row (`data-ef-status-rows=\"1\"`). At phone width the grid keeps every position and the named viewport scrolls sideways inside itself.",
      mobile: {
        height: 420,
        notes: [
          "The grid keeps its 60 columns; the viewport scrolls horizontally inside its border and the page itself never scrolls sideways.",
          "Below 40rem, or on a coarse pointer, the row pitch grows to 2.75rem (44px) so rows are comfortable touch targets. Columns stay one `ch` wide, so positions are preserved.",
          "The viewport has `tabindex=\"0\"` and a name, so keyboard users can focus it and scroll with the arrow keys; touch users swipe inside it.",
          "Rotating to landscape shows more columns before scrolling is needed; no run moves."
        ]
      },
      html: `<ef-character-grid class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="7" data-ef-status-rows="1" data-ef-columns="60" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-node-list-mobile-title" tabindex="0">
      <div class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-node-list-mobile-title" data-ef-row="1" data-ef-col="22" data-ef-len="17" data-ef-emphasis="intensified">CLUSTER NODE LIST</h2>
        <dl class="ef-character-grid__group" aria-label="Node states">
          <dt class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="11">NODE-01<span class="ef-character-grid__leader" aria-hidden="true"> . :</span></dt>
          <dd class="ef-character-grid__value" data-ef-row="3" data-ef-col="14" data-ef-len="8">ONLINE</dd>
          <dt class="ef-character-grid__text" data-ef-row="4" data-ef-col="2" data-ef-len="11">NODE-02<span class="ef-character-grid__leader" aria-hidden="true"> . :</span></dt>
          <dd class="ef-character-grid__value" data-ef-row="4" data-ef-col="14" data-ef-len="8">DRAINING</dd>
          <dt class="ef-character-grid__text" data-ef-row="5" data-ef-col="2" data-ef-len="11">NODE-03<span class="ef-character-grid__leader" aria-hidden="true"> . :</span></dt>
          <dd class="ef-character-grid__value" data-ef-row="5" data-ef-col="14" data-ef-len="8">ONLINE</dd>
        </dl>
        <p class="ef-character-grid__text" data-ef-row="7" data-ef-col="2" data-ef-len="33" data-ef-emphasis="muted">Last refresh 2026-09-30 08:15 UTC</p>
        <p class="ef-character-grid__status" role="status" data-ef-row="8" data-ef-col="2" data-ef-len="58"><span class="ef-character-grid__indicator"><span>READY</span></span></p>
      </div>
    </div>
  </div>
</ef-character-grid>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: ".ef-character-grid__viewport", values: "region", default: "—", description: "Required. Makes the contained scroller a named landmark region." },
      { name: "aria-labelledby", on: ".ef-character-grid__viewport", values: "id of the screen title run", default: "—", description: "Required. Names the region after the screen title so each screen is identifiable." },
      { name: "tabindex", on: ".ef-character-grid__viewport", values: "0", default: "—", description: "Required. Lets keyboard users focus and scroll the contained region. Positive values are prohibited everywhere in the grid (CG-11)." },
      { name: "scope", on: "th in a table run", values: "col | row", default: "—", description: "Native table header scope. Row headers read as data (no underline)." },
      { name: "aria-label", on: ".ef-character-grid__group", values: "string", default: "—", description: "Names a semantic group such as a `dl` or `role=\"group\"` when it has no visible heading." }
    ],
    hooks: {
      "ef-character-grid": "Grid scope and container-query container. Holds the geometry attributes, profile, reveal state and the `--ef-grid-*` presentation tokens.",
      "ef-character-grid__viewport": "The contained horizontal scroller with a border and focus outline. Requires `role=\"region\"`, a name and `tabindex=\"0\"`.",
      "ef-character-grid__surface": "The cell grid. A `form` when the screen has editable fields, otherwise a `div`. Every direct child is a positioned run.",
      "ef-character-grid__group": "Semantic container (`dl`, `div role=\"group\"`, `section`) that spans the grid as a subgrid, so its children keep absolute coordinates.",
      "ef-character-grid__text": "Protected text: headings, labels without a field, prose. Never focusable.",
      "ef-character-grid__value": "Protected value in the emphasis color. Never render protected values as readonly inputs (CG-9).",
      "ef-character-grid__table": "A positioned run that holds a native `table` of repeated rows. Whitespace collapses inside it and its caption is visually hidden.",
      "ef-character-grid__label": "A `label for` run that precedes its field. See [[character-grid-field]].",
      "ef-character-grid__leader": "Decorative leader characters inside a label or text run. Mark it `aria-hidden=\"true\"` so the accessible name stays clean.",
      "ef-character-grid__field": "Native editable input run. See [[character-grid-field]].",
      "ef-character-grid__key": "Native button presenting an action key. See [[character-grid-keys]].",
      "ef-character-grid__message": "Live message run with a severity word. See [[character-grid-status]].",
      "ef-character-grid__severity": "Visible severity word at the start of a message.",
      "ef-character-grid__status": "System status run, usually on a device status row.",
      "ef-character-grid__indicator": "Status indicator word such as READY or X SYSTEM.",
      "data-ef-rows": "Application rows of the grid, integer 1-50. Sets `--ef-grid-rows`.",
      "data-ef-columns": "Columns of the grid, integer 1-132. Sets `--ef-grid-columns`.",
      "data-ef-status-rows": "Optional device status rows (1 or 2) after the application rows, for `ef-character-grid__status` runs only (CG-18). Omit when the application draws its own status.",
      "data-ef-narrow": "`contained` (default) keeps geometry and scrolls inside the viewport. `reflow` stacks runs in source order when the container is narrower than 82 cells.",
      "data-ef-row": "1-based origin row of a run. Maps to the registered, non-inheriting `--ef-row`.",
      "data-ef-col": "1-based origin column of a run. Maps to `--ef-col`.",
      "data-ef-len": "Run length in cells. Maps to `--ef-len`. On a field it equals `maxlength`; on a table header it sets the column width.",
      "data-ef-height": "Run height in rows (default 1), used by table runs and messages that reserve extra rows. Maps to `--ef-height`.",
      "data-ef-gutter": "On the `table` inside a table run: cells between columns, 0-4 (default 1). Maps to `--ef-gutter`.",
      "data-ef-emphasis": "On protected text: `intensified` (emphasis color, bold) or `muted` (secondary color).",
      "data-ef-align": "`end` right-aligns a value or table cell within its cells, for amounts.",
      "data-ef-state": "On a value: `missing` italicizes explicit missing-data words. On an indicator: `inhibited` draws reverse video (an outlined box in forced colors).",
      "data-ef-severity": "On a message: `information`, `success`, `warning`, `validation` or `error`; sets the message color and severity-word shape cue.",
      "aria-invalid": "`true` on a field, set by the application after validation, draws dashed rules above and below the field.",
      "data-ef-profile": "Presentation profile. `ibm-3270` is the only shipped profile; it changes tokens only, never geometry or order. See [[character-grid-3270]].",
      "data-ef-reveal": "`sequential` enables the SequentialReveal mask; `complete` and `static` are static. See [[character-grid-reveal]].",
      "data-ef-reveal-rows": "Limits the reveal timing window to the first N rows.",
      "data-ef-reveal-run": "Opts one protected text run into the reveal. Other run types never reveal.",
      "--ef-grid-font-size": "Grid text size. Default 1rem. Cells are `1ch` of this face.",
      "--ef-grid-line-height": "Line height factor for the row pitch. Default 1.25; the pitch never drops below 1.5rem.",
      "--ef-grid-inset": "Padding around the cell grid. Default 1ch.",
      "--ef-grid-background": "Screen background. Defaults to the primary surface token, so it follows light and dark themes.",
      "--ef-grid-protected": "Protected text color.",
      "--ef-grid-emphasis": "Values, intensified text, key names and table cells.",
      "--ef-grid-muted": "Muted text, leaders and status text.",
      "--ef-grid-field": "Editable field text color.",
      "--ef-grid-field-surface": "Editable field background.",
      "--ef-grid-boundary": "Field underline color.",
      "--ef-grid-focus": "Focus outline color for fields and keys.",
      "--ef-reveal-char-ms": "Reveal time per cell. Default 12.",
      "--ef-reveal-line-ms": "Extra reveal time per row. Default 40.",
      "--ef-reveal-max-ms": "Cap for the whole reveal. Default 1500."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves to the viewport, then through fields and keys in source order, which is row-major order. Tab can always leave the grid." },
      { keys: "Arrow keys", action: "Scroll the contained viewport while it has focus (native scrolling of a focusable overflow region)." },
      { keys: "F1-F24, Escape, Pause and other function keys", action: "No built-in behavior. The application or Limen maps physical keys to the presented key buttons." }
    ],
    events: [
      { name: "submit", description: "Native event on a `form` surface. The application reads `SubmitEvent.submitter` to learn which key was used. Forma adds no events." }
    ],
    form: "A `form` surface is an ordinary native form: fields submit by `name`, the first submit key receives implicit submission, and `required` and `formnovalidate` behave natively. Protected runs are never form controls and never submit."
  },
  states: [
    { name: "Contained", how: "data-ef-narrow=\"contained\" (default)", description: "Geometry is preserved at every width; the viewport scrolls horizontally when narrower than the grid." },
    { name: "Reflowed", how: "data-ef-narrow=\"reflow\" and a container narrower than 82 cells", description: "Runs stack in source order and wrap; positions are not preserved. Table runs keep their own contained scroll." },
    { name: "Touch pitch", how: "viewport narrower than 40rem or pointer: coarse", description: "Row pitch grows to 2.75rem; fields and keys get a 2.75rem minimum width that paints into blank cells." },
    { name: "Viewport focus", how: ":focus-visible on the viewport", description: "A 2px focus outline with offset around the region." },
    { name: "Missing value", how: "data-ef-state=\"missing\" on a value", description: "Missing data is stated in words and italicized, never left blank." },
    { name: "Profiled", how: "data-ef-profile=\"ibm-3270\"", description: "Presentation tokens change; geometry, order and semantics do not." }
  ],
  accessibility: {
    forma: [
      "Row-major source order makes reading order, focus order and visual order identical; no CSS reordering is applied in any mode.",
      "The viewport is a named, focusable region with a visible focus outline, so contained content is reachable by keyboard.",
      "Rows are at least 24px (1.5rem), and 44px on narrow or coarse-pointer screens, meeting WCAG 2.2 target-size guidance.",
      "Column and row tracks grow under WCAG 1.4.12 text-spacing overrides, so runs never overlap and shared columns stay aligned.",
      "Viewport border, table header underline, field boundaries and focus use system colors in forced-colors mode.",
      "Table captions are visually hidden but remain available to assistive technology."
    ],
    consumer: [
      "Write runs in row-major order and never use positive `tabindex`; check markup with `node tools/character-grid-conformance.mjs <file>`.",
      "Give every screen a title run and reference it from the viewport's `aria-labelledby`.",
      "Justify contained layout: positions must carry meaning (WCAG 1.4.10 two-dimensional exception). Otherwise use `data-ef-narrow=\"reflow\"`.",
      "Render missing data as explicit words and keep protected values as text, not readonly inputs.",
      "Decide initial focus when a screen appears; Forma only needs native `autofocus` if you use it."
    ]
  },
  responsive: [
    "The grid sizes in character cells: `inline-size: max-content` of `columns` tracks of `minmax(1ch, min-content)` plus the inset. It scales with text size, not viewport width.",
    "Contained (default): the viewport has `overflow-x: auto` and `overscroll-behavior-inline: contain`, so the page never scrolls horizontally.",
    "Reflow (opt-in): an `@container` query stacks runs when the grid's container is narrower than 82ch; wider geometries still use the contained scroller between 82 cells and their full width.",
    "Below 40rem or on a coarse pointer the row pitch grows to 2.75rem; columns stay one `ch` so positions do not change.",
    "Overlong content widens intrinsic tracks rather than clipping; the conformance check reports it as an authoring error."
  ],
  motion: [
    "No animation in the base grid: placement, scrolling and state cues are static.",
    "The optional SequentialReveal mask is off unless the grid has `data-ef-reveal=\"sequential\"` and a run has `data-ef-reveal-run`; it is removed under `prefers-reduced-motion: reduce` and in print. See [[character-grid-reveal]]."
  ],
  guidance: {
    do: [
      "Start small: declare the real geometry of the screen being modeled (24 by 80, 32 by 80, or any size up to 50 by 132).",
      "Use a `form` surface for screens with fields and a `div` otherwise.",
      "Wrap `dl`, labelled groups and sections in `ef-character-grid__group` so their children keep absolute coordinates."
    ],
    avoid: [
      "Inline `style` attributes inside the grid (CG-10); coordinates belong in `data-ef-*` attributes.",
      "Two runs that share a cell (CG-5) or text longer than its run (CG-7).",
      "Using the grid only for a retro look when positions carry no meaning and reflow is not enabled."
    ]
  },
  related: [
    { slug: "character-grid-field", note: "Editable fields, labels and hints placed on the grid." },
    { slug: "character-grid-keys", note: "Enter, Clear, Reset and PF keys presented as native buttons." },
    { slug: "character-grid-status", note: "Messages with severity words and the system status line." },
    { slug: "character-grid-3270", note: "The IBM 3270-inspired reference profile built on this primitive." },
    { slug: "data-grid", note: "Use for interactive tabular data that reflows and is sorted or filtered." }
  ]
};
