// Static icon documentation generated from the canonical Forma SVG registry:
// the /icons/ gallery and one /icons/<name>/ page per icon. Geometry always
// comes from the compiled registry (tools/icons/build.mjs); reader guidance
// comes from catalog/icons.mjs. Every function here is pure: data in, HTML out.
import fs from "node:fs";
import { compileIcons } from "../icons/build.mjs";
import { iconDocs } from "../../catalog/icons.mjs";
import { applicationIconDocs } from "../../catalog/icons/applications.mjs";
import { breadcrumbs, codeViewer, page, table } from "./render-layout.mjs";
import { escapeHtml, join } from "./html.mjs";

const readJson = relative => JSON.parse(fs.readFileSync(new URL(relative, import.meta.url), "utf8"));

// Sizes documented on every page. 16px is the smallest supported size.
export const ICON_SIZES = Object.freeze([16, 20, 24, 32, 48]);
export const NEW_ICON_RELEASE = "0.6.0";
const introducedIn06 = new Set(Object.keys(applicationIconDocs));

// Color contexts use Forma roles only. The icon follows currentColor, so the
// role on the parent decides the ink; the label text stays a text role so it
// keeps its contrast in every context.
const COLOUR_CONTEXTS = Object.freeze([
  { id: "primary", name: "Primary text", ink: "var(--ef-color-text-primary)", surface: "var(--ef-color-surface-primary)", text: "var(--ef-color-text-primary)", role: "--ef-color-text-primary" },
  { id: "secondary", name: "Secondary text", ink: "var(--ef-color-text-secondary)", surface: "var(--ef-color-surface-primary)", text: "var(--ef-color-text-primary)", role: "--ef-color-text-secondary" },
  { id: "accent", name: "Accent", ink: "var(--ef-color-accent-primary)", surface: "var(--ef-color-surface-primary)", text: "var(--ef-color-text-primary)", role: "--ef-color-accent-primary" },
  { id: "secondary-surface", name: "Secondary surface", ink: "var(--ef-color-text-on-secondary-surface)", surface: "var(--ef-color-surface-secondary)", text: "var(--ef-color-text-on-secondary-surface)", role: "--ef-color-text-on-secondary-surface" },
  { id: "inverse", name: "Inverse surface", ink: "var(--ef-color-text-inverse)", surface: "var(--ef-color-surface-inverse)", text: "var(--ef-color-text-inverse)", role: "--ef-color-text-inverse" }
]);

const titleCase = value => value.replaceAll("-", " ").replace(/^\w/, first => first.toUpperCase());
export const iconHref = (rootPath, name) => `${rootPath}icons/${name}/`;

// Guidance must cover the registry exactly, and cross-references must resolve.
// Returns a list of problems; an empty list means the documentation is complete.
export const validateIconDocs = (registryIcons, docs) => {
  const names = new Set(registryIcons.map(icon => icon.name));
  const text = value => typeof value === "string" && value.trim().length > 0;
  return [
    ...registryIcons.filter(icon => !Object.hasOwn(docs, icon.name)).map(icon => `${icon.name}: registry icon has no documentation entry`),
    ...Object.keys(docs).filter(name => !names.has(name)).map(name => `${name}: documentation entry has no registry icon`),
    ...Object.entries(docs).filter(([name]) => names.has(name)).flatMap(([name, doc]) => [
      ...(text(doc.meaning) ? [] : [`${name}: meaning is empty`]),
      ...(text(doc.actionLabel) ? [] : [`${name}: actionLabel is empty`]),
      ...(Array.isArray(doc.useFor) && doc.useFor.length && doc.useFor.every(text) ? [] : [`${name}: useFor needs at least one entry`]),
      ...(Array.isArray(doc.avoid) && doc.avoid.length && doc.avoid.every(text) ? [] : [`${name}: avoid needs at least one entry`]),
      ...(Array.isArray(doc.related) && doc.related.length ? [] : [`${name}: related needs at least one icon`]),
      ...(doc.related ?? []).filter(other => other === name || !names.has(other)).map(other => `${name}: related icon "${other}" is not another registry icon`)
    ])
  ];
};

// The compiled documentation model: registry order (alphabetical), compiled
// assets and guidance for each icon, plus its neighbors for the pager.
export const loadIconCatalog = ({ registry = readJson("../../icons/registry.json"), docs = iconDocs } = {}) => {
  const problems = validateIconDocs(registry.icons, docs);
  if (problems.length) throw new Error(`Icon documentation is incomplete:\n${problems.join("\n")}`);
  const { version: formaVersion } = readJson("../../package.json");
  const compiled = compileIcons(registry, { formaVersion });
  const metadata = new Map(JSON.parse(compiled.get("registry.json")).icons.map(icon => [icon.name, icon]));
  const icons = [...registry.icons]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(icon => Object.freeze({
      ...icon,
      ...metadata.get(icon.name),
      docs: docs[icon.name],
      introducedIn: introducedIn06.has(icon.name) ? NEW_ICON_RELEASE : "0.5.0",
      svgSource: compiled.get(`${icon.name}.svg`),
      htmlSource: compiled.get(`html/${icon.name}.html`)
    }));
  return Object.freeze({
    formaVersion,
    grid: registry.grid,
    strokeWidth: registry.strokeWidth,
    icons: Object.freeze(icons.map((icon, index) => Object.freeze({ ...icon, previous: icons[index - 1]?.name, next: icons[index + 1]?.name }))),
    byName: new Map(icons.map(icon => [icon.name, icon]))
  });
};

// The decorative snippet with a size override on its presentation span.
const sized = (icon, size) => icon.htmlSource.trim().replace('<span class="ef-icon"', `<span class="ef-icon" style="--ef-icon-size:${size}px"`);

// Shape children of the compiled SVG, for the construction view.
const innerGeometry = icon => icon.svgSource.replace(/^[\s\S]*?<svg\b[^>]*>/, "").replace(/<\/svg>\s*$/, "");

const constructionSvg = (icon, catalog) => {
  const cells = Array.from({ length: catalog.grid + 1 }, (_, index) => index);
  const lines = join(cells, index => `<line class="icon-keyline__grid" x1="${index}" y1="0" x2="${index}" y2="${catalog.grid}"/><line class="icon-keyline__grid" x1="0" y1="${index}" x2="${catalog.grid}" y2="${index}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" class="icon-keyline" viewBox="0 0 ${catalog.grid} ${catalog.grid}" aria-hidden="true" focusable="false">
    ${lines}
    <rect class="icon-keyline__safe" x="1" y="1" width="${catalog.grid - 2}" height="${catalog.grid - 2}"/>
    <g fill="none" stroke="currentColor" stroke-width="${catalog.strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${innerGeometry(icon)}</g>
  </svg>`;
};

const section = (id, title, content) => `<section class="doc-section" id="${id}" aria-labelledby="section-${id}-title">
  <h2 id="section-${id}-title">${escapeHtml(title)}</h2>
  ${content}
</section>`;

const bulletList = items => `<ul>${join(items, item => `<li>${escapeHtml(item)}</li>`)}</ul>`;

const example = ({ id, title, description, live }) => `<section class="example-block" id="${id}" data-example="${id}" aria-labelledby="${id}-title">
  <div class="example-heading">
    <div><span class="component-kicker">Configuration</span><h3 id="${id}-title">${escapeHtml(title)}</h3></div>
    <p>${escapeHtml(description)}</p>
  </div>
  <div class="example-canvas"><!--live-->${live}<!--/live--></div>
  ${codeViewer({ id: `${id}-code`, label: `HTML · ${title}`, source: live, rawHref: `${id}.txt` })}
</section>`;

// Usage configurations shown on every page. Each source is rendered live and
// shown verbatim, so the code the reader copies is exactly what they see.
export const iconConfigurations = icon => {
  const snippet = icon.htmlSource.trim();
  const label = icon.docs.actionLabel;
  return [
    {
      id: "with-text",
      title: "Button with a visible text label",
      description: "The preferred configuration. The icon is decorative and the visible text names the control, so nothing else is needed.",
      live: `<button type="button">${snippet} ${escapeHtml(label)}</button>`
    },
    {
      id: "icon-only",
      title: "Icon-only button",
      description: "When space only allows the glyph, the button itself must carry the accessible name with aria-label. The SVG stays aria-hidden and the button keeps a touch target of about 44 by 44 CSS pixels.",
      live: `<button type="button" aria-label="${escapeHtml(label)}" style="min-inline-size:2.75rem;min-block-size:2.75rem">${snippet}</button>`
    },
    {
      id: "inline-text",
      title: "Inline with status or body text",
      description: "Placed before words, the icon repeats meaning the text already states. It scales with the surrounding font size because the default size is 1.25em.",
      live: `<p>${snippet} ${escapeHtml(icon.docs.actionLabel)}</p>`
    },
    {
      id: "custom-size",
      title: "Custom size",
      description: "Set --ef-icon-size on the presentation span or any ancestor. Keep icons at 16px or larger.",
      live: `<p style="--ef-icon-size:2rem">${snippet} 2rem icon</p>`
    },
    {
      id: "custom-colour",
      title: "Custom color",
      description: "The stroke is currentColor, so the parent’s color role decides the ink. Never rewrite the SVG geometry or stroke to recolor it.",
      live: `<p style="color:var(--ef-color-accent-primary)">${snippet} <span style="color:var(--ef-color-text-primary)">Accent ink, primary text</span></p>`
    },
    {
      id: "meaningful-image",
      title: "Standalone meaningful image",
      description: "Use the static SVG file with alt text when the icon stands alone and carries meaning, for example in a table cell with no other text.",
      live: `<img src="${icon.name}.svg" alt="${escapeHtml(icon.label)}" width="24" height="24">`
    },
    {
      id: "decorative-image",
      title: "Decorative image",
      description: "When nearby text already says the same thing, give the image an empty alt so assistive technology skips it.",
      live: `<p><img src="${icon.name}.svg" alt="" width="20" height="20"> ${escapeHtml(icon.label)}</p>`
    }
  ];
};

const sizeSection = icon => section("sizes", "Sizes", `<p>The default size is <code>1.25em</code>, so the icon follows the surrounding text. These are the reviewed sizes; geometry keeps a one-unit safe margin at every size.</p>
  <ul class="icon-sizes">${join(ICON_SIZES, size => `<li class="icon-sizes__item"><span class="icon-sizes__glyph">${sized(icon, size)}</span><span class="icon-sizes__label">${size}px</span></li>`)}</ul>
  ${codeViewer({ id: "sizes-code", label: "HTML · Set a size", source: sized(icon, 32) })}`);

const colourSection = icon => section("colour", "Color and contrast modes", `<p>The icon has no color of its own: its stroke is <code>currentColor</code>. These swatches set only the parent’s color role. Brands and themes change the ink through the same roles.</p>
  <ul class="icon-colours">${join(COLOUR_CONTEXTS, context => `<li class="icon-colours__item" data-colour-context="${context.id}" style="background:${context.surface};color:${context.text}">
    <span class="icon-colours__glyph" style="color:${context.ink}">${sized(icon, 32)}</span>
    <span class="icon-colours__name">${escapeHtml(context.name)}</span>
    <code class="icon-colours__role">${escapeHtml(context.role)}</code>
  </li>`)}</ul>
  <div class="doc-columns">
    <div>
      <h3>Forced colors and high contrast</h3>
      <p>In Windows high-contrast and other forced-color modes the icon is drawn in the system text color (<code>CanvasText</code>), or the button text color inside buttons. Meaning must therefore never depend on the icon’s color.</p>
    </div>
    <div>
      <h3>Grayscale and print</h3>
      <p>The ink is a vector stroke, not a background, so it prints when browsers drop backgrounds and stays legible in grayscale. Status is always carried by the words next to the icon.</p>
    </div>
  </div>`);

const sourceSection = (icon, catalog) => section("source", "Files and package paths", `<p>Copy the generated assets from the pinned package. Do not hand-copy path geometry: the compiled files are deterministic and verified against the digest below.</p>
  ${table({
    caption: `${icon.label} assets in Forma ${catalog.formaVersion}`,
    label: "Icon assets",
    headers: ["Asset", "Package path", "Use"],
    rows: [
      ["Static SVG", `<code>@echelon-foundry/design-system/icons/${icon.name}.svg</code>`, "<code>&lt;img&gt;</code>, CSS, print and offline documents"],
      ["Decorative HTML", `<code>@echelon-foundry/design-system/icons/html/${icon.name}.html</code>`, "Inline markup inside a named control or next to text"],
      ["Registry entry", "<code>@echelon-foundry/design-system/icons/registry.json</code>", "Name, label, category, keywords and digest for tools"]
    ]
  })}
  <p><a href="${icon.name}.svg" download="${icon.name}.svg">Download ${escapeHtml(icon.name)}.svg</a> · <a href="decorative.txt" type="text/plain">Decorative HTML as text</a></p>
  ${codeViewer({ id: "svg-code", label: `SVG · ${icon.name}.svg`, source: icon.svgSource })}
  ${codeViewer({ id: "html-code", label: `HTML · icons/html/${icon.name}.html`, source: icon.htmlSource })}
  <dl class="icon-facts">
    <div><dt>Forma version</dt><dd><code>${escapeHtml(catalog.formaVersion)}</code></dd></div>
    <div><dt>SVG sha256</dt><dd><code>${escapeHtml(icon.svgSha256)}</code></dd></div>
  </dl>`);

const accessibilitySection = icon => section("accessibility", "Accessibility checklist", bulletList([
  "The inline SVG is always aria-hidden and not focusable; it never names, operates or announces anything by itself.",
  `An icon-only control needs its own accessible name, for example aria-label="${icon.docs.actionLabel}".`,
  "A standalone meaningful image uses alt text; a decorative image uses alt=\"\".",
  "Icon names such as “" + icon.name + "” are identifiers, not translated labels. Write the accessible name in the interface language.",
  "State and outcome are always written in text. Color and the glyph only repeat it.",
  "Interactive parents keep a touch target of about 44 by 44 CSS pixels."
]));

const pager = (catalog, icon, rootPath) => `<nav class="pager" aria-label="More icons">
  ${icon.previous ? `<a class="pager__link" rel="prev" href="${iconHref(rootPath, icon.previous)}"><span>Previous</span>${escapeHtml(catalog.byName.get(icon.previous).label)}</a>` : '<span class="pager__link pager__link--empty"></span>'}
  <a class="pager__link pager__link--up" href="${rootPath}icons/"><span>Gallery</span>All icons</a>
  ${icon.next ? `<a class="pager__link" rel="next" href="${iconHref(rootPath, icon.next)}"><span>Next</span>${escapeHtml(catalog.byName.get(icon.next).label)}</a>` : '<span class="pager__link pager__link--empty"></span>'}
</nav>`;

const ICON_STYLES = `<style>
  .icon-doc, .icon-gallery { inline-size: min(100% - 2rem, 76rem); margin: 2rem auto; min-inline-size: 0; overflow-wrap: anywhere; }
  .icon-doc__hero { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1.5rem; align-items: start; }
  .icon-doc__figure { margin: 0; }
  .icon-doc__figure figcaption { font-size: .85rem; margin-block-start: .5rem; }
  .icon-keyline { inline-size: min(100%, 18rem); block-size: auto; aspect-ratio: 1; display: block; color: var(--ef-color-text-primary); background: var(--ef-color-surface-primary); border: 1px solid var(--ef-color-border-subtle); }
  .icon-keyline__grid { stroke: var(--ef-color-border-subtle); stroke-width: .04; }
  .icon-keyline__safe { fill: none; stroke: var(--ef-color-accent-primary); stroke-width: .06; stroke-dasharray: .3 .2; }
  .icon-facts { display: grid; gap: .5rem; margin: 1rem 0; }
  .icon-facts div { display: flex; flex-wrap: wrap; gap: .25rem .75rem; }
  .icon-facts dt { flex: 0 0 9rem; max-inline-size: 100%; }
  .icon-facts dt { font-weight: 600; }
  .icon-facts dd { flex: 1 1 12rem; margin: 0; min-inline-size: 0; }
  .icon-sizes, .icon-colours { list-style: none; padding: 0; margin: 1rem 0; display: flex; flex-wrap: wrap; gap: 1rem; }
  .icon-sizes__item { display: grid; justify-items: center; gap: .4rem; min-inline-size: 4rem; padding: .75rem; border: 1px solid var(--ef-color-border-subtle); }
  .icon-sizes__glyph { display: grid; place-items: center; min-block-size: 3rem; color: var(--ef-color-text-primary); }
  .icon-colours__item { display: grid; justify-items: start; gap: .35rem; min-inline-size: min(100%, 11rem); flex: 1 1 11rem; padding: 1rem; border: 1px solid var(--ef-color-border-subtle); }
  .icon-colours__role { font-size: .75rem; overflow-wrap: anywhere; color: inherit; background: none; }
  .icon-doc .example-canvas button { display: inline-flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: .4rem; inline-size: auto; max-inline-size: 100%; justify-self: start; overflow-wrap: anywhere; }
  .icon-doc .code-viewer + .code-viewer { margin-block-start: 1.5rem; }
  .icon-gallery__grid { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr)); gap: 1rem; }
  .icon-gallery__card { min-inline-size: 0; padding: 1rem; border: 1px solid var(--ef-color-border-functional, #444); background: var(--ef-color-surface-primary, white); }
  .icon-gallery__preview { display: flex; align-items: center; min-block-size: 3rem; color: var(--ef-color-text-primary, #171a18); }
  .icon-gallery__card h3 { font-size: 1rem; margin: .5rem 0 .2rem; }
  .icon-gallery__card h3 a { display: inline-flex; align-items: center; min-block-size: 2.75rem; }
  .icon-gallery__card p { margin: .2rem 0 .7rem; }
  .icon-gallery__card details { overflow-wrap: anywhere; }
  .icon-gallery__card summary { cursor: pointer; min-block-size: 2.75rem; display: flex; align-items: center; }
  .icon-gallery__card pre { overflow: auto; font-size: .75rem; white-space: pre-wrap; overflow-wrap: anywhere; }
  @media (forced-colors: active) {
    .icon-gallery__card, .icon-sizes__item, .icon-colours__item { border-color: CanvasText; background: Canvas; color: CanvasText; }
    .icon-keyline__grid, .icon-keyline__safe { stroke: GrayText; }
  }
</style>`;

export const renderIconPage = (catalog, icon, rootPath = "../../") => {
  const related = icon.docs.related.map(name => catalog.byName.get(name));
  const body = `<main id="main" class="icon-doc" data-icon="${icon.name}">
  ${breadcrumbs(rootPath, [{ label: "Icons", href: `${rootPath}icons/` }, { label: titleCase(icon.category), href: `${rootPath}icons/#icon-cat-${icon.category}` }, { label: icon.label }])}
  <header class="icon-doc__hero">
    <div>
      <p class="eyebrow">Forma icon · ${escapeHtml(titleCase(icon.category))}</p>
      <h1>${escapeHtml(icon.label)}</h1>
      ${icon.introducedIn === NEW_ICON_RELEASE ? `<p><a href="${rootPath}icons/new/">Introduced in Forma ${NEW_ICON_RELEASE} · Browse all 40 new icons</a></p>` : ""}
      <p class="doc-lead">${escapeHtml(icon.docs.meaning)}</p>
      <dl class="icon-facts">
        <div><dt>Name</dt><dd><code>${escapeHtml(icon.name)}</code></dd></div>
        <div><dt>Category</dt><dd>${escapeHtml(titleCase(icon.category))}</dd></div>
        <div><dt>Introduced</dt><dd>Forma ${escapeHtml(icon.introducedIn)}</dd></div>
        <div><dt>Keywords</dt><dd>${escapeHtml(icon.keywords.join(", "))}</dd></div>
        <div><dt>Grid</dt><dd>${catalog.grid} × ${catalog.grid}, ${catalog.strokeWidth} stroke, round caps and joins</dd></div>
        <div><dt>Origin</dt><dd>${escapeHtml(titleCase(icon.origin))} Forma artwork</dd></div>
      </dl>
    </div>
    <figure class="icon-doc__figure">
      ${constructionSvg(icon, catalog)}
      <figcaption>Construction view: the ${escapeHtml(icon.label.toLowerCase())} glyph on the ${catalog.grid}-unit grid. The dashed square marks the one-unit safe margin that strokes stay inside.</figcaption>
    </figure>
  </header>
  <nav class="page-toc" aria-label="Sections of this icon page"><ul>
    ${join([["meaning", "Meaning"], ["sizes", "Sizes"], ["colour", "Color and contrast"], ["configurations", "Configurations"], ["source", "Files"], ["accessibility", "Accessibility"], ["related", "Related icons"]], ([id, label]) => `<li><a href="#${id}">${label}</a></li>`)}
  </ul></nav>
  ${section("meaning", "Meaning and when to use it", `<p class="doc-lead">${escapeHtml(icon.docs.meaning)}</p>
    <div class="doc-columns">
      <div class="guidance"><h3>Use it for</h3>${bulletList(icon.docs.useFor)}</div>
      <div class="guidance guidance--avoid"><h3>Avoid it for</h3>${bulletList(icon.docs.avoid)}</div>
    </div>`)}
  ${sizeSection(icon)}
  ${colourSection(icon)}
  ${section("configurations", "Configurations and how to use them", `<p>Every configuration below uses the same generated snippet. Only the surrounding HTML changes. Copy the example that matches your context.</p>
    ${join(iconConfigurations(icon), example)}`)}
  ${sourceSection(icon, catalog)}
  ${accessibilitySection(icon)}
  ${section("related", "Related icons", `<ul class="icon-gallery__grid">${join(related, other => `<li class="icon-gallery__card">
      <div class="icon-gallery__preview">${sized(other, 32)}</div>
      <h3><a href="${iconHref(rootPath, other.name)}">${escapeHtml(other.label)}</a></h3>
      <p>${escapeHtml(other.docs.meaning)}</p>
    </li>`)}</ul>`)}
  ${pager(catalog, icon, rootPath)}
</main>`;
  return page({ title: `${icon.label} icon`, rootPath, body, navSection: "icons", navSubpage: true, head: ICON_STYLES, description: `Forma ${icon.label} icon (${icon.name}): ${icon.docs.meaning}` });
};

// Plain-text files served next to each page, one per configuration plus the
// decorative snippet, so every code sample has a raw source link.
export const iconRawFiles = icon => [
  { file: "decorative.txt", content: icon.htmlSource },
  ...iconConfigurations(icon).map(config => ({ file: `${config.id}.txt`, content: config.live + "\n" }))
];

export function renderIconGallery(rootPath = "../", catalog = loadIconCatalog()) {
  const groups = [...new Set(catalog.icons.map(icon => icon.category))].sort()
    .map(category => [category, catalog.icons.filter(icon => icon.category === category)]);
  const cards = join(groups, ([category, icons]) => `<section class="icon-gallery__section" aria-labelledby="icon-cat-${category}">
  <h2 id="icon-cat-${category}">${escapeHtml(titleCase(category))}</h2>
  <ul class="icon-gallery__grid">${join(icons, icon => `<li class="icon-gallery__card">
      <div class="icon-gallery__preview" style="--ef-icon-size:32px">${icon.htmlSource.trim()}</div>
      <h3><a href="${iconHref(rootPath, icon.name)}">${escapeHtml(icon.label)}</a></h3>
      <p><code>${escapeHtml(icon.name)}</code></p>
      <p>${escapeHtml(icon.docs.meaning)}</p>
      <details><summary>Copyable HTML</summary><pre><code>${escapeHtml(icon.htmlSource.trim())}</code></pre></details>
    </li>`, "\n")}</ul>
</section>`, "\n");
  return page({
    title: "Icon gallery",
    rootPath,
    navSection: "icons",
    description: "Complete static gallery of Forma's versioned, accessible original SVG icons.",
    head: ICON_STYLES,
    body: `<main id="main" class="icon-gallery">
      <p class="eyebrow">Forma visual language</p>
      <h1>Icon gallery</h1>
      <p>All ${catalog.icons.length} icons use a ${catalog.grid}×${catalog.grid} grid, ${catalog.strokeWidth} stroke width and currentColor. The geometry is compiled from Forma's original registry, not copied from an external library. Open any icon for its meaning, sizes, color and contrast modes, and copyable configurations. These previews are decorative; icon-only controls must provide their own accessible names.</p>
      <p><a href="${rootPath}icons/new/">New in Forma 0.6.0: all 40 added icons</a> · <a href="${rootPath}components/icon/">Icon usage and accessible examples</a> · <a href="${rootPath}components/">Full component catalog</a></p>
      ${cards}
    </main>`
  });
}

/** A release-specific entrypoint built from the same canonical source as the icon pages. */
export function renderNewIconIndex(rootPath = "../../", catalog = loadIconCatalog()) {
  const latest = catalog.icons.filter(icon => icon.introducedIn === NEW_ICON_RELEASE);
  if (latest.length !== introducedIn06.size) throw new Error("The 0.6.0 icon cohort and registry disagree");
  const categories = [...new Set(latest.map(icon => icon.category))].sort();
  return page({
    title: "New icons in Forma 0.6.0",
    rootPath,
    navSection: "icons",
    navSubpage: true,
    description: "Forty first-party email, communication, document, navigation and status SVG icons introduced in Forma 0.6.0.",
    head: ICON_STYLES,
    body: `<main id="main" class="icon-gallery" data-icon-release="${NEW_ICON_RELEASE}">
      ${breadcrumbs(rootPath, [{ label: "Icons", href: `${rootPath}icons/` }, { label: "New in ${NEW_ICON_RELEASE}" }])}
      <p class="eyebrow">Forma 0.6.0 · Added vocabulary</p>
      <h1>40 new icons</h1>
      <p>Every icon below has its own static reference page with a grid preview, size and color guidance, accessible native-control examples, copyable source, and a downloadable release-versioned SVG. The first 40 icons remain supported.</p>
      <p><a href="${rootPath}icons/">Browse all ${catalog.icons.length} Forma icons</a></p>
      ${join(categories, category => `<section class="icon-gallery__section" aria-labelledby="recent-${category}">
        <h2 id="recent-${category}">${escapeHtml(titleCase(category))}</h2>
        <ul class="icon-gallery__grid">${join(latest.filter(icon => icon.category === category), icon => `<li class="icon-gallery__card" data-new-icon="${icon.name}">
          <div class="icon-gallery__preview" style="--ef-icon-size:32px">${icon.htmlSource.trim()}</div>
          <h3><a href="${iconHref(rootPath, icon.name)}">${escapeHtml(icon.label)}</a></h3>
          <p><code>${escapeHtml(icon.name)}</code></p>
          <p>${escapeHtml(icon.docs.meaning)}</p>
        </li>`, "\n")}</ul>
      </section>`, "\n")}
    </main>`
  });
}
