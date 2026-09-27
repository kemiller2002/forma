import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { BEGIN, END, generateCoordinateRules, LIMITS } from "../tools/character-grid-css.mjs";
import { checkHtml, splitGrids } from "../tools/character-grid-conformance.mjs";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "src", "styles", "components.css"), "utf8");
const gridPatterns = fs.readdirSync(path.join(root, "patterns"))
  .filter(file => file.endsWith(".html"))
  .map(file => ({ file, html: fs.readFileSync(path.join(root, "patterns", file), "utf8") }))
  .filter(({ html }) => /class="ef-character-grid"/.test(html));

const grid = (runs, attributes = 'data-ef-rows="6" data-ef-columns="20"') => `
<div class="ef-character-grid" ${attributes}>
  <div class="ef-character-grid__viewport" role="region" aria-labelledby="t" tabindex="0">
    <div class="ef-character-grid__surface">
      <h2 class="ef-character-grid__text" id="t" data-ef-row="1" data-ef-col="1" data-ef-len="4">TEST</h2>
      ${runs}
    </div>
  </div>
</div>`;

const errorsFor = (runs, attributes) => checkHtml(grid(runs, attributes));
const hasRule = (errors, rule) => errors.some(error => error.includes(rule));

test("generated coordinate rules are in sync with the generator", () => {
  const start = css.indexOf(BEGIN);
  const end = css.indexOf(END) + END.length;
  assert.ok(start > -1 && end > start, "generated block markers present");
  assert.equal(css.slice(start, end), generateCoordinateRules().trimStart());
});

test("coordinate properties are registered and do not inherit", () => {
  for (const name of ["row", "col", "len", "height"]) {
    assert.match(css, new RegExp(`@property --ef-${name} \\{ syntax: "<integer>"; inherits: false;`));
  }
});

test("coordinate rules cover the documented limits, including 132 columns", () => {
  assert.match(css, new RegExp(`data-ef-rows="${LIMITS.rows}"`));
  assert.match(css, new RegExp(`data-ef-columns="${LIMITS.columns}"`));
  assert.match(css, new RegExp(`data-ef-len="${LIMITS.columns}"`));
  assert.doesNotMatch(css, new RegExp(`data-ef-row="${LIMITS.rows + 1}"`));
});

test("every canonical character-grid pattern conforms", () => {
  assert.ok(gridPatterns.length >= 1);
  for (const { file, html } of gridPatterns) {
    assert.deepEqual(checkHtml(html), [], file);
  }
});

test("the base pattern is not a 24x80 terminal: geometry is a parameter", () => {
  const [base] = splitGrids(fs.readFileSync(path.join(root, "patterns", "character-grid.html"), "utf8"));
  assert.deepEqual([base.rows, base.columns], [8, 40]);
});

test("CG-1 geometry and name are required", () => {
  assert.ok(hasRule(errorsFor("", 'data-ef-rows="0" data-ef-columns="20"'), "CG-1"));
  assert.ok(hasRule(errorsFor("", 'data-ef-rows="6" data-ef-columns="200"'), "CG-1"));
  assert.ok(hasRule(errorsFor("", 'data-ef-rows="6" data-ef-columns="20" data-ef-narrow="shrink"'), "CG-1"));
});

test("CG-3 and CG-4 reject out-of-bounds runs and row wrap", () => {
  assert.ok(hasRule(errorsFor('<p class="ef-character-grid__text" data-ef-row="7" data-ef-col="1" data-ef-len="2">AB</p>'), "CG-3"));
  assert.ok(hasRule(errorsFor('<p class="ef-character-grid__text" data-ef-row="2" data-ef-col="18" data-ef-len="5">ABCDE</p>'), "CG-4"));
  assert.ok(hasRule(errorsFor('<div class="ef-character-grid__table" data-ef-row="5" data-ef-col="1" data-ef-len="4" data-ef-height="3"></div>'), "CG-3"));
});

test("CG-5 rejects collisions instead of letting the later run win", () => {
  const errors = errorsFor(`
    <p class="ef-character-grid__text" id="a" data-ef-row="2" data-ef-col="1" data-ef-len="6">ABCDEF</p>
    <p class="ef-character-grid__text" id="b" data-ef-row="2" data-ef-col="4" data-ef-len="2">XY</p>`);
  assert.ok(errors.some(error => error.includes("CG-5 b collides with a")));
});

test("CG-6 rejects source order that differs from row-major order", () => {
  const errors = errorsFor(`
    <p class="ef-character-grid__text" id="late" data-ef-row="3" data-ef-col="1" data-ef-len="1">B</p>
    <p class="ef-character-grid__text" id="early" data-ef-row="2" data-ef-col="1" data-ef-len="1">A</p>`);
  assert.ok(hasRule(errors, "CG-6"));
});

test("CG-7 treats protected overflow as an authoring error", () => {
  assert.ok(hasRule(errorsFor('<p class="ef-character-grid__value" data-ef-row="2" data-ef-col="1" data-ef-len="3">ABCD</p>'), "CG-7"));
});

test("CG-8 requires native fields with capacity and a preceding label", () => {
  assert.ok(hasRule(errorsFor(`
    <label class="ef-character-grid__label" for="f" data-ef-row="2" data-ef-col="1" data-ef-len="4">Name</label>
    <input class="ef-character-grid__field" id="f" type="text" maxlength="9" data-ef-row="2" data-ef-col="6" data-ef-len="8">`), "CG-8"));
  assert.ok(hasRule(errorsFor('<input class="ef-character-grid__field" id="g" type="text" maxlength="8" data-ef-row="2" data-ef-col="6" data-ef-len="8">'), "CG-8"));
  assert.ok(hasRule(errorsFor(`
    <label class="ef-character-grid__label" for="h" data-ef-row="2" data-ef-col="1" data-ef-len="4">Name</label>
    <input class="ef-character-grid__field" id="h" type="text" maxlength="8" aria-invalid="true" data-ef-row="2" data-ef-col="6" data-ef-len="8">`), "CG-8"));
});

test("CG-9 to CG-11 keep protected runs non-editable and markup CSP-safe", () => {
  assert.ok(hasRule(errorsFor('<input class="ef-character-grid__value" readonly value="X" data-ef-row="2" data-ef-col="1" data-ef-len="1">'), "CG-9"));
  assert.ok(hasRule(errorsFor('<p class="ef-character-grid__text" style="color:red" data-ef-row="2" data-ef-col="1" data-ef-len="1">A</p>'), "CG-10"));
  assert.ok(hasRule(errorsFor('<p class="ef-character-grid__text" tabindex="2" data-ef-row="2" data-ef-col="1" data-ef-len="1">A</p>'), "CG-11"));
});

test("CG-12 table columns must fit their run", () => {
  const errors = errorsFor(`
    <div class="ef-character-grid__table" data-ef-row="2" data-ef-col="1" data-ef-len="10" data-ef-height="3">
      <table data-ef-gutter="2"><thead><tr><th scope="col" data-ef-len="5">Date</th><th scope="col" data-ef-len="5">Amt</th></tr></thead></table>
    </div>`);
  assert.ok(hasRule(errors, "CG-12"));
});

test("CG-8 rejects a label that follows its field", () => {
  const errors = errorsFor(`
    <input class="ef-character-grid__field" id="late" type="text" maxlength="8" data-ef-row="2" data-ef-col="1" data-ef-len="8">
    <label class="ef-character-grid__label" for="late" data-ef-row="2" data-ef-col="10" data-ef-len="4">Name</label>`);
  assert.ok(errors.some(error => error.includes("label must precede")));
});

test("CG-13 short fields need trailing blank cells for the touch minimum", () => {
  const label = '<label class="ef-character-grid__label" for="s" data-ef-row="2" data-ef-col="1" data-ef-len="3">Qty</label>';
  const field = '<input class="ef-character-grid__field" id="s" type="text" maxlength="2" data-ef-row="2" data-ef-col="5" data-ef-len="2">';
  assert.deepEqual(errorsFor(label + field), []);
  const crowded = errorsFor(label + field + '<p class="ef-character-grid__text" data-ef-row="2" data-ef-col="8" data-ef-len="1">X</p>');
  assert.ok(hasRule(crowded, "CG-13"));
});

test("CG-14 keys are explicit native buttons with an action name and a visible key", () => {
  const key = (attributes, content = "<kbd>PF3</kbd>=Exit") =>
    `<button class="ef-character-grid__key" ${attributes} data-ef-row="3" data-ef-col="1" data-ef-len="8">${content}</button>`;
  assert.deepEqual(errorsFor(key('type="submit" data-ef-action="pf3"')), []);
  assert.ok(hasRule(errorsFor(key('type="reset" data-ef-action="reset"')), "CG-14"));
  assert.ok(hasRule(errorsFor(key('data-ef-action="pf3"')), "CG-14"));
  assert.ok(hasRule(errorsFor(key('type="submit"')), "CG-14"));
  assert.ok(hasRule(errorsFor(key('type="submit" data-ef-action="pf3"', "PF3=Exit")), "CG-14"));
  assert.ok(hasRule(errorsFor(`<span class="ef-character-grid__key" data-ef-action="pf3" data-ef-row="3" data-ef-col="1" data-ef-len="8"><kbd>PF3</kbd>=Exit</span>`), "CG-14"));
});

test("CG-14 Enter must be the first submit key so implicit submission uses it", () => {
  const errors = errorsFor(`
    <button class="ef-character-grid__key" type="submit" data-ef-action="pf3" data-ef-row="3" data-ef-col="1" data-ef-len="8"><kbd>PF3</kbd>=Exit</button>
    <button class="ef-character-grid__key" type="submit" data-ef-action="enter" data-ef-row="3" data-ef-col="10" data-ef-len="8"><kbd>Enter</kbd>=Go</button>`);
  assert.ok(errors.some(error => error.includes("first submit key")));
});

test("CG-15 messages need a live role, a known severity, and a visible severity word", () => {
  const message = (attributes, content) =>
    `<p class="ef-character-grid__message" ${attributes} data-ef-row="5" data-ef-col="1" data-ef-len="20">${content}</p>`;
  const word = '<span class="ef-character-grid__severity"><span>ERROR</span></span> Failed';
  assert.deepEqual(errorsFor(message('role="alert" data-ef-severity="error"', word)), []);
  assert.ok(hasRule(errorsFor(message('data-ef-severity="error"', word)), "CG-15"));
  assert.ok(hasRule(errorsFor(message('role="alert" data-ef-severity="red"', word)), "CG-15"));
  assert.ok(hasRule(errorsFor(message('role="alert" data-ef-severity="error"', "Failed")), "CG-15"));
  assert.ok(hasRule(errorsFor('<p class="ef-character-grid__status" data-ef-row="6" data-ef-col="1" data-ef-len="5">READY</p>'), "CG-15"));
});
