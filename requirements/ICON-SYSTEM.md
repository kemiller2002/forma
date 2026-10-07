# Forma Icon System: v1 requirements

Status: accepted for reference implementation (2026-10-07). Follow-on integrations remain outstanding.

## Ownership and boundaries

- ICON-001 MUST store authoritative icon IDs, geometry, accessible descriptions, provenance and categories in Forma. The library remains independent of Echelon Foundry colors and customer brand identities.
- ICON-002 MUST retain Forma's zero-runtime contract. Rendering an icon MUST NOT require JavaScript, an icon font, a CDN, a custom-element registration, a sprite fetch or a runtime package.
- ICON-003 MUST produce deterministic, immutable-release-friendly SVG and safe inline HTML at build time; consumers pin an exact Forma release. No generated files are sources of truth.
- ICON-004 MUST allow safe brand/theme coloration with currentColor and documented CSS tokens. White-label packs MAY provide explicit namespaced overrides but MUST NOT silently replace canonical meanings.
- ICON-005 MUST define a 24×24 viewBox, consistent stroke (1.8 initial), round joins/caps, balanced padding and optical review at 16, 20, 24 and 32 CSS pixels.
- ICON-006 MUST keep stable semantic identifiers separate from visible text, state, permissions, workflow legality and application data. Breaking name or semantic changes require a major version or documented migration.
- ICON-007 MUST reject duplicate IDs, unknown geometry elements/attributes, unsupported provenance, executable markup, external URLs, scripts, foreignObject, embedded raster assets, unexpected namespace and unreviewed licensing at the compiler boundary.
- ICON-008 MUST support decorative SVGs that are hidden from assistive technologies, and independently labelled meaningful images. Application owners MUST provide the accessible name for icon-only controls; an icon name is NOT a substitute.
- ICON-009 MUST never communicate consequential status only by icon or color; require adjacent textual status or accessible description. Icons MUST remain understandable in forced colors, grayscale and print.
- ICON-010 MUST ensure pointer and keyboard operability are owned by semantic native controls, not decorative icons. Playwright MUST be able to locate controls by role and accessible name and observe authoritative state changes.
- ICON-011 MUST prohibit autonomous icon motion. State-based CSS motion requires declared purpose, bounded physics-derived motion, reduced-motion fallback and no animation-only completion signal.
- ICON-012 MUST provide a gallery with canonical/basic, context/semantic and mobile examples per public catalog component, including copyable HTML, provenance and usage limits.
- ICON-013 MUST ensure the same icon geometry can be embedded as standalone SVG or inline HTML in Forma Studio HTML exports and Folio's paginated HTML and PDF output. No fetches for print/export.
- ICON-014 MUST allow Studio to author an icon name and style tokens as structured document data, validate unknown names, preserve unknown future names without executing them, and round-trip through portable HTML export.
- ICON-015 MUST preserve grayscale and backgrounds-disabled semantics in Folio, and include 320px, zoom and forced-colors evidence.
- ICON-016 MUST provide byte-for-byte deterministic compiler outputs, package inclusion tests, positive/negative SVG security tests, accessible-control/browser checks, and representative raster/PDF visual comparisons.
- ICON-017 MUST document provenance and licensing per icon and reject third-party imports missing license/source details. The initial eight are new first-party reference paths, not a claim of exclusive rights to universal symbols.
- ICON-018 MUST include explicit downstream opt-in migration. Do not retrofit every glyph automatically, fork theme CSS, or silently advance pinned versions.

## First vertical slice (v0 reference, not full catalog release)

Eight original outline icons: `search`, `close`, `add`, `edit`, `success`, `warning`, `workflow`, `agent`. Source lives in `icons/registry.json`; geometry and metadata validate against `schemas/icon-registry.schema.json`. The compiler emits `dist/icons/<name>.svg`, `dist/icons/html/<name>.html` (inert `<ef-icon>` wrapper), and `dist/icons/registry.json`. Static CSS is part of Forma's component stylesheet. No runtime JS is published.

The reference slice must pass deterministic compilation and negative security tests before the icon component is advertised as production complete. The full public catalog entry, dedicated browser a11y/visual fixtures, packaging verification, icon gallery and integrations into Studio/Folio are follow-on gated work items.

## Acceptance gates

1. `npm run icons:check` succeeds and detects duplicate IDs, malicious geometry and nondeterministic output.
2. `npm run build` includes icon SVG, HTML and registry metadata under `dist/icons` without JavaScript.
3. `npm pack --dry-run` includes the icon outputs; existing pinned consumer imports continue to work.
4. A meaningful SVG may be labelled by its consumer; default inline markup is decorative and never becomes an unintended button.
5. Studio and Folio may only consume a versioned Forma package; no source duplication.
6. A future expansion agent adds/updates registry and evidence, never manually patches generated `dist` files.
