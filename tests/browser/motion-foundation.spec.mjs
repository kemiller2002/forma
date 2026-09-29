import { expect, test } from "@playwright/test";

// FORMA-MOT-001: shared motion vocabulary and perceived-weight defaults
// (requirements/MOTION-AND-INTERACTION.md MOT-008, MOT-009, MOT-010, section 13).
const fixture = "/tests/browser/fixture/motion-foundation.html";

const milliseconds = (value) => {
  const trimmed = value.trim();
  return trimmed.endsWith("ms") ? Number.parseFloat(trimmed) : Number.parseFloat(trimmed) * 1000;
};

// Unregistered custom properties compute to their specified text (for
// example a clamp() expression), so time variables are resolved through a
// probe's animation-delay. animation-delay is used because the reduced-motion
// safety net in foundations.css forces transition-duration on every element.
const resolveIn = (element, property) => {
  const probe = document.createElement("span");
  probe.style.animationDelay = `var(${property})`;
  element.append(probe);
  const raw = getComputedStyle(element).getPropertyValue(property).trim();
  const resolved = getComputedStyle(probe).animationDelay;
  probe.remove();
  return /(ms|s)$/.test(raw) || /clamp|calc|var/.test(raw) ? resolved : raw;
};

const variable = (page, testId, name) => page.getByTestId(testId).evaluate(resolveIn, name);

// body inherits the :root vocabulary unchanged.
const rootVariable = (page, name) => page.locator("body").evaluate(resolveIn, name);

test.beforeEach(async ({ page }) => {
  await page.goto(fixture);
});

test("fault notification and banner use the standard preset; blocking faults use heavy", async ({ page }) => {
  const inertia = async (testId) => milliseconds(await variable(page, testId, "--ef-motion-inertia-duration"));
  const [alert, toast, notification, banner, blocking, dialog, popover] = await Promise.all(
    ["alert", "toast", "fault-notification", "fault-banner", "fault-blocking", "dialog", "popover"].map(inertia)
  );

  expect(notification).toBeCloseTo(alert, 3);
  expect(banner).toBeCloseTo(alert, 3);
  expect(toast).toBeCloseTo(alert, 3);
  expect(blocking).toBeCloseTo(dialog, 3);
  expect(popover).toBeLessThan(notification);
  expect(notification).toBeLessThan(blocking);

  for (const testId of ["fault-notification", "fault-banner"]) {
    expect(await variable(page, testId, "--ef-motion-mass")).toBe("1");
  }
  expect(await variable(page, "fault-blocking", "--ef-motion-mass")).toBe("1.8");
});

test("weight overrides order inertial timing while gravity timing stays mass independent", async ({ page }) => {
  const read = async (testId, name) => milliseconds(await variable(page, testId, name));
  const inertia = await Promise.all(["weight-light", "weight-standard", "weight-heavy"].map((id) => read(id, "--ef-motion-inertia-duration")));
  const exit = await Promise.all(["weight-light", "weight-standard", "weight-heavy"].map((id) => read(id, "--ef-motion-exit-duration")));
  const gravity = await Promise.all(["weight-light", "weight-standard", "weight-heavy"].map((id) => read(id, "--ef-motion-gravity-duration")));

  expect(inertia[0]).toBeLessThan(inertia[1]);
  expect(inertia[1]).toBeLessThan(inertia[2]);
  exit.forEach((value, index) => expect(value).toBeLessThan(inertia[index]));
  expect(Math.max(...gravity) - Math.min(...gravity)).toBeLessThan(0.5);
});

test("model-independent vocabulary resolves from shared design tokens", async ({ page }) => {
  expect(milliseconds(await rootVariable(page, "--ef-motion-perceptual-duration"))).toBe(
    milliseconds(await rootVariable(page, "--ef-primitive-motion-duration-fast"))
  );
  expect(milliseconds(await rootVariable(page, "--ef-motion-perceptual-emphasis-duration"))).toBe(
    milliseconds(await rootVariable(page, "--ef-primitive-motion-duration-standard"))
  );
  expect(await rootVariable(page, "--ef-motion-perceptual-easing")).toBe(await rootVariable(page, "--ef-primitive-motion-easing-standard"));
  expect(milliseconds(await rootVariable(page, "--ef-motion-cadence-period"))).toBe(1600);
  expect(await rootVariable(page, "--ef-motion-cadence-easing")).toBe("linear");
  expect(milliseconds(await rootVariable(page, "--ef-motion-direct-duration"))).toBe(0);
  expect(await rootVariable(page, "--ef-motion-direct-easing")).toBe("linear");

  // Perceptual timing is mass-free: heavy and light scopes see the same value.
  expect(await variable(page, "weight-heavy", "--ef-motion-perceptual-duration")).toBe(
    await variable(page, "weight-light", "--ef-motion-perceptual-duration")
  );
});

test("reduced motion collapses inertial and gravity timing for every weight scope", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();

  for (const testId of ["fault-notification", "fault-banner", "fault-blocking", "toast", "weight-heavy"]) {
    for (const name of ["--ef-motion-inertia-duration", "--ef-motion-gravity-duration", "--ef-motion-exit-duration", "--ef-motion-press-duration"]) {
      expect(milliseconds(await variable(page, testId, name))).toBeLessThan(0.1);
    }
  }
});
