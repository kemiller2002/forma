# Pending Praxis intake: LRP-001 Forma layout reliability patch

**Status:** Unprocessed source material. This is **not** a canonical requirement record, work item, approved decision, or proof of implementation.

- Submitted for Praxis ingestion: 2026-10-30
- Target repository: `kemiller2002/forma`
- Source: Echelon Foundry assignment "Forma Layout Reliability Patch", priority high, in preparation for 2026-11-07
- Proposed scope identifier: `LRP-001`
- Tracking work item: `WI-0042`
- Secondary integration target: `kemiller2002/Indy-init` (read-only; compatibility report only, no lock changes)
- Related: LCE-001 (`experiments/LCE-001/REPORT.md`), ULI-L05, `packages/conformance`, `tools/TokenCompiler`

## Problem

Applications built on Forma can still show text overflowing containers, content escaping rounded panels, flex and grid children that refuse to shrink, unexpected horizontal scrolling, invalid design-token references, broken layouts at mobile widths, and clipped content at enlarged text. The objective is Forma's own reliability, not individual application screens.

## Ingestion instructions

Process through the documented inbox/work flow. Preserve each numbered requirement. No GitHub Issues are created for this work.

## Requirements

**LRP-001.1:** Record a baseline before changing code (`docs/reliability/layout-baseline.md`): commit, version, test counts, existing failures, browser coverage, known layout defects, and the latest approved release and release procedure.

**LRP-001.2:** Safe layout defaults scoped to Forma-owned components, in Forma's existing styling conventions: predictable box sizing, shrink rules for primitives designed to shrink, text containment for ordinary text-bearing components (preserving explicit nowrap, truncation, code, tables, identifiers and intentional scrollers), media that respects its container without distortion, and rounded-container containment fixed at its actual cause. No global `overflow: hidden`.

**LRP-001.3:** A deterministic design-token reference validator that uses Forma's token definitions as the source of truth and detects unknown, deprecated, missing, theme-specific missing, wrongly namespaced, invalid-alias and cyclic references; a fallback never makes an unknown Forma token valid; application-owned custom properties are not reported. Prefer F#; usable by consuming applications through a documented command.

**LRP-001.4:** A reusable browser geometry suite in the existing Playwright infrastructure: 320, 375, 768 and 1280 px; 200% text; long unbroken and localized text; nested containers; rounded panels; keyboard focus visibility; overlays; no unintended horizontal document scrolling; no arbitrary animation delays.

**LRP-001.5:** Adversarial fixtures, each exercising a known CSS failure class: long identifier card; flex row with long label and two buttons; grid with nested cards; rounded panel with a long paragraph; navigation with many items; narrow form; dialog with validation errors; dropdown near the viewport edge; large SVG; 200% text.

**LRP-001.6:** Regression protection: existing component, theme and accessibility checks pass; before/after behaviour classified as intended improvement, acceptable change, regression or unresolved.

**LRP-001.7:** Indy Init compatibility report (`docs/reliability/indy-init-compatibility.md`) with verified improvements, limitations, recommended version, required consumer changes, and lock safety, backed by executable evidence.

**LRP-001.8:** Measure CSS/JS bundle size, runtime dependencies, build-time overhead and browser-test time. No runtime layout engine.
