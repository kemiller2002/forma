# RLP-001: relational layout physics

Experiment workbench for EX-FORMA-2026-0001
(`research/experiments/EX-FORMA-2026-0001--relational-layout-physics.md`).
Experimental and isolated: nothing here is part of the published
`@echelon-foundry/design-system` package, its stylesheets or its exports.

| Path | Contents |
|---|---|
| `baseline.json` | Baseline commits of every repository consulted, plus tool versions. |
| `engine/` | Relational layout engine: shared core, Arm C rules resolver, Arm D physics resolver, browser adapter, unit tests. See `docs/ENGINE.md`. |
| `arms/` | `base.css` (shared by all arms, lowest cascade layer) and the guide each arm's workers receive. |
| `tasks/tasks.mjs` | The 12 benchmark task definitions (6 dev, 6 held out). |
| `harness/` | Workspace builder, validator, geometry checks, evaluation, decision classifier, usage extraction, collection, analysis, blind visual and rubric reviews. |
| `docs/` | `ENGINE.md` (mathematics and solver), `DECISION-RUBRIC.md`. |
| `results/<phase>/` | `manifest.json` (attempts, seed, order, engine commit), `agents.json`, `attempts/*.json` (raw per-attempt measurements), `artifacts/*/` (first draft, final page, validation log, decision evidence), `analysis.json`/`.md`, reviews, `GATES.md` for pilots. |
| `REPORT.md` | Research report and recommendation. |

## Requirements

Node 22, the Forma dev dependencies (`npm ci` at the repository root), and
Chromium (set `RLP_CHROMIUM` if it is not at `/opt/pw-browsers/chromium`).
Arm B needs the built Forma CSS (`npm run tokens:build && node tools/build-assets.mjs`,
which needs the .NET 10 SDK).

## Reproduce

```sh
# Engine unit tests
node --test experiments/RLP-001/engine/test/core.test.mjs

# Plan a phase: creates isolated workspaces and a randomized manifest
node experiments/RLP-001/harness/plan.mjs --phase full --seed 20261024 --model sonnet --runs-root /path/to/runs

# Run each attempt: give a fresh general-purpose agent (same model for all)
# the `prompt` field of its manifest entry. Record attemptId → agent
# transcript in results/<phase>/agents.json.

# Score every finished attempt (first draft and final page, full conditions)
experiments/RLP-001/harness/collect-phase.sh full 4

# Analysis, blind visual review, rubric reliability
node experiments/RLP-001/harness/analyze.mjs --phase full
node experiments/RLP-001/harness/visual.mjs prepare --phase full --seed 7 --reviewers 2 --chunks 6
node experiments/RLP-001/harness/visual.mjs score --phase full
node experiments/RLP-001/harness/rubric-review.mjs prepare --phase full --per-arm 20 --seed 11
node experiments/RLP-001/harness/rubric-review.mjs score --phase full
```

A worker can be checked by hand: open its workspace, read `AGENT.md`, and run
`./validate`.

## Conditions

- **Dev (what workers see through `validate`):** 375 and 1024 px, initial render and every dynamic step, axe at 1024 px; at most 5 runs.
- **Scoring (`collect`):** 320, 375, 768, 1024 and 1440 px × initial render and every dynamic step, axe at every width, held-out text at 320/1440 px, 200% text at 375/768 px, determinism reload at 1024 px. Both the first draft (validation run 1) and the final page are scored.
