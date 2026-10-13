import { expect, test } from "@playwright/test";
import {
  CONTRACT,
  CONTRACT_WIDTHS,
  STATUS,
  edgeCoordinate,
  evaluateActionOutcome,
  evaluateAlignment,
  expectActionOutcome,
  expectPeerAlignment,
  evaluateLabelIntegrity,
  evaluateOverflow,
  expectDeclaredGroups,
  measureDeclaredGroups,
  expectNoOverflow,
  inventoryActions,
  inventoryVisibleActions,
  measureAlignment,
  measureLabelIntegrity,
  measureOverflow,
  recordTabSequence,
  wasFocusedDuringSequence,
  runActionAssertion,
  validateActionContract,
  validateAlignmentGroup
} from "./ui-conformance-helpers.mjs";

// Self-tests for the reference conformance helpers. Negative fixtures prove the
// helpers cannot report PASS for inert actions, unrelated changes, staggered
// fields or missing geometry (UI-LAYOUT-INTERACTION.md ULI-L01, ULI-A01/A02).

const NEGATIVE_TIMEOUT_MS = 750;

const fixture = body => `<!doctype html><html lang="en"><head><meta charset="utf-8">
  <style>body{font:16px/1.4 system-ui,sans-serif;margin:16px} input{display:block;height:40px;box-sizing:border-box;width:100%}</style>
  </head><body>${body}</body></html>`;

const nameRow = (firstLabel, lastLabel, extraStyle = "") => fixture(`
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;width:288px;${extraStyle}">
    <div><label for="first">${firstLabel}</label><input id="first"></div>
    <div><label for="last">${lastLabel}</label><input id="last"></div>
  </div>`);

const nameGroup = Object.freeze({
  ruleId: "ULI-L01",
  id: "name-row",
  edge: "top",
  peers: [
    { role: "textbox", name: "First name" },
    { role: "textbox", name: "Last name" }
  ]
});

const box = (x, y, width, height) => ({ x, y, width, height });

test.describe("pure evaluation", () => {
  test("alignment within tolerance passes and reports delta and tolerance", () => {
    const report = evaluateAlignment(nameGroup, [
      { peer: nameGroup.peers[0], count: 1, box: box(0, 20, 100, 40) },
      { peer: nameGroup.peers[1], count: 1, box: box(120, 20.6, 100, 40) }
    ]);
    expect(report).toMatchObject({ ruleId: "ULI-L01", group: "name-row", status: STATUS.PASS, toleranceCssPx: 1 });
    expect(report.deltaCssPx).toBeCloseTo(0.6, 5);
    expect(report.measurements.map(item => item.element)).toEqual(['textbox "First name"', 'textbox "Last name"']);
  });

  test("alignment beyond tolerance fails", () => {
    const report = evaluateAlignment(nameGroup, [
      { peer: nameGroup.peers[0], count: 1, box: box(0, 20, 100, 40) },
      { peer: nameGroup.peers[1], count: 1, box: box(120, 42, 100, 40) }
    ]);
    expect(report.status).toBe(STATUS.FAIL);
    expect(report.deltaCssPx).toBe(22);
  });

  test("missing, ambiguous, null and zero-size observations are UNKNOWN, never PASS", () => {
    const cases = [
      { count: 0, box: null },
      { count: 2, box: null },
      { count: 1, box: null },
      { count: 1, box: box(0, 20, 0, 0) },
      { count: 1, box: box(0, 20, 100, 0) }
    ];
    const reports = cases.map(observation => evaluateAlignment(nameGroup, [
      { peer: nameGroup.peers[0], count: 1, box: box(0, 20, 100, 40) },
      { peer: nameGroup.peers[1], ...observation }
    ]));
    expect(reports.map(report => report.status)).toEqual(Array(cases.length).fill(STATUS.UNKNOWN));
    expect(reports.every(report => report.deltaCssPx === null)).toBe(true);
  });

  test("group declarations are validated rather than guessed", () => {
    expect(() => validateAlignmentGroup({ id: "solo", peers: [nameGroup.peers[0]] })).toThrow(/at least two/);
    expect(() => validateAlignmentGroup({ ...nameGroup, edge: "diagonal" })).toThrow(/Unsupported alignment edge/);
    expect(() => validateAlignmentGroup({ ...nameGroup, ruleId: "L01" })).toThrow(/ULI-L rule ID/);
    expect(() => validateAlignmentGroup({ ...nameGroup, peers: [{ role: "textbox" }, nameGroup.peers[1]] })).toThrow(/role and name/);
    expect(edgeCoordinate(box(10, 20, 30, 40), "bottom")).toBe(60);
  });

  test("action contracts require an explicit expected post-state and bounded timeout", () => {
    const action = { role: "button", name: "Save" };
    const target = { role: "status", name: "Save status" };
    expect(() => validateActionContract({ action, outcome: { kind: "text", target } })).toThrow(/explicit expected/);
    expect(() => validateActionContract({ action, outcome: { kind: "click" } })).toThrow(/observable outcome kind/);
    expect(() => validateActionContract({ action, outcome: { kind: "text", target, expected: "Saved" }, timeoutMs: Infinity })).toThrow(/bounded/);
    expect(() => validateActionContract({ action: { role: "button" }, outcome: { kind: "url", expected: /x/ } })).toThrow(/role and name/);
  });

  test("action evaluation fails when post equals pre or expectation already held", () => {
    const contract = { ruleId: "ULI-A02", action: { role: "button", name: "Go" }, outcome: { kind: "text", target: { role: "status", name: "S" }, expected: "Done" } };
    const unchanged = evaluateActionOutcome({ ...contract, pre: { value: "Idle" }, post: { value: "Idle" } });
    const preexisting = evaluateActionOutcome({ ...contract, pre: { value: "Done" }, post: { value: "Done" } });
    const changed = evaluateActionOutcome({ ...contract, pre: { value: "Idle" }, post: { value: "Done" } });
    expect([unchanged.status, preexisting.status, changed.status]).toEqual([STATUS.FAIL, STATUS.FAIL, STATUS.PASS]);
    expect(preexisting.reason).toMatch(/pre-state already satisfies/);
  });
});

test.describe("ULI-L01 alignment fixtures", () => {
  test("aligned peer fields pass", async ({ page }) => {
    await page.setContent(nameRow("First name", "Last name"));
    const report = await expectPeerAlignment(page, nameGroup);
    expect(report.status).toBe(STATUS.PASS);
    expect(report.deltaCssPx).toBeLessThanOrEqual(1);
  });

  test("fields staggered by label wrapping fail with measured values", async ({ page }) => {
    const longLabel = "Last name as printed on your government identification";
    const wrappedGroup = { ...nameGroup, peers: [nameGroup.peers[0], { role: "textbox", name: longLabel }] };
    await page.setContent(nameRow("First name", longLabel));
    const report = await measureAlignment(page, wrappedGroup);
    expect(report.status).toBe(STATUS.FAIL);
    expect(report.deltaCssPx).toBeGreaterThan(1);
    expect(report.measurements.every(item => typeof item.coordinate === "number")).toBe(true);
    await expect(expectPeerAlignment(page, wrappedGroup)).rejects.toThrow(/ULI-L01 FAIL: group name-row/);
  });

  test("an introduced drift is detected after the layout settles", async ({ page }) => {
    await page.setContent(nameRow("First name", "Last name"));
    await page.locator("#last").evaluate(input => { input.style.marginTop = "8px"; });
    const report = await measureAlignment(page, nameGroup);
    expect(report.status).toBe(STATUS.FAIL);
    expect(report.deltaCssPx).toBeCloseTo(8, 0);
  });

  test("hidden peer does not pass", async ({ page }) => {
    await page.setContent(nameRow("First name", "Last name").replace('<input id="last">', '<input id="last" style="display:none">'));
    const report = await measureAlignment(page, nameGroup, { timeoutMs: NEGATIVE_TIMEOUT_MS });
    expect(report.status).toBe(STATUS.UNKNOWN);
    await expect(expectPeerAlignment(page, nameGroup, { timeoutMs: NEGATIVE_TIMEOUT_MS })).rejects.toThrow(/ULI-L01 UNKNOWN/);
  });

  test("zero-size peer does not pass", async ({ page }) => {
    await page.setContent(nameRow("First name", "Last name")
      .replace('<input id="last">', '<input id="last" style="height:0;width:0;padding:0;border:0;min-height:0">'));
    const report = await measureAlignment(page, nameGroup, { timeoutMs: NEGATIVE_TIMEOUT_MS });
    expect(report.status).not.toBe(STATUS.PASS);
    expect(report.reason).toMatch(/zero-size|not found|no bounding box/);
  });

  test("missing peer does not pass", async ({ page }) => {
    await page.setContent(nameRow("First name", "Surname"));
    const report = await measureAlignment(page, nameGroup, { timeoutMs: NEGATIVE_TIMEOUT_MS });
    expect(report.status).toBe(STATUS.UNKNOWN);
    expect(report.reason).toMatch(/Last name.*not found/);
  });

  test("waits for web fonts before measuring", async ({ page }) => {
    await page.setContent(nameRow("First name", "Last name"));
    const fontsReady = await page.evaluate(() => document.fonts.status);
    const report = await expectPeerAlignment(page, nameGroup);
    expect(["loaded", "loading"]).toContain(fontsReady);
    expect(await page.evaluate(() => document.fonts.status)).toBe("loaded");
    expect(report.status).toBe(STATUS.PASS);
  });
});

test.describe("ULI-A01/A02 action fixtures", () => {
  const counterPage = (script = "") => fixture(`
    <button type="button" id="increment">Increment</button>
    <button type="button" id="other">Reset other</button>
    <p role="status" aria-label="Counter" id="count">Count: 0</p>
    <p role="status" aria-label="Other" id="other-status">Other: idle</p>
    <script>${script}</script>`);
  const counterContract = Object.freeze({
    ruleId: "ULI-A02",
    action: { role: "button", name: "Increment" },
    outcome: { kind: "text", target: { role: "status", name: "Counter" }, expected: "Count: 1" }
  });

  test("inert button fails", async ({ page }) => {
    await page.setContent(counterPage());
    const report = await runActionAssertion(page, { ...counterContract, timeoutMs: NEGATIVE_TIMEOUT_MS });
    expect(report.status).toBe(STATUS.FAIL);
    expect(report.reason).toMatch(/never appeared/);
    expect(report.post.value).toBe(report.pre.value);
    await expect(expectActionOutcome(page, { ...counterContract, timeoutMs: NEGATIVE_TIMEOUT_MS })).rejects.toThrow(/ULI-A02 FAIL/);
  });

  test("button that changes the declared state passes, including after asynchronous work", async ({ page }) => {
    await page.setContent(counterPage(`
      document.getElementById('increment').addEventListener('click', () => {
        setTimeout(() => { document.getElementById('count').textContent = 'Count: 1'; }, 200);
      });`));
    const report = await expectActionOutcome(page, counterContract);
    expect(report).toMatchObject({ status: STATUS.PASS, pre: { value: "Count: 0" }, post: { value: "Count: 1" } });
  });

  test("button that changes something unrelated fails a specific expectation", async ({ page }) => {
    await page.setContent(counterPage(`
      document.getElementById('increment').addEventListener('click', () => {
        document.getElementById('other-status').textContent = 'Other: changed';
      });`));
    const report = await runActionAssertion(page, { ...counterContract, timeoutMs: NEGATIVE_TIMEOUT_MS });
    expect(report.status).toBe(STATUS.FAIL);
    expect(await page.getByRole("status", { name: "Other" }).textContent()).toBe("Other: changed");
  });

  test("an off-screen skip link is reached by focus before activation", async ({ page }) => {
    await page.setContent(fixture(`<style>.skip{position:absolute;left:-999px}.skip:focus{left:8px}</style>
      <a class="skip" href="#main">Skip to main content</a><main id="main" tabindex="-1">Main</main>`));
    await expectActionOutcome(page, { action: { role: "link", name: "Skip to main content" }, outcome: { kind: "url", expected: /#main$/ } });
  });

  test("a fixed skip link translated off-screen is reached by focus even after scrolling", async ({ page }) => {
    await page.setContent(fixture(`<style>.skip{position:fixed;top:8px;left:8px;transform:translateY(-200%)}.skip:focus{transform:none}</style>
      <a class="skip" href="#main">Skip to main content</a><div style="block-size:3000px"></div><main id="main" tabindex="-1">Main</main>`));
    await page.evaluate(() => window.scrollTo(0, 1500));
    await expectActionOutcome(page, { action: { role: "link", name: "Skip to main content" }, outcome: { kind: "url", expected: /#main$/ } });
  });

  test("an on-screen control is not focused before it is clicked", async ({ page }) => {
    // Focus can have its own effect (interest invokers open on focus); a
    // pointer activation must not be preceded by a programmatic focus.
    await page.setContent(fixture(`<button type="button" id="b">Show count</button><p role="status" aria-label="Focus count">0</p>
      <script>
        const b = document.getElementById('b'); const out = document.querySelector('[role=status]');
        let focusedBeforePointer = 0;
        b.addEventListener('focus', () => { if (!b.matches(':active')) focusedBeforePointer += 1; });
        b.addEventListener('click', () => { out.textContent = focusedBeforePointer === 0 ? 'clicked without prior focus' : 'focused before click'; });
      </script>`));
    await expectActionOutcome(page, { action: { role: "button", name: "Show count" }, outcome: { kind: "text", target: { role: "status", name: "Focus count" }, expected: "clicked without prior focus" } });
  });

  test("pre-existing expected feedback cannot satisfy an inert button", async ({ page }) => {
    await page.setContent(fixture(`<button type="button">Save</button><p role="status" aria-label="Save status">Saved</p>`));
    const report = await runActionAssertion(page, {
      action: { role: "button", name: "Save" },
      outcome: { kind: "text", target: { role: "status", name: "Save status" }, expected: "Saved" },
      timeoutMs: NEGATIVE_TIMEOUT_MS
    });
    expect(report.status).toBe(STATUS.FAIL);
    expect(report.reason).toMatch(/pre-state already satisfies/);
  });

  test("substring of a later value does not satisfy an exact expectation", async ({ page }) => {
    await page.setContent(counterPage(`
      document.getElementById('increment').addEventListener('click', () => {
        document.getElementById('count').textContent = 'Count: 10';
      });`));
    const report = await runActionAssertion(page, { ...counterContract, timeoutMs: NEGATIVE_TIMEOUT_MS });
    expect(report.status).toBe(STATUS.FAIL);
  });

  test("disclosure, checkbox and attribute transitions pass only when they occur", async ({ page }) => {
    await page.setContent(fixture(`
      <button type="button" aria-expanded="false" aria-controls="panel" id="toggle">Details</button>
      <section id="panel" aria-label="Details panel" hidden>More</section>
      <label><input type="checkbox" id="agree"> Agree</label>
      <button type="button" id="check-all">Accept terms</button>
      <script>
        const toggle = document.getElementById('toggle');
        toggle.addEventListener('click', () => {
          const open = toggle.getAttribute('aria-expanded') !== 'true';
          toggle.setAttribute('aria-expanded', String(open));
          document.getElementById('panel').hidden = !open;
        });
        document.getElementById('check-all').addEventListener('click', () => { document.getElementById('agree').checked = true; });
      </script>`));
    await expectActionOutcome(page, {
      action: { role: "button", name: "Details" },
      outcome: { kind: "visible", target: { role: "region", name: "Details panel" }, expected: true }
    });
    await expectActionOutcome(page, {
      action: { role: "button", name: "Details" },
      outcome: { kind: "attribute", target: { role: "button", name: "Details" }, attribute: "aria-expanded", expected: "false" }
    });
    await expectActionOutcome(page, {
      action: { role: "button", name: "Accept terms" },
      outcome: { kind: "checked", target: { role: "checkbox", name: "Agree" }, expected: true }
    });
    const repeat = await runActionAssertion(page, {
      action: { role: "button", name: "Accept terms" },
      outcome: { kind: "checked", target: { role: "checkbox", name: "Agree" }, expected: true },
      timeoutMs: NEGATIVE_TIMEOUT_MS
    });
    expect(repeat.status).toBe(STATUS.FAIL);
  });

  test("fragment navigation is observed through the URL", async ({ page }) => {
    await page.goto("about:blank");
    await page.setContent(fixture(`<a href="#pricing">Pricing</a><h2 id="pricing">Pricing</h2>`));
    const report = await expectActionOutcome(page, {
      action: { role: "link", name: "Pricing" },
      outcome: { kind: "url", expected: /#pricing$/ }
    });
    expect(report.status).toBe(STATUS.PASS);
  });

  test("missing, ambiguous and disabled controls are UNKNOWN, never PASS", async ({ page }) => {
    await page.setContent(fixture(`
      <button type="button">Twin</button><button type="button">Twin</button>
      <button type="button" disabled>Locked</button>
      <p role="status" aria-label="Result">Idle</p>`));
    const outcome = { kind: "text", target: { role: "status", name: "Result" }, expected: "Done" };
    const reports = await Promise.all(["Absent", "Twin", "Locked"].map(name =>
      runActionAssertion(page, { action: { role: "button", name }, outcome, timeoutMs: NEGATIVE_TIMEOUT_MS })));
    expect(reports.map(report => report.status)).toEqual([STATUS.UNKNOWN, STATUS.UNKNOWN, STATUS.UNKNOWN]);
    expect(reports.map(report => report.reason)).toEqual([
      "action control not found",
      "action control name is ambiguous (2 matches)",
      "action control is disabled"
    ]);
  });

  test("missing outcome target is UNKNOWN, never PASS", async ({ page }) => {
    await page.setContent(counterPage(`
      document.getElementById('increment').addEventListener('click', () => {});`));
    const report = await runActionAssertion(page, {
      ...counterContract,
      outcome: { ...counterContract.outcome, target: { role: "status", name: "Nonexistent" } },
      timeoutMs: NEGATIVE_TIMEOUT_MS
    });
    expect(report.status).toBe(STATUS.UNKNOWN);
  });
});

test("action inventory reports candidates without claiming functionality", async ({ page }) => {
  await page.setContent(fixture(`
    <button type="button">Unwired example</button>
    <button type="button" disabled>Disabled state specimen</button>
    <button type="submit">Save</button>`));
  const actions = await inventoryVisibleActions(page);
  expect(actions.map(item => item.nameHint)).toEqual(["Unwired example", "Save"]);
});

test.describe("published package surface", () => {
  test("cites the canonical contract and widths", () => {
    expect(CONTRACT).toEqual({ id: "visual-engineering/UI-LAYOUT-INTERACTION", version: "1.0.0" });
    expect(CONTRACT_WIDTHS).toEqual([320, 390, 768, 1280]);
  });

  test("overflow and label evaluation never pass without evidence", () => {
    expect(evaluateOverflow({ scrollWidth: 0, clientWidth: 0 }).status).toBe(STATUS.UNKNOWN);
    expect(evaluateOverflow({ scrollWidth: 330, clientWidth: 320, escapes: [] }).status).toBe(STATUS.FAIL);
    expect(evaluateOverflow({ scrollWidth: 320, clientWidth: 320, escapes: ["span"] }).status).toBe(STATUS.FAIL);
    expect(evaluateOverflow({ scrollWidth: 320, clientWidth: 320, escapes: [] }).status).toBe(STATUS.PASS);
    const label = { name: "Pricing", scrollWidth: 80, clientWidth: 80, scrollHeight: 20, clientHeight: 20, left: 0, right: 80, viewport: 320 };
    expect(evaluateLabelIntegrity({ ...label, display: "inline", clientWidth: 0, clientHeight: 0 }).status).toBe(STATUS.UNKNOWN);
    expect(evaluateLabelIntegrity({ ...label, display: "block" }).status).toBe(STATUS.PASS);
    expect(evaluateLabelIntegrity({ ...label, display: "block", scrollWidth: 120 }).status).toBe(STATUS.FAIL);
    expect(evaluateLabelIntegrity({ ...label, display: "block", right: 330 }).status).toBe(STATUS.FAIL);
  });
});

test.describe("scoped, native and inert actions", () => {
  test("scope disambiguates duplicate names across regions", async ({ page }) => {
    await page.setContent(fixture(`
      <header><a href="#features">Features</a></header>
      <footer><a href="#features-footer">Features</a></footer>
      <h2 id="features">Features</h2><h2 id="features-footer">More features</h2>`));
    const unscoped = await runActionAssertion(page, { action: { role: "link", name: "Features" }, outcome: { kind: "url", expected: /#features$/ }, timeoutMs: NEGATIVE_TIMEOUT_MS });
    expect(unscoped.status).toBe(STATUS.UNKNOWN);
    await expectActionOutcome(page, { scope: page.locator("footer"), action: { role: "link", name: "Features" }, outcome: { kind: "url", expected: /#features-footer$/ } });
    await expectActionOutcome(page.locator("header"), { action: { role: "link", name: "Features" }, outcome: { kind: "url", expected: /#features$/ } });
  });

  test("native disclosure, popover and modal dialog pass through controlled targets", async ({ page }) => {
    await page.setContent(fixture(`
      <details><summary>Shipping details</summary><p>Ships in two days.</p></details>
      <button type="button" popovertarget="tips">Show tips</button>
      <div popover id="tips" aria-label="Tips">Tips</div>
      <button type="button" commandfor="confirm" command="show-modal">Delete project</button>
      <dialog id="confirm" aria-label="Confirm deletion"><form method="dialog"><button>Keep project</button></form></dialog>`));
    await expectActionOutcome(page, { action: { role: "disclosure", name: "Shipping details" }, outcome: { kind: "open", target: "controlled", expected: true } });
    await expectActionOutcome(page, { action: { role: "button", name: "Show tips" }, outcome: { kind: "open", target: "controlled", expected: true } });
    await page.keyboard.press("Escape");
    await expectActionOutcome(page, { action: { role: "button", name: "Delete project" }, outcome: { kind: "open", target: "controlled", expected: true } });
    await expectActionOutcome(page, { action: { role: "button", name: "Keep project" }, outcome: { kind: "open", target: "controlled", expected: false } });
  });

  test("controls without a controlled element or inside inert content do not pass", async ({ page }) => {
    await page.setContent(fixture(`
      <button type="button">Unlinked</button>
      <div inert><button type="button" popovertarget="p">Inert opener</button></div>
      <div popover id="p">Popover</div>
      <button type="button" aria-disabled="true" popovertarget="p">Soft disabled</button>`));
    const reports = await Promise.all(["Unlinked", "Inert opener", "Soft disabled"].map(name =>
      runActionAssertion(page, { action: { role: "button", name }, outcome: { kind: "open", target: "controlled", expected: true }, timeoutMs: NEGATIVE_TIMEOUT_MS })));
    expect(reports.map(report => [report.status, report.reason])).toEqual([
      [STATUS.UNKNOWN, "outcome target not found before activation"],
      [STATUS.UNKNOWN, "action control is inert"],
      [STATUS.UNKNOWN, "action control is disabled"]
    ]);
  });

  test("inventory resolves roles and names and skips disabled and inert controls", async ({ page }) => {
    await page.setContent(fixture(`
      <button type="button"><span aria-hidden="true">×</span><span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Remove filter Owner</span></button>
      <a href="#top">Back to top</a>
      <details><summary>Details</summary></details>
      <button disabled>Disabled</button>
      <div inert><button>Inert</button></div>
      <dialog><button>Close dialog</button></dialog>
      <details><summary>Closed section</summary><a href="#hidden">Hidden link</a></details>`));
    const visible = await inventoryActions(page);
    expect(visible.map(item => [item.role, item.name])).toEqual([["button", "Remove filter Owner"], ["link", "Back to top"], ["disclosure", "Details"], ["disclosure", "Closed section"]]);
    const all = await inventoryActions(page, { includeHidden: true });
    expect(all.map(item => item.name)).toEqual(expect.arrayContaining(["Close dialog", "Hidden link"]));
  });
});

test.describe("overflow, labels and focus", () => {
  test("clipped text fails, scroll containers are permitted", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 400 });
    await page.setContent(fixture(`<div style="overflow-x:auto;width:200px"><p style="white-space:nowrap;width:600px">A wide table row inside a contained, labelled scroller</p></div>`));
    expect((await measureOverflow(page)).status).toBe(STATUS.PASS);
    await page.setContent(fixture(`<table><thead style="position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%)"><tr><th style="display:block;inline-size:7rem">A visually hidden column heading</th></tr></thead></table>`));
    expect((await measureOverflow(page)).status).toBe(STATUS.PASS);
    await page.setContent(fixture(`<nav style="overflow:hidden;width:200px"><a href="#a" style="white-space:nowrap">A navigation label that is far too long to fit</a></nav>`));
    const report = await measureOverflow(page);
    expect(report.status).toBe(STATUS.FAIL);
    expect(report.escapes.join(" ")).toMatch(/navigation label/);
    await expect(expectNoOverflow(page)).rejects.toThrow(/ULI-L05 FAIL/);
  });

  test("label integrity measures block boxes and refuses inline ones", async ({ page }) => {
    await page.setContent(fixture(`<span id="inline">Inline</span><div id="fits" style="width:200px">Fits</div><div id="clips" style="width:40px;overflow:hidden;white-space:nowrap">Truncated label</div>`));
    expect((await measureLabelIntegrity(page.locator("#inline"))).status).toBe(STATUS.UNKNOWN);
    expect((await measureLabelIntegrity(page.locator("#fits"))).status).toBe(STATUS.PASS);
    expect((await measureLabelIntegrity(page.locator("#clips"))).status).toBe(STATUS.FAIL);
  });

  test("tab sequence records reachable controls only", async ({ page }) => {
    await page.setContent(fixture(`<button>One</button><div inert><button>Skipped</button></div><button>Two</button>`));
    await recordTabSequence(page, 3);
    expect(await wasFocusedDuringSequence(page.getByRole("button", { name: "Two" }))).toBe(true);
    expect(await wasFocusedDuringSequence(page.getByRole("button", { name: "Skipped" }))).toBe(false);
  });
});

test.describe("declared groups in markup (data-uli-align-*)", () => {
  const rowMarkup = second => fixture(`<div style="display:flex;gap:16px;align-items:flex-start">
    <input aria-label="City" data-uli-align-group="address" data-uli-align-edge="top" data-uli-align-peer="City">
    <input aria-label="Postal code" data-uli-align-group="address" data-uli-align-peer="Postal code" style="${second}">
  </div>`);

  test("aligned declared peers pass and staggered ones fail with measured values", async ({ page }) => {
    await page.setContent(rowMarkup(""));
    const [aligned] = await expectDeclaredGroups(page);
    expect(aligned).toMatchObject({ group: "address", edge: "top", status: STATUS.PASS });
    await page.setContent(rowMarkup("margin-top: 12px"));
    const [staggered] = await measureDeclaredGroups(page);
    expect(staggered.status).toBe(STATUS.FAIL);
    expect(staggered.deltaCssPx).toBeCloseTo(12, 0);
    expect(staggered.measurements.map(item => item.element)).toEqual(['declared "City"', 'declared "Postal code"']);
  });

  test("a hidden or lone declared peer is UNKNOWN, and no declarations is an error", async ({ page }) => {
    await page.setContent(rowMarkup("display: none"));
    expect((await measureDeclaredGroups(page))[0].status).toBe(STATUS.UNKNOWN);
    await page.setContent(fixture(`<input aria-label="Lone" data-uli-align-group="solo">`));
    expect((await measureDeclaredGroups(page))[0].status).toBe(STATUS.UNKNOWN);
    await page.setContent(fixture(`<p>No declarations</p>`));
    await expect(expectDeclaredGroups(page)).rejects.toThrow(/no data-uli-align-group declarations/);
  });

  test("the text pseudo-role measures a peer without a role", async ({ page }) => {
    await page.setContent(fixture(`<div style="display:flex;align-items:center;gap:8px"><h2 style="margin:0">INV-1042</h2><span>Overdue</span></div>`));
    const report = await measureAlignment(page, { ruleId: "ULI-L07", id: "title-status", edge: "center", peers: [{ role: "heading", name: "INV-1042" }, { role: "text", name: "Overdue" }] });
    expect(report.status).toBe(STATUS.PASS);
  });
});
