// Builds the Forma documentation site (site-dist/) from the component catalog.
// Pages, navigation, counts and the machine-readable manifest are all
// projections of loadCatalog(); see docs/CATALOG-AUTHORING.md.
import fs from "node:fs";
import path from "node:path";
import { loadCatalog, ownedHooks } from "./catalog/load.mjs";
import { validateCatalog } from "./catalog/validate.mjs";
import { frameDocument } from "./catalog/render-layout.mjs";
import { renderIconGallery } from "./catalog/render-icons.mjs";
import { componentRawFiles, framePath, isPageLevel, renderComponentPage } from "./catalog/render-component.mjs";
import {
  exampleCount,
  renderAccessibility,
  renderAllComponents,
  renderCategoryPage,
  renderCompositionPage,
  renderCompositionsIndex,
  renderHome,
  renderMobileIndex
} from "./catalog/render-indexes.mjs";
import { renderAgents, renderBranding } from "./catalog/render-static.mjs";
import { wrapTag } from "./catalog/html.mjs";

const root = process.cwd();
const output = path.join(root, "site-dist");

if (!fs.existsSync(path.join(root, "dist", "all.css"))) {
  throw new Error("dist/all.css is missing. Run the Forma library build first.");
}

const catalog = await loadCatalog(root);

// Structural problems (a pattern without an entry, an unowned CSS block)
// stop the build; content completeness is reported by `npm run catalog:check`.
const structural = validateCatalog(catalog).filter(item =>
  /canonical pattern has no catalog entry|collides|duplicate component tag|not documented by any catalog component|owned by several/.test(item.message));
if (structural.length) {
  throw new Error(`Catalog structure is invalid:\n${structural.map(item => `  ${item.slug}: ${item.message}`).join("\n")}`);
}

const contextAt = rootPath => Object.freeze({
  catalog,
  rootPath,
  bySlug: new Map(catalog.components.map(component => [component.slug, component])),
  categoryById: new Map(catalog.categories.map(category => [category.id, category]))
});

const write = (relative, content) => {
  const file = path.join(output, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(path.join(output, "assets"), { recursive: true });
fs.copyFileSync(path.join(root, "dist", "all.css"), path.join(output, "assets", "forma.css"));
fs.copyFileSync(path.join(root, "site", "site.css"), path.join(output, "assets", "site.css"));
fs.cpSync(path.join(root, "dist", "brands"), path.join(output, "assets", "brands"), { recursive: true });
fs.writeFileSync(path.join(output, ".nojekyll"), "");

write("index.html", renderHome(contextAt("./")));
write("icons/index.html", renderIconGallery("../"));
write("components/index.html", renderAllComponents(contextAt("../")));
write("mobile/index.html", renderMobileIndex(contextAt("../")));
write("accessibility/index.html", renderAccessibility(contextAt("../")));
write("compositions/index.html", renderCompositionsIndex(contextAt("../")));
write("branding/index.html", renderBranding());
write("agents/index.html", renderAgents());

catalog.categories.forEach(category =>
  write(`components/${category.id}/index.html`, renderCategoryPage(contextAt("../../"), category)));

catalog.components.forEach(component => {
  const dir = `components/${component.slug}`;
  write(`${dir}/index.html`, renderComponentPage(contextAt("../../"), component));
  write(`${dir}/mobile.html`, frameDocument({ title: `${component.name} at 320px`, rootPath: "../../", source: wrapTag(component.slug, component.pattern) }));
  component.examples.filter(example => example.mobile).forEach(example =>
    write(`${dir}/${framePath(example.id)}`, frameDocument({ title: `${component.name}: ${example.title}`, rootPath: "../../", source: example.html })));
  if (isPageLevel(component)) {
    write(`${dir}/basic.html`, frameDocument({ title: `${component.name} basic example`, rootPath: "../../", source: wrapTag(component.slug, component.pattern) }));
  }
  componentRawFiles(component).forEach(raw => write(`${dir}/${raw.file}`, raw.content));
});

catalog.compositions.forEach(composition => {
  const dir = `compositions/${composition.slug}`;
  write(`${dir}/index.html`, renderCompositionPage(contextAt("../../"), composition));
  write(`${dir}/source.txt`, composition.html.trim() + "\n");
  if (composition.mobile) {
    write(`${dir}/frame.html`, frameDocument({ title: composition.title, rootPath: "../../", source: composition.html }));
  }
});

// Machine-readable projection for agents and tooling. It is generated, never
// edited, so it cannot disagree with the pages.
const manifest = {
  generatedAt: new Date().toISOString(),
  product: "Forma",
  componentCount: catalog.components.length,
  iconGalleryUrl: "icons/",
  categoryCount: catalog.categories.length,
  exampleCount: exampleCount(catalog),
  exampleMinimum: 3,
  categories: catalog.categories.map(category => ({
    id: category.id,
    name: category.name,
    summary: category.summary,
    docsUrl: `components/${category.id}/`,
    components: category.components.map(component => component.slug)
  })),
  components: catalog.components.map(component => ({
    slug: component.slug,
    title: component.name,
    tag: component.tag,
    category: component.category,
    behavior: component.behavior,
    summary: component.summary,
    docsUrl: `components/${component.slug}/`,
    pattern: `patterns/${component.slug}.html`,
    minimalHtml: wrapTag(component.slug, component.pattern ?? ""),
    attributes: (component.api?.attributes ?? []).map(({ name, on, values, default: fallback, description }) => ({ name, on, values, default: fallback, description })),
    cssHooks: ownedHooks(catalog, component).map(hook => ({
      root: hook.root,
      elements: hook.elements,
      modifiers: hook.modifiers,
      attributes: hook.attributes,
      customProperties: hook.customProperties
    })),
    keyboard: component.api?.keyboard ?? [],
    examples: component.examples.map(example => ({ id: example.id, title: example.title, mobile: Boolean(example.mobile), raw: `components/${component.slug}/${example.id}.txt` })),
    related: (component.related ?? []).map(item => item.slug)
  })),
  compositions: catalog.compositions.map(composition => ({ slug: composition.slug, title: composition.title, docsUrl: `compositions/${composition.slug}/` }))
};
write("site-manifest.json", JSON.stringify(manifest, null, 2) + "\n");

console.log(JSON.stringify({ output: "site-dist", components: catalog.components.length, categories: catalog.categories.length, examples: manifest.exampleCount, compositions: catalog.compositions.length }));
