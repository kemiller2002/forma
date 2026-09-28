---
id: ADR-0003
title: Versioned marketing presentation artifacts distributed as immutable release assets
status: accepted
date: 2026-09-28
supersedes: null
related:
  - requirements/MARKETING-PRESENTATION.md
  - docs/MARKETING-SITES.md
  - research/evidence/EV-DESIGN-2026-0014--echelon-foundry-marketing-reference-analysis.md
work_item: GH-49
---

# Decision

Forma distributes its marketing presentation as **flat, self-contained,
versioned CSS files attached to the Forma GitHub release** for each version.
Each site pins the files with a line-oriented `forma.lock` that records an
exact version and a sha256 for every asset. The same files also ship inside
the npm package under `dist/marketing/`.

The artifacts are defined declaratively in `bundles/echelon-marketing.bundle.json`.
The F# `tools/PresentationBundler` builds them:

| Artifact | Contents |
|---|---|
| `forma-marketing.css` | Brand-neutral layer: core tokens, role defaults, Forma foundations, marketing foundations, components, layouts |
| `forma-marketing-theme-echelon.css` | Echelon Marketing Theme: compiled theme tokens plus theme hooks |
| `forma-echelon-marketing.css` | The two above, concatenated; the one file most sites load |
| `forma-all.css` | Complete Forma surface for sites that also use application patterns |
| `forma-marketing.manifest.json` | Version, release tag, and per-file bytes, sha256, and sources |
| `forma-marketing.sha256` | `sha256sum -c` compatible checksums |

Sites install with `actions/install-presentation`: a composite GitHub Action
around a bash script that needs only `curl` and `sha256sum` or `shasum`. The
installer:

- downloads from `releases/download/v<version>/` or copies from `--source DIR`
  for offline or local builds;
- checks each file against the release's own checksum file;
- refuses anything that does not match the lock.

`--update` is the only way a lock changes.

# Context

Marketing sites differ in delivery:

- static HTML;
- Node generators;
- F# generators (Ordo);
- F#/WASM builds (Limen);
- a React/Tailwind app (Culinary);
- a shared research generator.

Several have no Node runtime at deploy time. Forma already publishes an npm
tarball, but npm alone would force a JavaScript toolchain onto F#-only and
static sites. The task forbids introducing Node solely for CSS packaging.

Sites must not change silently when Forma `main` changes. The version in use
must be visible in each site's repository.

# Alternatives considered

1. **npm dependency only.** Rejected as the only channel: it requires Node and
   a package manager on sites that have neither. Kept as a second channel,
   because npm-based sites (the main site already pins
   `@echelon-foundry/design-system` 0.2.0) can use `dist/marketing/*`.
2. **Hotlink the Forma GitHub Pages site.** Rejected. Pages serves only the
   current `main` build, so it can be neither pinned nor immutable, and every
   site would depend on another site's availability at runtime.
3. **A tarball per release.** Rejected as unnecessary. The artifacts are
   single files, and flat assets need no extraction step.
4. **Git submodule or vendored copy of Forma source.** Rejected. This is
   copying under another name and makes local edits to shared CSS easy.
5. **A new package manager or registry.** Rejected as heavier than immutable
   release assets plus a checksum lock.

# Consequences

- **Reproducibility and determinism.** The bundler normalizes line endings,
  writes no timestamps, and emits files in definition order, so rebuilding a
  tag produces identical bytes. `tests/marketing-distribution.test.mjs` proves
  this. The lock's sha256 makes a deploy fail rather than drift if a release
  asset is ever replaced.
- **Versioning.** The artifacts share Forma's package version. The release
  workflow refuses to publish a version whose tag points at another commit.
- **Independent installation.** Artifacts contain no `@import`, no relative
  `url()`, and no script. The bundler fails the build otherwise.
- **Offline builds.** `install.sh --source <dir>` installs from a local
  directory, such as a Forma checkout's `dist/marketing` or a cache.
- **Discoverability.** `forma.lock` in the site repository states the version
  (`forma 0.3.0`), the source repository, the destination, and each pinned
  asset.
- **Cost.** A site pinning a new version runs one command and commits one
  file. Nothing upgrades automatically.

# Versioning and compatibility policy

Forma uses semantic versioning of the public presentation contract:

- the documented `ef-*` classes and their required structure;
- `data-ef-*` attributes;
- the role tokens;
- artifact names.

- **Patch** (0.3.x → 0.3.y): visual fixes that preserve the contract, and
  accessibility fixes.
- **Minor** (0.3 → 0.4): new classes, tokens, variants, or artifacts. It may
  also make a visual change within an existing contract that alters layout
  metrics; this must be called out in the release notes. While Forma is 0.x,
  a minor release may deprecate a class. Deprecated classes keep working for
  at least one further minor release.
- **Major** (after 1.0): removal or renaming of classes, tokens, attributes,
  or artifacts, and any change to required markup structure.
- **Artifact names are stable.** A new artifact name is additive; a removed
  name is breaking.
