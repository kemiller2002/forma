// R7-REM-009 (Rehearsal 6 UI-016-O11 / PF-016-O1): non-text indicator tokens
// meet WCAG 1.4.11 (3:1) against both application surfaces in every theme and
// brand Forma ships.
//
// The workflow vocabulary offers token:status-warning, -danger, -success and
// -info (and token:border-functional, the default diagram outline) so an
// application can draw an attention outline without a brand literal. The
// document rule A11Y-NONTEXT-CONTRAST (src/workflow/Forma.Workflow/
// Validation.fs) judges only literal colours; it cannot know which theme a
// token resolves in. This test is the token-level half of that guarantee: a
// token outline on either surface is at least 3:1 in every compiled context.
//
// A theme that intentionally differs would be listed in DOCUMENTED_EXCEPTIONS
// with its reason. There are none.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { declarations, parseCss } from "./support/css.mjs";

const read = (file) => fs.readFileSync(file, "utf8");

const channel = (value) => {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((offset) => channel(Number.parseInt(hex.slice(offset, offset + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

const NON_TEXT_MINIMUM = 3;
const INDICATORS = ["status-warning", "status-danger", "status-success", "status-info", "border-functional"];
const SURFACES = ["surface-primary", "surface-secondary"];

// `${context id} ${indicator} on ${surface}` -> reason. Empty: no shipped theme
// intentionally differs.
const DOCUMENTED_EXCEPTIONS = new Map();

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
const contexts = compiled.flatMap(themeContexts);

test("the token-level check covers every shipped theme and brand", () => {
  const themes = Object.keys(JSON.parse(read("tokens/echelon.tokens.json")).semantic);
  for (const theme of themes.filter((id) => id !== "light")) {
    assert.ok(contexts.some((context) => context.id.includes(`[data-ef-theme="${theme}"]`)), `no compiled context for theme ${theme}`);
  }
  for (const brand of JSON.parse(read("dist/brands/index.json")).brands) {
    assert.ok(contexts.some((context) => context.id.includes(`[data-ef-brand="${brand.id}"]`)), `no compiled context for brand ${brand.id}`);
  }
  const missing = contexts.flatMap((context) =>
    INDICATORS.filter((role) => !context.colors[role]).map((role) => `${context.id} omits ${role}`));
  assert.deepEqual(missing, []);
});

test("status tokens and border-functional reach 3:1 on both surfaces in every theme and brand (WCAG 1.4.11)", () => {
  const failures = [];
  for (const context of contexts) {
    for (const indicator of INDICATORS) {
      for (const surface of SURFACES) {
        const fg = context.colors[indicator];
        const bg = context.colors[surface];
        const ratio = contrast(fg, bg);
        const key = `${context.id} ${indicator} on ${surface}`;
        if (ratio + 1e-4 < NON_TEXT_MINIMUM && !DOCUMENTED_EXCEPTIONS.has(key)) {
          failures.push(`${context.id}: ${indicator} ${fg} on ${surface} ${bg} = ${ratio.toFixed(2)}:1 < ${NON_TEXT_MINIMUM}:1`);
        }
      }
    }
  }
  assert.deepEqual(failures, [], `non-text indicator tokens below 3:1:\n  ${failures.join("\n  ")}`);
});

test("every documented exception still names a real failing pair", () => {
  for (const key of DOCUMENTED_EXCEPTIONS.keys()) {
    const context = contexts.find((candidate) => key.startsWith(`${candidate.id} `));
    assert.ok(context, `exception ${key} names no compiled context`);
  }
});

test("the Rehearsal 6 outline is below 3:1 and the light status-warning token is not", () => {
  // Causa's identity amber on its ivory fill: the failure that motivated the rule.
  assert.ok(contrast("#e9a23b", "#f5f3ed") < NON_TEXT_MINIMUM);
  const light = contexts.find((context) => context.id.includes('[data-ef-theme="light"]'));
  assert.ok(light, "no light theme context");
  assert.ok(contrast(light.colors["status-warning"], light.colors["surface-primary"]) >= NON_TEXT_MINIMUM);
});
