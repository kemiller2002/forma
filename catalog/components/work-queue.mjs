import { missionById } from "../example-data/nasa-spaceflight.mjs";

const apollo11 = missionById("apollo-11");
const sts31 = missionById("sts-31");
const artemisI = missionById("artemis-i");

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
      title: "Mission-documentation work in mixed states",
      description: "The mission facts are canonical; the attention, unknown and blocked labels describe a hypothetical local documentation workflow. Unknown external-write outcome requires reconciliation rather than blind retry.",
      html: `<ef-work-queue class="ef-component-tag">
  <section class="ef-work-queue" aria-labelledby="work-queue-mixed-states-title">
    <header class="ef-work-queue__header">
      <div><span class="ef-component-kicker">Mission documentation</span><h3 id="work-queue-mixed-states-title">Needs your attention</h3></div>
      <span class="ef-status-lozenge">3 items</span>
    </header>
    <ol class="ef-work-queue__list">
      <li class="ef-work-queue__item">
        <div><strong>${apollo11.name} citation review is due</strong><p><span class="ef-status-lozenge" data-state="attention">Review</span> Recheck the official source attribution before the next catalog release.</p></div>
        <button type="button" aria-label="Review ${apollo11.name} citation">Review</button>
      </li>
      <li class="ef-work-queue__item">
        <div><strong>${sts31.name} source-update outcome is unknown</strong><p><span class="ef-status-lozenge" data-state="unknown">Unknown</span> The write may have completed. Reconcile the local record before retrying.</p></div>
        <button type="button" aria-label="Reconcile ${sts31.name} source update">Reconcile</button>
      </li>
      <li class="ef-work-queue__item">
        <div><strong>${artemisI.name} local edit is blocked</strong><p><span class="ef-status-lozenge" data-state="blocked">Blocked</span> Waiting for the source-review obligation to be resolved.</p></div>
        <button type="button" aria-label="View blocker for ${artemisI.name}">View blocker</button>
      </li>
    </ol>
  </section>
</ef-work-queue>`
    },
    {
      id: "empty-queue",
      title: "Mission review queue cleared",
      description: "Nothing needs attention. The section stays with a zero count and explanation so an empty review queue cannot be confused with one that failed to load.",
      html: `<ef-work-queue class="ef-component-tag">
  <section class="ef-work-queue" aria-labelledby="work-queue-empty-queue-title">
    <header class="ef-work-queue__header">
      <div><h3 id="work-queue-empty-queue-title">Mission records needing review</h3></div>
      <span class="ef-status-lozenge" data-state="ok">0 items</span>
    </header>
    <ol class="ef-work-queue__list">
      <li class="ef-work-queue__item"><div><strong>Nothing needs your attention</strong><p>New local documentation obligations appear here when they are created.</p></div></li>
    </ol>
  </section>
</ef-work-queue>`
    },
    {
      id: "mobile-queue",
      title: "Mobile mission review queue",
      description: "Two mission-record tasks at phone width. Each item stacks its reason above a full-width action, and the header stacks the count under the title.",
      mobile: {
        height: 460,
        notes: [
          "At 40rem and below each item becomes one column and its button stretches to the full width.",
          "At 30rem and below the header becomes a grid, so the count sits under the title.",
          "The application's work order is preserved exactly.",
          "Long mission names and reasons wrap without horizontal scrolling."
        ]
      },
      html: `<ef-work-queue class="ef-component-tag">
  <section class="ef-work-queue" aria-labelledby="work-queue-mobile-queue-title">
    <header class="ef-work-queue__header">
      <div><span class="ef-component-kicker">NASA reference data</span><h3 id="work-queue-mobile-queue-title">Awaiting review</h3></div>
      <span class="ef-status-lozenge">2 items</span>
    </header>
    <ol class="ef-work-queue__list">
      <li class="ef-work-queue__item">
        <div><strong>${apollo11.name} source attribution</strong><p>Confirm the official NASA source still supports the stored mission facts.</p></div>
        <button type="button" aria-label="Review ${apollo11.name} source attribution">Review</button>
      </li>
      <li class="ef-work-queue__item">
        <div><strong>${sts31.name} crew projection</strong><p>Verify the mobile example still fits all ${sts31.crew.length} crew names.</p></div>
        <button type="button" aria-label="Inspect ${sts31.name} crew projection">Inspect</button>
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
