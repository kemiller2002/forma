export default {
  name: "Binary choice",
  category: "assessment",
  behavior: "Native HTML",
  summary: "A two-option radio-backed answer that preserves Unanswered as distinct from false.",
  owns: ["ef-binary-choice", "ef-binary-option"],
  purpose: {
    description: "Binary choice answers a yes/no, true/false or agree/disagree question with two native radios in one group. Because no radio starts checked, an untouched question stays Unanswered and submits nothing, which is different from an explicit No. The options render as a joined segmented bar; the checked option takes the inverse surface. The browser owns selection, arrow-key movement, required validation and reset.",
    useWhen: [
      "An assessment or survey asks a yes/no question and Unanswered must remain distinguishable from No.",
      "A question has two (or a small bounded number of) mutually exclusive answers with short labels.",
      "The answer is recorded on submit rather than applied immediately."
    ],
    avoidWhen: [
      "The control is an on/off setting that takes effect immediately: use [[switch]].",
      "The user is confirming consent or ticking an independent item: use [[checkbox]].",
      "The options are ordered steps on a scale: use [[ordinal-scale]].",
      "Options need descriptions or long labels: use [[choice-group]] cards."
    ],
    characteristics: [
      "Two native radios sharing a `name`; the group is announced by the fieldset legend.",
      "Unanswered is the absence of a checked radio, not a third value.",
      "Options sit side by side on wide screens and stack into full-width rows below 44rem.",
      "Selection is shown by an inverse surface and, in forced colors, system Highlight."
    ]
  },
  examples: [
    {
      id: "true-false-with-unknown",
      title: "True/false with a Don't know answer",
      description: "A knowledge check where Don't know is a legitimate answer. It shares the radio name so it is mutually exclusive, but sits in the separate special-choices row so it is not read as a third point on the true/false axis.",
      html: `<ef-binary-choice class="ef-component-tag">
  <fieldset class="ef-binary-choice">
    <legend class="ef-binary-choice__legend">Backups are encrypted at rest in every region.</legend>
    <div class="ef-binary-choice__options">
      <label class="ef-binary-option"><input type="radio" name="binary-unknown-encryption" value="true" required><span>True</span></label>
      <label class="ef-binary-option"><input type="radio" name="binary-unknown-encryption" value="false"><span>False</span></label>
    </div>
    <div class="ef-special-choices" aria-label="Other responses">
      <label class="ef-special-choice"><input type="radio" name="binary-unknown-encryption" value="unknown"><span>Don't know</span></label>
    </div>
  </fieldset>
</ef-binary-choice>`
    },
    {
      id: "answered-with-error-cleared",
      title: "Answered No after a validation error",
      description: "The question was submitted empty, then answered. No is checked; the application has removed aria-invalid and the error. An explicit No is a real answer, unlike the untouched state.",
      html: `<ef-binary-choice class="ef-component-tag">
  <fieldset class="ef-binary-choice">
    <legend class="ef-binary-choice__legend">Is multi-factor authentication enforced for administrators?</legend>
    <p class="ef-field__description" id="binary-answered-help">Answer for the production environment only.</p>
    <div class="ef-binary-choice__options">
      <label class="ef-binary-option"><input type="radio" name="binary-answered-mfa" value="yes" required aria-describedby="binary-answered-help"><span>Yes</span></label>
      <label class="ef-binary-option"><input type="radio" name="binary-answered-mfa" value="no" checked aria-describedby="binary-answered-help"><span>No</span></label>
    </div>
  </fieldset>
</ef-binary-choice>`
    },
    {
      id: "locked-answer",
      title: "Answer locked after sign-off",
      description: "A response recorded in a previous, signed-off review. Both radios are disabled, so the answer is shown but excluded from focus and submission; the description explains why it cannot change.",
      html: `<ef-binary-choice class="ef-component-tag">
  <fieldset class="ef-binary-choice" disabled aria-describedby="binary-locked-help">
    <legend class="ef-binary-choice__legend">Was the incident disclosed to affected customers?</legend>
    <p class="ef-field__description" id="binary-locked-help">Locked: this review was signed off on 12 March. Reopen the review to change the answer.</p>
    <div class="ef-binary-choice__options">
      <label class="ef-binary-option"><input type="radio" name="binary-locked-disclosed" value="yes" checked><span>Yes</span></label>
      <label class="ef-binary-option"><input type="radio" name="binary-locked-disclosed" value="no"><span>No</span></label>
    </div>
  </fieldset>
</ef-binary-choice>`
    },
    {
      id: "mobile-agree-disagree",
      title: "Agree or disagree on a phone",
      description: "Below 44rem the bar becomes two full-width stacked rows, each at least 44px tall.",
      mobile: {
        height: 300,
        notes: [
          "The options switch from a side-by-side inline grid to a single column that fills the width.",
          "The divider moves from the inline-start edge to the block-start edge between the stacked options.",
          "Each option keeps a 2.75rem (44px) minimum height, and the whole label is the tap target.",
          "Long legends wrap; nothing scrolls horizontally at 320px."
        ]
      },
      html: `<ef-binary-choice class="ef-component-tag">
  <fieldset class="ef-binary-choice">
    <legend class="ef-binary-choice__legend">On-call engineers have the access they need during an incident.</legend>
    <div class="ef-binary-choice__options">
      <label class="ef-binary-option"><input type="radio" name="binary-mobile-access" value="agree" required><span>Agree</span></label>
      <label class="ef-binary-option"><input type="radio" name="binary-mobile-access" value="disagree"><span>Disagree</span></label>
    </div>
  </fieldset>
</ef-binary-choice>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "radio", default: "—", description: "Required. Radios, not a checkbox, so Unanswered stays representable." },
      { name: "name", on: "input", values: "string shared by both options", default: "—", description: "Groups the options so only one can be checked. Must be unique per question on the page." },
      { name: "value", on: "input", values: "string", default: "—", description: "Submitted answer. The application maps it to meaning; Forma attaches none." },
      { name: "required", on: "first input", values: "boolean", default: "absent", description: "Native required-group validation: the form cannot submit while the question is Unanswered." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Restores a previously saved answer. Leave both unchecked for Unanswered." },
      { name: "disabled", on: "fieldset or input", values: "boolean", default: "absent", description: "Locks the answer; disabled radios are not focusable or submitted." },
      { name: "aria-describedby", on: "fieldset or input", values: "id list", default: "—", description: "Associates help or error text with the question." }
    ],
    hooks: {
      "ef-binary-choice": "Root fieldset with browser border and padding removed.",
      "ef-binary-choice__legend": "Question text, rendered bold above the options.",
      "ef-binary-choice__options": "Bordered inline grid that joins the options into one bar; stacks below 44rem.",
      "ef-binary-option": "Label wrapping one radio and its text. At least 44px tall; the radio is visually hidden but remains the focus and hit target."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus into the group (to the checked radio, or the first radio when Unanswered) and out of it." },
      { keys: "Arrow keys", action: "Native radio group behavior: moves between options and selects the one that receives focus." },
      { keys: "Space", action: "Selects the focused option when none is checked." }
    ],
    events: [
      { name: "input / change", description: "Native events from the radio that becomes checked." }
    ],
    form: "Submits name=value for the checked radio only. An Unanswered question submits nothing and fails required validation; form reset restores the initial checked attribute."
  },
  states: [
    { name: "Unanswered", how: "no checked radio", description: "Both options show the neutral surface. Distinct from No." },
    { name: "Selected", how: ":checked", description: "The chosen option takes the inverse surface and text color." },
    { name: "Focus", how: ":focus-visible on the radio", description: "Two-tone focus ring drawn around the option label." },
    { name: "Disabled", how: "disabled on fieldset or input", description: "Native disabled state; the answer is visible but not editable or submitted." },
    { name: "Invalid", how: "aria-invalid plus an application message", description: "Forma adds no invalid styling to the options; render a [[validation-message]] next to the group." }
  ],
  accessibility: {
    forma: [
      "Keeps native radios as the focusable, labelled elements, so name, checked state and arrow-key behavior come from the platform.",
      "Makes the whole option label the pointer and touch target at a 44px minimum height.",
      "Shows selection with a surface change plus Highlight/HighlightText in forced-colors mode, and a visible focus ring."
    ],
    consumer: [
      "Write a legend that states the full question.",
      "Keep radio names unique per question and never pre-check an answer the user has not given.",
      "Render and associate a validation message when a required question is left Unanswered.",
      "Explain any disabled or locked answer in visible text."
    ]
  },
  responsive: [
    "Wide: an inline grid with columns of at least 6rem each, capped at 100% width.",
    "Below 44rem: a single column that fills the width; the divider becomes horizontal.",
    "Labels wrap inside each option; the bar never forces horizontal overflow."
  ],
  motion: [
    "Background, border and text color interpolate over the shared perceptual duration (about 120ms) when an option is selected or hovered. Selection itself is immediate.",
    "Timing is identical for both options, so motion never implies which answer is preferred.",
    "Under `prefers-reduced-motion: reduce` the foundation reduces transitions to effectively instant."
  ],
  guidance: {
    do: [
      "Use short, parallel labels such as Yes/No or True/False.",
      "Offer Don't know or Not applicable through [[special-choice]] when they are legitimate answers."
    ],
    avoid: [
      "Pre-selecting No as a default; it erases the difference between unanswered and answered.",
      "Replacing the radios with a switch for assessment answers."
    ]
  },
  related: [
    { slug: "switch", note: "For immediate on/off settings where there is no unanswered state." },
    { slug: "special-choice", note: "Adds Don't know or Not applicable outside the two primary answers." },
    { slug: "ordinal-scale", note: "Use when answers are ordered steps rather than two opposites." },
    { slug: "pairwise-choice", note: "Use when comparing two described alternatives rather than answering yes/no." }
  ]
};
