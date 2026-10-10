// Page chrome and reusable documentation blocks: site header/footer, the
// catalog navigation, the code viewer, example blocks and the mobile
// viewport demonstration. Every function is pure: data in, HTML string out.
import { categoryHref, componentHref, escapeHtml, inline, join, list, when } from "./html.mjs";

export const VIEWPORTS = [
  { width: 320, label: "Phone 320" },
  { width: 390, label: "Phone 390" },
  { width: 430, label: "Phone 430" },
  { width: 768, label: "Tablet 768" }
];

// Top-level navigation state is projected from each page's owning section.
// Only a matching section gets a selected style and aria-current. Detail pages
// describe their position as "location" rather than claiming the hub URL is
// the actual current page.
const primaryLinks = Object.freeze([
  ["overview", "Overview", ""],
  ["components", "Components", "components/"],
  ["icons", "Icons", "icons/"],
  ["compositions", "Compositions", "compositions/"],
  ["accessibility", "Accessibility", "accessibility/"],
  ["agents", "Agent use", "agents/"]
]);

const siteHeader = (rootPath, navSection, navSubpage = false) => `<header class="site-header">
  <div class="nav-shell">
    <div class="brand">
      <a class="brand-link" href="${rootPath}">
        <span class="brand-mark" aria-hidden="true">EF</span>
        <span>Echelon / Foundry</span>
      </a>
      <span class="brand-subtitle">Forma / Interface system</span>
    </div>
    <nav class="site-nav" aria-label="Forma documentation">
      ${join(primaryLinks, ([section, label, suffix]) => `<a href="${rootPath}${suffix}"${navSection === section ? ` aria-current="${navSubpage ? "location" : "page"}"` : ""}>${label}</a>`, "\n      ")}
    </nav>
  </div>
</header>`;

const siteFooter = rootPath => `<footer class="site-footer">
  <div class="footer-grid">
    <div>
      <p class="eyebrow">Echelon / Foundry</p>
      <p>Forma: semantic HTML, deliberate CSS, and explicit application boundaries.</p>
    </div>
    <div class="footer-links">
      <a href="${rootPath}components/">All components</a>
      <a href="${rootPath}mobile/">Mobile reference</a>
      <a href="${rootPath}branding/">Branding</a>
      <a href="${rootPath}site-manifest.json">Catalog manifest (JSON)</a>
      <a href="https://echelonfoundry.com/">Echelon Foundry</a>
    </div>
  </div>
  <p class="footer-note">Forma design system <span>Generated from canonical patterns, catalog entries and the built stylesheet.</span></p>
</footer>`;

export const page = ({ title, rootPath, body, description = "Forma, the zero-runtime Echelon Foundry design system.", head = "", navSection = null, navSubpage = false }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)} · Forma · Echelon Foundry</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,500;6..72,650&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${rootPath}assets/forma.css">
  <link rel="stylesheet" href="${rootPath}assets/brands/echelon.css">
  <link rel="stylesheet" href="${rootPath}assets/brands/example-harbor.css">
  <link rel="stylesheet" href="${rootPath}assets/site.css">${head}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  ${siteHeader(rootPath, navSection, navSubpage)}
  ${body}
  ${siteFooter(rootPath)}
</body>
</html>`;

// Tables stack into labelled rows on phones (see site.css). Explicit table
// roles keep the semantics when the display value changes.
// A narrow-viewport document that renders one snippet with Forma CSS only.
export const frameDocument = ({ title, rootPath, source }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${rootPath}assets/forma.css">
  <style>
    html, body { inline-size: 100%; max-inline-size: 100%; overflow-x: clip; }
    body { margin: 0; padding: 12px; }
    main { inline-size: 100%; max-inline-size: 100%; }
  </style>
</head>
<body>
  ${/<main\b/.test(source) ? source : `<main>${source}</main>`}
</body>
</html>`;

const categoryLinks = (context, current) => join(context.catalog.categories, category => {
  const isCurrent = current?.category === category.id;
  return `<details class="catalog-nav__group"${isCurrent ? " open" : ""}>
    <summary><span>${escapeHtml(category.name)}</span> <span class="catalog-nav__count">${category.components.length}</span>${isCurrent ? '<span class="ef-visually-hidden"> (current category)</span>' : ""}</summary>
    <ul>
      <li><a class="catalog-nav__overview" href="${categoryHref(context.rootPath, category.id)}"${current?.categoryPage === category.id ? ' aria-current="page"' : ""}>${escapeHtml(category.name)} overview</a></li>
      ${join(category.components, component => `<li><a href="${componentHref(context.rootPath, component.slug)}"${current?.slug === component.slug ? ' aria-current="page"' : ""}>${escapeHtml(component.name)}</a></li>`)}
    </ul>
  </details>`;
});

// Desktop keeps a persistent sidebar; phones get the same tree behind one
// native disclosure so content is not pushed below a long menu. Only one of
// the two is displayed at a time, so assistive technology sees one landmark.
export const catalogNav = (context, current = {}) => `<nav class="component-nav catalog-nav catalog-nav--sidebar" aria-label="Component catalog">
  <div class="component-nav-inner">
    <h2>Components</h2>
    <p class="catalog-nav__all"><a href="${context.rootPath}components/"${current.allPage ? ' aria-current="page"' : ""}>All components A–Z (${context.catalog.components.length})</a></p>
    ${categoryLinks(context, current)}
  </div>
</nav>
<nav class="catalog-nav catalog-nav--compact" aria-label="Component catalog">
  <details class="catalog-nav__disclosure">
    <summary>Browse components</summary>
    <p class="catalog-nav__all"><a href="${context.rootPath}components/"${current.allPage ? ' aria-current="page"' : ""}>All components A–Z (${context.catalog.components.length})</a></p>
    ${categoryLinks(context, current)}
  </details>
</nav>`;

// Code viewer built on Forma's own code-sample primitive. Copying needs no
// script: one click or tap selects the whole block (user-select: all), and the
// raw link opens the exact source as plain text.
export const codeViewer = ({ id, label, source, rawHref }) => `<figure class="ef-code-figure code-viewer">
  <figcaption class="code-viewer__bar">
    <span class="code-viewer__label" id="${id}-label">${escapeHtml(label)}</span>
    ${when(rawHref, () => `<a class="code-viewer__raw" href="${rawHref}" type="text/plain">Raw HTML<span class="ef-visually-hidden"> for ${escapeHtml(label)}</span></a>`)}
  </figcaption>
  <pre class="ef-code code-viewer__code" tabindex="0" aria-labelledby="${id}-label"><code>${escapeHtml(source.trim())}</code></pre>
  <p class="code-viewer__hint">Click or tap the code once to select all of it, then copy.</p>
</figure>`;

export const exampleBlock = ({ id, kicker, title, description, live, source, rawHref, context, canvasClass = "", attributes = "" }) => `<section class="example-block" id="${id}" data-example="${id}" aria-labelledby="${id}-title"${attributes}>
  <div class="example-heading">
    <div><span class="component-kicker">${escapeHtml(kicker)}</span><h3 id="${id}-title">${escapeHtml(title)}</h3></div>
    <p>${inline(description, context)}</p>
  </div>
  <div class="example-canvas ${canvasClass}"><!--live-->${live}<!--/live--></div>
  ${codeViewer({ id: `${id}-code`, label: `HTML · ${title}`, source, rawHref })}
</section>`;

// A real narrow viewport: the snippet renders in its own document inside an
// iframe whose width the reader chooses with a radio-backed segmented control.
export const viewportDemo = ({ id, title, src, height = 480 }) => `<div class="viewport-demo">
  <fieldset class="ef-field viewport-demo__control">
    <legend class="ef-field__label">Viewport width</legend>
    <div class="ef-segmented">
      ${join(VIEWPORTS, (viewport, index) => `<label class="ef-segment"><input type="radio" name="${id}-viewport" value="${viewport.width}"${index === 0 ? " checked" : ""}><span>${viewport.label}</span></label>`)}
    </div>
  </fieldset>
  <div class="example-canvas example-canvas--mobile">
    <iframe class="example-mobile-frame" title="${escapeHtml(title)} in a narrow viewport" src="${src}" loading="lazy" style="--frame-height: ${Number(height)}px"></iframe>
  </div>
  <p class="viewport-demo__note">Frames narrower than the selected width show the component at the width available.</p>
</div>`;

export const mobileExampleBlock = ({ id, title, description, notes, src, height, source, rawHref, context }) => `<section class="example-block example-block--mobile" id="${id}" data-example="${id}" data-mobile-example="${id}" aria-labelledby="${id}-title">
  <div class="example-heading">
    <div><span class="component-kicker">Mobile example</span><h3 id="${id}-title">${escapeHtml(title)}</h3></div>
    <p>${inline(description, context)}</p>
  </div>
  ${viewportDemo({ id, title, src, height })}
  <div class="mobile-notes">
    <h4>What changes at narrow widths</h4>
    ${list(notes, context)}
  </div>
  ${codeViewer({ id: `${id}-code`, label: `HTML · ${title}`, source, rawHref })}
</section>`;

export const table = ({ caption, headers, rows, label }) => rows.length ? `<div class="ef-bounded-overflow doc-table" role="region" aria-label="${escapeHtml(label ?? caption)}" tabindex="0">
  <table role="table">
    <caption>${escapeHtml(caption)}</caption>
    <thead role="rowgroup"><tr role="row">${join(headers, header => `<th role="columnheader" scope="col">${escapeHtml(header)}</th>`)}</tr></thead>
    <tbody role="rowgroup">${join(rows, cells => `<tr role="row">${join(cells, (cell, index) => (index === 0
      ? `<th role="rowheader" scope="row">${cell}</th>`
      : `<td role="cell" data-label="${escapeHtml(headers[index])}">${cell}</td>`))}</tr>`)}</tbody>
  </table>
</div>` : "";

export const breadcrumbs = (rootPath, trail) => `<nav class="breadcrumbs" aria-label="Documentation breadcrumb"><ol>
  ${join(trail, (item, index) => `<li>${item.href && index < trail.length - 1 ? `<a href="${item.href}">${escapeHtml(item.label)}</a>` : `<span aria-current="page">${escapeHtml(item.label)}</span>`}</li>`)}
</ol></nav>`;
