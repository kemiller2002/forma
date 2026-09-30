// Structural CSS reader for the motion audit (requirements/MOTION-AND-INTERACTION.md,
// MOT-028). It is deliberately small: Forma's stylesheets are authored,
// well-formed CSS, and the audit needs selectors, declarations, at-rule
// context and line numbers -- not a full CSSOM.
//
// Every exported function is pure: text in, immutable data out.

const blankComment = (comment) => comment.replace(/[^\n]/g, " ");

// Comments become whitespace so indices and line numbers are preserved.
export const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, blankComment);

const lineStarts = (text) => [0, ...[...text.matchAll(/\n/g)].map((match) => match.index + 1)];

const lineLookup = (starts) => (index) => {
  const search = (low, high) => {
    if (low >= high) return low;
    const middle = (low + high + 1) >> 1;
    return starts[middle] <= index ? search(middle, high) : search(low, middle - 1);
  };
  return search(0, starts.length - 1) + 1;
};

// Structural tokens "{", "}" and ";" outside strings and parentheses. The
// accumulator array is private to this call, so appending to it is not
// observable outside.
const structuralTokens = (text) =>
  [...text].reduce(
    (state, character, index) => {
      if (state.quote) {
        return {
          ...state,
          escape: !state.escape && character === "\\",
          quote: !state.escape && character === state.quote ? null : state.quote
        };
      }
      if (character === "\"" || character === "'") return { ...state, quote: character };
      if (character === "(") return { ...state, parens: state.parens + 1 };
      if (character === ")") return { ...state, parens: Math.max(0, state.parens - 1) };
      if (state.parens > 0 || !"{};".includes(character)) return state;
      state.tokens.push({ character, index });
      return state;
    },
    { quote: null, escape: false, parens: 0, tokens: [] }
  ).tokens;

const firstNonSpace = (text, from, to) => from + Math.max(0, text.slice(from, to).search(/\S/));

const declarationOf = (text, from, to, line) => {
  const source = text.slice(from, to);
  const colon = source.indexOf(":");
  if (colon === -1 || !source.trim()) return null;
  const property = source.slice(0, colon).trim().toLowerCase();
  const raw = source.slice(colon + 1).trim();
  const important = /!\s*important\s*$/i.test(raw);
  return property
    ? { property, value: raw.replace(/!\s*important\s*$/i, "").trim(), important, line: line(firstNonSpace(text, from, to)) }
    : null;
};

const atName = (prelude) => ((prelude.match(/^@([\w-]+)/) || [])[1] || "").toLowerCase();
const atPrelude = (prelude) => prelude.replace(/^@[\w-]+/, "").trim();

export const normalizeSelector = (selector) =>
  selector.replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ").trim();

// Recursive descent over the structural token stream. Returns one block's
// child nodes, its own declarations, and the token cursor after its "}".
const parseBlock = (text, tokens, line) => {
  const block = (cursor, segmentStart) => {
    const walk = (position, start, nodes, declarations) => {
      const token = tokens[position];
      if (!token || token.character === "}") {
        const end = token ? token.index : text.length;
        const trailing = declarationOf(text, start, end, line);
        return { nodes, declarations: trailing ? [...declarations, trailing] : declarations, next: position + 1, end };
      }
      if (token.character === ";") {
        const prelude = text.slice(start, token.index).trim();
        if (prelude.startsWith("@")) {
          const statement = { kind: "at-statement", name: atName(prelude), prelude: atPrelude(prelude), line: line(firstNonSpace(text, start, token.index)) };
          return walk(position + 1, token.index + 1, [...nodes, statement], declarations);
        }
        const declaration = declarationOf(text, start, token.index, line);
        return walk(position + 1, token.index + 1, nodes, declaration ? [...declarations, declaration] : declarations);
      }
      const prelude = text.slice(start, token.index).trim();
      const preludeLine = line(firstNonSpace(text, start, token.index));
      const child = block(position + 1, token.index + 1);
      const node = prelude.startsWith("@")
        ? {
            kind: "at-rule",
            name: atName(prelude),
            prelude: atPrelude(prelude),
            children: child.nodes,
            declarations: child.declarations,
            body: text.slice(token.index + 1, child.end),
            line: preludeLine
          }
        : { kind: "rule", selector: normalizeSelector(prelude), children: child.nodes, declarations: child.declarations, line: preludeLine };
      return walk(child.next, child.end + 1, [...nodes, node], declarations);
    };
    return walk(cursor, segmentStart, [], []);
  };
  return block(0, 0);
};

// Parse stylesheet text into a node tree.
export const parseCss = (source) => {
  const text = stripComments(source);
  return parseBlock(text, structuralTokens(text), lineLookup(lineStarts(text))).nodes;
};

// Flatten the tree into style rules annotated with their at-rule context,
// plus a list of every at-rule encountered (for @keyframes etc.).
export const flattenCss = (nodes, context = []) =>
  nodes.reduce(
    (flat, node) => {
      if (node.kind === "rule") {
        const nested = flattenCss(node.children, context);
        return {
          rules: [...flat.rules, { selector: node.selector, declarations: node.declarations, context, line: node.line }, ...nested.rules],
          atRules: [...flat.atRules, ...nested.atRules]
        };
      }
      if (node.kind === "at-rule") {
        const entry = { name: node.name, prelude: node.prelude, context, line: node.line, body: node.body, declarations: node.declarations, children: node.children };
        const descend = !["keyframes", "font-face", "property", "page", "counter-style", "font-feature-values"].includes(node.name);
        const nested = descend ? flattenCss(node.children, [...context, { name: node.name, prelude: node.prelude }]) : { rules: [], atRules: [] };
        return { rules: [...flat.rules, ...nested.rules], atRules: [...flat.atRules, entry, ...nested.atRules] };
      }
      return { rules: flat.rules, atRules: [...flat.atRules, { name: node.name, prelude: node.prelude, context, line: node.line }] };
    },
    { rules: [], atRules: [] }
  );

// Split a value on a separator that is not nested inside parentheses.
export const splitTopLevel = (value, separator = ",") => {
  const state = [...value].reduce(
    (acc, character) => {
      if (character === "(") return { ...acc, depth: acc.depth + 1, current: acc.current + character };
      if (character === ")") return { ...acc, depth: acc.depth - 1, current: acc.current + character };
      if (character === separator && acc.depth === 0) return { ...acc, parts: [...acc.parts, acc.current], current: "" };
      return { ...acc, current: acc.current + character };
    },
    { depth: 0, current: "", parts: [] }
  );
  return [...state.parts, state.current].map((part) => part.trim()).filter((part) => part.length > 0);
};

// Split a single transition/animation layer into whitespace-separated
// components without breaking function arguments.
export const splitComponents = (layer) => splitTopLevel(layer.replace(/\s+/g, " "), " ");

export const selectorList = (selector) => splitTopLevel(selector, ",").map(normalizeSelector);

export const isReducedMotionContext = (context) =>
  context.some((entry) => entry.name === "media" && /prefers-reduced-motion\s*:\s*reduce/.test(entry.prelude));

export const isNoPreferenceContext = (context) =>
  context.some((entry) => entry.name === "media" && /prefers-reduced-motion\s*:\s*no-preference/.test(entry.prelude));

export const isStartingStyleContext = (context) => context.some((entry) => entry.name === "starting-style");
