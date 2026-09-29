// Forma motion audit (requirements/MOTION-AND-INTERACTION.md, MOT-012, MOT-027,
// MOT-028, MOT-029).
//
// Enumerates every animated selector ("track": one animated property of one
// selector) across core, assessment, marketing and documentation-site CSS,
// maps it to one of the five canonical motion models through
// catalog/motion/classification.json, and categorises every duration and
// easing it uses:
//
//   canonical            a model variable from catalog/motion/models.json
//   canonical-definition a literal that defines a canonical variable
//   approved-fallback    a var() fallback equal to the value it stands in for
//   reduced-collapse     a reduced-motion collapse constant
//   approved-literal     a literal justified by a classification entry
//   and findings for everything else (unexplained literals, generic tokens,
//   mismatched fallbacks, implicit easing, model/token mismatch, missing
//   reduced-motion substitution, unclassified tracks...).
//
// Known findings awaiting migration are recorded in catalog/motion/debt.json
// with the issue that owns them. The audit fails on any finding that is not
// recorded there and on any recorded debt that no longer occurs, so the
// ratchet only moves toward zero. `--strict` additionally requires the debt
// ledger to be empty.
//
//   node tools/motion-audit.mjs            human-readable summary
//   node tools/motion-audit.mjs --json     full machine-readable report
//   node tools/motion-audit.mjs --strict   fail while any debt remains
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  flattenCss,
  isNoPreferenceContext,
  isReducedMotionContext,
  isStartingStyleContext,
  normalizeSelector,
  parseCss,
  selectorList,
  splitComponents,
  splitTopLevel
} from "./motion-css.mjs";
import { milliseconds, PRESETS, staticFallbacks } from "./motion-model.mjs";

const CATALOG = "catalog/motion";

// ---------------------------------------------------------------------------
// Loading

const readJson = (root, file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

export const loadCatalog = (root = ".") => ({
  models: readJson(root, `${CATALOG}/models.json`),
  classification: readJson(root, `${CATALOG}/classification.json`),
  debt: readJson(root, `${CATALOG}/debt.json`)
});

export const sourceList = (models) =>
  Object.entries(models.sources).flatMap(([group, files]) => files.map((file) => ({ group, file })));

export const readSources = (models, root = ".") =>
  sourceList(models).map(({ group, file }) => ({ group, file, text: fs.readFileSync(path.join(root, file), "utf8") }));

// Flat design-token primitives from tokens/echelon.tokens.json, used to verify
// that var() fallbacks restate the token they stand in for.
export const primitiveMotionValues = (tokens) => {
  const primitive = tokens.primitive ?? {};
  const durations = Object.entries(primitive["motion-duration"] ?? {})
    .filter(([key]) => !key.startsWith("$"))
    .map(([key, token]) => [`--ef-primitive-motion-duration-${key}`, `${token.$value.value}${token.$value.unit}`]);
  const easings = Object.entries(primitive["motion-easing"] ?? {})
    .filter(([key]) => !key.startsWith("$"))
    .map(([key, token]) => [`--ef-primitive-motion-easing-${key}`, `cubic-bezier(${token.$value.join(", ")})`]);
  return Object.fromEntries([...durations, ...easings]);
};

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

const vocabulary = (models) => {
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

const parseSource = (source) => ({ ...source, ...flattenCss(parseCss(source.text)) });

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

const references = (definitions) => {
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

const sameValue = (left, right) =>
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

// ---------------------------------------------------------------------------
// Classification lookup

const classificationIndex = (classification) =>
  classification.entries.reduce((map, entry) => map.set(`${entry.source}|${normalizeSelector(entry.selector)}`, entry), new Map());

const trackModel = (entry, property) => (entry && entry.tracks ? entry.tracks[property] ?? null : null);

// ---------------------------------------------------------------------------
// Findings

const finding = (code, track, detail = {}) => ({
  code,
  source: track.source,
  selector: track.selector,
  property: track.property,
  line: track.line ?? null,
  ...detail
});

export const findingKey = (item) => [item.code, item.source, item.selector, item.property, item.value ?? ""].join("|");

const approvedLiteral = (entry, literal) =>
  (entry?.approvedLiterals ?? []).some((approval) => sameValue(approval.value, literal));

const partFindings = (track, part, kind, model, entry, env) => {
  const value = part.literal ?? part.token;
  switch (part.category) {
    case "canonical":
      return model && !part.models.includes(model)
        ? [finding("model-token-mismatch", track, { value: part.token, detail: `${kind} token belongs to ${part.models.join("/")}, track is ${model}` })]
        : [];
    case "approved-fallback":
    case "parameter":
      return [];
    case "mismatched-fallback":
      return [finding("mismatched-fallback", track, { value: `${part.token}, ${part.literal}`, detail: `fallback ${part.literal} does not restate ${part.expected ?? "an authored value"}` })];
    case "legacy-token":
      return [finding("legacy-token", track, { value: part.token, detail: env.models.legacyTokens[part.token].reason })];
    case "generic-token":
      return [finding("generic-token", track, { value: part.token, detail: "generic design-token timing is not a motion-model variable" })];
    case "unknown-token":
      return [finding("unknown-token", track, { value: part.token })];
    case "literal": {
      if (track.reduced && kind === "duration" && env.vocabulary.collapse.has(part.literal)) return [];
      if (approvedLiteral(entry, part.literal)) return [];
      const allowedEasing = kind === "easing" && model &&
        env.models.models[model].literalEasings.some((allowed) => allowed === part.literal || (allowed.endsWith("()") && part.literal.startsWith(allowed.slice(0, -1))));
      return allowedEasing ? [] : [finding(kind === "duration" ? "unexplained-duration" : "unexplained-easing", track, { value })];
    }
    default:
      return [];
  }
};

const timingFindings = (track, entry, model, env) => {
  const duration = classifyValue(track.duration, "duration", env);
  const easing = classifyValue(track.easing, "easing", env);
  const implicit = track.kind !== "override" && track.duration && !track.easing && !track.reduced && !env.vocabulary.carriers.has(track.property)
    ? [finding("implicit-easing", track, { value: "ease", detail: "no easing given: the CSS default `ease` is an unexplained choice" })]
    : [];
  const carrier = env.vocabulary.carriers.has(track.property);
  return [
    ...duration.flatMap((part) => partFindings(track, part, "duration", carrier ? null : model, entry, env)),
    ...(carrier ? [] : easing.flatMap((part) => partFindings(track, part, "easing", model, entry, env))),
    ...implicit
  ];
};

// Reduced-motion rules of one source, as normalized selector lists.
const reducedRules = (parsed) =>
  parsed.flatMap((source) =>
    source.rules
      .filter((rule) => isReducedMotionContext(rule.context))
      .map((rule) => ({ source: source.file, selectors: selectorList(rule.selector), declarations: rule.declarations }))
  );

const declares = (rule, property, predicate = () => true) =>
  rule.declarations.some((declaration) => declaration.property === property && predicate(declaration.value));

const collapses = (env) => (value) => env.vocabulary.collapse.has(value.trim()) || /^none$/i.test(value.trim());

// Verify one classification entry's declared reduced-motion strategy.
const reducedMotionVerified = (entry, env) => {
  const strategy = entry.reducedMotion?.strategy;
  const source = entry.reducedMotion?.source ?? entry.source;
  const rules = env.reduced.filter((rule) => rule.source === source);
  // Every member of the entry's selector list must be covered.
  const members = selectorList(entry.reducedMotion?.selector ?? entry.selector);
  const covered = (predicate) => members.every((member) => rules.some((rule) => rule.selectors.includes(member) && predicate(rule)));
  switch (strategy) {
    case "explicit":
      return covered(() => true);
    case "stop":
      return covered((rule) =>
        declares(rule, "animation", (value) => /^none$/i.test(value)) || declares(rule, "animation-play-state", (value) => /paused/.test(value))
      );
    case "scope-tokens":
      return rules.some((rule) =>
        rule.selectors.some((candidate) => candidate.includes(entry.reducedMotion.scope)) &&
        declares(rule, "--ef-motion-inertia-duration", collapses(env))
      );
    case "global":
      return rules.some((rule) =>
        rule.selectors.some((candidate) => candidate.includes("*")) &&
        (declares(rule, "transition", collapses(env)) || declares(rule, "transition-duration", collapses(env))) &&
        (!entry.reducedMotion.animations || declares(rule, "animation", collapses(env)) || declares(rule, "animation-iteration-count", (value) => value.trim() === "1"))
      );
    case "no-preference-only":
      return true;
    case "preserve":
    case "brief":
      return true;
    default:
      return false;
  }
};

const entryFindings = (entry, entryTracks, env) => {
  const models = entryTracks.map((track) => trackModel(entry, track.property)).filter(Boolean);
  const spatial = entryTracks.some((track) => env.vocabulary.spatial.has(track.property) || track.property.startsWith("animation:"));
  const repeated = entryTracks.some((track) => track.kind === "animation" && track.iteration === "infinite");
  const strategy = entry.reducedMotion?.strategy ?? null;
  const pseudo = { source: entry.source, selector: entry.selector, property: "*", line: entryTracks[0]?.line ?? null };
  const noPreference = entryTracks.length > 0 && entryTracks.every((track) => track.noPreference);
  const needs = (spatial || repeated) && !noPreference && !models.every((model) => model === "direct");
  const strategyFindings = [
    ...(needs && (!strategy || strategy === "brief" || strategy === "preserve")
      ? [finding("reduced-motion-missing", pseudo, { detail: "spatial or repeated motion declares no reduced-motion substitution" })]
      : []),
    ...(needs && strategy && strategy !== "brief" && strategy !== "preserve" && !reducedMotionVerified(entry, env)
      ? [finding("reduced-motion-unverified", pseudo, { value: strategy, detail: "declared reduced-motion strategy is not present in the stylesheet" })]
      : []),
    ...(repeated && strategy !== "stop" && !(strategy === "global" && entry.reducedMotion?.animations)
      ? [finding("repeated-without-stop", pseudo, { detail: "repeated cadence motion must stop under reduced motion" })]
      : []),
    ...(strategy === "preserve" && !models.every((model) => model === "direct")
      ? [finding("reduced-motion-invalid", pseudo, { value: strategy, detail: "only direct-manipulation tracks may preserve motion under reduced motion" })]
      : [])
  ];
  const stale = Object.keys(entry.tracks ?? {})
    .filter((property) => !entryTracks.some((track) => track.property === property))
    .map((property) => finding("stale-classification", { ...pseudo, property }, { detail: "classified property is no longer animated by this selector" }));
  return [...strategyFindings, ...stale];
};

// Static fallbacks and presets authored in components.css must equal the model.
const physicsFindings = (parsed) => {
  const components = parsed.find((source) => source.file === "src/styles/components.css");
  if (!components) return [];
  const scope = components.rules.find((rule) => rule.context.length <= 1 && rule.declarations.some((declaration) => declaration.property === "--ef-motion-base-duration"));
  if (!scope) return [{ code: "physics-scope-missing", source: components.file, selector: "*", property: "--ef-motion-base-duration", line: null }];
  const expected = staticFallbacks();
  const fallbackDrift = Object.entries(expected).flatMap(([name, ms]) => {
    const declaration = scope.declarations.find((item) => item.property === name);
    const actual = declaration ? milliseconds(declaration.value) : Number.NaN;
    return Math.abs(actual - ms) < 0.5
      ? []
      : [{ code: "static-fallback-drift", source: components.file, selector: scope.selector, property: name, line: declaration?.line ?? scope.line, value: declaration?.value ?? "missing", detail: `model gives ${ms}ms` }];
  });
  const presetDrift = Object.entries(PRESETS).flatMap(([weight, preset]) => {
    const rule = components.rules.find((item) => item.selector.includes(`[data-ef-motion-weight="${weight}"]`) && item.declarations.some((declaration) => declaration.property === "--ef-motion-mass"));
    if (!rule) return [{ code: "preset-missing", source: components.file, selector: weight, property: "--ef-motion-mass", line: null }];
    return [["--ef-motion-mass", preset.mass], ["--ef-motion-stiffness", preset.stiffness], ["--ef-motion-damping", preset.damping]]
      .filter(([name, value]) => Number((rule.declarations.find((declaration) => declaration.property === name) ?? {}).value) !== value)
      .map(([name, value]) => ({ code: "preset-drift", source: components.file, selector: rule.selector, property: name, line: rule.line, value: String(value) }));
  });
  return [...fallbackDrift, ...presetDrift];
};

const keyframeFindings = (parsed, tracks, classifiedNames) => {
  const defined = parsed.flatMap((source) =>
    source.atRules.filter((atRule) => atRule.name === "keyframes").map((atRule) => ({ name: atRule.prelude.trim(), source: source.file, line: atRule.line }))
  );
  const referenced = new Set(tracks.filter((track) => track.kind === "animation").map((track) => track.name));
  const undefinedNames = [...referenced].filter((name) => name && !defined.some((keyframes) => keyframes.name === name));
  return [
    ...defined
      .filter((keyframes) => !referenced.has(keyframes.name) || !classifiedNames.has(keyframes.name))
      .map((keyframes) => ({ code: "unclassified-keyframes", source: keyframes.source, selector: `@keyframes ${keyframes.name}`, property: "@keyframes", line: keyframes.line })),
    ...undefinedNames.map((name) => ({ code: "undefined-keyframes", source: "*", selector: name, property: "animation-name", line: null }))
  ];
};

const startingStyleFindings = (parsed, index) =>
  parsed.flatMap((source) =>
    source.rules
      .filter((rule) => isStartingStyleContext(rule.context))
      .flatMap((rule) =>
        selectorList(rule.selector)
          .filter((selector) =>
            ![...index.values()].some((entry) =>
              entry.source === source.file &&
              (normalizeSelector(entry.selector) === selector || (entry.entrySelectors ?? []).map(normalizeSelector).includes(selector))
            )
          )
          .map((selector) => ({ code: "starting-style-unclassified", source: source.file, selector, property: "@starting-style", line: rule.line }))
      )
  );

// Browser-owned smooth scrolling is not a motion model; it is inventoried and
// must be disabled for reduced motion (MOT-027) or confined to no-preference.
const scrollBehaviorFindings = (parsed, env) =>
  parsed.flatMap((source) =>
    source.rules
      .filter((rule) => !isReducedMotionContext(rule.context))
      .flatMap((rule) => rule.declarations.filter((declaration) => declaration.property === "scroll-behavior" && declaration.value === "smooth").map((declaration) => ({ rule, declaration })))
      .filter(({ rule }) => !isNoPreferenceContext(rule.context))
      .filter(({ rule }) =>
        !env.reduced.some((reduced) =>
          reduced.source === source.file &&
          (reduced.selectors.includes(rule.selector) || reduced.selectors.some((candidate) => candidate.includes("*"))) &&
          declares(reduced, "scroll-behavior", (value) => value === "auto")
        )
      )
      .map(({ rule, declaration }) => ({ code: "smooth-scroll-not-reduced", source: source.file, selector: rule.selector, property: "scroll-behavior", line: declaration.line }))
  );

// Canonical variables a track uses must be defined in the bundle it ships
// with, and model-independent variables must have one definition everywhere.
const definitionFindings = (tracks, definitions, env) => {
  const bundles = env.models.bundles ?? {};
  const undefinedUses = tracks
    .filter((track) => track.kind !== "progressive")
    .flatMap((track) =>
      [...classifyValue(track.duration, "duration", env), ...classifyValue(track.easing, "easing", env)]
        .filter((part) => part.category === "canonical" && !part.via)
        .filter((part) => !definitions.some((definition) => definition.name === part.token && (bundles[track.group] ?? [track.group]).includes(definition.group)))
        .map((part) => finding("canonical-undefined", track, { value: part.token, detail: `not defined in the ${track.group} bundle` }))
    );
  const invariant = new Set(
    ["perceptual", "cadence", "direct"]
      .flatMap((model) => [...env.models.models[model].durationTokens, ...env.models.models[model].easingTokens])
      .filter((token) => token.startsWith("--ef-motion-"))
  );
  const conflicts = [...invariant].flatMap((token) => {
    const values = [...new Set(definitions.filter((definition) => definition.name === token && !definition.reduced).map((definition) => definition.value.replace(/\s+/g, " ")))];
    return values.length > 1
      ? [{ code: "canonical-definition-conflict", source: "*", selector: token, property: token, line: null, value: values.join(" | ") }]
      : [];
  });
  return [...undefinedUses, ...conflicts];
};

// ---------------------------------------------------------------------------
// Audit

export const auditSources = ({ models, classification, sources, primitives = {} }) => {
  const parsed = sources.map(parseSource);
  const definitions = collectDefinitions(parsed);
  const env = {
    models,
    vocabulary: vocabulary(models),
    definitionsOf: references(definitions),
    primitives,
    reduced: reducedRules(parsed)
  };
  const allTracks = extractTracks(parsed);
  const index = classificationIndex(classification);
  const tracks = allTracks.map((track) => {
    const entry = index.get(`${track.source}|${track.selector}`) ?? null;
    return { ...track, family: entry?.family ?? null, model: track.kind === "override" ? null : trackModel(entry, track.property) };
  });
  const motionTracks = tracks.filter((track) => track.kind !== "override");
  const unclassified = motionTracks
    .filter((track) => !track.model && !env.vocabulary.carriers.has(track.property) && !(track.reduced && track.kind !== "progressive"))
    .map((track) => finding("unclassified-track", track, { detail: "animated selector/property has no motion-model classification" }));
  const timing = tracks
    .filter((track) => track.kind !== "progressive")
    .flatMap((track) => timingFindings(track, index.get(`${track.source}|${track.selector}`) ?? null, track.model, env));
  const entries = [...index.values()];
  const perEntry = entries.flatMap((entry) =>
    entryFindings(entry, motionTracks.filter((track) => track.source === entry.source && track.selector === normalizeSelector(entry.selector) && !track.reduced), env)
  );
  const orphanEntries = entries
    .filter((entry) => !motionTracks.some((track) => track.source === entry.source && track.selector === normalizeSelector(entry.selector)))
    .map((entry) => ({ code: "stale-classification", source: entry.source, selector: entry.selector, property: "*", line: null, detail: "classified selector is no longer animated" }));
  const classifiedNames = new Set(motionTracks.filter((track) => track.kind === "animation" && track.model).map((track) => track.name));
  const findings = [
    ...unclassified,
    ...timing,
    ...perEntry,
    ...orphanEntries,
    ...physicsFindings(parsed),
    ...keyframeFindings(parsed, motionTracks, classifiedNames),
    ...startingStyleFindings(parsed, index),
    ...scrollBehaviorFindings(parsed, env),
    ...definitionFindings(tracks, definitions, env)
  ];
  const unique = [...new Map(findings.map((item) => [findingKey(item), item])).values()];
  return { tracks, findings: unique, definitions };
};

export const compareDebt = (findings, debt) => {
  const recorded = new Map(debt.entries.map((entry) => [entry.key, entry]));
  const current = new Set(findings.map(findingKey));
  return {
    unrecorded: findings.filter((item) => !recorded.has(findingKey(item))),
    resolved: debt.entries.filter((entry) => !current.has(entry.key)),
    recorded: findings.filter((item) => recorded.has(findingKey(item)))
  };
};

export const summarize = (tracks, models) =>
  tracks
    .filter((track) => track.kind !== "override")
    .reduce((summary, track) => {
      const group = summary[track.group] ?? {};
      const carrier = (models?.discreteCarriers ?? []).includes(track.property);
      const key = track.model ?? (carrier ? "discrete-carrier" : track.reduced ? "reduced-motion-override" : "unclassified");
      return { ...summary, [track.group]: { ...group, [key]: (group[key] ?? 0) + 1 } };
    }, {});

export const runAudit = (root = ".") => {
  const catalog = loadCatalog(root);
  const tokens = readJson(root, "tokens/echelon.tokens.json");
  const result = auditSources({
    models: catalog.models,
    classification: catalog.classification,
    sources: readSources(catalog.models, root),
    primitives: primitiveMotionValues(tokens)
  });
  return { ...result, catalog, debt: compareDebt(result.findings, catalog.debt) };
};

// ---------------------------------------------------------------------------
// CLI

const format = (item) => `${item.source}:${item.line ?? "?"} ${item.code} ${item.selector} [${item.property}]${item.value ? ` ${item.value}` : ""}${item.detail ? ` -- ${item.detail}` : ""}`;

const main = (argv) => {
  const strict = argv.includes("--strict");
  const report = runAudit(".");
  const { unrecorded, resolved, recorded } = report.debt;
  if (argv.includes("--json")) {
    process.stdout.write(`${JSON.stringify({
      summary: summarize(report.tracks, report.catalog.models),
      tracks: report.tracks.filter((track) => track.kind !== "override").map(({ source, group, selector, property, model, family, kind, duration, easing, reduced, line }) => ({ source, group, selector, property, model, family, kind, duration, easing, reduced, line })),
      findings: report.findings,
      unrecorded,
      resolvedDebt: resolved,
      recordedDebt: recorded.length
    }, null, 2)}\n`);
  } else {
    console.log(`motion audit: ${report.tracks.filter((track) => track.kind !== "override").length} animated tracks`);
    console.log(JSON.stringify(summarize(report.tracks, report.catalog.models)));
    console.log(`findings: ${report.findings.length} (recorded debt ${recorded.length}, new ${unrecorded.length}, resolved-but-still-recorded ${resolved.length})`);
    unrecorded.forEach((item) => console.log(`  NEW ${format(item)}`));
    resolved.forEach((entry) => console.log(`  RESOLVED (remove from catalog/motion/debt.json) ${entry.key}`));
  }
  const failed = unrecorded.length > 0 || resolved.length > 0 || (strict && report.catalog.debt.entries.length > 0);
  if (strict && report.catalog.debt.entries.length > 0) console.error(`strict: ${report.catalog.debt.entries.length} debt entries remain`);
  return failed ? 1 : 0;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = main(process.argv.slice(2));
}
