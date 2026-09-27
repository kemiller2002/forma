import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "dist", "all.css"), "utf8");
const matrix = JSON.parse(fs.readFileSync(path.join(root, "catalog", "theme-layout-matrix.json"), "utf8"));

function specimen(id) {
  return fs.readFileSync(path.join(root, "catalog", "specimens", id + ".html"), "utf8");
}
function doc(body, theme, extra = "") {
  const attr = theme.selector ? ` data-ef-theme="${theme.selector}"` : "";
  return `<!doctype html><html lang="en"${attr}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Theme layout conformance</title><style>${css}</style><style>html,body{margin:0}body{padding:1rem}${extra}</style></head><body>${body}</body></html>`;
}
async function contained(page) {
  const size = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) }));
  expect(size.width).toBeLessThanOrEqual(size.viewport + 1);
}
async function axe(page) {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  expect(result.violations).toEqual([]);
}

for (const theme of matrix.implementedThemes) {
  for (const layout of [...matrix.highRiskLayouts, ...matrix.representativeLayouts]) {
    test(`${theme.id} × ${layout} remains contained and accessible at 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 1000 });
      await page.setContent(doc(specimen(layout), theme));
      await contained(page);
      await axe(page);
    });
  }
  for (const layout of matrix.highRiskLayouts) {
    test(`${theme.id} × ${layout} survives 200% text`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 1000 });
      await page.setContent(doc(specimen(layout), theme, "html{font-size:200%}"));
      await contained(page);
    });
    test(`${theme.id} × ${layout} survives forced colors`, async ({ page }) => {
      await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
      await page.setViewportSize({ width: 390, height: 1000 });
      await page.setContent(doc(specimen(layout), theme));
      await contained(page);
      await axe(page);
    });
  }
}

test("implemented themes resolve complete semantic color contracts", async ({ page }) => {
  for (const theme of matrix.implementedThemes) {
    await page.setContent(doc("<main>Theme probe</main>", theme));
    const values = await page.locator("html").evaluate(el => {
      const style = getComputedStyle(el);
      return [
        "--ef-color-surface-primary",
        "--ef-color-surface-secondary",
        "--ef-color-text-primary",
        "--ef-color-text-secondary",
        "--ef-color-accent-primary",
        "--ef-color-accent-secondary",
        "--ef-color-focus-ring"
      ].map(name => style.getPropertyValue(name).trim());
    });
    expect(values, theme.id + " has an unresolved semantic color token").not.toContain("");
  }
});
