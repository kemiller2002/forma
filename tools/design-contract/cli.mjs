#!/usr/bin/env node
import fs from "node:fs";
import { renderDesignContract, validateDesignContract } from "./index.mjs";

const [, , command, ...files] = process.argv;
const failUsage = () => {
  console.error("usage: node tools/design-contract/cli.mjs validate FILE... | render FILE [OUTPUT]");
  process.exitCode = 2;
};
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));

if (command === "validate" && files.length) {
  let failed = false;
  for (const file of files) {
    const findings = validateDesignContract(read(file));
    if (!findings.length) console.log(`${file}: valid`);
    else {
      failed = true;
      for (const item of findings) console.error(`${file}: ${item.code} ${item.path}: ${item.message}`);
    }
  }
  if (failed) process.exitCode = 1;
} else if (command === "render" && files.length >= 1 && files.length <= 2) {
  try {
    const html = renderDesignContract(read(files[0]));
    if (files[1]) fs.writeFileSync(files[1], html);
    else process.stdout.write(html);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
} else failUsage();
