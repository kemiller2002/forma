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
  assert.match(result.stdout, /rewrote 32 line\(s\) in 17 of 18 file\(s\); 2 other file\(s\) to review/);
  assert.deepEqual(snapshot(dir), snapshot(path.join(fixtures, "expected")));
});

test("--check reports and writes nothing, exit 3; exit 0 once migrated", () => {
  const dir = copyInput();
  const before = snapshot(dir);
  const check = run("--check", dir);
  assert.equal(check.status, 3, check.stdout + check.stderr);
  assert.match(check.stdout, /would rewrite 32 line\(s\) in 17 of 18 file\(s\)/);
  assert.match(check.stdout, /styles\.css: 4 line\(s\)/);
  assert.deepEqual(snapshot(dir), before, "--check must not write");
  assert.equal(run(dir).status, 0);
  // A text file of a kind the tool does not rewrite still holds tokens:
  // --check never gives a false all-clear.
  const review = run("--check", dir);
  assert.equal(review.status, 3, review.stdout);
  assert.match(review.stdout, /review: .*ignored\.txt contains namespace tokens/);
  // A supported kind that is not UTF-8 is never rewritten, and never passed silently.
  assert.match(review.stdout, /review: .*latin1\.css \(not UTF-8\) contains namespace tokens/);
  // A string that is either a selector or a file name stays unrewritten and is listed.
  assert.match(review.stdout, /review: .*jsx-tags\.tsx:4 "\.ef-config\.json" is either a class selector or a file name/);
  const again = run("--check", "--exclude", "ignored.txt", "--exclude", "latin1.css", "--exclude", "jsx-tags.tsx", dir);
  assert.equal(again.status, 0, again.stdout);
  assert.match(again.stdout, /would rewrite 0 line\(s\) in 0 of 17 file\(s\); 0 other file\(s\) to review; 0 ambiguous string\(s\) to review/);
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

// Forma 1.0.1 (WI-0048): names 1.0.0 mistook for locations are migrated;
// genuine locations still are not.
test("script assignments to src/data/background, call arguments after [i], class selectors with file- or host-like suffixes and typed dataset destructuring are migrated", () => {
  for (const [input, output, extension] of [
    ['const data = "ef-card";', 'const data = "forma-card";', "mjs"],
    ["const src = 'ef-button';", "const src = 'forma-button';", "ts"],
    ['x.background = "ef-hero";', 'x.background = "forma-hero";', "js"],
    ['let href = "ef-nav"', 'let href = "forma-nav"', "fs"],
    ['handlers[0]("ef-x");', 'handlers[0]("forma-x");', "mjs"],
    ['handlers[0]("ef-x") in prose', 'handlers[0]("forma-x") in prose', "md"],
    ['<script>const data = "ef-card";</script>', '<script>const data = "forma-card";</script>', "html"],
    [".ef-shell.app {}", ".forma-shell.app {}", "css"],
    [".ef-tabs.test {}", ".forma-tabs.test {}", "css"],
    [".ef-icon.svg {}", ".forma-icon.svg {}", "scss"],
    [".ef-card.md, .ef-card.map {}", ".forma-card.md, .forma-card.map {}", "css"],
    [".ef-shell.ef-tabs.test {}", ".forma-shell.forma-tabs.test {}", "css"],
    ['el.querySelector(".ef-icon.is-open")', 'el.querySelector(".forma-icon.is-open")', "mjs"],
    // Restored from 1.0.1: a selector API argument is unambiguously a selector.
    ['el.querySelector(".ef-icon.svg")', 'el.querySelector(".forma-icon.svg")', "mjs"],
    ["const { efTone }: DOMStringMap = el.dataset;", "const { formaTone: efTone }: DOMStringMap = el.dataset;", "ts"],
    ["const { efRow, efCol: col }: Record<string, string> = node.dataset;", "const { formaRow: efRow, formaCol: col }: Record<string, string> = node.dataset;", "tsx"]
  ]) assert.equal(migrateText(input, extension), output, `${extension}: ${input}`);
});

test("tag attributes, Markdown links, URLs, hosts, files and packages remain locations in 1.0.1", () => {
  for (const [extension, text] of [
    ["html", '<a\n  class="x" href="ef-page.html" data="ef-data.json">x</a>'],
    ["razor", '<img src="/assets/ef-logo.svg" alt="">'],
    ["vue", '<template><img :src="\'ef-logo.svg\'"></template>'],
    ["tsx", 'const C = () => <img src="ef-logo.svg" />;'],
    ["md", "[Guide](ef-guide.md)"],
    ["mjs", 'const host = "www.ef-cdn.example.org";'],
    ["mjs", 'const h = "https://ef-cdn.example.org/a.js";'],
    ["mjs", 'import x from "@ef-labs/widget";'],
    ["css", '@import url("https://fonts.example.com/ef-sans.css");'],
    ["css", ".x { background: url(/img/ef-bg.png); }"]
  ]) assert.equal(migrateText(text, extension), text, `${extension}: ${text}`);
});

test("the 1.0.1 rewrites are idempotent", () => {
  for (const [text, extension] of [
    ['const data = "ef-card"; const { efTone }: DOMStringMap = el.dataset;', "ts"],
    [".ef-shell.ef-tabs.test, .ef-icon.svg {}", "css"]
  ]) {
    const once = migrateText(text, extension);
    assert.equal(migrateText(once, extension), once, text);
  }
});

// Forma 1.0.2 (WI-0049).
test("a JSX expression or quoted value containing > does not end the tag: its src/href stay locations", () => {
  for (const [input, output] of [
    ['<a onClick={() => go()} href={"ef-docs"} className="ef-link">x</a>', '<a onClick={() => go()} href={"ef-docs"} className="forma-link">x</a>'],
    ['<img onLoad={() => x > 1} src="ef-asset" className="ef-img" />', '<img onLoad={() => x > 1} src="ef-asset" className="forma-img" />'],
    ['<a title="a > b" href="ef-page" className="ef-a">x</a>', '<a title="a > b" href="ef-page" className="forma-a">x</a>'],
    ['<a data-x={{ y: "}" }} href="ef-z" class="ef-b">x</a>', '<a data-x={{ y: "}" }} href="ef-z" class="forma-b">x</a>']
  ]) assert.equal(migrateText(input, "tsx"), output, input);
});

test("dotfile names are paths, not class selectors", () => {
  for (const text of ['const f = ".ef-config.json";', 'const g = "/.ef-rc.json";', "const h = '.ef-settings.yml';", 'load("./.ef-tools.toml")']) {
    assert.equal(migrateText(text, "mjs"), text, text);
  }
  // Dot-directories and extensionless dotfiles inside a path (1.0.2 review).
  for (const text of ['const d = "assets/.ef-cache/x";', 'const e = "src/.ef-rc";']) {
    assert.equal(migrateText(text, "mjs"), text, text);
  }
  assert.equal(migrateText('const s = ".ef-card.ef-x";', "mjs"), 'const s = ".forma-card.forma-x";');
  assert.equal(migrateText(".ef-config.json {}", "css"), ".forma-config.json {}", "a CSS selector is still a selector");
});

test("Markdown reference definitions and Razor expressions in attributes are locations", () => {
  for (const text of ["[d]: /ef-doc", "[e]: ef-doc", '   [f]: https://example.com/ef-x "Title"']) {
    assert.equal(migrateText(text, "md"), text, text);
  }
  assert.equal(migrateText("[d]: /ef-doc\nUse `.ef-button`.", "md"), "[d]: /ef-doc\nUse `.forma-button`.");
  assert.equal(migrateText('<a class="ef-nav" href="@Url.Action("ef-index")">Home</a>', "cshtml"), '<a class="forma-nav" href="@Url.Action("ef-index")">Home</a>');
  assert.equal(migrateText('<a href="@Url.Content("~/ef-a.css")" class="ef-c">x</a>', "razor"), '<a href="@Url.Content("~/ef-a.css")" class="forma-c">x</a>');
});

test("--dry-run and --check report exactly what write mode changes, also for tags that span lines", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-multi-"));
  const file = path.join(dir, "multi.html");
  fs.writeFileSync(file, '<a\n  class="ef-link"\n  href="ef-page.html"\n  src="ef-asset">x</a>\n');
  const dry = run("--dry-run", dir);
  assert.match(dry.stdout, /multi\.html:2 \[name\]/);
  assert.doesNotMatch(dry.stdout, /multi\.html:[34] /, "src/href lines must not be reported");
  assert.match(run("--check", dir).stdout, /multi\.html: 1 line\(s\)/);
  run(dir);
  assert.equal(fs.readFileSync(file, "utf8"), '<a\n  class="forma-link"\n  href="ef-page.html"\n  src="ef-asset">x</a>\n');
  assert.equal(run("--check", dir).status, 0);
});

test("the 1.0.2 rewrites are idempotent", () => {
  for (const [text, extension] of [
    ['<a onClick={() => go()} href={"ef-docs"} className="ef-link">x</a>', "tsx"],
    ['const f = ".ef-config.json"; const s = ".ef-card";', "mjs"],
    ["[d]: /ef-doc\nUse `.ef-x`.", "md"]
  ]) {
    const once = migrateText(text, extension);
    assert.equal(migrateText(once, extension), once, text);
  }
});

// Forma 1.0.2 review (WI-0050).
test("a quoted string that is either a selector or a file name: migrated in a selector API, otherwise left and listed for review", () => {
  for (const [input, output] of [
    ['el.querySelector(".ef-icon.svg")', 'el.querySelector(".forma-icon.svg")'],
    ['document.querySelectorAll(".ef-map.lock")', 'document.querySelectorAll(".forma-map.lock")'],
    ['el.closest("div.ef-card.md")', 'el.closest("div.forma-card.md")'],
    ["el.matches('.ef-button.md')", "el.matches('.forma-button.md')"]
  ]) assert.equal(migrateText(input, "mjs"), output, input);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-ambiguous-"));
  const file = path.join(dir, "ambiguous.mjs");
  const source = 'const a = ".ef-button.md";\nconst b = "div.ef-card.md";\nconst c = ".ef-icon.svg";\nconst d = ".ef-config.json";\n';
  fs.writeFileSync(file, source);
  const check = run("--check", dir);
  assert.equal(check.status, 3, "an ambiguous string never passes --check silently");
  for (const [line, value] of [[1, ".ef-button.md"], [2, "div.ef-card.md"], [3, ".ef-icon.svg"], [4, ".ef-config.json"]]) {
    assert.match(check.stdout, new RegExp(`review: .*ambiguous\\.mjs:${line} "${value.replaceAll(".", "\\.")}" is either a class selector or a file name and was left unrewritten`));
  }
  assert.match(check.stdout, /4 ambiguous string\(s\) to review/);
  assert.equal(run(dir).status, 0);
  assert.equal(fs.readFileSync(file, "utf8"), source, "ambiguous strings are not rewritten");
});

test("a backslash does not escape the closing quote of an HTML attribute value", () => {
  assert.equal(migrateText('<a title="C:\\" href="ef-docs" class="ef-x">x</a>', "html"), '<a title="C:\\" href="ef-docs" class="forma-x">x</a>');
  // In a JSX expression a backslash still escapes.
  assert.equal(migrateText('<a onClick={() => f("\\"}")} href="ef-docs" className="ef-y">x</a>', "tsx"), '<a onClick={() => f("\\"}")} href="ef-docs" className="forma-y">x</a>');
});

test("a stray < in script is not a tag and does not mask what follows", () => {
  assert.equal(migrateText('if (a <b && c) { x.src = "ef-a"; }', "mjs"), 'if (a <b && c) { x.src = "forma-a"; }');
});

test("performance: 20,000 lines with a stray < run in linear time (1.0.2 review regression)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-perf-"));
  fs.writeFileSync(path.join(dir, "stray.mjs"), "if (a <b && c) { z(); }\n".repeat(20000));
  fs.writeFileSync(path.join(dir, "tokens.css"), ".ef-a { color: var(--ef-b); }\n".repeat(20000));
  const started = process.hrtime.bigint();
  // --check computes the same per-line report as --dry-run without printing 20,000 lines.
  const result = run("--check", dir);
  const seconds = Number(process.hrtime.bigint() - started) / 1e9;
  assert.equal(result.status, 3, result.stderr);
  assert.match(result.stdout, /would rewrite 20000 line\(s\) in 1 of 2 file\(s\)/);
  assert.ok(seconds < 2, `20,000 lines took ${seconds.toFixed(2)} s; expected under 2 s`);
});

// Forma 1.0.2 re-review (WI-0051): a scan that stops early keeps the
// locations it has already found.
test("href/src stay locations after a long value, a large JSX prop, many attributes, or before a bare <", () => {
  const long = "x".repeat(5000);
  const prop = `{{ ${Array.from({ length: 600 }, (_, i) => `key${i}: "value${i}"`).join(", ")} }}`;
  assert.ok(prop.length > 6000, "the JSX prop is over 6 KB");
  const many = Array.from({ length: 400 }, (_, i) => `  data-a${i}="v${i}"`).join("\n");
  for (const [input, output, extension] of [
    [`<a data-payload="${long}" href="ef-after-long" class="ef-k">x</a>`, `<a data-payload="${long}" href="ef-after-long" class="forma-k">x</a>`, "html"],
    [`<img data-payload="${long}" src="ef-img-after" class="ef-i">`, `<img data-payload="${long}" src="ef-img-after" class="forma-i">`, "html"],
    [`<Widget opts=${prop} href="ef-jsx-after" className="ef-w" />`, `<Widget opts=${prop} href="ef-jsx-after" className="forma-w" />`, "tsx"],
    [`<a\n${many}\n  href="ef-after-many" class="ef-m">y</a>`, `<a\n${many}\n  href="ef-after-many" class="forma-m">y</a>`, "html"],
    ['<a href="ef-before-lt" title=a<b class="ef-t">z</a>', '<a href="ef-before-lt" title=a<b class="forma-t">z</a>', "html"]
  ]) assert.equal(migrateText(input, extension), output, input.slice(0, 60));
});

test("an unquoted URL attribute value in a selector argument is a location", () => {
  assert.equal(migrateText("el.querySelector('img[src=ef-a.png]')", "mjs"), "el.querySelector('img[src=ef-a.png]')");
  assert.equal(migrateText("el.querySelector('a[href^=ef-b] .ef-c')", "mjs"), "el.querySelector('a[href^=ef-b] .forma-c')");
  assert.equal(migrateText('el.querySelectorAll(".ef-x[data-ef-y]")', "mjs"), 'el.querySelectorAll(".forma-x[data-forma-y]")');
});

test("a word-prefixed name with a file extension is a file name, not ambiguous", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-word-"));
  const file = path.join(dir, "names.mjs");
  const source = 'const l = "logo.ef-x.png"; const d = "div.ef-card.md";\n';
  fs.writeFileSync(file, source);
  const check = run("--check", dir);
  assert.doesNotMatch(check.stdout, /logo\.ef-x\.png/, "a file name is not reported");
  assert.match(check.stdout, /review: .*names\.mjs:1 "div\.ef-card\.md"/, "an element-prefixed string is still ambiguous");
  assert.equal(run(dir).status, 0);
  assert.equal(fs.readFileSync(file, "utf8"), source);
});

test("performance: unbalanced braces after a stray < stay bounded", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-perf2-"));
  fs.writeFileSync(path.join(dir, "unbalanced.mjs"), "if (a <b && c) {\n".repeat(20000) + "<b x={\n".repeat(2000));
  const started = process.hrtime.bigint();
  const result = run("--check", dir);
  const seconds = Number(process.hrtime.bigint() - started) / 1e9;
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.ok(seconds < 2, `took ${seconds.toFixed(2)} s; expected under 2 s`);
});

test("the re-review rewrites are idempotent", () => {
  for (const [text, extension] of [
    ['<a href="ef-before-lt" title=a<b class="ef-t">z</a>', "html"],
    ["el.querySelector('a[href^=ef-b] .ef-c')", "mjs"]
  ]) {
    const once = migrateText(text, extension);
    assert.equal(migrateText(once, extension), once, text);
  }
});

// Forma 1.0.2 re-review 3 (WI-0052).
test("href/src stay locations after &, (, ), ; and Razor or Angular syntax in a tag", () => {
  for (const [input, output, extension] of [
    ['<a title=a&amp;b href="ef-docs1" class="ef-c1">x</a>', '<a title=a&amp;b href="ef-docs1" class="forma-c1">x</a>', "html"],
    ['<a onclick=go() href=ef-docs2 class="ef-c2">x</a>', '<a onclick=go() href=ef-docs2 class="forma-c2">x</a>', "html"],
    ['<a (click)="go()" href="ef-docs3" class="ef-c3">x</a>', '<a (click)="go()" href="ef-docs3" class="forma-c3">x</a>', "html"],
    ['<a style=color:red; href="ef-docs4" class="ef-c4">x</a>', '<a style=color:red; href="ef-docs4" class="forma-c4">x</a>', "html"],
    ['<a data-x=@(Model.Y) href="ef-docs5" class="ef-c5">x</a>', '<a data-x=@(Model.Y) href="ef-docs5" class="forma-c5">x</a>', "cshtml"],
    ['<a class="ef-r1" @(Model.Attr) href="ef-r-docs2">x</a>', '<a class="forma-r1" @(Model.Attr) href="ef-r-docs2">x</a>', "cshtml"]
  ]) assert.equal(migrateText(input, extension), output, input);
});

test("a JSX prop over 16 KiB that contains ( keeps the href after it a location", () => {
  const prop = `{{ ${Array.from({ length: 1500 }, (_, i) => `k${i}: f("v${i}")`).join(", ")} }}`;
  assert.ok(prop.length > 16384, "the JSX prop is over 16 KiB");
  assert.equal(migrateText(`<Widget opts=${prop} href="ef-jsx-big" className="ef-w" />`, "tsx"),
    `<Widget opts=${prop} href="ef-jsx-big" className="forma-w" />`);
});

test("a prefix that may name an element keeps a quoted name-and-extension string ambiguous", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-prefix-"));
  const file = path.join(dir, "prefixes.mjs");
  const ambiguous = ["ef-tabs.ef-active.md", "my-widget.ef-x.md", "path.ef-icon.svg", "use.ef-glyph.svg", "g.ef-g.svg", "symbol.ef-s.svg",
    "link.ef-x.css", "script.ef-x.js", "style.ef-x.css", "slot.ef-x.md", "title.ef-x.md", "kbd.ef-x.md", "colgroup.ef-x.md"];
  const source = ambiguous.map((value, i) => `const a${i} = "${value}";`).join("\n") + '\nconst file = "logo.ef-x.png";\n';
  fs.writeFileSync(file, source);
  const check = run("--check", dir);
  assert.equal(check.status, 3);
  ambiguous.forEach((value, i) => {
    assert.match(check.stdout, new RegExp(`review: .*prefixes\\.mjs:${i + 1} "${value.replaceAll(".", "\\.")}"`), value);
  });
  assert.doesNotMatch(check.stdout, /logo\.ef-x\.png/, "a plain word prefix is still a file name");
  assert.equal(run(dir).status, 0);
  assert.equal(fs.readFileSync(file, "utf8"), source);
});

test("a selector argument with nested quotes keeps its attribute value a location", () => {
  assert.equal(migrateText(`el.querySelector("a[href='ef-c'] .ef-s")`, "mjs"), `el.querySelector("a[href='ef-c'] .forma-s")`);
  assert.equal(migrateText(`el.querySelector('a[href="ef-c"] .ef-s')`, "mjs"), `el.querySelector('a[href="ef-c"] .forma-s')`);
  assert.equal(migrateText("el.closest(`div[data-ef-x='1'].ef-y`)", "mjs"), "el.closest(`div[data-forma-x='1'].forma-y`)");
});

test("the re-review 3 rewrites are idempotent", () => {
  for (const [text, extension] of [
    ['<a onclick=go() href=ef-docs2 class="ef-c2">x</a>', "html"],
    [`el.querySelector("a[href='ef-c'] .ef-s")`, "mjs"]
  ]) {
    const once = migrateText(text, extension);
    assert.equal(migrateText(once, extension), once, text);
  }
});

