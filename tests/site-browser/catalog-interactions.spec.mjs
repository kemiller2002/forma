// Action-outcome conformance for every catalog example
// (visual-engineering/UI-LAYOUT-INTERACTION@1.0.0 ULI-A01, A02, A03, A05,
// A09, A10). Generated from the declarations in catalog/components/*.mjs via
// the site manifest; nothing is sampled:
//   - every declared action of every live demo runs, in order, and must
//     produce its declared native outcome;
//   - the runtime inventory of each live demo must match its declaration;
//   - static specimens and examples without a declaration must expose no
//     operable action control.
import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { STATUS, expectActionOutcome, inventoryActions } from "./ui-conformance-helpers.mjs";

const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), "site-dist", "site-manifest.json"), "utf8"));
const componentUrl = slug => `/site-dist/components/${slug}/`;

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Declared expectation -> helper outcome. All three are native outcomes.
const outcomeOf = (action, scope) => {
  if ("open" in action.expect) return { kind: "open", target: "controlled", expected: action.expect.open };
  if ("checked" in action.expect) return { kind: "checked", target: { role: action.role, name: action.name, scope }, expected: action.expect.checked };
  return { kind: "url", expected: new RegExp(`${escapeRegExp(action.expect.url)}$`) };
};

const landmark = (scope, within) => (within ? scope.getByRole(within.role, within.name ? { name: within.name, exact: true } : {}) : scope);

// Reset strategy (ULI-A05): clear the fragment before a fragment link so a
// repeated destination is still an observable transition.
const clearFragment = page => page.evaluate(() => history.replaceState(history.state, "", location.pathname + location.search));

// Reset strategy (ULI-A05): an open auto popover (a tooltip) that neither
// contains the next control nor is the one it controls belongs to an earlier,
// independent action. Dismiss it the way a user does, with Escape, so it does
// not cover the next control on a narrow screen. (Activating a tooltip trigger
// again is not a reliable close: with interest invokers, the hovering pointer
// keeps it open.)
const dismissUnrelatedPopovers = async (page, control) => {
  const unrelatedOpen = () => control.evaluate(node => {
    const controlled = [node.getAttribute("popovertarget"), node.getAttribute("commandfor"), node.getAttribute("aria-controls")].filter(Boolean);
    return [...node.ownerDocument.querySelectorAll("[popover]:popover-open")]
      .filter(popover => popover.getAttribute("popover") !== "manual" && !popover.contains(node) && !controlled.includes(popover.id)).length;
  }).catch(() => 0);
  for (let remaining = await unrelatedOpen(); remaining > 0; remaining = await unrelatedOpen()) {
    await page.keyboard.press("Escape");
    await expect.poll(unrelatedOpen).toBeLessThan(remaining);
  }
};

const runDeclaredActions = async (page, scope, actions) => {
  const reports = [];
  for (const action of actions) {
    if ("url" in action.expect) await clearFragment(page);
    const actionScope = landmark(scope, action.within);
    const control = action.role === "disclosure"
      ? actionScope.locator("summary").filter({ hasText: action.name })
      : actionScope.getByRole(action.role, { name: action.name, exact: true });
    if (await control.count() === 1) await dismissUnrelatedPopovers(page, control);
    reports.push(await expectActionOutcome(page, {
      ruleId: "ULI-A02",
      scope: actionScope,
      action: { role: action.role, name: action.name },
      outcome: outcomeOf(action, actionScope)
    }));
  }
  return reports;
};

const key = item => `${item.role}\u0000${item.name}`;
const tally = items => items.reduce((counts, item) => ({ ...counts, [key(item)]: (counts[key(item)] ?? 0) + 1 }), {});

// The runtime inventory must equal the declaration: same role/name pairs,
// each occurring as often as it is declared in distinct landmarks.
const expectInventoryMatches = async (scope, actions, label) => {
  const declared = [...new Map(actions.map(action => [`${key(action)}\u0000${action.within?.role ?? ""}\u0000${action.within?.name ?? ""}`, action])).values()];
  const rendered = await inventoryActions(scope, { includeHidden: true });
  expect(tally(rendered), `${label}: runtime action inventory differs from the interaction declaration`).toEqual(tally(declared));
};

const liveTargets = component => [
  ...(component.basicInteraction.kind === "live" ? [{ id: "basic", interaction: component.basicInteraction }] : []),
  ...component.examples.filter(example => example.interaction.kind === "live").map(example => ({ id: example.id, mobile: example.mobile, interaction: example.interaction }))
];

for (const component of manifest.components) {
  for (const target of liveTargets(component)) {
    test(`ULI-A02 ${component.slug} / ${target.id}: every declared live action produces its outcome`, async ({ page }) => {
      const actions = target.interaction.actions;
      // Budget grows with the number of declared actions; each assertion
      // keeps its own bounded timeout.
      test.setTimeout(30_000 + actions.length * 5_000);
      if (target.mobile) {
        await page.goto(`${componentUrl(component.slug)}mobile-${target.id}.html`);
        await expectInventoryMatches(page.locator("body"), actions, `${component.slug}/${target.id}`);
        const reports = await runDeclaredActions(page, page.locator("body"), actions);
        expect(reports.every(report => report.status === STATUS.PASS)).toBe(true);
        return;
      }
      await page.goto(`${componentUrl(component.slug)}index.html`);
      const pageLevel = target.id === "basic" && await page.locator("#example-basic iframe.example-page-frame").count() > 0;
      if (pageLevel) await page.goto(`${componentUrl(component.slug)}basic.html`);
      const scope = pageLevel ? page.locator("body") : page.locator(`#example-${target.id} > .example-canvas`);
      await expect(page.locator(pageLevel ? "body" : `#example-${target.id}`)).toHaveAttribute("data-interaction", "live");
      await expectInventoryMatches(scope, actions, `${component.slug}/${target.id}`);
      const reports = await runDeclaredActions(page, scope, actions);
      expect(reports).toHaveLength(actions.length);
    });
  }

  if (component.basicInteraction.kind === "live") {
    test(`ULI-A02 ${component.slug}: canonical pattern actions also work at 320px and in every motion weight`, async ({ page }) => {
      const actions = component.basicInteraction.actions;
      // mobile.html plus up to three motion-weight copies.
      test.setTimeout(30_000 + actions.length * 4 * 5_000);
      await page.goto(`${componentUrl(component.slug)}mobile.html`);
      await expectInventoryMatches(page.locator("body"), actions, `${component.slug}/mobile.html`);
      await runDeclaredActions(page, page.locator("body"), actions);
      await page.goto(`${componentUrl(component.slug)}index.html`);
      const samples = page.locator('[data-example="motion-weights"] .motion-weight-sample');
      const count = await samples.count();
      for (const index of Array.from({ length: count }, (_, i) => i)) {
        await page.goto(`${componentUrl(component.slug)}index.html`);
        const sample = page.locator('[data-example="motion-weights"] .motion-weight-sample').nth(index);
        await expectInventoryMatches(sample, actions, `${component.slug}/motion-weight-${index}`);
        await runDeclaredActions(page, sample, actions);
      }
    });
  }

  test(`ULI-A09 ${component.slug}: static specimens and undeclared examples expose no operable action`, async ({ page }) => {
    await page.goto(`${componentUrl(component.slug)}index.html`);
    const blocks = page.locator('.example-block[data-interaction="static"]:not(.example-block--mobile):not(.example-block--baseline):not([data-example="motion-weights"])');
    for (const block of await blocks.all()) {
      const canvas = block.locator(":scope > .example-canvas");
      await expect(canvas).toHaveAttribute("inert", "");
      await expect(block.locator(".example-interaction--static")).toContainText("Static specimen.");
      expect(await inventoryActions(canvas, { includeHidden: true })).toEqual([]);
    }
    const plain = page.locator('.example-block[data-interaction="none"]:not(.example-block--mobile):not(.example-block--baseline):not([data-example="motion-weights"]) > .example-canvas');
    for (const canvas of await plain.all()) {
      expect(await inventoryActions(canvas, { includeHidden: true }), "an example with no declaration renders an action").toEqual([]);
    }
    const motion = page.locator('[data-example="motion-weights"][data-interaction="static"] > .example-canvas');
    for (const canvas of await motion.all()) expect(await inventoryActions(canvas, { includeHidden: true })).toEqual([]);

    const frames = [
      ...component.examples.filter(example => example.mobile && example.interaction.kind !== "live").map(example => `mobile-${example.id}.html`),
      ...(component.basicInteraction.kind !== "live" ? ["mobile.html"] : [])
    ];
    for (const frame of frames) {
      await page.goto(`${componentUrl(component.slug)}${frame}`);
      expect(await inventoryActions(page.locator("body"), { includeHidden: true }), `${frame} exposes an operable action`).toEqual([]);
    }
  });
}

test("site manifest classifies every catalog example", () => {
  const all = manifest.components.flatMap(component => [component.basicInteraction, ...component.examples.map(example => example.interaction)]);
  expect(all.filter(item => !["live", "static", "none"].includes(item.kind))).toEqual([]);
});
