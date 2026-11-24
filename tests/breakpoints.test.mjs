// forma#200: one set of viewport breakpoints, declared in the token source,
// published for build-time use (dist/custom-media.css, tokens.json) and used
// by Forma's own viewport media queries. Container queries respond to their
// container, not the viewport, and are not breakpoints.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const tokens = JSON.parse(fs.readFileSync("tokens/forma.tokens.json", "utf8"));
const breakpoints = Object.fromEntries(Object.entries(tokens.primitive.breakpoint)
  .filter(([name]) => !name.startsWith("$"))
  .map(([name, token]) => [name, `${token.$value.value}${token.$value.unit}`]));
const sources = ["src/styles", "src/marketing"]
  .flatMap((dir) => fs.readdirSync(dir).filter((name) => name.endsWith(".css")).map((name) => path.join(dir, name)));
const strip = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "");

test("the token source declares the documented viewport ranges", () => {
  assert.deepEqual(breakpoints, { compact: "30rem", tablet: "48rem", desktop: "64rem" });
});

test("every viewport width query in Forma CSS uses a breakpoint token value", () => {
  const allowed = new Set(Object.values(breakpoints));
  const found = [];
  for (const file of sources) {
    for (const match of strip(fs.readFileSync(file, "utf8")).matchAll(/@media\s+([^{]+)\{/g)) {
      const query = match[1];
      if (/\b(?:max|min)-width\b/.test(query)) found.push(`${file}: legacy width feature in "${query.trim()}"`);
      for (const range of query.matchAll(/\bwidth\s*(<|>=|<=|>)\s*([0-9.]+[a-z]+)/g)) {
        if (range[1] !== "<" && range[1] !== ">=") found.push(`${file}: use half-open ranges (< or >=), not "${range[0]}"`);
        if (!allowed.has(range[2])) found.push(`${file}: ${range[2]} is not a breakpoint token (${[...allowed].join(", ")})`);
      }
    }
  }
  assert.deepEqual(found, []);
});

test("Forma's own components use the breakpoints (workspace stacks below tablet)", () => {
  const css = strip(fs.readFileSync("src/styles/components.css", "utf8"));
  assert.ok(css.includes("@media (width < 48rem)"), "components must respond below the tablet breakpoint");
  assert.ok(css.includes("@media (width < 30rem)"), "components must respond below the compact breakpoint");
});

test("the build publishes @custom-media for every breakpoint and the package exports it", () => {
  const media = fs.readFileSync("dist/custom-media.css", "utf8");
  for (const [name, value] of Object.entries(breakpoints)) {
    assert.ok(media.includes(`@custom-media --forma-below-${name} (width < ${value});`), `missing --forma-below-${name}`);
    assert.ok(media.includes(`@custom-media --forma-from-${name} (width >= ${value});`), `missing --forma-from-${name}`);
  }
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.equal(pkg.exports["./custom-media.css"], "./dist/custom-media.css");
  assert.equal(pkg.exports["./tokens.json"], "./tokens/forma.tokens.json");
});
