export default {
  name: "Fault blocking",
  category: "faults",
  behavior: "Application / Limen",
  summary: "Native-dialog surface for Aegis Blocking intent with only application-supplied recovery actions.",
  purpose: {
    description: "A blocking fault presents an Aegis presentation whose intent is `Blocking`: the application cannot continue safely until one of the supplied recovery actions succeeds. It is a native `dialog` styled with `ef-dialog` and `ef-fault-blocking`, so a modal open gives the platform's focus containment, inert background and accessible dialog semantics. Forma cannot enforce a blocking policy with CSS. The application or Limen opens the dialog modally, chooses initial focus, decides whether a cancel request (Escape) is currently legal, revalidates every recovery action, and closes the dialog only after a legal transition changes the authoritative state.",
    useWhen: [
      "Aegis reports intent `Blocking`, for example when state cannot be verified or a session cannot be restored.",
      "Continuing would risk data loss or an unsafe action, and only specific recovery capabilities are legal.",
      "The user must choose among recovery paths before doing anything else."
    ],
    avoidWhen: [
      "The user can keep working while the fault exists: use [[fault-banner]] or [[fault-notification]].",
      "The fault concerns one operation: use [[fault-inline]].",
      "You need a confirmation or ordinary modal task: use [[dialog]].",
      "You would need a Continue anyway button to let users escape: that is not a blocking fault unless Aegis supplies a real capability meaning exactly that."
    ],
    characteristics: [
      "Native `dialog` semantics: named by its title, described by its message, and modal only when the application calls showModal() or uses an invoker with command=\"show-modal\".",
      "Contains only the recovery actions Aegis supplied. There is no close button unless dismissal is currently legal.",
      "Uses the heavy perceived motion weight by default because of the size of the surface and the commitment it asks for, not because of severity.",
      "Respects viewport and dynamic viewport bounds on phones, scrolling internally when content is long."
    ]
  },
  examples: [
    {
      id: "sign-in-required",
      title: "Sign-in required to continue",
      description: "An error-severity blocking fault with a single Aegis capability. The invoker uses the native command attributes to open the dialog modally for this preview; in an application Limen opens it when the Aegis intent is Blocking.",
      html: `<ef-fault-blocking class="ef-component-tag">
  <button type="button" commandfor="fault-blocking-sign-in-required-dialog" command="show-modal">Preview sign-in fault</button>
  <dialog class="ef-dialog ef-fault-blocking" id="fault-blocking-sign-in-required-dialog" data-ef-intent="blocking" data-ef-severity="error" aria-labelledby="fault-blocking-sign-in-required-title" aria-describedby="fault-blocking-sign-in-required-message">
    <div class="ef-dialog__body">
      <div class="ef-fault-blocking__heading">
        <div class="ef-fault-blocking__marker" aria-hidden="true">!</div>
        <div>
          <p class="ef-fault__severity">Error</p>
          <h2 id="fault-blocking-sign-in-required-title">Your session ended</h2>
        </div>
      </div>
      <p id="fault-blocking-sign-in-required-message">Sign in again to continue. The form you were completing is kept on this device.</p>
      <p class="ef-fault-reference">Reference <code>AG-3JH71</code></p>
    </div>
    <div class="ef-dialog__actions ef-recovery-actions" role="group" aria-label="Recovery actions">
      <button type="button" data-ef-aegis-capability="CanReauthenticate">Sign in</button>
    </div>
  </dialog>
</ef-fault-blocking>`
    },
    {
      id: "corrupt-local-copy",
      title: "Unverifiable local copy with safe details",
      description: "A critical blocking fault offering three Aegis capabilities. Approved, already-sanitized details sit in a collapsed disclosure inside the dialog body; nothing developer-only is rendered.",
      html: `<ef-fault-blocking class="ef-component-tag">
  <button type="button" commandfor="fault-blocking-corrupt-local-copy-dialog" command="show-modal">Preview local copy fault</button>
  <dialog class="ef-dialog ef-fault-blocking" id="fault-blocking-corrupt-local-copy-dialog" data-ef-intent="blocking" data-ef-severity="critical" data-ef-motion-weight="heavy" aria-labelledby="fault-blocking-corrupt-local-copy-title" aria-describedby="fault-blocking-corrupt-local-copy-message">
    <div class="ef-dialog__body">
      <div class="ef-fault-blocking__heading">
        <div class="ef-fault-blocking__marker" aria-hidden="true">!!</div>
        <div>
          <p class="ef-fault__severity">Critical</p>
          <h2 id="fault-blocking-corrupt-local-copy-title">This project cannot be opened for editing</h2>
        </div>
      </div>
      <p id="fault-blocking-corrupt-local-copy-message">The copy stored on this device does not match the last verified version. Open it read-only, set it aside, or reload the verified version.</p>
      <p class="ef-fault-reference">Reference <code>AG-7P2DX</code></p>
      <details class="ef-fault-details">
        <summary>Safe diagnostic details</summary>
        <div class="ef-fault-details__content">
          <dl class="ef-fault-details__list">
            <div><dt>Project</dt><dd>Harbor renovation</dd></div>
            <div><dt>Last verified</dt><dd><time datetime="2026-09-29T16:12:00Z">29 Sep 2026, 16:12 UTC</time></dd></div>
          </dl>
        </div>
      </details>
    </div>
    <div class="ef-dialog__actions ef-recovery-actions" role="group" aria-label="Recovery actions">
      <button type="button" data-ef-aegis-capability="CanOpenReadOnly">Open read-only</button>
      <button type="button" data-ef-aegis-capability="CanQuarantine">Set aside</button>
      <button type="button" data-ef-aegis-capability="CanReload">Reload</button>
    </div>
  </dialog>
</ef-fault-blocking>`
    },
    {
      id: "mobile-reload",
      title: "Blocking fault on a phone",
      description: "A critical blocking fault opened at phone width, with two recovery actions stacked full width.",
      mobile: {
        height: 560,
        notes: [
          "Below 36rem the dialog is the viewport width minus 1rem and at most the dynamic viewport height minus 1rem, so it never extends under browser toolbars.",
          "The dialog body scrolls internally when the message and details exceed the height; the page behind stays inert.",
          "Recovery buttons stack as full-width rows with a 44px minimum height, in the order Aegis supplied them.",
          "In landscape the height limit shrinks the dialog and the body scrolls; no content moves off screen horizontally."
        ]
      },
      html: `<ef-fault-blocking class="ef-component-tag">
  <button type="button" commandfor="fault-blocking-mobile-reload-dialog" command="show-modal">Preview blocking fault</button>
  <dialog class="ef-dialog ef-fault-blocking" id="fault-blocking-mobile-reload-dialog" data-ef-intent="blocking" data-ef-severity="critical" aria-labelledby="fault-blocking-mobile-reload-title" aria-describedby="fault-blocking-mobile-reload-message">
    <div class="ef-dialog__body">
      <div class="ef-fault-blocking__heading">
        <div class="ef-fault-blocking__marker" aria-hidden="true">!!</div>
        <div>
          <p class="ef-fault__severity">Critical</p>
          <h2 id="fault-blocking-mobile-reload-title">This inspection cannot continue safely</h2>
        </div>
      </div>
      <p id="fault-blocking-mobile-reload-message">The checklist version on this phone is out of date. Reload to get the current version, or open your answers read-only.</p>
      <p class="ef-fault-reference">Reference <code>AG-8C1WF</code></p>
    </div>
    <div class="ef-dialog__actions ef-recovery-actions" role="group" aria-label="Recovery actions">
      <button type="button" data-ef-aegis-capability="CanReload">Reload</button>
      <button type="button" data-ef-aegis-capability="CanOpenReadOnly">Open read-only</button>
    </div>
  </dialog>
</ef-fault-blocking>`
    }
  ],
  api: {
    attributes: [
      { name: "id", on: "dialog", values: "unique id", default: "—", description: "Target for the invoker's commandfor, or for application code that calls showModal()." },
      { name: "commandfor", on: "invoker button", values: "dialog id", default: "—", description: "Preview only: associates a native invoker with the dialog. Applications normally open the dialog from Limen when Aegis intent is Blocking." },
      { name: "command", on: "invoker button", values: "show-modal", default: "—", description: "Opens the dialog modally without script. Never use a non-modal open for a blocking fault." },
      { name: "aria-labelledby", on: "dialog", values: "id of the heading", default: "—", description: "Required. Gives the dialog its accessible name." },
      { name: "aria-describedby", on: "dialog", values: "id of the message", default: "—", description: "Announces the safe message when the dialog opens." },
      { name: "data-ef-severity", on: "dialog", values: "diagnostic | warning | error | critical", default: "—", description: "Records the Aegis severity. The dialog surface is not restyled by it; the visible severity text carries the level." },
      { name: "data-ef-intent", on: "dialog", values: "blocking", default: "—", description: "Records the Aegis intent. Descriptive only." },
      { name: "data-ef-motion-weight", on: "dialog", values: "light | standard | heavy", default: "heavy", description: "Presentation-only perceived mass for the open transition. Heavy is the default for this surface; never map it to severity." },
      { name: "aria-hidden", on: ".ef-fault-blocking__marker", values: "true", default: "—", description: "Hides the decorative marker glyph." },
      { name: "role", on: ".ef-recovery-actions", values: "group", default: "—", description: "Groups the recovery buttons in the dialog footer." },
      { name: "aria-label", on: ".ef-recovery-actions", values: "string", default: "—", description: "Names the recovery group." },
      { name: "type", on: "button", values: "button", default: "—", description: "Required on every button." },
      { name: "data-ef-aegis-capability", on: "recovery button", values: "Aegis capability name", default: "—", description: "Exact Aegis capability identity; revalidated on activation." }
    ],
    hooks: {
      "ef-fault-blocking": "Applied with `ef-dialog` on the native dialog. Widens the dialog to `min(42rem, 100vw - 2rem)` and limits its height to `min(90dvh, 100dvh - 2rem)`.",
      "ef-fault-blocking__heading": "Two-column grid placing the marker beside the severity label and heading.",
      "ef-fault-blocking__marker": "Decorative round marker glyph (for example !!).",
      "data-ef-motion-weight": "Selects the light, standard or heavy physics preset; heavy is the default when the attribute is absent."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "While open modally, focus cycles among the recovery buttons (and any disclosure) inside the dialog; the page behind is inert." },
      { keys: "Enter / Space", action: "Activates the focused recovery button." },
      { keys: "Escape", action: "The browser fires cancel and, by default, closes a modal dialog. When dismissal is not legal the application must handle cancel and keep the dialog open." }
    ],
    events: [
      { name: "cancel", description: "Native dialog event on Escape or another close request. The application decides whether closing is legal and prevents it when it is not." },
      { name: "close", description: "Native dialog event after the dialog closes. Use it to restore focus to a meaningful location." },
      { name: "click", description: "Native click on a recovery button, revalidated and translated into a typed recovery request by the application." }
    ],
    form: "Not a form. Buttons are type=\"button\"; do not use method=\"dialog\" forms to close a blocking fault, because closing must follow a legal state change."
  },
  states: [
    { name: "Closed", how: "no open attribute", description: "Not rendered; only the application's trigger (or nothing) is visible." },
    { name: "Open modally", how: "showModal() or command=\"show-modal\"; [open]", description: "Centered, dimmed and blurred backdrop, background inert, focus inside the dialog." },
    { name: "Cancel requested", how: "native cancel event", description: "The application decides; Forma adds no behavior." },
    { name: "Resolved", how: "application closes the dialog", description: "Closed after a legal transition; the application restores focus." }
  ],
  accessibility: {
    forma: [
      "Uses native dialog semantics, so a modal open provides focus containment, an inert background and the dialog role.",
      "Shows severity as visible text next to a decorative marker.",
      "Keeps recovery buttons native, focus-visible and at least 44px tall; they stack full width on narrow screens.",
      "Keeps the dialog border and marker visible in forced-colors mode and removes spatial motion under reduced motion."
    ],
    consumer: [
      "Open the dialog modally (showModal) when Aegis intent is Blocking and choose initial focus among the legal recovery buttons.",
      "Handle cancel/close requests according to current policy; do not let Escape silently bypass a blocking fault.",
      "Render only current legal recovery actions; never add Continue anyway.",
      "Close only after a legal transition and restore focus to a meaningful place.",
      "Keep diagnostic details, if any, in [[fault-details]] with already-sanitized values."
    ]
  },
  responsive: [
    "Width is `min(42rem, 100vw - 2rem)`; height is capped at `min(90dvh, 100dvh - 2rem)` and the dialog scrolls when content is taller.",
    "Below 36rem the dialog becomes the viewport width minus 1rem and at most `100dvh - 1rem`, centered with auto margins.",
    "Recovery buttons in the footer wrap on wide screens and stack as full-width rows below 36rem.",
    "Headings, messages and references wrap; the marker column keeps its intrinsic width."
  ],
  motion: [
    "Opening uses the shared dialog transition: the surface settles from a 0.75rem offset and 0.985 scale while the backdrop dims and blurs with a mass-independent perceptual fade.",
    "The default perceived weight is heavy because of surface size and commitment, not severity; exit uses the same duration and easing as entry.",
    "Motion never delays focus, the modal state, or recovery actions; the native open state is authoritative.",
    "Under `prefers-reduced-motion: reduce` translate and scale are removed, the backdrop blur is dropped and durations collapse to 0.01ms."
  ],
  guidance: {
    do: [
      "Explain what cannot continue and what each recovery path does.",
      "Keep the reference visible for support.",
      "Order recovery actions as Aegis supplies them, and localize labels without changing capability names."
    ],
    avoid: [
      "Adding a close or cancel button that bypasses the blocking condition.",
      "Opening the dialog non-modally, which removes focus containment.",
      "Using motion weight or color as the only indicator of severity."
    ]
  },
  related: [
    { slug: "dialog", note: "The general native modal dialog; fault-blocking adds the fault vocabulary and Aegis recovery rules." },
    { slug: "fault-banner", note: "For degraded conditions where the user can keep working." },
    { slug: "recovery-actions", note: "The capability-annotated buttons in the dialog footer." },
    { slug: "fault-details", note: "Optional disclosure for approved, sanitized diagnostic values inside the dialog." }
  ]
};
