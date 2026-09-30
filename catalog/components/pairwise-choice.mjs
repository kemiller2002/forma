export default {
  name: "Pairwise choice",
  category: "assessment",
  behavior: "Native HTML",
  summary: "A focused two-alternative comparison using ordinary choice semantics.",
  owns: ["ef-pairwise"],
  purpose: {
    description: "A pairwise choice asks the user to pick one of two described alternatives, shown side by side as large cards with an \"or\" between them. It is a native radio group: both cards are labels with visually hidden radios, so the browser owns selection, keyboard movement and required validation. The \"Option A / Option B\" eyebrow and the \"or\" separator are presentation; the application decides how many pairs to show, in which order, and what a preference means.",
    useWhen: [
      "A decision or prioritisation exercise compares two alternatives at a time.",
      "Each alternative needs a title and a short description to be understood.",
      "A series of pairwise comparisons is used to derive an overall preference."
    ],
    avoidWhen: [
      "The question is yes/no or true/false: use [[binary-choice]].",
      "There are three or more alternatives: use [[choice-group]] or [[best-worst]].",
      "The user must order all alternatives: use [[ranking]].",
      "The strength of preference matters: use an [[ordinal-scale]] or [[semantic-differential]] between the two."
    ],
    characteristics: [
      "Two equal-width cards with an auto-width separator column.",
      "The whole card is the click and touch target (minimum 5rem tall).",
      "The separator is `aria-hidden`; the radio group semantics communicate that only one can be chosen.",
      "Cards stack vertically below 44rem with the separator centred between them."
    ]
  },
  examples: [
    {
      id: "option-b-selected",
      title: "Second option chosen",
      description: "Comparison 4 of 10 in a prioritisation exercise with Option B selected. The selected card takes the inverse surface.",
      html: `<ef-pairwise-choice class="ef-component-tag">
  <fieldset class="ef-pairwise" aria-describedby="pairwise-selected-position">
    <legend class="ef-pairwise__legend">Which should the platform team invest in next quarter?</legend>
    <p class="ef-field__description" id="pairwise-selected-position">Comparison 4 of 10</p>
    <div class="ef-pairwise__options">
      <label class="ef-pairwise__option">
        <input type="radio" name="pairwise-selected-investment" value="observability" required>
        <span class="ef-pairwise__eyebrow">Option A</span>
        <strong>Observability</strong>
        <span>Unified tracing and log search across all services.</span>
      </label>
      <span class="ef-pairwise__versus" aria-hidden="true">or</span>
      <label class="ef-pairwise__option">
        <input type="radio" name="pairwise-selected-investment" value="self-service" checked>
        <span class="ef-pairwise__eyebrow">Option B</span>
        <strong>Self-service environments</strong>
        <span>Teams create preview environments without a ticket.</span>
      </label>
    </div>
  </fieldset>
</ef-pairwise-choice>`
    },
    {
      id: "no-preference",
      title: "Comparison with a No preference answer",
      description: "When a tie is a legitimate answer, it is offered as a special choice sharing the radio name, below the two cards rather than as a third card between them.",
      html: `<ef-pairwise-choice class="ef-component-tag">
  <fieldset class="ef-pairwise">
    <legend class="ef-pairwise__legend">Which matters more for this service?</legend>
    <div class="ef-pairwise__options">
      <label class="ef-pairwise__option">
        <input type="radio" name="pairwise-tie-priority" value="latency" required>
        <span class="ef-pairwise__eyebrow">Option A</span>
        <strong>Low latency</strong>
        <span>Responses under 100ms at the 99th percentile.</span>
      </label>
      <span class="ef-pairwise__versus" aria-hidden="true">or</span>
      <label class="ef-pairwise__option">
        <input type="radio" name="pairwise-tie-priority" value="cost">
        <span class="ef-pairwise__eyebrow">Option B</span>
        <strong>Low running cost</strong>
        <span>Stay within the current infrastructure budget.</span>
      </label>
    </div>
    <div class="ef-special-choices" aria-label="Other responses">
      <label class="ef-special-choice"><input type="radio" name="pairwise-tie-priority" value="no-preference"><span>No preference</span></label>
    </div>
  </fieldset>
</ef-pairwise-choice>`
    },
    {
      id: "mobile-stacked",
      title: "Stacked comparison on a phone",
      description: "Below 44rem the cards stack full width with the separator centred between them.",
      mobile: {
        height: 420,
        notes: [
          "The three-column grid becomes one column: Option A, the \"or\" separator, then Option B, preserving source order.",
          "Both cards take the full width, so long titles and descriptions wrap rather than truncate.",
          "Each card keeps its 5rem minimum height; the entire card is the tap target.",
          "Nothing scrolls horizontally at 320px, in portrait or landscape."
        ]
      },
      html: `<ef-pairwise-choice class="ef-component-tag">
  <fieldset class="ef-pairwise">
    <legend class="ef-pairwise__legend">Which would you rather have?</legend>
    <div class="ef-pairwise__options">
      <label class="ef-pairwise__option">
        <input type="radio" name="pairwise-mobile-tradeoff" value="fewer-meetings" required>
        <span class="ef-pairwise__eyebrow">Option A</span>
        <strong>Fewer meetings</strong>
        <span>Two meeting-free days each week.</span>
      </label>
      <span class="ef-pairwise__versus" aria-hidden="true">or</span>
      <label class="ef-pairwise__option">
        <input type="radio" name="pairwise-mobile-tradeoff" value="faster-reviews">
        <span class="ef-pairwise__eyebrow">Option B</span>
        <strong>Faster reviews</strong>
        <span>Code reviews answered within four working hours.</span>
      </label>
    </div>
  </fieldset>
</ef-pairwise-choice>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "radio", default: "—", description: "Required. Two radios sharing one name." },
      { name: "name", on: "input", values: "string", default: "—", description: "Groups the two alternatives. Unique per comparison." },
      { name: "value", on: "input", values: "string", default: "—", description: "Submitted choice. The application derives preferences; Forma attaches no meaning to A or B." },
      { name: "required", on: "first input", values: "boolean", default: "absent", description: "Native required-group validation." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Restores a saved choice." },
      { name: "aria-hidden", on: ".ef-pairwise__versus", values: "true", default: "—", description: "Keeps the decorative \"or\" out of the accessibility tree." },
      { name: "aria-describedby", on: "fieldset", values: "id list", default: "—", description: "Associates help text such as the comparison position." }
    ],
    hooks: {
      "ef-pairwise": "Root fieldset with browser border and padding removed.",
      "ef-pairwise__legend": "Comparison question.",
      "ef-pairwise__options": "Three-column grid: option, separator, option. One column below 44rem.",
      "ef-pairwise__option": "Bordered card label with a visually hidden radio; at least 5rem tall.",
      "ef-pairwise__eyebrow": "Small uppercase monospace label such as Option A.",
      "ef-pairwise__versus": "The decorative \"or\" separator."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus into and out of the comparison." },
      { keys: "Arrow keys", action: "Native radio behavior: switches and selects between the two alternatives (and any shared special answer)." },
      { keys: "Space", action: "Selects the focused alternative when none is checked." }
    ],
    events: [
      { name: "input / change", description: "Native events from the checked radio." }
    ],
    form: "Submits name=value for the chosen alternative; unanswered submits nothing and fails required validation."
  },
  states: [
    { name: "Unanswered", how: "no checked radio", description: "Both cards neutral." },
    { name: "Selected", how: ":checked", description: "The chosen card takes the inverse surface." },
    { name: "Focus", how: ":focus-visible on the radio", description: "Two-tone focus ring around the card." }
  ],
  accessibility: {
    forma: [
      "Uses a native radio group in a fieldset, so the question and the exclusive choice are announced by the platform.",
      "Makes each card's full area the target and keeps the title and description inside the label.",
      "Uses Highlight/HighlightText for the selected card in forced-colors mode."
    ],
    consumer: [
      "Keep the accessible name meaningful: the card's strong title is read as part of the label, so do not rely on the eyebrow alone.",
      "Randomise or balance A/B order in application logic if position bias matters.",
      "Announce progress through a series of comparisons with visible text or [[survey-progress]]."
    ]
  },
  responsive: [
    "Wide: `minmax(0, 1fr) auto minmax(0, 1fr)` keeps the two cards equal regardless of text length.",
    "Below 44rem: one column with the separator centred.",
    "Card text wraps; there is no horizontal overflow."
  ],
  motion: [
    "No animation: the selected card switches surface immediately. The pairwise card is not in the shared transitioned option list."
  ],
  guidance: {
    do: [
      "Give both alternatives parallel titles and descriptions of similar length.",
      "Offer No preference as a [[special-choice]] when ties are allowed."
    ],
    avoid: [
      "Styling one option as the recommended default.",
      "Using pairwise comparison for yes/no questions."
    ]
  },
  related: [
    { slug: "binary-choice", note: "For yes/no or true/false answers rather than two described alternatives." },
    { slug: "best-worst", note: "Compares several items at once by picking the strongest and weakest." },
    { slug: "choice-group", note: "For choosing one of three or more options." }
  ]
};
