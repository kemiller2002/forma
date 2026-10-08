// Static icon gallery generated from the canonical Forma SVG registry.
import fs from "node:fs";
import {compileIcons} from "../icons/build.mjs";
import {page} from "./render-layout.mjs";
import {escapeHtml} from "./html.mjs";

export function renderIconGallery(rootPath = "../") {
  const registry = JSON.parse(fs.readFileSync(new URL("../../icons/registry.json", import.meta.url), "utf8"));
  const compiled = compileIcons(registry);
  const groups = new Map();
  for (const icon of [...registry.icons].sort((a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))) {
    if (!groups.has(icon.category)) groups.set(icon.category, []);
    groups.get(icon.category).push(icon);
  }
  const cards = [...groups].map(([category, icons]) => `<section class="icon-gallery__section" aria-labelledby="icon-cat-${category}">
  <h2 id="icon-cat-${category}">${escapeHtml(category.replaceAll("-", " "))}</h2>
  <ul class="icon-gallery__grid">${icons.map(icon => {
    const snippet = compiled.get("html/" + icon.name + ".html").trim();
    return `<li class="icon-gallery__card">
      <div class="icon-gallery__preview" style="--ef-icon-size:32px">${snippet}</div>
      <h3>${escapeHtml(icon.label)}</h3>
      <p><code>${escapeHtml(icon.name)}</code></p>
      <details><summary>Copyable HTML</summary><pre><code>${escapeHtml(snippet)}</code></pre></details>
    </li>`;
  }).join("\n")}</ul>
</section>`).join("\n");
  return page({
    title: "Icon gallery",
    rootPath,
    description: "Complete static gallery of Forma's versioned, accessible original SVG icons.",
    head: `<style>
      .icon-gallery { width:min(100% - 2rem, 76rem); margin:2rem auto; }
      .icon-gallery__grid { list-style:none; padding:0; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr)); gap:1rem; }
      .icon-gallery__card { min-inline-size:0; padding:1rem; border:1px solid var(--ef-color-border-functional, #444); background:var(--ef-color-surface-primary,white); }
      .icon-gallery__preview { display:flex; align-items:center; min-block-size:3rem; color:var(--ef-color-text-primary,#171a18); }
      .icon-gallery__card h3 { font-size:1rem; margin:.5rem 0 .2rem; }
      .icon-gallery__card p { margin:.2rem 0 .7rem; }
      .icon-gallery__card details { overflow-wrap:anywhere; }
      .icon-gallery__card summary { cursor:pointer; }
      .icon-gallery__card pre { overflow:auto; font-size:.75rem; white-space:pre-wrap; overflow-wrap:anywhere; }
      @media (forced-colors:active) {.icon-gallery__card { border-color:CanvasText; background:Canvas; color:CanvasText; }}
    </style>`,
    body: `<main id="main" class="icon-gallery">
      <p class="eyebrow">Forma visual language</p>
      <h1>Icon gallery</h1>
      <p>All ${registry.icons.length} icons use a 24×24 grid, 1.8 stroke width and currentColor. The geometry is compiled from Forma's original registry, not copied from an external library. These previews are decorative; icon-only controls must provide their own accessible names.</p>
      <p><a href="${rootPath}components/icon/">Icon usage and accessible examples</a> · <a href="${rootPath}components/">Full component catalog</a></p>
      ${cards}
    </main>`
  });
}
