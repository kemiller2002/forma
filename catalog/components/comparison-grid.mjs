export default {
  name: "Comparison grid",
  category: "data",
  behavior: "Application content",
  summary: "Preserves cross-item comparison relationships in a bounded two-dimensional surface.",
  purpose: {
    description: "A comparison grid is a native `table` with items as columns and attributes as row headers, inside a focusable, labelled region that scrolls horizontally when the table is wider than its container. The table is sized to its content (`min-inline-size: max-content`), so columns are never squeezed or recomposed: reading across a row always compares the same attribute. Forma provides the bounded surface and cell spacing; the application supplies the items, attributes and wording, including explicit Not included and Unknown cells.",
    useWhen: [
      "Three or more items (plans, vendors, releases) are compared across the same attributes.",
      "Keeping rows and columns aligned matters more than avoiding horizontal scrolling on phones.",
      "Each cell is a short value or phrase."
    ],
    avoidWhen: [
      "Only two items are compared: use [[comparison-pairs]], which stays readable on phones without scrolling.",
      "Rows are records the user acts on: use [[data-grid]].",
      "The table is an expert ledger of many entries: use [[dense-ledger]].",
      "The comparison is a marketing pricing layout with prominent calls to action: compose [[card-grid]] or [[cta]] instead of styling table cells as cards."
    ],
    characteristics: [
      "The region scrolls horizontally with `overscroll-behavior-inline: contain`, so a sideways swipe does not scroll the page.",
      "The table uses `min-inline-size: max-content`: columns take the width their content needs.",
      "Cells are start-aligned and top-aligned with 0.75rem padding.",
      "The focused region shows a 2px outline in the current text color."
    ]
  },
  examples: [
    {
      id: "not-included-and-unknown",
      title: "Not included and unknown values",
      description: "Three support tiers. Missing capabilities say Not included, and a value the vendor has not published says Unknown, so an empty cell never has to be interpreted.",
      html: `<ef-comparison-grid class="ef-component-tag">
  <div class="ef-comparison-grid" role="region" aria-label="Support tier comparison" tabindex="0">
    <table>
      <caption>Support tier comparison</caption>
      <thead><tr><th scope="col">Capability</th><th scope="col">Basic</th><th scope="col">Business</th><th scope="col">Enterprise</th></tr></thead>
      <tbody>
        <tr><th scope="row">First response</th><td>2 business days</td><td>8 hours</td><td>1 hour</td></tr>
        <tr><th scope="row">Phone support</th><td>Not included</td><td>Business hours</td><td>24 × 7</td></tr>
        <tr><th scope="row">Named engineer</th><td>Not included</td><td>Not included</td><td>Included</td></tr>
        <tr><th scope="row">Uptime commitment</th><td>None</td><td>99.9%</td><td>Unknown: contract specific</td></tr>
      </tbody>
    </table>
  </div>
</ef-comparison-grid>`
    },
    {
      id: "wide-vendor-comparison",
      title: "Wide vendor comparison",
      description: "Five vendors across four attributes is wider than most containers. The table keeps every column at its content width and the region scrolls sideways within its own bounds instead of widening the page. The row headers stay first in each row so every value can be traced to its attribute.",
      html: `<ef-comparison-grid class="ef-component-tag">
  <div class="ef-comparison-grid" role="region" aria-label="Freight vendor comparison" tabindex="0">
    <table>
      <caption>Freight vendor comparison, Q4 quotes</caption>
      <thead>
        <tr><th scope="col">Attribute</th><th scope="col">Northline Freight</th><th scope="col">Baltic Carriers</th><th scope="col">Rhein Logistik</th><th scope="col">Atlas Shipping Group</th><th scope="col">Coastal Haulage</th></tr>
      </thead>
      <tbody>
        <tr><th scope="row">Rate per pallet</th><td>€142</td><td>€128</td><td>€151</td><td>€119</td><td>€135</td></tr>
        <tr><th scope="row">Transit, Rotterdam to Lyon</th><td>3 days</td><td>4 days</td><td>2 days</td><td>5 days</td><td>3 days</td></tr>
        <tr><th scope="row">Customs brokerage</th><td>Included</td><td>Extra charge</td><td>Included</td><td>Not offered</td><td>Extra charge</td></tr>
        <tr><th scope="row">Insurance limit</th><td>€250,000</td><td>€100,000</td><td>€500,000</td><td>Unknown</td><td>€250,000</td></tr>
      </tbody>
    </table>
  </div>
</ef-comparison-grid>`
    },
    {
      id: "mobile-release-comparison",
      title: "Mobile release comparison",
      description: "Three releases compared on a phone. The table keeps its shape and the region scrolls horizontally; nothing collapses.",
      mobile: {
        height: 320,
        notes: [
          "The grid never recomposes. When the table is wider than the screen the region scrolls horizontally inside itself and the page does not overflow at 320px.",
          "`overscroll-behavior-inline: contain` keeps a sideways swipe inside the grid instead of scrolling the page or triggering back navigation.",
          "The region is focusable (`tabindex=\"0\"`), so keyboard and switch users can scroll it; it shows a 2px outline when focused.",
          "Put the attribute column first; it scrolls with the table, so short attribute names keep the context visible longer.",
          "Landscape orientation fits more columns and reduces scrolling; nothing else changes."
        ]
      },
      html: `<ef-comparison-grid class="ef-component-tag">
  <div class="ef-comparison-grid" role="region" aria-label="Release comparison" tabindex="0">
    <table>
      <caption>Release comparison</caption>
      <thead><tr><th scope="col">Check</th><th scope="col">2026.08</th><th scope="col">2026.09</th><th scope="col">2026.10 candidate</th></tr></thead>
      <tbody>
        <tr><th scope="row">Tests</th><td>Passed</td><td>Passed</td><td>2 failing</td></tr>
        <tr><th scope="row">Security review</th><td>Complete</td><td>Complete</td><td>Not started</td></tr>
      </tbody>
    </table>
  </div>
</ef-comparison-grid>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: ".ef-comparison-grid", values: "region", default: "—", description: "Makes the scroll container a named landmark." },
      { name: "aria-label", on: ".ef-comparison-grid", values: "string", default: "—", description: "Names the region, usually the same as the table caption." },
      { name: "tabindex", on: ".ef-comparison-grid", values: "0", default: "—", description: "Lets keyboard users focus and scroll the region." },
      { name: "scope", on: "th", values: "col | row", default: "—", description: "`col` on item headers, `row` on attribute headers, so each cell is announced with both." }
    ],
    hooks: {
      "ef-comparison-grid": "The bounded scroll region around the native table: horizontal overflow, inline overscroll containment and a focus outline. The inner `table` is sized to `max-content` and its cells are padded, start-aligned and top-aligned."
    },
    keyboard: [
      { keys: "Tab", action: "Focuses the region." },
      { keys: "Arrow keys", action: "Scroll the focused region natively. There is no cell navigation." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Fits", how: "table width ≤ region width", description: "The table fills the region at full width." },
    { name: "Overflowing", how: "table wider than the region", description: "The region scrolls horizontally; the page does not." },
    { name: "Focused", how: ":focus-visible on the region", description: "2px outline in the current text color, offset by 2px." },
    { name: "Not included / Unknown cell", how: "application text", description: "Stated in words; no special styling." }
  ],
  accessibility: {
    forma: [
      "Keeps a native table so row and column headers are announced with each cell.",
      "Never hides or reorders columns, so the comparison is identical for every user and width.",
      "Shows a visible focus indicator on the scroll region."
    ],
    consumer: [
      "Provide a `caption`, `scope` on every header, and a matching `aria-label` on the region.",
      "Write every cell; use Not included, None or Unknown rather than blanks, dashes or check-mark icons without text.",
      "Do not mark a recommended or winning column by color alone; say so in the header text."
    ]
  },
  responsive: [
    "No breakpoints; the table keeps its content width and the region scrolls horizontally when needed.",
    "Long cell text can make columns very wide because the table is `max-content`; keep cell text short or insert natural break points.",
    "For two items on phones, [[comparison-pairs]] avoids scrolling entirely."
  ],
  motion: [
    "No animation: the grid is static. Scrolling is native and follows user settings."
  ],
  guidance: {
    do: [
      "Put items in columns and attributes in rows, with the attribute column first.",
      "Keep units in the attribute header or every value."
    ],
    avoid: [
      "Icons-only cells (check marks and crosses) without text.",
      "Very long prose in cells, which widens the whole column."
    ]
  },
  related: [
    { slug: "comparison-pairs", note: "Two-item comparison that stacks on phones instead of scrolling." },
    { slug: "dense-ledger", note: "Many rows of expert data rather than a few items across attributes." },
    { slug: "bounded-overflow", note: "Generic bounded scroll region for other wide content." },
    { slug: "data-grid", note: "Records with row actions that recompose on phones." }
  ]
};
