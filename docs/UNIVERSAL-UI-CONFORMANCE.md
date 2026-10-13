# Universal UI Layout and Action Conformance Adoption

Status: implementation pilot (not yet a passed release gate)  
Authority: `visual-engineering/UI-LAYOUT-INTERACTION@1.0.0` (`kemiller2002/visual-engineering/framework/standards/UI-LAYOUT-INTERACTION.md`). Forma cites its rule IDs (ULI-L01..L13, ULI-A01..A10), statuses and tolerances; it does not restate or fork them.  
Crosswalk: `kemiller2002/application-visual-language/style-guide/ui-conformance.md`

Forma owns **intrinsic component layout**, semantic markup and the documentation presentation system. It does not own a consumer's domain operation: Limen/application code owns behaviors beyond native HTML. Do not introduce runtime behavior into the package to make a demo pass.

## Change requirements for agents

1. Declare sibling alignment intent before placing multi-column fields. Peer text inputs, selects and controls in the same form row have a shared top edge, unless the composition explicitly chooses another relationship. A label/help-text difference must not accidentally stagger the input controls. Use `.ef-form-row` (catalog: Form row) for peer fields and declare the group in the example's `alignment` (or `basicAlignment`).
2. Prefer a compositional Forma layout primitive over local corrective `margin-top`, offsets or CSS hacks. Record missing primitives as design-system requirements. Intrinsic control heights and internal icon geometry belong in Forma.
3. Test at 320, 390, 768 and 1280 CSS pixels; preserve visible names and avoid unintended page horizontal overflow. Include long labels, validation text, zoom and expanded/error states where relevant.
4. Classify each documentation example explicitly as **live demo** or **static specimen** with its `interaction` declaration (`basicInteraction` for the canonical Basic example; schema and reasons in `tools/catalog/interaction.mjs`). A live demo's enabled controls MUST perform a real native/local state change or a clearly indicated mock operation with observable result. Static specimens may illustrate markup/disabled states but must not claim an operation completed. Do not silently convert buttons into meaningless inert decoration.
5. Do not add inline `on*` handlers or `<script>` into canonical patterns/catalog HTML. Demo behavior must be owned by the documentation application/harness or a consumer application. Every added behavior must remain independently accessible, keyboard-operable and machine-operable.
6. For every live example with actions, specify input state, invocation, expected DOM/native result and reset/replay strategy. A click without observable outcome is not sufficient proof.
7. Keep each exception local, with rule ID, reason, owner and review trigger. Avoid global test skips.

Reference browser helpers: the dev-only package `@echelon-foundry/forma-conformance` (`packages/conformance`, API in its README; `tests/site-browser/ui-conformance-helpers.mjs` re-exports it), self-tested by `tests/site-browser/ui-conformance-helpers.spec.mjs` (run by `npm run site:mobile`). The package is separate from the zero-runtime design-system package and is checked by `tests/conformance-package.test.mjs`. These helpers only prove assertions in tests that invoke them; their presence does not establish site-wide coverage.

- `measureAlignment` / `expectPeerAlignment` compare only an explicitly declared group (rule ID, group id, peers by role and accessible name, edge, tolerance defaulting to the contract's 1 CSS px). They measure after `document.fonts.ready` and two consecutive frame-separated measurements agree, and report rule ID, element names, measured coordinates, delta and tolerance. A missing, ambiguous, hidden, null-box or zero-size peer is `UNKNOWN`, never `PASS`.
- `runActionAssertion` / `expectActionOutcome` require an explicit expected post-state. They capture the pre-state, activate the control through its role and name (no coordinates, no fixed sleeps), and wait with bounded Playwright auto-waiting for the expected post-state. They report `FAIL` when the pre-state already satisfies the expectation, when the expected post-state never appears (an inert control, or one that changes something unrelated), or when post equals pre; a missing, ambiguous or disabled control or target is `UNKNOWN`.

## Catalog interaction classification

Every catalog example that renders an enabled action control declares, in `catalog/components/*.mjs`, either

- `interaction: { kind: "live", actions: [{ role, name, expect, within? }] }`: each action has a native, observable outcome (`open` for disclosures, popovers and dialogs, `url` for valid in-page fragments, `checked` for native switches); or
- `interaction: { kind: "static", reasons: [...] }`: the example renders inert with a visible "Static specimen" label explaining why (`application-behavior`, `placeholder-navigation`, `form-handling`).

The documentation site runs no script (enforced by `tests/site-build.test.mjs`) and issue #156 requires Forma to stay zero-runtime, so only native behavior can be live. Wiring application behavior into the documentation site would need a deliberate change to that policy; it is not done here.

- `npm run catalog:check` fails when an example renders an enabled action without a declaration, or a live declaration does not cover every rendered action.
- `tests/site-browser/catalog-interactions.spec.mjs` runs **every** declared live action in order with `expectActionOutcome` (reset: fresh page per example, fragment cleared before each fragment link), also at 320px (`mobile.html`) and in every motion-weight copy, and compares the runtime action inventory with the declaration. It also proves that static specimens and undeclared examples expose no operable action.
- `docs/COMPONENT-INVENTORY.md` and `site-dist/site-manifest.json` report the classification.

## Layout primitives and geometry evidence

- `.ef-form-row` keeps peer field controls on one top edge regardless of label, description or validation length (subgrid). `tests/site-browser/catalog-alignment.spec.mjs` measures every declared group at 320/390/768/1280px and at 100% and 200% text.
- Single-line native controls (text-like, date/time, number, select) share one em-based intrinsic height.
- `tests/site-browser/forma-geometry.spec.mjs` holds regression fixtures for defects reported by consumers (HelixNote, Forma Studio, Summa, Signal).
- `tests/site-browser/site-conformance.spec.mjs` audits the documentation site and the Echelon marketing reference fixture: overflow and intact navigation labels at every contract width and 200% text, valid destinations for every enabled action, and fragment destinations clear of the sticky header.
- `tests/conformance/catalog-text-scale.spec.mjs` sweeps every catalog example at 320/390px and 100%/200% text.

Run everything with `npm run ui:conformance` (Chromium; text scaling uses the DevTools protocol).

## Pilot status and remaining work

Done in the pilot: catalog live/static classification and its check; outcome tests for every declared live action; declared alignment groups and the form-row primitive; shared field-height and consumer-reported geometry fixes; site and marketing-fixture audit; catalog-wide text-scale sweep; helpers published as `@echelon-foundry/forma-conformance`.

Remaining:

- Firefox and WebKit evidence for the conformance suites. They are Chromium-only because of text scaling.
- Promotion of `npm run ui:conformance` to a blocking CI job once its runtime and false-positive rate are reviewed. The site-browser specs already run in `npm run site:mobile`.
- A product decision on whether the documentation site may run demo scripts. Without that, application-behavior examples stay labelled static specimens.
- Compositions pages and icon pages are not yet classified example by example.

Report passes, fails, unknowns and accepted exceptions separately. Do not mark the catalog fully conformant until the remaining items are closed.
