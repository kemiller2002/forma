export default {
  name: "Cluster",
  category: "layout",
  behavior: "Native CSS",
  summary: "Wraps related inline items while preserving semantic source order.",
  purpose: {
    description: "A cluster places related items in a row and lets them wrap onto further rows when the row runs out of space. It is the primitive for action rows, tag and status sets, metadata lines and filter chips: groups whose members are peers and whose count or label length is not known in advance. Items are vertically centered on each line and separated by one gap in both directions. Wrapping is intrinsic, so the same markup works in a toolbar, a card footer and a phone-width panel.",
    useWhen: [
      "A small set of related actions should sit in one row and wrap when labels are long or the container is narrow.",
      "Metadata, status lozenges or tags describe one object and should read as one line when they fit.",
      "The number of items varies with data and the layout must not depend on a fixed column count."
    ],
    avoidWhen: [
      "Items are a vertical sequence: use [[stack]].",
      "Items are peers that should align into columns: use [[grid]].",
      "Commands must be grouped by purpose with a visible group label: use [[command-group]].",
      "Too many actions compete for one row and some should collapse behind a disclosure: use [[overflow-command-disclosure]]."
    ],
    characteristics: [
      "Wrapping follows source order: the first item is always first, and wrapped items continue on the next line in the inline direction.",
      "One gap value applies both between items and between wrapped lines.",
      "Items keep their intrinsic width; the cluster never stretches or shrinks them to fill the row."
    ]
  },
  examples: [
    {
      id: "form-actions",
      title: "Form actions",
      description: "The primary and secondary actions of a form footer. When the translated labels no longer fit on one line, the secondary actions wrap below the primary one instead of overflowing.",
      html: `<ef-cluster class="ef-component-tag">
  <div class="ef-cluster" role="group" aria-label="Invoice actions">
    <button type="submit">Send invoice</button>
    <button type="button">Save as draft</button>
    <button type="button">Discard changes</button>
  </div>
</ef-cluster>`
    },
    {
      id: "record-metadata",
      title: "Record metadata line",
      description: "A cluster of status lozenges and plain metadata under a record title. Each lozenge carries its state in text, so the line survives grayscale and forced colors.",
      html: `<ef-cluster class="ef-component-tag">
  <article class="ef-stack" data-density="compact" aria-labelledby="cluster-record-metadata-title">
    <h2 id="cluster-record-metadata-title">INV-2291 · Northwind Logistics</h2>
    <p class="ef-cluster">
      <span class="ef-status-lozenge" data-state="attention">Overdue 12 days</span>
      <span class="ef-status-lozenge" data-state="ok">Contact confirmed</span>
      <span>Owner: Finance operations</span>
      <span>Updated <time datetime="2026-09-28">28 Sep 2026</time></span>
    </p>
  </article>
</ef-cluster>`
    },
    {
      id: "custom-gap",
      title: "Tight filter chips",
      description: "A filter summary with a narrower gap set through `--ef-cluster-space`. Links remain full-size targets; only the space between them changes.",
      html: `<ef-cluster class="ef-component-tag">
  <nav aria-label="Active filters">
    <p class="ef-cluster" style="--ef-cluster-space: 0.5rem">
      <a href="#status-open">Status: open</a>
      <a href="#owner-me">Owner: me</a>
      <a href="#region-emea">Region: Europe, Middle East and Africa</a>
      <a href="#clear-filters">Clear all filters</a>
    </p>
  </nav>
</ef-cluster>`
    },
    {
      id: "mobile-toolbar",
      title: "Mobile toolbar",
      description: "Four toolbar buttons at phone width. The row wraps into two lines rather than scrolling or shrinking the buttons.",
      mobile: {
        height: 220,
        notes: [
          "At 320px the buttons no longer fit on one row, so the last ones wrap onto a second line in source order.",
          "Buttons keep their intrinsic width and minimum target size; the cluster never compresses them.",
          "The same gap separates wrapped rows, so rows stay visibly distinct without borders.",
          "In landscape the row usually fits on one line again; no markup or order changes."
        ]
      },
      html: `<ef-cluster class="ef-component-tag">
  <div class="ef-cluster" role="toolbar" aria-label="Document tools">
    <button type="button">Comment</button>
    <button type="button">Suggest edit</button>
    <button type="button">Share</button>
    <button type="button">Download PDF</button>
  </div>
</ef-cluster>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: ".ef-cluster", values: "group | toolbar", default: "none", description: "Optional. Use group with aria-label to name a set of related controls. toolbar implies arrow-key navigation, which the application must implement; Forma does not." },
      { name: "aria-label", on: ".ef-cluster", values: "string", default: "—", description: "Names the group when a role is present." },
      { name: "style", on: ".ef-cluster", values: "--ef-cluster-space: <length>", default: "—", description: "Inline override of the cluster gap for one instance." },
      { name: "data-density", on: "surrounding .ef-stack", values: "relaxed | standard | compact | analytical", default: "—", description: "Appears on the surrounding stack in the metadata example. It does not change the cluster gap." }
    ],
    hooks: {
      "ef-cluster": "Wrapping flex row with centered cross-axis alignment and one gap for items and lines.",
      "--ef-cluster-space": "Gap between items and between wrapped lines. Default `--ef-primitive-spacing-3` (0.75rem). This is the effective gap.",
      "--ef-cluster-gap": "Foundation-layer gap variable. The component layer sets the gap from `--ef-cluster-space`, so setting this alone has no visible effect."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through focusable items in source order, which matches the wrapped visual order." },
      { keys: "Arrow keys", action: "No built-in behavior. If the cluster is marked role=\"toolbar\", the application must implement roving focus." }
    ],
    events: [],
    form: "Not a form control. Buttons inside a cluster submit or reset their form as usual."
  },
  states: [
    { name: "Single line", how: "items fit the inline size", description: "All items share one line, centered on the cross axis." },
    { name: "Wrapped", how: "items exceed the inline size", description: "Items continue on following lines in source order, separated by the same gap." }
  ],
  accessibility: {
    forma: [
      "Wrapping preserves DOM order, so reading and focus order follow the visual order at every width.",
      "Adds no role; item semantics are unchanged.",
      "Never shrinks items, so child controls keep their minimum target sizes."
    ],
    consumer: [
      "Name a cluster of controls with role=\"group\" and aria-label when the group's purpose is not obvious from context.",
      "Only use role=\"toolbar\" if the application implements arrow-key focus management.",
      "Put the most important action first in source order; do not rely on visual position to signal priority."
    ]
  },
  responsive: [
    "Intrinsic wrapping with `flex-wrap`; there are no breakpoints.",
    "Very long single items can still be wider than a phone; they wrap their own text because Forma sets `overflow-wrap: anywhere` on text elements.",
    "Wrapped lines use the same gap as items, so a wrapped cluster reads as one group, not two.",
    "Place a cluster inside a [[stack]] or [[surface]]; it takes the full inline size of its parent."
  ],
  motion: [
    "No animation: items reflow instantly when the container width changes or items are added."
  ],
  guidance: {
    do: [
      "Make the semantic container itself the cluster instead of adding a wrapper.",
      "Keep cluster items to a small, related set that reads as one unit."
    ],
    avoid: [
      "Encoding priority or severity in item order alone.",
      "Setting `--ef-cluster-gap` and expecting it to change spacing; use `--ef-cluster-space`."
    ]
  },
  related: [
    { slug: "stack", note: "Vertical rhythm between siblings." },
    { slug: "command-group", note: "Labelled groups of commands with shared spacing." },
    { slug: "status-lozenge", note: "Status labels that are often arranged in a cluster." },
    { slug: "switcher", note: "Two regions side by side that stack as whole blocks, not individual wrapping items." }
  ]
};
