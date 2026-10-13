import { expect, test } from "@playwright/test";
import { expectPeerAlignment, expectActionOutcome, inventoryVisibleActions } from "./ui-conformance-helpers.mjs";

test("ULI-L01 measures declared peer input top alignment", async ({ page }) => {
  await page.setContent(`<!doctype html><html lang="en"><body>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div><label for="first">First name</label><input id="first" style="display:block;height:40px"></div>
      <div><label for="last">Last name</label><input id="last" style="display:block;height:40px"></div>
    </div></body></html>`);
  const group = {
    id: "name-row",
    peers: [
      { role: "textbox", name: "First name" },
      { role: "textbox", name: "Last name" }
    ],
    toleranceCssPx: 1
  };
  const result = await expectPeerAlignment(page, group);
  expect(result.deltaCssPx).toBeLessThanOrEqual(1);

  // Sensitivity check: the helper must reject a deliberately introduced drift.
  await page.locator("#last").evaluate(input => { input.style.marginTop = "8px"; });
  await expect(expectPeerAlignment(page, group)).rejects.toThrow();
});

test("ULI-A01/A02 accepts an actual observable action outcome", async ({ page }) => {
  await page.setContent(`<!doctype html><html lang="en"><body>
    <button type="button" id="increment">Increment</button>
    <p role="status" aria-label="Counter" id="count">Count: 0</p>
    <script>
      document.getElementById('increment').addEventListener('click', () => {
        document.getElementById('count').textContent = 'Count: 1';
      });
    </script></body></html>`);
  await expectActionOutcome(page, {
    action: { role: "button", name: "Increment" },
    outcome: { kind: "text", target: { role: "status", name: "Counter" }, text: "Count: 1" }
  });
  await expect(page.getByRole("status")).toHaveText("Count: 1");
});

test("action inventory reports candidates without claiming functionality", async ({ page }) => {
  await page.setContent(`<!doctype html><html lang="en"><body>
    <button type="button">Unwired example</button>
    <button type="button" disabled>Disabled state specimen</button>
    <button type="submit">Save</button>
  </body></html>`);
  const actions = await inventoryVisibleActions(page);
  expect(actions.map(item => item.nameHint)).toEqual(["Unwired example", "Save"]);
});

test("inert action cannot pass because expected feedback already exists", async ({ page }) => {
  await page.setContent(`<!doctype html><html lang="en"><body>
    <button type="button">Save</button>
    <p role="status" aria-label="Save status">Saved</p>
  </body></html>`);
  await expect(expectActionOutcome(page, {
    action: { role: "button", name: "Save" },
    outcome: { kind: "text", target: { role: "status", name: "Save status" }, text: "Saved" }
  })).rejects.toThrow(/Text did not change/);
});
