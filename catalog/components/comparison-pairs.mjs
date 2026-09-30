export default {
  name: "Comparison pairs",
  category: "data",
  behavior: "Application content",
  summary: "Before/after or peer comparison that repeats labels and preserves the comparison task when columns collapse on narrow screens.",
  purpose: {
    description: "Comparison pairs show, for each attribute, two values next to each other: the attribute label, then a first and a second value. Each value prints its own small label from `data-label` (Before/After, Current/Proposed, or two peer names), so the comparison survives when the three columns collapse into one on a phone. Forma provides the layout and the repeated labels; the application decides which attributes are shown and what the values mean.",
    useWhen: [
      "A few attributes change between a current and a proposed state and the user must confirm the change.",
      "Two peers (plans, regions, candidates) are compared attribute by attribute.",
      "The comparison must stay intact on narrow screens where a table would either scroll or lose its column headers."
    ],
    avoidWhen: [
      "Whole versions of a record are compared with every field listed on each side: use [[diff-viewer]].",
      "More than two items are compared: use [[comparison-grid]].",
      "Only one value per label is shown: use [[key-value-list]].",
      "The user must choose between conflicting versions: use [[conflict-review]]."
    ],
    characteristics: [
      "Each `.ef-comparison-pairs__item` is a three-column grid: `minmax(8rem, 0.8fr)` for the label and two equal value columns.",
      "Each value shows its `data-label` as a small block caption above it at every width, so values are never unlabeled.",
      "`data-side=\"before\"` and `data-side=\"after\"` are what enable the caption; both sides are styled identically, so neither looks preferred.",
      "At 30rem and below each item becomes a single column: label, first value, second value."
    ]
  },
  examples: [
    {
      id: "access-change",
      title: "Access change awaiting approval",
      description: "Current and proposed permissions for a service account. The captions say Current and Proposed; an unchanged attribute is still listed so the reviewer sees the full scope of the account.",
      html: `<ef-comparison-pairs class="ef-component-tag">
  <section class="ef-comparison-pairs" aria-labelledby="comparison-pairs-access-change-title">
    <h3 id="comparison-pairs-access-change-title">svc-export: requested access change</h3>
    <div class="ef-comparison-pairs__item">
      <div class="ef-comparison-pairs__label">Customer data</div>
      <div class="ef-comparison-pairs__value" data-side="before" data-label="Current">Read, EU West only</div>
      <div class="ef-comparison-pairs__value" data-side="after" data-label="Proposed">Read, all regions</div>
    </div>
    <div class="ef-comparison-pairs__item">
      <div class="ef-comparison-pairs__label">Exports</div>
      <div class="ef-comparison-pairs__value" data-side="before" data-label="Current">Up to 10,000 rows</div>
      <div class="ef-comparison-pairs__value" data-side="after" data-label="Proposed">Unlimited</div>
    </div>
    <div class="ef-comparison-pairs__item">
      <div class="ef-comparison-pairs__label">Expiry</div>
      <div class="ef-comparison-pairs__value" data-side="before" data-label="Current"><time datetime="2027-01-31">31 Jan 2027</time></div>
      <div class="ef-comparison-pairs__value" data-side="after" data-label="Proposed">Unchanged</div>
    </div>
  </section>
</ef-comparison-pairs>`
    },
    {
      id: "peer-regions",
      title: "Two regions compared, with an unknown value",
      description: "A peer comparison of two data regions. The captions are the region names, and a value the application cannot supply is written as Unknown rather than left blank. `data-side` here only selects the first and second position.",
      html: `<ef-comparison-pairs class="ef-component-tag">
  <section class="ef-comparison-pairs" aria-labelledby="comparison-pairs-peer-regions-title">
    <h3 id="comparison-pairs-peer-regions-title">EU West compared with US East</h3>
    <div class="ef-comparison-pairs__item">
      <div class="ef-comparison-pairs__label">Median latency</div>
      <div class="ef-comparison-pairs__value" data-side="before" data-label="EU West">38 ms</div>
      <div class="ef-comparison-pairs__value" data-side="after" data-label="US East">41 ms</div>
    </div>
    <div class="ef-comparison-pairs__item">
      <div class="ef-comparison-pairs__label">Last failover test</div>
      <div class="ef-comparison-pairs__value" data-side="before" data-label="EU West"><time datetime="2026-09-12">12 Sep 2026</time></div>
      <div class="ef-comparison-pairs__value" data-side="after" data-label="US East">Unknown: no test recorded</div>
    </div>
  </section>
</ef-comparison-pairs>`
    },
    {
      id: "mobile-plan-change",
      title: "Mobile plan change",
      description: "A subscription change at phone width. Each attribute becomes a small stack: the attribute name, then the Before value with its caption, then the After value with its caption.",
      mobile: {
        height: 420,
        notes: [
          "At 30rem (480px) and below each item switches to a single column: label, first value, second value, in DOM order.",
          "The `data-label` captions are what keep the pairs understandable once the columns are gone; they appear at every width.",
          "Values wrap anywhere (`overflow-wrap: anywhere`), so long identifiers or addresses do not overflow at 320px.",
          "The component has no interactive parts; put confirm or cancel actions after it at full width."
        ]
      },
      html: `<ef-comparison-pairs class="ef-component-tag">
  <section class="ef-comparison-pairs" aria-labelledby="comparison-pairs-mobile-plan-change-title">
    <h3 id="comparison-pairs-mobile-plan-change-title">Review plan change</h3>
    <div class="ef-comparison-pairs__item">
      <div class="ef-comparison-pairs__label">Plan</div>
      <div class="ef-comparison-pairs__value" data-side="before" data-label="Before">Team</div>
      <div class="ef-comparison-pairs__value" data-side="after" data-label="After">Business</div>
    </div>
    <div class="ef-comparison-pairs__item">
      <div class="ef-comparison-pairs__label">Monthly price</div>
      <div class="ef-comparison-pairs__value" data-side="before" data-label="Before">$480.00</div>
      <div class="ef-comparison-pairs__value" data-side="after" data-label="After">$1,150.00</div>
    </div>
  </section>
</ef-comparison-pairs>`
    }
  ],
  api: {
    attributes: [
      { name: "data-side", on: ".ef-comparison-pairs__value", values: "before | after", default: "—", description: "Position of the value in the pair. Required for the caption to render; both values look the same." },
      { name: "data-label", on: ".ef-comparison-pairs__value", values: "string", default: "—", description: "Caption printed above the value (Before, After, Current, Proposed or a peer name). Keep it identical for every value in the same position." },
      { name: "aria-labelledby", on: "section.ef-comparison-pairs", values: "id of the heading", default: "—", description: "Names the comparison." },
      { name: "datetime", on: "time", values: "ISO date", default: "—", description: "Machine-readable form of date values." }
    ],
    hooks: {
      "ef-comparison-pairs": "Root grid of comparison items with 1rem gaps.",
      "ef-comparison-pairs__item": "One attribute row: label plus two value columns; single column at 30rem and below.",
      "ef-comparison-pairs__label": "Attribute name in bold.",
      "ef-comparison-pairs__value": "One value. Shrinkable, wraps anywhere, and prints its `data-label` caption above itself.",
      "data-side": "`before` or `after` on a value enables the `data-label` caption via `::before`."
    },
    keyboard: [
      { keys: "None", action: "Static content; links inside values are reached with Tab as usual." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Three columns", how: "viewport > 30rem", description: "Label beside the two values." },
    { name: "Stacked", how: "viewport ≤ 30rem", description: "Label, first value, second value in one column, each value with its caption." },
    { name: "Unchanged or unknown", how: "application text in the value", description: "Written as words (Unchanged, Unknown); no special styling." }
  ],
  accessibility: {
    forma: [
      "Repeats the side caption with every value, so the comparison is understandable without column headers.",
      "Styles both sides identically, so neither the old nor the new value is visually favored.",
      "Keeps DOM order label, first value, second value at every width."
    ],
    consumer: [
      "The captions come from CSS generated content, which some assistive technologies do not announce reliably. Where the side matters, also include it in the text or use a heading that states the order (for example \"Current, then proposed\").",
      "Give the section a heading that says what is being compared.",
      "Write unchanged, removed and unknown values explicitly.",
      "Do not signal better or worse through color; state it in text if it matters."
    ]
  },
  responsive: [
    "Three columns above 30rem; one column at 30rem and below.",
    "Values have `min-inline-size: 0` and `overflow-wrap: anywhere`, so they never force horizontal scrolling.",
    "The label column has an 8rem minimum on wide layouts; long attribute names wrap within it."
  ],
  motion: [
    "No animation: the component is static and switches layout instantly at 30rem."
  ],
  guidance: {
    do: [
      "Keep captions short and consistent down the list.",
      "List only the attributes the decision depends on, plus any unchanged ones needed for scope."
    ],
    avoid: [
      "Omitting `data-side`; without it the caption does not render.",
      "Using comparison pairs for more than two items.",
      "Highlighting the proposed value as if it were already approved."
    ]
  },
  related: [
    { slug: "diff-viewer", note: "Full before and after versions side by side, with changed rows marked." },
    { slug: "comparison-grid", note: "Compares more than two items in a bounded table." },
    { slug: "conflict-review", note: "Conflicting versions with recovery actions." },
    { slug: "verification-frame", note: "Recognize, verify, act composition where a change summary often appears." }
  ]
};
