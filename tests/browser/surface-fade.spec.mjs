import fs from "node:fs";
import { expect, test } from "@playwright/test";

for (const [slug, selector] of [["popover", ".ef-popover"], ["menu", ".ef-menu"], ["tooltip", ".ef-tooltip__surface"]]) {
  test(`${slug}: opacity changes continuously from the first frame and exits faster`, async ({ page }) => {
    await page.goto("/tests/browser/fixture/overlay-motion.html");
    await page.locator("main").evaluate((element, html) => { element.innerHTML = html; }, fs.readFileSync(`patterns/${slug}.html`, "utf8"));
    // Sample the real CSS transitions (paused and stepped, never timed) at
    // 60Hz and 120Hz frame spacing.
    const result = await page.locator(selector).first().evaluate(async element => {
      const opacityTransition = async () => {
        for (let frame = 0; frame < 30; frame += 1) {
          const found = element.getAnimations().find(animation => animation.transitionProperty === "opacity");
          if (found) return found;
          await new Promise(resolve => requestAnimationFrame(resolve));
        }
        return null;
      };
      const sample = (animation, hz) => {
        animation.pause();
        const duration = animation.effect.getComputedTiming().duration;
        const values = [];
        for (let time = 0; time < duration; time += 1000 / hz) {
          animation.currentTime = time;
          values.push(Number(getComputedStyle(element).opacity));
        }
        animation.currentTime = duration - 0.01;
        values.push(Number(getComputedStyle(element).opacity));
        return { duration, easing: animation.effect.getTiming().easing, values };
      };
      element.showPopover();
      const opening = await opacityTransition();
      const entry = { hz60: sample(opening, 60), hz120: sample(opening, 120) };
      opening.finish();
      element.hidePopover();
      const nativeClosed = !element.matches(":popover-open");
      const closing = await opacityTransition();
      const exit = closing ? { hz60: sample(closing, 60), hz120: sample(closing, 120) } : null;
      closing?.finish();
      await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {})));
      return { entry, exit, nativeClosed, display: getComputedStyle(element).display };
    });
    expect(result.entry.hz60.duration).toBe(180);
    expect(result.entry.hz60.easing).toBe("cubic-bezier(0, 0, 0.58, 1)");
    const checkCurve = (values, rising) => {
      values.forEach((value, index) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
        if (index) {
          const step = rising ? value - values[index - 1] : values[index - 1] - value;
          expect(step).toBeGreaterThanOrEqual(-0.0001);
          // No single frame carries a visible jump.
          expect(step).toBeLessThanOrEqual(0.25);
        }
      });
      // The change is visible from the first frame rather than held back.
      const firstStep = Math.abs(values[1] - values[0]);
      expect(firstStep).toBeGreaterThan(0.05);
    };
    checkCurve(result.entry.hz60.values, true);
    checkCurve(result.entry.hz120.values, true);
    expect(result.entry.hz60.values[0]).toBe(0);
    expect(result.nativeClosed).toBe(true);
    if (result.exit) {
      expect(result.exit.hz60.duration).toBe(120);
      expect(result.exit.hz60.easing).toBe(result.entry.hz60.easing);
      checkCurve(result.exit.hz60.values, false);
      checkCurve(result.exit.hz120.values, false);
    }
    expect(result.display).toBe("none");
  });

  test(`${slug}: reduced motion reaches native endpoints immediately`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/tests/browser/fixture/overlay-motion.html");
    await page.locator("main").evaluate((element, html) => { element.innerHTML = html; }, fs.readFileSync(`patterns/${slug}.html`, "utf8"));
    const result = await page.locator(selector).first().evaluate(async element => {
      element.showPopover();
      const durations = getComputedStyle(element).transitionDuration.split(",").map(value => parseFloat(value));
      await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {})));
      const opacity = getComputedStyle(element).opacity;
      const transitions = element.getAnimations().length;
      element.hidePopover();
      await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {})));
      return { opacity, transitions, durations, display: getComputedStyle(element).display };
    });
    result.durations.forEach(duration => expect(duration).toBeLessThanOrEqual(0.00001));
    expect(result.opacity).toBe("1");
    expect(result.transitions).toBe(0);
    expect(result.display).toBe("none");
  });
}

// Measure actual CSS transitions, including a containing boundary like the
// documentation preview. No synthetic keyframes may stand in for dismissal.
for (const [slug, selector] of [["popover", ".ef-popover"], ["menu", ".ef-menu"], ["tooltip", ".ef-tooltip__surface"]]) {
  test.describe(`${slug} stationary dismissal`, () => {
  for (const width of [320, 1000]) {
    test.describe(`${width}px`, () => {
    test("dismissal fades in place before removal", async ({ page, browserName }) => {
      await page.setViewportSize({ width, height: 700 });
      await page.goto("/tests/browser/fixture/overlay-motion.html");
      await page.locator("main").evaluate((element, html) => {
        element.style.cssText = "transform: translateX(7px); contain: layout; margin: 50px 10px;";
        element.innerHTML = html;
      }, fs.readFileSync(`patterns/${slug}.html`, "utf8"));
      const target = page.locator(selector).first();
      const id = await target.getAttribute("id");
      // Invoke through native HTML so tooltip's implicit anchor is exercised.
      await page.locator(`[popovertarget="${id}"]`).first().click();
      // Isolate explicit dismissal from native interest hover/focus reopening.
      await page.mouse.move(0, 0);
      await page.evaluate(() => document.activeElement?.blur());
      // Native opening can queue the CSS transition for the next rendering
      // update. An immediate getAnimations() snapshot can therefore be empty.
      // Wait for the exact endpoint before measuring the real exit track.
      await expect(target).toHaveCSS("opacity", "1");
      const result = await target.evaluate(element => {
        const box = () => {
          const { x, y, width, height } = element.getBoundingClientRect();
          return { x, y, width, height };
        };
        const before = box();
        element.hidePopover();
        const closed = !element.matches(":popover-open");
        const style = getComputedStyle(element);
        const display = style.display;
        const animations = element.getAnimations();
        const opacity = animations.find(animation => animation.transitionProperty === "opacity");
        const samples = [];
        if (display !== "none") {
          animations.forEach(animation => animation.pause());
          for (const fraction of [0, 0.25, 0.5, 0.75, 0.99]) {
            animations.forEach(animation => { animation.currentTime = animation.effect.getTiming().duration * fraction; });
            samples.push({ box: box(), opacity: Number(getComputedStyle(element).opacity),
              display: getComputedStyle(element).display, overlay: getComputedStyle(element).overlay });
          }
          animations.forEach(animation => { animation.currentTime = animation.effect.getTiming().duration; });
        }
        return { before, closed, display, samples, hasOpacity: Boolean(opacity),
          properties: animations.map(animation => animation.transitionProperty), finalDisplay: getComputedStyle(element).display };
      });
      expect(result.closed).toBe(true);
      if (browserName === "chromium") expect(result.display).not.toBe("none");
      if (result.display !== "none") {
        expect(result.hasOpacity).toBe(true);
        expect(result.properties).not.toContain("translate");
        expect(result.properties).not.toContain("scale");
        // Partially visible mid-fade, and monotonically fading.
        expect(result.samples[2].opacity).toBeGreaterThan(0.05);
        expect(result.samples[2].opacity).toBeLessThan(0.95);
        result.samples.forEach((sample, index) => { if (index) expect(sample.opacity).toBeLessThanOrEqual(result.samples[index - 1].opacity); });
        for (const sample of result.samples) {
          expect(sample.box).toEqual(result.before);
          expect(sample.display).not.toBe("none");
          expect(sample.overlay).toBe("auto");
        }
      }
      expect(result.finalDisplay).toBe("none");
      // Reopen in the same native relationship, including after interrupted entry.
      await page.locator(`[popovertarget="${id}"]`).first().click();
      // Isolate explicit dismissal from native interest hover/focus reopening.
      await page.mouse.move(0, 0);
      await page.evaluate(() => document.activeElement?.blur());
      await target.evaluate(element => {
        getComputedStyle(element).opacity;
        element.hidePopover();
        getComputedStyle(element).opacity;
        element.showPopover();
      });
      await expect(target).toHaveCSS("opacity", "1");
      expect(await target.evaluate(element => element.matches(":popover-open"))).toBe(true);
      await target.evaluate(element => element.hidePopover());
      await expect(target).toBeHidden();
    });
    });
  }

  test("without top-layer retention dismissal is immediate", async ({ page }) => {
    await page.route("**/dist/components.css", async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replaceAll("@supports (overlay: auto)", "@supports (not-a-feature: 1)") });
    });
    await page.goto("/tests/browser/fixture/overlay-motion.html");
    await page.locator("main").evaluate((element, html) => { element.innerHTML = html; }, fs.readFileSync(`patterns/${slug}.html`, "utf8"));
    const result = await page.locator(selector).first().evaluate(async element => {
      element.showPopover();
      await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {})));
      element.hidePopover();
      return { display: getComputedStyle(element).display, closed: !element.matches(":popover-open"), animations: element.getAnimations().length };
    });
    expect(result).toEqual({ display: "none", closed: true, animations: 0 });
  });
  });
}
