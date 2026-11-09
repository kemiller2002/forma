export default {
  name: "Section",
  category: "layout",
  behavior: "Native CSS",
  summary: "Vertical page-section spacing primitive; inside the marketing shell it also carries tone and child rhythm.",
  purpose: {
    description: "A section separates the major regions of a page with consistent block padding. In an application page it is simply `padding-block` (3rem by default) plus a leading margin between its direct children. Inside the marketing shell (`.forma-site`) it uses the site's fluid section spacing instead, and with `data-forma-tone` it becomes a full tonal band (surface, elevated or inverse) with inner padding, so text, links and rules switch to colors that are contrast-safe on that background. The element should be a real `section` with a heading, because the section is how readers and assistive technology find the page's parts.",
    useWhen: [
      "A page has several major regions that should be separated by the same vertical rhythm.",
      "A marketing page needs a tonal band (for example an inverse call-out region) whose text colors adapt automatically.",
      "Children of a region should be spaced by the site's standard stack rhythm."
    ],
    avoidWhen: [
      "You only need spacing between siblings inside a panel: use [[stack]].",
      "The region needs a boundary and panel padding inside an application view: use [[surface]].",
      "The region is the page's opening statement: use [[hero]]. The closing conversion region is [[cta]].",
      "The heading row needs an eyebrow, supporting text and an aside action: put a [[section-heading]] inside the section."
    ],
    characteristics: [
      "Outside `.forma-site`: `padding-block: var(--forma-section-space, 3rem)`.",
      "Inside `.forma-site`: half the fluid section space as block padding; a toned section gets margin plus inner padding on all sides.",
      "Direct children after the first get `--forma-layout-stack-space` as a top margin; a child directly after `.forma-section-heading` gets none, because the heading already owns that space."
    ]
  },
  examples: [
    {
      id: "toned-band",
      interaction: { kind: "static", reasons: ["placeholder-navigation"] },
      title: "Surface-toned band on a marketing page",
      description: "A section with `data-forma-tone=\"surface\"` inside the site shell. The band gets inner padding and the secondary background; links and muted text switch to colors validated for that tone.",
      html: `<forma-section class="forma-component-tag">
  <div class="forma-site">
    <section class="forma-section" data-forma-tone="surface" aria-labelledby="section-toned-band-title">
      <header class="forma-section-heading">
        <div class="forma-section-heading__text">
          <p class="forma-eyebrow">Security</p>
          <h2 id="section-toned-band-title">Your data stays in your region</h2>
          <p>Every workspace chooses a data region at creation. Backups never leave it.</p>
        </div>
      </header>
      <p><a href="#data-residency">Read the data residency overview</a></p>
    </section>
  </div>
</forma-section>`
    },
    {
      id: "inverse-band",
      interaction: { kind: "static", reasons: ["placeholder-navigation"] },
      title: "Inverse band for a key statement",
      description: "An inverse-toned section used once on a page for a statement that should stand apart. Heading, text and link colors all switch to the inverse role tokens.",
      html: `<forma-section class="forma-component-tag">
  <div class="forma-site">
    <section class="forma-section" data-forma-tone="inverse" aria-labelledby="section-inverse-band-title">
      <h2 id="section-inverse-band-title">Built for audits, not just demos</h2>
      <p>Every change to permissions, retention and billing is recorded with who made it and why.</p>
      <p><a href="#audit-trail">See what the audit trail records</a></p>
    </section>
  </div>
</forma-section>`
    },
    {
      id: "application-sections",
      title: "Application page regions",
      description: "Two consecutive sections in an application settings page, outside the marketing shell, with a tighter block padding set through `--forma-section-space`.",
      html: `<forma-section class="forma-component-tag">
  <div>
    <section class="forma-section" style="--forma-section-space: 1.5rem" aria-labelledby="section-application-sections-general">
      <h2 id="section-application-sections-general">General</h2>
      <p>Workspace name, default language and time zone.</p>
    </section>
    <section class="forma-section" style="--forma-section-space: 1.5rem" aria-labelledby="section-application-sections-danger">
      <h2 id="section-application-sections-danger">Delete workspace</h2>
      <p>Deleting a workspace removes all projects after a 30-day recovery period.</p>
    </section>
  </div>
</forma-section>`
    },
    {
      id: "mobile-sections",
      title: "Mobile marketing sections",
      description: "A plain section followed by a toned section at phone width. The fluid section spacing shrinks with the viewport, so bands stay separated without wasting the screen.",
      mobile: {
        height: 560,
        notes: [
          "Inside `.forma-site` section spacing comes from fluid tokens, so padding and band margins are smaller at 320px than on desktop.",
          "Toned bands keep inner padding on all sides, so text never touches the band edge on narrow screens.",
          "Headings wrap and are limited to a short measure by the shell typography; nothing overflows horizontally.",
          "Order and tone are the same in portrait and landscape."
        ]
      },
      html: `<forma-section class="forma-component-tag">
  <div class="forma-site">
    <section class="forma-section" aria-labelledby="section-mobile-sections-how">
      <h2 id="section-mobile-sections-how">How it works</h2>
      <p>Connect your repository, choose a template and publish.</p>
    </section>
    <section class="forma-section" data-forma-tone="elevated" aria-labelledby="section-mobile-sections-pricing">
      <h2 id="section-mobile-sections-pricing">Pricing</h2>
      <p>Free for public projects. Team plans start at $8 per seat.</p>
    </section>
  </div>
</forma-section>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.forma-section", values: "id of the section heading", default: "—", description: "Names the section so it is exposed as a region landmark. Always label sections." },
      { name: "data-forma-tone", on: "section.forma-section", values: "page | surface | elevated | inverse", default: "absent (page)", description: "Marketing surface tone. Non-page tones inside .forma-site add band padding and switch text, link and rule colors." },
      { name: "style", on: "section.forma-section", values: "--forma-section-space: <length>", default: "—", description: "Per-instance block padding outside the marketing shell." }
    ],
    hooks: {
      "forma-section": "Page region with block padding. Inside `.forma-site` it uses fluid layout spacing and child rhythm.",
      "data-forma-tone": "Surface tone. Inside `.forma-site`, any tone except `page` gives the section margin, inner padding, a tone background and tone text colors; in forced colors it also gets a 1px CanvasText border.",
      "--forma-section-space": "Block padding outside the marketing shell. Default `--forma-primitive-spacing-7` (3rem). Ignored inside `.forma-site`, which uses `--forma-layout-section-space`."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through focusable content in source order. Sections themselves are not focusable." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Application section", how: "outside .forma-site", description: "Block padding from `--forma-section-space`." },
    { name: "Marketing section", how: "inside .forma-site", description: "Fluid block padding; children spaced by the layout stack space." },
    { name: "Toned band", how: "data-forma-tone=\"surface | elevated | inverse\" inside .forma-site", description: "Background and text colors from the tone, plus inner padding and outer margin." },
    { name: "Forced colors", how: "@media (forced-colors: active)", description: "Toned sections draw a CanvasText border because the tone background is removed." }
  ],
  accessibility: {
    forma: [
      "Tones set text, heading, link and rule colors validated against their background.",
      "Toned bands keep a visible border in forced-colors mode.",
      "Spacing only; no roles are added and order is never changed."
    ],
    consumer: [
      "Use a `section` element with a visible heading and aria-labelledby so the region is navigable.",
      "Keep heading levels consistent across sections (usually h2).",
      "Use the inverse tone sparingly; it draws strong attention."
    ]
  },
  responsive: [
    "Inside `.forma-site`, spacing uses fluid tokens that scale with viewport width.",
    "Outside the shell, spacing is fixed at `--forma-section-space`.",
    "Sections are full width of their parent; constrain content with [[container]] or [[measure]].",
    "The child rhythm (`.forma-section > * + *`) is defined in the marketing layer but not scoped to `.forma-site`, so it also applies in application pages that load `all.css`."
  ],
  motion: [
    "No animation: sections and tones are static."
  ],
  guidance: {
    do: [
      "Alternate page and surface tones to separate adjacent bands when content types change.",
      "Put a [[section-heading]] first when the section needs an eyebrow or an aside action."
    ],
    avoid: [
      "Adding a tone to every section; the contrast between bands stops meaning anything.",
      "Using sections as generic wrappers without headings."
    ]
  },
  related: [
    { slug: "section-heading", note: "Heading row with eyebrow, supporting text and aside action." },
    { slug: "container", note: "Constrains the width of content within a section." },
    { slug: "hero", note: "The opening region of a marketing page." },
    { slug: "surface", note: "Bounded panel for application views." }
  ]
};
