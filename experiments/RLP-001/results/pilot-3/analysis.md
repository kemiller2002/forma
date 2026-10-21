# RLP-001 pilot-3 analysis

Confirmatory: A − D first-draft defects. Everything else exploratory.

Attempts: 12. Tasks: T01-form-account, T03-cards-product, T09-dynamic-checkout.

## Per arm (mean [median])

| Measure | A | B | C | D |
| --- | ---: | ---: | ---: | ---: |
| firstDraftDefects | 3.3 [0.0] | 0.7 [1.0] | 0.7 [0.0] | 0.7 [0.0] |
| firstDraftGeometryDefects | 3.3 [0.0] | 0.7 [1.0] | 0.7 [0.0] | 0.7 [0.0] |
| firstDraftAccessibilityDefects | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] |
| finalDefects | 0.0 [0.0] | 0.3 [0.0] | 0.0 [0.0] | 0.7 [0.0] |
| finalHeldoutDefects | 2.3 [0.0] | 0.3 [0.0] | 0.7 [0.0] | 0.7 [0.0] |
| finalDynamicDefects | 0.0 [0.0] | 0.3 [0.0] | 0.0 [0.0] | 0.7 [0.0] |
| unexpectedShift | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] |
| accepted | 1.0 [1.0] | 0.7 [1.0] | 1.0 [1.0] | 0.7 [1.0] |
| totalTokens | 216283.0 [198923.0] | 234956.0 [199675.0] | 256985.3 [254657.0] | 217559.3 [199560.0] |
| outputTokens | 82.3 [64.0] | 64.0 [60.0] | 141.0 [74.0] | 67.7 [62.0] |
| inputTokens | 216200.7 [198799.0] | 234892.0 [199615.0] | 256844.3 [254367.0] | 217491.7 [199500.0] |
| toolCalls | 6.3 [7.0] | 6.3 [6.0] | 7.7 [7.0] | 6.3 [7.0] |
| durationMs | 35735.3 [35639.0] | 29289.7 [33165.0] | 37606.0 [36043.0] | 29969.3 [31873.0] |
| validationRuns | 1.3 [1.0] | 1.3 [1.0] | 1.7 [1.0] | 1.0 [1.0] |
| repairIterations | 0.3 [0.0] | 0.3 [0.0] | 0.7 [0.0] | 0.0 [0.0] |
| decisionsTotal | 35.0 [37.0] | 19.3 [20.0] | 12.7 [13.0] | 12.3 [13.0] |
| decisionsExplicit | 34.7 [36.0] | 19.0 [20.0] | 12.7 [13.0] | 12.3 [13.0] |
| decisionsDerived | 0.0 [0.0] | 37.7 [38.0] | 69.3 [77.0] | 60.0 [53.0] |
| decisionsCorrective | 0.0 [0.0] | 5.7 [0.0] | 3.0 [0.0] | 0.0 [0.0] |
| decisionsUncertain | 0.3 [0.0] | 0.3 [0.0] | 0.0 [0.0] | 0.0 [0.0] |
| rawStatements | 49.3 [50.0] | 37.0 [36.0] | 63.3 [67.0] | 53.7 [54.0] |
| acceptance rate | 1.00 | 0.67 | 1.00 | 0.67 |
| tokens per accepted interface | 216283 | 352434 | 256985 | 326339 |
| decisions per accepted interface | 35.0 | 29.0 | 12.7 | 18.5 |

## Paired task-level comparisons

| Comparison | Metric | Tasks | Mean diff | 95% bootstrap CI | Wilcoxon p | Holm p | Cliff's δ |
| --- | --- | ---: | ---: | --- | ---: | ---: | ---: |
| A − D | firstDraftDefects | 3 | 2.67 | [-2.00, 10.00] | 1.000 | — | 0.11 |
| A − D | totalTokens | 3 | -1276.33 | [-55968.00, 51525.00] | 1.000 | — | -0.11 |
| A − D | decisionsTotal | 3 | 22.67 | [18.00, 26.00] | 0.250 | — | 1.00 |
| A − D | repairIterations | 3 | 0.33 | [0.00, 1.00] | 1.000 | — | 0.33 |
| A − D | finalHeldoutDefects | 3 | 1.67 | [0.00, 5.00] | 1.000 | — | 0.11 |
| A − D | finalDefects | 3 | -0.67 | [-2.00, 0.00] | 1.000 | — | -0.33 |
| A − B | firstDraftDefects | 3 | 2.67 | [-1.00, 9.00] | 1.000 | 1.000 | -0.11 |
| B − C | firstDraftDefects | 3 | 0.00 | [-1.00, 1.00] | 1.000 | 1.000 | 0.11 |
| C − D | firstDraftDefects | 3 | 0.00 | [0.00, 0.00] | 1.000 | 1.000 | 0.00 |
| A − B | finalDefects | 3 | -0.33 | [-1.00, 0.00] | 1.000 | 1.000 | -0.33 |
| B − C | finalDefects | 3 | 0.33 | [0.00, 1.00] | 1.000 | 1.000 | 0.33 |
| C − D | finalDefects | 3 | -0.67 | [-2.00, 0.00] | 1.000 | 1.000 | -0.33 |
| A − B | finalHeldoutDefects | 3 | 2.00 | [0.00, 6.00] | 1.000 | 1.000 | 0.11 |
| B − C | finalHeldoutDefects | 3 | -0.33 | [-1.00, 0.00] | 1.000 | 1.000 | -0.11 |
| C − D | finalHeldoutDefects | 3 | 0.00 | [0.00, 0.00] | 1.000 | 1.000 | 0.00 |
| A − B | totalTokens | 3 | -18673.00 | [-55791.00, 524.00] | 0.500 | 1.000 | -0.11 |
| B − C | totalTokens | 3 | -22029.33 | [-117745.00, 107997.00] | 0.750 | 1.000 | -0.33 |
| C − D | totalTokens | 3 | 39426.00 | [-681.00, 119111.00] | 1.000 | 1.000 | 0.33 |
| A − B | decisionsTotal | 3 | 15.67 | [14.00, 19.00] | 0.250 | 0.750 | 1.00 |
| B − C | decisionsTotal | 3 | 6.67 | [1.00, 10.00] | 0.250 | 0.750 | 1.00 |
| C − D | decisionsTotal | 3 | 0.33 | [-2.00, 3.00] | 1.000 | 1.000 | 0.22 |
| A − B | repairIterations | 3 | 0.00 | [0.00, 0.00] | 1.000 | 1.000 | 0.00 |
| B − C | repairIterations | 3 | -0.33 | [-2.00, 1.00] | 1.000 | 1.000 | -0.11 |
| C − D | repairIterations | 3 | 0.67 | [0.00, 2.00] | 1.000 | 1.000 | 0.33 |

## Engine runtime (final pages, all viewports)

| Arm | Resolves | Solve ms median | Solve ms p95 | Total ms p95 | Iterations median | Invalid status | Convergence failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| C | 15 | 4.7 | 12.5 | 22.1 | 0 | 0 | 0 |
| D | 15 | 30.3 | 89.9 | 99.8 | 761 | 0 | 0 |

## Correlations (Spearman, attempt level, exploratory)

- decisions~tokens: ρ = -0.20 (n = 12)
- decisions~firstDraftDefects: ρ = 0.04 (n = 12)
- decisions~repairIterations: ρ = 0.03 (n = 12)
- tokens~repairIterations: ρ = 0.66 (n = 12)
- firstDraftDefects~repairIterations: ρ = 0.71 (n = 12)
- decisions~finalDefects: ρ = -0.09 (n = 12)
