export default {
  title: "Form with validation",
  description: "A request form after a failed submit: a focusable validation summary links to each problem, field-level messages repeat the problem next to the control with a non-color mark, and valid fields keep their values.",
  notes: [
    "The [[validation-summary]] uses role=alert and links to the invalid fields by id; the application moves focus to it after a failed submit.",
    "Each invalid input carries aria-invalid=\"true\" and aria-describedby pointing at its [[validation-message]], so the reason is announced with the field.",
    "Forma does not restyle invalid text inputs; the message and its \"!\" mark carry the state without color. This is recorded as a catalog gap.",
    "Native `required`, `min` and `maxlength` still apply; Forma adds no validation logic."
  ],
  html: `<form class="forma-stack" action="#form-validation" aria-labelledby="request-form-title" novalidate>
  <h2 id="request-form-title">Request production access</h2>

  <forma-validation-summary class="forma-component-tag">
    <div class="forma-validation-summary" role="alert" tabindex="-1" aria-labelledby="request-errors-title">
      <div class="forma-validation-summary__icon" aria-hidden="true">!</div>
      <div>
        <h3 class="forma-validation-summary__title" id="request-errors-title">There are 2 problems with this request</h3>
        <ul class="forma-validation-summary__list">
          <li><a href="#request-reason">Enter a reason for access.</a></li>
          <li><a href="#request-start">Choose a start date on or after today.</a></li>
        </ul>
      </div>
    </div>
  </forma-validation-summary>

  <forma-text-field class="forma-component-tag">
    <div class="forma-field">
      <label class="forma-field__label" for="request-email">Work email</label>
      <input id="request-email" name="email" type="email" autocomplete="email" value="ada@example.com" required>
    </div>
  </forma-text-field>

  <forma-select class="forma-component-tag">
    <label class="forma-select-field">
      <span class="forma-field__label">Environment</span>
      <span class="forma-select">
        <select class="forma-select__input" name="environment">
          <option value="prod-eu">Production · Europe</option>
          <option value="prod-us">Production · United States</option>
        </select>
        <span class="forma-select__indicator" aria-hidden="true"></span>
      </span>
    </label>
  </forma-select>

  <forma-choice-group class="forma-component-tag">
    <fieldset class="forma-choice-group">
      <legend class="forma-choice-group__legend">Access level</legend>
      <label class="forma-choice">
        <input type="radio" name="request-level" value="read" checked>
        <span class="forma-choice__content"><strong>Read only</strong><span>View logs and dashboards.</span></span>
      </label>
      <label class="forma-choice">
        <input type="radio" name="request-level" value="operate">
        <span class="forma-choice__content"><strong>Operate</strong><span>Restart services and run approved runbooks.</span></span>
      </label>
    </fieldset>
  </forma-choice-group>

  <forma-date-time-field class="forma-component-tag">
    <div class="forma-field">
      <label class="forma-field__label" for="request-start">Start date</label>
      <input id="request-start" name="start" type="date" min="2026-10-01" value="2026-09-12" aria-invalid="true" aria-describedby="request-start-error" required>
      <forma-validation-message class="forma-component-tag">
        <p class="forma-validation-message" id="request-start-error">
          <span class="forma-validation-message__mark" aria-hidden="true">!</span>
          Choose a start date on or after 1 October 2026.
        </p>
      </forma-validation-message>
    </div>
  </forma-date-time-field>

  <forma-textarea class="forma-component-tag">
    <div class="forma-field">
      <label class="forma-field__label" for="request-reason">Reason for access</label>
      <textarea id="request-reason" name="reason" rows="3" maxlength="400" aria-invalid="true" aria-describedby="request-reason-error" required></textarea>
      <forma-validation-message class="forma-component-tag">
        <p class="forma-validation-message" id="request-reason-error">
          <span class="forma-validation-message__mark" aria-hidden="true">!</span>
          Enter a reason for access.
        </p>
      </forma-validation-message>
    </div>
  </forma-textarea>

  <forma-checkbox class="forma-component-tag">
    <label class="forma-checkbox">
      <input class="forma-checkbox__input" type="checkbox" name="policy" value="accepted" checked required>
      <span class="forma-checkbox__box" aria-hidden="true"></span>
      <span class="forma-checkbox__text"><span class="forma-checkbox__label">I have read the production access policy</span></span>
    </label>
  </forma-checkbox>

  <forma-button class="forma-component-tag">
    <div class="forma-actions">
      <button type="submit">Submit request</button>
      <button type="reset">Clear form</button>
    </div>
  </forma-button>
</form>`
};
