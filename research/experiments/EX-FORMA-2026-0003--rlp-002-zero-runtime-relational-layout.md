---
id: EX-FORMA-2026-0003
title: "RLP-002: Zero-runtime relational layout compilation and visual quality"
research_area: agent-ui-construction
status: active
created: 2026-10-22
author_agent: anthropic/claude-code
tests_hypotheses: [RLP-002-H1, RLP-002-H2, RLP-002-H3, RLP-002-H4, RLP-002-H5, RLP-002-H6]
related_theories: []
inputs:
  - .praxis/inbox/documents/2026-10-22-RLP-002.md
  - experiments/RLP-001/REPORT.md
  - experiments/RLP-001/results/full/
  - experiments/RLP-002/BASELINE.md
outputs:
  - experiments/RLP-002/results/
  - experiments/RLP-002/REPORT.md
provenance:
  contributions:
    EXE-20261022T105808600Z-fc3d6356:
      operations: [created]
      at: 2026-10-22T10:59:40.815Z
      actor:
        kind: agent
        id: anthropic/claude-code
        provider: anthropic
        model: unknown
        runtime: claude-code
      reason: "RLP-002 pre-registration"
      evidence: [experiments/RLP-002/PROTOCOL.md]
derived_from: [EX-FORMA-2026-0001]
---

# Experiment

## Research question

Can the RLP-001 relational layout vocabulary compile into deterministic,
zero-runtime HTML and CSS? The compiled form must keep the correctness and
the reduced agent decision count found in RLP-001 (Arm C), and should improve
visual quality toward conventional CSS. Does it earn a permanent place in Forma?

## Hypotheses tested

See `experiments/RLP-002/HYPOTHESES.md`. In summary:

| ID | Hypothesis |
|---|---|
| H1 | Compiled static CSS (Arm E) preserves Arm C's hard invariants. |
| H2 | No run-time layout code is needed. |
| H3 | Refinements (Arm F) improve visual quality over E without new defects. |
| H4 | Independent decisions are non-inferior to C (margin +2). |
| H5 | Correctness is non-inferior to C (margin +0.5 distinct defects). |
| H6 | No material token, build or maintenance cost. |

The ADOPT threshold includes a blind visual rating of at least 4.0/5.

## Variables

- **Independent:** arm (A, B and C archived; E and F new; concurrent C control in Stage 2).
- **Dependent:**
  - correctness: distinct defects by invariant and condition;
  - accessibility violations;
  - layout scripts;
  - visual ratings and defect labels;
  - independent decisions;
  - tokens per accepted interface;
  - repairs;
  - CSS bytes, compiler size and build time.
- **Controlled:** RLP-001 tasks, checks, viewports, held-out conditions, worker model and prompt structure, and validation budget.

## Method

See `experiments/RLP-002/PROTOCOL.md`. In summary:

1. **Stage 1:** deterministic replay of the 36 RLP-001 Arm C pages through E and F, with a gate.
2. **Blind visual review** of A, B, C, E and F in one randomized design.
3. **Stage 2:** 6 held-out tasks × (E, F and a concurrent C control) × 3 = 54 agent attempts, only if Stage 1 passes.

## Acceptance criteria

These are the RLP-001 scoring invariants, unchanged (EX-FORMA-2026-0001).

## Falsification criteria

These are the decision rules in `HYPOTHESES.md`:
- **H1** is falsified by any new hard-invariant defect on a supported page.
- **H4 and H5** fail if the upper 95% CI bound reaches the margin.
- **H3** fails if F is not rated above E, or if F adds defects.

## Controls

- **Arm C** is the reference for correctness and decisions. It is archived for Stage 1 and run concurrently in Stage 2.
- **A and B** are historical references only.

## Procedure

`experiments/RLP-002/README.md` (written with the implementation).

## Results

Pending.

## Threats to validity

- **Same model family.** The analyst and the worker model are the same model family. The analyst also wrote the compiler and the refinements.
- **Archived references.** The A, B and C references are archived.
- **Small sample.** Stage 2 uses 6 task clusters.

## Replication notes

See `experiments/RLP-002/BASELINE.md` and README.

## Conclusion

Pending.

## Registry updates required

Pending results.

## Deviations

None yet.
