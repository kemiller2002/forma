export default {
  name: "Evidence relationship",
  category: "data",
  behavior: "Application content",
  summary: "Makes claim-to-evidence relationship type and scope explicit rather than relying on proximity alone.",
  purpose: {
    description: "An evidence relationship states, in one article, a claim, the type of relationship the evidence has to it (supports, contradicts, partially supports), the evidence itself, its source and the scope it covers, plus its current standing. Placing evidence next to a claim does not say how they relate; this component makes the relationship type a visible label. Forma lays out the header, body and footer; the relationship type, scope and status are application facts and Forma never infers them.",
    useWhen: [
      "A claim (ready to deploy, control is effective, requirement met) is backed or challenged by specific evidence.",
      "The evidence covers a particular scope (commit, environment, period) that may differ from the claim's scope.",
      "Reviewers must see whether evidence is current, stale or superseded."
    ],
    avoidWhen: [
      "A value's full derivation chain is shown: use [[provenance-trail]].",
      "Several relationships of one entity are listed: use [[relationship-index]].",
      "A security conclusion's evidence chain with ages is shown: use [[security-evidence-chain]] and [[security-evidence-age]].",
      "The user must verify values before acting: compose inside [[verification-frame]]."
    ],
    characteristics: [
      "Article grid with 0.75rem gaps: header (relationship type and claim), body, footer.",
      "The relationship type is text in the header, typically a `.ef-component-kicker`.",
      "The body is a grid of short labelled statements (Evidence, Source, Scope).",
      "Trailing margins inside the header and body are removed so the card stays compact."
    ]
  },
  examples: [
    {
      id: "contradicting-evidence",
      title: "Contradicting evidence",
      description: "A load test contradicts the claim that the service meets its latency target. The relationship type Contradicts is the first thing read, and the footer states the evidence is current.",
      html: `<ef-evidence-relationship class="ef-component-tag">
  <article class="ef-evidence-relationship" aria-labelledby="evidence-relationship-contradicting-evidence-claim">
    <header>
      <p class="ef-component-kicker">Contradicts</p>
      <h2 id="evidence-relationship-contradicting-evidence-claim">Claim: checkout meets the 400 ms p95 latency target</h2>
    </header>
    <div class="ef-evidence-relationship__body">
      <p><strong>Evidence:</strong> Load test measured 612 ms p95 at 2,000 requests per second.</p>
      <p><strong>Source:</strong> Performance run PR-5520</p>
      <p><strong>Scope:</strong> EU West, release candidate rel-2026.10-rc2</p>
    </div>
    <footer><span class="ef-status-lozenge">Current</span></footer>
  </article>
</ef-evidence-relationship>`
    },
    {
      id: "partial-scope",
      title: "Evidence covering part of the scope",
      description: "Tests passed, but only for one of the two platforms the claim covers. The relationship is Partially supports, the scope line names what is covered, and the footer says the evidence is stale because a newer commit exists.",
      html: `<ef-evidence-relationship class="ef-component-tag">
  <article class="ef-evidence-relationship" aria-labelledby="evidence-relationship-partial-scope-claim">
    <header>
      <p class="ef-component-kicker">Partially supports</p>
      <h2 id="evidence-relationship-partial-scope-claim">Claim: the mobile app is ready for release</h2>
    </header>
    <div class="ef-evidence-relationship__body">
      <p><strong>Evidence:</strong> UI regression suite passed, 412 of 412 tests.</p>
      <p><strong>Source:</strong> CI run 1187</p>
      <p><strong>Scope:</strong> Android only, commit <span class="ef-identifier">a41c9e0</span>. iOS has no run for this commit.</p>
    </div>
    <footer><span class="ef-status-lozenge" data-state="unknown">Stale: 3 newer commits</span></footer>
  </article>
</ef-evidence-relationship>`
    },
    {
      id: "mobile-evidence",
      title: "Mobile evidence relationship",
      description: "A supporting relationship at phone width. The single-column layout is unchanged; long claims and scope lines wrap.",
      mobile: {
        height: 380,
        notes: [
          "The component is a single-column grid at every width, so there are no breakpoints.",
          "Long claims and scope statements wrap; identifiers should use [[identifier]] so hashes break safely at 320px.",
          "The footer status keeps its text and glyph; a [[status-lozenge]] does not wrap internally, so keep its text short.",
          "Links inside the body keep their own touch targets; the article itself is not interactive."
        ]
      },
      html: `<ef-evidence-relationship class="ef-component-tag">
  <article class="ef-evidence-relationship" aria-labelledby="evidence-relationship-mobile-evidence-claim">
    <header>
      <p class="ef-component-kicker">Supports</p>
      <h2 id="evidence-relationship-mobile-evidence-claim">Claim: backups are restorable</h2>
    </header>
    <div class="ef-evidence-relationship__body">
      <p><strong>Evidence:</strong> Monthly restore drill completed in 38 minutes.</p>
      <p><strong>Source:</strong> <a href="#evidence-relationship-mobile-evidence-drill">Restore drill record DR-0926</a></p>
      <p><strong>Scope:</strong> Production database, snapshot of 26 Sep 2026</p>
    </div>
    <footer><span class="ef-status-lozenge" data-state="ok">Current</span></footer>
  </article>
</ef-evidence-relationship>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "article.ef-evidence-relationship", values: "id of the claim heading", default: "—", description: "Names the article by its claim." }
    ],
    hooks: {
      "ef-evidence-relationship": "Root article; a grid of header, body and footer with 0.75rem gaps. Removes the trailing margin of the header's last child.",
      "ef-evidence-relationship__body": "Grid of labelled evidence statements with 0.5rem gaps; its last child has no bottom margin."
    },
    keyboard: [
      { keys: "None", action: "Static content; links inside the body are reached with Tab." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Relationship type", how: "text in the header (Supports, Contradicts, Partially supports)", description: "Supplied by the application; Forma applies no type-specific styling." },
    { name: "Evidence standing", how: "[[status-lozenge]] text in the footer", description: "Current, Stale, Superseded and so on, stated in words." }
  ],
  accessibility: {
    forma: [
      "Uses an article with a header, body and footer so the structure is exposed.",
      "Presents relationship type and standing as text, never as color or position alone."
    ],
    consumer: [
      "Put the relationship type before the claim heading so it is read first.",
      "Label each body statement (Evidence, Source, Scope) in visible text.",
      "State when scope differs from the claim, and when evidence is stale or superseded.",
      "Choose the heading level to fit the page outline."
    ]
  },
  responsive: [
    "Single column at every width; no breakpoints.",
    "Text wraps; the article fits its container."
  ],
  motion: [
    "No animation: the component is static."
  ],
  guidance: {
    do: [
      "Use a fixed, application-defined vocabulary of relationship types.",
      "Show scope for every piece of evidence."
    ],
    avoid: [
      "Implying support by placing evidence next to a claim without a relationship label.",
      "Treating stale evidence as proof of current state."
    ]
  },
  related: [
    { slug: "provenance-trail", note: "How a value was derived, stage by stage." },
    { slug: "relationship-index", note: "All relationships of one entity, listed by type." },
    { slug: "security-evidence-chain", note: "Security-specific evidence chain with invariants and ages." },
    { slug: "freshness", note: "States how current a piece of evidence is." }
  ]
};
