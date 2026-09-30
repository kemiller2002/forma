export default {
  name: "Sidebar",
  category: "layout",
  behavior: "Native CSS",
  summary: "Composes a supporting region with primary content and deterministic source-order reflow.",
  purpose: {
    description: "A sidebar pairs a supporting region of a preferred width with a primary region that takes all remaining space. When the primary region would fall below a minimum share of the row, the two regions wrap and stack, in source order, without a breakpoint: the switch is driven by the space the sidebar itself has. A viewport fallback forces one column at phone widths. Use it for settings navigation beside a form, filters beside results, or an article beside its related links.",
    useWhen: [
      "A secondary region (local navigation, filters, table of contents, metadata) belongs beside the primary content on wide screens.",
      "The pair must reflow correctly inside panes of different widths, not only at viewport breakpoints.",
      "The supporting region should keep a comfortable width while the primary region absorbs extra space."
    ],
    avoidWhen: [
      "The supporting column needs a fixed track with a start or end placement and a fixed breakpoint: use [[rail]].",
      "Both regions are roughly equal peers: use [[switcher]].",
      "The whole application frame needs navigation, main and inspector regions: use [[workspace-shell]] or [[navigation-shell]].",
      "Users resize the two regions: use [[split-pane]] with application-owned resize behavior."
    ],
    characteristics: [
      "Source order decides which region comes first when stacked; Forma never reorders them.",
      "The sidebar stretches to the row height by default, so a background or rule runs the full height of the content.",
      "Only the two element classes are styled; the regions keep their own semantics (aside, nav, article)."
    ]
  },
  examples: [
    {
      id: "settings-navigation",
      title: "Settings with section navigation",
      description: "Account settings: a local navigation list in the sidebar and a form in the content region. On a wide screen they sit side by side; in a narrow pane the navigation wraps above the form.",
      html: `<ef-sidebar class="ef-component-tag">
  <div class="ef-sidebar">
    <nav class="ef-sidebar__side" aria-label="Settings sections">
      <ul class="ef-stack" data-density="compact">
        <li><a href="#sidebar-settings-navigation-profile" aria-current="page">Profile</a></li>
        <li><a href="#sidebar-settings-navigation-security">Security</a></li>
        <li><a href="#sidebar-settings-navigation-billing">Billing</a></li>
      </ul>
    </nav>
    <section class="ef-sidebar__content ef-stack" aria-labelledby="sidebar-settings-navigation-profile">
      <h2 id="sidebar-settings-navigation-profile">Profile</h2>
      <div class="ef-field">
        <label class="ef-field__label" for="sidebar-settings-navigation-name">Display name</label>
        <input id="sidebar-settings-navigation-name" name="display-name" type="text" autocomplete="name">
      </div>
      <div class="ef-field">
        <label class="ef-field__label" for="sidebar-settings-navigation-email">Email</label>
        <input id="sidebar-settings-navigation-email" name="email" type="email" autocomplete="email">
      </div>
      <div class="ef-cluster"><button type="submit">Save profile</button></div>
    </section>
  </div>
</ef-sidebar>`
    },
    {
      id: "article-end-sidebar",
      title: "Article with related links after it",
      description: "The article comes first in the source and the related links second, so the sidebar sits at the inline end on wide screens and below the article when stacked. The sidebar width is narrowed with `--ef-sidebar-width`.",
      html: `<ef-sidebar class="ef-component-tag">
  <div class="ef-sidebar" style="--ef-sidebar-width: 14rem">
    <article class="ef-sidebar__content ef-stack" aria-labelledby="sidebar-article-end-sidebar-title">
      <h2 id="sidebar-article-end-sidebar-title">Rotating API keys without downtime</h2>
      <p>Issue the new key, deploy it alongside the old one, confirm traffic has moved, then revoke the old key. Each step can be rolled back independently.</p>
      <p>Keys issued before March 2026 cannot be rotated in place and must be replaced.</p>
    </article>
    <aside class="ef-sidebar__side ef-stack" data-density="compact" aria-labelledby="sidebar-article-end-sidebar-related">
      <h3 id="sidebar-article-end-sidebar-related">Related</h3>
      <a href="#key-scopes">Key scopes and permissions</a>
      <a href="#audit-log">Reading the audit log</a>
    </aside>
  </div>
</ef-sidebar>`
    },
    {
      id: "mobile-filters",
      title: "Mobile filters above results",
      description: "A filter panel beside search results. At phone width the viewport fallback makes the sidebar a one-column grid, so filters stack above results in source order.",
      mobile: {
        height: 520,
        notes: [
          "At 30rem and below the sidebar switches to a one-column grid and both regions take the full width.",
          "Above that, stacking still happens intrinsically whenever the content region would drop below 60% of the row.",
          "Filters come first because they are first in the source; move them after the results in the markup if results should lead on phones.",
          "Nothing scrolls horizontally; long filter labels wrap inside the full-width region."
        ]
      },
      html: `<ef-sidebar class="ef-component-tag">
  <div class="ef-sidebar">
    <form class="ef-sidebar__side ef-stack" data-density="compact" aria-label="Filter orders">
      <div class="ef-field">
        <label class="ef-field__label" for="sidebar-mobile-filters-status">Status</label>
        <select id="sidebar-mobile-filters-status" name="status">
          <option>Any status</option>
          <option>Awaiting payment</option>
          <option>Shipped</option>
        </select>
      </div>
      <div class="ef-cluster"><button type="submit">Apply filters</button></div>
    </form>
    <section class="ef-sidebar__content ef-stack" aria-labelledby="sidebar-mobile-filters-results">
      <h2 id="sidebar-mobile-filters-results">24 orders</h2>
      <p>Showing orders from the last 30 days.</p>
    </section>
  </div>
</ef-sidebar>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: ".ef-sidebar__side / region", values: "string", default: "—", description: "Names a nav, aside or form in the sidebar so its landmark is distinguishable." },
      { name: "aria-labelledby", on: "regions", values: "id of the region heading", default: "—", description: "Names a region by its visible heading." },
      { name: "aria-current", on: "navigation link", values: "page", default: "—", description: "Marks the current section in sidebar navigation." },
      { name: "style", on: ".ef-sidebar", values: "--ef-sidebar-width / --ef-sidebar-content-min / --ef-sidebar-space", default: "—", description: "Per-instance override of the sidebar's preferred width, content minimum or gap." },
      { name: "data-density", on: "nested .ef-stack", values: "compact", default: "—", description: "Used on stacks inside the regions; it does not affect the sidebar itself." }
    ],
    hooks: {
      "ef-sidebar": "Wrapping flex container for the two regions.",
      "ef-sidebar__side": "Supporting region. Grows from `--ef-sidebar-width` but yields to the content region.",
      "ef-sidebar__content": "Primary region. Absorbs remaining space and wraps below or above the side when it would be narrower than `--ef-sidebar-content-min`.",
      "--ef-sidebar-width": "Preferred width of the side region. Default 18rem.",
      "--ef-sidebar-content-min": "Minimum share of the row the content region keeps before the pair stacks. Default 60%.",
      "--ef-sidebar-space": "Gap between the regions, in both directions. Default `--ef-primitive-spacing-5` (1.5rem)."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the side region and then the content region, or the reverse, following source order." }
    ],
    events: [],
    form: "Not a form control. A form may be either region."
  },
  states: [
    { name: "Side by side", how: "content region can keep at least --ef-sidebar-content-min", description: "Side region at its preferred width, content region fills the rest." },
    { name: "Stacked (intrinsic)", how: "content would fall below the minimum", description: "Regions wrap onto separate rows in source order; each takes the full row." },
    { name: "Stacked (viewport)", how: "viewport at or below 30rem", description: "One-column grid with both regions at full width." }
  ],
  accessibility: {
    forma: [
      "Never reorders regions, so reading, focus and visual order match at every width (verified by the composition browser tests).",
      "Adds no landmarks; regions keep the semantics of the elements the author chooses.",
      "Contained reflow means no horizontal page scrolling at 320px."
    ],
    consumer: [
      "Choose the source order deliberately: whichever region comes first is read first and shown first when stacked.",
      "Label navigation, aside and form regions so multiple landmarks can be told apart.",
      "Mark the current item in sidebar navigation with aria-current."
    ]
  },
  responsive: [
    "Container-driven: stacking happens when the sidebar's own inline size cannot hold the side width plus the content minimum.",
    "Viewport fallback at 30rem converts the layout to a one-column grid.",
    "Both regions can contain long content; the content region has a minimum of `min(100%, 60%)`, so it never overflows the row.",
    "Place wide tables in the content region inside [[bounded-overflow]]."
  ],
  motion: [
    "No animation: regions wrap instantly when space changes."
  ],
  guidance: {
    do: [
      "Keep the sidebar region short and supportive; the primary task belongs in the content region.",
      "Use the same sidebar composition in panes and full pages; it adapts to its own width."
    ],
    avoid: [
      "Using CSS order to put the sidebar after the content on phones; change the source order instead.",
      "Putting the only path to critical actions in the sidebar where it may be far from the content when stacked."
    ]
  },
  related: [
    { slug: "rail", note: "Grid-based supporting column with start/end placement and a 48rem breakpoint." },
    { slug: "switcher", note: "Two peer regions that switch from a row to a stack." },
    { slug: "split-pane", note: "Two fixed panes, optionally resizable by the application." },
    { slug: "workspace-shell", note: "Full application frame with navigation, primary and inspector regions." }
  ]
};
