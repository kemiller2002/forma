import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import test from "node:test";

// The package version is the single source of truth; every release must be
// documented for consumers under the same version before it can ship.
const releaseHeadings = file =>
  [...fs.readFileSync(file, "utf8").matchAll(/^## (\d+\.\d+\.\d+)\b(.*)$/gm)]
    .map(([, version, suffix]) => ({ version, suffix: suffix.trim() }));

const semver = version => version.split(".").map(Number);
const compareSemver = (left, right) =>
  semver(left).reduce((order, part, index) => order || part - semver(right)[index], 0);

test("Forma is a versioned public-consumer package", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.equal(pkg.name, "@echelon-foundry/design-system");
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/, "package version must be a plain semantic version");
  assert.equal(pkg.private, false);
  assert.equal(pkg.publishConfig?.access, "public");
  assert.equal(pkg.exports?.["./skins.css"], "./dist/skins.css");
  assert.equal(pkg.exports?.["./brands/*"], "./dist/brands/*");
  assert.equal(pkg.exports?.["./brand-manifest.schema.json"], "./schemas/brand-manifest.schema.json");
  assert.ok(pkg.sideEffects?.includes("./dist/brands/*.css"));

  for (const path of [
    "dist/all.css",
    "dist/tokens.css",
    "dist/foundations.css",
    "dist/components.css",
    "dist/assessment.css",
    "dist/skins.css",
    "dist/brands/echelon.css",
    "dist/brands/example-harbor.css",
    "dist/brands/index.json",
    "schemas/brand-manifest.schema.json",
    "docs/BRANDING.md",
    "patterns/search.html",
    "patterns/checkbox.html",
    "patterns/select.html",
    "patterns/dialog.html",
    "patterns/flyout.html",
    "patterns/menu.html",
    "patterns/toast.html",
    "patterns/data-grid.html",
    "patterns/work-queue.html",
    "tokens/echelon.tokens.json",
    "figma/component-contracts.json",
    "dist/icons/add.svg",
    "dist/icons/workflow.svg",
    "dist/icons/html/agent.html",
    "dist/icons/registry.json",
    "schemas/icon-registry.schema.json",
    "docs/ICONS.md"
  ]) {
    assert.ok(fs.existsSync(path), `missing consumer artifact ${path}`);
  }
});

test("npm package contract contains the expected consumer surface", () => {
  const output = execFileSync(
    "npm",
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    { encoding: "utf8" }
  );
  const packed = JSON.parse(output)[0];
  const files = new Set(packed.files.map(file => file.path));

  for (const path of [
    "dist/all.css",
    "dist/tokens.css",
    "dist/foundations.css",
    "dist/components.css",
    "dist/assessment.css",
    "dist/skins.css",
    "dist/brands/echelon.css",
    "dist/brands/example-harbor.css",
    "dist/brands/index.json",
    "schemas/brand-manifest.schema.json",
    "docs/BRANDING.md",
    "patterns/search.html",
    "patterns/checkbox.html",
    "patterns/select.html",
    "patterns/dialog.html",
    "patterns/flyout.html",
    "patterns/menu.html",
    "patterns/toast.html",
    "patterns/data-grid.html",
    "patterns/work-queue.html",
    "tokens/echelon.tokens.json",
    "figma/component-contracts.json",
    "dist/icons/add.svg",
    "dist/icons/workflow.svg",
    "dist/icons/html/agent.html",
    "dist/icons/registry.json",
    "schemas/icon-registry.schema.json",
    "docs/ICONS.md"
  ]) {
    assert.ok(files.has(path), `release package omits ${path}`);
  }
});

test("package version is the newest documented release and its notes are final", () => {
  const { version } = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const changelog = releaseHeadings("CHANGELOG.md");
  assert.ok(changelog.length > 0, "CHANGELOG.md has no release headings");
  assert.equal(changelog[0].version, version, "the newest CHANGELOG.md entry must describe the packaged version");
  // Merging to main releases package.json's version (release-forma.yml), so
  // its notes must not still describe the version as unreleased.
  assert.doesNotMatch(changelog[0].suffix, /pending|unreleased|draft/i, `CHANGELOG.md ${version} is still marked "${changelog[0].suffix}"`);
  for (const { version: older } of changelog.slice(1)) {
    assert.ok(compareSemver(version, older) > 0, `package version ${version} must be newer than released ${older}`);
  }
  assert.ok(
    releaseHeadings("docs/CONSUMING-FORMA.md").some(entry => entry.version === version),
    `docs/CONSUMING-FORMA.md has no consumer note for ${version}`
  );
});

test("icon consumer surface is exported and matches the compiled registry", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.equal(pkg.exports?.["./icons/*"], "./dist/icons/*");
  assert.equal(pkg.exports?.["./icons/registry.schema.json"], "./schemas/icon-registry.schema.json");
  const registry = JSON.parse(fs.readFileSync("dist/icons/registry.json", "utf8"));
  const icons = registry.icons ?? [];
  assert.ok(icons.length > 0, "compiled icon registry is empty");
  for (const { name, svg, html } of icons) {
    assert.equal(svg, `icons/${name}.svg`);
    assert.equal(html, `icons/html/${name}.html`);
    assert.ok(fs.existsSync(`dist/${svg}`), `registry icon ${name} has no compiled SVG`);
    assert.ok(fs.existsSync(`dist/${html}`), `registry icon ${name} has no compiled decorative HTML`);
  }
});


test("release workflow watches versioned icon and site assets without weakening immutable tags", () => {
  const workflow = fs.readFileSync(".github/workflows/release-forma.yml", "utf8");
  const onPush = workflow.split("on:\\n")[1]?.split("  workflow_dispatch:")[0] ?? "";
  assert.match(onPush, /branches:\\s*\\[main\\]/, "release must run from main");
  const watched = [...onPush.matchAll(/^\\s+- "([^"]+)"$/gm)].map((match) => match[1]);
  for (const path of [
    "package.json", "package-lock.json",
    "icons/**", "catalog/icons.mjs", "catalog/icons/**",
    "tools/icons/**", "tools/catalog/render-icons.mjs", "tools/build-site.mjs",
    "examples/echelon-marketing-site/forma.lock",
    "docs/ICONS.md", "tests/icon-docs.test.mjs",
    ".github/workflows/release-forma.yml"
  ]) {
    assert.ok(watched.includes(path), `release trigger dropped ${path}`);
  }
  assert.match(workflow, /git show-ref --verify --quiet "refs\\/tags\\/\\$release_tag"/, "a stable tag must be checked before publishing");
  assert.match(workflow, /if \\[\\[ "\\$tag_commit" != "\\$GITHUB_SHA" \\]\\]/, "releasing different contents at one version must fail");
  assert.doesNotMatch(workflow, /gh release upload "\\$RELEASE_TAG"[^\\n]*--clobber/, "a published stable release must never be overwritten");
});
