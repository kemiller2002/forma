import { expect, test } from "@playwright/test";
import { gridDocument, pattern } from "./character-grid-helpers.mjs";

// WCAG 2.2 SC 1.4.12 text-spacing bookmarklet values, applied as a user would.
const textSpacing = `* {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
p { margin-block-end: 2em !important; }`;

const runBoxes = page => page.evaluate(() =>
  [...document.querySelectorAll(".ef-character-grid__surface [data-ef-row]")].map(run => {
    const box = run.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(run);
    const text = range.getBoundingClientRect();
    const style = getComputedStyle(run);
    return {
      id: run.id || run.textContent.trim().slice(0, 16),
      box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
      textRight: text.right,
      overflowX: style.overflowX,
      clip: style.clipPath
    };
  }));

const intersects = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;

test("runtime overflow is never clipped: an over-length value stays readable past its run", async ({ page }) => {
  const overLength = pattern("character-grid").replace(">NORTH-EAST<", ">NORTH-EAST-REGION-7<");
  await page.setContent(gridDocument(overLength));
  const [value] = (await runBoxes(page)).filter(run => run.id.startsWith("NORTH-EAST-REG"));
  expect(value.overflowX).toBe("visible");
  expect(value.textRight, "text extends beyond the 10-cell run instead of being cut").toBeGreaterThan(value.box.right + 1);
});

test("text-spacing overrides (GAP-TCG-11): contained grids overflow cells visibly rather than clipping", async ({ page }) => {
  await page.setContent(gridDocument(pattern("character-grid-3270"), { extraCss: textSpacing }));
  const runs = await runBoxes(page);
  const title = runs.find(run => run.id === "character-grid-3270-title");
  expect(title.overflowX).toBe("visible");
  expect(title.textRight, "letter-spacing widens text beyond its 1ch cells").toBeGreaterThan(title.box.right);
  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageWidth, "still no page-level overflow").toBeLessThanOrEqual(1);
});

test("text-spacing overrides: reflow keeps every run readable without overlap or horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  const reflow = pattern("character-grid-field").replace('data-ef-narrow="contained"', 'data-ef-narrow="reflow"');
  await page.setContent(gridDocument(reflow, { extraCss: textSpacing }));
  const runs = await runBoxes(page);
  for (let i = 0; i < runs.length; i += 1) {
    for (let j = i + 1; j < runs.length; j += 1) {
      expect(intersects(runs[i].box, runs[j].box), `${runs[i].id} overlaps ${runs[j].id}`).toBeFalsy();
    }
  }
  const viewport = await page.locator(".ef-character-grid__viewport").evaluate(element => element.scrollWidth - element.clientWidth);
  expect(viewport).toBeLessThanOrEqual(1);
});

test("focus is never hidden by the contained scroller (WCAG 2.4.11)", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(gridDocument(pattern("character-grid-3270")));
  const viewport = page.locator(".ef-character-grid__viewport");
  await viewport.focus();
  const tabbable = await page.locator(".ef-character-grid__viewport :is(input, button):not([disabled])").count();
  for (let step = 0; step < tabbable; step += 1) {
    await page.keyboard.press("Tab");
    const visible = await page.evaluate(() => {
      const focused = document.activeElement.getBoundingClientRect();
      const port = document.activeElement.closest(".ef-character-grid__viewport").getBoundingClientRect();
      const width = Math.min(focused.right, port.right) - Math.max(focused.left, port.left);
      return { id: document.activeElement.id || document.activeElement.dataset.efAction, width };
    });
    expect(visible.width, `${visible.id} is at least partly visible`).toBeGreaterThan(0);
  }
});

test("collisions are not resolved by CSS: both runs render, which is why conformance rejects them", async ({ page }) => {
  const collided = pattern("character-grid").replace(
    '<p class="ef-character-grid__text" data-ef-row="3"',
    '<span class="ef-character-grid__text" id="intruder" data-ef-row="3" data-ef-col="4" data-ef-len="4">XXXX</span><p class="ef-character-grid__text" data-ef-row="3"'
  );
  await page.setContent(gridDocument(collided));
  const runs = await runBoxes(page);
  const intruder = runs.find(run => run.id === "intruder");
  const sentence = runs.find(run => run.id.startsWith("Positioned"));
  expect(intersects(intruder.box, sentence.box)).toBeTruthy();
});
