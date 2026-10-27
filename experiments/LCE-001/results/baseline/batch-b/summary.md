## Baseline (main 28d1101): second batch (unseen seed) (seed 0000000004ce0004, 100 per family)

500 cases; browser rendering 10221 ms; end to end 15424 ms; Chromium 153.0.8010.12.

| family | cases | cases with an error |
|---|---:|---:|
| rectangle | 100 | 35 |
| rounded | 100 | 56 |
| circle | 100 | 38 |
| nested | 100 | 80 |
| responsive | 100 | 65 |

| constraint | findings | cases |
|---|---:|---:|
| `contain.overflow` | 69 | 66 |
| `contain.clipped` | 0 | 0 |
| `padding.preserved` | 38 | 18 |
| `boundary.corner` | 199 | 141 |
| `boundary.clearance` | 23 | 23 |
| `allocation.exceeded` | 329 | 175 |
| `separation.nodes` | 77 | 42 |
| `connector.crosses-node` | 79 | 41 |
| `connector.starts-inside` | 85 | 33 |
| `label.overlaps-node` | 166 | 67 |
| `label.overlaps-label` | 13 | 9 |
| `canvas.containment` | 148 | 99 |
| `nest.containment` | 13 | 13 |
| `viewport.overflow` | 0 | 0 |
| `a11y.min-text` | 0 | 0 |
| `a11y.target-size` | 0 | 0 |
| `determinism` | 0 | 0 |

Diagram cases, static LayoutCheck against rendered errors: both 0, rendered only 192, static only 0, neither 67.

Fonts rendered: latin yes, accented yes, cjk yes, hebrew yes, arabic yes, emoji yes, combining yes
