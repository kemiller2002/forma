import { HARD } from "./tokens.mjs";
import { basis, hardGap, hardMin } from "./layout.mjs";
import { isFlexible } from "./model.mjs";
import { columnLine, greedyLines, innerWidth, scaledClearance, unsatisfiable, widestHardChild } from "./lines.mjs";
import { boundaryEnergy, lineEnergy, placeFree } from "./springs.mjs";

// Arm C: relational constraints resolved by deterministic rules. No search
// and no optimization: each relationship maps to one rule, applied in a
// fixed order (hard constraints first, then comfortable sizes, then growth).

const sum = values => values.reduce((a, b) => a + b, 0);

// Give `free` space to growers in equal shares, respecting each one's cap.
const waterFill = (sizes, caps, growers, free) => {
  const open = growers.filter(i => sizes[i] < caps[i] - 0.01);
  if (free <= 0.01 || open.length === 0) return { sizes, free };
  const share = free / open.length;
  const next = sizes.map((s, i) => (open.includes(i) ? Math.min(caps[i], s + share) : s));
  return waterFill(next, caps, growers, free - (sum(next) - sum(sizes)));
};

// Shrink toward hard minimums in proportion to available compression.
const compress = (sizes, floors, deficit) => {
  const room = sum(sizes.map((s, i) => s - floors[i]));
  if (room <= 0) return sizes;
  const ratio = Math.min(1, deficit / room);
  return sizes.map((s, i) => s - (s - floors[i]) * ratio);
};

export const distributeRule = (node, children, inner) => {
  const floors = children.map(c => Math.min(hardMin(c), inner));
  const caps = children.map((c, i) => Math.max(floors[i], Math.min(c.max ?? inner, inner)));
  const start = children.map((c, i) => Math.max(floors[i], Math.min(basis(c), caps[i])));
  const targetGaps = children.slice(1).map(() => node.gap);
  const over = sum(start) + sum(targetGaps) - inner;
  const gaps = over > 0 ? targetGaps.map(hardGap) : targetGaps;
  const deficit = sum(start) + sum(gaps) - inner;
  const shrunk = deficit > 0 ? compress(start, floors, deficit) : start;
  const free0 = inner - sum(shrunk) - sum(gaps);
  const equalized = node.equal && children.length > 1 && free0 > 0
    ? (() => {
      const e = (inner - sum(gaps)) / children.length;
      return children.map((_, i) => Math.max(floors[i], Math.min(caps[i], e)));
    })()
    : shrunk;
  const free1 = inner - sum(equalized) - sum(gaps);
  const fills = children.map((c, i) => (c.fill ? i : -1)).filter(i => i >= 0);
  const growers = fills.length ? fills : children.map((c, i) => (isFlexible(c) ? i : -1)).filter(i => i >= 0);
  const grown = free1 > 0 && !node.equal ? waterFill(equalized, caps, growers, free1) : { sizes: equalized, free: Math.max(0, free1) };
  const placed = placeFree(node, children, gaps, Math.max(0, grown.free));
  return { sizes: grown.sizes, gaps, free: Math.max(0, grown.free), placed };
};

const partition = (node, inner) => {
  if (node.flow === "column") return node.children.map(c => [c]);
  if (node.flow === "row") {
    const comfortable = sum(node.children.map(c => Math.min(basis(c), inner))) + node.gap * Math.max(0, node.children.length - 1);
    return comfortable <= inner + 0.01 ? [node.children] : node.children.map(c => [c]);
  }
  return greedyLines(node, inner);
};

export const arrangeRules = (node, width, ctx) => {
  const target = scaledClearance(node, 1);
  const fitsAtTarget = widestHardChild(node) <= innerWidth(node, width, target) + 0.5;
  const clearance = fitsAtTarget ? target : scaledClearance(node, HARD.clearanceRatio);
  const inner = Math.max(0, innerWidth(node, width, clearance));
  const lines = partition(node, inner).map(children => {
    if (node.flow === "column") {
      const line = columnLine(node, children[0], inner);
      return { ...line, energy: lineEnergy(node, children, inner, [line.items[0].width], [], line.lead + line.slack, ctx.remPx) };
    }
    const { sizes, gaps, free, placed } = distributeRule(node, children, inner);
    return {
      items: children.map((child, i) => ({ child, width: sizes[i] })),
      gaps: placed.gaps,
      lead: placed.lead,
      slack: placed.slack,
      energy: lineEnergy(node, children, inner, sizes, gaps, free, ctx.remPx)
    };
  });
  ctx.stats.lines += lines.length;
  return {
    clearance,
    lines,
    energy: boundaryEnergy(node, clearance, ctx.remPx) + sum(lines.map(l => l.energy)),
    diagnostics: unsatisfiable(node, inner)
  };
};
