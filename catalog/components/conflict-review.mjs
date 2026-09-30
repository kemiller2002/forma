export default {
  name: "Conflict review",
  category: "feedback",
  behavior: "Ordo / application",
  summary: "Explains an optimistic-concurrency conflict, shows what changed, and offers only application-supplied recovery actions.",
  purpose: {
    description: "A conflict review appears when the user tried to change a record that someone else changed first. Forma composes a bordered article with a header (a Conflict [[status-lozenge]], a heading and an explanation), an embedded [[diff-viewer]] comparing what the user reviewed with what is current, and a footer of recovery actions. The application or Ordo detects the conflict, supplies both versions, and decides which recovery actions are legal; Forma never merges or chooses a winner.",
    useWhen: [
      "A save or transition was rejected because the record's version changed since the user loaded it.",
      "The user must see what changed before choosing how to proceed.",
      "Recovery options differ by situation (reload, reapply my change, cancel) and the application supplies them."
    ],
    avoidWhen: [
      "The outcome is unknown rather than conflicting: use [[operation-status]].",
      "A general comparison of two versions with no pending decision: use [[diff-viewer]] alone.",
      "A brief notice that data changed, with no blocked action: use [[alert]]."
    ],
    characteristics: [
      "The header always states that nothing was applied, so users do not assume their change went through.",
      "Changed fields in the diff are marked with a thick inline-start border as well as their position.",
      "Actions sit at the end of the footer and wrap on narrow screens."
    ]
  },
  examples: [
    {
      id: "multiple-fields",
      title: "Several fields changed",
      description: "A vendor record where two of three fields changed. Each side is a [[diff-viewer]] column with `ef-diff-row` entries, and `data-change=\"changed\"` marks the rows that differ. The application offers three legal recoveries.",
      html: `<ef-conflict-review class="ef-component-tag">
  <article class="ef-conflict-review" aria-labelledby="conflict-review-multiple-fields-title">
    <header class="ef-conflict-review__header">
      <span class="ef-status-lozenge" data-state="attention">Conflict</span>
      <h3 id="conflict-review-multiple-fields-title">Vendor Northwind Traders was changed by Priya Shah</h3>
      <p>Your edit to the payment terms was not saved. Compare the versions, then choose how to continue.</p>
    </header>
    <div class="ef-diff-viewer">
      <div class="ef-diff-viewer__grid">
        <section class="ef-diff-viewer__side" aria-label="Version you edited">
          <h4>You edited (version 7)</h4>
          <dl>
            <div class="ef-diff-row" data-change="changed"><dt>Payment terms</dt><dd>Net 30</dd></div>
            <div class="ef-diff-row" data-change="changed"><dt>Remit-to address</dt><dd>12 Harbor Rd</dd></div>
            <div class="ef-diff-row"><dt>Currency</dt><dd>USD</dd></div>
          </dl>
        </section>
        <section class="ef-diff-viewer__side" aria-label="Current version">
          <h4>Current (version 8)</h4>
          <dl>
            <div class="ef-diff-row" data-change="changed"><dt>Payment terms</dt><dd>Net 45</dd></div>
            <div class="ef-diff-row" data-change="changed"><dt>Remit-to address</dt><dd>PO Box 88</dd></div>
            <div class="ef-diff-row"><dt>Currency</dt><dd>USD</dd></div>
          </dl>
        </section>
      </div>
    </div>
    <footer class="ef-conflict-review__actions">
      <button type="button">Reapply my change to version 8</button>
      <button type="button">Keep current version</button>
      <button type="button">Cancel</button>
    </footer>
  </article>
</ef-conflict-review>`
    },
    {
      id: "record-deleted",
      title: "Record deleted by someone else",
      description: "There is no current version to compare, so the diff is omitted. The header explains what happened and the only actions are ones that cannot overwrite anything.",
      html: `<ef-conflict-review class="ef-component-tag">
  <article class="ef-conflict-review" aria-labelledby="conflict-review-record-deleted-title">
    <header class="ef-conflict-review__header">
      <span class="ef-status-lozenge" data-state="blocked">Conflict: deleted</span>
      <h3 id="conflict-review-record-deleted-title">This expense claim was deleted while you were editing it</h3>
      <p>Your changes were not saved. You can copy them into a new claim.</p>
    </header>
    <footer class="ef-conflict-review__actions">
      <button type="button">Start a new claim with my changes</button>
      <button type="button">Discard my changes</button>
    </footer>
  </article>
</ef-conflict-review>`
    },
    {
      id: "mobile-balance-conflict",
      title: "Mobile balance conflict",
      description: "A single-field conflict at phone width.",
      mobile: {
        height: 540,
        notes: [
          "Below 40rem the diff viewer's two sides stack: the version you reviewed above the current version.",
          "Below 30rem each diff row stacks its label above its value, so long values wrap without truncation.",
          "Footer actions wrap onto separate lines and stay aligned to the end; each keeps a 44px-tall touch target.",
          "The header text wraps; nothing scrolls horizontally at 320px in either orientation."
        ]
      },
      html: `<ef-conflict-review class="ef-component-tag">
  <article class="ef-conflict-review" aria-labelledby="conflict-review-mobile-balance-conflict-title">
    <header class="ef-conflict-review__header">
      <span class="ef-status-lozenge" data-state="attention">Conflict</span>
      <h3 id="conflict-review-mobile-balance-conflict-title">The balance changed while you were reviewing it</h3>
      <p>No write-off was applied.</p>
    </header>
    <div class="ef-diff-viewer">
      <div class="ef-diff-viewer__grid">
        <section class="ef-diff-viewer__side" aria-label="Version you reviewed">
          <h4>You reviewed</h4>
          <dl><div class="ef-diff-row" data-change="changed"><dt>Outstanding balance</dt><dd>5,000.00</dd></div></dl>
        </section>
        <section class="ef-diff-viewer__side" aria-label="Current version">
          <h4>Current</h4>
          <dl><div class="ef-diff-row" data-change="changed"><dt>Outstanding balance</dt><dd>2,500.00</dd></div></dl>
        </section>
      </div>
    </div>
    <footer class="ef-conflict-review__actions">
      <button type="button">Reload current</button>
      <button type="button">Cancel</button>
    </footer>
  </article>
</ef-conflict-review>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "article.ef-conflict-review", values: "id of the header heading", default: "—", description: "Names the article from its heading." },
      { name: "aria-label", on: ".ef-diff-viewer__side", values: "string", default: "—", description: "Names each side of the comparison (the version reviewed and the current version)." },
      { name: "data-state", on: ".ef-status-lozenge", values: "attention | blocked", default: "—", description: "Glyph for the conflict lozenge." },
      { name: "data-change", on: ".ef-diff-row", values: "changed", default: "absent", description: "Marks a row whose value differs between versions. See [[diff-viewer]]." }
    ],
    hooks: {
      "ef-conflict-review": "Root article with a functional border. An embedded diff viewer loses its own inline borders so the two frames do not double up.",
      "ef-conflict-review__header": "Padded header with a bottom rule, holding the lozenge, heading and explanation.",
      "ef-conflict-review__actions": "Footer row of application-supplied actions: wrapping, end-aligned, with a top rule."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the recovery actions. The comparison itself is static content." },
      { keys: "Enter / Space", action: "Activates the focused action (native button behavior)." }
    ],
    events: [
      { name: "click", description: "Native click on recovery buttons. The application or Ordo performs the chosen recovery." }
    ],
    form: "Not a form control. If the actions are form submit buttons, the application still validates legality server-side."
  },
  states: [
    { name: "Conflict with comparison", how: "header, diff viewer and actions", description: "Both versions are available and differences are marked." },
    { name: "Conflict without comparison", how: "header and actions, no diff viewer", description: "The current version is missing or cannot be shown; the header explains why." },
    { name: "Changed row", how: "data-change=\"changed\" on .ef-diff-row", description: "Thick inline-start border beside rows that differ." }
  ],
  accessibility: {
    forma: [
      "Uses an article with a heading, labelled comparison sides and definition lists, so the structure is navigable without seeing the layout.",
      "Marks changed rows with a border in addition to their content, not color alone.",
      "Keeps recovery actions as native buttons in a predictable footer."
    ],
    consumer: [
      "State in the header that the user's change was not applied.",
      "Say who changed the record and when, when the application knows.",
      "Offer only recovery actions that are legal for the current version, and label each with its effect.",
      "Move focus to the conflict review's heading when it replaces the form the user was editing."
    ]
  },
  responsive: [
    "The comparison is two columns on wide screens and stacks below 40rem.",
    "Diff rows stack label above value below 30rem.",
    "The action footer wraps and keeps actions at the inline end.",
    "Long values and names wrap inside their columns."
  ],
  motion: [
    "No animation: the conflict review replaces or accompanies the form through the application's DOM change."
  ],
  guidance: {
    do: [
      "Show only the fields that matter to the decision, plus enough context to recognize the record.",
      "Label versions by source and number (\"You edited, version 7\" and \"Current, version 8\")."
    ],
    avoid: [
      "Offering an automatic \"Overwrite\" unless the domain explicitly allows it.",
      "Hiding the conflict behind a generic save error."
    ]
  },
  related: [
    { slug: "diff-viewer", note: "The comparison embedded inside a conflict review." },
    { slug: "operation-status", note: "Outcome states such as unknown or failed that are not version conflicts." },
    { slug: "recovery-actions", note: "Structured recovery choices when a comparison is not needed." }
  ]
};
