import { missionById } from "../example-data/nasa-spaceflight.mjs";

const apollo11 = missionById("apollo-11");
const sts31 = missionById("sts-31");

export default {
  name: "Checkbox",
  category: "forms",
  behavior: "Native HTML",
  summary: "A native checkbox with a delegated touch target, non-color checked cue, and physics-derived CSS state motion.",
  purpose: {
    description: "A checkbox records an independent yes-or-not-selected choice that usually takes effect when a form is submitted: agreeing to terms, including an option, or selecting items. Forma keeps the native `input type=\"checkbox\"` as the focusable, form-owning element, stretches it invisibly over the whole row so the label is the touch target, and draws a box with a check mark that appears on `:checked`.",
    useWhen: [
      "The user confirms or opts in to one thing, such as consent or \"Include archived items\".",
      "Several independent options can each be on or off, grouped in a fieldset.",
      "The choice applies when a form is submitted rather than immediately."
    ],
    avoidWhen: [
      "The control is a setting that takes effect immediately: use [[switch]].",
      "The user answers a yes/no question that can also be unanswered: use [[binary-choice]].",
      "Only one option in a set may be chosen: use [[choice-group]] or [[segmented-control]].",
      "The options are rich assessment answers with extra context: use [[multi-choice]], which uses the `.ef-choice` card presentation."
    ],
    characteristics: [
      "The whole row, including the label and description, toggles the checkbox.",
      "A check mark glyph, not only fill color, shows the checked state.",
      "Motion never delays the checked value; the mark animates after the state has changed."
    ]
  },
  examples: [
    {
      id: "record-confirmation",
      title: "Required mission-record confirmation",
      description: "A required acknowledgement before exporting a historical mission record. The native required constraint blocks submission while unchecked, and the label identifies exactly which NASA record is being confirmed.",
      html: `<ef-checkbox class="ef-component-tag">
  <form class="ef-stack" action="/missions/export" method="post">
    <label class="ef-checkbox">
      <input class="ef-checkbox__input" type="checkbox" name="confirm-mission" value="${apollo11.id}" required aria-describedby="checkbox-record-confirmation-description">
      <span class="ef-checkbox__box" aria-hidden="true"></span>
      <span class="ef-checkbox__text">
        <span class="ef-checkbox__label">I confirm that ${apollo11.name} is the mission record to export (required)</span>
        <span class="ef-checkbox__description" id="checkbox-record-confirmation-description">Launch: ${apollo11.launchDate}. Return: ${apollo11.returnDate}.</span>
      </span>
    </label>
    <button type="submit">Export mission record</button>
  </form>
</ef-checkbox>`
    },
    {
      id: "brief-options",
      title: "Mission brief options",
      description: "Independent export options use the same mission context. One starts checked, and one is disabled with a reason so unavailable content is not implied to be selectable.",
      html: `<ef-checkbox class="ef-component-tag">
  <fieldset class="ef-stack" data-density="compact">
    <legend>Include in ${sts31.name} mission brief</legend>
    <label class="ef-checkbox">
      <input class="ef-checkbox__input" type="checkbox" name="brief-include" value="crew" checked>
      <span class="ef-checkbox__box" aria-hidden="true"></span>
      <span class="ef-checkbox__text"><span class="ef-checkbox__label">Crew roster</span></span>
    </label>
    <label class="ef-checkbox">
      <input class="ef-checkbox__input" type="checkbox" name="brief-include" value="vehicle">
      <span class="ef-checkbox__box" aria-hidden="true"></span>
      <span class="ef-checkbox__text"><span class="ef-checkbox__label">Spacecraft and launch vehicle</span></span>
    </label>
    <label class="ef-checkbox">
      <input class="ef-checkbox__input" type="checkbox" name="brief-include" value="engineering-telemetry" disabled aria-describedby="checkbox-brief-telemetry-description">
      <span class="ef-checkbox__box" aria-hidden="true"></span>
      <span class="ef-checkbox__text">
        <span class="ef-checkbox__label">Engineering telemetry archive</span>
        <span class="ef-checkbox__description" id="checkbox-brief-telemetry-description">Unavailable in this public reference collection.</span>
      </span>
    </label>
  </fieldset>
</ef-checkbox>`
    },
    {
      id: "light-weight-long-label",
      title: "Light motion weight with a long mission label",
      description: "A light presentation weight gives the check mark a quicker settle. The real Hubble deployment description wraps beside the box; the box stays aligned to the row.",
      html: `<ef-checkbox class="ef-component-tag">
  <label class="ef-checkbox" data-ef-motion-weight="light">
    <input class="ef-checkbox__input" type="checkbox" name="include-highlight" value="${sts31.id}">
    <span class="ef-checkbox__box" aria-hidden="true"></span>
    <span class="ef-checkbox__text">
      <span class="ef-checkbox__label">Include ${sts31.name}: ${sts31.highlight} in the selected mission highlights</span>
    </span>
  </label>
</ef-checkbox>`
    },
    {
      id: "mobile-program-filter",
      title: "Mobile NASA program filter",
      description: "Program filters in a narrow panel. Every row is a full-width touch target and labels wrap instead of truncating.",
      mobile: {
        height: 340,
        notes: [
          "The box column is a fixed 1.25rem; the text column takes the remaining width and wraps long labels.",
          "Each row keeps a 44px minimum height and the whole row, not only the box, toggles the checkbox on tap.",
          "Nothing scrolls horizontally at 320px.",
          "Orientation changes only reflow the text column."
        ]
      },
      html: `<ef-checkbox class="ef-component-tag">
  <fieldset class="ef-stack" data-density="compact">
    <legend>NASA program</legend>
    <label class="ef-checkbox">
      <input class="ef-checkbox__input" type="checkbox" name="mobile-program" value="apollo" checked>
      <span class="ef-checkbox__box" aria-hidden="true"></span>
      <span class="ef-checkbox__text"><span class="ef-checkbox__label">Apollo</span></span>
    </label>
    <label class="ef-checkbox">
      <input class="ef-checkbox__input" type="checkbox" name="mobile-program" value="space-shuttle">
      <span class="ef-checkbox__box" aria-hidden="true"></span>
      <span class="ef-checkbox__text"><span class="ef-checkbox__label">Space Shuttle</span></span>
    </label>
    <label class="ef-checkbox">
      <input class="ef-checkbox__input" type="checkbox" name="mobile-program" value="artemis">
      <span class="ef-checkbox__box" aria-hidden="true"></span>
      <span class="ef-checkbox__text"><span class="ef-checkbox__label">Artemis</span></span>
    </label>
  </fieldset>
</ef-checkbox>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "checkbox", default: "—", description: "Required. The control is a native checkbox." },
      { name: "name", on: "input", values: "string", default: "—", description: "Form field name. Checkboxes in a set can share a name to submit several values." },
      { name: "value", on: "input", values: "string", default: "\"on\"", description: "Submitted value when checked." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Initial checked state. The live state is the browser-owned checked property." },
      { name: "required", on: "input", values: "boolean", default: "absent", description: "The form will not submit until this checkbox is checked. Say \"required\" in the label." },
      { name: "disabled", on: "input", values: "boolean", default: "absent", description: "Removes the checkbox from focus and submission and dims the whole row." },
      { name: "aria-describedby", on: "input", values: "id of .ef-checkbox__description", default: "—", description: "Links the supporting description." }
    ],
    hooks: {
      "ef-checkbox": "Root label element: an inline grid of box and text that makes the whole row the hit target, at least 44px tall.",
      "ef-checkbox__input": "The native checkbox, transparent and stretched over the row.",
      "ef-checkbox__box": "Decorative 1.25rem box; its ::after draws the check mark. Mark it aria-hidden=\"true\".",
      "ef-checkbox__text": "Label and description column that shrinks and wraps.",
      "ef-checkbox__label": "Visible accessible name.",
      "ef-checkbox__description": "Optional supporting text referenced by aria-describedby.",
      "data-ef-motion-weight": "Presentation-only perceived mass for the check-mark settle: light, standard (default) or heavy. Never encodes importance or risk."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus to and from the checkbox (skipped when disabled)." },
      { keys: "Space", action: "Toggles the checkbox (native)." }
    ],
    events: [
      { name: "input / change", description: "Native events when the user toggles the checkbox. Forma adds none." }
    ],
    form: "A native checkbox: submits name=value only when checked, supports required, restores its initial checked attribute on reset and is excluded when disabled."
  },
  states: [
    { name: "Unchecked", how: "no checked attribute", description: "Empty box with a functional border." },
    { name: "Checked", how: "checked / :checked", description: "Box fills with the active control color and a ✓ mark appears, so the state does not rely on color." },
    { name: "Focus", how: ":focus-visible on the input", description: "Two-tone focus ring drawn around the box." },
    { name: "Pressed", how: ":active on the input", description: "The box scales down slightly while pressed; the hit target does not move." },
    { name: "Disabled", how: "disabled attribute", description: "Whole row at reduced opacity with a not-allowed cursor." }
  ],
  accessibility: {
    forma: [
      "The native checkbox stays the focusable, labelled element, so role, state and Space activation come from the platform.",
      "The label wraps the input and the input covers the row, giving a large touch target of at least 44px height.",
      "The ✓ glyph is a non-color checked cue, and the focus ring is drawn on the visible box.",
      "Colors come from semantic tokens that project to system colors in forced-colors mode."
    ],
    consumer: [
      "Group related checkboxes in a fieldset with a legend.",
      "Say \"required\" in the label of a required checkbox and explain disabled ones in the description.",
      "Indeterminate (mixed) state can only be set from script and has no Forma styling; the application must render and announce it if needed."
    ]
  },
  responsive: [
    "Inline-grid with a fixed box column and a `minmax(0, 1fr)` text column; long labels wrap and never widen the page.",
    "Each row keeps a 44px minimum block size at every width.",
    "No breakpoints; stack rows in a fieldset or [[stack]] for full-width lists on phones."
  ],
  motion: [
    "The check mark fades in and settles with the shared inertial spring (scale and a small rotation), so checking reads as a physical mark being placed.",
    "The box fill and border change with perceptual interpolation, independent of mass.",
    "Pressing compresses the box briefly with a damped press response; the checked value changes immediately and is never delayed by motion.",
    "`data-ef-motion-weight` light, standard or heavy changes only perceived mass of the mark's settle.",
    "Under `prefers-reduced-motion: reduce` durations become effectively zero, press compression is removed, and the mark still appears."
  ],
  guidance: {
    do: [
      "Write labels as positive statements that are true when checked.",
      "Use one checkbox per independent option and a fieldset for sets."
    ],
    avoid: [
      "Using a checkbox for a setting that applies immediately; use a switch.",
      "Pre-checking consent or marketing opt-ins.",
      "Changing importance or risk through motion weight."
    ]
  },
  related: [
    { slug: "switch", note: "For on/off settings that take effect immediately." },
    { slug: "multi-choice", note: "Card-style multiple selection for assessment answers." },
    { slug: "binary-choice", note: "For yes/no answers where Unanswered must stay distinct from No." },
    { slug: "choice-group", note: "For a single choice from several options." }
  ]
};
