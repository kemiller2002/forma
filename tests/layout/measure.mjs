// LCE-001 measurement adapter. It only observes: it loads each fixture page in
// Chromium, waits for fonts, and records raw geometry and computed styles as
// JSON. Every constraint is evaluated in F# (tests/layout/Forma.Layout.Probe),
// so this file holds no layout logic.
//
//   node tests/layout/measure.mjs <manifest.json> <out.json>
//
// manifest: { "pages": [{ "file": "...", "viewport": { "width": 320, "height": 800 }, "repeat": false, "waitFor": "css selector" }],
//             "serve": "optional directory served over http (a WebAssembly runtime cannot load from file:)" }
import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const [manifestPath, outPath] = process.argv.slice(2);
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

// Runs in the page.
function measure(scriptProbes) {
  const sx = window.scrollX, sy = window.scrollY;
  const box = (r) => ({ x: r.left + sx, y: r.top + sy, w: r.width, h: r.height });
  const sides = (cs, prop) => ["top", "right", "bottom", "left"].map((s) => parseFloat(cs.getPropertyValue(prop.replace("*", s))) || 0);
  const hidden = (el) => el.closest(".ef-visually-hidden, [hidden], script, style, .lc-case__id") !== null;

  const textFragments = (root) => {
    const out = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.data.trim() || hidden(n.parentElement)) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5).map(box);
      if (rects.length) out.push({ owner: n.parentElement.className || n.parentElement.localName, text: n.data.slice(0, 40), rects });
    }
    return out;
  };

  const subject = (el, role) => {
    const cs = getComputedStyle(el);
    const before = role === "node" && el.dataset.efShape === "diamond" ? getComputedStyle(el, "::before") : null;
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const styleVar = (name) => {
      const v = el.style.getPropertyValue(name).trim();
      return v.endsWith("rem") ? `${parseFloat(v) * rootPx}` : v;
    };
    return {
      role,
      name: el.dataset.lcSubject || el.dataset.lcHost || el.id || el.className,
      shape: el.dataset.efShape || null,
      rect: box(el.getBoundingClientRect()),
      radii: ["top-left", "top-right", "bottom-right", "bottom-left"].map((c) => cs.getPropertyValue(`border-${c}-radius`)),
      border: sides(cs, "border-*-width"),
      padding: sides(cs, "padding-*"),
      overflow: [cs.overflowX, cs.overflowY],
      font: { size: parseFloat(cs.fontSize), lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, family: cs.fontFamily, weight: cs.fontWeight },
      direction: cs.direction,
      allocation: styleVar("--ef-diagram-w") ? ["--ef-diagram-x", "--ef-diagram-y", "--ef-diagram-w", "--ef-diagram-h"].map((v) => parseFloat(styleVar(v))) : null,
      diamond: before ? { inset: before.getPropertyValue("top"), border: sides(before, "border-*-width") } : null,
      scroll: [el.scrollWidth, el.clientWidth, el.scrollHeight, el.clientHeight],
      text: role === "label" || role === "node" || role === "component" || role === "probe" ? textFragments(el) : []
    };
  };

  const cases = [...document.querySelectorAll("[data-lc-case]")].map((section) => {
    const subjects = [];
    for (const el of section.querySelectorAll("[data-lc-host]")) subjects.push(subject(el, "host"));
    for (const el of section.querySelectorAll("[data-lc-subject]")) subjects.push(subject(el, el.dataset.lcSubject === "probe" ? "probe" : "component"));
    for (const el of section.querySelectorAll(".ef-diagram-node")) subjects.push(subject(el, "node"));
    for (const el of section.querySelectorAll(".ef-diagram-connector__label")) subjects.push(subject(el, "label"));
    const connectors = [...section.querySelectorAll("path.ef-diagram-connector")].map((p) => {
      const m = p.getScreenCTM();
      const pts = (p.getAttribute("d").match(/-?[\d.]+\s+-?[\d.]+/g) || []).map((pair) => {
        const [x, y] = pair.trim().split(/\s+/).map(Number);
        return { x: m.a * x + m.c * y + m.e + sx, y: m.b * x + m.d * y + m.f + sy };
      });
      return { id: p.id, points: pts };
    });
    const canvas = section.querySelector(".ef-diagram__canvas");
    const zoomed = section.querySelector("[data-lc-diagram]");
    return {
      id: section.dataset.lcCase,
      subjects,
      connectors,
      canvas: canvas ? box(canvas.getBoundingClientRect()) : null,
      zoom: zoomed ? parseFloat(getComputedStyle(zoomed.querySelector(".ef-diagram__canvas")).zoom) || 1 : 1,
      invalid: section.querySelector("[data-lc-invalid]")?.textContent ?? null
    };
  });

  // A script is rendered when its probe string has a different advance from
  // the same count of an unassigned code point (the "missing glyph" box).
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = `16px ${getComputedStyle(document.body).fontFamily}`;
  const fonts = Object.fromEntries(scriptProbes.map(([name, probe]) => {
    const missing = ctx.measureText("\u{10FFFD}".repeat([...probe].length)).width;
    return [name, Math.abs(ctx.measureText(probe).width - missing) > 0.5];
  }));

  return {
    viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
    document: { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth },
    fonts,
    cases
  };
}

// Read-only static server for manifest.serve; only files below that directory are reachable.
const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".wasm": "application/wasm", ".dat": "application/octet-stream" };
const server = manifest.serve
  ? await new Promise((resolve) => {
      const s = createServer((req, res) => {
        const path = normalize(join(manifest.serve, decodeURIComponent(new URL(req.url, "http://x").pathname)));
        if (relative(manifest.serve, path).startsWith("..")) { res.writeHead(403).end(); return; }
        try { res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" }).end(readFileSync(path)); }
        catch { res.writeHead(404).end(); }
      });
      s.listen(0, "127.0.0.1", () => resolve(s));
    })
  : null;
const urlOf = (file) => server ? `http://127.0.0.1:${server.address().port}/${relative(manifest.serve, file)}` : pathToFileURL(file).href;
const settle = async (page, entry) => {
  await page.evaluate(() => document.fonts.ready);
  if (entry.waitFor) await page.waitForFunction((sel) => document.querySelectorAll(sel).length >= document.querySelectorAll("[data-lc-case]").length, entry.waitFor, { timeout: 60000 });
};

const browser = await chromium.launch();
const version = browser.version();
const pages = [];
try {
  for (const entry of manifest.pages) {
    const context = await browser.newContext({ viewport: entry.viewport, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const started = performance.now();
    await page.goto(urlOf(entry.file));
    await settle(page, entry);
    const first = await page.evaluate(measure, manifest.scriptProbes ?? []);
    let repeat = null;
    if (entry.repeat) {
      await page.reload();
      await settle(page, entry);
      repeat = await page.evaluate(measure, manifest.scriptProbes ?? []);
    }
    pages.push({ file: entry.file, ms: Math.round(performance.now() - started), ...first, repeat: repeat ? repeat.cases : null });
    await context.close();
  }
} finally {
  await browser.close();
  server?.close();
}
writeFileSync(outPath, JSON.stringify({ browser: version, pages }));
