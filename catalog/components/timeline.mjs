export default {
  name: "Timeline",
  category: "data",
  behavior: "Application content",
  summary: "Chronological or ordered activity with timestamps, state changes, provenance, and single-column mobile flow.",
  purpose: {
    description: "A timeline is an ordered list of events. Each `li` has a decorative marker on a vertical rail and a bordered content block holding a meta line (a `time` element and optional status), a heading, a description and an optional source. Forma draws the rail, markers and spacing; the application decides the order (newest or oldest first), the grouping and what each event says. The list order is the chronology, so it reads the same with or without the rail.",
    useWhen: [
      "Users need the history of a record: who did what, when, and what state resulted.",
      "Events carry a timestamp, a short title and optional status or source attribution.",
      "An audit or activity trail must stay readable on a phone as a single column."
    ],
    avoidWhen: [
      "Events are short notifications in a stream that users triage and act on: use [[feed-item]].",
      "The steps are a sequence the user is working through: use [[steps]] or [[wizard]].",
      "The list is a derivation of one displayed value: use [[provenance-trail]].",
      "Many uniform events need sorting and filtering: use [[data-grid]] or [[dense-ledger]]."
    ],
    characteristics: [
      "Two-column item grid: a 1.25rem marker column and a flexible content column.",
      "A 1px rail connects markers; the last item has no rail below it.",
      "The meta line wraps and spreads the time and status apart with `justify-content: space-between`.",
      "Markers are hollow circles for every event; state is written in the meta line, not encoded in the marker."
    ]
  },
  examples: [
    {
      id: "unknown-outcome",
      title: "History with an unknown outcome",
      description: "A payment's history, newest first. The latest event's outcome is not yet known, and the timeline says so with an Unknown status instead of implying failure or success.",
      html: `<ef-timeline class="ef-component-tag">
  <ol class="ef-timeline" aria-label="Payment PAY-88122 history">
    <li class="ef-timeline__item">
      <div class="ef-timeline__marker" aria-hidden="true"></div>
      <div class="ef-timeline__content">
        <div class="ef-timeline__meta"><time datetime="2026-09-29T08:20:00Z">Sep 29 · 08:20</time><span class="ef-status-lozenge" data-state="unknown">Outcome unknown</span></div>
        <h3>Settlement requested</h3>
        <p>The bank accepted the request but has not confirmed settlement.</p>
        <small>Source: bank connector</small>
      </div>
    </li>
    <li class="ef-timeline__item">
      <div class="ef-timeline__marker" aria-hidden="true"></div>
      <div class="ef-timeline__content">
        <div class="ef-timeline__meta"><time datetime="2026-09-29T08:02:00Z">Sep 29 · 08:02</time><span class="ef-status-lozenge" data-state="ok">Approved</span></div>
        <h3>Payment approved</h3>
        <p>Approved by J. Lindqvist under the finance approval policy.</p>
        <small>Source: approvals</small>
      </div>
    </li>
    <li class="ef-timeline__item">
      <div class="ef-timeline__marker" aria-hidden="true"></div>
      <div class="ef-timeline__content">
        <div class="ef-timeline__meta"><time datetime="2026-09-28T16:45:00Z">Sep 28 · 16:45</time><span class="ef-status-lozenge">Created</span></div>
        <h3>Payment created</h3>
        <p>Created from invoice INV-1042.</p>
      </div>
    </li>
  </ol>
</ef-timeline>`
    },
    {
      id: "expandable-detail",
      title: "Event with expandable detail",
      description: "A configuration change whose full diff is optional reading. The detail sits in a native [[disclosure]] inside the event's content, so the timeline stays scannable and the browser owns open and closed state.",
      html: `<ef-timeline class="ef-component-tag">
  <ol class="ef-timeline" aria-label="Workspace settings history">
    <li class="ef-timeline__item">
      <div class="ef-timeline__marker" aria-hidden="true"></div>
      <div class="ef-timeline__content">
        <div class="ef-timeline__meta"><time datetime="2026-09-27T11:05:00Z">Sep 27 · 11:05</time><span>by m.okafor</span></div>
        <h3>Retention policy changed</h3>
        <p>Evidence retention changed from 30 days to unlimited.</p>
        <details class="ef-disclosure" data-ef-motion-weight="light">
          <summary>Show changed fields</summary>
          <div class="ef-disclosure__content">
            <p>Retention: 30 days → Unlimited. Export: Manual → Automated after approval.</p>
          </div>
        </details>
      </div>
    </li>
    <li class="ef-timeline__item">
      <div class="ef-timeline__marker" aria-hidden="true"></div>
      <div class="ef-timeline__content">
        <div class="ef-timeline__meta"><time datetime="2026-09-20T09:30:00Z">Sep 20 · 09:30</time><span>by system</span></div>
        <h3>Workspace created</h3>
      </div>
    </li>
  </ol>
</ef-timeline>`
    },
    {
      id: "mobile-activity",
      title: "Mobile activity history",
      description: "The same structure at phone width. The marker column stays fixed at 1.25rem and the content column takes the rest.",
      mobile: {
        height: 440,
        notes: [
          "The timeline is already single-column: a fixed 1.25rem marker column beside a `minmax(0, 1fr)` content column, so it needs no breakpoint.",
          "The meta line wraps: at 320px a long status moves below the timestamp instead of overflowing.",
          "Headings and descriptions wrap inside the bordered content block; long identifiers should use [[identifier]] so they break safely.",
          "The timeline has no interactive parts of its own; links or disclosures inside events keep their own touch targets."
        ]
      },
      html: `<ef-timeline class="ef-component-tag">
  <ol class="ef-timeline" aria-label="Ticket SUP-3120 activity">
    <li class="ef-timeline__item">
      <div class="ef-timeline__marker" aria-hidden="true"></div>
      <div class="ef-timeline__content">
        <div class="ef-timeline__meta"><time datetime="2026-09-29T09:12:00Z">09:12</time><span class="ef-status-lozenge" data-state="attention">Awaiting customer reply</span></div>
        <h3>Support replied</h3>
        <p>Asked for the export settings used when the CSV failed.</p>
      </div>
    </li>
    <li class="ef-timeline__item">
      <div class="ef-timeline__marker" aria-hidden="true"></div>
      <div class="ef-timeline__content">
        <div class="ef-timeline__meta"><time datetime="2026-09-29T07:55:00Z">07:55</time><span class="ef-status-lozenge">New</span></div>
        <h3>Ticket opened</h3>
        <p>Cannot export the quarterly usage report as CSV.</p>
      </div>
    </li>
  </ol>
</ef-timeline>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "ol.ef-timeline", values: "string", default: "—", description: "Names the history, for example \"Payment PAY-88122 history\"." },
      { name: "aria-hidden", on: ".ef-timeline__marker", values: "true", default: "—", description: "The marker is decorative; hide it from assistive technology." },
      { name: "datetime", on: "time", values: "ISO date-time", default: "—", description: "Machine-readable event time; the visible text can be relative or abbreviated." }
    ],
    hooks: {
      "ef-timeline": "The ordered list; list styling removed.",
      "ef-timeline__item": "One event: a marker column and a content column, with the connecting rail drawn from `::before` on every item except the last.",
      "ef-timeline__marker": "Decorative hollow circle aligned with the event's first line.",
      "ef-timeline__content": "Bordered block holding the meta line, heading, description and source.",
      "ef-timeline__meta": "Wrapping flex row for the timestamp and status, in small monospace type."
    },
    keyboard: [
      { keys: "Tab", action: "Reaches links, buttons or disclosure summaries inside events. The timeline itself is not focusable." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Event", how: "li.ef-timeline__item", description: "Marker, rail and content block." },
    { name: "Last event", how: ":last-child", description: "No rail continues below the marker." },
    { name: "Event status", how: "text or [[status-lozenge]] in .ef-timeline__meta", description: "Stated in words; markers look identical for every status." }
  ],
  accessibility: {
    forma: [
      "Uses an ordered list, so assistive technology announces the number of events and each position.",
      "Draws the rail with a pseudo-element and asks for the marker to be `aria-hidden`, so decoration is never announced.",
      "Does not encode state in marker color or shape."
    ],
    consumer: [
      "Label the list and keep a consistent order; say in the label or a heading whether it is newest or oldest first.",
      "Use `time datetime` for every timestamp and include the time zone where it matters.",
      "Give each event a heading at the right level for the page, and write outcome and source as text.",
      "If events load incrementally, announce additions with an application live region."
    ]
  },
  responsive: [
    "No breakpoints: the fixed marker column plus flexible content column works from 320px up.",
    "The meta line wraps; the content block has `min-inline-size: 0`, so long text wraps rather than widening the list.",
    "Grouping by day or period is application markup, for example a heading before each list."
  ],
  motion: [
    "No animation: markers, rail and content are static. Newly inserted events appear without transition."
  ],
  guidance: {
    do: [
      "Write events as outcomes (\"Payment approved\") with the actor and source.",
      "Show unknown or pending outcomes explicitly."
    ],
    avoid: [
      "Coloring markers to mean success or failure.",
      "Mixing ascending and descending order in one view.",
      "Putting primary actions inside historical events; actions belong to the current record."
    ]
  },
  related: [
    { slug: "feed-item", note: "A single actionable item in a stream, with owned actions rather than historical record." },
    { slug: "provenance-trail", note: "Traces how one value was produced rather than what happened over time." },
    { slug: "steps", note: "Progress through a defined sequence the user is completing." },
    { slug: "diff-viewer", note: "Shows exactly what changed between two versions referenced by a timeline event." }
  ]
};
