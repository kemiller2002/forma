export default {
  name: "Metric value change",
  category: "data",
  behavior: "Application state",
  summary: "A metric whose authoritative value updates immediately; a neutral perceptual tint marks the update without counting through invented numbers or implying direction.",
  purpose: {
    description: "When the application publishes a new value for a metric, it replaces the value element and marks the new element with `data-ef-value-change`. The new text is fully legible from the first frame; Forma only fades a neutral surface tint from behind it. The tint is the same for increases, decreases and status changes, so motion never implies direction, success or severity. What changed, and by how much, is stated in text and announced by an application-owned polite live region.",
    useWhen: [
      "A metric or status value on screen is replaced while the user is looking at it, for example after polling or a push update.",
      "Users should notice that a value changed without the change being dramatized.",
      "The previous value matters and can be stated in an announcement or context line."
    ],
    avoidWhen: [
      "The value is rendered for the first time on page load: render it without the attribute, as a plain [[metric-card]].",
      "Progress toward completion is shown: use [[progress-bar]], which projects the authoritative value directly.",
      "The change needs the user's decision or is an error: use [[alert]] or [[operation-status]] rather than a transient tint.",
      "The goal is to show movement over time: show the history in a [[timeline]] or a chart with a text equivalent."
    ],
    characteristics: [
      "No count-through: the element only ever contains the final value, so no invented intermediate numbers appear.",
      "The tint starts at `--ef-color-surface-secondary` via `@starting-style` and fades to transparent; text contrast is unaffected at every frame.",
      "Works on any element: the selector is `:where([data-ef-value-change])`, with zero specificity so component styles still win.",
      "Under reduced motion and in forced-colors mode there is no transition; the new value simply appears."
    ]
  },
  examples: [
    {
      id: "status-change",
      title: "Status value changed",
      description: "A non-numeric metric changes from Degraded to Operational. The replaced value receives the same neutral tint a number would, and the live region states the old and new values in words.",
      html: `<ef-metric-value-change class="ef-component-tag">
  <article class="ef-metric-card" aria-labelledby="metric-value-change-status-change-label">
    <div class="ef-metric-card__label" id="metric-value-change-status-change-label">Payment gateway</div>
    <div class="ef-metric-card__value" data-ef-value-change>Operational</div>
    <p><span class="ef-status-lozenge" data-state="ok">All regions responding</span></p>
    <p class="ef-visually-hidden" aria-live="polite">Payment gateway changed from Degraded to Operational.</p>
  </article>
</ef-metric-value-change>`
    },
    {
      id: "detail-value-update",
      title: "Updated value in a detail list",
      description: "The attribute is not limited to metric cards. Here one value in a [[key-value-list]] was replaced after a sync; only that `dd` is marked, and the other rows stay still.",
      html: `<ef-metric-value-change class="ef-component-tag">
  <section aria-labelledby="metric-value-change-detail-value-update-title">
    <h3 id="metric-value-change-detail-value-update-title">Warehouse stock</h3>
    <dl class="ef-key-value-list">
      <div><dt>SKU</dt><dd><span class="ef-identifier">BRK-2210</span></dd></div>
      <div><dt>On hand</dt><dd data-ef-value-change>186 units</dd></div>
      <div><dt>Reserved</dt><dd>40 units</dd></div>
    </dl>
    <p class="ef-visually-hidden" aria-live="polite">On hand updated to 186 units, down from 240.</p>
  </section>
</ef-metric-value-change>`
    },
    {
      id: "mobile-updated-metric",
      title: "Mobile updated metric",
      description: "A metric card at phone width right after an update. The tint covers only the value element; layout does not move when the value is replaced.",
      mobile: {
        height: 320,
        notes: [
          "The tint is background color only; no position, size or opacity changes, so nothing shifts on a small screen.",
          "The value keeps the metric card's `clamp(2rem, 8vw, 3.5rem)` size. A longer new value wraps onto a new line rather than overflowing.",
          "The polite live region announces the change on phones with a screen reader, independent of whether the tint was seen.",
          "Orientation changes do not re-trigger the tint; it only runs when the application inserts a new marked element."
        ]
      },
      html: `<ef-metric-value-change class="ef-component-tag">
  <article class="ef-metric-card" aria-labelledby="metric-value-change-mobile-updated-metric-label">
    <div class="ef-metric-card__label" id="metric-value-change-mobile-updated-metric-label">Open incidents</div>
    <div class="ef-metric-card__value" data-ef-value-change>5</div>
    <p>Was 6 at 09:10 UTC.</p>
    <p class="ef-visually-hidden" aria-live="polite">Open incidents updated to 5, down from 6.</p>
    <a href="#metric-value-change-mobile-updated-metric-incidents">View incidents</a>
  </article>
</ef-metric-value-change>`
    }
  ],
  api: {
    attributes: [
      { name: "data-ef-value-change", on: "the replaced value element", values: "present (no value)", default: "absent", description: "Marks a freshly inserted value element as an update. Add it only to the new element the application inserts, never on first render." },
      { name: "aria-live", on: "a visually hidden paragraph", values: "polite", default: "—", description: "Application-owned announcement stating the new value and, where useful, the previous one." },
      { name: "aria-labelledby", on: "article.ef-metric-card", values: "id of the label", default: "—", description: "Names the card so the announcement and value are associated with a metric." }
    ],
    hooks: {
      "data-ef-value-change": "Presence starts a neutral background tint (`--ef-color-surface-secondary`) that fades to transparent over `--ef-motion-perceptual-emphasis-duration`. Zero specificity; applies to any element.",
      "ef-metric-card__value": "Typical host of the attribute; see [[metric-card]].",
      "--ef-motion-perceptual-emphasis-duration": "Duration of the fade. Default 180ms (the standard primitive duration).",
      "--ef-motion-perceptual-easing": "Easing of the fade. Default `cubic-bezier(0.2, 0, 0, 1)`."
    },
    keyboard: [
      { keys: "None", action: "The update is not interactive and does not move focus." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Settled", how: "no data-ef-value-change, or the fade has finished", description: "Value on a transparent background." },
    { name: "Just updated", how: "newly inserted element with data-ef-value-change", description: "The value appears at once on a neutral tint that fades away." },
    { name: "Reduced motion or forced colors", how: "prefers-reduced-motion: reduce or forced-colors: active", description: "Transition removed; the new value appears with no emphasis motion." }
  ],
  accessibility: {
    forma: [
      "The new value is the element's only text from the first frame, at full opacity and full contrast.",
      "The emphasis is identical for every kind of change, so it carries no meaning that color-blind or low-vision users would miss.",
      "Removes the transition under `prefers-reduced-motion: reduce` and in forced-colors mode."
    ],
    consumer: [
      "Replace the value element (or insert a new one) and add `data-ef-value-change` to the new element; toggling the attribute on an existing element does not replay `@starting-style`.",
      "Announce meaningful changes in a polite live region, including direction and previous value in words.",
      "Throttle announcements for values that update frequently so the live region does not chatter.",
      "Keep any status text (for example a [[status-lozenge]]) in sync with the value in the same update."
    ]
  },
  responsive: [
    "No layout change: the tint is a background color on the existing box.",
    "Behaves the same at every width and orientation; the host component (for example [[metric-card]]) owns sizing."
  ],
  motion: [
    "Perceptual interpolation of `background-color` only: from `--ef-color-surface-secondary` (via `@starting-style`) to transparent over `--ef-motion-perceptual-emphasis-duration` (180ms) with `--ef-motion-perceptual-easing`.",
    "No spatial motion and no mass: the value does not slide, scale, fade in or count through intermediate numbers.",
    "The same fade is used for increases, decreases, unchanged republishes and status changes.",
    "A second update replaces the element again and restarts the fade from the new element; nothing queues.",
    "Under `prefers-reduced-motion: reduce` and `forced-colors: active` the transition is `none`."
  ],
  guidance: {
    do: [
      "Mark only the value that changed, not the whole card or page.",
      "State the change in words where it matters (\"down from 240\")."
    ],
    avoid: [
      "Adding the attribute on initial render, which makes every value flash on load.",
      "Coloring the tint by direction or adding arrows that animate.",
      "Using the tint as the only signal for a change the user must act on."
    ]
  },
  related: [
    { slug: "metric-card", note: "The static card; use it for the first render and add the value-change marker only on later updates." },
    { slug: "progress-bar", note: "Determinate progress projected directly from the authoritative value." },
    { slug: "operation-status", note: "For changes whose outcome the user must understand or act on." },
    { slug: "freshness", note: "States how old a value is when updates are infrequent or late." }
  ]
};
