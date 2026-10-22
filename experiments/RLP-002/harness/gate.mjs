#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Stage 1 gate assessment for one ruleset run, computed from the per-page
// records written by stage1.mjs. Writes results/stage-1/<ruleset>/gate.json.
// usage: gate.mjs --ruleset E1

const here = path.dirname(fileURLToPath(import.meta.url));
const rlp2 = path.resolve(here, "..");
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; };
const ruleset = arg("--ruleset", "E1");
const dir = path.join(rlp2, "results", "stage-1", ruleset);
const pages = fs.readdirSync(path.join(dir, "pages")).sort().map(f => JSON.parse(fs.readFileSync(path.join(dir, "pages", f), "utf8")));
const run = JSON.parse(fs.readFileSync(path.join(dir, "run.json"), "utf8"));
const field = (k, i) => k.split("|")[i];
const invariant = k => field(k, 3);
const count = (xs, f) => xs.reduce((acc, x) => ({ ...acc, [f(x)]: (acc[f(x)] ?? 0) + 1 }), {});
const compilerLines = fs.readdirSync(path.join(rlp2, "compiler")).filter(f => f.endsWith(".fs"))
  .reduce((n, f) => n + fs.readFileSync(path.join(rlp2, "compiler", f), "utf8").split("\n").length, 0);

const supported = pages.filter(p => p.compileStatus === "exact");
const others = pages.filter(p => p.compileStatus !== "exact");
const newOn = ps => ps.flatMap(p => p.newInstances);
const conditions = [
  { id: "compiles", rule: "every supported page compiles", pass: pages.every(p => p.compileStatus), detail: `${pages.length} compiled; ${supported.length} exact, ${others.length} approximated or unsupported` },
  { id: "no-new-hard-defects", rule: "no new hard-invariant defect on any supported page", pass: newOn(supported).filter(k => invariant(k) !== "accessibility").length === 0, detail: `${newOn(supported).length} new on supported pages; ${newOn(others).length} new on other pages` },
  { id: "no-new-accessibility", rule: "no new axe violation on any page", pass: newOn(pages).filter(k => invariant(k) === "accessibility").length === 0, detail: `${newOn(pages).filter(k => invariant(k) === "accessibility").length} new` },
  { id: "no-layout-runtime", rule: "no script element, no script or WASM request, identical geometry with JavaScript disabled", pass: pages.every(p => p.candidate.scriptElements === 0 && p.candidate.scriptRequests === 0 && p.candidate.jsDisabledMaxDeltaPx <= 0.5), detail: `max geometry delta ${Math.max(...pages.map(p => p.candidate.jsDisabledMaxDeltaPx))}px` },
  { id: "deterministic", rule: "identical output from two compilations", pass: pages.every(p => p.deterministic), detail: `${pages.filter(p => p.deterministic).length}/${pages.length}` },
  { id: "no-added-shift", rule: "no added unexpected-shift on any page", pass: newOn(pages).filter(k => invariant(k) === "unexpected-shift").length === 0, detail: `${newOn(pages).filter(k => invariant(k) === "unexpected-shift").length} new instances on ${pages.filter(p => p.newInstances.some(k => invariant(k) === "unexpected-shift")).length} pages` },
  { id: "unsupported-documented", rule: "every approximated or unsupported relationship is reported by the compiler", pass: others.every(p => p.findings.length > 0), detail: `${pages.flatMap(p => p.findings).length} findings` },
  { id: "practical-scope", rule: "compiler <= 600 lines, stylesheet <= 16 KB, build <= 2 s per page", pass: compilerLines <= 600 && run.stylesheetBytes <= 16384 && run.compileMsTotal / run.compileJobs <= 2000, detail: `${compilerLines} lines, ${run.stylesheetBytes} B, ${(run.compileMsTotal / run.compileJobs).toFixed(0)} ms per page (batch, incl. startup)` }
];
const out = {
  ruleset,
  passed: conditions.every(c => c.pass),
  conditions,
  pages: { total: pages.length, byStatus: count(pages, p => p.compileStatus), withNewDefects: pages.filter(p => p.newInstances.length).length },
  newInstancesByInvariant: count(newOn(pages), invariant),
  newInstancesByStatus: { exact: newOn(supported).length, other: newOn(others).length },
  resolvedInstances: pages.reduce((n, p) => n + p.resolvedInstances.length, 0),
  findingsByFeature: count(pages.flatMap(p => p.findings), f => `${f.feature}: ${f.status}`),
  bytes: { stylesheet: run.stylesheetBytes, meanAddedPerPage: pages.reduce((n, p) => n + p.compiledBytes - p.sourceBytes, 0) / pages.length },
  stableMs: { cMedian: median(pages.map(p => p.c.stableMs)), candidateMedian: median(pages.map(p => p.candidate.stableMs)) },
  perPage: pages.map(p => ({ id: p.attemptId, task: p.taskId, status: p.compileStatus, c: p.c.instances, candidate: p.candidate.instances, new: p.newInstances.length, resolved: p.resolvedInstances.length, newByInvariant: count(p.newInstances, invariant) }))
};
function median(xs) { const s = [...xs].sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; }
fs.writeFileSync(path.join(dir, "gate.json"), JSON.stringify(out, null, 1) + "\n");
console.log(JSON.stringify({ ruleset, passed: out.passed, conditions: conditions.map(c => `${c.pass ? "PASS" : "FAIL"} ${c.id}: ${c.detail}`), newInstancesByInvariant: out.newInstancesByInvariant, findingsByFeature: out.findingsByFeature, bytes: out.bytes, stableMs: out.stableMs }, null, 1));
