// X1 (RLP-001 extension 01): hierarchy-derived relational layout.
//
// A pure transform of the raw relational description, applied before the
// unchanged Arm C rules resolver. Separation and clearance are derived from
// structure instead of chosen by the author:
//
//   separation: a node's *height* (levels of nested groups beneath it) picks
//               the bond: height 1 tight, 2 related, 3 loose, >= 4 section.
//               A parent is always taller than any child group, so the
//               separation between groups always exceeds the separation
//               within them (Gestalt proximity); an inversion cannot occur.
//   clearance:  a container's depth among containers picks the clearance:
//               outermost spacious, next surface, deeper inset.
//
// Author-supplied bond and clearance attributes are ignored and reported.

const BOND_BY_HEIGHT = ["tight", "tight", "related", "loose", "section"];
const CLEARANCE_BY_DEPTH = ["spacious", "surface", "inset"];
const DERIVED = ["bond", "clearance", "clearanceBlock", "clearanceInline", "clearanceTop", "clearanceBottom"];

const isNode = raw => raw.kind === "container" || raw.kind === "group";

export const height = raw => (isNode(raw)
  ? 1 + raw.children.filter(isNode).reduce((m, c) => Math.max(m, height(c)), 0)
  : 0);

const pick = (table, index) => table[Math.min(index, table.length - 1)];

const strip = attrs => Object.fromEntries(Object.entries(attrs ?? {}).filter(([k]) => !DERIVED.includes(k)));

const transform = (raw, containerDepth) => {
  if (!isNode(raw)) return { raw, ignored: [] };
  const ownIgnored = Object.keys(raw.attrs ?? {}).filter(k => DERIVED.includes(k)).map(k => ({ node: raw.key, attribute: k }));
  const nextDepth = raw.kind === "container" ? containerDepth + 1 : containerDepth;
  const children = raw.children.map(c => transform(c, nextDepth));
  const attrs = {
    ...strip(raw.attrs),
    bond: pick(BOND_BY_HEIGHT, height(raw)),
    ...(raw.kind === "container" ? { clearance: pick(CLEARANCE_BY_DEPTH, containerDepth) } : {})
  };
  return {
    raw: { ...raw, attrs, children: children.map(c => c.raw) },
    ignored: [...ownIgnored, ...children.flatMap(c => c.ignored)]
  };
};

// Returns the transformed description and warnings for ignored attributes.
export const deriveHierarchy = raw => {
  const { raw: derived, ignored } = transform(raw, 0);
  return {
    raw: derived,
    diagnostics: ignored.map(i => ({ code: "ignored-attribute", severity: "warning", node: i.node, detail: `${i.attribute} is derived from structure in this layout model and was ignored` }))
  };
};
