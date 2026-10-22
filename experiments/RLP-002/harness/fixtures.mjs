#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { launch, serve, settle } from "../../RLP-001/harness/browser.mjs";
import { buildCompiler, compileAll } from "./stage1.mjs";

// Reproduces each unsupported or approximated relationship on a minimal
// fixture: the same markup rendered by the Arm C engine and by a compiled
// ruleset, with the geometry that differs. Writes results/stage-1/fixtures.json.
// usage: fixtures.mjs [--ruleset E2] [--c-assets /home/user/rlp-runs/full/<C attempt>/assets]

const here = path.dirname(fileURLToPath(import.meta.url));
const rlp2 = path.resolve(here, "..");
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; };
const ruleset = arg("--ruleset", "E2");
const cAssets = arg("--c-assets", "/home/user/rlp-runs/full/fu235adae1/assets");
const runs = "/home/user/rlp2-runs/fixtures";

const box = (page, id) => page.evaluate(id => { const r = document.getElementById(id).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, id);
const setText = (page, id, text) => page.evaluate(([id, text]) => { document.getElementById(id).textContent = text; }, [id, text]);

const CASES = [
  {
    file: "row-content-switch.html",
    relationship: "flow=row whose children lack data-rl-min (content-dependent switch)",
    measure: async page => {
      const before = await box(page, "name");
      await setText(page, "role", "Principal engineer, Platform reliability and developer productivity programs");
      await settle(page);
      const after = await box(page, "name");
      return { width: page.viewportSize().width, nameShiftPx: Math.round(Math.hypot(after.x - before.x, after.y - before.y) * 100) / 100 };
    },
    sweep: [375, 600, 768, 1024]
  },
  {
    file: "nested-edge-mismatch.html",
    relationship: "nested shared edge at different positions inside tight items",
    measure: async page => {
      const a = await box(page, "a");
      const b = await box(page, "b");
      return { width: 1024, inputTopDifferencePx: Math.round(Math.abs(a.y - b.y) * 100) / 100 };
    },
    width: 1024
  },
  {
    file: "row-static-min.html",
    relationship: "flow=row with data-rl-min on every child (supported: exact switch)",
    sweep: [700, 740, 752, 760, 800],
    measure: async (page, width) => {
      const a = await box(page, "main-panel");
      const b = await box(page, "side-panel");
      return { width, oneLine: Math.abs(a.y - b.y) < 0.5 };
    }
  }
];

const prepare = (dir, html, assets) => {
  fs.mkdirSync(dir, { recursive: true });
  fs.cpSync(assets, path.join(dir, "assets"), { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  return dir;
};

const render = async (browser, dir, width, measure) => {
  const server = await serve(dir);
  try {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${server.url}/index.html`, { waitUntil: "load" });
    await settle(page);
    const result = await measure(page, width);
    await context.close();
    return result;
  } finally { await server.close(); }
};

const main = async () => {
  const dll = buildCompiler();
  const compiledDir = path.join(runs, ruleset, "compiled");
  compileAll(dll, CASES.map(c => ({ input: path.join(rlp2, "fixtures", c.file), output: path.join(compiledDir, c.file), report: path.join(compiledDir, `${c.file}.report.json`), href: `assets/rlc/${ruleset}.css` })));
  const rlcAssets = path.join(runs, ruleset, "assets");
  fs.mkdirSync(path.join(rlcAssets, "rlc"), { recursive: true });
  fs.copyFileSync(path.join(cAssets, "base.css"), path.join(rlcAssets, "base.css"));
  fs.copyFileSync(path.join(cAssets, "placeholder.svg"), path.join(rlcAssets, "placeholder.svg"));
  fs.copyFileSync(path.join(rlp2, "compiler", "rulesets", `${ruleset}.css`), path.join(rlcAssets, "rlc", `${ruleset}.css`));
  const browser = await launch();
  const results = [];
  for (const c of CASES) {
    const cDir = prepare(path.join(runs, "C", c.file), fs.readFileSync(path.join(rlp2, "fixtures", c.file), "utf8"), cAssets);
    const eDir = prepare(path.join(runs, ruleset, c.file), fs.readFileSync(path.join(compiledDir, c.file), "utf8"), rlcAssets);
    const widths = c.sweep ?? [c.width];
    const rows = [];
    for (const w of widths) rows.push({ c: await render(browser, cDir, w, c.measure), [ruleset]: await render(browser, eDir, w, c.measure) });
    const report = JSON.parse(fs.readFileSync(path.join(compiledDir, `${c.file}.report.json`), "utf8"));
    results.push({ fixture: `fixtures/${c.file}`, relationship: c.relationship, compilerStatus: report.status, findings: report.findings, measurements: rows });
  }
  await browser.close();
  const file = path.join(rlp2, "results", "stage-1", "fixtures.json");
  fs.writeFileSync(file, JSON.stringify({ ruleset, results }, null, 1) + "\n");
  console.log(JSON.stringify(results.map(r => ({ fixture: r.fixture, status: r.compilerStatus, measurements: r.measurements })), null, 1));
};

await main();
