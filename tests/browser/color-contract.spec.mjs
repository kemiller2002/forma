import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";

const css = fs.readFileSync("dist/all.css", "utf8");
const fixture = fs.readFileSync("tests/fixtures/color-contract/semantic-states.html", "utf8");
const contract = JSON.parse(fs.readFileSync("contracts/color-contract.json", "utf8"));

const documentFor = (attributes = "", body = fixture) => `<!doctype html><html lang="en" ${attributes}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Color contract</title><style>${css}</style></head><body>${body}</body></html>`;
const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
const channel = value => { const normalized = value / 255; return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4; };
const luminance = value => { const [r, g, b] = Array.isArray(value) ? value : rgb(value); return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b); };
const contrast = (left, right) => { const [high, low] = [luminance(left), luminance(right)].sort((a, b) => b - a); return (high + 0.05) / (low + 0.05); };
const simulations = {
  grayscale: [[0.2126, 0.7152, 0.0722], [0.2126, 0.7152, 0.0722], [0.2126, 0.7152, 0.0722]],
  protan: [[0.1523, 1.0526, -0.2049], [0.1145, 0.7863, 0.0992], [-0.0039, -0.0481, 1.052]],
  deutan: [[0.3673, 0.8606, -0.2279], [0.28, 0.6739, 0.0461], [-0.012, 0.0436, 0.9684]],
  tritan: [[1.2555, -0.0767, -0.1788], [-0.0784, 0.9308, 0.1476], [0.0047, 0.6914, 0.3039]]
};
const simulate = (color, matrix) => matrix.map(row => Math.max(0, Math.min(255, row.reduce((sum, weight, index) => sum + weight * color[index], 0))));

for (const context of [
  { id: "light", attributes: "data-ef-theme=\"light\"" },
  { id: "dark", attributes: "data-ef-theme=\"dark\"" }
]) {
  test(`${context.id}: rendered semantic states use public pairs and retain non-hue meaning`, async ({ page }) => {
    await page.setContent(documentFor(context.attributes));
    const samples = await page.locator(".ef-status-lozenge[data-state]").evaluateAll(elements => elements.map(element => {
      const style = getComputedStyle(element);
      const before = getComputedStyle(element, "::before");
      return { label: element.textContent.trim(), color: style.color, background: style.backgroundColor, glyph: before.content, border: style.borderInlineStartWidth };
    }));
    for (const sample of samples) {
      expect(sample.label.length, "state has explicit text").toBeGreaterThan(0);
      expect(sample.glyph, sample.label).not.toBe("none");
      expect(Number.parseFloat(sample.border), sample.label).toBeGreaterThanOrEqual(4);
      expect(contrast(sample.color, sample.background), sample.label).toBeGreaterThanOrEqual(4.5);
      for (const [name, matrix] of Object.entries(simulations)) {
        expect(contrast(simulate(rgb(sample.color), matrix), simulate(rgb(sample.background), matrix)), `${sample.label} ${name} screening`).toBeGreaterThanOrEqual(3);
      }
    }
    await expect(page.locator("nav [aria-current=page]")).toHaveText("Overview");
    await expect(page.locator("button:disabled")).toBeDisabled();
    await expect(page.locator("[aria-invalid=true]")).toHaveAttribute("aria-describedby", "evidence-reference-error");
    await expect(page.locator(".color-contract-chart [data-series]")).toHaveCount(3);
    for (const series of await page.locator(".color-contract-chart [data-series]").all()) {
      await expect(series).toHaveAttribute("aria-label", /checks?/);
      await expect(series.locator("title")).not.toBeEmpty();
    }
    const accessibility = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
    expect(accessibility.violations).toEqual([]);
  });
}

test("keyboard focus remains observable on the effective surface", async ({ page }) => {
  await page.setContent(documentFor("data-ef-theme=\"dark\""));
  await page.locator("#keyboard-focus-target").focus();
  const style = await page.locator("#keyboard-focus-target").evaluate(element => ({ outline: getComputedStyle(element).outlineStyle, shadow: getComputedStyle(element).boxShadow }));
  expect(style.outline).not.toBe("none");
  expect(style.shadow).not.toBe("none");
});

test("forced colors project status and surfaces to system colors", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "forced-colors emulation is a Chromium capability");
  await page.emulateMedia({ forcedColors: "active" });
  await page.setContent(documentFor("data-ef-theme=\"dark\""));
  const values = await page.locator(".ef-status-lozenge[data-state=blocked]").evaluate(element => {
    const style = getComputedStyle(element);
    return { status: style.getPropertyValue("--ef-color-status-danger").trim().toLowerCase(), surface: style.getPropertyValue("--ef-color-surface-primary").trim().toLowerCase() };
  });
  expect(values).toEqual({ status: "canvastext", surface: "canvas" });
});

test("a dark-theme foreground/surface mismatch is detectable", async ({ page }) => {
  await page.setContent(documentFor("data-ef-theme=\"dark\"", `<p id="correct" style="color:var(--ef-color-text-primary);background:var(--ef-color-surface-primary)">Correct pair</p><p id="mismatch" style="color:var(--ef-color-text-inverse);background:var(--ef-color-surface-primary)">Wrong pair</p>`));
  const pair = async selector => page.locator(selector).evaluate(element => ({ color: getComputedStyle(element).color, background: getComputedStyle(element).backgroundColor }));
  const correct = await pair("#correct");
  const mismatch = await pair("#mismatch");
  expect(contrast(correct.color, correct.background)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(mismatch.color, mismatch.background)).toBeLessThan(4.5);
});

test("contrast alone cannot certify semantic comprehension", async ({ page }) => {
  await page.setContent(documentFor("", `<span id="color-only" style="display:inline-block;width:2rem;height:2rem;color:#fff;background:#000"></span>`));
  const evidence = await page.locator("#color-only").evaluate(element => ({
    ratioInputs: [getComputedStyle(element).color, getComputedStyle(element).backgroundColor],
    text: element.textContent.trim(),
    accessibleName: element.getAttribute("aria-label") ?? "",
    nonColorCue: element.hasAttribute("data-shape") || element.hasAttribute("data-pattern")
  }));
  expect(contrast(...evidence.ratioInputs)).toBeGreaterThanOrEqual(4.5);
  expect(Boolean(evidence.text || evidence.accessibleName || evidence.nonColorCue)).toBe(false);
});
