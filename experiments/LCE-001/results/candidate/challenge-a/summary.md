## Candidate (LCE-001): challenge A (seed 0000000002ce0002, 200 per family)

200 cases; browser rendering 5862 ms; end to end 10343 ms; Chromium 153.0.8010.12.

| family | cases | cases with an error |
|---|---:|---:|
| challenge | 200 | 39 |

| constraint | findings | cases |
|---|---:|---:|
| `contain.overflow` | 27 | 19 |
| `contain.clipped` | 0 | 0 |
| `padding.preserved` | 0 | 0 |
| `boundary.corner` | 5 | 5 |
| `boundary.clearance` | 1 | 1 |
| `allocation.exceeded` | 20 | 18 |
| `separation.nodes` | 6 | 6 |
| `connector.crosses-node` | 3 | 3 |
| `connector.starts-inside` | 8 | 5 |
| `label.overlaps-node` | 10 | 7 |
| `label.overlaps-label` | 2 | 2 |
| `canvas.containment` | 7 | 7 |
| `nest.containment` | 0 | 0 |
| `viewport.overflow` | 0 | 0 |
| `a11y.min-text` | 0 | 0 |
| `a11y.target-size` | 0 | 0 |
| `determinism` | 0 | 0 |

Diagram cases, static LayoutCheck against rendered errors: both 38, rendered only 1, static only 1, neither 160.

Fonts rendered: latin yes, accented yes, cjk yes, hebrew yes, arabic yes, emoji yes, combining yes
