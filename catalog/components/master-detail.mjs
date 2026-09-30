export default {
  name: "Master/detail workspace",
  category: "workspaces",
  behavior: "Application / Limen",
  summary: "List-and-detail composition that collapses cleanly from multi-pane desktop to mobile navigation.",
  purpose: {
    description: "A master/detail workspace shows a list of records beside the full detail of one selected record. The list is a `nav` of real links, so selecting a record is navigation to a URL the application owns, and the current record is marked with `aria-current=\"page\"`. Forma draws the two-column frame, the selected-row cue and the narrow-screen recomposition into a horizontal record switcher above the detail. Selection, routing, browser history, loading and focus restoration are application or Limen behavior.",
    useWhen: [
      "Users move between many records of one kind and need the list in view while reading or acting on one, such as invoices, tickets or cases.",
      "Each record has a stable URL, so the selected record can be deep-linked, bookmarked and restored with Back.",
      "The detail is substantial enough to deserve its own region, not just an expanded row."
    ],
    avoidWhen: [
      "The records need column comparison, sorting or bulk selection: use [[data-grid]] and open detail on its own page or in a [[flyout]].",
      "Items are a short work list with inline actions: use [[work-queue]].",
      "Two regions are related but neither is a list of records: use [[split-pane]].",
      "The detail is short enough to reveal inline: use [[disclosure]] rows."
    ],
    characteristics: [
      "Each list row is a link at least 3.5rem tall with a bold identifier and a secondary line.",
      "The selected row gets a thick inline-start bar and a filled background, so the cue is shape plus color, not color alone.",
      "At 40rem and below the list becomes a horizontally scrolling row of 12rem cards above the detail; the detail stays in the page flow."
    ]
  },
  examples: [
    {
      id: "nothing-selected",
      title: "No record selected",
      description: "The first visit to the list before any record is chosen. No row carries aria-current, and the detail region says what to do instead of showing stale data from a previous record.",
      html: `<ef-master-detail class="ef-component-tag">
  <section class="ef-master-detail" aria-label="Open support cases">
    <nav class="ef-master-detail__master" aria-label="Cases">
      <a href="#master-detail-nothing-selected-4410"><strong>CASE-4410</strong><span>Login loop after SSO change</span></a>
      <a href="#master-detail-nothing-selected-4407"><strong>CASE-4407</strong><span>Refund not received</span></a>
      <a href="#master-detail-nothing-selected-4399"><strong>CASE-4399</strong><span>Export missing columns</span></a>
    </nav>
    <section class="ef-master-detail__detail" aria-labelledby="master-detail-nothing-selected-title">
      <h3 id="master-detail-nothing-selected-title">No case selected</h3>
      <p>Choose a case from the list to see the customer, history and next steps.</p>
    </section>
  </section>
</ef-master-detail>`
    },
    {
      id: "blocked-record",
      title: "Blocked record with long names",
      description: "A selected record in a blocked state, with long customer names wrapping inside the list rows. Status is a text lozenge with a symbol, and the only legal action shown is the one the application allows.",
      html: `<ef-master-detail class="ef-component-tag">
  <section class="ef-master-detail" aria-label="Purchase orders">
    <nav class="ef-master-detail__master" aria-label="Purchase orders list">
      <a href="#master-detail-blocked-record-7781"><strong>PO-7781</strong><span>Consolidated Freight &amp; Warehousing Partners (EMEA)</span></a>
      <a href="#master-detail-blocked-record-7782" aria-current="page"><strong>PO-7782</strong><span>Hanseatische Maschinenbau- und Anlagentechnik GmbH</span></a>
      <a href="#master-detail-blocked-record-7790"><strong>PO-7790</strong><span>Blue Harbor Co.</span></a>
    </nav>
    <article class="ef-master-detail__detail" id="master-detail-blocked-record-7782" aria-labelledby="master-detail-blocked-record-title">
      <span class="ef-status-lozenge" data-state="blocked">Blocked</span>
      <h3 id="master-detail-blocked-record-title">PO-7782</h3>
      <dl class="ef-key-value-list">
        <div><dt>Supplier</dt><dd>Hanseatische Maschinenbau- und Anlagentechnik GmbH</dd></div>
        <div><dt>Blocked by</dt><dd>Missing tax certificate</dd></div>
        <div><dt>Amount</dt><dd>€48,200.00</dd></div>
      </dl>
      <p><button type="button">Request certificate</button></p>
    </article>
  </section>
</ef-master-detail>`
    },
    {
      id: "mobile-record-switcher",
      title: "Mobile record switcher",
      description: "At phone width the list becomes a horizontal switcher above the detail, and the selected record's detail follows directly underneath.",
      mobile: {
        height: 560,
        notes: [
          "At 40rem and below the grid becomes one column; the list turns into a horizontal row of 12rem-wide links that scrolls inside itself, so the page never scrolls sideways at 320px.",
          "Rows keep their 3.5rem minimum block size, which exceeds the 44px touch target, and the selected row keeps its thick bar.",
          "Only part of the list is visible at once; the application should scroll the selected link into view and keep the URL as the source of truth so rotation or reload restores the same record.",
          "Long lists are awkward to scroll horizontally. For more than a handful of records, navigate to a separate list page on phones and use Back to return."
        ]
      },
      html: `<ef-master-detail class="ef-component-tag">
  <section class="ef-master-detail" aria-label="Field visits">
    <nav class="ef-master-detail__master" aria-label="Visits">
      <a href="#master-detail-mobile-v12" aria-current="page"><strong>Visit 12</strong><span>Pump station 4</span></a>
      <a href="#master-detail-mobile-v13"><strong>Visit 13</strong><span>North reservoir</span></a>
      <a href="#master-detail-mobile-v14"><strong>Visit 14</strong><span>Valve house B</span></a>
    </nav>
    <article class="ef-master-detail__detail" id="master-detail-mobile-v12" aria-labelledby="master-detail-mobile-title">
      <span class="ef-status-lozenge" data-state="ok">Complete</span>
      <h3 id="master-detail-mobile-title">Visit 12</h3>
      <dl class="ef-key-value-list">
        <div><dt>Site</dt><dd>Pump station 4</dd></div>
        <div><dt>Inspector</dt><dd>Daniel Okafor</dd></div>
      </dl>
    </article>
  </section>
</ef-master-detail>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "section, nav", values: "string", default: "—", description: "Names the workspace and the record list so the list landmark is distinguishable from site navigation." },
      { name: "aria-current", on: "list link", values: "page", default: "absent", description: "Marks the selected record and draws the selected-row cue. Set by the application when the route changes." },
      { name: "href", on: "list link", values: "record URL", default: "—", description: "Each record is a real link so it can be opened, bookmarked and restored with browser history." },
      { name: "id", on: "detail", values: "string", default: "—", description: "Optional fragment target for the selected record." },
      { name: "aria-labelledby", on: "detail", values: "id of the detail heading", default: "—", description: "Names the detail region by its record heading." }
    ],
    hooks: {
      "ef-master-detail": "Root two-column grid with a border and a 22rem minimum height.",
      "ef-master-detail__master": "The record list, normally a `nav` of links. Each direct link is a row; a `span` inside it is the secondary line.",
      "ef-master-detail__detail": "The selected record region. Padded and allowed to shrink."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the record links, then into the detail. Native link behavior." },
      { keys: "Enter", action: "Follows the record link. The application loads the record and decides where focus goes." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Selected record", how: "aria-current=\"page\" on the list link", description: "Thick inline-start accent bar and filled row background." },
    { name: "Nothing selected", how: "no link with aria-current", description: "All rows neutral; the detail region should explain what to do." },
    { name: "Two columns", how: "viewport wider than 40rem", description: "List column `minmax(12rem, 0.4fr)` beside the detail." },
    { name: "Stacked switcher", how: "@media (max-width: 40rem)", description: "List becomes a horizontal scrolling row above the detail." }
  ],
  accessibility: {
    forma: [
      "Renders the selected row with a non-color cue (a 0.35rem bar) in addition to the background fill.",
      "Keeps list rows at least 3.5rem tall at every width.",
      "Recomposes at narrow widths without reordering the list and detail in the DOM."
    ],
    consumer: [
      "Use links with real URLs for records and keep aria-current in sync with the route.",
      "After selection, move focus to the detail heading only when the user expects it (for example on phones, where the detail is below the list), and restore focus to the selected row on Back.",
      "Announce loading and failure of the detail as text, for example with [[skeleton]] or [[operation-status]].",
      "Give the list `nav` a name that differs from other navigation on the page."
    ]
  },
  responsive: [
    "Wide: list column `minmax(12rem, 0.4fr)` and a `minmax(0, 1fr)` detail column.",
    "At 40rem and below: a single column; the list becomes a flex row of 12rem links with `overflow-x: auto` inside its own box, bordered below instead of beside.",
    "Detail content shrinks with `min-inline-size: 0`; long values wrap in [[key-value-list]].",
    "The root keeps a 22rem minimum height so an empty detail does not collapse the workspace."
  ],
  motion: [
    "No animation: the selected-row cue changes instantly when aria-current moves, and the breakpoint recomposition is not transitioned. Any detail transition is application-owned and must respect reduced motion."
  ],
  guidance: {
    do: [
      "Show a short identifier and one distinguishing line in each row so records can be told apart without opening them.",
      "Keep the detail's status as text with a symbol, using [[status-lozenge]]."
    ],
    avoid: [
      "Using buttons that change the detail without changing the URL; selection then cannot be shared or restored.",
      "Hiding the list entirely on phones without a clear way back to it.",
      "Putting row actions inside the list links; interactive content cannot be nested in a link."
    ]
  },
  related: [
    { slug: "data-grid", note: "Use when records need columns, sorting or bulk selection." },
    { slug: "work-queue", note: "Use for attention-required items with inline actions rather than a browsable list." },
    { slug: "split-pane", note: "Generic two-region layout without a selectable list." },
    { slug: "record-header", note: "Pairs well at the top of the detail region for identity, status and actions." }
  ]
};
