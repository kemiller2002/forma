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

const validator = build(fs.mkdtempSync(path.join(os.tmpdir(), "ef-token-validator-")));

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
    "2:unknown-token:--ef-nonexistent-color",
    "3:unknown-token:--ef-nonexistent-color",
    "4:namespace:--ef-spacing-4",
    "5:namespace:--forma-color-text-primary",
    "6:namespace:--ef-causa-accent",
    "7:cycle:--app-a",
    "7:cycle:--app-b",
    "8:unknown-token:--ef-color-border-funtional",
    "9:internal-variable:--ef-surface-space"
  ].sort());
  const fallback = findings.find(f => f.line === 3);
  assert.match(fallback.message, /fallback value does not make it valid/);
  assert.match(findings.find(f => f.line === 8).message, /Did you mean --ef-color-border-functional\?/);
  assert.match(findings.find(f => f.line === 4).message, /--ef-primitive-spacing-4/);
});

test("application CSS: tokens, documented inputs, overrides and application-owned properties are valid", () => {
  const { status, findings } = run(path.join(fixtures, "app-valid.css"));
  assert.deepEqual(findings, []);
  assert.equal(status, 0);
});

test("application CSS: strings are inert and cycles only count within one rule context", () => {
  const { status, findings } = run(path.join(fixtures, "app-strings.css"));
  assert.equal(status, 1);
  assert.deepEqual(codesAt(findings), ["2:unknown-token:--ef-bad-one", "4:unknown-token:--ef-bad-two"]);
});

test("Forma sources: invalid aliases, alias cycles, theme gaps, missing definitions and deprecated use are reported", () => {
  const { status, findings } = run("--forma", path.join(fixtures, "forma-broken"), "--self");
  assert.equal(status, 1);
  const summary = findings.map(f => `${f.code}:${f.name}`).sort();
  assert.deepEqual(summary, [
    "cycle:primitive.color.loop-a",
    "cycle:primitive.color.loop-b",
    "deprecated-token:--ef-primitive-color-old-ink",
    "invalid-alias:primitive.color.dangling",
    "missing-definition:--ef-color-text-primry",
    "theme-missing:--ef-color-text-secondary",
    "theme-missing:--ef-color-text-secondary"
  ]);
  assert.ok(findings.some(f => f.code === "theme-missing" && f.file.endsWith("half.brand.json")), "brand theme gap");
  assert.ok(findings.some(f => f.code === "theme-missing" && f.file.endsWith("echelon.tokens.json")), "token theme gap");
});

test("application CSS: a token the Forma version deprecates is reported with its replacement", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ef-token-app-"));
  const css = path.join(dir, "app.css");
  fs.writeFileSync(css, ".a { color: var(--ef-primitive-color-old-ink); }\n");
  const { status, findings } = run("--forma", path.join(fixtures, "forma-broken"), css);
  assert.equal(status, 1);
  assert.deepEqual(findings.map(f => f.code), ["deprecated-token"]);
  assert.match(findings[0].message, /Use primitive\.color\.ink/);
});

test("a consumer can run the validator from the packed package against that package", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ef-token-pack-"));
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
