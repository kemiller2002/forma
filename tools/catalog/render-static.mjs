// Static content pages that are not projections of the component catalog.
import { page } from "./render-layout.mjs";

export const renderBranding = () => {
  const brandSample = () => `<div class="brand-demo__content">
    <span class="brand-demo__eyebrow">Operational review</span>
    <h2>Release readiness</h2>
    <p>The same semantic Forma markup inherits identity from its nearest brand scope.</p>
    <div class="brand-demo__accent">
      <strong>12 obligations</strong>
      <span>3 require evidence before release.</span>
    </div>
    <button type="button">Review obligations</button>
  </div>`;
  
  const brandingBody = `<main id="main" class="content-section brand-lab">
    <span class="eyebrow">White label / skin system</span>
    <h1>Brand Laboratory</h1>
    <p class="lead">Brand identity enters Forma through a versioned manifest that compiles to scoped semantic tokens. Skins adjust presentation without changing identity, semantics, or application behavior.</p>
  
    <section class="brand-lab__section">
      <div class="section-heading">
        <div><span class="eyebrow">Scoped identity</span><h2>One component contract. Multiple brands.</h2></div>
        <p>These examples use identical inner markup. Only the brand and theme scopes differ.</p>
      </div>
      <div class="brand-demo-grid">
        <article class="brand-demo-wrap"><p class="category-label">Echelon / light</p><section class="brand-demo" data-ef-brand="echelon">${brandSample()}</section></article>
        <article class="brand-demo-wrap"><p class="category-label">Example Harbor / light</p><section class="brand-demo" data-ef-brand="example-harbor">${brandSample()}</section></article>
        <article class="brand-demo-wrap"><p class="category-label">Example Harbor / dark</p><section class="brand-demo" data-ef-brand="example-harbor" data-ef-theme="dark">${brandSample()}</section></article>
      </div>
    </section>
  
    <section class="brand-lab__section">
      <div class="section-heading">
        <div><span class="eyebrow">Presentation only</span><h2>Skins are independent of identity.</h2></div>
        <p>Density and shape can change while the brand's semantic color and typography remain authoritative.</p>
      </div>
      <div class="brand-demo-grid">
        <article class="brand-demo-wrap"><p class="category-label">Compact</p><section class="brand-demo" data-ef-brand="echelon" data-ef-skin="compact">${brandSample()}</section></article>
        <article class="brand-demo-wrap"><p class="category-label">Comfortable</p><section class="brand-demo" data-ef-brand="echelon" data-ef-skin="comfortable">${brandSample()}</section></article>
        <article class="brand-demo-wrap"><p class="category-label">Square</p><section class="brand-demo" data-ef-brand="echelon" data-ef-skin="square">${brandSample()}</section></article>
      </div>
    </section>
  
    <section class="brand-lab__section brand-boundary">
      <span class="eyebrow">Boundary</span>
      <h2>Presentation changes. Authority does not.</h2>
      <p>Runtime selection, persistence, remote manifest loading, or an interactive editor belong to the consuming application through Limen. Legal state and transitions remain Ordo/application authority. Forma emits static CSS and preserves its zero-runtime contract.</p>
      <a class="ef-button" href="../agents/">Read the agent contract</a>
    </section>
  </main>`;
  return page({ title: "Brand Laboratory", rootPath: "../", body: brandingBody });
};

export const renderAgents = () => {
  const agentBody = `<main id="main" class="content-section agent-page">
    <span class="eyebrow">Agent operating contract</span>
    <h1>Use Forma as a presentation boundary, not an application runtime.</h1>
    <p class="lead">Agents reuse canonical patterns, preserve native semantics, and leave behavioral and domain authority in the systems that own it.</p>
  
    <h2>Required sequence</h2>
    <ol>
      <li>Identify the user task and domain state.</li>
      <li>Find the closest canonical pattern under <code>patterns/</code>.</li>
      <li>Use its public <code>&lt;ef-…&gt;</code> authoring tag around the canonical pattern.</li>
      <li>Preserve its semantic elements, class structure, labels, IDs, and ARIA relationships.</li>
      <li>Supply application content and rendered state.</li>
      <li>Put non-native behavior in the consuming application/Limen.</li>
      <li>Keep legal transitions, permissions, obligations, and scoring in Ordo/application state.</li>
      <li>Run repository and site verification before claiming completion.</li>
    </ol>
  
    <h2>Boundary ownership</h2>
    <div class="table-scroll" role="region" aria-label="Boundary ownership table" tabindex="0">
      <table>
        <thead><tr><th>Concern</th><th>Owner</th></tr></thead>
        <tbody>
          <tr><td>Typography, color, spacing, layout, responsive presentation</td><td>Forma</td></tr>
          <tr><td>Checked/open/required/disabled and native state</td><td>Native HTML rendered by the application</td></tr>
          <tr><td>Async search, ranking movement, rule editing</td><td>Application / Limen</td></tr>
          <tr><td>Legal transitions, capabilities, obligations, permissions</td><td>Ordo/application domain state</td></tr>
          <tr><td>Scores and assessment interpretation</td><td>Application domain logic</td></tr>
        </tbody>
      </table>
    </div>
  
    <h2>Do not</h2>
    <ul>
      <li>Register Forma's <code>&lt;ef-…&gt;</code> authoring tags with <code>customElements.define()</code>; they are intentionally inert wrappers.</li>
      <li>Add runtime JavaScript or WebAssembly to Forma.</li>
      <li>Replace native HTML only to obtain a custom appearance.</li>
      <li>Create duplicate components for presets an existing semantic pattern represents.</li>
      <li>Infer domain meaning from color, order, or CSS state.</li>
      <li>Make drag, hover, pointer input, or color the only usable path.</li>
      <li>Fork a pattern in an application merely to change visual styling.</li>
    </ul>
  
    <h2>Mobile is part of the component contract</h2>
    <p>Every Forma pattern must recompose at 320 CSS px without changing its semantic meaning or domain authority.</p>
    <ul>
      <li>No essential page-level horizontal scrolling.</li>
      <li>No hover-only, drag-only, pointer-only, or color-only interaction.</li>
      <li>Critical actions remain reachable when layouts collapse.</li>
      <li>Side-by-side comparisons stack with explicit labels.</li>
      <li>Tables provide a usable narrow projection when ordinary columns cannot fit.</li>
      <li>Target sizes should be approximately 44×44 CSS px where practical.</li>
      <li>Deep-link and URL-backed state keeps the same meaning when its visual control changes form.</li>
      <li>Reduced-motion and forced-colors behavior still applies on mobile.</li>
    </ul>
  
    <h2>Character grids</h2>
    <p>For terminal-style, keyboard-first screens use the CharacterGrid family (<code>patterns/character-grid*.html</code>). Declare cell coordinates, write runs in row-major order, keep fields native, and leave key mapping, Enter/Clear/Reset/PF processing, transitions, and reveal orchestration to Limen/application code. See <code>docs/CHARACTER-GRID-AUTHORING.md</code>.</p>
  
    <h2>Use the catalog</h2>
    <p>Every component page answers "what is the smallest correct HTML?" in its <strong>Basic example</strong>, then shows scenario and mobile examples, the native attributes, the CSS hooks derived from the shipped stylesheet, states, accessibility responsibilities, and related components. Pages share one structure: learn one, read all.</p>
    <ul>
      <li><a href="../components/">All components A–Z</a> and one overview page per family.</li>
      <li><a href="../site-manifest.json">site-manifest.json</a>: every component's name, tag, family, summary, behavior owner, canonical pattern path, documented attributes, CSS hooks, keyboard behavior, related components and docs URL.</li>
      <li>To document a new component, follow <code>docs/CATALOG-AUTHORING.md</code>; <code>npm run catalog:check</code> fails until the entry is complete.</li>
    </ul>
  
    <h2>Build and verify</h2>
    <pre><code>npm install
npm run build
npm run check
npm run catalog:check
npm run site:check
./ros registry check
./ros validate</code></pre>
  
    <p>The repository source of truth for this contract is <code>docs/AGENT-USAGE.md</code>.</p>
  </main>`;
  return page({ title: "Agent use", rootPath: "../", body: agentBody });
};
