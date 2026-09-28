---
id: EV-DESIGN-2026-0015
title: Visual Engineering principles applicable to marketing-site presentation
research_area: design-system
evidence_type: secondary
source_title: kemiller2002/visual-engineering agent context and composition research
source_author: Echelon Foundry Visual Engineering
source_uri: https://github.com/kemiller2002/visual-engineering/tree/007cbf0573f53e4ecd978d217a269d75f712af88
source_date: 2026-09-28
retrieved: 2026-09-28
created_by_agent: claude-code
confidence: medium
supports: []
contradicts: []
related_theories: []
tags: [visual-engineering, marketing, composition, typography, color, GH-49]
---

# Evidence Record

## Evidence summary

Visual Engineering (VE), read at commit `007cbf0` (context package
`0.0.0-dev`, lifecycle tool 1.0.0), has no requirement set specific to
marketing or landing pages. Its general UI foundations, composition laws,
typography pilot ranges, and color/contrast package do apply to
marketing-site presentation. Most composition laws are hypotheses with stated
confidence, not normative rules. The hard numeric floors come from WCAG, which
VE cites.

## Sources read

- `agent-context/UI-FOUNDATIONS.md`, `UI-DECISION-CHECKLIST.md`, `UI-ANTI-PATTERNS.md`
- Composition laws LAW-COMP-001–007:
  `content/projects/composition-science/phase-report/composition-science-phase-2-visual-hierarchy-and-wayfinding.md`
  and the phase-3 evidence review
- LAW-COMP-030/031/032 and MODEL-COMP-002:
  `content/projects/composition-science/research-note/composition-science-visual-density-crowding-and-perceptual-separation.md`
- LAW-COMP-036/037: `prompts/RP-COMP-005-Visual-Scene-Construction-Predictive-Processing-and-Active-Perception.md`
- Typography ranges EX-VE-TYP-001:
  `content/projects/perceptual-envelope/experiment-specification/ex-ve-typ-001-individual-readability-envelope.md`
- Color REP-VE-COL-001:
  `content/projects/project-atlas/research-execution-package/rep-ve-col-001-color-contrast-low-vision-and-color-vision-deficiency.md`
- Beauty hypotheses HY-BEAUTY-002/010/011/012/015:
  `content/projects/beautiful-digital-experiences/hypothesis-registry/beautiful-digital-experiences-hypothesis-registry-v0-1.md`
- Component-library findings F-004 and A-011:
  `content/projects/design-library/research-report/component-library-foundations-research-report.md`

## Exact claims used

| VE id | Principle | Consequence in Forma's marketing layer |
|---|---|---|
| UI-FOUNDATIONS §Hierarchy; LAW-COMP-006 | One defensible primary path; salience is relational | One `data-ef-variant="primary"` action per hero, section, and CTA. The fixture tests enforce it. |
| LAW-COMP-001 | Attention goes to the highest information gain | Hero promise first in source order and at the top of the type scale |
| LAW-COMP-002 | Distinct landmarks reduce navigation uncertainty | Shell landmarks: skip link, header/nav (named), main, footer |
| LAW-COMP-003 | Local cues reinforce a coherent model | Same shell and section anatomy on every page type |
| LAW-COMP-004 | Intended and perceptual hierarchy align | Card titles size by role, not heading level; heading levels never skip (tested) |
| LAW-COMP-005 / 007 | Keep important information visible; visible destinations | Navigation wraps, never hides; `aria-current` shown with a non-color rule |
| LAW-COMP-030 / MODEL-COMP-002 | Density cost depends on organization; spacing matches relationships | Scale: component gap < block space < section space; ruled grids group siblings |
| LAW-COMP-031 | Separation must scale for everyone | Spacing and containers in rem and ch; fluid values keep rem terms |
| LAW-COMP-036 | Controlled violation | The hero is the one deliberate break (aside, statement rule); no ad-hoc grid breaks |
| EX-VE-TYP-001 | Line height 1.35–1.75; 48–76ch; 16–22px body | Body 1rem / 1.65; measure 72ch; narrow measure 62ch |
| Typography report §4–6 | Tracking only on short uppercase labels; strong glyphs for low-context labels | Wide tracking only on `.ef-eyebrow`; nav and buttons use the body face |
| UI-FOUNDATIONS §Typography | Preserve user text size and reflow; no vw-only type | Fluid clamps include a rem term (compiler-generated, tested) |
| REP-VE-COL-001 | Body text 4.5:1; UI and focus 3:1; check tokens in rendered context | Compiler contrast gates for every role pair; axe on rendered pages in light and dark |
| REP-VE-COL-001 anti-pattern | Texture or images reduce local contrast | Backdrop capped at about 1% effective alpha; images over text remain a gap (GAP-MKT-03) |
| UI-DECISION-CHECKLIST | Keyboard, unobscured focus, 200% zoom, reflow, reduced motion, forced colors, text spacing | Browser tests cover each at shell level |
| UI-FOUNDATIONS §Responsive | Recompose, don't shrink; no CSS reordering | No `order` or `row-reverse`; the hero aside follows content |
| HY-BEAUTY-002/010 | Category-recognizable anatomy; replaceable style layer | Standard shell anatomy; the Echelon theme is a separate artifact over neutral layout |
| HY-BEAUTY-012 | Accessibility constraints can increase quality | Accessibility defaults live in the shared layer |
| HY-BEAUTY-015 | Ideal hero screenshots mislead | Specimens include long identifiers, unknown values, and long titles |
| F-004 / A-011 | "marketing" as a component mode is a smell; composites declare a context | No `variant="marketing"` flags. Marketing context is the `.ef-site` shell boundary; sections compose primitives. |

## Capability gaps VE identifies

These cannot be expressed or enforced by a zero-runtime CSS system alone:

- emphasis budgets per viewport;
- first-glance and fixation-sequence evaluation;
- contrast over arbitrary imagery;
- visual-angle spacing;
- context-scoped theme acceptance;
- transition continuity.

They are recorded as GAP-MKT-03, GAP-MKT-04, and GAP-MKT-12 in
`requirements/MARKETING-PRESENTATION.md`, or noted there as out of scope.

## Limits

VE's context was read from the source repository, not installed through
`npx @echelon-foundry/visual-engineering`. Executing that package was not
permitted in the GH-49 session, so `visual-engineering verify` was not run.
Forma has no installed `.visual-engineering/` directory (GAP-MKT-13).
