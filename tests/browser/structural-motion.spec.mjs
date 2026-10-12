// MOT-033: structural motion settles directly into its destination. Entry is
// critically damped (no overshoot, no rebound); exit is shorter and never
// returns toward the viewport; animation never delays native state, focus or
// keyboard operability.
//
// Test harness only: Forma ships no runtime motion code. The helpers pause the
// browser's own CSS transitions and step their currentTime, so every sample is
// deterministic and no test depends on wall-clock sleeps.
import fs from "node:fs";
import { expect, test } from "@playwright/test";

const overlays = "/tests/browser/fixture/overlay-motion.html";
const surfaces = "/tests/browser/fixture/surface-physics.html";

const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 }
];

// Wait (frame by frame, not by time) for the element's transition on
// `property` to exist, pause every transition on the element, and sample
// `read` at `steps + 1` evenly spaced points through the longest one.
// Returns the samples and the transition timings.
async function sampleTransitions(locator, property, read, steps = 48) {
  return locator.evaluate(async (element, { property, read, steps }) => {
    const reader = new Function("element", `return (${read})(element);`);
    const running = () => element.getAnimations().filter(animation => animation.transitionProperty);
    for (let frame = 0; frame < 30 && !running().some(animation => animation.transitionProperty === property); frame += 1) {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    const animations = running();
    const tracked = animations.find(animation => animation.transitionProperty === property);
    if (!tracked) return { samples: [], timings: {} };
    animations.forEach(animation => animation.pause());
    const timings = Object.fromEntries(animations.map(animation => [animation.transitionProperty, {
      duration: animation.effect.getComputedTiming().duration,
      easing: animation.effect.getTiming().easing
    }]));
    const end = Math.max(...animations.map(animation => animation.effect.getComputedTiming().endTime));
    const samples = [];
    for (let index = 0; index <= steps; index += 1) {
      // The last sample stays just inside the end: at the end itself a
      // retained exit has already become display: none.
      animations.forEach(animation => { animation.currentTime = Math.min(end * index / steps, end - 0.01); });
      samples.push(reader(element));
    }
    animations.forEach(animation => animation.finish());
    return { samples, timings };
  }, { property, read: read.toString(), steps });
}

// Disclosure height animates only with intrinsic-size interpolation and
// ::details-content (MOT-021); otherwise it opens and closes at once.
const heightAnimates = () => CSS.supports("interpolate-size", "allow-keywords") && CSS.supports("selector(::details-content)");

const nonDecreasing = values => values.every((value, index) => index === 0 || value >= values[index - 1] - 0.01);
const nonIncreasing = values => values.every((value, index) => index === 0 || value <= values[index - 1] + 0.01);

for (const viewport of viewports) {
  test.describe(`${viewport.name} ${viewport.width}px`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(overlays);
    });

    test("flyouts settle exactly at their edge without overshoot or rebound", async ({ page }) => {
      for (const side of ["left", "right"]) {
        const flyout = page.locator(`#test-${side}-flyout`);
        await page.getByRole("button", { name: `Open ${side} flyout` }).click();
        // Native state is authoritative before any motion completes.
        await expect(flyout).toHaveJSProperty("open", true);

        const entry = await sampleTransitions(flyout, "translate", element => element.getBoundingClientRect().x);
        expect(entry.samples.length).toBeGreaterThan(0);
        const finalX = side === "left" ? 0 : viewport.width - await flyout.evaluate(element => element.getBoundingClientRect().width);
        // Monotonic travel toward the edge; never past it.
        if (side === "left") {
          expect(nonDecreasing(entry.samples)).toBe(true);
          entry.samples.forEach(x => expect(x).toBeLessThanOrEqual(finalX + 0.5));
        } else {
          expect(nonIncreasing(entry.samples)).toBe(true);
          entry.samples.forEach(x => expect(x).toBeGreaterThanOrEqual(finalX - 0.5));
        }
        expect(entry.samples.at(-1)).toBeCloseTo(finalX, 0);
        const box = await flyout.boundingBox();
        if (side === "left") expect(box.x).toBeCloseTo(0, 0);
        else expect(box.x + box.width).toBeCloseTo(viewport.width, 0);

        await page.keyboard.press("Escape");
        await expect(flyout).toHaveJSProperty("open", false);
        const exit = await sampleTransitions(flyout, "translate", element => element.getBoundingClientRect().x);
        if (exit.samples.length) {
          // Leaves monotonically and never swings back toward the viewport.
          if (side === "left") expect(nonIncreasing(exit.samples)).toBe(true);
          else expect(nonDecreasing(exit.samples)).toBe(true);
          expect(exit.timings.translate.duration).toBeLessThan(entry.timings.translate.duration);
        }
        await expect(flyout).toBeHidden();
      }
    });

    test("modal fades and rises into place without overshoot, and fades out before removal", async ({ page }) => {
      const modal = page.locator("#test-modal");
      await page.getByRole("button", { name: "Open modal" }).click();
      await expect(modal).toHaveJSProperty("open", true);
      const entry = await sampleTransitions(modal, "translate", element => ({
        opacity: Number(getComputedStyle(element).opacity),
        y: element.getBoundingClientRect().y
      }));
      const opacities = entry.samples.map(sample => sample.opacity);
      const ys = entry.samples.map(sample => sample.y);
      // The surface is transparent when it first renders, so it can never
      // appear at full opacity for a frame.
      expect(opacities[0]).toBe(0);
      expect(nonDecreasing(opacities)).toBe(true);
      expect(opacities.at(-1)).toBe(1);
      expect(nonIncreasing(ys)).toBe(true);
      ys.forEach(y => expect(y).toBeGreaterThanOrEqual(ys.at(-1) - 0.5));

      await page.keyboard.press("Escape");
      await expect(modal).toHaveJSProperty("open", false);
      const exit = await sampleTransitions(modal, "opacity", element => Number(getComputedStyle(element).opacity));
      if (exit.samples.length) {
        expect(nonIncreasing(exit.samples)).toBe(true);
        // Opacity reaches zero no later than the surface leaves the top layer.
        expect(exit.timings.opacity.duration).toBeLessThanOrEqual(exit.timings.display?.duration ?? exit.timings.opacity.duration);
        expect(exit.timings.translate.duration).toBeLessThan(entry.timings.translate.duration);
      }
      await expect(modal).toBeHidden();
    });

    test("interrupting entry reverses from the rendered position without a jump", async ({ page }) => {
      for (const selector of ["#test-left-flyout", "#test-right-flyout", "#test-modal"]) {
        const surface = page.locator(selector);
        const result = await surface.evaluate(async element => {
          element.showModal();
          for (let frame = 0; frame < 30 && !element.getAnimations().some(animation => animation.transitionProperty === "translate"); frame += 1) {
            await new Promise(resolve => requestAnimationFrame(resolve));
          }
          const animation = element.getAnimations().find(item => item.transitionProperty === "translate");
          animation.pause();
          animation.currentTime = animation.effect.getComputedTiming().duration * 0.4;
          const before = element.getBoundingClientRect();
          element.close();
          const after = element.getBoundingClientRect();
          return { open: element.open, retained: getComputedStyle(element).display !== "none", dx: Math.abs(after.x - before.x), dy: Math.abs(after.y - before.y) };
        });
        expect(result.open).toBe(false);
        if (result.retained) {
          expect(result.dx).toBeLessThan(0.5);
          expect(result.dy).toBeLessThan(0.5);
        }
        await expect(surface).toBeHidden();
      }
    });

    test("rapid open and close always ends in the last commanded state", async ({ page }) => {
      for (const selector of ["#test-left-flyout", "#test-right-flyout", "#test-modal"]) {
        const surface = page.locator(selector);
        // Synchronous toggles and toggles separated by single frames.
        await surface.evaluate(async element => {
          for (let index = 0; index < 12; index += 1) {
            element.showModal();
            if (index % 3 === 0) await new Promise(resolve => requestAnimationFrame(resolve));
            element.close();
          }
          element.showModal();
        });
        await expect(surface).toHaveJSProperty("open", true);
        await surface.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => null))));
        const settled = await surface.evaluate(element => ({ translate: getComputedStyle(element).translate, opacity: getComputedStyle(element).opacity }));
        expect(["none", "0px", "0px 0px"]).toContain(settled.translate);
        expect(settled.opacity).toBe("1");
        await surface.evaluate(element => { element.close(); element.showModal(); element.close(); });
        await expect(surface).toHaveJSProperty("open", false);
        await expect(surface).toBeHidden();
      }
    });

    test("keyboard focus enters immediately and returns to the trigger without waiting for motion", async ({ page }) => {
      for (const [name, selector] of [["Open right flyout", "#test-right-flyout"], ["Open left flyout", "#test-left-flyout"], ["Open modal", "#test-modal"]]) {
        const trigger = page.getByRole("button", { name });
        await trigger.focus();
        await page.keyboard.press("Enter");
        const opened = await page.locator(selector).evaluate(element => ({
          open: element.open,
          focusInside: element.contains(document.activeElement)
        }));
        expect(opened).toEqual({ open: true, focusInside: true });
        await page.keyboard.press("Escape");
        const closed = await page.locator(selector).evaluate(element => ({ open: element.open, active: document.activeElement?.textContent }));
        expect(closed).toEqual({ open: false, active: name });
        await expect(page.locator(selector)).toBeHidden();
      }
    });

    test("a closing surface does not intercept input during its exit", async ({ page }) => {
      for (const selector of ["#test-right-flyout", "#test-modal"]) {
        const hit = await page.locator(selector).evaluate(async element => {
          element.showModal();
          await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => null)));
          element.close();
          const box = element.getBoundingClientRect();
          const target = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
          return { open: element.open, intercepted: element.contains(target) };
        });
        expect(hit).toEqual({ open: false, intercepted: false });
        await expect(page.locator(selector)).toBeHidden();
      }
      // An immediate follow-up click reaches the page.
      await page.getByRole("button", { name: "Open modal" }).click();
      await expect(page.locator("#test-modal")).toHaveJSProperty("open", true);
    });

    test("reduced motion places surfaces at their final position immediately", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      for (const [name, selector] of [["Open right flyout", "#test-right-flyout"], ["Open left flyout", "#test-left-flyout"], ["Open modal", "#test-modal"]]) {
        await page.getByRole("button", { name }).click();
        const state = await page.locator(selector).evaluate(element => {
          const style = getComputedStyle(element);
          return {
            open: element.open,
            translate: style.translate,
            longest: Math.max(0, ...style.transitionDuration.split(",").map(value => Number.parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1000)))
          };
        });
        expect(state.open).toBe(true);
        expect(["none", "0px", "0px 0px"]).toContain(state.translate);
        expect(state.longest).toBeLessThan(1);
        await page.keyboard.press("Escape");
        await expect(page.locator(selector)).toBeHidden();
      }
    });
  });
}

test.describe("expand and collapse", () => {
  const content = `<details class="ef-disclosure" id="margin-disclosure" data-ef-motion-weight="light">
      <summary>Delivery options</summary>
      <div class="ef-disclosure__content"><p>First paragraph with its own top margin.</p><p>Second paragraph.</p></div>
    </details>`;

  test.beforeEach(async ({ page }) => {
    await page.goto(surfaces);
    // A transition needs a rendered starting style: content opened in the
    // same frame it is inserted is placed at its endpoint immediately.
    await page.locator("main").evaluate(async (element, html) => {
      element.insertAdjacentHTML("afterbegin", html);
      for (let frame = 0; frame < 3; frame += 1) await new Promise(resolve => requestAnimationFrame(resolve));
    }, content);
  });

  test("child margins stay inside the animated box, so collapse ends without a jump", async ({ page }) => {
    // Height animates only where intrinsic-size interpolation exists
    // (MOT-021); elsewhere the disclosure opens and closes at once, so there
    // is no animated endpoint to jump from.
    test.skip(!(await page.evaluate(heightAnimates)), "no intrinsic-size interpolation: disclosure height changes at once");
    const disclosure = page.locator("#margin-disclosure");
    const closed = await disclosure.evaluate(element => element.getBoundingClientRect().height);
    // The collapse endpoint immediately before content-visibility hides the
    // content: open, with the animated content box at zero height.
    await page.addStyleTag({ content: "#margin-disclosure[open]::details-content { block-size: 0 !important; transition: none !important; }" });
    await disclosure.evaluate(element => { element.open = true; });
    const collapsedOpen = await disclosure.evaluate(element => element.getBoundingClientRect().height);
    expect(Math.abs(collapsedOpen - closed)).toBeLessThan(0.5);
  });

  test("opening and closing are monotonic, end at the natural height and fade on every toggle", async ({ page }) => {
    const disclosure = page.locator("#margin-disclosure");
    // Reference: an identical disclosure rendered open from the start, which
    // never transitions.
    const naturalOpen = await disclosure.evaluate(async element => {
      const clone = element.cloneNode(true);
      clone.id = "reference-disclosure";
      clone.open = true;
      // Its own wrapper, so adjacent-disclosure border rules do not apply.
      const wrapper = document.createElement("div");
      wrapper.append(clone);
      element.parentElement.append(wrapper);
      for (let frame = 0; frame < 2; frame += 1) await new Promise(resolve => requestAnimationFrame(resolve));
      const height = clone.getBoundingClientRect().height;
      wrapper.remove();
      for (let frame = 0; frame < 2; frame += 1) await new Promise(resolve => requestAnimationFrame(resolve));
      return height;
    });
    const closedHeight = await disclosure.evaluate(element => element.getBoundingClientRect().height);

    const animated = await page.evaluate(heightAnimates);

    for (const target of [true, false, true, false]) {
      const run = await disclosure.evaluate(async (element, { target, animated }) => {
        const content = element.querySelector(".ef-disclosure__content");
        const heights = [];
        let faded = false;
        const start = element.getBoundingClientRect().height;
        element.open = target;
        // Sample rendered frames until the layout has moved and then stopped.
        // Without height interpolation the change is immediate, so a few
        // frames suffice.
        for (let frame = 0, still = 0, moved = false; frame < 120 && !(moved && still >= 4); frame += 1) {
          await new Promise(resolve => requestAnimationFrame(resolve));
          const height = element.getBoundingClientRect().height;
          moved ||= Math.abs(height - start) > 0.01 || (!animated && frame >= 2);
          still = heights.length && Math.abs(height - heights.at(-1)) < 0.01 ? still + 1 : 0;
          heights.push(height);
          faded ||= content.getAnimations().some(animation => animation.transitionProperty === "opacity");
        }
        // Wait frame by frame (bounded) for the fade to settle: an engine
        // may never finish a fade in a subtree it has stopped rendering.
        for (let frame = 0; frame < 60 && content.getAnimations().length; frame += 1) {
          await new Promise(resolve => requestAnimationFrame(resolve));
        }
        return { heights, faded, open: element.open, opacity: getComputedStyle(content).opacity };
      }, { target, animated });
      expect(run.open).toBe(target);
      expect(target ? nonDecreasing(run.heights) : nonIncreasing(run.heights)).toBe(true);
      expect(run.heights.at(-1)).toBeCloseTo(target ? naturalOpen : closedHeight, 0);
      // Where height does not animate, closed content leaves rendering at
      // once and there is nothing to fade out; opening still fades in.
      if (target || animated) expect(run.faded).toBe(true);
      // Closed content is content-visibility: hidden, where the engine may stop
      // ticking the last frames of its fade; it is invisible either way, and
      // the native open state is the authoritative, observable state.
      if (target) expect(run.opacity).toBe("1");
      else expect(Number(run.opacity)).toBeLessThan(0.01);
    }
  });

  test("rapid toggling ends at the last native state with final dimensions", async ({ page }) => {
    const disclosure = page.locator("#margin-disclosure");
    const result = await disclosure.evaluate(async element => {
      for (let index = 0; index < 9; index += 1) {
        element.open = !element.open;
        if (index % 2) await new Promise(resolve => requestAnimationFrame(resolve));
      }
      const content = element.querySelector(".ef-disclosure__content");
      for (let frame = 0, still = 0, last = -1; frame < 90 && still < 4; frame += 1) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const height = element.getBoundingClientRect().height;
        still = Math.abs(height - last) < 0.01 ? still + 1 : 0;
        last = height;
      }
      await Promise.all(content.getAnimations().map(animation => animation.finished.catch(() => null)));
      return { open: element.open, opacity: getComputedStyle(content).opacity, contentHeight: content.getBoundingClientRect().height, visible: content.checkVisibility() };
    });
    expect(result.open).toBe(true);
    expect(result.opacity).toBe("1");
    expect(result.visible).toBe(true);
    expect(result.contentHeight).toBeGreaterThan(0);
  });

  test("keyboard toggling is immediate in native state", async ({ page }) => {
    const disclosure = page.locator("#margin-disclosure");
    await disclosure.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(disclosure).toHaveJSProperty("open", true);
    await page.keyboard.press("Space");
    await expect(disclosure).toHaveJSProperty("open", false);
    await expect(disclosure.locator("summary")).toBeFocused();
  });

  test("reduced motion opens and closes to final dimensions at once", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const disclosure = page.locator("#margin-disclosure");
    const result = await disclosure.evaluate(async element => {
      const closed = element.getBoundingClientRect().height;
      element.open = true;
      await new Promise(resolve => requestAnimationFrame(resolve));
      const content = element.querySelector(".ef-disclosure__content");
      const first = element.getBoundingClientRect().height;
      await new Promise(resolve => requestAnimationFrame(resolve));
      return { closed, first, second: element.getBoundingClientRect().height, opacity: getComputedStyle(content).opacity };
    });
    expect(result.first).toBeGreaterThan(result.closed);
    expect(result.second).toBeCloseTo(result.first, 1);
  });
});

test.describe("state indicators", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(surfaces);
  });

  test("a tab does not move when selected and its indicator never exceeds the tab", async ({ page }) => {
    const [tabA, tabB] = [page.locator("#physics-tab-a"), page.locator("#physics-tab-b")];
    const before = await tabB.boundingBox();
    await tabA.evaluate(element => element.setAttribute("aria-selected", "false"));
    await tabB.evaluate(element => element.setAttribute("aria-selected", "true"));
    const scales = await tabB.evaluate(async element => {
      for (let frame = 0; frame < 30 && !element.getAnimations({ subtree: true }).some(animation => animation.transitionProperty === "scale"); frame += 1) {
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      const animation = element.getAnimations({ subtree: true }).find(item => item.transitionProperty === "scale");
      if (!animation) return [];
      animation.pause();
      const values = [];
      for (let index = 0; index <= 40; index += 1) {
        animation.currentTime = animation.effect.getComputedTiming().duration * index / 40;
        values.push(Number.parseFloat(getComputedStyle(element, "::after").scale));
      }
      animation.finish();
      return values;
    });
    expect(scales.length).toBeGreaterThan(0);
    scales.forEach(value => expect(value).toBeLessThanOrEqual(1.0001));
    expect(nonDecreasing(scales)).toBe(true);
    expect(await tabB.boundingBox()).toEqual(before);
  });

  test("the switch thumb's restrained latch stays within the track", async ({ page }) => {
    await page.locator("main").evaluate((element, html) => element.insertAdjacentHTML("afterbegin", html), fs.readFileSync("patterns/switch.html", "utf8"));
    const result = await page.locator(".ef-switch__input").first().evaluate(async input => {
      const track = input.nextElementSibling;
      input.checked = !input.checked;
      for (let frame = 0; frame < 30 && !track.getAnimations({ subtree: true }).some(animation => animation.transitionProperty === "translate"); frame += 1) {
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      const animation = track.getAnimations({ subtree: true }).find(item => item.transitionProperty === "translate");
      animation.pause();
      const style = getComputedStyle(track, "::after");
      const trackWidth = track.getBoundingClientRect().width;
      const thumb = Number.parseFloat(style.width);
      const start = Number.parseFloat(style.insetInlineStart);
      let farthest = 0;
      for (let index = 0; index <= 60; index += 1) {
        animation.currentTime = animation.effect.getComputedTiming().duration * index / 60;
        const x = Math.abs(Number.parseFloat(getComputedStyle(track, "::after").translate.split(" ")[0]));
        farthest = Math.max(farthest, start + x + thumb);
      }
      animation.finish();
      return { farthest, trackWidth };
    });
    expect(result.farthest).toBeLessThanOrEqual(result.trackWidth);
  });
});
