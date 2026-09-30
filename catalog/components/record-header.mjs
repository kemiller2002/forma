export default {
  name: "Record header",
  category: "workspaces",
  behavior: "Application content",
  summary: "Persistent record identity, status, context, breadcrumbs, and legal actions with mobile action collapse.",
  purpose: {
    description: "A record header sits at the top of a record page and answers four questions at a glance: where am I (breadcrumbs), what is this (type and identifier), what state is it in (status as text), and what can I do (actions). Secondary actions collapse into a native `details` disclosure so the header stays compact without a script. Forma lays out identity on one side and actions on the other and stacks everything on phones; which actions appear, and whether they are legal for this record and user, is decided by the application.",
    useWhen: [
      "A page shows one record (an invoice, a case, a customer) and users need its identity and status visible before they act.",
      "The record has one or two primary actions and a few secondary ones.",
      "The same header should work on a phone with every action still reachable."
    ],
    avoidWhen: [
      "The heading introduces a page section rather than a record: use [[section-heading]].",
      "The page is a collection of records: use [[collection-toolbar]] above a list or [[data-grid]].",
      "Secondary actions need arrow-key menu navigation or grouping: compose a [[menu]] instead of the built-in disclosure list.",
      "Actions must stay pinned at the bottom of a phone screen: add a [[mobile-action-bar]]."
    ],
    characteristics: [
      "Two columns: identity (`minmax(0, 1fr)`) and actions (`auto`), aligned to the bottom edge.",
      "The type label is small mono uppercase text above the identifier heading; status sits beside the title and wraps under it when space runs out.",
      "Secondary actions live in a native `details`/`summary` with an absolutely positioned panel.",
      "At 40rem and below the header is one column and every action becomes full width."
    ]
  },
  examples: [
    {
      id: "blocked-case",
      title: "Blocked case with restricted actions",
      description: "A case that is blocked on another team. Status is text with a symbol, the context line explains why, and the application renders only the actions that are legal now; there is no More menu because there are no secondary actions.",
      html: `<ef-record-header class="ef-component-tag">
  <header class="ef-record-header">
    <div class="ef-record-header__main">
      <nav aria-label="Case breadcrumb"><a href="#record-header-blocked-case-home">Support</a> <span aria-hidden="true">/</span> <a href="#record-header-blocked-case-cases">Cases</a></nav>
      <div class="ef-record-header__title">
        <div><span class="ef-record-header__type">Case</span><h2>CASE-4407</h2></div>
        <span class="ef-status-lozenge" data-state="blocked">Blocked</span>
      </div>
      <p>Refund not received · Waiting on Payments team since 28 September</p>
    </div>
    <div class="ef-record-header__actions">
      <button type="button">Add note</button>
    </div>
  </header>
</ef-record-header>`
    },
    {
      id: "long-identity",
      title: "Long identifier and several secondary actions",
      description: "Content stress: a long supplier name and a long reference number wrap in the identity column while the action column keeps its natural width. Four secondary actions are collapsed into the More disclosure.",
      html: `<ef-record-header class="ef-component-tag">
  <header class="ef-record-header">
    <div class="ef-record-header__main">
      <nav aria-label="Purchase order breadcrumb"><a href="#record-header-long-identity-home">Procurement</a> <span aria-hidden="true">/</span> <a href="#record-header-long-identity-orders">Purchase orders</a></nav>
      <div class="ef-record-header__title">
        <div><span class="ef-record-header__type">Purchase order</span><h2 style="overflow-wrap: anywhere">PO-2026-EMEA-00041872-REV3</h2></div>
        <span class="ef-status-lozenge" data-state="attention">Awaiting approval</span>
      </div>
      <p>Hanseatische Maschinenbau- und Anlagentechnik GmbH · €48,200.00 · Requested by Lena Vogt</p>
    </div>
    <div class="ef-record-header__actions">
      <button type="button">Approve</button>
      <button type="button">Request changes</button>
      <details>
        <summary>More</summary>
        <div class="ef-record-header__menu">
          <button type="button">Duplicate</button>
          <button type="button">Export PDF</button>
          <button type="button">View history</button>
          <button type="button">Cancel order</button>
        </div>
      </details>
    </div>
  </header>
</ef-record-header>`
    },
    {
      id: "mobile-actions",
      title: "Mobile record with collapsed actions",
      description: "At phone width identity comes first, then the primary action and the More disclosure as full-width rows.",
      mobile: {
        height: 520,
        notes: [
          "At 40rem and below the header is one column: breadcrumbs, type, identifier, status and context first, then actions.",
          "Every direct child of the actions area, including the More `details`, becomes full width, so each button and the summary are at least 2.75rem tall full-width touch targets.",
          "The secondary action panel opens below the summary and is still absolutely positioned; place the header where the panel will not be clipped by an overflow container.",
          "Breadcrumbs wrap at 0.75rem; keep them short or show only the parent on phones."
        ]
      },
      html: `<ef-record-header class="ef-component-tag">
  <header class="ef-record-header">
    <div class="ef-record-header__main">
      <nav aria-label="Visit breadcrumb"><a href="#record-header-mobile-visits">Visits</a></nav>
      <div class="ef-record-header__title">
        <div><span class="ef-record-header__type">Inspection</span><h2>Visit 12</h2></div>
        <span class="ef-status-lozenge" data-state="ok">Complete</span>
      </div>
      <p>Pump station 4 · 2 October</p>
    </div>
    <div class="ef-record-header__actions">
      <button type="button">Share report</button>
      <details>
        <summary>More</summary>
        <div class="ef-record-header__menu"><button type="button">Reopen</button><button type="button">Download photos</button></div>
      </details>
    </div>
  </header>
</ef-record-header>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "breadcrumb nav", values: "string", default: "—", description: "Names the breadcrumb navigation, for example \"Breadcrumb\"; keep it unique on the page." },
      { name: "aria-hidden", on: "breadcrumb separators", values: "true", default: "—", description: "Hides the decorative slash separators from assistive technology." },
      { name: "data-state", on: ".ef-status-lozenge", values: "ok | attention | blocked | unknown", default: "absent", description: "Adds the status symbol to the lozenge; the text remains the status." }
    ],
    hooks: {
      "ef-record-header": "Root two-column grid with a border; identity on the start side, actions on the end.",
      "ef-record-header__main": "Identity column: breadcrumb `nav`, title row and a context paragraph.",
      "ef-record-header__title": "Wrapping flex row holding the type and identifier block and the status.",
      "ef-record-header__type": "Small mono uppercase record type label shown above the identifier.",
      "ef-record-header__actions": "Wrapping row of actions; a `details` inside it becomes the More disclosure.",
      "ef-record-header__menu": "The secondary actions panel inside `details`; absolutely positioned at the inline end with full-width buttons."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through breadcrumb links, actions and the More summary in source order." },
      { keys: "Enter / Space on More", action: "Opens or closes the secondary actions. Native details behavior." },
      { keys: "Tab inside the panel", action: "Moves through the secondary action buttons. There is no arrow-key navigation or Escape handling; the panel is not a menu widget." }
    ],
    events: [
      { name: "toggle", description: "Native event fired by details when the More panel opens or closes." },
      { name: "click", description: "Native click on action buttons; the application performs the action." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Status", how: ".ef-status-lozenge with data-state", description: "Text status with a symbol for ok, attention, blocked or unknown." },
    { name: "Secondary actions open", how: "details[open]", description: "The panel is shown below the More summary at the inline end." },
    { name: "Stacked", how: "@media (max-width: 40rem)", description: "One column; every action is full width." }
  ],
  accessibility: {
    forma: [
      "Keeps identity before actions in source and visual order at every width.",
      "Gives the More summary a 2.75rem minimum height and makes every action full width on phones.",
      "Uses a native details element, so disclosure state is exposed and operated by the browser."
    ],
    consumer: [
      "Use a heading for the identifier at the correct level for the page.",
      "Write status as text; do not rely on the lozenge symbol or color alone.",
      "Render only actions that are legal for this record and user; explain unavailable actions in the context line rather than showing disabled buttons without a reason.",
      "Label the breadcrumb nav and mark the current page link with aria-current if the record itself appears in the trail.",
      "Close the More panel after an action runs; Forma does not."
    ]
  },
  responsive: [
    "Wide: `minmax(0, 1fr) auto`; the identity column wraps long names while actions keep their natural width.",
    "At 40rem and below: one column, and every direct child of `.ef-record-header__actions` is 100% wide.",
    "The title row wraps, so a long status moves under the identifier instead of overflowing.",
    "Long unbroken identifiers need `overflow-wrap: anywhere` or a shorter display form; the header does not truncate."
  ],
  motion: [
    "No animation: the More panel appears and disappears with the native details state, without transition. Buttons keep only the base perceptual hover and press color change."
  ],
  guidance: {
    do: [
      "Keep one primary action visible and move rarely used actions into More.",
      "Show the record type so identifiers from different record kinds are not confused."
    ],
    avoid: [
      "Hiding the only critical action inside More on phones.",
      "Putting destructive actions first in the More list without a confirming [[dialog]]."
    ]
  },
  related: [
    { slug: "section-heading", note: "Heading for a page section rather than a record." },
    { slug: "menu", note: "A popover menu for larger sets of secondary actions." },
    { slug: "mobile-action-bar", note: "A sticky bottom action region for phones." },
    { slug: "master-detail", note: "The record header often heads the detail region." },
    { slug: "status-lozenge", note: "The text status element used beside the identifier." }
  ]
};
