import { HARD, SOLVER, WEIGHTS } from "./tokens.mjs";
import { diagnostic } from "./diagnostics.mjs";
import { layoutNode } from "./layout.mjs";
import { allPartitions, columnLine, greedyLines, innerWidth, lineFits, nearbyPartitions, scaledClearance, unsatisfiable } from "./lines.mjs";
import { boundaryEnergy, lineEnergy, lineVariables, placeFree, unpack } from "./springs.mjs";
import { relax } from "./relax.mjs";
import { arrangeRules } from "./rules.mjs";

// Arm D: the same relationships resolved by constrained energy minimization.
//
//   E(L) = wb*Eb + ws*Es + wg*Eg + wp*Ep + wa*Ea + wc*Ec
//
// Continuous part: for each line, sizes, separations and free space relax to
// the minimum of the spring energy (relax.mjs) under exact space conservation
// and hard floors. Boundary part: clearance relaxes between its hard floor
// and its target by golden-section search on the total energy (boundary
// repulsion versus pressure from the content). Discrete part: line breaks
// are chosen by comparing the total relaxed energy of candidate partitions,
// with compactness Ec = block size in rem. Required alignment (shared edges)
// is enforced as a hard constraint by the shared skeleton, so Ea is zero in
// every accepted layout.

const sum = values => values.reduce((a, b) => a + b, 0);
const PHI = (Math.sqrt(5) - 1) / 2;

const candidatesFor = (node, inner) => {
  if (node.flow === "column") return [node.children.map(c => [c])];
  if (node.flow === "row") return [[node.children], node.children.map(c => [c])];
  return node.children.length <= SOLVER.maxEnumerated
    ? allPartitions(node.children)
    : nearbyPartitions(greedyLines(node, inner));
};

const solveLine = (node, children, inner, ctx) => {
  if (node.flow === "column") {
    const line = columnLine(node, children[0], inner);
    return { ok: true, line, energy: lineEnergy(node, children, inner, [line.items[0].width], [], line.lead + line.slack, ctx.remPx), status: "converged", iterations: 0 };
  }
  if (!lineFits(node, children, inner)) return { ok: false };
  const vars = lineVariables(node, children, inner);
  const result = relax(vars, inner, ctx.remPx, ctx.limits.maxIterations);
  ctx.stats.evaluations += 1;
  ctx.stats.iterations += result.iterations;
  ctx.stats.maxIterations = Math.max(ctx.stats.maxIterations, result.iterations);
  if (result.status !== "converged") ctx.stats.unconverged += 1;
  const { sizes, gaps, free } = unpack(node, children, result.xs);
  const placed = placeFree(node, children, gaps, Math.max(0, free));
  return {
    ok: true,
    status: result.status,
    iterations: result.iterations,
    energy: result.energy,
    line: { items: children.map((child, i) => ({ child, width: sizes[i] })), gaps: placed.gaps, lead: placed.lead, slack: placed.slack }
  };
};

// Total energy of a partition at a clearance ratio, including the relaxed
// energy of each child subtree and the compactness of the result.
const evaluate = (node, width, partition, ratio, ctx) => {
  const clearance = scaledClearance(node, ratio);
  const inner = innerWidth(node, width, clearance);
  if (inner <= 0) return { score: Infinity };
  const solved = partition.map(children => solveLine(node, children, inner, ctx));
  if (solved.some(s => !s.ok)) return { score: Infinity };
  const heights = solved.map(s => Math.max(...s.line.items.map(({ child, width: w }) => layoutNode(child, w, ctx).h)));
  const childEnergy = sum(solved.flatMap(s => s.line.items.map(({ child, width: w }) => layoutNode(child, w, ctx).energy)));
  const blockSize = sum(heights) + node.gap * Math.max(0, heights.length - 1) + clearance.top + clearance.bottom;
  const relational = boundaryEnergy(node, clearance, ctx.remPx) + sum(solved.map(s => s.energy));
  const score = relational + childEnergy + WEIGHTS.compactness * blockSize / ctx.remPx;
  return { score, relational, clearance, inner, solved, ratio };
};

const golden = (f, low, high, steps) => {
  const loop = (a, b, c, d, fc, fd, k) => {
    if (k >= steps) return fc.score <= fd.score ? fc : fd;
    if (fc.score <= fd.score) {
      const next = d - PHI * (d - a);
      return loop(a, d, next, c, f(next), fc, k + 1);
    }
    const next = c + PHI * (b - c);
    return loop(c, b, d, next, fd, f(next), k + 1);
  };
  const c = high - PHI * (high - low);
  const d = low + PHI * (high - low);
  return loop(low, high, c, d, f(c), f(d), 0);
};

const best = results => results.reduce((a, b) => (b.score < a.score ? b : a), { score: Infinity });

export const arrangePhysics = (node, width, ctx) => {
  if (ctx.stats.evaluations > ctx.limits.maxEvaluations) {
    ctx.stats.aborted = true;
    const fallback = arrangeRules(node, width, ctx);
    return { ...fallback, diagnostics: [...fallback.diagnostics, diagnostic("excessive-computation", node.key, `evaluation budget ${ctx.limits.maxEvaluations} exhausted; deterministic rules used for this container`)] };
  }
  const hardRatio = HARD.clearanceRatio;
  const targetInner = innerWidth(node, width, scaledClearance(node, 1));
  const partitions = candidatesFor(node, targetInner);
  ctx.stats.candidates += partitions.length;
  const atTarget = partitions.map(p => evaluate(node, width, p, 1, ctx));
  const relaxedOnly = best(atTarget);
  // Clearance yields only under pressure: search when the best layout at
  // target clearance still stores energy, or nothing fits at target.
  const pressured = !Number.isFinite(relaxedOnly.score) || relaxedOnly.relational - boundaryEnergy(node, relaxedOnly.clearance, ctx.remPx) > 1e-6;
  const searched = pressured
    ? partitions
      .map((p, i) => ({ p, s: Number.isFinite(atTarget[i].score) ? atTarget[i].score : evaluate(node, width, p, hardRatio, ctx).score }))
      .filter(x => Number.isFinite(x.s))
      .sort((a, b) => a.s - b.s)
      .slice(0, 3)
      .flatMap(({ p }) => [evaluate(node, width, p, hardRatio, ctx), golden(r => evaluate(node, width, p, r, ctx), hardRatio, 1, ctx.limits.goldenSteps)])
    : [];
  const chosen = best([relaxedOnly, ...searched]);
  if (!Number.isFinite(chosen.score)) {
    // Nothing satisfies the hard floors: report, then fall back to the
    // deterministic stacking so geometry still exists and is flagged.
    const fallback = arrangeRules(node, width, ctx);
    return { ...fallback, diagnostics: [...fallback.diagnostics, ...unsatisfiable(node, innerWidth(node, width, scaledClearance(node, hardRatio))), diagnostic("unsatisfiable", node.key, "no line partition satisfies the hard constraints")] };
  }
  const solverIssues = chosen.solved
    .filter(s => s.status !== "converged")
    .map(s => diagnostic(s.status, node.key, `line relaxation ended as ${s.status} after ${s.iterations} iterations`));
  return {
    clearance: chosen.clearance,
    lines: chosen.solved.map(s => s.line),
    energy: chosen.relational,
    diagnostics: [...unsatisfiable(node, chosen.inner), ...solverIssues]
  };
};
