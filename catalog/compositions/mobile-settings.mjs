export default {
  title: "Mobile settings",
  description: "A phone settings screen assembled only from existing Forma components: a text field, switches, a select, a checkbox, a native disclosure, navigation links and grouped buttons. It shows that independently designed controls share one rhythm, one target size and one focus treatment.",
  mobile: { height: 760 },
  notes: [
    "Every control row is at least 44px tall and the whole label toggles its input, so the screen is comfortable with a thumb.",
    "Switches apply immediately; the text field is the only value that needs the explicit Save profile action.",
    "Long labels wrap in their own column; nothing scrolls sideways at 320px.",
    "Forma has no dedicated settings-row component: the \"More settings\" rows are ordinary links in a list inside a [[surface]]. This is recorded as a catalog gap rather than invented here.",
    "Source order is reading order and focus order; nothing is reordered with CSS."
  ],
  html: `<div class="forma-stack">
  <h1>Settings</h1>

  <section class="forma-stack" aria-labelledby="settings-profile-title">
    <h2 id="settings-profile-title">Profile</h2>
    <forma-text-field class="forma-component-tag">
      <div class="forma-field">
        <label class="forma-field__label" for="settings-display-name">Display name</label>
        <span class="forma-field__description" id="settings-display-name-description">Shown to people in your organization.</span>
        <input id="settings-display-name" name="display-name" type="text" autocomplete="name" value="Ada Okafor" aria-describedby="settings-display-name-description">
      </div>
    </forma-text-field>
    <forma-select class="forma-component-tag">
      <label class="forma-select-field">
        <span class="forma-field__label">Language</span>
        <span class="forma-select">
          <select class="forma-select__input" name="language">
            <option value="en-GB">English (United Kingdom)</option>
            <option value="fr-FR">Français (France)</option>
            <option value="de-DE">Deutsch (Deutschland)</option>
          </select>
          <span class="forma-select__indicator" aria-hidden="true"></span>
        </span>
      </label>
    </forma-select>
    <forma-button class="forma-component-tag">
      <div class="forma-actions">
        <button type="submit">Save profile</button>
      </div>
    </forma-button>
  </section>

  <forma-switch class="forma-component-tag">
    <fieldset class="forma-stack">
      <legend>Notifications</legend>
      <label class="forma-switch">
        <input class="forma-switch__input" type="checkbox" role="switch" name="push" value="on" checked>
        <span class="forma-switch__track" aria-hidden="true"></span>
        <span class="forma-switch__text"><span class="forma-switch__label">Push notifications</span></span>
      </label>
      <label class="forma-switch">
        <input class="forma-switch__input" type="checkbox" role="switch" name="quiet-hours" value="on" aria-describedby="settings-quiet-description">
        <span class="forma-switch__track" aria-hidden="true"></span>
        <span class="forma-switch__text">
          <span class="forma-switch__label">Quiet hours</span>
          <span class="forma-switch__description" id="settings-quiet-description">Silence everything except direct mentions between 22:00 and 07:00.</span>
        </span>
      </label>
    </fieldset>
  </forma-switch>

  <forma-checkbox class="forma-component-tag">
    <label class="forma-checkbox">
      <input class="forma-checkbox__input" type="checkbox" name="include-archived" value="yes">
      <span class="forma-checkbox__box" aria-hidden="true"></span>
      <span class="forma-checkbox__text"><span class="forma-checkbox__label">Include archived projects in search results</span></span>
    </label>
  </forma-checkbox>

  <forma-disclosure class="forma-component-tag">
    <details class="forma-disclosure">
      <summary>Advanced</summary>
      <div class="forma-disclosure__content">
        <label class="forma-switch">
          <input class="forma-switch__input" type="checkbox" role="switch" name="diagnostics" value="on">
          <span class="forma-switch__track" aria-hidden="true"></span>
          <span class="forma-switch__text"><span class="forma-switch__label">Send diagnostic logs</span></span>
        </label>
      </div>
    </details>
  </forma-disclosure>

  <forma-surface class="forma-component-tag">
    <nav class="forma-surface" aria-label="More settings">
      <ul class="forma-stack">
        <li><a href="#settings-privacy">Privacy and data</a></li>
        <li><a href="#settings-devices">Signed-in devices</a></li>
        <li><a href="#settings-billing">Billing</a></li>
      </ul>
    </nav>
  </forma-surface>

  <forma-button class="forma-component-tag">
    <div class="forma-actions">
      <button type="button">Sign out</button>
    </div>
  </forma-button>
</div>`
};
