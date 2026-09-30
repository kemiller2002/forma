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
  html: `<div class="ef-stack">
  <h1>Settings</h1>

  <section class="ef-stack" aria-labelledby="settings-profile-title">
    <h2 id="settings-profile-title">Profile</h2>
    <ef-text-field class="ef-component-tag">
      <div class="ef-field">
        <label class="ef-field__label" for="settings-display-name">Display name</label>
        <span class="ef-field__description" id="settings-display-name-description">Shown to people in your organization.</span>
        <input id="settings-display-name" name="display-name" type="text" autocomplete="name" value="Ada Okafor" aria-describedby="settings-display-name-description">
      </div>
    </ef-text-field>
    <ef-select class="ef-component-tag">
      <label class="ef-select-field">
        <span class="ef-field__label">Language</span>
        <span class="ef-select">
          <select class="ef-select__input" name="language">
            <option value="en-GB">English (United Kingdom)</option>
            <option value="fr-FR">Français (France)</option>
            <option value="de-DE">Deutsch (Deutschland)</option>
          </select>
          <span class="ef-select__indicator" aria-hidden="true"></span>
        </span>
      </label>
    </ef-select>
    <ef-button class="ef-component-tag">
      <div class="ef-actions">
        <button type="submit">Save profile</button>
      </div>
    </ef-button>
  </section>

  <ef-switch class="ef-component-tag">
    <fieldset class="ef-stack">
      <legend>Notifications</legend>
      <label class="ef-switch">
        <input class="ef-switch__input" type="checkbox" role="switch" name="push" value="on" checked>
        <span class="ef-switch__track" aria-hidden="true"></span>
        <span class="ef-switch__text"><span class="ef-switch__label">Push notifications</span></span>
      </label>
      <label class="ef-switch">
        <input class="ef-switch__input" type="checkbox" role="switch" name="quiet-hours" value="on" aria-describedby="settings-quiet-description">
        <span class="ef-switch__track" aria-hidden="true"></span>
        <span class="ef-switch__text">
          <span class="ef-switch__label">Quiet hours</span>
          <span class="ef-switch__description" id="settings-quiet-description">Silence everything except direct mentions between 22:00 and 07:00.</span>
        </span>
      </label>
    </fieldset>
  </ef-switch>

  <ef-checkbox class="ef-component-tag">
    <label class="ef-checkbox">
      <input class="ef-checkbox__input" type="checkbox" name="include-archived" value="yes">
      <span class="ef-checkbox__box" aria-hidden="true"></span>
      <span class="ef-checkbox__text"><span class="ef-checkbox__label">Include archived projects in search results</span></span>
    </label>
  </ef-checkbox>

  <ef-disclosure class="ef-component-tag">
    <details class="ef-disclosure">
      <summary>Advanced</summary>
      <div class="ef-disclosure__content">
        <label class="ef-switch">
          <input class="ef-switch__input" type="checkbox" role="switch" name="diagnostics" value="on">
          <span class="ef-switch__track" aria-hidden="true"></span>
          <span class="ef-switch__text"><span class="ef-switch__label">Send diagnostic logs</span></span>
        </label>
      </div>
    </details>
  </ef-disclosure>

  <ef-surface class="ef-component-tag">
    <nav class="ef-surface" aria-label="More settings">
      <ul class="ef-stack">
        <li><a href="#settings-privacy">Privacy and data</a></li>
        <li><a href="#settings-devices">Signed-in devices</a></li>
        <li><a href="#settings-billing">Billing</a></li>
      </ul>
    </nav>
  </ef-surface>

  <ef-button class="ef-component-tag">
    <div class="ef-actions">
      <button type="button">Sign out</button>
    </div>
  </ef-button>
</div>`
};
