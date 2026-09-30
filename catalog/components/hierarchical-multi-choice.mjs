export default {
  name: "Hierarchical multi-choice",
  category: "selection",
  behavior: "Application / Limen",
  summary: "Multi-selection across a hierarchy with application-owned propagation and selection rules.",
  purpose: {
    description: "Hierarchical multi-choice lets people check several items grouped under collapsible categories. It uses the same `ef-hierarchy` fieldset, `ef-hierarchy__tree` nested list and native `details`/`summary` branches as [[hierarchical-choice]], with native checkboxes instead of radios, and usually an `ef-selection-status` line reporting the count. Forma deliberately does not decide what a parent means: whether checking a category includes its children, whether a partly checked branch shows a mixed state (the `indeterminate` property can only be set by script), and how selections cascade or are validated are application or Limen rules. The native baseline is independent checkboxes that submit exactly what is checked.",
    useWhen: [
      "Several items can be chosen from a grouped set (affected services, notification categories, permissions by area).",
      "Users benefit from collapsing groups they do not need.",
      "The application has a clear, stated rule for what selecting a category means, or treats every item independently."
    ],
    avoidWhen: [
      "Only one item may be chosen: use [[hierarchical-choice]].",
      "The set is flat: use [[multi-choice]].",
      "Selections need drag, ranking or weights: use [[ranking]] or [[allocation]].",
      "The hierarchy is navigation: use [[hierarchy-tree]]."
    ],
    characteristics: [
      "Every item is an independent native checkbox; there is no built-in parent/child propagation.",
      "Categories are native disclosures with 44px summary rows and a guide line per branch.",
      "Counts and partial selection are communicated in text written by the application, not by color or a mixed-state glyph."
    ]
  },
  examples: [
    {
      id: "category-includes-children",
      title: "Category option that includes its children",
      description: "The application's rule is that \"All Platform services\" covers current and future Platform services. It is rendered as an explicit option whose description states the rule; the application, not Forma, keeps the child checkboxes consistent with it.",
      html: `<ef-hierarchical-multi-choice class="ef-component-tag">
  <fieldset class="ef-hierarchy" aria-describedby="hierarchical-multi-choice-category-includes-children-rule">
    <legend class="ef-hierarchy__legend">Send alerts for these services</legend>
    <p class="ef-selection-guidance" id="hierarchical-multi-choice-category-includes-children-rule">Choosing an “All” option also covers services added to that area later.</p>
    <ul class="ef-hierarchy__tree">
      <li>
        <details open>
          <summary>Platform</summary>
          <ul>
            <li><label><input type="checkbox" name="hierarchical-multi-choice-category-includes-children" value="platform-all" checked> All Platform services</label></li>
            <li><label><input type="checkbox" name="hierarchical-multi-choice-category-includes-children" value="identity" checked disabled> Identity (included)</label></li>
            <li><label><input type="checkbox" name="hierarchical-multi-choice-category-includes-children" value="billing" checked disabled> Billing (included)</label></li>
          </ul>
        </details>
      </li>
      <li>
        <details>
          <summary>Data</summary>
          <ul>
            <li><label><input type="checkbox" name="hierarchical-multi-choice-category-includes-children" value="data-all"> All Data services</label></li>
            <li><label><input type="checkbox" name="hierarchical-multi-choice-category-includes-children" value="warehouse"> Warehouse</label></li>
          </ul>
        </details>
      </li>
    </ul>
    <p class="ef-selection-status" data-ef-state="valid" aria-live="polite">All Platform services selected</p>
  </fieldset>
</ef-hierarchical-multi-choice>`
    },
    {
      id: "partial-branch-in-text",
      title: "Partial selection stated in the summary",
      description: "Items are independent. The application writes each branch's count into its summary, so a collapsed branch still tells the user that something inside it is checked. This replaces a mixed-state checkbox, which would need script.",
      html: `<ef-hierarchical-multi-choice class="ef-component-tag">
  <fieldset class="ef-hierarchy">
    <legend class="ef-hierarchy__legend">Which datasets should the export include?</legend>
    <ul class="ef-hierarchy__tree">
      <li>
        <details>
          <summary>Sales (1 of 3 selected)</summary>
          <ul>
            <li><label><input type="checkbox" name="hierarchical-multi-choice-partial-branch-in-text" value="orders" checked> Orders</label></li>
            <li><label><input type="checkbox" name="hierarchical-multi-choice-partial-branch-in-text" value="refunds"> Refunds</label></li>
            <li><label><input type="checkbox" name="hierarchical-multi-choice-partial-branch-in-text" value="quotes"> Quotes</label></li>
          </ul>
        </details>
      </li>
      <li>
        <details>
          <summary>Support (none selected)</summary>
          <ul>
            <li><label><input type="checkbox" name="hierarchical-multi-choice-partial-branch-in-text" value="tickets"> Tickets</label></li>
            <li><label><input type="checkbox" name="hierarchical-multi-choice-partial-branch-in-text" value="csat"> Satisfaction scores</label></li>
          </ul>
        </details>
      </li>
    </ul>
    <p class="ef-selection-status" data-ef-state="valid" aria-live="polite">1 dataset selected</p>
  </fieldset>
</ef-hierarchical-multi-choice>`
    },
    {
      id: "mobile-notification-areas",
      title: "Notification areas on a phone",
      description: "Two open branches with long item names at phone width, followed by the status line.",
      mobile: {
        height: 480,
        notes: [
          "At 44rem and below nested indentation shrinks to 0.75rem and branch padding to 0.5rem so item text keeps most of the width.",
          "Each checkbox row is at least 44px tall and the whole label row toggles the checkbox.",
          "Long names wrap within their row; there is no horizontal scrolling at 320px.",
          "The status line follows the tree in source order, so after scrolling to the end the user sees the count next to the last options."
        ]
      },
      html: `<ef-hierarchical-multi-choice class="ef-component-tag">
  <fieldset class="ef-hierarchy">
    <legend class="ef-hierarchy__legend">Notify me about</legend>
    <ul class="ef-hierarchy__tree">
      <li>
        <details open>
          <summary>Projects I own</summary>
          <ul>
            <li><label><input type="checkbox" name="hierarchical-multi-choice-mobile-notification-areas" value="owned-comments" checked> New comments on work items assigned to me</label></li>
            <li><label><input type="checkbox" name="hierarchical-multi-choice-mobile-notification-areas" value="owned-status"> Status changes made by other people</label></li>
          </ul>
        </details>
      </li>
      <li>
        <details open>
          <summary>Projects I follow</summary>
          <ul>
            <li><label><input type="checkbox" name="hierarchical-multi-choice-mobile-notification-areas" value="followed-releases" checked> Releases</label></li>
          </ul>
        </details>
      </li>
    </ul>
    <p class="ef-selection-status" data-ef-state="valid" aria-live="polite">2 notification types selected</p>
  </fieldset>
</ef-hierarchical-multi-choice>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "checkbox", default: "—", description: "Each item is an independent native checkbox." },
      { name: "name", on: "input", values: "string", default: "—", description: "Usually shared so the form submits one field with several values." },
      { name: "value", on: "input", values: "string", default: "\"on\"", description: "Immutable item identity supplied by the application." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Initial selection. The application sets it for children when its rules say a parent includes them." },
      { name: "disabled", on: "input", values: "boolean", default: "absent", description: "Used by the application for items that are implied by a parent choice or unavailable; disabled items are not submitted." },
      { name: "open", on: "details", values: "boolean", default: "absent", description: "Initial expanded state of a branch." },
      { name: "aria-describedby", on: "fieldset", values: "id", default: "—", description: "Links the application's selection rule to the group." },
      { name: "aria-live", on: ".ef-selection-status", values: "polite", default: "—", description: "Announces the application's updated count." },
      { name: "data-ef-state", on: ".ef-selection-status", values: "application vocabulary (for example valid, incomplete)", default: "—", description: "Unstyled marker of the application's selection state; the text carries the meaning." }
    ],
    hooks: {
      "ef-hierarchy": "Owned by [[hierarchical-choice]]. Fieldset reset plus branch guide lines and 44px summary and label rows.",
      "ef-hierarchy__legend": "The question above the tree.",
      "ef-hierarchy__tree": "Root list with no markers; nested lists are indented.",
      "ef-selection-status": "Owned by [[multi-choice]]. Small semi-bold count line after the tree.",
      "ef-selection-guidance": "Owned by [[multi-choice]]. States the application's selection rule before the tree."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through summaries and each rendered checkbox in document order. Items in collapsed branches are skipped until opened." },
      { keys: "Enter / Space on a summary", action: "Expands or collapses the branch (native)." },
      { keys: "Space on a checkbox", action: "Toggles that item only. Any cascade to other items is application behavior." }
    ],
    events: [
      { name: "change", description: "Native event from each checkbox. The application listens to apply propagation rules and update counts." },
      { name: "toggle", description: "Native event when a branch opens or closes." }
    ],
    form: "Submits one name=value per checked, enabled checkbox, including those in collapsed branches. Disabled \"included\" items are not submitted, so the application must interpret the parent value. There is no native minimum or maximum."
  },
  states: [
    { name: "Branch collapsed / expanded", how: "details open attribute", description: "Children are hidden or shown in flow. No expand marker is drawn in Chromium or Firefox because the summary is a flex row." },
    { name: "Item checked", how: ":checked", description: "Shown by the native checkbox." },
    { name: "Partial branch (application)", how: "summary or status text", description: "Forma has no mixed-state styling; write the count into the summary or status." },
    { name: "Implied by parent (application)", how: "checked + disabled with explanatory label text", description: "One way to show children covered by a parent choice; the wording must say so." },
    { name: "Focus", how: ":focus-visible", description: "Shared two-tone focus ring." }
  ],
  accessibility: {
    forma: [
      "Keeps native checkboxes and details/summary, so checked and expanded states are programmatic.",
      "Provides 44px rows, indentation and guide lines that do not depend on color.",
      "Provides text styles for the rule and the count."
    ],
    consumer: [
      "State the parent/child rule in visible guidance if parents imply children.",
      "Keep collapsed branches informative, for example by writing the selected count into the summary.",
      "If you set `indeterminate` with script, also expose the partial state in text.",
      "Update the status line after changes and keep it short.",
      "Own all propagation, validation and any tree keyboard model in Limen/application code."
    ]
  },
  responsive: [
    "Same as [[hierarchical-choice]]: rows wrap, indentation tightens at 44rem and below, and expanded branches grow the page vertically.",
    "The status line stays after the tree in source order at every width.",
    "No horizontal overflow at 320px for three levels of nesting with ordinary labels."
  ],
  motion: [
    "No animation: branches open instantly and checkboxes change immediately. Any cascade the application applies is instant too unless it adds its own motion, which must respect reduced motion."
  ],
  guidance: {
    do: [
      "Choose one propagation rule and apply it everywhere in the product.",
      "Say what will be submitted when a parent is chosen."
    ],
    avoid: [
      "Silently checking or unchecking items the user cannot see in a collapsed branch.",
      "Relying on a mixed-state glyph alone for partial selection.",
      "Putting checkboxes inside `summary`."
    ]
  },
  related: [
    { slug: "hierarchical-choice", note: "Single-choice version of the same tree, and the owner of the `ef-hierarchy` hooks." },
    { slug: "multi-choice", note: "Flat multi-selection with guidance and status text." },
    { slug: "checkbox", note: "Styled single checkbox for independent options outside a hierarchy." },
    { slug: "hierarchy-tree", note: "Use for navigation through a hierarchy." }
  ]
};
