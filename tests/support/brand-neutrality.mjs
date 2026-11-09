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

const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})\b/gi;

// Normalized to #rrggbb; an alpha channel is dropped, so #905831cc still
// counts as the palette color it tints.
const normalizeHex = (hex) => {
  const h = hex.toLowerCase().slice(1);
  const full = h.length <= 4 ? [...h].map((c) => c + c).join("") : h;
  return `#${full.slice(0, 6)}`;
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
// Only the historical cascade-layer names are allowed: `@layer echelon.x`
// statements and blocks (comments are stripped before matching).
const ALLOWED_IDENTITY = /@layer\s+echelon\.[a-z-]+(?:\s*,\s*echelon\.[a-z-]+)*/gi;

export const identityCount = (css) =>
  (stripComments(css).replace(ALLOWED_IDENTITY, "").match(IDENTITY) ?? []).length;

export const paletteCount = (css, palette) =>
  (stripComments(css).match(HEX) ?? []).map(normalizeHex).filter((hex) => palette.has(hex)).length;

export const hexLiterals = (css) => (stripComments(css).match(HEX) ?? []).map(normalizeHex);

// Every way of writing a literal color other than a system color or keyword:
// hex (3, 4, 6, 8 digits), color functions, and CSS named colors. Used on
// rules that must take every color from tokens (the AIS-001 block).
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi;
const NAMED_COLORS = "aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen".split(" ");
const NAMED = new RegExp(`:[^;{}]*\\b(?:${NAMED_COLORS.join("|")})\\b`, "gi");
const declarationValues = (css) => stripComments(css).replace(/"[^"]*"|'[^']*'/g, '""');

export const colorLiterals = (css) => {
  const values = declarationValues(css);
  return [
    ...(values.match(HEX) ?? []),
    ...(values.match(COLOR_FUNCTION) ?? []),
    ...[...values.matchAll(NAMED)].map((match) => match[0].trim())
  ];
};

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
