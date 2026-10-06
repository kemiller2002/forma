// FORMA-A11Y-002: documented foreground/surface token pairs meet WCAG AA in
// every theme and brand Forma ships, and every rule that paints the secondary
// surface re-pairs its foreground roles.
//
// The token compilers validate secondary text and the accent roles against
// surface.primary only. On surface.secondary the validated foregrounds are
// text.primary, text.heading and text.on-secondary-surface. Forma 0.3.0
// painted surface.secondary behind inline faults, assistant turns, file
// drop zones and other components while their paragraphs, hints and links
// kept text.secondary / accent.primary: #686d68 on #e3e0d7 is 4.0:1.
//
// The application layer now mirrors the marketing layer's surface tone: every
// rule that paints surface.secondary rebinds secondary/muted text to
// text.on-secondary-surface and sets --ef-surface-accent-text-color to text.primary.
// This test fails when a rule paints the secondary surface without that
// pairing, and when any documented pair falls below its minimum in any
// compiled theme or brand.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { declarations, parseCss } from "./support/css.mjs";

const read = (file) => fs.readFileSync(file, "utf8");

// --- Secondary-surface pairing ----------------------------------------------

const SOURCES = ["src/styles/foundations.css", "src/styles/components.css", "src/styles/assessment.css"];
const SECONDARY_BACKGROUND = /^var\(--ef-color-surface-secondary\b/;

const PAIRING = {
  "--ef-color-text-secondary": /^var\(--ef-color-text-on-secondary-surface\b/,
  "--ef-color-text-muted": /^var\(--ef-color-text-on-secondary-surface\b/,
  "--ef-surface-accent-text-color": /^var\(--ef-color-text-primary\b/
};

const rules = SOURCES.flatMap((file) => parseCss(read(file)).rules.map((rule) => ({ ...rule, file })));

test("links resolve through the secondary-surface accent-text hook", () => {
  const link = rules.find((rule) => rule.file === "src/styles/foundations.css" && rule.selector === ":where(a)");
  assert.ok(link, "foundations must style :where(a)");
  const color = Object.fromEntries(declarations(link.body)).color ?? "";
  assert.match(color, /^var\(--ef-surface-accent-text-color, var\(--ef-color-accent-primary\b/);
});

test("accent-colored text routes through the secondary-surface hook", () => {
  const direct = rules.flatMap((rule) => declarations(rule.body)
    .filter(([property, value]) => property === "color" && /^var\(--ef-color-accent-/.test(value))
    .map(() => `${rule.file}:${rule.line} ${rule.selector}`));
  assert.deepEqual(direct, [], `accent text must use var(--ef-surface-accent-text-color, var(--ef-color-accent-*)) so it re-pairs on the secondary surface:\n  ${direct.join("\n  ")}`);
});

test("every rule that paints the secondary surface re-pairs its foreground roles", () => {
  const painting = rules.filter((rule) => declarations(rule.body).some(([property, value]) =>
    (property === "background" || property === "background-color") && SECONDARY_BACKGROUND.test(value)));
  assert.ok(painting.length > 0, "no rule paints the secondary surface; the check is not looking at the right files");
  const unpaired = painting.flatMap((rule) => {
    const values = Object.fromEntries(declarations(rule.body));
    const missing = Object.entries(PAIRING).filter(([property, expected]) => !expected.test(values[property] ?? "")).map(([property]) => property);
    return missing.length ? [`${rule.file}:${rule.line} ${rule.selector} (missing ${missing.join(", ")})`] : [];
  });
  assert.deepEqual(unpaired, [], `rules paint --ef-color-surface-secondary without re-pairing their text:\n  ${unpaired.join("\n  ")}`);
});

// --- Token-pair contrast -------------------------------------------------------

const channel = (value) => {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((offset) => channel(Number.parseInt(hex.slice(offset, offset + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

// Foreground roles documented for each surface (docs/AGENT-USAGE.md, "Color
// pairs"). Optional roles are checked wherever a theme declares them.
const PAIRS = [
  ...["text-primary", "text-heading", "text-secondary", "text-on-secondary-surface", "accent-primary", "accent-secondary",
    "text-muted", "accent-hover", "status-success", "status-warning", "status-danger", "status-info"]
    .map((foreground) => [foreground, "surface-primary", 4.5]),
  ...["text-primary", "text-heading", "text-on-secondary-surface"].map((foreground) => [foreground, "surface-secondary", 4.5]),
  ["text-primary", "surface-elevated", 4.5],
  ["text-inverse", "surface-inverse", 4.5],
  ["focus-ring", "surface-primary", 3],
  ["focus-ring", "surface-secondary", 3]
];

function themeContexts(file) {
  return parseCss(read(file)).rules.flatMap((rule) => {
    const colors = Object.fromEntries(declarations(rule.body)
      .filter(([property, value]) => property.startsWith("--ef-color-") && /^#[0-9a-f]{6}$/i.test(value))
      .map(([property, value]) => [property.slice("--ef-color-".length), value.toLowerCase()]));
    return colors["surface-primary"] && colors["surface-secondary"] ? [{ id: `${file} ${rule.selector}`, colors }] : [];
  });
}

const compiled = [
  "dist/tokens.css",
  ...fs.readdirSync("dist/brands").filter((file) => file.endsWith(".css")).map((file) => path.join("dist/brands", file)),
  "dist/marketing/forma-marketing-theme-echelon.css"
];

test("compiled themes and brands expose complete color contexts", () => {
  const contexts = compiled.flatMap(themeContexts);
  const themes = Object.keys(JSON.parse(read("tokens/echelon.tokens.json")).semantic);
  for (const theme of themes.filter((id) => id !== "light")) {
    assert.ok(contexts.some((context) => context.id.includes(`[data-ef-theme="${theme}"]`)), `no compiled context for theme ${theme}`);
  }
  for (const brand of JSON.parse(read("dist/brands/index.json")).brands) {
    assert.ok(contexts.some((context) => context.id.includes(`[data-ef-brand="${brand.id}"]`)), `no compiled context for brand ${brand.id}`);
  }
});

test("every documented token pair meets its WCAG AA minimum in every theme and brand", () => {
  const failures = [];
  for (const context of compiled.flatMap(themeContexts)) {
    for (const [foreground, background, minimum] of PAIRS) {
      const fg = context.colors[foreground];
      const bg = context.colors[background];
      if (!fg || !bg) continue;
      const ratio = contrast(fg, bg);
      if (ratio + 1e-4 < minimum) failures.push(`${context.id}: ${foreground} ${fg} on ${background} ${bg} = ${ratio.toFixed(2)}:1 < ${minimum}:1`);
    }
  }
  assert.deepEqual(failures, []);
});

test("the token pair that failed in 0.3.0 is not a documented pair", () => {
  // Documents the root cause: graphite on stone is below AA, which is why
  // secondary text must be re-paired on the secondary surface.
  assert.ok(contrast("#686d68", "#e3e0d7") < 4.5);
  assert.ok(!PAIRS.some(([foreground, background]) => foreground === "text-secondary" && background === "surface-secondary"));
});
