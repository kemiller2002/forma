import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Forma-owned Echelon marketing reference fixture (examples/echelon-marketing-site).
// It consumes the installed release bundle exactly as an independent site does.
const base = "/examples/echelon-marketing-site/";
const pages = ["index.html", "product.html", "docs.html"];
const widths = { wide: 1280, tablet: 768, phone: 390, narrow: 320 };
const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function open(page, file, width, height = 900) {
  await page.setViewportSize({ width, height });
  // Webfonts are the site's concern; the fixture must work with fallbacks.
  await page.goto(base + file);
}

async function overflow(page) {
  return page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth);
}

async function columns(page, selector) {
  return page.locator(selector).first().evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length);
}

for (const file of pages) {
  for (const [name, width] of Object.entries(widths)) {
    test(`${file} is contained at ${name} width (${width}px)`, async ({ page }) => {
      await open(page, file, width);
      expect(await overflow(page), `${file} scrolls horizontally at ${width}px`).toBeLessThanOrEqual(1);
    });
  }

  test(`${file} has no automatically detectable WCAG 2.2 A/AA violations (wide, phone, dark)`, async ({ page }) => {
    for (const width of [widths.wide, widths.phone]) {
      await open(page, file, width);
      const results = await new AxeBuilder({ page }).withTags(wcag).analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    }
    await open(page, file, widths.wide);
    await page.evaluate(() => document.documentElement.setAttribute("data-ef-theme", "dark"));
    // Buttons transition color; measure contrast on settled colors, not a
    // mid-transition frame (WebKit sampled one in CI).
    await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished)));
    const dark = await new AxeBuilder({ page }).withTags(wcag).analyze();
    expect(dark.violations, JSON.stringify(dark.violations, null, 2)).toEqual([]);
  });
}

test("card grids honor their column cap and degrade to one column by content", async ({ page }) => {
  await open(page, "index.html", widths.wide);
  expect(await columns(page, '#services .ef-card-grid')).toBe(2);
  expect(await columns(page, '.ef-card-grid[data-ef-columns="5"]')).toBe(5);
  await open(page, "index.html", widths.tablet);
  expect(await columns(page, '#services .ef-card-grid')).toBe(2);
  expect(await columns(page, '.ef-card-grid[data-ef-columns="5"]')).toBeLessThan(5);
  await open(page, "index.html", widths.narrow);
  expect(await columns(page, '#services .ef-card-grid')).toBe(1);
  expect(await columns(page, '.ef-card-grid[data-ef-columns="5"]')).toBe(1);
});

test("hero keeps supporting context beside the promise when wide and below it, in source order, when narrow", async ({ page }) => {
  for (const [width, beside] of [[widths.wide, true], [widths.phone, false]]) {
    await open(page, "index.html", width);
    const content = await page.locator(".ef-hero__content").boundingBox();
    const aside = await page.locator(".ef-hero__aside").boundingBox();
    if (beside) expect(aside.x).toBeGreaterThan(content.x + content.width - 1);
    else expect(aside.y).toBeGreaterThanOrEqual(content.y + content.height - 1);
  }
});

test("navigation wraps instead of hiding destinations and keeps 44px targets", async ({ page }) => {
  for (const width of [widths.phone, widths.narrow]) {
    await open(page, "index.html", width);
    const links = page.locator(".ef-site-nav__link, .ef-site .ef-button, .ef-site-header__brand");
    const count = await links.count();
    expect(count).toBeGreaterThan(5);
    for (let i = 0; i < count; i += 1) {
      const link = links.nth(i);
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box.height, `${await link.textContent()} is shorter than 44px`).toBeGreaterThanOrEqual(43.5);
      expect(box.width).toBeGreaterThanOrEqual(24);
    }
    await expect(page.locator(".ef-site-header__name")).toBeVisible();
  }
});

test("the skip link is the first stop, becomes visible, and moves focus to main", async ({ page }) => {
  await open(page, "index.html", widths.wide);
  await page.keyboard.press("Tab");
  const skip = page.locator(".ef-skip-link");
  await expect(skip).toBeFocused();
  const box = await skip.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(0);
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await page.keyboard.press("Tab");
  const next = await page.evaluate(() => document.activeElement.closest("main") !== null);
  expect(next, "the next Tab stop after skipping is inside main").toBe(true);
});

test("keyboard focus is visible on every interactive component and is not obscured by the header", async ({ page }) => {
  await open(page, "index.html", widths.wide);
  const header = await page.locator(".ef-site-header").boundingBox();
  let checked = 0;
  for (let i = 0; i < 30; i += 1) {
    await page.keyboard.press("Tab");
    const state = await page.evaluate(() => {
      const el = document.activeElement;
      const style = getComputedStyle(el);
      const card = el.closest(".ef-card");
      const cardStyle = card && el.matches(".ef-card__link") ? getComputedStyle(card) : null;
      const rect = el.getBoundingClientRect();
      return {
        outline: (cardStyle ?? style).outlineStyle,
        width: parseFloat((cardStyle ?? style).outlineWidth),
        top: rect.top,
        inHeader: el.closest(".ef-site-header") !== null,
        skip: el.matches(".ef-skip-link"),
        wrapped: el === document.body
      };
    });
    if (state.wrapped) break;
    if (state.skip) continue;
    expect(state.outline).toBe("solid");
    expect(state.width).toBeGreaterThanOrEqual(2);
    if (!state.inHeader) expect(state.top, "focused element hidden under the sticky header").toBeGreaterThanOrEqual(header.height - 1);
    checked += 1;
  }
  expect(checked).toBeGreaterThan(15);
});

test("the header is sticky only where it cannot swallow the viewport", async ({ page }) => {
  await open(page, "index.html", widths.wide, 900);
  expect(await page.locator(".ef-site-header").evaluate(el => getComputedStyle(el).position)).toBe("sticky");
  await open(page, "index.html", widths.phone, 800);
  expect(await page.locator(".ef-site-header").evaluate(el => getComputedStyle(el).position)).not.toBe("sticky");
  await open(page, "index.html", widths.wide, 500);
  expect(await page.locator(".ef-site-header").evaluate(el => getComputedStyle(el).position)).not.toBe("sticky");
});

test("reduced motion removes transitions and hover movement", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "index.html", widths.wide);
  const button = page.locator('.ef-hero .ef-button[data-ef-variant="primary"]');
  await button.hover();
  const style = await button.evaluate(el => ({ duration: getComputedStyle(el).transitionDuration, transform: getComputedStyle(el).transform }));
  // Core Forma foundations clamp durations to 0.01ms (an earlier-layer !important).
  expect(style.duration.split(",").every(d => parseFloat(d) * (d.trim().endsWith("ms") ? 1 : 1000) < 1)).toBe(true);
  expect(style.transform).toBe("none");
});

// FORMA-MOT-008: marketing hover and press are perceptual emphasis on the
// surface; the hit target never moves under the pointer.
test("marketing buttons and cards use perceptual interpolation without spatial hover", async ({ page }) => {
  await open(page, "index.html", widths.wide);
  const perceptual = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.animationDelay = "var(--ef-effect-transition-duration)";
    document.querySelector(".ef-site").append(probe);
    const value = getComputedStyle(probe).animationDelay;
    probe.remove();
    return value;
  });
  expect(Number.parseFloat(perceptual) * (perceptual.endsWith("ms") ? 1 : 1000)).toBeCloseTo(120, 0);
  const button = page.locator('.ef-hero .ef-button[data-ef-variant="primary"]');
  const timing = await button.evaluate(el => ({ properties: getComputedStyle(el).transitionProperty, easing: getComputedStyle(el).transitionTimingFunction }));
  expect(timing.properties).toBe("background-color, color");
  expect(timing.easing).toBe("cubic-bezier(0.2, 0, 0, 1), cubic-bezier(0.2, 0, 0, 1)");
  await button.scrollIntoViewIfNeeded();
  const before = await button.boundingBox();
  await button.hover();
  await button.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
  const after = await button.boundingBox();
  expect(after.y).toBeCloseTo(before.y, 1);
  expect(await button.evaluate(el => getComputedStyle(el).transform)).toBe("none");
});

test("text resized to 200% and WCAG 1.4.12 text spacing do not cause horizontal scrolling", async ({ page }) => {
  for (const file of pages) {
    await open(page, file, widths.wide);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    expect(await overflow(page), `${file} at 200% text`).toBeLessThanOrEqual(1);
    await open(page, file, widths.phone);
    await page.addStyleTag({ content: "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }" });
    expect(await overflow(page), `${file} with text-spacing overrides`).toBeLessThanOrEqual(1);
  }
});

test("forced colors keep buttons, badges, and surfaces delineated", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await open(page, "index.html", widths.wide);
  for (const selector of ['.ef-hero .ef-button[data-ef-variant="primary"]', ".ef-badge", ".ef-site-footer"]) {
    const border = await page.locator(selector).first().evaluate(el => getComputedStyle(el).borderTopStyle);
    expect(border, `${selector} loses its boundary in forced colors`).toBe("solid");
  }
});

test("print output drops navigation and the decorative backdrop", async ({ page }) => {
  await page.emulateMedia({ media: "print" });
  await open(page, "index.html", widths.wide);
  expect(await page.locator(".ef-site-nav").evaluate(el => getComputedStyle(el).display)).toBe("none");
  expect(await page.evaluate(() => getComputedStyle(document.body, "::before").display)).toBe("none");
});

test("the Echelon theme applies through tokens and the product page retargets only its accent", async ({ page }) => {
  await open(page, "index.html", widths.wide);
  const home = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundColor,
    display: getComputedStyle(document.querySelector("h1")).fontFamily,
    accent: getComputedStyle(document.body).getPropertyValue("--ef-color-accent-primary").trim()
  }));
  expect(home.background).toBe("rgb(242, 239, 231)");
  expect(home.display).toContain("Newsreader");
  expect(home.accent).toBe("#905831");
  await open(page, "product.html", widths.wide);
  const product = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundColor,
    accent: getComputedStyle(document.body).getPropertyValue("--ef-color-accent-primary").trim()
  }));
  expect(product.background).toBe(home.background);
  expect(product.accent).toBe("#47756b");
});

test("documentation layout regroups by available width without reordering", async ({ page }) => {
  await open(page, "docs.html", widths.wide);
  const nav = await page.locator(".ef-doc__nav").boundingBox();
  const content = await page.locator(".ef-doc__content").boundingBox();
  const aside = await page.locator(".ef-doc__aside").boundingBox();
  expect(content.x).toBeGreaterThan(nav.x + nav.width - 1);
  expect(aside.x).toBeGreaterThan(content.x + content.width - 1);

  await open(page, "docs.html", widths.phone);
  const narrowNav = await page.locator(".ef-doc__nav").boundingBox();
  const narrowContent = await page.locator(".ef-doc__content").boundingBox();
  expect(narrowContent.y).toBeGreaterThan(narrowNav.y);
  expect(await page.locator(".ef-doc__nav ul").evaluate(el => getComputedStyle(el).display)).toBe("flex");
  expect(narrowNav.height, "compact documentation navigation stays short").toBeLessThan(200);
});
