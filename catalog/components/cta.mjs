export default {
  name: "Call to action",
  category: "site",
  behavior: "Site content",
  summary: "Closing call to action with one primary action, optionally on an inverse surface tone.",
  purpose: {
    description: "The call to action closes a page or a major section with a heading, a sentence of motivation and a group of actions, one of them primary. `.ef-cta__text` holds the eyebrow, `h2` and sentence; an `.ef-actions` group follows it. On the page tone a strong rule sits above the block; with a non-page `data-ef-tone` the block becomes a padded panel without the rule. Actions are ordinary links or buttons: where they lead is the site's decision.",
    useWhen: [
      "Ending a marketing or product page with the next step most readers should take.",
      "Closing a long section with a clear action before the page continues.",
      "The action should stand out from the page, for example on the inverse tone."
    ],
    avoidWhen: [
      "Opening the page: the [[hero]] carries the first primary action.",
      "Reporting status or asking for confirmation: use [[alert]] or [[dialog]].",
      "An inline supporting remark inside an article: use [[callout]]."
    ],
    characteristics: [
      "Text grows first (basis 32rem, minimum 20rem or full width); actions sit beside it when there is room and wrap below it otherwise.",
      "Actions start at the inline start when wrapped, so they follow the text's reading edge.",
      "Primary buttons use the tone's action colors, so they invert correctly on the inverse tone."
    ]
  },
  examples: [
    {
      id: "page-tone",
      title: "Page-tone closing action",
      description: "Without a tone the CTA sits on the page background with a strong rule above it. One primary action and one secondary action.",
      html: `<ef-cta class="ef-component-tag">
  <div class="ef-site">
    <section class="ef-section" aria-labelledby="cta-page-tone-title">
      <div class="ef-cta">
        <div class="ef-cta__text">
          <h2 id="cta-page-tone-title">Start with a pinned Forma release</h2>
          <p>Every site consumes the same versioned presentation layer.</p>
        </div>
        <div class="ef-actions"><a class="ef-button" data-ef-variant="primary" href="#cta-page-tone-title">Install</a><a class="ef-button" href="#cta-page-tone-title">Read the upgrade guide</a></div>
      </div>
    </section>
  </div>
</ef-cta>`
    },
    {
      id: "surface-single-action",
      title: "Surface panel with a single action",
      description: "`data-ef-tone=\"surface\"` turns the CTA into a padded panel on the secondary surface. Links and labels switch to text colors validated for that surface.",
      html: `<ef-cta class="ef-component-tag">
  <div class="ef-site">
    <section class="ef-section" aria-labelledby="cta-surface-single-action-title">
      <div class="ef-cta" data-ef-tone="surface">
        <div class="ef-cta__text">
          <p class="ef-eyebrow">Research digest</p>
          <h2 id="cta-surface-single-action-title">Get new papers when they are published</h2>
          <p>One email per paper. No tracking. <a href="#cta-surface-single-action-title">Read past issues</a>.</p>
        </div>
        <div class="ef-actions"><a class="ef-button" data-ef-variant="primary" href="#cta-surface-single-action-title">Subscribe</a></div>
      </div>
    </section>
  </div>
</ef-cta>`
    },
    {
      id: "mobile-inverse",
      title: "Phone inverse CTA",
      description: "An inverse-tone CTA at phone width. The actions wrap below the text and stack.",
      mobile: {
        height: 460,
        notes: [
          "Text needs at least 20rem (or the full width), so actions wrap below it on phones and start at the inline start.",
          "Each button keeps a 44px minimum target; two buttons stack when they do not fit side by side.",
          "The toned panel's padding comes from the fluid block-space token and shrinks at narrow widths.",
          "The heading wraps and balances its lines; nothing scrolls horizontally at 320px."
        ]
      },
      html: `<ef-cta class="ef-component-tag">
  <div class="ef-site">
    <section class="ef-section" aria-labelledby="cta-mobile-inverse-title">
      <div class="ef-cta" data-ef-tone="inverse">
        <div class="ef-cta__text">
          <p class="ef-eyebrow">Start here</p>
          <h2 id="cta-mobile-inverse-title">Bring the problem that matters</h2>
          <p>A first conversation costs nothing and ends with a clear next step.</p>
        </div>
        <div class="ef-actions"><a class="ef-button" data-ef-variant="primary" href="#cta-mobile-inverse-title">Start a diagnostic</a><a class="ef-button" href="#cta-mobile-inverse-title">Meet the team</a></div>
      </div>
    </section>
  </div>
</ef-cta>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section", values: "id of the CTA heading", default: "—", description: "Names the section that contains the CTA." }
    ],
    hooks: {
      "ef-cta": "Root: a wrapping flex row of text and actions, with a strong top rule on the page tone.",
      "ef-cta__text": "Eyebrow, heading and sentence. Grows first with a 32rem basis and a 20rem (or 100%) minimum.",
      "data-ef-tone": "`surface`, `elevated` or `inverse` on `.ef-cta` sets that surface, pads the block on all sides and removes the top rule. `page` or no tone keeps the rule."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through any links in the text, then the actions, in source order." },
      { keys: "Enter", action: "Follows the focused link; a `button` also activates with Space." }
    ],
    events: []
  },
  states: [
    { name: "Page tone", how: "no data-ef-tone", description: "Strong top rule on the page background." },
    { name: "Toned panel", how: "data-ef-tone=\"surface|elevated|inverse\"", description: "Padded panel on that surface; primary action colors invert on inverse." },
    { name: "Wrapped", how: "flex-wrap", description: "Actions move below the text." }
  ],
  accessibility: {
    forma: [
      "Uses contrast-validated tone pairs for text, links and both button variants on every tone.",
      "Keeps 44px button targets and the shell's visible focus ring, which remains visible on inverse.",
      "Borders toned panels in forced colors so they stay delineated."
    ],
    consumer: [
      "Use one `data-ef-variant=\"primary\"` action per CTA.",
      "Write action labels that name the outcome (\"Start a diagnostic\"), not \"Click here\".",
      "Give the CTA a real heading at the right level."
    ]
  },
  responsive: [
    "Content-driven wrapping; no breakpoints.",
    "The text minimum is `min(100%, 20rem)`, so the CTA never forces horizontal overflow.",
    "Toned panels use fluid padding."
  ],
  motion: [
    "The CTA itself does not animate. Its buttons interpolate background and text color on hover over the shared perceptual duration (about 120ms), without moving.",
    "Under reduced motion the button color change is instant."
  ],
  guidance: {
    do: [
      "End a page with one CTA that repeats or advances the hero's primary action.",
      "Keep secondary actions as default buttons so the primary stays clear."
    ],
    avoid: [
      "Stacking several CTAs in a row.",
      "Using tone to signal urgency or importance."
    ]
  },
  related: [
    { slug: "hero", note: "Opens the page with the first primary action." },
    { slug: "button", note: "The actions inside the CTA." },
    { slug: "section", note: "Provides section rhythm around the CTA." }
  ]
};
