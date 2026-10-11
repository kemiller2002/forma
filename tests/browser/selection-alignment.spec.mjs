import fs from "node:fs";
import { expect, test } from "@playwright/test";

const patterns = ["ordinal-scale", "choice-group", "multi-choice", "checkbox", "switch", "select"];
const markup = patterns.map(name => fs.readFileSync(`patterns/${name}.html`, "utf8")).join("\n");

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/browser/fixture/assessment.html");
  await page.setContent(`<!doctype html><html><head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="/dist/tokens.css">
    <link rel="stylesheet" href="/dist/foundations.css">
    <link rel="stylesheet" href="/dist/components.css">
    <link rel="stylesheet" href="/dist/assessment.css">
    </head><body><main style="padding: 16px; display: grid; gap: 24px; grid-template-columns: minmax(0, 1fr)">${markup}</main></body></html>`);
});

for (const width of [320, 390, 700]) {
  test(`ordinal number and wrapped label share a vertical center at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const fontSize of ["100%", "200%"]) {
      await page.locator("html").evaluate((element, size) => { element.style.fontSize = size; }, fontSize);
      const differences = await page.locator(".ef-ordinal-option").evaluateAll(options => options.map(option => {
        const marker = option.querySelector(".ef-ordinal-option__marker").getBoundingClientRect();
        const label = option.querySelector(".ef-ordinal-option__label").getBoundingClientRect();
        return Math.abs(marker.y + marker.height / 2 - label.y - label.height / 2);
      }));
      differences.forEach(difference => expect(difference).toBeLessThanOrEqual(1));
    }
  });
}

test("desktop ordinal labels retain their separate top-aligned row", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const labels = await page.locator(".ef-ordinal-option__label").evaluateAll(elements => elements.map(element => ({
    alignment: getComputedStyle(element).alignSelf,
    top: element.getBoundingClientRect().top,
    markerBottom: element.previousElementSibling.getBoundingClientRect().bottom
  })));
  labels.forEach(label => {
    expect(label.alignment).toBe("start");
    expect(label.top).toBeGreaterThan(label.markerBottom);
  });
});

for (const width of [320, 390, 1280]) {
  test(`selection markers remain centered with their content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const fontSize of ["100%", "200%"]) {
      await page.locator("html").evaluate((element, size) => { element.style.fontSize = size; }, fontSize);
      const centers = await page.locator(".ef-choice").evaluateAll(elements => elements.map(element => {
        const box = element.getBoundingClientRect();
        const content = element.querySelector(".ef-choice__content").getBoundingClientRect();
        const style = getComputedStyle(element);
        const marker = getComputedStyle(element, "::before");
        const shift = new DOMMatrixReadOnly(marker.transform).m42;
        const markerCenter = box.y + parseFloat(style.borderTopWidth) + parseFloat(marker.top) + shift + parseFloat(marker.height) / 2;
        return Math.abs(markerCenter - content.y - content.height / 2);
      }));
      centers.forEach(difference => expect(difference).toBeLessThanOrEqual(1));
      for (const [container, marker, text] of [
        [".ef-checkbox", ".ef-checkbox__box", ".ef-checkbox__text"],
        [".ef-switch", ".ef-switch__track", ".ef-switch__text"],
        [".ef-select", ".ef-select__indicator", ".ef-select__input"]
      ]) {
        const difference = await page.locator(container).first().evaluate((element, selectors) => {
          const marker = element.querySelector(selectors[0]).getBoundingClientRect();
          const text = element.querySelector(selectors[1]).getBoundingClientRect();
          return Math.abs(marker.y + marker.height / 2 - text.y - text.height / 2);
        }, [marker, text]);
        // Select's rotated chevron has a small intentional directional offset.
        expect(difference).toBeLessThanOrEqual(container === ".ef-select" ? 4 : 1);
      }
    }
  });
}
