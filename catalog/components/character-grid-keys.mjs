export default {
  name: "Character grid keys",
  category: "keyboard",
  behavior: "Application / Limen",
  summary: "Enter, Clear, Reset, PF1-PF24, and named action affordances as native buttons with visible key names; the application owns what each key does.",
  purpose: {
    description: "Action keys present the actions a character-grid screen accepts: Enter, Clear, Reset, PF and PA keys, 5250 F-keys, or named actions. Each key is a native `button.forma-character-grid__key` placed on its cells, with the key name in `<kbd>` and the label as ordinary text, so the accessible name is exactly what is on screen (\"PF3=Exit\"). Submit keys carry `name` and `value`, so the application learns which key was used from `SubmitEvent.submitter`. Forma presents keys; mapping physical F-keys, processing Enter, Clear and Reset, and deciding what happens next belong to the application or Limen, and whether an action is legal belongs to Ordo.",
    useWhen: [
      "A character-grid screen lists the function keys it accepts on its bottom rows.",
      "Users must be able to trigger every action by pointer, touch and Tab as well as by physical function keys.",
      "The application needs to know which key submitted the screen."
    ],
    avoidWhen: [
      "Ordinary application toolbars and forms: use [[button]] and [[command-group]].",
      "A searchable list of commands: use [[command-palette]].",
      "A key that is never available on this screen: omit it instead of showing it disabled."
    ],
    characteristics: [
      "Keys are native buttons with an explicit `type`; `type=\"reset\"` is prohibited because form reset is neither terminal Reset nor Clear.",
      "Enter is the first submit key in the form, so pressing Enter in any field submits through it.",
      "Keys that must work while fields are invalid (Exit, Cancel, Help, paging, Clear) carry `formnovalidate`.",
      "Unavailable keys are struck through and muted, a cue that survives grayscale and forced colors."
    ]
  },
  basicInteraction: { kind: "static", reasons: ["application-behavior", "form-handling"] },
  examples: [
    {
      id: "work-with-f-keys",
      interaction: { kind: "static", reasons: ["form-handling"] },
      title: "5250-style F-key bar",
      description: "The same contract with 5250 vocabulary: `F3=Exit`, `F12=Cancel` and named roll actions. Only the key names and `data-forma-action` values change; Enter stays the first submit key.",
      html: `<forma-character-grid-keys class="forma-component-tag">
  <div class="forma-character-grid" data-forma-rows="6" data-forma-columns="80" data-forma-narrow="contained">
    <div class="forma-character-grid__viewport" role="region" aria-labelledby="character-grid-keys-work-with-f-keys-title" tabindex="0">
      <form class="forma-character-grid__surface">
        <h2 class="forma-character-grid__text" id="character-grid-keys-work-with-f-keys-title" data-forma-row="1" data-forma-col="30" data-forma-len="21" data-forma-emphasis="intensified">WORK WITH SPOOL FILES</h2>
        <label class="forma-character-grid__label" for="character-grid-keys-work-with-f-keys-user" data-forma-row="3" data-forma-col="2" data-forma-len="16">User<span class="forma-character-grid__leader" aria-hidden="true"> . . . . . :</span></label>
        <input class="forma-character-grid__field" id="character-grid-keys-work-with-f-keys-user" name="user" type="text" maxlength="10" value="OP0142" autocomplete="off" data-forma-row="3" data-forma-col="20" data-forma-len="10">
        <div class="forma-character-grid__group" role="group" aria-label="Function keys">
          <button class="forma-character-grid__key" type="submit" name="action" value="enter" data-forma-action="enter" data-forma-row="5" data-forma-col="2" data-forma-len="12"><kbd>Enter</kbd>=Filter</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="f3" formnovalidate data-forma-action="f3" data-forma-row="5" data-forma-col="16" data-forma-len="7"><kbd>F3</kbd>=Exit</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="f5" formnovalidate data-forma-action="f5" data-forma-row="5" data-forma-col="25" data-forma-len="10"><kbd>F5</kbd>=Refresh</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="f12" formnovalidate data-forma-action="f12" data-forma-row="5" data-forma-col="37" data-forma-len="10"><kbd>F12</kbd>=Cancel</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="help" formnovalidate data-forma-action="help" data-forma-row="6" data-forma-col="2" data-forma-len="9"><kbd>Help</kbd>=Info</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="roll-down" formnovalidate data-forma-action="roll-down" data-forma-row="6" data-forma-col="13" data-forma-len="12"><kbd>Page Up</kbd>=Back</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="roll-up" formnovalidate data-forma-action="roll-up" data-forma-row="6" data-forma-col="27" data-forma-len="14"><kbd>Page Down</kbd>=More</button>
        </div>
      </form>
    </div>
  </div>
</forma-character-grid-keys>`
    },
    {
      id: "input-inhibited",
      interaction: { kind: "static", reasons: ["application-behavior"] },
      title: "Input inhibited while waiting",
      description: "While a request is outstanding the application disables every key except Reset and shows the X SYSTEM indicator. Disabled keys are skipped by Tab and struck through; Reset stays a `type=\"button\"` key that sends nothing.",
      html: `<forma-character-grid-keys class="forma-component-tag">
  <div class="forma-character-grid" data-forma-rows="6" data-forma-columns="80" data-forma-narrow="contained">
    <div class="forma-character-grid__viewport" role="region" aria-labelledby="character-grid-keys-input-inhibited-title" tabindex="0">
      <form class="forma-character-grid__surface">
        <h2 class="forma-character-grid__text" id="character-grid-keys-input-inhibited-title" data-forma-row="1" data-forma-col="33" data-forma-len="15" data-forma-emphasis="intensified">FUNDS TRANSFER</h2>
        <span class="forma-character-grid__text" data-forma-row="3" data-forma-col="2" data-forma-len="16">Amount<span class="forma-character-grid__leader" aria-hidden="true">  . . . :</span></span>
        <span class="forma-character-grid__value" data-forma-row="3" data-forma-col="20" data-forma-len="10" data-forma-align="end">2,500.00</span>
        <div class="forma-character-grid__group" role="group" aria-label="Function keys">
          <button class="forma-character-grid__key" type="submit" name="action" value="enter" disabled data-forma-action="enter" data-forma-row="5" data-forma-col="2" data-forma-len="14"><kbd>Enter</kbd>=Transfer</button>
          <button class="forma-character-grid__key" type="button" data-forma-action="reset" data-forma-row="5" data-forma-col="18" data-forma-len="12"><kbd>Reset</kbd>=Unlock</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="pf3" formnovalidate disabled data-forma-action="pf3" data-forma-row="5" data-forma-col="32" data-forma-len="8"><kbd>PF3</kbd>=Exit</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="pf12" formnovalidate disabled data-forma-action="pf12" data-forma-row="5" data-forma-col="42" data-forma-len="11"><kbd>PF12</kbd>=Cancel</button>
        </div>
        <p class="forma-character-grid__status" role="status" data-forma-row="6" data-forma-col="2" data-forma-len="78"><span class="forma-character-grid__indicator" data-forma-state="inhibited"><span>X SYSTEM</span></span>  Waiting for the host</p>
      </form>
    </div>
  </div>
</forma-character-grid-keys>`
    },
    {
      id: "named-actions",
      interaction: { kind: "static", reasons: ["form-handling"] },
      title: "Modern named actions",
      description: "A modern character-grid tool with named actions and a space instead of `=` between key and label. The vocabulary is open: `data-forma-action` can be any application name, and the buttons still work by pointer and Tab before any shortcut mapping exists.",
      html: `<forma-character-grid-keys class="forma-component-tag">
  <div class="forma-character-grid" data-forma-rows="5" data-forma-columns="72" data-forma-narrow="reflow">
    <div class="forma-character-grid__viewport" role="region" aria-labelledby="character-grid-keys-named-actions-title" tabindex="0">
      <form class="forma-character-grid__surface">
        <h2 class="forma-character-grid__text" id="character-grid-keys-named-actions-title" data-forma-row="1" data-forma-col="2" data-forma-len="14" data-forma-emphasis="intensified">config.toml</h2>
        <label class="forma-character-grid__label" for="character-grid-keys-named-actions-port" data-forma-row="3" data-forma-col="2" data-forma-len="12">Port<span class="forma-character-grid__leader" aria-hidden="true"> . . . :</span></label>
        <input class="forma-character-grid__field" id="character-grid-keys-named-actions-port" name="port" type="text" inputmode="numeric" maxlength="5" value="8443" autocomplete="off" data-forma-row="3" data-forma-col="15" data-forma-len="5">
        <div class="forma-character-grid__group" role="group" aria-label="Actions">
          <button class="forma-character-grid__key" type="submit" name="action" value="save" data-forma-action="save" data-forma-row="5" data-forma-col="2" data-forma-len="11"><kbd>Ctrl+S</kbd> Save</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="export" formnovalidate data-forma-action="export" data-forma-row="5" data-forma-col="15" data-forma-len="13"><kbd>Ctrl+E</kbd> Export</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="quit" formnovalidate data-forma-action="quit" data-forma-row="5" data-forma-col="30" data-forma-len="11"><kbd>Ctrl+Q</kbd> Quit</button>
        </div>
      </form>
    </div>
  </div>
</forma-character-grid-keys>`
    },
    {
      id: "key-bar-mobile",
      interaction: { kind: "static", reasons: ["form-handling"] },
      title: "Key bar on a phone",
      description: "Keys on the two bottom rows of a 40-column screen. Every key is a 44px-tall button that can be tapped, which matters on phones that have no function keys at all.",
      mobile: {
        height: 360,
        notes: [
          "Phones have no F-keys, so the presented buttons are the only way to trigger PF actions there; keep every action on screen.",
          "Below 40rem the row pitch grows to 2.75rem and each key has at least a 2.75rem width, meeting the 44px target size.",
          "Keys never wrap to new rows by themselves; place them on explicit rows so the 40-column grid fits in portrait.",
          "In landscape the same grid simply has spare width; key positions do not change."
        ]
      },
      html: `<forma-character-grid-keys class="forma-component-tag">
  <div class="forma-character-grid" data-forma-rows="5" data-forma-columns="40" data-forma-narrow="contained">
    <div class="forma-character-grid__viewport" role="region" aria-labelledby="character-grid-keys-key-bar-mobile-title" tabindex="0">
      <form class="forma-character-grid__surface">
        <h2 class="forma-character-grid__text" id="character-grid-keys-key-bar-mobile-title" data-forma-row="1" data-forma-col="14" data-forma-len="13" data-forma-emphasis="intensified">ORDER DETAIL</h2>
        <span class="forma-character-grid__text" data-forma-row="2" data-forma-col="2" data-forma-len="10">Order . :</span>
        <span class="forma-character-grid__value" data-forma-row="2" data-forma-col="13" data-forma-len="8">SO-88412</span>
        <div class="forma-character-grid__group" role="group" aria-label="Function keys">
          <button class="forma-character-grid__key" type="submit" name="action" value="enter" data-forma-action="enter" data-forma-row="4" data-forma-col="2" data-forma-len="13"><kbd>Enter</kbd>=Refresh</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-forma-action="pf3" data-forma-row="4" data-forma-col="17" data-forma-len="8"><kbd>PF3</kbd>=Exit</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="pf7" formnovalidate data-forma-action="pf7" data-forma-row="5" data-forma-col="2" data-forma-len="8"><kbd>PF7</kbd>=Back</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="pf8" formnovalidate data-forma-action="pf8" data-forma-row="5" data-forma-col="12" data-forma-len="11"><kbd>PF8</kbd>=Forward</button>
        </div>
      </form>
    </div>
  </div>
</forma-character-grid-keys>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "button.forma-character-grid__key", values: "submit | button", default: "—", description: "Required (CG-14). `submit` for Enter, Clear, PF, PA and named actions; `button` for Reset. Never `reset`." },
      { name: "name", on: "submit keys", values: "string, e.g. action", default: "—", description: "Submitted with `value` so the application can read the key from the form data as well as from the submitter." },
      { name: "value", on: "submit keys", values: "enter | clear | pf3 | …", default: "—", description: "The action submitted by this key." },
      { name: "formnovalidate", on: "submit keys", values: "boolean", default: "absent", description: "Lets Exit, Cancel, Help, paging and Clear submit while native validation would block Enter." },
      { name: "disabled", on: "button", values: "boolean", default: "absent", description: "Unavailable key: skipped by Tab, struck through and muted. Prefer omitting keys that are never available." },
      { name: "aria-label", on: ".forma-character-grid__group", values: "e.g. Function keys", default: "—", description: "Names the group of keys." }
    ],
    hooks: {
      "forma-character-grid__key": "The key button: transparent, left-aligned, exactly its cells wide and one row pitch tall. Underlined on hover.",
      "data-forma-action": "Names the action for the application: `enter`, `clear`, `reset`, `pf1`-`pf24`, `pa1`-`pa3`, `help`, `roll-up`, `field-exit`, or any application name. Not styled; read by application code.",
      "data-forma-len": "Key width in cells; cover the whole visible text including the label.",
      "forma-character-grid__group": "Wrap keys in a `div role=\"group\"` group with a name so they keep absolute coordinates.",
      "--forma-grid-emphasis": "Color of the bold key name in `<kbd>`.",
      "--forma-grid-protected": "Color of the label text.",
      "--forma-grid-muted": "Color of disabled keys.",
      "--forma-grid-focus": "Focus outline color."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through enabled keys in row-major order after the fields above them." },
      { keys: "Enter / Space on a focused key", action: "Activates the button natively." },
      { keys: "Enter in a field", action: "Native implicit submission through the first submit key, which must be the Enter key." },
      { keys: "F1-F24, Escape, Pause", action: "No built-in behavior. The application or Limen may map them to the presented buttons, calling the same activation path, and may then add `aria-keyshortcuts`." }
    ],
    events: [
      { name: "submit", description: "Native form event; `SubmitEvent.submitter` is the key button and `submitter.dataset.formaAction` names the action." },
      { name: "click", description: "Native event on a `type=\"button\"` key such as Reset. The application performs the local recovery." }
    ],
    form: "Submit keys are native submitters: the form submits `name=value` for the key used. `formnovalidate` bypasses native constraint validation for that key only. Reset submits nothing."
  },
  states: [
    { name: "Available", how: "enabled button", description: "Bold key name in the emphasis color followed by the label." },
    { name: "Hover", how: ":hover", description: "The whole key text is underlined." },
    { name: "Focus", how: ":focus-visible", description: "2px outline in `--forma-grid-focus`; Highlight in forced colors." },
    { name: "Unavailable", how: "disabled", description: "Struck through and muted (GrayText in forced colors); skipped by Tab and not submitted." }
  ],
  accessibility: {
    forma: [
      "Keeps keys as native buttons, so they are focusable, operable with Enter and Space, and announced as buttons.",
      "The accessible name is the visible text, including the key name, so speech users can say what they see.",
      "Disabled keys are distinguished by strike-through, not color alone.",
      "At the touch pitch keys are at least 44px tall and 2.75rem wide."
    ],
    consumer: [
      "Make Enter the first submit key and give every other submit key a `name` and `value`.",
      "Add `formnovalidate` to keys that must work with invalid fields.",
      "Only declare `aria-keyshortcuts` for mappings the application actually installs, and never bind bare printable characters (WCAG 2.1.4).",
      "Announce outcomes (validation, errors, inhibited input) in a message or status run, see [[character-grid-status]]."
    ]
  },
  responsive: [
    "Keys are exactly their cells wide at every width and never wrap onto another row; authors place them on explicit rows.",
    "Below 40rem or on a coarse pointer, keys get a 44px row pitch and a 2.75rem minimum width that paints into following blank cells.",
    "On phones without function keys the buttons are the only way to trigger each action, so every key stays visible."
  ],
  motion: [
    "No animation: hover underline, focus outline and disabled cues change immediately."
  ],
  guidance: {
    do: [
      "Keep the key vocabulary of the system being modeled (PF for 3270, F for 5250, named actions for modern tools).",
      "Put keys on the bottom rows of the screen in row-major order so they come after the fields."
    ],
    avoid: [
      "`type=\"reset\"` for Reset or Clear; it restores initial values and is neither.",
      "Styled spans or links as keys.",
      "Showing a disabled key that is never available on the screen."
    ]
  },
  related: [
    { slug: "character-grid", note: "The grid that places keys; owns every data-forma-* hook." },
    { slug: "character-grid-status", note: "Messages and the X SYSTEM indicator that explain why keys are unavailable." },
    { slug: "command-group", note: "Use for ordinary application actions outside a grid." },
    { slug: "command-palette", note: "Use when users search for a command instead of reading a key bar." }
  ]
};
