# LCE-001: Adversarial layout research and constraint enforcement

Work item `LCE-001` · experiment record `research/experiments/EX-FORMA-2026-0004--lce-001-layout-constraint-enforcement.md` · intake `.praxis/inbox/documents/2026-10-27-LCE-001.md`

Baseline: Forma `main` at `28d1101` (identical diagram CSS to the published `@echelon-foundry/design-system` 0.9.0; workflow engine source unchanged since 2026-10-01, before `@echelon-foundry/forma-workflow` 1.0.0). Browser: Chromium 153.0.8010.12, device scale 1. Every number below comes from files in `results/`; nothing is estimated after the fact.

## Executive summary

**The question.** Can Forma guarantee that components satisfy their layout constraints before rendering?

**What Forma guaranteed before.** Very little:

- Box components were checked only by visual examples.
- The workflow diagram engine (`Forma.Workflow`) sized nodes from a character count of 8 px per character. It assumed Latin text at 16 px and ignored the node's shape.
- The CSS let the content outgrow the size the engine had allocated.

The adversarial generator found errors in **285 of 500** cases at seed `1ce0001`. Each of those cases broke at least one hard constraint. Of the errors, 113 cases were Forma's own failures; the rest were controlled CSS experiments or authored geometry that could never fit. On the challenge set, **193 of 200** cases had errors, and so did **all 15** variants of the three real Causa causal diagrams.

The Causa variants were confirmed twice: with this branch's engine, and through the exact pinned packages the Causa app embeds. Each variant broke seven constraints:

- text cut by pill corners
- nodes overlapping
- connectors running through nodes
- connectors starting inside nodes
- labels drawn on nodes
- content outside the canvas
- nodes taller than their allocated geometry

**What changed.** Forma now has:

- A shape-geometry model (`LayoutGeometry`).
- A script-aware, text-spacing-aware text estimate (`LayoutText`).
- Shape-aware node sizing.
- Obstacle-aware connector routing.
- Collision-resolving label placement.
- rem-relative diagram geometry.
- Static layout validation (`LayoutCheck`).
- Radius bounds derived from padding for the pill node and the brand-controlled marketing card, badge and button.
- `overflow-wrap: anywhere` for marketing buttons and badges.
- A type context the diagram pins for itself.
- A wizard-step indicator that widens instead of overflowing.

**Result on identical seeds.** Cases with a Forma-attributable error fell:

| run | baseline | corrected |
|---|---:|---:|
| `1ce0001` | 113 | 4 |
| unseen `4ce0004` | 127 | 10 |
| challenge `2ce0002` | 125 | 0 |
| unseen challenge `3ce0003` | 120 | 6 |

All 15 Causa variants now satisfy every constraint.

The remaining diagram failures come from authored geometry that cannot hold its content. They are now reported before rendering by `LayoutCheck`: 51 of 51 failing diagram cases in the unseen challenge, and 65 of 67 in the main batch.

**The answer to the research question.**

- **Static constraints can prevent most invalid diagram layouts.** They do so for the typography envelope Forma commits to: browser text enlargement and WCAG 1.4.12 text spacing.
- **They can report almost all the rest before rendering.**
- **They cannot guarantee rendered validity.** Fonts and user styles decide the final text size, so only browser measurement is authoritative. The probe and the regression fixtures are that measurement.

Forma does **not** guarantee universally valid layouts, and this report does not claim it.

## Method

`tests/layout/Forma.Layout.Probe` is an F# probe. It has no package dependencies beyond `Forma.Workflow`.

**Generation.** Every case property is drawn from SplitMix64 seeds derived from (run seed, family, index, property). Any case therefore regenerates from the seed beside its finding.

**Families.** Each run holds 100 cases per family:

| family | what it exercises |
|---|---|
| rectangle | square Forma components, bare boxes, rectangle nodes |
| rounded | radius 0, 2, 4, 8, 16, 24, 32 px, 50%, 999 px, and elliptical 24/8 and 8/24 on marketing cards, badges and buttons; bare boxes; rounded and pill nodes |
| circle | wizard step, tooltip trigger, circular bare boxes, ellipse and diamond nodes, authored circles |
| nested | badge or button in a card, rounded in rounded, diagram in a card, node in a bare box |
| responsive | viewports 320, 375, 768 and 1280 px; root text 100–200%; letter spacing up to 0.12 em; line height 1.0–2.0; weight 700; diagram zoom 0.5–2 |

The `challenge` family is round two, built to defeat the fixes:

- fan-in
- sentence-length labels
- swimlanes
- cycles and self-loops
- status rows
- extreme text
- 200–300% text with WCAG spacing
- narrow authored widths
- mixed shapes in the down direction
- Causa-shaped graphs

**Content.** Empty, one character, short, medium, long and extreme paragraphs, long words, unbroken strings, punctuation, numbers, URLs, paths, identifiers, white space, accented text, CJK, Hebrew, Arabic, emoji with ZWJ and skin tones, and combining marks.

**Fonts.** Each run checks that every script renders with a real glyph, against an unassigned code point. All seven scripts rendered in every run.

**Measurement.** `tests/layout/measure.mjs` only observes. It records:

- border boxes
- the line boxes of every text node, from `Range.getClientRects`
- computed radii, borders, padding, overflow and font
- connector paths, mapped through `getScreenCTM`, which handles zoom

**Evaluation.** Every constraint is evaluated in F# against the *visible* boundary. That boundary uses:

- the CSS radius normalisation (overlap scaling)
- the inner border curve
- elliptical corners
- Forma's rotated `::before` diamond

**Minimisation and storage.** Delta debugging batches single-step reductions into one browser run per round, up to 6 rounds. Each confirmed defect is stored with its seed, its minimisation trail and a disposition in `tests/layout/fixtures/`.

## Component inventory

| component | geometry | dimensions | padding | text | overflow | owner |
|---|---|---|---|---|---|---|
| `.ef-diagram-node` (rectangle, rounded) | box, 12 px radius | engine-allocated width; CSS `min-block-size` grows | 12 px, 2 px border, 6 px accent | wraps, `overflow-wrap: anywhere` | grows past allocation | Forma.Workflow + Forma CSS |
| `.ef-diagram-node[pill]` (Start/End) | stadium | as above | 12 / 24 px | wraps | grows; **curve cut text** | same |
| `.ef-diagram-node[ellipse]` (Event) | ellipse (50%) | width; height ×1.3 estimate | 1 rem / **14% (under the 14.65% inscribed bound)** | centred | grows | same |
| `.ef-diagram-node[diamond]` (Decision) | rotated `::before` | square | **20% (inscribed square needs 25%)** | centred | grows, then stops being square | same |
| `.ef-diagram-connector__label` | box | `nowrap` | 4 px inline | one line | **placed top-left at a midpoint, no collision check** | Forma.Workflow |
| marketing `.ef-card`, `.ef-badge`, `.ef-button` | box, **brand radius `--ef-shape-radius`, unbounded** | intrinsic / grid | tokenised | wraps | visible | Forma marketing CSS + brand |
| `.ef-wizard__steps li > span` | circle, 1.75 rem fixed | fixed | none | one glyph | **overflows** | Forma CSS |
| `.ef-tooltip__trigger` | circle, 2.75 rem minimum | minimum | none | one glyph | crosses the curve beyond one glyph | Forma CSS |
| `.ef-alert`, `.ef-metric-card`, `.ef-callout` | square box | intrinsic | 16 px | wraps | visible | Forma CSS |

Shared code: every diagram node shares one sizing function and one CSS block. The three marketing components share `--ef-shape-radius`. One correction in each place covers several components.

## Adversarial results

Errors only; warnings are counted in the summaries.

| run | cases | with an error, baseline → corrected | Forma-attributable | authored geometry that cannot fit | controlled experiment or consumer host |
|---|---:|---:|---:|---:|---:|
| batch `1ce0001` | 500 | 285 → 133 | 113 → 4 | 89 → 62 | 83 → 67 |
| batch `4ce0004` (unseen) | 500 | 274 → 109 | 127 → 10 | 76 → 48 | 71 → 51 |
| challenge `2ce0002` | 200 | 193 → 39 | 125 → 0 | 68 → 39 | 0 |
| challenge `3ce0003` (unseen) | 200 | 194 → 51 | 120 → 6 | 74 → 45 | 0 |
| Causa diagrams (15 variants) | 15 | 15 → 0 | 15 → 0 | 0 | 0 |
| Causa through published packages | 15 | 15 (0.9.0 / 1.0.0) → 0 (this branch) | | | |

**How cases are attributed.**

- **Controlled experiment** cases are bare CSS boxes (`probe`) with chosen radius, padding and size. They measure geometry and are not Forma components.
- **Consumer host** cases are Forma components placed by a consumer in an arbitrary rounded container whose padding is smaller than its radius. The parent owns that constraint.
- **Authored geometry** cases are diagram nodes whose author fixed a width or height that cannot hold the content.

Per-constraint cases, batch `1ce0001`, baseline → corrected:

| constraint | baseline | corrected |
|---|---:|---:|
| `boundary.corner` (text crosses the visible curve) | 151 | 35 |
| `allocation.exceeded` (node taller than its allocation) | 188 | 62 |
| `canvas.containment` | 108 | 28 |
| `label.overlaps-node` | 73 | 12 |
| `contain.overflow` | 56 | 37 |
| `connector.crosses-node` | 54 | 4 |
| `separation.nodes` | 46 | 7 |
| `connector.starts-inside` | 39 | 14 |
| `nest.containment` | 21 | 20 |
| `label.overlaps-label` | 10 | 0 |
| `viewport.overflow`, `a11y.min-text`, `a11y.target-size`, `determinism` | 0 | 0 |

Every corrected count that is not zero belongs to an authored-geometry, controlled-experiment or consumer-host case, except the 4 cases listed under remaining research. Challenge `contain.overflow` rose from 16 to 19 and from 14 to 17. These are all authored narrow nodes: where the old pill curve cut the text, the text now stays inside the shape and overflows the authored box instead. `LayoutCheck` reports every one of them.

**Static against rendered.** These are diagram cases in the corrected runs. Columns: both reported / rendered only / static only / neither.

| run | both | rendered only | static only | neither |
|---|---:|---:|---:|---:|
| `1ce0001` | 65 | 2 | 3 | 190 |
| `4ce0004` | 52 | 4 | 4 | 199 |
| `2ce0002` | 38 | 1 | 1 | 160 |
| `3ce0003` | 51 | 0 | 0 | 149 |

- **Rendered only.** Every miss used line height 2.0, beyond the WCAG 1.4.12 envelope of 1.5 that the layout reserves, except two:
  - one fan-in crossing at zoom 2;
  - one status-row case, which was traced to the estimate and corrected before the final candidate run.
- **Static only.** These are authored sizes that fit default text but not the reserved WCAG text-spacing room. The static check is deliberately conservative there.

## Rounded-corner findings (Section 5.2)

**Controlled sweep.** Same content and a 200 px box with a 2 px border; the radius was raised step by step for each padding. File: `results/*/sweeps/sweeps.json`.

| padding | first radius whose text crosses the curve | content-box bound `(2+√2)·p + border` |
|---:|---:|---:|
| 4 px | 22 px | 16 px |
| 8 px | 40 px | 32 px |
| 12 px | none up to 64 px | 48 px |
| 16 px | none up to 64 px | 64 px |
| 24 px | none up to 64 px | 84 px |

- **A single padding does not work for every radius.** The safe radius grows linearly with padding.
- **The analytic bound on the content box is conservative by about 25%.** The line box carries half-leading, so the first line's glyph box sits a few pixels below the content edge. Forma's corrections use the conservative content-box bound, with clearance.

**Failures found in Forma.**

1. **Pill nodes.** `border-radius: 999px` becomes half the height on any multi-line node, and the curve cut through text. This affected every Causa outcome node and the pill-length sweep from 6 words on. It is now `min(999px, pi + pb·(1+√2) − c·(1+√2) + b)`, about 45 px, in spacing tokens. A short pill is still a stadium; a tall one keeps the largest radius that stays 4 px clear. The pill sweep and Causa now pass.
2. **Brand radius on marketing card, badge and button.** `--ef-shape-radius` had no bound. A pill or 50% brand radius cut multi-line content, by up to 79.7 px in the case found. It is now capped by each component's own padding, for example `p·3.414 − 2.414px` on the card. A single-line badge is still a full pill.
3. **Ellipse.** The inline padding was 14% against the inscribed bound of 14.65%, and the height came from a ×1.3 guess. Now the padding is 14.65% plus clearance, and the height is solved from `(hw/a)² + (hh/b)² ≤ 1`.
4. **Diamond.** The padding of 20% put the content corners outside the diamond; the inscribed square needs 25%. Overflow also broke `aspect-ratio`. Now the padding is 25% plus clearance, and the side is searched until the content fits the inscribed square.
5. **Wizard step and tooltip trigger.** Multi-character text crossed the curve: "1.5k", "100", a path.
   - The step indicator now widens into a pill.
   - The tooltip trigger is documented as a single-glyph contract. A widening fix broke the catalog's hover interaction test, so it was reverted, and the rendered check still reports the case.

## Root causes

| defect | layer | cause |
|---|---|---|
| Nodes outgrow their allocation; neighbours overlap; connectors start inside nodes and cross them; labels land on nodes | **Forma.Workflow** (F# layout engine) | A character-count height estimate (Latin only, 16 px root, no letter or line spacing, wrong box model: missing grid gaps and the accent border, kind line not wrapped) and shape-blind sizing. The CSS `min-block-size` lets content grow past the allocation. |
| Labels on nodes and labels outside the canvas | Forma.Workflow | The label is anchored by its top-left at a segment midpoint, with a fixed 96 px rank gap and no collision check. Long `nowrap` labels run off the canvas. |
| Connectors through unrelated nodes | Forma.Workflow | Routing always used the midpoint channel, which falls inside an intermediate rank. |
| Diagram broken by text enlargement | Forma.Workflow + Render | Geometry was emitted in px while the text is rem-based. |
| Text cut by curves | **Forma CSS** | Pill radius, ellipse and diamond padding, and the unbounded brand radius. |
| Diagram inside `.ef-site` outgrows its layout | Forma marketing CSS | Site prose defaults (h3 size, p margin) in a later cascade layer reached into the diagram. |
| Marketing button or badge overflow with long words | Forma marketing CSS | `overflow-wrap: break-word` does not shrink the min-content width inside `inline-flex`. |
| Invalid sizes accepted silently | **Forma Studio** (and the `Forma.Workflow` editor) | No layout validation on diagram geometry (see below). |
| Causa outcome text cut and the graph overlapping | Application symptom of the Forma.Workflow and Forma CSS causes | The Causa app's `graphDocument` is correct: it supplies no coordinates, as WDL-002 requires. |
| Limen | **none found** | See below. |
| Browser | none | Chromium behaved to specification. The radius sweep matches CSS Backgrounds 3 §5.5. |

## Corrections

Corrections in `src/workflow/Forma.Workflow` (F#):

- **`LayoutGeometry.fs`**
  - CSS radius normalisation, the inner-border inset, curved and rotated boundary containment (`excess`, `rectExcess`), the inscribed rectangle, segment crossing, and the safe inline padding.
  - Used by the engine, by `LayoutCheck` and by the probe.
- **`LayoutText.fs`**
  - Per-class em advances taken as the widest of four sans fonts measured in Chromium.
  - CJK and emoji are wide; combining, ZWJ and variation characters have no width.
  - CJK break opportunities; greedy wrapping with `anywhere` breaks.
  - `withTextSpacing` reserves WCAG 1.4.12 room: line height 1.5, letter spacing 0.12 em, word spacing 0.16 em.
- **`Layout.fs`**
  - The box model mirrors the CSS.
  - Shape-aware `requiredHeight`: box, ellipse equation, diamond inscribed square.
  - Rank gap sized for the widest label.
  - Forward connectors try the midpoint, the source side, the target side, then a lane outside the obstacles, and take the first route that crosses nothing.
  - Labels are placed in document order at the first free point along their route.
  - Labels have a 12 rem maximum width and wrap.
  - The automatic layout is translated so nothing has a negative coordinate.
- **`LayoutCheck.fs`** (new public module)
  - `layout.node.too-small`, `layout.node.too-narrow`, `layout.node.overlap`, `layout.connector.crosses-node`, `layout.label.overlap`, `layout.canvas.too-small`.
- **`Render.fs` and `Markup.rem`**
  - Diagram geometry is emitted in rem. 1 rem is 16 canvas units, so geometry scales with the text it holds.

Corrections in `src/styles/components.css`:

- pill radius bound
- ellipse and diamond padding
- the diagram's pinned type context
- connector labels wrap at 12 rem
- the step indicator widens

Corrections in `src/marketing`:

- the card, badge and button radius bound
- `overflow-wrap: anywhere` on buttons and badges
- `revert-layer` at `.ef-site .ef-diagram`

## Comparative results (Section 10)

| metric | outcome |
|---|---|
| Invalid layouts | Cases with an error fall by 53–60% overall and by 80–100% on the challenge set. Forma-attributable cases fall by 92–100%. |
| Text overflow | `contain.overflow` falls for components. It rises slightly for authored diagram nodes; see above. |
| Corner intersections | Eliminated in the supported cases: Forma components and auto-sized nodes. They remain for bare CSS experiments and documented contract limits. |
| Connector collisions | `connector.crosses-node` 54 → 4 and 112 → 3; every remaining case is authored geometry or the one zoom-2 fan-in. |
| Runtime cost | Browser rendering of 500 cases: 10.9 s in both. End to end, including F# generation, static `LayoutCheck` and evaluation: 16.2 s → 17.2 s. Static `LayoutCheck` resolves the layout once more per document. |
| Layout stability and determinism | 0 determinism findings in every run; each page was rendered twice. Zoom 0.5–2: maximum node-size drift 0.00 px, 0 errors (baseline: 0.06–1.32 px drift, 4 errors at every zoom). |
| Accessibility | 0 `a11y.*` findings. Text 100–300% passes for the diagram and the step indicator. The cost is about 25% more node height to reserve WCAG text-spacing room. |
| Existing suites | Forma.Workflow 75/75 tests (17 new). `test:css` 44/44. Diagram, marketing and workflow browser specs passed (47 and 24). `site:check`: see the handoff. Goldens regenerated for the intended geometry change. |

Constraint-driven layout was better than the baseline on every rendered-geometry metric measured. It was not better on compactness: nodes are taller by design. Visual review of a node's appearance (`results/screenshots/`) is limited to the Apollo 1 before and after pair.

## Forma Studio (Section 11)

Studio's engine was run against invalid configurations (`results/studio/`). It **silently accepted** all five:

- a 600-character label
- a paragraph label in an 8×8 node
- overlapping nodes
- a resize to 8×8
- a rename to a much longer label

`Validation.run` reported only `workflow.start.missing`. Studio's `LayoutChecks` cover Layout pages only:

- placeholder links
- names
- runs longer than 32 characters
- alignment

They do not check diagram geometry. The `Forma.Workflow` editor's `Resize` likewise accepts any size of at least 40×32.

Outcome: category 4, "silently generates an invalid layout". The remedy is for Studio to vendor this Forma.Workflow and run `LayoutCheck` on its diagram projection before export. That is not done here: Studio vendors a Forma commit, so it waits for this change to merge.

## Limen (Section 12)

Limen's `measure` capability is a one-shot `getBoundingClientRect`, with `observeSize` (ResizeObserver) for change. It does not wait for `document.fonts.ready`. That would be a hazard for measurement-driven layout with web fonts.

However:

- Forma loads no `@font-face`; Manrope falls back to system fonts.
- The Causa graph layout performs no browser measurement.
- Zoom is CSS `zoom`, and the probe measured zero drift.

**No Limen-owned defect was found, and Limen was not changed.** Hosts that measure should observe size changes rather than measure once.

## Accessibility

- The corrections never shrink text.
- Content is never clipped: no `overflow: hidden` was added. `contain.clipped` was 0 in every run.
- Focus and semantics are unchanged.
- The relationship text list remains the diagram's text equivalent.
- The workflow embed accessibility, forced-colours and touch specs pass.
- The diagram reserves WCAG 1.4.12 room, and rem geometry makes text enlargement scale the diagram instead of overlapping it.
- The reserved room is distributed between a node's rows, as before (grid `align-content: normal`). Packing rows to the top looked better, but it moved the editor's intent button under the node's centre and broke the workflow-embed touch test (`tap the target`), so it was reverted.

## Indy Init impact (rehearsal 004)

`kemiller2002/indy-init-rehearsal-004` pins `@echelon-foundry/design-system` 0.9.0 and `@echelon-foundry/forma-workflow` 1.0.0. Its causal graph satisfies UI-026, through the WDL auto-layout that UI-026-O2 requires.

**Reproduced with those exact packages.** Every one of the 15 historical-catalog variants failed seven constraints, through the WebAssembly runtime in view mode (`results/pinned-baseline/`).

**Does it block required functionality?** It does not block it, but it degrades it:

- The graph is visible.
- Selection (UI-026-O3) and the text equivalent (UI-026-O4) still work.
- But O1, a graph "centred on" the analysis, is visibly defective: outcome text is cut by its pill, nodes overlap, and labels sit on nodes. A demonstration viewer would see it.

The corrected packages built from this branch pass all 15 (`results/pinned-candidate/`).

**For 7 November.** Adopt a Forma release that contains this change: design-system and forma-workflow version bumps after review. No application code needs to change. No rehearsal file, frozen evidence or acceptance record was modified.

## Remaining research

**Open limitations**

- **Label placement in dense fan-in.** Unseen challenge `3ce0003` has 6 cases: label to label, label to node, and two connectors through very tall nodes. When no free candidate exists, the fallback overlaps. `LayoutCheck` reports it. A global placement (more candidates, or widening the gap on demand) is the next step.
- **`.ef-alert` in narrow columns.** It stacks by a viewport media query, not by container width, so a 96–160 px column at 125–200% text overflows. This is a Forma component change outside this bounded fix.
- **No guarantee beyond the reserved typography envelope.** Line height 2.0 or weight 700 overrides exceed what the layout reserves (rendered-only misses). Only a rendered feedback loop can close this: the embed would measure and lay out again with measured sizes. Forma's static output cannot do that.
- **Monotonicity is not universal.** A wider ellipse can need a few pixels more height, because its content width scales with it. The property holds for box shapes and is tested only there.
- **Other browsers not measured.** Only Chromium was measured. Firefox and WebKit text metrics, and fonts other than those installed here, are untested by the probe.
- **Studio integration and the editor resize guard.** Studio's adoption of `LayoutCheck` and an editor `Resize` guard are follow-ups.

**Follow-ups recorded in Forma's Praxis backlog**

| item | follow-up |
|---|---|
| WI-0037 | Stack `.ef-alert` by container width |
| WI-0038 | Global label placement |
| WI-0039 | Editor `Resize` guard |
| WI-0040 | Measured relayout in the embed |

Studio's adoption of `LayoutCheck` belongs to `kemiller2002/forma-studio`, once this release is vendored.

**Process note.** The probe and the first baseline run were written before the LCE-001 work item was opened. The work item was opened before any Forma product file was committed.
