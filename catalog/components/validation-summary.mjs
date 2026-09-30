export default {
  name: "Validation summary",
  category: "feedback",
  behavior: "Application state",
  summary: "Focusable page- or form-level error summary with links back to each affected control.",
  purpose: {
    description: "A validation summary lists every problem that stopped a form or survey from being submitted, as links to the affected controls. Forma renders a bordered block with a mark, a heading that states the count, and a list of links. The application inserts it after a failed submit, moves focus to it (it carries `tabindex=\"-1\"` for that purpose), and keeps each link pointing at the id of the control or group it describes. Forma does not collect errors or decide validity.",
    useWhen: [
      "A submit or Continue action found more than one problem, or one problem the user may not see because it is off-screen.",
      "A long form, survey page or wizard step needs a single place where the user can see everything that needs attention.",
      "The application moves focus after a failed submit and needs a stable, labelled target."
    ],
    avoidWhen: [
      "Only one visible field is wrong and focus can go straight to it: a [[validation-message]] is enough.",
      "The failure is not caused by the user's input (a server error, conflict or unknown outcome): use [[alert]], [[conflict-review]] or [[operation-status]].",
      "The list is of outstanding work rather than input errors: use [[obligation-panel]] or [[readiness-checklist]]."
    ],
    characteristics: [
      "A thick accent border and a secondary surface set it apart from ordinary content; the heading and count carry the meaning.",
      "`role=\"alert\"` announces it when inserted; `tabindex=\"-1\"` lets the application focus it without adding it to the Tab order.",
      "Every item is a link, so the whole summary is operable with a keyboard."
    ]
  },
  examples: [
    {
      id: "single-error",
      title: "One off-screen error",
      description: "A summary with a single item for a form where the problem may be below the fold. The heading uses the singular and the link targets the input's id.",
      html: `<ef-validation-summary class="ef-component-tag">
  <div class="ef-stack">
    <div class="ef-validation-summary" role="alert" tabindex="-1" aria-labelledby="validation-summary-single-error-title">
      <div class="ef-validation-summary__icon" aria-hidden="true">!</div>
      <div>
        <h2 class="ef-validation-summary__title" id="validation-summary-single-error-title">There is 1 problem to fix</h2>
        <ul class="ef-validation-summary__list">
          <li><a href="#validation-summary-single-error-date">Enter the contract start date.</a></li>
        </ul>
      </div>
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="validation-summary-single-error-date">Contract start date</label>
      <input id="validation-summary-single-error-date" name="contract-start" type="date" required aria-invalid="true" aria-describedby="validation-summary-single-error-message">
      <p class="ef-validation-message" id="validation-summary-single-error-message">
        <span class="ef-validation-message__mark" aria-hidden="true">!</span>
        Enter the contract start date.
      </p>
    </div>
  </div>
</ef-validation-summary>`
    },
    {
      id: "form-with-field-errors",
      title: "Summary above field-level messages",
      description: "The full composition after a failed submit: the summary at the top of the form, and a matching [[validation-message]] at each field. Link text matches the field message so users recognize it when they arrive.",
      html: `<ef-validation-summary class="ef-component-tag">
  <form class="ef-stack" action="#validation-summary-form-with-field-errors-title" novalidate>
    <div class="ef-validation-summary" role="alert" tabindex="-1" aria-labelledby="validation-summary-form-with-field-errors-title">
      <div class="ef-validation-summary__icon" aria-hidden="true">!</div>
      <div>
        <h2 class="ef-validation-summary__title" id="validation-summary-form-with-field-errors-title">There are 2 problems to fix</h2>
        <ul class="ef-validation-summary__list">
          <li><a href="#validation-summary-form-with-field-errors-name">Enter the vendor's legal name.</a></li>
          <li><a href="#validation-summary-form-with-field-errors-tax">Enter a tax ID with 9 digits.</a></li>
        </ul>
      </div>
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="validation-summary-form-with-field-errors-name">Legal name</label>
      <input id="validation-summary-form-with-field-errors-name" name="legal-name" type="text" autocomplete="organization" required aria-invalid="true" aria-describedby="validation-summary-form-with-field-errors-name-error">
      <p class="ef-validation-message" id="validation-summary-form-with-field-errors-name-error">
        <span class="ef-validation-message__mark" aria-hidden="true">!</span>
        Enter the vendor's legal name.
      </p>
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="validation-summary-form-with-field-errors-tax">Tax ID</label>
      <input id="validation-summary-form-with-field-errors-tax" name="tax-id" type="text" inputmode="numeric" value="12-34567" aria-invalid="true" aria-describedby="validation-summary-form-with-field-errors-tax-error">
      <p class="ef-validation-message" id="validation-summary-form-with-field-errors-tax-error">
        <span class="ef-validation-message__mark" aria-hidden="true">!</span>
        Enter a tax ID with 9 digits.
      </p>
    </div>
    <button type="submit">Save vendor</button>
  </form>
</ef-validation-summary>`
    },
    {
      id: "mobile-survey-page",
      title: "Mobile survey page",
      description: "A survey summary at phone width with longer link text. Items wrap inside the list while the mark stays in its own column.",
      mobile: {
        height: 330,
        notes: [
          "The two-column grid keeps the mark in a narrow first column; the heading and list take the remaining width and wrap.",
          "Long link text wraps across lines, and each wrapped link remains one tappable target.",
          "No horizontal scrolling occurs at 320px; the list indent is only 1.25rem.",
          "When the application focuses the summary, the browser scrolls it into view at the top of the phone screen."
        ]
      },
      html: `<ef-validation-summary class="ef-component-tag">
  <div class="ef-validation-summary" role="alert" tabindex="-1" aria-labelledby="validation-summary-mobile-survey-page-title">
    <div class="ef-validation-summary__icon" aria-hidden="true">!</div>
    <div>
      <h2 class="ef-validation-summary__title" id="validation-summary-mobile-survey-page-title">There are 3 responses to review</h2>
      <ul class="ef-validation-summary__list">
        <li><a href="#validation-summary-mobile-survey-page-title">Question 2: choose how often access reviews happen.</a></li>
        <li><a href="#validation-summary-mobile-survey-page-title">Question 5: the allocation must total exactly 100 points.</a></li>
        <li><a href="#validation-summary-mobile-survey-page-title">Question 9: describe the exception process in at least 20 characters.</a></li>
      </ul>
    </div>
  </div>
</ef-validation-summary>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: "div.ef-validation-summary", values: "alert", default: "—", description: "Announces the summary when the application inserts it. A summary present at page load is not announced." },
      { name: "tabindex", on: "div.ef-validation-summary", values: "-1", default: "—", description: "Allows the application to move focus to the summary programmatically without adding it to the Tab order." },
      { name: "aria-labelledby", on: "div.ef-validation-summary", values: "id of .ef-validation-summary__title", default: "—", description: "Names the summary by its heading, so focusing it announces the count." },
      { name: "href", on: "a", values: "#id of the affected control or group", default: "—", description: "Takes the user to the problem. Point at the input's id, or the fieldset's id for a group." },
      { name: "aria-hidden", on: ".ef-validation-summary__icon", values: "true", default: "—", description: "Hides the decorative mark." }
    ],
    hooks: {
      "ef-validation-summary": "Root grid with a mark column and a content column, a 2px accent border and a secondary surface.",
      "ef-validation-summary__icon": "Bordered circular mark shared in style with the validation message mark. Decorative.",
      "ef-validation-summary__title": "Heading that states the number of problems; sans-serif at 1rem regardless of heading level.",
      "ef-validation-summary__list": "Bulleted list of links, one per problem."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the links. The summary container is reachable only by programmatic focus." },
      { keys: "Enter", action: "Follows the focused link to the affected control (native link behavior)." }
    ],
    events: [
      { name: "submit / invalid", description: "Native form events the application may use to build and insert the summary. Forma defines no events." }
    ],
    form: "The summary is not a form control. Use `novalidate` on the form when the application renders its own summary instead of the browser's validation bubbles."
  },
  states: [
    { name: "Inserted after submit", how: "role=\"alert\" element added to the DOM", description: "Announced by assistive technology and typically focused by the application." },
    { name: "Focused", how: ":focus-visible via tabindex=\"-1\" and programmatic focus", description: "Shows the shared focus ring around the whole summary." },
    { name: "Updated", how: "application rewrites the heading count and list", description: "The application removes fixed items or the whole summary once everything is resolved." }
  ],
  accessibility: {
    forma: [
      "Uses a heading, a count in words, a mark and a heavy border, so the summary is recognizable without color.",
      "Maps the border to `CanvasText` in forced colors.",
      "Renders every item as a native link with the standard focus indicator."
    ],
    consumer: [
      "Insert the summary after a failed submit and move focus to it.",
      "Keep link text identical or close to the field-level [[validation-message]] so users recognize the target.",
      "Point each link at an element that exists and is visible; for grouped controls target the fieldset.",
      "Update or remove the summary as problems are fixed, and never include raw exception text."
    ]
  },
  responsive: [
    "Two-column grid (`auto minmax(0, 1fr)`): the mark column is intrinsic and the content column absorbs the remaining width.",
    "Headings and link text wrap; there are no breakpoints.",
    "The summary fills its container; place it at the top of the form so it is the first thing seen after focus moves."
  ],
  motion: [
    "No animation: the summary appears with the application's DOM insertion, and focus movement scrolls it into view natively."
  ],
  guidance: {
    do: [
      "State the count in the heading (\"There are 2 problems to fix\").",
      "List problems in the order the fields appear in the form."
    ],
    avoid: [
      "Showing the summary before the user has tried to submit.",
      "Generic items such as \"Invalid input\" that do not name the field."
    ]
  },
  related: [
    { slug: "validation-message", note: "The per-field message each summary item should mirror." },
    { slug: "alert", note: "For page-level status that is not caused by invalid input." },
    { slug: "obligation-panel", note: "Outstanding domain work rather than input errors." }
  ]
};
