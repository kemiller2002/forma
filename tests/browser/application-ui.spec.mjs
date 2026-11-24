// Application UI additions (forma#186, #199, #200, #202, #203, #205, #206,
// #207): button variants outside .forma-site, the sentence status lozenge,
// shared breakpoints, data density, and the task list, period context,
// approval quorum and batch outcome components. Each is rendered at narrow
// and wide widths, checked with axe (WCAG 2.2 AA), for keyboard focus where
// interactive, and under forced colours. Screenshots are attached to the
// report as review artifacts (Forma keeps no pixel baselines).
import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "dist", "all.css"), "utf8");
const pattern = (slug) => fs.readFileSync(path.join(root, "patterns", `${slug}.html`), "utf8");
const entry = async (slug) => (await import(path.join(root, "catalog", "components", `${slug}.mjs`))).default;
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const WIDTHS = [320, 1280];

const page = (body, { theme = "light", attrs = "" } = {}) => `<!doctype html>
<html lang="en" data-forma-theme="${theme}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Forma application UI fixture</title>
<style>${css}</style><style>html, body { margin: 0; } body { padding: 1rem; } main { min-inline-size: 0; }</style></head>
<body><main ${attrs}>${body}</main></body></html>`;

async function noOverflow(p) {
  const size = await p.evaluate(() => ({ viewport: window.innerWidth, scroll: document.documentElement.scrollWidth }));
  expect(size.scroll, "no page-level horizontal overflow").toBeLessThanOrEqual(size.viewport);
}

async function axe(p) {
  const results = await new AxeBuilder({ page: p }).withTags(WCAG).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
}

// WCAG relative-luminance contrast of two computed rgb() colours.
const contrastIn = (p, selector, foreground, background) => p.evaluate(([sel, fg, bg]) => {
  const el = document.querySelector(sel);
  const style = getComputedStyle(el);
  const parse = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number);
  const lum = ([r, g, b]) => [r, g, b].map((c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; })
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const [a, b] = [lum(parse(style[fg])), lum(parse(style[bg]))].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}, [selector, foreground, background]);

const NEW_COMPONENTS = ["task-list", "period-context", "approval-quorum", "batch-outcome"];

for (const slug of NEW_COMPONENTS) {
  for (const width of WIDTHS) {
    test(`${slug}: canonical pattern and examples fit and pass axe at ${width}px`, async ({ page: p }, testInfo) => {
      await p.setViewportSize({ width, height: 900 });
      const component = await entry(slug);
      const body = [pattern(slug), ...component.examples.map((example) => example.html)].join("\n");
      await p.setContent(page(body));
      await noOverflow(p);
      await axe(p);
      await testInfo.attach(`${slug}-${width}.png`, { body: await p.screenshot({ fullPage: true }), contentType: "image/png" });
    });
  }

  test(`${slug}: dark theme passes axe and forced colours keep the frame`, async ({ page: p }) => {
    await p.setViewportSize({ width: 1280, height: 900 });
    await p.setContent(page(pattern(slug), { theme: "dark" }));
    await axe(p);
    await p.emulateMedia({ forcedColors: "active" });
    const frame = { "task-list": ".forma-task-list__icon", "period-context": ".forma-period-context", "approval-quorum": ".forma-approval-quorum", "batch-outcome": ".forma-batch-outcome__group" }[slug];
    const border = await p.locator(frame).first().evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.borderInlineStartStyle, width: parseFloat(s.borderInlineStartWidth) };
    });
    expect(border.style).not.toBe("none");
    expect(border.width).toBeGreaterThan(0);
  });
}

// --- forma#186: button variants outside .forma-site ----------------------

const BUTTONS = `<div class="forma-actions">
  <button type="button" id="primary" data-forma-variant="primary">Submit request</button>
  <button type="button" id="plain">Cancel</button>
  <button type="button" id="destructive" data-forma-variant="destructive">Revoke access for this member</button>
  <a class="forma-button" id="primary-link" data-forma-variant="primary" href="#plain">Continue</a>
  <button type="button" id="busy" data-forma-variant="primary" aria-busy="true" aria-disabled="true">Submitting</button>
  <button type="button" id="disabled" data-forma-variant="destructive" disabled>Void payment</button>
</div>`;

for (const theme of ["light", "dark", "high-contrast", "warm-earth"]) {
  test(`button variants are distinct and meet contrast outside .forma-site (${theme})`, async ({ page: p }) => {
    await p.setContent(page(BUTTONS, { theme }));
    const look = (id) => p.locator(`#${id}`).evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, border: s.borderTopWidth, borderColor: s.borderTopColor, height: el.getBoundingClientRect().height };
    });
    const [primary, plain, destructive, link] = await Promise.all(["primary", "plain", "destructive", "primary-link"].map(look));
    expect(primary.bg, "primary is filled, unlike the default button").not.toBe(plain.bg);
    expect(link.bg, "a primary link-button is filled the same way").toBe(primary.bg);
    expect(destructive.border, "destructive has a 2px outline").toBe("2px");
    expect(plain.border).toBe("1px");
    expect(destructive.borderColor).not.toBe(plain.borderColor);
    expect(destructive.height, "destructive keeps the button size").toBeCloseTo(plain.height, 0);
    expect(await contrastIn(p, "#primary", "color", "backgroundColor"), "primary label").toBeGreaterThanOrEqual(4.5);
    expect(await contrastIn(p, "#destructive", "color", "backgroundColor"), "destructive label").toBeGreaterThanOrEqual(4.5);
    // Non-text contrast of the filled primary against the page (WCAG 1.4.11).
    const boundary = await p.evaluate(() => {
      const parse = (v) => v.match(/[\d.]+/g).slice(0, 3).map(Number);
      const lum = (rgb) => rgb.map((c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
      const fill = lum(parse(getComputedStyle(document.querySelector("#primary")).backgroundColor));
      const pageBg = lum(parse(getComputedStyle(document.body).backgroundColor));
      const outline = lum(parse(getComputedStyle(document.querySelector("#destructive")).borderTopColor));
      const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      return { primary: ratio(fill, pageBg), destructive: ratio(outline, pageBg) };
    });
    expect(boundary.primary).toBeGreaterThanOrEqual(3);
    expect(boundary.destructive).toBeGreaterThanOrEqual(3);
    await axe(p);
  });
}

test("button variants keep their colours on hover, when pending and when disabled", async ({ page: p }) => {
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.setContent(page(BUTTONS));
  const bg = (id) => p.locator(`#${id}`).evaluate((el) => getComputedStyle(el).backgroundColor);
  const restPrimary = await bg("primary");
  await p.hover("#busy");
  expect(await bg("busy"), "pending primary keeps the fill under the pointer").toBe(restPrimary);
  expect(await contrastIn(p, "#busy", "color", "backgroundColor")).toBeGreaterThanOrEqual(4.5);
  await p.hover("#destructive");
  expect(await contrastIn(p, "#destructive", "color", "backgroundColor"), "destructive hover keeps the danger/surface pair").toBeGreaterThanOrEqual(4.5);
  await p.hover("#primary");
  expect(await contrastIn(p, "#primary", "color", "backgroundColor"), "primary hover").toBeGreaterThanOrEqual(4.5);
  const disabled = await p.locator("#disabled").evaluate((el) => ({ opacity: getComputedStyle(el).opacity, border: getComputedStyle(el).borderTopStyle }));
  expect(Number(disabled.opacity)).toBeLessThan(1);
  expect(disabled.border).toBe("dashed");
});

test("button variants are keyboard reachable with a visible focus indicator", async ({ page: p }) => {
  await p.setContent(page(BUTTONS));
  await p.keyboard.press("Tab");
  await expect(p.locator("#primary")).toBeFocused();
  const ring = await p.locator("#primary").evaluate((el) => { const s = getComputedStyle(el); return `${s.outlineStyle} ${s.outlineWidth} ${s.boxShadow}`; });
  expect(ring).not.toBe("none 0px none");
  await p.keyboard.press("Tab");
  await p.keyboard.press("Tab");
  await expect(p.locator("#destructive")).toBeFocused();
});

test("button variants stay distinguishable in forced colours", async ({ page: p }) => {
  await p.emulateMedia({ forcedColors: "active" });
  await p.setContent(page(BUTTONS));
  const border = (id) => p.locator(`#${id}`).evaluate((el) => `${getComputedStyle(el).borderTopStyle} ${getComputedStyle(el).borderTopWidth}`);
  expect(await border("primary")).toBe("solid 3px");
  expect(await border("destructive")).toBe("double 3px");
  expect(await border("plain")).toBe("solid 1px");
});

test("inside .forma-site the marketing primary treatment still applies", async ({ page: p }) => {
  await p.setContent(page(`<div class="forma-site"><a class="forma-button" id="m" data-forma-variant="primary" href="#m">See pricing</a></div>`));
  const values = await p.locator("#m").evaluate((el) => ({
    bg: getComputedStyle(el).backgroundColor,
    tone: getComputedStyle(el).getPropertyValue("--forma-tone-action-background").trim()
  }));
  expect(values.tone).not.toBe("");
  expect(values.bg).not.toBe("rgba(0, 0, 0, 0)");
});

// --- forma#202: sentence-case status lozenge -----------------------------

test("sentence lozenge: body face, >= 13px semibold, 1px state border, glyph kept", async ({ page: p }) => {
  await p.setContent(page(`<span class="forma-status-lozenge" id="compact" data-state="attention">On hold</span>
    ${["ok", "attention", "unknown", "blocked"].map((state) => `<span class="forma-status-lozenge" id="s-${state}" data-forma-variant="sentence" data-state="${state}">On hold</span>`).join("")}`));
  for (const state of ["ok", "attention", "unknown", "blocked"]) {
    const s = await p.locator(`#s-${state}`).evaluate((el) => {
      const c = getComputedStyle(el);
      return { size: parseFloat(c.fontSize), weight: Number(c.fontWeight), transform: c.textTransform, family: c.fontFamily, border: c.borderTopWidth, start: c.borderInlineStartWidth, borderColor: c.borderTopColor, color: c.color, glyph: getComputedStyle(el, "::before").content };
    });
    expect(s.size).toBeGreaterThanOrEqual(13);
    expect(s.weight).toBeGreaterThanOrEqual(600);
    expect(s.transform).toBe("none");
    expect(s.family).not.toMatch(/mono/i);
    expect(s.border).toBe("1px");
    expect(s.start).toBe("1px");
    expect(s.borderColor, "border in the state colour").toBe(s.color);
    expect(s.glyph).toBe({ ok: '"✓"', attention: '"!"', unknown: '"?"', blocked: '"×"' }[state]);
    expect(await contrastIn(p, `#s-${state}`, "color", "backgroundColor")).toBeGreaterThanOrEqual(4.5);
  }
  const compact = await p.locator("#compact").evaluate((el) => getComputedStyle(el).fontFamily);
  expect(compact, "the default lozenge is unchanged").toMatch(/mono/i);
  await axe(p);
  await p.emulateMedia({ forcedColors: "active" });
  const forced = await p.locator("#s-blocked").evaluate((el) => getComputedStyle(el).borderTopStyle);
  expect(forced).toBe("solid");
});

// --- forma#200: breakpoints ------------------------------------------------

test("components switch layout exactly at the tablet breakpoint (48rem)", async ({ page: p }) => {
  const body = `<div class="forma-rail" id="rail"><nav>Navigation</nav><div>Content</div></div>`;
  await p.setContent(page(body));
  const columns = () => p.locator("#rail").evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
  await p.setViewportSize({ width: 767, height: 600 });
  expect(await columns(), "phone range stacks").toBe(1);
  await p.setViewportSize({ width: 768, height: 600 });
  expect(await columns(), "tablet range starts at 48rem").toBe(2);
});

// --- forma#199: density ------------------------------------------------------

const LEDGER = `<table class="forma-dense-ledger"><caption>Ledger</caption><thead><tr><th scope="col">Date</th><th scope="col">Amount</th><th scope="col">Action</th></tr></thead>
<tbody><tr><td>1 Oct</td><td>120.00</td><td><button type="button">Open</button></td></tr><tr><td>2 Oct</td><td>80.00</td><td><button type="button">Open</button></td></tr></tbody></table>`;

for (const [density, row, target] of [["comfortable", 44, 44], ["compact", 36, 24]]) {
  test(`${density} density: data rows >= ${row}px and in-row targets >= ${target}px`, async ({ page: p }, testInfo) => {
    await p.setViewportSize({ width: 1280, height: 900 });
    const grid = fs.readFileSync(path.join(root, "patterns", "data-grid.html"), "utf8");
    await p.setContent(page(`${LEDGER}${grid}${pattern("work-queue")}${pattern("task-list")}`, { attrs: `data-forma-density="${density}"` }));
    const rows = await p.evaluate(() => [...document.querySelectorAll(".forma-dense-ledger tbody tr, .forma-data-grid tbody tr, .forma-work-queue__item, .forma-task-list__item")]
      .map((el) => el.getBoundingClientRect().height));
    expect(rows.length).toBeGreaterThan(5);
    for (const height of rows) expect(height).toBeGreaterThanOrEqual(row - 0.5);
    const targets = await p.evaluate(() => [...document.querySelectorAll(".forma-dense-ledger td button, .forma-data-grid td button, .forma-work-queue__item button")]
      .map((el) => el.getBoundingClientRect().height));
    for (const height of targets) expect(height).toBeGreaterThanOrEqual(target - 0.5);
    await axe(p);
    await testInfo.attach(`density-${density}.png`, { body: await p.screenshot({ fullPage: true }), contentType: "image/png" });
  });
}

test("compact density makes data rows shorter than comfortable", async ({ page: p }) => {
  const height = async (density) => {
    await p.setContent(page(LEDGER, { attrs: `data-forma-density="${density}"` }));
    return p.locator(".forma-dense-ledger tbody tr").first().evaluate((el) => el.getBoundingClientRect().height);
  };
  expect(await height("compact")).toBeLessThan(await height("comfortable"));
});

// --- forma#203: task list ----------------------------------------------------

test("task list: one action per item, named, described by its title, and placed by container width", async ({ page: p }) => {
  await p.setViewportSize({ width: 1280, height: 900 });
  await p.setContent(page(pattern("task-list")));
  const items = p.locator(".forma-task-list__item");
  const count = await items.count();
  for (let i = 0; i < count; i += 1) {
    const actions = items.nth(i).locator(".forma-task-list__action :is(a, button)");
    await expect(actions).toHaveCount(1);
    const describedBy = await actions.first().getAttribute("aria-describedby");
    await expect(items.nth(i).locator(`#${describedBy}`)).toHaveClass(/forma-task-list__title/);
    await expect(items.nth(i).locator(".forma-status-lozenge")).not.toHaveText("");
  }
  await expect(p.getByRole("list")).toHaveCount(1);
  const wide = await items.first().evaluate((el) => ({ action: el.querySelector(".forma-task-list__action").getBoundingClientRect(), title: el.querySelector(".forma-task-list__title").getBoundingClientRect() }));
  expect(wide.action.left, "wide: action at the end of the row").toBeGreaterThan(wide.title.right - 1);
  await p.setViewportSize({ width: 320, height: 900 });
  const narrow = await items.first().evaluate((el) => ({ action: el.querySelector(".forma-task-list__action").getBoundingClientRect(), reason: el.querySelector(".forma-task-list__reason").getBoundingClientRect() }));
  expect(narrow.action.top, "narrow: action under the reason").toBeGreaterThanOrEqual(narrow.reason.bottom - 1);
  await p.keyboard.press("Tab");
  await expect(items.first().locator(".forma-task-list__action a")).toBeFocused();
});

test("task list examples never mix in information-only items or dismiss controls", async () => {
  const component = await entry("task-list");
  for (const html of [pattern("task-list"), ...component.examples.map((example) => example.html)]) {
    expect(html).not.toMatch(/dismiss|snooze/i);
    for (const item of html.split("forma-task-list__item\"").slice(1)) {
      expect((item.split("</li>")[0].match(/<(?:a|button)\b/g) ?? []).length, "exactly one action per item").toBe(1);
    }
  }
});

// --- forma#206: period context ------------------------------------------------

test("period context: state in words, timestamps in <time>, selectable, compact on phones", async ({ page: p }) => {
  await p.setContent(page(pattern("period-context")));
  await expect(p.getByRole("region", { name: "Reporting period" })).toBeVisible();
  const times = await p.locator(".forma-period-context time").evaluateAll((els) => els.map((el) => el.getAttribute("datetime")));
  expect(times.length).toBeGreaterThanOrEqual(3);
  for (const value of times) expect(Number.isNaN(Date.parse(value))).toBe(false);
  await expect(p.locator(".forma-period-context")).toContainText("Closing");
  expect(await p.locator(".forma-period-context").evaluate((el) => getComputedStyle(el).userSelect)).not.toBe("none");
  await p.setViewportSize({ width: 320, height: 600 });
  await noOverflow(p);
  const compactHeight = await p.locator(".forma-period-context").evaluate((el) => el.getBoundingClientRect().height);
  expect(compactHeight, "compact phone form stays short").toBeLessThan(260);
  const selected = await p.evaluate(() => { const range = document.createRange(); range.selectNodeContents(document.querySelector(".forma-period-context")); const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range); return selection.toString(); });
  expect(selected).toContain("September 2026");
  expect(selected).toContain("Known at");
});

// --- forma#205: approval quorum ----------------------------------------------

test("approval quorum: rule in words, polite status, no approve control on the viewer's own proposal", async ({ page: p }) => {
  const component = await entry("approval-quorum");
  const own = component.examples.find((example) => example.id === "own-proposal");
  await p.setContent(page(own.html));
  await expect(p.getByRole("status")).toContainText("Waiting for approval");
  await expect(p.locator(".forma-approval-quorum__rule")).toContainText("Independence rule");
  await expect(p.getByRole("button")).toHaveCount(0);
  await expect(p.locator(".forma-approval-quorum__entry")).toHaveCount(3);
  const eligible = component.examples.find((example) => example.id === "eligible-approver");
  await p.setContent(page(eligible.html));
  await p.keyboard.press("Tab");
  await expect(p.getByRole("button", { name: "Approve release" })).toBeFocused();
  // The status region announces a recorded approval politely when its text changes.
  const live = await p.getByRole("status").evaluate((el) => el.getAttribute("role"));
  expect(live).toBe("status");
});

// --- forma#207: batch outcome ------------------------------------------------

test("batch outcome: unknown is its own group with Check status and never Retry", async ({ page: p }) => {
  const component = await entry("batch-outcome");
  for (const html of [pattern("batch-outcome"), ...component.examples.map((example) => example.html)]) {
    await p.setContent(page(html));
    await expect(p.getByRole("status")).toHaveCount(1);
    await expect(p.getByRole("button", { name: /retry/i })).toHaveCount(0);
    const unknown = p.locator('.forma-batch-outcome__group[data-outcome="unknown"]');
    if (await unknown.count()) {
      await expect(unknown.getByRole("button", { name: "Check status" })).toHaveCount(1);
      await expect(unknown.locator(".forma-status-lozenge")).toHaveAttribute("data-state", "unknown");
      const edge = await unknown.evaluate((el) => getComputedStyle(el).borderInlineStartStyle);
      expect(edge, "unknown differs from other groups without colour").toBe("dashed");
    }
    for (const group of await p.locator(".forma-batch-outcome__group").all()) {
      await expect(group.locator(".forma-batch-outcome__count")).not.toHaveText("");
      expect(await group.locator(".forma-batch-outcome__items a, a").count()).toBeGreaterThan(0);
    }
  }
});

// --- forma#201: raised, sunken and chrome surfaces per theme and brand ------

const brandCss = ["example-harbor", "example-orchard"].map((id) => fs.readFileSync(path.join(root, "dist", "brands", `${id}.css`), "utf8")).join("\n");
const SURFACES = `<header class="forma-surface" id="chrome" data-forma-surface="chrome"><p><strong>Accounts</strong> · <a href="#raised">Overview</a></p></header>
<section class="forma-surface" id="raised" data-forma-surface="raised" aria-labelledby="raised-title"><h2 id="raised-title">Balance</h2><p id="raised-secondary">Updated this morning.</p>
  <div class="forma-surface" id="sunken" data-forma-surface="sunken"><p id="sunken-text">Pending transfers</p></div></section>
<section class="forma-surface" id="floating" data-forma-surface="raised" data-forma-elevation="2"><p>Floating panel</p></section>`;

for (const [label, attrs, theme] of [
  ["light theme", "", "light"], ["dark theme", "", "dark"], ["dark-technical theme", "", "dark-technical"], ["paper-ink theme", "", "paper-ink"],
  ["derived brand roles (example-harbor, dark)", 'data-forma-brand="example-harbor"', "dark"],
  ["declared brand roles (example-orchard, light)", 'data-forma-brand="example-orchard"', "light"]
]) {
  test(`surface roles keep text contrast and elevation: ${label}`, async ({ page: p }) => {
    await p.setContent(page(`<style>${brandCss}</style>${SURFACES}`, { theme, attrs }).replace(`<main ${attrs}>`, `<main ${attrs} data-forma-theme="${theme}">`));
    const token = (name) => p.locator("main").evaluate((el, n) => getComputedStyle(el).getPropertyValue(n).trim(), name);
    const bg = (id) => p.locator(`#${id}`).evaluate((el) => getComputedStyle(el).backgroundColor);
    const hexToRgb = (hex) => `rgb(${[1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
    expect(await bg("raised")).toBe(hexToRgb(await token("--forma-color-surface-raised")));
    expect(await bg("sunken")).toBe(hexToRgb(await token("--forma-color-surface-sunken")));
    expect(await bg("chrome")).toBe(hexToRgb(await token("--forma-color-surface-chrome")));
    for (const selector of ["#raised-title", "#raised-secondary", "#sunken-text", "#chrome p", "#chrome a"]) {
      const ratio = await p.evaluate((sel) => {
        const parse = (v) => v.match(/[\d.]+/g).slice(0, 3).map(Number);
        const lum = (rgb) => rgb.map((c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
        const el = document.querySelector(sel);
        let bgEl = el;
        while (bgEl && getComputedStyle(bgEl).backgroundColor === "rgba(0, 0, 0, 0)") bgEl = bgEl.parentElement;
        const [a, b] = [lum(parse(getComputedStyle(el).color)), lum(parse(getComputedStyle(bgEl).backgroundColor))].sort((x, y) => y - x);
        return (a + 0.05) / (b + 0.05);
      }, selector);
      expect(ratio, `${selector} text contrast`).toBeGreaterThanOrEqual(4.5);
    }
    const shadows = await p.evaluate(() => ["#raised", "#floating"].map((sel) => getComputedStyle(document.querySelector(sel)).boxShadow));
    expect(shadows[0]).toBe(await token("--forma-elevation-1").then((value) => p.evaluate((v) => { const d = document.createElement("div"); d.style.boxShadow = v; document.body.append(d); const out = getComputedStyle(d).boxShadow; d.remove(); return out; }, value)));
    expect(shadows[1]).not.toBe(shadows[0]);
    await axe(p);
  });
}

test("surface roles resolve to system colours and drop shadows in forced colours", async ({ page: p }) => {
  await p.emulateMedia({ forcedColors: "active" });
  await p.setContent(page(SURFACES));
  const values = await p.evaluate(() => ["#raised", "#chrome"].map((sel) => {
    const s = getComputedStyle(document.querySelector(sel));
    return { shadow: s.boxShadow, border: s.borderTopStyle };
  }));
  for (const value of values) {
    expect(value.shadow).toBe("none");
    expect(value.border).not.toBe("none");
  }
});
