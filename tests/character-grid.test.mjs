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

test("CG-16 reveal is opt-in, bounded, and stages protected text only", () => {
  const staged = '<p class="ef-character-grid__text" data-ef-reveal-run data-ef-row="2" data-ef-col="1" data-ef-len="5">HELLO</p>';
  const sequential = 'data-ef-rows="6" data-ef-columns="20" data-ef-reveal="sequential" data-ef-reveal-rows="2"';
  assert.deepEqual(errorsFor(staged, sequential), []);
  assert.ok(hasRule(errorsFor(staged), "CG-16"), "staged runs need an opted-in grid");
  assert.ok(hasRule(errorsFor(staged, 'data-ef-rows="6" data-ef-columns="20" data-ef-reveal="typewriter"'), "CG-16"));
  assert.ok(hasRule(errorsFor(staged, 'data-ef-rows="6" data-ef-columns="20" data-ef-reveal="sequential" data-ef-reveal-rows="9"'), "CG-16"));
  for (const run of [
    '<span class="ef-character-grid__value" data-ef-reveal-run data-ef-row="2" data-ef-col="1" data-ef-len="5">1,204</span>',
    '<p class="ef-character-grid__message" role="status" data-ef-severity="information" data-ef-reveal-run data-ef-row="2" data-ef-col="1" data-ef-len="20"><span class="ef-character-grid__severity"><span>INFO</span></span> Ready</p>'
  ]) {
    assert.ok(hasRule(errorsFor(run, sequential), "CG-16"), run);
  }
});

// Moves the reserved bottom rows (21-24) of a 24x80 screen to rows 29-32.
export const to32x80 = html => html
  .replace('data-ef-rows="24"', 'data-ef-rows="32"')
  .replace(/data-ef-row="(\d+)"/g, (match, row) => (Number(row) >= 21 ? `data-ef-row="${Number(row) + 8}"` : match));

test("the 3270 profile conforms at 24x80 and at 32x80", () => {
  const html = fs.readFileSync(path.join(root, "patterns", "character-grid-3270.html"), "utf8");
  const [grid24] = splitGrids(html);
  assert.deepEqual([grid24.rows, grid24.columns], [24, 80]);
  const tall = to32x80(html);
  const [grid32] = splitGrids(tall);
  assert.deepEqual([grid32.rows, grid32.columns], [32, 80]);
  assert.deepEqual(checkHtml(tall), []);
  assert.ok(grid32.runs.some(run => run.row === 32), "status occupies row 32");
});

test("profiles declare presentation only: no geometry, placement, or display changes", () => {
  const rules = [...css.matchAll(/([^{}]*\[data-ef-profile="[^"]+"\][^{}]*)\{([^{}]*)\}/g)];
  assert.ok(rules.length > 0);
  const allowed = /^(--ef-grid-[a-z-]+|color|background|background-color|border-color|box-shadow|caret-color|caret-shape|outline-color|text-decoration-color)$/;
  for (const [, selector, body] of rules) {
    const properties = body.split(";").map(part => part.split(":")[0].trim()).filter(Boolean);
    for (const property of properties) {
      assert.match(property, allowed, `${selector.trim()} declares ${property}`);
    }
  }
});

test("generic CharacterGrid tooling and primitives contain no 3270-specific logic", () => {
  for (const file of ["tools/character-grid-css.mjs", "tools/character-grid-conformance.mjs"]) {
    assert.doesNotMatch(fs.readFileSync(path.join(root, file), "utf8"), /3270/, file);
  }
  const primitiveRules = css.slice(css.indexOf("/* CharacterGrid ----"))
    .split("\n")
    .filter(line => /3270/.test(line) && !/data-ef-profile="ibm-3270"|ibm-3270: first reference profile|3279 base palette/.test(line));
  assert.deepEqual(primitiveRules, []);
});

test("the three-screen reference workflow conforms in every rendered state", async () => {
  const { render, states } = await import("./character-grid-workflow-states.mjs");
  const names = ["default", ...Object.keys(states)];
  assert.ok(names.length >= 5);
  for (const name of names) {
    const html = render(name);
    assert.deepEqual(checkHtml(html), [], name);
    if (name !== "default") assert.notEqual(html, render("default"), `${name} changes the screen`);
  }
  const grids = splitGrids(render("default"));
  assert.equal(grids.length, 3);
  assert.ok(grids.every(grid => grid.rows === 24 && grid.columns === 80));
});

test("the reference workflow uses only public Forma contracts (no product-specific CSS)", () => {
  const html = fs.readFileSync(path.join(root, "patterns", "character-grid-workflow.html"), "utf8");
  const classes = [...html.matchAll(/class="([^"]+)"/g)].flatMap(match => match[1].split(/\s+/));
  const unknown = [...new Set(classes)].filter(name => !/^ef-character-grid(__[a-z]+)?$/.test(name) && name !== "ef-stack");
  assert.deepEqual(unknown, []);
  assert.doesNotMatch(html, /\sstyle=|<style|<script/);
  for (const name of new Set(classes)) {
    if (name.startsWith("ef-")) assert.ok(css.includes(`.${name}`), `${name} is a published class`);
  }
});

test("every GH-44 requirement maps to an existing test", () => {
  const matrix = JSON.parse(fs.readFileSync(path.join(root, "tests", "character-grid-coverage.json"), "utf8"));
  const entries = Object.entries(matrix.requirements);
  assert.ok(entries.length >= 25);
  for (const [requirement, references] of entries) {
    assert.ok(references.length > 0, requirement);
    for (const [file, title] of references) {
      const source = fs.readFileSync(path.join(root, file), "utf8");
      assert.ok(source.includes(title), `${requirement}: "${title}" not found in ${file}`);
    }
  }
});

test("the authoring guide documents every required example and integration boundary", () => {
  const guide = fs.readFileSync(path.join(root, "docs", "CHARACTER-GRID-AUTHORING.md"), "utf8");
  for (const topic of [
    "## 1. The grid", "## 2. Protected text", "## 3. Editable fields", "## 4. Status and messages",
    "## 5. Action keys", "## 6. Deterministic focus order", "## 7. The 3270 profile", "## 8. SequentialReveal",
    "### Physical keys", "### Enter, PF keys, and Clear", "**Reset**", "### Screen transitions", "### Reveal orchestration",
    "IBM 3270", "IBM 5250", "DOS / text mode", "BBS-style", "Modern character grid"
  ]) {
    assert.ok(guide.includes(topic), `authoring guide is missing: ${topic}`);
  }
  assert.match(guide, /application code[^]*not\s+part of Forma/i);
});
