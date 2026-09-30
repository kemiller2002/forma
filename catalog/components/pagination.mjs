import { nasaSpaceflights } from "../example-data/nasa-spaceflight.mjs";

const missionPageCount = Math.ceil(nasaSpaceflights.length / 3);

export default {
  name: "Pagination",
  category: "navigation",
  behavior: "Application / Limen",
  summary: "Page navigation with explicit current-page semantics and compact mobile presentation.",
  purpose: {
    description: "Pagination moves through a long result set one page at a time. It is a labelled `nav` of ordinary links: Previous and Next with `rel`, an ordered list of page links with `aria-current=\"page\"` on the current one, and a text summary such as \"Page 3 of 12\". Because every page is a real URL, pages can be bookmarked, opened in new tabs and navigated without script. The application decides page size, which page numbers to show, and how to handle unknown totals or cursor-based APIs.",
    useWhen: [
      "A list or table has more results than fit comfortably and users benefit from stable, addressable pages.",
      "Users need to jump to a specific page or know how far through the results they are.",
      "The data source supports page numbers, or at least previous/next cursors."
    ],
    avoidWhen: [
      "Moving through steps of a task: use [[wizard]].",
      "Switching views of one object: use [[tabs]].",
      "Showing where the user is in a hierarchy: use [[scope-trail]]."
    ],
    characteristics: [
      "Every control is an anchor with a real href; the current page is marked with `aria-current=\"page\"` and an inverse surface.",
      "Each link is at least 44 by 44px.",
      "Below 40rem only the current page number stays visible, Previous and Next move to the edges and the summary takes its own line.",
      "The summary text states position explicitly, so the current page does not depend on the highlighted box."
    ]
  },
  examples: [
    {
      id: "first-page",
      title: "First page of mission results",
      description: "The eight canonical missions are shown three at a time. On page 1 there is nowhere to go back to, so the application omits Previous rather than rendering a dead control.",
      html: `<ef-pagination class="ef-component-tag">
  <nav class="ef-pagination" aria-label="NASA mission pages">
    <ol class="ef-pagination__pages">
      <li><a href="?page=1" aria-current="page">1</a></li>
      <li><a href="?page=2">2</a></li>
      <li><a href="?page=3">3</a></li>
    </ol>
    <a href="?page=2" rel="next">Next</a>
    <span class="ef-pagination__summary">Page 1 of ${missionPageCount} · ${nasaSpaceflights.length} missions</span>
  </nav>
</ef-pagination>`
    },
    {
      id: "gapped-range",
      title: "Long mission-evidence archive with gaps",
      description: "A larger evidence archive for the same mission domain has forty pages. The application shows the first and last pages and a window around the current one; gaps remain plain ellipsis items.",
      html: `<ef-pagination class="ef-component-tag">
  <nav class="ef-pagination" aria-label="Mission evidence pages">
    <a href="?page=17" rel="prev">Previous</a>
    <ol class="ef-pagination__pages">
      <li><a href="?page=1">1</a></li><li aria-hidden="true">…</li>
      <li><a href="?page=17">17</a></li><li><a href="?page=18" aria-current="page">18</a></li><li><a href="?page=19">19</a></li>
      <li aria-hidden="true">…</li><li><a href="?page=40">40</a></li>
    </ol>
    <a href="?page=19" rel="next">Next</a>
    <span class="ef-pagination__summary">Page 18 of 40 · mission evidence archive</span>
  </nav>
</ef-pagination>`
    },
    {
      id: "cursor-unknown-total",
      title: "Cursor-based mission events with unknown total",
      description: "An event stream returns cursors rather than page numbers and does not know the total. Only Previous and Next are rendered while the summary describes the visible range.",
      html: `<ef-pagination class="ef-component-tag">
  <nav class="ef-pagination" aria-label="Mission event pages">
    <a href="?before=evt_5120" rel="prev">Newer events</a>
    <a href="?after=evt_5071" rel="next">Older events</a>
    <span class="ef-pagination__summary">Showing 50 mission events</span>
  </nav>
</ef-pagination>`
    },
    {
      id: "mobile-compact",
      title: "Compact mission pagination on a phone",
      description: "Below 40rem the mission page list collapses to the current page, Previous and Next sit at the edges, and the summary moves to its own centred line.",
      mobile: {
        height: 200,
        notes: [
          "Page links other than the current one are hidden below 40rem.",
          "Previous and Next remain large touch targets at opposite edges.",
          "The summary takes the full width and states position in text.",
          "Hidden page numbers are removed from the accessibility tree too."
        ]
      },
      html: `<ef-pagination class="ef-component-tag">
  <nav class="ef-pagination" aria-label="NASA mission pages">
    <a href="?page=1" rel="prev">Previous</a>
    <ol class="ef-pagination__pages">
      <li><a href="?page=1">1</a></li>
      <li><a href="?page=2" aria-current="page">2</a></li>
      <li><a href="?page=3">3</a></li>
    </ol>
    <a href="?page=3" rel="next">Next</a>
    <span class="ef-pagination__summary">Page 2 of ${missionPageCount} · ${nasaSpaceflights.length} missions</span>
  </nav>
</ef-pagination>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "nav", values: "string", default: "—", description: "Names the landmark. Make it specific when a page has more than one pagination nav." },
      { name: "aria-current", on: "current page link", values: "page", default: "absent", description: "Marks the current page. Forma draws the inverse surface from it and keeps it visible in compact mode." },
      { name: "rel", on: "Previous / Next links", values: "prev | next", default: "—", description: "Declares the relationship between pages for user agents and crawlers." },
      { name: "href", on: "links", values: "URL", default: "—", description: "Every page is a real, addressable URL supplied by the application." },
      { name: "aria-hidden", on: "ellipsis list item", values: "true", default: "—", description: "Hides decorative gap markers from assistive technology." }
    ],
    hooks: {
      "ef-pagination": "Root nav: a wrapping flex row of controls and summary.",
      "ef-pagination__pages": "Unstyled ordered list of page links in a row.",
      "ef-pagination__summary": "Small secondary text stating the position, such as Page 3 of 12. Full-width and centred below 40rem."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through Previous, the page links and Next in source order." },
      { keys: "Enter", action: "Follows the focused link (native)." }
    ],
    events: [],
    form: "Does not participate in forms. The application may intercept link clicks for client-side loading but must keep the hrefs valid."
  },
  states: [
    { name: "Current page", how: "aria-current=\"page\"", description: "Inverse surface and text color." },
    { name: "Focus", how: ":focus-visible on a link", description: "Foundation two-tone focus ring." },
    { name: "At first or last page", how: "application omits Previous or Next", description: "No disabled styling exists; do not render a control that goes nowhere." },
    { name: "Compact", how: "viewport below 40rem", description: "Only the current page number remains between Previous and Next; summary on its own line." }
  ],
  accessibility: {
    forma: [
      "Uses a navigation landmark with ordinary links, so pages are reachable without script.",
      "Distinguishes the current page by surface inversion and relies on aria-current for the programmatic state.",
      "Keeps every link at a 44px minimum target."
    ],
    consumer: [
      "Label each pagination nav uniquely.",
      "Write a summary that states the page and, when known, the total.",
      "Move focus to the top of the updated results (or announce them) when loading a page without a full navigation."
    ]
  },
  responsive: [
    "Wide: a wrapping flex row; page links sit in their own list.",
    "Below 40rem: non-current page numbers are hidden, controls spread to the edges and the summary moves to a centred line at the end.",
    "Long link text such as Older events wraps with the row rather than overflowing."
  ],
  motion: [
    "No animation: page changes are navigations and the current-page styling is static."
  ],
  guidance: {
    do: [
      "Keep page URLs stable and shareable.",
      "Use words like Newer and Older when pages are time-ordered."
    ],
    avoid: [
      "Rendering disabled Previous or Next links; omit them instead.",
      "Showing every page number for large result sets."
    ]
  },
  related: [
    { slug: "collection-toolbar", note: "Sorting and filtering controls that usually sit above paginated results." },
    { slug: "data-grid", note: "Tabular results that pagination commonly pages through." },
    { slug: "wizard", note: "For moving through ordered task steps, not result pages." }
  ]
};
