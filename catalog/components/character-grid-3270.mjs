export default {
  name: "Character grid 3270 profile",
  category: "keyboard",
  behavior: "Application / Limen",
  summary: "IBM 3270-inspired reference profile built only from public CharacterGrid contracts: a 24x80 operations menu with 3279-style palette tokens and block caret, verified at 32x80.",
  purpose: {
    description: "The 3270 profile is the first reference presentation for [[character-grid]]. Adding `data-forma-profile=\"ibm-3270\"` to a grid swaps presentation tokens only: black screen, protected text in blue, intensified text and values in white, unprotected fields in green, severity colors, a block caret on fields and a rule over the device status row. Geometry, placement, order and semantics are unchanged, and the same markup renders in Forma's default presentation without the attribute. It is a stylistic evocation of the 3279 palette, not an emulation: no data stream, attribute bytes, autoskip, wraparound Tab or uppercase transformation is reproduced.",
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
  basicInteraction: { kind: "static", reasons: ["application-behavior", "form-handling"] },
  examples: [
    {
      id: "host-error",
      interaction: { kind: "static", reasons: ["application-behavior"] },
      title: "Host error with input inhibited",
      description: "The host did not respond. The error message uses `role=\"alert\"` and reverse video, the Operator Information Area on row 11 shows X SYSTEM, and only Reset is enabled until the application unlocks input.",
      html: `<forma-character-grid-3270 class="forma-component-tag">
  <div class="forma-character-grid" data-forma-profile="ibm-3270" data-forma-rows="10" data-forma-status-rows="1" data-forma-columns="80" data-forma-narrow="contained">
    <div class="forma-character-grid__viewport" role="region" aria-labelledby="character-grid-3270-host-error-title" tabindex="0">
      <form class="forma-character-grid__surface">
        <span class="forma-character-grid__text" data-forma-row="1" data-forma-col="2" data-forma-len="4">BTXR</span>
        <h2 class="forma-character-grid__text" id="character-grid-3270-host-error-title" data-forma-row="1" data-forma-col="32" data-forma-len="18" data-forma-emphasis="intensified">BATCH TRANSFER RUN</h2>
        <span class="forma-character-grid__text" data-forma-row="3" data-forma-col="2" data-forma-len="16">Batch<span class="forma-character-grid__leader" aria-hidden="true"> . . . . :</span></span>
        <span class="forma-character-grid__value" data-forma-row="3" data-forma-col="20" data-forma-len="11">BT-20260930</span>
        <span class="forma-character-grid__text" data-forma-row="4" data-forma-col="2" data-forma-len="16">Records<span class="forma-character-grid__leader" aria-hidden="true">  . . . :</span></span>
        <span class="forma-character-grid__value" data-forma-row="4" data-forma-col="20" data-forma-len="6" data-forma-align="end">1,204</span>
        <p class="forma-character-grid__message" role="alert" data-forma-severity="error" data-forma-row="8" data-forma-col="2" data-forma-len="78"><span class="forma-character-grid__severity"><span>ERROR</span></span> BTX009E Transfer service did not respond. Press Reset, then Enter.</p>
        <div class="forma-character-grid__group" role="group" aria-label="Function keys">
          <button class="forma-character-grid__key" type="submit" name="action" value="enter" disabled data-forma-action="enter" data-forma-row="10" data-forma-col="2" data-forma-len="11"><kbd>Enter</kbd>=Retry</button>
          <button class="forma-character-grid__key" type="button" data-forma-action="reset" data-forma-row="10" data-forma-col="15" data-forma-len="12"><kbd>Reset</kbd>=Unlock</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="pf3" formnovalidate disabled data-forma-action="pf3" data-forma-row="10" data-forma-col="29" data-forma-len="8"><kbd>PF3</kbd>=Exit</button>
        </div>
        <p class="forma-character-grid__status" role="status" data-forma-row="11" data-forma-col="2" data-forma-len="78"><span class="forma-character-grid__indicator" data-forma-state="inhibited"><span>X SYSTEM</span></span>  Input inhibited</p>
      </form>
    </div>
  </div>
</forma-character-grid-3270>`
    },
    {
      id: "field-states",
      interaction: { kind: "static", reasons: ["form-handling"] },
      title: "Field states in the 3279 palette",
      description: "Required, invalid and disabled fields in green on black. The state cues are the same shapes as the default presentation (double underline, dashed rules, dotted underline); focused fields add a block caret and a dark green focus background.",
      html: `<forma-character-grid-3270 class="forma-component-tag">
  <div class="forma-character-grid" data-forma-profile="ibm-3270" data-forma-rows="9" data-forma-status-rows="1" data-forma-columns="80" data-forma-narrow="contained">
    <div class="forma-character-grid__viewport" role="region" aria-labelledby="character-grid-3270-field-states-title" tabindex="0">
      <form class="forma-character-grid__surface">
        <span class="forma-character-grid__text" data-forma-row="1" data-forma-col="2" data-forma-len="4">ACCM</span>
        <h2 class="forma-character-grid__text" id="character-grid-3270-field-states-title" data-forma-row="1" data-forma-col="31" data-forma-len="19" data-forma-emphasis="intensified">ACCOUNT MAINTENANCE</h2>
        <label class="forma-character-grid__label" for="character-grid-3270-field-states-account" data-forma-row="3" data-forma-col="2" data-forma-len="16">Account<span class="forma-character-grid__leader" aria-hidden="true"> . . . :</span></label>
        <input class="forma-character-grid__field" id="character-grid-3270-field-states-account" name="account" type="text" maxlength="13" required value="00417-2231-09" autocomplete="off" data-forma-row="3" data-forma-col="20" data-forma-len="13">
        <label class="forma-character-grid__label" for="character-grid-3270-field-states-limit" data-forma-row="4" data-forma-col="2" data-forma-len="16">Credit limit<span class="forma-character-grid__leader" aria-hidden="true">  :</span></label>
        <input class="forma-character-grid__field" id="character-grid-3270-field-states-limit" name="limit" type="text" inputmode="decimal" maxlength="12" value="5,000.0O" aria-invalid="true" aria-describedby="character-grid-3270-field-states-message" autocomplete="off" data-forma-row="4" data-forma-col="20" data-forma-len="12">
        <label class="forma-character-grid__label" for="character-grid-3270-field-states-branch" data-forma-row="5" data-forma-col="2" data-forma-len="16">Branch<span class="forma-character-grid__leader" aria-hidden="true">  . . . :</span></label>
        <input class="forma-character-grid__field" id="character-grid-3270-field-states-branch" name="branch" type="text" maxlength="8" value="NORTH" disabled data-forma-row="5" data-forma-col="20" data-forma-len="8">
        <p class="forma-character-grid__message" id="character-grid-3270-field-states-message" role="alert" data-forma-severity="validation" data-forma-row="8" data-forma-col="2" data-forma-len="78"><span class="forma-character-grid__severity"><span>CHECK</span></span> ACCM012E Credit limit must contain digits only, e.g. 5000.00</p>
        <div class="forma-character-grid__group" role="group" aria-label="Function keys">
          <button class="forma-character-grid__key" type="submit" name="action" value="enter" data-forma-action="enter" data-forma-row="9" data-forma-col="2" data-forma-len="12"><kbd>Enter</kbd>=Update</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="pf12" formnovalidate data-forma-action="pf12" data-forma-row="9" data-forma-col="16" data-forma-len="11"><kbd>PF12</kbd>=Cancel</button>
        </div>
        <p class="forma-character-grid__status" role="status" data-forma-row="10" data-forma-col="2" data-forma-len="78"><span class="forma-character-grid__indicator"><span>READY</span></span></p>
      </form>
    </div>
  </div>
</forma-character-grid-3270>`
    },
    {
      id: "without-profile",
      interaction: { kind: "static", reasons: ["application-behavior"] },
      title: "Same screen without the profile",
      description: "The host-error screen with `data-forma-profile` removed. Every run stays on the same cell; only tokens change, so it follows the application's light or dark theme. This is how a profile is verified to be presentation-only.",
      html: `<forma-character-grid-3270 class="forma-component-tag">
  <div class="forma-character-grid" data-forma-rows="10" data-forma-status-rows="1" data-forma-columns="80" data-forma-narrow="contained">
    <div class="forma-character-grid__viewport" role="region" aria-labelledby="character-grid-3270-without-profile-title" tabindex="0">
      <form class="forma-character-grid__surface">
        <span class="forma-character-grid__text" data-forma-row="1" data-forma-col="2" data-forma-len="4">BTXR</span>
        <h2 class="forma-character-grid__text" id="character-grid-3270-without-profile-title" data-forma-row="1" data-forma-col="32" data-forma-len="18" data-forma-emphasis="intensified">BATCH TRANSFER RUN</h2>
        <span class="forma-character-grid__text" data-forma-row="3" data-forma-col="2" data-forma-len="16">Batch<span class="forma-character-grid__leader" aria-hidden="true"> . . . . :</span></span>
        <span class="forma-character-grid__value" data-forma-row="3" data-forma-col="20" data-forma-len="11">BT-20260930</span>
        <span class="forma-character-grid__text" data-forma-row="4" data-forma-col="2" data-forma-len="16">Records<span class="forma-character-grid__leader" aria-hidden="true">  . . . :</span></span>
        <span class="forma-character-grid__value" data-forma-row="4" data-forma-col="20" data-forma-len="6" data-forma-align="end">1,204</span>
        <p class="forma-character-grid__message" role="alert" data-forma-severity="error" data-forma-row="8" data-forma-col="2" data-forma-len="78"><span class="forma-character-grid__severity"><span>ERROR</span></span> BTX009E Transfer service did not respond. Press Reset, then Enter.</p>
        <div class="forma-character-grid__group" role="group" aria-label="Function keys">
          <button class="forma-character-grid__key" type="submit" name="action" value="enter" disabled data-forma-action="enter" data-forma-row="10" data-forma-col="2" data-forma-len="11"><kbd>Enter</kbd>=Retry</button>
          <button class="forma-character-grid__key" type="button" data-forma-action="reset" data-forma-row="10" data-forma-col="15" data-forma-len="12"><kbd>Reset</kbd>=Unlock</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="pf3" formnovalidate disabled data-forma-action="pf3" data-forma-row="10" data-forma-col="29" data-forma-len="8"><kbd>PF3</kbd>=Exit</button>
        </div>
        <p class="forma-character-grid__status" role="status" data-forma-row="11" data-forma-col="2" data-forma-len="78"><span class="forma-character-grid__indicator" data-forma-state="inhibited"><span>X SYSTEM</span></span>  Input inhibited</p>
      </form>
    </div>
  </div>
</forma-character-grid-3270>`
    },
    {
      id: "menu-mobile",
      interaction: { kind: "static", reasons: ["form-handling"] },
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
      html: `<forma-character-grid-3270 class="forma-component-tag">
  <div class="forma-character-grid" data-forma-profile="ibm-3270" data-forma-rows="9" data-forma-status-rows="1" data-forma-columns="80" data-forma-narrow="contained">
    <div class="forma-character-grid__viewport" role="region" aria-labelledby="character-grid-3270-menu-mobile-title" tabindex="0">
      <form class="forma-character-grid__surface">
        <span class="forma-character-grid__text" data-forma-row="1" data-forma-col="2" data-forma-len="4">RPTM</span>
        <h2 class="forma-character-grid__text" id="character-grid-3270-menu-mobile-title" data-forma-row="1" data-forma-col="34" data-forma-len="12" data-forma-emphasis="intensified">REPORTS MENU</h2>
        <dl class="forma-character-grid__group" aria-label="Options">
          <dt class="forma-character-grid__value" data-forma-row="3" data-forma-col="6" data-forma-len="1">1</dt>
          <dd class="forma-character-grid__text" data-forma-row="3" data-forma-col="10" data-forma-len="15">Daily balances</dd>
          <dt class="forma-character-grid__value" data-forma-row="4" data-forma-col="6" data-forma-len="1">2</dt>
          <dd class="forma-character-grid__text" data-forma-row="4" data-forma-col="10" data-forma-len="18">Overdue accounts</dd>
        </dl>
        <label class="forma-character-grid__label" for="character-grid-3270-menu-mobile-option" data-forma-row="6" data-forma-col="2" data-forma-len="11">Option<span class="forma-character-grid__leader" aria-hidden="true"> ===&gt;</span></label>
        <input class="forma-character-grid__field" id="character-grid-3270-menu-mobile-option" name="option" type="text" maxlength="1" required aria-describedby="character-grid-3270-menu-mobile-hint" autocomplete="off" data-forma-row="6" data-forma-col="15" data-forma-len="1">
        <span class="forma-character-grid__text" id="character-grid-3270-menu-mobile-hint" data-forma-row="6" data-forma-col="20" data-forma-len="10" data-forma-emphasis="muted">(1 or 2)</span>
        <div class="forma-character-grid__group" role="group" aria-label="Function keys">
          <button class="forma-character-grid__key" type="submit" name="action" value="enter" data-forma-action="enter" data-forma-row="9" data-forma-col="2" data-forma-len="12"><kbd>Enter</kbd>=Select</button>
          <button class="forma-character-grid__key" type="submit" name="action" value="pf3" formnovalidate data-forma-action="pf3" data-forma-row="9" data-forma-col="16" data-forma-len="8"><kbd>PF3</kbd>=Exit</button>
        </div>
        <p class="forma-character-grid__status" role="status" data-forma-row="10" data-forma-col="2" data-forma-len="78"><span class="forma-character-grid__indicator"><span>READY</span></span></p>
      </form>
    </div>
  </div>
</forma-character-grid-3270>`
    }
  ],
  api: {
    attributes: [],
    hooks: {
      "data-forma-profile": "`ibm-3270` on `.forma-character-grid` applies the profile. Remove it to get Forma's default presentation with identical geometry.",
      "data-forma-status-rows": "Use `1` to model the Operator Information Area after the application rows (row 25 on a 24 by 80 screen, row 33 on 32 by 80). The profile rules a muted line over it.",
      "data-forma-rows": "24 (canonical) or 32 (Model 3) are the verified geometries; 43 by 80 and 27 by 132 are supported but not separately exercised.",
      "--forma-grid-background": "Profile value `#000000`.",
      "--forma-grid-foreground": "Profile value `#7aa7ff` (protected blue).",
      "--forma-grid-protected": "Profile value `#7aa7ff`.",
      "--forma-grid-emphasis": "Profile value `#f2f2f2` (intensified white) for values, titles and key names.",
      "--forma-grid-muted": "Profile value `#9fb8e8`.",
      "--forma-grid-field": "Profile value `#5ee08f` (unprotected green).",
      "--forma-grid-field-surface": "Profile value `#0b1f12`.",
      "--forma-grid-boundary": "Profile value `#5ee08f`.",
      "--forma-grid-focus": "Profile value `#4fe3d6`; also the block caret color.",
      "--forma-grid-information": "Profile value `#f2f2f2`.",
      "--forma-grid-success": "Profile value `#5ee08f`.",
      "--forma-grid-warning": "Profile value `#ffe066`.",
      "--forma-grid-validation": "Profile value `#ff9ad5`.",
      "--forma-grid-error": "Profile value `#ff7a7a`."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Native, in row-major order. The profile does not add 3270 wraparound Tab or autoskip; those are optional application behavior." },
      { keys: "PF1-PF24, PA1-PA3, Clear, Reset", action: "Presented as key buttons; mapping physical keys to them is application or Limen behavior." }
    ],
    events: [],
    form: "Unchanged from [[character-grid]]: the surface is a native form and keys are native submitters."
  },
  states: [
    { name: "Profiled", how: "data-forma-profile=\"ibm-3270\"", description: "3279-style palette on a black screen with a darker viewport border and inset line." },
    { name: "Field focus", how: ":focus-visible on a field", description: "Standard outline plus a dark green field background and a block caret where `caret-shape` is supported." },
    { name: "Key focus", how: ":focus-visible on a key", description: "Standard outline plus a dark blue key background." },
    { name: "Device status row", how: "data-forma-status-rows on the grid", description: "A muted rule over the status row; the row is still a `role=\"status\"` run with an indicator word." },
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
    "For 32 by 80 set `data-forma-rows=\"32\"`, move reserved application rows to 29-32 and the status to row 33; nothing else changes."
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
    { slug: "character-grid", note: "The primitive the profile skins; owns every data-forma-* hook." },
    { slug: "character-grid-workflow", note: "Three linked 3270 screens built with this profile." },
    { slug: "character-grid-status", note: "Messages and the Operator Information Area status row." }
  ]
};
