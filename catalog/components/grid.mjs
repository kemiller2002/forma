export default {
  name: "Grid",
  category: "layout",
  behavior: "Native CSS",
  summary: "Foundation auto-fit grid that fills columns by a minimum track width and collapses to one column without media queries.",
  purpose: {
    description: "The foundation grid lays out peer items in as many equal columns as fit, given a minimum track width. When the container narrows, columns drop one at a time until a single column remains; no media query is involved, so the grid reflows by the space it actually has, whether it sits in a full page, a sidebar or a dialog. It is the default choice for collections of comparable things: environments, plans, summary panels, option cards.",
    useWhen: [
      "A collection of peer items should align into columns and reflow by available width.",
      "The number of items varies with data and the column count should follow from the space, not be fixed.",
      "A dashboard region needs equal-weight panels that stay readable at any container width."
    ],
    avoidWhen: [
      "One item needs to span columns for emphasis: use [[responsive-grid]], which adds span helpers and narrow-screen collapse rules.",
      "An editorial layout needs deliberately uneven spans on a fixed four-column rhythm: use [[mosaic]].",
      "Items are metrics in an operational dashboard with its own conventions: use [[dashboard-grid]].",
      "Data has rows and columns that must be compared cell by cell: use a table in [[bounded-overflow]] or [[data-grid]]."
    ],
    characteristics: [
      "Columns come from `repeat(auto-fit, minmax(min(100%, var(--ef-grid-min)), 1fr))`, so a track is never wider than the container.",
      "Items fill rows in source order; the grid never reorders them.",
      "The grid draws nothing; pair it with [[surface]] items when each cell needs a boundary."
    ]
  },
  examples: [
    {
      id: "plan-comparison",
      title: "Plan comparison",
      description: "Three plan panels with a wider minimum track (`--ef-grid-min: 18rem`) so each panel keeps a readable measure. The panels sit in three columns on a wide screen and drop to fewer columns as the container narrows.",
      html: `<ef-grid class="ef-component-tag">
  <ul class="ef-grid" role="list" aria-label="Plans" style="--ef-grid-min: 18rem">
    <li class="ef-surface ef-stack" data-density="compact">
      <h2>Starter</h2>
      <p>Up to 5 people, community support, 10 GB storage.</p>
      <button type="button">Choose Starter</button>
    </li>
    <li class="ef-surface ef-stack" data-density="compact">
      <h2>Team</h2>
      <p>Up to 50 people, business-hours support, 1 TB storage and audit log export.</p>
      <button type="button">Choose Team</button>
    </li>
    <li class="ef-surface ef-stack" data-density="compact">
      <h2>Enterprise</h2>
      <p>Unlimited people, single sign-on, dedicated support and data residency options.</p>
      <button type="button">Talk to sales</button>
    </li>
  </ul>
</ef-grid>`
    },
    {
      id: "analytical-density",
      title: "Analytical monitoring tiles",
      description: "Six service tiles under `data-density=\"analytical\"` with a narrow minimum track. The tighter gap keeps more tiles in view for monitoring; each tile still states its status in text.",
      html: `<ef-grid class="ef-component-tag">
  <ul class="ef-grid" role="list" aria-label="Service health" data-density="analytical" style="--ef-grid-min: 11rem">
    <li class="ef-surface"><h2>API gateway</h2><p><span class="ef-status-lozenge" data-state="ok">Healthy</span></p></li>
    <li class="ef-surface"><h2>Auth</h2><p><span class="ef-status-lozenge" data-state="ok">Healthy</span></p></li>
    <li class="ef-surface"><h2>Billing</h2><p><span class="ef-status-lozenge" data-state="attention">Degraded</span></p></li>
    <li class="ef-surface"><h2>Search</h2><p><span class="ef-status-lozenge" data-state="ok">Healthy</span></p></li>
    <li class="ef-surface"><h2>Exports</h2><p><span class="ef-status-lozenge" data-state="unknown">No data</span></p></li>
    <li class="ef-surface"><h2>Webhooks</h2><p><span class="ef-status-lozenge" data-state="blocked">Paused</span></p></li>
  </ul>
</ef-grid>`
    },
    {
      id: "single-item",
      title: "Single result",
      description: "A grid holding one item. auto-fit collapses the empty tracks, so the lone item stretches across the row instead of sitting in a narrow first column.",
      html: `<ef-grid class="ef-component-tag">
  <ul class="ef-grid" role="list" aria-label="Matching environments">
    <li class="ef-surface"><h2>Production (eu-west)</h2><p>Only one environment matches the filter "eu".</p></li>
  </ul>
</ef-grid>`
    },
    {
      id: "mobile-environments",
      title: "Mobile environment list",
      description: "Four environment panels at phone width. Because the minimum track is larger than half the screen, the grid is a single column.",
      mobile: {
        height: 520,
        notes: [
          "With the default 16rem minimum, 320px and 390px screens fit only one track, so items stack in source order.",
          "`min(100%, var(--ef-grid-min))` keeps a track from ever exceeding the container, so there is no horizontal scroll even when the minimum is wider than the screen.",
          "In landscape on a phone two columns may fit; the change is driven by available width, not device type.",
          "Each item is full width, so links and buttons inside keep generous touch areas."
        ]
      },
      html: `<ef-grid class="ef-component-tag">
  <ul class="ef-grid" role="list" aria-label="Environments on this account">
    <li class="ef-surface"><h2>Production</h2><p>12 services, all reporting.</p></li>
    <li class="ef-surface"><h2>Staging</h2><p>12 services, 1 deploying.</p></li>
    <li class="ef-surface"><h2>Preview</h2><p>4 short-lived environments from open pull requests.</p></li>
    <li class="ef-surface"><h2>Development</h2><p>9 services, 3 idle.</p></li>
  </ul>
</ef-grid>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: "ul.ef-grid", values: "list", default: "—", description: "Restores list semantics that some browsers drop when list styling is removed. Keep it when the grid is a ul or ol." },
      { name: "aria-label", on: ".ef-grid", values: "string", default: "—", description: "Names the collection so screen-reader users know what the list contains." },
      { name: "data-density", on: ".ef-grid", values: "relaxed | standard | compact | analytical", default: "absent (1rem gap)", description: "Contextual density posture. Sets the gap to 1.5rem, 1rem, or 0.5rem (compact and analytical). Not a data-ef-* hook; it changes spacing only." },
      { name: "style", on: ".ef-grid", values: "--ef-grid-min / --ef-grid-gap", default: "—", description: "Per-instance override of the minimum track width or the gap." }
    ],
    hooks: {
      "ef-grid": "Auto-fit grid of equal columns sized by a minimum track width.",
      "data-density": "Density posture on the grid. relaxed = 1.5rem, standard = 1rem, compact and analytical = 0.5rem gap. Overrides `--ef-grid-gap`.",
      "--ef-grid-min": "Minimum track width before a column is dropped. Default 16rem. Clamped to 100% of the container.",
      "--ef-grid-gap": "Gap between rows and columns. Default `--ef-primitive-spacing-4` (1rem)."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through focusable content row by row in source order. The grid is not an ARIA grid and has no arrow-key navigation." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Multi-column", how: "container wider than two minimum tracks", description: "Items fill as many equal columns as fit." },
    { name: "Single column", how: "container narrower than two minimum tracks", description: "Items stack at full width in source order." },
    { name: "Density posture", how: "data-density attribute", description: "Gap follows the posture instead of `--ef-grid-gap`." }
  ],
  accessibility: {
    forma: [
      "Placement follows source order, so reading and focus order match the visual rows.",
      "Tracks never exceed the container, so the grid itself does not cause horizontal scrolling at 320px or 400% zoom.",
      "Adds no role; `.ef-grid` on a list keeps list semantics when role=\"list\" is present."
    ],
    consumer: [
      "Use a list (ul or ol with role=\"list\") when the items are a collection, and name it with aria-label.",
      "Give each item a heading or other text so identity does not depend on its column position.",
      "Do not use role=\"grid\" for this layout; it is not an interactive data grid."
    ]
  },
  responsive: [
    "Container-driven: the column count is computed from the grid's own inline size, so the same grid reflows correctly inside a narrow sidebar on a wide screen.",
    "No media queries. At phone widths the default 16rem minimum yields one column.",
    "auto-fit collapses empty tracks, so a short collection stretches its items to fill the row.",
    "Items inherit `min-inline-size` from their own styles; [[surface]] sets `min-inline-size: 0`, so long words wrap instead of widening the track."
  ],
  motion: [
    "No animation: columns reflow instantly when the width changes."
  ],
  guidance: {
    do: [
      "Set `--ef-grid-min` from the content: the narrowest width at which one item is still readable.",
      "Use `data-density` rather than a custom gap when the whole region's posture changes."
    ],
    avoid: [
      "Encoding priority or rank through column position; screen readers hear only source order.",
      "Setting a fixed column count; let the minimum track decide."
    ]
  },
  related: [
    { slug: "responsive-grid", note: "Same auto-fit model plus span helpers and explicit narrow-screen collapse." },
    { slug: "mosaic", note: "Fixed four-column editorial rhythm with deliberate spans." },
    { slug: "dashboard-grid", note: "Operational dashboard summaries with their own layout conventions." },
    { slug: "card-grid", note: "Marketing card collections inside the site shell." },
    { slug: "character-grid", note: "Terminal-style character cell layout; unrelated despite the shared `--ef-grid-` prefix." }
  ]
};
