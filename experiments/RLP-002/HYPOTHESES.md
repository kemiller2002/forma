# RLP-002 hypotheses (pre-registered 2026-10-22, before any compiler code or data)

| ID | Hypothesis | Evidence | Endpoint | Decision rule | Null |
|---|---|---|---|---|---|
| H1 | Static compilation (E) preserves the hard layout invariants of the RLP-001 deterministic resolver (C) on supported layouts. | Stage 1 replay (deterministic) | Per page: distinct defect keys of E \ C, all conditions | Supported if, on every supported page, E introduces no defect key absent from C | Any new hard-invariant defect on a supported page |
| H2 | The compiled representation needs no run-time JavaScript or WASM layout computation. | Stage 1 static audit and runtime check | Count of script elements and module or WASM requests in compiled pages; layout identical with JavaScript disabled | Supported if 0 layout scripts and geometry is unchanged with JavaScript disabled | Any required script |
| H3 | A refined vocabulary (F) improves visual quality over unrefined relational rules (E), without increasing layout defects. | **New blind visual review** (A, B, C, E, F in one design) and Stage 1 replay | Overall rating F − E, paired by batch; F defects \ C | Supported if F > E (one-sided exact Wilcoxon on batch means, α = 0.05) **and** F introduces no new hard-invariant defect relative to C | F ≤ E, or new defects |
| H4 | Agents using the compiled vocabulary make no more independent layout decisions than Arm C. | **New agent attempts** (Stage 2) | Independent decisions (rubric v1.0, explicit + uncertain) per attempt, F − C and E − C against the concurrent C control | Non-inferiority: upper bound of the 95% task-cluster bootstrap CI of the mean difference < +2.0 decisions | Upper bound ≥ 2.0 |
| H5 | Compiled layouts stay correct across viewports, font scaling, unseen text and dynamic content. | Stage 1 replay; **Stage 2 agent attempts** | Final-page distinct defects (standard, held-out, dynamic), F − C and E − C | Non-inferiority: upper 95% CI bound < +0.5 distinct defects per attempt | Upper bound ≥ 0.5 |
| H6 | Compilation adds no material cost: tokens per accepted interface, build complexity or maintenance burden. | **Stage 2** tokens; compiler and CSS metrics | Tokens per accepted interface (ratio to C); compiler lines; stylesheet bytes; build step time | Supported if the token ratio ≤ 1.15, the stylesheet ≤ 16 KB unminified, the compiler ≤ 600 lines and the build ≤ 2 s per page | Any bound exceeded |

## Adoption threshold (from the execution script, Section 15)

**ADOPT** needs all of the following:
- H1, H2 and H5 supported;
- no new accessibility regression;
- H4 supported;
- H6 supported;
- F rated at least 4.0/5 overall in the comparable blind design.

Any of these failing is evaluated under REFINE, LIMIT or ABANDON (Section 15).

## Confirmatory and exploratory

- **Confirmatory:** H1, H2, H3, and the F − C contrasts of H4 and H5. These four Stage 2 tests are Holm-corrected together.
- **Exploratory:**
  - the E − C contrasts of H4 and H5;
  - every comparison with archived A and B, which ran on a different day with no shared randomization;
  - token breakdowns, CSS size and G-metric.
