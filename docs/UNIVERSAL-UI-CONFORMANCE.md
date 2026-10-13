# Universal UI Layout and Action Conformance Adoption

Status: implementation pilot (not yet a passed release gate)  
Authority: `kemiller2002/visual-engineering/framework/standards/UI-LAYOUT-INTERACTION.md` v0.1.0 proposal  
Crosswalk: `kemiller2002/application-visual-language/style-guide/ui-conformance.md`

Forma owns **intrinsic component layout**, semantic markup and the documentation presentation system. It does not own a consumer's domain operation: Limen/application code owns behaviors beyond native HTML. Do not introduce runtime behavior into the package to make a demo pass.

## Change requirements for agents

1. Declare sibling alignment intent before placing multi-column fields. Peer text inputs, selects and controls in the same form row have a shared top edge, unless the composition explicitly chooses another relationship. A label/help-text difference must not accidentally stagger the input controls.
2. Prefer a compositional Forma layout primitive over local corrective `margin-top`, offsets or CSS hacks. Record missing primitives as design-system requirements. Intrinsic control heights and internal icon geometry belong in Forma.
3. Test at 320, 390, 768 and 1280 CSS pixels; preserve visible names and avoid unintended page horizontal overflow. Include long labels, validation text, zoom and expanded/error states where relevant.
4. Classify each documentation example explicitly as **live demo** or **static specimen**. A live demo's enabled controls MUST perform a real native/local state change or a clearly indicated mock operation with observable result. Static specimens may illustrate markup/disabled states but must not claim an operation completed. Do not silently convert buttons into meaningless inert decoration.
5. Do not add inline `on*` handlers or `<script>` into canonical patterns/catalog HTML. Demo behavior must be owned by the documentation application/harness or a consumer application. Every added behavior must remain independently accessible, keyboard-operable and machine-operable.
6. For every live example with actions, specify input state, invocation, expected DOM/native result and reset/replay strategy. A click without observable outcome is not sufficient proof.
7. Keep each exception local, with rule ID, reason, owner and review trigger. Avoid global test skips.

## Existing risk requiring baseline audit

`patterns/button.html` and `catalog/components/button.mjs` contain action-style specimens (including Save changes, Cancel and # fragment links) that cannot be assumed functional by virtue of being native buttons. The documentation site must distinguish copyable *markup specimens* from live actionable examples and wire demonstrable behavior where marketed as live. Do not mark the full catalog passing until the 166 component pages / 717 example specimens reported in the current generated inventory have been classified and every *enabled live action* exercised.

Reference browser helpers: `tests/site-browser/ui-conformance-helpers.mjs`. These helpers only prove assertions in tests that invoke them; their presence does not establish site-wide coverage.

## Pilot acceptance path

- Inventory catalog example actions from generated metadata and rendered DOM.
- Define the live/static distinction in catalog metadata and site UI; ensure labels and copy/paste source remain truthful.
- Implement/document live interactions at the docs application boundary without adding Forma runtime dependencies; remove or reclassify misleading inert controls.
- Add alignment groups to current layout patterns as required, with evidence at narrow/wide viewports.
- Add Playwright tests that assert outcomes for every enabled live demo action; add geometry and overflow checks for declared groups.
- Run `npm run site:check`, `npm run test:machine`, `npm run release:check`, and the new action suite once created.
- Report passes, fails, unknowns and accepted exceptions separately; promote to a blocking gate only after a reliable baseline and false-positive review.

This document is a specification for adoption, not a claim that the above work is already done.
