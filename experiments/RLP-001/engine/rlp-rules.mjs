// Relational layout engine entry point.
import { mountAll } from "./dom.mjs";

const start = () => mountAll("rules");
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();
