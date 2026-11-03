import fs from "node:fs";
import { expect, test } from "@playwright/test";

// FMO-019: optional, application-owned requirement identity in rendered output. The fixture is the exact output of
// Forma.Workflow.RequirementIdentity (tests/workflow/Forma.Workflow.Tests/RequirementIdentityTests.fs checks it).
test.beforeEach(async ({ page }) => {
  await page.goto("/tests/browser/fixture/requirement-identity.html");
});

const byRequirement = (page, id) => page.locator(`[data-requirement-id="${id}"]`);

test("the identity is on the labelled control itself, which keeps its native role and accessible name", async ({ page }) => {
  await expect(byRequirement(page, "INV-001")).toHaveCount(1);
  // The same element through the primary locator tiers (role and accessible name) and through the identity tier.
  await expect(page.getByRole("textbox", { name: "Problem statement" })).toHaveAttribute("data-requirement-id", "INV-001");
  await expect(page.getByRole("textbox", { name: "Title" })).toHaveAttribute("data-requirement-id", "INV-002");
  await expect(page.getByRole("button", { name: "Start investigation" })).toHaveAttribute("data-requirement-id", "INV-004");
  await expect(byRequirement(page, "INV-001")).toBeEditable();
});

test("identity survives interaction and re-rendering of the same markup", async ({ page }) => {
  const field = byRequirement(page, "INV-002");
  await field.fill("Nightly build disk full");
  await expect(field).toHaveValue("Nightly build disk full");
  await page.reload();
  await expect(byRequirement(page, "INV-002")).toHaveCount(1);
  await expect(page.getByRole("textbox", { name: "Title" })).toHaveAttribute("data-requirement-id", "INV-002");
});

test("repeated controls share the ID and are told apart by distinct instance keys", async ({ page }) => {
  const repeated = byRequirement(page, "INV-009");
  await expect(repeated).toHaveCount(2);
  const keys = await repeated.evaluateAll((elements) => elements.map((e) => e.getAttribute("data-requirement-instance")));
  expect(new Set(keys).size).toBe(2);
  await expect(page.locator('[data-requirement-id="INV-009"][data-requirement-instance="H2"]')).toHaveAccessibleName("Edit hypothesis H2");
});

test("a hidden element carrying an ID is not visible, and a disabled one is not enabled", async ({ page }) => {
  await expect(byRequirement(page, "INV-090")).toHaveCount(1);
  await expect(byRequirement(page, "INV-090")).toBeHidden();
  await expect(byRequirement(page, "INV-091")).toBeDisabled();
});

test("no requirement ID is duplicated in the fixture's single scope", async ({ page }) => {
  const identities = await page
    .locator("[data-requirement-id]")
    .evaluateAll((elements) => elements.map((e) => `${e.getAttribute("data-requirement-id")}#${e.getAttribute("data-requirement-instance") ?? ""}`));
  expect(new Set(identities).size).toBe(identities.length);
});

test("the machine-operability contract documents requirement identity as optional, application-owned identity", () => {
  const contract = JSON.parse(fs.readFileSync("contracts/machine-operability.json", "utf8"));
  expect(contract.locatorPriority[2]).toBe("documented-application-owned-stable-object-identity");
  expect(contract.requirementIdentity.attribute).toBe("data-requirement-id");
  expect(contract.requirementIdentity.instanceAttribute).toBe("data-requirement-instance");
  expect(contract.requirementIdentity.required).toBe(false);
  expect(contract.requirementIdentity.locatorTier).toBe("documented-application-owned-stable-object-identity");
});
