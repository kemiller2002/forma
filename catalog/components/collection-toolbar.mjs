export default {
  name: "Collection toolbar",
  category: "data",
  behavior: "Application / Limen",
  summary: "A responsive composition for search, filters, sort, saved views, and result counts.",
  purpose: {
    description: "A collection toolbar sits above a list or [[data-grid]] and gathers the controls that shape it: a search form, a native `details` disclosure holding filters, sort and saved-view selects, and a result count in a `role=\"status\"` element. Forma lays these out in a three-area grid that recomposes on phones, keeping search first and the count visible. All controls are native; running the search, applying filters, sorting, persisting views and updating the count are application behavior (normally Limen).",
    useWhen: [
      "A collection of records can be searched, filtered, sorted or switched between saved views.",
      "The result count must stay visible and be announced when it changes.",
      "Secondary controls should collapse on phones without hiding the current filter state."
    ],
    avoidWhen: [
      "Only a search box is needed: use [[search]] on its own.",
      "Filters are numerous or complex enough to need their own surface: open them in a [[flyout]] from the toolbar and summarize them with [[active-filter-summary]].",
      "The controls act on selected rows (delete, assign): those are bulk actions, not collection shaping; keep them separate.",
      "The controls switch between unrelated sections of content: use [[tabs]]."
    ],
    characteristics: [
      "Desktop grid: search `minmax(14rem, 1.6fr)`, controls `minmax(0, 2fr)`, count `auto`, aligned to the bottom edge.",
      "Filters live in a native `details`; the panel is positioned over the content on wide screens and flows inline on phones.",
      "The filter summary carries the active-filter count as text, so state is visible while the panel is closed.",
      "The count uses small monospace text and never wraps."
    ]
  },
  examples: [
    {
      id: "active-filters",
      title: "Search term with active filters",
      description: "A search term and two applied filters. The filter panel is closed, but its summary text states \"2 active\", so the state stays visible. On wide screens the panel, when opened, is positioned over the content below the toolbar.",
      html: `<ef-collection-toolbar class="ef-component-tag">
  <section class="ef-collection-toolbar" aria-label="Invoice list controls">
    <form class="ef-search ef-collection-toolbar__search" role="search">
      <label class="ef-search__label" for="collection-toolbar-active-filters-search">Search invoices</label>
      <input id="collection-toolbar-active-filters-search" name="q" type="search" value="acme">
    </form>
    <div class="ef-collection-toolbar__controls">
      <details class="ef-collection-toolbar__filters">
        <summary>Filters <span class="ef-status-lozenge">2 active</span></summary>
        <div class="ef-collection-toolbar__filter-panel">
          <label>Status <select name="status"><option>Any status</option><option selected>Overdue</option><option>Paid</option></select></label>
          <label>Owner <select name="owner"><option>Anyone</option><option selected>Me</option></select></label>
          <button type="button">Clear filters</button>
        </div>
      </details>
      <label>Sort <select name="sort"><option>Due date, soonest</option><option>Amount, highest</option></select></label>
    </div>
    <p class="ef-collection-toolbar__count" role="status">3 invoices</p>
  </section>
</ef-collection-toolbar>`
    },
    {
      id: "no-results",
      title: "Search with no results",
      description: "A search that matches nothing. The count states 0 results in the status region; the filters summary shows none are active, so the user knows the search term alone caused the empty result.",
      html: `<ef-collection-toolbar class="ef-component-tag">
  <section class="ef-collection-toolbar" aria-label="Customer list controls">
    <form class="ef-search ef-collection-toolbar__search" role="search">
      <label class="ef-search__label" for="collection-toolbar-no-results-search">Search customers</label>
      <input id="collection-toolbar-no-results-search" name="q" type="search" value="northwnd">
    </form>
    <div class="ef-collection-toolbar__controls">
      <details class="ef-collection-toolbar__filters">
        <summary>Filters <span class="ef-status-lozenge">None active</span></summary>
        <div class="ef-collection-toolbar__filter-panel">
          <label>Region <select name="region"><option>All regions</option><option>Europe</option><option>North America</option></select></label>
        </div>
      </details>
      <label>Saved view <select name="view"><option>All customers</option><option>Key accounts</option></select></label>
    </div>
    <p class="ef-collection-toolbar__count" role="status">0 customers</p>
  </section>
</ef-collection-toolbar>`
    },
    {
      id: "mobile-toolbar",
      title: "Mobile collection toolbar",
      description: "The full toolbar at phone width. Search spans the row, the controls wrap below it, and the filter panel opens inline instead of floating over the list.",
      mobile: {
        height: 560,
        notes: [
          "At 40rem (640px) and below the grid becomes `1fr auto`: search and the controls each span the full width, and the count sits beside the remaining space.",
          "Each control flexes at `1 1 9rem`, so sort and saved view share a row when they fit and wrap one per row at 320px.",
          "The filter panel switches from absolute positioning to static, full width, with no shadow, so it pushes the list down instead of covering it.",
          "The filter summary is at least 2.75rem tall, giving a comfortable touch target; the native selects open the platform picker on phones.",
          "Search stays first and the count stays visible at every width; no control is hover-only."
        ]
      },
      html: `<ef-collection-toolbar class="ef-component-tag">
  <section class="ef-collection-toolbar" aria-label="Ticket list controls">
    <form class="ef-search ef-collection-toolbar__search" role="search">
      <label class="ef-search__label" for="collection-toolbar-mobile-toolbar-search">Search tickets</label>
      <input id="collection-toolbar-mobile-toolbar-search" name="q" type="search" placeholder="Subject or ticket number">
    </form>
    <div class="ef-collection-toolbar__controls">
      <details class="ef-collection-toolbar__filters" open>
        <summary>Filters <span class="ef-status-lozenge">1 active</span></summary>
        <div class="ef-collection-toolbar__filter-panel">
          <label>Status <select name="ticket-status"><option>Any status</option><option selected>Awaiting reply</option></select></label>
        </div>
      </details>
      <label>Sort <select name="ticket-sort"><option>Newest</option><option>Oldest</option></select></label>
      <label>Saved view <select name="ticket-view"><option>My tickets</option><option>Team queue</option></select></label>
    </div>
    <p class="ef-collection-toolbar__count" role="status">12 tickets</p>
  </section>
</ef-collection-toolbar>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "section.ef-collection-toolbar", values: "string", default: "—", description: "Names the toolbar region after the collection it controls." },
      { name: "role", on: "form / .ef-collection-toolbar__count", values: "search / status", default: "—", description: "`search` makes the form a search landmark; `status` makes the count a polite live region so result changes are announced." },
      { name: "for", on: "label.ef-search__label", values: "id of the search input", default: "—", description: "Associates the visible label with the search input." },
      { name: "type", on: "input", values: "search", default: "—", description: "Native search field with platform clear affordances." },
      { name: "open", on: "details.ef-collection-toolbar__filters", values: "boolean", default: "absent (closed)", description: "Native disclosure state of the filter panel; the browser toggles it." },
      { name: "name", on: "input / select", values: "string", default: "—", description: "Field names used when the application serializes the query, for example into the URL." },
      { name: "selected", on: "option", values: "boolean", default: "—", description: "Initial selected filter, sort or view." }
    ],
    hooks: {
      "ef-collection-toolbar": "Root grid of search, controls and count; recomposes at 40rem and below.",
      "ef-collection-toolbar__search": "The search form area; spans the full row on phones.",
      "ef-collection-toolbar__controls": "Wrapping flex row of filters, sort and view controls; labels inside get a 9rem minimum width.",
      "ef-collection-toolbar__filters": "The native `details` holding filters. Its `summary` is a bordered, 2.75rem-tall button-like row.",
      "ef-collection-toolbar__filter-panel": "The filter fields. Absolutely positioned with a shadow on wide screens; static and full width at 40rem and below.",
      "ef-collection-toolbar__count": "Result count in small monospace text, no wrapping. Pair with `role=\"status\"`."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through search, the filters summary, each select and any buttons in order." },
      { keys: "Enter / Space on summary", action: "Opens or closes the filter panel (native `details`). Escape does not close it natively." },
      { keys: "Enter in search", action: "Submits the search form; the application runs the query." },
      { keys: "Arrow keys / Alt+Down on select", action: "Native select behavior." }
    ],
    events: [
      { name: "submit", description: "Native form submission from the search form." },
      { name: "input / change", description: "Native events from the search field and selects; the application re-queries and updates the count." },
      { name: "toggle", description: "Native event on the filters `details` when it opens or closes." }
    ],
    form: "The search is a native form; selects are native form controls that can be submitted or serialized. Forma does not persist queries or views."
  },
  states: [
    { name: "Filters closed", how: "details without open", description: "Only the summary with its active-count text is visible." },
    { name: "Filters open", how: "details[open]", description: "Filter panel shown over the content (desktop) or inline (phone)." },
    { name: "Active filters", how: "text in the summary, for example a [[status-lozenge]] reading \"2 active\"", description: "Written by the application; Forma does not count filters." },
    { name: "Result count", how: "text in .ef-collection-toolbar__count", description: "Announced through `role=\"status\"` when the application changes it." },
    { name: "Stacked", how: "viewport ≤ 40rem", description: "Search full width; controls wrap; panel inline." }
  ],
  accessibility: {
    forma: [
      "Keeps every control native: search form, labelled selects and a `details` disclosure with keyboard support from the browser.",
      "Keeps search first in DOM and visual order at every width.",
      "Gives the filters summary a 2.75rem minimum height.",
      "On phones renders the filter panel in flow, so it never covers focused content."
    ],
    consumer: [
      "Label the search input and every select; wrap selects in their label or use `for`/`id`.",
      "Update the count text after every query so `role=\"status\"` announces it; keep it concise.",
      "Keep the active-filter count in the summary text and show the applied filters with [[active-filter-summary]].",
      "Reflect query state in the URL so views can be shared and restored.",
      "If the panel should close on Escape or outside click, implement that in the application."
    ]
  },
  responsive: [
    "Above 40rem: three areas on one row, bottom-aligned.",
    "At 40rem and below: search full width, controls full width and wrapping, count beside the leftover space; the filter panel becomes static.",
    "Controls flex at `1 1 9rem`, so they wrap before becoming unusably narrow.",
    "The desktop panel width is `min(20rem, calc(100vw - 2rem))`, so it never exceeds the viewport."
  ],
  motion: [
    "No animation: the filter panel opens and closes instantly with the native `details` state; the count updates without transition."
  ],
  guidance: {
    do: [
      "Keep search visible and first; put secondary controls in the controls area.",
      "Show the count with its noun (\"24 records\") so the announcement is meaningful on its own."
    ],
    avoid: [
      "Hiding the active filter count inside the closed panel.",
      "Applying filters on hover or requiring drag.",
      "Placing bulk actions for selected rows in the collection toolbar."
    ]
  },
  related: [
    { slug: "active-filter-summary", note: "Lists each applied filter with a remove action, next to or below the toolbar." },
    { slug: "search", note: "The search form on its own, with clear button and status line." },
    { slug: "data-grid", note: "The collection the toolbar usually controls." },
    { slug: "flyout", note: "Edge-attached modal surface for filter sets too large for the inline panel." },
    { slug: "pagination", note: "Moves between pages of the filtered result." }
  ]
};
