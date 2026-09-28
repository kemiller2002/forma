import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const compiler = "tools/TokenCompiler/TokenCompiler.fsproj";
const themeSource = "themes/echelon/marketing.tokens.json";
const coreSource = "tokens/echelon.tokens.json";
const themeCss = fs.readFileSync("build/marketing/echelon-marketing.tokens.css", "utf8");
const roles = fs.readFileSync("src/marketing/roles.css", "utf8");

// The marketing role contract (requirements/MARKETING-PRESENTATION.md MKT-TOK).
const colorRoles = [
  "surface-primary", "surface-secondary", "surface-elevated", "surface-inverse", "surface-inverse-secondary",
  "text-primary", "text-heading", "text-secondary", "text-muted", "text-on-secondary-surface", "text-inverse",
  "accent-primary", "accent-hover", "accent-secondary",
  "border-subtle", "border-functional",
  "status-success", "status-warning", "status-danger", "status-info",
  "focus-ring", "focus-gap"
].map(name => `--ef-color-${name}`);

const roleTokens = [
  "type-family-body", "type-family-display", "type-family-mono",
  "type-size-label", "type-size-small", "type-size-body", "type-size-lead",
  "type-size-h1", "type-size-h2", "type-size-h3", "type-size-h4", "type-size-statement",
  "type-leading-body", "type-leading-lead", "type-leading-heading", "type-leading-snug",
  "type-weight-body", "type-weight-strong", "type-weight-heading", "type-weight-label", "type-weight-nav",
  "type-tracking-display", "type-tracking-label", "type-tracking-body",
  "layout-measure", "layout-measure-narrow", "layout-width-narrow", "layout-width-standard",
  "layout-width-wide", "layout-width-max", "layout-gutter", "layout-section-space",
  "layout-block-space", "layout-grid-gap", "layout-stack-space", "layout-target-min",
  "shape-radius", "shape-border-width", "shape-border-width-accent",
  "effect-shadow-raised", "effect-transition-duration", "effect-transition-easing",
  "focus-ring-width", "focus-ring-offset", "focus-halo-width"
].map(name => `--ef-${name}`);

function block(css, selector) {
  const start = css.indexOf(selector + " {");
  assert.ok(start >= 0, `missing block ${selector}`);
  return css.slice(start, css.indexOf("}", start));
}

function compile(source, output) {
  return spawnSync("dotnet", ["run", "--project", compiler, "--", source, output, "--reference", coreSource], { encoding: "utf8" });
}

test("Echelon Marketing Theme supplies every semantic color role in light and dark", () => {
  const light = block(themeCss, ':root, [data-ef-theme="light"]');
  const dark = block(themeCss, '[data-ef-theme="dark"]');
  for (const role of colorRoles) {
    assert.match(light, new RegExp(`${role}: #[0-9a-f]{6};`), `light theme lacks ${role}`);
    assert.match(dark, new RegExp(`${role}: #[0-9a-f]{6};`), `dark theme lacks ${role}`);
  }
});

test("Echelon Marketing Theme supplies every typography, layout, shape, and effect role", () => {
  const neutral = block(themeCss, "  :root");
  for (const token of roleTokens) {
    assert.match(neutral, new RegExp(`${token}: [^;]+;`), `theme lacks ${token}`);
  }
});

test("generic role defaults cover every role so the marketing layer works without a theme", () => {
  for (const token of [...roleTokens, "--ef-color-surface-elevated", "--ef-color-text-muted", "--ef-color-accent-hover",
    "--ef-color-status-success", "--ef-color-status-warning", "--ef-color-status-danger", "--ef-color-status-info"]) {
    assert.match(roles, new RegExp(`${token}:`), `roles.css has no default for ${token}`);
  }
  assert.doesNotMatch(roles, /#[0-9a-fA-F]{3,8}\b/, "role defaults must derive from tokens, not literals");
});

test("theme source owns choices, not raw values: every value is an alias", () => {
  const walk = node => typeof node !== "object" || node === null ? [] :
    ("$value" in node ? [node.$value] : Object.entries(node).filter(([k]) => !k.startsWith("$")).flatMap(([, v]) => walk(v)));
  const values = walk(JSON.parse(fs.readFileSync(themeSource, "utf8")));
  assert.ok(values.length > 90);
  for (const value of values) {
    assert.equal(typeof value, "string");
    assert.match(value, /^\{primitive\.[a-z0-9.-]+\}$/, `theme value ${JSON.stringify(value)} is not a primitive alias`);
  }
});

test("fluid type keeps a rem term so text scales with zoom and user font size", () => {
  for (const [, value] of themeCss.matchAll(/--ef-type-size-[a-z0-9-]+: (clamp\([^;]+\));/g)) {
    const preferred = value.split(",")[1];
    assert.match(preferred, /rem/, `${value} scales with viewport only`);
  }
});

test("theme compilation is deterministic", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ef-theme-"));
  const a = compile(themeSource, path.join(dir, "a.css"));
  const b = compile(themeSource, path.join(dir, "b.css"));
  assert.equal(a.status, 0, a.stderr);
  assert.equal(b.status, 0, b.stderr);
  assert.equal(fs.readFileSync(path.join(dir, "a.css"), "utf8"), fs.readFileSync(path.join(dir, "b.css"), "utf8"));
  assert.equal(fs.readFileSync(path.join(dir, "a.css"), "utf8"), themeCss);
});

test("a theme status color below 4.5:1 is rejected at compile time", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ef-theme-"));
  const data = JSON.parse(fs.readFileSync(themeSource, "utf8"));
  data.semantic.light.color.status.success.$value = "{primitive.color.stone}";
  const source = path.join(dir, "unsafe.json");
  fs.writeFileSync(source, JSON.stringify(data));
  const result = compile(source, path.join(dir, "unsafe.css"));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /light success status contrast/i);
});

test("a theme cannot alias a token that does not exist", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ef-theme-"));
  const data = JSON.parse(fs.readFileSync(themeSource, "utf8"));
  data.type.size.h1.$value = "{primitive.font-size-fluid.display-9}";
  const source = path.join(dir, "missing.json");
  fs.writeFileSync(source, JSON.stringify(data));
  const result = compile(source, path.join(dir, "missing.css"));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unknown token reference/i);
});

test("no unresolved custom-property references in the distributed marketing CSS", () => {
  for (const file of ["forma-marketing.css", "forma-echelon-marketing.css"]) {
    const css = fs.readFileSync(path.join("dist/marketing", file), "utf8");
    const defined = new Set([...css.matchAll(/(--ef-[a-z0-9-]+)\s*:/g)].map(m => m[1]));
    const unresolved = [...css.matchAll(/var\(\s*(--ef-[a-z0-9-]+)\s*(,)?/g)]
      .filter(([, name, fallback]) => !defined.has(name) && !fallback)
      .map(([, name]) => name);
    assert.deepEqual([...new Set(unresolved)], [], `${file} references undefined tokens`);
  }
});
