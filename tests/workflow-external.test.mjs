import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

// external producer -> .forma-workflow.json -> Forma validation -> Forma layout
// (an edit that rewrites the file) -> external consumer. The Studio half of the
// lifecycle is proved in kemiller2002/forma-studio (npm run proof:external).
const cli = (...args) => execFileSync("dotnet", ["run", "--project", "src/workflow/Forma.Workflow.Cli", "-c", "Release", "--", ...args], { encoding: "utf8" });

test("a workflow written from the schema alone validates, survives a Forma rewrite and reads back intact", () => {
  const dir = mkdtempSync(join(tmpdir(), "forma-external-"));
  const file = execFileSync("node", ["examples/external-producer/produce.mjs", dir], { encoding: "utf8" }).trim();
  const report = JSON.parse(cli("validate", "--json", file))[0].report;
  assert.equal(report.class, "supported-with-preserved-extensions");
  const rewritten = join(dir, "rewritten.forma-workflow.json");
  cli("layout", file, "--recompute", "--out", rewritten);
  const laidOut = JSON.parse(readFileSync(rewritten, "utf8"));
  assert.ok(laidOut.nodes.every((n) => typeof n.layout?.x === "number"), "layout written");
  const output = execFileSync("node", ["examples/external-producer/consume.mjs", file, rewritten], { encoding: "utf8" });
  assert.match(output, / 0 lost$/m);
  writeFileSync(join(dir, "consumer.log"), output);
});
