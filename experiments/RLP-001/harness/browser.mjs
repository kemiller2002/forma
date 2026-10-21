import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

// Browser plumbing for the RLP-001 validator: a static server rooted at one
// directory, a deterministic settle, geometry capture from real browser
// layout, and the DOM-level dynamic operations every arm is subjected to.

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json"
};

export const serve = root => new Promise(resolveServer => {
  const base = path.resolve(root);
  const server = http.createServer((request, response) => {
    const relative = decodeURIComponent(new URL(request.url, "http://localhost").pathname).replace(/^\/+/, "");
    const file = path.resolve(base, relative || "index.html");
    if (!file.startsWith(base)) return response.writeHead(403).end();
    fs.readFile(file, (error, data) => {
      if (error) return response.writeHead(404).end();
      response.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream", "cache-control": "no-store" });
      response.end(data);
    });
  });
  server.listen(0, "127.0.0.1", () => resolveServer({ url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(r => server.close(r)) }));
});

export const launch = () => chromium.launch({ executablePath: process.env.RLP_CHROMIUM ?? "/opt/pw-browsers/chromium" });

// Wait until fonts are ready and the layout has stopped changing for two
// consecutive frames (for the relational arms, until the engine revision
// is also stable). Bounded at 3 s.
export const settle = page => page.evaluate(async () => {
  await document.fonts.ready;
  const frame = () => new Promise(r => requestAnimationFrame(() => r()));
  const signature = () => {
    const rects = [...document.querySelectorAll("[data-rlp]")].map(el => {
      const r = el.getBoundingClientRect();
      return `${r.x.toFixed(2)},${r.y.toFixed(2)},${r.width.toFixed(2)},${r.height.toFixed(2)}`;
    });
    return `${window.__rlp?.revision ?? 0}|${rects.join(";")}`;
  };
  const started = performance.now();
  let previous = "";
  let stable = 0;
  while (performance.now() - started < 3000) {
    await frame();
    const current = signature();
    stable = current === previous ? stable + 1 : 0;
    previous = current;
    if (stable >= 2) return { settled: true, ms: performance.now() - started };
  }
  return { settled: false, ms: performance.now() - started };
});

// Geometry and state of every tagged element, measured from the browser.
export const capture = page => page.evaluate(() => {
  const INTERACTIVE = "button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=tab]";
  const all = [...document.querySelectorAll("[data-rlp]")];
  const index = new Map(all.map((el, i) => [el, i]));
  const boxOf = r => ({ x: r.x, y: r.y + window.scrollY, w: r.width, h: r.height, right: r.right, bottom: r.bottom + window.scrollY });
  const clippers = el => {
    const found = [];
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.overflowX !== "visible" || s.overflowY !== "visible") {
        found.push({ scroll: /auto|scroll/.test(s.overflowX + s.overflowY), box: boxOf(a.getBoundingClientRect()), rlp: a.getAttribute("data-rlp") });
      }
    }
    return found;
  };
  const elements = all.map(el => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const visible = s.display !== "none" && s.visibility !== "hidden" && !el.closest("[hidden]") && (r.width > 0 || r.height > 0);
    const ancestors = [];
    for (let a = el.parentElement; a; a = a.parentElement) if (a.hasAttribute("data-rlp")) ancestors.push(a.getAttribute("data-rlp"));
    return {
      id: el.getAttribute("data-rlp"),
      order: index.get(el),
      tag: el.tagName.toLowerCase(),
      visible,
      box: boxOf(r),
      interactive: el.matches(INTERACTIVE),
      display: s.display,
      overflowX: s.overflowX,
      overflowY: s.overflowY,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      leafText: el.children.length === 0 && el.textContent.trim().length > 0,
      background: s.backgroundColor,
      borderWidth: Math.max(...["Top", "Right", "Bottom", "Left"].map(side => Number.parseFloat(s[`border${side}Width`]) || 0)),
      ancestors,
      clippers: clippers(el)
    };
  });
  return {
    viewport: { width: window.innerWidth, height: window.innerHeight },
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    remPx: Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
    engine: window.__rlp ? { arm: window.__rlp.arm, status: window.__rlp.status, revision: window.__rlp.revision, diagnostics: window.__rlp.diagnostics, last: window.__rlp.roots.map(r => r.last && { stats: r.last.stats, totalMs: r.last.totalMs, energy: r.last.energy }) } : null,
    elements
  };
});

// Dynamic operations, applied through the DOM so they are identical for
// every arm.
export const applyOperation = (page, step) => page.evaluate(step => {
  const find = id => document.querySelector(`[data-rlp="${CSS.escape(id)}"]`);
  const setText = (el, text) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.data.trim()) nodes.push(n);
    if (nodes.length === 0) { el.append(document.createTextNode(text)); return; }
    nodes.forEach((n, i) => { n.data = i === 0 ? text : ""; });
  };
  const run = s => {
    if (s.op === "reveal" || s.op === "hide") {
      const el = find(s.id);
      if (!el) return { ok: false, reason: `missing ${s.id}` };
      el.hidden = s.op === "hide";
      return { ok: true, target: s.id };
    }
    if (s.op === "text") {
      const el = find(s.id);
      if (!el) return { ok: false, reason: `missing ${s.id}` };
      setText(el, s.text);
      return { ok: true, target: s.id };
    }
    if (s.op === "remove") {
      const el = find(s.id);
      if (!el) return { ok: false, reason: `missing ${s.id}` };
      el.remove();
      return { ok: true, target: s.id };
    }
    if (s.op === "clone") {
      const source = find(s.source);
      if (!source) return { ok: false, reason: `missing ${s.source}` };
      const copy = source.cloneNode(true);
      copy.setAttribute("data-rlp", s.id);
      [copy, ...copy.querySelectorAll("[id]")].forEach(n => n.removeAttribute("id"));
      copy.querySelectorAll("[data-rlp]").forEach(n => {
        const id = n.getAttribute("data-rlp");
        if (id.startsWith(`${s.source}-`)) n.setAttribute("data-rlp", `${s.id}-${id.slice(s.source.length + 1)}`);
      });
      Object.entries(s.text ?? {}).forEach(([id, text]) => {
        const el = copy.getAttribute("data-rlp") === id ? copy : copy.querySelector(`[data-rlp="${CSS.escape(id)}"]`);
        if (el) setText(el, text);
      });
      source.after(copy);
      return { ok: true, target: s.id };
    }
    return { ok: false, reason: `unknown op ${s.op}` };
  };
  const first = run(step);
  const second = step.then ? run(step.then) : null;
  return { ...first, then: second };
}, step);

export const setFontScale = (page, scale) => page.evaluate(scale => { document.documentElement.style.fontSize = `${scale * 100}%`; }, scale);

export const setTexts = (page, texts) => Promise.all(Object.entries(texts).map(([id, text]) => applyOperation(page, { op: "text", id, text })));
