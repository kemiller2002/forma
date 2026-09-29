import { expect, test } from "@playwright/test";

// FORMA-MOT-002: core controls and selection interactions
// (requirements/MOTION-AND-INTERACTION.md MOT-014, MOT-015, MOT-026, sections 3-5).
const fixture = "/tests/browser/fixture/core-controls-motion.html";

const seconds = (value) => value.split(",").map((part) => {
  const trimmed = part.trim();
  return trimmed.endsWith("ms") ? Number.parseFloat(trimmed) / 1000 : Number.parseFloat(trimmed);
});

// Indicator geometry relative to its control, and the checked segment's box.
const indicatorState = (control) =>
  control.evaluate((element) => {
    const style = getComputedStyle(element, "::before");
    const checked = element.querySelector(".ef-segment:has(input:checked)");
    const box = element.getBoundingClientRect();
    const target = checked.getBoundingClientRect();
    const border = Number.parseFloat(getComputedStyle(element).borderLeftWidth);
    return {
      display: style.display,
      left: Number.parseFloat(style.left),
      top: Number.parseFloat(style.top),
      width: element.clientWidth - Number.parseFloat(style.left) - Number.parseFloat(style.right),
      targetLeft: target.left - box.left - border,
      targetTop: target.top - box.top - border,
      targetWidth: target.width,
      running: element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState === "running" && animation.effect?.pseudoElement === "::before" && animation.effect?.target === element)
        .map((animation) => animation.transitionProperty)
    };
  });

const anchorSupported = (page) => page.evaluate(() => CSS.supports("anchor-name: --ef-segment") && CSS.supports("anchor-scope: all"));

// Without anchor positioning the checked segment's own background is the
// complete selection presentation (progressive enhancement).
const expectFallbackSelection = async (control) => {
  const checked = control.locator(".ef-segment:has(input:checked)");
  const unchecked = control.locator(".ef-segment:not(:has(input:checked))").first();
  const [a, b] = await Promise.all([checked, unchecked].map((segment) => segment.evaluate((element) => getComputedStyle(element).backgroundColor)));
  expect(a).not.toBe(b);
  expect(a).not.toBe("rgba(0, 0, 0, 0)");
};

const expectIndicatorOnChecked = async (page, control) => {
  if (!(await anchorSupported(page))) return expectFallbackSelection(control);
  await settle(control);
  // Not every engine lists pseudo-element transitions in getAnimations(), so
  // the settled geometry is polled rather than read once.
  await expect.poll(async () => {
    const state = await indicatorState(control);
    const aligned = state.display !== "none"
      && Math.abs(state.left - state.targetLeft) < 1
      && Math.abs(state.top - state.targetTop) < 1
      && Math.abs(state.width - state.targetWidth) < 1;
    return aligned ? "aligned" : JSON.stringify({ ...state, running: undefined });
  }, { timeout: 2000 }).toBe("aligned");
};

const settle = (locator) => locator.evaluate((element) => Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => null))));

test.beforeEach(async ({ page }) => {
  await page.goto(fixture);
});

test("segmented selection indicator ends exactly on the checked option in each independent control", async ({ page }) => {
  for (const testId of ["density", "view"]) {
    await expectIndicatorOnChecked(page, page.getByTestId(testId));
  }
});

test("rapid keyboard selection retargets the indicator instead of queueing and semantics are immediate", async ({ page }) => {
  const control = page.getByTestId("density");
  const radios = control.getByRole("radio");
  await radios.first().focus();

  // Engines differ on wrapping at the ends of a radio group, so the sequence
  // reverses direction instead of wrapping.
  const steps = [["ArrowRight", "compact"], ["ArrowRight", "dense"], ["ArrowRight", "auto"], ["ArrowLeft", "dense"], ["ArrowLeft", "compact"]];
  for (const [key, expected] of steps) {
    await page.keyboard.press(key);
    // Native selection is authoritative and immediate, not gated by motion.
    await expect(control.locator("input:checked")).toHaveValue(expected);
    const { running } = (await anchorSupported(page)) ? await indicatorState(control) : { running: [] };
    // At most one transition per inset property: retargeting replaces motion.
    expect(running.length).toBeLessThanOrEqual(4);
    expect(new Set(running).size).toBe(running.length);
  }

  await expectIndicatorOnChecked(page, control);
  await expect(control.locator("input:checked")).toHaveValue("compact");
  await expect(radios.nth(1)).toBeFocused();
});

test("keyboard and pointer activation end in the same semantic state", async ({ page }) => {
  const view = page.getByTestId("view");
  await view.getByText("Timeline").click();
  const byPointer = await page.locator("#controls").evaluate((form) => new FormData(form).get("view"));
  await page.reload();
  await view.getByRole("radio", { name: "Board" }).focus();
  await page.keyboard.press("ArrowRight");
  const byKeyboard = await page.locator("#controls").evaluate((form) => new FormData(form).get("view"));
  expect(byPointer).toBe("timeline");
  expect(byKeyboard).toBe(byPointer);

  const toggle = page.getByRole("switch", { name: "Deployment alerts" });
  await toggle.click();
  const switchByPointer = await toggle.isChecked();
  await page.reload();
  await toggle.focus();
  await page.keyboard.press("Space");
  expect(await toggle.isChecked()).toBe(switchByPointer);
});

test("press feedback never moves or resizes the hit target", async ({ page }) => {
  const targets = [
    page.getByTestId("density").locator(".ef-segment").nth(2),
    page.getByTestId("save"),
    page.locator(".ef-checkbox"),
    page.locator(".ef-switch")
  ];
  for (const target of targets) {
    const before = await target.boundingBox();
    const center = { x: before.x + before.width / 2, y: before.y + before.height / 2 };
    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    await page.waitForTimeout(250);
    const pressed = await target.boundingBox();
    const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest(".ef-segment, button, .ef-checkbox, .ef-switch") !== null, center);
    await page.mouse.up();
    expect(pressed).toEqual(before);
    expect(hit).toBe(true);
  }
});

test("button press state is immediate and non-spatial", async ({ page }) => {
  const save = page.getByTestId("save");
  const rest = await save.evaluate((element) => getComputedStyle(element).backgroundColor);
  const box = await save.boundingBox();
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  const pressed = await save.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    duration: getComputedStyle(element).transitionDuration,
    transform: getComputedStyle(element).transform,
    scale: getComputedStyle(element).scale
  }));
  await page.mouse.up();
  expect(pressed.background).not.toBe(rest);
  expect(Math.max(...seconds(pressed.duration))).toBe(0);
  expect(pressed.transform).toBe("none");
  expect(pressed.scale).toBe("none");
});

test("slider keeps native direct manipulation: only hover emphasis is transitioned", async ({ page }) => {
  const slider = page.getByRole("slider", { name: "Threshold" });
  const properties = await slider.evaluate((element) => getComputedStyle(element).transitionProperty.split(",").map((value) => value.trim()));
  expect(properties.sort()).toEqual(["filter", "opacity"]);
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("41");
  await slider.fill("90");
  await expect(slider).toHaveValue("90");
});

test("color and background changes use the shared perceptual timing", async ({ page }) => {
  const expected = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.animationDelay = "var(--ef-motion-perceptual-duration)";
    document.body.append(probe);
    const value = getComputedStyle(probe).animationDelay;
    probe.remove();
    return value;
  });
  const checks = [
    [".ef-switch__track", "background-color"],
    [".ef-checkbox__box", "background-color"],
    [".ef-segment", "background-color"],
    [".ef-slider__input", "filter"],
    ["[data-testid=save]", "background-color"]
  ];
  for (const [selector, property] of checks) {
    const { properties, durations } = await page.locator(selector).first().evaluate((element) => {
      const style = getComputedStyle(element);
      return { properties: style.transitionProperty.split(",").map((value) => value.trim()), durations: style.transitionDuration.split(",").map((value) => value.trim()) };
    });
    const index = properties.findIndex((name) => name === property || (property === "background-color" && name === "background"));
    expect(index, `${selector} transitions ${property}`).toBeGreaterThanOrEqual(0);
    expect(durations[index % durations.length]).toBe(expected);
  }
});

test("reduced motion removes indicator travel and press compression but keeps selection", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const control = page.getByTestId("density");
  const durations = await control.evaluate((element) => ({
    indicator: getComputedStyle(element, "::before").transitionDuration,
    label: getComputedStyle(element.querySelector(".ef-segment > span")).transitionDuration
  }));
  for (const value of [...seconds(durations.indicator), ...seconds(durations.label)]) expect(value).toBeLessThan(0.01);

  const segment = control.locator(".ef-segment").nth(1);
  const box = await segment.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const scale = await segment.locator("span").evaluate((element) => getComputedStyle(element).scale);
  await page.mouse.up();
  expect(scale === "1" || scale === "none").toBe(true);
  await expect(control.locator("input:checked")).toHaveValue("compact");
  await expectIndicatorOnChecked(page, control);
});

test("without anchor positioning the checked segment itself carries the selection", async ({ page }) => {
  await page.route("**/dist/components.css", async (route) => {
    const response = await route.fetch();
    const css = (await response.text()).replace("@supports (anchor-name: --ef-segment) and (anchor-scope: all)", "@supports (not-a-feature: 1)");
    await route.fulfill({ response, body: css });
  });
  await page.reload();
  const control = page.getByTestId("view");
  const indicator = await control.evaluate((element) => getComputedStyle(element, "::before").content);
  expect(indicator === "none" || indicator === "normal").toBe(true);
  await expectFallbackSelection(control);
  await control.getByText("Timeline").click();
  await expect(control.locator("input:checked")).toHaveValue("timeline");
  await expectFallbackSelection(control);
});

test("forced colors hides the decorative indicator and uses system selection colors", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.reload();
  const control = page.getByTestId("view");
  expect(await control.evaluate((element) => getComputedStyle(element, "::before").display)).toBe("none");
  await expectFallbackSelection(control);
});

test("the native radio stays topmost while its label text is press-compressed", async ({ page }) => {
  const segment = page.getByTestId("density").locator(".ef-segment").nth(1);
  const box = await segment.boundingBox();
  await page.mouse.move(box.x + 4, box.y + 4);
  await page.mouse.down();
  const topmost = await segment.locator("input").evaluate((input) => {
    const rect = input.getBoundingClientRect();
    return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === input;
  });
  await page.mouse.up();
  expect(topmost).toBe(true);
  await page.getByRole("radio", { name: "Dense" }).check();
  await expect(page.getByRole("radio", { name: "Dense" })).toBeChecked();
});
