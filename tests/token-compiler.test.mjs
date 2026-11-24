import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const project = "tools/TokenCompiler/TokenCompiler.fsproj";
const canonicalPath = path.resolve("tokens/forma.tokens.json");

function runCompiler(source, output) {
  return spawnSync(
    "dotnet",
    ["run", "--project", project, "--", source, output],
    { encoding: "utf8" }
  );
}

test("canonical token source compiles deterministically", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-tokens-"));
  const first = path.join(dir, "first.css");
  const second = path.join(dir, "second.css");

  const a = runCompiler(canonicalPath, first);
  assert.equal(a.status, 0, a.stderr);
  const b = runCompiler(canonicalPath, second);
  assert.equal(b.status, 0, b.stderr);

  const one = fs.readFileSync(first, "utf8");
  const two = fs.readFileSync(second, "utf8");
  assert.equal(one, two);
  assert.match(one, /--forma-color-accent-primary: #2b5ea8/);
  assert.match(one, /--forma-color-text-on-secondary-surface: #303030/);
  assert.match(one, /--forma-color-status-danger: #b0302a/);
  assert.match(one, /--forma-primitive-motion-duration-standard: 180ms/);
});

test("unsafe status pairing is rejected", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-tokens-"));
  const source = path.join(dir, "unsafe-status.json");
  const output = path.join(dir, "unsafe-status.css");
  const data = JSON.parse(fs.readFileSync(canonicalPath, "utf8"));

  data.semantic.dark.color.status.danger.$value = "{primitive.color.status-danger}";
  fs.writeFileSync(source, JSON.stringify(data, null, 2));

  const result = runCompiler(source, output);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /dark danger status contrast/i);
});

test("unsafe dark accent pairing is rejected", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-tokens-"));
  const source = path.join(dir, "unsafe.json");
  const output = path.join(dir, "unsafe.css");
  const data = JSON.parse(fs.readFileSync(canonicalPath, "utf8"));

  data.semantic.dark.color.accent.primary.$value = "{primitive.color.blue-600}";
  fs.writeFileSync(source, JSON.stringify(data, null, 2));

  const result = runCompiler(source, output);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /dark primary accent contrast/i);
});

test("circular aliases are rejected", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-tokens-"));
  const source = path.join(dir, "cycle.json");
  const output = path.join(dir, "cycle.css");
  const data = JSON.parse(fs.readFileSync(canonicalPath, "utf8"));

  data.semantic.light.color.text.primary.$value = "{semantic.light.color.text.secondary}";
  data.semantic.light.color.text.secondary.$value = "{semantic.light.color.text.primary}";
  fs.writeFileSync(source, JSON.stringify(data, null, 2));

  const result = runCompiler(source, output);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /circular token reference/i);
});

// forma#200: breakpoints are tokens and are emitted as @custom-media.
test("breakpoint tokens compile to custom properties and @custom-media ranges", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-tokens-"));
  const output = path.join(dir, "tokens.css");
  const media = path.join(dir, "custom-media.css");
  const result = spawnSync("dotnet", ["run", "--project", project, "--", canonicalPath, output, "--custom-media", media], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const css = fs.readFileSync(output, "utf8");
  assert.match(css, /--forma-primitive-breakpoint-compact: 30rem;/);
  assert.match(css, /--forma-primitive-breakpoint-tablet: 48rem;/);
  assert.match(css, /--forma-primitive-breakpoint-desktop: 64rem;/);
  const rules = fs.readFileSync(media, "utf8").split("\n").filter((line) => line.startsWith("@custom-media"));
  assert.deepEqual(rules, [
    "@custom-media --forma-below-compact (width < 30rem);",
    "@custom-media --forma-from-compact (width >= 30rem);",
    "@custom-media --forma-below-tablet (width < 48rem);",
    "@custom-media --forma-from-tablet (width >= 48rem);",
    "@custom-media --forma-below-desktop (width < 64rem);",
    "@custom-media --forma-from-desktop (width >= 64rem);"
  ]);
});

test("--custom-media fails when the source declares no breakpoints", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-tokens-"));
  const source = path.join(dir, "no-breakpoints.json");
  const data = JSON.parse(fs.readFileSync(canonicalPath, "utf8"));
  delete data.primitive.breakpoint;
  fs.writeFileSync(source, JSON.stringify(data, null, 2));
  const result = spawnSync("dotnet", ["run", "--project", project, "--", source, path.join(dir, "t.css"), "--custom-media", path.join(dir, "m.css")], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /requires primitive\.breakpoint tokens/);
});
