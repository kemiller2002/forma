export default {
  name: "Textarea",
  category: "forms",
  behavior: "Native HTML",
  summary: "Multi-line native text entry with a visible label and description in the .ef-field structure; the browser owns resizing and form participation.",
  purpose: {
    description: "A textarea collects free-form text that may run to several sentences or lines. It uses the shared `.ef-field` structure documented on [[text-field]] around a native `textarea`, so typing, line breaks, spell checking, the resize handle, `maxlength` and form submission all come from the browser. Forma sets the border, padding, full-width sizing and 44px minimum height.",
    useWhen: [
      "The answer is prose: a change summary, a reason, a note or a message.",
      "Line breaks are part of the value.",
      "The expected length is unknown or longer than one line of a [[text-field]]."
    ],
    avoidWhen: [
      "The value is a single line such as a name or title: use [[text-field]].",
      "The user is writing a prompt or message in a conversational interface with send and attachment actions: use [[composer]].",
      "The content is structured (a list of items, key/value pairs): give each item its own control instead of asking users to format text."
    ],
    characteristics: [
      "Full width of the field column; height comes from the `rows` attribute.",
      "The browser's resize handle stays available, and `max-inline-size: 100%` stops it from pushing past the container.",
      "Character limits are native `maxlength`; any live remaining-characters count is application behavior."
    ]
  },
  examples: [
    {
      id: "rejection-reason",
      title: "Required rejection reason",
      description: "A reviewer must explain a rejection. The field is required and the error appears after an empty submit, linked through aria-describedby alongside the guidance.",
      html: `<ef-textarea class="ef-component-tag">
  <div class="ef-field">
    <label class="ef-field__label" for="textarea-rejection-reason">Reason for rejecting this change (required)</label>
    <span class="ef-field__description" id="textarea-rejection-reason-description">The author sees this text. Say what must change before you can approve.</span>
    <textarea id="textarea-rejection-reason" name="rejection-reason" rows="5" required aria-invalid="true" aria-describedby="textarea-rejection-reason-description textarea-rejection-reason-error"></textarea>
    <p class="ef-validation-message" id="textarea-rejection-reason-error">
      <span class="ef-validation-message__mark" aria-hidden="true">!</span>
      Enter a reason so the author knows what to fix.
    </p>
  </div>
</ef-textarea>`
    },
    {
      id: "read-only-incident-note",
      title: "Read-only incident note",
      description: "A note from a closed incident. readonly keeps the text focusable, selectable and submitted while preventing edits; the description explains why it is locked.",
      html: `<ef-textarea class="ef-component-tag">
  <div class="ef-field">
    <label class="ef-field__label" for="textarea-incident-note">Resolution note</label>
    <span class="ef-field__description" id="textarea-incident-note-description">Locked because the incident is closed. Reopen the incident to edit.</span>
    <textarea id="textarea-incident-note" name="resolution-note" rows="4" readonly aria-describedby="textarea-incident-note-description">Rolled back release 2026.09.3 at 14:12 UTC.
Root cause: connection pool exhausted by a retry loop in the billing worker.
Follow-up tracked in OPS-4412.</textarea>
  </div>
</ef-textarea>`
    },
    {
      id: "short-limited-bio",
      title: "Short profile bio with a limit",
      description: "A compact two-row field with a hard native character limit and spell checking left on. The limit is stated in the description because maxlength silently stops input.",
      html: `<ef-textarea class="ef-component-tag">
  <div class="ef-field">
    <label class="ef-field__label" for="textarea-bio">Short bio</label>
    <span class="ef-field__description" id="textarea-bio-description">Shown on your public profile. Up to 160 characters.</span>
    <textarea id="textarea-bio" name="bio" rows="2" maxlength="160" spellcheck="true" aria-describedby="textarea-bio-description">Platform engineer. Keeps the deploy pipeline boring.</textarea>
  </div>
</ef-textarea>`
    },
    {
      id: "mobile-feedback",
      title: "Mobile feedback form",
      description: "A feedback textarea at phone width with a submit button below it. The field fills the width and grows only as tall as its rows until the user resizes it.",
      mobile: {
        height: 400,
        notes: [
          "The textarea fills the phone width; `max-inline-size: 100%` stops the resize handle from widening it past the screen.",
          "Height comes from `rows`, so the on-screen keyboard leaves the label and the start of the text visible.",
          "Long labels and descriptions wrap above the field.",
          "The submit button keeps a 44px minimum height below the field.",
          "Landscape orientation only widens the field; the number of rows stays the same."
        ]
      },
      html: `<ef-textarea class="ef-component-tag">
  <form class="ef-stack" action="/feedback" method="post">
    <div class="ef-field">
      <label class="ef-field__label" for="textarea-mobile-feedback">What could we do better?</label>
      <span class="ef-field__description" id="textarea-mobile-feedback-description">Do not include passwords or personal data.</span>
      <textarea id="textarea-mobile-feedback" name="feedback" rows="6" aria-describedby="textarea-mobile-feedback-description"></textarea>
    </div>
    <button type="submit">Send feedback</button>
  </form>
</ef-textarea>`
    }
  ],
  api: {
    attributes: [
      { name: "for", on: "label.ef-field__label", values: "id of the textarea", default: "—", description: "Associates the visible label so it is the accessible name." },
      { name: "name", on: "textarea", values: "string", default: "—", description: "Form field name used on submission." },
      { name: "rows", on: "textarea", values: "integer", default: "2 (browser default)", description: "Initial visible line count; sets the starting height." },
      { name: "maxlength", on: "textarea", values: "integer", default: "—", description: "Native hard limit; the browser stops input at the limit without an error, so state the limit in the description." },
      { name: "required", on: "textarea", values: "boolean", default: "absent", description: "Native constraint: the form will not submit while empty." },
      { name: "readonly", on: "textarea", values: "boolean", default: "absent", description: "Focusable, selectable and submitted, but not editable." },
      { name: "spellcheck", on: "textarea", values: "true | false", default: "browser default", description: "Turns spelling marks on or off." },
      { name: "aria-describedby", on: "textarea", values: "id list", default: "—", description: "Links the description and any validation message." },
      { name: "aria-invalid", on: "textarea", values: "true", default: "absent", description: "Set by the application while a linked validation message is shown." }
    ],
    hooks: {},
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus into and out of the textarea. Tab never inserts a tab character." },
      { keys: "Enter", action: "Inserts a line break. It does not submit the form." }
    ],
    events: [
      { name: "input / change / invalid", description: "Native textarea events. Forma adds none." }
    ],
    form: "A native textarea: submits its text (with line breaks) under name, participates in required and maxlength/minlength validation, restores its initial content on form reset, and is excluded when disabled."
  },
  states: [
    { name: "Default", how: "no state attributes", description: "Functional border, full width, height from rows." },
    { name: "Focus", how: ":focus-visible", description: "Foundation two-tone focus ring." },
    { name: "Invalid", how: "aria-invalid=\"true\" plus a linked .ef-validation-message", description: "The message below the field carries the error with a non-color mark; the textarea itself is not restyled." },
    { name: "Read-only", how: "readonly attribute", description: "Native behavior with no distinct Forma styling; the description says why it is locked." },
    { name: "Disabled", how: "disabled attribute", description: "Skipped by focus and not submitted; Forma adds no dimmed treatment, so explain it in the description." }
  ],
  accessibility: {
    forma: [
      "Real label/for association in the canonical structure.",
      "44px minimum height, full-width target and the shared two-tone focus ring.",
      "Borders map to CanvasText in forced-colors mode."
    ],
    consumer: [
      "Provide a visible label and state any length limit or content restriction in the description.",
      "Link errors with aria-describedby and set aria-invalid only while an error is shown.",
      "If you add a live remaining-characters count, announce it politely and sparingly (for example near the limit), not on every keystroke."
    ]
  },
  responsive: [
    "The textarea is `inline-size: 100%` with `max-inline-size: 100%`, so it follows its container and user resizing cannot cause horizontal page overflow.",
    "Height is intrinsic from `rows`; there are no breakpoints.",
    "Long unbroken text wraps inside the control; the page does not scroll sideways."
  ],
  motion: [
    "No animation: the textarea, label and description do not transition. Resizing follows the pointer directly."
  ],
  guidance: {
    do: [
      "Size rows to the expected answer so users can judge how much to write.",
      "Keep what the user typed when showing an error."
    ],
    avoid: [
      "Submitting on Enter; users expect Enter to add a new line in a textarea.",
      "Disabling resize without a reason; some users need a taller field to review their text."
    ]
  },
  related: [
    { slug: "text-field", note: "Single-line entry; also documents the shared .ef-field structure." },
    { slug: "composer", note: "Message composition with send, attachments and conversation context." },
    { slug: "validation-message", note: "Inline error linked to an invalid textarea." }
  ]
};
