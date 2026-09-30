export default {
  name: "Command palette",
  category: "keyboard",
  behavior: "Application / Limen",
  summary: "Keyboard-first command discovery that can become a full-screen mobile surface.",
  purpose: {
    description: "A command palette lets people find and run a command or jump to a record by typing, instead of hunting through menus. Forma provides the visual contract on a native `dialog`: a header with the title and a key hint, a search input, grouped command buttons with optional shortcuts, and unavailable commands with a stated reason. The browser owns the dialog's open state and, when opened as a modal, focus containment, Escape and focus restoration. The application or Limen owns the opening shortcut, filtering and ranking, async providers, arrow-key movement between results, running the chosen command, and never offering commands the user is not allowed to run.",
    useWhen: [
      "An application has many commands or destinations and frequent users want to reach them from the keyboard.",
      "Commands come from several providers (recent, suggested, records) and benefit from one search surface.",
      "The same entry point must work on phones, where it becomes a full-screen surface."
    ],
    avoidWhen: [
      "A short, fixed set of actions for one object: use [[menu]] or [[overflow-command-disclosure]].",
      "Finding records in a collection with results on the page: use [[search]] or [[combobox]].",
      "Primary navigation: use [[navigation-shell]] or [[sidebar]]; the palette is a shortcut, not the only path.",
      "Terminal-style screens with fixed function keys: use [[character-grid-keys]]."
    ],
    characteristics: [
      "Built on a native `dialog`; opening modally gives focus containment, inert background, Escape to close and focus restoration for free.",
      "Uses the heavy motion preset by default, because it is a large surface that takes over attention.",
      "Below 40rem wide it fills the viewport edge to edge.",
      "Unavailable commands stay visible as disabled buttons with a reason, instead of disappearing."
    ]
  },
  examples: [
    {
      id: "toolbar-invoker",
      title: "Opened from a toolbar button",
      description: "The palette opened as a modal with a native invoker (`commandfor` and `command=\"show-modal\"`), so the browser handles focus, Escape and returning focus to the button. A Close button gives touch users an explicit way out.",
      html: `<ef-command-palette class="ef-component-tag">
  <button type="button" commandfor="command-palette-toolbar-invoker-dialog" command="show-modal">Open commands</button>
  <dialog class="ef-command-palette" id="command-palette-toolbar-invoker-dialog" aria-labelledby="command-palette-toolbar-invoker-title">
    <header class="ef-command-palette__header">
      <h3 id="command-palette-toolbar-invoker-title">Commands</h3>
      <button type="button" commandfor="command-palette-toolbar-invoker-dialog" command="close">Close</button>
    </header>
    <label class="ef-visually-hidden" for="command-palette-toolbar-invoker-search">Find a command</label>
    <input id="command-palette-toolbar-invoker-search" type="search" placeholder="Type a command or record" autocomplete="off">
    <div class="ef-command-palette__group">
      <h4>Recent</h4>
      <button type="button"><span>Open invoice INV-1042</span></button>
      <button type="button"><span>Show overdue accounts</span></button>
    </div>
    <div class="ef-command-palette__group">
      <h4>Create</h4>
      <button type="button"><span>New invoice</span><kbd>Ctrl I</kbd></button>
      <button type="button"><span>New customer</span><kbd>Ctrl Shift C</kbd></button>
    </div>
  </dialog>
</ef-command-palette>`
    },
    {
      id: "no-results",
      title: "No matching commands",
      description: "The query matched nothing. The palette keeps its structure and reports the empty result in a status message the application updates, with a suggestion instead of a blank panel.",
      html: `<ef-command-palette class="ef-component-tag">
  <dialog class="ef-command-palette" open aria-labelledby="command-palette-no-results-title">
    <header class="ef-command-palette__header">
      <h3 id="command-palette-no-results-title">Commands</h3>
      <kbd>Esc</kbd>
    </header>
    <label class="ef-visually-hidden" for="command-palette-no-results-search">Find a command</label>
    <input id="command-palette-no-results-search" type="search" value="exprot ledger" autocomplete="off" aria-describedby="command-palette-no-results-status">
    <div class="ef-command-palette__group">
      <h4>Results</h4>
      <p id="command-palette-no-results-status" role="status">No commands match "exprot ledger". Check the spelling or search for a record number.</p>
    </div>
  </dialog>
</ef-command-palette>`
    },
    {
      id: "unavailable-commands",
      title: "Unavailable commands with reasons",
      description: "Commands the user may run but that are blocked right now stay listed as disabled buttons, each with a reason inside the button so it is part of the accessible name. Commands the user is not authorized to run are not rendered at all.",
      html: `<ef-command-palette class="ef-component-tag">
  <dialog class="ef-command-palette" open aria-labelledby="command-palette-unavailable-commands-title" data-ef-motion-weight="standard">
    <header class="ef-command-palette__header">
      <h3 id="command-palette-unavailable-commands-title">Report actions</h3>
      <kbd>Esc</kbd>
    </header>
    <label class="ef-visually-hidden" for="command-palette-unavailable-commands-search">Find a report action</label>
    <input id="command-palette-unavailable-commands-search" type="search" value="publish" autocomplete="off">
    <div class="ef-command-palette__group">
      <h4>Publishing</h4>
      <button type="button"><span>Preview report</span><kbd>Ctrl P</kbd></button>
      <button type="button" disabled><span>Publish report</span><small>Unavailable until validation passes</small></button>
      <button type="button" disabled><span>Schedule publication</span><small>Unavailable while another schedule is pending</small></button>
    </div>
  </dialog>
</ef-command-palette>`
    },
    {
      id: "mobile-full-screen",
      title: "Full-screen palette on a phone",
      description: "At phone width the palette fills the viewport without a border. Long command names wrap and shortcut hints stay at the inline end.",
      mobile: {
        height: 560,
        notes: [
          "Below 40rem the dialog becomes 100vw by 100dvh with no border, so the on-screen keyboard and the results share the full screen.",
          "Command buttons are full width, so each row is a large touch target; long names wrap inside the button.",
          "Keyboard shortcut hints are irrelevant on most phones; keep them short or omit them so names have room.",
          "Uses `dvh`, so the surface follows the visible viewport when browser toolbars show or hide in either orientation."
        ]
      },
      html: `<ef-command-palette class="ef-component-tag">
  <dialog class="ef-command-palette" open aria-labelledby="command-palette-mobile-full-screen-title">
    <header class="ef-command-palette__header">
      <h3 id="command-palette-mobile-full-screen-title">Go to</h3>
      <kbd>Esc</kbd>
    </header>
    <label class="ef-visually-hidden" for="command-palette-mobile-full-screen-search">Find a page or record</label>
    <input id="command-palette-mobile-full-screen-search" type="search" placeholder="Search pages and records" autocomplete="off">
    <div class="ef-command-palette__group">
      <h4>Suggested</h4>
      <button type="button"><span>Items needing attention in the Northern Europe distribution region</span></button>
      <button type="button"><span>Open invoice INV-1042</span></button>
      <button type="button"><span>Account settings</span></button>
    </div>
  </dialog>
</ef-command-palette>`
    }
  ],
  api: {
    attributes: [
      { name: "open", on: "dialog", values: "boolean", default: "absent (closed)", description: "Native open state. Written in markup it shows the palette non-modally, as in the canonical pattern; for real use open it modally with an invoker or `showModal()` so focus is contained." },
      { name: "commandfor", on: "invoker button", values: "id of the dialog", default: "—", description: "Native invoker target. Pair with `command`." },
      { name: "command", on: "invoker button", values: "show-modal | close", default: "—", description: "`show-modal` opens the palette as a modal; `close` closes it. No script needed." },
      { name: "aria-labelledby", on: "dialog", values: "id of the header heading", default: "—", description: "Names the dialog after its visible title." },
      { name: "aria-describedby", on: "search input", values: "id of the result status", default: "—", description: "Optionally links the result-count or empty-result message to the search field." },
      { name: "type", on: "input / button", values: "search / button", default: "—", description: "Use a search input and `type=\"button\"` commands so nothing submits a form by accident." },
      { name: "disabled", on: "command button", values: "boolean", default: "absent", description: "Command is known but blocked now; put the reason in a `small` inside the button." },
      { name: "role", on: "result message", values: "status", default: "—", description: "Announces result counts and empty results without moving focus." },
      { name: "data-ef-motion-weight", on: "dialog", values: "light | standard | heavy", default: "heavy (by CSS default)", description: "Presentation-only mass for the entry and exit motion. See hooks." }
    ],
    hooks: {
      "ef-command-palette": "The `dialog` surface: at most 42rem wide and 40rem tall with a 1rem margin from the viewport, primary surface, functional border.",
      "ef-command-palette__header": "Flex row with the title and a key hint or Close button, separated by a subtle rule.",
      "ef-command-palette__group": "A padded group of commands with an `h4` heading. Buttons inside are full-width rows with the label at the start and a shortcut at the end.",
      "open": "Styles the open state: full opacity, no offset and scale 1. The closed state is transparent, 0.75rem lower and slightly smaller so opening and closing animate.",
      "data-ef-motion-weight": "Perceived mass for opening and closing: `light`, `standard` or `heavy`. Without the attribute the palette uses heavy. Presentation only; never encodes importance."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between the search input, the Close button and each enabled command button; disabled commands are skipped natively." },
      { keys: "Enter / Space on a command", action: "Activates the command button natively; the application runs the command and closes the dialog." },
      { keys: "Escape", action: "Closes the palette natively when it was opened modally and returns focus to the invoker. A non-modal `open` palette does not close on Escape unless the application handles it." },
      { keys: "Ctrl+K, arrow keys, type-ahead", action: "Not built in. The opening shortcut, arrow-key movement between results and filtering as you type are application or Limen behavior." }
    ],
    events: [
      { name: "input", description: "Native event from the search field; the application filters and updates the groups and status." },
      { name: "close", description: "Native dialog event after the palette closes, for example to clear the query." },
      { name: "click", description: "Native event on a command button; the application runs the command." }
    ],
    form: "The palette is not a form and submits nothing. The search input and command buttons do not participate in any surrounding form when buttons use `type=\"button\"`."
  },
  states: [
    { name: "Closed", how: "no open attribute", description: "Not rendered; at rest the closed styles are transparent, offset 0.75rem down and scaled to 0.985." },
    { name: "Open", how: "open attribute / showModal()", description: "Fully opaque at its resting position. Modal opening adds the native backdrop and inert page." },
    { name: "Unavailable command", how: "disabled on the button", description: "Dimmed native disabled button with a visible reason; skipped by Tab." },
    { name: "No results", how: "application-rendered status message", description: "An empty group with a `role=\"status\"` message explaining what to try." },
    { name: "Full screen", how: "viewport narrower than 40rem", description: "100vw by 100dvh without a border." }
  ],
  accessibility: {
    forma: [
      "Uses a native `dialog`, so modal opening provides focus containment, inert background, Escape and focus restoration.",
      "Keeps commands as native buttons; unavailable ones use the native `disabled` state and show their reason as text.",
      "Hides the search label visually with [[visually-hidden]] while keeping it as the input's accessible name.",
      "Honors reduced motion by collapsing transition durations to 0.01ms."
    ],
    consumer: [
      "Open the palette modally (invoker `command=\"show-modal\"` or `showModal()`) in real use, and provide a visible way to open it besides the shortcut.",
      "Implement filtering, ranking, arrow-key movement and running commands; if you use an ARIA combobox/listbox pattern, implement it completely.",
      "Never render commands the user is not authorized to run; show blocked-but-allowed commands disabled with a reason.",
      "Announce result counts and empty results in a `role=\"status\"` region that exists before it changes.",
      "Only show shortcut hints for shortcuts the application actually installs."
    ]
  },
  responsive: [
    "Inline size is `min(42rem, 100vw − 2rem)` and block size at most `min(40rem, 100dvh − 2rem)`, centered with `margin: auto`.",
    "Below 40rem the palette becomes a full-screen surface: 100vw by 100dvh and no border.",
    "Command rows are full width; labels wrap and shortcuts stay at the inline end.",
    "Long result lists are the application's to page or virtualize; keep groups short."
  ],
  motion: [
    "Opening fades in (perceptual duration) while the surface rises 0.75rem and scales from 0.985 to 1 with the inertial duration, starting from `@starting-style`.",
    "The default heavy mass makes the entry slower and more settled than a menu, matching the palette's larger attentional commitment; `data-ef-motion-weight` can lighten it.",
    "Closing uses the shorter, more damped exit duration, and `display` and `overlay` transition discretely so the exit is visible before the dialog leaves the top layer.",
    "The native open state is authoritative; interrupting mid-transition simply retargets.",
    "Under `prefers-reduced-motion: reduce` the transition duration is 0.01ms, so the palette appears and disappears immediately."
  ],
  guidance: {
    do: [
      "Group results (Recent, Suggested, Create) and keep command names verb-first.",
      "Keep the canonical `h3` title and `h4` group headings, which the palette's spacing rules target."
    ],
    avoid: [
      "Making the palette the only way to reach a feature.",
      "Hiding blocked commands silently; users then cannot learn why an action is missing.",
      "Using motion weight to signal that the palette is important."
    ]
  },
  related: [
    { slug: "dialog", note: "Use for confirmation and focused tasks rather than command search." },
    { slug: "menu", note: "Use for a short, fixed list of actions attached to a button." },
    { slug: "combobox", note: "Use for choosing a value for a field from suggestions." },
    { slug: "search", note: "Use for searching a collection with results on the page." }
  ]
};
