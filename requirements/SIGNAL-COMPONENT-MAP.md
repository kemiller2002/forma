# Echelon Signal component map

Status: implementation input and traceability record.

This document maps Echelon Signal requirements into reusable Echelon Design System patterns. Signal is the first demanding consumer, but the resulting patterns must remain application-independent.

## Source requirements reviewed

The mapping was derived from Signal requirements including:

- `survey-engine-requirements.txt`;
- `survey-engine-additional-core-requirements.txt`;
- `survey-engine-template-authoring-publication-workflow.txt`;
- `survey-engine-advanced-ros-ordo-limen-stress-requirements.txt`;
- `survey-engine-administrator-console-storage-analytics-visualization-requirements.txt`;
- `survey-engine-reporting-requirements-data-contract.txt`;
- `survey-engine-scoring-selector-completeness-requirements.txt` (SCS-001 through SCS-019).

## Respondent-side mapping

| Signal concept | Design-system pattern | Boundary |
|---|---|---|
| Question prompt/help/number | `.forma-question` | HTML/CSS |
| Ordinal(3/5/7) | `.forma-ordinal-scale` | HTML/CSS |
| Likert3/5/7 | `.forma-ordinal-scale` preset labels | Signal supplies labels |
| Agreement5 | `.forma-ordinal-scale` preset labels | Signal supplies labels |
| Frequency5 | `.forma-ordinal-scale` preset labels | Signal supplies labels |
| Quality5 | `.forma-ordinal-scale` preset labels | Signal supplies labels |
| Confidence5 | `.forma-ordinal-scale` preset labels | Signal supplies labels |
| Satisfaction5 | `.forma-ordinal-scale` preset labels | Signal supplies labels |
| Maturity5 | `.forma-ordinal-scale` preset labels | Signal supplies labels |
| Numeric discrete rating | `.forma-ordinal-scale` with numeric labels | Signal supplies bounds/meaning |
| Continuous/bounded numeric control | existing `.forma-slider` or native number input | Signal supplies validation |
| Single select | `.forma-choice-group` using radios | HTML/CSS |
| Multi-select | `.forma-choice-group` using checkboxes | HTML/CSS |
| Forced choice | `.forma-choice-group` | HTML/CSS |
| Pairwise comparison | `.forma-choice-group` | HTML/CSS |
| Don't Know / Unknown | `.forma-special-choice` | domain meaning remains Signal |
| Not Applicable | `.forma-special-choice` | domain meaning remains Signal |
| Validation message | `.forma-validation-message` | Signal evaluates validity |
| Validation summary | `.forma-validation-summary` | Limen routes focus |
| Survey/page/section progress | `.forma-survey-progress` | Signal supplies current progress |
| Ranking | `.forma-ranking` | Limen behavior + Ordo validation |
| Allocation | `.forma-allocation` | Limen aggregate calculation + Ordo validation |

## Authoring mapping

| Signal requirement | Design-system pattern | Boundary |
|---|---|---|
| Section/question editing | native forms + cards/panels | application composition |
| Selector preset authoring | choice/select patterns | application data |
| Reorder questions/sections | existing `.forma-reorder-list` | Limen |
| Flow/validation/derived fact rules | `.forma-rule-builder` | Limen + typed application expression model |
| Completion rules | `.forma-rule-builder` | Limen + Ordo |
| Recommendation rules | `.forma-rule-builder` | Limen + Signal semantics |
| Respondent preview | app shell/split workspace | Limen |
| Scoring preview | metric/stat patterns | application values |
| Rule trace preview | timeline/trace visual composition | application values |
| Publication blockers | `.forma-obligation-panel` | Ordo authority |
| Validation/test fixture failures | validation/status patterns | application values |
| Definition differences | diff viewer | Limen/data supplied by application |

## Administrator mapping

Signal's administrator requirements reinforce several shared patterns:

- obligation panel for unresolved reconciliation, stale derived state, evidence, privacy, and migration work;
- filter/query builder for saved analysis;
- data table/grid for groups, imports, snapshots, storage objects, and audit/lineage;
- metric cards and status summaries;
- semantic diff viewer;
- timeline/lineage presentation;
- conflict-resolution compositions;
- dashboard visual contracts;
- impact classifications and repair-plan presentation.

These should remain generic design-system contracts. Signal supplies authoritative state, capabilities, obligations, privacy rules, and storage semantics.

## Visualization boundary

Signal requires a typed visualization grammar including bar, grouped/stacked bar, line, area, dot plot, histogram, box plot, heatmap, radar/profile, bullet/progress, small multiples, ranked tables, matrices, sparklines, and metric cards.

The design system shall own:

- visualization color/tone tokens;
- typography;
- focus;
- direct-label conventions;
- legend presentation;
- high-contrast behavior;
- print/grayscale constraints;
- accessible tabular-equivalent layout;
- tooltip/popover visual treatment.

The design system shall **not** become Signal's visualization engine.

Signal owns the typed `VisualizationSpec` and rendering behavior. If several Echelon applications later need the same renderer, that is evidence for a separate visualization package.

## Deliberate non-component decisions

### No separate component per Likert vocabulary
`Likert5`, `Agreement5`, `Frequency5`, `Maturity5`, and similar names are selector presets, not distinct UI primitives.

### No survey matrix answer type yet
Signal's answer model does not require a matrix primitive. Large Likert matrices can create mobile, low-vision, cognitive-load, and screen-reader problems. Group individual ordinal questions visually when useful rather than inventing a new answer representation.

### No scoring behavior in components
Visual order, selected position, or label text must never imply score. Signal scoring remains explicit in its template/evaluator.

### No application branching in CSS
Conditional visibility is rendered from authoritative Signal/Limen state. CSS may present the result but does not evaluate branching rules.

## Implemented in this slice

- question shell;
- ordinal/Likert scale;
- choice group;
- special answer choices;
- validation message;
- validation summary;
- survey progress;
- ranking visual contract;
- allocation visual contract;
- rule builder visual contract;
- obligation panel.

All production artifacts remain HTML/CSS only.


## Selector completeness update — 2026-09-22

Signal source revision reviewed: `kemiller2002/echelon-signal@036f4591d2e4d550d084241262ad81f70756dd51` ("Merge scoring and selector completeness requirements").

Signal's SCS completeness pass adds the following shared design-system contracts.

| Signal selector family | Design-system contract | Boundary |
|---|---|---|
| YesNo / TrueFalse / three-way | `.forma-binary-choice` | native radios, HTML/CSS |
| BinaryToggle with Unanswered | `.forma-binary-choice` styled binary presentation | do **not** use checkbox switch when Unanswered matters |
| Likert 3/4/5/6/7/10/11 | `.forma-ordinal-scale` cardinality variants | HTML/CSS |
| NPS 0–10 | `.forma-ordinal-scale--11` numeric preset | Signal owns NPS meaning/scoring |
| Semantic differential | `.forma-semantic-differential` | HTML/CSS |
| Numeric rating | ordinal scale or native number input | depends on discrete vs numeric semantics |
| Star/Icon rating | `.forma-symbol-rating` | HTML/CSS; symbol is decorative, text alternative required |
| Slider | existing `.forma-slider` | native range |
| Range slider / BoundedRange | `.forma-range-entry` + optional graphical Limen enhancement | direct paired numeric entry always retained |
| Numeric stepper | `.forma-numeric-stepper` | native number input |
| Radio/buttons/cards | existing choice patterns | HTML/CSS |
| Image single/multi choice | `.forma-choice--media` | image decorative or redundantly described; visible text required |
| Multi-select count guidance | `.forma-selection-guidance`, `.forma-selection-status` | Limen validates exact/min/max/between |
| Exclusive None/N/A option | `.forma-choice--exclusive` | Limen clears/rejects incompatible selections |
| Matrix single/Likert/numeric | `.forma-matrix` | repeated primitive answers; responsive row decomposition |
| Matrix dropdown/multi/side-by-side | `.forma-matrix` visual family | Limen/application supplies row selector behavior/state |
| Pairwise comparison | `.forma-pairwise` | native radio pair |
| Best-Worst | `.forma-best-worst` | Limen enforces different Best/Worst options |
| Hierarchical single | `.forma-hierarchy` with radios | native disclosure + application hierarchy semantics |
| Hierarchical multi | `.forma-hierarchy` with checkboxes | parent/descendant policy belongs to application |

### Binary toggle rule

The existing `.forma-switch` is correct for a setting that already has an authoritative boolean value.

It is **not** correct for a survey answer where untouched/Unanswered must remain different from No/False, because an unchecked checkbox cannot distinguish those states without application behavior.

For Signal-style binary questions, use a radio-backed `.forma-binary-choice` presentation so the initial state can remain unanswered.

### Matrix rule

Matrix is a composite presentation, not a new answer primitive. Each row/cell remains an ordinary primitive answer with its own label, value, validation, and scoring declaration.

The shared matrix contract must decompose to per-row controls on narrow layouts. Horizontal scrolling cannot be the only usable mobile interaction.

### Range rule

There is no native multi-thumb HTML range input. The design system therefore exposes paired numeric endpoint entry as the accessibility baseline. Limen may add a graphical dual-thumb enhancement, but must not remove direct entry.

### Symbol rating rule

Star and icon rating are presentation variants of an ordinal scale. The glyph is never the sole semantic channel and scoring is never inferred from the icon.
