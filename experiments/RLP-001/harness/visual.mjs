#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Blind visual evaluation.
//   prepare: group final-page screenshots into batches of the same task,
//            viewport and repetition (one image per arm), copy them under
//            opaque names in random order, and write the key separately.
//   score:   join reviewer ratings with the key and summarize per arm.
// usage: visual.mjs prepare --phase P --seed N --reviewers 2 --chunks K [--include PHASE:ARM]
// --include adds another phase's attempts of one arm to the same batches
// (extension 01: X1 rated beside Arm C).
//        visual.mjs score --phase P

const here = path.dirname(fileURLToPath(import.meta.url));
const experiment = path.resolve(here, "..");
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; };
const mode = process.argv[2];
const phase = arg("--phase");
const resultsDir = path.join(experiment, "results", phase);
const manifest = JSON.parse(fs.readFileSync(path.join(resultsDir, "manifest.json"), "utf8"));
const reviewRoot = path.join(path.dirname(manifest.runsRoot), "visual", phase);
const VIEWPORTS = [375, 1440];
export const CRITERIA = ["hierarchy", "spacing", "alignment", "readability", "grouping", "density", "overall"];

const prng = s => () => {
  s = (s + 0x6D2B79F5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const instructions = (dir, batches) => `# Visual review

You are an independent reviewer. Work only inside ${dir}.

There are ${batches.length} batches. Each batch is a folder with images of
the same interface requirement, built independently by different teams at
the same screen width (${VIEWPORTS.join(" or ")} CSS px; see \`batch.json\`).
Open every image with your file-reading tool and look at it before rating.

Rate every image on each criterion from 1 (poor) to 5 (excellent):

- hierarchy: the most important content stands out; heading levels read clearly
- spacing: spacing is consistent and proportionate; nothing cramped or loose
- alignment: edges and peers line up; nothing looks accidentally offset
- readability: text is easy to read; line lengths and sizes are comfortable
- grouping: related elements look related; separate groups look separate
- density: content density suits the purpose; no wasted or crowded areas
- overall: overall visual quality

Judge only what you see. Images differ in length; that is expected. Compare
images within a batch, but rate each on its own merits (ties are fine).

Write your ratings to \`${path.join(dir, "ratings.json")}\` as:

\`\`\`json
{ "<batch>/<image>": { "hierarchy": 4, "spacing": 3, "alignment": 5, "readability": 4, "grouping": 4, "density": 3, "overall": 4, "note": "one short sentence" } }
\`\`\`

Include every image of every batch. Then reply with: RATED <number of images>
`;

if (mode === "prepare") {
  const random = prng(Number(arg("--seed", "7")));
  const reviewers = Number(arg("--reviewers", "2"));
  const chunks = Number(arg("--chunks", "1"));
  const included = (arg("--include") ?? "").split(",").filter(Boolean).flatMap(spec => {
    const [otherPhase, arm] = spec.split(":");
    const other = JSON.parse(fs.readFileSync(path.join(experiment, "results", otherPhase, "manifest.json"), "utf8"));
    return other.attempts.filter(a => a.arm === arm).map(a => ({ ...a, screensRoot: other.screensRoot }));
  });
  const attempts = [...manifest.attempts.map(a => ({ ...a, screensRoot: manifest.screensRoot })), ...included];
  const groups = [...attempts.reduce((acc, a) => {
    VIEWPORTS.forEach(v => {
      const key = `${a.taskId}|${a.repetition}|${v}`;
      acc.set(key, [...(acc.get(key) ?? []), { attemptId: a.attemptId, arm: a.arm, file: path.join(a.screensRoot, a.attemptId, `${v}.png`) }]);
    });
    return acc;
  }, new Map()).entries()].map(([key, items]) => ({ key, items }))
    .map(g => ({ ...g, order: random() })).sort((a, b) => a.order - b.order);
  const key = {};
  const assignments = Array.from({ length: reviewers }, (_, r) => Array.from({ length: chunks }, (_, c) => {
    const dir = path.join(reviewRoot, `r${r + 1}-c${c + 1}`);
    fs.mkdirSync(dir, { recursive: true });
    const mine = groups.filter((_, i) => i % chunks === c);
    const batches = mine.map((g, bi) => {
      const batch = `b${String(bi + 1).padStart(2, "0")}`;
      const shuffled = g.items.map(it => ({ it, k: random() })).sort((x, y) => x.k - y.k).map(x => x.it);
      fs.mkdirSync(path.join(dir, batch), { recursive: true });
      const images = shuffled.map((it, ii) => {
        const name = `image-${ii + 1}.png`;
        fs.copyFileSync(it.file, path.join(dir, batch, name));
        key[`r${r + 1}-c${c + 1}/${batch}/${name}`] = { attemptId: it.attemptId, arm: it.arm, group: g.key };
        return name;
      });
      const [, , viewport] = g.key.split("|");
      fs.writeFileSync(path.join(dir, batch, "batch.json"), JSON.stringify({ viewport: Number(viewport), images }, null, 1));
      return batch;
    });
    fs.writeFileSync(path.join(dir, "REVIEW.md"), instructions(dir, batches));
    return dir;
  }));
  fs.mkdirSync(path.join(resultsDir, "visual"), { recursive: true });
  fs.writeFileSync(path.join(resultsDir, "visual", "key.json"), JSON.stringify(key, null, 1));
  console.log(JSON.stringify(assignments.flat()));
}

if (mode === "score") {
  const key = JSON.parse(fs.readFileSync(path.join(resultsDir, "visual", "key.json"), "utf8"));
  const dirs = fs.readdirSync(reviewRoot).filter(d => fs.existsSync(path.join(reviewRoot, d, "ratings.json")));
  const ratings = dirs.flatMap(d => Object.entries(JSON.parse(fs.readFileSync(path.join(reviewRoot, d, "ratings.json"), "utf8")))
    .map(([raw, r]) => [raw.endsWith(".png") ? raw : `${raw}.png`, r]) // some reviewers omit the extension
    .map(([image, r]) => ({ reviewer: d.split("-")[0], id: `${d}/${image}`, ...key[`${d}/${image}`], ratings: r })))
    .filter(r => r.arm);
  const mean = xs => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const perArm = Object.fromEntries([...new Set(ratings.map(r => r.arm))].sort().map(arm => [arm, Object.fromEntries(CRITERIA.map(c => [c, mean(ratings.filter(r => r.arm === arm).map(r => r.ratings[c]).filter(Number.isFinite))]))]));
  // Disagreement: the same image rated by two reviewers.
  const byImage = ratings.reduce((acc, r) => acc.set(`${r.attemptId}|${r.group}`, [...(acc.get(`${r.attemptId}|${r.group}`) ?? []), r]), new Map());
  const paired = [...byImage.values()].filter(rs => rs.length >= 2);
  const disagreements = paired.flatMap(([a, b]) => CRITERIA.filter(c => Math.abs(a.ratings[c] - b.ratings[c]) >= 2).map(c => ({ attemptId: a.attemptId, arm: a.arm, group: a.group, criterion: c, ratings: [a.ratings[c], b.ratings[c]], notes: [a.ratings.note, b.ratings.note] })));
  const exact = paired.length ? mean(paired.flatMap(([a, b]) => CRITERIA.map(c => (a.ratings[c] === b.ratings[c] ? 1 : 0)))) : null;
  const within1 = paired.length ? mean(paired.flatMap(([a, b]) => CRITERIA.map(c => (Math.abs(a.ratings[c] - b.ratings[c]) <= 1 ? 1 : 0)))) : null;
  const out = { phase, images: ratings.length, pairedImages: paired.length, agreement: { exact, within1 }, perArm, disagreements, ratings };
  fs.writeFileSync(path.join(resultsDir, "visual", "scores.json"), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ images: out.images, paired: out.pairedImages, agreement: out.agreement, disagreements: disagreements.length, perArm }, null, 1));
}
