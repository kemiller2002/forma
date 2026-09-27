import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { gridDocument, pattern } from "./character-grid-helpers.mjs";

const source = pattern("character-grid-reveal");
const seconds = value => Number.parseFloat(value) * (value.endsWith("ms") ? 1 : 1000);

const timings = page => page.evaluate(() =>
  [...document.querySelectorAll(".ef-character-grid [data-ef-row]")].map(run => {
    const style = getComputedStyle(run);
    return {
      id: run.id || run.textContent.trim().slice(0, 12),
      row: Number(run.dataset.efRow),
      col: Number(run.dataset.efCol),
      len: Number(run.dataset.efLen),
      staged: run.hasAttribute("data-ef-reveal-run"),
      name: style.animationName,
      delay: style.animationDelay,
      duration: style.animationDuration,
      timing: style.animationTimingFunction
    };
  }));

test("static is the default: without data-ef-reveal nothing animates", async ({ page }) => {
  await page.setContent(gridDocument(source.replace(' data-ef-reveal="sequential"', "")));
  for (const run of await timings(page)) expect(run.name, run.id).toBe("none");
});

test("staged runs reveal left to right in row-major order, derived from their cells", async ({ page }) => {
  await page.setContent(gridDocument(source));
  const staged = (await timings(page)).filter(run => run.staged);
  expect(staged.length).toBe(3);
  // 60 columns x 12ms + 40ms line = 760ms per row; 3 rows = 2280ms > 1500ms cap.
  const scale = 1500 / (3 * 760);
  for (const run of staged) {
    expect(run.name).toBe("ef-character-grid-reveal");
    expect(run.timing).toContain(`steps(${run.len}`);
    const expectedDelay = ((run.row - 1) * 760 + (run.col - 1) * 12) * scale;
    expect(Math.abs(seconds(run.delay) - expectedDelay), `${run.id} delay`).toBeLessThan(1);
    expect(Math.abs(seconds(run.duration) - run.len * 12 * scale), `${run.id} duration`).toBeLessThan(1);
  }
  const ends = staged.map(run => seconds(run.delay) + seconds(run.duration));
  const starts = staged.map(run => seconds(run.delay));
  starts.slice(1).forEach((start, index) => expect(start).toBeGreaterThan(starts[index]));
  expect(Math.max(...ends), "whole reveal completes within the cap").toBeLessThanOrEqual(1500);
});

test("timing tokens are configurable and the cap still holds", async ({ page }) => {
  await page.setContent(gridDocument(source, {
    extraCss: ".ef-character-grid { --ef-reveal-char-ms: 40; --ef-reveal-line-ms: 200; --ef-reveal-max-ms: 900; }"
  }));
  const staged = (await timings(page)).filter(run => run.staged);
  const ends = staged.map(run => seconds(run.delay) + seconds(run.duration));
  expect(Math.max(...ends)).toBeLessThanOrEqual(900);
  // 60 x 40ms + 200ms = 2600ms per row; 3 rows = 7800ms, compressed to 900ms.
  const first = staged[0];
  expect(Math.abs(seconds(first.duration) / first.len - 40 * 900 / 7800)).toBeLessThan(0.01);
});

test("fields, keys, messages, and values are never staged and are usable at time zero", async ({ page }) => {
  await page.setContent(gridDocument(source));
  await page.evaluate(() => document.getAnimations().forEach(animation => { animation.pause(); animation.currentTime = 0; }));
  const unstaged = (await timings(page)).filter(run => !run.staged);
  for (const run of unstaged) expect(run.name, run.id).toBe("none");
  const operator = page.getByRole("textbox", { name: "Operator" });
  await operator.fill("OP0142");
  await expect(operator).toHaveValue("OP0142");
  await expect(page.getByRole("button", { name: "Enter=Sign on" })).toBeEnabled();
});

test("staged text is fully available to assistive technology before the reveal runs", async ({ page }) => {
  await page.setContent(gridDocument(source));
  await page.evaluate(() => document.getAnimations().forEach(animation => { animation.pause(); animation.currentTime = 0; }));
  const clipped = await page.locator("#character-grid-reveal-title").evaluate(element => getComputedStyle(element).clipPath);
  expect(clipped).toContain("inset");
  await expect(page.getByRole("heading", { name: "ECHELON FOUNDRY" })).toBeAttached();
  const snapshot = await page.locator(".ef-character-grid__surface").ariaSnapshot();
  expect(snapshot).toContain("OPERATIONS NETWORK");
  expect(snapshot).toContain("Authorized use only.");
  const live = await page.locator("[data-ef-reveal-run]").evaluateAll(runs =>
    runs.filter(run => run.closest("[aria-live], [role=status], [role=alert]")).length);
  expect(live, "staged text is not inside a live region").toBe(0);
});

test("prefers-reduced-motion presents everything immediately", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(gridDocument(source));
  for (const run of await timings(page)) expect(run.name, run.id).toBe("none");
  const clip = await page.locator("#character-grid-reveal-title").evaluate(element => getComputedStyle(element).clipPath);
  expect(clip).toBe("none");
});

test("data-ef-reveal=complete is the static state an application sets to interrupt", async ({ page }) => {
  await page.setContent(gridDocument(source.replace('data-ef-reveal="sequential"', 'data-ef-reveal="complete"')));
  for (const run of await timings(page)) expect(run.name, run.id).toBe("none");
});

test("the reveal pattern has no automatically detectable accessibility violations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(gridDocument(source));
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});
