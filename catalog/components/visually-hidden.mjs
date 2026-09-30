export default {
  name: "Visually hidden",
  category: "utilities",
  behavior: "Native CSS",
  summary: "Keeps text available to assistive technology while removing it from the visual layout.",
  owns: ["ef-visually-hidden","ef-sr-only"],
  purpose: {
    description: "Visually hidden text is read by screen readers and used in accessible names, but takes no space on screen. Use it when the visual design already makes something clear to sighted users (an × icon on a filter chip, a column of Edit buttons beside their rows) and the same information must reach people who do not see it. Forma ships two equivalent utilities. `ef-visually-hidden` is the general utility, declared with `!important` so component rules cannot accidentally reveal it; it uses the legacy `clip: rect(0 0 0 0)`. `ef-sr-only` comes from the assessment layer and adds the modern `clip-path: inset(50%)` without `!important`, so a more specific rule can override it. Both keep the element in the accessibility tree; neither hides anything from assistive technology.",
    useWhen: [
      "An icon-only or symbol-only control needs a text name: \"Remove filter: Region is Europe\".",
      "Repeated visible labels (Edit, Open) need context for screen reader users: \"Edit invoice INV-1042\".",
      "A form field's purpose is clear visually (a search box beside a Search button) but it still needs a real `label`.",
      "Table captions or column headers that are obvious visually but needed for navigation."
    ],
    avoidWhen: [
      "Content that should be hidden from everyone: use the `hidden` attribute or remove it.",
      "Decorative content that should be hidden from assistive technology: use `aria-hidden=\"true\"`.",
      "Focusable elements such as links and buttons: neither class reveals on focus, so a sighted keyboard user would focus something invisible. Use [[skip-link]] for skip links.",
      "Instructions sighted users also need; show them as visible text, for example in a [[text-field]] hint."
    ],
    characteristics: [
      "The element is taken out of flow (`position: absolute`) and shrunk to a clipped 1px box, so it adds no space and cannot be seen.",
      "`white-space: nowrap` keeps words separated as they are announced.",
      "Choose `ef-visually-hidden` for application markup; `ef-sr-only` is used by the assessment patterns and when a later rule must be able to reveal the text."
    ]
  },
  examples: [
    {
      id: "row-action-context",
      title: "Repeated actions with context",
      description: "Each row has a visible Edit button. The hidden suffix makes every accessible name unique (\"Edit invoice INV-1042\"), so a screen reader's list of buttons is usable.",
      html: `<ef-visually-hidden class="ef-component-tag">
  <ul class="ef-stack" data-density="compact" aria-label="Draft invoices">
    <li class="ef-cluster">
      <span>INV-1042, Acme Manufacturing</span>
      <button type="button">Edit<span class="ef-visually-hidden"> invoice INV-1042</span></button>
    </li>
    <li class="ef-cluster">
      <span>INV-1043, Northstar Labs</span>
      <button type="button">Edit<span class="ef-visually-hidden"> invoice INV-1043</span></button>
    </li>
  </ul>
</ef-visually-hidden>`
    },
    {
      id: "search-label",
      title: "Search field with a hidden label",
      description: "The Search button makes the field's purpose obvious on screen, but the input still needs a real `label`. The label is visually hidden and remains the input's accessible name; the placeholder is only an example query.",
      html: `<ef-visually-hidden class="ef-component-tag">
  <form class="ef-cluster" role="search" aria-label="Customers">
    <label class="ef-visually-hidden" for="visually-hidden-search-label-query">Search customers</label>
    <input id="visually-hidden-search-label-query" name="q" type="search" placeholder="e.g. Northstar" autocomplete="off">
    <button type="submit">Search</button>
  </form>
</ef-visually-hidden>`
    },
    {
      id: "symbol-meaning",
      title: "Trend symbols explained",
      description: "Arrow glyphs are decorative and hidden with `aria-hidden`; `ef-sr-only` text states the direction in words. This is the form used by assessment and metric patterns.",
      html: `<ef-visually-hidden class="ef-component-tag">
  <dl class="ef-stack" data-density="compact">
    <div>
      <dt>Open incidents</dt>
      <dd><span aria-hidden="true">▲</span><span class="ef-sr-only">Increased to</span> 14</dd>
    </div>
    <div>
      <dt>Median response time</dt>
      <dd><span aria-hidden="true">▼</span><span class="ef-sr-only">Decreased to</span> 38 minutes</dd>
    </div>
  </dl>
</ef-visually-hidden>`
    },
    {
      id: "mobile-icon-toolbar",
      title: "Icon toolbar on a phone",
      description: "A compact toolbar of symbol buttons for a narrow screen. Each glyph is `aria-hidden` and each button is named by visually hidden text.",
      mobile: {
        height: 200,
        notes: [
          "Hidden text takes no space, so icon buttons stay compact and the cluster wraps only when the buttons themselves no longer fit.",
          "Buttons keep Forma's 44px minimum target even though their visible content is a single glyph.",
          "Hidden text never causes horizontal overflow: it is clipped to 1px and taken out of flow at every width.",
          "Voice control users say the hidden name (\"Tap Archive message\"); keep it close to what the icon suggests."
        ]
      },
      html: `<ef-visually-hidden class="ef-component-tag">
  <div class="ef-cluster" role="toolbar" aria-label="Message actions">
    <button type="button"><span aria-hidden="true">↩</span><span class="ef-visually-hidden">Reply</span></button>
    <button type="button"><span aria-hidden="true">⇥</span><span class="ef-visually-hidden">Forward</span></button>
    <button type="button"><span aria-hidden="true">▣</span><span class="ef-visually-hidden">Archive message</span></button>
    <button type="button"><span aria-hidden="true">×</span><span class="ef-visually-hidden">Delete message</span></button>
  </div>
</ef-visually-hidden>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-hidden", on: "decorative glyph beside the hidden text", values: "true", default: "—", description: "Hides the visible symbol from assistive technology so it is not announced alongside the hidden text." },
      { name: "for", on: "label.ef-visually-hidden", values: "id of the field", default: "—", description: "A visually hidden label still labels its field and is still the click target's name." }
    ],
    hooks: {
      "ef-visually-hidden": "General utility: absolute position, 1px box, -1px margin, no padding or border, `overflow: hidden`, `clip: rect(0 0 0 0)`, `white-space: nowrap`, all `!important`.",
      "ef-sr-only": "Assessment-layer utility with the same box plus `clip-path: inset(50%)`, declared without `!important`, so a more specific rule can reveal it."
    },
    keyboard: [
      { keys: "None", action: "The utilities add no keyboard behavior. Hidden text inside a button or label contributes to that control's name; do not put the class on a focusable element." }
    ],
    events: [],
    form: "No form behavior. A visually hidden `label` still labels its control."
  },
  states: [
    { name: "Hidden", how: "class=\"ef-visually-hidden\" or class=\"ef-sr-only\"", description: "Clipped to a 1px, out-of-flow box; present in the accessibility tree." }
  ],
  accessibility: {
    forma: [
      "Removes text only visually: it stays in the DOM and accessibility tree, so screen readers read it and it contributes to accessible names.",
      "Prevents hidden words from running together with `white-space: nowrap`.",
      "`ef-visually-hidden` uses `!important` so component and theme rules cannot reveal it by accident."
    ],
    consumer: [
      "Write hidden text as it should be heard, including leading spaces when it continues visible text (\"Edit\" + \" invoice INV-1042\").",
      "Pair visible symbols with `aria-hidden=\"true\"` so they are not announced twice or as their Unicode name.",
      "Never put the class on a focusable element; sighted keyboard users would lose the focus indicator.",
      "Check that visible text and the accessible name start the same way, so voice control users can activate the control by what they see (WCAG 2.5.3)."
    ]
  },
  responsive: [
    "Hidden text is out of flow and clipped at every width, so it never affects wrapping, layout or horizontal overflow.",
    "No breakpoints or container queries apply; the text is equally hidden on phones and desktops."
  ],
  motion: [
    "No animation: the utilities are static and do not transition in or out."
  ],
  guidance: {
    do: [
      "Prefer visible text when there is room; hide text only when the visual context already carries the meaning.",
      "Use `ef-visually-hidden` in application markup and keep `ef-sr-only` where the assessment patterns already use it."
    ],
    avoid: [
      "Hiding error messages, instructions or required markers that sighted users also need.",
      "Using `display: none` or `hidden` for screen-reader text; both remove it from the accessibility tree.",
      "Stuffing extra keywords into hidden text; announce only what sighted users can infer."
    ]
  },
  related: [
    { slug: "skip-link", note: "Use for links that are hidden until they receive keyboard focus." },
    { slug: "tooltip", note: "Use when sighted users also need the supplementary text on hover or focus." },
    { slug: "text-roles", note: "Visible typographic roles for hierarchy; nothing is hidden." }
  ]
};
