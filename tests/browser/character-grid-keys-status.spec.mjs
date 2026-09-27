import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { gridDocument, measureGrid, pattern } from "./character-grid-helpers.mjs";

const keys = pattern("character-grid-keys");
const status = pattern("character-grid-status");

// Test-side instrumentation only: records which native submitter fired and
// prevents navigation. Forma itself ships no script.
const recordSubmissions = page => page.evaluate(() => {
  window.submissions = [];
  document.querySelector("form").addEventListener("submit", event => {
    event.preventDefault();
    window.submissions.push(event.submitter?.value ?? null);
  });
});
const submissions = page => page.evaluate(() => window.submissions);

test("action keys are buttons whose accessible names are their visible text", async ({ page }) => {
  await page.setContent(gridDocument(keys));
  for (const name of ["Enter=Search", "Clear=Erase", "Reset=Unlock", "PF1=Help", "PF3=Exit", "PF12=Cancel", "PF7=Back", "PF8=Forward", "F10=Export CSV"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("group", { name: "Function keys" })).toBeVisible();
});

test("pressing Enter in a field submits through the Enter key (native default button)", async ({ page }) => {
  await page.setContent(gridDocument(keys));
  await recordSubmissions(page);
  await page.getByRole("textbox", { name: "Record" }).fill("R-1042");
  await page.getByRole("textbox", { name: "Record" }).press("Enter");
  expect(await submissions(page)).toEqual(["enter"]);
});

test("PF and Clear keys identify themselves natively and bypass validation; Enter does not", async ({ page }) => {
  await page.setContent(gridDocument(keys));
  await recordSubmissions(page);
  await page.getByRole("button", { name: "Enter=Search" }).click();
  expect(await submissions(page), "required field blocks Enter").toEqual([]);
  await page.getByRole("button", { name: "PF3=Exit" }).click();
  await page.getByRole("button", { name: "Clear=Erase" }).click();
  expect(await submissions(page)).toEqual(["pf3", "clear"]);
});

test("Reset is local: it neither submits nor resets field values", async ({ page }) => {
  await page.setContent(gridDocument(keys));
  await recordSubmissions(page);
  await page.getByRole("textbox", { name: "Record" }).fill("R-1042");
  await page.getByRole("button", { name: "Reset=Unlock" }).click();
  expect(await submissions(page)).toEqual([]);
  await expect(page.getByRole("textbox", { name: "Record" })).toHaveValue("R-1042");
});

test("unavailable keys are disabled with a non-color cue", async ({ page }) => {
  await page.setContent(gridDocument(keys));
  const back = page.getByRole("button", { name: "PF7=Back" });
  await expect(back).toBeDisabled();
  expect(await back.evaluate(element => getComputedStyle(element).textDecorationLine)).toContain("line-through");
});

test("Tab reaches the field, then keys in row-major order, skipping disabled keys", async ({ page }) => {
  await page.setContent(gridDocument(keys));
  await page.keyboard.press("Tab");
  const order = [];
  for (let step = 0; step < 9; step += 1) {
    await page.keyboard.press("Tab");
    order.push(await page.evaluate(() => document.activeElement.dataset.efAction ?? document.activeElement.id));
  }
  expect(order).toEqual(["character-grid-keys-record", "enter", "clear", "reset", "pf1", "pf3", "pf12", "pf8", "export"]);
});

test("keys meet the 44px target guideline at 320px and stay on their cells", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(gridDocument(keys));
  const sizes = await page.locator(".ef-character-grid__key").evaluateAll(buttons =>
    buttons.map(button => ({ width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height })));
  for (const size of sizes) {
    expect(size.width).toBeGreaterThanOrEqual(43.5);
    expect(size.height).toBeGreaterThanOrEqual(43.5);
  }
  const [grid] = await measureGrid(page);
  for (const run of grid.runs) expect(Math.abs(run.dx), run.id).toBeLessThanOrEqual(1);
  expect(grid.pageWidth).toBeLessThanOrEqual(grid.viewportWidth + 1);
});

test("messages and system status are live regions with visible severity words", async ({ page }) => {
  await page.setContent(gridDocument(status));
  await expect(page.getByRole("alert")).toContainText("ERROR BTX009E");
  await expect(page.getByRole("status")).toContainText("X SYSTEM");
});

test("severity cues do not rely on color and survive forced colors", async ({ page }) => {
  const severities = ["information", "success", "warning", "validation", "error"];
  const cue = async severity => {
    await page.setContent(gridDocument(status.replace('data-ef-severity="error"', `data-ef-severity="${severity}"`)));
    return page.locator(".ef-character-grid__severity").evaluate(element => {
      const style = getComputedStyle(element);
      return [style.textDecorationLine, style.textDecorationStyle, style.outlineStyle, style.fontWeight].join("|");
    });
  };
  const normal = [];
  for (const severity of severities) normal.push(await cue(severity));
  expect(new Set(normal.slice(2)).size, "warning, validation, and error differ in shape").toBe(3);
  await page.emulateMedia({ forcedColors: "active" });
  const errorForced = await cue("error");
  expect(errorForced).toContain("solid");
  const indicator = await page.locator(".ef-character-grid__indicator").evaluate(element => getComputedStyle(element).outlineStyle);
  expect(indicator).toBe("solid");
});

for (const [name, source] of [["keys", keys], ["status", status]]) {
  test(`the ${name} pattern has no automatically detectable accessibility violations`, async ({ page }) => {
    await page.setContent(gridDocument(source));
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}
