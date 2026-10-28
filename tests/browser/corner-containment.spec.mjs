import { expect, test } from "@playwright/test";
import { measureCornerContainment } from "../../packages/conformance/src/index.mjs";

// Regression for LCE-001 (Forma 0.10.0): a brand --ef-shape-radius on the
// marketing badge, button and card is capped by each component's padding, so
// wrapped text never crosses the visible curve. Removing the cap makes these
// fail (verified for EII-F by reverting it locally).
const RADII = { pill: "999px", half: "50%" };
const SUBJECTS = ["#badge", "#button", "#card"];

for (const [label, radius] of Object.entries(RADII)) {
  for (const width of [320, 375]) {
    test(`wrapped text stays inside a ${label} brand radius at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/tests/browser/fixture/corner-containment.html");
      await page.addStyleTag({ content: `:root { --ef-shape-radius: ${radius}; }` });
      const failures = [];
      for (const selector of SUBJECTS) {
        const subject = page.locator(selector);
        const lines = await subject.evaluate(element => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return new Set([...range.getClientRects()].map(rect => Math.round(rect.top))).size;
        });
        expect(lines, `${selector} wraps, so its text reaches the corners`).toBeGreaterThan(1);
        const report = await measureCornerContainment(subject);
        if (report.status !== "PASS") failures.push(`${selector}: ${report.status} ${report.reason}`);
      }
      expect(failures, failures.join("\n")).toEqual([]);
    });
  }
}
