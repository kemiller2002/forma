import { HARD, SOLVER } from "./tokens.mjs";
import { diagnostic } from "./diagnostics.mjs";

// Shared, resolver-independent layout skeleton. A resolver supplies one
// function, arrange(node, width, ctx) -> Plan, deciding clearance, line
// breaks, inline sizes and separations of a container's children. Everything
// else (intrinsic sizes, block placement, shared edges, hard-constraint
// verification) is identical for Arms C and D, so the arms differ only in how
// they resolve the relationships.
//
// Plan = { clearance: { top, right, bottom, left },
//          lines: [{ items: [{ child, width }], gaps: [px], lead: px, slack: px }],
//          energy, diagnostics }

export const round = value => Math.round(value / SOLVER.roundingPx) * SOLVER.roundingPx;
const sum = values => values.reduce((a, b) => a + b, 0);
const maxOf = values => values.reduce((a, b) => Math.max(a, b), 0);

const isContainer = node => node.kind !== "leaf";

// Hard (never violated) minimum inline size.
export const hardMin = node => isContainer(node)
  ? node.border.left + node.border.right
    + (node.clearance.left + node.clearance.right) * HARD.clearanceRatio
    + maxOf(node.children.map(hardMin))
  : Math.max(node.measure?.minContent ?? 0, node.hardFloor);

const clampMax = (node, value) => Math.min(value, node.max ?? Infinity);

// Preferred inline size: what the element would take with no pressure.
export const preferred = node => {
  const floor = hardMin(node);
  if (!isContainer(node)) return Math.max(floor, clampMax(node, node.measure?.maxContent ?? floor));
  const prefs = node.children.map(preferred);
  const chrome = node.border.left + node.border.right + node.clearance.left + node.clearance.right;
  const content = node.flow === "column"
    ? maxOf(prefs)
    : sum(prefs) + node.gap * Math.max(0, prefs.length - 1);
  return Math.max(floor, clampMax(node, chrome + content));
};

// Comfortable size used to decide whether children share a line.
export const basis = node => Math.max(hardMin(node), node.min ?? preferred(node));

export const hardGap = gap => Math.max(HARD.gapFloorPx, gap * HARD.gapRatio);

// ---------------------------------------------------------------------------

const memoKey = (node, width, padSignature) => `${node.key}|${round(width)}|${padSignature}`;

const padSignature = pads => [...pads.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}:${round(v)}`).join(",");

const leafBox = (node, width, ctx) => {
  const height = ctx.heightAt(node, width);
  const issues = Number.isFinite(height) && height >= 0
    ? []
    : [diagnostic("numeric-instability", node.key, `measured block size ${height} at inline size ${width}`)];
  return { key: node.key, node, w: width, h: Number.isFinite(height) ? height : 0, energy: 0, children: [], diagnostics: issues };
};

// Collect shared-edge members (data-rl-align-edge) inside a laid-out box,
// with their top edge relative to the box. A member inside a tight bond is
// pushed by inserting space before the whole tightly bonded group, so
// alignment never separates elements that belong together (for example a
// label from its control).
const members = (box, offset = 0, head = undefined) => {
  const tight = box.node.kind !== "leaf" && box.node.bond === "tight" && box.children.length > 0;
  const nextHead = tight ? box.children[0].box.key : head;
  return [
    ...(box.node.alignEdge ? [{ name: box.node.alignEdge, key: head ?? box.key, top: offset }] : []),
    ...box.children.flatMap(c => members(c.box, offset + c.y, nextHead))
  ];
};

const crossOffset = (align, lineHeight, height) =>
  align === "center" ? (lineHeight - height) / 2 : align === "end" ? lineHeight - height : 0;

// Lays out one line's items, then pushes shared-edge members down until every
// edge name shared by two or more items in the line agrees.
const layoutLine = (line, pads, ctx) => {
  const place = currentPads => line.items.map(({ child, width }) => layoutNode(child, width, ctx, currentPads));
  const settle = (currentPads, pass) => {
    const boxes = place(currentPads);
    const found = boxes.map((box, index) => members(box).map(m => ({ ...m, top: m.top + (currentPads.get(box.key) ?? 0), item: index })));
    const byName = found.flat().reduce((acc, m) => acc.set(m.name, [...(acc.get(m.name) ?? []), m]), new Map());
    const shared = [...byName.values()].filter(ms => new Set(ms.map(m => m.item)).size > 1);
    const pushes = shared.flatMap(ms => {
      const target = maxOf(ms.map(m => m.top));
      return ms.filter(m => target - m.top > SOLVER.roundingPx).map(m => [m.key, target - m.top]);
    });
    if (pushes.length === 0 || pass >= 4) {
      const unresolved = pass >= 4 && pushes.length > 0
        ? [diagnostic("constraint-violation", line.items[0]?.child.key, "shared edges did not agree after 4 passes", { edges: pushes.map(([k]) => k) })]
        : [];
      return { boxes, pads: currentPads, diagnostics: unresolved };
    }
    const next = new Map(currentPads);
    pushes.forEach(([key, delta]) => next.set(key, (next.get(key) ?? 0) + delta));
    return settle(next, pass + 1);
  };
  return settle(pads, 0);
};

const layoutContainer = (node, width, ctx, pads) => {
  const plan = ctx.arrange(node, width, ctx);
  const align = node.align ?? "stretch";
  const top0 = node.border.top + plan.clearance.top;
  const left0 = node.border.left + plan.clearance.left;
  const laid = plan.lines.map(line => ({ line, ...layoutLine(line, pads, ctx) }));
  const placed = laid.reduce((acc, { line, boxes, pads: linePads, diagnostics }, lineIndex) => {
    const y0 = acc.y + (lineIndex === 0 ? 0 : node.gap);
    const offsets = boxes.map(box => linePads.get(box.key) ?? 0);
    const lineHeight = maxOf(boxes.map((box, i) => box.h + offsets[i]));
    // Stretch containers to the line height (equal-height peers); leaves keep
    // their natural block size so text is never forced into a taller box.
    const stretched = boxes.map(box => (align === "stretch" && isContainer(box.node) && line.items.length > 1 && box.h < lineHeight
      ? { ...box, h: lineHeight }
      : box));
    const xs = line.items.reduce((xsAcc, item, i) => {
      const prev = i === 0 ? left0 + line.lead : xsAcc[i - 1] + line.items[i - 1].width + line.gaps[i - 1];
      return [...xsAcc, prev];
    }, []);
    const children = stretched.map((box, i) => ({
      box,
      x: xs[i],
      y: y0 + offsets[i] + (align === "stretch" ? 0 : crossOffset(align, lineHeight, box.h + offsets[i]))
    }));
    return { y: y0 + lineHeight, children: [...acc.children, ...children], diagnostics: [...acc.diagnostics, ...diagnostics] };
  }, { y: top0, children: [], diagnostics: [] });
  const height = placed.y + plan.clearance.bottom + node.border.bottom;
  return {
    key: node.key,
    node,
    w: width,
    h: height,
    clearance: plan.clearance,
    lines: plan.lines.map(l => l.items.length),
    energy: plan.energy + sum(placed.children.map(c => c.box.energy)),
    children: placed.children,
    diagnostics: [...plan.diagnostics, ...placed.diagnostics]
  };
};

export const layoutNode = (node, width, ctx, pads = new Map()) => {
  const key = memoKey(node, width, padSignature(pads));
  const cached = ctx.memo.get(key);
  if (cached) return cached;
  const box = isContainer(node) ? layoutContainer(node, width, ctx, pads) : leafBox(node, width, ctx);
  ctx.memo.set(key, box);
  return box;
};

// ---------------------------------------------------------------------------
// Hard-constraint verification of a finished layout. Runs for every arm, so
// no resolver can return invalid geometry without a diagnostic.

const TOL = 0.5;

const verifyBox = box => {
  const node = box.node;
  const own = isContainer(node) ? (() => {
    const minLeft = node.border.left + node.clearance.left * HARD.clearanceRatio - TOL;
    const minTop = node.border.top + node.clearance.top * HARD.clearanceRatio - TOL;
    const maxRight = box.w - node.border.right - node.clearance.right * HARD.clearanceRatio + TOL;
    const maxBottom = box.h - node.border.bottom - node.clearance.bottom * HARD.clearanceRatio + TOL;
    const containment = box.children.flatMap(({ box: child, x, y }) =>
      (x < minLeft || y < minTop || x + child.w > maxRight || y + child.h > maxBottom
        ? [diagnostic("constraint-violation", child.key, "child violates container clearance or containment", {
          invariant: "containment", parent: box.key, child: { x, y, w: child.w, h: child.h }, bounds: { minLeft, minTop, maxRight, maxBottom }
        })]
        : []));
    const pairs = box.children.slice(1).map((b, i) => [box.children[i], b]);
    const ordering = pairs.flatMap(([a, b]) => {
      const sameLine = b.y < a.y + a.box.h - TOL && a.y < b.y + b.box.h - TOL;
      const overlap = sameLine && b.x < a.x + a.box.w - TOL;
      const separation = sameLine ? b.x - (a.x + a.box.w) : b.y - (a.y + a.box.h);
      return [
        ...(overlap ? [diagnostic("constraint-violation", b.box.key, "siblings overlap or break reading order", { invariant: "non-overlap", previous: a.box.key })] : []),
        ...(!overlap && separation < hardGap(node.gap) - TOL ? [diagnostic("constraint-violation", b.box.key, "insufficient sibling separation", { invariant: "separation", previous: a.box.key, observed: separation, minimum: hardGap(node.gap) })] : []),
        ...(!sameLine && b.y < a.y + a.box.h - TOL ? [diagnostic("constraint-violation", b.box.key, "reading order inverted", { invariant: "reading-order", previous: a.box.key })] : [])
      ];
    });
    return [...containment, ...ordering];
  })() : [];
  const target = node.interactive && (box.w < HARD.targetPx - TOL || box.h < HARD.targetPx - TOL)
    ? [diagnostic("constraint-violation", box.key, "interactive target below 24 CSS px", { invariant: "target-size", observed: { w: box.w, h: box.h } })]
    : [];
  return [...own, ...target, ...box.children.flatMap(c => verifyBox(c.box))];
};

const hierarchy = node => [
  ...(isContainer(node) && node.children.length > 1 ? node.children.filter(c => isContainer(c) && c.children.length > 1 && c.gap > node.gap)
    .map(c => diagnostic("hierarchy-inversion", c.key, "a group's internal separation exceeds the separation between it and its siblings", { inner: c.gap, outer: node.gap })) : []),
  ...node.children.flatMap(hierarchy)
];

export const verify = (box, rootNode) => [...verifyBox(box), ...hierarchy(rootNode)];

const collect = box => [...box.diagnostics, ...box.children.flatMap(c => collect(c.box))];
export const collectDiagnostics = collect;

// Flatten to geometry relative to each element's offset parent (its parent
// node's padding box, which is where absolute positioning is measured from).
export const flatten = (box, x = 0, y = 0, parentBorder = { left: 0, top: 0 }) => [
  { key: box.key, x: round(x - parentBorder.left), y: round(y - parentBorder.top), w: round(box.w), h: round(box.h), leaf: !isContainer(box.node) },
  ...box.children.flatMap(c => flatten(c.box, c.x, c.y, box.node.border))
];
