export default {
  name: "Resizable split pane",
  category: "workspaces",
  behavior: "Application / Limen",
  summary: "Split pane whose application-supplied size tracks drag or keys directly, settles without overshoot, and is clamped to legal bounds in CSS.",
  purpose: {
    description: "A resizable split pane is a [[split-pane]] with `data-ef-resizable` and a focusable `role=\"separator\"` between the two regions. The application owns the size: pointer drag, Arrow-key steps, collapse, reset and persistence are Limen or application code that writes one custom property, `--ef-split-size`. Forma turns that value into a three-track grid, clamps it to `--ef-split-min` and `--ef-split-max` so no illegal size is ever drawn, tracks it immediately while `data-ef-manipulation=\"resizing\"`, and settles with a damped, non-overshooting transition otherwise. Without application code the separator is focusable but inert.",
    useWhen: [
      "Users genuinely need to trade space between two regions, such as a code editor and its preview or a document and a long inspector.",
      "The application can implement pointer and keyboard resizing through one shared size value and persist it.",
      "Both regions have a meaningful minimum width that must never be violated."
    ],
    avoidWhen: [
      "A fixed proportion is good enough: use [[split-pane]], which needs no script.",
      "There is no application or Limen code to implement dragging and keys; an inert separator is a false affordance.",
      "The layout is mainly for phones; the separator is hidden at 48rem and below and the panes stack.",
      "Users need to hide a panel entirely rather than resize it: use a [[disclosure]] or a [[flyout]]."
    ],
    characteristics: [
      "The drawn size is `clamp(var(--ef-split-min), var(--ef-split-size), var(--ef-split-max))`, so bounds are enforced in CSS even mid-transition.",
      "Direct phase: while `data-ef-manipulation=\"resizing\"` the transition duration is 0ms and the primary width equals the written size on the same frame.",
      "Keyboard and pointer resizing write the same property and therefore end in the same state.",
      "The separator is a 2.75rem-wide hit area with a 2px visible line and a two-tone focus ring."
    ]
  },
  examples: [
    {
      id: "collapsed-editor",
      title: "Collapsed to the minimum",
      description: "The application has collapsed the primary region with `data-ef-collapsed`, which pins it to `--ef-split-min` even though an inline size is still set, giving the preview the remaining width. The separator's aria-valuenow reports the collapsed value and it stays focusable so the user can restore it.",
      html: `<ef-resizable-split-pane class="ef-component-tag">
  <section class="ef-split-pane" data-ef-resizable data-ef-collapsed aria-label="Template editor" style="--ef-split-size: 58%">
    <div id="resizable-split-pane-collapsed-editor-source">
      <h2>Template source</h2>
      <p>Source editor collapsed to its minimum width.</p>
    </div>
    <div class="ef-split-pane__separator" role="separator" tabindex="0" aria-orientation="vertical" aria-controls="resizable-split-pane-collapsed-editor-source" aria-label="Resize template source" aria-valuemin="25" aria-valuemax="75" aria-valuenow="25" aria-valuetext="Collapsed"></div>
    <aside aria-label="Rendered preview">
      <h3>Rendered preview</h3>
      <p>Hello Amara, your order #48213 has shipped and will arrive on Thursday.</p>
    </aside>
  </section>
</ef-resizable-split-pane>`
    },
    {
      id: "active-drag",
      title: "Mid-drag with custom bounds",
      description: "A snapshot of the direct phase: the application has set `data-ef-manipulation=\"resizing\"` and writes `--ef-split-size` on every pointer move. The instance narrows the legal range with `--ef-split-min` and `--ef-split-max`, and a requested 90% is clamped to the maximum.",
      html: `<ef-resizable-split-pane class="ef-component-tag">
  <section class="ef-split-pane" data-ef-resizable data-ef-manipulation="resizing" aria-label="Log explorer" style="--ef-split-size: 90%; --ef-split-min: 12rem; --ef-split-max: calc(100% - 12rem)">
    <div id="resizable-split-pane-active-drag-logs">
      <h2>Log stream</h2>
      <p>14:02:11 worker-3 retrying job 88213 (attempt 2 of 5)</p>
    </div>
    <div class="ef-split-pane__separator" role="separator" tabindex="0" aria-orientation="vertical" aria-controls="resizable-split-pane-active-drag-logs" aria-label="Resize log stream" aria-valuemin="20" aria-valuemax="80" aria-valuenow="80"></div>
    <aside aria-label="Log entry details">
      <h3>Entry details</h3>
      <p>Job 88213 · queue billing-sync</p>
    </aside>
  </section>
</ef-resizable-split-pane>`
    },
    {
      id: "heavy-settle",
      title: "Heavy settling weight",
      description: "`data-ef-motion-weight=\"heavy\"` gives the settle after release or a keyboard step a slower, more damped response for a large, content-heavy pane. Weight is presentation only and never signals importance.",
      html: `<ef-resizable-split-pane class="ef-component-tag">
  <section class="ef-split-pane" data-ef-resizable data-ef-motion-weight="heavy" aria-label="Contract review" style="--ef-split-size: 55%">
    <div id="resizable-split-pane-heavy-settle-contract">
      <h2>Master services agreement</h2>
      <p>Section 7.2: Either party may terminate for convenience with 90 days' written notice.</p>
    </div>
    <div class="ef-split-pane__separator" role="separator" tabindex="0" aria-orientation="vertical" aria-controls="resizable-split-pane-heavy-settle-contract" aria-label="Resize agreement" aria-valuemin="30" aria-valuemax="80" aria-valuenow="55"></div>
    <aside aria-label="Reviewer comments">
      <h3>Comments</h3>
      <p>Legal: 90 days is longer than our standard 60.</p>
    </aside>
  </section>
</ef-resizable-split-pane>`
    },
    {
      id: "mobile-stacked",
      title: "Mobile without a separator",
      description: "At phone width the resizable pane stacks and the separator is hidden, because there is no meaningful horizontal size to adjust.",
      mobile: {
        height: 420,
        notes: [
          "At 48rem and below the grid becomes a single column and `.ef-split-pane__separator` is `display: none`, so it leaves the tab order and the accessibility tree.",
          "`--ef-split-size` is ignored while stacked; the saved desktop size is kept by the application and applies again when the viewport widens.",
          "There is no touch resize on phones. If a region needs to be hidden to save space, offer a [[disclosure]] or a button, not a gesture.",
          "Landscape on a tablet can cross 48rem and restore the separator; its 2.75rem-wide hit area and `touch-action: none` are there for touch dragging handled by the application."
        ]
      },
      html: `<ef-resizable-split-pane class="ef-component-tag">
  <section class="ef-split-pane" data-ef-resizable aria-label="Query editor" style="--ef-split-size: 50%">
    <div id="resizable-split-pane-mobile-query">
      <h2>Query</h2>
      <p><code>select region, sum(total) from orders group by region</code></p>
    </div>
    <div class="ef-split-pane__separator" role="separator" tabindex="0" aria-orientation="vertical" aria-controls="resizable-split-pane-mobile-query" aria-label="Resize query" aria-valuemin="30" aria-valuemax="70" aria-valuenow="50"></div>
    <aside aria-label="Query results">
      <h3>Results</h3>
      <p>4 rows · 38 ms</p>
    </aside>
  </section>
</ef-resizable-split-pane>`
    }
  ],
  api: {
    attributes: [
      { name: "data-ef-resizable", on: "root .ef-split-pane", values: "boolean", default: "absent", description: "Required. Switches the split to the three-track resizable layout." },
      { name: "style", on: "root", values: "--ef-split-size (and optional --ef-split-min, --ef-split-max)", default: "--ef-split-size: 60%", description: "The application writes the authoritative primary size here, usually restored from saved preferences." },
      { name: "role", on: "separator", values: "separator", default: "—", description: "Required. A focusable separator is announced as a window splitter with a value." },
      { name: "tabindex", on: "separator", values: "0", default: "—", description: "Makes the separator focusable so keyboard users can resize." },
      { name: "aria-orientation", on: "separator", values: "vertical", default: "horizontal for separator", description: "The separator line runs vertically between side-by-side panes." },
      { name: "aria-controls", on: "separator", values: "id of the primary region", default: "—", description: "Identifies the region whose size the separator changes." },
      { name: "aria-label", on: "separator", values: "string", default: "—", description: "Names what is being resized, for example \"Resize working surface\"." },
      { name: "aria-valuenow", on: "separator", values: "number", default: "—", description: "Current primary size in the application's unit (usually percent). The application must update it together with `--ef-split-size`." },
      { name: "aria-valuemin", on: "separator", values: "number", default: "—", description: "Smallest legal size. Keep it consistent with `--ef-split-min`." },
      { name: "aria-valuemax", on: "separator", values: "number", default: "—", description: "Largest legal size. Keep it consistent with `--ef-split-max`." },
      { name: "aria-valuetext", on: "separator", values: "string", default: "—", description: "Optional human wording such as \"Collapsed\" when a number alone is unclear." },
      { name: "data-ef-manipulation", on: "root", values: "resizing", default: "absent", description: "Set by the application only while a drag is in progress; removed on release so the pane settles." },
      { name: "data-ef-collapsed", on: "root", values: "boolean", default: "absent", description: "Set by the application to pin the primary region to its minimum." },
      { name: "data-ef-motion-weight", on: "root", values: "light | standard | heavy", default: "standard", description: "Presentation-only settle weight." }
    ],
    hooks: {
      "ef-split-pane": "Root. With `data-ef-resizable` its tracks are clamped primary size, separator, remaining space.",
      "ef-split-pane__separator": "The handle: 2.75rem-wide hit area, 2px drawn line, col-resize cursor and `touch-action: none` so application pointer handling is not interrupted by scrolling.",
      "data-ef-resizable": "Enables the resizable track list and the settle transition.",
      "data-ef-manipulation": "`resizing` removes the transition and shows a col-resize cursor, so the pane follows the written size exactly.",
      "data-ef-collapsed": "Overrides the track list to `var(--ef-split-min) auto minmax(0, 1fr)`, winning over the inline size.",
      "data-ef-motion-weight": "Light, standard or heavy settle response.",
      "--ef-split-size": "Authoritative primary size written by the application. Default `60%`.",
      "--ef-split-min": "Minimum legal primary size. Default `16rem`.",
      "--ef-split-max": "Maximum legal primary size. Default `calc(100% - 16rem)`, which reserves 16rem for the secondary region."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus to and from the separator. This is the only native behavior; the separator is a focusable div." },
      { keys: "Left / Right Arrow", action: "Application or Limen must implement: step the size down or up and write `--ef-split-size` and aria-valuenow." },
      { keys: "Home / End", action: "Application or Limen should implement: jump to the minimum or maximum legal size." },
      { keys: "Enter", action: "Application or Limen may implement: toggle `data-ef-collapsed` and restore the previous size." }
    ],
    events: [],
    form: "Not a form control. Persisting the size is application state, not form data."
  },
  states: [
    { name: "Resting", how: "data-ef-resizable with --ef-split-size", description: "Primary width is the clamped size; changes settle with a damped inertial transition." },
    { name: "Resizing", how: "data-ef-manipulation=\"resizing\"", description: "No transition: the width tracks every write immediately, with a col-resize cursor." },
    { name: "Collapsed", how: "data-ef-collapsed", description: "Primary pinned to `--ef-split-min`, regardless of the inline size." },
    { name: "Clamped", how: "--ef-split-size outside min/max", description: "Drawn at the nearest legal bound; the application should also clamp its stored value and aria-valuenow." },
    { name: "Separator focus", how: ":focus-visible on .ef-split-pane__separator", description: "Two-tone inset ring on the handle." },
    { name: "Stacked", how: "@media (max-width: 48rem)", description: "Single column; the separator is hidden." }
  ],
  accessibility: {
    forma: [
      "Provides a separator hit area at least 44px wide and tall, and a visible focus ring that works on light and dark surfaces.",
      "Clamps the drawn size to legal bounds in CSS, so users never see a pane narrower than its minimum.",
      "Draws the separator line in CanvasText under forced colors.",
      "Stacks the panes and removes the separator at narrow widths so small screens do not depend on resizing."
    ],
    consumer: [
      "Implement keyboard resizing (Arrow keys at minimum) on the focused separator; resizing must never require a pointer drag.",
      "Keep aria-valuenow, aria-valuemin and aria-valuemax in sync with `--ef-split-size` and the CSS bounds.",
      "Label the separator with what it resizes and point aria-controls at the primary region.",
      "Offer a way to reset the size (for example Enter or a double-click handled by the application) and persist the user's choice if expected.",
      "Keep focus on the separator after keyboard steps and after collapse or restore."
    ]
  },
  responsive: [
    "Wide: `clamp(var(--ef-split-min), var(--ef-split-size), var(--ef-split-max)) auto minmax(0, 1fr)` with no column gap; the separator provides the spacing.",
    "At 48rem and below: one column; the separator is not displayed.",
    "Percent sizes are relative to the pane, so the same saved value adapts to different window widths, still within bounds.",
    "Both regions shrink with `min-inline-size: 0`; wide content inside needs its own [[bounded-overflow]] region."
  ],
  motion: [
    "Direct manipulation: while `data-ef-manipulation=\"resizing\"` the transition duration is `--ef-motion-direct-duration` (0ms), so there is no pointer lag.",
    "Settling after release, a keyboard step or collapse animates `grid-template-columns` with the inertial duration and the damped easing: no overshoot, and a new write re-targets from the current position.",
    "Because the track list is clamped, the settle can never pass through an illegal size.",
    "`data-ef-motion-weight` changes perceived mass for the settle only.",
    "Under `prefers-reduced-motion: reduce` the transition is 0.01ms, so the pane jumps directly to its final size."
  ],
  guidance: {
    do: [
      "Write a single size value from both pointer and keyboard code paths so they always agree.",
      "Choose bounds that keep both regions usable, and mirror them in the separator's aria values."
    ],
    avoid: [
      "Shipping the separator without keyboard support or without any application behavior.",
      "Animating during the drag itself; remove `data-ef-manipulation` only on release.",
      "Using a resizable split when neither region benefits from more width."
    ]
  },
  related: [
    { slug: "split-pane", note: "The fixed version and the owner of the `.ef-split-pane` hooks." },
    { slug: "reorder-states", note: "The drag and drop presentation hooks that share the same direct-manipulation model." },
    { slug: "workspace-shell", note: "Fixed navigation, work and inspector regions without resizing." },
    { slug: "flyout", note: "Use when a panel should open and close rather than resize." }
  ]
};
