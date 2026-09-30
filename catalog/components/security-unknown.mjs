export default {
  name: "Security unknown",
  category: "security",
  behavior: "Aegis / application",
  summary: "Represents unknown security state explicitly instead of collapsing it into failure or success.",
  purpose: {
    description: "A security unknown records a security effect that has not been established: what is unknown, the consequence of not knowing, the evidence needed to resolve it and, where one exists, the obligation to obtain that evidence. It gives unknowns their own first-class record with a stable ID, so they are never quietly counted as passes or folded into failures. Tutela decides that something is unknown and what it blocks; the application or Ordo owns any obligation or task. Forma presents the record.",
    useWhen: [
      "Tutela reports an unknown security effect that a posture, blocker list or invariant links to.",
      "Reviewers need to know what evidence would resolve the unknown and who owes it.",
      "An unknown must be shown with the same seriousness as a finding."
    ],
    avoidWhen: [
      "The effect is known and violates an invariant: use [[security-invariant-result]].",
      "You are recording an approved deviation: use [[security-exception]].",
      "The unknown is an operation outcome, such as whether a save completed: use [[operation-status]].",
      "You need to track the resolving task itself with owner and status: use [[obligation-panel]] and link to it."
    ],
    characteristics: [
      "An `article` with an \"Unknown security effect\" eyebrow, the stable ID as heading and a plain statement of what is unknown.",
      "Consequence and evidence needed are always listed as terms in a description list.",
      "The article id is the stable unknown ID for deep links from postures and blockers.",
      "Terms reflow into one column on phones."
    ]
  },
  examples: [
    {
      id: "with-obligation",
      title: "Unknown with an assigned obligation",
      description: "An unknown that blocks release, with the obligation to obtain the missing evidence linked by ID. The owner and due date come from the application's obligation record.",
      html: `<ef-security-unknown class="ef-component-tag">
  <article class="ef-security-unknown" id="security-unknown-with-obligation-SEC-UNK-004" aria-labelledby="security-unknown-with-obligation-title">
    <header><p>Unknown security effect</p><h3 id="security-unknown-with-obligation-title">SEC-UNK-004</h3></header>
    <p>The DNS resolution path used by the release artifact has not been observed.</p>
    <dl>
      <div><dt>Consequence</dt><dd>Blocks release: egress controls cannot be shown to cover name resolution.</dd></div>
      <div><dt>Evidence needed</dt><dd>Packet capture from the staging runtime against this artifact.</dd></div>
      <div><dt>Obligation</dt><dd><a href="#OBL-118">OBL-118</a>, platform team, due <time datetime="2026-10-03">3 Oct 2026</time></dd></div>
    </dl>
  </article>
</ef-security-unknown>`
    },
    {
      id: "non-blocking",
      title: "Unknown outside the release scope",
      description: "An unknown that Tutela reports as not blocking this release scope. It is still recorded and visible; the consequence states the limit explicitly, and no obligation exists yet.",
      html: `<ef-security-unknown class="ef-component-tag">
  <article class="ef-security-unknown" id="security-unknown-non-blocking-SEC-UNK-009" aria-labelledby="security-unknown-non-blocking-title">
    <header><p>Unknown security effect</p><h3 id="security-unknown-non-blocking-title">SEC-UNK-009</h3></header>
    <p>Behavior of the offline export feature on shared devices has not been established.</p>
    <dl>
      <div><dt>Consequence</dt><dd>Does not block this release; offline export is outside the assessed scope.</dd></div>
      <div><dt>Evidence needed</dt><dd>Device-sharing test on the supported mobile platforms.</dd></div>
      <div><dt>Obligation</dt><dd>None assigned</dd></div>
    </dl>
  </article>
</ef-security-unknown>`
    },
    {
      id: "mobile",
      title: "Unknown effect on a phone",
      description: "An unknown with long consequence text at phone width.",
      mobile: {
        height: 460,
        notes: [
          "The description list auto-fits columns of at least `min(12rem, 100%)`, so at 320px each term/value pair stacks in one column.",
          "The statement and values wrap anywhere; nothing scrolls horizontally.",
          "The eyebrow, ID heading and statement keep the same order in every orientation.",
          "Links in values are inline text; keep one per value so tap targets stay distinct."
        ]
      },
      html: `<ef-security-unknown class="ef-component-tag">
  <article class="ef-security-unknown" id="security-unknown-mobile-SEC-UNK-003" aria-labelledby="security-unknown-mobile-title">
    <header><p>Unknown security effect</p><h3 id="security-unknown-mobile-title">SEC-UNK-003</h3></header>
    <p>Runtime egress behavior has not been established.</p>
    <dl>
      <div><dt>Consequence</dt><dd>Release posture cannot be established for the network boundary, including traffic initiated by agent tools and scheduled jobs.</dd></div>
      <div><dt>Evidence needed</dt><dd>Observed egress policy test against the release artifact.</dd></div>
    </dl>
  </article>
</ef-security-unknown>`
    }
  ],
  api: {
    attributes: [
      { name: "id", on: "article", values: "stable unknown ID", default: "—", description: "Deep-link target; use the stable Tutela ID such as SEC-UNK-003." },
      { name: "aria-labelledby", on: "article", values: "id of the heading", default: "—", description: "Optional. Names the article by its unknown ID." },
      { name: "href", on: "a", values: "stable record URL or #ID", default: "—", description: "Links to the obligation or related records." },
      { name: "datetime", on: "time", values: "ISO 8601 date", default: "—", description: "Machine-readable obligation due date." }
    ],
    hooks: {
      "ef-security-unknown": "Root article: bordered, padded primary surface. The header's paragraph is a small uppercase eyebrow; the description list is an auto-fit grid of at least 12rem columns with secondary-colored bold terms and values that wrap anywhere."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between links in the record." },
      { keys: "Enter", action: "Follows the focused link." }
    ],
    events: [
      { name: "—", description: "No events." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Blocking", how: "Consequence text states that it blocks", description: "The unknown prevents a posture or transition for its scope." },
    { name: "Non-blocking", how: "Consequence text states the limit", description: "Recorded and visible, but outside the blocking scope." },
    { name: "With obligation", how: "Obligation term with a link", description: "Someone owes the evidence; owner and due date shown." },
    { name: "Without obligation", how: "Obligation term says None assigned", description: "Explicitly unowned rather than blank." }
  ],
  accessibility: {
    forma: [
      "Labels the record as an unknown in visible text; no color or icon is needed to tell it apart from a finding.",
      "Uses a description list so consequence and evidence needed are announced as pairs.",
      "Reflows to one column at 320px."
    ],
    consumer: [
      "Always include the consequence and the evidence needed.",
      "State explicitly when no obligation exists.",
      "Link the unknown from every posture or blocker list it affects, using its stable ID.",
      "Never present an unknown as a pass or a failure."
    ]
  },
  responsive: [
    "The article has zero minimum inline size.",
    "Terms auto-fit into columns of at least `min(12rem, 100%)`, one column on narrow screens.",
    "Values wrap anywhere. No breakpoints are needed."
  ],
  motion: [
    "No animation: the record is static."
  ],
  guidance: {
    do: [
      "Write the statement as what is not known, not as a suspected failure.",
      "Name the specific evidence that would resolve the unknown."
    ],
    avoid: [
      "Styling unknowns as warnings to make them look less serious than violations.",
      "Omitting the consequence because it is uncertain; say what cannot be established."
    ]
  },
  related: [
    { slug: "security-blockers", note: "Lists blocking unknowns alongside violations with links to these records." },
    { slug: "security-invariant-result", note: "An invariant whose state may be Unknown because of this record." },
    { slug: "obligation-panel", note: "Tracks the obligation to obtain the missing evidence." },
    { slug: "operation-status", note: "Unknown outcomes of user operations rather than security effects." }
  ]
};
