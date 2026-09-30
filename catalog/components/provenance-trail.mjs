export default {
  name: "Provenance trail",
  category: "data",
  behavior: "Application content",
  summary: "Trace displayed output through source, aggregate, analysis, and presentation stages.",
  purpose: {
    description: "A provenance trail explains how a displayed value was produced: an ordered list of stages from source data through aggregation and analysis to presentation, each with a kind label, a name and a small reference such as a version or hash. Forma draws a diamond marker for each stage and a connecting line, and sets the kind and reference in small monospace text. Every fact in the trail is supplied by the application; Forma does not verify or compute any of it.",
    useWhen: [
      "A metric, score or report value must be traceable to its inputs and the transformations applied.",
      "Reviewers need the version of each model, expression or definition used.",
      "A value may be stale or partially derived and users should see which stage is affected."
    ],
    avoidWhen: [
      "The list is a history of events over time: use [[timeline]].",
      "The chain supports a security conclusion with evidence ages and invariants: use [[security-evidence-chain]].",
      "The relationship is a single claim and its evidence: use [[evidence-relationship]].",
      "The path runs between entities in a system map: use [[path-summary]]."
    ],
    characteristics: [
      "Bordered section with an `h3` title and an unstyled ordered list.",
      "Each stage is a small grid (kind, name, reference) with a rotated-square marker; a vertical line connects all but the last stage.",
      "`.ef-provenance-trail__kind` and `small` share small monospace secondary text.",
      "Markers are identical for every stage; stage kind is text."
    ]
  },
  examples: [
    {
      id: "stale-source",
      title: "Trail with a stale source",
      description: "The source stage is older than its expected refresh. The trail says so in words on that stage, so the reader can see that the analysis and presentation are correct for stale input rather than wrong.",
      html: `<ef-provenance-trail class="ef-component-tag">
  <section class="ef-provenance-trail" aria-labelledby="provenance-trail-stale-source-title">
    <h3 id="provenance-trail-stale-source-title">How “Customer satisfaction 4.2” was produced</h3>
    <ol>
      <li><span class="ef-provenance-trail__kind">Source</span><strong>318 survey responses</strong><small>Imported 22 Sep 2026 · Stale: daily import has not run for 7 days</small></li>
      <li><span class="ef-provenance-trail__kind">Aggregate</span><strong>Responses by region</strong><small>Grouping rule v2</small></li>
      <li><span class="ef-provenance-trail__kind">Analysis</span><strong>Weighted mean, 1–5 scale</strong><small>Analysis expression v3</small></li>
      <li><span class="ef-provenance-trail__kind">Presentation</span><strong>Executive summary card</strong><small>Report definition v6</small></li>
    </ol>
  </section>
</ef-provenance-trail>`
    },
    {
      id: "unknown-stage",
      title: "Derivation with an unknown step",
      description: "An imported figure whose transformation step was not recorded. The stage is still listed, with Unknown stated, so the chain does not appear complete when it is not.",
      html: `<ef-provenance-trail class="ef-component-tag">
  <section class="ef-provenance-trail" aria-labelledby="provenance-trail-unknown-stage-title">
    <h3 id="provenance-trail-unknown-stage-title">Provenance of “Carbon intensity 212 g/kWh”</h3>
    <ol>
      <li><span class="ef-provenance-trail__kind">Source</span><strong>Grid operator hourly feed</strong><small>Feed hash <span class="ef-identifier">4be1…90cf</span></small></li>
      <li><span class="ef-provenance-trail__kind">Derivation</span><strong>Unknown</strong><small>Transformation not recorded by the importer</small></li>
      <li><span class="ef-provenance-trail__kind">Presentation</span><strong>Sustainability dashboard</strong><small>Report definition v2</small></li>
    </ol>
  </section>
</ef-provenance-trail>`
    },
    {
      id: "mobile-provenance",
      title: "Mobile provenance trail",
      description: "A four-stage trail at phone width. The marker column is fixed and all text wraps beside it.",
      mobile: {
        height: 420,
        notes: [
          "The trail has no breakpoints: each stage keeps a 2rem inline-start gutter for the marker and connector, and text wraps in the remaining width.",
          "Long references such as hashes should use [[identifier]] so they break at any character at 320px.",
          "The connecting line is a pseudo-element sized to each stage, so it stays attached when text wraps onto several lines.",
          "The trail is not interactive; any links to stage details keep their own touch targets."
        ]
      },
      html: `<ef-provenance-trail class="ef-component-tag">
  <section class="ef-provenance-trail" aria-labelledby="provenance-trail-mobile-provenance-title">
    <h3 id="provenance-trail-mobile-provenance-title">How this score was produced</h3>
    <ol>
      <li><span class="ef-provenance-trail__kind">Source</span><strong>42 accepted assessments</strong><small>Result set <span class="ef-identifier">9D2F4C1A7E0B83F5</span></small></li>
      <li><span class="ef-provenance-trail__kind">Aggregate</span><strong>Governance section</strong><small>Scoring model v3</small></li>
      <li><span class="ef-provenance-trail__kind">Analysis</span><strong>Weighted mean</strong><small>Analysis expression v1</small></li>
      <li><span class="ef-provenance-trail__kind">Presentation</span><strong>Metric card</strong><small>Report definition v4</small></li>
    </ol>
  </section>
</ef-provenance-trail>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-provenance-trail", values: "id of the h3", default: "—", description: "Names the trail after the value it explains." }
    ],
    hooks: {
      "ef-provenance-trail": "Bordered, padded section. Styles its `h3`, its unstyled `ol`, each `li` stage (grid with a diamond marker and connector) and `small` references.",
      "ef-provenance-trail__kind": "Stage kind label (Source, Aggregate, Analysis, Presentation) in small monospace secondary text."
    },
    keyboard: [
      { keys: "None", action: "Static content; links inside stages are reached with Tab as usual." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Stage", how: "li in the trail's ol", description: "Kind, name and reference with a marker and connector." },
    { name: "Final stage", how: ":last-child", description: "No connector below the marker." },
    { name: "Stale, unknown or partial stage", how: "application text in the stage", description: "Stated in words; no special styling." }
  ],
  accessibility: {
    forma: [
      "Uses an ordered list so the stage order and count are announced.",
      "Draws markers and connectors with pseudo-elements, so decoration is never read aloud.",
      "Keeps stage kind as visible text rather than marker shape or color."
    ],
    consumer: [
      "Name the trail after the displayed value it explains.",
      "Include every stage, including unknown ones, so the chain does not look complete when it is not.",
      "State staleness and versions as text; link to stage details if users need them."
    ]
  },
  responsive: [
    "No breakpoints; a fixed 2rem marker gutter and wrapping text work from 320px up.",
    "The section has no fixed width and fits its container."
  ],
  motion: [
    "No animation: the trail is static."
  ],
  guidance: {
    do: [
      "Order stages from source to presentation.",
      "Give each stage a version or reference users can look up."
    ],
    avoid: [
      "Collapsing stages to make the chain look simpler than it is.",
      "Using the trail as a verification result; it describes derivation, not correctness."
    ]
  },
  related: [
    { slug: "security-evidence-chain", note: "Evidence chain supporting a security conclusion, with ages and invariant results." },
    { slug: "metric-card", note: "The displayed value a provenance trail usually explains." },
    { slug: "evidence-relationship", note: "One claim and the evidence that supports or contradicts it." },
    { slug: "timeline", note: "Events over time rather than derivation stages." }
  ]
};
