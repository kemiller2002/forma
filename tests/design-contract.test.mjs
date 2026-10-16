import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { DESIGN_CONTRACT, renderDesignContract, validateDesignContract } from "../tools/design-contract/index.mjs";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const validPath = "examples/design/valid/customer-form.forma-design.json";
const valid = read(validPath);

test("the supported design contract validates and renders deterministic native HTML", () => {
  assert.deepEqual(DESIGN_CONTRACT, { format: "forma.design", version: "1.0.0" });
  assert.deepEqual(validateDesignContract(valid), []);
  const html = renderDesignContract(valid);
  assert.equal(html, fs.readFileSync("patterns/form.html", "utf8"));
  assert.match(html, /<form class="ef-form"/);
  assert.match(html, /<label[^>]+for="nasa-mission-contact-email"/);
  assert.match(html, /<input type="email"[^>]+required/);
  assert.match(html, /<button type="submit">Save customer<\/button>/);
  assert.match(html, /<button type="reset">Reset form<\/button>/);
  assert.match(html, /role="status"/);
  assert.doesNotMatch(html, /<script\b|\son[a-z]+\s*=|javascript:/i);
});

test("unsupported design fixtures fail closed with stable diagnostics", () => {
  const expected = new Map([
    ["invalid-parent-child.forma-design.json", "DBC_LAYOUT_CHILD"],
    ["misaligned-standard-fields.forma-design.json", "DBC_STANDARD_ALIGNMENT"],
    ["missing-action-binding.forma-design.json", "DBC_ACTION_BINDING"],
    ["unsupported-standard-override.forma-design.json", "DBC_STANDARD_OVERRIDE"],
    ["unsupported-version.forma-design.json", "DBC_VERSION_UNSUPPORTED"]
  ]);
  for (const [name, code] of expected) {
    const document = read(path.join("examples/design/invalid", name));
    const findings = validateDesignContract(document);
    assert.ok(findings.some(item => item.code === code), `${name} must report ${code}: ${JSON.stringify(findings)}`);
    assert.throws(() => renderDesignContract(document), error => error.findings?.some(item => item.code === code));
  }
});

test("standard mode refuses undeclared presentation overrides before output", () => {
  const document = structuredClone(valid);
  document.root.children[0].children[0].overrides = { width: "37px" };
  const findings = validateDesignContract(document);
  assert.ok(findings.some(item => item.code === "DBC_STANDARD_OVERRIDE" && item.path.endsWith(".overrides")));
  assert.throws(() => renderDesignContract(document), /DBC_STANDARD_OVERRIDE/);
});

test("unknown members and empty field layouts are refused before rendering", () => {
  const unknown = structuredClone(valid);
  unknown.root.children[0].children[0].magicWidth = "37px";
  assert.ok(validateDesignContract(unknown).some(item => item.code === "DBC_UNKNOWN_MEMBER" && item.path.endsWith(".magicWidth")));

  const empty = structuredClone(valid);
  empty.root.children[0].children = [];
  assert.ok(validateDesignContract(empty).some(item => item.code === "DBC_FIELDS_REQUIRED"));
  assert.throws(() => renderDesignContract(empty), /DBC_FIELDS_REQUIRED/);
});

test("custom mode is an explicit audited escape path, never an implicit bypass", () => {
  const unsupported = structuredClone(valid);
  unsupported.mode = "custom";
  assert.deepEqual(validateDesignContract(unsupported).filter(item => item.code.startsWith("DBC_CUSTOM")).map(item => item.code), [
    "DBC_CUSTOM_REASON",
    "DBC_CUSTOM_EVIDENCE"
  ]);
  unsupported.customReason = "Specialist mission-layout research fixture.";
  unsupported.validationEvidence = ["EV-FORMA-DBC-CUSTOM-001"];
  assert.deepEqual(validateDesignContract(unsupported), []);
});

test("the CLI returns no rendered output for an invalid contract", () => {
  const result = spawnSync(process.execPath, ["tools/design-contract/cli.mjs", "render", "examples/design/invalid/unsupported-version.forma-design.json"], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /DBC_VERSION_UNSUPPORTED \$\.schemaVersion/);
});

test("published schema and capabilities pin the same supported version", () => {
  const schema = read("schemas/design/1.0/forma-design.schema.json");
  const capabilities = read("contracts/design-capabilities.json");
  assert.equal(schema.properties.format.const, DESIGN_CONTRACT.format);
  assert.equal(schema.properties.schemaVersion.const, DESIGN_CONTRACT.version);
  assert.deepEqual(capabilities.contractVersions, [DESIGN_CONTRACT.version]);
  assert.equal(capabilities.runtime, "none");
  assert.ok(capabilities.standardActionBindings.includes("form.submit"));
  assert.ok(capabilities.standardActionBindings.includes("form.reset"));
});
