import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The embeddable workflow component (@echelon-foundry/forma-workflow) in an
// ordinary host application outside Forma Studio (examples/workflow-embedding).
// Requires `npm run workflow:build`.
const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
test.describe.configure({ timeout: 120_000 });

const open = async (page, width = 1400) => {
  await page.setViewportSize({ width, height: 1000 });
  const loaded = page.waitForEvent("console", { predicate: () => false, timeout: 1 }).catch(() => {});
  await page.goto("/examples/workflow-embedding/index.html");
  await loaded;
  await expect(page.locator("#designer .ef-workflow-editor")).toBeVisible({ timeout: 60_000 });
  await expect(page.locator("#host-status")).toContainText("Loaded");
};

test("same-page embedding works without an iframe and reports load to the host", async ({ page }) => {
  await open(page);
  await expect(page.locator("#designer iframe")).toHaveCount(0);
  await expect(page.locator("#designer .ef-diagram")).toBeVisible();
  await expect(page.locator("#host-status")).toContainText("supported-with-preserved-extensions");
});

test("editing through the toolbar and inspector emits validated changes; extensions survive", async ({ page }) => {
  await open(page);
  const designer = page.locator("#designer");
  await designer.getByRole("button", { name: "Add step" }).click();
  await expect(page.locator("#host-status")).toContainText("Added New task");
  const name = designer.getByLabel("Name", { exact: true });
  await name.fill("Safety board");
  await name.press("Tab");
  await expect(page.locator("#host-status")).toContainText("Renamed");
  const saved = JSON.parse(await page.locator("#host-document").textContent());
  expect(saved.nodes.map((n) => n.label)).toContain("Safety board");
  expect(saved.extensions["com.example.lab"]).toEqual({ proposalId: "MGR-77" });
  await designer.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator("#host-status")).toContainText("Undo");
});

test("keyboard: select from the object list, move with arrow keys, delete with Delete", async ({ page }) => {
  await open(page);
  const designer = page.locator("#designer");
  const item = designer.locator(".ef-workflow-editor__list button", { hasText: "Task: Peer review" });
  await item.focus();
  await page.keyboard.press("Enter");
  await expect(item).toHaveAttribute("aria-pressed", "true");
  const before = await designer.locator("article[data-fw-key='node:peer']").getAttribute("style");
  await designer.locator(".ef-workflow-editor__list button", { hasText: "Task: Peer review" }).press("ArrowDown");
  await expect(page.locator("#host-status")).toContainText("Moved Peer review");
  expect(await designer.locator("article[data-fw-key='node:peer']").getAttribute("style")).not.toBe(before);
  await expect(designer.locator(".ef-workflow-editor__list button", { hasText: "Task: Peer review" })).toBeFocused();
});

test("pointer: drag a selected step to move it in one change", async ({ page }) => {
  await open(page);
  const node = page.locator("#designer article[data-fw-key='node:draft']");
  await node.click();
  await expect(node).toHaveAttribute("data-fw-drag", "move");
  const box = await node.boundingBox();
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 60, box.y + 80, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator("#host-status")).toContainText("Moved Draft proposal");
});

test("touch and non-drag paths: connect by choosing the target, move with buttons", async ({ page }) => {
  await open(page, 390);
  const designer = page.locator("#designer");
  await designer.locator(".ef-workflow-editor__list button", { hasText: "Task: Draft proposal" }).click();
  await designer.locator("summary", { hasText: "Position and size" }).click();
  await designer.getByRole("button", { name: "Move right" }).click();
  await expect(page.locator("#host-status")).toContainText("Moved Draft proposal");
  await designer.getByRole("button", { name: "Connect", exact: true }).first().click();
  await designer.locator(".ef-workflow-editor__list button", { hasText: "End: Schedule on station" }).click();
  await expect(page.locator("#host-status")).toContainText("Connected Draft proposal to Schedule on station");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("metadata is editable and unknown metadata types are kept", async ({ page }) => {
  await open(page);
  const designer = page.locator("#designer");
  await designer.locator(".ef-workflow-editor__list button", { hasText: "Task: Peer review" }).click();
  await designer.locator("summary", { hasText: "Metadata" }).click();
  await designer.getByLabel("Field key").fill("reviewer");
  await designer.getByLabel("Field value").fill("Dr. Ochoa");
  await designer.getByRole("button", { name: "Add field" }).click();
  await expect(page.locator("#host-status")).toContainText("Set reviewer on Peer review");
  const saved = JSON.parse(await page.locator("#host-document").textContent());
  expect(saved.nodes.find((n) => n.id === "peer").metadata).toEqual({ reviewer: "Dr. Ochoa" });
});

test("intents go to the host; the workflow never executes them", async ({ page }) => {
  await open(page);
  await page.locator("#designer").getByRole("button", { name: "Open review" }).click();
  await expect(page.locator("#host-intent")).toContainText("com.example.lab:open-review");
});

test("modes: view is read-only, pick reports a selection", async ({ page }) => {
  await open(page);
  await page.locator("#mode").selectOption("view");
  await expect(page.locator("#designer .ef-workflow-editor")).toHaveAttribute("data-mode", "view");
  await expect(page.locator("#designer").getByRole("button", { name: "Add step" })).toHaveCount(0);
  await page.locator("#mode").selectOption("pick");
  await page.locator("#designer .ef-workflow-editor__list button", { hasText: "Task: Draft proposal" }).click();
  await page.locator("#designer").getByRole("button", { name: /Use selection/ }).click();
  await expect(page.locator("#host-intent")).toContainText("Picked draft");
});

test("runtime mode shows host-projected state without changing the workflow", async ({ page }) => {
  await open(page);
  const live = page.locator("#live");
  await expect(live.locator("article[data-ef-status='active']")).toHaveCount(1);
  await page.getByRole("button", { name: "Advance mission" }).click();
  await expect(live.locator("article[data-ef-status='complete']")).toHaveCount(3);
});

test("isolated mode loads through the versioned message contract", async ({ page }) => {
  await open(page);
  await expect(page.locator("#isolated-status")).toContainText("fully-supported", { timeout: 60_000 });
});

test("embedded component passes automated accessibility checks in edit mode", async ({ page }) => {
  await open(page);
  await page.locator("#designer .ef-workflow-editor__list button", { hasText: "Task: Peer review" }).click();
  const result = await new AxeBuilder({ page }).include("#designer").withTags(wcag).analyze();
  expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([]);
});

test("reduced motion and forced colours keep the editor usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await open(page);
  await page.locator("#designer article[data-fw-key='node:draft']").click();
  await expect(page.locator("#designer article[data-fw-key='node:draft']")).toHaveClass(/ef-workflow-editor__selected/);
});

test.describe("touch input", () => {
  test.use({ hasTouch: true });
  test("tap to select, tap Connect, tap the target: no drag needed", async ({ page, browserName }) => {
    test.skip(browserName === "firefox", "Firefox does not support touch emulation");
    await open(page, 390);
    const designer = page.locator("#designer");
    await designer.locator(".ef-workflow-editor__list button", { hasText: "Task: Peer review" }).tap();
    await expect(designer.locator(".ef-workflow-editor__list button", { hasText: "Task: Peer review" })).toHaveAttribute("aria-pressed", "true");
    await designer.getByRole("button", { name: "Connect", exact: true }).first().tap();
    await designer.locator("article[data-fw-key='node:schedule']").tap();
    await expect(page.locator("#host-status")).toContainText("Connected Peer review to Schedule on station");
  });
});
