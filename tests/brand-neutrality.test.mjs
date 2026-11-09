// BNR-001.5 (EDS-ADR-002): Forma carries no organization identity. The guard
// in tools/brand-neutrality.mjs is absolute: zero Echelon identity, zero
// former Echelon-palette literals and zero `@layer echelon` names in the
// source CSS, in dist/ and in the packed npm tarball. It replaced the
// AIS-001.4 ratchet (Forma 0.14.0: 483 palette literals in generic CSS).
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  ECHELON_PALETTE, SOURCE_CSS, identityFindings, layerFindings, packTarball, paletteFindings,
  scanDirectory, scanSourceCss, scanTarball, scanText
} from "../tools/brand-neutrality.mjs";
import { AIS_MARKER, aisBlock, colorLiterals } from "./support/color-literals.mjs";

const show = (findings) => findings.map((f) => `${f.kind} ${f.file} ${f.match}`).join("\n");

test("the guard covers every source stylesheet", () => {
  const sources = SOURCE_CSS();
  for (const file of ["src/styles/foundations.css", "src/styles/components.css", "src/styles/skins.css", "src/styles/assessment.css",
    "src/marketing/roles.css", "src/marketing/foundations.css", "src/marketing/components.css", "src/marketing/layouts.css",
    "packages/workflow/src/forma-workflow.css"]) {
    assert.ok(sources.includes(file), `${file} is not scanned`);
  }
});

test("source CSS carries no organization identity, palette literal or layer name", () => {
  const findings = scanSourceCss();
  assert.deepEqual(findings, [], show(findings));
});

test("dist/ carries no organization identity, palette literal or layer name", () => {
  assert.ok(fs.existsSync("dist/all.css"), "run npm run build first");
  const findings = scanDirectory("dist");
  assert.deepEqual(findings, [], show(findings));
});

test("the packed npm tarball carries no organization identity, palette literal or layer name", () => {
  const tarball = packTarball();
  const findings = scanTarball(tarball);
  assert.deepEqual(findings, [], show(findings));
});

test("no Echelon brand, theme, bundle or example remains in the repository", () => {
  for (const file of ["brands/echelon.brand.json", "themes/echelon", "bundles/echelon-marketing.bundle.json", "examples/echelon-marketing-site",
    "tokens/echelon.tokens.json", "dist/brands/echelon.css", "dist/marketing/forma-echelon-marketing.css", "dist/marketing/forma-marketing-theme-echelon.css"]) {
    assert.ok(!fs.existsSync(file), `${file} must not exist`);
  }
  for (const file of fs.readdirSync("brands")) {
    const manifest = JSON.parse(fs.readFileSync(path.join("brands", file), "utf8"));
    assert.deepEqual(scanText(file, JSON.stringify(manifest)), [], file);
  }
});

test("the AIS-001 rules contain no color literal", () => {
  const block = aisBlock();
  assert.ok(block, `components.css must keep the marker "${AIS_MARKER}"`);
  assert.deepEqual(colorLiterals(block), []);
});

// --- Adversarial fixtures: every detector must fire on the leak it exists for.

test("identity detector catches names, logo paths and palette names; allows publisher metadata only", () => {
  assert.equal(identityFindings(".x { background: url(/brand/echelon-logo.svg); }").length, 2);
  assert.equal(identityFindings('.x::after { content: "Echelon Foundry"; }').length, 1);
  assert.equal(identityFindings("/* Echelon */ .x {}").length, 1, "comments are not exempt");
  assert.equal(identityFindings(".x { color: var(--forma-color-oxide-bronze); }").length, 1);
  assert.equal(identityFindings(".x { --verdigris: 1; --foundry-charcoal: 2; --forged-iron: 3; }").length, 3);
  assert.equal(identityFindings('[data-forma-brand="echelon"] {}').length, 1);
  assert.equal(identityFindings("const KEY = \"__ECHELON_RUNTIME__\";", "dist/components.js").length, 1,
    "the runtime contract is allowed in runtime.js only");
  assert.deepEqual(identityFindings("const KEY = \"__ECHELON_RUNTIME__\"; registerEchelonRuntime(); // Echelon Runtime", "dist/runtime.js"), []);
  assert.deepEqual(identityFindings('npm install @echelon-foundry/design-system; see https://forma.echelonfoundry.com/schemas/x.json'), []);
  assert.equal(identityFindings("@echelon-foundry/design-system Echelon").length, 1, "a scope does not excuse a bare name next to it");
});

test("palette detector catches every way of writing a former Echelon color", () => {
  for (const leak of ["#905831", "#905831cc", "#905831CC", "#F2EFE7", "rgb(144, 88, 49)", "rgba(144,88,49,.5)", "rgb(23 26 24 / 0.48)"]) {
    assert.equal(paletteFindings(`.x { color: ${leak}; }`).length, 1, leak);
  }
  for (const clean of ["#2b5ea8", "#fafafa", "#161616", "rgb(22 22 22 / 0.48)", "var(--forma-color-accent-primary)"]) {
    assert.deepEqual(paletteFindings(`.x { color: ${clean}; }`), [], clean);
  }
  assert.ok(ECHELON_PALETTE.has("#905831") && ECHELON_PALETTE.size >= 18);
});

test("layer detector catches @layer echelon statements and blocks", () => {
  assert.equal(layerFindings("@layer echelon.components { .x {} }").length, 1);
  assert.equal(layerFindings("@layer forma.tokens, echelon.theme;").length, 1);
  assert.equal(layerFindings("@layer ECHELON.brand{").length, 1);
  assert.deepEqual(layerFindings("@layer forma.tokens, forma.brand;"), []);
});

test("a reappearing Echelon brand manifest, brand CSS or marketing bundle fails a scanned tree", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "forma-guard-"));
  fs.mkdirSync(path.join(root, "dist/brands"), { recursive: true });
  fs.mkdirSync(path.join(root, "brands"));
  const manifest = JSON.parse(fs.readFileSync("brands/example-harbor.brand.json", "utf8"));
  fs.writeFileSync(path.join(root, "brands/neutral-looking.brand.json"), JSON.stringify({ ...manifest, id: "echelon", identity: { name: "Echelon Foundry" } }));
  fs.writeFileSync(path.join(root, "dist/brands/echelon.css"), ".x { color: #000000; }\n");
  fs.writeFileSync(path.join(root, "dist/brands/renamed.css"), "@layer forma.brand { [data-forma-brand=\"x\"] { --forma-color-accent-primary: #905831; } }\n");
  fs.writeFileSync(path.join(root, "dist/clean.css"), "@layer forma.tokens { :root { --forma-color-accent-primary: #2b5ea8; } }\n");
  const findings = scanDirectory(root, "fixture");
  const files = new Set(findings.map((f) => f.file));
  assert.ok(files.has(path.join("fixture", "brands/neutral-looking.brand.json")), show(findings));
  assert.ok(files.has(path.join("fixture", "dist/brands/echelon.css")), "an echelon file name is identity");
  assert.ok(findings.some((f) => f.file.endsWith("renamed.css") && f.kind === "palette"), "a renamed brand with Echelon colors");
  assert.ok(!files.has(path.join("fixture", "dist/clean.css")));
});

test("a tarball with a planted Echelon asset fails the tarball scan", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "forma-guard-"));
  fs.mkdirSync(path.join(root, "package/dist/marketing"), { recursive: true });
  fs.writeFileSync(path.join(root, "package/dist/marketing/forma-echelon-marketing.css"), "/* theme */\n");
  fs.writeFileSync(path.join(root, "package/dist/tokens.css"), ":root { --forma-color-surface-primary: #f2efe7; }\n");
  const tarball = path.join(root, "planted.tgz");
  execFileSync("tar", ["-czf", tarball, "-C", root, "package"]);
  const findings = scanTarball(tarball);
  assert.ok(findings.some((f) => f.file.endsWith("forma-echelon-marketing.css") && f.kind === "identity"), show(findings));
  assert.ok(findings.some((f) => f.file.endsWith("tokens.css") && f.kind === "palette"), show(findings));
});

test("CHANGELOG.md is the only exempt file: it records the removal", () => {
  assert.deepEqual(scanText("CHANGELOG.md", "Removed the Echelon brand (#905831, @layer echelon.brand)."), []);
  assert.ok(scanText("docs/CHANGELOG-copy.md", "Removed the Echelon brand.").length > 0);
});
