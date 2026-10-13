// Regression fixtures for shared Forma geometry defects reported by consumer
// applications (HelixNote, Forma Studio, Summa, Signal) and measured against
// visual-engineering/UI-LAYOUT-INTERACTION@1.0.0. Each test renders real Forma
// CSS (site-dist/assets/forma.css) and the reported markup at the reported
// widths and text sizes.
import { expect, test } from "@playwright/test";
import {
  STATUS,
  expectNoOverflow,
  expectPeerAlignment,
  formatReport,
  measureAlignment,
  measureOverflow,
  scaleDefaultText
} from "./ui-conformance-helpers.mjs";
import { loadCatalog } from "../../tools/catalog/load.mjs";
import { wrapTag } from "../../tools/catalog/html.mjs";

const catalog = await loadCatalog(process.cwd());
const component = slug => catalog.components.find(item => item.slug === slug);
const example = (slug, id) => (id === "basic" ? wrapTag(slug, component(slug).pattern) : component(slug).examples.find(item => item.id === id).html);

const fixtureDocument = body => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/site-dist/assets/forma.css">
<style>body { margin: 0; padding: 12px; }</style></head><body><main>${body}</main></body></html>`;

const render = async (page, body, { width = 1280, scale = 1 } = {}) => {
  await page.setViewportSize({ width, height: 900 });
  await page.route("**/__fixture.html", route => route.fulfill({ contentType: "text/html", body: fixtureDocument(body) }));
  await page.goto("/__fixture.html");
  if (scale !== 1) await scaleDefaultText(page, scale);
};

const NARROW = [320, 390];

test.describe("ULI-L02 equivalent single-line controls share one intrinsic height (Studio, Summa)", () => {
  const types = ["text", "email", "password", "search", "tel", "url", "number", "date", "time", "datetime-local"];
  const roleOf = type => ({ number: "spinbutton", search: "searchbox" })[type] ?? "textbox";
  // One non-wrapping row of controls, so equal tops are given and equal
  // bottoms mean equal heights.
  const row = `<div style="display: flex; flex-wrap: nowrap; align-items: flex-start; gap: 4px">
    ${types.map(type => `<input type="${type}" aria-label="Field ${type}" style="inline-size: 7rem; flex: none">`).join("")}
    <select aria-label="Field select" style="inline-size: 7rem; flex: none"><option>One</option></select>
  </div>`;
  const peers = [...types.map(type => ({ role: roleOf(type), name: `Field ${type}` })), { role: "combobox", name: "Field select" }];

  for (const scale of [1, 2]) {
    test(`text, date, time, number and select controls have equal heights at ${scale * 100}% text`, async ({ page }) => {
      await render(page, row, { scale });
      // Equal tops (the row aligns them) plus equal bottoms means equal heights.
      await expectPeerAlignment(page, { ruleId: "ULI-L02", id: "control-tops", edge: "top", peers });
      await expectPeerAlignment(page, { ruleId: "ULI-L02", id: "control-bottoms", edge: "bottom", peers });
    });
  }
});

test("ULI-L01 a stretched field keeps its control directly under its label (Summa)", async ({ page }) => {
  await render(page, `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem">
    <div class="ef-field"><label class="ef-field__label" for="a">Reference</label><input id="a"></div>
    <div class="ef-field"><label class="ef-field__label" for="b">Carrier</label>
      <span class="ef-field__description">The company that collects the parcel. Shown on the label and in tracking emails sent to the customer.</span><input id="b"></div>
  </div>`, { width: 640 });
  const gap = await page.evaluate(() => {
    const label = document.querySelector('label[for="a"]').getBoundingClientRect();
    const input = document.getElementById("a").getBoundingClientRect();
    return input.top - label.bottom;
  });
  expect(gap).toBeGreaterThanOrEqual(7);
  expect(gap).toBeLessThanOrEqual(9);
});

test("ULI-L05 action labels in table cells never split mid-word at 768px (Summa)", async ({ page }) => {
  await render(page, `<table><thead><tr><th>Request</th><th>Requested by</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    ${["Quarterly infrastructure capacity review", "Vendor security questionnaire renewal"].map(name => `<tr><td>${name}</td><td>Priya Raman, Platform Engineering</td><td>Waiting for second approver since Monday</td>
      <td><div class="ef-cluster"><button type="button">Approve request</button><button type="button">Reassign</button></div></td></tr>`).join("")}
  </tbody></table>`, { width: 768 });
  const splitWords = await page.locator("td button").evaluateAll(buttons => buttons.flatMap(button => {
    const text = button.firstChild;
    const words = [...text.textContent.matchAll(/\S+/g)];
    return words.filter(match => {
      const range = document.createRange();
      range.setStart(text, match.index);
      range.setEnd(text, match.index + match[0].length);
      return new Set([...range.getClientRects()].map(rect => Math.round(rect.top))).size > 1;
    }).map(match => `${button.textContent}: "${match[0]}"`);
  }));
  expect(splitWords).toEqual([]);
});

test.describe("ULI-L05 no horizontal overflow at 320 and 390px with 200% text", () => {
  const cases = [
    ["data-grid narrow label column (HelixNote)", "data-grid", ["basic", "descending-sort", "wide-record-set", "mobile-record-projection"]],
    ["status lozenge wraps (HelixNote)", "status-lozenge", ["basic", "environment-table"]],
    ["record header with long identity", "record-header", ["basic", "long-identity"]]
  ];
  for (const [label, slug, ids] of cases) {
    for (const width of NARROW) {
      test(`${label} at ${width}px`, async ({ page }) => {
        const findings = [];
        for (const id of ids) {
          await render(page, example(slug, id), { width, scale: 2 });
          const report = await measureOverflow(page);
          if (report.status !== STATUS.PASS) findings.push(`${slug}/${id}: ${report.reason}\n  ${report.escapes.join("\n  ")}`);
        }
        expect(findings, findings.join("\n")).toEqual([]);
      });
    }
  }

  for (const width of NARROW) {
    test(`fieldset form with a long select option at ${width}px (HelixNote)`, async ({ page }) => {
      await render(page, `<form class="ef-stack"><fieldset class="ef-stack"><legend>Delivery preferences for this order</legend>
        <div class="ef-field"><label class="ef-field__label" for="d">Delivery option</label>
          <select id="d"><option>Next working day before 12:00 with a signature on delivery and photo confirmation</option></select></div>
        <div class="ef-field"><label class="ef-field__label" for="w">Preferred date</label><input id="w" type="date"></div>
      </fieldset></form>`, { width, scale: 2 });
      await expectNoOverflow(page);
    });

    for (const scale of [1, 2]) {
      test(`best-worst option with a long unbroken word at ${width}px, ${scale * 100}% text (Signal)`, async ({ page }) => {
        await render(page, `<fieldset class="ef-best-worst"><legend>Which matters most and least?</legend>
          <div class="ef-best-worst__header" aria-hidden="true"><span>Option</span><span>Best</span><span>Worst</span></div>
          <div class="ef-best-worst__row"><span id="o1">Ultraschallreinigungsgerätewartungsvertrag</span>
            <label><input type="radio" name="best" aria-labelledby="o1"></label><label><input type="radio" name="worst" aria-labelledby="o1"></label></div>
          <div class="ef-best-worst__row"><span id="o2">Delivery speed</span>
            <label><input type="radio" name="best" aria-labelledby="o2"></label><label><input type="radio" name="worst" aria-labelledby="o2"></label></div>
        </fieldset>`, { width, scale });
        await expectNoOverflow(page);
      });
    }
  }
});

test.describe("ULI-L01/L07 record header status is centred on the title row (HelixNote)", () => {
  for (const width of [768, 1280]) {
    test(`at ${width}px`, async ({ page }) => {
      await render(page, example("record-header", "basic"), { width });
      const report = await measureAlignment(page, {
        ruleId: "ULI-L07",
        id: "record-title-and-status",
        edge: "center",
        scope: page.locator("header.ef-record-header"),
        peers: [{ role: "heading", name: "INV-1042" }, { role: "text", name: "Overdue" }]
      });
      expect(report.status, formatReport(report)).toBe(STATUS.PASS);
    });
  }
});
