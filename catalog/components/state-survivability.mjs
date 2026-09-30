export default {
  name: "State survivability",
  category: "feedback",
  behavior: "Ordo / application",
  summary: "Projects explicit authoritative states with text and structural cues so unknown, stale, partial and unavailable do not collapse into one generic status.",
  purpose: {
    description: "State survivability is a list of authoritative states, each rendered as a [[status-lozenge]] beside a sentence explaining what that state means for the user. It exists so that distinct conditions, such as unknown, stale, partial, pending and unavailable, stay distinct on screen and survive the loss of any single visual cue (color, icon, border or motion). The application or Ordo supplies each state and its explanation; Forma only lays out the rows and never merges, ranks or reinterprets them.",
    useWhen: [
      "Several facets of one object or result have different states that must each be read correctly (for example scope complete, evidence stale, one capability unavailable).",
      "A consequential decision depends on distinguishing unknown from failed, partial from complete, or stale from current.",
      "An audit or verification view must remain correct in grayscale, forced colors and without icons."
    ],
    avoidWhen: [
      "There is a single operation with one outcome and recovery actions: use [[operation-status]].",
      "The rows are prerequisites for a transition that the user works through: use [[readiness-checklist]].",
      "The rows are outstanding tasks with actions: use [[obligation-panel]] or [[work-queue]]."
    ],
    characteristics: [
      "Each row pairs a named state with a sentence of consequence; the explanation is never optional.",
      "Rows are separated by rules and laid out in a two-column grid that collapses to one column on narrow screens.",
      "States are not reordered, summarized or color-coded by Forma."
    ]
  },
  examples: [
    {
      id: "import-scope",
      title: "Import with scoped completeness",
      description: "The result of a data import where different parts ended in different states. Confirmed, partial and pending stay separate, so a reader cannot conclude the whole import succeeded.",
      html: `<ef-state-survivability class="ef-component-tag">
  <section class="ef-state-survivability" aria-labelledby="state-survivability-import-scope-title">
    <h3 id="state-survivability-import-scope-title">Customer import, 30 September</h3>
    <div class="ef-state-survivability__state">
      <span class="ef-status-lozenge" data-state="ok">Confirmed</span>
      <p>8,000 customer records were written and verified.</p>
    </div>
    <div class="ef-state-survivability__state">
      <span class="ef-status-lozenge" data-state="attention">Partial</span>
      <p>Contacts were imported for 7,640 customers. 360 customers have no contacts yet; they are listed in the import report.</p>
    </div>
    <div class="ef-state-survivability__state">
      <span class="ef-status-lozenge" data-state="attention">Pending</span>
      <p>Credit limits are queued for approval and are not yet in effect.</p>
    </div>
  </section>
</ef-state-survivability>`
    },
    {
      id: "control-verification",
      title: "Control verification with insufficient data",
      description: "A verification view for one security control. Insufficient data and not applicable are shown as their own states rather than being counted as passes or failures.",
      html: `<ef-state-survivability class="ef-component-tag">
  <section class="ef-state-survivability" aria-labelledby="state-survivability-control-verification-title">
    <h3 id="state-survivability-control-verification-title">Access review control</h3>
    <div class="ef-state-survivability__state">
      <span class="ef-status-lozenge" data-state="ok">Passed</span>
      <p>Quarterly reviews were completed for all production systems.</p>
    </div>
    <div class="ef-state-survivability__state">
      <span class="ef-status-lozenge" data-state="unknown">Insufficient data</span>
      <p>Only 2 of 5 required review records were supplied for the finance systems. No conclusion is drawn.</p>
    </div>
    <div class="ef-state-survivability__state">
      <span class="ef-status-lozenge">Not applicable</span>
      <p>The legacy HR system was retired before this review period.</p>
    </div>
  </section>
</ef-state-survivability>`
    },
    {
      id: "mobile-sync-states",
      title: "Mobile sync states",
      description: "Sync states for a mobile device list at phone width.",
      mobile: {
        height: 420,
        notes: [
          "Below 30rem each row becomes a single column: the lozenge sits above its explanation.",
          "Explanations wrap in the full width; nothing scrolls horizontally at 320px.",
          "Row dividers remain, so each state and its explanation still read as one unit.",
          "There are no touch targets in the rows; if a state needs action, pair the list with [[recovery-actions]] or a button below it."
        ]
      },
      html: `<ef-state-survivability class="ef-component-tag">
  <section class="ef-state-survivability" aria-labelledby="state-survivability-mobile-sync-states-title">
    <h3 id="state-survivability-mobile-sync-states-title">Field tablet sync</h3>
    <div class="ef-state-survivability__state">
      <span class="ef-status-lozenge" data-state="unknown">Unknown</span>
      <p>The last upload from tablet 14 has not been acknowledged by the server.</p>
    </div>
    <div class="ef-state-survivability__state">
      <span class="ef-status-lozenge" data-state="attention">Stale</span>
      <p>Tablet 9 last synced 3 days ago; its inspections are not in today's report.</p>
    </div>
    <div class="ef-state-survivability__state">
      <span class="ef-status-lozenge" data-state="blocked">Unavailable</span>
      <p>Tablet 2 is locked by device management and cannot sync.</p>
    </div>
  </section>
</ef-state-survivability>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-state-survivability", values: "id of the heading", default: "—", description: "Names the region from its heading." },
      { name: "data-state", on: ".ef-status-lozenge", values: "ok | attention | unknown | blocked", default: "absent (neutral)", description: "Glyph for each state's lozenge. The lozenge text must name the exact state." }
    ],
    hooks: {
      "ef-state-survivability": "Root grid stacking the heading and state rows with a consistent gap.",
      "ef-state-survivability__state": "One state row: a two-column grid (lozenge, explanation) with a bottom rule. Single column below 30rem."
    },
    keyboard: [
      { keys: "—", action: "No interactive content by default. Any links inside explanations follow native link behavior." }
    ],
    events: [
      { name: "—", description: "None." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Confirmed / passed", how: "lozenge with data-state=\"ok\"", description: "The authority confirmed this facet." },
    { name: "Stale / partial / pending", how: "lozenge with data-state=\"attention\" and the exact word", description: "Each keeps its own word; they are not merged into \"Warning\"." },
    { name: "Unknown / insufficient", how: "lozenge with data-state=\"unknown\"", description: "No conclusion is available. Unknown is not failure." },
    { name: "Blocked / unavailable", how: "lozenge with data-state=\"blocked\"", description: "The facet cannot be used or completed." },
    { name: "Neutral", how: "lozenge without data-state", description: "States such as Not applicable that imply no attention." }
  ],
  accessibility: {
    forma: [
      "Carries each state in text, glyph shape and row structure, so the meaning survives removal of color, icons, borders or motion.",
      "Keeps states in document order as supplied, with no visual reordering."
    ],
    consumer: [
      "Use the exact state word from the domain model in each lozenge.",
      "Write an explanation that states the consequence and scope for every row.",
      "Do not summarize mixed states into one overall status unless the authority provides that summary."
    ]
  },
  responsive: [
    "Rows are `minmax(8rem, auto) minmax(0, 1fr)` grids; the explanation column wraps.",
    "Below 30rem each row becomes one column with the lozenge above its explanation.",
    "The list grows vertically with the number of states; there is no truncation."
  ],
  motion: [
    "No animation: rows change when the application re-renders them."
  ],
  guidance: {
    do: [
      "Keep distinct states distinct, even when they share a glyph.",
      "Order rows as the domain model orders them, not by severity."
    ],
    avoid: [
      "Collapsing unknown, stale and partial into one \"Attention\" row.",
      "Omitting the explanation because the lozenge seems self-explanatory."
    ]
  },
  related: [
    { slug: "operation-status", note: "One operation's outcome with recovery actions." },
    { slug: "status-lozenge", note: "The label used for each state." },
    { slug: "freshness", note: "Age of evidence for a single value." },
    { slug: "security-state-matrix", note: "Security states across many controls in a grid." }
  ]
};
