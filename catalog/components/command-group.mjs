export default {
  name: "Command group",
  category: "actions",
  behavior: "Application content",
  summary: "Groups related commands under an explicit, visible task label without owning command authority.",
  purpose: {
    description: "A command group is a labelled `section` containing a heading and a wrapping row of native buttons. The heading names the task the commands serve (Edit, Share, Export), and `aria-labelledby` makes that name the group's accessible name, so a screen-reader user hears the context before the commands. Forma provides only layout: the label, the wrapping command row and a shared gap. Which commands exist, whether each is currently allowed, and what it does are application and Ordo decisions.",
    useWhen: [
      "A toolbar or panel holds several families of commands and users need to know which family a command belongs to.",
      "Commands would be ambiguous without context, for example two Delete buttons acting on different objects.",
      "A record or document screen needs grouped actions that must stay visible and wrap on narrow screens."
    ],
    avoidWhen: [
      "There are only one to three obvious actions with no need for a heading: use [[button]] inside `ef-actions`.",
      "The commands are secondary and should be tucked away: use [[overflow-command-disclosure]] or a [[menu]].",
      "The group is really a set of mutually exclusive options such as a view mode: use [[segmented-control]].",
      "Users search a large command set by name: use [[command-palette]]."
    ],
    characteristics: [
      "The visible heading is the group's accessible name through `aria-labelledby`.",
      "Commands wrap onto new lines instead of shrinking; each keeps the 44px native button target.",
      "One custom property, `--ef-command-space`, sets the gap between the label, the rows and the commands.",
      "The group expresses no priority, legality or permission; it only arranges what the application renders."
    ]
  },
  examples: [
    {
      id: "document-toolbar",
      title: "Document toolbar with two groups",
      description: "Two labelled groups side by side in a [[cluster]]. Each section is named by its own heading, so the two sets of commands stay distinguishable in the landmark and heading lists even though both sit in one toolbar row.",
      html: `<ef-command-group class="ef-component-tag">
  <div class="ef-cluster">
    <section class="ef-command-group" aria-labelledby="command-group-document-toolbar-format">
      <h2 class="ef-command-group__label" id="command-group-document-toolbar-format">Format</h2>
      <div class="ef-command-group__commands">
        <button type="button">Bold</button>
        <button type="button">Italic</button>
        <button type="button">Insert link</button>
      </div>
    </section>
    <section class="ef-command-group" aria-labelledby="command-group-document-toolbar-share">
      <h2 class="ef-command-group__label" id="command-group-document-toolbar-share">Share</h2>
      <div class="ef-command-group__commands">
        <button type="button">Copy link</button>
        <button type="button">Invite people</button>
      </div>
    </section>
  </div>
</ef-command-group>`
    },
    {
      id: "unavailable-command",
      title: "Command unavailable with a visible reason",
      description: "The application has decided Merge is not currently legal. The button is natively disabled, and a sentence inside the group states why, because the application-layer disabled button looks almost identical to an enabled one. Forma does not decide legality; it only renders the state it is given.",
      html: `<ef-command-group class="ef-component-tag">
  <section class="ef-command-group" aria-labelledby="command-group-unavailable-command-label">
    <h2 class="ef-command-group__label" id="command-group-unavailable-command-label">Pull request</h2>
    <div class="ef-command-group__commands">
      <button type="button">Request review</button>
      <button type="button" disabled>Merge</button>
      <button type="button">Close pull request</button>
    </div>
    <p class="ef-field__description">Merge is unavailable: 2 required checks are still running.</p>
  </section>
</ef-command-group>`
    },
    {
      id: "mobile-record-commands",
      title: "Record commands on a phone",
      description: "A group of five commands with longer labels at phone width. The commands wrap into several rows under the label; nothing is hidden or scrolled.",
      mobile: {
        height: 340,
        notes: [
          "`ef-command-group__commands` is a wrapping flex row, so commands move to new lines in source order instead of shrinking below 44px.",
          "The label stays above the commands at every width; the group never becomes a horizontal scroller.",
          "Long labels wrap inside their button. If the group grows too tall on phones, move rarely used commands into [[overflow-command-disclosure]] rather than hiding them.",
          "Orientation changes only reflow the rows; the order and grouping of commands are unchanged."
        ]
      },
      html: `<ef-command-group class="ef-component-tag">
  <section class="ef-command-group" aria-labelledby="command-group-mobile-record-commands-label">
    <h2 class="ef-command-group__label" id="command-group-mobile-record-commands-label">Invoice INV-20931</h2>
    <div class="ef-command-group__commands">
      <button type="button">Send reminder</button>
      <button type="button">Record payment</button>
      <button type="button">Download PDF</button>
      <button type="button">Duplicate</button>
      <button type="button">Void invoice</button>
    </div>
  </section>
</ef-command-group>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-command-group", values: "id of .ef-command-group__label", default: "—", description: "Required. Names the group from its visible heading so the region and its commands are announced with their task context." },
      { name: "id", on: ".ef-command-group__label", values: "unique id", default: "—", description: "Target of aria-labelledby. Must be unique on the page." },
      { name: "type", on: "button", values: "button", default: "—", description: "Commands are ordinary buttons; set type=\"button\" so they never submit an enclosing form." },
      { name: "disabled", on: "button", values: "boolean", default: "absent", description: "Renders an application-decided unavailable command. Pair it with visible text explaining why." }
    ],
    hooks: {
      "ef-command-group": "Root grid (usually a `section`) that stacks the label above the commands.",
      "ef-command-group__label": "The visible task label. Use a heading at the right level for the page outline; margins are reset and the size is reduced to a label size.",
      "ef-command-group__commands": "Wrapping flex row that holds the command buttons.",
      "--ef-command-space": "Gap between the label and the commands and between commands. Defaults to the spacing-2 token (0.5rem). [[overflow-command-disclosure]] panels nested in the group inherit it."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the commands one by one in source order. Forma adds no arrow-key toolbar navigation; an ARIA toolbar with roving focus is application/Limen behavior." },
      { keys: "Enter / Space", action: "Activates the focused command (native button behavior)." }
    ],
    events: [
      { name: "click", description: "Native click on each command button. The group itself emits nothing." }
    ],
    form: "The group does not participate in forms. Commands are `type=\"button\"`; if a command must submit, use `type=\"submit\"` inside the form deliberately."
  },
  states: [
    { name: "Default", how: "markup as shown", description: "Label above a wrapping row of commands." },
    { name: "Command unavailable", how: "disabled attribute on a command button", description: "The command is skipped by focus and cannot be activated. The application supplies the reason as text." },
    { name: "Wrapped", how: "narrow available width", description: "Commands continue onto additional rows with the same gap." }
  ],
  accessibility: {
    forma: [
      "Keeps commands as native buttons with their own focus, role and activation.",
      "Keeps the label visible and above the commands at every width so the context is never lost.",
      "Preserves 44px command targets by wrapping rather than shrinking."
    ],
    consumer: [
      "Name the group with a heading and aria-labelledby; a `section` without an accessible name is not exposed as a region.",
      "Choose the heading level that fits the page outline.",
      "Write command labels that make sense out of context, or include the object (\"Void invoice\").",
      "If you implement ARIA `role=\"toolbar\"` with arrow-key navigation, own that keyboard model in application/Limen code.",
      "Explain unavailable commands in visible text and re-check legality when a command is activated."
    ]
  },
  responsive: [
    "Intrinsic sizing: the group is a single-column grid, and commands form a wrapping flex row.",
    "No breakpoints; commands wrap in source order at any width and never overflow horizontally.",
    "Long labels wrap inside their own buttons.",
    "Place several groups in a [[cluster]] or [[stack]] to lay them out side by side or stacked."
  ],
  motion: [
    "No animation: the group itself does not move or transition. Its buttons keep the native button hover and press color feedback described on [[button]]."
  ],
  guidance: {
    do: [
      "Use a short noun or verb phrase for the label that names the task (Share, Format, Invoice actions).",
      "Keep the order of commands stable across records so users can find them by position as well as by name."
    ],
    avoid: [
      "Hiding a command because it is currently unavailable when users need to learn that it exists; render it disabled with a reason instead.",
      "Using visual order or grouping to imply that a command is authorized or safe.",
      "Nesting a command group inside another command group."
    ]
  },
  related: [
    { slug: "button", note: "Use a plain `ef-actions` row when the actions need no group label." },
    { slug: "overflow-command-disclosure", note: "Use to move secondary commands behind a native More disclosure, often inside a command group." },
    { slug: "menu", note: "Use for a popover list of actions opened from a single trigger." },
    { slug: "collection-toolbar", note: "Use for search, filter and sort controls above a collection rather than record commands." },
    { slug: "command-palette", note: "Use when users search a large command set by name." }
  ]
};
