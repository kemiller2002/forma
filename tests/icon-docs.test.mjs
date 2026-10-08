// Per-icon documentation pages (WI-0023): guidance covers the registry
// exactly, and every generated page shows the real compiled geometry, every
// documented size, colour context and configuration, with correct
// accessibility wiring and no script.
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { iconDocs } from "../catalog/icons.mjs";
import {
  ICON_SIZES,
  iconConfigurations,
  iconRawFiles,
  loadIconCatalog,
  renderIconGallery,
  renderIconPage,
  validateIconDocs
} from "../tools/catalog/render-icons.mjs";

const registry = JSON.parse(fs.readFileSync(new URL("../icons/registry.json", import.meta.url), "utf8"));
const catalog = loadIconCatalog();
const pages = new Map(catalog.icons.map(icon => [icon.name, renderIconPage(catalog, icon)]));
const SECTIONS = ["meaning", "sizes", "colour", "configurations", "source", "accessibility", "related"];

test("guidance covers every registry icon exactly once", () => {
  assert.deepEqual(validateIconDocs(registry.icons, iconDocs), []);
  assert.deepEqual(Object.keys(iconDocs).sort(), registry.icons.map(icon => icon.name).sort());
  assert.equal(catalog.icons.length, registry.icons.length);
});

test("incomplete or inconsistent guidance is rejected and stops the site build", () => {
  const { warning, ...missing } = iconDocs;
  assert.match(validateIconDocs(registry.icons, missing).join("\n"), /warning: registry icon has no documentation entry/);
  assert.match(validateIconDocs(registry.icons, { ...iconDocs, ghost: iconDocs.add }).join("\n"), /ghost: documentation entry has no registry icon/);
  const broken = { ...iconDocs, add: { ...iconDocs.add, meaning: " ", useFor: [], avoid: [""], actionLabel: "", related: ["add", "nope"] } };
  const problems = validateIconDocs(registry.icons, broken).join("\n");
  for (const expected of ["add: meaning is empty", "add: actionLabel is empty", "add: useFor needs", "add: avoid needs", 'related icon "add"', 'related icon "nope"']) {
    assert.ok(problems.includes(expected), `missing problem: ${expected}`);
  }
  assert.throws(() => loadIconCatalog({ docs: missing }), /Icon documentation is incomplete/);
});

test("each page shows the real compiled geometry, version and digest", () => {
  const compiled = JSON.parse(fs.readFileSync(new URL("../dist/icons/registry.json", import.meta.url), "utf8"));
  for (const icon of catalog.icons) {
    const html = pages.get(icon.name);
    const svg = fs.readFileSync(new URL(`../dist/icons/${icon.name}.svg`, import.meta.url), "utf8");
    assert.equal(icon.svgSource, svg, `${icon.name}: page geometry differs from the packaged SVG`);
    assert.ok(html.includes(icon.htmlSource.trim()), `${icon.name}: compiled decorative snippet missing`);
    assert.ok(html.includes(compiled.icons.find(entry => entry.name === icon.name).svgSha256), `${icon.name}: digest missing`);
    assert.ok(html.includes(`<code>${catalog.formaVersion}</code>`), `${icon.name}: Forma version missing`);
    assert.ok(html.includes(`<h1>${icon.label}</h1>`), `${icon.name}: label heading missing`);
  }
});

test("each page documents meaning, sizes, colour contexts and every configuration", () => {
  for (const icon of catalog.icons) {
    const html = pages.get(icon.name);
    for (const id of SECTIONS) assert.ok(html.includes(`id="section-${id}-title"`), `${icon.name}: section ${id} missing`);
    for (const size of ICON_SIZES) assert.ok(html.includes(`--ef-icon-size:${size}px`), `${icon.name}: ${size}px preview missing`);
    for (const context of ["primary", "secondary", "accent", "secondary-surface", "inverse"]) {
      assert.ok(html.includes(`data-colour-context="${context}"`), `${icon.name}: ${context} colour context missing`);
    }
    for (const config of iconConfigurations(icon)) {
      assert.ok(html.includes(`data-example="${config.id}"`), `${icon.name}: configuration ${config.id} missing`);
      assert.ok(html.includes(`href="${config.id}.txt"`), `${icon.name}: raw source link for ${config.id} missing`);
    }
    for (const item of [...icon.docs.useFor, ...icon.docs.avoid]) {
      assert.ok(html.includes(item.replaceAll("&", "&amp;").replaceAll("\"", "&quot;")), `${icon.name}: guidance "${item}" missing`);
    }
  }
});

test("configurations are wired for assistive technology", () => {
  for (const icon of catalog.icons) {
    const byId = Object.fromEntries(iconConfigurations(icon).map(config => [config.id, config.live]));
    assert.match(byId["icon-only"], new RegExp(`^<button type="button" aria-label="${icon.docs.actionLabel}"`));
    assert.match(byId["with-text"], new RegExp(`</ef-icon> ${icon.docs.actionLabel}</button>$`));
    assert.match(byId["meaningful-image"], new RegExp(`alt="${icon.label}"`));
    assert.match(byId["decorative-image"], /alt=""/);
    // Every inline SVG on the page is decorative and unfocusable.
    for (const svg of pages.get(icon.name).match(/<svg\b[^>]*>/g)) {
      assert.match(svg, /aria-hidden="true"/, `${icon.name}: an inline SVG is exposed to assistive technology`);
      assert.match(svg, /focusable="false"/, `${icon.name}: an inline SVG is focusable`);
    }
  }
});

test("pages are static and link into one navigable set", () => {
  const gallery = renderIconGallery("../", catalog);
  for (const icon of catalog.icons) {
    const html = pages.get(icon.name);
    assert.equal(/<script\b|\son[a-z]+=/i.test(html), false, `${icon.name}: page contains script`);
    assert.ok(gallery.includes(`href="../icons/${icon.name}/"`), `${icon.name}: gallery does not link to the page`);
    for (const neighbour of [icon.previous, icon.next].filter(Boolean)) {
      assert.ok(html.includes(`href="../../icons/${neighbour}/"`), `${icon.name}: pager link to ${neighbour} missing`);
    }
    for (const other of icon.docs.related) assert.ok(html.includes(`href="../../icons/${other}/"`), `${icon.name}: related link to ${other} missing`);
    assert.deepEqual(iconRawFiles(icon).map(file => file.file), ["decorative.txt", ...iconConfigurations(icon).map(config => `${config.id}.txt`)]);
  }
  assert.equal(catalog.icons[0].previous, undefined);
  assert.equal(catalog.icons.at(-1).next, undefined);
});
