// The standardized component page. Every public component renders through
// this one template so humans and agents can learn one page and read all.
import { breadcrumbs, catalogNav, codeViewer, exampleBlock, mobileExampleBlock, page, table, viewportDemo } from "./render-layout.mjs";
import { categoryHref, componentHref, describeValues, escapeHtml, inline, join, list, namespaceSnippet, when, wrapTag } from "./html.mjs";
import { ownedHooks, siblings } from "./load.mjs";

export const SECTIONS = [
  ["purpose", "Purpose"],
  ["basic", "Basic example"],
  ["examples", "Examples"],
  ["mobile", "Mobile"],
  ["api", "API and configuration"],
  ["states", "States"],
  ["accessibility", "Accessibility"],
  ["responsive", "Responsive behavior"],
  ["motion", "Motion"],
  ["guidance", "Usage guidance"],
  ["related", "Related components"],
  ["verification", "Verification specimens"]
];

const MOTION_WEIGHT = "data-ef-motion-weight";
const WEIGHTS = ["light", "standard", "heavy"];

// Roots whose CSS accepts a perceived-mass preset (derived from the stylesheet).
export const motionWeightRoot = (catalog, component) =>
  ownedHooks(catalog, component).find(hook => hook.attributes.some(attribute => attribute.name === MOTION_WEIGHT))?.root ?? null;

const setMotionWeight = (source, className, weight) =>
  source.replace(new RegExp(`<([a-z][\\w-]*)\\b([^>]*\\bclass="[^"]*\\b${className}\\b[^"]*"[^>]*)>`, "gi"), (match, tag, attributes) => {
    const next = new RegExp(`\\b${MOTION_WEIGHT}="`).test(attributes)
      ? attributes.replace(new RegExp(`\\b${MOTION_WEIGHT}="[^"]*"`), `${MOTION_WEIGHT}="${weight}"`)
      : `${attributes} ${MOTION_WEIGHT}="${weight}"`;
    return `<${tag}${next}>`;
  });

// An open modal dialog in a repeated specimen becomes closed with a native
// invoker, so three specimens never stack three modal surfaces on the page.
const closeDialogsWithInvoker = (source, label) =>
  source.replace(/<dialog\b([^>]*?)\sopen(?=[\s>])([^>]*)>/i, (match, before, after) => {
    const idMatch = /\bid="([^"]+)"/.exec(before + after);
    const id = idMatch ? idMatch[1] : "specimen-dialog";
    const withId = idMatch ? `${before}${after}` : `${before}${after} id="${id}"`;
    return `<button type="button" commandfor="${id}" command="show-modal">Open ${label}</button>\n<dialog${withId}>`;
  });

const motionWeightSpecimens = (component, root) => `<div class="motion-weight-grid" data-physics-motion-example="${component.slug}">
  ${join(WEIGHTS, weight => {
    const source = closeDialogsWithInvoker(setMotionWeight(component.pattern, root, weight), `${weight} ${component.name.toLowerCase()}`);
    return `<article class="motion-weight-sample" data-motion-weight="${weight}">
    <div class="motion-weight-label"><strong>${weight}</strong><span>presentation only</span></div>
    <div class="motion-weight-demo">${namespaceSnippet(wrapTag(component.slug, source), `motion-${component.slug}-${weight}-`)}</div>
  </article>`;
  })}
</div>`;

const STRESS_CASES = [
  { id: "content-stress", title: "Content stress", className: "ve-stress ve-stress--content" },
  { id: "text-spacing", title: "Text spacing", className: "ve-stress ve-stress--text-spacing" },
  { id: "grayscale", title: "Cue dropout · grayscale", className: "ve-stress ve-stress--grayscale" },
  { id: "reduced-contrast", title: "Reduced effective contrast", className: "ve-stress ve-stress--reduced-contrast" }
];

const LONG_IDENTIFIER = "VERIFICATION-0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF";

const stressSource = (source, id) => id !== "content-stress"
  ? source
  : source
    .replace(/(<(?:h[1-6]|p|dt|dd|label|button|summary)\b[^>]*>)([^<]{2,})(<\/)/i, (_, open, value, close) =>
      `${open}${value.trim()} · Extended localized content for verification and layout resilience${close}`)
    .replace(/(<(?:section|article|div)\b[^>]*>)/i, `$1<p class="ef-identifier">${LONG_IDENTIFIER}</p>`);

// Stress specimens are visual engineering screens (one deliberately lowers
// contrast), so they are inert and hidden from assistive technology.
const stressSpecimens = component => `<div class="ve-stress-grid" data-ve-verification="${component.slug}" inert aria-hidden="true">
  ${join(STRESS_CASES, item => `<article class="${item.className}" data-ve-stress="${item.id}">
    <div class="motion-weight-label"><strong>${item.title}</strong><span>engineering screen</span></div>
    <div class="ve-stress__demo">${namespaceSnippet(wrapTag(component.slug, closeDialogsWithInvoker(stressSource(component.pattern, item.id), `${item.title.toLowerCase()} specimen`)), `ve-${component.slug}-${item.id}-`)}</div>
  </article>`)}
</div>`;

const hookKind = name =>
  name.startsWith("--") ? "Custom property" : name.includes("--") ? "Modifier class" : name.includes("__") ? "Element class" : name.startsWith("ef-") ? "Block class" : "Attribute hook";

const hookName = name => (name.startsWith("ef-") ? `.${name}` : name.startsWith("--") ? name : `[${name}]`);

// API rows derived from the stylesheet for owned roots, plus any extra hooks
// the entry documents (for family pages that reuse another block's hooks).
const hookRows = (context, component) => {
  const descriptions = component.api?.hooks ?? {};
  const derived = ownedHooks(context.catalog, component).flatMap(hook => [
    { name: hook.root, detail: "" },
    ...hook.elements.map(name => ({ name, detail: "" })),
    ...hook.modifiers.map(name => ({ name, detail: "" })),
    ...hook.attributes.map(attribute => ({ name: attribute.name, detail: describeValues(attribute.values) })),
    ...hook.customProperties.map(property => ({ name: property.name, detail: property.default ? `default ${property.default}` : "" }))
  ]);
  const seen = new Set(derived.map(row => row.name));
  const extra = Object.keys(descriptions).filter(name => !seen.has(name)).map(name => ({ name, detail: "" }));
  return [...derived, ...extra].map(row => [
    `<code>${escapeHtml(hookName(row.name))}</code>`,
    hookKind(row.name),
    row.detail ? `<code>${escapeHtml(row.detail)}</code>` : "—",
    descriptions[row.name] ? inline(descriptions[row.name], context) : row.name.includes("__") ? "Structural element; see the Basic example for placement." : row.name === row.name.split("__")[0] && row.name.startsWith("ef-") ? "Block class applied to the component root." : "—"
  ]);
};

const apiSection = (context, component) => {
  const api = component.api ?? {};
  return `<section class="doc-section" id="api" aria-labelledby="section-api-title">
  <h2 id="section-api-title">API and configuration</h2>
  <p>Forma components have no JavaScript API. Their public contract is the markup: native elements and attributes you write, and the CSS hooks below. The CSS hook table is generated from the built stylesheet, so it always matches the shipped implementation.</p>
  ${table({
    caption: "Native and ARIA attributes",
    headers: ["Attribute", "On", "Values", "Default", "Description"],
    rows: (api.attributes ?? []).map(attribute => [
      `<code>${escapeHtml(attribute.name)}</code>`,
      attribute.on ? `<code>${escapeHtml(attribute.on)}</code>` : "—",
      escapeHtml(attribute.values ?? "—"),
      escapeHtml(attribute.default ?? "—"),
      inline(attribute.description, context)
    ])
  })}
  ${table({ caption: "CSS hooks (derived from dist/all.css)", headers: ["Hook", "Kind", "Values or default", "Description"], rows: hookRows(context, component) })}
  ${table({ caption: "Keyboard interaction", headers: ["Keys", "Result"], rows: (api.keyboard ?? []).map(entry => [`<kbd>${escapeHtml(entry.keys)}</kbd>`, inline(entry.action, context)]) })}
  ${table({ caption: "Events", headers: ["Event", "Description"], rows: (api.events ?? []).map(entry => [`<code>${escapeHtml(entry.name)}</code>`, inline(entry.description, context)]) })}
  ${when(api.form, () => `<h3>Form behavior</h3><p>${inline(api.form, context)}</p>`)}
  ${when(!(api.keyboard ?? []).length, () => `<p class="doc-note">No keyboard interaction beyond the browser defaults for the elements in the markup.</p>`)}
</section>`;
};

const purposeSection = (context, component) => {
  const purpose = component.purpose ?? {};
  return `<section class="doc-section" id="purpose" aria-labelledby="section-purpose-title">
  <h2 id="section-purpose-title">Purpose</h2>
  <p class="doc-lead">${inline(purpose.description, context)}</p>
  <div class="doc-columns">
    <div><h3>Use when</h3>${list(purpose.useWhen, context)}</div>
    <div><h3>Avoid when</h3>${list(purpose.avoidWhen, context)}</div>
  </div>
  ${when(purpose.characteristics?.length, () => `<h3>Behavior to know</h3>${list(purpose.characteristics, context)}`)}
</section>`;
};

const header = (context, component) => {
  const category = context.categoryById.get(component.category);
  return `<header class="component-header">
  ${breadcrumbs(context.rootPath, [
    { label: "Forma", href: context.rootPath },
    { label: "Components", href: `${context.rootPath}components/` },
    { label: category.name, href: categoryHref(context.rootPath, category.id) },
    { label: component.name }
  ])}
  <a class="component-kicker component-kicker--link" href="${categoryHref(context.rootPath, category.id)}">${escapeHtml(category.name)}</a>
  <h1>${escapeHtml(component.name)}</h1>
  <p class="component-tagline"><code>&lt;${component.tag}&gt;</code></p>
  <p class="lead">${inline(component.summary, context)}</p>
  <dl class="contract-grid">
    <div class="contract-item"><dt class="metric-label">Authoring tag</dt><dd><code>&lt;${component.tag}&gt;</code></dd></div>
    <div class="contract-item"><dt class="metric-label">Category</dt><dd><a href="${categoryHref(context.rootPath, category.id)}">${escapeHtml(category.name)}</a></dd></div>
    <div class="contract-item"><dt class="metric-label">Behavior owner</dt><dd>${escapeHtml(component.behavior)}</dd></div>
    <div class="contract-item"><dt class="metric-label">Canonical source</dt><dd><code>patterns/${component.slug}.html</code></dd></div>
  </dl>
  <nav class="page-toc" aria-label="On this page"><ul>
    ${join(SECTIONS.filter(([id]) => id !== "verification" || component.pattern), ([id, label]) => `<li><a href="#${id}">${label}</a></li>`)}
  </ul></nav>
</header>`;
};

const pager = (context, component) => {
  const { previous, next } = siblings(context.catalog, component.slug);
  const category = context.categoryById.get(component.category);
  return `<nav class="pager" aria-label="More in ${escapeHtml(category.name)}">
  ${previous ? `<a class="pager__link" rel="prev" href="${componentHref(context.rootPath, previous.slug)}"><span>Previous</span>${escapeHtml(previous.name)}</a>` : '<span class="pager__link pager__link--empty"></span>'}
  <a class="pager__link pager__link--up" href="${categoryHref(context.rootPath, category.id)}"><span>Category</span>All ${escapeHtml(category.name.toLowerCase())}</a>
  ${next ? `<a class="pager__link" rel="next" href="${componentHref(context.rootPath, next.slug)}"><span>Next</span>${escapeHtml(next.name)}</a>` : '<span class="pager__link pager__link--empty"></span>'}
</nav>`;
};

export const rawPath = exampleId => `${exampleId}.txt`;
export const framePath = exampleId => `mobile-${exampleId}.html`;

// Page-level patterns (those that contain their own <main>) cannot be nested
// inside the documentation page's main landmark, so they render in a frame.
export const isPageLevel = component => /<main\b/.test(component.pattern ?? "");

const basicLive = (component, source) => isPageLevel(component)
  ? `<iframe class="example-page-frame" title="${escapeHtml(component.name)} rendered as its own page" src="basic.html" loading="lazy"></iframe>`
  : source;

export const renderComponentPage = (context, component) => {
  const scenarios = component.examples.filter(example => !example.mobile);
  const mobiles = component.examples.filter(example => example.mobile);
  const weightRoot = motionWeightRoot(context.catalog, component);
  const basicSource = wrapTag(component.slug, component.pattern);
  const body = `<div class="docs-shell">
  ${catalogNav(context, { slug: component.slug, category: component.category })}
  <main class="component-main" id="main" data-component="${component.slug}" data-category="${component.category}">
    ${header(context, component)}
    ${purposeSection(context, component)}

    <section class="doc-section" id="basic" aria-labelledby="section-basic-title">
      <h2 id="section-basic-title">Basic example</h2>
      <p>The smallest correct markup: the canonical pattern from <code>patterns/${component.slug}.html</code> inside its public tag. Copy this first, then adapt labels, names and state.${isPageLevel(component) ? " This component owns a page's <code>main</code> landmark, so it renders in its own document below." : ""}</p>
      ${exampleBlock({ id: "example-basic", kicker: "Canonical", title: `Minimal ${component.name.toLowerCase()}`, description: "Rendered live from the canonical pattern file.", live: basicLive(component, basicSource), source: basicSource, rawHref: rawPath("basic"), context })}
    </section>

    <section class="doc-section" id="examples" aria-labelledby="section-examples-title">
      <h2 id="section-examples-title">Examples</h2>
      ${join(scenarios, example => exampleBlock({ id: `example-${example.id}`, kicker: "Scenario", title: example.title, description: example.description, live: example.html, source: example.html, rawHref: rawPath(example.id), context }))}
    </section>

    <section class="doc-section" id="mobile" aria-labelledby="section-mobile-title">
      <h2 id="section-mobile-title">Mobile</h2>
      <p>Each mobile example renders in its own document inside a real narrow viewport, so Forma's media and container queries run exactly as they would on a phone. Choose a width to compare.</p>
      ${join(mobiles, example => mobileExampleBlock({ id: `example-${example.id}`, title: example.title, description: example.description, notes: example.mobile.notes, src: framePath(example.id), height: example.mobile.height, source: example.html, rawHref: rawPath(example.id), context }))}
      <section class="example-block example-block--baseline" data-example="mobile-baseline" data-mobile-example="baseline" aria-labelledby="mobile-baseline-title">
        <div class="example-heading">
          <div><span class="component-kicker">Baseline</span><h3 id="mobile-baseline-title">Mobile · 320px</h3></div>
          <p>The canonical pattern in a true 320px viewport, the minimum width every Forma component must support without page-level horizontal scrolling.</p>
        </div>
        ${viewportDemo({ id: "mobile-baseline", title: `${component.name} baseline`, src: "mobile.html", height: 420 })}
      </section>
    </section>

    ${apiSection(context, component)}

    <section class="doc-section" id="states" aria-labelledby="section-states-title">
      <h2 id="section-states-title">States</h2>
      ${table({ caption: `${component.name} states`, headers: ["State", "How it is expressed", "Presentation"], rows: (component.states ?? []).map(state => [escapeHtml(state.name), inline(state.how, context), inline(state.description, context)]) })}
    </section>

    <section class="doc-section" id="accessibility" aria-labelledby="section-accessibility-title">
      <h2 id="section-accessibility-title">Accessibility</h2>
      <div class="doc-columns">
        <div><h3>Forma provides</h3>${list(component.accessibility?.forma, context)}</div>
        <div><h3>Your application supplies</h3>${list(component.accessibility?.consumer, context)}</div>
      </div>
    </section>

    <section class="doc-section" id="responsive" aria-labelledby="section-responsive-title">
      <h2 id="section-responsive-title">Responsive behavior</h2>
      ${list(component.responsive, context)}
    </section>

    <section class="doc-section" id="motion" aria-labelledby="section-motion-title">
      <h2 id="section-motion-title">Motion</h2>
      ${list(component.motion, context)}
      ${when(weightRoot && !isPageLevel(component), () => `<h3>Motion weights</h3><p>Forma motion is physics-derived: perceived mass changes how a surface accelerates and settles, never what state it is in. Compare the three presentation weights of the same markup:</p>
      <div class="example-block" data-example="motion-weights"><div class="example-canvas"><!--live-->${motionWeightSpecimens(component, weightRoot)}<!--/live--></div></div>`)}
    </section>

    <section class="doc-section" id="guidance" aria-labelledby="section-guidance-title">
      <h2 id="section-guidance-title">Usage guidance</h2>
      <div class="doc-columns doc-columns--guidance">
        <div class="guidance guidance--do"><h3>Do</h3>${list(component.guidance?.do, context)}</div>
        <div class="guidance guidance--avoid"><h3>Avoid</h3>${list(component.guidance?.avoid, context)}</div>
      </div>
    </section>

    <section class="doc-section" id="related" aria-labelledby="section-related-title">
      <h2 id="section-related-title">Related components</h2>
      <ul class="related-list">
        ${join(component.related ?? [], item => {
          const target = context.bySlug.get(item.slug);
          return `<li><a href="${componentHref(context.rootPath, item.slug)}">${escapeHtml(target?.name ?? item.slug)}</a> <code>&lt;ef-${item.slug}&gt;</code><p>${inline(item.note, context)}</p></li>`;
        })}
      </ul>
    </section>

    <section class="doc-section" id="verification" aria-labelledby="section-verification-title">
      <h2 id="section-verification-title">Verification specimens</h2>
      <p>Generated fault-injection specimens expose content, spacing, color-cue, and reduced-effective-contrast risks. They screen presentation robustness as engineering screens without claiming human-subject validation.</p>
      <div class="example-block" data-example="verification"><div class="example-canvas"><!--live-->${stressSpecimens(component)}<!--/live--></div></div>
    </section>

    ${pager(context, component)}
  </main>
</div>`;
  return page({ title: component.name, rootPath: context.rootPath, body, description: `${component.name} (<${component.tag}>): ${component.summary}` });
};

export const componentRawFiles = component => [
  { file: rawPath("basic"), content: wrapTag(component.slug, component.pattern) + "\n" },
  ...component.examples.map(example => ({ file: rawPath(example.id), content: example.html.trim() + "\n" }))
];

export { codeViewer };
