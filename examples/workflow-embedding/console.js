// The host application's own code. It owns its domain: telemetry, saving,
// what a command means. It talks to <forma-workflow> only through the public
// host API (methods and forma-workflow-* events).
const live = document.getElementById("live");
const designer = document.getElementById("designer");
const fixtures = new URL("../workflows/forma/workflows/", import.meta.url);
const fetchWorkflow = async (id) => (await fetch(new URL(`${id}.forma-workflow.json`, fixtures))).json();

// --- live mission status: runtime projection -------------------------------------
const stages = ["collect", "seal", "ascend", "transfer", "land"];
let progress = 2;
const project = () => live.setRuntimeState(Object.fromEntries(stages.map((id, i) => [id,
  i < progress ? { state: "complete" } : i === progress ? { state: "active", label: "In progress" } : { state: "pending" }])));
live.addEventListener("forma-workflow-load", project);
document.getElementById("advance").addEventListener("click", () => { progress = Math.min(progress + 1, stages.length); project(); });
document.getElementById("reset").addEventListener("click", () => { progress = 0; project(); });
fetchWorkflow("embedded-view").then((doc) => live.load(doc));

// --- designer: editing with host-owned saving and commands ----------------------
const status = document.getElementById("host-status");
const selection = document.getElementById("host-selection");
const output = document.getElementById("host-document");
const intent = document.getElementById("host-intent");
let saved = null;

designer.addEventListener("forma-workflow-load", (e) => {
  status.textContent = `Loaded: ${e.detail.class}.`;
  saved = e.detail.workflow;
  output.textContent = JSON.stringify(saved, null, 2);
});
designer.addEventListener("forma-workflow-change", (e) => {
  // Only validated changes arrive here. The host decides when to persist.
  saved = e.detail.workflow;
  output.textContent = JSON.stringify(saved, null, 2);
  status.textContent = `${e.detail.description}. Draft saved (${e.detail.valid ? "valid" : "needs attention"}).`;
});
designer.addEventListener("forma-workflow-refused", (e) => { status.textContent = `Not changed: ${e.detail.message}`; });
designer.addEventListener("forma-workflow-selection", (e) => {
  selection.replaceChildren(...e.detail.objects.flatMap(({ type, id }) => {
    const dt = document.createElement("dt"); dt.textContent = type;
    const dd = document.createElement("dd"); dd.textContent = id;
    return [dt, dd];
  }));
});
designer.addEventListener("forma-workflow-intent", (e) => {
  // The workflow only declares intent; the application decides what it means.
  const what = e.detail.command ?? e.detail.action;
  intent.textContent = `The application received "${what}" for ${e.detail.object.type} ${e.detail.object.id}.`;
});
designer.addEventListener("forma-workflow-pick", (e) => {
  intent.textContent = `Picked ${e.detail.objects.map((o) => o.id).join(", ") || "nothing"}.`;
});
document.getElementById("mode").addEventListener("change", (e) => { designer.mode = e.target.value; });
fetchWorkflow("embedded-edit").then((doc) => designer.load(doc));

// --- isolated mode: same document, versioned message contract -------------------
const frame = document.getElementById("isolated");
const frameUrl = new URL("../../packages/workflow/dist/frame.html", import.meta.url);
frameUrl.searchParams.set("parent", location.origin);
frameUrl.searchParams.set("forma", new URL("../../dist/", import.meta.url).href);
frame.src = frameUrl.href;
const isolatedStatus = document.getElementById("isolated-status");
window.addEventListener("message", async (event) => {
  if (event.origin !== frameUrl.origin || event.source !== frame.contentWindow) return;
  const message = event.data;
  if (message?.protocol !== "forma-workflow-host/1") return;
  if (message.type === "frame-ready") {
    frame.contentWindow.postMessage({ protocol: "forma-workflow-host/1", id: 1, type: "load", document: await fetchWorkflow("swimlanes") }, frameUrl.origin);
  }
  if (message.type === "event" && message.event.type === "load") isolatedStatus.textContent = `Isolated workflow loaded: ${message.event.class}.`;
});
