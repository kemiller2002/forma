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

// Painted boxes of every leaf run: its text (a visually hidden caption is
// excluded) and any native control it is or contains.
const inkBoxes = page => page.evaluate(() =>
  [...document.querySelectorAll(".ef-character-grid__surface [data-ef-row]")]
    .filter(run => !run.classList.contains("ef-character-grid__group"))
    .map(run => {
      const range = document.createRange();
      range.selectNodeContents(run);
      const caption = run.querySelector("caption");
      if (caption) range.setStartAfter(caption);
      const controls = [...(run.matches("input, button") ? [run] : []), ...run.querySelectorAll("input, button")];
      const rects = [...range.getClientRects(), ...controls.map(control => control.getBoundingClientRect())]
        .filter(rect => rect.width > 0.5 && rect.height > 0.5)
        .map(({ left, right, top, bottom }) => ({ left, right, top, bottom }));
      const grids = [...document.querySelectorAll(".ef-character-grid__surface")];
      const grid = grids.indexOf(run.closest(".ef-character-grid__surface"));
      return { id: run.id || run.textContent.trim().slice(0, 16), grid, col: Number(run.dataset.efCol), left: run.getBoundingClientRect().left, rects };
    }));

const overlaps = runs => runs.flatMap((a, i) => runs.slice(i + 1)
  .filter(b => a.rects.some(x => b.rects.some(y => intersects(x, y))))
  .map(b => `${a.id} ~ ${b.id}`));

// Runs that start in the same column of one grid start at the same x in every row.
const misaligned = runs => Object.values(Object.groupBy(runs, run => `${run.grid}:${run.col}`))
  .filter(column => Math.max(...column.map(run => run.left)) - Math.min(...column.map(run => run.left)) > 1)
  .map(column => `col ${column[0].col}: ${column.map(run => run.id).join(", ")}`);

const pageOverflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test("runtime overflow is never clipped: an over-length value widens its columns without overlapping", async ({ page }) => {
  const overLength = pattern("character-grid").replace(">NORTH-EAST<", ">NORTH-EAST-REGION-7<");
  await page.setContent(gridDocument(overLength));
  const [value] = (await runBoxes(page)).filter(run => run.id.startsWith("NORTH-EAST-REG"));
  expect(value.overflowX).toBe("visible");
  expect(value.clip).toBe("none");
  const runs = await inkBoxes(page);
  expect(overlaps(runs)).toEqual([]);
  expect(misaligned(runs)).toEqual([]);
});

const spacedPatterns = ["character-grid", "character-grid-field", "character-grid-keys", "character-grid-status", "character-grid-3270", "character-grid-workflow"];

for (const name of spacedPatterns) {
  test(`text-spacing overrides (GAP-TCG-11): ${name} keeps every run readable, aligned, and unoverlapped`, async ({ page }) => {
    await page.setContent(gridDocument(pattern(name), { extraCss: textSpacing }));
    const runs = await inkBoxes(page);
    expect(overlaps(runs), "no run paints over another").toEqual([]);
    expect(misaligned(runs), "shared columns stay aligned across rows").toEqual([]);
    expect(await pageOverflow(page), "still no page-level overflow").toBeLessThanOrEqual(1);
  });
}

test("text-spacing overrides: a full-length field value stays visible, or scrolls natively where field sizing is unsupported", async ({ page }) => {
  await page.setContent(gridDocument(pattern("character-grid-workflow"), { extraCss: textSpacing }));
  const fields = await page.evaluate(() => ({
    fieldSizing: CSS.supports("field-sizing", "content"),
    full: [...document.querySelectorAll(".ef-character-grid__field")]
      .filter(field => field.value.length === field.maxLength)
      .map(field => ({ id: field.id, hidden: field.scrollWidth - field.clientWidth, width: field.getBoundingClientRect().width, cells: field.getBoundingClientRect().width / Number(field.dataset.efLen) }))
  }));
  expect(fields.full.length, "the workflow has full-length values").toBeGreaterThan(0);
  for (const field of fields.full) {
    if (fields.fieldSizing) {
      expect(field.hidden, `${field.id} shows its whole value`).toBeLessThanOrEqual(1);
    } else {
      expect(field.width, `${field.id} keeps its declared box`).toBeGreaterThan(0);
    }
  }
});

test("without overrides every column and row track is exactly one cell", async ({ page }) => {
  for (const [width, rootFontSize] of [[1280, "100%"], [1280, "200%"], [390, "100%"], [320, "100%"], [320, "200%"]]) {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(gridDocument(spacedPatterns.map(pattern).join(""), { rootFontSize }));
    const uneven = await page.evaluate(() => [...document.querySelectorAll(".ef-character-grid__surface")].flatMap((surface, index) => {
      const style = getComputedStyle(surface);
      return [style.gridTemplateColumns, style.gridTemplateRows]
        .map(tracks => tracks.split(" "))
        .filter(tracks => tracks.some(track => track !== tracks[0]))
        .map(tracks => `grid ${index}: ${tracks.join(" ")}`);
    }));
    expect(uneven, `${width}px at ${rootFontSize}`).toEqual([]);
  }
});

test("fields and keys fill exactly one row pitch: foundation target minimums do not leak into runs", async ({ page }) => {
  await page.setContent(gridDocument(["character-grid-field", "character-grid-keys", "character-grid-workflow"].map(pattern).join("")));
  const heights = await page.evaluate(() => [...document.querySelectorAll(".ef-character-grid__surface > :is(input, button), .ef-character-grid__group > :is(input, button)")].map(control => {
    const pitch = Number.parseFloat(getComputedStyle(control.closest(".ef-character-grid__surface")).gridTemplateRows);
    return { id: control.id || control.dataset.efAction, delta: control.getBoundingClientRect().height - pitch };
  }));
  expect(heights.length).toBeGreaterThan(0);
  for (const { id, delta } of heights) expect(Math.abs(delta), `${id} height`).toBeLessThanOrEqual(1);
});

test("a table run stays inside its declared rows", async ({ page }) => {
  await page.setContent(gridDocument(pattern("character-grid-workflow")));
  const tables = await page.evaluate(() => [...document.querySelectorAll(".ef-character-grid__table")].map(run => {
    const outer = run.getBoundingClientRect();
    const table = run.querySelector("table").getBoundingClientRect();
    return { top: table.top - outer.top, bottom: table.bottom - outer.bottom };
  }));
  expect(tables.length).toBeGreaterThan(0);
  for (const { top, bottom } of tables) {
    expect(Math.abs(top), "table starts on the run's first row").toBeLessThanOrEqual(1);
    expect(bottom, "table ends within the run's last row").toBeLessThanOrEqual(1);
  }
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
