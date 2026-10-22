import fs from "node:fs";
import { expect, test } from "@playwright/test";

const { version } = JSON.parse(fs.readFileSync("package.json", "utf8"));

test("production site exposes the exact built Forma version", async ({ page }) => {
  await page.goto("/site-dist/index.html");
  const runtime = await page.evaluate(() => window.__ECHELON_RUNTIME__);
  expect(runtime).toEqual({ schemaVersion: 1, libraries: { forma: { version } } });
});
