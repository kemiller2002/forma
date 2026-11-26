# Releasing Forma

Merging to `main` is the release. Two workflows run on that push:

- `.github/workflows/release-forma.yml` owns the immutable `vX.Y.Z` git tag
  and the GitHub release (the npm tarball plus the flat marketing assets).
- `.github/workflows/publish.yml` owns npm. It publishes `package.json`'s
  version once, after `npm view` shows npm does not have it yet.

To release new package contents, bump `package.json` (and `package-lock.json`),
add the final `CHANGELOG.md` entry and a `docs/CONSUMING-FORMA.md` note for the
version (`tests/package-contract.test.mjs` checks all three), and merge.

## When the release workflow runs

`release-forma.yml` runs on pushes to `main` that touch a watched path: the
sources that build the package, the schemas it ships, and the release machinery
itself (`on.push.paths`). The path filter is only a trigger filter. It decides
when the workflow *looks*; it does not decide whether a release is needed.

## The content guard (WI-0068)

A published `vX.Y.Z` must never change. The workflow therefore packs the
package exactly as the release would (`npm run release:check`, then
`npm pack`) and hands the tarball to `tools/release-guard.mjs`, which compares
it with the tarball already published for the same version:

| Situation | Outcome | Result |
| --- | --- | --- |
| No GitHub release for `vX.Y.Z` (and no tag, or a tag at this very commit) | `create` | Creates the release and tag from this commit. |
| Release exists; packed files identical to its tarball | `noop` | Succeeds: "already released, nothing to do". Nothing is uploaded or modified. |
| Release exists; any file added, removed or changed | `differs` | Fails: bump `package.json`. Lists the differing paths. |
| Release exists without the `echelon-foundry-design-system-X.Y.Z.tgz` asset, the download does not match the digest GitHub recorded, or a tag exists on another commit with no release | `unverifiable` | Fails loudly. The release is never overwritten. |

Before WI-0068 the guard compared commits: any watched change after the tag
(a workflow, test or docs edit) failed with "vX.Y.Z points to …, not …. Bump
package.json …" although the package was unchanged. Now an edit that leaves the
packed package identical is a successful no-op, and changed contents still
cannot ship under an existing version.

### How content is compared

The guard does not compare tarball bytes. It gunzips both archives, reads their
tar entries and compares a manifest of `path -> sha256(file bytes)`. Gzip
headers, compression level, tar mtimes, owners and entry order never take part,
so the comparison is stable across machines and npm versions, while any change
to a shipped byte, or any added or removed file, is a difference. File modes are
not compared (`npm pack` normalizes them). The downloaded asset is first checked
against the `sha256:` digest GitHub records for it, so a corrupt download cannot
pass as "different" or "identical".

`npm pack` is in fact reproducible for Forma: packing `main` at 15b57bc
produced a tarball whose whole-file sha256 equals the published v1.1.0 asset
(`ac6d62b6…`). The per-file comparison keeps the guard correct even if a future
npm changes its archive framing.

`tools/release-guard.mjs` keeps the decision pure (`decideRelease`,
`compareManifests`, `readTar`); its CLI only reads files and reports.
`tests/release-guard.test.mjs` covers every outcome above and runs with
`npm run test:package`.

### Running it by hand

```sh
npm run build && npm pack --pack-destination release
gh api repos/kemiller2002/forma/releases/tags/v1.1.0 > release.json
gh release download v1.1.0 --pattern echelon-foundry-design-system-1.1.0.tgz --dir published
node tools/release-guard.mjs --packed release/echelon-foundry-design-system-1.1.0.tgz \
  --tag v1.1.0 --sha "$(git rev-parse HEAD)" --release-json release.json \
  --published published/echelon-foundry-design-system-1.1.0.tgz
```

Omit `--release-json` and `--published` to model a version that has no release.
