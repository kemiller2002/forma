import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const project = "tools/BrandCompiler/BrandCompiler.fsproj";

function runCompiler(source, output) {
  return spawnSync("dotnet", ["run", "--project", project, "--", source, output], { encoding: "utf8" });
}

function copyRepositoryBrands(dir) {
  for (const file of ["example-harbor.brand.json", "example-orchard.brand.json"]) {
    fs.copyFileSync(path.join("brands", file), path.join(dir, file));
  }
}

test("repository brand manifests compile deterministically and remain scoped", () => {
  const source = fs.mkdtempSync(path.join(os.tmpdir(), "forma-brands-src-"));
  const first = fs.mkdtempSync(path.join(os.tmpdir(), "forma-brands-out-"));
  const second = fs.mkdtempSync(path.join(os.tmpdir(), "forma-brands-out-"));
  copyRepositoryBrands(source);

  const a = runCompiler(source, first);
  assert.equal(a.status, 0, a.stderr);
  const b = runCompiler(source, second);
  assert.equal(b.status, 0, b.stderr);

  for (const file of ["example-harbor.css", "example-orchard.css", "index.json"]) {
    assert.equal(
      fs.readFileSync(path.join(first, file), "utf8"),
      fs.readFileSync(path.join(second, file), "utf8"),
      file + " is not deterministic"
    );
  }

  const css = fs.readFileSync(path.join(first, "example-harbor.css"), "utf8");
  assert.match(css, /\[data-forma-brand="example-harbor"\]/);
  assert.match(css, /\[data-forma-theme="dark"\] \[data-forma-brand="example-harbor"\]/);
  assert.match(css, /--forma-color-accent-primary: #7a4a00/);
  assert.match(css, /--forma-color-status-danger: #a8342a/);
  assert.match(css, /--forma-primitive-radius-medium: 12px/);

  const index = JSON.parse(fs.readFileSync(path.join(first, "index.json"), "utf8"));
  assert.deepEqual(index.brands.map(item => item.id), ["example-harbor", "example-orchard"]);
});

test("unsafe brand contrast is rejected", () => {
  const source = fs.mkdtempSync(path.join(os.tmpdir(), "forma-brands-src-"));
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "forma-brands-out-"));
  const data = JSON.parse(fs.readFileSync("brands/example-harbor.brand.json", "utf8"));
  data.themes.light.color.accent.primary = "#ffffff";
  fs.writeFileSync(path.join(source, "unsafe.brand.json"), JSON.stringify(data, null, 2));

  const result = runCompiler(source, output);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /light primary accent contrast/i);
});

test("unsafe font-family injection is rejected", () => {
  const source = fs.mkdtempSync(path.join(os.tmpdir(), "forma-brands-src-"));
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "forma-brands-out-"));
  const data = JSON.parse(fs.readFileSync("brands/example-harbor.brand.json", "utf8"));
  data.presentation.fontFamily.sans = ["Arial; color: red"];
  fs.writeFileSync(path.join(source, "unsafe-font.brand.json"), JSON.stringify(data, null, 2));

  const result = runCompiler(source, output);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unsafe font-family/i);
});

test("extended brand roles are emitted and contrast-gated", () => {
  const source = fs.mkdtempSync(path.join(os.tmpdir(), "forma-brands-src-"));
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "forma-brands-out-"));
  const data = JSON.parse(fs.readFileSync("brands/example-orchard.brand.json", "utf8"));
  data.id = "product-identity";
  Object.assign(data.themes.light.color.accent, { primary: "#2f6a2c", hover: "#2c2733" });
  data.themes.light.color.status = { success: "#2b6a33", warning: "#835000", danger: "#a3312c", info: "#2d5c94" };
  fs.writeFileSync(path.join(source, "product-identity.brand.json"), JSON.stringify(data, null, 2));

  const ok = runCompiler(source, output);
  assert.equal(ok.status, 0, ok.stderr);
  const css = fs.readFileSync(path.join(output, "product-identity.css"), "utf8");
  assert.match(css, /--forma-color-accent-hover: #2c2733/);
  assert.match(css, /--forma-color-status-danger: #a3312c/);

  data.themes.light.color.status.warning = "#e7b766";
  fs.writeFileSync(path.join(source, "product-identity.brand.json"), JSON.stringify(data, null, 2));
  const unsafe = runCompiler(source, output);
  assert.notEqual(unsafe.status, 0);
  assert.match(unsafe.stderr, /light warning status contrast/i);
});

// forma#201: raised, sunken and chrome surface roles, chrome text and
// elevation, compiled per brand in light and dark, with explicit contrast
// pairs. Roles are optional in a 1.0 manifest and derived when absent.
const channel = (value) => { const c = value / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const luminance = (hex) => [1, 3, 5].map((i) => channel(Number.parseInt(hex.slice(i, i + 2), 16)))
  .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const blocks = (css) => [...css.matchAll(/\{([^{}]*)\}/g)].map(([, body]) =>
  Object.fromEntries([...body.matchAll(/(--forma-[a-z0-9-]+): ([^;]+);/g)].map(([, name, value]) => [name, value.trim()])));

function compileOne(data, name = "brand") {
  const source = fs.mkdtempSync(path.join(os.tmpdir(), "forma-brands-src-"));
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "forma-brands-out-"));
  fs.writeFileSync(path.join(source, `${name}.brand.json`), JSON.stringify(data, null, 2));
  const result = runCompiler(source, output);
  const file = path.join(output, `${data.id}.css`);
  return { result, css: fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "" };
}

test("a manifest without surface roles still compiles and gets derived roles that pass their pairs", () => {
  const data = JSON.parse(fs.readFileSync("brands/example-harbor.brand.json", "utf8"));
  for (const theme of ["light", "dark"]) {
    assert.equal(data.themes[theme].color.surface.raised, undefined, "fixture must omit the roles");
  }
  const { result, css } = compileOne(data);
  assert.equal(result.status, 0, result.stderr);
  const colorBlocks = blocks(css).filter((block) => block["--forma-color-surface-primary"]);
  assert.equal(colorBlocks.length, 4, "base, light, dark and prefers-dark blocks");
  for (const block of colorBlocks) {
    for (const role of ["--forma-color-surface-raised", "--forma-color-surface-sunken", "--forma-color-surface-chrome", "--forma-color-text-on-chrome", "--forma-elevation-1", "--forma-elevation-2"]) {
      assert.ok(block[role], `missing ${role}`);
    }
    const v = (name) => block[`--forma-color-${name}`];
    for (const text of ["text-primary", "text-heading", "text-secondary"]) assert.ok(ratio(v(text), v("surface-raised")) >= 4.5, `${text} on raised`);
    for (const text of ["text-primary", "text-on-secondary-surface"]) assert.ok(ratio(v(text), v("surface-sunken")) >= 4.5, `${text} on sunken`);
    assert.ok(ratio(v("text-on-chrome"), v("surface-chrome")) >= 4.5, "chrome text");
    assert.equal(v("surface-chrome"), v("surface-inverse"), "chrome defaults to the inverse surface");
  }
  const [light, , dark] = colorBlocks;
  assert.ok(luminance(light["--forma-color-surface-raised"]) >= luminance(light["--forma-color-surface-primary"]), "light raised is lighter than the canvas");
  assert.ok(luminance(dark["--forma-color-surface-raised"]) >= luminance(dark["--forma-color-surface-primary"]), "dark raised is lighter than the canvas");
  assert.match(dark["--forma-elevation-1"], /rgb\(0 0 0 \//, "dark themes default to dark shadows");
});

test("declared surface roles and elevation are emitted as written", () => {
  const css = fs.readFileSync("dist/brands/example-orchard.css", "utf8");
  assert.match(css, /--forma-color-surface-raised: #ffffff;/);
  assert.match(css, /--forma-color-surface-sunken: #f3eff5;/);
  assert.match(css, /--forma-color-text-on-chrome: #fbf9f6;/);
  assert.match(css, /--forma-elevation-1: 0px 1px 2px 0px rgb\(44 34 56 \/ 0\.1\)/);
  assert.match(css, /--forma-elevation-1: none;/);
});

for (const [label, mutate, message] of [
  ["secondary text on a declared raised surface", (d) => { d.themes.light.color.surface.raised = "#a9b5be"; }, /light raised-surface secondary text contrast/],
  ["secondary-surface text on a declared sunken surface", (d) => { d.themes.dark.color.surface.sunken = "#9aa7b0"; }, /dark sunken-surface (primary text|heading|secondary text) contrast/],
  ["chrome text on a declared chrome surface", (d) => { d.themes.light.color.surface.chrome = "#f0f0f0"; }, /light chrome text contrast/]
]) {
  test(`unsafe ${label} is rejected`, () => {
    const data = JSON.parse(fs.readFileSync("brands/example-harbor.brand.json", "utf8"));
    mutate(data);
    const { result } = compileOne(data);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, message);
  });
}

test("elevation values that are not plain box-shadow layers are rejected", () => {
  for (const value of ["0 1px 2px red", "0px 1px 2px #000; background: url(x)", "var(--x)"]) {
    const data = JSON.parse(fs.readFileSync("brands/example-harbor.brand.json", "utf8"));
    data.themes.light.elevation = { 1: value };
    const { result } = compileOne(data);
    assert.notEqual(result.status, 0, value);
    assert.match(result.stderr, /elevation\.1/);
  }
});

test("the manifest schema declares the optional surface roles and elevation", () => {
  const schema = JSON.parse(fs.readFileSync("schemas/brand-manifest.schema.json", "utf8"));
  const color = schema.$defs.theme.properties.color.properties;
  for (const role of ["raised", "sunken", "chrome"]) assert.ok(color.surface.properties[role]);
  assert.ok(color.text.properties["on-chrome"]);
  assert.ok(!color.surface.required.includes("raised"), "roles stay optional for 1.0 manifests");
  const shadow = new RegExp(schema.$defs.shadow.pattern);
  assert.ok(shadow.test("none") && shadow.test("0px 1px 2px 0px rgb(0 0 0 / 0.4), 0px 8px 24px -8px #101820"));
  assert.ok(!shadow.test("0 1px 2px red") && !shadow.test("0px 1px 2px #000; color: red"));
});
