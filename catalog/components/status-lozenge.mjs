import { missionById } from "../example-data/nasa-spaceflight.mjs";

const apollo11 = missionById("apollo-11");
const sts31 = missionById("sts-31");
const artemisI = missionById("artemis-i");

export default {
  name: "Status lozenge",
  category: "feedback",
  behavior: "Application state",
  summary: "Compact textual state label with a shape glyph and border, so state never depends on color.",
  owns: ["ef-status-lozenge", "ef-status-lozenge-set"],
  purpose: {
    description: "A status lozenge is a short, bordered label that names the state of something: Confirmed, Needs attention, Unknown, Blocked. Forma renders the text in a compact monospace box and adds a glyph before it from `data-state` (check, exclamation, question mark, cross, or a bullet when no state is set). The application chooses the wording and the `data-state` value; the text is the authority and the glyph is a redundant structural cue. A lozenge set lays several out in a wrapping row.",
    useWhen: [
      "A record, row or card needs a one- to three-word state label.",
      "Several independent states are shown together and should stay distinguishable in grayscale.",
      "A larger feedback pattern ([[operation-status]], [[conflict-review]], [[readiness-checklist]]) needs a state marker in its header."
    ],
    avoidWhen: [
      "The label is a count or a category tag rather than a state: use [[badge]].",
      "The state needs an explanation or action: use [[operation-status]] or [[alert]], which can include a lozenge.",
      "The label is long or a sentence: lozenges do not wrap by default."
    ],
    characteristics: [
      "Five glyph shapes: ✓ for ok, ! for attention, ? for unknown, × for blocked, and • when `data-state` is absent or unrecognized.",
      "All lozenges share one border, surface and text color; the difference is in words and glyph, not hue.",
      "Text does not wrap (`white-space: nowrap`), so keep labels short."
    ]
  },
  examples: [
    {
      id: "mission-record-states",
      title: "Mission-record workflow states",
      description: "The NASA facts come from canonical records; the lozenges describe a hypothetical local documentation workflow around those records. Each state is named in words and the glyph repeats the distinction in shape.",
      html: `<ef-status-lozenge class="ef-component-tag">
  <dl class="ef-key-value-list">
    <div><dt>${apollo11.name}</dt><dd><span class="ef-status-lozenge" data-state="ok">Source verified</span></dd></div>
    <div><dt>${sts31.name}</dt><dd><span class="ef-status-lozenge" data-state="attention">Citation review due</span></dd></div>
    <div><dt>${artemisI.name}</dt><dd><span class="ef-status-lozenge" data-state="unknown">Source check unavailable</span></dd></div>
  </dl>
</ef-status-lozenge>`
    },
    {
      id: "neutral-states",
      title: "Neutral record states",
      description: "States that are neither good nor bad omit data-state and get the neutral bullet. The values describe local catalog work, not the historical outcome of the NASA mission.",
      html: `<ef-status-lozenge class="ef-component-tag">
  <div class="ef-status-lozenge-set" role="group" aria-label="${apollo11.name} catalog states">
    <span class="ef-status-lozenge">Indexed</span>
    <span class="ef-status-lozenge">Selected</span>
    <span class="ef-status-lozenge" data-state="ok">Source verified</span>
    <span class="ef-status-lozenge" data-state="blocked">Local edit blocked</span>
  </div>
</ef-status-lozenge>`
    },
    {
      id: "mobile-status-set",
      title: "Mobile mission-record status set",
      description: "A local status set for mission documentation at phone width.",
      mobile: {
        height: 260,
        notes: [
          "Below 30rem each lozenge takes the full row and its content is centered.",
          "Lozenge text does not wrap, so labels stay intentionally short.",
          "Lozenges are not interactive; actions belong beside them, not inside them.",
          "Wider orientation lets the set return to a wrapping row."
        ]
      },
      html: `<ef-status-lozenge class="ef-component-tag">
  <div class="ef-status-lozenge-set" role="group" aria-label="Mission documentation status">
    <span class="ef-status-lozenge" data-state="ok">5 verified</span>
    <span class="ef-status-lozenge" data-state="attention">1 review</span>
    <span class="ef-status-lozenge" data-state="unknown">1 unchecked</span>
    <span class="ef-status-lozenge" data-state="blocked">1 blocked</span>
  </div>
</ef-status-lozenge>`
    }
  ],
  api: {
    attributes: [
      { name: "data-state", on: "span.ef-status-lozenge", values: "ok | attention | unknown | blocked", default: "absent (neutral bullet)", description: "Selects the leading glyph. Presentation only; the text must name the state." },
      { name: "role", on: "div.ef-status-lozenge-set", values: "group", default: "—", description: "Optional. Lets a set carry an accessible name when its purpose is not clear from surrounding headings." },
      { name: "aria-label", on: "div.ef-status-lozenge-set", values: "string", default: "—", description: "Names the set. Use it together with a role such as group; a label on a plain div is ignored by many screen readers." }
    ],
    hooks: {
      "ef-status-lozenge": "Inline-flex bordered label with monospace 0.6875rem text, a 1.75rem minimum height and a generated leading glyph.",
      "ef-status-lozenge-set": "Wrapping flex row for several lozenges. Below 30rem each lozenge takes the full row.",
      "data-state": "Chooses the glyph: ok ✓, attention !, unknown ?, blocked ×. Any other value or none shows •."
    },
    keyboard: [
      { keys: "—", action: "Not focusable or interactive." }
    ],
    events: [
      { name: "—", description: "None." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Ok", how: "data-state=\"ok\"", description: "Check-mark glyph. Use for confirmed, healthy, complete." },
    { name: "Attention", how: "data-state=\"attention\"", description: "Exclamation glyph. Use for pending, stale, partial, needs review." },
    { name: "Unknown", how: "data-state=\"unknown\"", description: "Question-mark glyph. Use when the state has not been established; unknown is not failure." },
    { name: "Blocked", how: "data-state=\"blocked\"", description: "Cross glyph. Use for blocked, rejected, unavailable." },
    { name: "Neutral", how: "no data-state", description: "Bullet glyph for states with no attention implication." }
  ],
  accessibility: {
    forma: [
      "Uses a border, glyph shape and text rather than color to distinguish states.",
      "Draws the lozenge in the standard text and border tokens, which Forma maps to system colors in forced colors."
    ],
    consumer: [
      "Write the full state in text; do not rely on the glyph. The glyph is CSS generated content and some screen readers announce it along with the text.",
      "Do not repeat the glyph character in the text.",
      "Give a set an accessible name only with a role that supports one (for example `role=\"group\"`)."
    ]
  },
  responsive: [
    "Lozenges size to their text and never wrap internally.",
    "A set is a wrapping flex row; below 30rem its lozenges become full-width rows with centered content.",
    "Inside [[attention-path]] and [[emphasis-budget]] Forma allows lozenge text to wrap at narrow widths; elsewhere keep labels short."
  ],
  motion: [
    "No animation: a lozenge changes when the application changes its text or `data-state`."
  ],
  guidance: {
    do: [
      "Use consistent vocabulary across the product (\"Unknown\" always means the state has not been established).",
      "Map domain states to `data-state` deliberately and document the mapping in the application."
    ],
    avoid: [
      "Encoding state only through `data-state` with generic text such as \"Status\".",
      "Using attention or blocked glyphs for states that are merely neutral."
    ]
  },
  related: [
    { slug: "badge", note: "Counts and categories rather than states." },
    { slug: "operation-status", note: "A state with explanation and recovery actions." },
    { slug: "state-survivability", note: "Several distinct authoritative states, each with its own explanation." },
    { slug: "diagnostic-status", note: "Diagnostic or health indicators with more structure." }
  ]
};
