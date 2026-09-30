import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import diagram from "../../catalog/components/diagram.mjs";

// Diagram presentation M2 (forma#88): ellipse and diamond shapes, groups/lanes/phases,
// metadata value states, and print that keeps authored strokes. FMD-SHAPE-001/002/008,
// FMD-SCHEMA-006/007, FMD-COLOR-024..026/030, FDA-2020..2022.
const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const example = (id) => diagram.examples.find((entry) => entry.id === id).html;

const html = ({ theme = "", body }) => `<!doctype html>
<html lang="en"${theme ? ` data-ef-theme="${theme}"` : ""}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Diagram M2</title>
  <link rel="stylesheet" href="/dist/tokens.css">
  <link rel="stylesheet" href="/dist/foundations.css">
  <link rel="stylesheet" href="/dist/components.css">
</head>
<body><main style="padding: 1rem;"><h1>Diagram M2</h1>${body}</main></body></html>`;

const open = async (page, width, id, options = {}) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/tests/browser/fixture/index.html");
  await page.setContent(html({ ...options, body: example(id) }), { waitUntil: "load" });
};

const node = (page, name) => page.getByRole("article", { name });
const style = (locator, property, pseudo = null) =>
  locator.evaluate((element, [name, which]) => getComputedStyle(element, which)[name], [property, pseudo]);

test("ellipse and diamond are presentation variants with visible kind text", async ({ page }) => {
  await open(page, 1280, "workflow-lanes-and-decision");
  const start = node(page, "Submit request");
  await expect(start).toHaveAttribute("data-ef-shape", "ellipse");
  await expect(start.locator(".ef-diagram-node__kind")).toHaveText("Start");
  expect(await style(start, "borderTopLeftRadius")).toBe("50%");
  const decision = node(page, "Within budget?");
  await expect(decision.locator(".ef-diagram-node__kind")).toHaveText("Decision");
  const box = await decision.boundingBox();
  expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(1);
  expect(await style(decision, "transform", "::before")).not.toBe("none");
});

test("the diamond's content sits inside the diamond, not across its edges", async ({ page }) => {
  await open(page, 1280, "workflow-lanes-and-decision");
  const decision = node(page, "Within budget?");
  const outer = await decision.boundingBox();
  const cx = outer.x + outer.width / 2;
  const cy = outer.y + outer.height / 2;
  const half = outer.width / 2;
  // Every rendered text line box must fall inside the diamond: |dx| + |dy| <= half the side.
  const lines = await decision.evaluate((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const rects = [];
    for (let text = walker.nextNode(); text; text = walker.nextNode()) {
      if (!text.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(text);
      rects.push(...[...range.getClientRects()].map(({ left, right, top, bottom }) => ({ left, right, top, bottom })));
    }
    return rects;
  });
  expect(lines.length).toBeGreaterThan(0);
  for (const line of lines) {
    for (const [x, y] of [[line.left, line.top], [line.right, line.top], [line.left, line.bottom], [line.right, line.bottom]]) {
      expect(Math.abs(x - cx) + Math.abs(y - cy)).toBeLessThanOrEqual(half + 1);
    }
  }
});

test("groups paint beneath connectors and nodes and keep a text label", async ({ page }) => {
  await open(page, 1280, "workflow-lanes-and-decision");
  const order = await page.locator(".ef-diagram__canvas > *").evaluateAll((children) => children.map((child) => child.getAttribute("class").split(" ")[0]));
  expect(order.lastIndexOf("ef-diagram-group")).toBeLessThan(order.indexOf("ef-diagram__wires"));
  const lanes = page.locator(".ef-diagram-group");
  await expect(lanes).toHaveCount(2);
  await expect(lanes.nth(0).locator(".ef-diagram-group__label")).toHaveText("Requester");
  await expect(lanes.nth(1).locator(".ef-diagram-group__kind")).toHaveText("Lane");
});

test("group authored color applies and removing it restores the default", async ({ page }) => {
  await open(page, 1280, "workflow-lanes-and-decision");
  const finance = page.locator(".ef-diagram-group").nth(1);
  const requester = page.locator(".ef-diagram-group").nth(0);
  expect(await style(finance, "borderLeftColor")).toBe("rgb(107, 63, 160)");
  const fallback = await style(requester, "borderLeftColor");
  await finance.evaluate((element) => element.style.removeProperty("--ef-diagram-accent"));
  expect(await style(finance, "borderLeftColor")).toBe(fallback);
});

test("value states are text first, with a distinct secondary border cue", async ({ page }) => {
  await open(page, 1280, "metadata-value-states");
  const tags = page.locator(".ef-diagram-value-state");
  await expect(tags).toHaveCount(6);
  const states = await tags.evaluateAll((elements) => elements.map((element) => ({
    state: element.dataset.efValueState,
    text: element.textContent.trim(),
    border: getComputedStyle(element).borderTopStyle
  })));
  for (const entry of states) expect(entry.text.length).toBeGreaterThan(0);
  expect(new Set(states.map((entry) => entry.border)).size).toBeGreaterThanOrEqual(4);
  // The explicit value has no tag: explicit is the default reading.
  await expect(page.locator("dd", { hasText: "In review" }).locator(".ef-diagram-value-state")).toHaveCount(0);
  await page.emulateMedia({ forcedColors: "active" });
  expect(new Set(await tags.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).borderTopStyle))).size).toBeGreaterThanOrEqual(4);
});

test("print keeps authored strokes and black boundaries for every shape and group", async ({ page }) => {
  await open(page, 1280, "workflow-lanes-and-decision");
  await page.emulateMedia({ media: "print" });
  expect(await style(node(page, "Submit request"), "borderTopColor")).toBe("rgb(0, 0, 0)");
  expect(parseFloat(await style(node(page, "Submit request"), "borderTopWidth"))).toBeGreaterThan(0);
  const decision = node(page, "Within budget?");
  expect(parseFloat(await style(decision, "borderTopWidth", "::before"))).toBeGreaterThan(0);
  expect(await style(decision, "borderTopColor", "::before")).toBe("rgb(0, 0, 0)");
  await decision.evaluate((element) => element.style.setProperty("--ef-diagram-stroke", "#2f5fb3"));
  expect(await style(decision, "borderTopColor", "::before")).toBe("rgb(47, 95, 179)");
  const lane = page.locator(".ef-diagram-group").first();
  expect(await style(lane, "borderBottomColor")).toBe("rgb(0, 0, 0)");
});

test("in forced colors, shapes and groups keep boundaries and value states keep text", async ({ page }) => {
  await open(page, 1280, "workflow-lanes-and-decision");
  await page.emulateMedia({ forcedColors: "active" });
  expect(await style(node(page, "Within budget?"), "borderTopStyle", "::before")).toBe("solid");
  expect(await style(page.locator(".ef-diagram-group").first(), "borderTopStyle")).toBe("solid");
  await expect(node(page, "Prepare budget").locator(".ef-diagram-value-state")).toHaveText("from lane");
});

test("grayscale leaves every distinction in text, line style or the key", async ({ page }) => {
  await open(page, 1280, "workflow-lanes-and-decision");
  await page.addStyleTag({ content: "html { filter: grayscale(1); }" });
  const dashes = await page.locator(".ef-diagram-connector").evaluateAll((paths) => paths.map((path) => getComputedStyle(path).strokeDasharray));
  expect(new Set(dashes).size).toBe(2);
  const legend = await page.locator(".ef-diagram-legend dd").allTextContents();
  expect(legend.every((text) => text.trim().length > 0)).toBe(true);
  await expect(page.getByRole("list", { name: "Relationships" }).getByRole("listitem")).toHaveCount(await page.locator(".ef-diagram-connector").count());
});

test("at 320px the page does not overflow and nodes do not clip at 200% text", async ({ page }) => {
  for (const id of ["workflow-lanes-and-decision", "metadata-value-states"]) {
    await open(page, 320, id);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
  await page.addStyleTag({ content: "html{font-size:200%}" });
  const clipped = await node(page, "Collect vendor details").evaluate((element) => element.scrollWidth > element.clientWidth + 1);
  expect(clipped).toBe(false);
});

test("the M2 examples have no automatically detectable WCAG A/AA violations (light, dark)", async ({ page }) => {
  for (const id of ["workflow-lanes-and-decision", "metadata-value-states"]) {
    for (const theme of ["", "dark"]) {
      await open(page, 1280, id, { theme });
      const results = await new AxeBuilder({ page }).withTags(wcag).analyze();
      expect(results.violations, `${id} ${theme}: ${JSON.stringify(results.violations, null, 2)}`).toEqual([]);
    }
  }
});
