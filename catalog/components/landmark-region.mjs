export default {
  name: "Landmark region",
  category: "layout",
  behavior: "Native HTML",
  summary: "Creates a labeled semantic region for orientation and task ownership.",
  purpose: {
    description: "A landmark region is a named band of orientation content (where am I, what can I reach, what state is the system in) that stays at the top of its scroll container while the user works below it. Its semantics come entirely from native elements: an aside, nav, section or header with an accessible name becomes a landmark screen-reader users can jump to. Forma lays the band out as a wrapping row with its items spread across the width, gives it an opaque background, and makes it sticky on screens wider than 48rem. The application supplies the content and keeps any status text current.",
    useWhen: [
      "A workspace needs a persistent, named band with local navigation and a short system status.",
      "Users should be able to jump to the orientation region with landmark navigation.",
      "The band should stay visible while a long task region scrolls, on screens with room for it."
    ],
    avoidWhen: [
      "You need the whole application frame (header, navigation, main, inspector): use [[workspace-shell]] or [[navigation-shell]].",
      "The site header of a marketing page: use [[site-header]] inside the [[marketing-shell]].",
      "The content is a set of commands for the current object: use [[collection-toolbar]] or [[command-group]].",
      "A status must interrupt the user: use [[alert]] or [[fault-banner]]."
    ],
    characteristics: [
      "Sticky at the block start with z-index 1 above 48rem; static at 48rem and below so it never eats small-screen height.",
      "Opaque surface background, so content scrolling underneath does not show through.",
      "Items and nested nav links wrap, so long labels never force horizontal scrolling."
    ]
  },
  examples: [
    {
      id: "project-context",
      title: "Project context band",
      description: "A named section with the project name, local navigation and a live status message. The section is a region landmark because it has an accessible name; the nav is a second, separately named landmark.",
      html: `<ef-landmark-region class="ef-component-tag">
  <section class="ef-landmark-region" aria-labelledby="landmark-region-project-context-title">
    <h2 id="landmark-region-project-context-title">Payments API</h2>
    <nav aria-label="Project sections">
      <a href="#landmark-region-project-context-title" aria-current="page">Overview</a>
      <a href="#deployments">Deployments</a>
      <a href="#settings">Settings</a>
    </nav>
    <p role="status">All checks passing</p>
  </section>
</ef-landmark-region>`
    },
    {
      id: "review-status",
      title: "Review status aside",
      description: "A complementary landmark summarising a document review: who owns it, the due date and a status message. It uses `--ef-landmark-space` for a tighter band in a dense workspace.",
      html: `<ef-landmark-region class="ef-component-tag">
  <aside class="ef-landmark-region" style="--ef-landmark-space: 0.5rem" aria-label="Review status">
    <p>Owner: Legal operations</p>
    <p>Due <time datetime="2026-10-03">3 Oct 2026</time></p>
    <p role="status"><span class="ef-status-lozenge" data-state="attention">2 comments unresolved</span></p>
  </aside>
</ef-landmark-region>`
    },
    {
      id: "mobile-wrapped-band",
      title: "Mobile wrapped band",
      description: "The project band at phone width. It stops being sticky, and the heading, navigation links and status wrap onto separate lines.",
      mobile: {
        height: 300,
        notes: [
          "At 48rem and below the region becomes `position: static`, so it scrolls away instead of permanently covering part of a short screen.",
          "Items wrap; the space-between distribution puts wrapped items at the start of each new line.",
          "Navigation links wrap with the same gap, keeping each link a separate target.",
          "In landscape on a tablet wider than 48rem the band becomes sticky again."
        ]
      },
      html: `<ef-landmark-region class="ef-component-tag">
  <section class="ef-landmark-region" aria-labelledby="landmark-region-mobile-wrapped-band-title">
    <h2 id="landmark-region-mobile-wrapped-band-title">Payments API</h2>
    <nav aria-label="Project sections on mobile">
      <a href="#landmark-region-mobile-wrapped-band-title" aria-current="page">Overview</a>
      <a href="#deployments-mobile">Deployments</a>
      <a href="#incidents-mobile">Incidents</a>
      <a href="#settings-mobile">Settings</a>
    </nav>
    <p role="status">Deploy in progress</p>
  </section>
</ef-landmark-region>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "aside / nav / section", values: "string", default: "—", description: "Accessible name. A section only becomes a region landmark when it is named; name every nav when there is more than one." },
      { name: "aria-labelledby", on: "section", values: "id of the band heading", default: "—", description: "Names the region from its visible heading." },
      { name: "aria-current", on: "nav link", values: "page", default: "—", description: "Marks the current location in the band's navigation." },
      { name: "role", on: "status element", values: "status", default: "—", description: "Makes status text a polite live region, so application updates are announced without moving focus." },
      { name: "style", on: ".ef-landmark-region", values: "--ef-landmark-space: <length>", default: "—", description: "Per-instance spacing override." }
    ],
    hooks: {
      "ef-landmark-region": "Sticky (above 48rem), wrapping flex band with space-between distribution, block padding and an opaque surface background. Nested nav elements become wrapping rows.",
      "--ef-landmark-space": "Gap between items, gap between nav links, and block padding. Default `--ef-primitive-spacing-3` (0.75rem)."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through links and controls in the band in source order." },
      { keys: "Screen-reader landmark navigation", action: "Named aside, nav and section elements appear in the landmark list; this is native browser and assistive technology behavior." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Sticky", how: "viewport above 48rem", description: "Stays at the top of the nearest scroll container while content scrolls beneath." },
    { name: "Static", how: "viewport at or below 48rem", description: "Scrolls with the page." },
    { name: "Current location", how: "aria-current=\"page\" on a link", description: "Native state the application sets for the active section." }
  ],
  accessibility: {
    forma: [
      "Keeps landmark semantics on native elements; the class adds layout only.",
      "Opaque background prevents scrolled content from reducing text contrast behind the band.",
      "Drops stickiness on small screens so the band cannot obscure focused content (WCAG 2.4.11)."
    ],
    consumer: [
      "Give the region and each nav inside it a unique accessible name.",
      "Keep status text short and update it in place; role=\"status\" announces changes politely.",
      "Provide scroll padding for anchors so targets are not hidden under the sticky band on wide screens.",
      "Avoid more than one sticky band per scroll container."
    ]
  },
  responsive: [
    "Viewport breakpoint at 48rem switches between sticky and static.",
    "Items wrap with `flex-wrap`, so the band grows taller rather than wider on narrow screens.",
    "Stickiness is relative to the nearest scrolling ancestor; inside a scrollable pane it sticks to that pane."
  ],
  motion: [
    "No animation: the band sticks and unsticks through native sticky positioning without transitions."
  ],
  guidance: {
    do: [
      "Limit the band to orientation: name, local navigation and short status.",
      "Use the same band position across pages of a workspace."
    ],
    avoid: [
      "Putting long forms or primary actions in a sticky band.",
      "Relying on the `ef-landmark-region__status` class from the canonical pattern for styling; it has no CSS. Use `role=\"status\"` for semantics."
    ]
  },
  related: [
    { slug: "workspace-shell", note: "Complete application frame with a landmark slot." },
    { slug: "navigation-shell", note: "Primary navigation with compact and persistent presentations." },
    { slug: "site-header", note: "Marketing site header inside the site shell." },
    { slug: "alert", note: "Status messages that need to interrupt." }
  ]
};
