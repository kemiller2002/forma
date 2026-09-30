export default {
  title: "Overlay interaction",
  description: "Every layered surface Forma offers, opened with native invokers and no script: a modal confirmation dialog, a right-edge flyout, an action menu, a popover and a tooltip. Try them with the keyboard: focus moves into modal surfaces, Escape closes them, and focus returns to the button that opened them.",
  notes: [
    "[[dialog]] and [[flyout]] use the native `dialog` element with `commandfor`/`command=\"show-modal\"`: the browser makes the page inert, traps focus, closes on Escape and restores focus.",
    "[[menu]], [[popover]] and [[tooltip]] use the Popover API: light dismiss, Escape to close, and top-layer rendering so they are never clipped by containers.",
    "Heavier surfaces (dialog, flyout) use the heavy motion weight; lighter cues (menu, popover, tooltip) use light. Weight is presentation only.",
    "Browsers without invoker commands support show the buttons but cannot open the dialogs; applications that need wider support add a small Limen behavior."
  ],
  html: `<div class="ef-stack">
  <ef-dialog class="ef-component-tag">
    <button type="button" commandfor="overlay-delete-dialog" command="show-modal">Delete project…</button>
    <dialog class="ef-dialog" id="overlay-delete-dialog" aria-labelledby="overlay-delete-title" aria-describedby="overlay-delete-description">
      <div class="ef-dialog__body">
        <h2 id="overlay-delete-title">Delete “Atlas migration”?</h2>
        <p id="overlay-delete-description">The project and its 14 runbooks are removed for everyone. This cannot be undone.</p>
      </div>
      <div class="ef-dialog__actions">
        <button type="button" commandfor="overlay-delete-dialog" command="close">Keep project</button>
        <button type="button" commandfor="overlay-delete-dialog" command="close">Delete project</button>
      </div>
    </dialog>
  </ef-dialog>

  <ef-flyout class="ef-component-tag">
    <button type="button" commandfor="overlay-details" command="show-modal">Show incident details</button>
    <dialog class="ef-flyout" id="overlay-details" data-ef-side="right" aria-labelledby="overlay-details-title">
      <div class="ef-flyout__surface">
        <header class="ef-flyout__header">
          <div><p class="ef-component-kicker">Incident</p><h2 id="overlay-details-title">INC-2291</h2></div>
          <button class="ef-flyout__close" type="button" commandfor="overlay-details" command="close" aria-label="Close incident details">Close</button>
        </header>
        <div class="ef-flyout__body">
          <dl class="ef-key-value-list">
            <div><dt>Status</dt><dd>Investigating</dd></div>
            <div><dt>Commander</dt><dd>Lin Park</dd></div>
          </dl>
        </div>
      </div>
    </dialog>
  </ef-flyout>

  <ef-menu class="ef-component-tag">
    <button type="button" popovertarget="overlay-menu">Project actions</button>
    <div class="ef-menu" id="overlay-menu" popover>
      <ul class="ef-menu__list">
        <li><button type="button">Rename</button></li>
        <li><button type="button">Duplicate</button></li>
        <li><button type="button">Archive</button></li>
      </ul>
    </div>
  </ef-menu>

  <ef-popover class="ef-component-tag">
    <button type="button" popovertarget="overlay-share">Share</button>
    <div class="ef-popover" id="overlay-share" popover>
      <strong>Share link</strong>
      <p>Anyone in your organization with the link can view this project.</p>
      <button type="button" popovertarget="overlay-share" popovertargetaction="hide">Done</button>
    </div>
  </ef-popover>

  <ef-tooltip class="ef-component-tag">
    <p class="ef-tooltip-context">
      Retention: 30 days
      <span class="ef-tooltip">
        <button class="ef-tooltip__trigger" type="button" popovertarget="overlay-retention" interestfor="overlay-retention">
          <span aria-hidden="true">?</span>
          <span class="ef-visually-hidden">About retention</span>
        </button>
        <span class="ef-tooltip__surface" id="overlay-retention" popover>Logs older than 30 days are deleted nightly.</span>
      </span>
    </p>
  </ef-tooltip>
</div>`
};
