#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Pre-registered analysis (EX-FORMA-2026-0001). Reads results/<phase>/attempts
// and writes results/<phase>/analysis.json and analysis.md.
// usage: analyze.mjs --phase pilot|full

const here = path.dirname(fileURLToPath(import.meta.url));
const experiment = path.resolve(here, "..");
const phase = process.argv[process.argv.indexOf("--phase") + 1];
const dir = path.join(experiment, "results", phase);
const attempts = fs.readdirSync(path.join(dir, "attempts")).filter(f => f.endsWith(".json"))
  .map(f => JSON.parse(fs.readFileSync(path.join(dir, "attempts", f), "utf8")))
  .sort((a, b) => a.executionOrder - b.executionOrder);

const ARMS = ["A", "B", "C", "D"];
const sum = xs => xs.reduce((a, b) => a + b, 0);
const mean = xs => (xs.length ? sum(xs) / xs.length : null);
const quantile = (xs, q) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  return s[lo] + (s[Math.min(lo + 1, s.length - 1)] - s[lo]) * (pos - lo);
};
const sd = xs => (xs.length > 1 ? Math.sqrt(sum(xs.map(x => (x - mean(xs)) ** 2)) / (xs.length - 1)) : null);
const describe = xs => {
  const v = xs.filter(x => x !== null && x !== undefined && Number.isFinite(x));
  return { n: v.length, unavailable: xs.length - v.length, mean: mean(v), median: quantile(v, 0.5), sd: sd(v), q1: quantile(v, 0.25), q3: quantile(v, 0.75), min: v.length ? Math.min(...v) : null, max: v.length ? Math.max(...v) : null };
};

const METRICS = {
  firstDraftDefects: a => a.firstDraft.standardDistinct,
  firstDraftGeometryDefects: a => a.firstDraft.geometryDistinct,
  firstDraftAccessibilityDefects: a => a.firstDraft.accessibilityDistinct,
  finalDefects: a => a.final.standardDistinct,
  finalHeldoutDefects: a => a.final.heldoutDistinct,
  finalDynamicDefects: a => a.final.dynamicDistinct,
  unexpectedShift: a => a.final.unexpectedShift,
  accepted: a => (a.final.accepted ? 1 : 0),
  totalTokens: a => a.agent.totalTokens ?? null,
  outputTokens: a => a.agent.outputTokens ?? null,
  inputTokens: a => a.agent.inputTokens ?? null,
  toolCalls: a => a.agent.toolCalls ?? null,
  durationMs: a => a.agent.durationMs ?? null,
  validationRuns: a => a.agent.validationRuns,
  repairIterations: a => a.agent.repairIterations,
  decisionsTotal: a => a.decisions.total,
  decisionsExplicit: a => a.decisions.explicit,
  decisionsDerived: a => a.decisions.derived,
  decisionsCorrective: a => a.decisions.corrective,
  decisionsUncertain: a => a.decisions.uncertain,
  rawStatements: a => a.decisions.rawStatements.explicit + a.decisions.rawStatements.uncertain
};

// Deterministic PRNG for the bootstrap.
const prng = s => () => {
  s = (s + 0x6D2B79F5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const tasks = [...new Set(attempts.map(a => a.taskId))].sort();
const cell = (task, arm, metric) => mean(attempts.filter(a => a.taskId === task && a.arm === arm).map(METRICS[metric]).filter(v => v !== null && Number.isFinite(v)));

// Cluster bootstrap over tasks of the mean paired difference.
const bootstrap = (diffs, seed = 20261021, n = 10000) => {
  if (diffs.length < 2) return null;
  const random = prng(seed);
  const means = Array.from({ length: n }, () => mean(Array.from({ length: diffs.length }, () => diffs[Math.floor(random() * diffs.length)])));
  return [quantile(means, 0.025), quantile(means, 0.975)];
};

// Exact two-sided Wilcoxon signed-rank (zeros dropped, ties averaged).
const wilcoxon = diffs => {
  const d = diffs.filter(x => x !== 0);
  if (d.length === 0) return { n: 0, W: 0, p: 1 };
  const order = d.map((x, i) => ({ a: Math.abs(x), i })).sort((x, y) => x.a - y.a);
  const ranks = new Array(d.length);
  order.forEach((o, k) => {
    const tied = order.filter(p => p.a === o.a).map(p => order.indexOf(p) + 1);
    ranks[o.i] = mean(tied);
  });
  const wPlus = sum(d.map((x, i) => (x > 0 ? ranks[i] : 0)));
  const total = sum(ranks);
  const expected = total / 2;
  const observed = Math.abs(wPlus - expected);
  const count = 1 << d.length;
  const extreme = Array.from({ length: count }, (_, mask) => sum(ranks.map((r, i) => ((mask >> i) & 1 ? r : 0))))
    .filter(w => Math.abs(w - expected) >= observed - 1e-9).length;
  return { n: d.length, W: wPlus, p: extreme / count };
};

const cliffsDelta = (xs, ys) => {
  if (!xs.length || !ys.length) return null;
  const pairs = xs.flatMap(x => ys.map(y => Math.sign(x - y)));
  return mean(pairs);
};

const holm = ps => {
  const order = ps.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p);
  const adjusted = new Array(ps.length);
  order.reduce((running, o, k) => {
    const value = Math.min(1, Math.max(running, o.p * (ps.length - k)));
    adjusted[o.i] = value;
    return value;
  }, 0);
  return adjusted;
};

const compare = (x, y, metric) => {
  const rows = tasks.map(t => ({ task: t, x: cell(t, x, metric), y: cell(t, y, metric) })).filter(r => r.x !== null && r.y !== null);
  const diffs = rows.map(r => r.x - r.y);
  const values = arm => attempts.filter(a => a.arm === arm).map(METRICS[metric]).filter(v => v !== null && Number.isFinite(v));
  return {
    comparison: `${x} − ${y}`,
    metric,
    tasks: rows.length,
    meanDifference: mean(diffs),
    medianDifference: quantile(diffs, 0.5),
    bootstrap95: bootstrap(diffs),
    wilcoxon: wilcoxon(diffs),
    cliffsDelta: cliffsDelta(values(x), values(y)),
    perTask: rows
  };
};

const ranks = xs => {
  const order = xs.map((x, i) => ({ x, i })).sort((a, b) => a.x - b.x);
  const out = new Array(xs.length);
  order.forEach(o => { out[o.i] = mean(order.map((p, k) => (p.x === o.x ? k + 1 : null)).filter(v => v !== null)); });
  return out;
};
const spearman = (xs, ys) => {
  const pairs = xs.map((x, i) => [x, ys[i]]).filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
  if (pairs.length < 3) return null;
  const rx = ranks(pairs.map(p => p[0]));
  const ry = ranks(pairs.map(p => p[1]));
  const mx = mean(rx);
  const my = mean(ry);
  const cov = sum(rx.map((r, i) => (r - mx) * (ry[i] - my)));
  const den = Math.sqrt(sum(rx.map(r => (r - mx) ** 2)) * sum(ry.map(r => (r - my) ** 2)));
  return den ? { rho: cov / den, n: pairs.length } : null;
};

const engineStats = arm => {
  const entries = attempts.filter(a => a.arm === arm).flatMap(a => (a.final.engine ?? []).map(e => ({ task: a.taskId, viewport: e.viewport, ...(e.last?.[0] ?? {}), status: e.status, codes: (e.diagnostics ?? []).map(d => d.code) })));
  const solve = entries.map(e => e.stats?.solveMs).filter(Number.isFinite);
  const total = entries.map(e => e.totalMs).filter(Number.isFinite);
  return {
    resolves: entries.length,
    solveMs: describe(solve),
    solveP95: quantile(solve, 0.95),
    totalMsP95: quantile(total, 0.95),
    iterations: describe(entries.map(e => e.stats?.iterations).filter(Number.isFinite)),
    measureCalls: describe(entries.map(e => e.stats?.measureCalls).filter(Number.isFinite)),
    invalidStatus: entries.filter(e => e.status !== "valid").length,
    convergenceFailures: entries.filter(e => e.codes.some(c => ["non-convergence", "oscillation", "excessive-computation"].includes(c))).length,
    diagnosticCodes: entries.flatMap(e => e.codes).reduce((acc, c) => ({ ...acc, [c]: (acc[c] ?? 0) + 1 }), {})
  };
};

const perArm = Object.fromEntries(ARMS.map(arm => {
  const list = attempts.filter(a => a.arm === arm);
  const accepted = list.filter(a => a.final.accepted).length;
  const tokens = list.map(a => a.agent.totalTokens).filter(Number.isFinite);
  return [arm, {
    attempts: list.length,
    accepted,
    acceptanceRate: list.length ? accepted / list.length : null,
    tokensPerAccepted: accepted ? sum(tokens) / accepted : null,
    decisionsPerAccepted: accepted ? sum(list.map(a => a.decisions.total)) / accepted : null,
    metrics: Object.fromEntries(Object.keys(METRICS).map(m => [m, describe(list.map(METRICS[m]))])),
    decisionCategories: ["explicit", "derived", "corrective"].reduce((acc, kind) => ({
      ...acc,
      [kind]: Object.fromEntries(Object.keys(list[0]?.decisions.byCategory[kind] ?? {}).map(c => [c, mean(list.map(a => a.decisions.byCategory[kind][c]))]))
    }), {}),
    engine: arm === "C" || arm === "D" ? engineStats(arm) : null
  }];
}));

const PRIMARY = compare("A", "D", "firstDraftDefects");
const mechanismMetrics = ["firstDraftDefects", "finalDefects", "finalHeldoutDefects", "totalTokens", "decisionsTotal", "repairIterations"];
const mechanisms = mechanismMetrics.flatMap(metric => {
  const set = [["A", "B"], ["B", "C"], ["C", "D"]].map(([x, y]) => compare(x, y, metric));
  const adjusted = holm(set.map(s => s.wilcoxon.p));
  return set.map((s, i) => ({ ...s, holmP: adjusted[i] }));
});
const secondary = ["totalTokens", "decisionsTotal", "repairIterations", "finalHeldoutDefects", "finalDefects"].map(m => compare("A", "D", m));

const series = name => attempts.map(METRICS[name]);
const correlations = Object.fromEntries([
  ["decisions~tokens", ["decisionsTotal", "totalTokens"]],
  ["decisions~firstDraftDefects", ["decisionsTotal", "firstDraftDefects"]],
  ["decisions~repairIterations", ["decisionsTotal", "repairIterations"]],
  ["tokens~repairIterations", ["totalTokens", "repairIterations"]],
  ["firstDraftDefects~repairIterations", ["firstDraftDefects", "repairIterations"]],
  ["decisions~finalDefects", ["decisionsTotal", "finalDefects"]]
].map(([k, [a, b]]) => [k, spearman(series(a), series(b))]));

const compliance = attempts.map(a => ({ attempt: a.attemptId, arm: a.arm, task: a.taskId, leakage: a.compliance.leakage.length, ownScripts: a.compliance.ownScripts.length, models: a.agent.models, neverValidated: a.agent.neverValidated, reported: a.agent.reportedResult }));

const analysis = {
  experiment: "RLP-001",
  phase,
  generatedAt: new Date().toISOString(),
  attempts: attempts.length,
  tasks,
  note: phase === "pilot" ? "Pilot: one attempt per cell; descriptive only, no inferential claims." : "Confirmatory: A − D first-draft defects. Everything else exploratory.",
  perArm,
  primary: PRIMARY,
  secondary,
  mechanisms,
  correlations,
  compliance,
  perAttempt: attempts.map(a => ({
    order: a.executionOrder, attempt: a.attemptId, task: a.taskId, arm: a.arm, rep: a.repetition,
    firstDraftDefects: a.firstDraft.standardDistinct, finalDefects: a.final.standardDistinct, heldout: a.final.heldoutDistinct,
    accepted: a.final.accepted, runs: a.agent.validationRuns, tokens: a.agent.totalTokens, output: a.agent.outputTokens, tools: a.agent.toolCalls,
    durationMs: a.agent.durationMs, decisions: a.decisions.total, derived: a.decisions.derived, corrective: a.decisions.corrective, uncertain: a.decisions.uncertain,
    finalByInvariant: a.final.standardByInvariant, heldoutByInvariant: a.final.heldoutByInvariant
  }))
};
fs.writeFileSync(path.join(dir, "analysis.json"), JSON.stringify(analysis, null, 1));

const f = (v, d = 1) => (v === null || v === undefined || !Number.isFinite(v) ? "—" : Number(v).toFixed(d));
const row = (cells) => `| ${cells.join(" | ")} |`;
const md = [
  `# RLP-001 ${phase} analysis`,
  "",
  analysis.note,
  "",
  `Attempts: ${attempts.length}. Tasks: ${tasks.join(", ")}.`,
  "",
  "## Per arm (mean [median])",
  "",
  row(["Measure", ...ARMS]),
  row(["---", ...ARMS.map(() => "---:")]),
  ...Object.keys(METRICS).map(m => row([m, ...ARMS.map(a => `${f(perArm[a].metrics[m].mean)} [${f(perArm[a].metrics[m].median)}]`)])),
  row(["acceptance rate", ...ARMS.map(a => f(perArm[a].acceptanceRate, 2))]),
  row(["tokens per accepted interface", ...ARMS.map(a => f(perArm[a].tokensPerAccepted, 0))]),
  row(["decisions per accepted interface", ...ARMS.map(a => f(perArm[a].decisionsPerAccepted, 1))]),
  "",
  "## Paired task-level comparisons",
  "",
  row(["Comparison", "Metric", "Tasks", "Mean diff", "95% bootstrap CI", "Wilcoxon p", "Holm p", "Cliff's δ"]),
  row(["---", "---", "---:", "---:", "---", "---:", "---:", "---:"]),
  ...[PRIMARY, ...secondary, ...mechanisms].map(c => row([c.comparison, c.metric, c.tasks, f(c.meanDifference, 2), c.bootstrap95 ? `[${f(c.bootstrap95[0], 2)}, ${f(c.bootstrap95[1], 2)}]` : "—", f(c.wilcoxon.p, 3), f(c.holmP, 3), f(c.cliffsDelta, 2)])),
  "",
  "## Engine runtime (final pages, all viewports)",
  "",
  row(["Arm", "Resolves", "Solve ms median", "Solve ms p95", "Total ms p95", "Iterations median", "Invalid status", "Convergence failures"]),
  row(["---", "---:", "---:", "---:", "---:", "---:", "---:", "---:"]),
  ...["C", "D"].map(a => perArm[a].engine).map((e, i) => (e ? row([["C", "D"][i], e.resolves, f(e.solveMs.median, 1), f(e.solveP95, 1), f(e.totalMsP95, 1), f(e.iterations.median, 0), e.invalidStatus, e.convergenceFailures]) : "")),
  "",
  "## Correlations (Spearman, attempt level, exploratory)",
  "",
  ...Object.entries(correlations).map(([k, v]) => `- ${k}: ${v ? `ρ = ${f(v.rho, 2)} (n = ${v.n})` : "—"}`),
  ""
].join("\n");
fs.writeFileSync(path.join(dir, "analysis.md"), md);
console.log(md);
