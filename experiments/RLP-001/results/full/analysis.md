# RLP-001 full analysis

Confirmatory: A − D first-draft defects. Everything else exploratory.

Attempts: 144. Tasks: T01-form-account, T02-form-shipping, T03-cards-product, T04-cards-profile, T05-dashboard-ops, T06-dashboard-finance, T07-nav-docs, T08-nav-workspace, T09-dynamic-checkout, T10-dynamic-thread, T11-adversarial-settings, T12-adversarial-pricing.

## Per arm (mean [median])

| Measure | A | B | C | D |
| --- | ---: | ---: | ---: | ---: |
| firstDraftDefects | 1.3 [1.0] | 1.1 [1.0] | 0.3 [0.0] | 0.8 [0.0] |
| firstDraftGeometryDefects | 1.3 [1.0] | 1.1 [1.0] | 0.3 [0.0] | 0.8 [0.0] |
| firstDraftAccessibilityDefects | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] | 0.0 [0.0] |
| finalDefects | 0.1 [0.0] | 0.1 [0.0] | 0.2 [0.0] | 0.2 [0.0] |
| finalHeldoutDefects | 2.6 [0.0] | 0.7 [0.0] | 0.2 [0.0] | 0.2 [0.0] |
| finalDynamicDefects | 0.1 [0.0] | 0.1 [0.0] | 0.2 [0.0] | 0.2 [0.0] |
| unexpectedShift | 0.0 [0.0] | 0.1 [0.0] | 0.0 [0.0] | 0.1 [0.0] |
| accepted | 0.9 [1.0] | 0.9 [1.0] | 0.9 [1.0] | 0.8 [1.0] |
| totalTokens | 244416.0 [250314.5] | 272379.1 [252212.5] | 226757.2 [199602.5] | 218735.1 [199578.5] |
| outputTokens | 296.9 [124.5] | 437.3 [131.0] | 352.0 [120.5] | 457.4 [124.0] |
| inputTokens | 244119.1 [249678.0] | 271941.8 [252060.5] | 226405.2 [199293.0] | 218277.7 [199269.5] |
| toolCalls | 7.2 [8.0] | 7.3 [7.0] | 7.0 [7.0] | 6.7 [7.0] |
| durationMs | 44652.4 [41096.0] | 40297.9 [38666.5] | 39275.4 [37132.5] | 33701.0 [31772.5] |
| validationRuns | 1.7 [2.0] | 1.6 [2.0] | 1.4 [1.0] | 1.3 [1.0] |
| repairIterations | 0.7 [1.0] | 0.6 [1.0] | 0.4 [0.0] | 0.3 [0.0] |
| decisionsTotal | 31.4 [32.0] | 18.8 [19.0] | 12.8 [12.5] | 12.8 [13.0] |
| decisionsExplicit | 30.6 [31.0] | 18.6 [19.0] | 12.8 [12.5] | 12.8 [13.0] |
| decisionsDerived | 0.0 [0.0] | 28.9 [29.0] | 48.8 [53.0] | 48.2 [53.0] |
| decisionsCorrective | 1.7 [1.0] | 2.3 [0.0] | 0.7 [0.0] | 0.8 [0.0] |
| decisionsUncertain | 0.8 [1.0] | 0.3 [0.0] | 0.0 [0.0] | 0.0 [0.0] |
| rawStatements | 44.6 [46.0] | 31.3 [32.0] | 40.4 [41.0] | 39.2 [40.5] |
| acceptance rate | 0.92 | 0.89 | 0.89 | 0.83 |
| tokens per accepted interface | 266636 | 306426 | 255102 | 262482 |
| decisions per accepted interface | 34.2 | 21.2 | 14.3 | 15.3 |

## Paired task-level comparisons

| Comparison | Metric | Tasks | Mean diff | 95% bootstrap CI | Wilcoxon p | Holm p | Cliff's δ |
| --- | --- | ---: | ---: | --- | ---: | ---: | ---: |
| A − D | firstDraftDefects | 12 | 0.47 | [-0.19, 1.11] | 0.176 | — | 0.24 |
| A − D | totalTokens | 12 | 25680.83 | [8512.80, 42432.07] | 0.034 | — | 0.06 |
| A − D | decisionsTotal | 12 | 18.61 | [16.14, 21.25] | 0.000 | — | 0.99 |
| A − D | repairIterations | 12 | 0.44 | [0.19, 0.69] | 0.016 | — | 0.36 |
| A − D | finalHeldoutDefects | 12 | 2.39 | [0.31, 5.42] | 0.031 | — | 0.27 |
| A − D | finalDefects | 12 | -0.14 | [-0.28, -0.03] | 0.125 | — | -0.09 |
| A − B | firstDraftDefects | 12 | 0.17 | [-0.56, 0.78] | 0.447 | 0.447 | 0.04 |
| B − C | firstDraftDefects | 12 | 0.81 | [0.17, 1.44] | 0.051 | 0.152 | 0.39 |
| C − D | firstDraftDefects | 12 | -0.50 | [-1.22, -0.03] | 0.125 | 0.250 | -0.14 |
| A − B | finalDefects | 12 | -0.06 | [-0.19, 0.06] | 0.750 | 1.000 | -0.03 |
| B − C | finalDefects | 12 | -0.03 | [-0.22, 0.11] | 1.000 | 1.000 | -0.00 |
| C − D | finalDefects | 12 | -0.06 | [-0.14, 0.00] | 0.500 | 1.000 | -0.05 |
| A − B | finalHeldoutDefects | 12 | 1.86 | [0.08, 4.11] | 0.129 | 0.387 | 0.17 |
| B − C | finalHeldoutDefects | 12 | 0.50 | [-0.08, 1.33] | 0.281 | 0.563 | 0.11 |
| C − D | finalHeldoutDefects | 12 | 0.03 | [-0.06, 0.11] | 1.000 | 1.000 | 0.00 |
| A − B | totalTokens | 12 | -27963.08 | [-63666.34, 4100.41] | 0.176 | 0.353 | -0.25 |
| B − C | totalTokens | 12 | 45621.83 | [10189.27, 86888.42] | 0.064 | 0.192 | 0.21 |
| C − D | totalTokens | 12 | 8022.08 | [-7463.74, 25034.58] | 0.519 | 0.519 | 0.02 |
| A − B | decisionsTotal | 12 | 12.56 | [9.47, 15.75] | 0.000 | 0.001 | 0.82 |
| B − C | decisionsTotal | 12 | 6.08 | [3.19, 9.17] | 0.002 | 0.005 | 0.58 |
| C − D | decisionsTotal | 12 | -0.03 | [-0.58, 0.56] | 0.953 | 0.953 | -0.01 |
| A − B | repairIterations | 12 | 0.08 | [-0.28, 0.44] | 0.758 | 1.000 | 0.05 |
| B − C | repairIterations | 12 | 0.25 | [-0.17, 0.64] | 0.219 | 0.656 | 0.29 |
| C − D | repairIterations | 12 | 0.11 | [-0.22, 0.50] | 0.625 | 1.000 | -0.01 |

## Engine runtime (final pages, all viewports)

| Arm | Resolves | Solve ms median | Solve ms p95 | Total ms p95 | Iterations median | Invalid status | Convergence failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| C | 180 | 2.8 | 9.3 | 23.1 | 0 | 0 | 0 |
| D | 180 | 33.9 | 105.5 | 109.2 | 820 | 0 | 0 |

## Correlations (Spearman, attempt level, exploratory)

- decisions~tokens: ρ = 0.20 (n = 144)
- decisions~firstDraftDefects: ρ = 0.27 (n = 144)
- decisions~repairIterations: ρ = 0.28 (n = 144)
- tokens~repairIterations: ρ = 0.75 (n = 144)
- firstDraftDefects~repairIterations: ρ = 0.85 (n = 144)
- decisions~finalDefects: ρ = -0.07 (n = 144)
