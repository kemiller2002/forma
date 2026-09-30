export default {
  name: "Character grid reveal",
  category: "keyboard",
  behavior: "Application / Limen",
  summary: "Optional SequentialReveal presentation: a row-major clip mask over protected text already in the DOM, static by default and under reduced motion; orchestration stays in the application.",
  purpose: {
    description: "SequentialReveal draws protected text on a [[character-grid]] as if it were being typed onto the screen, left to right and top to bottom. It is a presentation-only mask: the text is in the DOM, in the accessibility tree and in source order from time zero, and only its painting is staged with a stepped `clip-path`. It is an Echelon behavior, not authentic 3270 behavior, and it is never required. Forma supplies the mask and timing; the application or Limen decides when a reveal starts, completes it on any input, and replays it only on explicit request.",
    useWhen: [
      "A sign-on banner or screen title appears for the first time and a brief typed-on effect helps orientation.",
      "The effect can be skipped at any moment without losing information."
    ],
    avoidWhen: [
      "Messages, values, fields, keys, status or tables: they cannot reveal, and the selector does not match them.",
      "Screens users revisit to verify data; re-rendering unchanged content must never replay a reveal.",
      "Anything users must read before acting; content must never wait on motion. Use static protected text instead."
    ],
    characteristics: [
      "Static by default: nothing animates unless the grid has `data-ef-reveal=\"sequential\"` and a run has `data-ef-reveal-run`.",
      "Delay derives from the run's cell position, so reveal order is row-major order.",
      "The whole reveal is compressed to finish within `--ef-reveal-max-ms` (1500ms by default), well under WCAG 2.2.2's five seconds.",
      "Staged text is not a live region; screen readers read it immediately and in order."
    ]
  },
  examples: [
    {
      id: "title-only",
      title: "Title-only reveal on a data screen",
      description: "Only the screen title reveals, and `data-ef-reveal-rows=\"1\"` limits the timing window to the first row, so the title finishes in well under a second. Values and the message below are never staged.",
      html: `<ef-character-grid-reveal class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="7" data-ef-columns="80" data-ef-narrow="contained" data-ef-reveal="sequential" data-ef-reveal-rows="1">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-reveal-title-only-title" tabindex="0">
      <div class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-reveal-title-only-title" data-ef-reveal-run data-ef-row="1" data-ef-col="32" data-ef-len="17" data-ef-emphasis="intensified">SHIPMENT TRACKING</h2>
        <span class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="16">Shipment<span class="ef-character-grid__leader" aria-hidden="true">  . . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="3" data-ef-col="20" data-ef-len="12">SHP-00931-7</span>
        <span class="ef-character-grid__text" data-ef-row="4" data-ef-col="2" data-ef-len="16">Status<span class="ef-character-grid__leader" aria-hidden="true">  . . . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="4" data-ef-col="20" data-ef-len="10">IN TRANSIT</span>
        <p class="ef-character-grid__message" role="status" data-ef-severity="information" data-ef-row="6" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__severity"><span>INFO</span></span> SHPT000I Estimated delivery 2026-10-02.</p>
      </div>
    </div>
  </div>
</ef-character-grid-reveal>`
    },
    {
      id: "banner-capped",
      title: "Multi-line banner within the cap",
      description: "A four-line banner over a 60-column grid. Uncapped, four rows would take about three seconds; the scale factor compresses delays and durations proportionally so the whole reveal ends within 1.5 seconds.",
      html: `<ef-character-grid-reveal class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="6" data-ef-columns="60" data-ef-narrow="contained" data-ef-reveal="sequential" data-ef-reveal-rows="4">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-reveal-banner-capped-title" tabindex="0">
      <div class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-reveal-banner-capped-title" data-ef-reveal-run data-ef-row="1" data-ef-col="20" data-ef-len="21" data-ef-emphasis="intensified">NORTHWIND LOGISTICS</h2>
        <p class="ef-character-grid__text" data-ef-reveal-run data-ef-row="2" data-ef-col="21" data-ef-len="18">DISPATCH NETWORK 4</p>
        <p class="ef-character-grid__text" data-ef-reveal-run data-ef-row="3" data-ef-col="13" data-ef-len="36">Scheduled maintenance: Sun 02:00 UTC</p>
        <p class="ef-character-grid__text" data-ef-reveal-run data-ef-row="4" data-ef-col="20" data-ef-len="20" data-ef-emphasis="muted">Authorized use only.</p>
        <p class="ef-character-grid__text" data-ef-row="6" data-ef-col="2" data-ef-len="35">Press Enter to continue to sign on.</p>
      </div>
    </div>
  </div>
</ef-character-grid-reveal>`
    },
    {
      id: "completed-by-input",
      title: "Reveal completed by input",
      description: "The same banner after the user pressed a key during the reveal. The application set `data-ef-reveal=\"complete\"`, a static state: everything is painted and the input that completed it was not consumed.",
      html: `<ef-character-grid-reveal class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="6" data-ef-columns="60" data-ef-narrow="contained" data-ef-reveal="complete" data-ef-reveal-rows="4">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-reveal-completed-by-input-title" tabindex="0">
      <div class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-reveal-completed-by-input-title" data-ef-reveal-run data-ef-row="1" data-ef-col="20" data-ef-len="21" data-ef-emphasis="intensified">NORTHWIND LOGISTICS</h2>
        <p class="ef-character-grid__text" data-ef-reveal-run data-ef-row="2" data-ef-col="21" data-ef-len="18">DISPATCH NETWORK 4</p>
        <p class="ef-character-grid__text" data-ef-reveal-run data-ef-row="3" data-ef-col="13" data-ef-len="36">Scheduled maintenance: Sun 02:00 UTC</p>
        <p class="ef-character-grid__text" data-ef-reveal-run data-ef-row="4" data-ef-col="20" data-ef-len="20" data-ef-emphasis="muted">Authorized use only.</p>
        <p class="ef-character-grid__text" data-ef-row="6" data-ef-col="2" data-ef-len="35">Press Enter to continue to sign on.</p>
      </div>
    </div>
  </div>
</ef-character-grid-reveal>`
    },
    {
      id: "banner-mobile",
      title: "Sign-on banner on a phone",
      description: "A 40-column sign-on banner. The reveal timing depends on cell positions, not on viewport width, so it looks the same on a phone.",
      mobile: {
        height: 360,
        notes: [
          "Timing derives from cell coordinates and grid geometry, so a narrow viewport neither speeds up nor slows down the reveal.",
          "Text scrolled out of the contained viewport is still revealed on schedule and is already readable by assistive technology.",
          "A tap anywhere is input: the application completes the reveal and lets the tap proceed.",
          "With reduced motion enabled on the device the banner is static from the first frame."
        ]
      },
      html: `<ef-character-grid-reveal class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="6" data-ef-columns="40" data-ef-narrow="contained" data-ef-reveal="sequential" data-ef-reveal-rows="2">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-reveal-banner-mobile-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-reveal-banner-mobile-title" data-ef-reveal-run data-ef-row="1" data-ef-col="12" data-ef-len="17" data-ef-emphasis="intensified">FIELD SERVICE HUB</h2>
        <p class="ef-character-grid__text" data-ef-reveal-run data-ef-row="2" data-ef-col="11" data-ef-len="20" data-ef-emphasis="muted">Authorized use only.</p>
        <label class="ef-character-grid__label" for="character-grid-reveal-banner-mobile-tech" data-ef-row="4" data-ef-col="2" data-ef-len="12">Technician<span class="ef-character-grid__leader" aria-hidden="true"> :</span></label>
        <input class="ef-character-grid__field" id="character-grid-reveal-banner-mobile-tech" name="technician" type="text" maxlength="8" required autocomplete="username" data-ef-row="4" data-ef-col="15" data-ef-len="8">
        <div class="ef-character-grid__group" role="group" aria-label="Function keys">
          <button class="ef-character-grid__key" type="submit" name="action" value="enter" data-ef-action="enter" data-ef-row="6" data-ef-col="2" data-ef-len="13"><kbd>Enter</kbd>=Sign on</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-ef-action="pf3" data-ef-row="6" data-ef-col="17" data-ef-len="8"><kbd>PF3</kbd>=Exit</button>
        </div>
      </form>
    </div>
  </div>
</ef-character-grid-reveal>`
    }
  ],
  api: {
    attributes: [],
    hooks: {
      "data-ef-reveal": "On the grid. `sequential` runs the mask on staged runs; `complete` is the static state the application sets on any input; `static` is the static state used before a replay.",
      "data-ef-reveal-rows": "On the grid. Limits the timing window to the first N rows (1 up to the grid's rows), so a short banner is not slowed by the rows below it.",
      "data-ef-reveal-run": "On a protected `ef-character-grid__text` run only (CG-16). Opts that run into the reveal.",
      "--ef-reveal-char-ms": "Time per cell, in milliseconds as a unitless number. Default 12.",
      "--ef-reveal-line-ms": "Extra time per row. Default 40.",
      "--ef-reveal-max-ms": "Upper bound for the whole reveal. Default 1500. The scale factor is `min(1, max / (rows × (columns × char + line)))`.",
      "ef-character-grid__text": "The only run type that can reveal."
    },
    keyboard: [
      { keys: "Any key", action: "No built-in behavior. The application completes the reveal by setting `data-ef-reveal=\"complete\"` without consuming the key, so the key still does its normal job." }
    ],
    events: [],
    form: "No form behavior. Fields and keys on a revealing screen work from time zero."
  },
  states: [
    { name: "Static (default)", how: "no data-ef-reveal, or data-ef-reveal=\"static\"", description: "All text painted immediately." },
    { name: "Revealing", how: "data-ef-reveal=\"sequential\" and data-ef-reveal-run on text runs", description: "Each staged run is uncovered one cell per step after a delay based on its row and column." },
    { name: "Complete", how: "data-ef-reveal=\"complete\" (set by the application)", description: "Static and sticky: the mask is gone and does not return when focus moves." },
    { name: "Reduced motion or print", how: "prefers-reduced-motion: reduce, @media print", description: "Animation and mask removed; static presentation." }
  ],
  accessibility: {
    forma: [
      "Stages only painting: the text is in the DOM, accessibility tree and source order from time zero and is not a live region.",
      "Restricts the reveal to protected text by selector, so values, fields, keys, messages, status and tables are never hidden.",
      "Caps the total duration at 1.5 seconds by default.",
      "Removes the animation and mask under `prefers-reduced-motion: reduce` and in print.",
      "Reveals right-to-left runs from the inline start with a mirrored mask."
    ],
    consumer: [
      "Complete the reveal on any key, pointer or focus input, without calling `preventDefault`.",
      "Start a reveal only when new screen content appears; never on re-render of unchanged content.",
      "Replay only on explicit user request, by setting `static` and then `sequential` again.",
      "Do not override Forma's reduced-motion rule."
    ]
  },
  responsive: [
    "Timing depends only on cell coordinates and the grid geometry, never on viewport width.",
    "The reveal behaves the same in contained and reflowed layouts, because delay comes from declared coordinates rather than rendered position."
  ],
  motion: [
    "Each staged run animates `clip-path` from `inset(0 100% 0 0)` to `inset(0)` with `steps(len, jump-start)`, one step per character, so text appears a cell at a time.",
    "Delay is `((row − 1) × (columns × char + line) + (col − 1) × char) × scale` milliseconds and duration is `len × char × scale`, so order is row-major.",
    "The scale factor compresses everything to finish within `--ef-reveal-max-ms`; the animation runs once and never loops.",
    "Interruption is the application's `data-ef-reveal=\"complete\"`, which removes the animation for good; a CSS-only `:focus-within` interruption would replay when focus leaves.",
    "Under `prefers-reduced-motion: reduce` and in print the animation and clip mask are removed."
  ],
  guidance: {
    do: [
      "Reveal a banner or a title on first display, and keep it short with `data-ef-reveal-rows`.",
      "Keep the screen fully usable while the reveal runs."
    ],
    avoid: [
      "Revealing on every visit to a screen.",
      "Using the reveal to delay content users need to read or verify."
    ]
  },
  related: [
    { slug: "character-grid", note: "The grid whose coordinates drive the reveal timing." },
    { slug: "character-grid-workflow", note: "The reference workflow reveals only the Customer Inquiry title." },
    { slug: "skeleton", note: "Use for content that is still loading; the reveal only stages text that is already present." }
  ]
};
