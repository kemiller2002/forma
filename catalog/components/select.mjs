import { missionById } from "../example-data/nasa-spaceflight.mjs";

const apollo8 = missionById("apollo-8");
const apollo11 = missionById("apollo-11");
const apollo13 = missionById("apollo-13");
const sts31 = missionById("sts-31");
const artemisI = missionById("artemis-i");

export default {
  name: "Select",
  category: "forms",
  behavior: "Native HTML",
  summary: "An ordinary native select with platform picker behavior and physics-derived CSS affordance motion.",
  owns: ["ef-select", "ef-select-field"],
  purpose: {
    description: "A select picks one value from a fixed list. Forma wraps a native `select` so the browser remains the authority for the value, options, keyboard, type-ahead, picker, validity and form submission. `.ef-select-field` is the labelled field (a `label` element containing label text, control and description); `.ef-select` draws a chevron indicator that rotates while the picker is open in browsers that support the `:open` pseudo-class.",
    useWhen: [
      "The user chooses exactly one value from a known list of roughly five or more options.",
      "The list is stable and the options are short text.",
      "Screen space is limited and seeing all options at once is not important."
    ],
    avoidWhen: [
      "There are two to five options and comparing them matters: use [[choice-group]] or [[segmented-control]] so all options are visible.",
      "The list is long enough that users need to type to filter, or values may be new: use [[combobox]].",
      "Several values may be chosen: use [[multi-choice]] or a set of [[checkbox]] controls; `multiple` is not styled by `.ef-select`.",
      "Options need secondary text, icons or grouping beyond `optgroup`: this needs an application-owned custom listbox."
    ],
    characteristics: [
      "Native `select` with `appearance: none`, a 44px minimum height and room at the inline end for the indicator.",
      "The indicator is decorative (`aria-hidden`) and never intercepts pointer input.",
      "The open-state rotation is progressive enhancement; the control works fully without it."
    ]
  },
  examples: [
    {
      id: "grouped-required",
      title: "Required mission with grouped programs",
      description: "NASA missions from the shared reference collection are grouped by program. An empty first option makes the unselected state explicit so the native required constraint can catch a missing choice.",
      html: `<ef-select class="ef-component-tag">
  <label class="ef-select-field">
    <span class="ef-field__label">Reference mission (required)</span>
    <span class="ef-select" data-ef-motion-weight="standard">
      <select class="ef-select__input" name="reference-mission" required aria-describedby="select-grouped-mission-description">
        <option value="">Choose a mission</option>
        <optgroup label="Apollo">
          <option value="${apollo8.id}">${apollo8.name} — ${apollo8.destination}</option>
          <option value="${apollo11.id}">${apollo11.name} — ${apollo11.destination}</option>
          <option value="${apollo13.id}">${apollo13.name} — ${apollo13.destination}</option>
        </optgroup>
        <optgroup label="Space Shuttle">
          <option value="${sts31.id}">${sts31.name} — ${sts31.spacecraft}</option>
        </optgroup>
        <optgroup label="Artemis">
          <option value="${artemisI.id}">${artemisI.name} — ${artemisI.spacecraft}</option>
        </optgroup>
      </select>
      <span class="ef-select__indicator" aria-hidden="true"></span>
    </span>
    <span class="ef-field__description" id="select-grouped-mission-description">Use one completed mission as the reference record for this example.</span>
  </label>
</ef-select>`
    },
    {
      id: "locked-by-mission",
      title: "Launch vehicle fixed by mission",
      description: "Apollo 11 is the selected reference mission, so its launch vehicle is shown as a disabled native select. The description explains why the value is unavailable rather than making the disabled state mysterious.",
      html: `<ef-select class="ef-component-tag">
  <label class="ef-select-field">
    <span class="ef-field__label">Launch vehicle</span>
    <span class="ef-select">
      <select class="ef-select__input" name="launch-vehicle" disabled aria-describedby="select-locked-launch-vehicle-description">
        <option value="saturn-v" selected>${apollo11.launchVehicle}</option>
        <option value="space-shuttle">Space Shuttle</option>
        <option value="sls">Space Launch System</option>
      </select>
      <span class="ef-select__indicator" aria-hidden="true"></span>
    </span>
    <span class="ef-field__description" id="select-locked-launch-vehicle-description">Fixed by the selected ${apollo11.name} mission record.</span>
  </label>
</ef-select>`
    },
    {
      id: "heavy-weight-long-options",
      title: "Mission highlights with long option text",
      description: "A heavy presentation weight gives the indicator a slower, more settled rotation. Real mission highlights stress the closed control with longer option labels while the platform picker can show them in full.",
      html: `<ef-select class="ef-component-tag">
  <label class="ef-select-field">
    <span class="ef-field__label">Mission highlight</span>
    <span class="ef-select" data-ef-motion-weight="heavy">
      <select class="ef-select__input" name="mission-highlight">
        <option value="${apollo11.id}">${apollo11.name} — ${apollo11.highlight}</option>
        <option value="${apollo13.id}">${apollo13.name} — ${apollo13.highlight}</option>
        <option value="${sts31.id}">${sts31.name} — ${sts31.highlight}</option>
      </select>
      <span class="ef-select__indicator" aria-hidden="true"></span>
    </span>
  </label>
</ef-select>`
    },
    {
      id: "mobile-mission",
      title: "Mobile mission picker",
      description: "A mission select at phone width. The control fills the width and the platform picker takes over on tap.",
      mobile: {
        height: 260,
        notes: [
          "The select fills the available width and keeps a 44px minimum height; the indicator stays pinned 1rem from the inline end.",
          "Tapping opens the operating system's picker, which Forma does not style.",
          "The closed control truncates a long selected option on one line; the description wraps below it.",
          "Orientation changes only change the width."
        ]
      },
      html: `<ef-select class="ef-component-tag">
  <label class="ef-select-field">
    <span class="ef-field__label">Mission</span>
    <span class="ef-select">
      <select class="ef-select__input" name="mission" autocomplete="off" aria-describedby="select-mobile-mission-description">
        <option value="${apollo8.id}">${apollo8.name}</option>
        <option value="${apollo11.id}">${apollo11.name}</option>
        <option value="${sts31.id}">${sts31.name}</option>
        <option value="${artemisI.id}">${artemisI.name}</option>
      </select>
      <span class="ef-select__indicator" aria-hidden="true"></span>
    </span>
    <span class="ef-field__description" id="select-mobile-mission-description">Completed NASA missions from the Forma reference collection.</span>
  </label>
</ef-select>`
    }
  ],
  api: {
    attributes: [
      { name: "name", on: "select", values: "string", default: "—", description: "Form field name used on submission." },
      { name: "required", on: "select", values: "boolean", default: "absent", description: "With an empty-value first option, blocks submission until a real option is chosen." },
      { name: "disabled", on: "select", values: "boolean", default: "absent", description: "Removes the select from focus and submission and dims the control." },
      { name: "selected", on: "option", values: "boolean", default: "first option", description: "Initial selection." },
      { name: "label", on: "optgroup", values: "string", default: "—", description: "Visible, announced group heading for a set of options." },
      { name: "autocomplete", on: "select", values: "country | …", default: "browser heuristic", description: "Lets the browser autofill a known value." },
      { name: "aria-describedby", on: "select", values: "id of the description", default: "—", description: "Links the `.ef-field__description` guidance." },
      { name: "aria-hidden", on: ".ef-select__indicator", values: "true", default: "—", description: "Required on the indicator so the decorative chevron is not announced." }
    ],
    hooks: {
      "ef-select-field": "Root `label` grid holding label text, the select wrapper and the description with a 0.5rem gap. Wrapping makes the label text name the select.",
      "ef-select": "Positioning wrapper for the native select and the indicator. Carries the motion scope.",
      "ef-select__input": "The native select: full width, 44px minimum height, `appearance: none`, inline-end padding for the indicator, dimmed with a not-allowed cursor when disabled.",
      "ef-select__indicator": "Decorative chevron drawn with borders. Rotates when the select is `:open`.",
      "data-ef-motion-weight": "Presentation-only perceived mass for the indicator rotation: light, standard (default) or heavy. Gravity-derived vertical travel is independent of mass."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus to and from the select." },
      { keys: "ArrowUp / ArrowDown", action: "Changes the selection or moves within the open picker (platform-dependent)." },
      { keys: "Alt+ArrowDown / Space / Enter", action: "Opens the picker; exact keys vary by platform." },
      { keys: "Printable characters", action: "Type-ahead jumps to the first matching option." },
      { keys: "Escape", action: "Closes an open picker without changing the value." }
    ],
    events: [
      { name: "input / change", description: "Native events when the selection changes. Forma adds none." }
    ],
    form: "A native select: submits the selected option's value under name, supports required, restores the initially selected option on reset and is excluded when disabled."
  },
  states: [
    { name: "Closed", how: "default", description: "Chevron points down." },
    { name: "Open", how: ":open on the select (progressive enhancement)", description: "Chevron rotates to point up and shifts slightly. Browsers without `:open` keep the closed indicator; the picker still works." },
    { name: "Focus", how: ":focus-visible", description: "Foundation two-tone focus ring around the select." },
    { name: "Disabled", how: "disabled attribute", description: "Select at reduced opacity with a not-allowed cursor." },
    { name: "Invalid", how: "native :invalid with required and an empty value", description: "Not restyled by Forma; show a [[validation-message]] after a failed submit." }
  ],
  accessibility: {
    forma: [
      "Keeps the native select, so role, value, options, type-ahead and picker are provided by the platform and assistive technology.",
      "The label element wraps the control, naming it and enlarging the click target.",
      "The indicator is decorative and pointer-transparent; the control keeps a 44px minimum height and the shared focus ring.",
      "Borders map to CanvasText in forced-colors mode."
    ],
    consumer: [
      "Give the select a visible label and mark aria-hidden=\"true\" on the indicator.",
      "Use an explicit empty first option for required selects rather than preselecting a guess.",
      "Explain a disabled select in its description and show errors with a linked [[validation-message]]."
    ]
  },
  responsive: [
    "The field and control fill their container (`inline-size: 100%`, `max-inline-size: 100%`).",
    "Long option text is truncated by the platform in the closed control; the picker shows full text.",
    "No breakpoints; on touch devices the operating system supplies its own picker."
  ],
  motion: [
    "When the picker opens, the chevron rotates 180 degrees with the shared inertial spring and drops slightly with gravity-derived timing; it reverses on close.",
    "`data-ef-motion-weight` changes the rotation's perceived mass only; vertical gravity timing does not depend on mass.",
    "The select's background and border use perceptual interpolation when they change.",
    "The value changes immediately; the indicator motion never gates the picker.",
    "Under `prefers-reduced-motion: reduce` durations become effectively zero and the vertical shift is removed; the rotation still shows the open state."
  ],
  guidance: {
    do: [
      "Order options logically (alphabetical, numerical or by frequency) and keep labels short.",
      "Prefer visible radio options for short lists where comparison helps."
    ],
    avoid: [
      "Using a select for navigation or to trigger actions on change.",
      "Replacing the native select with a custom listbox only for styling."
    ]
  },
  related: [
    { slug: "combobox", note: "Type-to-filter selection or entry of values not in the list." },
    { slug: "choice-group", note: "Visible radio options for short lists." },
    { slug: "segmented-control", note: "Compact visible choice between a few named options." },
    { slug: "multi-choice", note: "When several options may be selected." }
  ]
};
