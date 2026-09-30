export default {
  name: "Alert",
  category: "feedback",
  behavior: "Application state",
  summary: "An in-page status or warning block with an icon, a heading, explanatory text and an optional action, readable without color.",
  purpose: {
    description: "An alert places a message about the current view directly in the page flow: something changed, something needs review, or an outcome was confirmed. Forma renders it as an `aside` with an icon cell, a text column and an optional trailing action. The application decides when an alert exists, what it says, and which live-region role it carries; Forma only lays it out and gives it an optional entry cue when it is newly inserted.",
    useWhen: [
      "The message concerns the page or record the user is looking at and should stay visible until the situation changes.",
      "The user may need to act on the message (review, reload, retry) and the action belongs next to the explanation.",
      "An asynchronous result such as a save, sync or import needs to be reported in place, near the content it affects."
    ],
    avoidWhen: [
      "The message is a short, transient confirmation that should not occupy layout: use [[toast]].",
      "The problem is a single form field: use [[validation-message]] under that field, and [[validation-summary]] for the form as a whole.",
      "The outcome of an operation is uncertain, pending or needs reconciliation: use [[operation-status]], which carries explicit state vocabulary.",
      "The content is permanent explanatory guidance rather than a status: use [[callout]].",
      "The system itself is faulted and work cannot continue: use [[fault-banner]] or [[fault-blocking]]."
    ],
    characteristics: [
      "A thick inline-start border, a bordered icon cell and a heading give it structure that survives grayscale and forced colors.",
      "The icon is author-supplied text marked `aria-hidden`; the heading and body carry the meaning.",
      "Forma has no tone variants: every alert uses the same accent border. Distinguish kinds of alert with words and icon glyphs, not color."
    ]
  },
  examples: [
    {
      id: "stale-data-warning",
      title: "Stale data warning",
      description: "A persistent alert rendered with the page, so it has no entry cue. It explains that figures are out of date and offers the recovery action beside the explanation. `role=\"status\"` is kept because the message is informative, not urgent.",
      html: `<ef-alert class="ef-component-tag">
  <aside class="ef-alert" role="status" aria-labelledby="alert-stale-data-warning-title">
    <div class="ef-alert__icon" aria-hidden="true">!</div>
    <div>
      <h3 class="ef-alert__title" id="alert-stale-data-warning-title">Figures last refreshed 3 hours ago</h3>
      <p>The ledger sync has not completed since 09:12. Totals below may not include recent postings.</p>
    </div>
    <button type="button">Refresh now</button>
  </aside>
</ef-alert>`
    },
    {
      id: "confirmed-save",
      title: "Confirmed outcome without an action",
      description: "A newly inserted confirmation that opts into the entry cue with `data-ef-motion-entry`. With no action button the trailing grid column collapses and the text uses the full width.",
      html: `<ef-alert class="ef-component-tag">
  <aside class="ef-alert" role="status" data-ef-motion-entry aria-labelledby="alert-confirmed-save-title">
    <div class="ef-alert__icon" aria-hidden="true">✓</div>
    <div>
      <h3 class="ef-alert__title" id="alert-confirmed-save-title">Policy published</h3>
      <p>Version 14 of the retention policy is now in effect for all workspaces.</p>
    </div>
  </aside>
</ef-alert>`
    },
    {
      id: "urgent-session-expiry",
      title: "Urgent interruption",
      description: "A time-sensitive warning inserted by the application with `role=\"alert\"`, so assistive technology announces it immediately. Two actions sit in a [[cluster]] in the trailing column. Reserve `role=\"alert\"` for messages that must interrupt.",
      html: `<ef-alert class="ef-component-tag">
  <aside class="ef-alert" role="alert" data-ef-motion-entry data-ef-motion-weight="standard" aria-labelledby="alert-urgent-session-expiry-title">
    <div class="ef-alert__icon" aria-hidden="true">⏱</div>
    <div>
      <h3 class="ef-alert__title" id="alert-urgent-session-expiry-title">Your session ends in 2 minutes</h3>
      <p>Unsaved changes to this assessment will be lost when the session ends.</p>
    </div>
    <div class="ef-cluster">
      <button type="button">Stay signed in</button>
      <button type="button">Save and sign out</button>
    </div>
  </aside>
</ef-alert>`
    },
    {
      id: "mobile-review-alert",
      title: "Mobile review prompt",
      description: "The canonical review alert at phone width. The three grid columns collapse into one, so the icon, text and a full-width action stack vertically.",
      mobile: {
        height: 320,
        notes: [
          "Below 40rem the grid becomes a single column: icon, then text, then the action.",
          "The trailing button stretches to the full width of the alert, giving a large touch target.",
          "The heading and body wrap freely inside the text column; nothing scrolls horizontally at 320px.",
          "The inline-start border stays, so the alert still reads as a distinct block in portrait and landscape."
        ]
      },
      html: `<ef-alert class="ef-component-tag">
  <aside class="ef-alert" role="status" aria-labelledby="alert-mobile-review-alert-title">
    <div class="ef-alert__icon" aria-hidden="true">!</div>
    <div>
      <h3 class="ef-alert__title" id="alert-mobile-review-alert-title">Two values changed since you opened this record</h3>
      <p>Another reviewer updated the credit limit and the review date. Nothing you entered has been saved yet.</p>
    </div>
    <button type="button">Review changes</button>
  </aside>
</ef-alert>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: "aside.ef-alert", values: "status | alert", default: "—", description: "Live-region semantics chosen by the application. `status` is polite; `alert` interrupts and should be rare. Either role replaces the aside's complementary landmark role." },
      { name: "aria-labelledby", on: "aside.ef-alert", values: "id of .ef-alert__title", default: "—", description: "Names the region by its heading." },
      { name: "aria-hidden", on: ".ef-alert__icon", values: "true", default: "—", description: "Hides the decorative glyph so it is not read before the heading." },
      { name: "data-tone", on: "aside.ef-alert", values: "application-defined", default: "—", description: "Used by the canonical pattern as an application data hook. Forma CSS does not style it; the alert looks the same for every value." },
      { name: "type", on: "button", values: "button", default: "—", description: "Keeps actions from submitting a surrounding form." }
    ],
    hooks: {
      "ef-alert": "Root grid: icon column, flexible text column and an optional trailing action column, with a thick inline-start border.",
      "ef-alert__icon": "Bordered 2rem square holding a short text glyph. Decorative; mark it aria-hidden.",
      "ef-alert__title": "Heading for the message, with its top margin removed.",
      "data-ef-motion-entry": "Opts a newly inserted alert into a short downward settle into place. Omit it on alerts rendered with the page.",
      "data-ef-motion-weight": "Presentation-only perceived mass for the entry cue: light, standard (default) or heavy. Never encodes severity."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the alert's buttons or links. The alert itself is not focusable." },
      { keys: "Enter / Space", action: "Activates the focused action button (native button behavior)." }
    ],
    events: [
      { name: "click", description: "Native click on the action buttons. Forma defines no events; the application decides what each action does and when the alert is removed." }
    ],
    form: "Not a form control. A button inside an alert that sits within a form must keep `type=\"button\"` to avoid submitting it."
  },
  states: [
    { name: "Persistent", how: "rendered without data-ef-motion-entry", description: "Appears in place with no movement. Use for alerts that exist when the view loads or that survive rerenders." },
    { name: "Newly inserted", how: "data-ef-motion-entry on an element added after load", description: "Settles down 0.5rem into place once, from @starting-style. It does not animate again while the element stays in the DOM." },
    { name: "Polite status", how: "role=\"status\"", description: "Announced when content changes, without interrupting the user." },
    { name: "Urgent", how: "role=\"alert\"", description: "Announced immediately on insertion. Visual presentation is identical; urgency is carried by words and role, not styling." }
  ],
  accessibility: {
    forma: [
      "Carries meaning through a heading, body text and a structural border rather than color alone.",
      "Keeps the icon cell bordered in `currentColor`, so it remains visible in forced colors and grayscale.",
      "Uses native buttons, so actions are keyboard-operable with standard focus indication."
    ],
    consumer: [
      "Choose the role: `status` for most messages, `alert` only when the user must be interrupted.",
      "Insert live alerts into an existing container or add them after load; a live region present at page load is usually not announced.",
      "Write a heading that states the situation and body text that states the consequence and what has or has not happened.",
      "Do not move focus to an alert unless it blocks further work; keep it near the content it concerns."
    ]
  },
  responsive: [
    "The root is a three-column grid (`auto minmax(0, 1fr) auto`), so long text wraps within the middle column rather than pushing the action off-screen.",
    "Below 40rem the grid collapses to one column and a direct-child action button becomes full width.",
    "Multiple actions should be grouped in a [[cluster]], which wraps when space runs out.",
    "The alert has no maximum width; it fills its container."
  ],
  motion: [
    "With `data-ef-motion-entry`, a newly inserted alert moves from 0.5rem above to its resting position using the shared spring easing and inertia duration (about 215ms at the standard weight). Only position animates; the text is legible from the first frame.",
    "The cue runs once per insertion via `@starting-style`. Rerendering text inside an existing alert does not replay it.",
    "`data-ef-motion-weight` changes perceived mass only: light is quicker, heavy slower and more damped.",
    "Under `prefers-reduced-motion: reduce` the transition duration is effectively zero and the alert appears in place."
  ],
  guidance: {
    do: [
      "State what happened, what did not happen, and what the user can do.",
      "Remove or replace the alert when the underlying situation resolves.",
      "Use distinct icon glyphs and headings to separate warnings from confirmations."
    ],
    avoid: [
      "Stacking many alerts at the top of a page; consolidate or use an [[obligation-panel]].",
      "Using the entry cue on alerts that are present at page load.",
      "Relying on `data-tone` or color to tell a warning from a confirmation."
    ]
  },
  related: [
    { slug: "toast", note: "Transient, floating confirmation that does not take layout space." },
    { slug: "callout", note: "Static explanatory content, not a status that changes with application state." },
    { slug: "operation-status", note: "Use when an operation's outcome is pending, unknown, conflicting or needs reconciliation." },
    { slug: "fault-banner", note: "System faults that affect the whole application rather than one view." }
  ]
};
