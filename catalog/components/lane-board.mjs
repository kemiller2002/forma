export default {
  name: "Lane board",
  category: "workflow",
  behavior: "Application content",
  summary: "Preserves item-to-lane membership in a bounded board with narrow-screen containment.",
  purpose: {
    description: "A lane board shows items grouped into named lanes, such as workflow stages or owners, laid out as columns. Membership is structural: each lane is a labelled `section` with a heading, a count and an ordered list of items, so which lane an item is in is announced and survives any width. The board scrolls horizontally inside itself when the lanes do not fit, instead of squeezing them or overflowing the page. Moving items between lanes, drag and drop, and deciding which moves are legal are application behavior; Forma only provides the columns and inherits the shared direct-manipulation hooks for items the application is moving.",
    useWhen: [
      "Work moves through a small number of named stages and people scan by stage, as in a kanban or release board.",
      "Lane membership is the key fact, and the count per lane matters.",
      "The board must remain usable on a phone by scrolling lanes, not by losing them."
    ],
    avoidWhen: [
      "Items need sorting, filtering or bulk actions across many fields: use [[data-grid]] or [[work-queue]].",
      "The order within a single list is what the user decides: use [[ranking]].",
      "Relationships between items matter more than grouping: use [[diagram]].",
      "There is only one lane: use a plain list or [[work-queue]]."
    ],
    characteristics: [
      "Lanes are grid columns of `minmax(min(18rem, 85vw), 1fr)`: at least 18rem wide on large screens, 85% of the viewport on phones so the next lane peeks in.",
      "The board scrolls horizontally inside itself with contained overscroll and shows a 2px outline when focused.",
      "Each lane header pairs the lane heading with a text count.",
      "Items are list items, so their count and position within a lane are exposed by the list semantics."
    ]
  },
  examples: [
    {
      id: "release-board",
      title: "Release board with an empty lane",
      description: "Three stages with counts. The empty Blocked lane keeps its heading and says it is empty, so users can tell \"nothing blocked\" from \"lane missing\". The board is focusable because it can scroll.",
      html: `<ef-lane-board class="ef-component-tag">
  <section class="ef-lane-board" aria-label="Release 4.2 board" tabindex="0">
    <section class="ef-lane-board__lane" aria-labelledby="lane-board-release-board-todo">
      <header class="ef-lane-board__header"><h2 id="lane-board-release-board-todo">To do</h2><span>2 items</span></header>
      <ol class="ef-lane-board__items">
        <li><article class="ef-surface"><h3>Update migration guide</h3><p>Owner: Docs</p></article></li>
        <li><article class="ef-surface"><h3>Rotate signing key</h3><p>Owner: Platform</p></article></li>
      </ol>
    </section>
    <section class="ef-lane-board__lane" aria-labelledby="lane-board-release-board-doing">
      <header class="ef-lane-board__header"><h2 id="lane-board-release-board-doing">In progress</h2><span>1 item</span></header>
      <ol class="ef-lane-board__items">
        <li><article class="ef-surface"><h3>Bulk export to Parquet</h3><p>Owner: Data</p><p><span class="ef-status-lozenge" data-state="attention">Due tomorrow</span></p></article></li>
      </ol>
    </section>
    <section class="ef-lane-board__lane" aria-labelledby="lane-board-release-board-blocked">
      <header class="ef-lane-board__header"><h2 id="lane-board-release-board-blocked">Blocked</h2><span>0 items</span></header>
      <p>Nothing is blocked.</p>
    </section>
  </section>
</ef-lane-board>`
    },
    {
      id: "move-without-drag",
      title: "Moving an item without dragging",
      description: "Each item has a native button that moves it to the next lane, the non-drag path the application must provide. The target lane shows the shared `data-ef-drop=\"candidate\"` cue (a dashed outline, not only color) and a live message reports the outcome in text. A light motion weight keeps any settle of moved cards quick.",
      html: `<ef-lane-board class="ef-component-tag">
  <section class="ef-lane-board" aria-label="Hiring pipeline" tabindex="0" data-ef-motion-weight="light">
    <section class="ef-lane-board__lane" aria-labelledby="lane-board-move-without-drag-screen">
      <header class="ef-lane-board__header"><h2 id="lane-board-move-without-drag-screen">Screening</h2><span>1 candidate</span></header>
      <ol class="ef-lane-board__items">
        <li><article class="ef-surface"><h3>Amara Okafor</h3><p>Backend engineer</p><button type="button">Move Amara Okafor to Interview</button></article></li>
      </ol>
    </section>
    <section class="ef-lane-board__lane" aria-labelledby="lane-board-move-without-drag-interview" data-ef-drop="candidate">
      <header class="ef-lane-board__header"><h2 id="lane-board-move-without-drag-interview">Interview</h2><span>1 candidate</span></header>
      <ol class="ef-lane-board__items">
        <li><article class="ef-surface"><h3>Luis Ferreira</h3><p>Backend engineer</p><button type="button">Move Luis Ferreira to Offer</button></article></li>
      </ol>
    </section>
  </section>
  <p role="status">Luis Ferreira moved from Screening to Interview.</p>
</ef-lane-board>`
    },
    {
      id: "mobile-scrolling-lanes",
      title: "Mobile scrolling lanes",
      description: "On a phone each lane takes most of the screen width and the next lane peeks in, showing that the board continues sideways.",
      mobile: {
        height: 460,
        notes: [
          "Lanes are `min(18rem, 85vw)` wide, so at 320px each lane is about 272px and the edge of the next lane is visible as a scroll cue.",
          "Horizontal scrolling is contained in the board with `overscroll-behavior-inline: contain`; the page does not scroll sideways.",
          "The board is focusable (tabindex=\"0\") so it can also be scrolled from a keyboard; lane membership is still announced from the lane heading.",
          "Portrait shows about one lane at a time; landscape shows more. Consider offering a lane filter or a list view for boards with many lanes."
        ]
      },
      html: `<ef-lane-board class="ef-component-tag">
  <section class="ef-lane-board" aria-label="Support board" tabindex="0">
    <section class="ef-lane-board__lane" aria-labelledby="lane-board-mobile-new">
      <header class="ef-lane-board__header"><h2 id="lane-board-mobile-new">New</h2><span>1 ticket</span></header>
      <ol class="ef-lane-board__items"><li><article class="ef-surface"><h3>SUP-2291</h3><p>Invoice PDF missing line items</p></article></li></ol>
    </section>
    <section class="ef-lane-board__lane" aria-labelledby="lane-board-mobile-waiting">
      <header class="ef-lane-board__header"><h2 id="lane-board-mobile-waiting">Waiting on customer</h2><span>1 ticket</span></header>
      <ol class="ef-lane-board__items"><li><article class="ef-surface"><h3>SUP-2280</h3><p>Export stuck at 90%</p></article></li></ol>
    </section>
    <section class="ef-lane-board__lane" aria-labelledby="lane-board-mobile-done">
      <header class="ef-lane-board__header"><h2 id="lane-board-mobile-done">Resolved</h2><span>0 tickets</span></header>
      <p>No resolved tickets today.</p>
    </section>
  </section>
</ef-lane-board>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "root section", values: "string", default: "—", description: "Names the board." },
      { name: "tabindex", on: "root section", values: "0", default: "—", description: "Makes the horizontally scrolling board focusable so keyboard users can scroll it; Forma draws a focus outline for it." },
      { name: "aria-labelledby", on: "lane section", values: "id of the lane heading", default: "—", description: "Names each lane by its heading, which is what makes lane membership announced." },
      { name: "data-ef-drop", on: "lane or item", values: "candidate | accepted | rejected", default: "absent", description: "Shared drop presentation written by the application during a move: dashed, solid or dashed-with-fill outline. See [[reorder-states]]." },
      { name: "data-ef-motion-weight", on: "root", values: "light | standard | heavy", default: "standard", description: "Presentation-only mass for settling of items the application is moving inside the board." }
    ],
    hooks: {
      "ef-lane-board": "Root: a column-flow grid of lanes that scrolls horizontally inside itself.",
      "ef-lane-board__lane": "One lane: a vertical grid of header and items that can shrink.",
      "ef-lane-board__header": "Lane heading and count on one baseline, spaced apart.",
      "ef-lane-board__items": "Unstyled list of items with a small gap.",
      "data-ef-motion-weight": "Light, standard or heavy mass for the shared direct-manipulation settle of items inside the board (items carrying `data-ef-manipulation`). The board itself does not animate. Never encodes importance."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves to the board, then through links and buttons inside items, lane by lane in source order." },
      { keys: "Arrow keys (board focused)", action: "Scroll the board. Native scrolling of a focused overflow region." },
      { keys: "Moving items", action: "Not provided. The application must offer buttons or a menu to move items between lanes; drag must never be the only path." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Overflowing", how: "more lanes than fit", description: "The board scrolls horizontally inside itself; lanes keep their minimum width." },
    { name: "Board focus", how: ":focus-visible on the board", description: "2px outline in the current text color." },
    { name: "Empty lane", how: "no items in the lane", description: "Application writes a zero count and a sentence in place of the list." },
    { name: "Drop target", how: "data-ef-drop on a lane", description: "Candidate is a dashed outline, accepted solid, rejected dashed with a fill." },
    { name: "Item moving", how: "data-ef-manipulation on an item", description: "Application-written shared hook: dragging tracks directly, settling returns with damped motion." }
  ],
  accessibility: {
    forma: [
      "Keeps lanes as columns at every width and contains horizontal scrolling in the board, so page reflow is not broken.",
      "Draws a visible focus outline on the board when it is focused for scrolling.",
      "Uses list semantics for items, so each lane's item count and item position are available to assistive technology."
    ],
    consumer: [
      "Give each lane a heading and name the lane section with it.",
      "Write counts as text and keep them in sync.",
      "Provide a non-drag way to move items (buttons or a menu), announce the result in a live region, and keep focus on the moved item.",
      "Enforce which moves are legal in application or Ordo state; never infer legality from lane position.",
      "Add tabindex=\"0\" to the board when it can scroll, or ensure it contains focusable content."
    ]
  },
  responsive: [
    "Lanes are implicit grid columns of `minmax(min(18rem, 85vw), 1fr)`, so they share extra width on large screens and never shrink below 18rem (or 85vw on phones).",
    "The board has `max-inline-size: 100%` and `overflow-x: auto`, keeping overflow inside itself.",
    "There are no breakpoints; lanes never stack, which keeps lane membership visually stable across widths.",
    "Lane content wraps within the lane; long titles in items wrap rather than widening the lane."
  ],
  motion: [
    "The board and lanes do not animate.",
    "Items the application is moving use the shared direct-manipulation hooks: `dragging` tracks with no transition, `settling` returns with the damped inertial model and never overshoots.",
    "`data-ef-motion-weight` on the board sets the mass those settles inherit.",
    "Under `prefers-reduced-motion: reduce` the settle duration becomes effectively instant and items appear at their final position."
  ],
  guidance: {
    do: [
      "Keep the number of lanes small enough to scan, typically three to six.",
      "Show a count per lane and an explicit empty message."
    ],
    avoid: [
      "Using lane color as the only way to show stage.",
      "Relying on drag and drop as the only way to move work.",
      "Hiding lanes on phones; scroll to them instead."
    ]
  },
  related: [
    { slug: "work-queue", note: "A single actionable list with reasons and due information." },
    { slug: "ranking", note: "Ordering within one list rather than membership across lanes." },
    { slug: "reorder-states", note: "The shared drag and drop presentation hooks." },
    { slug: "diagram", note: "Relationships between items drawn with connectors." }
  ]
};
