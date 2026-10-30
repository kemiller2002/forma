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

test("boundary.corner: text crossing a rounded corner fails; text clear of it passes", async () => {
  const { evaluateCornerContainment, resolveCornerRadius, STATUS } = await import(path.join(root, "packages/conformance/src/evaluate.mjs"));
  const rect = { left: 0, top: 0, width: 100, height: 40 };
  const line = { text: "a", left: 2, top: 2, right: 98, bottom: 38 };
  // A 999px radius normalises to a 20px stadium; the line's corner is 5.46px outside.
  const pill = evaluateCornerContainment({ name: "pill", rect, radii: Array(4).fill("999px"), fragments: [line] });
  assert.equal(pill.status, STATUS.FAIL);
  assert.ok(Math.abs(pill.worst.excess - 5.46) < 0.01);
  const capped = evaluateCornerContainment({ name: "capped", rect, radii: Array(4).fill("min(999px, 2px)"), fragments: [line] });
  assert.equal(capped.status, STATUS.PASS);
  // The visible boundary is the inner border edge.
  const bordered = evaluateCornerContainment({ name: "border", rect, radii: Array(4).fill("0px"), border: { top: 3, right: 3, bottom: 3, left: 3 }, fragments: [line] });
  assert.equal(bordered.status, STATUS.FAIL);
  assert.equal(evaluateCornerContainment({ name: "empty", rect, radii: [], fragments: [] }).status, STATUS.UNKNOWN);
  assert.deepEqual(resolveCornerRadius("50% 10px", 100, 40), { rx: 50, ry: 10 });
});

test("contain.element: a descendant past the content box fails; contained descendants pass", async () => {
  const { evaluateContainment, STATUS } = await import(path.join(root, "packages/conformance/src/evaluate.mjs"));
  const content = { left: 16, top: 16, right: 304, bottom: 400 };
  const inside = { label: "span", left: 16, top: 20, right: 300, bottom: 40 };
  const escaping = { label: 'span "sha256:9f86d0"', left: 16, top: 60, right: 520.4, bottom: 80 };
  assert.equal(evaluateContainment({ name: "card", content, items: [inside] }).status, STATUS.PASS);
  const failed = evaluateContainment({ name: "card", content, items: [inside, escaping] });
  assert.equal(failed.status, STATUS.FAIL);
  assert.deepEqual(failed.escapes, [{ label: 'span "sha256:9f86d0"', side: "right", excess: 216.4 }]);
  // Block containment is only judged when asked for.
  const tall = { label: "p", left: 16, top: 20, right: 300, bottom: 480 };
  assert.equal(evaluateContainment({ name: "card", content, items: [tall] }).status, STATUS.PASS);
  assert.equal(evaluateContainment({ name: "card", content, axes: ["inline", "block"], items: [tall] }).status, STATUS.FAIL);
  // Missing evidence is UNKNOWN, never PASS.
  assert.equal(evaluateContainment({ name: "card", content, items: [] }).status, STATUS.UNKNOWN);
  assert.equal(evaluateContainment({ name: "card", items: [inside] }).status, STATUS.UNKNOWN);
});

test("focus.unclipped: a clipping ancestor that cuts the ring fails; the viewport edge only needs part in view", async () => {
  const { evaluateFocusVisibility, STATUS } = await import(path.join(root, "packages/conformance/src/evaluate.mjs"));
  const viewport = { width: 320, height: 900 };
  const ring = { left: 95, top: 95, right: 205, bottom: 145 };
  assert.equal(evaluateFocusVisibility({ name: "Save", indicator: true, ring, clips: [], viewport }).status, STATUS.PASS);
  assert.equal(evaluateFocusVisibility({ name: "Save", indicator: false, ring, clips: [], viewport }).status, STATUS.FAIL);
  const clipped = evaluateFocusVisibility({ name: "Save", indicator: true, ring, clips: [{ label: "div.ef-surface", left: 100, top: 0, right: 300, bottom: 900 }], viewport });
  assert.equal(clipped.status, STATUS.FAIL);
  assert.deepEqual(clipped.cutBy, [{ label: "div.ef-surface", excess: 5 }]);
  // An element taller than its scroller only needs a visible part on that axis.
  const tall = { left: 95, top: -300, right: 205, bottom: 1300 };
  assert.equal(evaluateFocusVisibility({ name: "Long", indicator: true, ring: tall, clips: [{ label: "div.clip", left: 40, top: 40, right: 280, bottom: 860 }], viewport }).status, STATUS.PASS);
  // A scroll container's edge, like the viewport's, only needs part in view.
  const atScrollEdge = evaluateFocusVisibility({ name: "Keep", indicator: true, ring: { left: 95, top: 840, right: 205, bottom: 862 }, clips: [{ label: "dialog", scrolls: true, left: 40, top: 40, right: 280, bottom: 860 }], viewport });
  assert.equal(atScrollEdge.status, STATUS.PASS);
  assert.equal(atScrollEdge.scrollEdge, 2);
  assert.equal(evaluateFocusVisibility({ name: "Below", indicator: true, ring: { left: 95, top: 870, right: 205, bottom: 890 }, clips: [{ label: "dialog", scrolls: true, left: 40, top: 40, right: 280, bottom: 860 }], viewport }).status, STATUS.FAIL);
  // The viewport edge is the user agent's scroll policy: partly in view passes and is reported; wholly outside fails.
  const edge = evaluateFocusVisibility({ name: "Edge", indicator: true, ring: { left: 95, top: 880, right: 205, bottom: 930 }, clips: [], viewport });
  assert.equal(edge.status, STATUS.PASS);
  assert.equal(edge.viewportEdge, 30);
  assert.equal(evaluateFocusVisibility({ name: "Gone", indicator: true, ring: { left: 95, top: 1000, right: 205, bottom: 1050 }, clips: [], viewport }).status, STATUS.FAIL);
  assert.equal(evaluateFocusVisibility({ name: null, ring: null, viewport: null }).status, STATUS.UNKNOWN);
});
