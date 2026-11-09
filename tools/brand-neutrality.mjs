// Brand-neutrality guard (EDS-ADR-002, BNR-001.5).
//
// Forma is brand-neutral: an organization's identity belongs in a brand
// manifest or theme package that ships outside Forma (Echelon's lives in
// @echelon-foundry/echelon-theme). This guard is absolute, not a ratchet. It
// allows zero findings in Forma's source CSS, in dist/, and in the packed npm
// tarball:
//
//   identity  the organization's name, its brand manifest, its logo paths and
//             its palette names ("Echelon", "/brand/", "oxide-bronze", ...);
//   palette   a color literal equal to a color of the Echelon palette Forma
//             shipped through 0.14.0 (hex in any length, or rgb()/rgba());
//   layer     an `@layer echelon` cascade-layer name.
//
// Publisher metadata is not identity and is the only thing allowed:
//   - the npm scope `@echelon-foundry/<package>`, the publisher domain
//     `*.echelonfoundry.com` (homepage, schema $id URIs), the .NET namespace
//     `EchelonFoundry.Forma.*` and the licensor named in the README;
//   - in dist/runtime.js only, the identifiers of the cross-library
//     ECHELON-RUNTIME-1 registry contract shared with other libraries
//     (window.__ECHELON_RUNTIME__ and its registrar);
//   - CHANGELOG.md, the release history, which records the removal itself.
//
// Usage:
//   node tools/brand-neutrality.mjs                 check src CSS, dist/ and a fresh npm pack
//   node tools/brand-neutrality.mjs --tarball X.tgz check one packed tarball
//   node tools/brand-neutrality.mjs --dir DIR       check every text file under DIR
// Exit status 0 when clean, 3 when anything is found (the Praxis convention).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The Echelon palette Forma shipped through 0.14.0: the echelon brand
// manifest, the default light/dark semantic maps (Echelon's), and the
// Echelon-named primitives. Frozen here because the sources left Forma.
export const ECHELON_PALETTE = Object.freeze(new Set([
  "#171a18", "#202421", "#2d5f86", "#2e6a45", "#3a403c", "#47756b", "#686d68", "#698d84", "#86560f", "#8cc49f",
  "#905831", "#90b9dc", "#a13a2c", "#a87e5e", "#ddb266", "#e3e0d7", "#ef9a8b", "#f2efe7", "#74461f", "#c9a07f",
  "#f8f6f1"
]));

// Echelon palette and asset names that identify the organization even
// without its name.
const IDENTITY = /echelon|\/brand\/|oxide-bronze|verdigris|foundry-charcoal|forged-iron/gi;
const PUBLISHER = [
  /@echelon-foundry\/[a-z0-9-]+/gi,
  /\b(?:[a-z0-9-]+\.)*echelonfoundry\.com\b/gi,
  /\bEchelonFoundry\.Forma\.[A-Za-z.]+/g,
  /separate license from Echelon Foundry/g
];
const RUNTIME_CONTRACT = [
  /__ECHELON_(?:REGISTER_)?RUNTIME__/g,
  /\binstallEchelonRuntimeRegistrar\b/g,
  /\bregisterEchelonRuntime\b/g,
  /\bechelonRuntimeSchemaVersion\b/g,
  /\bEchelon [Rr]untime\b/g
];
const EXEMPT_FILES = new Set(["CHANGELOG.md"]);
const LAYER = /@layer\b[^{;]*\bechelon\b/gi;
const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})\b/gi;
const RGB = /\brgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\b/gi;
const TEXT = /\.(?:css|html?|js|mjs|cjs|json|md|txt|fs|fsproj|svg|sha256|lock|ya?ml)$/i;

// Normalized to #rrggbb; an alpha channel is dropped, so #905831cc still
// counts as the palette color it tints.
export const normalizeHex = (hex) => {
  const h = hex.toLowerCase().slice(1);
  const full = h.length <= 4 ? [...h].map((c) => c + c).join("") : h;
  return `#${full.slice(0, 6)}`;
};

const toHex = (r, g, b) => `#${[r, g, b].map((v) => Number(v).toString(16).padStart(2, "0")).join("")}`;

const scrub = (text, patterns) => patterns.reduce((acc, pattern) => acc.replace(pattern, ""), text);

export const identityFindings = (text, file = "") => {
  const base = path.basename(file);
  const allowed = base === "runtime.js" ? [...PUBLISHER, ...RUNTIME_CONTRACT] : PUBLISHER;
  return [...scrub(text, allowed).matchAll(IDENTITY)].map((m) => m[0]);
};

export const paletteFindings = (text, palette = ECHELON_PALETTE) => [
  ...[...text.matchAll(HEX)].map((m) => normalizeHex(m[0])),
  ...[...text.matchAll(RGB)].map((m) => toHex(m[1], m[2], m[3]))
].filter((hex) => palette.has(hex));

export const layerFindings = (text) => [...text.matchAll(LAYER)].map((m) => m[0].trim());

// One file's findings. A path that names the organization (a reappearing
// echelon.brand.json, brands/echelon.css) is identity in its own right.
export const scanText = (file, text) => {
  if (EXEMPT_FILES.has(path.basename(file))) return [];
  const findings = [];
  if (/echelon/i.test(file.replace(/@echelon-foundry/gi, ""))) findings.push({ file, kind: "identity", match: "file path" });
  for (const match of identityFindings(text, file)) findings.push({ file, kind: "identity", match });
  for (const match of paletteFindings(text)) findings.push({ file, kind: "palette", match });
  for (const match of layerFindings(text)) findings.push({ file, kind: "layer", match });
  return findings;
};

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});

export const scanDirectory = (dir, label = dir) => walk(dir)
  .filter((file) => TEXT.test(file) || path.basename(file) === "LICENSE" || path.basename(file) === "NOTICE")
  .flatMap((file) => scanText(path.join(label, path.relative(dir, file)), fs.readFileSync(file, "utf8")));

export const SOURCE_CSS = (root = ".") => [
  ...walk(path.join(root, "src")).filter((file) => file.endsWith(".css")),
  ...walk(path.join(root, "packages")).filter((file) => file.endsWith(".css") && !file.includes(`${path.sep}dist${path.sep}`) && !file.includes("node_modules"))
].map((file) => path.relative(root, file)).sort();

export const scanSourceCss = (root = ".") =>
  SOURCE_CSS(root).flatMap((file) => scanText(file, fs.readFileSync(path.join(root, file), "utf8")));

export const extractTarball = (tarball) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-pack-"));
  execFileSync("tar", ["-xzf", tarball, "-C", dir]);
  return path.join(dir, "package");
};

export const packTarball = (root = ".") => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-pack-"));
  const output = execFileSync("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", dir], { cwd: root, encoding: "utf8" });
  return path.join(dir, JSON.parse(output)[0].filename);
};

export const scanTarball = (tarball) => scanDirectory(extractTarball(tarball), "tarball");

const report = (findings) => {
  for (const finding of findings) process.stderr.write(`${finding.kind}\t${finding.file}\t${finding.match}\n`);
  process.stdout.write(`brand neutrality: ${findings.length} finding(s)\n`);
  return findings.length === 0 ? 0 : 3;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
  let findings;
  if (option("--tarball")) findings = scanTarball(option("--tarball"));
  else if (option("--dir")) findings = scanDirectory(option("--dir"));
  else findings = [...scanSourceCss(), ...scanDirectory("dist"), ...scanTarball(packTarball())];
  process.exitCode = report(findings);
}
