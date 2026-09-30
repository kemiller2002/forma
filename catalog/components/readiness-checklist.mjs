export default {
  name: "Readiness checklist",
  category: "feedback",
  behavior: "Ordo / application",
  summary: "Explicit complete, incomplete and blocking prerequisites shown before a consequential transition.",
  purpose: {
    description: "A readiness checklist shows the prerequisites for a consequential step, such as closing a period, publishing a release or submitting an application, and the state of each. Forma renders a bordered section with a header (a [[status-lozenge]] summary and a heading) and a list of items, each with a glyph, a label and an optional trailing action or state word. The application or Ordo decides what the prerequisites are, whether each is met, and whether the transition is allowed; Forma does not calculate readiness.",
    useWhen: [
      "A transition has several prerequisites and the user needs to see which remain.",
      "Some prerequisites block the transition and others are advisory, and the difference must be clear.",
      "Each incomplete item has a place the user can go to resolve it."
    ],
    avoidWhen: [
      "The user is moving through ordered steps of one task: use [[wizard]] or [[steps]].",
      "The items are open obligations with evidence requirements: use [[obligation-panel]].",
      "The rows describe states, not prerequisites: use [[state-survivability]]."
    ],
    characteristics: [
      "Each item's state is shown by its glyph text (✓, ○, !) and, for blocking items, a written state word and a thick inline-start border.",
      "Complete items make their glyph bold; incomplete items usually carry an action.",
      "The header lozenge summarizes progress in words, such as \"5 of 7 complete\"."
    ]
  },
  examples: [
    {
      id: "ready-to-publish",
      title: "All prerequisites met",
      description: "Every item is complete. The header lozenge switches to the ok glyph and the transition button is available below the list, supplied by the application.",
      html: `<ef-readiness-checklist class="ef-component-tag">
  <section class="ef-readiness-checklist" aria-labelledby="readiness-checklist-ready-to-publish-title">
    <header>
      <span class="ef-status-lozenge" data-state="ok">3 of 3 complete</span>
      <h3 id="readiness-checklist-ready-to-publish-title">Ready to publish release 4.2</h3>
    </header>
    <ul class="ef-readiness-checklist__items">
      <li data-state="complete"><span aria-hidden="true">✓</span><span>Release notes approved</span><span class="ef-visually-hidden">Complete</span></li>
      <li data-state="complete"><span aria-hidden="true">✓</span><span>Migration tested on staging</span><span class="ef-visually-hidden">Complete</span></li>
      <li data-state="complete"><span aria-hidden="true">✓</span><span>Rollback plan recorded</span><span class="ef-visually-hidden">Complete</span></li>
    </ul>
  </section>
  <button type="button">Publish release</button>
</ef-readiness-checklist>`
    },
    {
      id: "blocked-submission",
      title: "Several blocking items",
      description: "A grant application with two blocking prerequisites and one incomplete item. Blocking items say \"Blocking\" in text and link to where they are resolved; the header counts what is complete.",
      html: `<ef-readiness-checklist class="ef-component-tag">
  <section class="ef-readiness-checklist" aria-labelledby="readiness-checklist-blocked-submission-title">
    <header>
      <span class="ef-status-lozenge" data-state="blocked">1 of 4 complete, 2 blocking</span>
      <h3 id="readiness-checklist-blocked-submission-title">Before you submit the grant application</h3>
    </header>
    <ul class="ef-readiness-checklist__items">
      <li data-state="complete"><span aria-hidden="true">✓</span><span>Budget totals match the narrative</span><span class="ef-visually-hidden">Complete</span></li>
      <li data-state="blocked"><span aria-hidden="true">!</span><span>Signed letter of support from the partner institution</span><span>Blocking</span></li>
      <li data-state="blocked"><span aria-hidden="true">!</span><span>Principal investigator's conflict-of-interest form</span><span>Blocking</span></li>
      <li data-state="incomplete"><span aria-hidden="true">○</span><span>Optional data-sharing plan</span><a href="#readiness-checklist-blocked-submission-title">Add</a></li>
    </ul>
  </section>
</ef-readiness-checklist>`
    },
    {
      id: "mobile-month-close",
      title: "Mobile month-end close",
      description: "The canonical close checklist at phone width with an action on an incomplete item.",
      mobile: {
        height: 420,
        notes: [
          "Items keep their three columns (glyph, label, action) at every width; the label column shrinks and wraps.",
          "Each row is at least 3rem tall, so the trailing button or state word has room to be tapped.",
          "Long labels wrap under themselves rather than pushing the action off-screen; nothing scrolls horizontally at 320px.",
          "The header lozenge and heading stack naturally; in landscape the heading has more room and wraps less."
        ]
      },
      html: `<ef-readiness-checklist class="ef-component-tag">
  <section class="ef-readiness-checklist" aria-labelledby="readiness-checklist-mobile-month-close-title">
    <header>
      <span class="ef-status-lozenge" data-state="attention">2 of 4 complete</span>
      <h3 id="readiness-checklist-mobile-month-close-title">Close September books</h3>
    </header>
    <ul class="ef-readiness-checklist__items">
      <li data-state="complete"><span aria-hidden="true">✓</span><span>All invoices posted</span><span class="ef-visually-hidden">Complete</span></li>
      <li data-state="complete"><span aria-hidden="true">✓</span><span>Payments allocated</span><span class="ef-visually-hidden">Complete</span></li>
      <li data-state="incomplete"><span aria-hidden="true">○</span><span>Reconcile the operating account at First National</span><button type="button">Review</button></li>
      <li data-state="blocked"><span aria-hidden="true">!</span><span>External accountant adjustment review</span><span>Blocking</span></li>
    </ul>
  </section>
</ef-readiness-checklist>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-readiness-checklist", values: "id of the header heading", default: "—", description: "Names the checklist from its heading." },
      { name: "data-state", on: "li", values: "complete | incomplete | blocked", default: "—", description: "Item state supplied by the application. `complete` bolds the glyph; `blocked` adds a thick inline-start border. `incomplete` has no special styling." },
      { name: "aria-hidden", on: "glyph span", values: "true", default: "—", description: "Hides the ✓ / ○ / ! glyph; state must also be available as text." }
    ],
    hooks: {
      "ef-readiness-checklist": "Root section with a functional border. Its direct `header` child is padded and separated by a rule.",
      "ef-readiness-checklist__items": "Unstyled list. Each `li` is a grid of a 2rem glyph column, a flexible label column and an auto column for an action or state word.",
      "data-state": "On each `li`: complete makes the first child (glyph) bold; blocked adds a 0.35rem accent inline-start border."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through item actions (buttons or links). Items themselves are not focusable." },
      { keys: "Enter / Space", action: "Activates the focused action (native behavior; Space applies to buttons only)." }
    ],
    events: [
      { name: "click", description: "Native click on item actions. The application navigates or performs the work." }
    ],
    form: "Not a form control; the checklist does not submit anything. The transition itself is a separate application button."
  },
  states: [
    { name: "Complete", how: "li data-state=\"complete\"", description: "✓ glyph in bold. Provide a text equivalent such as visually hidden \"Complete\"." },
    { name: "Incomplete", how: "li data-state=\"incomplete\"", description: "○ glyph and usually an action to resolve it." },
    { name: "Blocking", how: "li data-state=\"blocked\"", description: "! glyph, a visible \"Blocking\" word and a thick inline-start border." }
  ],
  accessibility: {
    forma: [
      "Distinguishes blocking items by a structural border and a text column, not color.",
      "Lays items out as a native list, so assistive technology announces the item count."
    ],
    consumer: [
      "Give every item a text state: a visible word (\"Blocking\") or visually hidden text (\"Complete\"), because the glyph is hidden.",
      "Keep the header lozenge count in sync with the items.",
      "Disable or hide the transition while blocking items remain only if the authority says so, and explain why."
    ]
  },
  responsive: [
    "Each item is a `2rem minmax(0, 1fr) auto` grid at every width; the label column wraps.",
    "Items have a 3rem minimum height.",
    "No breakpoints; the header wraps naturally."
  ],
  motion: [
    "No animation: item states change when the application re-renders the list."
  ],
  guidance: {
    do: [
      "List blocking prerequisites first when the domain has no inherent order.",
      "Link incomplete items to where they can be resolved."
    ],
    avoid: [
      "Calculating readiness in the UI from the visible items.",
      "Marking advisory items as blocking to encourage completion."
    ]
  },
  related: [
    { slug: "obligation-panel", note: "Unresolved obligations with evidence and severity rather than prerequisites." },
    { slug: "wizard", note: "Ordered steps the user moves through." },
    { slug: "state-survivability", note: "Distinct states shown for information, not as prerequisites." }
  ]
};
