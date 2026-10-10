import { expect, test } from "@playwright/test";

const fixture = "/tests/browser/fixture/overlay-motion.html";

function seconds(value) {
  const trimmed = value.trim();
  return trimmed.endsWith("ms") ? Number.parseFloat(trimmed) / 1000 : Number.parseFloat(trimmed);
}

test.beforeEach(async ({ page }) => {
  await page.goto(fixture);
});

test("native modal and both flyout sides open and close without a runtime behavior layer", async ({ page }) => {
  const cases = [
    ["Open modal", "#test-modal"],
    ["Open left flyout", "#test-left-flyout"],
    ["Open right flyout", "#test-right-flyout"]
  ];

  for (const [buttonName, selector] of cases) {
    const trigger = page.getByRole("button", { name: buttonName });
    const surface = page.locator(selector);

    await trigger.click();
    await expect(surface).toHaveJSProperty("open", true);

    await page.keyboard.press("Escape");
    await expect(surface).toHaveJSProperty("open", false);
    await expect(trigger).toBeFocused();
  }
});

test("left and right flyouts preserve opposite physical origins", async ({ page }) => {
  const origins = await page.locator(".ef-flyout").evaluateAll(elements =>
    elements.map(element => ({
      side: element.dataset.efSide,
      closedX: getComputedStyle(element).getPropertyValue("--ef-flyout-closed-x").trim()
    }))
  );

  expect(origins).toEqual([
    { side: "left", closedX: "-100%" },
    { side: "right", closedX: "100%" }
  ]);
});

test("modal and flyout entry and exit share duration and easing", async ({ page }) => {
  for (const [buttonName, selector] of [
    ["Open modal", "#test-modal"],
    ["Open left flyout", "#test-left-flyout"],
    ["Open right flyout", "#test-right-flyout"]
  ]) {
    const surface = page.locator(selector);
    const response = element => {
      const style = getComputedStyle(element);
      return { duration: style.transitionDuration, easing: style.transitionTimingFunction };
    };
    const exitResponse = await surface.evaluate(response);

    await page.getByRole("button", { name: buttonName }).click();

    const entryResponse = await surface.evaluate(response);
    expect(entryResponse).toEqual(exitResponse);
    await page.keyboard.press("Escape");
  }
});

test("reduced motion removes modal and flyout spatial travel", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();

  const states = await page.locator(".ef-dialog, .ef-flyout").evaluateAll(elements =>
    elements.map(element => {
      const style = getComputedStyle(element);
      return {
        translate: style.translate,
        scale: style.scale,
        duration: style.transitionDuration.split(",")[0].trim()
      };
    })
  );

  for (const state of states) {
    expect(["none", "0px", "0px 0px", "0px 0px 0px"].includes(state.translate)).toBeTruthy();
    expect(state.scale === "none" || state.scale === "1").toBeTruthy();
    expect(seconds(state.duration)).toBeLessThan(0.01);
  }
});

test("flyouts remain contained at 320 CSS pixels", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.getByRole("button", { name: "Open right flyout" }).click();

  const flyout = page.locator("#test-right-flyout");

  await expect.poll(async () => {
    const box = await flyout.boundingBox();
    return box ? box.x + box.width : Number.POSITIVE_INFINITY;
  }).toBeLessThanOrEqual(320.5);

  const box = await flyout.boundingBox();
  expect(box).not.toBeNull();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.height).toBeLessThanOrEqual(700.5);
});

// Test harness only: Forma ships no runtime motion code. Freeze a browser
// transition halfway through to measure reversal without wall-clock races.
test("interrupted flyout reversal starts at the current rendered position", async ({ page }) => {
  for (const selector of ["#test-left-flyout", "#test-right-flyout"]) {
    const surface = page.locator(selector);
    await surface.evaluate(element => element.showModal());
    await expect.poll(() => surface.evaluate(element => element.getAnimations().some(animation => animation.transitionProperty === "translate"))).toBe(true);
    const sample = await surface.evaluate(element => {
      const animation = element.getAnimations().find(animation => animation.transitionProperty === "translate");
      animation.pause();
      animation.currentTime = animation.effect.getTiming().duration * 0.35;
      const before = getComputedStyle(element).translate;
      element.close();
      const after = getComputedStyle(element).translate;
      return { before, after, open: element.open };
    });
    expect(sample.open).toBe(false);
    expect(sample.after).toBe(sample.before);
    await expect(surface).toBeHidden();
    await surface.evaluate(element => element.showModal());
    await expect(surface).toHaveJSProperty("open", true);
    await expect.poll(() => surface.evaluate(element => parseFloat(getComputedStyle(element).translate))).toBe(0);
    await surface.evaluate(element => element.close());
    await expect(surface).toBeHidden();
  }
});
