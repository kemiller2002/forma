export default {
  name: "Character grid workflow",
  category: "keyboard",
  behavior: "Application / Limen / Ordo",
  summary: "Customer Inquiry, Account Detail, and Transaction History built only from public CharacterGrid contracts; transitions stay in the application.",
  purpose: {
    description: "The reference workflow shows three linked 24 by 80 screens in the [[character-grid-3270]] profile: Customer Inquiry (CINQ) with six search fields, Account Detail (ACCD) with protected data only, and Transaction History (TRNH) with date fields and a positioned 12-row table. It uses only public `ef-character-grid*` classes and `ef-stack`, with no inline style and no product CSS. The screens are independent grids on one page: moving between them is application or Limen behavior driven by the native submitter value, and whether a transition is legal (for example, whether a restricted account may be displayed) is Ordo or application-domain state.",
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
      "Only the CINQ title uses SequentialReveal (`data-ef-reveal-rows=\"1\"`).",
      "Transitions follow the submitter: CINQ Enter goes to ACCD when exactly one customer matches, ACCD PF5 to TRNH, TRNH PF3 back to ACCD, PF12 to CINQ.",
      "Application states are rendered by changing values, `aria-invalid`, message content and the status indicator, never the structure."
    ]
  },
  examples: [
    {
      id: "inquiry-validation",
      title: "Inquiry validation",
      description: "The application rejected the date of birth after Enter. The field has `aria-invalid=\"true\"` and is described by its format hint and the message, which becomes `role=\"alert\"` with the INVALID severity word. The insert cursor (initial focus) would go to this field; that is application behavior.",
      html: `<ef-character-grid-workflow class="ef-component-tag">
  <div class="ef-character-grid" data-ef-profile="ibm-3270" data-ef-rows="24" data-ef-status-rows="1" data-ef-columns="80" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-workflow-inquiry-validation-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <span class="ef-character-grid__text" data-ef-row="1" data-ef-col="2" data-ef-len="4">CINQ</span>
        <h2 class="ef-character-grid__text" id="character-grid-workflow-inquiry-validation-title" data-ef-emphasis="intensified" data-ef-row="1" data-ef-col="33" data-ef-len="16">CUSTOMER INQUIRY</h2>
        <span class="ef-character-grid__text" data-ef-row="1" data-ef-col="64" data-ef-len="5">Date:</span>
        <span class="ef-character-grid__value" data-ef-row="1" data-ef-col="70" data-ef-len="10">2026-09-30</span>
        <p class="ef-character-grid__text" data-ef-row="4" data-ef-col="2" data-ef-len="52">Enter one or more search criteria, then press Enter.</p>
        <label class="ef-character-grid__label" for="character-grid-workflow-inquiry-validation-last" data-ef-row="6" data-ef-col="2" data-ef-len="23">Last name<span class="ef-character-grid__leader" aria-hidden="true"> . . . . . . .</span></label>
        <input class="ef-character-grid__field" id="character-grid-workflow-inquiry-validation-last" name="last" type="text" maxlength="20" value="RIVERA" autocomplete="off" data-ef-row="6" data-ef-col="26" data-ef-len="20">
        <label class="ef-character-grid__label" for="character-grid-workflow-inquiry-validation-dob" data-ef-row="7" data-ef-col="2" data-ef-len="23">Date of birth<span class="ef-character-grid__leader" aria-hidden="true"> . . . . .</span></label>
        <input class="ef-character-grid__field" id="character-grid-workflow-inquiry-validation-dob" name="dob" type="text" maxlength="10" value="2026-02-30" aria-invalid="true" aria-describedby="character-grid-workflow-inquiry-validation-dob-hint character-grid-workflow-inquiry-validation-message" autocomplete="off" data-ef-row="7" data-ef-col="26" data-ef-len="10">
        <span class="ef-character-grid__text" id="character-grid-workflow-inquiry-validation-dob-hint" data-ef-emphasis="muted" data-ef-row="7" data-ef-col="38" data-ef-len="12">(YYYY-MM-DD)</span>
        <label class="ef-character-grid__label" for="character-grid-workflow-inquiry-validation-postal" data-ef-row="8" data-ef-col="2" data-ef-len="23">Postal code<span class="ef-character-grid__leader" aria-hidden="true"> . . . . . .</span></label>
        <input class="ef-character-grid__field" id="character-grid-workflow-inquiry-validation-postal" name="postal" type="text" maxlength="10" autocomplete="off" data-ef-row="8" data-ef-col="26" data-ef-len="10">
        <p class="ef-character-grid__message" id="character-grid-workflow-inquiry-validation-message" role="alert" data-ef-severity="validation" data-ef-row="21" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__severity"><span>INVALID</span></span> CINQ003E Date of birth 2026-02-30 is not a valid date.</p>
        <div class="ef-character-grid__group" role="group" aria-label="Function keys">
          <button class="ef-character-grid__key" type="submit" name="action" value="enter" data-ef-action="enter" data-ef-row="22" data-ef-col="2" data-ef-len="12"><kbd>Enter</kbd>=Search</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="clear" formnovalidate data-ef-action="clear" data-ef-row="22" data-ef-col="16" data-ef-len="11"><kbd>Clear</kbd>=Erase</button>
          <button class="ef-character-grid__key" type="button" data-ef-action="reset" data-ef-row="22" data-ef-col="29" data-ef-len="12"><kbd>Reset</kbd>=Unlock</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-ef-action="pf3" data-ef-row="22" data-ef-col="43" data-ef-len="8"><kbd>PF3</kbd>=Exit</button>
        </div>
        <p class="ef-character-grid__status" role="status" data-ef-row="25" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__indicator"><span>READY</span></span></p>
      </form>
    </div>
  </div>
</ef-character-grid-workflow>`
    },
    {
      id: "history-empty",
      title: "History with no transactions",
      description: "Transaction History after the user narrowed the dates. The table states the empty result in one full-width row, the paging position says 0 of 0 and the information message confirms the period. PF7 and PF8 are omitted because there is nothing to page.",
      html: `<ef-character-grid-workflow class="ef-component-tag">
  <div class="ef-character-grid" data-ef-profile="ibm-3270" data-ef-rows="24" data-ef-status-rows="1" data-ef-columns="80" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-workflow-history-empty-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <span class="ef-character-grid__text" data-ef-row="1" data-ef-col="2" data-ef-len="4">TRNH</span>
        <h2 class="ef-character-grid__text" id="character-grid-workflow-history-empty-title" data-ef-emphasis="intensified" data-ef-row="1" data-ef-col="31" data-ef-len="19">TRANSACTION HISTORY</h2>
        <span class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="11">Account<span class="ef-character-grid__leader" aria-hidden="true"> . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="3" data-ef-col="14" data-ef-len="14">00417-2231-09</span>
        <label class="ef-character-grid__label" for="character-grid-workflow-history-empty-from" data-ef-row="3" data-ef-col="32" data-ef-len="11">From<span class="ef-character-grid__leader" aria-hidden="true">  . . :</span></label>
        <input class="ef-character-grid__field" id="character-grid-workflow-history-empty-from" name="from" type="text" maxlength="10" value="2026-09-28" required autocomplete="off" data-ef-row="3" data-ef-col="44" data-ef-len="10">
        <label class="ef-character-grid__label" for="character-grid-workflow-history-empty-to" data-ef-row="3" data-ef-col="57" data-ef-len="4">To<span class="ef-character-grid__leader" aria-hidden="true"> :</span></label>
        <input class="ef-character-grid__field" id="character-grid-workflow-history-empty-to" name="to" type="text" maxlength="10" value="2026-09-30" required autocomplete="off" data-ef-row="3" data-ef-col="62" data-ef-len="10">
        <div class="ef-character-grid__table" data-ef-row="5" data-ef-col="2" data-ef-len="77" data-ef-height="13">
          <table data-ef-gutter="2">
            <caption>Transactions for account 00417-2231-09, newest first</caption>
            <thead><tr><th scope="col" data-ef-len="10">Date</th><th scope="col" data-ef-len="27">Description</th><th scope="col" data-ef-len="12" data-ef-align="end">Amount</th><th scope="col" data-ef-len="12" data-ef-align="end">Balance</th><th scope="col" data-ef-len="8">Status</th></tr></thead>
            <tbody>
            <tr><td colspan="5">No transactions between 2026-09-28 and 2026-09-30.</td></tr>
            </tbody>
          </table>
        </div>
        <span class="ef-character-grid__text" data-ef-row="19" data-ef-col="2" data-ef-len="15">Rows 0 of 0</span>
        <p class="ef-character-grid__message" id="character-grid-workflow-history-empty-message" role="status" data-ef-severity="information" data-ef-row="21" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__severity"><span>INFO</span></span> TRNH004I No transactions in the selected period.</p>
        <div class="ef-character-grid__group" role="group" aria-label="Function keys">
          <button class="ef-character-grid__key" type="submit" name="action" value="enter" data-ef-action="enter" data-ef-row="22" data-ef-col="2" data-ef-len="17"><kbd>Enter</kbd>=Apply dates</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-ef-action="pf3" data-ef-row="22" data-ef-col="21" data-ef-len="10"><kbd>PF3</kbd>=Return</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="pf12" formnovalidate data-ef-action="pf12" data-ef-row="22" data-ef-col="33" data-ef-len="12"><kbd>PF12</kbd>=Inquiry</button>
        </div>
        <p class="ef-character-grid__status" role="status" data-ef-row="25" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__indicator"><span>READY</span></span></p>
      </form>
    </div>
  </div>
</ef-character-grid-workflow>`
    },
    {
      id: "history-error-mobile",
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
      html: `<ef-character-grid-workflow class="ef-component-tag">
  <div class="ef-character-grid" data-ef-profile="ibm-3270" data-ef-rows="24" data-ef-status-rows="1" data-ef-columns="80" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-workflow-history-error-mobile-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <span class="ef-character-grid__text" data-ef-row="1" data-ef-col="2" data-ef-len="4">TRNH</span>
        <h2 class="ef-character-grid__text" id="character-grid-workflow-history-error-mobile-title" data-ef-emphasis="intensified" data-ef-row="1" data-ef-col="31" data-ef-len="19">TRANSACTION HISTORY</h2>
        <span class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="11">Account<span class="ef-character-grid__leader" aria-hidden="true"> . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="3" data-ef-col="14" data-ef-len="14">00417-2231-09</span>
        <div class="ef-character-grid__table" data-ef-row="5" data-ef-col="2" data-ef-len="77" data-ef-height="13">
          <table data-ef-gutter="2">
            <caption>Transactions for account 00417-2231-09, newest first</caption>
            <thead><tr><th scope="col" data-ef-len="10">Date</th><th scope="col" data-ef-len="27">Description</th><th scope="col" data-ef-len="12" data-ef-align="end">Amount</th><th scope="col" data-ef-len="12" data-ef-align="end">Balance</th><th scope="col" data-ef-len="8">Status</th></tr></thead>
            <tbody>
            <tr><td colspan="5">Transaction history is unavailable.</td></tr>
            </tbody>
          </table>
        </div>
        <span class="ef-character-grid__text" data-ef-row="19" data-ef-col="2" data-ef-len="15">Rows unknown</span>
        <p class="ef-character-grid__message" id="character-grid-workflow-history-error-mobile-message" role="alert" data-ef-severity="error" data-ef-row="21" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__severity"><span>ERROR</span></span> TRNH009E Transaction service did not respond. Press Reset, then Enter.</p>
        <div class="ef-character-grid__group" role="group" aria-label="Function keys">
          <button class="ef-character-grid__key" type="submit" name="action" value="enter" data-ef-action="enter" data-ef-row="22" data-ef-col="2" data-ef-len="11"><kbd>Enter</kbd>=Retry</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-ef-action="pf3" data-ef-row="22" data-ef-col="15" data-ef-len="10"><kbd>PF3</kbd>=Return</button>
          <button class="ef-character-grid__key" type="button" data-ef-action="reset" data-ef-row="23" data-ef-col="2" data-ef-len="12"><kbd>Reset</kbd>=Unlock</button>
        </div>
        <p class="ef-character-grid__status" role="status" data-ef-row="25" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__indicator" data-ef-state="inhibited"><span>X SYSTEM</span></span></p>
      </form>
    </div>
  </div>
</ef-character-grid-workflow>`
    }
  ],
  api: {
    attributes: [
      { name: "value", on: "submit keys named action", values: "enter | clear | pf3 | pf5 | pf7 | pf8 | pf12", default: "—", description: "The submitter value the application reads to choose the next screen." },
      { name: "aria-invalid", on: "field", values: "true", default: "absent", description: "Set by the application on a field it rejected, together with the message ID in `aria-describedby`." },
      { name: "colspan", on: "td", values: "5", default: "—", description: "Full-width empty or unavailable row in the history table." }
    ],
    hooks: {
      "data-ef-profile": "Every workflow screen uses `ibm-3270`.",
      "data-ef-status-rows": "`1`: the Operator Information Area on row 25.",
      "data-ef-reveal": "`sequential` on the CINQ grid only, with `data-ef-reveal-rows=\"1\"` so only the title row is timed.",
      "data-ef-action": "Names each key's action; the application maps it to a transition.",
      "data-ef-severity": "Message severity rendered by the application for the current state.",
      "data-ef-state": "`inhibited` on the status indicator while the service is unavailable; `missing` on ACCD values that are not on file.",
      "ef-character-grid__table": "The TRNH 12-row positioned table with a two-cell gutter.",
      "ef-stack": "The canonical pattern stacks the three independent grids vertically."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "CINQ: region, six fields, then keys. ACCD (no fields): region straight to its keys. TRNH: region, two date fields, keys. Tab can always leave each grid." },
      { keys: "Enter in a field", action: "Implicit submission through the Enter key of that screen." },
      { keys: "PF keys", action: "Present as buttons; physical F-key mapping is application or Limen behavior." }
    ],
    events: [
      { name: "submit", description: "Native event per screen. The application reads `event.submitter.dataset.efAction`, asks the domain whether the transition is legal, and renders the next screen or the same screen with a message." }
    ],
    form: "Each screen is its own native form. Clear and PF keys use `formnovalidate`; the two TRNH date fields are `required`, so Enter is blocked natively until both have values."
  },
  states: [
    { name: "Default", how: "canonical pattern", description: "CINQ with an information message, ACCD with protected data, TRNH with 12 of 37 rows." },
    { name: "Inquiry validation", how: "aria-invalid plus a validation message with role=alert", description: "The invalid field is described by its hint and the message." },
    { name: "Inquiry no criteria", how: "error message with role=alert", description: "CINQ001E asks for at least one criterion." },
    { name: "History empty", how: "one td colspan row and an information message", description: "The empty period is stated in words; paging shows 0 of 0." },
    { name: "History error", how: "error message and data-ef-state=\"inhibited\" on the indicator", description: "The table says history is unavailable and the OIA shows X SYSTEM." }
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
