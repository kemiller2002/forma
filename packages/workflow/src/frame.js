// Isolated (iframe) mode for <forma-workflow>. The parent page talks to this frame
// with window.postMessage using the same portable workflow document and the
// versioned contract forma-workflow-host/1. Only the origin named in ?parent= is
// accepted and answered. See docs/workflow/EMBEDDING.md, "Isolated mode".
import { PROTOCOL } from "./forma-workflow.js";

const params = new URLSearchParams(location.search);
const parentOrigin = params.get("parent");
const formaBase = params.get("forma");
const element = document.getElementById("workflow");

if (formaBase) {
  for (const file of ["tokens.css", "foundations.css", "components.css"]) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL(file, formaBase).href;
    document.head.prepend(link);
  }
}
if (params.get("brand")) document.documentElement.dataset.efBrand = params.get("brand");

const post = (message) => {
  if (parentOrigin) window.parent.postMessage({ protocol: PROTOCOL, ...message }, parentOrigin);
};

for (const type of ["ready", "load", "change", "selection", "focus", "intent", "pick", "refused", "error"]) {
  element.addEventListener(`forma-workflow-${type}`, (event) => post({ type: "event", event: { type, ...(event.detail ?? {}) } }));
}

window.addEventListener("message", async (event) => {
  if (!parentOrigin || event.origin !== parentOrigin || event.source !== window.parent) return;
  const message = event.data;
  if (!message || message.protocol !== PROTOCOL) return;
  const reply = (body) => post({ type: "reply", id: message.id, ...body });
  try {
    switch (message.type) {
      case "load": await element.load(message.document); reply({ ok: true }); break;
      case "mode": element.mode = message.mode; reply({ ok: true }); break;
      case "command": await element.execute(message.command); reply({ ok: true }); break;
      case "select": await element.select(message.objects); reply({ ok: true }); break;
      case "focus": await element.focusObject(message.object); reply({ ok: true }); break;
      case "runtime": await element.setRuntimeState(message.states); reply({ ok: true }); break;
      case "undo": await element.undo(); reply({ ok: true }); break;
      case "redo": await element.redo(); reply({ ok: true }); break;
      case "get": reply({ ok: true, workflow: await element.getWorkflow() }); break;
      default: reply({ ok: false, error: `unknown message type ${message.type}` });
    }
  } catch (error) {
    reply({ ok: false, error: String(error && error.message || error) });
  }
});

post({ type: "frame-ready" });
