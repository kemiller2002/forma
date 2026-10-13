// Declared alignment groups of catalog examples
// (visual-engineering/UI-LAYOUT-INTERACTION@1.0.0 ULI-L01, L02, L09), measured
// on the published documentation at every contract width and at the default
// and doubled text size. Peers that wrap onto separate visual rows are not
// compared with each other; peers that share a row must share the declared
// edge within tolerance, and wrapped rows must follow source order.
import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  CONTRACT_WIDTHS,
  DEFAULT_TOLERANCE_CSS_PX,
  STATUS,
  evaluateAlignment,
  formatReport,
  measureAlignment,
  scaleDefaultText
} from "./ui-conformance-helpers.mjs";
import { loadCatalog } from "../../tools/catalog/load.mjs";
import { exampleAlignments } from "../../tools/catalog/alignment.mjs";

const catalog = await loadCatalog(process.cwd());
const TEXT_SCALES = [1, 2];

// Partition measured peers into visual rows in source order: a peer starts a
// new row when it does not sit to the right of the previous peer.
const visualRows = measurements => measurements.reduce((rows, item, index) => {
  const previous = measurements[index - 1];
  const sameRow = previous && item.box.x >= previous.box.x + previous.box.width - 0.5;
  return sameRow ? [...rows.slice(0, -1), [...rows.at(-1), item]] : [...rows, [item]];
}, []);

const evaluateRows = (group, report) => {
  const rows = visualRows(report.measurements);
  const rowReports = rows.filter(row => row.length >= 2).map((row, index) => evaluateAlignment(
    { ...group, id: `${group.id}#row${index + 1}`, peers: row.map(item => group.peers[report.measurements.indexOf(item)]) },
    row.map(item => ({ peer: group.peers[report.measurements.indexOf(item)], count: 1, box: item.box }))));
  const ordered = rows.every((row, index) => index === 0 ||
    Math.min(...row.map(item => item.box.y)) >= Math.max(...rows[index - 1].map(item => item.box.y + item.box.height)) - DEFAULT_TOLERANCE_CSS_PX);
  return { rows: rows.map(row => row.length), rowReports, ordered };
};

for (const component of catalog.components) {
  for (const item of exampleAlignments(component)) {
    test(`ULI-L01 ${component.slug} / ${item.id}: declared groups align at contract widths and text sizes`, async ({ page }) => {
      test.slow();
      const url = item.mobile
        ? `/site-dist/components/${component.slug}/mobile-${item.id}.html`
        : `/site-dist/components/${component.slug}/index.html`;
      const scope = item.mobile ? page.locator("body") : page.locator(`#example-${item.id} > .example-canvas`);
      const findings = [];
      for (const scale of TEXT_SCALES) {
        for (const width of CONTRACT_WIDTHS) {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(url);
          if (scale !== 1) await scaleDefaultText(page, scale);
          for (const group of item.groups) {
            const report = await measureAlignment(page, { ...group, scope });
            const where = `${width}px, text ${scale * 100}%`;
            if (report.status === STATUS.UNKNOWN) { findings.push(`${where}: ${formatReport(report)}`); continue; }
            const { rows, rowReports, ordered } = evaluateRows(group, report);
            rowReports.filter(row => row.status !== STATUS.PASS).forEach(row => findings.push(`${where} (rows ${rows.join("+")}): ${formatReport(row)}`));
            if (!ordered) findings.push(`${where}: ${group.id} wrapped rows are not in source order`);
          }
        }
      }
      expect(findings, findings.join("\n")).toEqual([]);
    });
  }
}
