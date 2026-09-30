// Rendered-behavior checks for the generated component catalog (WI-0011):
// containment across representative widths and zoom, mobile example frames,
// compact navigation, the viewport switcher, keyboard focus and axe.
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const site = path.join(root, "site-dist");
const manifest = JSON.parse(fs.readFileSync(path.join(site, "site-manifest.json"), "utf8"));

const docPages = [
  "/site-dist/index.html",
  "/site-dist/components/index.html",
  "/site-dist/mobile/index.html",
  "/site-dist/accessibility/index.html",
  "/site-dist/compositions/index.html",
  ...manifest.compositions.map(item => `/site-dist/compositions/${item.slug}/index.html`),
  ...manifest.categories.map(item => `/site-dist/components/${item.id}/index.html`),
  ...manifest.components.map(item => `/site-dist/components/${item.slug}/index.html`)
];

const mobileFrames = manifest.components.flatMap(component =>
  component.examples.filter(example => example.mobile).map(example => `/site-dist/components/${component.slug}/mobile-${example.id}.html`));

const budget = count => Math.max(30_000, count * 1_500);

const overflow = page => page.evaluate(() => {
  const width = document.documentElement.clientWidth;
  const scroll = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  const offenders = scroll > width + 1
    ? [...document.querySelectorAll("body *")]
      .filter(element => {
        // Only elements that actually extend the page: no clipping ancestor.
        for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
          if (getComputedStyle(node).overflowX !== "visible") return false;
        }
        return element.getBoundingClientRect().right > width + 1;
      })
      .map(element => ({ tag: element.tagName.toLowerCase(), className: String(element.className).slice(0, 60), text: element.textContent.trim().slice(0, 40), right: Math.round(element.getBoundingClientRect().right) }))
      .slice(0, 5)
    : [];
  return { width, scroll, offenders };
});

const layouts = [
  { name: "large phone", width: 430, height: 932 },
  { name: "phone landscape", width: 844, height: 390 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
  { name: "desktop at 200% zoom", width: 640, height: 450 }
];

for (const layout of layouts) {
  test(`documentation pages have no page-level horizontal overflow: ${layout.name} (${layout.width}px)`, async ({ page }) => {
    test.setTimeout(budget(docPages.length));
    await page.setViewportSize({ width: layout.width, height: layout.height });
    for (const url of docPages) {
      await page.goto(url);
      const result = await overflow(page);
      expect(result.scroll, `${url} overflows at ${layout.width}px: ${JSON.stringify(result.offenders)}`).toBeLessThanOrEqual(result.width + 1);
    }
  });
}

test("documentation pages reflow with 200% text size at 320px", async ({ page }) => {
  test.setTimeout(budget(docPages.length));
  await page.setViewportSize({ width: 320, height: 640 });
  for (const url of docPages) {
    await page.goto(url);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    const result = await overflow(page);
    expect(result.scroll, `${url} overflows with 200% text: ${JSON.stringify(result.offenders)}`).toBeLessThanOrEqual(result.width + 1);
  }
});

test("every mobile example renders inside a 320px and a 390px viewport without page overflow", async ({ page }) => {
  test.setTimeout(budget(mobileFrames.length * 2));
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 800 });
    for (const url of mobileFrames) {
      await page.goto(url);
      const result = await overflow(page);
      expect(result.scroll, `${url} overflows at ${width}px: ${JSON.stringify(result.offenders)}`).toBeLessThanOrEqual(result.width + 1);
      const components = await page.locator(".ef-component-tag").count();
      expect(components, `${url} does not render a Forma component`).toBeGreaterThan(0);
    }
  }
});

test("phone navigation is one native disclosure with full-size targets and no hover dependency", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/site-dist/components/switch/index.html");
  await expect(page.locator(".catalog-nav--sidebar")).toBeHidden();
  const disclosure = page.locator(".catalog-nav__disclosure");
  await expect(disclosure).toBeVisible();
  await disclosure.locator(":scope > summary").focus();
  await page.keyboard.press("Enter");
  await expect(disclosure).toHaveAttribute("open", "");
  const current = disclosure.locator('a[aria-current="page"]');
  await expect(current).toHaveText("Switch");
  await expect(current).toBeVisible();
  const small = await disclosure.locator("a, summary").evaluateAll(elements => elements
    .filter(element => element.getClientRects().length)
    .map(element => ({ text: element.textContent.trim().slice(0, 40), height: element.getBoundingClientRect().height }))
    .filter(item => item.height < 43.5));
  expect(small).toEqual([]);
  await expect(page.locator(".breadcrumbs")).toContainText("Form inputs");
  await expect(page.locator(".pager")).toContainText("All form inputs");
});

test("the viewport switcher resizes the real mobile frame", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/site-dist/components/switch/index.html");
  const demo = page.locator("#example-mobile-settings-list .viewport-demo");
  const frame = demo.locator("iframe.example-mobile-frame");
  await frame.scrollIntoViewIfNeeded();
  expect(Math.round((await frame.boundingBox()).width)).toBe(320);
  for (const width of [390, 430, 768]) {
    await demo.locator(`input[value="${width}"]`).check({ force: true });
    expect(Math.round((await frame.boundingBox()).width)).toBe(width);
    const inner = await frame.evaluate(element => element.contentDocument.documentElement.clientWidth);
    expect(inner).toBeLessThanOrEqual(width);
  }
});

test("keyboard users reach the skip link first and see focus on catalog controls", async ({ page }) => {
  await page.goto("/site-dist/components/index.html");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  const radio = page.locator("#filter-forms");
  await radio.focus();
  const outline = await radio.evaluate(element => getComputedStyle(element.closest("label") ?? element).outlineStyle + "|" + getComputedStyle(element).outlineStyle);
  expect(outline).not.toBe("none|none");
});

test("the category filter on the A–Z index shows only the chosen family", async ({ page }) => {
  await page.goto("/site-dist/components/index.html");
  await page.locator("#filter-forms").check({ force: true });
  const visible = await page.locator(".catalog-row").evaluateAll(rows => rows.filter(row => row.getClientRects().length).map(row => row.dataset.category));
  expect(visible.length).toBe(manifest.categories.find(item => item.id === "forms").components.length);
  expect(new Set(visible)).toEqual(new Set(["forms"]));
});

test("code blocks are selectable in one action and scroll inside themselves", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/site-dist/components/switch/index.html");
  const code = page.locator("#example-notification-preferences .code-viewer__code");
  expect(await code.evaluate(element => getComputedStyle(element).userSelect)).toBe("all");
  expect(await code.evaluate(element => getComputedStyle(element).overflowX)).toBe("auto");
  await expect(page.locator("#example-notification-preferences .code-viewer__raw")).toHaveAccessibleName(/Raw HTML for HTML · Notification preferences/);
});

// Known pre-existing component defects (catalog/known-issues.json) are listed
// in axe-baseline.json as page + rule pairs. Anything new fails, and a
// baseline entry that no longer reproduces also fails so the list shrinks.
const baseline = JSON.parse(fs.readFileSync(path.join(root, "tests", "site-browser", "axe-baseline.json"), "utf8")).entries;
const chunkSize = 12;
const chunks = Array.from({ length: Math.ceil(docPages.length / chunkSize) }, (_, index) => docPages.slice(index * chunkSize, (index + 1) * chunkSize));

chunks.forEach((chunk, index) => {
  test(`generated documentation pages have no automatically detectable WCAG A/AA violations (${index + 1}/${chunks.length})`, async ({ page }) => {
    test.setTimeout(Math.max(60_000, chunk.length * 15_000));
    const found = [];
    for (const url of chunk) {
      await page.goto(url);
      // Pass 1: documentation chrome, every rule. Pass 2: live examples.
      // A catalog page deliberately shows several instances of one component,
      // so identical landmark names inside examples (landmark-unique) are
      // expected there and only there. Stress specimens and category previews
      // are inert, aria-hidden visual screens (one deliberately lowers
      // contrast), so both passes exclude them.
      const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
      const chrome = await new AxeBuilder({ page })
        .withTags(tags)
        .exclude(".example-canvas")
        .exclude(".catalog-card__preview")
        .options({ iframes: false })
        .analyze();
      const examples = await page.locator(".example-canvas").count()
        ? await new AxeBuilder({ page })
          .withTags(tags)
          .include(".example-canvas")
          .exclude(".ve-stress-grid")
          .disableRules(["landmark-unique"])
          .options({ iframes: false })
          .analyze()
        : { violations: [] };
      const pagePath = url.replace("/site-dist/", "").replace(/index\.html$/, "");
      for (const violation of [...chrome.violations, ...examples.violations]) {
        found.push({ page: pagePath, rule: violation.id, target: violation.nodes[0]?.target.join(" ") ?? "" });
      }
    }
    const known = item => baseline.some(entry => entry.page === item.page && entry.rule === item.rule);
    const unexpected = found.filter(item => !known(item)).map(item => `${item.page}: ${item.rule} ${item.target}`);
    const chunkPages = new Set(chunk.map(url => url.replace("/site-dist/", "").replace(/index\.html$/, "")));
    const stale = baseline
      .filter(entry => chunkPages.has(entry.page))
      .filter(entry => !found.some(item => item.page === entry.page && item.rule === entry.rule))
      .map(entry => `${entry.page}: ${entry.rule} (baseline entry no longer reproduces; remove it)`);
    expect([...unexpected, ...stale]).toEqual([]);
  });
});
