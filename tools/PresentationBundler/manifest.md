# Feature Manifest: Presentation bundler

## Purpose

Build versioned, deterministic, self-contained release artifacts, a manifest,
and sha256 checksums from a declarative bundle definition in `bundles/*.json`
(ADR-0003).

## Behavior

- Inputs:
  - a bundle definition;
  - `package.json` for the version;
  - built CSS sources.
- Output:
  - `dist/marketing/*.css`;
  - `forma-marketing.manifest.json`;
  - `forma-marketing.sha256`.
- Guards. The build fails on:
  - `@import`;
  - relative `url()`;
  - script;
  - missing sources;
  - duplicate artifacts;
  - forward artifact references.

## Tests and verification

`tests/marketing-distribution.test.mjs`
