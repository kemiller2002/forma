export default {
  name: "Task list",
  category: "feedback",
  behavior: "Application state",
  summary: "A short list of things the user must do, each with a state ring, a plain title, one sentence of reason and consequence, a status in words and exactly one primary next action.",
  purpose: {
    description: "A task list is the \"Needs your attention\" block of a consumer dashboard. Each item names its subject in plain words, says in one sentence why it matters and what happens if it is left, states its status in words with a sentence-case [[status-lozenge]], and offers exactly one next action. Forma draws a native list with an icon in a state-coloured ring, a title, the status, the reason and an action area that sits under the text in narrow containers and at the end of the row in wide ones. The application decides which tasks exist and removes an item only when the underlying task is resolved, never because the user dismissed it.",
    useWhen: [
      "A consumer needs to see, near the top of a page, the few things only they can do: verify an account, renew a consent, sign a document.",
      "Each item has one obvious next step that resolves it.",
      "Items stay until the task is resolved, so the list is a reliable record of what is outstanding."
    ],
    avoidWhen: [
      "Staff work through a dense queue with columns, filters and assignment: use [[work-queue]].",
      "The message is information only and needs no action (a new feature, a completed payment): use [[alert]] or [[callout]]; mixing them pushes real tasks down the page.",
      "The items are prerequisites of one transition: use [[readiness-checklist]]."
    ],
    characteristics: [
      "Every item has exactly one action; give it `data-forma-variant=\"primary\"` only on the single most important item.",
      "State is said three ways: the ring glyph (× blocked, ! attention), the status words and, for blocked items, a heavier ring.",
      "The action is named by its own words and described by the item title through `aria-describedby`.",
      "Items reflow by container width, not viewport: the action moves to the end of the row from 40rem of available width."
    ]
  },
  basicInteraction: { kind: "static", reasons: ["placeholder-navigation"] },
  examples: [
    {
      id: "nothing-outstanding",
      title: "Nothing outstanding",
      description: "When every task is resolved the heading stays and a sentence says so, so the user learns the block is empty rather than missing.",
      html: `<forma-task-list class="forma-component-tag">
  <section class="forma-task-list" aria-labelledby="task-list-nothing-outstanding-title">
    <h2 id="task-list-nothing-outstanding-title">Needs your attention</h2>
    <p class="forma-task-list__empty">Nothing needs your attention. We will list tasks here when you need to act.</p>
  </section>
</forma-task-list>`
    },
    {
      id: "single-signature",
      interaction: { kind: "static", reasons: ["application-behavior"] },
      title: "One task with a long title",
      description: "A single task whose title and reason are long. The ring keeps its size, the text wraps beside it and the one action stays a full-size target.",
      html: `<forma-task-list class="forma-component-tag">
  <section class="forma-task-list" aria-labelledby="task-list-single-signature-title">
    <h2 id="task-list-single-signature-title">Needs your attention</h2>
    <ul class="forma-task-list__items">
      <li class="forma-task-list__item" data-state="attention">
        <span class="forma-task-list__icon" aria-hidden="true">!</span>
        <h3 class="forma-task-list__title" id="task-list-single-signature-item">Sign the updated account agreement for the Riverside Community Partnership account</h3>
        <span class="forma-task-list__status forma-status-lozenge" data-forma-variant="sentence" data-state="attention">Due 14 November</span>
        <p class="forma-task-list__reason">The agreement changes how statements are delivered; new requests are held after 14 November until it is signed.</p>
        <div class="forma-task-list__action">
          <button type="button" data-forma-variant="primary" aria-describedby="task-list-single-signature-item">Review and sign</button>
        </div>
      </li>
    </ul>
  </section>
</forma-task-list>`
    },
    {
      id: "mobile-dashboard",
      interaction: { kind: "static", reasons: ["placeholder-navigation"] },
      title: "Dashboard tasks on a phone",
      description: "Two tasks at phone width in comfortable density.",
      mobile: {
        height: 520,
        notes: [
          "Below 40rem of container width each item stacks title, status, reason and action beside the ring, so nothing scrolls sideways at 320px.",
          "The action keeps a 44px target; `data-forma-density=\"comfortable\"` keeps rows at least 44px tall.",
          "Keep the list short (three to five items) so the rest of the dashboard stays in the first screens."
        ]
      },
      html: `<forma-task-list class="forma-component-tag">
  <section class="forma-task-list" data-forma-density="comfortable" aria-labelledby="task-list-mobile-dashboard-title">
    <h2 id="task-list-mobile-dashboard-title">Needs your attention</h2>
    <ul class="forma-task-list__items">
      <li class="forma-task-list__item" data-state="blocked">
        <span class="forma-task-list__icon" aria-hidden="true">×</span>
        <h3 class="forma-task-list__title" id="task-list-mobile-dashboard-id">Confirm your identity</h3>
        <span class="forma-task-list__status forma-status-lozenge" data-forma-variant="sentence" data-state="blocked">Action required</span>
        <p class="forma-task-list__reason">New requests are paused until your identity is confirmed.</p>
        <div class="forma-task-list__action"><a class="forma-button" data-forma-variant="primary" href="#task-list-mobile-dashboard-title" aria-describedby="task-list-mobile-dashboard-id">Confirm identity</a></div>
      </li>
      <li class="forma-task-list__item" data-state="attention">
        <span class="forma-task-list__icon" aria-hidden="true">!</span>
        <h3 class="forma-task-list__title" id="task-list-mobile-dashboard-address">Check your mailing address</h3>
        <span class="forma-task-list__status forma-status-lozenge" data-forma-variant="sentence" data-state="attention">Returned mail</span>
        <p class="forma-task-list__reason">Your last statement came back undelivered.</p>
        <div class="forma-task-list__action"><a class="forma-button" href="#task-list-mobile-dashboard-title" aria-describedby="task-list-mobile-dashboard-address">Update address</a></div>
      </li>
    </ul>
  </section>
</forma-task-list>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.forma-task-list", values: "id of the list heading", default: "—", description: "Names the region from its visible heading." },
      { name: "data-state", on: "li.forma-task-list__item", values: "blocked | attention", default: "absent (neutral ring)", description: "Colours the ring and, for blocked, thickens it. Presentation only: the status words carry the meaning." },
      { name: "aria-hidden", on: "span.forma-task-list__icon", values: "true", default: "—", description: "The ring glyph or icon is decorative; the status lozenge states the state in words." },
      { name: "aria-describedby", on: "the item's action", values: "id of the item title", default: "—", description: "Gives the action the subject as its description, so \"Verify account\" is announced with what it is about." },
      { name: "data-forma-density", on: "section.forma-task-list or an ancestor", values: "comfortable | compact", default: "absent", description: "Sets the minimum item height and block padding from the shared density switch." },
      { name: "data-forma-variant", on: "the action", values: "primary", default: "absent", description: "Use on at most one action in the list, usually the first blocked item." }
    ],
    hooks: {
      "forma-task-list": "Root section; an inline-size container named `forma-task-list` that chooses the item layout.",
      "forma-task-list__items": "Unstyled native list (`ul`).",
      "forma-task-list__item": "Grid of a 2.25rem ring column and the text column; from 40rem of container width the action moves to a third column.",
      "forma-task-list__icon": "2.25rem ring drawn in `currentColor`, coloured by the item's `data-state`. Holds a glyph or a Forma icon.",
      "forma-task-list__title": "The subject in plain words (a heading).",
      "forma-task-list__status": "Place for the sentence-case status lozenge.",
      "forma-task-list__reason": "One sentence of reason and consequence.",
      "forma-task-list__action": "Wrapping area for the item's single action.",
      "forma-task-list__empty": "Sentence shown when no task is outstanding.",
      "data-state": "On the item: `blocked` colours the ring with status.danger and thickens it; `attention` uses status.warning.",
      "data-forma-density": "On an ancestor: item minimum height `--forma-density-row-min` and block padding `--forma-density-cell-block`."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between item actions in list order. Items themselves are not focusable." },
      { keys: "Enter / Space", action: "Activates the focused action (Space only for buttons)." }
    ],
    events: [
      { name: "click", description: "Native activation of an item action. The application performs the task; the item leaves the list when the task is resolved." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Blocked", how: "li data-state=\"blocked\"", description: "Danger ring with a heavier border and a × glyph; something is paused until the user acts." },
    { name: "Attention", how: "li data-state=\"attention\"", description: "Warning ring with a ! glyph; a deadline or a problem the user should handle soon." },
    { name: "Neutral", how: "no data-state", description: "Text-coloured ring for a task with no urgency." },
    { name: "Empty", how: "forma-task-list__empty in place of the list", description: "A sentence saying nothing is outstanding." }
  ],
  accessibility: {
    forma: [
      "Uses a native list, so assistive technology announces how many tasks there are.",
      "State never depends on colour: glyph, status words and ring weight repeat it, and forced colours draw the ring in CanvasText.",
      "Item actions keep the button and link target sizes (44px, or the density target)."
    ],
    consumer: [
      "Give each item a title that names the subject and one sentence that says why it matters and what happens otherwise.",
      "Give each item exactly one action, named with a verb and object, described by the title with `aria-describedby`.",
      "Remove an item only when the task is resolved; never offer dismiss or snooze for a task the user must do.",
      "Keep information-only notices out of the list."
    ]
  },
  responsive: [
    "Layout follows the list's own width (container query), so the same markup works in a sidebar and a full-width column.",
    "Below 40rem of container width the action sits under the reason; from 40rem it moves to the end of the row.",
    "Titles and reasons wrap; nothing in an item forces horizontal scrolling at 320px."
  ],
  motion: [
    "No animation. Items appear and disappear when the application re-renders the list."
  ],
  guidance: {
    do: [
      "Order items by consequence: blocked first, then deadlines.",
      "Say what happens if the task is left (\"Transfers are paused\")."
    ],
    avoid: [
      "More than one action per item, or a dismiss control.",
      "Using the list for announcements, tips or completed events."
    ]
  },
  related: [
    { slug: "work-queue", note: "A dense staff queue with columns and assignment rather than a consumer's few tasks." },
    { slug: "readiness-checklist", note: "Prerequisites of one transition, not independent tasks." },
    { slug: "alert", note: "Information the user should know but need not act on." },
    { slug: "status-lozenge", note: "The sentence variant states each task's status in words." }
  ]
};
