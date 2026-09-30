export default {
  name: "Range entry",
  category: "forms",
  behavior: "Native HTML",
  summary: "Direct lower/upper endpoint entry; graphical dual-thumb behavior is an optional application enhancement.",
  purpose: {
    description: "Range entry collects a lower and an upper bound as two labelled native number inputs inside a fieldset, with a separator between them and a status line that restates the range. Typed entry is always available, so no dragging is required. Checking that the minimum does not exceed the maximum, writing the status text and any graphical dual-thumb slider are application behavior; Forma supplies the layout.",
    useWhen: [
      "Users set both ends of a numeric range, such as a price band, response-time window or age range.",
      "Exact endpoint values matter.",
      "A graphical range control would otherwise be the only way in."
    ],
    avoidWhen: [
      "Only one value is needed: use [[numeric-stepper]] or [[slider]].",
      "The endpoints are dates: use [[date-range]].",
      "The range is chosen from a few predefined bands: use [[choice-group]]."
    ],
    characteristics: [
      "Two independent native number inputs, each with its own visible label.",
      "The fieldset legend names the whole range for assistive technology.",
      "The status line is a polite live region the application updates with the interpreted range or an error."
    ]
  },
  examples: [
    {
      id: "price-band",
      title: "Price filter",
      description: "A price band for filtering products, with the currency in the legend and whole-currency steps. Both endpoints are optional, and the status restates what will be applied.",
      html: `<ef-range-entry class="ef-component-tag">
  <fieldset class="ef-range-entry">
    <legend class="ef-range-entry__legend">Price (USD)</legend>
    <div class="ef-range-entry__inputs">
      <label>
        <span>Lowest</span>
        <input type="number" name="price-min" min="0" max="10000" step="1" value="50" inputmode="numeric">
      </label>
      <span class="ef-range-entry__separator" aria-hidden="true">to</span>
      <label>
        <span>Highest</span>
        <input type="number" name="price-max" min="0" max="10000" step="1" inputmode="numeric">
      </label>
    </div>
    <p class="ef-range-entry__status" data-ef-state="valid" aria-live="polite">$50 and above</p>
  </fieldset>
</ef-range-entry>`
    },
    {
      id: "reversed-endpoints",
      title: "Minimum above maximum",
      description: "The application found the minimum larger than the maximum. The maximum input is marked invalid and the status line switches to an error that names the fix, with the invalid state recorded in data-ef-state for the application.",
      html: `<ef-range-entry class="ef-component-tag">
  <fieldset class="ef-range-entry">
    <legend class="ef-range-entry__legend">Acceptable latency (milliseconds)</legend>
    <div class="ef-range-entry__inputs">
      <label>
        <span>Minimum</span>
        <input type="number" name="latency-min" min="0" max="5000" step="50" value="1200" inputmode="numeric">
      </label>
      <span class="ef-range-entry__separator" aria-hidden="true">to</span>
      <label>
        <span>Maximum</span>
        <input type="number" name="latency-max" min="0" max="5000" step="50" value="800" inputmode="numeric" aria-invalid="true" aria-describedby="range-entry-reversed-status">
      </label>
    </div>
    <p class="ef-range-entry__status" id="range-entry-reversed-status" data-ef-state="invalid" aria-live="polite">The maximum (800) must be at least the minimum (1200).</p>
  </fieldset>
</ef-range-entry>`
    },
    {
      id: "mobile-age-range",
      title: "Mobile age range",
      description: "An audience age range at phone width. The endpoints stack vertically so each input keeps a usable width.",
      mobile: {
        height: 360,
        notes: [
          "At 44rem (704px) and below the inputs grid becomes one column: Minimum, the separator word, then Maximum.",
          "Above that width the two inputs sit side by side (each at least 7rem) within a 30rem maximum width.",
          "Each input keeps a 44px minimum height and inputmode=numeric shows a digit keypad.",
          "The status line wraps under the inputs; nothing scrolls horizontally."
        ]
      },
      html: `<ef-range-entry class="ef-component-tag">
  <fieldset class="ef-range-entry">
    <legend class="ef-range-entry__legend">Audience age</legend>
    <div class="ef-range-entry__inputs">
      <label>
        <span>From age</span>
        <input type="number" name="age-min" min="13" max="100" step="1" value="18" inputmode="numeric">
      </label>
      <span class="ef-range-entry__separator" aria-hidden="true">to</span>
      <label>
        <span>To age</span>
        <input type="number" name="age-max" min="13" max="100" step="1" value="34" inputmode="numeric">
      </label>
    </div>
    <p class="ef-range-entry__status" data-ef-state="valid" aria-live="polite">Ages 18 to 34</p>
  </fieldset>
</ef-range-entry>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "number", default: "—", description: "Both endpoints are native number inputs." },
      { name: "min", on: "input", values: "number", default: "—", description: "Lowest allowed value for each endpoint." },
      { name: "max", on: "input", values: "number", default: "—", description: "Highest allowed value for each endpoint. Native constraints do not relate the two inputs to each other." },
      { name: "step", on: "input", values: "number", default: "1", description: "Allowed increment." },
      { name: "value", on: "input", values: "number", default: "empty", description: "Initial endpoint value." },
      { name: "name", on: "input", values: "string", default: "—", description: "Separate field names for the lower and upper bound." },
      { name: "inputmode", on: "input", values: "numeric | decimal", default: "from type", description: "Keypad hint for touch devices." },
      { name: "aria-live", on: ".ef-range-entry__status", values: "polite", default: "—", description: "Announces the application's updated range or error text." },
      { name: "aria-hidden", on: ".ef-range-entry__separator", values: "true", default: "—", description: "The visual \"to\" is not read; each input has its own label." },
      { name: "aria-invalid", on: "input", values: "true", default: "absent", description: "Set by the application on the endpoint that needs correcting." },
      { name: "aria-describedby", on: "input", values: "id of the status", default: "—", description: "Links the error text in the status line to the invalid endpoint." }
    ],
    hooks: {
      "ef-range-entry": "Root fieldset with margin, padding and border removed.",
      "ef-range-entry__legend": "Legend naming the range (1rem, bold).",
      "ef-range-entry__inputs": "Three-column grid (endpoint, separator, endpoint) up to 30rem wide; one column at 44rem and below.",
      "ef-range-entry__separator": "Visual separator word, bottom-aligned with the inputs.",
      "ef-range-entry__status": "Status line restating the range or reporting an error (0.8125rem, weight 650).",
      "data-ef-state": "Application-owned marker on the status line (the pattern uses valid; examples use invalid). Forma does not currently style it, so the status text itself must carry the meaning."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between the minimum and maximum inputs." },
      { keys: "ArrowUp / ArrowDown", action: "Steps the focused endpoint within its own min and max (native)." }
    ],
    events: [
      { name: "input / change", description: "Native events from each endpoint; cross-field validation and status updates are application code." }
    ],
    form: "Each endpoint submits separately under its own name and validates its own min, max and step. The relationship between endpoints is not enforced natively."
  },
  states: [
    { name: "Valid", how: "application status text; data-ef-state=\"valid\"", description: "Status restates the interpreted range." },
    { name: "Open-ended", how: "one endpoint empty", description: "Status explains the open bound, for example \"$50 and above\"." },
    { name: "Invalid", how: "aria-invalid on an endpoint plus error text in the status; data-ef-state=\"invalid\"", description: "Status names the fix. Forma does not restyle the status or input, so the text carries the error." },
    { name: "Focus", how: ":focus-visible", description: "Foundation focus ring on the focused endpoint." }
  ],
  accessibility: {
    forma: [
      "A fieldset and legend group the endpoints; each endpoint has its own visible label.",
      "Typed entry is always available, so no drag interaction is needed.",
      "The separator is hidden from assistive technology."
    ],
    consumer: [
      "Validate that the minimum does not exceed the maximum and describe errors in text in the status line.",
      "Keep the status line's live text short and update it only after the user commits a value.",
      "If Limen adds a dual-thumb slider, keep these inputs available and synchronized, and give each thumb its own label."
    ]
  },
  responsive: [
    "Side by side, each endpoint column is at least 7rem and the group is at most 30rem wide.",
    "At 44rem (704px) and below the endpoints stack in one column and the separator loses its padding.",
    "Labels and status text wrap; the component never forces horizontal scrolling."
  ],
  motion: [
    "No animation: range entry has no transitions. Status text changes immediately."
  ],
  guidance: {
    do: [
      "Put the unit in the legend so both endpoint labels stay short.",
      "Restate the resulting range in words in the status line."
    ],
    avoid: [
      "Swapping reversed endpoints silently; tell the user.",
      "Offering only a dual-thumb slider without these direct inputs."
    ]
  },
  related: [
    { slug: "date-range", note: "Start and end dates with presets." },
    { slug: "numeric-stepper", note: "A single bounded number." },
    { slug: "slider", note: "A single approximate value by position." }
  ]
};
