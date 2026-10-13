// Declared alignment groups for catalog examples
// (visual-engineering/UI-LAYOUT-INTERACTION@1.0.0 ULI-L01, L02, L10).
// An example names the peers whose edges must match:
//   alignment: [{ ruleId: "ULI-L01", id, edge, peers: [{ role, name }, ...] }]
// and the canonical Basic example uses `basicAlignment`. Groups are declared,
// never inferred from CSS; tests/site-browser/catalog-alignment.spec.mjs
// measures every group at the contract widths.

export const ALIGNMENT_EDGES = Object.freeze(["top", "bottom", "center", "left", "right"]);

const isKebab = value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value ?? "");

// Problems with one example's alignment declarations against its markup. Pure.
export const alignmentProblems = (groups, html) => {
  if (groups === undefined) return [];
  if (!Array.isArray(groups) || groups.length === 0) return ["alignment must be a non-empty list of groups"];
  const ids = groups.map(group => group?.id);
  return [
    ...(new Set(ids).size !== ids.length ? ["alignment group ids must be unique"] : []),
    ...groups.flatMap((group, index) => {
      const where = `alignment[${index}]`;
      const peers = group?.peers ?? [];
      return [
        !/^ULI-L\d{2}$/.test(group?.ruleId ?? "") && `${where} must cite a ULI-L rule ID`,
        !isKebab(group?.id) && `${where}.id must be kebab-case`,
        !ALIGNMENT_EDGES.includes(group?.edge) && `${where}.edge must be one of ${ALIGNMENT_EDGES.join(", ")}`,
        group?.toleranceCssPx !== undefined && !(group.toleranceCssPx >= 0) && `${where}.toleranceCssPx must be a non-negative number`,
        !(Array.isArray(peers) && peers.length >= 2) && `${where} needs at least two peers`,
        ...peers.flatMap((peer, peerIndex) => [
          !(peer?.role && peer?.name) && `${where}.peers[${peerIndex}] needs role and name`,
          peer?.name && !String(html).includes(peer.name) && `${where}.peers[${peerIndex}] "${peer.name}" does not appear in the example markup`
        ])
      ];
    }).filter(Boolean)
  ];
};

export const exampleAlignments = component => [
  { id: "basic", mobile: false, groups: component.basicAlignment ?? [] },
  ...component.examples.map(example => ({ id: example.id, mobile: Boolean(example.mobile), groups: example.alignment ?? [] }))
].filter(item => item.groups.length);
