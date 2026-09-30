import { missionById } from "../example-data/nasa-spaceflight.mjs";

const geminiIV = missionById("gemini-iv");
const apollo8 = missionById("apollo-8");
const apollo11 = missionById("apollo-11");
const apollo13 = missionById("apollo-13");
const sts1 = missionById("sts-1");
const sts31 = missionById("sts-31");
const artemisI = missionById("artemis-i");

export default {
  name: "Card grid",
  category: "site",
  behavior: "Site content",
  summary: "Ruled grid of cards with a column cap and content-driven column dropping; card links stretch without making the whole card the accessible name.",
  owns: ["ef-card-grid", "ef-card"],
  purpose: {
    description: "A card grid presents a set of parallel items (services, capabilities, products) as a list of `article.ef-card` elements separated by shared hairline rules. `data-ef-columns` caps the number of columns; the minimum card width (`--ef-layout-card-min`, 15rem) decides when a column drops, so the grid degrades to one column by content rather than by breakpoints. A card may contain one `.ef-card__link` in its title: the link stretches over the whole card for pointer and touch, while its accessible name stays the title text.",
    useWhen: [
      "Presenting three to a dozen parallel items that each have a title and a short description.",
      "Each item may link to its own page and the whole card should be a comfortable target.",
      "Items should align into rows on wide screens and stack on phones without custom CSS."
    ],
    avoidWhen: [
      "The items are ordered or numbered: use [[entry-index]] or [[steps]].",
      "Each item is a single short claim with a supporting line: use [[facts]].",
      "An application dashboard needs metric tiles or interactive panels: use [[metric-card]] or [[dashboard-grid]].",
      "A card needs several independent links or controls; the stretched link covers the card, so extra links would be unreachable by pointer."
    ],
    characteristics: [
      "Cards inside a grid share single hairline rules; standalone cards keep a full border and radius.",
      "Cards default to the `surface` tone; `data-ef-tone` can set `page`, `elevated` (adds a raised shadow) or `inverse`.",
      "Card titles size by role, not heading level, so the outline can use whichever level the page needs.",
      "A linked card shows hover as a surface color change and draws the focus ring on the whole card."
    ]
  },
  examples: [
    {
      id: "linked-missions",
      title: "Two-column linked missions",
      description: "Two mission cards share one canonical source collection. Each whole card is a target, but each link's accessible name is only its mission title. data-ef-columns=\"2\" caps the wide layout at two columns.",
      html: `<ef-card-grid class="ef-component-tag">
  <div class="ef-site">
    <ul class="ef-card-grid" data-ef-columns="2" aria-label="Featured NASA missions">
      <li><article class="ef-card">
        <p class="ef-eyebrow">${apollo11.program}</p>
        <h3 class="ef-card__title"><a class="ef-card__link" href="#card-grid-linked-missions-apollo-11">${apollo11.name}</a></h3>
        <p>${apollo11.highlight}.</p>
        <p class="ef-card__footer" id="card-grid-linked-missions-apollo-11">${apollo11.spacecraft} · ${apollo11.launchDate}</p>
      </article></li>
      <li><article class="ef-card">
        <p class="ef-eyebrow">${sts31.program}</p>
        <h3 class="ef-card__title"><a class="ef-card__link" href="#card-grid-linked-missions-sts-31">${sts31.name}</a></h3>
        <p>${sts31.highlight}.</p>
        <p class="ef-card__footer" id="card-grid-linked-missions-sts-31">${sts31.spacecraft} · ${sts31.launchDate}</p>
      </article></li>
    </ul>
  </div>
</ef-card-grid>`
    },
    {
      id: "mission-family",
      title: "Five-column mission family",
      description: "Five short mission cards show the same grid at maximum density. data-ef-columns=\"5\" lowers the card minimum on wide screens; columns fall away naturally as the container narrows. Artemis I uses the elevated tone.",
      html: `<ef-card-grid class="ef-component-tag">
  <div class="ef-site">
    <ul class="ef-card-grid" data-ef-columns="5" aria-label="NASA reference missions">
      <li><article class="ef-card"><h3 class="ef-card__title">${geminiIV.name}</h3><p>${geminiIV.highlight}.</p></article></li>
      <li><article class="ef-card"><h3 class="ef-card__title">${apollo8.name}</h3><p>${apollo8.highlight}.</p></article></li>
      <li><article class="ef-card"><h3 class="ef-card__title">${apollo13.name}</h3><p>${apollo13.highlight}.</p></article></li>
      <li><article class="ef-card"><h3 class="ef-card__title">${sts1.name}</h3><p>${sts1.highlight}.</p></article></li>
      <li><article class="ef-card" data-ef-tone="elevated"><h3 class="ef-card__title">${artemisI.name}</h3><p>${artemisI.highlight}.</p></article></li>
    </ul>
  </div>
</ef-card-grid>`
    },
    {
      id: "mobile-single-column",
      title: "Phone mission cards",
      description: "Three mission cards at phone width, one linked and one on the inverse tone. The grid collapses to a single column and each card spans the full width.",
      mobile: {
        height: 560,
        notes: [
          "Columns drop by content until the mission cards form one column.",
          "Shared hairline rules remain, so stacked cards read as one ruled list without doubled borders.",
          "The stretched mission link makes the whole card a large touch target while the mission name remains its accessible name.",
          "Long mission highlights wrap within the card, so nothing overflows at 320px."
        ]
      },
      html: `<ef-card-grid class="ef-component-tag">
  <div class="ef-site">
    <ul class="ef-card-grid" data-ef-columns="3" aria-label="NASA mission highlights">
      <li><article class="ef-card" id="card-grid-mobile-apollo-8"><p class="ef-eyebrow">${apollo8.program}</p><h3 class="ef-card__title"><a class="ef-card__link" href="#card-grid-mobile-apollo-8">${apollo8.name}</a></h3><p>${apollo8.highlight}.</p></article></li>
      <li><article class="ef-card"><p class="ef-eyebrow">${sts31.program}</p><h3 class="ef-card__title">${sts31.name}</h3><p>${sts31.highlight}.</p></article></li>
      <li><article class="ef-card" data-ef-tone="inverse"><p class="ef-eyebrow">${artemisI.program}</p><h3 class="ef-card__title">${artemisI.name}</h3><p>${artemisI.highlight}.</p></article></li>
    </ul>
  </div>
</ef-card-grid>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "ul.ef-card-grid", values: "string", default: "—", description: "Names the list when no visible heading introduces it." },
      { name: "href", on: "a.ef-card__link", values: "URL", default: "—", description: "Destination of the card. Use at most one card link per card." }
    ],
    hooks: {
      "ef-card-grid": "Unstyled list laid out as an auto-fit grid. Draws the top and inline-start rules; each card draws its end and bottom rules.",
      "data-ef-columns": "Column cap on the grid: `2`, `3`, `4` or `5`. Without it the cap is 12. `5` also lowers the card minimum to 12rem. The minimum card width still decides when columns drop.",
      "--ef-card-columns": "Column cap computed from `data-ef-columns` (default 12). Prefer the attribute over setting this directly.",
      "--ef-card-rule": "Color of the grid's shared hairline rules. Default the tone's rule color.",
      "ef-card": "Card article. Positioned so a card link can stretch over it; defaults to the surface tone and a full border when standalone.",
      "data-ef-tone": "Tone of a card: `surface` (default), `page`, `elevated` (adds a raised shadow) or `inverse`.",
      "ef-card__title": "Card title at the h3 role size in the body face, whatever its heading level. Capped at 24ch.",
      "ef-card__link": "Link inside the title. Its ::after pseudo-element covers the card to enlarge the target; the focus ring is drawn on the card.",
      "ef-card__footer": "Closing line (outcome, meta) separated by a strong rule."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between card links; unlinked cards are not focusable." },
      { keys: "Enter", action: "Follows the focused card link (native link behavior)." }
    ],
    events: []
  },
  states: [
    { name: "Static card", how: "no .ef-card__link", description: "Not interactive; no hover or focus treatment." },
    { name: "Linked card hover", how: ":has(.ef-card__link:hover)", description: "The card background changes to the tone's hover surface and the title underlines." },
    { name: "Linked card focus", how: ":has(.ef-card__link:focus-visible)", description: "The focus outline and halo are drawn inside the card edge instead of around the title." },
    { name: "Elevated", how: "data-ef-tone=\"elevated\"", description: "Elevated surface with a raised shadow." },
    { name: "Inverse", how: "data-ef-tone=\"inverse\"", description: "Inverse surface; text, labels and rules switch to inverse tone colors." }
  ],
  accessibility: {
    forma: [
      "Keeps the link's accessible name to the title while the whole card is the pointer and touch target.",
      "Draws a visible focus ring on the whole card for linked cards.",
      "Uses rules and tone pairs validated for contrast; the card link inherits the title color, and other links on the surface tone fall back to primary text because the accent is not validated there.",
      "Borders tones in forced colors and keeps cards whole across printed pages."
    ],
    consumer: [
      "Mark up the grid as a list of `article` cards with real headings at the level the outline needs.",
      "Name the list with `aria-label` or a preceding heading.",
      "Use at most one link per card and write titles that make sense out of context."
    ]
  },
  responsive: [
    "Auto-fit grid with `minmax(min(100%, max(--ef-layout-card-min, 100% / columns)), 1fr)`: the cap limits columns and the 15rem minimum (12rem for five columns) drops them.",
    "At phone widths every cap degrades to one column; there are no breakpoints.",
    "Cards have `min-inline-size: 0` and titles wrap within 24ch, so long words and titles do not overflow."
  ],
  motion: [
    "A linked card interpolates its background color on hover over the shared perceptual duration (about 120ms). Nothing moves or scales.",
    "Unlinked cards do not animate. Under reduced motion the color change is instant."
  ],
  guidance: {
    do: [
      "Keep card content parallel: same parts, similar length.",
      "Use `data-ef-columns` to match the number of items (2 for two, 3 for three or six)."
    ],
    avoid: [
      "Placing buttons or secondary links inside a linked card.",
      "Using tone to rank items; tone is presentation, not importance."
    ]
  },
  related: [
    { slug: "facts", note: "Short claim-plus-detail pairs in a lighter ruled grid." },
    { slug: "entry-index", note: "Ordered, numbered entries with a visible link each." },
    { slug: "metric-card", note: "Application metric tiles, not marketing content." },
    { slug: "surface", note: "A single bounded panel in application UI." }
  ]
};
