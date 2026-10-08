import fs from "node:fs";
import { expect, test } from "@playwright/test";

const css = fs.readFileSync("dist/all.css", "utf8");
const registry = JSON.parse(fs.readFileSync("dist/icons/registry.json", "utf8"));
const snippet = id => fs.readFileSync("dist/icons/html/" + id + ".html", "utf8");

const doc = source => `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><main>${source}</main></body></html>`;

test("decorative icons remain hidden from a11y while a native icon button keeps semantic identity", async ({ page }) => {
  await page.setViewportSize({width:320,height:600});
  await page.setContent(doc(`<button type="button" aria-label="Edit document">${snippet("edit")}</button><p>${snippet("warning")} Warning: review incomplete.</p>`));
  const button = page.getByRole("button", {name:"Edit document"});
  await expect(button).toBeVisible();
  await expect(button).toHaveAttribute("aria-label", "Edit document");
  await expect(button.locator("svg")).toHaveAttribute("aria-hidden","true");
  await expect(page.getByRole("img")).toHaveCount(0);
  await expect(page.getByText("Warning: review incomplete.")).toBeVisible();
  const metrics = await button.evaluate(el => ({rect:el.getBoundingClientRect().toJSON(),color:getComputedStyle(el.querySelector("svg")).stroke}));
  expect(metrics.rect.height).toBeGreaterThanOrEqual(43);
  expect(metrics.rect.width).toBeGreaterThanOrEqual(43);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
});

test("canonical geometry survives brand-independent coloring, forced colors, and small or large sizes", async ({ page }) => {
  await page.setContent(doc(`<p style="color:rgb(8,80,120)">Small <span style="--ef-icon-size:16px">${snippet("workflow")}</span></p><p style="--ef-icon-size:32px">Large ${snippet("agent")}</p>`));
  const before = await page.locator(".ef-icon__svg").evaluateAll(nodes => nodes.map(el=>({
    box:el.getBoundingClientRect().toJSON(),viewBox:el.getAttribute("viewBox"),stroke:getComputedStyle(el).stroke
  })));
  expect(before.map(x=>Math.round(x.box.width))).toEqual([16,32]);
  expect(before.every(x=>x.viewBox==="0 0 24 24")).toBe(true);
  expect(before[0].stroke).toBe("rgb(8, 80, 120)");
  await page.emulateMedia({forcedColors:"active", reducedMotion:"reduce"});
  await expect(page.locator(".ef-icon__svg")).toHaveCount(2);
  await expect(page.locator(".ef-icon__svg").first()).toHaveAttribute("aria-hidden","true");
});

test("all names in the public registry resolve to safe offline inline SVG snippets", async ({ page }) => {
  expect(registry.icons).toHaveLength(40);
  await page.route("**/*", async route => route.abort("failed"));
  const html = registry.icons.map(icon => snippet(icon.name)).join("");
  await page.setContent(doc(html));
  await expect(page.locator(".ef-icon__svg")).toHaveCount(registry.icons.length);
  await expect(page.locator("foreignObject, script, iframe")).toHaveCount(0);
  await expect(page.locator(".ef-icon__svg").first()).toHaveAttribute("viewBox","0 0 24 24");
});
