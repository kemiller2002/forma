export default {
  name: "Marketing shell",
  category: "site",
  behavior: "Site content",
  summary: "Reusable marketing-site frame: skip link, identity header with wrapping navigation, main content, and footer. Sites own content; the shell owns structure, focus, and responsive behavior.",
  owns: ["ef-site"],
  purpose: {
    description: "The marketing shell is the `.ef-site` root that every Echelon marketing, product and documentation page starts from. It scopes the whole marketing layer (typography, link and focus treatment, surface tones, reduced motion) so that loading marketing CSS never restyles an application, and it fixes the page frame in source order: `.ef-skip-link`, `header.ef-site-header`, `main.ef-site__main`, `footer.ef-site-footer`. Sites supply content only; there is no runtime and no state beyond native focus and `aria-current`.",
    useWhen: [
      "Building any page of a public marketing, product or documentation site that consumes a pinned Forma release.",
      "Several sites must share one frame, focus treatment and responsive behavior without copying CSS.",
      "A page needs surface tones (`data-ef-tone`) so text, links and rules stay legible on every background."
    ],
    avoidWhen: [
      "Building an authenticated application screen: use [[workspace-shell]] or [[navigation-shell]], which own application regions and compact navigation.",
      "Embedding one marketing component inside an application page. The marketing components need an `.ef-site` ancestor; put it on a bounded region, not around application UI.",
      "A site needs more than about seven primary destinations: the navigation wraps to three or more lines (GAP-MKT-10). Reduce destinations or move them into the page."
    ],
    characteristics: [
      "Marketing foundations apply only inside `.ef-site`; `body.ef-site` additionally fills the viewport and lets the footer sit at the bottom of short pages.",
      "No CSS reordering: skip link, header, main and footer are read, tabbed and printed in source order at every width.",
      "One focus treatment for the whole shell: a gap-colored outline inside a ring-colored halo, visible on page, surface, elevated and inverse tones.",
      "`data-ef-layout` declares the page type (marketing, product, documentation) for identity retargets; it does not change layout by itself."
    ]
  },
  examples: [
    {
      id: "product-page",
      title: "Product page frame",
      description: "A product page declared with `data-ef-layout=\"product\"`: no header tagline, release badges in the hero, and a footer with secondary navigation. The skip link targets the main region, which takes `tabindex=\"-1\"` so focus lands on it. On a real page the main region is a `main` element and the hero title is the page's only `h1`; the catalog page already has both, so this specimen uses a `div` and an `h2`.",
      html: `<ef-marketing-shell class="ef-component-tag">
  <div class="ef-site" data-ef-layout="product">
    <a class="ef-skip-link" href="#marketing-shell-product-page-main">Skip to main content</a>
    <header class="ef-site-header">
      <div class="ef-site-header__inner">
        <div class="ef-site-header__identity">
          <a class="ef-site-header__brand" href="#marketing-shell-product-page-main"><span class="ef-site-header__mark" aria-hidden="true">OR</span><span class="ef-site-header__name">Echelon / Ordo</span></a>
        </div>
        <nav class="ef-site-nav" aria-label="Ordo">
          <ul class="ef-site-nav__list">
            <li><a class="ef-site-nav__link" href="#marketing-shell-product-page-main" aria-current="page">Overview</a></li>
            <li><a class="ef-site-nav__link" href="#marketing-shell-product-page-cta">Documentation</a></li>
            <li><a class="ef-site-nav__link" data-ef-variant="action" href="#marketing-shell-product-page-cta">Install</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <div class="ef-site__main" id="marketing-shell-product-page-main" tabindex="-1">
      <section class="ef-hero" aria-labelledby="marketing-shell-product-page-title">
        <div class="ef-hero__content">
          <p class="ef-eyebrow">Product / Domain state</p>
          <h2 class="ef-hero__title" id="marketing-shell-product-page-title">Make every legal transition explicit</h2>
          <p class="ef-lead">Ordo models what work may happen next, so interfaces never guess.</p>
          <ul class="ef-badge-list" aria-label="Release facts">
            <li><span class="ef-badge" data-ef-status="success">Stable</span></li>
            <li><span class="ef-badge">Version 2.1.0</span></li>
          </ul>
          <div class="ef-actions"><a class="ef-button" data-ef-variant="primary" href="#marketing-shell-product-page-cta">Install</a></div>
        </div>
      </section>
      <section class="ef-section" id="marketing-shell-product-page-cta" aria-labelledby="marketing-shell-product-page-cta-title">
        <div class="ef-cta">
          <div class="ef-cta__text"><h2 id="marketing-shell-product-page-cta-title">Model one workflow this week</h2><p>Start from an existing process and make its rules executable.</p></div>
          <div class="ef-actions"><a class="ef-button" data-ef-variant="primary" href="#marketing-shell-product-page-main">Read the quick start</a></div>
        </div>
      </section>
    </div>
    <footer class="ef-site-footer" data-ef-tone="inverse">
      <div class="ef-site-footer__inner">
        <nav class="ef-site-footer__nav" aria-label="Ordo footer"><ul><li><a href="#marketing-shell-product-page-main">Privacy</a></li><li><a href="#marketing-shell-product-page-main">Source</a></li><li><a href="#marketing-shell-product-page-main">Release notes</a></li></ul></nav>
        <p class="ef-site-footer__note"><span>&copy; 2026 Echelon Foundry</span><span>Built with Forma</span></p>
      </div>
    </footer>
  </div>
</ef-marketing-shell>`
    },
    {
      id: "single-offer",
      title: "Single-offer page",
      description: "A single-offer page is the marketing layout with fewer sections, not a separate layout. The header keeps its tagline where there is room, the page has one hero and one closing action, and the footer uses the surface tone instead of inverse.",
      html: `<ef-marketing-shell class="ef-component-tag">
  <div class="ef-site" data-ef-layout="marketing">
    <header class="ef-site-header">
      <div class="ef-site-header__inner">
        <div class="ef-site-header__identity">
          <a class="ef-site-header__brand" href="#marketing-shell-single-offer-main"><span class="ef-site-header__mark" aria-hidden="true">EF</span><span class="ef-site-header__name">Echelon Foundry</span></a>
          <p class="ef-site-header__tagline">Diagnostic engineering for consequential systems</p>
        </div>
        <nav class="ef-site-nav" aria-label="Offer">
          <ul class="ef-site-nav__list">
            <li><a class="ef-site-nav__link" href="#marketing-shell-single-offer-main" aria-current="page">Diagnostic</a></li>
            <li><a class="ef-site-nav__link" data-ef-variant="action" href="#marketing-shell-single-offer-main">Book a session</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <div class="ef-site__main" id="marketing-shell-single-offer-main" tabindex="-1">
      <section class="ef-hero" aria-labelledby="marketing-shell-single-offer-title">
        <div class="ef-hero__content">
          <p class="ef-eyebrow">Two-week diagnostic</p>
          <h2 class="ef-hero__title" id="marketing-shell-single-offer-title">Find the cause before you fund the fix</h2>
          <div class="ef-actions"><a class="ef-button" data-ef-variant="primary" href="#marketing-shell-single-offer-main">Book a working session</a></div>
        </div>
      </section>
    </div>
    <footer class="ef-site-footer" data-ef-tone="surface">
      <div class="ef-site-footer__inner">
        <p class="ef-site-footer__note"><span>&copy; 2026 Echelon Foundry</span><span>Indianapolis, Indiana</span></p>
      </div>
    </footer>
  </div>
</ef-marketing-shell>`
    },
    {
      id: "mobile-frame",
      title: "Phone-width frame",
      description: "The whole frame at phone width: the tagline yields, navigation wraps under the brand instead of collapsing into a menu, and the header is not sticky.",
      mobile: {
        height: 640,
        notes: [
          "The header is sticky only at 40rem wide and 36rem tall or more; on phones it scrolls away so it never covers focused content or reading space.",
          "The header tagline hides below a 56rem header width; the brand name stays visible and wraps instead of truncating.",
          "Navigation links wrap onto a second line rather than hiding behind a menu, and every link, the brand and every button keep a 44px minimum height.",
          "Gutters come from the fluid `--ef-layout-gutter` token, so nothing scrolls horizontally at 320px or at 200% text size.",
          "Rotating the device only reflows the wrapping rows; source order, focus order and landmarks do not change."
        ]
      },
      html: `<ef-marketing-shell class="ef-component-tag">
  <div class="ef-site" data-ef-layout="marketing">
    <a class="ef-skip-link" href="#marketing-shell-mobile-frame-main">Skip to main content</a>
    <header class="ef-site-header">
      <div class="ef-site-header__inner">
        <div class="ef-site-header__identity">
          <a class="ef-site-header__brand" href="#marketing-shell-mobile-frame-main"><span class="ef-site-header__mark" aria-hidden="true">EF</span><span class="ef-site-header__name">Echelon Foundry</span></a>
          <p class="ef-site-header__tagline">Evidence-driven engineering systems</p>
        </div>
        <nav class="ef-site-nav" aria-label="Site">
          <ul class="ef-site-nav__list">
            <li><a class="ef-site-nav__link" href="#marketing-shell-mobile-frame-main" aria-current="page">Overview</a></li>
            <li><a class="ef-site-nav__link" href="#marketing-shell-mobile-frame-main">Research</a></li>
            <li><a class="ef-site-nav__link" href="#marketing-shell-mobile-frame-main">Products</a></li>
            <li><a class="ef-site-nav__link" data-ef-variant="action" href="#marketing-shell-mobile-frame-main">Get in touch</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <div class="ef-site__main" id="marketing-shell-mobile-frame-main" tabindex="-1">
      <section class="ef-hero" aria-labelledby="marketing-shell-mobile-frame-title">
        <div class="ef-hero__content">
          <p class="ef-eyebrow">Applied research</p>
          <h2 class="ef-hero__title" id="marketing-shell-mobile-frame-title">Prove what is wrong before changing it</h2>
          <div class="ef-actions"><a class="ef-button" data-ef-variant="primary" href="#marketing-shell-mobile-frame-main">Book a session</a><a class="ef-button" href="#marketing-shell-mobile-frame-main">See the work</a></div>
        </div>
      </section>
    </div>
    <footer class="ef-site-footer" data-ef-tone="inverse">
      <div class="ef-site-footer__inner">
        <p class="ef-site-footer__note"><span>&copy; 2026 Echelon Foundry</span><span>Built with Forma</span></p>
      </div>
    </footer>
  </div>
</ef-marketing-shell>`
    }
  ],
  api: {
    attributes: [
      { name: "tabindex", on: "main.ef-site__main", values: "-1", default: "—", description: "Required on the main region so activating the skip link moves focus into it; -1 keeps it out of the Tab order." },
      { name: "id", on: "main.ef-site__main", values: "string", default: "—", description: "Skip-link target. The reference sites use `main-content`." },
      { name: "href", on: "a.ef-skip-link", values: "#id of the main region", default: "—", description: "Must point at the main region's id." },
      { name: "aria-label", on: "nav.ef-site-nav", values: "string", default: "—", description: "Names the primary navigation landmark (\"Primary\" on a real page)." },
      { name: "aria-current", on: "a.ef-site-nav__link", values: "page | true", default: "absent", description: "Marks exactly one navigation link as the current location." }
    ],
    hooks: {
      "ef-site": "Shell root, normally on `body`. Scopes every marketing foundation, sets the base tone, and stacks header, main and footer in a column.",
      "ef-site__main": "Main content region. Centers content to `--ef-layout-width-max`, applies gutters, grows to push the footer down, and is the `ef-main` size container the documentation layout queries.",
      "data-ef-layout": "Declares the page type: `marketing`, `product` or `documentation`. No layout rules key off it; sites may use it as a selector for allowlisted identity retargets.",
      "data-ef-tone": "Surface tone on any region inside the shell: `page` (default), `surface`, `elevated` or `inverse`. A tone sets the background and the `--ef-tone-*` text, link, label and rule colors that every component reads.",
      "--ef-site-backdrop": "Optional decorative background image drawn behind the whole shell on a fixed pseudo-element. Default none; the Echelon theme sets a faint drafting grid. Allowlisted for site identity.",
      "--ef-site-backdrop-size": "Background size for the backdrop. Default auto.",
      "--ef-site-backdrop-opacity": "Opacity of the backdrop layer. Default 1."
    },
    keyboard: [
      { keys: "Tab (first press)", action: "Focuses the skip link, which becomes visible at the top of the viewport." },
      { keys: "Enter on the skip link", action: "Native link activation: scrolls to the main region and moves focus into it; the next Tab continues inside main." },
      { keys: "Tab / Shift+Tab", action: "Moves through header, main and footer links in source order." }
    ],
    events: []
  },
  states: [
    { name: "Skip link focused", how: ":focus on .ef-skip-link", description: "The skip link slides into view at the top-left corner; otherwise it sits above the viewport." },
    { name: "Main focused", how: ":focus on .ef-site__main (tabindex=-1)", description: "No outline is drawn on the region itself; the next Tab reaches its first interactive element." },
    { name: "Current page", how: "aria-current on one navigation link", description: "A persistent under-rule marks the current destination, not color alone." },
    { name: "Sticky header", how: "@media (min-width: 40rem) and (min-height: 36rem)", description: "The header sticks to the top and anchor targets get scroll padding so they land below it." },
    { name: "Print", how: "@media print", description: "Skip link, navigation, footer actions and backdrop are removed; tones flatten to CanvasText on no background." }
  ],
  accessibility: {
    forma: [
      "Keeps skip link, banner, main and contentinfo in source order with no CSS reordering.",
      "Gives every interactive element in the shell the same visible focus ring and halo on every surface tone, and never lets the sticky header obscure focus on short or narrow viewports.",
      "Surface tones use only contrast-validated token pairs, so text and links stay AA on surface, elevated and inverse regions.",
      "Keeps navigation, brand and button targets at least 44px tall and keeps the brand name visible at every width.",
      "Removes transitions and smooth scrolling under reduced motion and draws borders on tones, buttons and badges in forced colors."
    ],
    consumer: [
      "Put the skip link first in `body` and point it at `main` with `tabindex=\"-1\"`.",
      "Use exactly one `h1` (the hero title), no skipped heading levels, and one `aria-current` navigation link.",
      "Name the primary navigation with `aria-label` and any second navigation (footer) with a different label.",
      "Set `lang` and a page `title`; load the fonts the theme names, since webfonts are not packaged (GAP-MKT-02).",
      "Keep at most one `data-ef-variant=\"primary\"` action per hero, section or CTA."
    ]
  },
  responsive: [
    "All recomposition is content-driven: header, hero, section heading, CTA and footer are wrapping flex rows; cards and facts are auto-fit grids with minimum sizes.",
    "The header becomes sticky only at `min-width: 40rem` and `min-height: 36rem`, which also excludes high zoom and short landscape phones.",
    "`.ef-site__main` is capped at `--ef-layout-width-max` and uses the fluid `--ef-layout-gutter`; there is no horizontal scrolling at 320px or with 200% text.",
    "`.ef-site__main` is an `ef-main` size container; the documentation layout regroups against it at 48rem and 72rem."
  ],
  motion: [
    "Anchor jumps, including the skip link, scroll smoothly only under `prefers-reduced-motion: no-preference`.",
    "Buttons and linked cards interpolate color over the shared perceptual duration (about 120ms); nothing inside the shell moves spatially on hover.",
    "Under `prefers-reduced-motion: reduce` every transition, animation and smooth scroll inside `.ef-site` is removed.",
    "The skip link appears instantly on focus (a transform with no transition). The backdrop is static."
  ],
  guidance: {
    do: [
      "Start every page from the shell pattern and compose only Forma components inside `main`.",
      "Use `data-ef-tone` to change a region's background so components adapt automatically.",
      "Pin the Forma release in `forma.lock` and keep local CSS to identity imagery and allowlisted retargets."
    ],
    avoid: [
      "Restyling `ef-*` classes or global elements in site CSS; the site CSS policy check rejects it.",
      "Hiding navigation links in a script-driven menu at narrow widths; the shell wraps them by design.",
      "Nesting a second `.ef-site` or wrapping application UI in the shell."
    ]
  },
  related: [
    { slug: "site-header", note: "The identity and primary navigation row inside the shell's header." },
    { slug: "site-footer", note: "The closing region the shell places after main." },
    { slug: "skip-link", note: "The first focus stop the shell requires." },
    { slug: "documentation-layout", note: "The three-region page structure composed inside the shell's main region." },
    { slug: "workspace-shell", note: "Use for authenticated application screens instead of public pages." }
  ]
};
