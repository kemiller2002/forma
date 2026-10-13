// Forma documentation site and the Forma-owned Echelon marketing reference
// fixture against visual-engineering/UI-LAYOUT-INTERACTION@1.0.0: no page
// overflow and intact navigation labels at every contract width and at
// doubled text (ULI-L05, L06, L09); every enabled action has a valid
// destination or native behavior (ULI-A01); in-page navigation lands clear of
// a sticky header and the page title is never under the header (ULI-L05).
import { expect, test } from "@playwright/test";
import {
  CONTRACT_WIDTHS,
  expectDestinationClearOfHeader,
  expectNoOverflow,
  inventoryActions,
  scaleDefaultText
} from "./ui-conformance-helpers.mjs";

const PAGES = [
  "/examples/echelon-marketing-site/index.html",
  "/examples/echelon-marketing-site/product.html",
  "/examples/echelon-marketing-site/docs.html",
  "/site-dist/index.html",
  "/site-dist/components/index.html",
  "/site-dist/components/button/index.html",
  "/site-dist/compositions/index.html"
];

// Words in navigation and calls to action that break across lines anywhere
// other than a space, hyphen, dash or slash (ULI-L06).
// Site chrome only: catalog specimens inside example canvases are covered by
// their own catalog checks.
const splitNavigationWords = page => page.locator("header a, header button, nav a, .ef-actions a, .ef-actions button").evaluateAll(elements =>
  elements.filter(element => element.checkVisibility() && !element.closest(".example-canvas, .catalog-card__preview, [data-ve-verification]")).flatMap(element => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const texts = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) texts.push(node);
    // A word that is wider than the element's container cannot avoid a
    // break; only breaks inside words that would fit are findings.
    const context = document.createElement("canvas").getContext("2d");
    const style = getComputedStyle(element);
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const own = parseFloat(style.paddingInlineStart) + parseFloat(style.paddingInlineEnd) + parseFloat(style.borderInlineStartWidth) + parseFloat(style.borderInlineEndWidth);
    const room = (element.parentElement?.clientWidth ?? Infinity) - own;
    return texts.flatMap(text => [...text.textContent.matchAll(/[^\s\-–—/]+/g)].filter(match => {
      const range = document.createRange();
      range.setStart(text, match.index);
      range.setEnd(text, match.index + match[0].length);
      const tops = [...range.getClientRects()].filter(rect => rect.width > 0).map(rect => rect.top);
      const lineHeight = Math.max(...[...range.getClientRects()].map(rect => rect.height), 1);
      const broken = tops.length > 1 && Math.max(...tops) - Math.min(...tops) > lineHeight / 2;
      return broken && context.measureText(match[0]).width <= room;
    }).map(match => `"${match[0]}" in "${element.textContent.trim().slice(0, 40)}"`));
  }));

for (const url of PAGES) {
  for (const scale of [1, 2]) {
    test(`ULI-L05/L06 ${url} at text ${scale * 100}%: contained with intact navigation labels`, async ({ page }) => {
      const findings = [];
      for (const width of CONTRACT_WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(url);
        if (scale !== 1) await scaleDefaultText(page, scale);
        await expectNoOverflow(page).catch(error => findings.push(`${width}px: ${error.message.split("\n").slice(0, 4).join(" ")}`));
        const split = await splitNavigationWords(page);
        if (split.length) findings.push(`${width}px: navigation words split mid-word: ${split.join(", ")}`);
        const title = await page.evaluate(() => {
          const header = document.querySelector("body > header, .ef-site-header, .site-header");
          const h1 = document.querySelector("h1");
          return header && h1 ? { overlap: header.getBoundingClientRect().bottom - h1.getBoundingClientRect().top } : null;
        });
        if (title && title.overlap > 0.5) findings.push(`${width}px: the page title starts ${title.overlap.toFixed(1)}px under the header`);
      }
      expect(findings, findings.join("\n")).toEqual([]);
    });
  }

  test(`ULI-A01 ${url}: every enabled action has a valid destination or native behavior`, async ({ page, request }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(url);
    const actions = await inventoryActions(page.locator("body"), { includeHidden: true });
    const details = await page.locator(":is(a[href], button, summary, input[type=submit], input[type=button], input[type=reset], [role=button], [role=link], [role=switch], [role=tab], [role=menuitem])")
      .evaluateAll(elements => elements.map(element => ({
        tag: element.tagName.toLowerCase(),
        href: element.getAttribute("href"),
        type: element.type ?? null,
        native: element.tagName === "SUMMARY" || (element.tagName === "INPUT" && element.type === "checkbox") ||
          element.hasAttribute("popovertarget") || element.hasAttribute("commandfor") || Boolean(element.closest("form[method=dialog]")),
        excluded: element.matches(":disabled") || element.getAttribute("aria-disabled") === "true" || Boolean(element.closest("[inert]"))
      })).filter(item => !item.excluded));
    expect(details.length).toBe(actions.length);
    const findings = [];
    const checked = new Map();
    for (const item of details) {
      if (item.tag === "a") {
        const target = new URL(item.href, page.url());
        if (!/^https?:$/.test(target.protocol) && target.protocol !== "mailto:") { findings.push(`invalid link protocol ${item.href}`); continue; }
        if (target.origin !== new URL(page.url()).origin) continue; // external: valid absolute URL, not exercised
        const key = target.pathname;
        if (!checked.has(key)) {
          const response = await request.get(key);
          checked.set(key, { status: response.status(), body: response.ok() ? await response.text() : "" });
        }
        const { status, body } = checked.get(key);
        if (status !== 200) { findings.push(`${item.href} -> HTTP ${status}`); continue; }
        if (target.hash.length > 1) {
          const id = decodeURIComponent(target.hash.slice(1));
          const exists = target.pathname === new URL(page.url()).pathname
            ? await page.evaluate(value => Boolean(document.getElementById(value)), id)
            : new RegExp(`\\bid=["']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(body);
          if (!exists) findings.push(`${item.href}: target #${id} does not exist on ${key}`);
        }
      } else if (!item.native) {
        findings.push(`${item.tag}${item.type ? `[type=${item.type}]` : ""} has no native behavior on a script-free page`);
      }
    }
    expect(findings, findings.join("\n")).toEqual([]);
  });
}

test("ULI-L05 marketing fragment navigation lands clear of the sticky header", async ({ page }) => {
  for (const file of ["index.html", "product.html", "docs.html"]) {
    for (const width of [768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/examples/echelon-marketing-site/${file}`);
      const header = page.locator(".ef-site-header");
      const fragments = await page.locator(".ef-site-header a[href^='#']").evaluateAll(links => [...new Set(links.map(link => link.getAttribute("href")))]);
      for (const href of fragments) {
        if (href === "#" || !(await page.locator(href).count())) continue;
        await page.goto(`/examples/echelon-marketing-site/${file}${href}`);
        const destination = page.locator(`${href} :is(h1, h2, h3)`).first();
        const target = (await destination.count()) ? destination : page.locator(href);
        await expectDestinationClearOfHeader(page, target, header);
      }
    }
  }
});
