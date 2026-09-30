// Catalog coverage and integrity rules. Each rule is a pure function from the
// loaded catalog to a list of problems, so the same rules run in the CLI,
// in `npm run catalog:check`, and in tests/catalog-coverage.test.mjs.
//
//   node tools/catalog/validate.mjs            # whole catalog
//   node tools/catalog/validate.mjs switch     # one or more slugs
import { pathToFileURL } from "node:url";
import { loadCatalog, markupAttributes, markupClasses, markupTags, ownedHooks } from "./load.mjs";

export const MIN_SCENARIO_EXAMPLES = 2; // plus the canonical Basic example = three
export const MIN_MOBILE_EXAMPLES = 1;

const problem = (slug, message) => ({ slug, message });
const nonEmptyText = value => typeof value === "string" && value.trim().length > 0;
const nonEmptyList = value => Array.isArray(value) && value.length > 0 && value.every(nonEmptyText);
const isKebab = value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const referencedSlugs = text => [...String(text).matchAll(/\[\[([a-z0-9-]+)\]\]/g)].map(match => match[1]);

// Every prose field that may carry [[slug]] cross references.
const proseOf = component => [
  component.summary,
  component.purpose?.description,
  ...(component.purpose?.useWhen ?? []),
  ...(component.purpose?.avoidWhen ?? []),
  ...(component.purpose?.characteristics ?? []),
  ...(component.examples ?? []).flatMap(example => [example.description, ...(example.mobile?.notes ?? [])]),
  ...(component.states ?? []).flatMap(state => [state.description, state.how]),
  ...(component.accessibility?.forma ?? []),
  ...(component.accessibility?.consumer ?? []),
  ...(component.responsive ?? []),
  ...(component.motion ?? []),
  ...(component.guidance?.do ?? []),
  ...(component.guidance?.avoid ?? []),
  ...(component.related ?? []).map(item => item.note),
  ...Object.values(component.api?.hooks ?? {}),
  ...(component.api?.attributes ?? []).map(item => item.description),
  ...(component.api?.keyboard ?? []).map(item => item.action),
  component.api?.form
].filter(Boolean);

const unsafeMarkup = html =>
  [/<script\b/i, /\son[a-z]+\s*=/i, /javascript\s*:/i, /<iframe\b/i].filter(pattern => pattern.test(html));

const structureRules = (catalog, component) => {
  const { slug } = component;
  const categoryIds = catalog.categories.map(category => category.id);
  const purpose = component.purpose ?? {};
  const guidance = component.guidance ?? {};
  const accessibility = component.accessibility ?? {};
  return [
    [!isKebab(slug), "slug must be kebab-case"],
    [!nonEmptyText(component.name), "name is required"],
    [!categoryIds.includes(component.category), `category "${component.category}" is not defined in catalog/categories.json`],
    [!nonEmptyText(component.behavior), "behavior owner is required"],
    [!nonEmptyText(component.summary), "summary is required"],
    [component.pattern === null, `patterns/${slug}.html (canonical minimal HTML) is missing`],
    [!nonEmptyText(purpose.description), "purpose.description is required"],
    [!nonEmptyList(purpose.useWhen), "purpose.useWhen needs at least one entry"],
    [!nonEmptyList(purpose.avoidWhen), "purpose.avoidWhen needs at least one entry"],
    [!Array.isArray(component.states) || component.states.length === 0, "states needs at least one documented state"],
    [!nonEmptyList(accessibility.forma), "accessibility.forma (what Forma provides) needs at least one entry"],
    [!nonEmptyList(accessibility.consumer), "accessibility.consumer (what the application must supply) needs at least one entry"],
    [!nonEmptyList(component.responsive), "responsive needs at least one entry"],
    [!nonEmptyList(component.motion), "motion needs at least one entry (state explicitly when nothing moves)"],
    [!nonEmptyList(guidance.do), "guidance.do needs at least one entry"],
    [!nonEmptyList(guidance.avoid), "guidance.avoid needs at least one entry"],
    [!Array.isArray(component.related) || component.related.length === 0, "related needs at least one component"],
    [!component.api || typeof component.api !== "object", "api is required"]
  ].filter(([failed]) => failed).map(([, message]) => problem(slug, message));
};

const stateRules = component =>
  (component.states ?? []).flatMap((state, index) =>
    [!nonEmptyText(state.name) && "name", !nonEmptyText(state.how) && "how", !nonEmptyText(state.description) && "description"]
      .filter(Boolean)
      .map(field => problem(component.slug, `states[${index}] is missing ${field}`)));

const exampleRules = (catalog, component) => {
  const { slug } = component;
  const examples = component.examples;
  const scenario = examples.filter(example => !example.mobile);
  const mobile = examples.filter(example => example.mobile);
  const ids = examples.map(example => example.id);
  const slugs = new Set(catalog.components.map(item => item.slug));
  const patternAttributes = new Set(catalog.components.flatMap(item => (item.pattern ? markupAttributes(item.pattern) : [])));
  const counts = [
    [scenario.length < MIN_SCENARIO_EXAMPLES, `needs at least ${MIN_SCENARIO_EXAMPLES} scenario examples besides Basic (has ${scenario.length})`],
    [mobile.length < MIN_MOBILE_EXAMPLES, "needs at least one explicit mobile example (mobile: { notes: [...] })"],
    [new Set(ids).size !== ids.length, "example ids must be unique"]
  ].filter(([failed]) => failed).map(([, message]) => problem(slug, message));

  const perExample = examples.flatMap(example => {
    const where = `example "${example.id}"`;
    const html = example.html ?? "";
    const tags = markupTags(html);
    return [
      [!isKebab(example.id ?? ""), `${where}: id must be kebab-case`],
      [!nonEmptyText(example.title), `${where}: title is required`],
      [/^(example|demo|sample)\s*\d*$/i.test(example.title ?? ""), `${where}: use a scenario title, not "${example.title}"`],
      [!nonEmptyText(example.description), `${where}: description is required`],
      [!nonEmptyText(html), `${where}: html is required`],
      [!new RegExp(`<ef-${slug}\\s+class="ef-component-tag"`).test(html), `${where}: must render the real component inside <ef-${slug} class="ef-component-tag">`],
      ...unsafeMarkup(html).map(pattern => [true, `${where}: forbidden executable markup ${pattern}`]),
      ...tags.filter(tag => !slugs.has(tag.slice(3))).map(tag => [true, `${where}: <${tag}> is not a catalog component`]),
      ...markupClasses(html).filter(name => !catalog.hookIndex.classes.has(name))
        .map(name => [true, `${where}: class "${name}" does not exist in Forma CSS`]),
      ...markupAttributes(html).filter(name => name.startsWith("data-ef-") && !catalog.hookIndex.attributeNames.has(name) && !patternAttributes.has(name))
        .map(name => [true, `${where}: attribute "${name}" is neither styled by Forma CSS nor used by a canonical pattern`]),
      [Boolean(example.mobile) && !nonEmptyList(example.mobile.notes), `${where}: mobile.notes must explain what changes at narrow widths`]
    ].filter(([failed]) => failed).map(([, message]) => problem(slug, message));
  });
  return [...counts, ...perExample];
};

const apiRules = (catalog, component) => {
  const { slug } = component;
  const api = component.api ?? {};
  const hooks = api.hooks ?? {};
  const index = catalog.hookIndex;
  const markup = [component.pattern ?? "", ...component.examples.map(example => example.html ?? "")].join("\n");
  const usedAttributes = new Set(markupAttributes(markup));
  const owned = ownedHooks(catalog, component);
  const requiredDescriptions = owned.flatMap(hook => [
    ...hook.modifiers,
    ...hook.attributes.map(attribute => attribute.name),
    ...hook.customProperties.map(property => property.name)
  ]);
  const hookExists = key =>
    index.classes.has(key) || index.attributeNames.has(key) || index.customProperties.has(key) || usedAttributes.has(key);
  return [
    ...component.owns.filter(root => !index.byRoot.has(root)).map(root => `owns "${root}" but that class does not exist in Forma CSS`),
    ...Object.keys(hooks).filter(key => !hookExists(key)).map(key => `api.hooks documents "${key}", which is not a real Forma CSS hook or used attribute`),
    ...Object.entries(hooks).filter(([, text]) => !nonEmptyText(text)).map(([key]) => `api.hooks["${key}"] needs a description`),
    ...[...new Set(requiredDescriptions)].filter(key => !(key in hooks)).map(key => `api.hooks must describe the CSS hook "${key}"`),
    ...(api.attributes ?? []).flatMap((attribute, i) => [
      !nonEmptyText(attribute.name) && `api.attributes[${i}] needs a name`,
      !nonEmptyText(attribute.description) && `api.attributes[${i}] needs a description`,
      nonEmptyText(attribute.name) && !usedAttributes.has(attribute.name.split("=")[0].trim()) &&
        `api.attributes "${attribute.name}" does not appear in the pattern or any example`
    ]).filter(Boolean),
    ...(api.keyboard ?? []).flatMap((entry, i) => (!nonEmptyText(entry.keys) || !nonEmptyText(entry.action) ? [`api.keyboard[${i}] needs keys and action`] : []))
  ].map(message => problem(slug, message));
};

const referenceRules = (catalog, component) => {
  const slugs = new Set(catalog.components.map(item => item.slug));
  const related = (component.related ?? []).flatMap(item => [
    !slugs.has(item.slug) && `related "${item.slug}" is not a catalog component`,
    item.slug === component.slug && "related must not reference itself",
    !nonEmptyText(item.note) && `related "${item.slug}" needs a note explaining the distinction`
  ]).filter(Boolean);
  const inline = proseOf(component).flatMap(referencedSlugs).filter(slug => !slugs.has(slug))
    .map(slug => `[[${slug}]] does not resolve to a catalog component`);
  return [...related, ...inline].map(message => problem(component.slug, message));
};

// Catalog-wide rules.
const catalogRules = catalog => {
  const docSlugs = catalog.components.map(item => item.slug);
  const categoryIds = catalog.categories.map(item => item.id);
  const ownership = catalog.components.flatMap(component => component.owns.map(root => ({ root, slug: component.slug })));
  const owners = root => ownership.filter(item => item.root === root).map(item => item.slug);
  const tags = catalog.components.map(item => item.tag);
  return [
    ...catalog.patternSlugs.filter(slug => !docSlugs.includes(slug)).map(slug => problem(slug, "canonical pattern has no catalog entry in catalog/components/")),
    ...categoryIds.filter(id => docSlugs.includes(id)).map(id => problem(id, "category id collides with a component slug (URL clash)")),
    ...catalog.categories.filter(category => category.components.length === 0).map(category => problem(category.id, "category has no components")),
    ...[...new Set(tags.filter((tag, i) => tags.indexOf(tag) !== i))].map(tag => problem(tag, "duplicate component tag")),
    ...catalog.hookIndex.roots
      .filter(root => !(root in catalog.unownedRoots))
      .filter(root => owners(root).length !== 1)
      .map(root => problem(root, owners(root).length === 0
        ? "public CSS block class is not documented by any catalog component (add it to a component's owns)"
        : `CSS block class is owned by several components: ${owners(root).join(", ")}`))
  ];
};

const compositionRules = catalog => {
  const slugs = new Set(catalog.components.map(item => item.slug));
  return catalog.compositions.flatMap(composition => {
    const html = composition.html ?? "";
    const tags = markupTags(html);
    return [
      !nonEmptyText(composition.title) && "title is required",
      !nonEmptyText(composition.description) && "description is required",
      !nonEmptyText(html) && "html is required",
      tags.length < 3 && "a composition should combine at least three catalog components",
      ...unsafeMarkup(html).map(pattern => `forbidden executable markup ${pattern}`),
      ...tags.filter(tag => !slugs.has(tag.slice(3))).map(tag => `<${tag}> is not a catalog component`),
      ...markupClasses(html).filter(name => !catalog.hookIndex.classes.has(name)).map(name => `class "${name}" does not exist in Forma CSS`)
    ].filter(Boolean).map(message => problem(`composition:${composition.slug}`, message));
  });
};

export const validateComponent = (catalog, component) => [
  ...structureRules(catalog, component),
  ...stateRules(component),
  ...exampleRules(catalog, component),
  ...apiRules(catalog, component),
  ...referenceRules(catalog, component)
];

export const validateCatalog = (catalog, only = []) => {
  const selected = only.length ? catalog.components.filter(item => only.includes(item.slug)) : catalog.components;
  return [
    ...(only.length ? [] : catalogRules(catalog)),
    ...(only.length ? [] : compositionRules(catalog)),
    ...selected.flatMap(component => validateComponent(catalog, component))
  ];
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const only = process.argv.slice(2);
  const catalog = await loadCatalog();
  const problems = validateCatalog(catalog, only);
  for (const item of problems) console.log(`${item.slug}: ${item.message}`);
  console.log(problems.length ? `\n${problems.length} catalog problem(s).` : `Catalog valid: ${only.length ? only.join(", ") : `${catalog.components.length} components`}.`);
  process.exitCode = problems.length ? 1 : 0;
}
