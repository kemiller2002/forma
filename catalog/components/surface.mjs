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
      "Tone, border and padding by default; `data-forma-surface=\"raised\"` adds the raised role and elevation, `sunken` a well, `chrome` the app-bar surface. Each role and its text pairs are compiled per theme and brand.",
      "`min-inline-size: 0`, so a surface can shrink inside grid and flex tracks and its content wraps.",
      "In forced-colors mode the border becomes CanvasText, so the enclosure stays visible when backgrounds are removed."
    ]
  },
  examples: [
    {
      id: "application-roles",
      interaction: { kind: "static", reasons: ["placeholder-navigation"] },
      title: "Application chrome, raised panel and sunken well",
      description: "An app bar on the chrome surface, a raised account panel at elevation 2 and a sunken well holding a pending figure. Every colour comes from the active theme or brand, so a white-labelled product restyles all three.",
      html: `<forma-surface class="forma-component-tag">
  <div class="forma-stack">
    <header class="forma-surface" data-forma-surface="chrome">
      <p><strong>Northwind Accounts</strong> · <a href="#surface-application-roles-panel">Account overview</a></p>
    </header>
    <section class="forma-surface" data-forma-surface="raised" data-forma-elevation="2" id="surface-application-roles-panel" aria-labelledby="surface-application-roles-title">
      <h2 id="surface-application-roles-title">Available balance</h2>
      <p>Updated 24 Nov 2026, 06:15 UTC. Pending items are shown below.</p>
      <div class="forma-surface" data-forma-surface="sunken">
        <p>Pending: 1,250.00 from two transfers</p>
      </div>
    </section>
  </div>
</forma-surface>`
    },
    {
      id: "billing-summary",
      interaction: { kind: "static", reasons: ["application-behavior"] },
      title: "Billing summary panel",
      description: "A surface on a section groups a heading, key facts and an action. The section supplies the landmark semantics and the surface supplies the boundary.",
      html: `<forma-surface class="forma-component-tag">
  <section class="forma-surface forma-stack" aria-labelledby="surface-billing-summary-title">
    <h2 id="surface-billing-summary-title">Current plan</h2>
    <dl class="forma-key-value-list">
      <div><dt>Plan</dt><dd>Team, 25 seats</dd></div>
      <div><dt>Next invoice</dt><dd><time datetime="2026-10-01">1 October 2026</time>, $1,250.00</dd></div>
      <div><dt>Payment method</dt><dd>Visa ending 4242</dd></div>
    </dl>
    <div class="forma-cluster"><button type="button">Change plan</button></div>
  </section>
</forma-surface>`
    },
    {
      id: "compact-padding",
      title: "Compact panels in a dense list",
      description: "Surfaces as list items with reduced padding (`--forma-surface-space: 0.75rem`). The border keeps adjacent items distinct even with a tight gap.",
      html: `<forma-surface class="forma-component-tag">
  <ul class="forma-stack" data-density="compact" aria-label="Pending approvals">
    <li class="forma-surface" style="--forma-surface-space: 0.75rem"><strong>Expense report EX-4410</strong> · Travel to Lisbon · $840.20</li>
    <li class="forma-surface" style="--forma-surface-space: 0.75rem"><strong>Purchase order PO-1188</strong> · Laptop replacements · $6,300.00</li>
    <li class="forma-surface" style="--forma-surface-space: 0.75rem"><strong>Contract CN-207</strong> · Cleaning services renewal · $12,000.00</li>
  </ul>
</forma-surface>`
    },
    {
      id: "nested-content",
      interaction: { kind: "static", reasons: ["application-behavior"] },
      title: "Empty state inside a surface",
      description: "A surface holding an empty result message and the action that resolves it. The panel keeps the empty region visibly bounded so it is not mistaken for missing page content.",
      html: `<forma-surface class="forma-component-tag">
  <section class="forma-surface forma-stack" aria-labelledby="surface-nested-content-title">
    <h2 id="surface-nested-content-title">Scheduled reports</h2>
    <p>No reports are scheduled. Scheduled reports are emailed to you as PDF files.</p>
    <div class="forma-cluster"><button type="button">Schedule a report</button></div>
  </section>
</forma-surface>`
    },
    {
      id: "mobile-panel",
      interaction: { kind: "static", reasons: ["application-behavior"] },
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
      html: `<forma-surface class="forma-component-tag">
  <section class="forma-surface forma-stack" aria-labelledby="surface-mobile-panel-title">
    <h2 id="surface-mobile-panel-title">Webhook endpoint</h2>
    <p>https://hooks.example.com/services/T024BE7LD/B06Q8K3N1RX/9f8a7b6c5d4e3f2a1b0c</p>
    <div class="forma-cluster"><button type="button">Send test event</button></div>
  </section>
</forma-surface>`
    }
  ],
  api: {
    attributes: [
      { name: "data-forma-surface", on: ".forma-surface", values: "raised | sunken | chrome", default: "absent (secondary tone)", description: "Selects an application surface role compiled per theme and brand: raised (a panel above the canvas with elevation 1, keeping text.secondary), sunken (a well, with text.on-secondary-surface for secondary text) or chrome (app bar or navigation, every text role becomes text.on-chrome)." },
      { name: "data-forma-elevation", on: ".forma-surface[data-forma-surface=\"raised\"]", values: "2", default: "absent (elevation 1)", description: "Lifts a raised surface to elevation 2 for floating panels." },
      { name: "aria-labelledby", on: "section / article", values: "id of the panel heading", default: "—", description: "Names a surface that is a landmark or named region." },
      { name: "aria-label", on: "list", values: "string", default: "—", description: "Names a list of surfaces." },
      { name: "style", on: ".forma-surface", values: "--forma-surface-space: <length>", default: "—", description: "Per-instance padding override." },
      { name: "data-density", on: "surrounding .forma-stack", values: "compact", default: "—", description: "Used on the stack that spaces surfaces in the dense list example; it does not change surface padding." }
    ],
    hooks: {
      "forma-surface": "Panel with secondary surface background, on-secondary text color, subtle 1px border and padding. Headings and paragraphs inside inherit its color.",
      "data-forma-surface": "`raised`: `--forma-color-surface-raised` with `--forma-elevation-1`, primary text and the theme's own secondary text; `sunken`: `--forma-color-surface-sunken`; `chrome`: `--forma-color-surface-chrome` with every text role, links included, set to `--forma-color-text-on-chrome`. Forced colours resolve each role to Canvas and drop the shadows.",
      "data-forma-elevation": "`2` on a raised surface uses `--forma-elevation-2`.",
      "--forma-surface-space": "Padding on all sides. Default `--forma-primitive-spacing-5` (1.5rem).",
      "--forma-surface-accent-text-color": "Color of links and accent labels inside a secondary surface. Every rule that paints the secondary surface sets it to `--forma-color-text-primary` and rebinds secondary and muted text to `--forma-color-text-on-secondary-surface`, because accent and secondary text are not AA-validated on that surface. Outside one, they use their accent role."
    },
    keyboard: [],
    events: [],
    form: "Not a form control. A form can be a surface."
  },
  states: [
    { name: "Default", how: ".forma-surface", description: "Secondary tone, subtle border, 1.5rem padding." },
    { name: "Raised", how: "data-forma-surface=\"raised\" (optionally data-forma-elevation=\"2\")", description: "Raised role and elevation shadow; text.primary, text.heading and text.secondary are compiler-validated on it." },
    { name: "Sunken", how: "data-forma-surface=\"sunken\"", description: "Well below the canvas; secondary text uses text.on-secondary-surface." },
    { name: "Chrome", how: "data-forma-surface=\"chrome\"", description: "App-bar and navigation surface with text.on-chrome." },
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
    "Padding does not change with width; reduce `--forma-surface-space` for dense contexts."
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
