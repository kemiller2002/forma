export default {
  name: "Text roles",
  category: "utilities",
  behavior: "Native CSS",
  summary: "Eyebrow, lead, statement and component kicker text roles that express hierarchy through type, not new semantics.",
  owns: ["ef-eyebrow","ef-lead","ef-statement","ef-component-kicker"],
  purpose: {
    description: "Text roles are typographic treatments for text that frames other content. They change size, family, case and color only; the element you put them on keeps its own meaning. Three belong to the marketing layer and are used inside a MarketingShell (`.ef-site`): the eyebrow (a small uppercase label above a heading), the lead (the larger introductory paragraph under a heading) and the statement (a display-size pull statement with an accent rule). The fourth, the component kicker, belongs to the application layer: a small monospaced uppercase label that names the kind of panel or workflow above its heading.",
    useWhen: [
      "A marketing or documentation section needs a category label above its heading: `ef-eyebrow`.",
      "The first paragraph of a section summarizes it and should read first: `ef-lead`.",
      "One sentence of a page deserves display-size emphasis as a pull statement: `ef-statement`.",
      "An application panel needs a small label naming its kind or context above the heading: `ef-component-kicker`."
    ],
    avoidWhen: [
      "Headings: use real `h1`-`h6` elements; an eyebrow or kicker is never the heading.",
      "Status or severity: use [[status-lozenge]] or [[badge]]; text roles carry no state.",
      "Quotations with a source that must be cited: use [[callout]] with `data-ef-callout=\"evidence\"`.",
      "Long-form body text: use [[prose]]."
    ],
    characteristics: [
      "Roles never add semantics: an eyebrow is a `p`, a statement is whatever element you choose (often `blockquote`), a kicker is a `p` or `span`.",
      "Eyebrow, lead and statement read marketing role tokens (`--ef-type-size-*`, `--ef-tone-*`), so they follow the surface tone they sit on.",
      "Lead and statement sizes are fluid `clamp()` values that grow with viewport width.",
      "The component kicker uses core semantic tokens and needs no marketing shell."
    ]
  },
  examples: [
    {
      id: "section-introduction",
      title: "Section introduction",
      description: "An eyebrow names the section's category, the `h2` states the point and a lead paragraph summarizes it. Reading order is eyebrow, heading, lead; the heading remains the section's accessible name.",
      html: `<ef-text-roles class="ef-component-tag">
  <div class="ef-site">
    <section class="ef-section" aria-labelledby="text-roles-section-introduction-title">
      <p class="ef-eyebrow">Security</p>
      <h2 id="text-roles-section-introduction-title">Evidence you can hand to an auditor</h2>
      <p class="ef-lead">Every release records who approved it, which checks ran and what changed, so compliance reviews take hours instead of weeks.</p>
    </section>
  </div>
</ef-text-roles>`
    },
    {
      id: "pull-statement",
      title: "Pull statement in an article",
      description: "A statement set between ordinary paragraphs. It is a `blockquote` because it repeats a line from the article; the accent rule above it and the display face set it apart without a new heading level.",
      html: `<ef-text-roles class="ef-component-tag">
  <div class="ef-site">
    <article aria-labelledby="text-roles-pull-statement-title">
      <h2 id="text-roles-pull-statement-title">Why we moved validation to the edge</h2>
      <p>Most of our support tickets came from forms that accepted values the back office later rejected. Moving the same rules into the page removed the delay between a mistake and its explanation.</p>
      <blockquote class="ef-statement"><p>A rule that fails late is a rule the user never learns.</p></blockquote>
      <p>The rules still run on the server; the page only reports them sooner.</p>
    </article>
  </div>
</ef-text-roles>`
    },
    {
      id: "application-kicker",
      title: "Kicker on an application panel",
      description: "In an application layout the component kicker names the kind of panel above its heading. It works without the marketing shell and does not replace the heading.",
      html: `<ef-text-roles class="ef-component-tag">
  <section class="ef-stack" data-density="compact" aria-labelledby="text-roles-application-kicker-title">
    <p class="ef-component-kicker">Change review</p>
    <h2 id="text-roles-application-kicker-title">Rotate the payments signing key</h2>
    <p>Scheduled for Friday 18:00 UTC. Two approvals are recorded and one is still required.</p>
  </section>
</ef-text-roles>`
    },
    {
      id: "mobile-hero-introduction",
      title: "Hero introduction on a phone",
      description: "Eyebrow, heading and lead at phone width. The lead's fluid size steps down toward its 1.125rem minimum and wraps within the column.",
      mobile: {
        height: 320,
        notes: [
          "The lead uses `clamp(1.125rem, 0.875rem + 0.85vw, 1.5rem)`, so it is smallest on phones and still larger than body text.",
          "The lead's 62ch measure limit never applies at phone width; the text simply fills the column and wraps.",
          "Eyebrow text is uppercase and letter-spaced; keep it to one or two words so it does not wrap awkwardly at 320px.",
          "Nothing overflows horizontally; statements also use a fluid size (1.5rem minimum) and wrap."
        ]
      },
      html: `<ef-text-roles class="ef-component-tag">
  <div class="ef-site">
    <section class="ef-section" aria-labelledby="text-roles-mobile-hero-introduction-title">
      <p class="ef-eyebrow">Field service</p>
      <h2 id="text-roles-mobile-hero-introduction-title">Every visit, planned before the van leaves</h2>
      <p class="ef-lead">Technicians see parts, access notes and the customer's history on one screen, even without a signal.</p>
    </section>
  </div>
</ef-text-roles>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section / article", values: "id of the heading", default: "—", description: "Names the region by its heading, not by the eyebrow or kicker." }
    ],
    hooks: {
      "ef-eyebrow": "Marketing layer. Small (`--ef-type-size-label`) uppercase monospaced label in `--ef-tone-label`, with label weight and tracking and a bottom margin. Use inside `.ef-site`.",
      "ef-lead": "Marketing layer. Introductory paragraph at `--ef-type-size-lead` (fluid, 1.125-1.5rem) with lead line height, limited to the narrow measure (62ch), in `--ef-tone-text`.",
      "ef-statement": "Marketing layer. Display-face pull statement at `--ef-type-size-statement` (fluid, 1.5-2.4rem) with an accent rule above; nested paragraphs inherit its color and drop the measure limit.",
      "ef-component-kicker": "Application layer. 0.6875rem monospaced uppercase label with 0.08em tracking in the secondary accent color."
    },
    keyboard: [
      { keys: "None", action: "Text roles are not interactive and add no keyboard behavior." }
    ],
    events: [],
    form: "No form behavior."
  },
  states: [
    { name: "Default", how: "class on a text element", description: "The role's typography; no interactive states." },
    { name: "Surface tone", how: "ancestor data-ef-tone (surface, elevated, inverse)", description: "Eyebrow, lead and statement read `--ef-tone-*`, so their colors stay legible on each marketing tone." },
    { name: "Forced colors", how: "forced-colors: active", description: "The statement's accent rule becomes CanvasText; text uses system colors." }
  ],
  accessibility: {
    forma: [
      "Changes presentation only; heading structure and element semantics are untouched.",
      "Tone variables keep eyebrow, lead and statement colors at validated contrast on each marketing surface tone.",
      "The statement's rule remains visible in forced colors."
    ],
    consumer: [
      "Keep a real heading after every eyebrow or kicker, and name regions by that heading.",
      "Do not rely on the uppercase transform to convey anything; screen readers read the source text, so write it in normal case.",
      "Use `blockquote` for a statement only when it repeats or quotes text; otherwise use a `p`."
    ]
  },
  responsive: [
    "Lead and statement sizes are fluid `clamp()` values tied to viewport width; eyebrow and kicker sizes are fixed.",
    "The lead is limited to the 62ch narrow measure on wide screens and fills the column on narrow ones.",
    "All roles wrap naturally and never cause horizontal overflow."
  ],
  motion: [
    "No animation: text roles are static typography."
  ],
  guidance: {
    do: [
      "Keep eyebrows and kickers to one to three words.",
      "Use at most one statement per page section so it keeps its weight."
    ],
    avoid: [
      "Using an eyebrow as the only heading of a section.",
      "Using marketing roles (eyebrow, lead, statement) inside application screens; use the component kicker there.",
      "Styling long paragraphs as leads."
    ]
  },
  related: [
    { slug: "section-heading", note: "Composes an eyebrow, heading, description and aside into a section header." },
    { slug: "hero", note: "Page-level introduction that uses eyebrow and lead." },
    { slug: "prose", note: "Long-form body text styling." },
    { slug: "callout", note: "Use for cited evidence and notes rather than a pull statement." }
  ]
};
