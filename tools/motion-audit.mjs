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
import { isNoPreferenceContext, isReducedMotionContext, isStartingStyleContext, normalizeSelector, selectorList } from "./motion-css.mjs";
import { milliseconds, PRESETS, staticFallbacks } from "./motion-model.mjs";
import {
  classifyValue,
  collectDefinitions,
  extractTracks,
  parseSource,
  references,
  sameValue,
  vocabulary
} from "./motion-values.mjs";

export { animationLayer, classifyValue, collectDefinitions, extractTracks, transitionLayer, varReferences } from "./motion-values.mjs";

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

// MOT-024: independent effects must not compete for one property. The
// transform shorthand makes press, hover, selection and entry effects clobber
// each other; animated tracks use the independent translate/scale/rotate
// properties (or separate nested layers) instead.
const compositionFindings = (tracks) =>
  tracks
    .filter((track) => track.kind === "transition" && !track.reduced && track.property === "transform")
    .map((track) => finding("transform-shorthand-motion", track, { detail: "animate translate/scale/rotate independently so concurrent effects compose (MOT-024)" }));

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
    .filter((track) => !track.model && !env.vocabulary.carriers.has(track.property) && !track.reduced)
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
    ...compositionFindings(motionTracks),
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
