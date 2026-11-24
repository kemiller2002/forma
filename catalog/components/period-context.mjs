export default {
  name: "Period context",
  category: "data",
  behavior: "Application state",
  summary: "A persistent context bar naming the accounting period every figure on the page belongs to: period, state in words, cutoff, and the snapshot's as-of and known-at times.",
  purpose: {
    description: "Financial figures are only meaningful in their period. A period context bar states, above the figures, which period they belong to, whether that period is open, closing or certified, when it cuts off, and the two times of the snapshot: as-of (the business date the figures describe) and known-at (when the system recorded what it knew). Forma renders a description list in a bordered bar, with every timestamp in a `<time>` element and the state as a sentence-case [[status-lozenge]]. The text is ordinary selectable text, so it can be copied with the figures. The application owns the period, its state and the timestamps.",
    useWhen: [
      "A workspace shows balances, ledgers or reports that belong to an accounting period.",
      "The period can change state while the user works (closing, certified), and figures must be read in that light.",
      "Late-arriving data matters, so the difference between as-of and known-at must be visible."
    ],
    avoidWhen: [
      "The user is choosing a date range: use [[date-range]].",
      "The user needs to see where they are in a hierarchy of scopes: use [[scope-trail]].",
      "Only one freshness time matters: use [[freshness]]."
    ],
    characteristics: [
      "State is always written in words; the bar's start edge also changes weight (open single, closing double, certified heavy).",
      "Timestamps are `<time datetime>` elements with an explicit time zone in the visible text.",
      "Below 48rem the bar becomes a compact two-column list of label and value."
    ]
  },
  examples: [
    {
      id: "certified",
      title: "Certified period",
      description: "A certified quarter. Figures will not change; the known-at time shows when the certified snapshot was taken.",
      html: `<forma-period-context class="forma-component-tag">
  <section class="forma-period-context" data-forma-state="certified" aria-label="Reporting period">
    <dl class="forma-period-context__facts">
      <div class="forma-period-context__period"><dt>Period</dt><dd>Q3 2026 (Jul to Sep)</dd></div>
      <div><dt>State</dt><dd><span class="forma-status-lozenge" data-forma-variant="sentence" data-state="ok">Certified</span></dd></div>
      <div><dt>Cutoff</dt><dd><time datetime="2026-10-10T17:00Z">10 Oct 2026, 17:00 UTC</time></dd></div>
      <div><dt>As of</dt><dd><time datetime="2026-09-30T23:59Z">30 Sep 2026, 23:59 UTC</time></dd></div>
      <div><dt>Known at</dt><dd><time datetime="2026-10-12T08:00Z">12 Oct 2026, 08:00 UTC</time></dd></div>
    </dl>
  </section>
</forma-period-context>`
    },
    {
      id: "open-period",
      title: "Open period above a figure",
      description: "An open month in the header of a balance panel. The state is neutral (no glyph colour), and the known-at time tells the reader the figure may still change.",
      html: `<forma-period-context class="forma-component-tag">
  <div class="forma-stack">
    <section class="forma-period-context" data-forma-state="open" aria-label="Reporting period">
      <dl class="forma-period-context__facts">
        <div class="forma-period-context__period"><dt>Period</dt><dd>November 2026</dd></div>
        <div><dt>State</dt><dd><span class="forma-status-lozenge" data-forma-variant="sentence">Open</span></dd></div>
        <div><dt>Cutoff</dt><dd><time datetime="2026-12-05T17:00Z">5 Dec 2026, 17:00 UTC</time></dd></div>
        <div><dt>As of</dt><dd><time datetime="2026-11-23T23:59Z">23 Nov 2026, 23:59 UTC</time></dd></div>
        <div><dt>Known at</dt><dd><time datetime="2026-11-24T06:15Z">24 Nov 2026, 06:15 UTC</time></dd></div>
      </dl>
    </section>
    <p>Operating account balance: 48,210.00</p>
  </div>
</forma-period-context>`
    },
    {
      id: "mobile-closing",
      title: "Closing period on a phone",
      description: "The canonical closing period at phone width.",
      mobile: {
        height: 300,
        notes: [
          "Below 48rem the facts become a two-column list (label, value) so all five fit without horizontal scrolling at 320px.",
          "Long values and timestamps wrap inside their value column.",
          "The bar is not sticky: on a phone the application decides whether to repeat it in a header, so it never hides a focused control."
        ]
      },
      html: `<forma-period-context class="forma-component-tag">
  <section class="forma-period-context" data-forma-state="closing" aria-label="Reporting period">
    <dl class="forma-period-context__facts">
      <div class="forma-period-context__period"><dt>Period</dt><dd>October 2026</dd></div>
      <div><dt>State</dt><dd><span class="forma-status-lozenge" data-forma-variant="sentence" data-state="attention">Closing</span></dd></div>
      <div><dt>Cutoff</dt><dd><time datetime="2026-11-05T17:00Z">5 Nov 2026, 17:00 UTC</time></dd></div>
      <div><dt>As of</dt><dd><time datetime="2026-10-31T23:59Z">31 Oct 2026, 23:59 UTC</time></dd></div>
      <div><dt>Known at</dt><dd><time datetime="2026-11-03T09:12Z">3 Nov 2026, 09:12 UTC</time></dd></div>
    </dl>
  </section>
</forma-period-context>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "section.forma-period-context", values: "string", default: "—", description: "Names the region (\"Reporting period\"), so it is a findable landmark." },
      { name: "data-forma-state", on: "section.forma-period-context", values: "open | closing | certified", default: "absent (open)", description: "Changes the start edge: closing is a double rule, certified a heavy one. Presentation only; the State value states it in words." },
      { name: "datetime", on: "time", values: "ISO 8601 date-time with zone", default: "—", description: "Machine-readable timestamp for the cutoff, as-of and known-at values." }
    ],
    hooks: {
      "forma-period-context": "Bordered bar with a 0.25rem start edge on the primary surface. Text stays selectable (`user-select: text`).",
      "forma-period-context__facts": "Wrapping row of label/value pairs (a `dl`); a two-column list below 48rem.",
      "forma-period-context__period": "The pair that names the period; its value is larger and bold.",
      "data-forma-state": "`closing`: double start edge. `certified`: 0.5rem start edge."
    },
    keyboard: [
      { keys: "—", action: "Not focusable or interactive." }
    ],
    events: [
      { name: "—", description: "None." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Open", how: "data-forma-state=\"open\" (or absent)", description: "Figures may still change. Neutral lozenge." },
    { name: "Closing", how: "data-forma-state=\"closing\"", description: "Period is being closed; double start edge and an attention lozenge." },
    { name: "Certified", how: "data-forma-state=\"certified\"", description: "Figures are final; heavy start edge and an ok lozenge." }
  ],
  accessibility: {
    forma: [
      "A labelled region containing a description list, so each value is announced with its label.",
      "State is never colour alone: words, glyph and edge weight carry it; forced colours draw the bar in CanvasText.",
      "Ordinary text, so it can be selected, copied and read by screen magnifiers."
    ],
    consumer: [
      "Write timestamps with their time zone and put the ISO value in `datetime`.",
      "Keep the bar in the same place on every page of the workspace and update it when the period changes.",
      "Announce a state change that happens while the user works (for example in a polite status message)."
    ]
  },
  responsive: [
    "From 48rem the facts sit in one wrapping row.",
    "Below 48rem they become a compact two-column list and the period value drops to body size.",
    "Values wrap anywhere, so long period names and timestamps never overflow at 320px."
  ],
  motion: [
    "No animation."
  ],
  guidance: {
    do: [
      "Put the bar above the first figure the period applies to.",
      "Use the same three state words everywhere: Open, Closing, Certified."
    ],
    avoid: [
      "Showing only one timestamp when late data can change the figures.",
      "Making the bar sticky over content on small screens."
    ]
  },
  related: [
    { slug: "freshness", note: "A single freshness or staleness indicator without period state." },
    { slug: "date-range", note: "Choosing a range, not stating the period of the figures shown." },
    { slug: "scope-trail", note: "Where the user is in a hierarchy of scopes." },
    { slug: "status-lozenge", note: "The sentence variant states the period's state in words." }
  ]
};
