// Structured diagnostics. Every resolver returns these instead of throwing or
// silently accepting invalid geometry.

export const CODES = Object.freeze({
  "unsatisfiable": "error",
  "non-convergence": "error",
  "oscillation": "error",
  "invalid-dimension": "error",
  "excessive-computation": "error",
  "numeric-instability": "error",
  "constraint-violation": "error",
  "hierarchy-inversion": "warning",
  "ignored-attribute": "warning"
});

export const diagnostic = (code, node, detail, data = {}) => Object.freeze({
  code,
  severity: CODES[code] ?? "error",
  node,
  detail,
  ...data
});

export const isError = d => d.severity === "error";
export const statusOf = diagnostics => (diagnostics.some(isError) ? "invalid" : "valid");
