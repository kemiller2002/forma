import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

// @echelon-foundry/forma-conformance is a dev/test companion. It must stay
// outside the zero-runtime design-system package and keep a pure core.
const root = process.cwd();
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const pkg = readJson("packages/conformance/package.json");
const designSystem = readJson("package.json");

test("conformance helpers are a separately versioned public package", () => {
  assert.equal(pkg.name, "@echelon-foundry/forma-conformance");
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.equal(pkg.private, false);
  assert.equal(pkg.publishConfig?.access, "public");
  assert.ok(pkg.peerDependencies?.["@playwright/test"], "Playwright is a peer, never bundled");
  assert.equal(pkg.dependencies, undefined, "the helpers add no runtime dependencies");
  for (const target of Object.values(pkg.exports)) {
    assert.ok(fs.existsSync(path.join(root, "packages/conformance", target)), `${target} exists`);
  }
  assert.ok(fs.readFileSync(path.join(root, "packages/conformance/README.md"), "utf8").includes("UI-LAYOUT-INTERACTION@1.0.0"));
});

test("the design-system package neither ships nor depends on the conformance helpers", () => {
  const shipped = designSystem.files ?? [];
  assert.equal(shipped.some(entry => entry.startsWith("packages") || entry.startsWith("tests")), false);
  assert.equal(JSON.stringify(designSystem.exports).includes("conformance"), false);
  assert.equal(Object.keys(designSystem.dependencies ?? {}).includes(pkg.name), false);
  const sources = ["src", "patterns"].flatMap(dir => fs.readdirSync(path.join(root, dir), { recursive: true }).map(file => path.join(dir, String(file))))
    .filter(file => /\.(css|html|mjs|js)$/.test(file));
  const importing = sources.filter(file => fs.readFileSync(path.join(root, file), "utf8").includes("forma-conformance"));
  assert.deepEqual(importing, []);
});

test("the evaluation core is pure: no imports, no browser globals", () => {
  const source = fs.readFileSync(path.join(root, "packages/conformance/src/evaluate.mjs"), "utf8");
  assert.doesNotMatch(source, /^\s*import\s/m);
  assert.doesNotMatch(source, /\b(document|window|page|fetch)\s*\./);
});

test("the publish workflow releases the conformance package when its version is new", () => {
  const workflow = fs.readFileSync(path.join(root, ".github/workflows/publish.yml"), "utf8");
  assert.match(workflow, /working-directory: packages\/conformance/);
});
