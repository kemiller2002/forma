import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { STATUS, measureContainment, measureOverflow } from "../../packages/conformance/src/index.mjs";

// Indy Init compatibility evidence (LRP-001.7): Causa-shaped regions built
// only from canonical Forma patterns, at the viewports Indy Init requires
// (docs/SCREEN-CONTRACTS.md: narrow phone, iPad portrait and landscape,
// desktop, high zoom). WebKit stands in for iPad Safari.
const FIXTURE = "/tests/browser/fixture/causa-representative.html";
const VIEWPORTS = [
  { name: "narrow phone", width: 320, height: 800 },
  { name: "iPad portrait", width: 820, height: 1180 },
  { name: "iPad landscape", width: 1180, height: 820 },
  { name: "desktop", width: 1440, height: 900 }
];

for (const viewport of VIEWPORTS) {
  for (const [label, css] of [["default text", null], ["200% text", "html { font-size: 200%; }"]]) {
    test(`Causa-shaped regions stay contained without page scrolling: ${viewport.name}, ${label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(FIXTURE);
      if (css) await page.addStyleTag({ content: css });
      const regions = await page.locator("[data-lr-contain]").all();
      const failures = [];
      for (const region of regions) {
        const report = await measureContainment(region);
        if (report.status !== STATUS.PASS) failures.push(`${await region.getAttribute("data-lr-region")}: ${report.reason}`);
      }
      expect(failures, failures.join("\n")).toEqual([]);
      const overflow = await measureOverflow(page);
      expect(overflow.status, `${overflow.reason}\n${overflow.escapes.join("\n")}`).toBe(STATUS.PASS);
      const graph = await page.locator("[data-lr-scroll]").evaluate(element => element.scrollWidth > element.clientWidth);
      expect(graph, "the graph canvas scrolls inside its region instead of the page").toBe(true);
    });
  }
}

test("Causa-shaped regions have no axe WCAG A/AA violations on iPad portrait", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto(FIXTURE);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(" ")).join(", ")}`)).toEqual([]);
});
