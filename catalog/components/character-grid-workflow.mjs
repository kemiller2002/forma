export default {
  name: "Character grid workflow",
  category: "keyboard",
  behavior: "Application / Limen / Ordo",
  summary: "Customer Inquiry, Account Detail, and Transaction History built only from public CharacterGrid contracts; transitions stay in the application.",
  purpose: {
    description: "The reference workflow shows three linked 24 by 80 screens in the [[character-grid-3270]] profile: Customer Inquiry (CINQ) with six search fields, Account Detail (ACCD) with protected data only, and Transaction History (TRNH) with date fields and a positioned 12-row table. It uses only public `forma-character-grid*` classes and `forma-stack`, with no inline style and no product CSS. The screens are independent grids on one page: moving between them is application or Limen behavior driven by the native submitter value, and whether a transition is legal (for example, whether a restricted account may be displayed) is Ordo or application-domain state.",
    useWhen: [
      "Planning a multi-screen host re-platforming and you need a worked example of fields, protected data, tables, keys and messages together.",
      "Checking which parts of a flow Forma presents and which the application must implement.",
      "Rendering application states (validation, empty, service error) of a character-grid screen."
    ],
    avoidWhen: [
      "Building a single screen: start from [[character-grid]] and the family pages.",
      "Multi-step forms outside a character grid: use [[wizard]] or [[steps]].",
      "Expecting Forma to move between screens: there is no navigation behavior in the markup."
    ],
    characteristics: [
      "Each screen has its own named region, form surface, message run on row 21, keys on rows 22-23 and the Operator Information Area on row 25.",
      "Only the CINQ title uses SequentialReveal (`data-forma-reveal-rows=\"1\"`).",
      "Transitions follow the submitter: CINQ Enter goes to ACCD when exactly one customer matches, ACCD PF5 to TRNH, TRNH PF3 back to ACCD, PF12 to CINQ.",
      "Application states are rendered by changing values, `aria-invalid`, message content and the status indicator, never the structure."
    ]
  },
  basicInteraction: { kind: "static", reasons: ["application-behavior", "form-handling"] },
  examples: [
    {
      id: "inquiry-validation",
      interaction: { kind: "static", reasons: ["application-behavior", "form-handling"] },
      title: "Inquiry validation",
      description: "The application rejected the date of birth after Enter. The field has `aria-invalid=\"true\"` and is described by its format hint and the message, which becomes `role=\"alert\"` with the INVALID severity word. The insert cursor (initial focus) would go to this field; that is application behavior.",
      html: `<forma-character-grid-workflow class="forma-component-tag">
  <div class="forma-character-grid" data-forma-profile="ibm-3270" data-forma-rows="24" data-forma-status-rows="1" data-forma-columns="80" data-forma-narrow="contained">
    <div class="forma-character-grid__viewport" role="region" aria-labelledby="character-grid-workflow-inquiry-validation-title" tabindex="0">
      <form class="forma-character-grid__surface">
        <span class="forma-character-grid__text" data-forma-row="1" data-forma-col="2" data-forma-len="4">CINQ</span>
        <h2 class="forma-character-grid__text" id="character-grid-workflow-inquiry-validation-title" data-forma-emphasis="intensified" data-forma-row="1" data-forma-col="33" data-forma-len="16">CUSTOMER INQUIRY</h2>
        <span class="forma-character-grid__text" data-forma-row="1" data-forma-col="64" data-forma-len="5">Date:</span>
        <span class="forma-character-grid__value" data-forma-row="1" data-forma-col="70" data-forma-len="10">2026-09-30</span>
        <p class="forma-character-grid__text" data-forma-row="4" data-forma-col="2" data-forma-len="52">Enter one or more search criteria, then press Enter.</p>
        <label class="forma-character-grid__label" for="character-grid-workflow-inquiry-validation-last" data-forma-row="6" data-forma-col="2" data-forma-len="23">Last name<span class="forma-character-grid__leader" aria-hidden="true"> . . . . . . .</span></label>
        <input class="forma-character-grid__field" id="character-grid-workflow-inquiry-validation-last" name="last" type="text" maxlength="20" value="RIVERA" autocomplete="off" data-forma-row="6" data-forma-col="26" data-forma-len="20">
        <label class="forma-character-grid__label" for="character-grid-workflow-inquiry-validation-dob" data-forma-row="7" data-forma-col="2" data-forma-len="23">Date of birth<span class="forma-character-grid__leader" aria-hidden="true"> . . . . .</span></label>
        <input class="forma-character-grid__field" id="character-grid-workflow-inquiry-validation-dob" name="dob" type="text" maxlength="10" value="2026-02-30" aria-invalid="true" aria-describedby="character-grid-workflow-inquiry-validation-dob-hint character-grid-workflow-inquiry-validation-message" autocomplete="off" data-forma-row="7" data-forma-col="26" data-forma-len="10">
        <span class="forma-character-grid__text" id="character-grid-workflow-inquiry-validation-dob-hint" data-forma-emphasis="muted" data-forma-row="7" data-forma-col="38" data-forma-len="12">(YYYY-MM-DD)</span>
        <label class="forma-character-grid__label" for="character-grid-workflow-inquiry-validation-postal" data-forma-row="8" data-forma-col="2" data-forma-len="23">Postal code<span class="forma-character-grid__leader" aria-hidden="true"> . . . . . .</span></label>
        <input class="forma-character-grid__field" id="character-grid-workflow-inquiry-validation-postal" name="postal" type="text" maxlength="10" autocomplete="off" data-forma-row="8" data-forma-col="26" data-forma-len="10">
        <p class="forma-character-grid__message" id="character-grid-workflow-inquiry-validation-message" role="alert" data-forma-severity="validation" data-forma-row="21" data-forma-col="2" data-forma-len="78"><span class="forma-character-grid__severity"><span>INVALID</span></span> CINQ003E Date of birth 2026-02-30 is not a valid date.</p>
        <div class="forma-character-grid__group" role="group" aria-label="Function keys">
          <button class="forma-character-grid__key" type="submit" name="action" value="enter" data-forma-action="enter" data-forma-row="22" data-forma-col="2" data-forma-len="12"><kbd>Enter</kbd>=Search</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="clear" formnovalidate data-forma-action="clear" data-forma-row="22" data-forma-col="16" data-forma-len="11"><kbd>Clear</kbd>=Erase</button>
          <button class="forma-character-grid__key" type="button" data-forma-action="reset" data-forma-row="22" data-forma-col="29" data-forma-len="12"><kbd>Reset</kbd>=Unlock</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-forma-action="pf3" data-forma-row="22" data-forma-col="43" data-forma-len="8"><kbd>PF3</kbd>=Exit</button>
        </div>
        <p class="forma-character-grid__status" role="status" data-forma-row="25" data-forma-col="2" data-forma-len="78"><span class="forma-character-grid__indicator"><span>READY</span></span></p>
      </form>
    </div>
  </div>
</forma-character-grid-workflow>`
    },
    {
      id: "history-empty",
      interaction: { kind: "static", reasons: ["form-handling"] },
      title: "History with no transactions",
      description: "Transaction History after the user narrowed the dates. The table states the empty result in one full-width row, the paging position says 0 of 0 and the information message confirms the period. PF7 and PF8 are omitted because there is nothing to page.",
      html: `<forma-character-grid-workflow class="forma-component-tag">
  <div class="forma-character-grid" data-forma-profile="ibm-3270" data-forma-rows="24" data-forma-status-rows="1" data-forma-columns="80" data-forma-narrow="contained">
    <div class="forma-character-grid__viewport" role="region" aria-labelledby="character-grid-workflow-history-empty-title" tabindex="0">
      <form class="forma-character-grid__surface">
        <span class="forma-character-grid__text" data-forma-row="1" data-forma-col="2" data-forma-len="4">TRNH</span>
        <h2 class="forma-character-grid__text" id="character-grid-workflow-history-empty-title" data-forma-emphasis="intensified" data-forma-row="1" data-forma-col="31" data-forma-len="19">TRANSACTION HISTORY</h2>
        <span class="forma-character-grid__text" data-forma-row="3" data-forma-col="2" data-forma-len="11">Account<span class="forma-character-grid__leader" aria-hidden="true"> . :</span></span>
        <span class="forma-character-grid__value" data-forma-row="3" data-forma-col="14" data-forma-len="14">00417-2231-09</span>
        <label class="forma-character-grid__label" for="character-grid-workflow-history-empty-from" data-forma-row="3" data-forma-col="32" data-forma-len="11">From<span class="forma-character-grid__leader" aria-hidden="true">  . . :</span></label>
        <input class="forma-character-grid__field" id="character-grid-workflow-history-empty-from" name="from" type="text" maxlength="10" value="2026-09-28" required autocomplete="off" data-forma-row="3" data-forma-col="44" data-forma-len="10">
        <label class="forma-character-grid__label" for="character-grid-workflow-history-empty-to" data-forma-row="3" data-forma-col="57" data-forma-len="4">To<span class="forma-character-grid__leader" aria-hidden="true"> :</span></label>
        <input class="forma-character-grid__field" id="character-grid-workflow-history-empty-to" name="to" type="text" maxlength="10" value="2026-09-30" required autocomplete="off" data-forma-row="3" data-forma-col="62" data-forma-len="10">
        <div class="forma-character-grid__table" data-forma-row="5" data-forma-col="2" data-forma-len="77" data-forma-height="13">
          <table data-forma-gutter="2">
            <caption>Transactions for account 00417-2231-09, newest first</caption>
            <thead><tr><th scope="col" data-forma-len="10">Date</th><th scope="col" data-forma-len="27">Description</th><th scope="col" data-forma-len="12" data-forma-align="end">Amount</th><th scope="col" data-forma-len="12" data-forma-align="end">Balance</th><th scope="col" data-forma-len="8">Status</th></tr></thead>
            <tbody>
            <tr><td colspan="5">No transactions between 2026-09-28 and 2026-09-30.</td></tr>
            </tbody>
          </table>
        </div>
        <span class="forma-character-grid__text" data-forma-row="19" data-forma-col="2" data-forma-len="15">Rows 0 of 0</span>
        <p class="forma-character-grid__message" id="character-grid-workflow-history-empty-message" role="status" data-forma-severity="information" data-forma-row="21" data-forma-col="2" data-forma-len="78"><span class="forma-character-grid__severity"><span>INFO</span></span> TRNH004I No transactions in the selected period.</p>
        <div class="forma-character-grid__group" role="group" aria-label="Function keys">
          <button class="forma-character-grid__key" type="submit" name="action" value="enter" data-forma-action="enter" data-forma-row="22" data-forma-col="2" data-forma-len="17"><kbd>Enter</kbd>=Apply dates</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-forma-action="pf3" data-forma-row="22" data-forma-col="21" data-forma-len="10"><kbd>PF3</kbd>=Return</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="pf12" formnovalidate data-forma-action="pf12" data-forma-row="22" data-forma-col="33" data-forma-len="12"><kbd>PF12</kbd>=Inquiry</button>
        </div>
        <p class="forma-character-grid__status" role="status" data-forma-row="25" data-forma-col="2" data-forma-len="78"><span class="forma-character-grid__indicator"><span>READY</span></span></p>
      </form>
    </div>
  </div>
</forma-character-grid-workflow>`
    },
    {
      id: "history-error-mobile",
      interaction: { kind: "static", reasons: ["application-behavior", "form-handling"] },
      title: "Service error on a phone",
      description: "Transaction History when the transaction service failed, at phone width. The table says the history is unavailable, the error message is an alert, and the Operator Information Area shows X SYSTEM until Reset.",
      mobile: {
        height: 480,
        notes: [
          "Each 80-column screen scrolls horizontally inside its own named viewport; the page scrolls only vertically between screens.",
          "The severity word, the Reset key and the status indicator all start at column 2, so the recovery path is visible without scrolling sideways.",
          "Rows grow to 44px at the touch pitch, so a 24-row screen is tall; the message and keys are near the bottom and reached by normal page scrolling.",
          "Landscape shows more columns of each row; positions and focus order do not change."
        ]
      },
      html: `<forma-character-grid-workflow class="forma-component-tag">
  <div class="forma-character-grid" data-forma-profile="ibm-3270" data-forma-rows="24" data-forma-status-rows="1" data-forma-columns="80" data-forma-narrow="contained">
    <div class="forma-character-grid__viewport" role="region" aria-labelledby="character-grid-workflow-history-error-mobile-title" tabindex="0">
      <form class="forma-character-grid__surface">
        <span class="forma-character-grid__text" data-forma-row="1" data-forma-col="2" data-forma-len="4">TRNH</span>
        <h2 class="forma-character-grid__text" id="character-grid-workflow-history-error-mobile-title" data-forma-emphasis="intensified" data-forma-row="1" data-forma-col="31" data-forma-len="19">TRANSACTION HISTORY</h2>
        <span class="forma-character-grid__text" data-forma-row="3" data-forma-col="2" data-forma-len="11">Account<span class="forma-character-grid__leader" aria-hidden="true"> . :</span></span>
        <span class="forma-character-grid__value" data-forma-row="3" data-forma-col="14" data-forma-len="14">00417-2231-09</span>
        <div class="forma-character-grid__table" data-forma-row="5" data-forma-col="2" data-forma-len="77" data-forma-height="13">
          <table data-forma-gutter="2">
            <caption>Transactions for account 00417-2231-09, newest first</caption>
            <thead><tr><th scope="col" data-forma-len="10">Date</th><th scope="col" data-forma-len="27">Description</th><th scope="col" data-forma-len="12" data-forma-align="end">Amount</th><th scope="col" data-forma-len="12" data-forma-align="end">Balance</th><th scope="col" data-forma-len="8">Status</th></tr></thead>
            <tbody>
            <tr><td colspan="5">Transaction history is unavailable.</td></tr>
            </tbody>
          </table>
        </div>
        <span class="forma-character-grid__text" data-forma-row="19" data-forma-col="2" data-forma-len="15">Rows unknown</span>
        <p class="forma-character-grid__message" id="character-grid-workflow-history-error-mobile-message" role="alert" data-forma-severity="error" data-forma-row="21" data-forma-col="2" data-forma-len="78"><span class="forma-character-grid__severity"><span>ERROR</span></span> TRNH009E Transaction service did not respond. Press Reset, then Enter.</p>
        <div class="forma-character-grid__group" role="group" aria-label="Function keys">
          <button class="forma-character-grid__key" type="submit" name="action" value="enter" data-forma-action="enter" data-forma-row="22" data-forma-col="2" data-forma-len="11"><kbd>Enter</kbd>=Retry</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-forma-action="pf3" data-forma-row="22" data-forma-col="15" data-forma-len="10"><kbd>PF3</kbd>=Return</button>
          <button class="forma-character-grid__key" type="button" data-forma-action="reset" data-forma-row="23" data-forma-col="2" data-forma-len="12"><kbd>Reset</kbd>=Unlock</button>
        </div>
        <p class="forma-character-grid__status" role="status" data-forma-row="25" data-forma-col="2" data-forma-len="78"><span class="forma-character-grid__indicator" data-forma-state="inhibited"><span>X SYSTEM</span></span></p>
      </form>
    </div>
  </div>
</forma-character-grid-workflow>`
    }
  ],
  api: {
    attributes: [
      { name: "value", on: "submit keys named action", values: "enter | clear | pf3 | pf5 | pf7 | pf8 | pf12", default: "—", description: "The submitter value the application reads to choose the next screen." },
      { name: "aria-invalid", on: "field", values: "true", default: "absent", description: "Set by the application on a field it rejected, together with the message ID in `aria-describedby`." },
      { name: "colspan", on: "td", values: "5", default: "—", description: "Full-width empty or unavailable row in the history table." }
    ],
    hooks: {
      "data-forma-profile": "Every workflow screen uses `ibm-3270`.",
      "data-forma-status-rows": "`1`: the Operator Information Area on row 25.",
      "data-forma-reveal": "`sequential` on the CINQ grid only, with `data-forma-reveal-rows=\"1\"` so only the title row is timed.",
      "data-forma-action": "Names each key's action; the application maps it to a transition.",
      "data-forma-severity": "Message severity rendered by the application for the current state.",
      "data-forma-state": "`inhibited` on the status indicator while the service is unavailable; `missing` on ACCD values that are not on file.",
      "forma-character-grid__table": "The TRNH 12-row positioned table with a two-cell gutter.",
      "forma-stack": "The canonical pattern stacks the three independent grids vertically."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "CINQ: region, six fields, then keys. ACCD (no fields): region straight to its keys. TRNH: region, two date fields, keys. Tab can always leave each grid." },
      { keys: "Enter in a field", action: "Implicit submission through the Enter key of that screen." },
      { keys: "PF keys", action: "Present as buttons; physical F-key mapping is application or Limen behavior." }
    ],
    events: [
      { name: "submit", description: "Native event per screen. The application reads `event.submitter.dataset.formaAction`, asks the domain whether the transition is legal, and renders the next screen or the same screen with a message." }
    ],
    form: "Each screen is its own native form. Clear and PF keys use `formnovalidate`; the two TRNH date fields are `required`, so Enter is blocked natively until both have values."
  },
  states: [
    { name: "Default", how: "canonical pattern", description: "CINQ with an information message, ACCD with protected data, TRNH with 12 of 37 rows." },
    { name: "Inquiry validation", how: "aria-invalid plus a validation message with role=alert", description: "The invalid field is described by its hint and the message." },
    { name: "Inquiry no criteria", how: "error message with role=alert", description: "CINQ001E asks for at least one criterion." },
    { name: "History empty", how: "one td colspan row and an information message", description: "The empty period is stated in words; paging shows 0 of 0." },
    { name: "History error", how: "error message and data-forma-state=\"inhibited\" on the indicator", description: "The table says history is unavailable and the OIA shows X SYSTEM." }
  ],
  accessibility: {
    forma: [
      "Each screen is a separately named region, so screen reader users can move between screens by landmark.",
      "Every state passes the conformance checks and axe in the repository's workflow tests.",
      "Focus order on every screen is row-major without `tabindex`.",
      "Messages keep visible severity words and shape cues under the 3270 palette and in forced colors."
    ],
    consumer: [
      "Implement transitions from the submitter value and keep legality in Ordo or domain state.",
      "Set initial focus on each new screen: first invalid field, otherwise first field, otherwise the region.",
      "Replace message content in place so the change is announced; do not recreate the message element.",
      "Start the CINQ title reveal only when the screen is first presented, and complete it on any input."
    ]
  },
  responsive: [
    "Every screen keeps its 80 columns; each viewport scrolls horizontally on narrow screens and the page never does.",
    "At the 44px touch pitch 24-row screens become tall; the page scrolls vertically between and within screens.",
    "The history table keeps its columns and widens under text-spacing overrides instead of overlapping."
  ],
  motion: [
    "Only the CINQ title can animate, through SequentialReveal limited to row 1; under reduced motion it is static.",
    "Screen transitions have no animation: the application renders the next grid."
  ],
  guidance: {
    do: [
      "Use the canonical screens as a checklist of what each layer owns before building your own flow.",
      "Render application states by changing values, attributes and message content, not by restructuring the screen."
    ],
    avoid: [
      "Encoding transition rules or permissions in markup or CSS.",
      "Replaying the title reveal when returning to CINQ with PF12."
    ]
  },
  related: [
    { slug: "character-grid-3270", note: "The profile every workflow screen uses." },
    { slug: "character-grid-keys", note: "The Enter, Clear, Reset and PF keys that drive transitions." },
    { slug: "character-grid-status", note: "The messages and status indicator used for each application state." },
    { slug: "wizard", note: "Use for guided multi-step tasks outside a character grid." }
  ]
};
