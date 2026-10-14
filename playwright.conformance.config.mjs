import { defineConfig } from "@playwright/test";

// `npm run ui:conformance`: visual-engineering/UI-LAYOUT-INTERACTION@1.0.0
// evidence for Forma. Runs the helper self-tests, every declared live action,
// every declared alignment group, the shared-geometry regressions, the site
// and marketing audit, and the catalog-wide text-scale sweep. Chromium only:
// text scaling uses the Chromium DevTools protocol.
export default defineConfig({
  testDir: "./tests",
  testMatch: [
    "site-browser/ui-conformance-helpers.spec.mjs",
    "site-browser/catalog-interactions.spec.mjs",
    "site-browser/catalog-alignment.spec.mjs",
    "site-browser/forma-geometry.spec.mjs",
    "site-browser/site-conformance.spec.mjs",
    "conformance/*.spec.mjs"
  ],
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  timeout: 180_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure"
  },
  projects: [
    { name: "chromium-conformance", use: { browserName: "chromium" } }
  ],
  webServer: {
    command: "node tools/serve-tests.mjs",
    url: "http://127.0.0.1:4173/site-dist/index.html",
    reuseExistingServer: !process.env.CI
  }
});
