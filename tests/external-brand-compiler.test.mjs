// BNR-001.3: the F# BrandCompiler and TokenCompiler ship in the npm package,
// and an external theme package that compiles its manifest with the packed
// compiler gets exactly the bytes Forma's own build produces.
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { extractTarball, packTarball } from "../tools/brand-neutrality.mjs";

const packed = extractTarball(packTarball());
const external = "tests/fixtures/brands";

const run = (project, args) => {
  const result = spawnSync("dotnet", ["run", "--project", project, "--", ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);
};
const out = (name) => fs.mkdtempSync(path.join(os.tmpdir(), `forma-${name}-`));
const files = (dir) => fs.readdirSync(dir).sort();
const sameBytes = (a, b) => {
  assert.deepEqual(files(a), files(b));
  for (const file of files(a)) {
    assert.ok(fs.readFileSync(path.join(a, file)).equals(fs.readFileSync(path.join(b, file))), `${file} differs`);
  }
};

test("the package ships the compiler sources and project files", () => {
  for (const file of ["tools/BrandCompiler/BrandCompiler.fsproj", "tools/BrandCompiler/Program.fs",
    "tools/TokenCompiler/TokenCompiler.fsproj", "tools/TokenCompiler/Program.fs", "schemas/brand-manifest.schema.json"]) {
    assert.ok(fs.existsSync(path.join(packed, file)), `package omits ${file}`);
  }
  for (const dir of ["tools/BrandCompiler/bin", "tools/BrandCompiler/obj", "tools/TokenCompiler/bin", "tools/TokenCompiler/obj"]) {
    assert.ok(!fs.existsSync(path.join(packed, dir)), `package ships build output ${dir}`);
  }
});

test("an external manifest compiled with the packed BrandCompiler is byte-identical to Forma's own build", () => {
  const fromPackage = out("packed-brand");
  const fromForma = out("forma-brand");
  run(path.join(packed, "tools/BrandCompiler/BrandCompiler.fsproj"), [external, fromPackage]);
  run("tools/BrandCompiler/BrandCompiler.fsproj", [external, fromForma]);
  sameBytes(fromPackage, fromForma);
  const css = fs.readFileSync(path.join(fromPackage, "example-external.css"), "utf8");
  assert.match(css, /\[data-forma-brand="example-external"\]/);
});

test("the packed BrandCompiler reproduces Forma's shipped brand CSS byte for byte", () => {
  const fromPackage = out("packed-brands");
  run(path.join(packed, "tools/BrandCompiler/BrandCompiler.fsproj"), ["brands", fromPackage]);
  sameBytes(fromPackage, "dist/brands");
});

test("the packed TokenCompiler reproduces Forma's shipped tokens.css byte for byte", () => {
  const output = path.join(out("packed-tokens"), "tokens.css");
  run(path.join(packed, "tools/TokenCompiler/TokenCompiler.fsproj"), [path.join(packed, "tokens/forma.tokens.json"), output]);
  assert.ok(fs.readFileSync(output).equals(fs.readFileSync("dist/tokens.css")), "packed TokenCompiler output differs from dist/tokens.css");
});
