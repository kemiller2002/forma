import fs from "node:fs";
import { expect, test } from "@playwright/test";

// FORMA-MOT-005: cadence-based loading and bounded progress
// (requirements/MOTION-AND-INTERACTION.md MOT-016, MOT-017, MOT-027).
const PATTERNS = ["skeleton", "spinner", "progress-bar", "survey-progress"];

const html = () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Loading and progress motion</title>
  <link rel="stylesheet" href="/dist/tokens.css">
  <link rel="stylesheet" href="/dist/foundations.css">
  <link rel="stylesheet" href="/dist/components.css">
  <link rel="stylesheet" href="/dist/assessment.css">
</head>
<body><main style="max-inline-size: 40rem; margin: 1rem auto; padding: 0 1rem; display: grid; gap: 2rem;">
<h1>Loading and progress</h1>
${PATTERNS.map((name) => `<section data-pattern="${name}">${fs.readFileSync(`patterns/${name}.html`, "utf8")}</section>`).join("\n")}
</main></body></html>`;

const resolveTime = (page, name) =>
  page.evaluate((property) => {
    const probe = document.createElement("span");
    probe.style.animationDelay = `var(${property})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).animationDelay;
    probe.remove();
    return value;
  }, name);

const running = (page, selector) =>
  page.locator(selector).evaluateAll((elements) =>
    elements.flatMap((element) => element.getAnimations()).filter((animation) => animation.playState === "running").length);

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/browser/fixture/index.html");
  await page.setContent(html(), { waitUntil: "load" });
});

test("indeterminate activity uses the declared cadence: named period, linear, infinite", async ({ page }) => {
  const period = await resolveTime(page, "--ef-motion-cadence-period");
  const rotation = await resolveTime(page, "--ef-motion-cadence-rotation-period");
  const read = (selector) => page.locator(selector).first().evaluate((element) => {
    const style = getComputedStyle(element);
    return { name: style.animationName, duration: style.animationDuration, easing: style.animationTimingFunction, iterations: style.animationIterationCount };
  });
  expect(await read(".ef-skeleton__line")).toEqual({ name: "ef-skeleton-shift", duration: period, easing: "linear", iterations: "infinite" });
  expect(await read(".ef-spinner__indicator")).toEqual({ name: "ef-spinner-rotate", duration: rotation, easing: "linear", iterations: "infinite" });
});

test("cadence stops when the represented activity stops", async ({ page }) => {
  expect(await running(page, ".ef-skeleton__line")).toBeGreaterThan(0);
  expect(await running(page, ".ef-spinner__indicator")).toBe(1);
  await page.locator(".ef-skeleton").evaluate((element) => element.setAttribute("aria-busy", "false"));
  await page.locator(".ef-spinner").evaluate((element) => {
    element.dataset.efState = "idle";
    element.querySelector(".ef-spinner__label").textContent = "Deployment history loaded";
  });
  expect(await running(page, ".ef-skeleton__line")).toBe(0);
  expect(await running(page, ".ef-spinner__indicator")).toBe(0);
  await expect(page.getByRole("status")).toHaveText("Deployment history loaded");
});

test("updating status text does not restart the cycle as if new work began", async ({ page }) => {
  const before = await page.locator(".ef-spinner__indicator").evaluate(async (element) => {
    await new Promise((done) => setTimeout(done, 150));
    return element.getAnimations()[0].currentTime;
  });
  const after = await page.locator(".ef-spinner").evaluate(async (element) => {
    const animation = element.querySelector(".ef-spinner__indicator").getAnimations()[0];
    element.querySelector(".ef-spinner__label").textContent = "Loading deployment history (page 2)";
    element.setAttribute("aria-label", "Loading");
    element.removeAttribute("aria-label");
    await new Promise((done) => setTimeout(done, 50));
    const current = element.querySelector(".ef-spinner__indicator").getAnimations()[0];
    return { same: current === animation, time: current.currentTime };
  });
  expect(after.same).toBe(true);
  expect(after.time).toBeGreaterThan(before);
});

test("activity animation encodes neither importance nor completion time", async ({ page }) => {
  // Every skeleton line shares one period; no line runs faster or slower.
  const durations = await page.locator(".ef-skeleton__line").evaluateAll((elements) => elements.map((element) => getComputedStyle(element).animationDuration));
  expect(new Set(durations).size).toBe(1);
});

test("reduced motion stops repeated activity while text and busy semantics remain", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await running(page, ".ef-skeleton__line")).toBe(0);
  expect(await running(page, ".ef-spinner__indicator")).toBe(0);
  await expect(page.locator(".ef-skeleton")).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("status")).toHaveText("Loading deployment history");
  const indicator = await page.locator(".ef-spinner__indicator").boundingBox();
  expect(indicator.width).toBeGreaterThan(10);
});

test("determinate progress is a direct projection that cannot overshoot", async ({ page }) => {
  const bar = page.getByRole("progressbar", { name: "Exporting audit log" });
  const timing = await bar.evaluate((element) => ({ duration: getComputedStyle(element).transitionDuration, animation: getComputedStyle(element).animationName }));
  expect(timing.duration.split(",").every((value) => Number.parseFloat(value) === 0)).toBe(true);
  expect(timing.animation).toBe("none");
  for (const value of [500, 999, 1000, 400]) {
    const state = await bar.evaluate((element, next) => {
      element.value = next;
      return { position: element.position, animations: element.getAnimations({ subtree: true }).length };
    }, value);
    expect(state.position).toBeCloseTo(value / 1000, 5);
    expect(state.position).toBeLessThanOrEqual(1);
    expect(state.animations).toBe(0);
  }
  // A reconciliation decrease is shown truthfully, not hidden.
  await expect(bar).toHaveJSProperty("value", 400);
});

test("indeterminate progress stays explicit text plus a browser-owned bar", async ({ page }) => {
  const bar = page.getByRole("progressbar", { name: "Preparing search index" });
  expect(await bar.evaluate((element) => element.position)).toBe(-1);
  await expect(page.getByText("Total not yet known")).toBeVisible();
});

test("forced colors keeps the spinner indicator and progress visible", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  const border = await page.locator(".ef-spinner__indicator").evaluate((element) => getComputedStyle(element).borderInlineStartColor);
  expect(border).not.toBe("rgba(0, 0, 0, 0)");
  await expect(page.getByRole("progressbar", { name: "Exporting audit log" })).toBeVisible();
});

test("loading and progress patterns stay contained at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
