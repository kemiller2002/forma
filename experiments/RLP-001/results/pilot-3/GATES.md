# Pilot run 3: gate assessment

Status: **all gates pass. The full experiment proceeds on this infrastructure.**
Engine and harness commit: `cbc2c0a`. 12 attempts (T01, T03, T09 × A–D × 1).

| Gate | Result | Evidence |
|---|---|---|
| G1 convergence | Pass | 15 Arm D page resolves; 0 `non-convergence`, `oscillation` or `excessive-computation`; 0 invalid status. |
| G2 comparability | Pass | Every attempt produced a page; same model (`claude-sonnet-5-5`) in all 12 transcripts; 0 worker scripts; 0 leakage. The base-layer repair removed the Arm B handicap (no B worker reported overridden Forma spacing). |
| G3 measurement reliability | Pass | Re-scoring two pilot-3 pages (B and D, T09) gave identical defect sets (3/3 and 16/16 instances); all evaluations settled. Pilot 1 established the same on three pages. |
| G4 decision classification | Pass | Rubric and classifier unchanged since pilot 2: category κ 0.97, uncertain ≤ 5% per page. |
| G5 evaluability | Pass | Complete failure records; row associations match the task text; no worker reported a checker that contradicted TASK.md. |
| G6 accessibility | Pass | 0 axe violations in any first draft or final page. |

## Descriptive results (n = 3 per arm; not for inference)

| Measure (mean) | A | B | C | D |
|---|---:|---:|---:|---:|
| First-draft distinct defects | 3.3 | 0.7 | 0.7 | 0.7 |
| Final distinct defects | 0.0 | 0.3 | 0.0 | 0.7 |
| Held-out distinct defects | 2.3 | 0.3 | 0.7 | 0.7 |
| Acceptance | 3/3 | 2/3 | 3/3 | 2/3 |
| Validation runs | 1.3 | 1.3 | 1.7 | 1.0 |
| Tokens processed | 216k | 235k | 257k | 218k |
| Independent decisions (explicit + uncertain) | 35.0 | 19.3 | 12.7 | 12.3 |
| Framework-derived decisions | 0 | 37.7 | 69.3 | 60.0 |
| Engine solve p95 | — | — | 12.5ms | 89.9ms |

## Observations

- **Decisions:** the clearest pilot signal. Relational markup cut independent layout decisions to about a third of conventional CSS, and Forma primitives to about half. C and D are equal here, as designed: identical vocabulary.
- **C versus D:** no correctness difference was observed; D's solve time is about 7× C's, and D exceeds the pre-registered 50ms threshold (p95 89.9ms).
- **Ceiling:** on the dev pilot tasks, most first drafts were already defect-free in every arm, so the defect comparison has little room. The adversarial and held-out tasks of the full experiment are where differences can appear.
- **Tokens:** about 200k tokens per attempt are fixed agent overhead (cached context replayed on every API call). Attempt-level token differences are dominated by the number of validation runs, not by the arm.
- **Recurring relational failure:** `data-rl-flow="row"` (all-or-nothing) on line items stacks every child at 320px, separating name from price (D in pilots 2 and 3). The vocabulary does exactly what it documents; agents chose the wrong relationship. Unchanged, so arm conditions stay fixed.
- **Hierarchy inversions:** Arm D pages produced 15 `hierarchy-inversion` warnings (a group's internal separation larger than the separation around it). Agents chose bond strengths that contradict the nesting. This motivates the hierarchy-derived variant in the RLP-001 extension (`docs/EXTENSION-01.md`).
