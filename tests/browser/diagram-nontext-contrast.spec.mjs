import { expect, test } from "@playwright/test";

// R7-REM-009 (Rehearsal 6 UI-016-O11 / PF-016-O1): a diagram node outlined with
// a Forma status token keeps WCAG 1.4.11 non-text contrast (3:1) against its
// computed background. The markup mirrors Forma.Workflow's render of
// color.stroke = "token:status-*" (--ef-diagram-stroke: var(--ef-color-status-*)).
const STATUS = ["warning", "danger", "success", "info"];

const page_ = (nodes) => `<!doctype html>
<html lang="en" data-ef-theme="light">
<head>
  <meta charset="utf-8">
  <title>Diagram non-text contrast</title>
  <link rel="stylesheet" href="/dist/tokens.css">
  <link rel="stylesheet" href="/dist/foundations.css">
  <link rel="stylesheet" href="/dist/components.css">
</head>
<body><main>
<figure class="ef-diagram" aria-labelledby="t"><figcaption id="t">Outlines</figcaption>
<div class="ef-diagram__viewport" tabindex="0" role="region" aria-labelledby="t">
<ol class="ef-diagram__canvas" style="--ef-diagram-canvas-w: 60rem; --ef-diagram-canvas-h: 10rem;">
${nodes.map(([id, style], i) => `<li><article class="ef-diagram-node" id="${id}" aria-label="${id}" style="--ef-diagram-x: ${1 + i * 13}rem; --ef-diagram-y: 1rem; --ef-diagram-w: 12rem; ${style}"><p>${id}</p></article></li>`).join("\n")}
</ol></div></figure>
</main></body></html>`;

const channel = (value) => {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a, b) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};
const rgb = (css) => {
  const match = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(css);
  if (!match) throw new Error(`unparsed colour ${css}`);
  if (match[4] !== undefined && Number(match[4]) !== 1) throw new Error(`translucent colour ${css}`);
  return [1, 2, 3].map((i) => Number(match[i]));
};

const measure = (page, id) => page.locator(`#${id}`).evaluate((element) => {
  const style = getComputedStyle(element);
  return { top: style.borderTopColor, start: style.borderLeftColor, background: style.backgroundColor };
});

test("status-token outlines reach 3:1 against the computed node background in the light theme", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "computed-colour measurement is pinned to Chromium");
  await page.goto("/tests/browser/fixture/index.html");
  await page.setContent(page_([
    ...STATUS.map((status) => [`token-${status}`, `--ef-diagram-stroke: var(--ef-color-status-${status});`]),
    ["regression", "--ef-diagram-fill: #f5f3ed; --ef-diagram-stroke: #e9a23b;"]
  ]), { waitUntil: "load" });

  for (const status of STATUS) {
    const { top, start, background } = await measure(page, `token-${status}`);
    const surface = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--ef-color-surface-primary").trim());
    expect(surface).toBe("#f2efe7");
    expect(rgb(background)).toEqual([0xf2, 0xef, 0xe7]);
    for (const border of [top, start]) {
      const ratio = contrast(rgb(border), rgb(background));
      expect(ratio, `status-${status}: ${border} on ${background} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
    }
  }

  // Negative control: the Rehearsal 6 outline is measured as failing, so the
  // measurement can detect the defect it guards against.
  const regression = await measure(page, "regression");
  expect(contrast(rgb(regression.top), rgb(regression.background))).toBeLessThan(3);
});
