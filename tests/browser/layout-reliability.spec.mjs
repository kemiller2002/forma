import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  STATUS,
  measureContainment,
  measureCornerContainment,
  measureFocusVisibility,
  measureLabelIntegrity,
  measureOverflow
} from "../../packages/conformance/src/index.mjs";

// Layout reliability (forma#LRP-001): adversarial fixtures, one per failure
// class, measured in the rendered browser. Every [data-lr-contain] container
// must hold each descendant box and text line inside its content box;
// overlays and intentional scrollers declare other contracts and are checked
// separately. See docs/reliability/layout-baseline.md for the defects these
// fixtures reproduced before the patch.
const FIXTURE = "/tests/browser/fixture/layout-reliability.html";
const WIDTHS = [320, 375, 768, 1280];
const ENLARGED = "html { font-size: 200%; }";

const open = async (page, { width, css } = {}) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(FIXTURE);
  if (css) await page.addStyleTag({ content: css });
};

const containers = page => page.locator("[data-lr-contain]:not(dialog)");

const fixtureOf = locator => locator.evaluate(element => element.closest("[data-lr-fixture]")?.dataset.lrFixture ?? "?");

const containmentFailures = async page => {
  const all = await containers(page).all();
  const reports = await Promise.all(all.map(async locator => ({ fixture: await fixtureOf(locator), report: await measureContainment(locator) })));
  return reports
    .filter(({ report }) => report.status !== STATUS.PASS)
    .map(({ fixture, report }) => `${fixture} ${report.name}: ${report.status} ${report.reason}`);
};

for (const width of WIDTHS) {
  for (const [label, css] of [["default text", null], ["200% text", ENLARGED]]) {
    test(`every fixture keeps its content inside its container at ${width}px, ${label}`, async ({ page }) => {
      await open(page, { width, css });
      const failures = await containmentFailures(page);
      expect(failures, failures.join("\n")).toEqual([]);
    });

    test(`no unintended horizontal page scrolling at ${width}px, ${label}`, async ({ page }) => {
      await open(page, { width, css });
      const report = await measureOverflow(page);
      expect(report.status, `${report.reason}\n${report.escapes.join("\n")}`).toBe(STATUS.PASS);
    });
  }
}

test("a long paragraph and tokens stay inside a rounded brand panel at 320px and 200% text", async ({ page }) => {
  for (const css of [null, ENLARGED]) {
    await open(page, { width: 320, css });
    const panel = page.locator("[data-lr-corner]");
    expect(await panel.evaluate(element => parseFloat(getComputedStyle(element).borderTopLeftRadius)), "the fixture panel is rounded").toBeGreaterThan(0);
    const report = await measureCornerContainment(panel);
    expect(report.status, report.reason).toBe(STATUS.PASS);
  }
});

test("buttons beside a long label keep their labels intact and their touch size", async ({ page }) => {
  for (const width of [320, 1280]) {
    await open(page, { width });
    const buttons = await page.locator("[data-lr-fixture='flex-row'] button, [data-lr-fixture='narrow-form'] button").all();
    for (const button of buttons) {
      const report = await measureLabelIntegrity(button);
      expect(report.status, `${await button.textContent()} at ${width}px: ${report.reason}`).toBe(STATUS.PASS);
      const box = await button.boundingBox();
      expect(box.height, `${await button.textContent()} keeps the 44px minimum`).toBeGreaterThanOrEqual(43.5);
    }
  }
});

test("short labels are not wrapped by the containment rules", async ({ page }) => {
  await open(page, { width: 1280 });
  const lines = locator => locator.evaluate(element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return new Set([...range.getClientRects()].filter(rect => rect.width > 0).map(rect => Math.round(rect.top))).size;
  });
  for (const selector of ["[data-lr-row] button >> nth=0", "[data-lr-fixture='enlarged-text'] .ef-status-lozenge >> nth=0", "[data-lr-fixture='navigation'] nav a >> nth=0"]) {
    expect(await lines(page.locator(selector)), selector).toBe(1);
  }
});

test("an intentional scroller keeps its content unwrapped and scrollable", async ({ page }) => {
  await open(page, { width: 320 });
  const scroller = page.locator("[data-lr-scroll]");
  const { scrollWidth, clientWidth, preWraps } = await scroller.evaluate(element => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
    preWraps: element.querySelector("pre").getClientRects().length > 1 || getComputedStyle(element.querySelector("pre")).whiteSpace !== "pre"
  }));
  expect(scrollWidth).toBeGreaterThan(clientWidth);
  expect(preWraps).toBe(false);
});

const mediaBox = page => page.locator("[data-lr-media]").evaluate(element => {
  const box = element.getBoundingClientRect();
  const parent = element.parentElement;
  const style = getComputedStyle(parent);
  const content = parent.getBoundingClientRect().width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);
  return { width: box.width, height: box.height, content };
});

test("large media fits its container and icons keep their intrinsic size", async ({ page }) => {
  for (const width of [320, 1280]) {
    await open(page, { width });
    const media = await mediaBox(page);
    expect(media.width, `media fits at ${width}px`).toBeLessThanOrEqual(media.content + 1);
    const icon = await page.locator("[data-lr-icon]").boundingBox();
    expect([Math.round(icon.width), Math.round(icon.height)]).toEqual([20, 20]);
  }
});

// Unresolved (docs/reliability/layout-baseline.md, D3): a narrowed SVG with
// width/height attributes keeps its attribute height, so its box is taller
// than the drawing (the drawing itself is letterboxed, not distorted). No
// single declaration fixes it without a regression in some engine: block-size
// auto re-enables flex stretch of icons (all engines), and the intrinsic
// keywords that avoid stretch do not resize SVG in WebKit. Authors size such
// charts with block-size: auto or omit the height attribute.
test.fixme("a narrowed SVG chart keeps its box aspect ratio", async ({ page }) => {
  await open(page, { width: 320 });
  const media = await mediaBox(page);
  expect(media.height / media.width).toBeCloseTo(400 / 1200, 2);
});

test("a dialog with long validation errors contains them and stays in the viewport", async ({ page }) => {
  for (const width of [320, 768]) {
    for (const css of [null, ENLARGED]) {
      await open(page, { width, css });
      await page.getByRole("button", { name: "Open conflict dialog" }).click();
      const dialog = page.getByRole("dialog", { name: "Save conflict" });
      await expect(dialog).toBeVisible();
      const report = await measureContainment(dialog);
      expect(report.status, `${width}px ${css ? "200%" : "default"}: ${report.reason}`).toBe(STATUS.PASS);
      const box = await dialog.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      await page.keyboard.press("Tab");
      const focus = await measureFocusVisibility(page);
      expect(focus.status, focus.reason).toBe(STATUS.PASS);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    }
  }
});

test("a dropdown opened at the viewport edge stays on screen, contains its items and shows focus", async ({ page }) => {
  for (const width of [320, 1280]) {
    await open(page, { width });
    await page.getByRole("button", { name: "More actions" }).click();
    const menu = page.locator("#f8-menu");
    await expect(menu).toBeVisible();
    const box = await menu.boundingBox();
    expect(box.x, `menu left edge at ${width}px`).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, `menu right edge at ${width}px`).toBeLessThanOrEqual(width);
    const report = await measureContainment(menu);
    expect(report.status, report.reason).toBe(STATUS.PASS);
    await page.getByRole("button", { name: "Duplicate investigation" }).focus();
    await page.keyboard.press("Tab");
    const focus = await measureFocusVisibility(page);
    expect(focus.status, focus.reason).toBe(STATUS.PASS);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  }
});

test("keyboard focus stays visible and unclipped across every fixture", async ({ page }) => {
  for (const [width, css] of [[320, null], [375, ENLARGED], [1280, null]]) {
    await open(page, { width, css });
    const failures = [];
    let measured = 0;
    for (let step = 0; step < 40; step += 1) {
      await page.keyboard.press("Tab");
      const report = await measureFocusVisibility(page);
      if (report.status === STATUS.FAIL) failures.push(`${width}px step ${step} "${report.name}": ${report.reason}`);
      if (report.status === STATUS.PASS) measured += 1;
    }
    expect(failures, failures.join("\n")).toEqual([]);
    // Non-vacuous: focus actually reached the fixtures' controls.
    expect(measured, `${width}px focus stops measured`).toBeGreaterThanOrEqual(20);
  }
});

test("containment holds in the dark theme and with the compact and square skins", async ({ page }) => {
  for (const attributes of [{ "data-ef-theme": "dark" }, { "data-ef-skin": "compact" }, { "data-ef-skin": "square" }]) {
    await open(page, { width: 375 });
    await page.evaluate(entries => entries.forEach(([name, value]) => document.documentElement.setAttribute(name, value)), Object.entries(attributes));
    const failures = await containmentFailures(page);
    expect(failures, `${JSON.stringify(attributes)}\n${failures.join("\n")}`).toEqual([]);
  }
});

test("the fixtures have no axe WCAG A/AA violations at 375px", async ({ page }) => {
  await open(page, { width: 375 });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map(violation => `${violation.id}: ${violation.nodes.length}`)).toEqual([]);
});
