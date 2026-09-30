export default {
  name: "Wizard",
  category: "navigation",
  behavior: "Limen / Ordo",
  summary: "Step-by-step workflow shell with current-step state, progress, validation hooks, resume, and mobile reduction.",
  purpose: {
    description: "The wizard is a bordered shell for a task split into ordered steps: a header with the step position, title and a native `progress` bar; a step rail marking complete and current steps; a body for the current step's fields; and a footer of actions. Forma renders whatever state it is given. Limen and Ordo own the workflow: which steps exist (including branching), whether the user may advance, validation before advance, save and exit, resume, and whether earlier steps can be revisited. On phones the rail reduces to the current step only.",
    useWhen: [
      "A task has several dependent stages that must be completed in order, such as configure, review, validate, publish.",
      "Users benefit from knowing how many steps remain and which one they are on.",
      "The workflow can be saved and resumed, or must validate each stage before continuing."
    ],
    avoidWhen: [
      "The steps are independent views the user can visit in any order: use [[tabs]].",
      "It is a short form that fits on one page: use a single form with [[validation-summary]].",
      "Progress through a survey without step navigation: use [[survey-progress]].",
      "A static list of instructions: use [[steps]]."
    ],
    characteristics: [
      "Step state is written with `data-state=\"complete\"` and `data-state=\"current\"` plus `aria-current=\"step\"` on the current item.",
      "Position is stated three ways: \"Step 2 of 4\" text, the progress bar and the rail.",
      "The rail is a four-column grid; below 40rem only the current step is shown, labelled Current step.",
      "Actions sit at opposite ends of the footer and wrap on narrow screens."
    ]
  },
  examples: [
    {
      id: "validation-blocked",
      title: "Advance blocked by validation",
      description: "The user pressed Continue on step 1 with a missing field. Ordo refused the transition; the application rendered a focusable validation summary in the body and marked the field invalid. The rail and position are unchanged.",
      html: `<ef-wizard class="ef-component-tag">
  <section class="ef-wizard" aria-labelledby="wizard-blocked-title">
    <header class="ef-wizard__header">
      <div><span class="ef-wizard__position">Step 1 of 4</span><h3 id="wizard-blocked-title">Service details</h3></div>
      <progress value="1" max="4" aria-label="Workflow progress">1 of 4</progress>
    </header>
    <ol class="ef-wizard__steps" aria-label="Workflow steps">
      <li data-state="current" aria-current="step"><span>1</span>Details</li>
      <li><span>2</span>Review</li>
      <li><span>3</span>Validate</li>
      <li><span>4</span>Publish</li>
    </ol>
    <div class="ef-wizard__body">
      <div class="ef-validation-summary" role="alert" tabindex="-1" aria-labelledby="wizard-blocked-summary-title">
        <div class="ef-validation-summary__icon" aria-hidden="true">!</div>
        <div>
          <h4 class="ef-validation-summary__title" id="wizard-blocked-summary-title">Fix 1 problem to continue</h4>
          <ul class="ef-validation-summary__list"><li><a href="#wizard-blocked-owner">Enter an owning team.</a></li></ul>
        </div>
      </div>
      <div class="ef-field">
        <label class="ef-field__label" for="wizard-blocked-owner">Owning team</label>
        <input id="wizard-blocked-owner" name="wizard-blocked-owner" type="text" required aria-invalid="true">
      </div>
    </div>
    <footer class="ef-wizard__actions">
      <button type="button">Save and exit</button>
      <button type="button">Continue</button>
    </footer>
  </section>
</ef-wizard>`
    },
    {
      id: "resumed-final-step",
      title: "Resumed at the final step",
      description: "A draft resumed from a saved session. Three steps are complete and Publish is current; the footer offers Back, Save and exit, and the final action.",
      html: `<ef-wizard class="ef-component-tag">
  <section class="ef-wizard" aria-labelledby="wizard-resume-title">
    <header class="ef-wizard__header">
      <div><span class="ef-wizard__position">Step 4 of 4</span><h3 id="wizard-resume-title">Publish release 2.8</h3></div>
      <progress value="4" max="4" aria-label="Workflow progress">4 of 4</progress>
    </header>
    <ol class="ef-wizard__steps" aria-label="Workflow steps">
      <li data-state="complete"><span>1</span>Details</li>
      <li data-state="complete"><span>2</span>Review</li>
      <li data-state="complete"><span>3</span>Validate</li>
      <li data-state="current" aria-current="step"><span>4</span>Publish</li>
    </ol>
    <div class="ef-wizard__body">
      <p>Resumed from your draft saved yesterday at 17:42. All checks passed. Publishing makes release 2.8 available to every customer.</p>
    </div>
    <footer class="ef-wizard__actions">
      <button type="button">Back</button>
      <button type="button">Save and exit</button>
      <button type="button">Publish release</button>
    </footer>
  </section>
</ef-wizard>`
    },
    {
      id: "mobile-current-step",
      title: "Wizard on a phone",
      description: "Below 40rem the header stacks, the rail shows only the current step with a Current step note, and actions wrap if they do not fit.",
      mobile: {
        height: 460,
        notes: [
          "The header becomes one column: position and title first, then a full-width progress bar.",
          "The step rail hides every item except the current one and appends a \"Current step\" note, so the rail costs one row.",
          "The \"Step 3 of 4\" text and the progress bar still convey the total, so hiding the other steps does not hide progress.",
          "Footer actions are a wrapping flex row with space-between; buttons keep their 44px height and wrap onto a new line when there are three."
        ]
      },
      html: `<ef-wizard class="ef-component-tag">
  <section class="ef-wizard" aria-labelledby="wizard-mobile-title">
    <header class="ef-wizard__header">
      <div><span class="ef-wizard__position">Step 3 of 4</span><h3 id="wizard-mobile-title">Validate configuration</h3></div>
      <progress value="3" max="4" aria-label="Workflow progress">3 of 4</progress>
    </header>
    <ol class="ef-wizard__steps" aria-label="Workflow steps">
      <li data-state="complete"><span>1</span>Details</li>
      <li data-state="complete"><span>2</span>Review</li>
      <li data-state="current" aria-current="step"><span>3</span>Validate</li>
      <li><span>4</span>Publish</li>
    </ol>
    <div class="ef-wizard__body">
      <p>Checking 14 settings against the production policy.</p>
    </div>
    <footer class="ef-wizard__actions">
      <button type="button">Back</button>
      <button type="button">Continue</button>
    </footer>
  </section>
</ef-wizard>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-wizard", values: "id of the step heading", default: "—", description: "Names the wizard region by the current step title." },
      { name: "value", on: "progress", values: "number", default: "—", description: "Current step number, supplied by the application." },
      { name: "max", on: "progress", values: "number", default: "—", description: "Total number of steps; update it when branching changes the total." },
      { name: "aria-label", on: "progress and ol.ef-wizard__steps", values: "string", default: "—", description: "Names the progress bar (Workflow progress) and the step list (Workflow steps)." },
      { name: "data-state", on: "step li", values: "complete | current", default: "absent (upcoming)", description: "Visual step state written by the application. current also bolds the step and inverts its marker; complete adds a check glyph." },
      { name: "aria-current", on: "current step li", values: "step", default: "absent", description: "Programmatic current step. Always pair it with data-state=\"current\"." },
      { name: "type", on: "action buttons", values: "button (or submit)", default: "—", description: "Use type=\"button\" when the application handles the transition; type=\"submit\" when the step is a native form submission." }
    ],
    hooks: {
      "ef-wizard": "Bordered root section.",
      "ef-wizard__header": "Grid of position/title and a progress column (at least 10rem); stacks below 40rem.",
      "ef-wizard__position": "Small monospace \"Step n of m\" text.",
      "ef-wizard__steps": "Four-column step rail with a bottom rule. Each item has a circular number marker. Below 40rem only the current item is shown.",
      "ef-wizard__body": "Padded region for the current step's content.",
      "ef-wizard__actions": "Footer flex row with actions at opposite ends; wraps when needed.",
      "data-state": "On step items: `current` or `complete`. Presentation only; the workflow state lives in Limen/Ordo."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the step body's fields and then the footer actions. The step rail is not interactive." },
      { keys: "Enter / Space", action: "Activates the focused action button (native)." }
    ],
    events: [
      { name: "click / submit", description: "Native events from the action buttons. Limen asks Ordo whether the transition is legal, then renders the next state." }
    ],
    form: "The wizard is not a form itself. Wrap the body and actions in a form when steps submit natively; each step's fields validate as ordinary form controls."
  },
  states: [
    { name: "Upcoming step", how: "li without data-state", description: "Secondary text and an outlined marker." },
    { name: "Current step", how: "data-state=\"current\" + aria-current=\"step\"", description: "Primary bold text and an inverse marker; the only step shown below 40rem, with a Current step note." },
    { name: "Complete step", how: "data-state=\"complete\"", description: "A check glyph is generated on the marker." },
    { name: "Blocked", how: "application renders a validation summary and aria-invalid fields", description: "Position and rail stay on the current step; Forma adds no rail error state." },
    { name: "Resumed", how: "application renders saved state", description: "Identical to any other state; resume messaging is body content." }
  ],
  accessibility: {
    forma: [
      "States the position in text, in a native progress element and in an ordered list with aria-current=\"step\".",
      "Keeps the current step identifiable without color (bold text and inverted marker).",
      "Keeps footer actions as native buttons at 44px height."
    ],
    consumer: [
      "Keep the position text, progress value/max, data-state and aria-current in sync with the workflow state.",
      "Move focus to the step heading after advancing, and to the [[validation-summary]] when an advance is refused.",
      "Explain in the body when steps were added or skipped by branching.",
      "Do not let the rail imply that earlier steps are navigable unless the application supports it."
    ]
  },
  responsive: [
    "Wide: header in two columns; the rail is a four-column grid, so it is designed for four steps (additional steps wrap onto a new row).",
    "Below 40rem: header stacks, rail reduces to the current step, actions wrap.",
    "The body is ordinary flow content and wraps normally."
  ],
  motion: [
    "No animation: step changes, progress and the rail update immediately when the application renders the new state. Button hover and press use the foundation's perceptual background interpolation."
  ],
  guidance: {
    do: [
      "Name steps with short nouns and keep the count stable where possible.",
      "Offer Save and exit on long workflows and tell users where to resume."
    ],
    avoid: [
      "Deciding in the UI whether a transition is legal; ask Ordo.",
      "Hiding the only explanation of a blocked advance in the rail."
    ]
  },
  related: [
    { slug: "survey-progress", note: "Progress through questions without step navigation or actions." },
    { slug: "steps", note: "A static numbered list of instructions, not an interactive workflow." },
    { slug: "readiness-checklist", note: "Shows which prerequisites are met before a transition." },
    { slug: "tabs", note: "For views the user can visit in any order." }
  ]
};
