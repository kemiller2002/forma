## Baseline (main 28d1101): adversarial batch (seed 0000000001ce0001, 100 per family)

500 cases; browser rendering 10947 ms; end to end 16189 ms; Chromium 153.0.8010.12.

| family | cases | cases with an error |
|---|---:|---:|
| rectangle | 100 | 38 |
| rounded | 100 | 47 |
| circle | 100 | 48 |
| nested | 100 | 81 |
| responsive | 100 | 71 |

| constraint | findings | cases |
|---|---:|---:|
| `contain.overflow` | 60 | 56 |
| `contain.clipped` | 0 | 0 |
| `padding.preserved` | 38 | 27 |
| `boundary.corner` | 224 | 151 |
| `boundary.clearance` | 31 | 29 |
| `allocation.exceeded` | 384 | 188 |
| `separation.nodes` | 86 | 46 |
| `connector.crosses-node` | 115 | 54 |
| `connector.starts-inside` | 136 | 39 |
| `label.overlaps-node` | 178 | 73 |
| `label.overlaps-label` | 10 | 10 |
| `canvas.containment` | 160 | 108 |
| `nest.containment` | 21 | 21 |
| `viewport.overflow` | 0 | 0 |
| `a11y.min-text` | 0 | 0 |
| `a11y.target-size` | 0 | 0 |
| `determinism` | 0 | 0 |

Diagram cases, static LayoutCheck against rendered errors: both 0, rendered only 198, static only 0, neither 62.

Fonts rendered: latin yes, accented yes, cjk yes, hebrew yes, arabic yes, emoji yes, combining yes
