import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

// FORMA-A11Y-002: every documented pattern meets WCAG AA text contrast in
// every theme and brand Forma ships, and in forced-colors mode. The theme,
// brand and pattern lists are read from the token source, the brand index and
// patterns/, so a new theme, brand or pattern is covered without editing this
// file.
//
// Every pattern is rendered verbatim, as consumers copy it, against the
// complete built surface (dist/all.css plus every brand). Each pattern sits in
// its own transformed, paint-contained section, so fixed-position overlays
// (toasts, notifications, sticky bars) stay inside their own pattern instead
// of covering a neighbour. axe's color-contrast rule then runs once per
// context and every failure is attributed to its pattern.

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const tokens = JSON.parse(read("tokens/echelon.tokens.json"));
const brands = JSON.parse(read("dist/brands/index.json")).brands;
const stylesheet = [
  read("dist/all.css"),
  ...brands.map((brand) => read(path.join("dist/brands", brand.css)))
].join("\n");

const patterns = fs.readdirSync(path.join(root, "patterns"))
  .filter((file) => file.endsWith(".html"))
  .sort();

// Documented compositions consumers build from those patterns: a field hint
// (.ef-field__description) and a link inside .ef-surface, and an inline fault
// inside a surface. Vigila's #token-note hint is the first of these.
const compositions = {
  "composition: field hint on .ef-surface": `<section class="ef-surface"><h2>Access token</h2><p>Paste the token issued by your administrator. <a href="#rotate">Rotate tokens</a>.</p><div class="ef-field"><label class="ef-field__label" for="token">Token</label><span class="ef-field__description" id="token-note">Tokens expire after 30 days.</span><input id="token" aria-describedby="token-note"></div></section>`,
  "composition: kicker on .ef-surface": `<section class="ef-surface"><p class="ef-component-kicker">Evidence</p><h2>Boundary review</h2><p>Reviewed against the current boundary.</p></section>`,
  "composition: inline fault on .ef-surface": `<section class="ef-surface">${read("patterns/fault-inline.html")}</section>`
};

const theme = (id, scheme = "light") => ({ id, attributes: id === "light" ? {} : { "data-ef-theme": id }, media: { colorScheme: scheme } });
const isDark = (id) => /dark/.test(id);

// light is the :root default; dark is reachable both by attribute and by the
// operating-system preference; every other semantic theme is opt-in.
const contexts = [
  theme("light"),
  { id: "os-dark", attributes: {}, media: { colorScheme: "dark" } },
  ...Object.keys(tokens.semantic)
    .filter((id) => id !== "light")
    .sort()
    .map((id) => theme(id, isDark(id) ? "dark" : "light")),
  ...brands.flatMap((brand) => ["light", "dark"].map((scheme) => ({
    id: `brand ${brand.id} ${scheme}`,
    attributes: { "data-ef-brand": brand.id, "data-ef-theme": scheme },
    media: { colorScheme: scheme }
  }))),
  ...["light", "dark"].map((scheme) => ({
    id: `forced-colors ${scheme}`,
    attributes: scheme === "dark" ? { "data-ef-theme": "dark" } : {},
    media: { colorScheme: scheme, forcedColors: "active" }
  })),
  ...brands.map((brand) => ({
    id: `forced-colors brand ${brand.id}`,
    attributes: { "data-ef-brand": brand.id },
    media: { colorScheme: "light", forcedColors: "active" }
  }))
];

const escapeAttribute = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const page = (context) => `<!doctype html>
<html lang="en"${Object.entries(context.attributes).map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`).join("")}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pattern contrast: ${context.id}</title>
  <style>${stylesheet}</style>
  <style>
    .contrast-harness { display: grid; gap: 2rem; padding: 1.5rem; }
    .contrast-harness > section { position: relative; transform: translateZ(0); contain: paint; min-block-size: 4rem; }
  </style>
</head>
<body>
  <main class="contrast-harness">
${patterns.map((pattern) => `    <section data-pattern="${pattern}">\n${read(path.join("patterns", pattern))}\n    </section>`).join("\n")}
${Object.entries(compositions).map(([name, markup]) => `    <section data-pattern="${name}">\n${markup}\n    </section>`).join("\n")}
  </main>
</body>
</html>`;

test.describe("documented pattern contrast", () => {
  // Forced-colors emulation is a Chromium capability, and the contrast
  // arithmetic is engine-independent, so the matrix runs once, in Chromium.
  test.skip(({ browserName }) => browserName !== "chromium", "contrast matrix runs in Chromium");
  test.describe.configure({ timeout: 120_000 });

  test("the harness covers every pattern, theme and brand", () => {
    expect(patterns.length).toBeGreaterThan(100);
    expect(contexts.map((context) => context.id)).toEqual(expect.arrayContaining(["light", "dark", "forced-colors light", "forced-colors dark"]));
    for (const brand of brands) expect(contexts.some((context) => context.attributes["data-ef-brand"] === brand.id)).toBe(true);
  });

  for (const context of contexts) {
    test(`every pattern meets WCAG AA contrast: ${context.id}`, async ({ page: browserPage }) => {
      await browserPage.emulateMedia({ reducedMotion: "reduce", ...context.media });
      await browserPage.setContent(page(context));
      await expect(browserPage.locator("section[data-pattern]")).toHaveCount(patterns.length + Object.keys(compositions).length);

      const results = await new AxeBuilder({ page: browserPage }).withRules(["color-contrast"]).analyze();
      const failures = [];
      for (const violation of results.violations) {
        for (const node of violation.nodes) {
          const pattern = await browserPage.evaluate((selector) =>
            document.querySelector(selector)?.closest("section[data-pattern]")?.dataset.pattern ?? "(harness)",
          node.target[0]);
          failures.push(`${pattern}: ${node.target.join(" ")} — ${node.failureSummary.replace(/\s+/g, " ").replace(/^Fix any of the following: /, "").trim()}`);
        }
      }

      expect(failures, `contrast failures in ${context.id}`).toEqual([]);
    });
  }
});
