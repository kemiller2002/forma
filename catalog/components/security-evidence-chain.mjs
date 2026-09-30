export default {
  name: "Security evidence chain",
  category: "security",
  behavior: "Aegis / application",
  summary: "Shows the provenance chain supporting a security conclusion.",
  purpose: {
    description: "A security evidence chain shows the path from an evidence source through an observation to the invariant it supports and the resulting state, for example Aegis → SEC-EVD-042 → SEC-INV-014 → Violated. Each step is labelled with its role and, where it is a record, links to it by stable ID. The chain lets a reviewer check that a conclusion rests on a real observation rather than proximity or assumption. Tutela supplies the relationships; Forma lays them out in order and never infers a link that was not supplied.",
    useWhen: [
      "A security conclusion must be traceable to its source and observation.",
      "Reviewers need to open each record in the chain by stable ID.",
      "A missing observation must be visible as a gap in the chain."
    ],
    avoidWhen: [
      "The provenance is for analytics or report values rather than security conclusions: use [[provenance-trail]].",
      "You need to show whether evidence is current or stale: use [[security-evidence-age]].",
      "You need to state a general claim and its supporting evidence type (supports, contradicts): use [[evidence-relationship]]."
    ],
    characteristics: [
      "A captioned `figure` wrapping an ordered list, so step order is part of the markup.",
      "Each step shows a bold role label (Source, Observation, Invariant, State) above its value.",
      "Steps flow in an auto-fit grid on wide screens and stack in one column below 30rem.",
      "There are no drawn connectors: order comes from the list, and each step names its role in text."
    ]
  },
  examples: [
    {
      id: "verified",
      title: "Chain ending in a verified state",
      description: "A complete chain for an authorization invariant, from a CI source through a linked observation to a Verified state.",
      html: `<ef-security-evidence-chain class="ef-component-tag">
  <figure class="ef-security-evidence-chain" aria-labelledby="security-evidence-chain-verified-caption">
    <figcaption id="security-evidence-chain-verified-caption">Evidence chain for SEC-INV-003</figcaption>
    <ol>
      <li><strong>Source</strong><span>CI policy tests, run 1042</span></li>
      <li><strong>Observation</strong><a href="#SEC-EVD-044">SEC-EVD-044</a></li>
      <li><strong>Invariant</strong><a href="#SEC-INV-003">SEC-INV-003</a></li>
      <li><strong>State</strong><span>Verified</span></li>
    </ol>
  </figure>
</ef-security-evidence-chain>`
    },
    {
      id: "missing-observation",
      title: "Chain with a missing observation",
      description: "No observation exists for the invariant, so the Observation step says so in text and the state is Unknown. The gap is shown rather than skipped, which would make the chain look complete.",
      html: `<ef-security-evidence-chain class="ef-component-tag">
  <figure class="ef-security-evidence-chain" aria-labelledby="security-evidence-chain-missing-observation-caption">
    <figcaption id="security-evidence-chain-missing-observation-caption">Evidence chain for SEC-INV-021</figcaption>
    <ol>
      <li><strong>Source</strong><span>Runtime egress monitor</span></li>
      <li><strong>Observation</strong><span>None recorded for this artifact</span></li>
      <li><strong>Invariant</strong><a href="#SEC-INV-021">SEC-INV-021</a></li>
      <li><strong>State</strong><span>Unknown</span></li>
    </ol>
  </figure>
</ef-security-evidence-chain>`
    },
    {
      id: "mobile",
      title: "Evidence chain on a phone",
      description: "A chain with long source text at phone width.",
      mobile: {
        height: 460,
        notes: [
          "Below 30rem the steps stack in a single column, preserving the Source → Observation → Invariant → State order top to bottom.",
          "Each step is bordered and padded, and its content breaks anywhere, so long source names never overflow.",
          "Record links are block-level inside each step, which makes each one a full-width tap target.",
          "Forma does not reset the browser's default figure margins, so at 320px the chain is inset by roughly 40px on each side and steps are correspondingly narrower."
        ]
      },
      html: `<ef-security-evidence-chain class="ef-component-tag">
  <figure class="ef-security-evidence-chain" aria-labelledby="security-evidence-chain-mobile-caption">
    <figcaption id="security-evidence-chain-mobile-caption">Evidence chain for SEC-INV-014</figcaption>
    <ol>
      <li><strong>Source</strong><span>Aegis authorization audit, production mirror environment</span></li>
      <li><strong>Observation</strong><a href="#SEC-EVD-042">SEC-EVD-042</a></li>
      <li><strong>Invariant</strong><a href="#SEC-INV-014">SEC-INV-014</a></li>
      <li><strong>State</strong><span>Violated</span></li>
    </ol>
  </figure>
</ef-security-evidence-chain>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "figure", values: "id of figcaption", default: "—", description: "Names the figure by its caption, which should identify the conclusion the chain supports." },
      { name: "href", on: "a", values: "stable record URL or #ID", default: "—", description: "Deep link to the observation or invariant record." }
    ],
    hooks: {
      "ef-security-evidence-chain": "Root figure: bordered, padded primary surface. Its ordered list is an unstyled auto-fit grid of steps at least 9rem wide (one column below 30rem); each step is bordered and padded, with its strong, span and link children displayed as blocks."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between record links in chain order." },
      { keys: "Enter", action: "Follows the focused link." }
    ],
    events: [
      { name: "—", description: "No events." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Complete", how: "every step has a value or link", description: "Source, observation, invariant and state are all present." },
    { name: "Gap", how: "a step's text states that nothing exists", description: "The missing link is written out, and the state is usually Unknown." },
    { name: "Resulting state", how: "text in the State step", description: "Verified, Violated, Unknown, Stale or N/A as supplied by Tutela." }
  ],
  accessibility: {
    forma: [
      "Uses an ordered list inside a captioned figure, so order and count are available to assistive technology.",
      "Labels every step's role in visible text rather than relying on arrows or color.",
      "Stacks steps at 320px without horizontal scrolling."
    ],
    consumer: [
      "Caption the chain with the conclusion it supports.",
      "Write gaps explicitly; do not leave a step empty or remove it.",
      "Some browser and screen-reader pairings (notably Safari with VoiceOver) drop list semantics when list-style is none; if step count matters to your users, add role=\"list\" to the ol.",
      "Redact sensitive source details before rendering."
    ]
  },
  responsive: [
    "Steps use `repeat(auto-fit, minmax(9rem, 1fr))`, so four steps sit in a row on wide screens and wrap to fewer columns as space shrinks.",
    "Below a 30rem viewport the steps are a single column.",
    "Content wraps anywhere inside each step.",
    "The root is a native figure and keeps the browser's default figure margins, which reduce available width on phones."
  ],
  motion: [
    "No animation: the chain is static and nothing animates between steps."
  ],
  guidance: {
    do: [
      "Keep the step order Source → Observation → Invariant → State.",
      "Link every record step to its stable ID."
    ],
    avoid: [
      "Adding decorative arrows as the only indication of direction.",
      "Hiding a missing observation by skipping the step."
    ]
  },
  related: [
    { slug: "provenance-trail", note: "Traces analytics output through source, aggregate, analysis and presentation stages." },
    { slug: "evidence-relationship", note: "States how one piece of evidence relates to a claim (supports, contradicts) and its scope." },
    { slug: "security-invariant-result", note: "The invariant record at the end of the chain." }
  ]
};
