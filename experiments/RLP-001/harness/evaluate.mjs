import { AxeBuilder } from "@axe-core/playwright";
import { applyOperation, capture, serve, setFontScale, setTexts, settle } from "./browser.mjs";
import { checkShift, checkSnapshot, sameGeometry } from "./checks.mjs";
import { DEV_VIEWPORTS, VIEWPORTS } from "../tasks/tasks.mjs";

// Runs every evaluation condition for one page and returns machine-readable
// results. "dev" mode is what attempt agents see through ./validate; "full"
// mode adds the held-out conditions used for scoring.

const HEIGHT = 900;
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const emptyState = () => ({ removed: new Set(), hidden: new Set(), revealed: new Set(), added: [] });

// Track what the page should contain after each dynamic operation.
const advance = (task, state, step) => {
  const next = { removed: new Set(state.removed), hidden: new Set(state.hidden), revealed: new Set(state.revealed), added: [...state.added] };
  const apply = s => {
    if (s.op === "reveal") { next.revealed.add(s.id); next.hidden.delete(s.id); }
    if (s.op === "hide") { next.hidden.add(s.id); next.revealed.delete(s.id); }
    if (s.op === "remove") {
      const all = [...task.elements, ...next.added];
      const doomed = new Set([s.id]);
      all.forEach(() => all.forEach(el => { if (doomed.has(el.parent)) doomed.add(el.id); }));
      doomed.forEach(id => next.removed.add(id));
    }
    if (s.op === "clone") {
      const source = task.elements.find(el => el.id === s.source);
      const descendants = task.elements.filter(el => el.id.startsWith(`${s.source}-`));
      next.added.push({ ...source, id: s.id }, ...descendants.map(el => ({
        ...el,
        id: `${s.id}-${el.id.slice(s.source.length + 1)}`,
        parent: el.parent === s.source ? s.id : el.parent.startsWith(`${s.source}-`) ? `${s.id}-${el.parent.slice(s.source.length + 1)}` : el.parent,
        for: el.for?.startsWith(`${s.source}-`) ? `${s.id}-${el.for.slice(s.source.length + 1)}` : el.for
      })));
    }
  };
  apply(step);
  if (step.then) apply(step.then);
  return next;
};

const stepTarget = step => step.then?.id ?? step.id;

const open = async (browser, url, width) => {
  const context = await browser.newContext({ viewport: { width, height: HEIGHT } });
  const page = await context.newPage();
  page.close = () => context.close();
  const errors = [];
  page.on("pageerror", error => errors.push(String(error.message ?? error)));
  await page.goto(url, { waitUntil: "load" });
  const settled = await settle(page);
  return { page, errors, settled };
};

const label = (failures, context) => failures.map(f => ({ ...context, ...f }));

const runDynamic = async (task, page, width, condition) => {
  const initial = await capture(page);
  const first = label(checkSnapshot(task, initial, emptyState()), { condition, viewport: width, step: "initial" });
  const result = await task.dynamic.reduce(async (accP, step, i) => {
    const acc = await accP;
    const outcome = await applyOperation(page, step);
    const settled = await settle(page);
    const after = await capture(page);
    const state = advance(task, acc.state, step);
    const stepName = `${i + 1}:${step.op}:${stepTarget(step)}`;
    const operationFailure = outcome.ok ? [] : [{ invariant: "dynamic-operation", element: stepTarget(step), expected: "operation applies", observed: outcome.reason }];
    const failures = label([...operationFailure, ...checkSnapshot(task, after, state), ...(outcome.ok ? checkShift(acc.snapshot, after, stepTarget(step)) : [])], { condition, viewport: width, step: stepName });
    return { state, snapshot: after, failures: [...acc.failures, ...failures], settles: [...acc.settles, settled] };
  }, Promise.resolve({ state: emptyState(), snapshot: initial, failures: [], settles: [] }));
  return { initial, failures: [...first, ...result.failures], settles: result.settles };
};

const axe = async (page, width, condition) => {
  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  return results.violations.flatMap(v => v.nodes.map(n => ({
    condition,
    viewport: width,
    step: "initial",
    invariant: "accessibility",
    element: n.target.join(" "),
    expected: `axe ${v.id} passes`,
    observed: `${v.impact}: ${v.help}`,
    rule: v.id,
    impact: v.impact
  })));
};

export const evaluatePage = async ({ browser, dir, file = "index.html", task, mode = "full" }) => {
  const server = await serve(dir);
  const url = `${server.url}/${file}`;
  const viewports = mode === "full" ? VIEWPORTS : DEV_VIEWPORTS;
  const started = Date.now();
  try {
    const dynamicRuns = [];
    for (const width of viewports) {
      const { page, errors, settled } = await open(browser, url, width);
      const run = await runDynamic(task, page, width, "standard");
      await page.close();
      const second = await open(browser, url, width);
      const accessibility = mode === "full" || width === 1024 ? await axe(second.page, width, "standard") : [];
      await second.page.close();
      dynamicRuns.push({ width, errors, settled, run, accessibility, engine: run.initial.engine });
    }
    const heldout = mode !== "full" ? [] : await (async () => {
      const out = [];
      for (const width of [320, 1440]) {
        const { page } = await open(browser, url, width);
        await setTexts(page, task.heldout.text);
        await settle(page);
        const snap = await capture(page);
        out.push(...label(checkSnapshot(task, snap, emptyState()), { condition: "heldout-text", viewport: width, step: "initial" }));
        await page.close();
      }
      for (const width of [375, 768]) {
        const { page } = await open(browser, url, width);
        await setFontScale(page, task.heldout.fontScale);
        await settle(page);
        const snap = await capture(page);
        out.push(...label(checkSnapshot(task, snap, emptyState(), { fontScale: task.heldout.fontScale }), { condition: "font-scale", viewport: width, step: "initial" }));
        await page.close();
      }
      const a = await open(browser, url, 1024);
      const b = await open(browser, url, 1024);
      out.push(...label(sameGeometry(await capture(a.page), await capture(b.page)), { condition: "determinism", viewport: 1024, step: "reload" }));
      await a.page.close();
      await b.page.close();
      return out;
    })();
    const failures = [
      ...dynamicRuns.flatMap(r => [...r.run.failures, ...r.accessibility, ...r.errors.map(message => ({ condition: "standard", viewport: r.width, step: "load", invariant: "script-error", element: "page", expected: "no uncaught errors", observed: message }))]),
      ...heldout
    ];
    return {
      mode,
      file,
      durationMs: Date.now() - started,
      viewports,
      settledEverywhere: dynamicRuns.every(r => r.settled.settled && r.run.settles.every(s => s.settled)),
      engine: dynamicRuns.map(r => ({ viewport: r.width, ...(r.engine ?? {}) })).filter(e => e.arm),
      failures
    };
  } finally {
    await server.close();
  }
};

// Defect identity: one defect per invariant, element/relationship, condition,
// viewport and step.
export const defectKey = f => [f.condition, f.viewport, f.step, f.invariant, f.element].join("|");
