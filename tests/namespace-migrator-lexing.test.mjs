// FORMA-NS-001.2, Forma 1.0.2 re-review 4 (WI-0054): how tools/NamespaceMigrator
// reads tags in script and markup. Braces are lexed as script (comments,
// regular expressions, template literals, JSX text), a `<` after an operand in
// script is not a tag, a tag whose `{` never closes is listed for review, URL
// attributes are found in any case and in framework bindings, and adversarial
// inputs stay fast. Split from namespace-migrator.test.mjs to keep each file
// under the structural review limit.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const build = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-lex-"));
execFileSync("dotnet", ["build", "tools/NamespaceMigrator/NamespaceMigrator.fsproj", "-c", "Release", "-o", build], { stdio: "pipe" });
const dll = path.join(build, "forma-namespace-migrator.dll");
const run = (...args) => spawnSync("dotnet", [dll, ...args], { encoding: "utf8" });

const migrateText = (text, extension) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-one-"));
  const file = path.join(dir, `sample.${extension}`);
  fs.writeFileSync(file, text);
  const result = run(file);
  assert.equal(result.status, 0, result.stderr);
  return fs.readFileSync(file, "utf8");
};

// The cases come from the reviewer's
// probe scripts: [label, input, extension, substrings that must survive,
// substrings whose ef- must become forma-].
const probe = (cases) => {
  for (const [label, input, extension, keep = [], migrated = []] of cases) {
    const output = migrateText(input, extension);
    for (const text of keep) assert.ok(output.includes(text), `${label}: lost ${text}\n${output}`);
    for (const text of migrated) {
      const expected = text.replace(/ef-/, "forma-");
      assert.ok(output.includes(expected), `${label}: ${text} not migrated\n${output}`);
    }
    assert.equal(migrateText(output, extension), output, `${label}: not idempotent`);
  }
};

const checkOne = (text, extension) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-chk-"));
  const file = path.join(dir, `sample.${extension}`);
  fs.writeFileSync(file, text);
  return spawnSync("dotnet", [dll, "--check", file], { encoding: "utf8", maxBuffer: 1 << 28 });
};

// Timings leave out .NET start-up (measured once on an empty file), so the
// 2 s limits measure the scan itself and keep their headroom on slower CI.
let startup;
const timed = (text, extension) => {
  if (startup === undefined) {
    const started = process.hrtime.bigint();
    checkOne("", extension);
    startup = Number(process.hrtime.bigint() - started) / 1e9;
  }
  const started = process.hrtime.bigint();
  const result = checkOne(text, extension);
  return { result, seconds: Math.max(0, Number(process.hrtime.bigint() - started) / 1e9 - startup) };
};

test("a quote in a comment, regex literal or JSX text inside braces does not hide the closing brace", () => {
  probe([
    ["jsx prop with jsx apostrophe", '<Tip content={<span>Don\'t do this</span>} href="ef-m1" className="ef-t">x</Tip>', "tsx", ['href="ef-m1"'], ['className="ef-t"']],
    ["render prop apostrophe", '<Route render={() => <p>It\'s here</p>} href="ef-m2" />', "jsx", ['href="ef-m2"']],
    ["jsx prop with jsx apostrophe, later quote", '<Tip content={<span>Don\'t</span>} href="ef-m3">x</Tip>\nconst z = \'q\';', "tsx", ['href="ef-m3"']],
    ["line comment in multi-line handler", '<a\n  onClick={() => {\n    // user\'s click\n    go();\n  }}\n  href="ef-m4"\n>x</a>', "tsx", ['href="ef-m4"']],
    ["block comment apostrophe", 'export const A = () => <a onClick={() => { /* don\'t */ go(); }} href="ef-k1" className="ef-c">x</a>;\n', "tsx", ['href="ef-k1"'], ['className="ef-c"']],
    ["line comment apostrophe", 'export const A = () => <a onClick={() => { // don\'t\n go(); }} href="ef-k1b">x</a>;\n', "tsx", ['href="ef-k1b"']],
    ["line comment apostrophe in fn", 'function A() {\n  // it\'s fine\n  return <a onClick={go} href="ef-k2">x</a>;\n}\n', "tsx", ['href="ef-k2"']],
    ["jsx prose apostrophe before tag", 'function A() {\n  return (<div><p>Don\'t</p>\n <a onClick={go} href="ef-k3">x</a><p>It\'s</p></div>);\n}\n', "tsx", ['href="ef-k3"']],
    ["prose apostrophe then expression attr", 'function A() {\n  return (<div><p>Don\'t</p>\n <a onClick={() => { go(); }} href="ef-k4">x</a><p>It\'s</p></div>);\n}\n', "tsx", ['href="ef-k4"']],
    ["regex with double quote", '<a onClick={() => s.replace(/"/g, "")} href="ef-k5">x</a>', "tsx", ['href="ef-k5"']],
    ["regex with brace class", '<a onClick={() => /[{]/.test(s)} href="ef-k6">x</a>', "tsx", ['href="ef-k6"']],
    ["regex with }", '<a onClick={() => /}/.test(s)} href="ef-k7">x</a>', "tsx", ['href="ef-k7"']],
    ["string brace in handler", '<a onClick={() => log("{")} href="ef-k8">x</a>', "tsx", ['href="ef-k8"']],
    ["template ${}", '<a title={`a ${b ? `c` : "d"} e`} href="ef-k9">x</a>', "tsx", ['href="ef-k9"']],
    ["template nested backtick", '<a title={`${`x`}`} href="ef-k10">x</a>', "tsx", ['href="ef-k10"']],
    ["template with }", '<a title={`}`} href="ef-k11">x</a>', "tsx", ['href="ef-k11"']],
    ["style block then svelte", '<style>a { color: red }</style>\n<a on:click={go} href="ef-k12">x</a>', "svelte", ['href="ef-k12"']],
    ["style content quote", '<style>a::before { content: "\'" }</style>\n<a on:click={go} href="ef-k13">x</a>', "svelte", ['href="ef-k13"']],
    ["css apostrophe comment", '<style>a { /* don\'t */ color: red }\nb { x: y }</style>\n<a on:click={go} href="ef-k14">x</a>', "svelte", ['href="ef-k14"']],
    ["vue mustache", '<template><p>{{ msg }}</p><a :x="{a:1}" href="ef-k15">x</a></template>', "vue", ['href="ef-k15"']],
    ["vue mustache apostrophe", "<template><p>{{ it's }}</p><a href=\"ef-k16\">x</a></template>", "vue", ['href="ef-k16"']],
    ["stray }", '} }\n<a onClick={go} href="ef-k17">x</a>', "tsx", ['href="ef-k17"']],
    ["unclosed { prose md", 'Use { to open.\n\n<a href="ef-k18">x</a>', "md", ['href="ef-k18"']],
    ["unclosed { then apostrophe comments", 'const s = "{";\nfunction A(){ // isn\'t\n return <a onClick={go} href="ef-k19">x</a> }\n// it\'s\n', "tsx", ['href="ef-k19"']],
    ["html title brace", '<p title="{">x</p>\n<a onClick={go} href="ef-k20">x</a>', "svelte", ['href="ef-k20"']],
    ["svelte each", '{#each items as item}<a href="ef-k21" on:click={() => f(item)}>x</a>{/each}', "svelte", ['href="ef-k21"']],
    ["block comment apostrophe, later quotes", 'const A = () => <a onClick={() => { /* don\'t */ go(); }} href="ef-k22">x</a>;\nconst B = \'b\';\n', "tsx", ['href="ef-k22"']],
    ["regex with apostrophe", 'const A = () => <a onClick={() => s.replace(/\'/g, "")} href="ef-k23">x</a>;\n', "tsx", ['href="ef-k23"']],
    ["division in braces", '<a onClick={() => { a = b / c; }} title={`x`} href="ef-k24">x</a>', "tsx", ['href="ef-k24"']],
    ["razor code block apostrophe", '@{ var s = "x"; // don\'t\n}\n<a href="ef-k25">x</a>', "cshtml", ['href="ef-k25"']],
    ["js block with apostrophe then jsx", 'if (x) {\n  // can\'t\n}\nconst A = () => <a onClick={go} href="ef-k26">x</a>;\n', "jsx", ['href="ef-k26"']],
    ["17k prop single quotes", `<Widget opts={{ ${Array.from({ length: 1500 }, (_, i) => `k${i}: f('v${i}')`).join(", ")} }} href="ef-big2" />`, "tsx", ['href="ef-big2"']]
  ]);
});

test("a tag whose { is never closed is listed for review, and --check exits 3", () => {
  const result = checkOne('const A = () => <a onClick={() => { go(); href="ef-u1">x</a>;\n', "tsx");
  assert.equal(result.status, 3, result.stdout);
  assert.match(result.stdout, /sample\.tsx:1 a tag here could not be read with certainty/);
  assert.match(result.stdout, /; 1 uncertain tag\(s\) to review/);
  const closed = checkOne('const A = () => <a onClick={() => { go(); }} href="ef-u2">x</a>;\n', "tsx");
  assert.match(closed.stdout, /; 0 uncertain tag\(s\) to review/);
  assert.equal(closed.status, 0, closed.stdout);
  // A tag in a string that ends before its `>` is not uncertain: no brace is open.
  const partial = checkOne(`const s = html.split('<div class="x-grid"')[1]?.split('<nav class="pager"')[0];\n`, "mjs");
  assert.equal(partial.status, 0, partial.stdout);
});

test("a < after an operand in script is a comparison, not a tag", () => {
  probe([
    ["stray <b && then data=", 'if (a <b && c) data = "ef-card";\n', "js", [], ['"ef-card"']],
    ["stray <n ) then src=", 'while (i <n ) { step(); }\nsrc = "ef-sprite";\n', "js", [], ['"ef-sprite"']],
    ["stray <len ; then template", 'for (i = 0; i <len ; i++) {}\nconst o = { href: 1 }; data = `ef-tpl`;\n', "js", [], ["`ef-tpl`"]],
    ["F# comparison", 'let ok = a <b && c\nlet data = "ef-f"\n', "fs", [], ['"ef-f"']],
    ["F# if comparison", 'if a <b then\n  let data = "ef-fs"\n  ()', "fs", [], ['"ef-fs"']],
    ["stray < then data= (no space)", 'if (i <n) data = "ef-card2";\n', "js", [], ['"ef-card2"']],
    ["stray < then data= next line", 'if (i <n)\n  data = "ef-card3";\n', "js", [], ['"ef-card3"']],
    ["for loop then data", 'for (let i = 0; i <n; i++) cls = 1;\nlet data = "ef-panel";\n', "ts", [], ['"ef-panel"']],
    ["TS generic", 'function f<T extends X> (x: T) {}\nconst y: Array<Foo | Bar\n  data = "ef-z";', "ts", [], ['"ef-z"']],
    ["mjs stray", 'if (a <b && c) { x.src = "ef-a"; }\n', "mjs", [], ['"ef-a"']]
  ]);
  // Tags still start where JSX or markup can stand.
  probe([
    ["jsx after return", 'function A() {\n  return <a href="ef-j1" className="ef-j">x</a>;\n}', "jsx", ['href="ef-j1"'], ['className="ef-j"']],
    ["jsx after (", 'const A = () => (\n  <a\n    href="ef-j2">x</a>\n);', "tsx", ['href="ef-j2"']],
    ["jsx after &&", '{open && <a href="ef-j3">x</a>}', "tsx", ['href="ef-j3"']],
    ["jsx after ?", 'x ? <a href="ef-j4">y</a> : null', "jsx", ['href="ef-j4"']],
    ["jsx text before a link", 'const A = () => <p>See the <a href="ef-j5">docs</a> and {n} more <img src="ef-j6.png" /></p>;', "tsx", ['href="ef-j5"', 'src="ef-j6.png"']],
    ["jsx text over lines", 'const A = () => (\n  <p>\n    Read the\n    guide <a href="ef-j7">here</a>\n  </p>\n);', "jsx", ['href="ef-j7"']],
    ["markup in a script string", 'el.innerHTML = \'<a href="ef-j8" class="ef-s">x</a>\';', "ts", ['href="ef-j8"'], ['class="ef-s"']],
    ["markup in an F# string", 'let link = "<p>See <a href=\\"ef-j9\\">x</a></p>"', "fs", ['href=\\"ef-j9\\"']],
    ["markup in a template literal", 'const t = html`\n<a href="ef-j10">x</a>`;', "ts", ['href="ef-j10"']],
    ["html script comparison", '<script>if (a <b && c) x = 1;</script>\n<a href="ef-j11">x</a>', "html", ['href="ef-j11"']]
  ]);
});

test("attribute names in any case, framework bindings and selectors keep URL values", () => {
  probe([
    ["HTML uppercase", '<A HREF="ef-up1">x</A><IMG SRC="ef-up2.png" CLASS="ef-u">', "html", ['HREF="ef-up1"', 'SRC="ef-up2.png"'], ['CLASS="ef-u"']],
    ["JSX srcSet", '<img srcSet="ef-a.png 2x" className="ef-i" />', "jsx", ['srcSet="ef-a.png 2x"'], ['className="ef-i"']],
    ["JSX formAction/xlinkHref", '<button formAction="ef-post" /><use xlinkHref="ef-sprite.svg#a" />', "jsx", ['formAction="ef-post"', 'xlinkHref="ef-sprite.svg#a"']],
    ["vue :src and v-bind:href", `<img :src="'/ef-a.png'" v-bind:href="'ef-b'" class="ef-v">`, "vue", ["'/ef-a.png'", "'ef-b'"], ['class="ef-v"']],
    ["angular [src] and [href]", `<img [src]="'ef-a.png'" [href]="'ef-b'">`, "html", ["'ef-a.png'", "'ef-b'"]],
    ["selector HREF", `d.querySelector('a[HREF="ef-up"] .ef-z')`, "js", ['HREF="ef-up"'], [".ef-z"]],
    ["selector escaped inner quote", `el.querySelector("a[title=\\"x\\"][href='ef-c'] .ef-s")`, "js", ["href='ef-c'"], [".ef-s"]],
    ["selector in a variable", `const sel = 'a[href="ef-var"] .ef-w'; d.querySelector(sel);`, "js", ['"ef-var"'], [".ef-w"]],
    ["CSS attribute selector", 'a[href^="ef-"] .ef-x { color: red }', "css", ['href^="ef-"'], [".ef-x"]],
    ["selector ~= |= $=", `d.querySelectorAll('a[href~="ef-t"], a[href|=ef-u], a[href$=".ef-v"]')`, "js", ['href~="ef-t"', "href|=ef-u", 'href$=".ef-v"']],
    ["selector ] in value", `d.querySelector('a[href="ef-x]y"] .ef-z')`, "js", ['"ef-x]y"'], [".ef-z"]]
  ]);
  assert.equal(migrateText('el.dataset.efX = 1; el.dataset["efY"];', "ts"), 'el.dataset.formaX = 1; el.dataset["formaY"];');
});

test("SVG filter and animation elements and more HTML elements keep a prefixed string ambiguous", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-prefix2-"));
  const file = path.join(dir, "prefixes.mjs");
  const ambiguous = ["feGaussianBlur.ef-x.svg", "feColorMatrix.ef-x.svg", "animate.ef-x.svg", "mpath.ef-x.svg", "animateTransform.ef-x.svg",
    "datalist.ef-x.md", "hgroup.ef-x.md", "rp.ef-x.md", "rt.ef-x.md"];
  const source = ambiguous.map((value, i) => `const a${i} = "${value}";`).join("\n") + "\n";
  fs.writeFileSync(file, source);
  const check = run("--check", dir);
  assert.equal(check.status, 3);
  for (const value of ambiguous) assert.ok(check.stdout.includes(`"${value}" is either a class selector or a file name`), value);
  assert.equal(run(dir).status, 0);
  assert.equal(fs.readFileSync(file, "utf8"), source);
});

test("performance: adversarial inputs from the re-review stay under 2 s each", () => {
  for (const [label, extension, text, status] of [
    ["unclosed quote before .ef-a x20,000", "js", '"' + ".ef-a".repeat(20000) + "\n", 3],
    ["unclosed Razor @( x100,000 lines", "cshtml", '<a href="@(x\n'.repeat(100000), 0],
    ["unclosed string then <b { x50,000 lines", "tsx", '{"\n' + "<b {\n".repeat(50000), 3],
    ["unclosed string then <b { x200,000 lines", "tsx", '{"\n' + "<b {\n".repeat(200000), 3],
    ["stray <b in script x200,000 lines", "js", "if (a <b && c) { x.src = s; }\n".repeat(200000), 0]
  ]) {
    const { result, seconds } = timed(text, extension);
    assert.equal(result.status, status, `${label}: ${result.stderr}`);
    assert.ok(seconds < 2, `${label}: took ${seconds.toFixed(2)} s; expected under 2 s`);
  }
});

// Forma 1.0.2 re-review 5 (WI-0055): the lexer's own state decides where markup
// stands; when the tool cannot tell, it reports and leaves the value alone.
const reviewLines = (stdout) => stdout.split("\n").filter((line) => /^review: .*(could not be read with certainty|may be a tag)/.test(line));

test("tags where JSX, strings, template literals and comments hold markup keep their URL values (b7)", () => {
  const long = "word ".repeat(60);
  probe([
    ["after =>", 'const A = () => <a href="ef-j1">x</a>;', "jsx", ['"ef-j1"']],
    ["after => newline", 'const A = () =>\n  <a href="ef-j2">x</a>;', "jsx", ['"ef-j2"']],
    ["after :", 'const r = ok ? <b>y</b> : <a href="ef-j3">x</a>;', "tsx", ['"ef-j3"']],
    ["object value", 'const m = { link: <a href="ef-j4">x</a> };', "tsx", ['"ef-j4"']],
    ["array literal", 'const xs = [<a key="1" href="ef-j5">x</a>, <a key="2" href="ef-j6">y</a>];', "tsx", ['"ef-j5"', '"ef-j6"']],
    ["export default", 'export default <a href="ef-j7">x</a>;', "jsx", ['"ef-j7"']],
    ["after JSX comment", '<div>{/* note */}<a href="ef-j8">x</a></div>', "tsx", ['"ef-j8"']],
    ["prop value", '<Card footer={<a href="ef-j9">x</a>} />', "tsx", ['"ef-j9"']],
    ["as cast", 'const el = (<a href="ef-j10">x</a>) as unknown as JSX.Element;', "tsx", ['"ef-j10"']],
    ["satisfies", 'const el = <a href="ef-j11">x</a> satisfies ReactNode;', "tsx", ['"ef-j11"']],
    ["return(", 'function A(){return(<a href="ef-j12">x</a>)}', "jsx", ['"ef-j12"']],
    ["&&", '{ok && <a href="ef-j13">x</a>}', "jsx", ['"ef-j13"']],
    ["map", '{items.map(i => <a key={i} href="ef-j14">x</a>)}', "jsx", ['"ef-j14"']],
    ["children after text with :", '<p>Note: see <a href="ef-j15">docs</a></p>', "jsx", ['"ef-j15"']],
    ["children after paren text", '<p>Read the guide (see <a href="ef-j16">here</a>).</p>', "jsx", ['"ef-j16"']],
    ["children after em dash", '<p>Pricing — see <a href="ef-j17">plans</a></p>', "jsx", ['"ef-j17"']],
    ["children after &amp;", '<p>Terms &amp; see <a href="ef-j18">x</a></p>', "jsx", ['"ef-j18"']],
    ["children after long text", `<p>${long}see <a href="ef-j19">x</a></p>`, "jsx", ['"ef-j19"']],
    ["children multi-line", '<p>\n  Read the\n  <a href="ef-j20">docs</a>\n</p>', "jsx", ['"ef-j20"']],
    ["children multi-line word", '<p>\n  Read the <a href="ef-j21">docs</a>\n</p>', "jsx", ['"ef-j21"']],
    ["children after digits", '<p>Step 2 <a href="ef-j22">x</a></p>', "jsx", ['"ef-j22"']],
    ["children after expr", '<p>{n} items, see <a href="ef-j23">x</a></p>', "jsx", ['"ef-j23"']],
    ["children after /", '<p>Yes/no see <a href="ef-j24">x</a></p>', "jsx", ['"ef-j24"']],
    ["innerHTML string", "el.innerHTML = 'Click <a href=\"ef-j25\">here</a>';", "js", ['"ef-j25"']],
    ["innerHTML string ts", "el.innerHTML = 'Click <a href=\"ef-j26\">here</a>';", "ts", ['"ef-j26"']],
    ["i18n string", 'export default { help: "See our <a href=\'ef-j27\'>docs</a>." };', "js", ["'ef-j27'"]],
    ["lit ts multiline", 'html`<p>\n  Read the <a href="ef-j28">docs</a>\n</p>`;', "ts", ['"ef-j28"']],
    ["lit js multiline", 'html`<p>\n  Read the <a href="ef-j29">docs</a>\n</p>`;', "js", ['"ef-j29"']],
    ["template html string text", 'const t = `Hello ${name}, see <a href="ef-j30">x</a>`;', "ts", ['"ef-j30"']],
    ["fsharp html string", 'let s = "Read the <a href=\\"ef-j31\\">docs</a>"', "fs", ["ef-j31"]],
    ["fsharp triple", 'let s = """Read <a href="ef-j32">docs</a>"""', "fs", ['"ef-j32"']],
    ["yield/else", 'if (x) y(); else <a href="ef-j33"/>;', "jsx", ['"ef-j33"']],
    ["after ??", 'const z = q ?? <a href="ef-j34"/>;', "jsx", ['"ef-j34"']],
    ["after ...", '<A {...p} href="ef-j35"/>', "jsx", ['"ef-j35"']],
    ["after ) in jsx children", '<p>(x) <a href="ef-j36">y</a></p>', "jsx", ['"ef-j36"']],
    ["after ! text", '<p>Hi! <a href="ef-j37">y</a></p>', "jsx", ['"ef-j37"']],
    ["after * text", '<p>* <a href="ef-j38">y</a></p>', "jsx", ['"ef-j38"']],
    ["after number punct", '<p>Price: $5. See <a href="ef-j39">y</a></p>', "jsx", ['"ef-j39"']],
    ["vue in js render string", "template: '<div>Go to <a href=\"ef-j40\">x</a></div>'", "js", ['"ef-j40"']],
    ["comment with markup", '// see <a href="ef-j41">x</a>\nconst y = "ef-j42";', "ts", ['"ef-j41"'], ['"ef-j42"']]
  ]);
});

test("braces the lexer cannot be sure of are reviewed, and their href is never rewritten (b8)", () => {
  probe([
    ["regex after ) {", 'function A() {\n  return <a onClick={() => { if (ok) /{/.test(s); }} href="ef-l1">x</a>;\n}\n', "jsx", ['"ef-l1"']],
    ["regex after ) quote", 'function A() {\n  return <a onClick={() => { if (ok) /\'/.test(s); }} href="ef-l2">x</a>;\n}\n', "jsx", ['"ef-l2"']],
    ["regex after ) quote, more code", 'function A() {\n  return <a onClick={() => { if (ok) /\'/.test(s); }} href="ef-l3">x</a>;\n}\nfunction B() { return \'y\'; }\n', "jsx", ['"ef-l3"']],
    ["generic arrow then apostrophe comment", 'const id = <T extends unknown>(x: T) => x;\n// it\'s {\nexport const A = () => <a onClick={() => go()} href="ef-l4">x</a>;\nfunction B() { }\n', "tsx", ['"ef-l4"']],
    ["generic arrow then jsx", 'const id = <T extends unknown>(x: T): T => { return x; };\nexport const A = () => <a onClick={() => { /* don\'t */ go(); }} href="ef-l5">x</a>;\n', "tsx", ['"ef-l5"']],
    ["generic arrow then string brace", 'const id = <T extends unknown>(x: T) => x;\nconst o = "{";\nexport const A = () => <a onClick={() => go()} href="ef-l6">x</a>;\nfunction B() { }\n', "tsx", ['"ef-l6"']],
    ["generic arrow, closing tag later", 'const id = <T extends unknown>(x: T) => x;\nconst s = "{";\nexport const A = () => <div><a onClick={() => go("}")} href="ef-l7">x</a></div>;\n', "tsx", ['"ef-l7"']],
    ["division after )", '<a onClick={() => setW((a + b) / 2)} title={`x`} href="ef-l8">x</a>', "jsx", ['"ef-l8"']],
    ["regex after }", '<a onClick={() => { if (x) {} /}/.test(s) }} href="ef-l9">x</a>', "jsx", ['"ef-l9"']],
    ["< comparison in handler", '<a onClick={() => a <b && go()} href="ef-l10">x</a>', "jsx", ['"ef-l10"']],
    ["< comparison prop paren", '<a disabled={(n)<max} href="ef-l11">x</a>', "jsx", ['"ef-l11"']],
    ["comparison <Name in handler", '<a onClick={() => i <Max ? 1 : 2} href="ef-l12">x</a>', "jsx", ['"ef-l12"']],
    ["type arg in tsx handler", '<a onClick={() => useRef<HTMLElement | null>(null)} href="ef-l13">x</a>', "tsx", ['"ef-l13"']],
    ["as generic in tsx", '<a onClick={() => (x as Array<string>).map(f)} href="ef-l14">x</a>', "tsx", ['"ef-l14"']],
    ["return type <", '<a onClick={(): Promise<void> => go()} href="ef-l15">x</a>', "tsx", ['"ef-l15"']],
    ["object type literal", 'type P = { a: string };\nexport const A = (p: P) => <a onClick={() => go()} href="ef-l16">x</a>;', "tsx", ['"ef-l16"']],
    ["arrow generic with default", 'const f = <T = string>(x: T) => x;\nexport const A = () => <a onClick={() => { /* it\'s */ }} href="ef-l17">x</a>;\n', "tsx", ['"ef-l17"']],
    ["jsx text with > and {", '<p>a > b {"{"}</p><a onClick={go} href="ef-l18">x</a>', "jsx", ['"ef-l18"']],
    ["jsx attr string with {", '<a title="{" onClick={go} href="ef-l19">x</a>', "jsx", ['"ef-l19"']],
    ["ternary : <", 'x ? 1 : <a onClick={go} href="ef-l20"/>', "jsx", ['"ef-l20"']],
    ["closing with member", '<Foo.Bar onClick={go}><a href="ef-l21">x</a></Foo.Bar>', "jsx", ['"ef-l21"']],
    ["svelte {#if}", '{#if x}<a on:click={go} href="ef-l22">x</a>{/if}', "svelte", ['"ef-l22"']],
    ["css url // in svelte style", '<style>a { background: url(//cdn.x.com/a.png) }</style>\n<a on:click={go} href="ef-l23">x</a>', "svelte", ['"ef-l23"']],
    ["vue file closes at EOF", '<a :x="1" href="ef-l24">y</a>\n<script>export default {}</script>', "vue", ['"ef-l24"']]
  ]);
  // The regex-after-`)` cases are a real ambiguity: listed for review.
  const result = checkOne('function A() {\n  return <a onClick={() => { if (ok) /{/.test(s); }} href="ef-l1" className="ef-c">x</a>;\n}\n', "jsx");
  assert.equal(result.status, 3, result.stdout);
  assert.equal(reviewLines(result.stdout).length, 1, result.stdout);
  // Plain JSX handlers are not.
  for (const [text, extension] of [['<a onClick={() => setW((a + b) / 2)} title={`x`} href="ef-l8">x</a>', "jsx"], ['<a onClick={() => { a = b / c; }} href="ef-k24">x</a>', "tsx"], ['} }\n<a onClick={go} href="ef-k17">x</a>', "tsx"]]) {
    const clean = checkOne(text, extension);
    assert.equal(reviewLines(clean.stdout).length, 0, `${text}\n${clean.stdout}`);
  }
});

test("a <name in script code with a URL attribute after it is reviewed and left unrewritten", () => {
  for (const [text, extension, value] of [
    ['const r = n <a href="ef-p1" data-x="1">;', "js", '"ef-p1"'],
    ['const r = n <a title="t" src="ef-p2.png">;', "ts", '"ef-p2.png"'],
    ['let r = n <a href="ef-p3" />', "fs", '"ef-p3"']
  ]) {
    assert.ok(migrateText(text, extension).includes(value), text);
    const result = checkOne(text, extension);
    assert.equal(result.status, 3, `${text}\n${result.stdout}`);
    assert.match(result.stdout, /sample\.\w+:1 a <name here may be a tag; its src\/href value was left unrewritten/);
  }
  // A comparison followed by script, not attributes, is not reviewed.
  const clean = checkOne('if (a <b && c) data = "ef-card";\nlet ok = a <b && c\n', "js");
  assert.equal(reviewLines(clean.stdout).length, 0, clean.stdout);
});

test("a {...} group that closes on the last character of the file is closed", () => {
  for (const [text, extension] of [['x = <a href="ef-e1" onClick={go}', "jsx"], ['<a href="ef-e2" on:click={go}', "svelte"]]) {
    const result = checkOne(text, extension);
    assert.equal(reviewLines(result.stdout).length, 0, `${text}\n${result.stdout}`);
    assert.ok(migrateText(text, extension).includes('"ef-e'), text);
  }
});

test("performance: long lines of [href= and unclosed /[ stay under 2 s each", () => {
  for (const [label, extension, text] of [
    ["[href= x100,000 on one line", "css", "[href=".repeat(100000)],
    ["[data= x50,000 on one line in script", "js", "x[data=".repeat(50000)],
    ["{ then x=/[ x100,000 in HTML", "html", '<a href="ef-x">\n{' + "x=/[".repeat(100000)],
    ["x=/[ x100,000 in script", "js", '<a href="ef-x">\n' + "x=/[".repeat(100000)]
  ]) {
    const { result, seconds } = timed(text, extension);
    assert.ok(result.status === 0 || result.status === 3, `${label}: ${result.stderr}`);
    assert.ok(seconds < 2, `${label}: took ${seconds.toFixed(2)} s; expected under 2 s`);
  }
});

// Forma 1.0.2 re-review 6 (WI-0056): a brace resolved without the lexer's
// certainty is reviewed, every suppressed value gets its own line, and the
// possible-tag check reads past a spread.
test("braces resolved by the plain fallback or inside a lost JSX element are reviewed, never rewritten (b10)", () => {
  probe([
    ["generic arrow then template with {", 'const f = <T extends unknown>(x: T) => x;\nconst u = `x ${y} {`;\n<p>see <a onClick={() => f("}")} href="ef-z1">x</a></p>', "tsx", ['"ef-z1"']],
    ["generic + styled", 'const identity = <T extends unknown>(x: T) => x;\nconst Box = styled.div`\n  &:hover { color: red; }\n`;\nexport const A = () => <a onClick={() => f("}")} href="ef-z2">x</a>;\n', "tsx", ['"ef-z2"']],
    ["generic + tpl with { in fn", 'const identity = <T extends unknown>(x: T) => x;\nfunction g() { return `{${a}}`; }\nexport const A = () => <a onClick={() => f("}")} href="ef-z3">x</a>;\n', "tsx", ['"ef-z3"']],
    ["generic + json tpl", 'const identity = <T extends unknown>(x: T) => x;\nconst body = { q: `{"a":${a}` };\nexport const A = () => <a onClick={() => f("}")} href="ef-z4">x</a>;\n', "tsx", ['"ef-z4"']],
    ["no generic, tpl unclosed {", 'const u = `x ${y} {`;\nexport const A = () => <a onClick={() => f("}")} href="ef-z5">x</a>;\n', "tsx", ['"ef-z5"']],
    ["generic + string brace", 'const identity = <T extends unknown>(x: T) => x;\nconst s = { a: "{" };\nexport const A = () => <a onClick={() => f("}")} href="ef-z6">x</a>;\n', "tsx", ['"ef-z6"']],
    ["generic + comment brace", 'const identity = <T extends unknown>(x: T) => x;\nconst s = { a: 1 }; // {\nexport const A = () => <a onClick={() => f("}")} href="ef-z7">x</a>;\n', "tsx", ['"ef-z7"']],
    ["generic + regex brace", 'const identity = <T extends unknown>(x: T) => x;\nconst s = { a: /{/ };\nexport const A = () => <a onClick={() => f("}")} href="ef-z8">x</a>;\n', "tsx", ['"ef-z8"']],
    ["plain fallback in string tag", "const h = '<a onclick=\"f(\\'}\\')\" data-x={a} href=\"ef-z9\">';", "js", ['"ef-z9"']],
    ["plain fallback tpl tag", 'const h = `<a onclick="${"}"}" data-x={a} href="ef-z10">`;', "js", ['"ef-z10"']],
    ["comment tag with braces", '/* <a x={f("}")} href="ef-z11"> */', "js", ['"ef-z11"']],
    ["string tag with braces", 'const s = \'<a x={f("}")} href="ef-z12">\';', "ts", ['"ef-z12"']]
  ]);
  for (const [text, extension] of [
    ['/* <a x={f("}")} href="ef-z11"> */', "js"],
    ['const s = \'<a x={f("}")} href="ef-z12">\';', "ts"]
  ]) {
    const result = checkOne(text, extension);
    assert.equal(result.status, 3, `${text}\n${result.stdout}`);
    assert.match(result.stdout, /could not be read with certainty/);
  }
});

test("the re-review's mixed cases keep URL values and migrate names (b9)", () => {
  probe([
    ["tpl ${jsx}", 'const s = `a ${<a onClick={go} href="ef-n1">x</a>} b`;', "jsx", ['"ef-n1"']],
    ["tpl nested tpl+jsx", 'const s = `a ${`b ${<a title={`t${1}`} href="ef-n2">x</a>}`} c`;', "jsx", ['"ef-n2"']],
    ["jsx in ${} with quote", 'const s = `${ok ? <p>Don\'t <a href="ef-n3">x</a></p> : ""}`;', "jsx", ['"ef-n3"']],
    ["tpl html with ${} then href", 'el.innerHTML = `<a data-x="${y}" href="ef-n4">x</a>`;', "ts", ['"ef-n4"']],
    ["tpl html ${} containing }", 'el.innerHTML = `<a data-x="${"}"}" href="ef-n5">x</a>`;', "ts", ['"ef-n5"']],
    ["div after )", 'const w = (a + b) / 2; const A = () => <a onClick={go} href="ef-n6">x</a>;', "jsx", ['"ef-n6"']],
    ["div after ] with quote later", 'const r = xs[0] / 2; const s = "\'"; const A = () => <a onClick={() => f("}")} href="ef-n7">x</a>;', "jsx", ['"ef-n7"']],
    ["regex after return", 'function f(s){ return /[{"]/.test(s) }\nconst A = () => <a onClick={() => f("}")} href="ef-n8">x</a>;', "jsx", ['"ef-n8"']],
    ["regex after typeof", 'const t = typeof /{/;\nconst A = () => <a onClick={go} href="ef-n9">x</a>;', "jsx", ['"ef-n9"']],
    ["div after ident with {", 'const q = total / count; const o = { a: 1 };\nconst A = () => <a onClick={() => { go(); }} href="ef-n10">x</a>;', "jsx", ['"ef-n10"']],
    ["regex in handler after )", '<a onClick={() => (s) /x/} href="ef-n11">x</a>', "jsx", ['"ef-n11"']],
    ["div in handler w/ quote", '<a onClick={() => setW(a / b + "\'" + c / d)} href="ef-n12">x</a>', "jsx", ['"ef-n12"']],
    ["regex with ) in class", '<a onClick={() => /[)]/.test(s)} href="ef-n13">x</a>', "jsx", ['"ef-n13"']],
    ["regex with escaped /", '<a onClick={() => /a\\/b\'/.test(s)} href="ef-n14">x</a>', "jsx", ['"ef-n14"']],
    ["regex with nested group", '<a onClick={() => /((a)|(b\'))/.test(s)} href="ef-n15">x</a>', "jsx", ['"ef-n15"']],
    ["regex flags d/g/v", '<a onClick={() => /\'/dgv.test(s)} href="ef-n16">x</a>', "jsx", ['"ef-n16"']],
    ["ternary jsx both", 'const A = ({ok}) => ok ? <a href="ef-n17">y</a> : <a href="ef-n18">n</a>;', "tsx", ['"ef-n17"', '"ef-n18"']],
    ["ternary paren", 'return ok\n  ? (<a href="ef-n19">y</a>)\n  : null;', "jsx", ['"ef-n19"']],
    ["arrow body block", 'const A = () => { const x = 1; return <a href="ef-n20">x</a>; };', "jsx", ['"ef-n20"']],
    ["arrow returning jsx after )", 'const A = (p) => (\n  <a {...p} href="ef-n21">x</a>\n);', "jsx", ['"ef-n21"']],
    ["jsx after comparison-like", 'const A = () => n > 0 && <a href="ef-n22">x</a>;', "jsx", ['"ef-n22"']],
    ["jsx spread then href", '<a {...props} href="ef-n23">x</a>', "jsx", ['"ef-n23"']],
    ["string with backtick", 'const s = "`"; const A = () => <a onClick={() => f("}")} href="ef-n24">x</a>;', "jsx", ['"ef-n24"']],
    ["string with backtick in handler", '<a onClick={() => f("`")} href="ef-n25">x</a>', "jsx", ['"ef-n25"']],
    ["single-quoted backtick", "const s = '`{'; const A = () => <a onClick={go} href=\"ef-n26\">x</a>;", "jsx", ['"ef-n26"']],
    ["comment with backtick", '// use `x\nconst A = () => <a onClick={() => f("}")} href="ef-n27">x</a>;', "jsx", ['"ef-n27"']],
    ["html comment a href", '<!-- <a href="ef-n28">old</a> -->\n<p class="ef-p">x</p>', "html", ['"ef-n28"'], ['"ef-p"']],
    ["html comment in js string", 'const s = "<!-- <a href=\'ef-n29\'> -->";', "js", ["'ef-n29'"]],
    ["jsx comment with tag", '<div>{/* <a href="ef-n30"> */}</div>', "jsx", ['"ef-n30"']],
    ["html script block", '<script>if (a <b && c) { x = "y"; }\nconst h = \'<a href="ef-n31">\';</script>\n<a href="ef-n32">x</a>', "html", ['"ef-n31"', '"ef-n32"']],
    ["html style block", '<style>.ef-a > a[href^="ef-n33"] { color: red }</style><a href="ef-n34">', "html", ['"ef-n33"', '"ef-n34"'], [".ef-a"]],
    ["html script with }", '<script>const o = "}"; function f(){ return "{"; }</script>\n<a onclick="f()" href="ef-n35">x</a>', "html", ['"ef-n35"']],
    ["html script name assign", '<script>if (n <max) el.className = "ef-q";</script>', "html", [], ['"ef-q"']],
    ["vue sfc", '<template>\n  <a :class="{ on: x }" href="ef-n36" class="ef-v">x</a>\n</template>\n<script>\nexport default { data() { return { u: "it\'s" } } }\n</script>\n<style>.ef-v { color: red }</style>', "vue", ['"ef-n36"'], ['class="ef-v"', ".ef-v {"]],
    ["vue script with jsx-like", '<script setup lang="ts">\nconst a = b <c;\nconst n = "ef-name";\n</script>\n<template><a href="ef-n37">x</a></template>', "vue", ['"ef-n37"'], ['"ef-name"']],
    ["svelte sfc", '<script>\n  let s = "it\'s";\n  const re = /}/;\n</script>\n{#if ok}<a on:click={() => go("}")} href="ef-n38">x</a>{/if}', "svelte", ['"ef-n38"']],
    ["possible tag with spread", 'const r = x <a {...p} href="ef-n39">;', "jsx", ['"ef-n39"']],
    ["comparison then data name", 'if (a <b) data = "ef-nm1";', "js", [], ['"ef-nm1"']],
    ["comparison with attr-like then name", 'let ok = a <b c=d; data = "ef-nm2";', "js", [], ['"ef-nm2"']]
  ]);
  const spread = checkOne('const r = x <a {...p} href="ef-n39">;', "jsx");
  assert.equal(spread.status, 3, spread.stdout);
  assert.match(spread.stdout, /a <name here may be a tag/);
});

test("a value left unrewritten after an uncertain tag gets its own review line; script after it is migrated (b11)", () => {
  probe([
    ["data name after uncertain", 'const A = () => <a onClick={() => { if (ok) /{/.test(s); }} href="ef-u1">x</a>;\nel.data = 1; let data = "ef-card"; const c = "ef-cls";\n', "jsx", ['"ef-u1"'], ['"ef-card"', '"ef-cls"']],
    ["background name after uncertain", 'const A = () => <a x={ href="ef-u2">\n el.style; background = "ef-bg";', "jsx", ['"ef-u2"'], ['"ef-bg"']],
    ["beyond 4 KiB", 'const A = () => <a x={ href="ef-u3">\n' + "//".padEnd(5000, "x") + '\n data = "ef-far";', "jsx", [], ['"ef-far"']]
  ]);
  const text = 'const A = () => <a onClick={() => { if (ok) /{/.test(s); }}\n  title="t"\n  href="ef-s1">x</a>;\n';
  assert.ok(migrateText(text, "jsx").includes('href="ef-s1"'));
  const result = checkOne(text, "jsx");
  assert.equal(result.status, 3, result.stdout);
  assert.match(result.stdout, /sample\.jsx:1 a tag here could not be read with certainty/);
  assert.match(result.stdout, /sample\.jsx:3 a src\/href value here holds a Forma name and was left unrewritten/);
  const dry = run("--dry-run", (() => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "forma-nsm-dry-")); const f = path.join(d, "s.jsx"); fs.writeFileSync(f, text); return f; })());
  assert.match(dry.stdout, /s\.jsx:3 a src\/href value here holds a Forma name and was left unrewritten/);
});
