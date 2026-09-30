export default {
  name: "Fault banner",
  category: "faults",
  behavior: "Application / Limen",
  summary: "Persistent page/application banner for degraded or critical Aegis conditions.",
  purpose: {
    description: "A fault banner presents an Aegis presentation whose intent is `Banner`: a condition that affects the whole page or application, such as degraded storage or a read-only mode, and that persists for as long as the application reports it. It composes the alert surface (`ef-alert`) with the fault vocabulary and stays in normal page flow at full width, usually at the top of the main content. The application inserts it once, keeps it while the condition holds, and removes it when Aegis reports the condition resolved. Visual weight reflects the Critical severity text; it is never inferred from placement.",
    useWhen: [
      "Aegis reports intent `Banner` for a condition that affects everything on the page, not one control.",
      "The application keeps working in a degraded state and the user needs a durable reminder plus the legal recovery actions.",
      "The condition should remain visible while the user navigates within the affected area."
    ],
    avoidWhen: [
      "The fault is local to one operation or field: use [[fault-inline]].",
      "The fault happened in the background and can be dismissed: use [[fault-notification]].",
      "The application cannot continue safely: use [[fault-blocking]].",
      "The message is general page status or an announcement with no Aegis fault behind it: use [[alert]] or [[callout]]."
    ],
    characteristics: [
      "Full-width, in-flow surface; it pushes content down instead of overlaying it.",
      "Severity is visible text; Critical additionally thickens the top and bottom borders.",
      "Animates only on first insertion (a short fade and settle), never on rerender.",
      "Uses `role=\"status\"` for the first insertion only; a persistent banner must not announce again on every render."
    ]
  },
  examples: [
    {
      id: "read-only-mode",
      title: "Degraded read-only mode",
      description: "An error-severity banner above a workspace while the storage service is unavailable. Aegis supplied Reload as the only recovery action. Error severity keeps the standard 2px block borders.",
      html: `<ef-fault-banner class="ef-component-tag">
  <aside class="ef-alert ef-fault-banner" role="status" data-ef-intent="banner" data-ef-severity="error" data-ef-motion-entry aria-labelledby="fault-banner-read-only-mode-title">
    <div class="ef-alert__icon" aria-hidden="true">!</div>
    <div class="ef-fault-banner__body">
      <p class="ef-fault__severity">Error</p>
      <h2 class="ef-alert__title" id="fault-banner-read-only-mode-title">Changes cannot be saved right now</h2>
      <p>Document storage is unavailable. You can keep reading; editing is paused until storage returns.</p>
      <p class="ef-fault-reference">Reference <code>AG-6YH2D</code></p>
    </div>
    <div class="ef-recovery-actions" role="group" aria-label="Recovery actions">
      <button type="button" data-ef-aegis-capability="CanReload">Reload</button>
    </div>
  </aside>
</ef-fault-banner>`
    },
    {
      id: "rerendered-warning",
      title: "Persisting warning after rerender",
      description: "The same condition shown on the next page of the application. The banner has no role and no data-ef-motion-entry, so it neither re-announces nor animates. Aegis supplied no recovery action.",
      html: `<ef-fault-banner class="ef-component-tag">
  <aside class="ef-alert ef-fault-banner" data-ef-intent="banner" data-ef-severity="warning" aria-labelledby="fault-banner-rerendered-warning-title">
    <div class="ef-alert__icon" aria-hidden="true">!</div>
    <div class="ef-fault-banner__body">
      <p class="ef-fault__severity">Warning</p>
      <h2 class="ef-alert__title" id="fault-banner-rerendered-warning-title">Payment confirmations are delayed</h2>
      <p>Orders are accepted normally. Confirmation emails may arrive up to an hour late.</p>
      <p class="ef-fault-reference">Reference <code>AG-40RQN</code></p>
    </div>
  </aside>
</ef-fault-banner>`
    },
    {
      id: "critical-two-actions",
      title: "Critical condition with two recovery paths",
      description: "Critical severity thickens the top and bottom borders to 3px. Two Aegis capabilities are offered in the order supplied; neither is a bypass.",
      html: `<ef-fault-banner class="ef-component-tag">
  <aside class="ef-alert ef-fault-banner" role="status" data-ef-intent="banner" data-ef-severity="critical" data-ef-motion-entry aria-labelledby="fault-banner-critical-two-actions-title">
    <div class="ef-alert__icon" aria-hidden="true">!!</div>
    <div class="ef-fault-banner__body">
      <p class="ef-fault__severity">Critical</p>
      <h2 class="ef-alert__title" id="fault-banner-critical-two-actions-title">Your permissions could not be verified</h2>
      <p>Actions that change records are disabled until your access is confirmed.</p>
      <p class="ef-fault-reference">Reference <code>AG-5ZE7K</code></p>
    </div>
    <div class="ef-recovery-actions" role="group" aria-label="Recovery actions">
      <button type="button" data-ef-aegis-capability="CanReauthenticate">Sign in</button>
      <button type="button" data-ef-aegis-capability="CanReload">Reload</button>
    </div>
  </aside>
</ef-fault-banner>`
    },
    {
      id: "mobile-diagnostics",
      title: "Diagnostics banner on a phone",
      description: "A critical banner at the top of a phone layout, with its recovery action below the text.",
      mobile: {
        height: 420,
        notes: [
          "Below 36rem the three-column grid (icon, body, actions) becomes two columns; the recovery group moves to its own full-width row beneath the body without changing reading order.",
          "The recovery button becomes full width with a 44px minimum height.",
          "The banner stays in page flow at 100% width, so it scrolls away with content rather than covering it.",
          "Long titles and references wrap; there is no horizontal scrolling at 320px in either orientation."
        ]
      },
      html: `<ef-fault-banner class="ef-component-tag">
  <aside class="ef-alert ef-fault-banner" role="status" data-ef-intent="banner" data-ef-severity="critical" data-ef-motion-entry aria-labelledby="fault-banner-mobile-diagnostics-title">
    <div class="ef-alert__icon" aria-hidden="true">!!</div>
    <div class="ef-fault-banner__body">
      <p class="ef-fault__severity">Critical</p>
      <h2 class="ef-alert__title" id="fault-banner-mobile-diagnostics-title">Diagnostics storage is unavailable</h2>
      <p>New diagnostics are queued on this device.</p>
      <p class="ef-fault-reference">Reference <code>AG-22K8M</code></p>
    </div>
    <div class="ef-recovery-actions" role="group" aria-label="Recovery actions">
      <button type="button" data-ef-aegis-capability="CanRestoreSink">Reconnect diagnostics</button>
    </div>
  </aside>
</ef-fault-banner>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: "aside.ef-fault-banner", values: "status", default: "absent", description: "Use for the first insertion only. Omit it when the same banner is re-rendered so it does not announce again." },
      { name: "aria-labelledby", on: "aside.ef-fault-banner", values: "id of .ef-alert__title", default: "—", description: "Names the complementary region by the banner title." },
      { name: "data-ef-severity", on: "aside.ef-fault-banner", values: "diagnostic | warning | error | critical", default: "—", description: "Aegis severity. critical thickens the block borders; always paired with visible severity text." },
      { name: "data-ef-intent", on: "aside.ef-fault-banner", values: "banner", default: "—", description: "Records the Aegis intent. Descriptive only." },
      { name: "data-ef-motion-entry", on: "aside.ef-fault-banner", values: "boolean", default: "absent", description: "Opts into the insertion fade and settle. Add it only on the first render." },
      { name: "data-ef-motion-weight", on: "aside.ef-fault-banner", values: "light | standard | heavy", default: "standard", description: "Presentation-only perceived mass for the entry settle. Keep the standard default; it never reflects severity." },
      { name: "aria-hidden", on: ".ef-alert__icon", values: "true", default: "—", description: "Hides the decorative marker glyph." },
      { name: "aria-label", on: ".ef-recovery-actions", values: "string", default: "—", description: "Names the recovery group." },
      { name: "type", on: "button", values: "button", default: "—", description: "Required on recovery buttons." },
      { name: "data-ef-aegis-capability", on: "button", values: "Aegis capability name", default: "—", description: "Exact Aegis capability identity; the application revalidates it on click." }
    ],
    hooks: {
      "ef-fault-banner": "Root, applied together with `ef-alert`. A full-width icon/body/actions grid with 1px inline borders and 2px block borders.",
      "ef-fault-banner__body": "Text column for severity, title, message and reference; shrinks to zero minimum width so text wraps.",
      "data-ef-severity": "The value critical increases the block (top and bottom) border width from 2px to 3px.",
      "data-ef-motion-entry": "Enables the one-time insertion transition: opacity from 0 and a 0.3rem downward settle via @starting-style.",
      "data-ef-motion-weight": "Selects the light, standard (default) or heavy physics preset for the settle duration. Presentation only."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Reaches the recovery buttons in source order. The banner never takes focus when it appears." },
      { keys: "Enter / Space", action: "Activates the focused recovery button (native button behavior)." }
    ],
    events: [
      { name: "click", description: "Native click on a recovery button, which the application revalidates and translates into a typed recovery request." }
    ],
    form: "Not a form control. Recovery buttons are type=\"button\"."
  },
  states: [
    { name: "Inserted", how: "role=\"status\" + data-ef-motion-entry on first render", description: "Announced once and settles into place." },
    { name: "Persisting", how: "no role and no data-ef-motion-entry on later renders", description: "Visually identical, silent and static." },
    { name: "Critical", how: "data-ef-severity=\"critical\" plus the text Critical", description: "3px top and bottom borders in addition to the text label." },
    { name: "Other severities", how: "data-ef-severity=\"diagnostic|warning|error\" plus text", description: "Standard 2px block borders; the text label carries the level." },
    { name: "No recovery", how: "omit .ef-recovery-actions", description: "Only the explanation and reference are shown." }
  ],
  accessibility: {
    forma: [
      "Provides visible severity text and a decorative icon marker; border thickness for Critical is an additional non-color cue.",
      "Keeps recovery buttons native, focus-visible and at least 44px tall.",
      "Keeps borders, icon and text visible in forced-colors mode (Canvas/CanvasText, no shadow).",
      "Limits motion to a single insertion transition that collapses under reduced motion."
    ],
    consumer: [
      "Insert the banner once with role=\"status\"; re-render it without the role so it does not announce repeatedly.",
      "Place it at the top of the affected content in source order, and keep it while the condition persists.",
      "Supply only Aegis recovery actions and revalidate them on click; never add a bypass.",
      "Remove it when Aegis reports the condition resolved or superseded."
    ]
  },
  responsive: [
    "The banner is `inline-size: 100%` in page flow; it never overlays content.",
    "The grid is icon, flexible body and actions; below a 36rem viewport the actions move to a full-width row under the body.",
    "Recovery buttons become full width at the same breakpoint; each keeps a 44px minimum height.",
    "Titles, messages and reference codes wrap without horizontal overflow at 320px."
  ],
  motion: [
    "With `data-ef-motion-entry`, the banner fades in and settles 0.3rem downward on first render (perceptual opacity plus damped inertial translate).",
    "Standard perceived weight is the default; weight never encodes severity.",
    "Because @starting-style applies only when the element first appears, re-rendered banners without the attribute do not animate.",
    "Under `prefers-reduced-motion: reduce` durations collapse to 0.01ms and the banner appears in place."
  ],
  guidance: {
    do: [
      "Explain what still works and what is paused.",
      "Keep one banner per condition; update its text when Aegis updates the presentation.",
      "Show the reference so users can quote it."
    ],
    avoid: [
      "Stacking several banners for the same underlying condition.",
      "Re-adding role=\"status\" or data-ef-motion-entry on every render.",
      "Offering Continue anyway or other actions Aegis did not supply."
    ]
  },
  related: [
    { slug: "alert", note: "General page status or warning; fault-banner reuses the alert surface for Aegis Banner intent." },
    { slug: "fault-notification", note: "For background faults that can be dismissed and float at the viewport corner." },
    { slug: "fault-blocking", note: "When the application must stop until a recovery action succeeds." },
    { slug: "diagnostic-status", note: "Shows diagnostic persistence state as operational status, not a fault." }
  ]
};
