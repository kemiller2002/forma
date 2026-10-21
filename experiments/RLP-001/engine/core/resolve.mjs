import { SOLVER, WEIGHTS, HARD } from "./tokens.mjs";
import { normalize } from "./model.mjs";
import { collectDiagnostics, flatten, layoutNode, round, verify } from "./layout.mjs";
import { arrangeRules } from "./rules.mjs";
import { arrangePhysics } from "./physics.mjs";
import { statusOf } from "./diagnostics.mjs";

// Entry point shared by both arms. Pure apart from the injected measurement
// functions: identical inputs give identical geometry.

export const ARMS = Object.freeze({ rules: arrangeRules, physics: arrangePhysics });

const dedupe = diagnostics => [...new Map(diagnostics.map(d => [`${d.code}|${d.node}|${d.detail}`, d])).values()];

export const resolve = (arm, raw, rootWidth, { remPx = 16, now = () => 0, limits = {} } = {}) => {
  const arrange = ARMS[arm];
  if (!arrange) throw new TypeError(`unknown resolver arm "${arm}"`);
  const { node, diagnostics: modelIssues } = normalize(raw, remPx);
  const heights = new Map();
  const stats = { arm, lines: 0, candidates: 0, evaluations: 0, iterations: 0, maxIterations: 0, unconverged: 0, measureCalls: 0, aborted: false };
  const ctx = {
    arrange,
    remPx,
    limits: { ...SOLVER, ...limits },
    memo: new Map(),
    stats,
    heightAt: (leaf, width) => {
      const key = `${leaf.key}|${round(width)}`;
      if (!heights.has(key)) {
        stats.measureCalls += 1;
        heights.set(key, leaf.measure ? leaf.measure.heightAt(round(width)) : 0);
      }
      return heights.get(key);
    }
  };
  const started = now();
  const box = Number.isFinite(rootWidth) && rootWidth > 0
    ? layoutNode(node, rootWidth, ctx)
    : undefined;
  const elapsed = now() - started;
  const diagnostics = dedupe(box
    ? [...modelIssues, ...collectDiagnostics(box), ...verify(box, node)]
    : [...modelIssues, { code: "invalid-dimension", severity: "error", node: node.key, detail: `root inline size ${rootWidth} is not positive and finite` }]);
  return {
    arm,
    status: statusOf(diagnostics),
    rootWidth,
    blockSize: box ? round(box.h) : 0,
    energy: box ? box.energy : Infinity,
    geometry: box ? flatten(box) : [],
    diagnostics,
    stats: { ...stats, solveMs: elapsed, memoEntries: ctx.memo.size },
    config: { solver: ctx.limits, weights: WEIGHTS, hard: HARD, initialConditions: "rest lengths projected onto the feasible set", termination: "KKT optimality residual < tolerancePx, or maxIterations, or oscillationWindow consecutive energy rises" }
  };
};
