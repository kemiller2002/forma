import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// FORMA-A11Y-001: forced-colors token projection and surface text contrast.
const root = process.cwd();
const css = fs.readFileSync(path.join(root, "dist", "all.css"), "utf8");
const brand = fs.readFileSync(path.join(root, "dist", "brands", "echelon.css"), "utf8");
const matrix = JSON.parse(fs.readFileSync(path.join(root, "catalog", "theme-layout-matrix.json"), "utf8"));

const doc = (theme, body) => `<!doctype html><html lang="en"${theme.selector ? ` data-ef-theme="${theme.selector}"` : ""}><head><meta charset="utf-8"><title>Projection</title><style>${css}</style><style>${brand}</style></head><body>${body}</body></html>`;

const probe = `
  <main>
    <h1>Heading</h1>
    <p>Body text</p>
    <article class="ef-surface"><h2>Card</h2><p>Secondary surface text</p></article>
    <div data-ef-brand="echelon"><p id="branded">Branded text</p></div>
    <span class="ef-status-lozenge" data-state="attention">Attention</span>
  </main>`;

const luminance = (rgb) => {
  const [r, g, b] = rgb.match(/[\d.]+/g).slice(0, 3).map((value) => {
    const channel = Number(value) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

for (const theme of matrix.implementedThemes) {
  test(`${theme.id}: forced colors paint text in the forced system color`, async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.setContent(doc(theme, probe));
    const samples = await page.locator("h1, h2, p, .ef-status-lozenge").evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        const tokens = getComputedStyle(element);
        return {
          text: element.textContent.trim(),
          color: style.color,
          fill: style.webkitTextFillColor,
          textToken: tokens.getPropertyValue("--ef-color-text-secondary").trim(),
          surfaceToken: tokens.getPropertyValue("--ef-color-surface-secondary").trim()
        };
      }));
    for (const sample of samples) {
      // The painted fill agrees with the forced color, so no theme color leaks.
      expect(sample.fill, sample.text).toBe(sample.color);
      expect(sample.textToken.toLowerCase(), sample.text).toBe("canvastext");
      expect(sample.surfaceToken.toLowerCase(), sample.text).toBe("canvas");
    }
  });

  test(`${theme.id}: text inside .ef-surface meets 4.5:1 on the secondary surface`, async ({ page }) => {
    await page.setContent(doc(theme, probe));
    const pair = await page.locator(".ef-surface p").evaluate((element) => ({
      color: getComputedStyle(element).color,
      background: getComputedStyle(element.closest(".ef-surface")).backgroundColor
    }));
    expect(contrast(pair.color, pair.background)).toBeGreaterThanOrEqual(4.5);
  });
}
