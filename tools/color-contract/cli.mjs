#!/usr/bin/env node
import { loadColorContract, validateColorFiles } from "./index.mjs";

const args = process.argv.slice(2);
const usage = () => {
  console.error("usage: forma-color validate [--contract FILE] FILE...");
  process.exitCode = 2;
};

if (args.shift() !== "validate") usage();
else {
  let contractPath;
  const marker = args.indexOf("--contract");
  if (marker >= 0) {
    contractPath = args[marker + 1];
    if (!contractPath) usage();
    args.splice(marker, 2);
  }
  if (!args.length) usage();
  else {
    const findings = validateColorFiles(args, { contract: loadColorContract(contractPath) });
    for (const finding of findings) console.error(`${finding.file}:${finding.line}:${finding.column} ${finding.code} ${finding.message}`);
    if (findings.length) process.exitCode = 1;
    else console.log(`${args.length} file(s): valid Forma color references`);
  }
}
