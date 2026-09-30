export default {
  name: "Obligation panel",
  category: "feedback",
  behavior: "Application state",
  summary: "Presents unresolved work, evidence needs and blocking status without making the design system authoritative.",
  owns: ["ef-obligation-panel", "ef-obligation", "ef-obligation-list"],
  purpose: {
    description: "An obligation panel lists work that must be resolved before something can be finalized: reconciliations, missing evidence, stale aggregates. Forma renders a bordered panel with a header (heading, explanation and a count), and a list of obligations. Each obligation has a textual status label, a title with a description, and a link or action to resolve it; `data-ef-severity` adds a matching border treatment. Ordo or the application decides which obligations exist, their severity, and when they are discharged.",
    useWhen: [
      "A record or process has outstanding obligations that block or qualify finalization.",
      "Blocking and non-blocking work must be distinguished in text and structure.",
      "Each obligation has a recovery or evidence action that the application provides."
    ],
    avoidWhen: [
      "The items are prerequisites of one transition with a complete/incomplete state: use [[readiness-checklist]].",
      "The list is a general queue of assigned work: use [[work-queue]].",
      "The items are form input errors: use [[validation-summary]]."
    ],
    characteristics: [
      "Severity is written in each status label (Blocking, Required, Evidence) and repeated by border: accent for blocking, double for warning, secondary accent for information.",
      "The header count is `aria-hidden` because the heading already states the number.",
      "Unknown or unreconciled work can be listed as its own obligation with its own wording."
    ]
  },
  examples: [
    {
      id: "single-blocking",
      title: "One blocking obligation",
      description: "A single obligation that blocks publication. The heading and count agree, and the action is a button because it starts work in place rather than navigating.",
      html: `<ef-obligation-panel class="ef-component-tag">
  <aside class="ef-obligation-panel" aria-labelledby="obligation-panel-single-blocking-title">
    <header class="ef-obligation-panel__header">
      <div>
        <h2 id="obligation-panel-single-blocking-title">1 obligation blocks publication</h2>
        <p>Resolve it before the quarterly report can be published.</p>
      </div>
      <span class="ef-obligation-panel__count" aria-hidden="true">1</span>
    </header>
    <ul class="ef-obligation-list">
      <li class="ef-obligation" data-ef-severity="blocking">
        <span class="ef-obligation__status">Blocking</span>
        <div>
          <strong>Confirm the Q3 revenue restatement</strong>
          <p>Finance restated September revenue after the draft was prepared. The report still shows the earlier figure.</p>
        </div>
        <button type="button">Review restatement</button>
      </li>
    </ul>
  </aside>
</ef-obligation-panel>`
    },
    {
      id: "unknown-and-evidence",
      title: "Unreconciled and evidence obligations",
      description: "An unknown storage outcome listed as its own obligation without a severity attribute, so it keeps the neutral border, next to an evidence request. The status labels say exactly what kind of work each is.",
      html: `<ef-obligation-panel class="ef-component-tag">
  <aside class="ef-obligation-panel" aria-labelledby="obligation-panel-unknown-and-evidence-title">
    <header class="ef-obligation-panel__header">
      <div>
        <h2 id="obligation-panel-unknown-and-evidence-title">2 obligations are open</h2>
        <p>Neither blocks saving. Both must be resolved before final sign-off.</p>
      </div>
      <span class="ef-obligation-panel__count" aria-hidden="true">2</span>
    </header>
    <ul class="ef-obligation-list">
      <li class="ef-obligation">
        <span class="ef-obligation__status">Unknown</span>
        <div>
          <strong>Confirm whether the archive copy was written</strong>
          <p>The storage service did not acknowledge the write. It may or may not exist.</p>
        </div>
        <a href="#obligation-panel-unknown-and-evidence-title">Check archive</a>
      </li>
      <li class="ef-obligation" data-ef-severity="information">
        <span class="ef-obligation__status">Evidence</span>
        <div>
          <strong>Attach the signed vendor attestation</strong>
          <p>An unsigned draft is on file. The policy requires the signed copy.</p>
        </div>
        <a href="#obligation-panel-unknown-and-evidence-title">Upload</a>
      </li>
    </ul>
  </aside>
</ef-obligation-panel>`
    },
    {
      id: "mobile-finalization",
      title: "Mobile finalization",
      description: "Three obligations of different severity at phone width.",
      mobile: {
        height: 620,
        notes: [
          "Below 44rem the header stacks: heading and explanation first, then the count.",
          "Each obligation becomes a single column: status label, then title and description, then the action link.",
          "The status label stays left-aligned at its own width instead of stretching.",
          "Severity borders stay on the inline-start edge at every width; nothing scrolls horizontally at 320px."
        ]
      },
      html: `<ef-obligation-panel class="ef-component-tag">
  <aside class="ef-obligation-panel" aria-labelledby="obligation-panel-mobile-finalization-title">
    <header class="ef-obligation-panel__header">
      <div>
        <h2 id="obligation-panel-mobile-finalization-title">3 obligations before finalizing</h2>
        <p>The assessment cannot be finalized until blocking items are resolved.</p>
      </div>
      <span class="ef-obligation-panel__count" aria-hidden="true">3</span>
    </header>
    <ul class="ef-obligation-list">
      <li class="ef-obligation" data-ef-severity="blocking">
        <span class="ef-obligation__status">Blocking</span>
        <div>
          <strong>Answer the required encryption question</strong>
          <p>Question 12 has no response.</p>
        </div>
        <a href="#obligation-panel-mobile-finalization-title">Go to question</a>
      </li>
      <li class="ef-obligation" data-ef-severity="warning">
        <span class="ef-obligation__status">Required</span>
        <div>
          <strong>Explain the exception for legacy systems</strong>
          <p>An exception was recorded without a justification.</p>
        </div>
        <a href="#obligation-panel-mobile-finalization-title">Add justification</a>
      </li>
      <li class="ef-obligation" data-ef-severity="information">
        <span class="ef-obligation__status">Evidence</span>
        <div>
          <strong>Attach the latest penetration test summary</strong>
          <p>The attached summary is from last year.</p>
        </div>
        <a href="#obligation-panel-mobile-finalization-title">Upload</a>
      </li>
    </ul>
  </aside>
</ef-obligation-panel>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "aside.ef-obligation-panel", values: "id of the panel heading", default: "—", description: "Names the complementary region." },
      { name: "aria-hidden", on: ".ef-obligation-panel__count", values: "true", default: "—", description: "Hides the visual count, which duplicates the number in the heading." },
      { name: "data-ef-severity", on: "li.ef-obligation", values: "blocking | warning | information", default: "absent (neutral border)", description: "Border treatment matching the written status label. Presentation only; Ordo owns severity." }
    ],
    hooks: {
      "ef-obligation-panel": "Root panel with a functional border and primary surface.",
      "ef-obligation-panel__header": "Flex header: heading and explanation at the start, count at the end. Stacks below 44rem.",
      "ef-obligation-panel__count": "Inverse-surface square showing the number of obligations. Decorative duplicate of the heading.",
      "ef-obligation-list": "Unstyled list of obligations.",
      "ef-obligation": "One obligation: grid of status label, content and action, with a 4px inline-start border. Single column below 44rem.",
      "ef-obligation__status": "Bordered uppercase monospace label naming the obligation's severity or type.",
      "data-ef-severity": "blocking uses the primary accent border; warning a double border; information the secondary accent. Absent keeps the neutral functional border."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through each obligation's link or button. The panel itself is not focusable." },
      { keys: "Enter", action: "Follows a link or activates a button (Space also activates buttons)." }
    ],
    events: [
      { name: "click", description: "Native click on obligation actions. The application handles navigation or the resolving action." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Blocking", how: "data-ef-severity=\"blocking\" and a Blocking label", description: "Primary accent border; must be resolved before finalization." },
    { name: "Warning / required", how: "data-ef-severity=\"warning\"", description: "Double border; required but not blocking the current step." },
    { name: "Information / evidence", how: "data-ef-severity=\"information\"", description: "Secondary accent border; evidence or informational work." },
    { name: "Unclassified / unknown", how: "no data-ef-severity", description: "Neutral border. Use for unreconciled work whose severity the authority has not assigned." }
  ],
  accessibility: {
    forma: [
      "Requires severity in text (the status label) and repeats it with border style, so it is not communicated by color alone.",
      "In forced colors every obligation border becomes `CanvasText` and the panel border is preserved; the labels still distinguish severity.",
      "Uses a labelled complementary region and a native list."
    ],
    consumer: [
      "Keep the heading's number, the count and the list in sync.",
      "Write status labels that name the kind of obligation, and match `data-ef-severity` to them.",
      "Remove an obligation only when the authority reports it discharged.",
      "If the panel is inside `main`, consider a `section` instead of `aside` so it is not presented as tangential content."
    ]
  },
  responsive: [
    "Obligations are `auto minmax(0, 1fr) auto` grids on wide screens; below 44rem they become one column.",
    "The header is a flex row on wide screens and a column below 44rem.",
    "Titles and descriptions wrap; the status label has a 5.5rem minimum width."
  ],
  motion: [
    "No animation: obligations appear and disappear with the application's re-render."
  ],
  guidance: {
    do: [
      "Order obligations by the authority's priority, typically blocking first.",
      "Give each obligation one clear action that leads to its resolution."
    ],
    avoid: [
      "Deriving severity from position or color in the UI.",
      "Hiding unknown or unreconciled work because it has no severity yet."
    ]
  },
  related: [
    { slug: "readiness-checklist", note: "Prerequisites of one transition with complete/incomplete state." },
    { slug: "work-queue", note: "General assigned work with age and due information." },
    { slug: "operation-status", note: "The outcome of a single operation." },
    { slug: "validation-summary", note: "Input errors on a form rather than domain obligations." }
  ]
};
