import { expect, test } from "@playwright/test";
import { measureOverflow, settleFontsAndFrames } from "../../packages/conformance/src/index.mjs";

// EII-F typography roles. data-ef-type selects a role on any element:
// marketing (the default, unchanged), application, dense, accessible.
// Expected values are named token steps, read back from the compiled tokens,
// so the tests never restate a raw size.
const ROLES = {
  application: { h1: "2xl", h2: "xl", h3: "lg", h4: "md", body: "md", leadingBody: "normal", leadingHeading: "snug" },
  dense: { h1: "xl", h2: "lg", h3: "md", h4: "sm", body: "sm", leadingBody: "snug", leadingHeading: "snug" },
  accessible: { h1: "3xl", h2: "2xl", h3: "xl", h4: "lg", body: "lg", leadingBody: "relaxed", leadingHeading: "snug" }
};

const FIXTURES = {
  site: "/tests/browser/fixture/type-roles-site.html",
  app: "/tests/browser/fixture/type-roles-app.html"
};

const WIDTHS = [320, 375, 768, 1024, 1280];
const TEXT_SCALES = [1, 2];

async function open(page, fixture, { width, role, on = "html", scale = 1 }) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(FIXTURES[fixture]);
  await page.evaluate(({ role, on }) => {
    if (role) document.querySelector(on).setAttribute("data-ef-type", role);
  }, { role, on });
  // 200% text: the user's text size, not page zoom (WCAG 1.4.4).
  if (scale !== 1) await page.addStyleTag({ content: `html { font-size: ${scale * 100}% !important; }` });
  await settleFontsAndFrames(page);
}

// A token step resolved to CSS pixels in the page (rem tokens scale with text).
function tokenPx(page, name) {
  return page.evaluate(token => {
    const probe = document.createElement("div");
    probe.style.fontSize = `var(${token})`;
    document.body.append(probe);
    const px = parseFloat(getComputedStyle(probe).fontSize);
    probe.remove();
    return px;
  }, `--ef-primitive-font-size-${name}`);
}

function tokenNumber(page, name) {
  return page.evaluate(token => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(token)), `--ef-primitive-line-height-${name}`);
}

function typeOf(page, selector) {
  return page.locator(selector).first().evaluate(element => {
    const style = getComputedStyle(element);
    return {
      fontSize: parseFloat(style.fontSize),
      lineHeight: style.lineHeight === "normal" ? null : parseFloat(style.lineHeight),
      maxInlineSize: style.maxInlineSize
    };
  });
}

// Number of rendered line boxes of an element's text.
function lineCount(page, selector) {
  return page.locator(selector).first().evaluate(element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const tops = [...range.getClientRects()].filter(rect => rect.width > 0).map(rect => Math.round(rect.top));
    return new Set(tops).size;
  });
}

// Layout observations for one rendered state. Every finding is a string so a
// failure names the element and the geometry.
function layoutFindings(page, { wordBreaks = true } = {}) {
  return page.evaluate(({ wordBreaks }) => {
    const findings = [];
    const label = element => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""} "${element.textContent.replace(/\s+/g, " ").trim().slice(0, 32)}"`;
    const visible = element => element.checkVisibility() && element.getBoundingClientRect().width > 1;

    // Words of ordinary length are never split across lines inside a
    // heading: the heading measure and size must fit them (containment
    // without forced breaks). Unbroken tokens longer than 16 characters may
    // wrap anywhere; that is the long-content fallback. At 200% text on a
    // narrow viewport a word can be wider than the line at any fixed step;
    // there the contained mid-word break is the accepted fallback (WCAG
    // 1.4.4 asks for no loss of content), so callers skip this check.
    for (const heading of wordBreaks ? document.querySelectorAll("main :is(h1, h2, h3, h4)") : []) {
      if (!visible(heading)) continue;
      const text = heading.firstChild;
      if (!text || text.nodeType !== Node.TEXT_NODE) continue;
      const words = [...text.textContent.matchAll(/\S+/g)];
      for (const word of words) {
        if (word[0].length > 16) continue;
        const range = document.createRange();
        range.setStart(text, word.index);
        range.setEnd(text, word.index + word[0].length);
        const tops = new Set([...range.getClientRects()].filter(rect => rect.width > 0).map(rect => Math.round(rect.top)));
        if (tops.size > 1) findings.push(`word split across lines: "${word[0]}" in ${label(heading)}`);
      }
    }

    // Line boxes of one text block never overlap each other (leading below
    // the glyph height makes ascenders and descenders collide). Lines are
    // built from the block's text runs, so an inline element's padding is
    // not mistaken for a line.
    for (const block of document.querySelectorAll("main :is(h1, h2, h3, h4, p, label, a, td, th)")) {
      if (!visible(block)) continue;
      const lines = [];
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
      for (let text = walker.nextNode(); text; text = walker.nextNode()) {
        const range = document.createRange();
        range.selectNodeContents(text);
        for (const rect of range.getClientRects()) {
          if (rect.width <= 0) continue;
          const middle = (rect.top + rect.bottom) / 2;
          const line = lines.find(item => middle >= item.top && middle <= item.bottom);
          if (line) { line.top = Math.min(line.top, rect.top); line.bottom = Math.max(line.bottom, rect.bottom); }
          else lines.push({ top: rect.top, bottom: rect.bottom });
        }
      }
      lines.sort((a, b) => a.top - b.top);
      for (let i = 1; i < lines.length; i += 1) {
        const overlap = lines[i - 1].bottom - lines[i].top;
        if (overlap > 1) findings.push(`line boxes overlap by ${overlap.toFixed(1)}px in ${label(block)}`);
      }
    }

    // Flow siblings never overlap (element overlap).
    for (const parent of document.querySelectorAll("[data-role-sample], [data-role-sample] .ef-surface, [data-role-sample] .ef-form, [data-role-sample] .ef-field")) {
      const children = [...parent.children].filter(visible);
      for (let i = 1; i < children.length; i += 1) {
        const previous = children[i - 1].getBoundingClientRect();
        const current = children[i].getBoundingClientRect();
        const horizontal = Math.min(previous.right, current.right) - Math.max(previous.left, current.left);
        const vertical = Math.min(previous.bottom, current.bottom) - Math.max(previous.top, current.top);
        if (horizontal > 1 && vertical > 1) findings.push(`elements overlap: ${label(children[i - 1])} and ${label(children[i])}`);
      }
    }

    // Clipping: a box that hides overflow must not hide content; a box that
    // scrolls is the permitted contained scroller. Text inputs scroll by
    // design and are excluded.
    for (const element of document.querySelectorAll("body *")) {
      if (!visible(element) || element.matches("input, textarea, select")) continue;
      const style = getComputedStyle(element);
      const clipsX = ["hidden", "clip"].includes(style.overflowX);
      const clipsY = ["hidden", "clip"].includes(style.overflowY);
      const rect = element.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) continue; // visually hidden pattern
      if ((clipsX && element.scrollWidth > element.clientWidth + 1) || (clipsY && element.scrollHeight > element.clientHeight + 1)) {
        findings.push(`content clipped by ${label(element)}`);
      }
    }
    return findings;
  }, { wordBreaks });
}

// Tab through the page: every stop shows a focus indicator, is on screen,
// and the order follows the document.
async function keyboardFindings(page) {
  const findings = [];
  const expected = await page.evaluate(() => [...document.querySelectorAll('a[href], button, input, [tabindex="0"]')]
    .filter(element => element.checkVisibility()).map(element => element.id || element.textContent.trim().slice(0, 24)));
  const seen = [];
  for (let step = 0; step < expected.length; step += 1) {
    await page.keyboard.press("Tab");
    // The site shell scrolls smoothly: let the focus scroll settle.
    await page.evaluate(() => new Promise(resolve => {
      let last = -1, stable = 0, frames = 0;
      const tick = () => {
        stable = scrollY === last ? stable + 1 : 0;
        last = scrollY;
        frames += 1;
        if (stable >= 5 || frames > 240) resolve(); else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }));
    const stop = await page.evaluate(() => {
      const element = document.activeElement;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        name: element.id || element.textContent.trim().slice(0, 24),
        indicator: (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== "none",
        onScreen: rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth
      };
    });
    seen.push(stop.name);
    if (!stop.indicator) findings.push(`no visible focus indicator on ${stop.name}`);
    if (!stop.onScreen) findings.push(`focused ${stop.name} is off screen`);
  }
  if (JSON.stringify(seen) !== JSON.stringify(expected)) findings.push(`tab order ${JSON.stringify(seen)} differs from document order ${JSON.stringify(expected)}`);
  return findings;
}

// --- Reproduction of the R5 defect -----------------------------------------
// An application screen on the .ef-site shell inherits the marketing display
// scale (h1 up to 7.25rem, capped at 14ch). R5 asserted h1 = 2 x root on one
// line (two at 320px) and had to override Forma locally (f207cd4).
for (const width of [1440, 1180, 820, 320]) {
  test(`application role: site-shell h1/h2/h3 use fixed steps without a ch cap at ${width}px`, async ({ page }) => {
    await open(page, "site", { width, role: "application", on: "body" });
    const h1 = await typeOf(page, "#title");
    expect(h1.fontSize, "h1 is the 2xl step").toBeCloseTo(await tokenPx(page, "2xl"), 1);
    expect(h1.maxInlineSize, "h1 takes the full measure").toBe("none");
    expect(await lineCount(page, "#title"), "h1 wraps at most once, only at 320px").toBeLessThanOrEqual(width <= 320 ? 2 : 1);
    expect((await typeOf(page, "#investigations")).fontSize, "h2 is the xl step").toBeCloseTo(await tokenPx(page, "xl"), 1);
    expect((await typeOf(page, "#investigations")).maxInlineSize).toBe("none");
    expect((await typeOf(page, "#card-1")).fontSize, "h3 is the lg step").toBeCloseTo(await tokenPx(page, "lg"), 1);
  });
}

// --- Role scales on both layers --------------------------------------------
for (const fixture of Object.keys(FIXTURES)) {
  for (const [role, steps] of Object.entries(ROLES)) {
    for (const on of ["html", "body"]) {
      test(`${role} role on <${on}> sets its fixed steps and leading (${fixture})`, async ({ page }) => {
        await open(page, fixture, { width: 1280, role, on });
        for (const [selector, step] of [["#title", steps.h1], ["#investigations", steps.h2], ["#card-1", steps.h3], ["#ledger-title", steps.h4], ["#lede", steps.body]]) {
          expect((await typeOf(page, selector)).fontSize, `${selector} is the ${step} step`).toBeCloseTo(await tokenPx(page, step), 1);
        }
        const h1 = await typeOf(page, "#title");
        expect(h1.lineHeight / h1.fontSize, "heading leading token").toBeCloseTo(await tokenNumber(page, steps.leadingHeading), 2);
        expect(h1.maxInlineSize).toBe("none");
        const body = await typeOf(page, "#lede");
        expect(body.lineHeight / body.fontSize, "body leading token").toBeCloseTo(await tokenNumber(page, steps.leadingBody), 2);
      });
    }
  }
}

test("dense is smaller and tighter than application; accessible is larger and looser", async ({ page }) => {
  const measure = async role => {
    await open(page, "site", { width: 1280, role, on: "body" });
    return { h1: await typeOf(page, "#title"), body: await typeOf(page, "#lede") };
  };
  const [application, dense, accessible] = [await measure("application"), await measure("dense"), await measure("accessible")];
  expect(dense.h1.fontSize).toBeLessThan(application.h1.fontSize);
  expect(dense.body.fontSize).toBeLessThan(application.body.fontSize);
  expect(dense.body.lineHeight / dense.body.fontSize).toBeLessThan(application.body.lineHeight / application.body.fontSize);
  expect(accessible.h1.fontSize).toBeGreaterThan(application.h1.fontSize);
  expect(accessible.body.fontSize).toBeGreaterThan(application.body.fontSize);
  expect(accessible.body.lineHeight / accessible.body.fontSize).toBeGreaterThan(application.body.lineHeight / application.body.fontSize);
});

// --- Marketing stays the default ------------------------------------------
test("without a role, and with data-ef-type=marketing, the site shell keeps the marketing display scale", async ({ page }) => {
  await open(page, "site", { width: 1280 });
  const unset = await typeOf(page, "#title");
  // The 14ch/18ch measure caps (computed to pixels) stay in place.
  expect(unset.maxInlineSize).not.toBe("none");
  expect((await typeOf(page, "#investigations")).maxInlineSize).not.toBe("none");
  expect(unset.fontSize, "fluid display-1 exceeds the 3xl step at 1280px").toBeGreaterThan(await tokenPx(page, "3xl"));
  await open(page, "site", { width: 1280, role: "marketing", on: "body" });
  expect(await typeOf(page, "#title")).toEqual(unset);
});

test("the nearest role wins: a dense region inside an application screen", async ({ page }) => {
  await open(page, "site", { width: 1280, role: "application", on: "html" });
  await page.evaluate(() => document.querySelector("[data-role-sample]").setAttribute("data-ef-type", "dense"));
  expect((await typeOf(page, "#title")).fontSize).toBeCloseTo(await tokenPx(page, ROLES.dense.h1), 1);
  expect((await typeOf(page, "#lede")).fontSize).toBeCloseTo(await tokenPx(page, ROLES.dense.body), 1);
});

// --- Layout verification per role ------------------------------------------
// Containment, overlap, clipping, page overflow and long unbroken content at
// 320-1280px and at 200% text, then focus visibility and keyboard order.
for (const fixture of Object.keys(FIXTURES)) {
  for (const role of Object.keys(ROLES)) {
    test(`${role} role holds layout at 320-1280px and 200% text (${fixture})`, async ({ page }) => {
      const failures = [];
      for (const scale of TEXT_SCALES) {
        for (const width of WIDTHS) {
          await open(page, fixture, { width, role, scale });
          const overflow = await measureOverflow(page);
          if (overflow.status !== "PASS") failures.push(`[${width}px x${scale}] ${overflow.reason} ${overflow.escapes.join("; ")}`);
          for (const finding of await layoutFindings(page, { wordBreaks: scale === 1 })) failures.push(`[${width}px x${scale}] ${finding}`);
        }
      }
      expect(failures, failures.join("\n")).toEqual([]);
    });

    test(`${role} role keeps focus visible and keyboard order intact at 320px and 200% text (${fixture})`, async ({ page }) => {
      const failures = [];
      for (const [width, scale] of [[320, 1], [1280, 1], [320, 2]]) {
        await open(page, fixture, { width, role, scale });
        for (const finding of await keyboardFindings(page)) failures.push(`[${width}px x${scale}] ${finding}`);
      }
      expect(failures, failures.join("\n")).toEqual([]);
    });
  }
}
