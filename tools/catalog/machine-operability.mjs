const has = (markup, expression) => expression.test(markup ?? "");

const ids = markup =>
  new Set([...String(markup ?? "").matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]));

const refs = (markup, attribute) =>
  [...String(markup ?? "").matchAll(new RegExp(`\\b${attribute}=["']([^"']+)["']`, "g"))]
    .flatMap(match => match[1].split(/\s+/).filter(Boolean));

const hashTargets = markup =>
  [...String(markup ?? "").matchAll(/\bhref=["']#([^"']+)["']/g)].map(match => match[1]);

const brokenReferences = markup => {
  const known = ids(markup);
  const references = [
    ...refs(markup, "aria-controls"),
    ...refs(markup, "aria-labelledby"),
    ...refs(markup, "aria-describedby"),
    ...refs(markup, "commandfor"),
    ...refs(markup, "popovertarget")
  ];
  return [...new Set(references.filter(reference => !known.has(reference)))];
};

const nativeInteractive = /<(?:button|input|select|textarea|details|summary|dialog|a)\b|\bpopover\b|\btabindex=["']0["']|\brole=["'](?:tab|separator|button|switch|slider|menuitem)["']/i;
const forbidden = [
  [/<canvas\b/i, "opaque canvas"],
  [/\bdraggable=["']true["']/i, "native drag-only surface"],
  [/\bon(?:click|pointerdown|pointerup|pointermove|mousedown|mouseup|mousemove|touchstart|touchmove|touchend)=/i, "inline pointer/event handler"]
];

const directManipulation = markup =>
  has(markup, /data-ef-manipulation|data-ef-resizable|class=["'][^"']*(?:reorder|spatial-canvas|resizable-split-pane)/i);

const semanticAlternative = (slug, markup) => {
  if (slug === "reorder-states" || slug === "ranking") {
    return has(markup, /aria-label=["']Move [^"']+ (?:up|down)["']/i);
  }
  if (slug === "resizable-split-pane") {
    return has(markup, /role=["']separator["']/i)
      && has(markup, /tabindex=["']0["']/i)
      && has(markup, /aria-valuenow=/i);
  }
  if (slug === "spatial-canvas") {
    const known = ids(markup);
    const targets = hashTargets(markup);
    return has(markup, /<details\b/i)
      && targets.length > 0
      && targets.every(target => known.has(target));
  }
  return true;
};

const roleNameIdentity = markup =>
  has(markup, nativeInteractive)
    ? ["semantic-role-and-accessible-name", "native-id-name-value-or-target"]
    : ["semantic-document-structure"];

const actionKinds = markup => {
  const actions = [];
  if (has(markup, /<button\b/i)) actions.push("button-activation");
  if (has(markup, /<a\b[^>]*href=/i)) actions.push("link-navigation");
  if (has(markup, /<(?:input|select|textarea)\b/i)) actions.push("native-form-control");
  if (has(markup, /<details\b/i)) actions.push("native-disclosure");
  if (has(markup, /<dialog\b|command=["']show-modal["']/i)) actions.push("native-dialog");
  if (has(markup, /\bpopover\b|popovertarget=/i)) actions.push("native-popover");
  if (has(markup, /role=["']tab["']/i)) actions.push("tab-selection");
  if (has(markup, /role=["']separator["']/i)) actions.push("separator-adjustment");
  if (directManipulation(markup)) actions.push("direct-manipulation-plus-semantic-equivalent");
  return actions.length ? actions : ["inspect"];
};

const stateKinds = markup => {
  const state = [];
  if (has(markup, /\baria-(?:selected|checked|pressed|expanded|valuenow|current)=/i)) state.push("aria-state");
  if (has(markup, /\b(?:checked|disabled|open|hidden|value)=?/i)) state.push("native-state");
  if (has(markup, /aria-live=["']/i)) state.push("live-status");
  if (has(markup, /data-ef-(?:state|status|rank|drop|manipulation)=/i)) state.push("documented-presentation-state");
  return state.length ? [...new Set(state)] : ["semantic-content"];
};

const completionKinds = (markup, actions) => {
  const completion = [];
  if (actions.includes("link-navigation")) completion.push("url-or-target-change");
  if (actions.includes("native-form-control")) completion.push("native-control-state");
  if (actions.includes("native-disclosure") || actions.includes("native-dialog") || actions.includes("native-popover")) completion.push("native-open-state");
  if (has(markup, /aria-live=["']/i)) completion.push("live-status");
  if (has(markup, /\baria-(?:selected|checked|pressed|expanded|valuenow)=/i)) completion.push("aria-state-change");
  if (directManipulation(markup)) completion.push("authoritative-application-rerender");
  return completion.length ? [...new Set(completion)] : ["semantic-dom-observation"];
};

export const deriveMachineContract = (component, pattern) => {
  const markup = String(pattern ?? "");
  const interactive = has(markup, nativeInteractive);
  const applicationOwned = /Application|Limen/i.test(component.behavior ?? "");
  const direct = directManipulation(markup);
  const broken = brokenReferences(markup);
  const forbiddenFindings = forbidden.filter(([expression]) => expression.test(markup)).map(([, label]) => label);
  const hasAlternative = !direct || semanticAlternative(component.slug, markup);
  const actions = actionKinds(markup);

  let status = "pass";
  const reasons = [];
  if (forbiddenFindings.length) {
    status = "needs-retrofit";
    reasons.push(...forbiddenFindings.map(label => `forbidden public path: ${label}`));
  }
  if (broken.length) {
    status = "needs-retrofit";
    reasons.push(`broken semantic target(s): ${broken.join(", ")}`);
  }
  if (!hasAlternative) {
    status = "needs-retrofit";
    reasons.push("direct manipulation has no detected semantic non-coordinate equivalent");
  }
  if (status === "pass" && interactive && applicationOwned) {
    status = "needs-test";
    reasons.push("application-owned interaction needs executable parity evidence");
  }

  const baseline = {
    interaction: interactive ? (applicationOwned ? "application" : "native") : "static",
    identity: roleNameIdentity(markup),
    actions,
    state: stateKinds(markup),
    completion: completionKinds(markup, actions),
    directManipulation: direct,
    semanticAlternative: hasAlternative,
    status,
    reasons
  };

  return Object.freeze({ ...baseline, ...(component.machine ?? {}) });
};

export const auditMachineContract = component => {
  const machine = component.machine;
  const problems = [];
  if (!machine || typeof machine !== "object") problems.push("machine metadata missing");
  if (!["static", "native", "application"].includes(machine?.interaction)) problems.push("machine.interaction must be static, native, or application");
  for (const field of ["identity", "actions", "state", "completion"]) {
    if (!Array.isArray(machine?.[field]) || machine[field].length === 0) problems.push(`machine.${field} must be a non-empty array`);
  }
  if (!["pass", "needs-test", "needs-retrofit"].includes(machine?.status)) problems.push("machine.status is invalid");
  if (machine?.directManipulation && machine?.semanticAlternative !== true) problems.push("direct manipulation requires a semantic alternative");
  return problems;
};
