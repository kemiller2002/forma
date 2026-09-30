export default {
  name: "Code sample",
  category: "site",
  behavior: "Site content",
  summary: "Technical sample in a captioned, keyboard-scrollable region that never widens the page.",
  owns: ["ef-code", "ef-code-figure"],
  purpose: {
    description: "A code sample shows a command, configuration file or snippet on a public page. The canonical form is a `figure.ef-code-figure` with a `figcaption` and a `pre.ef-code` holding `code`. The `pre` is a bounded scroll container on the inverse surface: long lines scroll inside it instead of widening the page, and `tabindex=\"0\"` lets keyboard users focus it and scroll with the arrow keys. There is no copy button and no syntax highlighting; those would need application script and validated token roles (GAP-MKT-09).",
    useWhen: [
      "Showing install commands, lock files or configuration on a product or documentation page.",
      "The sample must be copied exactly, so lines must not wrap.",
      "Pairing an install procedure in [[steps]] with the command it runs."
    ],
    avoidWhen: [
      "A short identifier or command inside a sentence: use inline `code` in [[prose]].",
      "Showing changes between two versions: use [[diff-viewer]].",
      "Showing an application identifier users need to copy: use [[identifier]]."
    ],
    characteristics: [
      "Lines keep their formatting (`pre`) and scroll horizontally inside the block; `tab-size` is 2.",
      "The block uses the inverse surface and inverse text on every page tone, so it reads the same inside toned sections.",
      "The caption is visible, in the mono label size, and names the scroll region through `aria-labelledby`."
    ]
  },
  examples: [
    {
      id: "long-command",
      title: "Long command line",
      description: "A single command longer than the column. The line does not wrap; the block scrolls horizontally and can be scrolled from the keyboard once focused.",
      html: `<ef-code-sample class="ef-component-tag">
  <div class="ef-site">
    <figure class="ef-code-figure">
      <figcaption id="code-sample-long-command-caption">Download the pinned installer</figcaption>
      <pre class="ef-code" tabindex="0" aria-labelledby="code-sample-long-command-caption"><code>curl -fsSLO https://raw.githubusercontent.com/kemiller2002/forma/v0.3.0/actions/install-presentation/install.sh</code></pre>
    </figure>
  </div>
</ef-code-sample>`
    },
    {
      id: "workflow-file",
      title: "Deployment workflow file",
      description: "A multi-line YAML file inside a prose article. Indentation is preserved and the block takes the prose region's block margins.",
      html: `<ef-code-sample class="ef-component-tag">
  <div class="ef-site">
    <article class="ef-prose">
      <h3>Deploy with pinned assets</h3>
      <p>The workflow installs exactly what the lock pins before the site build.</p>
      <figure class="ef-code-figure">
        <figcaption id="code-sample-workflow-file-caption">.github/workflows/deploy-pages.yml</figcaption>
        <pre class="ef-code" tabindex="0" aria-labelledby="code-sample-workflow-file-caption"><code>jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: kemiller2002/forma/actions/install-presentation@v0.3.0
        with:
          lock: forma.lock
      - run: ./build.sh</code></pre>
      </figure>
    </article>
  </div>
</ef-code-sample>`
    },
    {
      id: "mobile-lock-file",
      title: "Phone lock file",
      description: "A lock file with a long checksum line at phone width.",
      mobile: {
        height: 300,
        notes: [
          "The block is capped at 100% of its column; long lines such as checksums scroll inside it and never cause page-level horizontal scrolling.",
          "Swipe horizontally inside the block to read long lines; keyboard users focus it with Tab and scroll with the arrow keys.",
          "Padding comes from the fluid block-space token, so more of each line is visible on narrow screens.",
          "The caption wraps above the block; landscape orientation shows more of each line without changing layout."
        ]
      },
      html: `<ef-code-sample class="ef-component-tag">
  <div class="ef-site">
    <figure class="ef-code-figure">
      <figcaption id="code-sample-mobile-lock-file-caption">forma.lock</figcaption>
      <pre class="ef-code" tabindex="0" aria-labelledby="code-sample-mobile-lock-file-caption"><code>forma 0.3.0
repository kemiller2002/forma
destination assets/forma
asset forma-echelon-marketing.css sha256:9f2c4e1a7b3d5c8e0f6a2b4d6e8f0a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f</code></pre>
    </figure>
  </div>
</ef-code-sample>`
    }
  ],
  api: {
    attributes: [
      { name: "tabindex", on: "pre.ef-code", values: "0", default: "—", description: "Makes the scroll region focusable so keyboard users can scroll overflowing lines." },
      { name: "aria-labelledby", on: "pre.ef-code", values: "id of the figcaption", default: "—", description: "Gives the focusable region the caption as its name, so focus does not land on an unnamed stop." },
      { name: "id", on: "figcaption", values: "string", default: "—", description: "Referenced by the pre's aria-labelledby." }
    ],
    hooks: {
      "ef-code-figure": "The `figure` wrapper. Removes the default figure margin; its `figcaption` becomes a muted mono label above the block.",
      "ef-code": "The `pre`: bounded (`max-inline-size: 100%`), scrolls on overflow, inverse surface and text, mono small type, `tab-size: 2`. A `code` inside inherits its color and size and does not wrap."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Focuses the code block (tabindex=0); the shell's focus ring surrounds it." },
      { keys: "Arrow keys, Page Up / Page Down, Home / End", action: "Native scrolling of the focused block when its content overflows." }
    ],
    events: []
  },
  states: [
    { name: "Fits", how: "content within the column", description: "No scrollbar; the block is still focusable." },
    { name: "Overflowing", how: "overflow: auto", description: "Long lines scroll horizontally inside the block." },
    { name: "Focus", how: ":focus-visible", description: "The shell's outline and halo around the block." },
    { name: "Forced colors", how: "@media (forced-colors: active)", description: "A CanvasText border keeps the block delineated." }
  ],
  accessibility: {
    forma: [
      "Keeps the sample in a bounded region so the page never scrolls horizontally (WCAG 1.4.10 reflow).",
      "Uses inverse text on the inverse surface, a validated contrast pair.",
      "Draws a visible focus ring on the focused block and a border in forced colors; keeps it whole across printed pages."
    ],
    consumer: [
      "Add `tabindex=\"0\"` and name the block with a visible caption via `aria-labelledby`.",
      "Escape `<`, `>` and `&` in the sample.",
      "If a copy button is needed, implement it in site or application code; Forma provides none."
    ]
  },
  responsive: [
    "`max-inline-size: 100%` with `overflow: auto`: long lines scroll inside the block at every width.",
    "No breakpoints; padding is fluid."
  ],
  motion: [
    "No animation: the block is static. Scrolling is native."
  ],
  guidance: {
    do: [
      "Caption every sample with what it is or where it goes (a file name or purpose).",
      "Keep samples short and runnable as shown."
    ],
    avoid: [
      "Wrapping or breaking lines of commands that must be copied exactly.",
      "Placing prose explanations inside the code block."
    ]
  },
  related: [
    { slug: "prose", note: "Long-form text; use inline code for short identifiers." },
    { slug: "steps", note: "The procedure a sample often accompanies." },
    { slug: "diff-viewer", note: "For comparing versions of code." },
    { slug: "identifier", note: "For a single copyable value in applications." }
  ]
};
