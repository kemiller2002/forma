import { missionById } from "../example-data/nasa-spaceflight.mjs";

const geminiIV = missionById("gemini-iv");
const apollo11 = missionById("apollo-11");
const sts1 = missionById("sts-1");
const sts31 = missionById("sts-31");
const artemisI = missionById("artemis-i");

export default {
  name: "Segmented control",
  category: "selection",
  behavior: "Native HTML",
  summary: "Radio-backed compact selection with visible selected and focus states; where supported, one light-inertial selection indicator travels between segments without delaying native selection.",
  owns: ["ef-segmented", "ef-segment"],
  purpose: {
    description: "A segmented control shows two to five short, mutually exclusive options side by side, with the chosen one filled. It is a native radio group: each `ef-segment` is a `label` wrapping a visually hidden `input type=\"radio\"`, and all radios share one `name`. The browser owns selection, arrow-key movement, form submission and reset. Forma draws the bordered track, the filled selected segment and the focus ring, and in browsers with CSS anchor positioning one indicator travels to the newly selected segment. The selection itself is always immediate.",
    useWhen: [
      "Users switch between a few short, mutually exclusive modes or views: density, units, list/board, day/week/month.",
      "All options should be visible at once and fit on one or two lines.",
      "The choice applies immediately or is submitted with a form as one value."
    ],
    avoidWhen: [
      "Options need descriptions or long labels: use [[choice-group]].",
      "More than about five options, or options that change often: use [[select]].",
      "Several options can be chosen together: use [[multi-choice]] or checkboxes; this control is single-select only.",
      "The segments switch between panels of content with tab semantics: use [[tabs]].",
      "The setting is on/off: use [[switch]]."
    ],
    characteristics: [
      "Selection is native radio state; `:checked` drives the filled segment.",
      "Each segment is at least 44px tall and the whole label is the hit target.",
      "The selected segment is shown by an inverse fill, not by color hue alone, and by system Highlight in forced-colors mode.",
      "On narrow screens (44rem and below) the control fills the width and segments wrap instead of shrinking."
    ]
  },
  examples: [
    {
      id: "program-filter",
      title: "NASA program filter",
      description: "Four short program choices with Apollo preselected. The fieldset legend names the choice while the underlying native radios keep selection semantics and keyboard behavior.",
      html: `<ef-segmented-control class="ef-component-tag">
  <fieldset class="ef-field">
    <legend class="ef-field__label">Program</legend>
    <div class="ef-segmented">
      <label class="ef-segment"><input type="radio" name="segmented-control-program-filter" value="gemini"><span>Gemini</span></label>
      <label class="ef-segment"><input type="radio" name="segmented-control-program-filter" value="apollo" checked><span>Apollo</span></label>
      <label class="ef-segment"><input type="radio" name="segmented-control-program-filter" value="space-shuttle"><span>Shuttle</span></label>
      <label class="ef-segment"><input type="radio" name="segmented-control-program-filter" value="artemis"><span>Artemis</span></label>
    </div>
  </fieldset>
</ef-segmented-control>`
    },
    {
      id: "no-default-heavy",
      title: "Crewed or uncrewed with no default",
      description: "A required filter with nothing preselected, so the user must decide. A heavy motion weight changes only the indicator's presentation after a choice is made; it does not change the domain meaning.",
      html: `<ef-segmented-control class="ef-component-tag">
  <fieldset class="ef-field">
    <legend class="ef-field__label">Crew status</legend>
    <p class="ef-field__description" id="segmented-control-no-default-heavy-help">Required. The reference collection contains both crewed missions and ${artemisI.name}, which was uncrewed.</p>
    <div class="ef-segmented" data-ef-motion-weight="heavy">
      <label class="ef-segment"><input type="radio" name="segmented-control-no-default-heavy" value="crewed" required aria-describedby="segmented-control-no-default-heavy-help"><span>Crewed</span></label>
      <label class="ef-segment"><input type="radio" name="segmented-control-no-default-heavy" value="uncrewed" aria-describedby="segmented-control-no-default-heavy-help"><span>Uncrewed</span></label>
    </div>
  </fieldset>
</ef-segmented-control>`
    },
    {
      id: "mobile-wrapping-segments",
      title: "Mission shortcuts on a phone",
      description: "Five reference missions at phone width. The control stretches to the full width and mission labels that do not fit move to additional rows rather than shrinking below a usable size.",
      mobile: {
        height: 320,
        notes: [
          "At 44rem and below the segmented control takes the full inline size and segments share the available width.",
          "When mission names do not fit on one row they wrap to further rows; nothing scrolls horizontally at 320px.",
          "Every segment keeps its 44px minimum height, and the whole label is the tap target.",
          "Wrapping changes only visual rows; radio order stays in source order."
        ]
      },
      html: `<ef-segmented-control class="ef-component-tag">
  <fieldset class="ef-field">
    <legend class="ef-field__label">Mission</legend>
    <div class="ef-segmented">
      <label class="ef-segment"><input type="radio" name="segmented-control-mobile-wrapping-segments" value="${geminiIV.id}" checked><span>${geminiIV.name}</span></label>
      <label class="ef-segment"><input type="radio" name="segmented-control-mobile-wrapping-segments" value="${apollo11.id}"><span>${apollo11.name}</span></label>
      <label class="ef-segment"><input type="radio" name="segmented-control-mobile-wrapping-segments" value="${sts1.id}"><span>${sts1.name}</span></label>
      <label class="ef-segment"><input type="radio" name="segmented-control-mobile-wrapping-segments" value="${sts31.id}"><span>${sts31.name}</span></label>
      <label class="ef-segment"><input type="radio" name="segmented-control-mobile-wrapping-segments" value="${artemisI.id}"><span>${artemisI.name}</span></label>
    </div>
  </fieldset>
</ef-segmented-control>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "radio", default: "—", description: "Required. Each segment is a native radio." },
      { name: "name", on: "input", values: "string", default: "—", description: "Required and shared by every radio in one control; it makes them one exclusive group and is the submitted field name. Unique per control on the page." },
      { name: "value", on: "input", values: "string", default: "\"on\"", description: "Submitted value of the selected segment." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Initial selection. Omit on all radios when the user must make an active choice." },
      { name: "required", on: "input", values: "boolean", default: "absent", description: "Native constraint: the form cannot submit until one segment is selected. Put it on one radio of the group." },
      { name: "aria-describedby", on: "input", values: "id", default: "—", description: "Links help text to the options." },
      { name: "data-ef-motion-weight", on: ".ef-segmented", values: "light | standard | heavy", default: "light", description: "Perceived mass of the travelling indicator." }
    ],
    hooks: {
      "ef-segmented": "The track: an inline flex row with a functional border, secondary surface and a 2px inner gap. Also the anchor scope and host of the travelling indicator (`::before`).",
      "ef-segment": "One option: a label containing the radio and a text span. At least 44px tall; filled with the inverse surface when its radio is checked.",
      "data-ef-motion-weight": "Presentation-only perceived mass for the selection indicator: light (default for this control), standard or heavy. Never encodes importance or preference."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus into the group (to the checked segment, or the first when none is checked) and out of it. The group is one tab stop." },
      { keys: "Arrow Right / Arrow Down", action: "Moves to and selects the next segment, wrapping to the first (native radio behavior)." },
      { keys: "Arrow Left / Arrow Up", action: "Moves to and selects the previous segment, wrapping to the last." },
      { keys: "Space", action: "Selects the focused segment when none is selected yet." }
    ],
    events: [
      { name: "input / change", description: "Native events fired by the newly selected radio. Listen on the fieldset for change to apply a view or setting." }
    ],
    form: "Submits one name=value pair for the selected segment, nothing when none is selected. Supports required and native validity; form reset restores the initially checked segment."
  },
  states: [
    { name: "Unselected", how: "no checked radio", description: "Transparent segment on the secondary surface. With no checked radio in the group, no indicator is drawn." },
    { name: "Selected", how: ":checked radio", description: "Inverse (dark) surface with inverse text. With anchor positioning the fill is the travelling indicator; otherwise it is the segment's own background." },
    { name: "Focus", how: ":focus-visible on the radio", description: "Two-tone focus ring around the focused segment." },
    { name: "Pressed", how: ":active on the radio", description: "The label text scales to 97% while pressed; the segment (hit target) does not move." },
    { name: "Disabled", how: "disabled on a radio", description: "Native: cannot be selected or focused. No distinct visual treatment is provided." }
  ],
  accessibility: {
    forma: [
      "Keeps native radios as the focusable, labelled elements, so group semantics, position in set and arrow-key selection come from the platform.",
      "Keeps the radio topmost in the segment for direct and assistive hit-testing.",
      "Shows selection with a fill contrast (inverse surface) and, in forced-colors mode, Highlight/HighlightText with the indicator removed.",
      "Draws a visible focus ring on the segment that contains the focused radio."
    ],
    consumer: [
      "Wrap the control in a fieldset with a legend (or give the group an accessible name).",
      "Use short, parallel labels; move long explanations to help text linked with aria-describedby.",
      "Explain disabled options in text, since they are not visually distinct.",
      "If selecting a segment changes content elsewhere, make that change discoverable (for example a heading update or live region)."
    ]
  },
  responsive: [
    "Above 44rem the control is inline-sized to its content (`display: inline-flex`, `max-inline-size: 100%`) and wraps if the container is narrower.",
    "At 44rem and below it takes the full width and segments flex evenly from a `min(10rem, 100%)` basis, wrapping into additional rows.",
    "Segments never shrink below their 44px height and labels wrap instead of being truncated.",
    "Equal-width versus content-sized modes, icon segments and a horizontal-overflow strategy are not provided."
  ],
  motion: [
    "Where CSS anchor positioning with `anchor-scope` is supported, one indicator (`::before`) travels to the selected segment using the light inertial duration and damped easing (no overshoot), so it never implies a neighbouring option.",
    "`data-ef-motion-weight` changes the indicator's perceived mass; light is the default for this control.",
    "Segment background and text color change by perceptual interpolation; pressing compresses only the label text layer, never the hit target.",
    "Native selection is immediate. The indicator is presentation that follows the checked state and can be interrupted by the next selection.",
    "Without anchor positioning, under `prefers-reduced-motion: reduce`, and in forced-colors mode the indicator is removed and the checked segment's own fill is the complete presentation; press compression is also removed under reduced motion."
  ],
  guidance: {
    do: [
      "Keep labels to one or two words and roughly equal length.",
      "Preselect a sensible default only when one exists; leave all unchecked when the user must decide."
    ],
    avoid: [
      "Using a segmented control for navigation between pages or panels without tab semantics.",
      "Putting more options in than fit on two rows at 320px.",
      "Using motion weight to suggest one option is more important."
    ]
  },
  related: [
    { slug: "choice-group", note: "Use for single choices that need descriptions or longer labels." },
    { slug: "tabs", note: "Use when the options switch between panels of content." },
    { slug: "select", note: "Use for many options or options that change." },
    { slug: "switch", note: "Use for a single on/off setting." },
    { slug: "multi-choice", note: "Use when several options can be chosen together." }
  ]
};
