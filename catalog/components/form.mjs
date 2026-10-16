const resetThenSave = ({ fieldRole = "textbox", fieldName, changed, initial, save, reset, target }) => ({
  kind: "live",
  actions: [
    {
      role: "button",
      name: reset,
      prepare: { kind: "fill", target: { role: fieldRole, name: fieldName }, value: changed },
      expect: { value: initial }
    },
    { role: "button", name: save, expect: { url: `#${target}` } }
  ]
});

export default {
  name: "Form",
  category: "forms",
  behavior: "Native HTML",
  summary: "A semantic, responsive native form contract with aligned fields, explicit submit/reset commands, native validation and observable script-free feedback.",
  owns: ["ef-form"],
  purpose: {
    description: "Form is the end-to-end composition for collecting and submitting related data. It combines [[form-row]], [[text-field]], [[select]], [[textarea]], [[checkbox]], [[choice-group]], [[switch]], [[date-time-field]], [[validation-message]] and [[button]] without replacing their native semantics. The optional Forma design contract validates this structure before rendering; hand-authored HTML remains equally supported.",
    useWhen: [
      "A page or region collects related values and has a real submit command.",
      "Peer fields need aligned controls on wide containers and source-order stacking on narrow containers.",
      "Native constraint validation and reset behavior are sufficient, or an application will add richer behavior through Limen."
    ],
    avoidWhen: [
      "A single value saves immediately on change: use its native control and application feedback without inventing a form action row.",
      "The surface only navigates or runs commands and collects no data: use [[button]], links, or a command pattern.",
      "Domain legality or asynchronous persistence is being encoded in CSS: keep those decisions in the application or Limen."
    ],
    characteristics: [
      "The form is a min-width-zero grid with semantic spacing and an optional maximum measure.",
      "`.ef-form-row` aligns label, description, control and validation tracks and wraps by container width.",
      "A successful GET submit can target `.ef-form__outcome`; invalid native controls refuse submission first.",
      "No form interaction requires Forma JavaScript."
    ]
  },
  basicAlignment: [
    { ruleId: "ULI-L01", id: "mission-customer-controls", edge: "top", peers: [
      { role: "textbox", name: "Mission contact name (required)" },
      { role: "textbox", name: "Mission contact email (required)" }
    ] }
  ],
  basicInteraction: resetThenSave({
    fieldName: "Mission contact name (required)", changed: "Victor Glover", initial: "Reid Wiseman",
    save: "Save customer", reset: "Reset form", target: "nasa-mission-customer-saved"
  }),
  examples: [
    {
      id: "orion-communications-handoff",
      title: "Orion communications handoff",
      description: "An advanced form combines aligned native controls, a select, date field, textarea and required checkbox. Reset restores the mission note; Save submits the complete form to observable feedback.",
      interaction: resetThenSave({
        fieldName: "Handoff note", changed: "Use alternate Goldstone pass.", initial: "Confirm Deep Space Network coverage before launch.",
        save: "Save handoff", reset: "Reset handoff", target: "orion-handoff-saved"
      }),
      alignment: [
        { ruleId: "ULI-L01", id: "orion-handoff-controls", edge: "top", peers: [
          { role: "combobox", name: "Network complex (required)" },
          { role: "textbox", name: "Handoff date (required)" }
        ] }
      ],
      html: `<ef-form class="ef-component-tag">
  <form class="ef-form" method="get" action="#orion-handoff-saved" aria-labelledby="orion-handoff-title">
    <h2 id="orion-handoff-title">Orion communications handoff</h2>
    <div class="ef-form-row">
      <div class="ef-field">
        <label class="ef-field__label" for="orion-network">Network complex (required)</label>
        <span class="ef-field__description" id="orion-network-description">Choose the Deep Space Network complex leading the handoff.</span>
        <span class="ef-select">
          <select class="ef-select__input" id="orion-network" name="network" required aria-describedby="orion-network-description">
            <option value="goldstone">Goldstone · California</option>
            <option value="madrid">Madrid · Spain</option>
            <option value="canberra">Canberra · Australia</option>
          </select>
          <span class="ef-select__indicator" aria-hidden="true"></span>
        </span>
      </div>
      <div class="ef-field">
        <label class="ef-field__label" for="orion-handoff-date">Handoff date (required)</label>
        <span class="ef-field__description" id="orion-handoff-date-description">Use the UTC mission-planning date.</span>
        <input id="orion-handoff-date" name="handoff-date" type="date" value="2026-04-01" required aria-describedby="orion-handoff-date-description">
      </div>
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="orion-handoff-note">Handoff note</label>
      <textarea id="orion-handoff-note" name="handoff-note" rows="3">Confirm Deep Space Network coverage before launch.</textarea>
    </div>
    <label class="ef-checkbox">
      <input class="ef-checkbox__input" type="checkbox" name="flight-director-reviewed" value="yes" required checked>
      <span class="ef-checkbox__box" aria-hidden="true"></span>
      <span class="ef-checkbox__text"><span class="ef-checkbox__label">Flight director review complete (required)</span></span>
    </label>
    <div class="ef-actions">
      <button type="submit">Save handoff</button>
      <button type="reset">Reset handoff</button>
    </div>
    <p class="ef-form__outcome" id="orion-handoff-saved" role="status" aria-label="Handoff save status">Orion communications handoff saved.</p>
  </form>
</ef-form>`
    },
    {
      id: "customer-email-validation",
      title: "Customer email validation",
      description: "A compact customer form uses native required and email constraints. The linked recovery message appears when the browser refuses an invalid submission; valid Save and Reset actions remain native.",
      interaction: resetThenSave({
        fieldName: "Customer email (required)", changed: "changed@nasa.gov", initial: "gateway@nasa.gov",
        save: "Save contact", reset: "Reset contact", target: "gateway-contact-saved"
      }),
      html: `<ef-form class="ef-component-tag">
  <form class="ef-form" method="get" action="#gateway-contact-saved" aria-labelledby="gateway-contact-title">
    <h2 id="gateway-contact-title">Gateway logistics contact</h2>
    <div class="ef-field">
      <label class="ef-field__label" for="gateway-contact-email">Customer email (required)</label>
      <span class="ef-field__description" id="gateway-contact-email-description">Receives lunar logistics schedule changes.</span>
      <input id="gateway-contact-email" name="email" type="email" value="gateway@nasa.gov" autocomplete="email" required aria-describedby="gateway-contact-email-description gateway-contact-email-error">
      <p class="ef-validation-message ef-validation-message--when-invalid" id="gateway-contact-email-error"><span class="ef-validation-message__mark" aria-hidden="true">!</span>Enter an email address such as name@nasa.gov.</p>
    </div>
    <div class="ef-actions">
      <button type="submit">Save contact</button>
      <button type="reset">Reset contact</button>
    </div>
    <p class="ef-form__outcome" id="gateway-contact-saved" role="status" aria-label="Contact save status">Gateway logistics contact saved.</p>
  </form>
</ef-form>`
    },
    {
      id: "mobile-mission-customer",
      title: "Mobile mission customer",
      description: "The same two-field contract at phone width. Fields stack in source order, labels and validation wrap, and both actions remain reachable without horizontal page scrolling.",
      interaction: resetThenSave({
        fieldName: "Mission customer name (required)", changed: "NASA Gateway", initial: "Artemis II",
        save: "Save mobile customer", reset: "Reset mobile form", target: "mobile-mission-customer-saved"
      }),
      mobile: {
        height: 600,
        notes: [
          "The auto-fit form row becomes one column from available container width, not device detection.",
          "Controls and actions keep at least 44px target height and fill or wrap within 320px.",
          "DOM, reading, focus, validation and submission order remain name then email then actions.",
          "The form adds no motion; reduced-motion mode preserves identical state and behavior."
        ]
      },
      alignment: [
        { ruleId: "ULI-L01", id: "mobile-customer-controls", edge: "top", peers: [
          { role: "textbox", name: "Mission customer name (required)" },
          { role: "textbox", name: "Mission customer email (required)" }
        ] }
      ],
      html: `<ef-form class="ef-component-tag">
  <form class="ef-form" method="get" action="#mobile-mission-customer-saved" aria-labelledby="mobile-mission-customer-title">
    <h2 id="mobile-mission-customer-title">Mission customer</h2>
    <div class="ef-form-row">
      <div class="ef-field">
        <label class="ef-field__label" for="mobile-mission-customer-name">Mission customer name (required)</label>
        <input id="mobile-mission-customer-name" name="name" type="text" value="Artemis II" autocomplete="organization" required>
      </div>
      <div class="ef-field">
        <label class="ef-field__label" for="mobile-mission-customer-email">Mission customer email (required)</label>
        <span class="ef-field__description" id="mobile-mission-customer-email-description">Monitored during launch-window operations.</span>
        <input id="mobile-mission-customer-email" name="email" type="email" value="artemis-ii@nasa.gov" autocomplete="email" required aria-describedby="mobile-mission-customer-email-description">
      </div>
    </div>
    <div class="ef-actions">
      <button type="submit">Save mobile customer</button>
      <button type="reset">Reset mobile form</button>
    </div>
    <p class="ef-form__outcome" id="mobile-mission-customer-saved" role="status" aria-label="Mobile save status">Mission customer saved.</p>
  </form>
</ef-form>`
    }
  ],
  api: {
    attributes: [
      { name: "method", on: "form.ef-form", values: "get | post", default: "get", description: "Native form submission method. Static documentation uses GET so its result is observable in the URL." },
      { name: "action", on: "form.ef-form", values: "URL or #feedback-id", default: "current URL", description: "Real submission destination. A local fragment may expose `.ef-form__outcome`; production persistence belongs to the application endpoint." },
      { name: "type", on: "button", values: "submit | reset | button", default: "submit", description: "Write the native command explicitly. Design-contract standard mode binds submit and reset only." },
      { name: "required", on: "native form control", values: "boolean", default: "absent", description: "Participates in native constraint validation. Also state required status in visible text." },
      { name: "aria-describedby", on: "native form control", values: "description and validation ids", default: "—", description: "Associates guidance and recovery text in reading order." },
      { name: "role", on: ".ef-form__outcome", values: "status", default: "—", description: "Announces newly navigated save feedback without moving focus." }
    ],
    hooks: {
      "ef-form": "Form root: a min-width-zero grid with semantic vertical spacing, container context and an optional maximum measure.",
      "ef-form__outcome": "Native fragment-targeted status. Hidden until it is the current URL target, then shown with a non-colour border cue.",
      "--ef-form-gap": "Space between heading, field layouts, action group and feedback.",
      "--ef-form-max": "Maximum inline measure of the form; defaults to 64rem."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through native controls and actions in DOM order." },
      { keys: "Enter", action: "In a single-line field, invokes the form's default submit action when constraints pass." },
      { keys: "Space or Enter", action: "Activates the focused Save or Reset button through native button behavior." }
    ],
    events: [
      { name: "submit", description: "Native form event after successful constraint validation." },
      { name: "reset", description: "Native form event when initial control values are restored." },
      { name: "invalid", description: "Native event on each control that blocks submission." }
    ],
    form: "Native form participation is the contract. Submit includes successful named controls, reset restores initial values, disabled controls are omitted, readonly controls are included, and invalid required/type constraints refuse submit."
  },
  states: [
    { name: "Ready", how: "valid native controls", description: "Save can submit; Reset restores declared initial values." },
    { name: "Invalid", how: ":user-invalid plus linked .ef-validation-message--when-invalid", description: "Submission is refused; a thicker danger-side border and text recovery message identify the field without colour alone." },
    { name: "Saved", how: ".ef-form__outcome:target", description: "A successful native GET reaches the declared URL fragment and exposes status feedback." },
    { name: "Disabled or read-only field", how: "disabled or readonly native attribute", description: "Disabled controls are dashed, dimmed and omitted from submission; read-only text controls are dashed and remain focusable, selectable and submitted." }
  ],
  accessibility: {
    forma: [
      "Native form, label, input, select, textarea, fieldset and button semantics with visible focus and 44px control/action heights.",
      "Grid fields preserve semantic and focus order when they wrap; validation text is programmatically associated.",
      "Invalid state uses border shape plus marked text, saved state uses status text, and forced colours retain system borders.",
      "No form motion is required, so reduced motion changes no meaning or reachability."
    ],
    consumer: [
      "Supply unique ids, names, visible labels, correct input types/autocomplete and actionable validation messages.",
      "Provide a real application endpoint or Limen handler for persistence; never ship a decorative Save button.",
      "For several errors, build and focus a [[validation-summary]] after submit while retaining field values.",
      "Keep authorization and domain legality outside the design contract."
    ]
  },
  responsive: [
    "The form and every field have min-inline-size: 0 and max-inline-size constraints, preventing intrinsic controls from widening the page.",
    "`.ef-form-row` uses auto-fit minmax columns; it stacks at narrow container widths without media-query device guesses.",
    "Labels, descriptions, messages and actions wrap; native select display text may ellipsize inside its bounded control while the full option remains available.",
    "At 320px all controls and actions stay reachable with no page-level horizontal overflow."
  ],
  motion: [
    "Form layout, validity, submit, reset and target feedback introduce no animation.",
    "Controls reused inside the form follow their documented motion models; global reduced-motion rules shorten or remove nonessential transitions without changing state."
  ],
  guidance: {
    do: [
      "Use one clear heading, group peer fields in `.ef-form-row`, and keep DOM order equal to reading and keyboard order.",
      "Use explicit native button types and make every enabled action produce its declared result.",
      "Validate with the versioned design contract when UI is generated by agents or authoring tools."
    ],
    avoid: [
      "Local margins that nudge one field into alignment, raw positioning overrides, or nowrap content that widens the page.",
      "Placeholder-only labels, hidden required state, colour-only error borders, and Save buttons without a command binding.",
      "Treating successful contract validation as proof of domain correctness or visual quality."
    ]
  },
  related: [
    { slug: "form-row", note: "Aligned responsive peer-field layout used inside a form." },
    { slug: "validation-message", note: "Field-level recovery text shown when native validation refuses submit." },
    { slug: "validation-summary", note: "Application-generated summary for forms with several errors." },
    { slug: "button", note: "Native submit/reset actions and action-row layout." }
  ]
};
