# Forma design contract 1.0

Forma's design contract is an optional build-time guardrail for producing the same semantic HTML documented in the component catalog. It does not add a browser runtime and it does not replace ordinary HTML/CSS authoring.

## Validate and render

```sh
npm run design:validate
node tools/design-contract/cli.mjs validate examples/design/valid/customer-form.forma-design.json
node tools/design-contract/cli.mjs render examples/design/valid/customer-form.forma-design.json
```

`validate` exits nonzero and prints stable diagnostic codes and JSON paths when a document is invalid. `render` validates first and emits no HTML on failure. The published JSON Schema supplies structural validation; the CLI adds contextual rules such as parent-child legality, ID references, standard-mode alignment, action binding, and feedback targets.

## Modes

- `standard`: documented semantics only. Grid fields align, overflow wraps, actions bind to native submit/reset, and raw overrides are refused.
- `extended`: the same invariants plus namespaced extension data such as `acme:chart`.
- `custom`: requires `customReason` and non-empty `validationEvidence`; it is auditable, not an accessibility bypass.

## Supported form structure

```text
form
├── layout (stack | grid)
│   └── field (native control)
├── actions
│   └── action (form.submit | form.reset)
└── feedback
```

The reference customer form uses a responsive grid with two peer fields, native email validation, Save and Reset commands, and URL-targeted save feedback. At narrow container widths the grid becomes a stack without changing DOM, reading, focus, or submission order.

## Unsupported examples

The fixtures under `examples/design/invalid/` are executable documentation:

- `misaligned-standard-fields`: turns off peer alignment in standard mode;
- `unsupported-standard-override`: injects raw presentation overrides;
- `missing-action-binding`: supplies an action with no supported command;
- `invalid-parent-child`: places an action inside a field layout;
- `unsupported-version`: asks 1.0 tooling to guess a different contract.

Each fails before rendering and identifies the exact correction. Unsupported contract versions must be migrated explicitly. Hand-authored Forma patterns remain compatible and do not have to adopt the contract.

## Application boundary

Forma can bind native submit and reset. Persistence, network requests, computed values, conditional application state, asynchronous feedback, authorization, and domain legality belong to Limen or the consuming application. Extended/custom contracts may preserve namespaced intent, but a renderer must report unavailable capabilities rather than emit a decorative no-op control.
