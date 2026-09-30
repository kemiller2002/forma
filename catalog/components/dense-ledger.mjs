export default {
  name: "Dense ledger",
  category: "data",
  behavior: "Application content",
  summary: "Compact expert-work table with bounded overflow, stable relationships, and explicit text state.",
  purpose: {
    description: "A dense ledger is a native `table` with tight cell padding, tabular numerals and ruled rows, meant for expert users who read many rows and compare values down columns. It keeps its table shape at every width: when the columns do not fit, the table scrolls inside an `.ef-bounded-overflow` region instead of recomposing into cards, so column relationships stay intact. Forma styles the table only; the rows, their order and the meaning of each state are application content.",
    useWhen: [
      "Operators or analysts scan many rows and compare values vertically, such as ledgers, audit entries or reconciliation lists.",
      "Row and column relationships must survive on narrow screens, and horizontal scrolling inside a labelled region is acceptable.",
      "State is short text per row (Needs review, Ready, Unknown) rather than a color."
    ],
    avoidWhen: [
      "Casual users on phones need to act on individual records: use [[data-grid]], which recomposes into labelled records.",
      "The content is a few labelled facts about one object: use [[key-value-list]].",
      "Rows are work that needs a decision: use [[work-queue]] so the reason and action lead.",
      "A small number of options is compared across attributes for a choice: use [[comparison-grid]]."
    ],
    characteristics: [
      "Tabular, lining numerals (`font-variant-numeric: tabular-nums`) keep digits aligned down a column.",
      "Every cell is start-aligned and top-aligned, so multi-line cells stay readable without extra alignment rules.",
      "Cell padding is one custom property, `--ef-ledger-cell-space`, so density can tighten without forking CSS.",
      "It has no responsive recomposition; the surrounding `.ef-bounded-overflow` region provides containment."
    ]
  },
  examples: [
    {
      id: "explicit-unknowns",
      title: "Unknown and missing values",
      description: "Reconciliation rows where some values are not yet known. Each gap is written as text (Unknown, Not recorded) instead of an empty cell or a dash, so an unknown amount is never read as zero.",
      html: `<ef-dense-ledger class="ef-component-tag">
  <div class="ef-bounded-overflow" role="region" aria-label="Payment reconciliation" tabindex="0">
    <table class="ef-dense-ledger">
      <caption>Payment reconciliation, 29 September</caption>
      <thead><tr><th scope="col">Reference</th><th scope="col">Bank amount</th><th scope="col">Ledger amount</th><th scope="col">Status</th></tr></thead>
      <tbody>
        <tr><th scope="row"><span class="ef-identifier">PAY-88120</span></th><td>$1,250.00</td><td>$1,250.00</td><td>Matched</td></tr>
        <tr><th scope="row"><span class="ef-identifier">PAY-88121</span></th><td>$980.40</td><td>$908.40</td><td>Mismatch: review</td></tr>
        <tr><th scope="row"><span class="ef-identifier">PAY-88122</span></th><td>Unknown</td><td>$4,000.00</td><td>Bank file pending</td></tr>
        <tr><th scope="row"><span class="ef-identifier">PAY-88123</span></th><td>$75.00</td><td>Not recorded</td><td>Missing ledger entry</td></tr>
      </tbody>
    </table>
  </div>
</ef-dense-ledger>`
    },
    {
      id: "wide-audit-ledger",
      title: "Wide audit ledger",
      description: "Seven columns of audit entries. The table keeps its full width and the `.ef-bounded-overflow` region scrolls horizontally inside itself, so the page layout is not pushed wider. The region is focusable for keyboard scrolling.",
      html: `<ef-dense-ledger class="ef-component-tag">
  <div class="ef-bounded-overflow" role="region" aria-label="Access audit entries" tabindex="0">
    <table class="ef-dense-ledger">
      <caption>Access audit entries</caption>
      <thead>
        <tr><th scope="col">Entry</th><th scope="col">Time (UTC)</th><th scope="col">Actor</th><th scope="col">Action</th><th scope="col">Resource</th><th scope="col">Source address</th><th scope="col">Outcome</th></tr>
      </thead>
      <tbody>
        <tr><th scope="row">AUD-50311</th><td><time datetime="2026-09-29T08:14:02Z">08:14:02</time></td><td>m.okafor</td><td>Role granted</td><td>billing/approvers</td><td>10.40.12.7</td><td>Allowed</td></tr>
        <tr><th scope="row">AUD-50312</th><td><time datetime="2026-09-29T08:15:40Z">08:15:40</time></td><td>svc-export</td><td>Bulk export</td><td>customers/eu-west</td><td>10.40.3.19</td><td>Denied by policy</td></tr>
        <tr><th scope="row">AUD-50313</th><td><time datetime="2026-09-29T08:16:11Z">08:16:11</time></td><td>j.lindqvist</td><td>Key rotated</td><td>payments/signing-key</td><td>10.40.12.22</td><td>Allowed</td></tr>
      </tbody>
    </table>
  </div>
</ef-dense-ledger>`
    },
    {
      id: "tighter-cells",
      title: "Tighter cells for a side panel",
      description: "A ledger in a narrow side panel sets `--ef-ledger-cell-space` to a smaller spacing token on the table. Density changes only padding; text size and numerals are unchanged.",
      html: `<ef-dense-ledger class="ef-component-tag">
  <div class="ef-bounded-overflow" role="region" aria-label="Recent adjustments" tabindex="0">
    <table class="ef-dense-ledger" style="--ef-ledger-cell-space: var(--ef-primitive-spacing-1, 0.25rem)">
      <caption>Recent adjustments</caption>
      <thead><tr><th scope="col">Reference</th><th scope="col">Amount</th><th scope="col">By</th></tr></thead>
      <tbody>
        <tr><th scope="row">ADJ-201</th><td>−$120.00</td><td>Billing</td></tr>
        <tr><th scope="row">ADJ-202</th><td>$45.50</td><td>Support</td></tr>
        <tr><th scope="row">ADJ-203</th><td>$0.00</td><td>Billing</td></tr>
      </tbody>
    </table>
  </div>
</ef-dense-ledger>`
    },
    {
      id: "mobile-bounded-ledger",
      title: "Mobile ledger with contained scroll",
      description: "The same five-column ledger at phone width. Columns keep their order and alignment; the region scrolls sideways inside its own bounds.",
      mobile: {
        height: 320,
        notes: [
          "The ledger never recomposes. Below its natural width the `.ef-bounded-overflow` region scrolls horizontally, so the page itself has no horizontal overflow at 320px.",
          "`overscroll-behavior: contain` stops a sideways swipe inside the ledger from scrolling the page or triggering browser back gestures.",
          "`scrollbar-gutter: stable` reserves the scrollbar space so content does not jump when the scrollbar appears.",
          "The row header column (`th scope=\"row\"`) scrolls with the rest; keep the reference column first so each row stays identifiable when scrolling starts.",
          "In landscape, more columns fit and the scroll distance shrinks; nothing else changes."
        ]
      },
      html: `<ef-dense-ledger class="ef-component-tag">
  <div class="ef-bounded-overflow" role="region" aria-label="Inventory movements" tabindex="0">
    <table class="ef-dense-ledger">
      <caption>Inventory movements</caption>
      <thead><tr><th scope="col">Movement</th><th scope="col">SKU</th><th scope="col">Quantity</th><th scope="col">Location</th><th scope="col">Status</th></tr></thead>
      <tbody>
        <tr><th scope="row">MV-7001</th><td>BRK-2210</td><td>240</td><td>Aisle 14, bay C</td><td>Received</td></tr>
        <tr><th scope="row">MV-7002</th><td>BRK-2214</td><td>−18</td><td>Returns cage</td><td>Needs count</td></tr>
      </tbody>
    </table>
  </div>
</ef-dense-ledger>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: ".ef-bounded-overflow", values: "region", default: "—", description: "Names the scroll container as a landmark so it can be found and scrolled." },
      { name: "aria-label", on: ".ef-bounded-overflow", values: "string", default: "—", description: "Accessible name of the scroll region; usually the table's caption." },
      { name: "tabindex", on: ".ef-bounded-overflow", values: "0", default: "—", description: "Makes the region keyboard-focusable so overflowing columns can be scrolled with arrow keys." },
      { name: "scope", on: "th", values: "col | row", default: "—", description: "`col` on header cells, `row` on the reference cell that identifies each row." },
      { name: "datetime", on: "time", values: "ISO date-time", default: "—", description: "Machine-readable timestamp for time columns." },
      { name: "style", on: "table.ef-dense-ledger", values: "--ef-ledger-cell-space", default: "—", description: "Optional inline override of cell padding, or set the property from application CSS." }
    ],
    hooks: {
      "ef-dense-ledger": "The native table. Full width, collapsed borders, tabular numerals and ruled rows.",
      "--ef-ledger-cell-space": "Padding of every `th` and `td`. Default `var(--ef-primitive-spacing-2)` (0.5rem)."
    },
    keyboard: [
      { keys: "Tab", action: "Focuses the scroll region (and any links or buttons inside cells)." },
      { keys: "Arrow keys", action: "Scroll the focused region natively. There is no cell-by-cell navigation." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Fits", how: "table width ≤ region width", description: "No scrollbar; the table fills the container." },
    { name: "Overflowing", how: "table wider than .ef-bounded-overflow", description: "The region scrolls horizontally inside itself; the page does not widen." },
    { name: "Unknown or missing value", how: "application text in the cell", description: "Written as words such as Unknown or Not recorded; Forma adds no styling that could be mistaken for a value." }
  ],
  accessibility: {
    forma: [
      "Keeps a native table, so headers, row headers and cell relationships are exposed by the platform at every width.",
      "Never hides or reorders columns at narrow widths, so the reading order is the same on every device.",
      "Uses start-aligned, tabular numerals so values can be compared without relying on color."
    ],
    consumer: [
      "Wrap the table in `.ef-bounded-overflow` with `role=\"region\"`, `aria-label` and `tabindex=\"0\"` whenever it can overflow.",
      "Provide a `caption` and mark the identifying column with `th scope=\"row\"`.",
      "Write state as explicit text; distinguish unknown, missing, zero and not applicable.",
      "Keep units in the header or the value, not only in color or position."
    ]
  },
  responsive: [
    "No breakpoints: the table keeps its structure at every width.",
    "Containment comes from `.ef-bounded-overflow`: `overflow: auto`, `overscroll-behavior: contain` and a stable scrollbar gutter.",
    "Cells wrap long words (`overflow-wrap: anywhere` on `td` and `th`) before forcing extra width.",
    "On phones, prefer fewer columns chosen by the application over many narrow ones."
  ],
  motion: [
    "No animation: the ledger has no transitions. Scrolling is native and follows the user's scroll settings."
  ],
  guidance: {
    do: [
      "Put the identifying reference in the first column as a row header.",
      "Keep units and signs in the value text (−$120.00, 12,480 kg).",
      "Use [[identifier]] for long codes that users must copy or verify."
    ],
    avoid: [
      "Right-aligning some columns with ad hoc CSS; Forma's contract is start-aligned tabular numerals.",
      "Leaving cells blank when a value is unknown.",
      "Using a dense ledger as the primary phone experience for non-expert users."
    ]
  },
  related: [
    { slug: "data-grid", note: "Use when rows should recompose into labelled records on phones and carry sort and row actions." },
    { slug: "bounded-overflow", note: "The labelled scroll region that contains a ledger wider than its container." },
    { slug: "comparison-grid", note: "Compares a few options across attributes rather than listing many entries." },
    { slug: "key-value-list", note: "Labelled facts about a single record." }
  ]
};
