export default {
  name: "Overflow command disclosure",
  category: "actions",
  behavior: "Native HTML",
  summary: "Moves secondary commands into explicit native disclosure without shrinking targets or hiding group meaning.",
  owns: ["ef-overflow-commands"],
  purpose: {
    description: "An overflow command disclosure is a native `details` element whose `summary` (normally \"More commands\" or a more specific phrase) reveals a labelled group of secondary buttons. The browser owns open and closed state, keyboard toggling and the expanded announcement. The revealed panel is in normal document flow, so it pushes content down rather than floating over it, and the commands keep full 44px targets. Deciding which commands are secondary is an application decision; the disclosure never removes a command, it only defers it.",
    useWhen: [
      "A toolbar or record header has more commands than fit comfortably, and some are clearly used less often.",
      "Secondary commands must remain reachable on phones without shrinking targets or scrolling a toolbar sideways.",
      "You want disclosure that works with no script and keeps the revealed commands in the page flow."
    ],
    avoidWhen: [
      "The hidden commands are critical to the task: keep them visible in a [[command-group]] or [[mobile-action-bar]].",
      "The commands should float over content and close on outside click or Escape: use a Popover-backed [[menu]].",
      "The hidden content is explanatory text or form fields rather than commands: use [[disclosure]]."
    ],
    characteristics: [
      "Native `details`/`summary`: Enter or Space on the summary toggles it, and the expanded state is announced by the platform.",
      "The summary is a 44px-tall flex row. Because it is no longer `display: list-item`, Chromium and Firefox draw no disclosure marker, so the summary text must say what it reveals.",
      "The revealed panel is a wrapping flex row with a `role=\"group\"` label, reusing the command-group spacing.",
      "Opening is instant; nothing animates."
    ]
  },
  examples: [
    {
      id: "record-toolbar-overflow",
      title: "Record toolbar with overflow",
      description: "The common case: the frequent commands stay visible in a [[command-group]], and three secondary commands sit behind a disclosure at the end of the same row. The panel label repeats the summary text so the revealed buttons are announced as one group.",
      html: `<ef-overflow-command-disclosure class="ef-component-tag">
  <section class="ef-command-group" aria-labelledby="overflow-command-disclosure-record-toolbar-overflow-label">
    <h2 class="ef-command-group__label" id="overflow-command-disclosure-record-toolbar-overflow-label">Customer record</h2>
    <div class="ef-command-group__commands">
      <button type="button">Edit</button>
      <button type="button">Send message</button>
      <details class="ef-overflow-commands">
        <summary>More record commands</summary>
        <div class="ef-overflow-commands__panel" role="group" aria-label="More record commands">
          <button type="button">Merge duplicates</button>
          <button type="button">Export history</button>
          <button type="button">Archive customer</button>
        </div>
      </details>
    </div>
  </section>
</ef-overflow-command-disclosure>`
    },
    {
      id: "open-by-default",
      title: "Open on arrival with many commands",
      description: "The `open` attribute renders the disclosure expanded on first load, for example when the application restores the user's last choice. Six commands with long labels wrap inside the panel. After load the browser owns the state; the attribute reflects it.",
      html: `<ef-overflow-command-disclosure class="ef-component-tag">
  <details class="ef-overflow-commands" open>
    <summary>Bulk commands for 24 selected items</summary>
    <div class="ef-overflow-commands__panel" role="group" aria-label="Bulk commands for 24 selected items">
      <button type="button">Assign to a teammate</button>
      <button type="button">Change priority</button>
      <button type="button">Add labels</button>
      <button type="button">Move to another project</button>
      <button type="button">Export as CSV</button>
      <button type="button">Close selected items</button>
    </div>
  </details>
</ef-overflow-command-disclosure>`
    },
    {
      id: "mobile-overflow",
      title: "Overflow on a phone",
      description: "At phone width the disclosure keeps secondary commands out of the way until requested. Once open, the panel wraps its commands onto new lines below the summary and pushes the following content down.",
      mobile: {
        height: 320,
        notes: [
          "The summary row is at least 44px tall and spans the available width, so it is an easy tap target.",
          "Revealed commands wrap in source order; none are shrunk or scrolled sideways.",
          "The panel is in normal flow, so opening it moves following content down rather than covering it; there is no viewport clipping to manage.",
          "There are no breakpoints. If the same commands are visible on desktop, the application decides whether to render them inline or in the disclosure; Forma does not move them."
        ]
      },
      html: `<ef-overflow-command-disclosure class="ef-component-tag">
  <div class="ef-stack">
    <div class="ef-actions">
      <button type="button">Approve</button>
      <button type="button">Request changes</button>
    </div>
    <details class="ef-overflow-commands">
      <summary>More review commands</summary>
      <div class="ef-overflow-commands__panel" role="group" aria-label="More review commands">
        <button type="button">Reassign reviewer</button>
        <button type="button">Copy review link</button>
        <button type="button">Mark as spam</button>
      </div>
    </details>
  </div>
</ef-overflow-command-disclosure>`
    }
  ],
  api: {
    attributes: [
      { name: "open", on: "details", values: "boolean", default: "absent (closed)", description: "Initial expanded state. The browser toggles it as the user opens and closes the disclosure." },
      { name: "role", on: ".ef-overflow-commands__panel", values: "group", default: "—", description: "Exposes the revealed commands as one named group." },
      { name: "aria-label", on: ".ef-overflow-commands__panel", values: "string", default: "—", description: "Names the group; normally the same text as the summary so the context is repeated when focus enters the commands." },
      { name: "type", on: "button", values: "button", default: "—", description: "Commands are ordinary buttons that must not submit an enclosing form." }
    ],
    hooks: {
      "ef-overflow-commands": "Root `details` element. Positioned relative so application enhancements can anchor to it.",
      "ef-overflow-commands__panel": "The revealed wrapping row of commands, with a top gap under the summary. Uses `--ef-command-space` from an enclosing [[command-group]] when present."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves to the summary, then into the revealed commands when open." },
      { keys: "Enter / Space", action: "On the summary, toggles the disclosure (native details behavior). On a command, activates it." }
    ],
    events: [
      { name: "toggle", description: "Native event fired on the details element after it opens or closes." },
      { name: "click", description: "Native click on each command button." }
    ],
    form: "Does not participate in forms. The commands inside are `type=\"button\"`."
  },
  states: [
    { name: "Closed", how: "no open attribute", description: "Only the summary is visible. There is no visual open/closed marker; the platform announces the collapsed state." },
    { name: "Open", how: "open attribute / details[open]", description: "The panel of commands appears below the summary in normal flow. The appearance of the commands is the only visual cue." },
    { name: "Focus", how: ":focus-visible on summary", description: "The shared two-tone focus ring on the summary." }
  ],
  accessibility: {
    forma: [
      "Uses native details/summary, so the summary is a focusable disclosure button whose expanded state is announced.",
      "Gives the summary a 44px minimum height and keeps the commands at full button size.",
      "Does not rely on color for state; note that no visual expanded/collapsed marker is drawn, so the revealed commands are the visual cue."
    ],
    consumer: [
      "Write a specific summary label (\"More record commands\") rather than an icon or ellipsis alone.",
      "Label the panel with role=\"group\" and aria-label matching the summary.",
      "Never put the only path to a critical or frequently needed command in the overflow.",
      "Decide per application which commands are secondary; keep that choice stable across records."
    ]
  },
  responsive: [
    "The panel is a wrapping flex row; commands wrap in source order and never overflow horizontally.",
    "The revealed panel is in document flow, so it cannot be clipped by the viewport the way a floating menu can.",
    "No breakpoints are defined; moving commands between the visible row and the overflow at different widths is application markup, not CSS.",
    "Long summary text wraps within the summary line."
  ],
  motion: [
    "No animation: the panel appears and disappears instantly with the native open state. There is nothing for reduced motion to remove."
  ],
  guidance: {
    do: [
      "Keep the two or three most common commands visible and move the rest into the overflow.",
      "Match the panel's aria-label to the summary text."
    ],
    avoid: [
      "Labelling the summary with only \"…\" or an icon.",
      "Using the overflow to hide destructive commands so they seem less important; they still need clear labels and application confirmation.",
      "Placing an overflow disclosure inside another overflow disclosure."
    ]
  },
  related: [
    { slug: "command-group", note: "Use for the visible, labelled commands; the overflow usually sits inside one." },
    { slug: "menu", note: "Use when secondary actions should float over content and light-dismiss on outside click or Escape." },
    { slug: "disclosure", note: "Use for expandable explanatory content or optional fields rather than commands." },
    { slug: "mobile-action-bar", note: "Use for the one or two critical actions that must stay reachable on phones." }
  ]
};
