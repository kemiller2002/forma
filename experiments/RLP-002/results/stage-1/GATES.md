# Stage 1 gate record

Each run replays the 36 RLP-001 Arm C final pages with the unchanged RLP-001
harness in full mode, and re-scores C in the same pass (C re-scores are in
`C/`; all 36 workspaces match their archived artifacts byte for byte). The
gate conditions are computed mechanically by `harness/gate.mjs` into
`<ruleset>/gate.json`.

## Run 1: ruleset E1 (2026-10-22): **FAIL**

| Condition | Result | Evidence |
|---|---|---|
| Every supported page compiles | Pass | 36/36 compiled: 10 exact, 24 approximated, 2 with an unsupported relationship |
| No new hard-invariant defect on a supported page | Pass, formally | 0 new instances on the 10 exact pages. 838 new on the other 26. Most of those have nothing to do with the approximations (below). |
| No new accessibility violation | Pass | 0 |
| No layout runtime | Pass | 0 script elements, 0 script or WASM requests, 0 px geometry change with JavaScript disabled |
| Deterministic | Pass | 36/36 byte-identical across two compilations |
| No added `unexpected-shift` | **Fail** | 8 new instances on 3 pages (T04 ×2, T10 ×1) |
| Unsupported relationships documented | Pass | 109 compiler findings: 104 `flow=row` approximated, 3 edge-grid approximated, 2 nested edges unsupported |
| Practical scope | Pass | Compiler 460 lines; stylesheet 6.5 KB; under 10 ms per page |

New defect instances, by cause (each traced to the markup):

| Cause | Instances | Pages | Kind |
|---|---:|---:|---|
| **Fieldset legend.** A `<legend>` that is a fieldset's rendered legend sits in the fieldset border, outside the flex flow. Arm C positioned it as an ordinary child. | 359 (`separation`, `clearance`) | 10 (T01, T02, T11) | Ruleset defect |
| **Fixed-size controls shrink.** Checkboxes and radios are flex items with `flex-shrink: 1`, so they shrink below the 24 px target. Arm C enforced a 24 px floor on every interactive element. | 462 (`target-size`) | 13 (T01, T02, T09, T11) | Ruleset defect |
| **Content-dependent rows.** `flow=row`, approximated as per-item wrapping, re-wraps when dynamic text grows, and content above it moves. | 8 (`unexpected-shift`) | 3 (T04, T10) | Documented approximation |
| **Nested shared edge at different positions.** Not compiled, so the search input sits below Sign in (T07). | 9 (`reading-order`) | 1 | Documented unsupported |

Arm E also resolved 31 C defect instances. C's own failures were mostly
row-association in T09; per-item wrapping keeps the name and price together.

**Correction cycle (the one allowed).** The two ruleset defects share one root
cause: E1 lets native rendering of form elements (legend placement, flex
shrinking of fixed-size controls) take effect where the Arm C engine bypassed
it by positioning every child itself. The fix restores the engine's
semantics for those elements: the legend becomes an ordinary child, and every
interactive element gets the 24 px floor and does not shrink. It goes in a new
ruleset version, E2; E1 is kept unchanged for reproducibility. The two
approximation causes are not changed: they are the documented limits of
static compilation, not defects.

## Run 2: ruleset E2, after the correction cycle (2026-10-22): **FAIL. Stop before Stage 2.**

| Condition | Result | Evidence |
|---|---|---|
| Every supported page compiles | Pass | 36/36: 10 exact, 24 approximated, 2 unsupported |
| No new hard-invariant defect on a supported page | Pass | 0 on the 10 exact pages. 17 on the others, all from the two documented limits. |
| No new accessibility violation | Pass | 0 |
| No layout runtime | Pass | 0 scripts, 0 script or WASM requests, 0 px geometry change with JavaScript disabled |
| Deterministic | Pass | 36/36 |
| No added `unexpected-shift` | **Fail** | 8 instances on 3 pages (T04 ×2, T10 ×1), all from approximated content-dependent rows |
| Unsupported relationships documented | Pass | Compiler findings on every non-exact page; reproducible fixtures in `fixtures/` (`results/stage-1/fixtures.json`) |
| Practical scope | Pass | Compiler 460 lines; stylesheet 7.3 KB; about 6 ms per page |

**What the correction fixed.** The correction cycle removed 821 of the 838
new defect instances (all `separation`, `clearance` and `target-size`). The
17 that remain:

- **8 `unexpected-shift`** from content-dependent rows (the `row-content-switch` fixture: the name moves 99 px at 600 px under E2 and does not move under C);
- **9 `reading-order`** on one page from a nested shared edge at different positions (the `nested-edge-mismatch` fixture: inputs 29 px apart under E2, aligned under C).

**Overall, E2 has fewer defects than C.** E2 also removed 31 of C's 34
`row-association` defect instances: per-item wrapping keeps a line item's
name and price together where Arm C stacked every child. In total, E2 has 24
defect instances against C's 38. It does not meet the gate, because the gate
counts new defects and does not net them against fixed ones.

**Decision.** Per the protocol, the gate failed after the single correction
cycle, so the experiment stops before Stage 2. The execution script makes Arm
F conditional on Stage 1 passing, so Arm F, the visual review and Stage 2 are
not run. No criterion was weakened.
