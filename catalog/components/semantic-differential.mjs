export default {
  name: "Semantic differential",
  category: "assessment",
  behavior: "Native HTML",
  summary: "A bipolar textual scale that keeps the ordered response radio-backed and explicit.",
  purpose: {
    description: "A semantic differential places a response between two opposite descriptions, such as Highly manual and Highly automated. Only the endpoints have words; the positions between them are numbered. It is a native radio group in a fieldset. The visible endpoint row is decorative for assistive technology; instead each radio carries screen-reader text naming its position and, at the ends, the endpoint meaning, so the scale never depends on visual left/right placement. A separate mobile legend (1 = …, 7 = …) replaces the endpoint row on narrow screens.",
    useWhen: [
      "The question is a characterization between two opposite adjectives or states.",
      "Middle positions have no natural individual labels.",
      "Seven-position granularity suits the measurement."
    ],
    avoidWhen: [
      "Every position has its own label: use [[ordinal-scale]].",
      "The answer is a star or icon rating: use [[symbol-rating]].",
      "The value is a continuous number: use [[slider]] or [[numeric-stepper]].",
      "The scale needs fewer or more than seven positions: the current grid is fixed at seven columns, so use [[ordinal-scale]] with the matching cardinality."
    ],
    characteristics: [
      "Endpoint meaning is programmatic: the first and last radios' names include the endpoint text.",
      "The desktop endpoint row is `aria-hidden`; the mobile endpoint key is visible and readable.",
      "Numbers inside cells are `aria-hidden` and only reinforce position.",
      "The radio covers the whole cell, so the entire cell is the hit target."
    ]
  },
  examples: [
    {
      id: "saved-response",
      title: "Previously saved response",
      description: "A draft reopened with position 5 checked. The checked cell takes the inverse surface; the endpoint row reads Slow to Fast.",
      html: `<ef-semantic-differential class="ef-component-tag">
  <fieldset class="ef-semantic-differential">
    <legend class="ef-semantic-differential__legend">How would you describe code review turnaround?</legend>
    <div class="ef-semantic-differential__endpoints" aria-hidden="true">
      <span>Slow</span>
      <span>Fast</span>
    </div>
    <div class="ef-semantic-differential__scale">
      <label><input type="radio" name="differential-saved-review" value="1" required><span aria-hidden="true">1</span><span class="ef-sr-only">Slow, position 1 of 7</span></label>
      <label><input type="radio" name="differential-saved-review" value="2"><span aria-hidden="true">2</span><span class="ef-sr-only">Position 2 of 7</span></label>
      <label><input type="radio" name="differential-saved-review" value="3"><span aria-hidden="true">3</span><span class="ef-sr-only">Position 3 of 7</span></label>
      <label><input type="radio" name="differential-saved-review" value="4"><span aria-hidden="true">4</span><span class="ef-sr-only">Position 4 of 7</span></label>
      <label><input type="radio" name="differential-saved-review" value="5" checked><span aria-hidden="true">5</span><span class="ef-sr-only">Position 5 of 7</span></label>
      <label><input type="radio" name="differential-saved-review" value="6"><span aria-hidden="true">6</span><span class="ef-sr-only">Position 6 of 7</span></label>
      <label><input type="radio" name="differential-saved-review" value="7"><span aria-hidden="true">7</span><span class="ef-sr-only">Fast, position 7 of 7</span></label>
    </div>
    <div class="ef-semantic-differential__endpoints ef-semantic-differential__endpoints--mobile">
      <span>1 = Slow</span>
      <span>7 = Fast</span>
    </div>
  </fieldset>
</ef-semantic-differential>`
    },
    {
      id: "long-endpoints",
      title: "Long endpoint descriptions with help text",
      description: "Endpoints that are phrases rather than single adjectives. They sit at opposite ends of a flex row and wrap independently; help text is associated with the group.",
      html: `<ef-semantic-differential class="ef-component-tag">
  <fieldset class="ef-semantic-differential" aria-describedby="differential-long-help">
    <legend class="ef-semantic-differential__legend">Where does decision-making sit in your organization?</legend>
    <p class="ef-field__description" id="differential-long-help">Answer for architecture decisions made in the last year.</p>
    <div class="ef-semantic-differential__endpoints" aria-hidden="true">
      <span>Made centrally by a platform or architecture group</span>
      <span>Made independently by each delivery team</span>
    </div>
    <div class="ef-semantic-differential__scale">
      <label><input type="radio" name="differential-long-decisions" value="1" required><span aria-hidden="true">1</span><span class="ef-sr-only">Made centrally by a platform or architecture group, position 1 of 7</span></label>
      <label><input type="radio" name="differential-long-decisions" value="2"><span aria-hidden="true">2</span><span class="ef-sr-only">Position 2 of 7</span></label>
      <label><input type="radio" name="differential-long-decisions" value="3"><span aria-hidden="true">3</span><span class="ef-sr-only">Position 3 of 7</span></label>
      <label><input type="radio" name="differential-long-decisions" value="4"><span aria-hidden="true">4</span><span class="ef-sr-only">Position 4 of 7</span></label>
      <label><input type="radio" name="differential-long-decisions" value="5"><span aria-hidden="true">5</span><span class="ef-sr-only">Position 5 of 7</span></label>
      <label><input type="radio" name="differential-long-decisions" value="6"><span aria-hidden="true">6</span><span class="ef-sr-only">Position 6 of 7</span></label>
      <label><input type="radio" name="differential-long-decisions" value="7"><span aria-hidden="true">7</span><span class="ef-sr-only">Made independently by each delivery team, position 7 of 7</span></label>
    </div>
    <div class="ef-semantic-differential__endpoints ef-semantic-differential__endpoints--mobile">
      <span>1 = Central group</span>
      <span>7 = Each team</span>
    </div>
  </fieldset>
</ef-semantic-differential>`
    },
    {
      id: "mobile-endpoint-key",
      title: "Endpoint key on a phone",
      description: "At phone width the desktop endpoint row is hidden and the explicit 1 = / 7 = key appears below the scale.",
      mobile: {
        height: 280,
        notes: [
          "Below 44rem the aria-hidden endpoint row is hidden and the `--mobile` key, which states which number means what, is shown under the scale.",
          "The seven cells keep a 2.75rem minimum width each; where the container is narrower than about 19.25rem the scale scrolls horizontally inside its own border instead of shrinking targets.",
          "Scrolling is contained to the scale (`overscroll-behavior-inline: contain`) with a stable scrollbar gutter, so the page itself does not scroll sideways.",
          "Cells are 48px tall and the whole cell is the tap target."
        ]
      },
      html: `<ef-semantic-differential class="ef-component-tag">
  <fieldset class="ef-semantic-differential">
    <legend class="ef-semantic-differential__legend">How predictable is your release schedule?</legend>
    <div class="ef-semantic-differential__endpoints" aria-hidden="true">
      <span>Unpredictable</span>
      <span>Predictable</span>
    </div>
    <div class="ef-semantic-differential__scale">
      <label><input type="radio" name="differential-mobile-release" value="1" required><span aria-hidden="true">1</span><span class="ef-sr-only">Unpredictable, position 1 of 7</span></label>
      <label><input type="radio" name="differential-mobile-release" value="2"><span aria-hidden="true">2</span><span class="ef-sr-only">Position 2 of 7</span></label>
      <label><input type="radio" name="differential-mobile-release" value="3"><span aria-hidden="true">3</span><span class="ef-sr-only">Position 3 of 7</span></label>
      <label><input type="radio" name="differential-mobile-release" value="4"><span aria-hidden="true">4</span><span class="ef-sr-only">Position 4 of 7</span></label>
      <label><input type="radio" name="differential-mobile-release" value="5"><span aria-hidden="true">5</span><span class="ef-sr-only">Position 5 of 7</span></label>
      <label><input type="radio" name="differential-mobile-release" value="6"><span aria-hidden="true">6</span><span class="ef-sr-only">Position 6 of 7</span></label>
      <label><input type="radio" name="differential-mobile-release" value="7"><span aria-hidden="true">7</span><span class="ef-sr-only">Predictable, position 7 of 7</span></label>
    </div>
    <div class="ef-semantic-differential__endpoints ef-semantic-differential__endpoints--mobile">
      <span>1 = Unpredictable</span>
      <span>7 = Predictable</span>
    </div>
  </fieldset>
</ef-semantic-differential>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "radio", default: "—", description: "Required. Seven radios sharing one name." },
      { name: "name", on: "input", values: "string", default: "—", description: "Groups the seven positions. Unique per question." },
      { name: "value", on: "input", values: "string", default: "—", description: "Submitted position. The application decides direction and scoring." },
      { name: "required", on: "first input", values: "boolean", default: "absent", description: "Native required-group validation." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Restores a saved position." },
      { name: "aria-hidden", on: "desktop endpoints row and number spans", values: "true", default: "—", description: "Hides the visual-only endpoint row and the decorative numbers; meaning is carried by the .ef-sr-only text in each label." },
      { name: "aria-describedby", on: "fieldset", values: "id list", default: "—", description: "Associates help or error text with the scale." }
    ],
    hooks: {
      "ef-semantic-differential": "Root fieldset with browser border and padding removed.",
      "ef-semantic-differential__legend": "Question text.",
      "ef-semantic-differential__endpoints": "Flex row placing the two endpoint descriptions at opposite ends. The desktop row is aria-hidden and is hidden below 44rem.",
      "ef-semantic-differential__endpoints--mobile": "Explicit number key (1 = …, 7 = …). Hidden on wide screens and shown below 44rem.",
      "ef-semantic-differential__scale": "Bordered seven-column grid of cells, each at least 2.75rem wide. Scrolls inline within itself on very narrow containers.",
      "ef-sr-only": "Visually hidden text inside each label that names the position and, at the ends, the endpoint meaning."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus into and out of the group." },
      { keys: "Arrow keys", action: "Native radio behavior: moves to and selects the adjacent position." },
      { keys: "Space", action: "Selects the focused position when none is checked." }
    ],
    events: [
      { name: "input / change", description: "Native events from the checked radio." }
    ],
    form: "Submits name=value for the checked position; unanswered submits nothing and fails required validation."
  },
  states: [
    { name: "Unanswered", how: "no checked radio", description: "All cells neutral." },
    { name: "Selected", how: ":checked", description: "The chosen cell takes the inverse surface." },
    { name: "Focus", how: ":focus-visible on the radio", description: "Two-tone focus ring around the cell." },
    { name: "Narrow", how: "viewport below 44rem", description: "Desktop endpoints hidden; the mobile key is shown and the scale may scroll inline." }
  ],
  accessibility: {
    forma: [
      "Stretches each radio over its whole cell, so the full cell is the pointer and touch target.",
      "Hides visual-only endpoints and numbers from assistive technology to avoid double announcements.",
      "Shows selection with an inverse surface and Highlight/HighlightText in forced-colors mode."
    ],
    consumer: [
      "Put the endpoint meaning in the screen-reader text of the first and last radios, and a position in every radio's text.",
      "Keep the mobile key text consistent with the desktop endpoints.",
      "Provide all seven positions; the grid assumes seven."
    ]
  },
  responsive: [
    "Wide: seven equal columns (`minmax(2.75rem, 1fr)`) under a two-ended endpoint row.",
    "Below 44rem: the endpoint row swaps for the explicit key, and the scale gets `overflow-x: auto` with contained overscroll and a stable gutter.",
    "Long endpoint descriptions wrap within their half of the row."
  ],
  motion: [
    "Cell background, border and text color use the shared perceptual interpolation (about 120ms), identical for every position. Selection is immediate.",
    "Under `prefers-reduced-motion: reduce` the foundation makes these transitions effectively instant."
  ],
  guidance: {
    do: [
      "Choose truly opposite, parallel endpoints.",
      "State in help text which aspect is being rated when the endpoints alone are ambiguous."
    ],
    avoid: [
      "Relying on left/right placement to communicate meaning.",
      "Using the differential for value judgements where one end is plainly the right answer."
    ]
  },
  related: [
    { slug: "ordinal-scale", note: "Use when each position has its own label or a different cardinality is needed." },
    { slug: "slider", note: "Use for a continuous or many-step value." },
    { slug: "symbol-rating", note: "Use when the scale is presented as stars or icons." }
  ]
};
