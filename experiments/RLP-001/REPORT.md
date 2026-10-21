# RLP-001 research report: relational layout physics

Experiment records: EX-FORMA-2026-0001 (pre-registered four-arm experiment)
and EX-FORMA-2026-0002 (research extension 01, exploratory variant X1).
Primary system: Forma. Supporting systems: Praxis (records, provenance),
Dokimos and Ordo (verification and engineering-rule context), Folio (not
modified). Every number below is computed by the scripts in `harness/` from
the raw attempt records in `results/`; nothing is estimated by hand.

## Summary

**Recommendation: Outcome B, relationships win and physics does not.**

- **H1 (primary) is not supported.** Relational physics (D) did not have
  significantly fewer first-draft defects than conventional CSS (A). Task-paired
  mean difference A − D = 0.47 distinct defects, 95% cluster bootstrap CI
  [−0.19, 1.11], exact Wilcoxon p = 0.18. The pre-registered falsification
  rule (CI includes zero) applies.
- **H6 is falsified: physics adds nothing beyond relationships.** The rules
  resolver (C) was at least as good as D on every correctness measure, with
  first-draft defects 0.31 against 0.81. D's energy minimization introduced a
  failure C does not have: content above a dynamic change moved (7 D first
  drafts against 1 C).
- **H7 fails for D.** D solve-time p95 was 105.5 ms against the 50 ms threshold,
  with 9 of 12 tasks over it. C (9.3 ms) and X1 (9.8 ms) are well inside it.
  There were no convergence failures in any arm.
- **The relational vocabulary has a large, robust decision effect (H3).**
  Independent layout decisions per attempt fell from 31.4 (A) to 18.8 (B) to
  12.8 (C and D). Every step is significant after Holm correction except C − D,
  which is equal by design.
- **Responsive robustness improved (H5, held-out conditions).** Final-page
  held-out defects (unseen text, 200% font) were 2.56 per attempt in A, 0.69 in
  B, 0.19 in C and 0.17 in D. A − D = 2.39 [0.31, 5.42], p = 0.031.
- **Tokens and repairs moved little (H2, H4).** Repair iterations fell
  (A − D = 0.44, p = 0.016), but tokens per accepted interface were nearly
  identical across arms (255k–306k). About 200k tokens per attempt are fixed
  context overhead.
- **Blind visual review preferred conventional CSS.** Mean overall rating was
  A 4.28, B 2.53, C 2.94, D 3.03 (1–5). Reviewers cited relational pages for
  content flush to the viewport edge, stretched images and media, and weak
  emphasis. The invariant suite does not measure these, so the correctness
  results above do not amount to visual quality.
- **Extension X1 (hierarchy-derived spacing) is not recommended in its tested
  form.** It removed Gestalt group inversions completely (0 of 285 cases,
  against 1–9 per arm) and cut decisions a further 2.1 per attempt (p = 0.002).
  But it multiplied first-draft defects about sevenfold over C (2.33 against
  0.31), because spacing derived from nesting depth changes whenever dynamic
  content changes the depth. Acceptance fell to 27/36. Blind reviewers rated
  it visually equal to C (overall 3.22 against 3.19).

The decision reduction comes from **semantic relationships resolved by
deterministic rules**, not from physics. The next step is a zero-runtime
compilation of that vocabulary to CSS (candidate X2), not further solver work.

## 1. Repository architecture assessment

Baseline commits and tool versions are in `baseline.json`. The relevant findings:

- **Forma** is a zero-runtime HTML/CSS design system. Its stylesheets are
  ordered with `@layer echelon.*`. Layout primitives are classes: `ef-stack`,
  `ef-cluster`, `ef-grid`, `ef-switcher`, `ef-sidebar`, `ef-surface`, `ef-form`,
  `ef-form-row`, `ef-field`, `ef-actions` and `ef-bounded-overflow`, sized
  from spacing tokens (`--ef-primitive-spacing-N`). Conformance checks live in
  `packages/conformance` (`evaluateAlignment`, `evaluateOverflow`), and the
  experiment's checks reuse them.
- There is no runtime layout engine in Forma. Any relational or physics model
  is therefore a new runtime dependency. That is why the experiment code is
  isolated under `experiments/RLP-001/` and is not part of the published
  package, its stylesheets or its exports.
- **Praxis** owns requirement intake (`.praxis/inbox/documents/`) and canonical
  research records (`research/experiments/`). Every Markdown file under that
  path is treated as an EX record, which is why the workbench moved (see
  Deviations).
- Pre-existing Forma test failures (the package-contract test and two
  site-CSS-policy tests) reproduce on the baseline commit. This branch did not
  cause them.

## 2. What was built

| Component | Location | Notes |
|---|---|---|
| Requirements | `.praxis/inbox/documents/2026-10-21-RLP-001.md`, `…-RLP-001-EXT-01.md` | RLP-001.1–16, RLP-001-EXT.1–9 |
| Relational engine (shared core) | `engine/core/` | Normalization, hard minimums, preferred sizes, lines, verification, diagnostics |
| Arm C resolver | `engine/core/rules.mjs` | Deterministic rules |
| Arm D resolver | `engine/core/physics.mjs`, `relax.mjs`, `springs.mjs` | Constrained energy minimization (FISTA projected gradient, KKT residual ≤ 0.01 px), golden-section clearance search, partition enumeration |
| X1 transform | `engine/variants/hierarchy.mjs` | Bond from group height, clearance from container depth; then the unchanged C resolver |
| Browser adapter | `engine/dom.mjs` | Measurement, absolute positioning, re-resolve on resize and mutation, oscillation guard |
| Arms | `arms/` | Shared `base.css` (lowest cascade layer) and one guide per arm |
| Tasks | `tasks/tasks.mjs` | 12 tasks, 6 categories × (dev, held out) |
| Harness | `harness/` | Workspaces, validator, geometry and dynamic checks, axe, scoring, decision rubric, usage, analysis, blind reviews, G-metric |
| Docs | `docs/ENGINE.md`, `docs/DECISION-RUBRIC.md`, `docs/EXTENSION-01.md` | |

All engine code is written as pure functions over immutable descriptions, and
the DOM adapter is the only effectful layer. 20 engine unit tests pass.

## 3. Method (as pre-registered)

- **Arms.** A: conventional CSS. B: Forma primitives and tokens. C: relational
  vocabulary with deterministic rules. D: the same vocabulary resolved by
  energy minimization. C and D share every line except the arrange step and
  receive identical guides.
- **Attempts.** 12 tasks × 4 arms × 3 repetitions = 144 independent worker
  agents. Every attempt used the same model (`claude-sonnet-5-5`, confirmed in
  every transcript), the same agent type, prompt and 5-run validation budget,
  in an isolated workspace with an opaque id. Execution order was randomized
  (seed 20261024). The engine was frozen at the commit in
  `results/full/manifest.json`.
- **Scoring.** The first draft (validation run 1) and the final page are each
  scored at 320, 375, 768, 1024 and 1440 px, at the initial render and after
  every dynamic step, with axe at every width. The final page is also scored
  under held-out text (320/1440), 200% font (375/768) and a determinism
  reload. Workers never see the held-out conditions.
- **Statistics.** Per-task means paired across arms (n = 12), cluster
  bootstrap 95% CI (10,000 resamples, fixed seed), exact Wilcoxon signed-rank
  test, and Cliff's δ. A − D is confirmatory. The A − B, B − C and C − D
  comparisons are Holm-corrected within each metric. Everything else is
  exploratory.

## 4. Pilot history and gates

Three pilot runs (T01, T03, T09 × 4 arms × 1) were needed before every gate
passed. Each failure was a harness or benchmark defect, which was fixed and
recorded before the next run:

| Pilot | Gate result | Defect found | Fix |
|---|---|---|---|
| 1 | G2 failed | The `pairs` proximity check contradicted the task text (line items). Image leaf measurement resolved percentage maxima against stale parent geometry. | `rowPairs` and a row-association invariant; measurement fix in `measureLeaf` |
| 2 | G2 failed | Unlayered `base.css` overrode Forma, handicapping Arm B | `@layer rlp-base`, linked before Forma |
| 3 | All pass | — | — |

Gate evidence is in `results/pilot-*/GATES.md`. The pilot-2 rubric review
gave category κ = 0.97.

## 5. Results: main experiment (144 attempts)

All 144 attempts produced a page and were scored. The leakage audit found no
access outside the workspace. Four attempts (T06, arms A, A, B and C) added an
inline `onsubmit="return false"` to the filter form. It has no layout effect;
the attempts are retained and the case is reported here.

### Per arm (mean per attempt; n = 36 each)

| Measure | A | B | C | D |
|---|---:|---:|---:|---:|
| First-draft distinct defects | 1.28 | 1.11 | 0.31 | 0.81 |
| Defect-free first drafts | 15/36 | 15/36 | 28/36 | 24/36 |
| Final distinct defects | 0.08 | 0.14 | 0.17 | 0.22 |
| Held-out distinct defects (final) | 2.56 | 0.69 | 0.19 | 0.17 |
| Dynamic distinct defects (final) | 0.08 | 0.14 | 0.17 | 0.19 |
| Acceptance (final page defect-free) | 33/36 | 32/36 | 32/36 | 30/36 |
| Validation runs | 1.69 | 1.61 | 1.36 | 1.25 |
| Tokens processed | 244k | 272k | 227k | 219k |
| Tokens per accepted interface | 267k | 306k | 255k | 262k |
| Independent decisions (explicit + uncertain) | 31.4 | 18.8 | 12.8 | 12.8 |
| Framework-derived decisions | 0 | 28.9 | 48.8 | 48.2 |
| Corrective decisions | 1.7 | 2.3 | 0.7 | 0.8 |
| Agent wall time | 44.7 s | 40.3 s | 39.3 s | 33.7 s |

### Hypotheses

| Hypothesis | Test | Result | Verdict |
|---|---|---|---|
| H1 (primary): D has fewer first-draft defects than A | A − D, first-draft defects | +0.47, CI [−0.19, 1.11], p = 0.18, δ = 0.24 | **Not supported** (CI includes 0) |
| H2: tokens per accepted interface decrease | per arm; A − D task-paired tokens | 267k (A) against 262k (D); task-paired A − D = 25.7k, CI [8.5k, 42.4k], p = 0.034 | **Weak.** A small raw-token decrease, no meaningful per-accepted decrease |
| H3: independent decisions decrease | A − D decisions | 18.6 fewer, CI [16.1, 21.3], p < 0.001, δ = 0.99 | **Supported** |
| H4: repair iterations decrease | A − D repairs | 0.44 fewer, CI [0.19, 0.69], p = 0.016 | **Supported** (small) |
| H5: layouts stay valid as viewport and content change | A − D held-out defects; dynamic defects | Held-out: 2.39 fewer, CI [0.31, 5.42], p = 0.031. Dynamic: −0.11 (D slightly worse) | **Supported for held-out text and font size; not for dynamic steps** |
| H6: physics adds benefit beyond relationships | D against C on first-draft and held-out defects | First draft: D worse by 0.50, CI [−1.22, −0.03]. Held-out: +0.03 | **Falsified** |
| H7: runtime acceptable | p95 solve ≤ 50 ms on every task, no convergence failures | D p95 105.5 ms (max task p95 248 ms, T07); 0 convergence failures | **Fails for D.** C passes (p95 9.3 ms, max task 12 ms) |

The joint null ("benefit fully explained by standardized primitives,
B ≈ C ≈ D") is rejected for decisions (B − C = 6.1, Holm p = 0.005). For
first-draft defects, B − C = 0.81 (CI [0.17, 1.44], Holm p = 0.15): the
direction favors relationships over primitives, but the result is not
significant after correction.

### Mechanism comparisons (Holm-corrected within metric)

| Metric | A − B | B − C | C − D |
|---|---|---|---|
| First-draft defects | 0.17 (p 0.45) | 0.81 (p 0.15) | −0.50 (p 0.25) |
| Held-out defects | 1.86 (p 0.39) | 0.50 (p 0.56) | 0.03 (p 1.0) |
| Decisions | **12.6 (p 0.001)** | **6.1 (p 0.005)** | −0.03 (p 0.95) |
| Tokens | −28.0k (p 0.35) | 45.6k (p 0.19) | 8.0k (p 0.52) |
| Repairs | 0.08 (p 1.0) | 0.25 (p 0.66) | 0.11 (p 1.0) |

An exploratory, unregistered comparison of C against A is reported because C
is the arm the recommendation rests on. First-draft defects were 0.97 lower,
CI [−1.47, −0.47], Wilcoxon p = 0.008. Held-out defects were 2.36 lower,
p = 0.016. C, not D, is the arm that would have satisfied H1.

### Runtime (final pages, all 5 viewports, 180 resolves per arm)

| Arm | Solve median | Solve p95 | Total p95 | Iterations median | Convergence failures |
|---|---:|---:|---:|---:|---:|
| C | 2.8 ms | 9.3 ms | 23.1 ms | 0 | 0 |
| D | 33.9 ms | 105.5 ms | 109.2 ms | 820 | 0 |
| X1 | 3.3 ms | 9.8 ms | 28.3 ms | 0 | 0 |

The engine source (core, adapter and the C entry) is 55 KB unminified, about 17 KB
gzipped.

### Decisions as an explanation

Fewer decisions coincided with fewer defects between arms, but within an arm
they did not predict defects. Attempt-level Spearman ρ between decisions and
first-draft defects is 0.27 pooled. Within arms it is 0.39 (A), 0.18 (B),
−0.08 (C) and 0.06 (D). The pooled correlation is largely the arm effect
itself. Within relational arms, an attempt with more relational statements was
no more defect-prone. The data therefore support "the relational vocabulary
removes classes of decisions, and those classes are where conventional CSS
fails". They do not support "fewer decisions cause fewer errors" as a general
law. The first-draft failure types back this up:

- **A:** offscreen, containment, reading-order, clearance and separation.
  These are the categories the relational skeleton makes hard constraints.
- **C and D:** reading-order and row-association only. Both come from
  choosing the wrong relationship, such as all-or-nothing row flow on line
  items.

Repairs, not decisions, drive tokens. Tokens ~ repairs gives ρ = 0.75, while
decisions ~ tokens gives ρ = 0.20.

### Blind visual evaluation

576 ratings: 2 independent reviewers each rated all 288 final-page
screenshots. That is 72 batches (12 tasks × 3 repetitions × 2 viewports, 375
and 1440 px), each holding the four arms' pages for one cell. Images were
copied under opaque names and shuffled within batches, and the arm key was
kept separately. Reviewer agreement was 63% exact and 99.5% within one point.
Three reviewers wrote image names without the `.png` extension. The first
scoring pass silently dropped those 144 ratings. Scoring now normalizes the
names and counts all 576; the ordering of arms was the same before and after.

| Criterion (1–5) | A | B | C | D |
|---|---:|---:|---:|---:|
| Hierarchy | 4.28 | 2.53 | 3.03 | 3.11 |
| Spacing | 3.97 | 2.68 | 3.08 | 3.10 |
| Alignment | 4.18 | 2.86 | 2.97 | 3.03 |
| Readability | 4.19 | 3.04 | 3.49 | 3.42 |
| Grouping | 4.30 | 2.74 | 3.15 | 3.15 |
| Density | 3.93 | 2.79 | 3.02 | 3.12 |
| Overall | 4.28 | 2.53 | 2.94 | 3.03 |

The reviewers' notes give the reasons:

- **C and D:** content flush to the viewport edge, full-width images and
  avatars, wrapped header rows. These are defaults of the relational engine:
  the root has no page gutter, and media grow to fill their line.
- **B:** muted, low-contrast serif headings and plain buttons, which is
  Forma's default typography. This is a styling confound, not a layout
  result. B pages contain almost no decorative CSS (0.4 border declarations
  per page against 1.1 in A).
- **A:** workers wrote modest decoration (about one border and one font rule
  per page), which only partly explains the gap.

The correctness invariants (containment, clearance, overlap, proximity,
reading order) do not measure page margins, media proportion or typographic
emphasis. This is a real limit of the benchmark and a real weakness of the
relational arms as built. Success is not claimed on visual grounds, and the
relational arms do not win on them.

## 6. Results: extension 01 (exploratory)

The extension was registered after pilot 3 and before the full run, as
`docs/EXTENSION-01.md` and EX-FORMA-2026-0002. X1 runs as a separate phase
with the same model, harness and scoring; the original arms are unchanged.
Its own pilot passed every gate (`results/x1-pilot/GATES.md`). The
comparisons below are exploratory: X1 ran in a different execution window
with no shared randomization.

| Measure | X1 | C | X1 − C (task-paired) | p |
|---|---:|---:|---|---:|
| First-draft defects | 2.33 | 0.31 | +2.03 [0.11, 5.64] | 0.063 |
| Final defects | 0.31 | 0.17 | +0.14 [0.00, 0.31] | 0.25 |
| Held-out defects | 0.17 | 0.19 | −0.03 | 1.0 |
| Acceptance | 27/36 | 32/36 | −0.14 | 0.25 |
| Decisions | 10.6 | 12.8 | **−2.1 [−3.0, −1.2]** | **0.002** |
| Tokens | 234k | 227k | +7.0k | 0.79 |
| Solve p95 | 9.8 ms | 9.3 ms | | |

- **X1-H1 (fewer decisions than C): supported.** Bond and clearance choices
  disappeared. No worker wrote one; there were 0 `ignored-attribute`
  warnings.
- **X1-H2 (no inversions, no more defects than C): split.** Zero Gestalt group
  inversions by construction is confirmed by the G-metric below. "No more
  defects" is not supported. 319 of X1's first-draft defect instances were
  `unexpected-shift`, against 1 in C. With spacing derived from height, hiding
  a loading message or growing a role line changes a group's nesting height,
  and so the spacing around it, and content above the change moves. This
  coupling was recorded at the X1 pilot, before the full run. Workers
  repaired it by adding wrapper groups to keep depth constant, which is a new
  kind of decision the model was meant to remove. T09 (checkout) alone
  contributed 70 of the 84 first-draft defects.
- **X1-H3 (not visually worse than C):** see the next section.

### X1 against C in blind visual review

A separate blind review put each X1 final page beside the Arm C page for the
same task, repetition and viewport: 72 batches, 2 reviewers each, 288
ratings, 70% exact agreement. The batches did not say which page was which.

| Criterion (1–5) | X1 | C |
|---|---:|---:|
| Hierarchy | 3.44 | 3.36 |
| Spacing | 3.46 | 3.34 |
| Alignment | 3.36 | 3.32 |
| Readability | 3.52 | 3.54 |
| Grouping | 3.51 | 3.42 |
| Density | 3.13 | 3.10 |
| Overall | 3.22 | 3.19 |

Paired by batch:

| Criterion | Mean difference (X1 − C) | Batches X1 better | Batches C better | Sign test p |
|---|---:|---:|---:|---:|
| Overall | +0.03 | 18 | 24 | 0.44 |
| Spacing | +0.12 | 28 | 16 | 0.10 |
| Grouping | +0.08 | 18 | 12 | 0.36 |

**X1-H3 (not visually worse than C) is supported.** Derived spacing is at
least as good as agent-chosen spacing, with a non-significant lean toward
better spacing. The C ratings in this review are higher than in the
four-arm review because the reference set is different; ratings are only
comparable within a review.

## 7. G-metric: arm-neutral Gestalt measure (exploratory)

The G-metric is computed from final pages at all five viewports:

- 390 label, hint or message pairs per arm.
- 285 parent cases with two or more child groups.

Two rules were fixed after inspecting pilot-3 output and before any full-run
G-metric was computed:

- A ratio of exactly 1 is a tie, not a failure.
- Child groups with their own border or background are "region-resolved".

| Arm | Proximity failures (ratio < 1) | Proximity ties | Group inversions | Group ties | Region-resolved | Attempts with an inversion |
|---|---:|---:|---:|---:|---:|---:|
| A | 0 | 47 | 9 | 4 | 10 | 3 |
| B | 0 | 14 | 9 | 15 | 55 | 3 |
| C | 0 | 15 | 1 | 15 | 0 | 1 |
| D | 0 | 35 | 8 | 50 | 5 | 3 |
| X1 | 0 | 15 | **0** | **0** | 0 | **0** |

The proximity invariant already enforced closeness, so no arm had a proximity
failure. Group separation is where the arms differ:

- **X1** was the only model with no inversions and no ties.
- **C's** agent-chosen bonds were almost as good: 1 inversion.
- **D's** energy minimization trades separation against compactness and
  produced 8 inversions and 50 ties. The pilot's `hierarchy-inversion`
  warnings showed the same thing.

## 8. Failure analysis

- **Wrong relationship, not wrong arithmetic.** Every C and D first-draft
  defect was reading-order, row-association or (in D) shift. The most common
  case is `data-rl-flow="row"` (all-or-nothing) on line items. At 320–375 px it
  stacks every child and separates the name from the price (T09). The engine
  does what the vocabulary documents; agents chose the wrong word. A
  "keep together, wrap the tail" relationship would remove this class.
- **Physics moves things it should not.** A global energy minimum couples
  distant elements, so a change below the fold can move a heading above it
  (D `unexpected-shift` in 7 first drafts, mostly T02). Deterministic rules
  do not do this.
- **Header reading order (T07, all arms).** A vertically centered brand beside
  a wrapped navigation sits below the first link. Workers fixed it with start
  alignment and shared top edges. It accounts for most T07 non-acceptance
  across arms.
- **Benchmark defect: T08.** The task text asks for the actions "with the
  heading row when there is room", but the required reading order puts `new`
  after `section-6`. Workers resolved the conflict in favor of reading order
  and said so. The task was not changed mid-run. It affects all arms equally
  and is not counted against any arm, but T08 cannot test "actions in the
  heading row".
- **Harness history.** The pilot-1 and pilot-2 defects are listed in
  Section 4. Two operational problems hit the full run's scoring: a
  collection job stopped silently, and background processes suspend while
  the session is idle. Both were resolved by re-running collection. The
  pending-attempt check is idempotent, and no attempt was scored twice or
  skipped (144/144, 36/36).
- **Conventional CSS fails on unseen content.** A's held-out failures were
  containment (34 instances), offscreen (28) and content overflow (19) under
  long text and 200% font. Workers validated at 375 and 1024 px and did not
  generalize. This is the strongest correctness argument for relationships
  and primitives.

## 9. Threats to validity

- **Same model family:** the worker model and the analyst (who wrote the
  engine, tasks and checks) are the same model family. The held-out tasks and
  conditions limit, but do not remove, that bias.
- **Ceiling:** most first drafts in every arm were nearly correct (median 0–1
  distinct defects), so the primary test has little room. n = 12 task clusters
  is a small sample, not a powered study.
- **Visual confounds:** visual review is confounded by styling freedom (A may
  write decoration; C and D may not; B inherits Forma typography).
- **Tokens:** token counts are dominated by about 200k of cached context per
  attempt, which compresses arm differences.
- **Rubric reliability:** the rubric reliability check on the full run gave
  category κ = 0.83 and kind agreement 94% (κ for kind is undefined in
  practice: 75/80 labels were "explicit"). Agreement was lowest for B
  (κ = 0.46). The reviewer filed Forma classes (`ef-stack`) under margin or
  alignment where the classifier files them under grouping. This changes the
  category of a B decision, not whether it is counted.
- **X1 execution window:** X1 ran in a different window from A–D.

## 10. Relationship to Echelon engineering research

- **Agent token efficiency.** Tokens follow repair iterations (ρ = 0.75), not
  layout model. Any model that reduces first-draft defects saves tokens only
  through avoided repairs. The fixed context cost dominates single-page tasks.
- **Agent correctness and preventive engineering.** The relational skeleton
  turns failure classes into hard constraints: containment, clearance,
  overflow and offscreen. Under unseen content those classes account for most
  of A's held-out failures and are almost absent in C and D. This is
  prevention by construction, the same principle as the four-tier engineering
  constraints. A violation that cannot be expressed needs no check.
- **Decision reduction.** Decision reduction is real and large (31 → 13). It
  explains the between-arm correctness difference only where the removed
  decisions are the error-prone ones. X1 shows the limit: removing two more
  decisions (bond, clearance) introduced a new failure (shift) and a new
  workaround decision. Fewer decisions are not automatically better. No claim
  is made about hallucination.
- **Long-running agents.** Single-page tasks cannot test this. A natural
  follow-up is multi-page work, where a relational vocabulary's consistency
  could compound.
- **Ordo and Dokimos.** The relational invariants are machine-checkable
  engineering rules in Ordo's sense: they can be enforced at authoring time
  rather than reviewed. The harness is a Dokimos-style verifier, with
  geometry invariants, held-out conditions and determinism checks. Its blind
  spots (margins, media proportion, emphasis) are exactly the ones the visual
  review exposed.

## 11. Recommendation

**Outcome B: relationships win and physics does not.** Arm C performed as well
as or better than Arm D on every correctness measure. D is about 12× slower
at p95 and fails the runtime threshold. C is the only arm with a significant
first-draft improvement over conventional CSS in the exploratory comparison.

Next engineering actions, in order:

1. **Do not continue the physics solver.** Keep D frozen as the reference
   control.
2. **Build X2: compile the relational vocabulary to CSS** (flex, grid,
   subgrid), with no runtime engine. Forma is zero-runtime, and this is the
   only adoptable form. X2 can be evaluated without new agent attempts by
   re-rendering the 36 C final pages through the compiled CSS and re-scoring
   them. Gate: no regression from C on any correctness measure.
3. **Fix the two vocabulary gaps the data identified** before any adoption:
   - a "keep together, wrap the tail" row relationship (line items);
   - a page-gutter and media-proportion default at the root.

   Re-run the blind visual review afterwards: the relational arms must not be
   visually worse than A to be adopted.
4. **Do not pursue X1 as tested.** Derived spacing is attractive for Gestalt
   grouping but must not depend on content that changes at run time. If
   pursued, derive from declared role rather than measured depth (an X1b
   candidate).
5. **Limited adoption candidates in Forma, after X2:**
   - form rows (label, control, hint and message groups), where held-out
     robustness was largest;
   - card and panel containment.

   Navigation headers need the reading-order fix first.

## Deviations from the pre-registered protocol

All deviations are recorded in EX-FORMA-2026-0001:

- the workbench move;
- the pilot-1 and pilot-2 harness repairs;
- the base-layer change;
- registration of extension 01.

Three changes were made after pre-registration and are recorded here:

- the G-metric tie and common-region rules, fixed before any full-run
  G-metric existed;
- the retention of four attempts with an inert `onsubmit`;
- the exploratory C − A comparison, which is not pre-registered.

## Reproduction

See `README.md`. Seeds:

- full 20261024;
- x1-pilot 20261025;
- x1-full 20261026;
- visual review 7 (main) and 8 (X1);
- rubric review 11.

Engine and harness commits are recorded in each `results/<phase>/manifest.json`.
