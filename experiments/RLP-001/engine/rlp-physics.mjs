// Relational layout engine entry point.
import { mountAll } from "./dom.mjs";

const start = () => mountAll("physics");
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();
