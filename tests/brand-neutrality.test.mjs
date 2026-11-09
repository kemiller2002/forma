// AIS-001.4: Forma's generic layer must not gain organization identity.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { AIS_MARKER, GENERIC_STYLESHEETS, aisBlock, colorLiterals, echelonPalette, hexLiterals, identityCount, measure, paletteCount } from "./support/brand-neutrality.mjs";

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
  assert.deepEqual(colorLiterals(block), []);
  assert.equal(identityCount(block), 0);
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
  assert.equal(paletteCount(".x { color: #905831cc; }", palette), 1);
  assert.equal(identityCount(".x { background: url(/assets/echelon.brand.svg); }"), 1);
  for (const leak of ["#905831cc", "rgba(144, 88, 49, 1)", "hwb(25 19% 44%)", "oklch(50% 0.1 50)", "color(srgb 1 0 0)", "sienna", "white"]) {
    assert.ok(colorLiterals(`.x { border-color: ${leak}; }`).length > 0, leak);
  }
  for (const allowed of ["Canvas", "CanvasText", "currentColor", "transparent", "inherit", "var(--ef-color-accent-primary, CanvasText)"]) {
    assert.deepEqual(colorLiterals(`.x { color: ${allowed}; }`), [], allowed);
  }
  assert.deepEqual(colorLiterals('.x::after { content: "white"; }'), []);
});

test("a stylesheet with an added Echelon literal would fail the ratchet", () => {
  const file = "src/styles/components.css";
  const planted = `${fs.readFileSync(file, "utf8")}\n.ef-leak { color: #905831; }\n`;
  assert.ok(paletteCount(planted, echelonPalette()) > baseline[file].palette);
});
