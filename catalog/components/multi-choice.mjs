export default {
  name: "Multi-choice",
  category: "selection",
  behavior: "Native HTML",
  summary: "Checkbox-backed selection with explicit guidance for minimum, maximum, or exclusive choices.",
  owns: ["ef-selection-guidance", "ef-selection-status"],
  purpose: {
    description: "Multi-choice lets people pick several answers from one set. It reuses the [[choice-group]] card (`ef-choice-group` fieldset, `ef-choice` labels) with native checkboxes, and adds two text parts: `ef-selection-guidance` states the rule before the options (exactly two, at most three, between one and four, or that one option is exclusive), and `ef-selection-status` reports the current count in a polite live region. Forma presents the rule and the count as text; it does not count, enforce limits or clear other options when an exclusive option is chosen. Those behaviors belong to the application or Limen.",
    useWhen: [
      "Several answers can apply at once and each benefits from a readable card.",
      "The number of answers is constrained (exact, minimum, maximum or a range) and users need to see the rule and their progress.",
      "The set includes a \"None of these\" or \"Not applicable\" answer that cannot be combined with others."
    ],
    avoidWhen: [
      "Only one answer is allowed: use [[choice-group]].",
      "Each item is an independent setting that applies immediately: use [[switch]] or [[checkbox]].",
      "Options are nested in categories: use [[hierarchical-multi-choice]].",
      "Items are ranked or scored rather than selected: use [[ranking]] or [[allocation]]."
    ],
    characteristics: [
      "Native checkboxes: each option is independently checked, submitted and reset by the browser.",
      "Checked cards show a filled square indicator plus an accent border and surface change.",
      "The rule is visible text before the options and is linked to the fieldset with aria-describedby.",
      "The count is visible text in an `aria-live=\"polite\"` region that the application updates.",
      "An exclusive option is marked with a dashed border (`ef-choice--exclusive`) and a text label, not by position."
    ]
  },
  examples: [
    {
      id: "maximum-reached",
      title: "Maximum reached",
      description: "An at-most-three rule with three options already checked. The application has updated the status text to say the limit is reached and has disabled the remaining option, so the user cannot exceed it; the guidance tells them how to change their choice.",
      html: `<ef-multi-choice class="ef-component-tag">
  <fieldset class="ef-choice-group" aria-describedby="multi-choice-maximum-reached-guidance">
    <legend class="ef-choice-group__legend">Which topics should your weekly digest cover?</legend>
    <p class="ef-selection-guidance" id="multi-choice-maximum-reached-guidance">Choose up to 3 topics. Clear one to pick a different topic.</p>
    <label class="ef-choice">
      <input type="checkbox" name="multi-choice-maximum-reached-topics" value="releases" checked>
      <span class="ef-choice__content"><strong>Releases</strong></span>
    </label>
    <label class="ef-choice">
      <input type="checkbox" name="multi-choice-maximum-reached-topics" value="incidents" checked>
      <span class="ef-choice__content"><strong>Incidents</strong></span>
    </label>
    <label class="ef-choice">
      <input type="checkbox" name="multi-choice-maximum-reached-topics" value="billing" checked>
      <span class="ef-choice__content"><strong>Billing</strong></span>
    </label>
    <label class="ef-choice">
      <input type="checkbox" name="multi-choice-maximum-reached-topics" value="security" disabled>
      <span class="ef-choice__content"><strong>Security advisories</strong><span>Limit reached</span></span>
    </label>
    <p class="ef-selection-status" data-ef-state="valid" aria-live="polite">3 of 3 selected. Limit reached.</p>
  </fieldset>
</ef-multi-choice>`
    },
    {
      id: "exclusive-selected",
      title: "Exclusive option chosen",
      description: "The user picked \"I don't use any of these\". The application has cleared the other checkboxes; the dashed exclusive card and its \"Exclusive option\" text make the rule visible without relying on border style alone.",
      html: `<ef-multi-choice class="ef-component-tag">
  <fieldset class="ef-choice-group" aria-describedby="multi-choice-exclusive-selected-guidance">
    <legend class="ef-choice-group__legend">Which of these tools does your team use?</legend>
    <p class="ef-selection-guidance" id="multi-choice-exclusive-selected-guidance">Choose at least 1. “I don't use any of these” cannot be combined with another option.</p>
    <label class="ef-choice">
      <input type="checkbox" name="multi-choice-exclusive-selected-tools" value="tracker">
      <span class="ef-choice__content"><strong>Issue tracker</strong></span>
    </label>
    <label class="ef-choice">
      <input type="checkbox" name="multi-choice-exclusive-selected-tools" value="wiki">
      <span class="ef-choice__content"><strong>Team wiki</strong></span>
    </label>
    <label class="ef-choice ef-choice--exclusive">
      <input type="checkbox" name="multi-choice-exclusive-selected-tools" value="none" checked>
      <span class="ef-choice__content"><strong>I don't use any of these</strong><span>Exclusive option</span></span>
    </label>
    <p class="ef-selection-status" data-ef-state="valid" aria-live="polite">1 selected: I don't use any of these.</p>
  </fieldset>
</ef-multi-choice>`
    },
    {
      id: "mobile-range-rule",
      title: "Between-two-and-four rule on a phone",
      description: "A range rule with one option checked at phone width. The guidance, cards and status all stack and wrap; the status reports that more selections are needed.",
      mobile: {
        height: 480,
        notes: [
          "Guidance, option cards and the status line stack in one column and wrap long text; nothing scrolls horizontally at 320px.",
          "Each card spans the full width and is at least 3.25rem tall, so checking an option is an easy tap anywhere on the card.",
          "The status line stays directly after the last option, so it is visible right after the user acts rather than far away at the top.",
          "No breakpoint changes the layout; the list is already single-column."
        ]
      },
      html: `<ef-multi-choice class="ef-component-tag">
  <fieldset class="ef-choice-group" aria-describedby="multi-choice-mobile-range-rule-guidance">
    <legend class="ef-choice-group__legend">Pick the days you can attend on-site training.</legend>
    <p class="ef-selection-guidance" id="multi-choice-mobile-range-rule-guidance">Choose between 2 and 4 days.</p>
    <label class="ef-choice">
      <input type="checkbox" name="multi-choice-mobile-range-rule-days" value="mon" checked>
      <span class="ef-choice__content"><strong>Monday</strong></span>
    </label>
    <label class="ef-choice">
      <input type="checkbox" name="multi-choice-mobile-range-rule-days" value="tue">
      <span class="ef-choice__content"><strong>Tuesday</strong></span>
    </label>
    <label class="ef-choice">
      <input type="checkbox" name="multi-choice-mobile-range-rule-days" value="wed">
      <span class="ef-choice__content"><strong>Wednesday</strong><span>Afternoon session only</span></span>
    </label>
    <label class="ef-choice">
      <input type="checkbox" name="multi-choice-mobile-range-rule-days" value="thu">
      <span class="ef-choice__content"><strong>Thursday</strong></span>
    </label>
    <p class="ef-selection-status" data-ef-state="incomplete" aria-live="polite">1 of at least 2 selected.</p>
  </fieldset>
</ef-multi-choice>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "checkbox", default: "—", description: "Required. Each option is a native checkbox; the card draws a square indicator for checkboxes." },
      { name: "name", on: "input", values: "string", default: "—", description: "Usually shared by all options so the form submits one name with several values." },
      { name: "value", on: "input", values: "string", default: "\"on\"", description: "Submitted value for each checked option." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Initial selection." },
      { name: "disabled", on: "input", values: "boolean", default: "absent", description: "Used by the application to prevent exceeding a maximum; dims the card." },
      { name: "aria-describedby", on: "fieldset", values: "id of .ef-selection-guidance", default: "—", description: "Associates the selection rule with the group so it is announced on entry." },
      { name: "aria-live", on: ".ef-selection-status", values: "polite", default: "—", description: "Announces the application's updated count without interrupting." },
      { name: "data-ef-state", on: ".ef-selection-status", values: "incomplete | valid (application vocabulary)", default: "—", description: "Records the application's cardinality state for tests and integrations. Forma does not style it; the text carries the meaning." }
    ],
    hooks: {
      "ef-selection-guidance": "Secondary-color, small text stating the selection rule; placed after the legend and before the options.",
      "ef-selection-status": "Small, semi-bold status text after the options reporting the current count. It has no color states; the wording must say whether the rule is met."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through each checkbox in turn; every enabled option is its own tab stop." },
      { keys: "Space", action: "Toggles the focused checkbox (native behavior)." }
    ],
    events: [
      { name: "input / change", description: "Native events from each checkbox. The application listens for change to update the status, disable options at a maximum, and clear others when an exclusive option is checked." }
    ],
    form: "Each checked option submits name=value. Checkboxes have no native minimum or maximum count; the application validates cardinality and reports it. Form reset restores initial checked states but does not update the status text."
  },
  states: [
    { name: "Unchecked / checked", how: ":checked", description: "Checked cards show a filled square, accent border and secondary surface; forced-colors mode uses Highlight." },
    { name: "Incomplete", how: "status text, e.g. data-ef-state=\"incomplete\"", description: "Fewer selections than the rule requires. Expressed only by the status wording." },
    { name: "Rule met", how: "status text, e.g. data-ef-state=\"valid\"", description: "The count satisfies the rule." },
    { name: "Limit reached", how: "disabled on remaining options plus status text", description: "The application prevents further selection and says so." },
    { name: "Exclusive option", how: "class ef-choice--exclusive plus visible text", description: "Dashed card border and an explanatory line. The application clears other options when it is checked." },
    { name: "Focus", how: ":focus-visible on a checkbox", description: "Two-tone focus ring around the card." }
  ],
  accessibility: {
    forma: [
      "Keeps each option a native checkbox inside its label, so name, checked state and Space toggling come from the platform.",
      "Shows checked state with a filled square in addition to border and surface color, and with Highlight in forced-colors mode.",
      "Provides visible guidance and status text styles so the rule and the count are never color- or icon-only."
    ],
    consumer: [
      "State the rule in `ef-selection-guidance` and link it to the fieldset with aria-describedby.",
      "Update `ef-selection-status` text after each change; keep it concise so the live announcement is short.",
      "Enforce minimum, maximum and exclusivity in application code and explain any disabled option.",
      "Label exclusive options in text (\"Exclusive option\"), not only with the dashed border."
    ]
  },
  responsive: [
    "Single-column cards at every width; long option text, guidance and status wrap.",
    "No breakpoints; the status stays after the options in source order.",
    "Large option sets remain one scrolling list; do not switch to horizontal layouts on phones."
  ],
  motion: [
    "Card background, border and text color change by perceptual interpolation (about 120ms); nothing moves. Checked state is applied immediately.",
    "The guidance and status text do not animate. Under `prefers-reduced-motion: reduce` the color transition is effectively instant."
  ],
  guidance: {
    do: [
      "Write the rule as a number (\"Choose up to 3\") rather than an adjective (\"a few\").",
      "Keep the status next to the options and update it on every change."
    ],
    avoid: [
      "Silently unchecking options when an exclusive answer is chosen without the guidance saying so.",
      "Blocking the user with a disabled submit button instead of explaining the rule.",
      "Using a switch list when the answers are part of one question."
    ]
  },
  related: [
    { slug: "choice-group", note: "Single-answer version of the same cards." },
    { slug: "checkbox", note: "Use for a single checkbox or independent checkboxes that are not one question." },
    { slug: "hierarchical-multi-choice", note: "Use when options are nested under categories." },
    { slug: "image-choice", note: "Use when each option needs a picture beside its text." },
    { slug: "special-choice", note: "Use for Don't know or Prefer not to say answers in assessment questions." }
  ]
};
