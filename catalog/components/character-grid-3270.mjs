export default {
  name: "Character grid 3270 profile",
  category: "keyboard",
  behavior: "Application / Limen",
  summary: "IBM 3270-inspired reference profile built only from public CharacterGrid contracts: a 24x80 operations menu with 3279-style palette tokens and block caret, verified at 32x80.",
  purpose: {
    description: "The 3270 profile is the first reference presentation for [[character-grid]]. Adding `data-ef-profile=\"ibm-3270\"` to a grid swaps presentation tokens only: black screen, protected text in blue, intensified text and values in white, unprotected fields in green, severity colors, a block caret on fields and a rule over the device status row. Geometry, placement, order and semantics are unchanged, and the same markup renders in Forma's default presentation without the attribute. It is a stylistic evocation of the 3279 palette, not an emulation: no data stream, attribute bytes, autoskip, wraparound Tab or uppercase transformation is reproduced.",
    useWhen: [
      "An application re-platforms 3270 host screens and operators expect the familiar palette.",
      "A screen models the 3270 Operator Information Area on a device status row after the application rows.",
      "You need a verified reference geometry: 24 by 80 (canonical) or 32 by 80 (Model 3)."
    ],
    avoidWhen: [
      "5250, DOS, BBS or modern tools: use the default presentation or your own token set; Forma ships no profile for them.",
      "Screens that must follow the application's light or dark theme: the profile always draws a black screen.",
      "Adding behavior such as autoskip or uppercase input: that is application code, not a profile."
    ],
    characteristics: [
      "Profiles may change palette, border and shadow color, caret treatment and focus background only (Visual Engineering rule B-8).",
      "All profile colors pass WCAG AA contrast on the black screen.",
      "The block caret (`caret-shape: block`) is progressive enhancement layered on the standard focus outline, which is never removed.",
      "Forced colors replace the palette while boundaries, focus and severity shapes remain."
    ]
  },
  examples: [
    {
      id: "host-error",
      title: "Host error with input inhibited",
      description: "The host did not respond. The error message uses `role=\"alert\"` and reverse video, the Operator Information Area on row 11 shows X SYSTEM, and only Reset is enabled until the application unlocks input.",
      html: `<ef-character-grid-3270 class="ef-component-tag">
  <div class="ef-character-grid" data-ef-profile="ibm-3270" data-ef-rows="10" data-ef-status-rows="1" data-ef-columns="80" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-3270-host-error-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <span class="ef-character-grid__text" data-ef-row="1" data-ef-col="2" data-ef-len="4">BTXR</span>
        <h2 class="ef-character-grid__text" id="character-grid-3270-host-error-title" data-ef-row="1" data-ef-col="32" data-ef-len="18" data-ef-emphasis="intensified">BATCH TRANSFER RUN</h2>
        <span class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="16">Batch<span class="ef-character-grid__leader" aria-hidden="true"> . . . . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="3" data-ef-col="20" data-ef-len="11">BT-20260930</span>
        <span class="ef-character-grid__text" data-ef-row="4" data-ef-col="2" data-ef-len="16">Records<span class="ef-character-grid__leader" aria-hidden="true">  . . . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="4" data-ef-col="20" data-ef-len="6" data-ef-align="end">1,204</span>
        <p class="ef-character-grid__message" role="alert" data-ef-severity="error" data-ef-row="8" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__severity"><span>ERROR</span></span> BTX009E Transfer service did not respond. Press Reset, then Enter.</p>
        <div class="ef-character-grid__group" role="group" aria-label="Function keys">
          <button class="ef-character-grid__key" type="submit" name="action" value="enter" disabled data-ef-action="enter" data-ef-row="10" data-ef-col="2" data-ef-len="11"><kbd>Enter</kbd>=Retry</button>
          <button class="ef-character-grid__key" type="button" data-ef-action="reset" data-ef-row="10" data-ef-col="15" data-ef-len="12"><kbd>Reset</kbd>=Unlock</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="pf3" formnovalidate disabled data-ef-action="pf3" data-ef-row="10" data-ef-col="29" data-ef-len="8"><kbd>PF3</kbd>=Exit</button>
        </div>
        <p class="ef-character-grid__status" role="status" data-ef-row="11" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__indicator" data-ef-state="inhibited"><span>X SYSTEM</span></span>  Input inhibited</p>
      </form>
    </div>
  </div>
</ef-character-grid-3270>`
    },
    {
      id: "field-states",
      title: "Field states in the 3279 palette",
      description: "Required, invalid and disabled fields in green on black. The state cues are the same shapes as the default presentation (double underline, dashed rules, dotted underline); focused fields add a block caret and a dark green focus background.",
      html: `<ef-character-grid-3270 class="ef-component-tag">
  <div class="ef-character-grid" data-ef-profile="ibm-3270" data-ef-rows="9" data-ef-status-rows="1" data-ef-columns="80" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-3270-field-states-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <span class="ef-character-grid__text" data-ef-row="1" data-ef-col="2" data-ef-len="4">ACCM</span>
        <h2 class="ef-character-grid__text" id="character-grid-3270-field-states-title" data-ef-row="1" data-ef-col="31" data-ef-len="19" data-ef-emphasis="intensified">ACCOUNT MAINTENANCE</h2>
        <label class="ef-character-grid__label" for="character-grid-3270-field-states-account" data-ef-row="3" data-ef-col="2" data-ef-len="16">Account<span class="ef-character-grid__leader" aria-hidden="true"> . . . :</span></label>
        <input class="ef-character-grid__field" id="character-grid-3270-field-states-account" name="account" type="text" maxlength="13" required value="00417-2231-09" autocomplete="off" data-ef-row="3" data-ef-col="20" data-ef-len="13">
        <label class="ef-character-grid__label" for="character-grid-3270-field-states-limit" data-ef-row="4" data-ef-col="2" data-ef-len="16">Credit limit<span class="ef-character-grid__leader" aria-hidden="true">  :</span></label>
        <input class="ef-character-grid__field" id="character-grid-3270-field-states-limit" name="limit" type="text" inputmode="decimal" maxlength="12" value="5,000.0O" aria-invalid="true" aria-describedby="character-grid-3270-field-states-message" autocomplete="off" data-ef-row="4" data-ef-col="20" data-ef-len="12">
        <label class="ef-character-grid__label" for="character-grid-3270-field-states-branch" data-ef-row="5" data-ef-col="2" data-ef-len="16">Branch<span class="ef-character-grid__leader" aria-hidden="true">  . . . :</span></label>
        <input class="ef-character-grid__field" id="character-grid-3270-field-states-branch" name="branch" type="text" maxlength="8" value="NORTH" disabled data-ef-row="5" data-ef-col="20" data-ef-len="8">
        <p class="ef-character-grid__message" id="character-grid-3270-field-states-message" role="alert" data-ef-severity="validation" data-ef-row="8" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__severity"><span>CHECK</span></span> ACCM012E Credit limit must contain digits only, e.g. 5000.00</p>
        <div class="ef-character-grid__group" role="group" aria-label="Function keys">
          <button class="ef-character-grid__key" type="submit" name="action" value="enter" data-ef-action="enter" data-ef-row="9" data-ef-col="2" data-ef-len="12"><kbd>Enter</kbd>=Update</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="pf12" formnovalidate data-ef-action="pf12" data-ef-row="9" data-ef-col="16" data-ef-len="11"><kbd>PF12</kbd>=Cancel</button>
        </div>
        <p class="ef-character-grid__status" role="status" data-ef-row="10" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__indicator"><span>READY</span></span></p>
      </form>
    </div>
  </div>
</ef-character-grid-3270>`
    },
    {
      id: "without-profile",
      title: "Same screen without the profile",
      description: "The host-error screen with `data-ef-profile` removed. Every run stays on the same cell; only tokens change, so it follows the application's light or dark theme. This is how a profile is verified to be presentation-only.",
      html: `<ef-character-grid-3270 class="ef-component-tag">
  <div class="ef-character-grid" data-ef-rows="10" data-ef-status-rows="1" data-ef-columns="80" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-3270-without-profile-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <span class="ef-character-grid__text" data-ef-row="1" data-ef-col="2" data-ef-len="4">BTXR</span>
        <h2 class="ef-character-grid__text" id="character-grid-3270-without-profile-title" data-ef-row="1" data-ef-col="32" data-ef-len="18" data-ef-emphasis="intensified">BATCH TRANSFER RUN</h2>
        <span class="ef-character-grid__text" data-ef-row="3" data-ef-col="2" data-ef-len="16">Batch<span class="ef-character-grid__leader" aria-hidden="true"> . . . . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="3" data-ef-col="20" data-ef-len="11">BT-20260930</span>
        <span class="ef-character-grid__text" data-ef-row="4" data-ef-col="2" data-ef-len="16">Records<span class="ef-character-grid__leader" aria-hidden="true">  . . . :</span></span>
        <span class="ef-character-grid__value" data-ef-row="4" data-ef-col="20" data-ef-len="6" data-ef-align="end">1,204</span>
        <p class="ef-character-grid__message" role="alert" data-ef-severity="error" data-ef-row="8" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__severity"><span>ERROR</span></span> BTX009E Transfer service did not respond. Press Reset, then Enter.</p>
        <div class="ef-character-grid__group" role="group" aria-label="Function keys">
          <button class="ef-character-grid__key" type="submit" name="action" value="enter" disabled data-ef-action="enter" data-ef-row="10" data-ef-col="2" data-ef-len="11"><kbd>Enter</kbd>=Retry</button>
          <button class="ef-character-grid__key" type="button" data-ef-action="reset" data-ef-row="10" data-ef-col="15" data-ef-len="12"><kbd>Reset</kbd>=Unlock</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="pf3" formnovalidate disabled data-ef-action="pf3" data-ef-row="10" data-ef-col="29" data-ef-len="8"><kbd>PF3</kbd>=Exit</button>
        </div>
        <p class="ef-character-grid__status" role="status" data-ef-row="11" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__indicator" data-ef-state="inhibited"><span>X SYSTEM</span></span>  Input inhibited</p>
      </form>
    </div>
  </div>
</ef-character-grid-3270>`
    },
    {
      id: "menu-mobile",
      title: "3270 menu on a phone",
      description: "An 80-column menu at phone width. The profile does not change containment: the black screen scrolls inside its viewport and the page stays still.",
      mobile: {
        height: 440,
        notes: [
          "An 80-column 3270 screen is wider than any phone in portrait, so the viewport scrolls horizontally inside its border; the page never does.",
          "The option field and keys sit near column 2, so they are visible without scrolling; keep the most used runs at the start of each row.",
          "Rows grow to 44px at the touch pitch and the short option field extends into the blank cells after it.",
          "Landscape shows more of each row; positions never change."
        ]
      },
      html: `<ef-character-grid-3270 class="ef-component-tag">
  <div class="ef-character-grid" data-ef-profile="ibm-3270" data-ef-rows="9" data-ef-status-rows="1" data-ef-columns="80" data-ef-narrow="contained">
    <div class="ef-character-grid__viewport" role="region" aria-labelledby="character-grid-3270-menu-mobile-title" tabindex="0">
      <form class="ef-character-grid__surface">
        <span class="ef-character-grid__text" data-ef-row="1" data-ef-col="2" data-ef-len="4">RPTM</span>
        <h2 class="ef-character-grid__text" id="character-grid-3270-menu-mobile-title" data-ef-row="1" data-ef-col="34" data-ef-len="12" data-ef-emphasis="intensified">REPORTS MENU</h2>
        <dl class="ef-character-grid__group" aria-label="Options">
          <dt class="ef-character-grid__value" data-ef-row="3" data-ef-col="6" data-ef-len="1">1</dt>
          <dd class="ef-character-grid__text" data-ef-row="3" data-ef-col="10" data-ef-len="15">Daily balances</dd>
          <dt class="ef-character-grid__value" data-ef-row="4" data-ef-col="6" data-ef-len="1">2</dt>
          <dd class="ef-character-grid__text" data-ef-row="4" data-ef-col="10" data-ef-len="18">Overdue accounts</dd>
        </dl>
        <label class="ef-character-grid__label" for="character-grid-3270-menu-mobile-option" data-ef-row="6" data-ef-col="2" data-ef-len="11">Option<span class="ef-character-grid__leader" aria-hidden="true"> ===&gt;</span></label>
        <input class="ef-character-grid__field" id="character-grid-3270-menu-mobile-option" name="option" type="text" maxlength="1" required aria-describedby="character-grid-3270-menu-mobile-hint" autocomplete="off" data-ef-row="6" data-ef-col="15" data-ef-len="1">
        <span class="ef-character-grid__text" id="character-grid-3270-menu-mobile-hint" data-ef-row="6" data-ef-col="20" data-ef-len="10" data-ef-emphasis="muted">(1 or 2)</span>
        <div class="ef-character-grid__group" role="group" aria-label="Function keys">
          <button class="ef-character-grid__key" type="submit" name="action" value="enter" data-ef-action="enter" data-ef-row="9" data-ef-col="2" data-ef-len="12"><kbd>Enter</kbd>=Select</button>
          <button class="ef-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-ef-action="pf3" data-ef-row="9" data-ef-col="16" data-ef-len="8"><kbd>PF3</kbd>=Exit</button>
        </div>
        <p class="ef-character-grid__status" role="status" data-ef-row="10" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__indicator"><span>READY</span></span></p>
      </form>
    </div>
  </div>
</ef-character-grid-3270>`
    }
  ],
  api: {
    attributes: [],
    hooks: {
      "data-ef-profile": "`ibm-3270` on `.ef-character-grid` applies the profile. Remove it to get Forma's default presentation with identical geometry.",
      "data-ef-status-rows": "Use `1` to model the Operator Information Area after the application rows (row 25 on a 24 by 80 screen, row 33 on 32 by 80). The profile rules a muted line over it.",
      "data-ef-rows": "24 (canonical) or 32 (Model 3) are the verified geometries; 43 by 80 and 27 by 132 are supported but not separately exercised.",
      "--ef-grid-background": "Profile value `#000000`.",
      "--ef-grid-foreground": "Profile value `#7aa7ff` (protected blue).",
      "--ef-grid-protected": "Profile value `#7aa7ff`.",
      "--ef-grid-emphasis": "Profile value `#f2f2f2` (intensified white) for values, titles and key names.",
      "--ef-grid-muted": "Profile value `#9fb8e8`.",
      "--ef-grid-field": "Profile value `#5ee08f` (unprotected green).",
      "--ef-grid-field-surface": "Profile value `#0b1f12`.",
      "--ef-grid-boundary": "Profile value `#5ee08f`.",
      "--ef-grid-focus": "Profile value `#4fe3d6`; also the block caret color.",
      "--ef-grid-information": "Profile value `#f2f2f2`.",
      "--ef-grid-success": "Profile value `#5ee08f`.",
      "--ef-grid-warning": "Profile value `#ffe066`.",
      "--ef-grid-validation": "Profile value `#ff9ad5`.",
      "--ef-grid-error": "Profile value `#ff7a7a`."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Native, in row-major order. The profile does not add 3270 wraparound Tab or autoskip; those are optional application behavior." },
      { keys: "PF1-PF24, PA1-PA3, Clear, Reset", action: "Presented as key buttons; mapping physical keys to them is application or Limen behavior." }
    ],
    events: [],
    form: "Unchanged from [[character-grid]]: the surface is a native form and keys are native submitters."
  },
  states: [
    { name: "Profiled", how: "data-ef-profile=\"ibm-3270\"", description: "3279-style palette on a black screen with a darker viewport border and inset line." },
    { name: "Field focus", how: ":focus-visible on a field", description: "Standard outline plus a dark green field background and a block caret where `caret-shape` is supported." },
    { name: "Key focus", how: ":focus-visible on a key", description: "Standard outline plus a dark blue key background." },
    { name: "Device status row", how: "data-ef-status-rows on the grid", description: "A muted rule over the status row; the row is still a `role=\"status\"` run with an indicator word." },
    { name: "Forced colors", how: "forced-colors: active", description: "Every profile token is projected to Canvas, CanvasText or Highlight, so no 3279 color survives on the forced Canvas; boundaries, focus and severity shapes remain." }
  ],
  accessibility: {
    forma: [
      "Every profile color passes axe's WCAG AA color-contrast rule on the black screen.",
      "The profile never removes the focus outline; the block caret and focus backgrounds are added cues.",
      "Severity words and shape cues are unchanged, so meaning never depends on the 3279 colors.",
      "The status-row rule is stylistic and never the only cue."
    ],
    consumer: [
      "Do not reproduce 3270 behaviors (uppercase, autoskip) silently; if you add them, implement and document them in the application.",
      "Keep the device status row for system status only and use a visible indicator word.",
      "Verify your screens with the conformance tool at the geometry you ship (24 by 80 or 32 by 80)."
    ]
  },
  responsive: [
    "Identical to the default grid: 80 columns are kept and the viewport scrolls horizontally on narrow screens.",
    "The touch pitch and short-field touch minimum apply unchanged under the profile.",
    "For 32 by 80 set `data-ef-rows=\"32\"`, move reserved application rows to 29-32 and the status to row 33; nothing else changes."
  ],
  motion: [
    "No animation is added by the profile. SequentialReveal works the same with or without it and is removed under reduced motion (see [[character-grid-reveal]])."
  ],
  guidance: {
    do: [
      "Treat the profile as a skin: author the screen against the default presentation, then add the attribute.",
      "Keep the 3270 key vocabulary (PF keys, Clear, Reset) with the profile."
    ],
    avoid: [
      "Overriding profile tokens with lower-contrast colors.",
      "Claiming 3270 emulation; the profile is a visual evocation only."
    ]
  },
  related: [
    { slug: "character-grid", note: "The primitive the profile skins; owns every data-ef-* hook." },
    { slug: "character-grid-workflow", note: "Three linked 3270 screens built with this profile." },
    { slug: "character-grid-status", note: "Messages and the Operator Information Area status row." }
  ]
};
