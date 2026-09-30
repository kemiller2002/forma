export default {
  name: "Data grid",
  category: "data",
  behavior: "Application / Limen",
  summary: "Semantic tabular records with sortable-column affordances, contained horizontal overflow and a labeled record projection on phones.",
  purpose: {
    description: "A data grid presents a set of records as a native `table` inside a focusable, labelled scroll region. Forma styles the header, cells, sort indicators and the narrow-screen recomposition: at 30rem and below the header row is hidden and every cell prints its own `data-label`, so each row reads as a labelled record. Forma does not sort, filter, select, paginate or navigate cells. Header buttons are plain native buttons; the application (normally through Limen) decides what activating them does and writes the resulting `aria-sort`.",
    useWhen: [
      "Users scan, compare and act on many records that share the same fields, such as invoices, tickets or deployments.",
      "Columns can be sorted by the application and the current sort must be visible and announced.",
      "Each row carries a small number of row-level actions such as Open or Review.",
      "The same records must remain usable on a 320px phone without horizontal page scrolling."
    ],
    avoidWhen: [
      "The table is dense expert reference data where column alignment must survive on phones: use [[dense-ledger]] inside [[bounded-overflow]], which keeps the table shape.",
      "Only a handful of labelled facts about one object are shown: use [[key-value-list]].",
      "The user compares a few items across the same attributes and must keep rows and columns aligned: use [[comparison-grid]].",
      "Rows are unresolved work items whose main purpose is the next action: use [[work-queue]].",
      "Cells are editable or the grid needs arrow-key cell navigation: that requires an application-owned `role=\"grid\"` keyboard model, which Forma does not provide."
    ],
    characteristics: [
      "The table keeps a 42rem minimum width, so on tablets the region scrolls horizontally inside its own border instead of squeezing columns.",
      "At 30rem and below each row becomes a bordered record and each cell a two-column label/value grid driven by `data-label`.",
      "The sort direction is shown by an arrow appended to the header button from `aria-sort`, so the visual and the accessibility tree share one source.",
      "Status is expected to be text (for example a [[status-lozenge]]), never cell color alone."
    ]
  },
  examples: [
    {
      id: "descending-sort",
      title: "Sorted by due date, newest first",
      description: "The application has sorted by Due in descending order, so only that header carries `aria-sort=\"descending\"` and shows a down arrow. Row actions name their record so a list of Open buttons is not ambiguous out of context.",
      html: `<ef-data-grid class="ef-component-tag">
  <div class="ef-data-grid" role="region" tabindex="0" aria-label="Invoices by due date">
    <table>
      <caption class="ef-visually-hidden">Invoices sorted by due date, newest first</caption>
      <thead>
        <tr>
          <th scope="col"><button type="button">Invoice</button></th>
          <th scope="col"><button type="button">Customer</button></th>
          <th scope="col" aria-sort="descending"><button type="button">Due</button></th>
          <th scope="col"><button type="button">Status</button></th>
          <th scope="col"><span class="ef-visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td data-label="Invoice">INV-1051</td>
          <td data-label="Customer">Harbor Freight Partners</td>
          <td data-label="Due"><time datetime="2026-11-02">Nov 2, 2026</time></td>
          <td data-label="Status"><span class="ef-status-lozenge">Draft</span></td>
          <td data-label="Actions"><button type="button" aria-label="Open INV-1051">Open</button></td>
        </tr>
        <tr>
          <td data-label="Invoice">INV-1047</td>
          <td data-label="Customer">Northstar Labs</td>
          <td data-label="Due"><time datetime="2026-10-18">Oct 18, 2026</time></td>
          <td data-label="Status"><span class="ef-status-lozenge" data-state="unknown">Payment unconfirmed</span></td>
          <td data-label="Actions"><button type="button" aria-label="Open INV-1047">Open</button></td>
        </tr>
        <tr>
          <td data-label="Invoice">INV-1042</td>
          <td data-label="Customer">Acme Manufacturing</td>
          <td data-label="Due"><time datetime="2026-10-04">Oct 4, 2026</time></td>
          <td data-label="Status"><span class="ef-status-lozenge" data-state="attention">Overdue</span></td>
          <td data-label="Actions"><button type="button" aria-label="Open INV-1042">Open</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</ef-data-grid>`
    },
    {
      id: "empty-result",
      title: "Empty result",
      description: "The query returned no records. The header row stays so the columns still explain what would appear, and an [[empty-state]] after the region says why the table is empty and how to recover. Forma does not decide between empty, loading and failed; the application renders the right one.",
      html: `<ef-data-grid class="ef-component-tag">
  <div class="ef-stack" data-density="compact">
    <div class="ef-data-grid" role="region" tabindex="0" aria-label="Overdue invoices">
      <table>
        <caption class="ef-visually-hidden">Overdue invoices</caption>
        <thead>
          <tr>
            <th scope="col"><button type="button">Invoice</button></th>
            <th scope="col"><button type="button">Customer</button></th>
            <th scope="col" aria-sort="ascending"><button type="button">Due</button></th>
            <th scope="col"><button type="button">Status</button></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
    <section class="ef-empty-state" aria-labelledby="data-grid-empty-result-title">
      <div class="ef-empty-state__symbol" aria-hidden="true">□</div>
      <h3 id="data-grid-empty-result-title">No overdue invoices</h3>
      <p>Every invoice due before today has been paid or written off.</p>
      <button type="button">Show all invoices</button>
    </section>
  </div>
</ef-data-grid>`
    },
    {
      id: "wide-record-set",
      title: "Many columns and long values",
      description: "Seven columns exceed a tablet-width container, so the table scrolls inside the labelled region rather than widening the page. The region is focusable, so keyboard users can scroll it with the arrow keys. Long customer names wrap inside their cells.",
      html: `<ef-data-grid class="ef-component-tag">
  <div class="ef-data-grid" role="region" tabindex="0" aria-label="Shipment records">
    <table>
      <caption class="ef-visually-hidden">Shipment records</caption>
      <thead>
        <tr>
          <th scope="col" aria-sort="ascending"><button type="button">Shipment</button></th>
          <th scope="col"><button type="button">Consignee</button></th>
          <th scope="col"><button type="button">Origin</button></th>
          <th scope="col"><button type="button">Destination</button></th>
          <th scope="col"><button type="button">Weight</button></th>
          <th scope="col"><button type="button">Status</button></th>
          <th scope="col"><span class="ef-visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td data-label="Shipment"><span class="ef-identifier">SHP-2026-000418</span></td>
          <td data-label="Consignee">Rheinland Präzisionswerkzeuge und Industriebedarf GmbH</td>
          <td data-label="Origin">Rotterdam, NL</td>
          <td data-label="Destination">Duisburg, DE</td>
          <td data-label="Weight">12,480 kg</td>
          <td data-label="Status"><span class="ef-status-lozenge" data-state="ok">Delivered</span></td>
          <td data-label="Actions"><button type="button" aria-label="Open SHP-2026-000418">Open</button></td>
        </tr>
        <tr>
          <td data-label="Shipment"><span class="ef-identifier">SHP-2026-000419</span></td>
          <td data-label="Consignee">Coastal Grain Cooperative</td>
          <td data-label="Origin">Antwerp, BE</td>
          <td data-label="Destination">Lyon, FR</td>
          <td data-label="Weight">—</td>
          <td data-label="Status"><span class="ef-status-lozenge" data-state="blocked">Held at customs</span></td>
          <td data-label="Actions"><button type="button" aria-label="Open SHP-2026-000419">Open</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</ef-data-grid>`
    },
    {
      id: "mobile-record-projection",
      title: "Mobile record projection",
      description: "At phone width the header row disappears and each row becomes a bordered record whose cells print their `data-label`. The row action stretches to the full record width.",
      mobile: {
        height: 560,
        notes: [
          "At 30rem (480px) and below the table, rows and cells switch to block display; `thead` is hidden and every `td` shows its `data-label` in a 6.5rem label column beside the value.",
          "The region drops its border and horizontal scrolling; each record gets its own border and bottom margin instead, so nothing scrolls sideways at 320px.",
          "Children of the `td[data-label=\"Actions\"]` cell stretch to 100% width, giving a full-width touch target per record.",
          "Header sort buttons are hidden with `thead`, so sorting is not reachable on phones from the grid itself. Offer sort in a [[collection-toolbar]] or equivalent control.",
          "Rotating to landscape above 30rem restores the table layout inside the scrolling region."
        ]
      },
      html: `<ef-data-grid class="ef-component-tag">
  <div class="ef-data-grid" role="region" tabindex="0" aria-label="Open support tickets">
    <table>
      <caption class="ef-visually-hidden">Open support tickets</caption>
      <thead>
        <tr>
          <th scope="col" aria-sort="ascending"><button type="button">Ticket</button></th>
          <th scope="col"><button type="button">Subject</button></th>
          <th scope="col"><button type="button">Status</button></th>
          <th scope="col"><span class="ef-visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td data-label="Ticket">SUP-3120</td>
          <td data-label="Subject">Cannot export the quarterly usage report as CSV</td>
          <td data-label="Status"><span class="ef-status-lozenge" data-state="attention">Awaiting reply</span></td>
          <td data-label="Actions"><button type="button" aria-label="Open SUP-3120">Open</button></td>
        </tr>
        <tr>
          <td data-label="Ticket">SUP-3124</td>
          <td data-label="Subject">Single sign-on loop after password change</td>
          <td data-label="Status"><span class="ef-status-lozenge">New</span></td>
          <td data-label="Actions"><button type="button" aria-label="Open SUP-3124">Open</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</ef-data-grid>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: ".ef-data-grid", values: "region", default: "—", description: "Makes the scroll container a named landmark so keyboard and screen-reader users can find and scroll it." },
      { name: "tabindex", on: ".ef-data-grid", values: "0", default: "—", description: "Lets keyboard users focus the region and scroll overflowing columns with the arrow keys." },
      { name: "aria-label", on: ".ef-data-grid", values: "string", default: "—", description: "Names the region. Use a distinct name per grid on the page." },
      { name: "scope", on: "th", values: "col", default: "—", description: "Associates each header with its column on wide layouts." },
      { name: "aria-sort", on: "th", values: "ascending | descending", default: "absent (unsorted)", description: "Written by the application on the one sorted column. Forma appends ↑ or ↓ to the header button from this value." },
      { name: "data-label", on: "td", values: "column name", default: "—", description: "Required on every cell. Printed as the cell's label at 30rem and below, when the header row is hidden. `Actions` also stretches the cell's children to full width." },
      { name: "type", on: "button", values: "button", default: "—", description: "Header sort buttons and row actions are native buttons; `type=\"button\"` prevents accidental form submission." },
      { name: "aria-label", on: "row action button", values: "string", default: "—", description: "Names the record a repeated action applies to, such as \"Open INV-1042\"." },
      { name: "datetime", on: "time", values: "ISO date", default: "—", description: "Machine-readable date for date cells; the visible text stays human-formatted." }
    ],
    hooks: {
      "ef-data-grid": "Root scroll region around the native table. Bordered, horizontally scrollable, and recomposed into labelled records at 30rem and below."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the region, the header sort buttons and row actions in document order." },
      { keys: "Arrow keys", action: "Scroll the focused region horizontally and vertically (native scrolling). There is no cell-by-cell navigation." },
      { keys: "Enter / Space", action: "Activate a focused sort button or row action. What sorting does is application behavior." }
    ],
    events: [
      { name: "click", description: "Native click on header and row buttons. The application sorts or navigates, then re-renders rows and moves `aria-sort`." }
    ],
    form: "Not a form control. Row selection checkboxes or inline inputs, if added, participate in their own form as ordinary native controls."
  },
  states: [
    { name: "Unsorted", how: "no aria-sort on any th", description: "Header buttons show their label only." },
    { name: "Sorted ascending", how: "aria-sort=\"ascending\" on th", description: "The header button shows an up arrow after its label; assistive technology announces the sort." },
    { name: "Sorted descending", how: "aria-sort=\"descending\" on th", description: "The header button shows a down arrow after its label." },
    { name: "Overflowing", how: "table wider than the region", description: "The region scrolls horizontally inside its border because the table keeps a 42rem minimum width." },
    { name: "Record projection", how: "viewport ≤ 30rem", description: "Header hidden; rows are bordered records; cells show their `data-label`." },
    { name: "Empty", how: "empty tbody plus an application-rendered [[empty-state]]", description: "Forma has no built-in empty row; the application explains the absence of records." }
  ],
  accessibility: {
    forma: [
      "Keeps a native `table` with `th scope`, so row and column relationships come from the platform on wide layouts.",
      "Derives the sort arrow from `aria-sort`, so the visible indicator cannot disagree with what assistive technology announces.",
      "Header sort buttons keep a 2.25rem minimum height; row actions stretch to full width on phones.",
      "In the phone projection each value is preceded by its visible column label from `data-label`, replacing the hidden header."
    ],
    consumer: [
      "Provide a `caption` (it may be visually hidden) and a unique `aria-label` on the region.",
      "Put `data-label` on every `td`, matching the column header text.",
      "Move `aria-sort` to the sorted column and announce sort or result changes in a live region such as the [[collection-toolbar]] count.",
      "Give repeated row actions record-specific accessible names.",
      "Express status as text; do not rely on row or cell color.",
      "If the grid needs cell navigation, selection or editing, implement the ARIA grid keyboard model in Limen/application code."
    ]
  },
  responsive: [
    "Above 30rem the table keeps a 42rem minimum inline size and the `.ef-data-grid` region scrolls horizontally, so the page never overflows.",
    "At 30rem and below the grid recomposes into stacked records: `thead` hidden, every cell a `minmax(6.5rem, 0.4fr) minmax(0, 1fr)` label/value grid.",
    "Long text wraps inside cells; identifiers can use [[identifier]] so long codes break safely.",
    "The application decides which columns are essential. For very wide data on phones, prefer fewer columns or a detail view over many labelled lines per record.",
    "Sort controls disappear with the header on phones; supply an equivalent sort control outside the grid."
  ],
  motion: [
    "No animation: sorting, the sort arrow and the phone recomposition change instantly. Re-ordered rows are replaced by the application without transitions."
  ],
  guidance: {
    do: [
      "Keep the header label, `data-label` and any sort control wording identical.",
      "Show the result count and active filters next to the grid so an empty or short table is explained.",
      "Pair large result sets with [[pagination]] or an application-owned loading strategy."
    ],
    avoid: [
      "Sorting in the browser with script that Forma does not know about, then forgetting to update `aria-sort`.",
      "Using row color or position to signal priority, risk or status.",
      "Putting several unrelated actions in each row; open a detail view or use a [[menu]] instead."
    ]
  },
  related: [
    { slug: "dense-ledger", note: "Compact expert table that keeps its table shape on phones inside bounded overflow instead of recomposing into records." },
    { slug: "collection-toolbar", note: "Search, filter, sort and count controls that sit above a grid and remain available when the header hides." },
    { slug: "comparison-grid", note: "Use when a few items are compared across attributes and rows and columns must stay aligned." },
    { slug: "pagination", note: "Splits long result sets into pages; the grid shows only the current page." },
    { slug: "bounded-overflow", note: "Generic labelled scroll region for any wide content that must not become a record projection." }
  ]
};
