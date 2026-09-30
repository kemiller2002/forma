export default {
  name: "Split pane",
  category: "workspaces",
  behavior: "Application content",
  summary: "Pairs related regions while preserving their semantic ownership and narrow-screen order.",
  purpose: {
    description: "A split pane places two related regions side by side: a primary working region that takes most of the width and a secondary region, such as an inspector, preview or reference, beside it. Each child keeps its own semantics (article, aside, section), and the layout is a plain two-track grid that stacks in source order on narrow screens. The same root also carries the presentation hooks for the [[resizable-split-pane]], which are documented here because they live on `.ef-split-pane`; the fixed split has no behavior at all.",
    useWhen: [
      "Two regions belong to the same task and benefit from being read side by side, such as a form beside its live summary or a document beside its comments.",
      "The primary region should get roughly two thirds of the width and the secondary region has a useful minimum width.",
      "The narrow-screen order should simply be primary first, secondary second."
    ],
    avoidWhen: [
      "Users need to adjust the proportion: use [[resizable-split-pane]], with application or Limen code handling drag and keys.",
      "The secondary column should be a narrow fixed rail: use [[sidebar]] or [[rail]].",
      "One side is a list of records and the other the selected record: use [[master-detail]].",
      "Items should reflow into as many columns as fit: use [[switcher]] or [[responsive-grid]]."
    ],
    characteristics: [
      "Two tracks, `minmax(0, 2fr)` and `minmax(16rem, 1fr)` by default, both exposed as custom properties.",
      "Every direct child sets `min-inline-size: 0`, so long content wraps or scrolls instead of widening the page.",
      "At 48rem and below both regions stack in one full-width column in source order."
    ]
  },
  examples: [
    {
      id: "form-with-summary",
      title: "Form beside its order summary",
      description: "A checkout form as the primary region and a live order summary as the secondary aside. Both columns start at the top, and the summary keeps its 16rem minimum.",
      html: `<ef-split-pane class="ef-component-tag">
  <section class="ef-split-pane" aria-label="Checkout">
    <form aria-labelledby="split-pane-form-with-summary-title">
      <h2 id="split-pane-form-with-summary-title">Shipping address</h2>
      <p class="ef-stack">
        <label for="split-pane-form-with-summary-name">Full name</label>
        <input id="split-pane-form-with-summary-name" name="full-name" autocomplete="name">
      </p>
      <p class="ef-stack">
        <label for="split-pane-form-with-summary-street">Street address</label>
        <input id="split-pane-form-with-summary-street" name="street" autocomplete="street-address">
      </p>
      <button type="submit">Continue to payment</button>
    </form>
    <aside aria-labelledby="split-pane-form-with-summary-summary">
      <h3 id="split-pane-form-with-summary-summary">Order summary</h3>
      <dl class="ef-key-value-list">
        <div><dt>Items</dt><dd>3</dd></div>
        <div><dt>Subtotal</dt><dd>$184.00</dd></div>
        <div><dt>Shipping</dt><dd>Calculated next</dd></div>
      </dl>
    </aside>
  </section>
</ef-split-pane>`
    },
    {
      id: "equal-comparison",
      title: "Equal-width comparison",
      description: "Both tracks overridden to equal flexible widths through the custom properties, for reading an original and a proposed revision side by side. The secondary minimum is lowered so the halves stay equal.",
      html: `<ef-split-pane class="ef-component-tag">
  <section class="ef-split-pane" aria-label="Policy revision" style="--ef-split-primary: minmax(0, 1fr); --ef-split-secondary: minmax(0, 1fr)">
    <article aria-labelledby="split-pane-equal-comparison-current">
      <h3 id="split-pane-equal-comparison-current">Current policy</h3>
      <p>Refunds are available within 14 days of purchase for unused items.</p>
    </article>
    <article aria-labelledby="split-pane-equal-comparison-proposed">
      <h3 id="split-pane-equal-comparison-proposed">Proposed policy</h3>
      <p>Refunds are available within 30 days of purchase for unused items, and within 14 days for opened items with a restocking fee.</p>
    </article>
  </section>
</ef-split-pane>`
    },
    {
      id: "mobile-stacked",
      title: "Mobile reading order",
      description: "At phone width the reference aside stacks under the article it supports, in the same order as the source.",
      mobile: {
        height: 460,
        notes: [
          "At 48rem and below the grid becomes a single `minmax(0, 1fr)` column; the 16rem secondary minimum no longer applies, so nothing overflows at 320px.",
          "Regions stack in source order, so put the region users need first (usually the primary work) first in the markup.",
          "The gap between regions stays at the spacing token; consider a heading in the secondary region so its start is obvious after scrolling.",
          "Rotating to landscape on a large phone may cross 48rem and restore the side-by-side layout without changing semantics or focus order."
        ]
      },
      html: `<ef-split-pane class="ef-component-tag">
  <section class="ef-split-pane" aria-label="Incident write-up">
    <article aria-labelledby="split-pane-mobile-title">
      <h3 id="split-pane-mobile-title">Timeline</h3>
      <p>09:12 Alert fired for elevated error rate. 09:20 Rollback started. 09:31 Error rate normal.</p>
    </article>
    <aside aria-labelledby="split-pane-mobile-aside">
      <h3 id="split-pane-mobile-aside">Runbook</h3>
      <p>Roll back first, investigate second. Page the owning team if the rollback fails.</p>
    </aside>
  </section>
</ef-split-pane>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "root section, aside", values: "string", default: "—", description: "Names the split region and the secondary landmark when there is no visible heading to reference." },
      { name: "aria-labelledby", on: "child regions", values: "id of the region heading", default: "—", description: "Names each region by its visible heading." },
      { name: "style", on: "root", values: "custom property declarations", default: "—", description: "Where an application sets `--ef-split-primary`, `--ef-split-secondary` or `--ef-split-space` for one instance." }
    ],
    hooks: {
      "ef-split-pane": "Root two-track grid. Direct children are the regions; each is allowed to shrink.",
      "ef-split-pane__separator": "Resize handle used only with `data-ef-resizable`; see [[resizable-split-pane]]. Hidden at 48rem and below.",
      "data-ef-resizable": "Switches the root to a three-track resizable layout (primary, separator, secondary) sized by `--ef-split-size`. Presentation only; see [[resizable-split-pane]].",
      "data-ef-manipulation": "Written by application code during a resize. `resizing` makes the size track `--ef-split-size` immediately with no transition. Other values (such as `settling`) keep the damped settle. Presentation only.",
      "data-ef-collapsed": "On a resizable pane, pins the primary track to `--ef-split-min`, overriding any inline size. The application toggles it and keeps separator values in sync.",
      "data-ef-motion-weight": "Presentation-only perceived mass for resize settling: light, standard (default) or heavy. Has no effect on a fixed split, which does not animate.",
      "--ef-split-primary": "Primary track. Default `minmax(0, 2fr)`.",
      "--ef-split-secondary": "Secondary track. Default `minmax(16rem, 1fr)`.",
      "--ef-split-space": "Gap between regions. Default the 1.5rem spacing token.",
      "--ef-split-size": "Resizable only: the application's authoritative primary size. Default `60%`.",
      "--ef-split-min": "Resizable only: smallest legal primary size. Default `16rem`.",
      "--ef-split-max": "Resizable only: largest legal primary size. Default `calc(100% - 16rem)`."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through focusable content in source order, primary region first. A fixed split adds no keyboard behavior." }
    ],
    events: [],
    form: "Not a form control. A form may be one of the regions."
  },
  states: [
    { name: "Side by side", how: "viewport wider than 48rem", description: "Primary and secondary tracks with a 1.5rem gap, aligned to the top." },
    { name: "Stacked", how: "@media (max-width: 48rem)", description: "One column, source order." },
    { name: "Resizable", how: "data-ef-resizable", description: "Three-track layout driven by `--ef-split-size`; documented on [[resizable-split-pane]]." }
  ],
  accessibility: {
    forma: [
      "Never reorders the regions: visual, reading and focus order are the source order at every width.",
      "Lets each region shrink so content reflows at 320px and 400% zoom without page-level horizontal scrolling."
    ],
    consumer: [
      "Give each region its native semantics (article, aside, section, form) and a heading or accessible name.",
      "Put the primary work first in the source.",
      "Do not use the split to imply that the secondary content is less important for task completion; on phones it comes after the primary region."
    ]
  },
  responsive: [
    "Wide: `var(--ef-split-primary) var(--ef-split-secondary)`; the secondary region never drops below 16rem until the breakpoint.",
    "At 48rem and below: `grid-template-columns: minmax(0, 1fr)` stacks both regions.",
    "Direct children set `min-inline-size: 0`; wide tables or code inside a region need their own [[bounded-overflow]] container.",
    "The breakpoint is viewport-based. A split nested in a narrow column on a wide screen stays side by side, so choose [[switcher]] for container-driven reflow."
  ],
  motion: [
    "No animation for a fixed split: the columns change instantly at the breakpoint.",
    "With `data-ef-resizable` the track list settles with the damped inertial model after release or a keyboard step, and tracks directly while `data-ef-manipulation=\"resizing\"`; see [[resizable-split-pane]]."
  ],
  guidance: {
    do: [
      "Use the custom properties to change proportions for one instance rather than writing new grid CSS.",
      "Keep secondary content useful on its own when it stacks below the primary region."
    ],
    avoid: [
      "Placing a critical action only in the secondary region.",
      "Nesting split panes to build a full application frame; use [[workspace-shell]]."
    ]
  },
  related: [
    { slug: "resizable-split-pane", note: "Same root with a separator and an application-owned size." },
    { slug: "sidebar", note: "A narrow side column that wraps by its own content width." },
    { slug: "switcher", note: "Container-driven switch between row and column layout." },
    { slug: "focus-stage", note: "A dominant primary region with a bounded support column." },
    { slug: "workspace-shell", note: "Navigation, primary work, inspector and status as a full frame." }
  ]
};
