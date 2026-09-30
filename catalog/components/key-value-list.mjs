import { missionById } from "../example-data/nasa-spaceflight.mjs";

const apollo11 = missionById("apollo-11");
const apollo13 = missionById("apollo-13");
const artemisI = missionById("artemis-i");

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
      title: "Mission details with status and source",
      description: "Apollo 11 properties mix plain text, an identifier, an official source link, machine-readable dates and a status lozenge while the structure remains an ordinary description list.",
      html: `<ef-key-value-list class="ef-component-tag">
  <section aria-labelledby="key-value-list-record-details-title">
    <h3 id="key-value-list-record-details-title">${apollo11.name} details</h3>
    <dl class="ef-key-value-list">
      <div><dt>Mission</dt><dd><span class="ef-identifier">${apollo11.id}</span></dd></div>
      <div><dt>Program</dt><dd>${apollo11.program}</dd></div>
      <div><dt>Status</dt><dd><span class="ef-status-lozenge" data-state="ok">${apollo11.status}</span></dd></div>
      <div><dt>Launch</dt><dd><time datetime="${apollo11.launchDate}">${apollo11.launchDate}</time></dd></div>
      <div><dt>NASA source</dt><dd><a href="${apollo11.source.url}">${apollo11.source.title}</a></dd></div>
    </dl>
  </section>
</ef-key-value-list>`
    },
    {
      id: "long-labels-missing-values",
      title: "Long labels and an explicitly unavailable value",
      description: "Apollo 13 supplies naturally long labels and values. A field not represented by the compact reference collection is written as unavailable rather than left blank, so absence cannot be mistaken for loading.",
      html: `<ef-key-value-list class="ef-component-tag">
  <dl class="ef-key-value-list">
    <div><dt>Mission classification and purpose</dt><dd>${apollo13.missionType}</dd></div>
    <div><dt>Command and lunar module spacecraft</dt><dd>${apollo13.spacecraft}</dd></div>
    <div><dt>Crew represented in the reference collection</dt><dd>${apollo13.crew.join(", ")}</dd></div>
    <div><dt>Launch-pad identifier</dt><dd>Not included in this compact reference record</dd></div>
  </dl>
</ef-key-value-list>`
    },
    {
      id: "mobile-mission-summary",
      title: "Mobile mission summary",
      description: "An Artemis I summary at phone width. Each row stacks its label above its value so the SLS/Orion and destination text is not squeezed into a narrow column.",
      mobile: {
        height: 400,
        notes: [
          "At 30rem and below each row becomes one column with the label directly above its value.",
          "The row rule stays, so mission-property pairs remain grouped even when a value wraps.",
          "Long unbroken ids should use identifier styling so they can break safely at 320px.",
          "Links inside values remain ordinary links and should have descriptive text."
        ]
      },
      html: `<ef-key-value-list class="ef-component-tag">
  <dl class="ef-key-value-list">
    <div><dt>Mission</dt><dd>${artemisI.name}</dd></div>
    <div><dt>Spacecraft</dt><dd>${artemisI.spacecraft}</dd></div>
    <div><dt>Launch vehicle</dt><dd>${artemisI.launchVehicle}</dd></div>
    <div><dt>Destination</dt><dd>${artemisI.destination}</dd></div>
    <div><dt>Crew</dt><dd>Uncrewed</dd></div>
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
