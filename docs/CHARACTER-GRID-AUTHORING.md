# Authoring CharacterGrid Interfaces

This guide shows how an application builds keyboard-first character-grid
screens with Forma and where Forma stops. The normative contract is
[`requirements/CHARACTER-GRID.md`](../requirements/CHARACTER-GRID.md); the
evidence is Visual Engineering `CN-VE-TCG-2026-6CA0`,
`LAY-TERMINAL-CHARACTER-GRID`, `CN-VE-TCG-2026-F9F1`, and
`EX-VE-TCG-2026-5437`.

## The division of labor

| Layer | Owns |
| --- | --- |
| **Forma** | The grid, cell placement, protected/editable presentation, key and status presentation, profiles, reveal presentation, contained narrow-screen behavior. HTML and CSS only. |
| **Browser** | Native form behavior: typing, `maxlength`, Tab/Shift+Tab, implicit submission, `SubmitEvent.submitter`, `required`, `disabled`, `formnovalidate`. |
| **Application / Limen** | Physical key mapping, Enter/Clear/Reset/PF processing, input inhibition, initial focus, screen transitions, reveal start/interrupt/replay, content (messages, values, state). |
| **Ordo / application domain** | Whether an action or transition is legal. |

Never move application behavior into Forma to make a screen easier to build,
and never simulate a control with a `div` when a native element exists.

## 1. The grid

```html
<ef-character-grid class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="24" data-ef-columns="80" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="cinq-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <h1 class="ef-character-grid__text" id="cinq-title" data-ef-row="1" data-ef-col="33" data-ef-len="16">CUSTOMER INQUIRY</h1>
        <!-- every other run, in row-major order -->
      </form>
    </div>
  </div>
</ef-character-grid>
```

Rules of thumb:

- Coordinates are 1-based `data-ef-row`, `data-ef-col`, `data-ef-len`
  (and `data-ef-height`). No inline `style`.
- **Write runs in row-major order.** That single rule makes reading order,
  focus order, and visual order agree. Never use positive `tabindex`.
- Use `<form>` as the surface when the screen has fields.
- Wrap semantic groups (`dl`, `role="group"`) in
  `.ef-character-grid__group`; their children keep absolute coordinates.
- Check markup with `node tools/character-grid-conformance.mjs <file>`.

## 2. Protected text and values

```html
<span class="ef-character-grid__text" data-ef-row="10" data-ef-col="2" data-ef-len="17">Account number<span class="ef-character-grid__leader" aria-hidden="true">  :</span></span>
<span class="ef-character-grid__value" data-ef-row="10" data-ef-col="20" data-ef-len="14">00417-2231-09</span>
<span class="ef-character-grid__value" data-ef-row="15" data-ef-col="20" data-ef-len="15" data-ef-align="end">12,480.55</span>
<span class="ef-character-grid__value" data-ef-row="7" data-ef-col="20" data-ef-len="14" data-ef-state="missing">not on file</span>
```

Protected values are text. Do not render them as `readonly` inputs. Render
missing data as explicit words, never as blanks.

## 3. Editable fields

```html
<label class="ef-character-grid__label" for="dob" data-ef-row="9" data-ef-col="2" data-ef-len="23">Date of birth<span class="ef-character-grid__leader" aria-hidden="true"> . . . . .</span></label>
<input class="ef-character-grid__field" id="dob" name="dob" type="text" maxlength="10" autocomplete="bday"
       aria-describedby="dob-hint" data-ef-row="9" data-ef-col="26" data-ef-len="10">
<span class="ef-character-grid__text" id="dob-hint" data-ef-row="9" data-ef-col="38" data-ef-len="12">(YYYY-MM-DD)</span>
```

- `maxlength` equals `data-ef-len`.
- The application sets `aria-invalid="true"` and adds the message ID to
  `aria-describedby` after validation: `aria-describedby="dob-hint cinq-message"`.
- Use native `required`, `disabled`, and `readonly`; also say "required" in the
  label or hint.

## 4. Status and messages

```html
<p class="ef-character-grid__message" id="cinq-message" role="status" data-ef-severity="information"
   data-ef-row="21" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__severity"><span>INFO</span></span> CINQ000I Type search criteria and press Enter.</p>
<p class="ef-character-grid__status" role="status" data-ef-row="24" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__indicator"><span>READY</span></span></p>
```

Keep the message element in the DOM and replace its content, so assistive
technology announces changes. Use `role="alert"` for validation and error.
Always include a visible severity word.

## 5. Action keys

```html
<div class="ef-character-grid__group" role="group" aria-label="Function keys">
  <button class="ef-character-grid__key" type="submit" name="action" value="enter" data-ef-action="enter" data-ef-row="22" data-ef-col="2" data-ef-len="12"><kbd>Enter</kbd>=Search</button>
  <button class="ef-character-grid__key" type="submit" name="action" value="clear" formnovalidate data-ef-action="clear" data-ef-row="22" data-ef-col="16" data-ef-len="11"><kbd>Clear</kbd>=Erase</button>
  <button class="ef-character-grid__key" type="button" data-ef-action="reset" data-ef-row="22" data-ef-col="29" data-ef-len="12"><kbd>Reset</kbd>=Unlock</button>
  <button class="ef-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-ef-action="pf3" data-ef-row="22" data-ef-col="53" data-ef-len="8"><kbd>PF3</kbd>=Exit</button>
</div>
```

- Enter is the **first** submit key, so pressing Enter in any field submits
  through it.
- Keys that must work while fields are invalid (Exit, Cancel, Help, paging,
  Clear) carry `formnovalidate`.
- Reset is `type="button"`. Never use `type="reset"`.

## 6. Deterministic focus order

Focus order is source order, and source order is row-major order. A screen
with fields is visited field by field and then key by key, because keys sit in
the bottom rows. Disabled fields and keys are skipped natively. Shift+Tab
reverses the sequence. A screen with no fields (Account Detail) goes from the
region straight to its keys. Tab can always leave the grid.

## 7. The 3270 profile

Add `data-ef-profile="ibm-3270"` to the grid. Nothing else changes: the same
markup renders in Forma's default presentation without the attribute. See
`patterns/character-grid-3270.html` (24 × 80) and
`patterns/character-grid-workflow.html` (three screens). For 32 × 80 set
`data-ef-rows="32"` and place the reserved rows at 29–32.

## 8. SequentialReveal

```html
<div class="ef-character-grid" data-ef-rows="24" data-ef-columns="80"
     data-ef-reveal="sequential" data-ef-reveal-rows="1">
  …
  <h1 class="ef-character-grid__text" id="cinq-title" data-ef-reveal-run …>CUSTOMER INQUIRY</h1>
```

Only protected text can reveal. Reduced motion is always static. Use it for a
sign-on banner or a title on first display, never for messages, values, or
screens users revisit to verify data.

## 9. Limen / application integration

The code below is **application code**, shown for illustration. It is not
part of Forma and Forma does not ship it.

### Physical keys → presented keys

```js
// Application / Limen. Maps physical function keys to the presented buttons.
const keyToAction = key =>
  /^F([1-9]|1[0-9]|2[0-4])$/.test(key) ? `pf${key.slice(1)}` : key === "Escape" ? "reset" : null;

const presentedKey = (grid, action) =>
  grid.querySelector(`.ef-character-grid__key[data-ef-action="${action}"]:not(:disabled)`);

export const installKeyMapping = grid => {
  grid.querySelectorAll(".ef-character-grid__key[data-ef-action^='pf']")
    .forEach(button => button.setAttribute("aria-keyshortcuts", `F${button.dataset.efAction.slice(2)}`));
  grid.addEventListener("keydown", event => {
    const button = keyToAction(event.key) && presentedKey(grid, keyToAction(event.key));
    if (!button) return;
    event.preventDefault();
    button.click(); // same path as a pointer or keyboard activation
  });
};
```

Only declare `aria-keyshortcuts` for mappings the application actually
installs. Do not bind bare printable characters (WCAG 2.1.4).

### Enter, PF keys, and Clear → application state → transition

```js
// Application / Limen. Forma reports which key was used; the application decides.
const actionOf = event => event.submitter?.dataset.efAction ?? "enter";

export const onSubmit = ({ decide, render }) => event => {
  event.preventDefault();
  const request = { screen: event.currentTarget.dataset.screen, action: actionOf(event),
                    fields: Object.fromEntries(new FormData(event.currentTarget)) };
  const outcome = decide(request); // Ordo / domain: is this legal, and what happens next?
  render(outcome);                 // e.g. next screen, same screen with a message, or input inhibited
};
```

- **Enter** submits the screen. Native `required` and application validation
  both apply; render validation results as `aria-invalid` plus a message.
- **PF keys** carry their action in `submitter`; the application maps them to
  domain requests.
- **Clear**: in the 3270, Clear erases locally *and* notifies the host. An
  application chooses whether to erase fields, notify, or both.
- **Reset** (a `type="button"` key): local recovery, for example removing the
  "X SYSTEM" indicator and re-enabling input after an error. It sends nothing.

### Input inhibition

While a request is outstanding the application may set the status indicator
(`data-ef-state="inhibited"`, "X SYSTEM") and disable keys other than Reset.
Forma presents those states; it never inhibits input on its own.

### Screen transitions

Render the next screen's grid (or update the current one). Decide initial
focus (the 3270 "insert cursor"): typically the first invalid field, otherwise
the first field, otherwise the region. Native `autofocus` or
`element.focus()` are both application choices. Wraparound Tab from the last
field to the first is optional application behavior; do not trap Tab inside
the grid.

### Reveal orchestration

```js
// Application / Limen. Completes a reveal on any input without consuming it.
export const orchestrateReveal = grid => {
  const complete = () => grid.setAttribute("data-ef-reveal", "complete");
  ["keydown", "pointerdown", "focusin"].forEach(type =>
    grid.ownerDocument.addEventListener(type, complete, { capture: true, once: true, passive: true }));
  return {
    replay: () => {
      grid.setAttribute("data-ef-reveal", "static");
      requestAnimationFrame(() => grid.setAttribute("data-ef-reveal", "sequential"));
    }
  };
};
```

- Start a reveal only when new screen content is presented, never on
  re-render of unchanged content.
- Interrupt on any input and let the input proceed (no `preventDefault`).
- Replay only on explicit user request.
- Reduced motion is handled by Forma's CSS; the application must not
  override it.

## 10. One abstraction, many terminal styles

The markup, rules, and tests are the same for every style; only geometry, key
vocabulary, content, and (optionally) a profile change.

| Style | Geometry | Keys (data-ef-action) | Profile | Notes |
| --- | --- | --- | --- | --- |
| IBM 3270 | 24 × 80, 32 × 80, 43 × 80, 27 × 132 | `enter`, `clear`, `reset`, `pf1`–`pf24`, `pa1`–`pa3` | `ibm-3270` | Reference profile. |
| IBM 5250 | 24 × 80, 27 × 132 | `enter`, `f1`–`f24`, `help`, `roll-up`, `roll-down`, `field-exit`, `reset` | default, or a custom token set | `<kbd>F3</kbd>=Exit`, `<kbd>F12</kbd>=Cancel`. Field Exit is a named action; its behavior is application-owned. |
| DOS / text mode, TUI | e.g. 25 × 80 | `f1`–`f10`, named actions | default or custom tokens | Menus are `dl`/`role="group"` groups; the F-key bar is the key group on the last row. |
| BBS-style | e.g. 24 × 80 | named actions | default or custom tokens | Single-letter commands must be buttons or a command field, not global letter shortcuts (WCAG 2.1.4). |
| Modern character grid | any R × C ≤ 50 × 132 | named actions, e.g. `<kbd>Ctrl+S</kbd> Save` | default (follows light/dark) | Use `data-ef-narrow="reflow"` when positions carry no meaning. |

Forma ships only the `ibm-3270` profile. 5250, DOS, and BBS characteristics
beyond geometry and keys were not verified by Visual Engineering, so no
profile claims to reproduce them.

## 11. Accessibility checklist

- Every field has a preceding `<label for>`; leaders are `aria-hidden`.
- Every message has a visible severity word and a live role.
- State is never color-only (Forma's cues differ in shape).
- The viewport is named and focusable; the page never scrolls horizontally.
- Rows are at least 24px (1.5rem); 44px on narrow and coarse-pointer screens.
- Test at 320 and 390 CSS px, 200 % text, forced colors, and reduced motion.
- WCAG 1.4.12 text-spacing overrides widen the grid's columns instead of
  overlapping runs (GAP-TCG-11), so contained grids support them; keep the
  viewport contained and do not fix run widths in application CSS.
