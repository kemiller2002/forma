import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const forma = "dist/marketing/forma-marketing.css";

function check(css) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "forma-policy-"));
  const file = path.join(dir, "site.css");
  fs.writeFileSync(file, css);
  const result = spawnSync("dotnet", ["run", "--project", "tools/SiteCssPolicy/SiteCssPolicy.fsproj", "--", "--forma", forma, file], { encoding: "utf8" });
  return { status: result.status, output: result.stdout + result.stderr };
}

test("site-specific content styling is allowed", () => {
  const result = check(`.dk-chart { display: grid; }\n.dk-chart svg { max-inline-size: 100%; }\n@media (min-width: 40rem) { .dk-readout > p { margin: 0; } }\n`);
  assert.equal(result.status, 0, result.output);
});

test("restyling a Forma component is a violation", () => {
  const result = check(".forma-card { padding: 3rem; }\n");
  assert.equal(result.status, 1);
  assert.match(result.output, /FORMA-COMPONENT/);
});

test("redefining global typography, reset, or navigation is a violation", () => {
  for (const css of ["body { font-family: serif; }", "h1, h2 { letter-spacing: 0; }", "nav a { padding: 0; }", "*, *::before { box-sizing: border-box; }", "@media (max-width: 40rem) { p { margin: 0; } }"]) {
    const result = check(css);
    assert.equal(result.status, 1, `${css} should be rejected`);
    assert.match(result.output, /GLOBAL-ELEMENT/);
  }
});

test("overriding Forma tokens is a violation outside the identity allowlist", () => {
  const result = check(":root { --forma-layout-gutter: 2rem; }");
  assert.equal(result.status, 1);
  assert.match(result.output, /TOKEN-OVERRIDE/);
});

test("identity tokens may be retargeted only to other Forma tokens", () => {
  assert.equal(check(":root { --forma-color-accent-primary: var(--forma-color-accent-secondary); }").status, 0);
  assert.equal(check('[data-forma-layout="product"] { --forma-color-accent-primary: var(--forma-color-accent-secondary); --forma-color-accent-hover: var(--forma-color-text-primary); }').status, 0);
  const literal = check(":root { --forma-color-accent-primary: #336699; }");
  assert.equal(literal.status, 1);
  assert.match(literal.output, /IDENTITY-VALUE/);
});

test("copying Forma palette values instead of using tokens is a violation", () => {
  const result = check(".dk-panel { background: #FAFAFA; }");
  assert.equal(result.status, 1);
  assert.match(result.output, /PALETTE-COPY/);
});

test("a documented forma-exception exempts a rule and is counted", () => {
  const result = check("/* forma-exception: GAP-MKT-06 data tables pending in Forma */\n.forma-card table { inline-size: 100%; }\n");
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /1 documented exception/);
});

test("a legacy hand-rolled site stylesheet pattern is detected as duplicate presentation", () => {
  const legacy = `:root { --forma-paper: #fafafa; --forma-text-primary: var(--forma-ink); }
body { margin: 0; background: var(--forma-surface-primary); }
h1, h2 { font-family: var(--display); }
.site-header { position: sticky; }
nav a { padding: .55rem .7rem; }
@media (max-width: 680px) { .grid { grid-template-columns: 1fr; } }`;
  const result = check(legacy);
  assert.equal(result.status, 1);
  for (const code of ["TOKEN-OVERRIDE", "GLOBAL-ELEMENT", "PALETTE-COPY"]) assert.match(result.output, new RegExp(code));
});
