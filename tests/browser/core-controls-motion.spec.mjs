import { expect, test } from "@playwright/test";

// FORMA-MOT-002: core controls and selection interactions
// (requirements/MOTION-AND-INTERACTION.md MOT-014, MOT-015, MOT-026, sections 3-5).
const fixture = "/tests/browser/fixture/core-controls-motion.html";

const seconds = (value) => value.split(",").map((part) => {
  const trimmed = part.trim();
  return trimmed.endsWith("ms") ? Number.parseFloat(trimmed) / 1000 : Number.parseFloat(trimmed);
});

// Indicator geometry against the checked segment's layout box. Anchor
// positioning resolves against layout boxes (offset geometry, untransformed,
// relative to the control's padding box), so both sides are measured that way.
const indicatorState = (control) =>
  control.evaluate((element) => {
    const style = getComputedStyle(element, "::before");
    const checked = element.querySelector(".ef-segment:has(input:checked)");
    const segment = getComputedStyle(checked);
    return {
      display: style.display,
      left: Number.parseFloat(style.left),
      top: Number.parseFloat(style.top),
      width: Number.parseFloat(style.width),
      targetLeft: checked.offsetLeft,
      targetTop: checked.offsetTop,
      targetWidth: checked.offsetWidth,
      // Diagnostics only: reported when alignment fails.
      diagnostics: {
        right: style.right,
        clientWidth: element.clientWidth,
        segmentTransform: [segment.transform, segment.translate, segment.scale].join(" | "),
        controlBorder: getComputedStyle(element).borderWidth
      },
      running: element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState === "running" && animation.effect?.pseudoElement === "::before" && animation.effect?.target === element)
        .map((animation) => animation.transitionProperty)
    };
  });

const anchorSupported = (page) => page.evaluate(() => CSS.supports("anchor-name: --ef-segment") && CSS.supports("anchor-scope: all"));

// Without anchor positioning the checked segment's own background is the
// complete selection presentation (progressive enhancement).
// The background change is a perceptual transition, so the settled colors are
// polled rather than read at an arbitrary frame of the interpolation.
const expectFallbackSelection = async (control) => {
  await expect.poll(() => control.evaluate((element) => {
    const [a, b] = [".ef-segment:has(input:checked)", ".ef-segment:not(:has(input:checked))"]
      .map((selector) => getComputedStyle(element.querySelector(selector)).backgroundColor);
    return a !== b && a !== "rgba(0, 0, 0, 0)" ? "distinct" : `${a} vs ${b}`;
  }), { timeout: 2000 }).toBe("distinct");
};

// The rendered indicator, found in a screenshot of the control, must cover
// exactly the checked segment's box (within 1.5 CSS px on every edge). This
// checks what is painted rather than engine-specific geometry APIs. The scan
// runs 4px inside the segment's edges, clear of the centred label text;
// focus decoration is hidden for the capture only.
const renderedIndicatorEdges = async (control) => {
  // Focus decoration (outline plus dark ring) is hidden for the capture only.
  const image = (await control.screenshot({ style: ".ef-segment { outline: none !important; box-shadow: none !important; }" })).toString("base64");
  return control.evaluate(async (element, png) => {
    const box = element.getBoundingClientRect();
    const target = element.querySelector(".ef-segment:has(input:checked)").getBoundingClientRect();
    const picture = new Image();
    picture.src = `data:image/png;base64,${png}`;
    await picture.decode();
    const scale = picture.naturalWidth / box.width;
    const canvas = document.createElement("canvas");
    canvas.width = picture.naturalWidth;
    canvas.height = picture.naturalHeight;
    const context = canvas.getContext("2d");
    context.drawImage(picture, 0, 0);
    const luminance = (x, y) => {
      const [r, g, b] = context.getImageData(Math.round(x * scale), Math.round(y * scale), 1, 1).data;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const [indicatorLuma, surfaceLuma] = [luminance(target.left - box.left + 4, target.top - box.top + 4), luminance(1.5, box.height / 2)];
    const isIndicator = (x, y) => Math.abs(luminance(x, y) - indicatorLuma) < Math.abs(luminance(x, y) - surfaceLuma);
    // Walk outwards from inside the segment until the indicator colour ends.
    const run = (from, step, probe) => {
      let edge = from;
      while (edge + step >= 0 && edge + step <= Math.max(box.width, box.height) && probe(edge + step)) edge += step;
      return edge;
    };
    const quarter = 1 / scale;
    const [top, left] = [target.top - box.top + 4, target.left - box.left + 4];
    return {
      contrast: Math.abs(indicatorLuma - surfaceLuma),
      left: run(left, -quarter, (x) => isIndicator(x, top)),
      right: run(left, quarter, (x) => isIndicator(x, top)) + quarter,
      top: run(top, -quarter, (y) => isIndicator(left, y)),
      bottom: run(top, quarter, (y) => isIndicator(left, y)) + quarter,
      expected: { left: target.left - box.left, right: target.right - box.left, top: target.top - box.top, bottom: target.bottom - box.top }
    };
  }, image);
};

const expectIndicatorOnChecked = async (page, control) => {
  if (!(await anchorSupported(page))) return expectFallbackSelection(control);
  await settle(control);
  // Not every engine lists pseudo-element transitions in getAnimations(), so
  // the settled rendering is polled rather than read once.
  await expect.poll(async () => {
    const [state, painted] = [await indicatorState(control), await renderedIndicatorEdges(control)];
    const aligned = state.display !== "none"
      && painted.contrast > 40
      && ["left", "right", "top", "bottom"].every((edge) => Math.abs(painted[edge] - painted.expected[edge]) <= 1.5);
    return aligned ? "aligned" : JSON.stringify({ painted, computed: { ...state, running: undefined } });
  }, { timeout: 3000 }).toBe("aligned");
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
  // Leave the control so hover and pressed state cannot affect the geometry read.
  await page.mouse.move(0, 0);
  expect(scale === "1" || scale === "none").toBe(true);
  await expect(control.locator("input:checked")).toHaveValue("compact");
  // With no travel, the checked segment itself carries the selection.
  expect(await control.evaluate((element) => getComputedStyle(element, "::before").display)).toBe("none");
  await expectFallbackSelection(control);
});

test("pointer selection places the indicator exactly on the chosen option", async ({ page }) => {
  const control = page.getByTestId("density");
  const segment = control.locator(".ef-segment").nth(2);
  const box = await segment.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.move(0, 0);
  await expect(control.locator("input:checked")).toHaveValue("dense");
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
