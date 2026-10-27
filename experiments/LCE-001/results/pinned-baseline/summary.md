## Pinned packages: design-system 0.9.0, forma-workflow 1.0.0

15 cases; browser rendering 12292 ms; end to end 13656 ms; Chromium 153.0.8010.12.

| family | cases | cases with an error |
|---|---:|---:|
| causa | 15 | 15 |

| constraint | findings | cases |
|---|---:|---:|
| `contain.overflow` | 0 | 0 |
| `contain.clipped` | 0 | 0 |
| `padding.preserved` | 0 | 0 |
| `boundary.corner` | 15 | 15 |
| `boundary.clearance` | 0 | 0 |
| `allocation.exceeded` | 117 | 15 |
| `separation.nodes` | 67 | 15 |
| `connector.crosses-node` | 197 | 15 |
| `connector.starts-inside` | 80 | 15 |
| `label.overlaps-node` | 122 | 15 |
| `label.overlaps-label` | 0 | 0 |
| `canvas.containment` | 22 | 15 |
| `nest.containment` | 0 | 0 |
| `viewport.overflow` | 0 | 0 |
| `a11y.min-text` | 0 | 0 |
| `a11y.target-size` | 0 | 0 |
| `determinism` | 0 | 0 |

Diagram cases, static LayoutCheck against rendered errors: both 0, rendered only 15, static only 0, neither 0.

Fonts rendered: latin yes, accented yes, cjk yes, hebrew yes, arabic yes, emoji yes, combining yes
