// FORMA-MOT-010: the motion conformance gate. Each case copies the shipped
// motion surface into a temporary tree, introduces one illegal animation, and
// requires `node tools/motion-audit.mjs --strict` (the command wired into
// `npm run test:motion`, `npm run check`, `release:check` and CI) to fail.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const audit = path.join(root, "tools", "motion-audit.mjs");
const models = JSON.parse(fs.readFileSync(path.join(root, "catalog/motion/models.json"), "utf8"));
const sourceFiles = Object.values(models.sources).flat();

// A pristine copy of everything the audit reads.
const fixture = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ef-motion-gate-"));
  ["catalog/motion/models.json", "catalog/motion/classification.json", "catalog/motion/debt.json", "tokens/echelon.tokens.json", ...sourceFiles]
    .forEach((file) => {
      fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      fs.copyFileSync(path.join(root, file), path.join(dir, file));
    });
  return dir;
};

const append = (dir, file, css) => fs.appendFileSync(path.join(dir, file), `\n${css}\n`);

const editJson = (dir, file, edit) => {
  const target = path.join(dir, file);
  fs.writeFileSync(target, `${JSON.stringify(edit(JSON.parse(fs.readFileSync(target, "utf8"))), null, 2)}\n`);
};

const classify = (dir, entry) =>
  editJson(dir, "catalog/motion/classification.json", (catalog) =>
    Array.isArray(catalog) ? [...catalog, entry] : { ...catalog, entries: [...catalog.entries, entry] });

const gate = (dir) => {
  const result = spawnSync(process.execPath, [audit, "--strict"], { cwd: dir, encoding: "utf8" });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
};

const expectRejected = (dir, code) => {
  const result = gate(dir);
  assert.equal(result.status, 1, `gate should fail\n${result.output}`);
  assert.match(result.output, new RegExp(code), `expected ${code}\n${result.output}`);
};

const components = "src/styles/components.css";

test("the shipped tree passes the strict gate with an empty debt ledger", () => {
  const result = gate(fixture());
  assert.equal(result.status, 0, result.output);
  const debt = JSON.parse(fs.readFileSync(path.join(root, "catalog/motion/debt.json"), "utf8"));
  assert.deepEqual(debt.entries, []);
});

test("the canonical validation paths run the strict gate", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.match(pkg.scripts["test:motion"], /motion-audit\.mjs --strict/);
  assert.match(pkg.scripts["test:motion"], /motion-gate\.test\.mjs/);
  for (const script of ["check", "release:check"]) assert.match(pkg.scripts[script], /npm run test:motion/);
  for (const workflow of ["conformance.yml", "design-system-pilot-validation.yml"]) {
    assert.match(fs.readFileSync(path.join(root, ".github/workflows", workflow), "utf8"), /npm run test:motion/);
  }
});

test("a new animated selector without a model classification fails", () => {
  const dir = fixture();
  append(dir, components, ".ef-gate-probe { transition: opacity var(--ef-motion-perceptual-duration) var(--ef-motion-perceptual-easing); }");
  expectRejected(dir, "unclassified-track");
});

test("an unexplained literal duration or implicit easing fails even when classified", () => {
  const dir = fixture();
  append(dir, components, ".ef-gate-probe { transition: opacity 250ms; }");
  classify(dir, { source: components, family: "gate-probe", selector: ".ef-gate-probe", tracks: { opacity: "perceptual" }, reducedMotion: { strategy: "brief" } });
  const result = gate(dir);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /unexplained-duration/);
  assert.match(result.output, /implicit-easing/);
});

test("a token from the wrong model fails (no mass on non-spatial change)", () => {
  const dir = fixture();
  append(dir, components, ".ef-gate-probe { transition: opacity var(--ef-motion-inertia-duration) var(--ef-motion-damped-easing); }");
  classify(dir, { source: components, family: "gate-probe", selector: ".ef-gate-probe", tracks: { opacity: "perceptual" }, reducedMotion: { strategy: "brief" } });
  expectRejected(dir, "model-token-mismatch");
});

test("spatial motion without a reduced-motion substitution fails", () => {
  const dir = fixture();
  append(dir, components, ".ef-gate-probe { transition: translate var(--ef-motion-inertia-duration) var(--ef-motion-damped-easing); }");
  classify(dir, { source: components, family: "gate-probe", selector: ".ef-gate-probe", tracks: { translate: "inertial" } });
  expectRejected(dir, "reduced-motion-missing");
});

test("a declared reduced-motion substitution must exist in the stylesheet", () => {
  const dir = fixture();
  append(dir, components, ".ef-gate-probe { transition: translate var(--ef-motion-inertia-duration) var(--ef-motion-damped-easing); }");
  classify(dir, { source: components, family: "gate-probe", selector: ".ef-gate-probe", tracks: { translate: "inertial" }, reducedMotion: { strategy: "explicit" } });
  expectRejected(dir, "reduced-motion-unverified");
});

test("repeated cadence motion that never stops under reduced motion fails", () => {
  const dir = fixture();
  append(dir, components, "@keyframes ef-gate-spin { to { rotate: 1turn; } }\n.ef-gate-probe { animation: ef-gate-spin var(--ef-motion-cadence-rotation-period) var(--ef-motion-cadence-easing) infinite; }");
  classify(dir, { source: components, family: "gate-probe", selector: ".ef-gate-probe", tracks: { "ef-gate-spin": "cadence" }, reducedMotion: { strategy: "explicit" } });
  expectRejected(dir, "repeated-without-stop");
});

test("the transform shorthand is rejected because it clobbers concurrent effects", () => {
  const dir = fixture();
  append(dir, components, ".ef-gate-probe { transition: transform var(--ef-motion-inertia-duration) var(--ef-motion-damped-easing); }\n@media (prefers-reduced-motion: reduce) { .ef-gate-probe { transition: none; } }");
  classify(dir, { source: components, family: "gate-probe", selector: ".ef-gate-probe", tracks: { transform: "inertial" }, reducedMotion: { strategy: "explicit" } });
  expectRejected(dir, "transform-shorthand-motion");
});

test("assessment, marketing and documentation-site CSS are gated too", () => {
  for (const file of ["src/styles/assessment.css", "src/marketing/components.css", "site/site.css"]) {
    assert.ok(sourceFiles.includes(file), `${file} is an audited source`);
    const dir = fixture();
    append(dir, file, ".ef-gate-probe { transition: color .2s ease; }");
    expectRejected(dir, "unclassified-track");
  }
});

test("re-opening the debt ledger fails the strict gate", () => {
  const dir = fixture();
  append(dir, components, ".ef-gate-probe { transition: opacity 250ms linear; }");
  classify(dir, { source: components, family: "gate-probe", selector: ".ef-gate-probe", tracks: { opacity: "perceptual" }, reducedMotion: { strategy: "brief" } });
  // Recording the new findings as debt would pass the non-strict ratchet...
  const report = spawnSync(process.execPath, [audit, "--json"], { cwd: dir, encoding: "utf8" });
  const { unrecorded } = JSON.parse(report.stdout);
  editJson(dir, "catalog/motion/debt.json", (debt) => ({
    ...debt,
    entries: unrecorded.map((item) => ({ key: [item.code, item.source, item.selector, item.property, item.value ?? ""].join("|"), issue: "GH-0" }))
  }));
  // ...but strict mode requires the ledger to stay empty.
  const result = gate(dir);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /new 0, resolved-but-still-recorded 0/);
  assert.match(result.output, /strict: \d+ debt entries remain/);
});

test("the conformance matrix names only tests that exist", () => {
  const matrix = JSON.parse(fs.readFileSync(path.join(root, "catalog/motion/conformance.json"), "utf8"));
  assert.ok(matrix.requirements.length >= 13);
  for (const requirement of matrix.requirements) {
    assert.ok(requirement.tests.length > 0, `${requirement.id} has no test`);
    for (const { file, title } of requirement.tests) {
      const source = fs.readFileSync(path.join(root, file), "utf8");
      assert.ok(source.includes(`test(${JSON.stringify(title)}`), `${requirement.id}: ${file} has no test "${title}"`);
    }
  }
});
