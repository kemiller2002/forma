export default {
  name: "Facts",
  category: "site",
  behavior: "Site content",
  summary: "Short claims with supporting detail as a description list in a ruled, auto-fitting grid.",
  purpose: {
    description: "Facts present a few short, verifiable claims (a version, a result, a standard) each with one line of supporting detail. The markup is a native description list: each `.ef-facts__item` wraps one `dt` claim and one `dd` detail, so assistive technology hears the pairing. The list lays out as a ruled grid whose columns fit by content using `--ef-layout-fact-min` (11rem).",
    useWhen: [
      "Summarizing two to six headline claims in a hero aside or product section.",
      "Showing release facts such as version, runtime and conformance target.",
      "Each claim is a few words and its detail is one short line."
    ],
    avoidWhen: [
      "Claims need a title, paragraph and link: use [[card-grid]].",
      "Showing live application metrics with change over time: use [[metric-card]] or [[metric-value-change]].",
      "Presenting a record's labelled fields in an application: use [[key-value-list]].",
      "A status that could be missed must be communicated: use [[badge]] with a status or an [[alert]]."
    ],
    characteristics: [
      "Native `dl` semantics: each claim (`dt`) is paired with its detail (`dd`) inside a `div` wrapper, which HTML permits.",
      "Claims are strong primary text; details are small muted text that stays AA on every tone.",
      "Hairline rules separate items without doubling at shared edges."
    ]
  },
  examples: [
    {
      id: "engagement-outcomes",
      title: "Engagement outcomes",
      description: "Four measured outcomes under a heading. On wide containers all four share a row; as the width shrinks the grid drops to two columns, then one.",
      html: `<ef-facts class="ef-component-tag">
  <div class="ef-site">
    <section aria-labelledby="facts-engagement-outcomes-title">
      <h3 id="facts-engagement-outcomes-title">Recent engagements</h3>
      <dl class="ef-facts">
        <div class="ef-facts__item"><dt>40%+ throughput</dt><dd>Delivery flow realigned</dd></div>
        <div class="ef-facts__item"><dt>Hours to minutes</dt><dd>Reconciliation stabilized</dd></div>
        <div class="ef-facts__item"><dt>Zero regressions</dt><dd>Across three release trains</dd></div>
        <div class="ef-facts__item"><dt>6 weeks</dt><dd>From diagnosis to treatment</dd></div>
      </dl>
    </section>
  </div>
</ef-facts>`
    },
    {
      id: "inverse-surface",
      title: "Facts on an inverse section",
      description: "Facts inside a section with `data-ef-tone=\"inverse\"`. Claims, details and rules switch to the inverse tone colors without any per-component override.",
      html: `<ef-facts class="ef-component-tag">
  <div class="ef-site">
    <section class="ef-section" data-ef-tone="inverse" aria-labelledby="facts-inverse-surface-title">
      <h3 id="facts-inverse-surface-title">Release 0.3.0</h3>
      <dl class="ef-facts">
        <div class="ef-facts__item"><dt>Zero runtime</dt><dd>HTML and CSS only</dd></div>
        <div class="ef-facts__item"><dt>WCAG 2.2 AA</dt><dd>Target for stable patterns</dd></div>
        <div class="ef-facts__item"><dt>Pinned</dt><dd>sha256 per asset in forma.lock</dd></div>
      </dl>
    </section>
  </div>
</ef-facts>`
    },
    {
      id: "mobile-stacked",
      title: "Phone stacked facts",
      description: "Three facts, one with a long claim, at phone width. Items stack into a single ruled column.",
      mobile: {
        height: 340,
        notes: [
          "Items fit by content with an 11rem minimum: two columns fit around 390px, and one column at 320px or with larger text.",
          "Long claims and details wrap inside their item; items have `min-inline-size: 0`, so nothing scrolls horizontally.",
          "Rules stay single-width at shared edges in every column count.",
          "Facts are not interactive, so there are no touch targets to size."
        ]
      },
      html: `<ef-facts class="ef-component-tag">
  <div class="ef-site">
    <dl class="ef-facts">
      <div class="ef-facts__item"><dt>Version 0.3.0</dt><dd>Pinned in the site's forma.lock</dd></div>
      <div class="ef-facts__item"><dt>Deterministic distribution builds</dt><dd>Two builds of the same source produce identical files</dd></div>
      <div class="ef-facts__item"><dt>Zero runtime</dt><dd>HTML and CSS only</dd></div>
    </dl>
  </div>
</ef-facts>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section", values: "id of a heading", default: "—", description: "Names the region that contains the facts when the facts are introduced by a heading." }
    ],
    hooks: {
      "ef-facts": "The `dl`. An auto-fit grid with an 11rem minimum column, top and inline-start rules, and a block-space top margin.",
      "ef-facts__item": "The `div` that wraps one `dt` and one `dd`. Draws its end and bottom rules; `dt` is strong text, `dd` is small muted text."
    },
    keyboard: [
      { keys: "—", action: "Not interactive. Facts are read in source order." }
    ],
    events: []
  },
  states: [
    { name: "Default", how: "no attributes", description: "Ruled grid on the surrounding tone." },
    { name: "Toned", how: "data-ef-tone on an ancestor", description: "Claim, detail and rule colors follow the surrounding surface tone." }
  ],
  accessibility: {
    forma: [
      "Keeps native description-list semantics so each claim and its detail are announced together.",
      "Uses tone text pairs that stay AA for both claims and muted details on every tone."
    ],
    consumer: [
      "Introduce the facts with a heading, or keep them next to content that explains them.",
      "Write claims that stand on their own; do not rely on position or layout to relate a claim to its detail.",
      "Keep each item to one `dt` and one `dd`."
    ]
  },
  responsive: [
    "Auto-fit grid with `minmax(min(100%, --ef-layout-fact-min), 1fr)`; columns drop by content, no breakpoints.",
    "Items and text wrap; there is no fixed height, so text-spacing overrides and 200% text do not clip."
  ],
  motion: [
    "No animation: facts are static and have no hover or focus states."
  ],
  guidance: {
    do: [
      "Keep claims short and specific, with numbers or names where possible.",
      "Keep sources for claims available on the page or linked nearby."
    ],
    avoid: [
      "Using facts for navigation or links.",
      "Packing more than about six items into one list."
    ]
  },
  related: [
    { slug: "card-grid", note: "For items with a title, paragraph and optional link." },
    { slug: "key-value-list", note: "For labelled record fields in application UI." },
    { slug: "metric-card", note: "For live metrics with change and status in applications." },
    { slug: "hero", note: "Facts often sit in the hero's supporting aside." }
  ]
};
