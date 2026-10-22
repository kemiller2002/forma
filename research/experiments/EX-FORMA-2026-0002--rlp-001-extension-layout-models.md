---
id: EX-FORMA-2026-0002
title: "RLP-001 extension 01: semantic, hierarchical and Gestalt layout models"
research_area: agent-ui-construction
status: completed
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
  - experiments/RLP-001/results/x1-full/
  - experiments/RLP-001/harness/gestalt.mjs
provenance:
  contributions:
    EXE-20261021T181014746Z-fc9e184b:
      operations: [created, modified]
      at: 2026-10-21T19:01:23.594Z
      last: 2026-10-21T19:54:18.178Z
      actor:
        kind: agent
        id: anthropic/claude-code
        provider: anthropic
        model: unknown
        runtime: claude-code
      evidence: [experiments/RLP-001/REPORT.md]
      reason: "Results, conclusion and status recorded after execution"
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

X1 pilot: all gates passed (`experiments/RLP-001/results/x1-pilot/GATES.md`).
X1 full: 36 attempts, all scored, same model, no leakage. Compared with
Arm C, task-paired and exploratory (`results/x1-full/compare-X1-vs-C.json`):

| Measure | X1 | C | X1 − C | p |
|---|---:|---:|---|---:|
| Decisions | 10.6 | 12.8 | −2.1 [−3.0, −1.2] | 0.002 |
| First-draft defects | 2.33 | 0.31 | +2.03 [0.11, 5.64] | 0.063 |
| Held-out defects | 0.17 | 0.19 | −0.03 | 1.0 |
| Acceptance | 27/36 | 32/36 | | 0.25 |
| Solve p95 | 9.8 ms | 9.3 ms | | |
| Blind visual, overall (1–5) | 3.22 | 3.19 | +0.03 | 0.44 (sign) |

G-metric over final pages, all arms (`results/*/gestalt.json`). Group
separation inversions out of 285 cases:

| Arm | Inversions |
|---|---:|
| A | 9 |
| B | 9 |
| C | 1 |
| D | 8 |
| X1 | 0 |

X1 also had 0 ties. No arm had a proximity failure.

## Analysis

- **X1-H1: supported.** Bond and clearance decisions disappeared.
- **X1-H2: split.** Zero inversions holds by construction. "No more defects
  than C" is not supported: 319 of X1's first-draft defect instances were
  `unexpected-shift`. Spacing derived from nesting height changes when
  dynamic content changes the height. This was recorded at the X1 pilot,
  before the full run.
- **X1-H3: supported.** X1 was not visually worse than C.

## Threats to validity

X1 runs after the main experiment rather than interleaved with it, so comparisons are exploratory. The X1 design was informed by pilot observations from dev tasks.

## Replication notes

See `experiments/RLP-001/README.md`.

## Conclusion

Hierarchy-derived spacing delivers Gestalt grouping by construction and
removes two decisions. Derived from measured depth, though, it couples
spacing to run-time content and causes layout shift. Not recommended as
tested. If pursued, derive spacing from declared role rather than nesting
depth (candidate X1b). Candidate X2 (zero-runtime compilation of the C
vocabulary) is justified by EX-FORMA-2026-0001 and is the next step.

## Registry updates required

None beyond EX-FORMA-2026-0001's hypothesis records. X1 hypotheses are exploratory and recorded here.
