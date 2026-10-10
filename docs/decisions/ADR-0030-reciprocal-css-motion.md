# Reciprocal CSS motion

Accepted 2026-10-10 under the user-authorized MOT-030 requirement.

Reversible interactions share their physics parameters, duration, clamp bounds and easing. Direction is supplied by target state and mirrored spatial origins. The exit-duration token remains compatible but now matches inertia, replacing the former 0.68 multiplier and separate exit bounds. Modal and flyout close easing now matches their opening spring easing. Other transient surfaces retain their existing damped response in both directions.

Forma remains CSS-only. Native semantics change immediately; display and overlay retain visual exit rendering. Browser transitions handle interruptions, with position continuity but no claim of continuous physical velocity. A runtime simulator was rejected to preserve the zero-runtime architecture.

Validation: motion-model tests, strict audit, native overlay browser regressions, reduced motion and site checks. Browser execution is unavailable locally because Playwright downloads are truncated; CI must run the authored regression coverage before integration. Consumers overriding the old exit token should migrate to the shared inertia token. Reverting the CSS, model and requirement changes restores the previous behavior.

## Local validation and handoff

- 38 motion tests passed; strict audit reports 97 tracks and zero findings.
- 39 generated-site/catalog tests passed; catalog inventory validates 166 components.
- Four zero-runtime tests passed. CSS source checks passed.
- Initial full package build passed. Subsequent site:check rebuild fails in the environment when .NET maps PresentationBundler.runtimeconfig.json (EINVAL); generated static site checks ran separately and passed. The composed-output test is blocked by that missing marketing build output.
- Browser suite attempted but cannot launch because Playwright browser downloads are truncated. No browser result is claimed. CI conformance and mobile checks remain required.
- Work WI-0024 is active pending CI. Initial edits preceded work begin while the native Praxis bootstrap failed on tar ownership; bootstrap then succeeded with --no-same-owner. Provider usage metrics are unavailable.

Next action: inspect PR conformance results, resolve any browser regressions, then integrate and release through the existing workflows.
