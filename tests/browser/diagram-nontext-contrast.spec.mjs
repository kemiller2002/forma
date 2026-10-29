import fs from "node:fs";
import { expect, test } from "@playwright/test";

// R7-REM-009 (Rehearsal 6 UI-016-O11 / PF-016-O1): diagram outlines keep WCAG
// 1.4.11 non-text contrast (3:1). The documents are the real Forma.Workflow
// output for tests/fixtures/workflow-nontext/*.forma-workflow.json: the F#
// suite (NonTextContrastTests) renders them and checks these golden files
// byte for byte, together with the validator's findings for the regression.
const dir = "tests/fixtures/workflow-nontext";
const STATUS_NODES = ["warning", "danger", "success", "info", "check"];
const MODES = [
  { name: "light", media: { colorScheme: "light", forcedColors: "none" }, canvas: [0xf2, 0xef, 0xe7] },
  { name: "dark", media: { colorScheme: "dark", forcedColors: "none" }, canvas: [0x17, 0x1a, 0x18] },
  { name: "forced colours", media: { colorScheme: "light", forcedColors: "active" } }
];

const open = async (page, file, media) => {
  await page.emulateMedia(media);
  await page.goto("/tests/browser/fixture/index.html");
  const html = fs.readFileSync(`${dir}/${file}`, "utf8").replaceAll("node_modules/@echelon-foundry/design-system/dist/", "/dist/");
  await page.setContent(html, { waitUntil: "load" });
};

const channel = (value) => {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a, b) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};
const rgb = (css) => {
  const match = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(css);
  if (!match) throw new Error(`unparsed colour ${css}`);
  if (match[4] !== undefined && Number(match[4]) !== 1) throw new Error(`translucent colour ${css}`);
  return [1, 2, 3].map((i) => Number(match[i]));
};

// The painted outline and fill of a node: a diamond paints both on ::before.
const measureNode = (page, id) => page.locator(`#${id}`).evaluate((element) => {
  const diamond = element.dataset.efShape === "diamond";
  const style = getComputedStyle(element, diamond ? "::before" : null);
  return { diamond, top: style.borderTopColor, start: style.borderLeftColor, background: style.backgroundColor };
});
const canvasColor = (page) => page.locator(".ef-diagram__viewport").evaluate((element) => getComputedStyle(element).backgroundColor);

for (const { name, media, canvas: expectedCanvas } of MODES) {
  test(`status-token outlines rendered by Forma.Workflow reach 3:1 (${name})`, async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "computed-colour measurement is pinned to Chromium");
    await open(page, "status-outlines.document.html", media);
    for (const node of STATUS_NODES) {
      const id = `wf-status-outlines-n-${node}`;
      const { diamond, top, start, background } = await measureNode(page, id);
      if (node === "check") expect(diamond, "the diamond node is measured on ::before").toBe(true);
      for (const border of [top, start]) {
        const ratio = contrast(rgb(border), rgb(background));
        expect(ratio, `${id}: ${border} on ${background} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
      }
    }
    const canvas = await canvasColor(page);
    if (expectedCanvas) expect(rgb(canvas), `${name} surface`).toEqual(expectedCanvas);
    const edge = await page.locator("path.ef-diagram-connector").first().evaluate((element) => getComputedStyle(element).stroke);
    const ratio = contrast(rgb(edge), rgb(canvas));
    expect(ratio, `edge ${edge} on ${canvas} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
  });
}

test("negative control: the Rehearsal 6 outline is reported by the validator and measures below 3:1", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "computed-colour measurement is pinned to Chromium");
  const findings = fs.readFileSync(`${dir}/r6-regression.findings.txt`, "utf8");
  for (const pointer of ["/nodes/0/color/stroke", "/nodes/1/color/stroke", "/nodes/1/color/accent"]) {
    expect(findings).toContain(`A11Y-NONTEXT-CONTRAST ${pointer} `);
  }
  expect(findings).toContain("Stroke colour #e9a23b on fill #f5f3ed has contrast 1.95:1");

  await open(page, "r6-regression.document.html", { colorScheme: "light", forcedColors: "none" });
  for (const node of ["cause", "gate"]) {
    const { top, background } = await measureNode(page, `wf-r6-regression-n-${node}`);
    expect(rgb(top)).toEqual([0xe9, 0xa2, 0x3b]);
    expect(rgb(background)).toEqual([0xf5, 0xf3, 0xed]);
    expect(contrast(rgb(top), rgb(background))).toBeLessThan(3);
  }
});
