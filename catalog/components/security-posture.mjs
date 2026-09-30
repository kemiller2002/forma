export default {
  name: "Security posture",
  category: "security",
  behavior: "Aegis / application",
  summary: "Summarizes security posture while preserving unresolved, unknown, and blocking conditions.",
  purpose: {
    description: "Security posture presents a Tutela release posture for one assessed subject: the posture itself (PASS, CONDITIONAL, BLOCKED or INDETERMINATE) as a heading and a text status label, the immutable subject reference, the assessed scope, when it was assessed, any blockers or unresolved unknowns with stable links, and a qualification that the result describes the defined scope and evidence only. Tutela derives the posture; Forma displays it and never computes, upgrades or reinterprets it. There is no composite score, and unknowns are listed alongside findings rather than hidden beneath them.",
    useWhen: [
      "A release, deployment or review page must show the Tutela posture for a specific artifact.",
      "Readers need subject, scope, freshness and blockers together before deciding whether to proceed.",
      "Blocking conditions and unknowns must link to their stable records."
    ],
    avoidWhen: [
      "You only need the list of blocking conditions: use [[security-blockers]].",
      "You need counts across evidence states: use [[security-state-matrix]].",
      "You want to show a single numeric security score: Tutela forbids a composite score as the primary representation.",
      "The status is not a Tutela posture, for example a general operation outcome: use [[operation-status]] or [[status-lozenge]]."
    ],
    characteristics: [
      "The posture is stated twice in text: as the heading and as a [[status-lozenge]] whose glyph adds a non-color cue.",
      "Subject, scope and assessment time are a responsive description list that reflows to one column on phones.",
      "Blockers sit in a region with a thick start border and link to stable IDs such as SEC-INV-002.",
      "The qualification sentence stays visible so a PASS is never read as a general claim that the system is secure."
    ]
  },
  examples: [
    {
      id: "pass",
      title: "Pass within a defined scope",
      description: "A PASS posture with no blockers. The blockers region is omitted, and the qualification states what the result does and does not claim.",
      html: `<ef-security-posture class="ef-component-tag">
  <section class="ef-security-posture" data-posture="pass" aria-labelledby="security-posture-pass-title">
    <header class="ef-security-posture__header">
      <div>
        <p class="ef-security-posture__eyebrow">Tutela release posture</p>
        <h2 id="security-posture-pass-title">Pass</h2>
      </div>
      <span class="ef-status-lozenge" data-state="ok">Pass</span>
    </header>
    <dl class="ef-security-posture__meta">
      <div><dt>Subject</dt><dd><code>7f3c9a21b4e05d88</code></dd></div>
      <div><dt>Scope</dt><dd>Billing API, webhook delivery</dd></div>
      <div><dt>Assessed</dt><dd><time datetime="2026-09-29T11:20:00Z">29 Sep 2026</time></dd></div>
    </dl>
    <p class="ef-security-posture__qualification">This posture describes the defined assessment scope and evidence. It is not a general claim that the system is secure.</p>
  </section>
</ef-security-posture>`
    },
    {
      id: "conditional",
      title: "Conditional on an active exception",
      description: "A CONDITIONAL posture. The condition is listed as its own metadata row with a link to the governing exception, and the status label uses the attention glyph.",
      html: `<ef-security-posture class="ef-component-tag">
  <section class="ef-security-posture" data-posture="conditional" aria-labelledby="security-posture-conditional-title">
    <header class="ef-security-posture__header">
      <div>
        <p class="ef-security-posture__eyebrow">Tutela release posture</p>
        <h2 id="security-posture-conditional-title">Conditional</h2>
      </div>
      <span class="ef-status-lozenge" data-state="attention">Conditional</span>
    </header>
    <dl class="ef-security-posture__meta">
      <div><dt>Subject</dt><dd><code>a91e44d0c2f7b613</code></dd></div>
      <div><dt>Scope</dt><dd>Agent tools, file export</dd></div>
      <div><dt>Assessed</dt><dd><time datetime="2026-09-28T15:05:00Z">28 Sep 2026</time></dd></div>
      <div><dt>Condition</dt><dd><a href="#SEC-EXC-002">SEC-EXC-002</a> active until <time datetime="2026-10-01">1 Oct 2026</time></dd></div>
    </dl>
    <p class="ef-security-posture__qualification">This posture describes the defined assessment scope and evidence. It is not a general claim that the system is secure.</p>
  </section>
</ef-security-posture>`
    },
    {
      id: "indeterminate",
      title: "Indeterminate because evidence is unknown",
      description: "An INDETERMINATE posture. The unresolved unknowns are listed with the same prominence as blockers, rather than being folded into a pass or a failure.",
      html: `<ef-security-posture class="ef-component-tag">
  <section class="ef-security-posture" data-posture="indeterminate" aria-labelledby="security-posture-indeterminate-title">
    <header class="ef-security-posture__header">
      <div>
        <p class="ef-security-posture__eyebrow">Tutela release posture</p>
        <h2 id="security-posture-indeterminate-title">Indeterminate</h2>
      </div>
      <span class="ef-status-lozenge" data-state="unknown">Indeterminate</span>
    </header>
    <dl class="ef-security-posture__meta">
      <div><dt>Subject</dt><dd><code>0c55e1f9d8a3b742</code></dd></div>
      <div><dt>Scope</dt><dd>Network boundary, runtime egress</dd></div>
      <div><dt>Assessed</dt><dd><time datetime="2026-09-30T07:45:00Z">30 Sep 2026</time></dd></div>
    </dl>
    <div class="ef-security-posture__blockers">
      <strong>2 unresolved unknowns</strong>
      <ul>
        <li><a href="#SEC-UNK-003">SEC-UNK-003</a>: runtime egress behavior has not been established.</li>
        <li><a href="#SEC-UNK-004">SEC-UNK-004</a>: DNS resolution path for the release artifact is unobserved.</li>
      </ul>
    </div>
    <p class="ef-security-posture__qualification">No posture can be established for this scope until the unknowns are resolved.</p>
  </section>
</ef-security-posture>`
    },
    {
      id: "mobile-blocked",
      title: "Blocked posture on a phone",
      description: "A BLOCKED posture with blockers and a long scope at phone width.",
      mobile: {
        height: 560,
        notes: [
          "Below 30rem the header switches from a wrapping flex row to a single-column grid, so the status label sits under the heading instead of beside it.",
          "The metadata list uses `repeat(auto-fit, minmax(min(12rem, 100%), 1fr))`, so subject, scope and date stack into one column at 320px.",
          "Long subject hashes and scope values break anywhere; nothing scrolls horizontally.",
          "Blocker links wrap with their explanations; each link is inline text, so leave line spacing generous for touch."
        ]
      },
      html: `<ef-security-posture class="ef-component-tag">
  <section class="ef-security-posture" data-posture="blocked" aria-labelledby="security-posture-mobile-blocked-title">
    <header class="ef-security-posture__header">
      <div>
        <p class="ef-security-posture__eyebrow">Tutela release posture</p>
        <h2 id="security-posture-mobile-blocked-title">Blocked</h2>
      </div>
      <span class="ef-status-lozenge" data-state="blocked">Blocked</span>
    </header>
    <dl class="ef-security-posture__meta">
      <div><dt>Subject</dt><dd><code>0123456789abcdef0123456789abcdef</code></dd></div>
      <div><dt>Scope</dt><dd>Authentication, authorization, agent tools, imported organizations</dd></div>
      <div><dt>Assessed</dt><dd><time datetime="2026-09-24T16:00:00Z">24 Sep 2026</time></dd></div>
    </dl>
    <div class="ef-security-posture__blockers">
      <strong>2 release blockers</strong>
      <ul>
        <li><a href="#SEC-INV-014">SEC-INV-014</a>: authorization invariant violated.</li>
        <li><a href="#SEC-EVD-031">SEC-EVD-031</a>: evidence is stale after a boundary change.</li>
      </ul>
    </div>
    <p class="ef-security-posture__qualification">This posture describes the defined assessment scope and evidence. It is not a general claim that the system is secure.</p>
  </section>
</ef-security-posture>`
    }
  ],
  api: {
    attributes: [
      { name: "data-posture", on: "section.ef-security-posture", values: "pass | conditional | blocked | indeterminate", default: "—", description: "The Tutela posture as machine state. Not styled by Forma CSS; it keeps the input state inspectable and must match the visible heading and label." },
      { name: "aria-labelledby", on: "section.ef-security-posture", values: "id of the posture heading", default: "—", description: "Names the region by the posture, so it is announced as, for example, \"Blocked, region\"." },
      { name: "data-state", on: ".ef-status-lozenge", values: "ok | attention | unknown | blocked", default: "—", description: "Selects the lozenge glyph (✓, !, ?, ×). Map pass, conditional, indeterminate and blocked to these explicitly; the label text is the state." },
      { name: "role", on: ".ef-security-posture__blockers", values: "status", default: "absent", description: "Only if the application updates the blocker list in place and wants the change announced." },
      { name: "href", on: "blocker link", values: "stable record URL or #ID", default: "—", description: "Deep link to the stable invariant, unknown, evidence or exception record." },
      { name: "datetime", on: "time", values: "ISO 8601", default: "—", description: "Machine-readable assessment time." }
    ],
    hooks: {
      "ef-security-posture": "Root section: bordered, padded primary surface.",
      "ef-security-posture__header": "Wrapping flex row with the heading block and status label at opposite ends; a single-column grid below 30rem.",
      "ef-security-posture__eyebrow": "Small uppercase label above the posture heading.",
      "ef-security-posture__meta": "Description list of subject, scope, assessed time and conditions in an auto-fit grid of at least 12rem columns.",
      "ef-security-posture__blockers": "Region listing blockers or unresolved unknowns, marked with a 0.35rem start border in the current text color (CanvasText in forced colors).",
      "ef-security-posture__qualification": "Small secondary text stating the scope limits of the posture."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between blocker and condition links. The posture itself is not interactive." },
      { keys: "Enter", action: "Follows the focused link to the stable record (native link behavior)." }
    ],
    events: [
      { name: "—", description: "No events. The application renders the posture Tutela supplied and re-renders when it changes." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Pass", how: "data-posture=\"pass\", heading and lozenge text Pass", description: "No blockers region; qualification remains visible." },
    { name: "Conditional", how: "data-posture=\"conditional\", text Conditional", description: "Conditions such as active exceptions are listed with links." },
    { name: "Blocked", how: "data-posture=\"blocked\", text Blocked", description: "Blockers region lists each blocking record by stable ID." },
    { name: "Indeterminate", how: "data-posture=\"indeterminate\", text Indeterminate", description: "Unresolved unknowns are listed with the same prominence as blockers." }
  ],
  accessibility: {
    forma: [
      "States posture in text (heading and label); the lozenge glyph and blockers border are non-color cues.",
      "Uses a description list for subject, scope and time so they are announced as term/value pairs.",
      "Keeps the blockers border visible as CanvasText in forced-colors mode.",
      "Reflows to one column at 320px without horizontal scrolling."
    ],
    consumer: [
      "Render the posture exactly as Tutela supplied it; never derive, round up or combine states.",
      "Keep unknowns as discoverable as findings, and link every blocker to a stable ID.",
      "Keep the qualification sentence; do not replace it with marketing copy.",
      "Redact sensitive evidence before rendering; the component shows whatever it is given.",
      "Avoid aria-label on the status lozenge span; its visible text is already the accessible content."
    ]
  },
  responsive: [
    "Intrinsic sizing: the section has zero minimum inline size and grows with its container.",
    "The header is a wrapping flex row; below a 30rem viewport it becomes a single-column grid.",
    "The metadata grid auto-fits columns of at least `min(12rem, 100%)`, collapsing to one column on phones; values break anywhere.",
    "The status lozenge does not wrap its label, so keep posture labels short."
  ],
  motion: [
    "No animation: the posture is a static presentation. Changes in posture replace text immediately and nothing pulses or transitions."
  ],
  guidance: {
    do: [
      "Show subject, scope and assessment time with every posture.",
      "Link each blocker and unknown to its stable record.",
      "Use the lozenge state that matches the posture: ok for pass, attention for conditional, blocked for blocked, unknown for indeterminate."
    ],
    avoid: [
      "Showing a percentage or score as the headline.",
      "Hiding unknowns behind a disclosure while findings are visible.",
      "Using color alone to distinguish Pass from Blocked."
    ]
  },
  related: [
    { slug: "security-blockers", note: "The standalone list of blocking conditions, when the full posture summary is not needed." },
    { slug: "security-state-matrix", note: "Counts of verified, violated, unknown, stale and not-applicable evidence." },
    { slug: "security-unknown", note: "The full record for one unknown security effect linked from the posture." },
    { slug: "status-lozenge", note: "The compact text label used in the posture header." }
  ]
};
