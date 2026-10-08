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

// Optical review guard: stroked geometry (1.8 units, so 0.9 either side of the
// path) must keep at least one grid unit of clearance inside the 24-unit
// viewBox, so round caps are never clipped at 16px, and every icon must keep a
// legible live area at the smallest supported size.
const SAFE_MARGIN = 1;
const HALF_STROKE = 0.9;
const MIN_LIVE_AREA = 10;

for (const size of [16, 20, 24, 32]) {
  test(`every registry icon renders at ${size}px with stroked geometry inside the safe area`, async ({ page }) => {
    await page.setContent(doc(`<p style="--ef-icon-size:${size}px">${registry.icons.map(icon => snippet(icon.name)).join(" ")}</p>`));
    const rendered = await page.locator(".ef-icon").evaluateAll(nodes => nodes.map(node => {
      const svg = node.querySelector("svg");
      const box = svg.getBBox();
      const rect = svg.getBoundingClientRect();
      return { name: node.dataset.efIcon, x: box.x, y: box.y, width: box.width, height: box.height, px: [rect.width, rect.height] };
    }));
    expect(rendered.map(icon => icon.name)).toEqual(registry.icons.map(icon => icon.name));
    for (const icon of rendered) {
      expect(icon.px, `${icon.name} rendered size`).toEqual([size, size]);
      expect(icon.x - HALF_STROKE, `${icon.name} left clearance`).toBeGreaterThanOrEqual(SAFE_MARGIN);
      expect(icon.y - HALF_STROKE, `${icon.name} top clearance`).toBeGreaterThanOrEqual(SAFE_MARGIN);
      expect(icon.x + icon.width + HALF_STROKE, `${icon.name} right clearance`).toBeLessThanOrEqual(24 - SAFE_MARGIN);
      expect(icon.y + icon.height + HALF_STROKE, `${icon.name} bottom clearance`).toBeLessThanOrEqual(24 - SAFE_MARGIN);
      expect(Math.max(icon.width, icon.height), `${icon.name} live area`).toBeGreaterThanOrEqual(MIN_LIVE_AREA);
    }
  });
}

test("icons print as visible ink in grayscale without backgrounds and keep text as the status carrier", async ({ page }) => {
  await page.setContent(doc(`<p style="color:rgb(160,40,30)">${snippet("warning")} Warning: review incomplete.</p>`));
  await page.emulateMedia({ media: "print" });
  await page.addStyleTag({ content: "html { filter: grayscale(1); }" });
  const printed = await page.locator(".ef-icon__svg").evaluate(svg => {
    const style = getComputedStyle(svg);
    return { display: style.display, visibility: style.visibility, stroke: style.stroke, fill: style.fill, width: svg.getBoundingClientRect().width };
  });
  expect(printed.display).not.toBe("none");
  expect(printed.visibility).toBe("visible");
  // Ink is the stroke in currentColor, never a background, so printBackground:false keeps it.
  expect(printed.stroke).toBe("rgb(160, 40, 30)");
  expect(printed.fill).toBe("none");
  expect(printed.width).toBeGreaterThan(0);
  await expect(page.getByText("Warning: review incomplete.")).toBeVisible();
});

test("icons survive a real A4 PDF render with backgrounds disabled", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "page.pdf() is implemented only by Chromium");
  await page.setContent(doc(`<p>${snippet("success")} Complete</p>`));
  await page.emulateMedia({ media: "print" });
  const pdf = await page.pdf({ format: "A4", printBackground: false });
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  // One A4 page (595.92 x 842.88pt); the icon is vector ink, not a raster image.
  expect(pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)).toHaveLength(1);
  expect(pdf.toString("latin1")).toMatch(/\/MediaBox\s*\[\s*0\s+0\s+595\.9\d*\s+842\.8\d*\s*\]/);
  expect(pdf.toString("latin1")).not.toMatch(/\/Subtype\s*\/Image/);
});
