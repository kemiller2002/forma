## Candidate (LCE-001): challenge B (unseen seed) (seed 0000000003ce0003, 200 per family)

200 cases; browser rendering 6014 ms; end to end 10867 ms; Chromium 153.0.8010.12.

| family | cases | cases with an error |
|---|---:|---:|
| challenge | 200 | 51 |

| constraint | findings | cases |
|---|---:|---:|
| `contain.overflow` | 22 | 17 |
| `contain.clipped` | 0 | 0 |
| `padding.preserved` | 1 | 1 |
| `boundary.corner` | 3 | 3 |
| `boundary.clearance` | 0 | 0 |
| `allocation.exceeded` | 28 | 25 |
| `separation.nodes` | 5 | 5 |
| `connector.crosses-node` | 3 | 3 |
| `connector.starts-inside` | 13 | 8 |
| `label.overlaps-node` | 14 | 10 |
| `label.overlaps-label` | 3 | 3 |
| `canvas.containment` | 9 | 8 |
| `nest.containment` | 0 | 0 |
| `viewport.overflow` | 0 | 0 |
| `a11y.min-text` | 0 | 0 |
| `a11y.target-size` | 0 | 0 |
| `determinism` | 0 | 0 |

Diagram cases, static LayoutCheck against rendered errors: both 51, rendered only 0, static only 0, neither 149.

Fonts rendered: latin yes, accented yes, cjk yes, hebrew yes, arabic yes, emoji yes, combining yes
