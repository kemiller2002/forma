import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Diagram presentation family (requirements/OBJECT-METADATA-AND-DIAGRAM-PRESENTATION.md,
// FMD-M1, FMD-COLOR, FMD-TEST; docs/decisions/ADR-0004-diagram-presentation-boundary.md).
const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const html = ({ theme = "", dir = "ltr", css = "" } = {}) => `<!doctype html>
<html lang="en" dir="${dir}"${theme ? ` data-ef-theme="${theme}"` : ""}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Diagram</title>
  <link rel="stylesheet" href="/dist/tokens.css">
  <link rel="stylesheet" href="/dist/foundations.css">
  <link rel="stylesheet" href="/dist/components.css">
  <style>${css}</style>
</head>
<body><main style="padding: 1rem;">
<h1>Diagram</h1>
${fs.readFileSync("patterns/diagram.html", "utf8")}
</main></body></html>`;

const open = async (page, width, options = {}) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/tests/browser/fixture/index.html");
  await page.setContent(html(options), { waitUntil: "load" });
};

const node = (page, name) => page.getByRole("article", { name });
const style = (locator, property) => locator.evaluate((element, name) => getComputedStyle(element)[name], property);
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test("the diagram exposes named items and a text relationship for every connector", async ({ page }) => {
  await open(page, 1280);
  await expect(page.getByRole("figure", { name: "Publication workflow" })).toBeVisible();
  for (const name of ["Draft article", "Legal review", "Publish", "Rework"]) {
    await expect(node(page, name)).toBeVisible();
  }
  const connectors = await page.locator(".ef-diagram-connector").count();
  await expect(page.getByRole("list", { name: "Relationships" }).getByRole("listitem")).toHaveCount(connectors);
  // Connector paint is decorative; the relationship list is the accessible form.
  await expect(page.locator(".ef-diagram__wires")).toHaveAttribute("aria-hidden", "true");
});

test("authored color overrides apply, and removing one restores the Forma default", async ({ page }) => {
  await open(page, 1280);
  const rework = node(page, "Rework");
  const fallback = await style(rework, "backgroundColor");
  const review = await style(node(page, "Legal review"), "backgroundColor");
  expect(review).toBe("rgb(255, 241, 214)");
  expect(fallback).not.toBe(review);
  await rework.evaluate((element) => element.style.setProperty("--ef-diagram-fill", "#fff1d6"));
  expect(await style(rework, "backgroundColor")).toBe(review);
  await rework.evaluate((element) => element.style.removeProperty("--ef-diagram-fill"));
  expect(await style(rework, "backgroundColor")).toBe(fallback);
});

test("color is not the only cue: kind, state and line style are text or structure", async ({ page }) => {
  await open(page, 1280);
  await page.emulateMedia({ forcedColors: "active" });
  for (const name of ["Draft article", "Legal review", "Publish", "Rework"]) {
    await expect(node(page, name).locator(".ef-diagram-node__kind")).not.toBeEmpty();
    await expect(node(page, name).locator(".ef-diagram-node__meta")).toContainText("State");
  }
  const dashes = await page.locator(".ef-diagram-connector").evaluateAll((paths) => paths.map((path) => getComputedStyle(path).strokeDasharray));
  expect(new Set(dashes).size).toBe(3);
});

test("authored color never hides focus", async ({ page }) => {
  await open(page, 1280);
  const link = node(page, "Publish").getByRole("link");
  await link.focus();
  const focused = await link.evaluate((element) => ({ outline: getComputedStyle(element).outlineStyle, ring: getComputedStyle(element).boxShadow }));
  await node(page, "Publish").evaluate((element) => element.style.setProperty("--ef-diagram-fill", "#171a18"));
  const recolored = await link.evaluate((element) => ({ outline: getComputedStyle(element).outlineStyle, ring: getComputedStyle(element).boxShadow }));
  expect(focused.outline).not.toBe("none");
  expect(recolored).toEqual(focused);
});

test("print without backgrounds keeps boundaries, kinds and line styles", async ({ page }) => {
  await open(page, 1280);
  await page.emulateMedia({ media: "print" });
  for (const name of ["Draft article", "Rework"]) {
    expect(parseFloat(await style(node(page, name), "borderTopWidth"))).toBeGreaterThan(0);
    expect(await style(node(page, name), "borderTopColor")).toBe("rgb(0, 0, 0)");
  }
  const dashes = await page.locator(".ef-diagram-connector").evaluateAll((paths) => paths.map((path) => getComputedStyle(path).strokeDasharray));
  expect(new Set(dashes).size).toBe(3);
});

test("at 320px the canvas scrolls in its own keyboard-reachable region", async ({ page }) => {
  await open(page, 320);
  expect(await overflow(page)).toBeLessThanOrEqual(1);
  const viewport = page.getByRole("group", { name: /Publication workflow canvas/ });
  expect(await viewport.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await viewport.focus();
  await expect(viewport).toBeFocused();
});

test("200% text and text spacing do not clip item content", async ({ page }) => {
  await open(page, 390, { css: "html{font-size:200%} *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}" });
  expect(await overflow(page)).toBeLessThanOrEqual(1);
  for (const name of ["Draft article", "Legal review", "Publish", "Rework"]) {
    const clipped = await node(page, name).evaluate((element) => element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1);
    expect(clipped, name).toBe(false);
  }
});

test("canvas geometry is physical and does not mirror in right-to-left documents", async ({ page }) => {
  await open(page, 1280, { dir: "rtl" });
  const offset = await node(page, "Legal review").evaluate((element) => element.offsetLeft);
  expect(offset).toBe(260);
});

test("the diagram has no automatically detectable WCAG A/AA violations (light, dark, forced colors)", async ({ page }) => {
  for (const theme of ["", "dark"]) {
    await open(page, 1280, { theme });
    const results = await new AxeBuilder({ page }).withTags(wcag).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  }
  await page.emulateMedia({ forcedColors: "active" });
  expect(await style(node(page, "Legal review"), "borderTopStyle")).toBe("solid");
});
