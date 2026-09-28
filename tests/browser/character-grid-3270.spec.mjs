import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { gridDocument, measureGrid, pattern } from "./character-grid-helpers.mjs";

const source = pattern("character-grid-3270");
const to32x80 = html => html
  .replace('data-ef-rows="24"', 'data-ef-rows="32"')
  .replace(/data-ef-row="(\d+)"/g, (match, row) => (Number(row) >= 21 ? `data-ef-row="${Number(row) + 8}"` : match));

// At touch pitch a field shorter than five cells widens to 2.75rem by design
// (CG-13 reserves blank cells for it), so only its origin is compared there.
const expectAligned = (grid, { touch = false } = {}) => {
  for (const run of grid.runs) {
    expect(Math.abs(run.dx), `${run.id} x`).toBeLessThanOrEqual(1);
    expect(Math.abs(run.dy), `${run.id} y`).toBeLessThanOrEqual(1);
    if (!(touch && run.id === "character-grid-3270-option")) {
      expect(Math.abs(run.dw), `${run.id} width`).toBeLessThanOrEqual(1);
    }
  }
};

test("24x80 integrity: every run on its declared cell", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.setContent(gridDocument(source));
  const [grid] = await measureGrid(page);
  // 24 application rows plus one device status row (the OIA).
  expect([grid.applicationRows, grid.statusRows, grid.rowCount, grid.columnCount]).toEqual([24, 1, 25, 80]);
  expectAligned(grid);
});

test("32x80 integrity: the same screen with reserved rows at 29-32 and status at 33", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1100 });
  await page.setContent(gridDocument(to32x80(source)));
  const [grid] = await measureGrid(page);
  expect([grid.applicationRows, grid.statusRows, grid.rowCount, grid.columnCount]).toEqual([32, 1, 33, 80]);
  expectAligned(grid);
  const status = await page.getByRole("status").filter({ hasText: "READY" }).boundingBox();
  const surface = await page.locator(".ef-character-grid__surface").boundingBox();
  expect(status.y + status.height).toBeGreaterThan(surface.y + surface.height * 0.9);
});

test("the OIA status row renders after the application rows, aligned to the same columns", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.setContent(gridDocument(source));
  const [grid] = await measureGrid(page);
  const status = page.getByRole("status").filter({ hasText: "READY" });
  const statusBox = await status.boundingBox();
  const lastKeyBox = await page.locator('.ef-character-grid__key[data-ef-row="23"]').boundingBox();
  expect(statusBox.y).toBeGreaterThanOrEqual(lastKeyBox.y + grid.rowPitch - 1);
  const statusRun = grid.runs.find(run => run.id === "p:25:2");
  expect(Math.abs(statusRun.dx), "status starts on column 2 of the shared tracks").toBeLessThanOrEqual(1);
  expect(Math.abs(statusRun.dy), "status sits on row 25").toBeLessThanOrEqual(1);
  // Device status is presentation of state, never a focus stop.
  await page.locator("#character-grid-3270-option").focus();
  const stops = await page.evaluate(() => [...document.querySelectorAll(".ef-character-grid__status, .ef-character-grid__status *")]
    .filter(element => element.tabIndex >= 0).length);
  expect(stops).toBe(0);
  // The profile's rule over the row is a cue added to the visible READY word.
  expect(await status.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe("none");
  await page.setContent(gridDocument(source.replace(' data-ef-profile="ibm-3270"', "")));
  expect(await page.getByRole("status").filter({ hasText: "READY" }).evaluate(element => getComputedStyle(element).boxShadow)).toBe("none");
});

test("the device status row is reserved: no layout shift while status is empty or not yet rendered", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const surfaceHeight = async html => {
    await page.setContent(gridDocument(html));
    return page.locator(".ef-character-grid__surface").evaluate(element => element.getBoundingClientRect().height);
  };
  const statusRun = /<p class="ef-character-grid__status"[^>]*>.*?<\/p>/s;
  const withStatus = await surfaceHeight(source);
  const emptyStatus = await surfaceHeight(source.replace(statusRun, match => match.replace(/>.*<\/p>$/s, "></p>")));
  const noStatus = await surfaceHeight(source.replace(statusRun, ""));
  expect(Math.abs(emptyStatus - withStatus)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(noStatus - withStatus)).toBeLessThanOrEqual(0.5);
});

test("the profile changes presentation only: geometry is identical with and without it", async ({ page }) => {
  await page.setContent(gridDocument(source));
  const [profiled] = await measureGrid(page);
  await page.setContent(gridDocument(source.replace(' data-ef-profile="ibm-3270"', "")));
  const [plain] = await measureGrid(page);
  expect(profiled.columnWidth).toBeCloseTo(plain.columnWidth, 3);
  expect(profiled.rowPitch).toBeCloseTo(plain.rowPitch, 3);
  expect(profiled.runs.map(run => run.id)).toEqual(plain.runs.map(run => run.id));
});

test("the profile evokes a 3270: dark screen, protected and unprotected colors differ, block cursor cue", async ({ page }) => {
  await page.setContent(gridDocument(source));
  const colors = await page.evaluate(() => {
    const style = selector => getComputedStyle(document.querySelector(selector));
    return {
      background: style(".ef-character-grid__viewport").backgroundColor,
      protectedText: style(".ef-character-grid__text").color,
      field: style(".ef-character-grid__field").color,
      font: style(".ef-character-grid__surface").fontFamily
    };
  });
  expect(colors.background).toBe("rgb(0, 0, 0)");
  // Regression: foundation rules for p/h*/label must not leak color or measure into runs.
  const paragraph = await page.locator("p.ef-character-grid__text").evaluate(element => {
    const style = getComputedStyle(element);
    return { color: style.color, maxWidth: style.maxInlineSize };
  });
  expect(paragraph).toEqual({ color: "rgb(122, 167, 255)", maxWidth: "none" });
  expect(colors.protectedText).not.toBe(colors.field);
  expect(colors.font).toMatch(/mono/i);
  const option = page.getByRole("textbox", { name: "Option" });
  await option.focus();
  const focused = await option.evaluate(element => {
    const style = getComputedStyle(element);
    return { outline: style.outlineStyle, background: style.backgroundColor };
  });
  expect(focused.outline).toBe("solid");
  expect(focused.background).toBe("rgb(16, 48, 28)");
});

test("keyboard-first: Tab goes region, command line, then keys; Enter submits through Enter", async ({ page }) => {
  await page.setContent(gridDocument(source));
  await page.evaluate(() => {
    window.submitted = [];
    document.querySelector("form").addEventListener("submit", event => {
      event.preventDefault();
      window.submitted.push(event.submitter.value);
    });
  });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("textbox", { name: "Option" })).toBeFocused();
  await page.keyboard.type("3");
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => window.submitted)).toEqual(["enter"]);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Enter=Select" })).toBeFocused();
});

for (const width of [320, 390]) {
  test(`the 24x80 profile stays contained at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(gridDocument(source));
    const [grid] = await measureGrid(page);
    expect(grid.pageWidth).toBeLessThanOrEqual(grid.viewportWidth + 1);
    expect(grid.viewportScrolls).toBeTruthy();
    expectAligned(grid, { touch: true });
  });
}

test("the 3270 profile has no automatically detectable accessibility violations, including contrast", async ({ page }) => {
  await page.setContent(gridDocument(source));
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  expect(results.passes.some(rule => rule.id === "color-contrast")).toBeTruthy();
});

test("forced colors replace the profile palette but keep boundaries and focus", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.setContent(gridDocument(source));
  const field = page.getByRole("textbox", { name: "Option" });
  await field.focus();
  const style = await field.evaluate(element => {
    const computed = getComputedStyle(element);
    return { border: computed.borderBottomStyle, outline: computed.outlineStyle };
  });
  expect(style).toEqual({ border: "double", outline: "solid" });
});
