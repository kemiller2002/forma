export default {
  name: "Progress bar",
  category: "feedback",
  behavior: "Native HTML",
  summary: "Native determinate progress projected directly from the authoritative value (never overshoots), plus a browser-owned indeterminate variant with explicit text.",
  owns: ["ef-progress"],
  purpose: {
    description: "A progress bar shows how far a task has got, using the native `progress` element. Forma adds a header with a label and a textual value, and sizes the bar. The application supplies `value` and `max` as it receives them; the bar renders that value immediately with no transition, so it never shows more progress than the application reported. When the total is unknown, omitting `value` gives the browser's indeterminate bar and the header text says so.",
    useWhen: [
      "The application can count completed work against a known total: records, files, bytes or steps.",
      "A long operation needs to show that it is advancing and roughly how much remains.",
      "Work starts with an unknown total that becomes known later; the same element switches from indeterminate to determinate."
    ],
    avoidWhen: [
      "Nothing is known about the amount of work: use [[spinner]], or keep the indeterminate variant with explicit text.",
      "The value is a measurement against a range (disk usage, a score), not task completion: use [[measure]].",
      "Progress through a questionnaire or a multi-step form: use [[survey-progress]] or [[steps]]."
    ],
    characteristics: [
      "The bar is the native `progress` element, so role, value and range come from the platform.",
      "No transition or animation is declared on the determinate bar: a decrease after reconciliation is shown as a decrease.",
      "The header value is text (\"420 of 1,000 records\"), so the amount is available without reading the bar."
    ]
  },
  examples: [
    {
      id: "upload-complete",
      title: "Completed upload",
      description: "A determinate bar at its maximum. The header value states completion in words, so the finished state does not depend on the bar being full.",
      html: `<ef-progress-bar class="ef-component-tag">
  <div class="ef-progress">
    <div class="ef-progress__header">
      <span class="ef-progress__label" id="progress-bar-upload-complete-label">Uploading contracts.zip</span>
      <span class="ef-progress__value">Complete: 24.6 of 24.6 MB</span>
    </div>
    <progress class="ef-progress__bar" value="24.6" max="24.6" aria-labelledby="progress-bar-upload-complete-label">100%</progress>
  </div>
</ef-progress-bar>`
    },
    {
      id: "import-stages",
      title: "Multi-stage import",
      description: "Three bars for the stages of an import in a [[stack]]: a finished stage, one in progress, and one waiting. The waiting stage has `value=\"0\"`, which is determinate and empty, not indeterminate.",
      html: `<ef-progress-bar class="ef-component-tag">
  <section class="ef-stack" aria-labelledby="progress-bar-import-stages-title">
    <h3 id="progress-bar-import-stages-title">Importing customer records</h3>
    <div class="ef-progress">
      <div class="ef-progress__header">
        <span class="ef-progress__label" id="progress-bar-import-stages-validate">Validate file</span>
        <span class="ef-progress__value">Done</span>
      </div>
      <progress class="ef-progress__bar" value="1" max="1" aria-labelledby="progress-bar-import-stages-validate">Done</progress>
    </div>
    <div class="ef-progress">
      <div class="ef-progress__header">
        <span class="ef-progress__label" id="progress-bar-import-stages-write">Write records</span>
        <span class="ef-progress__value">3,120 of 8,000</span>
      </div>
      <progress class="ef-progress__bar" value="3120" max="8000" aria-labelledby="progress-bar-import-stages-write">39%</progress>
    </div>
    <div class="ef-progress">
      <div class="ef-progress__header">
        <span class="ef-progress__label" id="progress-bar-import-stages-index">Rebuild search index</span>
        <span class="ef-progress__value">Waiting</span>
      </div>
      <progress class="ef-progress__bar" value="0" max="1" aria-labelledby="progress-bar-import-stages-index">Waiting</progress>
    </div>
  </section>
</ef-progress-bar>`
    },
    {
      id: "reconciled-decrease",
      title: "Progress revised downward",
      description: "After a retry, the application reports fewer confirmed records than before. The bar is set to the lower authoritative value and the header explains why, instead of holding the earlier, higher figure.",
      html: `<ef-progress-bar class="ef-component-tag">
  <div class="ef-progress">
    <div class="ef-progress__header">
      <span class="ef-progress__label" id="progress-bar-reconciled-decrease-label">Sending statements</span>
      <span class="ef-progress__value">610 of 1,000 confirmed (40 re-queued after timeout)</span>
    </div>
    <progress class="ef-progress__bar" value="610" max="1000" aria-labelledby="progress-bar-reconciled-decrease-label">61%</progress>
  </div>
</ef-progress-bar>`
    },
    {
      id: "mobile-backup",
      title: "Mobile backup",
      description: "A long label and value at phone width.",
      mobile: {
        height: 200,
        notes: [
          "The header is a wrapping flex row: when label and value do not fit on one line, the value moves below the label.",
          "The bar always fills the full width of the component, so small increments stay visible on narrow screens.",
          "Nothing scrolls horizontally at 320px; long labels wrap.",
          "The bar has no touch interaction; any Pause or Cancel control is a separate button."
        ]
      },
      html: `<ef-progress-bar class="ef-component-tag">
  <div class="ef-progress">
    <div class="ef-progress__header">
      <span class="ef-progress__label" id="progress-bar-mobile-backup-label">Backing up the shared finance workspace</span>
      <span class="ef-progress__value">1.2 of 3.8 GB</span>
    </div>
    <progress class="ef-progress__bar" value="1.2" max="3.8" aria-labelledby="progress-bar-mobile-backup-label">32%</progress>
  </div>
</ef-progress-bar>`
    }
  ],
  api: {
    attributes: [
      { name: "value", on: "progress", values: "number from 0 to max", default: "absent (indeterminate)", description: "The authoritative amount done. Omit it for the indeterminate state." },
      { name: "max", on: "progress", values: "positive number", default: "1", description: "The total. Use the real unit (records, bytes) so value and header text agree." },
      { name: "aria-labelledby", on: "progress", values: "id of .ef-progress__label", default: "—", description: "Names the progressbar from the visible label." },
      { name: "id", on: ".ef-progress__label", values: "unique id", default: "—", description: "Target for aria-labelledby." }
    ],
    hooks: {
      "ef-progress": "Root grid stacking the header above the bar.",
      "ef-progress__header": "Wrapping flex row with the label at the start and the value at the end.",
      "ef-progress__label": "Bold label naming the task. Referenced by the bar's aria-labelledby.",
      "ef-progress__value": "Secondary, monospace text stating the amount in words or numbers.",
      "ef-progress__bar": "The native progress element: full width, 0.65rem tall, with the accent color."
    },
    keyboard: [
      { keys: "—", action: "Not focusable and not interactive. Screen readers expose it as a progressbar with its value." }
    ],
    events: [
      { name: "—", description: "None. The application sets the `value` property as updates arrive." }
    ],
    form: "The progress element does not submit a value or take part in form validation."
  },
  states: [
    { name: "Determinate", how: "value and max set", description: "The bar fills to value/max immediately on each update, with no interpolation." },
    { name: "Complete", how: "value equals max", description: "Full bar. State completion in the header text too." },
    { name: "Indeterminate", how: "no value attribute", description: "Browser-owned activity presentation. The header value must say the total is not yet known." },
    { name: "Decreased", how: "value set lower than before", description: "Shown truthfully; nothing hides or smooths the reduction." }
  ],
  accessibility: {
    forma: [
      "Uses the native `progress` element, so its role and current value are exposed by the platform.",
      "Places the amount in visible text as well as in the bar.",
      "Keeps the bar visible in forced colors by relying on the native element's system rendering."
    ],
    consumer: [
      "Label every bar through `aria-labelledby` or a `label` element.",
      "Update the header text together with `value` so they never disagree.",
      "Only set `value` equal to `max` when the application has confirmed completion.",
      "If progress changes should be announced, put a short summary in a separate `role=\"status\"` region at sensible intervals; the bar itself is not a live region."
    ]
  },
  responsive: [
    "The bar is 100% of the component's width at every size.",
    "The header wraps: label and value sit on one line when they fit and stack otherwise.",
    "No breakpoints; place several bars in a [[stack]] for multi-stage work."
  ],
  motion: [
    "No animation on the determinate bar: each new value is placed immediately, so the bar cannot lag behind or overshoot the reported value.",
    "The indeterminate bar's activity animation belongs to the browser's native `progress` rendering; Forma does not add or change it.",
    "Reduced-motion preferences therefore need no special handling for determinate progress."
  ],
  guidance: {
    do: [
      "Express the value in the user's unit (\"420 of 1,000 records\").",
      "Switch from indeterminate to determinate as soon as the total is known."
    ],
    avoid: [
      "Faking progress with a timer that is not tied to real work.",
      "Adding a CSS transition to the bar, which could show more progress than has happened."
    ]
  },
  related: [
    { slug: "spinner", note: "Indeterminate activity with no amount at all." },
    { slug: "measure", note: "A value within a range, such as capacity used, not task completion." },
    { slug: "survey-progress", note: "Position within a questionnaire." },
    { slug: "steps", note: "Named, ordered steps rather than a quantity." }
  ]
};
