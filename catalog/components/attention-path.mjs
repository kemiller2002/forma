export default {
  name: "Attention path",
  category: "verification",
  behavior: "Application content",
  summary: "Declares an intended first-glance priority path while preserving semantic source order and explicit text when visual emphasis channels are removed.",
  purpose: {
    description: "An attention path structures a consequential screen so the thing that needs attention first is recognized first, and the rest is read in a declared order. It has one heavily framed primary region and a grid of supporting regions. Each region can declare its place with `data-attention-step`, and Forma prints that as a visible \"Priority N\" label, so the intended order survives grayscale, removed borders and forced colors. The path follows source order; Forma never reorders content visually. Which issue is primary, and what the steps are, is decided by the application from its own state.",
    useWhen: [
      "A review or decision screen has several regions competing for attention, and one issue must be recognized before anything else.",
      "The intended reading order should be explicit and testable rather than implied by size or color.",
      "The screen must remain intelligible under grayscale, forced colors or removed visual emphasis."
    ],
    avoidWhen: [
      "Several independent regions each need to be limited to one primary claimant: use [[emphasis-budget]].",
      "The task is an explicit recognize, verify, act sequence before a transition: use [[verification-frame]].",
      "The content is an ordinary page section with no competing emphasis: use [[section]] or [[stack]].",
      "The primary region would be a transient message: use [[alert]] or [[callout]]."
    ],
    characteristics: [
      "The primary region has a 2px functional border, surface background and padding; supporting regions have only a thin top rule.",
      "`data-attention-step` produces a visible mono uppercase \"Priority N\" label before the region.",
      "Supporting regions sit in an auto-fit grid of columns at least 15rem wide and collapse to one column on narrow screens.",
      "Order is always source order: the path is declared, not rearranged."
    ]
  },
  examples: [
    {
      id: "payment-release",
      title: "Blocked payment release",
      description: "A treasury screen where the primary step is a blocked payment that needs a second approver. Evidence and context are supporting steps. Status is text, and the critical amount uses `.ef-critical-value` for deliberate reading.",
      html: `<ef-attention-path class="ef-component-tag">
  <section class="ef-attention-path" aria-labelledby="attention-path-payment-release-title">
    <header>
      <p class="ef-component-kicker">Treasury · payment run 118</p>
      <h2 id="attention-path-payment-release-title">One payment needs a second approver</h2>
    </header>
    <section class="ef-attention-path__primary" data-attention-step="1" aria-labelledby="attention-path-payment-release-primary">
      <span class="ef-status-lozenge" data-state="blocked">Blocked: second approval required</span>
      <h3 id="attention-path-payment-release-primary">Approve payment to Hanseatische Maschinenbau GmbH</h3>
      <p>Amount <span class="ef-critical-value">€148,200.00</span> exceeds the single-approver limit of €100,000.00.</p>
      <div class="ef-cluster">
        <button type="button">Request second approval</button>
        <button type="button">View invoice</button>
      </div>
    </section>
    <div class="ef-attention-path__support">
      <section data-attention-step="2" aria-labelledby="attention-path-payment-release-evidence">
        <h3 id="attention-path-payment-release-evidence">Evidence</h3>
        <p>Invoice matched to purchase order PO-7782 and goods receipt GR-5521.</p>
      </section>
      <section data-attention-step="3" aria-labelledby="attention-path-payment-release-run">
        <h3 id="attention-path-payment-release-run">Rest of the run</h3>
        <p>41 other payments are approved and scheduled for 14:00.</p>
      </section>
    </div>
  </section>
</ef-attention-path>`
    },
    {
      id: "reconciling-state",
      title: "Reconciling state with long localized text",
      description: "The primary issue is an application-reported reconciling state, shown as its own state rather than collapsed into failure. Long German text wraps inside every region, and a supporting region without a declared step simply has no priority label.",
      html: `<ef-attention-path class="ef-component-tag">
  <section class="ef-attention-path" aria-labelledby="attention-path-reconciling-title" lang="de">
    <header>
      <p class="ef-component-kicker">Lagerbestand</p>
      <h2 id="attention-path-reconciling-title">Bestandsabgleich läuft</h2>
    </header>
    <section class="ef-attention-path__primary" data-attention-step="1" aria-labelledby="attention-path-reconciling-primary">
      <span class="ef-status-lozenge" data-state="unknown">Abgleich läuft – Ergebnis noch nicht bekannt</span>
      <h3 id="attention-path-reconciling-primary">Keine Umbuchungen bis zum Abschluss der Inventurdifferenzprüfung</h3>
      <p>Das Lagerverwaltungssystem hat den Abgleich um 09:40 gestartet und noch kein Ergebnis gemeldet.</p>
      <div class="ef-cluster"><button type="button">Status aktualisieren</button></div>
    </section>
    <div class="ef-attention-path__support">
      <section data-attention-step="2" aria-labelledby="attention-path-reconciling-scope">
        <h3 id="attention-path-reconciling-scope">Umfang</h3>
        <p>Betroffen sind 3 Lagerorte und 1.284 Artikelpositionen.</p>
      </section>
      <section aria-labelledby="attention-path-reconciling-help">
        <h3 id="attention-path-reconciling-help">Hilfe</h3>
        <p>Der Abgleich dauert üblicherweise weniger als 30 Minuten.</p>
      </section>
    </div>
  </section>
</ef-attention-path>`
    },
    {
      id: "mobile-review",
      title: "Mobile review path",
      description: "At phone width the supporting steps stack under the primary region and the primary actions become full-width buttons.",
      mobile: {
        height: 640,
        notes: [
          "The supporting grid uses `minmax(min(100%, 15rem), 1fr)`, so below about 31rem it is a single column in step order.",
          "At 30rem and below the action cluster inside the primary region becomes a one-column grid of full-width buttons at least 2.75rem tall, and button text wraps instead of overflowing.",
          "Status lozenges and headings wrap anywhere, so long identifiers or 200% text do not cause horizontal scrolling at 320px.",
          "The Priority labels stay visible in portrait and landscape; the order never changes with orientation."
        ]
      },
      html: `<ef-attention-path class="ef-component-tag">
  <section class="ef-attention-path" aria-labelledby="attention-path-mobile-title">
    <header>
      <p class="ef-component-kicker">Access review</p>
      <h2 id="attention-path-mobile-title">Contractor access expires today</h2>
    </header>
    <section class="ef-attention-path__primary" data-attention-step="1" aria-labelledby="attention-path-mobile-primary">
      <span class="ef-status-lozenge" data-state="attention">Expires at 18:00</span>
      <h3 id="attention-path-mobile-primary">Extend or remove access for M. Chen</h3>
      <div class="ef-cluster"><button type="button">Extend 30 days</button><button type="button">Remove access</button></div>
    </section>
    <div class="ef-attention-path__support">
      <section data-attention-step="2" aria-labelledby="attention-path-mobile-usage">
        <h3 id="attention-path-mobile-usage">Recent use</h3>
        <p>Last sign-in 2 hours ago from the office network.</p>
      </section>
    </div>
  </section>
</ef-attention-path>`
    }
  ],
  api: {
    attributes: [
      { name: "data-attention-step", on: "primary and supporting regions", values: "positive integer", default: "absent", description: "Declares the region's place in the intended attention path and renders a visible \"Priority N\" label. Must follow source order; descriptive only, never severity or authority." },
      { name: "aria-labelledby", on: "root and each region", values: "id of the region heading", default: "—", description: "Names each region by its heading so the path is navigable by headings and regions." },
      { name: "data-state", on: ".ef-status-lozenge", values: "ok | attention | blocked | unknown", default: "absent", description: "Adds a status symbol to the text status in the primary region." },
      { name: "lang", on: "root or regions", values: "BCP 47 tag", default: "inherited", description: "Declare the language of localized content so wrapping and pronunciation are correct." }
    ],
    hooks: {
      "ef-attention-path": "Root grid of header, primary region and support grid. In an application page this is often `main`; nested, use a labelled `section`.",
      "ef-attention-path__primary": "The single first-glance region: 2px border, surface background, padding. Its action cluster stacks full width at 30rem and below.",
      "ef-attention-path__support": "Auto-fit grid of supporting regions (minimum 15rem each), each with a thin top rule.",
      "data-attention-step": "Presentation hook that prints \"Priority N\" before any region inside the path."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through actions in source order, which is also the declared attention order. No added keyboard behavior." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Primary", how: ".ef-attention-path__primary", description: "Strong frame and background; recognized first." },
    { name: "Declared step", how: "data-attention-step=\"N\"", description: "Visible \"Priority N\" label before the region." },
    { name: "Supporting", how: "children of .ef-attention-path__support", description: "Thin top rule, auto-fit columns." },
    { name: "Forced colors", how: "@media (forced-colors: active)", description: "Primary border and supporting rules use CanvasText; the Priority labels and text remain." }
  ],
  accessibility: {
    forma: [
      "Keeps the declared path in source order, so visual, reading and focus order agree.",
      "Prints the step as visible text, so priority survives grayscale, removed borders and forced colors.",
      "Wraps headings, paragraphs, buttons and status text anywhere and stacks actions at narrow widths to avoid overflow at 320px and 200% text."
    ],
    consumer: [
      "Choose the primary region from application state, not from what looks most urgent.",
      "Keep headings meaningful: the \"Priority N\" label is CSS-generated content and is not reliably announced by every screen reader, so it cannot replace a heading or a text status.",
      "Number steps in source order without gaps and use one primary region per path.",
      "State unknown, stale or reconciling conditions as themselves; never strengthen them into failure or success."
    ]
  },
  responsive: [
    "Root and every region set `min-inline-size: 0` and `max-inline-size: 100%`.",
    "Support grid: `repeat(auto-fit, minmax(min(100%, 15rem), 1fr))`, which becomes one column when there is room for less than two 15rem regions.",
    "At 30rem and below: the primary region's `.ef-cluster` becomes a single column of full-width, wrapping buttons.",
    "Status lozenges inside the path wrap at 30rem and below instead of forcing width."
  ],
  motion: [
    "No animation: the path is static and nothing moves or pulses to attract attention. Attention comes from structure and text, which is why it survives reduced motion unchanged."
  ],
  guidance: {
    do: [
      "Make the primary region's heading state the required action or decision.",
      "Keep supporting regions short and factual."
    ],
    avoid: [
      "Using the attention path to rank severity or authority; step numbers describe reading order only.",
      "Declaring more than one primary region, or using CSS `order` to move the primary region."
    ]
  },
  related: [
    { slug: "emphasis-budget", note: "Limits each independently scoped region to one primary emphasis claimant." },
    { slug: "verification-frame", note: "Recognize, verify, act before a consequential transition." },
    { slug: "overview-disclosure", note: "Keeps a consequential overview visible while secondary detail is disclosed." },
    { slug: "priority-stack", note: "Layout primitive that gives a primary item more width without declaring an attention order." }
  ]
};
