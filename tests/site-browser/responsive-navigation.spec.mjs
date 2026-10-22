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


test("only the current section receives selected navigation treatment on iPhone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [url, selected, current] of [
    ["/site-dist/accessibility/index.html", "Accessibility", "page"],
    ["/site-dist/agents/index.html", "Agent use", "page"],
    ["/site-dist/components/date-time-field/index.html", "Components", "location"]
  ]) {
    await page.goto(url);
    const links = await page.locator(".site-nav a").evaluateAll(elements =>
      elements.map(link => ({
        text: link.textContent.trim(),
        ariaCurrent: link.getAttribute("aria-current"),
        background: getComputedStyle(link).backgroundColor
      }))
    );
    expect(links).toHaveLength(6);
    const active = links.filter(link => link.ariaCurrent !== null);
    expect(active, url + ": wrong selected link").toHaveLength(1);
    expect(active[0].text).toBe(selected);
    expect(active[0].ariaCurrent).toBe(current);
    for (const item of links.filter(link => itemNotSelected(link, selected))) {
      expect(item.background, url + ": inactive link " + item.text + " is still highlighted")
        .not.toBe(active[0].background);
    }
  }
});

function itemNotSelected(link, selected) {
  return link.text !== selected;
}

for (const width of [320, 390, 430, 1280]) {
  test(`catalog family picker is compact and contained at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/site-dist/components/index.html");
    const picker = page.getByRole("combobox", { name: "Show family" });
    await expect(picker).toHaveValue("all");
    await expect(picker.locator("option")).toHaveCount(19);
    const box = await picker.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeLessThan(80);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(await page.locator(".catalog-filter").evaluate(el => el.getBoundingClientRect().height)).toBeLessThan(125);
    const letters = await page.locator(".letter-nav a").evaluateAll(els => els.map(el => el.getBoundingClientRect().toJSON()));
    for (const letter of letters) {
      expect(letter.width).toBeGreaterThanOrEqual(44);
      expect(letter.height).toBeGreaterThanOrEqual(44);
      expect(letter.right).toBeLessThanOrEqual(width);
    }
    await picker.focus();
    await expect(picker).toBeFocused();
    expect(await picker.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe("none");
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await picker.selectOption({ label: "Attention and verification" });
    const layout = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      pickerRight: document.getElementById("catalog-family").getBoundingClientRect().right
    }));
    expect(layout.pickerRight).toBeLessThanOrEqual(layout.width);
    expect(layout.scroll).toBeLessThanOrEqual(layout.width + 1);
  });
}

test("native family selection filters every family and restores all without behaviour scripts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/site-dist/components/index.html");
  expect(await page.locator("script").evaluateAll(scripts => scripts.map(script => ({
    type: script.getAttribute("type"),
    src: script.getAttribute("src"),
    text: script.textContent
  })))).toEqual([{ type: "module", src: "../assets/runtime.js", text: "" }]);
  const picker = page.getByRole("combobox", { name: "Show family" });
  const families = await picker.locator("option").evaluateAll(options => options.map(option => option.value).filter(value => value !== "all"));
  const total = await page.locator(".catalog-row").count();
  for (const family of families) {
    await picker.selectOption(family);
    const visible = await page.locator(".catalog-row").evaluateAll(rows => rows.filter(row => row.getClientRects().length).map(row => row.dataset.category));
    expect(visible.length, family).toBeGreaterThan(0);
    expect(new Set(visible), family).toEqual(new Set([family]));
    expect(visible.length).toBe(await page.locator(`.catalog-row[data-category="${family}"]`).count());
  }
  await picker.selectOption("all");
  expect(await page.locator(".catalog-row").evaluateAll(rows => rows.filter(row => row.getClientRects().length).length)).toBe(total);
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await expect(picker).toBeVisible();
  await picker.selectOption("forms");
  await expect(picker).toHaveValue("forms");
});
