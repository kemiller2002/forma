# Pilot run 1: gate assessment

Status: **failed (G2, evaluability). Infrastructure repaired; pilot rerun as `pilot-2`.**
Engine and harness commit: `778ac21`. 12 attempts, executed concurrently in
manifest order. Data: `attempts/`, `artifacts/`, `analysis.json`, `analysis.md`.

| Gate | Result | Evidence |
|---|---|---|
| G1 convergence | Pass | 15 Arm D page resolves, 0 `non-convergence`, `oscillation` or `excessive-computation` diagnostics; 0 invalid status. |
| G2 comparability | **Fail** | Every attempt produced a page; same model (`claude-sonnet-5-5`) in all 12 transcripts; 0 worker scripts; 0 leakage. But the T09 and T03 task definitions declared `pairs` (item name ~ price, total label ~ value, specification label ~ value) that were scored with the 1.5rem proximity rule, which contradicts the task text ("price aligns to the end"). Workers in A, B and D reordered or packed content to satisfy the checker; the C worker exhausted 5 runs on it. The checker, not the arm, decided these outcomes. |
| G3 measurement reliability | Pass | Re-scoring three pages (A T03, B T09, D T01) twice gave identical defect sets; all evaluations settled. |
| G4 decision classification | Pass (partial) | Uncertain statements 0–5% of statements per page (limit 15%). The blinded reviewer agreement was deferred to pilot run 2. |
| G5 evaluability | **Fail** | Failure records are complete (all fields present), but the T03 and T09 proximity outcomes are not an objective measure of the stated requirement (see G2). |
| G6 accessibility | Pass | 0 axe violations in any first draft or final page, in any arm. |

## Other findings

- **Engine defect (C and D):** under 200% text at 768 px, images overlapped text on T03 (9 and 4 distinct overlaps). Cause: leaf measurement resolved the shared `max-inline-size: 100%` against the parent's stale pre-resize width, so images were measured at about 160px tall and rendered at 457px. Fixed in `engine/dom.mjs` by neutralizing a leaf's own percentage limits during measurement (the engine assigns the size). Verified: the same page now scores 0 defects.
- **Runtime:** Arm D solve time p95 61ms (median 19ms, up to 5,642 iterations per resolve), above the pre-registered 50ms H7 threshold. Arm C p95 4.7ms. Not tuned; recorded as observed.
- **Forma (Arm B):** one worker reported that `ef-form-row` field margins "weren't taking effect" and added custom spacing. This is consistent with the duplicate `ef-stack` definitions noted during setup. Logged for the report as a pre-existing Forma observation.
- **Vocabulary:** one C worker tried `data-rl-min="100%"`. Percentages are rejected by design and reported as `invalid-dimension`.

## Repairs before pilot run 2

1. `tasks/tasks.mjs`: row-level relationships moved from `pairs` (proximity) to `rowPairs`. A row pair passes if the two elements share a visual row, or sit stacked within 1.5rem when there is no room. TASK.md states this explicitly.
2. `harness/checks.mjs`: new `row-association` invariant. The proximity rule is unchanged for labels, hints, messages and heading–text pairs.
3. `engine/dom.mjs`: the measurement fix above.

All three were made on development tasks before any held-out task ran. The acceptance criteria wording in TASK.md item 4 now names the 1.5rem proximity rule.
