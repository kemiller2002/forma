# X1 pilot: gate assessment (exploratory variant, extension 01)

Status: **all gates pass. X1 proceeds to 12 tasks × 3 repetitions (phase `x1-full`).**
3 attempts (T01, T03, T09 × X1 × 1), same model, agent type, prompt,
validation budget and harness as the main experiment. Gates are the original
pilot gates (EX-FORMA-2026-0001), applied unchanged.

| Gate | Result | Evidence |
|---|---|---|
| G1 convergence | Pass | 15 page resolves; 0 invalid status; 0 `non-convergence`, `oscillation` or `excessive-computation`; solve p95 10.4ms. |
| G2 comparability | Pass | Every attempt produced a page; `claude-sonnet-5-5` in all 3 transcripts; 0 worker scripts; 0 leakage. |
| G3 measurement reliability | Pass | Harness unchanged since pilot 3 (where re-scoring was identical); every evaluation settled. |
| G4 decision classification | Pass | Classifier unchanged; 0 uncertain statements; 0 `ignored-attribute` warnings (no worker wrote bond or clearance). |
| G5 evaluability | Pass | Complete failure records. The one worker report of a checker complaint (T09 shift) was a real layout shift, explained below. |
| G6 accessibility | Pass | 0 axe violations in any first draft or final page. |

## Descriptive results (n = 3; not for inference)

| Measure (mean) | X1 | C (pilot 3, same tasks) |
|---|---:|---:|
| First-draft distinct defects | 7.7 | 0.7 |
| Final distinct defects | 0.7 | 0.0 |
| Held-out distinct defects | 0.7 | 0.7 |
| Acceptance | 2/3 | 3/3 |
| Validation runs | 1.7 | 1.7 |
| Tokens processed | 259k | 257k |
| Independent decisions | 11.0 | 12.7 |
| Engine solve p95 | 10.4ms | 12.5ms |

T01 and T03 were defect-free on the first draft. T09 carried all of X1's
defects: 23 distinct in the first draft (row-association and
`unexpected-shift`), 2 in the final page (row-association at 320px only,
under held-out text and 200% text).

## Observation: derived spacing is content-dependent

The T09 worker's run 1 failed `unexpected-shift` because hiding the loading
message removed one nesting level from the shipping section. Under X1 the
separation of a group is a function of its height, so that change also
changed the spacing above the section. The worker fixed it by wrapping the
loading text in an extra group so the height stays the same either way.

This is a property of the model, not a harness defect. Deriving spacing from
structure removes the bond decision and makes Gestalt inversions
inexpressible, but it couples spacing to *which content is present*: a
dynamic show or hide that changes a group's height moves its neighbors.
Arm C does not have this coupling, because its bonds are fixed by the author.
It is recorded here before the full X1 run so it can be measured there
(`unexpected-shift`, dynamic defects) rather than discovered after.

The G-metric found one group-separation case below 1 (T09 line items at
320px: 16.0px between items against 16.5px inside a wrapped item). It is a
wrapping artifact at a viewport the worker never validated, not a
bond-order inversion.
