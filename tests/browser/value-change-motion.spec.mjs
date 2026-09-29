import fs from "node:fs";
import { expect, test } from "@playwright/test";

// FORMA-MOT-011: truthful metric/value changes and non-spatial state
// interpolation (requirements/MOTION-AND-INTERACTION.md, perceptual model).
const html = (body) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Value change motion</title>
  <link rel="stylesheet" href="/dist/tokens.css">
  <link rel="stylesheet" href="/dist/foundations.css">
  <link rel="stylesheet" href="/dist/components.css">
</head>
<body><main style="max-inline-size: 40rem; margin: 1rem auto; padding: 0 1rem; display: grid; gap: 1rem;">${body}</main></body></html>`;

const metric = fs.readFileSync("patterns/metric-card.html", "utf8");
const SPATIAL = new Set(["translate", "scale", "rotate", "transform", "inset", "top", "right", "bottom", "left", "width", "height", "inline-size", "block-size"]);

const probeDuration = (page, token) => page.evaluate((name) => {
  const probe = document.createElement("span");
  probe.style.animationDelay = `var(${name})`;
  document.body.append(probe);
  const value = Number.parseFloat(getComputedStyle(probe).animationDelay) * 1000;
  probe.remove();
  return value;
}, token);

// Replace the value element the way an application publishes an update, then
// sample every frame of the presentation.
const publish = (page, next) => page.evaluate(async (text) => {
  const current = document.querySelector(".ef-metric-card__value");
  const replacement = current.cloneNode(false);
  replacement.textContent = text;
  replacement.setAttribute("data-ef-value-change", "");
  current.replaceWith(replacement);
  const frames = [];
  const luminance = (rgb) => {
    const [r, g, b] = rgb.match(/[\d.]+/g).slice(0, 3).map((value) => {
      const channel = Number(value) / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const surface = (element) => {
    for (let node = element; node; node = node.parentElement) {
      const color = getComputedStyle(node).backgroundColor;
      const alpha = color.match(/[\d.]+/g)?.[3];
      if (color !== "rgba(0, 0, 0, 0)" && (alpha === undefined || Number(alpha) > 0.99)) return color;
    }
    return "rgb(255, 255, 255)";
  };
  const contrast = (a, b) => {
    const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (high + 0.05) / (low + 0.05);
  };
  const timing = getComputedStyle(replacement);
  const meta = { property: timing.transitionProperty, duration: Number.parseFloat(timing.transitionDuration) * 1000 };
  for (let index = 0; index < 20; index += 1) {
    const style = getComputedStyle(replacement);
    frames.push({
      text: replacement.textContent,
      opacity: Number(style.opacity),
      contrast: contrast(style.color, surface(replacement)),
      background: style.backgroundColor
    });
    await new Promise((done) => requestAnimationFrame(done));
  }
  return { meta, frames };
}, next);

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/browser/fixture/index.html");
});

test("a published value is authoritative and legible from the first frame; no count-through", async ({ page }) => {
  await page.setContent(html(metric), { waitUntil: "load" });
  const { frames } = await publish(page, "$38,200");
  // Only the final value is ever exposed: no invented intermediate numbers.
  expect(new Set(frames.map((frame) => frame.text))).toEqual(new Set(["$38,200"]));
  for (const frame of frames) {
    expect(frame.opacity).toBe(1);
    expect(frame.contrast).toBeGreaterThanOrEqual(4.5);
  }
  // The emphasis is visible (the tint starts on) and then settles away.
  expect(frames[0].background).not.toBe(frames.at(-1).background);
  expect(frames.at(-1).background).toBe("rgba(0, 0, 0, 0)");
});

test("the emphasis is perceptual and identical for increases, decreases and status changes", async ({ page }) => {
  await page.setContent(html(metric), { waitUntil: "load" });
  const emphasis = await probeDuration(page, "--ef-motion-perceptual-emphasis-duration");
  const up = await publish(page, "$51,000");
  const down = await publish(page, "$12,400");
  const same = await publish(page, "$12,400");
  for (const result of [up, down, same]) {
    expect(result.meta.property).toBe("background-color");
    expect(result.meta.duration).toBeCloseTo(emphasis, 0);
    expect(result.frames[0].background).toBe(up.frames[0].background);
  }
});

test("reduced motion and forced colors show the new value immediately with no emphasis motion", async ({ page }) => {
  for (const media of [{ reducedMotion: "reduce" }, { forcedColors: "active" }]) {
    await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "none", ...media });
    await page.setContent(html(metric), { waitUntil: "load" });
    const { meta, frames } = await publish(page, "$38,200");
    expect(meta.property === "none" || meta.duration === 0).toBe(true);
    expect(frames[0].text).toBe("$38,200");
    expect(frames[0].opacity).toBe(1);
  }
});

test("status state stays legible without color: the glyph and text change immediately", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.setContent(html(metric), { waitUntil: "load" });
  const lozenge = page.locator(".ef-status-lozenge");
  await lozenge.evaluate((element) => { element.dataset.state = "ok"; element.textContent = "Paid in full"; });
  const glyph = await lozenge.evaluate((element) => getComputedStyle(element, "::before").content);
  expect(glyph).toBe('"✓"');
  await expect(lozenge).toHaveText("Paid in full");
});

test("overlay opacity and backdrop dimming use perceptual interpolation, not mass-derived timing", async ({ page }) => {
  await page.setContent(html(`
    <div class="ef-popover" popover id="pop">Popover</div>
    <div class="ef-toast" popover="manual" id="toast">Saved</div>
    <dialog class="ef-dialog" id="dialog"><p>Dialog</p></dialog>`), { waitUntil: "load" });
  const perceptual = await probeDuration(page, "--ef-motion-perceptual-duration");
  const timings = await page.evaluate(() => {
    const byProperty = (element, pseudo) => {
      const style = getComputedStyle(element, pseudo);
      const properties = style.transitionProperty.split(", ");
      const durations = style.transitionDuration.split(", ").map((value) => Number.parseFloat(value) * 1000);
      const easings = style.transitionTimingFunction.match(/cubic-bezier\([^)]*\)|[a-z-]+/g);
      return Object.fromEntries(properties.map((property, index) => [property, { duration: durations[index % durations.length], easing: easings[index % easings.length] }]));
    };
    document.getElementById("pop").showPopover();
    document.getElementById("toast").showPopover();
    document.getElementById("dialog").showModal();
    return {
      popoverOpen: byProperty(document.getElementById("pop")),
      toastOpen: byProperty(document.getElementById("toast")),
      backdrop: byProperty(document.getElementById("dialog"), "::backdrop")
    };
  });
  for (const [name, entry] of [["popover", timings.popoverOpen.opacity], ["toast", timings.toastOpen.opacity], ["backdrop", timings.backdrop["background-color"] ?? timings.backdrop.background], ["backdrop filter", timings.backdrop["backdrop-filter"]]]) {
    expect(entry, name).toBeDefined();
    expect(entry.duration, name).toBeCloseTo(perceptual, 0);
    expect(entry.easing, name).toBe("cubic-bezier(0.2, 0, 0, 1)");
  }
});

test("a theme change introduces no spatial motion", async ({ page }) => {
  await page.setContent(html(`${metric}${fs.readFileSync("patterns/switch.html", "utf8")}${fs.readFileSync("patterns/segmented-control.html", "utf8")}`), { waitUntil: "load" });
  const spatial = await page.evaluate(async (names) => {
    document.documentElement.setAttribute("data-ef-theme", "dark");
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
    return document.getAnimations()
      .map((animation) => animation.transitionProperty)
      .filter((property) => property && names.includes(property));
  }, [...SPATIAL]);
  expect(spatial).toEqual([]);
});
