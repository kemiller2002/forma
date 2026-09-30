export default {
  name: "Overview disclosure",
  category: "overlays",
  behavior: "Application content",
  summary: "Keeps consequential state, scope, uncertainty, and unresolved work visible while secondary evidence uses native disclosure.",
  purpose: {
    description: "Overview disclosure splits a result into two parts: an always-visible overview that states what the user must know to act (the state, its scope, how certain it is, what is still unresolved, and whether more verification is needed), and one or more [[disclosure]] sections below it for supporting evidence. It is a labelled `section` (`ef-overview-disclosure`) whose first child is `ef-overview-disclosure__overview`, marked with a thick inline-start rule, followed by native `details class=\"ef-disclosure\"` elements. Forma provides the structure and spacing. Deciding what is consequential, and writing the state text, is the application's job; the pattern never infers state, freshness or legality.",
    useWhen: [
      "A verification, reconciliation or review result has supporting evidence that most users do not need to read every time.",
      "Hiding the wrong detail could lead someone to act on stale, partial or unknown information.",
      "A screen follows the Visual Engineering rule that disclosure may hide secondary detail but never consequential state."
    ],
    avoidWhen: [
      "The hidden content is ordinary optional detail with no consequential summary: use [[disclosure]] alone.",
      "The whole task is recognize, verify, then act with a decision: use [[verification-frame]].",
      "You need to list distinct authoritative states side by side: use [[state-survivability]].",
      "The content is a fault shown to the user: use the [[fault-inline]] or [[fault-details]] family."
    ],
    characteristics: [
      "The overview is never collapsible; only the evidence below it is.",
      "The overview is marked by a 0.25rem rule in the current text color, not by a status color.",
      "The section is named by the overview heading through aria-labelledby.",
      "Evidence sections are standard [[disclosure]] elements with their own motion and states."
    ]
  },
  examples: [
    {
      id: "reconciliation-unknown",
      title: "Reconciliation with an unknown source",
      description: "One source has not answered, so the result is explicitly Unknown, not Failed. The overview states the state as text with a [[status-lozenge]], the scope (3 of 4 sources), and what remains. Two evidence sections hold the per-source detail and the raw timestamps.",
      html: `<ef-overview-disclosure class="ef-component-tag">
  <section class="ef-overview-disclosure" aria-labelledby="overview-disclosure-reconciliation-unknown-title">
    <div class="ef-overview-disclosure__overview">
      <h3 id="overview-disclosure-reconciliation-unknown-title">Ledger reconciliation incomplete</h3>
      <p><span class="ef-status-lozenge" data-state="unknown">Unknown</span> 3 of 4 sources reconciled. Source D (card processor) has not responded since 09:40.</p>
      <p><strong>Unresolved:</strong> 1 source. Do not close the period until it reconciles or is excluded by an approver.</p>
    </div>
    <details class="ef-disclosure" data-ef-motion-weight="light">
      <summary>Per-source results</summary>
      <div class="ef-disclosure__content">
        <ul>
          <li>Source A (bank): matched, 1,204 entries</li>
          <li>Source B (payroll): matched, 86 entries</li>
          <li>Source C (expenses): matched, 342 entries</li>
          <li>Source D (card processor): no response</li>
        </ul>
      </div>
    </details>
    <details class="ef-disclosure" data-ef-motion-weight="light">
      <summary>Request timestamps</summary>
      <div class="ef-disclosure__content">
        <p>Last request to Source D at 09:40 UTC; two retries at 09:45 and 09:55 without a response.</p>
      </div>
    </details>
  </section>
</ef-overview-disclosure>`
    },
    {
      id: "verified-nothing-outstanding",
      title: "Verified with nothing outstanding",
      description: "A complete result still keeps its scope and freshness in the overview, including the explicit statement that nothing is unresolved, so the absence of work is stated rather than implied by missing content.",
      html: `<ef-overview-disclosure class="ef-component-tag">
  <section class="ef-overview-disclosure" aria-labelledby="overview-disclosure-verified-nothing-outstanding-title">
    <div class="ef-overview-disclosure__overview">
      <h3 id="overview-disclosure-verified-nothing-outstanding-title">Access review complete</h3>
      <p><span class="ef-status-lozenge" data-state="ok">Confirmed</span> All 58 accounts in the Finance group reviewed. Verified <time datetime="2026-09-30T08:15Z">today at 08:15 UTC</time>.</p>
      <p><strong>Unresolved:</strong> none.</p>
    </div>
    <details class="ef-disclosure" data-ef-motion-weight="light">
      <summary>Reviewer decisions</summary>
      <div class="ef-disclosure__content">
        <p>54 accounts kept, 4 removed. Decisions recorded by R. Osei and M. Laine.</p>
      </div>
    </details>
  </section>
</ef-overview-disclosure>`
    },
    {
      id: "mobile-stale-evidence",
      title: "Stale evidence on a phone",
      description: "A stale certificate check at phone width. The overview wraps but stays first and visible; the evidence is one tap away.",
      mobile: {
        height: 400,
        notes: [
          "The section is a single-column grid at every width, so the overview is always first in reading order and on screen.",
          "Overview text wraps inside the 0.75rem padding beside the inline-start rule; no content is truncated or hidden at 320px.",
          "Each evidence summary is a 44px-minimum tap target and its content opens in flow below it.",
          "There are no breakpoints: recomposition never moves consequential state into a collapsed section."
        ]
      },
      html: `<ef-overview-disclosure class="ef-component-tag">
  <section class="ef-overview-disclosure" aria-labelledby="overview-disclosure-mobile-stale-evidence-title">
    <div class="ef-overview-disclosure__overview">
      <h3 id="overview-disclosure-mobile-stale-evidence-title">Certificate check is stale</h3>
      <p><span class="ef-status-lozenge" data-state="attention">Needs attention</span> Last checked 26 hours ago; checks are expected every 6 hours. Current expiry status is not known.</p>
    </div>
    <details class="ef-disclosure" data-ef-motion-weight="light">
      <summary>Last known result</summary>
      <div class="ef-disclosure__content">
        <p>api.example.net: valid until 14 January 2027, issued by the internal CA.</p>
      </div>
    </details>
  </section>
</ef-overview-disclosure>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-overview-disclosure", values: "id of the overview heading", default: "—", description: "Names the section from its overview heading so it is exposed as a named region." },
      { name: "data-ef-motion-weight", on: "details.ef-disclosure", values: "light | standard | heavy", default: "light", description: "Motion weight of each evidence disclosure; see [[disclosure]]." },
      { name: "datetime", on: "time", values: "ISO 8601", default: "—", description: "Machine-readable freshness when the overview states when something was verified." }
    ],
    hooks: {
      "ef-overview-disclosure": "Section grid that stacks the overview above the evidence disclosures with a 0.75rem gap.",
      "ef-overview-disclosure__overview": "Always-visible overview: padded grid with a 0.25rem inline-start rule in the current text color; first and last children lose their block margins."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves to each evidence summary (and any links in the overview)." },
      { keys: "Enter / Space on a summary", action: "Opens or closes that evidence section (native details)." }
    ],
    events: [
      { name: "toggle", description: "Native event on each evidence disclosure when it opens or closes." }
    ],
    form: "No form participation."
  },
  states: [
    { name: "Overview visible", how: "always", description: "State, scope, uncertainty and unresolved work are shown as text; there is no collapsed state for the overview." },
    { name: "Evidence closed / open", how: "details open attribute", description: "Each evidence section follows [[disclosure]] states: + indicator closed, × open." },
    { name: "Application state", how: "text plus optional status-lozenge data-state", description: "Unknown, stale, partial, reconciling or confirmed are written by the application; the pattern itself has no state hooks." }
  ],
  accessibility: {
    forma: [
      "Keeps the overview outside any disclosure, so it is always in the accessibility tree and on screen.",
      "Marks the overview with a rule that follows the text color, including in forced-colors mode, rather than a semantic color.",
      "Uses native details for evidence, with announced expanded state and 44px summaries."
    ],
    consumer: [
      "Write the state in words (Unknown, Stale, Reconciling), not only as a lozenge color.",
      "State scope and unresolved work explicitly, including \"none\" when nothing is outstanding.",
      "Choose a heading level that fits the page outline.",
      "Keep the overview accurate to authoritative application state; never strengthen unknown into failure or success."
    ]
  },
  responsive: [
    "Single-column grid at every width; the overview is first in source and visual order.",
    "Text wraps inside the overview; evidence opens in flow below.",
    "No breakpoints and no horizontal overflow at 320px."
  ],
  motion: [
    "The overview does not animate. Evidence sections use [[disclosure]] motion: the + / × indicator turns with light spring timing, content fades and settles on open, and block size settles where `interpolate-size` is supported.",
    "Under `prefers-reduced-motion: reduce` the disclosure height transition is removed and the rest is effectively instant."
  ],
  guidance: {
    do: [
      "Answer \"can I act on this?\" in the overview's first sentence.",
      "Keep evidence sections named by what they contain."
    ],
    avoid: [
      "Moving unresolved items or uncertainty into a collapsed section to shorten the page.",
      "Using the rule color or lozenge color as the only indicator of state.",
      "Collapsing the whole component into a single disclosure on phones."
    ]
  },
  related: [
    { slug: "disclosure", note: "The native disclosure used for each evidence section." },
    { slug: "verification-frame", note: "Full recognize, verify, act composition for consequential decisions." },
    { slug: "state-survivability", note: "Explicit textual projection of several authoritative states." },
    { slug: "status-lozenge", note: "Textual state badge used inside the overview." },
    { slug: "freshness", note: "Presents evidence age and staleness explicitly." }
  ]
};
