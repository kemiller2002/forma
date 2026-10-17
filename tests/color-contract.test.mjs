import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import test from "node:test";
import { loadColorContract, validateCssColorReferences } from "../tools/color-contract/index.mjs";

const read = file => fs.readFileSync(file, "utf8");
const current = () => loadColorContract("contracts/color-contract.json");

test("generated public contract is deterministic and covers every released context", () => {
  const before = read("contracts/color-contract.json");
  execFileSync(process.execPath, ["tools/color-contract/build.mjs"], { stdio: "pipe" });
  assert.equal(read("contracts/color-contract.json"), before);
  const contract = current();
  assert.equal(contract.format, "forma.color-contract/1.0.0");
  assert.equal(contract.formaVersion, "0.9.0");
  assert.equal(contract.contexts.filter(item => item.kind === "theme").length, 18);
  assert.equal(contract.contexts.filter(item => item.kind === "brand").length, 4);
  const names = contract.publicTokens.map(token => token.name);
  for (const name of ["--ef-color-status-success", "--ef-color-status-warning", "--ef-color-status-danger", "--ef-color-status-info"]) assert.ok(names.includes(name));
  for (const context of contract.contexts) assert.deepEqual(Object.keys(context.values).sort(), names, `${context.kind} ${context.id} must implement the public contract exactly`);
  assert.ok(contract.publicTokens.every(token => token.source.file && token.source.path && token.provenance.kind === "generated" && Array.isArray(token.deprecatedAliases)));
  assert.ok(contract.internalVariables.public === false);
});

test("role table declares supported primitives and application extension boundaries", () => {
  const roles = new Map(current().rolePairings.map(role => [role.role, role]));
  for (const role of ["primary-action", "secondary-action", "link", "selection", "notice", "warning", "danger", "success", "disabled", "pending-or-unknown", "focus"]) {
    assert.equal(roles.get(role)?.classification, "supported-primitive", role);
    assert.ok(roles.get(role)?.nonColorCue, role);
  }
  assert.equal(roles.get("categorical-data-visualization")?.classification, "application-extension");
  assert.equal(roles.get("ordinal-data-visualization")?.classification, "application-extension");
});

test("Forma 0.6.1 refuses the four unsupported Summa spellings with actionable locations", () => {
  const contract = loadColorContract("tests/fixtures/color-contract/forma-0.6.1.json");
  const findings = validateCssColorReferences(read("tests/fixtures/color-contract/invalid.css"), { contract, file: "summa.css" });
  assert.deepEqual(findings.map(item => item.token), ["--ef-color-action-primary", "--ef-color-text-link", "--ef-color-focus", "--ef-color-text-danger"]);
  assert.deepEqual(findings.map(item => item.line), [1, 2, 3, 4]);
  assert.deepEqual(findings.map(item => item.suggestion), ["--ef-color-surface-inverse", "--ef-color-accent-primary", "--ef-color-focus-ring", "--ef-color-status-danger"]);
});

test("supported current references pass and application-owned variables are ignored", () => {
  assert.deepEqual(validateCssColorReferences(read("tests/fixtures/color-contract/valid.css"), { contract: current(), file: "valid.css" }), []);
  assert.deepEqual(validateCssColorReferences("color: var(--summa-state-danger, #900)", { contract: current() }), []);
});

test("internal Forma variables are separated from the public color contract", () => {
  const [finding] = validateCssColorReferences("color: var(--ef-tone-text)", { contract: current(), file: "consumer.css" });
  assert.equal(finding.code, "COLOR_INTERNAL_FORMA_VARIABLE");
  assert.match(finding.message, /internal implementation variable/);
});

test("unknown names fail closed despite a fallback and known literal fallbacks cannot invent a palette", () => {
  const contract = current();
  assert.equal(validateCssColorReferences("color: var(--ef-color-made-up, #ffffff)", { contract })[0].code, "COLOR_UNKNOWN_FORMA_TOKEN");
  assert.equal(validateCssColorReferences("color: var(--ef-color-text-primary, #000000)", { contract })[0].code, "COLOR_LITERAL_FALLBACK_MISMATCH");
  assert.deepEqual(validateCssColorReferences("color: var(--ef-color-text-primary, #171a18)", { contract }), []);
});

test("CLI validates without loading or copying Forma component CSS", () => {
  const valid = spawnSync(process.execPath, ["tools/color-contract/cli.mjs", "validate", "tests/fixtures/color-contract/valid.css"], { encoding: "utf8" });
  assert.equal(valid.status, 0, valid.stderr);
  assert.match(valid.stdout, /1 file\(s\): valid/);
  const invalid = spawnSync(process.execPath, ["tools/color-contract/cli.mjs", "validate", "--contract", "tests/fixtures/color-contract/forma-0.6.1.json", "tests/fixtures/color-contract/invalid.css"], { encoding: "utf8" });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /invalid\.css:1:\d+ COLOR_UNKNOWN_FORMA_TOKEN/);
});
