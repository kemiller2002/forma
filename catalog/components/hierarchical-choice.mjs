export default {
  name: "Hierarchical choice",
  category: "selection",
  behavior: "Native baseline / application semantics",
  summary: "Nested native disclosure and radio structure for choosing one item from a hierarchy, without assigning parent-child domain meaning.",
  owns: ["ef-hierarchy"],
  purpose: {
    description: "Hierarchical choice presents options grouped under collapsible categories and lets the user pick exactly one. It is a `fieldset` (`ef-hierarchy`) with a legend and a nested list (`ef-hierarchy__tree`); each category is a native `details`/`summary`, and each option is a native radio inside a label, all sharing one `name`. The browser owns expand/collapse, selection, submission and reset. Forma provides indentation, a guide line per branch and 44px rows. What the hierarchy means is application data: whether a category itself can be chosen, whether branches start open, and how options are identified are decided by the application, and any tree keyboard model (arrow-key tree navigation, typeahead, lazy loading) is Limen behavior.",
    useWhen: [
      "One item is chosen from a set that is naturally grouped (services by platform, locations by region, categories by department).",
      "The full list is long enough that grouping helps, but short enough to render in the page.",
      "The hierarchy must work without script and keep native form submission."
    ],
    avoidWhen: [
      "Several items can be chosen: use [[hierarchical-multi-choice]].",
      "The options are flat or fewer than about eight: use [[choice-group]] or [[select]].",
      "The tree is navigation, not a form choice: use [[hierarchy-tree]].",
      "The list is large or loaded on demand and needs search: use [[combobox]] with application behavior."
    ],
    characteristics: [
      "One native radio group across the whole tree: only one option can be checked.",
      "Categories are native disclosures; the open state is the `open` attribute.",
      "Rows (summaries and option labels) are at least 44px tall.",
      "Each branch is marked with an inline-start guide line and indentation, not color."
    ]
  },
  examples: [
    {
      id: "parent-level-option",
      title: "Category-level option",
      description: "The application allows choosing a whole category, so it renders an explicit \"Any Data service\" option as the first child of the branch. Making the category selectable is expressed as an ordinary option with its own value, never by clicking the summary.",
      html: `<ef-hierarchical-choice class="ef-component-tag">
  <fieldset class="ef-hierarchy">
    <legend class="ef-hierarchy__legend">Where did the problem occur?</legend>
    <ul class="ef-hierarchy__tree">
      <li>
        <details open>
          <summary>Data</summary>
          <ul>
            <li><label><input type="radio" name="hierarchical-choice-parent-level-option" value="data-any"> Any Data service</label></li>
            <li><label><input type="radio" name="hierarchical-choice-parent-level-option" value="warehouse"> Warehouse</label></li>
            <li><label><input type="radio" name="hierarchical-choice-parent-level-option" value="analytics"> Analytics</label></li>
          </ul>
        </details>
      </li>
      <li>
        <details>
          <summary>Platform</summary>
          <ul>
            <li><label><input type="radio" name="hierarchical-choice-parent-level-option" value="platform-any"> Any Platform service</label></li>
            <li><label><input type="radio" name="hierarchical-choice-parent-level-option" value="identity"> Identity</label></li>
          </ul>
        </details>
      </li>
    </ul>
  </fieldset>
</ef-hierarchical-choice>`
    },
    {
      id: "restored-deep-selection",
      title: "Restored selection three levels deep",
      description: "A saved answer is restored. The application opens every branch on the path to the checked option and repeats the selection as text after the tree, so the answer is visible even if the user collapses the branch.",
      html: `<ef-hierarchical-choice class="ef-component-tag">
  <fieldset class="ef-hierarchy">
    <legend class="ef-hierarchy__legend">Primary office</legend>
    <ul class="ef-hierarchy__tree">
      <li>
        <details open>
          <summary>Europe</summary>
          <ul>
            <li>
              <details open>
                <summary>Germany</summary>
                <ul>
                  <li><label><input type="radio" name="hierarchical-choice-restored-deep-selection" value="berlin" checked> Berlin</label></li>
                  <li><label><input type="radio" name="hierarchical-choice-restored-deep-selection" value="munich"> Munich</label></li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>Ireland</summary>
                <ul>
                  <li><label><input type="radio" name="hierarchical-choice-restored-deep-selection" value="dublin"> Dublin</label></li>
                </ul>
              </details>
            </li>
          </ul>
        </details>
      </li>
      <li>
        <details>
          <summary>North America</summary>
          <ul>
            <li><label><input type="radio" name="hierarchical-choice-restored-deep-selection" value="toronto"> Toronto</label></li>
            <li><label><input type="radio" name="hierarchical-choice-restored-deep-selection" value="austin"> Austin</label></li>
          </ul>
        </details>
      </li>
    </ul>
    <p class="ef-selection-status" aria-live="polite">Selected: Europe › Germany › Berlin</p>
  </fieldset>
</ef-hierarchical-choice>`
    },
    {
      id: "mobile-nested-tree",
      title: "Nested tree on a phone",
      description: "A two-level hierarchy with long names at phone width. Indentation tightens at narrow widths so deep options keep most of the line for their text.",
      mobile: {
        height: 420,
        notes: [
          "At 44rem and below nested lists indent by 0.75rem and branches by 0.5rem (instead of 1.25rem and 0.75rem), so three levels still fit at 320px.",
          "Summaries and option rows stay at least 44px tall; the whole label row is the tap target for its radio.",
          "Long category and option names wrap within the row; nothing scrolls horizontally.",
          "Expanding a branch pushes the rest of the tree down in flow; there is no overlay or fixed height to clip it."
        ]
      },
      html: `<ef-hierarchical-choice class="ef-component-tag">
  <fieldset class="ef-hierarchy">
    <legend class="ef-hierarchy__legend">Which product area is this feedback about?</legend>
    <ul class="ef-hierarchy__tree">
      <li>
        <details open>
          <summary>Reporting and analytics workspace</summary>
          <ul>
            <li><label><input type="radio" name="hierarchical-choice-mobile-nested-tree" value="scheduled"> Scheduled report delivery by email</label></li>
            <li><label><input type="radio" name="hierarchical-choice-mobile-nested-tree" value="builder"> Dashboard builder</label></li>
          </ul>
        </details>
      </li>
      <li>
        <details>
          <summary>Administration</summary>
          <ul>
            <li><label><input type="radio" name="hierarchical-choice-mobile-nested-tree" value="sso"> Single sign-on configuration</label></li>
          </ul>
        </details>
      </li>
    </ul>
  </fieldset>
</ef-hierarchical-choice>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "radio", default: "—", description: "Single choice across the whole hierarchy." },
      { name: "name", on: "input", values: "string", default: "—", description: "One name for every radio in the tree, so only one can be checked. Unique per question on the page." },
      { name: "value", on: "input", values: "string", default: "\"on\"", description: "The application's immutable option identity, submitted for the chosen option." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Initial or restored selection. Open the branches that contain it." },
      { name: "open", on: "details", values: "boolean", default: "absent (collapsed)", description: "Initial expanded state of a branch. The browser toggles it afterwards." },
      { name: "aria-live", on: ".ef-selection-status", values: "polite", default: "—", description: "Optional. Announces an application-written summary of the current selection." }
    ],
    hooks: {
      "ef-hierarchy": "The fieldset: border and padding reset. Branch `details` get an inline-start guide line and padding; `summary` and `label` rows are 44px flex rows.",
      "ef-hierarchy__legend": "The question, in bold above the tree.",
      "ef-hierarchy__tree": "Root list with markers removed and no indentation; nested lists indent by 1.25rem (0.75rem at 44rem and below)."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between summaries and into the radio group (to the checked radio, or the first rendered one)." },
      { keys: "Enter / Space on a summary", action: "Expands or collapses that branch (native details behavior)." },
      { keys: "Arrow keys in the radio group", action: "Move to and select the previous or next radio of the same name in document order (native radio behavior). This is not tree navigation; radios inside collapsed branches are not rendered and cannot be reached until their branch is opened." },
      { keys: "Space on a radio", action: "Selects the focused radio when none is selected." }
    ],
    events: [
      { name: "change", description: "Native event from the newly selected radio." },
      { name: "toggle", description: "Native event on a details element when a branch opens or closes." }
    ],
    form: "Submits one name=value for the checked radio. `required` on one radio makes the whole tree required. A checked radio inside a collapsed branch is still submitted."
  },
  states: [
    { name: "Branch collapsed", how: "details without open", description: "Only the bold summary row is visible. The summary is laid out as a flex row, so no disclosure triangle is drawn in Chromium or Firefox; the platform announces collapsed." },
    { name: "Branch expanded", how: "details[open]", description: "Child options appear below the summary, indented, beside the branch guide line." },
    { name: "Option selected", how: ":checked radio", description: "Shown by the native radio control itself." },
    { name: "Focus", how: ":focus-visible", description: "Shared two-tone focus ring on the focused summary or radio." }
  ],
  accessibility: {
    forma: [
      "Keeps native details/summary and native radios, so expanded state, checked state and group membership are programmatic.",
      "Gives summary and option rows a 44px minimum height and makes the whole label row the target.",
      "Shows structure with indentation and a guide line, not color."
    ],
    consumer: [
      "Open the branches that contain the current selection, and consider repeating the selection as text outside the tree.",
      "Decide and explain whether a category can be chosen; express it as an explicit option, never as a clickable summary.",
      "Because collapsed summaries have no drawn expand marker, write summaries as category names users expect to open, and keep the first branch open where sensible.",
      "Implement any ARIA tree keyboard model, typeahead or lazy loading in Limen/application code.",
      "Keep option values stable; do not derive identity from position in the tree."
    ]
  },
  responsive: [
    "Rows wrap long text; the tree never forces horizontal overflow.",
    "At 44rem and below nested indentation and branch padding shrink so deep levels keep usable text width.",
    "Expanded branches are in flow; the page grows vertically.",
    "Very deep hierarchies still lose width per level; beyond three levels consider a stepwise selection instead."
  ],
  motion: [
    "No animation: branches open and close instantly with the native details state, and radio selection is immediate. There is nothing for reduced motion to remove."
  ],
  guidance: {
    do: [
      "Keep categories to two or three levels.",
      "Show the selected path in text when the tree is long."
    ],
    avoid: [
      "Putting radios or buttons inside `summary`.",
      "Inferring that selecting a category means all its children; that is a domain rule for the application.",
      "Collapsing the branch that contains the current answer on load."
    ]
  },
  related: [
    { slug: "hierarchical-multi-choice", note: "Same structure with checkboxes for several selections." },
    { slug: "hierarchy-tree", note: "Use for navigating a hierarchy of pages or records, not answering a question." },
    { slug: "choice-group", note: "Use for a short flat list of single-choice options." },
    { slug: "disclosure", note: "Use for a single styled expandable section of content." }
  ]
};
