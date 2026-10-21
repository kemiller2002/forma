#!/usr/bin/env node
import fs from "node:fs";
// Prints collect.mjs argument lines for every attempt of a phase that has
// finished (its transcript's last assistant message ended the turn or handed
// back) and has
// no result yet. usage: pending.mjs PHASE
const phase = process.argv[2];
const dir = new URL(`../results/${phase}/`, import.meta.url).pathname;
const agents = JSON.parse(fs.readFileSync(`${dir}agents.json`, "utf8"));
const notifications = fs.existsSync(`${dir}notifications.json`) ? JSON.parse(fs.readFileSync(`${dir}notifications.json`, "utf8")) : {};
const finished = file => {
  if (!fs.existsSync(file)) return false;
  const last = fs.readFileSync(file, "utf8").trim().split("\n")
    .flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } })
    .filter(r => r.type === "assistant").pop();
  // Workers end either with a plain final turn or with the runtime's
  // hand-back tool call.
  return last?.message?.stop_reason === "end_turn"
    || (last?.message?.content ?? []).some(c => c.type === "tool_use" && c.name === "SubagentHandback");
};
Object.entries(agents.attempts)
  .filter(([attempt]) => !fs.existsSync(`${dir}attempts/${attempt}.json`))
  .map(([attempt, agent]) => [attempt, `${agents.transcriptDir}/agent-${agent}.jsonl`])
  .filter(([, transcript]) => finished(transcript))
  .forEach(([attempt, transcript]) => {
    const [tokens, tools, ms] = notifications[attempt] ?? [];
    console.log(["--manifest", `${dir}manifest.json`, "--attempt", attempt, "--transcript", transcript,
      ...(tokens ? ["--notification-tokens", tokens, "--notification-tools", tools, "--notification-ms", ms] : [])].join(" "));
  });
