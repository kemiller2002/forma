#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createColorContract } from "./index.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const brandFiles = fs.readdirSync(path.join(root, "brands")).filter(file => file.endsWith(".brand.json")).sort();
const contract = createColorContract({
  tokenDocument: read("tokens/echelon.tokens.json"),
  brands: brandFiles.map(file => ({ file: `brands/${file}`, document: read(`brands/${file}`) })),
  formaVersion: read("package.json").version
});
const output = path.join(root, "contracts/color-contract.json");
fs.writeFileSync(output, JSON.stringify(contract, null, 2) + "\n");
console.log(`color contract passed: ${contract.publicTokens.length} public tokens, ${contract.contexts.length} theme/brand contexts -> ${path.relative(root, output)}`);
