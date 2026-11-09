import { test, expect } from "@playwright/test";
import { openFixture } from "./helpers.mjs";

test("brand scopes coexist without semantic-token leakage", async ({ page }) => {
  await openFixture(page);
  await page.locator("body").evaluate(body => {
    const shell = document.createElement("div");
    shell.innerHTML = [
      '<section id="brand-orchard" data-forma-brand="example-orchard"><button type="button">Action</button></section>',
      '<section id="brand-harbor" data-forma-brand="example-harbor"><button type="button">Action</button></section>'
    ].join("");
    body.append(shell);
  });

  const values = await page.evaluate(() => {
    const read = id => {
      const style = getComputedStyle(document.querySelector(id));
      return {
        accent: style.getPropertyValue("--forma-color-accent-primary").trim(),
        radius: style.getPropertyValue("--forma-primitive-radius-medium").trim()
      };
    };
    return {
      root: getComputedStyle(document.documentElement).getPropertyValue("--forma-color-accent-primary").trim(),
      orchard: read("#brand-orchard"),
      harbor: read("#brand-harbor")
    };
  });

  expect(values.root).toBe("#2b5ea8");
  expect(values.orchard).toEqual({ accent: "#6a2f7a", radius: "4px" });
  expect(values.harbor).toEqual({ accent: "#7a4a00", radius: "12px" });
});

test("explicit dark theme resolves inside a brand scope", async ({ page }) => {
  await openFixture(page);
  await page.locator("body").evaluate(body => {
    const element = document.createElement("section");
    element.id = "dark-brand";
    element.setAttribute("data-forma-brand", "example-harbor");
    element.setAttribute("data-forma-theme", "dark");
    element.textContent = "Dark branded surface";
    body.append(element);
  });

  const values = await page.locator("#dark-brand").evaluate(element => {
    const style = getComputedStyle(element);
    return {
      accent: style.getPropertyValue("--forma-color-accent-primary").trim(),
      surface: style.getPropertyValue("--forma-color-surface-primary").trim()
    };
  });

  expect(values).toEqual({ accent: "#d7a85b", surface: "#101820" });
});

test("skin presets override presentation primitives without changing brand tokens", async ({ page }) => {
  await openFixture(page);
  await page.locator("body").evaluate(body => {
    body.insertAdjacentHTML("beforeend", [
      '<section id="compact" data-forma-brand="example-orchard" data-forma-skin="compact">Compact</section>',
      '<section id="comfortable" data-forma-brand="example-orchard" data-forma-skin="comfortable">Comfortable</section>',
      '<section id="square" data-forma-brand="example-orchard" data-forma-skin="square">Square</section>'
    ].join(""));
  });

  const values = await page.evaluate(() => {
    const token = (selector, name) =>
      getComputedStyle(document.querySelector(selector)).getPropertyValue(name).trim();
    return {
      compactSpacing: token("#compact", "--forma-primitive-spacing-4"),
      comfortableSpacing: token("#comfortable", "--forma-primitive-spacing-4"),
      squareRadius: token("#square", "--forma-primitive-radius-medium"),
      compactAccent: token("#compact", "--forma-color-accent-primary")
    };
  });

  expect(values).toEqual({
    compactSpacing: "12px",
    comfortableSpacing: "20px",
    squareRadius: "0",
    compactAccent: "#6a2f7a"
  });
});
