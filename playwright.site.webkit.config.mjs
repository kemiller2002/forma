// Targeted WebKit regression coverage for iOS Safari-reported documentation
// layout bugs. The broad Forma docs crawl continues to run in Chromium.
import { defineConfig } from "@playwright/test";
import site from "./playwright.site.config.mjs";

export default defineConfig({
  ...site,
  testMatch: "responsive-navigation.spec.mjs",
  projects: [
    { name: "webkit-responsive-site", use: { browserName: "webkit" } }
  ]
});
