// Small, pure HTML helpers shared by every catalog renderer.

export const escapeHtml = value =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");

export const join = (items, render, separator = "") => items.map(render).join(separator);

export const when = (condition, render) => (condition ? render() : "");

export const componentHref = (rootPath, slug) => `${rootPath}components/${slug}/`;
export const categoryHref = (rootPath, id) => `${rootPath}components/${id}/`;

// Prose mini-format: `code` and [[slug]] links; everything else is escaped.
export const inline = (text, context) =>
  String(text ?? "")
    .split(/(`[^`]+`)/g)
    .map(segment =>
      segment.startsWith("`") && segment.endsWith("`") && segment.length > 1
        ? `<code>${escapeHtml(segment.slice(1, -1))}</code>`
        : escapeHtml(segment).replace(/\[\[([a-z0-9-]+)\]\]/g, (_, slug) => {
            const target = context.bySlug.get(slug);
            return target ? `<a href="${componentHref(context.rootPath, slug)}">${escapeHtml(target.name)}</a>` : escapeHtml(slug);
          }))
    .join("");

export const list = (items, context, className = "") =>
  items?.length ? `<ul${className ? ` class="${className}"` : ""}>${join(items, item => `<li>${inline(item, context)}</li>`)}</ul>` : "";

// Rewrites ids and id references so a snippet can be rendered more than once
// on a page (generated specimens) without duplicate ids or shared radio groups.
export const namespaceSnippet = (source, prefix) =>
  source
    .replace(/\bid="([^"]+)"/g, (_, value) => `id="${prefix}${value}"`)
    .replace(/\b(for|popovertarget|commandfor|interestfor|list|form)="([^"]+)"/g, (_, attribute, value) => `${attribute}="${prefix}${value}"`)
    .replace(/\b(aria-labelledby|aria-describedby|aria-controls|aria-owns|aria-activedescendant|aria-errormessage)="([^"]+)"/g, (_, attribute, value) =>
      `${attribute}="${value.split(/\s+/).map(token => prefix + token).join(" ")}"`)
    .replace(/\bhref="#([^"]+)"/g, (_, value) => `href="#${prefix}${value}"`)
    .replace(/\bname="([^"]+)"/g, (_, value) => `name="${prefix}${value}"`);

export const wrapTag = (slug, source) => `<ef-${slug} class="ef-component-tag">
${source}
</ef-${slug}>`;

// Compact list of attribute values: numeric runs become a range.
export const describeValues = values => {
  if (!values?.length) return "";
  const numbers = values.map(Number);
  if (numbers.every(Number.isInteger) && values.length > 6) {
    return `${Math.min(...numbers)}–${Math.max(...numbers)}`;
  }
  return values.map(value => `"${value}"`).join(", ");
};
