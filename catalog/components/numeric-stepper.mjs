export default {
  name: "Numeric stepper",
  category: "forms",
  behavior: "Native HTML",
  summary: "Bounded numeric entry using the native number input and explicit constraints.",
  purpose: {
    description: "A numeric stepper collects a bounded number such as a count, quantity or duration. It is a native `input type=\"number\"` with `min`, `max` and `step`, so the browser supplies typed entry, the spin buttons, ArrowUp/ArrowDown stepping and range/step validation. Forma lays the label, input and description out in a compact grid, limits the input to 10rem and uses tabular numerals so values line up.",
    useWhen: [
      "The value is a number with known bounds, such as seats, retries, a percentage or hours.",
      "Users may adjust by small increments or type the value directly.",
      "The number is short; a narrow input signals the expected size."
    ],
    avoidWhen: [
      "The value is an identifier made of digits (account number, postcode, card number): use [[text-field]] with inputmode=numeric.",
      "An approximate value on a continuous scale is fine and the position is meaningful: use [[slider]], ideally with an adjacent numeric input.",
      "Users enter a lower and an upper bound: use [[range-entry]].",
      "Several numbers must add up to a total: use [[allocation]]."
    ],
    characteristics: [
      "The input is at most 10rem wide and uses tabular numerals.",
      "Constraints are native; out-of-range or off-step values fail validation on submit.",
      "State the bounds and unit in visible text, because spin buttons and constraints are not visible or announced consistently."
    ]
  },
  examples: [
    {
      id: "decimal-hours",
      title: "Hours in half-hour steps",
      description: "A decimal quantity with a unit. step=0.5 lets ArrowUp/ArrowDown move by half an hour, and inputmode=decimal shows a keypad with a decimal separator on phones. The label uses for/id and the description sits outside the label so it is announced as a description, not as part of the name.",
      html: `<ef-numeric-stepper class="ef-component-tag">
  <div class="ef-numeric-stepper">
    <label class="ef-numeric-stepper__label" for="numeric-stepper-hours-input">Time spent (hours)</label>
    <input id="numeric-stepper-hours-input" type="number" name="hours-spent" min="0" max="24" step="0.5" value="1.5" inputmode="decimal" aria-describedby="numeric-stepper-hours-description">
    <span class="ef-field__description" id="numeric-stepper-hours-description">0 to 24, in steps of 0.5.</span>
  </div>
</ef-numeric-stepper>`
    },
    {
      id: "out-of-range",
      title: "Value above the maximum",
      description: "The user typed 60 for a limit whose maximum is 50. The application marked the input invalid after the native check failed and linked a message stating the allowed range; the typed value is kept.",
      html: `<ef-numeric-stepper class="ef-component-tag">
  <div class="ef-numeric-stepper">
    <label class="ef-numeric-stepper__label" for="numeric-stepper-retries-input">Maximum retries</label>
    <input id="numeric-stepper-retries-input" type="number" name="max-retries" min="0" max="50" step="1" value="60" inputmode="numeric" required aria-invalid="true" aria-describedby="numeric-stepper-retries-description numeric-stepper-retries-error">
    <span class="ef-field__description" id="numeric-stepper-retries-description">Whole number from 0 through 50.</span>
    <p class="ef-validation-message" id="numeric-stepper-retries-error">
      <span class="ef-validation-message__mark" aria-hidden="true">!</span>
      Enter 50 or fewer retries.
    </p>
  </div>
</ef-numeric-stepper>`
    },
    {
      id: "fixed-by-contract",
      title: "Fixed by contract",
      description: "A seat count set by the contract. readonly keeps the value focusable and submitted while the description explains where to change it.",
      html: `<ef-numeric-stepper class="ef-component-tag">
  <div class="ef-numeric-stepper">
    <label class="ef-numeric-stepper__label" for="numeric-stepper-seats-input">Licensed seats</label>
    <input id="numeric-stepper-seats-input" type="number" name="licensed-seats" min="1" max="1000" value="250" readonly aria-describedby="numeric-stepper-seats-description">
    <span class="ef-field__description" id="numeric-stepper-seats-description">Set by your contract. Contact your account manager to change it.</span>
  </div>
</ef-numeric-stepper>`
    },
    {
      id: "mobile-quantities",
      title: "Mobile order quantities",
      description: "Two quantities at phone width in the canonical label-wrapped structure. The inputs stay compact while labels and descriptions wrap.",
      mobile: {
        height: 330,
        notes: [
          "Inputs stay at most 10rem wide at every width, so the narrow field keeps signalling a short number.",
          "Labels and descriptions wrap onto several lines; nothing scrolls horizontally at 320px.",
          "inputmode=numeric shows a digit keypad on phones; many mobile browsers hide the spin buttons, so typed entry is the main path.",
          "Each input keeps a 44px minimum height for touch.",
          "Orientation changes only reflow the text."
        ]
      },
      html: `<ef-numeric-stepper class="ef-component-tag">
  <div class="ef-stack">
    <label class="ef-numeric-stepper">
      <span class="ef-numeric-stepper__label">Replacement badges to print</span>
      <input type="number" name="badge-quantity" min="1" max="20" step="1" value="1" inputmode="numeric">
    </label>
    <label class="ef-numeric-stepper">
      <span class="ef-numeric-stepper__label">Visitor passes for the event day</span>
      <input type="number" name="visitor-passes" min="0" max="100" step="5" value="10" inputmode="numeric">
    </label>
  </div>
</ef-numeric-stepper>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "number", default: "—", description: "Required. Native number entry and stepping." },
      { name: "min", on: "input", values: "number", default: "—", description: "Lower bound; stepping stops here and lower typed values are invalid." },
      { name: "max", on: "input", values: "number", default: "—", description: "Upper bound." },
      { name: "step", on: "input", values: "number | any", default: "1", description: "Increment for ArrowUp/ArrowDown and allowed granularity; off-step values are invalid unless step=any." },
      { name: "value", on: "input", values: "number", default: "empty", description: "Initial value." },
      { name: "inputmode", on: "input", values: "numeric | decimal", default: "from type", description: "Chooses a digit or decimal keypad on touch devices." },
      { name: "name", on: "input", values: "string", default: "—", description: "Form field name." },
      { name: "required", on: "input", values: "boolean", default: "absent", description: "Blocks submission while empty." },
      { name: "readonly", on: "input", values: "boolean", default: "absent", description: "Focusable and submitted but not editable or steppable." },
      { name: "for", on: "label.ef-numeric-stepper__label", values: "id of the input", default: "—", description: "Use when the root is not the label, so the description can stay out of the accessible name." },
      { name: "aria-describedby", on: "input", values: "id list", default: "—", description: "Links the range description and any validation message." },
      { name: "aria-invalid", on: "input", values: "true", default: "absent", description: "Set by the application while a validation message is shown." }
    ],
    hooks: {
      "ef-numeric-stepper": "Root grid (label element or wrapper) stacking label, input and description with a 0.5rem gap. Constrains a descendant number input to 10rem with tabular numerals.",
      "ef-numeric-stepper__label": "Visible label text in bold."
    },
    keyboard: [
      { keys: "ArrowUp / ArrowDown", action: "Increments or decrements by step, clamped to min and max (native)." },
      { keys: "Digits, minus, decimal separator", action: "Types the value directly." },
      { keys: "Tab / Shift+Tab", action: "Moves focus to and from the input." }
    ],
    events: [
      { name: "input / change / invalid", description: "Native events. Forma adds none." }
    ],
    form: "A native number input: submits the numeric string under name, validates min, max, step and required, and resets to its initial value."
  },
  states: [
    { name: "Default", how: "value within bounds", description: "Compact bordered input with tabular numerals." },
    { name: "Focus", how: ":focus-visible", description: "Foundation two-tone focus ring." },
    { name: "Invalid", how: "aria-invalid=\"true\" plus a linked .ef-validation-message", description: "Error line with a non-color mark. Native :invalid (out of range or off step) is not restyled by Forma." },
    { name: "Read-only", how: "readonly attribute", description: "Native behavior with no distinct styling; explain it in the description." },
    { name: "Disabled", how: "disabled attribute", description: "Skipped by focus and not submitted; Forma adds no dimmed style." }
  ],
  accessibility: {
    forma: [
      "Keeps the native number input, so stepping keys, spin buttons and range validation come from the platform.",
      "The input keeps a 44px minimum height and the shared focus ring.",
      "Borders map to CanvasText in forced-colors mode."
    ],
    consumer: [
      "State the range, step and unit in visible text.",
      "In the canonical label-wrapped structure the description sits inside the label and becomes part of the accessible name; keep it short, or use a wrapper with for/id and aria-describedby as in the scenario examples.",
      "Explain invalid values with a linked [[validation-message]] that names the allowed range."
    ]
  },
  responsive: [
    "The number input is capped at 10rem and otherwise fills its column; the label and description wrap at any width.",
    "No breakpoints of its own.",
    "Many mobile browsers hide spin buttons; typed entry with a numeric keypad remains available."
  ],
  motion: [
    "No animation: the stepper does not transition. Values change immediately."
  ],
  guidance: {
    do: [
      "Choose a step that matches how people think about the value (1 for counts, 0.5 for hours, 5 for percentages).",
      "Put the unit in the label or description."
    ],
    avoid: [
      "type=number for values with leading zeros or digit groups, such as codes and phone numbers.",
      "Silently clamping a typed value; tell the user what changed."
    ]
  },
  related: [
    { slug: "slider", note: "Approximate value by position on a continuous scale." },
    { slug: "range-entry", note: "Paired minimum and maximum numbers." },
    { slug: "text-field", note: "Digit strings that are not quantities." },
    { slug: "allocation", note: "Several numbers constrained to a total." }
  ]
};
