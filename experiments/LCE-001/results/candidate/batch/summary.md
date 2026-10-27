## Candidate (LCE-001): adversarial batch (seed 0000000001ce0001, 100 per family)

500 cases; browser rendering 10948 ms; end to end 17216 ms; Chromium 153.0.8010.12.

| family | cases | cases with an error |
|---|---:|---:|
| rectangle | 100 | 12 |
| rounded | 100 | 15 |
| circle | 100 | 33 |
| nested | 100 | 42 |
| responsive | 100 | 31 |

| constraint | findings | cases |
|---|---:|---:|
| `contain.overflow` | 37 | 37 |
| `contain.clipped` | 0 | 0 |
| `padding.preserved` | 53 | 25 |
| `boundary.corner` | 35 | 35 |
| `boundary.clearance` | 14 | 14 |
| `allocation.exceeded` | 74 | 62 |
| `separation.nodes` | 10 | 7 |
| `connector.crosses-node` | 5 | 4 |
| `connector.starts-inside` | 27 | 14 |
| `label.overlaps-node` | 13 | 12 |
| `label.overlaps-label` | 0 | 0 |
| `canvas.containment` | 29 | 28 |
| `nest.containment` | 20 | 20 |
| `viewport.overflow` | 0 | 0 |
| `a11y.min-text` | 0 | 0 |
| `a11y.target-size` | 0 | 0 |
| `determinism` | 0 | 0 |

Diagram cases, static LayoutCheck against rendered errors: both 65, rendered only 2, static only 3, neither 190.

Fonts rendered: latin yes, accented yes, cjk yes, hebrew yes, arabic yes, emoji yes, combining yes
