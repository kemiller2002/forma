---
id: EX-FORMA-2026-0004
title: "LCE-001: Adversarial layout research and constraint enforcement"
research_area: layout-constraints
status: completed
created: 2026-10-27
author_agent: anthropic/claude-code
tests_hypotheses: []
related_theories: []
inputs:
  - .praxis/inbox/documents/2026-10-27-LCE-001.md
  - tests/layout/fixtures/causa/
outputs:
  - experiments/LCE-001/REPORT.md
  - experiments/LCE-001/results/
  - tests/layout/
provenance:
  contributions:
    EXE-20261027T133505963Z-36c7489b:
      operations: [created]
      at: 2026-10-27T13:54:03.502Z
      actor:
        kind: agent
        id: anthropic/claude-code
        provider: anthropic
        model: unknown
        runtime: claude-code
      reason: "LCE-001 layout constraint research record"
---

# EX-FORMA-2026-0004: LCE-001

**Question.** Can Forma detect or prevent invalid component layouts before rendering, through explicit geometric constraints instead of visual inspection?

**Design.**

- **Generator.** Deterministic, seeded adversarial generator (`tests/layout/Forma.Layout.Probe`) with five families of 100 cases each, plus a 200-case challenge family built against the corrections.
- **Measurement.** Chromium measures each rendered case (`tests/layout/measure.mjs`).
- **Evaluation.** The F# probe evaluates sixteen rendered-geometry constraints against the visible boundary, including curved and rotated shapes.
- **Static prediction.** `Forma.Workflow.LayoutCheck` is compared with the rendered result.
- **Comparison.** Baseline (`main` `28d1101`) against the corrected implementation on identical seeds, plus two seeds that were unseen during correction (`4ce0004`, `3ce0003`).

**Hypotheses tested.** Each is stated, tested and resolved in `experiments/LCE-001/REPORT.md`:

- Increasing the corner radius at constant padding makes text cross the curve. Confirmed; the transition per padding is recorded.
- Pill nodes cut multi-line text. Confirmed, and corrected.
- A character-count height estimate makes nodes outgrow their allocation. Confirmed, and corrected.
- Rendering at a larger text size breaks px geometry. Confirmed; corrected with rem geometry.
- Nested site typography breaks diagram layout. Confirmed, and corrected.
- Zoom changes relative geometry. Refuted: drift was at most 1.32 px, from rounding.
- Rendering is non-deterministic. Refuted: 0 findings.
- Limen measurement timing contributes. No evidence was found.
- A wider node never needs more height. Holds for boxes only; refuted for ellipses.

**Result.**

- Cases with a Forma-attributable error fell:

  | seed | baseline | corrected |
  |---|---:|---:|
  | `1ce0001` | 113 | 4 |
  | `4ce0004` | 127 | 10 |
  | `2ce0002` | 125 | 0 |
  | `3ce0003` | 120 | 6 |

- All 15 Causa diagram variants pass. They failed through the pinned published packages.
- Static `LayoutCheck` reports the remaining authored-geometry failures before rendering: 51 of 51 diagram failures in the unseen challenge.
- **Decision: ADOPT** the corrections.
- Forma guarantees layout validity only within the documented typography envelope. Rendered measurement remains the authority.
