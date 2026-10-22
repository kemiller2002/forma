# RLP-002 protocol (pre-registered 2026-10-22)

Hypotheses and decision rules: `HYPOTHESES.md`. Baseline: `BASELINE.md`.
Decisions taken during execution: `DECISIONS.md`.

## Arms

| Arm | Source | Role |
|---|---|---|
| A | RLP-001 conventional CSS, archived | Historical reference |
| B | RLP-001 Forma primitives, archived | Historical reference |
| C | RLP-001 deterministic relational resolver (run-time engine), archived. A new concurrent C control runs in Stage 2. | Reference and concurrent control |
| E | Relational vocabulary compiled to static CSS: ruleset `E/1`, compiler `rlc` | Can the runtime be removed? |
| F | Same compiler, plus refinement ruleset `F/1` | Can visual quality improve without correctness loss? |

E and F share the compiler and differ only in their stylesheet. `E/1` keeps
the RLP-001 token values. `F/1` is defined in `compiler/rulesets/F/` before
any visual review data exists.

## Stage 1: compilation and replay (deterministic)

- **Fixtures:** the 36 Arm C final pages of the RLP-001 full run
  (`results/full/artifacts/<attempt>/final.html`), plus compiler unit
  fixtures. Pages are compiled from preserved source only.
- **Procedure.** For each page:
  1. Compile it with `E/1` and `F/1`.
  2. Score C (re-run under the same harness and browser, from the original workspace), E and F with `harness/evaluate.mjs` in full mode. This covers:
     - viewports 320, 375, 768, 1024 and 1440;
     - the initial render and every dynamic step;
     - held-out text at 320 and 1440;
     - 200% font at 375 and 768;
     - axe at every width;
     - a determinism reload.
  3. Record defect keys, geometry, CSS bytes and render time. Run a compile-twice byte comparison and a JavaScript-disabled render.
- **Gate.** Proceed only if every condition holds:
  1. Every supported page compiles.
  2. On every supported page, E adds no defect key absent from C, in any condition.
  3. No new axe violation.
  4. No layout script.
  5. The output is deterministic.
  6. No added `unexpected-shift`.
  7. Unsupported relationships are documented with fixtures.
  8. The compiler stays within the H6 complexity bounds.
- **"Supported page":** every relationship on the page is supported, meaning it compiles exactly. A page using an unsupported relationship is reported separately, never counted as passing.
- **Correction cycle.** One focused correction cycle is allowed for a single identified common root cause. Then the full gate is rerun. If it fails again, stop with REFINE, LIMIT or ABANDON.
- **No inference.** Stage 1 replays are deterministic, not samples. Results are exact counts.

## Visual review

- **Images.** Every arm is recaptured in one rendering pass. A and B come from their archived final pages. C, E and F come from the same 36 Arm C source pages. The viewports are 375 and 1440, the same as RLP-001.
- **Design.**
  - A batch is one (task, repetition, viewport) cell: 72 batches.
  - Each batch has 5 images, one per arm, under opaque names in random order.
  - Two independent reviewers rate every image.
  - Criteria are the RLP-001 rubric: hierarchy, spacing, alignment, readability, grouping, density and overall, each 1–5.
  - Reviewers also mark defect labels: missing page gutter, stretched media, weak emphasis, incorrect association, poor responsive wrapping, excessive whitespace, crowded controls, inconsistent alignment, unexpected content shift.
- **Analysis:** within-design means per arm; paired batch comparisons; inter-rater agreement. No comparison with RLP-001 absolute scores.

## Stage 2: independent agents (only if the Stage 1 gate passes)

- **Tasks:** the six held-out tasks (T02, T04, T06, T08, T10, T12).
- **Attempts:** arms E and F × 3 repetitions = 36. A concurrent C control (6 × 3 = 18) is included unless the budget decision in `DECISIONS.md` says otherwise.
- **Execution:**
  - Same worker model, agent type, prompt structure, 5-run validation budget and isolated workspaces as RLP-001.
  - The E and F guide is the RLP-001 relational guide with the run-time engine paragraph replaced by the compile step.
  - `validate` compiles, then checks the compiled page.
  - The execution order is randomized with a recorded seed.
- **Scoring:** RLP-001 `collect` (full mode) on the compiled final page and on the compiled first draft. Tokens come from transcripts and decisions from rubric v1.0.

## Endpoints and statistics

- **Stage 1:** exact per-page counts of new defect keys (E \ C, F \ C) by condition and invariant; the geometry difference summary; CSS bytes.
- **Stage 2:**
  - Per-task means, paired across arms (n = 6 tasks).
  - Mean difference with a 95% task-cluster bootstrap CI (10,000 resamples, seed 20261022).
  - Exact Wilcoxon signed-rank test and Cliff's δ.
  - Non-inferiority uses the pre-registered margins in `HYPOTHESES.md`.
  - The four confirmatory Stage 2 tests are Holm-corrected.
- **Visual:** paired by batch (n = 72). Exact or normal-approximation Wilcoxon signed-rank test, one-sided for H3.

## Exclusions

- An attempt is excluded only for a harness failure (no page produced because of the infrastructure), workspace leakage, or a different model in the transcript. Every exclusion is listed.
- Worker scripts and inline handlers are reported. They are excluded only if they affect layout.

## Stop conditions

- **Stage 1:** the gate fails after the one correction cycle.
- **Stage 2:**
  - more than 20% of attempts fail for harness reasons;
  - the model is unavailable, in which case the substitution is recorded and archived comparisons are not treated as same-model.
- **Exploration:** a direction that fails is stopped early and reported.
