export default {
  name: "Security exception",
  category: "security",
  behavior: "Aegis / application",
  summary: "Presents an explicit security exception, its scope, status, and governing evidence.",
  purpose: {
    description: "A security exception record presents one approved (or requested, or expired) deviation from a security invariant: its stable ID, status, scope, approver, expiry and compensating controls, with links to the governing invariant and evidence. It makes the exception explicit and bounded so it cannot quietly become permanent. Tutela and the application own the exception lifecycle and whether an exception currently applies; Forma presents the record and never grants, renews or expires anything.",
    useWhen: [
      "A posture is conditional on an exception and reviewers need to see its terms.",
      "An exception has expired or is about to and must be visible as such.",
      "Auditors need the approver, scope and compensating controls in one place with a stable ID."
    ],
    avoidWhen: [
      "You need to show the blocking effect of an expired exception among other blockers: use [[security-blockers]] and link here.",
      "The record is an unknown effect rather than an approved deviation: use [[security-unknown]].",
      "The record is an invariant evaluation: use [[security-invariant-result]].",
      "You need an approval workflow: approval actions belong to the application and Ordo, not to this presentation."
    ],
    characteristics: [
      "An `article` with a small uppercase eyebrow, the stable ID as heading, and a description list of terms.",
      "Status is a written term (Active, Requested, Expired), never a color alone.",
      "Terms reflow in an auto-fit grid of at least 12rem columns, one column on phones.",
      "The stable ID is also the article id, so other records can deep-link to it."
    ]
  },
  examples: [
    {
      id: "expired",
      title: "Expired exception",
      description: "An exception whose expiry has passed. Status says Expired in text, and the record links the invariant it deviated from so the reviewer can see what is now unprotected.",
      html: `<ef-security-exception class="ef-component-tag">
  <article class="ef-security-exception" id="security-exception-expired-SEC-EXC-001" aria-labelledby="security-exception-expired-title">
    <header><p>Security exception</p><h3 id="security-exception-expired-title">SEC-EXC-001</h3></header>
    <dl>
      <div><dt>Status</dt><dd>Expired</dd></div>
      <div><dt>Invariant</dt><dd><a href="#SEC-INV-009">SEC-INV-009</a></dd></div>
      <div><dt>Scope</dt><dd>Legacy report export endpoint</dd></div>
      <div><dt>Approver</dt><dd>Security owner</dd></div>
      <div><dt>Expired</dt><dd><time datetime="2026-09-15">15 Sep 2026</time></dd></div>
      <div><dt>Compensating control</dt><dd>Endpoint limited to internal network; weekly access review.</dd></div>
    </dl>
  </article>
</ef-security-exception>`
    },
    {
      id: "requested",
      title: "Requested, not yet approved",
      description: "A requested exception. The approver field states that approval is pending instead of being left blank, and the record does not imply the exception already applies.",
      html: `<ef-security-exception class="ef-component-tag">
  <article class="ef-security-exception" id="security-exception-requested-SEC-EXC-004" aria-labelledby="security-exception-requested-title">
    <header><p>Security exception</p><h3 id="security-exception-requested-title">SEC-EXC-004</h3></header>
    <dl>
      <div><dt>Status</dt><dd>Requested</dd></div>
      <div><dt>Invariant</dt><dd><a href="#SEC-INV-014">SEC-INV-014</a></dd></div>
      <div><dt>Scope</dt><dd>Agent tool: bulk archive</dd></div>
      <div><dt>Approver</dt><dd>Pending security owner review</dd></div>
      <div><dt>Requested expiry</dt><dd><time datetime="2026-10-31">31 Oct 2026</time></dd></div>
      <div><dt>Evidence</dt><dd><a href="#SEC-EVD-042">SEC-EVD-042</a></dd></div>
    </dl>
  </article>
</ef-security-exception>`
    },
    {
      id: "mobile",
      title: "Active exception on a phone",
      description: "An active exception with a long compensating control at phone width.",
      mobile: {
        height: 520,
        notes: [
          "The description list auto-fits columns of at least `min(12rem, 100%)`, so at 320px every term/value pair stacks in one column.",
          "Values wrap anywhere, so long control descriptions and IDs never cause horizontal scrolling.",
          "The heading and eyebrow stay above the list; reading order is identical at every width.",
          "Links inside values are inline text; keep one link per value so tap targets do not crowd."
        ]
      },
      html: `<ef-security-exception class="ef-component-tag">
  <article class="ef-security-exception" id="security-exception-mobile-SEC-EXC-002" aria-labelledby="security-exception-mobile-title">
    <header><p>Security exception</p><h3 id="security-exception-mobile-title">SEC-EXC-002</h3></header>
    <dl>
      <div><dt>Status</dt><dd>Active</dd></div>
      <div><dt>Scope</dt><dd>File export for imported organizations</dd></div>
      <div><dt>Approver</dt><dd>Security owner</dd></div>
      <div><dt>Expires</dt><dd><time datetime="2026-10-01">1 Oct 2026</time></dd></div>
      <div><dt>Compensating control</dt><dd>Export restricted to administrators, with enhanced audit logging reviewed daily by the security on-call engineer.</dd></div>
    </dl>
  </article>
</ef-security-exception>`
    }
  ],
  api: {
    attributes: [
      { name: "id", on: "article", values: "stable exception ID", default: "—", description: "Deep-link target. Use the stable Tutela ID (for example SEC-EXC-002) so links from postures and blockers resolve." },
      { name: "aria-labelledby", on: "article", values: "id of the heading", default: "—", description: "Optional. Names the article by its exception ID." },
      { name: "datetime", on: "time", values: "ISO 8601 date", default: "—", description: "Machine-readable expiry or requested expiry." },
      { name: "href", on: "a", values: "stable record URL or #ID", default: "—", description: "Links to the governing invariant and evidence." }
    ],
    hooks: {
      "ef-security-exception": "Root article: bordered, padded primary surface. The header's paragraph is a small uppercase eyebrow; the description list is an auto-fit grid of at least 12rem columns with secondary-colored bold terms and values that wrap anywhere."
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
    { name: "Active", how: "Status term text Active", description: "The exception currently applies within its scope until expiry." },
    { name: "Requested", how: "Status term text Requested", description: "Not yet approved; must not be presented as applying." },
    { name: "Expired", how: "Status term text Expired", description: "No longer applies; typically also listed as a blocker." }
  ],
  accessibility: {
    forma: [
      "Uses a description list so each term is announced with its value.",
      "Keeps status in text; there is no color-only status treatment.",
      "Reflows to one column at 320px."
    ],
    consumer: [
      "Always include status, scope, approver, expiry and compensating controls, stating explicitly when a value is pending.",
      "Use the stable ID as the article id and heading.",
      "Keep sensitive compensating-control details redacted for audiences that should not see them.",
      "Do not add approve or renew buttons unless the application implements that legal transition."
    ]
  },
  responsive: [
    "The article has zero minimum inline size.",
    "Terms auto-fit into columns of at least `min(12rem, 100%)`, collapsing to one column on narrow screens.",
    "Values wrap anywhere. No breakpoints are needed."
  ],
  motion: [
    "No animation: the record is static."
  ],
  guidance: {
    do: [
      "Show the expiry date even for active exceptions.",
      "Link the invariant the exception deviates from."
    ],
    avoid: [
      "Omitting compensating controls because they are long.",
      "Showing an expired exception without saying Expired."
    ]
  },
  related: [
    { slug: "security-blockers", note: "Lists an expired exception as one of several blocking conditions." },
    { slug: "security-invariant-result", note: "The invariant the exception deviates from." },
    { slug: "security-unknown", note: "An unestablished effect rather than an approved deviation." }
  ]
};
