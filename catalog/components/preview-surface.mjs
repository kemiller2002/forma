export default {
  name: "Preview surface",
  category: "workspaces",
  behavior: "Application content",
  summary: "A bounded review surface for consequential content before an application commits or publishes it.",
  purpose: {
    description: "A preview surface frames exactly what will be sent, published, issued or committed, so the user can review it before an application-owned operation. It has a header naming what is previewed with optional view controls, a tinted canvas that visually separates the previewed material from the application around it, and a footer that states the commit status and holds the next step. The frame is presentation only: showing a preview never means the operation is authorized, and the footer must say in text that nothing has been committed yet.",
    useWhen: [
      "A user is about to publish, send, issue or commit content that others will see, such as an invoice, an announcement or a release note.",
      "The previewed material should be visually distinct from the editing interface around it.",
      "The user may want to check the material at different presentation sizes before continuing."
    ],
    avoidWhen: [
      "The user is comparing two versions: use [[diff-viewer]] or [[conflict-review]].",
      "The review is a checklist of prerequisites rather than content: use [[readiness-checklist]].",
      "A short confirmation is enough: use a [[dialog]].",
      "The content is a code sample in documentation: use [[code-sample]]."
    ],
    characteristics: [
      "The canvas uses the secondary surface color and responsive padding; an `article` inside it is a centered page up to 42rem wide.",
      "Header and footer are flex rows that stack their parts at 40rem and below.",
      "The footer is the place for the commit status in words and the next legal action supplied by the application."
    ]
  },
  examples: [
    {
      id: "announcement-before-send",
      title: "Announcement before sending",
      description: "An email announcement previewed before it goes to every customer. The view controls are toggle buttons with aria-pressed, the footer states the audience and that nothing has been sent, and the send action is a separate application-owned button.",
      html: `<ef-preview-surface class="ef-component-tag">
  <section class="ef-preview-surface" aria-labelledby="preview-surface-announcement-title">
    <header class="ef-preview-surface__header">
      <div><span class="ef-status-lozenge">Preview</span><h3 id="preview-surface-announcement-title">Maintenance announcement</h3></div>
      <div class="ef-preview-surface__controls" role="group" aria-label="Preview width">
        <button type="button" aria-pressed="true">Desktop</button>
        <button type="button" aria-pressed="false">Mobile</button>
      </div>
    </header>
    <div class="ef-preview-surface__canvas">
      <article aria-labelledby="preview-surface-announcement-subject">
        <h2 id="preview-surface-announcement-subject">Scheduled maintenance on 14 October</h2>
        <p>Hello, the dashboard will be read-only from 02:00 to 03:30 UTC while we upgrade our database. No data will be lost.</p>
      </article>
    </div>
    <footer class="ef-preview-surface__footer">
      <span>Not sent · 4,210 recipients</span>
      <button type="button">Send announcement</button>
    </footer>
  </section>
</ef-preview-surface>`
    },
    {
      id: "blocked-publish",
      title: "Preview with a blocking problem",
      description: "The preview renders, but the application has found a problem that blocks publishing. The footer says so in text and offers only the legal next step; there is no disabled Publish button that looks available.",
      html: `<ef-preview-surface class="ef-component-tag">
  <section class="ef-preview-surface" aria-labelledby="preview-surface-blocked-publish-title">
    <header class="ef-preview-surface__header">
      <div><span class="ef-status-lozenge" data-state="blocked">Cannot publish</span><h3 id="preview-surface-blocked-publish-title">Release notes 4.2</h3></div>
    </header>
    <div class="ef-preview-surface__canvas">
      <article aria-labelledby="preview-surface-blocked-publish-heading">
        <h2 id="preview-surface-blocked-publish-heading">What's new in 4.2</h2>
        <p>Bulk export now supports CSV and Parquet. See the migration guide for [missing link].</p>
      </article>
    </div>
    <footer class="ef-preview-surface__footer">
      <span>Not published · 1 broken link must be fixed first</span>
      <button type="button">Return to editor</button>
    </footer>
  </section>
</ef-preview-surface>`
    },
    {
      id: "mobile-invoice",
      title: "Mobile invoice preview",
      description: "At phone width the header and footer stack, the canvas padding shrinks and the previewed page fills the width.",
      mobile: {
        height: 560,
        notes: [
          "At 40rem and below the header and footer switch to a stretched column, so the title, controls, status and action each take the full width.",
          "Canvas and article padding use `clamp()` with `4vw`, shrinking to 1rem each at 320px so the previewed content keeps most of the width.",
          "Footer buttons keep the 2.75rem base height; stacked, they become full-width touch targets.",
          "Very wide previewed content (tables, images) still needs its own [[bounded-overflow]] region inside the article."
        ]
      },
      html: `<ef-preview-surface class="ef-component-tag">
  <section class="ef-preview-surface" aria-labelledby="preview-surface-mobile-title">
    <header class="ef-preview-surface__header">
      <div><span class="ef-status-lozenge">Preview</span><h3 id="preview-surface-mobile-title">Invoice INV-1042</h3></div>
    </header>
    <div class="ef-preview-surface__canvas">
      <article aria-labelledby="preview-surface-mobile-heading">
        <h2 id="preview-surface-mobile-heading">Acme Manufacturing</h2>
        <p>Consulting, September · $5,000.00 · due 4 October 2026</p>
      </article>
    </div>
    <footer class="ef-preview-surface__footer">
      <span>Not issued</span>
      <button type="button">Issue invoice</button>
    </footer>
  </section>
</ef-preview-surface>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "root section, article", values: "id of the preview title", default: "—", description: "Names the preview region by what is being previewed." },
      { name: "aria-pressed", on: "view control buttons", values: "true | false", default: "—", description: "Marks which preview width or mode is active. The application toggles it and changes the preview." },
      { name: "role", on: "controls container", values: "group", default: "—", description: "Groups the view controls under one name." },
      { name: "aria-label", on: "controls container", values: "string", default: "—", description: "Names the control group, for example \"Preview width\"." }
    ],
    hooks: {
      "ef-preview-surface": "Root bordered region.",
      "ef-preview-surface__header": "Title row with optional controls; a flex row that stacks at 40rem and below.",
      "ef-preview-surface__controls": "Wrapping group of view controls in the header.",
      "ef-preview-surface__canvas": "Tinted, padded area that holds the previewed material. A direct `article` child is drawn as a centered page up to 42rem wide.",
      "ef-preview-surface__footer": "Commit status and next action; wraps and stacks at 40rem and below."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through header controls, any links inside the previewed content, then footer actions." },
      { keys: "Enter / Space", action: "Activates the focused button. Native button behavior; the effect is application-owned." }
    ],
    events: [
      { name: "click", description: "Native click on view controls and footer actions. The application changes the preview or performs the operation." }
    ],
    form: "Not a form control. Footer actions may be submit buttons of an application form around the surface."
  },
  states: [
    { name: "Uncommitted", how: "footer text", description: "The footer states that the content has not yet been sent, published or issued." },
    { name: "Blocked", how: "status text and the actions the application renders", description: "The application explains the problem and offers only legal next steps." },
    { name: "View mode", how: "aria-pressed on header controls", description: "Which presentation the preview is showing; application-owned." },
    { name: "Stacked chrome", how: "@media (max-width: 40rem)", description: "Header and footer items stack and stretch." }
  ],
  accessibility: {
    forma: [
      "Separates previewed material from the application with a border, a tinted canvas and a page frame, not with color alone.",
      "Keeps header and footer controls at the base 2.75rem height and stacks them on narrow screens."
    ],
    consumer: [
      "State the commit status in words in the footer, such as \"Not sent\" or \"Not published\".",
      "Name the region by what is previewed and keep heading levels inside the previewed article sensible.",
      "Do not show an action the user is not allowed to take; the preview never implies authorization.",
      "If the preview can be out of date, say so and offer a refresh."
    ]
  },
  responsive: [
    "Header and footer are wrapping flex rows with space between; at 40rem and below they stack with `align-items: stretch`.",
    "Canvas padding is `clamp(1rem, 4vw, 3rem)` and the article's padding `clamp(1rem, 4vw, 2.5rem)`.",
    "The previewed article is capped at 42rem and centered, approximating a document page.",
    "Simulating a mobile width (the Mobile control) is application behavior; Forma does not resize the canvas."
  ],
  motion: [
    "No animation: the surface is static. Header and footer buttons use only the base perceptual hover and press color change."
  ],
  guidance: {
    do: [
      "Preview the exact output, generated by the same code path that will produce the committed version.",
      "Name the audience or scope next to the action (\"4,210 recipients\")."
    ],
    avoid: [
      "Styling the preview as if it were already published.",
      "Putting the commit action in the header, where it can be mistaken for a view control."
    ]
  },
  related: [
    { slug: "diff-viewer", note: "Shows changes between versions rather than a single rendered result." },
    { slug: "readiness-checklist", note: "Lists prerequisites before an operation; can sit beside the preview." },
    { slug: "verification-frame", note: "Structures recognize, verify and act for consequential decisions." },
    { slug: "focus-stage", note: "Layout that gives the preview the dominant region with support beside it." }
  ]
};
