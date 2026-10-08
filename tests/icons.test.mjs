import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {buildIcons, compileIcons, validateRegistry} from "../tools/icons/build.mjs";

const source = JSON.parse(fs.readFileSync(new URL("../icons/registry.json", import.meta.url), "utf8"));
const clone = () => structuredClone(source);
const reject = (mutate, description) => {
  const registry = clone();
  mutate(registry);
  assert.throws(() => validateRegistry(registry), /Icon registry:/, description);
};

test("forty original icons retain the eight required reference identifiers", () => {
  validateRegistry(source);
  assert.equal(source.icons.length, 40);
  for (const name of ["add", "agent", "close", "edit", "search", "success", "warning", "workflow"]) {
    assert.ok(source.icons.some(icon => icon.name === name), `missing foundation icon: ${name}`);
  }
});

test("compilation is byte-for-byte deterministic regardless of registry ordering", () => {
  const a = [...compileIcons(source)];
  const b = [...compileIcons({...source, icons: [...source.icons].reverse()})];
  assert.deepEqual(a, b);
  assert.equal(a.length, source.icons.length * 2 + 1);
  for (const [name, value] of a) {
    assert.ok(name.endsWith(".svg") || name.endsWith(".html") || name === "registry.json");
    assert.ok(!/<script|<foreignObject|\son\w+=|https?:\/\//i.test(value.replaceAll("http://www.w3.org/2000/svg", "")));
  }
});

test("generated decorative markup cannot accidentally become an icon-only control", () => {
  const files = compileIcons(source);
  for (const icon of source.icons) {
    const svg = files.get(icon.name + ".svg");
    const html = files.get("html/" + icon.name + ".html");
    assert.match(svg, /viewBox="0 0 24 24"/);
    assert.match(svg, /stroke="currentColor"/);
    assert.match(html, /<ef-icon class="ef-component-tag">/);
    assert.match(html, /aria-hidden="true" focusable="false"/);
    assert.doesNotMatch(html, /<button|tabindex=|role="button"/i);
  }
});

test("rejects duplicate IDs and malformed IDs, unknown properties, unsafe geometry and unreviewed origin", () => {
  reject(r => r.icons.push(clone().icons[0]), "duplicate ID");
  reject(r => { r.icons[0].name = "../evil"; }, "path traversal ID");
  reject(r => { r.icons[0].onload = "alert(1)"; }, "unexpected icon property");
  reject(r => { r.icons[0].shapes[0].element = "foreignObject"; }, "SVG foreign content");
  reject(r => { r.icons[0].shapes[0].onload = "alert(1)"; }, "unexpected SVG attribute");
  reject(r => { r.icons[0].shapes[0] = {element:"path",d:'M1 1"/><script>alert(1)</script>'}; }, "SVG injection");
  reject(r => { r.icons[0].shapes[0].r = -1; }, "invalid circle radius");
  reject(r => { r.icons[0].origin = "unknown"; }, "unreviewed provenance");
});

test("build writes only the expected deterministic static assets", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "forma-icons-"));
  try {
    fs.mkdirSync(path.join(root, "icons"), {recursive: true});
    fs.writeFileSync(path.join(root, "icons/registry.json"), JSON.stringify(source));
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({version: "9.8.7"}));
    const files = buildIcons({root});
    const first = [...files].map(([name]) => [name, fs.readFileSync(path.join(root, "dist/icons", name), "utf8")]);
    const repeat = buildIcons({root});
    assert.deepEqual([...repeat], [...files]);
    assert.deepEqual(first, [...repeat]);
    assert.deepEqual(fs.readdirSync(path.join(root, "dist/icons")).filter(name => name.endsWith(".js")), []);
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, "dist/icons/registry.json"))).icons.length, 40);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});


test("canonical public pattern is exactly the compiled decorative search icon", () => {
  const html = compileIcons(source).get("html/search.html");
  assert.equal(fs.readFileSync(new URL("../patterns/icon.html", import.meta.url), "utf8"), html);
});

test("source registry is strictly schema-compatible and cannot contain external media or code", () => {
  const schema = JSON.parse(fs.readFileSync(new URL("../schemas/icon-registry.schema.json", import.meta.url), "utf8"));
  assert.equal(schema.properties.grid.const, 24);
  assert.equal(schema.properties.schemaVersion.const, 1);
  assert.equal(schema.$defs.icon.properties.origin.const, "original");
  reject(r => {r.icons[0].shapes[0].href = "https://example.com/a.svg";}, "no external href");
  reject(r => {r.icons[0].shapes.push({element:"image",href:"data:image/png;base64,AA=="});}, "no external image");
  reject(r => {r.icons[0].shapes.push({element:"path",d:"M0 0;alert(1)"});}, "no JS geometry");
});

test("compiled registry pins the producing Forma version and each icon's SVG digest", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "forma-icons-"));
  try {
    fs.mkdirSync(path.join(root, "icons"), {recursive: true});
    fs.writeFileSync(path.join(root, "icons/registry.json"), JSON.stringify(source));
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({version: "9.8.7"}));
    buildIcons({root});
    const compiled = JSON.parse(fs.readFileSync(path.join(root, "dist/icons/registry.json"), "utf8"));
    assert.equal(compiled.formaVersion, "9.8.7");
    for (const icon of compiled.icons) {
      const svg = fs.readFileSync(path.join(root, "dist", icon.svg));
      assert.equal(icon.svgSha256, createHash("sha256").update(svg).digest("hex"), `${icon.name} digest`);
    }
    // A consumer comparing digests detects altered geometry.
    const tampered = Buffer.from(fs.readFileSync(path.join(root, "dist/icons/search.svg"), "utf8").replace("6.2", "6.3"));
    const search = compiled.icons.find(icon => icon.name === "search");
    assert.notEqual(createHash("sha256").update(tampered).digest("hex"), search.svgSha256);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test("compiling without a release version omits the version stamp rather than inventing one", () => {
  const registry = JSON.parse(compileIcons(source).get("registry.json"));
  assert.equal(Object.hasOwn(registry, "formaVersion"), false);
});
