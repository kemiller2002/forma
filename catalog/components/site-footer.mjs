export default {
  name: "Site footer",
  category: "site",
  behavior: "Site content",
  summary: "Closing identity, actions, secondary navigation, and legal note on a surface tone.",
  purpose: {
    description: "The site footer closes every page of a marketing site. Inside `.ef-site-footer__inner` it can hold a main row (identity sentence and an optional action group), a secondary `nav` of links such as privacy and source, and a legal note line. The footer normally carries `data-ef-tone=\"inverse\"` (or another tone), which sets its background and all text, link and rule colors. In the shell it is pushed to the bottom of short pages.",
    useWhen: [
      "Closing every page of a site built on [[marketing-shell]].",
      "Placing secondary destinations (privacy, source, release notes) that do not belong in the header.",
      "Repeating a contact action for readers who reach the end of the page."
    ],
    avoidWhen: [
      "Closing a section inside the page: use [[cta]].",
      "An application's status or command bar: use [[mobile-action-bar]] or application patterns."
    ],
    characteristics: [
      "Main row items flex around 18rem and wrap; the action group does not grow.",
      "Footer navigation is a wrapping list of underlined links.",
      "The note is a wrapping mono line separated by a rule, spreading its parts to both ends when there is room.",
      "In print, footer actions are removed and the tone is flattened."
    ]
  },
  examples: [
    {
      id: "surface-product-footer",
      title: "Surface footer for a product site",
      description: "A product footer on the surface tone with an identity sentence, product links and a legal line. Links on the surface tone use primary text, which is validated for that background.",
      html: `<ef-site-footer class="ef-component-tag">
  <div class="ef-site">
    <footer class="ef-site-footer" data-ef-tone="surface">
      <div class="ef-site-footer__inner">
        <div class="ef-site-footer__main">
          <div><p class="ef-eyebrow">Echelon / Dokimos</p><p>Longitudinal quality evidence for every change.</p></div>
        </div>
        <nav class="ef-site-footer__nav" aria-label="Dokimos footer"><ul><li><a href="#site-footer-surface-product-footer-note">Documentation</a></li><li><a href="#site-footer-surface-product-footer-note">Release notes</a></li><li><a href="#site-footer-surface-product-footer-note">Source</a></li><li><a href="#site-footer-surface-product-footer-note">Privacy</a></li></ul></nav>
        <p class="ef-site-footer__note" id="site-footer-surface-product-footer-note"><span>&copy; 2026 Echelon Foundry</span><span>Version 1.4.0</span></p>
      </div>
    </footer>
  </div>
</ef-site-footer>`
    },
    {
      id: "legal-only",
      title: "Minimal legal footer",
      description: "A single-offer page footer with only the note line on the inverse tone. The note's rule and spacing still separate it from the page.",
      html: `<ef-site-footer class="ef-component-tag">
  <div class="ef-site">
    <footer class="ef-site-footer" data-ef-tone="inverse">
      <div class="ef-site-footer__inner">
        <p class="ef-site-footer__note"><span>&copy; 2026 Echelon Foundry</span><span>Indianapolis, Indiana</span><span>Built with Forma</span></p>
      </div>
    </footer>
  </div>
</ef-site-footer>`
    },
    {
      id: "mobile-full-footer",
      title: "Phone footer with action and links",
      description: "The full footer at phone width: identity, a contact action, secondary navigation and the note.",
      mobile: {
        height: 520,
        notes: [
          "The identity block and action group wrap into a single column; the action keeps a 44px minimum target.",
          "Footer links wrap onto several lines and are at least 24px tall, with horizontal and vertical gaps between them.",
          "The note's parts stack at the inline start instead of spreading to both ends.",
          "Gutters are fluid, so nothing scrolls horizontally at 320px in either orientation."
        ]
      },
      html: `<ef-site-footer class="ef-component-tag">
  <div class="ef-site">
    <footer class="ef-site-footer" data-ef-tone="inverse">
      <div class="ef-site-footer__inner">
        <div class="ef-site-footer__main">
          <div><p class="ef-eyebrow">Echelon Foundry</p><p>Strategy, architecture and delivery for consequential systems.</p></div>
          <div class="ef-actions"><a class="ef-button" href="#site-footer-mobile-full-footer-note">Schedule a working session</a></div>
        </div>
        <nav class="ef-site-footer__nav" aria-label="Echelon Foundry footer"><ul><li><a href="#site-footer-mobile-full-footer-note">Research</a></li><li><a href="#site-footer-mobile-full-footer-note">Products</a></li><li><a href="#site-footer-mobile-full-footer-note">Privacy</a></li><li><a href="#site-footer-mobile-full-footer-note">Source</a></li></ul></nav>
        <p class="ef-site-footer__note" id="site-footer-mobile-full-footer-note"><span>&copy; 2026 Echelon Foundry</span><span>Indianapolis, Indiana</span></p>
      </div>
    </footer>
  </div>
</ef-site-footer>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "nav.ef-site-footer__nav", values: "string", default: "—", description: "Names the footer navigation differently from the primary navigation." }
    ],
    hooks: {
      "ef-site-footer": "Footer root. Takes `margin-block-start: auto` so it sits at the bottom of the shell on short pages.",
      "data-ef-tone": "Surface tone of the footer: normally `inverse`; `surface` and `elevated` also work. Sets background and all text, link and rule colors.",
      "ef-site-footer__inner": "Centers content to the maximum layout width with fluid gutters and generous block padding.",
      "ef-site-footer__main": "Wrapping row for the identity block and optional action group; items flex around 18rem, actions do not grow.",
      "ef-site-footer__nav": "Secondary navigation; its `ul` becomes a wrapping, unstyled row of links with a 24px minimum height.",
      "ef-site-footer__note": "Legal or location line in the mono label size, separated by a rule; its `span` parts wrap and spread apart."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the footer action and links in source order." },
      { keys: "Enter", action: "Follows the focused link (native link behavior)." }
    ],
    events: []
  },
  states: [
    { name: "Inverse", how: "data-ef-tone=\"inverse\"", description: "Inverse surface; buttons invert their action colors." },
    { name: "Surface", how: "data-ef-tone=\"surface\"", description: "Secondary surface; links use primary text." },
    { name: "Forced colors", how: "@media (forced-colors: active)", description: "The toned footer gets a CanvasText border so it stays delineated." },
    { name: "Print", how: "@media print", description: "Footer actions are hidden and the background is removed." }
  ],
  accessibility: {
    forma: [
      "Uses contrast-validated tone pairs for text, links and the muted note on every tone.",
      "Keeps footer links underlined and at least 24px tall, and keeps the shell's focus ring visible on inverse.",
      "Keeps the footer in source order after main at every width."
    ],
    consumer: [
      "Use a `footer` element at the page level so it is exposed as contentinfo.",
      "Label the footer navigation distinctly from the primary navigation.",
      "Keep footer actions secondary; do not add a second primary action."
    ]
  },
  responsive: [
    "Main row, navigation list and note are wrapping flex rows; no breakpoints.",
    "Inner width is capped at `--ef-layout-width-max` with fluid gutters.",
    "Main row items have an 18rem basis and shrink, so they never force overflow."
  ],
  motion: [
    "No animation in the footer itself. A button in the action group interpolates color on hover only, and not under reduced motion."
  ],
  guidance: {
    do: [
      "Repeat identity in one sentence and link legal and source pages.",
      "Use the same footer on every page of a site."
    ],
    avoid: [
      "Duplicating the full primary navigation.",
      "Putting required information only in the footer."
    ]
  },
  related: [
    { slug: "site-header", note: "Holds identity and primary destinations at the top." },
    { slug: "marketing-shell", note: "The frame that places the footer after main." },
    { slug: "cta", note: "Closing action inside the page content." }
  ]
};
