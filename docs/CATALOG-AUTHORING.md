# Authoring the Forma component catalog

The documentation site at `site-dist/` is generated. Nothing under
`site-dist/` is edited by hand. Every component page, category page, the
alphabetical index, navigation, the home-page counts and the machine-readable
`site-manifest.json` are projections of four sources:

| Source | Owns |
| --- | --- |
| `patterns/<slug>.html` | The canonical, smallest correct markup. Rendered as the **Basic** example and published in the package. |
| `catalog/components/<slug>.mjs` | Explanation, scenario examples, mobile example, native-attribute API, states, accessibility, responsive behavior, motion, guidance and related components. |
| `dist/all.css` (built from `src/styles`, `src/marketing`) | The CSS hook surface. Elements, modifiers, attribute hooks and `--ef-<root>-*` custom properties are **derived** from it by `tools/catalog/css-hooks.mjs`. They are not typed by hand. |
| `catalog/categories.json` | The component families, their order and summaries. |

Composed, multi-component showcases live in `catalog/compositions/<slug>.mjs`.

## Language and terminology

All user-facing Forma documentation, site navigation, headings, labels, examples,
accessible descriptions, and agent-generated help use **American English**.
Write **color**, **behavior**, **center**, **labeled**, **gray**, **neighbor**
and **customize**. Review new or edited catalog entries for these spellings
before generating the site.

Existing machine-consumed identifiers are separate compatibility contracts.
Do not silently rename a published file path, CSS selector, HTML id, serialized
field, icon name, test fixture, or stable agent selector merely to change its
spelling. For example, the previous icon reference uses `#colour`,
`data-colour-context` and `custom-colour.txt`; keep those functioning
until a separately designed versioned migration, but label them **Color**.

## Adding a new public component

1. Implement the CSS in `src/styles` (or `src/marketing`) and add
   `patterns/<slug>.html` with the minimal canonical markup, following
   `docs/AGENT-USAGE.md` and `requirements/COMPONENT-CATALOG.md`.
2. Add the Figma contract entry in `figma/component-contracts.json`.
3. Create `catalog/components/<slug>.mjs` (copy `catalog/components/switch.mjs`,
   the reference entry).
4. Run `npm run catalog:check`. It fails until every rule below is met.
5. Run `npm run site:check` and look at the generated page at 320px, 390px and
   desktop width.

CI fails when a pattern has no catalog entry, when a public `.ef-*` block
class is not owned by any entry, or when any entry falls short of the rules.

## Entry shape

```js
export default {
  name: "Switch",                    // friendly name
  category: "forms",                 // an id from catalog/categories.json
  behavior: "Native HTML",           // who owns behavior (Native HTML, Application / Limen, …)
  summary: "One sentence used on cards and in the index.",
  owns: ["ef-switch"],               // optional; defaults to ["ef-<slug>"] when that class exists
  purpose: { description, useWhen: [], avoidWhen: [], characteristics: [] },
  examples: [ { id, title, description, html }, …, { id, title, description, html, mobile: { notes: [], height } } ],
  api: { attributes: [], hooks: {}, keyboard: [], events: [], form: "" },
  states: [ { name, how, description } ],
  accessibility: { forma: [], consumer: [] },
  responsive: [],
  motion: [],
  guidance: { do: [], avoid: [] },
  related: [ { slug, note } ]
};
```

The slug is the file name. The public tag is always `<ef-<slug>>`.

### Prose

Prose strings are plain text. Two inline forms are supported:

- `` `code` `` renders as code;
- `[[slug]]` renders as a link to that component's page and must resolve.

Write for someone choosing and using the component. Explain intent and
consequences; skip filler and restating the name.

### Examples

- The Basic example is `patterns/<slug>.html`. Do not repeat it.
- Provide **at least two scenario examples** and **at least one mobile example**
  (`mobile: { notes: [...] }`). Scenario titles name a realistic situation
  ("Validation error", "Compact toolbar", "Long labels"), never "Example 2".
- Each example demonstrates a real difference: state, configuration, density,
  content stress, disabled/error/loading, composition.
- Every example's `html` is wrapped in the inert public tag
  `<ef-<slug> class="ef-component-tag"> … </ef-<slug>>`.
- The same string is rendered live and shown as copyable source, so it must be
  complete, valid, copy-pasteable markup. No `<script>`, no `on*=` handlers, no
  `javascript:` URLs.
- Every `ef-*` class must exist in Forma CSS and every `<ef-*>` tag must be a
  catalog component; the checker rejects anything else.
- IDs and radio `name` values must be unique across the whole page (the Basic
  pattern, every example, and the generated specimens). Prefix them with the
  example id.
- Mobile examples render inside a real narrow-viewport iframe (320/390/430px or
  tablet width, chosen by the reader). `mobile.notes` explains what changes at
  narrow widths: wrapping, overflow, target sizes, touch behavior,
  orientation. `mobile.height` (px) sets the frame height.

### API

- `api.hooks` describes CSS hooks. The checker requires a description for every
  modifier class, attribute hook and `--ef-<root>-*` custom property that the
  CSS defines for the component's owned roots, and rejects descriptions of hooks
  that do not exist. Element classes (`ef-x__y`) may be described too.
- `api.attributes` lists native and ARIA attributes the author writes
  (`type`, `role`, `open`, `popovertarget`, `aria-describedby`, …). Each must
  appear in the pattern or an example.
- `api.keyboard`, `api.events` and `api.form` document native behavior. Do not
  invent JavaScript events or methods: Forma has none.

### States, accessibility, responsive, motion

- `states`: only states that apply, with how each is expressed (native attribute,
  pseudo-class, `data-ef-*`).
- `accessibility.forma`: what Forma's markup and CSS guarantee.
  `accessibility.consumer`: what the application must still supply.
- `responsive`: intrinsic sizing, wrapping, overflow, breakpoints/container
  behavior, long content, touch.
- `motion`: what moves and why, perceived weight, interruption and
  reduced-motion behavior. When nothing animates, say so explicitly.

### Related

At least one related component, each with a note explaining the distinction
so readers do not pick the wrong one.

## Commands

```bash
npm run build                 # builds dist/all.css (required by the checker)
npm run catalog:check         # whole-catalog coverage and integrity
node tools/catalog/validate.mjs switch select   # check specific entries
npm run site:check            # build site, structural tests, mobile/a11y browser tests
```
