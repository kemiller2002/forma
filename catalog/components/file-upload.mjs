export default {
  name: "File upload queue",
  category: "forms",
  behavior: "Native HTML / Limen",
  summary: "Native file selection plus a reusable upload queue for progress, success, cancellation, failure, and unknown outcomes.",
  purpose: {
    description: "A file upload has two parts. The drop area holds a heading, guidance and a `label.ef-button` wrapping a native `input type=\"file\"`, so choosing files works with keyboard, pointer and touch without script. The queue is a list with one row per file: name and size, a native `progress` element, and either a [[status-lozenge]] outcome or a per-file action (Cancel, Retry). Uploading, progress updates, cancellation, retry, drag-and-drop and duplicate detection are Limen/application behavior; Forma renders each state the application reports.",
    useWhen: [
      "Users attach one or more files to a record, submission or evidence set.",
      "Uploads take long enough that per-file progress and outcomes matter.",
      "Some files can fail or end in an unknown state and must be recoverable individually."
    ],
    avoidWhen: [
      "The user attaches files while writing a message to an agent or person: use [[composer]].",
      "The upload is a single small file submitted with an ordinary form: a native file input with a [[text-field]]-style label is enough, without the queue.",
      "The work is a long-running job rather than file transfer: use [[operation-status]] or [[progress-bar]]."
    ],
    characteristics: [
      "Choosing files never depends on drag-and-drop; a drop target is an optional enhancement.",
      "Each outcome has text (Uploaded, Failed, Outcome unknown) with a glyph, not only color.",
      "Unknown outcome is distinct from failure: the application could not confirm what happened."
    ]
  },
  examples: [
    {
      id: "mixed-outcomes",
      title: "Failed, unknown and waiting files",
      description: "A queue after a network interruption: one file was rejected for size (Failed lozenge with the reason), one lost its connection mid-transfer so the outcome is unknown and offers Check status, one is waiting (an indeterminate progress element with no value), and one failed on the server and offers Retry.",
      html: `<ef-file-upload class="ef-component-tag">
  <section class="ef-file-upload" aria-labelledby="file-upload-mixed-title">
    <div class="ef-file-upload__drop">
      <h3 id="file-upload-mixed-title">Attach contract documents</h3>
      <p>PDF or DOCX, up to 25 MB each.</p>
      <label class="ef-button">Choose files <input type="file" name="contract-documents" multiple accept=".pdf,.docx"></label>
    </div>
    <ul class="ef-file-upload__queue">
      <li>
        <div><strong>master-agreement.pdf</strong><small>Failed: the file is larger than 25 MB (31.4 MB).</small></div>
        <progress value="0" max="100" aria-label="master-agreement.pdf upload progress">0%</progress>
        <span class="ef-status-lozenge" data-state="blocked">Failed</span>
      </li>
      <li>
        <div><strong>schedule-b.docx</strong><small>Connection lost at 82%. We could not confirm whether the file was saved.</small></div>
        <progress value="82" max="100" aria-label="schedule-b.docx upload progress">82%</progress>
        <button type="button">Check status</button>
      </li>
      <li>
        <div><strong>signatures.pdf</strong><small>Waiting to upload</small></div>
        <progress max="100" aria-label="signatures.pdf upload progress">Waiting</progress>
        <button type="button">Remove</button>
      </li>
      <li>
        <div><strong>pricing-appendix.pdf</strong><small>Upload failed: the server did not respond.</small></div>
        <progress value="40" max="100" aria-label="pricing-appendix.pdf upload progress">40%</progress>
        <button type="button">Retry</button>
      </li>
    </ul>
  </section>
</ef-file-upload>`
    },
    {
      id: "single-image",
      title: "Single profile photo",
      description: "Single-file mode: no multiple attribute and an image-only accept filter. The queue shows the one uploaded file with a Replace path through the same chooser.",
      html: `<ef-file-upload class="ef-component-tag">
  <section class="ef-file-upload" aria-labelledby="file-upload-single-title">
    <div class="ef-file-upload__drop">
      <h3 id="file-upload-single-title">Profile photo</h3>
      <p>A square PNG or JPEG works best. Choosing a new file replaces the current one.</p>
      <label class="ef-button">Choose photo <input type="file" name="profile-photo" accept="image/png,image/jpeg"></label>
    </div>
    <ul class="ef-file-upload__queue">
      <li>
        <div><strong>headshot-2026.jpg</strong><small>640 KB</small></div>
        <progress value="100" max="100" aria-label="headshot-2026.jpg upload progress">100%</progress>
        <span class="ef-status-lozenge" data-state="ok">Uploaded</span>
      </li>
    </ul>
  </section>
</ef-file-upload>`
    },
    {
      id: "mobile-evidence",
      title: "Mobile evidence upload",
      description: "An evidence queue at phone width. Queue rows stack their parts and actions become full-width buttons.",
      mobile: {
        height: 520,
        notes: [
          "At 40rem (640px) and below each queue row becomes one column: file name and size, then the progress bar, then the status or a full-width action button.",
          "The Choose files button keeps a 44px minimum height; on phones it opens the platform chooser, which may offer the camera or photo library.",
          "Long file names wrap within the row instead of widening the queue.",
          "The drop area has no drag requirement, so touch users lose nothing."
        ]
      },
      html: `<ef-file-upload class="ef-component-tag">
  <section class="ef-file-upload" aria-labelledby="file-upload-mobile-title">
    <div class="ef-file-upload__drop">
      <h3 id="file-upload-mobile-title">Add site photos</h3>
      <p>Photos of the installed equipment and serial plates.</p>
      <label class="ef-button">Choose files <input type="file" name="site-photos" multiple accept="image/*"></label>
    </div>
    <ul class="ef-file-upload__queue">
      <li>
        <div><strong>rack-07-front-panel-serial-plate.jpg</strong><small>3.1 MB</small></div>
        <progress value="100" max="100" aria-label="rack-07-front-panel-serial-plate.jpg upload progress">100%</progress>
        <span class="ef-status-lozenge" data-state="ok">Uploaded</span>
      </li>
      <li>
        <div><strong>rack-07-cabling.jpg</strong><small>2.4 MB</small></div>
        <progress value="35" max="100" aria-label="rack-07-cabling.jpg upload progress">35%</progress>
        <button type="button">Cancel</button>
      </li>
    </ul>
  </section>
</ef-file-upload>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input / button", values: "file on the chooser; button on queue actions", default: "—", description: "The native file chooser; queue actions are type=button so they never submit a form." },
      { name: "multiple", on: "input[type=file]", values: "boolean", default: "absent", description: "Allows selecting several files at once." },
      { name: "accept", on: "input[type=file]", values: "extensions or MIME types", default: "any", description: "Filters the chooser. It is a hint, not enforcement: the application must still validate type and size." },
      { name: "name", on: "input[type=file]", values: "string", default: "—", description: "Field name when the files are submitted with a form." },
      { name: "aria-labelledby", on: "section.ef-file-upload", values: "id of the heading", default: "—", description: "Names the upload region with its visible heading." },
      { name: "value", on: "progress", values: "number", default: "absent (indeterminate)", description: "Current progress. Omit it for waiting or unknown-size transfers." },
      { name: "max", on: "progress", values: "number", default: "1", description: "Scale of the progress value." },
      { name: "aria-label", on: "progress", values: "string", default: "—", description: "Names each progress bar with its file so rows are distinguishable." },
      { name: "data-state", on: ".ef-status-lozenge", values: "ok | attention | unknown | blocked", default: "—", description: "Outcome glyph for the file's status lozenge; always paired with text." }
    ],
    hooks: {
      "ef-file-upload": "Root grid (1rem gap) around the drop area and queue.",
      "ef-file-upload__drop": "Dashed-border selection area on the secondary surface. A `.ef-button` inside is the visible chooser; a nested `input[type=file]` is visually hidden but remains in the accessibility tree.",
      "ef-file-upload__queue": "Unstyled list of files. Each `li` is a three-column grid (name and size, progress, status or action) that stacks at 40rem and below; `small` holds secondary text."
    },
    keyboard: [
      { keys: "Tab", action: "Moves to the file input inside the Choose files label, then through queue action buttons in order." },
      { keys: "Enter / Space", action: "Opens the native file chooser from the focused file input, or activates a queue action." }
    ],
    events: [
      { name: "change", description: "Native event from the file input after the user picks files. Uploading, progress and outcomes are application code; Forma adds no events." }
    ],
    form: "The file input submits the chosen files under name with a multipart form. A queue that uploads immediately is application behavior outside native form submission."
  },
  states: [
    { name: "Waiting", how: "progress without value", description: "Indeterminate progress bar and \"Waiting\" text; a Remove action is usual." },
    { name: "Uploading", how: "progress value < max", description: "Determinate bar with a Cancel action." },
    { name: "Uploaded", how: "progress value = max; .ef-status-lozenge data-state=\"ok\"", description: "Full bar and a ✓ Uploaded lozenge." },
    { name: "Failed", how: ".ef-status-lozenge data-state=\"blocked\" or a Retry button, plus a reason in small", description: "The reason is text; retry is offered when the failure is recoverable." },
    { name: "Unknown outcome", how: "application text plus a Check status action or data-state=\"unknown\" lozenge", description: "Kept distinct from failure because the file may have been saved." }
  ],
  accessibility: {
    forma: [
      "The chooser is a real file input inside a visible button-styled label, so it works by keyboard, pointer and touch with no drag requirement.",
      "Queue outcomes combine text and a glyph through [[status-lozenge]], never color alone.",
      "Queue rows stack at narrow widths and action buttons become full width."
    ],
    consumer: [
      "Give each progress element an accessible name that includes the file name.",
      "Announce completed, failed and unknown outcomes (for example with a polite live region or [[toast]]), without announcing every progress tick.",
      "Validate type and size in the application and explain rejections in the row text.",
      "Verify that keyboard focus on the visually hidden file input is visible; Forma does not currently draw a focus indicator on the Choose files label.",
      "When adding a drop zone, keep the Choose files path and announce files added by drop."
    ]
  },
  responsive: [
    "Above 40rem each row is `minmax(0, 1fr) minmax(8rem, 0.5fr) auto`: the name column shrinks first and the progress bar keeps at least 8rem.",
    "At 40rem (640px) and below rows become one column and queue buttons fill the width.",
    "File names and reasons wrap inside the first column; the queue never scrolls horizontally."
  ],
  motion: [
    "No animation of its own: Forma does not animate queue rows or outcomes. The native progress bar's indeterminate animation, where the platform draws one, is browser-owned; the Choose files button and queue buttons use the shared hover and press background interpolation."
  ],
  guidance: {
    do: [
      "State accepted types and size limits before the user chooses files.",
      "Offer Cancel while uploading and Retry after recoverable failures, per file."
    ],
    avoid: [
      "Reporting an interrupted upload as failed when the server may have saved it; show an unknown outcome and a way to check.",
      "Making drag-and-drop the only way to add files."
    ]
  },
  related: [
    { slug: "status-lozenge", note: "The text-and-glyph outcome marker used in queue rows." },
    { slug: "progress-bar", note: "Standalone determinate progress outside an upload queue." },
    { slug: "operation-status", note: "Outcome of a long-running operation rather than a file transfer." },
    { slug: "composer", note: "Attachments as part of writing a message." }
  ]
};
