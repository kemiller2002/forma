export default {
  name: "Metric card",
  category: "data",
  behavior: "Application content",
  summary: "A compact labeled value with context and optional action, without inventing metric meaning.",
  purpose: {
    description: "A metric card shows one application-supplied number or short value with its label, optional context and an optional link to the underlying records. Forma gives the card a border, a secondary-colored label and a large display-type value that scales with the viewport. It never computes, compares, colors by trend or interprets the value: whether a number is good, bad, stale or unknown is text the application writes.",
    useWhen: [
      "A dashboard or overview needs a few headline values users check at a glance, such as open work or outstanding receivables.",
      "Each value has a clear label and, where needed, context such as the period, freshness or a status in words.",
      "A value leads to a list or report the user can open for detail."
    ],
    avoidWhen: [
      "The value updates live and the update should be marked: use [[metric-value-change]], which adds the neutral update tint and live announcement.",
      "Several related values about one record are shown: use [[key-value-list]].",
      "The number is a proportion of a known range users need to judge: show it with a native `meter` or a [[progress-bar]].",
      "The value needs its derivation explained: pair the card with a [[provenance-trail]] rather than packing it into the card."
    ],
    characteristics: [
      "The value uses the display font at `clamp(2rem, 8vw, 3.5rem)` with a line-height of 1, so it scales down on phones.",
      "Label, value and any following content stack in a single grid column with 0.5rem gaps.",
      "The card is `min-inline-size: 0`, so it can shrink inside [[dashboard-grid]] or [[responsive-grid]] columns.",
      "No color is applied to the value; direction and state must be written as text."
    ]
  },
  examples: [
    {
      id: "unknown-value",
      title: "Value not available",
      description: "The metric source is unavailable. The card shows the word Unknown instead of zero or a dash, and a sentence says why, so a missing number is never read as a real one.",
      html: `<ef-metric-card class="ef-component-tag">
  <article class="ef-metric-card" aria-labelledby="metric-card-unknown-value-label">
    <div class="ef-metric-card__label" id="metric-card-unknown-value-label">Failed payments today</div>
    <div class="ef-metric-card__value">Unknown</div>
    <p><span class="ef-status-lozenge" data-state="unknown">Source unavailable</span></p>
    <p>The payment processor feed has not reported since 06:00 UTC.</p>
  </article>
</ef-metric-card>`
    },
    {
      id: "stale-with-freshness",
      title: "Value with freshness and period",
      description: "The value is stated with its period and a [[freshness]] line, so users can tell how current it is. A trend is written as words (\"down 4 from last week\"), not as a green or red arrow.",
      html: `<ef-metric-card class="ef-component-tag">
  <article class="ef-metric-card" aria-labelledby="metric-card-stale-with-freshness-label">
    <div class="ef-metric-card__label" id="metric-card-stale-with-freshness-label">Open incidents, last 7 days</div>
    <div class="ef-metric-card__value">12</div>
    <p>Down 4 from the previous 7 days.</p>
    <p class="ef-freshness"><span class="ef-freshness__label">Last updated</span> <time datetime="2026-09-29T05:00:00Z">05:00 UTC</time> <span>Stale: refresh overdue by 2 hours</span></p>
    <a href="#metric-card-stale-with-freshness-incidents">View incidents</a>
  </article>
</ef-metric-card>`
    },
    {
      id: "dashboard-row",
      title: "Dashboard row with long labels",
      description: "Three cards in a [[dashboard-grid]]. Labels of different lengths wrap inside their cards; the value scale stays the same across cards, so no value looks more important than another.",
      html: `<ef-metric-card class="ef-component-tag">
  <section class="ef-dashboard-grid" aria-label="Receivables overview">
    <article class="ef-metric-card"><div class="ef-metric-card__label">Outstanding receivables across all subsidiaries</div><div class="ef-metric-card__value">$1,204,500</div><p>As of 29 Sep 2026.</p></article>
    <article class="ef-metric-card"><div class="ef-metric-card__label">Overdue</div><div class="ef-metric-card__value">$212,040</div><p>31 invoices past due.</p></article>
    <article class="ef-metric-card"><div class="ef-metric-card__label">Disputed</div><div class="ef-metric-card__value">0</div><p>No open disputes.</p></article>
  </section>
</ef-metric-card>`
    },
    {
      id: "mobile-metric-stack",
      title: "Mobile metric stack",
      description: "Two cards at phone width. The value shrinks toward its 2rem minimum and each card keeps its label, context and link in reading order.",
      mobile: {
        height: 420,
        notes: [
          "The value size follows `clamp(2rem, 8vw, 3.5rem)`: about 2rem at 320px and 390px, reaching 3.5rem only at wide viewports.",
          "Inside [[dashboard-grid]] the cards collapse to one column at 40rem and below, keeping the application's order.",
          "Long labels and context text wrap; the card has `min-inline-size: 0` so it never forces horizontal scrolling.",
          "The trailing link is an ordinary inline link; keep its text descriptive so it is a usable tap target on its own line.",
          "Rotation only changes the value's viewport-relative size between the clamp bounds."
        ]
      },
      html: `<ef-metric-card class="ef-component-tag">
  <div class="ef-stack" data-density="compact">
    <article class="ef-metric-card">
      <div class="ef-metric-card__label">Needs attention</div>
      <div class="ef-metric-card__value">7</div>
      <p><span class="ef-status-lozenge" data-state="attention">3 overdue</span></p>
      <a href="#metric-card-mobile-metric-stack-attention">Open attention queue</a>
    </article>
    <article class="ef-metric-card">
      <div class="ef-metric-card__label">Completed this month</div>
      <div class="ef-metric-card__value">42</div>
      <p>Through 29 September.</p>
    </article>
  </div>
</ef-metric-card>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "article.ef-metric-card", values: "id of .ef-metric-card__label", default: "—", description: "Names the card by its label when several cards appear together." },
      { name: "datetime", on: "time", values: "ISO date-time", default: "—", description: "Machine-readable update time in freshness context." },
      { name: "href", on: "a", values: "URL", default: "—", description: "Optional link to the records behind the value." }
    ],
    hooks: {
      "ef-metric-card": "The card root, usually an `article`. Bordered grid with 1.25rem padding and 0.5rem gaps; shrinkable to zero width.",
      "ef-metric-card__label": "The metric's label in secondary text color, 0.8125rem, semibold.",
      "ef-metric-card__value": "The value in the display font at `clamp(2rem, 8vw, 3.5rem)`, line-height 1."
    },
    keyboard: [
      { keys: "Tab", action: "Reaches the optional link or button in the card. The card itself is not focusable." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Known value", how: "application text in .ef-metric-card__value", description: "The number or short value in display type." },
    { name: "Unknown or unavailable", how: "application text such as Unknown plus context", description: "Forma has no special styling; the words carry the state." },
    { name: "Stale", how: "context text, for example a [[freshness]] line", description: "The age of the value is stated next to it." },
    { name: "Updated", how: "data-ef-value-change on the value (see [[metric-value-change]])", description: "A neutral tint briefly marks an application-published update." }
  ],
  accessibility: {
    forma: [
      "Label and value are real text in reading order, so screen readers read the label before the value.",
      "The value has no color coding, so meaning never depends on hue.",
      "Text uses semantic color tokens that map to system colors in forced-colors mode."
    ],
    consumer: [
      "Name the card with `aria-labelledby` on the label when cards are presented as a group.",
      "Write units, period and direction as text (\"Down 4 from last week\").",
      "Show Unknown, Unavailable or Stale explicitly; never substitute zero.",
      "Give links descriptive text rather than \"More\"."
    ]
  },
  responsive: [
    "Intrinsic width: the card shrinks to its container (`min-inline-size: 0`).",
    "The value scales with the viewport between 2rem and 3.5rem.",
    "Arrange several cards with [[dashboard-grid]] (three columns, one at 40rem and below) or [[responsive-grid]].",
    "Very long unbroken values can still exceed a narrow card; keep values short or format them with separators."
  ],
  motion: [
    "No animation on the card itself. Marking a live update is the separate [[metric-value-change]] contract, which tints the value with a neutral perceptual fade and never counts through numbers."
  ],
  guidance: {
    do: [
      "Pair each value with its period and, for live data, its freshness.",
      "Link to the records behind the number when users will want to act on it."
    ],
    avoid: [
      "Coloring the value green or red to imply good or bad.",
      "Animating numbers counting up; show the authoritative value immediately.",
      "Showing zero or a dash when the value is unknown."
    ]
  },
  related: [
    { slug: "metric-value-change", note: "The same card when the application publishes a new value and wants the update marked." },
    { slug: "dashboard-grid", note: "Lays out several metric cards in columns that collapse on phones." },
    { slug: "freshness", note: "States how current a value is." },
    { slug: "key-value-list", note: "Several labelled values about one object, in smaller type." },
    { slug: "progress-bar", note: "Shows completion of a determinate task rather than a standalone value." }
  ]
};
