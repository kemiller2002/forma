import { evaluateAlignment, evaluateOverflow, STATUS } from "../../../packages/conformance/src/evaluate.mjs";

// Pure, arm-neutral geometry checks. Input: a task definition and one
// capture() result; output: a list of failures. Each failure names the
// invariant, the element or relationship, what was expected and what was
// observed. Callers add task, arm, attempt, viewport and step.

const TOL = 1;
const MIN_SEPARATION = 4;
const MIN_SEPARATION_TOGGLE = 2;  // checkbox or radio beside its own label
const MIN_CLEARANCE = 4;
const MAX_PROXIMITY_REM = 1.5;
const MIN_TARGET = 24;
const INTERACTIVE_KINDS = new Set(["control", "select", "textarea", "checkbox", "radio", "button", "link"]);
const TEXT_KINDS = new Set(["heading", "text", "label", "message", "status", "item", "link", "button"]);

const failure = (invariant, element, expected, observed, extra = {}) => ({ invariant, element, expected, observed, ...extra });

const gap = (a, b) => Math.max(b.x - a.right, a.x - b.right, b.y - a.bottom, a.y - b.bottom);
const overlapArea = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y));
const sameRow = (a, b) => Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 0.5 * Math.min(a.h, b.h);
const round = v => Math.round(v * 100) / 100;
const boxText = b => `${round(b.x)},${round(b.y)} ${round(b.w)}×${round(b.h)}`;

const rows = items => items.reduce((groups, item) => {
  const row = groups.find(g => g.some(other => sameRow(other.box, item.box)));
  return row ? groups.map(g => (g === row ? [...g, item] : g)) : [...groups, [item]];
}, []);

// Elements expected in the page at this step (after dynamic operations).
export const expectedElements = (task, state) => task.elements
  .filter(el => !state.removed.has(el.id))
  .concat(state.added);

export const checkSnapshot = (task, snapshot, state, { fontScale = 1 } = {}) => {
  const byId = new Map(snapshot.elements.map(el => [el.id, el]));
  const expected = expectedElements(task, state);
  const kindOf = new Map(expected.map(el => [el.id, el]));
  const shouldShow = el => !(state.hidden.has(el.id) || (el.hidden && !state.revealed.has(el.id)) || expected.some(p => p.id === el.parent && (state.hidden.has(p.id) || (p.hidden && !state.revealed.has(p.id)))));
  const visible = expected.filter(shouldShow).map(el => ({ spec: el, dom: byId.get(el.id) })).filter(x => x.dom?.visible);
  const visibleIds = new Set(visible.map(x => x.spec.id));
  const vw = snapshot.viewport.width;
  const remPx = snapshot.remPx;

  const presence = expected.flatMap(el => {
    const dom = byId.get(el.id);
    if (!dom) return [failure("presence", el.id, "element tagged with data-rlp", "missing")];
    if (shouldShow(el) && !dom.visible) return [failure("presence", el.id, "visible", "not rendered")];
    if (!shouldShow(el) && dom.visible) return [failure("presence", el.id, "hidden", "visible")];
    return [];
  });

  const escapes = visible.filter(({ dom }) => dom.box.right > vw + TOL || dom.box.x < -TOL).map(({ spec }) => spec.id);
  const overflowReport = evaluateOverflow({ scrollWidth: snapshot.scrollWidth, clientWidth: snapshot.clientWidth, escapes });
  const overflow = [
    ...(snapshot.scrollWidth > snapshot.clientWidth ? [failure("horizontal-overflow", "document", `scrollWidth <= ${snapshot.clientWidth}`, `${snapshot.scrollWidth} (${overflowReport.ruleId})`)] : []),
    ...escapes.map(id => failure("offscreen", id, `within 0..${vw}`, boxText(byId.get(id).box)))
  ];

  const clipping = visible.flatMap(({ spec, dom }) => {
    const clippedBy = dom.clippers.filter(c => !c.scroll).find(c =>
      dom.box.x < c.box.x - TOL || dom.box.right > c.box.right + TOL || dom.box.y < c.box.y - TOL || dom.box.bottom > c.box.bottom + TOL);
    const ownOverflow = TEXT_KINDS.has(spec.kind) && dom.display !== "inline" && dom.clientWidth > 0
      && (dom.scrollWidth > dom.clientWidth + TOL || (dom.overflowY !== "visible" && dom.scrollHeight > dom.clientHeight + TOL));
    return [
      ...(clippedBy ? [failure("clipping", spec.id, `inside clipping ancestor ${clippedBy.rlp ?? "(untagged)"}`, `${boxText(dom.box)} vs ${boxText(clippedBy.box)}`)] : []),
      ...(ownOverflow ? [failure("content-overflow", spec.id, "content fits its box", `scroll ${dom.scrollWidth}×${dom.scrollHeight} > client ${dom.clientWidth}×${dom.clientHeight}`)] : [])
    ];
  });

  const containment = visible.flatMap(({ spec, dom }) => {
    if (!spec.parent || !visibleIds.has(spec.parent)) return [];
    const parent = byId.get(spec.parent);
    const p = parent.box;
    const c = dom.box;
    const inside = c.x >= p.x - TOL && c.right <= p.right + TOL && c.y >= p.y - TOL && c.bottom <= p.bottom + TOL;
    if (!inside) return [failure("containment", spec.id, `inside ${spec.parent}`, `${boxText(c)} vs ${boxText(p)}`, { relationship: `${spec.id} ⊂ ${spec.parent}` })];
    const parentSpec = kindOf.get(spec.parent);
    const bounded = parentSpec?.kind === "panel";
    const clearance = Math.min(c.x - p.x, p.right - c.right, c.y - p.y, p.bottom - c.bottom);
    return bounded && clearance < MIN_CLEARANCE - 0.01
      ? [failure("clearance", spec.id, `>= ${MIN_CLEARANCE}px from ${spec.parent} boundary`, `${round(clearance)}px`, { relationship: `${spec.id} ⊂ ${spec.parent}` })]
      : [];
  });

  const siblings = [...visible.reduce((groups, item) => groups.set(item.spec.parent ?? "", [...(groups.get(item.spec.parent ?? "") ?? []), item]), new Map()).values()];
  const pairwise = siblings.flatMap(group => group.flatMap((a, i) => group.slice(i + 1).map(b => [a, b])))
    .filter(([a, b]) => !a.dom.ancestors.includes(b.spec.id) && !b.dom.ancestors.includes(a.spec.id));
  const separation = pairwise.flatMap(([a, b]) => {
    const area = overlapArea(a.dom.box, b.dom.box);
    if (area > 1) return [failure("overlap", `${a.spec.id} × ${b.spec.id}`, "no overlap", `${round(area)}px²`, { relationship: `${a.spec.id} × ${b.spec.id}` })];
    const toggle = ["checkbox", "radio"].some(k => a.spec.kind === k || b.spec.kind === k) && (a.spec.for === b.spec.id || b.spec.for === a.spec.id);
    const minimum = toggle ? MIN_SEPARATION_TOGGLE : MIN_SEPARATION;
    const distance = gap(a.dom.box, b.dom.box);
    return distance < minimum - 0.01 ? [failure("separation", `${a.spec.id} × ${b.spec.id}`, `>= ${minimum}px apart`, `${round(distance)}px`, { relationship: `${a.spec.id} × ${b.spec.id}` })] : [];
  });

  const targets = visible.filter(({ spec }) => INTERACTIVE_KINDS.has(spec.kind)).flatMap(({ spec, dom }) =>
    (dom.box.w < MIN_TARGET - 0.01 || dom.box.h < MIN_TARGET - 0.01 ? [failure("target-size", spec.id, `>= ${MIN_TARGET}×${MIN_TARGET}`, `${round(dom.box.w)}×${round(dom.box.h)}`)] : []));

  const proximityLimit = MAX_PROXIMITY_REM * remPx;
  const declaredPairs = [
    ...visible.filter(({ spec }) => spec.for && visibleIds.has(spec.for)).map(({ spec }) => [spec.id, spec.for]),
    ...(task.pairs ?? []).filter(([a, b]) => visibleIds.has(a) && visibleIds.has(b))
  ];
  // A label, hint or message is near its control when it is near the control
  // or near another visible element that describes the same control (a
  // message below a hint below its input still belongs to the input).
  const describing = control => visible.filter(({ spec }) => spec.for === control).map(({ spec }) => spec.id);
  const proximity = declaredPairs.flatMap(([a, b]) => {
    const peers = [b, ...describing(b).filter(id => id !== a)];
    const distance = Math.min(...peers.map(id => gap(byId.get(a).box, byId.get(id).box)));
    return distance > proximityLimit + TOL ? [failure("proximity", `${a} ~ ${b}`, `<= ${round(proximityLimit)}px apart`, `${round(distance)}px`, { relationship: `${a} ~ ${b}` })] : [];
  });
  const controls = visible.filter(({ spec }) => ["control", "select", "textarea", "checkbox", "radio"].includes(spec.kind));
  const ambiguity = visible.filter(({ spec }) => spec.kind === "label" && spec.for && visibleIds.has(spec.for)).flatMap(({ spec, dom }) => {
    const own = gap(dom.box, byId.get(spec.for).box);
    const nearer = controls.filter(c => c.spec.id !== spec.for && gap(dom.box, c.dom.box) < own - TOL);
    return nearer.length ? [failure("label-ambiguity", spec.id, `nearest control is ${spec.for}`, `${nearer[0].spec.id} is nearer (${round(gap(dom.box, nearer[0].dom.box))}px vs ${round(own)}px)`, { relationship: `${spec.id} → ${spec.for}` })] : [];
  });

  const peerGroups = (groups, invariant, measure) => (groups ?? []).flatMap((group, gi) => {
    const present = group.filter(id => visibleIds.has(id)).map(id => ({ id, box: byId.get(id).box }));
    return rows(present).filter(row => row.length > 1).flatMap(row => {
      if (invariant === "alignment") {
        const report = evaluateAlignment(
          { ruleId: "ULI-L01", id: `${task.id}-align-${gi}`, edge: "top", toleranceCssPx: TOL, peers: row.map(r => ({ role: "text", name: r.id })) },
          row.map(r => ({ peer: { role: "text", name: r.id }, count: 1, box: { x: r.box.x, y: r.box.y, width: r.box.w, height: r.box.h } }))
        );
        return report.status === STATUS.FAIL ? [failure("alignment", row.map(r => r.id).join(" | "), `top edges within ${TOL}px`, `delta ${round(report.deltaCssPx)}px`, { relationship: row.map(r => r.id).join(" | ") })] : [];
      }
      const values = row.map(r => measure(r.box));
      const delta = Math.max(...values) - Math.min(...values);
      return delta > TOL ? [failure(invariant, row.map(r => r.id).join(" | "), `within ${TOL}px`, `delta ${round(delta)}px`, { relationship: row.map(r => r.id).join(" | ") })] : [];
    });
  });
  const alignment = [...peerGroups(task.alignTop, "alignment"), ...peerGroups(task.equalWidth, "equal-width", b => b.w)];

  const sequence = task.order.filter(id => visibleIds.has(id)).map(id => ({ id, box: byId.get(id).box }));
  const order = sequence.slice(1).flatMap((b, i) => {
    const a = sequence[i];
    const before = sameRow(a.box, b.box) ? b.box.x < a.box.x - TOL : b.box.y < a.box.y - TOL;
    return before ? [failure("reading-order", `${a.id} → ${b.id}`, `${b.id} after ${a.id}`, `${b.id} at ${boxText(b.box)}, ${a.id} at ${boxText(a.box)}`, { relationship: `${a.id} → ${b.id}` })] : [];
  });

  return [...presence, ...overflow, ...clipping, ...containment, ...separation, ...targets, ...proximity, ...ambiguity, ...alignment, ...order]
    .map(f => ({ ...f, fontScale }));
};

// Unexpected layout shift: elements entirely above the changed element (in
// the previous layout) must not move. Reflow below or beside it is intended.
export const checkShift = (before, after, target) => {
  const prev = new Map(before.elements.map(el => [el.id, el]));
  const next = new Map(after.elements.map(el => [el.id, el]));
  const anchor = prev.get(target)?.visible ? prev.get(target) : next.get(target);
  if (!anchor) return [];
  const line = anchor.box.y;
  return before.elements
    .filter(el => el.visible && el.id !== target && el.box.bottom <= line - TOL && !anchor.ancestors.includes(el.id) && !el.ancestors.includes(target))
    .flatMap(el => {
      const now = next.get(el.id);
      if (!now?.visible) return [];
      const moved = Math.max(Math.abs(now.box.x - el.box.x), Math.abs(now.box.y - el.box.y), Math.abs(now.box.w - el.box.w), Math.abs(now.box.h - el.box.h));
      return moved > TOL ? [failure("unexpected-shift", el.id, `unchanged (above ${target})`, `moved ${round(moved)}px`, { relationship: `${el.id} ↑ ${target}` })] : [];
    });
};

export const sameGeometry = (a, b) => {
  const other = new Map(b.elements.map(el => [el.id, el]));
  return a.elements.flatMap(el => {
    const o = other.get(el.id);
    const delta = o ? Math.max(...["x", "y", "w", "h"].map(k => Math.abs(el.box[k] - o.box[k]))) : Infinity;
    return delta > 0.5 ? [failure("determinism", el.id, "identical geometry on reload (±0.5px)", Number.isFinite(delta) ? `differs by ${round(delta)}px` : "missing on reload")] : [];
  });
};
