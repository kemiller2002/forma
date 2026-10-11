import { expect, test } from "@playwright/test";
import flyout from "../../catalog/components/flyout.mjs";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/browser/fixture/overlay-motion.html");
  // Match the documentation's containing-block boundary, not just a bare body.
  await page.locator("main").evaluate(element => {
    element.style.cssText = "contain: layout; inline-size: 220px; block-size: 300px; overflow: auto; margin: 80px 20px";
  });
});

for (const width of [320, 390]) {
  test(`temporal fields stay inside the filter flyout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 });
    await page.locator("main").evaluate((element, html) => { element.innerHTML = html; }, flyout.examples[0].html);
    const dialog = page.locator("dialog");
    await dialog.evaluate(element => element.showModal());
    await dialog.evaluate(async element => {
      await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {})));
    });
    const input = dialog.locator('input[name="updated-after"]');
    for (const fontSize of ["100%", "200%"]) {
      await page.locator("html").evaluate((element, size) => { element.style.fontSize = size; }, fontSize);
      for (const [type, value] of [["date", "2026-10-10"], ["time", "15:05"], ["datetime-local", "2026-10-10T15:05"]]) {
        await input.evaluate((element, type) => { element.type = type; }, type);
        for (const nextValue of ["", value]) {
          await input.fill(nextValue);
          const bounds = await input.evaluate(element => {
            const rect = element.getBoundingClientRect();
            const field = element.parentElement.getBoundingClientRect();
            const body = element.closest(".ef-flyout__body");
            const bodyRect = body.getBoundingClientRect();
            const style = getComputedStyle(body);
            return { left: rect.left, right: rect.right, fieldLeft: field.left, fieldRight: field.right,
              contentRight: bodyRect.right - parseFloat(style.paddingRight),
              scrollWidth: body.scrollWidth, clientWidth: body.clientWidth, value: element.value };
          });
          expect(bounds.value).toBe(nextValue);
          expect(bounds.left).toBeGreaterThanOrEqual(bounds.fieldLeft - 0.5);
          expect(bounds.right).toBeLessThanOrEqual(bounds.fieldRight + 0.5);
          expect(bounds.right).toBeLessThanOrEqual(bounds.contentRight + 0.5);
          expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.clientWidth + 1);
        }
      }
    }
  });
}

test("retained flyout exit keeps viewport size inside a layout-containing ancestor", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  for (const selector of ["#test-left-flyout", "#test-right-flyout"]) {
    const result = await page.locator(selector).evaluate(async element => {
      element.showModal();
      await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {})));
      const before = element.getBoundingClientRect();
      element.close();
      // Flush styles, then freeze the exit in a rendered intermediate frame.
      getComputedStyle(element).display;
      const animation = element.getAnimations().find(item => item.transitionProperty === "translate");
      if (animation) {
        animation.pause();
        animation.currentTime = animation.effect.getTiming().duration * 0.5;
      }
      const after = element.getBoundingClientRect();
      const result = { display: getComputedStyle(element).display, overlay: getComputedStyle(element).overlay,
        before: { width: before.width, height: before.height, top: before.top },
        after: { width: after.width, height: after.height, top: after.top } };
      if (animation) animation.finish();
      return result;
    });
    if (result.display !== "none") {
      expect(result.overlay).toBe("auto");
      expect(result.after.width).toBeCloseTo(result.before.width, 1);
      expect(result.after.height).toBeCloseTo(result.before.height, 1);
      expect(result.after.top).toBeCloseTo(result.before.top, 1);
    }
    await expect(page.locator(selector)).toBeHidden();
  }
});

test("without overlay retention native close cannot retract into an example", async ({ page }) => {
  await page.route("**/dist/components.css", async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace("@supports (overlay: auto)", "@supports (forma-unavailable: true)") });
  });
  await page.reload();
  await page.locator("main").evaluate(element => { element.style.contain = "layout"; });
  for (const selector of ["#test-left-flyout", "#test-right-flyout", "#test-modal"]) {
    const result = await page.locator(selector).evaluate(async element => {
      element.showModal();
      await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {})));
      element.close();
      return { open: element.open, display: getComputedStyle(element).display,
        transitions: element.getAnimations().length };
    });
    expect(result.open).toBe(false);
    expect(result.display).toBe("none");
    expect(result.transitions).toBe(0);
  }
});
