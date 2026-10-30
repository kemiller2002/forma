import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Word integrity (LRP-001): containment must not be bought by splitting words
// that fit. A word that renders on two lines although its unbroken width fits
// its block's content box is a regression (the independent review caught
// "Filters" splitting in collection-toolbar when summary inherited
// overflow-wrap: anywhere). Hyphens and slashes are break opportunities, so
// they delimit words. A word wider than its box may break: that is containment.
const root = process.cwd();
const css = fs.readFileSync(path.join(root, "dist", "all.css"), "utf8");
const patterns = fs.readdirSync(path.join(root, "patterns")).filter(file => file.endsWith(".html")).sort();

const documentFor = (source, extra = "") => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Word integrity</title><style>${css}</style><style>body{padding:1rem}${extra}</style></head><body>${source}</body></html>`;

export const splitWordsThatFit = page => page.evaluate(() => {
  const found = [];
  const lineCount = range => new Set([...range.getClientRects()].filter(rect => rect.width > 0).map(rect => Math.round(rect.top))).size;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let text = walker.nextNode(); text; text = walker.nextNode()) {
    const owner = text.parentElement;
    if (!owner || !owner.checkVisibility()) continue;
    // The reference box is the nearest block that is not a flex item: a flex
    // item's width comes from its content's minimum, which is exactly what an
    // inherited overflow-wrap: anywhere shrinks, so its own width is not a fair
    // reference. Grid items keep their track's width, which authors size.
    const sizedByParent = element => element.parentElement && /flex/.test(getComputedStyle(element.parentElement).display);
    let block = owner;
    while (block.parentElement && (getComputedStyle(block).display.startsWith("inline") || sizedByParent(block))) block = block.parentElement;
    const style = getComputedStyle(block);
    const available = block.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    // A whitespace-delimited token wider than its box must break somewhere: that is containment.
    const tokens = /\S+/g;
    for (let token = tokens.exec(text.data); token; token = tokens.exec(text.data)) {
      const probe = document.createElement("span");
      probe.style.whiteSpace = "nowrap";
      probe.textContent = token[0];
      owner.appendChild(probe);
      const natural = probe.getBoundingClientRect().width;
      probe.remove();
      if (natural >= available - 1) continue;
      // The token fits, so it may break only at a hyphen or slash, never inside a word.
      const words = /[^\-/\u2010-\u2014]+/g;
      for (let word = words.exec(token[0]); word; word = words.exec(token[0])) {
        const range = document.createRange();
        range.setStart(text, token.index + word.index);
        range.setEnd(text, token.index + word.index + word[0].length);
        if (lineCount(range) > 1) found.push(`"${word[0]}" in "${token[0].slice(0, 40)}" (${natural.toFixed(1)}px) split in ${block.tagName.toLowerCase()}${[...block.classList].slice(0, 1).map(name => "." + name).join("")} (${available.toFixed(1)}px available)`);
      }
    }
  }
  return found;
});

for (const width of [320, 375]) {
  test(`no canonical pattern splits a word that fits its box at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const failures = [];
    for (const file of patterns) {
      await page.setContent(documentFor(fs.readFileSync(path.join(root, "patterns", file), "utf8")));
      failures.push(...(await splitWordsThatFit(page)).map(entry => `${file}: ${entry}`));
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
}

test("the layout reliability fixtures split only words wider than their box", async ({ page }) => {
  for (const width of [320, 375, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/tests/browser/fixture/layout-reliability.html");
    const failures = await splitWordsThatFit(page);
    expect(failures, `${width}px\n${failures.join("\n")}`).toEqual([]);
  }
});

// Review counterexample (LRP-001 review finding 2): with overflow-wrap:
// anywhere inherited from Forma containers, every word's minimum width drops
// to one character, so an auto-sized flex item gives its width away and a
// short word that fits splits. Forma now inherits break-word, which keeps
// word minimums; the injected rule proves the detector sees the regression.
const flexRow = `<div class="ef-surface"><div style="display:flex"><span>Deployment identifier for the release candidate build</span><span>Production</span></div></div>`;

test("short words in an ordinary flex row inside a Forma container stay whole", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(documentFor(flexRow));
  expect(await splitWordsThatFit(page)).toEqual([]);
  await page.setContent(documentFor(flexRow, ".ef-surface { overflow-wrap: anywhere; }"));
  expect((await splitWordsThatFit(page)).some(entry => entry.startsWith('"Production"')), "the detector reports the anywhere regression").toBe(true);
});
