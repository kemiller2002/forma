# @echelon-foundry/forma-conformance

Dev-only Playwright helpers for the canonical contract
`visual-engineering/UI-LAYOUT-INTERACTION@1.0.0` (rule IDs ULI-L01..L13 and
ULI-A01..A10). The package cites that contract. It does not restate or fork
the rules.

The package is a test dependency. Nothing in it ships in the zero-runtime
`@echelon-foundry/design-system` package, and no Forma stylesheet or pattern
imports it.

```sh
npm install --save-dev @echelon-foundry/forma-conformance @playwright/test
```

```js
import { expectActionOutcome, expectPeerAlignment } from "@echelon-foundry/forma-conformance";
```

## Principles

- **Declared, not guessed.** Every check names its rule ID, the peers or
  action it covers, and the observable result it expects.
- **Missing evidence is `UNKNOWN`, never `PASS`.** This covers a missing,
  ambiguous, hidden, inert, disabled or zero-size element, and a layout that
  never settles.
- **No coordinates and no fixed sleeps.** Actions resolve by role and
  accessible name. Waits use Playwright auto-waiting with a bounded timeout.
- **Pure decisions.** `evaluate.mjs` maps observations to reports without a
  browser. The adapters in `index.mjs` only observe and assert.

Each `measure*` / `run*` function returns a report. The `expect*` wrappers
assert `status === "PASS"` and put the report in the failure message.

```ts
type Report = {
  ruleId: string;                        // e.g. "ULI-L01", "ULI-A02"
  status: "PASS" | "FAIL" | "UNKNOWN";
  reason: string;
  // alignment: group, edge, toleranceCssPx, deltaCssPx, measurements[]
  // actions:   action, outcome, expected, pre, post
};
```

The contract also defines `NOT_APPLICABLE` and `EXCEPTION`. They are owned
decisions that the calling test records. The helpers never produce them.

## Targets

A target is `{ role, name, scope? }`:

- `name`: a string matches the exact accessible name; a `RegExp` matches by
  pattern.
- `scope`: a Locator that narrows the lookup when the same name legitimately
  appears in several regions (for example, a header link and a footer link
  both named "Features"). Contracts and groups also accept a default `scope`.
- `role: "disclosure"`: addresses a native `<summary>` by its text. Playwright
  gives `<summary>` no implicit role, so `getByRole` cannot reach it.
- `role: "text"`: addresses an element by its exact visible text (Playwright
  `getByText`). Use it only for a peer that has no role, such as a status
  lozenge beside a heading.

Every function takes a `root` that is a `Page` or a `Locator`.

## Alignment (ULI-L01, L02, L10)

```js
await expectPeerAlignment(page, {
  ruleId: "ULI-L01",
  id: "name-row",
  edge: "top",            // top | bottom | center | left | right
  toleranceCssPx: 1,      // contract default
  peers: [{ role: "textbox", name: "First name" }, { role: "textbox", name: "Last name" }]
});
```

Measurement starts after `document.fonts.ready`. A result is taken only when
two consecutive frame-separated measurements agree.

Groups can also be declared in markup with the attribute vocabulary Forma
Studio exports:

- `data-uli-align-group="id"`;
- `data-uli-align-edge="top|bottom|center|left|right"`;
- `data-uli-align-peer="name"`, which is optional.

`measureDeclaredGroups(root)` and `expectDeclaredGroups(root)` measure every
declared group. The declaring elements are the peers; nothing is inferred.

## Actions (ULI-A01, A02, A05, A06)

```js
await expectActionOutcome(page, {
  ruleId: "ULI-A02",
  action: { role: "button", name: "Save" },
  outcome: { kind: "text", target: { role: "status", name: "Save status" }, expected: "Saved" },
  timeoutMs: 5000
});
```

| Outcome kind | Observes | `expected` |
| --- | --- | --- |
| `text` | normalized text of `target` (exact, or `RegExp`) | string or RegExp |
| `value` | current value of an input, select or textarea `target` | string or RegExp |
| `visible` | whether `target` is visible | boolean |
| `checked` | checked state of `target` | boolean |
| `attribute` | `target`'s `attribute` value | string or RegExp |
| `open` | native open state (`details[open]`, `dialog[open]`, `:popover-open`) | boolean |
| `url` | the page URL | string or RegExp |

The `open` outcome also accepts `target: "controlled"`. This means the element
the action names in markup: `popovertarget`, `commandfor`, `aria-controls`,
the `<details>` of a `<summary>`, or the `<dialog>` of a `method="dialog"`
form.

An action reports **FAIL** in three cases:

- the pre-state already satisfies the expectation;
- the expected post-state never appears, for example because the control is
  inert or changes something unrelated;
- the post-state equals the pre-state.

Activation follows the user's real path. A control that a pointer can hit
(itself or its own `<label>`) is clicked, with no programmatic focus first,
because focus can have effects of its own: interest invokers open on focus.
A control that a pointer cannot hit, but that moves into view when it gets
focus (a skip link), is activated from the keyboard: Enter for links, Space
otherwise. A control covered by something else is still clicked, so the
interception is reported.

It reports **UNKNOWN** when the control or target is missing, ambiguous,
hidden, disabled, `aria-disabled` or inert. Playwright role queries ignore
`inert`, so the helper checks it explicitly.

`inventoryActions(root)` lists enabled, rendered, non-inert action controls
with the role and name Playwright resolves for them. Pass
`{ includeHidden: true }` to also list controls in closed dialogs and
popovers. The inventory is a list of what needs a contract. It is not a no-op
detector.

## Overflow, labels, text scale and focus (ULI-L05, L06, L09, A08)

- `measureOverflow(page)` / `expectNoOverflow(page)`: page-level horizontal
  overflow, plus text clipped by an `overflow: hidden | clip` container.
  Content inside a scroll container (`auto | scroll`) is reachable. It is the
  contract's permitted contained scroller, so it is not reported.
- `measureLabelIntegrity(locator)` / `expectLabelIntact(locator)`: the label's
  content fits its box and the box is on screen. An inline label has no
  measurable box and reports `UNKNOWN`; measure its block container instead.
- `scaleDefaultText(page, factor)`: changes the browser default font size, as
  a user setting does. Chromium only, through CDP. It fails when the root font
  size is fixed in px.
- `expectDestinationClearOfHeader(page, destination, header)`: an in-page
  destination is in view and not under a sticky header.
- `recordTabSequence(page, maxSteps)` and `wasFocusedDuringSequence(locator)`:
  check keyboard reachability.
- `CONTRACT_WIDTHS`: `[320, 390, 768, 1280]`.

## Rounded-corner containment (ULI-L05, boundary.corner)

- `measureCornerContainment(locator)` / `expectTextInsideCorners(locator)`:
  every rendered text line in the element lies inside its visible curved
  boundary (the inner border edge, with CSS radius normalisation, so
  `999px` is a stadium and `50%` an ellipse). Text can sit inside a box's
  rectangle and still cross a rounded corner; this catches that. A box with
  no text reports `UNKNOWN`. Tolerance 0.5px.
- `evaluateCornerContainment(observation)` and
  `resolveCornerRadius(value, width, height)` are the pure core, ported from
  Forma's internal layout probe (LCE-001).

## Compatibility

Version 0.1.0 keeps every export of the first helper release, which shipped
as `tests/site-browser/ui-conformance-helpers.mjs` in Forma, with the same
signatures:

- `STATUS`, `edgeCoordinate`, `classifyPeerObservation`,
  `validateAlignmentGroup`, `evaluateAlignment`, `formatReport`,
  `matchesExpected`;
- `validateActionContract`, `evaluateActionPremise`, `evaluateActionOutcome`;
- `settleFontsAndFrames`, `measureAlignment`, `expectPeerAlignment`;
- `runActionAssertion`, `expectActionOutcome`, `inventoryVisibleActions`.

Local copies in consumer repositories can be replaced by this package without
changing their specs.
