// FORMA-MOT-001: motion model derivation and deterministic motion audit
// (requirements/MOTION-AND-INTERACTION.md MOT-008, MOT-010, MOT-012, MOT-027,
// MOT-028, MOT-029).
import assert from "node:assert/strict";
import test from "node:test";
import { flattenCss, parseCss, splitTopLevel } from "../tools/motion-css.mjs";
import {
  BASE_DURATION_MS,
  exitDuration,
  gravityDuration,
  inertiaDuration,
  presetOrder,
  PRESETS,
  pressDuration,
  staticFallbacks,
  stateDuration
} from "../tools/motion-model.mjs";
import { animationLayer, auditSources, findingKey, runAudit, transitionLayer } from "../tools/motion-audit.mjs";

// ---------------------------------------------------------------------------
// Physics model

test("inertial settling orders light < standard < heavy", () => {
  const durations = presetOrder.map((weight) => inertiaDuration(PRESETS[weight]));
  assert.ok(durations[0] < durations[1], `light ${durations[0]} < standard ${durations[1]}`);
  assert.ok(durations[1] < durations[2], `standard ${durations[1]} < heavy ${durations[2]}`);
});

test("inertial settling follows sqrt(m / k) / ζ", () => {
  const { mass, stiffness, damping } = PRESETS.heavy;
  assert.equal(inertiaDuration(PRESETS.heavy), (BASE_DURATION_MS * Math.sqrt(mass / stiffness)) / damping);
  // Inside the clamp bounds, quadrupling mass doubles settling time.
  const heavier = { ...PRESETS.light, mass: PRESETS.light.mass * 4 };
  assert.ok(Math.abs(inertiaDuration(heavier) / inertiaDuration(PRESETS.light) - 2) < 1e-9);
});

test("gravity timing follows sqrt(2s / g) and ignores mass", () => {
  assert.equal(gravityDuration({ distance: 1, gravity: 1 }), BASE_DURATION_MS * Math.sqrt(2));
  // Mass is not an input of the gravity function; passing it changes nothing.
  const withMass = presetOrder.map((weight) => gravityDuration({ ...PRESETS[weight], distance: 0.45, gravity: 1 }));
  assert.equal(new Set(withMass).size, 1);
  assert.ok(gravityDuration({ distance: 0.3 }) < gravityDuration({ distance: 0.45 }), "shorter travel falls faster");
});

test("reciprocal motion shares the inertia calculation including clamp boundaries", () => {
  for (const preset of [...Object.values(PRESETS), { mass: 0.01, stiffness: 10, damping: 1 }, { mass: 100, stiffness: 0.1, damping: 0.1 }]) {
    assert.equal(exitDuration(preset), inertiaDuration(preset));
  }
});

test("static CSS fallbacks equal the standard preset derivation", () => {
  assert.deepEqual(staticFallbacks(), {
    "--ef-motion-inertia-duration": 214,
    "--ef-motion-gravity-duration": 255,
    "--ef-motion-state-duration": 154,
    "--ef-motion-press-duration": 107,
    "--ef-motion-exit-duration": 214
  });
});

// ---------------------------------------------------------------------------
// CSS reader

test("CSS reader keeps at-rule context, ignores braces in strings and comments, and tracks lines", () => {
  const css = [
    "/* .ghost { transition: all 1s } */",
    "@layer x {",
    "  .a::after { content: \"{;}\"; transition: opacity 1s linear; }",
    "  @media (prefers-reduced-motion: reduce) {",
    "    .a { transition-duration: 0.01ms; }",
    "  }",
    "  @starting-style { .a { opacity: 0; } }",
    "  @keyframes spin { to { rotate: 1turn; } }",
    "}"
  ].join("\n");
  const flat = flattenCss(parseCss(css));
  assert.deepEqual(flat.rules.map((rule) => rule.selector), [".a::after", ".a", ".a"]);
  assert.equal(flat.rules[0].line, 3);
  assert.equal(flat.rules[0].declarations[0].value, "\"{;}\"");
  assert.deepEqual(flat.rules[1].context.map((entry) => entry.name), ["layer", "media"]);
  assert.deepEqual(flat.rules[2].context.map((entry) => entry.name), ["layer", "starting-style"]);
  assert.ok(flat.atRules.some((atRule) => atRule.name === "keyframes" && atRule.prelude === "spin"));
  assert.ok(!flat.rules.some((rule) => rule.selector === ".ghost"), "commented rules are ignored");
});

test("transition and animation layers separate property, timing, easing and iteration", () => {
  assert.deepEqual(splitTopLevel("a 1s cubic-bezier(0, 0, 1, 1), b 2s"), ["a 1s cubic-bezier(0, 0, 1, 1)", "b 2s"]);
  assert.deepEqual(transitionLayer("translate var(--ef-motion-inertia-duration) var(--ef-motion-spring-easing)"), {
    property: "translate",
    duration: "var(--ef-motion-inertia-duration)",
    delay: null,
    easing: "var(--ef-motion-spring-easing)"
  });
  assert.deepEqual(transitionLayer("display var(--x-duration) allow-discrete"), { property: "display", duration: "var(--x-duration)", delay: null, easing: null });
  assert.deepEqual(animationLayer("pulse var(--ef-motion-cadence-period) linear infinite"), {
    name: "pulse",
    duration: "var(--ef-motion-cadence-period)",
    delay: null,
    easing: "linear",
    iteration: "infinite"
  });
});

// ---------------------------------------------------------------------------
// Audit behavior on synthetic sources

const MODELS = {
  sources: {},
  models: {
    inertial: { durationTokens: ["--ef-motion-inertia-duration", "--ef-motion-exit-duration"], easingTokens: ["--ef-motion-spring-easing", "--ef-motion-damped-easing"], literalEasings: [] },
    gravity: { durationTokens: ["--ef-motion-gravity-duration"], easingTokens: ["--ef-motion-damped-easing"], literalEasings: [] },
    cadence: { durationTokens: ["--ef-motion-cadence-period"], easingTokens: ["--ef-motion-cadence-easing"], literalEasings: ["linear", "steps()"] },
    direct: { durationTokens: ["--ef-motion-direct-duration"], easingTokens: ["--ef-motion-direct-easing"], literalEasings: ["linear"] },
    perceptual: { durationTokens: ["--ef-motion-perceptual-duration"], easingTokens: ["--ef-motion-perceptual-easing"], literalEasings: [] }
  },
  parameters: { "--ef-motion-mass": "m" },
  legacyTokens: { "--ef-motion-state-duration": { replacement: "--ef-motion-perceptual-duration", reason: "legacy" } },
  genericTokens: ["--ef-primitive-motion-duration-fast", "--ef-primitive-motion-easing-standard"],
  spatialProperties: ["translate", "scale", "transform"],
  discreteCarriers: ["display", "overlay"],
  reducedMotionCollapse: ["0.01ms", "0ms"],
  bundles: { core: ["core"], marketing: ["marketing"] }
};

const VOCABULARY = `:where(:root) {
  --ef-motion-perceptual-duration: var(--ef-primitive-motion-duration-fast, 120ms);
  --ef-motion-perceptual-easing: var(--ef-primitive-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  --ef-motion-cadence-period: 1600ms;
  --ef-motion-cadence-easing: linear;
  --ef-motion-direct-duration: 0ms;
  --ef-motion-direct-easing: linear;
  --ef-motion-inertia-duration: 214ms;
  --ef-motion-spring-easing: linear(0, 1);
  --ef-motion-damped-easing: cubic-bezier(0.2, 0.8, 0.2, 1);
}`;

const PRIMITIVES = { "--ef-primitive-motion-duration-fast": "120ms", "--ef-primitive-motion-easing-standard": "cubic-bezier(0.2, 0, 0, 1)" };

const audit = (css, entries = [], group = "core", extraSources = []) =>
  auditSources({
    models: MODELS,
    classification: { entries: entries.map((entry) => ({ source: "fixture.css", ...entry })) },
    sources: [{ group: "core", file: "vocabulary.css", text: VOCABULARY }, { group, file: "fixture.css", text: css }, ...extraSources],
    primitives: PRIMITIVES
  });

const codes = (result, code) => result.findings.filter((item) => !code || item.code === code);

test("every animated selector must be classified", () => {
  const result = audit(".x { transition: opacity var(--ef-motion-perceptual-duration) var(--ef-motion-perceptual-easing); }");
  assert.equal(codes(result, "unclassified-track").length, 1);
  const classified = audit(
    ".x { transition: opacity var(--ef-motion-perceptual-duration) var(--ef-motion-perceptual-easing); }",
    [{ selector: ".x", tracks: { opacity: "perceptual" }, reducedMotion: { strategy: "brief" } }]
  );
  assert.deepEqual(codes(classified), []);
});

test("unexplained literal durations, easings and implicit easing are reported", () => {
  const result = audit(".x { transition: background .18s, color 200ms ease-in-out; }", [
    { selector: ".x", tracks: { background: "perceptual", color: "perceptual" }, reducedMotion: { strategy: "brief" } }
  ]);
  assert.deepEqual(codes(result).map((item) => `${item.code}:${item.property}:${item.value}`).sort(), [
    "implicit-easing:background:ease",
    "unexplained-duration:background:.18s",
    "unexplained-duration:color:200ms",
    "unexplained-easing:color:ease-in-out"
  ]);
});

test("var() fallbacks are approved only when they restate the token value", () => {
  const approved = audit(".x { transition: opacity var(--ef-motion-perceptual-duration) var(--ef-motion-perceptual-easing); }", [
    { selector: ".x", tracks: { opacity: "perceptual" }, reducedMotion: { strategy: "brief" } }
  ]);
  assert.deepEqual(codes(approved), []);
  const generic = audit(".x { transition: opacity var(--ef-primitive-motion-duration-fast, 120ms) var(--ef-primitive-motion-easing-standard, ease); }", [
    { selector: ".x", tracks: { opacity: "perceptual" }, reducedMotion: { strategy: "brief" } }
  ]);
  assert.deepEqual(codes(generic).map((item) => item.code).sort(), ["generic-token", "generic-token", "mismatched-fallback"]);
  assert.equal(codes(generic, "mismatched-fallback")[0].value, "--ef-primitive-motion-easing-standard, ease");
});

test("a track must use variables of its own model", () => {
  const result = audit(".x { transition: opacity var(--ef-motion-inertia-duration) var(--ef-motion-damped-easing); }", [
    { selector: ".x", tracks: { opacity: "perceptual" }, reducedMotion: { strategy: "brief" } }
  ]);
  assert.deepEqual(codes(result).map((item) => item.code), ["model-token-mismatch", "model-token-mismatch"]);
});

test("linear is legal for cadence and direct tracks but not for perceptual tracks", () => {
  const css = `.spin { animation: turn var(--ef-motion-cadence-period) linear infinite; }
    .drag { transition: translate var(--ef-motion-direct-duration) linear; }
    .fade { transition: opacity var(--ef-motion-perceptual-duration) linear; }
    @keyframes turn { to { rotate: 1turn; } }
    @media (prefers-reduced-motion: reduce) { .spin { animation: none; } }`;
  const result = audit(css, [
    { selector: ".spin", tracks: { "animation:turn": "cadence" }, reducedMotion: { strategy: "stop" } },
    { selector: ".drag", tracks: { translate: "direct" }, reducedMotion: { strategy: "preserve" } },
    { selector: ".fade", tracks: { opacity: "perceptual" }, reducedMotion: { strategy: "brief" } }
  ]);
  assert.deepEqual(codes(result).map((item) => `${item.code}:${item.selector}`), ["unexplained-easing:.fade"]);
});

test("spatial motion needs a verified reduced-motion substitution", () => {
  const missing = audit(".x { transition: translate var(--ef-motion-inertia-duration) var(--ef-motion-spring-easing); }", [
    { selector: ".x", tracks: { translate: "inertial" } }
  ]);
  assert.deepEqual(codes(missing).map((item) => item.code), ["reduced-motion-missing"]);

  const claimed = audit(".x { transition: translate var(--ef-motion-inertia-duration) var(--ef-motion-spring-easing); }", [
    { selector: ".x", tracks: { translate: "inertial" }, reducedMotion: { strategy: "explicit" } }
  ]);
  assert.deepEqual(codes(claimed).map((item) => item.code), ["reduced-motion-unverified"]);

  const verified = audit(`.x { transition: translate var(--ef-motion-inertia-duration) var(--ef-motion-spring-easing); }
    @media (prefers-reduced-motion: reduce) { .x { translate: none; transition-duration: 0.01ms; } }`, [
    { selector: ".x", tracks: { translate: "inertial" }, reducedMotion: { strategy: "explicit" } }
  ]);
  assert.deepEqual(codes(verified), []);

  const preserved = audit(".x { transition: translate var(--ef-motion-inertia-duration) var(--ef-motion-spring-easing); }", [
    { selector: ".x", tracks: { translate: "inertial" }, reducedMotion: { strategy: "preserve" } }
  ]);
  assert.ok(codes(preserved).some((item) => item.code === "reduced-motion-invalid"), "only direct tracks may preserve motion");
});

test("scope-token reduced motion is verified against the collapsed scope", () => {
  const css = `.box { transition: scale var(--ef-motion-inertia-duration) var(--ef-motion-damped-easing); }
    @media (prefers-reduced-motion: reduce) { :where(.box-scope) { --ef-motion-inertia-duration: 0.01ms; } }`;
  const verified = audit(css, [{ selector: ".box", tracks: { scale: "inertial" }, reducedMotion: { strategy: "scope-tokens", scope: ".box-scope" } }]);
  assert.deepEqual(codes(verified), []);
  const wrong = audit(css, [{ selector: ".box", tracks: { scale: "inertial" }, reducedMotion: { strategy: "scope-tokens", scope: ".elsewhere" } }]);
  assert.deepEqual(codes(wrong).map((item) => item.code), ["reduced-motion-unverified"]);
});

test("repeated motion must stop under reduced motion", () => {
  const css = `.pulse { animation: glow var(--ef-motion-cadence-period) linear infinite; }
    @keyframes glow { to { opacity: 0.5; } }`;
  const result = audit(css, [{ selector: ".pulse", tracks: { "animation:glow": "cadence" }, reducedMotion: { strategy: "explicit" } }]);
  assert.ok(codes(result).some((item) => item.code === "repeated-without-stop"));
  assert.ok(codes(result).some((item) => item.code === "reduced-motion-unverified"));
});

test("keyframes, starting styles and progressive features must be classified", () => {
  const css = `@keyframes orphan { to { opacity: 0; } }
    @starting-style { .enter { opacity: 0; } }
    .page { view-transition-name: page; }
    ::view-transition-old(page) { animation-duration: var(--ef-motion-perceptual-duration); }`;
  const result = audit(css);
  assert.deepEqual(new Set(codes(result).map((item) => item.code)), new Set([
    "unclassified-keyframes",
    "starting-style-unclassified",
    "unclassified-track"
  ]));
  assert.ok(codes(result, "unclassified-track").some((item) => item.property === "view-transition-name"));
  assert.ok(codes(result, "unclassified-track").some((item) => item.property === "::view-transition"));
});

test("reduced-motion collapse constants are legal only inside reduced-motion rules", () => {
  const css = `.x { transition: opacity var(--ef-motion-perceptual-duration) var(--ef-motion-perceptual-easing); }
    @media (prefers-reduced-motion: reduce) { .x { transition-duration: 0.01ms; } }
    .y { transition-duration: 0.01ms; }`;
  const result = audit(css, [{ selector: ".x", tracks: { opacity: "perceptual" }, reducedMotion: { strategy: "brief" } }]);
  assert.deepEqual(codes(result).map((item) => `${item.code}:${item.selector}`), ["unexplained-duration:.y"]);
});

test("approved literals require an explicit reason on the classification entry", () => {
  const css = `.run { animation-name: reveal; animation-duration: calc(var(--ef-motion-cadence-period) * 1ms); animation-timing-function: steps(4); }
    @keyframes reveal { to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .run { animation: none; } }`;
  const unapproved = audit(css, [{ selector: ".run", tracks: { "animation:reveal": "cadence" }, reducedMotion: { strategy: "stop" } }]);
  assert.deepEqual(codes(unapproved).map((item) => item.code), ["unexplained-duration"]);
  const approved = audit(css, [{
    selector: ".run",
    tracks: { "animation:reveal": "cadence" },
    reducedMotion: { strategy: "stop" },
    approvedLiterals: [{ value: "1ms", reason: "unit coercion" }]
  }]);
  assert.deepEqual(codes(approved), []);
});

test("a standalone bundle must define every canonical variable it uses", () => {
  const css = ".m { transition: color var(--ef-motion-perceptual-duration) var(--ef-motion-perceptual-easing); }";
  const result = audit(css, [{ selector: ".m", tracks: { color: "perceptual" }, reducedMotion: { strategy: "brief" } }], "marketing");
  assert.deepEqual(codes(result).map((item) => item.code), ["canonical-undefined", "canonical-undefined"]);
});

test("model-independent variables must have one definition everywhere", () => {
  const result = audit(":root { --ef-motion-cadence-period: 900ms; }");
  assert.deepEqual(codes(result).map((item) => item.code), ["canonical-definition-conflict"]);
});

test("animated transform shorthand is reported so concurrent effects compose", () => {
  const css = `.x { transition: transform var(--ef-motion-inertia-duration) var(--ef-motion-damped-easing), translate var(--ef-motion-inertia-duration) var(--ef-motion-damped-easing); }
    @media (prefers-reduced-motion: reduce) { .x { transition-duration: 0.01ms; } }`;
  const result = audit(css, [{ selector: ".x", tracks: { transform: "inertial", translate: "inertial" }, reducedMotion: { strategy: "explicit" } }]);
  assert.deepEqual(codes(result).map((item) => `${item.code}:${item.property}`), ["transform-shorthand-motion:transform"]);
});

test("stale classifications are reported so the catalog stays truthful", () => {
  const result = audit(".x { color: red; }", [{ selector: ".x", tracks: { opacity: "perceptual" }, reducedMotion: { strategy: "brief" } }]);
  assert.deepEqual(codes(result).map((item) => item.code), ["stale-classification", "stale-classification"]);
});

// ---------------------------------------------------------------------------
// Repository sources

test("the audit enumerates animated selectors in core, assessment, marketing and site CSS", () => {
  const report = runAudit(".");
  const groups = new Set(report.tracks.filter((track) => track.kind !== "override").map((track) => track.group));
  assert.deepEqual([...groups].sort(), ["assessment", "core", "marketing", "site"]);
});

test("every shipped animated track is classified under one of the five models", () => {
  const report = runAudit(".");
  const models = new Set(Object.keys(report.catalog.models.models));
  assert.deepEqual([...models].sort(), ["cadence", "direct", "gravity", "inertial", "perceptual"]);
  assert.deepEqual(report.findings.filter((item) => item.code === "unclassified-track").map(findingKey), []);
  report.catalog.classification.entries.forEach((entry) =>
    Object.values(entry.tracks).forEach((model) => assert.ok(models.has(model), `${entry.selector}: unknown model ${model}`))
  );
});

test("the motion debt ledger matches current findings exactly and names an owning issue", () => {
  const report = runAudit(".");
  assert.deepEqual(report.debt.unrecorded.map(findingKey), [], "new motion findings must be fixed, not recorded");
  assert.deepEqual(report.debt.resolved.map((entry) => entry.key), [], "resolved findings must be removed from catalog/motion/debt.json");
  const owners = new Set(["GH-59", "GH-60", "GH-61", "GH-62", "GH-63", "GH-64", "GH-65", "GH-66", "GH-67", "GH-68"]);
  report.catalog.debt.entries.forEach((entry) => assert.ok(owners.has(entry.issue), `${entry.key} names ${entry.issue}`));
});

test("physics presets and static fallbacks in components.css match the model", () => {
  const report = runAudit(".");
  assert.deepEqual(report.findings.filter((item) => /static-fallback-drift|preset-drift|preset-missing|physics-scope-missing/.test(item.code)), []);
});
