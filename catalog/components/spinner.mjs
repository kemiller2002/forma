export default {
  name: "Spinner",
  category: "feedback",
  behavior: "Application state",
  summary: "Indeterminate activity with a visible label: constant-velocity cadence that stops when the application marks the activity idle, static under reduced motion.",
  purpose: {
    description: "A spinner says that something specific is happening and that its duration is not known. Forma renders a `role=\"status\"` element containing a decorative rotating ring and a visible text label; the label is the real indicator and the ring is supporting presentation. The application owns the activity: it renders the spinner while work runs, updates the label, and sets `data-ef-state=\"idle\"` (or removes the spinner) when the work stops.",
    useWhen: [
      "An operation is running and neither its total nor its progress is known.",
      "A region is waiting for a response and the wait is expected to be short.",
      "The user needs to know which operation is in progress, not just that something is."
    ],
    avoidWhen: [
      "The application knows how much has been done: use [[progress-bar]] with a value.",
      "The layout of the incoming content is known and large: use [[skeleton]] to hold its shape.",
      "The operation's outcome is uncertain or it needs reconciliation after a timeout: use [[operation-status]]."
    ],
    characteristics: [
      "The ring rotates at one named cadence (`--ef-motion-cadence-rotation-period`, 1000ms) with linear timing; speed never encodes importance or expected completion time.",
      "The rotation stops when `data-ef-state=\"idle\"` is set, and the ring closes to a full circle.",
      "The label is always visible text; the ring is `aria-hidden`."
    ]
  },
  examples: [
    {
      id: "activity-finished",
      title: "Activity finished",
      description: "The same spinner after the application marks the activity idle. The ring stops and closes into a full circle, and the label is rewritten to report the result. Because the element stays in place, the status region announces the new text.",
      html: `<ef-spinner class="ef-component-tag">
  <p class="ef-spinner" role="status" data-ef-state="idle">
    <span class="ef-spinner__indicator" aria-hidden="true"></span>
    <span>Deployment history loaded (42 entries)</span>
  </p>
</ef-spinner>`
    },
    {
      id: "busy-region",
      title: "Busy table region",
      description: "A results region marked `aria-busy=\"true\"` while a new page loads, with the spinner as its visible status. The existing heading remains so users know which region is waiting.",
      html: `<ef-spinner class="ef-component-tag">
  <section class="ef-stack" aria-labelledby="spinner-busy-region-title" aria-busy="true">
    <h3 id="spinner-busy-region-title">Payments</h3>
    <p class="ef-spinner" role="status">
      <span class="ef-spinner__indicator" aria-hidden="true"></span>
      <span>Loading page 3 of payments</span>
    </p>
  </section>
</ef-spinner>`
    },
    {
      id: "inline-with-action",
      title: "Beside the action that started it",
      description: "A spinner placed next to the button that started a check. The button is natively disabled while the check runs so it cannot be triggered twice; the spinner label names the check.",
      html: `<ef-spinner class="ef-component-tag">
  <div class="ef-cluster">
    <button type="button" disabled>Run connection test</button>
    <p class="ef-spinner" role="status">
      <span class="ef-spinner__indicator" aria-hidden="true"></span>
      <span>Testing connection to the warehouse</span>
    </p>
  </div>
</ef-spinner>`
    },
    {
      id: "mobile-long-label",
      title: "Mobile long label",
      description: "A spinner with a long, specific label at phone width.",
      mobile: {
        height: 200,
        notes: [
          "The spinner is inline-flex: the 1.25rem ring keeps its size and the label wraps beside it.",
          "The ring does not shrink as the label grows, so it stays a clear circle at 320px.",
          "Nothing scrolls horizontally; the spinner never exceeds its container width.",
          "The spinner has no touch target of its own; place any Cancel action as a separate button."
        ]
      },
      html: `<ef-spinner class="ef-component-tag">
  <p class="ef-spinner" role="status">
    <span class="ef-spinner__indicator" aria-hidden="true"></span>
    <span>Recalculating allocations for all 14 cost centers in the September close</span>
  </p>
</ef-spinner>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: "p.ef-spinner", values: "status", default: "—", description: "Polite live region. Changes to the label are announced." },
      { name: "aria-hidden", on: ".ef-spinner__indicator", values: "true", default: "—", description: "Hides the decorative ring." },
      { name: "aria-busy", on: "the region being updated", values: "true | false", default: "—", description: "Optional. Marks the container whose content is being replaced while the spinner runs." },
      { name: "disabled", on: "button", values: "boolean", default: "—", description: "Optional. Prevents re-triggering the action that started the activity." }
    ],
    hooks: {
      "ef-spinner": "Root inline-flex row of ring and label. The label is a plain text span after the ring; it needs no class.",
      "ef-spinner__indicator": "Decorative 1.25rem ring with an open top edge that rotates while active.",
      "data-ef-state": "Set to idle to stop the rotation and close the ring. Any other value, or no attribute, means active."
    },
    keyboard: [
      { keys: "—", action: "The spinner is not focusable and has no keyboard interaction. Any Cancel or Retry control is a separate native button." }
    ],
    events: [
      { name: "—", description: "None. The application changes the label and `data-ef-state` when the activity changes." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Active", how: "no data-ef-state, or any value other than idle", description: "The ring rotates once per 1000ms at constant speed." },
    { name: "Idle", how: "data-ef-state=\"idle\"", description: "Rotation stops and the ring becomes a closed circle. Update the label to say what happened." },
    { name: "Reduced motion", how: "prefers-reduced-motion: reduce", description: "The ring is static with its open segment; the label and status role still identify the activity." }
  ],
  accessibility: {
    forma: [
      "Keeps a visible text label as the primary indicator and hides the ring from assistive technology.",
      "Draws the ring in `currentColor`, so it stays visible in forced colors.",
      "Stops repeated motion when the activity stops and under reduced motion."
    ],
    consumer: [
      "Write a label that names the operation (\"Loading deployment history\"), not just \"Loading\".",
      "Keep the same element in place while the activity continues; replacing it restarts the rotation and can read as new work.",
      "Update the label or remove the spinner when the activity ends, and report failures with an [[alert]] or [[operation-status]].",
      "Avoid many spinners at once in one view; they compete for attention and announcements."
    ]
  },
  responsive: [
    "Inline-flex with a fixed 1.25rem ring; the label wraps in the remaining width.",
    "No breakpoints. The spinner fits inside toolbars, table cells and region headers.",
    "Use a [[cluster]] to place it beside a related action so the pair wraps together."
  ],
  motion: [
    "The ring rotates with `--ef-motion-cadence-rotation-period` (1000ms) and linear easing, infinitely: constant-velocity cadence with no spring or bounce on each cycle.",
    "Rotation runs only while the spinner is not idle. Setting `data-ef-state=\"idle\"` stops it immediately.",
    "Changing the label text does not restart the cycle, because the same element keeps running its animation.",
    "Under `prefers-reduced-motion: reduce` the animation is removed and the ring is static."
  ],
  guidance: {
    do: [
      "Show a spinner only after a short delay for fast operations, so it does not flash.",
      "Pair long-running activity with a way to cancel when the application supports it."
    ],
    avoid: [
      "Using a spinner as the only sign of what is happening.",
      "Speeding up or slowing down the ring to suggest urgency or remaining time."
    ]
  },
  related: [
    { slug: "progress-bar", note: "Use when the amount of work done is known." },
    { slug: "skeleton", note: "Holds the shape of incoming content in larger regions." },
    { slug: "operation-status", note: "Explains pending, unknown or reconciling outcomes once the wait is over or has failed." }
  ]
};
