// Assembles packages/workflow/dist (@echelon-foundry/forma-workflow): the host
// element, editor CSS, iframe bridge, the published schema and capability
// contract, and the F# engine published to .NET WebAssembly. No bundler.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const pkg = resolve(root, "packages/workflow");
const dist = resolve(pkg, "dist");
const published = resolve(root, "build/workflow-wasm");

rmSync(dist, { recursive: true, force: true });
if (!process.argv.includes("--skip-engine")) {
  rmSync(published, { recursive: true, force: true });
  execFileSync("dotnet", ["publish", resolve(root, "src/workflow/Forma.Workflow.Wasm/Forma.Workflow.Wasm.csproj"), "-c", "Release", "-o", published], { stdio: "inherit" });
}
mkdirSync(dist, { recursive: true });
for (const file of readdirSync(resolve(pkg, "src"))) cpSync(resolve(pkg, "src", file), resolve(dist, file));
cpSync(resolve(root, "schemas/workflow/1.0/forma-workflow.schema.json"), resolve(dist, "forma-workflow.schema.json"));
cpSync(resolve(root, "contracts/workflow-capabilities.json"), resolve(dist, "workflow-capabilities.json"));
cpSync(resolve(published, "wwwroot/_framework"), resolve(dist, "engine/_framework"), { recursive: true });

const size = (dir) => readdirSync(dir).reduce((sum, name) => {
  const path = join(dir, name);
  return sum + (statSync(path).isDirectory() ? size(path) : statSync(path).size);
}, 0);
console.log(`@echelon-foundry/forma-workflow assembled at ${dist} (${(size(dist) / 1048576).toFixed(1)} MB including precompressed engine files)`);
