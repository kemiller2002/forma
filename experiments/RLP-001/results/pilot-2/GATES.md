# Pilot run 2: gate assessment

Status: **G2 failed for Arm B (harness defect). Repaired; pilot rerun as `pilot-3`.**
Engine and harness commit: `08f1769`. 12 attempts. Data: `attempts/`, `artifacts/`, `analysis.*`, `rubric-review/`.

| Gate | Result | Evidence |
|---|---|---|
| G1 convergence | Pass | 15 Arm D page resolves; 0 convergence diagnostics; 0 invalid status. |
| G2 comparability | **Fail (Arm B)** | Two Arm B workers independently reported that the shared `base.css` overrode Forma spacing. Cause: `base.css` was unlayered, so its resets beat Forma's `@layer` rules. The pilot-2 B T03 first draft had 12 distinct clearance defects. Re-scored with `base.css` in the lowest cascade layer, loaded before Forma, the same draft has 0. All other comparability checks passed: same model in every transcript, 0 worker scripts, 0 leakage. |
| G3 measurement reliability | Pass | Established in pilot run 1; harness unchanged apart from the base layer. |
| G4 decision classification | Pass | Blinded reviewer (80 statements, 20 per arm): category agreement 97.5%, Cohen's κ 0.97 (A 0.94, B 0.93, C 1.00, D 1.00). Kind agreement 96.3%, κ 0.39; the low κ reflects prevalence (almost every statement is explicit), not disagreement. Uncertain statements ≤ 5% per page. |
| G5 evaluability | Pass | Every failure record names task, arm, attempt, viewport, element or relationship, expected invariant and observed value. Row associations now match the task text. |
| G6 accessibility | Pass | 0 axe violations in any page. |

## Observations kept for the report

- B and D T09 passed dev validation (375 and 1024 px) and failed at 320 px or under 200% text: generalization failures the held-out widths exist to find. The D page used `data-rl-flow="row"`, which stacks all children when they do not fit, placing quantity between name and price.
- Arm D solve time p95 71ms (Arm C 3ms).

## Repair before pilot run 3

`arms/base.css` is wrapped in `@layer rlp-base`, and every starter page links it first, so it is the lowest-priority layer. Forma's layers (Arm B) and every author's own CSS override it. The Arm B guide was updated to state the link order.
