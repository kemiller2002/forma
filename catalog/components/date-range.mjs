export default {
  name: "Date range",
  category: "forms",
  behavior: "Native HTML / application",
  summary: "Paired direct date entry with reusable preset affordances and mobile stacking.",
  purpose: {
    description: "A date range collects a start and an end date as two labelled native `input type=\"date\"` controls inside a fieldset, optionally followed by preset buttons such as \"Last 30 days\". Native inputs keep typed entry, the platform picker and `min`/`max` validation. Filling the dates from a preset, checking that the end is not before the start, and range preview are application behavior; Forma supplies the layout and its narrow-width stacking.",
    useWhen: [
      "Users filter or report over a period with a start and an end date.",
      "Common periods are worth one-tap shortcuts, while custom dates must stay possible.",
      "Typed entry must work for keyboard and assistive-technology users."
    ],
    avoidWhen: [
      "Only one date is needed: use [[date-time-field]].",
      "The range is numeric rather than calendar dates: use [[range-entry]].",
      "The period must include times of day: use two [[date-time-field]] inputs with type=datetime-local and a stated time zone.",
      "The user picks from a few fixed periods only: use [[segmented-control]] or [[choice-group]]."
    ],
    characteristics: [
      "From and To are independent native date inputs, each with its own label.",
      "Preset buttons are ordinary buttons; they do nothing without application code.",
      "Below 40rem the two dates stack and the arrow separator is hidden."
    ]
  },
  examples: [
    {
      id: "bounded-report",
      title: "Report period with limits",
      description: "A billing report limited to the last year of retained data. Both dates are required and bounded with min and max; the description states the limit. Presets are grouped with role=group so their accessible name is exposed.",
      html: `<ef-date-range class="ef-component-tag">
  <fieldset class="ef-date-range" aria-describedby="date-range-bounded-description">
    <legend>Billing period</legend>
    <p class="ef-field__description" id="date-range-bounded-description">Data is kept for 12 months: 1 October 2025 to 30 September 2026.</p>
    <div class="ef-date-range__fields">
      <label>From <input type="date" name="billing-from" min="2025-10-01" max="2026-09-30" value="2026-09-01" required></label>
      <span class="ef-date-range__separator" aria-hidden="true">→</span>
      <label>To <input type="date" name="billing-to" min="2025-10-01" max="2026-09-30" value="2026-09-30" required></label>
    </div>
    <div class="ef-date-range__presets" role="group" aria-label="Billing period presets">
      <button type="button">Last month</button>
      <button type="button">Last quarter</button>
      <button type="button">Last 12 months</button>
    </div>
  </fieldset>
</ef-date-range>`
    },
    {
      id: "end-before-start",
      title: "End date before start date",
      description: "The application found the To date earlier than From. The To input is marked invalid and linked to a validation message that states the fix; both typed dates are kept.",
      html: `<ef-date-range class="ef-component-tag">
  <fieldset class="ef-date-range">
    <legend>Leave dates</legend>
    <div class="ef-date-range__fields">
      <label>First day <input type="date" name="leave-from" value="2026-12-21"></label>
      <span class="ef-date-range__separator" aria-hidden="true">→</span>
      <label>Last day <input type="date" name="leave-to" value="2026-12-12" aria-invalid="true" aria-describedby="date-range-end-before-start-error"></label>
    </div>
    <p class="ef-validation-message" id="date-range-end-before-start-error">
      <span class="ef-validation-message__mark" aria-hidden="true">!</span>
      The last day must be on or after 21 December 2026.
    </p>
  </fieldset>
</ef-date-range>`
    },
    {
      id: "mobile-activity-filter",
      title: "Mobile activity filter",
      description: "An activity-log filter at phone width. The dates stack and the presets wrap into rows of full-size buttons.",
      mobile: {
        height: 400,
        notes: [
          "At 40rem (640px) and below the fields grid becomes one column and the → separator is hidden, so each date input gets the full width.",
          "Preset buttons wrap onto as many rows as needed and keep their 44px minimum height.",
          "Tapping a date opens the platform picker; typed entry remains available where the platform supports it.",
          "In landscape on larger phones the dates may return to side by side if the width exceeds 40rem."
        ]
      },
      html: `<ef-date-range class="ef-component-tag">
  <fieldset class="ef-date-range">
    <legend>Activity between</legend>
    <div class="ef-date-range__fields">
      <label>From <input type="date" name="activity-from" value="2026-09-01"></label>
      <span class="ef-date-range__separator" aria-hidden="true">→</span>
      <label>To <input type="date" name="activity-to" value="2026-09-30"></label>
    </div>
    <div class="ef-date-range__presets" role="group" aria-label="Activity period presets">
      <button type="button">Today</button>
      <button type="button">Last 7 days</button>
      <button type="button">Last 30 days</button>
      <button type="button">This year</button>
    </div>
  </fieldset>
</ef-date-range>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input / button", values: "date on inputs; button on presets", default: "—", description: "Native date inputs; presets are type=button so they never submit the form." },
      { name: "name", on: "input", values: "string", default: "—", description: "Separate names for the start and end dates; values submit in ISO YYYY-MM-DD form." },
      { name: "value", on: "input", values: "YYYY-MM-DD", default: "empty", description: "Initial dates in machine format." },
      { name: "min", on: "input", values: "YYYY-MM-DD", default: "—", description: "Earliest allowed date for that input." },
      { name: "max", on: "input", values: "YYYY-MM-DD", default: "—", description: "Latest allowed date for that input. Native constraints do not relate From to To." },
      { name: "required", on: "input", values: "boolean", default: "absent", description: "Blocks submission while that date is empty." },
      { name: "role", on: ".ef-date-range__presets", values: "group", default: "—", description: "Gives the preset container a role so its aria-label is exposed." },
      { name: "aria-label", on: ".ef-date-range__presets", values: "string", default: "—", description: "Names the preset group." },
      { name: "aria-hidden", on: ".ef-date-range__separator", values: "true", default: "—", description: "The arrow is decorative." },
      { name: "aria-describedby", on: "fieldset / input", values: "id", default: "—", description: "Links range limits to the fieldset, or an error message to the input that needs correcting." },
      { name: "aria-invalid", on: "input", values: "true", default: "absent", description: "Set by the application on the date that needs correcting." }
    ],
    hooks: {
      "ef-date-range": "Root fieldset grid (0.5rem gap), full width, margin removed. Its legend gets the compact field-label style.",
      "ef-date-range__fields": "Three-column grid (From, separator, To) with bottom alignment; one column at 40rem and below. Labels inside become small grids and date inputs shrink to fit.",
      "ef-date-range__separator": "Decorative arrow between the dates; hidden at 40rem and below.",
      "ef-date-range__presets": "Wrapping flex row of preset buttons with a 0.5rem gap."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through From, To and each preset button in source order (and through date segments in most browsers)." },
      { keys: "ArrowUp / ArrowDown", action: "Changes the focused date segment (native, browser-dependent)." },
      { keys: "Enter / Space on a preset", action: "Activates the button; the application fills both dates." }
    ],
    events: [
      { name: "input / change / click", description: "Native events from the date inputs and preset buttons. Forma adds none." }
    ],
    form: "Each date submits separately as an ISO date under its own name and validates its own min, max and required. The fieldset does not enforce that To is on or after From."
  },
  states: [
    { name: "Empty", how: "no values", description: "Both inputs show the browser's localized placeholder segments." },
    { name: "Filled", how: "value on both inputs", description: "Dates display in the user's locale." },
    { name: "Invalid", how: "aria-invalid on an input plus a linked .ef-validation-message", description: "Error text with a non-color mark below the fields." },
    { name: "Focus", how: ":focus-visible", description: "Foundation focus ring on the focused input or preset." }
  ],
  accessibility: {
    forma: [
      "A fieldset and legend name the range; each date has its own visible label wrapping the input.",
      "Native date inputs keep typed entry, so no picker or drag is required.",
      "The separator is hidden from assistive technology, and the layout stacks on narrow screens without reordering."
    ],
    consumer: [
      "Give the presets container role=\"group\" (as in these examples) so its aria-label is exposed; the canonical pattern omits the role.",
      "Validate the relationship between the dates and explain errors with a [[validation-message]].",
      "When a preset fills the dates, announce the new range or make it visible in text; do not move focus unexpectedly.",
      "State data retention or other limits in visible text, not only through min and max."
    ]
  },
  responsive: [
    "Above 40rem the two dates share a row with a centered arrow; each date column is `minmax(0, 1fr)` so localized formats shrink rather than overflow.",
    "At 40rem (640px) and below the dates stack and the arrow is hidden.",
    "Preset buttons wrap into additional rows at any width."
  ],
  motion: [
    "No animation: the date range has no transitions of its own. Preset buttons use the shared foundation hover and press background interpolation."
  ],
  guidance: {
    do: [
      "Offer presets that match the task (billing months, last 7/30 days) and keep custom dates available.",
      "Label the inputs with the domain words (\"First day\", \"Last day\") when From/To is ambiguous."
    ],
    avoid: [
      "Replacing typed entry with a calendar-only picker.",
      "Silently swapping dates entered in the wrong order."
    ]
  },
  related: [
    { slug: "date-time-field", note: "A single date, time or local date-time." },
    { slug: "range-entry", note: "Lower and upper numeric bounds." },
    { slug: "segmented-control", note: "A few fixed periods with no custom dates." }
  ]
};
