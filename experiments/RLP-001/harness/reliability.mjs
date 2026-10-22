#!/usr/bin/env node
import { launch } from "./browser.mjs";
import { defectKey, evaluatePage } from "./evaluate.mjs";
import { TASKS } from "../tasks/tasks.mjs";

// Gate G3: score the same page twice and compare defect sets.
// usage: reliability.mjs DIR:TASK [DIR:TASK ...]
const browser = await launch();
const rows = [];
for (const spec of process.argv.slice(2)) {
  const [dir, taskId] = spec.split(":");
  const task = TASKS.find(t => t.id === taskId);
  const a = await evaluatePage({ browser, dir, task, mode: "full" });
  const b = await evaluatePage({ browser, dir, task, mode: "full" });
  const ka = new Set(a.failures.map(defectKey));
  const kb = new Set(b.failures.map(defectKey));
  const onlyA = [...ka].filter(k => !kb.has(k));
  const onlyB = [...kb].filter(k => !ka.has(k));
  rows.push({ dir, taskId, first: ka.size, second: kb.size, identical: onlyA.length === 0 && onlyB.length === 0, onlyFirst: onlyA, onlySecond: onlyB, settled: [a.settledEverywhere, b.settledEverywhere] });
}
await browser.close();
console.log(JSON.stringify(rows, null, 1));
