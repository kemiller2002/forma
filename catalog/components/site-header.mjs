export default {
  name: "Site header",
  category: "site",
  behavior: "Site content",
  summary: "Identity and primary navigation that wraps instead of hiding links, keeps 44px targets, and marks the current page with a non-color rule.",
  owns: ["ef-site-header", "ef-site-nav"],
  purpose: {
    description: "The site header is the banner row of a marketing site: a brand link (decorative mark plus a visible name), an optional tagline, and a native `nav` list of primary destinations. Links are ordinary anchors, so routing and current-page state belong to the site. Forma supplies the wrapping layout, 44px targets, the current-page under-rule driven by `aria-current`, a single emphasized action link, and the sticky behavior where it is safe.",
    useWhen: [
      "A marketing, product or documentation page inside [[marketing-shell]] needs identity and a small set of primary destinations.",
      "One destination is the site's main conversion (Get started, Get in touch) and should read as an action.",
      "The current page or section must be visible without relying on color."
    ],
    avoidWhen: [
      "An application needs persistent, collapsible or compact navigation: use [[navigation-shell]] or [[sidebar]].",
      "The site has more than about seven primary destinations; wrapping reaches three lines (GAP-MKT-10). Move secondary destinations to the page or [[site-footer]].",
      "Showing in-page section links for a long article: use the outline region of [[documentation-layout]]."
    ],
    characteristics: [
      "Navigation wraps onto more lines instead of collapsing into a hidden menu; there is no script.",
      "The brand name never hides; the decorative mark is `aria-hidden`, so the name is the link's accessible name.",
      "The tagline is supplementary and yields below a 56rem header width to keep navigation to two lines.",
      "Hover and current state use an under-rule; the action link uses the tone's action colors and a border in forced colors."
    ]
  },
  examples: [
    {
      id: "current-section",
      title: "Current section on a subpage",
      description: "On a documentation subpage the Documentation link is marked `aria-current=\"true\"` (the current section, not the exact page). It gets the same persistent under-rule as `aria-current=\"page\"`. No action link is used here, so no destination competes with the page content.",
      html: `<ef-site-header class="ef-component-tag">
  <div class="ef-site">
    <header class="ef-site-header">
      <div class="ef-site-header__inner">
        <div class="ef-site-header__identity">
          <a class="ef-site-header__brand" href="#site-header-current-section-home"><span class="ef-site-header__mark" aria-hidden="true">LM</span><span class="ef-site-header__name">Echelon / Limen</span></a>
          <p class="ef-site-header__tagline">Behavior at the interface boundary</p>
        </div>
        <nav class="ef-site-nav" aria-label="Limen">
          <ul class="ef-site-nav__list">
            <li><a class="ef-site-nav__link" id="site-header-current-section-home" href="#site-header-current-section-home">Overview</a></li>
            <li><a class="ef-site-nav__link" href="#site-header-current-section-home" aria-current="true">Documentation</a></li>
            <li><a class="ef-site-nav__link" href="#site-header-current-section-home">Releases</a></li>
          </ul>
        </nav>
      </div>
    </header>
  </div>
</ef-site-header>`
    },
    {
      id: "long-brand-name",
      title: "Long brand name without tagline",
      description: "A long compound product name and no tagline. The name wraps inside the identity group rather than truncating, and the navigation drops below the identity when both no longer fit on one row.",
      html: `<ef-site-header class="ef-component-tag">
  <div class="ef-site">
    <header class="ef-site-header">
      <div class="ef-site-header__inner">
        <div class="ef-site-header__identity">
          <a class="ef-site-header__brand" href="#site-header-long-brand-name-top"><span class="ef-site-header__mark" aria-hidden="true">TR</span><span class="ef-site-header__name">Echelon Foundry / Tutoris Research Publications</span></a>
        </div>
        <nav class="ef-site-nav" aria-label="Tutoris">
          <ul class="ef-site-nav__list">
            <li><a class="ef-site-nav__link" id="site-header-long-brand-name-top" href="#site-header-long-brand-name-top" aria-current="page">Publications</a></li>
            <li><a class="ef-site-nav__link" href="#site-header-long-brand-name-top">Methods</a></li>
            <li><a class="ef-site-nav__link" href="#site-header-long-brand-name-top">Datasets</a></li>
            <li><a class="ef-site-nav__link" href="#site-header-long-brand-name-top">About</a></li>
            <li><a class="ef-site-nav__link" data-ef-variant="action" href="#site-header-long-brand-name-top">Subscribe</a></li>
          </ul>
        </nav>
      </div>
    </header>
  </div>
</ef-site-header>`
    },
    {
      id: "mobile-wrapping-nav",
      title: "Phone navigation wraps",
      description: "Five destinations at phone width. The tagline yields, the brand stays on its own row, and the links wrap into two right-aligned rows that each keep a 44px target.",
      mobile: {
        height: 260,
        notes: [
          "Below a 56rem header width the tagline is hidden (a container query on the header), keeping navigation to about two lines.",
          "The navigation list wraps and stays right-aligned; no destination is hidden behind a menu button.",
          "Each link, the action link and the brand are at least 44px tall; links are padded horizontally so short labels stay comfortable to tap.",
          "The header is not sticky below 40rem width or 36rem height, so it scrolls away instead of permanently consuming screen space in either orientation."
        ]
      },
      html: `<ef-site-header class="ef-component-tag">
  <div class="ef-site">
    <header class="ef-site-header">
      <div class="ef-site-header__inner">
        <div class="ef-site-header__identity">
          <a class="ef-site-header__brand" href="#site-header-mobile-wrapping-nav-top"><span class="ef-site-header__mark" aria-hidden="true">EF</span><span class="ef-site-header__name">Echelon Foundry</span></a>
          <p class="ef-site-header__tagline">Evidence-driven engineering systems</p>
        </div>
        <nav class="ef-site-nav" aria-label="Echelon Foundry">
          <ul class="ef-site-nav__list">
            <li><a class="ef-site-nav__link" id="site-header-mobile-wrapping-nav-top" href="#site-header-mobile-wrapping-nav-top" aria-current="page">Overview</a></li>
            <li><a class="ef-site-nav__link" href="#site-header-mobile-wrapping-nav-top">Research</a></li>
            <li><a class="ef-site-nav__link" href="#site-header-mobile-wrapping-nav-top">Products</a></li>
            <li><a class="ef-site-nav__link" href="#site-header-mobile-wrapping-nav-top">Writing</a></li>
            <li><a class="ef-site-nav__link" data-ef-variant="action" href="#site-header-mobile-wrapping-nav-top">Get in touch</a></li>
          </ul>
        </nav>
      </div>
    </header>
  </div>
</ef-site-header>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "nav.ef-site-nav", values: "string", default: "—", description: "Names the navigation landmark. Use \"Primary\" and give any other nav on the page a different name." },
      { name: "aria-current", on: "a.ef-site-nav__link", values: "page | true", default: "absent", description: "`page` for the exact current page, `true` for the current section on a subpage. Mark only one link." },
      { name: "aria-hidden", on: "span.ef-site-header__mark", values: "true", default: "—", description: "Required. The mark is decorative; the visible name is the brand link's accessible name." },
      { name: "href", on: "a", values: "URL", default: "—", description: "Ordinary navigation links; the site owns routing." }
    ],
    hooks: {
      "ef-site-header": "Banner root. Draws the bottom rule and a translucent, blurred page background, and is the `ef-site-header` size container. Sticky at 40rem wide and 36rem tall or more.",
      "ef-site-header__inner": "Wrapping flex row, capped at the maximum layout width with fluid gutters, that places identity and navigation at opposite ends.",
      "ef-site-header__identity": "Groups the brand link and optional tagline; wraps internally.",
      "ef-site-header__brand": "Brand link with a 44px minimum height; underlines on hover.",
      "ef-site-header__mark": "Square decorative mark on the inverse surface. Always `aria-hidden=\"true\"`.",
      "ef-site-header__name": "Visible brand name. Wraps anywhere rather than truncating and never hides.",
      "ef-site-header__tagline": "Optional supplementary line in the mono label size. Hidden when the header is narrower than 56rem.",
      "ef-site-nav": "The navigation landmark element.",
      "ef-site-nav__list": "Unstyled list that wraps its links and aligns them to the inline end.",
      "ef-site-nav__link": "Navigation link: 44px minimum height, no underline, and a transparent bottom rule that shows on hover and when current.",
      "aria-current": "`page` or `true` on a navigation link draws a persistent strong under-rule (Highlight in forced colors).",
      "data-ef-variant": "`action` on at most one navigation link renders it with the tone's action background and text colors, as the site's main conversion."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the brand link and navigation links in source order." },
      { keys: "Enter", action: "Follows the focused link (native link behavior)." }
    ],
    events: []
  },
  states: [
    { name: "Default", how: "no attributes", description: "Link text in the tone's text color with a transparent under-rule." },
    { name: "Hover", how: ":hover", description: "The under-rule turns the accent color; the brand link underlines; the action link shifts to the action hover background." },
    { name: "Current", how: "aria-current=\"page\" or \"true\"", description: "A persistent strong under-rule marks the current destination." },
    { name: "Focus", how: ":focus-visible", description: "The shell's outline and halo ring surround the focused link." },
    { name: "Action", how: "data-ef-variant=\"action\"", description: "Filled link that reads as the primary conversion; bordered in forced colors." },
    { name: "Sticky", how: "@media (min-width: 40rem) and (min-height: 36rem)", description: "The header sticks to the top of the viewport; anchor targets get scroll padding below it." }
  ],
  accessibility: {
    forma: [
      "Keeps navigation as a native `nav` with a list of anchors; nothing is hidden at narrow widths.",
      "Provides 44px minimum targets on the brand and every navigation link.",
      "Marks the current destination with a persistent rule in addition to `aria-current`, and uses Highlight for it in forced colors.",
      "Disables sticky positioning on short or narrow viewports so the header cannot obscure focused content (WCAG 2.4.11).",
      "Keeps the brand name visible and readable at every width."
    ],
    consumer: [
      "Set `aria-current` on exactly one link and keep it accurate for the rendered page.",
      "Mark the decorative mark `aria-hidden=\"true\"` and give the brand link a meaningful visible name.",
      "Label the primary navigation and give other navigation landmarks distinct labels.",
      "Use `data-ef-variant=\"action\"` on at most one link."
    ]
  },
  responsive: [
    "The inner row is a wrapping flex container: navigation moves below the identity when both do not fit.",
    "The navigation list wraps onto additional lines and stays aligned to the inline end.",
    "A container query hides the tagline below a 56rem header width; the brand name wraps with `overflow-wrap: anywhere` and never hides.",
    "Sticky positioning applies only at `min-width: 40rem` and `min-height: 36rem`."
  ],
  motion: [
    "No animation: hover and current states change the under-rule and colors instantly.",
    "Reduced-motion users see the same result, because the shell removes all transitions inside `.ef-site`."
  ],
  guidance: {
    do: [
      "Keep primary navigation to a handful of destinations with short, specific labels.",
      "Reserve the action variant for the one conversion most visitors should take."
    ],
    avoid: [
      "Replacing the wrapping list with a script-driven hamburger menu.",
      "Removing the brand name and relying on the mark alone.",
      "Signalling the current page with color only."
    ]
  },
  related: [
    { slug: "marketing-shell", note: "The frame that places this header before main." },
    { slug: "site-footer", note: "Holds secondary destinations such as privacy and source links." },
    { slug: "navigation-shell", note: "Application navigation with persistent and compact modes." },
    { slug: "skip-link", note: "Lets keyboard users bypass the header." }
  ]
};
