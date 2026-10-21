import test from "node:test";
import assert from "node:assert/strict";
import { resolve } from "../core/resolve.mjs";
import { relax, exact } from "../core/relax.mjs";

// Deterministic fake text metrics: 8 px per character, 24 px lines.
const text = (key, content, attrs = {}) => {
  const words = content.split(/\s+/);
  const chars = content.length;
  return {
    key,
    kind: "leaf",
    attrs,
    measure: {
      minContent: Math.max(...words.map(w => w.length)) * 8,
      maxContent: chars * 8,
      heightAt: w => Math.ceil((chars * 8) / Math.max(8, w)) * 24
    }
  };
};
const control = (key, attrs = {}) => ({
  key, kind: "leaf", attrs, interactive: true, control: true,
  measure: { minContent: 96, maxContent: 240, heightAt: () => 44 }
});
const button = (key, label, attrs = {}) => ({
  key, kind: "leaf", attrs, interactive: true,
  measure: { minContent: label.length * 8 + 32, maxContent: label.length * 8 + 32, heightAt: () => 44 }
});
const node = (key, kind, attrs, children) => ({ key, kind, attrs, children, border: kind === "container" ? { top: 1, right: 1, bottom: 1, left: 1 } : undefined });

const field = (name, label) => node(`${name}-field`, "group", { bond: "tight", min: "14rem" }, [
  text(`${name}-label`, label, { alignEdge: undefined }),
  control(`${name}-input`, { alignEdge: "control" })
]);

const form = (labelA = "First name", labelB = "Last name") => node("form", "container", { clearance: "surface", bond: "loose" }, [
  text("title", "Contact details"),
  node("names", "group", { flow: "wrap", bond: "related" }, [field("first", labelA), field("last", labelB)]),
  node("actions", "group", { flow: "row", bond: "related" }, [button("cancel", "Cancel", { anchor: "end" }), button("save", "Save")])
]);

const box = (result, key) => result.geometry.find(g => g.key === key);

for (const arm of ["rules", "physics"]) {
  test(`${arm}: identical inputs give identical geometry`, () => {
    const a = resolve(arm, form(), 1024);
    const b = resolve(arm, form(), 1024);
    assert.deepEqual(a.geometry, b.geometry);
    assert.equal(a.energy, b.energy);
  });

  test(`${arm}: form is valid at every benchmark viewport`, () => {
    for (const width of [320, 375, 768, 1024, 1440]) {
      const r = resolve(arm, form(), width);
      assert.equal(r.status, "valid", `${width}: ${JSON.stringify(r.diagnostics)}`);
    }
  });

  test(`${arm}: fields share a line when wide and stack when narrow`, () => {
    const wide = resolve(arm, form(), 1024);
    assert.equal(box(wide, "first-field").y, box(wide, "last-field").y);
    const narrow = resolve(arm, form(), 320);
    assert.ok(box(narrow, "last-field").y > box(narrow, "first-field").y);
  });

  test(`${arm}: shared control edge holds across unequal labels`, () => {
    const r = resolve(arm, form("A label long enough to wrap onto a second line in its column", "Short"), 768);
    const top = key => box(r, `${key}-field`).y + box(r, `${key}-input`).y;
    assert.equal(top("first"), top("last"));
  });

  test(`${arm}: unsatisfiable constraints are reported, never silently accepted`, () => {
    const r = resolve(arm, node("tiny", "container", {}, [control("x")]), 60);
    assert.equal(r.status, "invalid");
    assert.ok(r.diagnostics.some(d => d.code === "unsatisfiable"));
  });

  test(`${arm}: invalid dimensions are reported`, () => {
    const r = resolve(arm, node("root", "group", {}, [text("t", "Hello", { min: "20rem", max: "10rem" }), text("u", "x", { min: "12vw" })]), 600);
    assert.equal(r.diagnostics.filter(d => d.code === "invalid-dimension").length, 2);
  });

  test(`${arm}: non-finite measurement is numeric instability`, () => {
    const broken = { key: "b", kind: "leaf", measure: { minContent: 10, maxContent: 10, heightAt: () => NaN } };
    const r = resolve(arm, node("root", "group", {}, [broken]), 300);
    assert.ok(r.diagnostics.some(d => d.code === "numeric-instability"));
  });

  test(`${arm}: invalid root width is reported`, () => {
    assert.equal(resolve(arm, form(), 0).status, "invalid");
  });
}

test("physics: excessive computation aborts to rules with a diagnostic", () => {
  const r = resolve("physics", form(), 1024, { limits: { maxEvaluations: 1 } });
  assert.ok(r.diagnostics.some(d => d.code === "excessive-computation"));
  assert.ok(r.stats.aborted);
});

test("physics: non-convergence is reported", () => {
  const r = resolve("physics", form(), 320, { limits: { maxIterations: 1 } });
  assert.ok(r.diagnostics.some(d => d.code === "non-convergence"), JSON.stringify(r.diagnostics));
});

test("relax: agrees with the exact KKT solution", () => {
  const seeded = seed => () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const random = seeded(42);
  for (let n = 0; n < 200; n += 1) {
    const vars = Array.from({ length: 2 + Math.floor(random() * 6) }, () => {
      const min = random() * 50;
      return { t: min + random() * 300, lo: [0.05, 1, 4][Math.floor(random() * 3)], hi: [0, 1, 4][Math.floor(random() * 3)], m: 1, min, max: 1000 };
    });
    vars.push({ t: 0, lo: 0, hi: 0.05, m: 1, min: 0, max: 1000 });
    const total = vars.reduce((s, v) => s + v.min, 0) + random() * 800;
    const solved = relax(vars, total, 16);
    assert.equal(solved.status, "converged");
    const reference = exact(vars, total);
    const energy = xs => vars.reduce((e, v, i) => e + (xs[i] < v.t ? v.lo : v.hi) * (xs[i] - v.t) ** 2, 0);
    assert.ok(energy(solved.xs) <= energy(reference) * (1 + 1e-3) + 1e-3, `case ${n}`);
  }
});

test("rules and physics agree when nothing is under pressure", () => {
  const c = resolve("rules", form(), 1440);
  const d = resolve("physics", form(), 1440);
  // Agreement within the solver's documented tolerance (0.05 CSS px).
  d.geometry.forEach((g, i) => assert.ok(Math.abs(g.w - c.geometry[i].w) <= 0.05 && Math.abs(g.x - c.geometry[i].x) <= 0.05, g.key));
});
