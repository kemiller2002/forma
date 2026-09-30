export default {
  name: "Allocation",
  category: "assessment",
  behavior: "Application / Limen",
  summary: "Distribute a bounded amount across multiple choices while preserving direct numeric entry.",
  purpose: {
    description: "Allocation asks the user to split a fixed budget, such as 10 points or 100%, across several items. Each item is a labelled native number input, so values are typed directly and the browser enforces per-field min, max and step. The total row is an `output` in a polite live region. The aggregate rule (the sum must equal the budget) cannot be expressed in HTML, so the application calculates the total, writes it, and sets `data-ef-state=\"invalid\"` when the rule is broken.",
    useWhen: [
      "Relative weight across items matters, not only their order.",
      "The budget is a small whole number or percentage that users can reason about.",
      "Direct, precise numeric entry is preferable to dragging."
    ],
    avoidWhen: [
      "Only order matters: use [[ranking]].",
      "Each item is rated independently without a shared budget: use [[matrix-single]].",
      "A single number is requested: use [[numeric-stepper]] or [[text-field]]."
    ],
    characteristics: [
      "Native `input type=\"number\"` with `inputmode=\"numeric\"` for each item.",
      "Values are end-aligned with tabular numerals so columns of numbers line up.",
      "The total row is separated by a rule; the invalid state thickens the rule and uses the accent color, while the text states the problem.",
      "No sliders or drag are required."
    ]
  },
  examples: [
    {
      id: "over-allocated",
      title: "Over-allocated total",
      description: "The values add up to 12 of 10. The application marks the total invalid and writes a message saying how far over it is; per-field values are still individually valid.",
      html: `<ef-allocation class="ef-component-tag">
  <fieldset class="ef-allocation" aria-describedby="allocation-over-message">
    <legend class="ef-allocation__legend">Distribute 10 points across these improvements.</legend>
    <div class="ef-allocation__items">
      <label class="ef-allocation__item"><span>Test coverage</span><input type="number" name="allocation-over-tests" min="0" max="10" step="1" value="5" inputmode="numeric"></label>
      <label class="ef-allocation__item"><span>Documentation</span><input type="number" name="allocation-over-docs" min="0" max="10" step="1" value="4" inputmode="numeric"></label>
      <label class="ef-allocation__item"><span>Build speed</span><input type="number" name="allocation-over-build" min="0" max="10" step="1" value="3" inputmode="numeric"></label>
    </div>
    <div class="ef-allocation__total" data-ef-state="invalid" aria-live="polite" aria-atomic="true">
      <span>Total</span>
      <output>12 / 10</output>
    </div>
    <p class="ef-validation-message" id="allocation-over-message">
      <span class="ef-validation-message__mark" aria-hidden="true">!</span>
      Remove 2 points so the total is exactly 10.
    </p>
  </fieldset>
</ef-allocation>`
    },
    {
      id: "percentage-in-progress",
      title: "Percentage split in progress",
      description: "A 100% budget with one item still at zero. The total shows what remains; the state is not invalid until the user tries to continue, which is an application decision.",
      html: `<ef-allocation class="ef-component-tag">
  <fieldset class="ef-allocation">
    <legend class="ef-allocation__legend">How is your team's time split across work types?</legend>
    <p class="ef-field__description">Enter whole percentages. The total must reach 100%.</p>
    <div class="ef-allocation__items">
      <label class="ef-allocation__item"><span>New features</span><input type="number" name="allocation-percent-features" min="0" max="100" step="5" value="50" inputmode="numeric"></label>
      <label class="ef-allocation__item"><span>Maintenance and upgrades</span><input type="number" name="allocation-percent-maintenance" min="0" max="100" step="5" value="30" inputmode="numeric"></label>
      <label class="ef-allocation__item"><span>Unplanned incidents and support requests</span><input type="number" name="allocation-percent-incidents" min="0" max="100" step="5" value="0" inputmode="numeric"></label>
    </div>
    <div class="ef-allocation__total" data-ef-state="valid" aria-live="polite" aria-atomic="true">
      <span>Total</span>
      <output>80% (20% remaining)</output>
    </div>
  </fieldset>
</ef-allocation>`
    },
    {
      id: "mobile-stacked-fields",
      title: "Allocation on a phone",
      description: "Below 44rem each item's label sits above a full-width number field, which is easier to tap and type into.",
      mobile: {
        height: 460,
        notes: [
          "Each item switches from a label/field row to a single column: label on top, input full width underneath.",
          "Number inputs keep a 44px minimum height and `inputmode=\"numeric\"` brings up a numeric keypad on touch devices.",
          "The total row wraps its label and value if space runs out; values stay in tabular numerals.",
          "Long item labels wrap; nothing scrolls horizontally at 320px."
        ]
      },
      html: `<ef-allocation class="ef-component-tag">
  <fieldset class="ef-allocation">
    <legend class="ef-allocation__legend">Split 10 points between these perks.</legend>
    <div class="ef-allocation__items">
      <label class="ef-allocation__item"><span>Learning budget</span><input type="number" name="allocation-mobile-learning" min="0" max="10" step="1" value="6" inputmode="numeric"></label>
      <label class="ef-allocation__item"><span>Home office equipment</span><input type="number" name="allocation-mobile-office" min="0" max="10" step="1" value="4" inputmode="numeric"></label>
    </div>
    <div class="ef-allocation__total" data-ef-state="valid" aria-live="polite" aria-atomic="true">
      <span>Total</span>
      <output>10 / 10</output>
    </div>
  </fieldset>
</ef-allocation>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "number", default: "—", description: "Required. Direct numeric entry is the baseline interaction." },
      { name: "name", on: "input", values: "string", default: "—", description: "Field name for each item's value." },
      { name: "min", on: "input", values: "number", default: "—", description: "Native lower bound for one item. It cannot express the aggregate total." },
      { name: "max", on: "input", values: "number", default: "—", description: "Native upper bound for one item, usually the whole budget." },
      { name: "step", on: "input", values: "number", default: "\"1\"", description: "Native granularity; arrow keys step by this amount." },
      { name: "value", on: "input", values: "number", default: "—", description: "Initial or saved value for the item." },
      { name: "inputmode", on: "input", values: "numeric", default: "—", description: "Requests a numeric keypad on touch devices." },
      { name: "aria-live", on: ".ef-allocation__total", values: "polite", default: "—", description: "Announces total updates written by the application." },
      { name: "aria-atomic", on: ".ef-allocation__total", values: "true", default: "—", description: "Reads label and value together." },
      { name: "aria-describedby", on: "fieldset", values: "id list", default: "—", description: "Associates the total error message with the group." }
    ],
    hooks: {
      "ef-allocation": "Root fieldset with browser border and padding removed.",
      "ef-allocation__legend": "Instruction stating the budget.",
      "ef-allocation__items": "Grid stacking the items.",
      "ef-allocation__item": "Label wrapping item text and its number input; a two-column row on wide screens, stacked below 44rem.",
      "ef-allocation__total": "Total row above a rule, holding an output element in tabular numerals.",
      "data-ef-state": "Set by the application on `.ef-allocation__total`. `invalid` thickens the rule and switches to the accent color; other values (such as `valid`) use the default presentation."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between the number fields." },
      { keys: "Arrow Up / Arrow Down", action: "Native number input stepping by `step`, clamped to min and max." },
      { keys: "Digits", action: "Direct entry of a value." }
    ],
    events: [
      { name: "input / change", description: "Native events from each number input. Limen recalculates the total on input and validates on change or submit." }
    ],
    form: "Each input submits its own name=value and participates in native range and step validation. The aggregate total is not validated natively; the application must block submission when it is wrong."
  },
  states: [
    { name: "Valid total", how: "data-ef-state=\"valid\" (or absent)", description: "Default total row with a 1px rule." },
    { name: "Invalid total", how: "data-ef-state=\"invalid\"", description: "2px rule and accent-colored text; pair with a text message that says how to fix it." },
    { name: "Field out of range", how: "native :invalid from min/max/step", description: "The browser reports the field error on submit; Forma adds no extra styling." },
    { name: "Focus", how: ":focus-visible on an input", description: "Foundation two-tone focus ring on the field." }
  ],
  accessibility: {
    forma: [
      "Wraps each input in its label so every field has an accessible name.",
      "Keeps numeric entry as the primary interaction with 44px fields.",
      "Styles the total as a live, atomic region and does not rely on color for the invalid state (the rule weight also changes)."
    ],
    consumer: [
      "Calculate and write the total, including remaining or excess amounts in words.",
      "Set data-ef-state and render a [[validation-message]] that says exactly what to change.",
      "Block progression while the total is wrong and move focus to the message or a [[validation-summary]]."
    ]
  },
  responsive: [
    "Wide: item rows are `minmax(0, 1fr) minmax(5rem, 7rem)` so numbers align in one column.",
    "Below 44rem: each item stacks label over a full-width input.",
    "The total row is a wrapping flex row."
  ],
  motion: [
    "No animation: the total and its state change immediately when the application writes them."
  ],
  guidance: {
    do: [
      "State the budget in the legend and keep it a round number.",
      "Show remaining or excess amounts in the total text."
    ],
    avoid: [
      "Requiring sliders or drag to allocate.",
      "Auto-adjusting other fields when one changes; users lose track of what they entered."
    ]
  },
  related: [
    { slug: "ranking", note: "Captures order without weights." },
    { slug: "numeric-stepper", note: "A single bounded numeric value." },
    { slug: "validation-message", note: "Explains an invalid total." }
  ]
};
