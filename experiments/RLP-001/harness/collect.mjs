#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TASKS, VIEWPORTS } from "../tasks/tasks.mjs";
import { launch, serve, settle } from "./browser.mjs";
import { defectKey, evaluatePage } from "./evaluate.mjs";
import { classify } from "./decisions.mjs";
import { transcriptUsage } from "./usage.mjs";

// Scores one finished attempt: full evaluation of the first draft and the
// final page, decision classification, agent usage from the transcript, a
// leakage audit, and screenshots for blind review. Writes
// results/attempts/<attemptId>.json and preserves the artifacts.
//
// usage: collect.mjs --manifest FILE --attempt ID --transcript FILE
//        [--notification-tokens N --notification-tools N --notification-ms N]

const here = path.dirname(fileURLToPath(import.meta.url));
const experiment = path.resolve(here, "..");
const arg = name => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined; };
const numberArg = name => (arg(name) === undefined ? null : Number(arg(name)));

const manifest = JSON.parse(fs.readFileSync(arg("--manifest"), "utf8"));
const entry = manifest.attempts.find(a => a.attemptId === arg("--attempt"));
if (!entry) throw new Error(`attempt ${arg("--attempt")} not in manifest`);
const task = TASKS.find(t => t.id === entry.taskId);
const ws = entry.workspace;

const readLines = file => (fs.existsSync(file) ? fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : []);
const log = readLines(path.join(ws, ".rlp/log.jsonl"));
const snapshots = fs.existsSync(path.join(ws, ".rlp/snapshots")) ? fs.readdirSync(path.join(ws, ".rlp/snapshots")).sort() : [];
const finalHtml = fs.readFileSync(path.join(ws, "index.html"), "utf8");
const firstHtml = snapshots.length ? fs.readFileSync(path.join(ws, ".rlp/snapshots", snapshots[0]), "utf8") : finalHtml;
fs.writeFileSync(path.join(ws, "__first.html"), firstHtml);

const summarize = result => {
  const standard = result.failures.filter(f => f.condition === "standard");
  const heldout = result.failures.filter(f => f.condition !== "standard");
  const distinct = list => new Set(list.map(f => `${f.invariant}|${f.element}`)).size;
  const byInvariant = list => list.reduce((acc, f) => ({ ...acc, [f.invariant]: (acc[f.invariant] ?? 0) + 1 }), {});
  return {
    standardDistinct: distinct(standard),
    standardInstances: new Set(standard.map(defectKey)).size,
    standardByInvariant: byInvariant(standard),
    accessibilityDistinct: distinct(standard.filter(f => f.invariant === "accessibility")),
    geometryDistinct: distinct(standard.filter(f => f.invariant !== "accessibility")),
    heldoutDistinct: distinct(heldout),
    heldoutByCondition: heldout.reduce((acc, f) => ({ ...acc, [f.condition]: (acc[f.condition] ?? 0) + 1 }), {}),
    heldoutByInvariant: byInvariant(heldout),
    responsiveFailureViewports: [...new Set(standard.map(f => f.viewport))].sort((a, b) => a - b),
    dynamicDistinct: distinct(standard.filter(f => f.step !== "initial")),
    unexpectedShift: standard.filter(f => f.invariant === "unexpected-shift").length,
    accepted: standard.length === 0,
    settledEverywhere: result.settledEverywhere
  };
};

const screenshots = async (browser, dir) => {
  const server = await serve(ws);
  fs.mkdirSync(dir, { recursive: true });
  try {
    for (const width of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(`${server.url}/index.html`, { waitUntil: "load" });
      await settle(page);
      await page.screenshot({ path: path.join(dir, `${width}.png`), fullPage: true });
      await context.close();
    }
  } finally { await server.close(); }
};

const browser = await launch();
try {
  const first = await evaluatePage({ browser, dir: ws, file: "__first.html", task, mode: "full" });
  const final = await evaluatePage({ browser, dir: ws, file: "index.html", task, mode: "full" });
  const screensDir = path.join(manifest.screensRoot, entry.attemptId);
  await screenshots(browser, screensDir);
  const usage = transcriptUsage(arg("--transcript"), ws);
  const decisions = classify(finalHtml, firstHtml);
  const ownScripts = [...finalHtml.matchAll(/<script\b[^>]*>/gi)].map(m => m[0]).filter(s => !/src="assets\/rlp\/rlp\.mjs"/.test(s));
  const result = {
    experiment: "RLP-001",
    phase: manifest.phase,
    attemptId: entry.attemptId,
    taskId: entry.taskId,
    category: task.category,
    split: task.split,
    arm: entry.arm,
    repetition: entry.repetition,
    executionOrder: entry.order,
    model: manifest.model,
    engineCommit: manifest.engineCommit,
    collectedAt: new Date().toISOString(),
    agent: {
      ...usage,
      notification: { finalContextTokens: numberArg("--notification-tokens"), toolUses: numberArg("--notification-tools"), durationMs: numberArg("--notification-ms") },
      validationRuns: log.length,
      repairIterations: Math.max(0, log.length - 1),
      neverValidated: log.length === 0,
      devRuns: log
    },
    compliance: { ownScripts, leakage: usage.leakage ?? [] },
    firstDraft: { ...summarize(first), engine: first.engine },
    final: { ...summarize(final), engine: final.engine },
    decisions: { ...decisions, evidence: undefined },
    failures: { first: first.failures, final: final.failures }
  };
  const out = path.join(experiment, "results", manifest.phase, "attempts");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, `${entry.attemptId}.json`), JSON.stringify(result, null, 1));
  const artifacts = path.join(experiment, "results", manifest.phase, "artifacts", entry.attemptId);
  fs.mkdirSync(artifacts, { recursive: true });
  fs.writeFileSync(path.join(artifacts, "first.html"), firstHtml);
  fs.writeFileSync(path.join(artifacts, "final.html"), finalHtml);
  fs.writeFileSync(path.join(artifacts, "validation-log.jsonl"), log.map(l => JSON.stringify(l)).join("\n") + (log.length ? "\n" : ""));
  fs.writeFileSync(path.join(artifacts, "decision-evidence.json"), JSON.stringify(decisions.evidence, null, 1));
  console.log(JSON.stringify({
    attempt: entry.attemptId, task: entry.taskId, arm: entry.arm,
    firstDistinct: result.firstDraft.standardDistinct, finalDistinct: result.final.standardDistinct, accepted: result.final.accepted,
    heldout: result.final.heldoutDistinct, runs: log.length, tokens: usage.totalTokens, decisions: decisions.total, leakage: (usage.leakage ?? []).length, ownScripts: ownScripts.length
  }));
} finally {
  await browser.close();
  fs.rmSync(path.join(ws, "__first.html"), { force: true });
}
