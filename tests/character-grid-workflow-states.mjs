// States of the three-screen reference workflow as a consuming application
// would render them. Forma supplies the markup contract; deciding which state
// to render (validation outcome, empty result, service failure) is
// application behavior, so tests derive the states from the canonical pattern.
import fs from "node:fs";
import path from "node:path";

export const workflowSource = () =>
  fs.readFileSync(path.join(process.cwd(), "patterns", "character-grid-workflow.html"), "utf8");

const P = "character-grid-workflow";

const message = (screen, severity, role, word, text) =>
  `<p class="ef-character-grid__message" id="${P}-${screen}-message" role="${role}" data-ef-severity="${severity}" data-ef-row="21" data-ef-col="2" data-ef-len="78"><span class="ef-character-grid__severity"><span>${word}</span></span> ${text}</p>`;

const replaceMessage = (html, screen, replacement) =>
  html.replace(new RegExp(`<p class="ef-character-grid__message" id="${P}-${screen}-message"[^]*?</p>`), replacement);

const replaceRows = (html, rowsHtml) => html.replace(/<tbody>[^]*?<\/tbody>/, `<tbody>\n${rowsHtml}\n          </tbody>`);

export const states = {
  "inquiry-validation": html =>
    replaceMessage(
      html.replace(
        `id="${P}-cinq-dob" name="dob" type="text" maxlength="10" autocomplete="off" aria-describedby="${P}-cinq-dob-hint"`,
        `id="${P}-cinq-dob" name="dob" type="text" maxlength="10" autocomplete="off" value="2026-02-30" aria-invalid="true" aria-describedby="${P}-cinq-dob-hint ${P}-cinq-message"`
      ),
      "cinq",
      message("cinq", "validation", "alert", "INVALID", "CINQ003E Date of birth 2026-02-30 is not a valid date.")
    ),
  "inquiry-no-criteria": html =>
    replaceMessage(html, "cinq", message("cinq", "error", "alert", "ERROR", "CINQ001E Enter at least one search criterion.")),
  "history-empty": html =>
    replaceMessage(
      replaceRows(html, '          <tr><td colspan="5">No transactions between 2026-09-20 and 2026-09-27.</td></tr>')
        .replace('value="2026-08-01"', 'value="2026-09-20"')
        .replace(">Rows 1-12 of 37<", ">Rows 0 of 0   <")
        .replace(">More: +<", ">More: -<"),
      "trnh",
      message("trnh", "information", "status", "INFO", "TRNH004I No transactions in the selected period.")
    ),
  "history-error": html =>
    replaceMessage(
      replaceRows(html, '          <tr><td colspan="5">Transaction history is unavailable.</td></tr>')
        .replace(">Rows 1-12 of 37<", ">Rows unknown  <")
        .replace(">More: +<", ">More: -<")
        .replace(/(id="character-grid-workflow-trnh-title"[^]*?)<span class="ef-character-grid__indicator"><span>READY<\/span><\/span>/,
          '$1<span class="ef-character-grid__indicator" data-ef-state="inhibited"><span>X SYSTEM</span></span>'),
      "trnh",
      message("trnh", "error", "alert", "ERROR", "TRNH009E Transaction service did not respond. Press Reset, then Enter.")
    )
};

export const render = (name, html = workflowSource()) => (name === "default" ? html : states[name](html));
