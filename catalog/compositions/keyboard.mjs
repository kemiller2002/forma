export default {
  title: "Keyboard and focus",
  description: "A settings workspace you can operate entirely from the keyboard. Every interaction here is native: Tab moves between controls, arrow keys move within a radio group, Enter and Space open disclosures, and modal surfaces trap and restore focus. Use it to check focus visibility and order.",
  notes: [
    "Tab order follows source order: segmented control, disclosure, command palette button, then actions. Nothing uses positive tabindex.",
    "Inside the [[segmented-control]] a single Tab stop holds the group; Arrow keys change the selection (native radio behavior).",
    "The [[disclosure]] summary toggles with Enter or Space.",
    "The [[command-palette]] opens as a modal dialog: focus moves inside, Escape closes it and focus returns to the opening button. Filtering and arrow-key movement between commands are application (Limen) behavior and are not simulated here.",
    "Every focusable element shows the same two-tone focus ring, visible on light and dark surfaces and in forced colors."
  ],
  html: `<div class="ef-stack">
  <ef-segmented-control class="ef-component-tag">
    <fieldset class="ef-field">
      <legend class="ef-field__label">Density</legend>
      <div class="ef-segmented">
        <label class="ef-segment"><input type="radio" name="keyboard-density" value="comfortable" checked><span>Comfortable</span></label>
        <label class="ef-segment"><input type="radio" name="keyboard-density" value="compact"><span>Compact</span></label>
        <label class="ef-segment"><input type="radio" name="keyboard-density" value="dense"><span>Dense</span></label>
      </div>
    </fieldset>
  </ef-segmented-control>

  <ef-disclosure class="ef-component-tag">
    <details class="ef-disclosure">
      <summary>Keyboard shortcuts</summary>
      <div class="ef-disclosure__content">
        <dl class="ef-key-value-list">
          <div><dt><kbd>Ctrl</kbd> + <kbd>K</kbd></dt><dd>Open the command palette (application shortcut)</dd></div>
          <div><dt><kbd>Esc</kbd></dt><dd>Close the open dialog or popover</dd></div>
        </dl>
      </div>
    </details>
  </ef-disclosure>

  <ef-command-palette class="ef-component-tag">
    <button type="button" commandfor="keyboard-palette" command="show-modal">Open command palette</button>
    <dialog class="ef-command-palette" id="keyboard-palette" aria-labelledby="keyboard-palette-title">
      <header class="ef-command-palette__header">
        <h3 id="keyboard-palette-title">Commands</h3>
        <kbd>Esc</kbd>
      </header>
      <label class="ef-visually-hidden" for="keyboard-palette-search">Find a command</label>
      <input id="keyboard-palette-search" type="search" placeholder="Type a command">
      <div class="ef-command-palette__group">
        <h4>Suggested</h4>
        <button type="button"><span>Create project</span></button>
        <button type="button"><span>Invite teammate</span></button>
        <button type="button" disabled><span>Publish report</span><small>Unavailable until validation passes</small></button>
      </div>
    </dialog>
  </ef-command-palette>

  <ef-button class="ef-component-tag">
    <div class="ef-actions">
      <button type="submit">Save preferences</button>
      <a class="ef-button" href="#keyboard-help">Keyboard help</a>
    </div>
  </ef-button>
</div>`
};
