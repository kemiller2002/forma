#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { statements, CATEGORIES } from "./decisions.mjs";

// Blinded reliability check of the decision classifier (gate G4).
//   prepare: sample authored statements from final pages, stratified by arm,
//            strip arm and attempt, shuffle, and write a review packet.
//   score:   compare the reviewer's labels with the classifier's (percent
//            agreement and Cohen's kappa for category and for kind).
// usage: rubric-review.mjs prepare --phase P --per-arm N --seed S
//        rubric-review.mjs score --phase P

const here = path.dirname(fileURLToPath(import.meta.url));
const experiment = path.resolve(here, "..");
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; };
const mode = process.argv[2];
const phase = arg("--phase");
const resultsDir = path.join(experiment, "results", phase);
const manifest = JSON.parse(fs.readFileSync(path.join(resultsDir, "manifest.json"), "utf8"));
const reviewDir = path.join(path.dirname(manifest.runsRoot), "rubric-review", phase);

const prng = s => () => {
  s = (s + 0x6D2B79F5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const rubricText = () => {
  const doc = fs.readFileSync(path.join(experiment, "docs/DECISION-RUBRIC.md"), "utf8");
  // Reviewers get the category and kind definitions, not the implementation.
  return doc.slice(doc.indexOf("## Kinds"), doc.indexOf("## Measures per attempt"));
};

if (mode === "prepare") {
  const random = prng(Number(arg("--seed", "11")));
  const perArm = Number(arg("--per-arm", "20"));
  const pool = manifest.attempts.flatMap(a => {
    const file = path.join(resultsDir, "artifacts", a.attemptId, "final.html");
    if (!fs.existsSync(file)) return [];
    return statements(fs.readFileSync(file, "utf8")).filter(s => s.kind !== "derived").map(s => ({ ...s, arm: a.arm, attemptId: a.attemptId }));
  });
  const sample = ["A", "B", "C", "D"].flatMap(arm => pool.filter(s => s.arm === arm).map(s => ({ s, k: random() })).sort((x, y) => x.k - y.k).slice(0, perArm).map(x => x.s))
    .map(s => ({ s, k: random() })).sort((x, y) => x.k - y.k).map((x, i) => ({ item: `s${String(i + 1).padStart(3, "0")}`, ...x.s }));
  fs.mkdirSync(reviewDir, { recursive: true });
  const packet = sample.map(s => ({ item: s.item, source: s.source === "css" || s.source === "style-attr" ? "CSS declaration" : s.source === "class" ? "class name on an element" : "HTML attribute on an element", selectorOrElement: s.selector, condition: s.context || null, statement: s.source === "css" || s.source === "style-attr" ? `${s.property}: ${s.value}` : s.source === "class" ? `class="${s.value}"` : `${s.property}="${s.value}"` }));
  fs.writeFileSync(path.join(reviewDir, "statements.json"), JSON.stringify(packet, null, 1));
  fs.writeFileSync(path.join(reviewDir, "REVIEW.md"), `# Layout statement classification

You are an independent reviewer. Work only inside ${reviewDir}.

\`statements.json\` lists ${packet.length} statements taken from web pages. For
each one, decide its **category** (one of: ${CATEGORIES.filter(c => c !== "correction").join(", ")}, or
\`none\` if it does not affect layout) and its **kind** (\`explicit\` or
\`uncertain\`), using the rubric below. Judge each statement on its own.

${rubricText()}

Write \`${path.join(reviewDir, "labels.json")}\` as
\`{ "s001": { "category": "margin", "kind": "explicit" }, ... }\` covering
every item, then reply with: LABELED <count>
`);
  fs.mkdirSync(path.join(resultsDir, "rubric-review"), { recursive: true });
  fs.writeFileSync(path.join(resultsDir, "rubric-review", "key.json"), JSON.stringify(sample.map(s => ({ item: s.item, arm: s.arm, attemptId: s.attemptId, category: s.category, kind: s.kind, statement: `${s.property}: ${s.value}` })), null, 1));
  console.log(reviewDir, packet.length);
}

const kappa = (pairs) => {
  const labels = [...new Set(pairs.flat())];
  const n = pairs.length;
  const po = pairs.filter(([a, b]) => a === b).length / n;
  const pe = labels.reduce((s, l) => s + (pairs.filter(([a]) => a === l).length / n) * (pairs.filter(([, b]) => b === l).length / n), 0);
  return { n, agreement: po, kappa: pe === 1 ? 1 : (po - pe) / (1 - pe) };
};

if (mode === "score") {
  const key = JSON.parse(fs.readFileSync(path.join(resultsDir, "rubric-review", "key.json"), "utf8"));
  const labels = JSON.parse(fs.readFileSync(path.join(reviewDir, "labels.json"), "utf8"));
  const rows = key.filter(k => labels[k.item]).map(k => ({ ...k, reviewer: labels[k.item] }));
  const category = kappa(rows.map(r => [r.category, r.reviewer.category]));
  const kind = kappa(rows.map(r => [r.kind, r.reviewer.kind]));
  const byArm = Object.fromEntries(["A", "B", "C", "D"].map(arm => [arm, kappa(rows.filter(r => r.arm === arm).map(r => [r.category, r.reviewer.category]))]));
  const disagreements = rows.filter(r => r.category !== r.reviewer.category || r.kind !== r.reviewer.kind).map(r => ({ item: r.item, arm: r.arm, statement: r.statement, classifier: [r.category, r.kind], reviewer: [r.reviewer.category, r.reviewer.kind] }));
  const out = { phase, labeled: rows.length, of: key.length, category, kind, byArm, disagreements };
  fs.writeFileSync(path.join(resultsDir, "rubric-review", "agreement.json"), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ labeled: out.labeled, category, kind, byArm }, null, 1));
}
