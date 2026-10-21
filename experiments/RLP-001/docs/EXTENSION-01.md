# RLP-001 research extension 01: layout models beyond attraction and repulsion

Registered 2026-10-21, after pilot run 3 and before the full experiment.
Canonical record: `research/experiments/EX-FORMA-2026-0002--rlp-001-extension-layout-models.md`.

## What does not change

The original four-arm experiment (EX-FORMA-2026-0001) runs exactly as
pre-registered: same arms (A conventional CSS, B Forma primitives, C
relational rules, D relational physics), tasks, checks, metrics, hypotheses
H1–H7 and analysis plan. Its engine and harness are frozen at the commit
recorded in `results/full/manifest.json`. Nothing in this extension changes
any existing arm. New models run as **separately labeled exploratory
variants** (`X*`), on the same tasks and conditions, scored by the same
harness.

## Directions and what the pilot says about each

| Direction | Where it already lives | Pilot evidence (pilot-3 unless noted) | Decision |
|---|---|---|---|
| 1. Semantic constraint satisfaction | Arm C (deterministic rules over declared relationships) | C matched D on every correctness measure; C solve p95 12.5ms against D's 89.9ms; C cut independent decisions to 12.7 against A's 35.0 | **Extend.** Semantics, not the solver, carry the observed decision reduction. |
| 2. Hierarchical growth and containment | Shared skeleton: containers grow to fit content; clearance and containment are hard constraints | Nested panels (T03) were defect-free in C and D; Arm D pages carried 15 `hierarchy-inversion` warnings: agents set a group's internal bond looser than the separation around it | **Implement first (X1).** Derive separation and clearance from the hierarchy so an inversion cannot be expressed. |
| 3. Energy minimization and compactness | Arm D (`E = wb·Eb + ws·Es + wg·Eg + wp·Ep + wa·Ea + wc·Ec`) | No correctness difference from C in 18 pilot attempts; about 7× C's runtime; above the 50ms threshold | **No further investment.** D stays unchanged as the physics control. |
| 4. Gestalt grouping and visual hierarchy | Partly in bonds (agent-chosen) and the `hierarchy-inversion` warning | Inversions occurred when agents chose bonds by hand | **Implement with X1** (hierarchy-derived proximity), and **add an arm-neutral Gestalt measure (G-metric) for every arm**. |
| 5. Attraction and repulsion as one mechanism | Arm D | See 3 | Retained as one mechanism among several; not extended. |

## X1: hierarchy-derived relational layout ("semantic hierarchy")

Same vocabulary, DOM adapter, measurement, skeleton, hard constraints and
Arm C rules resolver, with one change: **separation and clearance are derived
from the structure instead of chosen by the author.**

- **Separation (proximity, Gestalt):** a group or container's child separation
  is set by its *height*, the number of nested group levels beneath it. A group
  of leaves (height 1) uses `tight` (0.5rem), a group of groups (height 2)
  `related` (1rem), height 3 `loose` (1.5rem), height ≥ 4 `section` (2rem).
  Because a parent is always at least one level taller than any child group,
  separation between groups is always larger than separation within them. An
  inversion cannot be expressed.
- **Clearance (containment):** a container's clearance follows its depth
  among containers: outermost `spacious`, next `surface`, deeper `inset`.
  Nested boundaries tighten inward.
- **Author input:** `data-rl-bond` and `data-rl-clearance*` are removed from
  the X1 guide. If present, they are ignored and reported in the decision
  evidence. Every other attribute is unchanged.
- **Resolver:** Arm C's deterministic rules. No physics.

X1 is an engine option (`derive: "hierarchy"`) in a separate module; it does
not modify the C or D resolvers, so the frozen arms are bit-identical.

### Hypotheses (exploratory)

- **X1-H1:** X1 has fewer independent decisions than C (bond and clearance choices disappear).
- **X1-H2:** X1 has zero hierarchy inversions by construction, and no more first-draft or held-out defects than C.
- **X1-H3:** X1 is not visually worse than C in blind review (spacing and grouping criteria).

Null: X1 equals or underperforms C on correctness, or derived spacing is
judged worse visually.

### Protocol

Pilot first: T01, T03, T09 × X1 × 1, with the same gates as the original
pilot. Then, if the gates pass, 12 tasks × 3 repetitions (36 attempts), same
model, budget, harness and scoring. X1 runs after the main experiment, not
interleaved with it, so comparisons with A–D are exploratory (a different
execution window and no shared randomization).

## G-metric: arm-neutral Gestalt measure (all arms, exploratory)

Computed from the same browser captures, outside the pre-registered defect
counts:

- **Proximity contrast:** for each label, hint or message (`for`) and its control, the ratio of the distance to the nearest *unrelated* visible element to the distance to its own control. A ratio ≤ 1 is a Gestalt failure: the element is not visually closer to what it belongs to.
- **Group separation contrast:** for each spec parent with two or more child groups, the median gap between child groups divided by the median gap inside them. A value ≤ 1 is an inversion.

Reported per arm for the main experiment and for X1. They do not change H1–H7.

## Candidates, not yet justified for implementation

- **X2: zero-runtime semantic constraints.** Compile the relational vocabulary to CSS (flex, grid, subgrid) instead of resolving it in JavaScript. Forma is a zero-runtime package, so this is the path any adoption would need. Decide after the full results: worth building only if C or X1 shows a benefit worth keeping. It can then be evaluated without new agent attempts, by re-rendering the C and X1 final pages through the compiled CSS and re-scoring them.
- **X3: hierarchical growth with explicit priorities** (which child yields first under pressure). No pilot failure was attributable to growth order, so this is not justified now.

## Measurement

Unchanged: layout correctness (all invariants, viewports, dynamic steps,
held-out text, 200% text, axe, determinism), independent decisions (rubric
v1.0), tokens, tool calls, repair iterations, responsive behavior and engine
runtime (solve time, iterations, measure calls). The G-metric is added for
every arm.
