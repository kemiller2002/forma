export default {
  name: "Rule builder",
  category: "forms",
  behavior: "Application / Limen",
  summary: "Field/operator/value clauses for typed rule editing while the application owns expression semantics.",
  owns: ["ef-rule-builder", "ef-rule-clause", "ef-rule-group"],
  purpose: {
    description: "A rule builder lets users compose a condition from clauses, each a field, an operator and a value, combined in AND/OR groups, with a plain-language summary of what the rule means. Forma provides the visual contract: a bordered panel with a header, groups with a visible operator badge, clause rows laid out as a grid of labelled native selects or inputs, and a summary bar. Adding and removing clauses, which operators and values a field allows, validation, the expression model and its serialization all belong to the application (Limen/Ordo); Forma never interprets the rule.",
    useWhen: [
      "Users define when something applies (show a question, route a ticket, include a record) with conditions over typed fields.",
      "Conditions combine with AND/OR and users need to read the result back in plain language.",
      "Each clause can be edited with ordinary form controls."
    ],
    avoidWhen: [
      "Users filter a collection with a few fixed facets: use [[collection-toolbar]] with [[active-filter-summary]].",
      "The logic is a sequence of states or steps: use [[diagram]] or [[wizard]].",
      "Users type free-text queries: use [[search]]."
    ],
    characteristics: [
      "Each clause is three labelled controls and a remove button in one row that stacks at narrow widths.",
      "Group logic is shown as text (AND, OR) in a badge, not by color or indentation alone.",
      "The summary restates the rule in words so users can check it without parsing the clauses."
    ]
  },
  examples: [
    {
      id: "nested-any-group",
      title: "Routing rule with a nested OR group",
      description: "An AND group containing one clause and a nested OR group of two clauses. Each group is a named role=group, the visible operator badge is hidden from assistive technology because the group name says the same thing, and remove buttons name their clause.",
      html: `<ef-rule-builder class="ef-component-tag">
  <section class="ef-rule-builder" aria-labelledby="rule-builder-nested-title">
    <header class="ef-rule-builder__header">
      <div>
        <h2 id="rule-builder-nested-title">Escalation routing</h2>
        <p>Tickets that match go to the priority queue.</p>
      </div>
      <button type="button">Add condition</button>
    </header>
    <div class="ef-rule-group" data-ef-operator="and" role="group" aria-label="All of these conditions (AND)">
      <p class="ef-rule-group__operator" aria-hidden="true">AND</p>
      <div class="ef-rule-clause">
        <label><span>Field</span>
          <select name="rule-1-field"><option selected>Customer plan</option><option>Region</option><option>Severity</option></select>
        </label>
        <label><span>Operator</span>
          <select name="rule-1-operator"><option selected>is</option><option>is not</option></select>
        </label>
        <label><span>Value</span>
          <select name="rule-1-value"><option selected>Enterprise</option><option>Business</option></select>
        </label>
        <button type="button" aria-label="Remove condition: Customer plan is Enterprise">Remove</button>
      </div>
      <div class="ef-rule-group" data-ef-operator="or" role="group" aria-label="Any of these conditions (OR)">
        <p class="ef-rule-group__operator" aria-hidden="true">OR</p>
        <div class="ef-rule-clause">
          <label><span>Field</span>
            <select name="rule-2-field"><option>Customer plan</option><option>Region</option><option selected>Severity</option></select>
          </label>
          <label><span>Operator</span>
            <select name="rule-2-operator"><option selected>is</option><option>is not</option></select>
          </label>
          <label><span>Value</span>
            <select name="rule-2-value"><option selected>Critical</option><option>High</option></select>
          </label>
          <button type="button" aria-label="Remove condition: Severity is Critical">Remove</button>
        </div>
        <div class="ef-rule-clause">
          <label><span>Field</span>
            <select name="rule-3-field"><option>Customer plan</option><option>Region</option><option selected>Open hours</option></select>
          </label>
          <label><span>Operator</span>
            <select name="rule-3-operator"><option selected>more than</option><option>less than</option></select>
          </label>
          <label><span>Value</span>
            <input type="number" name="rule-3-value" min="0" value="4" inputmode="numeric">
          </label>
          <button type="button" aria-label="Remove condition: Open hours more than 4">Remove</button>
        </div>
      </div>
    </div>
    <p class="ef-rule-builder__summary"><strong>Meaning:</strong> Route to the priority queue when the plan is Enterprise and either severity is Critical or the ticket has been open more than 4 hours.</p>
  </section>
</ef-rule-builder>`
    },
    {
      id: "incomplete-clause",
      title: "Incomplete condition",
      description: "The application rejected a clause with no value chosen. The empty value select is marked invalid and linked to a validation message; the summary says the rule cannot be applied yet instead of guessing its meaning.",
      html: `<ef-rule-builder class="ef-component-tag">
  <section class="ef-rule-builder" aria-labelledby="rule-builder-incomplete-title">
    <header class="ef-rule-builder__header">
      <div>
        <h2 id="rule-builder-incomplete-title">Section visibility</h2>
        <p>Show the follow-up section only to some respondents.</p>
      </div>
      <button type="button">Add condition</button>
    </header>
    <div class="ef-rule-group" data-ef-operator="and" role="group" aria-label="All of these conditions (AND)">
      <p class="ef-rule-group__operator" aria-hidden="true">AND</p>
      <div class="ef-rule-clause">
        <label><span>Field</span>
          <select name="visibility-field"><option selected>Answer: Q4 Team size</option></select>
        </label>
        <label><span>Operator</span>
          <select name="visibility-operator"><option selected>is at least</option></select>
        </label>
        <label><span>Value</span>
          <select name="visibility-value" aria-invalid="true" aria-describedby="rule-builder-incomplete-error"><option value="" selected>Choose a value</option><option>10</option><option>50</option></select>
        </label>
        <button type="button" aria-label="Remove condition: Q4 Team size">Remove</button>
      </div>
      <p class="ef-validation-message" id="rule-builder-incomplete-error">
        <span class="ef-validation-message__mark" aria-hidden="true">!</span>
        Choose a value for this condition.
      </p>
    </div>
    <p class="ef-rule-builder__summary"><strong>Meaning:</strong> Incomplete. The rule will not be applied until every condition has a value.</p>
  </section>
</ef-rule-builder>`
    },
    {
      id: "mobile-audience-rule",
      title: "Mobile audience rule",
      description: "A two-clause AND rule at phone width. The header and each clause stack so every control gets the full width.",
      mobile: {
        height: 640,
        notes: [
          "At 44rem (704px) and below each clause becomes one column: Field, Operator, Value and Remove stack in source order.",
          "The header stacks too, so Add condition moves below the title and stretches to the panel width.",
          "Every select and button keeps a 44px minimum height for touch.",
          "The summary wraps inside its bar; nothing scrolls horizontally."
        ]
      },
      html: `<ef-rule-builder class="ef-component-tag">
  <section class="ef-rule-builder" aria-labelledby="rule-builder-mobile-title">
    <header class="ef-rule-builder__header">
      <div>
        <h2 id="rule-builder-mobile-title">Campaign audience</h2>
        <p>Who receives this announcement.</p>
      </div>
      <button type="button">Add condition</button>
    </header>
    <div class="ef-rule-group" data-ef-operator="and" role="group" aria-label="All of these conditions (AND)">
      <p class="ef-rule-group__operator" aria-hidden="true">AND</p>
      <div class="ef-rule-clause">
        <label><span>Field</span>
          <select name="audience-1-field"><option selected>Role</option></select>
        </label>
        <label><span>Operator</span>
          <select name="audience-1-operator"><option selected>is</option></select>
        </label>
        <label><span>Value</span>
          <select name="audience-1-value"><option selected>Administrator</option></select>
        </label>
        <button type="button" aria-label="Remove condition: Role is Administrator">Remove</button>
      </div>
      <div class="ef-rule-clause">
        <label><span>Field</span>
          <select name="audience-2-field"><option selected>Last sign-in</option></select>
        </label>
        <label><span>Operator</span>
          <select name="audience-2-operator"><option selected>within</option></select>
        </label>
        <label><span>Value</span>
          <select name="audience-2-value"><option selected>30 days</option></select>
        </label>
        <button type="button" aria-label="Remove condition: Last sign-in within 30 days">Remove</button>
      </div>
    </div>
    <p class="ef-rule-builder__summary"><strong>Meaning:</strong> Administrators who signed in within the last 30 days.</p>
  </section>
</ef-rule-builder>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-rule-builder", values: "id of the heading", default: "—", description: "Names the rule builder region with its visible heading." },
      { name: "data-ef-operator", on: ".ef-rule-group", values: "and | or", default: "—", description: "Application-owned record of the group's logic, used by the pattern. Forma does not style it; the operator badge text is what users see." },
      { name: "role", on: ".ef-rule-group", values: "group", default: "—", description: "Exposes the group and its accessible name to assistive technology." },
      { name: "aria-label", on: ".ef-rule-group / remove button", values: "string", default: "—", description: "Names each group by its logic and each Remove button by its clause; keep the visible word Remove in the name." },
      { name: "aria-hidden", on: ".ef-rule-group__operator", values: "true", default: "—", description: "Hides the visual badge when the group's aria-label already states the logic." },
      { name: "aria-invalid", on: "clause control", values: "true", default: "absent", description: "Set by the application on an incomplete or invalid clause control." },
      { name: "aria-describedby", on: "clause control", values: "id of the validation message", default: "—", description: "Links the clause error to the control." }
    ],
    hooks: {
      "ef-rule-builder": "Root panel with a functional border on the primary surface.",
      "ef-rule-builder__header": "Header row with title and description on one side and actions on the other; stacks at 44rem and below.",
      "ef-rule-builder__summary": "Plain-language meaning bar on the secondary surface at the bottom of the panel.",
      "ef-rule-group": "Padded grid of an operator badge and its clauses or nested groups.",
      "ef-rule-group__operator": "Monospace uppercase badge naming the group logic (AND, OR).",
      "ef-rule-clause": "Four-column grid (field, operator, value, remove) with bottom-aligned controls; one column at 44rem and below. Direct labels become small label-over-control grids."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the header action, each clause's controls and Remove buttons in source order." },
      { keys: "Native control keys", action: "Selects and inputs keep their native keyboard behavior." },
      { keys: "Application", action: "After Add or Remove, the application must move focus to the new clause's first control or to a sensible neighbor; Forma provides no focus management." }
    ],
    events: [
      { name: "change / click", description: "Native events from clause controls and buttons. Building, validating and serializing the expression is application code; Forma adds no events." }
    ],
    form: "Clause controls are ordinary form controls and submit individually if inside a form. The structured expression is assembled and serialized by the application."
  },
  states: [
    { name: "Complete", how: "every clause has values; summary states the meaning", description: "The summary restates the rule in words." },
    { name: "Incomplete / invalid", how: "aria-invalid on a clause control plus a linked .ef-validation-message", description: "Error text with a non-color mark in the group; the summary says the rule cannot apply yet." },
    { name: "Nested group", how: ".ef-rule-group inside .ef-rule-group", description: "Inner group gets its own operator badge and padding; use nesting only when the logic requires it." },
    { name: "Focus", how: ":focus-visible", description: "Foundation focus ring on the focused control." }
  ],
  accessibility: {
    forma: [
      "Every clause control is wrapped in a visible label.",
      "Group logic is displayed as text, and the panel border maps to CanvasText in forced-colors mode.",
      "Clauses stack at narrow widths so controls never shrink below a usable size."
    ],
    consumer: [
      "Give each group role=\"group\" with a name stating its logic; the canonical pattern's aria-label on a plain div is not reliably exposed.",
      "Give each Remove button a name that identifies its clause.",
      "Manage focus after adding or removing clauses and announce the change.",
      "Keep the summary accurate; it is the most readable view of the rule for everyone."
    ]
  },
  responsive: [
    "Above 44rem clause columns are `minmax(8rem, …)`, so very narrow containers may need the stacked layout sooner than the breakpoint.",
    "At 44rem (704px) and below the header and clauses become single columns.",
    "The root has `min-inline-size: 0`, so it shrinks inside grid and flex parents; the summary wraps."
  ],
  motion: [
    "No animation: clauses and groups appear and disappear without transitions. Buttons use the shared hover and press background interpolation."
  ],
  guidance: {
    do: [
      "Show the plain-language meaning and update it with every change.",
      "Offer only operators and values that make sense for the chosen field."
    ],
    avoid: [
      "Deep nesting; flatten logic where possible.",
      "Encoding AND/OR only with color or indentation.",
      "Putting expression semantics in CSS classes; keep them in application state."
    ]
  },
  related: [
    { slug: "collection-toolbar", note: "Simple faceted filtering without composed logic." },
    { slug: "active-filter-summary", note: "Readable list of applied filters with removal." },
    { slug: "select", note: "The native control used for field, operator and value choices." },
    { slug: "validation-message", note: "Inline error for an incomplete clause." }
  ]
};
