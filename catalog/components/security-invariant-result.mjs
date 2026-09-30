export default {
  name: "Security invariant result",
  category: "security",
  behavior: "Aegis / application",
  summary: "Reports invariant evaluation outcomes with explicit state rather than color-only pass/fail cues.",
  owns: ["ef-invariant-result"],
  purpose: {
    description: "An invariant result presents one security invariant as Tutela evaluated it: its stable ID, its state written as a word (Verified, Violated, Unknown, Stale or N/A), the invariant statement, and the related threats, evidence and verification requirements as links and terms. It keeps the outcome explicit and traceable instead of a green or red dot. Tutela evaluates the invariant; Forma displays the supplied state and never recalculates it.",
    useWhen: [
      "A reviewer opens an invariant from a posture, blocker list or evidence chain.",
      "The invariant statement, its state and its evidence must be read together.",
      "An invariant is Unknown and the page must explain what is missing."
    ],
    avoidWhen: [
      "You need counts of invariants by state: use [[security-state-matrix]].",
      "You need only the blocking subset: use [[security-blockers]].",
      "The record is an unknown security effect rather than an invariant: use [[security-unknown]]."
    ],
    characteristics: [
      "The header places an eyebrow on its own line, then the stable ID heading and the state word side by side, wrapping when narrow.",
      "State is bold text; `data-state` mirrors it as machine state.",
      "Related records are in a description list that auto-fits columns of at least 10rem.",
      "The article id is the stable invariant ID for deep links."
    ]
  },
  examples: [
    {
      id: "verified",
      title: "Verified invariant",
      description: "An invariant Tutela reports as Verified, with its current evidence and independent verification recorded.",
      html: `<ef-security-invariant-result class="ef-component-tag">
  <article class="ef-invariant-result" id="security-invariant-result-verified-SEC-INV-003" data-state="verified" aria-labelledby="security-invariant-result-verified-title">
    <header><p>Security invariant</p><h3 id="security-invariant-result-verified-title">SEC-INV-003</h3><strong>Verified</strong></header>
    <p>Session tokens are bound to the device that created them.</p>
    <dl>
      <div><dt>Threats</dt><dd><a href="#SEC-THR-001">SEC-THR-001</a></dd></div>
      <div><dt>Evidence</dt><dd><a href="#SEC-EVD-044">SEC-EVD-044</a> (current)</dd></div>
      <div><dt>Independent verification</dt><dd>Completed <time datetime="2026-09-27">27 Sep 2026</time></dd></div>
    </dl>
  </article>
</ef-security-invariant-result>`
    },
    {
      id: "unknown",
      title: "Unknown because evidence is missing",
      description: "An invariant that cannot be evaluated. The Unknown state is written out and the missing evidence is listed as its own term, so it is not mistaken for a pass or a violation.",
      html: `<ef-security-invariant-result class="ef-component-tag">
  <article class="ef-invariant-result" id="security-invariant-result-unknown-SEC-INV-021" data-state="unknown" aria-labelledby="security-invariant-result-unknown-title">
    <header><p>Security invariant</p><h3 id="security-invariant-result-unknown-title">SEC-INV-021</h3><strong>Unknown</strong></header>
    <p>Outbound network traffic is limited to approved destinations.</p>
    <dl>
      <div><dt>Threats</dt><dd><a href="#SEC-THR-007">SEC-THR-007</a></dd></div>
      <div><dt>Evidence</dt><dd>None recorded for this artifact</dd></div>
      <div><dt>Unknowns</dt><dd><a href="#SEC-UNK-003">SEC-UNK-003</a></dd></div>
      <div><dt>Independent verification</dt><dd>Required</dd></div>
    </dl>
  </article>
</ef-security-invariant-result>`
    },
    {
      id: "mobile",
      title: "Violated invariant on a phone",
      description: "A violated invariant with a long statement at phone width.",
      mobile: {
        height: 460,
        notes: [
          "The header wraps: the eyebrow takes a full line, then the ID and the state word share a line or wrap onto two when space runs out.",
          "The related-records list auto-fits columns of at least `min(10rem, 100%)`, so it becomes one column at 320px.",
          "The statement and values wrap; long IDs break anywhere without horizontal scrolling.",
          "Reading order is identical in portrait and landscape."
        ]
      },
      html: `<ef-security-invariant-result class="ef-component-tag">
  <article class="ef-invariant-result" id="security-invariant-result-mobile-SEC-INV-014" data-state="violated" aria-labelledby="security-invariant-result-mobile-title">
    <header><p>Security invariant</p><h3 id="security-invariant-result-mobile-title">SEC-INV-014</h3><strong>Violated</strong></header>
    <p>Privileged actions require explicit authorization at the effect boundary, including actions started by agent tools on behalf of a user.</p>
    <dl>
      <div><dt>Threats</dt><dd><a href="#SEC-THR-004">SEC-THR-004</a></dd></div>
      <div><dt>Evidence</dt><dd><a href="#SEC-EVD-042">SEC-EVD-042</a></dd></div>
      <div><dt>Independent verification</dt><dd>Required</dd></div>
    </dl>
  </article>
</ef-security-invariant-result>`
    }
  ],
  api: {
    attributes: [
      { name: "id", on: "article", values: "stable invariant ID", default: "—", description: "Deep-link target; use the stable Tutela ID such as SEC-INV-014." },
      { name: "data-state", on: "article", values: "verified | violated | unknown | stale | na", default: "—", description: "Tutela's evaluation as machine state. Not styled by Forma CSS; the bold state word is the visible cue." },
      { name: "aria-labelledby", on: "article", values: "id of the heading", default: "—", description: "Optional. Names the article by its invariant ID." },
      { name: "href", on: "a", values: "stable record URL or #ID", default: "—", description: "Links to threats, evidence and unknowns." },
      { name: "datetime", on: "time", values: "ISO 8601 date", default: "—", description: "Machine-readable verification date." }
    ],
    hooks: {
      "ef-invariant-result": "Root article: bordered, padded primary surface. The header is a wrapping flex row whose first paragraph is a full-width uppercase eyebrow; the description list is an auto-fit grid of at least 10rem columns with secondary-colored bold terms and values that wrap anywhere."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between related-record links." },
      { keys: "Enter", action: "Follows the focused link." }
    ],
    events: [
      { name: "—", description: "No events." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Verified", how: "data-state=\"verified\" + text Verified", description: "Current evidence supports the invariant." },
    { name: "Violated", how: "data-state=\"violated\" + text Violated", description: "Evidence shows the invariant does not hold." },
    { name: "Unknown", how: "data-state=\"unknown\" + text Unknown", description: "The invariant cannot be evaluated; missing evidence or unknowns are listed." },
    { name: "Stale", how: "data-state=\"stale\" + text Stale", description: "The supporting evidence has been invalidated." },
    { name: "N/A", how: "data-state=\"na\" + text Not applicable", description: "The invariant does not apply to this scope." }
  ],
  accessibility: {
    forma: [
      "Shows the state as a bold word next to the ID; no color-only cue is used.",
      "Uses a description list for related records so terms and values are paired.",
      "Reflows to one column at 320px."
    ],
    consumer: [
      "Render the state exactly as Tutela supplied it, as text.",
      "Write \"Not applicable\" or \"N/A\" explicitly; do not hide inapplicable invariants when counts elsewhere include them.",
      "List missing evidence and unknowns as terms rather than leaving values empty.",
      "Use the stable ID as article id and heading."
    ]
  },
  responsive: [
    "The header is a wrapping flex row; the eyebrow always takes a full line.",
    "Related records auto-fit into columns of at least `min(10rem, 100%)`, one column on phones.",
    "Values wrap anywhere. No breakpoints are needed."
  ],
  motion: [
    "No animation: the result is static and a re-evaluation replaces the text."
  ],
  guidance: {
    do: [
      "Keep the invariant statement visible; the ID alone is not meaningful to most readers.",
      "Link current evidence and note its freshness."
    ],
    avoid: [
      "Using check marks or colored dots without the state word.",
      "Showing Verified when evidence is stale; show Stale as Tutela reports it."
    ]
  },
  related: [
    { slug: "security-evidence-chain", note: "Shows how evidence reaches this invariant." },
    { slug: "security-state-matrix", note: "Counts invariants and evidence by state." },
    { slug: "security-exception", note: "An approved deviation from an invariant." },
    { slug: "security-unknown", note: "The detail record for an unknown linked from an invariant." }
  ]
};
