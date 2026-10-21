---
id: EX-FORMA-2026-0001
title: "RLP-001: Relational layout physics — agent efficiency and correctness"
research_area: agent-ui-construction
status: active
created: 2026-10-21
author_agent: anthropic/claude-code
tests_hypotheses: [RLP-001-H1, RLP-001-H2, RLP-001-H3, RLP-001-H4, RLP-001-H5, RLP-001-H6, RLP-001-H7]
related_theories: []
inputs:
  - .praxis/inbox/documents/2026-10-21-RLP-001.md
  - experiments/RLP-001/baseline.json
outputs:
  - experiments/RLP-001/results/
  - experiments/RLP-001/REPORT.md
provenance:
  contributions:
    EXE-20261021T181014746Z-fc9e184b:
      operations: [created]
      at: 2026-10-21T18:38:25.971Z
      actor:
        kind: agent
        id: anthropic/claude-code
        provider: anthropic
        model: unknown
        runtime: claude-code
---

# Experiment

This record is the pre-registration. The method, metrics, gates and analysis
below were committed before any benchmark attempt ran; the commit that adds
this file is the pre-registration reference. Any later change is listed under
"Deviations" with its reason.

## Research question

Are interfaces easier for AI agents to build correctly when spacing,
containment, alignment and grouping come from one system of relationships
instead of independently assigned CSS properties? And does a force-based
(energy-minimizing) solver add anything beyond the relationships themselves?

RQ1 correctness · RQ2 agent efficiency · RQ3 decision reduction · RQ4
physics-specific benefit · RQ5 generalization · RQ6 runtime practicality.

## Hypotheses tested

| ID | Hypothesis | Operationalization | Null |
|---|---|---|---|
| H1 (primary) | Relational physics (D) has fewer first-pass layout defects than conventional CSS (A). | Distinct first-draft defects (invariant × element/relationship), standard condition, 5 viewports, all dynamic steps, axe included. | D ≥ A |
| H2 | Total agent tokens per accepted interface decrease. | Σ tokens processed ÷ accepted attempts, per arm; paired per-task token means. | No decrease |
| H3 | Independent layout decisions decrease. | Explicit + uncertain decisions (rubric v1.0) in the final page. | No decrease |
| H4 | Repair iterations decrease. | Validation runs − 1. | No decrease |
| H5 | Layouts stay valid when viewport and content change. | Final-page distinct defects in held-out conditions (held-out text at 320/1440, 200% font at 375/768) and in dynamic steps. | No improvement |
| H6 | Physics adds measurable benefit beyond relations alone. | D vs C on H1, H5 and final defects. | D ≥ C |
| H7 | Runtime overhead is acceptable. | p95 engine resolve time ≤ 50 ms per resolve on every task and viewport; zero convergence failures; recorded bundle size. | Exceeds |

The joint null is that the relational model gives no meaningful improvement,
or that its benefit is fully explained by standardized primitives (B ≈ C ≈ D).

## Variables

- **Independent:** arm. A: conventional CSS. B: Forma primitives and tokens. C: relational vocabulary resolved by deterministic rules. D: the same vocabulary resolved by constrained energy minimization.
- **Dependent:** the measures above, plus acceptance (zero standard-condition defects in the final page), cost per accepted interface, duration, tool calls, corrective decisions, engine diagnostics, solve time, iterations, measure calls.
- **Controlled:** task text (generated from one definition), shared `base.css`, worker model and agent type, worker prompt, validation budget (5 runs), validator, viewports, dynamic sequence.

## Method

- 12 tasks (`tasks/tasks.mjs`): forms, cards, dashboards, navigation, dynamic content, adversarial (2 each). Six are development tasks (T01, T03, T05, T07, T09, T11) and six are held out (T02, T04, T06, T08, T10, T12). The engines were developed against dev tasks only and are frozen (commit recorded in each manifest) before held-out tasks run.
- Each attempt is an independent worker agent (`general-purpose`, model alias `sonnet`, recorded per attempt from the transcript) in its own workspace containing only AGENT.md, TASK.md, the arm's GUIDE.md, assets, a starter page and `validate`. Workspaces have opaque random ids; the arm label is not in the workspace.
- `validate` (dev mode) checks 375 and 1024 px, initial and dynamic steps, axe at 1024. It snapshots the page on every run; run 1 is the first draft.
- Scoring (full mode) re-evaluates the first draft and the final page: 320, 375, 768, 1024 and 1440 px × initial and every dynamic step, axe at every width, held-out text at 320/1440, 200% font at 375/768, and a determinism reload at 1024. The held-out conditions are never shown to workers.
- Execution order is randomized with a recorded seed.
- Usage comes from each worker's transcript: uncached input, cache creation, cache read and output tokens per API message, tool calls, duration. Unavailable values are null.
- A leakage audit lists every worker tool call naming a path outside its workspace.
- Pilot: T01, T03, T09 × 4 arms × 1. Full: 12 × 4 × 3 = 144.

## Acceptance criteria (scoring invariants)

Presence; no horizontal page overflow; nothing offscreen; no clipping by a non-scrolling ancestor; text fits its own box; containment inside the declared parent; ≥ 4 px clearance inside panels; sibling separation ≥ 4 px (2 px for a checkbox or radio beside its own label); no overlap; interactive targets ≥ 24 × 24; label, hint and message within 1.5 rem of their control (or of another element describing it); a label nearest its own control; shared top edge and equal width (±1 px) for declared peers sharing a row; visual reading order; no movement > 1 px of elements entirely above a dynamic change; axe (WCAG 2.x A/AA) violations; uncaught script errors; determinism (±0.5 px on reload).

## Falsification criteria

H1 is falsified if the paired task-level difference (A − D) in mean first-draft distinct defects has a 95% cluster-bootstrap interval that includes or lies below zero. H6 is falsified if D does not beat C on first-draft and held-out defects by the same test. H7 is falsified if any task or viewport has p95 resolve time above 50 ms or any convergence failure.

## Controls

Arm B controls for "any standardization helps". Arm C controls for "relationships help without physics". C and D share all code except the arrange step, receive identical documentation, and their attempts write identical markup vocabularies.

## Analysis plan

- Unit: attempt; tasks are clusters (3 repetitions each in the full experiment).
- Per arm: mean, median, SD, IQR of every measure; acceptance rate; tokens per accepted interface; decisions per accepted interface.
- Paired comparisons on per-task means (n = 12): A–D (confirmatory), A–B, B–C, C–D (mechanism, Holm-corrected). Statistics: mean difference, 95% cluster bootstrap CI (10,000 resamples over tasks, fixed seed), exact Wilcoxon signed-rank p, and Cliff's δ on attempt-level values.
- Correlations (Spearman, exploratory) between decisions, tokens, defects and repair iterations; no causal claim from correlation.
- The pilot (n = 12) is descriptive only.
- Everything not listed above is exploratory.

## Pilot gates (stop before the full experiment if any fails)

- **G1 convergence:** no `non-convergence`, `oscillation` or `excessive-computation` diagnostic in ≥ 90% of Arm D page resolves.
- **G2 comparability:** every attempt produced a page; no arm failed for a harness reason; same model in every transcript; no worker scripts.
- **G3 measurement reliability:** re-scoring three pilot pages gives identical defect sets; layouts settle in ≥ 95% of evaluations.
- **G4 decision classification:** uncertain ≤ 15% of statements; blinded reviewer agreement κ ≥ 0.6 on category.
- **G5 evaluability:** every failure record names task, arm, attempt, viewport, element or relationship, expected invariant and observed value.
- **G6 accessibility:** no serious or critical axe violation attributable to the engine (present in C/D pages and in no A/B page of the same task).

## Procedure

`harness/plan.mjs` → worker agents → `harness/collect.mjs` per attempt →
`harness/analyze.mjs` → blind visual review → report. See
`experiments/RLP-001/README.md`.

## Results

Recorded in `experiments/RLP-001/REPORT.md` after execution.

## Threats to validity

The worker model and the analyst are the same model family. The analyst also wrote the engine, tasks and checks; held-out tasks and conditions limit, but do not remove, that bias. The relational vocabulary was designed alongside the checks. Blinding of decision classification is partial. The 144-attempt design is an initial sample, not a powered study.

## Replication notes

See README (commands, seeds, versions) and `baseline.json`.

## Conclusion

Pending.

## Registry updates required

Hypotheses RLP-001-H1…H7 to `research/hypotheses/` once results exist.

## Deviations



- 2026-10-21, before any attempt: the experiment workbench moved from
  `research/experiments/RLP-001/` to `experiments/RLP-001/`, because Praxis
  treats every Markdown file under `research/experiments/` as a canonical EX
  record. No method change.
- 2026-10-21, after pilot run 1 (`experiments/RLP-001/results/pilot-1/GATES.md`):
  the pilot failed G2 and evaluability. Task `pairs` that describe row
  membership were scored with the 1.5rem proximity rule, which contradicted
  the task text. They became `rowPairs`, scored by a new `row-association`
  invariant (same row, or stacked within 1.5rem). A leaf-measurement defect
  in the shared relational adapter (C and D) was fixed. Both changes were made
  on development tasks only. The pilot was rerun as `pilot-2` with a new seed.
  Pilot run 1 data is preserved and reported.
- 2026-10-21, after pilot run 2 (`experiments/RLP-001/results/pilot-2/GATES.md`):
  the shared `base.css` was unlayered and overrode Forma's layered spacing,
  handicapping Arm B. It now sits in the lowest cascade layer and is linked
  first. The pilot was rerun as `pilot-3`. Pilot runs 1 and 2 are reported
  as infrastructure-validation data, not as arm comparisons.
