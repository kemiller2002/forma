# Pending Praxis intake: EII-F typography roles

**Status:** Unprocessed source material. This is **not** a canonical requirement record, work item, approved decision, or proof of implementation.

- Submitted for Praxis ingestion: 2026-10-28
- Target repository: `kemiller2002/forma`
- Source: Echelon Engineering Improvement Initiative, Workstream F ("Forma layout constraints"), user direction 2026-10-28
- Proposed scope identifier: `EII-F`
- Related: LCE-001 (radius bounded by padding, Forma 0.10.0), RLP-001 (physics rejected in favour of deterministic relationship rules), the R5 rehearsal override (`indy-init-rehearsal-005` commit `f207cd4`, `src/kernel/causa.css:342-353`; read-only reference)

## Ingestion instructions

Process through the documented inbox/work flow. Preserve each numbered requirement. No GitHub Issues are created for this work.

## Requirements

**EII-F.1:** Establish four typography roles using existing Forma tokens only (no new raw values, no inline styles): marketing (current behaviour, unchanged by default), application, dense administrative, and accessible large-text. Selection is opt-in through a documented attribute or class consistent with Forma's existing selection conventions. Application: h1/h2/h3 on fixed steps (2xl/xl/lg) with no marketing `ch` measure caps. Dense: smaller fixed steps and tighter line-height tokens. Accessible: larger steps and correct behaviour at 200% text size without overlap.

**EII-F.2:** Reproduce before fixing. Browser tests that fail on current `main` (an application-context page using marketing headings at a narrow viewport; text containment) are written and their failing run recorded before the implementation. For the rounded-corner text escape fixed in 0.10.0, a regression test must exist that fails if the padding cap is removed; prove it by reverting the cap locally, observing the failure and restoring it (the revert is not committed).

**EII-F.3:** Verify each role for text containment, element overlap, clipping, focus visibility, keyboard navigation, responsive resizing (320 to 1280 CSS px), 200% text enlargement, long unbroken content and narrow viewports, using Forma's existing Playwright suite and layout probe. Use Percepta's checks if they run locally against Forma fixtures; otherwise report why not.

**EII-F.4:** Legitimate flexible layouts keep working: the full existing Forma browser and layout suites pass unchanged (counts before and after). Forma Studio is built locally against this Forma build in a scratch copy and its test suite run; results are reported; nothing is committed to Studio.

**EII-F.5:** Optionally port the rendered `boundary.corner` check into `packages/conformance` if small and clean; otherwise record it as follow-up.

**EII-F.6:** Document what changed, why, which failure it prevents and how consumers adopt it (`docs/CONSUMING-FORMA.md` and `CHANGELOG.md`), including how a future rehearsal would set the application role and delete its local override. Follow the release conventions for an additive minor change without cutting or publishing a release.
