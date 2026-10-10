// Catalog-level pages: home, category overviews, the A–Z index, the mobile
// reference, compositions and the accessibility statement. All counts and
// lists are derived from the loaded catalog.
import { breadcrumbs, catalogNav, codeViewer, page, viewportDemo } from "./render-layout.mjs";
import { categoryHref, componentHref, escapeHtml, inline, join, list, namespaceSnippet, wrapTag } from "./html.mjs";
import { markupTags } from "./load.mjs";

const componentCard = (context, component, { preview = false } = {}) => `<li class="catalog-card" data-category="${component.category}">
  <h2><a href="${componentHref(context.rootPath, component.slug)}">${escapeHtml(component.name)}</a></h2>
  <p class="catalog-card__tag"><code>&lt;${component.tag}&gt;</code></p>
  <p>${inline(component.summary, context)}</p>
  ${preview && component.pattern ? `<div class="catalog-card__preview" inert aria-hidden="true"><!--live-->${namespaceSnippet(wrapTag(component.slug, component.pattern), `preview-${component.slug}-`)}<!--/live--></div>` : ""}
</li>`;

export const exampleCount = catalog =>
  catalog.components.reduce((total, component) => total + component.examples.length + 1, 0);

export const renderHome = context => {
  const { catalog } = context;
  const quickStart = `<link rel="stylesheet" href="/path/to/forma/dist/all.css">

<ef-switch class="ef-component-tag">
  <label class="ef-switch">
    <input class="ef-switch__input" type="checkbox" role="switch" name="notifications">
    <span class="ef-switch__track" aria-hidden="true"></span>
    <span class="ef-switch__text"><span class="ef-switch__label">Notifications</span></span>
  </label>
</ef-switch>`;
  const body = `<main id="main">
<section class="hero">
  <div>
    <span class="eyebrow">Echelon Foundry / Interface system</span>
    <h1>Forma</h1>
    <p class="lead">A lightweight, zero-runtime component system. Each component is semantic HTML plus Forma CSS, published under a readable <code>&lt;ef-*&gt;</code> tag that is never registered as a Custom Element. The browser owns native behavior; your application owns everything else.</p>
    <p class="hero-actions"><a class="ef-button" href="components/">Browse all ${catalog.components.length} components</a> <a class="ef-button" href="compositions/">See composed examples</a></p>
  </div>
  <dl class="hero-stats" aria-label="Current Forma facts">
    <div class="hero-stat"><dt class="metric-label">Documented components</dt><dd><strong>${catalog.components.length}</strong></dd></div>
    <div class="hero-stat"><dt class="metric-label">Component families</dt><dd><strong>${catalog.categories.length}</strong></dd></div>
    <div class="hero-stat"><dt class="metric-label">Live examples</dt><dd><strong>${exampleCount(catalog)}</strong></dd></div>
    <div class="hero-stat"><dt class="metric-label">Runtime JavaScript</dt><dd><strong>0 bytes by contract</strong></dd></div>
  </dl>
</section>

<section class="content-section" aria-labelledby="quick-start-title">
  <div class="section-heading">
    <div><span class="eyebrow">Quick start</span><h2 id="quick-start-title">One stylesheet. Native markup.</h2></div>
    <p>Link the built stylesheet and write the component's canonical HTML inside its tag. There is nothing to register or initialize.</p>
  </div>
  <div class="quick-start">
    <div class="example-canvas"><!--live-->${wrapTag("switch", `<label class="ef-switch">
    <input class="ef-switch__input" type="checkbox" role="switch" name="home-notifications">
    <span class="ef-switch__track" aria-hidden="true"></span>
    <span class="ef-switch__text"><span class="ef-switch__label">Notifications</span></span>
  </label>`)}<!--/live--></div>
    ${codeViewer({ id: "quick-start-code", label: "HTML · Quick start", source: quickStart })}
  </div>
</section>

<section class="content-section" id="components" aria-labelledby="families-title">
  <div class="section-heading">
    <div><span class="eyebrow">Component families</span><h2 id="families-title">Find the control by what it does.</h2></div>
    <p>Every component has one primary family and a page with purpose, live examples, a mobile example, copyable HTML, API, states, accessibility, responsive and motion notes. Prefer the <a href="components/">A–Z index</a> if you know the name.</p>
  </div>
  <ul class="family-grid">
    ${join(catalog.categories, category => `<li class="family-card">
      <h3><a href="${categoryHref(context.rootPath, category.id)}">${escapeHtml(category.name)}</a> <span class="family-card__count">${category.components.length}</span></h3>
      <p>${escapeHtml(category.summary)}</p>
      <p class="family-card__members">${join(category.components.slice(0, 5), component => `<a href="${componentHref(context.rootPath, component.slug)}">${escapeHtml(component.name)}</a>`, ", ")}${category.components.length > 5 ? ", …" : ""}</p>
    </li>`)}
  </ul>
</section>

<section class="content-section" aria-labelledby="principles-title">
  <div class="section-heading">
    <div><span class="eyebrow">Design principles</span><h2 id="principles-title">Native first. Explicit boundaries.</h2></div>
    <p>Forma standardizes presentation without becoming a second application runtime.</p>
  </div>
  <div class="principle-grid">
    <article class="principle"><span class="category-label">01</span><h3>Semantic HTML first</h3><p>Native controls keep browser behavior, forms, keyboard interaction, and assistive-technology semantics visible.</p></article>
    <article class="principle"><span class="category-label">02</span><h3>CSS owns presentation</h3><p>Tokens, layout, state styling, responsive behavior, physics-derived motion and forced-color support live in the design system.</p></article>
    <article class="principle"><span class="category-label">03</span><h3>Applications own authority</h3><p>Limen/application code supplies non-native behavior. Ordo/domain state decides what transitions are legal. Aegis supplies safe fault presentation data.</p></article>
    <article class="principle"><span class="category-label">04</span><h3>Mobile is part of the contract</h3><p>Every component works at 320 CSS pixels without page-level horizontal scrolling and keeps approximately 44px touch targets. <a href="mobile/">Mobile reference</a>.</p></article>
    <article class="principle"><span class="category-label">05</span><h3>Accessible by construction</h3><p>Non-color cues, visible focus, reduced motion and forced colors are built in. <a href="accessibility/">Accessibility statement</a>.</p></article>
    <article class="principle"><span class="category-label">06</span><h3>Readable by agents</h3><p>Every page states the smallest correct HTML, and <a href="site-manifest.json">site-manifest.json</a> lists every component, tag, hook and docs URL. <a href="agents/">Agent contract</a>.</p></article>
  </div>
</section>

<section class="content-section" aria-labelledby="ecosystem-title">
  <div class="section-heading">
    <div><span class="eyebrow">Echelon Foundry</span><h2 id="ecosystem-title">Where Forma sits.</h2></div>
    <p>Forma is the shared presentation layer for Echelon Foundry applications and marketing sites. Limen supplies behavior beyond native HTML, Ordo owns legal state transitions, Aegis supplies safe fault presentations, and Visual Engineering research informs the verification screens on every page. <a href="branding/">Brands and skins</a> change identity without changing semantics.</p>
  </div>
</section>
</main>`;
  return page({ title: "Overview", rootPath: context.rootPath, body, navSection: "overview" });
};

export const renderCategoryPage = (context, category) => {
  const body = `<div class="docs-shell">
  ${catalogNav(context, { category: category.id, categoryPage: category.id })}
  <main class="component-main" id="main" data-category-page="${category.id}">
    <header class="component-header">
      ${breadcrumbs(context.rootPath, [{ label: "Forma", href: context.rootPath }, { label: "Components", href: `${context.rootPath}components/` }, { label: category.name }])}
      <span class="component-kicker">Component family · ${category.components.length} components</span>
      <h1>${escapeHtml(category.name)}</h1>
      <p class="lead">${escapeHtml(category.summary)}</p>
    </header>
    <ul class="catalog-cards">
      ${join(category.components, component => componentCard(context, component, { preview: true }))}
    </ul>
    <p class="doc-note">Previews are static renderings of each canonical pattern. Open a component to interact with it.</p>
  </main>
</div>`;
  return page({ title: category.name, rootPath: context.rootPath, body, navSection: "components", navSubpage: true, description: `${category.name}: ${category.summary}` });
};

const initialOf = name => (/^[a-z]/i.test(name) ? name[0].toUpperCase() : "#");

// Category filtering is CSS-only: a radio-backed segmented control and :has().
const filterStyles = catalog => `
  <style>
${join(catalog.categories, category => `    .catalog-index:has(#filter-${category.id}:checked) .catalog-row:not([data-category="${category.id}"]) { display: none; }
    .catalog-index:has(#filter-${category.id}:checked) .letter-group:not(:has(.catalog-row[data-category="${category.id}"])) { display: none; }`, "\n")}
  </style>`;

export const renderAllComponents = context => {
  const { catalog } = context;
  const letters = [...new Set(catalog.components.map(component => initialOf(component.name)))];
  const body = `<div class="docs-shell">
  ${catalogNav(context, { allPage: true })}
  <main class="component-main catalog-index" id="main">
    <header class="component-header">
      ${breadcrumbs(context.rootPath, [{ label: "Forma", href: context.rootPath }, { label: "Components" }])}
      <span class="component-kicker">All components · A–Z</span>
      <h1>All components</h1>
      <p class="lead">Every public Forma component: ${catalog.components.length} components in ${catalog.categories.length} families. Filter by family, jump by letter, or use your browser's find (Ctrl+F / ⌘F) to search names, tags and descriptions on this page.</p>
    </header>
    <fieldset class="ef-field catalog-filter">
      <legend class="ef-field__label">Show family</legend>
      <div class="ef-segmented">
        <label class="ef-segment"><input type="radio" name="catalog-filter" id="filter-all" value="all" checked><span>All</span></label>
        ${join(catalog.categories, category => `<label class="ef-segment"><input type="radio" name="catalog-filter" id="filter-${category.id}" value="${category.id}"><span>${escapeHtml(category.name)}</span></label>`)}
      </div>
    </fieldset>
    <nav class="letter-nav" aria-label="Jump to letter"><ul>${join(letters, letter => `<li><a href="#letter-${letter}">${letter}</a></li>`)}</ul></nav>
    ${join(letters, letter => `<section class="letter-group" id="letter-${letter}" aria-labelledby="letter-${letter}-title">
      <h2 id="letter-${letter}-title">${letter}</h2>
      <ul class="catalog-rows">
        ${join(catalog.components.filter(component => initialOf(component.name) === letter), component => `<li class="catalog-row" data-category="${component.category}">
          <a class="catalog-row__name" href="${componentHref(context.rootPath, component.slug)}">${escapeHtml(component.name)}</a>
          <code class="catalog-row__tag">&lt;${component.tag}&gt;</code>
          <a class="catalog-row__category" href="${categoryHref(context.rootPath, component.category)}">${escapeHtml(context.categoryById.get(component.category).name)}</a>
          <p class="catalog-row__summary">${inline(component.summary, context)}</p>
        </li>`)}
      </ul>
    </section>`)}
  </main>
</div>`;
  return page({ title: "All components", rootPath: context.rootPath, body, navSection: "components", head: filterStyles(catalog), description: `All ${catalog.components.length} Forma components, alphabetically.` });
};

export const renderMobileIndex = context => {
  const body = `<div class="docs-shell">
  ${catalogNav(context)}
  <main class="component-main" id="main">
    <header class="component-header">
      ${breadcrumbs(context.rootPath, [{ label: "Forma", href: context.rootPath }, { label: "Mobile reference" }])}
      <span class="component-kicker">Mobile behavior reference</span>
      <h1>Mobile reference</h1>
      <p class="lead">Every Forma component has at least one explicit mobile example rendered in a real narrow viewport, plus a 320px baseline. This index links straight to each one with the first thing that changes at narrow widths.</p>
    </header>
    <section class="doc-section" aria-labelledby="mobile-contract-title">
      <h2 id="mobile-contract-title">The mobile contract</h2>
      <ul>
        <li>No page-level horizontal scrolling at 320 CSS pixels and wider; wide data scrolls inside a labeled, keyboard-reachable region.</li>
        <li>Standalone touch targets are approximately 44 by 44 CSS pixels where practical.</li>
        <li>Layouts stack, wrap or collapse without changing semantic order or meaning.</li>
        <li>No hover-only, drag-only or pointer-only interaction.</li>
      </ul>
      <p>See the <a href="${context.rootPath}compositions/mobile-settings/">Mobile settings composition</a> for independent controls working together on a phone.</p>
    </section>
    ${join(context.catalog.categories, category => `<section class="doc-section" aria-labelledby="mobile-${category.id}-title">
      <h2 id="mobile-${category.id}-title">${escapeHtml(category.name)}</h2>
      <ul class="catalog-rows">
        ${join(category.components, component => {
          const example = component.examples.find(item => item.mobile);
          return `<li class="catalog-row">
            <a class="catalog-row__name" href="${componentHref(context.rootPath, component.slug)}#mobile">${escapeHtml(component.name)}${example ? ` · ${escapeHtml(example.title)}` : ""}</a>
            <code class="catalog-row__tag">&lt;${component.tag}&gt;</code>
            <p class="catalog-row__summary">${example ? inline(example.mobile.notes[0], context) : "Mobile example pending."}</p>
          </li>`;
        })}
      </ul>
    </section>`)}
  </main>
</div>`;
  return page({ title: "Mobile reference", rootPath: context.rootPath, body });
};

export const compositionComponents = (context, composition) =>
  markupTags(composition.html).map(tag => context.bySlug.get(tag.slice(3))).filter(Boolean);

export const renderCompositionsIndex = context => {
  const body = `<main id="main" class="content-section">
  ${breadcrumbs(context.rootPath, [{ label: "Forma", href: context.rootPath }, { label: "Compositions" }])}
  <span class="eyebrow">Composed examples</span>
  <h1>Compositions</h1>
  <p class="lead">Independent Forma components working together in realistic screens. Each composition links back to the component pages it uses.</p>
  <ul class="family-grid">
    ${join(context.catalog.compositions, composition => `<li class="family-card">
      <h2 class="family-card__title"><a href="${composition.slug}/">${escapeHtml(composition.title)}</a></h2>
      <p>${inline(composition.description, context)}</p>
      <p class="family-card__members">Uses ${compositionComponents(context, composition).length} components</p>
    </li>`)}
  </ul>
</main>`;
  return page({ title: "Compositions", rootPath: context.rootPath, body, navSection: "compositions" });
};

export const renderCompositionPage = (context, composition) => {
  const used = compositionComponents(context, composition);
  const body = `<main id="main" class="content-section composition-page" data-composition="${composition.slug}">
  ${breadcrumbs(context.rootPath, [{ label: "Forma", href: context.rootPath }, { label: "Compositions", href: `${context.rootPath}compositions/` }, { label: composition.title }])}
  <span class="eyebrow">Composition</span>
  <h1>${escapeHtml(composition.title)}</h1>
  <p class="lead">${inline(composition.description, context)}</p>
  ${composition.notes?.length ? `<section class="doc-section" aria-labelledby="notes-title"><h2 id="notes-title">What to notice</h2>${list(composition.notes, context)}</section>` : ""}
  <section class="doc-section" aria-labelledby="live-title">
    <h2 id="live-title">${composition.mobile ? "Live in a narrow viewport" : "Live composition"}</h2>
    ${composition.mobile
      ? viewportDemo({ id: "composition", title: composition.title, src: "frame.html", height: composition.mobile.height ?? 720 })
      : `<div class="example-canvas composition-canvas"><!--live-->${composition.html}<!--/live--></div>`}
  </section>
  <section class="doc-section" aria-labelledby="source-title">
    <h2 id="source-title">HTML</h2>
    ${codeViewer({ id: "composition-code", label: `HTML · ${composition.title}`, source: composition.html, rawHref: "source.txt" })}
  </section>
  <section class="doc-section" aria-labelledby="used-title">
    <h2 id="used-title">Components used</h2>
    <ul class="related-list">${join(used, component => `<li><a href="${componentHref(context.rootPath, component.slug)}">${escapeHtml(component.name)}</a> <code>&lt;${component.tag}&gt;</code><p>${inline(component.summary, context)}</p></li>`)}</ul>
  </section>
</main>`;
  return page({ title: composition.title, rootPath: context.rootPath, body, navSection: "compositions", navSubpage: true });
};

export const renderAccessibility = context => {
  const body = `<main id="main" class="content-section agent-page">
  ${breadcrumbs(context.rootPath, [{ label: "Forma", href: context.rootPath }, { label: "Accessibility" }])}
  <span class="eyebrow">Accessibility statement</span>
  <h1>Accessible by construction, verified by test.</h1>
  <p class="lead">Forma builds on native HTML semantics so that keyboard, focus, form and assistive-technology behavior come from the browser. This page states what Forma guarantees, what applications must supply, how the catalog is tested, and the limitations we know about.</p>
  <h2>What Forma provides</h2>
  <ul>
    <li>Native elements (<code>button</code>, <code>input</code>, <code>select</code>, <code>dialog</code>, <code>details</code>, Popover API) carry role, name, state and keyboard behavior.</li>
    <li>Visible two-tone focus indicators that work on light and dark surfaces.</li>
    <li>State is never communicated by color alone: text, shape, position or pattern repeats it.</li>
    <li>Forced-colors mode projects every semantic color token to system colors.</li>
    <li>Reduced motion removes spatial travel; state still changes immediately.</li>
    <li>Components reflow at 320 CSS pixels and at 200% zoom without page-level horizontal scrolling, with approximately 44px touch targets.</li>
  </ul>
  <h2>What your application supplies</h2>
  <ul>
    <li>Meaningful labels, headings, instructions and error text in the user's language.</li>
    <li>Page structure and landmarks, and focus management for behavior beyond native HTML.</li>
    <li>Live-region timing, announcements and any behavior Limen adds (roving focus, typeahead, drag alternatives).</li>
  </ul>
  <p>Each component page has an <strong>Accessibility</strong> section that splits these responsibilities for that component.</p>
  <h2>How the catalog is tested</h2>
  <ul>
    <li>Every canonical pattern is checked with axe-core in Chromium, Firefox and WebKit, in light and dark themes (<code>tests/browser/accessibility.spec.mjs</code>).</li>
    <li>Every generated documentation page is loaded at 320, 390 and 430 CSS pixels, a tablet width and desktop, and at 200% text size, and checked for page-level overflow and undersized site targets (<code>tests/site-browser/</code>).</li>
    <li>Generated pages are checked for duplicate ids, heading order, broken internal links and axe-core violations.</li>
    <li>Catalog coverage (every component has purpose, examples, a mobile example, API, states, accessibility, responsive, motion, guidance and related entries) is enforced in CI (<code>npm run catalog:check</code>).</li>
  </ul>
  <h2>Known limitations</h2>
  <ul>
    <li>The documentation site runs no JavaScript by policy. Code is copied by selecting it (one click or tap selects a whole block) or by opening the Raw HTML link, not with a clipboard button.</li>
    <li>There is no full-text search box; the <a href="${context.rootPath}components/">A–Z index</a> filters by family with CSS and works with the browser's find command.</li>
    <li>Mobile demonstration frames have a fixed height and may need internal scrolling for tall examples.</li>
    <li>The documentation chrome is light-only. Component dark themes are demonstrated in the <a href="${context.rootPath}branding/">Brand Laboratory</a>.</li>
    <li>Automated checks do not replace testing with assistive-technology users. Visual Engineering stress screens are engineering screens, not human-subject validation.</li>
    <li>Category previews are inert static renderings; interactive behavior is on each component page.</li>
  </ul>
</main>`;
  return page({ title: "Accessibility", rootPath: context.rootPath, body, navSection: "accessibility" });
};
