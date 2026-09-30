export default {
  name: "Survey progress",
  category: "assessment",
  behavior: "Native HTML",
  summary: "Determinate progress using the native progress element plus explicit current/total text.",
  purpose: {
    description: "Survey progress tells respondents where they are in a questionnaire: a label, an explicit \"Question 3 of 12\" value, a native `progress` bar and optional section context. The text is the primary information; the bar reinforces it. All values come from the application, which defines what progress means (questions, pages or sections) and recalculates it when branching changes the total. Forma never decides whether work is complete.",
    useWhen: [
      "A survey or assessment spans several questions or pages and respondents benefit from knowing how far along they are.",
      "The current position and total are known (determinate progress).",
      "Section context helps orient the respondent."
    ],
    avoidWhen: [
      "The work is a system task such as an upload or export: use [[progress-bar]].",
      "The total is unknown: use [[progress-bar]] in its indeterminate form or a [[spinner]].",
      "Users need to navigate between steps: use [[wizard]] or [[steps]].",
      "Progress is through scrolled content: use [[scroll-progress]]."
    ],
    characteristics: [
      "Native `progress` with `value` and `max`, labelled by the visible label.",
      "Explicit current/total text in monospace so users do not have to estimate the bar.",
      "Accent color via `accent-color`; the bar keeps the platform's rendering.",
      "Header wraps on narrow screens; the bar is always full width."
    ]
  },
  examples: [
    {
      id: "page-based",
      title: "Page-based progress after branching",
      description: "Progress measured in pages. An earlier answer removed a section, so the application recalculated the total from 6 to 5 pages and says so in the context line.",
      html: `<ef-survey-progress class="ef-component-tag">
  <div class="ef-survey-progress">
    <div class="ef-survey-progress__header">
      <span class="ef-survey-progress__label" id="survey-page-label">Assessment progress</span>
      <span class="ef-survey-progress__value">Page 2 of 5</span>
    </div>
    <progress class="ef-survey-progress__bar" value="2" max="5" aria-labelledby="survey-page-label">40%</progress>
    <p class="ef-survey-progress__context">Security section skipped based on your earlier answer.</p>
  </div>
</ef-survey-progress>`
    },
    {
      id: "all-answered",
      title: "All questions answered",
      description: "The final question is answered and the bar is full. The text tells the respondent what happens next; a full bar alone does not mean the application has accepted the submission.",
      html: `<ef-survey-progress class="ef-component-tag">
  <div class="ef-survey-progress">
    <div class="ef-survey-progress__header">
      <span class="ef-survey-progress__label" id="survey-done-label">Survey progress</span>
      <span class="ef-survey-progress__value">12 of 12 answered</span>
    </div>
    <progress class="ef-survey-progress__bar" value="12" max="12" aria-labelledby="survey-done-label">100%</progress>
    <p class="ef-survey-progress__context">Review your answers, then submit.</p>
  </div>
</ef-survey-progress>`
    },
    {
      id: "mobile-wrapping-header",
      title: "Long section name on a phone",
      description: "A long label and value at phone width. The header wraps onto two lines while the bar stays full width.",
      mobile: {
        height: 200,
        notes: [
          "The header is a wrapping flex row: when label and value do not fit side by side, the value drops to its own line.",
          "The bar is always 100% of the available width, so the proportion stays readable.",
          "Section context wraps as normal text; nothing is truncated.",
          "No horizontal overflow at 320px in either orientation."
        ]
      },
      html: `<ef-survey-progress class="ef-component-tag">
  <div class="ef-survey-progress">
    <div class="ef-survey-progress__header">
      <span class="ef-survey-progress__label" id="survey-mobile-label">Operational readiness assessment</span>
      <span class="ef-survey-progress__value">Question 17 of 40</span>
    </div>
    <progress class="ef-survey-progress__bar" value="17" max="40" aria-labelledby="survey-mobile-label">43%</progress>
    <p class="ef-survey-progress__context">Section 3 of 6 · Incident response and communication</p>
  </div>
</ef-survey-progress>`
    }
  ],
  api: {
    attributes: [
      { name: "value", on: "progress", values: "number", default: "—", description: "Current position supplied by the application." },
      { name: "max", on: "progress", values: "number", default: "1", description: "Total supplied by the application; update it when branching changes the total." },
      { name: "aria-labelledby", on: "progress", values: "id of .ef-survey-progress__label", default: "—", description: "Gives the bar its accessible name." }
    ],
    hooks: {
      "ef-survey-progress": "Root grid stacking header, bar and context.",
      "ef-survey-progress__header": "Wrapping flex row with label and value at opposite ends.",
      "ef-survey-progress__label": "Bold visible label; reference it from the bar.",
      "ef-survey-progress__value": "Explicit current/total text in small monospace.",
      "ef-survey-progress__bar": "The native progress element: full width, 0.65rem tall, accent color from the theme.",
      "ef-survey-progress__context": "Optional section or status text under the bar."
    },
    keyboard: [
      { keys: "None", action: "Not interactive and not focusable." }
    ],
    events: [],
    form: "Does not participate in forms."
  },
  states: [
    { name: "In progress", how: "value < max", description: "Partially filled bar with explicit text." },
    { name: "Full", how: "value = max", description: "Bar filled. Completion is still decided by the application." },
    { name: "Recalculated", how: "application changes max", description: "The bar and text reflect the new total; explain the change in context text." }
  ],
  accessibility: {
    forma: [
      "Uses the native progress element, exposing value and max as a progressbar to assistive technology.",
      "Shows current/total as text, so the state does not depend on reading the bar.",
      "Provides fallback content inside the progress element for older user agents."
    ],
    consumer: [
      "Keep the value text, value and max in sync.",
      "Describe what the numbers count (questions, pages, sections).",
      "Do not announce every change with a live region; update quietly and let users query it."
    ]
  },
  responsive: [
    "Header wraps as a flex row with a 1rem gap.",
    "The bar is always full width.",
    "No breakpoints; context text wraps normally."
  ],
  motion: [
    "No animation: the bar's fill is rendered by the browser and changes immediately when the application writes a new value."
  ],
  guidance: {
    do: [
      "Place progress at the top of each survey page, in the same position every time.",
      "Recalculate totals when branching changes them, and say so."
    ],
    avoid: [
      "Showing a bar without the explicit current/total text.",
      "Using a full bar as the signal that the survey has been submitted."
    ]
  },
  related: [
    { slug: "progress-bar", note: "For system tasks, including indeterminate progress." },
    { slug: "wizard", note: "Adds navigable steps, validation and actions around progress." },
    { slug: "question", note: "Frames each question the progress counts." }
  ]
};
