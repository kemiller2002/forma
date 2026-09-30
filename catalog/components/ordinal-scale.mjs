export default {
  name: "Ordinal scale",
  category: "assessment",
  behavior: "Native HTML",
  summary: "One radio-backed contract for ordered Likert, agreement, confidence, frequency, and similar scales.",
  owns: ["ef-ordinal-scale", "ef-ordinal-option"],
  purpose: {
    description: "An ordinal scale asks the user to pick one position on an ordered set of 3 to 11 answers. It is a native radio group inside a fieldset; each option shows a numbered marker and a text label, and the options form one continuous bordered row. Likert, agreement, frequency, confidence, maturity and NPS are label presets over this single structure, not separate components. Forma attaches no score or direction to position: the application maps each value to meaning.",
    useWhen: [
      "The answers are ordered steps such as Strongly disagree to Strongly agree, Never to Always, or 0 to 10.",
      "Every position needs its own visible or programmatic label.",
      "Don't know or Not applicable must be offered without becoming extra points on the scale."
    ],
    avoidWhen: [
      "There are only two opposite answers: use [[binary-choice]].",
      "Only the two endpoints carry meaning and the middle positions are unlabelled: use [[semantic-differential]].",
      "The answers are unordered categories: use [[choice-group]].",
      "The value is continuous or has many steps: use [[slider]] or [[numeric-stepper]].",
      "Several items share the same scale: use [[matrix-single]] so each row stays its own group."
    ],
    characteristics: [
      "Cardinality modifiers (`--3`, `--4`, `--5`, `--6`, `--7`, `--10`, `--11`) set the column count; the default is five.",
      "Special answers live in `.ef-special-choices` below a dashed rule and may share the radio name.",
      "Options become a vertical list of full-width rows below 44rem, so labels never have to shrink to fit.",
      "Even-point scales have no implied midpoint; visual order does not imply score."
    ]
  },
  examples: [
    {
      id: "nps-eleven-point",
      title: "0 to 10 likelihood (NPS-style)",
      description: "An eleven-point presentation using the --11 modifier. Only the endpoints have visible words; the middle positions carry their number as screen-reader text because the marker is decorative.",
      html: `<ef-ordinal-scale class="ef-component-tag">
  <fieldset class="ef-ordinal-scale ef-ordinal-scale--11">
    <legend class="ef-ordinal-scale__legend">How likely are you to recommend this service to a colleague?</legend>
    <div class="ef-ordinal-scale__options">
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-nps-recommend" value="0" required><span class="ef-ordinal-option__marker" aria-hidden="true">0</span><span class="ef-ordinal-option__label"><span class="ef-sr-only">0, </span>Not at all likely</span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-nps-recommend" value="1"><span class="ef-ordinal-option__marker" aria-hidden="true">1</span><span class="ef-ordinal-option__label"><span class="ef-sr-only">1</span></span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-nps-recommend" value="2"><span class="ef-ordinal-option__marker" aria-hidden="true">2</span><span class="ef-ordinal-option__label"><span class="ef-sr-only">2</span></span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-nps-recommend" value="3"><span class="ef-ordinal-option__marker" aria-hidden="true">3</span><span class="ef-ordinal-option__label"><span class="ef-sr-only">3</span></span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-nps-recommend" value="4"><span class="ef-ordinal-option__marker" aria-hidden="true">4</span><span class="ef-ordinal-option__label"><span class="ef-sr-only">4</span></span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-nps-recommend" value="5"><span class="ef-ordinal-option__marker" aria-hidden="true">5</span><span class="ef-ordinal-option__label"><span class="ef-sr-only">5</span></span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-nps-recommend" value="6"><span class="ef-ordinal-option__marker" aria-hidden="true">6</span><span class="ef-ordinal-option__label"><span class="ef-sr-only">6</span></span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-nps-recommend" value="7"><span class="ef-ordinal-option__marker" aria-hidden="true">7</span><span class="ef-ordinal-option__label"><span class="ef-sr-only">7</span></span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-nps-recommend" value="8"><span class="ef-ordinal-option__marker" aria-hidden="true">8</span><span class="ef-ordinal-option__label"><span class="ef-sr-only">8</span></span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-nps-recommend" value="9"><span class="ef-ordinal-option__marker" aria-hidden="true">9</span><span class="ef-ordinal-option__label"><span class="ef-sr-only">9</span></span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-nps-recommend" value="10"><span class="ef-ordinal-option__marker" aria-hidden="true">10</span><span class="ef-ordinal-option__label"><span class="ef-sr-only">10, </span>Extremely likely</span></label>
    </div>
  </fieldset>
</ef-ordinal-scale>`
    },
    {
      id: "four-point-maturity",
      title: "Four-point maturity with a saved answer",
      description: "An even scale with no midpoint, restored from a saved draft with Established checked. The labels are a maturity preset over the same structure, not a separate component.",
      html: `<ef-ordinal-scale class="ef-component-tag">
  <fieldset class="ef-ordinal-scale ef-ordinal-scale--4">
    <legend class="ef-ordinal-scale__legend">How mature is incident post-review in your team?</legend>
    <div class="ef-ordinal-scale__options">
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-maturity-review" value="initial" required><span class="ef-ordinal-option__marker" aria-hidden="true">1</span><span class="ef-ordinal-option__label">Initial</span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-maturity-review" value="developing"><span class="ef-ordinal-option__marker" aria-hidden="true">2</span><span class="ef-ordinal-option__label">Developing</span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-maturity-review" value="established" checked><span class="ef-ordinal-option__marker" aria-hidden="true">3</span><span class="ef-ordinal-option__label">Established</span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-maturity-review" value="optimized"><span class="ef-ordinal-option__marker" aria-hidden="true">4</span><span class="ef-ordinal-option__label">Optimized</span></label>
    </div>
  </fieldset>
</ef-ordinal-scale>`
    },
    {
      id: "frequency-with-disabled-option",
      title: "Frequency scale with one unavailable position",
      description: "A three-point frequency scale where the application has disabled one position that does not apply to this respondent, with a description saying why. Heavy motion weight gives the marker press a slower, more settled response.",
      html: `<ef-ordinal-scale class="ef-component-tag">
  <fieldset class="ef-ordinal-scale ef-ordinal-scale--3" data-ef-motion-weight="heavy" aria-describedby="ordinal-frequency-help">
    <legend class="ef-ordinal-scale__legend">How often do you deploy on weekends?</legend>
    <p class="ef-field__description" id="ordinal-frequency-help">Weekly is unavailable because weekend deploys are frozen for your team.</p>
    <div class="ef-ordinal-scale__options">
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-frequency-weekend" value="never" required><span class="ef-ordinal-option__marker" aria-hidden="true">1</span><span class="ef-ordinal-option__label">Never</span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-frequency-weekend" value="monthly"><span class="ef-ordinal-option__marker" aria-hidden="true">2</span><span class="ef-ordinal-option__label">About once a month</span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-frequency-weekend" value="weekly" disabled><span class="ef-ordinal-option__marker" aria-hidden="true">3</span><span class="ef-ordinal-option__label">Weekly</span></label>
    </div>
  </fieldset>
</ef-ordinal-scale>`
    },
    {
      id: "mobile-seven-point",
      title: "Seven-point agreement on a phone",
      description: "A seven-point scale with Not applicable at phone width. Options stack into a vertical list with the marker beside the label.",
      mobile: {
        height: 640,
        notes: [
          "Below 44rem every cardinality collapses to one column; each option becomes a 52px-tall row with the marker at the start and the label beside it.",
          "Dividers switch from vertical to horizontal between rows, preserving the order top to bottom.",
          "Long labels wrap within the row instead of being squeezed into narrow columns.",
          "The special-choices row wraps its pills onto new lines if needed; each keeps a 44px minimum height."
        ]
      },
      html: `<ef-ordinal-scale class="ef-component-tag">
  <fieldset class="ef-ordinal-scale ef-ordinal-scale--7">
    <legend class="ef-ordinal-scale__legend">Our on-call rotation is sustainable.</legend>
    <div class="ef-ordinal-scale__options">
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-mobile-oncall" value="1" required><span class="ef-ordinal-option__marker" aria-hidden="true">1</span><span class="ef-ordinal-option__label">Strongly disagree</span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-mobile-oncall" value="2"><span class="ef-ordinal-option__marker" aria-hidden="true">2</span><span class="ef-ordinal-option__label">Disagree</span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-mobile-oncall" value="3"><span class="ef-ordinal-option__marker" aria-hidden="true">3</span><span class="ef-ordinal-option__label">Somewhat disagree</span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-mobile-oncall" value="4"><span class="ef-ordinal-option__marker" aria-hidden="true">4</span><span class="ef-ordinal-option__label">Neither agree nor disagree</span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-mobile-oncall" value="5"><span class="ef-ordinal-option__marker" aria-hidden="true">5</span><span class="ef-ordinal-option__label">Somewhat agree</span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-mobile-oncall" value="6"><span class="ef-ordinal-option__marker" aria-hidden="true">6</span><span class="ef-ordinal-option__label">Agree</span></label>
      <label class="ef-ordinal-option"><input type="radio" name="ordinal-mobile-oncall" value="7"><span class="ef-ordinal-option__marker" aria-hidden="true">7</span><span class="ef-ordinal-option__label">Strongly agree</span></label>
    </div>
    <div class="ef-special-choices" aria-label="Other responses">
      <label class="ef-special-choice"><input type="radio" name="ordinal-mobile-oncall" value="na"><span>Not applicable: I am not on call</span></label>
    </div>
  </fieldset>
</ef-ordinal-scale>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "radio", default: "—", description: "Required. One radio per scale position." },
      { name: "name", on: "input", values: "string shared by all positions", default: "—", description: "Groups the positions (and any special choices) into one exclusive answer. Unique per question." },
      { name: "value", on: "input", values: "string", default: "—", description: "Submitted value. The application maps values to meaning and scoring; visual order carries none." },
      { name: "required", on: "first input", values: "boolean", default: "absent", description: "Native required-group validation." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Restores a saved answer." },
      { name: "disabled", on: "input or fieldset", values: "boolean", default: "absent", description: "Removes a position (or the whole scale) from focus and submission and dims it." },
      { name: "aria-hidden", on: ".ef-ordinal-option__marker", values: "true", default: "—", description: "The numbered marker is decorative; the label supplies the accessible name." },
      { name: "aria-label", on: ".ef-special-choices", values: "string", default: "—", description: "Names the group of non-scale answers, for example Other responses." },
      { name: "aria-describedby", on: "fieldset", values: "id list", default: "—", description: "Associates help or error text with the scale." }
    ],
    hooks: {
      "ef-ordinal-scale": "Root fieldset. Browser border and padding removed; it is also a motion scope.",
      "ef-ordinal-scale__legend": "Question or statement text above the options.",
      "ef-ordinal-scale__options": "Bordered grid holding the positions. Column count comes from the cardinality modifier.",
      "ef-ordinal-scale--3": "Three equal columns.",
      "ef-ordinal-scale--4": "Four equal columns (no midpoint).",
      "ef-ordinal-scale--5": "Five equal columns. Also the default when no modifier is set.",
      "ef-ordinal-scale--6": "Six equal columns.",
      "ef-ordinal-scale--7": "Seven equal columns.",
      "ef-ordinal-scale--10": "Ten equal columns.",
      "ef-ordinal-scale--11": "Eleven equal columns, for 0 to 10 scales.",
      "ef-ordinal-option": "Label for one position: marker above label, at least 5.5rem tall on wide screens. The radio is visually hidden but stays the hit and focus target.",
      "ef-ordinal-option__marker": "Circular numbered marker. It compresses slightly while pressed; the option does not move.",
      "ef-ordinal-option__label": "Text label for the position. Wraps anywhere to fit narrow columns.",
      "data-ef-motion-weight": "Presentation-only perceived mass for the marker press response: light (default for this scope), standard or heavy. Never encodes importance or score."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus into the group (checked radio, or the first when unanswered) and out of it." },
      { keys: "Arrow keys", action: "Native radio behavior: moves to and selects the previous or next position, including special choices that share the name." },
      { keys: "Space", action: "Selects the focused position when none is checked." }
    ],
    events: [
      { name: "input / change", description: "Native events from the radio that becomes checked." }
    ],
    form: "Submits name=value for the checked position or special choice. Unanswered submits nothing and fails required validation; reset restores the initial checked state."
  },
  states: [
    { name: "Unanswered", how: "no checked radio", description: "All positions show the neutral surface." },
    { name: "Hover", how: ":hover on the option", description: "The option surface shifts to the secondary surface." },
    { name: "Pressed", how: ":active on the radio", description: "The marker scales to 0.92; the option hit target stays put." },
    { name: "Selected", how: ":checked", description: "The option takes the inverse surface and the marker fills with the accent color." },
    { name: "Focus", how: ":focus-visible on the radio", description: "Two-tone focus ring around the option." },
    { name: "Disabled", how: "disabled attribute", description: "Option at reduced opacity with a not-allowed cursor; skipped by keyboard and not submitted." }
  ],
  accessibility: {
    forma: [
      "Uses one native radio group in a fieldset with a legend, so the group name, position count and checked state come from the platform.",
      "Keeps special answers visibly separated from the continuum so they are not mistaken for scale points.",
      "Indicates selection with surface inversion plus a filled marker, and with Highlight/HighlightText in forced-colors mode.",
      "Stacks options at narrow widths instead of shrinking touch targets."
    ],
    consumer: [
      "Give every position an accessible label; if only endpoints have visible words, add screen-reader text to the middle positions.",
      "Map values to meaning and scoring in application logic; do not rely on order.",
      "Keep the radio name unique per question and share it with special choices only when they are mutually exclusive with the scale.",
      "Explain disabled positions in visible text."
    ]
  },
  responsive: [
    "Wide: equal `minmax(0, 1fr)` columns set by the cardinality modifier; labels wrap anywhere inside each column.",
    "Below 44rem: one column for every cardinality; options become horizontal rows with a 3.25rem minimum height.",
    "Special choices wrap as a flex row with a 0.5rem gap.",
    "Ten and eleven point scales are tight on medium widths; prefer short or visually hidden labels for middle positions."
  ],
  motion: [
    "Option surface, border and text color use the shared perceptual interpolation (about 120ms), identical for every position so motion never encodes value.",
    "The marker compresses to 0.92 scale on press using the press duration from the scale's motion scope; `data-ef-motion-weight` changes that duration. The option itself never moves.",
    "Selection is immediate: rapid keyboard changes do not queue animations.",
    "Under `prefers-reduced-motion: reduce` the marker transition is effectively instant and press compression is removed; selection styling is unchanged."
  ],
  guidance: {
    do: [
      "Use parallel, balanced labels and the modifier that matches the number of positions.",
      "Offer Don't know and Not applicable as [[special-choice]] answers when they are meaningful."
    ],
    avoid: [
      "Creating separate components for Likert, NPS or agreement presets.",
      "Coloring positions red to green or otherwise implying which end is good."
    ]
  },
  related: [
    { slug: "special-choice", note: "Holds non-scale answers such as Don't know outside the continuum." },
    { slug: "semantic-differential", note: "Use when only the two opposite endpoints are labelled." },
    { slug: "matrix-single", note: "Repeats one scale across several items, one radio group per row." },
    { slug: "symbol-rating", note: "Use for star or icon ratings with textual meaning per symbol." },
    { slug: "slider", note: "Use for many-step or continuous numeric values." }
  ]
};
