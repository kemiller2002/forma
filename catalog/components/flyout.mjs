export default {
  name: "Flyout",
  category: "overlays",
  behavior: "Native HTML",
  summary: "Left/right edge modal surface built on native dialog semantics with reciprocal physics-derived motion.",
  purpose: {
    description: "A flyout is a full-height modal panel attached to the left or right edge of the viewport, for filters, navigation, record detail or a bounded task that relates to the page underneath. It is a native `dialog` with `class=\"ef-flyout\"` and `data-ef-side=\"left|right\"`, opened with an invoker button (`commandfor` plus `command=\"show-modal\"`). The browser owns the modal behavior: top layer, inert page, focus placement, Escape and focus return. Forma lays out a pinned header with a title and close button, a scrolling body, and a pinned action footer, respects safe-area insets, and slides the panel in from its edge with heavy perceived weight. Swipe-to-close, drag, resizing, bottom sheets and persistent non-modal drawers are application or Limen behavior.",
    useWhen: [
      "Users refine a list with filters and want to return to the same list.",
      "Users inspect or edit a record's detail without leaving the collection they came from.",
      "Navigation or tools must be available on small screens as a temporary side panel."
    ],
    avoidWhen: [
      "A single decision or confirmation is needed: use [[dialog]].",
      "The panel should stay open while the user works with the page: that is a non-modal drawer or [[split-pane]], not a flyout.",
      "The content is a small hint or menu anchored to a button: use [[popover]] or [[menu]].",
      "The navigation should always be visible on wide screens: use [[sidebar]] or [[navigation-shell]]."
    ],
    characteristics: [
      "One component, two sides: `data-ef-side=\"left\"` or `\"right\"`.",
      "Full dynamic-viewport height, `min(28rem, 90vw)` wide, so a strip of the page remains visible as context.",
      "Header and footer stay in place while only the body scrolls, with contained overscroll.",
      "Safe-area insets pad the header top and footer bottom."
    ]
  },
  examples: [
    {
      id: "filters-with-pinned-actions",
      title: "Filters with a long, scrolling body",
      description: "A left flyout holding more filters than fit on screen. The body scrolls on its own while the header (title and close) and the footer (Clear and Show results) stay pinned. The form uses `method=\"dialog\"` so either footer button closes the flyout and the application reads which one was used.",
      html: `<ef-flyout class="ef-component-tag">
  <button type="button" commandfor="flyout-filters-with-pinned-actions" command="show-modal">Filters</button>
  <dialog class="ef-flyout" id="flyout-filters-with-pinned-actions" data-ef-side="left" aria-labelledby="flyout-filters-with-pinned-actions-title">
    <form class="ef-flyout__surface" method="dialog">
      <header class="ef-flyout__header">
        <h2 id="flyout-filters-with-pinned-actions-title">Filter work items</h2>
        <button class="ef-flyout__close" type="button" commandfor="flyout-filters-with-pinned-actions" command="close" aria-label="Close filters">Close</button>
      </header>
      <div class="ef-flyout__body ef-stack">
        <fieldset class="ef-stack" data-density="compact">
          <legend>Status</legend>
          <label class="ef-checkbox">
            <input class="ef-checkbox__input" type="checkbox" name="flyout-filters-status" value="open" checked>
            <span class="ef-checkbox__box" aria-hidden="true"></span>
            <span class="ef-checkbox__text"><span class="ef-checkbox__label">Open</span></span>
          </label>
          <label class="ef-checkbox">
            <input class="ef-checkbox__input" type="checkbox" name="flyout-filters-status" value="blocked">
            <span class="ef-checkbox__box" aria-hidden="true"></span>
            <span class="ef-checkbox__text"><span class="ef-checkbox__label">Blocked</span></span>
          </label>
          <label class="ef-checkbox">
            <input class="ef-checkbox__input" type="checkbox" name="flyout-filters-status" value="done">
            <span class="ef-checkbox__box" aria-hidden="true"></span>
            <span class="ef-checkbox__text"><span class="ef-checkbox__label">Done</span></span>
          </label>
        </fieldset>
        <div class="ef-field">
          <label class="ef-field__label" for="flyout-filters-with-pinned-actions-owner">Owner</label>
          <input id="flyout-filters-with-pinned-actions-owner" name="owner" type="text" autocomplete="off">
        </div>
        <div class="ef-field">
          <label class="ef-field__label" for="flyout-filters-with-pinned-actions-updated">Updated after</label>
          <input id="flyout-filters-with-pinned-actions-updated" name="updated-after" type="date">
        </div>
        <div class="ef-field">
          <label class="ef-field__label" for="flyout-filters-with-pinned-actions-text">Contains text</label>
          <textarea id="flyout-filters-with-pinned-actions-text" name="text" rows="4"></textarea>
        </div>
      </div>
      <footer class="ef-flyout__actions">
        <button type="submit" value="clear">Clear all</button>
        <button type="submit" value="apply">Show results</button>
      </footer>
    </form>
  </dialog>
</ef-flyout>`
    },
    {
      id: "quick-view-light-dismiss",
      title: "Quick view that closes on outside click",
      description: "A right flyout for glancing at recent activity. `closedby=\"any\"` lets a click on the visible strip of page (the backdrop) close it where supported, and the standard motion weight makes it feel lighter than the heavy default. It has no footer, so the body fills the remaining height.",
      html: `<ef-flyout class="ef-component-tag">
  <button type="button" commandfor="flyout-quick-view-light-dismiss" command="show-modal">Recent activity</button>
  <dialog class="ef-flyout" id="flyout-quick-view-light-dismiss" data-ef-side="right" data-ef-motion-weight="standard" closedby="any" aria-labelledby="flyout-quick-view-light-dismiss-title">
    <div class="ef-flyout__surface">
      <header class="ef-flyout__header">
        <div>
          <p class="ef-component-kicker">Last 24 hours</p>
          <h2 id="flyout-quick-view-light-dismiss-title">Recent activity</h2>
        </div>
        <button class="ef-flyout__close" type="button" commandfor="flyout-quick-view-light-dismiss" command="close" aria-label="Close recent activity">Close</button>
      </header>
      <div class="ef-flyout__body">
        <ul>
          <li>Dana moved “Invoice export” to Done.</li>
          <li>Sam commented on “Rate limit alerts”.</li>
          <li>Build 1842 finished with 2 warnings.</li>
        </ul>
      </div>
    </div>
  </dialog>
</ef-flyout>`
    },
    {
      id: "mobile-record-detail",
      title: "Record detail on a phone",
      description: "A right flyout with record details at phone width. It covers 90% of the width, leaving a strip of the page visible as context.",
      mobile: {
        height: 520,
        notes: [
          "Width is `min(28rem, 90vw)`: at 320px the panel is 288px wide and a 32px strip of the dimmed page stays visible on the opposite side.",
          "Height is `100dvh`, so the panel follows the dynamic viewport as mobile browser toolbars show and hide.",
          "The header pads its top by `env(safe-area-inset-top)` and the footer its bottom by `env(safe-area-inset-bottom)`, clearing notches and home indicators in either orientation.",
          "Only the body scrolls; the Close button (44px square minimum) and footer actions stay reachable. Footer actions wrap onto new lines when labels are long.",
          "There is no swipe-to-close; Close, Escape and the footer actions are the close paths."
        ]
      },
      html: `<ef-flyout class="ef-component-tag">
  <button type="button" commandfor="flyout-mobile-record-detail" command="show-modal">View order 58213</button>
  <dialog class="ef-flyout" id="flyout-mobile-record-detail" data-ef-side="right" aria-labelledby="flyout-mobile-record-detail-title" aria-describedby="flyout-mobile-record-detail-summary">
    <div class="ef-flyout__surface">
      <header class="ef-flyout__header">
        <h2 id="flyout-mobile-record-detail-title">Order 58213</h2>
        <button class="ef-flyout__close" type="button" commandfor="flyout-mobile-record-detail" command="close" aria-label="Close order 58213">Close</button>
      </header>
      <div class="ef-flyout__body ef-stack">
        <p id="flyout-mobile-record-detail-summary">Shipped on 28 September. Delivery expected by 2 October.</p>
        <dl class="ef-key-value-list">
          <div><dt>Customer</dt><dd>Harbour Street Cafe</dd></div>
          <div><dt>Items</dt><dd>6</dd></div>
          <div><dt>Total</dt><dd>€418.20</dd></div>
          <div><dt>Carrier</dt><dd>Parcelnet, tracking 00340434161094042557</dd></div>
        </dl>
      </div>
      <footer class="ef-flyout__actions">
        <button type="button" commandfor="flyout-mobile-record-detail" command="close">Done</button>
      </footer>
    </div>
  </dialog>
</ef-flyout>`
    }
  ],
  api: {
    attributes: [
      { name: "commandfor", on: "invoker and close buttons", values: "id of the flyout dialog", default: "—", description: "Connects a button to the flyout." },
      { name: "command", on: "invoker and close buttons", values: "show-modal | close", default: "—", description: "Always open with `show-modal`; a non-modal `show()` is not a supported flyout state." },
      { name: "data-ef-side", on: "dialog", values: "left | right", default: "—", description: "Required. Which viewport edge the panel attaches to and enters from. Without it the panel is not attached to an edge (the browser centers it horizontally) but still slides in from the right." },
      { name: "aria-labelledby", on: "dialog", values: "id of the header title", default: "—", description: "Required. Names the flyout." },
      { name: "aria-describedby", on: "dialog", values: "id", default: "—", description: "Optional short summary announced on open." },
      { name: "aria-label", on: ".ef-flyout__close", values: "string", default: "—", description: "Names the close button with its object (\"Close filters\") so several flyouts are distinguishable." },
      { name: "closedby", on: "dialog", values: "any | closerequest | none", default: "closerequest", description: "`any` adds light dismiss on backdrop click where supported." },
      { name: "method", on: "form.ef-flyout__surface", values: "dialog", default: "—", description: "Lets footer submit buttons close the flyout and report their value." },
      { name: "data-ef-motion-weight", on: "dialog", values: "light | standard | heavy", default: "heavy", description: "Presentation-only perceived mass for the slide." }
    ],
    hooks: {
      "ef-flyout": "The panel dialog: fixed, full dynamic-viewport height, `min(28rem, 90vw)` wide, bordered, shadowed, with contained overscroll and the edge slide transition. Also styles the backdrop.",
      "ef-flyout__surface": "Three-row grid (header, flexible body, footer) filling the panel. May be a `div` or a `form method=\"dialog\"`.",
      "ef-flyout__header": "Pinned top row: title block and close button, spaced apart, with safe-area top padding and a bottom rule.",
      "ef-flyout__close": "Close button kept at least 44 by 44px and never shrunk by a long title.",
      "ef-flyout__body": "The only scrolling region, with contained overscroll and 1rem padding.",
      "ef-flyout__actions": "Pinned footer: wrapping action row aligned to the inline end, with safe-area bottom padding and a top rule.",
      "data-ef-side": "`left` attaches the panel to the inline-start edge and enters from the left (`--ef-flyout-closed-x: -100%`); `right` attaches to the inline-end edge and enters from the right. The attach edge is logical but the travel is physical, so in right-to-left pages the two do not match.",
      "open": "Native open state. `[open]` translates the panel to rest and dims and blurs the backdrop; it also selects spring entry timing.",
      "data-ef-motion-weight": "Presentation-only perceived mass: heavy (default for flyouts), standard or light.",
      "--ef-flyout-closed-x": "Horizontal offset of the panel while closed and at the start of entry. Set by `data-ef-side` (-100% left, 100% right)."
    },
    keyboard: [
      { keys: "Enter / Space on the invoker", action: "Opens the flyout; focus moves to the first focusable element (normally Close) or an autofocus element." },
      { keys: "Tab / Shift+Tab", action: "Cycles through controls inside the flyout; the page behind is inert." },
      { keys: "Escape", action: "Closes the flyout and returns focus to the invoker (native modal dialog)." }
    ],
    events: [
      { name: "cancel / close", description: "Native dialog events on Escape or light dismiss, and after closing. `returnValue` holds the submitting button's value when a `method=\"dialog\"` form closed it." },
      { name: "command", description: "Native event on the dialog when an invoker button targets it." }
    ],
    form: "Controls inside a flyout belong to whatever form contains them. With `form method=\"dialog\"` as the surface, submitting closes the flyout without a request and sets `returnValue`; the application reads the field values."
  },
  states: [
    { name: "Closed", how: "no open attribute", description: "Translated off its edge by `--ef-flyout-closed-x` and not displayed once the exit completes." },
    { name: "Open", how: "[open] via show-modal", description: "At rest against its edge over a dimmed, blurred backdrop; the page is inert." },
    { name: "Left / right", how: "data-ef-side", description: "Chooses the attach edge and the direction of travel." },
    { name: "Body scrolling", how: "content taller than the body row", description: "Only the body scrolls; header and footer stay pinned." }
  ],
  accessibility: {
    forma: [
      "Uses native modal dialog behavior for focus containment, inertness, Escape and focus return.",
      "Keeps the close control at least 44 by 44px and pinned in the header, and footer actions pinned and wrapping.",
      "Pads header and footer for safe-area insets and contains scroll inside the body.",
      "Keeps a visible border in forced-colors mode; removes travel and backdrop blur under reduced motion."
    ],
    consumer: [
      "Name the flyout with a visible heading and aria-labelledby.",
      "Give the close button an accessible name that includes what it closes.",
      "Use `data-ef-side` consistently: the same kind of content should always come from the same edge.",
      "For right-to-left pages, verify the side and travel direction; the travel is physical.",
      "Implement any swipe, drag or resize behavior in Limen/application code, and never make it the only way to close."
    ]
  },
  responsive: [
    "Width is `min(28rem, 90vw)` at every size and height is `100dvh`; there is no breakpoint.",
    "The body is a `minmax(0, 1fr)` row that scrolls; header and footer keep their natural height.",
    "Header title text wraps beside the close button; footer actions wrap onto new rows.",
    "Bottom sheets, full-width phone flyouts and persistent side drawers are not provided."
  ],
  motion: [
    "Entry: the panel slides from its edge (`--ef-flyout-closed-x`) to rest over the heavy inertial duration with spring easing. The backdrop dims and blurs by perceptual interpolation, independent of mass.",
    "Exit: where overlay retention is supported, the panel slides back over the same inertial duration and spring easing as entry without changing its viewport geometry. Otherwise native closing is immediate, avoiding retraction into a containing example or application element.",
    "`data-ef-motion-weight` changes perceived mass; heavy is the default. The native open state is authoritative and focus moves immediately.",
    "Under `prefers-reduced-motion: reduce` the edge translation is removed, the backdrop blur is dropped, and the state change is effectively instant."
  ],
  guidance: {
    do: [
      "Use the left edge for navigation and filters and the right edge for detail and inspection, and keep that convention across the product.",
      "Keep the primary action in the footer so it is always visible."
    ],
    avoid: [
      "Opening a flyout from another flyout.",
      "Putting a multi-step workflow in a flyout; use a page.",
      "Making the flyout full width on phones by overriding the width; the visible strip is context."
    ]
  },
  related: [
    { slug: "dialog", note: "Centered modal for a single decision or short form." },
    { slug: "sidebar", note: "Persistent in-page navigation or context that does not block the page." },
    { slug: "split-pane", note: "Side-by-side list and detail that stay open together." },
    { slug: "popover", note: "Small non-modal surface anchored to a button." },
    { slug: "mobile-action-bar", note: "Pinned page-level actions on phones when no modal surface is needed." }
  ]
};
