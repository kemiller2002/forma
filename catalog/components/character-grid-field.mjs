export default {
  name: "Character grid field",
  category: "keyboard",
  behavior: "Native HTML",
  summary: "Protected text and native editable fields placed on a character grid with explicit capacity, preceding labels, and shape-based required, invalid, disabled, and read-only cues.",
  purpose: {
    description: "Character grid fields are the editable parts of a [[character-grid]] screen. Each field is a native `input` positioned on its cells, preceded by a `label for` run, with `maxlength` equal to its `data-ef-len` so the visible capacity and the real capacity agree. Everything that is not editable stays protected text. The browser owns typing, Tab order, `maxlength`, `required` and form submission; the application owns validation policy, `aria-invalid`, messages and initial focus.",
    useWhen: [
      "A character-grid screen needs data entry: sign-on, inquiry criteria, record maintenance.",
      "The field width must show its exact capacity in cells, as on a host screen.",
      "Required, invalid, disabled and read-only states must stay distinguishable in grayscale and forced colors."
    ],
    avoidWhen: [
      "Showing a value the user cannot change: use protected `ef-character-grid__value` text, not a readonly input (CG-9).",
      "Ordinary application forms outside a grid: use [[text-field]], [[select]] and [[textarea]].",
      "A per-row option column in a list: use [[character-grid-selection]], which names each field by its column and row headers."
    ],
    characteristics: [
      "Fields are exactly their declared cells wide and one row pitch tall; the value never pushes neighboring runs.",
      "State cues differ in shape: solid underline (editable), double underline (required), dashed rules above and below (invalid), dotted underline (disabled), thin underline (read-only).",
      "Leader dots in labels are `aria-hidden`, so the accessible name is \"Account\", not \"Account dot dot dot colon\".",
      "Forma does not style `:invalid`; the application decides when a value is wrong and sets `aria-invalid`."
    ]
  },
  examples: [
    {
      id: "sign-on",
      title: "Sign-on with required fields",
      description: "Two required fields and one optional field. Password fields keep their native type and autocomplete tokens; each requirement is stated in a visible hint as well as by the double underline.",
      html: `<ef-character-grid-field class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="8" data-ef-columns="50" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-field-sign-on-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-field-sign-on-title" data-ef-row="1" data-ef-col="19" data-ef-len="14" data-ef-emphasis="intensified">SYSTEM SIGN ON</h2>
        <label class="ef-character-grid__label" for="character-grid-field-sign-on-user" data-ef-row="3" data-ef-col="2" data-ef-len="16">User ID<span class="ef-character-grid__leader" aria-hidden="true"> . . . :</span></label>
        <input class="ef-character-grid__field" id="character-grid-field-sign-on-user" name="user" type="text" maxlength="8" required autocomplete="username" aria-describedby="character-grid-field-sign-on-user-hint" data-ef-row="3" data-ef-col="20" data-ef-len="8">
        <span class="ef-character-grid__text" id="character-grid-field-sign-on-user-hint" data-ef-row="3" data-ef-col="31" data-ef-len="10" data-ef-emphasis="muted">(required)</span>
        <label class="ef-character-grid__label" for="character-grid-field-sign-on-password" data-ef-row="4" data-ef-col="2" data-ef-len="16">Password<span class="ef-character-grid__leader" aria-hidden="true">  . . :</span></label>
        <input class="ef-character-grid__field" id="character-grid-field-sign-on-password" name="password" type="password" maxlength="8" required autocomplete="current-password" aria-describedby="character-grid-field-sign-on-password-hint" data-ef-row="4" data-ef-col="20" data-ef-len="8">
        <span class="ef-character-grid__text" id="character-grid-field-sign-on-password-hint" data-ef-row="4" data-ef-col="31" data-ef-len="10" data-ef-emphasis="muted">(required)</span>
        <label class="ef-character-grid__label" for="character-grid-field-sign-on-new" data-ef-row="5" data-ef-col="2" data-ef-len="16">New password<span class="ef-character-grid__leader" aria-hidden="true"> :</span></label>
        <input class="ef-character-grid__field" id="character-grid-field-sign-on-new" name="new-password" type="password" maxlength="8" autocomplete="new-password" aria-describedby="character-grid-field-sign-on-new-hint" data-ef-row="5" data-ef-col="20" data-ef-len="8">
        <span class="ef-character-grid__text" id="character-grid-field-sign-on-new-hint" data-ef-row="5" data-ef-col="31" data-ef-len="17" data-ef-emphasis="muted">(optional, 8 max)</span>
        <p class="ef-character-grid__text" data-ef-row="7" data-ef-col="2" data-ef-len="29">Passwords are case sensitive.</p>
        <div class="ef-character-grid__group" role="group" aria-label="Function keys">
          <button class="ef-character-grid__key" type="submit" name="action" value="enter" data-ef-action="enter" data-ef-row="8" data-ef-col="2" data-ef-len="13"><kbd>Enter</kbd>=Sign on</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-ef-action="pf3" data-ef-row="8" data-ef-col="17" data-ef-len="8"><kbd>PF3</kbd>=Exit</button>
        </div>
      </form>
    </div>
  </div>
</ef-character-grid-field>`
    },
    {
      id: "address-validation",
      title: "Validation error after Enter",
      description: "The application rejected two values. Each invalid field has `aria-invalid=\"true\"` and lists both its format hint and the shared message in `aria-describedby`. The message reserves two rows with `data-ef-height` because its length varies.",
      html: `<ef-character-grid-field class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="10" data-ef-columns="60" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-field-address-validation-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-field-address-validation-title" data-ef-row="1" data-ef-col="22" data-ef-len="17" data-ef-emphasis="intensified">CHANGE OF ADDRESS</h2>
        <span class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="16">Account<span class="ef-character-grid__leader" aria-hidden="true"> . . . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="3" data-ef-col="20" data-ef-len="13">00417-2231-09</span>
        <label class="ef-character-grid__label" for="character-grid-field-address-validation-street" data-ef-row="4" data-ef-col="2" data-ef-len="16">Street<span class="ef-character-grid__leader" aria-hidden="true">  . . . :</span></label>
        <input class="ef-character-grid__field" id="character-grid-field-address-validation-street" name="street" type="text" maxlength="30" required value="1200 HARBOR VIEW DR" autocomplete="off" data-ef-row="4" data-ef-col="20" data-ef-len="30">
        <label class="ef-character-grid__label" for="character-grid-field-address-validation-postal" data-ef-row="5" data-ef-col="2" data-ef-len="16">Postal code<span class="ef-character-grid__leader" aria-hidden="true"> . :</span></label>
        <input class="ef-character-grid__field" id="character-grid-field-address-validation-postal" name="postal" type="text" maxlength="10" required value="9720" aria-invalid="true" aria-describedby="character-grid-field-address-validation-postal-hint character-grid-field-address-validation-message" autocomplete="off" data-ef-row="5" data-ef-col="20" data-ef-len="10">
        <span class="ef-character-grid__text" id="character-grid-field-address-validation-postal-hint" data-ef-row="5" data-ef-col="32" data-ef-len="12" data-ef-emphasis="muted">(99999-9999)</span>
        <label class="ef-character-grid__label" for="character-grid-field-address-validation-date" data-ef-row="6" data-ef-col="2" data-ef-len="16">Move date<span class="ef-character-grid__leader" aria-hidden="true">  . . :</span></label>
        <input class="ef-character-grid__field" id="character-grid-field-address-validation-date" name="move-date" type="text" maxlength="10" value="2026-02-30" aria-invalid="true" aria-describedby="character-grid-field-address-validation-date-hint character-grid-field-address-validation-message" autocomplete="off" data-ef-row="6" data-ef-col="20" data-ef-len="10">
        <span class="ef-character-grid__text" id="character-grid-field-address-validation-date-hint" data-ef-row="6" data-ef-col="32" data-ef-len="12" data-ef-emphasis="muted">(YYYY-MM-DD)</span>
        <p class="ef-character-grid__message" id="character-grid-field-address-validation-message" role="alert" data-ef-severity="validation" data-ef-row="8" data-ef-col="2" data-ef-len="58" data-ef-height="2"><span class="ef-character-grid__severity"><span>CHECK</span></span> Postal code needs 5 or 9 digits. Move date is not a real date.</p>
        <div class="ef-character-grid__group" role="group" aria-label="Function keys">
          <button class="ef-character-grid__key" type="submit" name="action" value="enter" data-ef-action="enter" data-ef-row="10" data-ef-col="2" data-ef-len="12"><kbd>Enter</kbd>=Update</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="pf12" formnovalidate data-ef-action="pf12" data-ef-row="10" data-ef-col="16" data-ef-len="11"><kbd>PF12</kbd>=Cancel</button>
        </div>
      </form>
    </div>
  </div>
</ef-character-grid-field>`
    },
    {
      id: "short-codes",
      title: "Short codes and touch spacing",
      description: "One- and two-cell code fields. Each is followed by at least five blank cells before its hint (CG-13), so the 2.75rem touch minimum on phones paints into empty cells instead of covering the hint.",
      html: `<ef-character-grid-field class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="6" data-ef-columns="60" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-field-short-codes-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-field-short-codes-title" data-ef-row="1" data-ef-col="22" data-ef-len="17" data-ef-emphasis="intensified">TRANSACTION ENTRY</h2>
        <label class="ef-character-grid__label" for="character-grid-field-short-codes-action" data-ef-row="3" data-ef-col="2" data-ef-len="16">Action code<span class="ef-character-grid__leader" aria-hidden="true"> . :</span></label>
        <input class="ef-character-grid__field" id="character-grid-field-short-codes-action" name="action-code" type="text" maxlength="1" required pattern="[ACD]" aria-describedby="character-grid-field-short-codes-action-hint" autocomplete="off" data-ef-row="3" data-ef-col="20" data-ef-len="1">
        <span class="ef-character-grid__text" id="character-grid-field-short-codes-action-hint" data-ef-row="3" data-ef-col="26" data-ef-len="25" data-ef-emphasis="muted">(A=Add C=Change D=Delete)</span>
        <label class="ef-character-grid__label" for="character-grid-field-short-codes-region" data-ef-row="4" data-ef-col="2" data-ef-len="16">Region<span class="ef-character-grid__leader" aria-hidden="true">  . . . :</span></label>
        <input class="ef-character-grid__field" id="character-grid-field-short-codes-region" name="region" type="text" maxlength="2" value="NE" aria-describedby="character-grid-field-short-codes-region-hint" autocomplete="off" data-ef-row="4" data-ef-col="20" data-ef-len="2">
        <span class="ef-character-grid__text" id="character-grid-field-short-codes-region-hint" data-ef-row="4" data-ef-col="26" data-ef-len="13" data-ef-emphasis="muted">(two letters)</span>
        <label class="ef-character-grid__label" for="character-grid-field-short-codes-amount" data-ef-row="5" data-ef-col="2" data-ef-len="16">Amount<span class="ef-character-grid__leader" aria-hidden="true">  . . . :</span></label>
        <input class="ef-character-grid__field" id="character-grid-field-short-codes-amount" name="amount" type="text" inputmode="decimal" maxlength="12" autocomplete="off" data-ef-row="5" data-ef-col="20" data-ef-len="12">
      </form>
    </div>
  </div>
</ef-character-grid-field>`
    },
    {
      id: "payment-mobile",
      title: "Payment entry on a phone",
      description: "A small entry screen at phone width. Rows grow to the 44px touch pitch and the numeric field asks the on-screen keyboard for digits with `inputmode`.",
      mobile: {
        height: 400,
        notes: [
          "Below 40rem the row pitch becomes 2.75rem, so each field is a 44px-tall target; field widths stay tied to their cells.",
          "Fields shorter than 2.75rem get a minimum width that extends into the blank cells after them, never over the next run.",
          "The 40-column grid fits most phones in portrait; wider grids scroll inside the viewport and the page does not scroll sideways.",
          "`inputmode=\"decimal\"` brings up a numeric keyboard; the visible capacity still matches `maxlength`."
        ]
      },
      html: `<ef-character-grid-field class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="6" data-ef-columns="40" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-field-payment-mobile-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-field-payment-mobile-title" data-ef-row="1" data-ef-col="14" data-ef-len="13" data-ef-emphasis="intensified">PAYMENT ENTRY</h2>
        <label class="ef-character-grid__label" for="character-grid-field-payment-mobile-amount" data-ef-row="3" data-ef-col="2" data-ef-len="12">Amount<span class="ef-character-grid__leader" aria-hidden="true"> . . :</span></label>
        <input class="ef-character-grid__field" id="character-grid-field-payment-mobile-amount" name="amount" type="text" inputmode="decimal" maxlength="10" required autocomplete="off" data-ef-row="3" data-ef-col="15" data-ef-len="10">
        <label class="ef-character-grid__label" for="character-grid-field-payment-mobile-reference" data-ef-row="4" data-ef-col="2" data-ef-len="12">Reference<span class="ef-character-grid__leader" aria-hidden="true"> :</span></label>
        <input class="ef-character-grid__field" id="character-grid-field-payment-mobile-reference" name="reference" type="text" maxlength="12" value="INV-1042" autocomplete="off" data-ef-row="4" data-ef-col="15" data-ef-len="12">
        <div class="ef-character-grid__group" role="group" aria-label="Function keys">
          <button class="ef-character-grid__key" type="submit" name="action" value="enter" data-ef-action="enter" data-ef-row="6" data-ef-col="2" data-ef-len="10"><kbd>Enter</kbd>=Pay</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-ef-action="pf3" data-ef-row="6" data-ef-col="14" data-ef-len="8"><kbd>PF3</kbd>=Exit</button>
        </div>
      </form>
    </div>
  </div>
</ef-character-grid-field>`
    }
  ],
  api: {
    attributes: [
      { name: "for", on: "label.ef-character-grid__label", values: "id of the field", default: "—", description: "Required (CG-8). The label run must precede its field in source order." },
      { name: "type", on: "input", values: "text | password", default: "text", description: "Native input type. Keep `password` for secrets so the browser masks and protects the value." },
      { name: "maxlength", on: "input", values: "integer", default: "—", description: "Required. Must equal `data-ef-len`, so visible capacity and real capacity agree (CG-8)." },
      { name: "name", on: "input", values: "string", default: "—", description: "Form field name submitted with the screen." },
      { name: "value", on: "input", values: "string", default: "empty", description: "Initial value rendered by the application." },
      { name: "required", on: "input", values: "boolean", default: "absent", description: "Native requirement; draws a double underline. Also say \"required\" in the label or hint." },
      { name: "aria-invalid", on: "input", values: "true", default: "absent", description: "Set by the application after validation; draws dashed rules above and below. The field must also reference its message." },
      { name: "aria-describedby", on: "input", values: "one or more ids", default: "—", description: "Hint and, when invalid, the message ID: `aria-describedby=\"hint message\"`." },
      { name: "disabled", on: "input", values: "boolean", default: "absent", description: "Removes the field from Tab order and submission; dotted underline and muted text." },
      { name: "readonly", on: "input", values: "boolean", default: "absent", description: "Only for genuine read-only form values the application reads back; thin underline, no surface. Otherwise use protected text." },
      { name: "inputmode", on: "input", values: "numeric | decimal | …", default: "—", description: "Chooses the on-screen keyboard without changing validation." },
      { name: "pattern", on: "input", values: "regular expression", default: "—", description: "Optional native constraint. Forma does not style `:invalid`; the application reports errors." },
      { name: "autocomplete", on: "input", values: "token", default: "—", description: "Use real tokens (`username`, `current-password`) or `off` for host codes." }
    ],
    hooks: {
      "ef-character-grid__label": "Protected label run for a field. Keeps protected text color and a default cursor.",
      "ef-character-grid__leader": "Decorative leader characters inside the label, muted and `aria-hidden=\"true\"`.",
      "ef-character-grid__field": "The native input run: field surface, bottom boundary, no radius, exactly its cells wide. Where `field-sizing: content` is supported it widens under text-spacing overrides.",
      "ef-character-grid__text": "Protected hint or prose run, commonly referenced by `aria-describedby`.",
      "ef-character-grid__value": "Protected value. Use this, not a readonly input, for data the user cannot change.",
      "data-ef-len": "Field width in cells; must equal `maxlength`.",
      "aria-invalid": "`true` draws the invalid cue: dashed rules above and below in `--ef-grid-validation`.",
      "--ef-grid-field": "Field text color.",
      "--ef-grid-field-surface": "Field background. Disabled and read-only fields are transparent.",
      "--ef-grid-boundary": "Field underline color.",
      "--ef-grid-validation": "Color of the invalid rules and validation messages.",
      "--ef-grid-focus": "Focus outline color."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between fields in row-major order, skipping disabled fields natively." },
      { keys: "Typing", action: "Native text entry, stopped at `maxlength`." },
      { keys: "Enter", action: "Native implicit submission through the form's first submit button (the Enter key in [[character-grid-keys]])." }
    ],
    events: [
      { name: "input / change", description: "Native events from the field." },
      { name: "invalid", description: "Native event when `required` or `pattern` blocks submission. The application still sets `aria-invalid` and the message." }
    ],
    form: "Fields are native form controls: named values submit with the surface form, `required` blocks a submit key without `formnovalidate`, disabled fields do not submit, and readonly fields do."
  },
  states: [
    { name: "Editable", how: "input.ef-character-grid__field", description: "Field surface with a solid 2px bottom boundary." },
    { name: "Required", how: "required / :required", description: "Double 4px bottom boundary. The label or hint also says required." },
    { name: "Invalid", how: "aria-invalid=\"true\"", description: "Dashed rules above and below, with no inline border, so the field stays exactly its cells." },
    { name: "Disabled", how: "disabled / :disabled", description: "Dotted bottom boundary, transparent surface, muted text, not-allowed cursor; skipped by Tab." },
    { name: "Read-only", how: "readonly / :read-only", description: "Thin 1px bottom boundary and no surface." },
    { name: "Focus", how: ":focus-visible", description: "2px outline in `--ef-grid-focus`; Highlight in forced colors. Profiles may add a caret treatment but not remove the outline." }
  ],
  accessibility: {
    forma: [
      "Keeps fields native, so name, role, value, required and disabled state come from the platform.",
      "Hides leader characters from the accessible name with the markup contract `aria-hidden=\"true\"`.",
      "Distinguishes states by boundary shape, not only color; in forced colors boundaries use CanvasText and disabled text uses GrayText.",
      "Rows are at least 24px; on narrow or coarse-pointer screens fields are at least 44px tall and 2.75rem wide."
    ],
    consumer: [
      "Precede every field with a `label for` run and keep `maxlength` equal to `data-ef-len`.",
      "After validation set `aria-invalid=\"true\"` and add the message ID to `aria-describedby`; clear both when the value is fixed.",
      "State requirements and formats in visible text, not only through the underline.",
      "Choose initial focus when the screen appears, typically the first invalid field, otherwise the first field.",
      "Leave at least five cells between a field shorter than five cells and the next run (CG-13)."
    ]
  },
  responsive: [
    "Fields are exactly `data-ef-len` cells wide and one row pitch tall at every width.",
    "Below 40rem or on a coarse pointer, fields and rows reach 44px; short fields paint into the blank cells after them without widening the tracks.",
    "Under text-spacing overrides, supporting browsers widen the field to its value (`field-sizing: content`); others scroll the value inside the field.",
    "Narrow-screen containment or reflow is set on the grid; see [[character-grid]]."
  ],
  motion: [
    "No animation: state cues and focus appear immediately.",
    "Fields are never part of SequentialReveal; only protected text can reveal."
  ],
  guidance: {
    do: [
      "Use protected text for everything the user cannot edit.",
      "Keep hints short and on the same row after the field, leaving blank cells between."
    ],
    avoid: [
      "Styling a `div` or `span` to look like a field.",
      "Relying on `:invalid` or color alone to report errors.",
      "Readonly inputs for display values; they are focusable and announced as edit fields."
    ]
  },
  related: [
    { slug: "character-grid", note: "The grid that places fields; owns geometry and every data-ef-* hook." },
    { slug: "character-grid-selection", note: "Option fields in each row of a positioned list, named by column and row headers." },
    { slug: "character-grid-status", note: "The message a field references when it is invalid." },
    { slug: "text-field", note: "Use for ordinary forms outside a character grid." }
  ]
};
