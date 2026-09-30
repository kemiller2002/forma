export default {
  name: "Stack",
  category: "layout",
  behavior: "Native CSS",
  summary: "Applies consistent vertical rhythm between semantic siblings.",
  purpose: {
    description: "A stack is the smallest composition primitive: it places independent children in one vertical column and owns only the space between them. Children keep their own semantics and internal spacing; the stack removes their block margins and inserts a single, predictable relationship instead. Use it inside forms, panels, cards and page regions whenever siblings should read as one ordered group. The `data-density` posture changes the gap for a whole region without touching the markup of its children.",
    useWhen: [
      "Several independent siblings (headings, paragraphs, fields, panels) should be separated by one consistent vertical rhythm.",
      "A settings panel, form section or card body needs its spacing set by the parent instead of by each child's margins.",
      "A region needs a different density posture (relaxed for reading, compact for repeated expert work) without restyling its children."
    ],
    avoidWhen: [
      "Items should sit side by side and wrap: use [[cluster]].",
      "Items form a two-dimensional collection of peers: use [[grid]] or [[responsive-grid]].",
      "Long-form article text needs typographic rhythm between headings, lists and quotes: use [[prose]], which owns reading measure and heading spacing.",
      "You need a visible boundary or background around the group: put the stack inside a [[surface]]; the stack itself draws nothing."
    ],
    characteristics: [
      "Children stay in source order; the stack never reorders, so reading, focus and visual order match.",
      "Only direct children are spaced. Nested stacks set their own rhythm, which makes grouping by proximity explicit.",
      "The stack draws no border, background or padding, so it adds no visual noise to a composition."
    ]
  },
  examples: [
    {
      id: "settings-panel",
      title: "Settings panel",
      description: "A stack arranges a heading, two switches and a save action inside a surface. The stack owns the vertical relationship; each switch keeps its own internal layout.",
      html: `<ef-stack class="ef-component-tag">
  <section class="ef-surface ef-stack" aria-labelledby="stack-settings-panel-title">
    <h2 id="stack-settings-panel-title">Workspace notifications</h2>
    <p>Choose which events send you an email. Changes apply to this workspace only.</p>
    <label class="ef-switch">
      <input class="ef-switch__input" type="checkbox" role="switch" name="stack-settings-panel-builds" value="on" checked>
      <span class="ef-switch__track" aria-hidden="true"></span>
      <span class="ef-switch__text"><span class="ef-switch__label">Failed builds</span></span>
    </label>
    <label class="ef-switch">
      <input class="ef-switch__input" type="checkbox" role="switch" name="stack-settings-panel-mentions" value="on">
      <span class="ef-switch__track" aria-hidden="true"></span>
      <span class="ef-switch__text"><span class="ef-switch__label">Mentions in review comments</span></span>
    </label>
  </section>
</ef-stack>`
    },
    {
      id: "compact-density",
      title: "Compact density for an expert form",
      description: "The same kind of content under `data-density=\"compact\"`. The posture reduces the stack gap so more fields fit on screen for repeated data entry; field order, labels and target sizes do not change.",
      html: `<ef-stack class="ef-component-tag">
  <form class="ef-stack" data-density="compact" aria-labelledby="stack-compact-density-title">
    <h2 id="stack-compact-density-title">Shipment details</h2>
    <div class="ef-field">
      <label class="ef-field__label" for="stack-compact-density-reference">Reference</label>
      <input id="stack-compact-density-reference" name="reference" type="text" autocomplete="off">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="stack-compact-density-carrier">Carrier</label>
      <input id="stack-compact-density-carrier" name="carrier" type="text">
    </div>
    <div class="ef-field">
      <label class="ef-field__label" for="stack-compact-density-weight">Weight (kg)</label>
      <input id="stack-compact-density-weight" name="weight" type="number" inputmode="decimal" min="0" step="0.1">
    </div>
    <div class="ef-cluster">
      <button type="submit">Save shipment</button>
      <button type="reset">Clear</button>
    </div>
  </form>
</ef-stack>`
    },
    {
      id: "nested-grouping",
      title: "Nested groups with relaxed outer rhythm",
      description: "An outer relaxed stack separates two groups; each group is its own tighter stack. Proximity, not borders, tells the reader which heading owns which list.",
      html: `<ef-stack class="ef-component-tag">
  <article class="ef-stack" data-density="relaxed" aria-labelledby="stack-nested-grouping-title">
    <h2 id="stack-nested-grouping-title">Release 4.2 checklist</h2>
    <section class="ef-stack" data-density="compact" aria-labelledby="stack-nested-grouping-before">
      <h3 id="stack-nested-grouping-before">Before the release</h3>
      <p>Freeze the main branch and confirm the migration plan with the database owner.</p>
      <p>Run the full regression suite against staging.</p>
    </section>
    <section class="ef-stack" data-density="compact" aria-labelledby="stack-nested-grouping-after">
      <h3 id="stack-nested-grouping-after">After the release</h3>
      <p>Watch error rates for one hour and post the summary in the release channel.</p>
    </section>
  </article>
</ef-stack>`
    },
    {
      id: "mobile-account-summary",
      title: "Mobile account summary",
      description: "A phone-width account summary. The stack is already a single column, so nothing recomposes; long values wrap inside each child.",
      mobile: {
        height: 420,
        notes: [
          "A stack is one column at every width, so there is no breakpoint and nothing moves at 320px.",
          "Long values such as the email address wrap inside their own element; the stack never causes horizontal page scroll.",
          "The gap is fixed by the density posture, not by viewport width, so touch targets in the child components keep their own minimum sizes.",
          "Rotating to landscape only widens the children; order and spacing stay the same."
        ]
      },
      html: `<ef-stack class="ef-component-tag">
  <section class="ef-stack" aria-labelledby="stack-mobile-account-summary-title">
    <h2 id="stack-mobile-account-summary-title">Account</h2>
    <dl class="ef-key-value-list">
      <div><dt>Owner</dt><dd>Priya Raman</dd></div>
      <div><dt>Billing email</dt><dd>accounts-payable.northwind-logistics@example.com</dd></div>
      <div><dt>Plan</dt><dd>Team, billed annually</dd></div>
    </dl>
    <p>Invoices are issued on the first business day of each month.</p>
    <a href="#stack-mobile-account-summary-title">Manage billing</a>
  </section>
</ef-stack>`
    }
  ],
  api: {
    attributes: [
      { name: "data-density", on: ".ef-stack", values: "relaxed | standard | compact | analytical", default: "absent (1rem gap)", description: "Contextual density posture. Sets the stack gap to 1.5rem (relaxed), 1rem (standard) or 0.5rem (compact, analytical). It is not a data-ef-* hook and never changes semantics, order or target size." },
      { name: "aria-labelledby", on: "section / article / form", values: "id of the group heading", default: "—", description: "Names a stacked region when the element is a landmark or a named group. The stack itself adds no role." }
    ],
    hooks: {
      "ef-stack": "Vertical flex column. Removes block margins from direct children and spaces them with a gap plus a leading margin on every child after the first.",
      "data-density": "Density posture on the stack element. relaxed = 1.5rem, standard = 1rem, compact and analytical = 0.5rem gap (spacing primitives, so skins rescale them).",
      "--ef-stack-gap": "Foundation-layer gap between children. Default `--ef-primitive-spacing-4` (1rem). Ignored when `data-density` is set.",
      "--ef-stack-space": "Component-layer margin inserted before each child after the first. Default `--ef-primitive-spacing-4` (1rem). It adds to the gap, so the visible space between children is gap plus this value."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through focusable children in source order, which is also the visual order." }
    ],
    events: [],
    form: "Not a form control. A form or fieldset may itself be the stack; submission is unaffected."
  },
  states: [
    { name: "Default rhythm", how: "no data-density", description: "Gap from `--ef-stack-gap` plus the leading margin from `--ef-stack-space`." },
    { name: "Density posture", how: "data-density=\"relaxed | standard | compact | analytical\"", description: "Replaces the gap with the posture's spacing. The leading margin still applies." }
  ],
  accessibility: {
    forma: [
      "Never reorders children, so DOM order, reading order and focus order stay identical.",
      "Adds no role, landmark or hidden content; the semantics are entirely the children's.",
      "Density postures change spacing only and never shrink child targets below their own minimums."
    ],
    consumer: [
      "Choose the semantic element for the group (section, form, fieldset, ul) and label it when it is a landmark or named group.",
      "Do not rely on spacing alone to separate unrelated groups; add headings so grouping survives screen readers and forced colors.",
      "Check compact and analytical postures at 200% text size; tighter spacing must not make adjacent groups ambiguous."
    ]
  },
  responsive: [
    "One column at every width with no breakpoints; children fill the stack's inline size.",
    "Children keep their own wrapping and overflow behavior; the stack adds no minimum width and never causes horizontal scroll.",
    "Spacing does not change with viewport width; change the posture with `data-density` when the context changes.",
    "Skins that rescale the spacing primitives (compact, comfortable) rescale stack spacing too."
  ],
  motion: [
    "No animation: the stack is static layout. Children that animate (disclosures, alerts) keep their own motion, and inserted children appear without a layout transition."
  ],
  guidance: {
    do: [
      "Make the semantic container the stack (for example `section class=\"ef-stack\"`) instead of adding a wrapper div.",
      "Use nested stacks with a tighter posture to express sub-groups by proximity."
    ],
    avoid: [
      "Adding margins to children to fine-tune spacing; the stack resets them. Nest another stack instead.",
      "Using a stack to fake a list; use `ul` or `ol` and make that element the stack.",
      "Using compact density on reading-focused or unfamiliar tasks where separation aids orientation."
    ]
  },
  related: [
    { slug: "cluster", note: "Inline, wrapping arrangement of related items such as actions or metadata." },
    { slug: "grid", note: "Two-dimensional collection of peer items that should align in columns." },
    { slug: "surface", note: "Adds the visible boundary and padding a stack does not draw." },
    { slug: "prose", note: "Long-form reading content with typographic rhythm and measure." }
  ]
};
