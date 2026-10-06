export default {
  name: "Surface",
  category: "layout",
  behavior: "Native CSS",
  summary: "A bounded panel with secondary surface tone, border and padding for grouping related content without inventing semantics.",
  purpose: {
    description: "A surface is a panel: secondary background, a subtle border and even padding around related content. It says \"these things belong together\" through enclosure while adding no role, heading or behavior; the element you put it on supplies the semantics (section, article, li, aside, form). Headings and paragraphs inside inherit the surface's text color so contrast stays correct on the secondary tone. Surfaces are the usual items of grids and the regions of sidebars and rails.",
    useWhen: [
      "Related content needs a visible boundary to separate it from neighbors, such as a panel in a dashboard or a card in a grid.",
      "Grouping must survive when proximity alone is ambiguous, for example in dense layouts.",
      "A region needs padding and tone without becoming a component with its own behavior."
    ],
    avoidWhen: [
      "The panel is a marketing card with a title link and footer: use the card in [[card-grid]].",
      "The content is a callout that must name its kind (note, warning, decision): use [[callout]].",
      "The panel announces a status or error: use [[alert]] or [[fault-banner]], which carry the right roles.",
      "The panel previews consequential content before an action: use [[preview-surface]]."
    ],
    characteristics: [
      "Tone, border and padding only; no radius, shadow or elevation.",
      "`min-inline-size: 0`, so a surface can shrink inside grid and flex tracks and its content wraps.",
      "In forced-colors mode the border becomes CanvasText, so the enclosure stays visible when backgrounds are removed."
    ]
  },
  examples: [
    {
      id: "billing-summary",
      title: "Billing summary panel",
      description: "A surface on a section groups a heading, key facts and an action. The section supplies the landmark semantics and the surface supplies the boundary.",
      html: `<ef-surface class="ef-component-tag">
  <section class="ef-surface ef-stack" aria-labelledby="surface-billing-summary-title">
    <h2 id="surface-billing-summary-title">Current plan</h2>
    <dl class="ef-key-value-list">
      <div><dt>Plan</dt><dd>Team, 25 seats</dd></div>
      <div><dt>Next invoice</dt><dd><time datetime="2026-10-01">1 October 2026</time>, $1,250.00</dd></div>
      <div><dt>Payment method</dt><dd>Visa ending 4242</dd></div>
    </dl>
    <div class="ef-cluster"><button type="button">Change plan</button></div>
  </section>
</ef-surface>`
    },
    {
      id: "compact-padding",
      title: "Compact panels in a dense list",
      description: "Surfaces as list items with reduced padding (`--ef-surface-space: 0.75rem`). The border keeps adjacent items distinct even with a tight gap.",
      html: `<ef-surface class="ef-component-tag">
  <ul class="ef-stack" data-density="compact" aria-label="Pending approvals">
    <li class="ef-surface" style="--ef-surface-space: 0.75rem"><strong>Expense report EX-4410</strong> · Travel to Lisbon · $840.20</li>
    <li class="ef-surface" style="--ef-surface-space: 0.75rem"><strong>Purchase order PO-1188</strong> · Laptop replacements · $6,300.00</li>
    <li class="ef-surface" style="--ef-surface-space: 0.75rem"><strong>Contract CN-207</strong> · Cleaning services renewal · $12,000.00</li>
  </ul>
</ef-surface>`
    },
    {
      id: "nested-content",
      title: "Empty state inside a surface",
      description: "A surface holding an empty result message and the action that resolves it. The panel keeps the empty region visibly bounded so it is not mistaken for missing page content.",
      html: `<ef-surface class="ef-component-tag">
  <section class="ef-surface ef-stack" aria-labelledby="surface-nested-content-title">
    <h2 id="surface-nested-content-title">Scheduled reports</h2>
    <p>No reports are scheduled. Scheduled reports are emailed to you as PDF files.</p>
    <div class="ef-cluster"><button type="button">Schedule a report</button></div>
  </section>
</ef-surface>`
    },
    {
      id: "mobile-panel",
      title: "Mobile panel",
      description: "A surface at phone width with a long unbroken reference value. The panel fills the column and the value wraps inside the padding.",
      mobile: {
        height: 320,
        notes: [
          "The surface is as wide as its parent; padding stays at 1.5rem on every side, leaving the rest for content.",
          "Long unbroken values wrap because Forma sets `overflow-wrap: anywhere` on text and the surface has `min-inline-size: 0`.",
          "Actions inside keep their own minimum target sizes; the surface never compresses them.",
          "Orientation changes only widen the panel."
        ]
      },
      html: `<ef-surface class="ef-component-tag">
  <section class="ef-surface ef-stack" aria-labelledby="surface-mobile-panel-title">
    <h2 id="surface-mobile-panel-title">Webhook endpoint</h2>
    <p>https://hooks.example.com/services/T024BE7LD/B06Q8K3N1RX/9f8a7b6c5d4e3f2a1b0c</p>
    <div class="ef-cluster"><button type="button">Send test event</button></div>
  </section>
</ef-surface>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section / article", values: "id of the panel heading", default: "—", description: "Names a surface that is a landmark or named region." },
      { name: "aria-label", on: "list", values: "string", default: "—", description: "Names a list of surfaces." },
      { name: "style", on: ".ef-surface", values: "--ef-surface-space: <length>", default: "—", description: "Per-instance padding override." },
      { name: "data-density", on: "surrounding .ef-stack", values: "compact", default: "—", description: "Used on the stack that spaces surfaces in the dense list example; it does not change surface padding." }
    ],
    hooks: {
      "ef-surface": "Panel with secondary surface background, on-secondary text color, subtle 1px border and padding. Headings and paragraphs inside inherit its color.",
      "--ef-surface-space": "Padding on all sides. Default `--ef-primitive-spacing-5` (1.5rem).",
      "--ef-surface-accent-text-color": "Color of links and accent labels inside a secondary surface. Every rule that paints the secondary surface sets it to `--ef-color-text-primary` and rebinds secondary and muted text to `--ef-color-text-on-secondary-surface`, because accent and secondary text are not AA-validated on that surface. Outside one, they use their accent role."
    },
    keyboard: [],
    events: [],
    form: "Not a form control. A form can be a surface."
  },
  states: [
    { name: "Default", how: ".ef-surface", description: "Secondary tone, subtle border, 1.5rem padding." },
    { name: "Forced colors", how: "@media (forced-colors: active)", description: "Border becomes CanvasText and the background resolves to Canvas, so the boundary stays visible." }
  ],
  accessibility: {
    forma: [
      "Sets text color for the secondary surface so headings and body text keep their contrast.",
      "Keeps the enclosure visible in forced-colors mode through a CanvasText border.",
      "Adds no role; semantics come from the element it is applied to."
    ],
    consumer: [
      "Apply the surface to a semantic element (section, article, li, aside) and label regions with headings.",
      "Do not use surface tone alone to convey status or selection.",
      "Check contrast of any colored content placed on the secondary tone. Default links use the accent color, which measures about 4.4:1 on the default secondary surface, below the 4.5:1 text minimum; prefer buttons or restyle link color through a theme until this is resolved."
    ]
  },
  responsive: [
    "Fluid: fills its parent's inline size; no breakpoints.",
    "`min-inline-size: 0` lets surfaces shrink inside grids and flex rows, so long content wraps instead of overflowing.",
    "Padding does not change with width; reduce `--ef-surface-space` for dense contexts."
  ],
  motion: [
    "No animation: the surface is static."
  ],
  guidance: {
    do: [
      "Use surfaces to separate peer panels in grids, rails and sidebars.",
      "Combine with [[stack]] to space the content inside."
    ],
    avoid: [
      "Nesting surfaces inside surfaces; the same tone and border stop reading as separate groups.",
      "Using a surface where a card, callout or alert already carries the meaning."
    ]
  },
  related: [
    { slug: "card-grid", note: "Marketing cards with title links and tone variants." },
    { slug: "callout", note: "Named asides such as notes, warnings and decisions." },
    { slug: "preview-surface", note: "Bounded review of consequential content before an action." },
    { slug: "stack", note: "Spaces the content inside a surface." }
  ]
};
