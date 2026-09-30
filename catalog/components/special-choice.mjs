export default {
  name: "Special choice",
  category: "assessment",
  behavior: "Native HTML",
  summary: "Unknown, not-applicable, and other non-scale answers visually separated from the primary continuum.",
  owns: ["ef-special-choice", "ef-special-choice-group", "ef-special-choices"],
  purpose: {
    description: "Special choices are answers that are not positions on the main scale: Don't know, Not applicable, Prefer not to say. They render as bordered pill radios in a row set apart by a dashed rule, so they are never read as an extra point at the end of a continuum. When they are mutually exclusive with the primary answer they share its radio `name`; the application decides what each one means for scoring and completion. `.ef-special-choice-group` is the fieldset wrapper for using the row on its own.",
    useWhen: [
      "A scale or choice question needs Don't know, Not applicable or Prefer not to say as legitimate answers.",
      "Those answers must stay semantically distinct from the lowest or middle scale value.",
      "A response status is asked on its own, separate from any scale."
    ],
    avoidWhen: [
      "The option is an ordinary category among equals: use [[choice-group]].",
      "The option must clear other selections in a multi-select: use the exclusive option in [[multi-choice]].",
      "The answer is an ordered position: put it in the [[ordinal-scale]] itself."
    ],
    characteristics: [
      "Dashed top rule and spacing separate the row from the primary options above it.",
      "Each pill is a label with a visually hidden radio, at least 44px tall.",
      "Pills wrap onto new lines on narrow screens.",
      "Selection uses the inverse surface, the same cue as the primary options."
    ]
  },
  examples: [
    {
      id: "with-choice-cards",
      title: "Prefer not to say after choice cards",
      description: "A demographic question with ordinary choice cards and a Prefer not to say answer that shares the radio name. The special row sits inside the same fieldset, below a dashed rule.",
      html: `<ef-special-choice class="ef-component-tag">
  <fieldset class="ef-choice-group">
    <legend class="ef-choice-group__legend">How many years have you worked in operations?</legend>
    <label class="ef-choice"><input type="radio" name="special-cards-tenure" value="0-2" required><span class="ef-choice__content"><strong>0 to 2 years</strong></span></label>
    <label class="ef-choice"><input type="radio" name="special-cards-tenure" value="3-9"><span class="ef-choice__content"><strong>3 to 9 years</strong></span></label>
    <label class="ef-choice"><input type="radio" name="special-cards-tenure" value="10+"><span class="ef-choice__content"><strong>10 years or more</strong></span></label>
    <div class="ef-special-choices" aria-label="Other responses">
      <label class="ef-special-choice"><input type="radio" name="special-cards-tenure" value="declined"><span>Prefer not to say</span></label>
    </div>
  </fieldset>
</ef-special-choice>`
    },
    {
      id: "not-applicable-selected",
      title: "Not applicable selected",
      description: "A standalone response-status group with Not applicable checked and one option disabled because the application has ruled it out for this respondent.",
      html: `<ef-special-choice class="ef-component-tag">
  <fieldset class="ef-special-choice-group" aria-describedby="special-selected-help">
    <legend class="ef-field__label">Status of the on-call handbook question</legend>
    <p class="ef-field__description" id="special-selected-help">Don't know is unavailable because you own the handbook.</p>
    <div class="ef-special-choices">
      <label class="ef-special-choice"><input type="radio" name="special-selected-handbook" value="unknown" disabled><span>Don't know</span></label>
      <label class="ef-special-choice"><input type="radio" name="special-selected-handbook" value="na" checked><span>Not applicable</span></label>
    </div>
  </fieldset>
</ef-special-choice>`
    },
    {
      id: "mobile-wrapping-pills",
      title: "Several special answers on a phone",
      description: "Three special answers with a long label at phone width. Pills wrap to new lines; each keeps its full label.",
      mobile: {
        height: 300,
        notes: [
          "`.ef-special-choices` is a wrapping flex row, so pills move to the next line instead of shrinking.",
          "Each pill keeps a 2.75rem (44px) minimum height and the whole pill is the tap target.",
          "A long label wraps inside its pill when it is wider than the row.",
          "The dashed separator spans the full width at every size."
        ]
      },
      html: `<ef-special-choice class="ef-component-tag">
  <fieldset class="ef-special-choice-group">
    <legend class="ef-field__label">If you cannot rate the vendor, tell us why</legend>
    <div class="ef-special-choices">
      <label class="ef-special-choice"><input type="radio" name="special-mobile-vendor" value="unknown"><span>Don't know</span></label>
      <label class="ef-special-choice"><input type="radio" name="special-mobile-vendor" value="na"><span>Not applicable</span></label>
      <label class="ef-special-choice"><input type="radio" name="special-mobile-vendor" value="no-contact"><span>I have not worked with this vendor in the last year</span></label>
    </div>
  </fieldset>
</ef-special-choice>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "radio", default: "—", description: "Radios, because special answers are mutually exclusive with each other and usually with the scale." },
      { name: "name", on: "input", values: "string", default: "—", description: "Share the primary question's name when the special answer replaces a scale answer; use a separate name only when both can coexist." },
      { name: "value", on: "input", values: "string such as unknown or na", default: "—", description: "Submitted value. The application decides how it affects scoring and completion." },
      { name: "required", on: "first input of the group", values: "boolean", default: "absent", description: "Native required-group validation when the status must be given." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Restores a saved special answer." },
      { name: "disabled", on: "input", values: "boolean", default: "absent", description: "Removes a special answer from focus and submission; explain why in text." },
      { name: "aria-label", on: ".ef-special-choices", values: "string", default: "—", description: "Names the row when it sits inside a larger fieldset, for example Other responses." },
      { name: "aria-describedby", on: "fieldset", values: "id list", default: "—", description: "Associates help text with the group." }
    ],
    hooks: {
      "ef-special-choice-group": "Fieldset wrapper for a standalone group of special answers, with browser border and padding removed.",
      "ef-special-choices": "Wrapping row separated from the content above by spacing and a dashed rule.",
      "ef-special-choice": "Bordered pill label containing a visually hidden radio. At least 44px tall."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus into and out of the radio group the special answers belong to." },
      { keys: "Arrow keys", action: "Native radio behavior; when the name is shared, arrows move between scale positions and special answers in document order." },
      { keys: "Space", action: "Selects the focused answer when none is checked." }
    ],
    events: [
      { name: "input / change", description: "Native events from the checked radio." }
    ],
    form: "Submits name=value like any radio. When the name is shared with a scale, choosing a special answer clears the scale answer natively."
  },
  states: [
    { name: "Unselected", how: "no checked attribute", description: "Neutral bordered pill." },
    { name: "Selected", how: ":checked", description: "Inverse surface and text color." },
    { name: "Focus", how: ":focus-visible on the radio", description: "Two-tone focus ring around the pill." },
    { name: "Disabled", how: "disabled attribute", description: "Reduced opacity and not-allowed cursor; skipped by keyboard and not submitted." }
  ],
  accessibility: {
    forma: [
      "Keeps special answers as native radios with visible text labels.",
      "Separates them from the continuum with a non-color dashed rule and spacing.",
      "Uses Highlight/HighlightText for the selected pill in forced-colors mode."
    ],
    consumer: [
      "Name the row with aria-label when it sits inside another fieldset.",
      "Decide in application logic whether a special answer counts as complete and how it is scored.",
      "Explain disabled special answers in visible text."
    ]
  },
  responsive: [
    "The row is a wrapping flex container with a 0.5rem gap.",
    "Pills size to their text and wrap long labels; they never force horizontal overflow.",
    "No breakpoints; spacing is constant."
  ],
  motion: [
    "Background, border and text color use the shared perceptual interpolation (about 120ms) on selection, the same timing as the scale options. Selection is immediate.",
    "Under `prefers-reduced-motion: reduce` the foundation makes these transitions effectively instant."
  ],
  guidance: {
    do: [
      "Use plain labels such as Don't know, Not applicable or Prefer not to say.",
      "Share the radio name with the scale when the answers are mutually exclusive."
    ],
    avoid: [
      "Appending Don't know as the last scale position.",
      "Offering special answers that the application treats identically to a scale value."
    ]
  },
  related: [
    { slug: "ordinal-scale", note: "The primary continuum special choices sit beneath." },
    { slug: "multi-choice", note: "Use its exclusive option for None-style answers in multi-select questions." },
    { slug: "choice-group", note: "Use for ordinary categorical answers of equal standing." }
  ]
};
