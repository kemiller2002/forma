#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Exploratory cross-phase comparison of a variant (extension 01) against a
// main-experiment arm: per-task means of each metric, paired by task, exact
// Wilcoxon signed-rank test and a seeded bootstrap CI of the mean difference.
// Different execution windows, no shared randomization: exploratory only.
// usage: compare-variant.mjs --variant-phase x1-full --variant X1 --base-phase full --base C

const here = path.dirname(fileURLToPath(import.meta.url));
const experiment = path.resolve(here, "..");
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; };

const load = phase => JSON.parse(fs.readFileSync(path.join(experiment, "results", phase, "analysis.json"), "utf8")).perAttempt;
const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
const METRICS = {
  firstDraftDefects: a => a.firstDraftDefects,
  finalDefects: a => a.finalDefects,
  heldoutDefects: a => a.heldout,
  accepted: a => (a.accepted ? 1 : 0),
  tokens: a => a.tokens,
  validationRuns: a => a.runs,
  decisions: a => a.decisions
};

// Exact two-sided Wilcoxon signed-rank p-value (zero differences dropped,
// average ranks for ties), by enumerating all sign assignments.
const wilcoxon = diffs => {
  const nz = diffs.filter(d => d !== 0);
  if (nz.length === 0) return { n: 0, p: 1 };
  const sorted = nz.map(d => Math.abs(d)).map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const ranks = new Array(nz.length);
  sorted.forEach((s, k) => {
    const same = sorted.filter(t => t.v === s.v).map(t => sorted.indexOf(t) + 1);
    ranks[s.i] = mean(same);
  });
  const wPlus = nz.reduce((acc, d, i) => acc + (d > 0 ? ranks[i] : 0), 0);
  const total = ranks.reduce((a, b) => a + b, 0);
  const centre = total / 2;
  const count = 2 ** nz.length;
  const extreme = Array.from({ length: count }, (_, mask) => ranks.reduce((acc, r, i) => acc + ((mask >> i) & 1 ? r : 0), 0))
    .filter(w => Math.abs(w - centre) >= Math.abs(wPlus - centre) - 1e-9).length;
  return { n: nz.length, wPlus, p: extreme / count };
};

const prng = s => () => {
  s = (s + 0x6D2B79F5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const bootstrap = (diffs, seed = 20261027, reps = 10000) => {
  const random = prng(seed);
  const means = Array.from({ length: reps }, () => mean(diffs.map(() => diffs[Math.floor(random() * diffs.length)]))).sort((a, b) => a - b);
  return [means[Math.floor(reps * 0.025)], means[Math.floor(reps * 0.975)]];
};

const variantPhase = arg("--variant-phase", "x1-full");
const variant = arg("--variant", "X1");
const basePhase = arg("--base-phase", "full");
const base = arg("--base", "C");
const left = load(variantPhase).filter(a => a.arm === variant);
const right = load(basePhase).filter(a => a.arm === base);
const tasks = [...new Set(left.map(a => a.task))].filter(t => right.some(a => a.task === t)).sort();
const taskMean = (rows, task, f) => mean(rows.filter(a => a.task === task).map(f));

const comparisons = Object.entries(METRICS).map(([metric, f]) => {
  const diffs = tasks.map(t => taskMean(left, t, f) - taskMean(right, t, f));
  return { comparison: `${variant} − ${base}`, metric, tasks: tasks.length, variantMean: mean(left.map(f)), baseMean: mean(right.map(f)), meanDifference: mean(diffs), bootstrap95: bootstrap(diffs), wilcoxon: wilcoxon(diffs) };
});
const out = { variantPhase, variant, basePhase, base, note: "Exploratory: different execution windows and no shared randomization.", comparisons };
const file = path.join(experiment, "results", variantPhase, `compare-${variant}-vs-${base}.json`);
fs.writeFileSync(file, JSON.stringify(out, null, 1));
const f2 = v => (Number.isFinite(v) ? v.toFixed(2) : "—");
console.log(["| Metric | " + variant + " | " + base + " | Mean diff (task-paired) | 95% bootstrap CI | Wilcoxon p |", "|---|---:|---:|---:|---|---:|",
  ...comparisons.map(c => `| ${c.metric} | ${f2(c.variantMean)} | ${f2(c.baseMean)} | ${f2(c.meanDifference)} | [${f2(c.bootstrap95[0])}, ${f2(c.bootstrap95[1])}] | ${c.wilcoxon.p.toFixed(3)} |`)].join("\n"));
