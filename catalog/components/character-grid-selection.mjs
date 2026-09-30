export default {
  name: "Character grid selection",
  category: "keyboard",
  behavior: "Application / Limen",
  summary: "Per-row selection fields in positioned repeated rows (a 5250-style option column): native text inputs named by their column and row headers and described by the option legend; the application owns what each option does.",
  purpose: {
    description: "Character grid selection is the \"Work with\" idiom: a list of records in a positioned table where each row has a short option field, a legend such as `2=Change  4=Close  5=Display` explains the codes, and pressing Enter processes every row whose option changed. Each option field is a native text input in a table cell, named by its column header and its row header through `aria-labelledby` (\"Opt 00417-2231-09\") and described by the legend. Forma presents the column, the fields and their states. The application decides which options are valid, reads the changed rows on Enter, and marks rejected rows invalid.",
    useWhen: [
      "Users act on several records of a list in one pass by typing an option code next to each.",
      "A host \"Work with\" screen is being re-platformed and the option column must stay.",
      "Keyboard-only operators need to move row by row with Tab and type codes without leaving the keyboard."
    ],
    avoidWhen: [
      "Choosing one record to open: use a list of links or [[data-grid]] with row actions.",
      "Choosing rows with checkboxes for a bulk action outside a character grid: use [[data-grid]] or [[multi-choice]].",
      "A single field on a screen: use [[character-grid-field]]."
    ],
    characteristics: [
      "Fields keep native semantics inside native table semantics; row headers identify each record.",
      "Each field is exactly `data-ef-len` cells wide; its column may be wider (\"Opt\" is three cells for a one-cell field).",
      "Tab moves down the option column in row-major order; disabled rows are skipped natively.",
      "The same required, invalid, disabled and focus cues as other grid fields."
    ]
  },
  examples: [
    {
      id: "work-with-jobs",
      title: "Options typed before Enter",
      description: "A \"Work with jobs\" list where the operator has typed options on two rows but not yet pressed Enter. The legend uses a different vocabulary; only the codes and labels change.",
      html: `<ef-character-grid-selection class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="11" data-ef-columns="60" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-selection-work-with-jobs-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-selection-work-with-jobs-title" data-ef-row="1" data-ef-col="23" data-ef-len="14" data-ef-emphasis="intensified">WORK WITH JOBS</h2>
        <p class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="26">Type options, press Enter.</p>
        <p class="ef-character-grid__text" id="character-grid-selection-work-with-jobs-legend" data-ef-row="4" data-ef-col="4" data-ef-len="30">2=Hold  3=Release  4=End</p>
        <div class="ef-character-grid__table" data-ef-row="6" data-ef-col="2" data-ef-len="45" data-ef-height="4">
          <table data-ef-gutter="2">
            <caption>Active jobs, with a selection option per row</caption>
            <thead><tr><th scope="col" id="character-grid-selection-work-with-jobs-opt" data-ef-len="3">Opt</th><th scope="col" data-ef-len="10">Job</th><th scope="col" data-ef-len="10">User</th><th scope="col" data-ef-len="14">Status</th></tr></thead>
            <tbody>
            <tr><td><input class="ef-character-grid__field" id="character-grid-selection-work-with-jobs-opt-1" name="opt-QPADEV0012" type="text" inputmode="numeric" pattern="[234]" maxlength="1" autocomplete="off" value="2" aria-labelledby="character-grid-selection-work-with-jobs-opt character-grid-selection-work-with-jobs-row-1" aria-describedby="character-grid-selection-work-with-jobs-legend" data-ef-len="1"></td><th scope="row" id="character-grid-selection-work-with-jobs-row-1">QPADEV0012</th><td>OKAFOR</td><td>RUNNING</td></tr>
            <tr><td><input class="ef-character-grid__field" id="character-grid-selection-work-with-jobs-opt-2" name="opt-NIGHTLYGL" type="text" inputmode="numeric" pattern="[234]" maxlength="1" autocomplete="off" aria-labelledby="character-grid-selection-work-with-jobs-opt character-grid-selection-work-with-jobs-row-2" aria-describedby="character-grid-selection-work-with-jobs-legend" data-ef-len="1"></td><th scope="row" id="character-grid-selection-work-with-jobs-row-2">NIGHTLYGL</th><td>BATCHSYS</td><td>WAITING</td></tr>
            <tr><td><input class="ef-character-grid__field" id="character-grid-selection-work-with-jobs-opt-3" name="opt-RPTAGING" type="text" inputmode="numeric" pattern="[234]" maxlength="1" autocomplete="off" value="4" aria-labelledby="character-grid-selection-work-with-jobs-opt character-grid-selection-work-with-jobs-row-3" aria-describedby="character-grid-selection-work-with-jobs-legend" data-ef-len="1"></td><th scope="row" id="character-grid-selection-work-with-jobs-row-3">RPTAGING</th><td>RIVERA</td><td>HELD</td></tr>
            </tbody>
          </table>
        </div>
        <p class="ef-character-grid__message" id="character-grid-selection-work-with-jobs-message" role="status" data-ef-severity="information" data-ef-row="10" data-ef-col="2" data-ef-len="58"><span class="ef-character-grid__severity"><span>INFO</span></span> Press Enter to process the options you typed.</p>
        <div class="ef-character-grid__group" role="group" aria-label="Function keys">
          <button class="ef-character-grid__key" type="submit" name="action" value="enter" data-ef-action="enter" data-ef-row="11" data-ef-col="2" data-ef-len="13"><kbd>Enter</kbd>=Process</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="f3" formnovalidate data-ef-action="f3" data-ef-row="11" data-ef-col="17" data-ef-len="7"><kbd>F3</kbd>=Exit</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="f5" formnovalidate data-ef-action="f5" data-ef-row="11" data-ef-col="26" data-ef-len="10"><kbd>F5</kbd>=Refresh</button>
        </div>
      </form>
    </div>
  </div>
</ef-character-grid-selection>`
    },
    {
      id: "empty-list",
      title: "Empty result",
      description: "No records match the filter, so there are no option fields. The table states the empty result in a full-width row instead of leaving blank lines, and the legend is omitted because no option can be typed.",
      html: `<ef-character-grid-selection class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="9" data-ef-columns="60" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-selection-empty-list-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-selection-empty-list-title" data-ef-row="1" data-ef-col="21" data-ef-len="18" data-ef-emphasis="intensified">WORK WITH ACCOUNTS</h2>
        <span class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="11">Branch<span class="ef-character-grid__leader" aria-hidden="true">  . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="3" data-ef-col="14" data-ef-len="10">SOUTH-WEST</span>
        <div class="ef-character-grid__table" data-ef-row="5" data-ef-col="2" data-ef-len="45" data-ef-height="2">
          <table data-ef-gutter="2">
            <caption>Accounts in branch SOUTH-WEST</caption>
            <thead><tr><th scope="col" data-ef-len="3">Opt</th><th scope="col" data-ef-len="14">Account</th><th scope="col" data-ef-len="24">Name</th></tr></thead>
            <tbody>
            <tr><td colspan="3">(No accounts match. Change the branch.)</td></tr>
            </tbody>
          </table>
        </div>
        <p class="ef-character-grid__message" role="status" data-ef-severity="information" data-ef-row="8" data-ef-col="2" data-ef-len="58"><span class="ef-character-grid__severity"><span>INFO</span></span> WWA010I 0 accounts in branch SOUTH-WEST.</p>
        <div class="ef-character-grid__group" role="group" aria-label="Function keys">
          <button class="ef-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-ef-action="pf3" data-ef-row="9" data-ef-col="2" data-ef-len="8"><kbd>PF3</kbd>=Exit</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="pf12" formnovalidate data-ef-action="pf12" data-ef-row="9" data-ef-col="12" data-ef-len="11"><kbd>PF12</kbd>=Cancel</button>
        </div>
      </form>
    </div>
  </div>
</ef-character-grid-selection>`
    },
    {
      id: "selection-mobile",
      title: "Option column on a phone",
      description: "A narrow list on a 40-column grid. On phones each one-cell option field widens to the 44px touch minimum, which extends into its three-cell column plus two-cell gutter and never into the next column.",
      mobile: {
        height: 420,
        notes: [
          "At the touch pitch the one-cell field grows to 2.75rem, which fits because the Opt column plus its gutter is five cells (CG-17).",
          "Rows grow to 44px, so each option field is a comfortable tap target in its own row.",
          "The table run keeps its columns; wider lists scroll inside the viewport instead of the page.",
          "`inputmode=\"numeric\"` brings up a number pad for option codes."
        ]
      },
      html: `<ef-character-grid-selection class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="8" data-ef-columns="40" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-selection-selection-mobile-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <h2 class="ef-character-grid__text" id="character-grid-selection-selection-mobile-title" data-ef-row="1" data-ef-col="12" data-ef-len="16" data-ef-emphasis="intensified">WORK WITH ORDERS</h2>
        <p class="ef-character-grid__text" id="character-grid-selection-selection-mobile-legend" data-ef-row="2" data-ef-col="2" data-ef-len="22">4=Cancel  5=Display</p>
        <div class="ef-character-grid__table" data-ef-row="4" data-ef-col="2" data-ef-len="30" data-ef-height="3">
          <table data-ef-gutter="2">
            <caption>Open orders, with a selection option per row</caption>
            <thead><tr><th scope="col" id="character-grid-selection-selection-mobile-opt" data-ef-len="3">Opt</th><th scope="col" data-ef-len="8">Order</th><th scope="col" data-ef-len="10">Status</th></tr></thead>
            <tbody>
            <tr><td><input class="ef-character-grid__field" id="character-grid-selection-selection-mobile-opt-1" name="opt-SO-88412" type="text" inputmode="numeric" pattern="[45]" maxlength="1" autocomplete="off" aria-labelledby="character-grid-selection-selection-mobile-opt character-grid-selection-selection-mobile-row-1" aria-describedby="character-grid-selection-selection-mobile-legend" data-ef-len="1"></td><th scope="row" id="character-grid-selection-selection-mobile-row-1">SO-88412</th><td>PICKING</td></tr>
            <tr><td><input class="ef-character-grid__field" id="character-grid-selection-selection-mobile-opt-2" name="opt-SO-88419" type="text" inputmode="numeric" pattern="[45]" maxlength="1" autocomplete="off" aria-labelledby="character-grid-selection-selection-mobile-opt character-grid-selection-selection-mobile-row-2" aria-describedby="character-grid-selection-selection-mobile-legend" data-ef-len="1"></td><th scope="row" id="character-grid-selection-selection-mobile-row-2">SO-88419</th><td>OPEN</td></tr>
            </tbody>
          </table>
        </div>
        <div class="ef-character-grid__group" role="group" aria-label="Function keys">
          <button class="ef-character-grid__key" type="submit" name="action" value="enter" data-ef-action="enter" data-ef-row="8" data-ef-col="2" data-ef-len="13"><kbd>Enter</kbd>=Process</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-ef-action="pf3" data-ef-row="8" data-ef-col="17" data-ef-len="8"><kbd>PF3</kbd>=Exit</button>
        </div>
      </form>
    </div>
  </div>
</ef-character-grid-selection>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "option input", values: "column th id, then row th id", default: "—", description: "Required (CG-17). Names the field by its column and row headers, for example \"Opt 00417-2231-09\"." },
      { name: "aria-describedby", on: "option input", values: "legend id, plus message id when invalid", default: "—", description: "The option legend describes every field; an invalid field also references the message." },
      { name: "maxlength", on: "option input", values: "integer", default: "—", description: "Required. Equals the field's `data-ef-len`, which must fit its column." },
      { name: "scope", on: "th", values: "col | row", default: "—", description: "Column headers name the option column; each row header names its record." },
      { name: "pattern", on: "option input", values: "e.g. [245]", default: "—", description: "Optional native expression of the valid codes. Which codes are valid is application policy." },
      { name: "aria-invalid", on: "option input", values: "true", default: "absent", description: "Set by the application on rows it rejected after Enter." },
      { name: "disabled", on: "option input", values: "boolean", default: "absent", description: "A row that cannot take options, such as a closed account. Skipped by Tab." },
      { name: "colspan", on: "td", values: "integer", default: "—", description: "Lets an explicit empty-result row span the table; it wraps normally." }
    ],
    hooks: {
      "ef-character-grid__table": "The positioned run holding the table. Its caption is visually hidden.",
      "ef-character-grid__field": "In a table cell the field is `display: block` and exactly `data-ef-len` cells wide; on narrow screens its touch minimum extends into the gutter.",
      "data-ef-len": "On `th[scope=col]`: column width in cells. On the field: its width, equal to `maxlength`.",
      "data-ef-gutter": "On the `table`: cells between columns (0-4). The option column plus gutter must be at least five cells for a field shorter than five.",
      "data-ef-height": "Rows the table run occupies, header included.",
      "data-ef-align": "`end` on a column header or cell for amounts.",
      "aria-invalid": "`true` draws the dashed invalid cue on a rejected row's field."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves down and up the option column in row-major order, skipping disabled rows natively, then on to the keys." },
      { keys: "Typing", action: "Enters an option code, stopped at `maxlength`." },
      { keys: "Enter", action: "Native implicit submission through the first submit key; the application processes the changed rows." }
    ],
    events: [
      { name: "submit", description: "Native form event. The application compares each option field with its initial value (the 5250 READC idiom) and validates the changed rows." }
    ],
    form: "Each option field submits as its own named value, conventionally named after its record (`opt-<record id>`). Disabled rows do not submit."
  },
  states: [
    { name: "Empty option", how: "no value", description: "Field surface with a solid underline, waiting for a code." },
    { name: "Option typed", how: "value set by the user", description: "The code is shown in the field until the application processes it." },
    { name: "Rejected", how: "aria-invalid=\"true\" plus a message reference", description: "Dashed rules above and below; the message explains the valid codes." },
    { name: "Unavailable row", how: "disabled", description: "Dotted underline and muted text; skipped by Tab." },
    { name: "Empty list", how: "a single td colspan row", description: "The empty result is stated in words; no fields are rendered." }
  ],
  accessibility: {
    forma: [
      "Keeps native table semantics and native inputs, so screen readers announce the record and column with each field.",
      "Keeps each field exactly its cells wide while giving it a 44px touch target on phones inside its own column.",
      "Uses the shape-based field cues, which survive forced colors."
    ],
    consumer: [
      "Name every field with `aria-labelledby` pointing to the column header and the row header, and describe it with the legend.",
      "On Enter, validate only the changed rows; set `aria-invalid` and the message ID on rejected rows and move focus to the first one.",
      "Clear processed options, or explain in the message what happened to them.",
      "State an empty list in words instead of rendering blank rows."
    ]
  },
  responsive: [
    "The table run keeps its columns at every width; the viewport scrolls horizontally when needed.",
    "On narrow or coarse-pointer screens, fields shorter than five cells extend into the column and gutter to reach 2.75rem (CG-17).",
    "Automatic table layout makes `th[data-ef-len]` widths minimums, so text-spacing overrides widen a column instead of overlapping the next."
  ],
  motion: [
    "No animation: fields, states and rows change immediately."
  ],
  guidance: {
    do: [
      "Show the legend above the list and keep codes short (one or two cells).",
      "Name each field after its record so submitted data identifies the row."
    ],
    avoid: [
      "Putting the option field outside the table or styling a cell to look like a field.",
      "Global single-letter shortcuts for options; typing in a field is the input path."
    ]
  },
  related: [
    { slug: "character-grid-field", note: "Positioned fields outside a table, with labels and hints." },
    { slug: "character-grid", note: "Owns the table run, gutter and every data-ef-* hook." },
    { slug: "data-grid", note: "Use for interactive record lists outside a character grid." }
  ]
};
