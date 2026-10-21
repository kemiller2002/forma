# RLP-001 pilot-1 analysis

Confirmatory: A − D first-draft defects. Everything else exploratory.

Attempts: 12. Tasks: T01-form-account, T03-cards-product, T09-dynamic-checkout.

## Per arm (mean [median])

| Measure | A | B | C | D |
| --- | ---: | ---: | ---: | ---: |
| firstDraftDefects | 1.7 [1.0] | 2.7 [3.0] | 0.7 [1.0] | 0.3 [0.0] |
| firstDraftGeometryDefects | 1.7 [1.0] | 2.7 [3.0] | 0.7 [1.0] | 0.3 [0.0] |
| firstDraftAccessibilityDefects | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] |
| finalDefects | 0.3 [0.0] | 0.3 [0.0] | 0.3 [0.0] | 0.0 [0.0] |
| finalHeldoutDefects | 0.0 [0.0] | 0.0 [0.0] | 1.7 [1.0] | 3.0 [0.0] |
| finalDynamicDefects | 0.3 [0.0] | 0.3 [0.0] | 0.3 [0.0] | 0.0 [0.0] |
| unexpectedShift | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] |
| accepted | 0.7 [1.0] | 0.7 [1.0] | 0.7 [1.0] | 1.0 [1.0] |
| totalTokens | 289615.3 [307782.0] | 373406.0 [316549.0] | 293556.0 [251319.0] | 295766.0 [198893.0] |
| outputTokens | 147.3 [169.0] | 128.7 [107.0] | 123.0 [143.0] | 68.0 [64.0] |
| inputTokens | 289468.0 [307706.0] | 373277.3 [316471.0] | 293433.0 [251158.0] | 295698.0 [198833.0] |
| toolCalls | 7.7 [8.0] | 9.0 [9.0] | 6.7 [5.0] | 7.7 [7.0] |
| durationMs | 46616.0 [49604.0] | 53607.3 [57556.0] | 48208.0 [36626.0] | 41509.7 [26749.0] |
| validationRuns | 2.0 [2.0] | 2.0 [2.0] | 2.7 [2.0] | 2.3 [1.0] |
| repairIterations | 1.0 [1.0] | 1.0 [1.0] | 1.7 [1.0] | 1.3 [0.0] |
| decisionsTotal | 29.0 [31.0] | 22.7 [20.0] | 14.0 [14.0] | 11.3 [11.0] |
| decisionsExplicit | 28.7 [31.0] | 21.7 [18.0] | 14.0 [14.0] | 11.3 [11.0] |
| decisionsDerived | 0.0 [0.0] | 28.3 [36.0] | 64.0 [65.0] | 59.0 [53.0] |
| decisionsCorrective | 2.0 [2.0] | 4.3 [6.0] | 3.7 [0.0] | 0.0 [0.0] |
| decisionsUncertain | 0.3 [0.0] | 1.0 [1.0] | 0.0 [0.0] | 0.0 [0.0] |
| rawStatements | 43.0 [39.0] | 36.0 [35.0] | 57.7 [58.0] | 48.0 [49.0] |
| acceptance rate | 0.67 | 0.67 | 0.67 | 1.00 |
| tokens per accepted interface | 434423 | 560109 | 440334 | 295766 |
| decisions per accepted interface | 43.5 | 34.0 | 21.0 | 11.3 |

## Paired task-level comparisons

| Comparison | Metric | Tasks | Mean diff | 95% bootstrap CI | Wilcoxon p | Holm p | Cliff's δ |
| --- | --- | ---: | ---: | --- | ---: | ---: | ---: |
| A − D | firstDraftDefects | 3 | 1.33 | [0.00, 3.00] | 0.500 | — | 0.44 |
| A − D | totalTokens | 3 | -6150.67 | [-183085.00, 111586.00] | 1.000 | — | 0.33 |
| A − D | decisionsTotal | 3 | 17.67 | [14.00, 21.00] | 0.250 | — | 1.00 |
| A − D | repairIterations | 3 | -0.33 | [-2.00, 1.00] | 1.000 | — | 0.11 |
| A − D | finalHeldoutDefects | 3 | -3.00 | [-9.00, 0.00] | 1.000 | — | -0.33 |
| A − D | finalDefects | 3 | 0.33 | [0.00, 1.00] | 1.000 | — | 0.33 |
| A − B | firstDraftDefects | 3 | -1.00 | [-4.00, 1.00] | 1.000 | 1.000 | -0.33 |
| B − C | firstDraftDefects | 3 | 2.00 | [0.00, 4.00] | 0.500 | 1.000 | 0.78 |
| C − D | firstDraftDefects | 3 | 0.33 | [0.00, 1.00] | 1.000 | 1.000 | 0.33 |
| A − B | finalDefects | 3 | 0.00 | [0.00, 0.00] | 1.000 | 1.000 | 0.00 |
| B − C | finalDefects | 3 | 0.00 | [0.00, 0.00] | 1.000 | 1.000 | 0.00 |
| C − D | finalDefects | 3 | 0.33 | [0.00, 1.00] | 1.000 | 1.000 | 0.33 |
| A − B | finalHeldoutDefects | 3 | 0.00 | [0.00, 0.00] | 1.000 | 1.000 | 0.00 |
| B − C | finalHeldoutDefects | 3 | -1.67 | [-4.00, 0.00] | 0.500 | 1.000 | -0.67 |
| C − D | finalHeldoutDefects | 3 | -1.33 | [-5.00, 1.00] | 1.000 | 1.000 | 0.11 |
| A − B | totalTokens | 3 | -83790.67 | [-239732.00, -2873.00] | 0.250 | 0.750 | -1.00 |
| B − C | totalTokens | 3 | 79850.00 | [-115747.00, 294619.00] | 0.750 | 1.000 | 0.56 |
| C − D | totalTokens | 3 | -2210.00 | [-58571.00, 53781.00] | 0.750 | 1.000 | -0.11 |
| A − B | decisionsTotal | 3 | 6.33 | [1.00, 11.00] | 0.250 | 0.750 | 0.67 |
| B − C | decisionsTotal | 3 | 8.67 | [3.00, 16.00] | 0.250 | 0.750 | 1.00 |
| C − D | decisionsTotal | 3 | 2.67 | [0.00, 4.00] | 0.500 | 0.750 | 0.89 |
| A − B | repairIterations | 3 | 0.00 | [-1.00, 1.00] | 1.000 | 1.000 | 0.00 |
| B − C | repairIterations | 3 | -0.67 | [-3.00, 1.00] | 1.000 | 1.000 | 0.00 |
| C − D | repairIterations | 3 | 0.33 | [0.00, 1.00] | 1.000 | 1.000 | 0.22 |

## Engine runtime (final pages, all viewports)

| Arm | Resolves | Solve ms median | Solve ms p95 | Total ms p95 | Iterations median | Invalid status | Convergence failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| C | 15 | 2.8 | 4.7 | 10.6 | 0 | 5 | 0 |
| D | 15 | 19.0 | 61.3 | 65.5 | 816 | 0 | 0 |

## Correlations (Spearman, attempt level, exploratory)

- decisions~tokens: ρ = 0.32 (n = 12)
- decisions~firstDraftDefects: ρ = 0.57 (n = 12)
- decisions~repairIterations: ρ = 0.21 (n = 12)
- tokens~repairIterations: ρ = 0.76 (n = 12)
- firstDraftDefects~repairIterations: ρ = 0.72 (n = 12)
- decisions~finalDefects: ρ = 0.50 (n = 12)
