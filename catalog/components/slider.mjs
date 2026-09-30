export default {
  name: "Slider",
  category: "forms",
  behavior: "Native HTML",
  summary: "Single-value range input with accessible bounds and direct keyboard/pointer control.",
  purpose: {
    description: "A slider sets one value on a bounded scale by position. Forma uses the native `input type=\"range\"`, so the browser supplies dragging, click-to-position, keyboard stepping, `min`/`max`/`step` snapping, the accessible value and form submission. `.ef-slider` adds a header for the label, a full-width 44px-tall track area colored with `accent-color`, visible minimum and maximum labels, and room for a description.",
    useWhen: [
      "An approximate value on a continuous or finely stepped scale is acceptable, such as volume, opacity or a threshold.",
      "Seeing the position relative to the bounds helps the user decide.",
      "Every value between min and max is valid."
    ],
    avoidWhen: [
      "The user needs an exact number: use [[numeric-stepper]] or pair the slider with one (the application keeps them in sync).",
      "The user sets a lower and an upper bound: use [[range-entry]]; a dual-thumb slider is a Limen enhancement.",
      "The options are a few named, ordered answers such as agreement levels: use [[ordinal-scale]].",
      "Several values share a fixed total: use [[allocation]]."
    ],
    characteristics: [
      "Native range input: pointer, touch and keyboard all set the value directly.",
      "The current value is not displayed by Forma; show it in text when it matters (the application updates that text).",
      "Bound labels are visible text and hidden from assistive technology, because the input already exposes min and max."
    ]
  },
  examples: [
    {
      id: "named-stops",
      title: "Alert sensitivity with tick marks",
      description: "A stepped threshold with a datalist connected by list, which shows tick marks in browsers that support it. The bounds use words instead of numbers.",
      html: `<ef-slider class="ef-component-tag">
  <label class="ef-slider">
    <span class="ef-slider__header">
      <span class="ef-slider__label">Alert sensitivity</span>
    </span>
    <input class="ef-slider__input" type="range" name="alert-sensitivity" min="1" max="5" step="1" value="3" list="slider-named-stops-ticks">
    <span class="ef-slider__bounds" aria-hidden="true">
      <span>Fewer alerts</span>
      <span>More alerts</span>
    </span>
  </label>
  <datalist id="slider-named-stops-ticks">
    <option value="1"></option>
    <option value="2"></option>
    <option value="3"></option>
    <option value="4"></option>
    <option value="5"></option>
  </datalist>
</ef-slider>`
    },
    {
      id: "disabled-by-policy",
      title: "Disabled by policy",
      description: "A session-timeout slider locked by an administrator. The root is a wrapper with a for/id label so the explanation is linked as a description rather than folded into the accessible name. The input is natively disabled and dimmed.",
      html: `<ef-slider class="ef-component-tag">
  <div class="ef-slider">
    <span class="ef-slider__header">
      <label class="ef-slider__label" for="slider-disabled-timeout">Session timeout (minutes)</label>
    </span>
    <input class="ef-slider__input" id="slider-disabled-timeout" type="range" name="session-timeout" min="5" max="120" step="5" value="30" disabled aria-describedby="slider-disabled-timeout-description">
    <span class="ef-slider__bounds" aria-hidden="true">
      <span>5</span>
      <span>120</span>
    </span>
    <span class="ef-field__description" id="slider-disabled-timeout-description">Set to 30 minutes by your organization's security policy.</span>
  </div>
</ef-slider>`
    },
    {
      id: "mobile-brightness",
      title: "Mobile display brightness",
      description: "A brightness slider at phone width. The track fills the width and keeps a tall touch area.",
      mobile: {
        height: 220,
        notes: [
          "The input is full width with a 44px minimum height, so the thumb and track are comfortable touch targets.",
          "Dragging is direct manipulation owned by the browser; tapping the track moves the thumb to that point.",
          "The bounds row wraps if its labels are too long for the width instead of overflowing.",
          "Rotating to landscape lengthens the track, which gives finer control."
        ]
      },
      html: `<ef-slider class="ef-component-tag">
  <label class="ef-slider">
    <span class="ef-slider__header">
      <span class="ef-slider__label">Screen brightness</span>
    </span>
    <input class="ef-slider__input" type="range" name="brightness" min="0" max="100" step="1" value="70">
    <span class="ef-slider__bounds" aria-hidden="true">
      <span>0%</span>
      <span>100%</span>
    </span>
  </label>
</ef-slider>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "range", default: "—", description: "Required. Native range input." },
      { name: "min", on: "input", values: "number", default: "0", description: "Lowest value." },
      { name: "max", on: "input", values: "number", default: "100", description: "Highest value." },
      { name: "step", on: "input", values: "number | any", default: "1", description: "Snap increment for pointer and keyboard." },
      { name: "value", on: "input", values: "number", default: "midpoint", description: "Initial value." },
      { name: "name", on: "input", values: "string", default: "—", description: "Form field name." },
      { name: "list", on: "input", values: "id of a datalist", default: "—", description: "Optional suggested values; many browsers draw tick marks for them." },
      { name: "disabled", on: "input", values: "boolean", default: "absent", description: "Removes the slider from focus and submission and dims it." },
      { name: "for", on: "label.ef-slider__label", values: "id of the input", default: "—", description: "Use with a wrapper root so a description can be linked with aria-describedby instead of joining the accessible name." },
      { name: "aria-describedby", on: "input", values: "id of the description", default: "—", description: "Links explanatory text." },
      { name: "aria-hidden", on: ".ef-slider__bounds", values: "true", default: "—", description: "Hides the visual bound labels; the input already exposes its min and max." }
    ],
    hooks: {
      "ef-slider": "Root grid (label element or wrapper) stacking header, input, bounds and description with a 0.5rem gap.",
      "ef-slider__header": "Wrapping flex row for the label; space-between leaves room for an application-maintained value readout.",
      "ef-slider__label": "Visible label text (0.9375rem, weight 650).",
      "ef-slider__input": "The native range input: full width, 44px minimum height, `accent-color` from the active control token, dimmed when disabled, with the shared focus ring.",
      "ef-slider__bounds": "Wrapping flex row of minimum and maximum labels in small monospace text."
    },
    keyboard: [
      { keys: "ArrowLeft / ArrowDown", action: "Decreases by one step (native)." },
      { keys: "ArrowRight / ArrowUp", action: "Increases by one step (native)." },
      { keys: "PageUp / PageDown", action: "Changes by a larger increment in most browsers (native, browser-dependent)." },
      { keys: "Home / End", action: "Sets the minimum or maximum value (native)." }
    ],
    events: [
      { name: "input / change", description: "input fires continuously while dragging; change fires on release. Forma adds none." }
    ],
    form: "A native range input: always submits a value (it cannot be empty), snaps to step, resets to its initial value and is excluded when disabled."
  },
  states: [
    { name: "Default", how: "value", description: "Native thumb and filled track in the accent color." },
    { name: "Hover / pressed", how: ":hover / :active", description: "Slight saturation increase for emphasis; the thumb position is never animated." },
    { name: "Focus", how: ":focus-visible", description: "Two-tone focus ring around the input." },
    { name: "Disabled", how: "disabled attribute", description: "Reduced opacity with a not-allowed cursor." }
  ],
  accessibility: {
    forma: [
      "The native range input exposes role, value, min and max to assistive technology and supports keyboard stepping.",
      "44px minimum height and full width give a large pointer and touch target.",
      "Bound labels are visible text and aria-hidden to avoid double announcement."
    ],
    consumer: [
      "Label the scale and its unit; when the number matters, show the current value as text and keep it in sync.",
      "Never make dragging the only way to set a value: keyboard stepping stays native, and offer a [[numeric-stepper]] for exact entry.",
      "In the canonical label-wrapped structure a description inside the label joins the accessible name; keep it short or use a wrapper root with for/id."
    ]
  },
  responsive: [
    "The input fills its container at every width; a longer track gives finer pointer control.",
    "Header and bounds rows are wrapping flex rows with `min-inline-size: 0`, so long labels wrap rather than overflow.",
    "No breakpoints."
  ],
  motion: [
    "The value and thumb position are direct manipulation and are never transitioned.",
    "Only the hover and press emphasis (a saturation filter) and disabled opacity use a short perceptual interpolation.",
    "Under `prefers-reduced-motion: reduce` the emphasis transition is effectively instant."
  ],
  guidance: {
    do: [
      "Use words at the bounds when numbers mean little to users.",
      "Choose a step that users can hit reliably by keyboard."
    ],
    avoid: [
      "Sliders for precise values or very large ranges.",
      "Hiding the scale's meaning in a tooltip that only appears on hover."
    ]
  },
  related: [
    { slug: "numeric-stepper", note: "Exact number entry within bounds." },
    { slug: "range-entry", note: "Lower and upper endpoints entered directly." },
    { slug: "ordinal-scale", note: "A few named, ordered choices." },
    { slug: "allocation", note: "Several values that must share a total." }
  ]
};
