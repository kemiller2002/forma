# RLP-001 relational layout engine

Experimental and isolated. Nothing here is part of the `@echelon-foundry/design-system`
package, and no production stylesheet imports it.

## Structure

| Path | Role |
|---|---|
| `engine/core/model.mjs` | Normalizes the relational vocabulary into resolver nodes (CSS px). |
| `engine/core/layout.mjs` | Shared skeleton: intrinsic sizes, line placement, shared edges, hard-constraint verification. |
| `engine/core/rules.mjs` | **Arm C** resolver: deterministic rules. |
| `engine/core/physics.mjs` | **Arm D** resolver: constrained energy minimization. |
| `engine/core/relax.mjs` | Projected-gradient (FISTA) spring relaxation and its exact KKT test oracle. |
| `engine/core/springs.mjs` | The spring system, shared so Arm C layouts are scored with Arm D's energy. |
| `engine/core/resolve.mjs` | Entry point; returns geometry, diagnostics, stats and configuration. |
| `engine/dom.mjs` | Browser adapter: DOM to model, leaf measurement, geometry application, re-resolution, oscillation guard. |
| `engine/rlp-rules.mjs`, `engine/rlp-physics.mjs` | Arm entry points (served to attempts as `assets/rlp/rlp.mjs`). |

Arms C and D share the vocabulary, the DOM adapter, the measurement, the
skeleton, the hard constraints and the renderer. They differ only in
`arrange(node, width)`: how a container's clearance, line breaks, sizes and
separations are decided. The physics resolver receives no information that
the rules resolver does not.

## Vocabulary to model

Containers (`data-rl="container"`) have clearance targets from
`data-rl-clearance` (none 0, inset 0.75rem, surface 1.25rem, spacious 2rem),
optionally asymmetric. Groups have zero clearance. `data-rl-bond` sets the
target separation between children (tight 0.5rem, related 1rem, loose
1.5rem, section 2rem) and a bond strength *b* (4, 2, 1, 0.5). Leaves are
measured in the browser: min-content and max-content inline sizes and block
size as a function of inline size. Text controls use a 6rem hard floor and
interactive elements a 24px hard floor (WCAG 2.5.8).

For each node: `hardMin` (never violated), `preferred` (size without
pressure), and `basis = max(hardMin, data-rl-min ?? preferred)` (the
comfortable size that decides line breaks).

## Hard constraints (both arms; verified after every resolve)

- Containment: children inside the container at no less than half the clearance target.
- Non-overlap and reading order: siblings in document order, left to right on a line, lines top to bottom.
- Separation: at least max(4px, half the bond target).
- Interactive targets at least 24 × 24 CSS px.
- Required alignment: members of a `data-rl-align-edge` name that share a line have equal top edges (enforced constructively by inserting space before the member, or before its tightly bonded group, so alignment never separates a label from its control).

A violated hard constraint produces a `constraint-violation` diagnostic; the
root reports `data-rl-status="invalid"`.

## Arm C: deterministic rules

Applied in a fixed order per container:

1. Clearance = target; if the widest child's hard minimum does not fit, clearance = hard floor.
2. Line breaks: `column` one child per line; `row` one line if Σ basis + gaps fits, else stacked; `wrap` greedy first-fit on basis.
3. Per line: start at basis; if over, compress gaps to their floor, then sizes toward hard minimums proportionally; if under, equalize (`data-rl-equal`), else water-fill free space into `fill` children, else into flexible children (those with `data-rl-min`, or groups and containers), up to `data-rl-max`.
4. Remaining free space goes before the first `anchor="end"` child, else to the line end.

## Arm D: constrained energy minimization

For a layout *L*:

E(L) = wb·Eb + ws·Es + wg·Eg + wp·Ep + wa·Ea + wc·Ec

All lengths are normalized by the root font size (rem), so the energy is
invariant under text scaling.

- **Eb, boundary:** Σ over sides (c − c_target)², with c in [c_target/2, c_target].
- **Es, separation (sibling repulsion):** Σ over adjacent siblings max(0, g_target − g)².
- **Eg, grouping (attraction):** Σ b·max(0, g − g_target)²; tighter bonds resist stretching more.
- **Ep, preferred size:** content-sized items Σ (w − preferred)²; flexible items Σ max(0, basis − w)² (they resist compression and grow freely).
- **Ea, alignment:** Σ (top_i − top_j)² over members sharing a name and a line. Required alignment is also a hard constraint, so Ea = 0 in every accepted layout.
- **Ec, compactness:** block size of the container in rem. Line free space costs 0.05·s² only when a flexible item could use it.

Weights: wb = 1, ws = 4, wg = 2, wp = 1, wa = 10, wc = 0.5. They are recorded in
`engine/core/tokens.mjs` and in every resolve's `config`, and they were frozen
before held-out evaluation.

**Mass and charge.** Neither is exposed. Spring stiffness plays the role of
mass (how strongly an element resists displacement) and bond strength plays
the role of charge (how strongly siblings attract or repel). Both are derived
from semantic attributes. Exposing them would add two free parameters per
element without new semantics, which is the opposite of what RLP-001 tests.

**Compactness.** A horizontal compactness term is unnecessary: flexible
items absorb free space through their asymmetric springs. A vertical
compactness term is necessary for arrangement selection; without it,
stacking every item always minimizes width compression.

### Solution procedure

1. **Discrete (line breaks).** Candidates: `column` one; `row` {one line, stacked}; `wrap` every order-preserving partition up to 8 children (2^(n−1)), otherwise the greedy partition and its single-boundary neighbors.
2. **Continuous (per line).** Variables: item sizes, separations and free space, with Σ m_i·x_i = inner width and hard bounds. Minimized by projected gradient descent with Nesterov momentum and monotone restart (FISTA). The projection onto {Σ m x = T, bounds} uses bisection on the multiplier. The initial state is the projection of the rest lengths. Equal-width peers share one variable with multiplicity n.
3. **Boundary equilibrium.** When the best candidate at target clearance still stores energy, the clearance ratio r ∈ [0.5, 1] is found by golden-section search on the total energy (boundary repulsion against content pressure), for the three best candidates.
4. Child subtrees are resolved recursively at the chosen sizes; their energies count toward the parent's candidate score. Results are memoized by (node, width, alignment pads).

### Termination, determinism and failure handling

- Convergence: KKT optimality residual below 0.01 CSS px (each free variable's force imbalance relative to the common multiplier, converted to displacement through its stiffness).
- Budgets: 1,000 iterations per line; 60,000 line solves per resolve. Exceeding the latter aborts to the rules resolver for the remaining containers with an `excessive-computation` diagnostic.
- Diagnostics: `unsatisfiable`, `non-convergence`, `oscillation`, `invalid-dimension`, `excessive-computation`, `numeric-instability`, `constraint-violation`, `hierarchy-inversion` (warning).
- Oscillation: inside a line the energy is convex and the monotone restart prevents rises, so the in-solver detector (3 consecutive rises) is a guard. The practical oscillation risk is a DOM feedback loop (geometry changes the root width, for example via a scrollbar). The adapter halts after 12 resolves in one frame and reports `oscillation`.
- Determinism: pure functions, fixed iteration order, deterministic initial state, no randomness, no time-based budgets; output rounded to 1/64 CSS px (the browser layout unit). Identical inputs give bitwise-identical geometry; the documented tolerance is 1/64 px.

## Rendering

The root becomes `position: relative` with the resolved block size. Every
node is absolutely positioned at its resolved offset and inline size;
containers and groups also get their block size. Leaves keep their natural
block size, so text is never forced into a box. Reading and focus order are
the document order; the engine never reorders the DOM. Re-resolution happens
on root resize, root font-size change (observed through a 1rem probe),
subtree mutations (child list, text, `hidden`, `class`, `data-rl-*`), image
load, and font load. Ordinary layout is never animated.

## Known limitations

- Absolute positioning means the engine, not the browser, owns geometry: it runs JavaScript on every input change. Forma's production package is zero-runtime, so neither arm is a drop-in for Forma as-is.
- No baseline alignment (top edges only), no vertical free-space distribution, no right-to-left support.
- Leaf measurement causes synchronous layout per measured width (counted as `measureCalls`).
