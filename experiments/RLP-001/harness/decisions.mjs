// Independent layout decision classifier (rubric: docs/DECISION-RUBRIC.md).
//
// Unit of analysis: an authored layout statement, meaning one CSS declaration
// (in a <style> element or a style attribute), one Forma primitive class
// application, or one relational data-rl attribute. Each statement gets a
// category and a kind:
//   explicit   a layout value or behavior the author chose
//   derived    a value the framework resolved from another statement
//   uncertain  layout-affecting but not classifiable by the rubric
// Identical (category, property, value, context) statements count once:
// a consistently reused value is one decision.

export const CATEGORIES = Object.freeze(["padding", "margin", "alignment", "positioning", "grouping", "responsive", "dimension", "correction"]);

const PROPERTY_CATEGORY = [
  [/^padding/, "padding"],
  [/^(margin|gap|row-gap|column-gap|grid-gap|grid-row-gap|grid-column-gap)/, "margin"],
  [/^(align-|justify-|place-|vertical-align$|text-align$)/, "alignment"],
  [/^(position$|top$|left$|right$|bottom$|inset|z-index$|float$|clear$|translate$|transform$)/, "positioning"],
  [/^(display$|flex-direction$|flex-flow$|grid-template|grid-auto|grid-area$|grid-row|grid-column|order$|flex$|flex-grow$|flex-shrink$|grid$|columns$|column-count$|subgrid$)/, "grouping"],
  [/^(flex-wrap$)/, "responsive"],
  [/^(width$|height$|min-|max-|inline-size$|block-size$|aspect-ratio$|flex-basis$|box-sizing$|overflow|contain$|container-type$|container$)/, "dimension"]
];

const NON_LAYOUT = /^(color|background|font|text-decoration|text-transform|letter-spacing|word-spacing|cursor|box-shadow|outline|transition|animation|opacity|border-radius|border-color|border-style|list-style|fill|stroke|content|quotes|accent-color|caret-color|user-select|pointer-events|white-space|overflow-wrap|word-break|hyphens|text-wrap|font-variant|-webkit-|appearance|scroll-behavior|forced-color-adjust|visibility|clip-path|filter|backdrop-filter|object-fit|object-position|table-layout|border-collapse|border-spacing|text-overflow|line-clamp|tab-size|image-rendering|isolation|mix-blend-mode|will-change|resize|scrollbar|overscroll|scroll-snap|counter|speak|unicode|direction$)/;
const MAYBE_LAYOUT = /^(border$|border-width|border-(top|right|bottom|left|block|inline)(-width)?$|line-height$|writing-mode$|zoom$|scale$|rotate$|text-indent$)/;

const RESPONSIVE_VALUE = /auto-fit|auto-fill|minmax\(|clamp\(|\bmin\(|\bmax\(|\bcq[iwhb]\b|\bvw\b|\bvh\b|\bvi\b|\bvb\b/;

export const categorize = (property, value) => {
  const p = property.toLowerCase();
  if (p.startsWith("--")) return { category: customPropertyCategory(p), kind: "explicit" };
  if (NON_LAYOUT.test(p)) return null;
  if (MAYBE_LAYOUT.test(p)) return { category: "dimension", kind: "uncertain" };
  const hit = PROPERTY_CATEGORY.find(([pattern]) => pattern.test(p));
  if (!hit) return { category: "dimension", kind: "uncertain" };
  const responsive = RESPONSIVE_VALUE.test(value) && ["grouping", "dimension"].includes(hit[1]);
  return { category: responsive ? "responsive" : hit[1], kind: "explicit" };
};

const customPropertyCategory = name =>
  /space|gap/.test(name) ? (/surface|inset|pad/.test(name) ? "padding" : "margin")
    : /min|width|max|measure|threshold|size/.test(name) ? "responsive"
      : /align/.test(name) ? "alignment"
        : "dimension";

// --- CSS parsing (comments stripped; nested at-rules and nesting supported) ---

const stripComments = css => css.replace(/\/\*[\s\S]*?\*\//g, "");

const splitTop = (text, separator) => {
  const parts = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) { if (ch === quote) quote = null; continue; }
    if (ch === "\"" || ch === "'") quote = ch;
    else if (ch === "(" || ch === "{") depth += 1;
    else if (ch === ")" || ch === "}") depth -= 1;
    else if (ch === separator && depth === 0) { parts.push(text.slice(start, i)); start = i + 1; }
  }
  parts.push(text.slice(start));
  return parts;
};

const parseBlock = (text, selector, context) => {
  const out = [];
  let i = 0;
  let buffer = "";
  while (i < text.length) {
    const ch = text[i];
    if (ch === "{") {
      let depth = 1;
      let j = i + 1;
      while (j < text.length && depth > 0) { if (text[j] === "{") depth += 1; else if (text[j] === "}") depth -= 1; j += 1; }
      const prelude = buffer.trim();
      const inner = text.slice(i + 1, j - 1);
      const isAt = prelude.startsWith("@");
      out.push(...parseBlock(inner, isAt ? selector : prelude.replace(/&/g, selector ?? "").trim(), isAt ? [...context, prelude.replace(/\s+/g, " ")] : context));
      buffer = "";
      i = j;
      continue;
    }
    if (ch === ";") {
      out.push(...declaration(buffer, selector, context));
      buffer = "";
    } else buffer += ch;
    i += 1;
  }
  out.push(...declaration(buffer, selector, context));
  return out;
};

const declaration = (text, selector, context) => {
  const t = text.trim();
  const colon = t.indexOf(":");
  if (!t || colon < 1 || !selector) return [];
  return [{ selector, context, property: t.slice(0, colon).trim().toLowerCase(), value: t.slice(colon + 1).trim().replace(/\s+/g, " ") }];
};

export const parseCss = css => parseBlock(stripComments(css), null, []);

// --- HTML extraction -------------------------------------------------------

const TAG = /<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/g;
const ATTR = /([^\s=>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

const attributes = text => [...(text ?? "").matchAll(ATTR)].map(m => [m[1].toLowerCase(), m[2] ?? m[3] ?? m[4] ?? ""]);

export const extract = html => {
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]);
  const tags = [...html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<!--[\s\S]*?-->/g, "").matchAll(TAG)]
    .map((m, index) => ({ index, tag: m[1].toLowerCase(), attrs: attributes(m[2]) }));
  return { styles, tags };
};

// --- Framework tables ------------------------------------------------------

// What a Forma primitive resolves automatically, per application.
export const FORMA_PRIMITIVES = Object.freeze({
  "ef-stack": ["margin", "grouping"],
  "ef-cluster": ["margin", "grouping", "alignment", "responsive"],
  "ef-grid": ["margin", "grouping", "responsive", "dimension"],
  "ef-switcher": ["margin", "grouping", "responsive", "dimension"],
  "ef-sidebar": ["margin", "grouping", "responsive", "dimension"],
  "ef-actions": ["margin", "grouping", "alignment", "responsive"],
  "ef-surface": ["padding"],
  "ef-form": ["margin", "grouping", "dimension"],
  "ef-form-row": ["margin", "grouping", "alignment", "responsive", "dimension"],
  "ef-field": ["margin", "grouping"],
  "ef-measure": ["dimension"],
  "ef-bounded-overflow": ["dimension"],
  "ef-frame": ["dimension"],
  "ef-dashboard-grid": ["margin", "grouping", "responsive"]
});

// What a relational node resolves automatically, per element.
export const RELATIONAL_NODES = Object.freeze({
  container: ["padding", "margin", "alignment", "responsive", "dimension"],
  group: ["margin", "alignment", "responsive", "dimension"]
});

export const RELATIONAL_ATTRIBUTES = Object.freeze({
  "data-rl-flow": "responsive",
  "data-rl-bond": "margin",
  "data-rl-clearance": "padding",
  "data-rl-clearance-block": "padding",
  "data-rl-clearance-inline": "padding",
  "data-rl-clearance-top": "padding",
  "data-rl-clearance-bottom": "padding",
  "data-rl-align": "alignment",
  "data-rl-align-edge": "alignment",
  "data-rl-equal": "dimension",
  "data-rl-min": "dimension",
  "data-rl-max": "dimension",
  "data-rl-fill": "dimension",
  "data-rl-size": "dimension",
  "data-rl-anchor": "positioning",
  "data-rl-scroll": "dimension"
});

// --- Statements ------------------------------------------------------------

export const statements = html => {
  const { styles, tags } = extract(html);
  const css = styles.flatMap(parseCss).map(d => ({ source: "css", ...d }));
  const inline = tags.flatMap(t => t.attrs.filter(([k]) => k === "style").flatMap(([, v]) =>
    parseCss(`x{${v}}`).map(d => ({ source: "style-attr", ...d, selector: `${t.tag}#${t.index}` }))));
  const declared = [...css, ...inline].flatMap(d => {
    const c = categorize(d.property, d.value);
    return c ? [{ ...d, ...c, context: d.context.join(" ") }] : [];
  });
  const responsiveContexts = [...new Set(css.filter(d => d.context.length).map(d => d.context.join(" ")))]
    .map(context => ({ source: "css", selector: "@", context, property: "@condition", value: context, category: "responsive", kind: "explicit" }));
  const primitives = tags.flatMap(t => {
    const classes = (t.attrs.find(([k]) => k === "class")?.[1] ?? "").split(/\s+/).filter(c => c in FORMA_PRIMITIVES);
    return classes.flatMap(c => [
      { source: "class", selector: `${t.tag}#${t.index}`, context: "", property: "class", value: c, category: "grouping", kind: "explicit" },
      ...FORMA_PRIMITIVES[c].map(category => ({ source: "class", selector: `${t.tag}#${t.index}`, context: "", property: `derived:${c}`, value: category, category, kind: "derived" }))
    ]);
  });
  const relational = tags.flatMap(t => {
    const attrs = Object.fromEntries(t.attrs);
    const node = attrs["data-rl"];
    const nodeStatements = node in RELATIONAL_NODES || "data-rl-root" in attrs
      ? [
        { source: "rl-attr", selector: `${t.tag}#${t.index}`, context: "", property: "data-rl", value: node ?? "root", category: "grouping", kind: "explicit" },
        ...RELATIONAL_NODES[node in RELATIONAL_NODES ? node : "group"]
          .filter(category => !(category === "padding" && Object.keys(attrs).some(k => k.startsWith("data-rl-clearance"))))
          .map(category => ({ source: "rl-attr", selector: `${t.tag}#${t.index}`, context: "", property: `derived:${node ?? "root"}`, value: category, category, kind: "derived" }))
      ]
      : [];
    const attrStatements = Object.entries(attrs).filter(([k]) => k in RELATIONAL_ATTRIBUTES)
      .map(([k, v]) => ({ source: "rl-attr", selector: `${t.tag}#${t.index}`, context: "", property: k, value: v || "(present)", category: RELATIONAL_ATTRIBUTES[k], kind: "explicit" }));
    return [...nodeStatements, ...attrStatements];
  });
  return [...declared, ...responsiveContexts, ...primitives, ...relational];
};

const decisionSignature = s => `${s.kind}|${s.category}|${s.property}|${s.value}|${s.context}`;
const statementSignature = s => `${s.source}|${s.selector}|${s.context}|${s.property}|${s.value}`;

// One rule for every arm: a decision is a unique (kind, category, property,
// value, context). A value reused across selectors, elements or classes is
// one decision. Raw statement counts are kept as a sensitivity measure.
const unique = list => [...new Map(list.map(s => [decisionSignature(s), s])).values()];

const tally = list => Object.fromEntries(CATEGORIES.map(c => [c, list.filter(s => s.category === c).length]));

export const classify = (finalHtml, firstHtml = finalHtml) => {
  const final = statements(finalHtml);
  const first = statements(firstHtml);
  const explicit = unique(final.filter(s => s.kind === "explicit"));
  const derived = final.filter(s => s.kind === "derived");
  const uncertain = unique(final.filter(s => s.kind === "uncertain"));
  const firstSignatures = new Set(first.map(statementSignature));
  const corrective = unique(final.filter(s => s.kind !== "derived" && !firstSignatures.has(statementSignature(s))));
  const firstExplicit = unique(first.filter(s => s.kind === "explicit"));
  return {
    explicit: explicit.length,
    derived: derived.length,
    uncertain: uncertain.length,
    corrective: corrective.length,
    total: explicit.length + uncertain.length,
    rawStatements: { explicit: final.filter(s => s.kind === "explicit").length, uncertain: final.filter(s => s.kind === "uncertain").length },
    firstDraftExplicit: firstExplicit.length,
    byCategory: { explicit: tally(explicit), derived: tally(derived), uncertain: tally(uncertain), corrective: { ...tally(corrective), correction: corrective.length } },
    evidence: { explicit, uncertain, corrective }
  };
};
