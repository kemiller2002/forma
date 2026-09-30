export default {
  name: "Diagram",
  category: "workflow",
  behavior: "Application content",
  summary: "Presentation-only diagram nodes, connectors, metadata and key; the consumer owns geometry, routing, semantics and color mapping.",
  owns: ["ef-diagram","ef-diagram-connector","ef-diagram-legend","ef-diagram-marker","ef-diagram-node"],
  purpose: {
    description: "The diagram family renders a workflow or relationship diagram that has already been laid out by the consumer. A `figure.ef-diagram` holds a caption, a scrollable canvas, a text list of every relationship and an optional key. Nodes are HTML articles placed with `--ef-diagram-x`, `--ef-diagram-y` and `--ef-diagram-w`; connectors are SVG paths whose geometry is supplied by the consumer. Forma paints boxes, shapes, line styles, arrowheads, labels and authored colors. It never lays out, routes, selects, drags or validates anything, and it never infers meaning from color: each node states its kind and state as text, and the relationship list carries every connection without the drawing.",
    useWhen: [
      "An application or export (for example Forma Studio) has computed node positions and connector paths and needs production-quality, dependency-free HTML and SVG output.",
      "Nodes need authored colors, for example by owning team, while kind and state stay in text.",
      "The diagram must remain understandable in forced colors, grayscale print and to screen readers."
    ],
    avoidWhen: [
      "The relationships are a simple sequence: use [[steps]] or [[provenance-trail]], which reflow without a canvas.",
      "Items move between columns by status: use [[lane-board]].",
      "Users explore a large spatial surface with an index and orientation: use [[spatial-canvas]].",
      "The consumer cannot supply geometry: Forma has no automatic layout, so use a list such as [[relationship-index]] instead."
    ],
    characteristics: [
      "Geometry is physical, like SVG: `left`/`top` placement does not mirror in right-to-left documents, so nodes stay attached to their connectors.",
      "Non-color cues: visible kind text, `data-ef-shape`, `data-ef-line` and the relationship list.",
      "Authored color arrives as resolved custom property values; removing one restores the Forma token default.",
      "Focus uses Forma's foundation ring and never reads authored color."
    ]
  },
  examples: [
    {
      id: "default-appearance",
      title: "Approval chain with default styling",
      description: "Three nodes with no authored color, so every surface uses Forma tokens. The rejection path is dashed and labelled, the start and end nodes use the pill shape, and the relationship list repeats each connector in reading order.",
      html: `<ef-diagram class="ef-component-tag">
  <figure class="ef-diagram" aria-labelledby="diagram-default-appearance-title">
    <figcaption id="diagram-default-appearance-title">Expense approval</figcaption>
    <div class="ef-diagram__viewport" tabindex="0" role="group" aria-label="Expense approval canvas, scroll to see all items">
      <div class="ef-diagram__canvas" style="--ef-diagram-canvas-w: 640px; --ef-diagram-canvas-h: 250px;">
        <svg class="ef-diagram__wires" viewBox="0 0 640 250" aria-hidden="true" focusable="false">
          <defs>
            <marker id="diagram-default-appearance-arrow" class="ef-diagram-marker" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"/></marker>
          </defs>
          <path class="ef-diagram-connector" d="M196 60 H228" marker-end="url(#diagram-default-appearance-arrow)"/>
          <path class="ef-diagram-connector" d="M412 60 H444" marker-end="url(#diagram-default-appearance-arrow)"/>
          <path class="ef-diagram-connector" data-ef-line="dashed" d="M320 110 V150 H106 V116" marker-end="url(#diagram-default-appearance-arrow)"/>
        </svg>
        <article class="ef-diagram-node" data-ef-shape="pill" aria-labelledby="diagram-default-appearance-submit" style="--ef-diagram-x: 16px; --ef-diagram-y: 20px; --ef-diagram-w: 180px;">
          <p class="ef-diagram-node__kind">Start</p>
          <h3 class="ef-diagram-node__label" id="diagram-default-appearance-submit">Submit claim</h3>
        </article>
        <article class="ef-diagram-node" aria-labelledby="diagram-default-appearance-review" style="--ef-diagram-x: 230px; --ef-diagram-y: 20px; --ef-diagram-w: 180px;">
          <p class="ef-diagram-node__kind">Decision</p>
          <h3 class="ef-diagram-node__label" id="diagram-default-appearance-review">Manager review</h3>
          <dl class="ef-diagram-node__meta"><dt>State</dt><dd>Active</dd></dl>
        </article>
        <article class="ef-diagram-node" data-ef-shape="pill" aria-labelledby="diagram-default-appearance-paid" style="--ef-diagram-x: 446px; --ef-diagram-y: 20px; --ef-diagram-w: 180px;">
          <p class="ef-diagram-node__kind">End</p>
          <h3 class="ef-diagram-node__label" id="diagram-default-appearance-paid">Reimbursed</h3>
        </article>
        <span class="ef-diagram-connector__label" style="--ef-diagram-x: 150px; --ef-diagram-y: 160px;">rejected, needs receipt</span>
      </div>
    </div>
    <ol class="ef-diagram__relations" aria-label="Relationships">
      <li>Submit claim leads to Manager review (solid line).</li>
      <li>Manager review leads to Reimbursed when approved (solid line).</li>
      <li>Manager review returns to Submit claim when rejected for a missing receipt (dashed line).</li>
    </ol>
  </figure>
</ef-diagram>`
    },
    {
      id: "authored-color",
      title: "Authored color by owning team",
      description: "The consumer maps owning team to fill and accent through its own profile and passes resolved values. Two different kinds share one color and the key explains the mapping. One connector has an authored stroke and weight; its meaning is still stated in the relationship list.",
      html: `<ef-diagram class="ef-component-tag">
  <figure class="ef-diagram" aria-labelledby="diagram-authored-color-title">
    <figcaption id="diagram-authored-color-title">Incident escalation</figcaption>
    <p>Fill color shows the owning team only. Kind and state are written on each item.</p>
    <div class="ef-diagram__viewport" tabindex="0" role="group" aria-label="Incident escalation canvas, scroll to see all items">
      <div class="ef-diagram__canvas" style="--ef-diagram-canvas-w: 640px; --ef-diagram-canvas-h: 170px;">
        <svg class="ef-diagram__wires" viewBox="0 0 640 170" aria-hidden="true" focusable="false">
          <defs>
            <marker id="diagram-authored-color-arrow" class="ef-diagram-marker" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"/></marker>
          </defs>
          <path class="ef-diagram-connector" d="M196 70 H228" marker-end="url(#diagram-authored-color-arrow)"/>
          <path class="ef-diagram-connector" data-ef-line="dotted" style="--ef-diagram-connector-stroke: #8a5300; --ef-diagram-connector-width: 3;" d="M412 70 H444" marker-end="url(#diagram-authored-color-arrow)"/>
        </svg>
        <article class="ef-diagram-node" data-ef-shape="rounded" aria-labelledby="diagram-authored-color-triage" style="--ef-diagram-x: 16px; --ef-diagram-y: 20px; --ef-diagram-w: 180px; --ef-diagram-fill: #e8f0ff; --ef-diagram-accent: #2f5fb3; --ef-diagram-foreground: #1d1d1b;">
          <p class="ef-diagram-node__kind">Task</p>
          <h3 class="ef-diagram-node__label" id="diagram-authored-color-triage">Triage alert</h3>
          <dl class="ef-diagram-node__meta"><dt>State</dt><dd>Done</dd><dt>Team</dt><dd>Support</dd></dl>
        </article>
        <article class="ef-diagram-node" aria-labelledby="diagram-authored-color-decide" style="--ef-diagram-x: 230px; --ef-diagram-y: 20px; --ef-diagram-w: 180px; --ef-diagram-fill: #e8f0ff; --ef-diagram-accent: #2f5fb3; --ef-diagram-foreground: #1d1d1b;">
          <p class="ef-diagram-node__kind">Decision</p>
          <h3 class="ef-diagram-node__label" id="diagram-authored-color-decide">Customer impact?</h3>
          <dl class="ef-diagram-node__meta"><dt>State</dt><dd>Active</dd><dt>Team</dt><dd>Support</dd></dl>
        </article>
        <article class="ef-diagram-node" data-ef-shape="rounded" aria-labelledby="diagram-authored-color-page" style="--ef-diagram-x: 446px; --ef-diagram-y: 20px; --ef-diagram-w: 180px; --ef-diagram-fill: #fff1d6; --ef-diagram-stroke: #5c3a00; --ef-diagram-accent: #8a5300; --ef-diagram-foreground: #1d1d1b;">
          <p class="ef-diagram-node__kind">Task</p>
          <h3 class="ef-diagram-node__label" id="diagram-authored-color-page">Page on-call engineer</h3>
          <dl class="ef-diagram-node__meta"><dt>State</dt><dd>Waiting</dd><dt>Team</dt><dd>Platform</dd></dl>
        </article>
      </div>
    </div>
    <ol class="ef-diagram__relations" aria-label="Relationships">
      <li>Triage alert leads to Customer impact? (solid line).</li>
      <li>Customer impact? leads to Page on-call engineer when customers are affected (dotted line, handed to another team).</li>
    </ol>
    <dl class="ef-diagram-legend" aria-label="Key: fill color by owning team">
      <div><dt><span class="ef-diagram-legend__swatch" style="--ef-diagram-fill: #e8f0ff; --ef-diagram-accent: #2f5fb3;"></span> Support</dt><dd>blue fill</dd></div>
      <div><dt><span class="ef-diagram-legend__swatch" style="--ef-diagram-fill: #fff1d6; --ef-diagram-stroke: #5c3a00; --ef-diagram-accent: #8a5300;"></span> Platform</dt><dd>amber fill, dark border</dd></div>
    </dl>
  </figure>
</ef-diagram>`
    },
    {
      id: "mobile-scrolling-canvas",
      title: "Mobile scrolling canvas",
      description: "On a phone the fixed-size canvas scrolls inside its own focusable viewport, while the caption and the relationship list reflow to the screen width.",
      mobile: {
        height: 560,
        notes: [
          "The canvas keeps its consumer-supplied size (here 560 by 150 px) and scrolls inside `.ef-diagram__viewport`; the page itself does not scroll sideways at 320px.",
          "The viewport is a focusable, named group, so keyboard users can scroll it with the arrow keys and touch users can pan it; `overscroll-behavior: contain` stops the pan from scrolling the page.",
          "The relationship list and key reflow to full width, so every connection is readable without panning the canvas.",
          "Node text wraps with `overflow-wrap: anywhere` inside the authored node width; Forma does not rescale geometry for orientation changes."
        ]
      },
      html: `<ef-diagram class="ef-component-tag">
  <figure class="ef-diagram" aria-labelledby="diagram-mobile-title">
    <figcaption id="diagram-mobile-title">Password reset</figcaption>
    <div class="ef-diagram__viewport" tabindex="0" role="group" aria-label="Password reset canvas, scroll to see all items">
      <div class="ef-diagram__canvas" style="--ef-diagram-canvas-w: 560px; --ef-diagram-canvas-h: 150px;">
        <svg class="ef-diagram__wires" viewBox="0 0 560 150" aria-hidden="true" focusable="false">
          <defs>
            <marker id="diagram-mobile-arrow" class="ef-diagram-marker" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"/></marker>
          </defs>
          <path class="ef-diagram-connector" d="M176 60 H198" marker-end="url(#diagram-mobile-arrow)"/>
          <path class="ef-diagram-connector" d="M362 60 H384" marker-end="url(#diagram-mobile-arrow)"/>
        </svg>
        <article class="ef-diagram-node" data-ef-shape="pill" aria-labelledby="diagram-mobile-request" style="--ef-diagram-x: 16px; --ef-diagram-y: 20px; --ef-diagram-w: 160px;">
          <p class="ef-diagram-node__kind">Start</p>
          <h3 class="ef-diagram-node__label" id="diagram-mobile-request">Request link</h3>
        </article>
        <article class="ef-diagram-node" aria-labelledby="diagram-mobile-verify" style="--ef-diagram-x: 200px; --ef-diagram-y: 20px; --ef-diagram-w: 160px;">
          <p class="ef-diagram-node__kind">Task</p>
          <h3 class="ef-diagram-node__label" id="diagram-mobile-verify">Verify email</h3>
        </article>
        <article class="ef-diagram-node" data-ef-shape="pill" aria-labelledby="diagram-mobile-set" style="--ef-diagram-x: 386px; --ef-diagram-y: 20px; --ef-diagram-w: 160px;">
          <p class="ef-diagram-node__kind">End</p>
          <h3 class="ef-diagram-node__label" id="diagram-mobile-set">Set new password</h3>
        </article>
      </div>
    </div>
    <ol class="ef-diagram__relations" aria-label="Relationships">
      <li>Request link leads to Verify email (solid line).</li>
      <li>Verify email leads to Set new password (solid line).</li>
    </ol>
  </figure>
</ef-diagram>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "figure, node article", values: "id of the caption or node label", default: "—", description: "Names the diagram by its caption and each node by its label heading." },
      { name: "tabindex", on: ".ef-diagram__viewport", values: "0", default: "—", description: "Makes the scrolling canvas reachable by keyboard so it can be scrolled without a pointer." },
      { name: "role", on: ".ef-diagram__viewport", values: "group", default: "—", description: "Gives the focusable viewport a role so its name is announced." },
      { name: "aria-label", on: "viewport, relations list, legend", values: "string", default: "—", description: "Names the canvas (say that it scrolls), the relationship list and the key." },
      { name: "aria-hidden", on: "svg.ef-diagram__wires", values: "true", default: "—", description: "Hides the drawn connectors; the relationship list is their text equivalent." },
      { name: "focusable", on: "svg.ef-diagram__wires", values: "false", default: "—", description: "Keeps legacy browsers from putting the SVG in the tab order." },
      { name: "marker-end", on: "path.ef-diagram-connector", values: "url(#marker-id)", default: "—", description: "Attaches the arrowhead. Marker ids must be unique in the document." },
      { name: "style", on: "canvas, node, connector, label, swatch", values: "custom property declarations", default: "—", description: "Where the consumer writes resolved geometry and authored color values." }
    ],
    hooks: {
      "ef-diagram": "The `figure` root: a single-column grid of caption, optional description, viewport, relationship list and key.",
      "ef-diagram__viewport": "Bordered region that scrolls the canvas in both directions and contains overscroll.",
      "ef-diagram__canvas": "Positioning context sized by `--ef-diagram-canvas-w` and `--ef-diagram-canvas-h`.",
      "ef-diagram__wires": "The SVG layer that fills the canvas and draws connectors. Ignores pointer events. Its `viewBox` must match the canvas size so path coordinates and node positions share one pixel space.",
      "ef-diagram__relations": "Ordered list with one text item per connector, in reading order.",
      "ef-diagram-node": "An absolutely placed node box with a 2px border and a 6px inline-start accent. Long text wraps anywhere.",
      "ef-diagram-node__kind": "Visible kind text (Task, Decision, End), small uppercase. The primary non-color cue.",
      "ef-diagram-node__label": "The node's label, normally an `h3` that also names the node.",
      "ef-diagram-node__meta": "A `dl` of metadata the consumer chose to show, laid out as a two-column grid.",
      "data-ef-shape": "Node shape: absent for a rectangle, `rounded` for rounded corners, `pill` for fully rounded ends. Presentation only.",
      "ef-diagram-connector": "An SVG `path` connector; stroke comes from authored or token values.",
      "ef-diagram-connector__label": "A text label placed on the canvas with `--ef-diagram-x`/`-y`, on a surface-colored background.",
      "data-ef-line": "Connector line style: absent for solid, `dashed` or `dotted`. Presentation only; state the meaning in the relationship list.",
      "ef-diagram-marker": "An SVG `marker` for arrowheads, filled with the functional border color.",
      "ef-diagram-legend": "A `dl` key that explains any authored color mapping; wraps as a flex row.",
      "ef-diagram-legend__swatch": "A small sample box that reads the same color properties as a node.",
      "--ef-diagram-canvas-w": "Canvas width in px, supplied by the consumer. Default 720px.",
      "--ef-diagram-canvas-h": "Canvas height in px, supplied by the consumer. Default 320px.",
      "--ef-diagram-x": "Horizontal position of a node or connector label from the canvas's left edge (physical, not mirrored in RTL).",
      "--ef-diagram-y": "Vertical position of a node or connector label from the canvas top.",
      "--ef-diagram-w": "Node width. Default 12rem.",
      "--ef-diagram-fill": "Authored node background. Falls back to the primary surface token.",
      "--ef-diagram-stroke": "Authored node border. Falls back to the functional border token.",
      "--ef-diagram-accent": "Authored inline-start accent bar. Falls back to the node stroke.",
      "--ef-diagram-foreground": "Authored node text color. The consumer is responsible for contrast against the fill.",
      "--ef-diagram-node-fill": "Internal resolved fill on each node; read-only. Set `--ef-diagram-fill` instead.",
      "--ef-diagram-node-stroke": "Internal resolved border color; read-only. Set `--ef-diagram-stroke` instead.",
      "--ef-diagram-node-accent": "Internal resolved accent color; read-only. Set `--ef-diagram-accent` instead.",
      "--ef-diagram-node-foreground": "Internal resolved text color; read-only. Set `--ef-diagram-foreground` instead.",
      "--ef-diagram-connector-stroke": "Authored connector color. Falls back to the functional border token.",
      "--ef-diagram-connector-width": "Authored connector stroke width in SVG units. Default 2."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves to the canvas viewport, then to any links inside nodes in source order." },
      { keys: "Arrow keys, Page Up / Page Down (viewport focused)", action: "Scrolls the canvas. Native scrolling of a focused overflow region." },
      { keys: "Selection, moving or connecting nodes", action: "Not provided. Editing interactions belong to the consuming editor and must not reuse `ef-diagram*` classes." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Default appearance", how: "no authored custom properties", description: "Nodes and connectors use Forma surface, border and text tokens." },
    { name: "Authored color", how: "--ef-diagram-fill / -stroke / -accent / -foreground, --ef-diagram-connector-stroke / -width", description: "Consumer-resolved colors; removing one restores the token default." },
    { name: "Shape", how: "data-ef-shape=\"rounded\" | \"pill\"", description: "Rounded corners or pill ends; rectangle when absent." },
    { name: "Line style", how: "data-ef-line=\"dashed\" | \"dotted\"", description: "Dash pattern on a connector; solid when absent." },
    { name: "Viewport focus", how: ":focus-visible on .ef-diagram__viewport", description: "Foundation focus ring, independent of authored color." },
    { name: "Forced colors", how: "@media (forced-colors: active)", description: "Nodes, swatches and labels become Canvas/CanvasText; connectors and markers use CanvasText. Kind text, shape and line style remain." },
    { name: "Print", how: "@media print", description: "Viewport stops scrolling, borders turn black and nodes avoid page breaks." }
  ],
  accessibility: {
    forma: [
      "Provides a structural place for a text relationship list, so every connection is available without the drawing, color or SVG.",
      "Keeps kind text, shape and line style visible in forced colors, grayscale and backgrounds-off print.",
      "Makes the canvas scroll inside its own region so the page does not overflow at 320px.",
      "Never derives focus appearance from authored color."
    ],
    consumer: [
      "Write one relationship item per connector, in reading order, including the meaning of any dashed or dotted line.",
      "Give every node a visible kind and, where relevant, a state in text; never let color, shape or line style be the only carrier of meaning.",
      "Provide a key whenever color carries grouping information, and check contrast between authored fill and foreground.",
      "Make the viewport focusable with a name that says it scrolls, and keep marker ids unique.",
      "Keep node source order meaningful; it is the reading order for assistive technology regardless of position."
    ]
  },
  responsive: [
    "The figure is a single-column grid that shrinks to the container; the canvas does not reflow because geometry belongs to the consumer.",
    "When the canvas is wider or taller than the viewport, `.ef-diagram__viewport` scrolls in both directions with contained overscroll.",
    "Node text wraps within `--ef-diagram-w`; at 200% text size nodes grow taller, so consumer layouts should leave vertical room.",
    "Connector labels do not wrap (`white-space: nowrap`); keep them short.",
    "The relationship list and the key reflow to any width."
  ],
  motion: [
    "No animation: nodes, connectors and labels are static. Any layout transition, panning or highlighting is editor behavior owned by the consumer."
  ],
  guidance: {
    do: [
      "Resolve metadata-to-color mapping in the consumer profile and pass only final values.",
      "Match the SVG `viewBox` to the canvas size so nodes and connectors line up."
    ],
    avoid: [
      "Encoding status in color, for example red for failed, without text.",
      "Adding selection handles, guides or drag targets inside an exported diagram, or styling them with `ef-diagram*` classes.",
      "Positioning nodes with logical properties; SVG coordinates are physical."
    ]
  },
  related: [
    { slug: "lane-board", note: "Items grouped into status or ownership lanes, reflowing without geometry." },
    { slug: "spatial-canvas", note: "A large explorable surface with orientation and a list-based access path." },
    { slug: "provenance-trail", note: "A linear trace of stages that needs no canvas." },
    { slug: "relationship-index", note: "A text-first list of relationships when there is no drawing." }
  ]
};
