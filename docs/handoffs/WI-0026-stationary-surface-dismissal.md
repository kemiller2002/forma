# WI-0026: Stationary surface dismissal

User observed partially transparent popovers moving to another location during
closing and requested completion of fade-out before any visual cleanup.

Popover, ordinary action menu and tooltip now fade at unchanged resting geometry
in both directions. Removed translate/scale tracks and starting offsets. The
shared reciprocal slow-fast-slow opacity response remains 120ms. Display and
overlay retention use that same duration, with no visible movement or resize.
Retained exit is enabled only with `@supports (overlay: auto)`; unsupported
engines close immediately instead of retaining display in another containing
block after native top-layer removal. Focus and semantic dismissal remain
native and immediate. No runtime JavaScript was added. Modals/flyouts keep their
separate spatial motion contract.

Added MOT-032 and updated MOT-031, motion classification/conformance, manifests
and component catalog documentation. `--ef-tooltip-offset` was removed from the
catalog because tooltip fades no longer have displacement. Tests measure real
CSS exit tracks with paused intermediate frames, bounding rectangles and native
closed state in 320px/1000px containing contexts. They cover subsequent reopening,
interrupted entry, no-overlay fallback and reduced motion.

Validation:
- Full build and generated site build passed with .NET 10.0.401.
- 38 motion checks and strict audit passed (98 tracks, zero findings).
- 44 CSS checks, four zero-runtime checks, catalog validation (166 components),
  and 39 generated-site tests passed.
- 32 targeted WebKit tests passed: surface fades, surface physics and tooltips,
  including native behavior, keyboard, containment, forced colors and a11y.
- Browser test discovery passed (3498 cases across all configured projects).
- Praxis validation passed. Provider usage metrics are unavailable.
- Chromium download failed; full Chromium/Firefox and generated-site mobile
  execution remain CI requirements. Physical iPhone review is unverified.

Visual Engineering context 1.0.1 at b648cdef291d39c443ccb10215529ad69afe8b32
verified successfully. Applied model separation, stable geometry, interruption,
reduced motion and correct progressive fallback. Local browser dependencies were
extracted to a temporary prefix after normal installation failed; no repository
runtime dependency was introduced.

The requirements document and motion manifests have no canonical front matter;
`provenance record` rejected the requirements path on that basis. No registry or
historical authorship was fabricated. The active execution and Git diff carry
this contribution.

Next: inspect full CI on this branch's exact head, resolve failures, and merge
through the repository gates when authorized. This handoff does not claim that
the website has deployed the change.
