// FORMA-NS-001.2: tools/NamespaceMigrator rewrites the pre-1.0 `ef-` namespace
// to `forma-` in HTML, CSS, JS/MJS, F#, JSON and Markdown, touches only
// namespace tokens, and offers --check (exit 3 when anything would change),
// --dry-run and write modes. It ships in the npm package.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const fixtures = "tests/fixtures/namespace-migrator";
const build = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-"));
execFileSync("dotnet", ["build", "tools/NamespaceMigrator/NamespaceMigrator.fsproj", "-c", "Release", "-o", build], { stdio: "pipe" });
const dll = path.join(build, "forma-namespace-migrator.dll");
const run = (...args) => spawnSync("dotnet", [dll, ...args], { encoding: "utf8" });

const copyInput = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-in-"));
  fs.cpSync(path.join(fixtures, "input"), dir, { recursive: true });
  return dir;
};
const files = (dir) => fs.readdirSync(dir, { recursive: true }).filter((file) => fs.statSync(path.join(dir, file)).isFile()).sort();
const snapshot = (dir) => Object.fromEntries(files(dir).map((file) => [file, fs.readFileSync(path.join(dir, file), "utf8")]));
const migrateText = (text, extension = "css") => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-one-"));
  const file = path.join(dir, `sample.${extension}`);
  fs.writeFileSync(file, text);
  const result = run(file);
  assert.equal(result.status, 0, result.stderr);
  return fs.readFileSync(file, "utf8");
};

test("write mode rewrites the fixtures exactly to the expected output", () => {
  const dir = copyInput();
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /rewrote 12 line\(s\) in 6 of 6 file\(s\)/);
  assert.deepEqual(snapshot(dir), snapshot(path.join(fixtures, "expected")));
});

test("--check reports and writes nothing, exit 3; exit 0 once migrated", () => {
  const dir = copyInput();
  const before = snapshot(dir);
  const check = run("--check", dir);
  assert.equal(check.status, 3, check.stdout + check.stderr);
  assert.match(check.stdout, /would rewrite 12 line\(s\) in 6 of 6 file\(s\)/);
  assert.match(check.stdout, /styles\.css: 3 line\(s\)/);
  assert.deepEqual(snapshot(dir), before, "--check must not write");
  assert.equal(run(dir).status, 0);
  const again = run("--check", dir);
  assert.equal(again.status, 0, again.stdout);
  assert.match(again.stdout, /would rewrite 0 line\(s\)/);
});

test("--dry-run prints each changed line before and after and writes nothing", () => {
  const dir = copyInput();
  const before = snapshot(dir);
  const result = run("--dry-run", dir);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /script\.mjs:2 \[dataset\]/);
  assert.match(result.stdout, /- document\.documentElement\.dataset\.efBrand = "harbor"/);
  assert.match(result.stdout, /\+ document\.documentElement\.dataset\.formaBrand = "harbor"/);
  assert.deepEqual(snapshot(dir), before, "--dry-run must not write");
});

test("the migration is idempotent", () => {
  const expected = path.join(fixtures, "expected");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-idem-"));
  fs.cpSync(expected, dir, { recursive: true });
  assert.equal(run(dir).status, 0);
  assert.deepEqual(snapshot(dir), snapshot(expected));
});

test("unsupported file types, build output and dependencies are not touched", () => {
  const dir = copyInput();
  run(dir);
  assert.equal(fs.readFileSync(path.join(dir, "ignored.txt"), "utf8"), fs.readFileSync(path.join(fixtures, "input/ignored.txt"), "utf8"));
  assert.equal(fs.readFileSync(path.join(dir, "bin/out.css"), "utf8"), ".ef-from-build-output {}\n");
});

test("--exclude skips matching paths", () => {
  const dir = copyInput();
  const result = run("--exclude", "notes.md", dir);
  assert.equal(result.status, 0);
  assert.equal(fs.readFileSync(path.join(dir, "notes.md"), "utf8"), fs.readFileSync(path.join(fixtures, "input/notes.md"), "utf8"));
});

test("every namespace token form is rewritten", () => {
  const cases = [
    [".ef-button{}", ".forma-button{}"],
    ["<ef-card></ef-card>", "<forma-card></forma-card>"],
    ['class="ef-a ef-b"', 'class="forma-a forma-b"'],
    ["var(--ef-a,var(--ef-b))", "var(--forma-a,var(--forma-b))"],
    ['[data-ef-theme="dark"]', '[data-forma-theme="dark"]'],
    ["x.dataset.efLen", "x.dataset.formaLen"],
    ["x.dataset?.efLen", "x.dataset?.formaLen"],
    ['"ef-component-tag"', '"forma-component-tag"'],
    ["#ef-anchor", "#forma-anchor"],
    ["(ef-)", "(forma-)"],
    ["/\\bef-x/", "/\\bforma-x/"],
    ["`ef-*`", "`forma-*`"]
  ];
  for (const [input, output] of cases) assert.equal(migrateText(input), output, input);
});

test("adversarial words are not namespace tokens", () => {
  for (const word of ["ref-", "chef-", "beef-", "--ref-x", "--chef-x", "x-ef-y", "x--ef-y", "data-xef-y", "--xef-y", "efc-x", "ef_x", "ef",
    "effect-x", "--effect-x", "reference-ef-", "dataset.effect", "myDataset.efX", "abef-z", "self-ef-", "Ef-x", "EF-x", "--forma-x", "forma-ef"]) {
    assert.equal(migrateText(`a ${word} b`), `a ${word} b`, word);
  }
});

test("invalid arguments exit 2", () => {
  assert.equal(run().status, 2);
  assert.equal(run("--check", "--dry-run", ".").status, 2);
  assert.equal(run("--bogus", ".").status, 2);
  assert.equal(run(path.join(os.tmpdir(), "forma-nsm-does-not-exist")).status, 2);
});

test("the migrator ships in the npm package without build output", () => {
  const output = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { encoding: "utf8" });
  const packed = new Set(JSON.parse(output)[0].files.map((file) => file.path));
  for (const file of ["tools/NamespaceMigrator/NamespaceMigrator.fsproj", "tools/NamespaceMigrator/Migration.fs", "tools/NamespaceMigrator/Program.fs"]) {
    assert.ok(packed.has(file), `package omits ${file}`);
  }
  assert.ok(![...packed].some((file) => /^tools\/NamespaceMigrator\/(bin|obj)\//.test(file)));
});
