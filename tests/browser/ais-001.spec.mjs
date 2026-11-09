import { expect, test } from "@playwright/test";
import { STATUS, measureOverflow } from "../../packages/conformance/src/index.mjs";

// AIS-001 (WI-0045): application identity, pre-runtime start-up and pending
// actions. Fixture: tests/browser/fixture/ais-001.html.
const FIXTURE = "/tests/browser/fixture/ais-001.html";

const open = async (page, { width = 1280, reducedMotion = "no-preference" } = {}) => {
  await page.emulateMedia({ reducedMotion });
  await page.setViewportSize({ width, height: 900 });
  await page.goto(FIXTURE);
};

const visibleScheme = (page, id) =>
  page.locator(`#${id} .ef-app-identity__mark > object`).evaluateAll(objects =>
    objects.filter(object => getComputedStyle(object).display !== "none").map(object => object.dataset.efScheme));

test("identity shows the mark variant for the active theme, including a nested light region", async ({ page }) => {
  await open(page);
  expect(await visibleScheme(page, "identity-light")).toEqual(["light"]);
  expect(await visibleScheme(page, "identity-dark")).toEqual(["dark"]);
  expect(await visibleScheme(page, "identity-nested-light")).toEqual(["light"]);
});

test("identity follows the operating-system scheme when no theme is set", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(FIXTURE);
  await page.locator("body").evaluate(body => {
    body.insertAdjacentHTML("beforeend", document.querySelector("#identity-light").outerHTML.replace('id="identity-light"', 'id="identity-os"'));
  });
  expect(await visibleScheme(page, "identity-os")).toEqual(["dark"]);
});

test("identity link has one accessible name, and the mark is not focusable", async ({ page }) => {
  await open(page);
  await expect(page.getByRole("link", { name: "Northwind Ledger", exact: true }).first()).toBeVisible();
  const objects = await page.locator("#identity-light object").evaluateAll(list => list.map(o => [o.getAttribute("aria-hidden"), o.tabIndex]));
  expect(objects).toEqual([["true", -1], ["true", -1]]);
  const box = await page.locator("#identity-light").boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
});

test("a mark that fails to load degrades to its monogram", async ({ page }) => {
  await open(page);
  const monogram = page.locator("#identity-missing .ef-app-identity__monogram");
  await expect(monogram).toBeVisible();
  const box = await monogram.boundingBox();
  expect(Math.round(box.width)).toBe(64);
  expect(Math.round(box.height)).toBe(64);
  const loaded = page.locator("#identity-light object[data-ef-scheme='light'] .ef-app-identity__monogram");
  await expect(loaded).toBeHidden();
});

test("under object-src 'none' an object mark degrades to its monogram and an inline mark still renders", async ({ page }) => {
  await page.goto("/tests/browser/fixture/ais-001-csp.html");
  await expect(page.locator("#csp-object .ef-app-identity__monogram")).toBeVisible();
  const svg = page.locator("#csp-inline svg");
  await expect(svg).toBeVisible();
  const box = await svg.boundingBox();
  expect(Math.round(box.width)).toBe(64);
});

test("an inline currentColor mark takes the theme accent, per brand", async ({ page }) => {
  await open(page);
  const read = id => page.locator(`#${id} .ef-app-identity__mark path`).first().evaluate(path => getComputedStyle(path).fill);
  const accent = id => page.locator(`#${id}`).evaluate(element => getComputedStyle(element).getPropertyValue("--ef-color-accent-primary").trim());
  const toRgb = hex => `rgb(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
  expect(await read("startup-orchard-light")).toBe(toRgb(await accent("startup-orchard-light")));
  expect(await read("startup-harbor-dark")).toBe(toRgb(await accent("startup-harbor-dark")));
  expect(await read("startup-orchard-light")).not.toBe(await read("startup-harbor-dark"));
});

for (const [size, pixels] of [["16", 16], ["24", 24], ["32", 32], ["64", 64]]) {
  test(`identity mark renders at ${size} pixels`, async ({ page }) => {
    await open(page);
    const box = await page.locator(`#size-${size} .ef-app-identity__mark`).boundingBox();
    expect(Math.round(box.width)).toBe(pixels);
    expect(Math.round(box.height)).toBe(pixels);
  });
}

test("start-up shows identity, indicator and a meaningful status under both brands", async ({ page }) => {
  await open(page);
  for (const id of ["startup-orchard-light", "startup-harbor-dark"]) {
    const root = page.locator(`#${id}`);
    await expect(root.locator(".ef-app-identity__name")).toBeVisible();
    await expect(root.locator(".ef-spinner__indicator")).toBeVisible();
    await expect(root.getByRole("status")).toContainText("Starting Northwind Ledger");
    await expect(root.getByRole("status")).not.toHaveText(/^\s*Loading\s*$/);
    await expect(root.locator(".ef-startup__problem")).toBeHidden();
    await expect(root.locator(".ef-startup__noscript")).toBeHidden();
  }
  const colors = await page.evaluate(() => ["#startup-orchard-light", "#startup-harbor-dark"].map(id => getComputedStyle(document.querySelector(id)).backgroundColor));
  expect(colors[0]).not.toBe(colors[1]);
});

test("the slow-start note is hidden at first and revealed after the delay without script", async ({ page }) => {
  await open(page);
  const root = page.locator("#startup-orchard-light");
  await root.evaluate(element => element.style.setProperty("--ef-startup-slow-after", "3s"));
  // Restart the animation so the shortened delay applies from now.
  await root.evaluate(element => { const slow = element.querySelector(".ef-startup__slow"); slow.style.animation = "none"; void slow.offsetWidth; slow.style.animation = ""; });
  await expect(root.locator(".ef-startup__slow")).toBeHidden();
  const before = await root.locator(".ef-startup__slow").boundingBox();
  expect(before?.height ?? 0).toBeGreaterThan(0);
  await expect(root.locator(".ef-startup__slow")).toBeVisible({ timeout: 5000 });
});

for (const reducedMotion of ["no-preference", "reduce"]) {
  test(`the slow-start note appears at the default delay (${reducedMotion} motion)`, async ({ page }) => {
    test.setTimeout(30_000);
    await open(page, { reducedMotion });
    const note = page.locator("#startup-orchard-light .ef-startup__slow");
    await expect(note).toBeHidden();
    await page.waitForTimeout(6_000);
    await expect(note).toBeHidden();
    await expect(note).toBeVisible({ timeout: 6_000 });
  });
}

test("an explicit light region keeps the light mark under a dark operating-system preference", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(FIXTURE);
  await page.locator("body").evaluate(body => {
    const region = document.createElement("section");
    region.dataset.efTheme = "light";
    region.innerHTML = document.querySelector("#identity-light").outerHTML.replace('id="identity-light"', 'id="identity-os-light-region"');
    body.append(region);
  });
  expect(await visibleScheme(page, "identity-os-light-region")).toEqual(["light"]);
});

test("the host can mark a slow start explicitly", async ({ page }) => {
  await open(page);
  await expect(page.locator("#startup-slow .ef-startup__slow")).toBeVisible();
});

for (const id of ["startup-failed", "startup-timed-out"]) {
  test(`${id} removes the activity and shows the problem with a recovery action`, async ({ page }) => {
    await open(page);
    const root = page.locator(`#${id}`);
    await expect(root.locator(".ef-startup__status")).toBeHidden();
    await expect(root.getByRole("alert")).toBeVisible();
    await expect(root.getByRole("link", { name: "Reload" })).toBeVisible();
  });
}

test("start-up shows the no-script message when scripting is off", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(FIXTURE);
  const root = page.locator("#startup-orchard-light");
  await expect(root.locator(".ef-startup__noscript")).toBeVisible();
  await expect(root.locator(".ef-startup__status")).toBeHidden();
  await context.close();
});

test("start-up shows a static indicator under reduced motion and still reveals the slow note", async ({ page }) => {
  await open(page, { reducedMotion: "reduce" });
  const root = page.locator("#startup-orchard-light");
  const animation = await root.locator(".ef-spinner__indicator").evaluate(element => getComputedStyle(element).animationName);
  expect(animation).toBe("none");
  await expect(root.locator(".ef-spinner__indicator")).toBeVisible();
  const reveal = await root.locator(".ef-startup__slow").evaluate(element => getComputedStyle(element).animationName);
  expect(reveal).toBe("ef-startup-reveal");
});

test("start-up and pending states do not scroll sideways at 320 pixels", async ({ page }) => {
  await open(page, { width: 320 });
  const overflow = await measureOverflow(page);
  expect(overflow.status, `${overflow.reason}\n${overflow.escapes.join("\n")}`).toBe(STATUS.PASS);
});

test("a pending button keeps its label, shows a busy ring and loses hover feedback", async ({ page }) => {
  await open(page);
  const busy = page.locator("#busy-button");
  const idle = page.locator("#idle-button");
  await expect(busy).toHaveText("Saving contact");
  const ring = await busy.evaluate(element => { const s = getComputedStyle(element, "::before"); return { content: s.content, width: s.width, animation: s.animationName }; });
  expect(ring.content).toBe('""');
  expect(ring.animation).toBe("ef-spinner-rotate");
  const rest = await busy.evaluate(element => getComputedStyle(element).backgroundColor);
  await busy.hover();
  expect(await busy.evaluate(element => getComputedStyle(element).backgroundColor)).toBe(rest);
  expect(await busy.evaluate(element => getComputedStyle(element).cursor)).toBe("progress");
  const idleRing = await idle.evaluate(element => getComputedStyle(element, "::before").content);
  expect(idleRing).toBe("none");
  await busy.focus();
  await expect(busy).toBeFocused();
  const link = await page.locator("#busy-link").evaluate(element => getComputedStyle(element, "::before").animationName);
  expect(link).toBe("ef-spinner-rotate");
});

test("a pending button's ring is static under reduced motion", async ({ page }) => {
  await open(page, { reducedMotion: "reduce" });
  const ring = await page.locator("#busy-button").evaluate(element => getComputedStyle(element, "::before").animationName);
  expect(ring).toBe("none");
});

test("a pending form refuses edits and resubmission natively", async ({ page }) => {
  await open(page);
  await expect(page.locator("#pending-name")).toBeDisabled();
  await expect(page.locator("#pending-button")).toBeDisabled();
  expect(await page.locator("#pending-form").evaluate(element => getComputedStyle(element).cursor)).toBe("progress");
});
