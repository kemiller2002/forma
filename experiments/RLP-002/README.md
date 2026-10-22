# RLP-002: zero-runtime relational layout compilation

Workbench for EX-FORMA-2026-0003. It is experimental and isolated: nothing
here is part of the published `@echelon-foundry/design-system` package. The
Forma and Folio production code are unchanged.

| Path | Contents |
|---|---|
| `BASELINE.md`, `PROTOCOL.md`, `HYPOTHESES.md`, `DECISIONS.md` | Pre-registration and the decision log |
| `compiler/` | `rlc`, the F# build-time compiler. `Html.fs` is a lossless tokenizer, `Analysis.fs` classifies relationships as exact, approximated or unsupported, and `Emit.fs` rewrites the page. |
| `compiler/rulesets/` | `E1.css` (gate run 1) and `E2.css` (after the correction cycle): the vocabulary as static CSS |
| `fixtures/` | Minimal reproductions of each approximated or unsupported relationship, plus one supported control |
| `harness/` | `stage1.mjs` (replay and audits), `gate.mjs` (mechanical gate), `fixtures.mjs` (fixture reproductions). They reuse the RLP-001 harness unchanged. |
| `results/stage-1/` | `GATES.md`, per-ruleset per-page records, compiled pages and compiler reports, `gate.json`, the C re-score, `fixtures.json` |
| `REPORT.md` | Results and recommendation |

## Requirements

- Node 22 with Forma's dev dependencies (`npm ci`).
- Chromium (`RLP_CHROMIUM` or `/opt/pw-browsers/chromium`).
- The .NET 10 SDK for the compiler.
- The original RLP-001 worker workspaces (`/home/user/rlp-runs/full/`) for the C re-score. Each is byte-identical to its archived `final.html`.

## Reproduce

```sh
# Compile one page by hand
dotnet build experiments/RLP-002/compiler/Rlc.fsproj -c Release -o /tmp/rlc
dotnet /tmp/rlc/rlc.dll compile in.html out.html report.json assets/rlc/E2.css

# Stage 1 replay of the 36 RLP-001 Arm C pages (compiles, scores C and the ruleset, audits)
node experiments/RLP-002/harness/stage1.mjs --ruleset E1 --parallel 4
node experiments/RLP-002/harness/stage1.mjs --ruleset E2 --parallel 4
node experiments/RLP-002/harness/gate.mjs --ruleset E2

# Fixture reproductions
node experiments/RLP-002/harness/fixtures.mjs --ruleset E2
```

## Compiled page contract

- **Engine script removed.** The `<script src="assets/rlp/rlp.mjs">` tag is deleted, and `<link rel="stylesheet" href="assets/rlc/<ruleset>.css">` is added after `base.css`.
- **Authoring attributes kept.** `data-rl-*` attributes stay as the semantic surface.
- **Per-element values.** These are written as inline custom properties: `--rl-min`, `--rl-max`, `--rl-switch`, `--rl-col` and `--rl-span`.
- **Structural flags.** These are written to `data-rlc`: `switch`, `grid`, `edge-item` and `edge-pre`.
- **No run-time layout.** No layout code runs after load. Dynamic content reflows natively.
