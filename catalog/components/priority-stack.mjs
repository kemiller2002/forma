export default {
  name: "Priority stack",
  category: "layout",
  behavior: "Application content",
  summary: "Responsive composition where priority changes space allocation but never DOM or semantic order.",
  purpose: {
    description: "A priority stack places a small number of regions in a wrapping row. Each region wants at least 18rem; the region marked `data-priority=\"primary\"` grows twice as fast as the others, so it takes most of the extra width when there is room. When the row cannot fit the regions at their minimum, they wrap and eventually stack, always in source order. Priority is therefore expressed as space, not as position. The application decides which region is primary for the current task.",
    useWhen: [
      "One task region should dominate while one or two supporting regions stay beside it on wide screens.",
      "The layout must reflow by available space inside panes as well as pages.",
      "The primary region may change with the task, and changing an attribute is preferable to changing structure."
    ],
    avoidWhen: [
      "Supporting context is a fixed-width column: use [[rail]] or [[sidebar]].",
      "The composition has many peer regions: use [[responsive-grid]].",
      "The primary region is a focused artifact with an inspector beside it: use [[focus-stage]]."
    ],
    characteristics: [
      "Regions align to the start of the cross axis; a short region does not stretch to match a tall one.",
      "The primary region's larger share is visual only; it is not announced and does not move.",
      "Wrapping is container-driven; a viewport rule at 30rem forces every region to full width."
    ]
  },
  examples: [
    {
      id: "review-workspace",
      title: "Review workspace",
      description: "A document under review is primary; the reviewer checklist supports it. On a wide screen the document gets roughly two thirds of the row. The document is first in the source, so it is also first when stacked.",
      html: `<ef-priority-stack class="ef-component-tag">
  <div class="ef-priority-stack">
    <article class="ef-surface ef-stack" data-priority="primary" aria-labelledby="priority-stack-review-workspace-doc">
      <h2 id="priority-stack-review-workspace-doc">Vendor agreement, draft 3</h2>
      <p>Section 7 now limits liability to twelve months of fees. Section 9 adds a 30-day termination notice for convenience.</p>
    </article>
    <aside class="ef-surface ef-stack" data-density="compact" aria-labelledby="priority-stack-review-workspace-checklist">
      <h2 id="priority-stack-review-workspace-checklist">Review checklist</h2>
      <label class="ef-checkbox">
        <input class="ef-checkbox__input" type="checkbox" name="priority-stack-review-workspace-liability" value="done" checked>
        <span class="ef-checkbox__box" aria-hidden="true"></span>
        <span class="ef-checkbox__text"><span class="ef-checkbox__label">Liability cap reviewed</span></span>
      </label>
      <label class="ef-checkbox">
        <input class="ef-checkbox__input" type="checkbox" name="priority-stack-review-workspace-termination" value="done">
        <span class="ef-checkbox__box" aria-hidden="true"></span>
        <span class="ef-checkbox__text"><span class="ef-checkbox__label">Termination terms reviewed</span></span>
      </label>
    </aside>
  </div>
</ef-priority-stack>`
    },
    {
      id: "supporting-first",
      title: "Alerts before the primary task",
      description: "Two supporting regions and a primary region under `data-density=\"compact\"`. The alert summary is written first because it must be read first; the primary work area still gets the most space when the row fits.",
      html: `<ef-priority-stack class="ef-component-tag">
  <div class="ef-priority-stack" data-density="compact">
    <section class="ef-surface" aria-labelledby="priority-stack-supporting-first-alerts">
      <h2 id="priority-stack-supporting-first-alerts">Alerts</h2>
      <p>2 shipments delayed by weather.</p>
    </section>
    <section class="ef-surface" data-priority="primary" aria-labelledby="priority-stack-supporting-first-queue">
      <h2 id="priority-stack-supporting-first-queue">Dispatch queue</h2>
      <p>18 orders ready to assign. Oldest waiting 42 minutes.</p>
    </section>
    <section class="ef-surface" aria-labelledby="priority-stack-supporting-first-drivers">
      <h2 id="priority-stack-supporting-first-drivers">Drivers</h2>
      <p>11 available, 4 on break.</p>
    </section>
  </div>
</ef-priority-stack>`
    },
    {
      id: "mobile-stacked-priority",
      title: "Mobile stacked priority",
      description: "The review workspace at phone width. Every region is full width and they stack in source order; the primary attribute has no visible effect because there is no extra space to share.",
      mobile: {
        height: 460,
        notes: [
          "At 30rem and below `--ef-priority-min` becomes 100%, so each region takes its own full-width row.",
          "Above that, regions wrap as soon as the row cannot hold every region at 18rem plus the gap.",
          "Stacked order is source order; `data-priority` never moves a region to the top.",
          "Checkbox rows in the supporting region keep their full target size at 320px."
        ]
      },
      html: `<ef-priority-stack class="ef-component-tag">
  <div class="ef-priority-stack">
    <article class="ef-surface" data-priority="primary" aria-labelledby="priority-stack-mobile-stacked-priority-doc">
      <h2 id="priority-stack-mobile-stacked-priority-doc">Vendor agreement</h2>
      <p>Draft 3 is ready for legal review.</p>
    </article>
    <aside class="ef-surface" aria-labelledby="priority-stack-mobile-stacked-priority-notes">
      <h2 id="priority-stack-mobile-stacked-priority-notes">Notes</h2>
      <p>Finance approved the payment terms.</p>
    </aside>
  </div>
</ef-priority-stack>`
    }
  ],
  api: {
    attributes: [
      { name: "data-priority", on: "direct child", values: "primary", default: "absent", description: "Marks the region that receives extra space (flex-grow 2). Not a data-ef-* hook; presentation only." },
      { name: "data-density", on: ".ef-priority-stack", values: "relaxed | standard | compact | analytical", default: "absent (1rem gap)", description: "Contextual density posture. Sets the gap to 1.5rem, 1rem, or 0.5rem (compact and analytical). Not a data-ef-* hook." },
      { name: "aria-labelledby", on: "regions", values: "id of the region heading", default: "—", description: "Names each region by its heading." },
      { name: "name", on: "checkbox inputs", values: "string", default: "—", description: "Form field names used in the review example." },
      { name: "checked", on: "checkbox inputs", values: "boolean", default: "absent", description: "Initial checked state in the review example." }
    ],
    hooks: {
      "ef-priority-stack": "Wrapping flex row. Each child has basis `--ef-priority-min` and a minimum of `min(100%, --ef-priority-min)`.",
      "data-priority": "`primary` on a direct child sets flex-grow to 2, so it takes a larger share of extra space.",
      "data-density": "Density posture. relaxed = 1.5rem, standard = 1rem, compact and analytical = 0.5rem gap; overrides `--ef-priority-space`.",
      "--ef-priority-min": "Preferred and minimum width of each region. Default 18rem; 100% at 30rem viewport width and below.",
      "--ef-priority-space": "Gap between regions. Default `--ef-primitive-spacing-4` (1rem)."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through regions in source order, regardless of which is primary." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Shared row", how: "row fits all regions at --ef-priority-min", description: "Primary region grows twice as fast as the others." },
    { name: "Wrapped", how: "row too narrow for all regions", description: "Regions wrap in source order; each line's regions share its width." },
    { name: "Stacked", how: "viewport at or below 30rem", description: "Every region is full width." },
    { name: "Density posture", how: "data-density attribute", description: "Gap follows the posture." }
  ],
  accessibility: {
    forma: [
      "Priority changes space only; DOM, reading and focus order never change.",
      "Region minimums are clamped to 100%, so nothing overflows a 320px viewport.",
      "Adds no roles or landmarks."
    ],
    consumer: [
      "Put content that must be read first earlier in the source, whatever its priority.",
      "State priority or urgency in text where it matters; the extra width is not perceivable to everyone.",
      "Name each region with a heading."
    ]
  },
  responsive: [
    "Container-driven wrapping from the flex basis; the same markup adapts inside a pane or a full page.",
    "At 30rem viewport width and below every region is forced to full width.",
    "Regions with long content wrap internally; wide tables belong in [[bounded-overflow]]."
  ],
  motion: [
    "No animation: regions reflow instantly when space changes or the primary region is reassigned."
  ],
  guidance: {
    do: [
      "Mark exactly one region as primary.",
      "Keep the stack to two or three regions."
    ],
    avoid: [
      "Reordering the DOM to move the primary region; set `data-priority` instead.",
      "Using priority to express domain severity or permissions."
    ]
  },
  related: [
    { slug: "focus-stage", note: "Dominant work artifact with a fixed inspector column." },
    { slug: "responsive-grid", note: "Many regions with optional spans." },
    { slug: "switcher", note: "Exactly two regions with fixed primary and secondary sizing." },
    { slug: "stack", note: "Plain vertical rhythm without any side-by-side behavior." }
  ]
};
