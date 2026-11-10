# Changelog

Forma follows semantic versioning for its public HTML, class, and token
contracts (`requirements/QUALITY-AND-DISTRIBUTION.md`, QD-004). Releases are
published as GitHub release tarballs
(`https://github.com/kemiller2002/forma/releases/download/vX.Y.Z/echelon-foundry-design-system-X.Y.Z.tgz`)
and to npm. Earlier releases are described in `docs/CONSUMING-FORMA.md` and
`HANDOFF.md`.

## 1.0.2

Patch release: re-review fixes to the namespace codemod (`tools/NamespaceMigrator`) in 1.0.1 (WI-0049, source `.praxis/inbox/documents/2026-11-09-FORMA-1.0.2-CODEMOD.md`), and the independent reviews of this patch (WI-0050 to WI-0055, `.praxis/inbox/documents/2026-11-09-FORMA-1.0.2-REVIEW-01.md` to `-REVIEW-04.md` and `2026-11-10-FORMA-1.0.2-REVIEW-05.md`). No class, token, element, attribute or CSS output changed (QD-004 patch). Forma's own tree needed no change.

### Fixed
- **Regression from 1.0.0:** a `>` inside a JSX expression or a quoted attribute value no longer ends the tag, so `src`/`href` after `onClick={() => go()}` or `onLoad={() => x > 1}` stay locations. Tags are scanned with balanced `{...}` and quoted strings skipped; a JSX `href={"..."}` value is a location as a whole. A tag's scan ends at its `>` or at the next bare `<` outside quotes and braces; it does not stop at `(`, `)`, `;` or `&` (a review draft did, and lost the `href` after `title=a&amp;b`, `onclick=go()`, Angular `(click)="go()"`, `style=color:red;` and Razor `@(Model.Y)`; these are tests now). Every URL value found before the scan ends is kept, so a long `data-payload` value (5,000 characters), a JSX prop over 16 KiB that contains `(`, 400 attributes before `href`, or a bare `<` after `href` (`title=a<b`) no longer lets an `href`/`src` be rewritten (an earlier draft's 4,096-character limit discarded them).
- **`{...}` expressions are lexed as script.** Where each `{...}` group ends comes from one pass over the file that skips strings (an unclosed one ends at its line), template literals, `//` and `/* */` comments, regular-expression literals (valid ones only: balanced parentheses and real flags) and, in JS, JSX and TSX, the text of JSX elements. A quote in `content={<span>Don't</span>}`, `render={() => <p>It's here</p>}`, `/* don't */`, `// don't`, `/'/g`, `/"/g` or `/[{]/` no longer hides the closing brace (a review draft treated every quote inside braces as a string and rewrote the `href` after it). The pass also records where it had to guess: an unclosed string, an unclosed or over-long regular expression, or a `/` that reads both as division and as a regular expression holding a brace or quote (`if (ok) /{/.test(s)`). A tag whose `{` never closes, whose `{...}` group spans a guess, or that is longer than 1 MiB is listed as `review: FILE:LINE a tag here could not be read with certainty`, its URL attribute values in the next 4 KiB are left unrewritten, and `--check` exits 3 (the summary adds `N uncertain tag(s) to review`; the first 20 per file are listed). A group that closes on the last character of the file is closed (a review draft reported it). The lexer is not a parser: a misreading it does not notice could still go unreported; `docs/CONSUMING-FORMA.md` says so.
- **Tags in script are found from the lexer's own state.** In JS, TS and F# files every `<name` inside a JSX element or its children, a string, a template literal, a regular expression or a comment is a tag, whatever text comes before it: JSX text after `:`, `(`, `)`, `—`, `&amp;`, `/`, `*` or `$5.`, JSX text of any length, `el.innerHTML = 'Click <a href=...>'`, i18n strings, F# strings (also triple-quoted) and multi-line Lit `html` templates keep their `href` (a review draft's prose heuristic rewrote them). A `<name` in script code after an operand is a comparison or a type argument, so `if (a <b && c) data = "ef-card";`, `while (i <n ) {...} src = "ef-sprite"`, `for (...; i <len ; ...)` and F# `let ok = a <b && c` migrate the names after them. When such a `<name` is followed through attribute syntax by a URL attribute (`n <a href="ef-x">`), the tool cannot tell: the value is left unrewritten and listed as `review: FILE:LINE a <name here may be a tag`, and `--check` exits 3. HTML, Razor, Vue, Svelte, Markdown, CSS and JSON read every `<name` as a tag.
- **Linear on adversarial input.** One pass builds the brace table; a `{` the lexer skipped (inside a string) falls back to a second linear table; a regular-expression literal is looked for up to 512 characters, and once a line is known to hold no closing `/` it is not scanned again; a Razor `@(...)` value ends at its line; ambiguous strings are found by an atomic match checked in code; a URL attribute selector value is read up to 512 characters; the class-selector look-behind reads at most 8 classes back and the host look-ahead at most 8 labels; masking for uncertain tags uses one cursor. Measured locally with `--check`: an unclosed `"` before `.ef-a` x20,000 in 0.9 s (52.9 s in review), `<a href="@(x` x100,000 lines in 0.7 s (55.7 s), `{"` then `<b {` x200,000 lines in 1.1 s (over 60 s), `[href=` x100,000 on one line in 0.7 s (59.1 s), `{` then `x=/[` x100,000 in HTML in 0.9 s (22.9 s), and `if (a <b && c) { x.src = s; }` x200,000 lines in 1.0 s; each is a timing test (under 2 s). Time grows linearly with the input; dense input is slower per byte (200,000 JSX lines, 11.8 MB: about 7 s; 10,000 lines of 50 chained `.ef-a` classes, 2.5 MB: about 5 s). Review lines are written through one buffered writer.
- URL-valued attributes are found in any letter case (`<A HREF>`, `<IMG SRC>`, React `srcSet`, `formAction`, `xlinkHref`) and as Vue and Angular bindings (`:src`, `v-bind:href`, `[href]`).
- A backslash escapes only inside JSX expressions and script strings, not in an HTML attribute value (`title="C:\"` ends at its quote).
- **Regression from 1.0.0:** dotfile names and dot-directories in a path are paths, not class selectors: `"/.ef-rc.json"`, `"assets/.ef-cache/x"`, `"src/.ef-rc"` are left alone. A CSS selector such as `.ef-icon.svg` and a compound class string such as `".ef-card.ef-x"` are still migrated.
- A URL-valued attribute selector keeps its value: `querySelector('img[src=ef-a.png]')`, `a[href^=ef-b]`, a value quoted in the other quote style (`querySelector("a[href='ef-c'] .ef-s")`), one after an escaped quote (`"a[title=\"x\"][href='ef-c']"`) and any letter case (`a[HREF="ef-up"]`) are left, while the classes around them migrate. This holds outside selector arguments too: a selector in a variable (`const sel = 'a[href="ef-var"]'`) and CSS (`a[href^="ef-"]`, which 1.0.1 rewrote).
- **Trade-off, ambiguous strings:** a whole quoted string that reads both as a selector and as a file name (`".ef-config.json"`, `".ef-icon.svg"`, `".ef-button.md"`, `"div.ef-card.md"`) cannot be decided from text. As the argument of `querySelector`, `querySelectorAll`, `closest`, `matches` or `webkitMatchesSelector` it is a selector and is migrated. Anywhere else it is left unrewritten and listed as `review: FILE:LINE "..." is either a class selector or a file name`, and `--check` exits 3 until you rewrite it by hand or exclude the file. 1.0.1 migrated these strings; 1.0.2's first draft silently skipped them. The extensions `rc`, `ini` and `lock` from that draft were dropped, so `".ef-map.lock"` is a class string again. A string whose prefix is a plain word that is not an HTML or SVG element name (`"logo.ef-x.png"`) is a file name: left unrewritten and not reported. A prefix that may name an element stays ambiguous and is reported: an HTML element (`"div.ef-card.md"`, `"link.ef-x.css"`; `link`, `script`, `style`, `slot`, `area`, `br`, `head`, `title`, `kbd`, `var`, `del`, `ins` and `colgroup` were added), an SVG element (`"path.ef-icon.svg"`, `"use.ef-glyph.svg"`, `g`, `symbol`, `circle`, `rect` and the rest), a name with a hyphen (a custom element, `"my-widget.ef-x.md"`) or a Forma name (`"ef-tabs.ef-active.md"`). SVG filter and animation elements (`feGaussianBlur` and the other `fe*`, `animate`, `animateMotion`, `animateTransform`, `set`, `mpath`, `metadata`) and HTML `datalist`, `hgroup`, `rp` and `rt` were added in re-review.
- `--check` and `--dry-run` report from the same whole-file rewrite as write mode, so a tag that spans lines is no longer over-reported. Masked spans are merged and searched by bisection, and report lines are mapped by bisection, so reporting is n log n (200,000 changed lines: about 3 s).
- Markdown reference definitions (`[d]: /ef-doc`, `[e]: ef-doc`) are locations in Markdown files.
- A Razor expression in an attribute value (`href="@Url.Action("ef-index")"`) is read whole, so its inner quotes no longer end the value.
- `docs/COMPONENT-INVENTORY.md` no longer lists the codemod and guard tests as dedicated component tests (their fixture strings are not component coverage).

### Tests
- `tests/namespace-migrator-lexing.test.mjs` (11 tests, from the re-review probes): the 40 tag positions of probe b7 (JSX, JSX text, strings, F# strings, template literals, comments) and the 24 lexer cases of b8, with the regex-after-`)` case listed for review and plain handlers not; a `<name` in script code with a URL attribute reviewed and left; a group closing on the last character; long lines of `[href=` and unclosed `/[` (under 2 s); and earlier: quotes in comments, regular expressions, template literals and JSX text inside braces (32 cases); unclosed braces listed for review; `<` after an operand in script (10 cases) and tags where JSX and markup can stand (10 cases); attribute names in any case, framework bindings and attribute selectors anywhere; the added SVG and HTML element prefixes; and five adversarial timing tests (under 2 s each). Every case is also run twice for idempotence.
- `tests/namespace-migrator.test.mjs` (35 tests; the unbalanced-brace timing test now also requires the 2,000 unclosed tags to be listed and `--check` to exit 3): every case above with fixtures (`jsx-tags.tsx`, `Razor.cshtml`, `references.md`), the restored 1.0.1 case `querySelector(".ef-icon.svg")` (migrated), ambiguous strings (left and listed, `--check` exits 3), HTML attribute backslashes, a stray `<` in script, a 20,000-line performance test (under 2 s), unbalanced braces after a stray `<` (under 2 s), every early-stop location case above, the `&`/`(`/`)`/`;`/Angular/Razor attribute cases, a JSX prop over 16 KiB containing `(`, selector attribute values with nested quotes, element-like prefixes (HTML, SVG, custom, Forma), word-prefixed file names, all 1.0.0 and 1.0.1 location and name cases, and idempotence.

## 1.0.1

Patch release: the namespace codemod (`tools/NamespaceMigrator`) left some Forma names unrewritten while `--check` reported a clean tree (WI-0048, source `.praxis/inbox/documents/2026-11-09-FORMA-1.0.1-CODEMOD.md`). No class, token, element, attribute or CSS output changed (QD-004 patch). Re-run the codemod with `--check` if you migrated with 1.0.0; Forma's own tree needed no change.

### Fixed
- A script variable or property named like a URL attribute is not a location: `const data = "ef-card"`, `const src = 'ef-button'` and `x.background = "ef-hero"` are migrated. URL-valued attributes are skipped only inside an HTML, Razor, Vue or JSX tag.
- Markdown link targets are skipped only in Markdown files and only as `[text](target)`; a call such as `handlers[0]("ef-x")` is migrated.
- `.ef-x` is always a class selector, even with a file- or host-like suffix: `.ef-shell.app`, `.ef-tabs.test`, `.ef-icon.svg`, `.ef-card.md`, `.ef-card.map` and compound `.ef-shell.ef-tabs.test` are migrated (`www.ef-cdn.example.org` and `ef-page.html` remain locations).
- Typed dataset destructuring (`const { efTone }: DOMStringMap = el.dataset`, `Record<string, string>`) is migrated, keeping the local name.
- A supported file that is not UTF-8 (for example a Latin-1 `.css`) is no longer skipped silently: it is never rewritten, and when it holds Forma names it is listed as `review: ... (not UTF-8)` and `--check` exits 3.

### Tests
- `tests/namespace-migrator.test.mjs` (16 tests): every case above, the 1.0.0 location cases (URLs, hosts, scoped packages, `url()`, `@import`, tag `src`/`href`, Markdown links), idempotence, and new fixtures (`false-negatives.ts`, `selectors.css`, `tag-attributes.html`, `links.md`, `latin1.css`).

## 1.0.0

Major release: Forma is brand-neutral (BNR-001, owner decision EDS-ADR-002) and its `ef-` namespace is renamed to `forma-` (FORMA-NS-001, owner decision 2026-11-09 "Do the major break"). Both breaks ship together so applications migrate once: run the codemod, then (Echelon applications) add `@echelon-foundry/echelon-theme`. The migration guide is "Migrating to Forma 1.0.0" in `docs/CONSUMING-FORMA.md`. Work item WI-0046; sources `.praxis/inbox/documents/2026-11-09-BNR-001-brand-neutral-forma.md` and `2026-11-09-FORMA-NS-001-namespace-rename.md`.

### Breaking: namespace (FORMA-NS-001)
- Every class `.ef-*` is now `.forma-*` (for example `.ef-button` -> `.forma-button`, `.ef-card__title` -> `.forma-card__title`, `.ef-site` -> `.forma-site`).
- Every custom property `--ef-*` is now `--forma-*`: semantic tokens (`--ef-color-*` -> `--forma-color-*`), primitives (`--ef-primitive-*` -> `--forma-primitive-*`), marketing roles (`--ef-type-*`, `--ef-layout-*`, `--ef-space-*`, `--ef-shape-*`, `--ef-effect-*`, `--ef-focus-*`) and every component input (`--ef-stack-gap`, `--ef-icon-size`, `--ef-startup-slow-after`, `--ef-site-backdrop`, `--ef-diagram-*`, `--ef-workflow-palette-*`, ...).
- Every attribute `data-ef-*` is now `data-forma-*`, including `data-ef-theme` -> `data-forma-theme`, `data-ef-brand` -> `data-forma-brand`, `data-ef-skin` -> `data-forma-skin`, `data-ef-variant`, `data-ef-tone`, `data-ef-layout`, `data-ef-state`, `data-ef-size`, `data-ef-scheme`, `data-ef-extent`, `data-ef-columns` and the character-grid `data-ef-row`/`-col`/`-len`. In script, `element.dataset.efX` is `element.dataset.formaX`.
- Authoring tags `<ef-*>` are now `<forma-*>`, and the marker class `ef-component-tag` is `forma-component-tag`.
- `BrandCompiler` emits `[data-forma-brand="<id>"]`, `[data-forma-theme=...]` and `--forma-*`; `TokenCompiler` emits `:root, [data-forma-theme="light"]`, `[data-forma-theme="<theme>"]` and `--forma-*`.
- `TokenValidator` treats `--forma-*` as the Forma namespace and reports `--ef-*` (and `--forma_`, `--forma--`, `--FORMA-`) as a `namespace` finding with a "Did you mean" suggestion and the codemod hint.
- `Forma.Workflow` (F# emitters, validator messages, static renderer, editor and embed) emits `forma-` classes, `data-forma-*` attributes and `--forma-*` properties; `contracts/diagram-presentation.json`, `contracts/color-contract.json`, the catalog, patterns, site, Figma mapping and docs use the new names. `@echelon-foundry/forma-workflow` is 2.0.0 (its editor classes are `.forma-workflow-editor*`; peer `@echelon-foundry/design-system >=1.0.0`).
- The brand-manifest schema 1.0 data fields are unchanged.

### Breaking: brand neutrality (BNR-001, EDS-ADR-002)
- Removed `brands/echelon.brand.json` and its build output `dist/brands/echelon.css` (export `./brands/echelon.css`). Echelon's brand, marketing theme and logo assets are now `@echelon-foundry/echelon-theme` (`kemiller2002/echelon-design-system`).
- Removed `themes/echelon/` (Echelon marketing theme), `bundles/echelon-marketing.bundle.json` and the release assets `dist/marketing/forma-echelon-marketing.css` and `dist/marketing/forma-marketing-theme-echelon.css`. The marketing bundle is now `bundles/forma-marketing.bundle.json` (`forma-marketing.css`, `forma-all.css`); a site loads its organization's theme after `forma-marketing.css`. The `marketing:theme` script is gone.
- Removed `examples/echelon-marketing-site`; the marketing reference is `examples/marketing-site`, a fictional organization on the neutral layer.
- The token source moved from `tokens/echelon.tokens.json` to `tokens/forma.tokens.json` (the `./tokens.json` export follows). `TokenValidator --forma DIR` now expects `tokens/forma.tokens.json`.
- New default `:root` palette, light: text `#161616` (heading `#161616`, secondary `#555555`, on-secondary-surface `#303030`, inverse `#fafafa`); surface `#fafafa` / secondary `#eeeeee` / inverse `#232323` / inverse-secondary `#303030`; accent `#2b5ea8` / secondary `#1d6b66`; status success `#1f6b3d`, warning `#8a5200`, danger `#b0302a`, info `#235f97`; border subtle `#d8d8d8` / functional `#555555`; focus ring `#161616` / gap `#fafafa`; control track `#767676`, thumb `#fafafa`, active `#2b5ea8`. Dark: text `#eeeeee` (secondary `#d8d8d8`, inverse `#161616`); surface `#161616` / secondary `#232323` / inverse `#eeeeee` / inverse-secondary `#d8d8d8`; accent `#93b6ec` / secondary `#73c2ba`; status `#82cf9c`, `#e6b85e`, `#f5a097`, `#95bdea`; border `#303030` / `#d8d8d8`; focus `#eeeeee` / `#161616`; control track `#767676`, thumb `#eeeeee`, active `#93b6ec`.
- Removed the Echelon-named primitives `foundry-charcoal`, `forged-iron`, `parchment`, `parchment-light`, `oxide-bronze`, `oxide-bronze-light`, `oxide-bronze-deep`, `oxide-bronze-pale`, `verdigris`, `verdigris-light`, `carbon`, `graphite` and `stone` (`--ef-primitive-color-*`). Added `neutral-50`, `neutral-500`, `neutral-900`, `blue-300`, `blue-600`, `teal-300` and `teal-700`. The `status-*` primitives have new values, so every theme's status colors change. Theme accents that used oxide bronze now use `split-rust` (paper-ink), `comp-rust` (warm-earth) and `navy` (neutral-editorial); `dark-restrained` and `dark-technical` use the neutral grays and `teal-300`. `--forma-primitive-shadow-raised` is tinted `rgb(22 22 22 / 0.08)`.
- All 483 Echelon-palette `var()` fallbacks in `foundations.css`, `components.css` and `assessment.css` (plus the workflow editor CSS) now fall back to the neutral light values; the modal scrim is `rgb(22 22 22 / ...)`.
- Cascade layers `@layer echelon.*` are `@layer forma.*`: `forma.tokens`, `forma.foundations`, `forma.components`, `forma.assessment`, `forma.marketing.foundations`, `forma.marketing.components`, `forma.marketing.layouts`, `forma.brand` and `forma.workflow-editor`. Code that orders or targets these layers must use the new names.
- `example-harbor` has new status colors; `Forma.Workflow` judges diagram colors against the default surfaces `#fafafa` (light) and `#161616` (dark).
- The `character-grid-reveal` pattern's sample banner reads `EXAMPLE SYSTEMS`.
- Default font stacks are neutral system stacks: `--forma-primitive-font-family-sans` is `system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`, `-display` is `ui-serif, Georgia, Cambria, "Times New Roman", serif` and `-mono` is `ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`. Newsreader, Manrope and IBM Plex Mono were Echelon's typefaces; an organization sets its families in its brand manifest (`presentation.fontFamily`), and the Echelon theme does. Forma ships and loads no web font.
- The switch thumb (`control.thumb`) is dark in the dark themes (`dark`, the operating-system dark default, `dark-restrained`, `dark-technical`) and in both example brands' dark maps, so it reaches 3:1 against the checked track (WCAG 1.4.11; it was 1.78:1 in dark).
- The runtime registry's console messages are neutral (`Runtime registry · Forma v1.0.0`, `Runtime registry conflict: ...`). The ECHELON-RUNTIME-1 identifiers (`window.__ECHELON_RUNTIME__`, `__ECHELON_REGISTER_RUNTIME__`, `registerEchelonRuntime`) are unchanged.

### Added
- `tools/NamespaceMigrator` (F#, no package references, shipped in the package): `--check`, `--dry-run` and write modes over HTML, CSS/SCSS/Sass/Less, JS/TS/JSX/TSX, Vue, Svelte, Razor, F#, JSON and Markdown. It rewrites Forma names only (classes, element names, class strings, `--ef-*`, `data-ef-*`, `dataset.efX`, `dataset["efX"]` and dataset destructuring, keeping the local name), never words (`ref-`, `chef-`, `--ref-`) or locations (URLs, host names, paths, file names, `url()`, `@import`, `src`/`href` values, module specifiers, `@scope/` packages). It preserves the UTF-8 byte-order mark and line endings, skips vendored copies and build output by default (`--include-vendored`), and `--check` exits 3 both when a file would change and when a text file of another kind still contains Forma names (listed for review). `npm run namespace:check` runs it over Forma.
- `tools/BrandCompiler` and `tools/TokenCompiler` sources and project files ship in the package; an external manifest compiled with the packed compiler is byte-identical to Forma's own build.
- A second unrelated example brand, `example-orchard`.
- `tools/brand-neutrality.mjs`, an absolute guard (it replaces the AIS-001.4 ratchet and its baseline): zero organization identity, zero former Echelon-palette literals (hex of any length or `rgb()`) and zero `@layer echelon` in source CSS, `dist/` and the npm tarball. Publisher metadata (the `@echelon-foundry` npm scope, the `echelonfoundry.com` domain, the `EchelonFoundry.Forma.*` .NET namespace, the README licensor line) and the cross-library `ECHELON-RUNTIME-1` registry code identifiers in `dist/runtime.js` (not its console text) are the only allowed mentions. Echelon's typeface names count as identity. The release workflow runs it on the packed archive.
- `tools/namespace-guard.mjs`: zero `ef-` namespace tokens in source CSS, `dist/` and the tarball.
- `release-forma.yml` no longer publishes to npm; `publish.yml` is the only npm publisher (it publishes a version once, after checking npm), so a release cannot race two publishes.

### Tests
- `tests/brand-neutrality.test.mjs` (13 tests, adversarial fixtures including a reappearing Echelon brand manifest, renamed brand CSS with Echelon colors and a planted tarball), `tests/external-brand-compiler.test.mjs` (4), `tests/namespace-migrator.test.mjs` (13, with `tests/fixtures/namespace-migrator`: locations, dataset forms, TS/SCSS/Razor/Vue, vendored directories, BOM and CRLF), `tests/namespace-guard.test.mjs` (8), a switch-thumb check in `tests/nontext-contrast.test.mjs` (thumb against the unchecked and the checked track in every theme and brand, light and dark), and `tests/browser/brand-isolation.spec.mjs` (6: every pattern with Forma plus an example brand, light and dark, finds no Echelon value in any computed style).

## 0.14.0

Minor release: application identity, pre-runtime start-up, pending actions and a brand-neutrality guard (AIS-001, WI-0045). The source document is `.praxis/inbox/documents/2026-11-09-AIS-001-application-identity-startup-pending.md`. Everything is additive. No class, token, element or attribute was removed or renamed (QD-004). One existing markup pattern looks different: a button that already carried `aria-busy="true"` now shows the pending ring (see Pending actions).

### Added
- **Application identity (`.ef-app-identity`, AIS-001.1).** An application's own mark and name, usually the home link at the start of a shell header. The preferred mark is an inline SVG drawn with `currentColor`: it needs no request, works under `object-src 'none'`, and takes the theme accent (`.ef-app-identity__mark` sets `color` to `--ef-color-accent-primary`). An external mark is an `<object>` whose fallback content is a text monogram (`.ef-app-identity__monogram`), so a missing or CSP-blocked asset degrades to the monogram natively, with no script, instead of a broken image. A same-origin `<object>` SVG runs its own script with the page origin's access: use it only for trusted, script-free marks, and an inline SVG or `<img>` for anything customer-supplied. A plain `<img>` also works, without a fallback. Sizes are 16, 24, 32 and 64 CSS pixels (`data-ef-size`). External light and dark variants (`.ef-app-identity__variant` with `data-ef-scheme`) follow the active `data-ef-theme`, including one nested light region inside a dark page or inside a page that follows a dark operating-system preference, or that preference when no theme is set. Deeper alternation (dark, light, dark) is not resolved, and a new dark theme must be added to the CSS lists; a single-color inline mark avoids both. The mark is hidden from assistive technology and the tab order, so the visible name is the one accessible name. A link root keeps a 44px minimum height. Forma ships no organization's mark.
- **Start-up screen (`.ef-startup`, AIS-001.2).** Authored in the application's initial HTML, it renders before any WebAssembly or script runtime loads and needs only Forma CSS. It shows the application identity, the shared spinner and a status sentence in one polite status region. A "still starting" note (`.ef-startup__slow`) is revealed after `--ef-startup-slow-after` (default 8s) without script, by a zero-length animation filled forwards (a stepped 1ms animation was found to stay hidden at some delays in Chromium), in space reserved for it, or at once when the host sets `data-ef-state="slow"`. `data-ef-state="failed"` and `"timed-out"` remove the activity and show `.ef-startup__problem` (an alert with a recovery action), so nothing spins forever. With scripting off (`@media (scripting: none)`) `.ef-startup__noscript` replaces the status. Reduced motion stops the indicator but keeps the slow-start note. No progress is ever fabricated. `data-ef-extent="region"` sizes it for embedded use.
- **Pending actions (AIS-001.3).** `aria-busy="true"` on a `button` or `.ef-button` draws a busy ring before the unchanged label, sets a progress cursor and removes hover and press feedback in the application layer (inside a `.ef-site` marketing shell the marketing button keeps its hover color); the ring is static and dotted under reduced motion. Markup that already set `aria-busy="true"` on a button now gets this presentation. `.ef-form[aria-busy="true"]` sets a progress cursor; a pending form wraps its fields in `<fieldset disabled>`, which the browser enforces. Pair a pending button with `aria-disabled="true"`: Forma has no runtime and cannot block a keyboard submission, so the application must ignore repeated activation. Documented as new examples and states on the button and form pages.
- **Brand-neutrality guard (AIS-001.4).** `tests/brand-neutrality.test.mjs` measures Echelon identity references and Echelon-palette hex literals in Forma's generic stylesheets. The counts are a ratchet against `tests/fixtures/brand-neutrality-baseline.json`: they may fall, never rise. The AIS-001 rules must contain no color literal and no organization name, and the new patterns name no organization. Adversarial fixtures prove that the detectors fire. At this release the core stylesheets still carry 483 Echelon-palette `var()` fallbacks (components 331, assessment 115, foundations 37). The default palette is still Echelon's. Making the default neutral is a separate release with a migration.

### Tests
- `tests/browser/ais-001.spec.mjs` with `tests/browser/fixture/ais-001.html` and `ais-001-csp.html` (24 tests, including the slow note at the default 8s delay with and without reduced motion and a light region under a dark preference): object mark under `object-src 'none'` falls back to its monogram while an inline mark renders, inline mark takes each brand's accent, mark variant per theme, nested and operating-system scheme, one accessible name, mark not focusable, 44px link target, monogram fallback for a missing asset, the four sizes, start-up under both shipped brands in light and dark, delayed slow note without script, host-set slow, failed and timed-out states, no-script message, reduced motion, no sideways scrolling at 320px, pending button ring, hover and focus, reduced-motion ring, and pending form.
- `tests/brand-neutrality.test.mjs` (21 tests; hex in 3, 4, 6 and 8 digits, color functions and named colors are detected), run by `npm run test:css`.

## 0.13.1

Patch release with two fixes:

- marketing containment (MKT-CONTAIN, WI-0043), found by the Echelon Diagnostic Framework site migration to 0.13.0;
- the record header's type label below 24em (GH-179, WI-0044), found by Signal's upgrade to 0.13.0.

No class, token, element or attribute was removed or renamed.

### Fixed
- **Text containment in marketing components.** LRP-001 (0.13.0) passed `overflow-wrap: break-word` only to the application containers. Marketing components hold the same kind of content, so list items, spans and divs inside them could still escape: on 0.13.0 a release URL in a `span` escaped `.ef-card` by 160px at 320px, and at 200% text ordinary list words ("explanations", "propagation") escaped a card by up to 18px. `.ef-site` now passes `break-word` from `.ef-hero`, `.ef-section-heading`, `.ef-card`, `.ef-facts`, `.ef-index`, `.ef-callout`, `.ef-cta`, `.ef-split`, `.ef-doc`, `.ef-prose`, `.ef-statement` and `.ef-site-footer`. Words that fit are never split; declared values (badges, steps, code) are unchanged.
- **Record header type label below 24em (GH-179).** In 0.13.0 the header's `@container (max-width: 24em)` rule dropped the title grid's rows, but the identity block stayed `grid-template-rows: subgrid`, so the type label collapsed onto the title. It overlapped by 120–145px at 320–375px and by up to 790px at 200% text in the LRP-001 fixture, and in Signal it overlapped the page title on phones. The identity block now uses its own implicit rows below 24em, so the label sits above the title as it did in 0.6.1. Nothing changes above 24em.
- **Toned CTA at narrow widths.** `.ef-cta[data-ef-tone]` caps its inline padding at `12.5vw`, as a toned `.ef-section` already does (ULI-L05). At 320px and 200% text the uncapped padding left a 96px content box. Nothing changes at the default text size.

### Added
- **Optional requirement identity (FMO-019).** `Forma.Workflow.RequirementIdentity` (EchelonFoundry.Forma.Workflow, additive public API) puts `data-requirement-id` (and `data-requirement-instance` for repeated controls) on the element of a component's kind. It refuses wrappers, labels and unrelated elements, ambiguous markup, re-identification and invalid IDs, and it detects duplicate identities in a scope. `contracts/machine-operability.json` 1.1.0 adds `requirementIdentity` under locator tier 3. The attribute is optional and application-owned (FMO-013 unchanged), and no existing markup changes.

### Tests
- `tests/workflow/Forma.Workflow.Tests/RequirementIdentityTests.fs` (11 cases) and `tests/browser/requirement-identity.spec.mjs` with the generated `tests/browser/fixture/requirement-identity.html`: placement on the control, untouched attributes, label association and role, stability across re-render, refusal of unrelated or ambiguous elements, instance keys, duplicate detection, hidden and disabled states.
- `tests/browser/layout-reliability.spec.mjs`: the record header's type label ends at or above its title at 320, 375, 768 and 1280px with default and 200% text (GH-179). It fails on 0.13.0 at five of those eight points; containment could not see the defect because both boxes stay inside the header.
- `tests/browser/marketing-containment.spec.mjs` with `tests/browser/fixture/marketing-containment.html`: containment of every marketing container at 320, 375, 768 and 1280px with default and 200% text, the toned-CTA line length, and that fitting words in cards are not split. Nine of its ten tests fail on 0.13.0.

## 0.13.0

Minor release: layout reliability (LRP-001). The source document is `.praxis/inbox/documents/2026-10-30-LRP-001-layout-reliability.md`; the baseline and the Indy Init report are in `docs/reliability/`. `@echelon-foundry/forma-conformance` 0.3.0 ships the new geometry checks.

**Behaviour change: a token too long for its line now breaks inside Forma containers.** Before this release, a token without spaces kept its full width and escaped the card, dialog or field around it. This affected URLs, SHAs, paths and identifiers in a `span`, `strong`, `em`, `div` or `li`. Such a token now breaks at the container's edge. Words that fit are never split: containers pass on `overflow-wrap: break-word`, which leaves a word's minimum width alone, not `anywhere`. Content with an explicit `white-space` (`nowrap`, `pre`) keeps its wrapping, as do code blocks, truncating selects, character-grid runs and buttons. No class, token, element or attribute was removed or renamed (QD-004).

### Fixed
- **Text containment.** `overflow-wrap: break-word` is now inherited from these Forma containers, so arbitrary application text inside them breaks only when it would overflow:
  - `.ef-surface`, `.ef-stack`, `.ef-cluster`, `.ef-actions`, `.ef-grid`, `.ef-responsive-grid`, `.ef-rail`, `.ef-mosaic`, `.ef-priority-stack`, `.ef-focus-stage`, `.ef-sidebar`, `.ef-switcher`, `.ef-split-pane`;
  - `.ef-dialog`, `.ef-popover`, `.ef-menu`, `.ef-form`, `.ef-field`, `.ef-validation-summary`, `.ef-record-header`.

  At 320px on 0.12.0, the fixtures measured escapes of up to 716px.
- **Flex rows.** Children of `.ef-cluster` and `.ef-actions` are capped at the row's width (`max-inline-size: 100%`). This also caps their automatic flex minimum, so a long label no longer pushes the row past its container; it breaks inside the row. Items that fit keep their content size, and no control is shrunk below its label. A `dialog` or `[popover]` authored inside the row is exempt. A full-bleed child that uses negative margins is now capped at the row's width.
- **Record header.** The type label can break when it is wider than a narrow header (320px at 200% text).
- **Command palette.** A command's label is capped at its button's width, so a long label no longer overflows the palette.
- **WebKit horizontal scrolling in forms.** A `select` with a long option inside `.ef-form-row` added the option's width to the page's horizontal scroll in WebKit/Safari. It now gets layout containment, which keeps that width inside the select; the subgrid alignment is kept.
- **Focus on date and time pickers.** In Chromium, keyboard focus on the picker button of a date, time, datetime-local, month or week input painted no focus indicator. It now shows the Forma focus ring. The rule applies only to that case (`:focus-within:not(:focus)`), so pointer focus on the input itself keeps the native behaviour.
- **Focus scrolling.** Focus-visible elements have `scroll-margin: 0.5rem`, so tabbing to an element at the viewport edge brings its whole focus ring into view. Chromium and WebKit honour this; Firefox does not.
  - Side effect: in WebKit, tabbing into a mandatory scroll-snap container offsets the snap position by that margin.

### Added
- **Design-token validator (`tools/TokenValidator`).** It is written in F#, has no dependencies, and ships in the package. It validates `var(--ef-*)` references and `--ef-*` declarations against the Forma installation itself. That installation's token sources, built CSS and color contract are the source of truth. It reports:
  - `unknown-token`, even when the reference has a fallback;
  - `deprecated-token` (DTCG `$deprecated`);
  - `namespace`: `--forma-*`, `--ef_*`, a dropped segment such as `--ef-spacing-4`, or an application minting a new `--ef-*` name;
  - `internal-variable`;
  - custom-property `cycle`, judged per rule and at-rule context.

  Strings and comments are inert. With `--self` it also checks Forma's own `invalid-alias`, alias `cycle`, `theme-missing` (token themes and brand manifests) and `missing-definition`. Application-owned custom properties are never reported.
  - Forma itself: `npm run tokens:validate`, which is now part of `check` and `release:check`. These scripts therefore need the .NET SDK.
  - Applications: `dotnet run --project node_modules/@echelon-foundry/design-system/tools/TokenValidator/TokenValidator.fsproj -- --forma node_modules/@echelon-foundry/design-system src/`. See `docs/CONSUMING-FORMA.md`, "Design-token validation".
- **`@echelon-foundry/forma-conformance` 0.3.0**, which also publishes the 0.11.0 corner-containment helpers:
  - `measureContainment`, `expectContained` and `evaluateContainment` (ULI-L05 `contain.element`) check that every descendant box and text line stays inside a component's content box.
  - `measureFocusVisibility`, `expectFocusVisible` and `evaluateFocusVisibility` (WCAG 2.4.7/2.4.11 `focus.unclipped`) check that a visible outline or outward box-shadow is painted and that no hard clip cuts it.
- **Browser geometry suite.**
  - `tests/browser/layout-reliability.spec.mjs` covers 11 adversarial fixtures at 320, 375, 768 and 1280px and at 200% text. It also runs dialog, dropdown, focus, media, theme, skin and axe checks. On 0.12.0 it failed 48 of 78 checks across Chromium, Firefox and WebKit.
  - `tests/browser/word-integrity.spec.mjs` checks that no canonical pattern or fixture splits a word that fits its box.
  - `tests/browser/causa-representative.spec.mjs` covers Causa-shaped regions at phone, iPad portrait, iPad landscape and desktop sizes.

### Known limitations
- `.ef-dashboard-grid`, `.ef-split-pane` and `.ef-operation-status` reflow only at a viewport media query. Under page-level 200% text at iPad portrait width they stay wider than their region. This is the same class as the alert's viewport-based stacking. The Causa spec asserts these still fail, so a fix is noticed.
- A narrowed `<svg>` with `width`/`height` attributes keeps its attribute height, so its box is taller than the drawing; the drawing itself is letterboxed, not distorted.
  - No single declaration fixes this without a regression in some engine. `block-size: auto` makes icons stretch in flex rows in every engine. The intrinsic keywords avoid that stretch, but WebKit does not resize an SVG with them.
  - Workaround: give such charts `block-size: auto` yourself, or omit the `height` attribute.

## @echelon-foundry/forma-workflow 1.2.0

Minor release of the workflow package (and `EchelonFoundry.Forma.Workflow` 1.2.0): it ships the Forma 0.12.0 engine. **Behaviour change: validation is stricter.** Documents that validated under 1.1.0 can now fail with `A11Y-NONTEXT-CONTRAST` (WCAG 1.4.11, 3:1), and `render` refuses documents that fail validation. Added: `token:status-warning|danger|success|info` diagram colours, `ValidationOptions.Theme` and `--theme` on `validate`/`render`. No element, class, attribute or token was removed or renamed (QD-004), so this is a minor release, as Forma 0.12.0 was. See 0.12.0 below for the migration.

## 0.12.0

Minor release: diagram non-text contrast and status tokens.

**Behaviour change: workflow validation is stricter.** Diagram non-text contrast (R7-REM-009, `.praxis/inbox/documents/2026-10-29-R7-REM-009-diagram-nontext-contrast.md`).
Documents that validated before can now fail with `A11Y-NONTEXT-CONTRAST`, and `forma-workflow render` refuses them (exit 1). The status tokens are additive.

### Migration
- Prefer Forma tokens for outlines and connectors: `token:status-*` or `token:border-functional` follow the theme and are not judged by the document rule.
- If the host pins a theme, pass it: `--theme light|dark` on `validate` and `render`, or `ValidationOptions.Theme` with `Validation.loadWith`. Default-surface contrast is then judged for that theme only.
- Otherwise adjust literal colours to reach 3:1 against the light (`#f2efe7`) and dark (`#171a18`) surfaces, or against the node's literal fill.

### Added
- **Status colour tokens in the workflow vocabulary.** `token:status-warning`, `token:status-danger`, `token:status-success` and `token:status-info` are accepted wherever a workflow colour is (`fill`, `stroke`, `accent`, `foreground`, edge `stroke`, palette slots) and render to `var(--ef-color-status-*)`. The workflow schema enum and `contracts/diagram-presentation.json` list them. An application can draw an attention outline with a Forma token instead of a brand literal.
- **Validation rule `A11Y-NONTEXT-CONTRAST`** (error, accessibility; WCAG 1.4.11, 3:1). Literal (or literal-palette) colours on nodes, groups, legend swatches and edges. Without an authored fill, strokes, accents, legend swatches and edge strokes are judged against both default surfaces, light `#f2efe7` and dark `#171a18`, and the weaker theme is named; a pinned host theme (`--theme`, `ValidationOptions`) limits this to that theme's surface. With a literal fill, the accent must reach 3:1 against the fill; the stroke is reported only when it is below 3:1 against the fill and neither stroke nor fill reaches 3:1 against a default surface, so borderless filled shapes stay valid. Token values and token/literal mixes are not judged by the document rule; `tests/nontext-contrast.test.mjs` checks every status token and `border-functional` at 3:1 on surface-primary and surface-secondary in every shipped theme and brand. Rehearsal 6 regression: Causa's `#e9a23b` outline on `#f5f3ed` measured 1.95:1 and passed validation. See `docs/workflow/VALIDATION.md`, "Non-text contrast".
- **Contract.** `contracts/diagram-presentation.json` marks `fill`, `stroke`, `accent` and `connectorStroke` `"contrast": "consumer"` (as `foreground` already was): colours set through the CSS custom properties bypass document validation and must be measured by the application.
- **Browser regression.** `tests/browser/diagram-nontext-contrast.spec.mjs` measures real Forma.Workflow output (golden documents in `tests/fixtures/workflow-nontext/`, checked by the F# suite) in Chromium: status-token outlines, a diamond node and an edge reach 3:1 in light, dark and forced colours; the Rehearsal 6 document is reported by the validator and measures below 3:1.

### Changed
- **Validation is stricter** (see Migration above).
- **`Validation.loadWith` / `ofJsonWith` / `semanticWith`** take `ValidationOptions` (`{ Theme }`); `load`, `ofJson` and `semantic` keep their behaviour with no pinned theme. The CLI's `validate` accepts `--theme`, and `render --theme` now also scopes validation.
- `examples/workflows/forma/workflows/colored.forma-workflow.json`: connector `c2` stroke `#2f5fb3` → `#3d6cc0`. The old value is 2.85:1 on the dark surface and is now an `A11Y-NONTEXT-CONTRAST` error. Existing documents with literal colours may newly fail this rule.


## 0.11.0

Minor release: typography roles (EII-F, `.praxis/inbox/documents/2026-10-28-EII-F-typography-roles.md`).

### Added
- **Typography roles.** `data-ef-type="application"`, `"dense"` and `"accessible"` select fixed heading and body steps from existing tokens: application h1/h2/h3 2xl/xl/lg with no ch caps; dense one step smaller with snug leading; accessible one step larger with relaxed leading. Marketing stays the default. Roles work in the `.ef-site` shell and on the application layer alone. See `docs/CONSUMING-FORMA.md`, "Typography roles".
- **Role tokens `--ef-type-measure-h1` / `--ef-type-measure-h2`.** They carry the existing 14ch/18ch marketing heading measures so a role can lift them.
- **`@echelon-foundry/forma-conformance`: rendered corner check.** `evaluateCornerContainment`, `resolveCornerRadius`, `measureCornerContainment` and `expectTextInsideCorners` port the layout probe's `boundary.corner` (LCE-001) to consumers. Released with the package's next version.
- **Browser regressions.** `tests/browser/type-roles.spec.mjs` (R5 heading scale, role steps, containment, overlap, clipping, focus, keyboard, 320-1280px, 200% text) and `tests/browser/corner-containment.spec.mjs` (LCE-001 padding cap under pill and 50% brand radii).

### Fixed (opt-in)
- An application screen on the `.ef-site` shell no longer has to inherit the marketing display scale (h1 up to 7.25rem at 14ch), which the R5 rehearsal overrode locally.
- On the application layer, wrapped h1/h2 lines under a role use snug leading; with the core 1.02 line-height their glyph boxes overlapped at 200% text.


## 0.10.0

Minor release: layout constraint enforcement (LCE-001, `experiments/LCE-001/REPORT.md`). `@echelon-foundry/forma-workflow` 1.1.0 ships the matching engine.

### Fixed
- **Pill diagram nodes.** The curve no longer cuts multi-line text. The corner radius is bounded by the node padding, so a short pill stays a stadium.
- **Ellipse diagram nodes.** Padding is the inscribed bound (14.65% plus clearance).
- **Diamond diagram nodes.** Padding is now 25% plus clearance; at 20%, the content corners fell outside the diamond.
- **Marketing card, badge and button.** A brand `--ef-shape-radius` is capped by each component's padding, so a pill or 50% brand radius cannot cut multi-line content.
- **Marketing button and badge.** They use `overflow-wrap: anywhere`, so a word wider than the row breaks instead of overflowing.
- **Diagrams inside `.ef-site`.** They keep their own type metrics: `.ef-diagram` pins its type context, and `revert-layer` stops site prose defaults at the diagram.
- **Wizard step indicators.** They widen into a pill for multi-digit text instead of overflowing the circle.
- **Connector labels.** They wrap at 12rem.

### Changed
- **Node sizing in `Forma.Workflow`.** Sizing is shape-aware and uses a script-aware text estimate (`LayoutText`) that reserves WCAG 1.4.12 text-spacing room. Nodes can be taller than before.
- **Rank gaps.** They fit the widest connector label.
- **Connector routing.** Connectors avoid unrelated nodes.
- **Label placement.** Labels are placed without collisions.
- **Diagram geometry.** It is emitted in rem (1rem = 16 canvas units), so it scales with enlarged text. The exported example documents were regenerated.

### Added
- **`Forma.Workflow.LayoutGeometry`.** Shape geometry: CSS radius normalisation, inner borders, curved and rotated boundaries.
- **`Forma.Workflow.LayoutCheck`.** Static layout validation: authored sizes too small for their content, node overlap, connectors through nodes, and label collisions.
- **`tests/layout` and `npm run test:layout`.** An adversarial F# layout probe with browser measurement, plus 50 regression fixtures, including the three Causa historical diagrams.

## 0.9.1

Patch release: deterministic browser runtime version diagnostics.

### Added
- The `@echelon-foundry/design-system/runtime` entry point, generated from the package version, registers Forma 0.9.1 in `window.__ECHELON_RUNTIME__` and emits one compact console diagnostic.
- Cross-browser Playwright coverage for actual build metadata, independent load order, duplicate initialization, conflict diagnostics, and the combined Echelon registry.

Component HTML and CSS remain behavior-free. The diagnostic does not inspect or modify the DOM and adds no production dependency.

## 0.9.0

Minor release: public semantic color contracts and rendered state validation.

### Added
- A generated `forma.color-contract/1.0.0` manifest for every shipped theme and brand, with public/internal separation, source provenance, semantic pairings, forced-colors behavior and explicit application-extension boundaries.
- The zero-dependency `forma-color` CLI and `color-contract` Node API, which refuse unknown `--ef-color-*` references and reserved internal color variables with source locations and supported-role suggestions while ignoring application-owned variables.
- Public success, warning, danger and information tokens across all core themes and shipped brands, plus rendered light/dark/forced-colors and non-hue state evidence.

### Changed
- Status lozenges use the public status foregrounds while retaining explicit text, glyph and border cues.
- Brand status overrides remain optional for schema 1.0 compatibility and inherit from the active core theme when absent.

The contract documents Summa's four unsupported spellings and their supported replacements. A valid token and passing contrast establish compatibility, not product-palette appropriateness or semantic comprehension.

## 0.8.0

Minor release: Design by Construction forms and fully operable form examples.

### Added
- A versioned `forma.design/1.0.0` JSON contract, capability declaration, validator, deterministic HTML renderer, valid NASA fixture and refusal fixtures for unsupported versions, presentation overrides, invalid nesting, misalignment and unbound actions.
- A complete form catalog page with functional basic, advanced, validation and mobile examples built from native custom-element HTML.
- Package exports for the design schema, capabilities and examples, while preserving hand-authored HTML and audited extended/custom escape paths.

### Fixed
- Forms now have a bounded responsive root, aligned grid-field tracks, stable validation-message placement and visible fragment-targeted success feedback.
- Native controls and buttons have explicit disabled, read-only and invalid presentation without relying on colour alone.
- Catalog reset examples are outcome-tested by preparing and observing a native field value; submit examples remain URL-outcome tested.

No existing component, class, token or icon was renamed or removed. Forma remains zero-runtime HTML and CSS; design validation and rendering are build-time tools.

## 0.7.0

Minor release: shared layout and interaction conformance with
`visual-engineering/UI-LAYOUT-INTERACTION@1.0.0` (forma#156).

### Added
- **Form row** (`.ef-form-row`, `patterns/form-row.html`). Peer fields share label, description, control and validation-message subgrid rows, so controls keep one top edge whatever their labels, help or errors say (ULI-L01, L13). Fields wrap by available width with no breakpoints.
- Catalog interaction declarations: every example that renders an enabled action is a declared **live demo** with outcome-tested native actions, or a labelled, inert **static specimen**. The documentation site shows the label, and `npm run catalog:check` enforces the declarations.
- `npm run ui:conformance` runs the conformance evidence suites (Chromium).
- `@echelon-foundry/forma-conformance` 0.1.0, a separate dev-only package of Playwright helpers. The design-system package does not include or depend on it.

### Fixed
- Single-line text, date, time, number and select controls share one em-based intrinsic height. In Chromium they previously measured 49.97, 51.97 and 46.38 px (ULI-L02).
- At 320 and 390 px with 200% text, these no longer overflow (ULI-L05):
  - the data grid's stacked label column;
  - status lozenges;
  - the record header;
  - best-worst options with long words;
  - key-value lists, metric cards and the mobile action bar;
  - the command palette, conversation, diagnostic status, provenance trail, readiness checklist, security blockers, wizard steps and semantic differential;
  - the collection toolbar filters, disclosure and code figure captions.
- A collapsed resizable split pane now stacks on narrow screens instead of keeping three columns and squeezing the secondary pane.
- The record-header status is centred on the title row rather than on the type label and title together (ULI-L07).
- Action labels no longer split mid-word inside table cells or link buttons, and an action row can no longer push past its container.
- The marketing layer keeps index links on one line while they fit, gives steps and toned sections readable line lengths at large text sizes, and caps link buttons at their row width.
- `fieldset` no longer keeps a min-content width, and a stretched `.ef-field` keeps its control under its label.

No class, token or icon was renamed or removed. Visual changes appear only where the previous geometry overflowed, staggered or mismatched.

## 0.6.1

Patch release: responsive navigation and native date/time field containment.
- Site navigation labels no longer break mid-word or overlap the header at tablet sizes, mobile widths, or larger text scales. Navigation reflows into its own bounded, keyboard-accessible horizontal scroll region.
- Shared native date, time, and datetime-local fields constrain their intrinsic width within grid columns, including Safari, without replacing the browser picker.
- Documentation example previews and code snippets scroll within their own containers instead of widening the page.
- Documentation navigation now highlights only the current section, with `aria-current="page"` on section index pages and `aria-current="location"` on descendants; the Agent use link is not a permanently highlighted call-to-action.
- Adds generated-page and WebKit responsive tests at eight widths, including the reported date-time-field examples and enlarged text.

No public icon identifiers, assets, or component semantics were renamed.

## 0.6.0

Additive icon-library expansion: **80 icons in total**, up from 40, with no changes to existing icon identifiers or their geometry.

### Added
- Email and collaboration: `email`, `email-open`, `inbox`, `send`, `reply`, `reply-all`, `forward`, `attachment`, `message`, `chat`, `phone`, `video-call`.
- Common actions: `archive`, `bookmark`, `link`, `unlink`, `share`, `star`, `eye`, `eye-off`, `minus`, `more-vertical`, `maximize`, `minimize`.
- Documents and media: `file-text`, `image`, `camera`, `video`, `microphone`, `clipboard`.
- Navigation and places: `chevron-left`, `chevron-right`, `map-pin`, `globe`, `compass`.
- Status and assistance: `info`, `error`, `help-circle`, `pending`, `wifi-off`.

Each new icon includes a canonical source geometry definition, search metadata, standalone and inert inline SVG build outputs, dedicated usage guidance, accessible action examples, and a generated individual documentation page. Icons remain static, offline, brand-neutral, `currentColor`-based, and safe for print.

### Validation
- Extended source-contract tests protect the previous 40 IDs, new icon names, distinct messaging glyphs and safe geometry.
- Expanded browser coverage checks labelled native message controls at 320px and static embedding of the complete registry.
- Source/documentation parity remains mandatory for every icon.

Consumer migration is opt-in. Apps pinned to 0.5.0 will not automatically acquire the new artwork. Publish 0.6.0 only after Praxis, package, site, accessibility and browser CI pass.

## 0.5.0

Additive minor release: Forma's static icon system. Forma core remains
zero-runtime; no existing HTML class or token contract was renamed, so no
consumer migration is required.

### Added

- **`ef-icon` catalog pattern** (`patterns/icon.html`): decorative inline SVG
  inside a natively named control. The SVG is `aria-hidden` and never names,
  operates or signals state on its own.
- **40 original, brand-neutral outline icons** in `icons/registry.json`
  (24-unit grid, 1.8 stroke, round caps and joins), validated by
  `schemas/icon-registry.schema.json` and compiled at build time by
  `tools/icons/build.mjs`. Third-party geometry, scripts, external `href`s and
  embedded media are rejected.
- **Package assets** under `@echelon-foundry/design-system/icons/*`:
  `icons/<name>.svg`, decorative `icons/html/<name>.html` snippets, and
  `icons/registry.json`. The compiled registry records `formaVersion` (the
  producing release) and each icon's `svgSha256`, so consumers can pin and
  verify bundled release geometry offline.
- **Generated icon gallery** at `/icons/` on the documentation site.
- Tests for deterministic compilation, offline/static output, SVG security,
  accessibility, forced colors, and 320px layout.

Studio and Folio pin 0.5.0 only after this version is published and their own
end-to-end verification passes.

## 0.4.1

Patch release. There are no markup, class, or token-name changes, so no
consumer migration is required.

### Fixed

- **WCAG AA contrast on the secondary surface (FORMA-A11Y-002).** Body,
  severity, reference, hint, and link text inside components that paint
  `--ef-color-surface-secondary` now meets 4.5:1 in every theme and brand.
  Affected components include `.ef-fault--inline`, `.ef-surface`, assistant
  conversation turns, file drop zones, master-detail rows, evidence-age rows,
  and checked choices. Previously, text inside them used `text-secondary` or
  an accent role. For example, inline-fault text was `#686d68` on `#e3e0d7`,
  4.0:1. Every rule that paints the secondary surface now rebinds secondary
  and muted text to `text-on-secondary-surface`, and links and accent labels
  to `text-primary`, through the new `--ef-surface-accent-text-color` hook.
  Consumer workarounds such as `.operational-fault p { color: inherit }` can
  be removed.
- **Forced colors.** In Chromium, ibm-3270 character-grid text was painted in
  the profile palette on the forced white Canvas, at 1.1 to 2.4:1. Profile
  tokens now resolve to system colors under `forced-colors: active`.
- **Built CSS.** Forma 0.3.0 shipped a literal `\n` before
  `.ef-surface :where(h1, …, p)` in `foundations.css` and `all.css`, so that
  rule never applied. The source was corrected in 0.4.0. 0.4.1 adds a check of
  the built output that would have caught it.

### Added checks

- `tests/browser/pattern-contrast.spec.mjs` runs axe color-contrast over every
  documented pattern, in every theme, every brand (light and dark), and forced
  colors.
- `tests/contrast-pairs.test.mjs` checks documented token pairs and
  secondary-surface pairing for every compiled theme and brand.
- `tests/dist-css.test.mjs` parses every built stylesheet and fails on stray
  escape sequences, unbalanced blocks, selectors that name nonexistent
  elements, and composed outputs whose selectors differ from their sources.
