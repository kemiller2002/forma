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

// Known limitation, reported rather than hidden (docs/reliability/
// indy-init-compatibility.md): .ef-dashboard-grid (three fixed columns),
// .ef-split-pane (a 16rem secondary minimum) and .ef-operation-status (an auto
// actions column) collapse only at a viewport media
// query, so page-level 200% text at iPad portrait width leaves them wider than
// their region. The same class as the alert component's viewport-based stacking (known issue). These
// regions must still fail here, so a fix is noticed.
const KNOWN_LIMITATIONS = { "iPad portrait|200% text": ["dashboard", "inspector", "operation"] };

for (const viewport of VIEWPORTS) {
  for (const [label, css] of [["default text", null], ["200% text", "html { font-size: 200%; }"]]) {
    test(`Causa-shaped regions stay contained without page scrolling: ${viewport.name}, ${label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(FIXTURE);
      if (css) await page.addStyleTag({ content: css });
      const known = KNOWN_LIMITATIONS[`${viewport.name}|${label}`] ?? [];
      const regions = await page.locator("[data-lr-contain]").all();
      const failures = [];
      const knownFailures = [];
      for (const region of regions) {
        const name = await region.getAttribute("data-lr-region");
        const report = await measureContainment(region);
        if (report.status !== STATUS.PASS) (known.includes(name) ? knownFailures : failures).push(`${name}: ${report.reason}`);
      }
      expect(failures, failures.join("\n")).toEqual([]);
      expect(knownFailures.length, `known limitation ${known.join(", ")} no longer reproduces; remove it from KNOWN_LIMITATIONS`).toBe(known.length);
      // The known-limitation regions also widen the page; elsewhere the page must not scroll.
      const overflow = await measureOverflow(page);
      expect(overflow.status, `${overflow.reason}\n${overflow.escapes.join("\n")}`).toBe(known.length > 0 ? STATUS.FAIL : STATUS.PASS);
      const graph = await page.locator("[data-lr-scroll]").evaluate(element => element.scrollWidth > element.clientWidth);
      expect(graph, "the graph canvas scrolls inside its region instead of the page").toBe(true);
    });
  }
}

test("the command interface opens as a modal overlay that contains its commands and stays on screen", async ({ page }) => {
  for (const { width, height } of [VIEWPORTS[0], VIEWPORTS[1]]) {
    for (const css of [null, "html { font-size: 200%; }"]) {
      await page.setViewportSize({ width, height });
      await page.goto(FIXTURE);
      if (css) await page.addStyleTag({ content: css });
      await page.locator("#command-palette").evaluate(dialog => dialog.showModal());
      const palette = page.getByRole("dialog", { name: "Commands" });
      await expect(palette).toBeVisible();
      const report = await measureContainment(palette);
      expect(report.status, `${width}px ${css ? "200%" : "default"}: ${report.reason}`).toBe(STATUS.PASS);
      const box = await palette.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      await page.keyboard.press("Escape");
      await expect(palette).toBeHidden();
    }
  }
});

test("Causa-shaped regions have no axe WCAG A/AA violations on iPad portrait", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto(FIXTURE);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(" ")).join(", ")}`)).toEqual([]);
});
