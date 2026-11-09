export default {
  name: "Ranking",
  category: "assessment",
  behavior: "Application / Limen",
  summary: "Ordered-choice presentation with non-drag movement controls and visible positions.",
  purpose: {
    description: "Ranking shows items in an ordered list with a visible position number and Move up / Move down buttons on each row. Forma supplies the visual contract only: the list, the position badges, 44px move buttons, and a visually hidden live region for announcements. The application (Limen) owns reordering: it moves the item in the DOM, renumbers positions, disables moves that are not possible at the ends, keeps focus on the moved control, and writes an announcement. Drag-and-drop may be layered on, but the buttons must always remain.",
    useWhen: [
      "Users must put every item in a complete order of preference or priority.",
      "The list is short enough to reorder with buttons (typically up to about eight items).",
      "A keyboard- and touch-operable path to reorder is required, with or without drag."
    ],
    avoidWhen: [
      "Only the top and bottom matter: use [[best-worst]].",
      "Items are rated independently: use [[matrix-single]] or [[ordinal-scale]].",
      "Relative weight matters, not just order: use [[allocation]].",
      "The list is long or items move between groups: use [[lane-board]] or an application-specific tool."
    ],
    characteristics: [
      "An ordered list (`ol`), so position is also conveyed by list semantics.",
      "Position badges are `aria-hidden`; each button's name states the item and direction.",
      "Move buttons are native `button type=\"button\"` elements at least 44 by 44px.",
      "The announcement paragraph is visually hidden but remains in the accessibility tree as a polite live region."
    ]
  },
  basicInteraction: { kind: "static", reasons: ["application-behavior"] },
  examples: [
    {
      id: "after-keyboard-move",
      interaction: { kind: "static", reasons: ["application-behavior"] },
      title: "After moving an item up",
      description: "Delivery speed has just been moved to first place with its Move up button. The application renumbered the list, disabled the impossible moves at the ends and wrote the announcement.",
      html: `<forma-ranking class="forma-component-tag">
  <fieldset class="forma-ranking">
    <legend class="forma-ranking__legend">Rank these goals for the next release.</legend>
    <ol class="forma-ranking__list">
      <li class="forma-ranking__item" data-forma-rank="1">
        <span class="forma-ranking__position" aria-hidden="true">1</span>
        <span class="forma-ranking__label">Delivery speed</span>
        <span class="forma-ranking__actions">
          <button type="button" disabled aria-label="Move Delivery speed up">↑</button>
          <button type="button" aria-label="Move Delivery speed down">↓</button>
        </span>
      </li>
      <li class="forma-ranking__item" data-forma-rank="2">
        <span class="forma-ranking__position" aria-hidden="true">2</span>
        <span class="forma-ranking__label">Reliability</span>
        <span class="forma-ranking__actions">
          <button type="button" aria-label="Move Reliability up">↑</button>
          <button type="button" aria-label="Move Reliability down">↓</button>
        </span>
      </li>
      <li class="forma-ranking__item" data-forma-rank="3">
        <span class="forma-ranking__position" aria-hidden="true">3</span>
        <span class="forma-ranking__label">Accessibility fixes</span>
        <span class="forma-ranking__actions">
          <button type="button" aria-label="Move Accessibility fixes up">↑</button>
          <button type="button" aria-label="Move Accessibility fixes down">↓</button>
        </span>
      </li>
      <li class="forma-ranking__item" data-forma-rank="4">
        <span class="forma-ranking__position" aria-hidden="true">4</span>
        <span class="forma-ranking__label">Cost efficiency</span>
        <span class="forma-ranking__actions">
          <button type="button" aria-label="Move Cost efficiency up">↑</button>
          <button type="button" disabled aria-label="Move Cost efficiency down">↓</button>
        </span>
      </li>
    </ol>
    <p class="forma-ranking__announcement" aria-live="polite" aria-atomic="true">Delivery speed moved to position 1 of 4.</p>
  </fieldset>
</forma-ranking>`
    },
    {
      id: "long-labels-heavy",
      interaction: { kind: "static", reasons: ["application-behavior"] },
      title: "Long item labels with heavy motion weight",
      description: "Items with sentence-length labels that wrap within the middle column. Heavy motion weight gives any application-driven settle (via the reorder hooks) a slower, more damped feel; it does not change the order logic.",
      html: `<forma-ranking class="forma-component-tag">
  <fieldset class="forma-ranking" data-forma-motion-weight="heavy" aria-describedby="ranking-long-help">
    <legend class="forma-ranking__legend">Order the risks from most to least urgent.</legend>
    <p class="forma-field__description" id="ranking-long-help">Use the arrow buttons to move a risk. The top item is the most urgent.</p>
    <ol class="forma-ranking__list">
      <li class="forma-ranking__item" data-forma-rank="1">
        <span class="forma-ranking__position" aria-hidden="true">1</span>
        <span class="forma-ranking__label">Customer data exports are not encrypted when written to the shared archive bucket</span>
        <span class="forma-ranking__actions">
          <button type="button" disabled aria-label="Move unencrypted exports up">↑</button>
          <button type="button" aria-label="Move unencrypted exports down">↓</button>
        </span>
      </li>
      <li class="forma-ranking__item" data-forma-rank="2">
        <span class="forma-ranking__position" aria-hidden="true">2</span>
        <span class="forma-ranking__label">The primary database has no tested failover to the secondary region</span>
        <span class="forma-ranking__actions">
          <button type="button" aria-label="Move untested failover up">↑</button>
          <button type="button" disabled aria-label="Move untested failover down">↓</button>
        </span>
      </li>
    </ol>
    <p class="forma-ranking__announcement" aria-live="polite" aria-atomic="true"></p>
  </fieldset>
</forma-ranking>`
    },
    {
      id: "mobile-full-width-controls",
      interaction: { kind: "static", reasons: ["application-behavior"] },
      title: "Ranking on a phone",
      description: "Below 44rem the move buttons drop under the item text and split the row width, giving large touch targets.",
      mobile: {
        height: 520,
        notes: [
          "Each row becomes a two-column grid (position, label); the actions move to their own full-width line beneath.",
          "The two move buttons share that line equally, each at least 44px tall, which suits thumbs better than two small squares.",
          "Labels wrap; the list never scrolls horizontally at 320px.",
          "Reordering remains button-driven; any drag enhancement must not be the only path on touch devices."
        ]
      },
      html: `<forma-ranking class="forma-component-tag">
  <fieldset class="forma-ranking">
    <legend class="forma-ranking__legend">Rank your preferred working hours.</legend>
    <ol class="forma-ranking__list">
      <li class="forma-ranking__item" data-forma-rank="1">
        <span class="forma-ranking__position" aria-hidden="true">1</span>
        <span class="forma-ranking__label">Early (7:00 to 15:00)</span>
        <span class="forma-ranking__actions">
          <button type="button" disabled aria-label="Move Early up">↑</button>
          <button type="button" aria-label="Move Early down">↓</button>
        </span>
      </li>
      <li class="forma-ranking__item" data-forma-rank="2">
        <span class="forma-ranking__position" aria-hidden="true">2</span>
        <span class="forma-ranking__label">Standard (9:00 to 17:00)</span>
        <span class="forma-ranking__actions">
          <button type="button" aria-label="Move Standard up">↑</button>
          <button type="button" aria-label="Move Standard down">↓</button>
        </span>
      </li>
      <li class="forma-ranking__item" data-forma-rank="3">
        <span class="forma-ranking__position" aria-hidden="true">3</span>
        <span class="forma-ranking__label">Late (11:00 to 19:00)</span>
        <span class="forma-ranking__actions">
          <button type="button" aria-label="Move Late up">↑</button>
          <button type="button" disabled aria-label="Move Late down">↓</button>
        </span>
      </li>
    </ol>
    <p class="forma-ranking__announcement" aria-live="polite" aria-atomic="true"></p>
  </fieldset>
</forma-ranking>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "button", values: "button", default: "—", description: "Required so move buttons never submit the surrounding form." },
      { name: "aria-label", on: "button", values: "\"Move <item> up\" / \"Move <item> down\"", default: "—", description: "Required. The arrow glyph is not a name; the label states item and direction." },
      { name: "disabled", on: "button", values: "boolean", default: "absent", description: "Set by the application on Move up for the first item and Move down for the last." },
      { name: "aria-hidden", on: ".forma-ranking__position", values: "true", default: "—", description: "The badge is visual; list semantics and announcements carry position." },
      { name: "aria-live", on: ".forma-ranking__announcement", values: "polite", default: "—", description: "Announces the application's movement messages." },
      { name: "aria-atomic", on: ".forma-ranking__announcement", values: "true", default: "—", description: "Reads the whole message each time it changes." },
      { name: "data-forma-rank", on: ".forma-ranking__item", values: "integer", default: "—", description: "Authoritative position written by the application for its own use. Forma does not style it." },
      { name: "aria-describedby", on: "fieldset", values: "id list", default: "—", description: "Associates instructions with the ranking." }
    ],
    hooks: {
      "forma-ranking": "Root fieldset with browser border and padding removed; also a motion scope for reorder settling.",
      "forma-ranking__legend": "Question text.",
      "forma-ranking__list": "Unstyled ordered list stacking the items with a small gap.",
      "forma-ranking__item": "Bordered row: position, label and actions. At least 3.25rem tall.",
      "forma-ranking__position": "Inverse square badge showing the current position number.",
      "forma-ranking__label": "Item text; wraps anywhere.",
      "forma-ranking__actions": "Container for the move buttons; each button is at least 44 by 44px.",
      "forma-ranking__announcement": "Visually hidden live region for movement messages.",
      "data-forma-motion-weight": "Presentation-only perceived mass (light, standard, heavy) for application-driven settle transitions such as `data-forma-manipulation` on items. Never encodes importance."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the enabled move buttons in order; disabled buttons are skipped." },
      { keys: "Enter / Space", action: "Activates the focused move button (native button behavior). The application performs the move and should keep focus on the moved item's corresponding button." }
    ],
    events: [
      { name: "click", description: "Native click from a move button. Limen handles it to reorder, renumber and announce." }
    ],
    form: "The list does not submit anything natively. The application serialises the order, for example into hidden inputs, or sends it directly."
  },
  states: [
    { name: "Ordered", how: "DOM order plus data-forma-rank", description: "Position badges show 1 to n in list order." },
    { name: "End of list", how: "disabled on the first Move up and last Move down", description: "Impossible moves are disabled and skipped by focus." },
    { name: "Announced", how: "text in .forma-ranking__announcement", description: "Screen readers hear the movement result." },
    { name: "Dragging / drop feedback", how: "data-forma-manipulation and data-forma-drop on items (application-set)", description: "Optional direct-manipulation presentation documented in [[reorder-states]]." }
  ],
  accessibility: {
    forma: [
      "Provides 44px native buttons as the non-drag reorder path.",
      "Places a polite, atomic live region in the structure, visually hidden but announced.",
      "Uses an ordered list so position is conveyed without the badge.",
      "Draws item borders in CanvasText under forced colors."
    ],
    consumer: [
      "Implement the move, renumber badges and data-forma-rank, and disable moves at the ends.",
      "Keep focus on the moved item's button after a move, and write an announcement such as \"Reliability moved to position 2 of 4.\"",
      "Label every button with item and direction.",
      "Never make drag the only way to reorder."
    ]
  },
  responsive: [
    "Wide: `auto minmax(0, 1fr) auto` columns for position, label and actions.",
    "Below 44rem: actions move to a full-width second line and split into two equal buttons.",
    "Labels wrap anywhere; no horizontal overflow."
  ],
  motion: [
    "Items do not animate on their own. When the application sets `data-forma-manipulation` on an item, its translate follows the pointer with no lag while dragging and settles with a damped, non-overshooting transition afterwards; `data-forma-motion-weight` on the ranking sets that settle duration.",
    "Button hover and press use the foundation's perceptual background interpolation.",
    "Under `prefers-reduced-motion: reduce` settle transitions are effectively instant and items appear at their final position."
  ],
  guidance: {
    do: [
      "Start from a neutral or randomised order when order bias matters.",
      "Announce each move with the item and its new position."
    ],
    avoid: [
      "Relying on drag-and-drop only.",
      "Using motion weight to suggest which item matters most."
    ]
  },
  related: [
    { slug: "reorder-states", note: "Direct-manipulation hooks (dragging, drop candidate, rejected) for an optional drag layer." },
    { slug: "best-worst", note: "Captures only the extremes of a set." },
    { slug: "allocation", note: "Captures relative weight as numbers rather than order." }
  ]
};
