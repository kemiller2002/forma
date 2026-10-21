#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { TASKS } from "../tasks/tasks.mjs";
import { ARMS, createWorkspace, workerPrompt } from "./workspace.mjs";

// Creates a phase manifest: every (task, arm, repetition) attempt with a
// random opaque id, a randomized execution order (seeded, seed recorded),
// and an isolated workspace.
//
// usage: plan.mjs --phase pilot|full --seed N --model NAME --runs-root DIR

const here = path.dirname(fileURLToPath(import.meta.url));
const experiment = path.resolve(here, "..");
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; };

const phase = arg("--phase");
const seed = Number(arg("--seed", "20261021"));
const model = arg("--model");
const runsRoot = path.resolve(arg("--runs-root", "/home/user/rlp-runs"));

// Deterministic PRNG (mulberry32) so the order is reproducible from the seed.
const prng = s => () => {
  s = (s + 0x6D2B79F5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const random = prng(seed);
const shuffle = list => list.map(item => ({ item, key: random() })).sort((a, b) => a.key - b.key).map(x => x.item);
const opaqueId = () => Array.from({ length: 8 }, () => Math.floor(random() * 16).toString(16)).join("");

const tasks = phase === "pilot" ? TASKS.filter(t => t.pilot) : TASKS;
const repetitions = phase === "pilot" ? 1 : 3;
const cells = tasks.flatMap(t => ARMS.flatMap(arm => Array.from({ length: repetitions }, (_, r) => ({ taskId: t.id, arm, repetition: r + 1 }))));
const ordered = shuffle(cells).map((cell, order) => ({ ...cell, order: order + 1, attemptId: `${phase[0]}${opaqueId()}` }));

const root = path.join(runsRoot, phase);
fs.mkdirSync(root, { recursive: true });
const attempts = ordered.map(a => {
  const workspace = createWorkspace({ root, attemptId: a.attemptId, taskId: a.taskId, arm: a.arm });
  return { ...a, workspace, prompt: workerPrompt(workspace), status: "planned" };
});

const engineCommit = execSync("git rev-parse HEAD", { cwd: experiment }).toString().trim();
const manifest = {
  experiment: "RLP-001",
  phase,
  seed,
  model,
  agentType: "general-purpose",
  budget: { maxValidationRuns: 5, note: "Same instructions, model, agent type and validation budget for every attempt." },
  engineCommit,
  engineDirty: execSync("git status --porcelain -- engine harness arms tasks", { cwd: experiment }).toString().trim() !== "",
  createdAt: new Date().toISOString(),
  runsRoot: root,
  screensRoot: path.join(runsRoot, "screens", phase),
  attempts
};
const file = path.join(experiment, "results", phase, "manifest.json");
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(manifest, null, 1));
console.log(`${attempts.length} attempts → ${file}`);
attempts.forEach(a => console.log(`${a.order}\t${a.attemptId}\t${a.taskId}\t${a.arm}\t${a.repetition}`));
