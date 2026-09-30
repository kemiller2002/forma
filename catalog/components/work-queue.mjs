export default {
  name: "Work queue",
  category: "data",
  behavior: "Ordo / application",
  summary: "Attention-first list of unresolved work with reason, context, and application-supplied legal actions.",
  purpose: {
    description: "A work queue is a bordered section with a header (title and item count) and an ordered list of items that need a person's attention. Each item states what needs attention, why, and relevant context such as age, due date or evidence status, next to the one action the application says is currently legal. Forma lays this out and stacks it on phones. It never decides what is in the queue, in what order, whether work is blocking or resolved, or which actions are allowed; that comes from Ordo or the application.",
    useWhen: [
      "A person must resolve a set of items, and each item has a reason and a next action.",
      "The order is meaningful (priority or due date) and set by the application.",
      "Unknown or reconciling outcomes need follow-up and must not be shown as failures."
    ],
    avoidWhen: [
      "Items are records to browse, sort and filter: use [[data-grid]].",
      "Items are a stream of events with optional actions: use [[feed-item]].",
      "Items are obligations tied to a record's legal transitions: use [[obligation-panel]].",
      "Prerequisites must all be met before one transition: use [[readiness-checklist]]."
    ],
    characteristics: [
      "Header row: title (with an optional kicker) at the start, count at the end; stacks at 30rem and below.",
      "Each item is a `minmax(0, 1fr) auto` grid: reason and context on the start side, the action on the end side.",
      "Items are separated by subtle rules; the last item has none.",
      "At 40rem and below each item becomes one column and its button stretches to full width."
    ]
  },
  examples: [
    {
      id: "mixed-states",
      title: "Overdue, unknown and blocked work",
      description: "Three items with different application states, each written as text with a [[status-lozenge]]. The unknown write outcome asks for reconciliation rather than a retry, and the blocked item's action is to view the blocker because nothing else is legal.",
      html: `<ef-work-queue class="ef-component-tag">
  <section class="ef-work-queue" aria-labelledby="work-queue-mixed-states-title">
    <header class="ef-work-queue__header">
      <div><span class="ef-component-kicker">Finance operations</span><h3 id="work-queue-mixed-states-title">Needs your attention</h3></div>
      <span class="ef-status-lozenge">3 items</span>
    </header>
    <ol class="ef-work-queue__list">
      <li class="ef-work-queue__item">
        <div><strong>Invoice INV-1042 is 32 days overdue</strong><p><span class="ef-status-lozenge" data-state="attention">Overdue</span> Due 28 Aug · Customer follow-up is available.</p></div>
        <button type="button" aria-label="Review INV-1042">Review</button>
      </li>
      <li class="ef-work-queue__item">
        <div><strong>Payment PAY-88122 outcome is unknown</strong><p><span class="ef-status-lozenge" data-state="unknown">Unknown</span> The bank accepted the request but has not confirmed. Reconcile before retrying.</p></div>
        <button type="button" aria-label="Reconcile PAY-88122">Reconcile</button>
      </li>
      <li class="ef-work-queue__item">
        <div><strong>Quarter close cannot start</strong><p><span class="ef-status-lozenge" data-state="blocked">Blocked</span> Waiting on 2 unreconciled accounts owned by Treasury.</p></div>
        <button type="button" aria-label="View blockers for quarter close">View blockers</button>
      </li>
    </ol>
  </section>
</ef-work-queue>`
    },
    {
      id: "empty-queue",
      title: "Queue cleared",
      description: "Nothing needs attention. The section stays in place with a 0 count and an explanation, instead of disappearing, so users can tell an empty queue from one that failed to load.",
      html: `<ef-work-queue class="ef-component-tag">
  <section class="ef-work-queue" aria-labelledby="work-queue-empty-queue-title">
    <header class="ef-work-queue__header">
      <div><h3 id="work-queue-empty-queue-title">Needs your attention</h3></div>
      <span class="ef-status-lozenge" data-state="ok">0 items</span>
    </header>
    <ol class="ef-work-queue__list">
      <li class="ef-work-queue__item">
        <div><strong>Nothing needs your attention</strong><p>Checked at 09:40 UTC. New items appear here when they are assigned to you.</p></div>
      </li>
    </ol>
  </section>
</ef-work-queue>`
    },
    {
      id: "mobile-queue",
      title: "Mobile work queue",
      description: "Two items at phone width. Each item stacks its reason above a full-width action, and the header stacks the count under the title.",
      mobile: {
        height: 460,
        notes: [
          "At 40rem (640px) and below each item becomes a single column and its button stretches to 100% width, giving a full-width touch target.",
          "At 30rem (480px) and below the header becomes a grid, so the count sits under the title instead of competing for width.",
          "The application's order is kept exactly; nothing is reordered for mobile.",
          "Long reasons and context wrap within the item; nothing scrolls horizontally at 320px."
        ]
      },
      html: `<ef-work-queue class="ef-component-tag">
  <section class="ef-work-queue" aria-labelledby="work-queue-mobile-queue-title">
    <header class="ef-work-queue__header">
      <div><span class="ef-component-kicker">Releases</span><h3 id="work-queue-mobile-queue-title">Awaiting your review</h3></div>
      <span class="ef-status-lozenge">2 items</span>
    </header>
    <ol class="ef-work-queue__list">
      <li class="ef-work-queue__item">
        <div><strong>rel-2026.09.29 needs production approval</strong><p>Requested 3 hours ago by the release manager.</p></div>
        <button type="button" aria-label="Review rel-2026.09.29">Review</button>
      </li>
      <li class="ef-work-queue__item">
        <div><strong>Publication validation has warnings</strong><p>2 warnings must be acknowledged before publishing.</p></div>
        <button type="button" aria-label="Inspect publication warnings">Inspect</button>
      </li>
    </ol>
  </section>
</ef-work-queue>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-work-queue", values: "id of the header heading", default: "—", description: "Names the queue region." },
      { name: "aria-label", on: "item button", values: "string", default: "—", description: "Names the item an action applies to when the visible verb repeats across items." },
      { name: "type", on: "button", values: "button", default: "—", description: "Actions are native buttons handled by the application." }
    ],
    hooks: {
      "ef-work-queue": "Bordered root section.",
      "ef-work-queue__header": "Padded, ruled header row with title and count spaced apart; a grid at 30rem and below.",
      "ef-work-queue__list": "The unstyled ordered list of items.",
      "ef-work-queue__item": "One item: reason/context and action in a two-column grid, stacking at 40rem and below with a full-width button."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through each item's action button in queue order." },
      { keys: "Enter / Space", action: "Activates the focused action (native button)." }
    ],
    events: [
      { name: "click", description: "Native click on an item action. The application re-validates legality, performs or opens the action, and updates the queue." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Item needing action", how: "li.ef-work-queue__item with a button", description: "Reason, context and the legal next action." },
    { name: "Item state", how: "[[status-lozenge]] or text in the item", description: "Overdue, Unknown, Blocked and so on, supplied by the application." },
    { name: "Empty", how: "application-rendered message", description: "The queue explains that nothing needs attention and when it was checked." },
    { name: "Stacked", how: "viewport ≤ 40rem", description: "Items single column with full-width actions; header stacks at 30rem." }
  ],
  accessibility: {
    forma: [
      "Uses an ordered list so position and count are announced.",
      "Keeps reason before action in DOM order at every width.",
      "Stretches actions to full width on phones for large touch targets."
    ],
    consumer: [
      "Order items by the application's attention rules; do not rely on visual position to imply priority beyond that order.",
      "Write why attention is needed and the state as text; unknown must not read as failure.",
      "Render only actions that are legal now, and re-check legality when the action is activated.",
      "Give repeated action buttons record-specific accessible names.",
      "After an item is resolved, move focus to the next item or the header and update the count."
    ]
  },
  responsive: [
    "Above 40rem: reason and action side by side.",
    "At 40rem and below: items stack and buttons fill the width.",
    "At 30rem and below: the header stacks title and count.",
    "Text wraps inside items; the start column is `minmax(0, 1fr)`."
  ],
  motion: [
    "No animation: items are added and removed by the application without transitions."
  ],
  guidance: {
    do: [
      "Lead each item with the outcome needed, not the record type.",
      "Keep one clear action per item."
    ],
    avoid: [
      "Showing actions the user is not currently allowed to take.",
      "Coloring items by severity instead of stating it.",
      "Letting Forma layout or order stand in for application priority."
    ]
  },
  related: [
    { slug: "feed-item", note: "Stream items with optional actions, ordered by time rather than attention." },
    { slug: "obligation-panel", note: "Obligations attached to a record's lifecycle, owned by Ordo." },
    { slug: "readiness-checklist", note: "Prerequisites for one application-owned transition." },
    { slug: "operation-status", note: "The state of a single operation, including unknown and reconciling." }
  ]
};
