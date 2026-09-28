import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const bundle = JSON.parse(fs.readFileSync("bundles/echelon-marketing.bundle.json", "utf8"));
const dist = bundle.outputDirectory;
const manifest = JSON.parse(fs.readFileSync(path.join(dist, "forma-marketing.manifest.json"), "utf8"));
const installer = path.resolve("actions/install-presentation/install.sh");
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const read = file => fs.readFileSync(path.join(dist, file), "utf8");

test("every bundle artifact exists, is versioned, and matches its manifest and checksum file", () => {
  assert.equal(manifest.forma, pkg.version);
  assert.equal(manifest.releaseTag, `v${pkg.version}`);
  assert.deepEqual(manifest.artifacts.map(a => a.file), bundle.artifacts.map(a => a.file));
  const sums = Object.fromEntries(read("forma-marketing.sha256").trim().split("\n").map(line => line.split(/\s+/).reverse()));
  for (const artifact of manifest.artifacts) {
    const file = path.join(dist, artifact.file);
    assert.ok(fs.existsSync(file), `missing ${artifact.file}`);
    assert.equal(sha(file), artifact.sha256, `${artifact.file} does not match the manifest`);
    assert.equal(sums[artifact.file], artifact.sha256, `${artifact.file} does not match the checksum file`);
    assert.equal(fs.statSync(file).size, artifact.bytes);
    assert.ok(read(artifact.file).startsWith(`/*! Forma ${pkg.version} | ${artifact.file}`), `${artifact.file} lacks its version header`);
  }
});

test("the bundler is deterministic", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ef-bundle-"));
  const outputs = ["a", "b"].map(run => {
    const definition = path.join(dir, `${run}.json`);
    fs.writeFileSync(definition, JSON.stringify({ ...bundle, outputDirectory: path.relative(process.cwd(), path.join(dir, run)) }));
    const result = spawnSync("dotnet", ["run", "--project", "tools/PresentationBundler/PresentationBundler.fsproj", "--", definition, "package.json"], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return path.join(dir, run);
  });
  for (const file of fs.readdirSync(dist)) {
    const expected = fs.readFileSync(path.join(dist, file));
    assert.deepEqual(fs.readFileSync(path.join(outputs[0], file)), expected, `${file} differs between runs`);
    assert.deepEqual(fs.readFileSync(path.join(outputs[1], file)), expected, `${file} differs between runs`);
  }
});

test("artifacts contain the expected foundations, components, layouts, and theme layers", () => {
  const generic = read("forma-marketing.css");
  for (const layer of ["echelon.tokens", "echelon.foundations", "echelon.marketing.foundations", "echelon.marketing.components", "echelon.marketing.layouts"]) {
    assert.match(generic, new RegExp(`@layer ${layer.replace(/\./g, "\\.")} \\{`), `forma-marketing.css lacks ${layer}`);
  }
  for (const component of [".ef-site-header", ".ef-site-nav__link", ".ef-hero", ".ef-card-grid", ".ef-cta", ".ef-site-footer", ".ef-skip-link", ".ef-doc"]) {
    assert.ok(generic.includes(component), `forma-marketing.css lacks ${component}`);
  }
  assert.doesNotMatch(generic, /@layer echelon\.theme/, "the generic layer must not carry a brand theme");

  const theme = read("forma-marketing-theme-echelon.css");
  assert.match(theme, /@layer echelon\.theme/);
  assert.match(theme, /--ef-color-status-success: #/);

  const complete = read("forma-echelon-marketing.css");
  assert.ok(complete.includes(generic.slice(generic.indexOf("/* --- source:"))), "complete bundle must contain the generic layer verbatim");
  assert.ok(complete.includes(theme.slice(theme.indexOf("/* --- source:"))), "complete bundle must contain the theme verbatim");
  assert.ok(complete.indexOf("@layer echelon.theme") > complete.indexOf("@layer echelon.marketing.layouts"), "theme must load after the generic layer");
});

test("artifacts are self-contained and runtime-free", () => {
  for (const artifact of manifest.artifacts) {
    const css = read(artifact.file);
    assert.doesNotMatch(css, /@import/i, `${artifact.file} imports another stylesheet`);
    assert.doesNotMatch(css, /<script|javascript:/i, `${artifact.file} contains script`);
    const urls = [...css.matchAll(/url\(\s*['"]?([^'")\s]+)/g)].map(m => m[1]).filter(u => !u.startsWith("data:"));
    assert.deepEqual(urls, [], `${artifact.file} references external files`);
  }
});

test("the bundler rejects a source that would make an artifact depend on other files", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ef-bundle-"));
  const bad = path.join(dir, "bad.css");
  fs.writeFileSync(bad, '@import "elsewhere.css";\n');
  const definition = path.join(dir, "bad.json");
  fs.writeFileSync(definition, JSON.stringify({
    schemaVersion: 1, name: "bad", description: "bad", outputDirectory: path.relative(process.cwd(), path.join(dir, "out")),
    artifacts: [{ file: "bad.css", description: "bad", sources: [path.relative(process.cwd(), bad)] }]
  }));
  const result = spawnSync("dotnet", ["run", "--project", "tools/PresentationBundler/PresentationBundler.fsproj", "--", definition, "package.json"], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /self-contained/);
});

function site(lockBody) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ef-site-"));
  fs.writeFileSync(path.join(dir, "forma.lock"), lockBody);
  return dir;
}

const install = (cwd, ...args) => spawnSync("bash", [installer, "--source", path.resolve(dist), ...args], { cwd, encoding: "utf8" });

test("an independent site pins, installs, and verifies the Echelon bundle without Node or npm", () => {
  const dir = site(`forma ${pkg.version}\ndestination assets/forma\nasset forma-echelon-marketing.css\n`);
  const pin = install(dir, "--update");
  assert.equal(pin.status, 0, pin.stderr);
  const lock = fs.readFileSync(path.join(dir, "forma.lock"), "utf8");
  assert.match(lock, new RegExp(`^forma ${pkg.version.replace(/\./g, "\\.")}$`, "m"), "the pinned version must be discoverable in the site repository");
  assert.match(lock, new RegExp(`asset forma-echelon-marketing\\.css sha256:${manifest.artifacts.find(a => a.file === "forma-echelon-marketing.css").sha256}`));

  const verify = install(dir);
  assert.equal(verify.status, 0, verify.stderr);
  assert.equal(sha(path.join(dir, "assets/forma/forma-echelon-marketing.css")), sha(path.join(dist, "forma-echelon-marketing.css")));
});

test("the installer refuses changed, missing, or unpinned assets", () => {
  const tampered = site(`forma ${pkg.version}\ndestination assets/forma\nasset forma-echelon-marketing.css sha256:${"0".repeat(64)}\n`);
  assert.equal(install(tampered).status, 3, "a checksum mismatch must fail");
  assert.equal(fs.existsSync(path.join(tampered, "assets/forma")), false, "nothing is installed after a mismatch");

  const missing = site(`forma ${pkg.version}\ndestination assets/forma\nasset forma-not-released.css sha256:${"0".repeat(64)}\n`);
  assert.equal(install(missing).status, 4);

  const floating = site("forma latest\ndestination assets/forma\nasset forma-echelon-marketing.css\n");
  assert.equal(install(floating).status, 2, "a floating version must be rejected");
});

test("the npm package also carries the marketing artifacts for npm-based sites", () => {
  assert.equal(pkg.exports["./marketing/*"], "./dist/marketing/*");
  const packed = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { encoding: "utf8" }))[0];
  const files = new Set(packed.files.map(f => f.path));
  for (const artifact of manifest.artifacts) assert.ok(files.has(`dist/marketing/${artifact.file}`), `package omits ${artifact.file}`);
  assert.ok(files.has("dist/marketing/forma-marketing.manifest.json"));
  assert.ok(files.has("docs/MARKETING-SITES.md"));
});
