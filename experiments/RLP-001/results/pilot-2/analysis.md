# RLP-001 pilot-2 analysis

Confirmatory: A − D first-draft defects. Everything else exploratory.

Attempts: 12. Tasks: T01-form-account, T03-cards-product, T09-dynamic-checkout.

## Per arm (mean [median])

| Measure | A | B | C | D |
| --- | ---: | ---: | ---: | ---: |
| firstDraftDefects | 0.3 [0.0] | 5.7 [4.0] | 0.7 [0.0] | 0.7 [0.0] |
| firstDraftGeometryDefects | 0.3 [0.0] | 5.7 [4.0] | 0.7 [0.0] | 0.7 [0.0] |
| firstDraftAccessibilityDefects | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] |
| finalDefects | 0.0 [0.0] | 0.3 [0.0] | 0.0 [0.0] | 0.7 [0.0] |
| finalHeldoutDefects | 2.3 [0.0] | 0.7 [1.0] | 0.3 [0.0] | 0.7 [0.0] |
| finalDynamicDefects | 0.0 [0.0] | 0.3 [0.0] | 0.0 [0.0] | 0.7 [0.0] |
| unexpectedShift | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] |
| accepted | 1.0 [1.0] | 0.7 [1.0] | 1.0 [1.0] | 0.7 [1.0] |
| totalTokens | 214964.7 [197941.0] | 335532.0 [315189.0] | 257965.3 [199649.0] | 199096.7 [198677.0] |
| outputTokens | 126.3 [128.0] | 147.7 [136.0] | 135.3 [128.0] | 124.7 [125.0] |
| inputTokens | 214838.3 [197818.0] | 335384.3 [315053.0] | 257830.0 [199521.0] | 198972.0 [198550.0] |
| toolCalls | 5.3 [5.0] | 9.3 [9.0] | 7.0 [7.0] | 6.0 [7.0] |
| durationMs | 27052.3 [25706.0] | 32916.0 [30347.0] | 32251.3 [24192.0] | 24251.3 [24260.0] |
| validationRuns | 1.3 [1.0] | 1.7 [2.0] | 1.7 [1.0] | 1.0 [1.0] |
| repairIterations | 0.3 [0.0] | 0.7 [1.0] | 0.7 [0.0] | 0.0 [0.0] |
| decisionsTotal | 33.7 [33.0] | 19.0 [18.0] | 13.0 [13.0] | 12.7 [12.0] |
| decisionsExplicit | 33.0 [32.0] | 19.0 [18.0] | 13.0 [13.0] | 12.7 [12.0] |
| decisionsDerived | 0.0 [0.0] | 26.3 [30.0] | 63.0 [65.0] | 60.0 [53.0] |
| decisionsCorrective | 0.7 [0.0] | 2.3 [1.0] | 3.0 [0.0] | 0.0 [0.0] |
| decisionsUncertain | 0.7 [1.0] | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] |
| rawStatements | 45.0 [44.0] | 29.3 [31.0] | 61.7 [70.0] | 52.7 [59.0] |
| acceptance rate | 1.00 | 0.67 | 1.00 | 0.67 |
| tokens per accepted interface | 214965 | 503298 | 257965 | 298645 |
| decisions per accepted interface | 33.7 | 28.5 | 13.0 | 19.0 |

## Paired task-level comparisons

| Comparison | Metric | Tasks | Mean diff | 95% bootstrap CI | Wilcoxon p | Holm p | Cliff's δ |
| --- | --- | ---: | ---: | --- | ---: | ---: | ---: |
| A − D | firstDraftDefects | 3 | -0.33 | [-1.00, 0.00] | 1.000 | — | -0.11 |
| A − D | totalTokens | 3 | 15868.00 | [-2829.00, 50796.00] | 1.000 | — | -0.33 |
| A − D | decisionsTotal | 3 | 21.00 | [10.00, 32.00] | 0.250 | — | 1.00 |
| A − D | repairIterations | 3 | 0.33 | [0.00, 1.00] | 1.000 | — | 0.33 |
| A − D | finalHeldoutDefects | 3 | 1.67 | [0.00, 5.00] | 1.000 | — | 0.11 |
| A − D | finalDefects | 3 | -0.67 | [-2.00, 0.00] | 1.000 | — | -0.33 |
| A − B | firstDraftDefects | 3 | -5.33 | [-12.00, 0.00] | 0.500 | 1.000 | -0.89 |
| B − C | firstDraftDefects | 3 | 5.00 | [-1.00, 12.00] | 0.500 | 1.000 | 0.78 |
| C − D | firstDraftDefects | 3 | 0.00 | [0.00, 0.00] | 1.000 | 1.000 | 0.00 |
| A − B | finalDefects | 3 | -0.33 | [-1.00, 0.00] | 1.000 | 1.000 | -0.33 |
| B − C | finalDefects | 3 | 0.33 | [0.00, 1.00] | 1.000 | 1.000 | 0.33 |
| C − D | finalDefects | 3 | -0.67 | [-2.00, 0.00] | 1.000 | 1.000 | -0.33 |
| A − B | finalHeldoutDefects | 3 | 1.67 | [-1.00, 6.00] | 1.000 | 1.000 | -0.11 |
| B − C | finalHeldoutDefects | 3 | 0.33 | [0.00, 1.00] | 1.000 | 1.000 | 0.33 |
| C − D | finalHeldoutDefects | 3 | -0.33 | [-1.00, 0.00] | 1.000 | 1.000 | -0.11 |
| A − B | totalTokens | 3 | -120567.33 | [-239803.00, -4651.00] | 0.250 | 0.750 | -1.00 |
| B − C | totalTokens | 3 | 77566.67 | [-120515.00, 236002.00] | 0.750 | 1.000 | 0.56 |
| C − D | totalTokens | 3 | 58868.67 | [-328.00, 175962.00] | 0.500 | 1.000 | 0.11 |
| A − B | decisionsTotal | 3 | 14.67 | [7.00, 21.00] | 0.250 | 0.750 | 1.00 |
| B − C | decisionsTotal | 3 | 6.00 | [3.00, 11.00] | 0.250 | 0.750 | 1.00 |
| C − D | decisionsTotal | 3 | 0.33 | [0.00, 1.00] | 1.000 | 1.000 | 0.11 |
| A − B | repairIterations | 3 | -0.33 | [-1.00, 1.00] | 1.000 | 1.000 | -0.33 |
| B − C | repairIterations | 3 | 0.00 | [-2.00, 1.00] | 1.000 | 1.000 | 0.11 |
| C − D | repairIterations | 3 | 0.67 | [0.00, 2.00] | 1.000 | 1.000 | 0.33 |

## Engine runtime (final pages, all viewports)

| Arm | Resolves | Solve ms median | Solve ms p95 | Total ms p95 | Iterations median | Invalid status | Convergence failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| C | 15 | 2.6 | 3.3 | 9.9 | 0 | 0 | 0 |
| D | 15 | 21.1 | 71.4 | 76.8 | 855 | 0 | 0 |

## Correlations (Spearman, attempt level, exploratory)

- decisions~tokens: ρ = -0.21 (n = 12)
- decisions~firstDraftDefects: ρ = -0.09 (n = 12)
- decisions~repairIterations: ρ = 0.03 (n = 12)
- tokens~repairIterations: ρ = 0.77 (n = 12)
- firstDraftDefects~repairIterations: ρ = 0.75 (n = 12)
- decisions~finalDefects: ρ = -0.20 (n = 12)
