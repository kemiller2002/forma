export default {
  name: "Batch outcome",
  category: "feedback",
  behavior: "Application state",
  summary: "Per-item results of a batch whose items commit separately, grouped by outcome with counts, item links and one next action per group; Unknown is its own group.",
  purpose: {
    description: "When a batch action commits each item in its own transaction, the result is mixed: some items succeeded, some are pending, some failed, and for some the outcome is not known. A batch outcome summary groups the items by outcome, gives each group a sentence-case [[status-lozenge]], a count, the item links and, where there is one, the next action for that group. Unknown is never merged with success or failure: it has its own group, a dashed edge and the action \"Check status\", never \"Retry\", because retrying an item that may already have committed can duplicate it. The summary sentence goes into a `role=\"status\"` region once, after the batch settles.",
    useWhen: [
      "A batch action (approve, send, post, import) commits item by item and can end with mixed results.",
      "Some items' outcome cannot be confirmed (a timeout after the request was sent).",
      "Users must act on specific items afterwards."
    ],
    avoidWhen: [
      "The batch is one transaction that either commits or not: use [[operation-status]].",
      "The work is still running: use [[progress-bar]] and update this summary when it settles.",
      "There is a single item: use [[operation-status]] or [[alert]]."
    ],
    characteristics: [
      "Groups appear in order of what needs the user: unknown, failed, pending, then succeeded.",
      "Each group's outcome is in words; its edge also differs without colour (dashed for unknown, heavy for failed).",
      "Unknown offers \"Check status\"; failed offers a review or correction; succeeded and pending usually need no action."
    ]
  },
  basicInteraction: { kind: "static", reasons: ["application-behavior", "placeholder-navigation"] },
  examples: [
    {
      id: "all-succeeded",
      interaction: { kind: "static", reasons: ["placeholder-navigation"] },
      title: "Every item succeeded",
      description: "A clean result is still a summary with a count and links, so the user can confirm what happened.",
      html: `<forma-batch-outcome class="forma-component-tag">
  <section class="forma-batch-outcome" aria-labelledby="batch-outcome-all-succeeded-title">
    <h3 id="batch-outcome-all-succeeded-title">Statements sent</h3>
    <p class="forma-batch-outcome__summary" role="status">2 statements processed: 2 sent.</p>
    <ul class="forma-batch-outcome__groups">
      <li class="forma-batch-outcome__group" data-outcome="succeeded">
        <h4 class="forma-batch-outcome__heading"><span class="forma-status-lozenge" data-forma-variant="sentence" data-state="ok">Sent</span><span class="forma-batch-outcome__count">2 statements</span></h4>
        <ul class="forma-batch-outcome__items">
          <li><a href="#batch-outcome-all-succeeded-title">Statement for account 1180</a></li>
          <li><a href="#batch-outcome-all-succeeded-title">Statement for account 1181</a></li>
        </ul>
      </li>
    </ul>
  </section>
</forma-batch-outcome>`
    },
    {
      id: "unknown-and-failed",
      interaction: { kind: "static", reasons: ["application-behavior", "placeholder-navigation"] },
      title: "Unknown outcomes after a timeout",
      description: "A payment run timed out after sending three items. Their outcome is unknown, so the group offers Check status and explains why retrying is unsafe.",
      html: `<forma-batch-outcome class="forma-component-tag">
  <section class="forma-batch-outcome" aria-labelledby="batch-outcome-unknown-and-failed-title">
    <h3 id="batch-outcome-unknown-and-failed-title">Payment run finished with unconfirmed items</h3>
    <p class="forma-batch-outcome__summary" role="status">20 payments processed: 16 sent, 1 failed, 3 outcome unknown.</p>
    <ul class="forma-batch-outcome__groups">
      <li class="forma-batch-outcome__group" data-outcome="unknown">
        <h4 class="forma-batch-outcome__heading"><span class="forma-status-lozenge" data-forma-variant="sentence" data-state="unknown">Outcome unknown</span><span class="forma-batch-outcome__count">3 payments</span></h4>
        <p>The bank did not confirm these payments before the connection timed out. They may have been sent; retrying could pay twice.</p>
        <ul class="forma-batch-outcome__items">
          <li><a href="#batch-outcome-unknown-and-failed-title">Payment 5512</a></li>
          <li><a href="#batch-outcome-unknown-and-failed-title">Payment 5513</a></li>
          <li><a href="#batch-outcome-unknown-and-failed-title">Payment 5519</a></li>
        </ul>
        <div class="forma-batch-outcome__actions"><button type="button">Check status</button></div>
      </li>
      <li class="forma-batch-outcome__group" data-outcome="failed">
        <h4 class="forma-batch-outcome__heading"><span class="forma-status-lozenge" data-forma-variant="sentence" data-state="blocked">Failed</span><span class="forma-batch-outcome__count">1 payment</span></h4>
        <p>The account number for this payee is closed.</p>
        <ul class="forma-batch-outcome__items"><li><a href="#batch-outcome-unknown-and-failed-title">Payment 5507</a></li></ul>
        <div class="forma-batch-outcome__actions"><button type="button">Update payee details</button></div>
      </li>
      <li class="forma-batch-outcome__group" data-outcome="succeeded">
        <h4 class="forma-batch-outcome__heading"><span class="forma-status-lozenge" data-forma-variant="sentence" data-state="ok">Sent</span><span class="forma-batch-outcome__count">16 payments</span></h4>
        <p><a href="#batch-outcome-unknown-and-failed-title">View the 16 sent payments</a></p>
      </li>
    </ul>
  </section>
</forma-batch-outcome>`
    },
    {
      id: "mobile-mixed",
      interaction: { kind: "static", reasons: ["application-behavior", "placeholder-navigation"] },
      title: "Mixed result on a phone",
      description: "A batch review result at phone width.",
      mobile: {
        height: 560,
        notes: [
          "Groups stack in one column at every width; item links wrap onto new lines instead of scrolling sideways.",
          "Group actions keep 44px targets and wrap under the item links.",
          "Long item names break inside their link at 320px."
        ]
      },
      html: `<forma-batch-outcome class="forma-component-tag">
  <section class="forma-batch-outcome" aria-labelledby="batch-outcome-mobile-mixed-title">
    <h3 id="batch-outcome-mobile-mixed-title">Batch review finished</h3>
    <p class="forma-batch-outcome__summary" role="status">4 documents processed: 2 accepted, 1 waiting for a signature, 1 outcome unknown.</p>
    <ul class="forma-batch-outcome__groups">
      <li class="forma-batch-outcome__group" data-outcome="unknown">
        <h4 class="forma-batch-outcome__heading"><span class="forma-status-lozenge" data-forma-variant="sentence" data-state="unknown">Outcome unknown</span><span class="forma-batch-outcome__count">1 document</span></h4>
        <ul class="forma-batch-outcome__items"><li><a href="#batch-outcome-mobile-mixed-title">Supplier agreement for Northwind Logistics</a></li></ul>
        <div class="forma-batch-outcome__actions"><button type="button">Check status</button></div>
      </li>
      <li class="forma-batch-outcome__group" data-outcome="pending">
        <h4 class="forma-batch-outcome__heading"><span class="forma-status-lozenge" data-forma-variant="sentence" data-state="attention">Waiting for a signature</span><span class="forma-batch-outcome__count">1 document</span></h4>
        <ul class="forma-batch-outcome__items"><li><a href="#batch-outcome-mobile-mixed-title">Lease renewal, unit 4</a></li></ul>
      </li>
      <li class="forma-batch-outcome__group" data-outcome="succeeded">
        <h4 class="forma-batch-outcome__heading"><span class="forma-status-lozenge" data-forma-variant="sentence" data-state="ok">Accepted</span><span class="forma-batch-outcome__count">2 documents</span></h4>
        <ul class="forma-batch-outcome__items">
          <li><a href="#batch-outcome-mobile-mixed-title">Consulting statement of work</a></li>
          <li><a href="#batch-outcome-mobile-mixed-title">Office cleaning contract</a></li>
        </ul>
      </li>
    </ul>
  </section>
</forma-batch-outcome>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.forma-batch-outcome", values: "id of the heading", default: "—", description: "Names the region from its heading." },
      { name: "role", on: "p.forma-batch-outcome__summary", values: "status", default: "—", description: "Polite live region. Insert the summary text once, after the batch settles, so it is announced once." },
      { name: "data-outcome", on: "li.forma-batch-outcome__group", values: "succeeded | pending | failed | unknown", default: "—", description: "Outcome of the group. Sets the start edge (dashed for unknown, heavy for failed) and its colour; the lozenge carries the words." }
    ],
    hooks: {
      "forma-batch-outcome": "Root section: heading, summary and the list of groups.",
      "forma-batch-outcome__summary": "Bold summary sentence with every count; put `role=\"status\"` on it.",
      "forma-batch-outcome__groups": "Unstyled list of outcome groups.",
      "forma-batch-outcome__group": "One outcome: bordered box with a 0.25rem start edge.",
      "forma-batch-outcome__heading": "Group heading: the outcome lozenge and the count.",
      "forma-batch-outcome__count": "Count of items in the group, in words (\"3 payments\").",
      "forma-batch-outcome__items": "Wrapping list of links to each item.",
      "forma-batch-outcome__actions": "The group's next action.",
      "data-outcome": "`succeeded` success edge; `pending` warning edge; `failed` 0.5rem danger edge; `unknown` dashed info edge and dashed frame."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through item links and group actions in order." },
      { keys: "Enter / Space", action: "Follows a link or activates an action (Space only for buttons)." }
    ],
    events: [
      { name: "click", description: "Native activation. The application checks status, opens the item or starts the correction." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Succeeded", how: "data-outcome=\"succeeded\"", description: "Items committed; usually no action." },
    { name: "Pending", how: "data-outcome=\"pending\"", description: "Items accepted but waiting on someone or something else." },
    { name: "Failed", how: "data-outcome=\"failed\"", description: "Items that did not commit; offers a review or correction, with the reason." },
    { name: "Unknown", how: "data-outcome=\"unknown\"", description: "Items whose outcome could not be confirmed; dashed edge and \"Check status\", never \"Retry\"." }
  ],
  accessibility: {
    forma: [
      "Groups are a list and each has a heading, so screen-reader users can jump between outcomes.",
      "Outcomes are in words and differ by edge style as well as colour; forced colours draw frames in CanvasText."
    ],
    consumer: [
      "Insert the summary into the `role=\"status\"` region once, after every item has settled; do not update it per item.",
      "Never offer Retry for unknown items; offer Check status and explain the risk.",
      "Link every item so users can open it."
    ]
  },
  responsive: [
    "Groups are a single column at every width.",
    "Item links and actions wrap; long names break inside the link, so nothing overflows at 320px."
  ],
  motion: [
    "No animation. The summary is announced, not animated."
  ],
  guidance: {
    do: [
      "Order groups by what needs the user first: unknown, failed, pending, succeeded.",
      "Name items the way the user knows them."
    ],
    avoid: [
      "Counting unknown items as failed or as succeeded.",
      "A single Retry all button for a mixed result."
    ]
  },
  related: [
    { slug: "operation-status", note: "One operation's state with recovery, not a batch of separate commits." },
    { slug: "progress-bar", note: "Progress while the batch is still running." },
    { slug: "approval-quorum", note: "Approvals required before an action runs." }
  ]
};
