export default {
  name: "Switch",
  category: "forms",
  behavior: "Native HTML",
  summary: "A checkbox-backed on/off preference control with role=switch and a visible track/thumb treatment.",
  purpose: {
    description: "A switch turns a single setting on or off, and the change is understood to take effect as a setting rather than as an answer to a question. Forma renders it from a native `input type=\"checkbox\"` with `role=\"switch\"`, so the browser owns checked state, keyboard toggling, form submission and reset. The track and thumb are presentation derived from `:checked`.",
    useWhen: [
      "A preference or setting is either on or off, such as notifications, dark mode or auto-save.",
      "The user expects the setting to read as a physical toggle in a settings list.",
      "The control sits in a list of independent settings where each row can change on its own."
    ],
    avoidWhen: [
      "The user is answering a yes/no question that can also be unanswered: use [[binary-choice]], which keeps Unanswered distinct from No.",
      "The user is agreeing to terms or selecting items from a set: use [[checkbox]] or [[multi-choice]].",
      "Two or more mutually exclusive options are shown: use [[segmented-control]] or [[choice-group]].",
      "Turning the setting on requires confirmation or an asynchronous permission check before it is legal; present a [[button]] that opens a [[dialog]] instead of a switch that appears to succeed immediately."
    ],
    characteristics: [
      "The whole label is the touch target; the native input is stretched invisibly over the component.",
      "State changes immediately on activation. Motion never delays the checked value.",
      "Thumb position (not only color) communicates on versus off, and forced-colors mode uses system Highlight colors."
    ]
  },
  examples: [
    {
      id: "notification-preferences",
      title: "Notification preferences",
      description: "Independent settings stacked in a fieldset. Each switch carries a label and a description linked with aria-describedby, and one starts checked.",
      html: `<ef-switch class="ef-component-tag">
  <fieldset class="ef-stack" data-density="compact">
    <legend>Notifications</legend>
    <label class="ef-switch">
      <input class="ef-switch__input" type="checkbox" role="switch" name="notify-deploys" value="on" checked aria-describedby="notify-deploys-description">
      <span class="ef-switch__track" aria-hidden="true"></span>
      <span class="ef-switch__text">
        <span class="ef-switch__label">Deployment results</span>
        <span class="ef-switch__description" id="notify-deploys-description">Email me when a deployment I started finishes or fails.</span>
      </span>
    </label>
    <label class="ef-switch">
      <input class="ef-switch__input" type="checkbox" role="switch" name="notify-digest" value="on" aria-describedby="notify-digest-description">
      <span class="ef-switch__track" aria-hidden="true"></span>
      <span class="ef-switch__text">
        <span class="ef-switch__label">Weekly digest</span>
        <span class="ef-switch__description" id="notify-digest-description">A Monday summary of activity across all projects.</span>
      </span>
    </label>
  </fieldset>
</ef-switch>`
    },
    {
      id: "disabled-by-policy",
      title: "Disabled by policy",
      description: "A setting the organization has locked. The input is natively disabled, so it is skipped by keyboard focus and excluded from form submission; the description states why, because a dimmed control alone does not explain itself.",
      html: `<ef-switch class="ef-component-tag">
  <label class="ef-switch">
    <input class="ef-switch__input" type="checkbox" role="switch" name="policy-mfa" value="on" checked disabled aria-describedby="policy-mfa-description">
    <span class="ef-switch__track" aria-hidden="true"></span>
    <span class="ef-switch__text">
      <span class="ef-switch__label">Require two-step sign-in</span>
      <span class="ef-switch__description" id="policy-mfa-description">Locked on by your organization's security policy. Contact an administrator to change it.</span>
    </span>
  </label>
</ef-switch>`
    },
    {
      id: "motion-weight-and-long-label",
      title: "Heavy motion weight with a long label",
      description: "A heavy presentation weight gives the thumb a slower, more settled travel. The long translated label wraps beside the track instead of widening the page. Weight is presentation only and says nothing about importance.",
      html: `<ef-switch class="ef-component-tag">
  <label class="ef-switch" data-ef-motion-weight="heavy">
    <input class="ef-switch__input" type="checkbox" role="switch" name="archive-sync" value="on">
    <span class="ef-switch__track" aria-hidden="true"></span>
    <span class="ef-switch__text">
      <span class="ef-switch__label">Synchronisation automatique des archives de projets partagés entre tous les espaces de travail</span>
    </span>
  </label>
</ef-switch>`
    },
    {
      id: "mobile-settings-list",
      title: "Mobile settings list",
      description: "Three switches in a phone-width settings group. The label column absorbs all remaining width, so labels wrap while the 44px-tall rows keep their touch targets.",
      mobile: {
        height: 360,
        notes: [
          "The track keeps its fixed 2.75rem width; the text column takes the remaining width and wraps long labels onto several lines.",
          "Each row is at least 44px tall and the entire row, including the label text, toggles the switch on tap.",
          "Nothing scrolls horizontally at 320px; descriptions wrap under their labels.",
          "Orientation changes only reflow the text column. The control order and semantics do not change."
        ]
      },
      html: `<ef-switch class="ef-component-tag">
  <fieldset class="ef-stack">
    <legend>Privacy</legend>
    <label class="ef-switch">
      <input class="ef-switch__input" type="checkbox" role="switch" name="mobile-location" value="on" checked>
      <span class="ef-switch__track" aria-hidden="true"></span>
      <span class="ef-switch__text"><span class="ef-switch__label">Share location with my team</span></span>
    </label>
    <label class="ef-switch">
      <input class="ef-switch__input" type="checkbox" role="switch" name="mobile-presence" value="on">
      <span class="ef-switch__track" aria-hidden="true"></span>
      <span class="ef-switch__text">
        <span class="ef-switch__label">Show when I'm active</span>
        <span class="ef-switch__description">Colleagues see a presence dot next to your name.</span>
      </span>
    </label>
    <label class="ef-switch">
      <input class="ef-switch__input" type="checkbox" role="switch" name="mobile-analytics" value="on">
      <span class="ef-switch__track" aria-hidden="true"></span>
      <span class="ef-switch__text"><span class="ef-switch__label">Send anonymous usage analytics</span></span>
    </label>
  </fieldset>
</ef-switch>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "checkbox", default: "—", description: "Required. The switch is a native checkbox; do not substitute a button or div." },
      { name: "role", on: "input", values: "switch", default: "—", description: "Required. Announces on/off semantics instead of checked/not checked." },
      { name: "checked", on: "input", values: "boolean", default: "absent (off)", description: "Initial on state. The live state is the input's checked property, owned by the browser." },
      { name: "disabled", on: "input", values: "boolean", default: "absent", description: "Removes the switch from focus order and form submission and dims the row." },
      { name: "name", on: "input", values: "string", default: "—", description: "Form field name. Only submitted while the switch is on." },
      { name: "value", on: "input", values: "string", default: "\"on\"", description: "Submitted value when on." },
      { name: "aria-describedby", on: "input", values: "id of .ef-switch__description", default: "—", description: "Links the supporting description so it is announced after the label." }
    ],
    hooks: {
      "ef-switch": "Root label element. It is the grid that places track and text and makes the whole row the hit target.",
      "ef-switch__input": "The native checkbox, visually transparent and stretched over the row.",
      "ef-switch__track": "Decorative track; its ::after pseudo-element is the thumb. Mark it aria-hidden=\"true\".",
      "ef-switch__text": "Wrapper for label and description; it is the column that shrinks and wraps.",
      "ef-switch__label": "Visible accessible name.",
      "ef-switch__description": "Optional supporting text referenced by aria-describedby.",
      "data-ef-motion-weight": "Presentation-only perceived mass for thumb travel: light, standard (default) or heavy. Never encodes importance or risk.",
      "--ef-switch-width": "Track width. Default 2.75rem.",
      "--ef-switch-height": "Track height. Default 1.5rem.",
      "--ef-switch-thumb": "Thumb diameter. Default 1.125rem.",
      "--ef-switch-gap": "Inset between track edge and thumb. Default 0.1875rem."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus to and from the switch (skipped when disabled)." },
      { keys: "Space", action: "Toggles the switch. Native checkbox behavior; Enter does not toggle." }
    ],
    events: [
      { name: "input / change", description: "Native events fired by the checkbox when the user toggles it. Listen for change in application code." }
    ],
    form: "Participates as a native checkbox: submits name=value only when on, restores its initial checked attribute on form reset, and supports required."
  },
  states: [
    { name: "Off", how: "no checked attribute", description: "Thumb at the inline start, neutral track." },
    { name: "On", how: "checked / :checked", description: "Thumb at the inline end and active track color. Thumb position carries the state without color." },
    { name: "Focus", how: ":focus-visible on the input", description: "Two-tone focus ring drawn around the track, visible on both light and dark surfaces." },
    { name: "Pressed", how: ":active on the input", description: "The thumb scales up slightly while pressed. The hit target does not move." },
    { name: "Disabled", how: "disabled attribute", description: "Row at reduced opacity with a not-allowed cursor; excluded from focus and submission." }
  ],
  accessibility: {
    forma: [
      "Keeps the native checkbox as the focusable, labelled element, so the name, role=switch state and keyboard behavior come from the platform.",
      "Wraps the input in its label, so the whole row is the click and touch target.",
      "Provides a visible focus indicator on the track and a position-based on/off cue that does not rely on color.",
      "Maps the track to system Highlight/Canvas colors in forced-colors mode."
    ],
    consumer: [
      "Supply a label that names the setting, not the action (\"Weekly digest\", not \"Turn on\").",
      "Group related switches in a fieldset with a legend.",
      "Explain disabled switches in the description; do not rely on reduced opacity.",
      "If toggling triggers an asynchronous effect that can fail, report the outcome with [[alert]] or [[toast]] and restore the checked value on failure."
    ]
  },
  responsive: [
    "Intrinsic sizing: the component is an inline-grid with a fixed track column and a flexible `minmax(0, 1fr)` text column.",
    "Long labels and descriptions wrap inside the text column; the component never forces horizontal page overflow.",
    "The row keeps a 44px minimum block size at every width.",
    "There are no breakpoints. Placing switches in a [[stack]] or fieldset gives a full-width settings list on phones."
  ],
  motion: [
    "The thumb travels with the shared inertial (spring) model: a short acceleration and a light settle at the end position, communicating that the setting physically changed.",
    "`data-ef-motion-weight` changes perceived mass (light is quicker, heavy is slower and more damped). The checked state itself is immediate.",
    "The track color is a perceptual interpolation that is independent of mass.",
    "Interrupting a toggle mid-travel re-targets from the current position; the native state is always authoritative.",
    "Under `prefers-reduced-motion: reduce` travel is effectively instant and position still shows the state."
  ],
  guidance: {
    do: [
      "Apply the setting immediately when toggled, or clearly state when it takes effect.",
      "Use positive, noun-phrase labels so on means the named thing is enabled."
    ],
    avoid: [
      "Pairing a switch with a separate Save button; users expect switches to act immediately.",
      "Using motion weight to signal that one setting matters more than another.",
      "Adding On/Off text that contradicts the screen-reader state; role=switch already announces it."
    ]
  },
  related: [
    { slug: "checkbox", note: "Use for consent, selection from a list, or when the change applies only on form submit." },
    { slug: "binary-choice", note: "Use for yes/no answers where Unanswered must stay distinct." },
    { slug: "segmented-control", note: "Use for two or more mutually exclusive named options." },
    { slug: "multi-choice", note: "Use when several independent options are chosen from one set." }
  ]
};
