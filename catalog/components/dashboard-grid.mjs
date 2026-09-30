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
      id: "attention-first",
      title: "Attention-first operations overview",
      description: "The blocks that need action come first in source order and carry text status with a symbol, not only color. A full-width summary spans the grid with `ef-span-full`.",
      html: `<ef-dashboard-grid class="ef-component-tag">
  <section class="ef-dashboard-grid" aria-labelledby="dashboard-grid-attention-first-title">
    <h2 class="ef-span-full" id="dashboard-grid-attention-first-title">Accounts receivable · October</h2>
    <article class="ef-metric-card" aria-labelledby="dashboard-grid-attention-first-overdue">
      <div class="ef-metric-card__label" id="dashboard-grid-attention-first-overdue">Overdue invoices</div>
      <div class="ef-metric-card__value">12</div>
      <p><span class="ef-status-lozenge" data-state="attention">Needs action</span></p>
      <a href="#dashboard-grid-attention-first-overdue-list">Review overdue invoices</a>
    </article>
    <article class="ef-metric-card" aria-labelledby="dashboard-grid-attention-first-disputed">
      <div class="ef-metric-card__label" id="dashboard-grid-attention-first-disputed">Disputed</div>
      <div class="ef-metric-card__value">3</div>
      <p><span class="ef-status-lozenge" data-state="blocked">Awaiting customer</span></p>
      <a href="#dashboard-grid-attention-first-disputed-list">Open disputes</a>
    </article>
    <article class="ef-metric-card" aria-labelledby="dashboard-grid-attention-first-collected">
      <div class="ef-metric-card__label" id="dashboard-grid-attention-first-collected">Collected this month</div>
      <div class="ef-metric-card__value">$184,200</div>
      <p><span class="ef-status-lozenge" data-state="ok">On track</span></p>
    </article>
  </section>
</ef-dashboard-grid>`
    },
    {
      id: "unknown-and-stale",
      title: "Unavailable and stale values",
      description: "When a source is unavailable the block keeps its place and says so, instead of showing zero. A wider block uses `ef-span-2` for a short explanation of the stale data.",
      html: `<ef-dashboard-grid class="ef-component-tag">
  <section class="ef-dashboard-grid" aria-label="Warehouse status">
    <article class="ef-metric-card">
      <div class="ef-metric-card__label">Orders picked today</div>
      <div class="ef-metric-card__value">1,284</div>
      <p>Updated 2 minutes ago.</p>
    </article>
    <article class="ef-metric-card ef-span-2">
      <div class="ef-metric-card__label">Inventory on hand</div>
      <div class="ef-metric-card__value">—</div>
      <p><span class="ef-status-lozenge" data-state="unknown">Unavailable</span> The inventory service has not responded since 09:40. Figures will return when it reconnects.</p>
    </article>
    <article class="ef-metric-card">
      <div class="ef-metric-card__label">Late shipments</div>
      <div class="ef-metric-card__value">7</div>
      <p><span class="ef-status-lozenge" data-state="unknown">Stale</span> Last refreshed 3 hours ago.</p>
    </article>
  </section>
</ef-dashboard-grid>`
    },
    {
      id: "mobile-single-column",
      title: "Mobile single column",
      description: "At phone width every block takes the full width in source order, so the attention block written first is also seen first.",
      mobile: {
        height: 600,
        notes: [
          "At 40rem and below the grid is one `1fr` column; `ef-span-2` and `ef-span-full` children simply fill that column.",
          "Order is the source order. Nothing is reordered by importance, so write attention blocks first.",
          "Large values such as currency amounts wrap rather than overflow because every block can shrink to the viewport.",
          "Links inside metric cards are ordinary inline links; give them a comfortable touch height in application CSS or make the whole label a single, clearly named link."
        ]
      },
      html: `<ef-dashboard-grid class="ef-component-tag">
  <section class="ef-dashboard-grid" aria-label="On-call summary">
    <article class="ef-metric-card">
      <div class="ef-metric-card__label">Open incidents</div>
      <div class="ef-metric-card__value">2</div>
      <p><span class="ef-status-lozenge" data-state="attention">1 unacknowledged</span></p>
    </article>
    <article class="ef-metric-card">
      <div class="ef-metric-card__label">Pages this week</div>
      <div class="ef-metric-card__value">9</div>
    </article>
    <article class="ef-metric-card">
      <div class="ef-metric-card__label">Mean time to acknowledge</div>
      <div class="ef-metric-card__value">4 min</div>
    </article>
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
