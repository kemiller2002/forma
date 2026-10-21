import { BOND, CLEARANCE, DEFAULTS, HARD } from "./tokens.mjs";
import { diagnostic } from "./diagnostics.mjs";

// Normalizes a raw relational description (from the DOM adapter or a test
// fixture) into a resolver node with lengths in CSS px. Pure: returns
// { node, diagnostics }.
//
// raw = { key, kind: "container" | "group" | "leaf", attrs, interactive,
//         control, border: { top, right, bottom, left }, children, measure }
// measure (leaves) = { minContent, maxContent, heightAt: width => height }

const FLOWS = ["column", "row", "wrap"];
const ALIGNS = ["start", "center", "end", "stretch"];

export const parseLength = (value, remPx) => {
  if (value === undefined || value === null || value === "") return { ok: true, value: undefined };
  const match = /^\s*(-?\d*\.?\d+)\s*(rem|px)\s*$/.exec(String(value));
  if (!match) return { ok: false, value: undefined };
  const number = Number(match[1]) * (match[2] === "rem" ? remPx : 1);
  return Number.isFinite(number) && number >= 0 ? { ok: true, value: number } : { ok: false, value: undefined };
};

const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

const clearanceFor = (kind, attrs, remPx) => {
  const base = kind === "container" ? (attrs.clearance ?? DEFAULTS.containerClearance) : "none";
  const step = name => (CLEARANCE[name] ?? CLEARANCE[base] ?? 0) * remPx;
  const inline = step(attrs.clearanceInline ?? base);
  return {
    top: step(attrs.clearanceTop ?? attrs.clearanceBlock ?? base),
    bottom: step(attrs.clearanceBottom ?? attrs.clearanceBlock ?? base),
    left: inline,
    right: inline
  };
};

const zeroBorder = Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 });

export const normalize = (raw, remPx) => {
  const attrs = raw.attrs ?? {};
  const kind = raw.kind ?? "leaf";
  const min = parseLength(attrs.min, remPx);
  const max = parseLength(attrs.max, remPx);
  const local = [
    ...(min.ok ? [] : [diagnostic("invalid-dimension", raw.key, `data-rl-min "${attrs.min}" is not a non-negative rem or px length`)]),
    ...(max.ok ? [] : [diagnostic("invalid-dimension", raw.key, `data-rl-max "${attrs.max}" is not a non-negative rem or px length`)]),
    ...(min.value !== undefined && max.value !== undefined && min.value > max.value
      ? [diagnostic("invalid-dimension", raw.key, `data-rl-min ${min.value}px exceeds data-rl-max ${max.value}px`)]
      : []),
    ...(attrs.bond !== undefined && !(attrs.bond in BOND)
      ? [diagnostic("invalid-dimension", raw.key, `unknown data-rl-bond "${attrs.bond}"`)]
      : [])
  ];
  const children = (raw.children ?? []).map(child => normalize(child, remPx));
  const measure = raw.measure;
  const measureIssues = kind === "leaf" && measure
    && ![measure.minContent, measure.maxContent].every(Number.isFinite)
    ? [diagnostic("numeric-instability", raw.key, "leaf intrinsic size is not finite")]
    : [];
  const hardFloor = raw.control ? Math.max(HARD.targetPx, HARD.controlMinRem * remPx) : raw.interactive ? HARD.targetPx : 0;
  const node = Object.freeze({
    key: raw.key,
    kind,
    flow: pick(attrs.flow, FLOWS, DEFAULTS.flow),
    bond: attrs.bond in BOND ? attrs.bond : DEFAULTS.bond,
    gap: (BOND[attrs.bond] ?? BOND[DEFAULTS.bond]) * remPx,
    clearance: clearanceFor(kind, attrs, remPx),
    border: raw.border ?? zeroBorder,
    align: pick(attrs.align, ALIGNS, undefined),
    equal: Boolean(attrs.equal),
    min: min.value,
    max: max.value,
    fill: Boolean(attrs.fill),
    contentSized: attrs.size === "content",
    anchorEnd: attrs.anchor === "end",
    alignEdge: attrs.alignEdge || undefined,
    interactive: Boolean(raw.interactive),
    hardFloor,
    measure,
    children: children.map(c => c.node)
  });
  return {
    node,
    diagnostics: [...local, ...measureIssues, ...children.flatMap(c => c.diagnostics)]
  };
};

// Flexible children grow to share a line; content-sized children keep their
// preferred size and leave the remainder as free space.
export const isFlexible = node => node.fill || node.min !== undefined || node.kind !== "leaf" && !node.contentSized;
