import { missionById } from "../example-data/nasa-spaceflight.mjs";

const apollo8 = missionById("apollo-8");
const apollo11 = missionById("apollo-11");
const sts31 = missionById("sts-31");
const artemisI = missionById("artemis-i");

export default {
  name: "Choice group",
  category: "selection",
  behavior: "Native HTML",
  summary: "Semantic single-choice option cards with a bold primary label and optional supporting text, backed by native radios.",
  owns: ["ef-choice-group", "ef-choice"],
  purpose: {
    description: "A choice group asks one question and offers a short list of mutually exclusive answers, each shown as a full-width card with a label and an optional description. It is a native `fieldset` with a `legend` and one `input type=\"radio\"` per `ef-choice` label; all radios share a `name`. Forma hides the native radio visually, draws its own round indicator, and fills the selected card. The browser owns selection, arrow keys, required validation, submission and reset. The same `ef-choice` card is reused with checkboxes by [[multi-choice]] and with media by [[image-choice]].",
    useWhen: [
      "One answer must be picked from two to about seven options.",
      "Each option benefits from a sentence of explanation.",
      "The question is part of a form, survey or setup flow where options should be compared in a vertical list."
    ],
    avoidWhen: [
      "The options are short modes that fit side by side: use [[segmented-control]].",
      "Several answers may be picked: use [[multi-choice]].",
      "The options are ordered agreement, frequency or rating steps: use [[ordinal-scale]].",
      "The answer is yes/no and Unanswered must stay distinct: use [[binary-choice]].",
      "There are many options or they come from data: use [[select]] or [[combobox]]."
    ],
    characteristics: [
      "Each card is the whole hit target and is at least 3.25rem tall.",
      "Selection is shown by a filled dot in the indicator plus an accent border and surface change, not by color alone.",
      "The native radio stays in the card, topmost for hit-testing, and carries focus, name and state.",
      "Cards stack vertically at every width; long text wraps inside the card."
    ]
  },
  examples: [
    {
      id: "validation-error",
      title: "Mission selection validation",
      description: "The user tried to continue without choosing a mission. The application renders a validation message after the options and links it to the fieldset with aria-describedby; the native required constraint still owns the missing selection.",
      html: `<ef-choice-group class="ef-component-tag">
  <fieldset class="ef-choice-group" aria-describedby="choice-group-validation-error-message">
    <legend class="ef-choice-group__legend">Which NASA mission should be the reference record?</legend>
    <label class="ef-choice">
      <input type="radio" name="choice-group-validation-error-mission" value="${apollo11.id}" required>
      <span class="ef-choice__content"><strong>${apollo11.name}</strong><span>${apollo11.highlight}.</span></span>
    </label>
    <label class="ef-choice">
      <input type="radio" name="choice-group-validation-error-mission" value="${sts31.id}">
      <span class="ef-choice__content"><strong>${sts31.name}</strong><span>${sts31.highlight}.</span></span>
    </label>
    <label class="ef-choice">
      <input type="radio" name="choice-group-validation-error-mission" value="${artemisI.id}">
      <span class="ef-choice__content"><strong>${artemisI.name}</strong><span>${artemisI.highlight}.</span></span>
    </label>
    <p class="ef-validation-message" id="choice-group-validation-error-message">
      <span class="ef-validation-message__mark" aria-hidden="true">!</span>
      Choose a reference mission before continuing.
    </p>
  </fieldset>
</ef-choice-group>`
    },
    {
      id: "unavailable-option",
      title: "Crew comparison with an unavailable mission",
      description: "Apollo 11 is preselected. Artemis I is natively disabled because this particular comparison requires a crewed mission; the description gives the domain reason rather than leaving the disabled card unexplained.",
      html: `<ef-choice-group class="ef-component-tag">
  <fieldset class="ef-choice-group">
    <legend class="ef-choice-group__legend">Crew manifest to compare</legend>
    <label class="ef-choice">
      <input type="radio" name="choice-group-unavailable-option-mission" value="${apollo11.id}" checked>
      <span class="ef-choice__content"><strong>${apollo11.name}</strong><span>${apollo11.crew.length} crew · ${apollo11.destination}</span></span>
    </label>
    <label class="ef-choice">
      <input type="radio" name="choice-group-unavailable-option-mission" value="${apollo8.id}">
      <span class="ef-choice__content"><strong>${apollo8.name}</strong><span>${apollo8.crew.length} crew · ${apollo8.destination}</span></span>
    </label>
    <label class="ef-choice">
      <input type="radio" name="choice-group-unavailable-option-mission" value="${artemisI.id}" disabled>
      <span class="ef-choice__content"><strong>${artemisI.name}</strong><span>Unavailable for crew comparison: this reference mission was uncrewed.</span></span>
    </label>
  </fieldset>
</ef-choice-group>`
    },
    {
      id: "mobile-long-options",
      title: "Mission highlights on a phone",
      description: "Real mission names and longer distinguishing facts stress the choice cards at phone width. Every card spans the width and grows taller as its text wraps.",
      mobile: {
        height: 440,
        notes: [
          "Cards are full-width grid rows; mission highlights wrap inside the card and the card grows in height, so nothing overflows at 320px.",
          "The indicator stays vertically centred at the inline start of each card, beside the wrapped text.",
          "Each card is a large touch target, and tapping anywhere on it selects the mission.",
          "There are no breakpoints: portrait or landscape only changes line lengths."
        ]
      },
      html: `<ef-choice-group class="ef-component-tag">
  <fieldset class="ef-choice-group">
    <legend class="ef-choice-group__legend">Mission highlight to feature</legend>
    <label class="ef-choice">
      <input type="radio" name="choice-group-mobile-long-options-highlight" value="${apollo11.id}">
      <span class="ef-choice__content"><strong>${apollo11.name}</strong><span>${apollo11.highlight}; launched ${apollo11.launchDate} aboard ${apollo11.launchVehicle}.</span></span>
    </label>
    <label class="ef-choice">
      <input type="radio" name="choice-group-mobile-long-options-highlight" value="${sts31.id}">
      <span class="ef-choice__content"><strong>${sts31.name}</strong><span>${sts31.highlight}; flew on ${sts31.spacecraft}.</span></span>
    </label>
  </fieldset>
</ef-choice-group>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "radio", default: "—", description: "Single choice uses radios. (Checkbox cards are documented on [[multi-choice]].)" },
      { name: "name", on: "input", values: "string", default: "—", description: "Shared by every radio in the group; unique per group on the page." },
      { name: "value", on: "input", values: "string", default: "\"on\"", description: "Submitted value for the chosen option." },
      { name: "required", on: "input", values: "boolean", default: "absent", description: "Native constraint on the group; set it on one radio." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Initial selection." },
      { name: "disabled", on: "input", values: "boolean", default: "absent", description: "Makes an option unselectable and dims its card." },
      { name: "aria-describedby", on: "fieldset", values: "id", default: "—", description: "Links guidance or a validation message to the whole group." }
    ],
    hooks: {
      "ef-choice-group": "The fieldset: border and padding reset, options stacked in a grid with a small gap.",
      "ef-choice-group__legend": "The question, set in bold at body size above the options.",
      "ef-choice": "One option card (a label): bordered, padded to make room for the drawn indicator, whole card clickable. Checked cards get an accent border and secondary surface.",
      "ef-choice__content": "Grid holding the bold primary label and the optional supporting text.",
      "ef-choice__media": "Media frame used by the `ef-choice--media` variant; see [[image-choice]].",
      "ef-choice--exclusive": "Dashed card border marking an exclusive option such as \"None of these\" in a checkbox set; see [[multi-choice]]. The application enforces exclusivity.",
      "ef-choice--media": "Two-column card with a 4:3 media frame beside the text, and no drawn indicator; stacks at 44rem and below. See [[image-choice]]."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves into the group (to the checked option, or the first) and out of it; the group is one tab stop." },
      { keys: "Arrow Down / Arrow Right", action: "Selects the next enabled option, wrapping at the end (native radio behavior)." },
      { keys: "Arrow Up / Arrow Left", action: "Selects the previous enabled option." },
      { keys: "Space", action: "Selects the focused option when none is selected." }
    ],
    events: [
      { name: "input / change", description: "Native events from the newly selected radio." },
      { name: "invalid", description: "Native event fired on a required radio when the form is submitted with no selection." }
    ],
    form: "Submits the selected option's name=value. `required` blocks submission until one option is chosen; form reset restores the initial selection."
  },
  states: [
    { name: "Unselected", how: "no checked attribute", description: "Empty round indicator and primary surface." },
    { name: "Selected", how: ":checked", description: "Filled dot in the indicator, accent border and secondary surface. Forced-colors mode uses Highlight and HighlightText." },
    { name: "Focus", how: ":focus-visible on the radio", description: "Two-tone focus ring around the card." },
    { name: "Disabled", how: "disabled attribute", description: "Card at reduced opacity with a not-allowed cursor; skipped by arrow keys." },
    { name: "Invalid (application)", how: "validation message linked with aria-describedby", description: "Forma has no invalid styling on the group; the application renders the message." }
  ],
  accessibility: {
    forma: [
      "Keeps native radios in each card, so role, group, position and arrow-key selection come from the platform.",
      "Makes the entire card the label, so the whole card is the click and touch target.",
      "Shows selection with a shape change (filled dot) in addition to border and surface color.",
      "Uses Highlight/HighlightText for the selected card in forced-colors mode and restates inner colors so text stays legible."
    ],
    consumer: [
      "Write the question in the legend; keep option labels short and put detail in the supporting text.",
      "Link validation or guidance to the fieldset with aria-describedby.",
      "Explain disabled options in their description.",
      "Keep option order meaningful but never let position imply a score or recommendation."
    ]
  },
  responsive: [
    "The group is a single-column grid at every width; cards fill the available width.",
    "Primary and supporting text wrap inside the card; cards grow in height and never force horizontal overflow.",
    "No breakpoints for plain cards. The `ef-choice--media` variant collapses from two columns to one at 44rem and below."
  ],
  motion: [
    "Card background, border and text color change by perceptual interpolation (`--ef-motion-perceptual-duration`, about 120ms). Nothing moves, and the selected state is applied immediately.",
    "Under `prefers-reduced-motion: reduce` the global reduction shortens the color transition to effectively instant."
  ],
  guidance: {
    do: [
      "Use a question in the legend and answers as parallel phrases.",
      "Preselect only when a safe default exists; otherwise leave all unchecked and use required."
    ],
    avoid: [
      "Nesting interactive elements such as links or buttons inside an option card; the whole card is a label.",
      "Relying on the accent color alone to show the selected option in custom themes."
    ]
  },
  related: [
    { slug: "multi-choice", note: "Same card with checkboxes, plus minimum/maximum and exclusive-option guidance." },
    { slug: "image-choice", note: "Same card with a media frame beside the text." },
    { slug: "segmented-control", note: "Use for short modes that fit side by side." },
    { slug: "ordinal-scale", note: "Use for ordered rating or agreement steps." },
    { slug: "binary-choice", note: "Use for yes/no answers where Unanswered stays distinct." }
  ]
};
