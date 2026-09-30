export default {
  name: "Text field",
  category: "forms",
  behavior: "Native HTML",
  summary: "A labelled native text-like input (text, email, password, URL, tel, number) with optional description, using the .ef-field label/description structure.",
  owns: ["ef-field"],
  purpose: {
    description: "A text field collects a short, single-line value. Forma supplies the `.ef-field` structure (a grid of label, description and control) and the foundation styling for native inputs; the `input` element itself stays native, so the browser owns typing, autofill, input modes, constraint validation and form submission. The same `.ef-field` structure is shared by [[textarea]] and [[date-time-field]], and this entry documents it.",
    useWhen: [
      "The answer is a short free-form value such as a name, email address, URL, phone number or identifier.",
      "The value has a native input type (`email`, `password`, `url`, `tel`, `number`) whose keyboard, autofill or validation helps the user.",
      "A label and an optional line of guidance should sit above the control in a consistent vertical rhythm."
    ],
    avoidWhen: [
      "The value is several sentences or lines: use [[textarea]].",
      "The value is a date or time: use [[date-time-field]] so the platform picker and typed entry stay available.",
      "The user chooses from a known list: use [[select]], [[choice-group]] or, for long lists with typing, [[combobox]].",
      "The value is a bounded count the user adjusts in small increments: use [[numeric-stepper]].",
      "The field is a query that filters results: use [[search]], which adds the search landmark, clearing and result-count feedback."
    ],
    characteristics: [
      "Label, description and control stack in a single grid column with a fixed 0.5rem gap.",
      "Native inputs fill the available inline size and keep a 2.75rem (44px) minimum block size.",
      "The label is a real `label` element tied to the input with `for`/`id`; the description is linked with `aria-describedby`."
    ]
  },
  examples: [
    {
      id: "sign-in-credentials",
      title: "Sign-in credentials",
      description: "Email and password fields with the autocomplete tokens password managers rely on. The password description states the rule up front instead of waiting for an error.",
      html: `<ef-text-field class="ef-component-tag">
  <form class="ef-stack" action="/sign-in" method="post">
    <div class="ef-field">
      <label class="ef-field__label" for="text-field-sign-in-email">Email address</label>
      <input id="text-field-sign-in-email" name="email" type="email" autocomplete="username" spellcheck="false" required>
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="text-field-sign-in-password">Password</label>
      <span class="ef-field__description" id="text-field-sign-in-password-description">At least 12 characters.</span>
      <input id="text-field-sign-in-password" name="password" type="password" autocomplete="current-password" minlength="12" required aria-describedby="text-field-sign-in-password-description">
    </div>
    <button type="submit">Sign in</button>
  </form>
</ef-text-field>`
    },
    {
      id: "validation-error",
      title: "Validation error",
      description: "A URL field after the application rejected the value. aria-invalid marks the input and a validation message is linked through aria-describedby together with the original guidance, so the error is announced and visible with a non-color mark.",
      html: `<ef-text-field class="ef-component-tag">
  <div class="ef-field">
    <label class="ef-field__label" for="text-field-validation-error-webhook">Webhook URL</label>
    <span class="ef-field__description" id="text-field-validation-error-webhook-description">Must start with https:// and be reachable from our servers.</span>
    <input id="text-field-validation-error-webhook" name="webhook" type="url" inputmode="url" value="http://hooks.internal/deploy" aria-invalid="true" aria-describedby="text-field-validation-error-webhook-description text-field-validation-error-webhook-error">
    <p class="ef-validation-message" id="text-field-validation-error-webhook-error">
      <span class="ef-validation-message__mark" aria-hidden="true">!</span>
      Use an https:// address. Plain http is not accepted for webhooks.
    </p>
  </div>
</ef-text-field>`
    },
    {
      id: "read-only-and-disabled",
      title: "Read-only and disabled values",
      description: "A generated identifier the user may select and copy (readonly: focusable and submitted) beside a field that does not apply to the current plan (disabled: skipped by focus and not submitted). Each description explains why the value cannot be edited.",
      html: `<ef-text-field class="ef-component-tag">
  <div class="ef-stack">
    <div class="ef-field">
      <label class="ef-field__label" for="text-field-read-only-client-id">Client ID</label>
      <span class="ef-field__description" id="text-field-read-only-client-id-description">Generated by the platform. Select the value to copy it.</span>
      <input id="text-field-read-only-client-id" name="client-id" type="text" value="cli_7f3a9c21e84b" readonly spellcheck="false" aria-describedby="text-field-read-only-client-id-description">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="text-field-read-only-domain">Custom sign-in domain</label>
      <span class="ef-field__description" id="text-field-read-only-domain-description">Available on the Enterprise plan.</span>
      <input id="text-field-read-only-domain" name="custom-domain" type="text" disabled aria-describedby="text-field-read-only-domain-description">
    </div>
  </div>
</ef-text-field>`
    },
    {
      id: "numeric-and-phone",
      title: "Quantity and phone number",
      description: "Type-specific inputs. The number field uses native min, max and step constraints; the telephone field uses type=tel so phones show a dial pad, with no pattern forced because phone formats vary by country.",
      html: `<ef-text-field class="ef-component-tag">
  <div class="ef-grid">
    <div class="ef-field">
      <label class="ef-field__label" for="text-field-numeric-seats">Seats</label>
      <span class="ef-field__description" id="text-field-numeric-seats-description">1 to 500.</span>
      <input id="text-field-numeric-seats" name="seats" type="number" min="1" max="500" step="1" value="25" aria-describedby="text-field-numeric-seats-description">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="text-field-numeric-phone">On-call phone</label>
      <span class="ef-field__description" id="text-field-numeric-phone-description">Include the country code.</span>
      <input id="text-field-numeric-phone" name="on-call-phone" type="tel" autocomplete="tel" aria-describedby="text-field-numeric-phone-description">
    </div>
  </div>
</ef-text-field>`
    },
    {
      id: "mobile-contact-details",
      title: "Mobile contact details",
      description: "A billing contact form at phone width. Each field is full width, labels and descriptions wrap, and input types choose the right on-screen keyboard.",
      mobile: {
        height: 460,
        notes: [
          "Inputs are `inline-size: 100%` of their column, so fields fill the phone width and never overflow horizontally.",
          "Every input keeps a 2.75rem (44px) minimum height, a comfortable touch target.",
          "Long labels and descriptions wrap onto several lines above the control; the label-description-control order never changes.",
          "type=email and type=tel select the email and dial-pad keyboards; autocomplete tokens let the platform offer saved contact details.",
          "Rotating to landscape only widens the fields."
        ]
      },
      html: `<ef-text-field class="ef-component-tag">
  <div class="ef-stack">
    <div class="ef-field">
      <label class="ef-field__label" for="text-field-mobile-name">Billing contact name</label>
      <input id="text-field-mobile-name" name="billing-name" type="text" autocomplete="name">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="text-field-mobile-email">Invoice email address</label>
      <span class="ef-field__description" id="text-field-mobile-email-description">Invoices and payment receipts are sent here, not to your sign-in address.</span>
      <input id="text-field-mobile-email" name="billing-email" type="email" autocomplete="email" aria-describedby="text-field-mobile-email-description">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="text-field-mobile-phone">Phone</label>
      <input id="text-field-mobile-phone" name="billing-phone" type="tel" autocomplete="tel">
    </div>
  </div>
</ef-text-field>`
    }
  ],
  api: {
    attributes: [
      { name: "for", on: "label.ef-field__label", values: "id of the input", default: "—", description: "Associates the visible label with the input so it becomes the accessible name and clicking the label focuses the field." },
      { name: "type", on: "input", values: "text | email | password | url | tel | number", default: "text", description: "Chooses native validation, on-screen keyboard and autofill behavior. Use date/time types through [[date-time-field]]." },
      { name: "name", on: "input", values: "string", default: "—", description: "Form field name used on submission." },
      { name: "value", on: "input", values: "string", default: "empty", description: "Initial value; the live value is owned by the browser." },
      { name: "autocomplete", on: "input", values: "email | username | current-password | name | tel | …", default: "browser heuristic", description: "Tells the browser and password managers what the field holds so they can offer saved values." },
      { name: "required", on: "input", values: "boolean", default: "absent", description: "Native constraint: the form will not submit while the field is empty." },
      { name: "minlength", on: "input", values: "integer", default: "—", description: "Native minimum length constraint for text-like types." },
      { name: "min", on: "input", values: "number", default: "—", description: "Lower bound for type=number." },
      { name: "max", on: "input", values: "number", default: "—", description: "Upper bound for type=number." },
      { name: "step", on: "input", values: "number | any", default: "1", description: "Allowed increment for type=number; also the amount ArrowUp/ArrowDown change the value." },
      { name: "inputmode", on: "input", values: "url | numeric | decimal | tel | email | …", default: "from type", description: "Keyboard hint for touch devices when the type alone does not select the right keyboard." },
      { name: "spellcheck", on: "input", values: "false", default: "browser default", description: "Turns off spelling marks for identifiers and addresses." },
      { name: "readonly", on: "input", values: "boolean", default: "absent", description: "The value can be focused, selected and copied, and is submitted, but cannot be edited." },
      { name: "disabled", on: "input", values: "boolean", default: "absent", description: "Removes the field from focus order and from form submission." },
      { name: "aria-describedby", on: "input", values: "id list", default: "—", description: "Links the `.ef-field__description` and, when present, a validation message, in reading order." },
      { name: "aria-invalid", on: "input", values: "true", default: "absent", description: "Set by the application when a submitted or checked value is rejected, together with a linked [[validation-message]]." }
    ],
    hooks: {
      "ef-field": "Root grid for one field: label, optional description, control and optional validation message stacked with a 0.5rem gap.",
      "ef-field__label": "Visible label text (0.9375rem, weight 650). Put it on the `label` element itself.",
      "ef-field__description": "Supporting guidance in secondary text color at 0.8125rem; referenced by aria-describedby."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus to and from the input. Disabled inputs are skipped; read-only inputs are focusable." },
      { keys: "ArrowUp / ArrowDown", action: "On type=number, increments or decrements by step within min and max (native behavior)." },
      { keys: "Enter", action: "Submits the owning form through native implicit submission." }
    ],
    events: [
      { name: "input / change / invalid", description: "Native events from the input. Forma adds none; the application listens to these when it validates or saves." }
    ],
    form: "A native input: submits name=value, participates in constraint validation (required, type, min, max, minlength, step), is reset by form reset, and is excluded from submission when disabled."
  },
  states: [
    { name: "Default", how: "no state attributes", description: "Functional border on the primary surface." },
    { name: "Focus", how: ":focus-visible", description: "Two-tone focus ring (gap outline plus ring shadow) from the foundation layer, visible on light and dark surfaces." },
    { name: "Required", how: "required attribute", description: "Native constraint only; Forma adds no asterisk, so say \"required\" or \"optional\" in the label or description where it matters." },
    { name: "Invalid", how: "aria-invalid=\"true\" plus a linked .ef-validation-message", description: "The validation message carries the visible error with a non-color mark. Forma does not restyle the input border for aria-invalid or :user-invalid." },
    { name: "Read-only", how: "readonly attribute", description: "Behaves natively (focusable, selectable, submitted). Forma applies no distinct read-only styling, so the description must say the value is not editable." },
    { name: "Disabled", how: "disabled attribute", description: "Skipped by focus and not submitted. The foundation layer sets explicit input colors, so the browser's dimmed disabled look is not guaranteed; explain the reason in the description." }
  ],
  accessibility: {
    forma: [
      "The canonical structure uses a real `label` with `for`, so the label is the accessible name and a larger click target.",
      "Inputs keep a 44px minimum height and a high-contrast two-tone focus ring.",
      "Borders map to CanvasText in forced-colors mode, so field edges stay visible.",
      "`.ef-validation-message` shows errors with a text mark as well as weight, not by color alone."
    ],
    consumer: [
      "Give every input a unique id and a visible label; do not use placeholder text as the label.",
      "Link descriptions and error messages with aria-describedby, and set aria-invalid=\"true\" only while the error is shown.",
      "Write error messages that say how to fix the value, and move focus or summarize errors with [[validation-summary]] on submit when several fields fail.",
      "Use correct type and autocomplete values so assistive technology, autofill and on-screen keyboards work.",
      "Explain why a field is read-only or disabled in its description."
    ]
  },
  responsive: [
    "Inputs are block-level to their field: `inline-size: 100%` with `max-inline-size: 100%`, so they follow the container width.",
    "The field is a single-column grid; long labels and descriptions wrap (`overflow-wrap: anywhere` on labels) instead of widening the page.",
    "There are no breakpoints. Place fields in [[stack]] for a single column or [[grid]] for side-by-side fields that collapse to one column when narrow.",
    "The 44px minimum height is kept at every width."
  ],
  motion: [
    "No animation: text inputs, labels and descriptions do not transition. Focus and validation changes appear immediately."
  ],
  guidance: {
    do: [
      "Keep the order label, description, control, validation message, and keep the description short.",
      "Validate on submit or on leaving the field, not on every keystroke, and keep the user's input when showing an error.",
      "Use type=password with autocomplete=current-password or new-password so password managers work."
    ],
    avoid: [
      "Placeholder-only labels, which disappear on typing and often fail contrast.",
      "Using type=number for identifiers such as account numbers or ZIP codes; use type=text with inputmode=numeric.",
      "Relying on the dimmed look of a disabled field to communicate why it is unavailable."
    ]
  },
  related: [
    { slug: "textarea", note: "Same .ef-field structure for multi-line text." },
    { slug: "date-time-field", note: "Same .ef-field structure with native date, time and datetime-local inputs." },
    { slug: "numeric-stepper", note: "A bounded number entry with its own compact width, for counts and quantities." },
    { slug: "search", note: "A query field with search landmark, clear action and result-count status." },
    { slug: "validation-message", note: "The inline error line linked to an invalid field." }
  ]
};
