export default {
  name: "Approval quorum",
  category: "workflow",
  behavior: "Ordo / application",
  summary: "The approvals an action requires, each with approver, status and time, the independence rule in words, and how many are still missing, announced politely when it changes.",
  purpose: {
    description: "Some actions need two or more distinct approvers, and the person who proposed the action can never approve it: restatements, tolerance overrides, disposition batches, cutovers, two-person releases. An approval quorum lists who proposed the action, each required approval with its approver, status and time, and the independence rule as a sentence. A summary line in a `role=\"status\"` region says how many approvals are recorded and how many are still needed, so assistive technology announces changes politely. Forma does not decide who may approve: the application or Ordo enforces the rule and renders approve controls only for an eligible viewer. Proposers see \"Waiting for approval\" and no approve control.",
    useWhen: [
      "An action needs approval from a set number of distinct people.",
      "The proposer, or anyone else, is excluded from approving, and users must see why.",
      "Approvals arrive while the page is open and the change must be announced."
    ],
    avoidWhen: [
      "The prerequisites are checks rather than people: use [[readiness-checklist]].",
      "You are showing the history of a record: use [[timeline]] or [[provenance-trail]].",
      "One person confirms their own action: use a [[dialog]]."
    ],
    characteristics: [
      "The independence rule is visible text, never implied by disabled controls.",
      "Each approval states its status in words with a sentence-case [[status-lozenge]]; a pending row has a dashed rule.",
      "The summary is a polite live region; the application updates its text when an approval is recorded."
    ]
  },
  examples: [
    {
      id: "eligible-approver",
      interaction: { kind: "static", reasons: ["application-behavior"] },
      title: "Viewer can give the final approval",
      description: "A two-person release where the viewer is an eligible second approver. Only now does the application render Approve and Reject; Approve is the primary action.",
      html: `<forma-approval-quorum class="forma-component-tag">
  <section class="forma-approval-quorum" aria-labelledby="approval-quorum-eligible-approver-title">
    <header>
      <h3 id="approval-quorum-eligible-approver-title">Approvals for release 4.2 to production</h3>
      <p class="forma-approval-quorum__summary" role="status">1 of 2 approvals recorded. Your approval completes the release.</p>
    </header>
    <p class="forma-approval-quorum__rule"><strong>Independence rule:</strong> two different people must approve, and neither can be the person who requested the release.</p>
    <ol class="forma-approval-quorum__list">
      <li class="forma-approval-quorum__entry" data-state="proposed">
        <span class="forma-approval-quorum__person"><span class="forma-approval-quorum__role">Requested by</span><strong>Priya Raman</strong></span>
        <time datetime="2026-11-20T14:05Z">20 Nov 2026, 14:05</time>
      </li>
      <li class="forma-approval-quorum__entry" data-state="approved">
        <span class="forma-approval-quorum__person"><span class="forma-approval-quorum__role">Approval 1 of 2</span><strong>Tomas Berg</strong><span class="forma-status-lozenge" data-forma-variant="sentence" data-state="ok">Approved</span></span>
        <time datetime="2026-11-20T15:30Z">20 Nov 2026, 15:30</time>
      </li>
      <li class="forma-approval-quorum__entry" data-state="pending">
        <span class="forma-approval-quorum__person"><span class="forma-approval-quorum__role">Approval 2 of 2</span><strong>You</strong><span class="forma-status-lozenge" data-forma-variant="sentence">Waiting for your decision</span></span>
        <div class="forma-approval-quorum__actions">
          <button type="button" data-forma-variant="primary">Approve release</button>
          <button type="button">Reject</button>
        </div>
      </li>
    </ol>
  </section>
</forma-approval-quorum>`
    },
    {
      id: "own-proposal",
      title: "Viewer's own proposal",
      description: "The viewer proposed this override, so they can never approve it. The page shows \"Waiting for approval\" and the rule, and has no approve control.",
      html: `<forma-approval-quorum class="forma-component-tag">
  <section class="forma-approval-quorum" aria-labelledby="approval-quorum-own-proposal-title">
    <header>
      <h3 id="approval-quorum-own-proposal-title">Your tolerance override for invoice batch 77</h3>
      <p class="forma-approval-quorum__summary" role="status">Waiting for approval. 0 of 2 approvals recorded.</p>
    </header>
    <p class="forma-approval-quorum__rule"><strong>Independence rule:</strong> you proposed this override, so two other people must approve it.</p>
    <ol class="forma-approval-quorum__list">
      <li class="forma-approval-quorum__entry" data-state="proposed">
        <span class="forma-approval-quorum__person"><span class="forma-approval-quorum__role">Proposed by</span><strong>You</strong></span>
        <time datetime="2026-11-24T08:10Z">24 Nov 2026, 08:10</time>
      </li>
      <li class="forma-approval-quorum__entry" data-state="pending">
        <span class="forma-approval-quorum__person"><span class="forma-approval-quorum__role">Approval 1 of 2</span><strong>Not yet approved</strong><span class="forma-status-lozenge" data-forma-variant="sentence">Waiting for approval</span></span>
      </li>
      <li class="forma-approval-quorum__entry" data-state="pending">
        <span class="forma-approval-quorum__person"><span class="forma-approval-quorum__role">Approval 2 of 2</span><strong>Not yet approved</strong><span class="forma-status-lozenge" data-forma-variant="sentence">Waiting for approval</span></span>
      </li>
    </ol>
  </section>
</forma-approval-quorum>`
    },
    {
      id: "mobile-rejected",
      title: "Rejected approval on a phone",
      description: "A cutover where one approver rejected the plan. The rejection is stated in words and the summary says the action cannot proceed.",
      mobile: {
        height: 520,
        notes: [
          "Below 30rem each entry stacks the person and the time, so names and long role labels wrap instead of overflowing.",
          "Approve and reject controls, when the application renders them, wrap and keep their 44px targets.",
          "The rule stays visible above the list at every width."
        ]
      },
      html: `<forma-approval-quorum class="forma-component-tag">
  <section class="forma-approval-quorum" aria-labelledby="approval-quorum-mobile-rejected-title">
    <header>
      <h3 id="approval-quorum-mobile-rejected-title">Approvals for the ledger cutover</h3>
      <p class="forma-approval-quorum__summary" role="status">Rejected by 1 approver. The cutover cannot proceed until it is proposed again.</p>
    </header>
    <p class="forma-approval-quorum__rule"><strong>Independence rule:</strong> two people outside the migration team must approve.</p>
    <ol class="forma-approval-quorum__list">
      <li class="forma-approval-quorum__entry" data-state="proposed">
        <span class="forma-approval-quorum__person"><span class="forma-approval-quorum__role">Proposed by</span><strong>Ana Costa</strong></span>
        <time datetime="2026-11-18T11:00Z">18 Nov 2026, 11:00</time>
      </li>
      <li class="forma-approval-quorum__entry" data-state="rejected">
        <span class="forma-approval-quorum__person"><span class="forma-approval-quorum__role">Approval 1 of 2</span><strong>Lee Okafor</strong><span class="forma-status-lozenge" data-forma-variant="sentence" data-state="blocked">Rejected: rollback plan missing</span></span>
        <time datetime="2026-11-18T16:20Z">18 Nov 2026, 16:20</time>
      </li>
    </ol>
  </section>
</forma-approval-quorum>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.forma-approval-quorum", values: "id of the heading", default: "—", description: "Names the region from its heading." },
      { name: "role", on: "p.forma-approval-quorum__summary", values: "status", default: "—", description: "A polite live region: when the application changes the summary text, assistive technology announces it without moving focus." },
      { name: "data-state", on: "li.forma-approval-quorum__entry", values: "proposed | approved | pending | rejected", default: "—", description: "Entry kind supplied by the application. `pending` draws a dashed rule; the lozenge carries the words." },
      { name: "datetime", on: "time", values: "ISO 8601 date-time", default: "—", description: "When the proposal or approval was recorded." },
      { name: "data-forma-variant", on: "the approve button", values: "primary", default: "absent", description: "The approve action is the primary action for an eligible viewer." }
    ],
    hooks: {
      "forma-approval-quorum": "Bordered section on the primary surface with a header, the rule and the list.",
      "forma-approval-quorum__summary": "Bold summary sentence; put `role=\"status\"` on it.",
      "forma-approval-quorum__rule": "The independence rule as a sentence, with a functional start rule.",
      "forma-approval-quorum__list": "Unstyled ordered list of entries (proposal first, then approvals in order).",
      "forma-approval-quorum__entry": "Grid of the person and the time or actions; one column below 30rem.",
      "forma-approval-quorum__person": "Stack of role label, name and status lozenge.",
      "forma-approval-quorum__role": "Small label naming the slot (\"Approval 1 of 2\", \"Proposed by\").",
      "forma-approval-quorum__actions": "Wrapping row for approve and reject controls, rendered only for an eligible viewer.",
      "data-state": "On an entry: `pending` uses a dashed top rule."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves to approve and reject controls when present. Entries are not focusable." },
      { keys: "Enter / Space", action: "Activates the focused control." }
    ],
    events: [
      { name: "click", description: "Native activation of approve or reject. The application or Ordo records the decision, enforces the independence rule and re-renders the list and summary." }
    ],
    form: "Approve and reject may be submit buttons of an application form; the quorum itself submits nothing."
  },
  states: [
    { name: "Proposed", how: "li data-state=\"proposed\"", description: "Who proposed the action and when; never has approve controls." },
    { name: "Approved", how: "li data-state=\"approved\"", description: "Approver, an Approved lozenge and the time." },
    { name: "Pending", how: "li data-state=\"pending\"", description: "A required approval not yet given; dashed rule, \"Waiting for approval\"." },
    { name: "Rejected", how: "li data-state=\"rejected\"", description: "A blocked lozenge that says why; the summary says the action cannot proceed." }
  ],
  accessibility: {
    forma: [
      "Ordered list, so the number of required approvals is announced.",
      "Status is in words in every entry; the dashed rule and glyphs repeat it without colour.",
      "Forced colours draw the frame in CanvasText."
    ],
    consumer: [
      "Put `role=\"status\"` on the summary and change only its text when an approval arrives, so it is announced once, politely.",
      "Render approve controls only for an eligible viewer; never show a disabled Approve to the proposer.",
      "Write the independence rule in plain words for this action."
    ]
  },
  responsive: [
    "Entries are a two-column grid (person, time or actions) and stack below 30rem.",
    "Names, roles and lozenges wrap; nothing overflows at 320px."
  ],
  motion: [
    "No animation. Changes are announced through the status region, not motion."
  ],
  guidance: {
    do: [
      "Show every required approval, including those nobody has given yet.",
      "Say how many approvals are still needed."
    ],
    avoid: [
      "Hiding the rule behind a tooltip or a disabled control.",
      "Letting the proposer's view contain an approve control, even disabled."
    ]
  },
  related: [
    { slug: "readiness-checklist", note: "Prerequisite checks rather than people's approvals." },
    { slug: "provenance-trail", note: "History of who did what, after the fact." },
    { slug: "batch-outcome", note: "Outcomes of a batch after approval." }
  ]
};
