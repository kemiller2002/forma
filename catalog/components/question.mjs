export default {
  name: "Question shell",
  category: "assessment",
  behavior: "Application content",
  summary: "A stable prompt, help, selector, and validation structure for assessment questions.",
  purpose: {
    description: "The question shell is the frame every assessment item shares: an optional number or identifier, the prompt as a heading, help text, the answer selector and any validation message. It is a `section` labelled by its prompt, so each question is a navigable region with a stable structure regardless of which selector sits inside. The shell carries no applicability, branching, scoring or persistence meaning; the application decides whether a question is rendered and what its answer means.",
    useWhen: [
      "An assessment, survey or onboarding form presents a sequence of questions that should all read the same way.",
      "A question needs a visible number or identifier, help text and a place for a question-level validation message.",
      "Several selector types (scales, binary choices, matrices, free text) appear in one flow and need one consistent frame."
    ],
    avoidWhen: [
      "The input is an ordinary form field with a label and description: use [[text-field]] or the selector on its own.",
      "The content is a settings row or preference: use [[switch]] or [[checkbox]] inside a fieldset.",
      "You want to hide a question that does not apply: do not render it with CSS hidden; the application decides applicability and omits the shell."
    ],
    characteristics: [
      "The prompt is a real heading referenced by `aria-labelledby`, so the section has an accessible name and appears in heading navigation.",
      "The number badge is decorative (`aria-hidden`); the heading carries the meaning.",
      "The body column is `minmax(0, 1fr)` with `min-inline-size: 0`, so wide selectors cannot push the page sideways.",
      "A subtle bottom rule separates consecutive questions; spacing is fixed by Forma, not by the selector."
    ]
  },
  examples: [
    {
      id: "required-with-error",
      title: "Required question with a validation error",
      description: "The application rendered a question-level error after an attempted advance. The error sits below the selector and is referenced from the inputs with aria-describedby, alongside the help text.",
      html: `<ef-question class="ef-component-tag">
  <section class="ef-question" aria-labelledby="question-error-title">
    <header class="ef-question__header">
      <span class="ef-question__number" aria-hidden="true">4</span>
      <div>
        <h2 class="ef-question__prompt" id="question-error-title">How often are production changes reviewed by a second person?</h2>
        <p class="ef-question__help" id="question-error-help">Consider the last three months of changes.</p>
      </div>
    </header>
    <div class="ef-question__body">
      <fieldset class="ef-ordinal-scale ef-ordinal-scale--3" aria-labelledby="question-error-title" aria-describedby="question-error-help question-error-message">
        <div class="ef-ordinal-scale__options">
          <label class="ef-ordinal-option">
            <input type="radio" name="question-error-review" value="rarely" required aria-invalid="true">
            <span class="ef-ordinal-option__marker" aria-hidden="true">1</span>
            <span class="ef-ordinal-option__label">Rarely</span>
          </label>
          <label class="ef-ordinal-option">
            <input type="radio" name="question-error-review" value="sometimes" aria-invalid="true">
            <span class="ef-ordinal-option__marker" aria-hidden="true">2</span>
            <span class="ef-ordinal-option__label">Sometimes</span>
          </label>
          <label class="ef-ordinal-option">
            <input type="radio" name="question-error-review" value="always" aria-invalid="true">
            <span class="ef-ordinal-option__marker" aria-hidden="true">3</span>
            <span class="ef-ordinal-option__label">Always</span>
          </label>
        </div>
      </fieldset>
      <p class="ef-validation-message" id="question-error-message">
        <span class="ef-validation-message__mark" aria-hidden="true">!</span>
        Choose one response before continuing.
      </p>
    </div>
  </section>
</ef-question>`
    },
    {
      id: "identifier-and-binary",
      title: "Long prompt with a binary answer",
      description: "A long policy prompt wraps inside the heading column while the number badge stays aligned to the first line. The body holds a [[binary-choice]]; the shell does not change for a different selector.",
      html: `<ef-question class="ef-component-tag">
  <section class="ef-question" aria-labelledby="question-binary-title">
    <header class="ef-question__header">
      <span class="ef-question__number" aria-hidden="true">12</span>
      <div>
        <h2 class="ef-question__prompt" id="question-binary-title">Does every service that stores customer data have a documented, tested restore procedure that has been exercised within the last twelve months?</h2>
        <p class="ef-question__help" id="question-binary-help">A restore that was planned but not performed counts as No.</p>
      </div>
    </header>
    <div class="ef-question__body">
      <fieldset class="ef-binary-choice" aria-describedby="question-binary-help">
        <legend class="ef-binary-choice__legend">Tested restore procedure in place</legend>
        <div class="ef-binary-choice__options">
          <label class="ef-binary-option"><input type="radio" name="question-binary-restore" value="yes" required><span>Yes</span></label>
          <label class="ef-binary-option"><input type="radio" name="question-binary-restore" value="no"><span>No</span></label>
        </div>
      </fieldset>
    </div>
  </section>
</ef-question>`
    },
    {
      id: "free-text-answer",
      title: "Optional free-text follow-up",
      description: "Not every question is a scale. An optional follow-up uses an ordinary labelled textarea inside the same shell, so numbering, prompt and help stay consistent across selector types.",
      html: `<ef-question class="ef-component-tag">
  <section class="ef-question" aria-labelledby="question-text-title">
    <header class="ef-question__header">
      <span class="ef-question__number" aria-hidden="true">13</span>
      <div>
        <h2 class="ef-question__prompt" id="question-text-title">What would most improve your recovery process?</h2>
        <p class="ef-question__help" id="question-text-help">Optional. Two or three sentences are enough.</p>
      </div>
    </header>
    <div class="ef-question__body">
      <div class="ef-field">
        <label class="ef-field__label" for="question-text-answer">Your answer</label>
        <textarea id="question-text-answer" name="question-text-answer" rows="3" aria-describedby="question-text-help"></textarea>
      </div>
    </div>
  </section>
</ef-question>`
    },
    {
      id: "mobile-stacked-scale",
      title: "Question on a phone",
      description: "A five-point agreement question at phone width. The header keeps the number beside the wrapping prompt and the scale below reflows to a vertical list.",
      mobile: {
        height: 560,
        notes: [
          "The header grid keeps the number in an auto column and gives the prompt the remaining width, so long prompts wrap instead of overflowing.",
          "The prompt font size is fluid (clamped between 1rem and 1.2rem), so it shrinks slightly on phones without dropping below body size.",
          "The selector in the body reflows on its own: the ordinal scale stacks its options into full-width 52px rows below 44rem.",
          "No part of the shell scrolls horizontally at 320px; portrait and landscape only change line breaks."
        ]
      },
      html: `<ef-question class="ef-component-tag">
  <section class="ef-question" aria-labelledby="question-mobile-title">
    <header class="ef-question__header">
      <span class="ef-question__number" aria-hidden="true">2</span>
      <div>
        <h2 class="ef-question__prompt" id="question-mobile-title">Releases can be rolled back without a code change.</h2>
        <p class="ef-question__help">Choose the response that best matches your team.</p>
      </div>
    </header>
    <div class="ef-question__body">
      <fieldset class="ef-ordinal-scale ef-ordinal-scale--5" aria-labelledby="question-mobile-title">
        <div class="ef-ordinal-scale__options">
          <label class="ef-ordinal-option"><input type="radio" name="question-mobile-rollback" value="0" required><span class="ef-ordinal-option__marker" aria-hidden="true">1</span><span class="ef-ordinal-option__label">Strongly disagree</span></label>
          <label class="ef-ordinal-option"><input type="radio" name="question-mobile-rollback" value="1"><span class="ef-ordinal-option__marker" aria-hidden="true">2</span><span class="ef-ordinal-option__label">Disagree</span></label>
          <label class="ef-ordinal-option"><input type="radio" name="question-mobile-rollback" value="2"><span class="ef-ordinal-option__marker" aria-hidden="true">3</span><span class="ef-ordinal-option__label">Neither agree nor disagree</span></label>
          <label class="ef-ordinal-option"><input type="radio" name="question-mobile-rollback" value="3"><span class="ef-ordinal-option__marker" aria-hidden="true">4</span><span class="ef-ordinal-option__label">Agree</span></label>
          <label class="ef-ordinal-option"><input type="radio" name="question-mobile-rollback" value="4"><span class="ef-ordinal-option__marker" aria-hidden="true">5</span><span class="ef-ordinal-option__label">Strongly agree</span></label>
        </div>
      </fieldset>
    </div>
  </section>
</ef-question>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-question", values: "id of .ef-question__prompt", default: "—", description: "Names the question region by its prompt. The same id can label the inner fieldset when the prompt replaces a visible legend." },
      { name: "aria-describedby", on: "selector fieldset or input", values: "ids of help and error text", default: "—", description: "Associates help and validation text with the control that receives focus. Put it on the fieldset or inputs; a plain div does not reliably expose a description." },
      { name: "aria-hidden", on: ".ef-question__number", values: "true", default: "—", description: "Keeps the decorative number badge out of the accessibility tree; the heading already names the question." },
      { name: "aria-invalid", on: "inputs", values: "true", default: "absent", description: "Set by the application when the question fails validation so assistive technology reports the error state." }
    ],
    hooks: {
      "ef-question": "Root section. A grid with vertical padding and a subtle bottom rule that separates consecutive questions.",
      "ef-question__header": "Two-column grid: number badge and the prompt/help column.",
      "ef-question__number": "Circular monospace badge for a question number or short identifier. Decorative.",
      "ef-question__prompt": "The prompt heading. Use a heading level that fits the page outline.",
      "ef-question__help": "Secondary instruction text under the prompt; reference it with aria-describedby.",
      "ef-question__body": "Container for the selector and validation message. It is allowed to shrink so wide selectors cannot overflow."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves into and out of the selector inside the body. The shell itself adds no focus stops." },
      { keys: "Selector keys", action: "Whatever the embedded selector provides natively, for example arrow keys within a radio group." }
    ],
    events: [],
    form: "The shell does not participate in forms. The selector inside it submits its own native values."
  },
  states: [
    { name: "Unanswered", how: "no checked input in the body", description: "Nothing in the shell changes; the selector shows no selection." },
    { name: "Invalid", how: "application renders .ef-validation-message and sets aria-invalid", description: "A text error with a non-color mark appears under the selector and is associated with the inputs." },
    { name: "Not applicable", how: "application omits the section", description: "Forma has no hidden or skipped state. The application decides applicability and does not render the question." }
  ],
  accessibility: {
    forma: [
      "Provides a section labelled by a heading, so each question is a named region and appears in heading navigation.",
      "Keeps the number badge decorative and the prompt as the single source of the question's name.",
      "Lays out validation as text with a visible mark, not color alone."
    ],
    consumer: [
      "Choose the heading level that fits the page outline and keep prompt ids unique per question.",
      "Associate help and error text with the focusable control or its fieldset using aria-describedby.",
      "Move focus to a [[validation-summary]] after a failed advance when there are several errors.",
      "Decide applicability and branching in application state; never hide a required question with CSS."
    ]
  },
  responsive: [
    "The header is a two-column grid (`auto minmax(0, 1fr)`), so long prompts wrap beside the badge.",
    "The prompt size is fluid with `clamp()`; help text stays at 0.875rem.",
    "The body has `min-inline-size: 0`; the embedded selector owns its own narrow-screen recomposition.",
    "There are no breakpoints in the shell itself."
  ],
  motion: [
    "No animation: the shell is static. Selection feedback inside the body comes from the selector (for example the shared 120ms perceptual color interpolation on assessment options)."
  ],
  guidance: {
    do: [
      "Write the prompt as the complete question, and keep help text short and specific.",
      "Use the same shell for every selector type in a flow so numbering and spacing stay consistent."
    ],
    avoid: [
      "Encoding scoring, weight or applicability in the number badge or its styling.",
      "Putting required instructions only in a tooltip; place them in `.ef-question__help`."
    ]
  },
  related: [
    { slug: "ordinal-scale", note: "The most common selector placed in the question body." },
    { slug: "validation-message", note: "The question-level error rendered inside the body." },
    { slug: "survey-progress", note: "Shows position across questions; the shell frames one question." },
    { slug: "text-field", note: "Use alone for ordinary form fields that are not assessment items." }
  ]
};
