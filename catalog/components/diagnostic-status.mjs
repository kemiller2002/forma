export default {
  name: "Diagnostic status",
  category: "faults",
  behavior: "Aegis / Application",
  summary: "Text-first presentation of synchronized, queued, unavailable, or failed diagnostic persistence state.",
  purpose: {
    description: "Diagnostic status shows the Aegis persistence state: whether diagnostic reports are synchronized, queued locally (with a count), unavailable, or whether the last synchronization failed (with a safe reason). It is operational state, not a fault severity, so it has no severity label and never replaces a fault surface. The state is always written as text; the marker glyph and the heavier border for unavailable and failed states are secondary cues. The application maps Aegis `PersistenceState` to `data-ef-state` and supplies the wording.",
    useWhen: [
      "The application explicitly chooses to show whether diagnostics are reaching their destination, for example in a status bar, settings page or support panel.",
      "Aegis intent is Silent for a fault, but the user or an operator still benefits from seeing that reports are queued.",
      "A support flow needs to confirm that diagnostics were delivered before asking the user to retry."
    ],
    avoidWhen: [
      "You are presenting a fault to the user: use [[fault-inline]], [[fault-notification]], [[fault-banner]] or [[fault-blocking]] according to the Aegis intent.",
      "You are showing the progress or outcome of a user operation: use [[operation-status]] or [[progress-bar]].",
      "The state is general data freshness rather than diagnostic persistence: use [[freshness]]."
    ],
    characteristics: [
      "Four states: synchronized, queued, unavailable and last-synchronization-failed, each written in text.",
      "Unavailable and failed states use a 2px border in addition to their text.",
      "Inline-level: it sits in a status bar or next to other content without taking the full width.",
      "Carries `role=\"status\"` so an application update to the text is announced politely."
    ]
  },
  examples: [
    {
      id: "synchronized",
      title: "All diagnostics delivered",
      description: "The normal state in a support panel. No role is needed here because this status is rendered once with the panel and does not change while the user reads it.",
      html: `<ef-diagnostic-status class="ef-component-tag">
  <div class="ef-diagnostic-status" data-ef-state="synchronized">
    <span class="ef-diagnostic-status__marker" aria-hidden="true">✓</span>
    <span class="ef-diagnostic-status__body">
      <strong>Diagnostics synchronized</strong>
      <span>Last report delivered at <time datetime="2026-09-30T08:14:00Z">08:14 UTC</time>.</span>
    </span>
  </div>
</ef-diagnostic-status>`
    },
    {
      id: "last-sync-failed",
      title: "Last synchronization failed",
      description: "The failed state with a safe, user-facing reason supplied by the application. The heavier 2px border repeats the text cue. The reason is not an exception message.",
      html: `<ef-diagnostic-status class="ef-component-tag">
  <div class="ef-diagnostic-status" data-ef-state="last-synchronization-failed" role="status">
    <span class="ef-diagnostic-status__marker" aria-hidden="true">!</span>
    <span class="ef-diagnostic-status__body">
      <strong>Last synchronization failed</strong>
      <span>The diagnostics service rejected the upload. 5 reports are kept on this device.</span>
    </span>
  </div>
</ef-diagnostic-status>`
    },
    {
      id: "unavailable-with-recovery",
      title: "Diagnostics unavailable with a recovery action",
      description: "The unavailable state next to the Reconnect diagnostics capability that Aegis supplied. The status and the recovery group are siblings; the status stays text-first and the button is an ordinary recovery action.",
      html: `<ef-diagnostic-status class="ef-component-tag">
  <div class="ef-cluster">
    <div class="ef-diagnostic-status" data-ef-state="unavailable" role="status">
      <span class="ef-diagnostic-status__marker" aria-hidden="true">×</span>
      <span class="ef-diagnostic-status__body">
        <strong>Diagnostics unavailable</strong>
        <span>Reports cannot be stored or sent right now.</span>
      </span>
    </div>
    <div class="ef-recovery-actions" role="group" aria-label="Diagnostics recovery">
      <button type="button" data-ef-aegis-capability="CanRestoreSink">Reconnect diagnostics</button>
    </div>
  </div>
</ef-diagnostic-status>`
    },
    {
      id: "mobile-queued",
      title: "Queued reports on a phone",
      description: "The queued state with a longer explanation at phone width.",
      mobile: {
        height: 220,
        notes: [
          "The status is inline-flex and limited to 100% of its container, so on a phone it becomes as wide as the screen allows and the text column wraps.",
          "The marker keeps a fixed 1.5rem column; only the text column reflows.",
          "It has no interactive target of its own; any recovery button placed beside it follows the 44px recovery-action sizing.",
          "Orientation changes only reflow the text."
        ]
      },
      html: `<ef-diagnostic-status class="ef-component-tag">
  <div class="ef-diagnostic-status" data-ef-state="queued" role="status">
    <span class="ef-diagnostic-status__marker" aria-hidden="true">↥</span>
    <span class="ef-diagnostic-status__body">
      <strong>Diagnostics queued</strong>
      <span>12 reports are waiting and will be sent automatically when this phone is back online.</span>
    </span>
  </div>
</ef-diagnostic-status>`
    }
  ],
  api: {
    attributes: [
      { name: "data-ef-state", on: ".ef-diagnostic-status", values: "synchronized | queued | unavailable | last-synchronization-failed", default: "—", description: "The Aegis persistence state. unavailable and last-synchronization-failed get a 2px border; the text must still state the state." },
      { name: "role", on: ".ef-diagnostic-status", values: "status", default: "absent", description: "Use when the application updates the status in place so changes are announced politely. Omit for a static one-time render." },
      { name: "aria-hidden", on: ".ef-diagnostic-status__marker", values: "true", default: "—", description: "Hides the decorative glyph." }
    ],
    hooks: {
      "ef-diagnostic-status": "Root: an inline-flex row with a 1px border on the secondary surface, limited to its container's width.",
      "ef-diagnostic-status__marker": "Decorative glyph column, 1.5rem minimum width, monospace and bold.",
      "ef-diagnostic-status__body": "Grid holding the state (strong text) and the supporting detail line.",
      "data-ef-state": "The values unavailable and last-synchronization-failed increase the border to 2px; synchronized and queued keep 1px."
    },
    keyboard: [
      { keys: "—", action: "Not interactive. It is never focusable; any related recovery button is a separate native button." }
    ],
    events: [
      { name: "—", description: "No events. The application updates the text and data-ef-state when Aegis persistence state changes." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Synchronized", how: "data-ef-state=\"synchronized\"", description: "Reports are delivered. 1px border." },
    { name: "Queued", how: "data-ef-state=\"queued\" with a count in text", description: "Reports are held locally and waiting. 1px border." },
    { name: "Unavailable", how: "data-ef-state=\"unavailable\"", description: "Diagnostics cannot be stored or sent. 2px border." },
    { name: "Last synchronization failed", how: "data-ef-state=\"last-synchronization-failed\" with a safe reason", description: "The most recent attempt failed. 2px border." }
  ],
  accessibility: {
    forma: [
      "Requires the state to be written as text; the glyph is decorative and the border weight is an extra non-color cue.",
      "Uses Canvas/CanvasText for border, surface and detail text in forced-colors mode."
    ],
    consumer: [
      "Write the state in words (\"Diagnostics queued\"), including the count for queued reports.",
      "Use role=\"status\" only when you update the element in place, and avoid updating it so often that it becomes noisy.",
      "Keep the failure reason safe and user-facing; never place raw exception text in it.",
      "Do not present persistence state as a fault severity."
    ]
  },
  responsive: [
    "Intrinsic sizing: inline-flex, never wider than its container (`max-inline-size: 100%`).",
    "The text column wraps; the marker keeps its 1.5rem minimum width.",
    "No breakpoints. Place it in a [[cluster]] with related actions so they wrap together on narrow screens."
  ],
  motion: [
    "No animation: state changes replace the text and border immediately. Nothing spins or pulses to show queued or failed states."
  ],
  guidance: {
    do: [
      "Show the queued count so users know reports are not lost.",
      "Pair unavailable or failed states with the Reconnect diagnostics action only when Aegis supplies CanRestoreSink."
    ],
    avoid: [
      "Showing diagnostic status as a substitute for presenting a fault.",
      "Color-only indicators such as a colored dot without text."
    ]
  },
  related: [
    { slug: "operation-status", note: "Status of a user operation (pending, failed, unknown), not diagnostic persistence." },
    { slug: "freshness", note: "How current a piece of evidence or data is." },
    { slug: "fault-banner", note: "When diagnostics loss is severe enough that Aegis presents it as a banner fault." }
  ]
};
