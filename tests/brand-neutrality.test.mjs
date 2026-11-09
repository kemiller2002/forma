// AIS-001.4: Forma's generic layer must not gain organization identity.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { AIS_MARKER, GENERIC_STYLESHEETS, aisBlock, echelonPalette, hexLiterals, identityCount, measure, paletteCount } from "./support/brand-neutrality.mjs";

const baseline = JSON.parse(fs.readFileSync("tests/fixtures/brand-neutrality-baseline.json", "utf8")).files;
const current = measure();

test("the baseline covers exactly the generic stylesheets", () => {
  assert.deepEqual(Object.keys(baseline).sort(), [...GENERIC_STYLESHEETS].sort());
});

for (const file of GENERIC_STYLESHEETS) {
  test(`${file} gains no Echelon identity`, () => {
    assert.ok(current[file].identity <= baseline[file].identity,
      `${file}: ${current[file].identity} Echelon identity references (baseline ${baseline[file].identity}). Put identity in a brand manifest or the application.`);
  });

  test(`${file} gains no Echelon palette literals`, () => {
    assert.ok(current[file].palette <= baseline[file].palette,
      `${file}: ${current[file].palette} Echelon-palette hex literals (baseline ${baseline[file].palette}). Use a semantic token without a brand-colored fallback.`);
  });
}

test("the AIS-001 rules contain no color literal and no organization name", () => {
  const block = aisBlock();
  assert.ok(block, `components.css must keep the marker "${AIS_MARKER}"`);
  assert.deepEqual(hexLiterals(block), []);
  assert.equal(identityCount(block), 0);
  assert.doesNotMatch(block.replace(/\/\*[\s\S]*?\*\//g, ""), /\brgb\(|\bhsl\(|\boklch\(/i);
});

test("brand-neutral patterns name no organization", () => {
  for (const file of ["patterns/app-identity.html", "patterns/startup.html"]) {
    assert.doesNotMatch(fs.readFileSync(file, "utf8"), /echelon/i, file);
  }
});

// Adversarial fixtures: the detectors must fire on the leaks they exist for.
test("detectors catch planted identity and palette leaks", () => {
  const palette = echelonPalette();
  assert.equal(identityCount(".x { background: url(/brand/echelon-logo.svg); }"), 2);
  assert.equal(identityCount('.x::after { content: "Echelon Foundry"; }'), 1);
  assert.equal(identityCount("@layer echelon.components { .x { color: red; } }"), 0);
  assert.equal(identityCount("/* Echelon */ .x {}"), 0);
  assert.equal(paletteCount(".x { color: var(--ef-color-accent-primary, #905831); }", palette), 1);
  assert.equal(paletteCount(".x { color: #905831; border-color: #FFF; }", palette), 1);
  assert.equal(paletteCount(".x { color: var(--ef-color-accent-primary); }", palette), 0);
  assert.deepEqual(hexLiterals(".x { color: #abc; }"), ["#aabbcc"]);
});

test("a stylesheet with an added Echelon literal would fail the ratchet", () => {
  const file = "src/styles/components.css";
  const planted = `${fs.readFileSync(file, "utf8")}\n.ef-leak { color: #905831; }\n`;
  assert.ok(paletteCount(planted, echelonPalette()) > baseline[file].palette);
});
