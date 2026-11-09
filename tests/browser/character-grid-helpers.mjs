import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "dist", "all.css"), "utf8");
export const pattern = name => fs.readFileSync(path.join(root, "patterns", `${name}.html`), "utf8");

export const gridDocument = (source, { rootFontSize = "100%", extraCss = "" } = {}) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CharacterGrid test</title>
  <style>${css}</style>
  <style>html { font-size: ${rootFontSize}; } html, body { margin: 0; } body { padding: 1rem; } ${extraCss}</style>
</head>
<body><main>${source}</main></body>
</html>`;

// Compares every run's rendered box with the cell its attributes declare.
export const measureGrid = page => page.evaluate(() => {
  const px = value => Number.parseFloat(value);
  return [...document.querySelectorAll(".forma-character-grid")].map(grid => {
    const surface = grid.querySelector(".forma-character-grid__surface");
    const style = getComputedStyle(surface);
    const columns = style.gridTemplateColumns.split(" ").map(px);
    const rows = style.gridTemplateRows.split(" ").map(px);
    const box = surface.getBoundingClientRect();
    const originX = box.left + px(style.paddingLeft) + px(style.borderLeftWidth);
    const originY = box.top + px(style.paddingTop) + px(style.borderTopWidth);
    const runs = [...surface.querySelectorAll("[data-forma-row]")].map(run => {
      const rect = run.getBoundingClientRect();
      const row = Number(run.dataset.formaRow);
      const col = Number(run.dataset.formaCol);
      const len = Number(run.dataset.formaLen);
      const height = Number(run.dataset.formaHeight ?? 1);
      return {
        id: run.id || `${run.tagName.toLowerCase()}:${row}:${col}`,
        dx: rect.left - (originX + (col - 1) * columns[0]),
        dy: rect.top - (originY + (row - 1) * rows[0]),
        dw: rect.width - len * columns[0],
        dh: rect.height - height * rows[0],
        scrollOverflow: run.scrollWidth - run.clientWidth
      };
    });
    const viewport = grid.querySelector(".forma-character-grid__viewport");
    return {
      columnCount: columns.length,
      rowCount: rows.length,
      applicationRows: Number(grid.dataset.formaRows),
      statusRows: Number(grid.dataset.formaStatusRows ?? 0),
      columnWidth: columns[0],
      rowPitch: rows[0],
      uniformColumns: columns.every(width => Math.abs(width - columns[0]) < 0.01),
      uniformRows: rows.every(height => Math.abs(height - rows[0]) < 0.01),
      runs,
      viewportScrolls: viewport.scrollWidth > viewport.clientWidth + 1,
      pageWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      viewportWidth: document.documentElement.clientWidth,
      display: style.display
    };
  });
});

