// Loads the Forma component catalog: category taxonomy, per-component
// documentation modules, canonical pattern markup, and the CSS-derived hook
// surface. Everything downstream (site pages, navigation, manifest, coverage
// tests) is a projection of the value returned here.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildHookIndex } from "./css-hooks.mjs";

export const catalogPaths = root => ({
  categories: path.join(root, "catalog", "categories.json"),
  components: path.join(root, "catalog", "components"),
  compositions: path.join(root, "catalog", "compositions"),
  patterns: path.join(root, "patterns"),
  css: path.join(root, "dist", "all.css")
});

const moduleSlugs = dir =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir).filter(file => file.endsWith(".mjs")).map(file => path.basename(file, ".mjs")).sort()
    : [];

const importDefault = async file => (await import(pathToFileURL(file).href)).default;

const loadModules = async dir =>
  Promise.all(moduleSlugs(dir).map(async slug => ({ slug, ...(await importDefault(path.join(dir, `${slug}.mjs`))) })));

const readPattern = (dir, slug) => {
  const file = path.join(dir, `${slug}.html`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").trim() : null;
};

export const tagName = slug => `ef-${slug}`;

// The owned CSS roots default to `ef-<slug>` when that block class exists.
const resolveOwns = (doc, hookIndex) =>
  doc.owns ?? (hookIndex.byRoot.has(tagName(doc.slug)) ? [tagName(doc.slug)] : []);

const byName = (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });

export const loadCatalog = async (root = process.cwd()) => {
  const paths = catalogPaths(root);
  const taxonomy = JSON.parse(fs.readFileSync(paths.categories, "utf8"));
  const hookIndex = buildHookIndex(fs.readFileSync(paths.css, "utf8"));
  const docs = await loadModules(paths.components);
  const components = docs.map(doc => Object.freeze({
    ...doc,
    tag: tagName(doc.slug),
    pattern: readPattern(paths.patterns, doc.slug),
    owns: resolveOwns(doc, hookIndex),
    examples: doc.examples ?? []
  }));
  const categories = taxonomy.categories.map(category => Object.freeze({
    ...category,
    components: components.filter(component => component.category === category.id).sort(byName)
  }));
  const compositions = await loadModules(paths.compositions);
  return Object.freeze({
    categories,
    components: [...components].sort(byName),
    compositions,
    unownedRoots: taxonomy.unownedRoots ?? {},
    hookIndex,
    patternSlugs: fs.readdirSync(paths.patterns).filter(file => file.endsWith(".html")).map(file => path.basename(file, ".html")).sort()
  });
};

// Navigation order inside a category: previous/next siblings.
export const siblings = (catalog, slug) => {
  const component = catalog.components.find(item => item.slug === slug);
  const family = catalog.categories.find(category => category.id === component.category).components;
  const index = family.findIndex(item => item.slug === slug);
  return { previous: family[index - 1] ?? null, next: family[index + 1] ?? null };
};

// Hooks this page documents: every hook of every owned root.
export const ownedHooks = (catalog, component) =>
  component.owns
    .map(root => catalog.hookIndex.byRoot.get(root))
    .filter(Boolean);

// Tags and classes referenced by markup.
export const markupTags = html => [...new Set([...html.matchAll(/<(ef-[a-z0-9-]+)\b/g)].map(match => match[1]))];
export const markupClasses = html =>
  [...new Set([...html.matchAll(/\bclass="([^"]*)"/g)].flatMap(match => match[1].split(/\s+/)).filter(name => name.startsWith("ef-")))];
export const markupAttributes = html =>
  [...new Set([...html.matchAll(/<[a-z][a-z0-9-]*\b([^>]*)>/g)]
    .flatMap(match => [...match[1].replace(/"[^"]*"|'[^']*'/g, "").matchAll(/([a-z][a-z0-9:-]*)/g)].map(attribute => attribute[1])))];
