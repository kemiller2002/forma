# RLP-001 x1-full analysis

Confirmatory: A − D first-draft defects. Everything else exploratory.

Attempts: 36. Tasks: T01-form-account, T02-form-shipping, T03-cards-product, T04-cards-profile, T05-dashboard-ops, T06-dashboard-finance, T07-nav-docs, T08-nav-workspace, T09-dynamic-checkout, T10-dynamic-thread, T11-adversarial-settings, T12-adversarial-pricing.

## Per arm (mean [median])

| Measure | X1 |
| --- | ---: |
| firstDraftDefects | 2.3 [0.0] |
| firstDraftGeometryDefects | 2.3 [0.0] |
| firstDraftAccessibilityDefects | 0.0 [0.0] |
| finalDefects | 0.3 [0.0] |
| finalHeldoutDefects | 0.2 [0.0] |
| finalDynamicDefects | 0.3 [0.0] |
| unexpectedShift | 0.1 [0.0] |
| accepted | 0.8 [1.0] |
| totalTokens | 233756.1 [199965.0] |
| outputTokens | 518.1 [122.0] |
| inputTokens | 233237.9 [198342.5] |
| toolCalls | 5.1 [4.0] |
| durationMs | 40500.3 [36181.5] |
| validationRuns | 1.5 [1.0] |
| repairIterations | 0.5 [0.0] |
| decisionsTotal | 10.6 [10.0] |
| decisionsExplicit | 10.6 [10.0] |
| decisionsDerived | 49.5 [53.5] |
| decisionsCorrective | 1.1 [0.0] |
| decisionsUncertain | 0.0 [0.0] |
| rawStatements | 31.6 [31.5] |
| acceptance rate | 0.75 |
| tokens per accepted interface | 311675 |
| decisions per accepted interface | 14.2 |

## Paired task-level comparisons

| Comparison | Metric | Tasks | Mean diff | 95% bootstrap CI | Wilcoxon p | Holm p | Cliff's δ |
| --- | --- | ---: | ---: | --- | ---: | ---: | ---: |

## Engine runtime (final pages, all viewports)

| Arm | Resolves | Solve ms median | Solve ms p95 | Total ms p95 | Iterations median | Invalid status | Convergence failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| X1 | 180 | 3.3 | 9.8 | 28.3 | 0 | 0 | 0 |

## Correlations (Spearman, attempt level, exploratory)

- decisions~tokens: ρ = 0.17 (n = 36)
- decisions~firstDraftDefects: ρ = -0.12 (n = 36)
- decisions~repairIterations: ρ = -0.14 (n = 36)
- tokens~repairIterations: ρ = 0.75 (n = 36)
- firstDraftDefects~repairIterations: ρ = 0.84 (n = 36)
- decisions~finalDefects: ρ = -0.04 (n = 36)
