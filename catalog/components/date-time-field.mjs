export default {
  name: "Date and time field",
  category: "forms",
  behavior: "Native HTML",
  summary: "Native date, time and datetime-local inputs in the .ef-field structure, keeping the platform picker and direct typed entry.",
  purpose: {
    description: "A date and time field collects a calendar date, a time of day, or both, using native `input type=\"date\"`, `type=\"time\"` or `type=\"datetime-local\"` inside the shared `.ef-field` structure (see [[text-field]]). The browser supplies the segmented typed entry, the picker, locale-appropriate display and `min`/`max`/`step` validation, while the submitted value is always the locale-independent ISO form (`2026-10-14`, `09:30`, `2026-10-14T09:30`). Forma styles the box; it does not draw its own calendar.",
    useWhen: [
      "The user enters one date, one time of day, or one local date and time.",
      "The allowed values have simple bounds (earliest or latest date, business hours, 15-minute slots) that `min`, `max` and `step` can express.",
      "Typing the value must remain possible for keyboard and assistive-technology users."
    ],
    avoidWhen: [
      "The user chooses a start and end: use [[date-range]], which pairs two date inputs and offers presets.",
      "Availability depends on data (booked slots, holidays, per-day capacity): native inputs cannot disable arbitrary dates, so the application must validate and explain, or offer the free slots with [[choice-group]] or [[select]].",
      "The value is a duration or a relative offset (\"3 days\"): use [[numeric-stepper]] with a unit label.",
      "The time must carry an explicit time zone: datetime-local has no zone, so state the zone in the label or description or collect it separately with [[select]]."
    ],
    characteristics: [
      "Presentation follows the user's locale and browser; the submitted value does not.",
      "`min`, `max` and `step` are native constraints; out-of-range values fail validation on submit.",
      "The input keeps Forma's full-width, 44px-high box; the picker opening is browser chrome and is not styled."
    ]
  },
  examples: [
    {
      id: "appointment-slot",
      title: "Appointment date and time",
      description: "Separate date and time inputs for a support call. The date cannot be before today's booking window and the time is limited to 09:00–17:00 in 15-minute steps (step is in seconds).",
      html: `<ef-date-time-field class="ef-component-tag">
  <div class="ef-grid">
    <div class="ef-field">
      <label class="ef-field__label" for="date-time-field-appointment-date">Call date</label>
      <span class="ef-field__description" id="date-time-field-appointment-date-description">Between 1 October and 31 December 2026.</span>
      <input id="date-time-field-appointment-date" name="call-date" type="date" min="2026-10-01" max="2026-12-31" required aria-describedby="date-time-field-appointment-date-description">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="date-time-field-appointment-time">Start time (London time)</label>
      <span class="ef-field__description" id="date-time-field-appointment-time-description">09:00 to 17:00, on the quarter hour.</span>
      <input id="date-time-field-appointment-time" name="call-time" type="time" min="09:00" max="17:00" step="900" required aria-describedby="date-time-field-appointment-time-description">
    </div>
  </div>
</ef-date-time-field>`
    },
    {
      id: "maintenance-window",
      title: "Scheduled maintenance start",
      description: "A single datetime-local value with a lower bound and an initial value. The time zone is named in the label because datetime-local submits a zone-less local time.",
      html: `<ef-date-time-field class="ef-component-tag">
  <div class="ef-field">
    <label class="ef-field__label" for="date-time-field-maintenance-start">Maintenance starts (UTC)</label>
    <span class="ef-field__description" id="date-time-field-maintenance-start-description">Customers are notified 48 hours before this time.</span>
    <input id="date-time-field-maintenance-start" name="maintenance-start" type="datetime-local" min="2026-10-02T00:00" value="2026-10-04T02:00" aria-describedby="date-time-field-maintenance-start-description">
  </div>
</ef-date-time-field>`
    },
    {
      id: "date-out-of-range",
      title: "Date outside the allowed range",
      description: "The application rejected a contract end date earlier than the start. aria-invalid and a linked validation message explain the fix; the typed value is kept.",
      html: `<ef-date-time-field class="ef-component-tag">
  <div class="ef-field">
    <label class="ef-field__label" for="date-time-field-contract-end">Contract end date</label>
    <span class="ef-field__description" id="date-time-field-contract-end-description">Contract starts on 1 November 2026.</span>
    <input id="date-time-field-contract-end" name="contract-end" type="date" min="2026-11-01" value="2026-10-15" aria-invalid="true" aria-describedby="date-time-field-contract-end-description date-time-field-contract-end-error">
    <p class="ef-validation-message" id="date-time-field-contract-end-error">
      <span class="ef-validation-message__mark" aria-hidden="true">!</span>
      Choose a date on or after 1 November 2026.
    </p>
  </div>
</ef-date-time-field>`
    },
    {
      id: "mobile-delivery-window",
      title: "Mobile delivery booking",
      description: "Date and time fields for a delivery at phone width. The grid collapses to one column and the platform picker takes over on tap.",
      mobile: {
        height: 380,
        notes: [
          "The two fields sit side by side when there is room and stack into one column on a phone, because the enclosing grid uses `minmax(min(100%, 16rem), 1fr)` tracks.",
          "On touch devices tapping the input opens the platform's full-screen or wheel picker; Forma does not restyle it.",
          "Inputs keep a 44px minimum height and fill the column, so localized values such as long month names do not overflow.",
          "Typed entry is still available where the platform supports it; the submitted value is ISO regardless of how the date is displayed.",
          "Orientation changes only reflow the grid."
        ]
      },
      html: `<ef-date-time-field class="ef-component-tag">
  <div class="ef-grid">
    <div class="ef-field">
      <label class="ef-field__label" for="date-time-field-mobile-date">Delivery date</label>
      <input id="date-time-field-mobile-date" name="delivery-date" type="date" min="2026-10-01">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="date-time-field-mobile-time">Earliest arrival</label>
      <span class="ef-field__description" id="date-time-field-mobile-time-description">Hourly slots from 08:00.</span>
      <input id="date-time-field-mobile-time" name="delivery-time" type="time" min="08:00" max="18:00" step="3600" aria-describedby="date-time-field-mobile-time-description">
    </div>
  </div>
</ef-date-time-field>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "date | time | datetime-local", default: "—", description: "Selects the native control and its value format (YYYY-MM-DD, HH:MM[:SS], YYYY-MM-DDTHH:MM)." },
      { name: "for", on: "label.ef-field__label", values: "id of the input", default: "—", description: "Associates the visible label." },
      { name: "name", on: "input", values: "string", default: "—", description: "Form field name; the submitted value is always in ISO form." },
      { name: "value", on: "input", values: "ISO date/time string", default: "empty", description: "Initial value in the machine format for the type, not a localized string." },
      { name: "min", on: "input", values: "ISO date/time string", default: "—", description: "Earliest allowed value. Pickers typically gray out earlier values; typed earlier values fail validation." },
      { name: "max", on: "input", values: "ISO date/time string", default: "—", description: "Latest allowed value." },
      { name: "step", on: "input", values: "seconds (time, datetime-local) or days (date)", default: "60 for time, 1 for date", description: "Allowed increment; 900 means 15-minute slots. Values off the step fail validation." },
      { name: "required", on: "input", values: "boolean", default: "absent", description: "Native constraint: the form will not submit while empty." },
      { name: "aria-describedby", on: "input", values: "id list", default: "—", description: "Links the description (state bounds and time zone there) and any validation message." },
      { name: "aria-invalid", on: "input", values: "true", default: "absent", description: "Set by the application while a linked validation message is shown." }
    ],
    hooks: {},
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus to the input; in most browsers Tab also moves between the day, month, year, hour and minute segments." },
      { keys: "ArrowUp / ArrowDown", action: "Increments or decrements the focused segment (native, browser-dependent)." },
      { keys: "Digits", action: "Types directly into the focused segment." },
      { keys: "Browser picker shortcut", action: "Opening the picker from the keyboard (for example Alt+ArrowDown or Space) varies by browser; typed entry never requires it." }
    ],
    events: [
      { name: "input / change / invalid", description: "Native events. The value is read as an ISO string; Forma adds no events." }
    ],
    form: "A native input: submits an ISO date, time or local date-time string under name, enforces min, max, step and required, and resets to its initial value on form reset."
  },
  states: [
    { name: "Empty", how: "no value", description: "The browser shows its localized placeholder segments (for example dd/mm/yyyy)." },
    { name: "Filled", how: "value", description: "Displayed in the user's locale." },
    { name: "Focus", how: ":focus-visible", description: "Foundation two-tone focus ring around the whole input." },
    { name: "Invalid", how: "aria-invalid=\"true\" plus a linked .ef-validation-message", description: "Error text with a non-color mark below the input. Native :invalid from min/max/step is not restyled by Forma." },
    { name: "Disabled", how: "disabled attribute", description: "Skipped by focus and not submitted; explain why in the description." }
  ],
  accessibility: {
    forma: [
      "Keeps the native input so typed segmented entry, screen reader announcements and the platform picker all remain available.",
      "Full-width 44px control with the shared focus ring; borders map to CanvasText in forced-colors mode."
    ],
    consumer: [
      "State the allowed range and, for times, the time zone in visible text; min and max are not announced consistently.",
      "Explain rejected values in a linked [[validation-message]] with the allowed range.",
      "Do not replace the native input with a custom calendar unless Limen supplies full keyboard grid navigation and typed entry.",
      "Convert and store time zones in the application; datetime-local carries no zone."
    ]
  },
  responsive: [
    "Inputs are `inline-size: 100%` of their field, so localized formats and picker icons fit the available width.",
    "No breakpoints of its own; place several fields in [[grid]] so they collapse to one column when narrow.",
    "Touch devices use their native picker UI, which is full screen or a bottom sheet on most phones."
  ],
  motion: [
    "No animation: Forma adds no transition to date and time inputs. Any picker animation is the browser's own."
  ],
  guidance: {
    do: [
      "Use min and max for hard limits and repeat them in the description.",
      "Keep the stored value in ISO form and format for display elsewhere."
    ],
    avoid: [
      "Text inputs with a date pattern when a native date input would do.",
      "Implying a time zone that datetime-local does not store."
    ]
  },
  related: [
    { slug: "date-range", note: "Two linked dates (from and to) with preset shortcuts." },
    { slug: "text-field", note: "Documents the shared .ef-field structure for single-line values." },
    { slug: "numeric-stepper", note: "For durations or counts rather than calendar values." }
  ]
};
