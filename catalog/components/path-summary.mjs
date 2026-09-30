export default {
  name: "Path summary",
  category: "data",
  behavior: "Application content",
  summary: "Provides an ordered textual representation of a selected relationship or evidence path.",
  purpose: {
    description: "A path summary spells out one selected route through a set of related entities as a numbered list: each step is an entity (usually a link) followed by the relationship that leads to the next one. It is the text form of a highlighted path in a [[diagram]], dependency graph or evidence chain, so the route can be read, linked and announced without seeing the drawing. Forma provides the numbered layout; the path, its wording and its current step are application data.",
    useWhen: [
      "A user has selected or been shown a route between two entities, such as how data flows from source to report.",
      "An evidence path must be read in order, from claim to source or source to claim.",
      "A spatial highlight needs an accessible, ordered equivalent."
    ],
    avoidWhen: [
      "All relationships of one entity are listed: use [[relationship-index]].",
      "The stages describe how a value was computed: use [[provenance-trail]].",
      "The list is a navigation trail of pages: use [[scope-trail]].",
      "The user is progressing through a task: use [[steps]]."
    ],
    characteristics: [
      "Section grid with a header (title and a count) and an ordered list with visible numbers.",
      "Each step shows the entity on one line and the relationship phrase on the next (`span` is block).",
      "Steps are spaced 0.5rem apart with a 1.5rem numbering gutter.",
      "`aria-current=\"step\"` can mark the selected or final step; Forma adds no visual styling for it."
    ]
  },
  examples: [
    {
      id: "evidence-path",
      title: "Evidence path from claim to source",
      description: "How a readiness claim traces back to raw test output. Each relationship phrase is written to read naturally into the next step, and the final step is the source.",
      html: `<ef-path-summary class="ef-component-tag">
  <section class="ef-path-summary" aria-labelledby="path-summary-evidence-path-title">
    <header><h2 id="path-summary-evidence-path-title">Evidence path for “Release is ready”</h2><p>4 steps, claim to source</p></header>
    <ol class="ef-path-summary__steps">
      <li><a href="#path-summary-evidence-path-claim">Release readiness claim</a><span>is supported by</span></li>
      <li><a href="#path-summary-evidence-path-gate">Quality gate QG-17</a><span>which evaluated</span></li>
      <li><a href="#path-summary-evidence-path-run">CI run 1187</a><span>which produced</span></li>
      <li aria-current="step"><a href="#path-summary-evidence-path-log">Test report artifact</a><span>the original source</span></li>
    </ol>
  </section>
</ef-path-summary>`
    },
    {
      id: "broken-path",
      title: "Path with an unknown link",
      description: "The route from an order to its shipment has a gap: the relationship between the warehouse pick and the carrier handoff was not recorded. The step still appears, stating Unknown, so the path does not look continuous when it is not.",
      html: `<ef-path-summary class="ef-component-tag">
  <section class="ef-path-summary" aria-labelledby="path-summary-broken-path-title">
    <header><h2 id="path-summary-broken-path-title">Order ORD-5521 to delivery</h2><p>3 known relationships, 1 unknown</p></header>
    <ol class="ef-path-summary__steps">
      <li><a href="#path-summary-broken-path-order">Order ORD-5521</a><span>was allocated to</span></li>
      <li><a href="#path-summary-broken-path-pick">Pick list PL-880</a><span>unknown relationship to the next step: handoff not recorded</span></li>
      <li><a href="#path-summary-broken-path-carrier">Carrier consignment NL-44102</a><span>was delivered as</span></li>
      <li aria-current="step"><a href="#path-summary-broken-path-pod">Proof of delivery</a><span>signed 28 Sep 2026</span></li>
    </ol>
  </section>
</ef-path-summary>`
    },
    {
      id: "mobile-path",
      title: "Mobile data flow path",
      description: "A three-step data flow at phone width. Entity and relationship text wrap within each numbered step.",
      mobile: {
        height: 360,
        notes: [
          "No breakpoints: the numbered list keeps its 1.5rem gutter and every step wraps within the remaining width.",
          "Entity links and relationship phrases are on separate lines, so long names do not run into the relationship text at 320px.",
          "Links are ordinary inline links; keep entity names as link text so each is a clear tap target.",
          "Orientation changes only affect line wrapping."
        ]
      },
      html: `<ef-path-summary class="ef-component-tag">
  <section class="ef-path-summary" aria-labelledby="path-summary-mobile-path-title">
    <header><h2 id="path-summary-mobile-path-title">Selected path</h2><p>3 relationships</p></header>
    <ol class="ef-path-summary__steps">
      <li><a href="#path-summary-mobile-path-chrona">Chrona time tracking</a><span>provides time entries to</span></li>
      <li><a href="#path-summary-mobile-path-billing">Billing</a><span>creates billable charges for</span></li>
      <li aria-current="step"><a href="#path-summary-mobile-path-summa">Summa general ledger</a><span>records the invoice</span></li>
    </ol>
  </section>
</ef-path-summary>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-path-summary", values: "id of the header heading", default: "—", description: "Names the path." },
      { name: "aria-current", on: "li", values: "step", default: "absent", description: "Optionally marks the selected or final step for assistive technology. Not styled by Forma." },
      { name: "href", on: "a", values: "URL or fragment", default: "—", description: "Links each entity to its view or node." }
    ],
    hooks: {
      "ef-path-summary": "Root section; a grid with 0.75rem gaps. Removes the trailing margin of the header's last child.",
      "ef-path-summary__steps": "The numbered `ol`: 0.5rem gaps, 1.5rem inline-start gutter; each `li` has a small inline-start padding and its `span` is displayed as a block below the entity."
    },
    keyboard: [
      { keys: "Tab", action: "Moves through the entity links in path order." },
      { keys: "Enter", action: "Follows the focused link (native)." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Step", how: "li in .ef-path-summary__steps", description: "Entity plus relationship to the next step." },
    { name: "Current or final step", how: "aria-current=\"step\"", description: "Exposed to assistive technology; no visual change from Forma." },
    { name: "Unknown link", how: "application text in the step's span", description: "Stated in words so gaps are visible." }
  ],
  accessibility: {
    forma: [
      "Uses an ordered list with visible numbers, so sequence is conveyed both visually and programmatically.",
      "Keeps entity and relationship text as real text in reading order."
    ],
    consumer: [
      "Write relationship phrases so the path reads as sentences from step to step.",
      "State the direction of the path in the header (claim to source, source to report).",
      "Include unknown or unverified links explicitly.",
      "If `aria-current` should also be visible, add visible text such as \"(selected)\"."
    ]
  },
  responsive: [
    "No breakpoints; steps wrap within the container from 320px up.",
    "The numbering gutter is fixed at 1.5rem."
  ],
  motion: [
    "No animation: the summary is static and replaced by the application when the selected path changes."
  ],
  guidance: {
    do: [
      "Keep the path in the same order as the highlighted route in any accompanying diagram.",
      "Show the number of steps or relationships in the header."
    ],
    avoid: [
      "Arrows or connector glyphs as the only statement of relationship.",
      "Omitting steps to shorten the path."
    ]
  },
  related: [
    { slug: "relationship-index", note: "All relationships of one entity, grouped by type." },
    { slug: "provenance-trail", note: "Derivation stages of a displayed value." },
    { slug: "evidence-relationship", note: "A single claim-to-evidence link with scope and standing." },
    { slug: "diagram", note: "The spatial view whose highlighted route this summarizes." }
  ]
};
