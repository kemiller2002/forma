import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const COLOR_CONTRACT_FORMAT = "forma.color-contract/1.0.0";

const walkLeaves = (value, prefix = [], output = []) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return output;
  if (Object.hasOwn(value, "$value")) output.push([prefix.join("."), value]);
  else for (const [key, child] of Object.entries(value)) {
    if (!key.startsWith("$")) walkLeaves(child, [...prefix, key], output);
  }
  return output;
};

const atPath = (root, dotted) => dotted.split(".").reduce((value, key) => value?.[key], root);

const resolveDtcg = (root, token, stack = []) => {
  const value = token?.$value ?? token;
  if (typeof value === "string" && /^\{[^}]+\}$/.test(value)) {
    const alias = value.slice(1, -1);
    if (stack.includes(alias)) throw new Error(`circular color alias ${[...stack, alias].join(" -> ")}`);
    const target = atPath(root, alias);
    if (!target) throw new Error(`unknown color alias ${value}`);
    return resolveDtcg(root, target, [...stack, alias]);
  }
  const hex = value?.hex ?? value;
  if (typeof hex !== "string" || !/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`color token does not resolve to six-digit hex: ${JSON.stringify(value)}`);
  return hex.toLowerCase();
};

const flattenTheme = (document, theme) => Object.fromEntries(
  walkLeaves(document.semantic?.[theme]?.color).map(([role, token]) => [`--ef-color-${role.replaceAll(".", "-")}`, resolveDtcg(document, token)])
);

const flattenBrandTheme = theme => {
  const output = {};
  const visit = (value, prefix = []) => {
    for (const [key, child] of Object.entries(value ?? {})) {
      if (typeof child === "string") output[`--ef-color-${[...prefix, key].join("-")}`] = child.toLowerCase();
      else visit(child, [...prefix, key]);
    }
  };
  visit(theme?.color);
  return output;
};

const rolePairings = [
  { role: "primary-action", classification: "supported-primitive", foreground: "--ef-color-text-inverse", background: "--ef-color-surface-inverse", minimumContrast: 4.5, nonColorCue: "visible action label and native button semantics" },
  { role: "secondary-action", classification: "supported-primitive", foreground: "--ef-color-text-primary", background: "--ef-color-surface-primary", boundary: "--ef-color-border-functional", minimumContrast: 4.5, nonColorCue: "visible action label and functional border" },
  { role: "link", classification: "supported-primitive", foreground: "--ef-color-accent-primary", background: "--ef-color-surface-primary", minimumContrast: 4.5, nonColorCue: "underline or link context; secondary surfaces re-pair through Forma's surface hook" },
  { role: "selection", classification: "supported-primitive", foreground: "--ef-color-text-inverse", background: "--ef-color-surface-inverse", minimumContrast: 4.5, nonColorCue: "native selected, checked, or aria-current state" },
  ...[["notice", "info"], ["pending-or-unknown", "info"], ["warning", "warning"], ["danger", "danger"], ["success", "success"]].map(([role, token]) => ({ role, classification: "supported-primitive", foreground: `--ef-color-status-${token}`, background: "--ef-color-surface-primary", minimumContrast: 4.5, nonColorCue: "state text plus glyph, border, or accessible name" })),
  { role: "disabled", classification: "supported-primitive", foreground: "--ef-color-text-primary", background: "--ef-color-surface-secondary", boundary: "--ef-color-border-functional", minimumContrast: 4.5, nonColorCue: "native disabled state, dashed boundary, and not-allowed cursor; opacity is supplemental" },
  { role: "focus", classification: "supported-primitive", foreground: "--ef-color-focus-ring", background: "--ef-color-surface-primary", minimumContrast: 3, nonColorCue: "two-part outline geometry shown by keyboard focus" },
  { role: "categorical-data-visualization", classification: "application-extension", minimumContrast: 3, nonColorCue: "direct labels, shapes, patterns, or a text/table alternative", note: "Forma does not certify a universal categorical palette." },
  { role: "ordinal-data-visualization", classification: "application-extension", minimumContrast: 3, nonColorCue: "ordered position plus labels, patterns, or a text/table alternative", note: "Applications must validate the complete rendered scale in context." }
];

export const createColorContract = ({ tokenDocument, brands, formaVersion }) => {
  const themeIds = Object.keys(tokenDocument.semantic ?? {});
  const themes = themeIds.map(id => ({
    kind: "theme",
    id,
    selector: id === "light" ? ":root, [data-ef-theme=\"light\"]" : `[data-ef-theme=\"${id}\"]`,
    source: "tokens/echelon.tokens.json",
    values: flattenTheme(tokenDocument, id)
  }));
  const baseline = themes.find(context => context.id === "light")?.values ?? {};
  const publicNames = Object.keys(baseline).sort();
  const rolesByName = new Map(walkLeaves(tokenDocument.semantic.light.color).map(([role]) => [`--ef-color-${role.replaceAll(".", "-")}`, role]));
  for (const context of themes) {
    const missing = publicNames.filter(name => !context.values[name]);
    if (missing.length) throw new Error(`theme ${context.id} omits public colors: ${missing.join(", ")}`);
  }
  const brandContexts = brands.flatMap(({ file, document }) => ["light", "dark"].map(theme => {
    const values = { ...flattenTheme(tokenDocument, theme), ...flattenBrandTheme(document.themes?.[theme]) };
    const missing = publicNames.filter(name => !values[name]);
    if (missing.length) throw new Error(`brand ${document.id}/${theme} omits public colors: ${missing.join(", ")}`);
    return { kind: "brand", id: `${document.id}/${theme}`, selector: `[data-ef-brand=\"${document.id}\"][data-ef-theme=\"${theme}\"]`, source: file, values };
  }));
  return {
    format: COLOR_CONTRACT_FORMAT,
    formaVersion,
    validationScope: "CSS var() references to --ef-color-* plus reserved internal color-related prefixes; other Forma APIs are governed by their own contracts.",
    compatibility: { policy: "Validate with the contract shipped by the pinned Forma package version.", additiveWithinMajor: true },
    fallbackPolicy: {
      unknownFormaToken: "refused-even-with-fallback",
      applicationToken: "ignored",
      knownFormaTokenLiteralFallback: "permitted-only-when-the-six-digit-hex-equals-the-light-theme-value",
      rationale: "A literal may support standalone layer loading, but it must not invent a color or make an unsupported Forma name appear valid."
    },
    publicTokens: publicNames.map(name => ({
      name,
      role: rolesByName.get(name),
      scopes: ["root", "theme", "brand", "skin"],
      variants: { themes: themeIds, brands: brands.map(item => item.document.id) },
      source: { file: "tokens/echelon.tokens.json", path: `semantic.<theme>.color.${rolesByName.get(name)}` },
      provenance: { kind: "generated", compiler: "tools/color-contract/build.mjs" },
      deprecatedAliases: []
    })),
    internalVariables: {
      public: false,
      prefixes: ["--ef-tone-", "--ef-surface-", "--ef-field-", "--ef-grid-", "--ef-effect-"],
      policy: "Implementation variables are not a consumer compatibility contract."
    },
    unsupportedNames: [
      { name: "--ef-color-action-primary", use: "--ef-color-surface-inverse", pairWith: "--ef-color-text-inverse" },
      { name: "--ef-color-text-link", use: "--ef-color-accent-primary", pairWith: "--ef-color-surface-primary" },
      { name: "--ef-color-focus", use: "--ef-color-focus-ring", pairWith: "--ef-color-focus-gap" },
      { name: "--ef-color-text-danger", use: "--ef-color-status-danger", pairWith: "--ef-color-surface-primary" }
    ],
    rolePairings,
    forcedColors: { foreground: "CanvasText", surface: "Canvas", selection: "Highlight/HighlightText", authorAdjust: "auto" },
    contexts: [...themes, ...brandContexts]
  };
};

const defaultContractPath = fileURLToPath(new URL("../../contracts/color-contract.json", import.meta.url));
export const loadColorContract = (contractPath = defaultContractPath) => JSON.parse(fs.readFileSync(contractPath, "utf8"));

const editDistance = (left, right) => {
  const row = [...Array(right.length + 1).keys()];
  for (let i = 1; i <= left.length; i += 1) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[right.length];
};

const location = (source, index) => {
  const before = source.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, column: lines.at(-1).length + 1 };
};

export const validateCssColorReferences = (source, { contract = loadColorContract(), file = "<input>" } = {}) => {
  const known = new Set(contract.publicTokens.map(token => token.name));
  const replacements = new Map(contract.unsupportedNames.map(item => [item.name, item.use]));
  const internalPrefixes = contract.internalVariables?.prefixes ?? [];
  const defaults = contract.contexts.find(item => item.kind === "theme" && item.id === "light")?.values ?? {};
  const findings = [];
  const pattern = /var\(\s*(--[a-z0-9_-]+)/gi;
  for (const match of source.matchAll(pattern)) {
    const name = match[1];
    if (!name.startsWith("--ef-")) continue;
    const where = location(source, match.index + match[0].indexOf(name));
    if (internalPrefixes.some(prefix => name.startsWith(prefix))) {
      findings.push({ code: "COLOR_INTERNAL_FORMA_VARIABLE", file, ...where, token: name, suggestion: "use a public --ef-color-* role", message: `${name} is an internal implementation variable; use a public semantic color role` });
      continue;
    }
    if (!name.startsWith("--ef-color-")) continue;
    if (!known.has(name)) {
      const suggestion = replacements.get(name) ?? [...known].sort((a, b) => editDistance(name, a) - editDistance(name, b) || a.localeCompare(b))[0];
      findings.push({ code: "COLOR_UNKNOWN_FORMA_TOKEN", file, ...where, token: name, suggestion, message: `unsupported Forma token ${name}; use ${suggestion}` });
      continue;
    }
    const call = source.slice(match.index).match(/^var\(\s*--[a-z0-9_-]+\s*,\s*(#[0-9a-f]{6})\s*\)/i);
    if (call && call[1].toLowerCase() !== defaults[name]) {
      findings.push({ code: "COLOR_LITERAL_FALLBACK_MISMATCH", file, ...where, token: name, suggestion: defaults[name], message: `literal fallback for ${name} must equal its light-theme value ${defaults[name]} or be removed` });
    }
  }
  return findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column || a.code.localeCompare(b.code));
};

export const validateColorFiles = (files, options = {}) => files.flatMap(file => validateCssColorReferences(fs.readFileSync(file, "utf8"), { ...options, file: path.normalize(file) }));
