// WI-0029: every documentation content page shares one vertical rhythm from
// the header to its first content, the current navigation section stays in
// view where the navigation strip scrolls, and hover-only styling never
// sticks on touch devices.
import { expect, test } from "@playwright/test";

// Pages built on the shared shell (.page-shell) and the catalog layout
// (.component-main). The home hero is intentionally different.
const contentPages = [
  "/site-dist/accessibility/index.html",
  "/site-dist/agents/index.html",
  "/site-dist/branding/index.html",
  "/site-dist/compositions/index.html"
];
const catalogPage = "/site-dist/components/index.html";

const firstContentOffset = page => page.evaluate(() => {
  const header = document.querySelector(".site-header").getBoundingClientRect();
  const main = document.querySelector("main");
  const first = main.querySelector(".breadcrumbs, .eyebrow, h1");
  const heading = main.querySelector("h1").getBoundingClientRect();
  return {
    first: first.getBoundingClientRect().top - header.bottom,
    heading: heading.top - header.bottom,
    mainStart: Number.parseFloat(getComputedStyle(main).paddingBlockStart) + Number.parseFloat(getComputedStyle(main).marginBlockStart)
  };
});

for (const width of [1440, 1024, 768, 390]) {
  test(`content pages share the catalog page-start rhythm at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(catalogPage);
    const reference = await page.evaluate(() =>
      Number.parseFloat(getComputedStyle(document.querySelector(".component-main")).paddingBlockStart));

    for (const url of contentPages) {
      await page.goto(url);
      const offset = await firstContentOffset(page);
      // Same page-start space as the catalog pages; no stacked margin plus
      // padding from several wrappers.
      expect(Math.abs(offset.mainStart - reference), `${url} page start`).toBeLessThan(0.5);
      expect(offset.first, `${url} first content`).toBeLessThanOrEqual(reference + 1);
      // The heading sits within one breadcrumb, eyebrow and heading margin
      // of the first content, never a viewport-scaled gap below it.
      expect(offset.heading - offset.first, `${url} heading`).toBeLessThan(140);
    }
  });
}

test("the current section stays visible where the navigation strip scrolls", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 800 });
    for (const [url, label] of [
      ["/site-dist/accessibility/index.html", "Accessibility"],
      ["/site-dist/agents/index.html", "Agent use"],
      ["/site-dist/components/dialog/index.html", "Components"],
      ["/site-dist/index.html", "Overview"]
    ]) {
      await page.goto(url);
      const state = await page.evaluate(() => {
        const nav = document.querySelector(".site-nav");
        const current = nav.querySelector("a[aria-current]");
        const navBox = nav.getBoundingClientRect();
        const box = current.getBoundingClientRect();
        return { label: current.textContent.trim(), inView: box.left >= navBox.left - 0.5 && box.right <= navBox.right + 0.5, pageScroll: scrollY };
      });
      expect(state, `${url} at ${width}px`).toEqual({ label, inView: true, pageScroll: 0 });
    }
  }
});

test.describe("touch devices", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("tapping a link or button leaves no hover-only styling behind", async ({ page }) => {
    await page.goto("/site-dist/components/index.html");
    const link = page.locator(".site-nav a:not([aria-current])").first();
    const before = await link.evaluate(element => getComputedStyle(element).borderBlockEndColor);
    expect(await page.evaluate(() => matchMedia("(hover: hover)").matches)).toBe(false);
    await link.hover();
    expect(await link.evaluate(element => getComputedStyle(element).borderBlockEndColor)).toBe(before);
  });
});
