export default {
  name: "Emphasis budget",
  category: "verification",
  behavior: "Application content",
  summary: "Declares bounded primary, secondary, and supporting emphasis so competing regions cannot all claim the strongest visual priority.",
  owns: ["ef-emphasis-budget","ef-emphasis-label"],
  purpose: {
    description: "An emphasis budget is a declared limit on visual competition within one decision region. The root carries `data-emphasis-budget=\"one-primary\"`, and each direct region claims `data-emphasis=\"primary\"`, `\"secondary\"` or `\"supporting\"`. Exactly one direct region may be primary. Forma draws three clearly different weights (a framed primary, a secondary with an inline-start rule, supporting items with a thin top rule) and pairs each with a visible `.ef-emphasis-label`, so the level stays readable with color, borders and tint removed. The budget is checked by tests and review, not enforced by CSS, and the application decides which content deserves each level.",
    useWhen: [
      "A consequential decision screen has several regions that could all look important, and one must clearly lead.",
      "Teams want a reviewable, testable rule that stops every panel from being styled as primary.",
      "Nested areas of a page are independent decisions that each need their own single primary."
    ],
    avoidWhen: [
      "The concern is reading order across steps rather than emphasis weight: use [[attention-path]].",
      "The flow is recognize, verify, act before a transition: use [[verification-frame]].",
      "Only layout width should favor one item: use [[priority-stack]].",
      "The content is a status message: use [[alert]] or [[callout]]."
    ],
    characteristics: [
      "Primary: 2px functional border, surface background and full padding.",
      "Secondary: 0.2rem inline-start rule and lighter padding.",
      "Supporting: thin top rule, laid out in an auto-fit grid via `.ef-emphasis-budget__support`.",
      "Every level carries a visible text label, so emphasis survives grayscale and forced colors.",
      "Nested budgets are allowed and are evaluated separately, against their own direct children."
    ]
  },
  examples: [
    {
      id: "access-request",
      title: "Access request decision",
      description: "A single budget for an access request: the primary region holds the decision, the secondary region the requester's justification, and three supporting facts sit in the support grid. Only the primary region contains actions.",
      html: `<ef-emphasis-budget class="ef-component-tag">
  <section class="ef-emphasis-budget" data-emphasis-budget="one-primary" aria-labelledby="emphasis-budget-access-request-title">
    <header>
      <p class="ef-component-kicker">Access requests</p>
      <h2 id="emphasis-budget-access-request-title">Production database access</h2>
    </header>
    <section data-emphasis="primary" aria-labelledby="emphasis-budget-access-request-primary">
      <p class="ef-emphasis-label">Primary</p>
      <h3 id="emphasis-budget-access-request-primary">Grant read access to prod-billing for 8 hours?</h3>
      <p>Requested by Luis Ferreira for incident INC-3312.</p>
      <div class="ef-cluster"><button type="button">Grant for 8 hours</button><button type="button">Decline</button></div>
    </section>
    <section data-emphasis="secondary" aria-labelledby="emphasis-budget-access-request-secondary">
      <p class="ef-emphasis-label">Secondary</p>
      <h3 id="emphasis-budget-access-request-secondary">Justification</h3>
      <p>Needs to confirm whether duplicate invoices were written during the 09:12 outage.</p>
    </section>
    <div class="ef-emphasis-budget__support">
      <section data-emphasis="supporting"><p class="ef-emphasis-label">Supporting</p><h3>Previous grants</h3><p>2 in the last 90 days, both expired normally.</p></section>
      <section data-emphasis="supporting"><p class="ef-emphasis-label">Supporting</p><h3>Scope</h3><p>Read only. No export permission.</p></section>
      <section data-emphasis="supporting"><p class="ef-emphasis-label">Supporting</p><h3>Policy</h3><p>Production access needs one approver from Platform.</p></section>
    </div>
  </section>
</ef-emphasis-budget>`
    },
    {
      id: "nested-budgets",
      title: "Nested independent budgets",
      description: "The page-level decision has one primary region. A supporting region contains its own independent budget, with its own single primary for a separate sub-decision. Each budget is counted against its direct children only, so this is valid.",
      html: `<ef-emphasis-budget class="ef-component-tag">
  <section class="ef-emphasis-budget" data-emphasis-budget="one-primary" aria-labelledby="emphasis-budget-nested-title">
    <h2 id="emphasis-budget-nested-title">Quarter close</h2>
    <section data-emphasis="primary" aria-labelledby="emphasis-budget-nested-primary">
      <p class="ef-emphasis-label">Primary</p>
      <span class="ef-status-lozenge" data-state="unknown">Insufficient data</span>
      <h3 id="emphasis-budget-nested-primary">Close Q3 once the EMEA ledger reports</h3>
      <p>The EMEA ledger has not supplied September totals. Closing now would record an incomplete quarter.</p>
    </section>
    <section data-emphasis="supporting" aria-labelledby="emphasis-budget-nested-sub">
      <p class="ef-emphasis-label">Supporting</p>
      <h3 id="emphasis-budget-nested-sub">EMEA ledger</h3>
      <div class="ef-emphasis-budget" data-emphasis-budget="one-primary">
        <section data-emphasis="primary"><p class="ef-emphasis-label">Primary</p><p>Request the September totals from the EMEA controller.</p><button type="button">Send request</button></section>
        <section data-emphasis="secondary"><p class="ef-emphasis-label">Secondary</p><p>Last report received 3 October.</p></section>
      </div>
    </section>
  </section>
</ef-emphasis-budget>`
    },
    {
      id: "mobile-decision",
      title: "Mobile decision",
      description: "At phone width all levels stack in source order and the primary action becomes a wrapping, full-height button.",
      mobile: {
        height: 600,
        notes: [
          "The support grid uses `minmax(min(100%, 15rem), 1fr)`, so supporting regions stack into one column on phones.",
          "At 30rem and below a button directly inside the primary region wraps its text and grows in height while keeping a 2.75rem minimum.",
          "Status lozenges inside the budget wrap at 30rem and below instead of widening the page.",
          "Every region and label wraps with `overflow-wrap: anywhere`, so long identifiers and 200% text stay within 320px in any orientation."
        ]
      },
      html: `<ef-emphasis-budget class="ef-component-tag">
  <section class="ef-emphasis-budget" data-emphasis-budget="one-primary" aria-labelledby="emphasis-budget-mobile-title">
    <h2 id="emphasis-budget-mobile-title">Refund request R-5520</h2>
    <section data-emphasis="primary" aria-labelledby="emphasis-budget-mobile-primary">
      <p class="ef-emphasis-label">Primary</p>
      <h3 id="emphasis-budget-mobile-primary">Refund $84.00 to the original card?</h3>
      <button type="button">Refund $84.00 to card ending 4412</button>
    </section>
    <section data-emphasis="secondary" aria-labelledby="emphasis-budget-mobile-secondary">
      <p class="ef-emphasis-label">Secondary</p>
      <h3 id="emphasis-budget-mobile-secondary">Reason</h3>
      <p>Item arrived damaged; photo attached.</p>
    </section>
    <div class="ef-emphasis-budget__support">
      <section data-emphasis="supporting"><p class="ef-emphasis-label">Supporting</p><h3>Customer</h3><p>First refund in 2 years.</p></section>
    </div>
  </section>
</ef-emphasis-budget>`
    }
  ],
  api: {
    attributes: [
      { name: "data-emphasis-budget", on: "root", values: "one-primary", default: "absent", description: "Declares the budget: exactly one direct child region may claim primary. Checked by tests and review; CSS does not enforce it." },
      { name: "data-emphasis", on: "regions inside the budget", values: "primary | secondary | supporting", default: "absent", description: "The region's claimed emphasis level. Chosen by the application from domain state; never implies severity, authority or legality." },
      { name: "aria-labelledby", on: "root and regions", values: "id of a heading", default: "—", description: "Names the budget and its main regions by their headings." },
      { name: "data-state", on: ".ef-status-lozenge", values: "ok | attention | blocked | unknown", default: "absent", description: "Adds a status symbol to a text status inside a region." }
    ],
    hooks: {
      "ef-emphasis-budget": "Root grid. Styles any descendant `[data-emphasis]` region by its level; can be nested for independent sub-decisions.",
      "ef-emphasis-budget__support": "Auto-fit grid (regions at least 15rem) for supporting regions.",
      "ef-emphasis-label": "Small mono uppercase text label stating the region's level. Place it as the first child of each region so the level survives visual-channel removal.",
      "data-emphasis": "Level hook read by the CSS: primary (framed), secondary (inline-start rule), supporting (top rule).",
      "data-emphasis-budget": "Declarative budget marker read by conformance tests; it has no styling."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through actions in source order. Emphasis never changes focus order." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Primary", how: "data-emphasis=\"primary\"", description: "2px border, surface background, full padding." },
    { name: "Secondary", how: "data-emphasis=\"secondary\"", description: "0.2rem inline-start rule, lighter padding." },
    { name: "Supporting", how: "data-emphasis=\"supporting\"", description: "Thin top rule and small block padding." },
    { name: "Forced colors", how: "@media (forced-colors: active)", description: "All levels use CanvasText borders on Canvas; the text labels distinguish them." }
  ],
  accessibility: {
    forma: [
      "Gives each level a distinct structural treatment (frame, side rule, top rule) rather than a color difference.",
      "Provides a text label class so the level is readable in grayscale, forced colors and with borders removed.",
      "Wraps text anywhere and keeps regions within 100% width at 320px and 200% text."
    ],
    consumer: [
      "Put exactly one `primary` among the direct regions of each budget.",
      "Include an `.ef-emphasis-label` in every region; do not rely on the frame alone.",
      "Keep headings, text states and source order correct; emphasis does not replace them.",
      "Derive emphasis from application state, and never use it to express severity, permission or legality."
    ]
  },
  responsive: [
    "Root, regions and support grid set `min-inline-size: 0` and `max-inline-size: 100%`; every `[data-emphasis]` region wraps anywhere.",
    "Support grid: `repeat(auto-fit, minmax(min(100%, 15rem), 1fr))`, one column on phones.",
    "At 30rem and below: status lozenges wrap, and a button directly inside the primary region wraps and grows in height."
  ],
  motion: [
    "No animation: emphasis is expressed only through static structure and text. Nothing pulses, moves or fades to claim attention."
  ],
  guidance: {
    do: [
      "Start a new nested budget when a sub-area is a genuinely separate decision.",
      "Keep the primary region focused on the single decision or action that matters now."
    ],
    avoid: [
      "Making two direct regions primary because both feel important; demote one to secondary.",
      "Styling your own \"extra primary\" regions outside the budget to work around it."
    ]
  },
  related: [
    { slug: "attention-path", note: "Declares reading order across steps with visible Priority labels." },
    { slug: "verification-frame", note: "Recognize, verify, act composition for consequential transitions." },
    { slug: "priority-stack", note: "Layout primitive that widens a primary item without declaring emphasis levels." },
    { slug: "callout", note: "Highlights a single note or tip inside content." }
  ]
};
