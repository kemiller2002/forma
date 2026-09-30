export default {
  name: "Documentation layout",
  category: "site",
  behavior: "Site content",
  summary: "Documentation page: navigation rail, prose article, and optional outline; navigation compacts to a wrapping list in narrow containers.",
  owns: ["ef-doc"],
  purpose: {
    description: "The documentation layout arranges a documentation page inside the marketing shell's main region: `.ef-doc__nav` (section navigation), `.ef-doc__content` (the article, normally with `.ef-prose`) and an optional `.ef-doc__aside` (an \"On this page\" outline). Three regions with different roles cannot share one minimum size, so the grid regroups by the width of `.ef-site__main` using container queries: one column, then navigation beside the article with the outline after the article, then all three side by side. Source order never changes. Routing, the current page and outline generation belong to the site.",
    useWhen: [
      "A documentation or guide page needs section navigation and a readable article.",
      "Long articles benefit from an outline of their headings.",
      "The page is part of a site built on [[marketing-shell]] with `data-ef-layout=\"documentation\"`."
    ],
    avoidWhen: [
      "An application needs a navigation rail and a work area: use [[sidebar]], [[rail]] or [[workspace-shell]].",
      "A marketing page with sections and cards: compose [[hero]] and [[section-heading]] instead.",
      "Navigation has many nested levels that need expand and collapse behavior: that requires [[disclosure]] or application code, which this layout does not provide."
    ],
    characteristics: [
      "Needs an `.ef-site__main` ancestor, because that element is the `ef-main` container the layout queries; without it the layout stays one column.",
      "Navigation and outline lists are ruled rails with 44px link rows; the current page is marked by `aria-current` with a strong rule and bold text.",
      "Inside `.ef-doc__content` the `h1` is reduced to the `h2` size so the article title does not dominate the page.",
      "On wide, tall viewports the navigation and outline stick below the header and scroll independently when longer than the viewport."
    ]
  },
  examples: [
    {
      id: "article-without-outline",
      title: "Article without an outline",
      description: "A short reference page with navigation and an article only. Without an aside, the article fills the remaining columns at every width. Examples use `h2` for the article title because the catalog page already has an `h1`.",
      html: `<ef-documentation-layout class="ef-component-tag">
  <div class="ef-site" data-ef-layout="documentation">
    <div class="ef-site__main">
      <div class="ef-doc">
        <nav class="ef-doc__nav" aria-label="Reference">
          <p class="ef-eyebrow ef-doc__heading">Reference</p>
          <ul><li><a href="#documentation-layout-article-without-outline-tokens">Tokens</a></li><li><a href="#documentation-layout-article-without-outline-tones" aria-current="page">Surface tones</a></li><li><a href="#documentation-layout-article-without-outline-tokens">Breakpoints</a></li></ul>
        </nav>
        <article class="ef-doc__content ef-prose" id="documentation-layout-article-without-outline-tones">
          <h2>Surface tones</h2>
          <p id="documentation-layout-article-without-outline-tokens">Set <code>data-ef-tone</code> to <code>surface</code>, <code>elevated</code> or <code>inverse</code> on a region. Text, links, labels and rules inside adapt automatically.</p>
        </article>
      </div>
    </div>
  </div>
</ef-documentation-layout>`
    },
    {
      id: "long-guide",
      title: "Long guide with outline",
      description: "A guide with several navigation groups and an outline of its headings. The outline follows the article in source order; it moves beside the article only when the main region is at least 72rem wide.",
      html: `<ef-documentation-layout class="ef-component-tag">
  <div class="ef-site" data-ef-layout="documentation">
    <div class="ef-site__main">
      <div class="ef-doc">
        <nav class="ef-doc__nav" aria-label="Guides">
          <p class="ef-eyebrow ef-doc__heading">Start</p>
          <ul><li><a href="#documentation-layout-long-guide-article">Install</a></li><li><a href="#documentation-layout-long-guide-article" aria-current="page">Upgrade</a></li></ul>
          <p class="ef-eyebrow ef-doc__heading">Operate</p>
          <ul><li><a href="#documentation-layout-long-guide-article">Local CSS policy</a></li><li><a href="#documentation-layout-long-guide-article">Deploy to GitHub Pages</a></li><li><a href="#documentation-layout-long-guide-article">Test before deployment</a></li></ul>
        </nav>
        <article class="ef-doc__content ef-prose" id="documentation-layout-long-guide-article">
          <h2>Upgrade Forma</h2>
          <p>Nothing upgrades automatically. Each upgrade is one reviewable change.</p>
          <h3 id="documentation-layout-long-guide-notes">Read the release notes</h3>
          <p>Read the notes for every version between yours and the target.</p>
          <h3 id="documentation-layout-long-guide-lock">Update the lock</h3>
          <p>Change the version in <code>forma.lock</code> and run the installer with <code>--update</code>.</p>
          <h3 id="documentation-layout-long-guide-verify">Verify</h3>
          <p>Run the site checks, then commit the lock with any markup changes.</p>
        </article>
        <nav class="ef-doc__aside" aria-label="On this page: Upgrade Forma">
          <p class="ef-eyebrow ef-doc__heading">On this page</p>
          <ul><li><a href="#documentation-layout-long-guide-notes">Read the release notes</a></li><li><a href="#documentation-layout-long-guide-lock">Update the lock</a></li><li><a href="#documentation-layout-long-guide-verify">Verify</a></li></ul>
        </nav>
      </div>
    </div>
  </div>
</ef-documentation-layout>`
    },
    {
      id: "mobile-compact-nav",
      title: "Phone compact navigation",
      description: "At phone width the navigation becomes a short wrapping row above the article, and the outline follows the article.",
      mobile: {
        height: 560,
        notes: [
          "Below a 48rem main-region width the layout is one column in source order: navigation, article, outline.",
          "Below a 48rem layout width the navigation list wraps like a cluster with a bottom rule, and the current page is marked by a bottom rule instead of a side rule, so the article is not pushed below the fold.",
          "Every navigation and outline link keeps a 44px minimum row height for touch.",
          "Rails are not sticky below 64rem viewport width or 36rem height, so nothing overlays the article on phones in either orientation."
        ]
      },
      html: `<ef-documentation-layout class="ef-component-tag">
  <div class="ef-site" data-ef-layout="documentation">
    <div class="ef-site__main">
      <div class="ef-doc">
        <nav class="ef-doc__nav" aria-label="Documentation sections">
          <p class="ef-eyebrow ef-doc__heading">Guides</p>
          <ul><li><a href="#documentation-layout-mobile-compact-nav-article" aria-current="page">Install</a></li><li><a href="#documentation-layout-mobile-compact-nav-article">Configure</a></li><li><a href="#documentation-layout-mobile-compact-nav-article">Upgrade</a></li><li><a href="#documentation-layout-mobile-compact-nav-article">Deploy</a></li></ul>
        </nav>
        <article class="ef-doc__content ef-prose" id="documentation-layout-mobile-compact-nav-article">
          <h2>Install</h2>
          <p>Create <code>forma.lock</code>, then install the pinned assets with the release installer.</p>
          <h3 id="documentation-layout-mobile-compact-nav-verify">Verify</h3>
          <p>The installer fails when any file differs from its recorded checksum.</p>
        </article>
        <nav class="ef-doc__aside" aria-label="On this page: Install">
          <p class="ef-eyebrow ef-doc__heading">On this page</p>
          <ul><li><a href="#documentation-layout-mobile-compact-nav-verify">Verify</a></li></ul>
        </nav>
      </div>
    </div>
  </div>
</ef-documentation-layout>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "nav.ef-doc__nav, nav.ef-doc__aside", values: "string", default: "—", description: "Names each navigation landmark distinctly, for example \"Documentation\" and \"On this page\"." },
      { name: "aria-current", on: "a in .ef-doc__nav", values: "page", default: "absent", description: "Marks the current page in the navigation with a strong rule and bold text." },
      { name: "data-ef-layout", on: ".ef-site", values: "documentation", default: "—", description: "Declares the page type on the shell; the layout itself does not depend on it." }
    ],
    hooks: {
      "ef-doc": "Grid root and `ef-doc` size container. One column by default; two columns (navigation 11 to 15rem, article) when `.ef-site__main` is at least 48rem; three (plus a 10 to 14rem outline) at 72rem.",
      "ef-doc__nav": "Section navigation. Its lists are ruled rails with 44px link rows; compacts to a wrapping row when the layout is narrower than 48rem. Sticky with its own scrolling at 64rem wide and 36rem tall viewports.",
      "ef-doc__content": "The article column. Combine with `ef-prose`. Reduces `h1` to the `h2` size.",
      "ef-doc__aside": "Optional page outline. Follows the article below 72rem and sits in the third column above it; sticky like the navigation.",
      "ef-doc__heading": "Group label above a navigation or outline list; combine with `ef-eyebrow`."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through navigation links, then the article, then the outline, in source order at every width." },
      { keys: "Enter", action: "Follows the focused link; outline links jump to headings in the article." }
    ],
    events: []
  },
  states: [
    { name: "One column", how: "@container ef-main below 48rem", description: "Navigation, article and outline stack in source order." },
    { name: "Two columns", how: "@container ef-main (inline-size >= 48rem)", description: "Navigation beside the article; the outline sits under the article in the second column." },
    { name: "Three columns", how: "@container ef-main (inline-size >= 72rem)", description: "Navigation, article and outline side by side." },
    { name: "Compact navigation", how: "@container ef-doc (inline-size < 48rem)", description: "Navigation lists wrap horizontally; the current link gets a bottom rule." },
    { name: "Current page", how: "aria-current on a navigation link", description: "Strong rule and bold text." },
    { name: "Sticky rails", how: "@media (min-width: 64rem) and (min-height: 36rem)", description: "Navigation and outline stick below the header and scroll within the viewport height." }
  ],
  accessibility: {
    forma: [
      "Regroups with container queries without reordering, so reading and focus order are the same at every width.",
      "Keeps navigation and outline links at a 44px minimum row height with visible focus.",
      "Marks the current page with a rule and bold weight in addition to `aria-current`.",
      "Makes rails sticky only where there is room, so they never cover the article."
    ],
    consumer: [
      "Label the navigation and outline landmarks distinctly and mark the current page with `aria-current=\"page\"`.",
      "Generate outline links from the article's real headings and keep their ids stable.",
      "Keep one `h1` per page, normally the article title."
    ]
  },
  responsive: [
    "Regroups by the main region's width (`ef-main` container at 48rem and 72rem), not the viewport, so it adapts correctly inside narrower frames.",
    "Below a 48rem layout width (`ef-doc` container) the navigation compacts into a wrapping row.",
    "All columns have `min-inline-size: 0`; long words and code in the article wrap or scroll inside their own blocks.",
    "Rails stick only at `min-width: 64rem` and `min-height: 36rem`, with a maximum height of the viewport minus the header offset."
  ],
  motion: [
    "No animation: regrouping is immediate. Outline and navigation jumps scroll smoothly only under `prefers-reduced-motion: no-preference` (a shell rule) and instantly otherwise."
  ],
  guidance: {
    do: [
      "Keep navigation groups short and labelled with `ef-doc__heading`.",
      "Include an outline only for articles long enough to need one."
    ],
    avoid: [
      "Hiding the navigation behind a toggle at narrow widths; it compacts instead.",
      "Placing the layout outside `.ef-site__main`, which disables its regrouping."
    ]
  },
  related: [
    { slug: "prose", note: "The article content inside `ef-doc__content`." },
    { slug: "marketing-shell", note: "Provides the main region this layout queries." },
    { slug: "sidebar", note: "Application navigation rails and panels." },
    { slug: "rail", note: "Compact application navigation." }
  ]
};
