export default {
  name: "Fault",
  category: "faults",
  behavior: "Aegis / Ordo / Application",
  summary: "Common safe presentation shell for an Aegis Presentation.T without exposing raw fault diagnostics.",
  purpose: {
    description: "The fault shell is the shared visual vocabulary of the Aegis fault family: a non-color marker, a visible severity label, a title, a safe user-facing message, a quotable reference and a region of recovery actions. It renders the fields of Aegis `Presentation.T` that the application has already mapped into markup. Forma never receives the raw fault, never chooses the severity or intent, and never decides which recovery actions exist; the application or Limen does that upstream and Forma only presents the result.",
    useWhen: [
      "An adapter or nonstandard composition needs to show an Aegis presentation that does not map cleanly to one of the intent patterns.",
      "A panel, card or side region shows the outcome of one failed operation together with its reference and the recovery actions Aegis supplied.",
      "You are building a new intent-specific surface and want to reuse the marker, severity, title, message and reference vocabulary."
    ],
    avoidWhen: [
      "The Aegis intent is known: use [[fault-inline]], [[fault-notification]], [[fault-banner]] or [[fault-blocking]], which add the placement, live-region and dialog semantics that intent requires.",
      "The intent is Silent: render nothing visible. Persistence state, if the application chooses to show it, belongs in [[diagnostic-status]].",
      "Several unresolved faults must be listed together: use [[fault-summary]] with already-grouped entries.",
      "The message is a general notice or validation problem with no Aegis fault behind it: use [[alert]] or [[validation-message]].",
      "You need to show developer diagnostics such as stack traces or exception details: they never belong in a Forma fault surface."
    ],
    characteristics: [
      "Severity is always written as text in `ef-fault__severity` and repeated structurally by the start border style: dotted for diagnostic, dashed for warning, solid for error, and a wider border plus outline for critical.",
      "The marker is decorative (`aria-hidden`) and uses a glyph and a ring shape, never color alone.",
      "Recovery buttons are plain native buttons annotated with `data-ef-aegis-capability`. The attribute describes intent; it is not authorization.",
      "The shell never announces itself, steals focus or animates. Those behaviors belong to the intent-specific patterns and the application."
    ]
  },
  examples: [
    {
      id: "warning-two-actions",
      title: "Session expired with two recovery paths",
      description: "A warning-severity fault in a record panel. Aegis supplied two capabilities, so two native buttons are rendered in the order given. The dashed start border repeats the Warning label structurally.",
      html: `<ef-fault class="ef-component-tag">
  <section class="ef-fault" data-ef-intent="inline" data-ef-severity="warning" aria-labelledby="fault-warning-two-actions-title" aria-describedby="fault-warning-two-actions-message">
    <div class="ef-fault__marker" aria-hidden="true">!</div>
    <div class="ef-fault__body">
      <p class="ef-fault__severity">Warning</p>
      <h3 class="ef-fault__title" id="fault-warning-two-actions-title">Your session has expired</h3>
      <p class="ef-fault__message" id="fault-warning-two-actions-message">Sign in again to keep editing, or open the record read-only. Unsaved changes are kept on this device.</p>
      <p class="ef-fault-reference">Reference <code>AG-3JH71</code></p>
    </div>
    <div class="ef-recovery-actions" role="group" aria-label="Recovery actions">
      <button type="button" data-ef-aegis-capability="CanReauthenticate">Sign in</button>
      <button type="button" data-ef-aegis-capability="CanOpenReadOnly">Open read-only</button>
    </div>
  </section>
</ef-fault>`
    },
    {
      id: "critical-reload",
      title: "Critical fault in a side panel",
      description: "Critical severity widens the start border and adds an outline so the level stays distinguishable in grayscale and forced colors. Visual weight is not a substitute for the Critical text label, which remains first in the body.",
      html: `<ef-fault class="ef-component-tag">
  <section class="ef-fault" data-ef-intent="inline" data-ef-severity="critical" aria-labelledby="fault-critical-reload-title" aria-describedby="fault-critical-reload-message">
    <div class="ef-fault__marker" aria-hidden="true">!!</div>
    <div class="ef-fault__body">
      <p class="ef-fault__severity">Critical</p>
      <h3 class="ef-fault__title" id="fault-critical-reload-title">Workspace data is out of date</h3>
      <p class="ef-fault__message" id="fault-critical-reload-message">This panel can no longer confirm the latest ledger totals. Reload to fetch a verified copy.</p>
      <p class="ef-fault-reference">Reference <code>AG-9QX4L</code></p>
    </div>
    <div class="ef-recovery-actions" role="group" aria-label="Recovery actions">
      <button type="button" data-ef-aegis-capability="CanReload">Reload</button>
    </div>
  </section>
</ef-fault>`
    },
    {
      id: "diagnostic-no-actions",
      title: "Diagnostic notice without recovery",
      description: "Aegis supplied no recovery capability, so the recovery region is omitted entirely instead of showing a disabled or invented action. The dotted start border marks the Diagnostic level.",
      html: `<ef-fault class="ef-component-tag">
  <section class="ef-fault" data-ef-intent="inline" data-ef-severity="diagnostic" aria-labelledby="fault-diagnostic-no-actions-title" aria-describedby="fault-diagnostic-no-actions-message">
    <div class="ef-fault__marker" aria-hidden="true">i</div>
    <div class="ef-fault__body">
      <p class="ef-fault__severity">Diagnostic</p>
      <h3 class="ef-fault__title" id="fault-diagnostic-no-actions-title">Preview thumbnails were skipped</h3>
      <p class="ef-fault__message" id="fault-diagnostic-no-actions-message">Two attachments are shown without previews. The files themselves are unaffected.</p>
      <p class="ef-fault-reference">Reference <code>AG-0M5TR</code></p>
    </div>
  </section>
</ef-fault>`
    },
    {
      id: "mobile-long-content",
      title: "Long title and reference on a phone",
      description: "An error with a long translated title and a long reference at phone width. The actions column drops below the body and each button spans the full width.",
      mobile: {
        height: 460,
        notes: [
          "Below 36rem the three-column grid becomes two columns (marker and body); the recovery region moves to its own full-width row underneath, keeping source reading order.",
          "Each recovery button stretches to the full width and keeps its 2.75rem (44px) minimum height, so actions are easy to hit with a thumb.",
          "The title wraps and the reference code breaks anywhere, so neither causes horizontal page scrolling at 320px.",
          "Orientation changes only reflow the body text; the marker, severity label and action order do not change."
        ]
      },
      html: `<ef-fault class="ef-component-tag">
  <section class="ef-fault" data-ef-intent="inline" data-ef-severity="error" aria-labelledby="fault-mobile-long-content-title" aria-describedby="fault-mobile-long-content-message">
    <div class="ef-fault__marker" aria-hidden="true">!</div>
    <div class="ef-fault__body">
      <p class="ef-fault__severity">Error</p>
      <h3 class="ef-fault__title" id="fault-mobile-long-content-title">Die Änderungen an den Rechnungsempfängern konnten nicht gespeichert werden</h3>
      <p class="ef-fault__message" id="fault-mobile-long-content-message">Ihre Eingaben sind weiterhin verfügbar.</p>
      <p class="ef-fault-reference">Reference <code>AG-4F82C-BILLING-RECIPIENTS-2026</code></p>
    </div>
    <div class="ef-recovery-actions" role="group" aria-label="Recovery actions">
      <button type="button" data-ef-aegis-capability="CanRetry">Erneut versuchen</button>
      <button type="button" data-ef-aegis-capability="CanReload">Neu laden</button>
    </div>
  </section>
</ef-fault>`
    }
  ],
  api: {
    attributes: [
      { name: "data-ef-severity", on: ".ef-fault", values: "diagnostic | warning | error | critical", default: "absent (solid error-style border)", description: "The Aegis severity, lowercased. Changes the start-border style; it must always be paired with the visible severity text." },
      { name: "data-ef-intent", on: ".ef-fault", values: "inline | notification | banner | blocking", default: "—", description: "Records the Aegis intent the application mapped. Descriptive only; Forma CSS does not style it." },
      { name: "aria-labelledby", on: ".ef-fault", values: "id of .ef-fault__title", default: "—", description: "Names the fault region by its title." },
      { name: "aria-describedby", on: ".ef-fault", values: "id of .ef-fault__message", default: "—", description: "Associates the safe user-facing message as the region's description." },
      { name: "aria-hidden", on: ".ef-fault__marker", values: "true", default: "—", description: "Required. The marker glyph repeats the severity visually and must not be read aloud." },
      { name: "role", on: ".ef-recovery-actions", values: "group", default: "—", description: "Groups the recovery buttons so assistive technology announces them together." },
      { name: "aria-label", on: ".ef-recovery-actions", values: "string", default: "—", description: "Names the recovery group, for example \"Recovery actions\"." },
      { name: "type", on: "button", values: "button", default: "—", description: "Required on every recovery button so it never submits an enclosing form." },
      { name: "data-ef-aegis-capability", on: "button", values: "Aegis capability case name, e.g. CanRetry", default: "—", description: "The exact Aegis capability the button represents. Describes intent to application code; it is not authority and must be revalidated on activation." }
    ],
    hooks: {
      "ef-fault": "Root. A three-column grid (marker, body, recovery actions) with a thick start border and a primary surface.",
      "ef-fault--inline": "Operation-local variant used by [[fault-inline]]: tighter padding and the secondary surface so it reads as part of the affected region.",
      "ef-fault__marker": "Decorative round marker holding a short glyph such as ! or !!. Shape and glyph, not color, carry the cue.",
      "ef-fault__body": "Text column for severity, title, message and reference. It shrinks to zero minimum width so long content wraps.",
      "ef-fault__severity": "Visible severity label in small uppercase monospace. Always present.",
      "ef-fault__title": "The Aegis title. Use a heading or a paragraph with strong text depending on the surrounding outline.",
      "ef-fault__message": "The safe user-facing message from Aegis.",
      "data-ef-severity": "diagnostic gives a dotted start border, warning dashed, critical a wider border plus an offset outline; error (or absent) keeps the solid default."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between recovery buttons. The fault region itself is not focusable and never takes focus when it appears." },
      { keys: "Enter / Space", action: "Activates the focused recovery button (native button behavior)." }
    ],
    events: [
      { name: "click", description: "Native click on a recovery button. Application or Limen code reads `data-ef-aegis-capability`, revalidates the capability and application state, then issues a typed recovery request." }
    ],
    form: "Not a form control. Recovery buttons use type=\"button\" and never submit or reset an enclosing form."
  },
  states: [
    { name: "Diagnostic", how: "data-ef-severity=\"diagnostic\" plus the text Diagnostic", description: "Dotted start border. Lowest severity; often no recovery actions." },
    { name: "Warning", how: "data-ef-severity=\"warning\" plus the text Warning", description: "Dashed start border." },
    { name: "Error", how: "data-ef-severity=\"error\" plus the text Error", description: "Solid 0.35rem start border (the default)." },
    { name: "Critical", how: "data-ef-severity=\"critical\" plus the text Critical", description: "Solid 0.55rem start border and a 1px outline offset by 2px." },
    { name: "No recovery available", how: "omit the .ef-recovery-actions group", description: "The grid keeps its layout; nothing is shown in the action column. Do not render disabled placeholder actions." }
  ],
  accessibility: {
    forma: [
      "Expresses every severity as visible text plus a border style, so severity never depends on color.",
      "Keeps recovery controls as native buttons with the shared visible focus ring and a 44px minimum height.",
      "In forced-colors mode the border, marker ring, severity text and reference switch to CanvasText on Canvas and stay visible.",
      "Adds no live region, focus movement or animation, so rerendering the shell does not produce duplicate announcements."
    ],
    consumer: [
      "Supply the visible severity label, title, message and reference from Aegis `Presentation.T`; never bind raw fault fields, stack traces or exception details.",
      "Render only the recovery actions Aegis supplied, with exact capability names, and revalidate capability and domain state on every click.",
      "Give the section an accessible name with aria-labelledby, or use a non-landmark wrapper when several faults would create many identically named regions.",
      "Choose a heading level that fits the surrounding outline for the title.",
      "Decide whether the fault is announced; if it must be, use the intent-specific pattern that owns that behavior."
    ]
  },
  responsive: [
    "The root is a grid of `auto minmax(0, 1fr) auto`; the body column absorbs remaining width and long text wraps inside it.",
    "Below a 36rem viewport the grid becomes two columns and the recovery group moves to a full-width row beneath the body, preserving source order.",
    "At the same breakpoint the recovery group takes the full width and each button becomes full width with a 44px minimum height.",
    "Reference codes break anywhere, so long references never force horizontal scrolling at 320px.",
    "The breakpoint is a viewport media query, not a container query: a fault inside a narrow sidebar on a wide screen keeps the three-column layout."
  ],
  motion: [
    "No animation: the shell is a persistent, static surface and does not animate on insertion or rerender.",
    "Recovery buttons inherit the foundation hover and press feedback, a short perceptual background-color change that never moves the hit target and collapses to 0.01ms under `prefers-reduced-motion: reduce`.",
    "Entry motion, where an intent requires it, lives in [[fault-notification]], [[fault-banner]] and [[fault-blocking]]; motion weight never encodes severity."
  ],
  guidance: {
    do: [
      "Prefer the intent-specific pattern whenever the Aegis intent is known; use the shell for adapters and custom compositions.",
      "Keep the severity text, marker, title, message and reference in that order so every fault reads the same way.",
      "Use the default Aegis labels (Try again, Sign in, Reload, …) or localize them without changing the capability name."
    ],
    avoid: [
      "Inventing actions such as Continue anyway or Ignore that Aegis did not supply.",
      "Choosing severity from visual weight or color, or omitting the severity text because the border already shows it.",
      "Placing developer-only diagnostics, internal paths or tokens anywhere in the shell."
    ]
  },
  related: [
    { slug: "fault-inline", note: "Aegis Inline intent: the same shell placed next to the affected control or region and referenced with aria-describedby." },
    { slug: "fault-notification", note: "Aegis Notification intent: a persistent, dismissible toast-style surface that may use role=status on insertion." },
    { slug: "fault-banner", note: "Aegis Banner intent: a full-width page or application condition that persists while it applies." },
    { slug: "fault-blocking", note: "Aegis Blocking intent: a native modal dialog opened and governed by the application." },
    { slug: "recovery-actions", note: "The capability-annotated button group used inside every fault surface." },
    { slug: "alert", note: "General status or warning communication that is not an Aegis fault." }
  ]
};
