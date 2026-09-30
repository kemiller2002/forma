import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

// The machine-readable diagram presentation contract (forma#88, FMD-STUDIO-001..004,
// FMD-EDIT-002, FMD-RESOLVE-004) must describe exactly what components.css renders,
// so consumers such as Forma Studio never need to scrape CSS.
const contract = JSON.parse(fs.readFileSync("contracts/diagram-presentation.json", "utf8"));
const css = fs.readFileSync("src/styles/components.css", "utf8");
const diagramCss = css.slice(css.indexOf("Diagram presentation (requirements/"), css.indexOf("BEGIN generated: character-grid"));

const attributeValues = (attribute) =>
  new Set([...diagramCss.matchAll(new RegExp(`\\[${attribute}="([^"]+)"\\]`, "g"))].map((match) => match[1]));

test("the contract is published by the package", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.equal(pkg.exports["./contracts/diagram-presentation.json"], "./contracts/diagram-presentation.json");
  assert.ok(pkg.files.includes("contracts/diagram-presentation.json"));
});

test("every class the contract names exists in the diagram CSS", () => {
  const classes = JSON.stringify(contract.elements).match(/"(ef-diagram[a-z_-]*)"/g).map((value) => value.slice(1, -1));
  for (const name of new Set(classes)) {
    assert.match(diagramCss, new RegExp(`\\.${name}(?![a-z_-])`), name);
  }
});

test("shape, line, group and value-state vocabularies match the CSS hooks", () => {
  const { node, connector, group, valueState } = contract.elements;
  assert.deepEqual(new Set(node.shapes.filter((shape) => shape !== node.defaultShape)), attributeValues("data-ef-shape"));
  assert.deepEqual(new Set(connector.lineStyles.filter((style) => style !== connector.defaultLineStyle)), attributeValues("data-ef-line"));
  assert.deepEqual(new Set(group.lineStyles.filter((style) => style !== "solid")), attributeValues("data-ef-line"));
  for (const variant of attributeValues("data-ef-group")) assert.ok(group.variants.includes(variant), variant);
  const styledStates = attributeValues("data-ef-value-state");
  for (const state of styledStates) assert.ok(valueState.states.includes(state), state);
});

test("every authored input custom property in the CSS is declared, and every declared one is read", () => {
  const declared = new Set([
    ...Object.values(contract.appearanceProperties).map((property) => property.customProperty),
    ...Object.values(contract.geometryProperties).filter((value) => value.startsWith("--"))
  ]);
  const read = new Set([...diagramCss.matchAll(/var\((--ef-diagram-[a-z-]+)/g)].map((match) => match[1]));
  const internal = new Set([...diagramCss.matchAll(/(--ef-diagram-(?:node|group)-[a-z]+):/g)].map((match) => match[1]));
  for (const property of declared) assert.ok(read.has(property), `${property} is declared but never read`);
  for (const property of read) {
    if (!internal.has(property)) assert.ok(declared.has(property), `${property} is read but not declared in the contract`);
  }
});

test("token references are real Forma color tokens", () => {
  const tokens = fs.readFileSync("dist/tokens.css", "utf8");
  for (const token of contract.color.tokenReferences) assert.match(tokens, new RegExp(`${token}:`), token);
});

test("editor-only adorners are declared outside the Forma-owned surface", () => {
  const owned = new Set(contract.ownership.forma);
  for (const adorner of contract.ownership.editorOnly) assert.ok(!owned.has(adorner), adorner);
  assert.ok(contract.ownership.consumer.includes("appearancePrecedence"));
  assert.equal(contract.color.paint, "solid");
});
