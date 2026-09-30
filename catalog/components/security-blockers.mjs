export default {
  name: "Security blockers",
  category: "security",
  behavior: "Aegis / application",
  summary: "Presents security conditions that block a transition without inventing remediation authority.",
  purpose: {
    description: "Security blockers lists the conditions Tutela reports as blocking a transition such as a release: violated invariants, unknown security effects, stale evidence and expired exceptions. Each entry links its stable ID to the record and states the condition in text. The list is presentation only. It does not decide what blocks, rank blockers by risk, or offer remediation actions; any action such as requesting an exception belongs to the application and to Ordo, which decide whether it is legal.",
    useWhen: [
      "A release or deployment page must show why a transition is blocked.",
      "Violations and unknowns must be listed together with equal prominence.",
      "Each blocker needs a deep link to its stable record."
    ],
    avoidWhen: [
      "You need the full posture with subject, scope and qualification: use [[security-posture]], which includes a blockers region.",
      "You are listing operational faults or form errors: use [[fault-summary]] or [[validation-summary]].",
      "You need to show obligations or tasks with owners and due dates: use [[obligation-panel]]."
    ],
    characteristics: [
      "A bordered section with a thick start border and a heading that names the list.",
      "Each entry is a stable-ID link followed by a text explanation on its own line.",
      "The blocker kind is carried as `data-kind` for machine state and must also be written in text.",
      "No buttons: the component never implies that a blocker can be dismissed or bypassed."
    ]
  },
  examples: [
    {
      id: "four-kinds",
      title: "Every kind of release blocker",
      description: "One entry for each kind Tutela reports. The kind is written as the first words of each explanation so it does not depend on data-kind, color or position.",
      html: `<ef-security-blockers class="ef-component-tag">
  <section class="ef-security-blockers" aria-labelledby="security-blockers-four-kinds-title">
    <h2 id="security-blockers-four-kinds-title">4 release blockers</h2>
    <ul>
      <li data-kind="violation"><a href="#SEC-INV-014">SEC-INV-014</a><span>Violated invariant: privileged actions are not authorized at the effect boundary.</span></li>
      <li data-kind="unknown"><a href="#SEC-UNK-003">SEC-UNK-003</a><span>Unknown effect: runtime egress behavior has not been established.</span></li>
      <li data-kind="stale"><a href="#SEC-EVD-031">SEC-EVD-031</a><span>Stale evidence: invalidated by the session-store boundary change.</span></li>
      <li data-kind="expired-exception"><a href="#SEC-EXC-001">SEC-EXC-001</a><span>Expired exception: ended <time datetime="2026-09-15">15 Sep 2026</time> and has not been renewed.</span></li>
    </ul>
  </section>
</ef-security-blockers>`
    },
    {
      id: "none",
      title: "No blockers for this scope",
      description: "When Tutela reports no blockers, the section stays in place with an explicit statement, so a missing list is never mistaken for a rendering failure or for unknown state.",
      html: `<ef-security-blockers class="ef-component-tag">
  <section class="ef-security-blockers" aria-labelledby="security-blockers-none-title">
    <h2 id="security-blockers-none-title">Release blockers</h2>
    <p>Tutela reports no blockers for the assessed scope of artifact <code>7f3c9a21b4e05d88</code>.</p>
  </section>
</ef-security-blockers>`
    },
    {
      id: "mobile-long",
      title: "Blockers on a phone",
      description: "Long IDs and explanations at phone width.",
      mobile: {
        height: 360,
        notes: [
          "The list is a single-column grid at every width; each entry's explanation is a block under its ID link.",
          "Long IDs and explanations wrap; the section has zero minimum inline size, so nothing scrolls horizontally at 320px.",
          "Entries are separated by a 0.75rem gap, keeping adjacent ID links distinct touch targets.",
          "Orientation changes only reflow text; order stays as supplied by Tutela."
        ]
      },
      html: `<ef-security-blockers class="ef-component-tag">
  <section class="ef-security-blockers" aria-labelledby="security-blockers-mobile-long-title">
    <h2 id="security-blockers-mobile-long-title">Release blockers</h2>
    <ul>
      <li data-kind="violation"><a href="#SEC-INV-014">SEC-INV-014</a><span>Violated invariant: tenant isolation is not enforced for imported organizations during background synchronization.</span></li>
      <li data-kind="unknown"><a href="#SEC-UNK-003">SEC-UNK-003</a><span>Unknown effect: runtime egress behavior has not been established.</span></li>
    </ul>
  </section>
</ef-security-blockers>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-security-blockers", values: "id of the heading", default: "—", description: "Names the region by its heading." },
      { name: "data-kind", on: "li", values: "violation | unknown | stale | expired-exception", default: "—", description: "The Tutela blocker kind as machine state. Not styled by Forma CSS; write the kind in the entry text as well." },
      { name: "href", on: "a", values: "stable record URL or #ID", default: "—", description: "Deep link to the blocking record." },
      { name: "datetime", on: "time", values: "ISO 8601 date", default: "—", description: "Machine-readable date, for example when an exception expired." }
    ],
    hooks: {
      "ef-security-blockers": "Root section: bordered and padded, with a 0.35rem start border in the current text color (CanvasText in forced colors). Its list is a grid with a 0.75rem gap and each entry's span is displayed as a block."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between blocker links." },
      { keys: "Enter", action: "Follows the focused link to the record." }
    ],
    events: [
      { name: "—", description: "No events. The list is re-rendered when Tutela's result changes." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Blockers present", how: "ul of li entries", description: "Each blocker shows its stable ID and a text explanation." },
    { name: "No blockers", how: "a paragraph instead of the list", description: "An explicit statement that nothing blocks the assessed scope." },
    { name: "Kind", how: "data-kind plus text", description: "violation, unknown, stale or expired-exception; the text states the kind." }
  ],
  accessibility: {
    forma: [
      "Uses a named region with a heading and a real list, so the number of blockers is announced.",
      "Keeps the start border visible in forced-colors mode as a structural cue.",
      "Wraps all content at 320px without horizontal scrolling."
    ],
    consumer: [
      "Write the blocker kind and count in text; do not rely on data-kind or position.",
      "Link every entry to a stable record ID.",
      "Keep unknowns in the same list as violations, never behind a separate toggle.",
      "Do not add dismiss or override controls; route any legal remediation through application actions governed by Ordo."
    ]
  },
  responsive: [
    "The section has zero minimum inline size; the list is a single-column grid at every width.",
    "Each explanation is a block under its link, so long text wraps predictably.",
    "No breakpoints are needed."
  ],
  motion: [
    "No animation: blockers are static content and appear or disappear with the render."
  ],
  guidance: {
    do: [
      "Put the count in the heading (\"4 release blockers\").",
      "Keep the order Tutela supplies."
    ],
    avoid: [
      "Sorting unknowns below violations so they look less important.",
      "Using red text or icons as the only way to show that something blocks."
    ]
  },
  related: [
    { slug: "security-posture", note: "The full posture summary, which embeds a blockers region." },
    { slug: "security-unknown", note: "The detailed record for an unknown effect listed as a blocker." },
    { slug: "security-invariant-result", note: "The detailed record for a violated invariant." },
    { slug: "obligation-panel", note: "Tasks with owners and deadlines rather than blocking security conditions." }
  ]
};
