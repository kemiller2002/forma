// Live-demo versus static-specimen declarations for catalog examples
// (visual-engineering/UI-LAYOUT-INTERACTION@1.0.0 ULI-A01, A03, A05, A09, A10).
//
// Every example that renders an enabled action control declares either
//   interaction: { kind: "live", actions: [{ role, name, expect }] }
// where each action has a native, observable outcome the site tests assert,
// or
//   interaction: { kind: "static", reasons: [...] }
// which renders the example as labelled, non-interactive documentation.
// The canonical Basic example declares the same shape as `basicInteraction`.
// The documentation site runs no script, so only native behavior can be live.
// An action may name the landmark it sits in, `within: { role, name? }`, when
// the same accessible name legitimately appears in several landmarks (a
// header and a hero "Get started"). Reset strategy (ULI-A05): the runner
// clears the URL fragment before each fragment link, and every example
// starts from a fresh page load.

export const STATIC_REASONS = Object.freeze({
  "application-behavior": "Its buttons stand for application actions that the consuming application implements; this script-free documentation does not perform them.",
  "placeholder-navigation": "Its links point to placeholder destinations that do not exist on this site.",
  "form-handling": "Submitting or resetting it needs the consuming application's form handling, which this documentation does not have."
});

// Outcomes a live action may declare, each observable without script.
export const EXPECT_KINDS = Object.freeze({
  open: value => typeof value === "boolean",
  url: value => typeof value === "string" && value.startsWith("#") && value.length > 1,
  checked: value => typeof value === "boolean"
});

const ACTION_ROLES = new Set(["button", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "tab", "switch"]);
const BUTTON_INPUTS = new Set(["submit", "button", "reset", "image"]);

const attributesOf = source => Object.fromEntries(
  [...source.matchAll(/([a-z][a-z0-9:-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/gi)]
    .map(match => [match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? ""]));

// Enabled action controls rendered by static markup, with the role
// Playwright resolves for them (`disclosure` for <summary>). Mirrors the
// browser inventory in @echelon-foundry/forma-conformance; the site tests
// compare the two exactly at runtime.
export const staticActions = html =>
  [...String(html).matchAll(/<([a-z][a-z0-9-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi)]
    .map(match => ({ tag: match[1].toLowerCase(), attributes: attributesOf(match[2]) }))
    .filter(({ attributes }) => !("disabled" in attributes) && attributes["aria-disabled"] !== "true")
    .map(({ tag, attributes }) => {
      const role = attributes.role;
      if (role && ACTION_ROLES.has(role)) return { tag, role };
      if (tag === "a" && "href" in attributes) return { tag, role: "link" };
      if (tag === "button") return { tag, role: "button" };
      if (tag === "summary") return { tag, role: "disclosure" };
      if (tag === "input" && BUTTON_INPUTS.has((attributes.type ?? "").toLowerCase())) return { tag, role: "button" };
      return null;
    })
    .filter(Boolean);

const countBy = (items, key) => items.reduce((counts, item) => ({ ...counts, [item[key]]: (counts[item[key]] ?? 0) + 1 }), {});

const actionProblems = (action, index) => {
  const where = `interaction.actions[${index}]`;
  const kinds = Object.keys(action?.expect ?? {});
  return [
    !(typeof action?.role === "string" && action.role) && `${where} needs a role`,
    !(typeof action?.name === "string" && action.name.trim()) && `${where} needs an accessible name`,
    action?.within !== undefined && !(typeof action.within?.role === "string" && action.within.role) && `${where}.within needs a landmark role`,
    ...Object.keys(action ?? {}).filter(key => !["role", "name", "expect", "within"].includes(key)).map(key => `${where} has unexpected field "${key}"`),
    kinds.length !== 1 && `${where}.expect must declare exactly one outcome (${Object.keys(EXPECT_KINDS).join(", ")})`,
    kinds.length === 1 && !EXPECT_KINDS[kinds[0]] && `${where}.expect.${kinds[0]} is not a supported outcome`,
    kinds.length === 1 && EXPECT_KINDS[kinds[0]] && !EXPECT_KINDS[kinds[0]](action.expect[kinds[0]]) && `${where}.expect.${kinds[0]} has an invalid value`
  ].filter(Boolean);
};

// Problems with one example's declaration against its markup. Pure.
export const interactionProblems = (declaration, html) => {
  const rendered = staticActions(html);
  if (!declaration) {
    return rendered.length
      ? [`renders ${rendered.length} enabled action control(s) without an interaction declaration (live demo or static specimen)`]
      : [];
  }
  if (declaration.kind === "static") {
    const reasons = declaration.reasons ?? [];
    return [
      !(Array.isArray(reasons) && reasons.length) && "a static specimen needs at least one reason",
      ...reasons.filter(reason => !(reason in STATIC_REASONS)).map(reason => `unknown static reason "${reason}" (use ${Object.keys(STATIC_REASONS).join(", ")})`),
      ...Object.keys(declaration).filter(key => !["kind", "reasons"].includes(key)).map(key => `static declaration has unexpected field "${key}"`)
    ].filter(Boolean);
  }
  if (declaration.kind === "live") {
    const actions = declaration.actions ?? [];
    if (!rendered.length) return ["declares a live demo but renders no enabled action control"];
    if (!Array.isArray(actions) || !actions.length) return ["a live demo must declare its actions"];
    const renderedByRole = countBy(rendered, "role");
    const key = action => [action.role, action.name, action.within?.role ?? "", action.within?.name ?? ""].join("\u0000");
    const distinct = [...new Map(actions.map(action => [key(action), action])).values()];
    const declaredByRole = countBy(distinct, "role");
    return [
      ...actions.flatMap(actionProblems),
      ...Object.entries(renderedByRole).filter(([role, count]) => (declaredByRole[role] ?? 0) < count)
        .map(([role, count]) => `renders ${count} enabled ${role} control(s) but declares ${declaredByRole[role] ?? 0}; every enabled live action needs an expected outcome`),
      ...Object.keys(declaredByRole).filter(role => !(role in renderedByRole)).map(role => `declares a ${role} action that the markup does not render`)
    ];
  }
  return [`interaction.kind must be "live" or "static" (got ${JSON.stringify(declaration.kind)})`];
};

// The sentence shown on a static specimen, from its reason codes.
export const staticExplanation = declaration =>
  (declaration?.reasons ?? []).map(reason => STATIC_REASONS[reason]).filter(Boolean).join(" ");

// Every rendered example with its declaration: Basic first, then the
// authored examples in order. `html` is the markup the example renders.
export const exampleInteractions = (component, basicHtml) => [
  { id: "basic", mobile: false, html: basicHtml, interaction: component.basicInteraction ?? null },
  ...component.examples.map(example => ({ id: example.id, mobile: Boolean(example.mobile), html: example.html, interaction: example.interaction ?? null }))
];

export const interactionSummary = catalog => {
  const all = catalog.components.flatMap(component => exampleInteractions(component, component.pattern ?? ""));
  const live = all.filter(item => item.interaction?.kind === "live");
  return {
    examples: all.length,
    live: live.length,
    static: all.filter(item => item.interaction?.kind === "static").length,
    noActions: all.filter(item => !item.interaction).length,
    liveActions: live.reduce((total, item) => total + item.interaction.actions.length, 0)
  };
};
