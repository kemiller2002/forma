import fs from "node:fs";
import { expect, test } from "@playwright/test";

// FORMA-MOT-003: assessment and choice motion (requirements/MOTION-AND-INTERACTION.md
// MOT-014, MOT-015, MOT-026). The page is composed from the canonical pattern
// files so the tests always exercise shipped markup.
const PATTERNS = ["ordinal-scale", "choice-group", "special-choice", "binary-choice", "symbol-rating", "semantic-differential", "matrix-single", "pairwise-choice", "best-worst"];

const OPTION_SELECTORS = [
  ".ef-ordinal-option",
  ".ef-choice",
  ".ef-special-choice",
  ".ef-binary-option",
  ".ef-symbol-rating__option",
  ".ef-semantic-differential__scale label"
];

const page_ = () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Assessment motion</title>
  <link rel="stylesheet" href="/dist/tokens.css">
  <link rel="stylesheet" href="/dist/foundations.css">
  <link rel="stylesheet" href="/dist/components.css">
  <link rel="stylesheet" href="/dist/assessment.css">
</head>
<body><main style="max-inline-size: 60rem; margin: 1rem auto; padding: 0 1rem; display: grid; gap: 2rem;">
<h1>Assessment motion</h1>
<form id="assessment">${PATTERNS.map((name) => `<section data-pattern="${name}">${fs.readFileSync(`patterns/${name}.html`, "utf8")}</section>`).join("\n")}</form>
</main></body></html>`;

const seconds = (value) => value.split(",").map((part) => (part.trim().endsWith("ms") ? Number.parseFloat(part) / 1000 : Number.parseFloat(part)));

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/browser/fixture/index.html");
  await page.setContent(page_(), { waitUntil: "load" });
});

test("every assessment option family shares one perceptual selection response", async ({ page }) => {
  const perceptual = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.animationDelay = "var(--ef-motion-perceptual-duration)";
    document.body.append(probe);
    const value = getComputedStyle(probe).animationDelay;
    probe.remove();
    return value;
  });
  const timings = await page.evaluate((selectors) => selectors.map((selector) => {
    const element = document.querySelector(selector);
    if (!element) return { selector, missing: true };
    const style = getComputedStyle(element);
    return { selector, properties: style.transitionProperty, durations: style.transitionDuration, easing: style.transitionTimingFunction };
  }), OPTION_SELECTORS);
  for (const timing of timings) {
    expect(timing.missing, timing.selector).toBeUndefined();
    expect(timing.properties).toBe("background-color, border-color, color");
    seconds(timing.durations).forEach((value) => expect(value).toBeCloseTo(seconds(perceptual)[0], 5));
  }
  expect(new Set(timings.map((timing) => `${timing.durations}|${timing.easing}`)).size).toBe(1);
});

test("motion never varies by value: every ordinal option has identical timing", async ({ page }) => {
  const signatures = await page.locator(".ef-ordinal-option").evaluateAll((options) => options.map((option) => {
    const marker = option.querySelector(".ef-ordinal-option__marker");
    const read = (element) => { const s = getComputedStyle(element); return `${s.transitionProperty}|${s.transitionDuration}|${s.transitionTimingFunction}`; };
    return `${read(option)}#${read(marker)}`;
  }));
  expect(signatures.length).toBeGreaterThan(2);
  expect(new Set(signatures).size).toBe(1);
});

test("ordinal press compresses the marker, never the option hit target", async ({ page }) => {
  const option = page.locator(".ef-ordinal-option").nth(2);
  const before = await option.boundingBox();
  await page.mouse.move(before.x + before.width / 2, before.y + before.height - 6);
  await page.mouse.down();
  await option.evaluate((element) => Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => null))));
  const state = await option.evaluate((element) => ({
    optionScale: getComputedStyle(element).scale,
    optionTransform: getComputedStyle(element).transform,
    markerScale: getComputedStyle(element.querySelector(".ef-ordinal-option__marker")).scale,
    inputActive: element.querySelector("input").matches(":active"),
    inputTopmost: (() => {
      const input = element.querySelector("input");
      const rect = input.getBoundingClientRect();
      return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === input;
    })()
  }));
  const pressed = await option.boundingBox();
  await page.mouse.up();
  expect(pressed).toEqual(before);
  expect(state.optionScale).toBe("none");
  expect(state.optionTransform).toBe("none");
  // Engines differ on whether pressing a label makes its input :active; the
  // marker compresses exactly when the native input reports the press.
  expect(state.markerScale).toBe(state.inputActive ? "0.92" : "none");
  expect(state.inputTopmost).toBe(true);
  await expect(option.locator("input")).toBeChecked();
});

test("rapid keyboard selection is immediate and does not queue motion", async ({ page }) => {
  const radios = page.locator(".ef-ordinal-option input");
  await radios.first().focus();
  await page.keyboard.press("Space");
  for (let index = 1; index < 5; index += 1) {
    await page.keyboard.press("ArrowRight");
    await expect(radios.nth(index)).toBeChecked();
    const duplicates = await page.locator("[data-pattern=ordinal-scale]").evaluate((root) => {
      const keys = root.getAnimations({ subtree: true })
        .filter((animation) => animation.playState === "running")
        .map((animation) => `${animation.effect.target.className}|${animation.effect.pseudoElement}|${animation.transitionProperty}|${[...root.querySelectorAll("*")].indexOf(animation.effect.target)}`);
      return keys.length - new Set(keys).size;
    });
    expect(duplicates).toBe(0);
  }
  await expect(radios.nth(4)).toBeChecked();
  await expect(radios.nth(4)).toBeFocused();
});

test("selection stays identifiable without motion and without color", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; } html { filter: grayscale(1); }" });
  const checks = [
    [".ef-ordinal-option", 1],
    [".ef-binary-option", 0],
    [".ef-symbol-rating__option", 2],
    [".ef-semantic-differential__scale label", 3]
  ];
  for (const [selector, index] of checks) {
    const option = page.locator(selector).nth(index);
    await option.locator("input").check({ force: true });
    const [selected, other] = await page.locator(selector).evaluateAll((options, chosen) => {
      // Effective background: walk up past transparent ancestors.
      const background = (element) => {
        const [r, g, b, a = 1] = getComputedStyle(element).backgroundColor.match(/\d+(\.\d+)?/g).map(Number);
        return a === 0 && element.parentElement ? background(element.parentElement) : [r, g, b];
      };
      const luminance = (element) => {
        const [r, g, b] = background(element);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const pick = options[chosen];
      const peer = options.find((element) => element !== pick && !element.querySelector("input:checked"));
      return [luminance(pick), luminance(peer)];
    }, index);
    expect(Math.abs(selected - other), `${selector} selected state differs by luminance, not hue`).toBeGreaterThan(60);
  }
});

test("reduced motion removes press compression and keeps selection", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const option = page.locator(".ef-ordinal-option").nth(3);
  const box = await option.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 6);
  await page.mouse.down();
  const marker = await option.locator(".ef-ordinal-option__marker").evaluate((element) => ({ scale: getComputedStyle(element).scale, duration: getComputedStyle(element).transitionDuration }));
  await page.mouse.up();
  expect(marker.scale).toBe("none");
  seconds(marker.duration).forEach((value) => expect(value).toBeLessThan(0.01));
  await expect(option.locator("input")).toBeChecked();
});

test("forced colors keeps assessment selection distinguishable", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  const option = page.locator(".ef-ordinal-option").nth(1);
  await option.locator("input").check({ force: true });
  const [selected, other] = await page.locator(".ef-ordinal-option").evaluateAll((options) => {
    const pick = options.find((element) => element.querySelector("input:checked"));
    const peer = options.find((element) => !element.querySelector("input:checked"));
    const describe = (element) => ["background-color", "color", "outline-style", "border-top-color"].map((name) => getComputedStyle(element).getPropertyValue(name)).join("|");
    return [describe(pick), describe(peer)];
  });
  expect(selected).not.toBe(other);
});
