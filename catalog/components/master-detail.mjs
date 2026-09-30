import { missionById } from "../example-data/nasa-spaceflight.mjs";

const apollo8 = missionById("apollo-8");
const apollo11 = missionById("apollo-11");
const apollo13 = missionById("apollo-13");
const sts31 = missionById("sts-31");
const sts95 = missionById("sts-95");
const artemisI = missionById("artemis-i");

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
      title: "No mission selected",
      description: "The first visit before any reference mission is chosen. No row carries aria-current, and the detail region says what to do instead of showing stale mission data.",
      html: `<ef-master-detail class="ef-component-tag">
  <section class="ef-master-detail" aria-label="NASA reference missions">
    <nav class="ef-master-detail__master" aria-label="Missions">
      <a href="#master-detail-nothing-selected-apollo-8"><strong>${apollo8.name}</strong><span>${apollo8.highlight}</span></a>
      <a href="#master-detail-nothing-selected-apollo-11"><strong>${apollo11.name}</strong><span>${apollo11.highlight}</span></a>
      <a href="#master-detail-nothing-selected-sts-31"><strong>${sts31.name}</strong><span>${sts31.highlight}</span></a>
    </nav>
    <section class="ef-master-detail__detail" aria-labelledby="master-detail-nothing-selected-title">
      <h3 id="master-detail-nothing-selected-title">No mission selected</h3>
      <p>Choose a mission to see its program, spacecraft, crew and destination.</p>
    </section>
  </section>
</ef-master-detail>`
    },
    {
      id: "selected-mission",
      title: "Selected mission with factual detail",
      description: "Apollo 13 is selected from a list of completed mission records. Long crew and destination values wrap inside the detail region while status remains explicit text.",
      html: `<ef-master-detail class="ef-component-tag">
  <section class="ef-master-detail" aria-label="Apollo reference missions">
    <nav class="ef-master-detail__master" aria-label="Apollo mission list">
      <a href="#master-detail-selected-apollo-8"><strong>${apollo8.name}</strong><span>${apollo8.destination}</span></a>
      <a href="#master-detail-selected-apollo-11"><strong>${apollo11.name}</strong><span>${apollo11.destination}</span></a>
      <a href="#master-detail-selected-apollo-13" aria-current="page"><strong>${apollo13.name}</strong><span>${apollo13.destination}</span></a>
    </nav>
    <article class="ef-master-detail__detail" id="master-detail-selected-apollo-13" aria-labelledby="master-detail-selected-title">
      <span class="ef-status-lozenge" data-state="ok">${apollo13.status}</span>
      <h3 id="master-detail-selected-title">${apollo13.name}</h3>
      <dl class="ef-key-value-list">
        <div><dt>Mission type</dt><dd>${apollo13.missionType}</dd></div>
        <div><dt>Crew</dt><dd>${apollo13.crew.join(", ")}</dd></div>
        <div><dt>Spacecraft</dt><dd>${apollo13.spacecraft}</dd></div>
        <div><dt>Destination</dt><dd>${apollo13.destination}</dd></div>
      </dl>
      <p><button type="button">Open NASA source</button></p>
    </article>
  </section>
</ef-master-detail>`
    },
    {
      id: "mobile-record-switcher",
      title: "Mobile mission switcher",
      description: "At phone width the mission list becomes a horizontal switcher above the selected detail. The selected STS-31 record follows directly underneath.",
      mobile: {
        height: 560,
        notes: [
          "At 40rem and below the grid becomes one column; the mission list turns into a horizontal row of links that scrolls inside itself.",
          "Rows keep their touch-target height and the selected mission keeps its visual current marker.",
          "The application should keep the selected mission in the URL so rotation or reload restores the same record.",
          "For much larger result sets, use a separate list page on phones rather than an excessively long horizontal switcher."
        ]
      },
      html: `<ef-master-detail class="ef-component-tag">
  <section class="ef-master-detail" aria-label="Space Shuttle reference missions">
    <nav class="ef-master-detail__master" aria-label="Missions">
      <a href="#master-detail-mobile-sts-31" aria-current="page"><strong>${sts31.name}</strong><span>${sts31.spacecraft}</span></a>
      <a href="#master-detail-mobile-sts-95"><strong>${sts95.name}</strong><span>${sts95.spacecraft}</span></a>
      <a href="#master-detail-mobile-artemis-i"><strong>${artemisI.name}</strong><span>${artemisI.spacecraft}</span></a>
    </nav>
    <article class="ef-master-detail__detail" id="master-detail-mobile-sts-31" aria-labelledby="master-detail-mobile-title">
      <span class="ef-status-lozenge" data-state="ok">${sts31.status}</span>
      <h3 id="master-detail-mobile-title">${sts31.name}</h3>
      <dl class="ef-key-value-list">
        <div><dt>Spacecraft</dt><dd>${sts31.spacecraft}</dd></div>
        <div><dt>Highlight</dt><dd>${sts31.highlight}</dd></div>
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
