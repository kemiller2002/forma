export default {
  name: "Freshness",
  category: "feedback",
  behavior: "Application state",
  summary: "States when evidence or data was last verified, with a machine-readable time and an explicit current or stale label.",
  purpose: {
    description: "Freshness tells the user how old a piece of evidence or state is, so they do not mistake an old reading for the current situation. Forma renders a wrapping line with a bold label, a native `time` element carrying the exact timestamp in `datetime`, and a state label. The application supplies the time and decides whether it is current or stale under its own freshness policy; Forma does not compute age.",
    useWhen: [
      "A value, balance, scan result or status was observed at a specific time and may have changed since.",
      "The user is about to act on evidence and must know whether it is recent enough.",
      "A dashboard or record header shows data refreshed on a schedule."
    ],
    avoidWhen: [
      "The time is when something happened (an event log): use [[timeline]] or [[feed-item]].",
      "Security evidence ages across several sources need a structured view: use [[security-evidence-age]].",
      "The data could not be retrieved at all: say it is unavailable with [[operation-status]] or [[state-survivability]] instead of showing an old time."
    ],
    characteristics: [
      "Uses `time` with an ISO `datetime`, so the exact moment is available even when the visible text is relative or local.",
      "The state is stated in words (Current, Stale, Never verified), never by color.",
      "Label, time and state wrap as separate pieces on narrow screens."
    ]
  },
  examples: [
    {
      id: "stale-balance",
      title: "Stale balance",
      description: "A balance whose last sync is older than the application's policy allows. The state is shown as an attention [[status-lozenge]] so it stands out in grayscale as well as color.",
      html: `<ef-freshness class="ef-component-tag">
  <p class="ef-freshness">
    <span class="ef-freshness__label">Balance last synced</span>
    <time datetime="2026-09-28T14:05:00Z">28 Sep, 14:05 UTC</time>
    <span class="ef-status-lozenge" data-state="attention">Stale: older than 24 hours</span>
  </p>
</ef-freshness>`
    },
    {
      id: "never-verified",
      title: "Never verified",
      description: "Evidence that has never been checked. There is no time to show, so the line says so explicitly with an unknown lozenge rather than leaving the time blank.",
      html: `<ef-freshness class="ef-component-tag">
  <p class="ef-freshness">
    <span class="ef-freshness__label">Backup restore test</span>
    <span class="ef-status-lozenge" data-state="unknown">Never verified</span>
  </p>
</ef-freshness>`
    },
    {
      id: "record-facts",
      title: "Freshness per value",
      description: "Several values in a [[key-value-list]], each with its own freshness line, because values refreshed at different times must not share one timestamp.",
      html: `<ef-freshness class="ef-component-tag">
  <dl class="ef-key-value-list">
    <div>
      <dt>Credit limit</dt>
      <dd>25,000.00 <span class="ef-freshness"><span class="ef-freshness__label">Verified</span> <time datetime="2026-09-30T08:00:00Z">today, 08:00 UTC</time> <span class="ef-status-lozenge" data-state="ok">Current</span></span></dd>
    </div>
    <div>
      <dt>Credit score</dt>
      <dd>712 <span class="ef-freshness"><span class="ef-freshness__label">Verified</span> <time datetime="2026-06-02T10:30:00Z">2 Jun 2026</time> <span class="ef-status-lozenge" data-state="attention">Stale</span></span></dd>
    </div>
  </dl>
</ef-freshness>`
    },
    {
      id: "mobile-scan-age",
      title: "Mobile scan age",
      description: "A long label and state at phone width.",
      mobile: {
        height: 200,
        notes: [
          "The line is a wrapping flex row: label, time and state move onto new lines when they do not fit.",
          "Row gap is 0.25rem and column gap 0.5rem, so wrapped parts stay visually grouped.",
          "Each part is kept whole; a lozenge never breaks mid-label, so keep state text short.",
          "There are no touch targets; any Refresh action should be a separate button next to the line."
        ]
      },
      html: `<ef-freshness class="ef-component-tag">
  <p class="ef-freshness">
    <span class="ef-freshness__label">Vulnerability scan of production containers</span>
    <time datetime="2026-09-30T03:15:00Z">today, 03:15 UTC</time>
    <span class="ef-status-lozenge" data-state="ok">Current</span>
  </p>
</ef-freshness>`
    }
  ],
  api: {
    attributes: [
      { name: "datetime", on: "time", values: "ISO 8601 date or date-time", default: "—", description: "The exact time the evidence was verified. Include a timezone offset or Z." },
      { name: "data-state", on: ".ef-status-lozenge", values: "ok | attention | unknown | blocked", default: "—", description: "Glyph for the lozenge that names the freshness state." }
    ],
    hooks: {
      "ef-freshness": "Root wrapping flex row with baseline alignment and small gaps. It may be a paragraph or a span; either way it lays out as a block-level flex row.",
      "ef-freshness__label": "Semibold label describing what the time refers to."
    },
    keyboard: [
      { keys: "—", action: "Not focusable or interactive." }
    ],
    events: [
      { name: "—", description: "None. The application re-renders the line when it re-verifies." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Current", how: "state text Current, for example a lozenge with data-state=\"ok\"", description: "Within the application's freshness policy." },
    { name: "Stale", how: "state text Stale, for example a lozenge with data-state=\"attention\"", description: "Older than the policy permits. The evidence is not proof of the current state." },
    { name: "Never verified", how: "no time element; state text Never verified with data-state=\"unknown\"", description: "No observation exists. Distinct from stale." }
  ],
  accessibility: {
    forma: [
      "Keeps the timestamp in a native `time` element with the exact value in `datetime`.",
      "Presents label, time and state as text in reading order."
    ],
    consumer: [
      "Always state the time zone or use relative wording that cannot be misread.",
      "Say the state in words; do not rely on formatting to mark stale data.",
      "Update the line when the value is refreshed, including the state.",
      "The canonical pattern's `ef-freshness__state` span is not styled by Forma; use a [[status-lozenge]] or plain text for the state."
    ]
  },
  responsive: [
    "Wrapping flex row; there are no breakpoints.",
    "Can sit inside another value, such as a key-value definition, where it starts on its own line below the value.",
    "Long labels wrap; lozenges and times stay whole."
  ],
  motion: [
    "No animation: freshness changes when the application re-renders the time and state."
  ],
  guidance: {
    do: [
      "Show freshness next to the value it qualifies.",
      "Name what was verified (\"Balance last synced\"), not just \"Updated\"."
    ],
    avoid: [
      "Hiding stale data's age behind a tooltip.",
      "Showing a time for data that was never retrieved."
    ]
  },
  related: [
    { slug: "security-evidence-age", note: "Evidence age across several security sources." },
    { slug: "state-survivability", note: "Stale is one of several authoritative states shown together." },
    { slug: "provenance-trail", note: "Where evidence came from, not only when." },
    { slug: "status-lozenge", note: "The state label used inside a freshness line." }
  ]
};
