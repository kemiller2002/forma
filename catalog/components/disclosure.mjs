export default {
  name: "Disclosure",
  category: "overlays",
  behavior: "Native HTML",
  summary: "Expandable content built on details and summary with no runtime behavior layer; where interpolate-size is supported the panel settles to its intrinsic height, otherwise it opens instantly.",
  purpose: {
    description: "A disclosure hides optional content behind a labelled row that the user opens when needed: advanced options, explanations, secondary detail. It is a native `details` element with `class=\"ef-disclosure\"`, a `summary`, and an `ef-disclosure__content` wrapper. The browser owns the open state (`open` attribute), keyboard toggling, the expanded announcement, find-in-page auto-expansion, and exclusive accordions via the `name` attribute. Forma draws top and bottom rules, a 44px summary row with a \"+\" indicator that turns to \"×\" when open, and light entry motion. Content inside stays in normal flow and pushes the page down.",
    useWhen: [
      "Content is optional or secondary and most users do not need it.",
      "A long page of questions and answers or settings should be scannable by heading first.",
      "Advanced form fields should be available without crowding the common case."
    ],
    avoidWhen: [
      "The hidden content is needed to understand consequential state, scope or unresolved work: keep that visible and disclose only the evidence with [[overview-disclosure]].",
      "The content is commands: use [[overflow-command-disclosure]] or [[menu]].",
      "Sections are peers the user switches between: use [[tabs]].",
      "The content should overlay the page: use [[popover]]."
    ],
    characteristics: [
      "Native details/summary; no script and no second state machine.",
      "The whole summary row is at least 44px tall and toggles the content.",
      "Open and closed are shown by the indicator's shape (+ versus ×), not color.",
      "Adjacent disclosures share a single rule between them, forming a stacked list."
    ]
  },
  examples: [
    {
      id: "exclusive-faq",
      title: "Exclusive FAQ list",
      description: "Three adjacent disclosures sharing `name=\"disclosure-exclusive-faq\"`, so opening one closes the others (a native exclusive accordion in supporting browsers; elsewhere they open independently). Adjacent rules collapse into single dividers.",
      html: `<ef-disclosure class="ef-component-tag">
  <div>
    <details class="ef-disclosure" name="disclosure-exclusive-faq" open>
      <summary>Can I change my plan later?</summary>
      <div class="ef-disclosure__content">
        <p>Yes. Upgrades apply immediately; downgrades apply at the start of the next billing period.</p>
      </div>
    </details>
    <details class="ef-disclosure" name="disclosure-exclusive-faq">
      <summary>What happens to my data if I cancel?</summary>
      <div class="ef-disclosure__content">
        <p>Your workspace becomes read-only for 30 days so you can export it. After that it is deleted.</p>
      </div>
    </details>
    <details class="ef-disclosure" name="disclosure-exclusive-faq">
      <summary>Do you offer discounts for non-profits?</summary>
      <div class="ef-disclosure__content">
        <p>Registered non-profits receive 40% off any paid plan. Contact support with your registration number.</p>
      </div>
    </details>
  </div>
</ef-disclosure>`
    },
    {
      id: "advanced-fields-open",
      title: "Advanced settings open with fields",
      description: "A disclosure that starts open because the user changed one of its fields last time. It contains form fields, which submit whether the disclosure is open or closed. The standard motion weight gives the larger panel a slightly slower settle.",
      html: `<ef-disclosure class="ef-component-tag">
  <details class="ef-disclosure" data-ef-motion-weight="standard" open>
    <summary>Advanced delivery settings</summary>
    <div class="ef-disclosure__content ef-stack">
      <div class="ef-field">
        <label class="ef-field__label" for="disclosure-advanced-fields-open-retries">Retry attempts</label>
        <p class="ef-field__description" id="disclosure-advanced-fields-open-retries-help">How many times to retry a failed webhook before giving up.</p>
        <input id="disclosure-advanced-fields-open-retries" name="retries" type="number" min="0" max="10" value="3" aria-describedby="disclosure-advanced-fields-open-retries-help">
      </div>
      <div class="ef-field">
        <label class="ef-field__label" for="disclosure-advanced-fields-open-timeout">Timeout in seconds</label>
        <input id="disclosure-advanced-fields-open-timeout" name="timeout" type="number" min="1" max="60" value="10">
      </div>
    </div>
  </details>
</ef-disclosure>`
    },
    {
      id: "mobile-long-summary",
      title: "Long summary on a phone",
      description: "A disclosure with a long, translated summary at phone width. The summary text wraps beside the indicator, and the row stays a single tap target.",
      mobile: {
        height: 300,
        notes: [
          "The summary is a flex row: the text wraps onto several lines while the + / × indicator stays at the inline end.",
          "The row is at least 44px tall and grows with the wrapped text; tapping anywhere on it toggles the content.",
          "Opened content is in normal flow and pushes the page down; nothing overlays or scrolls sideways at 320px.",
          "There are no breakpoints; orientation changes only reflow the text."
        ]
      },
      html: `<ef-disclosure class="ef-component-tag">
  <details class="ef-disclosure" lang="fr">
    <summary>Pourquoi certaines transactions apparaissent-elles deux fois sur mon relevé mensuel ?</summary>
    <div class="ef-disclosure__content">
      <p>Une préautorisation peut apparaître avant le débit définitif. Elle disparaît généralement sous trois jours ouvrés.</p>
    </div>
  </details>
</ef-disclosure>`
    }
  ],
  api: {
    attributes: [
      { name: "open", on: "details", values: "boolean", default: "absent (closed)", description: "Initial open state. The browser adds and removes it as the user toggles." },
      { name: "name", on: "details", values: "string", default: "absent", description: "Groups disclosures into an exclusive accordion: opening one closes the others with the same name. Supported in current browsers; elsewhere each opens independently." },
      { name: "data-ef-motion-weight", on: "details", values: "light | standard | heavy", default: "light", description: "Presentation-only perceived mass for the indicator and content settle." }
    ],
    hooks: {
      "ef-disclosure": "The details element: top and bottom functional rules; a following `.ef-disclosure` drops its top rule so stacks share dividers. Its summary becomes a 44px flex row with the native marker removed and a + / × indicator.",
      "ef-disclosure__content": "Wrapper for the revealed content, with bottom padding and the entry fade and settle.",
      "open": "Native open state. `[open]` rotates the indicator 45° (+ becomes ×) and, where supported, lets `::details-content` settle to its intrinsic height.",
      "data-ef-motion-weight": "Presentation-only perceived mass: light (default for disclosures), standard or heavy."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus to the summary, then into the open content." },
      { keys: "Enter / Space", action: "Toggles the disclosure (native summary behavior)." }
    ],
    events: [
      { name: "toggle", description: "Native event fired on the details element after it opens or closes." }
    ],
    form: "Fields inside a closed disclosure still belong to their form and are submitted. Invalid fields inside a closed disclosure can block submission out of sight; keep required fields outside or open the disclosure on error."
  },
  states: [
    { name: "Closed", how: "no open attribute", description: "Only the summary row is shown, with a + indicator." },
    { name: "Open", how: "details[open]", description: "Content visible below the summary; indicator rotated to ×." },
    { name: "Pressed", how: ":active on summary", description: "The indicator scales down slightly while pressed; the row does not move." },
    { name: "Focus", how: ":focus-visible on summary", description: "Shared two-tone focus ring on the summary." }
  ],
  accessibility: {
    forma: [
      "Uses native details/summary, so the summary is a focusable disclosure button with an announced expanded state.",
      "Keeps a 44px summary row and a shape-based open/closed indicator that does not rely on color.",
      "Keeps content in normal flow and supports find-in-page expansion of closed content where the browser does."
    ],
    consumer: [
      "Write summaries that say what is inside (\"Advanced delivery settings\"), not \"More\".",
      "Do not hide information needed to make a decision; use [[overview-disclosure]] for consequential state.",
      "Do not put interactive elements inside `summary`.",
      "Add a heading inside the content, or wrap the summary text in a heading, when disclosures form part of the page outline."
    ]
  },
  responsive: [
    "Intrinsic sizing: the disclosure fills its container; the summary text wraps beside the indicator.",
    "Content reflows in normal flow; there is no fixed height and no horizontal overflow.",
    "No breakpoints."
  ],
  motion: [
    "The + indicator rotates to × over the light inertial duration with spring easing; pressing the summary briefly scales the indicator with damped easing.",
    "Newly opened content fades in (perceptual) and settles from 0.25rem above (inertial, damped) using `@starting-style`.",
    "Where `interpolate-size` and `::details-content` are supported, the content region animates its block size from 0 to its intrinsic height with the inertial duration; elsewhere it opens instantly. The native open state is always immediate.",
    "`data-ef-motion-weight` changes perceived mass (light by default).",
    "Under `prefers-reduced-motion: reduce` the height transition is removed entirely (so content is never delayed), and the indicator and content transitions become effectively instant."
  ],
  guidance: {
    do: [
      "Group related disclosures as adjacent siblings so they read as one list.",
      "Use `name` for exclusive accordions only when comparing sections side by side is not useful."
    ],
    avoid: [
      "Nesting disclosures more than one level deep.",
      "Hiding required fields or error messages inside a closed disclosure.",
      "Adding your own open/closed classes; the `open` attribute is the only state."
    ]
  },
  related: [
    { slug: "overview-disclosure", note: "Keeps consequential state visible while only evidence is disclosed." },
    { slug: "overflow-command-disclosure", note: "Disclosure for secondary commands rather than content." },
    { slug: "tabs", note: "Switch between peer panels instead of expanding them in place." },
    { slug: "popover", note: "Supplemental content that overlays the page instead of pushing it down." }
  ]
};
