// Real Safari/WebKit regression (GH-128): keep each top-nav phrase intact and
// fit native date pickers and long source examples inside their own cards.
import { expect, test } from "@playwright/test";

const widths = [320, 390, 430, 680, 768, 1024, 1180, 1440];
const url = "/site-dist/components/date-time-field/index.html";

for (const width of widths) {
  test(`documentation navigation and native date inputs stay contained at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.goto(url);

    const layout = await page.evaluate(() => {
      const nav = document.querySelector(".site-nav");
      const navRect = nav.getBoundingClientRect();
      const links = [...nav.querySelectorAll("a")];
      const dimensions = links.map(link => ({
        label: link.textContent.trim(),
        whiteSpace: getComputedStyle(link).whiteSpace,
        rect: link.getBoundingClientRect().toJSON()
      }));
      const pickerRects = [...document.querySelectorAll(
        ".example-canvas .ef-field > input:is([type=date], [type=time], [type=datetime-local])"
      )].map(input => {
        const rect = input.getBoundingClientRect();
        const field = input.closest(".ef-field").getBoundingClientRect();
        const canvas = input.closest(".example-canvas").getBoundingClientRect();
        return { id: input.id, input: rect.toJSON(), field: field.toJSON(), canvas: canvas.toJSON() };
      });
      const code = [...document.querySelectorAll(".code-viewer__code")].map(el => {
        const rect = el.getBoundingClientRect();
        const outer = el.closest(".code-viewer").getBoundingClientRect();
        return { rect: rect.toJSON(), outer: outer.toJSON(), overflow: getComputedStyle(el).overflowX };
      });
      return {
        documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        viewport: document.documentElement.clientWidth,
        nav: navRect.toJSON(), links: dimensions, pickerRects, code
      };
    });

    expect(layout.links).toHaveLength(6);
    expect(layout.documentWidth, "page-level horizontal scrolling").toBeLessThanOrEqual(layout.viewport + 1);
    expect(layout.nav.left).toBeGreaterThanOrEqual(-1);
    expect(layout.nav.right).toBeLessThanOrEqual(width + 1);
    for (const link of layout.links) {
      expect(link.whiteSpace, link.label + " broke into multiple lines").toBe("nowrap");
      expect(Math.abs(link.rect.top - layout.links[0].rect.top), link.label + " was moved to another row").toBeLessThan(2);
      expect(link.rect.height, link.label + " needs a 44px minimum target").toBeGreaterThanOrEqual(43.5);
    }
    // Keyboard users can traverse the whole strip, even if later links require
    // a horizontal scroll; don't solve wrapping by hiding focusable links.
    const last = page.locator(".site-nav a").last();
    await last.focus();
    await expect(last).toBeFocused();
    const focused = await page.evaluate(() => {
      const nav = document.querySelector(".site-nav").getBoundingClientRect();
      const item = document.activeElement.getBoundingClientRect();
      return { visible: item.left >= nav.left - 1 && item.right <= nav.right + 1 };
    });
    expect(focused.visible, "focused last link should scroll into navigation's viewport").toBe(true);

    expect(layout.pickerRects.length).toBeGreaterThanOrEqual(4);
    for (const item of layout.pickerRects) {
      expect(item.input.left, item.id + " escapes field left").toBeGreaterThanOrEqual(item.field.left - 1);
      expect(item.input.right, item.id + " escapes field right").toBeLessThanOrEqual(item.field.right + 1);
      expect(item.field.left, item.id + " escapes card left").toBeGreaterThanOrEqual(item.canvas.left - 1);
      expect(item.field.right, item.id + " escapes card right").toBeLessThanOrEqual(item.canvas.right + 1);
    }
    expect(layout.code.length).toBeGreaterThanOrEqual(3);
    for (const block of layout.code) {
      expect(block.overflow, "code should scroll in its own block").toBe("auto");
      expect(block.rect.right).toBeLessThanOrEqual(block.outer.right + 1);
      expect(block.rect.left).toBeGreaterThanOrEqual(block.outer.left - 1);
    }
  });
}

test("large text does not split primary navigation words or obscure the native date input", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto(url);
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const result = await page.evaluate(() => {
    const nav = document.querySelector(".site-nav");
    const navBox = nav.getBoundingClientRect();
    const input = document.querySelector("#date-time-field-due");
    const inputBox = input.getBoundingClientRect();
    const fieldBox = input.closest(".ef-field").getBoundingClientRect();
    return {
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      viewport: document.documentElement.clientWidth,
      navRight: navBox.right,
      navLinksUnbroken: [...nav.querySelectorAll("a")].every(a => getComputedStyle(a).whiteSpace === "nowrap"),
      inputRight: inputBox.right,
      fieldRight: fieldBox.right
    };
  });
  expect(result.navLinksUnbroken).toBe(true);
  expect(result.navRight).toBeLessThanOrEqual(result.viewport + 1);
  expect(result.documentWidth).toBeLessThanOrEqual(result.viewport + 1);
  expect(result.inputRight).toBeLessThanOrEqual(result.fieldRight + 1);
});


test("long breadcrumb phrases and section navigation remain unbroken at 200% text on 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/site-dist/components/menu/index.html");
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });

  const layout = await page.evaluate(() => {
    const breadcrumb = document.querySelector(".breadcrumbs");
    const toc = document.querySelector(".page-toc ul");
    return {
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      viewport: document.documentElement.clientWidth,
      breadcrumbScroll: getComputedStyle(breadcrumb).overflowX,
      breadcrumbBounds: breadcrumb.getBoundingClientRect().toJSON(),
      breadcrumbPhraseUnbroken: [...breadcrumb.querySelectorAll("a")].every(a => getComputedStyle(a).whiteSpace === "nowrap"),
      tocScroll: getComputedStyle(toc).overflowX,
      tocBounds: toc.getBoundingClientRect().toJSON(),
      tocPhraseUnbroken: [...toc.querySelectorAll("a")].every(a => getComputedStyle(a).whiteSpace === "nowrap")
    };
  });
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport + 1);
  expect(layout.breadcrumbScroll).toBe("auto");
  expect(layout.breadcrumbBounds.right).toBeLessThanOrEqual(layout.viewport + 1);
  expect(layout.breadcrumbPhraseUnbroken).toBe(true);
  expect(layout.tocScroll).toBe("auto");
  expect(layout.tocBounds.right).toBeLessThanOrEqual(layout.viewport + 1);
  expect(layout.tocPhraseUnbroken).toBe(true);
});
