import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { openFixture } from "./helpers.mjs";

const { version } = JSON.parse(fs.readFileSync("package.json", "utf8"));

test("Forma exposes its built package version through the Echelon runtime registry", async ({ page }) => {
  await openFixture(page);

  const runtime = await page.evaluate(() => window.__ECHELON_RUNTIME__);
  expect(runtime).toEqual({ schemaVersion: 1, libraries: { forma: { version } } });
});

test("registration is idempotent, order-independent, and diagnoses version conflicts", async ({ page }) => {
  await openFixture(page);

  const result = await page.evaluate(async currentVersion => {
    const module = await import("/dist/runtime.js");
    const warnings = [];
    const infos = [];
    const target = {
      console: {
        warn: message => warnings.push(String(message)),
        info: message => infos.push(String(message))
      }
    };
    const register = module.installEchelonRuntimeRegistrar(target);

    register("forma", { version: currentVersion });
    register("forma", { version: currentVersion });
    const duplicateWarnings = warnings.length;
    register("folio", { version: "folio-contract-fixture" });
    register("limen", { version: "limen-contract-fixture" });
    const forward = JSON.parse(JSON.stringify(target.__ECHELON_RUNTIME__));

    const reverseTarget = { console: { warn: () => {}, info: () => {} } };
    const reverse = module.installEchelonRuntimeRegistrar(reverseTarget);
    reverse("limen", { version: "limen-contract-fixture" });
    reverse("folio", { version: "folio-contract-fixture" });
    reverse("forma", { version: currentVersion });

    register("forma", { version: "999.0.0" });
    return {
      duplicateWarnings,
      warnings,
      infos,
      forward,
      reverse: JSON.parse(JSON.stringify(reverseTarget.__ECHELON_RUNTIME__))
    };
  }, version);

  expect(result.duplicateWarnings).toBe(0);
  expect(result.warnings).toEqual([`Echelon Runtime conflict: Forma v${version} is already registered; ignored v999.0.0.`]);
  expect(result.infos).toEqual([
    `Echelon Runtime · Forma v${version}`,
    "Echelon Runtime · Folio vfolio-contract-fixture",
    "Echelon Runtime · Limen vlimen-contract-fixture"
  ]);
  expect(result.forward).toEqual(result.reverse);
  expect(result.forward.libraries.forma.version).toBe(version);
});
