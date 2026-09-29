import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "site-dist", "site-manifest.json"), "utf8")
);

const pages = [
  "/site-dist/index.html",
  "/site-dist/agents/index.html",
  ...manifest.components.map(component =>
    `/site-dist/components/${component.slug}/index.html`
  )
];

// These tests visit every generated page in one test, so their budget must
// grow with the catalog instead of relying on the 30s default.
const perPageBudget = 1_500;
const loopTimeout = pageCount => Math.max(30_000, pageCount * perPageBudget);

const viewports = [
  { name: "compact phone", width: 320, height: 568 },
  { name: "modern phone", width: 390, height: 844 }
];

for (const viewport of viewports) {
  test(`generated site remains contained on ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
    test.setTimeout(loopTimeout(pages.length));
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const url of pages) {
      await page.goto(url);

      const result = await page.evaluate(() => {
        const documentWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        );

        const tooSmall = [];
        for (const element of document.querySelectorAll(
          ".site-nav a, .component-nav a, .ef-button, .example-block summary, .site-footer a"
        )) {
          const style = getComputedStyle(element);
          if (style.display === "none" || style.visibility === "hidden") continue;
          const rect = element.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          if (rect.width < 43.5 || rect.height < 43.5) {
            tooSmall.push({
              text: element.textContent?.trim().slice(0, 60) || "",
              width: Math.round(rect.width * 10) / 10,
              height: Math.round(rect.height * 10) / 10
            });
          }
        }

        const viewportWidth = document.documentElement.clientWidth;
        const overflowElements = [...document.querySelectorAll("body *")]
          .map(element => {
            const rect = element.getBoundingClientRect();
            return {
              element: element.tagName.toLowerCase(),
              className: typeof element.className === "string" ? element.className : "",
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            };
          })
          .filter(item => item.left < -1 || item.right > viewportWidth + 1)
          .sort((a, b) => b.width - a.width)
          .slice(0, 8);

        return {
          documentWidth,
          viewportWidth,
          tooSmall,
          overflowElements
        };
      });

      expect(
        result.documentWidth,
        `${url} creates page-level horizontal overflow at ${viewport.width}px: ${JSON.stringify(result.overflowElements)}`
      ).toBeLessThanOrEqual(result.viewportWidth + 1);

      expect(
        result.tooSmall,
        `${url} has undersized site touch targets at ${viewport.width}px: ${JSON.stringify(result.tooSmall)}`
      ).toEqual([]);
    }
  });
}


test("generated Visual Engineering stress specimens remain contained on phones", async ({ page }) => {
  test.setTimeout(loopTimeout(manifest.components.length * 2));
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const component of manifest.components) {
      await page.goto(`/site-dist/components/${component.slug}/index.html`);
      const screens = page.locator("[data-ve-stress]");
      await expect(screens).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        const box = await screens.nth(i).boundingBox();
        expect(box, `${component.slug} stress screen ${i} is not rendered`).not.toBeNull();
        expect(box.x, `${component.slug} stress screen escapes left at ${width}px`).toBeGreaterThanOrEqual(-1);
        expect(box.x + box.width, `${component.slug} stress screen escapes right at ${width}px`).toBeLessThanOrEqual(width + 1);
      }
    }
  }
});

// FORMA-MOT-009: the documentation site demonstrates the library's motion
// grammar instead of site-local timing.
test("site buttons use the shared perceptual motion and never move on hover", async ({ page }) => {
  await page.goto("/site-dist/index.html");
  const button = page.locator("a.ef-button").first();
  await button.scrollIntoViewIfNeeded();
  const style = await button.evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.animationDelay = "var(--ef-motion-perceptual-duration)";
    document.body.append(probe);
    const perceptual = getComputedStyle(probe).animationDelay;
    probe.remove();
    const computed = getComputedStyle(element);
    return { perceptual, properties: computed.transitionProperty, durations: computed.transitionDuration };
  });
  expect(style.properties).toBe("background, color");
  style.durations.split(", ").forEach((duration) => expect(duration).toBe(style.perceptual));
  const before = await button.boundingBox();
  await button.hover();
  await button.evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)));
  const after = await button.boundingBox();
  expect(after.y).toBeCloseTo(before.y, 1);
  expect(await button.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
});

test("reduced motion removes site transitions and smooth scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/site-dist/index.html");
  const state = await page.evaluate(() => ({
    scroll: getComputedStyle(document.documentElement).scrollBehavior,
    transition: getComputedStyle(document.querySelector("a.ef-button")).transitionProperty
  }));
  expect(state.scroll).toBe("auto");
  expect(state.transition).toBe("none");
});
