// Pure evaluation for visual-engineering/UI-LAYOUT-INTERACTION@1.0.0
// (rule IDs ULI-L01..L13, ULI-A01..A10). No browser, no I/O, no mutation:
// every function maps observations to a report. The browser adapters in
// index.mjs only gather observations. This module cites the contract; it does
// not restate or fork its rules.

export const CONTRACT = Object.freeze({ id: "visual-engineering/UI-LAYOUT-INTERACTION", version: "1.0.0" });

export const STATUS = Object.freeze({
  PASS: "PASS",
  FAIL: "FAIL",
  UNKNOWN: "UNKNOWN"
});

// Widths every surface is tested at (ULI-L09).
export const CONTRACT_WIDTHS = Object.freeze([320, 390, 768, 1280]);

export const DEFAULT_TOLERANCE_CSS_PX = 1;
export const DEFAULT_TIMEOUT_MS = 5000;

const EDGES = Object.freeze({
  top: box => box.y,
  bottom: box => box.y + box.height,
  center: box => box.y + box.height / 2,
  left: box => box.x,
  right: box => box.x + box.width
});

// Roles Playwright cannot address with getByRole. `disclosure` targets a
// native <summary> by its text, because <summary> has no implicit ARIA role.
export const PSEUDO_ROLES = Object.freeze(["disclosure"]);

export const describeTarget = target => {
  if (target === "controlled") return "the element the action controls";
  const { role, name } = target;
  return `${role} "${name instanceof RegExp ? name.source : name}"`;
};

export const requireSemanticTarget = (target, label) => {
  if (!target?.role || target.name === undefined || target.name === "") {
    throw new Error(`${label} must specify both accessible role and name.`);
  }
  return target;
};

export const edgeCoordinate = (box, edge) => {
  const read = EDGES[edge];
  if (!read) throw new Error(`Unsupported alignment edge "${edge}". Use one of: ${Object.keys(EDGES).join(", ")}.`);
  return read(box);
};

// ---------------------------------------------------------------------------
// ULI-L01/L02/L10: declared alignment groups
// ---------------------------------------------------------------------------

// Classify one raw observation of a declared peer. Only a single, rendered,
// non-zero box can contribute a coordinate; everything else is UNKNOWN.
export const classifyPeerObservation = ({ peer, count, box }) => {
  const element = describeTarget(peer);
  if (count === 0) return { element, status: STATUS.UNKNOWN, reason: "element not found in the accessibility tree (missing or hidden)" };
  if (count > 1) return { element, status: STATUS.UNKNOWN, reason: `accessible name is ambiguous (${count} matches)` };
  if (!box) return { element, status: STATUS.UNKNOWN, reason: "no bounding box (not rendered)" };
  if (!(box.width > 0) || !(box.height > 0)) {
    return { element, status: STATUS.UNKNOWN, reason: `zero-size box (${box.width}x${box.height})`, box };
  }
  return { element, status: STATUS.PASS, box };
};

export const validateAlignmentGroup = group => {
  const { ruleId = "ULI-L01", id, peers, edge = "top", toleranceCssPx = DEFAULT_TOLERANCE_CSS_PX, scope } = group ?? {};
  if (!id) throw new Error("A declared alignment group requires an id.");
  if (!Array.isArray(peers) || peers.length < 2) throw new Error(`Alignment group ${id} requires at least two declared peers.`);
  if (!/^ULI-L\d{2}$/.test(ruleId)) throw new Error(`Alignment group ${id} must cite a ULI-L rule ID.`);
  if (!(toleranceCssPx >= 0)) throw new Error(`Alignment group ${id} tolerance must be a non-negative number.`);
  peers.forEach((peer, index) => requireSemanticTarget(peer, `Peer ${index + 1} of ${id}`));
  edgeCoordinate({ x: 0, y: 0, width: 0, height: 0 }, edge);
  return Object.freeze({ ruleId, id, peers, edge, toleranceCssPx, scope });
};

// Decide a declared group's status from observations. Missing evidence is
// UNKNOWN, never PASS; a measured delta above tolerance is FAIL.
export const evaluateAlignment = (group, observations) => {
  const { ruleId, id, edge, toleranceCssPx } = validateAlignmentGroup(group);
  const measurements = observations.map(classifyPeerObservation)
    .map(item => (item.status === STATUS.PASS ? { ...item, coordinate: edgeCoordinate(item.box, edge) } : item));
  const base = { ruleId, group: id, edge, toleranceCssPx, measurements };
  const unknown = measurements.filter(item => item.status !== STATUS.PASS);
  if (unknown.length > 0) {
    return { ...base, status: STATUS.UNKNOWN, deltaCssPx: null, reason: unknown.map(item => `${item.element}: ${item.reason}`).join("; ") };
  }
  const coordinates = measurements.map(item => item.coordinate);
  const deltaCssPx = Math.max(...coordinates) - Math.min(...coordinates);
  const status = deltaCssPx <= toleranceCssPx ? STATUS.PASS : STATUS.FAIL;
  return {
    ...base,
    status,
    deltaCssPx,
    reason: `${edge}-edge delta ${deltaCssPx.toFixed(2)} CSS px ${status === STATUS.PASS ? "<=" : ">"} tolerance ${toleranceCssPx} CSS px`
  };
};

export const sameObservations = (a, b) =>
  a.length === b.length && a.every((item, index) => {
    const other = b[index];
    if (item.count !== other.count) return false;
    if (!item.box || !other.box) return item.box === other.box;
    return ["x", "y", "width", "height"].every(key => Math.abs(item.box[key] - other.box[key]) < 0.01);
  });

export const formatReport = report => {
  const details = (report.measurements ?? [])
    .map(item => `  - ${item.element}: ${item.status}${item.coordinate !== undefined ? ` ${report.edge}=${item.coordinate.toFixed(2)}px` : ""}${item.reason ? ` (${item.reason})` : ""}`)
    .join("\n");
  const subject = report.group ? `group ${report.group}` : report.action ?? report.subject ?? "";
  return `${report.ruleId} ${report.status}: ${subject}: ${report.reason}${details ? `\n${details}` : ""}`;
};

// ---------------------------------------------------------------------------
// ULI-A01/A02/A05: action outcomes
// ---------------------------------------------------------------------------

export const normalizeText = value => (value ?? "").replace(/\s+/g, " ").trim();

export const matchesExpected = (observed, expected) => {
  if (observed === null || observed === undefined) return false;
  if (expected instanceof RegExp) return new RegExp(expected.source, expected.flags.replace("g", "")).test(String(observed));
  return observed === expected;
};

// `open` observes native open state (details[open], dialog[open],
// :popover-open) of a semantic target or of "controlled": the element the
// action names through popovertarget, commandfor, aria-controls, or the
// <details> a <summary> belongs to. Controlled targets are declared in markup,
// never guessed.
export const OUTCOME_KINDS = Object.freeze({
  text: { targets: "semantic", expectedType: "string-or-regexp" },
  value: { targets: "semantic", expectedType: "string-or-regexp" },
  visible: { targets: "semantic", expectedType: "boolean" },
  checked: { targets: "semantic", expectedType: "boolean" },
  attribute: { targets: "semantic", expectedType: "string-or-regexp" },
  open: { targets: "semantic-or-controlled", expectedType: "boolean" },
  url: { targets: "none", expectedType: "string-or-regexp" }
});

export const validateActionContract = contract => {
  const { ruleId = "ULI-A02", action, outcome, timeoutMs = DEFAULT_TIMEOUT_MS, scope } = contract ?? {};
  requireSemanticTarget(action, "Action control");
  if (!/^ULI-A\d{2}$/.test(ruleId)) throw new Error("An action assertion must cite a ULI-A rule ID.");
  const kind = OUTCOME_KINDS[outcome?.kind];
  if (!kind) throw new Error(`An action requires an observable outcome kind: ${Object.keys(OUTCOME_KINDS).join(", ")}.`);
  if (kind.targets === "semantic") requireSemanticTarget(outcome.target, `Outcome target for ${outcome.kind}`);
  if (kind.targets === "semantic-or-controlled" && outcome.target !== "controlled") requireSemanticTarget(outcome.target, `Outcome target for ${outcome.kind}`);
  if (outcome.kind === "attribute" && !outcome.attribute) throw new Error("Attribute outcome requires an attribute name.");
  const typeOk = kind.expectedType === "boolean"
    ? typeof outcome.expected === "boolean"
    : typeof outcome.expected === "string" || outcome.expected instanceof RegExp;
  if (!typeOk) throw new Error(`Outcome ${outcome.kind} requires an explicit expected ${kind.expectedType} post-state.`);
  if (!(timeoutMs > 0 && Number.isFinite(timeoutMs))) throw new Error("Action assertions require a bounded positive timeoutMs.");
  return Object.freeze({ ruleId, action, outcome, timeoutMs, scope });
};

const actionBase = ({ ruleId, action, outcome, pre, post }) =>
  ({ ruleId, action: describeTarget(action), outcome: outcome.kind, expected: String(outcome.expected), pre, post });

// Decide whether an action can demonstrate a transition at all. Returns a
// report when it cannot (UNKNOWN for missing evidence, FAIL when the expected
// post-state is already present before activation), otherwise null.
export const evaluateActionPremise = ({ ruleId, action, outcome, pre, controlIssue }) => {
  const base = actionBase({ ruleId, action, outcome, pre, post: null });
  if (controlIssue) return { ...base, status: STATUS.UNKNOWN, reason: controlIssue };
  if (pre.missing && outcome.kind !== "visible") return { ...base, status: STATUS.UNKNOWN, reason: "outcome target not found before activation" };
  if (pre.count > 1) return { ...base, status: STATUS.UNKNOWN, reason: `outcome target name is ambiguous (${pre.count} matches)` };
  if (matchesExpected(pre.value, outcome.expected)) {
    return { ...base, status: STATUS.FAIL, reason: "pre-state already satisfies the expected post-state; no transition can be demonstrated" };
  }
  return null;
};

// Decide an action's status from pre/post observations. An action passes only
// when the pre-state did NOT already satisfy the expectation, the expected
// post-state was observed, and the observable value actually changed.
export const evaluateActionOutcome = ({ ruleId, action, outcome, pre, post, controlIssue }) => {
  const premise = evaluateActionPremise({ ruleId, action, outcome, pre, controlIssue });
  if (premise) return premise;
  const base = actionBase({ ruleId, action, outcome, pre, post });
  if (!post) return { ...base, status: STATUS.FAIL, reason: "no post-state observed" };
  if (!matchesExpected(post.value, outcome.expected)) {
    return { ...base, status: STATUS.FAIL, reason: "expected post-state never appeared within the timeout" };
  }
  if (post.value === pre.value) return { ...base, status: STATUS.FAIL, reason: "post-state equals pre-state" };
  return { ...base, status: STATUS.PASS, reason: "expected post-state observed after activation" };
};

// ---------------------------------------------------------------------------
// ULI-L05/L06: overflow and label integrity
// ---------------------------------------------------------------------------

// Horizontal overflow from an observation. Text escaping the viewport, or a
// container that clips (overflow hidden/clip), FAILS even when clipping hides
// it. Content inside a scroll container (overflow auto/scroll) is reachable
// and is the contract's permitted contained scroller, so callers must not
// report it as an escape.
export const evaluateOverflow = ({ scrollWidth, clientWidth, escapes = [] }) => {
  if (!(clientWidth > 0)) return { ruleId: "ULI-L05", status: STATUS.UNKNOWN, reason: "no viewport width observed", escapes: [] };
  const pageOverflow = scrollWidth - clientWidth;
  const failed = pageOverflow > 0 || escapes.length > 0;
  return {
    ruleId: "ULI-L05",
    status: failed ? STATUS.FAIL : STATUS.PASS,
    escapes,
    reason: `document scrollWidth ${scrollWidth} vs clientWidth ${clientWidth}; ${escapes.length} text run(s) escaping the viewport or a clipping container`
  };
};

// A label is intact when its content fits its own box and the box lies in the
// viewport. An inline box has no client size to compare, so it is UNKNOWN
// rather than a vacuous PASS.
export const evaluateLabelIntegrity = ({ name, display, scrollWidth, clientWidth, scrollHeight, clientHeight, left, right, viewport }) => {
  const base = { ruleId: "ULI-L06", name };
  if (display === "inline" || !(clientWidth > 0) || !(clientHeight > 0)) {
    return { ...base, status: STATUS.UNKNOWN, reason: "label has no measurable box (inline or zero-size); measure its block container" };
  }
  const clipped = scrollWidth > clientWidth + 1 || scrollHeight > clientHeight + 1;
  const offscreen = left < -0.5 || right > viewport + 0.5;
  return {
    ...base,
    status: clipped || offscreen ? STATUS.FAIL : STATUS.PASS,
    reason: `${clipped ? "content clipped" : "content fits"}; ${offscreen ? "box offscreen" : "box on screen"}`
  };
};

// ---------------------------------------------------------------------------
// ULI-L05: text inside a curved boundary (boundary.corner)
// ---------------------------------------------------------------------------
// Ported from Forma's internal layout probe (LCE-001: tests/layout
// Constraints.fs boundary.corner and Forma.Workflow LayoutGeometry). Text can
// sit inside a box's rectangle and still cross its rounded corner; a bounding
// rectangle cannot see that. Geometry is in CSS px, relative to any origin.

const splitTop = (separator, value) => {
  const parts = [];
  let current = "", depth = 0;
  for (const ch of value) {
    if (ch === separator && depth === 0) { if (current.trim()) parts.push(current.trim()); current = ""; continue; }
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
};

// One computed radius length: px, %, or min()/max() of those.
const radiusLength = (token, basis) => {
  const t = token.trim();
  const args = prefix => splitTop(",", t.slice(prefix.length, -1)).map(arg => radiusLength(arg, basis));
  if (t.startsWith("min(")) return Math.min(...args("min("));
  if (t.startsWith("max(")) return Math.max(...args("max("));
  if (t.endsWith("%")) return parseFloat(t) / 100 * basis;
  const value = parseFloat(t);
  return Number.isFinite(value) ? value : 0;
};

// A computed `border-*-radius` ("8px", "50%", "24px 8px", "min(999px, 43px)")
// resolved against a box of the given size.
export const resolveCornerRadius = (value, width, height) => {
  const [a, b = a] = splitTop(" ", String(value ?? "0px"));
  return { rx: Math.max(0, radiusLength(a ?? "0px", width)), ry: Math.max(0, radiusLength(b ?? "0px", height)) };
};

// CSS Backgrounds 3 §5.5: radii that overflow a side all scale down together.
const normalizeCorners = (rect, c) => {
  const ratio = (side, a, b) => (a + b > 0 ? side / (a + b) : Infinity);
  const f = Math.min(1, ratio(rect.width, c.topLeft.rx, c.topRight.rx), ratio(rect.width, c.bottomLeft.rx, c.bottomRight.rx),
    ratio(rect.height, c.topLeft.ry, c.bottomLeft.ry), ratio(rect.height, c.topRight.ry, c.bottomRight.ry));
  if (f >= 1) return c;
  const scale = k => ({ rx: k.rx * f, ry: k.ry * f });
  return { topLeft: scale(c.topLeft), topRight: scale(c.topRight), bottomRight: scale(c.bottomRight), bottomLeft: scale(c.bottomLeft) };
};

// How far a point lies outside a rounded box (0 inside). Exact for edges and
// circular corners; elliptical corners use the radial excess scaled by the
// shorter semi-axis, which is zero exactly when the point is inside.
const pointExcess = ({ left, top, right, bottom, corners: c }, x, y) => {
  const outside = Math.max(0, left - x, x - right, top - y, y - bottom);
  if (outside > 0) return outside;
  const corner = (k, cx, cy, inX, inY) => {
    if (k.rx <= 0 || k.ry <= 0 || !(inX && inY)) return 0;
    const q = Math.hypot((x - cx) / k.rx, (y - cy) / k.ry);
    return q <= 1 ? 0 : (q - 1) * Math.min(k.rx, k.ry);
  };
  return Math.max(0,
    corner(c.topLeft, left + c.topLeft.rx, top + c.topLeft.ry, x < left + c.topLeft.rx, y < top + c.topLeft.ry),
    corner(c.topRight, right - c.topRight.rx, top + c.topRight.ry, x > right - c.topRight.rx, y < top + c.topRight.ry),
    corner(c.bottomRight, right - c.bottomRight.rx, bottom - c.bottomRight.ry, x > right - c.bottomRight.rx, y > bottom - c.bottomRight.ry),
    corner(c.bottomLeft, left + c.bottomLeft.rx, bottom - c.bottomLeft.ry, x < left + c.bottomLeft.rx, y > bottom - c.bottomLeft.ry));
};

// Observation: { name, rect: {left, top, width, height}, radii: [tl, tr, br,
// bl] computed strings, border: {top, right, bottom, left} px, fragments:
// [{ text, left, top, right, bottom }] (text line boxes) }. Every boundary is
// convex, so a fragment is inside exactly when its four corners are. The
// visible boundary is the inner border edge (CSS inner radius = outer radius
// minus the adjoining border width).
export const evaluateCornerContainment = ({ name, rect, radii = [], border = { top: 0, right: 0, bottom: 0, left: 0 }, fragments = [] }, { tolerance = 0.5 } = {}) => {
  const base = { ruleId: "ULI-L05", check: "boundary.corner", name };
  if (!rect || !(rect.width > 0) || !(rect.height > 0)) return { ...base, status: STATUS.UNKNOWN, reason: "no box observed", worst: null };
  if (fragments.length === 0) return { ...base, status: STATUS.UNKNOWN, reason: "no text observed inside the box", worst: null };
  const [tl, tr, br, bl] = [0, 1, 2, 3].map(i => resolveCornerRadius(radii[i], rect.width, rect.height));
  const outer = normalizeCorners(rect, { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl });
  const shrink = (k, h, v) => ({ rx: Math.max(0, k.rx - h), ry: Math.max(0, k.ry - v) });
  const inner = {
    left: rect.left + border.left, top: rect.top + border.top,
    right: rect.left + rect.width - border.right, bottom: rect.top + rect.height - border.bottom,
    corners: {
      topLeft: shrink(outer.topLeft, border.left, border.top), topRight: shrink(outer.topRight, border.right, border.top),
      bottomRight: shrink(outer.bottomRight, border.right, border.bottom), bottomLeft: shrink(outer.bottomLeft, border.left, border.bottom)
    }
  };
  const worst = fragments
    .map(fragment => ({ fragment, excess: Math.max(...[[fragment.left, fragment.top], [fragment.right, fragment.top], [fragment.right, fragment.bottom], [fragment.left, fragment.bottom]].map(([x, y]) => pointExcess(inner, x, y))) }))
    .reduce((a, b) => (b.excess > a.excess ? b : a));
  const failed = worst.excess > tolerance;
  return {
    ...base,
    status: failed ? STATUS.FAIL : STATUS.PASS,
    worst: { text: worst.fragment.text, excess: Math.round(worst.excess * 100) / 100 },
    reason: failed
      ? `text "${worst.fragment.text}" crosses the visible boundary by ${worst.excess.toFixed(2)}px (radii ${radii.join(" / ")})`
      : `${fragments.length} text line(s) inside the visible boundary (radii ${radii.join(" / ")})`
  };
};
