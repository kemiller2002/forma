// Shared by the adapters in index.mjs and geometry.mjs.

export const pageOf = root => (typeof root.page === "function" ? root.page() : root);

// Wait until web fonts have loaded and two animation frames have elapsed.
export const settleFontsAndFrames = root =>
  pageOf(root).evaluate(() => document.fonts.ready.then(() =>
    new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))));
