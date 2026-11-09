import { expect, test } from "@playwright/test";
import { STATUS, measureContainment, measureOverflow } from "../../packages/conformance/src/index.mjs";

// MKT-CONTAIN (WI-0043): marketing components keep list-item, span and div
// content inside their boxes, and a toned CTA keeps a usable line length, at
// phone to desktop widths with default and 200% text. Before the fix, at 320px
// and 200% text, list words escaped .forma-card by up to 18px and .forma-steps rows
// in a toned .forma-cta had a 96px content box. Fixture:
// tests/browser/fixture/marketing-containment.html.
const FIXTURE = "/tests/browser/fixture/marketing-containment.html";
const WIDTHS = [320, 375, 768, 1280];
const ENLARGED = "html { font-size: 200%; }";

const open = async (page, width, css) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(FIXTURE);
  if (css) await page.addStyleTag({ content: css });
};

const failures = async page => {
  const containers = await page.locator("[data-mc-contain]").all();
  const reports = await Promise.all(containers.map(async locator => ({
    name: (await locator.getAttribute("data-mc-case")) ?? (await locator.evaluate(element => element.className)),
    report: await measureContainment(locator)
  })));
  return reports
    .filter(({ report }) => report.status !== STATUS.PASS)
    .map(({ name, report }) => `${name}: ${report.status} ${report.reason}`);
};

for (const width of WIDTHS) {
  for (const [label, css] of [["default text", null], ["200% text", ENLARGED]]) {
    test(`marketing components contain list, span and div content at ${width}px, ${label}`, async ({ page }) => {
      await open(page, width, css);
      const found = await failures(page);
      expect(found, found.join("\n")).toEqual([]);
      const overflow = await measureOverflow(page);
      expect(overflow.status, `${overflow.reason}\n${overflow.escapes.join("\n")}`).toBe(STATUS.PASS);
    });
  }
}

test("a toned CTA keeps a usable line length at 320px and 200% text", async ({ page }) => {
  await open(page, 320, ENLARGED);
  const steps = page.locator("[data-mc-case='cta-toned'] .forma-steps > li").first();
  const width = await steps.evaluate(element => element.clientWidth);
  // The toned section already caps its inline padding at 12.5vw for this case
  // (ULI-L05); the CTA must leave at least as much room for its content.
  expect(width, "step row width inside a toned CTA").toBeGreaterThanOrEqual(150);
});

test("words that fit are not split inside marketing cards", async ({ page }) => {
  await open(page, 1280, null);
  const items = await page.locator("[data-mc-case='card-list'] li").all();
  for (const item of items) {
    const lines = await item.evaluate(element => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return new Set([...range.getClientRects()].map(rect => Math.round(rect.top))).size;
    });
    expect(lines, `${await item.textContent()} stays on one line at 1280px`).toBe(1);
  }
});
