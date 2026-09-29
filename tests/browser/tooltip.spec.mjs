import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// FORMA-MOT-004: tooltip / contextual hint (requirements/MOTION-AND-INTERACTION.md
// MOT-018; requirements/COMPONENT-CATALOG.md "P0: Tooltip").
const html = () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tooltip</title>
  <link rel="stylesheet" href="/dist/tokens.css">
  <link rel="stylesheet" href="/dist/foundations.css">
  <link rel="stylesheet" href="/dist/components.css">
</head>
<body><main style="max-inline-size: 40rem; margin: 6rem auto 1rem; padding: 0 1rem;">
<h1>Tooltip</h1>
${fs.readFileSync("patterns/tooltip.html", "utf8")}
</main></body></html>`;

const surface = (page) => page.locator("#tooltip-retention");
const trigger = (page) => page.getByRole("button", { name: "About the retention period" });
const isOpen = (page) => surface(page).evaluate((element) => element.matches(":popover-open"));
const settle = (page) => surface(page).evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => null))));

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/browser/fixture/index.html");
  await page.setContent(html(), { waitUntil: "load" });
});

test("keyboard opens and Escape closes the hint without hover", async ({ page }) => {
  await trigger(page).focus();
  await page.keyboard.press("Enter");
  expect(await isOpen(page)).toBe(true);
  await expect(surface(page)).toBeVisible();
  await page.keyboard.press("Escape");
  expect(await isOpen(page)).toBe(false);
  await expect(trigger(page)).toBeFocused();
  await page.keyboard.press("Space");
  expect(await isOpen(page)).toBe(true);
});

test("pointer and touch-equivalent activation open the hint; state is immediate", async ({ page }) => {
  await trigger(page).click();
  // Native popover state is authoritative and immediate; motion only represents it.
  expect(await isOpen(page)).toBe(true);
  await page.mouse.click(5, 5);
  expect(await isOpen(page)).toBe(false);
});

test("closed hint leaves no invisible interactive state", async ({ page }) => {
  await trigger(page).click();
  await trigger(page).click();
  await settle(page);
  const state = await surface(page).evaluate((element) => ({ open: element.matches(":popover-open"), display: getComputedStyle(element).display }));
  expect(state).toEqual({ open: false, display: "none" });
});

test("light weight motion: tiny origin displacement, perceptual opacity, shorter exit", async ({ page }) => {
  const timing = await page.evaluate(() => {
    const element = document.getElementById("tooltip-retention");
    const read = () => {
      const style = getComputedStyle(element);
      return { properties: style.transitionProperty, durations: style.transitionDuration.split(",").map((value) => Number.parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1000)) };
    };
    const closed = read();
    element.showPopover();
    const open = read();
    const translate = getComputedStyle(element).translate;
    element.hidePopover();
    const mass = getComputedStyle(element.closest(".ef-tooltip")).getPropertyValue("--ef-motion-mass").trim();
    return { closed, open, translate, mass };
  });
  expect(timing.mass).toBe("0.65");
  expect(timing.closed.properties).toBe("opacity, translate, display, overlay");
  // Spatial exit (index 1) is shorter than spatial entry.
  expect(timing.closed.durations[1]).toBeLessThan(timing.open.durations[1]);
  // Opacity is perceptual interpolation in both directions.
  expect(timing.closed.durations[0]).toBe(timing.open.durations[0]);
  const offset = await surface(page).evaluate((element) => Number.parseFloat(getComputedStyle(element).getPropertyValue("--ef-tooltip-offset")));
  expect(offset).toBeLessThanOrEqual(0.25);
});

test("the hint stays inside a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const name of ["About the retention period", "How maintenance windows are applied", "About error budget"]) {
    await page.getByRole("button", { name }).click();
    const open = page.locator(".ef-tooltip__surface:popover-open");
    await open.evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => null))));
    const box = await open.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320.5);
    expect(box.y).toBeGreaterThanOrEqual(0);
    await page.keyboard.press("Escape");
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("trigger meets the touch-target contract and names the hint", async ({ page }) => {
  const box = await trigger(page).boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await expect(page.getByLabel("Maintenance window")).toHaveAccessibleName("Maintenance window");
});

test("reduced motion removes displacement and keeps the hint readable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await trigger(page).click();
  const translate = await surface(page).evaluate((element) => getComputedStyle(element).translate);
  expect(["none", "0px", "0px 0px"]).toContain(translate);
  await expect(surface(page)).toBeVisible();
});

test("forced colors keeps the hint bordered and legible", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await trigger(page).click();
  const style = await surface(page).evaluate((element) => ({ border: getComputedStyle(element).borderTopStyle, color: getComputedStyle(element).color, background: getComputedStyle(element).backgroundColor }));
  expect(style.border).toBe("solid");
  expect(style.color).not.toBe(style.background);
});

test("unsupported anchor positioning falls back to a correct static presentation", async ({ page }) => {
  await page.route("**/dist/components.css", async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace("@supports (position-area: block-start)", "@supports (not-a-feature: 1)") });
  });
  await page.setContent(html(), { waitUntil: "load" });
  await trigger(page).click();
  await settle(page);
  const box = await surface(page).boundingBox();
  const viewport = page.viewportSize();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  await expect(surface(page)).toBeVisible();
});

test("hint patterns have no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await trigger(page).click();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("where anchor positioning is supported the hint sits beside its invoker", async ({ page }) => {
  const supported = await page.evaluate(() => CSS.supports("position-area: block-start"));
  test.skip(!supported, "anchor positioning unsupported: the static fallback test covers this engine");
  await trigger(page).click();
  await settle(page);
  const [hint, button] = await Promise.all([surface(page).boundingBox(), trigger(page).boundingBox()]);
  const gap = Math.min(Math.abs(button.y - (hint.y + hint.height)), Math.abs(hint.y - (button.y + button.height)));
  expect(gap).toBeLessThan(16);
  expect(hint.x + hint.width).toBeGreaterThan(button.x);
  expect(hint.x).toBeLessThan(button.x + button.width);
});
