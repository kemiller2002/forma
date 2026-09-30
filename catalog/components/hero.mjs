export default {
  name: "Hero",
  category: "site",
  behavior: "Site content",
  summary: "A page's first region: one promise, one primary action, and optional supporting context that stacks below it in source order.",
  purpose: {
    description: "The hero is the first section inside the marketing shell's main region and carries the page's one primary recognition path: what this is, why it matters, and the action most visitors should take. `.ef-hero__content` holds the eyebrow, the page title (the page's only `h1`), a lead and actions; the optional `.ef-hero__aside` holds supporting context such as a statement, facts or badges. The two regions sit side by side when there is room and wrap into source order when there is not.",
    useWhen: [
      "Opening a marketing, product or single-offer page with one clear promise.",
      "The promise needs supporting proof (facts, a statement, release badges) that can follow it on narrow screens.",
      "The page has one primary action that should be the first strong call to action."
    ],
    avoidWhen: [
      "Opening a documentation article: use [[documentation-layout]] with a prose heading.",
      "Text must sit over photography or illustration: there is no scrim primitive yet (GAP-MKT-03), so text over imagery cannot be contrast-verified.",
      "Introducing a later section of the page: use [[section-heading]]."
    ],
    characteristics: [
      "Content takes the dominant share of the row (at least 55% when beside the aside); the aside flexes around 18 to 30rem.",
      "No CSS reordering: the aside always follows the content for reading, focus and print.",
      "A strong bottom rule closes the region; the regions align to their bottom edges when side by side.",
      "The title size comes from the heading level inside `.ef-site`; `.ef-hero__title` only sets its spacing."
    ]
  },
  examples: [
    {
      id: "product-release",
      title: "Product release hero",
      description: "A product page hero with release badges and actions in the content region and facts in the aside. On a real page the title is the `h1`; the catalog page already has one, so this specimen uses `h2`.",
      html: `<ef-hero class="ef-component-tag">
  <div class="ef-site">
    <section class="ef-hero" aria-labelledby="hero-product-release-title">
      <div class="ef-hero__content">
        <p class="ef-eyebrow">Product / Quality evidence</p>
        <h2 class="ef-hero__title" id="hero-product-release-title">Measure code health across every change</h2>
        <p class="ef-lead">Each commit adds evidence instead of replacing the last snapshot.</p>
        <ul class="ef-badge-list" aria-label="Release facts">
          <li><span class="ef-badge" data-ef-status="success">Stable</span></li>
          <li><span class="ef-badge">Version 1.4.0</span></li>
        </ul>
        <div class="ef-actions"><a class="ef-button" data-ef-variant="primary" href="#hero-product-release-title">Install</a><a class="ef-button" href="#hero-product-release-title">Read the documentation</a></div>
      </div>
      <div class="ef-hero__aside">
        <h3>At a glance</h3>
        <dl class="ef-facts">
          <div class="ef-facts__item"><dt>Longitudinal</dt><dd>Evidence across commits</dd></div>
          <div class="ef-facts__item"><dt>Deterministic</dt><dd>Same inputs, same report</dd></div>
        </dl>
      </div>
    </section>
  </div>
</ef-hero>`
    },
    {
      id: "promise-only",
      title: "Promise without supporting context",
      description: "A single-offer hero with no aside: eyebrow, title and one primary action. Without an aside the content region takes the full width and the lead keeps its narrow reading measure.",
      html: `<ef-hero class="ef-component-tag">
  <div class="ef-site">
    <section class="ef-hero" aria-labelledby="hero-promise-only-title">
      <div class="ef-hero__content">
        <p class="ef-eyebrow">Two-week diagnostic</p>
        <h2 class="ef-hero__title" id="hero-promise-only-title">Find the cause before you fund the fix</h2>
        <p class="ef-lead">A fixed-scope engagement that ends with a defensible root cause and a treatment plan.</p>
        <div class="ef-actions"><a class="ef-button" data-ef-variant="primary" href="#hero-promise-only-title">Book a working session</a></div>
      </div>
    </section>
  </div>
</ef-hero>`
    },
    {
      id: "mobile-stacked",
      title: "Phone hero with statement",
      description: "At phone width the statement in the aside moves below the promise and actions, keeping source order.",
      mobile: {
        height: 620,
        notes: [
          "The aside wraps below the content when the row cannot give the content at least 55% and the aside its minimum; there are no breakpoints.",
          "Reading, focus and print order stay content first, aside second, because nothing is reordered with CSS.",
          "Actions wrap onto separate lines and each button keeps a target of at least 44px.",
          "The fluid title and statement sizes shrink with the viewport and headings balance their line breaks, so long titles do not overflow at 320px."
        ]
      },
      html: `<ef-hero class="ef-component-tag">
  <div class="ef-site">
    <section class="ef-hero" aria-labelledby="hero-mobile-stacked-title">
      <div class="ef-hero__content">
        <p class="ef-eyebrow">Applied research</p>
        <h2 class="ef-hero__title" id="hero-mobile-stacked-title">State the promise before the proof</h2>
        <p class="ef-lead">What this is, why it matters, and the one action to take.</p>
        <div class="ef-actions"><a class="ef-button" data-ef-variant="primary" href="#hero-mobile-stacked-title">Book a working session</a><a class="ef-button" href="#hero-mobile-stacked-title">See the body of work</a></div>
      </div>
      <div class="ef-hero__aside">
        <blockquote class="ef-statement"><p>Observations stay separate from explanations until evidence removes the alternatives.</p></blockquote>
      </div>
    </section>
  </div>
</ef-hero>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-hero", values: "id of the hero title", default: "—", description: "Names the hero region by its title so it is exposed as a labelled region." },
      { name: "id", on: ".ef-hero__title", values: "string", default: "—", description: "Referenced by the section's aria-labelledby." }
    ],
    hooks: {
      "ef-hero": "Region root: a wrapping flex row with large top padding and a strong bottom rule. Requires an `.ef-site` ancestor.",
      "ef-hero__content": "Dominant region for eyebrow, title, lead, badges and actions. Grows first and keeps at least 55% of the row while side by side.",
      "ef-hero__aside": "Optional supporting region (statement, facts). Flexes around 18 to 30rem and wraps below the content when space runs out.",
      "ef-hero__title": "Spacing for the page title. Its size comes from the heading level; directly after an eyebrow its top margin is removed."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the hero's links and buttons in source order: content actions before anything in the aside." }
    ],
    events: []
  },
  states: [
    { name: "Side by side", how: "enough inline space", description: "Content and aside share one row, aligned to their bottom edges." },
    { name: "Stacked", how: "flex-wrap when space runs out", description: "The aside moves below the content in source order." },
    { name: "Without aside", how: "omit .ef-hero__aside", description: "Content spans the full width; the lead keeps its narrow measure." }
  ],
  accessibility: {
    forma: [
      "Never reorders content and aside visually, so reading and focus order match the visual order at every width.",
      "Uses rem and fluid type sizes with a rem term, so 200% text does not cause horizontal scrolling.",
      "Buttons inside keep 44px targets and the shell's visible focus ring."
    ],
    consumer: [
      "Use the hero title as the page's single `h1` and name the section with `aria-labelledby`.",
      "Offer exactly one `data-ef-variant=\"primary\"` action.",
      "Put information required to act in the content region, not only in the aside.",
      "Label lists of badges or facts, or precede them with a heading."
    ]
  },
  responsive: [
    "Content-driven recomposition with `flex-wrap`: no breakpoints.",
    "The content keeps `min(100%, 55%)` of the row; the aside's basis is `clamp(18rem, 32%, 30rem)` with no minimum, so it never forces overflow.",
    "Title, lead and statement use fluid sizes; the title's `max-inline-size` keeps lines short on wide screens."
  ],
  motion: [
    "No animation: the hero is static. Buttons inside interpolate color on hover only (removed under reduced motion)."
  ],
  guidance: {
    do: [
      "Write the title as one promise in plain language, followed by one lead sentence.",
      "Keep the aside to one kind of supporting evidence."
    ],
    avoid: [
      "Two primary actions, or a carousel of promises.",
      "Placing text over imagery until a scrim-backed media variant exists."
    ]
  },
  related: [
    { slug: "section-heading", note: "Introduces later sections of the page." },
    { slug: "facts", note: "Short claims often used in the hero aside." },
    { slug: "text-roles", note: "Eyebrow, lead and statement roles used inside the hero." },
    { slug: "split", note: "The general primary-plus-supporting layout for sections other than the hero." }
  ]
};
