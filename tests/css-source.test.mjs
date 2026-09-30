// FORMA-A11Y-001: hand-written CSS must not contain literal escape sequences
// outside strings. A literal "\n" between two rules makes the following rule
// invalid, so the browser silently drops it (this dropped
// `.ef-surface :where(h1, ..., p) { color: inherit; }` and caused a contrast
// failure).
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

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
