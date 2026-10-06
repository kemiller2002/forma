// FORMA-A11Y-002 / FORMA-BUILD-001: the built CSS is what consumers load, so
// it is checked as built, not only as authored. tests/css-source.test.mjs
// guards hand-written sources; this test guards every file the build emits,
// including the F#-generated token and brand layers and every concatenated
// bundle, against the defect that shipped in Forma 0.3.0: a literal "\n"
// before `.ef-surface :where(...)` turned the selector into
// `n .ef-surface :where(...)`, a valid rule for a nonexistent <n> element
// that never matched anything.
//
// Three properties are asserted for every emitted stylesheet:
//   1. it tokenizes cleanly: balanced blocks, terminated comments and
//      strings, and no stray escape sequence outside strings;
//   2. every style-rule selector names only real element types;
//   3. every output that the build composes from sources contains exactly the
//      sources' style rules, in order, so concatenation can neither drop,
//      corrupt nor invent a selector.
//
// FORMA_DIST_ROOT may point at another checkout (for example a release
// worktree) to audit its build output with the same rules.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
const root = path.resolve(process.env.FORMA_DIST_ROOT ?? process.cwd());
const resolve = (file) => path.join(root, file);
const read = (file) => fs.readFileSync(resolve(file), "utf8");

import { knownType, normalize, parseCss, typeSelectors } from "./support/css.mjs";

function cssFiles(directory) {
  return fs.readdirSync(resolve(directory), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) return cssFiles(relative);
    return entry.name.endsWith(".css") ? [relative] : [];
  });
}

const outputs = cssFiles("dist").sort();

// How the build composes each output (tools/build-assets.mjs and the
// presentation bundle). Generated layers (dist/tokens.css, dist/brands/*) have
// no CSS source and are covered by the parse and type-selector checks.
function compositions() {
  const map = new Map();
  for (const file of ["foundations.css", "components.css", "assessment.css", "skins.css"]) {
    map.set(`dist/${file}`, [`src/styles/${file}`]);
  }
  const marketing = ["roles.css", "foundations.css", "components.css", "layouts.css"].map((file) => `src/marketing/${file}`);
  map.set("dist/marketing.css", marketing);
  map.set("dist/all.css", ["dist/tokens.css", "src/styles/foundations.css", "src/styles/components.css", "src/styles/assessment.css", ...marketing]);

  const bundle = JSON.parse(read("bundles/echelon-marketing.bundle.json"));
  for (const artifact of bundle.artifacts) {
    map.set(path.join(bundle.outputDirectory, artifact.file), artifact.sources.map((source) =>
      source.startsWith("artifact:") ? path.join(bundle.outputDirectory, source.slice("artifact:".length)) : source));
  }
  return map;
}

function selectorsOf(file, map, seen = new Set()) {
  if (seen.has(file)) throw new Error(`circular composition through ${file}`);
  if (map.has(file) && file.startsWith("dist/") && !fs.existsSync(resolve(file))) throw new Error(`${file} was not built`);
  const sources = map.get(file);
  if (!sources || !file.startsWith("dist/") || sources.every((source) => source === file)) {
    return parseCss(read(file)).rules.map((rule) => rule.selector);
  }
  return sources.flatMap((source) => map.has(source)
    ? selectorsOf(source, map, new Set([...seen, file]))
    : parseCss(read(source)).rules.map((rule) => rule.selector));
}

test("the build emitted stylesheets to audit", () => {
  assert.ok(outputs.includes("dist/all.css"), "dist/all.css is missing; run npm run build first");
  assert.ok(outputs.includes("dist/foundations.css"), "dist/foundations.css is missing; run npm run build first");
});

for (const file of outputs) {
  test(`${file} parses without stray escapes or unbalanced blocks`, () => {
    const { errors, rules } = parseCss(read(file));
    assert.deepEqual(errors, [], `${file}:\n  ${errors.join("\n  ")}`);
    assert.ok(rules.length > 0 || /tokens|brands/.test(file), `${file} contains no style rules`);
  });

  test(`${file} selectors name only real element types`, () => {
    const unknown = parseCss(read(file)).rules.flatMap((rule) =>
      typeSelectors(rule.selector)
        .filter((name) => !knownType(name))
        .map((name) => `line ${rule.line}: <${name}> in "${rule.selector}"`));
    assert.deepEqual(unknown, [], `${file} has selectors for nonexistent elements:\n  ${unknown.join("\n  ")}`);
  });
}

test("every composed output contains exactly its sources' selectors, in order", () => {
  const map = compositions();
  for (const [output, sources] of map) {
    if (!fs.existsSync(resolve(output))) {
      assert.fail(`${output} is declared by the build but was not emitted`);
    }
    const expected = sources.flatMap((source) => map.has(source) ? selectorsOf(source, map) : parseCss(read(source)).rules.map((rule) => rule.selector));
    const actual = parseCss(read(output)).rules.map((rule) => rule.selector);
    const missing = expected.filter((selector, index) => actual[index] !== selector).slice(0, 5);
    assert.equal(actual.length, expected.length, `${output} has ${actual.length} style rules; its sources have ${expected.length}. First differences: ${missing.join(" | ")}`);
    assert.deepEqual(actual, expected, `${output} selectors differ from its sources`);
  }
});

test("the tokenizer rejects the 0.3.0 defect and accepts legitimate escapes", () => {
  const defect = ".ef-surface { color: red; }\\n  .ef-surface :where(p) { color: inherit; }";
  assert.match(parseCss(defect).errors.join("\n"), /stray escape sequence "\\n"/);
  assert.deepEqual(typeSelectors(normalize(parseCss(defect).rules[1].selector)).filter((name) => !knownType(name)), ["\\n"]);
  assert.deepEqual(parseCss(".a::before { content: \"\\2014\\n\"; } .sm\\:p-2 { margin: 0; } .b\\31 { margin: 0; }").errors, []);
  assert.deepEqual(typeSelectors(":where(h1, h2) > p:nth-child(2n + 1 of .x):not(input[type=\"x y\"]) ef-widget"), ["h1", "h2", "p", "input", "ef-widget"]);
  assert.match(parseCss(".a { color: red; ").errors.join(), /unclosed/);
});
