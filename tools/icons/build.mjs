// Forma icon compiler: build-time only; no runtime JavaScript is published.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootKeys = ["schemaVersion", "grid", "strokeWidth", "linecap", "linejoin", "icons"];
const iconKeys = ["name", "category", "label", "keywords", "origin", "shapes"];
const categories = new Set(["actions", "navigation", "status", "workflow", "diagnostics", "documents", "agents"]);
const shapeKeys = {
  path: ["element", "d"],
  circle: ["element", "cx", "cy", "r"],
  rect: ["element", "x", "y", "width", "height", "rx"]
};
const pathCommands = /^[MmLlHhVvCcSsQqTtAaZzEe0-9\s.,+\-]+$/;
const isObject = value => value !== null && typeof value === "object" && !Array.isArray(value);
const ensure = (condition, message) => { if (!condition) throw new Error(`Icon registry: ${message}`); };
const onlyKeys = (object, allowed, context) => {
  ensure(isObject(object), `${context} must be an object`);
  ensure(Object.keys(object).every(key => allowed.includes(key)), `${context} has unsupported fields`);
};
const finiteCoordinate = (value, context) => {
  ensure(typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 24, `${context} must be a finite coordinate within 0..24`);
};

export function validateRegistry(registry) {
  onlyKeys(registry, rootKeys, "root");
  ensure(rootKeys.every(key => Object.hasOwn(registry, key)), "root is missing required fields");
  ensure(registry.schemaVersion === 1 && registry.grid === 24 && registry.strokeWidth === 1.8, "unsupported version or drawing grid");
  ensure(registry.linecap === "round" && registry.linejoin === "round", "unsupported drawing grammar");
  ensure(Array.isArray(registry.icons) && registry.icons.length > 0, "icons must be a nonempty array");
  const names = new Set();
  for (const icon of registry.icons) {
    onlyKeys(icon, iconKeys, "icon");
    ensure(iconKeys.every(key => Object.hasOwn(icon, key)), "icon is missing required fields");
    ensure(typeof icon.name === "string" && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(icon.name), "invalid icon name");
    ensure(!names.has(icon.name), `duplicate icon name: ${icon.name}`);
    names.add(icon.name);
    ensure(categories.has(icon.category), `${icon.name}: unrecognized category`);
    ensure(typeof icon.label === "string" && icon.label.trim().length > 0 && icon.label.length <= 80, `${icon.name}: invalid label`);
    ensure(Array.isArray(icon.keywords) && icon.keywords.every(keyword => typeof keyword === "string" && keyword.trim().length > 0 && keyword.length <= 40), `${icon.name}: invalid keywords`);
    ensure(new Set(icon.keywords).size === icon.keywords.length, `${icon.name}: duplicate keywords`);
    // External artwork requires an explicit separate review and license-extension contract.
    ensure(icon.origin === "original", `${icon.name}: unreviewed third-party provenance`);
    ensure(Array.isArray(icon.shapes) && icon.shapes.length > 0 && icon.shapes.length <= 32, `${icon.name}: invalid shape count`);
    for (const shape of icon.shapes) {
      ensure(isObject(shape) && Object.hasOwn(shape, "element"), `${icon.name}: malformed shape`);
      const allowed = shapeKeys[shape.element];
      ensure(Boolean(allowed), `${icon.name}: forbidden SVG element`);
      onlyKeys(shape, allowed, `${icon.name}: ${shape.element}`);
      ensure(allowed.filter(key => key !== "rx").every(key => Object.hasOwn(shape, key)), `${icon.name}: missing geometry`);
      if (shape.element === "path") {
        ensure(typeof shape.d === "string" && shape.d.length > 0 && shape.d.length <= 1200 && pathCommands.test(shape.d), `${icon.name}: unsafe path geometry`);
        ensure(/[MmLlHhVvCcSsQqTtAa]/.test(shape.d), `${icon.name}: missing path command`);
      } else {
        for (const [key, value] of Object.entries(shape)) {
          if (key !== "element") finiteCoordinate(value, `${icon.name}.${key}`);
        }
        if (shape.element === "circle") ensure(shape.r > 0, `${icon.name}: radius must be positive`);
        if (shape.element === "rect") ensure(shape.width > 0 && shape.height > 0, `${icon.name}: rectangle dimensions must be positive`);
      }
    }
  }
  return registry;
}

const attrOrder = ["d", "cx", "cy", "r", "x", "y", "width", "height", "rx"];
function drawShape(shape) {
  const attrs = attrOrder.filter(key => Object.hasOwn(shape, key)).map(key => `${key}="${shape[key]}"`).join(" ");
  return `<${shape.element} ${attrs}/>`;
}

export function renderSvg(icon, grammar, decorative = false) {
  const attrs = [
    'xmlns="http://www.w3.org/2000/svg"',
    'class="ef-icon__svg"',
    'viewBox="0 0 24 24"',
    'fill="none"',
    'stroke="currentColor"',
    `stroke-width="${grammar.strokeWidth}"`,
    `stroke-linecap="${grammar.linecap}"`,
    `stroke-linejoin="${grammar.linejoin}"`
  ];
  if (decorative) attrs.push('aria-hidden="true"', 'focusable="false"');
  return `<svg ${attrs.join(" ")}>${icon.shapes.map(drawShape).join("")}</svg>`;
}

export function compileIcons(registry) {
  validateRegistry(registry);
  const files = new Map();
  const metadata = [];
  const icons = [...registry.icons].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  for (const icon of icons) {
    files.set(`${icon.name}.svg`, renderSvg(icon, registry) + "\n");
    files.set(`html/${icon.name}.html`,
      `<ef-icon class="ef-component-tag"><span class="ef-icon" data-ef-icon="${icon.name}">${renderSvg(icon, registry, true)}</span></ef-icon>\n`);
    metadata.push({
      name: icon.name, category: icon.category, label: icon.label,
      keywords: [...icon.keywords], origin: icon.origin,
      svg: `icons/${icon.name}.svg`, html: `icons/html/${icon.name}.html`
    });
  }
  files.set("registry.json", JSON.stringify({schemaVersion: 1, grid: registry.grid, icons: metadata}, null, 2) + "\n");
  return files;
}

export function buildIcons({root = process.cwd(), outDir = path.join(root, "dist/icons")} = {}) {
  const registry = JSON.parse(fs.readFileSync(path.join(root, "icons/registry.json"), "utf8"));
  const generated = compileIcons(registry); // validate before touching output
  fs.rmSync(outDir, {recursive: true, force: true});
  for (const [name, content] of generated) {
    const output = path.join(outDir, name);
    fs.mkdirSync(path.dirname(output), {recursive: true});
    fs.writeFileSync(output, content);
  }
  return generated;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = buildIcons();
  console.log(`Generated ${files.size} static Forma icon assets`);
}
