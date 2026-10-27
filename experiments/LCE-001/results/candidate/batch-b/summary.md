## Candidate (LCE-001): second batch (unseen seed) (seed 0000000004ce0004, 100 per family)

500 cases; browser rendering 11323 ms; end to end 18019 ms; Chromium 153.0.8010.12.

| family | cases | cases with an error |
|---|---:|---:|
| rectangle | 100 | 9 |
| rounded | 100 | 9 |
| circle | 100 | 24 |
| nested | 100 | 32 |
| responsive | 100 | 35 |

| constraint | findings | cases |
|---|---:|---:|
| `contain.overflow` | 41 | 41 |
| `contain.clipped` | 0 | 0 |
| `padding.preserved` | 53 | 21 |
| `boundary.corner` | 33 | 33 |
| `boundary.clearance` | 8 | 8 |
| `allocation.exceeded` | 49 | 42 |
| `separation.nodes` | 4 | 4 |
| `connector.crosses-node` | 1 | 1 |
| `connector.starts-inside` | 8 | 5 |
| `label.overlaps-node` | 6 | 5 |
| `label.overlaps-label` | 2 | 2 |
| `canvas.containment` | 22 | 22 |
| `nest.containment` | 13 | 13 |
| `viewport.overflow` | 0 | 0 |
| `a11y.min-text` | 0 | 0 |
| `a11y.target-size` | 0 | 0 |
| `determinism` | 0 | 0 |

Diagram cases, static LayoutCheck against rendered errors: both 52, rendered only 4, static only 4, neither 199.

Fonts rendered: latin yes, accented yes, cjk yes, hebrew yes, arabic yes, emoji yes, combining yes
