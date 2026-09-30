export default {
  name: "Operation status",
  category: "feedback",
  behavior: "Ordo / application",
  summary: "Presents pending, confirmed, failed, conflict, unknown, reconciling, stale, blocked, unavailable or insufficient outcomes with explanation and recovery actions.",
  purpose: {
    description: "Operation status reports the outcome of one consequential operation, such as a save, payment or submission, when that outcome needs explaining. Forma renders a bordered block with a decorative symbol, a [[status-lozenge]] naming the state, a heading, an explanation of consequences, and an action row. The application or Ordo determines the state and which recovery actions are legal; Forma presents exactly what it is given and never upgrades unknown to failed or pending to confirmed.",
    useWhen: [
      "An operation's outcome is not a simple success, for example it timed out and may or may not have happened.",
      "Retrying naively could cause harm (a duplicate payment) and the user must reconcile first.",
      "The application needs to show that an operation is pending, reconciling, blocked or unavailable, with the reason."
    ],
    avoidWhen: [
      "A plain success confirmation: use [[toast]] or a short [[alert]].",
      "Two versions of a record disagree and the user must compare them: use [[conflict-review]].",
      "Several distinct states must be shown side by side: use [[state-survivability]].",
      "Work is still running with no outcome yet and no explanation needed: use [[spinner]] or [[progress-bar]]."
    ],
    characteristics: [
      "The lozenge text states the outcome; the heading explains it in a sentence; the paragraph says what is safe to do next.",
      "Shares its grid and inline-start border with [[alert]], so it reads as feedback without depending on color.",
      "Actions are supplied by the application and wrap in their own row."
    ]
  },
  examples: [
    {
      id: "payment-failed",
      title: "Payment declined",
      description: "A confirmed failure. The lozenge says Failed, the text states that no money moved, and the only actions offered are the ones the application allows: update the card or choose another method.",
      html: `<ef-operation-status class="ef-component-tag">
  <section class="ef-operation-status" aria-labelledby="operation-status-payment-failed-title">
    <div class="ef-operation-status__symbol" aria-hidden="true">×</div>
    <div>
      <span class="ef-status-lozenge" data-state="blocked">Failed</span>
      <h3 id="operation-status-payment-failed-title">The card was declined</h3>
      <p>No payment was taken. Invoice INV-2291 remains open with 1,240.00 due.</p>
    </div>
    <div class="ef-operation-status__actions">
      <button type="button">Update card</button>
      <button type="button">Pay another way</button>
    </div>
  </section>
</ef-operation-status>`
    },
    {
      id: "reconciling",
      title: "Reconciling after a timeout",
      description: "The application is checking whether a timed-out transfer completed. A [[spinner]] in the text column shows the check is running; there are no actions because retrying is not safe until reconciliation finishes.",
      html: `<ef-operation-status class="ef-component-tag">
  <section class="ef-operation-status" aria-labelledby="operation-status-reconciling-title">
    <div class="ef-operation-status__symbol" aria-hidden="true">↻</div>
    <div>
      <span class="ef-status-lozenge" data-state="unknown">Reconciling</span>
      <h3 id="operation-status-reconciling-title">Checking whether the transfer went through</h3>
      <p>The bank did not respond in time. We are confirming the outcome before allowing another attempt.</p>
      <p class="ef-spinner" role="status">
        <span class="ef-spinner__indicator" aria-hidden="true"></span>
        <span>Contacting the bank</span>
      </p>
    </div>
  </section>
</ef-operation-status>`
    },
    {
      id: "blocked-by-permission",
      title: "Blocked by a missing approval",
      description: "The operation was not attempted because a prerequisite is missing. The lozenge says Blocked and the single action takes the user to request the approval.",
      html: `<ef-operation-status class="ef-component-tag">
  <section class="ef-operation-status" aria-labelledby="operation-status-blocked-by-permission-title">
    <div class="ef-operation-status__symbol" aria-hidden="true">!</div>
    <div>
      <span class="ef-status-lozenge" data-state="blocked">Blocked</span>
      <h3 id="operation-status-blocked-by-permission-title">Publishing needs a second approver</h3>
      <p>Policies above risk level 3 require approval from someone other than the author. Nothing has been published.</p>
    </div>
    <div class="ef-operation-status__actions">
      <button type="button">Request approval</button>
    </div>
  </section>
</ef-operation-status>`
    },
    {
      id: "mobile-unknown-save",
      title: "Mobile unknown outcome",
      description: "The canonical unknown-outcome state at phone width.",
      mobile: {
        height: 420,
        notes: [
          "Below 40rem the three-column grid becomes one column: symbol, text, then actions.",
          "Each action button becomes full width, giving large touch targets and preventing side-by-side mis-taps.",
          "The heading and explanation wrap freely; nothing scrolls horizontally at 320px.",
          "The lozenge stays on its own line above the heading in both orientations."
        ]
      },
      html: `<ef-operation-status class="ef-component-tag">
  <section class="ef-operation-status" aria-labelledby="operation-status-mobile-unknown-save-title">
    <div class="ef-operation-status__symbol" aria-hidden="true">?</div>
    <div>
      <span class="ef-status-lozenge" data-state="unknown">Unknown outcome</span>
      <h3 id="operation-status-mobile-unknown-save-title">We cannot confirm the timesheet was submitted</h3>
      <p>The connection dropped during submission. Check the submission log before submitting again.</p>
    </div>
    <div class="ef-operation-status__actions">
      <button type="button">Check submission log</button>
      <button type="button">View details</button>
    </div>
  </section>
</ef-operation-status>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-operation-status", values: "id of the heading", default: "—", description: "Names the region by its heading." },
      { name: "aria-hidden", on: ".ef-operation-status__symbol", values: "true", default: "—", description: "Hides the decorative symbol; the lozenge and heading carry the state." },
      { name: "data-state", on: ".ef-status-lozenge", values: "ok | attention | unknown | blocked", default: "—", description: "Glyph for the lozenge that names the outcome. See [[status-lozenge]]." },
      { name: "role", on: "an inner status element", values: "status", default: "—", description: "Optional. Use a status region (for example a [[spinner]]) for text that changes while the operation is reconciling." }
    ],
    hooks: {
      "ef-operation-status": "Root grid: symbol column, text column and action column, bordered with a thick inline-start border.",
      "ef-operation-status__symbol": "Bordered 2rem square holding a text glyph. Decorative.",
      "ef-operation-status__actions": "Wrapping flex row of application-supplied recovery actions. Buttons become full width below 40rem."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the recovery actions. The region is not focusable." },
      { keys: "Enter / Space", action: "Activates the focused action (native button behavior)." }
    ],
    events: [
      { name: "click", description: "Native click on action buttons. The application or Ordo performs and authorizes the action." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Pending", how: "lozenge text Pending, data-state=\"attention\"", description: "Submitted but not yet confirmed by the authority." },
    { name: "Confirmed", how: "lozenge text Confirmed, data-state=\"ok\"", description: "The authority confirmed the outcome." },
    { name: "Failed", how: "lozenge text Failed, data-state=\"blocked\"", description: "The authority confirmed the operation did not happen." },
    { name: "Unknown / reconciling", how: "lozenge text Unknown or Reconciling, data-state=\"unknown\"", description: "The outcome is not established. Distinct from failed: retrying may duplicate the effect." },
    { name: "Conflict / stale", how: "lozenge text Conflict or Stale, data-state=\"attention\"", description: "The operation was based on out-of-date information." },
    { name: "Blocked / unavailable / insufficient", how: "lozenge text naming the reason, data-state=\"blocked\"", description: "The operation cannot proceed; the text says why and what would unblock it." }
  ],
  accessibility: {
    forma: [
      "Expresses the state in text (lozenge and heading) with shape cues, independent of color.",
      "Keeps the symbol decorative and actions as native buttons.",
      "Uses a structural inline-start border that survives grayscale."
    ],
    consumer: [
      "Name the state exactly; do not collapse unknown into failed or pending into confirmed.",
      "Offer only actions the authority allows in the current state; explain when none are available.",
      "Insert or update a status region if the change must be announced; the section itself is not a live region.",
      "Choose a heading level that fits the page outline."
    ]
  },
  responsive: [
    "Grid of `auto minmax(0, 1fr) auto`; the text column absorbs remaining width and wraps.",
    "Below 40rem the grid is one column and every action button is full width.",
    "The action row wraps before that breakpoint when actions are long."
  ],
  motion: [
    "No animation on the operation status itself. An embedded [[spinner]] keeps its own cadence and stops when marked idle."
  ],
  guidance: {
    do: [
      "Say what did and did not happen, and what is safe to do next.",
      "Replace the status as soon as the authority reports a new state."
    ],
    avoid: [
      "Offering Retry on an unknown outcome unless the operation is idempotent.",
      "Using a generic \"Something went wrong\" when the application knows more."
    ]
  },
  related: [
    { slug: "alert", note: "General page message without operation-state vocabulary." },
    { slug: "conflict-review", note: "Side-by-side comparison when the conflict needs inspection." },
    { slug: "state-survivability", note: "Several authoritative states in one list." },
    { slug: "recovery-actions", note: "Structured set of recovery choices after a failure." }
  ]
};
