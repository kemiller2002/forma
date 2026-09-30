export default {
  name: "Fault notification",
  category: "faults",
  behavior: "Application / Limen",
  summary: "Persistent, dismissible notification surface for Aegis Notification intent; lifecycle remains application-owned.",
  purpose: {
    description: "A fault notification presents an Aegis presentation whose intent is `Notification`: something failed that the user should know about even though they are not looking at the affected region, such as a background synchronization. It composes the toast surface (`ef-toast`) with the fault vocabulary: marker, visible severity, title, message, reference, Aegis-supplied recovery actions and an optional dismiss button. Forma runs no timers and owns no lifecycle. The application inserts the notification, decides whether it is dismissible, handles the dismiss click, throttles repeats and removes it when Aegis reports the fault resolved.",
    useWhen: [
      "Aegis reports intent `Notification` for a failure outside the user's current focus, such as a background save, sync or export.",
      "The user can continue working, but should be able to recover or quote the reference.",
      "The application inserts a genuinely new notification and wants one polite announcement."
    ],
    avoidWhen: [
      "The fault belongs to a control or region on screen: use [[fault-inline]] next to it.",
      "The condition persists for the whole page or application: use [[fault-banner]].",
      "Work cannot continue: use [[fault-blocking]].",
      "The message is a transient success or neutral confirmation rather than an Aegis fault: use [[toast]].",
      "You need auto-dismissal for an actionable fault; Forma does not provide timers and actionable faults should persist."
    ],
    characteristics: [
      "Persistent by default: nothing in Forma dismisses it, and actionable faults should stay until dismissed or resolved.",
      "Uses `role=\"status\"` only when the application inserts a new notification; rerenders of an existing one should not announce again.",
      "The dismiss button is an ordinary native button; hover is never required to inspect, pause, dismiss or recover.",
      "Enters with the standard perceived motion weight (a short fade and a small downward settle); motion never encodes severity."
    ]
  },
  examples: [
    {
      id: "reauthenticate",
      title: "Background sync needs sign-in",
      description: "An error raised by a background synchronization. Aegis supplied the Sign in capability. The dismiss button's accessible name starts with its visible label, so speech users can say \"Dismiss\".",
      html: `<ef-fault-notification class="ef-component-tag">
  <aside class="ef-toast ef-fault-notification" role="status" data-ef-intent="notification" data-ef-severity="error" data-ef-motion-weight="standard" data-ef-motion-entry aria-labelledby="fault-notification-reauthenticate-title">
    <div class="ef-fault-notification__marker" aria-hidden="true">!</div>
    <div class="ef-fault-notification__body">
      <p class="ef-fault__severity">Error</p>
      <h3 class="ef-toast__title" id="fault-notification-reauthenticate-title">Calendar sync stopped</h3>
      <p>Your sign-in to the calendar service expired. Events created since 09:40 are stored on this device.</p>
      <p class="ef-fault-reference">Reference <code>AG-8LM3E</code></p>
      <div class="ef-recovery-actions" role="group" aria-label="Recovery actions">
        <button type="button" data-ef-aegis-capability="CanReauthenticate">Sign in</button>
      </div>
    </div>
    <button type="button" class="ef-fault-notification__dismiss" data-ef-action="dismiss" aria-label="Dismiss calendar sync notification">Dismiss</button>
  </aside>
</ef-fault-notification>`
    },
    {
      id: "informational-rerender",
      title: "Restored notification without re-announcement",
      description: "A diagnostic notification re-rendered after navigation. It has no role=status because it was already announced when first inserted, no recovery actions because Aegis supplied none, and no data-ef-motion-entry so it does not animate again.",
      html: `<ef-fault-notification class="ef-component-tag">
  <aside class="ef-toast ef-fault-notification" data-ef-intent="notification" data-ef-severity="diagnostic" aria-labelledby="fault-notification-informational-rerender-title">
    <div class="ef-fault-notification__marker" aria-hidden="true">i</div>
    <div class="ef-fault-notification__body">
      <p class="ef-fault__severity">Diagnostic</p>
      <h3 class="ef-toast__title" id="fault-notification-informational-rerender-title">Search index is rebuilding</h3>
      <p>Results may miss documents added in the last few minutes.</p>
      <p class="ef-fault-reference">Reference <code>AG-1B9SW</code></p>
    </div>
    <button type="button" class="ef-fault-notification__dismiss" data-ef-action="dismiss" aria-label="Dismiss search index notification">Dismiss</button>
  </aside>
</ef-fault-notification>`
    },
    {
      id: "not-dismissible",
      title: "Critical notification that cannot be dismissed",
      description: "Current application policy does not allow dismissal while diagnostics are disconnected, so no dismiss button is rendered. The only way forward is the Aegis-supplied recovery action or resolution upstream.",
      html: `<ef-fault-notification class="ef-component-tag">
  <aside class="ef-toast ef-fault-notification" role="status" data-ef-intent="notification" data-ef-severity="critical" data-ef-motion-entry aria-labelledby="fault-notification-not-dismissible-title">
    <div class="ef-fault-notification__marker" aria-hidden="true">!!</div>
    <div class="ef-fault-notification__body">
      <p class="ef-fault__severity">Critical</p>
      <h3 class="ef-toast__title" id="fault-notification-not-dismissible-title">Diagnostics are disconnected</h3>
      <p>New reports are held on this device until the diagnostics service is reachable.</p>
      <p class="ef-fault-reference">Reference <code>AG-22K8M</code></p>
      <div class="ef-recovery-actions" role="group" aria-label="Recovery actions">
        <button type="button" data-ef-aegis-capability="CanRestoreSink">Reconnect diagnostics</button>
      </div>
    </div>
  </aside>
</ef-fault-notification>`
    },
    {
      id: "mobile-sync",
      title: "Sync failure on a phone",
      description: "A warning notification at phone width with a recovery action and a dismiss control.",
      mobile: {
        height: 520,
        notes: [
          "The surface is fixed to the bottom inline-end corner with a 1rem inset (respecting the safe-area inset) and is at most the viewport width minus 2rem, so it never causes horizontal scrolling.",
          "Below 36rem the dismiss button moves from the side column to its own full-width row at the end, and the recovery buttons become full width; each keeps a 44px minimum height.",
          "Long titles and reference codes wrap inside the body column.",
          "Because the surface is fixed, it can cover page content at the bottom of short landscape viewports; the application should keep the notification count low and leave content scrollable beneath it."
        ]
      },
      html: `<ef-fault-notification class="ef-component-tag">
  <aside class="ef-toast ef-fault-notification" role="status" data-ef-intent="notification" data-ef-severity="warning" data-ef-motion-entry aria-labelledby="fault-notification-mobile-sync-title">
    <div class="ef-fault-notification__marker" aria-hidden="true">!</div>
    <div class="ef-fault-notification__body">
      <p class="ef-fault__severity">Warning</p>
      <h3 class="ef-toast__title" id="fault-notification-mobile-sync-title">Photos are waiting to upload</h3>
      <p>12 photos from the site visit are stored on this phone.</p>
      <p class="ef-fault-reference">Reference <code>AG-91B7Q</code></p>
      <div class="ef-recovery-actions" role="group" aria-label="Recovery actions">
        <button type="button" data-ef-aegis-capability="CanRetry">Try again</button>
      </div>
    </div>
    <button type="button" class="ef-fault-notification__dismiss" data-ef-action="dismiss" aria-label="Dismiss photo upload notification">Dismiss</button>
  </aside>
</ef-fault-notification>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: "aside.ef-fault-notification", values: "status", default: "absent", description: "Use only when the application inserts a genuinely new notification. Omit it when re-rendering an existing notification so it is not announced twice." },
      { name: "aria-labelledby", on: "aside.ef-fault-notification", values: "id of the title", default: "—", description: "Names the complementary region by the notification title." },
      { name: "data-ef-severity", on: "aside.ef-fault-notification", values: "diagnostic | warning | error | critical", default: "—", description: "Records the Aegis severity. The notification surface does not restyle by severity; the visible severity text is the cue." },
      { name: "data-ef-intent", on: "aside.ef-fault-notification", values: "notification", default: "—", description: "Records the Aegis intent. Descriptive only." },
      { name: "data-ef-motion-weight", on: "aside.ef-fault-notification", values: "light | standard | heavy", default: "standard", description: "Presentation-only perceived mass for the entry settle. Keep the standard default; never map it to severity." },
      { name: "data-ef-motion-entry", on: "aside.ef-fault-notification", values: "boolean", default: "absent", description: "Opts into the entry fade and settle when the element is first rendered. Omit it when re-rendering an existing notification." },
      { name: "data-ef-action", on: ".ef-fault-notification__dismiss", values: "dismiss", default: "—", description: "Marks the dismiss button for application code. Forma attaches no behavior to it." },
      { name: "aria-label", on: ".ef-fault-notification__dismiss / .ef-recovery-actions", values: "string", default: "—", description: "On the dismiss button, start with the visible label and add which notification it dismisses. On the recovery group, name the group." },
      { name: "aria-hidden", on: ".ef-fault-notification__marker", values: "true", default: "—", description: "Hides the decorative marker glyph." },
      { name: "type", on: "button", values: "button", default: "—", description: "Required on dismiss and recovery buttons." },
      { name: "data-ef-aegis-capability", on: "recovery button", values: "Aegis capability name", default: "—", description: "Exact Aegis capability identity; revalidated by the application on click." }
    ],
    hooks: {
      "ef-fault-notification": "Root, applied together with `ef-toast`. A marker/body/dismiss grid, 32rem wide at most, with a thick start border and shadow. It is always visible (it does not depend on :popover-open) and inherits the toast's fixed bottom inline-end placement.",
      "ef-fault-notification__marker": "Decorative round marker glyph.",
      "ef-fault-notification__body": "Text column for severity, title, message, reference and recovery actions.",
      "ef-fault-notification__dismiss": "Native dismiss button in the end column; full-width row below 36rem.",
      "data-ef-motion-entry": "Enables the insertion transition: opacity from 0 and a 0.45rem downward settle, driven by @starting-style.",
      "data-ef-motion-weight": "Selects the light, standard (default) or heavy physics preset for the settle duration. Presentation only."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Reaches recovery buttons and then the dismiss button in source order. Focus is not moved into the notification when it appears." },
      { keys: "Enter / Space", action: "Activates the focused button. Dismissal happens only when application code handles the click." },
      { keys: "Escape", action: "No built-in effect: the surface is not a popover or dialog. The application may add an Escape shortcut if its policy allows dismissal." }
    ],
    events: [
      { name: "click", description: "Native click on a recovery or dismiss button. The application revalidates recovery capabilities and removes the notification itself on dismiss." }
    ],
    form: "Not a form control. Buttons are type=\"button\"."
  },
  states: [
    { name: "Newly inserted", how: "role=\"status\" + data-ef-motion-entry on first render", description: "Announced politely once and fades in with a small settle." },
    { name: "Re-rendered", how: "no role and no data-ef-motion-entry", description: "Same visual surface without a second announcement or animation." },
    { name: "Dismissible", how: ".ef-fault-notification__dismiss present", description: "A native dismiss button in the end column; the application removes the element on click." },
    { name: "Not dismissible", how: "dismiss button omitted", description: "Persists until the application removes it after resolution." },
    { name: "Severity", how: "data-ef-severity plus visible text", description: "Severity is read from the text label; the notification surface itself does not change border style." }
  ],
  accessibility: {
    forma: [
      "Shows severity as visible text and a decorative marker; color is never the only cue.",
      "Keeps dismiss and recovery controls as native buttons with 44px minimum height and the shared focus ring.",
      "Never starts timers, so actionable faults do not disappear before the user can act.",
      "Collapses the entry transition to 0.01ms under reduced motion; in forced colors the surface uses Canvas/CanvasText and drops the shadow."
    ],
    consumer: [
      "Add role=\"status\" only for a newly inserted notification, and do not duplicate the same message into another live region.",
      "Make the dismiss button's accessible name include its visible text (for example \"Dismiss …\"), and handle the click to remove the element.",
      "Decide dismissibility from current application policy; omit the dismiss button when dismissal is not allowed.",
      "Stack or queue multiple notifications yourself; Forma places every notification at the same fixed corner.",
      "If you choose timed dismissal for non-actionable information, keep a durable history and meet your timing-adjustable policy."
    ]
  },
  responsive: [
    "Width is `min(32rem, 100vw - 2rem)` and the toast base limits it further to `min(26rem, 100vw - 2rem)`, so it always fits the viewport.",
    "Placement comes from `ef-toast`: fixed to the bottom inline-end corner with a 1rem inset that respects safe-area insets.",
    "Below a 36rem viewport the grid becomes two columns, the dismiss button stretches across its own row and recovery buttons become full width.",
    "Text and reference codes wrap within the body column."
  ],
  motion: [
    "With `data-ef-motion-entry`, the notification fades in (perceptual duration, independent of mass) and settles 0.45rem downward into place with the damped inertial easing.",
    "The default perceived weight is standard. `data-ef-motion-weight` changes only the settle duration; it never expresses severity.",
    "Motion runs only on first render through @starting-style; re-rendered notifications without the attribute appear in place.",
    "There is no exit animation from Forma: removal is immediate when the application removes the element.",
    "Under `prefers-reduced-motion: reduce` all durations collapse to 0.01ms; the notification appears in its final position immediately."
  ],
  guidance: {
    do: [
      "Say what still works (\"stored on this device\") alongside what failed.",
      "Keep the reference visible for support conversations.",
      "Remove or update the notification when Aegis reports the fault resolved or superseded."
    ],
    avoid: [
      "Auto-dismissing a notification that carries recovery actions.",
      "Re-announcing the same notification on every render.",
      "Using a heavier motion weight to make a critical fault feel more urgent."
    ]
  },
  related: [
    { slug: "toast", note: "Popover-backed transient messages that are not Aegis faults; fault-notification reuses its surface but is always visible and never timed." },
    { slug: "fault-banner", note: "For a persistent condition that affects the whole page and stays in the page flow." },
    { slug: "fault-inline", note: "For a fault shown next to the region it affects." },
    { slug: "fault", note: "The shared fault vocabulary used by every intent pattern." }
  ]
};
