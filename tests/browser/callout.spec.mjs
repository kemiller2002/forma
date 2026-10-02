import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// FORMA-CONTENT-001: editorial callout primitive (patterns/callout.html).
const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const kinds = ["note", "caution", "evidence", "decision"];

const html = (theme = "", extraCss = "") => `<!doctype html>
<html lang="en"${theme ? ` data-ef-theme="${theme}"` : ""}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Callout</title>
  <link rel="stylesheet" href="/dist/marketing/forma-echelon-marketing.css">
  <style>${extraCss}</style>
</head>
<body><main>
<h1>Callout</h1>
${fs.readFileSync("patterns/callout.html", "utf8")}
</main></body></html>`;

const open = async (page, width, options = {}) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/tests/browser/fixture/index.html");
  await page.setContent(html(options.theme, options.css), { waitUntil: "load" });
};

const overflow = (page) =>
  page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth);

const callout = (page, kind) => page.locator(`.ef-callout[data-ef-callout="${kind}"]`);

// The rule pattern of each kind: the second, non-color cue after the label.
const pattern = (page, kind) =>
  callout(page, kind).evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.borderInlineStartStyle, style.borderInlineStartWidth, style.borderTopStyle, style.borderTopWidth].join(" ");
  });

test("each kind is a labelled landmark or figure named by its visible label", async ({ page }) => {
  await open(page, 1280);
  for (const kind of ["note", "caution", "decision"]) {
    await expect(page.getByRole("complementary", { name: kind, exact: false })).toHaveCount(1);
  }
  await expect(page.getByRole("figure", { name: "Evidence" })).toContainText("Source:");
  await expect(callout(page, "evidence").locator("blockquote")).toHaveCount(1);
});

test("kinds stay distinguishable without color", async ({ page }) => {
  await open(page, 1280);
  await page.emulateMedia({ forcedColors: "active" });
  const patterns = await Promise.all(kinds.map((kind) => pattern(page, kind)));
  expect(new Set(patterns).size, patterns.join(" | ")).toBe(kinds.length);
  for (const kind of kinds) {
    await expect(callout(page, kind).locator(".ef-callout__label")).toHaveText(new RegExp(kind, "i"));
  }
});

for (const width of [320, 390]) {
  test(`callouts stay contained and readable at ${width}px`, async ({ page }) => {
    await open(page, width);
    expect(await overflow(page)).toBeLessThanOrEqual(1);
    for (const kind of kinds) {
      const box = await callout(page, kind).boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    }
  });
}

test("callouts survive 200% text and WCAG text-spacing overrides", async ({ page }) => {
  await open(page, 320, { css: "html{font-size:200%} *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p{margin-block-end:2em!important}" });
  expect(await overflow(page)).toBeLessThanOrEqual(1);
  for (const kind of kinds) {
    const clipped = await callout(page, kind).evaluate((element) => element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1);
    expect(clipped, kind).toBe(false);
  }
});

test("callouts have no automatically detectable WCAG A/AA violations (light, dark, forced colors)", async ({ page }) => {
  await open(page, 390);
  expect((await new AxeBuilder({ page }).withTags(wcag).analyze()).violations).toEqual([]);
  await open(page, 1280, { theme: "dark" });
  expect((await new AxeBuilder({ page }).withTags(wcag).analyze()).violations).toEqual([]);
  await page.emulateMedia({ forcedColors: "active" });
  const border = await callout(page, "caution").evaluate((element) => getComputedStyle(element).borderTopStyle);
  expect(border).toBe("solid");
});

test("print keeps callouts whole with a visible frame", async ({ page }) => {
  await open(page, 1280);
  await page.emulateMedia({ media: "print" });
  for (const kind of kinds) {
    const style = await callout(page, kind).evaluate((element) => {
      const computed = getComputedStyle(element);
      return { breakInside: computed.breakInside, border: computed.borderTopWidth };
    });
    expect(style.breakInside).toBe("avoid");
    expect(parseFloat(style.border)).toBeGreaterThan(0);
  }
});

test("reduced motion: the callout is static and declares no motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, 1280);
  const motion = await page.locator(".ef-callout, .ef-callout *").evaluateAll((elements) =>
    elements.flatMap((element) => {
      const style = getComputedStyle(element);
      return [style.animationName, style.transitionProperty === "all" && style.transitionDuration !== "0s" ? style.transitionDuration : "none"];
    }).filter((value) => value !== "none"));
  expect(motion).toEqual([]);
  // The reduced-motion reset leaves 0.01ms transitions on surrounding elements;
  // a style change can start one for a single frame. That is not motion, so
  // only animations long enough to perceive (over 1ms, or infinite) count.
  const perceptible = await page.evaluate(() =>
    document.getAnimations().filter((animation) => {
      const duration = animation.effect?.getComputedTiming().duration;
      return typeof duration !== "number" || duration > 1;
    }).length);
  expect(perceptible).toBe(0);
});
