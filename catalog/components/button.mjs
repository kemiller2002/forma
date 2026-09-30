export default {
  name: "Button",
  category: "actions",
  behavior: "Native HTML",
  summary: "Native button (or a link styled as one) with a 44px minimum target and perceptual hover/press feedback; .ef-actions groups actions that wrap.",
  owns: ["ef-button", "ef-actions"],
  purpose: {
    description: "Forma styles every native `button` element directly, so an ordinary `<button type=\"button\">` or `<button type=\"submit\">` is already a Forma button. The `ef-button` class gives the same treatment to a link (`<a href>`) when the action is navigation that should look like an action. `ef-actions` is a wrapping flex row for a set of related actions. In the application layer there is exactly one visual style: a bordered, full-weight button. A filled primary style (`data-ef-variant=\"primary\"`) and a dashed unavailable style exist only inside a marketing `.ef-site` shell. The browser owns activation, focus, form submission and disabled state; the application decides what the action does and whether it is currently allowed.",
    useWhen: [
      "The user starts an action: save, submit, cancel, open a dialog, run a command.",
      "A link navigates somewhere but must read as a call to action in a row of actions; use `<a class=\"ef-button\" href>`.",
      "Several related actions sit together and must wrap on narrow screens without overflowing; place them in `ef-actions`."
    ],
    avoidWhen: [
      "The control sets an on/off preference: use [[switch]]. It selects one of several options: use [[segmented-control]] or [[choice-group]].",
      "The action leads to another page and appears in running text: use an ordinary link, not a button-styled one.",
      "Commands need a visible task label or a named group: use [[command-group]]; secondary commands that do not fit belong in [[overflow-command-disclosure]] or a [[menu]].",
      "You need a filled primary, destructive, icon-only or loading variant in an application screen: Forma does not provide those in the application layer. Express priority through order and wording, and report the gap rather than adding local CSS."
    ],
    characteristics: [
      "Every `button` and `.ef-button` has a 2.75rem (44px) minimum block size, a functional border and bold label text.",
      "Hover and press change only the surface color; the hit target never moves or shrinks.",
      "Press feedback starts immediately on pointer or key down and never delays activation.",
      "`ef-actions` wraps its children onto new lines instead of shrinking or overflowing them."
    ]
  },
  examples: [
    {
      id: "unavailable-submit",
      title: "Unavailable submit with a stated reason",
      description: "A natively disabled submit button beside an active Cancel. The disabled button is removed from focus order and cannot submit the form. In the application layer the disabled button looks the same as an enabled one apart from losing hover feedback, so the visible sentence above the actions carries the reason.",
      html: `<ef-button class="ef-component-tag">
  <form class="ef-stack" action="#" method="post">
    <p id="button-unavailable-submit-reason">Publishing is unavailable until the two open review comments are resolved.</p>
    <div class="ef-actions">
      <button type="submit" disabled>Publish release</button>
      <button type="button">Cancel</button>
    </div>
  </form>
</ef-button>`
    },
    {
      id: "icon-with-hidden-label",
      title: "Icon button with a visually hidden label",
      description: "Remove buttons on applied filters. The glyph is decorative (aria-hidden) and the accessible name comes from `ef-visually-hidden` text that names both the action and the object, so each button is distinguishable in a screen-reader button list. Forma has no icon-only variant: the button keeps the standard padding and 44px minimum height.",
      html: `<ef-button class="ef-component-tag">
  <div class="ef-cluster" role="group" aria-label="Applied filters">
    <span class="ef-cluster">
      Owner: Priya Raman
      <button type="button"><span aria-hidden="true">×</span><span class="ef-visually-hidden">Remove filter Owner: Priya Raman</span></button>
    </span>
    <span class="ef-cluster">
      Status: Open
      <button type="button"><span aria-hidden="true">×</span><span class="ef-visually-hidden">Remove filter Status: Open</span></button>
    </span>
  </div>
</ef-button>`
    },
    {
      id: "marketing-primary",
      title: "Marketing call to action",
      description: "Inside a marketing `.ef-site` shell, `data-ef-variant=\"primary\"` fills a link-button with the action tone, and `aria-disabled=\"true\"` gives a dashed, not-allowed treatment. Both hooks only work inside `.ef-site`. An aria-disabled button is still focusable and still fires click, so the application must ignore activation; the reason is linked with aria-describedby because the button stays in the focus order.",
      html: `<ef-button class="ef-component-tag">
  <div class="ef-site">
    <div class="ef-actions">
      <a class="ef-button" data-ef-variant="primary" href="#button-marketing-primary-pricing">See pricing</a>
      <a class="ef-button" href="#button-marketing-primary-docs">Read the documentation</a>
      <button class="ef-button" type="button" aria-disabled="true" aria-describedby="button-marketing-primary-waitlist-note">Join the beta</button>
    </div>
    <p id="button-marketing-primary-waitlist-note">The beta is full. New places open on 1 November.</p>
  </div>
</ef-button>`
    },
    {
      id: "mobile-wrapping-actions",
      title: "Wrapping action row on a phone",
      description: "Three actions with long, translated labels in `ef-actions`. At 320px the row wraps instead of shrinking targets or scrolling sideways, and long labels break inside their button.",
      mobile: {
        height: 280,
        notes: [
          "`ef-actions` is a wrapping flex row: buttons that do not fit move to the next line in source order.",
          "Each button keeps its 44px minimum height; a label longer than the viewport wraps inside the button rather than widening the page.",
          "There are no breakpoints. Source order is the reading, focus and visual order at every width, so put the most likely action first.",
          "Buttons do not stretch to full width automatically; inside a [[dialog]] at narrow widths the dialog action row does that for you."
        ]
      },
      html: `<ef-button class="ef-component-tag">
  <div class="ef-actions">
    <button type="button">Enregistrer les modifications</button>
    <button type="button">Enregistrer comme brouillon</button>
    <a class="ef-button" href="#button-mobile-wrapping-actions-help">Aide</a>
  </div>
</ef-button>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "button", values: "button | submit | reset", default: "submit (inside a form)", description: "Always write it. Omitting it inside a form makes the button submit the form." },
      { name: "disabled", on: "button", values: "boolean", default: "absent", description: "Natively disables the button: not focusable, not activatable, not submitted. In the application layer it only removes hover and press feedback; inside `.ef-site` it also gets the dashed treatment." },
      { name: "href", on: "a.ef-button", values: "URL", default: "—", description: "A link styled as a button. It keeps link semantics: Enter activates it, Space scrolls the page." },
      { name: "aria-disabled", on: "button or a.ef-button inside .ef-site", values: "true", default: "absent", description: "Marks an unavailable action that must stay focusable (for example to expose its reason). It does not block activation; the application must ignore it." },
      { name: "aria-describedby", on: "button", values: "id", default: "—", description: "Links a visible explanation, such as why an aria-disabled action is unavailable." },
      { name: "data-ef-variant", on: "a.ef-button or button.ef-button inside .ef-site", values: "primary", default: "absent (outlined)", description: "Marketing-only filled primary treatment. Has no effect outside a `.ef-site` shell." },
      { name: "aria-hidden", on: "decorative glyph span", values: "true", default: "—", description: "Hides a decorative icon or glyph so the visually hidden text is the whole accessible name." }
    ],
    hooks: {
      "ef-button": "Applies the native button treatment to a non-button element, normally a link. Inside `.ef-site` it becomes the marketing button (inline-flex, tone-aware colors, brand radius).",
      "ef-actions": "Wrapping flex row for related actions with a consistent gap. Global (not limited to `.ef-site`), although it ships in the marketing stylesheet.",
      "data-ef-variant": "Marketing only (`.ef-site .ef-button[data-ef-variant=\"primary\"]`): filled with the action tone background and text, with its own hover tone.",
      "aria-disabled": "Marketing only (`.ef-site .ef-button[aria-disabled=\"true\"]`, also `:disabled`): dashed border, secondary surface and a not-allowed cursor."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus to and from the button. Natively disabled buttons are skipped; aria-disabled ones are not." },
      { keys: "Enter", action: "Activates a button or follows a button-styled link." },
      { keys: "Space", action: "Activates a `button` on key release. On a button-styled link Space scrolls the page, as for any link." }
    ],
    events: [
      { name: "click", description: "Native activation event from pointer, Enter or Space. Forma adds no events." },
      { name: "submit (on the form)", description: "Fired by the form when a `type=\"submit\"` button is activated and the form is valid." }
    ],
    form: "A `type=\"submit\"` button submits its form and contributes its own name=value when it has a name; `type=\"reset\"` restores initial values. Disabled buttons never submit. Links styled with `ef-button` do not participate in forms."
  },
  states: [
    { name: "Rest", how: "default", description: "Primary surface, functional border, bold label, 44px minimum height." },
    { name: "Hover", how: ":hover (not :disabled)", description: "Surface shifts to the secondary surface color by perceptual interpolation." },
    { name: "Pressed", how: ":active (not :disabled)", description: "A darker mix of the secondary surface, applied instantly on press; release fades back." },
    { name: "Focus", how: ":focus-visible", description: "Two-tone focus ring (gap outline plus ring shadow) visible on light and dark surfaces." },
    { name: "Disabled", how: "disabled attribute", description: "Not focusable or activatable. In the application layer the only visual change is the absence of hover and press feedback; inside `.ef-site` the button becomes dashed with a not-allowed cursor." },
    { name: "Marketing primary", how: "data-ef-variant=\"primary\" inside .ef-site", description: "Filled action-tone button for the single most important marketing action." },
    { name: "Marketing unavailable", how: "aria-disabled=\"true\" inside .ef-site", description: "Dashed border and not-allowed cursor while remaining focusable." }
  ],
  accessibility: {
    forma: [
      "Styles the native element, so role, name, focusability and Enter/Space activation come from the platform.",
      "Guarantees a 44px minimum block size for every button and `.ef-button`.",
      "Provides a visible two-tone focus indicator that does not rely on hover styling.",
      "In forced-colors mode buttons keep a CanvasText border (ButtonText for marketing buttons), so the target outline stays visible."
    ],
    consumer: [
      "Write a label that names the action and, where it helps, its object (\"Delete draft\", not \"OK\").",
      "Always set `type`; do not rely on the submit default.",
      "Explain why an action is unavailable in visible text. A disabled application-layer button is visually almost identical to an enabled one.",
      "For icon-only buttons, supply the accessible name in `ef-visually-hidden` text and hide the glyph with aria-hidden.",
      "When using aria-disabled, prevent the action in application code and keep the reason reachable.",
      "Use a link (`a.ef-button`) only for navigation and a `button` only for actions, so assistive technology announces the right role."
    ]
  },
  responsive: [
    "Buttons size to their label with a 44px minimum height; long labels wrap inside the button and never force page overflow (`max-inline-size: 100%`).",
    "`ef-actions` wraps onto multiple lines at any width and keeps source order.",
    "There are no button breakpoints. Inside a [[dialog]] at 44rem and below, action buttons stretch to full width; inside [[verification-frame]] act regions they do the same.",
    "The app-layer `a.ef-button` is not given a block display, so its minimum height does not apply as it would to a real button; prefer `button` for standalone touch targets."
  ],
  motion: [
    "Hover and release are perceptual interpolation of background and border color only (`--ef-motion-perceptual-duration`, about 120ms). Nothing moves, so the hit target is stable under the pointer.",
    "Press onset uses the direct-manipulation duration (0ms): the pressed color appears as soon as the pointer or key goes down and never delays activation.",
    "Under `prefers-reduced-motion: reduce` transitions are shortened to effectively instant; state colors are unchanged. Marketing buttons remove transitions entirely."
  ],
  guidance: {
    do: [
      "Put the most likely action first in `ef-actions`; order is the only priority cue in the application layer.",
      "Keep labels short and specific, and use the same verb as the dialog or page it leads to."
    ],
    avoid: [
      "Adding local CSS for primary, destructive or loading buttons; report the missing variant instead.",
      "Using `data-ef-variant` or aria-disabled styling outside `.ef-site` and expecting it to render.",
      "Relying on a disabled button alone to explain that an action is unavailable.",
      "Styling a `div` or `span` as a button; it loses keyboard activation and role."
    ]
  },
  related: [
    { slug: "command-group", note: "Use when several commands need a visible group label and a shared task context." },
    { slug: "overflow-command-disclosure", note: "Use to move secondary commands out of the main row without shrinking targets." },
    { slug: "menu", note: "Use for a short list of actions revealed from one trigger button." },
    { slug: "mobile-action-bar", note: "Use to keep one or two critical actions reachable at the bottom of a phone screen." },
    { slug: "cta", note: "Use on marketing pages for a titled call-to-action band that contains marketing buttons." }
  ]
};
