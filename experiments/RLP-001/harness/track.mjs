#!/usr/bin/env node
import fs from "node:fs";
// Track a phase's launches: `track.mjs PHASE add ATTEMPT AGENT ...` records
// launched attempts; `track.mjs PHASE next N` prints the next N unlaunched
// attempt ids in manifest order.
const [phase, cmd, ...rest] = process.argv.slice(2);
const dir = new URL(`../results/${phase}/`, import.meta.url);
const file = new URL("agents.json", dir);
const agents = JSON.parse(fs.readFileSync(file, "utf8"));
const manifest = JSON.parse(fs.readFileSync(new URL("manifest.json", dir), "utf8"));
if (cmd === "add") {
  const pairs = Object.fromEntries(rest.reduce((acc, v, i) => (i % 2 ? [...acc.slice(0, -1), [acc[acc.length - 1][0], v]] : [...acc, [v]]), []));
  fs.writeFileSync(file, JSON.stringify({ ...agents, attempts: { ...agents.attempts, ...pairs } }, null, 1));
}
if (cmd === "next") console.log(manifest.attempts.filter(a => !agents.attempts[a.attemptId]).slice(0, Number(rest[0] ?? 1)).map(a => a.attemptId).join(" "));
if (cmd === "status") console.log(`${Object.keys(agents.attempts).length}/${manifest.attempts.length} launched`);
