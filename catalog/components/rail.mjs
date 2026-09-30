export default {
  name: "Rail",
  category: "layout",
  behavior: "Application content",
  summary: "Supporting rail plus flexible primary region with start/end placement and single-column reflow.",
  purpose: {
    description: "A rail is a two-column grid: a bounded supporting column between 12rem and 18rem wide and a primary column that takes the rest. `data-side=\"end\"` moves the rail track to the inline end. At 48rem viewport width and below, both collapse to one column. Because grid auto-placement follows source order, the element written first always lands in the first track: author the rail first for a start rail and the primary content first for an end rail. The application owns what the rail contains (context, evidence, controls) and whether it is shown.",
    useWhen: [
      "A supporting column (record context, evidence, inspector controls) should stay at a bounded width next to the primary work.",
      "The layout needs a predictable single breakpoint rather than content-driven wrapping.",
      "The supporting column belongs at the inline end, after the primary content in reading order."
    ],
    avoidWhen: [
      "The pair should switch by the container's own width: use [[sidebar]], which wraps intrinsically.",
      "Both regions are peers: use [[switcher]].",
      "One region is a focused work artifact with an inspector: [[focus-stage]] expresses that relationship directly.",
      "Users need to resize the columns: use [[split-pane]] with application behavior."
    ],
    characteristics: [
      "The rail track is `minmax(12rem, 18rem)`; the primary track is `minmax(50%, 1fr)`.",
      "Both children get `min-inline-size: 0`, so long content wraps instead of widening a track.",
      "Items align to the start of the block axis; a short rail does not stretch to the primary height."
    ]
  },
  examples: [
    {
      id: "case-context-rail",
      title: "Case record with context rail",
      description: "A support case: a start rail with customer context and the conversation as primary content. The rail is first in the source, so it is read first and shown first when stacked.",
      html: `<ef-rail class="ef-component-tag">
  <div class="ef-rail">
    <aside class="ef-surface ef-stack" data-density="compact" aria-labelledby="rail-case-context-rail-customer">
      <h2 id="rail-case-context-rail-customer">Customer</h2>
      <dl class="ef-key-value-list">
        <div><dt>Account</dt><dd>Contoso Pharmacy</dd></div>
        <div><dt>Plan</dt><dd>Enterprise</dd></div>
        <div><dt>Open cases</dt><dd>2</dd></div>
      </dl>
    </aside>
    <article class="ef-stack" aria-labelledby="rail-case-context-rail-title">
      <h2 id="rail-case-context-rail-title">Case 48213: Label printer offline</h2>
      <p>The store reports that the label printer stopped responding after the overnight update. A remote restart did not help.</p>
      <div class="ef-cluster"><button type="button">Reply</button><button type="button">Escalate</button></div>
    </article>
  </div>
</ef-rail>`
    },
    {
      id: "end-rail-evidence",
      title: "End rail with evidence",
      description: "`data-side=\"end\"` places the rail at the inline end. The finding is written first in the source so it occupies the primary track; the evidence follows in both reading order and position.",
      html: `<ef-rail class="ef-component-tag">
  <div class="ef-rail" data-side="end">
    <article class="ef-stack" aria-labelledby="rail-end-rail-evidence-title">
      <h2 id="rail-end-rail-evidence-title">Finding: expired TLS certificate</h2>
      <p>The certificate for api.example.com expired on 28 September. Clients that pin the chain will fail until it is replaced.</p>
    </article>
    <aside class="ef-surface ef-stack" data-density="compact" aria-labelledby="rail-end-rail-evidence-sources">
      <h3 id="rail-end-rail-evidence-sources">Evidence</h3>
      <p>Scanner run 2026-09-29 04:00 UTC</p>
      <p>Certificate serial 0x4f2a…91</p>
    </aside>
  </div>
</ef-rail>`
    },
    {
      id: "mobile-collapsed-rail",
      title: "Mobile collapsed rail",
      description: "The case layout at phone width. The grid becomes one column and the rail sits above the primary content because it comes first in the source.",
      mobile: {
        height: 480,
        notes: [
          "At 48rem viewport width and below the grid has a single `minmax(0, 1fr)` column for both start and end rails.",
          "Stacked order is source order; an end rail written after the content appears below it.",
          "The rail's 12rem minimum no longer applies once stacked, so it takes the full width at 320px.",
          "Tablets in portrait (up to 768px) are also single column; landscape tablets usually show both tracks."
        ]
      },
      html: `<ef-rail class="ef-component-tag">
  <div class="ef-rail">
    <aside class="ef-surface" aria-labelledby="rail-mobile-collapsed-rail-customer">
      <h2 id="rail-mobile-collapsed-rail-customer">Customer</h2>
      <p>Contoso Pharmacy · Enterprise</p>
    </aside>
    <article class="ef-stack" aria-labelledby="rail-mobile-collapsed-rail-title">
      <h2 id="rail-mobile-collapsed-rail-title">Case 48213</h2>
      <p>Label printer offline after the overnight update.</p>
    </article>
  </div>
</ef-rail>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "rail and primary regions", values: "id of the region heading", default: "—", description: "Names aside and article regions by their visible headings." },
      { name: "data-side", on: ".ef-rail", values: "end", default: "absent (start)", description: "Moves the rail track to the inline end. Author the primary content first in the source when using it." },
      { name: "data-density", on: "nested .ef-stack", values: "compact", default: "—", description: "Used on stacks inside the rail; it does not affect the rail grid." }
    ],
    hooks: {
      "ef-rail": "Two-column grid of a bounded rail track and a flexible primary track.",
      "data-side": "`end` swaps the track order to primary then rail. It changes track sizes only; items are still placed in source order.",
      "--ef-rail-measure": "Rail track size. Default `minmax(12rem, 18rem)`.",
      "--ef-rail-content-min": "Minimum of the primary track. Default 50%.",
      "--ef-rail-space": "Gap between the tracks. Default `--ef-primitive-spacing-5` (1.5rem)."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Follows source order, which is also the visual order for correctly authored start and end rails." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Start rail", how: "no data-side", description: "Rail track first, primary track second." },
    { name: "End rail", how: "data-side=\"end\"", description: "Primary track first, rail track second." },
    { name: "Stacked", how: "viewport at or below 48rem", description: "One column; children stack in source order." }
  ],
  accessibility: {
    forma: [
      "Uses source-order auto-placement only, so reading, focus and visual order stay aligned when authored as documented.",
      "Adds no landmarks or roles.",
      "Children cannot widen tracks beyond the viewport because they have `min-inline-size: 0`."
    ],
    consumer: [
      "Match source order to the chosen side: rail first for start, primary first for end.",
      "Label the aside so its landmark is distinguishable from others on the page.",
      "Keep essential actions in the primary region; a rail may be far from the content when stacked."
    ]
  },
  responsive: [
    "Viewport breakpoint at 48rem collapses both variants to one column.",
    "Above 48rem the rail is 12rem–18rem wide; in a narrow pane on a wide screen the tracks can be tight, so prefer [[sidebar]] inside panes.",
    "Long content wraps within its track.",
    "Wide tables in the primary region belong inside [[bounded-overflow]]."
  ],
  motion: [
    "No animation: the grid changes between two and one columns instantly."
  ],
  guidance: {
    do: [
      "Keep rail content supportive and scannable: context, evidence, related controls.",
      "Use `data-side=\"end\"` when the supporting material should be read after the primary content."
    ],
    avoid: [
      "Using `data-side=\"end\"` with the rail written first; it would land in the wide primary track.",
      "Hiding required information only in the rail."
    ]
  },
  related: [
    { slug: "sidebar", note: "Content-driven wrapping instead of a fixed breakpoint." },
    { slug: "focus-stage", note: "Dominant work surface with an inspector column." },
    { slug: "switcher", note: "Two peer regions that switch between row and stack." },
    { slug: "workspace-shell", note: "Complete application frame with its own navigation and inspector regions." }
  ]
};
