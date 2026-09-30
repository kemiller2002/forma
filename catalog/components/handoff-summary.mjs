export default {
  name: "Handoff summary",
  category: "assisted",
  behavior: "Application / Ordo",
  summary: "Exposes agent identity, proposal, uncertainty, evidence scope, and retained human authority.",
  purpose: {
    description: "A handoff summary is the point where an agent stops and a human decides. It names the agent that did the work, states the proposed consequence, the evidence the agent relied on and its scope, what remains uncertain, and who holds the authority to approve. It is a labelled definition list with the decision actions after it. Forma lays out the labelled facts and nothing more: which actions exist, whether the current user may take them, and what happens when they do are Ordo or application decisions. The summary must make uncertainty and missing evidence as visible as the proposal itself.",
    useWhen: [
      "An automated agent has prepared a consequential change (publishing, sending, merging, paying) and a person must approve, reject or redirect it.",
      "Reviewers need to see which agent acted, on what evidence and with what known gaps.",
      "Human authority over the outcome must be stated explicitly, not implied by the presence of a button."
    ],
    avoidWhen: [
      "The user needs to review many interpreted facts one by one: use [[understanding]].",
      "The decision needs a deliberate recognize, verify, act structure with low-context values: use [[verification-frame]], optionally with a handoff summary inside the Verify part.",
      "It is an ordinary conversational reply: use a [[conversation]] turn.",
      "No human decision is required: report the outcome with [[operation-status]] or [[toast]]."
    ],
    characteristics: [
      "Fact rows are a two-column grid: a label column of 9rem to 12rem and a flexible value column.",
      "Labels are semibold `dt` text; values are plain `dd` text, so every fact is readable without styling.",
      "At 30rem and below each row stacks its label above its value.",
      "No border or background of its own: place it in a [[surface]] or another frame when it needs separation."
    ]
  },
  examples: [
    {
      id: "database-migration",
      title: "Database migration proposal",
      description: "An agent proposes a schema migration. The summary names the agent, the exact migration identifier, the evidence and its scope, the uncertainty that remains, and who must approve. The decision actions follow the facts.",
      html: `<ef-handoff-summary class="ef-component-tag">
  <section class="ef-handoff-summary" aria-labelledby="handoff-summary-database-migration-title">
    <header>
      <p class="ef-component-kicker">Agent proposal</p>
      <h2 id="handoff-summary-database-migration-title">Apply migration to production</h2>
      <p>Agent: Schema maintenance agent (run 7715)</p>
    </header>
    <dl>
      <div><dt>Proposed consequence</dt><dd>Apply <span class="ef-identifier">2026_09_30_add_invoice_currency</span> to prod-billing</dd></div>
      <div><dt>Evidence</dt><dd>Migration applied cleanly to staging; 312 integration tests passed</dd></div>
      <div><dt>Evidence scope</dt><dd>Staging holds 4% of production row volume</dd></div>
      <div><dt>Uncertainty</dt><dd>Lock duration on the 38-million-row invoices table was not measured</dd></div>
      <div><dt>Human authority</dt><dd>A database owner must approve; the agent cannot apply it</dd></div>
    </dl>
    <div class="ef-cluster"><button type="button">Approve migration</button><button type="button">Reject</button><button type="button">Request lock-time test</button></div>
  </section>
</ef-handoff-summary>`
    },
    {
      id: "review-only",
      title: "Reviewer without approval authority",
      description: "The current user can review but does not hold the authority to approve. The summary says so in text and the application renders only the actions this user may take; there is no disabled Approve button pretending to be available.",
      html: `<ef-handoff-summary class="ef-component-tag">
  <section class="ef-handoff-summary" aria-labelledby="handoff-summary-review-only-title">
    <header>
      <p class="ef-component-kicker">Agent proposal</p>
      <h2 id="handoff-summary-review-only-title">Send 1,240 renewal reminders</h2>
      <p>Agent: Customer communications agent</p>
    </header>
    <dl>
      <div><dt>Proposed consequence</dt><dd>Email renewal reminders to customers whose plans end in October</dd></div>
      <div><dt>Evidence</dt><dd>Customer list exported 30 September, 09:00</dd></div>
      <div><dt>Uncertainty</dt><dd>Unknown: 17 addresses bounced last month and were not re-verified</dd></div>
      <div><dt>Human authority</dt><dd>Marketing lead approval required. You can comment or forward.</dd></div>
    </dl>
    <div class="ef-cluster"><button type="button">Forward to marketing lead</button><button type="button">Add comment</button></div>
  </section>
</ef-handoff-summary>`
    },
    {
      id: "mobile-approval",
      title: "Mobile approval",
      description: "At phone width each fact stacks its label above its value, and the actions wrap below the facts.",
      mobile: {
        height: 560,
        notes: [
          "At 30rem and below each fact row becomes one column with a small gap: label, then value.",
          "Values wrap within the viewport; long identifiers inside `.ef-identifier` wrap anywhere, so nothing scrolls sideways at 320px.",
          "Actions in an `.ef-cluster` wrap onto new lines and keep the 2.75rem base height; they always come after the facts.",
          "The order of facts is fixed in the source, so uncertainty and authority are never pushed off-screen by rotation."
        ]
      },
      html: `<ef-handoff-summary class="ef-component-tag">
  <section class="ef-handoff-summary" aria-labelledby="handoff-summary-mobile-title">
    <header>
      <p class="ef-component-kicker">Agent proposal</p>
      <h2 id="handoff-summary-mobile-title">Merge dependency update</h2>
      <p>Agent: Dependency update agent</p>
    </header>
    <dl>
      <div><dt>Proposed consequence</dt><dd>Merge pull request #482 into main</dd></div>
      <div><dt>Uncertainty</dt><dd>End-to-end tests were skipped on Safari</dd></div>
      <div><dt>Human authority</dt><dd>Your approval required</dd></div>
    </dl>
    <div class="ef-cluster"><button type="button">Approve merge</button><button type="button">Reject</button></div>
  </section>
</ef-handoff-summary>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "root section", values: "id of the proposal heading", default: "—", description: "Names the handoff region by the proposed consequence." }
    ],
    hooks: {
      "ef-handoff-summary": "Root grid with a 1rem gap. Styles a `dl` inside it as rows of label and value (`minmax(9rem, 12rem) minmax(0, 1fr)`), with semibold labels; rows stack at 30rem and below."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves to the decision actions after the facts. No added keyboard behavior." },
      { keys: "Enter / Space", action: "Activates the focused native button; the decision is performed by the application after checking authority." }
    ],
    events: [
      { name: "click", description: "Native click on decision actions." }
    ],
    form: "Not a form control. A decision that needs a reason can be collected in an application [[dialog]] or form."
  },
  states: [
    { name: "Awaiting decision", how: "facts plus the actions the application renders", description: "The actions shown are exactly those the current user may take." },
    { name: "Review only", how: "authority text and a reduced action set", description: "The user cannot approve; the text says who can." },
    { name: "Stacked facts", how: "@media (max-width: 30rem)", description: "Each label sits above its value." }
  ],
  accessibility: {
    forma: [
      "Presents every fact as a native definition list, so labels and values are paired for assistive technology.",
      "Keeps facts before actions in source, visual and focus order.",
      "Stacks label and value on narrow screens so neither is truncated."
    ],
    consumer: [
      "Always include agent identity, the proposed consequence, evidence and its scope, uncertainty and human authority, even when uncertainty is \"none reported\".",
      "State unknown or unobserved evidence as unknown, never as passed.",
      "Render only actions the current user is allowed to take, and re-check authority in Ordo or application state when an action runs.",
      "Name actions by their consequence (\"Approve migration\"), not generically (\"OK\")."
    ]
  },
  responsive: [
    "Fact rows: `minmax(9rem, 12rem) minmax(0, 1fr)`; values wrap in the flexible column.",
    "At 30rem and below: rows become `minmax(0, 1fr)` with a 0.25rem gap.",
    "Actions composed with [[cluster]] wrap as needed."
  ],
  motion: [
    "No animation: the summary is static. Buttons keep only the base perceptual hover and press color change."
  ],
  guidance: {
    do: [
      "Put uncertainty and human authority in their own labelled rows so they cannot be skimmed past.",
      "Include the evidence scope (what was and was not checked)."
    ],
    avoid: [
      "Showing the agent's recommendation as a pre-selected or visually dominant Approve.",
      "Using vendor or model branding as a substitute for naming the agent and its run."
    ]
  },
  related: [
    { slug: "understanding", note: "Item-by-item review of interpreted facts." },
    { slug: "verification-frame", note: "Recognize, verify, act structure for consequential transitions." },
    { slug: "conversation", note: "The exchange that may lead to a handoff." },
    { slug: "facts", note: "General labelled facts without an authority or decision structure." }
  ]
};
