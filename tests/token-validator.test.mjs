import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

// tools/TokenValidator (LRP-001): design-token reference validation against
// the Forma installation itself. Builds once, then runs the compiled tool.
const project = path.resolve("tools/TokenValidator/TokenValidator.fsproj");
const fixtures = path.resolve("tests/fixtures/token-validation");

const build = outputDir => {
  const result = spawnSync("dotnet", ["build", project, "-c", "Release", "-o", outputDir, "-v", "q", "-nologo"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return path.join(outputDir, "forma-token-validator.dll");
};

const validator = build(fs.mkdtempSync(path.join(os.tmpdir(), "forma-token-validator-")));

const run = (...args) => {
  const result = spawnSync("dotnet", [validator, "--json", ...args], { encoding: "utf8" });
  return { status: result.status, findings: result.stdout.trim() ? JSON.parse(result.stdout) : [], stderr: result.stderr };
};

const codesAt = findings => findings.map(f => `${f.line}:${f.code}:${f.name}`).sort();

test("Forma's own token sources, brands and built stylesheets validate", () => {
  const { status, findings } = run("--self");
  assert.deepEqual(findings, []);
  assert.equal(status, 0);
});

test("application CSS: every invalid Forma reference is reported, fallbacks included", () => {
  const { status, findings } = run(path.join(fixtures, "app-invalid.css"));
  assert.equal(status, 1);
  assert.deepEqual(codesAt(findings), [
    "2:unknown-token:--forma-nonexistent-color",
    "3:unknown-token:--forma-nonexistent-color",
    "4:namespace:--forma-spacing-4",
    "5:namespace:--ef-color-text-primary",
    "6:namespace:--forma-causa-accent",
    "7:cycle:--app-a",
    "7:cycle:--app-b",
    "8:unknown-token:--forma-color-border-funtional",
    "9:internal-variable:--forma-surface-space"
  ].sort());
  const fallback = findings.find(f => f.line === 3);
  assert.match(fallback.message, /fallback value does not make it valid/);
  assert.match(findings.find(f => f.line === 8).message, /Did you mean --forma-color-border-functional\?/);
  assert.match(findings.find(f => f.line === 4).message, /--forma-primitive-spacing-4/);
  // FORMA-NS-001.3: the pre-1.0 namespace is reported, with the migration path.
  const legacy = findings.find(f => f.line === 5).message;
  assert.match(legacy, /not the Forma namespace '--forma-'/);
  assert.match(legacy, /run tools\/NamespaceMigrator/);
  assert.match(legacy, /Did you mean --forma-color-text-primary\?/);
});

test("application CSS: tokens, documented inputs, overrides and application-owned properties are valid", () => {
  const { status, findings } = run(path.join(fixtures, "app-valid.css"));
  assert.deepEqual(findings, []);
  assert.equal(status, 0);
});

test("application CSS: strings are inert and cycles only count within one rule context", () => {
  const { status, findings } = run(path.join(fixtures, "app-strings.css"));
  assert.equal(status, 1);
  assert.deepEqual(codesAt(findings), ["2:unknown-token:--forma-bad-one", "4:unknown-token:--forma-bad-two"]);
});

test("Forma sources: invalid aliases, alias cycles, theme gaps, missing definitions and deprecated use are reported", () => {
  const { status, findings } = run("--forma", path.join(fixtures, "forma-broken"), "--self");
  assert.equal(status, 1);
  const summary = findings.map(f => `${f.code}:${f.name}`).sort();
  assert.deepEqual(summary, [
    "cycle:primitive.color.loop-a",
    "cycle:primitive.color.loop-b",
    "deprecated-token:--forma-primitive-color-old-ink",
    "invalid-alias:primitive.color.dangling",
    "missing-definition:--forma-color-text-primry",
    "theme-missing:--forma-color-text-secondary",
    "theme-missing:--forma-color-text-secondary"
  ]);
  assert.ok(findings.some(f => f.code === "theme-missing" && f.file.endsWith("half.brand.json")), "brand theme gap");
  assert.ok(findings.some(f => f.code === "theme-missing" && f.file.endsWith("forma.tokens.json")), "token theme gap");
});

test("application CSS: a token the Forma version deprecates is reported with its replacement", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-token-app-"));
  const css = path.join(dir, "app.css");
  fs.writeFileSync(css, ".a { color: var(--forma-primitive-color-old-ink); }\n");
  const { status, findings } = run("--forma", path.join(fixtures, "forma-broken"), css);
  assert.equal(status, 1);
  assert.deepEqual(findings.map(f => f.code), ["deprecated-token"]);
  assert.match(findings[0].message, /Use primitive\.color\.ink/);
});

test("a consumer can run the validator from the packed package against that package", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-token-pack-"));
  const output = execFileSync("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", dir], { encoding: "utf8" });
  const archive = path.join(dir, JSON.parse(output)[0].filename);
  execFileSync("tar", ["-xzf", archive, "-C", dir]);
  const installed = path.join(dir, "package");
  const packedValidator = build(path.join(dir, "validator"));
  const result = spawnSync("dotnet", [packedValidator, "--json", "--forma", installed, path.join(fixtures, "app-invalid.css")], { encoding: "utf8" });
  assert.equal(result.status, 1, result.stderr);
  assert.ok(fs.existsSync(path.join(installed, "tools", "TokenValidator", "TokenValidator.fsproj")), "the package ships the validator source");
  const packedBuild = spawnSync("dotnet", ["build", path.join(installed, "tools", "TokenValidator", "TokenValidator.fsproj"), "-c", "Release", "-v", "q", "-nologo"], { encoding: "utf8" });
  assert.equal(packedBuild.status, 0, packedBuild.stdout + packedBuild.stderr);
  assert.equal(JSON.parse(result.stdout).length, 9);
});
