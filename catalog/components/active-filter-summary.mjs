import { nasaSpaceflights } from "../example-data/nasa-spaceflight.mjs";

export default {
  name: "Active filter summary",
  category: "data",
  behavior: "Application content",
  summary: "Keeps active query refinements and scope visible while filter controls recompose.",
  purpose: {
    description: "An active filter summary lists every refinement currently applied to a collection, each as readable text with its own remove button, plus a Clear all action. It keeps the query state visible when the filter controls themselves are collapsed into a disclosure, [[flyout]] or phone layout. Forma provides the heading row and the wrapping list; the application supplies the filters, the wording, which ones can be removed, and what removing one does.",
    useWhen: [
      "Filters are applied from controls that can be hidden, such as a closed panel or a flyout.",
      "Users need to see and undo individual refinements without reopening the filter controls.",
      "A fixed scope (workspace, date range, tenant) applies and must be visible even if it cannot be removed here."
    ],
    avoidWhen: [
      "The filter controls are always fully visible next to the results: the summary would repeat them.",
      "Tags describe an item rather than a query: use [[badge]] or [[status-lozenge]] on the item.",
      "The user is choosing values rather than reviewing applied ones: use [[multi-choice]] or [[combobox]]."
    ],
    characteristics: [
      "Heading row is a wrapping flex row with the heading at the start and Clear all at the end.",
      "Filters are an unstyled `ul` laid out as a wrapping flex row with 0.5rem gaps.",
      "Each `li` pairs the filter text with its remove button; on phones the pair itself can wrap.",
      "Every part has `min-inline-size: 0`, so long filter values wrap instead of overflowing."
    ]
  },
  examples: [
    {
      id: "fixed-scope",
      title: "Fixed NASA scope with removable filters",
      description: "The reference collection is fixed by the page and therefore has no remove button. Program and crew-status filters can be removed independently.",
      html: `<ef-active-filter-summary class="ef-component-tag">
  <section class="ef-active-filter-summary" aria-labelledby="active-filter-summary-fixed-scope-title">
    <div class="ef-active-filter-summary__heading">
      <h2 id="active-filter-summary-fixed-scope-title">Showing missions matching</h2>
      <button type="button">Clear filters</button>
    </div>
    <ul class="ef-active-filter-summary__items">
      <li><span>Collection: ${nasaSpaceflights.length} NASA reference missions (fixed)</span></li>
      <li><span>Program: Apollo</span><button type="button" aria-label="Remove Program: Apollo filter">Remove</button></li>
      <li><span>Crew status: Crewed</span><button type="button" aria-label="Remove Crew status: Crewed filter">Remove</button></li>
    </ul>
  </section>
</ef-active-filter-summary>`
    },
    {
      id: "no-active-filters",
      title: "No mission filters applied",
      description: "After Clear all, the summary stays in place rather than disappearing and shifting the mission results. The clear button is omitted because there is nothing left to remove.",
      html: `<ef-active-filter-summary class="ef-component-tag">
  <section class="ef-active-filter-summary" aria-labelledby="active-filter-summary-no-active-filters-title">
    <div class="ef-active-filter-summary__heading">
      <h2 id="active-filter-summary-no-active-filters-title">Active filters</h2>
    </div>
    <p>No filters applied. Showing all ${nasaSpaceflights.length} reference missions.</p>
  </section>
</ef-active-filter-summary>`
    },
    {
      id: "mobile-many-filters",
      title: "Mobile mission summary with many filters",
      description: "Five mission filters on a phone. Filters wrap onto several rows and the long destination value wraps within its own item beside its remove button.",
      mobile: {
        height: 420,
        notes: [
          "Filters wrap onto as many rows as needed without horizontal page scrolling.",
          "Long values can wrap their remove button onto the next line.",
          "The heading row wraps so Clear all can move below the heading.",
          "Remove buttons retain comfortable touch sizing."
        ]
      },
      html: `<ef-active-filter-summary class="ef-component-tag">
  <section class="ef-active-filter-summary" aria-labelledby="active-filter-summary-mobile-many-filters-title">
    <div class="ef-active-filter-summary__heading">
      <h2 id="active-filter-summary-mobile-many-filters-title">Active filters</h2>
      <button type="button">Clear all</button>
    </div>
    <ul class="ef-active-filter-summary__items">
      <li><span>Program: Apollo</span><button type="button" aria-label="Remove Program: Apollo filter">Remove</button></li>
      <li><span>Crew status: Crewed</span><button type="button" aria-label="Remove Crew status: Crewed filter">Remove</button></li>
      <li><span>Destination: Sea of Tranquility, Moon</span><button type="button" aria-label="Remove destination filter">Remove</button></li>
      <li><span>Vehicle: Saturn V</span><button type="button" aria-label="Remove Vehicle: Saturn V filter">Remove</button></li>
      <li><span>Launch: before 1971</span><button type="button" aria-label="Remove launch date filter">Remove</button></li>
    </ul>
  </section>
</ef-active-filter-summary>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-active-filter-summary", values: "id of the heading", default: "—", description: "Names the summary region." },
      { name: "aria-label", on: "remove button", values: "\"Remove <filter> filter\"", default: "—", description: "Identifies which filter a Remove button removes; the visible label alone is ambiguous." },
      { name: "type", on: "button", values: "button", default: "—", description: "Remove and Clear all are native buttons handled by the application." }
    ],
    hooks: {
      "ef-active-filter-summary": "Root section; a grid with 0.5rem gaps.",
      "ef-active-filter-summary__heading": "Wrapping flex row with the heading (margin removed from its `h2`) and the Clear all action spaced apart.",
      "ef-active-filter-summary__items": "Unstyled list laid out as a wrapping flex row; each `li` is a flex pair of filter text and remove button, allowed to wrap at 30rem and below."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through Clear all and each remove button in order." },
      { keys: "Enter / Space", action: "Activates the focused button (native). The application removes the filter and re-queries." }
    ],
    events: [
      { name: "click", description: "Native click on Remove or Clear all; the application updates the query, the list and the result count." }
    ],
    form: "Not a form control. The filter values live in the application's query state."
  },
  states: [
    { name: "Filters applied", how: "li items in .ef-active-filter-summary__items", description: "One item per refinement, each with a remove button when removable." },
    { name: "Fixed scope", how: "li without a remove button", description: "Visible but not removable here; say so in the text." },
    { name: "No filters", how: "application replaces the list with text", description: "The summary states that no filters are applied." }
  ],
  accessibility: {
    forma: [
      "Uses a real list, so the number of active filters is announced.",
      "Keeps filter text and its remove button adjacent in DOM order.",
      "Wraps rather than truncating filter text, so the full value stays readable."
    ],
    consumer: [
      "Write each filter as \"Field: value\" text; do not rely on chip color.",
      "Give every remove button an accessible name naming its filter.",
      "After removing a filter, move focus to a sensible target (the next filter's button, or the heading when the list empties) and update the result count.",
      "Keep the summary in sync with the actual query, including filters set through the URL."
    ]
  },
  responsive: [
    "Filters wrap into rows at every width; the component never scrolls horizontally.",
    "At 30rem and below individual items can wrap their text and button onto separate lines.",
    "The heading row wraps Clear all under the heading when space runs out."
  ],
  motion: [
    "No animation: filters appear and disappear immediately when the application re-renders the list."
  ],
  guidance: {
    do: [
      "Place the summary between the filter controls and the results.",
      "Show fixed scope alongside user filters so users understand the full query."
    ],
    avoid: [
      "Hiding the summary when filters are hidden on phones; that is when it matters most.",
      "Visible labels such as \"×\" without an accessible name."
    ]
  },
  related: [
    { slug: "collection-toolbar", note: "Holds the search, filter, sort and view controls; the summary shows what they currently apply." },
    { slug: "scope-trail", note: "Shows the hierarchical location or scope a view is limited to." },
    { slug: "empty-state", note: "Explains an empty result and usually offers to clear the filters listed here." },
    { slug: "status-lozenge", note: "State of an item, not a query refinement." }
  ]
};
