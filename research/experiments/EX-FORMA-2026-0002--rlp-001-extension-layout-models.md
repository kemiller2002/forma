---
id: EX-FORMA-2026-0002
title: "RLP-001 extension 01: semantic, hierarchical and Gestalt layout models"
research_area: agent-ui-construction
status: proposed
created: 2026-10-21
author_agent: anthropic/claude-code
tests_hypotheses: [RLP-001-X1-H1, RLP-001-X1-H2, RLP-001-X1-H3]
related_theories: []
inputs:
  - research/experiments/EX-FORMA-2026-0001--relational-layout-physics.md
  - experiments/RLP-001/results/pilot-3/GATES.md
  - .praxis/inbox/documents/2026-10-21-RLP-001-EXT-01.md
outputs:
  - experiments/RLP-001/docs/EXTENSION-01.md
  - experiments/RLP-001/results/x1-pilot/
  - experiments/RLP-001/results/x1/
provenance:
  contributions:
    EXE-20261021T181014746Z-fc9e184b:
      operations: [created]
      at: 2026-10-21T19:01:23.594Z
      actor:
        kind: agent
        id: anthropic/claude-code
        provider: anthropic
        model: unknown
        runtime: claude-code
derived_from: [EX-FORMA-2026-0001]
---

# Experiment

An exploratory extension of EX-FORMA-2026-0001 (RLP-001). The original
experiment's arms, hypotheses H1–H7, metrics and protocol are unchanged and
run first. This record adds separately labeled variants.

## Research question

Does encoding layout through semantic constraints, hierarchical containment
and Gestalt-derived spacing reduce agent decisions and defects as much as, or
more than, attraction and repulsion? Is a general-purpose physics solver
needed at all?

## Hypotheses tested

X1-H1, X1-H2 and X1-H3, as defined in `experiments/RLP-001/docs/EXTENSION-01.md`.

## Variables

Independent: layout model (X1, hierarchy-derived relational, against the main
experiment's A–D). Dependent and controlled variables are the same as
EX-FORMA-2026-0001, plus the G-metric.

## Method

See `experiments/RLP-001/docs/EXTENSION-01.md`: an X1 pilot (3 tasks × 1),
then 12 tasks × 3 repetitions if the gates pass. The harness, scoring, model
and budget are unchanged.

## Acceptance criteria

The same scoring invariants as EX-FORMA-2026-0001.

## Falsification criteria

X1-H1 is falsified if X1's mean independent decisions are not lower than C's on paired tasks. X1-H2 is falsified if X1 shows more first-draft or held-out defects than C, or any hierarchy inversion.

## Controls

Arm C, which has the same resolver and markup vocabulary with author-chosen spacing.

## Procedure

Implement X1 as a separate engine option, pilot, gate, run, score and analyze with the existing harness.

## Results

Pending.

## Analysis

Pending.

## Threats to validity

X1 runs after the main experiment rather than interleaved with it, so comparisons are exploratory. The X1 design was informed by pilot observations from dev tasks.

## Replication notes

See `experiments/RLP-001/README.md`.

## Conclusion

Pending.

## Registry updates required

None until results exist.
