// FORMA-A11Y-001: hand-written CSS must not contain literal escape sequences
// outside strings. A literal "\n" between two rules makes the following rule
// invalid, so the browser silently drops it (this dropped
// `.ef-surface :where(h1, ..., p) { color: inherit; }` and caused a contrast
// failure).
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { flattenCss, parseCss } from "../tools/motion-css.mjs";

const sources = ["src/styles", "src/marketing"]
  .flatMap((dir) => fs.readdirSync(dir).filter((name) => name.endsWith(".css")).map((name) => path.join(dir, name)))
  .concat(["site/site.css"]);

// Remove comments and quoted strings, where escapes are legitimate.
const code = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "\"\"");

test("CSS sources contain no literal \\n or \\t escapes outside strings", () => {
  for (const file of sources) {
    const lines = code(fs.readFileSync(file, "utf8")).split("\n");
    lines.forEach((line, index) => {
      assert.doesNotMatch(line, /\\[nt](?![0-9a-f])/i, `${file}:${index + 1} contains a literal escape sequence`);
    });
  }
});

test("native dialog display retention requires top-layer overlay retention", () => {
  const { rules } = flattenCss(parseCss(fs.readFileSync("src/styles/components.css", "utf8")));
  const overlays = rules.filter(rule => [".ef-dialog", ".ef-flyout", ":where(.ef-dialog, .ef-flyout)::backdrop"].includes(rule.selector));
  let retained = 0;
  for (const rule of overlays) {
    for (const declaration of rule.declarations.filter(item => item.property === "transition")) {
      if (/display\s/.test(declaration.value)) {
        retained++;
        assert.match(declaration.value, /overlay\s/);
        assert.ok(rule.context.some(item => item.name === "supports" && item.prelude === "(overlay: auto)"));
      }
    }
  }
  assert.equal(retained, 3, "dialog, flyout and backdrop must all share the retention guard");
});

test("mobile ordinal labels override desktop top alignment", () => {
  const { rules } = flattenCss(parseCss(fs.readFileSync("src/styles/assessment.css", "utf8")));
  const labels = rules.filter(rule => rule.selector === ".ef-ordinal-option__label");
  const desktop = labels.find(rule => !rule.context.some(item => item.name === "media"));
  const mobile = labels.find(rule => rule.context.some(item => item.name === "media" && /44rem/.test(item.prelude)));
  assert.equal(desktop.declarations.find(item => item.property === "align-self").value, "start");
  assert.equal(mobile.declarations.find(item => item.property === "align-self").value, "center");
  assert.ok(rules.indexOf(mobile) > rules.indexOf(desktop));
});
