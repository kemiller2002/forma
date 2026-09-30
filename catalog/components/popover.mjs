export default {
  name: "Popover",
  category: "overlays",
  behavior: "Native HTML",
  summary: "Top-layer supplemental content built on the Popover API, opened by a native button with no script.",
  purpose: {
    description: "A popover shows supplemental content above the page without blocking it: extra detail, a short explanation, a small set of controls. It is an element with the `popover` attribute and `class=\"ef-popover\"`, opened and closed by buttons with `popovertarget`. The browser owns the top layer, open state (`:popover-open`), light dismiss (outside click and Escape for `popover=\"auto\"`), and keyboard order from the invoker into the popover. Forma provides the bordered, shadowed surface, viewport-bounded size with internal scrolling, and light perceived-weight entry and exit. Forma does not position the popover next to its invoker: without application anchor positioning it opens at the block-start, inline-start corner of the viewport.",
    useWhen: [
      "The user asks for more detail or a few extra controls and should be able to keep working with the page.",
      "Content is too long or too interactive for a [[tooltip]] but does not need a modal decision.",
      "A reference panel (shortcuts, legend, field help) should stay available until explicitly closed (`popover=\"manual\"`)."
    ],
    avoidWhen: [
      "The user must decide before continuing: use [[dialog]].",
      "The content is a list of actions: use [[menu]].",
      "The hint is one short sentence attached to a small help button: use [[tooltip]].",
      "The content is essential to complete the task: show it in the page, for example with [[disclosure]] or [[callout]]."
    ],
    characteristics: [
      "Non-modal: the page stays interactive; `popover=\"auto\"` closes on outside click or Escape, `popover=\"manual\"` closes only when told to.",
      "At most `min(30rem, 100vw - 2rem)` wide and `min(80dvh, 100dvh - 2rem)` tall; longer content scrolls inside with contained overscroll.",
      "Placement is not managed by Forma: the surface sits at the viewport's block-start, inline-start corner unless the application positions it.",
      "Light perceived weight by default: a small downward settle and fade on entry, a shorter exit."
    ]
  },
  examples: [
    {
      id: "manual-reference-panel",
      title: "Keyboard shortcuts panel that stays open",
      description: "A reference the user keeps open while working. `popover=\"manual\"` disables light dismiss, so clicking the page or pressing Escape does not close it; the Close button and the invoker (which toggles) do. The popover is named by its heading through aria-labelledby.",
      html: `<ef-popover class="ef-component-tag">
  <button type="button" popovertarget="popover-manual-reference-panel">Keyboard shortcuts</button>
  <div class="ef-popover" id="popover-manual-reference-panel" popover="manual" aria-labelledby="popover-manual-reference-panel-title">
    <h2 id="popover-manual-reference-panel-title">Keyboard shortcuts</h2>
    <dl class="ef-key-value-list">
      <div><dt><kbd>N</kbd></dt><dd>New work item</dd></div>
      <div><dt><kbd>/</kbd></dt><dd>Focus search</dd></div>
      <div><dt><kbd>G</kbd> then <kbd>B</kbd></dt><dd>Go to board</dd></div>
    </dl>
    <button type="button" popovertarget="popover-manual-reference-panel" popovertargetaction="hide">Close shortcuts</button>
  </div>
</ef-popover>`
    },
    {
      id: "long-change-history",
      title: "Long change history that scrolls",
      description: "An auto popover with more content than fits. The surface stops at `min(80dvh, 100dvh - 2rem)` and scrolls internally without scrolling the page. `data-ef-motion-weight=\"standard\"` gives the larger surface a slightly slower settle than the light default.",
      html: `<ef-popover class="ef-component-tag">
  <button type="button" popovertarget="popover-long-change-history">Change history (12)</button>
  <div class="ef-popover" id="popover-long-change-history" popover data-ef-motion-weight="standard" aria-labelledby="popover-long-change-history-title">
    <h2 id="popover-long-change-history-title">Change history</h2>
    <ol>
      <li>30 Sep 14:02 — Priority changed from Medium to High by Dana.</li>
      <li>30 Sep 11:47 — Assigned to Sam by Dana.</li>
      <li>29 Sep 17:20 — Due date set to 4 October.</li>
      <li>29 Sep 16:05 — Label “billing” added.</li>
      <li>29 Sep 09:31 — Description edited by Priya.</li>
      <li>28 Sep 18:12 — Attachment “invoice-q3.pdf” added.</li>
      <li>28 Sep 15:40 — Status changed from New to Open.</li>
      <li>28 Sep 15:39 — Created by Priya from email.</li>
    </ol>
    <button type="button" popovertarget="popover-long-change-history" popovertargetaction="hide">Close history</button>
  </div>
</ef-popover>`
    },
    {
      id: "mobile-field-help",
      title: "Field help on a phone",
      description: "A help popover beside a form field at phone width. The surface is bounded to the viewport minus a small margin and wraps its text.",
      mobile: {
        height: 360,
        notes: [
          "At 44rem and below the surface is at most `100vw - 1rem` wide and `100dvh - 1rem` tall, so it never causes horizontal scrolling at 320px.",
          "Content that does not fit scrolls inside the popover with contained overscroll; the page behind does not scroll.",
          "Tapping outside or pressing the Close button dismisses an auto popover; there is no hover path to depend on.",
          "The surface still opens at the viewport's top-start corner rather than beside the field; on phones this keeps it fully visible, but the application should position it if proximity matters."
        ]
      },
      html: `<ef-popover class="ef-component-tag">
  <div class="ef-field">
    <label class="ef-field__label" for="popover-mobile-field-help-iban">IBAN</label>
    <input id="popover-mobile-field-help-iban" name="iban" type="text" autocomplete="off" aria-describedby="popover-mobile-field-help-hint">
    <p class="ef-field__description" id="popover-mobile-field-help-hint">Up to 34 letters and numbers, starting with a country code.</p>
    <button type="button" popovertarget="popover-mobile-field-help">Where do I find my IBAN?</button>
  </div>
  <div class="ef-popover" id="popover-mobile-field-help" popover aria-labelledby="popover-mobile-field-help-title">
    <h2 id="popover-mobile-field-help-title">Finding your IBAN</h2>
    <p>It is printed on your bank statement and shown in your banking app under account details. It starts with two letters for the country, for example DE or NL.</p>
    <button type="button" popovertarget="popover-mobile-field-help" popovertargetaction="hide">Close help</button>
  </div>
</ef-popover>`
    }
  ],
  api: {
    attributes: [
      { name: "popover", on: "the surface", values: "auto (empty) | manual", default: "auto", description: "Makes the element a popover. `auto` light-dismisses and closes other auto popovers; `manual` stays open until explicitly hidden." },
      { name: "popovertarget", on: "button", values: "id of the popover", default: "—", description: "Connects an invoker button to the popover." },
      { name: "popovertargetaction", on: "button", values: "toggle | show | hide", default: "toggle", description: "What the button does to the popover. Use `hide` on an in-popover Close button." },
      { name: "aria-labelledby", on: "the surface", values: "id of a heading inside", default: "—", description: "Names the popover content from its heading." },
      { name: "data-ef-motion-weight", on: "the surface", values: "light | standard | heavy", default: "light", description: "Presentation-only perceived mass for entry and exit." }
    ],
    hooks: {
      "ef-popover": "The popover surface: border, primary surface, shadow, 1rem padding, viewport-bounded size, internal scrolling with contained overscroll, and the entry/exit transition. Sets `margin: 0` and no anchor, so it sits at the viewport's block-start, inline-start corner.",
      "data-ef-motion-weight": "Presentation-only perceived mass: light (default for popovers), standard or heavy."
    },
    keyboard: [
      { keys: "Enter / Space on the invoker", action: "Toggles the popover. Focus stays on the invoker." },
      { keys: "Tab", action: "From the invoker, moves into the open popover's focusable content next, then back to the page after it (native popover focus order)." },
      { keys: "Escape", action: "Closes an auto popover and returns focus to the invoker if focus was inside. Does nothing for `popover=\"manual\"`." }
    ],
    events: [
      { name: "beforetoggle", description: "Native event before the popover opens or closes; cancelable when opening." },
      { name: "toggle", description: "Native event after the popover opened or closed." }
    ],
    form: "The popover does not participate in forms itself. Controls inside it belong to their form as usual, but an auto popover can be light-dismissed while the user is typing, so avoid unsaved input in auto popovers."
  },
  states: [
    { name: "Hidden", how: "not :popover-open", description: "Not displayed. While closing, it fades and rises slightly before display is removed." },
    { name: "Open", how: ":popover-open", description: "Displayed in the top layer, fully opaque, at rest." },
    { name: "Scrolling", how: "content taller than max-block-size", description: "The surface scrolls internally; the page does not." },
    { name: "Manual", how: "popover=\"manual\"", description: "No light dismiss; closes only via popovertarget buttons (or script)." }
  ],
  accessibility: {
    forma: [
      "Builds on the native Popover API, so open state, light dismiss, Escape and invoker-to-popover focus order come from the browser.",
      "Keeps the surface inside the dynamic viewport with contained internal scrolling.",
      "Keeps a visible border in forced-colors mode and makes transitions effectively instant under reduced motion."
    ],
    consumer: [
      "Give the invoker a label that says what opens, and name the popover with a heading and aria-labelledby.",
      "Include a visible close button for touch and switch users, especially for manual popovers.",
      "Position the popover near its invoker (for example with CSS anchor positioning) when proximity matters; Forma does not.",
      "Do not put required information or the only path to an action in a popover.",
      "If the popover should behave as a dialog or menu for assistive technology, supply that role and behavior in application code."
    ]
  },
  responsive: [
    "Above 44rem: at most `min(30rem, 100vw - 2rem)` wide and `min(80dvh, 100dvh - 2rem)` tall.",
    "At 44rem and below: at most `100vw - 1rem` wide and `100dvh - 1rem` tall.",
    "Text wraps; content beyond the height limit scrolls inside with contained overscroll.",
    "No collision handling or placement fallback is provided for `.ef-popover`."
  ],
  motion: [
    "Entry: opacity fades in by perceptual interpolation while the surface settles from 0.35rem above and 98.5% scale over the light inertial duration with damped easing.",
    "Exit: the reverse over the shorter derived exit duration; `display` and `overlay` are held until the exit finishes so it is visible.",
    "`data-ef-motion-weight` changes perceived mass (light by default). The native `:popover-open` state is authoritative and is never delayed.",
    "Under `prefers-reduced-motion: reduce` the transitions are effectively instant."
  ],
  guidance: {
    do: [
      "Keep popover content short and supplemental, with a heading when it holds more than a sentence.",
      "Use `popover=\"manual\"` for reference panels users keep open while working."
    ],
    avoid: [
      "Opening popovers on hover only.",
      "Nesting dialogs inside popovers.",
      "Relying on the default placement for content that must appear beside its trigger on wide screens."
    ]
  },
  related: [
    { slug: "tooltip", note: "Short hint on a small help button, with anchor placement and hover/focus opening where supported." },
    { slug: "menu", note: "Popover-backed list of actions." },
    { slug: "dialog", note: "Modal surface when the user must respond before continuing." },
    { slug: "disclosure", note: "In-flow expandable content that never overlays the page." }
  ]
};
