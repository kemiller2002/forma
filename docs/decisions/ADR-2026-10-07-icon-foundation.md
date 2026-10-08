# ADR: Forma owns icons as compiled, static presentation assets

Date: 2026-10-07
Status: Accepted for foundation implementation; integration deferred to work items.

## Context

Forma 0.4.1 is an intentionally zero-runtime design system with native HTML patterns, static CSS, scoped brands and pinned release assets. The public catalog identifies icon and icon button as a gap. Studio exports deterministic HTML; Folio prints and exports documents; both need reusable icons without a runtime fetch.

## Decision

Forma owns a semantic icon registry, vector geometry and a build-time SVG compiler. The public surface consists of static SVGs, pre-rendered inline HTML and CSS. `<ef-icon>` is an inert authoring wrapper, not a custom element registered with `customElements.define`. No action, state or authorization is inferred from an icon.

A single 24-unit outline grammar is the initial drawing style. Geometry remains brand-neutral via `currentColor`; applications use ordinary CSS variable scopes. Source metadata includes stable name, category, suggested label, search keywords and reviewed provenance. Generator outputs are immutable build artifacts.

The first eight icons demonstrate the full compiler path. Later, Studio provides authoring and lookup, Folio uses embedded source for deterministic printing, and the public catalog provides a gallery and mobile examples.

## Alternatives rejected

- `<forma-icon name="...">` with a required JavaScript registry: breaks zero-runtime and complicates static document exports.
- SVG icon font: poor per-glyph semantics, weaker print predictability, load/order problems.
- Network/CDN sprite: offline and print fragility.
- Separate icon repository: premature versioning and ownership complexity.
- Hand copying third-party icon packs: weak licensing provenance and visual coherence.

## Consequences

Consumers may embed the generated inline markup, or use standalone SVGs with application-authored alternate text. An icon-only button must keep a native button and a genuine accessible name. The compiler rejects unsafe geometry. The full catalog, publishing contract tests and Studio/Folio integration must be completed before calling the feature fully shipped.

A future runtime adapter may replace icon names with precompiled markup, but must live outside Forma core, avoid HTML injection and preserve identical semantics.
