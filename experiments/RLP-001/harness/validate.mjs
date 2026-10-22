#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { TASKS } from "../tasks/tasks.mjs";
import { launch } from "./browser.mjs";
import { evaluatePage } from "./evaluate.mjs";
import { MAX_VALIDATIONS } from "./workspace.mjs";

// The command attempt agents run. Every invocation is logged with a snapshot
// of the page, so the first draft and every repair iteration are preserved.
// Output is arm-neutral apart from engine diagnostics, which only the
// relational engine produces.

const argument = name => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const workspace = path.resolve(argument("--workspace") ?? ".");
const meta = JSON.parse(fs.readFileSync(path.join(workspace, ".rlp/meta.json"), "utf8"));
const task = TASKS.find(t => t.id === meta.taskId);
const logFile = path.join(workspace, ".rlp/log.jsonl");
const previous = fs.existsSync(logFile) ? fs.readFileSync(logFile, "utf8").split("\n").filter(Boolean).length : 0;
const run = previous + 1;

if (run > MAX_VALIDATIONS) {
  console.log(`Validation budget used: ${MAX_VALIDATIONS} of ${MAX_VALIDATIONS} runs. Stop now and report your result.`);
  process.exit(2);
}

const tag = String(run).padStart(3, "0");
const snapshot = path.join(workspace, ".rlp/snapshots", `${tag}.html`);
fs.copyFileSync(path.join(workspace, "index.html"), snapshot);

const browser = await launch();
const started = new Date();
const result = await evaluatePage({ browser, dir: workspace, task, mode: "dev" }).finally(() => browser.close());
fs.mkdirSync(path.join(workspace, ".rlp/results"), { recursive: true });
fs.writeFileSync(path.join(workspace, ".rlp/results", `${tag}.json`), JSON.stringify(result, null, 2));

const failures = result.failures;
const engineIssues = result.engine.flatMap(e => (e.diagnostics ?? []).filter(d => d.severity === "error").map(d => `${e.viewport}px engine ${d.code}: ${d.detail}`));
fs.appendFileSync(logFile, `${JSON.stringify({ run, startedAt: started.toISOString(), durationMs: result.durationMs, failures: failures.length, engineErrors: engineIssues.length, snapshot: path.relative(workspace, snapshot) })}\n`);

const counts = failures.reduce((acc, f) => acc.set(f.invariant, (acc.get(f.invariant) ?? 0) + 1), new Map());
console.log(`Validation run ${run} of ${MAX_VALIDATIONS}: ${failures.length === 0 ? "PASS" : "FAIL"}`);
console.log(`Checked widths ${result.viewports.join(", ")} px, initial render and ${task.dynamic.length} dynamic changes.`);
if (failures.length) {
  console.log(`\n${failures.length} failure(s): ${[...counts].map(([k, v]) => `${k} ${v}`).join(", ")}`);
  failures.slice(0, 30).forEach(f => console.log(`- [${f.viewport}px, ${f.step}] ${f.invariant} ${f.element}: expected ${f.expected}; observed ${f.observed}`));
  if (failures.length > 30) console.log(`… ${failures.length - 30} more (see .rlp/results/${tag}.json)`);
}
if (engineIssues.length) {
  console.log(`\nLayout engine diagnostics (information; acceptance is decided by the checks above):`);
  [...new Set(engineIssues)].slice(0, 10).forEach(line => console.log(`- ${line}`));
}
process.exit(failures.length === 0 ? 0 : 1);
