export default {
  name: "Mosaic",
  category: "layout",
  behavior: "Application content",
  summary: "Asymmetric editorial composition using explicit spans and deterministic narrow-screen reflow.",
  purpose: {
    description: "A mosaic is a four-column editorial grid in which the author gives some items more width with `data-span=\"2\"` or `data-span=\"full\"`. It suits landing pages, report overviews and collections where one feature item leads and others support it. The rhythm is deliberate rather than content-driven: four columns on wide screens, two at 48rem and below, one at 30rem and below. Emphasis comes only from span; the source order is always the reading order. The application decides which items are featured.",
    useWhen: [
      "An overview needs a featured item and several smaller supporting items with a designed rhythm.",
      "Editorial or report content should look composed rather than a uniform grid.",
      "The author, not the data volume, decides which items get more space."
    ],
    avoidWhen: [
      "Items are equal peers whose count varies: use [[grid]].",
      "Column count should follow the container width rather than fixed breakpoints: use [[responsive-grid]].",
      "The layout is a marketing card collection inside the site shell: use [[card-grid]]."
    ],
    characteristics: [
      "Four equal `minmax(0, 1fr)` columns, so items never force overflow.",
      "`data-span=\"2\"` takes half the row; `data-span=\"full\"` takes the whole row.",
      "At one column every span resets to auto, so no item can create an extra track."
    ]
  },
  examples: [
    {
      id: "quarterly-report",
      title: "Quarterly report overview",
      description: "A featured summary takes two of four columns, two supporting items fill the row, and a full-width methodology note closes the section. Reading order is summary, revenue, retention, methodology.",
      html: `<ef-mosaic class="ef-component-tag">
  <section class="ef-mosaic" aria-label="Q3 report overview">
    <article class="ef-surface ef-stack" data-span="2" aria-labelledby="mosaic-quarterly-report-summary">
      <h2 id="mosaic-quarterly-report-summary">Q3 in summary</h2>
      <p>Revenue grew 14% on the previous quarter, driven by the Team plan. Support response times improved for the third quarter running.</p>
    </article>
    <article class="ef-surface" aria-labelledby="mosaic-quarterly-report-revenue">
      <h2 id="mosaic-quarterly-report-revenue">Revenue</h2>
      <p>$2.1M, up 14%.</p>
    </article>
    <article class="ef-surface" aria-labelledby="mosaic-quarterly-report-retention">
      <h2 id="mosaic-quarterly-report-retention">Retention</h2>
      <p>94% of accounts renewed.</p>
    </article>
    <article class="ef-surface" data-span="full" aria-labelledby="mosaic-quarterly-report-method">
      <h2 id="mosaic-quarterly-report-method">Methodology</h2>
      <p>Figures are unaudited and exclude one-off professional services revenue.</p>
    </article>
  </section>
</ef-mosaic>`
    },
    {
      id: "two-features",
      title: "Two featured stories",
      description: "Two items each span two columns to form a balanced first row, followed by four single-column items. A tighter gap is set with `--ef-mosaic-space`.",
      html: `<ef-mosaic class="ef-component-tag">
  <section class="ef-mosaic" style="--ef-mosaic-space: 0.75rem" aria-label="Engineering blog">
    <article class="ef-surface" data-span="2"><h2>How we cut build times in half</h2><p>Remote caching and smaller test shards.</p></article>
    <article class="ef-surface" data-span="2"><h2>Designing for 200% zoom</h2><p>Lessons from auditing every settings page.</p></article>
    <article class="ef-surface"><h3>Release 5.1</h3><p>Offline drafts.</p></article>
    <article class="ef-surface"><h3>Status page changes</h3><p>Clearer incident timelines.</p></article>
    <article class="ef-surface"><h3>Hiring</h3><p>Two platform roles open.</p></article>
    <article class="ef-surface"><h3>Office hours</h3><p>Every second Thursday.</p></article>
  </section>
</ef-mosaic>`
    },
    {
      id: "mobile-single-column",
      title: "Mobile single column",
      description: "The report overview at phone width. At 30rem and below the mosaic is one column and every span resets, so items stack in source order at full width.",
      mobile: {
        height: 560,
        notes: [
          "At 30rem and below the grid has one column and `data-span` items are reset to `grid-column: auto`.",
          "Between 30rem and 48rem there are two columns: `data-span=\"2\"` then fills the whole row, the same as full.",
          "The featured item stays first only because it is first in the source.",
          "All items are full width at 320px, so nothing scrolls horizontally and links inside keep full-width targets."
        ]
      },
      html: `<ef-mosaic class="ef-component-tag">
  <section class="ef-mosaic" aria-label="Report on the go">
    <article class="ef-surface" data-span="2" aria-labelledby="mosaic-mobile-single-column-summary">
      <h2 id="mosaic-mobile-single-column-summary">Q3 in summary</h2>
      <p>Revenue up 14% on the previous quarter.</p>
    </article>
    <article class="ef-surface" aria-labelledby="mosaic-mobile-single-column-retention">
      <h2 id="mosaic-mobile-single-column-retention">Retention</h2>
      <p>94% renewed.</p>
    </article>
    <article class="ef-surface" data-span="full" aria-labelledby="mosaic-mobile-single-column-method">
      <h2 id="mosaic-mobile-single-column-method">Methodology</h2>
      <p>Unaudited figures.</p>
    </article>
  </section>
</ef-mosaic>`
    }
  ],
  api: {
    attributes: [
      { name: "data-span", on: "direct child of .ef-mosaic", values: "2 | full", default: "absent (one column)", description: "Visual width of an item. Not a data-ef-* hook; it is presentation only." },
      { name: "aria-label", on: ".ef-mosaic", values: "string", default: "—", description: "Names the composed section." },
      { name: "aria-labelledby", on: "items", values: "id of the item heading", default: "—", description: "Names each article by its heading." },
      { name: "style", on: ".ef-mosaic", values: "--ef-mosaic-space: <length>", default: "—", description: "Per-instance gap override." }
    ],
    hooks: {
      "ef-mosaic": "Four-column grid (two at 48rem and below, one at 30rem and below); children get `min-inline-size: 0`.",
      "data-span": "On a direct child: `2` spans two columns, `full` spans all columns. Reset to auto at one column.",
      "--ef-mosaic-space": "Gap between items. Default `--ef-primitive-spacing-4` (1rem)."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through items in source order; spans never change focus order." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Four columns", how: "viewport above 48rem", description: "Full editorial rhythm with spans." },
    { name: "Two columns", how: "viewport at or below 48rem", description: "`data-span=\"2\"` and `full` both fill the row." },
    { name: "One column", how: "viewport at or below 30rem", description: "Spans reset; items stack in source order." }
  ],
  accessibility: {
    forma: [
      "Spans change width only, never DOM, reading or focus order.",
      "Columns use `minmax(0, 1fr)` and children `min-inline-size: 0`, preventing horizontal overflow.",
      "Adds no roles or landmarks."
    ],
    consumer: [
      "Order items in the source by importance; span is invisible to assistive technology.",
      "Give every item a heading so the structure is navigable.",
      "Avoid gaps in the row rhythm by planning spans for the four-column layout; auto-placement will not backfill."
    ]
  },
  responsive: [
    "Viewport breakpoints at 48rem (two columns) and 30rem (one column).",
    "Because the column count is fixed per breakpoint, a mosaic in a narrow pane on a wide screen keeps four narrow columns; use [[responsive-grid]] for pane-level layouts.",
    "Long headings wrap inside their item."
  ],
  motion: [
    "No animation: the grid changes column count instantly at each breakpoint."
  ],
  guidance: {
    do: [
      "Feature one or two items; more spans flatten the emphasis.",
      "Plan rows so spans add up to four columns."
    ],
    avoid: [
      "Using span to signal status, severity or rank.",
      "Using a mosaic for data-driven collections of unknown size."
    ]
  },
  related: [
    { slug: "responsive-grid", note: "Container-driven columns with span helpers." },
    { slug: "grid", note: "Uniform collection of peers." },
    { slug: "card-grid", note: "Marketing card collections inside the site shell." }
  ]
};
