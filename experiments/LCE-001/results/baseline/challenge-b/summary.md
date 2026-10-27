## Baseline (main 28d1101): challenge B (unseen seed) (seed 0000000003ce0003, 200 per family)

200 cases; browser rendering 5462 ms; end to end 8714 ms; Chromium 153.0.8010.12.

| family | cases | cases with an error |
|---|---:|---:|
| challenge | 200 | 194 |

| constraint | findings | cases |
|---|---:|---:|
| `contain.overflow` | 19 | 14 |
| `contain.clipped` | 0 | 0 |
| `padding.preserved` | 1 | 1 |
| `boundary.corner` | 200 | 147 |
| `boundary.clearance` | 23 | 20 |
| `allocation.exceeded` | 619 | 188 |
| `separation.nodes` | 355 | 45 |
| `connector.crosses-node` | 693 | 104 |
| `connector.starts-inside` | 353 | 123 |
| `label.overlaps-node` | 664 | 133 |
| `label.overlaps-label` | 25 | 23 |
| `canvas.containment` | 291 | 91 |
| `nest.containment` | 0 | 0 |
| `viewport.overflow` | 0 | 0 |
| `a11y.min-text` | 0 | 0 |
| `a11y.target-size` | 0 | 0 |
| `determinism` | 0 | 0 |

Diagram cases, static LayoutCheck against rendered errors: both 0, rendered only 194, static only 0, neither 6.

Fonts rendered: latin yes, accented yes, cjk yes, hebrew yes, arabic yes, emoji yes, combining yes
