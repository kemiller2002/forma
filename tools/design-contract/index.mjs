const FORMAT = "forma.design";
const VERSION = "1.0.0";
const MODES = new Set(["standard", "extended", "custom"]);
const FORM_LAYOUTS = new Set(["stack", "grid"]);
const CONTROL_KINDS = new Set(["text", "email", "tel", "url", "number", "date", "time", "datetime-local", "textarea", "select", "checkbox", "radio-group", "toggle"]);
const ACTION_BINDINGS = new Map([["form.submit", "submit"], ["form.reset", "reset"]]);

const diagnostic = (code, path, message) => ({ code, path, message });
const isObject = value => value !== null && typeof value === "object" && !Array.isArray(value);
const text = value => typeof value === "string" && value.trim().length > 0;
const array = value => Array.isArray(value) ? value : [];
const idPattern = /^[a-z][a-z0-9-]*$/;

const walkObjects = function* (value, path = "$") {
  if (!isObject(value) && !Array.isArray(value)) return;
  yield [value, path];
  if (Array.isArray(value)) {
    for (const [index, child] of value.entries()) yield* walkObjects(child, `${path}[${index}]`);
  } else {
    for (const [key, child] of Object.entries(value)) yield* walkObjects(child, `${path}.${key}`);
  }
};

export const validateDesignContract = document => {
  const findings = [];
  if (!isObject(document)) return [diagnostic("DBC_DOCUMENT_TYPE", "$", "design contract must be a JSON object")];
  const rejectUnknown = (value, path, allowed) => {
    if (!isObject(value)) return;
    for (const key of Object.keys(value)) {
      if (!allowed.has(key)) findings.push(diagnostic("DBC_UNKNOWN_MEMBER", `${path}.${key}`, `unknown member ${JSON.stringify(key)}`));
    }
  };
  rejectUnknown(document, "$", new Set(["$schema", "format", "schemaVersion", "id", "mode", "customReason", "validationEvidence", "compatibility", "responsive", "motion", "extensions", "root"]));
  if (document.format !== FORMAT) findings.push(diagnostic("DBC_FORMAT", "$.format", `expected ${FORMAT}`));
  if (document.schemaVersion !== VERSION) findings.push(diagnostic("DBC_VERSION_UNSUPPORTED", "$.schemaVersion", `unsupported contract version ${JSON.stringify(document.schemaVersion)}; migrate explicitly to ${VERSION}`));
  if (!text(document.id)) findings.push(diagnostic("DBC_ID_REQUIRED", "$.id", "document id is required"));
  if (!MODES.has(document.mode)) findings.push(diagnostic("DBC_MODE", "$.mode", "mode must be standard, extended, or custom"));
  if (!text(document.compatibility?.forma)) findings.push(diagnostic("DBC_COMPATIBILITY", "$.compatibility.forma", "a Forma compatibility range is required"));
  rejectUnknown(document.compatibility, "$.compatibility", new Set(["forma"]));
  rejectUnknown(document.responsive, "$.responsive", new Set(["strategy", "narrow", "minimumViewportCssPx"]));
  rejectUnknown(document.motion, "$.motion", new Set(["profile", "reducedMotion"]));

  if (document.mode === "standard") {
    for (const [value, path] of walkObjects(document)) {
      if (isObject(value) && Object.hasOwn(value, "overrides")) findings.push(diagnostic("DBC_STANDARD_OVERRIDE", `${path}.overrides`, "standard mode does not permit presentation overrides; use documented semantics or an audited extension mode"));
    }
    if (document.extensions !== undefined) findings.push(diagnostic("DBC_STANDARD_EXTENSION", "$.extensions", "standard mode does not permit extensions"));
  }
  if (document.mode === "extended") {
    for (const key of Object.keys(document.extensions ?? {})) {
      if (!/^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/.test(key)) findings.push(diagnostic("DBC_EXTENSION_NAMESPACE", `$.extensions.${key}`, "extended data keys must be namespaced as owner:name"));
    }
  }
  if (document.mode === "custom") {
    if (!text(document.customReason)) findings.push(diagnostic("DBC_CUSTOM_REASON", "$.customReason", "custom mode requires a non-empty reason"));
    if (!array(document.validationEvidence).length || !array(document.validationEvidence).every(text)) findings.push(diagnostic("DBC_CUSTOM_EVIDENCE", "$.validationEvidence", "custom mode requires one or more validation evidence references"));
  }

  if (document.responsive?.strategy !== "container" || document.responsive?.narrow !== "stack" || !Number.isInteger(document.responsive?.minimumViewportCssPx) || document.responsive.minimumViewportCssPx > 320) {
    findings.push(diagnostic("DBC_RESPONSIVE_CONTRACT", "$.responsive", "standard form output must use container adaptation, stack when narrow, and support at least 320 CSS px"));
  }
  if (document.motion?.reducedMotion !== "preserve-state") findings.push(diagnostic("DBC_REDUCED_MOTION", "$.motion.reducedMotion", "reduced motion must preserve the same semantic state"));

  const root = document.root;
  if (!isObject(root) || root.kind !== "form") {
    findings.push(diagnostic("DBC_ROOT_FORM", "$.root", "the 1.0 contract root must be a form"));
    return findings;
  }
  rejectUnknown(root, "$.root", new Set(["kind", "id", "title", "method", "action", "children"]));
  if (!text(root.id) || !text(root.title)) findings.push(diagnostic("DBC_FORM_IDENTITY", "$.root", "form id and title are required"));
  if (!new Set(["get", "post"]).has(root.method)) findings.push(diagnostic("DBC_FORM_METHOD", "$.root.method", "form method must be get or post"));
  if (!/^#[a-z][a-z0-9-]*$/.test(root.action ?? "")) findings.push(diagnostic("DBC_FORM_ACTION", "$.root.action", "form action must target addressable feedback with a #fragment"));

  const ids = new Map();
  const claimId = (id, path) => {
    if (!text(id)) return findings.push(diagnostic("DBC_NODE_ID", path, "every node needs an id"));
    if (!idPattern.test(id)) findings.push(diagnostic("DBC_NODE_ID_FORMAT", path, "id must be lowercase kebab-case"));
    if (ids.has(id)) findings.push(diagnostic("DBC_DUPLICATE_ID", path, `id ${JSON.stringify(id)} duplicates ${ids.get(id)}`));
    else ids.set(id, path);
  };
  claimId(root.id, "$.root.id");

  const children = array(root.children);
  if (!children.length) findings.push(diagnostic("DBC_FORM_CHILDREN", "$.root.children", "form needs a field layout and action group"));
  const actionGroups = [];
  const feedback = [];
  const layouts = [];
  let fieldCount = 0;
  for (const [index, child] of children.entries()) {
    const path = `$.root.children[${index}]`;
    if (!isObject(child) || !new Set(["layout", "actions", "feedback"]).has(child.kind)) {
      findings.push(diagnostic("DBC_FORM_CHILD", path, "form children must be layout, actions, or feedback nodes"));
      continue;
    }
    claimId(child.id, `${path}.id`);
    if (child.kind === "layout") {
      layouts.push(child);
      rejectUnknown(child, path, new Set(["kind", "id", "model", "alignControls", "overflow", "density", "children"]));
      if (!FORM_LAYOUTS.has(child.model)) findings.push(diagnostic("DBC_LAYOUT_MODEL", `${path}.model`, "form layout must be stack or grid"));
      if (document.mode === "standard" && child.model === "grid" && child.alignControls !== true) findings.push(diagnostic("DBC_STANDARD_ALIGNMENT", `${path}.alignControls`, "standard grid fields must opt into shared control alignment"));
      if (document.mode === "standard" && child.overflow !== "wrap") findings.push(diagnostic("DBC_STANDARD_OVERFLOW", `${path}.overflow`, "standard form layouts wrap; bounded scrolling is reserved for irreducibly comparative data"));
      for (const [fieldIndex, field] of array(child.children).entries()) {
        const fieldPath = `${path}.children[${fieldIndex}]`;
        if (!isObject(field) || field.kind !== "field") {
          findings.push(diagnostic("DBC_LAYOUT_CHILD", fieldPath, "form layouts may contain only field nodes"));
          continue;
        }
        fieldCount += 1;
        rejectUnknown(field, fieldPath, new Set(["kind", "id", "name", "label", "description", "control", "validation"]));
        claimId(field.id, `${fieldPath}.id`);
        if (!text(field.name)) findings.push(diagnostic("DBC_FIELD_NAME", `${fieldPath}.name`, "field name is required for native submission"));
        if (!text(field.label)) findings.push(diagnostic("DBC_FIELD_LABEL", `${fieldPath}.label`, "field needs a visible programmatic label"));
        rejectUnknown(field.control, `${fieldPath}.control`, new Set(["kind", "value", "checked", "required", "readonly", "disabled", "autocomplete", "inputmode", "rows", "options"]));
        if (!CONTROL_KINDS.has(field.control?.kind)) findings.push(diagnostic("DBC_CONTROL_KIND", `${fieldPath}.control.kind`, "control kind is not supported by the 1.0 form renderer"));
        if (new Set(["select", "radio-group"]).has(field.control?.kind) && !array(field.control?.options).length) findings.push(diagnostic("DBC_CONTROL_OPTIONS", `${fieldPath}.control.options`, `${field.control.kind} needs at least one option`));
        for (const [optionIndex, option] of array(field.control?.options).entries()) rejectUnknown(option, `${fieldPath}.control.options[${optionIndex}]`, new Set(["value", "label", "selected", "disabled"]));
        rejectUnknown(field.validation, `${fieldPath}.validation`, new Set(["kind", "message"]));
        if (field.validation?.kind === "email" && field.control?.kind !== "email") findings.push(diagnostic("DBC_EMAIL_CONTROL", `${fieldPath}.validation.kind`, "email validation requires a native email control"));
        if (field.validation && !text(field.validation.message)) findings.push(diagnostic("DBC_VALIDATION_MESSAGE", `${fieldPath}.validation.message`, "validation needs actionable message text"));
      }
    } else if (child.kind === "actions") {
      actionGroups.push(child);
      rejectUnknown(child, path, new Set(["kind", "id", "children"]));
      for (const [actionIndex, action] of array(child.children).entries()) {
        const actionPath = `${path}.children[${actionIndex}]`;
        if (!isObject(action) || action.kind !== "action") {
          findings.push(diagnostic("DBC_ACTIONS_CHILD", actionPath, "action groups may contain only action nodes"));
          continue;
        }
        rejectUnknown(action, actionPath, new Set(["kind", "id", "label", "type", "binding"]));
        claimId(action.id, `${actionPath}.id`);
        if (!text(action.label)) findings.push(diagnostic("DBC_ACTION_LABEL", `${actionPath}.label`, "action needs an accessible visible label"));
        if (!ACTION_BINDINGS.has(action.binding)) findings.push(diagnostic("DBC_ACTION_BINDING", `${actionPath}.binding`, "action must bind to a supported meaningful command"));
        else if (ACTION_BINDINGS.get(action.binding) !== action.type) findings.push(diagnostic("DBC_ACTION_TYPE", `${actionPath}.type`, `${action.binding} must render as type=${ACTION_BINDINGS.get(action.binding)}`));
      }
    } else {
      feedback.push(child);
      rejectUnknown(child, path, new Set(["kind", "id", "label", "message"]));
      if (!text(child.label) || !text(child.message)) findings.push(diagnostic("DBC_FEEDBACK_TEXT", path, "feedback needs an accessible label and message"));
    }
  }
  if (!layouts.length || !fieldCount) findings.push(diagnostic("DBC_FIELDS_REQUIRED", "$.root.children", "form needs at least one field layout containing a field"));
  if (actionGroups.length !== 1) findings.push(diagnostic("DBC_ACTION_GROUP", "$.root.children", "form needs exactly one action group"));
  const actions = actionGroups.flatMap(group => array(group.children));
  if (!actions.some(action => action.binding === "form.submit")) findings.push(diagnostic("DBC_SUBMIT_REQUIRED", "$.root.children", "form needs a bound submit action"));
  const target = root.action?.slice(1);
  if (!feedback.some(item => item.id === target)) findings.push(diagnostic("DBC_FEEDBACK_TARGET", "$.root.action", "form action fragment must identify a feedback node"));
  return findings;
};

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const attrs = entries => entries.filter(([, value]) => value !== undefined && value !== false && value !== null)
  .map(([name, value]) => value === true ? name : `${name}="${escapeHtml(value)}"`).join(" ");
const indent = (value, spaces = 2) => value.split("\n").map(line => `${" ".repeat(spaces)}${line}`).join("\n");

const fieldDescriptionIds = field => [field.description && `${field.id}-description`, field.validation && `${field.id}-error`].filter(Boolean).join(" ");
const inputAttributes = field => attrs([
  ["id", field.id], ["name", field.name], ["required", field.control.required], ["readonly", field.control.readonly], ["disabled", field.control.disabled],
  ["autocomplete", field.control.autocomplete], ["inputmode", field.control.inputmode], ["value", field.control.value], ["aria-describedby", fieldDescriptionIds(field) || undefined]
]);
const requiredLabel = field => `${field.label}${field.control.required && !/\brequired\b/i.test(field.label) ? " (required)" : ""}`;

const renderNativeControl = field => {
  const kind = field.control.kind;
  if (kind === "textarea") return `<textarea ${inputAttributes(field)} rows="${field.control.rows ?? 4}">${escapeHtml(field.control.value ?? "")}</textarea>`;
  if (kind === "select") return `<span class="ef-select"><select class="ef-select__input" ${inputAttributes(field)}>${array(field.control.options).map(option => `<option ${attrs([["value", option.value], ["selected", option.selected], ["disabled", option.disabled]])}>${escapeHtml(option.label)}</option>`).join("")}</select><span class="ef-select__indicator" aria-hidden="true"></span></span>`;
  return `<input ${attrs([["type", kind], ["id", field.id], ["name", field.name], ["required", field.control.required], ["readonly", field.control.readonly], ["disabled", field.control.disabled], ["autocomplete", field.control.autocomplete], ["inputmode", field.control.inputmode], ["value", field.control.value], ["aria-describedby", fieldDescriptionIds(field) || undefined]])}>`;
};

const renderField = field => {
  const description = field.description ? `<span class="ef-field__description" id="${escapeHtml(field.id)}-description">${escapeHtml(field.description)}</span>\n` : "";
  const validation = field.validation ? `\n<p class="ef-validation-message ef-validation-message--when-invalid" id="${escapeHtml(field.id)}-error"><span class="ef-validation-message__mark" aria-hidden="true">!</span>${escapeHtml(field.validation.message)}</p>` : "";
  if (field.control.kind === "checkbox" || field.control.kind === "toggle") {
    const root = field.control.kind === "toggle" ? "switch" : "checkbox";
    const role = field.control.kind === "toggle" ? " role=\"switch\"" : "";
    const visual = field.control.kind === "toggle" ? "track" : "box";
    return `<div class="ef-field">${description}<label class="ef-${root}"><input class="ef-${root}__input" type="checkbox"${role} ${attrs([["id", field.id], ["name", field.name], ["value", field.control.value ?? "on"], ["checked", field.control.checked], ["required", field.control.required], ["disabled", field.control.disabled], ["aria-describedby", fieldDescriptionIds(field) || undefined]])}><span class="ef-${root}__${visual}" aria-hidden="true"></span><span class="ef-${root}__text"><span class="ef-${root}__label">${escapeHtml(requiredLabel(field))}</span></span></label>${validation}</div>`;
  }
  if (field.control.kind === "radio-group") {
    return `<div class="ef-field">${description}<fieldset class="ef-choice-group"${fieldDescriptionIds(field) ? ` aria-describedby="${escapeHtml(fieldDescriptionIds(field))}"` : ""}><legend class="ef-choice-group__legend">${escapeHtml(requiredLabel(field))}</legend>${array(field.control.options).map(option => `<label class="ef-choice"><input type="radio" ${attrs([["name", field.name], ["value", option.value], ["checked", option.selected], ["disabled", option.disabled], ["required", field.control.required]])}><span class="ef-choice__content"><strong>${escapeHtml(option.label)}</strong></span></label>`).join("")}</fieldset>${validation}</div>`;
  }
  return `<div class="ef-field">\n<label class="ef-field__label" for="${escapeHtml(field.id)}">${escapeHtml(requiredLabel(field))}</label>\n${description}${renderNativeControl(field)}${validation}\n</div>`;
};

const renderLayout = layout => `<div class="${layout.model === "grid" ? "ef-form-row" : "ef-stack"}" data-ef-form-layout="${layout.model}">\n${array(layout.children).map(renderField).map(value => indent(value)).join("\n")}\n</div>`;
const renderActions = group => `<div class="ef-actions">${array(group.children).map(action => `<button type="${action.type}">${escapeHtml(action.label)}</button>`).join("")}</div>`;
const renderFeedback = item => `<p class="ef-form__outcome" id="${escapeHtml(item.id)}" role="status" aria-label="${escapeHtml(item.label)}">${escapeHtml(item.message)}</p>`;

export const renderDesignContract = document => {
  const findings = validateDesignContract(document);
  if (findings.length) {
    const error = new Error(findings.map(item => `${item.code} ${item.path}: ${item.message}`).join("\n"));
    error.findings = findings;
    throw error;
  }
  const root = document.root;
  const heading = `${root.id}-title`;
  const children = root.children.map(child => child.kind === "layout" ? renderLayout(child) : child.kind === "actions" ? renderActions(child) : renderFeedback(child));
  return `<form class="ef-form" id="${escapeHtml(root.id)}" method="${root.method}" action="${escapeHtml(root.action)}" aria-labelledby="${heading}">\n<h2 id="${heading}">${escapeHtml(root.title)}</h2>\n${children.join("\n")}\n</form>\n`;
};

export const DESIGN_CONTRACT = Object.freeze({ format: FORMAT, version: VERSION });
