// Catalog-wide ULI-L05 sweep (visual-engineering/UI-LAYOUT-INTERACTION@1.0.0):
// every canonical Basic and catalog example rendered alone with real Forma CSS
// at 320 and 390 CSS px and at 100% and 200% default text size must not
// scroll the page sideways or push text out of the viewport or a clipping
// container. Contained, labelled scrollers (overflow auto/scroll) are allowed.
// Part of `npm run ui:conformance`; it renders 4 x every example.
import { expect, test } from "@playwright/test";
import { STATUS, measureOverflow } from "../../packages/conformance/src/index.mjs";
import { loadCatalog } from "../../tools/catalog/load.mjs";
import { wrapTag } from "../../tools/catalog/html.mjs";

const catalog = await loadCatalog(process.cwd());
const WIDTHS = [320, 390];
const SCALES = [1, 2];

const fixtureDocument = html => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/site-dist/assets/forma.css">
<style>body { margin: 0; padding: 12px; }</style></head>
<body>${/<main\b/.test(html) ? html : `<main>${html}</main>`}</body></html>`;

for (const component of catalog.components) {
  test(`ULI-L05 ${component.slug}: every example fits 320/390px at 100% and 200% text`, async ({ page, context }) => {
    const examples = [{ id: "basic", html: wrapTag(component.slug, component.pattern) }, ...component.examples.map(example => ({ id: example.id, html: example.html }))];
    const session = await context.newCDPSession(page);
    const findings = [];
    for (const scale of SCALES) {
      await session.send("Page.setFontSizes", { fontSizes: { standard: 16 * scale, fixed: 13 * scale } });
      for (const example of examples) {
        for (const width of WIDTHS) {
          await page.setViewportSize({ width, height: 800 });
          await page.route("**/__catalog-example.html", route => route.fulfill({ contentType: "text/html", body: fixtureDocument(example.html) }), { times: 1 });
          await page.goto("/__catalog-example.html");
          const report = await measureOverflow(page);
          if (report.status !== STATUS.PASS) findings.push(`${example.id} at ${width}px, ${scale * 100}% text: ${report.reason}\n    ${report.escapes.join("\n    ")}`);
        }
      }
    }
    expect(findings, findings.join("\n")).toEqual([]);
  });
}
