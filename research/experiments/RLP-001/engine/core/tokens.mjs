// Relational vocabulary values. Lengths are rem so geometry follows user font
// size; the scale reuses Forma's spacing steps (tokens/echelon.tokens.json).

export const BOND = Object.freeze({ tight: 0.5, related: 1, loose: 1.5, section: 2 });
export const CLEARANCE = Object.freeze({ none: 0, inset: 0.75, surface: 1.25, spacious: 2 });

// Hard floors shared by every resolver. A soft target may compress toward
// these under pressure; it may never go below them.
export const HARD = Object.freeze({
  clearanceRatio: 0.5,   // clearance never below half its target
  gapRatio: 0.5,         // sibling separation never below half its target
  gapFloorPx: 4,         // and never below 4 CSS px
  targetPx: 24,          // WCAG 2.2 2.5.8 minimum interactive target
  controlMinRem: 6       // usable minimum inline size of a text control
});

export const DEFAULTS = Object.freeze({
  bond: "related",
  containerClearance: "surface",
  flow: "column"
});

// Physics solver weights (Arm D). Frozen before held-out evaluation; see
// research/experiments/RLP-001/docs/ENGINE.md.
export const WEIGHTS = Object.freeze({
  boundary: 1,      // wb: clearance deviation from target
  separation: 4,    // ws: sibling repulsion below target separation
  grouping: 2,      // wg: attraction above target separation, scaled by bond
  alignment: 10,    // wa: shared-edge deviation (required edges are also hard)
  preferred: 1,     // wp: deviation from preferred inline size
  compactness: 0.5  // wc: block-size cost of an arrangement, per rem
});

export const SOLVER = Object.freeze({
  maxIterations: 1000,     // projected-gradient iterations per line
  tolerancePx: 0.01,       // convergence: KKT optimality residual, CSS px
  bisectionSteps: 64,      // projection multiplier search
  goldenSteps: 14,         // clearance equilibrium search
  maxEvaluations: 60000,   // total line solves per resolve before abort
  maxEnumerated: 8,        // enumerate all line partitions up to this many children
  oscillationWindow: 3,    // consecutive energy increases that count as oscillation
  roundingPx: 1 / 64       // browser layout unit
});

export const bondStrength = bond => ({ tight: 4, related: 2, loose: 1, section: 0.5 })[bond] ?? 2;
