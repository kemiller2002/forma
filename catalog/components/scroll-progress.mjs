export default {
  name: "Scroll progress",
  category: "feedback",
  behavior: "Native HTML",
  summary: "Decorative reading-progress bar driven directly by the scroll timeline: no smoothing or lag, absent without scroll timelines or under reduced motion.",
  purpose: {
    description: "A scroll progress bar is a thin strip that fills as the reader moves through a long page. Forma drives it entirely with a CSS scroll timeline tied to the root scroller (`scroll(root block)`), so its fill is a direct function of the page's scroll position with no smoothing. It is decorative and `aria-hidden`: the scrollbar and headings remain the real indication of position, and nothing may be triggered by the bar reaching a point.",
    useWhen: [
      "A long, linear document such as release notes, a policy or an article benefits from a light sense of how much remains.",
      "The page scrolls as a whole (the document is the scroller)."
    ],
    avoidWhen: [
      "The reader needs to know their position precisely or jump to a section: provide a table of contents or [[entry-index]] instead.",
      "Progress through a task or form: use [[progress-bar]], [[steps]] or [[survey-progress]].",
      "The content scrolls inside a nested container; the bar tracks the root scroller only and would not reflect it."
    ],
    characteristics: [
      "Hidden entirely where `animation-timeline: scroll()` is unsupported, because a static bar could not be truthful.",
      "Hidden under `prefers-reduced-motion: reduce`.",
      "`pointer-events: none`: it never blocks clicks or taps on content beneath it."
    ]
  },
  examples: [
    {
      id: "documentation-article",
      title: "Documentation article",
      description: "The bar placed as the first child of an article so it sticks to the top of the viewport while the article is on screen. In this catalog page it reflects the scroll position of the whole page, not of this example.",
      html: `<ef-scroll-progress class="ef-component-tag">
  <article class="ef-stack" aria-labelledby="scroll-progress-documentation-article-title">
    <div class="ef-scroll-progress" aria-hidden="true"></div>
    <h2 id="scroll-progress-documentation-article-title">Data retention policy</h2>
    <p>This policy describes how long each class of record is kept and who may approve an exception.</p>
    <h3>Scope</h3>
    <p>It applies to every workspace, including archived workspaces that still hold customer data.</p>
    <h3>Retention periods</h3>
    <p>Financial records are kept for seven years. Support conversations are kept for two years after the case closes.</p>
  </article>
</ef-scroll-progress>`
    },
    {
      id: "right-to-left",
      title: "Right-to-left document",
      description: "In a right-to-left context the bar fills from the right edge. The transform origin follows `:dir(rtl)`, so no extra attribute is needed on the bar itself.",
      html: `<ef-scroll-progress class="ef-component-tag">
  <article class="ef-stack" dir="rtl" lang="ar" aria-labelledby="scroll-progress-right-to-left-title">
    <div class="ef-scroll-progress" aria-hidden="true"></div>
    <h2 id="scroll-progress-right-to-left-title">ملاحظات الإصدار</h2>
    <p>يعرض شريط التقدم موضع القراءة في الصفحة فقط ولا يغني عن العناوين.</p>
  </article>
</ef-scroll-progress>`
    },
    {
      id: "mobile-release-notes",
      title: "Mobile release notes",
      description: "The bar at the top of a long article on a phone.",
      mobile: {
        height: 420,
        notes: [
          "The bar is 0.1875rem (3px) tall and spans the article's full width at every screen size.",
          "It sticks to the top edge while the article is in view and scrolls away with the article after it ends.",
          "It ignores pointer and touch input, so it never covers or intercepts taps on content under it.",
          "Rotation changes the scrollable length; the fill recalculates directly from the new scroll position without lag."
        ]
      },
      html: `<ef-scroll-progress class="ef-component-tag">
  <article class="ef-stack" aria-labelledby="scroll-progress-mobile-release-notes-title">
    <div class="ef-scroll-progress" aria-hidden="true"></div>
    <h2 id="scroll-progress-mobile-release-notes-title">Release 4.2</h2>
    <p>Bank feeds now import pending transactions separately from posted ones.</p>
    <p>Approval rules can require two approvers above a configurable amount.</p>
    <p>Exports include the approver of each payment and the time of approval.</p>
    <p>The mobile app shows the last verified time on every balance.</p>
  </article>
</ef-scroll-progress>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-hidden", on: "div.ef-scroll-progress", values: "true", default: "—", description: "Required. The bar is decorative and must not be exposed to assistive technology." },
      { name: "dir", on: "an ancestor", values: "rtl | ltr", default: "inherited", description: "In right-to-left contexts the bar fills from the right." }
    ],
    hooks: {
      "ef-scroll-progress": "The bar: sticky at the top of its container, 3px tall, accent colored, scaled horizontally by the root scroll timeline. Not displayed without scroll-timeline support or under reduced motion."
    },
    keyboard: [
      { keys: "—", action: "Not focusable. Keyboard scrolling (Space, Page Down, arrow keys) moves the page and the bar follows." }
    ],
    events: [
      { name: "—", description: "None. Do not attach behavior to the bar's visual state." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Tracking", how: "@supports (animation-timeline: scroll())", description: "Fill equals the root scroller's block progress, from empty at the top to full at the bottom." },
    { name: "Absent", how: "no scroll-timeline support, or prefers-reduced-motion: reduce", description: "`display: none`. The page reads and scrolls normally." }
  ],
  accessibility: {
    forma: [
      "Hides the bar from assistive technology and from pointer input.",
      "Removes it under reduced motion and where it cannot be accurate.",
      "Never gates content or actions on the bar."
    ],
    consumer: [
      "Keep `aria-hidden=\"true\"` on the bar.",
      "Provide headings, and for long documents a table of contents, as the real navigation aids.",
      "Use only one scroll progress bar per page."
    ]
  },
  responsive: [
    "Full width of its container at every size; height is fixed at 0.1875rem.",
    "`position: sticky` with `inset-block-start: 0` keeps it at the top only while its containing block is on screen.",
    "It tracks the root (document) scroller, so it is meaningful only on pages that scroll as a whole."
  ],
  motion: [
    "The fill is a CSS animation on `scale` bound to `animation-timeline: scroll(root block)` with linear timing: a direct projection of scroll position, with no spring, easing or lag layered on top.",
    "Scrolling backwards empties the bar at the same rate; there is no momentum of its own.",
    "Under `prefers-reduced-motion: reduce` the bar is removed rather than shown static, because a frozen bar would be untrue."
  ],
  guidance: {
    do: [
      "Place it as the first child of the long content it describes.",
      "Reserve it for long, linear reading."
    ],
    avoid: [
      "Using it inside nested scrolling panels.",
      "Triggering analytics, completion or unlocks from the bar reaching the end."
    ]
  },
  related: [
    { slug: "progress-bar", note: "Task progress driven by an application value, exposed to assistive technology." },
    { slug: "entry-index", note: "Real navigation within long content." },
    { slug: "documentation-layout", note: "Page layout for long documentation where a reading bar may sit." }
  ]
};
