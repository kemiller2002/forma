# RLP-002 report: zero-runtime relational layout compilation

Experiment record: EX-FORMA-2026-0003. Pre-registration: `PROTOCOL.md` and
`HYPOTHESES.md`, committed (`0dfb230`) before any compiler code or data.
Every number below comes from files in `results/stage-1/`.

## 1. Executive summary

**Decision: REFINE.** The relational vocabulary compiles to deterministic,
zero-runtime CSS, and wherever a relationship compiles exactly, the compiled
page is as correct as the run-time engine. One relationship cannot compile
exactly: content-dependent `flow=row`, the all-or-nothing switch. That one
relationship failed the Stage 1 gate. Per the protocol, the experiment stopped
before Arm F, the visual review and Stage 2.

- **H2 (no runtime): supported.**
  - 36/36 compiled pages have no script element and make no script or WASM request.
  - Their geometry is identical (0 px difference) with JavaScript disabled.
  - Layout is stable at a median of 214 ms after navigation, against 468 ms for the run-time engine.
- **H1 (preserves C's invariants): supported on supported layouts, but the gate fails.**
  - **Exact pages:** on the 10 pages where every relationship compiles exactly, there are 0 new defect instances across all 5 viewports, dynamic steps, held-out text, 200% font, axe and determinism.
  - **Other pages:** the remaining 26 pages use a relationship the compiler can only approximate (24) or not express (2). After the one allowed correction cycle, those pages still added 17 defect instances: 8 `unexpected-shift` and 9 `reading-order`.
  - **Gate condition failed:** "no added unexpected-shift".
- **Overall correctness improved anyway.**
  - The compiled ruleset (E2) has fewer defect instances than C in total: 24 against 38.
  - Per-item wrapping removed 31 of C's 34 row-association defects, where C stacked a line item's name away from its price.
  - The gate counts new defects and does not net them against fixed ones. That was pre-registered and was not relaxed.
- **H3–H6: not evaluated.** Arm F, the visual review and Stage 2 depend on the Stage 1 gate.
- **Cost of the compiler:**
  - 460 lines of F#, no dependencies;
  - a 7.3 KB static stylesheet;
  - about 6 ms per page in batch;
  - deterministic output (36/36 byte-identical across two compilations).

**Why REFINE and not LIMIT or ABANDON.** The obstacle is one specific,
reproducible defect class with a small, well-defined correction (Section 15).
Everything else in the vocabulary compiled exactly and passed. The cost of
the abstraction is small. RLP-001 showed that this vocabulary reduces agent
decisions relative to Forma primitives.

## 2. Baseline and source commits

See `BASELINE.md`:

- forma `888279d` (`main` after RLP-001);
- praxis `6400515`, dokimos `c99c21b`, ordo `f69f8ac`;
- research-documents `62bf983`;
- Node 22.22.0, .NET SDK 10.0.402, Playwright 1.63.0, Chromium 141.0.7390.37.

RLP-001 data was read only. The 36 C workspaces are byte-identical to their
archived `final.html`. The re-scored C reference agrees with the archived
RLP-001 defect-free status on 36/36 pages.

## 3. Registered hypotheses

`HYPOTHESES.md`:

| ID | Hypothesis |
|---|---|
| H1 | Compiled static CSS preserves C's hard invariants on supported layouts. |
| H2 | No run-time layout code. |
| H3 | F improves visual quality over E without new defects. |
| H4 | Decisions non-inferior to C (+2 margin). |
| H5 | Correctness non-inferior to C (+0.5 margin). |
| H6 | No material cost: token ratio ≤ 1.15, stylesheet ≤ 16 KB, compiler ≤ 600 lines, build ≤ 2 s per page. |

ADOPT also needs a visual rating of at least 4.0/5.

## 4. Implementation and architecture

```
source page (data-rl-* markup)
  ├─ rlc (F#, build time)
  │    Html.fs      lossless tokenizer and element tree; untouched text is copied byte for byte
  │    Analysis.fs  every relationship classified exact / approximated / unsupported; per-element values
  │    Emit.fs      engine script removed, ruleset stylesheet linked, values written as custom properties
  └─ compiled page + report.json (findings)
static ruleset stylesheet (E2.css, @layer rlc above rlp-base)
```

- **Separation of concerns.** The vocabulary semantics live in one static stylesheet, selected from the `data-rl-*` attributes. The compiler writes only what depends on the markup:
  - minimum and maximum widths (`--rl-min`, `--rl-max`);
  - the static row threshold (`--rl-switch`);
  - grid tracks (`--rl-col`);
  - subgrid spans (`--rl-span`);
  - structural flags (`data-rlc`).
- **What it does not use.** No measurement, absolute positioning, optimization, springs or energy terms, and no spacing derived from nesting depth.
- **CSS features used:** flex and flex-wrap, CSS grid with `auto-fit`, subgrid, `:has()`, `min()`/`max()`/`calc()`, cascade layers.
- **Hard constraints are separate from presentation.** The token values for bond (0.5, 1, 1.5, 2 rem) and clearance (0.75, 1.25, 2 rem) and the hard floors are those of RLP-001:
  - 24 px interactive targets;
  - 6 rem text controls.

  E1 and E2 make no visual change. The refinement ruleset F was not built (Section 7).
- **Paradigm.** The compiler is purely functional: every analysis is a function of the parsed markup, and `rlc batch` amortizes .NET start-up.

## 5. Supported and unsupported relationships

| Relationship | Compiled form | Status |
|---|---|---|
| Containment and clearance (`container`, `data-rl-clearance*`) | `padding` per token | Exact at the target clearance. C's compression to half clearance under pressure is not expressible. It caused none of the Stage 1 defects. |
| Sibling separation (`data-rl-bond`) | `gap` per token | Exact |
| Column flow, `align`, `size=content`, `anchor=end`, `max` | flex column, `align-items`/`align-self`, auto margin, `max-inline-size` | Exact |
| `flow=wrap` (greedy first-fit, growth, `fill`) | `flex-wrap` with `flex-basis: var(--rl-min)`, `flex-grow` | Exact. Flex wrapping is greedy on the hypothetical size; growth matches C's equal-share water fill. |
| `equal` with a minimum on every child | grid `repeat(auto-fit, minmax(min(100%, max(mins)), 1fr))` | Exact when the minimums are equal |
| `equal` without minimums | `flex: 1 1 0` on one line | Approximated (no static line-break size) |
| `flow=row` with a minimum on every child | flex with the static switch basis `max(min, (threshold − 100%) × 999)` | **Exact.** Fixture `row-static-min`: C and E2 switch at the same width, 752 px. |
| `flow=row` otherwise | per-item wrapping | **Approximated.** One-line-or-stacked depends on content widths that static CSS cannot know. 104 of the 116 rows in the C pages are this kind. Fixture `row-content-switch`: E2 moves the name 99 px when the role text grows at 600 px; C does not move it. |
| Shared edge on line items (`align-edge`) | items start at the line's cross start | Exact under start or stretch alignment; approximated under center or end |
| Shared edge one level inside tight items, same position, minimums present | subgrid rows; preceding siblings pushed to the track end | Exact (3 lines with unequal minimums are approximated: equal tracks) |
| Shared edge inside items at different positions | none | **Unsupported**, reported. Fixture `nested-edge-mismatch`: inputs 29 px apart under E2, aligned under C. |
| `scroll` | `overflow-x: auto` with `max-inline-size: 100%` | Exact |
| Reading order | document order (never reordered) | Exact |
| Interactive targets and control floors | `min-inline-size` (24 px, 6 rem); fixed-size controls do not shrink | Exact (E2) |
| Fieldset legend as a relational child | floated legend joins the flex flow | Exact (E2) |
| Intrinsic media | inherited `base.css` (`max-inline-size: 100%`) | As in C. The proportion refinements were planned for F. |

The compiler classified the 36 pages as follows:

| Status | Pages | Meaning |
|---|---:|---|
| Exact | 10 | Every relationship compiles exactly (all of T06, T08 and T12, and one T07) |
| Approximated | 24 | At least one relationship is approximated |
| Unsupported | 2 | At least one relationship cannot be expressed |

## 6. Stage 1 results (deterministic replay; exact counts, not samples)

Pages: the 36 RLP-001 Arm C final pages. C was re-scored in the same pass.

| | Run 1 (E1) | Run 2 (E2, after correction) |
|---|---:|---:|
| Pages with any new defect instance | 16 | 4 |
| New instances on exact pages | 0 | 0 |
| New instances on other pages | 838 | 17 |
| New instances by invariant | target-size 462, separation 317, clearance 42, reading-order 9, unexpected-shift 8 | reading-order 9, unexpected-shift 8 |
| C instances removed | 31 | 31 |
| Total instances: C → candidate | 38 → 859 | 38 → 24 |
| Gate | **Fail** (unexpected-shift) | **Fail** (unexpected-shift) |

**Correction cycle (one, as pre-registered).** The root cause: E1 left native
form-element rendering active where the engine had bypassed it by
positioning every child itself. Two symptoms followed:

- a fieldset's rendered legend sits outside the flex flow;
- checkboxes and radios shrink below 24 px.

E2 adds two rules and fixes both. The remaining failures are the two
documented static-compilation limits. Full per-page records are in
`results/stage-1/<ruleset>/pages/`, and the gate evidence is in `GATES.md`
and `<ruleset>/gate.json`.

New instances in run 2, per task:

| Task | Pages | New instances | Cause |
|---|---:|---:|---|
| T04 cards, profile | 2 of 3 | 2 (`unexpected-shift`, name) | Nested content-dependent rows re-wrap when the role text grows |
| T10 dynamic thread | 1 of 3 | 6 (`unexpected-shift`) | Content-dependent row in a comment header |
| T07 nav docs | 1 of 3 | 9 (`reading-order`) | Nested shared edge at different positions (unsupported) |
| T09 dynamic checkout | 0 of 3 | 0 | E2 removed 31 C row-association instances |
| Other 8 tasks | 0 of 24 | 0 | |

## 7. Stage 2 results

**Not executed.** The Stage 1 gate failed after the correction cycle, and the
protocol and execution script stop before Stage 2. Arm F, which the
execution script makes conditional on Stage 1 passing, was not built. The
visual review was not run. No agent attempts were spent.

## 8. Correctness and accessibility

- **Correctness.** Above in Section 6. On supported layouts the compiled pages match C exactly on every hard invariant under every condition. Overall E2 has 24 defect instances against C's 38. The added ones are all on pages with an approximated or unsupported relationship.
- **Accessibility.** No new axe violation in either run, on any page, at any viewport.
- **Dynamic behavior.** Native reflow. The only added shifts come from approximated rows.

## 9. Visual-quality comparison

Not run: conditional on Stage 1. The RLP-001 visual weaknesses of the
relational arms (no page gutter, stretched media, weak emphasis) are
unchanged in E, by design. Whether F would reach the 4.0/5 threshold is
unknown.

## 10. Independent agent decisions

No new agent data (Stage 2 not run). The compiled vocabulary is the RLP-001
vocabulary, so authoring decisions are unchanged. The refinement in Section
15 would change them; that is why the follow-up must measure decisions again.

## 11. Token and runtime measurements

| Measure | C (run-time engine) | E2 (compiled) |
|---|---:|---:|
| Layout scripts | 1 engine entry module and its imports (12 module files shipped) | 0 |
| Median time to stable layout at 1024 px | 468 ms | 214 ms |
| Engine resolve (median, final pages) | 19.7 ms | — |
| Stylesheet | — | 7,293 B, shared |
| Bytes added per page | — | 168 on average, at most 484 |
| Compile time | — | about 6 ms per page (72 jobs in one batch, .NET start-up included) |

No agent tokens were spent: Stage 2 was not run.

## 12. Statistical analysis and limitations

Stage 1 is a deterministic replay, so its results are exact counts. They
carry no sampling uncertainty, and no inferential statistics are reported.
Limitations:

- **One agent run per page.** The replay inherits RLP-001's pages, written for the run-time engine. Authors writing for a compiler might choose different relationships, for example adding minimums to rows.
- **Analyst bias.** The analyst wrote the compiler and the rulesets. The gate is mechanical (`gate.mjs`), and the fixtures make each limit reproducible.
- **Single browser.** Only Chromium 141 was measured. Subgrid, `:has()` and `min()`/`max()` are Baseline features, but cross-browser rendering was not tested.

## 13. Deviations from protocol

None to the gate, endpoints or criteria. The decision log (`DECISIONS.md`)
records, before data:

- the F# compiler and the attribute-preserving output;
- the instance-level gate comparison;
- the same-pass C re-score.

The correction cycle created a new ruleset version (E2) and kept E1
unchanged. Arm F and the visual review were not run, in line with the
script's ordering (Section 17), not by choice.

## 14. Reproducibility instructions

See `README.md`. The compiler is deterministic: compiling twice gives
byte-identical output for 36/36 pages. The rulesets are versioned files. The
harness reuses RLP-001's frozen checks.

## 15. Decision

**REFINE.** The correction is one specific, reproducible defect class
(content-dependent rows), plus one rare unsupported pattern (nested edges at
different positions, 1 of 36 pages).

The smallest correction makes `flow=row` statically decidable. There are two
options; the follow-up should test the first:

1. **Replace all-or-nothing `row` with keep-together and wrap-tail.**
   - **How it works:** the children declared together stay on one line, and trailing or secondary children wrap.
   - **Why it fits:** this was already one of the planned F refinements. It is expressible with flex-wrap and an explicit grouping attribute, and E2's per-item wrapping already outperformed C on row-association (−31 instances).
   - **Cost:** it changes the vocabulary's meaning, so it must be pre-registered as a new arm. It is not "E".
2. **Make `data-rl-min` mandatory on every row child.**
   - **How it works:** `rlc` already compiles such rows exactly (fixture `row-static-min`).
   - **Cost:** about one more authoring decision per row child, and H4 might not hold.

Nested shared edges at different positions become a compile-time error with
a fix-it message, not a silent non-alignment.

## 16. Recommended production implementation scope

**None yet.** No production change is justified until the refined
vocabulary passes a new Stage 1 gate, Arm F reaches the 4.0/5 visual
threshold in a comparable blind design, and Stage 2 confirms decisions and
correctness against a concurrent C.

The parts that would carry over unchanged are the static ruleset for column,
wrap, equal-with-minimums, bond, clearance, alignment, fill, max, scroll and
the hard floors (all exact here), plus the `rlc` compiler pattern.

## 17. Follow-up requirements (justified by this result)

1. **RLP-002 R1, pre-registered as a new run.**
   - Change the vocabulary: a keep-together and wrap-tail row (option 1 above).
   - Make nested-edge mismatches compile-time errors.
   - Run a fresh Stage 1 gate on the same 36 pages, with the same criteria.
2. **If that gate passes,** build ruleset F with these refinements:
   - root gutters;
   - intrinsic media proportions;
   - heading emphasis;
   - token spacing.

   Then run the planned blind review: A, B, C, E and F in one design, 72 batches, 2 reviewers.
3. **Then Stage 2:** 6 held-out tasks × (E, F, concurrent C) × 3 = 54 attempts, with the H4 and H5 non-inferiority margins as registered.
