import fs from "node:fs";
import { expect, test } from "@playwright/test";

const read = (path) => fs.readFileSync(path, "utf8");

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/browser/fixture/index.html");
});

test("native controls are discoverable and operable through semantic locators", async ({ page }) => {
  const notifications = page.getByRole("switch", { name: "Notifications" });
  await expect(notifications).not.toBeChecked();
  await notifications.check();
  await expect(notifications).toBeChecked();

  const density = page.getByRole("radio", { name: "Compact" });
  await density.check();
  await expect(density).toBeChecked();

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(notifications).not.toBeChecked();
});

test("machine-visible state is authoritative rather than animation or color", async ({ page }) => {
  const notifications = page.getByRole("switch", { name: "Notifications" });
  await notifications.check();
  await expect(notifications).toHaveJSProperty("checked", true);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await notifications.uncheck();
  await expect(notifications).toHaveJSProperty("checked", false);
});

test("direct-manipulation examples retain a semantic non-drag path", async ({ page }) => {
  await page.setContent(`<!doctype html><html lang="en"><body>${read("patterns/reorder-states.html")}</body></html>`);
  await expect(page.getByRole("button", { name: "Move Delivery speed up" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Move Reliability up" })).toBeDisabled();
  await expect(page.getByText("Order unchanged.")).toBeVisible();
});

test("spatial objects are reachable by semantic controls and stable native targets", async ({ page }) => {
  await page.setContent(`<!doctype html><html lang="en"><body>${read("patterns/spatial-canvas.html")}</body></html>`);

  await expect(page.getByRole("button", { name: "Zoom out" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset view" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Zoom in" })).toBeVisible();

  const billing = page.getByRole("link", { name: "Billing" });
  await billing.click();
  await expect(page.locator("#billing")).toBeVisible();
  expect(new URL(page.url()).hash).toBe("#billing");
});

test("the published contract rejects brittle automation as the only interaction path", async () => {
  const contract = JSON.parse(read("contracts/machine-operability.json"));
  expect(contract.referenceAutomation).toBe("Playwright");
  expect(contract.toolNeutral).toBe(true);
  expect(contract.locatorPriority[0]).toBe("role-and-accessible-name");
  expect(contract.forbiddenAsOnlyPublicPath).toContain("hard-coded-screen-coordinates");
  expect(contract.forbiddenAsOnlyPublicPath).toContain("fixed-sleep-completion");
  expect(contract.forbiddenAsOnlyPublicPath).toContain("dom-position-or-nth-child-locators");
});
