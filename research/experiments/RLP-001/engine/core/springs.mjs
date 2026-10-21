import { WEIGHTS, bondStrength } from "./tokens.mjs";
import { basis, hardGap, hardMin, preferred } from "./layout.mjs";
import { isFlexible } from "./model.mjs";
import { energyOf } from "./relax.mjs";

// The spring system of one line. Shared by both resolvers so that the energy
// reported for an Arm C layout is directly comparable with Arm D's.
//
//   Ep  preferred size   content items: rest = preferred, stiffness wp both ways
//                        flexible items: rest = basis, resists compression only
//   Es  separation       sibling gap below its bond target (repulsion, ws)
//   Eg  grouping         sibling gap above its bond target (attraction, wg * bond)
//   Ef  free space       unused line space, penalized only when a flexible item
//                        could use it (prevents unexplained whitespace)
//   equal-width peers    one shared variable with multiplicity n (hard)

const FREE_SPACE_STIFFNESS = 0.05;

export const lineVariables = (node, children, inner) => {
  const flexible = children.map(isFlexible);
  const anyFlexible = flexible.some(Boolean);
  const itemVar = (child, i) => ({
    role: "size",
    t: Math.min(inner, flexible[i] ? basis(child) : preferred(child)),
    lo: WEIGHTS.preferred,
    hi: flexible[i] ? 0 : WEIGHTS.preferred,
    m: 1,
    min: Math.min(hardMin(child), inner),
    max: Math.max(Math.min(hardMin(child), inner), Math.min(child.max ?? inner, inner))
  });
  const items = node.equal && children.length > 1
    ? [{
      role: "size",
      t: Math.min(inner, Math.max(...children.map(basis))),
      lo: WEIGHTS.preferred,
      hi: 0,
      m: children.length,
      min: Math.min(inner, Math.max(...children.map(hardMin))),
      max: Math.min(inner, ...children.map(c => c.max ?? inner))
    }]
    : children.map(itemVar);
  const gaps = children.slice(1).map(() => ({
    role: "gap",
    t: node.gap,
    lo: WEIGHTS.separation,
    hi: WEIGHTS.grouping * bondStrength(node.bond),
    m: 1,
    min: hardGap(node.gap),
    max: inner
  }));
  const free = [{ role: "free", t: 0, lo: 0, hi: anyFlexible ? FREE_SPACE_STIFFNESS : 0, m: 1, min: 0, max: inner }];
  return [...items, ...gaps, ...free];
};

// Expands a solution vector back into per-child sizes, gaps and free space.
export const unpack = (node, children, xs) => {
  const sizeCount = node.equal && children.length > 1 ? 1 : children.length;
  const sizes = sizeCount === 1 && children.length > 1 ? children.map(() => xs[0]) : xs.slice(0, sizeCount);
  const gaps = xs.slice(sizeCount, sizeCount + Math.max(0, children.length - 1));
  const free = xs[xs.length - 1];
  return { sizes, gaps, free };
};

export const pack = (node, children, sizes, gaps, free) => [
  ...(node.equal && children.length > 1 ? [sizes[0]] : sizes),
  ...gaps,
  free
];

// A child stacked alone in a column is stretched by the column's own
// semantics; stretching it is not a deviation, so it stores no energy.
export const lineEnergy = (node, children, inner, sizes, gaps, free, remPx) =>
  node.flow === "column"
    ? 0
    : energyOf(lineVariables(node, children, inner), pack(node, children, sizes, gaps, free), remPx);

export const boundaryEnergy = (node, clearance, remPx) => {
  const sides = ["top", "right", "bottom", "left"];
  return WEIGHTS.boundary * sides.reduce((e, s) => e + (clearance[s] - node.clearance[s]) ** 2, 0) / (remPx * remPx);
};

// Place free space: before the first end-anchored item, centered, or at the end.
export const placeFree = (node, children, gaps, free) => {
  const anchor = children.findIndex(c => c.anchorEnd);
  if (anchor > 0) return { lead: 0, gaps: gaps.map((g, i) => (i === anchor - 1 ? g + free : g)), slack: 0 };
  if (anchor === 0) return { lead: free, gaps, slack: 0 };
  if (node.align === "center" && children.length === 1) return { lead: free / 2, gaps, slack: free / 2 };
  if (node.align === "end" && children.length === 1) return { lead: free, gaps, slack: 0 };
  return { lead: 0, gaps, slack: free };
};
