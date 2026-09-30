export default {
  name: "Single-choice matrix",
  category: "assessment",
  behavior: "Native HTML",
  summary: "Repeated single-choice scales arranged as a matrix while retaining per-row radio semantics.",
  owns: ["ef-matrix"],
  purpose: {
    description: "A single-choice matrix asks the same scale question about several items. It looks like a table, but it is built from nested fieldsets: the outer fieldset names the whole set and each row is its own fieldset with its own radio group. Screen readers therefore announce the row prompt and the choice label for every radio, and each row validates independently. On narrow screens the rows decompose into ordinary stacked controls rather than relying on horizontal scrolling.",
    useWhen: [
      "Several items are rated on the same short scale, such as maturity per practice or satisfaction per feature.",
      "Each row is an independent required or optional answer.",
      "Users benefit from comparing their answers across rows at a glance on wide screens."
    ],
    avoidWhen: [
      "There is only one item: use [[ordinal-scale]].",
      "Rows need different scales or long option descriptions: use separate [[question]] shells.",
      "The data is read-only and tabular: use [[data-grid]] or [[comparison-grid]].",
      "Items must be ordered relative to each other rather than rated independently: use [[ranking]]."
    ],
    characteristics: [
      "One `name` per row; rows never share a radio group.",
      "Each row's legend is floated into the first grid column so the row reads as prompt then choices.",
      "Choice labels are repeated in every row, so no column header is needed for assistive technology.",
      "Below 44rem each row becomes a vertical list of full-width choices."
    ]
  },
  examples: [
    {
      id: "partially-answered",
      title: "Partially answered with a row error",
      description: "Three satisfaction rows after an attempted submit. Two are answered; the unanswered row has aria-invalid and a validation message referenced from its fieldset.",
      html: `<ef-matrix-single class="ef-component-tag">
  <fieldset class="ef-matrix">
    <legend class="ef-matrix__legend">How satisfied are you with each tool?</legend>
    <div class="ef-matrix__rows">
      <fieldset class="ef-matrix__row">
        <legend>Issue tracker</legend>
        <div class="ef-matrix__choices">
          <label><input type="radio" name="matrix-partial-tracker" value="1" required><span>Unsatisfied</span></label>
          <label><input type="radio" name="matrix-partial-tracker" value="2"><span>Neutral</span></label>
          <label><input type="radio" name="matrix-partial-tracker" value="3" checked><span>Satisfied</span></label>
        </div>
      </fieldset>
      <fieldset class="ef-matrix__row" aria-describedby="matrix-partial-ci-error">
        <legend>Continuous integration</legend>
        <div class="ef-matrix__choices">
          <label><input type="radio" name="matrix-partial-ci" value="1" required aria-invalid="true"><span>Unsatisfied</span></label>
          <label><input type="radio" name="matrix-partial-ci" value="2" aria-invalid="true"><span>Neutral</span></label>
          <label><input type="radio" name="matrix-partial-ci" value="3" aria-invalid="true"><span>Satisfied</span></label>
        </div>
      </fieldset>
      <p class="ef-validation-message" id="matrix-partial-ci-error">
        <span class="ef-validation-message__mark" aria-hidden="true">!</span>
        Rate continuous integration before continuing.
      </p>
      <fieldset class="ef-matrix__row">
        <legend>Chat</legend>
        <div class="ef-matrix__choices">
          <label><input type="radio" name="matrix-partial-chat" value="1" required checked><span>Unsatisfied</span></label>
          <label><input type="radio" name="matrix-partial-chat" value="2"><span>Neutral</span></label>
          <label><input type="radio" name="matrix-partial-chat" value="3"><span>Satisfied</span></label>
        </div>
      </fieldset>
    </div>
  </fieldset>
</ef-matrix-single>`
    },
    {
      id: "long-row-prompts",
      title: "Long row prompts with Not applicable",
      description: "Row prompts that wrap over several lines, and a fifth Not applicable column that is a real answer in each row. The prompt column keeps a 10rem minimum and wraps.",
      html: `<ef-matrix-single class="ef-component-tag">
  <fieldset class="ef-matrix">
    <legend class="ef-matrix__legend">How consistently does your team follow these practices?</legend>
    <p class="ef-field__description">Choose Not applicable only when the practice does not apply to your service.</p>
    <div class="ef-matrix__rows">
      <fieldset class="ef-matrix__row">
        <legend>Every schema migration is reviewed and has a tested rollback path</legend>
        <div class="ef-matrix__choices">
          <label><input type="radio" name="matrix-long-migrations" value="never" required><span>Never</span></label>
          <label><input type="radio" name="matrix-long-migrations" value="sometimes"><span>Sometimes</span></label>
          <label><input type="radio" name="matrix-long-migrations" value="usually"><span>Usually</span></label>
          <label><input type="radio" name="matrix-long-migrations" value="always"><span>Always</span></label>
          <label><input type="radio" name="matrix-long-migrations" value="na"><span>Not applicable</span></label>
        </div>
      </fieldset>
      <fieldset class="ef-matrix__row">
        <legend>Feature flags older than 90 days are removed or made permanent</legend>
        <div class="ef-matrix__choices">
          <label><input type="radio" name="matrix-long-flags" value="never" required><span>Never</span></label>
          <label><input type="radio" name="matrix-long-flags" value="sometimes"><span>Sometimes</span></label>
          <label><input type="radio" name="matrix-long-flags" value="usually"><span>Usually</span></label>
          <label><input type="radio" name="matrix-long-flags" value="always"><span>Always</span></label>
          <label><input type="radio" name="matrix-long-flags" value="na"><span>Not applicable</span></label>
        </div>
      </fieldset>
    </div>
  </fieldset>
</ef-matrix-single>`
    },
    {
      id: "mobile-decomposed",
      title: "Matrix decomposed on a phone",
      description: "At phone width each row becomes a stacked list of choices under its own prompt; no horizontal scrolling is required.",
      mobile: {
        height: 620,
        notes: [
          "Below 44rem the row grid becomes one column: the row prompt sits above its choices.",
          "Choices switch from columns to a single vertical list; each choice is a full-width 44px-tall row with left-aligned text.",
          "Rows stay separate bordered groups, so it remains clear which choices belong to which item.",
          "There is no horizontal scroll at 320px; adding columns lengthens the list instead."
        ]
      },
      html: `<ef-matrix-single class="ef-component-tag">
  <fieldset class="ef-matrix">
    <legend class="ef-matrix__legend">Rate each capability.</legend>
    <div class="ef-matrix__rows">
      <fieldset class="ef-matrix__row">
        <legend>Alerting</legend>
        <div class="ef-matrix__choices">
          <label><input type="radio" name="matrix-mobile-alerting" value="1" required><span>Initial</span></label>
          <label><input type="radio" name="matrix-mobile-alerting" value="2"><span>Developing</span></label>
          <label><input type="radio" name="matrix-mobile-alerting" value="3"><span>Established</span></label>
        </div>
      </fieldset>
      <fieldset class="ef-matrix__row">
        <legend>Runbooks</legend>
        <div class="ef-matrix__choices">
          <label><input type="radio" name="matrix-mobile-runbooks" value="1" required><span>Initial</span></label>
          <label><input type="radio" name="matrix-mobile-runbooks" value="2" checked><span>Developing</span></label>
          <label><input type="radio" name="matrix-mobile-runbooks" value="3"><span>Established</span></label>
        </div>
      </fieldset>
    </div>
  </fieldset>
</ef-matrix-single>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "radio", default: "—", description: "Required. One radio per choice in each row." },
      { name: "name", on: "input", values: "string unique per row", default: "—", description: "Each row has its own name, so each row is its own exclusive answer." },
      { name: "value", on: "input", values: "string", default: "—", description: "Submitted value for the row. Meaning and scoring stay in the application." },
      { name: "required", on: "first input of a row", values: "boolean", default: "absent", description: "Makes that row's answer required; rows validate independently." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Restores a saved row answer." },
      { name: "aria-invalid", on: "inputs of a row", values: "true", default: "absent", description: "Set by the application on a row that failed validation." },
      { name: "aria-describedby", on: "row fieldset", values: "id of an error or help element", default: "—", description: "Associates a row-level error or help text with that row." }
    ],
    hooks: {
      "ef-matrix": "Outer fieldset for the whole set, with browser border and padding removed.",
      "ef-matrix__legend": "Question text for the whole matrix.",
      "ef-matrix__rows": "Grid stacking the rows with a small gap.",
      "ef-matrix__row": "Bordered fieldset for one item: prompt column plus choices column. Its legend is floated into the first column.",
      "ef-matrix__choices": "Equal columns of at least 5rem for the row's choices; each label is a bordered 44px-tall cell and the radio is visually hidden."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves from one row's radio group to the next; each row is one tab stop." },
      { keys: "Arrow keys", action: "Moves and selects within the current row only." },
      { keys: "Space", action: "Selects the focused choice when the row is unanswered." }
    ],
    events: [
      { name: "input / change", description: "Native events from each row's radio group." }
    ],
    form: "Every row submits its own name=value. Unanswered rows submit nothing; required rows block submission independently."
  },
  states: [
    { name: "Unanswered row", how: "no checked radio in the row", description: "All cells neutral." },
    { name: "Selected", how: ":checked", description: "The chosen cell takes the inverse surface." },
    { name: "Focus", how: ":focus-visible on the radio", description: "Two-tone focus ring around the cell." },
    { name: "Invalid row", how: "aria-invalid plus an application message", description: "Forma adds no row error styling; render a [[validation-message]] and reference it from the row." }
  ],
  accessibility: {
    forma: [
      "Keeps every row as its own fieldset with a legend, so the row prompt is announced with each radio.",
      "Repeats choice text in every cell, avoiding reliance on a visual column header.",
      "Decomposes to ordinary stacked controls at narrow widths instead of forcing horizontal scroll.",
      "Uses Highlight/HighlightText for the checked cell in forced-colors mode."
    ],
    consumer: [
      "Give each row a unique radio name.",
      "Keep choice labels short; long descriptions do not fit matrix cells.",
      "Associate row errors with the row fieldset and summarise multiple errors with [[validation-summary]]."
    ]
  },
  responsive: [
    "Wide: each row is a grid of `minmax(10rem, 1.1fr)` for the prompt and `minmax(0, 3fr)` for the choices.",
    "Choice columns are at least 5rem; many choices on a medium width can crowd, so keep scales short.",
    "Below 44rem the row becomes one column and the choices become a vertical list of full-width cells.",
    "Row prompts and choice text wrap; there is no horizontal scrolling path."
  ],
  motion: [
    "No animation beyond native state: the checked cell switches surface immediately. Cells are not part of the shared transitioned option families."
  ],
  guidance: {
    do: [
      "Use the same choices in the same order for every row.",
      "Keep the number of rows modest and group long sets into sections."
    ],
    avoid: [
      "Sharing one radio name across rows.",
      "Replacing the per-cell labels with a single header row."
    ]
  },
  related: [
    { slug: "ordinal-scale", note: "One scale question; the matrix repeats a scale across items." },
    { slug: "comparison-grid", note: "For read-only comparisons, not answer entry." },
    { slug: "question", note: "Frame the matrix in a question shell when it is part of a numbered flow." }
  ]
};
