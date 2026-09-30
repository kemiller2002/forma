export default {
  name: "Workspace shell",
  category: "workspaces",
  behavior: "Application content",
  summary: "Composes navigation, primary work, contextual inspection, and status as explicit regions.",
  purpose: {
    description: "A workspace shell is the outer frame of a working application screen. It places four explicit regions on a named CSS grid: a full-width landmark header (title and status), a navigation column, the primary work region, and an inspector for the current selection. Each region is a real landmark or sectioning element, so the structure is announced to assistive technology, not just drawn. Forma owns only the grid placement and the narrow-screen stacking; routing, selection, what the inspector shows and how status is updated belong to the application.",
    useWhen: [
      "A task screen needs persistent navigation, a dominant work area and a context panel at the same time, such as a ticket queue, a case file or an editor.",
      "The inspector content depends on what is selected in the primary region and should stay beside it on wide screens.",
      "The screen needs one visible, announced place for workspace status such as Saved, Syncing or Offline."
    ],
    avoidWhen: [
      "The screen only needs site navigation plus content: use [[navigation-shell]], which also provides a compact disclosure menu on phones.",
      "Two related regions without navigation are enough: use [[split-pane]] or, when the primary work should dominate, [[focus-stage]].",
      "The layout is a list of records with one selected record in detail: use [[master-detail]], which already styles the selectable list.",
      "The page is marketing or documentation content rather than an application workspace: use [[marketing-shell]] or [[documentation-layout]]."
    ],
    characteristics: [
      "Regions are placed with `grid-template-areas`, so each child names its area through its element class rather than relying on source position.",
      "At 48rem and below the grid becomes a single column in the order landmark, navigation, primary, inspector, which matches the canonical source order.",
      "The primary and inspector regions set `min-inline-size: 0`, so long content wraps or scrolls inside them instead of widening the page.",
      "No behavior is attached: links, aria-current and the status text are written by the application."
    ]
  },
  examples: [
    {
      id: "support-queue",
      title: "Support queue with a selected ticket",
      description: "A support workspace with section navigation, the queue as primary work and the selected ticket's properties in the inspector. The landmark carries a live status line the application updates after saves.",
      html: `<ef-workspace-shell class="ef-component-tag">
  <section class="ef-workspace-shell" aria-labelledby="workspace-shell-support-queue-title">
    <header class="ef-workspace-shell__landmark">
      <h2 id="workspace-shell-support-queue-title">Support desk</h2>
      <p role="status">All changes saved</p>
    </header>
    <nav class="ef-workspace-shell__navigation" aria-label="Support sections">
      <a href="#workspace-shell-support-queue-open" aria-current="page">Open tickets</a>
      <a href="#workspace-shell-support-queue-waiting">Waiting on customer</a>
      <a href="#workspace-shell-support-queue-closed">Closed</a>
    </nav>
    <section class="ef-workspace-shell__primary" id="workspace-shell-support-queue-open" aria-labelledby="workspace-shell-support-queue-open-title">
      <h3 id="workspace-shell-support-queue-open-title">Open tickets</h3>
      <ul>
        <li><a href="#workspace-shell-support-queue-inspector" aria-current="true">SUP-2291 · Invoice PDF missing line items</a></li>
        <li><a href="#workspace-shell-support-queue-inspector">SUP-2288 · SSO login loops back to sign-in</a></li>
        <li><a href="#workspace-shell-support-queue-inspector">SUP-2280 · Export stuck at 90%</a></li>
      </ul>
    </section>
    <aside class="ef-workspace-shell__inspector" id="workspace-shell-support-queue-inspector" aria-labelledby="workspace-shell-support-queue-inspector-title">
      <h3 id="workspace-shell-support-queue-inspector-title">SUP-2291</h3>
      <dl class="ef-key-value-list">
        <div><dt>Customer</dt><dd>Northwind Logistics</dd></div>
        <div><dt>Priority</dt><dd>High</dd></div>
        <div><dt>Assignee</dt><dd>Priya Raman</dd></div>
      </dl>
    </aside>
  </section>
</ef-workspace-shell>`
    },
    {
      id: "nothing-selected",
      title: "Nothing selected",
      description: "The inspector keeps its region and heading but explains that nothing is selected, instead of disappearing and shifting the layout. The status line reports an application-owned sync state as text.",
      html: `<ef-workspace-shell class="ef-component-tag">
  <section class="ef-workspace-shell" aria-labelledby="workspace-shell-nothing-selected-title">
    <header class="ef-workspace-shell__landmark">
      <h2 id="workspace-shell-nothing-selected-title">Contracts</h2>
      <p role="status">Syncing 3 changes…</p>
    </header>
    <nav class="ef-workspace-shell__navigation" aria-label="Contract views">
      <a href="#workspace-shell-nothing-selected-drafts" aria-current="page">Drafts</a>
      <a href="#workspace-shell-nothing-selected-review">In legal review</a>
      <a href="#workspace-shell-nothing-selected-signed">Signed</a>
    </nav>
    <section class="ef-workspace-shell__primary" id="workspace-shell-nothing-selected-drafts" aria-labelledby="workspace-shell-nothing-selected-drafts-title">
      <h3 id="workspace-shell-nothing-selected-drafts-title">Drafts</h3>
      <p>12 drafts. Choose one to see its parties, value and renewal terms.</p>
    </section>
    <aside class="ef-workspace-shell__inspector" aria-labelledby="workspace-shell-nothing-selected-inspector-title">
      <h3 id="workspace-shell-nothing-selected-inspector-title">Details</h3>
      <p>No contract selected.</p>
    </aside>
  </section>
</ef-workspace-shell>`
    },
    {
      id: "long-labels",
      title: "Long navigation labels and a narrow inspector",
      description: "Content stress: long localized navigation labels wrap inside the bounded navigation column, and a long unbroken reference wraps inside the inspector because both regions allow shrinking.",
      html: `<ef-workspace-shell class="ef-component-tag">
  <section class="ef-workspace-shell" aria-labelledby="workspace-shell-long-labels-title">
    <header class="ef-workspace-shell__landmark">
      <h2 id="workspace-shell-long-labels-title">Gestion des approvisionnements</h2>
      <p role="status">Hors ligne · les modifications seront envoyées à la reconnexion</p>
    </header>
    <nav class="ef-workspace-shell__navigation" aria-label="Sections des approvisionnements">
      <a href="#workspace-shell-long-labels-orders" aria-current="page">Commandes fournisseurs en attente de validation</a>
      <a href="#workspace-shell-long-labels-receipts">Réceptions partielles à rapprocher</a>
    </nav>
    <section class="ef-workspace-shell__primary" id="workspace-shell-long-labels-orders" aria-labelledby="workspace-shell-long-labels-orders-title">
      <h3 id="workspace-shell-long-labels-orders-title">Commandes en attente</h3>
      <p>4 commandes attendent une validation budgétaire.</p>
    </section>
    <aside class="ef-workspace-shell__inspector" aria-labelledby="workspace-shell-long-labels-inspector-title">
      <h3 id="workspace-shell-long-labels-inspector-title">Référence</h3>
      <p style="overflow-wrap: anywhere">PO-2026-EMEA-LOGISTICS-00041872-REV3</p>
    </aside>
  </section>
</ef-workspace-shell>`
    },
    {
      id: "mobile-stacked-regions",
      title: "Mobile stacked regions",
      description: "At phone width the four regions stack into one column in source order: status first, then navigation, then work, then the inspector.",
      mobile: {
        height: 620,
        notes: [
          "At 48rem and below the named grid collapses to one column; every region takes the full width and nothing scrolls horizontally at 320px.",
          "Stacking follows landmark, navigation, primary, inspector, the same order as the source, so reading, focus and visual order stay aligned.",
          "The navigation stays expanded as a vertical list. With many sections, compose [[navigation-shell]] or a [[disclosure]] inside the navigation region so work is not pushed far down the page.",
          "Plain links in the navigation column are not padded to 44px by the shell; give them a comfortable block size in application CSS or use buttons and links styled as full-width rows for touch."
        ]
      },
      html: `<ef-workspace-shell class="ef-component-tag">
  <section class="ef-workspace-shell" aria-labelledby="workspace-shell-mobile-title">
    <header class="ef-workspace-shell__landmark">
      <h2 id="workspace-shell-mobile-title">Field inspections</h2>
      <p role="status">2 reports waiting to upload</p>
    </header>
    <nav class="ef-workspace-shell__navigation" aria-label="Inspection views">
      <a href="#workspace-shell-mobile-today" aria-current="page">Today</a>
      <a href="#workspace-shell-mobile-upcoming">Upcoming</a>
    </nav>
    <section class="ef-workspace-shell__primary" id="workspace-shell-mobile-today" aria-labelledby="workspace-shell-mobile-today-title">
      <h3 id="workspace-shell-mobile-today-title">Today</h3>
      <p>Pump station 4 · 10:30</p>
    </section>
    <aside class="ef-workspace-shell__inspector" aria-labelledby="workspace-shell-mobile-inspector-title">
      <h3 id="workspace-shell-mobile-inspector-title">Site notes</h3>
      <p>Gate code changes on Fridays. Call the site lead on arrival.</p>
    </aside>
  </section>
</ef-workspace-shell>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "nav, aside", values: "string", default: "—", description: "Names the navigation and inspector landmarks so they are distinguishable from other navigation and complementary regions on the page." },
      { name: "aria-labelledby", on: "section, aside", values: "id of the region heading", default: "—", description: "Alternative to aria-label when the region already has a visible heading." },
      { name: "aria-current", on: "navigation link", values: "page", default: "absent", description: "Marks the current section. The application sets it when routing changes; the shell does not style it." },
      { name: "role", on: "status element in the landmark", values: "status", default: "—", description: "Makes the workspace status a polite live region so saves, syncs and offline changes are announced." },
      { name: "id", on: "primary region", values: "string", default: "—", description: "Target for navigation fragment links and skip links." }
    ],
    hooks: {
      "ef-workspace-shell": "Root grid. In an application this is usually the page's `main`; any sectioning element works when the shell is nested.",
      "ef-workspace-shell__landmark": "Full-width header row for the workspace title and status.",
      "ef-workspace-shell__navigation": "Navigation column; lays its children out as a vertical grid with a small gap.",
      "ef-workspace-shell__primary": "Primary work region. Shrinks below its content width so long content does not widen the page.",
      "ef-workspace-shell__inspector": "Context region for the current selection. Also shrinkable.",
      "--ef-workspace-nav": "Navigation column track. Default `minmax(10rem, 14rem)`.",
      "--ef-workspace-inspector": "Inspector column track. Default `minmax(14rem, 20rem)`.",
      "--ef-workspace-space": "Gap between regions. Default the 1rem spacing token."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through links and controls in source order: landmark, navigation, primary, inspector. The shell adds no keyboard behavior." },
      { keys: "Screen-reader landmark navigation", action: "Navigation and inspector are exposed as named landmarks, so users can jump between them directly." }
    ],
    events: [],
    form: "Not a form control. Forms inside any region participate normally."
  },
  states: [
    { name: "Wide", how: "viewport wider than 48rem", description: "Three columns under a full-width landmark row: navigation, primary, inspector." },
    { name: "Stacked", how: "@media (max-width: 48rem)", description: "One column in landmark, navigation, primary, inspector order." },
    { name: "Current section", how: "aria-current=\"page\" on a navigation link", description: "Application-owned. The shell does not add a visual treatment; use link styling or compose a navigation component if one is needed." },
    { name: "Status", how: "text in the role=\"status\" element", description: "Application-owned text such as Saved, Syncing or Offline. Never color-only." }
  ],
  accessibility: {
    forma: [
      "Defines a region layout that keeps the canonical source order at every width, so focus order and reading order match what is seen.",
      "Places navigation, primary and inspector in separate grid areas without reordering the DOM.",
      "Allows primary and inspector content to shrink, which avoids page-level horizontal scrolling at 320px and 400% zoom."
    ],
    consumer: [
      "Use real landmarks: `nav` for navigation and `aside` for the inspector, each with a unique accessible name.",
      "Use `main` for the shell only once per page; when the shell is nested inside another page, use a labelled `section` instead.",
      "Set aria-current on the current navigation link and update it on navigation.",
      "Keep the status line short, textual and meaningful; move focus only when the user asked for it, not when the inspector content changes.",
      "Provide a skip link to the primary region when navigation is long."
    ]
  },
  responsive: [
    "Wide layout: `var(--ef-workspace-nav) minmax(0, 1fr) var(--ef-workspace-inspector)` under a full-width landmark row; the primary column absorbs remaining space.",
    "At 48rem and below the shell becomes a single column stacked as landmark, navigation, primary, inspector.",
    "Primary and inspector set `min-inline-size: 0`; long unbroken strings still need `overflow-wrap` or a [[bounded-overflow]] region in the application's content.",
    "The inspector track is always reserved on wide screens. If a workspace has no inspector, set `--ef-workspace-inspector` to `0px` (the column gap remains) or use [[navigation-shell]] instead."
  ],
  motion: [
    "No animation: region placement changes at the breakpoint without transitions, and the shell adds no motion to navigation or selection changes."
  ],
  guidance: {
    do: [
      "Keep one status line in the landmark and write outcomes as text.",
      "Keep the inspector's heading and region present when nothing is selected, with a sentence explaining what to do."
    ],
    avoid: [
      "Moving critical actions only into the inspector; on phones it stacks last and may be far below the work.",
      "Reordering regions with CSS `order` or area changes that make visual order differ from focus order.",
      "Nesting a second `main` inside the shell."
    ]
  },
  related: [
    { slug: "navigation-shell", note: "Navigation plus content only, with a compact disclosure menu on phones." },
    { slug: "master-detail", note: "A selectable record list beside the selected record; can sit inside the shell's primary region." },
    { slug: "split-pane", note: "Two related regions without navigation or a landmark row." },
    { slug: "focus-stage", note: "One dominant work surface with a subordinate support column." },
    { slug: "landmark-region", note: "A sticky context region for navigation and status inside other layouts." }
  ]
};
