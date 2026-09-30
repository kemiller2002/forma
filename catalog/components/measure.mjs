export default {
  name: "Measure",
  category: "layout",
  behavior: "Native CSS",
  summary: "Constrains readable line measure without changing semantic structure.",
  purpose: {
    description: "Measure caps an element's inline size at a readable line length, 65 characters by default, while letting it shrink to the available width. It sets width only: it does not center, pad or style the content, so the surrounding composition still decides placement. Use it on text-heavy regions inside wide layouts, such as help text in a full-width settings page or an explanation above a dashboard, where long lines would otherwise slow reading.",
    useWhen: [
      "Paragraph text sits in a region much wider than a comfortable line length.",
      "A form or explanation should not stretch across a wide screen.",
      "You need the measure without the typographic rhythm of long-form prose."
    ],
    avoidWhen: [
      "The content is a long article with headings, lists and quotes: use [[prose]], which includes measure and rhythm.",
      "A whole page region on a marketing site needs a width and centering: use [[container]].",
      "The content is tabular or a dashboard; a character measure would squeeze it. Use [[grid]] or [[bounded-overflow]]."
    ],
    characteristics: [
      "Width is `min(100%, var(--ef-measure))`, so the element never overflows its parent.",
      "The `ch` unit scales with font size, so the measure stays proportional under text zoom.",
      "The element stays at the inline start; wrap it in a centered container if centering is wanted."
    ]
  },
  examples: [
    {
      id: "settings-help",
      title: "Help text in a wide settings page",
      description: "A description paragraph and a field constrained to a readable measure inside a full-width page section. The heading and the field share the same line length, so the eye does not travel across the whole screen.",
      html: `<ef-measure class="ef-component-tag">
  <section class="ef-measure ef-stack" aria-labelledby="measure-settings-help-title">
    <h2 id="measure-settings-help-title">Data retention</h2>
    <p>Choose how long we keep deleted projects before they are permanently removed. During this period an administrator can restore a project with all of its history, members and integrations.</p>
    <div class="ef-field">
      <label class="ef-field__label" for="measure-settings-help-days">Days before permanent deletion</label>
      <input id="measure-settings-help-days" name="retention-days" type="number" min="1" max="365" value="30">
    </div>
  </section>
</ef-measure>`
    },
    {
      id: "narrow-measure",
      title: "Short measure for a confirmation note",
      description: "A tighter measure (`--ef-measure: 45ch`) for a short confirmation note in a card. Short lines make a brief message easier to take in at a glance.",
      html: `<ef-measure class="ef-component-tag">
  <div class="ef-surface">
    <p class="ef-measure" style="--ef-measure: 45ch">Your export is being prepared. We will email a download link to the address on your account when it is ready, usually within ten minutes.</p>
  </div>
</ef-measure>`
    },
    {
      id: "mobile-measure",
      title: "Mobile reading width",
      description: "The same constrained text on a phone. The screen is narrower than 65ch, so the measure resolves to 100% and has no visible effect.",
      mobile: {
        height: 320,
        notes: [
          "On phones the available width is less than 65ch, so `min(100%, 65ch)` resolves to the full width.",
          "Text wraps normally and never scrolls horizontally.",
          "Under 200% text zoom the ch-based measure grows with the font, so on tablets it keeps roughly the same number of characters per line.",
          "Rotating to landscape lets the measure take effect again once the width exceeds 65ch."
        ]
      },
      html: `<ef-measure class="ef-component-tag">
  <article class="ef-measure ef-stack" aria-labelledby="measure-mobile-measure-title">
    <h2 id="measure-mobile-measure-title">Why we ask for your phone number</h2>
    <p>We only use it to send sign-in codes when you turn on two-step verification. It is never shown to other members of your workspace.</p>
  </article>
</ef-measure>`
    }
  ],
  api: {
    attributes: [
      { name: "style", on: ".ef-measure", values: "--ef-measure: <length>", default: "—", description: "Per-instance line length, for example 45ch for short notes." },
      { name: "aria-labelledby", on: "section / article", values: "id of the heading", default: "—", description: "Names the constrained region by its heading." }
    ],
    hooks: {
      "ef-measure": "Sets `inline-size: min(100%, var(--ef-measure))`. No other styling.",
      "--ef-measure": "Maximum line length. Default 65ch."
    },
    keyboard: [],
    events: [],
    form: "Not a form control. A form or field group can be the measured element."
  },
  states: [
    { name: "Constrained", how: "parent wider than --ef-measure", description: "The element stops at the measure; remaining space stays empty at the inline end." },
    { name: "Fluid", how: "parent narrower than --ef-measure", description: "The element takes 100% of the parent." }
  ],
  accessibility: {
    forma: [
      "Improves readability of long text by limiting line length.",
      "Uses ch units, so the measure follows the user's text size.",
      "Changes no semantics and adds no roles."
    ],
    consumer: [
      "Apply measure to text, not to tables or dashboards that need their full width.",
      "Still structure content with headings and paragraphs; measure does not replace structure."
    ]
  },
  responsive: [
    "Intrinsic: clamps to 100% of the parent on narrow screens and to the measure on wide ones.",
    "No breakpoints and no horizontal overflow at any width.",
    "Combine with [[container]] or margin in the parent composition when centering is needed."
  ],
  motion: [
    "No animation: the width is static."
  ],
  guidance: {
    do: [
      "Put measure on the element that holds the text, not on a page-level wrapper that also contains tables.",
      "Use a shorter measure for brief notes and a longer one only for dense technical text."
    ],
    avoid: [
      "Expecting measure to center content; it only limits width.",
      "Using px values for `--ef-measure`; they do not follow text zoom."
    ]
  },
  related: [
    { slug: "prose", note: "Long-form article styling that includes a reading measure." },
    { slug: "container", note: "Centered, token-based width for marketing page regions." },
    { slug: "stack", note: "Often combined with measure to space a constrained text block." }
  ]
};
