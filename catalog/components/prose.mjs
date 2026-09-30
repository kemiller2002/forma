export default {
  name: "Prose",
  category: "site",
  behavior: "Site content",
  summary: "Long-form content constrained to the reading measure with underlined links and consistent heading rhythm.",
  purpose: {
    description: "Prose is the container for long-form writing on marketing and documentation pages: articles, guides and release notes rendered from Markdown or written by hand. `.ef-prose` caps the region at the reading measure, spaces its direct headings, reduces `h2` to the statement size so section headings do not compete with the page title, and keeps paragraphs and list items at primary text contrast. Plain HTML inside inherits the `.ef-site` foundations: underlined links, inline code, blockquotes and rules.",
    useWhen: [
      "Rendering an article, guide or policy page made of headings, paragraphs and lists.",
      "Markdown output needs Forma styling without adding classes to each element.",
      "The article column of a [[documentation-layout]]."
    ],
    avoidWhen: [
      "Short marketing sections with a heading and a sentence: use [[section-heading]] and components.",
      "Application help text or form descriptions: use the application patterns, which are not scoped to `.ef-site`.",
      "Constraining line length in application UI: use [[measure]]."
    ],
    characteristics: [
      "Maximum width is `--ef-layout-measure`; lists and paragraphs share it.",
      "Direct `h1`, `h2` and `h3` children get fixed rhythm; a heading that is the first child has no top margin.",
      "Direct figures, code samples and `pre` elements get block margins.",
      "Links are underlined and thicken on hover; in print, external links show their URL after the text."
    ]
  },
  examples: [
    {
      id: "guide-with-code",
      title: "Guide with a code sample and callout",
      description: "A short guide composing a [[code-sample]] and a [[callout]] inside prose. The figure takes the prose block margins and the callout keeps the measure.",
      html: `<ef-prose class="ef-component-tag">
  <div class="ef-site">
    <article class="ef-prose">
      <h2>Pin a release</h2>
      <p>Record the version and checksum of every asset in <code>forma.lock</code>, then install exactly what it pins.</p>
      <figure class="ef-code-figure">
        <figcaption id="prose-guide-with-code-caption">Install what the lock pins</figcaption>
        <pre class="ef-code" tabindex="0" aria-labelledby="prose-guide-with-code-caption"><code>bash install.sh</code></pre>
      </figure>
      <aside class="ef-callout" data-ef-callout="note" aria-labelledby="prose-guide-with-code-note">
        <p class="ef-callout__label" id="prose-guide-with-code-note">Note</p>
        <p>The installer needs only bash, curl and a sha256 tool.</p>
      </aside>
      <h3>Upgrading</h3>
      <p>Change the version, run <code>bash install.sh --update</code>, and review <a href="#prose-guide-with-code-caption">the release notes</a>.</p>
    </article>
  </div>
</ef-prose>`
    },
    {
      id: "release-notes",
      title: "Release notes with nested lists",
      description: "Markdown-style release notes: headings, a nested list, strong text and a horizontal rule. No element carries a class.",
      html: `<ef-prose class="ef-component-tag">
  <div class="ef-site">
    <article class="ef-prose">
      <h2>0.3.0</h2>
      <p><strong>Breaking:</strong> the landing layout is removed.</p>
      <h3>Added</h3>
      <ul>
        <li>Callout, with four kinds:
          <ul><li>note and caution;</li><li>evidence and decision.</li></ul>
        </li>
        <li>Documentation layout that regroups by main-region width.</li>
      </ul>
      <hr>
      <h3>Fixed</h3>
      <ol><li>Header no longer sticks on short viewports.</li><li>Card focus ring is drawn inside the card edge.</li></ol>
    </article>
  </div>
</ef-prose>`
    },
    {
      id: "mobile-article",
      title: "Phone article with long inline code",
      description: "An article at phone width with a quotation and a long inline code value.",
      mobile: {
        height: 520,
        notes: [
          "The measure cap stops mattering on phones; the article takes the column width and text wraps normally.",
          "Inline `code` breaks anywhere (`overflow-wrap: anywhere`), so long identifiers and paths do not widen the page.",
          "Heading sizes are fluid and balance their line breaks; the statement-sized `h2` stays below the page title.",
          "Inline links are only as large as their text, so write them as whole phrases to give touch users a usable target; they keep their underline and the shell's focus ring."
        ]
      },
      html: `<ef-prose class="ef-component-tag">
  <div class="ef-site">
    <article class="ef-prose">
      <h2>Why tones, not colors</h2>
      <p>On the surface tone, links and labels read <code>var(--ef-color-text-on-secondary-surface)</code> instead of the accent, so a region can change its background without restyling what is inside.</p>
      <blockquote><p>Links on the secondary surface fall back to primary text, because the accent is below 4.5:1 there.</p></blockquote>
      <p>See <a href="#prose-mobile-article-end">the token contract</a> for every validated pair.</p>
      <p id="prose-mobile-article-end">Tones are presentation only.</p>
    </article>
  </div>
</ef-prose>`
    }
  ],
  api: {
    attributes: [],
    hooks: {
      "ef-prose": "Long-form container. Caps width at the reading measure, redefines `--ef-type-size-h2` to the statement size, spaces direct headings, keeps paragraph and list text at primary color, and gives direct figures and code blocks block margins."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through links and focusable code blocks in source order." }
    ],
    events: []
  },
  states: [
    { name: "Default", how: "no attributes", description: "Measure-capped article on the surrounding tone." },
    { name: "Link hover", how: ":hover on a", description: "The underline thickens; link color changes to the tone's hover link color." },
    { name: "Print", how: "@media print", description: "External links (href starting with http) print their URL after the link text." }
  ],
  accessibility: {
    forma: [
      "Keeps links underlined, so they are identifiable without color.",
      "Keeps paragraph and list text at primary contrast on every tone.",
      "Uses rem and fluid sizes so 200% text and text-spacing overrides reflow without horizontal scrolling."
    ],
    consumer: [
      "Use a correct heading hierarchy with no skipped levels.",
      "Write descriptive link text.",
      "Mark up quotations, code and lists with their native elements."
    ]
  },
  responsive: [
    "Capped at `--ef-layout-measure`; below that it takes the column width. No breakpoints.",
    "Inline code wraps anywhere; code blocks scroll inside themselves.",
    "Images and media inside `.ef-site` are limited to 100% of their container."
  ],
  motion: [
    "No animation: link hover changes the underline thickness and color instantly."
  ],
  guidance: {
    do: [
      "Emit plain semantic HTML from Markdown and wrap it in `.ef-prose`.",
      "Use [[callout]] sparingly for material a reader must notice."
    ],
    avoid: [
      "Adding classes to individual paragraphs to restyle them.",
      "Setting a wider max-width on the article; long lines reduce readability."
    ]
  },
  related: [
    { slug: "callout", note: "Labelled supporting material inside prose." },
    { slug: "code-sample", note: "Captioned, scrollable code blocks inside prose." },
    { slug: "documentation-layout", note: "Places prose beside navigation and an outline." },
    { slug: "measure", note: "The application-side line-length primitive." }
  ]
};
