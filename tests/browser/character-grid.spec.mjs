import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { gridDocument, measureGrid, pattern } from "./character-grid-helpers.mjs";

const expectAligned = (grid, label) => {
  expect(grid.uniformColumns, `${label}: equal-width columns`).toBeTruthy();
  expect(grid.uniformRows, `${label}: equal row pitch`).toBeTruthy();
  for (const run of grid.runs) {
    expect(Math.abs(run.dx), `${label}: ${run.id} x`).toBeLessThanOrEqual(1);
    expect(Math.abs(run.dy), `${label}: ${run.id} y`).toBeLessThanOrEqual(1);
    expect(Math.abs(run.dw), `${label}: ${run.id} width`).toBeLessThanOrEqual(1);
    expect(Math.abs(run.dh), `${label}: ${run.id} height`).toBeLessThanOrEqual(1);
  }
};

test("declared geometry produces exactly rows x columns cells", async ({ page }) => {
  await page.setContent(gridDocument(pattern("character-grid")));
  const [grid] = await measureGrid(page);
  expect([grid.rowCount, grid.columnCount]).toEqual([8, 40]);
});

for (const width of [1280, 390, 320]) {
  test(`runs land on their declared cells and the page never overflows at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(gridDocument(pattern("character-grid")));
    const [grid] = await measureGrid(page);
    expectAligned(grid, `${width}px`);
    expect(grid.pageWidth, `page-level overflow at ${width}px`).toBeLessThanOrEqual(grid.viewportWidth + 1);
  });
}

test("at 200% text size the grid scales with text, stays aligned, and stays contained", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(gridDocument(pattern("character-grid")));
  const [normal] = await measureGrid(page);
  await page.setContent(gridDocument(pattern("character-grid"), { rootFontSize: "200%" }));
  const [large] = await measureGrid(page);
  expect(large.columnWidth / normal.columnWidth).toBeGreaterThan(1.9);
  expectAligned(large, "200%");
  expect(large.viewportScrolls, "grid scrolls inside its own viewport").toBeTruthy();
  expect(large.pageWidth).toBeLessThanOrEqual(large.viewportWidth + 1);
});

test("the contained viewport is a named, keyboard-reachable region", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(gridDocument(pattern("character-grid")));
  const region = page.getByRole("region", { name: "SYSTEM OVERVIEW" });
  await expect(region).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(region).toBeFocused();
  await page.keyboard.press("ArrowRight");
  expect(await region.evaluate(element => element.scrollWidth > element.clientWidth)).toBeTruthy();
});

test("reflow is opt-in and linearizes runs in source order without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  const reflow = pattern("character-grid").replace('data-ef-narrow="contained"', 'data-ef-narrow="reflow"');
  await page.setContent(gridDocument(reflow));
  const [grid] = await measureGrid(page);
  expect(grid.display).toBe("flex");
  expect(grid.viewportScrolls).toBeFalsy();
  const order = await page.evaluate(() => {
    const runs = [...document.querySelectorAll(".ef-character-grid__surface [data-ef-row]")];
    const tops = runs.map(run => run.getBoundingClientRect().top);
    return tops.every((top, index) => index === 0 || top >= tops[index - 1] - 0.5);
  });
  expect(order, "visual order follows source order").toBeTruthy();
});

test("the base pattern has no automatically detectable accessibility violations", async ({ page }) => {
  await page.setContent(gridDocument(pattern("character-grid")));
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("the dl group keeps description-list semantics while children keep absolute cells", async ({ page }) => {
  await page.setContent(gridDocument(pattern("character-grid")));
  const semantics = await page.evaluate(() => {
    const list = document.querySelector("dl.ef-character-grid__group");
    return { display: getComputedStyle(list).display, terms: list.querySelectorAll("dt").length };
  });
  expect(semantics).toEqual({ display: "grid", terms: 3 });
  const snapshot = await page.locator("dl").ariaSnapshot();
  expect(snapshot).toMatch(/term/);
  expect(snapshot).toMatch(/definition/);
});
