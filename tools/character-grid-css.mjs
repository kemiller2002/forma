// Generates the CharacterGrid coordinate rules in src/styles/components.css.
//
// Forma places character-grid runs with data-ef-* attributes rather than
// inline style so consuming applications can keep a strict style-src CSP.
// Each attribute value maps to a registered custom property; the layout
// rules in components.css read only those properties.
//
//   node tools/character-grid-css.mjs          rewrite the generated block
//   node tools/character-grid-css.mjs --check  exit 1 if the block is stale
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const LIMITS = Object.freeze({
  rows: 50,
  columns: 132,
  gutter: 4
});

export const BEGIN = "/* BEGIN generated: character-grid coordinates (tools/character-grid-css.mjs) */";
export const END = "/* END generated: character-grid coordinates */";

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => from + index);

const mapping = (attribute, property, values) =>
  values.map(value => `  :where(.ef-character-grid) [data-ef-${attribute}="${value}"] { --ef-${property}: ${value}; }`);

const geometry = (attribute, property, values) =>
  values.map(value => `  .ef-character-grid[data-ef-${attribute}="${value}"] { --ef-${property}: ${value}; }`);

export const generateCoordinateRules = () => [
  BEGIN,
  ...geometry("rows", "grid-rows", range(1, LIMITS.rows)),
  ...geometry("columns", "grid-columns", range(1, LIMITS.columns)),
  ...mapping("row", "row", range(1, LIMITS.rows)),
  ...mapping("col", "col", range(1, LIMITS.columns)),
  ...mapping("len", "len", range(1, LIMITS.columns)),
  ...mapping("height", "height", range(1, LIMITS.rows)),
  ...mapping("gutter", "gutter", range(0, LIMITS.gutter)),
  `  ${END}`
].join("\n");

export const replaceGeneratedBlock = (css, block) => {
  const start = css.indexOf(BEGIN);
  const end = css.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error("character-grid generated block markers are missing from components.css");
  }
  return css.slice(0, start) + block.trimStart() + css.slice(end + END.length);
};

const main = () => {
  const file = path.join(process.cwd(), "src", "styles", "components.css");
  const css = fs.readFileSync(file, "utf8");
  const next = replaceGeneratedBlock(css, generateCoordinateRules());
  if (process.argv.includes("--check")) {
    if (next !== css) {
      console.error("character-grid coordinate rules are stale; run node tools/character-grid-css.mjs");
      process.exitCode = 1;
    }
    return;
  }
  fs.writeFileSync(file, next);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
