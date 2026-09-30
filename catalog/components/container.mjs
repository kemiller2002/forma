export default {
  name: "Container",
  category: "layout",
  behavior: "Native CSS",
  summary: "Marketing-layer width container (narrow, default, wide, max) with a breakout escape for full-bleed media.",
  owns: ["ef-container","ef-breakout"],
  purpose: {
    description: "A container centers a region and caps its width at one of four token-defined sizes: narrow (45rem) for reading, standard (64rem, the default) for mixed content, wide (75rem) for grids, and max (90rem) for the full page frame. The page background and any tonal band stay full width while the content inside lines up on a shared set of widths. `ef-breakout` is the companion for regions that should use the full available width, such as a wide figure or table placed between narrow text containers. Both are marketing-layer primitives whose widths come from the site's layout role tokens, so place them inside `.ef-site`.",
    useWhen: [
      "Regions of a site page should align to a small set of consistent content widths.",
      "Reading content (legal text, articles, forms) should stay narrow while the page background runs edge to edge.",
      "A wide figure, chart or table between narrow text blocks should use the full page width."
    ],
    avoidWhen: [
      "You only need to cap line length of text inside a panel: use [[measure]].",
      "The content is long-form article text: use [[prose]], which includes the reading measure and rhythm.",
      "You are laying out an application view: containers are a site-page tool; use the application's shell such as [[workspace-shell]]."
    ],
    characteristics: [
      "Width is `min(100%, var(--ef-container-width))`, centered with automatic inline margins.",
      "The container adds no padding; the page gutter comes from `.ef-site__main` in the [[marketing-shell]].",
      "`ef-breakout` widens only relative to its own parent: use it as a sibling of containers, not inside one."
    ]
  },
  examples: [
    {
      id: "narrow-article-wide-figure",
      title: "Narrow article with a wide figure",
      description: "Two narrow containers of reading text with an `ef-breakout` figure between them. The figure spans the full available width while the text keeps its reading width, and all three share one source order.",
      html: `<ef-container class="ef-component-tag">
  <div class="ef-site">
    <div class="ef-container" data-ef-width="narrow">
      <h2>How replication works</h2>
      <p>Every write is committed in the primary zone and then copied to two others before it is acknowledged.</p>
    </div>
    <figure class="ef-breakout ef-frame" style="--ef-frame-ratio: 3 / 1">
      <div class="ef-frame__media"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1500' height='500'%3E%3Crect width='100%25' height='100%25' fill='%23c9c4b8'/%3E%3C/svg%3E" alt="Diagram of three availability zones connected in a ring"></div>
      <figcaption>Writes travel around the ring before acknowledgement.</figcaption>
    </figure>
    <div class="ef-container" data-ef-width="narrow">
      <p>If a zone is lost, the remaining two continue serving reads and writes without a manual failover.</p>
    </div>
  </div>
</ef-container>`
    },
    {
      id: "wide-grid-region",
      title: "Wide container for a card grid",
      description: "A `data-ef-width=\"wide\"` container holding a card grid. The grid gets more columns than a standard container would allow while staying aligned with other wide regions on the page.",
      html: `<ef-container class="ef-component-tag">
  <div class="ef-site">
    <div class="ef-container" data-ef-width="wide">
      <ul class="ef-card-grid" data-ef-columns="3" aria-label="Integrations">
        <li><article class="ef-card"><h2 class="ef-card__title">Git hosting</h2><p>Deploy on every merge to main.</p></article></li>
        <li><article class="ef-card"><h2 class="ef-card__title">Chat</h2><p>Post deploy results to a channel.</p></article></li>
        <li><article class="ef-card"><h2 class="ef-card__title">Issue tracker</h2><p>Link releases to resolved issues.</p></article></li>
      </ul>
    </div>
  </div>
</ef-container>`
    },
    {
      id: "custom-width",
      title: "Custom width for a sign-up form",
      description: "A form container narrower than the narrow preset, set with `--ef-container-width: 28rem`. It stays centered and still shrinks to 100% on small screens.",
      html: `<ef-container class="ef-component-tag">
  <div class="ef-site">
    <form class="ef-container ef-stack" style="--ef-container-width: 28rem" aria-labelledby="container-custom-width-title">
      <h2 id="container-custom-width-title">Join the beta</h2>
      <div class="ef-field">
        <label class="ef-field__label" for="container-custom-width-email">Work email</label>
        <input id="container-custom-width-email" name="email" type="email" autocomplete="email" required>
      </div>
      <div class="ef-cluster"><button type="submit">Request access</button></div>
    </form>
  </div>
</ef-container>`
    },
    {
      id: "mobile-container",
      title: "Mobile page width",
      description: "Narrow and standard containers at phone width. Every preset is wider than the screen, so each resolves to 100% and the page gutter alone controls the edges.",
      mobile: {
        height: 420,
        notes: [
          "All presets are at least 45rem, so on phones `min(100%, …)` makes every container full width.",
          "The container adds no padding; the side gutter comes from `.ef-site__main` in a full page (the preview here has none).",
          "`ef-breakout` is also 100% on phones, so wide figures fall back to the column width; put wide tables in [[bounded-overflow]].",
          "Landscape tablets may show the narrow preset at its full 45rem with centered margins."
        ]
      },
      html: `<ef-container class="ef-component-tag">
  <div class="ef-site">
    <div class="ef-container" data-ef-width="narrow">
      <h2>Terms of service</h2>
      <p>These terms apply to every workspace created after 1 September 2026.</p>
    </div>
    <div class="ef-container">
      <p><a href="#previous-terms">Read the previous terms</a></p>
    </div>
  </div>
</ef-container>`
    }
  ],
  api: {
    attributes: [
      { name: "data-ef-width", on: ".ef-container", values: "narrow | wide | max", default: "absent (standard, 64rem)", description: "Selects a width preset from the layout role tokens." },
      { name: "style", on: ".ef-container / .ef-breakout", values: "--ef-container-width / --ef-breakout-max / --ef-frame-ratio", default: "—", description: "Per-instance width override, or the frame ratio in the figure example." },
      { name: "aria-labelledby", on: "form", values: "id of the heading", default: "—", description: "Names the sign-up form by its heading." },
      { name: "data-ef-columns", on: ".ef-card-grid", values: "3", default: "—", description: "Card grid column preference, used in the wide container example." },
      { name: "aria-label", on: ".ef-card-grid", values: "string", default: "—", description: "Names the card collection." }
    ],
    hooks: {
      "ef-container": "Centered region capped at `--ef-container-width` (falls back to `--ef-layout-width-standard`).",
      "ef-breakout": "Region at `min(100%, --ef-breakout-max)` with `max-inline-size: none`. Not centered by itself; place it directly in the page's main region beside containers.",
      "data-ef-width": "`narrow` = `--ef-layout-width-narrow` (45rem), `wide` = `--ef-layout-width-wide` (75rem), `max` = `--ef-layout-width-max` (90rem).",
      "--ef-container-width": "Maximum width of the container. Set by `data-ef-width`, or directly for a custom width.",
      "--ef-breakout-max": "Maximum width of a breakout region. Default 90rem.",
      "--ef-layout-width-standard": "Site role token for the default container width (64rem by default); themes may retarget it."
    },
    keyboard: [],
    events: [],
    form: "Not a form control. A form can be a container."
  },
  states: [
    { name: "Standard", how: "no data-ef-width", description: "Capped at 64rem and centered." },
    { name: "Narrow / wide / max", how: "data-ef-width", description: "Capped at 45rem, 75rem or 90rem and centered." },
    { name: "Fluid", how: "parent narrower than the cap", description: "100% of the parent." }
  ],
  accessibility: {
    forma: [
      "Width constraints only; no roles, landmarks or order changes.",
      "Narrow widths keep reading regions at a comfortable line length.",
      "Caps are clamped to 100%, so containers never cause horizontal scrolling at 320px or 400% zoom."
    ],
    consumer: [
      "Keep one source order for text and wide regions; do not reorder to fit the width system.",
      "Use headings inside containers to structure the page; containers are not landmarks.",
      "Provide alt text and captions for breakout media."
    ]
  },
  responsive: [
    "Intrinsic: each container is `min(100%, cap)`, so presets collapse to full width on narrow screens without breakpoints.",
    "Widths come from site role tokens; a theme can retarget them without changing markup.",
    "`ef-breakout` does not escape an ancestor container; it is only as wide as its parent allows.",
    "Container widths are fixed rem values that scale with the user's root font size."
  ],
  motion: [
    "No animation: widths are static."
  ],
  guidance: {
    do: [
      "Use narrow for reading, standard for mixed content, wide for grids and max only for full-frame regions.",
      "Keep text and its wide media as siblings in the page flow."
    ],
    avoid: [
      "Nesting containers to fine-tune width; set `--ef-container-width` instead.",
      "Putting `ef-breakout` inside a narrow container and expecting it to widen."
    ]
  },
  related: [
    { slug: "measure", note: "Caps line length of text anywhere, without centering or site tokens." },
    { slug: "section", note: "Vertical spacing and tone for page regions that contain containers." },
    { slug: "marketing-shell", note: "Page frame whose main region supplies the gutter and 90rem maximum." },
    { slug: "prose", note: "Long-form reading content with measure and rhythm." }
  ]
};
