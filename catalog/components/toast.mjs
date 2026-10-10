export default {
  name: "Toast",
  category: "feedback",
  behavior: "Native HTML",
  summary: "A Popover-backed transient notification with standard perceived weight and reciprocal dismissal.",
  purpose: {
    description: "A toast is a short notification that floats above the page in the inline-end, block-end corner and does not displace layout. Forma builds it on the native Popover API: an `aside` with `popover=\"manual\"` is shown and hidden by the browser, from `popovertarget` invokers or from the application calling the native popover methods. Forma supplies the placement, surface and entry/exit motion. Timing, queuing and automatic dismissal are not part of Forma; an application that wants them implements them.",
    useWhen: [
      "Confirming that a background action succeeded (saved, copied, exported) where no further reading is required.",
      "Offering a brief, optional follow-up such as Undo or Open next to a confirmation.",
      "The message should not shift content or take permanent space in the layout."
    ],
    avoidWhen: [
      "The message reports a failure, a blocked action or an unknown outcome the user must deal with: use [[alert]] or [[operation-status]] in the page.",
      "The user must decide before continuing: use [[dialog]].",
      "The content is contextual help attached to a control: use [[popover]] or [[tooltip]].",
      "Several notifications can appear at once: Forma toasts share one fixed position and would overlap, so consolidate them first."
    ],
    characteristics: [
      "`popover=\"manual\"` means no light dismiss: clicking elsewhere or pressing Escape does not close it. It stays until a hide invoker or the application hides it.",
      "It renders in the top layer, so it is never clipped by overflow or covered by page content.",
      "Exit shares the same duration and easing as entry."
    ]
  },
  examples: [
    {
      id: "undo-archive",
      title: "Undo after archiving",
      description: "A confirmation with a recovery action. The Undo button is a normal button the application wires up; the Close button is a native hide invoker. Both sit in the header row beside the text.",
      html: `<ef-toast class="ef-component-tag">
  <button type="button" popovertarget="toast-undo-archive-notice" popovertargetaction="show">Archive 3 threads</button>
  <aside class="ef-toast" id="toast-undo-archive-notice" popover="manual" role="status" aria-labelledby="toast-undo-archive-title">
    <div class="ef-toast__header">
      <div>
        <h3 class="ef-toast__title" id="toast-undo-archive-title">3 threads archived</h3>
        <p>They are still searchable under Archive.</p>
      </div>
      <div class="ef-cluster">
        <button type="button">Undo</button>
        <button type="button" popovertarget="toast-undo-archive-notice" popovertargetaction="hide" aria-label="Dismiss archive notification">Close</button>
      </div>
    </div>
  </aside>
</ef-toast>`
    },
    {
      id: "export-ready",
      title: "Export ready with a link",
      description: "A toggle invoker (no `popovertargetaction`) that shows and hides the same toast, and a download link inside the notification. The link is the useful content; the toast only draws attention to it.",
      html: `<ef-toast class="ef-component-tag">
  <button type="button" popovertarget="toast-export-ready-notice">Toggle export notice</button>
  <aside class="ef-toast" id="toast-export-ready-notice" popover="manual" role="status" aria-labelledby="toast-export-ready-title">
    <div class="ef-toast__header">
      <div>
        <h3 class="ef-toast__title" id="toast-export-ready-title">Audit export is ready</h3>
        <p><a href="#toast-export-ready-notice">audit-2026-09.csv</a> (1,000 records)</p>
      </div>
      <button type="button" popovertarget="toast-export-ready-notice" popovertargetaction="hide" aria-label="Dismiss export notification">Close</button>
    </div>
  </aside>
</ef-toast>`
    },
    {
      id: "light-copy-confirmation",
      title: "Lightweight copy confirmation",
      description: "A single-line confirmation with no body paragraph, using the light weight for a quicker, less settled entry. Weight is presentation only and says nothing about importance.",
      html: `<ef-toast class="ef-component-tag">
  <button type="button" popovertarget="toast-light-copy-notice" popovertargetaction="show">Copy share link</button>
  <aside class="ef-toast" id="toast-light-copy-notice" popover="manual" role="status" data-ef-motion-weight="light" aria-labelledby="toast-light-copy-title">
    <div class="ef-toast__header">
      <h3 class="ef-toast__title" id="toast-light-copy-title">Link copied</h3>
      <button type="button" popovertarget="toast-light-copy-notice" popovertargetaction="hide" aria-label="Dismiss copy notification">Close</button>
    </div>
  </aside>
</ef-toast>`
    },
    {
      id: "mobile-saved-draft",
      title: "Mobile draft saved",
      description: "A toast opened on a phone. It stays anchored to the bottom corner, clears the device safe areas and never exceeds the viewport width minus 2rem.",
      mobile: {
        height: 380,
        notes: [
          "The toast width is capped at `min(26rem, 100vw - 2rem)`, so at 320px it fills the width with a 1rem margin on each side.",
          "Its offset from the bottom and side respects `env(safe-area-inset-*)`, keeping it clear of home indicators and rounded corners.",
          "Long titles wrap inside the header while the Close button keeps its size as a native 44px-tall touch target.",
          "It is fixed to the viewport, so it stays in place while the page scrolls and when the device rotates; it can cover content near the bottom edge until dismissed."
        ]
      },
      html: `<ef-toast class="ef-component-tag">
  <button type="button" popovertarget="toast-mobile-saved-notice" popovertargetaction="show">Save draft</button>
  <aside class="ef-toast" id="toast-mobile-saved-notice" popover="manual" role="status" aria-labelledby="toast-mobile-saved-title">
    <div class="ef-toast__header">
      <div>
        <h3 class="ef-toast__title" id="toast-mobile-saved-title">Draft saved to this device and your account</h3>
        <p>You can continue on another device.</p>
      </div>
      <button type="button" popovertarget="toast-mobile-saved-notice" popovertargetaction="hide" aria-label="Dismiss save notification">Close</button>
    </div>
  </aside>
</ef-toast>`
    }
  ],
  api: {
    attributes: [
      { name: "popover", on: "aside.ef-toast", values: "manual", default: "—", description: "Required. Makes the toast a native manual popover: hidden by default, shown in the top layer, and never light-dismissed." },
      { name: "id", on: "aside.ef-toast", values: "unique id", default: "—", description: "Target for invoker buttons." },
      { name: "popovertarget", on: "button", values: "id of the toast", default: "—", description: "Native invoker. Shows, hides or toggles the toast without script." },
      { name: "popovertargetaction", on: "button", values: "show | hide | toggle", default: "toggle", description: "What the invoker does. Use hide on the Close button inside the toast." },
      { name: "role", on: "aside.ef-toast", values: "status", default: "—", description: "Polite live-region semantics for the notification text." },
      { name: "aria-labelledby", on: "aside.ef-toast", values: "id of .ef-toast__title", default: "—", description: "Names the notification by its title." },
      { name: "aria-label", on: "close button", values: "string", default: "—", description: "Gives the Close button a name that says what it dismisses." }
    ],
    hooks: {
      "ef-toast": "The popover surface: fixed to the inline-end/block-end corner, bordered, shadowed, with an accent inline-start border.",
      "ef-toast__header": "Flex row that places the text block and the dismiss control side by side.",
      "ef-toast__title": "Notification title with margins removed.",
      "data-ef-motion-weight": "Presentation-only perceived mass for entry and exit: light, standard (default) or heavy. Never encodes severity or importance."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Reaches the invoker and, while the toast is open, the controls inside it. Browsers place an open popover's contents after its invoker in sequential focus order." },
      { keys: "Enter / Space", action: "Activates an invoker or the Close button, showing or hiding the toast natively." },
      { keys: "Escape", action: "Does nothing for a manual popover. If Escape dismissal is wanted, the application must implement it." }
    ],
    events: [
      { name: "beforetoggle / toggle", description: "Native popover events fired on the toast when it opens or closes. Use them in application code to track visibility or schedule an automatic hide." }
    ],
    form: "Not a form control. Buttons inside a toast should use `type=\"button\"`."
  },
  states: [
    { name: "Hidden", how: "default for popover=\"manual\"", description: "Not rendered (display none), transparent and offset 0.65rem downward." },
    { name: "Open", how: ":popover-open", description: "Opaque at its resting position in the top layer." },
    { name: "Entering", how: "@starting-style on :popover-open", description: "Rises 0.65rem, fades in and scales from 0.99 to 1 over the inertia duration." },
    { name: "Exiting", how: "leaving :popover-open", description: "Reverses with the same inertial duration; display and overlay stay until the exit finishes." }
  ],
  accessibility: {
    forma: [
      "Uses native Popover API state, so open and closed are browser-authoritative and the toast is in the top layer.",
      "Provides a structural accent border and shadow, and in forced colors maps the border to `CanvasText`.",
      "Keeps dismissal on a real button with a visible label."
    ],
    consumer: [
      "Do not auto-dismiss toasts that contain actions or information the user needs; people using magnification or screen readers may not reach them in time.",
      "Keep essential outcomes available elsewhere in the page as well, because announcement of a status region that just became visible varies across browsers and screen readers.",
      "Give each Close button an accessible name that says what it dismisses.",
      "Show at most one toast at a time; Forma does not stack or queue them."
    ]
  },
  responsive: [
    "Fixed to the viewport corner with a 1rem inset that grows to the device safe-area inset when larger.",
    "Width is intrinsic up to `min(26rem, 100vw - 2rem)`, so it never overflows a phone screen.",
    "The header is a flex row; the text block wraps and the dismiss control stays at the end.",
    "The corner uses physical right and bottom offsets, so it stays on the right in right-to-left documents too."
  ],
  motion: [
    "Entry uses the standard weight by default: opacity fades by perceptual interpolation (about 120ms) while position and scale settle over the inertia duration (about 215ms).",
    "Exit shares the entry response (about 214ms at standard), including its damped easing.",
    "`display` and `overlay` transition with `allow-discrete`, so the toast stays in the top layer until its exit completes; the popover state itself changes immediately.",
    "`data-ef-motion-weight` light shortens and heavy lengthens the spatial motion. Opacity timing is independent of weight.",
    "Under `prefers-reduced-motion: reduce` every transition is effectively instant; the toast appears and disappears in place."
  ],
  guidance: {
    do: [
      "Keep the title to a short confirmation of what happened.",
      "Always include a Close button with `popovertargetaction=\"hide\"`.",
      "Pair destructive actions with Undo in the toast and keep the underlying record recoverable for a reasonable time."
    ],
    avoid: [
      "Reporting errors or uncertain outcomes only in a toast.",
      "Using `popover=\"auto\"`, which would close any other open auto popover and light-dismiss on outside clicks.",
      "Placing long forms or multi-step content in a toast."
    ]
  },
  related: [
    { slug: "alert", note: "In-page, persistent status that stays until the situation changes." },
    { slug: "popover", note: "Anchored, light-dismissable contextual content opened by the user." },
    { slug: "fault-notification", note: "Notifies about a system fault with fault-specific structure." },
    { slug: "dialog", note: "Modal decision the user must answer before continuing." }
  ]
};
