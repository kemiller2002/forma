---
id: ADR-0002
title: Zero-runtime HTML and CSS component architecture
status: accepted
date: 2026-09-22
supersedes: ADR-0001
amended_by: DF-FORMA-2026-0002
provenance:
  contributions:
    EXE-20261021T081649625Z-5b3dab6b:
      operations: [modified]
      at: 2026-10-21T08:41:08.125Z
      actor:
        kind: agent
        id: openai/codex
        provider: openai
        model: unknown
        runtime: codex
      reason: "Cross-reference the accepted metadata-only runtime diagnostic exception"
---

# Decision

The Echelon Design System components shall contain **HTML and CSS only**. The
package may include the metadata-only browser entry point defined by
`DF-FORMA-2026-0002`; it is not a component behavior runtime.

Specifically:

- canonical component structures are semantic HTML patterns;
- component appearance and microinteraction are CSS;
- DTCG token JSON remains the canonical design-token source;
- the F# token compiler remains build-time tooling only;
- Custom Elements, Shadow DOM, ElementInternals, Fable browser output, Lit, and component JavaScript are not part of the canonical package;
- documentation and consuming markup may use inert `<ef-*>` authoring wrappers around the canonical semantic HTML; these wrappers are not registered with `customElements.define()`, have no lifecycle or hidden behavior, and do not change semantic ownership;
- native browser behavior is preferred wherever it can satisfy the interaction;
- behavior beyond declarative HTML belongs to Limen/application code;
- the published `dist/` directory must contain no JavaScript or WebAssembly
  except the generated `runtime.js` version diagnostic; that module must not
  implement or initialize component behavior.

# Context

The initial pilot attempted a minimal Fable Custom Element runtime. Research and implementation showed that the browser already owns most of the behavior needed for the first component tier:

- checkbox/radio/range form behavior;
- switch semantics through a checkbox with `role="switch"`;
- disclosure through `details`/`summary`;
- popover through `popover` and `popovertarget`;
- modal dialog invocation through `commandfor`/`command` on the declared browser baseline.

Keeping component behavior out of the package makes the architectural boundary substantially clearer:

```text
HTML = semantic structure
CSS  = appearance + motion
Limen = browser/application behavior boundary
F# = behavior
Ordo = legal domain transitions
```

# Consequences

## Positive

- zero design-system browser runtime;
- zero component JavaScript payload;
- no hydration or custom-element upgrade phase;
- native form/keyboard/touch/accessibility behavior remains intact;
- CSP compatibility improves;
- server-rendered HTML is immediately useful;
- application behavior has one clear owner: Limen/application code;
- CSS motion cannot silently become semantic authority;
- components are usable from any server/framework/language that can emit HTML.
- public examples can use readable `<ef-switch>`, `<ef-dialog>`, and similar authoring tags without adding a browser runtime.

## Negative

- the design system cannot provide arbitrary behavior-rich components by itself;
- some advanced controls become markup/CSS contracts rather than turnkey components;
- cross-browser native rendering may vary;
- a fully custom filled slider track/live value bubble cannot be reliably synchronized from CSS alone;
- application integrations need explicit Limen behavior adapters for tabs, comboboxes, grids, drag/reorder, and similar patterns.

# Slider conclusion

The slider intentionally keeps native range behavior and `accent-color` rather than recreating the track/thumb with JavaScript.

This sacrifices some pixel-level uniformity but preserves stronger browser ownership of keyboard, touch, form, and assistive-technology behavior.

# Advanced declarative patterns

The pilot shall validate:

- switch;
- slider;
- segmented radio control;
- details/summary disclosure;
- popover;
- declarative modal dialog.

The capability matrix determines where Limen becomes necessary.

# Rejected alternatives

## Fable Custom Elements

Superseded. Fable remains useful for application/Limen behavior but not for canonical design-system components.

This rejection concerns **registered behavioral Custom Elements**. It does not prohibit inert `<ef-*>` wrapper tags whose only purpose is a stable authoring/documentation surface around native semantic HTML.

## Lit or another component runtime

Rejected because it violates the zero-runtime component requirement.

## Custom Elements with tiny handwritten JavaScript

Rejected because the rule is architectural, not a bundle-size target.

## CSS-only simulation of behavior not provided by HTML

Rejected where it would produce brittle keyboard, focus, or accessibility semantics.

# Validation

The decision is validated only if:

1. `dist/` contains no .mjs, .wasm, inline scripts, or executable component
   assets, and its only .js file is the metadata-only `runtime.js` allowed by
   `DF-FORMA-2026-0002`;
2. package production dependencies are empty;
3. pattern files contain no `script` or `javascript:`;
4. native form controls pass keyboard/form/reset tests;
5. popover/disclosure/dialog work declaratively on the supported browser matrix;
6. reduced-motion and forced-colors behavior pass;
7. automated accessibility scans pass;
8. ROS validation passes.
