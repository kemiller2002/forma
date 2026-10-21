// Relational layout engine entry point (X1: hierarchy-derived spacing).
import { mountAll } from "./dom.mjs";
import { deriveHierarchy } from "./variants/hierarchy.mjs";

const start = () => mountAll("rules", deriveHierarchy);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();
