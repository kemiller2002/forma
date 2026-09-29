# Forma Agent Usage Contract

## Identity

**Forma** is the Echelon Foundry application design system in this repository.
The current package identifier is `@echelon-foundry/design-system`.

Forma is not a JavaScript component framework. It is a zero-runtime collection
of semantic HTML contracts, CSS, design tokens, accessibility rules, and visual
patterns. Public examples use inert `<ef-*>` authoring wrappers, while
`.ef-*` classes style the canonical inner pattern. The tags are not registered
Custom Elements and own no hidden behavior.

## Required decision order

When an agent creates or changes UI:

1. Identify the user task and application/domain state.
2. Search `patterns/*.html` for an existing Forma contract.
3. Check `requirements/COMPONENT-CATALOG.md` if the needed pattern is not yet
   implemented.
4. Use the existing semantic HTML pattern unchanged where possible.
5. Supply application-specific labels, values, help text, and state without
   encoding domain meaning into visual position or color.
6. Put behavior beyond native HTML in the consuming application, normally at the
   Limen boundary.
7. Keep transition legality, obligations, scoring, permissions, and domain
   invariants in Ordo/application state, never in Forma.
8. Validate the result with repository and accessibility tests.
9. When an object has metadata, keep the metadata in the consuming model and render only the safe fields required by the UI; do not use CSS classes or color as the metadata store.
10. Workflow/diagram objects may use authored colors, but keep color independent from semantic type/status and always preserve a non-color cue.
11. For Figma/library work, read `docs/FIGMA.md` and use `figma/component-contracts.json`; never invent Figma node URLs or a second token source.

## How to consume Forma

The package is currently private/alpha. Do not invent a public npm installation
command. In this repository or a workspace checkout:

```bash
npm install
npm run build
```

Use the generated stylesheet appropriate to the application:

```html
<link rel="stylesheet" href="/path/to/forma/dist/all.css">
```

For finer-grained builds, use the generated token, foundation, component, and
assessment CSS files in `dist/`.

Copy or render the canonical markup contract from the corresponding file under
`patterns/`. Preserve labels, IDs, `for`, `aria-*`, native input types,
fieldset/legend relationships, and state attributes.

## Boundary rules

Agents must not:

- add runtime JavaScript or WebAssembly to Forma;
- add custom-element registration as a hidden behavior layer;
- replace a native element solely for styling;
- create duplicate components for presets such as Likert-5 vs Agreement-5 when
  one ordinal-scale contract already represents the structure;
- infer score, severity, legality, permission, or domain meaning from visual
  order;
- make drag, hover, color, or pointer input the only interaction path;
- hide required information solely in a tooltip or animation;
- fork a canonical pattern in an application only to change spacing or color;
- introduce an advanced behavioral control without naming the application/Limen
  behavior contract it depends on.

## State ownership

| Concern | Owner |
| --- | --- |
| Checked, open, required, disabled, native validity | Native HTML rendered by the application |
| Color, spacing, typography, responsive layout | Forma |\n| Brand identity and semantic visual tokens | Brand Manifest + Forma compiler |\n| Runtime brand/theme/skin selection and persistence | Consuming application / Limen |
| Async search, ranking movement, rule editing | Consuming application / Limen |
| Legal transitions, capabilities, obligations | Ordo/application domain state |
| Survey scoring or interpretation | Signal/application domain logic |
| Accessibility contract and non-color cues | Forma plus consuming application content |

## Choosing an existing pattern

Prefer the most semantic existing primitive.

- Binary assessment answer with an unanswered state: `binary-choice`, not a switch.
- Ordered agreement/frequency/confidence choices: `ordinal-scale`.
- Ordinary on/off preference: `switch`.
- Disclosure of optional content: native `details` via `disclosure`.
- Modal confirmation: native `dialog` via the `dialog` pattern.
- Edge-attached modal navigation, filters, details, or bounded work: `flyout` with `data-ef-side="left|right"`.
- Simple single/multi selection: `choice-group` / `multi-choice`.
- Complex ranking or rule construction: use the Forma visual contract and put
  behavior in Limen/application code.

## Brand and skin contract

Before changing application CSS for customer identity or presentation, read
`docs/BRANDING.md` and
`requirements/WHITE-LABEL-AND-SKINNING.md`.

- Express customer/product identity through a versioned Brand Manifest.
- Use documented `data-ef-skin` presets for presentation-only density or shape changes.
- Do not fork canonical component CSS, depend on internal selectors, or accept arbitrary customer CSS as the normal white-label path.
- Runtime brand/theme/skin selection, persistence, remote loading, and interactive preview behavior belong to the consuming application, normally through Limen.
- Brand terminology and asset references are application/build inputs; they are not hidden CSS content.
- Brand or skin changes must never alter legal actions, permissions, validation, scoring, obligations, or domain transitions.

## Public component tags

Use Forma's public inert authoring tag around the canonical semantic pattern:

```html
<ef-switch class="ef-component-tag">
  <label class="ef-switch">
    <!-- canonical native switch markup -->
  </label>
</ef-switch>
```

Rules:

- the tag name is `ef-` plus the canonical pattern slug;
- keep `class="ef-component-tag"` on the wrapper;
- never register these wrappers with `customElements.define()`;
- do not move native semantics onto the wrapper;
- forms, labels, `dialog`, Popover, `details`, ARIA relationships, and application state stay inside the wrapper;
- Limen/application behavior may compose around the tag but must not assume a hidden Forma runtime.

The wrapper is the public authoring/readability surface. The inner native pattern remains the behavioral and accessibility contract.

## Motion and perceived weight

Forma's controls and transient surfaces share one physics-derived CSS motion vocabulary.

- Use the canonical component default unless there is a documented visual-mass reason to override it: light for disclosure/popover/menu/tab cues, standard for notifications, heavy for modal dialog/flyout/command-palette surfaces.
- `light`, `standard`, and `heavy` are presentation presets only. Never map them to risk, severity, permission, validation, destructive intent, or domain importance.
- Mass affects inertial/spring response. It does not affect the gravity-derived timing used for vertical cues.
- Do not add JavaScript to compute animation timing. The canonical model is expressed with CSS custom properties and CSS math, with static CSS fallbacks.
- A consuming application may override the exposed physics variables for a justified branded/interaction treatment, but it must preserve reduced-motion behavior and native semantic state timing.
- Entry and exit come from the same model; transient-surface exit is deliberately shorter and more damped.
- Native `details`, `popover`, and `dialog` state remains authoritative. Never create a second CSS-only semantic state machine.
- Direct manipulation remains immediate; no physics effect may introduce pointer lag.
- Modal flyouts are Forma's canonical left/right modal drawer baseline and use native dialog behavior; swipe/drag/resizing, bottom sheets, and persistent nonmodal drawers belong to Limen/application code.
- Read `requirements/MOTION-AND-INTERACTION.md` before adding a new animated pattern.

### Choosing the motion model before the timing

Every animation represents one of five phenomena (MOT-010). Choose the model first, then use only that model's variables:

| Model | Use for | Timing variables |
| --- | --- | --- |
| inertial / spring | an object with perceived mass settling after activation or release (switch thumb, selection indicator, surface entry, press) | `--ef-motion-inertia-duration`, `--ef-motion-exit-duration`, `--ef-motion-press-duration`; `--ef-motion-spring-easing`, `--ef-motion-damped-easing` |
| gravity-derived | a small vertical directional cue; timing ignores mass | `--ef-motion-gravity-duration`; `--ef-motion-damped-easing` |
| constant-velocity / cadence | repeated activity or a bounded discrete sequence | `--ef-motion-cadence-period`; `--ef-motion-cadence-easing` (`linear`) |
| direct manipulation / authoritative value | drag, resize, scroll-linked, native range and determinate progress | `--ef-motion-direct-duration` (`0ms`); `--ef-motion-direct-easing` |
| perceptual interpolation | opacity, color, background, border, shadow, backdrop; never assigned mass | `--ef-motion-perceptual-duration`, `--ef-motion-perceptual-emphasis-duration`; `--ef-motion-perceptual-easing` |

`--ef-motion-state-duration` is a legacy compatibility variable: it derives from inertial mass, so shipped selectors must not use it for non-spatial change.

### Adding or changing an animation legally

1. Pick the model from the table above. Do not invent a sixth model in CSS; record the gap through ROS first (MOT-030).
2. Use only that model's variables. Literal durations/easings are allowed only as a var() fallback that restates the token value, as a canonical-variable definition, or as a literal justified on the classification entry with a requirement reference (MOT-012).
3. Classify every animated selector/property in `catalog/motion/classification.json` and declare its reduced-motion strategy (MOT-027): `explicit`, `scope-tokens`, `global`, `stop` (repeated/sequenced), `brief` (non-spatial only) or `preserve` (direct manipulation only).
4. Add or extend a browser test for the behavior (not just the timing) and list it under the matching requirement in `catalog/motion/conformance.json`; the gate verifies that every listed test exists.
5. Run `npm run test:motion` (part of `npm run check`, `release:check` and CI). It runs `node tools/motion-audit.mjs --strict` and fails on any new unclassified track, unexplained literal, generic-token timing, model/token mismatch, missing or unverified reduced-motion substitution, repeated motion that does not stop, the animated `transform` shorthand, unclassified keyframes or starting styles, and any stale classification.
6. The debt ledger `catalog/motion/debt.json` is closed and must stay empty: strict mode fails while it has any entry. Fix the finding; never record it.

## Mobile contract

Every Forma component must have a usable 320 CSS px presentation. Agents must:

- preserve semantic order and domain meaning across breakpoints;
- avoid page-level horizontal overflow for essential content at both 320px and a representative 390px phone width;
- provide approximately 44 by 44 CSS pixel standalone touch targets where practical;
- provide non-hover, non-drag, non-pointer-only alternatives;
- keep critical actions reachable when toolbars, tabs, panes, and grids collapse;
- preserve deep-link/URL state meaning when controls recompose;
- test reduced motion, focus, and forced-colors behavior after recomposition;
- use the documented Mobile · 320px example as a minimum baseline, not a device-specific fork.

Read `requirements/MOBILE-COMPONENT-CONTRACT.md` before adding or modifying a component.

## Visual Engineering verification

Before claiming consequential UI complete, apply `requirements/VISUAL-ENGINEERING-VERIFICATION.md`.

- Separate first-glance recognition from deliberate verification.
- Use `.ef-identifier` and `.ef-critical-value` for low-context values when appropriate.
- Use `verification-frame` when the task explicitly requires recognize -> verify -> act.
- Preserve unknown, partial, stale, reconciling, unavailable, and other application states without strengthening them.
- Exercise semantic-channel dropout, content stress, text spacing, grayscale/CVD screening, low-brightness/glare screening, zoom/reflow, forced colors, and reduced motion as applicable.
- Treat these as engineering screens, not proof of universal human performance.
- For consequential screens with competing regions, declare the intended attention path with `attention-path` and use `emphasis-budget` when one independently scoped decision region should have a single primary claimant.
- A `one-primary` budget applies to its own direct region only. Nested independent budgets are permitted. Do not interpret visual emphasis as severity, authority, permission, or transition legality.

## Figma contract

Figma mirrors Forma; it does not own Forma. For Figma-facing changes:

- keep `tokens/echelon.tokens.json` authoritative for token values;
- keep `patterns/*.html` authoritative for semantic anatomy;
- preserve the shared Figma property vocabulary in `figma/component-contracts.json`;
- use real published library node URLs before adding Code Connect templates;
- use the current template-file Code Connect workflow rather than legacy framework parsers;
- run `npm run test:figma` before claiming coverage complete.

A complete local Figma contract does not imply that the external Figma library or Code Connect publication has been verified.

## Verification

Before claiming a Forma UI change complete:

```bash
npm run check
npm run site:check
./ros registry check
./ros validate
```

The documentation build enforces that every implemented `patterns/*.html`
component has a dedicated page with at least three rendered examples including
a true 320px mobile preview, that the published site contains no runtime
`<script>` element, and that generated-site mobile containment regressions are
tested. The browser suite also checks canonical patterns for mobile reflow and
touch-target behavior.

## Documentation site

The site is generated, not hand-maintained page by page. Canonical component
markup remains in `patterns/`; `tools/build-site.mjs` creates the catalog and
individual pages.

When adding a pattern:

1. add the canonical `patterns/<slug>.html` file and tests;
2. add its metadata to `tools/build-site.mjs`;
3. run `npm run site:check`;
4. confirm the new component page contains at least three meaningful examples, including the explicit Mobile · 320px example;
5. update requirements/decision records through ROS when the addition changes
   the public design-system contract.


## Character grids (terminal-style screens)

When a screen is keyboard-first and its information model depends on fixed
character positions (IBM 3270/5250-style, text-mode, TUI, or modern
character-grid tools), use the CharacterGrid family instead of inventing a
terminal component:

1. read `requirements/CHARACTER-GRID.md` and `docs/CHARACTER-GRID-AUTHORING.md`;
2. start from `patterns/character-grid*.html`; the three-screen reference is
   `patterns/character-grid-workflow.html`;
3. declare geometry and `data-ef-row/col/len` per run, and write runs in
   row-major order — never use positive `tabindex` or inline `style`;
   `data-ef-rows` is the application's rows; a device status line outside
   them (the 3270 OIA) is `data-ef-status-rows="1"` and holds status only;
4. fields are native inputs with `maxlength` = `data-ef-len` and a preceding
   `<label for>`; protected values are text, never `readonly` inputs;
5. keys are native buttons (`data-ef-action`, `<kbd>`), Enter first, Reset
   `type="button"`, never `type="reset"`;
6. key mapping, Enter/Clear/Reset/PF processing, transitions, input
   inhibition, and reveal orchestration are Limen/application behavior;
   legality is Ordo;
7. profiles (`data-ef-profile="ibm-3270"`) change presentation only;
   SequentialReveal is optional, protected-text-only, and static under
   reduced motion;
8. run `node tools/character-grid-conformance.mjs` on your markup, plus
   `npm run test:character-grid`.

## Aegis fault presentation

When presenting a fault produced by Aegis:

1. map the safe `Aegis.Presentation.T` view into Forma; do not bind the raw `Fault`;
2. map `Silent` to no visible fault surface;
3. map `Inline`, `Notification`, `Banner`, and `Blocking` to `fault-inline`, `fault-notification`, `fault-banner`, and `fault-blocking`;
4. render exact Aegis recovery capability identity through `data-ef-aegis-capability`;
5. treat that DOM attribute as descriptive only and revalidate current capability/Ordo state at activation;
6. keep `TechnicalDetails`, exception chains, stack traces, raw context, breadcrumbs, snapshots, and secrets out of normal presentation;
7. use `fault-details` only with an explicitly approved and already-sanitized view model;
8. let Aegis/application logic own fingerprinting, throttling, lifecycle, resolution, and occurrence counts;
9. let Limen/application behavior own notification lifetime, copy actions, blocking-dialog policy, focus transitions, and recovery execution.

Read `docs/AEGIS-INTEGRATION.md` and `requirements/AEGIS-FAULT-PRESENTATION.md` before creating a new fault presentation.


## Marketing and public sites

For an Echelon marketing, product, or documentation website, follow
`docs/MARKETING-SITES.md`. That page covers new sites; for an existing site,
follow `docs/marketing/MIGRATION-CONTRACT.md`.

- Consume a pinned release through `forma.lock` and
  `actions/install-presentation`. Never copy Forma CSS.
- Start from `patterns/marketing-shell.html`. Compose pages from the marketing
  patterns. Write content, not CSS.
- Site-local CSS is limited to identity imagery, content unique to the site,
  and allowlisted identity-token retargets. `tools/SiteCssPolicy` enforces
  this.
- A presentation need that other sites could share is a Forma capability gap
  (`requirements/MARKETING-PRESENTATION.md`, MKT-LOCAL-4). Do not build a
  local look-alike.


## Object metadata and diagram/workflow color

Read `requirements/OBJECT-METADATA-AND-DIAGRAM-PRESENTATION.md` before adding metadata-rich or diagram/workflow presentation.

- Object identity, metadata, type/status, and color are separate concepts.
- Forma may render metadata but does not own or calculate it.
- Use semantic metadata presentation rather than burying important values in `data-*` attributes.
- Do not put secrets or suppressed values in attributes, CSS content, hidden text, or diagnostics.
- Workflow/diagram items may have authored fill, stroke, accent, connector, and when safe foreground colors.
- Prefer Forma tokens/palette slots; explicit consumer literals are allowed only when the consuming product contract permits them.
- Never infer workflow meaning from color. A metadata-to-color rule must be explicit application/profile data.
- Verify dark/light, forced colors, grayscale, and backgrounds-disabled output when diagram color matters.
- Graph topology, routing, drag/drop, commands, workflow execution, and legal transitions remain outside Forma.
