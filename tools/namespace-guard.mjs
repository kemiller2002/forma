// Namespace guard (FORMA-NS-001.4). Forma 1.0.0 renamed its `ef-` namespace to
// `forma-`. This guard fails on any remaining pre-1.0 namespace token in the
// source CSS, in dist/ and in the packed npm tarball. It uses the codemod's
// own token definition: `--ef-*`, `data-ef-*`, `ef-*` at an identifier
// boundary and `dataset.efX`, so words such as `ref-`, `chef-` and `beef-`
// never count.
//
// Exempt, because they must spell the old namespace to do their job:
//   - CHANGELOG.md, which lists the rename;
//   - tools/NamespaceMigrator/, the codemod that performs it.
//
// Usage:
//   node tools/namespace-guard.mjs                 check src CSS, dist/ and a fresh npm pack
//   node tools/namespace-guard.mjs --tarball X.tgz check one packed tarball
//   node tools/namespace-guard.mjs --dir DIR       check every text file under DIR
// Exit status 0 when clean, 3 when anything is found.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SOURCE_CSS, extractTarball, packTarball } from "./brand-neutrality.mjs";

const BOUNDARY = String.raw`(?:(?<![A-Za-z0-9_$\-])|(?<=\\b))`;
export const LEGACY_TOKEN = new RegExp(`${BOUNDARY}(?:--ef-|data-ef-|ef-)[^\\s"'\`<>(){}\\[\\],;:]*|(?<=\\bdataset\\??\\.)ef[A-Z]\\w*`, "g");
const TEXT = /\.(?:css|html?|js|mjs|cjs|json|md|txt|fs|fsi|fsx|fsproj|svg|ya?ml)$/i;

export const exempt = (file) => path.basename(file) === "CHANGELOG.md" || /(?:^|\/)tools\/NamespaceMigrator\//.test(file.replaceAll(path.sep, "/"));

export const legacyTokens = (text) => [...text.matchAll(LEGACY_TOKEN)].map((m) => m[0]);

export const scanText = (file, text) => exempt(file) ? [] : legacyTokens(text).map((match) => ({ file, kind: "namespace", match }));

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? (["node_modules", "bin", "obj"].includes(entry.name) ? [] : walk(full)) : [full];
});

export const scanDirectory = (dir, label = dir) => walk(dir)
  .filter((file) => TEXT.test(file))
  .flatMap((file) => scanText(path.join(label, path.relative(dir, file)), fs.readFileSync(file, "utf8")));

export const scanSourceCss = (root = ".") =>
  SOURCE_CSS(root).flatMap((file) => scanText(file, fs.readFileSync(path.join(root, file), "utf8")));

export const scanTarball = (tarball) => scanDirectory(extractTarball(tarball), "tarball");

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
  const findings = option("--tarball") ? scanTarball(option("--tarball"))
    : option("--dir") ? scanDirectory(option("--dir"))
      : [...scanSourceCss(), ...scanDirectory("dist"), ...scanTarball(packTarball())];
  for (const finding of findings) process.stderr.write(`${finding.kind}\t${finding.file}\t${finding.match}\n`);
  process.stdout.write(`namespace guard: ${findings.length} legacy ef- token(s)\n`);
  process.exitCode = findings.length === 0 ? 0 : 3;
}
