import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { ECHELON_PALETTE } from "../../tools/brand-neutrality.mjs";

// BNR-001.4 (EDS-ADR-002): a third party renders Forma with its own brand and
// sees no Echelon value anywhere. Every canonical pattern is rendered with
// Forma's CSS plus an unrelated example brand, in light and dark, and every
// computed color of every element and pseudo-element is checked against the
// Echelon palette Forma shipped through 0.14.0.
const patterns = fs.readdirSync("patterns").filter((file) => file.endsWith(".html")).sort()
  .map((file) => fs.readFileSync(path.join("patterns", file), "utf8"));
const echelonRgb = [...ECHELON_PALETTE].map((hex) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)).join(", "));

const page = (brand, theme) => `<!doctype html>
<html lang="en"${brand ? ` data-forma-brand="${brand}"` : ""}${theme ? ` data-forma-theme="${theme}"` : ""}>
<head>
  <meta charset="utf-8">
  <title>Third-party isolation</title>
  <link rel="stylesheet" href="/dist/all.css">
  ${brand ? `<link rel="stylesheet" href="/dist/brands/${brand}.css">` : ""}
</head>
<body>
  <main>${patterns.join("\n")}</main>
</body>
</html>`;

const scan = (rgb) => {
  const properties = ["color", "background-color", "background-image", "border-top-color", "border-right-color", "border-bottom-color",
    "border-left-color", "outline-color", "text-decoration-color", "caret-color", "column-rule-color", "fill", "stroke", "box-shadow",
    "text-shadow", "accent-color"];
  const leaks = [];
  const check = (element, pseudo, style) => {
    for (const property of properties) {
      const value = style.getPropertyValue(property);
      for (const color of rgb) {
        if (value.includes(`(${color})`) || value.includes(`(${color},`)) {
          leaks.push(`${element.tagName.toLowerCase()}.${[...element.classList].join(".")}${pseudo} ${property}: ${value}`);
        }
      }
    }
  };
  for (const element of document.querySelectorAll("*")) {
    check(element, "", getComputedStyle(element));
    for (const pseudo of ["::before", "::after", "::marker", "::placeholder"]) check(element, pseudo, getComputedStyle(element, pseudo));
  }
  const root = getComputedStyle(document.documentElement);
  const custom = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules].map((rule) => rule.cssText))
    .join("\n").match(/--forma-[a-z0-9-]+/g) ?? [];
  return { leaks, elements: document.querySelectorAll("*").length, customValues: [...new Set(custom)].map((name) => root.getPropertyValue(name).trim()) };
};

for (const [brand, theme] of [["example-orchard", "light"], ["example-orchard", "dark"], ["example-harbor", "dark"], [null, "light"], [null, "dark"]]) {
  test(`Forma ${brand ? `+ ${brand}` : "default"} (${theme}): no Echelon value in any computed style`, async ({ page: browser }) => {
    await browser.route("**/isolation.html", (route) => route.fulfill({ contentType: "text/html", body: page(brand, theme) }));
    await browser.goto("/isolation.html");
    const result = await browser.evaluate(scan, echelonRgb);
    expect(result.elements).toBeGreaterThan(1000);
    expect(result.leaks).toEqual([]);
    const hexes = result.customValues.flatMap((value) => value.match(/#[0-9a-f]{6}\b/gi) ?? []).map((hex) => hex.toLowerCase());
    expect(hexes.filter((hex) => ECHELON_PALETTE.has(hex))).toEqual([]);
  });
}

test("the isolation scan detects a planted Echelon color", async ({ page: browser }) => {
  await browser.route("**/isolation.html", (route) => route.fulfill({ contentType: "text/html",
    body: page("example-orchard", "light").replace("</head>", "<style>.forma-button { border-color: #905831; }</style></head>") }));
  await browser.goto("/isolation.html");
  const result = await browser.evaluate(scan, echelonRgb);
  expect(result.leaks.some((leak) => leak.includes("border-top-color"))).toBe(true);
});
