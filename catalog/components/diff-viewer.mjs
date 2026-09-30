export default {
  name: "Diff viewer",
  category: "data",
  behavior: "Application content",
  summary: "Before/after structured differences with explicit changed-field cues and stacked mobile comparison.",
  owns: ["ef-diff-viewer", "ef-diff-row"],
  purpose: {
    description: "A diff viewer shows two versions of a structured record side by side: a header stating what is compared and how many fields changed, then a Before and an After column, each a description list of field rows. Rows the application marks with `data-change=\"changed\"` get a thick inline-start bar. On narrow screens the two columns stack into explicit Before and After sections. Forma does not compute the difference; the application decides which fields differ, in what order they appear and how added or removed values are worded.",
    useWhen: [
      "Users review what changed between two versions of a record, configuration or document metadata before accepting, publishing or reverting.",
      "The fields are named and each has a short value, so side-by-side reading is meaningful.",
      "The comparison must remain understandable on a phone as two labelled sections."
    ],
    avoidWhen: [
      "Only the changed fields matter and each should show its before and after value together: use [[comparison-pairs]].",
      "Two concurrent edits conflict and the user must choose an outcome: use [[conflict-review]], which composes a diff with recovery actions.",
      "The change is to free text or source code line by line: show it in a [[code-sample]] or an application-specific text diff.",
      "Several options are compared across many attributes: use [[comparison-grid]]."
    ],
    characteristics: [
      "Two equal columns (`repeat(2, minmax(0, 1fr))`) separated by a subtle rule; one column at 40rem and below.",
      "Each field row is a label/value grid (`minmax(7rem, 0.4fr) minmax(0, 1fr)`), stacking label over value at 30rem and below.",
      "Changed rows get a 0.3rem accent bar on the inline start; in forced-colors mode it becomes a CanvasText bar, so the cue is structural as well as colored.",
      "Only `changed` is styled. Added and removed values are expressed in text by the application."
    ]
  },
  examples: [
    {
      id: "added-and-removed",
      title: "Added and removed fields",
      description: "A vendor record where one field was added, one removed and one changed. The row cue marks each difference, and the values say Not set explicitly, so an added field is not mistaken for a blank one. A visually hidden word states the change for screen-reader users.",
      html: `<ef-diff-viewer class="ef-component-tag">
  <section class="ef-diff-viewer" aria-labelledby="diff-viewer-added-and-removed-title">
    <header class="ef-diff-viewer__header">
      <h3 id="diff-viewer-added-and-removed-title">Vendor record: revision 7 compared with revision 8</h3>
      <p>3 fields changed</p>
    </header>
    <div class="ef-diff-viewer__grid">
      <section class="ef-diff-viewer__side" aria-labelledby="diff-viewer-added-and-removed-before">
        <h4 id="diff-viewer-added-and-removed-before">Before (revision 7)</h4>
        <dl>
          <div class="ef-diff-row"><dt>Name</dt><dd>Coastal Grain Cooperative</dd></div>
          <div class="ef-diff-row" data-change="changed"><dt>Payment terms</dt><dd>Net 30 <span class="ef-visually-hidden">(changed)</span></dd></div>
          <div class="ef-diff-row" data-change="changed"><dt>Tax exemption</dt><dd>Not set <span class="ef-visually-hidden">(added in revision 8)</span></dd></div>
          <div class="ef-diff-row" data-change="changed"><dt>Fax</dt><dd>+32 3 555 0142 <span class="ef-visually-hidden">(removed in revision 8)</span></dd></div>
        </dl>
      </section>
      <section class="ef-diff-viewer__side" aria-labelledby="diff-viewer-added-and-removed-after">
        <h4 id="diff-viewer-added-and-removed-after">After (revision 8)</h4>
        <dl>
          <div class="ef-diff-row"><dt>Name</dt><dd>Coastal Grain Cooperative</dd></div>
          <div class="ef-diff-row" data-change="changed"><dt>Payment terms</dt><dd>Net 45 <span class="ef-visually-hidden">(changed)</span></dd></div>
          <div class="ef-diff-row" data-change="changed"><dt>Tax exemption</dt><dd>Certificate EX-2291 <span class="ef-visually-hidden">(added)</span></dd></div>
          <div class="ef-diff-row" data-change="changed"><dt>Fax</dt><dd>Not set <span class="ef-visually-hidden">(removed)</span></dd></div>
        </dl>
      </section>
    </div>
  </section>
</ef-diff-viewer>`
    },
    {
      id: "long-values",
      title: "Long values",
      description: "A policy description rewritten between versions. Long values wrap inside the value column on both sides; rows on the two sides do not share heights, so keep the same field order on each side to aid comparison.",
      html: `<ef-diff-viewer class="ef-component-tag">
  <section class="ef-diff-viewer" aria-labelledby="diff-viewer-long-values-title">
    <header class="ef-diff-viewer__header">
      <h3 id="diff-viewer-long-values-title">Retention policy</h3>
      <p>1 field changed</p>
    </header>
    <div class="ef-diff-viewer__grid">
      <section class="ef-diff-viewer__side" aria-label="Published version">
        <h4>Published</h4>
        <dl>
          <div class="ef-diff-row" data-change="changed"><dt>Description</dt><dd>Evidence is kept for 30 days and then deleted automatically unless an administrator places it on hold. <span class="ef-visually-hidden">(changed)</span></dd></div>
          <div class="ef-diff-row"><dt>Applies to</dt><dd>All workspaces</dd></div>
        </dl>
      </section>
      <section class="ef-diff-viewer__side" aria-label="Draft version">
        <h4>Draft</h4>
        <dl>
          <div class="ef-diff-row" data-change="changed"><dt>Description</dt><dd>Evidence is kept indefinitely. Exports run automatically after an approver signs off, and deletions require a second approver. <span class="ef-visually-hidden">(changed)</span></dd></div>
          <div class="ef-diff-row"><dt>Applies to</dt><dd>All workspaces</dd></div>
        </dl>
      </section>
    </div>
  </section>
</ef-diff-viewer>`
    },
    {
      id: "mobile-stacked-diff",
      title: "Mobile stacked comparison",
      description: "At phone width the Before section is followed by the After section, each with its own heading, and each row stacks its label above its value.",
      mobile: {
        height: 520,
        notes: [
          "At 40rem (640px) and below the grid becomes one column; the second side gets a top rule instead of a side rule.",
          "At 30rem (480px) and below each `.ef-diff-row` stacks its label above its value.",
          "Because the sides stack, the Before and After headings are what keep the comparison understandable; never omit them.",
          "The changed-row bar remains on the inline start in both layouts.",
          "Nothing scrolls horizontally at 320px; long values wrap."
        ]
      },
      html: `<ef-diff-viewer class="ef-component-tag">
  <section class="ef-diff-viewer" aria-labelledby="diff-viewer-mobile-stacked-diff-title">
    <header class="ef-diff-viewer__header">
      <h3 id="diff-viewer-mobile-stacked-diff-title">Shipping address</h3>
      <p>1 field changed</p>
    </header>
    <div class="ef-diff-viewer__grid">
      <section class="ef-diff-viewer__side" aria-label="Previous address">
        <h4>Before</h4>
        <dl>
          <div class="ef-diff-row" data-change="changed"><dt>Street</dt><dd>14 Harbour Road <span class="ef-visually-hidden">(changed)</span></dd></div>
          <div class="ef-diff-row"><dt>City</dt><dd>Antwerp</dd></div>
        </dl>
      </section>
      <section class="ef-diff-viewer__side" aria-label="Current address">
        <h4>After</h4>
        <dl>
          <div class="ef-diff-row" data-change="changed"><dt>Street</dt><dd>2 Kaaiplein, Unit 5 <span class="ef-visually-hidden">(changed)</span></dd></div>
          <div class="ef-diff-row"><dt>City</dt><dd>Antwerp</dd></div>
        </dl>
      </section>
    </div>
  </section>
</ef-diff-viewer>`
    }
  ],
  api: {
    attributes: [
      { name: "data-change", on: ".ef-diff-row", values: "changed", default: "absent (unchanged)", description: "Marks a field row as different between versions. Written by the application on the row on both sides." },
      { name: "aria-labelledby", on: ".ef-diff-viewer", values: "id of the header heading", default: "—", description: "Names the comparison." },
      { name: "aria-label", on: ".ef-diff-viewer__side", values: "string", default: "—", description: "Names each side (Previous version, Current version) when the visible heading is short." }
    ],
    hooks: {
      "ef-diff-viewer": "Bordered root section containing the header and the two sides.",
      "ef-diff-viewer__header": "Padded header with the comparison title and a change count; ruled below.",
      "ef-diff-viewer__grid": "Two equal columns; one column at 40rem and below.",
      "ef-diff-viewer__side": "One version. Padded; the second side is separated by a rule (inline on wide screens, block on narrow).",
      "ef-diff-row": "A field row inside a side's `dl`: label/value grid with a subtle bottom rule; stacks at 30rem and below.",
      "data-change": "`changed` on `.ef-diff-row` adds a 0.3rem accent bar on the inline start and matching inline padding."
    },
    keyboard: [
      { keys: "Tab", action: "Reaches links or controls inside values. The viewer itself has no keyboard behavior; navigation between changes is application behavior." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Unchanged row", how: ".ef-diff-row without data-change", description: "Label and value with a subtle bottom rule." },
    { name: "Changed row", how: "data-change=\"changed\"", description: "Inline-start accent bar; CanvasText bar in forced colors." },
    { name: "Added or removed value", how: "application text such as Not set, plus data-change=\"changed\"", description: "No separate styling; the wording states which side lacks the value." },
    { name: "Stacked", how: "viewport ≤ 40rem", description: "Before and After sections stack; rows stack label over value at 30rem and below." }
  ],
  accessibility: {
    forma: [
      "Uses sections with names and native description lists, so each side and each field is exposed with its label.",
      "The changed cue is a thick bar (shape and position), not only color, and survives forced-colors mode.",
      "Stacking preserves DOM order: all Before fields, then all After fields."
    ],
    consumer: [
      "Name both sides with visible headings that say which version is which.",
      "State the number of changed fields in the header.",
      "`data-change` is not announced: add text such as a visually hidden \"(changed)\" in changed values, or list the changes in the header.",
      "Write added and removed values as text (Not set, Removed) rather than leaving a side empty.",
      "If users step between changes, implement that navigation in the application and move focus to a labelled target."
    ]
  },
  responsive: [
    "Side by side above 40rem; stacked at 40rem and below with a block rule between sides.",
    "Field rows are two-column above 30rem and stacked below it.",
    "Values wrap (`minmax(0, 1fr)`); rows on opposite sides do not align in height when values differ in length."
  ],
  motion: [
    "No animation: the viewer is static and changes layout instantly at its breakpoints."
  ],
  guidance: {
    do: [
      "Keep the same fields in the same order on both sides.",
      "Mark the row as changed on both sides so the cue lines up in the side-by-side layout."
    ],
    avoid: [
      "Relying on the accent bar alone to communicate a change.",
      "Showing only the changed fields on one side and all fields on the other.",
      "Using red and green values as the only added/removed signal."
    ]
  },
  related: [
    { slug: "comparison-pairs", note: "Each field shows its before and after value together in one row, which reads better when only a few fields changed." },
    { slug: "conflict-review", note: "Adds consequence text and recovery actions around a diff when versions conflict." },
    { slug: "timeline", note: "Records when a change happened; link to the diff for what changed." },
    { slug: "key-value-list", note: "Shows a single version's fields." }
  ]
};
