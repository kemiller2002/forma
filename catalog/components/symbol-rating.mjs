export default {
  name: "Symbol rating",
  category: "assessment",
  behavior: "Native HTML",
  summary: "Ordinal rating presented with symbols while retaining accessible textual labels.",
  purpose: {
    description: "A symbol rating presents an ordinal scale as a row of stars or other glyphs. Each glyph is a native radio in one group; the glyph is decorative (`aria-hidden`) and every option carries visually hidden text stating its position and meaning, such as \"4 of 5, satisfied\". Only the chosen symbol is highlighted: Forma does not fill preceding symbols, so the selected position is never implied by a run of color alone.",
    useWhen: [
      "A familiar star or icon rating suits the audience, such as satisfaction or quality feedback.",
      "The scale has few positions and each has a textual meaning that can be announced.",
      "Space is limited and a compact row of square targets fits better than a labelled scale."
    ],
    avoidWhen: [
      "Visible text labels are important for sighted users to interpret the answer: use [[ordinal-scale]].",
      "The rating is displayed, not entered: render text or a [[badge]], not radios.",
      "The answer is a yes/no: use [[binary-choice]]."
    ],
    characteristics: [
      "Each option is a square target at least 44 by 44px with a border.",
      "The accessible name comes from `.ef-sr-only` text, never from the glyph.",
      "The row wraps onto more lines when it does not fit.",
      "Selection is shown on the chosen symbol only, as an inverse surface."
    ]
  },
  examples: [
    {
      id: "saved-four-stars",
      title: "Saved four-star rating",
      description: "A response restored with the fourth option checked. Only that option is inverted; the text meaning is \"4 of 5, satisfied\".",
      html: `<ef-symbol-rating class="ef-component-tag">
  <fieldset class="ef-symbol-rating">
    <legend class="ef-symbol-rating__legend">How satisfied are you with the new onboarding guide?</legend>
    <div class="ef-symbol-rating__options">
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-saved-onboarding" value="1" required><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">1 of 5, very dissatisfied</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-saved-onboarding" value="2"><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">2 of 5, dissatisfied</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-saved-onboarding" value="3"><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">3 of 5, neutral</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-saved-onboarding" value="4" checked><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">4 of 5, satisfied</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-saved-onboarding" value="5"><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">5 of 5, very satisfied</span></label>
    </div>
  </fieldset>
</ef-symbol-rating>`
    },
    {
      id: "effort-icons",
      title: "Three-level effort rating with a visible key",
      description: "Non-star glyphs for a three-level effort question. A visible description spells out the key for sighted users, because distinct glyphs are not self-explanatory.",
      html: `<ef-symbol-rating class="ef-component-tag">
  <fieldset class="ef-symbol-rating" aria-describedby="symbol-effort-key">
    <legend class="ef-symbol-rating__legend">How much effort did the migration take?</legend>
    <p class="ef-field__description" id="symbol-effort-key">● low, ●● moderate, ●●● high</p>
    <div class="ef-symbol-rating__options">
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-effort-migration" value="low" required><span class="ef-symbol-rating__symbol" aria-hidden="true">●</span><span class="ef-sr-only">Low effort</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-effort-migration" value="moderate"><span class="ef-symbol-rating__symbol" aria-hidden="true">●●</span><span class="ef-sr-only">Moderate effort</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-effort-migration" value="high"><span class="ef-symbol-rating__symbol" aria-hidden="true">●●●</span><span class="ef-sr-only">High effort</span></label>
    </div>
  </fieldset>
</ef-symbol-rating>`
    },
    {
      id: "mobile-ten-point",
      title: "Ten-point rating wrapping on a phone",
      description: "Ten symbols do not fit one row at 320px, so the row wraps. Targets keep their size rather than shrinking.",
      mobile: {
        height: 280,
        notes: [
          "The options row is an inline flex container with wrapping, so symbols continue on a second line when the width runs out.",
          "Each option keeps its 2.75rem (44px) minimum width and height; targets are never compressed to force one line.",
          "Reading and keyboard order stay left to right, top to bottom, matching the value order.",
          "No horizontal scrolling at any width."
        ]
      },
      html: `<ef-symbol-rating class="ef-component-tag">
  <fieldset class="ef-symbol-rating">
    <legend class="ef-symbol-rating__legend">Rate the clarity of the incident report.</legend>
    <div class="ef-symbol-rating__options">
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-mobile-clarity" value="1" required><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">1 of 10, very unclear</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-mobile-clarity" value="2"><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">2 of 10</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-mobile-clarity" value="3"><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">3 of 10</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-mobile-clarity" value="4"><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">4 of 10</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-mobile-clarity" value="5"><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">5 of 10</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-mobile-clarity" value="6"><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">6 of 10</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-mobile-clarity" value="7"><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">7 of 10</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-mobile-clarity" value="8"><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">8 of 10</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-mobile-clarity" value="9"><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">9 of 10</span></label>
      <label class="ef-symbol-rating__option"><input type="radio" name="symbol-mobile-clarity" value="10"><span class="ef-symbol-rating__symbol" aria-hidden="true">★</span><span class="ef-sr-only">10 of 10, very clear</span></label>
    </div>
  </fieldset>
</ef-symbol-rating>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "radio", default: "—", description: "Required. One radio per symbol." },
      { name: "name", on: "input", values: "string", default: "—", description: "Groups the symbols into one answer. Unique per question." },
      { name: "value", on: "input", values: "string", default: "—", description: "Submitted rating. Meaning and scoring stay in the application." },
      { name: "required", on: "first input", values: "boolean", default: "absent", description: "Native required-group validation." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Restores a saved rating." },
      { name: "aria-hidden", on: ".ef-symbol-rating__symbol", values: "true", default: "—", description: "Required. The glyph is decorative and must not be the accessible name." },
      { name: "aria-describedby", on: "fieldset", values: "id list", default: "—", description: "Associates a key or help text with the rating." }
    ],
    hooks: {
      "ef-symbol-rating": "Root fieldset with browser border and padding removed.",
      "ef-symbol-rating__legend": "Question text.",
      "ef-symbol-rating__options": "Wrapping inline flex row of options with a 0.25rem gap.",
      "ef-symbol-rating__option": "Bordered square label, at least 44px each way. The radio inside is visually hidden.",
      "ef-symbol-rating__symbol": "The decorative glyph at 1.35rem.",
      "ef-sr-only": "Visually hidden text that gives each option its accessible name, such as \"3 of 5, neutral\"."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus into and out of the group." },
      { keys: "Arrow keys", action: "Native radio behavior: moves to and selects the adjacent rating." },
      { keys: "Space", action: "Selects the focused rating when none is checked." }
    ],
    events: [
      { name: "input / change", description: "Native events from the checked radio." }
    ],
    form: "Submits name=value for the checked symbol; unanswered submits nothing and fails required validation."
  },
  states: [
    { name: "Unanswered", how: "no checked radio", description: "All symbols neutral." },
    { name: "Selected", how: ":checked", description: "Only the chosen option takes the inverse surface. Preceding symbols are not filled." },
    { name: "Focus", how: ":focus-visible on the radio", description: "Two-tone focus ring around the option." }
  ],
  accessibility: {
    forma: [
      "Keeps the glyph out of the accessibility tree and relies on text for each option's name.",
      "Provides 44px targets with a visible border, so symbols are distinguishable without color.",
      "Uses Highlight/HighlightText for the selected option in forced-colors mode."
    ],
    consumer: [
      "Write screen-reader text for every option that includes its position and meaning.",
      "Add a visible key when the glyphs are not a widely understood convention.",
      "Do not add application styling that fills all symbols up to the selection without also keeping the chosen one distinct."
    ]
  },
  responsive: [
    "Options wrap within an inline flex row capped at 100% width.",
    "Targets keep their 44px minimum at every width; long scales take more lines rather than shrinking.",
    "There are no breakpoints."
  ],
  motion: [
    "Background, border and text color of an option use the shared perceptual interpolation (about 120ms) when selected. Selection is immediate and timing is identical for every value.",
    "Under `prefers-reduced-motion: reduce` the foundation makes these transitions effectively instant."
  ],
  guidance: {
    do: [
      "Keep scales short, typically five positions.",
      "Use the same glyph for every position on a star scale so only position carries meaning."
    ],
    avoid: [
      "Using the glyph (or its count) as the only communication of meaning.",
      "Using a symbol rating for a displayed average; that is text, not a control."
    ]
  },
  related: [
    { slug: "ordinal-scale", note: "Use when visible text labels should accompany every position." },
    { slug: "image-choice", note: "Use when options are pictures of distinct things rather than ordered positions." },
    { slug: "semantic-differential", note: "Use for positions between two opposite descriptions." }
  ]
};
