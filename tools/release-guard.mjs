#!/usr/bin/env node
// Release guard: decides whether release-forma.yml may publish package.json's
// version by comparing package CONTENT, not commits (WI-0068).
//
// A vX.Y.Z GitHub release is immutable. The old guard failed whenever main moved
// past the tagged commit, even when the packed package was byte-for-byte the
// same (a workflow, test or docs edit). This guard packs what the release would
// ship and compares it, file by file, with the tarball already published for
// that version:
//
//   create       no release (and no foreign tag) for this version -> publish it
//   noop         release exists and its package content is identical -> nothing to do
//   differs      release exists with different content -> bump package.json
//   unverifiable release (or tag) exists but its package asset cannot be compared
//
// Only `create` and `noop` succeed. The comparison is over the gzip-free tar
// entries: path -> sha256 of the file bytes. Tar/gzip headers (mtimes, owner,
// compression level) never take part, so two packs of the same files compare
// equal across machines and npm versions, while any change to a shipped file,
// or any file added or removed, does not.
//
// Everything above the CLI section is pure; the CLI reads files and reports.

import { createHash } from "node:crypto";
import fs from "node:fs";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const BLOCK = 512;

const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");

const field = (header, offset, length) => {
  const raw = header.subarray(offset, offset + length);
  const end = raw.indexOf(0);
  return raw.subarray(0, end === -1 ? length : end).toString("utf8");
};

const octal = (header, offset, length) => {
  const text = field(header, offset, length).trim();
  if (!/^[0-7]*$/.test(text)) throw new Error(`unsupported tar numeric field "${text}"`);
  return text === "" ? 0 : parseInt(text, 8);
};

// PAX extended header records: "<len> <key>=<value>\n".
const paxRecords = data => {
  const records = {};
  let rest = data.toString("utf8");
  while (rest.length > 0) {
    const space = rest.indexOf(" ");
    const length = Number(rest.slice(0, space));
    if (!Number.isInteger(length) || length <= space) throw new Error("malformed pax header");
    const record = rest.slice(space + 1, length - 1);
    const equals = record.indexOf("=");
    records[record.slice(0, equals)] = record.slice(equals + 1);
    rest = rest.slice(length);
  }
  return records;
};

const isZeroBlock = block => block.every(byte => byte === 0);

/**
 * Reads an uncompressed tar archive into its file entries.
 * Supports ustar (name + prefix), PAX `path` overrides and GNU long names,
 * which covers every archive `npm pack` writes. Directories are omitted; any
 * other non-regular entry is kept with `kind` so it cannot compare equal to a file.
 * @returns {{path: string, kind: string, data: Buffer}[]}
 */
export const readTar = tar => {
  const entries = [];
  let offset = 0;
  let pending = {};
  while (offset + BLOCK <= tar.length) {
    const header = tar.subarray(offset, offset + BLOCK);
    if (isZeroBlock(header)) break;
    const size = octal(header, 124, 12);
    const type = field(header, 156, 1) || "0";
    const data = tar.subarray(offset + BLOCK, offset + BLOCK + size);
    if (data.length !== size) throw new Error("truncated tar archive");
    offset += BLOCK + Math.ceil(size / BLOCK) * BLOCK;

    if (type === "x") { pending = { ...pending, ...paxRecords(data) }; continue; }
    if (type === "g") continue;
    if (type === "L") { pending = { ...pending, path: field(data, 0, data.length) }; continue; }

    const prefix = field(header, 345, 155);
    const name = field(header, 0, 100);
    const path = pending.path ?? (prefix ? `${prefix}/${name}` : name);
    pending = {};
    if (type === "5") continue;
    entries.push({ path, kind: type === "0" || type === "7" ? "file" : `type-${type}`, data });
  }
  return entries;
};

/** Maps each packed path to the sha256 of its bytes (non-files to their kind). */
export const manifestOf = entries =>
  new Map(
    entries
      .map(({ path, kind, data }) => [path, kind === "file" ? sha256(data) : kind])
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
  );

/** Reads a .tgz produced by `npm pack` into its content manifest. */
export const manifestOfTarball = gzipped => manifestOf(readTar(gunzipSync(gzipped)));

/** Pure: lists every path that is added, removed or changed between two manifests. */
export const compareManifests = (released, packed) => {
  const paths = [...new Set([...released.keys(), ...packed.keys()])].sort();
  const added = paths.filter(path => !released.has(path));
  const removed = paths.filter(path => !packed.has(path));
  const changed = paths.filter(path => released.has(path) && packed.has(path) && released.get(path) !== packed.get(path));
  return { identical: added.length + removed.length + changed.length === 0, added, removed, changed };
};

const bump = tag => `Bump package.json (and CHANGELOG.md) to a new version before releasing new package contents; ${tag} is immutable.`;

const summarize = ({ added, removed, changed }, limit = 20) =>
  [...added.map(p => `+ ${p}`), ...removed.map(p => `- ${p}`), ...changed.map(p => `~ ${p}`)]
    .slice(0, limit)
    .join("\n");

/**
 * Pure release decision.
 * @param {object} input
 * @param {string} input.tag            release tag for package.json's version, e.g. v1.1.0
 * @param {string} input.sha            commit being released
 * @param {string} input.assetName      file name `npm pack` produced
 * @param {Map}    input.packed         manifest of the freshly packed tarball
 * @param {string|null} input.tagCommit commit the git tag points to, or null
 * @param {object|null} input.release   GitHub release JSON for the tag, or null when none exists
 * @param {Map|null} input.published    manifest of the release's package asset, or null when not downloaded
 * @param {string|null} input.publishedDigest sha256 hex of the downloaded asset, or null
 * @returns {{outcome: "create"|"noop"|"differs"|"unverifiable", ok: boolean, message: string}}
 */
export const decideRelease = ({ tag, sha, assetName, packed, tagCommit = null, release = null, published = null, publishedDigest = null }) => {
  const fail = (outcome, message) => ({ outcome, ok: false, message });

  if (release === null) {
    if (tagCommit !== null && tagCommit !== sha) {
      return fail("unverifiable",
        `${tag} is already tagged at ${tagCommit} but has no GitHub release, so its package content cannot be compared with ${sha}. Create the release from the tag by hand, or: ${bump(tag)}`);
    }
    return { outcome: "create", ok: true, message: `${tag} has not been released; creating it from ${sha}.` };
  }

  const asset = (release.assets ?? []).find(candidate => candidate.name === assetName);
  if (!asset) {
    return fail("unverifiable",
      `${tag} is already released but has no ${assetName} asset to compare with. The release is immutable and will not be modified; ${bump(tag)}`);
  }
  if (published === null) {
    return fail("unverifiable", `${tag} lists ${assetName} but it was not downloaded, so the content cannot be compared. The release will not be modified.`);
  }
  const expectedDigest = typeof asset.digest === "string" && asset.digest.startsWith("sha256:") ? asset.digest.slice(7) : null;
  if (expectedDigest !== null && publishedDigest !== expectedDigest) {
    return fail("unverifiable", `${assetName} downloaded from ${tag} has sha256 ${publishedDigest}, but the release records ${expectedDigest}. Refusing to compare against a corrupt download.`);
  }

  const comparison = compareManifests(published, packed);
  if (comparison.identical) {
    return { outcome: "noop", ok: true, message: `${tag} is already released with identical package content (${packed.size} files); nothing to do.` };
  }
  const counts = `${comparison.added.length} added, ${comparison.removed.length} removed, ${comparison.changed.length} changed`;
  return fail("differs", `${tag} is already released with different package content (${counts}). ${bump(tag)}\n${summarize(comparison)}`);
};

// ---------------------------------------------------------------- CLI (I/O edge)

const parseArgs = argv =>
  argv.reduce((acc, arg, index) => (arg.startsWith("--") ? { ...acc, [arg.slice(2)]: argv[index + 1] ?? "" } : acc), {});

const optionalFile = path => (path && fs.existsSync(path) ? path : null);

const main = argv => {
  const args = parseArgs(argv);
  for (const required of ["packed", "tag", "sha"]) {
    if (!args[required]) throw new Error(`--${required} is required`);
  }
  const releasePath = optionalFile(args["release-json"]);
  const publishedPath = optionalFile(args.published);
  const publishedBytes = publishedPath ? fs.readFileSync(publishedPath) : null;
  const decision = decideRelease({
    tag: args.tag,
    sha: args.sha,
    assetName: args["asset-name"] || args.packed.split("/").pop(),
    packed: manifestOfTarball(fs.readFileSync(args.packed)),
    tagCommit: args["tag-commit"] || null,
    release: releasePath ? JSON.parse(fs.readFileSync(releasePath, "utf8")) : null,
    published: publishedBytes ? manifestOfTarball(publishedBytes) : null,
    publishedDigest: publishedBytes ? sha256(publishedBytes) : null
  });
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `outcome=${decision.outcome}\n`);
  if (decision.ok) {
    console.log(decision.message);
    return 0;
  }
  const [headline, ...detail] = decision.message.split("\n");
  console.log(`::error title=Forma release guard (${decision.outcome})::${headline}`);
  if (detail.length) console.log(detail.join("\n"));
  return 1;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  process.exitCode = main(process.argv.slice(2));
}
