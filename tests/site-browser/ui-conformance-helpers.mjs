import { expect } from "@playwright/test";

// Reusable conformance assertions. Tests must declare meaningful peers and
// observable actions; these helpers intentionally do not guess UI intent.

function semantic(page, { role, name }) {
  if (!role || !name) throw new Error("Specify both accessible role and name.");
  return page.getByRole(role, { name, exact: true });
}

export async function expectPeerAlignment(page, { id, peers, edge = "top", toleranceCssPx = 1 }) {
  if (!id || !Array.isArray(peers) || peers.length < 2) {
    throw new Error("A declared alignment group requires an id and at least two peers.");
  }
  if (!["top", "bottom", "center"].includes(edge)) throw new Error("Unsupported alignment edge.");
  const coords = [];
  for (const peer of peers) {
    const element = semantic(page, peer);
    await expect(element).toBeVisible();
    const box = await element.boundingBox();
    if (!box) throw new Error(`Missing bounds for ${id}: ${peer.role}/${peer.name}`);
    const coordinate = edge === "top" ? box.y : edge === "bottom" ? box.y + box.height : box.y + box.height / 2;
    coords.push({ peer, coordinate });
  }
  const delta = Math.max(...coords.map(item => item.coordinate)) - Math.min(...coords.map(item => item.coordinate));
  expect(delta, `Alignment group ${id} has ${delta.toFixed(2)}px ${edge}-edge mismatch: ${JSON.stringify(coords)}`)
    .toBeLessThanOrEqual(toleranceCssPx);
  return { id, edge, deltaCssPx: delta, coords };
}

// A click alone is never an outcome. The test asserts a meaningful public DOM
// or URL state. Domain/persistence assertions remain the consumer's job.
export async function expectActionOutcome(page, { action, outcome }) {
  if (!outcome?.kind) throw new Error("A demo action requires an observable outcome.");
  const control = semantic(page, action);
  await expect(control).toBeVisible();
  await expect(control).toBeEnabled();

  const previousUrl = page.url();
  let target, previous;
  if (outcome.target) target = semantic(page, outcome.target);
  if (outcome.kind !== "url" && !target) throw new Error("Outcome requires a semantic target.");

  // Capture the state *before* activation. Otherwise an inert button can pass
  // merely because the asserted text or element was already present.
  switch (outcome.kind) {
    case "visible": previous = await target.isVisible(); break;
    case "text": previous = await target.textContent(); break;
    case "checked":
    case "unchecked": previous = await target.isChecked(); break;
    case "attribute":
      if (!outcome.attribute || outcome.value === undefined) throw new Error("Attribute outcome needs attribute and value.");
      previous = await target.getAttribute(outcome.attribute); break;
    case "url": break;
    default: throw new Error(`Unsupported observable outcome: ${outcome.kind}`);
  }

  await control.click();

  switch (outcome.kind) {
    case "url":
      if (!outcome.matches) throw new Error("URL outcome requires a target URL/regexp.");
      await expect(page).toHaveURL(outcome.matches);
      expect(page.url(), "Action did not change navigation state").not.toBe(previousUrl);
      break;
    case "visible":
      await expect(target).toBeVisible();
      expect(previous, "Target was visible before activation; no transition was demonstrated").toBe(false);
      break;
    case "text":
      if (outcome.text === undefined) throw new Error("Text outcome requires expected text.");
      await expect(target).toContainText(outcome.text);
      expect(await target.textContent(), "Text did not change after activation").not.toBe(previous);
      break;
    case "checked":
      await expect(target).toBeChecked();
      expect(previous, "Checkbox was already checked").toBe(false);
      break;
    case "unchecked":
      await expect(target).not.toBeChecked();
      expect(previous, "Checkbox was already unchecked").toBe(true);
      break;
    case "attribute":
      await expect(target).toHaveAttribute(outcome.attribute, outcome.value);
      expect(await target.getAttribute(outcome.attribute), "Attribute did not change after activation").not.toBe(previous);
      break;
  }
}

// Diagnostic inventory, NOT a no-op detector. It finds candidate enabled
// controls requiring explicit scenario contracts; it does not claim that
// matching an element proves its implementation.
export async function inventoryVisibleActions(page) {
  return page.locator('button:not([disabled]), input[type="button"]:not([disabled]), input[type="submit"]:not([disabled]), a[role="button"]:not([aria-disabled="true"])')
    .evaluateAll(elements => elements.filter(el => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    }).map(el => ({
      tag: el.tagName.toLowerCase(),
      nameHint: el.getAttribute("aria-label") || el.textContent?.trim() || el.getAttribute("value") || "",
      type: el.getAttribute("type") || "",
      url: el.getAttribute("href") || null
    })));
}
