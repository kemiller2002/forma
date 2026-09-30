export default {
  title: "Form with validation",
  description: "A request form after a failed submit: a focusable validation summary links to each problem, field-level messages repeat the problem next to the control with a non-color mark, and valid fields keep their values.",
  notes: [
    "The [[validation-summary]] uses role=alert and links to the invalid fields by id; the application moves focus to it after a failed submit.",
    "Each invalid input carries aria-invalid=\"true\" and aria-describedby pointing at its [[validation-message]], so the reason is announced with the field.",
    "Forma does not restyle invalid text inputs; the message and its \"!\" mark carry the state without color. This is recorded as a catalog gap.",
    "Native `required`, `min` and `maxlength` still apply; Forma adds no validation logic."
  ],
  html: `<form class="ef-stack" action="#form-validation" aria-labelledby="request-form-title" novalidate>
  <h2 id="request-form-title">Request production access</h2>

  <ef-validation-summary class="ef-component-tag">
    <div class="ef-validation-summary" role="alert" tabindex="-1" aria-labelledby="request-errors-title">
      <div class="ef-validation-summary__icon" aria-hidden="true">!</div>
      <div>
        <h3 class="ef-validation-summary__title" id="request-errors-title">There are 2 problems with this request</h3>
        <ul class="ef-validation-summary__list">
          <li><a href="#request-reason">Enter a reason for access.</a></li>
          <li><a href="#request-start">Choose a start date on or after today.</a></li>
        </ul>
      </div>
    </div>
  </ef-validation-summary>

  <ef-text-field class="ef-component-tag">
    <div class="ef-field">
      <label class="ef-field__label" for="request-email">Work email</label>
      <input id="request-email" name="email" type="email" autocomplete="email" value="ada@example.com" required>
    </div>
  </ef-text-field>

  <ef-select class="ef-component-tag">
    <label class="ef-select-field">
      <span class="ef-field__label">Environment</span>
      <span class="ef-select">
        <select class="ef-select__input" name="environment">
          <option value="prod-eu">Production · Europe</option>
          <option value="prod-us">Production · United States</option>
        </select>
        <span class="ef-select__indicator" aria-hidden="true"></span>
      </span>
    </label>
  </ef-select>

  <ef-choice-group class="ef-component-tag">
    <fieldset class="ef-choice-group">
      <legend class="ef-choice-group__legend">Access level</legend>
      <label class="ef-choice">
        <input type="radio" name="request-level" value="read" checked>
        <span class="ef-choice__content"><strong>Read only</strong><span>View logs and dashboards.</span></span>
      </label>
      <label class="ef-choice">
        <input type="radio" name="request-level" value="operate">
        <span class="ef-choice__content"><strong>Operate</strong><span>Restart services and run approved runbooks.</span></span>
      </label>
    </fieldset>
  </ef-choice-group>

  <ef-date-time-field class="ef-component-tag">
    <div class="ef-field">
      <label class="ef-field__label" for="request-start">Start date</label>
      <input id="request-start" name="start" type="date" min="2026-10-01" value="2026-09-12" aria-invalid="true" aria-describedby="request-start-error" required>
      <ef-validation-message class="ef-component-tag">
        <p class="ef-validation-message" id="request-start-error">
          <span class="ef-validation-message__mark" aria-hidden="true">!</span>
          Choose a start date on or after 1 October 2026.
        </p>
      </ef-validation-message>
    </div>
  </ef-date-time-field>

  <ef-textarea class="ef-component-tag">
    <div class="ef-field">
      <label class="ef-field__label" for="request-reason">Reason for access</label>
      <textarea id="request-reason" name="reason" rows="3" maxlength="400" aria-invalid="true" aria-describedby="request-reason-error" required></textarea>
      <ef-validation-message class="ef-component-tag">
        <p class="ef-validation-message" id="request-reason-error">
          <span class="ef-validation-message__mark" aria-hidden="true">!</span>
          Enter a reason for access.
        </p>
      </ef-validation-message>
    </div>
  </ef-textarea>

  <ef-checkbox class="ef-component-tag">
    <label class="ef-checkbox">
      <input class="ef-checkbox__input" type="checkbox" name="policy" value="accepted" checked required>
      <span class="ef-checkbox__box" aria-hidden="true"></span>
      <span class="ef-checkbox__text"><span class="ef-checkbox__label">I have read the production access policy</span></span>
    </label>
  </ef-checkbox>

  <ef-button class="ef-component-tag">
    <div class="ef-actions">
      <button type="submit">Submit request</button>
      <button type="reset">Clear form</button>
    </div>
  </ef-button>
</form>`
};
