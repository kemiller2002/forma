// FORMA-NS-001: one build of tools/NamespaceMigrator for every test file.
//
// node --test runs test files concurrently. When each file ran its own
// `dotnet build -o <tmp>`, the builds shared the project's obj/ directory and
// raced: one could copy a half-written DLL (System.BadImageFormatException in
// the 1.0.2 publish run). Here the first caller builds under a lock into a
// directory named by a hash of the sources; every other caller waits for the
// lock and reuses that build. A finished build is moved into place with one
// rename, so a reader never sees a partial one.
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const project = "tools/NamespaceMigrator";
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

const sourceHash = () => {
  const hash = crypto.createHash("sha256");
  for (const file of fs.readdirSync(project).filter((f) => f.endsWith(".fs") || f.endsWith(".fsproj")).sort()) {
    hash.update(file).update(fs.readFileSync(path.join(project, file)));
  }
  return hash.digest("hex").slice(0, 16);
};

/** The path of a built forma-namespace-migrator.dll for the current sources. */
export const migratorDll = () => {
  const root = path.join(os.tmpdir(), `forma-nsm-build-${sourceHash()}`);
  const dll = path.join(root, "forma-namespace-migrator.dll");
  const lock = `${root}.lock`;
  const deadline = Date.now() + 10 * 60 * 1000;
  while (!fs.existsSync(dll)) {
    let owner = false;
    try {
      fs.mkdirSync(lock);
      owner = true;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      // A lock older than the build could take was left by a killed run.
      try {
        if (Date.now() - fs.statSync(lock).mtimeMs > 10 * 60 * 1000) fs.rmSync(lock, { recursive: true, force: true });
      } catch {}
    }
    if (owner) {
      try {
        if (!fs.existsSync(dll)) {
          const staging = fs.mkdtempSync(`${root}.staging-`);
          execFileSync("dotnet", ["build", `${project}/NamespaceMigrator.fsproj`, "-c", "Release", "-o", staging], { stdio: "pipe" });
          fs.renameSync(staging, root);
        }
      } finally {
        fs.rmSync(lock, { recursive: true, force: true });
      }
    } else {
      if (Date.now() > deadline) throw new Error(`timed out waiting for the migrator build lock ${lock}`);
      sleep(250);
    }
  }
  return dll;
};
