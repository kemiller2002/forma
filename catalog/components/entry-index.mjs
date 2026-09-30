export default {
  name: "Entry index",
  category: "site",
  behavior: "Site content",
  summary: "Ordered linked entries (research areas, products) that regroup from four columns to one by container width.",
  owns: ["ef-index"],
  purpose: {
    description: "An entry index is an ordered list of destinations, such as research areas or products, where each row shows a marker, a heading with eyebrow, a one-sentence summary and a visible link. On wide containers the rows share four aligned columns through subgrid, so markers, titles, summaries and links line up down the page. Because four columns of different kinds cannot degrade by a minimum item size, the list regroups by its own width with container queries.",
    useWhen: [
      "Listing a small, ordered set of top-level areas or products, each with its own page.",
      "The order or numbering is part of the presentation (R / 01, R / 02).",
      "Rows should align into a table-like index on wide screens without being a data table."
    ],
    avoidWhen: [
      "The items are unordered peers with richer content: use [[card-grid]].",
      "The rows are a numbered procedure without links: use [[steps]].",
      "Users need to sort, filter or compare values: use [[data-grid]] or [[relationship-index]]."
    ],
    characteristics: [
      "An `ol` list: the order is announced, and the marker text is visible content, not a CSS counter.",
      "Each entry has one visible text link that names its destination; the row itself is not a link.",
      "Rows are separated by rules, with a strong rule above the first row."
    ]
  },
  examples: [
    {
      id: "product-family",
      title: "Product family index",
      description: "Four products in order. On a wide container marker, heading, summary and link line up in four columns across every row.",
      html: `<ef-entry-index class="ef-component-tag">
  <div class="ef-site">
    <ol class="ef-index" aria-label="Products">
      <li class="ef-index__item">
        <p class="ef-index__marker">P / 01</p>
        <div class="ef-index__heading"><p class="ef-eyebrow">Domain state</p><h3 class="ef-index__title" id="entry-index-product-family-ordo">Ordo</h3></div>
        <p class="ef-index__summary">Legal transitions, obligations and capabilities as executable rules.</p>
        <a class="ef-index__link" href="#entry-index-product-family-ordo">Visit Ordo</a>
      </li>
      <li class="ef-index__item">
        <p class="ef-index__marker">P / 02</p>
        <div class="ef-index__heading"><p class="ef-eyebrow">Interface behavior</p><h3 class="ef-index__title" id="entry-index-product-family-limen">Limen</h3></div>
        <p class="ef-index__summary">Behavior at the boundary between presentation and domain.</p>
        <a class="ef-index__link" href="#entry-index-product-family-limen">Visit Limen</a>
      </li>
      <li class="ef-index__item">
        <p class="ef-index__marker">P / 03</p>
        <div class="ef-index__heading"><p class="ef-eyebrow">Quality evidence</p><h3 class="ef-index__title" id="entry-index-product-family-dokimos">Dokimos</h3></div>
        <p class="ef-index__summary">Longitudinal code-health evidence across every change.</p>
        <a class="ef-index__link" href="#entry-index-product-family-dokimos">Visit Dokimos</a>
      </li>
      <li class="ef-index__item">
        <p class="ef-index__marker">P / 04</p>
        <div class="ef-index__heading"><p class="ef-eyebrow">Presentation</p><h3 class="ef-index__title" id="entry-index-product-family-forma">Forma</h3></div>
        <p class="ef-index__summary">Zero-runtime HTML and CSS contracts for every Echelon interface.</p>
        <a class="ef-index__link" href="#entry-index-product-family-forma">Visit Forma</a>
      </li>
    </ol>
  </div>
</ef-entry-index>`
    },
    {
      id: "long-titles",
      title: "Long titles and summaries",
      description: "Entries with long titles and two-sentence summaries and no eyebrow. Titles and summaries wrap within their columns; the link text stays on one line.",
      html: `<ef-entry-index class="ef-component-tag">
  <div class="ef-site">
    <ol class="ef-index" aria-label="Research programmes">
      <li class="ef-index__item">
        <p class="ef-index__marker">R / 01</p>
        <div class="ef-index__heading"><h3 class="ef-index__title">Human oversight of automated decisions</h3></div>
        <p class="ef-index__summary">How review, escalation and accountability survive automation. Includes field studies from regulated industries.</p>
        <a class="ef-index__link" href="#entry-index-long-titles-oversight">Read the programme</a>
      </li>
      <li class="ef-index__item" id="entry-index-long-titles-oversight">
        <p class="ef-index__marker">R / 02</p>
        <div class="ef-index__heading"><h3 class="ef-index__title">Evidence-led visual hierarchy</h3></div>
        <p class="ef-index__summary">Measured effects of type, color and composition on comprehension. Findings feed Forma's tokens.</p>
        <a class="ef-index__link" href="#entry-index-long-titles-oversight">Read the programme</a>
      </li>
    </ol>
  </div>
</ef-entry-index>`
    },
    {
      id: "mobile-single-column",
      title: "Phone single column",
      description: "Two research areas at phone width, where each row has regrouped into one column.",
      mobile: {
        height: 520,
        notes: [
          "Below a 56rem list width each row regroups into a 3.5rem marker column beside the content, with heading, summary and link stacked in the second column.",
          "Below 28rem (most phones) the marker also moves into the single column above the heading; source order is unchanged.",
          "The link text does not wrap (`white-space: nowrap`), so keep it short; very long link text can overflow a 320px row.",
          "The link is at least 24px tall and sits alone on its own line, so it is easy to tap without catching neighbours."
        ]
      },
      html: `<ef-entry-index class="ef-component-tag">
  <div class="ef-site">
    <ol class="ef-index" aria-label="Research areas">
      <li class="ef-index__item">
        <p class="ef-index__marker">R / 01</p>
        <div class="ef-index__heading"><p class="ef-eyebrow">Intelligent systems</p><h3 class="ef-index__title">AI Engineering</h3></div>
        <p class="ef-index__summary">Dependable practice, evaluation and human oversight.</p>
        <a class="ef-index__link" href="#entry-index-mobile-single-column-visual">Visit AI Engineering</a>
      </li>
      <li class="ef-index__item" id="entry-index-mobile-single-column-visual">
        <p class="ef-index__marker">R / 02</p>
        <div class="ef-index__heading"><p class="ef-eyebrow">Perception</p><h3 class="ef-index__title">Visual Engineering</h3></div>
        <p class="ef-index__summary">Evidence-led hierarchy, typography and composition.</p>
        <a class="ef-index__link" href="#entry-index-mobile-single-column-visual">Visit Visual Engineering</a>
      </li>
    </ol>
  </div>
</ef-entry-index>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "ol.ef-index", values: "string", default: "—", description: "Names the list when no visible heading introduces it." },
      { name: "href", on: "a.ef-index__link", values: "URL", default: "—", description: "Destination of the entry." }
    ],
    hooks: {
      "ef-index": "The `ol`. A four-column grid (5rem marker, heading, summary, link) with a strong top rule; also the `ef-index` size container for regrouping.",
      "ef-index__item": "One entry. Spans all columns and uses subgrid so rows align; separated by a bottom rule.",
      "ef-index__marker": "Visible entry marker text in the mono label face, such as R / 01.",
      "ef-index__heading": "Wraps the optional eyebrow and the title.",
      "ef-index__title": "Entry title in the display face at the statement size, whatever its heading level.",
      "ef-index__summary": "One-sentence description of the entry.",
      "ef-index__link": "Visible link to the entry's page: small strong text, 24px minimum height, no wrapping."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between entry links in list order." },
      { keys: "Enter", action: "Follows the focused link (native link behavior)." }
    ],
    events: []
  },
  states: [
    { name: "Four columns", how: "list at least 56rem wide", description: "Marker, heading, summary and link align across rows." },
    { name: "Marker and content", how: "@container ef-index (inline-size < 56rem)", description: "Two columns: marker, then everything else stacked." },
    { name: "Single column", how: "@container ef-index (inline-size < 28rem)", description: "Every part stacks in source order." }
  ],
  accessibility: {
    forma: [
      "Keeps the native ordered list so the number of entries and their order are announced.",
      "Regroups without reordering, so reading and focus order are the same at every width.",
      "Keeps entry links underlined, with the shell's visible focus ring."
    ],
    consumer: [
      "Use headings at the level the page outline needs and name the list.",
      "Write link text that names the destination (\"Visit Ordo\"), not \"Learn more\".",
      "Keep link text short, because it does not wrap."
    ]
  },
  responsive: [
    "Container queries on the list itself (`ef-index`) regroup rows at 56rem and 28rem; they respond to the space the list gets, not the viewport.",
    "Columns are `minmax(0, …)`, so titles and summaries wrap instead of widening the page.",
    "`.ef-index__link` uses `white-space: nowrap`; very long link text can overflow at 320px."
  ],
  motion: [
    "No animation: regrouping is immediate and links change only their underline thickness on hover."
  ],
  guidance: {
    do: [
      "Keep the index to a handful of top-level entries.",
      "Keep the marker scheme consistent (R / 01, R / 02)."
    ],
    avoid: [
      "Wrapping a whole row in a link.",
      "Using the marker as the only identifier of an entry."
    ]
  },
  related: [
    { slug: "card-grid", note: "For unordered peers with richer content and stretched links." },
    { slug: "steps", note: "For numbered procedures without destinations." },
    { slug: "relationship-index", note: "For application indexes of related records." }
  ]
};
