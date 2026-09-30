export default {
  name: "Section heading",
  category: "site",
  behavior: "Site content",
  summary: "Labels a page section with an eyebrow, heading, framing sentence, and optional aside that wraps on narrow screens.",
  purpose: {
    description: "A section heading is the `header` of a marketing page section. `.ef-section-heading__text` carries an optional eyebrow, the section's `h2` and an optional framing sentence; `.ef-section-heading__aside` holds a secondary link, button or short note. A strong rule under the heading separates it from the section's content. It is presentation only; the heading level and the section's accessible name come from the markup.",
    useWhen: [
      "Introducing a section of a marketing or product page (services, capabilities, method, proof).",
      "The section needs a short framing sentence or a secondary action beside its title.",
      "Several sections on a page should share the same heading rhythm."
    ],
    avoidWhen: [
      "Opening the page: use [[hero]].",
      "Headings inside a long-form article: use plain headings in [[prose]].",
      "Titling an application panel or record: use [[record-header]] or a plain heading."
    ],
    characteristics: [
      "The text group grows first (basis 32rem, minimum 20rem or full width); the aside flexes around 14rem and is capped at 28rem.",
      "Heading and aside align to their bottom edges when side by side.",
      "Inside `.ef-section`, content directly after the heading starts without extra stack spacing because the heading already ends in a rule and margin."
    ]
  },
  examples: [
    {
      id: "with-note",
      title: "Heading with an update note",
      description: "The aside carries a short mono note (`.ef-section-heading__note`) instead of an action, for example when the section's content was last reviewed. The note is text, not a link.",
      html: `<ef-section-heading class="ef-component-tag">
  <div class="ef-site">
    <section class="ef-section" aria-labelledby="section-heading-with-note-title">
      <header class="ef-section-heading">
        <div class="ef-section-heading__text">
          <p class="ef-eyebrow">Published work</p>
          <h2 id="section-heading-with-note-title">Research the practice depends on</h2>
          <p>Each paper states its question, method and limits before its conclusion.</p>
        </div>
        <div class="ef-section-heading__aside"><p class="ef-section-heading__note">Updated September 2026</p></div>
      </header>
      <p>Twelve papers across four research areas.</p>
    </section>
  </div>
</ef-section-heading>`
    },
    {
      id: "title-only",
      title: "Title only, followed by cards",
      description: "The smallest useful heading: eyebrow and title with no framing sentence or aside, directly followed by a card grid. The grid starts right after the heading rule.",
      html: `<ef-section-heading class="ef-component-tag">
  <div class="ef-site">
    <section class="ef-section" aria-labelledby="section-heading-title-only-title">
      <header class="ef-section-heading">
        <div class="ef-section-heading__text">
          <p class="ef-eyebrow">Capabilities</p>
          <h2 id="section-heading-title-only-title">What the product does</h2>
        </div>
      </header>
      <ul class="ef-card-grid" data-ef-columns="2" aria-label="Capabilities">
        <li><article class="ef-card"><h3 class="ef-card__title">Record quality over time</h3><p>Each change adds evidence.</p></article></li>
        <li><article class="ef-card"><h3 class="ef-card__title">Explain regressions</h3><p>Every movement links to its cause.</p></article></li>
      </ul>
    </section>
  </div>
</ef-section-heading>`
    },
    {
      id: "mobile-long-title",
      title: "Long title with an action on a phone",
      description: "A long heading with a framing sentence and an action. At phone width the aside wraps under the text and the button starts at the inline start.",
      mobile: {
        height: 420,
        notes: [
          "The text group needs at least 20rem (or the full width when narrower), so the aside wraps below it on phones.",
          "Headings balance their line breaks and wrap; the h2 keeps an 18ch maximum so lines stay short on any width.",
          "The action button in the aside keeps a 44px minimum target and its label wraps if it is longer than the line.",
          "Rotation only changes whether text and aside share a row; source order is unchanged."
        ]
      },
      html: `<ef-section-heading class="ef-component-tag">
  <div class="ef-site">
    <section class="ef-section" aria-labelledby="section-heading-mobile-long-title-title">
      <header class="ef-section-heading">
        <div class="ef-section-heading__text">
          <p class="ef-eyebrow">Service lines</p>
          <h2 id="section-heading-mobile-long-title-title">Diagnosis, constraint modelling and verification for consequential systems</h2>
          <p>Three engagements that can run alone or in sequence.</p>
        </div>
        <div class="ef-section-heading__aside"><a class="ef-button" href="#section-heading-mobile-long-title-title">Compare the engagements</a></div>
      </header>
    </section>
  </div>
</ef-section-heading>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-section", values: "id of the h2", default: "—", description: "Names the section by its visible heading." },
      { name: "id", on: "h2", values: "string", default: "—", description: "Referenced by the section's aria-labelledby." }
    ],
    hooks: {
      "ef-section-heading": "Root, normally a `header` inside a section. Wrapping flex row with a strong bottom rule and bottom spacing.",
      "ef-section-heading__text": "Eyebrow, heading and framing sentence. Grows first with a 32rem basis and a 20rem (or 100%) minimum.",
      "ef-section-heading__aside": "Optional secondary action or note. Flex basis 14rem, capped at 28rem.",
      "ef-section-heading__note": "Short muted note in the mono label size, for dates or counts shown in the aside."
    },
    keyboard: [
      { keys: "Tab", action: "Reaches any link or button in the aside in source order, after the heading text." }
    ],
    events: []
  },
  states: [
    { name: "Side by side", how: "enough inline space", description: "Text and aside share one row, aligned to the bottom." },
    { name: "Wrapped", how: "flex-wrap", description: "The aside moves below the text on narrow widths." },
    { name: "Text only", how: "omit .ef-section-heading__aside", description: "The text group takes the full width." }
  ],
  accessibility: {
    forma: [
      "Keeps source order at every width; nothing is reordered visually.",
      "Uses text and rules, not color, to separate the heading from content; muted text stays AA on every tone."
    ],
    consumer: [
      "Use a real heading element at the right level (normally `h2`) and name the section with `aria-labelledby`.",
      "Keep the aside secondary: a link or ordinary button, not a second primary action."
    ]
  },
  responsive: [
    "Content-driven wrapping with flex bases; no breakpoints.",
    "The text group's minimum is `min(100%, 20rem)`, so it never forces horizontal overflow.",
    "Framing sentences keep the reading measure."
  ],
  motion: [
    "No animation: the section heading is static. A button in the aside interpolates color on hover only, and not under reduced motion."
  ],
  guidance: {
    do: [
      "Name the section in plain language; use the eyebrow for its category.",
      "Keep the framing sentence to one line of intent."
    ],
    avoid: [
      "Putting the section's main content or a primary action in the aside.",
      "Using the eyebrow as the only heading."
    ]
  },
  related: [
    { slug: "hero", note: "The page's first region, with the h1 and primary action." },
    { slug: "section", note: "The section wrapper that provides rhythm and tone." },
    { slug: "text-roles", note: "The eyebrow role used above the heading." }
  ]
};
