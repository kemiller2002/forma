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

const timed = (text, extension) => {
  const started = process.hrtime.bigint();
  const result = checkOne(text, extension);
  return { result, seconds: Number(process.hrtime.bigint() - started) / 1e9 };
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
  assert.match(result.stdout, /sample\.tsx:1 a tag here could not be read to its end/);
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
