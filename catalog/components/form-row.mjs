export default {
  name: "Form row",
  category: "layout",
  behavior: "Native HTML",
  summary: "Peer form fields side by side whose controls share one top edge however long their labels, descriptions or validation messages are; fields wrap to new rows by available width.",
  owns: ["ef-form-row"],
  purpose: {
    description: "A form row places related [[text-field]], [[select]] and [[date-time-field]] fields side by side and keeps their controls aligned. Every `.ef-field` in the row spans the same four subgrid rows: label, description, control and validation message. A field without a description or message leaves its row empty, so its control still starts on the same line as its peers' controls (visual-engineering/UI-LAYOUT-INTERACTION@1.0.0 ULI-L01). Columns are as wide as `--ef-form-row-min` allows and wrap into new rows on narrow screens. Use it instead of a generic [[grid]] whenever the children are fields, and instead of local margins that nudge one control into line (ULI-L13).",
    useWhen: [
      "Two or more short, related fields belong on one line: given and family name, date and time, quantity and unit, city and postal code.",
      "Peer fields have different label lengths, a description on only some of them, or a validation message that appears on one of them.",
      "A form must keep one column on phones and several columns on wider screens without a breakpoint."
    ],
    avoidWhen: [
      "The fields are not peers, or the reading order would be unclear side by side: use a single-column [[stack]].",
      "The children are cards, summaries or other non-field content: use [[grid]] or [[responsive-grid]].",
      "A field needs a different layout of its own parts (an inline unit, a button beside the input): wrap those parts in one container element so the field keeps a single control row."
    ],
    characteristics: [
      "Each direct `.ef-field` child spans four subgrid rows; its label, description, control and `.ef-validation-message` are placed in rows 1 to 4.",
      "Controls in one visual row share their top edge; labels share theirs too.",
      "Columns are `repeat(auto-fit, minmax(min(100%, var(--ef-form-row-min)), 1fr))`; the default minimum is 14rem.",
      "Without subgrid support, each field falls back to its own grid, which is the plain `.ef-field` layout."
    ]
  },
  basicAlignment: [
    { ruleId: "ULI-L01", id: "personal-details-controls", edge: "top", peers: [
      { role: "textbox", name: "Given name" },
      { role: "textbox", name: "Family name" },
      { role: "textbox", name: "Date of birth" }
    ] }
  ],
  examples: [
    {
      id: "error-on-one-field",
      title: "Validation message on one field",
      description: "City and postal code after the application rejected the postal code. The validation message occupies the fourth row of its own field only; the City control stays level with the postal code control, and the message does not push either control down.",
      alignment: [
        { ruleId: "ULI-L01", id: "address-controls", edge: "top", peers: [
          { role: "textbox", name: "City" },
          { role: "textbox", name: "Postal code" }
        ] }
      ],
      html: `<ef-form-row class="ef-component-tag">
  <div class="ef-form-row">
    <div class="ef-field">
      <label class="ef-field__label" for="form-row-error-city">City</label>
      <input id="form-row-error-city" name="city" type="text" autocomplete="address-level2" value="Rotterdam">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="form-row-error-postal-code">Postal code</label>
      <span class="ef-field__description" id="form-row-error-postal-code-description">Four digits and two letters.</span>
      <input id="form-row-error-postal-code" name="postal-code" type="text" autocomplete="postal-code" value="30111" aria-invalid="true" aria-describedby="form-row-error-postal-code-description form-row-error-postal-code-error">
      <p class="ef-validation-message" id="form-row-error-postal-code-error">
        <span class="ef-validation-message__mark" aria-hidden="true">!</span>
        Add the two letters, for example 3011 AB.
      </p>
    </div>
  </div>
</ef-form-row>`
    },
    {
      id: "translated-labels",
      title: "Long translated labels",
      description: "German labels of very different lengths beside a select. The long label wraps onto several lines in its own column; the label row grows for every field in the visual row, so all three controls still start on one line.",
      alignment: [
        { ruleId: "ULI-L01", id: "contract-controls", edge: "top", peers: [
          { role: "textbox", name: "Vertragsbeginn" },
          { role: "spinbutton", name: "Kündigungsfrist in Monaten nach Ablauf der Mindestvertragslaufzeit" },
          { role: "combobox", name: "Tarif" }
        ] }
      ],
      html: `<ef-form-row class="ef-component-tag">
  <div class="ef-form-row" lang="de">
    <div class="ef-field">
      <label class="ef-field__label" for="form-row-translated-start">Vertragsbeginn</label>
      <input id="form-row-translated-start" name="contract-start" type="date">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="form-row-translated-notice">Kündigungsfrist in Monaten nach Ablauf der Mindestvertragslaufzeit</label>
      <input id="form-row-translated-notice" name="notice-months" type="number" min="1" max="12" value="3">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="form-row-translated-plan">Tarif</label>
      <select id="form-row-translated-plan" name="plan">
        <option>Basis</option>
        <option selected>Plus</option>
        <option>Unternehmen</option>
      </select>
    </div>
  </div>
</ef-form-row>`
    },
    {
      id: "mobile-stacked-row",
      title: "Stacked on a phone",
      description: "The basic row at phone width. Each field takes the full width in source order; nothing overflows and the label, description and control order is unchanged.",
      mobile: {
        height: 420,
        notes: [
          "Below twice the column minimum the row has one column, so each field is a full-width block in source order.",
          "Empty description and message rows collapse to nothing, so stacked fields keep the ordinary field spacing.",
          "Enlarging the text widens the columns' minimum (it is in rem), so the row stacks sooner instead of squeezing the controls.",
          "There are no breakpoints: the same markup produces one, two or three columns by available width."
        ]
      },
      html: `<ef-form-row class="ef-component-tag">
  <div class="ef-form-row">
    <div class="ef-field">
      <label class="ef-field__label" for="form-row-mobile-given-name">Given name</label>
      <input id="form-row-mobile-given-name" name="given-name" type="text" autocomplete="given-name">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="form-row-mobile-family-name">Family name</label>
      <span class="ef-field__description" id="form-row-mobile-family-name-description">As printed on your passport or national identity card.</span>
      <input id="form-row-mobile-family-name" name="family-name" type="text" autocomplete="family-name" aria-describedby="form-row-mobile-family-name-description">
    </div>
  </div>
</ef-form-row>`
    }
  ],
  api: {
    attributes: [
      { name: "class=\"ef-field\"", on: "each direct child", values: "—", description: "Each peer is an ordinary [[text-field]] structure: label, optional description, one control and an optional [[validation-message]]." },
      { name: "for", on: "label.ef-field__label", values: "id of the control", default: "—", description: "Associates the visible label with its control." },
      { name: "aria-describedby", on: "the control", values: "id list", default: "—", description: "Links the description and, when shown, the validation message, in reading order." }
    ],
    hooks: {
      "ef-form-row": "Grid of peer fields. Columns `repeat(auto-fit, minmax(min(100%, var(--ef-form-row-min)), 1fr))`; each direct `.ef-field` spans four subgrid rows (label, description, control, validation message).",
      "--ef-form-row-min": "Minimum column width before fields wrap to a new row. Default 14rem.",
      "--ef-form-row-gap": "Space between columns and between wrapped rows of fields. Default `--ef-primitive-spacing-4` (1rem)."
    },
    keyboard: [],
    events: []
  },
  states: [
    { name: "Default", how: "no state attributes", description: "Peer controls share a top edge; empty description or message rows take no space." },
    { name: "Field with a validation message", how: "a `.ef-validation-message` inside one field", description: "The message fills the fourth row of its own field; peers' controls do not move." },
    { name: "Wrapped", how: "available width below the column minimum", description: "Fields continue on a new row of the same four-row structure, or stack in one column." }
  ],
  accessibility: {
    forma: [
      "Visual order equals source order at every width, so reading and focus order match what is seen.",
      "Rows never clip or overlap labels; long labels wrap and the row grows.",
      "Aligned controls make the row easy to scan for people using magnification."
    ],
    consumer: [
      "Put only genuinely related peers in one row and keep their order logical (for example given name before family name where that is the local convention).",
      "Give each field a visible label and link descriptions and messages with aria-describedby.",
      "Keep one control element per field; wrap composite controls in a single container."
    ]
  },
  responsive: [
    "Columns wrap by available width with no media queries: three, two or one column from the same markup.",
    "`--ef-form-row-min` is in rem, so enlarged text stacks the fields sooner instead of shrinking the controls.",
    "Controls keep the shared intrinsic block size of single-line fields at every width."
  ],
  motion: [
    "No animation. Showing a validation message grows its own field's fourth row; other fields' controls do not move."
  ],
  guidance: {
    do: [
      "Use a form row for short peer fields and a [[stack]] for everything else.",
      "Write the description or error inside the field it belongs to; the row keeps the controls level.",
      "Override `--ef-form-row-min` on the row when its fields need wider or narrower columns."
    ],
    avoid: [
      "Adding top margins or empty description elements to line controls up by hand.",
      "Putting buttons, headings or non-field content directly in the row.",
      "Two controls in one field, which would share the control row and overlap."
    ]
  },
  related: [
    { slug: "text-field", note: "The `.ef-field` structure each peer uses." },
    { slug: "date-time-field", note: "Date and time fields commonly paired in a row." },
    { slug: "grid", note: "A general responsive grid for cards and content, without field row alignment." },
    { slug: "stack", note: "A single-column form layout." },
    { slug: "validation-message", note: "The error line that occupies a field's fourth row." }
  ]
};
