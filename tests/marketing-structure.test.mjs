import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const example = "examples/echelon-marketing-site";
const pages = ["index.html", "product.html", "docs.html"];
const bundleCss = fs.readFileSync(path.join(example, "assets/forma/forma-echelon-marketing.css"), "utf8");
const siteCss = fs.readFileSync(path.join(example, "site.css"), "utf8");
const html = file => fs.readFileSync(path.join(example, file), "utf8");
const marketingPatterns = [
  "marketing-shell", "site-header", "hero", "section-heading", "card-grid", "facts", "entry-index",
  "steps", "badge", "cta", "code-sample", "prose", "callout", "site-footer", "documentation-layout"
];
const pattern = slug => fs.readFileSync(path.join("patterns", `${slug}.html`), "utf8");

const classesIn = source => new Set([...source.matchAll(/class="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)).filter(Boolean));
const definedIn = css => new Set([...css.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g)].map(m => m[1]));

test("reference pages render only from installed Forma assets plus a small local stylesheet", () => {
  for (const file of pages) {
    const source = html(file);
    const stylesheets = [...source.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(stylesheets, ["assets/forma/forma-echelon-marketing.css", "site.css"], `${file} loads unexpected CSS`);
    assert.doesNotMatch(source, /<style\b|\sstyle="/i, `${file} carries inline presentation`);
    assert.doesNotMatch(source, /<script\b/i, `${file} adds runtime behavior`);
  }
  const localRules = siteCss.replace(/\/\*[\s\S]*?\*\//g, "").match(/\{/g)?.length ?? 0;
  assert.ok(localRules <= 4, `site.css should stay small; it has ${localRules} rules`);
});

test("every class the reference site uses comes from Forma or is declared local", () => {
  const forma = definedIn(bundleCss);
  const local = definedIn(siteCss);
  for (const file of pages) {
    for (const name of classesIn(html(file))) {
      assert.ok(forma.has(name) || local.has(name), `${file} uses .${name}, which neither Forma nor site.css defines`);
      assert.ok(!(forma.has(name) && local.has(name)), `site.css redefines Forma's .${name}`);
    }
  }
});

test("reference site-local CSS satisfies the Forma local-CSS policy", () => {
  const result = spawnSync("dotnet", ["run", "--project", "tools/SiteCssPolicy/SiteCssPolicy.fsproj", "--",
    "--forma", path.join(example, "assets/forma/forma-echelon-marketing.css"), path.join(example, "site.css")], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("every reference page has the MarketingShell landmarks in semantic order", () => {
  for (const file of pages) {
    const source = html(file);
    assert.match(source, /<html lang="en"/);
    const body = source.slice(source.indexOf("<body"));
    const firstElement = body.slice(body.indexOf(">") + 1).trim();
    assert.match(firstElement, /^<a class="ef-skip-link" href="#main-content">/, `${file} skip link must be the first focusable element`);
    assert.match(source, /<main class="ef-site__main" id="main-content" tabindex="-1">/);
    const order = ["ef-skip-link", "<header class=\"ef-site-header\"", "<nav class=\"ef-site-nav\" aria-label=\"Primary\"", "<main", "<footer class=\"ef-site-footer\""]
      .map(marker => source.indexOf(marker));
    assert.ok(order.every(i => i >= 0), `${file} is missing a shell region`);
    assert.deepEqual([...order].sort((a, b) => a - b), order, `${file} shell regions are out of order`);
    const primaryNav = source.slice(source.indexOf('aria-label="Primary"'), source.indexOf("</nav>"));
    assert.equal((primaryNav.match(/aria-current="page"/g) ?? []).length, 1, `${file} must mark exactly one current page`);
  }
});

test("reference pages keep one h1 and do not skip heading levels", () => {
  for (const file of pages) {
    const levels = [...html(file).matchAll(/<h([1-6])\b/g)].map(m => Number(m[1]));
    assert.equal(levels.filter(l => l === 1).length, 1, `${file} must have exactly one h1`);
    levels.reduce((previous, level) => {
      assert.ok(level <= previous + 1, `${file} skips from h${previous} to h${level}`);
      return level;
    }, 1);
  }
});

test("each hero, section, and call to action offers at most one primary action (VE one primary path)", () => {
  for (const file of pages) {
    const regions = html(file).split(/<(?:section|header class="ef-site-header")\b/).slice(1);
    for (const region of regions) {
      const body = region.slice(0, region.search(/<\/section>|<\/header>/));
      const primaries = (body.match(/data-ef-variant="primary"/g) ?? []).length;
      assert.ok(primaries <= 1, `${file} has a region with ${primaries} primary actions`);
    }
  }
});

test("scrollable technical regions are keyboard reachable and named", () => {
  for (const source of [...pages.map(html), pattern("code-sample")]) {
    for (const [pre] of source.matchAll(/<pre class="ef-code"[^>]*>/g)) {
      assert.match(pre, /tabindex="0"/);
      assert.match(pre, /aria-label(ledby)?="/);
    }
  }
});

test("marketing patterns are documented, self-describing, and use only public Forma classes", () => {
  const forma = definedIn(fs.readFileSync("dist/marketing/forma-marketing.css", "utf8"));
  for (const slug of marketingPatterns) {
    const source = pattern(slug);
    assert.ok(fs.existsSync(`catalog/components/${slug}.mjs`), `${slug} has no catalog entry`);
    assert.match(source, /class="ef-site"/, `${slug} must be shown inside the MarketingShell context`);
    for (const name of classesIn(source)) assert.ok(forma.has(name), `${slug} uses undefined class .${name}`);
    assert.doesNotMatch(source, /echelon/i, `${slug} embeds a brand name in a generic pattern`);
  }
});

test("navigation patterns name their landmarks and keep list semantics", () => {
  for (const slug of ["site-header", "marketing-shell"]) {
    const source = pattern(slug);
    assert.match(source, /<nav class="ef-site-nav" aria-label="Primary">\s*<ul class="ef-site-nav__list">/);
    assert.match(source, /aria-current="page"/);
  }
  assert.match(pattern("documentation-layout"), /<nav class="ef-doc__nav" aria-label="Documentation">/);
  assert.match(pattern("steps"), /<ol class="ef-steps" role="list"/, "list-style:none lists keep list semantics in WebKit");
  assert.match(pattern("facts"), /<dl class="ef-facts">[\s\S]*<dt>[\s\S]*<dd>/);
  assert.match(pattern("card-grid"), /<ul class="ef-card-grid"[^>]*aria-label=/);
});

test("the example lock pins the current Forma version", () => {
  const lock = fs.readFileSync(path.join(example, "forma.lock"), "utf8");
  const version = JSON.parse(fs.readFileSync("package.json", "utf8")).version;
  assert.match(lock, new RegExp(`^forma ${version.replace(/\./g, "\\.")}$`, "m"));
});
