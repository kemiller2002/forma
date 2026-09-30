import { missionById } from "../example-data/nasa-spaceflight.mjs";

const apollo13 = missionById("apollo-13");
const sts31 = missionById("sts-31");

export default {
  name: "Dialog",
  category: "overlays",
  behavior: "Native HTML",
  summary: "Modal presentation built on the platform dialog element and declarative invoker commands.",
  purpose: {
    description: "A dialog interrupts the page to ask for a decision or a short, bounded piece of work. Forma's dialog is the native `dialog` element opened as a modal from a button with `commandfor` and `command=\"show-modal\"`, and closed with `command=\"close\"`, a `form method=\"dialog\"` submission, or Escape. The browser owns the top layer, making the rest of the page inert, moving focus into the dialog, Escape handling and returning focus to the invoker. Forma provides the centered surface, the dimmed and blurred backdrop, a padded body, a wrapping action row, a full-width phone layout, and heavy-weight entry and exit motion. What the actions do, and whether they are allowed, is application logic.",
    useWhen: [
      "The user must confirm, choose or supply something before continuing, and the rest of the page should wait.",
      "A consequential or destructive action needs an explicit, labelled confirmation step.",
      "A short form (one to a few fields) belongs to the current context and should not navigate away."
    ],
    avoidWhen: [
      "The content is supplemental and the user can keep working: use [[popover]] or [[disclosure]].",
      "The surface holds filters, navigation or record detail anchored to a screen edge: use [[flyout]].",
      "The task is long or multi-step: use a page or [[wizard]].",
      "You are presenting a blocking Aegis fault: use [[fault-blocking]].",
      "You only need to report an outcome: use [[toast]] or [[alert]]."
    ],
    characteristics: [
      "Native modal behavior: top layer, inert background, focus containment, Escape and focus return.",
      "Opened and closed declaratively by invoker buttons; no script is needed for the baseline.",
      "Width `min(38rem, 100vw - 2rem)` and height capped to the dynamic viewport; long content scrolls inside the dialog.",
      "Heavy perceived weight by default: a short upward settle on entry and a shorter, damped exit."
    ]
  },
  examples: [
    {
      id: "destructive-confirmation",
      title: "Remove a mission from a local comparison",
      description: "The destructive action removes Apollo 13 only from a hypothetical local comparison set, never from the canonical NASA fixture. method=\"dialog\" lets the application inspect which choice closed the dialog.",
      html: `<ef-dialog class="ef-component-tag">
  <button type="button" commandfor="dialog-destructive-confirmation" command="show-modal">Remove ${apollo13.name}…</button>
  <dialog class="ef-dialog" id="dialog-destructive-confirmation" aria-labelledby="dialog-destructive-confirmation-title" aria-describedby="dialog-destructive-confirmation-description">
    <form method="dialog">
      <div class="ef-dialog__body">
        <h2 id="dialog-destructive-confirmation-title">Remove ${apollo13.name} from this comparison?</h2>
        <p id="dialog-destructive-confirmation-description">The NASA reference record remains unchanged. Only this local comparison selection will be removed.</p>
      </div>
      <div class="ef-dialog__actions">
        <button type="submit" value="cancel" autofocus>Keep mission</button>
        <button type="submit" value="remove">Remove from comparison</button>
      </div>
    </form>
  </dialog>
</ef-dialog>`
    },
    {
      id: "light-dismiss-long-content",
      title: "Long mission detail with light dismiss",
      description: "Read-only STS-31 content does not need a decision. closedby=\"any\" allows backdrop dismissal where supported while Escape and Close remain available everywhere.",
      html: `<ef-dialog class="ef-component-tag">
  <button type="button" commandfor="dialog-light-dismiss-long-content" command="show-modal">About ${sts31.name}</button>
  <dialog class="ef-dialog" id="dialog-light-dismiss-long-content" closedby="any" data-ef-motion-weight="standard" aria-labelledby="dialog-light-dismiss-long-content-title">
    <div class="ef-dialog__body">
      <h2 id="dialog-light-dismiss-long-content-title">${sts31.name}</h2>
      <h3>Mission</h3><p>${sts31.highlight}.</p>
      <h3>Spacecraft</h3><p>${sts31.spacecraft}, launched on ${sts31.launchVehicle}.</p>
      <h3>Crew</h3><p>${sts31.crew.join(", ")}.</p>
      <h3>Dates</h3><p>${sts31.launchDate} to ${sts31.returnDate}.</p>
    </div>
    <div class="ef-dialog__actions">
      <button type="button" commandfor="dialog-light-dismiss-long-content" command="close">Close</button>
    </div>
  </dialog>
</ef-dialog>`
    },
    {
      id: "mobile-short-form",
      title: "Mission-note form on a phone",
      description: "A one-field local note dialog at phone width. The dialog fills the width minus a small margin and its actions stretch to full-width rows.",
      mobile: {
        height: 420,
        notes: [
          "The dialog is constrained to the dynamic mobile viewport.",
          "Body padding reduces and each action becomes a full-width touch row.",
          "Content taller than the viewport scrolls inside the dialog.",
          "Keep fields near the top so the on-screen keyboard does not hide context."
        ]
      },
      html: `<ef-dialog class="ef-component-tag">
  <button type="button" commandfor="dialog-mobile-short-form" command="show-modal">Add note to ${apollo13.name}</button>
  <dialog class="ef-dialog" id="dialog-mobile-short-form" aria-labelledby="dialog-mobile-short-form-title">
    <form method="dialog">
      <div class="ef-dialog__body">
        <h2 id="dialog-mobile-short-form-title">Add local note to ${apollo13.name}</h2>
        <div class="ef-field">
          <label class="ef-field__label" for="dialog-mobile-short-form-note">Note</label>
          <input id="dialog-mobile-short-form-note" name="mission-note" type="text" value="Compare crew and mission outcome" required>
        </div>
      </div>
      <div class="ef-dialog__actions">
        <button type="submit" value="cancel" formnovalidate>Cancel</button>
        <button type="submit" value="save">Save note</button>
      </div>
    </form>
  </dialog>
</ef-dialog>`
    }
  ],
  api: {
    attributes: [
      { name: "commandfor", on: "invoker button", values: "id of the dialog", default: "—", description: "Connects a button to the dialog it controls. Works without script in browsers with invoker commands." },
      { name: "command", on: "invoker button", values: "show-modal | close | request-close", default: "—", description: "`show-modal` opens the dialog as a modal; `close` closes it. Forma's pattern uses these instead of script." },
      { name: "aria-labelledby", on: "dialog", values: "id of the dialog heading", default: "—", description: "Required. Names the dialog from its visible title." },
      { name: "aria-describedby", on: "dialog", values: "id", default: "—", description: "Links the key explanatory sentence so it is announced on open. Keep it short." },
      { name: "closedby", on: "dialog", values: "any | closerequest | none", default: "closerequest for modals", description: "Which user actions close the dialog. `any` adds backdrop click (light dismiss) where supported." },
      { name: "method", on: "form inside the dialog", values: "dialog", default: "—", description: "Submitting closes the dialog and sets `returnValue` to the submitter's value, without a network request." },
      { name: "autofocus", on: "a control inside the dialog", values: "boolean", default: "absent", description: "Chooses which element receives focus when the dialog opens; otherwise the first focusable element does." },
      { name: "data-ef-motion-weight", on: "dialog", values: "light | standard | heavy", default: "heavy", description: "Presentation-only perceived mass for entry and exit." }
    ],
    hooks: {
      "ef-dialog": "The dialog surface: border, primary surface, shadow, width `min(38rem, 100vw - 2rem)`, viewport-capped height and contained overscroll. Also styles the backdrop.",
      "ef-dialog__body": "Padded content region (1.5rem, 1rem at 44rem and below).",
      "ef-dialog__actions": "Wrapping action row aligned to the inline end with a top rule; at 44rem and below its buttons stretch to full width.",
      "open": "Native open state, set by the browser. `[open]` switches the surface to its resting position and the backdrop to its dimmed, blurred state, and selects the entry (spring) timing.",
      "data-ef-motion-weight": "Presentation-only perceived mass: heavy (default for dialogs), standard or light. Never encodes severity or destructiveness."
    },
    keyboard: [
      { keys: "Enter / Space on the invoker", action: "Opens the dialog; focus moves to the autofocus element or the first focusable element inside." },
      { keys: "Tab / Shift+Tab", action: "Moves among focusable elements in the dialog; the page behind is inert and cannot receive focus." },
      { keys: "Escape", action: "Closes the dialog (fires cancel, then close) unless `closedby=\"none\"`." },
      { keys: "Enter in a field", action: "Submits a `method=\"dialog\"` form with its default (first) submit button, closing the dialog." }
    ],
    events: [
      { name: "command", description: "Native event fired on the dialog when an invoker button targets it." },
      { name: "cancel", description: "Native event fired when the user asks to close (Escape or light dismiss); cancelable." },
      { name: "close", description: "Native event fired after the dialog closes. Read `returnValue` to find which form button closed it." }
    ],
    form: "A `form method=\"dialog\"` inside the dialog closes it on submission and records the submitter's value in `dialog.returnValue`; field values are not sent anywhere. Use `formnovalidate` on a cancel button so required fields do not block cancelling."
  },
  states: [
    { name: "Closed", how: "no open attribute", description: "Not rendered. While closing, the surface travels down slightly and the backdrop fades before display is removed." },
    { name: "Open (modal)", how: "[open] via show-modal", description: "Centered in the top layer over a dimmed, blurred backdrop; the rest of the page is inert." },
    { name: "Scrolling content", how: "content taller than max-block-size", description: "The dialog scrolls internally with contained overscroll. Actions scroll with the content; they are not pinned." },
    { name: "Phone layout", how: "@media (max-width: 44rem)", description: "Near full-width surface, reduced padding and full-width action buttons." }
  ],
  accessibility: {
    forma: [
      "Builds on native modal dialog behavior for focus containment, inertness, Escape and focus restoration.",
      "Keeps the surface within the dynamic viewport and contains overscroll so the page does not scroll behind it.",
      "Keeps a visible border in forced-colors mode and removes the backdrop blur and spatial travel under reduced motion."
    ],
    consumer: [
      "Always name the dialog with aria-labelledby pointing at a visible heading.",
      "Put initial focus on the safest control for destructive confirmations (autofocus).",
      "Write action labels that say what happens (\"Delete project\", \"Keep project\"), not \"OK\"/\"Cancel\" alone.",
      "Provide a visible close or cancel control; do not rely on Escape or backdrop clicks alone.",
      "Act on the result (returnValue or click) in application code and re-check legality at that moment."
    ]
  },
  responsive: [
    "Above 44rem: `min(38rem, 100vw - 2rem)` wide, at most `100dvh - 2rem` tall, centered by the browser.",
    "At 44rem and below: `100vw - 1rem` wide, `100dvh - 1rem` tall at most, 1rem body padding, full-width action buttons.",
    "Long content scrolls inside the dialog; long titles and labels wrap.",
    "A true full-screen mobile mode and pinned (sticky) action rows are not provided."
  ],
  motion: [
    "Entry: the surface rises from 0.75rem below and scales from 98.5% to rest over the heavy inertial duration with spring easing; the backdrop dims and blurs by perceptual interpolation, independent of mass.",
    "Exit: the same path reversed over the shorter derived exit duration with damped easing, and the backdrop fades; `display` and `overlay` are held until the exit finishes.",
    "`data-ef-motion-weight` changes perceived mass (heavy is the default). The native open state is always authoritative; motion never delays focus or inertness.",
    "Under `prefers-reduced-motion: reduce` the travel and scale are removed, the backdrop blur is dropped, and remaining transitions are effectively instant."
  ],
  guidance: {
    do: [
      "Keep one decision per dialog and a title that states it.",
      "Place the dismissive action first and the committing action last in the actions row, consistently across the product."
    ],
    avoid: [
      "Opening a dialog on page load or without a user action.",
      "Stacking dialogs on top of dialogs.",
      "Using heavy motion weight or a special style to imply that an action is dangerous; say so in words."
    ]
  },
  related: [
    { slug: "flyout", note: "Edge-attached modal dialog for filters, navigation or record detail." },
    { slug: "popover", note: "Non-modal supplemental content that does not block the page." },
    { slug: "fault-blocking", note: "Blocking presentation for Aegis faults, with application-owned recovery." },
    { slug: "button", note: "Styles the invoker and the action buttons." },
    { slug: "toast", note: "Reports an outcome without asking for a decision." }
  ]
};
