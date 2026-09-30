export default {
  name: "Best–Worst",
  category: "assessment",
  behavior: "Application / Limen",
  summary: "Capture distinct strongest and weakest choices without hiding the two-selection constraint.",
  purpose: {
    description: "Best–Worst (MaxDiff) shows a set of items and asks for the most and least important. Forma renders it as a small grid: one row per item, with a Best radio and a Worst radio. The Best radios form one native group and the Worst radios another, so the browser guarantees one Best and one Worst. What HTML cannot enforce is that they differ; the application (Limen) checks that rule, sets `aria-invalid` and writes the status line. The constraint is always stated in visible text, never implied by the layout.",
    useWhen: [
      "Relative importance is measured across sets of three to six items.",
      "You need the extremes of a set rather than a full order.",
      "Rating scales produce too little differentiation because everything is rated important."
    ],
    avoidWhen: [
      "Only two items are compared: use [[pairwise-choice]].",
      "A complete order is required: use [[ranking]].",
      "Items are rated independently: use [[matrix-single]].",
      "Effort is distributed numerically across items: use [[allocation]]."
    ],
    characteristics: [
      "Two independent radio groups across the same rows (Best and Worst).",
      "Each radio has an explicit accessible name combining the item and the role, such as \"Reliability, Best\".",
      "The column header row is visual only (`aria-hidden`) and disappears below 44rem.",
      "A polite live status line reports incomplete, conflicting or complete state as written by the application."
    ]
  },
  examples: [
    {
      id: "conflict",
      title: "Same item chosen as Best and Worst",
      description: "The user has chosen Cost efficiency for both roles. The application marks the Worst group invalid and explains the rule in the live status line; Forma supplies no automatic correction.",
      html: `<ef-best-worst class="ef-component-tag">
  <fieldset class="ef-best-worst" aria-describedby="bestworst-conflict-help">
    <legend class="ef-best-worst__legend">Which is most and least important when choosing a vendor?</legend>
    <p class="ef-field__description" id="bestworst-conflict-help">Choose one Best and a different Worst.</p>
    <div class="ef-best-worst__header" aria-hidden="true"><span>Option</span><span>Best</span><span>Worst</span></div>
    <div class="ef-best-worst__row">
      <span>Support quality</span>
      <label><input type="radio" name="bestworst-conflict-best" value="support" aria-label="Support quality, Best"></label>
      <label><input type="radio" name="bestworst-conflict-worst" value="support" aria-label="Support quality, Worst" aria-invalid="true"></label>
    </div>
    <div class="ef-best-worst__row">
      <span>Security certifications</span>
      <label><input type="radio" name="bestworst-conflict-best" value="security" aria-label="Security certifications, Best"></label>
      <label><input type="radio" name="bestworst-conflict-worst" value="security" aria-label="Security certifications, Worst" aria-invalid="true"></label>
    </div>
    <div class="ef-best-worst__row">
      <span>Cost efficiency</span>
      <label><input type="radio" name="bestworst-conflict-best" value="cost" checked aria-label="Cost efficiency, Best"></label>
      <label><input type="radio" name="bestworst-conflict-worst" value="cost" checked aria-label="Cost efficiency, Worst" aria-invalid="true"></label>
    </div>
    <div class="ef-best-worst__row">
      <span>Integration options</span>
      <label><input type="radio" name="bestworst-conflict-best" value="integrations" aria-label="Integration options, Best"></label>
      <label><input type="radio" name="bestworst-conflict-worst" value="integrations" aria-label="Integration options, Worst" aria-invalid="true"></label>
    </div>
    <p class="ef-best-worst__status" data-ef-state="invalid" aria-live="polite">Cost efficiency cannot be both Best and Worst. Choose a different Worst.</p>
  </fieldset>
</ef-best-worst>`
    },
    {
      id: "complete",
      title: "Completed set with long item names",
      description: "Distinct Best and Worst chosen; the application has written a completion status. Long item names wrap in the first column while the radio columns keep their width.",
      html: `<ef-best-worst class="ef-component-tag">
  <fieldset class="ef-best-worst">
    <legend class="ef-best-worst__legend">Which change would help your on-call week most and least?</legend>
    <div class="ef-best-worst__header" aria-hidden="true"><span>Option</span><span>Best</span><span>Worst</span></div>
    <div class="ef-best-worst__row">
      <span>Alerts routed to the owning team instead of a shared rotation</span>
      <label><input type="radio" name="bestworst-complete-best" value="routing" checked aria-label="Alerts routed to the owning team, Best"></label>
      <label><input type="radio" name="bestworst-complete-worst" value="routing" aria-label="Alerts routed to the owning team, Worst"></label>
    </div>
    <div class="ef-best-worst__row">
      <span>Runbooks linked from every alert</span>
      <label><input type="radio" name="bestworst-complete-best" value="runbooks" aria-label="Runbooks linked from every alert, Best"></label>
      <label><input type="radio" name="bestworst-complete-worst" value="runbooks" aria-label="Runbooks linked from every alert, Worst"></label>
    </div>
    <div class="ef-best-worst__row">
      <span>Compensatory time off after night pages</span>
      <label><input type="radio" name="bestworst-complete-best" value="time-off" aria-label="Compensatory time off after night pages, Best"></label>
      <label><input type="radio" name="bestworst-complete-worst" value="time-off" checked aria-label="Compensatory time off after night pages, Worst"></label>
    </div>
    <p class="ef-best-worst__status" data-ef-state="complete" aria-live="polite">Best and Worst chosen.</p>
  </fieldset>
</ef-best-worst>`
    },
    {
      id: "mobile-compact-columns",
      title: "Best–Worst on a phone",
      description: "Below 44rem the column header is hidden and the radio columns shrink to 44px. The accessible names already state Best or Worst, but the visible description repeats which column is which.",
      mobile: {
        height: 380,
        notes: [
          "The header row (Option, Best, Worst) is hidden below 44rem, so the description must state the column order in text.",
          "Radio columns change from a fixed 4.5rem to `minmax(2.75rem, auto)`, giving the item name more room.",
          "Each radio label keeps a 44px minimum height as its tap target; the native radio itself is 1.25rem.",
          "Item names wrap within the first column; there is no horizontal scroll at 320px."
        ]
      },
      html: `<ef-best-worst class="ef-component-tag">
  <fieldset class="ef-best-worst" aria-describedby="bestworst-mobile-help">
    <legend class="ef-best-worst__legend">Most and least useful meeting?</legend>
    <p class="ef-field__description" id="bestworst-mobile-help">In each row, the first circle is Best and the second is Worst.</p>
    <div class="ef-best-worst__header" aria-hidden="true"><span>Option</span><span>Best</span><span>Worst</span></div>
    <div class="ef-best-worst__row">
      <span>Daily stand-up</span>
      <label><input type="radio" name="bestworst-mobile-best" value="standup" aria-label="Daily stand-up, Best"></label>
      <label><input type="radio" name="bestworst-mobile-worst" value="standup" aria-label="Daily stand-up, Worst"></label>
    </div>
    <div class="ef-best-worst__row">
      <span>Sprint planning</span>
      <label><input type="radio" name="bestworst-mobile-best" value="planning" aria-label="Sprint planning, Best"></label>
      <label><input type="radio" name="bestworst-mobile-worst" value="planning" aria-label="Sprint planning, Worst"></label>
    </div>
    <div class="ef-best-worst__row">
      <span>Retrospective</span>
      <label><input type="radio" name="bestworst-mobile-best" value="retro" aria-label="Retrospective, Best"></label>
      <label><input type="radio" name="bestworst-mobile-worst" value="retro" aria-label="Retrospective, Worst"></label>
    </div>
    <p class="ef-best-worst__status" data-ef-state="incomplete" aria-live="polite">Choose one Best and one Worst.</p>
  </fieldset>
</ef-best-worst>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "radio", default: "—", description: "Radios: one group for Best, one for Worst." },
      { name: "name", on: "input", values: "one name for all Best radios, another for all Worst radios", default: "—", description: "The two names make Best and Worst each single-select. Unique per question." },
      { name: "value", on: "input", values: "item identifier", default: "—", description: "The item chosen for that role." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Restores saved Best and Worst choices." },
      { name: "aria-label", on: "input", values: "\"<item>, Best\" or \"<item>, Worst\"", default: "—", description: "Required. The radios have no visible text of their own, so each needs a name that combines item and role. aria-labelledby pointing at the item text and a role label is equivalent." },
      { name: "aria-labelledby", on: "input", values: "ids of item text and role label", default: "—", description: "Alternative to aria-label used by the canonical pattern." },
      { name: "aria-invalid", on: "inputs", values: "true", default: "absent", description: "Set by the application when the same item holds both roles or a role is missing on submit." },
      { name: "aria-live", on: ".ef-best-worst__status", values: "polite", default: "—", description: "Announces the application's status text when it changes." },
      { name: "data-ef-state", on: ".ef-best-worst__status", values: "incomplete | invalid | complete (application-defined)", default: "—", description: "Application state marker for the status line. Forma currently applies no styling for it; the text carries the meaning." },
      { name: "aria-describedby", on: "fieldset", values: "id list", default: "—", description: "Associates the rule or column explanation with the group." }
    ],
    hooks: {
      "ef-best-worst": "Root fieldset with browser border and padding removed.",
      "ef-best-worst__legend": "Question text.",
      "ef-best-worst__header": "Visual column headings. Mark aria-hidden; hidden below 44rem.",
      "ef-best-worst__row": "Bordered three-column grid row: item text, Best radio, Worst radio. Consecutive rows share borders.",
      "ef-best-worst__status": "Status line written by the application; place it in a polite live region."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Visits the Best group, then the Worst group (each is one tab stop), in source order." },
      { keys: "Arrow keys", action: "Native radio behavior within the focused group: moves down or up the column and selects." },
      { keys: "Space", action: "Selects the focused radio when that group has no selection." }
    ],
    events: [
      { name: "input / change", description: "Native events from each group. Limen listens to both to enforce the distinct-selection rule and update the status." }
    ],
    form: "Submits the Best name=value and the Worst name=value. HTML cannot stop both naming the same item; the application must validate before accepting."
  },
  states: [
    { name: "Incomplete", how: "fewer than two checked radios; status text", description: "The status line asks for the missing choice." },
    { name: "Conflict", how: "same value checked in both groups; aria-invalid and status text set by the application", description: "Status explains the rule. Forma adds no conflict styling." },
    { name: "Complete", how: "distinct values checked; status text", description: "Status confirms both choices." },
    { name: "Focus", how: ":focus-visible on a radio", description: "The foundation focus ring on the native radio." }
  ],
  accessibility: {
    forma: [
      "Keeps Best and Worst as two native radio groups with visible native radios and 44px-tall hit rows.",
      "Presents the header as visual-only so screen readers rely on each radio's explicit name.",
      "Provides a status line styled for a polite live region."
    ],
    consumer: [
      "Name every radio with item plus role.",
      "Enforce distinct Best and Worst, set aria-invalid and write status text that says what to change.",
      "State the column meaning in visible text, because the header row is hidden on phones.",
      "Present sets sequentially with [[survey-progress]] when running a multi-set exercise."
    ]
  },
  responsive: [
    "Wide: `minmax(10rem, 1fr) 4.5rem 4.5rem` columns for item, Best and Worst.",
    "Below 44rem: header hidden, radio columns shrink to `minmax(2.75rem, auto)` and row padding tightens.",
    "Item text wraps; the grid never forces horizontal scroll."
  ],
  motion: [
    "No animation: radios are native and change immediately; the status line updates without transition."
  ],
  guidance: {
    do: [
      "Keep sets to three to six items so both extremes are easy to judge.",
      "Explain the Best/Worst rule before the rows."
    ],
    avoid: [
      "Silently unchecking the other role when a conflict occurs; tell the user instead.",
      "Relying on column position alone to tell Best from Worst."
    ]
  },
  related: [
    { slug: "pairwise-choice", note: "Compares exactly two alternatives." },
    { slug: "ranking", note: "Orders every item, not just the extremes." },
    { slug: "matrix-single", note: "Rates each item independently on the same scale." }
  ]
};
