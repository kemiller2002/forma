# Layout constraint probe (LCE-001)

An adversarial, deterministic test system for Forma layout. It generates
component and diagram configurations, renders them with the built Forma
stylesheets and the `Forma.Workflow` engine, has Chromium measure the result,
and evaluates the measured geometry against explicit constraints. The research
record is `experiments/LCE-001/REPORT.md`.

| Path | Contents |
|---|---|
| `Forma.Layout.Probe/` | The F# probe: seeded generators (`Families.fs`), fixture pages (`Pages.fs`), the browser adapter call and decoding (`Measure.fs`), rendered-geometry constraints (`Constraints.fs`), boundary sweeps and minimisation (`Search.fs`), fixture codec and summaries (`Report.fs`). |
| `measure.mjs` | The measurement adapter. It only observes (rects, text line boxes, computed styles, connector paths); every constraint is evaluated in F#. |
| `fixtures/minimized/` | Minimised failures of the baseline batch, each with its seed, minimisation trail, expectation and disposition. |
| `fixtures/causa/` | The three historical Causa causal-analysis diagrams, derived offline from `kemiller2002/causa-data` the way the Causa app builds them, at five viewport, zoom and text-size settings. |

Shape geometry (CSS radius normalisation, inner borders, curved and rotated
boundaries) is `src/workflow/Forma.Workflow/LayoutGeometry.fs`; static layout
validation is `LayoutCheck.fs` in the same library.

## Commands

Build Forma first (`npm run build`), so `dist/` holds the stylesheets under test.

```sh
npm run test:layout                                   # regression: every stored fixture keeps its expectation
npm run layout:probe -- run --count 100 --repeat      # 100 cases per family, seed 1ce0001, determinism re-render
npm run layout:probe -- run --families challenge --count 200 --seed 2ce0002
npm run layout:probe -- sweeps                        # radius x padding, pill length, zoom, text scale
npm run layout:probe -- minimize --from tests/layout/out
npm run layout:probe -- causa --data ../causa-data    # re-derive the Causa fixtures
npm run layout:probe -- pinned --packages DIR         # Causa fixtures through published packages (DIR/ds/package, DIR/fw/package)
```

Output goes to `tests/layout/out/` (ignored): `findings.json` (one record per
violation: case, seed, component, constraint, expected, observed, excess,
viewport, typography, computed styles, severity), `summary.json`,
`summary.md` and `cases.json` (every generated case, re-loadable).

## Constraints

`contain.overflow`, `contain.clipped`, `padding.preserved`, `boundary.corner`,
`boundary.clearance`, `allocation.exceeded`, `separation.nodes`,
`connector.crosses-node`, `connector.starts-inside`, `label.overlaps-node`,
`label.overlaps-label`, `canvas.containment`, `nest.containment`,
`viewport.overflow`, `a11y.min-text`, `a11y.target-size` and `determinism`.
`Constraints.catalog` states each one.

A case's rendered result is only as good as its fonts: every run records
whether Latin, accented, CJK, Hebrew, Arabic, emoji and combining-mark probes
rendered with a real glyph.
