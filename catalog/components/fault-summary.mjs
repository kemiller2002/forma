export default {
  name: "Fault summary",
  category: "faults",
  behavior: "Aegis / Application",
  summary: "Focusable grouped presentation of unresolved faults after upstream fingerprinting and deduplication.",
  purpose: {
    description: "A fault summary lists several unresolved Aegis faults in one programmatically focusable region: a count, a title, and one entry per already-grouped fault with its severity text, reference, occurrence count and, where relevant, a link to the affected region. Forma does not fingerprint, deduplicate or decide that two faults share a cause; Aegis lifecycle logic and the application supply the grouped entries and counts. After a failed submit or similar action the application can move focus to the summary so keyboard and screen-reader users land on one clear starting point.",
    useWhen: [
      "A consequential action produced more than one unresolved fault and the user needs one place to start.",
      "Repeated faults have been grouped upstream and should appear once with an occurrence count.",
      "Each fault relates to a region on the page that the user can jump to."
    ],
    avoidWhen: [
      "There is only one fault and it belongs to a visible region: use [[fault-inline]] there.",
      "The problems are user input validation errors: use [[validation-summary]].",
      "The condition affects the whole application: use [[fault-banner]].",
      "You would need Forma to collapse duplicates or compute counts; that logic stays in Aegis or the application."
    ],
    characteristics: [
      "`tabindex=\"-1\"` makes the region focusable by script without adding a tab stop.",
      "Each entry shows severity as text in its metadata line; Critical entries are also bold.",
      "Entries are an ordered list, so the order the application supplies (for example by severity or page position) is announced.",
      "No live region by default: announcements happen through focus, not repeated assertive updates."
    ]
  },
  examples: [
    {
      id: "failed-submit",
      title: "After a failed submit",
      description: "A summary above a short form after submission failed. Each link targets the affected field in the same page; the critical entry is bold as well as labelled Critical. The application focuses the summary once after the failed submit.",
      html: `<ef-fault-summary class="ef-component-tag">
  <section class="ef-fault-summary" tabindex="-1" aria-labelledby="fault-summary-failed-submit-title">
    <div class="ef-fault-summary__heading">
      <div class="ef-fault-summary__marker" aria-hidden="true">!!</div>
      <div>
        <p class="ef-fault__severity">3 unresolved faults</p>
        <h2 id="fault-summary-failed-submit-title">The claim was not submitted</h2>
      </div>
    </div>
    <ol class="ef-fault-summary__list">
      <li data-ef-severity="critical">
        <a href="#fault-summary-failed-submit-payee">Payee account could not be verified</a>
        <span class="ef-fault-summary__meta">Critical · AG-5ZE7K</span>
      </li>
      <li data-ef-severity="error">
        <a href="#fault-summary-failed-submit-receipt">Receipt upload failed</a>
        <span class="ef-fault-summary__meta">Error · AG-5CN0V · occurred 2 times</span>
      </li>
      <li data-ef-severity="warning">
        <a href="#fault-summary-failed-submit-rate">Exchange rate is from yesterday</a>
        <span class="ef-fault-summary__meta">Warning · AG-40RQN</span>
      </li>
    </ol>
  </section>
  <div class="ef-stack" data-density="compact">
    <div class="ef-field">
      <label class="ef-field__label" for="fault-summary-failed-submit-payee">Payee account</label>
      <input id="fault-summary-failed-submit-payee" name="payee" type="text" value="Northwind Supplies Ltd">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="fault-summary-failed-submit-receipt">Receipt</label>
      <input id="fault-summary-failed-submit-receipt" name="receipt" type="file">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="fault-summary-failed-submit-rate">Exchange rate</label>
      <input id="fault-summary-failed-submit-rate" name="rate" type="text" inputmode="decimal" value="1.1642">
    </div>
  </div>
</ef-fault-summary>`
    },
    {
      id: "grouped-repeats",
      title: "One grouped fault with many occurrences",
      description: "Aegis grouped fourteen identical failures into one entry. The summary shows the count supplied upstream; Forma does not compute it. The entry has no affected region, so it is plain text instead of a link.",
      html: `<ef-fault-summary class="ef-component-tag">
  <section class="ef-fault-summary" tabindex="-1" aria-labelledby="fault-summary-grouped-repeats-title">
    <div class="ef-fault-summary__heading">
      <div class="ef-fault-summary__marker" aria-hidden="true">!</div>
      <div>
        <p class="ef-fault__severity">1 unresolved fault</p>
        <h2 id="fault-summary-grouped-repeats-title">Nightly export needs attention</h2>
        <p>Repeated occurrences are grouped by the application before rendering.</p>
      </div>
    </div>
    <ol class="ef-fault-summary__list">
      <li data-ef-severity="error">
        <strong>Export to the reporting warehouse timed out</strong>
        <span class="ef-fault-summary__meta">Error · AG-2RT9M · occurred 14 times since 02:00 UTC</span>
      </li>
    </ol>
  </section>
</ef-fault-summary>`
    },
    {
      id: "mobile-summary",
      title: "Fault summary on a phone",
      description: "A summary with long entry titles and references at phone width.",
      mobile: {
        height: 440,
        notes: [
          "The summary is a single-column grid at every width; the marker and heading stay side by side and the heading text wraps.",
          "Entry links wrap onto several lines and the monospace metadata line breaks anywhere, so long references never cause horizontal scrolling.",
          "Links keep their full text as the touch target; leave vertical space between entries (the list uses a 0.65rem gap) rather than shrinking text.",
          "Orientation changes only reflow text; list order and numbering stay the same."
        ]
      },
      html: `<ef-fault-summary class="ef-component-tag">
  <section class="ef-fault-summary" tabindex="-1" aria-labelledby="fault-summary-mobile-summary-title">
    <div class="ef-fault-summary__heading">
      <div class="ef-fault-summary__marker" aria-hidden="true">!</div>
      <div>
        <p class="ef-fault__severity">2 unresolved faults</p>
        <h2 id="fault-summary-mobile-summary-title">Some changes were not saved</h2>
      </div>
    </div>
    <ol class="ef-fault-summary__list">
      <li data-ef-severity="error">
        <a href="#fault-summary-mobile-summary-title">Delivery instructions for the north warehouse loading dock could not be saved</a>
        <span class="ef-fault-summary__meta">Error · AG-4F82C-DELIVERY-NORTH · occurred 3 times</span>
      </li>
      <li data-ef-severity="warning">
        <a href="#fault-summary-mobile-summary-title">Synchronization is waiting for the carrier service</a>
        <span class="ef-fault-summary__meta">Warning · AG-91B7Q</span>
      </li>
    </ol>
  </section>
</ef-fault-summary>`
    }
  ],
  api: {
    attributes: [
      { name: "tabindex", on: "section.ef-fault-summary", values: "-1", default: "—", description: "Required. Lets the application move focus to the summary after a failed operation without adding a tab stop." },
      { name: "aria-labelledby", on: "section.ef-fault-summary", values: "id of the heading", default: "—", description: "Names the region so focus lands on a named landmark." },
      { name: "data-ef-severity", on: "li", values: "diagnostic | warning | error | critical", default: "—", description: "Records each entry's Aegis severity. critical makes the entry bold; the severity must also be written in the metadata line." },
      { name: "href", on: "a", values: "#id of the affected region", default: "—", description: "Links an entry to the field or region it concerns. Omit the link when there is no affected region." },
      { name: "aria-hidden", on: ".ef-fault-summary__marker", values: "true", default: "—", description: "Hides the decorative marker glyph." }
    ],
    hooks: {
      "ef-fault-summary": "Root section: a bordered grid with a strong 3px focus-visible outline and ring so programmatic focus is visible.",
      "ef-fault-summary__heading": "Two-column grid placing the marker beside the count, heading and optional note.",
      "ef-fault-summary__marker": "Decorative round marker glyph.",
      "ef-fault-summary__list": "Ordered list of grouped entries with a 0.65rem gap and visible numbering.",
      "ef-fault-summary__meta": "Monospace metadata line for severity, reference and occurrence count; breaks anywhere."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between entry links. The summary itself is not in the tab order (tabindex=-1)." },
      { keys: "Enter", action: "Follows the focused link to the affected region (native link behavior). The target should be focusable or a form control so focus moves with it." }
    ],
    events: [
      { name: "—", description: "No Forma events. The application calls focus() on the summary after a failed submit; links use native navigation." }
    ],
    form: "Not a form control. It can sit above a form and link to its fields."
  },
  states: [
    { name: "Unfocused", how: "default", description: "A bordered region listing the grouped faults." },
    { name: "Focused", how: ":focus-visible after application focus()", description: "3px outline with an outer focus ring; the region is announced by its name." },
    { name: "Critical entry", how: "li data-ef-severity=\"critical\" plus text", description: "Entry text is bold in addition to the Critical label." },
    { name: "Grouped entry", how: "occurrence text supplied by the application", description: "The meta line states how many times the grouped fault occurred." }
  ],
  accessibility: {
    forma: [
      "Provides a strong visible focus indicator for the region when it receives focus.",
      "Writes severity as text in every entry and uses bold weight for Critical as a non-color cue.",
      "Keeps the marker decorative and the list semantic, so entries are counted and ordered for assistive technology.",
      "Keeps borders, marker and metadata text visible in forced-colors mode."
    ],
    consumer: [
      "Supply already-grouped entries and occurrence counts from Aegis; never deduplicate in markup.",
      "Focus the summary once after a failed consequential action; do not add an assertive live region that repeats on every render.",
      "Make link targets focusable (form controls, or elements with tabindex=\"-1\") so focus follows navigation.",
      "Update or remove entries as Aegis reports faults resolved, reopened or superseded."
    ]
  },
  responsive: [
    "A single-column grid at every width; the heading row keeps the marker in an intrinsic-width column.",
    "Entry links and headings wrap; metadata uses `overflow-wrap: anywhere` so long references fit at 320px.",
    "There are no breakpoints; the list numbering uses a 1.4rem inline-start padding that remains readable on phones."
  ],
  motion: [
    "No animation: the summary appears with the application's render and focus moves to it immediately.",
    "Only native link and focus styling change state; nothing slides, fades or pulses."
  ],
  guidance: {
    do: [
      "State the count in the first line so users know how much work there is.",
      "Order entries meaningfully, for example by severity or by position on the page.",
      "Keep the reference in each entry so support can match it."
    ],
    avoid: [
      "Listing the same fault several times instead of an occurrence count.",
      "Using role=\"alert\" and re-rendering, which repeats the announcement.",
      "Linking to regions that no longer exist after the fault resolves."
    ]
  },
  related: [
    { slug: "validation-summary", note: "Same focus-after-submit pattern for user input errors, not Aegis faults." },
    { slug: "fault-inline", note: "The per-region fault each summary entry can point to." },
    { slug: "fault", note: "The single-fault shell with full message and recovery actions." }
  ]
};
