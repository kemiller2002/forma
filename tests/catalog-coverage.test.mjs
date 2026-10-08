// Documentation coverage enforcement for the Forma component catalog.
// Runs against catalog sources and the generated site-dist/ (build first:
// `npm run site:build`). See docs/CATALOG-AUTHORING.md.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { loadCatalog } from "../tools/catalog/load.mjs";
import { validateCatalog } from "../tools/catalog/validate.mjs";
import { SECTIONS } from "../tools/catalog/render-component.mjs";
import { dedicatedTests } from "../tools/catalog/inventory.mjs";

const root = process.cwd();
const output = path.join(root, "site-dist");
const catalog = await loadCatalog(root);

const htmlFiles = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? htmlFiles(full) : entry.name.endsWith(".html") ? [full] : [];
});
const pages = htmlFiles(output);
const read = file => fs.readFileSync(file, "utf8");
const componentPage = slug => read(path.join(output, "components", slug, "index.html"));
const stripSource = html => html.replace(/<pre\b[\s\S]*?<\/pre>/g, "").replace(/<style\b[\s\S]*?<\/style>/g, "");
// Live component markup is wrapped in <!--live--> markers by the renderer.
const stripLive = html => html.replace(/<!--live-->[\s\S]*?<!--\/live-->/g, "");

test("catalog entries satisfy every coverage and integrity rule", () => {
  const problems = validateCatalog(catalog);
  assert.equal(problems.length, 0, `${problems.length} catalog problems; run npm run catalog:check\n${problems.slice(0, 20).map(item => `${item.slug}: ${item.message}`).join("\n")}`);
});

test("every canonical pattern and every public CSS block is in the catalog", () => {
  const slugs = catalog.components.map(item => item.slug).sort();
  assert.deepEqual(slugs, catalog.patternSlugs);
  const owned = new Set(catalog.components.flatMap(item => item.owns));
  const unowned = catalog.hookIndex.roots.filter(root => !owned.has(root) && !(root in catalog.unownedRoots));
  assert.deepEqual(unowned, []);
});

test("every component belongs to exactly one defined category and tags are unique", () => {
  const ids = new Set(catalog.categories.map(item => item.id));
  for (const component of catalog.components) assert.ok(ids.has(component.category), component.slug);
  const tags = catalog.components.map(item => item.tag);
  assert.equal(new Set(tags).size, tags.length);
  const inCategories = catalog.categories.flatMap(category => category.components.map(item => item.slug)).sort();
  assert.deepEqual(inCategories, catalog.components.map(item => item.slug).sort());
});

test("every component page publishes the standard sections in order", () => {
  for (const component of catalog.components) {
    const html = componentPage(component.slug);
    const positions = SECTIONS.map(([id]) => html.indexOf(`<section class="doc-section" id="${id}"`));
    positions.forEach((position, index) => assert.ok(position > -1, `${component.slug} is missing section ${SECTIONS[index][0]}`));
    assert.deepEqual([...positions].sort((a, b) => a - b), positions, `${component.slug} sections are out of order`);
    assert.ok(html.includes(`<h1>${component.name.replaceAll("&", "&amp;")}</h1>`), `${component.slug} h1 does not show its name`);
    assert.ok(html.includes(`&lt;ef-${component.slug}&gt;`), `${component.slug} does not show its tag`);
  }
});

test("every component shows at least three live examples and one mobile example, each with its HTML", () => {
  for (const component of catalog.components) {
    const html = componentPage(component.slug);
    const scenarios = (html.match(/<section class="example-block" id="example-/g) ?? []).length;
    const mobiles = (html.match(/<section class="example-block example-block--mobile"/g) ?? []).length;
    assert.ok(scenarios >= 3, `${component.slug} renders ${scenarios} examples (basic + scenarios)`);
    assert.ok(mobiles >= 1, `${component.slug} renders no mobile example`);
    const blocks = html.split(/<section class="example-block(?: example-block--mobile)?" id="example-/).slice(1);
    for (const block of blocks) {
      assert.match(block, /<pre class="ef-code code-viewer__code"/, `${component.slug} has an example without HTML source`);
      assert.match(block, /class="code-viewer__raw"/, `${component.slug} has an example without a raw source link`);
    }
    for (const example of component.examples.filter(item => item.mobile)) {
      const frame = path.join(output, "components", component.slug, `mobile-${example.id}.html`);
      assert.ok(fs.existsSync(frame), `${component.slug} is missing the mobile frame for ${example.id}`);
      assert.match(read(frame), new RegExp(`<ef-${component.slug}\\b`));
    }
  }
});

test("displayed source is exactly the rendered source for every authored example", () => {
  const unescape = text => text.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", "\"").replaceAll("&amp;", "&");
  for (const component of catalog.components) {
    for (const example of component.examples) {
      const raw = read(path.join(output, "components", component.slug, `${example.id}.txt`));
      assert.ok(raw.trim() === example.html.trim(), `${component.slug}/${example.id} raw source drifted`);
    }
    const html = componentPage(component.slug);
    for (const example of component.examples.filter(item => !item.mobile)) {
      const block = html.split(`id="example-${example.id}"`)[1];
      const shown = unescape(/<pre class="ef-code code-viewer__code"[^>]*><code>([\s\S]*?)<\/code><\/pre>/.exec(block)[1]);
      assert.ok(shown === example.html.trim(), `${component.slug}/${example.id} displayed source differs`);
      assert.ok(block.includes(example.html.trim()), `${component.slug}/${example.id} live render differs from source`);
    }
  }
});

test("generated pages have unique ids", () => {
  for (const file of pages) {
    const ids = [...stripSource(read(file)).matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    assert.equal(duplicates.length, 0, `${path.relative(root, file)} has duplicate ids: ${duplicates.join(", ")}`);
  }
});

test("documentation chrome headings never skip a level", () => {
  const docPages = pages.filter(file => !/mobile(-[a-z0-9-]+)?\.html$|frame\.html$|basic\.html$/.test(file));
  for (const file of docPages) {
    // Examples and specimens are component markup; their headings belong to the example.
    const chrome = stripLive(stripSource(read(file)));
    const levels = [...chrome.matchAll(/<h([1-6])\b/g)].map(match => Number(match[1]));
    assert.equal(levels.filter(level => level === 1).length, 1, `${path.relative(root, file)} must have exactly one h1`);
    levels.reduce((previous, level) => {
      assert.ok(level <= previous + 1, `${path.relative(root, file)} skips from h${previous} to h${level}`);
      return level;
    }, 1);
  }
});

test("all internal links and resources resolve, including fragments", () => {
  const idsOf = new Map();
  const idsIn = file => {
    if (!idsOf.has(file)) idsOf.set(file, new Set([...read(file).matchAll(/\sid="([^"]+)"/g)].map(match => match[1])));
    return idsOf.get(file);
  };
  const docPages = pages.filter(file => !/mobile(-[a-z0-9-]+)?\.html$|frame\.html$|basic\.html$/.test(file));
  const broken = pages.flatMap(file => {
    const source = stripSource(read(file));
    const chromeUrls = new Set([...stripLive(source).matchAll(/\s(?:href|src)="([^"]+)"/g)].map(match => match[1]));
    return [...source.matchAll(/\s(?:href|src)="([^"]+)"/g)]
      .map(match => match[1])
      .filter(url => !/^(?:https?:|mailto:|data:)/.test(url))
      .flatMap(url => {
        const [location, fragment] = url.split("#");
        const target = location.split("?")[0];
        const resolved = target === "" ? file : path.resolve(path.dirname(file), target);
        const candidate = fs.existsSync(resolved) && fs.statSync(resolved).isDirectory() ? path.join(resolved, "index.html") : resolved;
        if (!fs.existsSync(candidate)) return [`${path.relative(output, file)} -> ${url}`];
        // Demo links inside live component markup may point at illustrative
        // in-page anchors; documentation chrome fragments must resolve.
        if (fragment && chromeUrls.has(url) && docPages.includes(file) && candidate.endsWith(".html") && !idsIn(candidate).has(fragment)) return [`${path.relative(output, file)} -> ${url} (missing #${fragment})`];
        return [];
      });
  });
  assert.equal(broken.length, 0, `broken links:\n${broken.slice(0, 40).join("\n")}`);
});

test("links are relative so the site works under any GitHub Pages base path", () => {
  for (const file of pages) {
    const rooted = [...read(file).matchAll(/\s(?:href|src)="(\/[^"]*)"/g)].map(match => match[1]).filter(url => !url.startsWith("//"));
    // Quick-start copy text may mention an absolute stylesheet path inside <pre>; links may not.
    const inChrome = rooted.filter(url => stripSource(read(file)).includes(`"${url}"`));
    assert.equal(inChrome.length, 0, `${path.relative(root, file)} uses root-relative links: ${inChrome.join(", ")}`);
  }
});

test("every ef-* tag rendered anywhere is a catalog component", () => {
  const slugs = new Set(catalog.components.map(item => item.slug));
  for (const file of pages) {
    const tags = [...new Set([...stripSource(read(file)).matchAll(/<ef-([a-z0-9-]+)\b/g)].map(match => match[1]))];
    assert.deepEqual(tags.filter(tag => !slugs.has(tag)), [], path.relative(root, file));
  }
});

test("category pages, the A–Z index and the manifest cover every component", () => {
  const index = read(path.join(output, "components", "index.html"));
  const manifest = JSON.parse(read(path.join(output, "site-manifest.json")));
  assert.equal(manifest.componentCount, catalog.components.length);
  for (const component of catalog.components) {
    assert.match(index, new RegExp(`href="\\.\\./components/${component.slug}/"`), `${component.slug} missing from A–Z index`);
    const categoryPage = read(path.join(output, "components", component.category, "index.html"));
    assert.match(categoryPage, new RegExp(`components/${component.slug}/"`), `${component.slug} missing from its category page`);
    const entry = manifest.components.find(item => item.slug === component.slug);
    assert.equal(entry.tag, `ef-${component.slug}`);
    assert.equal(entry.docsUrl, `components/${component.slug}/`);
    assert.ok(entry.minimalHtml.includes(`<ef-${component.slug} class="ef-component-tag">`));
  }
  for (const category of catalog.categories) {
    assert.ok(fs.existsSync(path.join(output, "components", category.id, "index.html")), `missing category page ${category.id}`);
  }
});

test("compositions render real components and link back to their pages", () => {
  assert.ok(catalog.compositions.length >= 5);
  assert.ok(catalog.compositions.some(item => item.slug === "mobile-settings" && item.mobile));
  for (const composition of catalog.compositions) {
    const html = read(path.join(output, "compositions", composition.slug, "index.html"));
    const tags = [...new Set([...composition.html.matchAll(/<ef-([a-z0-9-]+)\b/g)].map(match => match[1]))];
    for (const tag of tags) assert.match(html, new RegExp(`components/${tag}/"`), `${composition.slug} does not link to ${tag}`);
  }
});

test("the documentation site stays zero-runtime", () => {
  for (const file of pages) {
    const html = read(file);
    assert.doesNotMatch(html, /<script\b/i, path.relative(root, file));
    assert.doesNotMatch(html, /\son[a-z]+=/i, path.relative(root, file));
  }
});

test("inventory attributes dedicated tests by pattern reference, not by same-named compiled icon assets", () => {
  const search = { slug: "search", owns: ["ef-search"] };
  const source = (file, text) => ({ file: `tests/${file}`, text });
  // A compiled icon asset path shares the component's slug but is not its pattern.
  assert.deepEqual(dedicatedTests([source("icons.test.mjs", 'compileIcons(source).get("html/search.html")')], search), []);
  assert.deepEqual(dedicatedTests([source("icons.test.mjs", "dist/icons/html/search.html")], search), []);
  // Real references to the pattern or its owned block still count.
  assert.deepEqual(dedicatedTests([source("a.spec.mjs", "page.goto('/patterns/search.html')")], search), ["a.spec.mjs"]);
  assert.deepEqual(dedicatedTests([source("b.spec.mjs", "page.goto('/components/search.html')")], search), ["b.spec.mjs"]);
  assert.deepEqual(dedicatedTests([source("c.spec.mjs", "page.locator('.ef-search input')")], search), ["c.spec.mjs"]);
  // Generic suites are never listed as dedicated coverage.
  assert.deepEqual(dedicatedTests([source("package-contract.test.mjs", "patterns/search.html")], search), []);
});
