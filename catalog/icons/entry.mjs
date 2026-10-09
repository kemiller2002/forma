// Shared, immutable semantic guidance for generated Forma icon pages.
// Do not duplicate geometry or application state here.
export const entry = (meaning, useFor, avoid, actionLabel, related) =>
  Object.freeze({ meaning, useFor: Object.freeze(useFor), avoid: Object.freeze(avoid), actionLabel, related: Object.freeze(related) });
