export default {
  name: "Mobile action bar",
  category: "actions",
  behavior: "Application / Limen",
  summary: "Safe-area-aware mobile action region that keeps one to three critical contextual actions reachable at the bottom of a narrow screen.",
  purpose: {
    description: "The mobile action bar is a bordered row of native buttons that share the width equally. At 40rem and below it becomes `position: sticky` at the bottom of its scroll container, so the actions stay reachable while a long form or record scrolls, and its bottom padding grows to respect the device safe-area inset. One button can be marked `ef-mobile-action-bar__primary` for an inverse (filled) surface. Forma provides presentation only: which actions appear, whether they are legal, keeping the bar from covering a focused field, and any show/hide behavior are application or Limen concerns.",
    useWhen: [
      "A phone screen has one to three actions that complete or leave the current task (Save, Submit, Cancel) and the content above them is long.",
      "The same actions exist elsewhere on wider layouts, and the bar is the narrow-screen recomposition of them.",
      "You need safe-area-aware bottom placement without writing layout CSS."
    ],
    avoidWhen: [
      "There are more than three actions: keep the critical ones here and move the rest to [[overflow-command-disclosure]] or a [[menu]].",
      "The bar would be the only path to an essential action on wide layouts; the requirement is that it must not be.",
      "The row is navigation between destinations: use [[navigation-shell]] or [[tabs]].",
      "The actions belong to a modal task: put them in the [[dialog]] or [[flyout]] action footer."
    ],
    characteristics: [
      "Children share the row equally (`flex: 1 1 0`), giving large, even targets.",
      "Sticky at the bottom of the scroll container only at 40rem and below; at wider widths it is an ordinary in-flow row.",
      "Bottom padding is `max(0.75rem, env(safe-area-inset-bottom))`, so buttons clear a phone's home indicator.",
      "A translucent surface with a backdrop blur separates the bar from content scrolling underneath."
    ]
  },
  examples: [
    {
      id: "single-primary",
      title: "Single submit action",
      description: "One primary action that fills the bar. The accessible name of the landmark says which task the action belongs to.",
      html: `<ef-mobile-action-bar class="ef-component-tag">
  <nav class="ef-mobile-action-bar" aria-label="Expense claim actions">
    <button type="button" class="ef-mobile-action-bar__primary">Submit claim</button>
  </nav>
</ef-mobile-action-bar>`
    },
    {
      id: "three-actions",
      title: "Three actions with long labels",
      description: "Three equal-width actions: two secondary and one primary. Long labels wrap inside their buttons instead of widening the bar, and every button keeps the 44px minimum height. Order in source is the order users hear and tab through; here the primary comes last.",
      html: `<ef-mobile-action-bar class="ef-component-tag">
  <nav class="ef-mobile-action-bar" aria-label="Incident report actions">
    <button type="button">Discard</button>
    <button type="button">Save as draft</button>
    <button type="button" class="ef-mobile-action-bar__primary">Submit for review</button>
  </nav>
</ef-mobile-action-bar>`
    },
    {
      id: "mobile-sticky-form",
      title: "Sticky under a long form",
      description: "At phone width the bar sticks to the bottom of the viewport while the form above scrolls. It is the last child of the form, so it stops sticking when the end of the form is reached and never overlaps content after it.",
      mobile: {
        height: 420,
        notes: [
          "At 40rem (640px) and below the bar is `position: sticky; inset-block-end: 0` with a z-index above the content, so it stays visible while its container scrolls.",
          "Bottom padding expands to the safe-area inset on devices with a home indicator or rounded corners, in portrait and landscape.",
          "Buttons share the width equally and wrap their labels; there is no horizontal scrolling at 320px.",
          "A sticky bar can cover the field that has focus near the bottom of the viewport. Add bottom scroll padding or margin to the scroll container in the application so focused fields scroll clear of the bar."
        ]
      },
      html: `<ef-mobile-action-bar class="ef-component-tag">
  <form class="ef-stack" action="#" method="post">
    <div class="ef-field">
      <label class="ef-field__label" for="mobile-action-bar-mobile-sticky-form-name">Full name</label>
      <input id="mobile-action-bar-mobile-sticky-form-name" name="name" type="text" autocomplete="name">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="mobile-action-bar-mobile-sticky-form-email">Email</label>
      <input id="mobile-action-bar-mobile-sticky-form-email" name="email" type="email" autocomplete="email">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="mobile-action-bar-mobile-sticky-form-notes">Notes for the reviewer</label>
      <textarea id="mobile-action-bar-mobile-sticky-form-notes" name="notes" rows="6"></textarea>
    </div>
    <nav class="ef-mobile-action-bar" aria-label="Profile form actions">
      <button type="reset">Reset</button>
      <button type="submit" class="ef-mobile-action-bar__primary">Save profile</button>
    </nav>
  </form>
</ef-mobile-action-bar>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "nav.ef-mobile-action-bar", values: "string", default: "—", description: "Names the region after the task (\"Record actions\"), so it is distinguishable from the site navigation landmark." },
      { name: "type", on: "button", values: "button | submit | reset", default: "—", description: "Use submit when the bar is the form's action row, button otherwise." }
    ],
    hooks: {
      "ef-mobile-action-bar": "The bar: a flex row with padding, a functional border, a translucent primary surface and a backdrop blur. Sticky at the bottom at 40rem and below.",
      "ef-mobile-action-bar__primary": "Marks the single most important action with the inverse (filled) surface and inverse text. Other actions need no class; the canonical pattern's `ef-mobile-action-bar__secondary` has no CSS of its own."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the bar's buttons in source order. Sticky positioning does not change focus order." },
      { keys: "Enter / Space", action: "Activates the focused button (native behavior)." }
    ],
    events: [
      { name: "click / submit", description: "Native button activation and, for submit buttons inside a form, the form's submit event. Forma adds no events." }
    ],
    form: "When the bar sits inside a form, its submit and reset buttons act on that form natively. The bar itself submits nothing."
  },
  states: [
    { name: "In flow", how: "viewport wider than 40rem", description: "An ordinary bordered row wherever it appears in the source." },
    { name: "Sticky", how: "@media (max-width: 40rem)", description: "Sticks to the bottom edge of the scroll container while its parent is in view." },
    { name: "Primary action", how: "class ef-mobile-action-bar__primary", description: "Filled inverse surface for the most important action. In forced-colors mode surface tokens become Canvas, so the primary is not visually distinct there; its label must carry the meaning." },
    { name: "Disabled action", how: "disabled attribute on a button", description: "Native disabled button; the application should say why nearby." }
  ],
  accessibility: {
    forma: [
      "Keeps every action a native button with its own role, name and keyboard activation.",
      "Gives buttons equal width and at least the native 44px height, making large touch targets.",
      "Respects the bottom safe-area inset so the home indicator does not overlap the buttons.",
      "Does not reorder the buttons visually; source order is reading and focus order."
    ],
    consumer: [
      "Give the region an accessible name that differs from other landmarks on the page.",
      "Keep the bar from covering a focused field, for example with `scroll-padding-block-end` on the scroll container.",
      "Keep the same actions reachable on wide layouts; the bar is a recomposition, not the only path.",
      "Limit the bar to critical actions and make each label self-explanatory without the filled style."
    ]
  },
  responsive: [
    "Above 40rem the bar is static and sits in normal flow; at 40rem and below it becomes sticky at the bottom with z-index 8.",
    "Sticky positioning is relative to the nearest scroll container and stops at the end of the bar's parent, so place the bar as the last child of the content it serves.",
    "Buttons use `flex: 1 1 0`, so each gets an equal share of the width and long labels wrap inside the button.",
    "The bottom padding uses `env(safe-area-inset-bottom)` in both orientations; it has no effect on devices without an inset."
  ],
  motion: [
    "No animation: the bar does not slide, fade or hide on scroll. Sticky positioning is scroll-driven layout, not motion. Buttons keep the native button hover and press color feedback. Any hide-on-scroll behavior belongs to the application and must respect reduced motion."
  ],
  guidance: {
    do: [
      "Use at most three actions and mark only one as primary.",
      "Place the bar at the end of the form or content it acts on."
    ],
    avoid: [
      "Hiding the same actions elsewhere on desktop so the bar becomes the only way to reach them.",
      "Relying on the filled primary surface to signal which action is safe or recommended; the label must say it.",
      "Putting navigation links or filters in the bar."
    ]
  },
  related: [
    { slug: "button", note: "Use a plain `ef-actions` row when actions do not need to stay pinned on phones." },
    { slug: "command-group", note: "Use for labelled groups of commands in a toolbar or header." },
    { slug: "overflow-command-disclosure", note: "Use for the secondary commands that do not belong in the bar." },
    { slug: "flyout", note: "Use the flyout's own action footer for actions inside a modal side surface." }
  ]
};
