import { missionById, nasaSpaceflights } from "../example-data/nasa-spaceflight.mjs";

const sts31 = missionById("sts-31");
const discoveryCount = nasaSpaceflights.filter(mission => mission.spacecraft === "Discovery").length;

export default {
  name: "Search",
  category: "forms",
  behavior: "Application / Limen",
  summary: "Search entry, clearing, and result-count feedback with asynchronous behavior owned by the application.",
  purpose: {
    description: "Search lets users find records by typing a query. The pattern is a `form` with `role=\"search\"` (a search landmark) containing a labelled `input type=\"search\"`, a Clear button and a `role=\"status\"` line for the result count. Native HTML provides the landmark, the search keyboard on phones, Enter to submit and, in many browsers, Escape to clear. Clearing through the button, debouncing, suggestions, pending state and updating the count are application behavior, normally through Limen.",
    useWhen: [
      "Users look up records in a collection by keyword.",
      "A result count should be announced as results change.",
      "The query is the primary way into a list, table or workspace."
    ],
    avoidWhen: [
      "The user is choosing one value for a form field: use [[combobox]] or [[select]].",
      "The user runs commands or jumps anywhere in the app by name: use [[command-palette]].",
      "The search is one control among sort, filters and view options above a collection: compose it inside [[collection-toolbar]] and show active filters with [[active-filter-summary]]."
    ],
    characteristics: [
      "The input and Clear button share one row, joined with no gap; at narrow widths the button moves below the input.",
      "The status line is a polite live region so count changes are announced without moving focus.",
      "Forma renders states; it does not fetch, debounce, rank or clear."
    ]
  },
  examples: [
    {
      id: "no-results",
      title: "No matching mission",
      description: "A query that matched nothing in the fixed reference collection. The status line announces zero results and keeps the query in the field so it can be corrected.",
      html: `<ef-search class="ef-component-tag">
  <form class="ef-search" role="search" aria-label="NASA missions" action="/missions" method="get">
    <label class="ef-search__label" for="search-no-results-query">Search missions</label>
    <div class="ef-search__control">
      <input id="search-no-results-query" name="q" type="search" value="Apollo 99" autocomplete="off">
      <button type="button" class="ef-search__clear">Clear</button>
    </div>
    <p class="ef-search__status" role="status">No reference missions match "Apollo 99". Search by mission name, program, spacecraft, or crew member.</p>
  </form>
</ef-search>`
    },
    {
      id: "pending-search",
      title: "Mission search in progress",
      description: "The application is waiting for results. The status line says so in text, and an old count is not shown as if it were current.",
      html: `<ef-search class="ef-component-tag">
  <form class="ef-search" role="search" aria-label="NASA missions" action="/missions" method="get">
    <label class="ef-search__label" for="search-pending-query">Search missions</label>
    <div class="ef-search__control">
      <input id="search-pending-query" name="q" type="search" value="Hubble" autocomplete="off" placeholder="Mission, crew member or spacecraft">
      <button type="button" class="ef-search__clear">Clear</button>
    </div>
    <p class="ef-search__status" role="status">Searching…</p>
  </form>
</ef-search>`
    },
    {
      id: "mobile-spacecraft-search",
      title: "Mobile spacecraft search",
      description: "Searching for Discovery at phone width returns the two Discovery missions in the standard collection, including STS-31.",
      mobile: {
        height: 260,
        notes: [
          "At 30rem and below the control becomes one column: the input takes the full width and the Clear button sits beneath it.",
          "The input and button each keep a 44px minimum height for touch.",
          "type=search shows the search keyboard, whose action key submits the form.",
          "Long result-count messages wrap under the control; nothing scrolls horizontally."
        ]
      },
      html: `<ef-search class="ef-component-tag">
  <form class="ef-search" role="search" aria-label="NASA missions" action="/missions" method="get">
    <label class="ef-search__label" for="search-mobile-query">Search missions</label>
    <div class="ef-search__control">
      <input id="search-mobile-query" name="q" type="search" value="${sts31.spacecraft}" autocomplete="off">
      <button type="button" class="ef-search__clear">Clear</button>
    </div>
    <p class="ef-search__status" role="status">${discoveryCount} missions in the reference collection use ${sts31.spacecraft}.</p>
  </form>
</ef-search>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: "form", values: "search", default: "—", description: "Makes the form a search landmark. Add aria-label when a page has more than one search." },
      { name: "aria-label", on: "form", values: "string", default: "—", description: "Names the search landmark (for example \"Customers\") so several searches can be told apart." },
      { name: "type", on: "input / button", values: "search on the input; button on Clear", default: "—", description: "type=search gives the search keyboard and native clearing affordances; type=button keeps Clear from submitting the form." },
      { name: "for", on: "label.ef-search__label", values: "id of the input", default: "—", description: "Associates the visible label." },
      { name: "name", on: "input", values: "string", default: "—", description: "Query parameter name on submission." },
      { name: "value", on: "input", values: "string", default: "empty", description: "The current query when the page renders results for it." },
      { name: "autocomplete", on: "input", values: "off", default: "browser heuristic", description: "Stops browser form history from competing with application suggestions." },
      { name: "placeholder", on: "input", values: "string", default: "—", description: "Optional hint about searchable fields; not a label." },
      { name: "role", on: ".ef-search__status", values: "status", default: "—", description: "Polite live region so result-count and pending text are announced." }
    ],
    hooks: {
      "ef-search": "Root grid (the form) stacking label, control and status.",
      "ef-search__label": "Compact visible label (0.8125rem, weight 650).",
      "ef-search__control": "Two-column grid: flexible input and auto-width Clear button, joined without a gap. One column at 30rem and below.",
      "ef-search__clear": "The Clear button, at least 4.5rem wide. Its action is application behavior.",
      "ef-search__status": "Result count or state text in secondary color at 0.75rem."
    },
    keyboard: [
      { keys: "Enter", action: "Submits the search form (native implicit submission)." },
      { keys: "Escape", action: "Clears a type=search input in browsers that support it (native, browser-dependent)." },
      { keys: "Tab", action: "Moves from the input to the Clear button." },
      { keys: "Space / Enter on Clear", action: "Activates the button; the application must clear the input, update results and return focus to the input." }
    ],
    events: [
      { name: "submit / input / search", description: "Native events from the form and search input. Debounced search-as-you-type is application behavior; Forma adds no events." }
    ],
    form: "A GET form submits the query as name=value. The Clear button is type=button and does nothing without application code."
  },
  states: [
    { name: "Empty", how: "no value", description: "Label, empty input and Clear button; the status can be empty or state the total." },
    { name: "Results", how: "application text in .ef-search__status", description: "A count such as \"24 results\"." },
    { name: "Pending", how: "application text in .ef-search__status", description: "Text such as \"Searching…\" while a request is outstanding." },
    { name: "No results", how: "application text in .ef-search__status", description: "Zero count with a recovery hint; keep the query in the field." },
    { name: "Focus", how: ":focus-visible", description: "Foundation two-tone focus ring on the input or button." }
  ],
  accessibility: {
    forma: [
      "Canonical markup provides a search landmark, a visible label tied to the input and a live status region.",
      "The input and Clear button keep 44px minimum heights; at narrow widths the button stacks below so neither target shrinks.",
      "Borders map to CanvasText in forced-colors mode."
    ],
    consumer: [
      "Update the status text for every result change, and throttle announcements while the user is typing.",
      "After Clear, empty the input, restore results and return focus to the input.",
      "Name each search landmark with aria-label when there is more than one on a page.",
      "Cancel obsolete requests so stale results never replace newer ones."
    ]
  },
  responsive: [
    "The control is `minmax(0, 1fr) auto`, so the input shrinks before the Clear button and never overflows.",
    "At 30rem (480px) and below the control becomes a single column with the Clear button under the input.",
    "The root and control have `min-inline-size: 0`, so the component shrinks inside grid and flex parents."
  ],
  motion: [
    "No animation beyond the Clear button's shared hover and press background interpolation from the foundation layer. Result changes are not animated by Forma."
  ],
  guidance: {
    do: [
      "Keep the query visible after searching so users can refine it.",
      "Say what was searched in no-result messages and suggest a next step."
    ],
    avoid: [
      "Using a placeholder as the only label.",
      "Moving focus to results on every keystroke."
    ]
  },
  related: [
    { slug: "collection-toolbar", note: "Places search with sort, filter and view controls above a collection." },
    { slug: "combobox", note: "For choosing one value with suggestions, not searching a collection." },
    { slug: "command-palette", note: "Modal, keyboard-first command and navigation search." },
    { slug: "active-filter-summary", note: "Shows and removes the filters that apply alongside a query." }
  ]
};
