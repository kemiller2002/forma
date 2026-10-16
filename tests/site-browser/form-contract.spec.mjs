import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { expectNoOverflow, expectPeerAlignment } from "./ui-conformance-helpers.mjs";

const formPage = "/site-dist/components/form/index.html";
const isolatedForm = "/site-dist/components/form/mobile.html";

test("form fields align on wide containers and stack without overflow when narrow", async ({ page }) => {
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(isolatedForm);
    await expectNoOverflow(page);
    const controls = page.locator(".ef-form-row input");
    await expect(controls).toHaveCount(2);
    const boxes = await controls.evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    }));
    expect(boxes.every(box => box.width > 0 && box.width <= width)).toBe(true);
    expect(Math.abs(boxes[0].height - boxes[1].height)).toBeLessThanOrEqual(1);
    if (width === 320) {
      expect(boxes[1].y).toBeGreaterThan(boxes[0].y + boxes[0].height);
    } else {
      await expectPeerAlignment(page, {
        ruleId: "ULI-L01",
        id: `customer-controls-${width}`,
        edge: "top",
        peers: [
          { role: "textbox", name: "Mission contact name (required)" },
          { role: "textbox", name: "Mission contact email (required)" }
        ]
      });
    }
  }
});

test("native validation refuses bad email and successful submit exposes feedback", async ({ page }) => {
  await page.goto(formPage);
  const example = page.locator("#example-customer-email-validation > .example-canvas");
  const email = example.getByRole("textbox", { name: "Customer email (required)", exact: true });
  await email.fill("not-an-email");
  const before = page.url();
  await example.getByRole("button", { name: "Save contact", exact: true }).click();
  expect(page.url()).toBe(before);
  await expect.poll(() => email.evaluate(element => element.validity.valid)).toBe(false);
  await expect(example.locator(".ef-validation-message--when-invalid")).toBeVisible();

  await email.fill("gateway-ops@nasa.gov");
  await example.getByRole("button", { name: "Save contact", exact: true }).click();
  await expect.poll(() => new URL(page.url()).hash).toBe("#gateway-contact-saved");
  await expect(page.getByRole("status", { name: "Contact save status", exact: true })).toBeVisible();
});

test("reset restores values and native keyboard order reaches every form action", async ({ page }) => {
  await page.goto(isolatedForm);
  const name = page.getByRole("textbox", { name: "Mission contact name (required)", exact: true });
  const email = page.getByRole("textbox", { name: "Mission contact email (required)", exact: true });
  await name.fill("Victor Glover");
  await page.getByRole("button", { name: "Reset form", exact: true }).click();
  await expect(name).toHaveValue("Reid Wiseman");

  await name.focus();
  await page.keyboard.press("Tab");
  await expect(email).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Save customer", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Reset form", exact: true })).toBeFocused();
});

test("form examples pass scoped accessibility analysis", async ({ page }) => {
  await page.goto(formPage);
  const results = await new AxeBuilder({ page }).include("#example-basic .example-canvas").analyze();
  expect(results.violations).toEqual([]);
});

test("forced colours and reduced motion preserve visible, operable form state", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto(isolatedForm);
  const save = page.getByRole("button", { name: "Save customer", exact: true });
  await save.focus();
  const state = await save.evaluate(element => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, visible: element.checkVisibility(), animations: element.getAnimations().length };
  });
  expect(state.visible).toBe(true);
  expect(state.outlineStyle).not.toBe("none");
  expect(Number.parseFloat(state.outlineWidth)).toBeGreaterThan(0);
  expect(state.animations).toBe(0);
});
