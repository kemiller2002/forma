import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { gzipSync } from "node:zlib";
import { compareManifests, decideRelease, manifestOf, manifestOfTarball, readTar } from "../tools/release-guard.mjs";

// Minimal ustar writer so the tests control tar headers (mtime, PAX long paths)
// without depending on npm or a tar binary.
const BLOCK = 512;
const pad = bytes => Buffer.concat([bytes, Buffer.alloc((BLOCK - (bytes.length % BLOCK)) % BLOCK)]);
const octal = (value, width) => value.toString(8).padStart(width - 1, "0") + "\0";

const header = ({ name, size, type = "0", mtime = 0 }) => {
  const block = Buffer.alloc(BLOCK);
  block.write(name, 0, 100, "utf8");
  block.write(octal(0o644, 8), 100);
  block.write(octal(0, 8), 108);
  block.write(octal(0, 8), 116);
  block.write(octal(size, 12), 124);
  block.write(octal(mtime, 12), 136);
  block.write("        ", 148);
  block.write(type, 156);
  block.write("ustar\0", 257);
  block.write("00", 263);
  const checksum = block.reduce((sum, byte) => sum + byte, 0);
  block.write(octal(checksum, 7) + " ", 148);
  return block;
};

const paxRecord = (key, value) => {
  const body = ` ${key}=${value}\n`;
  let length = body.length + 1;
  while (String(length).length + body.length !== length) length += 1;
  return `${length}${body}`;
};

const entryBlocks = ({ path, content, mtime }) => {
  const data = Buffer.from(content);
  if (path.length <= 100) return [header({ name: path, size: data.length, mtime }), pad(data)];
  const pax = Buffer.from(paxRecord("path", path));
  return [header({ name: "PaxHeader", size: pax.length, type: "x" }), pad(pax), header({ name: path.slice(0, 99), size: data.length, mtime }), pad(data)];
};

const tarball = (files, { mtime = 0, level = 9 } = {}) =>
  gzipSync(Buffer.concat([...files.flatMap(file => entryBlocks({ ...file, mtime })), Buffer.alloc(BLOCK * 2)]), { level });

const PACKAGE = [
  { path: "package/package.json", content: '{"name":"@echelon-foundry/design-system","version":"1.1.0"}' },
  { path: "package/dist/all.css", content: ".forma-button{color:red}" },
  { path: "package/docs/BRANDING.md", content: "# Branding\n" }
];
const ASSET = "echelon-foundry-design-system-1.1.0.tgz";
const SHA = "15b57bc0000000000000000000000000000000000";
const releaseWith = (assets = [{ name: ASSET }]) => ({ tag_name: "v1.1.0", assets });
const manifest = files => manifestOfTarball(tarball(files));

test("reads ustar entries, PAX long paths and skips directories", () => {
  const longPath = `package/${"deep/".repeat(30)}file.json`;
  const tar = Buffer.concat([
    header({ name: "package/dist/", size: 0, type: "5" }),
    ...entryBlocks({ path: longPath, content: "{}" }),
    ...entryBlocks({ path: "package/a.css", content: "a" }),
    Buffer.alloc(BLOCK * 2)
  ]);
  const entries = readTar(tar);
  assert.deepEqual(entries.map(entry => entry.path), [longPath, "package/a.css"]);
  assert.equal(entries[0].data.toString(), "{}");
});

test("content manifest ignores tar mtimes and gzip settings", () => {
  const first = manifestOfTarball(tarball(PACKAGE, { mtime: 0, level: 9 }));
  const second = manifestOfTarball(tarball([...PACKAGE].reverse(), { mtime: 1_700_000_000, level: 1 }));
  assert.deepEqual([...first], [...second]);
  assert.equal(compareManifests(first, second).identical, true);
});

test("comparison names added, removed and changed files", () => {
  const released = manifest(PACKAGE);
  const packed = manifest([
    PACKAGE[0],
    { path: "package/dist/all.css", content: ".forma-button{color:blue}" },
    { path: "package/dist/new.css", content: "" }
  ]);
  assert.deepEqual(compareManifests(released, packed), {
    identical: false,
    added: ["package/dist/new.css"],
    removed: ["package/docs/BRANDING.md"],
    changed: ["package/dist/all.css"]
  });
});

test("(a) no release for this version: create it", () => {
  const decision = decideRelease({ tag: "v1.1.0", sha: SHA, assetName: ASSET, packed: manifest(PACKAGE) });
  assert.equal(decision.outcome, "create");
  assert.equal(decision.ok, true);
});

test("(a) a tag at this very commit without a release still creates it", () => {
  const decision = decideRelease({ tag: "v1.1.0", sha: SHA, tagCommit: SHA, assetName: ASSET, packed: manifest(PACKAGE) });
  assert.equal(decision.outcome, "create");
});

test("(b) released with identical content but a different commit: succeed as a no-op", () => {
  const bytes = tarball(PACKAGE, { mtime: 42 });
  const decision = decideRelease({
    tag: "v1.1.0",
    sha: SHA,
    tagCommit: "c8f40b4000000000000000000000000000000000",
    assetName: ASSET,
    packed: manifest(PACKAGE),
    release: releaseWith(),
    published: manifestOfTarball(bytes),
    publishedDigest: "unused"
  });
  assert.equal(decision.outcome, "noop");
  assert.equal(decision.ok, true);
  assert.match(decision.message, /already released with identical package content.*nothing to do/);
});

test("(c) released with different content: fail and ask for a version bump", () => {
  const decision = decideRelease({
    tag: "v1.1.0",
    sha: SHA,
    assetName: ASSET,
    packed: manifest([...PACKAGE.slice(0, 1), { path: "package/dist/all.css", content: "changed" }, PACKAGE[2]]),
    release: releaseWith(),
    published: manifest(PACKAGE)
  });
  assert.equal(decision.outcome, "differs");
  assert.equal(decision.ok, false);
  assert.match(decision.message, /Bump package\.json/);
  assert.match(decision.message, /~ package\/dist\/all\.css/);
});

test("(d) released without the package asset: fail loudly, never overwrite", () => {
  const decision = decideRelease({
    tag: "v1.1.0",
    sha: SHA,
    assetName: ASSET,
    packed: manifest(PACKAGE),
    release: releaseWith([{ name: "forma-all.css" }])
  });
  assert.equal(decision.outcome, "unverifiable");
  assert.equal(decision.ok, false);
  assert.match(decision.message, /no echelon-foundry-design-system-1\.1\.0\.tgz asset/);
  assert.match(decision.message, /will not be modified/);
});

test("(d) asset listed but not downloaded: fail", () => {
  const decision = decideRelease({ tag: "v1.1.0", sha: SHA, assetName: ASSET, packed: manifest(PACKAGE), release: releaseWith() });
  assert.equal(decision.outcome, "unverifiable");
  assert.equal(decision.ok, false);
});

test("(d) downloaded asset that does not match the release's recorded digest: fail", () => {
  const decision = decideRelease({
    tag: "v1.1.0",
    sha: SHA,
    assetName: ASSET,
    packed: manifest(PACKAGE),
    release: releaseWith([{ name: ASSET, digest: "sha256:aaaa" }]),
    published: manifest(PACKAGE),
    publishedDigest: "bbbb"
  });
  assert.equal(decision.outcome, "unverifiable");
});

test("(d) tag on another commit with no release: cannot compare, fail", () => {
  const decision = decideRelease({ tag: "v1.1.0", sha: SHA, tagCommit: "c8f40b4", assetName: ASSET, packed: manifest(PACKAGE) });
  assert.equal(decision.outcome, "unverifiable");
  assert.equal(decision.ok, false);
});

test("non-regular tar entries never compare equal to files", () => {
  const asFile = manifestOf([{ path: "package/x", kind: "file", data: Buffer.from("") }]);
  const asLink = manifestOf([{ path: "package/x", kind: "type-2", data: Buffer.from("") }]);
  assert.equal(compareManifests(asFile, asLink).identical, false);
});

test("release-forma.yml decides with the content guard before creating a release", () => {
  const workflow = fs.readFileSync(".github/workflows/release-forma.yml", "utf8");
  const at = marker => {
    const index = workflow.indexOf(marker);
    assert.ok(index >= 0, `release-forma.yml is missing ${marker}`);
    return index;
  };
  assert.ok(at("- name: Pack release") < at("- name: Compare with published release"));
  assert.ok(at("- name: Compare with published release") < at("- name: Create GitHub release"));
  at("node tools/release-guard.mjs");
  at("GUARD_OUTCOME: ${{ steps.guard.outputs.outcome }}");
  assert.doesNotMatch(workflow, /tag_commit" != "\$GITHUB_SHA/, "the commit-identity guard must not come back");
});
