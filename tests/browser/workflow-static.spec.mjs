import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Static workflow HTML (requirements/PORTABLE-WORKFLOW-INTERCHANGE.md "HTML output";
// ADR-0006). The golden exports in examples/workflows/exports are produced by
// Forma.Workflow and checked byte-for-byte by tests/workflow; here they render in
// real browsers as an ordinary page would serve them.
const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const exportsDir = "examples/workflows/exports";
const documents = fs.readdirSync(exportsDir).filter((f) => f.endsWith(".document.html") && !f.startsWith("interactive"));

const open = async (page, file, width = 1280) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/tests/browser/fixture/index.html");
  const html = fs.readFileSync(`${exportsDir}/${file}`, "utf8").replaceAll("node_modules/@echelon-foundry/design-system/dist/", "/dist/");
  await page.setContent(html, { waitUntil: "load" });
};

for (const file of documents) {
  test(`${file}: no automatically detectable accessibility violations`, async ({ page }) => {
    await open(page, file);
    const result = await new AxeBuilder({ page }).withTags(wcag).analyze();
    expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([]);
  });

  test(`${file}: no page-level horizontal overflow at 320px; the canvas scrolls inside its region`, async ({ page }) => {
    await open(page, file, 320);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.locator(".ef-diagram__viewport")).toHaveAttribute("tabindex", "0");
    await expect(page.locator(".ef-diagram__relations li").first()).toBeVisible();
  });
}

test("static export has no script and every connector has a relationship sentence", async ({ page }) => {
  await open(page, "swimlanes.document.html");
  expect(await page.locator("script").count()).toBe(0);
  const connectors = await page.locator("path.ef-diagram-connector").count();
  await expect(page.locator(".ef-diagram__relations li")).toHaveCount(connectors);
  await expect(page.locator(".ef-diagram__membership dt")).toHaveCount(4);
});

test("nodes keep visible boundaries and text in forced colours", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await open(page, "swimlanes.document.html");
  const node = page.locator(".ef-diagram-node").first();
  const style = await node.evaluate((el) => getComputedStyle(el).borderTopStyle);
  expect(style).not.toBe("none");
  await expect(node.locator(".ef-diagram-node__label")).toBeVisible();
});

test("branded export restyles token palette slots through the brand", async ({ page }) => {
  await open(page, "branded.document.html");
  await expect(page.locator("html")).toHaveAttribute("data-ef-brand", "example-harbor");
  const accent = await page.locator(".ef-diagram-node").nth(1).evaluate((el) => getComputedStyle(el).borderInlineStartColor);
  const token = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--ef-color-accent-primary").trim());
  expect(token).not.toBe("");
  expect(accent).not.toBe("rgba(0, 0, 0, 0)");
});
