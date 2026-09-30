export default {
  name: "Bounded overflow",
  category: "layout",
  behavior: "Native CSS",
  summary: "A contained scroll region for genuinely wide content so the page itself never scrolls horizontally.",
  purpose: {
    description: "Bounded overflow wraps content that cannot reflow, such as a wide table, a long log line or a timeline, in a region that scrolls on its own. The page keeps its width, so everything else still reflows at 320px and 400% zoom (WCAG 1.4.10 allows two-dimensional scrolling only for content that needs it). Scrolling is native: the browser supplies scrollbars, touch panning and keyboard scrolling once the region is focusable. Scroll chaining to the page is stopped at the edges, and the scrollbar gutter is reserved so content does not jump when a scrollbar appears.",
    useWhen: [
      "A data table has more columns than fit on a phone and must keep its row and column relationships.",
      "Preformatted content (logs, code, identifiers) must not wrap.",
      "A long list should scroll inside a fixed height in a dense dashboard panel."
    ],
    avoidWhen: [
      "The content can reflow: use [[grid]], [[stack]] or wrapping text instead of adding a scrollbar.",
      "The data needs sorting, selection or cell navigation: use [[data-grid]].",
      "You want side-by-side comparison of options with a sticky first column: use [[comparison-grid]].",
      "Code samples on site pages: the [[code-sample]] block already handles its own overflow."
    ],
    characteristics: [
      "`overflow: auto` scrolls in whichever direction the content exceeds the region.",
      "`overscroll-behavior: contain` stops a swipe at the region's edge from scrolling the page.",
      "`scrollbar-gutter: stable` reserves scrollbar space to prevent layout shift."
    ]
  },
  examples: [
    {
      id: "wide-ledger",
      title: "Wide ledger table",
      description: "A seven-column ledger in a focusable, named scroll region. On narrow screens the table scrolls horizontally inside the region while the page stays put; the caption and row headers keep the data understandable while scrolled.",
      html: `<ef-bounded-overflow class="ef-component-tag">
  <div class="ef-bounded-overflow" role="region" aria-labelledby="bounded-overflow-wide-ledger-caption" tabindex="0">
    <table class="ef-dense-ledger">
      <caption id="bounded-overflow-wide-ledger-caption">Open invoices, September 2026</caption>
      <thead><tr><th scope="col">Invoice</th><th scope="col">Customer</th><th scope="col">Issued</th><th scope="col">Due</th><th scope="col">Amount</th><th scope="col">Paid</th><th scope="col">Status</th></tr></thead>
      <tbody>
        <tr><th scope="row">INV-2291</th><td>Northwind Logistics</td><td>2026-09-01</td><td>2026-09-18</td><td>$12,400.00</td><td>$0.00</td><td>Overdue</td></tr>
        <tr><th scope="row">INV-2304</th><td>Contoso Pharmacy</td><td>2026-09-08</td><td>2026-10-08</td><td>$3,150.00</td><td>$1,000.00</td><td>Partly paid</td></tr>
        <tr><th scope="row">INV-2317</th><td>Fabrikam Manufacturing</td><td>2026-09-15</td><td>2026-10-15</td><td>$48,900.00</td><td>$0.00</td><td>Sent</td></tr>
      </tbody>
    </table>
  </div>
</ef-bounded-overflow>`
    },
    {
      id: "bounded-log",
      title: "Bounded deployment log",
      description: "Unwrapped log lines in a region capped at 10rem tall with an inline `max-block-size`. The region scrolls in both directions; the dashboard around it keeps its height and width.",
      html: `<ef-bounded-overflow class="ef-component-tag">
  <section class="ef-surface ef-stack" data-density="compact" aria-labelledby="bounded-overflow-bounded-log-title">
    <h2 id="bounded-overflow-bounded-log-title">Deployment 7.3.2 log</h2>
    <div class="ef-bounded-overflow" style="max-block-size: 10rem" role="region" aria-label="Deployment 7.3.2 log output" tabindex="0">
      <pre><code>09:40:02 build   payments-api@7.3.2 compiled in 84.1s (cache hit ratio 0.92)
09:40:15 push    registry.example.com/payments/payments-api:7.3.2-4f2a91c pushed
09:40:31 deploy  rolling update started: 0/12 pods ready, maxUnavailable=1, maxSurge=2
09:41:10 deploy  6/12 pods ready
09:41:52 deploy  12/12 pods ready
09:41:53 verify  health check /healthz returned 200 on all pods
09:42:05 verify  synthetic checkout test passed in 612ms
09:42:06 done    deployment 7.3.2 completed</code></pre>
    </div>
  </section>
</ef-bounded-overflow>`
    },
    {
      id: "mobile-table-scroll",
      title: "Mobile table scroll",
      description: "A four-column schedule on a phone. The table is wider than the screen, so only the bounded region scrolls horizontally; headings and text around it still reflow.",
      mobile: {
        height: 340,
        notes: [
          "The region is `max-inline-size: 100%`, so it is never wider than the screen; the table scrolls inside it with a swipe.",
          "Horizontal swipes that reach the table's edge do not scroll or navigate the page because overscroll is contained.",
          "The region is focusable (tabindex=\"0\"), so people using a hardware keyboard with a tablet can scroll it with the arrow keys.",
          "In landscape the table may fit and the scrollbar disappears; the reserved gutter prevents a layout jump."
        ]
      },
      html: `<ef-bounded-overflow class="ef-component-tag">
  <div class="ef-bounded-overflow" role="region" aria-labelledby="bounded-overflow-mobile-table-scroll-caption" tabindex="0">
    <table class="ef-dense-ledger">
      <caption id="bounded-overflow-mobile-table-scroll-caption">On-call schedule, week 40</caption>
      <thead><tr><th scope="col">Engineer</th><th scope="col">Primary shift</th><th scope="col">Secondary shift</th><th scope="col">Escalation contact</th></tr></thead>
      <tbody>
        <tr><th scope="row">Mateo Alvarez</th><td>Mon 09:00 – Wed 09:00 UTC</td><td>Thu 09:00 – Fri 18:00 UTC</td><td>Payments team lead</td></tr>
        <tr><th scope="row">Priya Raman</th><td>Wed 09:00 – Fri 18:00 UTC</td><td>Mon 09:00 – Tue 18:00 UTC</td><td>Platform duty manager</td></tr>
      </tbody>
    </table>
  </div>
</ef-bounded-overflow>`
    }
  ],
  api: {
    attributes: [
      { name: "tabindex", on: ".ef-bounded-overflow", values: "0", default: "—", description: "Makes the scroll region focusable so keyboard users can scroll it. Required when the content has no focusable elements." },
      { name: "role", on: ".ef-bounded-overflow", values: "region", default: "—", description: "Exposes the focusable scroll region as a named region, so focus lands on something with a role and name." },
      { name: "aria-label", on: ".ef-bounded-overflow", values: "string", default: "—", description: "Names the region when there is no caption to reference." },
      { name: "aria-labelledby", on: ".ef-bounded-overflow", values: "id of the table caption", default: "—", description: "Names the region from the table caption." },
      { name: "style", on: ".ef-bounded-overflow", values: "max-block-size: <length>", default: "—", description: "Caps the height to make the region scroll vertically as well." },
      { name: "scope", on: "th", values: "col | row", default: "—", description: "Associates header cells with their column or row so scrolled cells stay understandable." }
    ],
    hooks: {
      "ef-bounded-overflow": "Scroll container: `max-inline-size: 100%`, `overflow: auto`, `overscroll-behavior: contain`, `scrollbar-gutter: stable`. Draws no border or background."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus to the region (when tabindex=\"0\") and then into any focusable content." },
      { keys: "Arrow keys", action: "Scroll the focused region horizontally and vertically. Native browser behavior." },
      { keys: "Page Up / Page Down, Home / End", action: "Scroll the focused region by a page or to its start or end. Native browser behavior." }
    ],
    events: [
      { name: "scroll", description: "Native scroll event on the region. Forma does not use it." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Fits", how: "content no larger than the region", description: "No scrollbar; the gutter space is still reserved where the platform shows classic scrollbars." },
    { name: "Scrollable", how: "content wider or taller than the region", description: "Native scrollbars appear; the page does not scroll with the content." },
    { name: "Focused", how: ":focus-visible", description: "The shared Forma focus ring outlines the region." }
  ],
  accessibility: {
    forma: [
      "Keeps horizontal scrolling inside the region, so the rest of the page reflows at 320px (WCAG 1.4.10).",
      "Contains overscroll, so a swipe at the table edge does not trigger page scrolling or back navigation.",
      "Focused regions use the standard Forma focus indicator."
    ],
    consumer: [
      "Add tabindex=\"0\", role=\"region\" and an accessible name so keyboard and screen-reader users can find and scroll the region.",
      "Use table captions and th scope so data stays understandable while scrolled.",
      "Only bound content that truly cannot reflow; prefer wrapping for text."
    ]
  },
  responsive: [
    "Always fits its parent's width; the content inside decides whether scrolling happens.",
    "No breakpoints: at wide widths the same table often fits and no scrollbar appears.",
    "Set `max-block-size` when vertical containment is also needed, for example in dashboard panels.",
    "Works inside grids and sidebars because it cannot widen its track."
  ],
  motion: [
    "No animation: scrolling is native and follows the user's input. Forma's reduced-motion rule sets `scroll-behavior: auto`, so programmatic smooth scrolling is disabled for users who prefer reduced motion."
  ],
  guidance: {
    do: [
      "Keep the first column meaningful (row headers) so users know which row they are on while scrolled.",
      "Name the region after its content."
    ],
    avoid: [
      "Wrapping entire pages or layouts in bounded overflow to hide reflow problems.",
      "Nesting scroll regions inside each other."
    ]
  },
  related: [
    { slug: "dense-ledger", note: "Compact tabular styling commonly placed inside a bounded region." },
    { slug: "comparison-grid", note: "Option comparison table with its own contained overflow." },
    { slug: "data-grid", note: "Interactive data grid with application-owned behavior." },
    { slug: "code-sample", note: "Site code blocks with built-in overflow handling." }
  ]
};
