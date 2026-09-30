import { nasaPrograms, nasaSpaceflights } from "../example-data/nasa-spaceflight.mjs";

const crewedCount = nasaSpaceflights.filter(mission => mission.crewed).length;
const uncrewedCount = nasaSpaceflights.length - crewedCount;
const lunarCount = nasaSpaceflights.filter(mission => mission.destination.toLowerCase().includes("lunar") || mission.destination.includes("Moon")).length;

export default {
  name: "Dashboard grid",
  category: "workspaces",
  behavior: "Application content",
  summary: "Responsive operational dashboard composition for metrics, status, and attention-first blocks.",
  purpose: {
    description: "A dashboard grid lays out operational summary blocks, usually [[metric-card]] articles, in three equal columns that collapse to one column on phones. It is deliberately simple: the grid assigns no analytical meaning to position or size, and the order of blocks is exactly the order the application writes. Put the blocks that need attention first in the source, because that is also the order on a phone and for assistive technology.",
    useWhen: [
      "An overview screen summarizes several independent operational numbers or states, such as open work, overdue items and throughput.",
      "Each block is a self-contained summary with a label, value and a link to the detail.",
      "The same blocks must remain readable as a single column on a phone."
    ],
    avoidWhen: [
      "Blocks have different importance that should show in size: use [[mosaic]] with spans, or [[priority-stack]].",
      "The number of columns should follow available width instead of a fixed three: use [[responsive-grid]] or [[card-grid]].",
      "The content is a list of items to act on: use [[work-queue]].",
      "Values need to be compared across rows and columns: use [[data-grid]] or [[dense-ledger]]."
    ],
    characteristics: [
      "Three equal `minmax(0, 1fr)` columns with a 1rem gap; blocks never force the page wider.",
      "One column at 40rem and below, in source order.",
      "Children can use the `ef-span-2` and `ef-span-full` utilities to span columns; they return to full width on narrow screens."
    ]
  },
  examples: [
    {
      id: "collection-overview",
      title: "NASA collection overview",
      description: "The full-width heading and metric blocks derive from the canonical mission collection. The counts are data, while source-review state remains explicit text rather than color alone.",
      html: `<ef-dashboard-grid class="ef-component-tag">
  <section class="ef-dashboard-grid" aria-labelledby="dashboard-grid-collection-overview-title">
    <h2 class="ef-span-full" id="dashboard-grid-collection-overview-title">NASA spaceflight reference collection</h2>
    <article class="ef-metric-card" aria-labelledby="dashboard-grid-collection-overview-total">
      <div class="ef-metric-card__label" id="dashboard-grid-collection-overview-total">Missions</div>
      <div class="ef-metric-card__value">${nasaSpaceflights.length}</div>
      <p><span class="ef-status-lozenge" data-state="ok">Stable fixtures</span></p>
      <a href="#dashboard-grid-collection-overview-list">View missions</a>
    </article>
    <article class="ef-metric-card" aria-labelledby="dashboard-grid-collection-overview-crewed">
      <div class="ef-metric-card__label" id="dashboard-grid-collection-overview-crewed">Crewed missions</div>
      <div class="ef-metric-card__value">${crewedCount}</div>
      <p>Each carries an explicit crew manifest.</p>
    </article>
    <article class="ef-metric-card" aria-labelledby="dashboard-grid-collection-overview-lunar">
      <div class="ef-metric-card__label" id="dashboard-grid-collection-overview-lunar">Lunar missions represented</div>
      <div class="ef-metric-card__value">${lunarCount}</div>
      <p>Derived from mission destinations.</p>
    </article>
  </section>
</ef-dashboard-grid>`
    },
    {
      id: "unknown-and-stale",
      title: "Unavailable source checks without losing canonical data",
      description: "When optional live verification is unavailable, the block keeps its place and says so instead of rewriting a stable mission fact as zero. A wider block uses ef-span-2 for the explanation.",
      html: `<ef-dashboard-grid class="ef-component-tag">
  <section class="ef-dashboard-grid" aria-label="Mission source verification">
    <article class="ef-metric-card">
      <div class="ef-metric-card__label">Canonical mission records</div>
      <div class="ef-metric-card__value">${nasaSpaceflights.length}</div>
      <p>Available offline.</p>
    </article>
    <article class="ef-metric-card ef-span-2">
      <div class="ef-metric-card__label">Live NASA source recheck</div>
      <div class="ef-metric-card__value">—</div>
      <p><span class="ef-status-lozenge" data-state="unknown">Unavailable</span> The example keeps the source-attributed local records rather than treating a network failure as missing mission data.</p>
    </article>
    <article class="ef-metric-card">
      <div class="ef-metric-card__label">Programs represented</div>
      <div class="ef-metric-card__value">${nasaPrograms.length}</div>
      <p>${nasaPrograms.join(", ")}.</p>
    </article>
  </section>
</ef-dashboard-grid>`
    },
    {
      id: "mobile-single-column",
      title: "Mobile mission metrics",
      description: "At phone width every derived metric takes the full width in source order.",
      mobile: {
        height: 600,
        notes: [
          "At 40rem and below the grid is one column; span helpers simply fill that column.",
          "Order remains source order; Forma never reorders by importance.",
          "Large numeric values can shrink with their cards without causing page overflow.",
          "Links inside metric cards remain normal links with explicit names."
        ]
      },
      html: `<ef-dashboard-grid class="ef-component-tag">
  <section class="ef-dashboard-grid" aria-label="NASA reference summary">
    <article class="ef-metric-card"><div class="ef-metric-card__label">Crewed missions</div><div class="ef-metric-card__value">${crewedCount}</div><p><span class="ef-status-lozenge" data-state="ok">Crew data present</span></p></article>
    <article class="ef-metric-card"><div class="ef-metric-card__label">Uncrewed missions</div><div class="ef-metric-card__value">${uncrewedCount}</div></article>
    <article class="ef-metric-card"><div class="ef-metric-card__label">Programs</div><div class="ef-metric-card__value">${nasaPrograms.length}</div></article>
  </section>
</ef-dashboard-grid>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "root section", values: "string", default: "—", description: "Names the dashboard region when it has no visible heading." },
      { name: "aria-labelledby", on: "root section, metric article", values: "id of a visible heading or label", default: "—", description: "Names the region or an individual block by its visible text." }
    ],
    hooks: {
      "ef-dashboard-grid": "Root grid: three equal columns with a 1rem gap; one column at 40rem and below."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through links in the blocks in source order. The grid adds no keyboard behavior." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Three columns", how: "viewport wider than 40rem", description: "Equal columns; blocks flow row by row in source order." },
    { name: "One column", how: "@media (max-width: 40rem)", description: "Full-width blocks stacked in source order." }
  ],
  accessibility: {
    forma: [
      "Keeps visual order identical to source order at every width.",
      "Lets blocks shrink so values and descriptions reflow at 320px and 400% zoom."
    ],
    consumer: [
      "Order blocks by what users need first, and do not rely on position to express priority or severity.",
      "Give each block a label and express status as text (for example with [[status-lozenge]]), not only color.",
      "Show unknown, unavailable or stale values explicitly instead of zero or blank.",
      "Name the dashboard region with a heading."
    ]
  },
  responsive: [
    "Above 40rem: `repeat(3, minmax(0, 1fr))`. Between about 40rem and 60rem each column is narrow, so keep labels and values short or use [[responsive-grid]] instead.",
    "At 40rem and below: a single column.",
    "The column count is fixed and viewport-based; a dashboard inside a narrow container still gets three columns above 40rem viewport width."
  ],
  motion: [
    "No animation: blocks reflow instantly at the breakpoint. Value changes inside blocks are the concern of components such as [[metric-value-change]]."
  ],
  guidance: {
    do: [
      "Link each block to the detail it summarizes.",
      "Keep a stable block order between visits so people can find numbers by habit."
    ],
    avoid: [
      "Encoding meaning in position, such as putting the worst metric top-left and expecting users to infer severity.",
      "Filling the grid with more than about six blocks; group the rest into sections."
    ]
  },
  related: [
    { slug: "metric-card", note: "The standard block placed in the grid." },
    { slug: "responsive-grid", note: "Column count follows available width instead of a fixed three." },
    { slug: "mosaic", note: "Four-column grid with explicit spans for uneven block sizes." },
    { slug: "work-queue", note: "Actionable list of items rather than summary numbers." }
  ]
};
