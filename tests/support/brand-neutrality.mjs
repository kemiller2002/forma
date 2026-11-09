// Brand-neutrality measurement for Forma's generic stylesheets (AIS-001.4).
//
// Forma is the brand-neutral layer; an organization's identity belongs in a
// brand manifest, a theme package, or the application. Two kinds of leak are
// measured in the generic CSS:
//   identity  the organization's name or asset paths ("Echelon", "/brand/");
//             the historical cascade-layer prefix (`@layer echelon.*`) and
//             `echelon.tokens` source references are naming debt, not
//             rendered identity, and are excluded.
//   palette   hex literals equal to a color of the shipped Echelon palette
//             (the echelon brand manifest plus the default light/dark
//             semantic maps, which are Echelon's today).
// Counts are a ratchet against tests/fixtures/brand-neutrality-baseline.json:
// they may fall, never rise.
import fs from "node:fs";

export const GENERIC_STYLESHEETS = Object.freeze([
  "src/styles/foundations.css",
  "src/styles/components.css",
  "src/styles/skins.css",
  "src/styles/assessment.css",
  "src/marketing/roles.css",
  "src/marketing/foundations.css",
  "src/marketing/components.css",
  "src/marketing/layouts.css"
]);

const HEX = /#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi;

const normalizeHex = (hex) => {
  const h = hex.toLowerCase();
  return h.length === 4 ? `#${[...h.slice(1)].map((c) => c + c).join("")}` : h;
};

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));

const leaves = (node, path = []) =>
  node && typeof node === "object"
    ? "$value" in node
      ? [[path.join("."), node.$value]]
      : Object.entries(node).filter(([key]) => !key.startsWith("$")).flatMap(([key, child]) => leaves(child, [...path, key]))
    : [];

const resolveTokenHex = (primitives) => (value) =>
  typeof value === "string" && /^\{.+\}$/.test(value)
    ? primitives.get(value.slice(1, -1)) ?? null
    : value && typeof value === "object" && typeof value.hex === "string"
      ? normalizeHex(value.hex)
      : null;

export const echelonPalette = (root = ".") => {
  const tokens = JSON.parse(fs.readFileSync(`${root}/tokens/echelon.tokens.json`, "utf8"));
  const brand = JSON.parse(fs.readFileSync(`${root}/brands/echelon.brand.json`, "utf8"));
  const primitives = new Map(
    leaves(tokens.primitive, ["primitive"])
      .filter(([, value]) => value && typeof value === "object" && typeof value.hex === "string")
      .map(([path, value]) => [path, normalizeHex(value.hex)])
  );
  const resolve = resolveTokenHex(primitives);
  const semantic = ["light", "dark"]
    .flatMap((theme) => leaves(tokens.semantic?.[theme]?.color ?? {}))
    .map(([, value]) => resolve(value));
  const brandHexes = (JSON.stringify(brand.themes).match(HEX) ?? []).map(normalizeHex);
  return new Set([...semantic, ...brandHexes].filter(Boolean));
};

const IDENTITY = /echelon|\/brand\//gi;
const ALLOWED_IDENTITY = /@layer\s+echelon\.[a-z-]+|echelon\.(?:tokens|foundations|components|brand|assessment|marketing)\b/gi;

export const identityCount = (css) =>
  (stripComments(css).replace(ALLOWED_IDENTITY, "").match(IDENTITY) ?? []).length;

export const paletteCount = (css, palette) =>
  (stripComments(css).match(HEX) ?? []).map(normalizeHex).filter((hex) => palette.has(hex)).length;

export const hexLiterals = (css) => (stripComments(css).match(HEX) ?? []).map(normalizeHex);

export const measure = (root = ".") => {
  const palette = echelonPalette(root);
  return Object.fromEntries(
    GENERIC_STYLESHEETS.map((file) => {
      const css = fs.readFileSync(`${root}/${file}`, "utf8");
      return [file, { identity: identityCount(css), palette: paletteCount(css, palette) }];
    })
  );
};

// The AIS-001 block: from its opening marker to the end of components.css.
export const AIS_MARKER = "AIS-001: application identity, pre-runtime startup and pending actions.";
export const aisBlock = (root = ".") => {
  const css = fs.readFileSync(`${root}/src/styles/components.css`, "utf8");
  const start = css.indexOf(AIS_MARKER);
  return start < 0 ? null : css.slice(start);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify({ palette: [...echelonPalette()].sort(), files: measure() }, null, 2)}\n`);
}
