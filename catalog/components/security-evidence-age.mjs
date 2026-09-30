export default {
  name: "Security evidence age",
  category: "security",
  behavior: "Aegis / application",
  summary: "Makes security evidence freshness and staleness explicit.",
  owns: ["ef-evidence-age"],
  purpose: {
    description: "Security evidence age lists evidence records with their freshness written in text: current with its observation date, stale with the reason it was invalidated, or never observed. Stale evidence cannot silently support a security conclusion, so each entry states its state explicitly next to its stable ID. Tutela decides whether evidence is current or stale; Forma presents that result and does not compute ages or thresholds.",
    useWhen: [
      "A security review needs to show which evidence is still current for a release.",
      "Evidence has been invalidated, for example by a boundary change, and readers must see why.",
      "Each evidence record needs a deep link and a visible freshness state."
    ],
    avoidWhen: [
      "You need a single inline \"last verified\" timestamp for any value: use [[freshness]].",
      "You need to show how evidence supports a conclusion: use [[security-evidence-chain]].",
      "You need counts of stale versus verified evidence: use [[security-state-matrix]]."
    ],
    characteristics: [
      "Each entry is a stable-ID link followed by a text line starting with the state (Current, Stale, Not observed).",
      "Entries carry a start border and secondary surface so they read as separate records; the border does not change with state.",
      "`data-state` records the machine state and is not used as the only cue.",
      "Dates use `time` elements with machine-readable values."
    ]
  },
  examples: [
    {
      id: "mixed",
      title: "Current, stale and never observed",
      description: "Three evidence records in three different states. The never-observed entry is shown explicitly instead of being omitted or treated as stale.",
      html: `<ef-security-evidence-age class="ef-component-tag">
  <section class="ef-evidence-age" aria-labelledby="security-evidence-age-mixed-title">
    <h2 id="security-evidence-age-mixed-title">Evidence freshness for SEC-INV-014</h2>
    <ul>
      <li data-state="current"><a href="#SEC-EVD-042">SEC-EVD-042</a><span>Current · observed <time datetime="2026-09-29">29 Sep 2026</time> against this release artifact</span></li>
      <li data-state="stale"><a href="#SEC-EVD-031">SEC-EVD-031</a><span>Stale · invalidated by the session-store boundary change on <time datetime="2026-09-21">21 Sep 2026</time></span></li>
      <li data-state="unknown"><a href="#SEC-EVD-050">SEC-EVD-050</a><span>Not observed · no run exists for this artifact</span></li>
    </ul>
  </section>
</ef-security-evidence-age>`
    },
    {
      id: "all-stale",
      title: "All evidence invalidated",
      description: "Every record is stale after a dependency upgrade. The heading states the count so the situation is clear before reading the list.",
      html: `<ef-security-evidence-age class="ef-component-tag">
  <section class="ef-evidence-age" aria-labelledby="security-evidence-age-all-stale-title">
    <h2 id="security-evidence-age-all-stale-title">2 of 2 evidence records are stale</h2>
    <ul>
      <li data-state="stale"><a href="#SEC-EVD-018">SEC-EVD-018</a><span>Stale · invalidated by the TLS library upgrade</span></li>
      <li data-state="stale"><a href="#SEC-EVD-019">SEC-EVD-019</a><span>Stale · invalidated by the TLS library upgrade</span></li>
    </ul>
  </section>
</ef-security-evidence-age>`
    },
    {
      id: "mobile",
      title: "Evidence freshness on a phone",
      description: "Long reasons and IDs at phone width.",
      mobile: {
        height: 340,
        notes: [
          "The list is a single-column grid at every width, so entries stack vertically with a 0.5rem gap.",
          "Explanations use `overflow-wrap: anywhere`, so long reasons and dates wrap without horizontal scrolling.",
          "Each entry's ID link sits on its own line above the explanation, giving a clear tap target.",
          "Orientation changes only reflow the text lines."
        ]
      },
      html: `<ef-security-evidence-age class="ef-component-tag">
  <section class="ef-evidence-age" aria-labelledby="security-evidence-age-mobile-title">
    <h2 id="security-evidence-age-mobile-title">Evidence freshness</h2>
    <ul>
      <li data-state="current"><a href="#SEC-EVD-042">SEC-EVD-042</a><span>Current · observed <time datetime="2026-09-29">29 Sep 2026</time></span></li>
      <li data-state="stale"><a href="#SEC-EVD-031">SEC-EVD-031</a><span>Stale · invalidated by the change to the authorization boundary for imported organizations</span></li>
    </ul>
  </section>
</ef-security-evidence-age>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-evidence-age", values: "id of the heading", default: "—", description: "Names the region by its heading." },
      { name: "data-state", on: "li", values: "current | stale | unknown", default: "—", description: "Machine freshness state from Tutela. Not styled by Forma CSS; the entry text must state it." },
      { name: "href", on: "a", values: "stable record URL or #ID", default: "—", description: "Deep link to the evidence record." },
      { name: "datetime", on: "time", values: "ISO 8601", default: "—", description: "Machine-readable observation or invalidation date." }
    ],
    hooks: {
      "ef-evidence-age": "Root section: bordered, padded primary surface. Its list is an unstyled single-column grid; each entry is a grid with a 0.3rem start border in the current text color and a secondary surface, and its span wraps anywhere."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between evidence links." },
      { keys: "Enter", action: "Follows the focused link." }
    ],
    events: [
      { name: "—", description: "No events." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Current", how: "data-state=\"current\" + text Current", description: "Evidence is valid for this subject; the observation date is shown." },
    { name: "Stale", how: "data-state=\"stale\" + text Stale", description: "Evidence was invalidated; the reason is shown." },
    { name: "Not observed", how: "data-state=\"unknown\" + text", description: "No evidence exists yet for this subject; shown explicitly." }
  ],
  accessibility: {
    forma: [
      "Presents each record as a list item with its state in text; the start border is structural, not a state color.",
      "Keeps the list semantic, so the number of records is announced.",
      "Wraps long content at 320px."
    ],
    consumer: [
      "Start each explanation with the state word so it is read first.",
      "Explain why evidence is stale; a date alone does not tell the reader what changed.",
      "Keep stale and unobserved evidence visible; never filter it out of a security view.",
      "Redact sensitive evidence details before rendering."
    ]
  },
  responsive: [
    "The section has zero minimum inline size; the list is a single-column grid at every width.",
    "Text wraps anywhere inside each entry. No breakpoints are needed."
  ],
  motion: [
    "No animation: freshness is static text and state changes replace it immediately."
  ],
  guidance: {
    do: [
      "Use the same state vocabulary as Tutela (Current, Stale).",
      "Include the observation date for current evidence."
    ],
    avoid: [
      "Color-coding ages without text.",
      "Computing \"days old\" in the UI as a substitute for Tutela's stale/current decision."
    ]
  },
  related: [
    { slug: "freshness", note: "A compact inline last-verified label for any value; evidence age lists security evidence records." },
    { slug: "security-evidence-chain", note: "Shows how evidence supports a conclusion rather than how old it is." },
    { slug: "security-state-matrix", note: "Counts stale evidence alongside other states." }
  ]
};
