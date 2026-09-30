export default {
  name: "Validation message",
  category: "feedback",
  behavior: "Application state",
  summary: "Question- or field-level recovery guidance with a mark, bold text and no reliance on color.",
  purpose: {
    description: "A validation message tells the user what is wrong with one answer and how to fix it, directly under the control or question it concerns. Forma renders a paragraph with a circled mark and emphasized text. The application decides whether a value is invalid, writes the message, links it to the control with `aria-describedby`, and sets `aria-invalid` on the control. Forma does not validate anything.",
    useWhen: [
      "A single field or question has a value that cannot be accepted, and the user can fix it in place.",
      "A required answer is missing after the user tried to continue.",
      "Each error in a longer form needs its own local explanation in addition to a [[validation-summary]]."
    ],
    avoidWhen: [
      "Several fields failed at once: add a [[validation-summary]] at the top of the form and keep one message per field.",
      "The problem is with the page or the operation, not a field: use [[alert]] or [[operation-status]].",
      "The text is permanent help that is always shown: use the field description in [[text-field]] or the question help in [[question]]."
    ],
    characteristics: [
      "The mark is a bordered circle in `currentColor`, so the message is recognizable in grayscale and forced colors.",
      "The text is bold and uses the primary text color; it does not turn the message red.",
      "It is a plain paragraph with no live-region role, so it is announced through the control's description rather than on insertion."
    ]
  },
  examples: [
    {
      id: "email-format",
      title: "Email format error",
      description: "A text field whose value was rejected. The input carries `aria-invalid=\"true\"` and lists both the help text and the message in `aria-describedby`, so screen readers read the recovery guidance when the field is focused.",
      html: `<ef-validation-message class="ef-component-tag">
  <div class="ef-field">
    <label class="ef-field__label" for="validation-message-email-format-input">Billing contact email</label>
    <span class="ef-field__description" id="validation-message-email-format-help">Invoices are sent to this address.</span>
    <input id="validation-message-email-format-input" name="billing-email" type="email" autocomplete="email" value="accounts@example" aria-invalid="true" aria-describedby="validation-message-email-format-help validation-message-email-format-error">
    <p class="ef-validation-message" id="validation-message-email-format-error">
      <span class="ef-validation-message__mark" aria-hidden="true">!</span>
      Enter a full email address, such as accounts@example.com.
    </p>
  </div>
</ef-validation-message>`
    },
    {
      id: "required-choice",
      title: "Required choice not answered",
      description: "A radio group left unanswered. The message follows the fieldset and is referenced from the fieldset with `aria-describedby`, so it is announced when focus enters the group.",
      html: `<ef-validation-message class="ef-component-tag">
  <fieldset class="ef-choice-group" aria-describedby="validation-message-required-choice-error">
    <legend class="ef-choice-group__legend">Where is customer data stored?</legend>
    <label class="ef-choice">
      <input type="radio" name="validation-message-required-choice-storage" value="region" required>
      <span class="ef-choice__content"><strong>In one region</strong></span>
    </label>
    <label class="ef-choice">
      <input type="radio" name="validation-message-required-choice-storage" value="multi-region">
      <span class="ef-choice__content"><strong>Across several regions</strong></span>
    </label>
  </fieldset>
  <p class="ef-validation-message" id="validation-message-required-choice-error">
    <span class="ef-validation-message__mark" aria-hidden="true">!</span>
    Choose where customer data is stored before continuing.
  </p>
</ef-validation-message>`
    },
    {
      id: "range-guidance",
      title: "Out-of-range number",
      description: "A numeric value outside the allowed range. The message states the limits and the current value, so the user does not have to guess the rule.",
      html: `<ef-validation-message class="ef-component-tag">
  <div class="ef-field">
    <label class="ef-field__label" for="validation-message-range-guidance-input">Retention period (days)</label>
    <input id="validation-message-range-guidance-input" name="retention-days" type="number" inputmode="numeric" value="4000" min="30" max="3650" aria-invalid="true" aria-describedby="validation-message-range-guidance-error">
    <p class="ef-validation-message" id="validation-message-range-guidance-error">
      <span class="ef-validation-message__mark" aria-hidden="true">!</span>
      Enter a value from 30 to 3,650 days. 4,000 is above the maximum.
    </p>
  </div>
</ef-validation-message>`
    },
    {
      id: "mobile-long-message",
      title: "Mobile long message",
      description: "A longer recovery message under a password field at phone width. The mark stays at the top of the first line while the text wraps beside it.",
      mobile: {
        height: 260,
        notes: [
          "The message is a flex row: the 1.5rem mark keeps its size and the text wraps in the remaining width.",
          "The mark aligns to the first line, so multi-line messages still read as one item.",
          "The message never widens the field or causes horizontal scrolling at 320px.",
          "Orientation changes only reflow the text; the message stays directly under its control."
        ]
      },
      html: `<ef-validation-message class="ef-component-tag">
  <div class="ef-field">
    <label class="ef-field__label" for="validation-message-mobile-long-input">New passphrase</label>
    <input id="validation-message-mobile-long-input" name="new-passphrase" type="password" autocomplete="new-password" aria-invalid="true" aria-describedby="validation-message-mobile-long-error">
    <p class="ef-validation-message" id="validation-message-mobile-long-error">
      <span class="ef-validation-message__mark" aria-hidden="true">!</span>
      Use at least 12 characters. This passphrase also appears in a list of commonly used passwords, so choose something less predictable.
    </p>
  </div>
</ef-validation-message>`
    }
  ],
  api: {
    attributes: [
      { name: "id", on: "p.ef-validation-message", values: "unique id", default: "—", description: "Required so the control can reference the message." },
      { name: "aria-describedby", on: "input, select, textarea or fieldset", values: "id list including the message id", default: "—", description: "Associates the message with the control so it is read when the control is focused. Keep any existing help text id in the list." },
      { name: "aria-invalid", on: "input, select or textarea", values: "true", default: "absent", description: "Set by the application while the value is invalid; remove it when the value is fixed." },
      { name: "aria-hidden", on: ".ef-validation-message__mark", values: "true", default: "—", description: "Hides the decorative glyph from assistive technology." }
    ],
    hooks: {
      "ef-validation-message": "Paragraph root: a flex row of mark and text with bold, small primary-colored text.",
      "ef-validation-message__mark": "Bordered circular mark holding a short glyph such as !. Decorative."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "The message is not focusable. It is read as the description of the control it is linked to when that control receives focus." }
    ],
    events: [
      { name: "invalid / input / change", description: "Native events on the associated control that the application may use to decide when to show or clear the message. Forma defines no events." }
    ],
    form: "The message does not participate in the form. Native constraint validation on the control (required, min, max, type) still runs unless the form has `novalidate`."
  },
  states: [
    { name: "Shown", how: "present in the DOM and referenced by aria-describedby", description: "Visible under the control and announced as part of its description." },
    { name: "Cleared", how: "removed from the DOM or from aria-describedby, and aria-invalid removed", description: "The application removes the message once the value is acceptable." }
  ],
  accessibility: {
    forma: [
      "Pairs a bordered mark with bold text, so the error does not depend on color.",
      "Keeps the mark decorative and the text as real content that assistive technology can read."
    ],
    consumer: [
      "Reference the message from the control with `aria-describedby` and set `aria-invalid=\"true\"` while the error applies.",
      "Write guidance that says how to fix the value, not only that it is wrong; never show raw exception text.",
      "When several fields fail on submit, also render a [[validation-summary]] and move focus to it.",
      "Avoid showing messages while the user is still typing a first value."
    ]
  },
  responsive: [
    "The flex row lets the text wrap to any width while the mark keeps its 1.5rem size.",
    "There are no breakpoints; the message follows the width of its field or question.",
    "Long words and numbers wrap with the surrounding text."
  ],
  motion: [
    "No animation: the message appears and disappears with the application's DOM change. There is no entry cue, so the error is readable immediately."
  ],
  guidance: {
    do: [
      "Place the message directly after the control or group it describes.",
      "Keep it to one or two sentences and name the expected format or range."
    ],
    avoid: [
      "Relying on a red border or color change to show an error.",
      "Adding `role=\"alert\"` to each field message; announce the set once through a [[validation-summary]]."
    ]
  },
  related: [
    { slug: "validation-summary", note: "Page- or form-level list of all errors, with links to each affected control." },
    { slug: "text-field", note: "The field pattern a message is usually attached to." },
    { slug: "question", note: "Assessment question wrapper whose answers may need a message." },
    { slug: "alert", note: "Status about the page or an operation rather than one input." }
  ]
};
