import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import test from "node:test";

// Package surface for the workflow capability (ADR-0006): the standard ships in
// the zero-runtime design-system package; the embeddable editor ships in the
// separate opt-in @echelon-foundry/forma-workflow package.
const core = JSON.parse(fs.readFileSync("package.json", "utf8"));
const workflow = JSON.parse(fs.readFileSync("packages/workflow/package.json", "utf8"));
const pack = (cwd) => new Set(JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd, encoding: "utf8" }))[0].files.map((f) => f.path));

test("the design-system package publishes the workflow schema, capability contract and examples, and no runtime", () => {
  assert.equal(core.exports["./workflow/forma-workflow.schema.json"], "./schemas/workflow/1.0/forma-workflow.schema.json");
  assert.equal(core.exports["./contracts/workflow-capabilities.json"], "./contracts/workflow-capabilities.json");
  const files = pack(".");
  for (const f of ["schemas/workflow/1.0/forma-workflow.schema.json", "contracts/workflow-capabilities.json", "examples/workflows/forma/workflows/minimal.forma-workflow.json", "docs/workflow/FORMAT.md"]) {
    assert.ok(files.has(f), `missing ${f}`);
  }
  for (const f of files) assert.ok(!/\.(js|mjs|cjs|wasm)$/.test(f) || !f.startsWith("dist/"), `runtime file ${f} in the core package`);
  assert.deepEqual(core.dependencies ?? {}, {});
  assert.ok(![...files].some((f) => f.startsWith("packages/") || f.startsWith("src/workflow/")), "editor sources are not in the core package");
});

test("the workflow package exposes a small public surface and no Studio code", () => {
  assert.equal(workflow.name, "@echelon-foundry/forma-workflow");
  assert.deepEqual(Object.keys(workflow.exports).sort(), [".", "./capabilities.json", "./engine/*", "./forma-workflow.css", "./forma-workflow.js", "./frame.html", "./frame.js", "./schema.json"]);
  assert.deepEqual(workflow.dependencies ?? {}, {});
  const files = pack("packages/workflow");
  for (const f of ["dist/forma-workflow.js", "dist/forma-workflow.css", "dist/frame.html", "dist/forma-workflow.schema.json", "dist/engine/_framework/dotnet.js"]) {
    assert.ok(files.has(f), `missing ${f}`);
  }
  for (const f of files) assert.ok(!/studio/i.test(f), `Studio file ${f}`);
});

test("the schema shipped in the workflow package is the published schema", () => {
  assert.equal(fs.readFileSync("packages/workflow/dist/forma-workflow.schema.json", "utf8"), fs.readFileSync("schemas/workflow/1.0/forma-workflow.schema.json", "utf8"));
});

test("the host element contains no workflow decisions: no validation, layout or schema logic in JavaScript", () => {
  const js = fs.readFileSync("packages/workflow/src/forma-workflow.js", "utf8");
  for (const forbidden of ["innerHTML = reply.html", "forma-workflow-host/1"]) assert.ok(js.includes(forbidden), forbidden);
  for (const decision of ["formatVersion", "\"nodes\"", "kindLabel", "palette:", "isSafeUrl", "eval(", "new Function"]) assert.ok(!js.includes(decision), `decision-like code: ${decision}`);
});
