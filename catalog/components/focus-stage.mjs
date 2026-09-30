export default {
  name: "Focus stage",
  category: "workspaces",
  behavior: "Application content",
  summary: "Dominant primary work surface with subordinate supporting context that stacks without semantic reordering.",
  purpose: {
    description: "A focus stage gives one piece of work all the available space and puts supporting context, such as an inspector, checklist or reference, in a bounded column beside it. The support column has a fixed range (14rem to 20rem by default), so the primary surface grows with the window while the support stays readable but never competes. On narrow screens the support stacks after the primary work in source order. Forma owns the proportions and the stacking; what the support column contains and when it changes is application content.",
    useWhen: [
      "A single artifact is the object of work, such as a document, a design, a form or a report, and supporting controls are secondary.",
      "The support column should keep a readable width regardless of how wide the window is.",
      "Attention should land on the primary surface first at every width."
    ],
    avoidWhen: [
      "Both regions are equally important or the proportion is roughly two to one: use [[split-pane]].",
      "The support column should sit at the start (left in LTR): use [[rail]] or [[sidebar]].",
      "Users need to resize the regions: use [[resizable-split-pane]].",
      "The screen also needs navigation and a status landmark: use [[workspace-shell]]."
    ],
    characteristics: [
      "Tracks are `minmax(0, 1fr)` and `var(--ef-focus-stage-support)`, so the primary surface takes every extra pixel.",
      "Both children set `min-inline-size: 0` and align to the top.",
      "At 48rem and below the stage is one column, primary first."
    ]
  },
  examples: [
    {
      id: "article-editor",
      title: "Article editor with publishing checklist",
      description: "The article body is the dominant surface; a readiness checklist and the publish action sit in the support column. The support column is labelled so it can be reached as a landmark.",
      html: `<ef-focus-stage class="ef-component-tag">
  <section class="ef-focus-stage" aria-label="Edit article">
    <article class="ef-focus-stage__primary ef-surface" aria-labelledby="focus-stage-article-editor-title">
      <h2 id="focus-stage-article-editor-title">Why we moved billing to event sourcing</h2>
      <p>Two years ago our invoices were computed from a mutable ledger. Every correction overwrote history, and every audit started with a reconstruction.</p>
    </article>
    <aside class="ef-focus-stage__support ef-stack" aria-labelledby="focus-stage-article-editor-support">
      <h3 id="focus-stage-article-editor-support">Before publishing</h3>
      <ul>
        <li>Summary written</li>
        <li>Cover image missing</li>
        <li>Reviewer: not assigned</li>
      </ul>
      <button type="button">Request review</button>
    </aside>
  </section>
</ef-focus-stage>`
    },
    {
      id: "narrow-support",
      title: "Compact support column",
      description: "The support track is narrowed with `--ef-focus-stage-support` and the gap tightened with `--ef-focus-stage-space`, for a dense review screen where the support holds only a few properties.",
      html: `<ef-focus-stage class="ef-component-tag">
  <section class="ef-focus-stage" aria-label="Review site photo" style="--ef-focus-stage-support: minmax(10rem, 13rem); --ef-focus-stage-space: 0.75rem">
    <article class="ef-focus-stage__primary ef-surface" aria-labelledby="focus-stage-narrow-support-title">
      <h2 id="focus-stage-narrow-support-title">Site photo 14 · north fence line</h2>
      <p>Photo shows a 2 m gap in the perimeter fence beside gate 3, with fresh tyre tracks on the inside.</p>
    </article>
    <aside class="ef-focus-stage__support" aria-label="Photo properties">
      <dl class="ef-key-value-list">
        <div><dt>Taken</dt><dd>2 Oct, 10:14</dd></div>
        <div><dt>By</dt><dd>M. Chen</dd></div>
      </dl>
    </aside>
  </section>
</ef-focus-stage>`
    },
    {
      id: "mobile-stacked",
      title: "Mobile stacked support",
      description: "At phone width the support column moves below the primary work, keeping the form first in both reading and focus order.",
      mobile: {
        height: 560,
        notes: [
          "At 48rem and below the stage is a single `minmax(0, 1fr)` column; the 14rem support minimum no longer applies and nothing overflows at 320px.",
          "The support region appears after the primary region, matching source order; do not place the only submit action in the support column.",
          "Form controls in either region keep the 2.75rem minimum height from Forma's base styles.",
          "Landscape tablets above 48rem restore the side column without changing focus order."
        ]
      },
      html: `<ef-focus-stage class="ef-component-tag">
  <section class="ef-focus-stage" aria-label="Expense claim">
    <form class="ef-focus-stage__primary ef-stack" aria-labelledby="focus-stage-mobile-title">
      <h2 id="focus-stage-mobile-title">New expense</h2>
      <label for="focus-stage-mobile-amount">Amount</label>
      <input id="focus-stage-mobile-amount" name="amount" inputmode="decimal">
      <button type="submit">Submit claim</button>
    </form>
    <aside class="ef-focus-stage__support" aria-labelledby="focus-stage-mobile-support">
      <h3 id="focus-stage-mobile-support">Policy</h3>
      <p>Meals over $75 need an itemized receipt.</p>
    </aside>
  </section>
</ef-focus-stage>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "root, support aside", values: "string", default: "—", description: "Names the stage and the support landmark when they have no visible heading." },
      { name: "aria-labelledby", on: "primary and support regions", values: "id of a visible heading", default: "—", description: "Names each region by its heading." },
      { name: "style", on: "root", values: "--ef-focus-stage-support, --ef-focus-stage-space", default: "—", description: "Per-instance override of the support track and gap." }
    ],
    hooks: {
      "ef-focus-stage": "Root two-column grid: flexible primary track and bounded support track.",
      "ef-focus-stage__primary": "The dominant work surface. Often combined with `ef-surface`.",
      "ef-focus-stage__support": "The subordinate context column. Often combined with `ef-stack`.",
      "--ef-focus-stage-support": "Support track size. Default `minmax(14rem, 20rem)`.",
      "--ef-focus-stage-space": "Gap between primary and support. Default the 1.5rem spacing token."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the primary region first, then the support region. No added keyboard behavior." }
    ],
    events: [],
    form: "Not a form control. Either region may be a form."
  },
  states: [
    { name: "Staged", how: "viewport wider than 48rem", description: "Primary surface fills available space; support column stays between its minimum and maximum." },
    { name: "Stacked", how: "@media (max-width: 48rem)", description: "One column, primary first." }
  ],
  accessibility: {
    forma: [
      "Never reorders primary and support; visual, reading and focus order stay aligned.",
      "Allows both regions to shrink so content reflows at 320px and high zoom."
    ],
    consumer: [
      "Put the primary work first in the source and give each region a heading or name.",
      "Use `main` for the primary region only when the stage is the page's main content and there is no other `main`.",
      "Keep essential actions reachable from the primary region; the support column is after it on phones."
    ]
  },
  responsive: [
    "Wide: `minmax(0, 1fr) var(--ef-focus-stage-support)`; extra width always goes to the primary surface.",
    "At 48rem and below: a single column.",
    "The breakpoint is viewport-based; inside a narrow container on a wide screen the support column still takes at least 14rem, so lower `--ef-focus-stage-support` there."
  ],
  motion: [
    "No animation: the layout changes instantly at the breakpoint and nothing moves when support content changes."
  ],
  guidance: {
    do: [
      "Keep the support column short and scannable: properties, checklists, one or two actions.",
      "Use the custom properties to tune proportions instead of new grid CSS."
    ],
    avoid: [
      "Placing a second primary task in the support column.",
      "Letting the support column grow long enough that phone users must scroll past it to reach the next page section."
    ]
  },
  related: [
    { slug: "split-pane", note: "Two proportional regions, two thirds and one third by default." },
    { slug: "rail", note: "Bounded side column that can be placed at the start or the end." },
    { slug: "workspace-shell", note: "Adds navigation and a status landmark around the work." },
    { slug: "preview-surface", note: "A bounded review surface that often sits in the primary region." }
  ]
};
