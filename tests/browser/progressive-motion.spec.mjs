import fs from "node:fs";
import { expect, test } from "@playwright/test";

// FORMA-MOT-007: progressive motion contracts (requirements/MOTION-AND-INTERACTION.md
// MOT-021 intrinsic size, MOT-022 View Transitions, MOT-023 scroll-linked,
// MOT-024 concurrent composition). Every enhancement must degrade to a
// correct static presentation.
const html = (body) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Progressive motion</title>
  <link rel="stylesheet" href="/dist/tokens.css">
  <link rel="stylesheet" href="/dist/foundations.css">
  <link rel="stylesheet" href="/dist/components.css">
</head>
<body><main style="max-inline-size: 40rem; margin: 1rem auto; padding: 0 1rem;">${body}</main></body></html>`;

const disclosure = fs.readFileSync("patterns/disclosure.html", "utf8");
const scrollProgress = fs.readFileSync("patterns/scroll-progress.html", "utf8");

const withoutFeature = async (page, pattern) => {
  await page.route("**/dist/components.css", async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace(pattern, "@supports (not-a-feature: 1)") });
  });
};

const open = (page) => page.locator("details.ef-disclosure").first();

// ::details-content transitions are not exposed through getAnimations(), so
// the panel height is sampled every frame after the native state changes.
const openAndSample = (details) =>
  details.evaluate(async (element) => {
    getComputedStyle(element, "::details-content").blockSize;
    element.open = true;
    const samples = [];
    for (let index = 0; index < 20; index += 1) {
      await new Promise((done) => requestAnimationFrame(done));
      samples.push(element.getBoundingClientRect().height);
    }
    return samples;
  });

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/browser/fixture/index.html");
});

test("intrinsic-size disclosure animates height where supported and stays native-authoritative", async ({ page }) => {
  await page.setContent(html(disclosure), { waitUntil: "load" });
  const supported = await page.evaluate(() => CSS.supports("interpolate-size: allow-keywords") && CSS.supports("selector(::details-content)"));
  const details = open(page);
  const samples = await openAndSample(details);
  // Native state is immediate; motion only represents it.
  await expect(details).toHaveAttribute("open", "");
  const final = samples.at(-1);
  expect(final).toBeGreaterThan(0);
  const intermediate = samples.some((value) => value < final - 0.5);
  expect(intermediate).toBe(supported);
  await expect(details.locator(".ef-disclosure__content")).toBeVisible();
});

test("without intrinsic-size support the disclosure opens instantly and fully", async ({ page }) => {
  await withoutFeature(page, "@supports (interpolate-size: allow-keywords) and selector(::details-content)");
  await page.setContent(html(disclosure), { waitUntil: "load" });
  const details = open(page);
  const samples = await openAndSample(details);
  await expect(details).toHaveAttribute("open", "");
  // Full size from the first rendered frame: no clipped intermediate state.
  expect(samples[0]).toBeCloseTo(samples.at(-1), 0);
  await expect(details.locator(".ef-disclosure__content")).toBeVisible();
});

test("collapsed intrinsic-size content is not focusable and reduced motion resizes immediately", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(html(disclosure.replace("<details", "<details id=\"probe\"").replace("</details>", "<a href=\"#x\" id=\"inner\">Inner link</a></details>")), { waitUntil: "load" });
  const details = open(page);
  await details.locator("summary").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("#inner")).not.toBeFocused();
  const samples = await openAndSample(details);
  expect(samples[0]).toBeCloseTo(samples.at(-1), 0);
});

test("scroll-linked progress is a direct projection of scroll position", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 400 });
  await page.setContent(html(`${scrollProgress}<div style="block-size: 3000px"></div>`), { waitUntil: "load" });
  const supported = await page.evaluate(() => CSS.supports("animation-timeline: scroll()"));
  const bar = page.locator(".ef-scroll-progress");
  if (!supported) {
    await expect(bar).toBeHidden();
    return;
  }
  for (const ratio of [0, 0.25, 0.5, 1]) {
    const state = await page.evaluate((fraction) => new Promise((done) => {
      const max = document.documentElement.scrollHeight - innerHeight;
      scrollTo(0, max * fraction);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const bar = document.querySelector(".ef-scroll-progress");
        done({ scale: Number.parseFloat(getComputedStyle(bar).scale.split(" ")[0]), scrolled: scrollY / max });
      }));
    }), ratio);
    // No spring or smoothing: the visual equals the authoritative scroll ratio.
    expect(Math.abs(state.scale - state.scrolled)).toBeLessThan(0.01);
  }
});

test("scroll progress is absent without scroll timelines and under reduced motion", async ({ page }) => {
  await withoutFeature(page, "@supports (animation-timeline: scroll())");
  await page.setContent(html(`${scrollProgress}<div style="block-size: 3000px"></div>`), { waitUntil: "load" });
  await expect(page.locator(".ef-scroll-progress")).toBeHidden();
  await page.unrouteAll();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(html(`${scrollProgress}<div style="block-size: 3000px"></div>`), { waitUntil: "load" });
  await expect(page.locator(".ef-scroll-progress")).toBeHidden();
});

test("opt-in View Transitions use perceptual crossfades and never gate the state update", async ({ page }) => {
  await page.setContent(html(`<p id="status">Draft</p>`), { waitUntil: "load" });
  const supported = await page.evaluate(() => typeof document.startViewTransition === "function");
  test.skip(!supported, "View Transitions unsupported: the application updates state directly");
  const result = await page.evaluate(async () => {
    document.documentElement.setAttribute("data-ef-view-transitions", "");
    const transition = document.startViewTransition(() => { document.getElementById("status").textContent = "Published"; });
    await transition.ready;
    const timings = document.getAnimations()
      .filter((animation) => animation.effect?.pseudoElement?.startsWith("::view-transition"))
      .map((animation) => ({ pseudo: animation.effect.pseudoElement, duration: animation.effect.getComputedTiming().duration }));
    const textDuringTransition = document.getElementById("status").textContent;
    await transition.finished;
    return { timings, textDuringTransition };
  });
  // The DOM (semantic authority) is already updated while snapshots animate.
  expect(result.textDuringTransition).toBe("Published");
  const crossfade = result.timings.filter((item) => /view-transition-(old|new)/.test(item.pseudo));
  expect(crossfade.length).toBeGreaterThan(0);
  const perceptual = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.animationDelay = "var(--ef-motion-perceptual-emphasis-duration)";
    document.body.append(probe);
    const value = Number.parseFloat(getComputedStyle(probe).animationDelay) * 1000;
    probe.remove();
    return value;
  });
  crossfade.forEach((item) => expect(item.duration).toBeCloseTo(perceptual, 0));
});

test("View Transitions are skipped under reduced motion; the update still happens", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(html(`<p id="status">Draft</p>`), { waitUntil: "load" });
  const supported = await page.evaluate(() => typeof document.startViewTransition === "function");
  test.skip(!supported, "View Transitions unsupported");
  const result = await page.evaluate(async () => {
    document.documentElement.setAttribute("data-ef-view-transitions", "");
    const transition = document.startViewTransition(() => { document.getElementById("status").textContent = "Published"; });
    await transition.ready;
    const running = document.getAnimations().filter((animation) => animation.effect?.pseudoElement?.startsWith("::view-transition") && animation.effect.getComputedTiming().duration > 0).length;
    await transition.finished;
    return { running, text: document.getElementById("status").textContent };
  });
  expect(result.running).toBe(0);
  expect(result.text).toBe("Published");
});

test("concurrent press and selection motion compose without clobbering", async ({ page }) => {
  await page.setContent(html(fs.readFileSync("patterns/switch.html", "utf8")), { waitUntil: "load" });
  const input = page.locator(".ef-switch__input").first();
  const box = await page.locator(".ef-switch").first().boundingBox();
  await page.mouse.move(box.x + 10, box.y + box.height / 2);
  await page.mouse.down();
  await input.evaluate((element) => { element.checked = !element.checked; });
  const thumb = await page.locator(".ef-switch__track").first().evaluate(async (track) => {
    await Promise.all(track.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => null)));
    const style = getComputedStyle(track, "::after");
    return { translate: style.translate, scale: style.scale, pressed: track.previousElementSibling.matches(":active") };
  });
  await page.mouse.up();
  // Selection travel and press scale are independent properties: both hold.
  expect(Number.parseFloat(thumb.translate)).toBeGreaterThan(10);
  expect(thumb.scale).toBe(thumb.pressed ? "1.12" : "1");
});
