import { HARD } from "./tokens.mjs";
import { diagnostic } from "./diagnostics.mjs";
import { basis, hardMin, preferred } from "./layout.mjs";

// Helpers both resolvers share: clearance arithmetic, column lines, and
// line-partition candidates.

const sum = values => values.reduce((a, b) => a + b, 0);

export const scaledClearance = (node, ratio) => ({
  top: node.clearance.top * ratio,
  right: node.clearance.right * ratio,
  bottom: node.clearance.bottom * ratio,
  left: node.clearance.left * ratio
});

export const innerWidth = (node, width, clearance) =>
  width - node.border.left - node.border.right - clearance.left - clearance.right;

export const widestHardChild = node => node.children.reduce((m, c) => Math.max(m, hardMin(c)), 0);

export const unsatisfiable = (node, inner) => {
  const need = widestHardChild(node);
  return need > inner + 0.5
    ? [diagnostic("unsatisfiable", node.key, "children cannot fit inside the container even at hard minimum clearance", { needed: need, available: inner })]
    : [];
};

// A single child stacked in a column: stretch to the inner size unless the
// child (or the container's alignment) asks for content size.
export const columnLine = (node, child, inner) => {
  const contentSized = child.contentSized || (node.align && node.align !== "stretch");
  const capped = Math.min(inner, child.max ?? Infinity);
  const width = Math.max(Math.min(hardMin(child), inner), contentSized ? Math.min(preferred(child), capped) : capped);
  const free = Math.max(0, inner - width);
  const lead = node.align === "center" ? free / 2 : node.align === "end" || child.anchorEnd ? free : 0;
  return { items: [{ child, width }], gaps: [], lead, slack: free - lead };
};

// Greedy first-fit packing on comfortable sizes (CSS flex-wrap behavior).
export const greedyLines = (node, inner) => node.children.reduce((lines, child) => {
  const last = lines[lines.length - 1];
  const size = Math.min(basis(child), inner);
  if (last && last.used + node.gap + size <= inner + 0.01) {
    return [...lines.slice(0, -1), { children: [...last.children, child], used: last.used + node.gap + size }];
  }
  return [...lines, { children: [child], used: size }];
}, []).map(l => l.children);

// Every order-preserving partition of children into lines (2^(n-1)).
export const allPartitions = children => {
  if (children.length <= 1) return [children.length ? [children] : []];
  const rest = allPartitions(children.slice(1));
  return rest.flatMap(lines => [
    [[children[0], ...lines[0]], ...lines.slice(1)],
    [[children[0]], ...lines]
  ]);
};

// Neighborhood of the greedy partition: move each line boundary by one.
export const nearbyPartitions = (greedy) => {
  const flat = greedy.flat();
  const cuts = greedy.slice(0, -1).reduce((acc, line) => [...acc, (acc[acc.length - 1] ?? 0) + line.length], []);
  const fromCuts = cs => {
    const bounds = [0, ...cs, flat.length];
    return bounds.slice(1).map((end, i) => flat.slice(bounds[i], end)).filter(l => l.length);
  };
  const variants = cuts.flatMap((c, i) => [-1, 1].map(d => cuts.map((x, j) => (j === i ? x + d : x))))
    .filter(cs => cs.every((x, i) => x > 0 && x < flat.length && (i === 0 || x > cs[i - 1])));
  const merges = cuts.map((_, i) => cuts.filter((__, j) => j !== i));
  return [greedy, ...variants.map(fromCuts), ...merges.map(fromCuts), flat.map(c => [c])];
};

export const lineFits = (node, children, inner) =>
  sum(children.map(c => Math.min(hardMin(c), inner))) + Math.max(0, children.length - 1) * Math.max(HARD.gapFloorPx, node.gap * HARD.gapRatio) <= inner + 0.01;
