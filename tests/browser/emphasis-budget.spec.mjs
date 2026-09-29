import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "dist", "all.css"), "utf8");
const pattern = fs.readFileSync(path.join(root, "patterns", "emphasis-budget.html"), "utf8");
const doc = (body, extra = "") => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Emphasis budget conformance</title><style>${css}</style><style>html,body{margin:0}body{padding:1rem}${extra}</style></head><body>${body}</body></html>`;

function validateBudgets(source) {
  const host = document.createElement("div");
  host.innerHTML = source;
  return [...host.querySelectorAll("[data-emphasis-budget]")].map(region => ({
    budget: region.getAttribute("data-emphasis-budget"),
    primary: region.querySelectorAll(":scope > [data-emphasis='primary']").length,
    nestedPrimary: region.querySelectorAll("[data-emphasis='primary']").length,
    unknown: [...region.querySelectorAll("[data-emphasis]")].filter(x => !["primary","secondary","supporting"].includes(x.getAttribute("data-emphasis"))).length
  }));
}

test("canonical emphasis budget has exactly one direct primary claimant", async ({ page }) => {
  await page.setContent(doc(pattern));
  const result = await page.evaluate(validateBudgets, pattern);
  expect(result).toEqual([{ budget: "one-primary", primary: 1, nestedPrimary: 1, unknown: 0 }]);
});

test("multiple primary claimants fail the one-primary contract", async ({ page }) => {
  const invalid = pattern.replace('<section data-emphasis="secondary"', '<section data-emphasis="primary"');
  await page.setContent(doc(invalid));
  const result = await page.evaluate(validateBudgets, invalid);
  expect(result[0].primary).toBe(2);
});

test("nested independent budgets may each have one primary", async ({ page }) => {
  const nested = `<div data-emphasis-budget="one-primary"><section data-emphasis="primary">Outer primary</section><div><div data-emphasis-budget="one-primary"><section data-emphasis="primary">Nested primary</section></div></div></div>`;
  await page.setContent(doc(nested));
  const directCounts = await page.evaluate(() => [...document.querySelectorAll("[data-emphasis-budget]")].map(region => [...region.children].filter(x => x.matches("[data-emphasis='primary']")).length));
  expect(directCounts).toEqual([1, 1]);
});

for (const width of [1280, 390, 320]) {
  test(`emphasis budget remains contained at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(doc(pattern));
    const result = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) }));
    expect(result.width).toBeLessThanOrEqual(result.viewport + 1);
    await expect(page.locator('[data-emphasis="primary"]')).toHaveCount(1);
  });
}

test("emphasis labels survive visual-channel dropout", async ({ page }) => {
  await page.setContent(doc(`<div class="dropout">${pattern}</div>`, `.dropout{filter:grayscale(1)}.dropout *{background:transparent!important;border-color:transparent!important;box-shadow:none!important}`));
  const pairs = await page.locator("[data-emphasis]").evaluateAll(elements => elements.map(el => ({
    emphasis: el.getAttribute("data-emphasis"),
    label: el.querySelector(":scope > .ef-emphasis-label")?.textContent?.trim().toLowerCase()
  })));
  expect(pairs).toEqual([
    { emphasis: "primary", label: "primary" },
    { emphasis: "secondary", label: "secondary" },
    { emphasis: "supporting", label: "supporting" },
    { emphasis: "supporting", label: "supporting" },
    { emphasis: "supporting", label: "supporting" }
  ]);
  await expect(page.getByText("Primary", { exact: true })).toBeVisible();
  await expect(page.getByText("Secondary", { exact: true })).toBeVisible();
  await expect(page.getByText("Supporting", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Unknown consumer outcome")).toBeVisible();
});

test("emphasis budget survives forced colors and 200% text", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(doc(pattern, "html{font-size:200%}"));
  const result = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) }));
  expect(result.width).toBeLessThanOrEqual(result.viewport + 1);
  await expect(page.getByRole("button", { name: "Reconcile consumer" })).toBeVisible();
});
