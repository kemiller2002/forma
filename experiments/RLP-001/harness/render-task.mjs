// Renders a task definition into TASK.md. The output is identical for every
// arm: it states semantic and functional requirements, never an
// implementation.

const KIND = {
  region: "structural region (no visible boundary required)",
  panel: "panel with a visible boundary",
  heading: "heading",
  text: "text",
  label: "label",
  control: "text input",
  select: "select",
  textarea: "multi-line text input",
  checkbox: "checkbox",
  radio: "radio button",
  button: "button",
  link: "link",
  media: "illustration (use assets/placeholder.svg)",
  message: "validation message",
  table: "data table",
  list: "list",
  item: "list item or entry",
  status: "status message"
};

const escapeCell = value => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");

const details = el => [
  el.tag ? `element \`<${el.tag}>\`` : "",
  el.level ? `heading level ${el.level}` : "",
  el.for ? `describes \`${el.for}\`` : "",
  el.hidden ? "starts hidden (`hidden` attribute)" : "",
  el.variant === "secondary" ? "secondary style" : "",
  el.label ? `accessible name "${el.label}"` : "",
  el.alt !== undefined ? `alt text "${el.alt}"${el.ratio ? `, aspect ratio ${el.ratio}` : ""}${el.size ? `, about ${el.size} square` : ""}` : "",
  el.attrs ? `attributes: ${Object.entries(el.attrs).map(([k, v]) => (v === true ? k : `${k}="${v}"`)).join(", ")}` : "",
  el.options ? `options: ${el.options.join(" / ")}` : "",
  el.items ? `items: ${el.items.join(" / ")}` : "",
  el.columns ? `columns: ${el.columns.join(", ")}; ${el.rows.length} rows: ${el.rows.map(r => r.join(", ")).join(" · ")}` : ""
].filter(Boolean).join("; ");

const describeStep = (step, n) => {
  const head = `${n}. `;
  if (step.op === "reveal") return `${head}\`${step.id}\` is revealed (its \`hidden\` attribute is removed).`;
  if (step.op === "hide") return `${head}\`${step.id}\` is hidden${step.then ? `, then ${describeStep(step.then, "").replace(/^\. /, "").replace(/\.$/, "")}` : ""}.`;
  if (step.op === "text") return `${head}The text of \`${step.id}\` changes to: "${step.text}".`;
  if (step.op === "remove") return `${head}\`${step.id}\` is removed from the page.`;
  if (step.op === "clone") return `${head}A copy of \`${step.source}\` is inserted after it as \`${step.id}\` (descendant \`data-rlp\` values are renamed from \`${step.source}-…\` to \`${step.id}-…\`, \`id\` attributes are removed) with new text: ${Object.entries(step.text).map(([k, v]) => `\`${k}\` "${v}"`).join(", ")}.`;
  return `${head}${step.op}`;
};

export const renderTask = task => `# ${task.title}

${task.goal}

## Required elements

Every element below must exist in \`index.html\` with the attribute
\`data-rlp="<id>"\` on the element that holds it (for controls, on the
control itself; for labels, on the \`<label>\`). Use the exact text shown.
"Inside" means the element must be placed within that parent element in the
markup and visually within it on screen.

| id | kind | inside | text | details |
|---|---|---|---|---|
${task.elements.map(el => `| \`${el.id}\` | ${KIND[el.kind] ?? el.kind} | ${el.parent ? `\`${el.parent}\`` : "page"} | ${escapeCell(el.text)} | ${escapeCell(details(el))} |`).join("\n")}

Labels must be programmatically associated with their controls, and
validation messages and hints with the controls they describe.

## Structure and relationships

${task.structure.map(s => `- ${s}`).join("\n")}
${task.alignTop?.length ? `\nPeers that share a line align their top edges: ${task.alignTop.map(g => g.map(id => `\`${id}\``).join(", ")).join("; ")}.\n` : ""}${task.equalWidth?.length ? `\nPeers that share a line have equal widths: ${task.equalWidth.map(g => g.map(id => `\`${id}\``).join(", ")).join("; ")}.\n` : ""}
Visual reading order follows this sequence: ${task.order.map(id => `\`${id}\``).join(" → ")}.

## Dynamic behavior

After the page loads, the validator applies these changes one at a time, and
the layout must stay valid after each one:

${task.dynamic.map((step, i) => describeStep(step, i + 1)).join("\n")}

## Acceptance criteria

1. The page works at every width from 320 to 1440 CSS px and when the user
   enlarges text.
2. No element overlaps another, no content is clipped or cut off, and the
   page never scrolls horizontally.
3. Every panel keeps its content inside its boundary with clear space.
4. Related elements sit close together; separate groups are visibly
   separated; siblings never touch.
5. Interactive targets are at least 24 × 24 CSS px.
6. The visual reading order matches the document order above.
7. Peers listed above align and size as stated when they share a line.
8. After each dynamic change the layout stays valid, and content above the
   change does not jump.
9. The page passes automated accessibility checks.
`;
