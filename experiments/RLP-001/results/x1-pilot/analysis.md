# RLP-001 x1-pilot analysis

Confirmatory: A − D first-draft defects. Everything else exploratory.

Attempts: 3. Tasks: T01-form-account, T03-cards-product, T09-dynamic-checkout.

## Per arm (mean [median])

| Measure | X1 |
| --- | ---: |
| firstDraftDefects | 7.7 [0.0] |
| firstDraftGeometryDefects | 7.7 [0.0] |
| firstDraftAccessibilityDefects | 0.0 [0.0] |
| finalDefects | 0.7 [0.0] |
| finalHeldoutDefects | 0.7 [0.0] |
| finalDynamicDefects | 0.7 [0.0] |
| unexpectedShift | 0.0 [0.0] |
| accepted | 0.7 [1.0] |
| totalTokens | 259454.3 [201092.0] |
| outputTokens | 112.0 [134.0] |
| inputTokens | 259342.3 [201033.0] |
| toolCalls | 6.0 [7.0] |
| durationMs | 37394.3 [25453.0] |
| validationRuns | 1.7 [1.0] |
| repairIterations | 0.7 [0.0] |
| decisionsTotal | 11.0 [11.0] |
| decisionsExplicit | 11.0 [11.0] |
| decisionsDerived | 66.7 [61.0] |
| decisionsCorrective | 2.3 [0.0] |
| decisionsUncertain | 0.0 [0.0] |
| rawStatements | 48.3 [56.0] |
| acceptance rate | 0.67 |
| tokens per accepted interface | 389182 |
| decisions per accepted interface | 16.5 |

## Paired task-level comparisons

| Comparison | Metric | Tasks | Mean diff | 95% bootstrap CI | Wilcoxon p | Holm p | Cliff's δ |
| --- | --- | ---: | ---: | --- | ---: | ---: | ---: |

## Engine runtime (final pages, all viewports)

| Arm | Resolves | Solve ms median | Solve ms p95 | Total ms p95 | Iterations median | Invalid status | Convergence failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| X1 | 15 | 2.6 | 10.4 | 23.5 | 0 | 0 | 0 |

## Correlations (Spearman, attempt level, exploratory)

- decisions~tokens: ρ = 0.50 (n = 3)
- decisions~firstDraftDefects: ρ = 0.00 (n = 3)
- decisions~repairIterations: ρ = 0.00 (n = 3)
- tokens~repairIterations: ρ = 0.87 (n = 3)
- firstDraftDefects~repairIterations: ρ = 1.00 (n = 3)
- decisions~finalDefects: ρ = 0.00 (n = 3)
