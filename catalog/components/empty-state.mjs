export default {
  name: "Empty state",
  category: "feedback",
  behavior: "Application content",
  summary: "Explains an empty result and offers a useful recovery action without treating absence as failure.",
  purpose: {
    description: "An empty state fills the space where a list, table or search result would be when there is nothing to show, and tells the user why and what to do next. Forma renders a centered, dashed-border section with a decorative symbol, a heading, supporting text and actions. The application decides that the result is truly empty (not loading, not failed, not unknown) and supplies the explanation and actions.",
    useWhen: [
      "A collection has no records yet and the user can create the first one.",
      "Filters or a search query exclude every record and the user can broaden them.",
      "A queue or inbox has been fully worked and that is a normal, good outcome."
    ],
    avoidWhen: [
      "Data is still loading: use [[skeleton]] or [[spinner]]. Loading is not empty.",
      "The request failed or the result is unknown: use [[alert]], [[operation-status]] or a fault pattern. Unknown is not empty.",
      "Only part of the data could be retrieved: say so with [[state-survivability]] rather than presenting the missing part as empty."
    ],
    characteristics: [
      "The dashed border signals a placeholder region rather than a message about a problem.",
      "Content is centered and generously padded, and the padding scales with viewport width.",
      "The symbol is decorative; the heading carries the explanation."
    ]
  },
  examples: [
    {
      id: "first-use",
      title: "First use",
      description: "A collection that has never had records. The heading names the object, the text says what it is for, and the primary action creates the first one.",
      html: `<ef-empty-state class="ef-component-tag">
  <section class="ef-empty-state" aria-labelledby="empty-state-first-use-title">
    <div class="ef-empty-state__symbol" aria-hidden="true">+</div>
    <h3 id="empty-state-first-use-title">No vendors yet</h3>
    <p>Vendors you add here can be selected on purchase orders and invoices.</p>
    <button type="button">Add vendor</button>
  </section>
</ef-empty-state>`
    },
    {
      id: "search-no-matches",
      title: "Search with no matches",
      description: "A search that returned nothing. The query is repeated so the user can spot a typo, and two recovery actions are grouped in a [[cluster]]: clear the search or open help.",
      html: `<ef-empty-state class="ef-component-tag">
  <section class="ef-empty-state" aria-labelledby="empty-state-search-no-matches-title">
    <div class="ef-empty-state__symbol" aria-hidden="true">?</div>
    <h3 id="empty-state-search-no-matches-title">No records match "reconcilation"</h3>
    <p>Check the spelling, or search by record number instead.</p>
    <div class="ef-cluster">
      <button type="button">Clear search</button>
      <a class="ef-button" href="#empty-state-search-no-matches-title">Search tips</a>
    </div>
  </section>
</ef-empty-state>`
    },
    {
      id: "queue-complete",
      title: "Work queue cleared",
      description: "An empty queue that is a good outcome. There is no action to take, so the empty state has only a heading and text; it must not look or read like an error.",
      html: `<ef-empty-state class="ef-component-tag">
  <section class="ef-empty-state" aria-labelledby="empty-state-queue-complete-title">
    <div class="ef-empty-state__symbol" aria-hidden="true">✓</div>
    <h3 id="empty-state-queue-complete-title">Nothing waiting for review</h3>
    <p>New items assigned to you will appear here.</p>
  </section>
</ef-empty-state>`
    },
    {
      id: "mobile-filtered-list",
      title: "Mobile filtered list",
      description: "A filtered list with no results at phone width, with a long heading and two actions.",
      mobile: {
        height: 400,
        notes: [
          "Vertical padding scales with `clamp(2rem, 8vw, 5rem)`, so the block is compact on phones and roomier on desktops.",
          "The heading and text are centered and wrap; very long headings stay inside the dashed border.",
          "Actions in a [[cluster]] wrap onto separate lines when they do not fit side by side, and keep native 44px-tall touch targets.",
          "Nothing scrolls horizontally at 320px in either orientation."
        ]
      },
      html: `<ef-empty-state class="ef-component-tag">
  <section class="ef-empty-state" aria-labelledby="empty-state-mobile-filtered-list-title">
    <div class="ef-empty-state__symbol" aria-hidden="true">□</div>
    <h3 id="empty-state-mobile-filtered-list-title">No open invoices from Northwind Traders in the last 30 days</h3>
    <p>Change the date range or remove the vendor filter.</p>
    <div class="ef-cluster">
      <button type="button">Clear filters</button>
      <button type="button">Last 90 days</button>
    </div>
  </section>
</ef-empty-state>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-empty-state", values: "id of the heading", default: "—", description: "Names the section so it is exposed as a labelled region." },
      { name: "aria-hidden", on: ".ef-empty-state__symbol", values: "true", default: "—", description: "Hides the decorative symbol." },
      { name: "type", on: "button", values: "button", default: "—", description: "Keeps recovery actions from submitting a surrounding form." }
    ],
    hooks: {
      "ef-empty-state": "Root section: centered grid with dashed border and viewport-scaled vertical padding. Removes heading and paragraph margins.",
      "ef-empty-state__symbol": "Bordered 2rem square holding a short text glyph. Decorative."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the recovery actions. The empty state itself is not focusable." }
    ],
    events: [
      { name: "click", description: "Native click on recovery buttons or links. The application performs the action." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Empty with action", how: "heading, text and one or more buttons or links", description: "The user can change the situation, such as adding a record or clearing filters." },
    { name: "Empty as a good outcome", how: "heading and text only", description: "Nothing needs doing; the text confirms that and says what will appear later." }
  ],
  accessibility: {
    forma: [
      "Uses a labelled section with a real heading, so the empty region is discoverable by heading and landmark navigation.",
      "Keeps the symbol decorative and relies on text for meaning.",
      "Uses a dashed border rather than color to mark the region."
    ],
    consumer: [
      "Only render an empty state when the application knows the result is empty; show loading, error or unknown states otherwise.",
      "Choose a heading level that fits the surrounding document outline.",
      "When the empty state replaces results after a filter or search, announce the result count through an existing status region, since the empty state has no live role."
    ]
  },
  responsive: [
    "The grid centers every child and sizes to its container; there are no breakpoints.",
    "Vertical padding is `clamp(2rem, 8vw, 5rem)` and horizontal padding is a fixed 1.25rem.",
    "Long headings and text wrap within the border."
  ],
  motion: [
    "No animation: the empty state appears and disappears with the application's content change."
  ],
  guidance: {
    do: [
      "Explain why the result is empty in the user's terms (no records yet, filters too narrow, all done).",
      "Offer the single most useful next action."
    ],
    avoid: [
      "Using the empty state as an error message or while data is still loading.",
      "Illustrations or symbols that carry information the text does not."
    ]
  },
  related: [
    { slug: "skeleton", note: "Placeholder while content is loading, before emptiness is known." },
    { slug: "alert", note: "Report failures or warnings, which are not the same as an empty result." },
    { slug: "collection-toolbar", note: "The search and filter controls whose result an empty state often describes." },
    { slug: "active-filter-summary", note: "Shows which filters produced the empty result and lets the user remove them." }
  ]
};
