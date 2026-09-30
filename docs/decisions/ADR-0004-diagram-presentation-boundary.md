---
id: ADR-0004
title: Forma owns a small presentation-only diagram family; Studio owns graph behavior and editor chrome
status: accepted
date: 2026-09-30
supersedes: null
related:
  - requirements/OBJECT-METADATA-AND-DIAGRAM-PRESENTATION.md
  - patterns/diagram.html
  - tests/browser/diagram.spec.mjs
work_item: GH-52
---

# Decision

Forma publishes a **presentation-only diagram family** in
`src/styles/components.css`, with `patterns/diagram.html` as its reference. It
is the first implementation slice (FMD-M1): nodes, connectors, node metadata,
a key, and authored color hooks. Forma Studio and other consumers render
production and exported diagrams with these public contracts. They do not
create private substitutes. A visual this family does not cover is an explicit
capability gap: raise it as a Forma issue.

Forma never owns graph storage, geometry, routing, hit testing, selection,
dragging, command history, workflow execution, domain validation, named-style
resolution, or metadata-to-appearance mapping.

## Ownership

| Visual or concern | Owner | Contract |
|---|---|---|
| Diagram container, caption, scrollable canvas | Forma | `figure.ef-diagram`, `.ef-diagram__viewport` (focusable, named group), `.ef-diagram__canvas` |
| Node box, kind text, label, metadata region | Forma | `.ef-diagram-node`, `__kind`, `__label`, `__meta` (a `dl`) |
| Node shape variant | Forma presentation, chosen by the consumer | `data-ef-shape="rectangle"` (default), `rounded`, `pill` |
| Connector paint, line style, arrowhead, label | Forma | `path.ef-diagram-connector`, `data-ef-line="solid"` (default), `dashed`, `dotted`; `marker.ef-diagram-marker`; `.ef-diagram-connector__label` |
| Relationship text equivalent | Forma structure, consumer content | `ol.ef-diagram__relations`, one item per connector, in reading order |
| Key / legend | Forma structure, consumer content | `dl.ef-diagram-legend`, `.ef-diagram-legend__swatch` |
| Authored node color | Consumer-resolved value, Forma-rendered | `--ef-diagram-fill`, `--ef-diagram-stroke`, `--ef-diagram-accent`, `--ef-diagram-foreground` |
| Authored connector color and weight | Consumer-resolved value, Forma-rendered | `--ef-diagram-connector-stroke`, `--ef-diagram-connector-width` |
| Geometry | Consumer (Studio layout) | `--ef-diagram-x`, `--ef-diagram-y`, `--ef-diagram-w` in canvas px; `--ef-diagram-canvas-w`/`-h`; SVG `viewBox` and path data |
| Semantic kind, state, metadata values, which fields are visible | Consumer profile / application | Text content only; never inferred from color, shape, or line style |
| Metadata-to-appearance mapping, named styles, inheritance, precedence | Consumer profile / Studio | Resolved values arrive as the custom properties above |
| Selection boxes, handles, route previews, guides, marquee, drag and connection targets | Studio only (editor chrome) | Never part of exported output; must not reuse `ef-diagram*` classes |
| Focus treatment | Forma foundations | Independent of authored color (`:focus-visible` ring) |
| Paging and tiling for print | Folio / consumer | Forma only keeps boundaries, kinds and line styles legible in print |

## Export path

An exported diagram is plain HTML and inline SVG that uses only the classes,
attributes and custom properties above, plus the consumer's resolved geometry
and color values. It needs no Forma runtime, and editor chrome is removed
before export. Because every relationship also appears in
`.ef-diagram__relations`, an exported diagram stays understandable without the
SVG, without color, in forced colors, and in grayscale or backgrounds-off print.

# Context

Forma Studio (kemiller2002/forma-studio#4) needs production diagram rendering,
and its architecture forbids a parallel private design system. The
requirements in `requirements/OBJECT-METADATA-AND-DIAGRAM-PRESENTATION.md`
(from #53 / PR #54) set the boundary: presentation only (FMD-DIA-001/002),
color is authored data kept separate from semantics (FMD-COLOR-009/010), and
editor chrome stays in Studio (FMD-DIA-007).

# Alternatives considered

- **A Forma graph component with layout and routing.** Rejected. It violates
  FMD-DIA-002 and FMD-STUDIO-007, and would make Forma a graph editor.
- **Studio-private diagram CSS.** Rejected. It is the parallel design system
  that #52 exists to prevent.
- **One class per consumer style or status (`.ef-node--approved`).**
  Rejected. It bakes semantics into appearance (FMD-COLOR-010) and forces a
  Forma release for every consumer style (FMD-STYLE-003).
- **Logical (`inset-inline-*`) node placement.** Rejected. SVG coordinates are
  physical, so logical placement would split nodes from their connectors in
  right-to-left documents.

# Consequences

## Positive

- Studio maps each profile element kind to a stable Forma contract
  (FMD-STUDIO-001) and passes only resolved presentation values.
- Removing an authored property restores the Forma token default
  (FMD-RESOLVE-006).
- The distinctions the tests rely on (kind text, line style, relationship
  text, boundaries) survive forced colors, grayscale and print.

## Negative and deferred

- There are three shapes. Ellipse, diamond, and other FMD-SHAPE-002 shapes,
  plus groups, swimlanes, phase dividers, ports, and pattern fills, are
  **deferred capability gaps**. Each needs its own issue, fixture and tests
  before Studio relies on it.
- On narrow screens the canvas scrolls inside its own region rather than
  reflowing, because geometry belongs to the consumer. The relationship list
  still reflows to 320px.
- Contrast between an authored fill and an authored foreground is the
  consumer's responsibility (FMD-EDIT-005). Forma does not alter a fixed
  authored color.

# Validation

`tests/browser/diagram.spec.mjs`: named items and one relationship per
connector; authored override and reset; kind, state and line style survive
forced colors; focus unchanged by authored fill; print boundaries and line
styles; 320px bounded scrolling; 200% text and text spacing; physical geometry
under RTL; axe in light, dark and forced colors.
