---
id: HY-FORMA-2026-0002
title: Physics-inspired energy minimization improves agent layout correctness beyond relational rules
research_area: agent-ui-construction
status: rejected
confidence: medium
created: 2026-10-21
author_agent: anthropic/claude-code
supporting_evidence: []
contradicting_evidence: [EX-FORMA-2026-0001]
related_theories: []
supersedes: []
superseded_by: []
provenance:
  contributions:
    EXE-20261021T181014746Z-fc9e184b:
      operations: [created]
      at: 2026-10-21T19:54:17.122Z
      actor:
        kind: agent
        id: anthropic/claude-code
        provider: anthropic
        model: unknown
        runtime: claude-code
      reason: "RLP-001 results consolidated into hypothesis records"
      evidence: [experiments/RLP-001/REPORT.md]
derived_from: [EX-FORMA-2026-0001]
---

# Hypothesis

## Statement

Resolving relational layout by constrained energy minimization (springs for
grouping, separation and compactness) gives agents fewer first-pass defects
than conventional CSS, and more benefit than deterministic rules over the
same relationships, at acceptable runtime cost.

This consolidates RLP-001 hypotheses H1, H6 and H7 (EX-FORMA-2026-0001).

## Mechanism

A global optimum balances competing preferences that fixed rules resolve
locally, so it should fail less often on tight or unusual content.

## Predictions

- Fewer first-draft defects than conventional CSS (H1).
- Fewer first-draft and held-out defects than the rules resolver (H6).
- p95 resolve time ≤ 50 ms with no convergence failures (H7).

## Evidence that would support it

All three predictions holding in EX-FORMA-2026-0001.

## Evidence that would contradict it

- A − D confidence interval including zero.
- D not beating C.
- p95 above 50 ms.

## Tests performed

EX-FORMA-2026-0001, Arm D against Arms A and C (36 attempts each).

## Results

- **H1, D against conventional CSS:** A − D first-draft defects = 0.47,
  CI [−0.19, 1.11], p = 0.18. Not supported.
- **H6, D against rules:** D had more first-draft defects than C (0.81
  against 0.31) and equal held-out defects. Falsified. Global coupling moved
  content above dynamic changes (7 D first drafts against 1 C), and agent
  pages produced the most Gestalt group-separation ties (50).
- **H7, runtime:** p95 solve 105.5 ms, with 9 of 12 tasks above 50 ms. No
  convergence failures. Fails.

## Falsification attempts

Every pre-registered falsification criterion was met.

## Current assessment

Refuted for this design, benchmark and model. Attraction and repulsion remain
one possible mechanism, but on this evidence they add cost without benefit
over semantic rules.

## Next experiment

None planned. Arm D is frozen as a reference control.
