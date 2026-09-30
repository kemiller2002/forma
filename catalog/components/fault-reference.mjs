export default {
  name: "Fault reference",
  category: "faults",
  behavior: "Application / Limen",
  summary: "Short quotable Aegis reference with an optional application-owned copy action.",
  purpose: {
    description: "The fault reference shows the short reference Aegis generates for a fault, such as `AG-4F82C`, as ordinary selectable text that can be read aloud and quoted to support. It is the only identifier a user needs; it is never replaced by a stack trace, exception type, repository path, token or correlation payload. A copy button may sit beside it, but Forma attaches no behavior: copying to the clipboard, and confirming that it happened, belong to Limen or application code.",
    useWhen: [
      "Any fault surface shows an Aegis presentation that has a reference.",
      "Support conversations need a short identifier the user can read out or paste.",
      "You want a copy convenience next to the reference and your application implements it."
    ],
    avoidWhen: [
      "You need to show an internal identifier, correlation payload or other developer-only value: it does not belong in the user-facing reference.",
      "You need a general-purpose identifier display for records or entities: use [[identifier]].",
      "You need several approved diagnostic values: put them in [[fault-details]] and keep the reference visible outside it."
    ],
    characteristics: [
      "A wrapping flex row: label, code and optional button, with a 0.4rem gap.",
      "The code is bold primary text on a secondary-colored label and breaks anywhere, so long references never overflow.",
      "The optional copy button has 44px minimum width and height.",
      "Selecting the reference with a pointer or keyboard works without the copy button."
    ]
  },
  examples: [
    {
      id: "text-only",
      title: "Reference without a copy action",
      description: "The minimum form inside a support note. The reference is plain selectable text; no button is rendered because this application does not implement copying.",
      html: `<ef-fault-reference class="ef-component-tag">
  <p>If this keeps happening, contact support and quote the reference below.</p>
  <p class="ef-fault-reference">Reference <code>AG-91B7Q</code></p>
</ef-fault-reference>`
    },
    {
      id: "localized-with-copy",
      title: "Localized label with copy action",
      description: "A Spanish label and copy button. The copy button's accessible name contains its visible text and the reference, so it is unambiguous when several references are on a page. Clipboard behavior is supplied by the application.",
      html: `<ef-fault-reference class="ef-component-tag">
  <p class="ef-fault-reference" lang="es">
    <span>Referencia</span>
    <code>AG-6YH2D</code>
    <button type="button" data-ef-action="copy-reference" aria-label="Copiar referencia AG-6YH2D">Copiar</button>
  </p>
</ef-fault-reference>`
    },
    {
      id: "mobile-long-reference",
      title: "Long reference on a phone",
      description: "An unusually long reference with a copy button at phone width.",
      mobile: {
        height: 220,
        notes: [
          "The row wraps: the label, code and button flow onto separate lines when they do not fit, instead of overflowing.",
          "The code breaks anywhere, so a long reference splits across lines at 320px rather than causing horizontal scrolling.",
          "The copy button keeps a 44 by 44px minimum target and never shrinks with the text.",
          "Long-press text selection on the code still works on touch devices, so the reference can be copied even without the button."
        ]
      },
      html: `<ef-fault-reference class="ef-component-tag">
  <p class="ef-fault-reference">
    <span>Reference</span>
    <code>AG-4F82C-BILLING-RECIPIENTS-2026-09-30</code>
    <button type="button" data-ef-action="copy-reference" aria-label="Copy fault reference AG-4F82C-BILLING-RECIPIENTS-2026-09-30">Copy</button>
  </p>
</ef-fault-reference>`
    }
  ],
  api: {
    attributes: [
      { name: "data-ef-action", on: "button", values: "copy-reference", default: "—", description: "Marks the copy button for application code. Forma attaches no clipboard behavior." },
      { name: "aria-label", on: "button", values: "string", default: "—", description: "Start with the visible label and include the reference, for example \"Copy fault reference AG-4F82C\"." },
      { name: "type", on: "button", values: "button", default: "—", description: "Required so the copy button never submits a form." },
      { name: "lang", on: ".ef-fault-reference", values: "BCP 47 tag", default: "inherited", description: "Set when the label is localized differently from the page." }
    ],
    hooks: {
      "ef-fault-reference": "Root paragraph: a wrapping flex row in small secondary text. Its code child is bold primary text that breaks anywhere; a direct button child gets a 44 by 44px minimum size."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Reaches the copy button when present. The reference text itself is not focusable." },
      { keys: "Enter / Space", action: "Activates the copy button; the application performs the copy." }
    ],
    events: [
      { name: "click", description: "Native click on the copy button. Application code writes the reference to the clipboard and may confirm success through its own status message." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Text only", how: "no button", description: "Label and code only; users select the text to copy it." },
    { name: "With copy action", how: "button data-ef-action=\"copy-reference\"", description: "A native button beside the code; behavior supplied by the application." },
    { name: "Long reference", how: "content", description: "The code wraps anywhere inside the row." }
  ],
  accessibility: {
    forma: [
      "Keeps the reference as real text that screen readers read and users can select.",
      "Gives the copy button a 44 by 44px minimum target and the shared focus ring.",
      "Renders the label and code as CanvasText in forced-colors mode so neither disappears."
    ],
    consumer: [
      "Show only the short Aegis reference; never substitute internal identifiers or diagnostic payloads.",
      "Implement copying in application code and confirm it with a status message if you show one, without moving focus.",
      "Give the copy button an accessible name that contains its visible text and identifies the reference.",
      "Hide the copy button when copying is unavailable rather than showing a button that does nothing."
    ]
  },
  responsive: [
    "Intrinsic sizing: a wrapping flex row that never exceeds its container.",
    "The code uses `overflow-wrap: anywhere`, so long references break across lines at 320px.",
    "The copy button keeps its 44px minimum size and wraps to its own line if needed. There are no breakpoints."
  ],
  motion: [
    "No animation: the reference is static text. The optional copy button uses only the foundation hover/press background interpolation, reduced to 0.01ms under `prefers-reduced-motion: reduce`."
  ],
  guidance: {
    do: [
      "Label the reference so users know what to quote (\"Reference\", or a localized equivalent).",
      "Keep the reference visible on every fault surface, not only inside expanded details."
    ],
    avoid: [
      "Truncating the reference with an ellipsis.",
      "Replacing the reference with a long correlation identifier or other developer-only material.",
      "Rendering a copy button with no application behavior behind it."
    ]
  },
  related: [
    { slug: "identifier", note: "General identifiers for records and entities; fault-reference is specifically the quotable Aegis reference." },
    { slug: "fault-details", note: "Holds additional approved diagnostic values behind a disclosure." },
    { slug: "fault", note: "Every fault surface includes a reference in its body." }
  ]
};
