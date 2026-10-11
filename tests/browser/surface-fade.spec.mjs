import fs from "node:fs";
import { expect, test } from "@playwright/test";

for (const [slug, selector] of [["popover", ".ef-popover"], ["menu", ".ef-menu"], ["tooltip", ".ef-tooltip__surface"]]) {
  test(`${slug}: reciprocal opacity follows a quick slow-fast-slow curve`, async ({ page }) => {
    await page.goto("/tests/browser/fixture/overlay-motion.html");
    await page.locator("main").evaluate((element, html) => { element.innerHTML = html; }, fs.readFileSync(`patterns/${slug}.html`, "utf8"));
    const result = await page.locator(selector).first().evaluate(async element => {
      const read = () => {
        const style = getComputedStyle(element);
        const index = style.transitionProperty.split(",").map(value => value.trim()).indexOf("opacity");
        return { duration: style.transitionDuration.split(",")[index].trim(),
          easing: style.transitionTimingFunction.split(/,(?![^()]*\))/)[index].trim() };
      };
      const closed = read();
      element.showPopover();
      const open = read();
      await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {})));
      const samples = [];
      // Sample the shipped computed opacity curve deterministically, avoiding
      // wall-clock timing noise. This animation exists only in the test.
      for (const values of [[0, 1], [1, 0]]) {
        const animation = element.animate(values.map(opacity => ({ opacity })), { duration: 120, easing: open.easing, fill: "both" });
        animation.pause();
        const row = [];
        for (const fraction of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
          animation.currentTime = 120 * fraction;
          row.push(Number(getComputedStyle(element).opacity));
        }
        samples.push(row);
        animation.cancel();
      }
      element.hidePopover();
      const nativeClosed = !element.matches(":popover-open");
      await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {})));
      return { closed, open, samples, nativeClosed, display: getComputedStyle(element).display };
    });
    expect(result.closed).toEqual(result.open);
    expect(result.open.duration).toBe("0.12s");
    expect(result.open.easing).toBe("cubic-bezier(0.65, 0, 0.35, 1)");
    const [entry, exit] = result.samples;
    expect(entry[0]).toBe(0);
    expect(entry[1]).toBeLessThan(0.05);
    expect(entry[3]).toBeCloseTo(0.5, 2);
    expect(entry[5]).toBeGreaterThan(0.95);
    expect(entry[6]).toBe(1);
    expect(entry[4] - entry[2]).toBeGreaterThan(0.65);
    for (let i = 0; i < entry.length; i++) {
      expect(entry[i] + exit[i]).toBeCloseTo(1, 2);
      if (i) expect(entry[i]).toBeGreaterThanOrEqual(entry[i - 1]);
    }
    expect(result.nativeClosed).toBe(true);
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
      await target.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {}))));
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
        expect(result.samples[2].opacity).toBeCloseTo(0.5, 2);
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
      await target.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {}))));
      expect(await target.evaluate(element => element.matches(":popover-open"))).toBe(true);
      expect(await target.evaluate(element => getComputedStyle(element).opacity)).toBe("1");
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
