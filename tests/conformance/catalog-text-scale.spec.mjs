// Catalog-wide ULI-L05 sweep (visual-engineering/UI-LAYOUT-INTERACTION@1.0.0):
// every canonical Basic and catalog example rendered alone with real Forma CSS
// at 320 and 390 CSS px, at 100% and 200% default text size, and at 200% with
// wide fallback fonts must not
// scroll the page sideways or push text out of the viewport or a clipping
// container. Contained, labelled scrollers (overflow auto/scroll) are allowed.
// Part of `npm run ui:conformance`; it renders 4 x every example.
import { expect, test } from "@playwright/test";
import { STATUS, measureOverflow } from "../../packages/conformance/src/index.mjs";
import { loadCatalog } from "../../tools/catalog/load.mjs";
import { wrapTag } from "../../tools/catalog/html.mjs";

const catalog = await loadCatalog(process.cwd());
const WIDTHS = [320, 390];
// Fonts differ by machine: Forma's web fonts are not installed on CI runners
// or most test machines, and the fallback (DejaVu on Ubuntu, Inter here) can
// be considerably wider. A third pass maps Forma's families to the wide
// DejaVu faces so every machine checks the same wide-font case.
const PASSES = [
  { scale: 1, wideFonts: false },
  { scale: 2, wideFonts: false },
  { scale: 2, wideFonts: true }
];
const WIDE_FONTS = ['"Manrope"', '"IBM Plex Mono"', '"Newsreader"'].map((family, index) => {
  const face = ["DejaVu Sans", "DejaVu Sans Mono", "DejaVu Serif"][index];
  return `@font-face { font-family: ${family}; src: local("${face}"); } @font-face { font-family: ${family}; font-weight: 600 900; src: local("${face} Bold"); }`;
}).join("\n");

// One document with real Forma CSS; each example replaces <body> in place, so
// no per-example navigation is needed (and none can stall).
const BASE_DOCUMENT = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/site-dist/assets/forma.css">
<style>body { margin: 0; padding: 12px; }</style></head><body><main></main></body></html>`;

const renderExample = (page, html) => page.evaluate(markup => {
  document.body.innerHTML = /<main\b/.test(markup) ? markup : `<main>${markup}</main>`;
  window.scrollTo(0, 0);
}, html);

for (const component of catalog.components) {
  const examples = [{ id: "basic", html: wrapTag(component.slug, component.pattern) }, ...component.examples.map(example => ({ id: example.id, html: example.html }))];
  test(`ULI-L05 ${component.slug}: every example fits 320/390px at 100% and 200% text`, async ({ page, context }) => {
    test.setTimeout(30_000 + examples.length * WIDTHS.length * PASSES.length * 3_000);
    await page.route("**/__catalog-base.html", route => route.fulfill({ contentType: "text/html", body: BASE_DOCUMENT }));
    await page.goto("/__catalog-base.html");
    await page.waitForFunction(() => [...document.styleSheets].some(sheet => sheet.href?.endsWith("forma.css") && sheet.cssRules.length > 0));
    const session = await context.newCDPSession(page);
    const findings = [];
    for (const { scale, wideFonts } of PASSES) {
      await page.evaluate(css => {
        document.getElementById("wide-fonts")?.remove();
        if (css) document.head.insertAdjacentHTML("beforeend", `<style id="wide-fonts">${css}</style>`);
      }, wideFonts ? WIDE_FONTS : "");
      await session.send("Page.setFontSizes", { fontSizes: { standard: 16 * scale, fixed: 13 * scale } });
      await expect.poll(() => page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))).toBe(16 * scale);
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 800 });
        for (const example of examples) {
          await renderExample(page, example.html);
          const report = await measureOverflow(page);
          if (report.status !== STATUS.PASS) findings.push(`${example.id} at ${width}px, ${scale * 100}% text${wideFonts ? ", wide fallback fonts" : ""}: ${report.reason}\n    ${report.escapes.join("\n    ")}`);
        }
      }
    }
    expect(findings, findings.join("\n")).toEqual([]);
  });
}
