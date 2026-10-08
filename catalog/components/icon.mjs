// Source of icon geometry is icons/registry.json. Catalog examples are rendered
// from the compiler at build time; never duplicate hand-authored SVG paths here.
import fs from "node:fs";
import { compileIcons } from "../../tools/icons/build.mjs";

const registry = JSON.parse(fs.readFileSync(new URL("../../icons/registry.json", import.meta.url), "utf8"));
const assets = compileIcons(registry);
const icon = name => assets.get("html/" + name + ".html").trim();

export default {
  name: "Icon",
  category: "utilities",
  behavior: "Static presentation",
  summary: "Brand-neutral, zero-runtime inline SVG icons compiled from Forma's reviewed registry, with explicit decorative and accessible use.",
  owns: ["ef-icon"],
  purpose: {
    description: "Forma emits deterministic inline SVG geometry at build time from its icon registry. The inert <ef-icon> authoring tag is not a registered custom element. Each default inline icon is decorative and aria-hidden; the native button, heading or adjacent words carry human-facing meaning and an accessible name. Semantic status and application state remain outside icons.",
    useWhen: [
      "Use a small visual cue beside a text label in a toolbar, menu, workflow or record.",
      "Use a version-pinned icon for print or offline exports that must render without a network request.",
      "Present an icon-only action only inside a real, accessible native button."
    ],
    avoidWhen: [
      "An icon would be the only way to communicate status; use visible explanatory text or [[status-lozenge]].",
      "A control has no accessible name; icon geometry does not name or operate a control.",
      "The content is a large illustration or brand logo rather than a standard visual affordance."
    ],
    characteristics: [
      "The initial library supplies eight original 24×24, round-stroke outline icons.",
      "Color inherits currentColor; size uses --ef-icon-size, default 1.25em.",
      "Compiled inline SVG needs no runtime JavaScript, external sprites, fonts or CDN."
    ]
  },
  examples: [
    {
      id: "toolbar-search",
      title: "Search command with visible label",
      description: "Decorative search icon inside a native, visibly named button. Both pointer activation and Playwright role/name lookup belong to the button, never to the icon.",
      html: `<ef-icon class="ef-component-tag">
  <button type="button">${icon("search")} Search</button>
</ef-icon>`
    },
    {
      id: "explicit-warning",
      title: "Warning accompanied by text",
      description: "A warning indicator remains meaningful in grayscale and forced colors because the words, not the SVG color, communicate the state.",
      html: `<ef-icon class="ef-component-tag">
  <p>${icon("warning")} Warning: review incomplete.</p>
</ef-icon>`
    },
    {
      id: "mobile-icon-action",
      title: "Icon action on a narrow screen",
      description: "The accessible name comes from aria-label on the native 44px button; the SVG remains aria-hidden. No gesture, coordinate selector or icon-generated event is required.",
      mobile: {
        height: 230,
        notes: [
          "The parent button supplies the touch target while the icon remains a 1.25em decorative SVG.",
          "At 320px, both controls stay in the wrapping native cluster without horizontal overflow.",
          "A role+accessible-name locator finds the Edit button independently of its SVG.",
          "The icon does not determine whether editing is allowed or complete."
        ]
      },
      html: `<ef-icon class="ef-component-tag">
  <div class="ef-cluster" role="group" aria-label="Document actions">
    <button type="button" aria-label="Edit document">${icon("edit")}</button>
    <button type="button" aria-label="Close document">${icon("close")}</button>
  </div>
</ef-icon>`
    }
  ],
  api: {
    attributes: [
      { name: "data-ef-icon", on: "span.ef-icon", values: "registered name", default: "source icon ID", description: "Stable metadata used for inspection and tooling, not an executable icon-loading mechanism." },
      { name: "aria-hidden", on: "svg.ef-icon__svg", values: "true", default: "true in pre-rendered HTML", description: "The generated inline SVG is decorative; consumers supply the accessible label on a containing control or via nearby text." }
    ],
    hooks: {
      "ef-icon": "Presentational inline-flex container; semantic <ef-icon> authoring tags remain inert.",
      "ef-icon__svg": "Inline 24-unit SVG geometry that scales with the .ef-icon container.",
      "data-ef-icon": "Stable registered icon identifier, distinct from application state.",
      "--ef-icon-size": "CSS custom property controlling inline icon size."
    },
    keyboard: [{ keys: "None", action: "An icon is inert; keyboard operation belongs to a native button, link or other named host control." }],
    events: [{ name: "None", description: "The icon has no events or state transitions." }],
    form: "Not a form control."
  },
  states: [
    { name: "Decorative", how: "Generated SVG has aria-hidden=true and focusable=false", description: "The application uses text and semantic markup to supply meaning." },
    { name: "Themed", how: "Set text color on the ancestor or a standard Forma brand scope", description: "SVG stroke follows currentColor without changing icon identity." },
    { name: "Resized", how: "Override --ef-icon-size", description: "Geometry scales from a fixed 24×24 viewBox without loading new artwork." }
  ],
  accessibility: {
    forma: [
      "Decorative inline SVG is removed from the accessibility tree.",
      "currentColor and system-color projection work with forced colors and print.",
      "Icons do not create hidden clickable surfaces or automatically attach roles."
    ],
    consumer: [
      "Provide an explicit accessible name on every icon-only native control.",
      "Pair warnings, success and failure icons with visible text; never encode severity in glyph shape alone.",
      "When a standalone SVG is meaning-bearing, add a correct role and localized accessible label instead of relying on the decorative snippet."
    ]
  },
  responsive: [
    "Icons scale with inline text and never require an independent touch target.",
    "Surrounding native controls keep 44px target sizing and can wrap to 320px.",
    "Changing --ef-icon-size does not override container or application breakpoints."
  ],
  motion: ["No animation is applied to icon geometry. If a consuming application animates a state transition, it must obey reduced-motion and publish an authoritative completion signal."],
  guidance: {
    do: [
      "Use the original SVGs or generated inline HTML from the pinned Forma package.",
      "Label button actions using localized text or aria-label on the real button.",
      "Use text labels in printable, grayscale and accessibility-critical contexts."
    ],
    avoid: [
      "Writing a JavaScript custom-element registration or loading an icon sprite at runtime.",
      "Using an SVG as the only way for Playwright or a screen reader to discover controls.",
      "Changing names or appearance to imply application permission, legality or a completed operation."
    ]
  },
  related: [
    { slug: "button", note: "Native control that owns icon-only actions and accessible naming." },
    { slug: "status-lozenge", note: "Explicit state text with redundant glyph treatment." },
    { slug: "visually-hidden", note: "Accessible hidden text for controls whose visual affordance is an icon." }
  ]
};
