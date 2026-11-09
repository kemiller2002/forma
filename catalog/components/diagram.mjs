export default {
  name: "Diagram",
  category: "workflow",
  behavior: "Application content",
  summary: "Presentation-only diagram nodes, connectors, metadata and key; the consumer owns geometry, routing, semantics and color mapping.",
  owns: ["forma-diagram","forma-diagram-connector","forma-diagram-group","forma-diagram-legend","forma-diagram-marker","forma-diagram-node","forma-diagram-port","forma-diagram-value-state"],
  purpose: {
    description: "The diagram family renders a workflow or relationship diagram that has already been laid out by the consumer. A `figure.forma-diagram` holds a caption, a scrollable canvas, a text list of every relationship and an optional key. Nodes are HTML articles placed with `--forma-diagram-x`, `--forma-diagram-y` and `--forma-diagram-w`; connectors are SVG paths whose geometry is supplied by the consumer. Forma paints boxes, shapes, line styles, arrowheads, labels and authored colors. It never lays out, routes, selects, drags or validates anything, and it never infers meaning from color: each node states its kind and state as text, and the relationship list carries every connection without the drawing.",
    useWhen: [
      "An application or export (for example Forma Studio) has computed node positions and connector paths and needs production-quality, dependency-free HTML and SVG output.",
      "Nodes need authored colors, for example by owning team, while kind and state stay in text.",
      "The diagram must remain understandable in forced colors, grayscale print and to screen readers."
    ],
    avoidWhen: [
      "The relationships are a simple sequence: use [[steps]] or [[provenance-trail]], which reflow without a canvas.",
      "Items move between columns by status: use [[lane-board]].",
      "Users explore a large spatial surface with an index and orientation: use [[spatial-canvas]].",
      "Hand-placing a workflow: write a portable `.forma-workflow.json` and let Forma.Workflow lay it out and render this markup (docs/workflow/RENDERING.md)."
    ],
    characteristics: [
      "Geometry is physical, like SVG: `left`/`top` placement does not mirror in right-to-left documents, so nodes stay attached to their connectors.",
      "Non-color cues: visible kind text, `data-forma-shape`, `data-forma-line` and the relationship list.",
      "Authored color arrives as resolved custom property values; removing one restores the Forma token default.",
      "Focus uses Forma's foundation ring and never reads authored color."
    ]
  },
  basicInteraction: {
    kind: "live",
    actions: [
      { role: "link", name: "Publish", expect: { url: "#diagram-title" } }
    ]
  },
  examples: [
    {
      id: "portable-workflow",
      title: "Generated from a portable workflow, with ports and status",
      description: "This markup is the unedited output of `forma-workflow render` for examples/workflows/forma/workflows/runtime-ports.forma-workflow.json (diagram contract 2.1.0). Ports are markers placed on a side with `data-forma-side` and `--forma-diagram-port-offset`; their shape shows direction. Status is text in the node metadata; `data-forma-status` adds a secondary outline or border cue. The relationship list names the ports each connector uses.",
      html: `<forma-diagram class="forma-component-tag">
  <figure class="forma-diagram" id="diagram-portable-workflow" aria-labelledby="diagram-portable-workflow-title">
    <figcaption id="diagram-portable-workflow-title">Propellant loading</figcaption>
    <div class="forma-diagram__viewport" tabindex="0" role="group" aria-label="Propellant loading diagram, scroll to see all items">
      <div class="forma-diagram__canvas" style="--forma-diagram-canvas-w: 840px; --forma-diagram-canvas-h: 272px;">
        <svg class="forma-diagram__wires" viewBox="0 0 840 272" aria-hidden="true" focusable="false">
          <defs>
            <marker id="diagram-portable-workflow-arrow" class="forma-diagram-marker" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" />
            </marker>
          </defs>
          <path class="forma-diagram-connector" id="diagram-portable-workflow-e-r1" d="M224 72 L320 72" marker-end="url(#diagram-portable-workflow-arrow)" />
          <path class="forma-diagram-connector" id="diagram-portable-workflow-e-r2" d="M520 72 L616 72" marker-end="url(#diagram-portable-workflow-arrow)" />
          <path class="forma-diagram-connector" id="diagram-portable-workflow-e-r3" data-forma-line="dotted" d="M420 24 L420 12 L604 12 L604 200 L616 200" marker-end="url(#diagram-portable-workflow-arrow)" />
        </svg>
        <article class="forma-diagram-node" id="diagram-portable-workflow-n-supply" data-forma-status="complete" aria-labelledby="diagram-portable-workflow-n-supply-label" style="--forma-diagram-x: 24px; --forma-diagram-y: 24px; --forma-diagram-w: 200px; --forma-diagram-h: 96px;">
          <p class="forma-diagram-node__kind">External</p>
          <h3 class="forma-diagram-node__label" id="diagram-portable-workflow-n-supply-label">Ground supply</h3>
          <dl class="forma-diagram-node__meta">
            <dt>Status</dt>
            <dd>Connected</dd>
          </dl>
          <span class="forma-diagram-port" data-forma-side="right" data-forma-direction="out" style="--forma-diagram-port-offset: 50%;" aria-hidden="true"></span>
        </article>
        <article class="forma-diagram-node" id="diagram-portable-workflow-n-tank" data-forma-status="active" aria-labelledby="diagram-portable-workflow-n-tank-label" style="--forma-diagram-x: 320px; --forma-diagram-y: 24px; --forma-diagram-w: 200px; --forma-diagram-h: 96px;">
          <p class="forma-diagram-node__kind">Data</p>
          <h3 class="forma-diagram-node__label" id="diagram-portable-workflow-n-tank-label">Propellant tank</h3>
          <dl class="forma-diagram-node__meta">
            <dt>Status</dt>
            <dd>Filling</dd>
          </dl>
          <span class="forma-diagram-port" data-forma-side="left" data-forma-direction="in" style="--forma-diagram-port-offset: 50%;" aria-hidden="true"></span>
          <span class="forma-diagram-port" data-forma-side="top" data-forma-direction="out" style="--forma-diagram-port-offset: 50%;" aria-hidden="true"></span>
          <span class="forma-diagram-port" data-forma-side="right" data-forma-direction="out" style="--forma-diagram-port-offset: 50%;" aria-hidden="true"></span>
        </article>
        <article class="forma-diagram-node" id="diagram-portable-workflow-n-engine" data-forma-shape="rounded" data-forma-status="blocked" aria-labelledby="diagram-portable-workflow-n-engine-label" style="--forma-diagram-x: 616px; --forma-diagram-y: 24px; --forma-diagram-w: 200px; --forma-diagram-h: 96px;">
          <p class="forma-diagram-node__kind">Task</p>
          <h3 class="forma-diagram-node__label" id="diagram-portable-workflow-n-engine-label">Engine chill-down</h3>
          <dl class="forma-diagram-node__meta">
            <dt>Status</dt>
            <dd>Waiting for temperature</dd>
          </dl>
          <span class="forma-diagram-port" data-forma-side="left" data-forma-direction="in" style="--forma-diagram-port-offset: 50%;" aria-hidden="true"></span>
        </article>
        <article class="forma-diagram-node" id="diagram-portable-workflow-n-vent" data-forma-shape="rounded" aria-labelledby="diagram-portable-workflow-n-vent-label" style="--forma-diagram-x: 616px; --forma-diagram-y: 152px; --forma-diagram-w: 200px; --forma-diagram-h: 96px;">
          <p class="forma-diagram-node__kind">Task</p>
          <h3 class="forma-diagram-node__label" id="diagram-portable-workflow-n-vent-label">Boil-off vent</h3>
          <dl class="forma-diagram-node__meta">
            <dt>Status</dt>
            <dd>Monitoring</dd>
          </dl>
        </article>
        <span class="forma-diagram-connector__label" aria-hidden="true" style="--forma-diagram-x: 272px; --forma-diagram-y: 72px;">LOX fill</span>
        <span class="forma-diagram-connector__label" aria-hidden="true" style="--forma-diagram-x: 568px; --forma-diagram-y: 72px;">Feed</span>
        <span class="forma-diagram-connector__label" aria-hidden="true" style="--forma-diagram-x: 604px; --forma-diagram-y: 106px;">Vent</span>
      </div>
    </div>
    <ol class="forma-diagram__relations" aria-label="Relationships">
      <li>Ground supply leads to Propellant tank: “LOX fill”; from port out to port fill.</li>
      <li>Propellant tank leads to Engine chill-down: “Feed”; from port feed to port in.</li>
      <li>Propellant tank leads to Boil-off vent: “Vent”; from port vent; dotted line.</li>
    </ol>
  </figure>
</forma-diagram>`
    },
    {
      id: "default-appearance",
      title: "Approval chain with default styling",
      description: "Three nodes with no authored color, so every surface uses Forma tokens. The rejection path is dashed and labelled, the start and end nodes use the pill shape, and the relationship list repeats each connector in reading order.",
      html: `<forma-diagram class="forma-component-tag">
  <figure class="forma-diagram" aria-labelledby="diagram-default-appearance-title">
    <figcaption id="diagram-default-appearance-title">Expense approval</figcaption>
    <div class="forma-diagram__viewport" tabindex="0" role="group" aria-label="Expense approval canvas, scroll to see all items">
      <div class="forma-diagram__canvas" style="--forma-diagram-canvas-w: 640px; --forma-diagram-canvas-h: 250px;">
        <svg class="forma-diagram__wires" viewBox="0 0 640 250" aria-hidden="true" focusable="false">
          <defs>
            <marker id="diagram-default-appearance-arrow" class="forma-diagram-marker" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"/></marker>
          </defs>
          <path class="forma-diagram-connector" d="M196 60 H228" marker-end="url(#diagram-default-appearance-arrow)"/>
          <path class="forma-diagram-connector" d="M412 60 H444" marker-end="url(#diagram-default-appearance-arrow)"/>
          <path class="forma-diagram-connector" data-forma-line="dashed" d="M320 110 V150 H106 V116" marker-end="url(#diagram-default-appearance-arrow)"/>
        </svg>
        <article class="forma-diagram-node" data-forma-shape="pill" aria-labelledby="diagram-default-appearance-submit" style="--forma-diagram-x: 16px; --forma-diagram-y: 20px; --forma-diagram-w: 180px;">
          <p class="forma-diagram-node__kind">Start</p>
          <h3 class="forma-diagram-node__label" id="diagram-default-appearance-submit">Submit claim</h3>
        </article>
        <article class="forma-diagram-node" aria-labelledby="diagram-default-appearance-review" style="--forma-diagram-x: 230px; --forma-diagram-y: 20px; --forma-diagram-w: 180px;">
          <p class="forma-diagram-node__kind">Decision</p>
          <h3 class="forma-diagram-node__label" id="diagram-default-appearance-review">Manager review</h3>
          <dl class="forma-diagram-node__meta"><dt>State</dt><dd>Active</dd></dl>
        </article>
        <article class="forma-diagram-node" data-forma-shape="pill" aria-labelledby="diagram-default-appearance-paid" style="--forma-diagram-x: 446px; --forma-diagram-y: 20px; --forma-diagram-w: 180px;">
          <p class="forma-diagram-node__kind">End</p>
          <h3 class="forma-diagram-node__label" id="diagram-default-appearance-paid">Reimbursed</h3>
        </article>
        <span class="forma-diagram-connector__label" style="--forma-diagram-x: 150px; --forma-diagram-y: 160px;">rejected, needs receipt</span>
      </div>
    </div>
    <ol class="forma-diagram__relations" aria-label="Relationships">
      <li>Submit claim leads to Manager review (solid line).</li>
      <li>Manager review leads to Reimbursed when approved (solid line).</li>
      <li>Manager review returns to Submit claim when rejected for a missing receipt (dashed line).</li>
    </ol>
  </figure>
</forma-diagram>`
    },
    {
      id: "authored-color",
      title: "Authored color by owning team",
      description: "The consumer maps owning team to fill and accent through its own profile and passes resolved values. Two different kinds share one color and the key explains the mapping. One connector has an authored stroke and weight; its meaning is still stated in the relationship list.",
      html: `<forma-diagram class="forma-component-tag">
  <figure class="forma-diagram" aria-labelledby="diagram-authored-color-title">
    <figcaption id="diagram-authored-color-title">Incident escalation</figcaption>
    <p>Fill color shows the owning team only. Kind and state are written on each item.</p>
    <div class="forma-diagram__viewport" tabindex="0" role="group" aria-label="Incident escalation canvas, scroll to see all items">
      <div class="forma-diagram__canvas" style="--forma-diagram-canvas-w: 640px; --forma-diagram-canvas-h: 170px;">
        <svg class="forma-diagram__wires" viewBox="0 0 640 170" aria-hidden="true" focusable="false">
          <defs>
            <marker id="diagram-authored-color-arrow" class="forma-diagram-marker" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"/></marker>
          </defs>
          <path class="forma-diagram-connector" d="M196 70 H228" marker-end="url(#diagram-authored-color-arrow)"/>
          <path class="forma-diagram-connector" data-forma-line="dotted" style="--forma-diagram-connector-stroke: #8a5300; --forma-diagram-connector-width: 3;" d="M412 70 H444" marker-end="url(#diagram-authored-color-arrow)"/>
        </svg>
        <article class="forma-diagram-node" data-forma-shape="rounded" aria-labelledby="diagram-authored-color-triage" style="--forma-diagram-x: 16px; --forma-diagram-y: 20px; --forma-diagram-w: 180px; --forma-diagram-fill: #e8f0ff; --forma-diagram-accent: #2f5fb3; --forma-diagram-foreground: #1d1d1b;">
          <p class="forma-diagram-node__kind">Task</p>
          <h3 class="forma-diagram-node__label" id="diagram-authored-color-triage">Triage alert</h3>
          <dl class="forma-diagram-node__meta"><dt>State</dt><dd>Done</dd><dt>Team</dt><dd>Support</dd></dl>
        </article>
        <article class="forma-diagram-node" aria-labelledby="diagram-authored-color-decide" style="--forma-diagram-x: 230px; --forma-diagram-y: 20px; --forma-diagram-w: 180px; --forma-diagram-fill: #e8f0ff; --forma-diagram-accent: #2f5fb3; --forma-diagram-foreground: #1d1d1b;">
          <p class="forma-diagram-node__kind">Decision</p>
          <h3 class="forma-diagram-node__label" id="diagram-authored-color-decide">Customer impact?</h3>
          <dl class="forma-diagram-node__meta"><dt>State</dt><dd>Active</dd><dt>Team</dt><dd>Support</dd></dl>
        </article>
        <article class="forma-diagram-node" data-forma-shape="rounded" aria-labelledby="diagram-authored-color-page" style="--forma-diagram-x: 446px; --forma-diagram-y: 20px; --forma-diagram-w: 180px; --forma-diagram-fill: #fff1d6; --forma-diagram-stroke: #5c3a00; --forma-diagram-accent: #8a5300; --forma-diagram-foreground: #1d1d1b;">
          <p class="forma-diagram-node__kind">Task</p>
          <h3 class="forma-diagram-node__label" id="diagram-authored-color-page">Page on-call engineer</h3>
          <dl class="forma-diagram-node__meta"><dt>State</dt><dd>Waiting</dd><dt>Team</dt><dd>Platform</dd></dl>
        </article>
      </div>
    </div>
    <ol class="forma-diagram__relations" aria-label="Relationships">
      <li>Triage alert leads to Customer impact? (solid line).</li>
      <li>Customer impact? leads to Page on-call engineer when customers are affected (dotted line, handed to another team).</li>
    </ol>
    <dl class="forma-diagram-legend" aria-label="Key: fill color by owning team">
      <div><dt><span class="forma-diagram-legend__swatch" style="--forma-diagram-fill: #e8f0ff; --forma-diagram-accent: #2f5fb3;"></span> Support</dt><dd>blue fill</dd></div>
      <div><dt><span class="forma-diagram-legend__swatch" style="--forma-diagram-fill: #fff1d6; --forma-diagram-stroke: #5c3a00; --forma-diagram-accent: #8a5300;"></span> Platform</dt><dd>amber fill, dark border</dd></div>
    </dl>
  </figure>
</forma-diagram>`
    },
    {
      id: "workflow-lanes-and-decision",
      title: "Budget approval across two lanes",
      description: "A Workflow profile export with lanes, an ellipse start and end, a diamond decision with labelled outcomes, and two kinds of authored color: an amber fill that the consumer maps from the status field, and a purple fill a person chose by hand. The key keeps the two apart, and every node states its kind, owner and status in text.",
      html: `<forma-diagram class="forma-component-tag">
  <figure class="forma-diagram" aria-labelledby="diagram-lanes-title">
    <figcaption id="diagram-lanes-title">Budget approval</figcaption>
    <p>Amber fill comes from the status mapping (Needs input). Purple is a highlight the author chose; it carries no status. Owners come from the lane.</p>
    <div class="forma-diagram__viewport" tabindex="0" role="group" aria-label="Budget approval canvas, scroll to see all items">
      <div class="forma-diagram__canvas" style="--forma-diagram-canvas-w: 780px; --forma-diagram-canvas-h: 430px;">
        <div class="forma-diagram-group" data-forma-group="lane" style="--forma-diagram-x: 0px; --forma-diagram-y: 0px; --forma-diagram-w: 780px; --forma-diagram-h: 190px;">
          <p class="forma-diagram-group__header"><span class="forma-diagram-group__kind">Lane</span> <span class="forma-diagram-group__label">Requester</span></p>
        </div>
        <div class="forma-diagram-group" data-forma-group="lane" style="--forma-diagram-x: 0px; --forma-diagram-y: 196px; --forma-diagram-w: 780px; --forma-diagram-h: 234px; --forma-diagram-accent: #6b3fa0;">
          <p class="forma-diagram-group__header"><span class="forma-diagram-group__kind">Lane</span> <span class="forma-diagram-group__label">Finance</span></p>
        </div>
        <svg class="forma-diagram__wires" viewBox="0 0 780 430" aria-hidden="true" focusable="false">
          <defs>
            <marker id="diagram-lanes-arrow" class="forma-diagram-marker" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"/></marker>
          </defs>
          <path class="forma-diagram-connector" d="M184 110 H214" marker-end="url(#diagram-lanes-arrow)"/>
          <path class="forma-diagram-connector" d="M320 164 V222" marker-end="url(#diagram-lanes-arrow)"/>
          <path class="forma-diagram-connector" d="M412 314 H468" marker-end="url(#diagram-lanes-arrow)"/>
          <path class="forma-diagram-connector" data-forma-line="dashed" d="M228 314 H200 V150 H214" marker-end="url(#diagram-lanes-arrow)"/>
          <path class="forma-diagram-connector" d="M558 240 V110 H638" marker-end="url(#diagram-lanes-arrow)"/>
        </svg>
        <article class="forma-diagram-node" data-forma-shape="ellipse" aria-labelledby="diagram-lanes-submit" style="--forma-diagram-x: 24px; --forma-diagram-y: 64px; --forma-diagram-w: 160px; --forma-diagram-h: 92px;">
          <p class="forma-diagram-node__kind">Start</p>
          <h3 class="forma-diagram-node__label" id="diagram-lanes-submit">Submit request</h3>
        </article>
        <article class="forma-diagram-node" data-forma-shape="rounded" aria-labelledby="diagram-lanes-prepare" style="--forma-diagram-x: 216px; --forma-diagram-y: 40px; --forma-diagram-w: 210px; --forma-diagram-fill: #fff1d6; --forma-diagram-accent: #8a5300; --forma-diagram-foreground: #1d1d1b;">
          <p class="forma-diagram-node__kind">Activity</p>
          <h3 class="forma-diagram-node__label" id="diagram-lanes-prepare">Prepare budget</h3>
          <dl class="forma-diagram-node__meta"><dt>Status</dt><dd>Needs input</dd><dt>Owner</dt><dd>Requester <span class="forma-diagram-value-state" data-forma-value-state="derived">from lane</span></dd></dl>
        </article>
        <article class="forma-diagram-node" data-forma-shape="diamond" aria-labelledby="diagram-lanes-decide" style="--forma-diagram-x: 228px; --forma-diagram-y: 222px; --forma-diagram-w: 184px;">
          <p class="forma-diagram-node__kind">Decision</p>
          <h3 class="forma-diagram-node__label" id="diagram-lanes-decide">Within budget?</h3>
        </article>
        <article class="forma-diagram-node" aria-labelledby="diagram-lanes-approve" style="--forma-diagram-x: 470px; --forma-diagram-y: 240px; --forma-diagram-w: 180px; --forma-diagram-fill: #efe6fb; --forma-diagram-accent: #6b3fa0; --forma-diagram-foreground: #1d1d1b;">
          <p class="forma-diagram-node__kind">Activity</p>
          <h3 class="forma-diagram-node__label" id="diagram-lanes-approve">Approve spend</h3>
          <dl class="forma-diagram-node__meta"><dt>Status</dt><dd>Waiting</dd><dt>Owner</dt><dd>Finance <span class="forma-diagram-value-state" data-forma-value-state="derived">from lane</span></dd></dl>
        </article>
        <article class="forma-diagram-node" data-forma-shape="ellipse" aria-labelledby="diagram-lanes-closed" style="--forma-diagram-x: 640px; --forma-diagram-y: 64px; --forma-diagram-w: 124px; --forma-diagram-h: 92px;">
          <p class="forma-diagram-node__kind">End</p>
          <h3 class="forma-diagram-node__label" id="diagram-lanes-closed">Closed</h3>
        </article>
        <span class="forma-diagram-connector__label" style="--forma-diagram-x: 422px; --forma-diagram-y: 290px;">yes</span>
        <span class="forma-diagram-connector__label" style="--forma-diagram-x: 150px; --forma-diagram-y: 320px;">no, revise</span>
      </div>
    </div>
    <ol class="forma-diagram__relations" aria-label="Relationships">
      <li>Submit request leads to Prepare budget (solid line).</li>
      <li>Prepare budget leads to Within budget? (solid line, moves from the Requester lane to the Finance lane).</li>
      <li>Within budget? leads to Approve spend when the answer is yes (solid line).</li>
      <li>Within budget? returns to Prepare budget when the answer is no, revise (dashed line).</li>
      <li>Approve spend leads to Closed (solid line).</li>
    </ol>
    <dl class="forma-diagram-legend" aria-label="Key: what fill color means in this diagram">
      <div><dt><span class="forma-diagram-legend__swatch" style="--forma-diagram-fill: #fff1d6; --forma-diagram-accent: #8a5300;"></span> Status is Needs input</dt><dd>amber fill, from the status mapping</dd></div>
      <div><dt><span class="forma-diagram-legend__swatch" style="--forma-diagram-fill: #efe6fb; --forma-diagram-accent: #6b3fa0;"></span> Author highlight</dt><dd>purple fill, chosen by hand, no status meaning</dd></div>
      <div><dt><span class="forma-diagram-legend__swatch"></span> No mapping or highlight</dt><dd>Forma default</dd></div>
    </dl>
  </figure>
</forma-diagram>`
    },
    {
      id: "metadata-value-states",
      title: "Metadata with default, derived and missing values",
      description: "One node inside a dashed phase boundary shows how the consumer marks values it did not receive from the author. Each tag is text (default, derived, from source, unknown, unavailable, invalid), so the distinction survives grayscale, forced colors and screen readers; explicit values carry no tag.",
      html: `<forma-diagram class="forma-component-tag">
  <figure class="forma-diagram" aria-labelledby="diagram-states-title">
    <figcaption id="diagram-states-title">Vendor onboarding, discovery phase</figcaption>
    <div class="forma-diagram__viewport" tabindex="0" role="group" aria-label="Vendor onboarding canvas, scroll to see all items">
      <div class="forma-diagram__canvas" style="--forma-diagram-canvas-w: 460px; --forma-diagram-canvas-h: 330px;">
        <div class="forma-diagram-group" data-forma-group="phase" data-forma-line="dashed" style="--forma-diagram-x: 0px; --forma-diagram-y: 0px; --forma-diagram-w: 460px; --forma-diagram-h: 330px;">
          <p class="forma-diagram-group__header"><span class="forma-diagram-group__kind">Phase</span> <span class="forma-diagram-group__label">Discovery</span></p>
        </div>
        <article class="forma-diagram-node" data-forma-shape="rounded" aria-labelledby="diagram-states-vendor" style="--forma-diagram-x: 24px; --forma-diagram-y: 44px; --forma-diagram-w: 410px;">
          <p class="forma-diagram-node__kind">Activity</p>
          <h3 class="forma-diagram-node__label" id="diagram-states-vendor">Collect vendor details</h3>
          <dl class="forma-diagram-node__meta">
            <dt>Status</dt><dd>In review</dd>
            <dt>Priority</dt><dd>Normal <span class="forma-diagram-value-state" data-forma-value-state="default">default</span></dd>
            <dt>Phase</dt><dd>Discovery <span class="forma-diagram-value-state" data-forma-value-state="derived">derived from phase</span></dd>
            <dt>Risk tier</dt><dd>Tier 2 <span class="forma-diagram-value-state" data-forma-value-state="source-bound">from vendor registry</span></dd>
            <dt>Due</dt><dd><span class="forma-diagram-value-state" data-forma-value-state="unknown">unknown</span></dd>
            <dt>Contract</dt><dd><span class="forma-diagram-value-state" data-forma-value-state="unavailable">unavailable, registry offline</span></dd>
            <dt>Cost center</dt><dd>12-A <span class="forma-diagram-value-state" data-forma-value-state="invalid">invalid, not a listed cost center</span></dd>
          </dl>
        </article>
      </div>
    </div>
    <ol class="forma-diagram__relations" aria-label="Relationships">
      <li>Collect vendor details belongs to the Discovery phase; it has no connections yet.</li>
    </ol>
  </figure>
</forma-diagram>`
    },
    {
      id: "mobile-scrolling-canvas",
      title: "Mobile scrolling canvas",
      description: "On a phone the fixed-size canvas scrolls inside its own focusable viewport, while the caption and the relationship list reflow to the screen width.",
      mobile: {
        height: 560,
        notes: [
          "The canvas keeps its consumer-supplied size (here 560 by 150 px) and scrolls inside `.forma-diagram__viewport`; the page itself does not scroll sideways at 320px.",
          "The viewport is a focusable, named group, so keyboard users can scroll it with the arrow keys and touch users can pan it; `overscroll-behavior: contain` stops the pan from scrolling the page.",
          "The relationship list and key reflow to full width, so every connection is readable without panning the canvas.",
          "Node text wraps with `overflow-wrap: anywhere` inside the authored node width; Forma does not rescale geometry for orientation changes."
        ]
      },
      html: `<forma-diagram class="forma-component-tag">
  <figure class="forma-diagram" aria-labelledby="diagram-mobile-title">
    <figcaption id="diagram-mobile-title">Password reset</figcaption>
    <div class="forma-diagram__viewport" tabindex="0" role="group" aria-label="Password reset canvas, scroll to see all items">
      <div class="forma-diagram__canvas" style="--forma-diagram-canvas-w: 560px; --forma-diagram-canvas-h: 150px;">
        <svg class="forma-diagram__wires" viewBox="0 0 560 150" aria-hidden="true" focusable="false">
          <defs>
            <marker id="diagram-mobile-arrow" class="forma-diagram-marker" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"/></marker>
          </defs>
          <path class="forma-diagram-connector" d="M176 60 H198" marker-end="url(#diagram-mobile-arrow)"/>
          <path class="forma-diagram-connector" d="M362 60 H384" marker-end="url(#diagram-mobile-arrow)"/>
        </svg>
        <article class="forma-diagram-node" data-forma-shape="pill" aria-labelledby="diagram-mobile-request" style="--forma-diagram-x: 16px; --forma-diagram-y: 20px; --forma-diagram-w: 160px;">
          <p class="forma-diagram-node__kind">Start</p>
          <h3 class="forma-diagram-node__label" id="diagram-mobile-request">Request link</h3>
        </article>
        <article class="forma-diagram-node" aria-labelledby="diagram-mobile-verify" style="--forma-diagram-x: 200px; --forma-diagram-y: 20px; --forma-diagram-w: 160px;">
          <p class="forma-diagram-node__kind">Task</p>
          <h3 class="forma-diagram-node__label" id="diagram-mobile-verify">Verify email</h3>
        </article>
        <article class="forma-diagram-node" data-forma-shape="pill" aria-labelledby="diagram-mobile-set" style="--forma-diagram-x: 386px; --forma-diagram-y: 20px; --forma-diagram-w: 160px;">
          <p class="forma-diagram-node__kind">End</p>
          <h3 class="forma-diagram-node__label" id="diagram-mobile-set">Set new password</h3>
        </article>
      </div>
    </div>
    <ol class="forma-diagram__relations" aria-label="Relationships">
      <li>Request link leads to Verify email (solid line).</li>
      <li>Verify email leads to Set new password (solid line).</li>
    </ol>
  </figure>
</forma-diagram>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "figure, node article", values: "id of the caption or node label", default: "—", description: "Names the diagram by its caption and each node by its label heading." },
      { name: "tabindex", on: ".forma-diagram__viewport", values: "0", default: "—", description: "Makes the scrolling canvas reachable by keyboard so it can be scrolled without a pointer." },
      { name: "role", on: ".forma-diagram__viewport", values: "group", default: "—", description: "Gives the focusable viewport a role so its name is announced." },
      { name: "aria-label", on: "viewport, relations list, legend", values: "string", default: "—", description: "Names the canvas (say that it scrolls), the relationship list and the key." },
      { name: "aria-hidden", on: "svg.forma-diagram__wires", values: "true", default: "—", description: "Hides the drawn connectors; the relationship list is their text equivalent." },
      { name: "focusable", on: "svg.forma-diagram__wires", values: "false", default: "—", description: "Keeps legacy browsers from putting the SVG in the tab order." },
      { name: "marker-end", on: "path.forma-diagram-connector", values: "url(#marker-id)", default: "—", description: "Attaches the arrowhead. Marker ids must be unique in the document." },
      { name: "style", on: "canvas, node, group, connector, label, swatch", values: "custom property declarations", default: "—", description: "Where the consumer writes resolved geometry and authored color values." }
    ],
    hooks: {
      "data-forma-status": "On a node or group: the core status (pending, waiting, active, blocked, failed, skipped, cancelled) for a secondary outline or border cue. The status itself is text in the node metadata.",
      "data-forma-side": "On `.forma-diagram-port`: the node side the port sits on (top, right, bottom, left).",
      "data-forma-direction": "On `.forma-diagram-port`: in (square), out (circle) or inout (diamond).",
      "--forma-diagram-port-offset": "On `.forma-diagram-port`: position along its side as a percentage (default 50%).",
      "forma-diagram-port": "A connection-point marker inside a node; `.forma-diagram-port__label` names it.",
      "forma-diagram-node__description": "Optional description text inside a node.",
      "forma-diagram__membership": "Description list naming each group, lane or phase and its members in reading order.",
      "forma-diagram": "The `figure` root: a single-column grid of caption, optional description, viewport, relationship list and key.",
      "forma-diagram__viewport": "Bordered region that scrolls the canvas in both directions and contains overscroll.",
      "forma-diagram__canvas": "Positioning context sized by `--forma-diagram-canvas-w` and `--forma-diagram-canvas-h`.",
      "forma-diagram__wires": "The SVG layer that fills the canvas and draws connectors. Ignores pointer events. Its `viewBox` must match the canvas size so path coordinates and node positions share one pixel space.",
      "forma-diagram__relations": "Ordered list with one text item per connector, in reading order.",
      "forma-diagram-node": "An absolutely placed node box with a 2px border and a 6px inline-start accent. Long text wraps anywhere.",
      "forma-diagram-node__kind": "Visible kind text (Task, Decision, End), small uppercase. The primary non-color cue.",
      "forma-diagram-node__label": "The node's label, normally an `h3` that also names the node.",
      "forma-diagram-node__meta": "A `dl` of metadata the consumer chose to show, laid out as a two-column grid.",
      "data-forma-shape": "Node shape: absent for a rectangle, `rounded` for rounded corners, `pill` for fully rounded ends, `ellipse`, or `diamond` (a square box whose content sits inside the diamond; give it enough width for the label). Presentation only: the kind text, not the shape, says what the node is.",
      "forma-diagram-connector": "An SVG `path` connector; stroke comes from authored or token values.",
      "forma-diagram-connector__label": "A text label placed on the canvas with `--forma-diagram-x`/`-y`, on a surface-colored background.",
      "data-forma-line": "Connector line style: absent for solid, `dashed` or `dotted`. Presentation only; state the meaning in the relationship list.",
      "forma-diagram-marker": "An SVG `marker` for arrowheads, filled with the functional border color.",
      "forma-diagram-legend": "A `dl` key that explains any authored color mapping; wraps as a flex row.",
      "forma-diagram-legend__swatch": "A small sample box that reads the same color properties as a node.",
      "forma-diagram-group": "A group, lane or phase boundary placed with `--forma-diagram-x`, `-y`, `-w` and `-h`. Put it first in the canvas so it paints beneath connectors and nodes. Overlap never implies membership: state membership in text.",
      "forma-diagram-group__header": "The boundary's visible heading row, holding the kind and label text.",
      "forma-diagram-group__kind": "Visible kind text (Lane, Phase, Group), small uppercase.",
      "forma-diagram-group__label": "The group's name, for example the actor that owns a lane.",
      "data-forma-group": "Group presentation: absent or `group` for a boxed region, `lane` for a band with an inline-start accent, `phase` for a band with a top accent. Presentation only; the kind is the text in `__kind`.",
      "forma-diagram-value-state": "A small text tag after a metadata value that says how the consumer obtained it. Explicit values carry no tag.",
      "data-forma-value-state": "Secondary border cue on the value-state tag: `default` or `derived` (dashed), `source-bound` (double), `unknown` or `unavailable` (dotted), `invalid` (solid, bold). The tag text carries the meaning.",
      "--forma-diagram-h": "Minimum node height, or the group height. Nodes grow taller when content needs it.",
      "--forma-diagram-group-fill": "Internal resolved group fill; read-only. Set `--forma-diagram-fill` instead. Transparent by default.",
      "--forma-diagram-group-stroke": "Internal resolved group border; read-only. Set `--forma-diagram-stroke` instead.",
      "--forma-diagram-group-accent": "Internal resolved group accent; read-only. Set `--forma-diagram-accent` instead.",
      "--forma-diagram-group-foreground": "Internal resolved group text color; read-only. Set `--forma-diagram-foreground` instead.",
      "--forma-diagram-canvas-w": "Canvas width in px, supplied by the consumer. Default 720px.",
      "--forma-diagram-canvas-h": "Canvas height in px, supplied by the consumer. Default 320px.",
      "--forma-diagram-x": "Horizontal position of a node or connector label from the canvas's left edge (physical, not mirrored in RTL).",
      "--forma-diagram-y": "Vertical position of a node or connector label from the canvas top.",
      "--forma-diagram-w": "Node width. Default 12rem.",
      "--forma-diagram-fill": "Authored node background. Falls back to the primary surface token.",
      "--forma-diagram-stroke": "Authored node border. Falls back to the functional border token.",
      "--forma-diagram-accent": "Authored inline-start accent bar. Falls back to the node stroke.",
      "--forma-diagram-foreground": "Authored node text color. The consumer is responsible for contrast against the fill.",
      "--forma-diagram-node-fill": "Internal resolved fill on each node; read-only. Set `--forma-diagram-fill` instead.",
      "--forma-diagram-node-stroke": "Internal resolved border color; read-only. Set `--forma-diagram-stroke` instead.",
      "--forma-diagram-node-accent": "Internal resolved accent color; read-only. Set `--forma-diagram-accent` instead.",
      "--forma-diagram-node-foreground": "Internal resolved text color; read-only. Set `--forma-diagram-foreground` instead.",
      "--forma-diagram-connector-stroke": "Authored connector color. Falls back to the functional border token.",
      "--forma-diagram-connector-width": "Authored connector stroke width in SVG units. Default 2."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves to the canvas viewport, then to any links inside nodes in source order." },
      { keys: "Arrow keys, Page Up / Page Down (viewport focused)", action: "Scrolls the canvas. Native scrolling of a focused overflow region." },
      { keys: "Selection, moving or connecting nodes", action: "Not provided. Editing interactions belong to the consuming editor and must not reuse `forma-diagram*` classes." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Default appearance", how: "no authored custom properties", description: "Nodes and connectors use Forma surface, border and text tokens." },
    { name: "Authored color", how: "--forma-diagram-fill / -stroke / -accent / -foreground, --forma-diagram-connector-stroke / -width", description: "Consumer-resolved colors; removing one restores the token default." },
    { name: "Shape", how: "data-forma-shape=\"rounded\" | \"pill\" | \"ellipse\" | \"diamond\"", description: "Rounded corners, pill ends, ellipse or diamond; rectangle when absent. Every shape keeps a real border for backgrounds-off print." },
    { name: "Group, lane or phase", how: "div.forma-diagram-group with data-forma-group=\"lane\" | \"phase\" and optional data-forma-line", description: "A labelled boundary beneath nodes; accepts the same authored color properties as a node." },
    { name: "Metadata value state", how: "span.forma-diagram-value-state with data-forma-value-state", description: "Text tag marking default, derived, source-bound, unknown, unavailable or invalid values." },
    { name: "Line style", how: "data-forma-line=\"dashed\" | \"dotted\"", description: "Dash pattern on a connector; solid when absent." },
    { name: "Viewport focus", how: ":focus-visible on .forma-diagram__viewport", description: "Foundation focus ring, independent of authored color." },
    { name: "Forced colors", how: "@media (forced-colors: active)", description: "Nodes, swatches and labels become Canvas/CanvasText; connectors and markers use CanvasText. Kind text, shape and line style remain." },
    { name: "Print", how: "@media print", description: "Viewport stops scrolling and nodes avoid page breaks. Authored strokes and accents print; boundaries without an authored stroke print black, so they stay visible with backgrounds disabled." }
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
    "When the canvas is wider or taller than the viewport, `.forma-diagram__viewport` scrolls in both directions with contained overscroll.",
    "Node text wraps within `--forma-diagram-w`; at 200% text size nodes grow taller, so consumer layouts should leave vertical room.",
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
      "Adding selection handles, guides or drag targets inside an exported diagram, or styling them with `forma-diagram*` classes.",
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
