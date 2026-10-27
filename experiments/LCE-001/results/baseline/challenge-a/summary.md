## Baseline (main 28d1101): challenge A (seed 0000000002ce0002, 200 per family)

200 cases; browser rendering 5768 ms; end to end 9134 ms; Chromium 153.0.8010.12.

| family | cases | cases with an error |
|---|---:|---:|
| challenge | 200 | 193 |

| constraint | findings | cases |
|---|---:|---:|
| `contain.overflow` | 23 | 16 |
| `contain.clipped` | 0 | 0 |
| `padding.preserved` | 0 | 0 |
| `boundary.corner` | 203 | 138 |
| `boundary.clearance` | 20 | 19 |
| `allocation.exceeded` | 647 | 184 |
| `separation.nodes` | 465 | 49 |
| `connector.crosses-node` | 846 | 112 |
| `connector.starts-inside` | 351 | 114 |
| `label.overlaps-node` | 791 | 137 |
| `label.overlaps-label` | 30 | 21 |
| `canvas.containment` | 293 | 86 |
| `nest.containment` | 0 | 0 |
| `viewport.overflow` | 0 | 0 |
| `a11y.min-text` | 0 | 0 |
| `a11y.target-size` | 0 | 0 |
| `determinism` | 0 | 0 |

Diagram cases, static LayoutCheck against rendered errors: both 0, rendered only 193, static only 0, neither 7.

Fonts rendered: latin yes, accented yes, cjk yes, hebrew yes, arabic yes, emoji yes, combining yes
