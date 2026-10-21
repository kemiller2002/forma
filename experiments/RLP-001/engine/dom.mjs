import { resolve } from "./core/resolve.mjs";
import { diagnostic, statusOf } from "./core/diagnostics.mjs";

// Browser adapter shared by Arms C and D. It reads the relational markup into
// the resolver model, measures leaves through ordinary browser layout, applies
// the resolved geometry, and re-resolves when layout inputs change. Only the
// resolver (`arm`) differs between the arms.

const ATTRIBUTES = {
  "data-rl-flow": "flow",
  "data-rl-bond": "bond",
  "data-rl-clearance": "clearance",
  "data-rl-clearance-block": "clearanceBlock",
  "data-rl-clearance-inline": "clearanceInline",
  "data-rl-clearance-top": "clearanceTop",
  "data-rl-clearance-bottom": "clearanceBottom",
  "data-rl-align": "align",
  "data-rl-equal": "equal",
  "data-rl-min": "min",
  "data-rl-max": "max",
  "data-rl-fill": "fill",
  "data-rl-size": "size",
  "data-rl-anchor": "anchor",
  "data-rl-align-edge": "alignEdge"
};

const SKIP = new Set(["SCRIPT", "STYLE", "TEMPLATE", "LINK", "META"]);
const INTERACTIVE = "button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=tab], [tabindex]:not([tabindex='-1'])";
const CONTROL = "input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]), select, textarea";
const REPLACED = "img, svg, video, canvas, iframe, picture";

const keys = new WeakMap();
const keyFor = (() => {
  const counter = { next: 1 };
  return element => {
    if (!keys.has(element)) keys.set(element, `n${counter.next++}`);
    return keys.get(element);
  };
})();

const attrsOf = element => Object.fromEntries(Object.entries(ATTRIBUTES)
  .filter(([name]) => element.hasAttribute(name))
  .map(([name, key]) => [key, element.getAttribute(name) === "" ? true : element.getAttribute(name)]));

const rendered = element => !SKIP.has(element.tagName) && !element.hidden && getComputedStyle(element).display !== "none";

const px = value => Number.parseFloat(value) || 0;

const measureLeaf = element => {
  const style = element.style;
  const measureWith = size => {
    style.inlineSize = size;
    return element.getBoundingClientRect();
  };
  const isControl = element.matches(CONTROL);
  const isReplaced = element.matches(REPLACED);
  // data-rl-scroll: the leaf may scroll inline, so its content does not set
  // a hard minimum width.
  const scrolls = element.hasAttribute("data-rl-scroll");
  if (scrolls) style.overflowX = "auto";
  style.position = "absolute";
  style.blockSize = "";
  const minRect = measureWith("min-content");
  const maxRect = measureWith("max-content");
  const remPx = px(getComputedStyle(document.documentElement).fontSize);
  return {
    minContent: isControl ? 0 : isReplaced || scrolls ? Math.min(minRect.width, 4 * remPx) : minRect.width,
    maxContent: maxRect.width,
    heightAt: width => measureWith(`${width}px`).height
  };
};

export const snapshot = (element, isRoot = true) => {
  const role = element.getAttribute("data-rl");
  const kind = role === "container" ? "container" : role === "group" || isRoot ? "group" : "leaf";
  const computed = getComputedStyle(element);
  const children = kind === "leaf" ? [] : [...element.children].filter(rendered).map(child => snapshot(child, false));
  const bareText = kind !== "leaf" && [...element.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
  return {
    key: keyFor(element),
    element,
    kind,
    attrs: attrsOf(element),
    interactive: element.matches(INTERACTIVE),
    control: element.matches(CONTROL),
    border: {
      top: px(computed.borderTopWidth),
      right: px(computed.borderRightWidth),
      bottom: px(computed.borderBottomWidth),
      left: px(computed.borderLeftWidth)
    },
    bareText,
    measure: kind === "leaf" ? measureLeaf(element) : undefined,
    children
  };
};

const elementsByKey = raw => new Map([[raw.key, raw.element], ...raw.children.flatMap(c => [...elementsByKey(c)])]);
const bareTextIssues = raw => [
  ...(raw.bareText ? [diagnostic("constraint-violation", raw.key, "text directly inside a relational group or container is not placed; wrap it in an element")] : []),
  ...raw.children.flatMap(bareTextIssues)
];

const apply = (root, raw, result) => {
  const byKey = elementsByKey(raw);
  root.style.position = "relative";
  root.style.blockSize = `${result.blockSize}px`;
  result.geometry.forEach(g => {
    const element = byKey.get(g.key);
    if (!element || element === root) return;
    const style = element.style;
    style.position = "absolute";
    style.insetInlineStart = `${g.x}px`;
    style.insetBlockStart = `${g.y}px`;
    style.inlineSize = `${g.w}px`;
    style.blockSize = g.leaf ? "" : `${g.h}px`;
    style.margin = "0";
  });
};

const summarize = result => ({
  arm: result.arm,
  status: result.status,
  rootWidth: result.rootWidth,
  blockSize: result.blockSize,
  energy: result.energy,
  diagnostics: result.diagnostics,
  stats: result.stats
});

// Oscillation guard: a layout that keeps re-triggering itself within one
// frame (for example a scrollbar toggling the root width) is stopped and
// reported instead of looping.
const MAX_RESOLVES_PER_FRAME = 12;

export const mount = (root, arm) => {
  const state = { revision: 0, perFrame: 0, frameScheduled: false, pending: false, halted: false, lastWidth: -1, lastRem: -1, history: [] };
  const remPx = () => px(getComputedStyle(document.documentElement).fontSize);
  const run = reason => {
    state.pending = false;
    if (state.halted) return;
    state.perFrame += 1;
    if (!state.frameScheduled) {
      state.frameScheduled = true;
      requestAnimationFrame(() => { state.perFrame = 0; state.frameScheduled = false; });
    }
    const started = performance.now();
    const raw = snapshot(root);
    const width = root.getBoundingClientRect().width;
    const result = resolve(arm, raw, width, { remPx: remPx(), now: () => performance.now() });
    const oscillating = state.perFrame > MAX_RESOLVES_PER_FRAME;
    const diagnostics = [
      ...result.diagnostics,
      ...bareTextIssues(raw),
      ...(oscillating ? [diagnostic("oscillation", raw.key, `more than ${MAX_RESOLVES_PER_FRAME} resolves in one frame; re-resolution halted until content changes`)] : [])
    ];
    const final = { ...result, diagnostics, status: statusOf(diagnostics) };
    apply(root, raw, final);
    state.halted = oscillating;
    state.revision += 1;
    state.lastWidth = width;
    state.lastRem = remPx();
    root.dataset.rlStatus = final.status;
    root.dataset.rlRevision = String(state.revision);
    const entry = { revision: state.revision, reason, totalMs: performance.now() - started, ...summarize(final) };
    state.history = [...state.history.slice(-49), entry];
    root.dispatchEvent(new CustomEvent("rl-resolved", { detail: entry }));
  };
  const schedule = reason => {
    if (state.pending) return;
    state.pending = true;
    queueMicrotask(() => run(reason));
  };
  const resize = new ResizeObserver(() => {
    const width = root.getBoundingClientRect().width;
    if (Math.abs(width - state.lastWidth) > 0.01 || Math.abs(remPx() - state.lastRem) > 0.001) schedule("resize");
  });
  resize.observe(root);
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = "position:absolute;inline-size:1rem;block-size:0;visibility:hidden;pointer-events:none";
  document.body.append(probe);
  resize.observe(probe);
  const mutations = new MutationObserver(records => {
    state.halted = false;
    schedule(records[0]?.type ?? "mutation");
  });
  mutations.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["hidden", "class", "value", "open", ...Object.keys(ATTRIBUTES), "data-rl", "data-rl-scroll"] });
  root.addEventListener("load", () => schedule("load"), true);
  document.fonts?.ready.then(() => schedule("fonts"));
  run("mount");
  return {
    get revision() { return state.revision; },
    get last() { return state.history[state.history.length - 1]; },
    get history() { return state.history; },
    resolveNow: () => run("manual")
  };
};

export const mountAll = arm => {
  const roots = [...document.querySelectorAll("[data-rl-root]")];
  const mounted = roots.map(root => mount(root, arm));
  window.__rlp = Object.freeze({
    arm,
    roots: mounted,
    get revision() { return mounted.reduce((s, m) => s + m.revision, 0); },
    get status() { return mounted.every(m => m.last?.status === "valid") ? "valid" : "invalid"; },
    get diagnostics() { return mounted.flatMap(m => m.last?.diagnostics ?? []); }
  });
  return mounted;
};
