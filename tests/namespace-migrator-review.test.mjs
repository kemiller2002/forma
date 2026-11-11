// FORMA-NS-001.2, Forma 1.0.2 re-review 7 (WI-0057): comments inside JSX tags,
// a `/` after a postfix operator, review limited to text holding Forma names,
// the uncertain tag's mask running to its `>`, TSX const type parameters, and
// the reviewer's fuzz failures. Split from namespace-migrator-lexing.test.mjs
// to keep each file under the structural review limit.
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { migratorDll } from "./support/migrator.mjs";

// One shared build for all codemod test files (they run concurrently).
const dll = migratorDll();
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

// Forma 1.0.2 re-review 8 (WI-0058): comments only at JSX attribute
// boundaries, the token gate over the tag's whole unread extent, and a URL in
// a spread.
const pad = (n) => "x".repeat(n);
const U8 = 'onClick={() => { if (ok) /{/.test(s); }}';

test("// inside an unquoted value of a tag in a string or template is not a comment (b17)", () => {
  probe([
    ["ts string unquoted url", "el.innerHTML = '<a data-u=http://x.com href=\"ef-r1\">';", "ts", ['"ef-r1"']],
    ["fs string unquoted url", 'let s = "<a data-u=http://x.com href=\'ef-r2\'>"', "fs", ["'ef-r2'"]],
    ["lit template unquoted url", 'html`<a data-u=//cdn.x.com/y href="ef-r3">x</a>`;', "js", ['"ef-r3"']],
    ["template protocol-relative", 'const t = `<img data-src=//cdn.x/a.png src="ef-r4">`;', "ts", ['"ef-r4"']],
    ["unquoted url, href on the next line", "el.innerHTML = `<a data-u=http://x.com\n href=\"ef-r5\">`;", "js", ['"ef-r5"']],
    ["html unquoted url", '<a data-u=http://x.com href="ef-r6">x</a>', "html", ['"ef-r6"']],
    ["vue unquoted url", '<template><a data-u=http://x.com href="ef-r7">x</a></template>', "vue", ['"ef-r7"']],
    ["jsx /* in a quoted attribute", '<a title="/* x" onClick={go} href="ef-r8"/>', "tsx", ['"ef-r8"']],
    ["jsx // inside an expression", '<a onClick={() => go("http://x")} href="ef-r9"/>', "tsx", ['"ef-r9"']],
    ["string tag with /*", "el.innerHTML = '<a data-x=a/*b href=\"ef-r10\">';", "js", ['"ef-r10"']]
  ]);
});

test("an uncertain tag is gated and masked over its whole unread extent, not 4 KiB (b16)", () => {
  const cases = [
    ["href just inside 4 KiB", `<a ${U8} data-p="${pad(3900)}" href="ef-w1">x</a>`, "jsx", '"ef-w1"'],
    ["href beyond 4 KiB", `<a ${U8} data-p="${pad(5000)}" href="ef-w2">x</a>`, "jsx", '"ef-w2"'],
    ["href beyond 4 KiB, many attributes", `<a ${U8} ${Array.from({ length: 300 }, (_, i) => `a${i}="v"`).join(" ")} href="ef-w3">x</a>`, "jsx", '"ef-w3"'],
    ["uncertain group over 4 KiB", `<a onClick={() => { if (ok) /{/.test(s); ${"go();".repeat(1000)} }} href="ef-w4">x</a>`, "jsx", '"ef-w4"'],
    ["unclosed { then href beyond 4 KiB", `<a x={ data-p="${pad(5000)}" href="ef-w5">`, "jsx", '"ef-w5"'],
    ["big value before the uncertain group", `<a data-p="${pad(5000)}" ${U8} href="ef-w6">x</a>`, "jsx", '"ef-w6"'],
    ["html unclosed quote then href far", `<a title="oops ${pad(5000)} href="ef-w7">`, "html", '"ef-w7"'],
    ["comment tag with fallback braces, href far", `/* <a x={f("}")} data-p="${pad(5000)}" href="ef-w8"> */`, "js", '"ef-w8"']
  ];
  for (const [label, text, extension, value] of cases) {
    assert.ok(migrateText(text, extension).includes(value), `${label}: lost ${value}`);
    const result = checkOne(text, extension);
    assert.equal(result.status, 3, `${label}\n${result.stdout}`);
    assert.ok(tagReview(result.stdout).length >= 1, `${label}: no review line`);
  }
});

test("re-review 8 probes: built tokens, comments and postfix forms, spreads (b16)", () => {
  probe([
    ["split concat", `<a ${U8} href={"e" + "f-s1"}>x</a>`, "jsx", ['"e" + "f-s1"']],
    ["template build", `<a ${U8} href={\`ef-\${s}\`}>x</a>`, "jsx", ["`ef-${s}`"]],
    ["escaped", `<a ${U8} href="\\x65f-s2">x</a>`, "jsx", ['"\\x65f-s2"']],
    ["entity", '<a x={ href="&#101;f-s3">', "html", ['"&#101;f-s3"']],
    ["token after uncertain on the next line", `<a\n  ${U8}\n  href="ef-s4"\n>x</a>`, "jsx", ['"ef-s4"']],
    ["possible tag with a URL in a spread", 'const r = x <a {...{href: "ef-s5"}} href="q">;', "jsx", ['"ef-s5"']],
    ["comment with backtick in tag", '<a\n  // see `ref`\n  onClick={go}\n  href="ef-k1"\n/>', "tsx", ['"ef-k1"']],
    ["comment with /> in tag", '<a\n  // closes with />\n  onClick={go}\n  href="ef-k2"\n/>', "tsx", ['"ef-k2"']],
    ["comment with > in tag", '<a\n  /* a > b */\n  onClick={go}\n  href="ef-k3"\n/>', "tsx", ['"ef-k3"']],
    ["url with // in attribute", '<a title="http://x.com" onClick={go} href="ef-k4"/>', "tsx", ['"ef-k4"']],
    ["unquoted url in html", '<a data-u=http://x.com/y href="ef-k5" class="ef-kc">x</a>', "html", ['"ef-k5"'], ['"ef-kc"']],
    ["unquoted // in a js string", "el.innerHTML = '<a data-u=http://x.com href=\"ef-k6\">';", "js", ['"ef-k6"']],
    ["html value with //", '<a onclick=go()//x href="ef-k7">x</a>', "html", ['"ef-k7"']],
    ["tsx unquoted //", '<a data-u=http://x.com href="ef-k8"/>', "tsx", ['"ef-k8"']],
    ["non-null then regex", 'const ok = x!; const r = /\'/.test(s);\nfunction A(){ return <a onClick={go} href="ef-p1"/>; }', "tsx", ['"ef-p1"']],
    ["a!==b then regex", '<a onClick={() => a!==b && /\'/.test(s)} href="ef-p2"/>', "tsx", ['"ef-p2"']],
    ["logical not regex", '<a onClick={() => !/\'/.test(s)} href="ef-p3"/>', "tsx", ['"ef-p3"']],
    ["x++ then a regex on the next line", 'function A(){ i++\n/\'/.test(s); return <a onClick={go} href="ef-p4"/>; }', "tsx", ['"ef-p4"']],
    ["<const T,>", 'const f = <const T,>(x: T) => x;\nexport const A = () => <a onClick={() => f("}")} href="ef-q1"/>;', "tsx", ['"ef-q1"']],
    ["<Foo extends=...>", '<Foo extends="x" onClick={() => f("}")} href="ef-q2"/>', "tsx", ['"ef-q2"']],
    ["<T = Foo>", '<T = Foo>(x: T) => x;\nconst A = () => <a onClick={() => f("}")} href="ef-q3"/>;', "tsx", ['"ef-q3"']],
    ["JSX element named const", '<const onClick={go} href="ef-q4"/>', "tsx", ['"ef-q4"']]
  ]);
  const spread = checkOne('const r = x <a {...{href: "ef-s5"}} href="q">;', "jsx");
  assert.equal(spread.status, 3, spread.stdout);
  assert.match(spread.stdout, /a <name here may be a tag/);
});

// Forma 1.0.2 re-review 9 (WI-0059): the attribute-run check is read once per
// run, an uncertain tag holds back only its own attribute list, and comments
// may follow a `}`, a quote or the tag name.
let startup;
const timed = (text, extension) => {
  if (startup === undefined) {
    const runs = [0, 1, 2].map(() => {
      const started = process.hrtime.bigint();
      checkOne("", extension);
      return Number(process.hrtime.bigint() - started) / 1e9;
    }).sort((a, b) => a - b);
    startup = runs[1];
  }
  // Test files run concurrently, so a run can share the CPU with another
  // file's work: a slow first run is measured once more and the faster counts.
  const once = () => {
    const started = process.hrtime.bigint();
    const result = checkOne(text, extension);
    return { result, seconds: Math.max(0, Number(process.hrtime.bigint() - started) / 1e9 - startup) };
  };
  const first = once();
  if (first.seconds < 1) return first;
  const second = once();
  return second.seconds < first.seconds ? second : first;
};

test("JSX element starts, comments without a space before them and a=x //y (b18)", () => {
  probe([
    ["template in JSX expression with tag and url", '<div title={`<a data-u=http://x.com href="ef-x1">`}><a\n  // it\'s\n  href="ef-x2"\n/></div>', "tsx", ['"ef-x1"', '"ef-x2"']],
    ["JSX inside ${}", 'const s = `${<a\n  // it\'s here\n  onClick={go}\n  href="ef-x3"\n/>}`;', "tsx", ['"ef-x3"']],
    ["JSX after return on the line above", 'function A() {\n  return (\n    <a\n      // don\'t\n      href="ef-x4"\n    />\n  );\n}', "jsx", ['"ef-x4"']],
    ["JSX after => on the line above", 'const A = () =>\n  <a\n    /* it\'s */\n    href="ef-x5"\n  />;', "jsx", ['"ef-x5"']],
    ["comment right after <Tag", 'const A = () => <a/* it\'s */ href="ef-x6"/>;', "tsx", ['"ef-x6"']],
    ["// right after <Tag", 'const A = () => (<a// it\'s\n href="ef-x7"/>);', "tsx", ['"ef-x7"']],
    ["comment after a quoted value", 'const A = () => <a title="t"/* it\'s */ href="ef-x8"/>;', "tsx", ['"ef-x8"']],
    ["comment after {}", 'const A = () => <a onClick={go}// it\'s\n href="ef-x9"/>;', "tsx", ['"ef-x9"']],
    ["nested JSX in a prop with a comment", '<Card footer={<a\n  // it\'s\n  href="ef-x10"\n/>} />', "tsx", ['"ef-x10"']],
    ["JSX in children with a comment", '<div>\n  <a\n    // it\'s\n    href="ef-x11"\n  />\n</div>', "jsx", ['"ef-x11"']],
    ["string tag in a jsx file with //url", "const s = '<a data-u=//cdn.x href=\"ef-x12\">';", "jsx", ['"ef-x12"']],
    ["template tag in a jsx file with //url", 'const s = `<a data-u=//cdn.x href="ef-x13">`;', "jsx", ['"ef-x13"']],
    ["comment tag with //url", '/* <a data-u=//cdn.x href="ef-x14"> */', "js", ['"ef-x14"']],
    ["html string a=x //y", "el.innerHTML = '<a data-x=x //y href=\"ef-y1\">';", "js", ['"ef-y1"']],
    ["jsx a=x //y", '<a data-x=x //y\n href="ef-y2"/>', "jsx", ['"ef-y2"']],
    ["html a=x //y", '<a data-x=x //y href="ef-y3">', "html", ['"ef-y3"']],
    ["jsx quoted value then //", '<a title="x" // c\n href="ef-y4"/>', "jsx", ['"ef-y4"']],
    ["jsx // with a url and quote in the comment", '<a\n  // see https://x.com/a"b\n  href="ef-y5"\n/>', "jsx", ['"ef-y5"']]
  ]);
  for (const [text, extension] of [['const A = () => <a/* it\'s */ href="ef-x6"/>;', "tsx"], ['const A = () => <a onClick={go}// it\'s\n href="ef-x9"/>;', "jsx"]]) {
    const result = checkOne(text, extension);
    assert.equal(tagReview(result.stdout).length, 0, `${text}\n${result.stdout}`);
  }
});

test("an uncertain tag holds back its own attribute list, not script after it (semicolon-free code)", () => {
  const blocks = ['export const Top = () => <a onClick={() => { if (ok) /{/.test(s) }} href="ef-top">x</a>\n'];
  for (let i = 0; i < 4000; i++) {
    blocks.push(`export function Card${i}({ items, label }) {\n  const tone = items.length > 3 ? "ef-tone-wide" : "ef-tone-narrow"\n  // Prettier semi:false style\n  const data = "ef-n${i}"\n  return (\n    <div className="ef-card-${i}" data-ef-state="open">\n      <span className="ef-label-${i}">{label} and some descriptive text here</span>\n      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod</p>\n    </div>\n  )\n}\n`);
  }
  const text = blocks.join("\n");
  const result = checkOne(text, "jsx");
  const rewritten = +result.stdout.match(/would rewrite (\d+) line\(s\)/)[1];
  const suppressed = +result.stdout.match(/(\d+) suppressed value\(s\)/)[1];
  assert.ok(rewritten >= 15900, `only ${rewritten} of 16,000 lines rewritten`);
  assert.ok(suppressed <= 50, `${suppressed} values held back`);
  // The uncertain tag's own href stays and is reported.
  assert.ok(migrateText(blocks[0], "jsx").includes('"ef-top"'));
  assert.equal(result.status, 3);
});

test("performance: long attribute runs after an uncertain tag are read once (perf8)", () => {
  for (const [label, extension, text] of [
    ["<a x={ then href=\"ef-u\" t=a x50,000", "html", "<a x={ " + ' href="ef-u" t=a'.repeat(50000)],
    ["uncertain handler then 25,000 attribute lines", "jsx", '<a onClick={() => { if (ok) /{/.test(s); }}\n' + ' href="ef-u" data-t="a"\n'.repeat(25000) + ">x</a>"],
    ["50,000 uncertain tags", "jsx", '<a x={ href="ef-u">\n'.repeat(50000)],
    ["uncertain tag then 50,000 attribute lines", "jsx", '<a x={ href="ef-u">\n' + " data-a=b c=d\n".repeat(50000) + 'href="ef-v"'],
    ["40,000 JSX tags with comments", "jsx", "const A = () => (<div>\n" + '<a\n  // it\'s\n  /* x */ onClick={go}\n  href="ef-k"\n/>\n'.repeat(40000) + "</div>);"]
  ]) {
    const { result, seconds } = timed(text, extension);
    assert.ok(result.status === 0 || result.status === 3, `${label}: ${result.stderr}`);
    assert.ok(seconds < 2, `${label}: took ${seconds.toFixed(2)} s; expected under 2 s`);
  }
  // The values in the long runs are kept, not rewritten.
  const kept = migrateText("<a x={ " + ' href="ef-u" t=a'.repeat(1000), "html");
  assert.ok(!kept.includes("forma-u"));
});

// Forma 1.0.2 re-review 10 (WI-0060): in markup text a `<b>` inside the
// uncertain tag's own quoted value does not end its extent.
test("a <name inside an uncertain tag's own value does not shorten its extent (b19)", () => {
  const U = 'onClick={() => { if (ok) /{/.test(s); }}';
  const P = (n) => "p".repeat(n);
  const cases = [
    ["jsx footer={<b/>} then href beyond 4 KiB", `const A = () => <a ${U} footer={<b/>} data-p="${P(5000)}" href="ef-f1">x</a>;`, "jsx", '"ef-f1"'],
    ["jsx footer then href within 4 KiB", `const A = () => <a ${U} footer={<b/>} data-p="${P(1000)}" href="ef-f2">x</a>;`, "jsx", '"ef-f2"'],
    ["jsx uncertain group holding JSX, beyond 4 KiB", `const A = () => <a onClick={() => { if (ok) /{/.test(s); return <b/>; }} data-p="${P(5000)}" href="ef-f3">x</a>;`, "jsx", '"ef-f3"'],
    ["svelte <b> in a quoted value", `<a on:click={() => { if (ok) /{/.test(s); }} title="<b>x</b>" data-p="${P(5000)}" href="ef-f4">x</a>`, "svelte", '"ef-f4"'],
    ["html unclosed { and <b> in title", `<a x={ title="<b>x</b>" data-p="${P(5000)}" href="ef-f5">`, "html", '"ef-f5"'],
    // (The braces close here, so the tag is read to its end: kept, not reviewed.)
    ["vue <b> in a {} string", `<template><a x={ "<b>" } :y="1" data-p="${P(5000)}" href="ef-f6">x</a></template>`, "vue", '"ef-f6"', false],
    ["html comment-like <b in a value", `<a x={ data-c="<!-- <b> -->" data-p="${P(5000)}" href="ef-f7">`, "html", '"ef-f7"'],
    ["jsx // comment holding <b>", `const A = () => <a ${U}\n  // see <b>bold</b>\n  data-p="${P(5000)}"\n  href="ef-f8"\n>x</a>;`, "jsx", '"ef-f8"'],
    ["jsx string with JSX-like text", `const A = () => <a ${U} title="<b>x</b>" data-p="${P(5000)}" href="ef-f9">x</a>;`, "jsx", '"ef-f9"'],
    ["jsx misread string reveals <b", `const A = () => <a onClick={() => { if (ok) /'/.test(s); }} title='<b>q' data-p="${P(5000)}" href="ef-f10">x</a>;`, "jsx", '"ef-f10"'],
    ["razor", `<a x={ title="<b>x</b>" data-p="${P(5000)}" href="ef-f11">`, "cshtml", '"ef-f11"'],
    ["markdown", `<a x={ title="<b>x</b>" data-p="${P(5000)}" href="ef-f12">`, "md", '"ef-f12"'],
    ["html <b> near, href within 4 KiB", `<a x={ title="<b>x</b>" href="ef-f13">`, "html", '"ef-f13"'],
    ["html control, no <b>", `<a x={ data-p="${P(5000)}" href="ef-f14">`, "html", '"ef-f14"'],
    // Unbalanced quotes inside the uncertain tag.
    ["html unbalanced \" around <b>", `<a x={ title="<b>x data-p="${P(5000)}" href="ef-f15">`, "html", '"ef-f15"'],
    ["html apostrophe in a value with <b>", `<a x={ title='it"s <b>' data-p="${P(5000)}" href="ef-f16">`, "html", '"ef-f16"'],
    ["svelte unclosed ' then <b", `<a on:click={() => { if (ok) /{/.test(s); }} title='x <b data-p="${P(5000)}" href="ef-f17">x</a>`, "svelte", '"ef-f17"'],
    ["razor unclosed \" then <i>", `<a x={ title="<i>it's data-p='${P(5000)}' href="ef-f18">`, "cshtml", '"ef-f18"']
  ];
  for (const [label, text, extension, value, reviewed = true] of cases) {
    const output = migrateText(text, extension);
    assert.ok(output.includes(value), `${label}: lost ${value}`);
    assert.equal(migrateText(output, extension), output, `${label}: not idempotent`);
    if (!reviewed) continue;
    const result = checkOne(text, extension);
    assert.equal(result.status, 3, `${label}\n${result.stdout}`);
    assert.ok(tagReview(result.stdout).length >= 1, `${label}: no review line`);
  }
});
