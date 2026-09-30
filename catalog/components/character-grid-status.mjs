export default {
  name: "Character grid status",
  category: "keyboard",
  behavior: "Application state",
  summary: "Message and system-status live regions on a character grid with a visible severity word and shape cues that survive forced colors.",
  purpose: {
    description: "Character grid status covers the two kinds of feedback a character-grid screen gives: the application message (\"CINQ000I Type search criteria and press Enter.\") and the system status line (READY, X SYSTEM). A message is a live region with a visible severity word; the status line is a `role=\"status\"` run with an indicator word. Forma presents severity and state with text and shape; the application decides the content, the severity, when to replace it, and whether input is actually inhibited.",
    useWhen: [
      "A character-grid screen must report the outcome of Enter or a PF key.",
      "Validation errors on grid fields need a message the fields can reference with `aria-describedby`.",
      "The screen models a terminal status line, such as the 3270 Operator Information Area, or draws its own status row."
    ],
    avoidWhen: [
      "Application messages outside a grid: use [[alert]], [[toast]] or [[validation-summary]].",
      "Long-running operation progress with steps and recovery: use [[operation-status]].",
      "Decorative banners or titles: use protected text runs in [[character-grid]]."
    ],
    characteristics: [
      "Every message starts with a visible severity word; color is never the only cue.",
      "Shape cues add to the word: underline for warning, double underline for validation, reverse video with an outline for error and for the inhibited indicator.",
      "Messages wrap within their run and grow their rows if needed; they are never truncated, clipped or scrolled.",
      "Device status rows (`data-ef-status-rows`) follow the application rows, so row-major and focus order are unchanged."
    ]
  },
  examples: [
    {
      id: "update-success",
      title: "Success after an update",
      description: "A success message with the severity word OK, and a READY indicator on a device status row after the application rows (`data-ef-status-rows=\"1\"`).",
      html: `<ef-character-grid-status class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="6" data-ef-status-rows="1" data-ef-columns="80" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-status-update-success-title" tabindex="0">
      <div class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-status-update-success-title" data-ef-row="1" data-ef-col="31" data-ef-len="19" data-ef-emphasis="intensified">ACCOUNT MAINTENANCE</h2>
        <span class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="16">Account<span class="ef-character-grid__leader" aria-hidden="true"> . . . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="3" data-ef-col="20" data-ef-len="13">00417-2231-09</span>
        <p class="ef-character-grid__message" role="status" data-ef-severity="success" data-ef-row="6" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__severity"><span>OK</span></span> ACCM004I Account 00417-2231-09 updated. Changes take effect at end of day.</p>
        <p class="ef-character-grid__status" role="status" data-ef-row="7" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__indicator"><span>READY</span></span></p>
      </div>
    </div>
  </div>
</ef-character-grid-status>`
    },
    {
      id: "report-warning",
      title: "Warning that does not block",
      description: "A warning uses `role=\"status\"` because it does not need to interrupt. The severity word WARN is underlined as a shape cue. This screen draws its own status on its last row, so it omits `data-ef-status-rows`.",
      html: `<ef-character-grid-status class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="6" data-ef-columns="80" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-status-report-warning-title" tabindex="0">
      <div class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-status-report-warning-title" data-ef-row="1" data-ef-col="30" data-ef-len="21" data-ef-emphasis="intensified">MONTHLY BRANCH REPORT</h2>
        <span class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="16">Period<span class="ef-character-grid__leader" aria-hidden="true">  . . . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="3" data-ef-col="20" data-ef-len="7">2026-09</span>
        <p class="ef-character-grid__message" role="status" data-ef-severity="warning" data-ef-row="5" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__severity"><span>WARN</span></span> RPT021W Report includes 3 branches with incomplete data for September.</p>
        <p class="ef-character-grid__status" role="status" data-ef-row="6" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__indicator"><span>READY</span></span>  Page 1 of 4</p>
      </div>
    </div>
  </div>
</ef-character-grid-status>`
    },
    {
      id: "long-error",
      title: "Long error in reserved rows",
      description: "Runtime message text varies in length, so the message run reserves two rows with `data-ef-height=\"2\"` and wraps within its width. `role=\"alert\"` announces it immediately, and the ERROR word is drawn in reverse video.",
      html: `<ef-character-grid-status class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="7" data-ef-columns="80" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-status-long-error-title" tabindex="0">
      <div class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-status-long-error-title" data-ef-row="1" data-ef-col="33" data-ef-len="15" data-ef-emphasis="intensified">PAYMENT RELEASE</h2>
        <span class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="16">Batch<span class="ef-character-grid__leader" aria-hidden="true"> . . . . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="3" data-ef-col="20" data-ef-len="11">PB-20260930</span>
        <p class="ef-character-grid__message" role="alert" data-ef-severity="error" data-ef-row="5" data-ef-col="2" data-ef-len="78" data-ef-height="2"><span class="ef-character-grid__severity"><span>ERROR</span></span> PAY117E Batch rejected: total 48,210.55 does not match its 212 items (48,201.55). Correct the batch and resubmit.</p>
        <p class="ef-character-grid__status" role="status" data-ef-row="7" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__indicator"><span>READY</span></span></p>
      </div>
    </div>
  </div>
</ef-character-grid-status>`
    },
    {
      id: "status-mobile",
      title: "Status line on a phone",
      description: "An information message and an inhibited indicator on a 40-column screen. The indicator keeps its word and reverse-video box at phone width.",
      mobile: {
        height: 340,
        notes: [
          "Messages wrap inside their reserved rows at any width; at the 44px touch pitch each row is taller, so reserved rows hold the same text.",
          "If a message still does not fit, its rows grow and later rows move down instead of being painted over.",
          "Status and message runs keep their cell positions; a 40-column grid fits in portrait and wider grids scroll inside the viewport.",
          "The severity word stays first on the line, so it is visible even when the viewport is scrolled to its start."
        ]
      },
      html: `<ef-character-grid-status class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="6" data-ef-columns="40" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-status-status-mobile-title" tabindex="0">
      <div class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-status-status-mobile-title" data-ef-row="1" data-ef-col="14" data-ef-len="13" data-ef-emphasis="intensified">STOCK INQUIRY</h2>
        <span class="ef-character-grid__text" data-ef-row="2" data-ef-col="2" data-ef-len="10">Item . . :</span>
        <span class="ef-character-grid__value" data-ef-row="2" data-ef-col="13" data-ef-len="9">SKU-40211</span>
        <p class="ef-character-grid__message" role="status" data-ef-severity="information" data-ef-row="4" data-ef-col="2" data-ef-len="38" data-ef-height="2"><span class="ef-character-grid__severity"><span>INFO</span></span> Stock levels are being refreshed from the warehouse.</p>
        <p class="ef-character-grid__status" role="status" data-ef-row="6" data-ef-col="2" data-ef-len="38"><span class="ef-character-grid__indicator" data-ef-state="inhibited"><span>X SYSTEM</span></span>  Please wait</p>
      </div>
    </div>
  </div>
</ef-character-grid-status>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: ".ef-character-grid__message / .ef-character-grid__status", values: "status | alert", default: "—", description: "`status` for information, success and warning and for the system status line; `alert` for validation and error that need immediate attention. The element must exist before its text changes." },
      { name: "id", on: ".ef-character-grid__message", values: "string", default: "—", description: "Lets invalid fields reference the message with `aria-describedby`." }
    ],
    hooks: {
      "ef-character-grid__message": "Message run. Wraps within its width (`pre-wrap`), never clips, and takes the severity color.",
      "ef-character-grid__severity": "Required visible severity word (INFO, OK, WARN, CHECK, ERROR) in bold. Wrap the word in an inner `span`.",
      "ef-character-grid__status": "System status run in the muted color; always `role=\"status\"`.",
      "ef-character-grid__indicator": "Bold indicator word inside the status run, such as READY or X SYSTEM. Wrap the word in an inner `span`.",
      "data-ef-severity": "`information`, `success`, `warning`, `validation` or `error` (CG-15). Sets the message color and the severity-word shape cue.",
      "data-ef-state": "`inhibited` on the indicator draws reverse video with an outline; an outlined box in forced colors.",
      "data-ef-status-rows": "On the grid: 1 or 2 device status rows after the application rows, for status runs only (CG-18).",
      "data-ef-height": "Rows a message reserves when its runtime length varies.",
      "--ef-grid-information": "Information message color.",
      "--ef-grid-success": "Success message color.",
      "--ef-grid-warning": "Warning message color.",
      "--ef-grid-validation": "Validation message color.",
      "--ef-grid-error": "Error message color.",
      "--ef-grid-muted": "Status line color."
    },
    keyboard: [
      { keys: "None", action: "Messages and status are not focusable. Live regions are announced without moving focus." }
    ],
    events: [],
    form: "Messages and status runs are not form controls and submit nothing."
  },
  states: [
    { name: "Information", how: "data-ef-severity=\"information\", role=\"status\"", description: "Plain severity word, information color." },
    { name: "Success", how: "data-ef-severity=\"success\", role=\"status\"", description: "Plain severity word, success color." },
    { name: "Warning", how: "data-ef-severity=\"warning\", role=\"status\"", description: "Severity word with a 2px underline." },
    { name: "Validation", how: "data-ef-severity=\"validation\", role=\"alert\"", description: "Severity word with a double underline; fields reference the message." },
    { name: "Error", how: "data-ef-severity=\"error\", role=\"alert\"", description: "Severity word in reverse video with an outline; an outlined box in forced colors." },
    { name: "Input inhibited", how: "data-ef-state=\"inhibited\" on the indicator", description: "Indicator in reverse video. Whether input is actually inhibited is application behavior." }
  ],
  accessibility: {
    forma: [
      "Requires a visible severity word, so meaning never depends on color.",
      "Adds severity shape cues (underline, double underline, reverse video) that survive grayscale; forced colors replace reverse video with an outlined box.",
      "Never clips or truncates a message; long text wraps and grows its rows."
    ],
    consumer: [
      "Render the message and status elements with the screen and replace their content, so assistive technology announces the change.",
      "Use `role=\"alert\"` only for validation and errors; routine outcomes use `role=\"status\"`.",
      "Reference the message from invalid fields with `aria-describedby` and set `aria-invalid=\"true\"`.",
      "When showing X SYSTEM, actually disable the affected keys and fields, and keep Reset available."
    ]
  },
  responsive: [
    "Messages wrap within their width (`white-space: pre-wrap`, `overflow-wrap: anywhere`); reserve rows with `data-ef-height` where length varies.",
    "If a message exceeds its reserved rows, intrinsic row tracks grow and later rows move down.",
    "The status line keeps preserved spacing (`white-space: pre`) and its cell position; the grid's containment keeps the page from scrolling sideways."
  ],
  motion: [
    "No animation: messages and indicators change when the application replaces their content.",
    "Messages and status are excluded from SequentialReveal, so a new message is never staged or delayed."
  ],
  guidance: {
    do: [
      "Keep message IDs (such as CINQ000I) and the severity word in the visible text.",
      "Reserve two rows for messages whose text comes from a service."
    ],
    avoid: [
      "Creating the live region at the moment the message appears; it may not be announced.",
      "Using color or the ibm-3270 palette alone to tell warnings from errors.",
      "Putting application messages on device status rows; those rows hold status only."
    ]
  },
  related: [
    { slug: "character-grid", note: "The grid that places messages and status rows." },
    { slug: "character-grid-field", note: "Fields that reference validation messages." },
    { slug: "character-grid-keys", note: "Keys that the application disables while input is inhibited." },
    { slug: "alert", note: "Use for application messages outside a character grid." }
  ]
};
