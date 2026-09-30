export default {
  name: "Skeleton",
  category: "feedback",
  behavior: "Application state",
  summary: "Low-information loading placeholder with explicit busy semantics; its shimmer is a named cadence that runs only while aria-busy is true and stops for reduced motion.",
  purpose: {
    description: "A skeleton holds the approximate shape of content that is still loading, so the layout does not jump when the content arrives. Forma renders a bordered region of neutral bars; title and short modifiers vary their length. The region carries `aria-busy=\"true\"` and a text label while loading, and the shimmer runs only while that attribute is true. The application replaces the skeleton with real content (or an empty, error or unknown state) when it has an answer.",
    useWhen: [
      "A card, panel or list is loading and its approximate layout is known.",
      "Content arrives in a few hundred milliseconds to a few seconds and a layout shift would be disruptive.",
      "Several regions load independently and each needs its own placeholder."
    ],
    avoidWhen: [
      "The wait is for an action the user just took, such as saving: use [[spinner]] with a label naming the action.",
      "The amount of work is known: use [[progress-bar]].",
      "Loading has finished with no data: use [[empty-state]]. A skeleton must never stand in for empty or failed content."
    ],
    characteristics: [
      "Bars carry no information; the region's label is the only content.",
      "The shimmer uses the shared cadence `--ef-motion-cadence-period` (1600ms), linear, identical for every line.",
      "Setting `aria-busy=\"false\"` stops the shimmer, and a static skeleton remains a valid presentation."
    ]
  },
  examples: [
    {
      id: "labelled-panel",
      title: "Panel with a known heading",
      description: "The panel heading is already known, so it is rendered as real text and names the busy region with `aria-labelledby`. Only the body is a placeholder, and the visually hidden text says what is loading.",
      html: `<ef-skeleton class="ef-component-tag">
  <section class="ef-skeleton" aria-busy="true" aria-labelledby="skeleton-labelled-panel-title">
    <h3 id="skeleton-labelled-panel-title">Recent activity</h3>
    <span class="ef-visually-hidden">Loading recent activity</span>
    <div class="ef-skeleton__line"></div>
    <div class="ef-skeleton__line ef-skeleton__line--short"></div>
    <div class="ef-skeleton__line"></div>
    <div class="ef-skeleton__line ef-skeleton__line--short"></div>
  </section>
</ef-skeleton>`
    },
    {
      id: "card-grid",
      title: "Card grid loading",
      description: "Three skeleton cards in a responsive [[grid]] while a dashboard loads. Each card is its own busy region, so the application can replace them one by one as data arrives.",
      html: `<ef-skeleton class="ef-component-tag">
  <div class="ef-grid">
    <section class="ef-skeleton" aria-busy="true" aria-label="Loading revenue">
      <div class="ef-skeleton__line ef-skeleton__line--title"></div>
      <div class="ef-skeleton__line ef-skeleton__line--short"></div>
    </section>
    <section class="ef-skeleton" aria-busy="true" aria-label="Loading open invoices">
      <div class="ef-skeleton__line ef-skeleton__line--title"></div>
      <div class="ef-skeleton__line ef-skeleton__line--short"></div>
    </section>
    <section class="ef-skeleton" aria-busy="true" aria-label="Loading overdue balance">
      <div class="ef-skeleton__line ef-skeleton__line--title"></div>
      <div class="ef-skeleton__line ef-skeleton__line--short"></div>
    </section>
  </div>
</ef-skeleton>`
    },
    {
      id: "stalled-load",
      title: "Stalled load with explanation",
      description: "Loading is taking longer than expected. The application sets `aria-busy=\"false\"` so the shimmer stops, and shows a plain text note with a retry action instead of letting the placeholder shimmer indefinitely.",
      html: `<ef-skeleton class="ef-component-tag">
  <section class="ef-skeleton" aria-busy="false" aria-labelledby="skeleton-stalled-load-title">
    <h3 id="skeleton-stalled-load-title">Customer history</h3>
    <div class="ef-skeleton__line"></div>
    <div class="ef-skeleton__line ef-skeleton__line--short"></div>
    <p>This is taking longer than usual. The request is still open.</p>
    <button type="button">Try again</button>
  </section>
</ef-skeleton>`
    },
    {
      id: "mobile-message-list",
      title: "Mobile message list",
      description: "A list placeholder at phone width.",
      mobile: {
        height: 300,
        notes: [
          "Lines are percentage widths (100%, 72% short, 55% title), so they scale with the screen instead of overflowing.",
          "The region fills the container width; no horizontal scrolling at 320px.",
          "Keep the skeleton roughly the height of the expected content, so arriving content does not push the rest of the page down on a small screen.",
          "There are no touch targets inside a skeleton; any action is added only when loading stalls or fails."
        ]
      },
      html: `<ef-skeleton class="ef-component-tag">
  <section class="ef-skeleton" aria-busy="true" aria-label="Loading messages">
    <span class="ef-visually-hidden">Loading messages</span>
    <div class="ef-skeleton__line ef-skeleton__line--title"></div>
    <div class="ef-skeleton__line"></div>
    <div class="ef-skeleton__line ef-skeleton__line--short"></div>
    <div class="ef-skeleton__line ef-skeleton__line--title"></div>
    <div class="ef-skeleton__line"></div>
    <div class="ef-skeleton__line ef-skeleton__line--short"></div>
  </section>
</ef-skeleton>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-busy", on: "section.ef-skeleton", values: "true | false", default: "—", description: "Marks the region as loading. The shimmer runs only while it is true." },
      { name: "aria-label", on: "section.ef-skeleton", values: "string", default: "—", description: "Names the busy region when no visible heading exists (\"Loading content\")." },
      { name: "aria-labelledby", on: "section.ef-skeleton", values: "id of a visible heading", default: "—", description: "Names the region from a real heading when the heading is already known." }
    ],
    hooks: {
      "ef-skeleton": "Root region: a bordered grid of placeholder lines.",
      "ef-skeleton__line": "A full-width 0.9rem neutral bar with a shimmer gradient.",
      "ef-skeleton__line--title": "Taller (1.4rem) and 55% wide, standing in for a heading.",
      "ef-skeleton__line--short": "72% wide, standing in for the last line of a paragraph.",
      "aria-busy": "The shimmer selector: `.ef-skeleton[aria-busy=\"true\"]` animates its lines; any other value leaves them static."
    },
    keyboard: [
      { keys: "—", action: "A skeleton has no focusable content. Do not put interactive placeholders inside it." }
    ],
    events: [
      { name: "—", description: "None. The application replaces the skeleton or changes `aria-busy`." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Loading", how: "aria-busy=\"true\"", description: "Lines shimmer at the shared cadence." },
    { name: "Static", how: "aria-busy=\"false\" or absent", description: "Lines stay in place without motion. Use when loading has stalled, or replace the skeleton entirely." },
    { name: "Reduced motion", how: "prefers-reduced-motion: reduce", description: "The shimmer is removed; the busy semantics and label remain." }
  ],
  accessibility: {
    forma: [
      "Ties the shimmer to `aria-busy`, so the visual activity and the exposed busy state cannot disagree.",
      "Stops the shimmer under reduced motion.",
      "Keeps placeholder bars free of text, so nothing meaningless is announced."
    ],
    consumer: [
      "Label the region with `aria-label`, `aria-labelledby`, or visually hidden text that says what is loading. Avoid giving it the same text twice, which some screen readers read twice.",
      "Replace the skeleton with real content, an [[empty-state]], or an error; never leave it indefinitely.",
      "Move focus only if the user was focused inside the region being replaced."
    ]
  },
  responsive: [
    "Lines use percentage widths, so the skeleton scales to any container.",
    "No breakpoints; place skeletons inside the same layout primitives ([[grid]], [[stack]]) that the real content will use.",
    "Match the expected content height roughly to limit layout shift when content arrives."
  ],
  motion: [
    "While `aria-busy=\"true\"`, each line's gradient moves across it once per `--ef-motion-cadence-period` (1600ms), linear and infinite: constant-velocity cadence with no bounce.",
    "Every line shares the same period, so no part of the placeholder appears faster or more important.",
    "The shimmer stops as soon as `aria-busy` is no longer true.",
    "Under `prefers-reduced-motion: reduce` the animation is removed and the lines are static."
  ],
  guidance: {
    do: [
      "Approximate the real layout: a title line, a few body lines, a short last line.",
      "Replace skeletons as each piece of content arrives rather than waiting for everything."
    ],
    avoid: [
      "Showing a skeleton for data that has already failed to load.",
      "Skeletons for waits under a few hundred milliseconds, which only add flicker."
    ]
  },
  related: [
    { slug: "spinner", note: "Labelled indeterminate activity for an action rather than a content region." },
    { slug: "empty-state", note: "What replaces the skeleton when loading finishes with no data." },
    { slug: "progress-bar", note: "Use when the amount of work is known." }
  ]
};
