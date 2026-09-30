import { missionById } from "../example-data/nasa-spaceflight.mjs";

const apollo8 = missionById("apollo-8");
const apollo11 = missionById("apollo-11");
const sts31 = missionById("sts-31");
const sts95 = missionById("sts-95");
const artemisI = missionById("artemis-i");

export default {
  name: "Combobox",
  category: "forms",
  behavior: "Native baseline / Limen enhancement",
  summary: "Searchable selection baseline that preserves direct text entry and native semantics.",
  purpose: {
    description: "A combobox is a text input with suggestions: the user can type to narrow a list or enter a value directly. Forma's baseline is a native `input` linked to a `datalist` with the `list` attribute, so the browser supplies suggestion matching, the suggestion popup and keyboard selection with no script. `.ef-combobox` lays out the label, control, a decorative indicator and help text. Asynchronous suggestions, loading/no-result/error states, rich options and full WAI-ARIA combobox keyboard behavior are Limen/application enhancements layered on the same visual contract.",
    useWhen: [
      "The list of values is long enough that typing to filter is faster than scrolling a [[select]].",
      "Users may need to enter a value that is not in the list, such as a new tag or a free-form project name.",
      "Suggestions help but are not the only acceptable answers."
    ],
    avoidWhen: [
      "The list is short and fixed and only listed values are valid: use [[select]] or [[choice-group]].",
      "The user is searching a collection and expects results rather than a single value: use [[search]].",
      "The user runs commands by name: use [[command-palette]].",
      "Several values must be picked as tokens: that multiselect needs Limen behavior and is not this baseline."
    ],
    characteristics: [
      "The input always accepts typed text; a datalist only suggests.",
      "Suggestion popup appearance and matching rules are browser-owned and vary by platform.",
      "The application must validate that a typed value is acceptable; a datalist does not constrain submission."
    ]
  },
  examples: [
    {
      id: "free-entry-labels",
      title: "Mission keyword with new values allowed",
      description: "Existing mission keywords are suggested, but a new keyword can be typed and submitted as is. This demonstrates the datalist/free-entry distinction without inventing a separate product taxonomy.",
      html: `<ef-combobox class="ef-component-tag">
  <div class="ef-combobox">
    <label for="combobox-free-entry-label">Mission keyword</label>
    <div class="ef-combobox__control">
      <input id="combobox-free-entry-label" name="keyword" list="combobox-free-entry-options" autocomplete="off" aria-describedby="combobox-free-entry-help">
      <span class="ef-combobox__indicator" aria-hidden="true">⌄</span>
    </div>
    <datalist id="combobox-free-entry-options">
      <option value="lunar"></option>
      <option value="flight-test"></option>
      <option value="hubble"></option>
      <option value="research"></option>
    </datalist>
    <p class="ef-combobox__help" id="combobox-free-entry-help">Choose a common keyword or type a new one for this mission view.</p>
  </div>
</ef-combobox>`
    },
    {
      id: "unrecognized-value",
      title: "Mission outside the reference collection",
      description: "Only missions in Forma's stable NASA reference collection are accepted here. The application kept the typed value, marked it invalid, and showed the allowed mission names for correction.",
      html: `<ef-combobox class="ef-component-tag">
  <div class="ef-combobox">
    <label for="combobox-unrecognized-mission">Reference mission</label>
    <div class="ef-combobox__control">
      <input id="combobox-unrecognized-mission" name="mission" list="combobox-unrecognized-options" autocomplete="off" value="Apollo Eleven" required aria-invalid="true" aria-describedby="combobox-unrecognized-help combobox-unrecognized-error">
      <span class="ef-combobox__indicator" aria-hidden="true">⌄</span>
    </div>
    <datalist id="combobox-unrecognized-options">
      <option value="${apollo8.name}"></option>
      <option value="${apollo11.name}"></option>
      <option value="${sts31.name}"></option>
      <option value="${artemisI.name}"></option>
    </datalist>
    <p class="ef-combobox__help" id="combobox-unrecognized-help">Type to filter completed reference missions.</p>
    <p class="ef-validation-message" id="combobox-unrecognized-error">
      <span class="ef-validation-message__mark" aria-hidden="true">!</span>
      "Apollo Eleven" is not a reference-collection value. Choose the canonical ${apollo11.name} name from the list.
    </p>
  </div>
</ef-combobox>`
    },
    {
      id: "mobile-crew-member",
      title: "Mobile crew-member field",
      description: "A crew-member combobox at phone width. Suggestions come from crew already present in the shared NASA records while the browser owns the datalist presentation.",
      mobile: {
        height: 240,
        notes: [
          "The label, control and help stack in one column and the input fills the width with a 44px minimum height.",
          "On touch devices suggestions usually appear in browser or operating-system UI, which Forma does not style.",
          "The indicator is absolutely positioned at the inline end and does not take width.",
          "Help text wraps below the control; nothing scrolls horizontally."
        ]
      },
      html: `<ef-combobox class="ef-component-tag">
  <div class="ef-combobox">
    <label for="combobox-mobile-crew-member">Crew member</label>
    <div class="ef-combobox__control">
      <input id="combobox-mobile-crew-member" name="crew-member" list="combobox-mobile-crew-member-options" autocomplete="off" aria-describedby="combobox-mobile-crew-member-help">
      <span class="ef-combobox__indicator" aria-hidden="true">⌄</span>
    </div>
    <datalist id="combobox-mobile-crew-member-options">
      <option value="${apollo11.crew[0]}"></option>
      <option value="${apollo11.crew[2]}"></option>
      <option value="${sts31.crew[3]}"></option>
      <option value="${sts95.crew[6]}"></option>
    </datalist>
    <p class="ef-combobox__help" id="combobox-mobile-crew-member-help">Type a crew member from the reference missions.</p>
  </div>
</ef-combobox>`
    }
  ],
  api: {
    attributes: [
      { name: "list", on: "input", values: "id of a datalist", default: "—", description: "Connects the native suggestion list. Required for the no-script baseline." },
      { name: "for", on: "label", values: "id of the input", default: "—", description: "Associates the visible label." },
      { name: "name", on: "input", values: "string", default: "—", description: "Form field name; the typed text is what is submitted." },
      { name: "autocomplete", on: "input", values: "off", default: "browser heuristic", description: "Stops the browser's form history from mixing with the datalist suggestions." },
      { name: "value", on: "option", values: "string", default: "—", description: "Suggested value inside the datalist." },
      { name: "placeholder", on: "input", values: "string", default: "—", description: "Optional example text; never a replacement for the label." },
      { name: "required", on: "input", values: "boolean", default: "absent", description: "Native constraint against an empty value; does not require a listed value." },
      { name: "aria-describedby", on: "input", values: "id list", default: "—", description: "Links the help text and any validation message." },
      { name: "aria-invalid", on: "input", values: "true", default: "absent", description: "Set by the application when the typed value is not accepted." }
    ],
    hooks: {
      "ef-combobox": "Root grid (0.5rem gap). A direct child `label` gets the compact field-label style.",
      "ef-combobox__control": "Positioning wrapper around the input and indicator.",
      "ef-combobox__indicator": "Decorative glyph pinned to the inline end and vertically centered; pointer-transparent. Mark it aria-hidden=\"true\".",
      "ef-combobox__help": "Help text in secondary color at 0.75rem. Link it with aria-describedby."
    },
    keyboard: [
      { keys: "Typing", action: "Filters the native suggestion list (matching rules are browser-owned)." },
      { keys: "ArrowDown / ArrowUp", action: "Opens and moves through suggestions in browsers that show a datalist popup." },
      { keys: "Enter", action: "Accepts the highlighted suggestion; with no suggestion open, submits the form natively." },
      { keys: "Escape", action: "Closes the suggestion popup in most browsers." },
      { keys: "Limen enhancement", action: "A custom listbox must implement the WAI-ARIA combobox pattern (aria-expanded, aria-activedescendant, Home/End) in application code; Forma provides none of it." }
    ],
    events: [
      { name: "input / change", description: "Native input events. Choosing a datalist suggestion fires input with the new value. Forma adds none." }
    ],
    form: "A native text input: submits whatever text is present, whether or not it matches a suggestion. List membership must be validated by the application."
  },
  states: [
    { name: "Empty", how: "no value", description: "Label, input and help text; optional placeholder." },
    { name: "Suggesting", how: "browser datalist popup", description: "Browser-rendered list of matching suggestions; not styled by Forma." },
    { name: "Focus", how: ":focus-visible", description: "Foundation two-tone focus ring on the input." },
    { name: "Invalid", how: "aria-invalid=\"true\" plus a linked .ef-validation-message", description: "Error text with a non-color mark below the help text." },
    { name: "Loading / no results / error", how: "application-supplied help or status text", description: "Only exists with a Limen enhancement for asynchronous suggestions; express it as text, not only as a spinner." }
  ],
  accessibility: {
    forma: [
      "The no-script baseline uses a labelled native input and datalist, which browsers expose as a combobox with suggestions.",
      "Typed entry is always available, so the control never requires pointer use or a popup.",
      "The indicator is decorative and hidden from assistive technology."
    ],
    consumer: [
      "Link the help text with aria-describedby; the canonical pattern does not.",
      "Validate list membership and explain rejected values with a [[validation-message]].",
      "When replacing the datalist with a custom popup, implement the full WAI-ARIA combobox pattern, announce result counts and cancel obsolete asynchronous requests.",
      "Keep composition (IME) input safe: do not filter or submit on keystrokes during composition."
    ]
  },
  responsive: [
    "Single-column grid; the input fills the container width.",
    "The indicator is positioned over the input's inline end without reserving padding, so very long typed text can pass beneath it.",
    "No breakpoints; suggestion UI on touch devices is platform-owned."
  ],
  motion: [
    "No animation: Forma does not transition the combobox or its indicator. The native suggestion popup's appearance is browser-controlled."
  ],
  guidance: {
    do: [
      "Say in the help text whether new values are allowed.",
      "Keep suggestion values short and distinct."
    ],
    avoid: [
      "Assuming a datalist restricts the submitted value.",
      "Using the indicator glyph as the only sign that suggestions exist; the help text should say so."
    ]
  },
  related: [
    { slug: "select", note: "Fixed list, only listed values allowed, no typing required." },
    { slug: "search", note: "Query entry that returns results rather than choosing one value." },
    { slug: "text-field", note: "Plain single-line entry with no suggestions." },
    { slug: "command-palette", note: "Keyboard-first command search in a modal surface." }
  ]
};
