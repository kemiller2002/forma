export default {
  name: "Fault inline",
  category: "faults",
  behavior: "Application / Limen",
  summary: "Operation-local Aegis fault presentation with reference and legal recovery actions.",
  purpose: {
    description: "An inline fault presents an Aegis presentation whose intent is `Inline`: the failure belongs to one operation, field or region and is shown right next to it. It uses the [[fault]] shell with the `ef-fault--inline` modifier, which tightens padding and uses the secondary surface so the fault reads as part of the affected area. It never announces itself globally or steals focus; instead the affected control or region points at it with `aria-describedby`, so the fault is read when the user reaches that control. The application renders it, supplies the recovery actions Aegis derived, and removes it when the fault resolves.",
    useWhen: [
      "Aegis reports intent `Inline` for a failure tied to one save, upload, row or form section.",
      "The user can recover in place, for example by retrying the operation next to the control that failed.",
      "The affected control should describe the failure when it is focused, rather than the page announcing it."
    ],
    avoidWhen: [
      "The failure affects the whole page or application: use [[fault-banner]].",
      "The user must be told about something that happened elsewhere or in the background: use [[fault-notification]].",
      "The application cannot continue until a recovery action is taken: use [[fault-blocking]].",
      "The problem is a user input validation error, not an Aegis fault: use [[validation-message]] or [[validation-summary]].",
      "Several faults across a form need one entry point after a failed submit: use [[fault-summary]] and keep individual inline faults near their regions."
    ],
    characteristics: [
      "Placed in source order immediately after, or inside, the affected region so reading order matches visual proximity.",
      "Never focuses itself and carries no live-region role; the affected control's `aria-describedby` makes it discoverable.",
      "Severity is visible text plus the start-border style; the marker is decorative.",
      "Recovery actions are only the ones Aegis supplied, as native buttons with `data-ef-aegis-capability`."
    ]
  },
  examples: [
    {
      id: "field-save",
      title: "Field that failed to save",
      description: "An autosaved field whose last save failed. The input lists the fault in aria-describedby after its own help text, so a screen reader announces the failure when the field is focused, without any global announcement.",
      html: `<ef-fault-inline class="ef-component-tag">
  <div class="ef-field">
    <label class="ef-field__label" for="fault-inline-field-save-input">Billing contact</label>
    <span class="ef-field__description" id="fault-inline-field-save-help">Receives invoices and payment reminders.</span>
    <input id="fault-inline-field-save-input" name="billing-contact" type="email" value="finance@example.com" aria-describedby="fault-inline-field-save-help fault-inline-field-save-fault">
  </div>
  <div class="ef-fault ef-fault--inline" role="group" id="fault-inline-field-save-fault" data-ef-intent="inline" data-ef-severity="error" aria-labelledby="fault-inline-field-save-title">
    <div class="ef-fault__marker" aria-hidden="true">!</div>
    <div class="ef-fault__body">
      <p class="ef-fault__severity">Error</p>
      <p class="ef-fault__title" id="fault-inline-field-save-title"><strong>Billing contact was not saved.</strong></p>
      <p class="ef-fault__message">Your value is still in the field. Try again when you are back online.</p>
      <p class="ef-fault-reference">Reference <code>AG-7TT2Q</code></p>
    </div>
    <div class="ef-recovery-actions" role="group" aria-label="Recovery actions for billing contact">
      <button type="button" data-ef-aegis-capability="CanRetry">Try again</button>
    </div>
  </div>
</ef-fault-inline>`
    },
    {
      id: "import-row",
      title: "Import batch that could not be processed",
      description: "A warning inside a batch detail region. Aegis supplied two capabilities, Process again and Set aside, which are rendered with their default labels. The region's aria-describedby points at the fault.",
      html: `<ef-fault-inline class="ef-component-tag">
  <section aria-labelledby="fault-inline-import-row-heading" aria-describedby="fault-inline-import-row-fault">
    <h3 id="fault-inline-import-row-heading">Batch 2026-09-29-B</h3>
    <p>412 invoices received from the supplier feed.</p>
    <div class="ef-fault ef-fault--inline" role="group" id="fault-inline-import-row-fault" data-ef-intent="inline" data-ef-severity="warning" aria-labelledby="fault-inline-import-row-title">
      <div class="ef-fault__marker" aria-hidden="true">!</div>
      <div class="ef-fault__body">
        <p class="ef-fault__severity">Warning</p>
        <p class="ef-fault__title" id="fault-inline-import-row-title"><strong>7 invoices could not be read.</strong></p>
        <p class="ef-fault__message">The rest of the batch was imported. You can process the 7 again or set them aside for review.</p>
        <p class="ef-fault-reference">Reference <code>AG-61KDA</code></p>
      </div>
      <div class="ef-recovery-actions" role="group" aria-label="Recovery actions for batch 2026-09-29-B">
        <button type="button" data-ef-aegis-capability="CanReprocess">Process again</button>
        <button type="button" data-ef-aegis-capability="CanQuarantine">Set aside</button>
      </div>
    </div>
  </section>
</ef-fault-inline>`
    },
    {
      id: "no-recovery",
      title: "Failure with no legal recovery",
      description: "Aegis supplied no recovery capability for this operation, so the recovery group is omitted. The message tells the user what remains true instead of offering an action that would be refused.",
      html: `<ef-fault-inline class="ef-component-tag">
  <div class="ef-fault ef-fault--inline" role="group" data-ef-intent="inline" data-ef-severity="error" aria-labelledby="fault-inline-no-recovery-title">
    <div class="ef-fault__marker" aria-hidden="true">!</div>
    <div class="ef-fault__body">
      <p class="ef-fault__severity">Error</p>
      <p class="ef-fault__title" id="fault-inline-no-recovery-title"><strong>Signature request was not sent.</strong></p>
      <p class="ef-fault__message">The document is unchanged. An administrator has been notified.</p>
      <p class="ef-fault-reference">Reference <code>AG-2WPZ8</code></p>
    </div>
  </div>
</ef-fault-inline>`
    },
    {
      id: "mobile-upload",
      title: "Upload failure on a phone",
      description: "An upload fault inside a narrow form. The two recovery buttons stack at full width beneath the message.",
      mobile: {
        height: 440,
        notes: [
          "Below 36rem the marker and body share the first row and the recovery group moves to a full-width row underneath.",
          "Each recovery button fills the width and keeps a 44px minimum height, so Try again and Sign in are separate, comfortable touch targets.",
          "Title, message and reference wrap inside the body column; the reference code breaks anywhere instead of overflowing.",
          "The fault stays directly after the affected region in both orientations; it is never moved to a separate mobile-only location."
        ]
      },
      html: `<ef-fault-inline class="ef-component-tag">
  <div class="ef-fault ef-fault--inline" role="group" data-ef-intent="inline" data-ef-severity="error" aria-labelledby="fault-inline-mobile-upload-title">
    <div class="ef-fault__marker" aria-hidden="true">!</div>
    <div class="ef-fault__body">
      <p class="ef-fault__severity">Error</p>
      <p class="ef-fault__title" id="fault-inline-mobile-upload-title"><strong>receipt-scan-september.pdf did not upload.</strong></p>
      <p class="ef-fault__message">Your sign-in expired during the upload.</p>
      <p class="ef-fault-reference">Reference <code>AG-5CN0V</code></p>
    </div>
    <div class="ef-recovery-actions" role="group" aria-label="Recovery actions for receipt upload">
      <button type="button" data-ef-aegis-capability="CanRetry">Try again</button>
      <button type="button" data-ef-aegis-capability="CanReauthenticate">Sign in</button>
    </div>
  </div>
</ef-fault-inline>`
    }
  ],
  api: {
    attributes: [
      { name: "id", on: ".ef-fault", values: "unique id", default: "—", description: "Lets the affected control or region reference the fault with aria-describedby." },
      { name: "aria-describedby", on: "affected control or region", values: "id of the .ef-fault", default: "—", description: "Associates the fault with the control it is about. Append it after any existing help-text id." },
      { name: "role", on: ".ef-fault / .ef-recovery-actions", values: "group", default: "—", description: "A group role makes the fault container nameable with aria-labelledby; the recovery container is also a group." },
      { name: "aria-labelledby", on: ".ef-fault", values: "id of .ef-fault__title", default: "—", description: "Names the fault group by its title." },
      { name: "data-ef-severity", on: ".ef-fault", values: "diagnostic | warning | error | critical", default: "absent (error style)", description: "Aegis severity; selects the start-border style. Always paired with visible text." },
      { name: "data-ef-intent", on: ".ef-fault", values: "inline", default: "—", description: "Records that Aegis chose the Inline intent. Descriptive only." },
      { name: "aria-hidden", on: ".ef-fault__marker", values: "true", default: "—", description: "Hides the decorative marker glyph from assistive technology." },
      { name: "aria-label", on: ".ef-recovery-actions", values: "string", default: "—", description: "Names the recovery group; include the affected object when several inline faults are on one page." },
      { name: "type", on: "button", values: "button", default: "—", description: "Required so recovery buttons inside a form never submit it." },
      { name: "data-ef-aegis-capability", on: "button", values: "Aegis capability name", default: "—", description: "Exact Aegis capability identity. Not authorization; revalidate on click." }
    ],
    hooks: {
      "ef-fault--inline": "Applied with `ef-fault`. Tighter 0.75rem padding and the secondary surface so the fault sits inside the affected region.",
      "ef-fault": "The shared fault grid: marker, body and recovery columns with a severity-styled start border. See [[fault]].",
      "ef-fault__marker": "Decorative marker glyph in a ring.",
      "ef-fault__body": "Text column that wraps long content.",
      "ef-fault__severity": "Visible severity label.",
      "ef-fault__title": "The Aegis title; in inline use a paragraph with strong text is typical so the page outline is not disturbed.",
      "ef-fault__message": "Safe user-facing message.",
      "data-ef-severity": "Selects dotted (diagnostic), dashed (warning), solid (error) or wide-plus-outline (critical) start border."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the affected control and then the recovery buttons in source order. The fault never receives focus by itself." },
      { keys: "Enter / Space", action: "Activates the focused recovery button (native button behavior)." }
    ],
    events: [
      { name: "click", description: "Native click on a recovery button. The application maps it to a typed recovery request after revalidating the capability." }
    ],
    form: "The fault is not a form control. Recovery buttons are type=\"button\" so they never submit the surrounding form; the affected input keeps its own value and validity."
  },
  states: [
    { name: "Present", how: "rendered by the application", description: "The fault is in the DOM next to the affected region, described by it, and silent until reached." },
    { name: "Severity", how: "data-ef-severity plus visible text", description: "Diagnostic, Warning, Error or Critical, each with its own start-border style." },
    { name: "No recovery", how: "omit .ef-recovery-actions", description: "Only the message and reference are shown." },
    { name: "Resolved", how: "removed by the application", description: "When Aegis reports the fault resolved, the application removes the fault and the aria-describedby reference together." }
  ],
  accessibility: {
    forma: [
      "Provides visible severity text and a non-color border style for every severity.",
      "Keeps recovery actions as native buttons with the shared focus ring and 44px minimum height.",
      "Adds no live region and no focus movement, matching the Inline intent.",
      "Keeps the border, marker and text visible in forced-colors mode.",
      "On its secondary-surface background, severity, message and reference text use text.on-secondary-surface and links use text.primary, so every theme and brand meets WCAG AA 4.5:1 (FORMA-A11Y-002)."
    ],
    consumer: [
      "Place the fault next to the affected region in source order and reference it from that control or region with aria-describedby.",
      "Remove the aria-describedby reference when the fault is removed so the control is not described by a missing element.",
      "Give the fault container a role (for example group) if you name it with aria-labelledby; a plain div cannot carry a name.",
      "Render only Aegis-supplied actions and revalidate them on activation.",
      "Do not also announce the same fault in a global live region."
    ]
  },
  responsive: [
    "Uses the [[fault]] grid: marker, flexible body (`minmax(0, 1fr)`) and actions on wide viewports.",
    "Below a 36rem viewport the recovery group moves to its own full-width row and every button becomes full width.",
    "Text and reference codes wrap; nothing forces horizontal page overflow at 320px.",
    "The breakpoint follows the viewport, not the container, so a fault in a narrow column on a wide screen keeps its side-by-side actions; keep such columns wide enough for the button labels."
  ],
  motion: [
    "No animation: the inline fault appears and disappears with the application's render, without entry motion, so it never draws the eye away from the task.",
    "Recovery buttons use only the foundation hover/press background interpolation, which is reduced to 0.01ms under `prefers-reduced-motion: reduce`."
  ],
  guidance: {
    do: [
      "Keep the message about what happened and what remains true (\"Your value is still in the field\").",
      "Name the recovery group after the affected object when a page can show several inline faults.",
      "Keep the reference visible so the user can quote it to support."
    ],
    avoid: [
      "Moving focus to an inline fault when it appears.",
      "Showing a disabled or invented recovery button when Aegis supplied none.",
      "Using an inline fault for ordinary validation messages that have no Aegis fault behind them."
    ]
  },
  related: [
    { slug: "fault", note: "The common shell; fault-inline is the shell with the inline modifier and inline placement rules." },
    { slug: "validation-message", note: "For user input that is invalid, not for operational faults." },
    { slug: "fault-summary", note: "Gathers several unresolved faults into one focusable list after a failed submit." },
    { slug: "fault-notification", note: "For faults the user should learn about even though they are not looking at the affected region." }
  ]
};
