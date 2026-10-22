# RLP-001 independent layout decision rubric

Implemented by `harness/decisions.mjs`. Version 1.0, fixed before the pilot.

## Unit of analysis

An **authored layout statement** is one of:

- a CSS declaration in a `<style>` element or a `style` attribute (A, B, and any CSS written in C or D);
- a media, container or supports condition wrapping declarations;
- an application of a Forma layout primitive class (B);
- a relational `data-rl` node or `data-rl-*` attribute (C, D).

Base styles shared by all arms (`assets/base.css`) are not counted for any arm.

## Kinds

- **Explicit:** the author chose a layout value or behavior.
- **Derived (automatically resolved):** a decision the framework made because of another statement, such as a Forma primitive's gap or a relational container's clearance.
- **Corrective:** an explicit or uncertain statement present in the final page but not in the first validated draft.
- **Uncertain:** the statement affects layout but the rubric cannot classify it confidently (for example `border`, `line-height`, `writing-mode`, unknown properties). The evidence is preserved in `decision-evidence.json`.

## Categories

| Category | CSS properties | Forma | Relational |
|---|---|---|---|
| padding | `padding*` | `ef-surface`; `--ef-surface-space` | `data-rl-clearance*`; derived for containers |
| margin (separation) | `margin*`, `gap`, `row-gap`, `column-gap` | stack, cluster, grid gaps; `--*-gap`, `--*-space` | `data-rl-bond`; derived for every node |
| alignment | `align-*`, `justify-*`, `place-*`, `text-align`, `vertical-align` | cluster, actions, form-row | `data-rl-align`, `data-rl-align-edge`; derived |
| positioning | `position`, offsets, `inset*`, `z-index`, `float`, `transform` | none | `data-rl-anchor` |
| grouping | `display`, flex and grid structure, `order` | choosing a primitive class | choosing `data-rl` container or group |
| responsive | media or container conditions; `flex-wrap`; values with `auto-fit`, `auto-fill`, `minmax()`, `clamp()`, `min()`, `max()`, viewport units | grid, switcher, sidebar, cluster, form-row | `data-rl-flow`; derived line breaking |
| dimension | sizes, `min-*`, `max-*`, `aspect-ratio`, `flex-basis`, `overflow*`, `box-sizing` | measure, frame, bounded-overflow | `data-rl-min`, `-max`, `-fill`, `-size`, `-equal`, `-scroll` |
| correction | (corrective statements, counted separately) | | |

Non-layout properties (color, background, font, decoration, shadows, borders'
color, style and radius, and similar) are ignored.

## Independence rule (one rule for every arm)

A decision is a unique *(kind, category, property, value, context)*. A value
reused across selectors, elements or classes is one decision, because reusing
a value is consistency, not a new choice. Every CSS declaration is not
automatically an independent decision. Raw statement counts are reported as
a sensitivity measure.

## Measures per attempt

- Explicit agent decisions (final page)
- Automatically resolved (derived) decisions
- Corrective decisions (first draft → final)
- Uncertain statements
- Total independent decisions = explicit + uncertain
- Decisions per accepted interface = Σ total ÷ accepted attempts (per arm)

## Reliability

A stratified sample of statements from final pages is reclassified by an
independent reviewer agent that sees the statement text, its selector and its
context, but not the arm, attempt or classifier output. Agreement with the
classifier is reported as percent agreement and Cohen's κ for category and
for kind. Blinding is partial: relational attributes and Forma class names
reveal the arm family by their syntax.
