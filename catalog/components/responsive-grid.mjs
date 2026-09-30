export default {
  name: "Responsive grid",
  category: "layout",
  behavior: "Application content",
  summary: "Auto-fitting composition grid with optional visual spans that collapse without changing source order.",
  owns: ["ef-responsive-grid","ef-span-2","ef-span-full"],
  purpose: {
    description: "The responsive grid is an auto-fit grid for composing a view from regions of unequal importance. Items fill equal columns sized by a minimum track, and `ef-span-2` or `ef-span-full` let a region take more width when there is room. Emphasis is expressed by space, never by moving the region: the DOM order stays the reading order, and the spans collapse to full width on narrow screens. The application decides which regions exist and which one is emphasized; Forma only places them.",
    useWhen: [
      "A summary view mixes one primary region with several supporting regions of equal weight.",
      "A region needs more width on large screens, such as a chart or a long table, while the rest stay in columns.",
      "The layout must work unchanged in a full page and in a narrower workspace pane."
    ],
    avoidWhen: [
      "All items are equal peers: the simpler [[grid]] is enough.",
      "The layout is an editorial composition with a fixed rhythm: use [[mosaic]].",
      "One task should dominate and supporting context should sit beside it: use [[priority-stack]] or [[focus-stage]].",
      "The emphasis means something in the domain (for example the most severe incident): state it in text and order, not only in span."
    ],
    characteristics: [
      "Columns come from `repeat(auto-fit, minmax(min(100%, var(--ef-responsive-grid-min)), 1fr))`.",
      "Direct children get `min-inline-size: 0`, so long content wraps inside its track.",
      "`ef-span-2` and `ef-span-full` are general grid helpers: they also work in [[grid]] and other grid containers."
    ]
  },
  examples: [
    {
      id: "operations-overview",
      title: "Operations overview",
      description: "A primary incident summary spans two columns; supporting regions fill the remaining tracks, and a full-width activity log closes the view. Source order is summary, on-call, deployments, activity.",
      html: `<ef-responsive-grid class="ef-component-tag">
  <section class="ef-responsive-grid" aria-label="Operations overview">
    <article class="ef-surface ef-span-2" aria-labelledby="responsive-grid-operations-overview-incident">
      <h2 id="responsive-grid-operations-overview-incident">Open incident: checkout latency</h2>
      <p>p95 latency is 2.4 s against an 800 ms objective since 09:12 UTC. Payments team is investigating a database lock.</p>
    </article>
    <article class="ef-surface" aria-labelledby="responsive-grid-operations-overview-oncall">
      <h2 id="responsive-grid-operations-overview-oncall">On call</h2>
      <p>Mateo Alvarez until 18:00 UTC.</p>
    </article>
    <article class="ef-surface" aria-labelledby="responsive-grid-operations-overview-deploys">
      <h2 id="responsive-grid-operations-overview-deploys">Deployments</h2>
      <p>3 today, 1 rolled back.</p>
    </article>
    <article class="ef-surface ef-span-full" aria-labelledby="responsive-grid-operations-overview-activity">
      <h2 id="responsive-grid-operations-overview-activity">Recent activity</h2>
      <p>09:40 Rollback of payments-api 7.3.1 completed. 09:18 Incident declared. 09:12 Latency alert fired.</p>
    </article>
  </section>
</ef-responsive-grid>`
    },
    {
      id: "compact-wide-tracks",
      title: "Compact report tiles",
      description: "A report section with a 12rem minimum track and `data-density=\"compact\"`. More tiles fit per row and the gap tightens; the full-width note still spans the row at every width.",
      html: `<ef-responsive-grid class="ef-component-tag">
  <section class="ef-responsive-grid" data-density="compact" style="--ef-responsive-grid-min: 12rem" aria-label="September report">
    <article class="ef-metric-card"><div class="ef-metric-card__label">Revenue</div><div class="ef-metric-card__value">$184,200</div></article>
    <article class="ef-metric-card"><div class="ef-metric-card__label">New accounts</div><div class="ef-metric-card__value">312</div></article>
    <article class="ef-metric-card"><div class="ef-metric-card__label">Churned</div><div class="ef-metric-card__value">14</div></article>
    <article class="ef-metric-card"><div class="ef-metric-card__label">Support tickets</div><div class="ef-metric-card__value">1,048</div></article>
    <p class="ef-span-full">Figures are provisional until the ledger closes on 5 October.</p>
  </section>
</ef-responsive-grid>`
    },
    {
      id: "mobile-collapsed-span",
      title: "Mobile collapsed span",
      description: "The operations layout at phone width. The two-column span collapses to full width, the minimum track becomes 100%, and every region stacks in source order.",
      mobile: {
        height: 560,
        notes: [
          "At 48rem and below `ef-span-2` becomes `grid-column: 1 / -1`, so the primary region never forces a second track.",
          "At 30rem and below the minimum track is 100%, giving one column regardless of the configured minimum.",
          "Regions stack in DOM order: the primary region is first because it is first in the source, not because of any reordering.",
          "Long incident text wraps inside its region because grid children have `min-inline-size: 0`."
        ]
      },
      html: `<ef-responsive-grid class="ef-component-tag">
  <section class="ef-responsive-grid" aria-label="Incident workspace">
    <article class="ef-surface ef-span-2" aria-labelledby="responsive-grid-mobile-collapsed-span-summary">
      <h2 id="responsive-grid-mobile-collapsed-span-summary">Checkout latency</h2>
      <p>Investigating a database lock on the orders table.</p>
    </article>
    <article class="ef-surface" aria-labelledby="responsive-grid-mobile-collapsed-span-owner">
      <h2 id="responsive-grid-mobile-collapsed-span-owner">Owner</h2>
      <p>Payments team</p>
    </article>
    <article class="ef-surface" aria-labelledby="responsive-grid-mobile-collapsed-span-next">
      <h2 id="responsive-grid-mobile-collapsed-span-next">Next update</h2>
      <p><time datetime="2026-09-30T10:30Z">10:30 UTC</time></p>
    </article>
  </section>
</ef-responsive-grid>`
    }
  ],
  api: {
    attributes: [
      { name: "data-density", on: ".ef-responsive-grid", values: "relaxed | standard | compact | analytical", default: "absent (1rem gap)", description: "Contextual density posture. Sets the gap to 1.5rem, 1rem, or 0.5rem (compact and analytical). Not a data-ef-* hook." },
      { name: "aria-label", on: ".ef-responsive-grid", values: "string", default: "—", description: "Names the composed region when the grid element is a section." },
      { name: "aria-labelledby", on: "grid items", values: "id of the item heading", default: "—", description: "Names each article by its visible heading." },
      { name: "style", on: ".ef-responsive-grid", values: "--ef-responsive-grid-min / --ef-responsive-grid-space", default: "—", description: "Per-instance override of the minimum track or gap." }
    ],
    hooks: {
      "ef-responsive-grid": "Auto-fit grid container; its direct children get `min-inline-size: 0`.",
      "ef-span-2": "Makes an item span two tracks. Becomes full width (`1 / -1`) at viewport widths of 48rem and below. Only use it where at least two tracks usually fit.",
      "ef-span-full": "Makes an item span every track at all widths.",
      "data-density": "Density posture. relaxed = 1.5rem, standard = 1rem, compact and analytical = 0.5rem gap; overrides `--ef-responsive-grid-space`.",
      "--ef-responsive-grid-min": "Minimum track width before a column drops. Default 16rem; forced to 100% at 30rem viewport width and below.",
      "--ef-responsive-grid-space": "Gap between tracks and rows. Default `--ef-primitive-spacing-4` (1rem)."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through focusable content in source order. Spans never change focus order." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Wide", how: "viewport above 48rem", description: "Items fill auto-fit columns; `ef-span-2` takes two tracks." },
    { name: "Medium", how: "viewport at or below 48rem", description: "`ef-span-2` becomes full width; other items still auto-fit." },
    { name: "Narrow", how: "viewport at or below 30rem", description: "Minimum track is 100%, so every item is full width and stacked." },
    { name: "Density posture", how: "data-density attribute", description: "Gap follows the posture." }
  ],
  accessibility: {
    forma: [
      "Spans change width only; DOM, reading and focus order are never altered.",
      "Children cannot force horizontal overflow because tracks are clamped and children have `min-inline-size: 0`.",
      "Adds no roles or landmarks."
    ],
    consumer: [
      "Put the most important region first in the source; span is visual emphasis only and is not announced.",
      "Give each region a heading so users can navigate by heading instead of by position.",
      "State domain meaning such as severity in text; never encode it only in span or position."
    ]
  },
  responsive: [
    "Column count is container-driven through auto-fit, but the span collapse (48rem) and full-width minimum (30rem) are viewport media queries.",
    "In a narrow pane on a wide screen, an `ef-span-2` item can create an empty implicit track; use `ef-span-full` there or keep spans to wide regions.",
    "`ef-span-full` spans every track at every width, useful for notes and footers of a section.",
    "Long content wraps inside its track; wide tables should go inside [[bounded-overflow]]."
  ],
  motion: [
    "No animation: columns and spans change instantly when the width crosses a threshold."
  ],
  guidance: {
    do: [
      "Use at most one or two spanning regions so emphasis stays meaningful.",
      "Set the minimum track from the narrowest readable width of a region's content."
    ],
    avoid: [
      "Using CSS order or grid placement to move a region visually; source order is the contract.",
      "Spanning a region only to fill a gap; auto-fit already stretches items."
    ]
  },
  related: [
    { slug: "grid", note: "Equal-peer collection with the same auto-fit model and no span rules." },
    { slug: "mosaic", note: "Fixed four-column editorial rhythm with span attributes." },
    { slug: "priority-stack", note: "Two or three regions where one gets more space by flex growth." },
    { slug: "dashboard-grid", note: "Operational summary grid with dashboard-specific conventions." }
  ]
};
