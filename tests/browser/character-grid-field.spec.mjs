import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { gridDocument, measureGrid, pattern } from "./character-grid-helpers.mjs";

const source = pattern("character-grid-field");
const focusedId = page => page.evaluate(() => document.activeElement?.id || document.activeElement?.className || "");

test("fields expose native textbox semantics with names that exclude decorative leaders", async ({ page }) => {
  await page.setContent(gridDocument(source));
  for (const name of ["Account", "Reference", "Amount", "Branch", "Session"]) {
    await expect(page.getByRole("textbox", { name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("textbox")).toHaveCount(5);
});

test("required, invalid, disabled, and read-only states are native and exposed", async ({ page }) => {
  await page.setContent(gridDocument(source));
  await expect(page.getByRole("textbox", { name: "Account" })).toHaveAttribute("required", "");
  await expect(page.getByRole("textbox", { name: "Account" })).toHaveAccessibleDescription("(required, 12 digits)");
  await expect(page.getByRole("textbox", { name: "Amount" })).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("textbox", { name: "Amount" })).toHaveAccessibleDescription(/Amount must contain digits only/);
  await expect(page.getByRole("textbox", { name: "Branch" })).toBeDisabled();
  await expect(page.getByRole("textbox", { name: "Session" })).not.toBeEditable();
});

test("protected values are text, not controls, and are never focusable", async ({ page }) => {
  await page.setContent(gridDocument(source));
  const protectedFocusable = await page.evaluate(() =>
    [...document.querySelectorAll(".ef-character-grid__text, .ef-character-grid__value")]
      .filter(element => element.matches("input, select, textarea, button, [tabindex]")).length);
  expect(protectedFocusable).toBe(0);
  await expect(page.getByText("2014-03-11")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Opened" })).toHaveCount(0);
});

test("Tab and Shift+Tab follow row-major order and skip disabled fields", async ({ page }) => {
  await page.setContent(gridDocument(source));
  const forward = [];
  await page.keyboard.press("Tab");
  expect(await focusedId(page)).toContain("ef-character-grid__viewport");
  for (let step = 0; step < 4; step += 1) {
    await page.keyboard.press("Tab");
    forward.push(await focusedId(page));
  }
  expect(forward).toEqual([
    "character-grid-field-account",
    "character-grid-field-reference",
    "character-grid-field-amount",
    "character-grid-field-session"
  ]);
  const backward = [];
  for (let step = 0; step < 3; step += 1) {
    await page.keyboard.press("Shift+Tab");
    backward.push(await focusedId(page));
  }
  expect(backward).toEqual([
    "character-grid-field-amount",
    "character-grid-field-reference",
    "character-grid-field-account"
  ]);
});

test("field capacity equals its declared length", async ({ page }) => {
  await page.setContent(gridDocument(source));
  const field = page.getByRole("textbox", { name: "Account" });
  await field.fill("");
  await field.pressSequentially("12345678901234567890");
  await expect(field).toHaveValue("123456789012");
  const [grid] = await measureGrid(page);
  const run = grid.runs.find(item => item.id === "character-grid-field-account");
  expect(Math.abs(run.dw)).toBeLessThanOrEqual(1);
});

test("state cues differ by shape, not only by color, and survive forced colors", async ({ page }) => {
  await page.setContent(gridDocument(source));
  const cues = () => page.evaluate(() => Object.fromEntries(
    ["account", "reference", "amount", "branch", "session"].map(key => {
      const style = getComputedStyle(document.getElementById(`character-grid-field-${key}`));
      return [key, { bottom: style.borderBottomStyle, width: style.borderBottomWidth, top: style.borderTopStyle, left: style.borderLeftStyle }];
    })));
  const normal = await cues();
  expect(normal.reference.bottom).toBe("solid");
  expect(normal.account.bottom).toBe("double");
  expect([normal.amount.top, normal.amount.bottom]).toEqual(["dashed", "dashed"]);
  expect(normal.amount.left, "no inline border: the field stays exactly its cells").toBe("none");
  expect(normal.branch.bottom).toBe("dotted");
  expect(normal.session.width).toBe("1px");
  await page.emulateMedia({ forcedColors: "active" });
  const forced = await cues();
  expect(forced).toEqual(normal);
});

test("at 320px fields meet the 44px target guideline without moving their cells", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(gridDocument(source));
  const sizes = await page.evaluate(() =>
    [...document.querySelectorAll(".ef-character-grid__field")].map(field => {
      const rect = field.getBoundingClientRect();
      return { id: field.id, width: rect.width, height: rect.height };
    }));
  for (const size of sizes) {
    expect(size.height, `${size.id} height`).toBeGreaterThanOrEqual(43.5);
    expect(size.width, `${size.id} width`).toBeGreaterThanOrEqual(43.5);
  }
  const [grid] = await measureGrid(page);
  for (const run of grid.runs) {
    expect(Math.abs(run.dx), `${run.id} x`).toBeLessThanOrEqual(1);
    expect(Math.abs(run.dy), `${run.id} y`).toBeLessThanOrEqual(1);
  }
  expect(grid.pageWidth).toBeLessThanOrEqual(grid.viewportWidth + 1);
});

test("the field pattern has no automatically detectable accessibility violations", async ({ page }) => {
  await page.setContent(gridDocument(source));
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});
