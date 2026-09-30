export default {
  name: "Understanding review",
  category: "assisted",
  behavior: "Ordo / application",
  summary: "Review proposed understanding, unknowns, conflicts, and source actions before consequential transitions.",
  purpose: {
    description: "An understanding review shows what an application or agent understood from the user's input, item by item, before anything consequential is recorded. Each item has an explicit text state (Understood, Unknown, Conflict), a short label and summary, and an application-supplied action such as viewing the source, answering a question or resolving a conflict. Unknown and conflicting items get an extra side bar so they stand out without relying on color. Forma never decides that an item is accepted, blocking or resolved; those states and whether the transition may proceed come from Ordo or application state.",
    useWhen: [
      "Free text, dictation or a document has been interpreted into structured facts that will change a record.",
      "Some facts may be missing or contradict what is already recorded, and the user must see them before confirming.",
      "Each fact needs a path back to its source for checking."
    ],
    avoidWhen: [
      "The facts are already confirmed and only need display: use [[key-value-list]] or [[facts]].",
      "The user is checking prerequisites rather than interpreted facts: use [[readiness-checklist]].",
      "Two versions of a record are being reconciled field by field: use [[conflict-review]].",
      "An agent is asking for approval of a single consequence: use [[handoff-summary]]."
    ],
    characteristics: [
      "Each item is a three-column grid: state label, label and summary, action.",
      "State labels are mono uppercase text with a symbol from CSS: ✓ for accepted, ? for unknown, ! for conflict.",
      "Unknown and conflict items have a 0.3rem inline-start bar, a shape cue in addition to the text.",
      "At 40rem and below items and the header stack, and item actions become full width."
    ]
  },
  examples: [
    {
      id: "conflict-with-record",
      title: "Conflict with the existing record",
      description: "The application found that a new statement contradicts what is recorded. The conflict item states both values in text and offers resolution; the header summarizes how many items need attention.",
      html: `<ef-understanding class="ef-component-tag">
  <section class="ef-understanding" aria-labelledby="understanding-conflict-title">
    <header class="ef-understanding__header">
      <div>
        <span class="ef-component-kicker">Understanding</span>
        <h2 id="understanding-conflict-title">I found 3 things</h2>
        <p>One item conflicts with the current record. Nothing is saved until it is resolved.</p>
      </div>
      <span class="ef-status-lozenge" data-state="attention">1 conflict</span>
    </header>
    <ol class="ef-understanding__items">
      <li class="ef-understanding__item" data-ef-state="conflict">
        <span class="ef-understanding__state">Conflict</span>
        <div><strong>Allergy</strong><p>You said "no known allergies"; the record lists penicillin (added 2024).</p></div>
        <button type="button">Resolve</button>
      </li>
      <li class="ef-understanding__item" data-ef-state="accepted">
        <span class="ef-understanding__state">Understood</span>
        <div><strong>Appointment</strong><p>Follow-up with Dr. Smith on 14 October at 09:30.</p></div>
        <button type="button">Source</button>
      </li>
      <li class="ef-understanding__item" data-ef-state="accepted">
        <span class="ef-understanding__state">Understood</span>
        <div><strong>Weight</strong><p>82 kg, measured today.</p></div>
        <button type="button">Source</button>
      </li>
    </ol>
  </section>
</ef-understanding>`
    },
    {
      id: "all-understood",
      title: "Everything understood",
      description: "Every item is understood. The header states this in text with an ok lozenge, and each item still links to its source so the user can check before the application moves on.",
      html: `<ef-understanding class="ef-component-tag">
  <section class="ef-understanding" aria-labelledby="understanding-all-understood-title">
    <header class="ef-understanding__header">
      <div>
        <span class="ef-component-kicker">Understanding</span>
        <h2 id="understanding-all-understood-title">Expense details from your receipt</h2>
        <p>Check these before the claim is submitted.</p>
      </div>
      <span class="ef-status-lozenge" data-state="ok">No questions</span>
    </header>
    <ol class="ef-understanding__items">
      <li class="ef-understanding__item" data-ef-state="accepted">
        <span class="ef-understanding__state">Understood</span>
        <div><strong>Merchant</strong><p>Lisbon Airport Taxi Cooperative</p></div>
        <button type="button">Source</button>
      </li>
      <li class="ef-understanding__item" data-ef-state="accepted">
        <span class="ef-understanding__state">Understood</span>
        <div><strong>Amount</strong><p><span class="ef-critical-value">€42.60</span> on 29 September</p></div>
        <button type="button">Source</button>
      </li>
    </ol>
  </section>
</ef-understanding>`
    },
    {
      id: "mobile-review",
      title: "Mobile review with a question",
      description: "At phone width each item stacks state, content and action, and every action is a full-width button so answering and checking sources stay reachable.",
      mobile: {
        height: 600,
        notes: [
          "At 40rem and below the header stacks its text above the status lozenge, stretched to the full width.",
          "Each item becomes one column: state label, then label and summary, then a full-width action button at the 2.75rem base height.",
          "The unknown item keeps its inline-start bar when stacked, so it remains distinguishable while scrolling.",
          "Long summaries wrap within the item; no horizontal scrolling at 320px in either orientation."
        ]
      },
      html: `<ef-understanding class="ef-component-tag">
  <section class="ef-understanding" aria-labelledby="understanding-mobile-title">
    <header class="ef-understanding__header">
      <div>
        <span class="ef-component-kicker">Understanding</span>
        <h2 id="understanding-mobile-title">I found 2 things</h2>
      </div>
      <span class="ef-status-lozenge" data-state="attention">1 question</span>
    </header>
    <ol class="ef-understanding__items">
      <li class="ef-understanding__item" data-ef-state="accepted">
        <span class="ef-understanding__state">Understood</span>
        <div><strong>Symptom</strong><p>Ankle swelling returned.</p></div>
        <button type="button">Source</button>
      </li>
      <li class="ef-understanding__item" data-ef-state="unknown">
        <span class="ef-understanding__state">Unknown</span>
        <div><strong>Since when</strong><p>The start date of the swelling was not given.</p></div>
        <button type="button">Answer</button>
      </li>
    </ol>
  </section>
</ef-understanding>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "root section", values: "id of the header heading", default: "—", description: "Names the review region." },
      { name: "data-ef-state", on: ".ef-understanding__item", values: "accepted | unknown | conflict", default: "absent", description: "Presentation of an application-supplied state: adds the state symbol, and for unknown and conflict the side bar. The text in `.ef-understanding__state` must say the same thing." },
      { name: "data-state", on: ".ef-status-lozenge", values: "ok | attention | blocked | unknown", default: "absent", description: "Adds a symbol to the header summary status." }
    ],
    hooks: {
      "ef-understanding": "Root bordered region.",
      "ef-understanding__header": "Flex row of heading block and summary status, with a bottom rule; stacks at 40rem and below.",
      "ef-understanding__items": "Unstyled ordered list of items.",
      "ef-understanding__item": "One item: grid of state, content and action with a bottom rule; one column at 40rem and below.",
      "ef-understanding__state": "Visible state text in small mono uppercase; receives a CSS symbol for known states.",
      "data-ef-state": "Item state hook: `accepted` (✓), `unknown` (? and side bar), `conflict` (! and side bar). Presentation only; Ordo or the application owns the state."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the item actions in list order. No added keyboard behavior." },
      { keys: "Enter / Space", action: "Activates the focused native button; opening sources or answering is application behavior." }
    ],
    events: [
      { name: "click", description: "Native click on item actions; the application opens the source, asks the question or resolves the conflict." }
    ],
    form: "Not a form control. Answers are collected by application UI such as a [[dialog]] or inline fields."
  },
  states: [
    { name: "Understood", how: "data-ef-state=\"accepted\" plus state text", description: "✓ symbol before the state label." },
    { name: "Unknown", how: "data-ef-state=\"unknown\" plus state text", description: "? symbol and a 0.3rem inline-start bar." },
    { name: "Conflict", how: "data-ef-state=\"conflict\" plus state text", description: "! symbol and a 0.3rem inline-start bar." },
    { name: "Other application states", how: "state text without data-ef-state", description: "States such as Unresolved render as text only; add them as text rather than inventing hook values." },
    { name: "Stacked", how: "@media (max-width: 40rem)", description: "Header and items stack; item actions are full width." },
    { name: "Forced colors", how: "@media (forced-colors: active)", description: "Root border and the side bars use CanvasText." }
  ],
  accessibility: {
    forma: [
      "Requires and styles a visible text state on every item; the symbol and side bar are extra cues, not replacements.",
      "Uses an ordered list, so the number of items and their positions are announced.",
      "Keeps source and answer actions reachable as full-width buttons on phones."
    ],
    consumer: [
      "Write the state text for every item and keep `data-ef-state` consistent with it.",
      "Give action buttons specific names when several appear together, for example with visually hidden text (\"Source for Allergy\").",
      "Summarize in the header how many items need attention and whether anything will be saved yet.",
      "Decide in Ordo or application state whether unknown or conflicting items block the transition, and say so in text."
    ]
  },
  responsive: [
    "Wide: item grid `minmax(6rem, auto) minmax(0, 1fr) auto`, centered vertically.",
    "At 40rem and below: header becomes a stretched column; items become one column with stretched, full-width buttons.",
    "Summaries wrap within the content column; there are no fixed widths beyond the state column minimum."
  ],
  motion: [
    "No animation: item states change instantly when the application updates them. Nothing pulses to draw attention to unknown or conflicting items."
  ],
  guidance: {
    do: [
      "Show the user's own words or the source for every interpreted fact.",
      "State conflicts with both values so the user can decide without opening anything."
    ],
    avoid: [
      "Marking an item Understood because the model was confident; state must come from application rules.",
      "Hiding unknown items behind a disclosure when they block the transition."
    ]
  },
  related: [
    { slug: "composer", note: "Where the input being interpreted is written." },
    { slug: "conflict-review", note: "Field-by-field reconciliation of two record versions." },
    { slug: "readiness-checklist", note: "Prerequisites for a transition rather than interpreted facts." },
    { slug: "handoff-summary", note: "An agent's single proposed consequence awaiting human approval." }
  ]
};
