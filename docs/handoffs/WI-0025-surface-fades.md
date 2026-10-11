# WI-0025: Quick reciprocal surface fades

User requested a brief fade with gentle start, rapid middle and gentle finish,
while preserving reciprocal CSS-only motion. Popover, menu and tooltip opacity
now use `--ef-motion-fade-easing: cubic-bezier(0.65, 0, 0.35, 1)` with the existing
120ms perceptual duration. Spatial settling and native semantics remain intact.
This is a perceptual profile rather than a combustion simulation. Browser exit
retention remains a progressive enhancement; unsupported exits close immediately.

Validation: full build passed; 38 motion tests and strict audit (102 tracks,
zero findings) passed; 32 CSS source/distribution tests and four zero-runtime
checks passed; catalog validation passed. All 17 targeted WebKit checks passed,
including six new fade/reduced-motion cases and existing tooltip accessibility,
keyboard, native state, containment and forced-colors coverage. Tests sample the
computed easing deterministically rather than relying on elapsed-time sleeps.

Visual Engineering 1.0.1 verification passed. Applied model separation,
reduced motion, native semantics and progressive enhancement. Provider usage
metrics unavailable. Praxis work begin initially failed because the new item
was captured; it was promoted to ready and begun after initial edits. Attribution
must include those initial edits without inventing earlier telemetry.

Site build passed; site mobile execution is unavailable because Chromium is not
installed. Full cross-browser CI and physical iPhone review remain required.
