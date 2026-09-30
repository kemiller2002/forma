import { missionById } from "../example-data/nasa-spaceflight.mjs";

const artemisI = missionById("artemis-i");
const sts95 = missionById("sts-95");
const sts31 = missionById("sts-31");
const apollo13 = missionById("apollo-13");
const apollo11 = missionById("apollo-11");

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
      title: "Sorted by launch date, newest first",
      description: "The application has sorted completed NASA missions by launch date in descending order, so only that header carries aria-sort=\"descending\". Row actions name their mission so repeated Open buttons stay unambiguous.",
      html: `<ef-data-grid class="ef-component-tag">
  <div class="ef-data-grid" role="region" tabindex="0" aria-label="NASA missions by launch date">
    <table>
      <caption class="ef-visually-hidden">Reference missions sorted by launch date, newest first</caption>
      <thead><tr>
        <th scope="col"><button type="button">Mission</button></th>
        <th scope="col"><button type="button">Program</button></th>
        <th scope="col" aria-sort="descending"><button type="button">Launch</button></th>
        <th scope="col"><button type="button">Spacecraft</button></th>
        <th scope="col"><span class="ef-visually-hidden">Actions</span></th>
      </tr></thead>
      <tbody>
        <tr>
          <td data-label="Mission">${artemisI.name}</td><td data-label="Program">${artemisI.program}</td>
          <td data-label="Launch"><time datetime="${artemisI.launchDate}">${artemisI.launchDate}</time></td>
          <td data-label="Spacecraft">${artemisI.spacecraft}</td>
          <td data-label="Actions"><button type="button" aria-label="Open ${artemisI.name}">Open</button></td>
        </tr>
        <tr>
          <td data-label="Mission">${sts95.name}</td><td data-label="Program">${sts95.program}</td>
          <td data-label="Launch"><time datetime="${sts95.launchDate}">${sts95.launchDate}</time></td>
          <td data-label="Spacecraft">${sts95.spacecraft}</td>
          <td data-label="Actions"><button type="button" aria-label="Open ${sts95.name}">Open</button></td>
        </tr>
        <tr>
          <td data-label="Mission">${sts31.name}</td><td data-label="Program">${sts31.program}</td>
          <td data-label="Launch"><time datetime="${sts31.launchDate}">${sts31.launchDate}</time></td>
          <td data-label="Spacecraft">${sts31.spacecraft}</td>
          <td data-label="Actions"><button type="button" aria-label="Open ${sts31.name}">Open</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</ef-data-grid>`
    },
    {
      id: "empty-result",
      title: "Empty mission filter",
      description: "The filter asks for an uncrewed Apollo mission, which the reference collection does not contain. The header row remains to explain the shape while an empty state says why the result is empty and how to recover.",
      html: `<ef-data-grid class="ef-component-tag">
  <div class="ef-stack" data-density="compact">
    <div class="ef-data-grid" role="region" tabindex="0" aria-label="Uncrewed Apollo missions">
      <table>
        <caption class="ef-visually-hidden">Uncrewed Apollo missions</caption>
        <thead><tr>
          <th scope="col"><button type="button">Mission</button></th>
          <th scope="col"><button type="button">Program</button></th>
          <th scope="col" aria-sort="ascending"><button type="button">Launch</button></th>
          <th scope="col"><button type="button">Crew status</button></th>
        </tr></thead>
        <tbody></tbody>
      </table>
    </div>
    <section class="ef-empty-state" aria-labelledby="data-grid-empty-result-title">
      <div class="ef-empty-state__symbol" aria-hidden="true">□</div>
      <h3 id="data-grid-empty-result-title">No uncrewed Apollo missions in this collection</h3>
      <p>Remove the crew-status filter or choose Artemis to see the uncrewed ${artemisI.name} reference record.</p>
      <button type="button">Clear crew filter</button>
    </section>
  </div>
</ef-data-grid>`
    },
    {
      id: "wide-record-set",
      title: "Wide mission records",
      description: "Seven factual columns exceed a tablet-width container, so the table scrolls inside the labelled region rather than widening the page. Real crew and destination values provide natural content stress.",
      html: `<ef-data-grid class="ef-component-tag">
  <div class="ef-data-grid" role="region" tabindex="0" aria-label="NASA mission records">
    <table>
      <caption class="ef-visually-hidden">NASA mission records</caption>
      <thead><tr>
        <th scope="col" aria-sort="ascending"><button type="button">Mission</button></th>
        <th scope="col"><button type="button">Program</button></th>
        <th scope="col"><button type="button">Spacecraft</button></th>
        <th scope="col"><button type="button">Launch vehicle</button></th>
        <th scope="col"><button type="button">Destination</button></th>
        <th scope="col"><button type="button">Crew</button></th>
        <th scope="col"><span class="ef-visually-hidden">Actions</span></th>
      </tr></thead>
      <tbody>
        <tr>
          <td data-label="Mission"><span class="ef-identifier">${apollo13.name}</span></td>
          <td data-label="Program">${apollo13.program}</td><td data-label="Spacecraft">${apollo13.spacecraft}</td>
          <td data-label="Launch vehicle">${apollo13.launchVehicle}</td><td data-label="Destination">${apollo13.destination}</td>
          <td data-label="Crew">${apollo13.crew.join(", ")}</td>
          <td data-label="Actions"><button type="button" aria-label="Open ${apollo13.name}">Open</button></td>
        </tr>
        <tr>
          <td data-label="Mission"><span class="ef-identifier">${artemisI.name}</span></td>
          <td data-label="Program">${artemisI.program}</td><td data-label="Spacecraft">${artemisI.spacecraft}</td>
          <td data-label="Launch vehicle">${artemisI.launchVehicle}</td><td data-label="Destination">${artemisI.destination}</td>
          <td data-label="Crew">Uncrewed</td>
          <td data-label="Actions"><button type="button" aria-label="Open ${artemisI.name}">Open</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</ef-data-grid>`
    },
    {
      id: "mobile-record-projection",
      title: "Mobile mission projection",
      description: "At phone width the header row disappears and each mission becomes a bordered record whose cells print their data-label. The row action stretches to the full record width.",
      mobile: {
        height: 560,
        notes: [
          "At 30rem and below rows and cells switch to block display; thead is hidden and every data cell prints its data-label beside the value.",
          "The region drops horizontal scrolling and each mission gets its own bordered record, so nothing scrolls sideways at 320px.",
          "The action cell stretches its button to 100% width for a full-width touch target.",
          "Header sort buttons are hidden on phones; offer sorting through a collection toolbar when mobile sorting is required."
        ]
      },
      html: `<ef-data-grid class="ef-component-tag">
  <div class="ef-data-grid" role="region" tabindex="0" aria-label="Apollo reference missions">
    <table>
      <caption class="ef-visually-hidden">Apollo reference missions</caption>
      <thead><tr>
        <th scope="col" aria-sort="ascending"><button type="button">Mission</button></th>
        <th scope="col"><button type="button">Destination</button></th>
        <th scope="col"><button type="button">Status</button></th>
        <th scope="col"><span class="ef-visually-hidden">Actions</span></th>
      </tr></thead>
      <tbody>
        <tr>
          <td data-label="Mission">${apollo11.name}</td><td data-label="Destination">${apollo11.destination}</td>
          <td data-label="Status"><span class="ef-status-lozenge" data-state="ok">${apollo11.status}</span></td>
          <td data-label="Actions"><button type="button" aria-label="Open ${apollo11.name}">Open</button></td>
        </tr>
        <tr>
          <td data-label="Mission">${apollo13.name}</td><td data-label="Destination">${apollo13.destination}</td>
          <td data-label="Status"><span class="ef-status-lozenge" data-state="ok">${apollo13.status}</span></td>
          <td data-label="Actions"><button type="button" aria-label="Open ${apollo13.name}">Open</button></td>
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
