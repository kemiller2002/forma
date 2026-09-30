// Motion value parsing and classification for tools/motion-audit.mjs
// (requirements/MOTION-AND-INTERACTION.md, MOT-012, MOT-027).
//
// Pure functions: the motion vocabulary from catalog/motion/models.json,
// transition/animation layer parsing, extraction of animated tracks from
// parsed CSS, and categorisation of each duration or easing value.
import {
  flattenCss,
  isNoPreferenceContext,
  isReducedMotionContext,
  isStartingStyleContext,
  parseCss,
  splitComponents,
  splitTopLevel
} from "./motion-css.mjs";
import { milliseconds } from "./motion-model.mjs";

// ---------------------------------------------------------------------------
// Vocabulary

const EASING_KEYWORDS = new Set(["linear", "ease", "ease-in", "ease-out", "ease-in-out", "step-start", "step-end"]);
const EASING_FUNCTION = /^(cubic-bezier|linear|steps)\(/;
const TIME = /^-?\d*\.?\d+m?s$/i;
const TIME_GLOBAL = /(^|[^\w-])(-?\d*\.?\d+)(ms|s)(?![\w-])/gi;
const ANIMATION_KEYWORDS = new Set([
  "infinite", "normal", "reverse", "alternate", "alternate-reverse", "none", "forwards", "backwards", "both",
  "running", "paused", "auto"
]);

export const vocabulary = (models) => {
  const byToken = Object.entries(models.models).flatMap(([model, spec]) => [
    ...spec.durationTokens.map((token) => ({ token, model, kind: "duration" })),
    ...spec.easingTokens.map((token) => ({ token, model, kind: "easing" }))
  ]);
  const modelsOf = (token) => byToken.filter((entry) => entry.token === token).map((entry) => entry.model);
  return {
    modelsOf,
    isCanonical: (token) => modelsOf(token).length > 0,
    isLegacy: (token) => Object.hasOwn(models.legacyTokens ?? {}, token),
    isGeneric: (token) => (models.genericTokens ?? []).includes(token),
    isParameter: (token) => Object.hasOwn(models.parameters ?? {}, token),
    spatial: new Set(models.spatialProperties),
    carriers: new Set(models.discreteCarriers),
    collapse: new Set(models.reducedMotionCollapse)
  };
};

// ---------------------------------------------------------------------------
// Value tokenisation

// Extract top-level var() references with their fallback text and the value
// with those references removed.
export const varReferences = (value) => {
  const scan = (text, from, found) => {
    const start = text.indexOf("var(", from);
    if (start === -1) return found;
    const end = [...text.slice(start + 4)].reduce(
      (acc, character, offset) => {
        if (acc.end !== -1) return acc;
        if (character === "(") return { ...acc, depth: acc.depth + 1 };
        if (character === ")") return acc.depth === 0 ? { ...acc, end: start + 4 + offset } : { ...acc, depth: acc.depth - 1 };
        return acc;
      },
      { depth: 0, end: -1 }
    ).end;
    const inner = text.slice(start + 4, end === -1 ? text.length : end);
    const comma = splitTopLevel(inner, ",");
    const name = (comma[0] ?? "").trim();
    const fallback = inner.includes(",") ? inner.slice(inner.indexOf(",") + 1).trim() : null;
    return scan(text, end === -1 ? text.length : end + 1, [...found, { name, fallback, start, end: end === -1 ? text.length : end + 1 }]);
  };
  const references = scan(value, 0, []);
  const residue = references.reduceRight((text, ref) => text.slice(0, ref.start) + " ".repeat(ref.end - ref.start) + text.slice(ref.end), value);
  return { references, residue };
};

const literalTimes = (text) => [...text.matchAll(TIME_GLOBAL)].map((match) => `${match[2]}${match[3]}`);

const isTimeComponent = (component) =>
  TIME.test(component) || /^calc\(/.test(component) || /^var\(--[\w-]*(duration|period|delay|-ms)\b/.test(component);
const isEasingComponent = (component) =>
  EASING_KEYWORDS.has(component) || EASING_FUNCTION.test(component) || /^var\(--[\w-]*easing\b/.test(component);

// Parse one transition layer: "<property> <duration> <easing> <delay> [allow-discrete]".
export const transitionLayer = (layer) => {
  const components = splitComponents(layer);
  const times = components.filter(isTimeComponent);
  const easings = components.filter(isEasingComponent);
  const property = components.find((component) => !isTimeComponent(component) && !isEasingComponent(component) && component !== "allow-discrete" && component !== "normal") ?? "all";
  return { property: property.toLowerCase(), duration: times[0] ?? null, delay: times[1] ?? null, easing: easings[0] ?? null };
};

// Parse one animation layer.
export const animationLayer = (layer) => {
  const components = splitComponents(layer);
  const times = components.filter(isTimeComponent);
  const easings = components.filter(isEasingComponent);
  const iteration = components.find((component) => component === "infinite" || /^\d*\.?\d+$/.test(component)) ?? null;
  const name = components.find(
    (component) => !isTimeComponent(component) && !isEasingComponent(component) && !ANIMATION_KEYWORDS.has(component) && component !== iteration
  ) ?? null;
  return { name, duration: times[0] ?? null, delay: times[1] ?? null, easing: easings[0] ?? null, iteration };
};

// ---------------------------------------------------------------------------
// Source model

export const parseSource = (source) => ({ ...source, ...flattenCss(parseCss(source.text)) });

const declarationsNamed = (rule, names) => rule.declarations.filter((declaration) => names.includes(declaration.property));

// Every custom-property definition across all sources.
export const collectDefinitions = (parsed) =>
  parsed.flatMap((source) =>
    source.rules.flatMap((rule) =>
      rule.declarations
        .filter((declaration) => declaration.property.startsWith("--"))
        .map((declaration) => ({
          name: declaration.property,
          value: declaration.value,
          source: source.file,
          group: source.group,
          selector: rule.selector,
          line: declaration.line,
          reduced: isReducedMotionContext(rule.context)
        }))
    )
  );

const contextFlags = (context) => ({
  reduced: isReducedMotionContext(context),
  noPreference: isNoPreferenceContext(context),
  startingStyle: isStartingStyleContext(context)
});

// Tracks and timing overrides from one style rule.
const rulesTracks = (source, rule) => {
  const base = { source: source.file, group: source.group, selector: rule.selector, line: rule.line, ...contextFlags(rule.context) };
  const transition = declarationsNamed(rule, ["transition"])
    .filter((declaration) => !/^none$/i.test(declaration.value))
    .flatMap((declaration) =>
      splitTopLevel(declaration.value, ",").map((layer) => ({ ...base, kind: "transition", line: declaration.line, important: declaration.important, ...transitionLayer(layer) }))
    );
  const longhandProperties = declarationsNamed(rule, ["transition-property"]).flatMap((declaration) =>
    splitTopLevel(declaration.value, ",").map((property) => property.toLowerCase())
  );
  const longhandDurations = declarationsNamed(rule, ["transition-duration"]).flatMap((declaration) => splitTopLevel(declaration.value, ","));
  const longhandEasings = declarationsNamed(rule, ["transition-timing-function"]).flatMap((declaration) => splitTopLevel(declaration.value, ","));
  const transitionLonghand = longhandProperties
    .filter((property) => property !== "none")
    .map((property, index) => ({
      ...base,
      kind: "transition",
      property,
      duration: longhandDurations.length ? longhandDurations[index % longhandDurations.length] : null,
      easing: longhandEasings.length ? longhandEasings[index % longhandEasings.length] : null,
      delay: null
    }));
  const animation = declarationsNamed(rule, ["animation"])
    .filter((declaration) => !/^none$/i.test(declaration.value))
    .flatMap((declaration) =>
      splitTopLevel(declaration.value, ",").map((layer) => {
        const parsed = animationLayer(layer);
        return { ...base, kind: "animation", line: declaration.line, important: declaration.important, property: `animation:${parsed.name ?? "?"}`, ...parsed };
      })
    );
  const animationNames = declarationsNamed(rule, ["animation-name"]).flatMap((declaration) =>
    splitTopLevel(declaration.value, ",").filter((name) => name !== "none")
  );
  const single = (property) => (declarationsNamed(rule, [property])[0] ?? {}).value ?? null;
  const animationLonghand = animationNames.map((name) => ({
    ...base,
    kind: "animation",
    property: `animation:${name}`,
    name,
    duration: single("animation-duration"),
    delay: single("animation-delay"),
    easing: single("animation-timing-function"),
    iteration: single("animation-iteration-count")
  }));
  const progressive = rule.declarations
    .filter((declaration) => /^(animation-timeline|scroll-timeline(-name|-axis)?|view-timeline(-name|-axis|-inset)?|view-transition-name|view-transition-class|timeline-scope|animation-range(-start|-end)?|animation-composition|interpolate-size)$/.test(declaration.property))
    .map((declaration) => ({ ...base, kind: "progressive", property: declaration.property, value: declaration.value, line: declaration.line }));
  const viewTransition = /::view-transition/.test(rule.selector)
    ? [{ ...base, kind: "progressive", property: "::view-transition", value: rule.selector }]
    : [];
  const overrides = longhandProperties.length === 0
    ? [
        ...longhandDurations.map((value) => ({ ...base, kind: "override", property: "transition-duration", duration: value })),
        ...longhandEasings.map((value) => ({ ...base, kind: "override", property: "transition-timing-function", easing: value })),
        ...(animationNames.length === 0
          ? ["animation-duration", "animation-timing-function"].flatMap((property) =>
              declarationsNamed(rule, [property]).map((declaration) => ({
                ...base,
                kind: "override",
                property,
                ...(property.endsWith("duration") ? { duration: declaration.value } : { easing: declaration.value })
              }))
            )
          : [])
      ]
    : [];
  return [...transition, ...transitionLonghand, ...animation, ...animationLonghand, ...progressive, ...viewTransition, ...overrides];
};

export const extractTracks = (parsed) => parsed.flatMap((source) => source.rules.flatMap((rule) => rulesTracks(source, rule)));

// ---------------------------------------------------------------------------
// Value classification

export const references = (definitions) => {
  const byName = definitions.reduce((map, definition) => map.set(definition.name, [...(map.get(definition.name) ?? []), definition]), new Map());
  return (name) => byName.get(name) ?? [];
};

// The reference value a fallback must restate: the design-token value for a
// generic primitive, or the first non-reduced literal definition of a model
// variable.
const referenceValue = (name, definitionsOf, primitives, seen = new Set()) => {
  if (primitives[name]) return primitives[name];
  if (seen.has(name)) return null;
  const staticValue = (value) => {
    const trimmed = value.trim();
    const match = trimmed.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]*))?\)$/);
    if (!match) return /var\(|calc\(|clamp\(/.test(trimmed) ? null : trimmed;
    return referenceValue(match[1], definitionsOf, primitives, new Set([...seen, name])) ?? (match[2] ? staticValue(match[2]) : null);
  };
  return definitionsOf(name)
    .filter((definition) => !definition.reduced)
    .map((definition) => staticValue(definition.value))
    .find((value) => value !== null) ?? null;
};

export const sameValue = (left, right) =>
  left !== null && right !== null &&
  (Number.isFinite(milliseconds(left)) && Number.isFinite(milliseconds(right))
    ? Math.abs(milliseconds(left) - milliseconds(right)) < 0.0001
    : left.replace(/\s+/g, "").toLowerCase() === right.replace(/\s+/g, "").toLowerCase());

// Categorise one duration or easing value. Returns a list of parts.
export const classifyValue = (value, kind, env, seen = new Set()) => {
  if (value === null || value === undefined) return [];
  const { references: refs, residue } = varReferences(value);
  const fromRefs = refs.flatMap((ref) => {
    const name = ref.name;
    const fallbackPart = ref.fallback === null
      ? []
      : [{
          category: sameValue(ref.fallback, referenceValue(name, env.definitionsOf, env.primitives)) ? "approved-fallback" : "mismatched-fallback",
          token: name,
          literal: ref.fallback,
          expected: referenceValue(name, env.definitionsOf, env.primitives)
        }];
    if (env.vocabulary.isCanonical(name)) return [{ category: "canonical", token: name, models: env.vocabulary.modelsOf(name) }, ...fallbackPart];
    if (env.vocabulary.isLegacy(name)) return [{ category: "legacy-token", token: name }, ...fallbackPart];
    if (env.vocabulary.isGeneric(name)) return [{ category: "generic-token", token: name }, ...fallbackPart];
    if (env.vocabulary.isParameter(name)) return [{ category: "parameter", token: name }];
    const definitions = env.definitionsOf(name).filter((definition) => !definition.reduced);
    if (definitions.length === 0) return [{ category: "unknown-token", token: name }, ...fallbackPart];
    if (seen.has(name)) return [];
    const resolved = definitions.flatMap((definition) =>
      classifyValue(definition.value, kind, env, new Set([...seen, name])).map((part) => ({ ...part, via: [name, ...(part.via ?? [])] }))
    );
    return [...resolved, ...fallbackPart];
  });
  const text = residue.trim();
  const literalParts = kind === "duration"
    ? literalTimes(residue).map((literal) => ({ category: "literal", literal }))
    : text && !/^[\s,]*$/.test(text) && !/^calc\(/.test(text)
      ? [{ category: "literal", literal: text.replace(/\s+/g, " ") }]
      : [];
  return [...fromRefs, ...literalParts];
};
