export default {
  name: "Feed item",
  category: "data",
  behavior: "Application content",
  summary: "Compact chronological item with explicit identity, state, metadata, and owned actions.",
  purpose: {
    description: "A feed item is one entry in an activity or notification stream: where it came from, what it is about, its state and time, a one-line summary, and the actions that belong to it. Forma lays it out as a two-column grid with identity on the start side and status/time on the end side, and gives the summary and actions full rows beneath. The application decides what appears in the feed, its order, what the state means and which actions are legal.",
    useWhen: [
      "A stream of events or notifications is triaged one item at a time, and each item may have its own action.",
      "Each item needs a visible source, title, state and time at a glance.",
      "Items appear in a list or inbox that users scan top to bottom."
    ],
    avoidWhen: [
      "The list is a historical record without actions: use [[timeline]].",
      "Items are unresolved work ranked by attention with one next action each: use [[work-queue]].",
      "The item is a transient system message: use [[toast]] or [[alert]].",
      "Items are messages in a conversation: use [[conversation]]."
    ],
    characteristics: [
      "Grid of `minmax(0, 1fr) auto`: identity on the start side, meta (status and time) on the end side.",
      "`.ef-feed-item__summary` and `.ef-feed-item__actions` span both columns.",
      "Margins are removed from the primary heading and paragraph and from the summary, so items stay compact.",
      "At 30rem and below the grid becomes one column and the meta row aligns to the start."
    ]
  },
  examples: [
    {
      id: "mention-with-actions",
      title: "Mention with several actions",
      description: "A comment mention with two owned actions. The buttons name the item they act on, because many feed items can carry a Reply button.",
      html: `<ef-feed-item class="ef-component-tag">
  <article class="ef-feed-item" aria-labelledby="feed-item-mention-with-actions-title">
    <div class="ef-feed-item__primary">
      <p>Comment on INV-1042</p>
      <h2 id="feed-item-mention-with-actions-title">Priya Raman mentioned you</h2>
    </div>
    <div class="ef-feed-item__meta">
      <span class="ef-status-lozenge">Unread</span>
      <time datetime="2026-09-29T09:41:00Z">09:41</time>
    </div>
    <p class="ef-feed-item__summary">“Can you confirm the revised payment terms before I send this to Acme?”</p>
    <div class="ef-feed-item__actions ef-cluster">
      <button type="button" aria-label="Reply to Priya Raman on INV-1042">Reply</button>
      <button type="button" aria-label="Mark Priya Raman's mention as read">Mark as read</button>
    </div>
  </article>
</ef-feed-item>`
    },
    {
      id: "resolved-without-actions",
      title: "Resolved item without actions",
      description: "An item that no longer needs anything. The application renders no actions region, and the state reads Resolved in words.",
      html: `<ef-feed-item class="ef-component-tag">
  <article class="ef-feed-item" aria-labelledby="feed-item-resolved-without-actions-title">
    <div class="ef-feed-item__primary">
      <p>Monitoring</p>
      <h2 id="feed-item-resolved-without-actions-title">Checkout latency back within limits</h2>
    </div>
    <div class="ef-feed-item__meta">
      <span class="ef-status-lozenge" data-state="ok">Resolved</span>
      <time datetime="2026-09-29T06:12:00Z">06:12</time>
    </div>
    <p class="ef-feed-item__summary">p95 latency returned below 400 ms after the cache node was replaced.</p>
  </article>
</ef-feed-item>`
    },
    {
      id: "feed-list-long-title",
      title: "Feed list with a long title",
      description: "Several items stacked in a labelled section. A long, translated title wraps in the start column while the meta column keeps its natural width.",
      html: `<ef-feed-item class="ef-component-tag">
  <section class="ef-stack" data-density="standard" aria-label="Recent activity">
    <article class="ef-feed-item" lang="fr" aria-labelledby="feed-item-feed-list-long-title-first">
      <div class="ef-feed-item__primary">
        <p>Système de facturation</p>
        <h2 id="feed-item-feed-list-long-title-first">La validation de la publication du rapport trimestriel nécessite une revue manuelle</h2>
      </div>
      <div class="ef-feed-item__meta">
        <span class="ef-status-lozenge" data-state="attention">À vérifier</span>
        <time datetime="2026-09-29T10:02:00Z">10:02</time>
      </div>
      <div class="ef-feed-item__actions"><button type="button" aria-label="Examiner la validation du rapport trimestriel">Examiner</button></div>
    </article>
    <article class="ef-feed-item" aria-labelledby="feed-item-feed-list-long-title-second">
      <div class="ef-feed-item__primary">
        <p>Build system</p>
        <h2 id="feed-item-feed-list-long-title-second">Nightly build passed</h2>
      </div>
      <div class="ef-feed-item__meta">
        <span class="ef-status-lozenge" data-state="ok">Passed</span>
        <time datetime="2026-09-29T02:00:00Z">02:00</time>
      </div>
    </article>
  </section>
</ef-feed-item>`
    },
    {
      id: "mobile-feed-item",
      title: "Mobile feed item",
      description: "A blocked deployment item at phone width. Status and time move under the title; the summary and action follow in reading order.",
      mobile: {
        height: 340,
        notes: [
          "At 30rem (480px) and below the grid becomes a single `minmax(0, 1fr)` column and `.ef-feed-item__meta` aligns to the start under the title.",
          "Status and time wrap onto separate lines if they do not fit side by side.",
          "Actions keep their natural width; the application can give a single primary action full width if the item is the main target.",
          "Reading order is identical at every width because only grid placement changes."
        ]
      },
      html: `<ef-feed-item class="ef-component-tag">
  <article class="ef-feed-item" aria-labelledby="feed-item-mobile-feed-item-title">
    <div class="ef-feed-item__primary">
      <p>Deployments</p>
      <h2 id="feed-item-mobile-feed-item-title">Release rel-2026.09.29 is blocked</h2>
    </div>
    <div class="ef-feed-item__meta">
      <span class="ef-status-lozenge" data-state="blocked">Blocked</span>
      <time datetime="2026-09-29T11:20:00Z">11:20</time>
    </div>
    <p class="ef-feed-item__summary">Two required checks have not reported.</p>
    <div class="ef-feed-item__actions"><button type="button" aria-label="View blocked checks for rel-2026.09.29">View checks</button></div>
  </article>
</ef-feed-item>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "article.ef-feed-item", values: "id of the item heading", default: "—", description: "Names the article by its title so it can be found in a list of articles." },
      { name: "datetime", on: "time", values: "ISO date-time", default: "—", description: "Machine-readable time of the item." },
      { name: "aria-label", on: "action button", values: "string", default: "—", description: "Names the item an action applies to when the visible label is generic." },
      { name: "type", on: "button", values: "button", default: "—", description: "Actions are native buttons that the application wires to its own handlers." }
    ],
    hooks: {
      "ef-feed-item": "The item root, usually an `article`. Two-column grid; one column at 30rem and below.",
      "ef-feed-item__primary": "Start column: source line and title. Margins on its `h2` and `p` are removed.",
      "ef-feed-item__meta": "End column: status and time in a wrapping row, end-aligned (start-aligned on phones).",
      "ef-feed-item__summary": "Optional one-line summary spanning the full width.",
      "ef-feed-item__actions": "Optional actions row spanning the full width."
    },
    keyboard: [
      { keys: "Tab", action: "Moves to each action button in the item. The item itself is not focusable." },
      { keys: "Enter / Space", action: "Activates a focused action button (native)." }
    ],
    events: [
      { name: "click", description: "Native click on action buttons; the application performs the action and updates or removes the item." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "With actions", how: ".ef-feed-item__actions present", description: "Actions row below the summary." },
    { name: "No actions", how: "actions element omitted", description: "The item ends after its summary or meta." },
    { name: "Item state", how: "[[status-lozenge]] text in .ef-feed-item__meta", description: "Unread, Resolved, Blocked and so on are stated in words by the application." },
    { name: "Stacked", how: "viewport ≤ 30rem", description: "Single column with meta aligned to the start." }
  ],
  accessibility: {
    forma: [
      "Keeps DOM order equal to reading order at every width: source, title, state, time, summary, actions.",
      "Leaves state as visible text (typically a [[status-lozenge]] with a glyph), not color.",
      "Lets the title and summary wrap (`minmax(0, 1fr)`), so long content does not overflow."
    ],
    consumer: [
      "Give each item a heading at the right level and reference it with `aria-labelledby`.",
      "Provide record-specific accessible names for repeated actions such as Reply or Review.",
      "Render only actions that are currently legal; do not show disabled actions without an explanation.",
      "Group items in a labelled section or list and announce newly arrived items through an application live region if the feed updates live."
    ]
  },
  responsive: [
    "Above 30rem: identity and meta side by side; summary and actions full width.",
    "At 30rem and below: one column, meta start-aligned under the title.",
    "Long titles wrap within the start column; the meta column keeps its natural width on wide layouts."
  ],
  motion: [
    "No animation: items appear, update and disappear without transitions. Any insertion animation or read/unread effect is application behavior."
  ],
  guidance: {
    do: [
      "Show the source and the time on every item.",
      "Keep one clear primary action per item, or none when nothing is needed."
    ],
    avoid: [
      "Using bold or background color alone to signal unread; write Unread.",
      "Relative times without a machine-readable `datetime`.",
      "Packing several unrelated actions into one item."
    ]
  },
  related: [
    { slug: "timeline", note: "Chronological history of a record, without per-item actions." },
    { slug: "work-queue", note: "Unresolved work ordered by attention with a reason and a legal next action." },
    { slug: "toast", note: "A transient message about something that just happened." },
    { slug: "status-lozenge", note: "Text-and-glyph state used in the meta row." }
  ]
};
