import fs from "node:fs";
import { expect, test } from "@playwright/test";

// FORMA-MOT-006: direct manipulation and post-release settling
// (requirements/MOTION-AND-INTERACTION.md MOT-002, MOT-019, MOT-020).
// Forma ships no script: these tests play the application's role by writing
// the documented hooks, exactly as Limen/application code would.
const html = () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Direct manipulation</title>
  <link rel="stylesheet" href="/dist/tokens.css">
  <link rel="stylesheet" href="/dist/foundations.css">
  <link rel="stylesheet" href="/dist/components.css">
  <link rel="stylesheet" href="/dist/assessment.css">
</head>
<body><div style="max-inline-size: 64rem; margin: 1rem auto; padding: 0 1rem; display: grid; gap: 2rem;">
<h1>Direct manipulation</h1>
<section data-pattern="ranking">${fs.readFileSync("patterns/ranking.html", "utf8")}</section>
<section data-pattern="split">${fs.readFileSync("patterns/resizable-split-pane.html", "utf8")}</section>
<section data-pattern="states">${fs.readFileSync("patterns/reorder-states.html", "utf8")}</section>
</div></body></html>`;

const item = (page) => page.locator("[data-pattern=ranking] .ef-ranking__item").first();
const pane = (page) => page.locator("[data-pattern=split] .ef-split-pane");

// Sample a value every animation frame for a number of frames.
const sampleFrames = (locator, reader, frames) =>
  locator.evaluate((element, [source, count]) => {
    const read = new Function("element", `return (${source})(element)`);
    return new Promise((done) => {
      const values = [];
      const tick = () => {
        values.push(read(element));
        if (values.length >= count) done(values);
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, [reader.toString(), frames]);

const translateY = (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform === "none" ? undefined : getComputedStyle(element).transform).m42 + (Number.parseFloat(getComputedStyle(element).translate.split(" ")[1] ?? "0") || 0);

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/browser/fixture/index.html");
  await page.setContent(html(), { waitUntil: "load" });
});

test("the dragged item tracks the application-supplied offset with no lag", async ({ page }) => {
  await item(page).evaluate((element) => { element.dataset.efManipulation = "dragging"; });
  for (const offset of [12, 40, 97, 3]) {
    const observed = await item(page).evaluate((element, value) => {
      element.style.setProperty("--ef-drag-y", `${value}px`);
      return { translate: getComputedStyle(element).translate, running: element.getAnimations().length };
    }, offset);
    expect(observed.translate).toBe(`0px ${offset}px`);
    expect(observed.running).toBe(0);
  }
});

test("post-release settling is damped and never overshoots the authoritative position", async ({ page }) => {
  await item(page).evaluate((element) => {
    element.dataset.efManipulation = "dragging";
    element.style.setProperty("--ef-drag-y", "80px");
    // The drag has rendered before release, as it would in a real gesture.
    return getComputedStyle(element).translate;
  });
  await item(page).evaluate((element) => {
    element.dataset.efManipulation = "settling";
    element.style.setProperty("--ef-drag-y", "0px");
  });
  const samples = await sampleFrames(item(page), (element) => Number.parseFloat(getComputedStyle(element).translate.split(" ")[1] ?? "0") || 0, 40);
  expect(Math.min(...samples)).toBeGreaterThanOrEqual(-0.5);
  expect(samples.at(-1)).toBeCloseTo(0, 0);
  expect(samples.some((value) => value > 1)).toBe(true);
});

test("a rejected drop returns to its authoritative position with a non-color cue and no success", async ({ page }) => {
  const rejected = page.locator("[data-pattern=states] [data-ef-drop=rejected]");
  const style = await rejected.evaluate((element) => ({ outline: getComputedStyle(element).outlineStyle, translate: getComputedStyle(element).translate }));
  expect(style.outline).toBe("dashed");
  expect(["none", "0px", "0px 0px"]).toContain(style.translate);
  await expect(page.locator("[data-pattern=states] .ef-ranking__announcement")).toContainText("Order unchanged");
  await expect(page.locator("[data-ef-drop=accepted]")).toHaveCount(0);
});

test("drop candidate, accepted and rejected are distinguishable without color", async ({ page }) => {
  const styles = await page.evaluate(() => ["candidate", "accepted", "rejected"].map((state) => {
    const element = document.createElement("div");
    element.dataset.efDrop = state;
    document.body.append(element);
    const style = getComputedStyle(element);
    const value = `${style.outlineStyle}|${style.backgroundColor}`;
    element.remove();
    return value;
  }));
  expect(new Set(styles).size).toBe(3);
  expect(styles[0].startsWith("dashed")).toBe(true);
  expect(styles[1].startsWith("solid")).toBe(true);
});

test("split-pane resizing tracks directly and never leaves legal bounds, even when settling", async ({ page }) => {
  const width = () => pane(page).evaluate((element) => element.querySelector(".ef-split-pane__primary").getBoundingClientRect().width);
  const bounds = await pane(page).evaluate((element) => {
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return { min: 16 * rem, max: element.clientWidth - 16 * rem };
  });
  await pane(page).evaluate((element) => { element.dataset.efManipulation = "resizing"; element.style.setProperty("--ef-split-size", "50%"); });
  const direct = await width();
  const expected = await pane(page).evaluate((element) => element.clientWidth * 0.5);
  expect(Math.abs(direct - expected)).toBeLessThan(1);

  // Release far beyond the maximum: settling must stay clamped every frame.
  await pane(page).evaluate((element) => { delete element.dataset.efManipulation; element.style.setProperty("--ef-split-size", "99%"); });
  const settling = await sampleFrames(pane(page), (element) => element.querySelector(".ef-split-pane__primary").getBoundingClientRect().width, 30);
  settling.forEach((value) => {
    expect(value).toBeLessThanOrEqual(bounds.max + 0.5);
    expect(value).toBeGreaterThanOrEqual(bounds.min - 0.5);
  });
  expect(settling.at(-1)).toBeCloseTo(bounds.max, 0);

  await pane(page).evaluate((element) => { element.style.setProperty("--ef-split-size", "1%"); });
  await pane(page).evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)));
  expect(await width()).toBeCloseTo(bounds.min, 0);
});

test("keyboard-driven and pointer-driven resizing end in the same state", async ({ page }) => {
  const settleTo = async (manipulation) => {
    await pane(page).evaluate((element, mode) => {
      element.style.setProperty("--ef-split-size", "62%");
      if (mode) element.dataset.efManipulation = mode; else delete element.dataset.efManipulation;
    }, manipulation);
    await pane(page).evaluate((element, mode) => {
      element.style.setProperty("--ef-split-size", "45%");
      if (mode) delete element.dataset.efManipulation;
      return Promise.all(element.getAnimations().map((animation) => animation.finished));
    }, manipulation);
    return pane(page).evaluate((element) => element.querySelector(".ef-split-pane__primary").getBoundingClientRect().width);
  };
  const pointer = await settleTo("resizing");
  const keyboard = await settleTo(null);
  expect(Math.abs(pointer - keyboard)).toBeLessThan(0.5);
  const separator = page.getByRole("separator", { name: "Resize working surface" });
  await separator.focus();
  await expect(separator).toBeFocused();
  const box = await separator.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
});

test("a collapsed pane snaps to its minimum and keeps focus available", async ({ page }) => {
  await pane(page).evaluate((element) => { element.toggleAttribute("data-ef-collapsed", true); return Promise.all(element.getAnimations().map((animation) => animation.finished)); });
  const minimum = await pane(page).evaluate(() => 16 * Number.parseFloat(getComputedStyle(document.documentElement).fontSize));
  const width = await pane(page).evaluate((element) => element.querySelector(".ef-split-pane__primary").getBoundingClientRect().width);
  expect(width).toBeCloseTo(minimum, 0);
  await page.getByRole("separator", { name: "Resize working surface" }).focus();
  await expect(page.getByRole("separator", { name: "Resize working surface" })).toBeFocused();
});

test("reduced motion places items and panes directly at their final position", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const durations = await page.evaluate(() => [
    getComputedStyle(document.querySelector("[data-pattern=states] [data-ef-manipulation=settling]")).transitionDuration,
    getComputedStyle(document.querySelector("[data-pattern=split] .ef-split-pane")).transitionDuration
  ]);
  durations.flatMap((value) => value.split(",")).forEach((value) => expect(Number.parseFloat(value)).toBeLessThan(0.01));
});

test("the non-drag path remains: move buttons are native and enabled where legal", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Move Delivery speed up" }).first()).toBeEnabled();
  await expect(page.getByRole("button", { name: "Move Reliability up" }).first()).toBeDisabled();
});

test("resizable split pane stacks without a separator at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(page.getByRole("separator", { name: "Resize working surface" })).toBeHidden();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
