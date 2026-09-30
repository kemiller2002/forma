export default {
  name: "Fault details",
  category: "faults",
  behavior: "Application / Limen",
  summary: "Optional disclosure for explicitly approved and already-sanitized diagnostic values only.",
  purpose: {
    description: "Fault details is a native `details` disclosure holding a short description list of diagnostic values that the application has explicitly approved for the current audience, such as the public reference, application name, recovery state, a user-visible dependency name or an approved timestamp. It is deliberately conservative and is not an escape hatch for raw fault data. Redaction and authorization happen before the data reaches Forma: the application builds a separate safe view model and renders only that. Stack traces, exception details, secrets, raw context values, breadcrumbs, snapshot locations, tokens and internal paths never belong here.",
    useWhen: [
      "Support or power users benefit from a few extra, approved facts about a fault without cluttering the primary message.",
      "The application already has an audience-specific safe view model for the fault.",
      "The details should be available on request rather than always visible."
    ],
    avoidWhen: [
      "The only extra information is the reference: show it with [[fault-reference]] in the fault body instead.",
      "The values have not been sanitized and approved for this audience: do not render them at all.",
      "You need a general optional-content disclosure unrelated to faults: use [[disclosure]].",
      "You need a structured key/value display that is always visible: use [[key-value-list]]."
    ],
    characteristics: [
      "Native `details`/`summary`: the browser owns open state, keyboard toggling and the expanded state exposed to assistive technology.",
      "The summary row has a 44px minimum height so it is a comfortable touch target.",
      "Terms and values sit in two columns on wide screens and stack below 36rem; values break anywhere.",
      "An optional boundary note reminds readers that only approved values appear."
    ]
  },
  examples: [
    {
      id: "support-view",
      title: "Support view, open by default",
      description: "A support agent's view where the application opens the disclosure initially with the open attribute. Every row comes from an approved safe view model; the dependency name is the user-visible service name, not an internal host.",
      html: `<ef-fault-details class="ef-component-tag">
  <details class="ef-fault-details" open>
    <summary>Safe diagnostic details</summary>
    <div class="ef-fault-details__content">
      <dl class="ef-fault-details__list">
        <div><dt>Reference</dt><dd><code>AG-8LM3E</code></dd></div>
        <div><dt>Application</dt><dd>Chrona</dd></div>
        <div><dt>Affected service</dt><dd>Calendar sync</dd></div>
        <div><dt>Recovery state</dt><dd>Waiting for sign-in</dd></div>
        <div><dt>First seen</dt><dd><time datetime="2026-09-30T09:40:00Z">30 Sep 2026, 09:40 UTC</time></dd></div>
      </dl>
      <p class="ef-fault-details__boundary">Only explicitly approved, already-sanitized diagnostic values are shown here.</p>
    </div>
  </details>
</ef-fault-details>`
    },
    {
      id: "inside-inline-fault",
      title: "Collapsed details under an inline fault",
      description: "The disclosure composed inside the body of an inline fault, after the reference. The fault's message and recovery action remain visible whether or not the details are expanded.",
      html: `<ef-fault-details class="ef-component-tag">
  <div class="ef-fault ef-fault--inline" role="group" data-ef-intent="inline" data-ef-severity="error" aria-labelledby="fault-details-inside-inline-fault-title">
    <div class="ef-fault__marker" aria-hidden="true">!</div>
    <div class="ef-fault__body">
      <p class="ef-fault__severity">Error</p>
      <p class="ef-fault__title" id="fault-details-inside-inline-fault-title"><strong>Report export failed.</strong></p>
      <p class="ef-fault__message">Your report settings are saved. Try the export again.</p>
      <p class="ef-fault-reference">Reference <code>AG-2RT9M</code></p>
      <details class="ef-fault-details">
        <summary>Safe diagnostic details</summary>
        <div class="ef-fault-details__content">
          <dl class="ef-fault-details__list">
            <div><dt>Export format</dt><dd>PDF</dd></div>
            <div><dt>Recovery state</dt><dd>Retry available</dd></div>
          </dl>
        </div>
      </details>
    </div>
    <div class="ef-recovery-actions" role="group" aria-label="Recovery actions">
      <button type="button" data-ef-aegis-capability="CanRetry">Try again</button>
    </div>
  </div>
</ef-fault-details>`
    },
    {
      id: "mobile-stacked-values",
      title: "Stacked values on a phone",
      description: "An expanded disclosure with long values at phone width.",
      mobile: {
        height: 400,
        notes: [
          "Below 36rem each term/value pair stacks into one column with the value directly under its term.",
          "Values use `overflow-wrap: anywhere`, so long references and service names wrap instead of widening the page.",
          "The summary row keeps a 44px minimum height and the whole row toggles the disclosure on tap.",
          "Orientation changes only reflow the rows; the order of terms does not change."
        ]
      },
      html: `<ef-fault-details class="ef-component-tag">
  <details class="ef-fault-details" open>
    <summary>Safe diagnostic details</summary>
    <div class="ef-fault-details__content">
      <dl class="ef-fault-details__list">
        <div><dt>Reference</dt><dd><code>AG-4F82C-BILLING-RECIPIENTS-2026-09-30</code></dd></div>
        <div><dt>Affected service</dt><dd>Customer billing recipients directory</dd></div>
        <div><dt>Recovery state</dt><dd>Retry available after sign-in</dd></div>
      </dl>
    </div>
  </details>
</ef-fault-details>`
    }
  ],
  api: {
    attributes: [
      { name: "open", on: "details", values: "boolean", default: "absent (collapsed)", description: "Initial expanded state. The live state is owned by the browser; the user can always toggle it." }
    ],
    hooks: {
      "ef-fault-details": "Root native details element with top and bottom borders.",
      "ef-fault-details__content": "Wrapper for the expanded content with bottom padding.",
      "ef-fault-details__list": "Description list of approved term/value pairs; each pair is a div laid out as a two-column grid (terms at least 7rem) that stacks below 36rem.",
      "ef-fault-details__boundary": "Optional small note stating that only approved, sanitized values appear."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus to and from the summary." },
      { keys: "Enter / Space", action: "Toggles the disclosure (native details behavior)." }
    ],
    events: [
      { name: "toggle", description: "Native event fired by details when it opens or closes. Forma attaches nothing to it; any on-demand loading must still return only approved, sanitized values." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Collapsed", how: "no open attribute", description: "Only the summary row is visible." },
    { name: "Expanded", how: "open / [open]", description: "The approved values and optional boundary note are shown." },
    { name: "Focus", how: ":focus-visible on summary", description: "The shared two-tone focus ring on the summary row." }
  ],
  accessibility: {
    forma: [
      "Keeps the platform details/summary semantics, so the expanded state and keyboard toggling come from the browser.",
      "Gives the summary a 44px minimum height and pointer cursor.",
      "Uses description-list semantics so terms and values are announced as pairs.",
      "Keeps borders and the boundary note visible as CanvasText in forced-colors mode."
    ],
    consumer: [
      "Build a separate audience-safe view model and render only its fields; never bind raw fault records.",
      "Keep the reference, message and recovery actions outside the disclosure so they are never hidden.",
      "Write a summary label that says what is inside (\"Safe diagnostic details\").",
      "The summary uses a flex layout, which can suppress the native disclosure triangle; if your audience needs a visible expanded/collapsed cue, state it in the summary text or supporting copy."
    ]
  },
  responsive: [
    "Rows are a two-column grid (`minmax(7rem, auto) minmax(0, 1fr)`) on wide viewports.",
    "Below a 36rem viewport each row stacks into one column with a small gap.",
    "Values break anywhere, so long references and names never overflow at 320px."
  ],
  motion: [
    "No animation: the native details element opens and closes instantly. The component is not part of the physics motion set, so nothing slides or fades."
  ],
  guidance: {
    do: [
      "Keep the list short and meaningful to the audience.",
      "Include the reference again inside the details when support staff read the expanded view."
    ],
    avoid: [
      "Rendering stack traces, exception details, secrets, tokens, internal paths, raw context or breadcrumbs.",
      "Hiding recovery actions or the only copy of the reference inside the disclosure.",
      "Using fault details as a general debugging panel."
    ]
  },
  related: [
    { slug: "disclosure", note: "General-purpose native disclosure with motion; fault-details is the conservative fault-specific variant." },
    { slug: "key-value-list", note: "Always-visible key/value data outside fault presentation." },
    { slug: "fault-reference", note: "The one identifier that must stay visible outside the disclosure." }
  ]
};
