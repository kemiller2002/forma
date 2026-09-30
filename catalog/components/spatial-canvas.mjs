export default {
  name: "Spatial canvas",
  category: "workflow",
  behavior: "Application / Limen",
  summary: "Provides a bounded spatial exploration surface with orientation and a non-spatial access path.",
  purpose: {
    description: "A spatial canvas frames a surface that is larger than the screen, such as a system map, floor plan or board of related objects, inside a bounded, keyboard-scrollable viewport. Around it Forma places three things spatial views usually lack: a text orientation line that says what part of the space is in view, a control area for application-owned view actions (zoom, reset), and a native `details` index that lists the objects in view as ordinary links. Zoom level, panning, selection and what counts as \"in view\" belong to the application or Limen; Forma only draws the frame and keeps a non-spatial path to every object.",
    useWhen: [
      "Relationships between objects are easier to understand in space, but the space does not fit on screen.",
      "Users need to know where they are in a larger map and get back to a known view.",
      "Every object on the surface must also be reachable without panning, for keyboard, screen-reader and phone users."
    ],
    avoidWhen: [
      "The consumer computes exact node positions and connectors: use [[diagram]].",
      "Objects belong in ordered columns by status: use [[lane-board]].",
      "A list or table would carry the same information: use [[relationship-index]] or [[data-grid]] and skip the spatial view.",
      "Only a wide table needs scrolling: use [[bounded-overflow]] or [[comparison-grid]]."
    ],
    characteristics: [
      "The viewport is a focusable, bordered scroll region with an 18rem minimum height and a visible focus outline.",
      "The surface is at least 48rem by 28rem and lays objects out in a three-column grid; it is not a coordinate system.",
      "The object index is a native disclosure with a 2.75rem summary and a wrapping list of links.",
      "Orientation is plain text, so scope never depends on reading position or size."
    ]
  },
  examples: [
    {
      id: "floor-plan-scope",
      title: "Scoped view with a scope trail",
      description: "A facilities map zoomed into one floor. A [[scope-trail]] shows ancestry, the orientation line states zoom and region in words, the view controls are grouped and named, and the index is open so every desk in view is one link away.",
      html: `<ef-spatial-canvas class="ef-component-tag">
  <section class="ef-spatial-canvas" aria-labelledby="spatial-canvas-floor-plan-scope-title">
    <header class="ef-spatial-canvas__header">
      <div>
        <nav class="ef-scope-trail" aria-label="Map scope"><ol><li><a href="#spatial-canvas-floor-plan-scope-campus">Campus</a></li><li><a href="#spatial-canvas-floor-plan-scope-building">Building C</a></li><li aria-current="page">Floor 3</li></ol></nav>
        <h2 id="spatial-canvas-floor-plan-scope-title">Floor 3 desks</h2>
        <p class="ef-spatial-canvas__orientation">Zoom: floor level · showing east wing</p>
      </div>
      <div class="ef-cluster" role="group" aria-label="Map view controls"><button type="button">Zoom out to building</button><button type="button">Reset view</button></div>
    </header>
    <div class="ef-spatial-canvas__viewport" tabindex="0" role="group" aria-label="Floor 3 map, scrollable">
      <div class="ef-spatial-canvas__surface">
        <article class="ef-surface" id="spatial-canvas-floor-plan-scope-c301"><h3>C-301</h3><p>Available</p></article>
        <article class="ef-surface" id="spatial-canvas-floor-plan-scope-c302"><h3>C-302</h3><p>Booked · Priya Raman</p></article>
        <article class="ef-surface" id="spatial-canvas-floor-plan-scope-c303"><h3>C-303</h3><p>Out of service</p></article>
      </div>
    </div>
    <details class="ef-spatial-canvas__index" open>
      <summary>Desks in this view (3)</summary>
      <nav aria-label="Desks in view"><a href="#spatial-canvas-floor-plan-scope-c301">C-301</a><a href="#spatial-canvas-floor-plan-scope-c302">C-302</a><a href="#spatial-canvas-floor-plan-scope-c303">C-303</a></nav>
    </details>
  </section>
</ef-spatial-canvas>`
    },
    {
      id: "empty-region",
      title: "Empty region",
      description: "The user has panned to an area with no objects. The orientation line says so in text and offers a way back, so the empty surface is not mistaken for a loading failure; the index states that nothing is in view.",
      html: `<ef-spatial-canvas class="ef-component-tag">
  <section class="ef-spatial-canvas" aria-labelledby="spatial-canvas-empty-region-title">
    <header class="ef-spatial-canvas__header">
      <div><h2 id="spatial-canvas-empty-region-title">Service map</h2><p class="ef-spatial-canvas__orientation">Viewport: north-west edge · no services in view</p></div>
      <div class="ef-cluster" role="group" aria-label="Service map controls"><button type="button">Reset view</button></div>
    </header>
    <div class="ef-spatial-canvas__viewport" tabindex="0" role="group" aria-label="Service map, scrollable">
      <div class="ef-spatial-canvas__surface"></div>
    </div>
    <details class="ef-spatial-canvas__index">
      <summary>Objects in this view (0)</summary>
      <p>Nothing here. Use Reset view to return to the billing cluster.</p>
    </details>
  </section>
</ef-spatial-canvas>`
    },
    {
      id: "mobile-index-first",
      title: "Mobile map with object index",
      description: "At phone width the surface scrolls inside its viewport and the index is the practical way to reach objects.",
      mobile: {
        height: 640,
        notes: [
          "The surface keeps its 48rem minimum width and scrolls inside `.ef-spatial-canvas__viewport`; the page does not scroll sideways at 320px.",
          "The header wraps: title and orientation above, controls below, each button at the 2.75rem base height.",
          "The object index summary is a 2.75rem touch target and its links wrap, so every object is reachable without panning.",
          "Panning with touch scrolls the viewport; there is no pinch-zoom behavior unless the application provides it, so offer zoom as buttons."
        ]
      },
      html: `<ef-spatial-canvas class="ef-component-tag">
  <section class="ef-spatial-canvas" aria-labelledby="spatial-canvas-mobile-title">
    <header class="ef-spatial-canvas__header">
      <div><h2 id="spatial-canvas-mobile-title">Warehouse zones</h2><p class="ef-spatial-canvas__orientation">Viewport: dock side</p></div>
      <div class="ef-cluster" role="group" aria-label="Zone map controls"><button type="button">Zoom out</button><button type="button">Zoom in</button></div>
    </header>
    <div class="ef-spatial-canvas__viewport" tabindex="0" role="group" aria-label="Warehouse zone map, scrollable">
      <div class="ef-spatial-canvas__surface">
        <article class="ef-surface" id="spatial-canvas-mobile-dock"><h3>Dock A</h3><p>2 trucks unloading</p></article>
        <article class="ef-surface" id="spatial-canvas-mobile-cold"><h3>Cold store</h3><p>At capacity</p></article>
      </div>
    </div>
    <details class="ef-spatial-canvas__index">
      <summary>Zones in this view</summary>
      <nav aria-label="Zones in view"><a href="#spatial-canvas-mobile-dock">Dock A</a><a href="#spatial-canvas-mobile-cold">Cold store</a></nav>
    </details>
  </section>
</ef-spatial-canvas>`
    }
  ],
  api: {
    attributes: [
      { name: "tabindex", on: ".ef-spatial-canvas__viewport", values: "0", default: "—", description: "Makes the scroll region focusable so it can be scrolled from the keyboard." },
      { name: "role", on: "viewport, control cluster", values: "group", default: "—", description: "Gives the viewport and the control area a role so their accessible names are announced." },
      { name: "aria-label", on: "viewport, controls, index nav", values: "string", default: "—", description: "Names the scroll region (say that it scrolls), the view controls and the object index." },
      { name: "aria-labelledby", on: "root section", values: "id of the canvas heading", default: "—", description: "Names the whole canvas region." },
      { name: "open", on: "details.ef-spatial-canvas__index", values: "boolean", default: "absent", description: "Initial open state of the object index. The browser owns it afterwards." },
      { name: "aria-current", on: "scope trail item", values: "page", default: "—", description: "Marks the current scope when a [[scope-trail]] is composed in the header." }
    ],
    hooks: {
      "ef-spatial-canvas": "Root grid: header, viewport, index, with a small gap. Shrinks to its container.",
      "ef-spatial-canvas__header": "Wrapping flex row with the title and orientation on one side and view controls on the other.",
      "ef-spatial-canvas__orientation": "Text line stating current scope, zoom or region.",
      "ef-spatial-canvas__viewport": "Bordered, focusable scroll region with an 18rem minimum height and a 2px focus outline.",
      "ef-spatial-canvas__surface": "The large surface: at least 48rem by 28rem, a three-column grid of objects with generous gaps.",
      "ef-spatial-canvas__index": "A native `details` listing the objects in view; its summary is a 2.75rem target and its `nav` links wrap."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through view controls, the viewport, links or controls inside objects, then the index summary and links." },
      { keys: "Arrow keys, Page Up / Page Down (viewport focused)", action: "Scrolls the surface. Native scrolling of a focused overflow region." },
      { keys: "Enter / Space on the index summary", action: "Opens or closes the object index. Native details behavior." },
      { keys: "Zoom and reset shortcuts", action: "Not provided. The view buttons are native buttons; their effect and any shortcuts are application or Limen behavior." }
    ],
    events: [
      { name: "toggle", description: "Native event from the index details element." },
      { name: "scroll", description: "Native scroll event from the viewport, which the application can use to update the orientation line and index." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Scope", how: "text in .ef-spatial-canvas__orientation", description: "Application-written description of what is in view." },
    { name: "Viewport focus", how: ":focus-visible on the viewport", description: "2px outline in the current text color, offset from the border." },
    { name: "Index open", how: "details[open]", description: "The list of objects in view is shown below the viewport." },
    { name: "Empty view", how: "no objects on the surface", description: "The application states in text that nothing is in view and how to return." }
  ],
  accessibility: {
    forma: [
      "Provides a keyboard-focusable scroll region with a visible focus outline.",
      "Provides a non-spatial object index with a 44px disclosure target so objects are reachable without panning.",
      "Gives orientation a dedicated text element rather than relying on position or size.",
      "Contains horizontal overflow inside the viewport so the page does not scroll sideways."
    ],
    consumer: [
      "Keep the orientation text and the index in sync with the current view.",
      "Give every object a stable id or URL and link to it from the index.",
      "Provide zoom and reset as buttons, never only as gestures or wheel input, and label the control group with `role=\"group\"` and a name.",
      "When a view change moves focus or selection, do it predictably and announce the new scope.",
      "Offer a non-spatial representation, such as a [[relationship-index]], when the spatial view is not sufficient for verification."
    ]
  },
  responsive: [
    "The root and viewport shrink to their container; the surface keeps its 48rem by 28rem minimum and scrolls inside the viewport.",
    "The header wraps, placing controls below the title on narrow screens.",
    "Index links wrap onto several lines.",
    "No breakpoints: the same structure is used at every width, with the index becoming the primary path on phones."
  ],
  motion: [
    "No animation: scrolling is native and the index opens without transition. Any animated zoom or pan is application behavior and must respect `prefers-reduced-motion`."
  ],
  guidance: {
    do: [
      "Write orientation in the user's terms (\"Floor 3 · east wing\"), not in coordinates.",
      "Keep a Reset view action so users can recover from getting lost."
    ],
    avoid: [
      "Making zoom level or position carry domain meaning.",
      "Hiding objects that are off-screen from the index when they are part of the current scope."
    ]
  },
  related: [
    { slug: "diagram", note: "Consumer-positioned nodes and connectors with a relationship list." },
    { slug: "scope-trail", note: "Shows ancestry of the current scope; compose it in the header." },
    { slug: "relationship-index", note: "The non-spatial representation of relationships." },
    { slug: "bounded-overflow", note: "Generic contained scrolling for wide content that is not spatial." }
  ]
};
