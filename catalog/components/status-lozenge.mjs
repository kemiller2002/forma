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
      id: "environment-table",
      title: "Deployment environments",
      description: "Lozenges inside a [[key-value-list]] describing three environments. Each state is named in words; the glyphs repeat the distinction in shape.",
      html: `<ef-status-lozenge class="ef-component-tag">
  <dl class="ef-key-value-list">
    <div><dt>Production</dt><dd><span class="ef-status-lozenge" data-state="ok">Healthy</span></dd></div>
    <div><dt>Staging</dt><dd><span class="ef-status-lozenge" data-state="attention">Deploy pending approval</span></dd></div>
    <div><dt>Disaster recovery</dt><dd><span class="ef-status-lozenge" data-state="unknown">Not reporting</span></dd></div>
  </dl>
</ef-status-lozenge>`
    },
    {
      id: "neutral-states",
      title: "Neutral workflow states",
      description: "States that are neither good nor bad, such as Draft or Scheduled, omit `data-state` and get the neutral bullet. The set is a labelled group so its purpose is announced.",
      html: `<ef-status-lozenge class="ef-component-tag">
  <div class="ef-status-lozenge-set" role="group" aria-label="Invoice workflow states">
    <span class="ef-status-lozenge">Draft</span>
    <span class="ef-status-lozenge">Scheduled</span>
    <span class="ef-status-lozenge" data-state="ok">Paid</span>
    <span class="ef-status-lozenge" data-state="blocked">Voided</span>
  </div>
</ef-status-lozenge>`
    },
    {
      id: "mobile-status-set",
      title: "Mobile status set",
      description: "A lozenge set at phone width.",
      mobile: {
        height: 260,
        notes: [
          "Below 30rem each lozenge in a set takes the full row and its content is centered, so the set becomes a vertical list.",
          "Lozenge text does not wrap; a very long label can overflow a narrow screen, so keep labels to a few words.",
          "Lozenges are not interactive and have no touch target; if a state needs an action, place a button next to it.",
          "Orientation changes let the set return to a wrapping row once the width exceeds 30rem."
        ]
      },
      html: `<ef-status-lozenge class="ef-component-tag">
  <div class="ef-status-lozenge-set" role="group" aria-label="Payment run status">
    <span class="ef-status-lozenge" data-state="ok">112 sent</span>
    <span class="ef-status-lozenge" data-state="attention">6 held</span>
    <span class="ef-status-lozenge" data-state="unknown">2 unconfirmed</span>
    <span class="ef-status-lozenge" data-state="blocked">1 rejected</span>
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
