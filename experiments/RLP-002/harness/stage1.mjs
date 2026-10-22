#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { capture, launch, serve, settle } from "../../RLP-001/harness/browser.mjs";
import { defectKey, evaluatePage } from "../../RLP-001/harness/evaluate.mjs";
import { TASKS } from "../../RLP-001/tasks/tasks.mjs";

// Stage 1: deterministic replay. Every RLP-001 Arm C final page is compiled
// with a ruleset (E1, F1) and scored with the unchanged RLP-001 harness in full
// mode; the C reference is re-scored from its original workspace in the same
// pass. Writes results/stage-1/<ruleset>/ (per-page records, compiled pages,
// compiler reports) and results/stage-1/C/ (re-scored reference).
// usage: stage1.mjs --ruleset E1 [--parallel 4] [--only id,id]

const here = path.dirname(fileURLToPath(import.meta.url));
const rlp2 = path.resolve(here, "..");
const rlp1 = path.resolve(rlp2, "../RLP-001");
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; };
const ruleset = arg("--ruleset", "E1");
const parallel = Number(arg("--parallel", "4"));
const only = arg("--only")?.split(",");
const runs = path.resolve(arg("--runs", "/home/user/rlp2-runs/stage-1"));
const bin = path.join(path.dirname(runs), "rlc-bin");
const out = path.join(rlp2, "results", "stage-1");

const sha = text => crypto.createHash("sha256").update(text).digest("hex");
const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 1) + "\n"); };

export const buildCompiler = () => {
  execFileSync("dotnet", ["build", path.join(rlp2, "compiler", "Rlc.fsproj"), "-c", "Release", "-o", bin, "-nologo", "-v", "q"], { stdio: "inherit", env: { ...process.env, DOTNET_CLI_TELEMETRY_OPTOUT: "1", DOTNET_NOLOGO: "1" } });
  return path.join(bin, "rlc.dll");
};

export const compileAll = (dll, jobs) => {
  const file = path.join(runs, `jobs-${process.pid}.tsv`);
  fs.mkdirSync(runs, { recursive: true });
  fs.writeFileSync(file, jobs.map(j => [j.input, j.output, j.report, j.href].join("\t")).join("\n") + "\n");
  const started = process.hrtime.bigint();
  execFileSync("dotnet", [dll, "batch", file], { stdio: "inherit" });
  return Number(process.hrtime.bigint() - started) / 1e6;
};

// Workspace for a compiled page: the page, shared assets and the ruleset.
const pageDir = (id, rs, compiledFile) => {
  const dir = path.join(runs, id, rs);
  fs.mkdirSync(path.join(dir, "assets", "rlc"), { recursive: true });
  fs.copyFileSync(path.join(rlp1, "arms", "base.css"), path.join(dir, "assets", "base.css"));
  fs.copyFileSync(path.join(rlp1, "assets", "placeholder.svg"), path.join(dir, "assets", "placeholder.svg"));
  fs.copyFileSync(path.join(rlp2, "compiler", "rulesets", `${rs}.css`), path.join(dir, "assets", "rlc", `${rs}.css`));
  fs.copyFileSync(compiledFile, path.join(dir, "index.html"));
  return dir;
};

const summarize = failures => {
  const instances = [...new Set(failures.map(defectKey))].sort();
  return {
    instances,
    distinct: [...new Set(failures.map(f => `${f.invariant}|${f.element}`))].sort(),
    byInvariant: failures.reduce((acc, f) => ({ ...acc, [f.invariant]: (acc[f.invariant] ?? 0) + 1 }), {})
  };
};

// Static and runtime audits of a compiled page: script elements, script or
// WASM requests, and geometry with JavaScript disabled vs enabled.
const audit = async (browser, dir, html) => {
  const server = await serve(dir);
  try {
    const shot = async js => {
      const context = await browser.newContext({ viewport: { width: 1024, height: 900 }, javaScriptEnabled: js });
      const page = await context.newPage();
      const requests = [];
      page.on("request", r => requests.push(r.url()));
      const t0 = Date.now();
      await page.goto(`${server.url}/index.html`, { waitUntil: "load" });
      if (js) await settle(page);
      const stableMs = Date.now() - t0;
      const snap = await capture(page);
      await context.close();
      return { snap, requests, stableMs };
    };
    const on = await shot(true);
    const off = await shot(false);
    const boxes = s => Object.fromEntries(s.elements.map(e => [e.id, e.box]));
    const a = boxes(on.snap);
    const b = boxes(off.snap);
    const maxDelta = Math.max(0, ...Object.keys(a).map(k => Math.max(...["x", "y", "w", "h"].map(p => Math.abs((a[k]?.[p] ?? 0) - (b[k]?.[p] ?? 0))))));
    return {
      scriptElements: (html.match(/<script\b/gi) ?? []).length,
      scriptRequests: on.requests.filter(u => /\.(m?js|wasm)(\?|$)/.test(u)).length,
      jsDisabledMaxDeltaPx: maxDelta,
      stableMs: on.stableMs
    };
  } finally { await server.close(); }
};

const runC = async (browser, entry, task) => {
  const file = path.join(out, "C", `${entry.attemptId}.json`);
  if (fs.existsSync(file)) return readJson(file);
  const ws = entry.workspace;
  const archived = fs.readFileSync(path.join(rlp1, "results", "full", "artifacts", entry.attemptId, "final.html"), "utf8");
  const live = fs.readFileSync(path.join(ws, "index.html"), "utf8");
  const result = await evaluatePage({ browser, dir: ws, task, mode: "full" });
  const server = await serve(ws);
  const timing = await (async () => {
    const context = await browser.newContext({ viewport: { width: 1024, height: 900 } });
    const page = await context.newPage();
    const t0 = Date.now();
    await page.goto(`${server.url}/index.html`, { waitUntil: "load" });
    await settle(page);
    const stableMs = Date.now() - t0;
    const snap = await capture(page);
    await context.close();
    await server.close();
    return { stableMs, engine: snap.engine?.last?.[0] ?? null };
  })();
  const record = { attemptId: entry.attemptId, taskId: entry.taskId, repetition: entry.repetition, sourceSha: sha(archived), workspaceMatchesArtifact: sha(live) === sha(archived), settledEverywhere: result.settledEverywhere, ...summarize(result.failures), timing };
  writeJson(file, record);
  return record;
};

const runCandidate = async (browser, entry, task, compiledFile, report) => {
  const html = fs.readFileSync(compiledFile, "utf8");
  const dir = pageDir(entry.attemptId, ruleset, compiledFile);
  const result = await evaluatePage({ browser, dir, task, mode: "full" });
  return { settledEverywhere: result.settledEverywhere, ...summarize(result.failures), audit: await audit(browser, dir, html), compiler: report };
};

const main = async () => {
  const manifest = readJson(path.join(rlp1, "results", "full", "manifest.json"));
  const entries = manifest.attempts.filter(a => a.arm === "C" && (!only || only.includes(a.attemptId)));
  const dll = buildCompiler();
  const href = `assets/rlc/${ruleset}.css`;
  const compiledDir = path.join(out, ruleset, "compiled");
  const tmpDir = path.join(runs, "_determinism", ruleset);
  const jobs = entries.flatMap(e => {
    const input = path.join(rlp1, "results", "full", "artifacts", e.attemptId, "final.html");
    return [
      { input, output: path.join(compiledDir, `${e.attemptId}.html`), report: path.join(compiledDir, `${e.attemptId}.report.json`), href },
      { input, output: path.join(tmpDir, `${e.attemptId}.html`), report: path.join(tmpDir, `${e.attemptId}.report.json`), href }
    ];
  });
  fs.mkdirSync(compiledDir, { recursive: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  const compileMs = compileAll(dll, jobs);
  const browser = await launch();
  const one = async entry => {
    const task = TASKS.find(t => t.id === entry.taskId);
    const compiledFile = path.join(compiledDir, `${entry.attemptId}.html`);
    const report = readJson(path.join(compiledDir, `${entry.attemptId}.report.json`));
    const deterministic = sha(fs.readFileSync(compiledFile, "utf8")) === sha(fs.readFileSync(path.join(tmpDir, `${entry.attemptId}.html`), "utf8"));
    const c = await runC(browser, entry, task);
    const cand = await runCandidate(browser, entry, task, compiledFile, report);
    const cSet = new Set(c.instances);
    const cDistinct = new Set(c.distinct);
    const newInstances = cand.instances.filter(k => !cSet.has(k));
    const record = {
      attemptId: entry.attemptId, taskId: entry.taskId, repetition: entry.repetition, ruleset,
      compileStatus: report.status, deterministic,
      sourceBytes: fs.statSync(path.join(rlp1, "results", "full", "artifacts", entry.attemptId, "final.html")).size,
      compiledBytes: fs.statSync(compiledFile).size,
      c: { instances: c.instances.length, distinct: c.distinct.length, byInvariant: c.byInvariant, stableMs: c.timing.stableMs, engineMs: c.timing.engine?.totalMs ?? null },
      candidate: { instances: cand.instances.length, distinct: cand.distinct.length, byInvariant: cand.byInvariant, settledEverywhere: cand.settledEverywhere, ...cand.audit },
      newInstances,
      newDistinct: cand.distinct.filter(k => !cDistinct.has(k)),
      resolvedInstances: c.instances.filter(k => !new Set(cand.instances).has(k)),
      findings: report.findings
    };
    writeJson(path.join(out, ruleset, "pages", `${entry.attemptId}.json`), record);
    console.log(JSON.stringify({ id: entry.attemptId, task: entry.taskId, status: report.status, c: c.instances.length, cand: cand.instances.length, new: newInstances.length }));
    return record;
  };
  const chunks = Array.from({ length: Math.ceil(entries.length / parallel) }, (_, i) => entries.slice(i * parallel, (i + 1) * parallel));
  const records = await chunks.reduce(async (acc, chunk) => [...await acc, ...await Promise.all(chunk.map(one))], Promise.resolve([]));
  await browser.close();
  writeJson(path.join(out, ruleset, "run.json"), { ruleset, pages: records.length, compileMsTotal: compileMs, compileJobs: jobs.length, stylesheetBytes: fs.statSync(path.join(rlp2, "compiler", "rulesets", `${ruleset}.css`)).size, chromium: browser.version?.() ?? null });
};

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
