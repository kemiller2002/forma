import { missionById } from "../example-data/nasa-spaceflight.mjs";

const apollo11 = missionById("apollo-11");
const sts31 = missionById("sts-31");
const artemisI = missionById("artemis-i");

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
      id: "apollo-11-history",
      title: "Apollo 11 mission history",
      description: "Three historical events, newest first, use the canonical Apollo 11 record and factual dates. Outcome text is explicit instead of relying on marker color.",
      html: `<ef-timeline class="ef-component-tag">
  <ol class="ef-timeline" aria-label="${apollo11.name} mission history, newest first">
    <li class="ef-timeline__item">
      <div class="ef-timeline__marker" aria-hidden="true"></div>
      <div class="ef-timeline__content">
        <div class="ef-timeline__meta"><time datetime="${apollo11.returnDate}">${apollo11.returnDate}</time><span class="ef-status-lozenge" data-state="ok">Returned</span></div>
        <h3>${apollo11.name} returned to Earth</h3>
        <p>Columbia splashed down in the Pacific Ocean after the first crewed lunar landing mission.</p>
        <small>Source: NASA mission record</small>
      </div>
    </li>
    <li class="ef-timeline__item">
      <div class="ef-timeline__marker" aria-hidden="true"></div>
      <div class="ef-timeline__content">
        <div class="ef-timeline__meta"><time datetime="1969-07-20">1969-07-20</time><span class="ef-status-lozenge" data-state="ok">Landed</span></div>
        <h3>First crewed lunar landing</h3>
        <p>${apollo11.highlight} in the ${apollo11.destination}.</p>
        <small>Source: NASA mission record</small>
      </div>
    </li>
    <li class="ef-timeline__item">
      <div class="ef-timeline__marker" aria-hidden="true"></div>
      <div class="ef-timeline__content">
        <div class="ef-timeline__meta"><time datetime="${apollo11.launchDate}">${apollo11.launchDate}</time><span class="ef-status-lozenge">Launch</span></div>
        <h3>${apollo11.name} launched</h3>
        <p>${apollo11.launchVehicle} carried ${apollo11.crew.join(", ")} toward the Moon.</p>
      </div>
    </li>
  </ol>
</ef-timeline>`
    },
    {
      id: "expandable-detail",
      title: "Mission event with expandable detail",
      description: "STS-31 demonstrates optional detail inside a native disclosure. The main event stays scannable while spacecraft, destination and crew facts remain available without script.",
      html: `<ef-timeline class="ef-component-tag">
  <ol class="ef-timeline" aria-label="${sts31.name} mission record">
    <li class="ef-timeline__item">
      <div class="ef-timeline__marker" aria-hidden="true"></div>
      <div class="ef-timeline__content">
        <div class="ef-timeline__meta"><time datetime="${sts31.returnDate}">${sts31.returnDate}</time><span class="ef-status-lozenge" data-state="ok">${sts31.status}</span></div>
        <h3>${sts31.name} completed</h3>
        <p>${sts31.highlight}.</p>
        <details class="ef-disclosure" data-ef-motion-weight="light">
          <summary>Show mission details</summary>
          <div class="ef-disclosure__content">
            <p>Spacecraft: ${sts31.spacecraft}. Destination: ${sts31.destination}. Crew: ${sts31.crew.join(", ")}.</p>
          </div>
        </details>
      </div>
    </li>
    <li class="ef-timeline__item">
      <div class="ef-timeline__marker" aria-hidden="true"></div>
      <div class="ef-timeline__content">
        <div class="ef-timeline__meta"><time datetime="${sts31.launchDate}">${sts31.launchDate}</time><span>NASA</span></div>
        <h3>${sts31.name} launched aboard ${sts31.spacecraft}</h3>
      </div>
    </li>
  </ol>
</ef-timeline>`
    },
    {
      id: "mobile-activity",
      title: "Mobile Artemis I history",
      description: "The same timeline structure at phone width uses the uncrewed Artemis I flight as a compact two-event mission history.",
      mobile: {
        height: 440,
        notes: [
          "The timeline is already single-column: a fixed marker column beside a flexible content column, so it needs no breakpoint.",
          "The meta line wraps at 320px instead of overflowing.",
          "Mission headings and descriptions wrap inside the bordered content block.",
          "The timeline has no interactive behavior of its own."
        ]
      },
      html: `<ef-timeline class="ef-component-tag">
  <ol class="ef-timeline" aria-label="${artemisI.name} mission history">
    <li class="ef-timeline__item">
      <div class="ef-timeline__marker" aria-hidden="true"></div>
      <div class="ef-timeline__content">
        <div class="ef-timeline__meta"><time datetime="${artemisI.returnDate}">${artemisI.returnDate}</time><span class="ef-status-lozenge" data-state="ok">Splashdown</span></div>
        <h3>${artemisI.name} completed</h3>
        <p>${artemisI.highlight}.</p>
      </div>
    </li>
    <li class="ef-timeline__item">
      <div class="ef-timeline__marker" aria-hidden="true"></div>
      <div class="ef-timeline__content">
        <div class="ef-timeline__meta"><time datetime="${artemisI.launchDate}">${artemisI.launchDate}</time><span class="ef-status-lozenge">Launch</span></div>
        <h3>${artemisI.spacecraft} launched on ${artemisI.launchVehicle}</h3>
        <p>Destination: ${artemisI.destination}. Crew status: uncrewed.</p>
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
