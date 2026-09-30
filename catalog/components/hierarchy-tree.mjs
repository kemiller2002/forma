export default {
  name: "Hierarchy tree",
  category: "navigation",
  behavior: "Native HTML / application",
  summary: "Uses semantic nesting and native disclosure for parent-child navigation without inventing tree behavior.",
  purpose: {
    description: "A hierarchy tree lets users browse and navigate a nested structure such as a repository, organisation or document outline. It is deliberately not an ARIA `tree` widget: it is a labelled `nav` of nested lists, where each branch is a native `details`/`summary` disclosure and each leaf is a link. The browser owns expand and collapse, keyboard access is ordinary Tab order, and the current page is marked with `aria-current=\"page\"`. The application decides which branches start open and supplies the links.",
    useWhen: [
      "Navigation destinations form a hierarchy of a few levels that users browse.",
      "Branches should be collapsible so the tree stays scannable.",
      "A simple, robust structure is preferred over a scripted tree with arrow-key behavior."
    ],
    avoidWhen: [
      "Users select values from a hierarchy in a form: use [[hierarchical-choice]] or [[hierarchical-multi-choice]].",
      "Only the path to the current item is needed: use [[scope-trail]].",
      "The hierarchy is large and needs type-ahead, arrow-key navigation or lazy loading: build an application tree widget on top of Forma styling.",
      "There are only a few flat destinations: use [[navigation-shell]]."
    ],
    characteristics: [
      "Semantic nesting (ul inside li) conveys depth; indentation is 1rem per level.",
      "Branch summaries and leaf links are at least 44px tall.",
      "The current page link is bold in addition to `aria-current`.",
      "Known gap: summaries are rendered as flex rows, which removes the browser's disclosure triangle in Chromium-based browsers, so there is currently no visual open/closed marker. Expanded state is still exposed programmatically by details."
    ]
  },
  examples: [
    {
      id: "collapsed-siblings",
      title: "Current page deep in the tree",
      description: "Only the branches on the path to the current page are open; sibling branches are collapsed so the tree stays short. The application sets open on the ancestors of the current page.",
      html: `<ef-hierarchy-tree class="ef-component-tag">
  <nav class="ef-hierarchy-tree" aria-label="Documentation sections">
    <ul>
      <li><details><summary>Getting started</summary><ul>
        <li><a href="#tree-collapsed-install">Installation</a></li>
        <li><a href="#tree-collapsed-first">Your first project</a></li>
      </ul></details></li>
      <li><details open><summary>Guides</summary><ul>
        <li><details open><summary>Deployment</summary><ul>
          <li><a href="#tree-collapsed-containers">Containers</a></li>
          <li><a href="#tree-collapsed-rollbacks" aria-current="page">Rollbacks</a></li>
        </ul></details></li>
        <li><details><summary>Monitoring</summary><ul>
          <li><a href="#tree-collapsed-alerts">Alerts</a></li>
        </ul></details></li>
      </ul></details></li>
      <li><a href="#tree-collapsed-changelog">Changelog</a></li>
    </ul>
  </nav>
</ef-hierarchy-tree>`
    },
    {
      id: "branch-overview-links",
      title: "Branches that are also destinations",
      description: "When a branch has its own page, the summary stays a plain toggle and the branch page is the first child link. Putting a link inside the summary would create a nested interactive control.",
      html: `<ef-hierarchy-tree class="ef-component-tag">
  <nav class="ef-hierarchy-tree" aria-label="Organisation">
    <ul>
      <li><details open><summary>Engineering</summary><ul>
        <li><a href="#tree-overview-engineering" aria-current="page">Engineering overview</a></li>
        <li><details><summary>Platform</summary><ul>
          <li><a href="#tree-overview-platform">Platform overview</a></li>
          <li><a href="#tree-overview-sre">Site reliability</a></li>
        </ul></details></li>
        <li><a href="#tree-overview-security">Security</a></li>
      </ul></details></li>
      <li><details><summary>Operations</summary><ul>
        <li><a href="#tree-overview-operations">Operations overview</a></li>
      </ul></details></li>
    </ul>
  </nav>
</ef-hierarchy-tree>`
    },
    {
      id: "mobile-reduced-indent",
      title: "Deep tree on a phone",
      description: "Four levels at phone width. Indentation per level halves below 30rem so deep items keep usable width.",
      mobile: {
        height: 460,
        notes: [
          "Below 30rem each nested list indents by 0.5rem instead of 1rem, so four levels cost 1.5rem rather than 3rem of width.",
          "Summaries and links remain at least 44px tall; the whole summary row toggles its branch on tap.",
          "Long names wrap within their row; there is no horizontal scrolling.",
          "Depth is still conveyed by list nesting for assistive technology even though the visual indent is smaller."
        ]
      },
      html: `<ef-hierarchy-tree class="ef-component-tag">
  <nav class="ef-hierarchy-tree" aria-label="Repository">
    <ul>
      <li><details open><summary>services</summary><ul>
        <li><details open><summary>checkout</summary><ul>
          <li><details open><summary>payment-gateway</summary><ul>
            <li><a href="#tree-mobile-readme" aria-current="page">README</a></li>
            <li><a href="#tree-mobile-config">configuration reference for regional providers</a></li>
          </ul></details></li>
          <li><a href="#tree-mobile-cart">cart</a></li>
        </ul></details></li>
      </ul></details></li>
    </ul>
  </nav>
</ef-hierarchy-tree>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "nav", values: "string", default: "—", description: "Names the navigation landmark." },
      { name: "open", on: "details", values: "boolean", default: "absent (collapsed)", description: "Initial expanded state set by the application, typically on the ancestors of the current page. The browser toggles it afterwards." },
      { name: "aria-current", on: "link", values: "page", default: "absent", description: "Marks the current page; Forma renders it bold." },
      { name: "href", on: "links", values: "URL", default: "—", description: "Destination for each leaf or branch overview." }
    ],
    hooks: {
      "ef-hierarchy-tree": "Root nav. Nested lists lose bullets and indent 1rem per level (0.5rem below 30rem); summaries and links become 44px flex rows; [aria-current=\"page\"] is bold."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through visible summaries and links in document order; content inside collapsed branches is skipped." },
      { keys: "Enter / Space on a summary", action: "Expands or collapses that branch (native details behavior)." },
      { keys: "Enter on a link", action: "Follows the link." },
      { keys: "Arrow keys", action: "No tree navigation. Forma does not implement role=\"tree\"; arrow keys scroll the page as usual." }
    ],
    events: [
      { name: "toggle", description: "Native event from each details element when it opens or closes." }
    ],
    form: "Does not participate in forms."
  },
  states: [
    { name: "Collapsed branch", how: "details without open", description: "Only the summary is shown; children are hidden and unfocusable. There is no visual marker distinguishing a collapsed branch from a leaf beyond the missing children and the lack of link styling." },
    { name: "Expanded branch", how: "details[open]", description: "Children listed and indented beneath the summary." },
    { name: "Current page", how: "aria-current=\"page\"", description: "Link text is bold." },
    { name: "Focus", how: ":focus-visible", description: "Foundation two-tone focus ring on the summary or link." }
  ],
  accessibility: {
    forma: [
      "Uses native disclosure and list semantics, so expanded state, depth and item counts come from the platform without an ARIA tree contract.",
      "Gives branches and links 44px targets.",
      "Marks the current page with weight in addition to aria-current."
    ],
    consumer: [
      "Open the branches on the path to the current page.",
      "Until Forma restores a visible disclosure marker, make branch labels recognisable as groups (for example plural nouns) so sighted users can tell them from leaf links.",
      "Keep summaries as plain text; put branch pages in a child link rather than inside the summary.",
      "If you add role=\"tree\" and arrow-key navigation, implement the full ARIA tree pattern in the application."
    ]
  },
  responsive: [
    "Indent is 1rem per level, reduced to 0.5rem below 30rem.",
    "Rows are flex containers with a 44px minimum height; text wraps.",
    "No horizontal scroll; very deep trees simply become narrower at each level."
  ],
  motion: [
    "No animation: branches open and close instantly with native details."
  ],
  guidance: {
    do: [
      "Keep labels short and unique among siblings.",
      "Limit depth to what users can hold in mind, typically three or four levels."
    ],
    avoid: [
      "Adding role=\"tree\" without implementing the keyboard model it promises.",
      "Placing links or buttons inside summary elements."
    ]
  },
  related: [
    { slug: "scope-trail", note: "Shows only the path to the current location." },
    { slug: "hierarchical-choice", note: "Selecting a value from a hierarchy in a form." },
    { slug: "disclosure", note: "A single collapsible section outside navigation." },
    { slug: "navigation-shell", note: "Frame that can host the tree as its persistent navigation." }
  ]
};
