# RLP-002 baseline

Recorded 2026-10-22 before any RLP-002 implementation.

## Source commits

| Repository | Commit | Note |
|---|---|---|
| kemiller2002/forma | `888279d0f1776dbd358518dcb38d953fd9f158ea` | `main` after merging RLP-001 (PR #167); RLP-002 branches from here |
| kemiller2002/praxis | `64005151118caa34da4f9a7fc194bc498cbcc37a` | unchanged since RLP-001 |
| kemiller2002/dokimos | `c99c21b3cb78105416a5379d599f5b0f9bbec638` | unchanged since RLP-001 |
| kemiller2002/ordo | `f69f8ac8a094ec5cbf5da946e612f199fa9f478c` | unchanged since RLP-001 |
| kemiller2002/research-documents | `62bf983` (`origin/main`) | moved since RLP-001 (`f6778c2`); not modified by RLP-002 so far |

RLP-001 engine and harness: frozen at the commits recorded in
`experiments/RLP-001/results/<phase>/manifest.json`. The full run engine
commit is `e4d5c76`. All RLP-001 files are read-only inputs to RLP-002.

## Tools

| Tool | Version |
|---|---|
| Node.js | v22.22.0 |
| .NET SDK | 10.0.402 (F#, as used by Forma's `tools/TokenCompiler`, `BrandCompiler`) |
| Playwright | 1.63.0 |
| Chromium | 141.0.7390.37 (`/opt/pw-browsers/chromium`) |
| @axe-core/playwright | 4.13.0 |
| praxis | 3.7.2 |
| Worker model (RLP-001) | `claude-sonnet-5-5` via the `sonnet` agent alias, `general-purpose` agent type |

## Preserved RLP-001 evidence (verified present)

- **Full-run artifacts:** `experiments/RLP-001/results/full/artifacts/<attempt>/` holds `first.html`, `final.html`, `validation-log.jsonl` and `decision-evidence.json` for all 144 attempts. 36 of these are Arm C.
- **Per-attempt measurements:** `experiments/RLP-001/results/full/attempts/<attempt>.json` contains distinct defects by invariant and condition, tokens, decisions and engine stats.
- **Workspaces:** the original worker workspaces are still on disk at `/home/user/rlp-runs/full/<attempt>/` (assets, `.rlp` snapshots). They are not in the repository; the repository copies are the `artifacts/` files.
- **Screenshots** (outside the repository): `/home/user/rlp-runs/screens/full/<attempt>/<viewport>.png`.
- **Blind review data:** `results/full/visual/{key,scores}.json` and ratings under `/home/user/rlp-runs/visual/full/`.
- **Task definitions:** `experiments/RLP-001/tasks/*.mjs`. The definitions were split into modules after the run. The exported data was verified byte-identical.

## Relational vocabulary (the input language, from `experiments/RLP-001/arms/relational/GUIDE.md`)

- **Nodes:**
  - `data-rl-root`
  - `data-rl="container" | "group"`
  - leaves (no attribute)
- **Node attributes:**
  - `data-rl-flow`: column, row or wrap
  - `data-rl-bond`: tight 0.5rem, related 1rem, loose 1.5rem or section 2rem
  - `data-rl-clearance[-block|-inline]`: none 0, inset 0.75rem, surface 1.25rem or spacious 2rem
  - `data-rl-align`
  - `data-rl-equal`
- **Child attributes:**
  - `data-rl-min`, `data-rl-max`
  - `data-rl-fill`
  - `data-rl-size=content`
  - `data-rl-anchor=end`
  - `data-rl-align-edge`
  - `data-rl-scroll`
- **Hard floors:**
  - clearance and gaps compress to no less than half the token, and gaps to no less than 4px;
  - interactive targets are at least 24px;
  - text controls are at least 6rem wide.

Usage in the 36 Arm C final pages:

| Attribute | Occurrences | Pages |
|---|---:|---:|
| `group` | 302 | 36 |
| `bond=tight` | 193 | 32 |
| `min` | 126 | 32 |
| `size=content` | 121 | 23 |
| `flow=row` | 116 | 27 |
| `container` | 111 | 36 |
| `align-edge` | 74 | 24 |
| `fill` | 63 | 23 |
| `anchor=end` | 51 | 18 |
| `flow=wrap` | 46 | 27 |
| `align=center` | 32 | 12 |
| `equal` | 17 | 16 |
| `align=start` | 17 | 10 |
| `max` | 12 | 12 |
| `scroll` | 6 | 6 |
| explicit clearance | 5 | 3 |

## Verification commands (inherited)

- `node --test experiments/RLP-001/engine/test/core.test.mjs` (20 tests)
- `harness/evaluate.mjs` `evaluatePage({ browser, dir, file, task, mode: "full" })`, the scoring entry point
- `./praxis validate`, `./praxis registry build`
- `npx @echelon-foundry/sde@1.3.0 verify --strict` (CI structural check: files must stay under the physical-line limit)

## Assumptions and limitations found

- **Content-dependent row decision.** The Arm C engine decides `flow=row` with a content measurement: a row stays on one line only if the children's comfortable widths fit, otherwise all children stack. With static CSS that all-or-nothing decision can be made exactly only when the threshold is known at build time.
- **Shared-edge alignment** (`data-rl-align-edge`) is a run-time push in Arm C. Static CSS can express it only through grid subgrid tracks, which require a regular structure.
- **Clearance compression.** Under pressure, Arm C compresses clearance to half its target. Static CSS cannot condition an element's own padding on whether its children fit.
- **Archived arms.** A, B and C ran on 2026-10-21 with randomized order, and are historical references for RLP-002.
- **Same model.** The worker model `claude-sonnet-5-5` is still the `sonnet` alias at baseline. Any substitution will be recorded.
- **Archived screenshots** come from the RLP-001 collection pass. RLP-002 visual comparisons recapture every arm under one rendering pass.
