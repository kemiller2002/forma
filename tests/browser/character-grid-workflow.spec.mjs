import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { gridDocument, measureGrid } from "./character-grid-helpers.mjs";
import { render, states } from "../character-grid-workflow-states.mjs";

const P = "character-grid-workflow";
const screens = page => ({
  inquiry: page.getByRole("region", { name: "CUSTOMER INQUIRY" }),
  detail: page.getByRole("region", { name: "ACCOUNT DETAIL" }),
  history: page.getByRole("region", { name: "TRANSACTION HISTORY" })
});

// Test-side only: record native submitters per form, prevent navigation.
const recordSubmissions = page => page.evaluate(() => {
  window.submitted = [];
  document.querySelectorAll("form").forEach(form => form.addEventListener("submit", event => {
    event.preventDefault();
    window.submitted.push(`${form.closest(".ef-character-grid__viewport").getAttribute("aria-labelledby")}:${event.submitter.value}`);
  }));
});

const tabSequence = async (page, start, count) => {
  await page.locator(start).focus();
  const order = [];
  for (let step = 0; step < count; step += 1) {
    await page.keyboard.press("Tab");
    order.push(await page.evaluate(() => document.activeElement.id || document.activeElement.dataset.efAction));
  }
  return order;
};

test("three distinct 24x80 screens, every run on its declared cell", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.setContent(gridDocument(render("default")));
  for (const region of Object.values(screens(page))) await expect(region).toBeVisible();
  const grids = await measureGrid(page);
  expect(grids.length).toBe(3);
  for (const grid of grids) {
    expect([grid.applicationRows, grid.statusRows, grid.rowCount, grid.columnCount]).toEqual([24, 1, 25, 80]);
    for (const run of grid.runs) {
      expect(Math.abs(run.dx), run.id).toBeLessThanOrEqual(1);
      expect(Math.abs(run.dy), run.id).toBeLessThanOrEqual(1);
    }
  }
});

test("Customer Inquiry: deterministic Tab and Shift+Tab through six fields, then keys", async ({ page }) => {
  await page.setContent(gridDocument(render("default")));
  const forward = await tabSequence(page, `[aria-labelledby="${P}-cinq-title"]`, 11);
  expect(forward).toEqual([
    `${P}-cinq-custno`, `${P}-cinq-last`, `${P}-cinq-first`, `${P}-cinq-dob`, `${P}-cinq-postal`, `${P}-cinq-acct`,
    "enter", "clear", "reset", "pf1", "pf3"
  ]);
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  expect(await page.evaluate(() => document.activeElement.dataset.efAction)).toBe("reset");
});

test("Account Detail: protected data only, so Tab goes from the region straight to its keys", async ({ page }) => {
  await page.setContent(gridDocument(render("default")));
  await expect(screens(page).detail.getByRole("textbox")).toHaveCount(0);
  expect(await tabSequence(page, `[aria-labelledby="${P}-accd-title"]`, 5)).toEqual(["enter", "pf3", "pf5", "pf12", "pf1"]);
  await expect(screens(page).detail.getByText("not on file")).toBeVisible();
});

test("Transaction History: dates, then keys; dense rows keep header association and end-aligned amounts", async ({ page }) => {
  await page.setContent(gridDocument(render("default")));
  expect(await tabSequence(page, `[aria-labelledby="${P}-trnh-title"]`, 9)).toEqual([
    `${P}-trnh-from`, `${P}-trnh-to`, "enter", "pf3", "pf7", "pf8", "pf12", "reset", "pf1"
  ]);
  const table = screens(page).history.getByRole("table", { name: /Transactions for account/ });
  await expect(table.getByRole("row")).toHaveCount(13);
  await expect(table.getByRole("columnheader", { name: "Amount" })).toBeVisible();
  const rightEdges = await table.locator("tbody td:nth-child(3)").evaluateAll(cells =>
    cells.map(cell => {
      const range = document.createRange();
      range.selectNodeContents(cell);
      return Math.round(range.getBoundingClientRect().right);
    }));
  expect(new Set(rightEdges).size, "amounts share one right edge").toBe(1);
  await expect(table.getByRole("cell", { name: "RETURNED" })).toBeVisible();
});

test("Enter and PF affordances identify themselves natively on every screen", async ({ page }) => {
  await page.setContent(gridDocument(render("default")));
  await recordSubmissions(page);
  await screens(page).inquiry.getByRole("textbox", { name: "Last name" }).fill("RIVERA");
  await screens(page).inquiry.getByRole("textbox", { name: "Last name" }).press("Enter");
  await screens(page).detail.getByRole("button", { name: "PF5=Transactions" }).click();
  await screens(page).history.getByRole("button", { name: "PF8=Forward" }).click();
  await screens(page).history.getByRole("button", { name: "PF3=Return" }).click();
  expect(await page.evaluate(() => window.submitted)).toEqual([
    `${P}-cinq-title:enter`, `${P}-accd-title:pf5`, `${P}-trnh-title:pf8`, `${P}-trnh-title:pf3`
  ]);
});

test("validation state: the invalid field is described by its hint and the message", async ({ page }) => {
  await page.setContent(gridDocument(render("inquiry-validation")));
  const dob = page.getByRole("textbox", { name: "Date of birth" });
  await expect(dob).toHaveAttribute("aria-invalid", "true");
  await expect(dob).toHaveAccessibleDescription(/YYYY-MM-DD.*INVALID CINQ003E/);
  await expect(screens(page).inquiry.getByRole("alert")).toContainText("CINQ003E");
});

test("empty and error states are explicit text, never a blank table", async ({ page }) => {
  await page.setContent(gridDocument(render("history-empty")));
  await expect(page.getByRole("cell", { name: "No transactions between 2026-09-20 and 2026-09-27." })).toBeVisible();
  await expect(page.getByText("Rows 0 of 0")).toBeVisible();
  await page.setContent(gridDocument(render("history-error")));
  await expect(page.getByRole("cell", { name: "Transaction history is unavailable." })).toBeVisible();
  await expect(screens(page).history.getByRole("alert")).toContainText("TRNH009E");
  await expect(screens(page).history.getByRole("status").filter({ hasText: "X SYSTEM" })).toBeVisible();
});

test("SequentialReveal is used only for the inquiry title and is static under reduced motion", async ({ page }) => {
  await page.setContent(gridDocument(render("default")));
  const staged = await page.locator("[data-ef-reveal-run]").evaluateAll(runs => runs.map(run => run.id));
  expect(staged).toEqual([`${P}-cinq-title`]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(gridDocument(render("default")));
  expect(await page.locator(`#${P}-cinq-title`).evaluate(element => getComputedStyle(element).animationName)).toBe("none");
});

for (const width of [320, 390]) {
  test(`all three screens stay contained at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(gridDocument(render("default")));
    const grids = await measureGrid(page);
    for (const grid of grids) {
      expect(grid.pageWidth).toBeLessThanOrEqual(grid.viewportWidth + 1);
      expect(grid.viewportScrolls).toBeTruthy();
    }
  });
}

test("at 200% text size the screens remain aligned and contained", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.setContent(gridDocument(render("default"), { rootFontSize: "200%" }));
  for (const grid of await measureGrid(page)) {
    expect(grid.pageWidth).toBeLessThanOrEqual(grid.viewportWidth + 1);
    for (const run of grid.runs) expect(Math.abs(run.dy), run.id).toBeLessThanOrEqual(1);
  }
});

for (const name of ["default", ...Object.keys(states)]) {
  test(`reference workflow state "${name}" has no automatically detectable accessibility violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setContent(gridDocument(render(name)));
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}
