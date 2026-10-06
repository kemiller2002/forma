// Shared CSS structure helpers for the node test suite (FORMA-A11Y-002).
// A deliberately small tokenizer: enough structure to recover style-rule
// preludes, their declaration blocks and at-rule nesting, and to report
// anything a browser would silently recover from instead of rejecting.
const HEX = /[0-9a-f]/i;

export function parseCss(text) {
  const errors = [];
  const rules = [];
  const stack = [];
  let prelude = "";
  let line = 1;
  let preludeLine = 1;

  const inKeyframes = () => stack.some((frame) => /^@(-webkit-)?keyframes\b/i.test(frame.prelude));

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === "\n") line += 1;

    if (char === "/" && text[index + 1] === "*") {
      const end = text.indexOf("*/", index + 2);
      if (end === -1) {
        errors.push(`line ${line}: unterminated comment`);
        break;
      }
      line += (text.slice(index, end).match(/\n/g) ?? []).length;
      index = end + 1;
      continue;
    }

    if (char === "\"" || char === "'") {
      let cursor = index + 1;
      while (cursor < text.length && text[cursor] !== char) {
        if (text[cursor] === "\\") cursor += 1;
        else if (text[cursor] === "\n") break;
        cursor += 1;
      }
      if (text[cursor] !== char) errors.push(`line ${line}: unterminated string`);
      if (prelude.trim() === "") preludeLine = line;
      prelude += text.slice(index, cursor + 1);
      index = cursor;
      continue;
    }

    if (char === "\\") {
      const next = text[index + 1] ?? "";
      // Hex escapes (\2014) and escaped punctuation (\:) are legitimate CSS;
      // a backslash before a newline, end of file, or a non-hex letter is the
      // residue of an escaped string written verbatim (\n, \t, \r ...).
      if (next === "" || next === "\n" || next === "\r" || (/[a-z]/i.test(next) && !HEX.test(next))) {
        const shown = next === "\n" ? "\\<newline>" : `\\${next}`;
        errors.push(`line ${line}: stray escape sequence "${shown}" outside a string`);
      }
      if (prelude.trim() === "") preludeLine = line;
      prelude += char + next;
      index += 1;
      continue;
    }

    if (char === "{") {
      const text = prelude.trim();
      const parent = stack.at(-1);
      const kind = text.startsWith("@") ? "at" : parent?.kind === "style" ? "nested" : inKeyframes() ? "keyframe" : "style";
      const rule = kind === "style" || kind === "nested" ? { selector: normalize(text), line: preludeLine, start: index + 1, body: "" } : null;
      if (rule) rules.push(rule);
      if (text === "") errors.push(`line ${line}: block without a prelude`);
      stack.push({ kind, prelude: text, rule });
      prelude = "";
      continue;
    }

    if (char === "}") {
      if (stack.length === 0) errors.push(`line ${line}: unbalanced "}"`);
      else {
        const frame = stack.pop();
        if (frame.rule) frame.rule.body = text.slice(frame.rule.start, index);
      }
      prelude = "";
      continue;
    }

    if (char === ";") {
      prelude = "";
      continue;
    }

    if (prelude.trim() === "" && !/\s/.test(char)) preludeLine = line;
    prelude += char;
  }

  if (stack.length > 0) errors.push(`end of file: ${stack.length} unclosed block(s), innermost "${stack.at(-1).prelude}"`);
  return { errors, rules };
}

// Split a selector list on top-level commas (not inside parentheses,
// brackets or strings).
export function selectorList(selector) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let current = "";
  for (const char of selector) {
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === "\"" || char === "'") quote = char;
    else if (char === "(" || char === "[") depth += 1;
    else if (char === ")" || char === "]") depth -= 1;
    else if (char === "," && depth === 0) {
      parts.push(normalize(current));
      current = "";
      continue;
    }
    current += char;
  }
  parts.push(normalize(current));
  return parts.filter(Boolean);
}

// Declarations of a rule body as [property, value] pairs (comments removed).
export function declarations(body) {
  return body
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(";")
    .map((declaration) => declaration.trim())
    .filter((declaration) => declaration.includes(":") && !declaration.includes("{"))
    .map((declaration) => {
      const colon = declaration.indexOf(":");
      return [declaration.slice(0, colon).trim(), normalize(declaration.slice(colon + 1))];
    });
}

export const normalize = (selector) => selector.replace(/\s+/g, " ").trim();

const ELEMENTS = new Set(`
  a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col
  colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2
  h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta
  meter nav noscript object ol optgroup option output p picture pre progress q rp rt ruby s samp search script
  section select selectedcontent slot small source span strong style sub summary sup table tbody td template textarea tfoot th
  thead time title tr track u ul var video wbr
  svg g path circle ellipse line polyline polygon rect text tspan textPath use defs symbol marker clipPath mask
  pattern image foreignObject linearGradient radialGradient stop filter desc
  math mi mn mo ms mtext mrow
`.trim().split(/\s+/));

// Pseudo-classes whose arguments are not selectors.
const NON_SELECTOR_ARGUMENTS = /::?(?:nth-child|nth-last-child|nth-of-type|nth-last-of-type|lang|dir|state|part|highlight|host-context|view-transition-[a-z-]+)\((?:[^()]|\([^()]*\))*\)/gi;

export function typeSelectors(selector) {
  const stripped = selector
    .replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "\"\"")
    .replace(/\[[^\]]*\]/g, "[]")
    .replace(NON_SELECTOR_ARGUMENTS, ":x");
  const names = [];
  for (const chunk of stripped.split(/[\s,>+~()]+/)) {
    if (chunk === "" || chunk === "&" || chunk === "*") continue;
    if (chunk.startsWith("\\")) {
      names.push(chunk.split(/[.#:[]/)[0]);
      continue;
    }
    const match = chunk.match(/^(?:\*\|)?([a-zA-Z][\w-]*)/);
    if (match) names.push(match[1]);
  }
  return names;
}

export const knownType = (name) => ELEMENTS.has(name) || ELEMENTS.has(name.toLowerCase()) || /^[a-z][a-z0-9]*-[a-z0-9-]*$/.test(name);

