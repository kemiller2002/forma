// Derives Forma's public CSS hook surface from the built stylesheet so that
// catalog API tables are projections of the implementation rather than a
// second, hand-maintained description of it.
//
// A "root" is a block class such as `ef-switch`. Its hooks are:
//   - elements   `ef-switch__track`
//   - modifiers  `ef-switch--compact`
//   - attributes selectors that appear in the same compound selector as one
//                of the root's classes, e.g. `.ef-switch[data-ef-motion-weight="heavy"]`
//   - custom properties named `--ef-switch-*`
import fs from "node:fs";

const stripComments = css => css.replace(/\/\*[\s\S]*?\*\//g, "");

// Splits on a separator that is not nested inside (), [] or quotes.
const splitTopLevel = (text, isSeparator) => {
  const parts = [];
  let depth = 0;
  let quote = null;
  let current = "";
  for (const char of text) {
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === "\"" || char === "'") {
      quote = char;
    } else if (char === "(" || char === "[") {
      depth += 1;
    } else if (char === ")" || char === "]") {
      depth -= 1;
    } else if (depth === 0 && isSeparator(char)) {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  return [...parts, current].map(part => part.trim()).filter(Boolean);
};

// Every rule prelude (selector list) in the stylesheet, ignoring at-rule
// preludes such as `@media (...)`, `@layer x`, `@property --x` and keyframe stops.
export const selectorPreludes = css =>
  [...stripComments(css).matchAll(/([^{};]+)\{/g)]
    .map(match => match[1].trim())
    .filter(prelude => prelude && !prelude.startsWith("@") && !/^(?:from|to|\d+%)(?:\s*,\s*(?:from|to|\d+%))*$/.test(prelude));

const selectorsOf = prelude => splitTopLevel(prelude, char => char === ",");

const compoundsOf = selector =>
  splitTopLevel(selector, char => char === " " || char === ">" || char === "+" || char === "~");

const classPattern = /\.(ef-[a-z0-9]+(?:-[a-z0-9]+)*)((?:__[a-z0-9]+(?:-[a-z0-9]+)*)?)((?:--[a-z0-9]+(?:-[a-z0-9]+)*)?)/g;
const attributePattern = /\[\s*([a-z][a-z0-9-]*)\s*(?:[~|^$*]?=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\s*(?:[is]\s*)?\]/g;

export const rootOf = className => className.split("__")[0].split("--")[0];

const classesIn = text => [...text.matchAll(classPattern)].map(match => match[1] + match[2] + match[3]);

const attributesIn = compound =>
  [...compound.replace(/:(?:not|has)\((?:[^()]|\([^()]*\))*\)/g, "").matchAll(attributePattern)]
    .map(match => ({ name: match[1], value: match[2] ?? match[3] ?? match[4] ?? null }));

const hookRecords = css =>
  selectorPreludes(css)
    .flatMap(selectorsOf)
    .flatMap(compoundsOf)
    .flatMap(compound => {
      const classes = classesIn(compound);
      const attributes = attributesIn(compound);
      const roots = [...new Set(classes.map(rootOf))];
      return [
        ...classes.map(name => ({ kind: "class", root: rootOf(name), name })),
        ...roots.flatMap(root => attributes.map(attribute => ({ kind: "attribute", root, ...attribute })))
      ];
    });

const customPropertyRecords = css =>
  [...stripComments(css).matchAll(/(--ef-[a-z0-9-]+)\s*:\s*([^;{}]+);/g)]
    .map(match => ({ name: match[1], value: match[2].trim() }));

// Custom properties mentioned (declared or consumed) inside rules for each root.
const propertiesByRoot = css =>
  [...stripComments(css).matchAll(/([^{};]+)\{([^{}]*)\}/g)]
    .filter(match => !match[1].trim().startsWith("@"))
    .reduce((index, match) => {
      const roots = [...new Set(classesIn(match[1]).map(rootOf))];
      const properties = [...match[2].matchAll(/(--ef-[a-z0-9-]+)/g)].map(item => item[1]);
      roots.forEach(root => index.set(root, new Set([...(index.get(root) ?? []), ...properties])));
      return index;
    }, new Map());

const consumedCustomProperties = css =>
  [...new Set([...stripComments(css).matchAll(/var\(\s*(--ef-[a-z0-9-]+)/g)].map(match => match[1]))];

const sortedUnique = values => [...new Set(values)].sort();

const groupBy = (items, key) =>
  items.reduce((groups, item) => groups.set(key(item), [...(groups.get(key(item)) ?? []), item]), new Map());

const classKind = name => (name.includes("--") ? "modifier" : name.includes("__") ? "element" : "root");

// Builds an immutable index: root -> { elements, modifiers, attributes, customProperties }.
export const buildHookIndex = css => {
  const records = hookRecords(css);
  const declared = customPropertyRecords(css);
  const consumed = consumedCustomProperties(css);
  const roots = sortedUnique(records.filter(record => record.kind === "class").map(record => record.root));
  const byRoot = groupBy(records, record => record.root);
  const propertyNames = sortedUnique([...declared.map(item => item.name), ...consumed]);
  const mentioned = propertiesByRoot(css);

  const entries = roots.map(root => {
    const rootRecords = byRoot.get(root) ?? [];
    const classNames = sortedUnique(rootRecords.filter(record => record.kind === "class").map(record => record.name));
    const attributes = [...groupBy(rootRecords.filter(record => record.kind === "attribute"), record => record.name)]
      .map(([name, items]) => ({ name, values: sortedUnique(items.map(item => item.value).filter(value => value !== null)) }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const prefix = `--${root}-`;
    // A property belongs to a root when it carries the root's name and the
    // root's own rules use it (so --ef-split-pane-* never lands on ef-split).
    const customProperties = propertyNames
      .filter(name => name.startsWith(prefix) && (mentioned.get(root)?.has(name) ?? false))
      .map(name => ({ name, default: declared.find(item => item.name === name)?.value ?? null }));
    return [root, Object.freeze({
      root,
      elements: classNames.filter(name => classKind(name) === "element"),
      modifiers: classNames.filter(name => classKind(name) === "modifier"),
      attributes,
      customProperties
    })];
  });

  return Object.freeze({
    roots,
    classes: new Set(records.filter(record => record.kind === "class").map(record => record.name)),
    attributeNames: new Set(records.filter(record => record.kind === "attribute").map(record => record.name)),
    customProperties: new Set(propertyNames),
    byRoot: new Map(entries)
  });
};

export const loadHookIndex = cssPath => buildHookIndex(fs.readFileSync(cssPath, "utf8"));
