---
id: HY-FORMA-2026-0001
title: Semantic relational layout constraints reduce agent layout decisions and unseen-content defects without a physics solver
research_area: agent-ui-construction
status: supported
confidence: medium
created: 2026-10-21
author_agent: anthropic/claude-code
supporting_evidence: [EX-FORMA-2026-0001]
contradicting_evidence: []
related_theories: []
supersedes: []
superseded_by: []
provenance:
  contributions:
    EXE-20261021T181014746Z-fc9e184b:
      operations: [created]
      at: 2026-10-21T19:54:16.549Z
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

When an agent declares layout as semantic relationships (flow, grouping
bonds, clearance, alignment, equal size, min and max) that are resolved by
deterministic rules, it makes fewer independent layout decisions and produces
pages that stay valid under unseen content, compared with writing
conventional CSS. A general physics solver is not needed for either effect.

This consolidates RLP-001 hypotheses H3, H5 and H6 (EX-FORMA-2026-0001).

## Mechanism

The relational skeleton makes containment, clearance, overflow and offscreen
placement hard constraints. They stop being choices the agent can get wrong.
What remains is choosing the right relationship.

## Predictions

- Fewer explicit and uncertain layout decisions than conventional CSS.
- Fewer final-page defects under held-out text and 200% font.
- No correctness gain from energy minimization over deterministic rules.

## Evidence that would support it

Significant paired reductions in decisions and held-out defects, and D ≤ C on
correctness.

## Evidence that would contradict it

No reduction in decisions or held-out defects, or physics (D) beating rules
(C) on first-draft and held-out defects.

## Tests performed

EX-FORMA-2026-0001: 144 independent agent attempts, 12 tasks × 4 arms × 3
repetitions, scored at 5 viewports, through dynamic steps and under held-out
conditions.

## Results

- **Decisions:** 31.4 (A), 18.8 (B), 12.8 (C) and 12.8 (D) per attempt.
  A − D is 18.6 fewer, p < 0.001.
- **Held-out defects:** 2.56 (A), 0.69 (B), 0.19 (C) and 0.17 (D). A − D
  is 2.39 fewer, CI [0.31, 5.42], p = 0.031.
- **C against D:** C was at least as good as D on every correctness measure
  (H6 falsified). D also missed the runtime threshold (p95 105 ms).

## Falsification attempts

- **H1:** the pre-registered primary test (A − D first-draft defects) was
  not significant (p = 0.18), so the claim does not extend to first-draft
  defects for D.
- **Visual review:** blind review rated conventional CSS higher (4.28
  against about 3.0). Correctness is supported; visual quality is not.

## Current assessment

Supported for decisions and unseen-content robustness, at medium confidence:

- the sample is 12 task clusters;
- the same model family wrote and evaluated the tasks;
- visual quality still lags conventional CSS.

## Next experiment

Compile the relational vocabulary to zero-runtime CSS (X2) and re-score the C
final pages. Then add a page gutter and a "keep together" row relationship,
and repeat the blind visual review.
