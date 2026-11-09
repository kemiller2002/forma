// FORMA-NS-001.4: no pre-1.0 `ef-` namespace token remains in Forma's source
// CSS, dist/ or the packed npm tarball (tools/namespace-guard.mjs).
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { packTarball } from "../tools/brand-neutrality.mjs";
import { exempt, legacyTokens, scanDirectory, scanSourceCss, scanTarball, scanText } from "../tools/namespace-guard.mjs";

const show = (findings) => findings.slice(0, 40).map((f) => `${f.file} ${f.match}`).join("\n");

test("source CSS uses only the forma- namespace", () => {
  const findings = scanSourceCss();
  assert.deepEqual(findings, [], show(findings));
});

test("dist/ uses only the forma- namespace", () => {
  assert.ok(fs.existsSync("dist/all.css"), "run npm run build first");
  const findings = scanDirectory("dist");
  assert.deepEqual(findings, [], show(findings));
});

test("the packed npm tarball uses only the forma- namespace", () => {
  const findings = scanTarball(packTarball());
  assert.deepEqual(findings, [], show(findings));
});

test("the compilers emit the forma- namespace", () => {
  const brand = fs.readFileSync("dist/brands/example-harbor.css", "utf8");
  assert.match(brand, /^\s*\[data-forma-brand="example-harbor"\] \{/m);
  assert.match(brand, /\[data-forma-theme="dark"\] \[data-forma-brand="example-harbor"\]/);
  assert.match(brand, /--forma-color-accent-primary: #/);
  const tokens = fs.readFileSync("dist/tokens.css", "utf8");
  assert.match(tokens, /:root, \[data-forma-theme="light"\] \{/);
  assert.match(tokens, /--forma-color-surface-primary: #fafafa;/);
});

// --- Adversarial fixtures

test("every legacy token form is detected", () => {
  for (const leak of [".ef-button {}", "<ef-card>", "</ef-card>", 'class="x ef-y"', "var(--ef-a)", "--ef-a: 1;", '[data-ef-theme="dark"]',
    "el.dataset.efRow", "el.dataset?.efRow", 'el.dataset["efRow"]', '"ef-component-tag"', "/\\bef-x/", "`ef-*`", "#ef-id"]) {
    assert.equal(legacyTokens(leak).length, 1, leak);
  }
});

test("words that only contain ef- are not tokens", () => {
  for (const word of ["ref-x", "chef-x", "beef-x", "--ref-x", "--chef-x", "x-ef-y", "x--ef-y", "data-xef-y", "--xef-y", "efc-x", "ef_x",
    "effect-x", "dataset.effect", "myDataset.efX", "--forma-color", "data-forma-brand", ".forma-button", "<forma-card>"]) {
    assert.deepEqual(legacyTokens(`a ${word} b`), [], word);
  }
});

test("a planted legacy token in a scanned tree or tarball is found", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "forma-ns-guard-"));
  fs.mkdirSync(path.join(root, "package/dist/brands"), { recursive: true });
  fs.writeFileSync(path.join(root, "package/dist/all.css"), ".forma-button { color: var(--forma-color-text-primary); }\n");
  fs.writeFileSync(path.join(root, "package/dist/brands/stale.css"), '[data-ef-brand="stale"] { --ef-color-accent-primary: #2b5ea8; }\n');
  fs.writeFileSync(path.join(root, "package/dist/runtime.js"), "el.dataset.efTheme = 'dark';\n");
  const tarball = path.join(root, "planted.tgz");
  execFileSync("tar", ["-czf", tarball, "-C", root, "package"]);
  const findings = scanTarball(tarball);
  assert.deepEqual(findings.map((f) => `${path.basename(f.file)} ${f.match}`).sort(),
    ["runtime.js efTheme", "stale.css --ef-color-accent-primary", "stale.css data-ef-brand="]);
});

test("only the changelog and the codemod are exempt", () => {
  assert.ok(exempt("CHANGELOG.md") && exempt("tarball/CHANGELOG.md"));
  assert.ok(exempt("tarball/tools/NamespaceMigrator/Migration.fs"));
  assert.ok(!exempt("tarball/tools/TokenValidator/Validation.fs"));
  assert.ok(!exempt("tarball/docs/BRANDING.md"));
  assert.ok(scanText("docs/CONSUMING-FORMA.md", ".ef-button").length === 1);
});
