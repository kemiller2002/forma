import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { gridDocument, measureGrid, pattern } from "./character-grid-helpers.mjs";

// Per-row selection fields (GAP-TCG-10): a 5250-style option column in a
// positioned table, built only from public CharacterGrid contracts.
const source = pattern("character-grid-selection");
const focusedId = page => page.evaluate(() => document.activeElement?.id || document.activeElement?.dataset.efAction || document.activeElement?.className || "");

test("each selection field is a native textbox named by its column and row headers and described by the legend", async ({ page }) => {
  await page.setContent(gridDocument(source));
  const first = page.getByRole("textbox", { name: "Opt 00417-2231-09", exact: true });
  await expect(first).toBeVisible();
  await expect(first).toHaveAccessibleDescription(/^2=Change\s+4=Close\s+5=Display$/);
  await expect(page.getByRole("textbox", { name: /^Opt \d{5}-\d{4}-\d{2}$/ })).toHaveCount(5);
  const invalid = page.getByRole("textbox", { name: "Opt 00902-1177-40" });
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  await expect(invalid).toHaveAccessibleDescription(/2=Change\s+4=Close\s+5=Display\s+CHECK Option 9 is not valid/);
  await expect(page.getByRole("textbox", { name: "Opt 01233-0040-12" })).toBeDisabled();
});

test("the table keeps row and column header semantics around the fields", async ({ page }) => {
  await page.setContent(gridDocument(source));
  await expect(page.getByRole("table", { name: "Accounts, with a selection option per row" })).toBeVisible();
  await expect(page.getByRole("rowheader")).toHaveCount(5);
  await expect(page.getByRole("columnheader")).toHaveCount(5);
});

test("Tab and Shift+Tab visit selection fields row by row, then the keys, skipping the disabled row", async ({ page }) => {
  await page.setContent(gridDocument(source));
  await page.keyboard.press("Tab");
  expect(await focusedId(page)).toContain("ef-character-grid__viewport");
  const forward = [];
  for (let step = 0; step < 8; step += 1) {
    await page.keyboard.press("Tab");
    forward.push(await focusedId(page));
  }
  expect(forward).toEqual([
    "character-grid-selection-opt-1",
    "character-grid-selection-opt-2",
    "character-grid-selection-opt-3",
    "character-grid-selection-opt-4",
    "enter",
    "pf3",
    "pf5",
    "pf12"
  ]);
  const backward = [];
  for (let step = 0; step < 5; step += 1) {
    await page.keyboard.press("Shift+Tab");
    backward.push(await focusedId(page));
  }
  expect(backward).toEqual(["pf5", "pf3", "enter", "character-grid-selection-opt-4", "character-grid-selection-opt-3"]);
});

test("a selection field is exactly its declared cells and one row pitch, and native capacity matches", async ({ page }) => {
  await page.setContent(gridDocument(source));
  const [grid] = await measureGrid(page);
  const fields = await page.evaluate(() => [...document.querySelectorAll(".ef-character-grid__table .ef-character-grid__field")].map(field => {
    const box = field.getBoundingClientRect();
    return { id: field.id, width: box.width, height: box.height, len: Number(field.dataset.efLen), maxLength: field.maxLength };
  }));
  expect(fields).toHaveLength(5);
  for (const field of fields) {
    expect(field.maxLength, field.id).toBe(field.len);
    expect(Math.abs(field.width - field.len * grid.columnWidth), `${field.id} width`).toBeLessThanOrEqual(1);
    expect(Math.abs(field.height - grid.rowPitch), `${field.id} height`).toBeLessThanOrEqual(1);
  }
  expect(grid.uniformColumns && grid.uniformRows).toBeTruthy();
});

for (const width of [390, 320]) {
  test(`at ${width}px selection fields meet the 44px target inside their column and gutter, and the page never overflows`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(gridDocument(source));
    const rows = await page.evaluate(() => [...document.querySelectorAll(".ef-character-grid__table tbody tr")].map(row => {
      const field = row.querySelector("input").getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(row.querySelector("th"));
      return { width: field.width, height: field.height, right: field.right, next: range.getBoundingClientRect().left };
    }));
    for (const row of rows) {
      expect(row.width).toBeGreaterThanOrEqual(44);
      expect(row.height).toBeGreaterThanOrEqual(44);
      expect(row.right, "the target stays clear of the next column's text").toBeLessThanOrEqual(row.next + 0.5);
    }
    const [grid] = await measureGrid(page);
    expect(grid.pageWidth).toBeLessThanOrEqual(grid.viewportWidth + 1);
  });
}

test("field state cues survive forced colors", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.setContent(gridDocument(source));
  const styles = await page.evaluate(() => [...document.querySelectorAll(".ef-character-grid__table .ef-character-grid__field")].map(field => {
    const style = getComputedStyle(field);
    return { id: field.id, invalid: field.getAttribute("aria-invalid") === "true", bottom: style.borderBottomStyle, top: style.borderTopStyle };
  }));
  for (const field of styles) {
    expect(field.bottom, `${field.id} keeps a visible boundary`).not.toBe("none");
    if (field.invalid) expect([field.top, field.bottom], `${field.id} invalid shape cue`).toEqual(["dashed", "dashed"]);
  }
});

for (const width of [1280, 320]) {
  test(`the selection pattern has no automatically detectable accessibility violations at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(gridDocument(source));
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}
