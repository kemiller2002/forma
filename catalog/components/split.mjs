export default {
  name: "Split",
  category: "layout",
  behavior: "Native CSS",
  summary: "Marketing-layer two-part layout: a dominant primary region and a supporting region that wraps below when space runs out.",
  purpose: {
    description: "A split puts a dominant primary region beside a supporting region on site pages: install steps beside requirements, a product explanation beside a code sample, a narrative beside a quote. The first child keeps at least 55% of the row and absorbs extra space; the last child prefers about a third of the row, between 18rem and 30rem. When both cannot fit, the supporting region wraps below the primary one. The switch is content-driven with no breakpoint, and the gap uses the site's fluid section spacing, so place it inside `.ef-site`.",
    useWhen: [
      "A marketing or documentation page region has one main message and one supporting block.",
      "The supporting block (requirements, a code sample, a quote, a form) should sit beside the main text on wide screens and below it on narrow ones.",
      "The layout should reflow by the space available to it rather than by viewport breakpoints."
    ],
    avoidWhen: [
      "You are laying out an application view: use [[switcher]] or [[sidebar]], which use application spacing.",
      "Users must resize the two parts: use [[resizable-split-pane]].",
      "The region is the page's opening statement: [[hero]] has the same content-and-aside structure plus hero typography.",
      "There are more than two parts: use [[card-grid]] or [[grid]]."
    ],
    characteristics: [
      "Only the first and last children are sized; use exactly two children.",
      "Children align to the start of the cross axis, so a short aside does not stretch.",
      "Stacked order is source order: the primary region is always above the supporting one when wrapped."
    ]
  },
  examples: [
    {
      id: "product-code-sample",
      title: "Product explanation with a code sample",
      description: "Primary text explains the configuration; the supporting region is a code sample. On a wide page they sit side by side; as the page narrows the code wraps below the explanation.",
      html: `<ef-split class="ef-component-tag">
  <div class="ef-site">
    <div class="ef-split">
      <div>
        <h2>Pin one version per site</h2>
        <p>Each site records the exact Forma release it uses in a lock file. Upgrades are explicit, reviewed and reversible.</p>
      </div>
      <figure class="ef-code-figure">
        <figcaption id="split-product-code-sample-caption">forma.lock</figcaption>
        <pre class="ef-code" tabindex="0" aria-labelledby="split-product-code-sample-caption"><code>forma 0.3.0
destination assets/forma</code></pre>
      </figure>
    </div>
  </div>
</ef-split>`
    },
    {
      id: "narrative-with-facts",
      title: "Narrative with key facts",
      description: "A customer story with a facts list as the supporting region. The facts keep a readable width between 18rem and 30rem while the story absorbs the remaining space.",
      html: `<ef-split class="ef-component-tag">
  <div class="ef-site">
    <div class="ef-split">
      <article aria-labelledby="split-narrative-with-facts-title">
        <h2 id="split-narrative-with-facts-title">How Fabrikam moved 40 sites in a weekend</h2>
        <p>The team migrated every regional site to the shared design system without changing a single URL, then retired four separate stylesheets.</p>
      </article>
      <aside aria-labelledby="split-narrative-with-facts-facts">
        <h3 id="split-narrative-with-facts-facts">At a glance</h3>
        <dl class="ef-facts">
          <div class="ef-facts__item"><dt>40 sites</dt><dd>Migrated in two days</dd></div>
          <div class="ef-facts__item"><dt>4 stylesheets</dt><dd>Retired after launch</dd></div>
        </dl>
      </aside>
    </div>
  </div>
</ef-split>`
    },
    {
      id: "mobile-wrapped",
      title: "Mobile wrapped split",
      description: "The install layout at phone width. The primary region needs 55% of the row and the aside at least 18rem, so they cannot share a line and the aside wraps below.",
      mobile: {
        height: 460,
        notes: [
          "Below roughly 44rem of available width the supporting region wraps onto its own line and both regions become full width.",
          "The primary region's minimum is `min(100%, 55%)`, so it never overflows a 320px screen.",
          "The gap between the stacked regions is the fluid section spacing, which shrinks on small screens.",
          "Order does not change on rotation; landscape tablets usually show both regions side by side."
        ]
      },
      html: `<ef-split class="ef-component-tag">
  <div class="ef-site">
    <div class="ef-split">
      <div>
        <h2>Install</h2>
        <p>Run the installer once per site. It verifies every download against the release checksums.</p>
      </div>
      <aside aria-labelledby="split-mobile-wrapped-requirements">
        <h3 id="split-mobile-wrapped-requirements">Requirements</h3>
        <p>Bash 4 or later and a network connection to the release host.</p>
      </aside>
    </div>
  </div>
</ef-split>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "article / aside", values: "id of the region heading", default: "—", description: "Names each region by its heading." },
      { name: "tabindex", on: "pre.ef-code", values: "0", default: "—", description: "Makes a scrollable code block keyboard-scrollable in the code sample example." }
    ],
    hooks: {
      "ef-split": "Wrapping flex row. First child: `flex: 999 1 0` with minimum `min(100%, 55%)`. Last child: basis `clamp(18rem, 32%, 30rem)`. Gap is half the fluid section space."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the primary region and then the supporting region, in source order." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Side by side", how: "row fits 55% plus the aside basis and gap", description: "Primary region grows; supporting region stays between 18rem and 30rem." },
    { name: "Wrapped", how: "row too narrow", description: "Supporting region moves below the primary region at full width." }
  ],
  accessibility: {
    forma: [
      "Wrapping never reorders content; reading and focus order match the visual order.",
      "Clamped minimums keep both regions inside a 320px viewport.",
      "Adds no roles or landmarks."
    ],
    consumer: [
      "Put the primary message first in the source.",
      "Label aside regions so their landmarks are distinguishable.",
      "Make scrollable code or tables in the supporting region keyboard-focusable."
    ]
  },
  responsive: [
    "Content-driven wrap with no media queries; the switch depends on the split's own width.",
    "Gap uses `--ef-layout-section-space`, a fluid token, so spacing scales with the viewport.",
    "Place it inside `.ef-site`: its gap and the surrounding typography and tone come from the marketing role tokens."
  ],
  motion: [
    "No animation: regions wrap instantly."
  ],
  guidance: {
    do: [
      "Use exactly two children: primary first, supporting last.",
      "Keep the supporting region short enough to read at 18rem."
    ],
    avoid: [
      "Adding a third child; middle children receive no sizing rules.",
      "Using split inside application views; use [[switcher]] there."
    ]
  },
  related: [
    { slug: "switcher", note: "Application-layer primary/secondary pair with application spacing." },
    { slug: "hero", note: "Opening page region with the same content-and-aside rhythm." },
    { slug: "split-pane", note: "Fixed two-pane application layout; shares the `--ef-split-` variable prefix but is unrelated." },
    { slug: "container", note: "Constrains the width a split sits in." }
  ]
};
