export default {
  name: "Recovery actions",
  category: "faults",
  behavior: "Aegis / Ordo / Application",
  summary: "Native buttons annotated with Aegis capability identity; current authority is revalidated on activation.",
  purpose: {
    description: "Recovery actions project the Aegis recovery capabilities of a fault into ordinary native buttons inside a labelled group. Each button carries `data-ef-aegis-capability` with the exact Aegis capability case name, such as `CanRetry`, so application or Limen code knows which typed recovery request the click represents. The attribute communicates intent only. It is not authority: stale DOM must never authorize an effect, so the application rechecks the current Aegis capability and Ordo/application state every time a button is activated. Forma decides neither which actions exist nor whether they are legal.",
    useWhen: [
      "An Aegis presentation carries one or more recovery actions and you are rendering it in any fault surface.",
      "You need the canonical labels (Try again, Sign in, Reload, Set aside, Process again, Open read-only, Reconnect diagnostics) or localized equivalents that keep the capability identity.",
      "A dialog footer, banner or inline fault needs its recovery buttons to wrap and stack consistently."
    ],
    avoidWhen: [
      "The actions are ordinary commands unrelated to an Aegis fault: use [[button]] or [[command-group]].",
      "You would need an action Aegis did not supply, such as Continue anyway or Ignore: do not render it.",
      "The only action is dismissing a notification; the dismiss control belongs to [[fault-notification]], not to the recovery group."
    ],
    characteristics: [
      "Every action is a native `button type=\"button\"`, so keyboard activation, focus and accessible names come from the platform.",
      "Button order is the order Aegis supplied; Forma does not rank or highlight a primary action.",
      "Buttons wrap on wide screens and become full-width 44px rows on narrow screens.",
      "The group is named with `role=\"group\"` and `aria-label` so screen readers announce it as a set of recovery options."
    ]
  },
  examples: [
    {
      id: "localized-labels",
      title: "Localized labels",
      description: "French labels for three capabilities. The visible text changes; the capability identity in data-ef-aegis-capability does not, so application code maps clicks exactly as before.",
      html: `<ef-recovery-actions class="ef-component-tag">
  <div class="ef-recovery-actions" role="group" aria-label="Actions de récupération" lang="fr">
    <button type="button" data-ef-aegis-capability="CanRetry">Réessayer</button>
    <button type="button" data-ef-aegis-capability="CanReload">Recharger</button>
    <button type="button" data-ef-aegis-capability="CanRestoreSink">Reconnecter les diagnostics</button>
  </div>
</ef-recovery-actions>`
    },
    {
      id: "import-recovery",
      title: "Recovery for a failed import",
      description: "The group inside an inline fault for a data import. Aegis supplied Process again and Set aside; both keep their default labels. The group name includes the affected batch because several import faults can be on one page.",
      html: `<ef-recovery-actions class="ef-component-tag">
  <div class="ef-fault ef-fault--inline" role="group" data-ef-intent="inline" data-ef-severity="warning" aria-labelledby="recovery-actions-import-recovery-title">
    <div class="ef-fault__marker" aria-hidden="true">!</div>
    <div class="ef-fault__body">
      <p class="ef-fault__severity">Warning</p>
      <p class="ef-fault__title" id="recovery-actions-import-recovery-title"><strong>3 rows in timesheets-week-39.csv were not imported.</strong></p>
      <p class="ef-fault-reference">Reference <code>AG-61KDA</code></p>
    </div>
    <div class="ef-recovery-actions" role="group" aria-label="Recovery actions for timesheets-week-39.csv">
      <button type="button" data-ef-aegis-capability="CanReprocess">Process again</button>
      <button type="button" data-ef-aegis-capability="CanQuarantine">Set aside</button>
    </div>
  </div>
</ef-recovery-actions>`
    },
    {
      id: "mobile-stacked",
      title: "Stacked actions on a phone",
      description: "Three recovery actions at phone width.",
      mobile: {
        height: 280,
        notes: [
          "Below 36rem the group takes the full width and each button becomes a full-width row (flex-basis 100%).",
          "Every button keeps a 2.75rem (44px) minimum height, so adjacent actions are separate touch targets with a 0.5rem gap.",
          "Long or localized labels wrap inside the button instead of widening the page.",
          "Order is preserved when stacking: the first capability Aegis supplied is still first."
        ]
      },
      html: `<ef-recovery-actions class="ef-component-tag">
  <div class="ef-recovery-actions" role="group" aria-label="Recovery actions">
    <button type="button" data-ef-aegis-capability="CanReauthenticate">Sign in</button>
    <button type="button" data-ef-aegis-capability="CanOpenReadOnly">Open read-only</button>
    <button type="button" data-ef-aegis-capability="CanReload">Reload</button>
  </div>
</ef-recovery-actions>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: ".ef-recovery-actions", values: "group", default: "—", description: "Exposes the buttons as one named set." },
      { name: "aria-label", on: ".ef-recovery-actions", values: "string", default: "—", description: "Names the group, for example \"Recovery actions\". Include the affected object when several groups share a page." },
      { name: "type", on: "button", values: "button", default: "—", description: "Required so a recovery button never submits an enclosing form." },
      { name: "data-ef-aegis-capability", on: "button", values: "CanRetry | CanReauthenticate | CanReload | CanQuarantine | CanReprocess | CanOpenReadOnly | CanRestoreSink", default: "—", description: "The exact Aegis capability case name. Intent only, never authorization: the application revalidates the capability and domain state on every activation." },
      { name: "lang", on: ".ef-recovery-actions or button", values: "BCP 47 tag", default: "inherited", description: "Set when labels are in a different language from the page so they are pronounced correctly." }
    ],
    hooks: {
      "ef-recovery-actions": "Wrapping flex row with a 0.5rem gap. Direct child buttons get a 44px minimum height; below a 36rem viewport the row fills the width and each button becomes full width."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between recovery buttons in source order." },
      { keys: "Enter / Space", action: "Activates the focused button (native button behavior)." }
    ],
    events: [
      { name: "click", description: "Native click. Limen/application code reads data-ef-aegis-capability, revalidates the current Aegis capability and Ordo/application state, and only then issues the typed recovery request." }
    ],
    form: "Buttons are type=\"button\" and do not participate in form submission or reset."
  },
  states: [
    { name: "Available", how: "button rendered", description: "Aegis supplied the capability for the current presentation; it may still be rejected on revalidation." },
    { name: "Focus", how: ":focus-visible on the button", description: "The shared two-tone focus ring from Forma foundations." },
    { name: "Pressed", how: ":active", description: "Immediate darker surface; the hit target does not move." },
    { name: "Absent", how: "button not rendered", description: "Aegis did not supply the capability. Do not render a disabled placeholder." }
  ],
  accessibility: {
    forma: [
      "Uses native buttons, so role, name, focus and keyboard activation come from the platform.",
      "Guarantees a 44px minimum height for each direct child button and full-width stacking on narrow screens.",
      "Keeps visible focus and button borders in forced-colors mode through the foundation button styles."
    ],
    consumer: [
      "Label each button with the Aegis default label or a faithful localization.",
      "Name the group, and include the affected object when a page has several groups.",
      "Revalidate on activation and report a rejected or failed recovery with an updated fault presentation.",
      "Move focus sensibly after a recovery succeeds and the fault surface is removed."
    ]
  },
  responsive: [
    "A wrapping flex row: buttons flow onto new lines as space runs out; the group itself can shrink to zero minimum width.",
    "Below a 36rem viewport the group is full width and every button is a full-width row.",
    "Labels wrap inside buttons; nothing forces horizontal overflow at 320px."
  ],
  motion: [
    "No animation beyond the foundation button feedback: hover and release change the background color with a short perceptual transition, and press is immediate.",
    "Under `prefers-reduced-motion: reduce` that transition collapses to 0.01ms. Motion never delays capability execution."
  ],
  guidance: {
    do: [
      "Keep capability identity exact and in the order Aegis supplied.",
      "Treat every click as a request that may be refused by current state."
    ],
    avoid: [
      "Styling one recovery action as primary because it seems safest; Forma does not rank recovery options.",
      "Adding Continue anyway, Ignore or similar bypass actions.",
      "Relying on the presence of a button as proof that the action is still legal."
    ]
  },
  related: [
    { slug: "button", note: "General native buttons; recovery actions are buttons with Aegis capability identity and fault-specific layout." },
    { slug: "command-group", note: "For grouped commands that are not fault recovery." },
    { slug: "fault", note: "The fault shell that hosts the recovery group." },
    { slug: "fault-blocking", note: "Places the recovery group in the dialog footer as the only way forward." }
  ]
};
