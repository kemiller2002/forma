import { expect, test } from "@playwright/test";
import {
  STATUS,
  edgeCoordinate,
  evaluateActionOutcome,
  evaluateAlignment,
  expectActionOutcome,
  expectPeerAlignment,
  inventoryVisibleActions,
  measureAlignment,
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
