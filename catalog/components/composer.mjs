export default {
  name: "Composer",
  category: "assisted",
  behavior: "Application / Limen",
  summary: "Natural-language composition surface for type, dictate, paste, and attach workflows without embedding agent behavior.",
  purpose: {
    description: "A composer is a calm, large plain-language input: visible context and help, a labelled native `textarea`, a row of secondary input methods (attach, dictate), one continuation action and a status line. It is how a user tells an application something in their own words. Forma owns only the presentation. Interpretation, agent or model calls, speech recognition, uploads, drafts, permissions and whether anything is committed belong to the application or Limen. The composer must work as a plain text field when no assisted capability is available, and its status line must never imply that text has already been recorded.",
    useWhen: [
      "Users describe a situation or request in free text that the application will interpret or route, such as a care note, an incident report or a request to an assistant.",
      "The same surface should accept typing, paste, dictation and attachments.",
      "The application will show its interpretation for review (for example with [[understanding]]) before anything consequential happens."
    ],
    avoidWhen: [
      "The input is a short structured value: use [[text-field]] or a specific input.",
      "A normal multi-line form field is enough, with no alternative input methods or status: use [[textarea]].",
      "The user is picking from a known set of commands: use [[command-palette]] or [[search]].",
      "The history of the exchange matters more than the input: compose the composer under a [[conversation]]."
    ],
    characteristics: [
      "Bordered surface with responsive padding and a context block (kicker, heading, help text).",
      "The textarea is at least 8rem tall, full width and vertically resizable.",
      "The submit action uses the inverse surface so it is the single strongest control.",
      "At 40rem and below input methods become a two-column grid of 2.75rem buttons and the submit button is full width."
    ]
  },
  examples: [
    {
      id: "no-assistance",
      title: "Assistance unavailable",
      description: "The interpretation service is down. The composer still works as a plain note field: dictation is not offered, attaching still is, and the status line says in words what will happen to the text.",
      html: `<ef-composer class="ef-component-tag">
  <form class="ef-composer" aria-labelledby="composer-no-assistance-title">
    <div class="ef-composer__context">
      <span class="ef-component-kicker">Shift handover</span>
      <h2 id="composer-no-assistance-title">Note for the next shift</h2>
      <p id="composer-no-assistance-help">Automatic summarizing is unavailable right now. Your note will be saved exactly as written.</p>
    </div>
    <label class="ef-composer__field">
      <span class="ef-sr-only">Handover note</span>
      <textarea name="handover-note" rows="4" aria-describedby="composer-no-assistance-help"></textarea>
    </label>
    <div class="ef-composer__actions">
      <div class="ef-composer__input-actions" role="group" aria-label="Additional input methods">
        <button type="button">Attach</button>
      </div>
      <button type="submit" class="ef-composer__submit">Save note</button>
    </div>
    <p class="ef-composer__status" role="status">Assisted summarizing unavailable. Nothing is saved until you choose Save note.</p>
  </form>
</ef-composer>`
    },
    {
      id: "dictating-with-attachment",
      title: "Dictating with an attachment",
      description: "Dictation is in progress, shown by the pressed state and label of the Dictate button, and one file is attached. The status reports both as text. Recording and upload are application behavior.",
      html: `<ef-composer class="ef-component-tag">
  <form class="ef-composer" aria-labelledby="composer-dictating-title">
    <div class="ef-composer__context">
      <span class="ef-component-kicker">Incident report</span>
      <h2 id="composer-dictating-title">What happened on site?</h2>
      <p id="composer-dictating-help">Describe the incident in your own words. You will review the extracted details before the report is filed.</p>
    </div>
    <label class="ef-composer__field">
      <span class="ef-sr-only">Incident description</span>
      <textarea name="incident" rows="4" aria-describedby="composer-dictating-help composer-dictating-files">At about 10:15 a forklift clipped the rack in aisle 7. Nobody was hurt, but two pallets</textarea>
    </label>
    <p id="composer-dictating-files">Attached: aisle-7-rack.jpg (2.4 MB)</p>
    <div class="ef-composer__actions">
      <div class="ef-composer__input-actions" role="group" aria-label="Additional input methods">
        <button type="button">Attach</button>
        <button type="button" aria-pressed="true">Stop dictation</button>
      </div>
      <button type="submit" class="ef-composer__submit">Review report</button>
    </div>
    <p class="ef-composer__status" role="status">Listening… 1 photo attached. Nothing is filed until you confirm the report.</p>
  </form>
</ef-composer>`
    },
    {
      id: "mobile-capture",
      title: "Mobile capture",
      description: "At phone width the input methods form a two-column grid and the continuation action spans the full width below them.",
      mobile: {
        height: 560,
        notes: [
          "At 40rem and below the actions row becomes a stretched column: input methods as a two-column grid of equal buttons, then a full-width submit button.",
          "Every button in the actions area gets a 2.75rem minimum height for touch.",
          "Padding shrinks with `clamp(1rem, 3vw, 1.5rem)`, and the textarea keeps its 8rem minimum height and full width, so text entry never overflows at 320px.",
          "When the on-screen keyboard opens, the textarea and status remain in normal flow; nothing is fixed to the viewport, so the page can scroll the submit button into view."
        ]
      },
      html: `<ef-composer class="ef-component-tag">
  <form class="ef-composer" aria-labelledby="composer-mobile-title">
    <div class="ef-composer__context">
      <span class="ef-component-kicker">Care log</span>
      <h2 id="composer-mobile-title">How is Dad today?</h2>
      <p id="composer-mobile-help">Type, dictate or attach a photo. You will confirm anything before it is added to his record.</p>
    </div>
    <label class="ef-composer__field">
      <span class="ef-sr-only">Care update</span>
      <textarea name="care-update" rows="4" aria-describedby="composer-mobile-help" placeholder="Tell me what happened…"></textarea>
    </label>
    <div class="ef-composer__actions">
      <div class="ef-composer__input-actions" role="group" aria-label="Additional input methods">
        <button type="button">Attach</button>
        <button type="button" aria-pressed="false">Dictate</button>
      </div>
      <button type="submit" class="ef-composer__submit">Continue</button>
    </div>
    <p class="ef-composer__status" role="status">Nothing is added to the record until you confirm.</p>
  </form>
</ef-composer>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "root form or section", values: "id of the context heading", default: "—", description: "Names the composer by its visible question or purpose." },
      { name: "aria-describedby", on: "textarea", values: "id(s) of help and attachment text", default: "—", description: "Announces the help text (and attachment list) with the field." },
      { name: "name", on: "textarea", values: "string", default: "—", description: "Form field name when the composer is a native form." },
      { name: "rows", on: "textarea", values: "number", default: "2", description: "Initial visible lines; Forma also sets an 8rem minimum height." },
      { name: "placeholder", on: "textarea", values: "string", default: "—", description: "Optional example phrasing. Never a substitute for the label or help." },
      { name: "role", on: "input-actions group, status", values: "group | status", default: "—", description: "`group` names the secondary input methods together; `status` makes the status line a polite live region." },
      { name: "aria-label", on: "input-actions group", values: "string", default: "—", description: "Names the group, for example \"Additional input methods\"." },
      { name: "aria-pressed", on: "Dictate button", values: "true | false", default: "—", description: "Exposes whether dictation is active when the button toggles recording." },
      { name: "type", on: "buttons", values: "submit | button", default: "submit inside a form", description: "Only the continuation action submits; input-method buttons must be type=\"button\"." }
    ],
    hooks: {
      "ef-composer": "Root bordered surface. Use a `form` when the composer submits natively.",
      "ef-composer__context": "Kicker, heading and help text block.",
      "ef-composer__field": "The label that wraps the textarea; the textarea is full width, 8rem minimum and vertically resizable.",
      "ef-composer__actions": "Row with input methods on one side and submit on the other; stacks at 40rem and below.",
      "ef-composer__input-actions": "Wrapping group of secondary input-method buttons; a two-column grid at 40rem and below.",
      "ef-composer__submit": "The single continuation action, drawn on the inverse surface; full width at 40rem and below.",
      "ef-composer__status": "Small secondary-color status line, usually a `role=\"status\"` region."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves from the textarea to input-method buttons and the submit button." },
      { keys: "Enter in the textarea", action: "Inserts a new line (native textarea). Submitting on Enter or Ctrl+Enter is application behavior if wanted." },
      { keys: "Enter / Space on a button", action: "Activates it natively. The submit button submits the form." }
    ],
    events: [
      { name: "input", description: "Native event from the textarea as the user types or pastes." },
      { name: "paste", description: "Native paste event; the application may inspect pasted content or files." },
      { name: "submit", description: "Native form submission from the continuation button when the root is a form." }
    ],
    form: "The textarea is a native form control: it submits its name and value, supports required, maxlength and form reset. Attachments and dictation are application-managed, not form data, unless the application adds file inputs."
  },
  states: [
    { name: "Empty", how: "empty textarea", description: "Optional placeholder shown; help text stays visible." },
    { name: "Dictating", how: "aria-pressed=\"true\" on the Dictate button plus status text", description: "Application-owned recording state." },
    { name: "Assistance unavailable", how: "status and help text written by the application", description: "The composer remains a plain text field." },
    { name: "Stacked actions", how: "@media (max-width: 40rem)", description: "Input methods in a two-column grid, full-width submit." },
    { name: "Forced colors", how: "@media (forced-colors: active)", description: "Root border uses CanvasText." }
  ],
  accessibility: {
    forma: [
      "Keeps the native textarea as the input, so editing, selection, paste, spellcheck and form behavior come from the browser.",
      "Gives the textarea a large minimum size and keeps every action at 2.75rem on narrow screens.",
      "Separates the single continuation action from input methods by position and surface, not only color."
    ],
    consumer: [
      "Give the textarea an accessible label (visually hidden with `.ef-sr-only` if the heading already says it) and link help with aria-describedby.",
      "Write status in text: listening, uploading, unavailable, and that nothing is committed until confirmed.",
      "Offer dictation and attachment only when available, and never as the only way to enter information.",
      "Use a form (or handle submission) so the submit button does something; a submit button outside a form is inert.",
      "Preserve the user's text if interpretation fails."
    ]
  },
  responsive: [
    "Root is a grid with `min-inline-size: 0` and `clamp(1rem, 3vw, 1.5rem)` padding.",
    "Textarea: `inline-size: 100%`, `min-block-size: 8rem`, `resize: vertical`.",
    "At 40rem and below: actions stack with `align-items: stretch`; input methods become `repeat(2, minmax(0, 1fr))`; submit is full width.",
    "Long help text wraps; the composer never needs horizontal scrolling."
  ],
  motion: [
    "No animation: the composer is static. Buttons keep only the base perceptual hover and press color change, and any recording indicator animation is application-owned and must stop under reduced motion."
  ],
  guidance: {
    do: [
      "Ask a concrete question in the heading (\"What happened on site?\").",
      "Say what happens next in the submit label (\"Review report\") and in the status line."
    ],
    avoid: [
      "Labels like \"Send\" that imply the text is committed immediately.",
      "Showing agent or model branding as if it carried authority over the record."
    ]
  },
  related: [
    { slug: "conversation", note: "The ordered history of turns that a composer often sits beneath." },
    { slug: "understanding", note: "Review of what the application understood before anything is committed." },
    { slug: "textarea", note: "A plain multi-line form field without input methods or status." },
    { slug: "file-upload", note: "A full upload queue with per-file status when attachments are central." }
  ]
};
