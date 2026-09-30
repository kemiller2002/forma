export default {
  name: "Skip link",
  category: "navigation",
  behavior: "Native HTML",
  summary: "First focusable link that jumps to main content; visually hidden until focused.",
  purpose: {
    description: "A skip link lets keyboard and switch users bypass repeated header and navigation links. It is an ordinary in-page link placed first inside the marketing shell (`.ef-site`), pointing at the main content, which carries `tabindex=\"-1\"` so it can receive focus. Forma keeps the link fixed near the top inline-start corner and translated off-screen; it snaps into view when it receives focus. Following it is native fragment navigation: the browser scrolls to the target and moves focus there, so the next Tab continues inside the content.",
    useWhen: [
      "A page built on the marketing shell has a header or navigation before the main content.",
      "Several skip targets are useful on long pages, such as the main content and a search form.",
      "You need a WCAG 2.4.1 bypass mechanism without script."
    ],
    avoidWhen: [
      "The page is an application screen outside `.ef-site`: `.ef-skip-link` lives in the marketing layer and depends on its tokens, so use an application-level equivalent.",
      "You want to hide content from sighted users permanently: use [[visually-hidden]].",
      "You need in-page navigation between sections: use a visible table of contents or [[documentation-layout]] navigation."
    ],
    characteristics: [
      "Fixed at the top inline-start corner with a high stacking order, above a sticky header.",
      "Hidden by `translateY(-200%)`, not `display: none`, so it stays focusable and in the accessibility tree.",
      "Revealed on `:focus` and `:focus-visible`, with the shell's standard focus ring.",
      "At least `--ef-layout-target-min` (2.75rem) tall with bold text; removed when printing."
    ]
  },
  examples: [
    {
      id: "before-site-header",
      title: "Before a site header",
      description: "The skip link comes first, before the site header's brand and navigation links. Its target is the content region with tabindex=\"-1\". In a real page that region is the single main element; it is a section here because the documentation page already has one.",
      html: `<ef-skip-link class="ef-component-tag">
  <div class="ef-site">
    <a class="ef-skip-link" href="#skip-header-content">Skip to main content</a>
    <header class="ef-site-header">
      <div class="ef-site-header__inner">
        <div class="ef-site-header__identity">
          <a class="ef-site-header__brand" href="#skip-header-content"><span class="ef-site-header__mark" aria-hidden="true">EX</span><span class="ef-site-header__name">Example / Docs</span></a>
        </div>
        <nav class="ef-site-nav" aria-label="Example site">
          <ul class="ef-site-nav__list">
            <li><a class="ef-site-nav__link" href="#skip-header-content" aria-current="page">Guides</a></li>
            <li><a class="ef-site-nav__link" href="#skip-header-content">Reference</a></li>
            <li><a class="ef-site-nav__link" href="#skip-header-content">Support</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <section id="skip-header-content" tabindex="-1" aria-labelledby="skip-header-title">
      <h2 id="skip-header-title">Guides</h2>
      <p>Press Tab from the top of this example to reveal the skip link.</p>
    </section>
  </div>
</ef-skip-link>`
    },
    {
      id: "multiple-targets",
      title: "Main content and search targets",
      description: "A long page with two skip links. Each is hidden until focused and appears in the same corner, so only the focused one is ever visible. The search target is the form's labelled input, which is natively focusable.",
      html: `<ef-skip-link class="ef-component-tag">
  <div class="ef-site">
    <a class="ef-skip-link" href="#skip-multi-content">Skip to main content</a>
    <a class="ef-skip-link" href="#skip-multi-search">Skip to search</a>
    <section id="skip-multi-content" tabindex="-1" aria-labelledby="skip-multi-title">
      <h2 id="skip-multi-title">Release notes</h2>
      <p>Version 4.2 adds regional failover and faster exports.</p>
    </section>
    <form role="search" aria-label="Release notes">
      <label for="skip-multi-search">Search release notes</label>
      <input id="skip-multi-search" name="skip-multi-q" type="search">
    </form>
  </div>
</ef-skip-link>`
    },
    {
      id: "mobile-translated-label",
      title: "Translated skip link on a phone",
      description: "A French skip link at phone width. When focused it appears in the top corner of the viewport, clear of the sticky header.",
      mobile: {
        height: 240,
        notes: [
          "Position is fixed relative to the viewport, so the link appears in the top inline-start corner even when the page is scrolled.",
          "The link keeps a 2.75rem (44px) minimum height, so it is a usable tap target for switch and external-keyboard users on tablets and phones.",
          "Longer translated labels widen the link; it is inline-flex and sized to its text, so at 320px a very long label can reach the far edge. Keep the label short.",
          "Touch-only users rarely focus it; it matters for keyboard, switch and screen reader navigation on mobile devices."
        ]
      },
      html: `<ef-skip-link class="ef-component-tag">
  <div class="ef-site" lang="fr">
    <a class="ef-skip-link" href="#skip-mobile-content">Aller au contenu</a>
    <section id="skip-mobile-content" tabindex="-1" aria-labelledby="skip-mobile-title">
      <h2 id="skip-mobile-title">Paramètres du compte</h2>
      <p>Gérez votre profil et vos notifications.</p>
    </section>
  </div>
</ef-skip-link>`
    }
  ],
  api: {
    attributes: [
      { name: "href", on: "a.ef-skip-link", values: "#id of the target", default: "—", description: "Fragment link to the main content (or another skip target). Native navigation moves focus there." },
      { name: "tabindex", on: "target", values: "-1", default: "—", description: "Required on non-focusable targets such as main, so the browser can move focus to them without adding them to the Tab order." },
      { name: "id", on: "target", values: "string", default: "—", description: "Unique fragment identifier referenced by the skip link." },
      { name: "lang", on: "shell or link", values: "language tag", default: "inherited", description: "Declare the language when the skip link text differs from the page language." }
    ],
    hooks: {
      "ef-skip-link": "The skip link. Fixed at `--ef-space-2` from the top inline-start corner, translated off-screen until `:focus`, then shown with the primary surface, bold text and the shell's focus ring. Hidden in print. Requires the marketing layer inside `.ef-site`."
    },
    keyboard: [
      { keys: "Tab (first press on the page)", action: "Focuses the skip link and reveals it." },
      { keys: "Enter", action: "Follows the link: the browser scrolls to the target and moves focus to it (native)." },
      { keys: "Tab after skipping", action: "Continues from the first focusable element inside the target, bypassing the header." }
    ],
    events: [],
    form: "Does not participate in forms."
  },
  states: [
    { name: "Hidden", how: "not focused", description: "Translated above the viewport; still focusable and announced." },
    { name: "Visible", how: ":focus / :focus-visible", description: "Shown in the top corner with the shell focus ring." },
    { name: "Print", how: "@media print", description: "Removed from printed output." }
  ],
  accessibility: {
    forma: [
      "Keeps the link in the accessibility tree and Tab order while visually hidden.",
      "Reveals it on focus above sticky headers with a visible focus ring and a 44px target.",
      "Removes it from print, where it has no purpose."
    ],
    consumer: [
      "Place the skip link as the first focusable element inside `.ef-site`.",
      "Give the target an id and tabindex=\"-1\" and use exactly one main element as the primary target.",
      "Write the text as an action, such as Skip to main content, in the page language."
    ]
  },
  responsive: [
    "Fixed positioning relative to the viewport; no breakpoints.",
    "Inline-flex and sized to its text, with inline padding of `--ef-space-4`.",
    "Minimum block size is `--ef-layout-target-min` at every width."
  ],
  motion: [
    "No animation: the link snaps into view on focus and out again on blur. The marketing layer also removes any transitions under `prefers-reduced-motion: reduce`."
  ],
  guidance: {
    do: [
      "Test with Tab from a fresh page load: the skip link must be the first stop.",
      "Keep skip targets to the few that matter most."
    ],
    avoid: [
      "Hiding the link with display: none or visibility: hidden, which removes it from the Tab order.",
      "Pointing at a target without tabindex=\"-1\", which scrolls but leaves focus behind in some browsers."
    ]
  },
  related: [
    { slug: "marketing-shell", note: "The full page frame that places the skip link first." },
    { slug: "site-header", note: "The repeated header content the skip link bypasses." },
    { slug: "visually-hidden", note: "Permanently hidden text for assistive technology; not revealed on focus." }
  ]
};
