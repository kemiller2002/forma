export default {
  name: "Badge",
  category: "site",
  behavior: "Site content",
  summary: "Compact labels and metadata; status badges carry meaning in text with a redundant colored edge.",
  owns: ["ef-badge", "ef-badge-list"],
  purpose: {
    description: "Badges are small mono-face labels for metadata on public pages: language, version, runtime, release status or topic. A badge is a `span` (or an `a` when it links somewhere) inside an unstyled `ul.ef-badge-list`, which wraps. `data-ef-status` adds a thicker inline-start edge in a status color; the badge text always states the status, so the edge is a redundant cue. The brand-neutral defaults make every status edge the primary text color; a theme or brand may give statuses distinct hues.",
    useWhen: [
      "Showing release status and version facts in a product hero.",
      "Listing technologies, standards or topics that describe a product or article.",
      "Linking a small set of related topics or a changelog from a page."
    ],
    avoidWhen: [
      "Showing record or workflow state in an application: use [[status-lozenge]].",
      "A status needs a message or an action: use [[alert]] or a [[callout]].",
      "The label is a main action: use a [[button]]."
    ],
    characteristics: [
      "Text is the primary cue; the status edge only repeats it. Status glyphs do not exist yet (GAP-MKT-08).",
      "Badges inside a list wrap onto new lines; the list is a native `ul`, so the count is announced.",
      "Linked badges have no underline; a stronger border on hover and the shell's focus ring mark them as interactive."
    ]
  },
  examples: [
    {
      id: "release-status",
      title: "Release status in a hero",
      description: "A product's release facts: a success status plus plain metadata badges, next to the hero actions.",
      html: `<ef-badge class="ef-component-tag">
  <div class="ef-site">
    <ul class="ef-badge-list" aria-label="Release facts">
      <li><span class="ef-badge" data-ef-status="success">Stable</span></li>
      <li><span class="ef-badge">Version 1.4.0</span></li>
      <li><span class="ef-badge">.NET 8</span></li>
      <li><span class="ef-badge">MIT licence</span></li>
    </ul>
  </div>
</ef-badge>`
    },
    {
      id: "lifecycle-statuses",
      title: "Lifecycle statuses",
      description: "All four status values on a component inventory. Each badge's text states the status; the edge color repeats it and depends on the theme.",
      html: `<ef-badge class="ef-component-tag">
  <div class="ef-site">
    <ul class="ef-badge-list" aria-label="Pattern lifecycle">
      <li><span class="ef-badge" data-ef-status="success">Stable: Site header</span></li>
      <li><span class="ef-badge" data-ef-status="info">New: Callout</span></li>
      <li><span class="ef-badge" data-ef-status="warning">Preview: Media hero</span></li>
      <li><span class="ef-badge" data-ef-status="danger">Deprecated: Landing layout</span></li>
    </ul>
  </div>
</ef-badge>`
    },
    {
      id: "mobile-topic-links",
      title: "Phone topic links",
      description: "Linked topic badges under an article at phone width. The list wraps onto several lines.",
      mobile: {
        height: 200,
        notes: [
          "The badge list wraps with a small gap, moving whole badges to the next line instead of scrolling horizontally.",
          "Linked badges are at least 24px tall and separated by the list gap, which meets the WCAG 2.2 minimum target size but is smaller than the 44px used for primary actions.",
          "Keep badge text short; long text wraps inside the badge rather than overflowing.",
          "Orientation changes only change how many badges fit per line."
        ]
      },
      html: `<ef-badge class="ef-component-tag">
  <div class="ef-site">
    <ul class="ef-badge-list" aria-label="Topics">
      <li><a class="ef-badge" href="#badge-mobile-topic-links-end">Accessibility</a></li>
      <li><a class="ef-badge" href="#badge-mobile-topic-links-end">Design tokens</a></li>
      <li><a class="ef-badge" href="#badge-mobile-topic-links-end">Forced colors</a></li>
      <li><a class="ef-badge" href="#badge-mobile-topic-links-end">Release engineering</a></li>
      <li id="badge-mobile-topic-links-end"><a class="ef-badge" href="#badge-mobile-topic-links-end">Typography</a></li>
    </ul>
  </div>
</ef-badge>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "ul.ef-badge-list", values: "string", default: "—", description: "Names the list (\"Release facts\", \"Topics\")." },
      { name: "href", on: "a.ef-badge", values: "URL", default: "—", description: "Makes a badge a link. Use an `a`, never a clickable `span`." }
    ],
    hooks: {
      "ef-badge-list": "Unstyled `ul` that wraps its badges with a small gap and vertical margin.",
      "ef-badge": "The badge: bordered mono label on the surrounding tone. On an `a` it gets a 24px minimum height and a stronger border on hover.",
      "data-ef-status": "`success`, `warning`, `danger` or `info`. Thickens the inline-start edge and colors it with `--ef-color-status-*`. The text must state the same status."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between linked badges; span badges are not focusable." },
      { keys: "Enter", action: "Follows a linked badge (native link behavior)." }
    ],
    events: []
  },
  states: [
    { name: "Plain", how: "span.ef-badge", description: "Neutral bordered label." },
    { name: "Status", how: "data-ef-status", description: "Accent-width inline-start edge in the status color; text states the status." },
    { name: "Link hover", how: "a.ef-badge:hover", description: "The border strengthens to the tone's strong rule." },
    { name: "Focus", how: ":focus-visible on a.ef-badge", description: "The shell's outline and halo." }
  ],
  accessibility: {
    forma: [
      "Never relies on the status color: the edge is redundant with the badge text, and defaults are hue-free.",
      "Draws a solid system-color border on badges in forced colors.",
      "Keeps linked badges at a 24px minimum height with visible focus."
    ],
    consumer: [
      "Write the status in the badge text (\"Stable\", \"Deprecated\"), not only in `data-ef-status`.",
      "Put badges in a labelled list.",
      "Use `a` for badges that navigate; do not make spans interactive with script."
    ]
  },
  responsive: [
    "The list is a wrapping flex row; badges wrap to new lines as space shrinks.",
    "Badges size to their text; there are no breakpoints."
  ],
  motion: [
    "No animation: hover changes the border color of linked badges instantly."
  ],
  guidance: {
    do: [
      "Keep badges to one or two words of metadata.",
      "Use status badges sparingly, usually one per product or item."
    ],
    avoid: [
      "Using badges as buttons or primary navigation.",
      "Encoding meaning only in the edge color."
    ]
  },
  related: [
    { slug: "status-lozenge", note: "Application state labels with structural cues." },
    { slug: "facts", note: "For claims that need a supporting detail line." },
    { slug: "hero", note: "Release badges often sit in the hero content." }
  ]
};
