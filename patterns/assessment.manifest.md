# Feature Manifest — Assessment and workflow patterns

## Purpose

Provide reusable semantic markup and CSS for assessment, decision, validation, and Ordo-style unresolved-work presentation without embedding application behavior.

## Ownership

- State, including presentation state: native radio/checkbox/number/progress state plus application-rendered `data-forma-*` state
- Transitions / commands / messages: native HTML events only for declarative controls; ranking/allocation/rule-builder behavior belongs to Limen/application code
- Invariants and guards: semantic form grouping, accessible names, non-color state cues, special answer separation, zero-runtime boundary
- Capabilities / authority: none — Signal/Ordo/application owns applicability, scoring, validation, capabilities, obligations, and completion
- Important effects and effect contracts: none

## Interfaces

### Declarative patterns

- `.forma-question`
- `.forma-ordinal-scale`
- `.forma-choice-group`
- `.forma-special-choices`
- `.forma-validation-message`
- `.forma-validation-summary`
- `.forma-survey-progress`
- `.forma-obligation-panel`
- `.forma-binary-choice`
- `.forma-semantic-differential`
- `.forma-symbol-rating`
- `.forma-numeric-stepper`
- `.forma-range-entry`
- `.forma-choice--media`
- `.forma-matrix`
- `.forma-pairwise`
- `.forma-best-worst`
- `.forma-hierarchy`

### Behavior-required visual contracts

- `.forma-ranking`
- `.forma-allocation` aggregate validation
- `.forma-rule-builder`
- graphical dual-thumb range interaction
- best/worst cross-column exclusion
- multi-choice cardinality/exclusive-option enforcement
- matrix global constraints
- hierarchical cascading/parent-child policy

## Tests and verification

- browser behavior: `tests/browser/assessment.spec.mjs`
- automated accessibility: `tests/browser/accessibility.spec.mjs`
- zero-runtime boundary: `tests/zero-runtime.test.mjs`
- responsive ordinal presentation: browser test at narrow viewport

## Dependencies

- allowed direct dependencies: semantic tokens, foundations, assessment CSS
- required composition context: consuming application supplies domain state and Limen behavior where documented

## Modification boundaries

Normal:

- `patterns/question.html`
- `patterns/ordinal-scale.html`
- `patterns/choice-group.html`
- `patterns/special-choice.html`
- `patterns/validation-*.html`
- `patterns/survey-progress.html`
- `patterns/ranking.html`
- `patterns/allocation.html`
- `patterns/rule-builder.html`
- `patterns/obligation-panel.html`
- `src/styles/assessment.css`
- related tests/docs

Escalation required:

- adding executable behavior to the package;
- creating scoring semantics from presentation;
- replacing native radio/checkbox semantics;
- collapsing Unknown, Not Applicable, and ordinal values into one visual continuum;
- making drag the only ranking path;
- using a checkbox switch where Unanswered must remain distinct from false;
- treating NPS/Likert/star/icon labels as scoring authority;
- requiring horizontal scrolling as the only matrix mobile interaction.

## Maintenance

- Owner: Forma design system
- First demanding consumer: an assessment-heavy application (Signal)
- Last checked against implementation: 2026-09-22
