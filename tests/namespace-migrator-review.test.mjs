// FORMA-NS-001.2, Forma 1.0.2 re-review 7 (WI-0057): comments inside JSX tags,
// a `/` after a postfix operator, review limited to text holding Forma names,
// the uncertain tag's mask running to its `>`, TSX const type parameters, and
// the reviewer's fuzz failures. Split from namespace-migrator-lexing.test.mjs
// to keep each file under the structural review limit.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const build = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-rev-"));
execFileSync("dotnet", ["build", "tools/NamespaceMigrator/NamespaceMigrator.fsproj", "-c", "Release", "-o", build], { stdio: "pipe" });
const dll = path.join(build, "forma-namespace-migrator.dll");
const run = (...args) => spawnSync("dotnet", [dll, ...args], { encoding: "utf8", maxBuffer: 1 << 28 });

const sample = (text, extension) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-rv-"));
  const file = path.join(dir, `sample.${extension}`);
  fs.writeFileSync(file, text);
  return file;
};
const migrateText = (text, extension) => {
  const file = sample(text, extension);
  const result = run(file);
  assert.equal(result.status, 0, result.stderr);
  return fs.readFileSync(file, "utf8");
};
const checkOne = (text, extension) => run("--check", sample(text, extension));
const tagReview = (stdout) => stdout.split("\n").filter((line) => /^review: .*(could not be read with certainty|may be a tag|holds a Forma name)/.test(line));

// [label, input, extension, substrings that must survive, substrings whose ef- must become forma-]
const probe = (cases) => {
  for (const [label, input, extension, keep = [], migrated = []] of cases) {
    const output = migrateText(input, extension);
    for (const text of keep) assert.ok(output.includes(text), `${label}: lost ${text}\n${output}`);
    for (const text of migrated) assert.ok(output.includes(text.replace(/ef-/, "forma-")), `${label}: ${text} not migrated\n${output}`);
    assert.equal(migrateText(output, extension), output, `${label}: not idempotent`);
  }
};

test("comments inside JSX tags are skipped, and a quote that never closes is uncertain (b13)", () => {
  probe([
    ["// comment with apostrophe", 'export const A = () => (\n  <a\n    // it\'s the link\n    onClick={() => go()}\n    href="ef-c1"\n    className="ef-cc1"\n  >x</a>\n);\nexport const B = () => <a onClick={go} href="ef-c2">y</a>;\n', "tsx", ['"ef-c1"', '"ef-c2"'], ['"ef-cc1"']],
    ["/* */ comment with apostrophe", 'export const A = () => <a /* it\'s */ onClick={() => f("}")} href="ef-c3">x</a>;\nconst B = () => <a onClick={go} href="ef-c4">y</a>;', "tsx", ['"ef-c3"', '"ef-c4"']],
    ["// comment with {", 'export const A = () => (\n  <a\n    // see {docs}\n    onClick={() => f("}")}\n    href="ef-c5"\n  >x</a>\n);', "tsx", ['"ef-c5"']],
    ["// comment with a quote", 'export const A = () => (\n  <a\n    // a "quoted word\n    onClick={() => f("}")}\n    href="ef-c6"\n  >x</a>\n);\nconst q = "}";\nexport const B = () => <a onClick={go} href="ef-c7">y</a>;', "tsx", ['"ef-c6"', '"ef-c7"']],
    ["children comment-like text", '<p>// don\'t {x}</p><a onClick={() => f("}")} href="ef-c8">x</a>', "jsx", ['"ef-c8"']]
  ]);
  const clean = checkOne('export const A = () => (\n  <a\n    // it\'s the link\n    onClick={() => go()}\n    className="x"\n  >x</a>\n);\n', "tsx");
  assert.equal(clean.status, 0, clean.stdout);
  // An attribute quote that never closes runs to the end of the text: reviewed, not rewritten.
  const open = checkOne('<a title="it\'s onClick={go} href="ef-q1">x</a>\n<a title=\'x href="ef-q2">', "html");
  assert.ok(migrateText('<a title=\'x href="ef-q2">', "html").includes('"ef-q2"'));
  assert.equal(open.status, 3, open.stdout);
});

test("a / after a postfix !, ++ or -- is division (b14, b15)", () => {
  probe([
    ["non-null self-closing", '<Bar width={w! / 2} src={"ef-d1"} className="ef-dc1"/>', "tsx", ['"ef-d1"'], ['"ef-dc1"']],
    ["non-null in handler", '<a onClick={() => setW(w! / 2)} href="ef-d2" />', "tsx", ['"ef-d2"']],
    ["style non-null", '<div style={{ width: total! / 2 }} data-x="1"><img src="ef-d3.png" /></div>', "tsx", ['"ef-d3.png"']],
    ["postfix ++", '<a onClick={() => setN(n++ / 2)} href="ef-d4" />', "jsx", ['"ef-d4"']],
    ["postfix --", '<a onClick={() => setN(n-- / 2)} href="ef-d5" />', "jsx", ['"ef-d5"']],
    ["non-null multi-line", '<Bar\n  width={w! / 2}\n  src="ef-d6"\n/>', "tsx", ['"ef-d6"']],
    ["non-null then closing tag", '<p title={a! / b}>x</p><a href="ef-d7">y</a>', "tsx", ['"ef-d7"']],
    ["non-null in fn body", 'function A() { return <Bar width={w! / 2} src="ef-e1" className="ef-ec1"/>; }', "tsx", ['"ef-e1"'], ['"ef-ec1"']],
    ["non-null in component", 'export function A() {\n  return <Bar width={w! / 2} href="ef-e2" />;\n}\n', "tsx", ['"ef-e2"']],
    ["postfix in component", 'export function A() {\n  return <a onClick={() => go(i++ / 2)} href="ef-e3" />;\n}\n', "jsx", ['"ef-e3"']],
    ["non-null, closing tag", 'export function A() {\n  return <p title={a! / b} data-x="q">x</p>;\n}\nexport const B = () => <a href="ef-e4">y</a>;\n', "tsx", ['"ef-e4"']]
  ]);
  // A regular expression holding a brace or quote is a guess: a tag spanning it is reviewed.
  const guess = checkOne('<a onClick={() => x = /"}/.test(s)} href="ef-r1">x</a>', "jsx");
  assert.ok(migrateText('<a onClick={() => x = /"}/.test(s)} href="ef-r1">x</a>', "jsx").includes('"ef-r1"'));
  assert.equal(guess.status, 3, guess.stdout);
  assert.ok(tagReview(guess.stdout).length >= 1, guess.stdout);
});

test("the uncertain tag's mask runs to its > and the type-parameter forms are read right (b12)", () => {
  const U = 'onClick={() => { if (ok) /{/.test(s); }}';
  probe([
    ["href then >", `<a ${U} href="ef-m1">x</a>`, "jsx", ['"ef-m1"']],
    ["href then spread", `<a ${U} href="ef-m2" {...p}>x</a>`, "jsx", ['"ef-m2"']],
    ["href then expr attr", `<a ${U} href="ef-m3" title={t("a, b; c")}>x</a>`, "jsx", ['"ef-m3"']],
    ["href then unquoted (", `<a ${U} href="ef-m4" data-x=f(1)>x</a>`, "jsx", ['"ef-m4"']],
    ["href then comment", `<a ${U} href="ef-m5" {/* c */}>x</a>`, "jsx", ['"ef-m5"']],
    ["href then newline attrs", `<a\n  ${U}\n  href="ef-m6"\n  className="ef-c6"\n>x</a>`, "jsx", ['"ef-m6"']],
    ["href unquoted", `<a ${U} href=ef-m7>x</a>`, "jsx", ["href=ef-m7"]],
    ["href={expr}", `<a ${U} href={"ef-m8"}>x</a>`, "jsx", ['"ef-m8"']],
    ["href={expr with ,}", `<a ${U} href={join("ef-m9", x)}>x</a>`, "jsx", ['"ef-m9"']],
    ["href then attr with >", `<a ${U} href="ef-m10" onMouse={() => a > b}>x</a>`, "jsx", ['"ef-m10"']],
    ["href then style with ;", `<a ${U} href="ef-m11" style="a:b;">x</a>`, "jsx", ['"ef-m11"']],
    ["href then boolean", `<a ${U} href="ef-m12" download>x</a>`, "jsx", ['"ef-m12"']],
    ["href then Razor @()", '<a x={ href="ef-m13" data-y=@(Model.Y)>x</a>', "cshtml", ['"ef-m13"']],
    ["href then (click)", '<a x={ href="ef-m14" (click)="go()">x</a>', "html", ['"ef-m14"']],
    ["href then unquoted ;", '<a x={ href="ef-m15" style=color:red;>x</a>', "html", ['"ef-m15"']],
    ["href then onclick=go()", '<a x={ href="ef-m16" onclick=go()>x</a>', "html", ['"ef-m16"']],
    ["src then srcset with ,", '<img x={ src="ef-m17.png" srcset=a.png,b.png>', "html", ['"ef-m17.png"']],
    ["<T,>", 'const f = <T,>(x: T) => x;\nexport const A = () => <a onClick={() => f("}")} href="ef-g1">x</a>;', "tsx", ['"ef-g1"']],
    ["<const T,>", 'const f = <const T,>(x: T) => x;\nexport const A = () => <a onClick={() => f("}")} href="ef-g2">x</a>;', "tsx", ['"ef-g2"']],
    ["<const T extends>", 'const f = <const T extends readonly unknown[]>(x: T) => x;\nexport const A = () => <a onClick={() => f("}")} href="ef-g3">x</a>;', "tsx", ['"ef-g3"']],
    ["keyof", 'const f = <K extends keyof X>(k: K) => k;\nconst u = `x ${y} {`;\nexport const A = () => <a onClick={() => f("}")} href="ef-g4">x</a>;', "tsx", ['"ef-g4"']],
    ["<T = X,>", 'const f = <T = string,>(x: T) => x;\nexport const A = () => <a onClick={() => f("}")} href="ef-g5">x</a>;', "tsx", ['"ef-g5"']],
    ["async <T,>", 'const f = async <T,>(x: T) => x;\nexport const A = () => <a onClick={() => f("}")} href="ef-g6">x</a>;', "tsx", ['"ef-g6"']],
    ["ts generics", 'const f = <T>(x: T): T => x;\nconst g = <T extends { a: "}" }>(x: T) => x;\nel.innerHTML = \'<a href="ef-g7">x</a>\';\nlet data = "ef-gname";', "ts", ['"ef-g7"'], ['"ef-gname"']],
    ["JSX attribute named extends", '<Foo extends="x" href="ef-g8" />', "tsx", ['"ef-g8"']],
    ["JSX attr =", '<input = href="ef-g9" />', "tsx", ['"ef-g9"']],
    ["<T extends> then JSX", 'const f = <T extends unknown>(x: T) => x;\nexport const A = () => <a onClick={go} href="ef-g10" className="ef-gc">x</a>;', "tsx", ['"ef-g10"'], ['"ef-gc"']],
    ["possible: spread then href", 'const r = x <a {...p} href="ef-s1">;', "jsx", ['"ef-s1"']],
    ["possible: spread unclosed", 'const r = x <a {...p href="ef-s2">;', "jsx", ['"ef-s2"']],
    ["possible: script object then name", 'if (a <b {...c}) data = "ef-sname";', "js", [], ['"ef-sname"']],
    ["possible: comparison then object literal", 'const ok = a <b && f({ data: "ef-sn2" });', "js", [], ['"ef-sn2"']],
    ["possible: two spreads", 'const r = x <a {...p} {...q} src="ef-s3">;', "jsx", ['"ef-s3"']]
  ]);
  const masked = checkOne('<a x={ href="ef-m15" style=color:red;>x</a>', "html");
  assert.equal(masked.status, 3, masked.stdout);
  assert.match(masked.stdout, /src\/href values after it that read as its attributes were left unrewritten and are listed/);
});

test("uncertain tags and possible tags are reviewed only when they hold a Forma name", () => {
  for (const [text, extension] of [
    ['const s = \'<a x={f("}")} href="docs">\';', "ts"],
    ['/* <a x={f("}")} href="/docs"> */', "js"],
    ['const A = () => <a onClick={() => { if (ok) /{/.test(s); }} href="/x">x</a>;', "jsx"],
    ['const r = x <a {...p} href="/y">;', "jsx"]
  ]) {
    const result = checkOne(text, extension);
    assert.equal(result.status, 0, `${text}\n${result.stdout}`);
    assert.equal(tagReview(result.stdout).length, 0, result.stdout);
  }
  const named = checkOne('const s = \'<a x={f("}")} href="ef-docs">\';', "ts");
  assert.equal(named.status, 3, named.stdout);
});

test("the reviewer's fuzz failures keep every href (f3fail fixtures)", () => {
  const dir = "tests/fixtures/namespace-migrator/fuzz";
  const files = fs.readdirSync(dir).filter((file) => file.startsWith("f3fail-"));
  assert.ok(files.length >= 10);
  for (const file of files) {
    const [, extension, id] = file.match(/^f3fail-(tsx|jsx|ts|js)(?:crlf)?-\d+-(\d+_\d+)\.txt$/);
    const text = fs.readFileSync(path.join(dir, file), "utf8");
    const output = migrateText(text, extension);
    const kept = new RegExp(`(href|src)=\\{?"ef-T${id}"`).test(output);
    const reviewed = tagReview(checkOne(text, extension).stdout).length > 0;
    assert.ok(kept || reviewed, `${file}: href rewritten without a review line`);
    assert.ok(kept, `${file}: href lost`);
    assert.equal(output.includes("\r\n"), text.includes("\r\n"), `${file}: line endings changed`);
  }
});
