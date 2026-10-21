import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TASKS } from "../tasks/tasks.mjs";
import { renderTask } from "./render-task.mjs";

// Builds one isolated attempt workspace. A workspace contains only what the
// attempt needs: instructions, the task, the arm's guide and assets, a starter
// page and the validate command. It never contains another attempt's work,
// the scoring conditions, or the arm label.

const here = path.dirname(fileURLToPath(import.meta.url));
const experiment = path.resolve(here, "..");
const forma = path.resolve(experiment, "../..");

export const MAX_VALIDATIONS = 5;
export const ARMS = Object.freeze(["A", "B", "C", "D"]);

const guideFor = arm => path.join(experiment, "arms", arm === "C" || arm === "D" ? "relational" : arm, "GUIDE.md");

const head = (task, arm) => [
  `<meta charset="utf-8">`,
  `<meta name="viewport" content="width=device-width, initial-scale=1">`,
  `<title>${task.title}</title>`,
  `<link rel="stylesheet" href="assets/base.css">`,
  ...(arm === "B" ? [`<link rel="stylesheet" href="assets/forma.css">`] : []),
  ...(arm === "C" || arm === "D" ? [`<script type="module" src="assets/rlp/rlp.mjs"></script>`] : []),
  ...(arm === "A" || arm === "B" ? [`<style>\n  /* your CSS */\n</style>`] : [])
].map(line => `  ${line}`).join("\n");

const starter = (task, arm) => `<!doctype html>
<html lang="en">
<head>
${head(task, arm)}
</head>
<body>
  <!-- Build the page described in TASK.md here. -->
</body>
</html>
`;

export const agentInstructions = workspace => `# RLP-001 benchmark attempt

You are building one web page. Work only inside this directory:

    ${workspace}

Do not read, list, or search anything outside it. Other attempts and the
experiment's own files are off limits.

## Files

- \`TASK.md\`: what to build (requirements and acceptance criteria).
- \`GUIDE.md\`: how layout works in this environment. Follow it.
- \`index.html\`: the starter page. Write your page here.
- \`assets/\`: provided files. Do not modify them.
- \`validate\`: checks your page in a real browser.

## Procedure

1. Read \`TASK.md\` and \`GUIDE.md\`.
2. Write the complete page in \`index.html\`. Keep everything in that one
   file. Do not add JavaScript of your own (only scripts already in the
   starter page are allowed) and do not load external resources.
3. Run \`${path.join(workspace, "validate")}\`. The first run records your
   first draft. It checks your page at several widths and after the dynamic
   changes described in TASK.md, and prints any failures.
4. If it reports failures, fix \`index.html\` and run it again. You may run it
   at most ${MAX_VALIDATIONS} times in total. Stop when it passes or after the
   ${MAX_VALIDATIONS}th run.
5. End your reply with exactly one line:
   \`RESULT validation=<pass|fail> runs=<number of validate runs>\`
`;

export const workerPrompt = workspace => `You are an independent worker in a controlled experiment. Your workspace is ${workspace}. Read ${path.join(workspace, "AGENT.md")} and follow it exactly. Work only inside that directory.`;

const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
};

const formaBundle = () => ["tokens.css", "foundations.css", "components.css"]
  .map(file => fs.readFileSync(path.join(forma, "dist", file), "utf8"))
  .join("\n");

const engineFiles = () => ["dom.mjs", ...fs.readdirSync(path.join(experiment, "engine/core")).filter(f => f.endsWith(".mjs")).map(f => `core/${f}`)];

export const createWorkspace = ({ root, attemptId, taskId, arm }) => {
  const task = TASKS.find(t => t.id === taskId);
  if (!task) throw new Error(`unknown task ${taskId}`);
  if (!ARMS.includes(arm)) throw new Error(`unknown arm ${arm}`);
  const dir = path.join(root, attemptId);
  if (fs.existsSync(dir)) throw new Error(`workspace ${dir} already exists`);
  fs.mkdirSync(path.join(dir, ".rlp/snapshots"), { recursive: true });
  fs.writeFileSync(path.join(dir, "AGENT.md"), agentInstructions(dir));
  fs.writeFileSync(path.join(dir, "TASK.md"), renderTask(task));
  copy(guideFor(arm), path.join(dir, "GUIDE.md"));
  copy(path.join(experiment, "arms/base.css"), path.join(dir, "assets/base.css"));
  copy(path.join(experiment, "assets/placeholder.svg"), path.join(dir, "assets/placeholder.svg"));
  if (arm === "B") fs.writeFileSync(path.join(dir, "assets/forma.css"), formaBundle());
  if (arm === "C" || arm === "D") {
    engineFiles().forEach(f => copy(path.join(experiment, "engine", f), path.join(dir, "assets/rlp", f)));
    fs.copyFileSync(path.join(experiment, "engine", arm === "C" ? "rlp-rules.mjs" : "rlp-physics.mjs"), path.join(dir, "assets/rlp/rlp.mjs"));
  }
  fs.writeFileSync(path.join(dir, "index.html"), starter(task, arm));
  fs.writeFileSync(path.join(dir, "validate"), `#!/bin/sh\nexec node ${path.join(experiment, "harness/validate.mjs")} --workspace "${dir}" "$@"\n`, { mode: 0o755 });
  fs.writeFileSync(path.join(dir, ".rlp/meta.json"), JSON.stringify({ attemptId, taskId }, null, 2));
  return dir;
};
