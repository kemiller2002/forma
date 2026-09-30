export default {
  name: "Key-value list",
  category: "data",
  behavior: "Native HTML",
  summary: "Description-list presentation of labelled values that stacks label above value on narrow screens.",
  purpose: {
    description: "A key-value list shows the facts about one object as label/value pairs. It is a native `dl` whose `dt`/`dd` pairs are grouped in `div` rows; Forma lays each row out as a two-column grid with a ruled separator and stacks the label above the value at phone width. The list is static content: the application supplies the labels, the values and how missing values are worded.",
    useWhen: [
      "A record, account or object has a handful of named properties to read, such as plan, owner, renewal date or region.",
      "Labels are nouns and each has exactly one value (which may contain a link, a date or a [[status-lozenge]]).",
      "The same facts must read well on a phone without a table."
    ],
    avoidWhen: [
      "Many records share the same fields: use [[data-grid]] or [[dense-ledger]].",
      "Values are compared between two versions or options: use [[comparison-pairs]] or [[diff-viewer]].",
      "The labels describe relationships between entities rather than properties: use [[relationship-index]].",
      "Short marketing claims with supporting detail are shown on a public page: use [[facts]].",
      "The values are editable: use form controls such as [[text-field]] with real labels."
    ],
    characteristics: [
      "Label column is `minmax(7rem, 0.35fr)`; the value column takes the remaining width and can shrink to zero, so long values wrap instead of overflowing.",
      "Each row has a subtle bottom rule, so pairs stay visually grouped when values wrap onto several lines.",
      "At 30rem and below each row becomes a single column with the label directly above its value."
    ]
  },
  examples: [
    {
      id: "record-details",
      title: "Record details with status and links",
      description: "A deployment's properties. Values mix plain text, an [[identifier]], a link, a machine-readable time and a [[status-lozenge]]; the list itself stays a plain description list.",
      html: `<ef-key-value-list class="ef-component-tag">
  <section aria-labelledby="key-value-list-record-details-title">
    <h3 id="key-value-list-record-details-title">Deployment details</h3>
    <dl class="ef-key-value-list">
      <div><dt>Release</dt><dd><span class="ef-identifier">rel-2026.09.29-3f8c21</span></dd></div>
      <div><dt>Environment</dt><dd>Production, EU West</dd></div>
      <div><dt>Status</dt><dd><span class="ef-status-lozenge" data-state="ok">Healthy</span></dd></div>
      <div><dt>Started</dt><dd><time datetime="2026-09-29T07:42:00Z">29 Sep 2026, 07:42 UTC</time></dd></div>
      <div><dt>Owner</dt><dd><a href="#key-value-list-record-details-owner">Platform team</a></dd></div>
    </dl>
  </section>
</ef-key-value-list>`
    },
    {
      id: "long-labels-missing-values",
      title: "Long labels and missing values",
      description: "German labels (marked with `lang=\"de\"`) that are longer than the 7rem minimum label column wrap within it, and values that are not set are written out rather than left blank so an empty `dd` is never mistaken for a loading value.",
      html: `<ef-key-value-list class="ef-component-tag">
  <dl class="ef-key-value-list" lang="de">
    <div><dt>Verantwortliche Abteilung für Rechnungsprüfung</dt><dd>Finanzbuchhaltung Mitteleuropa</dd></div>
    <div><dt>Kostenstelle</dt><dd>Nicht festgelegt</dd></div>
    <div><dt>Umsatzsteuer-Identifikationsnummer</dt><dd><span class="ef-identifier">DE 812 345 678</span></dd></div>
    <div><dt>Letzte Prüfung</dt><dd>Unbekannt: Prüfprotokoll nicht verfügbar</dd></div>
  </dl>
</ef-key-value-list>`
    },
    {
      id: "mobile-account-summary",
      title: "Mobile account summary",
      description: "An account summary at phone width. Each row stacks its label above its value so neither is squeezed into a narrow column.",
      mobile: {
        height: 360,
        notes: [
          "At 30rem (480px) and below each row switches to `grid-template-columns: 1fr` with a 0.25rem gap: the label sits directly above its value.",
          "The row rule stays, so pairs remain grouped even when a value wraps across several lines.",
          "Long unbroken values should use [[identifier]] (which allows breaking anywhere) so they wrap at 320px instead of overflowing.",
          "Links inside values are ordinary inline links; give them enough text to be comfortable tap targets or place them on their own line.",
          "Orientation changes only switch between the stacked and two-column rows at the 30rem breakpoint."
        ]
      },
      html: `<ef-key-value-list class="ef-component-tag">
  <dl class="ef-key-value-list">
    <div><dt>Account</dt><dd>Northwind Logistics International</dd></div>
    <div><dt>Plan</dt><dd>Business, billed monthly</dd></div>
    <div><dt>Seats</dt><dd>48 of 50 in use</dd></div>
    <div><dt>Billing contact</dt><dd><a href="#key-value-list-mobile-account-summary-contact">accounts-payable@northwind.example</a></dd></div>
  </dl>
</ef-key-value-list>`
    }
  ],
  api: {
    attributes: [
      { name: "datetime", on: "time", values: "ISO date or date-time", default: "—", description: "Machine-readable form of a date value; the visible text stays human-formatted." },
      { name: "aria-labelledby", on: "wrapping section", values: "id of a heading", default: "—", description: "Names the section that contains the list when the list has a visible heading." }
    ],
    hooks: {
      "ef-key-value-list": "The native `dl`. Each direct `div` child is a label/value row laid out as a two-column grid with a subtle bottom rule."
    },
    keyboard: [
      { keys: "Tab", action: "Only interactive content inside values (links, buttons) is focusable; the list itself is not." }
    ],
    events: [],
    form: "Not a form control. Display values only; editable fields need real form controls."
  },
  states: [
    { name: "Two-column rows", how: "viewport > 30rem", description: "Label column `minmax(7rem, 0.35fr)` beside a flexible value column." },
    { name: "Stacked rows", how: "viewport ≤ 30rem", description: "Label above value in a single column." },
    { name: "Missing or unknown value", how: "application text in the dd", description: "Written as words (Not set, Unknown); Forma adds no special styling." }
  ],
  accessibility: {
    forma: [
      "Uses the native description list, so assistive technology exposes each term with its description.",
      "Keeps DOM order and reading order identical at every width; only the grid columns change.",
      "Allows the value column to shrink (`minmax(0, 1fr)`), so long values wrap instead of creating horizontal scrolling."
    ],
    consumer: [
      "Wrap each `dt`/`dd` pair in a `div` directly inside the `dl`; that `div` is the styled row.",
      "Give the list a heading or section name when there are several lists on a page.",
      "Write missing, unknown and not-applicable values as text.",
      "Do not put state only in color; use [[status-lozenge]] text inside the value."
    ]
  },
  responsive: [
    "Two columns above 30rem: `minmax(7rem, 0.35fr) minmax(0, 1fr)` with a 1rem gap.",
    "At 30rem and below each row stacks into one column with a 0.25rem gap.",
    "Long labels wrap within the label column; long values wrap within the value column.",
    "The value `dd` keeps the browser's default inline-start margin, so values are indented by the user agent's default at every width."
  ],
  motion: [
    "No animation: the layout switch at 30rem is instant and nothing transitions."
  ],
  guidance: {
    do: [
      "Keep labels short nouns and order rows by what users look for first.",
      "Use [[identifier]] for codes and [[status-lozenge]] for state inside values."
    ],
    avoid: [
      "Using a key-value list for a table of many records.",
      "Leaving a `dd` empty to mean unknown or none.",
      "Placing several unrelated values in one `dd`; split them into rows."
    ]
  },
  related: [
    { slug: "facts", note: "Marketing-tone description list of short claims with supporting detail, laid out as an auto-fitting grid." },
    { slug: "relationship-index", note: "Also a description list, but its terms are relationship types and its values are linked entities." },
    { slug: "comparison-pairs", note: "Shows each label with a before and an after value." },
    { slug: "data-grid", note: "Use when many records share the same fields." },
    { slug: "record-header", note: "Record identity, type, status and actions that usually sit above a key-value list." }
  ]
};
