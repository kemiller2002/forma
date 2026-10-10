# Motion and Interaction Requirements

Polished UI is not produced by adding animation after layout is complete. Motion is part of the interaction grammar.

## 1. Motion principles

### MOT-001 Purpose
Every animation shall serve at least one of:

- continuity between states;
- confirmation of input;
- spatial relationship;
- hierarchy;
- attention to a newly available result;
- transition into or out of a temporary surface;
- progress or activity feedback.

Animations with no communication purpose should be removable without loss.

### MOT-002 Direct manipulation
During dragging, sliding, resizing, scrubbing, or other direct manipulation, the controlled visual shall track the pointer without decorative lag.

Spring, easing, or overshoot effects may occur after release only when they do not change the selected semantic value or reduce control.

### MOT-003 Reduced motion
All meaningful motion patterns shall define a prefers-reduced-motion behavior.

Reduced motion shall not simply make every duration zero if a short opacity change preserves comprehension better. Large translations, zooms, parallax, rotations, and repeated motion should normally be removed.

### MOT-004 Interruption
Animations shall be safely interruptible. Rapid repeated input must not queue long animation sequences.

### MOT-005 State accuracy
The visual state at the end of animation shall always match the actual component state.

Animation state is never semantic authority.

### MOT-006 Performance
Prefer compositor-friendly opacity and transform animation when appropriate. Avoid layout-thrashing animation for decorative effect.

## 2. Token model

Define:

- motion-duration-instant
- motion-duration-fast
- motion-duration-standard
- motion-duration-slow
- motion-duration-emphasis
- motion-ease-standard
- motion-ease-enter
- motion-ease-exit
- motion-ease-emphasized
- direct-manipulation response tokens
- reduced-motion substitutions

Do not expose arbitrary per-component animation timings without a demonstrated reason.

### MOT-008 Physics-derived response model

Forma may use a deterministic physics-derived model when motion needs to convey perceived mass consistently across controls and transient surfaces. This is not a continuous rigid-body simulation and must not be described as one.

The canonical normalized variables are:

- `--ef-motion-mass` (`m`): inertial mass;
- `--ef-motion-stiffness` (`k`): spring/restoring stiffness;
- `--ef-motion-damping` (`ζ`): normalized damping ratio in the supported underdamped preset range;
- `--ef-motion-distance` (`s`): normalized travel distance for gravity-derived movement;
- `--ef-motion-gravity` (`g`): normalized gravitational acceleration;
- `--ef-motion-base-duration`: the dimensional scale factor that maps the normalized model to UI time;
- `--ef-motion-exit-duration`: a compatibility dismissal token equal to inertial entry.

For spring/inertial settling, Forma uses the second-order-system scaling relationship:

`T_inertia ∝ sqrt(m / k) / ζ`

The constant and physical units are intentionally normalized into the base duration because UI pixels are not meters and the component is not a literal mechanical body.

For vertical gravity-derived travel, Forma uses:

`T_gravity ∝ sqrt(2s / g)`

Mass must not appear in the gravity-derived duration. In a uniform gravitational field, changing an item's mass does not change its gravitational acceleration.

The shipped weight presets are:

| Weight | Mass | Stiffness | Damping ratio | Intended perception |
| --- | ---: | ---: | ---: | --- |
| light | 0.65 | 1.15 | 0.94 | fast, highly damped, little perceived inertia |
| standard | 1.00 | 1.00 | 0.84 | default control response |
| heavy | 1.80 | 0.92 | 0.76 | slower, more inertial settling |

Rules:

- presets are presentation parameters, never business or domain semantics;
- component size does not automatically determine mass;
- weight may change inertial timing but may not delay the native semantic state change;
- gravity-derived timing remains independent of mass;
- CSS math support may be progressively enhanced; unsupported browsers must retain a usable static/fallback timing;
- motion must remain interruptible;
- tests must verify the expected ordering `light < standard < heavy` for inertial duration and verify mass independence for gravity timing;
- transient-surface exit duration equals inertial duration, including the same clamp bounds;
- reduced motion collapses spatial travel and overshoot while retaining clear final state.

### MOT-009 Surface mass grammar

The same physical variables shall be used across controls and transient surfaces. Forma's canonical defaults are:

| Surface family | Default perceived weight | Rationale |
| --- | --- | --- |
| disclosure indicator, tab indicator, popover, ordinary action menu | light | local, quickly reversible context |
| alert / toast notification | standard | deserves attention without modal weight |
| modal dialog, flyout / modal drawer baseline, command palette | heavy | larger spatial and attentional commitment |

These defaults describe perceived inertia only. They do not encode severity, privilege, business importance, risk, destructive intent, or domain legality.

Applications may override the preset when composition provides a real visual-mass reason, but one product should not make physically equivalent surfaces behave arbitrarily differently.

## 3. Switch polish contract

The switch is a flagship microinteraction and shall feel deliberate.

### Resting transition
On state change:

1. track visual state changes;
2. thumb travels to its new position;
3. optional icon/glyph state changes;
4. label/state text updates without layout jump;
5. accessibility state changes immediately with the semantic value, not after animation.

### Pointer press
The thumb may expand slightly or the track may provide press feedback.

The press effect must not move the semantic target or make the control difficult to release.

### Keyboard activation
Space activation shall produce the same state transition as pointer activation and retain a visible focus indicator.

### Reduced motion
Thumb travel may become immediate or nearly immediate. State differentiation remains clear through position, shape/glyph, text, and color.

## 3.5 Checkbox and native-select physics extensions

### Checkbox

The canonical checkbox remains a native `input[type=checkbox]`. CSS may animate a visible box/check glyph using the same inertia model as the switch.

Requirements:

- checked state changes immediately at the native input;
- the check glyph is a non-color state cue;
- press feedback does not change target geometry or semantic state;
- light/standard/heavy presets use the shared physics variables;
- reduced motion makes the glyph/state change effectively immediate.

### Native select

The canonical ordinary select remains a native `select`; Forma shall not recreate its option picker in script.

Requirements:

- platform value, keyboard, form, disabled, and picker behavior remain authoritative;
- the visible indicator may use inertial rotation;
- a small vertical indicator cue may use gravity-derived timing;
- mass may alter the inertial indicator duration but not gravity-derived timing;
- `:open` styling is progressive enhancement only; lack of open-state styling cannot reduce usability;
- searchable, rich-option, async, and multiselect behavior remains a Limen/application concern;
- reduced motion removes spatial indicator travel.

## 4. Slider polish contract

The canonical slider uses native `input[type=range]` behavior.

### SL-MOT-001 Native interaction is authoritative
The browser-owned thumb, track, keyboard behavior, touch behavior, and value semantics shall remain the interaction substrate.

CSS may style accent color, focus treatment, opacity, surrounding labels, bounds, and non-semantic hover/active emphasis without replacing the native control.

### SL-MOT-002 No fake synchronized fill
The HTML/CSS-only package shall not promise a cross-browser custom filled track that must continuously mirror the changing range value.

If a consuming application needs a custom fill, live value bubble, histogram, or synchronized numeric display, Limen/application behavior owns that synchronization.

### SL-MOT-003 Focus and active polish
The slider shall have deliberate focus-visible treatment and may use subtle CSS-only hover/active emphasis that does not interfere with direct manipulation.

### SL-MOT-004 Bounds and named context
Static minimum/maximum labels, named stops, help text, units, and descriptive context may be included in the canonical markup because they do not require value synchronization.

### SL-MOT-005 Reduced motion
Any CSS transitions around the native control shall collapse under reduced motion.

### SL-MOT-006 Multi-thumb
Multi-thumb range selection is not a declarative design-system component. It is a visual contract whose coordinated value/keyboard behavior must be implemented and tested by Limen/application code.

### SL-MOT-007 Application synchronization
When application behavior mirrors the range value elsewhere, the application must treat the native input value as the browser source for the current interaction and avoid oscillation or delayed disagreement.

## 5. Segmented control

The selected indicator may move between segments to reinforce continuity.

Requirements:

- selected semantics update immediately;
- the indicator may interpolate position/size;
- text does not slide unnecessarily;
- reduced motion uses immediate indicator placement or a short fade;
- rapid keyboard arrow movement does not queue animations.

## 6. Tabs

Tab-panel transitions are optional.

If used:

- the selected indicator uses the shared light surface-response model;
- changing `aria-selected` remains semantically immediate and is never delayed by indicator motion;
- changing panels must not delay focus;
- directionality may reflect adjacent tab movement;
- content should not fly large distances;
- automatic tab activation shall not produce distracting repeated animation during arrow navigation;
- rapid selection changes must retarget the current transition rather than queue motion;
- reduced motion removes translation and indicator travel while preserving selected styling.

## 7. Dialog, popover, menu, tooltip, flyout, drawer

### Entry
Temporary surfaces may use opacity plus a small spatial cue related to origin.

Popover and ordinary action-menu surfaces use the light preset by default. Modal dialog, flyout, and command palette use the heavy preset by default.

Popover/menu motion should visually connect to its invoker.

Centered modal dialogs shall use a restrained vertical/scale response. Modal flyouts shall travel from the edge they occupy: negative inline travel for the left edge and positive inline travel for the right edge.

Dialog, flyout, popover, and menu spatial entry shall use the shared physics-derived inertia model. `data-ef-motion-weight="light|standard|heavy"` may tune perceived mass, but it must never imply domain importance, severity, permission, risk, or destructive intent.

### Exit
Entry and exit use the same duration and easing. Direction comes from the target position, including mirrored left/right origins.

Focus restoration shall not wait on decorative animation. Native dialog and Popover state changes immediately; animation only represents that state.

### Native authority
Native `dialog[open]`, `:popover-open`, and `details[open]` remain semantic authority. CSS motion must not synthesize a parallel visibility state.

### Ordinary action-menu boundary
Forma may provide an ordinary action-list menu surface using the Popover API with normal buttons or links. The declarative baseline intentionally does not claim the full ARIA `menu` interaction model.

If an application requires roving focus, typeahead, checkable menu items, radio menu items, nested submenus, or other full ARIA-menu behavior, Limen/application code owns that interaction model.

### Flyout / modal drawer boundary
The native-dialog `.ef-flyout` pattern is Forma's canonical left/right modal drawer or side-sheet baseline. It preserves native modal focus, inertness, Escape, and return-focus behavior while presenting the surface from its occupied edge.

Swipe tracking, velocity-based release, resize gestures, bottom sheets, persistent nonmodal drawers, and other direct manipulation belong to Limen/application code.

A direct-manipulation enhancement must track the pointer without lag and may use a spring only after release. It may not become the only close path.

### Backdrop
Modal dialog and flyout backdrops may fade and apply a small visual blur. Backdrop animation must remain synchronized with the top-layer surface and must not communicate state that is absent from text or semantics.

### Reduced motion
Reduced motion removes modal scale/translation, flyout edge travel, and other transient-surface spatial motion. The final open/closed distinction remains immediate and unambiguous.


## 8. Reorder and drag

During drag:

- dragged item remains identifiable;
- original position and candidate drop position remain clear;
- auto-scroll is controlled;
- other items may shift to preview placement;
- animation never makes drop position ambiguous.

Keyboard reorder shall receive equally clear position feedback and live announcements.

## 9. Resizable panes

Pointer resize updates should be immediate.

Keyboard resize may animate only enough to show the change.

Collapse/expand may animate width/height or transform when this does not destabilize content. Reduced motion uses an immediate size change.

## 10. Loading and completion

### Skeleton
Skeleton animation is optional and must respect reduced motion. Static skeletons are valid.

### Spinner
Indeterminate spinners shall not be the only indication of what operation is occurring.

### Progress
Determinate progress transitions may interpolate between known values but shall never visually imply progress beyond the actual value.

### Success
Short success confirmation may use check/glyph transition. It shall not create a required delay before the next action.

### Alert and toast notification
A newly inserted alert may opt into a standard-weight entry cue with a short spatial movement. Persistent alerts shall not repeatedly animate merely because a page rerenders.

Toast notifications use a standard perceived weight by default. When implemented with the Popover API, show/hide state remains browser authoritative and dismissal uses the same inertial duration as entry.

Notification motion never substitutes for live-region semantics, visible text, dismissal policy, or durable confirmation.

## 11. View transitions

View Transitions may be used for navigation and major state changes where they improve continuity.

They are an enhancement, not a routing dependency.

Requirements:

- semantic navigation completes even without animation;
- focus and announcement behavior is verified;
- stale snapshots cannot receive interaction;
- reduced motion can skip or simplify the transition;
- shared-element transitions are used sparingly.

## 12. Animation test requirements

Each animated component shall have tests or deterministic checks for:

- final state;
- interrupted state;
- rapid repeated activation;
- reduced motion;
- disabled state;
- focus retention;
- no semantic delay;
- no interactive invisible state after close;
- no pointer-only dependence.


## 13. Aegis fault surfaces

Aegis presentation intent determines the surface family; motion does not determine severity or intent.

- Inline faults do not require spatial entry motion.
- Fault notifications use the standard perceived-weight preset by default.
- Fault banners use the standard perceived-weight preset only for initial insertion and do not repeatedly animate while persistent.
- Blocking faults use the heavy perceived-weight preset because they are modal surfaces with greater spatial/attentional commitment.
- `data-ef-motion-weight` remains a presentation override only and may not encode Diagnostic/Warning/Error/Critical.
- Aegis lifecycle state changes immediately. Animation never delays acknowledgement, recovery, resolution, focus, or application state.
- Reduced motion removes notification/banner travel and modal scale/travel while preserving the final visible state.


## 14. Motion model taxonomy

### MOT-010 Every animation selects an explicit model

Every Forma animation SHALL use the motion model that matches the phenomenon being represented. The allowed canonical models are:

1. **Inertial / spring response**
   - Use for an object that is perceived as having mass and is moving toward a stable state after activation or release.
   - Examples: switch thumb, selection indicator, dialog or flyout entry, post-drop settling, post-snap pane settling.
   - Use the canonical mass, stiffness, damping, and derived inertia duration variables.
   - Overshoot MAY be used only when it cannot imply a false semantic value, exceed a constrained boundary, or reduce control.

2. **Gravity-derived directional response**
   - Use for a small directional cue whose timing is intended to evoke vertical travel under uniform acceleration.
   - Use the canonical distance and gravity variables.
   - Mass SHALL NOT influence gravity-derived timing.
   - Gravity-derived motion SHALL NOT be used merely as a synonym for "move vertically."

3. **Constant-velocity / cadence motion**
   - Use for continuous or repeated activity where the visual represents ongoing work rather than a body settling at rest.
   - Examples: spinner rotation, skeleton shimmer, marquee-like activity only when independently justified.
   - Period, angular velocity, linear velocity, or cadence SHALL be the primary parameters.
   - Spring easing, bounce, and inertial settling SHALL NOT be applied to a continuous cycle.

4. **Direct-manipulation / authoritative-value tracking**
   - Use when the pointer, scroll position, native control value, or application value is the authoritative input during the interaction.
   - Examples: drag, resize, range input, scrubber, scroll-linked effect, determinate progress.
   - The controlled visual SHALL track the authoritative value without decorative lag.
   - The model SHALL NOT overshoot the authoritative value.
   - After release, a separate inertial model MAY be used for snapping or settling if semantics do not change.

5. **Perceptual interpolation**
   - Use for presentation changes that do not meaningfully represent a physical object moving through space.
   - Examples: opacity, color, backdrop tint, subtle blur, non-spatial crossfade, theme interpolation.
   - Perceptual interpolation SHALL use shared state-transition tokens.
   - It SHALL NOT be assigned fake mass, gravity, momentum, or spring semantics solely to make the animation feel "physical."

### MOT-011 Model selection is required before timing selection

A component SHALL choose its motion model before choosing duration or easing.

The following are defects unless explicitly justified and documented:

- choosing `ease`, `ease-in-out`, a cubic Bézier, or a duration by visual preference alone;
- using spring motion for every state change regardless of phenomenon;
- applying multiple incompatible motion models to the same visual degree of freedom;
- varying motion behavior between equivalent components without a visual-mass or interaction reason;
- using motion to imply urgency, severity, privilege, permission, correctness, confidence, or domain importance.

## 15. Motion parameter governance

### MOT-012 No unexplained component-local timing constants

New component, assessment, marketing, and documentation-site animations SHALL use canonical motion variables or a documented derivative of them.

A literal duration or easing MAY exist only when at least one of the following is true:

- it is the documented static fallback for a canonical motion variable;
- it is part of a bounded cadence model with an explicitly named period or velocity;
- it is required for compatibility and is linked to the canonical behavior it approximates;
- a requirement records why the shared model cannot represent the behavior.

Unexplained values such as `180ms ease`, `0.2s ease-in-out`, or a one-off cubic Bézier SHALL NOT be introduced.

### MOT-013 Motion cannot gate semantic completion

No animation duration, delay, iteration, or transition event SHALL be required before:

- checked, selected, expanded, open, closed, disabled, or validity state becomes true;
- a legal application transition completes;
- focus moves or is restored;
- an operation is acknowledged;
- a user can continue after the application has already reached the next legal state.

Animation represents state. It does not authorize or complete state.

## 16. Press, release, and selection motion

### MOT-014 Press response

Buttons, selectable surfaces, switch thumbs, checkbox marks, segments, ordinal choices, and similar controls MAY use a restrained press response.

Requirements:

- press feedback SHALL begin immediately;
- press feedback SHALL NOT move or shrink the interactive hit target;
- press feedback SHALL NOT delay activation;
- spatial press feedback SHALL use the light inertial family unless a documented visual-mass reason requires another preset;
- release MAY use a damped return response;
- rapid press/release SHALL retarget the current response instead of queueing animations;
- reduced motion SHALL remove spatial compression or elevation.

### MOT-015 Selection indicators

Where a selected option has a moving or resizing indicator, including segmented controls and tab-like selectors:

- semantic selection SHALL update immediately;
- the indicator SHALL use the light inertial model;
- the indicator MAY interpolate position and size but SHALL NOT drag option text with it solely for decoration;
- rapid keyboard or pointer changes SHALL retarget the indicator without queue buildup;
- the indicator SHALL end exactly on the selected option;
- reduced motion SHALL place the indicator immediately or use a short non-spatial perceptual interpolation.

Choice cards, ordinal options, symbol ratings, and similar assessment selectors SHALL use the same press and state-response vocabulary rather than inventing independent timing curves.

## 17. Loading, activity, and progress

### MOT-016 Indeterminate activity uses cadence, not spring physics

Indeterminate spinners, skeletons, and other repeated activity indicators SHALL use the constant-velocity / cadence model.

Requirements:

- repeated motion SHALL have an explicitly named period, velocity, or cadence;
- continuous activity SHALL NOT bounce or spring on every cycle;
- animation speed SHALL NOT encode operation importance or expected completion time unless the application has a truthful mapping;
- repeated motion SHALL stop when the represented activity stops;
- persistent rerendering SHALL NOT restart the motion in a way that suggests new work;
- reduced motion SHALL provide a static or minimally changing equivalent while visible text or semantics continue to identify the activity.

Skeleton shimmer SHALL use a shared cadence variable rather than a component-local hardcoded duration.

### MOT-017 Determinate progress is monotonic and non-overshooting

A determinate progress visualization SHALL be a direct projection of the authoritative progress value.

Requirements:

- the visual SHALL never show progress beyond the known value;
- spring overshoot and bounce are prohibited for the progress dimension;
- interpolation between received values MAY be used only if it cannot overtake the authoritative value;
- a decrease caused by reconciliation SHALL be represented truthfully rather than hidden;
- completion animation SHALL NOT run before the application reports completion;
- reduced motion SHALL permit immediate value placement.

## 18. Tooltip and hint motion

### MOT-018 Tooltip / hint surface

Forma SHALL define a tooltip or contextual-hint visual contract when product requirements need transient explanatory content that cannot be represented adequately by ordinary visible help text.

The motion contract is:

- light perceived weight by default;
- opacity plus a very small origin-related displacement MAY be used;
- entry SHALL visually relate the surface to its invoker without large travel;
- exit SHALL share entry duration and easing;
- motion SHALL NOT be the only indication that the surface appeared;
- the content SHALL NOT require hover as its only access path;
- focus, dismissal, timeout, and accessible-description behavior remain native/application responsibilities according to the chosen semantic pattern;
- reduced motion SHALL remove displacement and may retain a short fade.

## 19. Reorder, drag, and drop settling

### MOT-019 Direct drag and post-drop settling

During direct drag:

- the dragged representation SHALL track the pointer without decorative latency;
- the candidate drop position SHALL remain unambiguous;
- sibling movement MAY preview placement but SHALL not obscure the target position;
- auto-scroll SHALL remain controlled and shall not add a second inertial simulation.

After release:

- displaced items MAY settle with the light or standard inertial model;
- the dropped item MAY settle only after the semantic drop result is known;
- a rejected drop SHALL visibly return to the authoritative position without implying success;
- cancel/revert SHALL have an immediate keyboard-accessible path;
- keyboard reorder SHALL produce an equivalent final visual state and MAY use the same settling response;
- reduced motion SHALL place items directly at the final position.

## 20. Resize, split panes, and snapping

### MOT-020 Resize tracks input; snapping may settle after release

Pointer-driven resizing SHALL track pointer position directly.

Keyboard resizing SHALL update promptly and SHALL NOT accumulate animated lag.

Snap points, collapse targets, or release-time settling MAY use a damped inertial response only after the direct manipulation ends.

Requirements:

- no overshoot beyond minimum, maximum, or legal size constraints;
- focus and keyboard access SHALL survive collapse/expand;
- the semantic collapsed/expanded state SHALL not wait for motion;
- reduced motion SHALL place the pane directly at its final size.

## 21. Intrinsic-size transitions

### MOT-021 Intrinsic-size animation is progressive enhancement

Expansion and collapse of content whose final size is intrinsic MAY use browser capabilities such as intrinsic-size interpolation when supported.

Requirements:

- the non-animated layout SHALL remain correct when intrinsic-size animation is unsupported;
- content SHALL NOT become inaccessible because an intermediate clip hides the only focus target or required information;
- layout animation SHALL not produce page-level overflow or strand focused content;
- no script SHALL be added to Forma solely to measure `auto` dimensions;
- reduced motion SHALL use immediate size change or a non-spatial substitution;
- use of `interpolate-size`, `calc-size()`, or a similar feature SHALL be progressive enhancement, not a component dependency.

## 22. View-transition motion

### MOT-022 View Transitions are optional continuity enhancement

View Transitions MAY be used for navigation or major application-state changes when they preserve useful continuity.

Requirements:

- routing and semantic state SHALL complete without View Transitions support;
- a snapshot SHALL never become semantic authority;
- stale snapshots SHALL not remain interactive;
- focus placement, announcements, history, and deep-link behavior SHALL be correct without relying on animation;
- shared-element transitions SHALL be limited to elements whose identity is genuinely continuous across states;
- unrelated elements SHALL not morph into each other merely because geometry is convenient;
- reduced motion SHALL skip or simplify spatial transitions;
- the consuming application owns transition orchestration. Forma may provide visual contracts and named presentation tokens only.

## 23. Scroll-linked motion

### MOT-023 Scroll position is authoritative

A scroll-linked animation SHALL use the direct-manipulation / authoritative-value model.

Requirements:

- visual progress SHALL be a deterministic function of scroll progress or an explicitly defined timeline;
- no additional spring lag SHALL be layered on top of the user's scroll position during direct scrolling;
- the effect SHALL not trigger a consequential operation solely because an animation crossed a visual threshold;
- content readability and control usability SHALL not depend on the animation running;
- reduced motion SHALL use a static state or a non-spatial mapping;
- scroll-driven CSS features SHALL be progressive enhancement.

## 24. Concurrent and additive motion

### MOT-024 Independent effects shall not clobber one another

When one element needs more than one simultaneous motion effect, the implementation SHALL define how those effects compose.

Preferred approaches include:

- independent transform properties such as `translate`, `scale`, and `rotate`;
- explicitly additive animation composition when browser support and the interaction justify it;
- separate nested presentation elements when effects represent independent physical layers.

Two animations SHALL NOT silently compete for the same transform or property such that one cancels, resets, or corrupts the other.

Press feedback, state movement, and entry/exit response SHALL remain independently interruptible.

## 25. Metric and value-change motion

### MOT-025 Changing values remain truthful during animation

Metric cards, counters, totals, timestamps, status values, and dashboard numbers MAY use a restrained change cue.

Requirements:

- the semantic value SHALL update immediately;
- the default treatment SHOULD be a short perceptual interpolation or emphasis cue rather than rolling every intermediate number;
- slot-machine, odometer, or count-through animation SHALL require a demonstrated task benefit;
- an animated intermediate value SHALL NOT be exposed as though it were authoritative data;
- sign, units, and magnitude SHALL remain legible throughout the transition;
- motion SHALL NOT imply improvement, decline, success, or severity unless the underlying semantic state explicitly supports that meaning;
- reduced motion SHALL show the new value immediately.

## 26. Theme, color, and non-spatial state changes

### MOT-026 Non-spatial visual changes use perceptual interpolation

Color, background, border, shadow, opacity, backdrop tint, and similar state changes that do not represent physical travel SHALL use the perceptual interpolation model.

Requirements:

- color transition SHALL never be the sole state cue;
- theme switching SHALL not introduce large spatial motion;
- forced-colors mode SHALL preserve state without depending on interpolated color;
- reduced motion MAY keep a brief non-spatial transition when it improves comprehension, but SHALL remove unnecessary repeated or spatial effects;
- shared semantic state-duration/easing tokens SHALL be used instead of component-local timing.

## 27. Reduced-motion substitutions by model

### MOT-027 Reduced motion is model-aware

Reduced-motion behavior SHALL be defined by motion model:

| Model | Reduced-motion behavior |
| --- | --- |
| inertial / spring | remove travel, overshoot, bounce, and spatial compression; place final state immediately or nearly immediately |
| gravity-derived | remove spatial travel |
| constant-velocity / cadence | stop repeated motion; retain static activity/status indication |
| direct manipulation / authoritative value | preserve direct mapping; do not add smoothing or lag |
| perceptual interpolation | retain only a brief non-spatial transition when it materially improves comprehension |

Reduced motion SHALL never remove the final state cue, text, focus indication, progress value, or activity semantics.

## 28. Motion coverage and conformance

### MOT-028 Every animated selector belongs to the motion system

Every shipped selector that uses `transition`, `animation`, `@keyframes`, View Transition styling, scroll timelines, or motion-related transforms SHALL be classifiable under this document.

Forma SHALL maintain deterministic coverage capable of detecting:

- new animated selectors that are not mapped to a canonical motion model;
- unexplained literal durations/easings;
- repeated motion without reduced-motion substitution;
- spatial motion that survives reduced-motion mode without explicit justification;
- progress or direct-manipulation motion that uses overshoot;
- animation used as semantic authority.

This coverage applies to:

- core component CSS;
- assessment CSS;
- marketing presentation CSS;
- Forma's own documentation/example site CSS.

### MOT-029 Family-specific tests

In addition to the common tests in section 12, deterministic tests SHALL verify as applicable:

- inertial ordering remains `light < standard < heavy`;
- gravity timing remains mass-independent;
- cadence animations use the declared shared period/velocity;
- direct-manipulation visuals do not lag the authoritative input;
- determinate progress never visually exceeds its authoritative value;
- selection indicators retarget rather than queue under rapid input;
- drop/resize settling obeys legal boundaries;
- reduced motion applies the model-specific substitution;
- concurrent animations compose without property clobbering;
- unsupported progressive-enhancement features fall back to correct static behavior.

### MOT-030 New motion models require an explicit requirement

An agent SHALL NOT invent a sixth motion model in component CSS.

When a real interaction cannot be represented by the five canonical models, the work SHALL first record:

- the phenomenon being represented;
- why the existing models are insufficient;
- semantic and accessibility invariants;
- interruption and reduced-motion behavior;
- parameters and testable relationships;
- expected implementation boundary between Forma and application/Limen.

Only then may the canonical motion vocabulary be extended.

## MOT-030 — Reciprocal interactions

Every reversible interaction SHALL share its motion model, mass, stiffness, damping, duration calculation, clamp bounds and easing in both directions. Only the target state and appropriate direction change. Left/right flyouts SHALL mirror their spatial origins. The exit token remains a compatibility name for inertial duration. Perceptual opacity and backdrop tracks retain their own shared perceptual model. Reduced motion SHALL remain immediate.

Rapid changes SHALL retarget retained browser transitions from the current rendered position without an application animation queue. When the browser does not retain a closing native dialog in the rendered/top layer, immediate disappearance at its closed endpoint is the supported progressive fallback; semantic state, focus return and subsequent reopening must remain correct. CSS does not guarantee continuous physical velocity, and native top-layer display/overlay behavior remains browser-owned. A consuming application requiring strict velocity continuity must supply its motion controller through Limen; Forma does not introduce a runtime simulator.

Supersedes the shorter-exit guidance in MOT-008, MOT-009 and MOT-020. Verify preset equality at clamp boundaries, paired browser durations/easings, mirrored flyout origins and interrupted reversal.
