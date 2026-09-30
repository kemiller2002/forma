export default {
  name: "Action menu",
  category: "overlays",
  behavior: "Native HTML",
  summary: "A Popover-backed ordinary action list with light physics-derived motion; full ARIA menu behavior remains application-owned.",
  purpose: {
    description: "An action menu reveals a short list of actions from one trigger button, such as the More actions button on a record. It is a `popover` element with `class=\"ef-menu\"` holding an `ef-menu__list` of ordinary buttons and links, opened by a button with `popovertarget`. The browser owns opening, light dismiss (outside click, Escape) and tab order from the trigger into the list. Forma provides the surface, full-width 44px rows with hover feedback, viewport-bounded sizing and light entry and exit motion. This is deliberately not an ARIA `role=\"menu\"`: items are reached with Tab, not arrow keys. Arrow-key roving focus, typeahead, checkable items, submenus and closing after an action are application or Limen behavior.",
    useWhen: [
      "A record, row or card has several secondary actions that would crowd the layout if shown as buttons.",
      "The actions are a mix of commands (buttons) and destinations (links).",
      "A no-script baseline is needed that still opens, closes and is keyboard reachable."
    ],
    avoidWhen: [
      "There are only one or two actions: show them as [[button]]s.",
      "The actions should stay in the page flow and push content down: use [[overflow-command-disclosure]].",
      "The user picks a value (sort order, view): use [[select]] or [[segmented-control]].",
      "The content is explanatory rather than a list of actions: use [[popover]].",
      "Users search many commands by name: use [[command-palette]]."
    ],
    characteristics: [
      "Items are native buttons and links in a list; each fills the menu width and is at least 44px tall.",
      "Minimum width `min(14rem, 100vw - 2rem)`, maximum `min(30rem, 100vw - 2rem)`; long lists scroll inside.",
      "Opening the menu does not move focus; Tab from the trigger enters the list.",
      "Forma does not anchor the menu to its trigger; it opens at the viewport's block-start, inline-start corner unless the application positions it."
    ]
  },
  examples: [
    {
      id: "row-actions-mixed",
      title: "Row actions mixing links and commands",
      description: "Actions for one invoice in a table row. View and Download are links (navigation, so the page change closes the menu); Duplicate and Void are buttons whose effects, and closing the menu afterwards, belong to the application. The trigger names its object so several row menus are distinguishable.",
      html: `<ef-menu class="ef-component-tag">
  <button type="button" popovertarget="menu-row-actions-mixed">Actions for INV-20931</button>
  <div class="ef-menu" id="menu-row-actions-mixed" popover>
    <ul class="ef-menu__list" aria-label="Actions for INV-20931">
      <li><a href="#menu-row-actions-mixed-view">View invoice</a></li>
      <li><a href="#menu-row-actions-mixed-pdf">Download PDF</a></li>
      <li><button type="button">Duplicate invoice</button></li>
      <li><button type="button">Void invoice</button></li>
    </ul>
  </div>
</ef-menu>`
    },
    {
      id: "unavailable-and-long-labels",
      title: "Unavailable action and long labels",
      description: "A standard-weight menu with one natively disabled action and long, translated labels. Labels wrap inside their rows rather than widening the menu past its 30rem limit. The disabled item is skipped by Tab; its label says why it is unavailable because Forma adds no disabled styling to menu items.",
      html: `<ef-menu class="ef-component-tag">
  <button type="button" lang="de" popovertarget="menu-unavailable-and-long-labels">Weitere Aktionen</button>
  <div class="ef-menu" id="menu-unavailable-and-long-labels" lang="de" popover data-ef-motion-weight="standard">
    <ul class="ef-menu__list" aria-label="Weitere Aktionen">
      <li><button type="button">Projekt in einen anderen Arbeitsbereich verschieben</button></li>
      <li><button type="button">Alle Mitglieder über Änderungen benachrichtigen</button></li>
      <li><button type="button" disabled>Projekt archivieren (nur für Eigentümer)</button></li>
    </ul>
  </div>
</ef-menu>`
    },
    {
      id: "mobile-record-menu",
      title: "Record menu on a phone",
      description: "A five-item menu at phone width. The menu is bounded to the viewport and its rows keep full touch targets.",
      mobile: {
        height: 400,
        notes: [
          "At 44rem and below the menu may grow to `100vw - 1rem` wide and `100dvh - 1rem` tall; its minimum width stays `min(14rem, 100vw - 2rem)`.",
          "Each item spans the menu width and is at least 44px tall, so rows are easy to tap.",
          "If the list is taller than the viewport it scrolls inside the menu with contained overscroll.",
          "Tapping outside the menu or pressing Escape closes it; there is no hover-only path.",
          "Without application positioning the menu sits at the top-start corner of the viewport, which keeps it fully on screen at 320px."
        ]
      },
      html: `<ef-menu class="ef-component-tag">
  <button type="button" popovertarget="menu-mobile-record-menu">More actions</button>
  <div class="ef-menu" id="menu-mobile-record-menu" popover>
    <ul class="ef-menu__list" aria-label="More actions">
      <li><button type="button">Edit details</button></li>
      <li><button type="button">Change owner</button></li>
      <li><button type="button">Copy link</button></li>
      <li><a href="#menu-mobile-record-menu-history">View history</a></li>
      <li><button type="button">Delete record</button></li>
    </ul>
  </div>
</ef-menu>`
    }
  ],
  api: {
    attributes: [
      { name: "popover", on: ".ef-menu", values: "auto (empty) | manual", default: "auto", description: "Makes the menu a popover. Keep auto so outside click and Escape close it." },
      { name: "popovertarget", on: "trigger button", values: "id of the menu", default: "—", description: "Connects the trigger to the menu; toggles it." },
      { name: "aria-label", on: ".ef-menu__list", values: "string", default: "—", description: "Optional name for the list, usually the trigger's label." },
      { name: "disabled", on: "item button", values: "boolean", default: "absent", description: "Native disabled command: skipped by Tab and not activatable. No additional styling is applied." },
      { name: "data-ef-motion-weight", on: ".ef-menu", values: "light | standard | heavy", default: "light", description: "Presentation-only perceived mass for entry and exit." }
    ],
    hooks: {
      "ef-menu": "The popover surface for an action list: shares the [[popover]] surface, entry/exit transition and viewport bounds, with a 14rem minimum width and tighter 0.4rem padding.",
      "ef-menu__list": "Unstyled list (no markers or padding) in a grid with a small gap. Its buttons and links become full-width, 44px, borderless, start-aligned rows with a secondary-surface hover.",
      "data-ef-motion-weight": "Presentation-only perceived mass: light (default for menus), standard or heavy."
    },
    keyboard: [
      { keys: "Enter / Space on the trigger", action: "Opens or closes the menu. Focus stays on the trigger." },
      { keys: "Tab / Shift+Tab", action: "From the trigger, moves through the menu items in order, then onward to the page. There is no arrow-key navigation unless the application adds it." },
      { keys: "Enter / Space on an item", action: "Activates the button or follows the link." },
      { keys: "Escape", action: "Closes the menu and returns focus to the trigger if focus was inside." }
    ],
    events: [
      { name: "toggle / beforetoggle", description: "Native popover events on the menu when it opens or closes." },
      { name: "click", description: "Native click on each item. The menu stays open after a button is activated unless the application hides it." }
    ],
    form: "The menu does not participate in forms. Item buttons should be `type=\"button\"`."
  },
  states: [
    { name: "Closed", how: "not :popover-open", description: "Hidden; while closing it fades and lifts slightly before display is removed." },
    { name: "Open", how: ":popover-open", description: "Shown in the top layer over the page, which stays interactive." },
    { name: "Item hover", how: ":hover on an item", description: "Secondary surface behind the row." },
    { name: "Item focus", how: ":focus-visible on an item", description: "Shared two-tone focus ring." },
    { name: "Item disabled", how: "disabled on an item button", description: "Not focusable or activatable; visually unchanged apart from missing hover, so the label must explain." }
  ],
  accessibility: {
    forma: [
      "Uses native popover open/close, light dismiss and trigger-to-content focus order.",
      "Keeps every item a native button or link with a 44px minimum height and full-width hit area.",
      "Keeps the surface within the viewport, with a visible border in forced-colors mode."
    ],
    consumer: [
      "Label the trigger with what the menu is for, including the object for repeated menus.",
      "Do not add `role=\"menu\"`/`menuitem` unless you also implement the full ARIA menu keyboard model in Limen/application code.",
      "Close the menu after a command runs if that is the expected behavior (for example by hiding the popover in application code).",
      "Explain unavailable items in their labels, and confirm destructive actions with a [[dialog]].",
      "Position the menu near its trigger if proximity matters; Forma does not."
    ]
  },
  responsive: [
    "Above 44rem: width between `min(14rem, 100vw - 2rem)` and `min(30rem, 100vw - 2rem)`, height at most `min(80dvh, 100dvh - 2rem)`.",
    "At 44rem and below: may grow to `100vw - 1rem` wide and `100dvh - 1rem` tall.",
    "Item labels wrap inside the row; extra items scroll inside the menu.",
    "No anchor placement, collision handling or bottom-sheet presentation is provided."
  ],
  motion: [
    "Same as [[popover]]: opacity fades by perceptual interpolation while the surface settles from 0.35rem above and 98.5% scale over the light inertial duration; exit uses the shorter derived exit duration and holds display until done.",
    "Item hover is an instant background change (no transition).",
    "`data-ef-motion-weight` changes perceived mass; light is the default. The native open state is authoritative.",
    "Under `prefers-reduced-motion: reduce` the transitions are effectively instant."
  ],
  guidance: {
    do: [
      "Keep menus to about seven items, grouped by frequency, with destructive actions last.",
      "Use verbs plus objects for item labels."
    ],
    avoid: [
      "Hiding the only path to a frequent or critical action in a menu.",
      "Nesting menus inside menus.",
      "Mixing selection state (checkmarks) into an action menu without implementing menu semantics."
    ]
  },
  related: [
    { slug: "popover", note: "General supplemental surface; the menu shares its surface and motion." },
    { slug: "overflow-command-disclosure", note: "In-flow alternative that pushes content down instead of overlaying it." },
    { slug: "command-group", note: "Visible, labelled commands when there is room to show them." },
    { slug: "command-palette", note: "Searchable command list for large command sets." },
    { slug: "select", note: "Use when the user chooses a value rather than runs an action." }
  ]
};
