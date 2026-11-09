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
  assert.match(result.stdout, /rewrote 22 line\(s\) in 11 of 11 file\(s\); 1 other file\(s\) to review/);
  assert.deepEqual(snapshot(dir), snapshot(path.join(fixtures, "expected")));
});

test("--check reports and writes nothing, exit 3; exit 0 once migrated", () => {
  const dir = copyInput();
  const before = snapshot(dir);
  const check = run("--check", dir);
  assert.equal(check.status, 3, check.stdout + check.stderr);
  assert.match(check.stdout, /would rewrite 22 line\(s\) in 11 of 11 file\(s\)/);
  assert.match(check.stdout, /styles\.css: 4 line\(s\)/);
  assert.deepEqual(snapshot(dir), before, "--check must not write");
  assert.equal(run(dir).status, 0);
  // A text file of a kind the tool does not rewrite still holds tokens:
  // --check never gives a false all-clear.
  const review = run("--check", dir);
  assert.equal(review.status, 3, review.stdout);
  assert.match(review.stdout, /review: .*ignored\.txt contains namespace tokens/);
  const again = run("--check", "--exclude", "ignored.txt", dir);
  assert.equal(again.status, 0, again.stdout);
  assert.match(again.stdout, /would rewrite 0 line\(s\) in 0 of 11 file\(s\); 0 other file\(s\) to review/);
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

test("unsupported file types, build output, vendored copies and dependencies are not touched by default", () => {
  const dir = copyInput();
  run(dir);
  assert.equal(fs.readFileSync(path.join(dir, "ignored.txt"), "utf8"), fs.readFileSync(path.join(fixtures, "input/ignored.txt"), "utf8"));
  assert.equal(fs.readFileSync(path.join(dir, "bin/out.css"), "utf8"), ".ef-from-build-output {}\n");
  assert.equal(fs.readFileSync(path.join(dir, "vendor/v.css"), "utf8"), ".ef-from-vendor {}\n");
  assert.equal(fs.readFileSync(path.join(dir, "wwwroot/lib/pkg/l.css"), "utf8"), ".ef-from-client-lib {}\n");
  assert.equal(fs.readFileSync(path.join(dir, "dist/d.css"), "utf8"), ".ef-from-build {}\n");
});

test("--include-vendored also rewrites vendored copies and build output (never bin, obj, node_modules)", () => {
  const dir = copyInput();
  assert.equal(run("--include-vendored", dir).status, 0);
  assert.equal(fs.readFileSync(path.join(dir, "vendor/v.css"), "utf8"), ".forma-from-vendor {}\n");
  assert.equal(fs.readFileSync(path.join(dir, "wwwroot/lib/pkg/l.css"), "utf8"), ".forma-from-client-lib {}\n");
  assert.equal(fs.readFileSync(path.join(dir, "dist/d.css"), "utf8"), ".forma-from-build {}\n");
  assert.equal(fs.readFileSync(path.join(dir, "bin/out.css"), "utf8"), ".ef-from-build-output {}\n");
});

test("a UTF-8 byte-order mark and CRLF line endings are preserved", () => {
  const dir = copyInput();
  run(dir);
  const bytes = fs.readFileSync(path.join(dir, "bom-crlf.css"));
  assert.deepEqual([...bytes.subarray(0, 3)], [0xef, 0xbb, 0xbf], "BOM kept");
  assert.equal(bytes.subarray(3).toString("utf8"), ".forma-bom {}\r\n.forma-crlf { color: var(--forma-x); }\r\n");
  const plain = path.join(dir, "styles.css");
  assert.notEqual(fs.readFileSync(plain)[0], 0xef, "no BOM added to a file without one");
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
    ["`ef-*`", "`forma-*`"],
    ['x.dataset["efState"]', 'x.dataset["formaState"]'],
    ["x.dataset['efX']", "x.dataset['formaX']"],
    ["const { efTone } = el.dataset;", "const { formaTone: efTone } = el.dataset;"],
    ["const { efTone: tone, efRow } = this.el.dataset;", "const { formaTone: tone, formaRow: efRow } = this.el.dataset;"],
    ["text.match(/--ef-[a-z]+/g)", "text.match(/--forma-[a-z]+/g)"],
    ['s.replace(/data-ef-row="1"/, "")', 's.replace(/data-forma-row="1"/, "")']
  ];
  for (const [input, output] of cases) assert.equal(migrateText(input, "mjs"), output, input);
  for (const [input, output, extension] of [
    ['<div className="ef-card" data-ef-tone="inverse" />', '<div className="forma-card" data-forma-tone="inverse" />', "tsx"],
    ["const c: string = \"ef-card\";", "const c: string = \"forma-card\";", "ts"],
    [".ef-card { &__title { color: var(--ef-x); } }", ".forma-card { &__title { color: var(--forma-x); } }", "scss"],
    ['<section class="ef-surface" data-ef-tone="@Tone"></section>', '<section class="forma-surface" data-forma-tone="@Tone"></section>', "razor"],
    ['<aside class="ef-callout" :data-ef-callout="k"></aside>', '<aside class="forma-callout" :data-forma-callout="k"></aside>', "vue"]
  ]) assert.equal(migrateText(input, extension), output, `${extension}: ${input}`);
});

test("locations are never rewritten: URLs, hosts, paths, file names, url(), @import, module specifiers, scoped packages", () => {
  const cases = [
    ["css", '@import url("https://fonts.example.com/ef-sans.css");'],
    ["css", '@import "../ef-base.css";'],
    ["css", ".x { background: url(/img/ef-bg.png); }"],
    ["mjs", 'const u = "https://cdn.example.com/ef-icons/sprite.svg";'],
    ["mjs", 'const h = "https://ef-cdn.example.org/a.js";'],
    ["mjs", 'import x from "@ef-labs/widget";'],
    ["mjs", 'const y = require("ef-pkg/ef-x");'],
    ["mjs", 'const p = "/assets/ef-logo.svg";'],
    ["mjs", 'const host = "ef-cdn.example.org";'],
    ["mjs", 'const f = "ef-page.html";'],
    ["html", '<img src="/assets/ef-logo.svg" alt="">'],
    ["html", '<a href="ef-page.html">Page</a>'],
    ["html", '<script src="//cdn.example.com/ef-a.js"></script>'],
    ["md", "[Guide](ef-guide.md) and <https://example.com/ef-x>"]
  ];
  for (const [extension, text] of cases) assert.equal(migrateText(text, extension), text, text);
  // ... while a Forma name next to a location still migrates.
  assert.equal(migrateText('<a class="ef-link" href="https://example.com/ef-x">x</a>', "html"), '<a class="forma-link" href="https://example.com/ef-x">x</a>');
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
