export default {
  name: "Security trend",
  category: "security",
  behavior: "Aegis / application",
  summary: "Presents security change over time with state and context independent of color.",
  purpose: {
    description: "A security trend lists how security results changed compared with a named baseline, usually the previous assessed artifact. Each entry leads with its direction in words (Regression, Improvement, Unchanged or No measurement) and then states what changed with both values, such as \"Unknown security effects increased from 0 to 2\". Direction is never implied by an arrow or color alone, and a missing measurement is shown as its own entry rather than as zero change. Tutela supplies the comparison; Forma presents it without computing deltas or judging whether a change is good.",
    useWhen: [
      "A release review needs to show what got better or worse since the previous artifact.",
      "Regressions in unknowns or stale evidence must be as visible as new violations.",
      "Some measurements were unavailable for the baseline and readers must know that."
    ],
    avoidWhen: [
      "You need the current counts rather than the change: use [[security-state-matrix]].",
      "You need a plotted time series across many artifacts: use a chart with a text alternative; this component lists discrete changes.",
      "You need a general before/after metric: use [[metric-value-change]]."
    ],
    characteristics: [
      "An introductory sentence names the baseline being compared.",
      "Each entry is a list item with a bold direction word followed by a sentence giving both values.",
      "`data-direction` records the machine direction; entries share one visual treatment.",
      "No arrows, sparklines or color are required to understand any entry."
    ]
  },
  examples: [
    {
      id: "unchanged",
      title: "Nothing changed since the last release",
      description: "A comparison where every tracked measure is unchanged. Each measure is still listed with its value, so \"no change\" is an explicit statement rather than an empty list.",
      html: `<ef-security-trend class="ef-component-tag">
  <section class="ef-security-trend" aria-labelledby="security-trend-unchanged-title">
    <h2 id="security-trend-unchanged-title">Security trend</h2>
    <p>Compared with release 4.11.0, assessed <time datetime="2026-09-12">12 Sep 2026</time>.</p>
    <ul>
      <li data-direction="unchanged"><strong>Unchanged</strong><span>Violated invariants stayed at 0.</span></li>
      <li data-direction="unchanged"><strong>Unchanged</strong><span>Unknown security effects stayed at 1.</span></li>
      <li data-direction="unchanged"><strong>Unchanged</strong><span>Active exceptions stayed at 2.</span></li>
    </ul>
  </section>
</ef-security-trend>`
    },
    {
      id: "first-assessment",
      title: "First assessment with no baseline",
      description: "There is no previous artifact, so every entry is No measurement. The component does not present current values as improvements or regressions.",
      html: `<ef-security-trend class="ef-component-tag">
  <section class="ef-security-trend" aria-labelledby="security-trend-first-assessment-title">
    <h2 id="security-trend-first-assessment-title">Security trend</h2>
    <p>No previous assessed artifact exists for this service.</p>
    <ul>
      <li data-direction="unknown"><strong>No measurement</strong><span>Violated invariants: 1 now, no baseline.</span></li>
      <li data-direction="unknown"><strong>No measurement</strong><span>Unknown security effects: 3 now, no baseline.</span></li>
    </ul>
  </section>
</ef-security-trend>`
    },
    {
      id: "mobile",
      title: "Security trend on a phone",
      description: "Mixed directions with long explanations at phone width.",
      mobile: {
        height: 440,
        notes: [
          "Entries stack in a single-column grid at every width, with the direction word on its own line above the explanation.",
          "Explanations use `overflow-wrap: anywhere`, so long measure names and values wrap without horizontal scrolling.",
          "Entries are not interactive, so no touch targets need sizing.",
          "Portrait and landscape show the same order; only line breaks change."
        ]
      },
      html: `<ef-security-trend class="ef-component-tag">
  <section class="ef-security-trend" aria-labelledby="security-trend-mobile-title">
    <h2 id="security-trend-mobile-title">Security trend</h2>
    <p>Compared with the previous assessed artifact.</p>
    <ul>
      <li data-direction="regression"><strong>Regression</strong><span>Unknown security effects increased from 0 to 2, both at the network egress boundary.</span></li>
      <li data-direction="improvement"><strong>Improvement</strong><span>Stale evidence decreased from 3 to 1.</span></li>
      <li data-direction="unknown"><strong>No measurement</strong><span>Exception aging was not measured for the previous artifact.</span></li>
    </ul>
  </section>
</ef-security-trend>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-security-trend", values: "id of the heading", default: "—", description: "Names the region by its heading." },
      { name: "data-direction", on: "li", values: "regression | improvement | unchanged | unknown", default: "—", description: "Machine direction supplied by Tutela. Not styled by Forma CSS; the bold direction word is the visible cue." },
      { name: "datetime", on: "time", values: "ISO 8601 date", default: "—", description: "Machine-readable baseline date." }
    ],
    hooks: {
      "ef-security-trend": "Root section: bordered, padded primary surface. Its list is an unstyled single-column grid; each entry is a grid with a 0.3rem start border in the current text color and a secondary surface, and its span wraps anywhere."
    },
    keyboard: [
      { keys: "—", action: "Not interactive unless the application adds links in entry text." }
    ],
    events: [
      { name: "—", description: "No events." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Regression", how: "data-direction=\"regression\" + text Regression", description: "A security measure got worse." },
    { name: "Improvement", how: "data-direction=\"improvement\" + text Improvement", description: "A security measure got better." },
    { name: "Unchanged", how: "data-direction=\"unchanged\" + text Unchanged", description: "The measure is the same; the value is still stated." },
    { name: "No measurement", how: "data-direction=\"unknown\" + text No measurement", description: "The baseline or current value is missing; not treated as unchanged." }
  ],
  accessibility: {
    forma: [
      "Leads each entry with a direction word; all entries share one visual treatment, so color is never the cue.",
      "Uses a semantic list so the number of changes is announced."
    ],
    consumer: [
      "Name the baseline in the introductory sentence.",
      "State both the previous and current value in each entry.",
      "Report missing measurements as No measurement, never as zero change.",
      "Do not reorder entries to put improvements first."
    ]
  },
  responsive: [
    "The section has zero minimum inline size; the list is a single-column grid at every width.",
    "Explanations wrap anywhere. No breakpoints are needed."
  ],
  motion: [
    "No animation: the trend is static text; there are no animated arrows or counters."
  ],
  guidance: {
    do: [
      "Treat increases in unknowns and stale evidence as regressions when Tutela reports them so.",
      "Keep the vocabulary consistent: Regression, Improvement, Unchanged, No measurement."
    ],
    avoid: [
      "Showing only up and down arrows.",
      "Computing a net trend score across measures."
    ]
  },
  related: [
    { slug: "security-state-matrix", note: "Current counts by state rather than change over time." },
    { slug: "metric-value-change", note: "General before/after metric presentation outside security results." },
    { slug: "security-evidence-age", note: "Freshness of individual evidence records." }
  ]
};
