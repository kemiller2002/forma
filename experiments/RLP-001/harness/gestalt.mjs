#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { capture, launch, serve, settle } from "./browser.mjs";
import { TASKS, VIEWPORTS } from "../tasks/tasks.mjs";

// G-metric (RLP-001 extension 01): arm-neutral Gestalt measures computed from
// the final page's initial render at every scoring viewport. Exploratory; it
// does not change the pre-registered defect counts.
//
//   proximity contrast: for each visible label, hint or message and its
//     control, (gap to the nearest unrelated visible leaf) / (gap to its own
//     control or a co-describer). < 1 means it is visibly closer to something
//     unrelated (a failure); exactly 1 is a tie, reported separately because
//     a tie can be resolved by alignment (a checkbox beside its label with the
//     next option the same distance below).
//   group separation contrast: for each spec parent with two or more visible
//     child groups, median nearest gap between those groups / median nearest
//     gap inside them. < 1 is an inversion, exactly 1 a tie. When every child
//     group draws its own boundary (a border, or a background unlike its
//     parent's), common region carries the grouping and the case is reported
//     as region-resolved instead.
// usage: gestalt.mjs --phase P [--arms A,B,C,D] [--parallel N]

const here = path.dirname(fileURLToPath(import.meta.url));
const experiment = path.resolve(here, "..");
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; };

const FLOOR_PX = 0.5;
const gap = (a, b) => Math.max(b.x - a.right, a.x - b.right, b.y - a.bottom, a.y - b.bottom, 0);
const floor = v => Math.max(v, FLOOR_PX);
const median = xs => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length === 0 ? null : s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const transparent = color => !color || color === "transparent" || /rgba\(.*,\s*0\)$/.test(color);
const nearest = (item, others) => Math.min(...others.map(o => gap(item, o)));

// Pure: one snapshot of one task → its Gestalt measurements.
export const measure = (task, snapshot) => {
  const specs = task.elements;
  const childrenOf = id => specs.filter(s => s.parent === id).map(s => s.id);
  const dom = new Map(snapshot.elements.filter(e => e.visible).map(e => [e.id, e]));
  const isLeaf = id => childrenOf(id).length === 0;
  const related = (a, b) => dom.get(a)?.ancestors.includes(b) || dom.get(b)?.ancestors.includes(a);
  const leaves = [...dom.keys()].filter(isLeaf);

  const proximity = specs.filter(s => s.for && dom.has(s.id) && dom.has(s.for)).flatMap(s => {
    const own = [s.for, ...specs.filter(o => o.for === s.for && o.id !== s.id && dom.has(o.id)).map(o => o.id)];
    const unrelated = leaves.filter(id => !own.includes(id) && id !== s.id && !related(id, s.id) && !specs.some(o => o.id === id && o.for === s.for));
    if (unrelated.length === 0) return [];
    const box = dom.get(s.id).box;
    const ownGap = nearest(box, own.map(id => dom.get(id).box));
    const otherGap = nearest(box, unrelated.map(id => dom.get(id).box));
    return [{ element: s.id, control: s.for, ownGap, otherGap, ratio: floor(otherGap) / floor(ownGap) }];
  });

  const groups = specs.flatMap(parent => {
    const kids = childrenOf(parent.id).filter(id => dom.has(id) && childrenOf(id).some(k => dom.has(k)));
    if (kids.length < 2) return [];
    const boxes = kids.map(id => dom.get(id).box);
    const between = boxes.map((b, i) => nearest(b, boxes.filter((_, j) => j !== i)));
    const inside = kids.flatMap(id => {
      const members = childrenOf(id).filter(k => dom.has(k)).map(k => dom.get(k).box);
      return members.length < 2 ? [] : members.map((b, i) => nearest(b, members.filter((_, j) => j !== i)));
    });
    if (inside.length === 0) return [];
    const parentBackground = dom.get(parent.id)?.background;
    const bounded = kids.every(id => dom.get(id).borderWidth > 0 || !transparent(dom.get(id).background) && dom.get(id).background !== parentBackground);
    return [{ parent: parent.id, between: median(between), inside: median(inside), ratio: floor(median(between)) / floor(median(inside)), bounded }];
  });

  return { proximity, groups };
};

const renderAll = async (browser, url) => {
  const shots = [];
  for (const width of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "load" });
    await settle(page);
    shots.push({ width, snapshot: await capture(page) });
    await context.close();
  }
  return shots;
};

const summarize = rows => {
  const prox = rows.flatMap(r => r.proximity);
  const grp = rows.flatMap(r => r.groups);
  return {
    proximityPairs: prox.length,
    proximityFailures: prox.filter(p => p.ratio < 1 - 1e-6).length,
    proximityTies: prox.filter(p => Math.abs(p.ratio - 1) <= 1e-6).length,
    proximityMedianRatio: median(prox.map(p => p.ratio)),
    groupCases: grp.length,
    groupInversions: grp.filter(g => !g.bounded && g.ratio < 1 - 1e-6).length,
    groupTies: grp.filter(g => !g.bounded && Math.abs(g.ratio - 1) <= 1e-6).length,
    groupRegionResolved: grp.filter(g => g.bounded && g.ratio <= 1 + 1e-6).length,
    groupMedianRatio: median(grp.map(g => g.ratio))
  };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const phase = arg("--phase");
  const arms = arg("--arms")?.split(",");
  const parallel = Number(arg("--parallel", "4"));
  const resultsDir = path.join(experiment, "results", phase);
  const manifest = JSON.parse(fs.readFileSync(path.join(resultsDir, "manifest.json"), "utf8"));
  const entries = manifest.attempts.filter(a => (!arms || arms.includes(a.arm)) && fs.existsSync(path.join(a.workspace, "index.html")));
  const browser = await launch();
  const one = async entry => {
    const task = TASKS.find(t => t.id === entry.taskId);
    const server = await serve(entry.workspace);
    try {
      const shots = await renderAll(browser, `${server.url}/index.html`);
      const perViewport = shots.map(({ width, snapshot }) => ({ width, ...measure(task, snapshot) }));
      return { attemptId: entry.attemptId, taskId: entry.taskId, arm: entry.arm, ...summarize(perViewport), perViewport };
    } finally { await server.close(); }
  };
  const chunks = Array.from({ length: Math.ceil(entries.length / parallel) }, (_, i) => entries.slice(i * parallel, (i + 1) * parallel));
  const results = await chunks.reduce(async (acc, chunk) => [...await acc, ...await Promise.all(chunk.map(one))], Promise.resolve([]));
  await browser.close();
  const byArm = Object.fromEntries([...new Set(results.map(r => r.arm))].sort().map(arm => {
    const mine = results.filter(r => r.arm === arm);
    return [arm, { attempts: mine.length, ...summarize(mine.flatMap(r => r.perViewport)), attemptsWithProximityFailure: mine.filter(r => r.proximityFailures > 0).length, attemptsWithProximityTie: mine.filter(r => r.proximityTies > 0).length, attemptsWithInversion: mine.filter(r => r.groupInversions > 0).length }];
  }));
  fs.writeFileSync(path.join(resultsDir, "gestalt.json"), JSON.stringify({ phase, viewports: VIEWPORTS, byArm, attempts: results }, null, 1));
  console.log(JSON.stringify(byArm, null, 1));
}
