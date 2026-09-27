// Static conformance checks for CharacterGrid markup
// (requirements/CHARACTER-GRID.md, rules CG-1 to CG-12).
//
// These rules cannot be enforced by CSS: a collision or an out-of-bounds run
// renders, it is simply wrong. They are therefore checked on the canonical
// patterns and are available to consuming applications as a build-time check:
//
//   node tools/character-grid-conformance.mjs patterns/character-grid.html
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { LIMITS } from "./character-grid-css.mjs";

const TAG = /<([a-zA-Z][\w-]*)((?:\s+[^\s=>]+(?:="[^"]*")?)*)\s*\/?>/g;
const ATTRIBUTE = /([^\s=]+)(?:="([^"]*)")?/g;

const attributesOf = (source) =>
  Object.fromEntries([...source.matchAll(ATTRIBUTE)].map(([, name, value]) => [name, value ?? ""]));

const classesOf = (attributes) => (attributes.class ?? "").split(/\s+/).filter(Boolean);

const decode = (text) =>
  text
    .replaceAll("&nbsp;", " ")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");

// Text of an element up to its first matching close tag, without markup.
const innerText = (html, tag, from) => {
  const close = html.indexOf(`</${tag}>`, from);
  return close === -1 ? "" : decode(html.slice(from, close).replace(/<[^>]*>/g, ""));
};

export const parseElements = (html) =>
  [...html.matchAll(TAG)].map((match) => {
    const attributes = attributesOf(match[2]);
    return {
      tag: match[1].toLowerCase(),
      index: match.index,
      attributes,
      classes: classesOf(attributes),
      text: innerText(html, match[1].toLowerCase(), match.index + match[0].length)
    };
  });

const integer = (value) => (value === undefined ? undefined : Number(value));

export const splitGrids = (html) => {
  const elements = parseElements(html);
  const starts = elements.filter((element) => element.classes.includes("ef-character-grid"));
  return starts.map((grid, index) => {
    const end = starts[index + 1]?.index ?? Infinity;
    const members = elements.filter((element) => element.index > grid.index && element.index < end);
    return {
      rows: integer(grid.attributes["data-ef-rows"]),
      columns: integer(grid.attributes["data-ef-columns"]),
      narrow: grid.attributes["data-ef-narrow"] ?? "contained",
      label: members.find((element) => element.classes.includes("ef-character-grid__viewport"))?.attributes["aria-labelledby"] ?? "",
      elements: members,
      runs: members
        .filter((element) => element.attributes["data-ef-row"] !== undefined)
        .map((element) => ({
          ...element,
          id: element.attributes.id ?? `${element.tag}@${element.index}`,
          row: integer(element.attributes["data-ef-row"]),
          col: integer(element.attributes["data-ef-col"]),
          len: integer(element.attributes["data-ef-len"]),
          height: integer(element.attributes["data-ef-height"] ?? "1")
        }))
    };
  });
};

const address = (run, columns) => (run.row - 1) * columns + (run.col - 1);

const cellsOf = (run) =>
  Array.from({ length: run.height }, (_, rowOffset) =>
    Array.from({ length: run.len }, (_, colOffset) => `${run.row + rowOffset}:${run.col + colOffset}`)
  ).flat();

const TEXT_CLASSES = [
  "ef-character-grid__text",
  "ef-character-grid__value",
  "ef-character-grid__label",
  "ef-character-grid__key",
  "ef-character-grid__message",
  "ef-character-grid__status"
];

// CG-1 geometry
export const geometryErrors = (grid) => [
  ...(Number.isInteger(grid.rows) && grid.rows >= 1 && grid.rows <= LIMITS.rows
    ? []
    : [`CG-1 data-ef-rows must be an integer 1..${LIMITS.rows}`]),
  ...(Number.isInteger(grid.columns) && grid.columns >= 1 && grid.columns <= LIMITS.columns
    ? []
    : [`CG-1 data-ef-columns must be an integer 1..${LIMITS.columns}`]),
  ...(["contained", "reflow"].includes(grid.narrow) ? [] : ["CG-1 data-ef-narrow must be contained or reflow"]),
  ...(grid.label ? [] : ["CG-1 the viewport must be named with aria-labelledby"])
];

// CG-2 coordinates are complete integers; CG-3 bounds; CG-4 no row wrap
export const boundsErrors = (grid) =>
  grid.runs.flatMap((run) => [
    ...([run.row, run.col, run.len, run.height].every(Number.isInteger)
      ? []
      : [`CG-2 ${run.id} needs integer data-ef-row, data-ef-col, and data-ef-len`]),
    ...(run.row >= 1 && run.row + run.height - 1 <= grid.rows ? [] : [`CG-3 ${run.id} is outside rows 1..${grid.rows}`]),
    ...(run.col >= 1 ? [] : [`CG-3 ${run.id} starts before column 1`]),
    ...(run.col + run.len - 1 <= grid.columns ? [] : [`CG-4 ${run.id} crosses column ${grid.columns} (no row wrap)`])
  ]);

// CG-5 collisions
export const collisionErrors = (grid) => {
  const owners = grid.runs.flatMap((run) => cellsOf(run).map((cell) => ({ cell, id: run.id })));
  const first = owners.reduce((map, { cell, id }) => (map.has(cell) ? map : new Map([...map, [cell, id]])), new Map());
  return [
    ...new Set(
      owners
        .filter(({ cell, id }) => first.get(cell) !== id)
        .map(({ cell, id }) => `CG-5 ${id} collides with ${first.get(cell)} at ${cell}`)
    )
  ];
};

// CG-6 source order is row-major order
export const orderErrors = (grid) =>
  grid.runs.slice(1).flatMap((run, index) =>
    address(run, grid.columns) < address(grid.runs[index], grid.columns)
      ? [`CG-6 ${run.id} is earlier in row-major order than ${grid.runs[index].id} but later in source`]
      : []
  );

// CG-7 protected text fits its run
export const overflowErrors = (grid) =>
  grid.runs
    .filter((run) => run.classes.some((name) => TEXT_CLASSES.includes(name)))
    .filter((run) => run.classes.includes("ef-character-grid__message")
      ? [...run.text.trim()].length > run.len * run.height
      : [...run.text.replace(/\s+$/, "")].length > run.len)
    .map((run) => `CG-7 ${run.id} text of ${[...run.text.trim()].length} cells exceeds its ${run.len}-cell run`);

// CG-8 editable fields: native input, explicit capacity, preceding label
export const fieldErrors = (grid) => {
  const ids = grid.elements.map((element) => element.attributes.id).filter(Boolean);
  const labelFor = grid.elements.filter((element) => element.tag === "label").map((element) => element.attributes.for);
  return grid.runs
    .filter((run) => ["input", "select", "textarea"].includes(run.tag))
    .flatMap((run) => [
      ...(run.tag === "input" && run.attributes.maxlength !== String(run.len) && !["date", "number"].includes(run.attributes.type)
        ? [`CG-8 ${run.id} maxlength must equal data-ef-len (${run.len})`]
        : []),
      ...(run.attributes.id && labelFor.includes(run.attributes.id) ? [] : [`CG-8 ${run.id} has no <label for>`]),
      ...(run.attributes.id &&
      grid.elements.findIndex((element) => element.tag === "label" && element.attributes.for === run.attributes.id) >
        grid.elements.indexOf(run)
        ? [`CG-8 ${run.id} label must precede the field`]
        : []),
      ...(run.attributes["aria-invalid"] === "true" && !run.attributes["aria-describedby"]
        ? [`CG-8 ${run.id} is invalid but not described by a message`]
        : []),
      ...(run.attributes["aria-describedby"] ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .filter((id) => !ids.includes(id))
        .map((id) => `CG-8 ${run.id} describedby ${id} does not exist`)
    ]);
};

// CG-9 protected runs are not controls; CG-10 no inline style; CG-11 no positive tabindex
export const semanticErrors = (grid) => [
  ...grid.runs
    .filter((run) => run.classes.some((name) => ["ef-character-grid__text", "ef-character-grid__value"].includes(name)))
    .filter((run) => ["input", "select", "textarea", "button"].includes(run.tag))
    .map((run) => `CG-9 protected run ${run.id} must not be a form control`),
  ...grid.elements
    .filter((element) => element.attributes.style !== undefined)
    .map((element) => `CG-10 ${element.tag} uses an inline style attribute`),
  ...grid.elements
    .filter((element) => Number(element.attributes.tabindex ?? 0) > 0)
    .map((element) => `CG-11 ${element.tag} uses a positive tabindex`)
];

// CG-12 table columns declare lengths and fit the table run
export const tableErrors = (grid) =>
  grid.runs
    .filter((run) => run.classes.includes("ef-character-grid__table"))
    .flatMap((run) => {
      const table = grid.elements.find((element) => element.tag === "table" && element.index > run.index);
      const headers = grid.elements.filter(
        (element) => element.tag === "th" && element.index > run.index && element.attributes["data-ef-len"] !== undefined
      );
      const gutter = integer(table?.attributes["data-ef-gutter"] ?? "1");
      const width = headers.reduce((sum, header) => sum + integer(header.attributes["data-ef-len"]), 0) +
        gutter * Math.max(headers.length - 1, 0);
      return [
        ...(headers.length > 0 ? [] : [`CG-12 ${run.id} table needs th[data-ef-len] column widths`]),
        ...(width <= run.len ? [] : [`CG-12 ${run.id} columns need ${width} cells but the run has ${run.len}`])
      ];
    });

export const gridErrors = (grid) => [
  ...geometryErrors(grid),
  ...boundsErrors(grid),
  ...collisionErrors(grid),
  ...orderErrors(grid),
  ...overflowErrors(grid),
  ...fieldErrors(grid),
  ...semanticErrors(grid),
  ...tableErrors(grid)
];

export const checkHtml = (html) =>
  splitGrids(html).flatMap((grid, index) => gridErrors(grid).map((error) => `grid ${index + 1}: ${error}`));

const main = () => {
  const files = process.argv.slice(2);
  const results = files.map((file) => ({ file, errors: checkHtml(fs.readFileSync(file, "utf8")) }));
  results.forEach(({ file, errors }) => errors.forEach((error) => console.error(`${file}: ${error}`)));
  const count = results.reduce((sum, { errors }) => sum + errors.length, 0);
  console.log(count === 0 ? `character-grid conformance passed (${files.length} file(s))` : `${count} conformance error(s)`);
  process.exitCode = count === 0 ? 0 : 1;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
