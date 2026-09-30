import { missionById } from "../example-data/nasa-spaceflight.mjs";

const apollo11 = missionById("apollo-11");
const sts31 = missionById("sts-31");

export default {
  name: "Tabs",
  category: "navigation",
  behavior: "Application / Limen",
  summary: "Focused views with keyboard and deep-link integration hooks plus mobile overflow strategy.",
  purpose: {
    description: "Tabs switch between sibling views of one object, such as the Overview, History and Evidence of a record. Forma styles the ARIA tabs structure: a `role=\"tablist\"` of `button role=\"tab\"` elements and `role=\"tabpanel\"` sections. The selected tab is drawn from `aria-selected=\"true\"` with a surface change and an accent underline. Forma has no script, so the application (Limen) owns selection: updating `aria-selected`, showing the right panel with `hidden`, roving `tabindex`, arrow-key movement, manual or automatic activation, and deep-link sync with the URL.",
    useWhen: [
      "One object has several peer views and the user looks at one at a time.",
      "Views are independent enough that hiding the others does not lose context.",
      "The current view should be addressable by URL (deep link)."
    ],
    avoidWhen: [
      "The views are separate pages or destinations: use [[navigation-shell]] or links.",
      "The content is a sequence the user must complete in order: use [[wizard]].",
      "The control filters or changes a value rather than switching views: use [[segmented-control]].",
      "Several sections should be readable together: use [[disclosure]] sections or plain headings."
    ],
    characteristics: [
      "The tab list scrolls horizontally inside itself when tabs overflow; tabs never wrap or shrink.",
      "Each tab is at least 44px tall.",
      "Selection is shown by position cue (a 3px underline) and a surface change, not color alone.",
      "The motion scope defaults to the light preset; the pattern states it explicitly with `data-ef-motion-weight=\"light\"`."
    ]
  },
  examples: [
    {
      id: "history-selected",
      title: "Mission history selected",
      description: "The History tab is selected for Apollo 11. The application applies roving tabindex, hides the other panels and marks the visible panel for entry motion; Forma only presents that state.",
      html: `<ef-tabs class="ef-component-tag">
  <section class="ef-tabs" data-ef-motion-weight="light" aria-labelledby="tabs-history-heading">
    <h2 id="tabs-history-heading">${apollo11.name}</h2>
    <div class="ef-tabs__list" role="tablist" aria-label="${apollo11.name} sections">
      <button type="button" role="tab" id="tabs-history-tab-overview" aria-selected="false" aria-controls="tabs-history-panel-overview" tabindex="-1">Overview</button>
      <button type="button" role="tab" id="tabs-history-tab-history" aria-selected="true" aria-controls="tabs-history-panel-history">History</button>
      <button type="button" role="tab" id="tabs-history-tab-crew" aria-selected="false" aria-controls="tabs-history-panel-crew" tabindex="-1">Crew</button>
    </div>
    <section class="ef-tabs__panel" id="tabs-history-panel-overview" role="tabpanel" aria-labelledby="tabs-history-tab-overview" hidden>
      <h3>Overview</h3><p>${apollo11.highlight}.</p>
    </section>
    <section class="ef-tabs__panel" id="tabs-history-panel-history" role="tabpanel" aria-labelledby="tabs-history-tab-history" data-ef-motion-entry>
      <h3>History</h3><p>Launch ${apollo11.launchDate}. Return ${apollo11.returnDate}. Destination: ${apollo11.destination}.</p>
    </section>
    <section class="ef-tabs__panel" id="tabs-history-panel-crew" role="tabpanel" aria-labelledby="tabs-history-tab-crew" hidden>
      <h3>Crew</h3><p>${apollo11.crew.join(", ")}.</p>
    </section>
  </section>
</ef-tabs>`
    },
    {
      id: "overflowing-tabs",
      title: "Many mission-detail tabs overflowing the list",
      description: "Seven mission-detail tabs in a narrow container scroll horizontally inside their own bounds rather than wrapping. The page itself does not scroll sideways.",
      html: `<ef-tabs class="ef-component-tag">
  <section class="ef-tabs" style="max-inline-size: 24rem;">
    <div class="ef-tabs__list" role="tablist" aria-label="${sts31.name} details">
      <button type="button" role="tab" id="tabs-overflow-tab-summary" aria-selected="true" aria-controls="tabs-overflow-panel-summary">Summary</button>
      <button type="button" role="tab" id="tabs-overflow-tab-crew" aria-selected="false" aria-controls="tabs-overflow-panel-crew" tabindex="-1">Crew</button>
      <button type="button" role="tab" id="tabs-overflow-tab-vehicle" aria-selected="false" aria-controls="tabs-overflow-panel-vehicle" tabindex="-1">Vehicle</button>
      <button type="button" role="tab" id="tabs-overflow-tab-spacecraft" aria-selected="false" aria-controls="tabs-overflow-panel-spacecraft" tabindex="-1">Spacecraft</button>
      <button type="button" role="tab" id="tabs-overflow-tab-destination" aria-selected="false" aria-controls="tabs-overflow-panel-destination" tabindex="-1">Destination</button>
      <button type="button" role="tab" id="tabs-overflow-tab-dates" aria-selected="false" aria-controls="tabs-overflow-panel-dates" tabindex="-1">Dates</button>
      <button type="button" role="tab" id="tabs-overflow-tab-source" aria-selected="false" aria-controls="tabs-overflow-panel-source" tabindex="-1">NASA source</button>
    </div>
    <section class="ef-tabs__panel" id="tabs-overflow-panel-summary" role="tabpanel" aria-labelledby="tabs-overflow-tab-summary"><p>${sts31.highlight}.</p></section>
    <section class="ef-tabs__panel" id="tabs-overflow-panel-crew" role="tabpanel" aria-labelledby="tabs-overflow-tab-crew" hidden><p>${sts31.crew.join(", ")}.</p></section>
    <section class="ef-tabs__panel" id="tabs-overflow-panel-vehicle" role="tabpanel" aria-labelledby="tabs-overflow-tab-vehicle" hidden><p>${sts31.launchVehicle}.</p></section>
    <section class="ef-tabs__panel" id="tabs-overflow-panel-spacecraft" role="tabpanel" aria-labelledby="tabs-overflow-tab-spacecraft" hidden><p>${sts31.spacecraft}.</p></section>
    <section class="ef-tabs__panel" id="tabs-overflow-panel-destination" role="tabpanel" aria-labelledby="tabs-overflow-tab-destination" hidden><p>${sts31.destination}.</p></section>
    <section class="ef-tabs__panel" id="tabs-overflow-panel-dates" role="tabpanel" aria-labelledby="tabs-overflow-tab-dates" hidden><p>${sts31.launchDate} to ${sts31.returnDate}.</p></section>
    <section class="ef-tabs__panel" id="tabs-overflow-panel-source" role="tabpanel" aria-labelledby="tabs-overflow-tab-source" hidden><p><a href="${sts31.source.url}">${sts31.source.title}</a></p></section>
  </section>
</ef-tabs>`
    },
    {
      id: "mobile-scrolling-list",
      title: "Mission tabs on a phone",
      description: "Four mission-detail tabs at phone width. The list scrolls horizontally when the labels no longer fit, while every tab keeps its full label and touch height.",
      mobile: {
        height: 300,
        notes: [
          "Tabs never wrap; the list scrolls horizontally inside its own bounds.",
          "Each tab keeps its natural width and full label.",
          "Every tab remains at least 44px tall.",
          "Applications should scroll the selected tab into view after state changes."
        ]
      },
      html: `<ef-tabs class="ef-component-tag">
  <section class="ef-tabs">
    <div class="ef-tabs__list" role="tablist" aria-label="${apollo11.name} details">
      <button type="button" role="tab" id="tabs-mobile-tab-overview" aria-selected="true" aria-controls="tabs-mobile-panel-overview">Overview</button>
      <button type="button" role="tab" id="tabs-mobile-tab-crew" aria-selected="false" aria-controls="tabs-mobile-panel-crew" tabindex="-1">Crew</button>
      <button type="button" role="tab" id="tabs-mobile-tab-spacecraft" aria-selected="false" aria-controls="tabs-mobile-panel-spacecraft" tabindex="-1">Spacecraft</button>
      <button type="button" role="tab" id="tabs-mobile-tab-destination" aria-selected="false" aria-controls="tabs-mobile-panel-destination" tabindex="-1">Destination</button>
    </div>
    <section class="ef-tabs__panel" id="tabs-mobile-panel-overview" role="tabpanel" aria-labelledby="tabs-mobile-tab-overview"><p>${apollo11.highlight}.</p></section>
    <section class="ef-tabs__panel" id="tabs-mobile-panel-crew" role="tabpanel" aria-labelledby="tabs-mobile-tab-crew" hidden><p>${apollo11.crew.join(", ")}.</p></section>
    <section class="ef-tabs__panel" id="tabs-mobile-panel-spacecraft" role="tabpanel" aria-labelledby="tabs-mobile-tab-spacecraft" hidden><p>${apollo11.spacecraft}.</p></section>
    <section class="ef-tabs__panel" id="tabs-mobile-panel-destination" role="tabpanel" aria-labelledby="tabs-mobile-tab-destination" hidden><p>${apollo11.destination}.</p></section>
  </section>
</ef-tabs>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: "list, buttons, panels", values: "tablist | tab | tabpanel", default: "—", description: "Required ARIA tabs roles. Forma's selectors target [role=\"tab\"] inside the list." },
      { name: "aria-selected", on: "tab", values: "true | false", default: "—", description: "Set by the application. Forma draws the selected treatment from aria-selected=\"true\"." },
      { name: "aria-controls", on: "tab", values: "id of its panel", default: "—", description: "Links each tab to its panel. Every referenced panel must exist in the DOM." },
      { name: "aria-labelledby", on: "tabpanel", values: "id of its tab", default: "—", description: "Names the panel after its tab." },
      { name: "aria-label", on: "tablist", values: "string", default: "—", description: "Names the set of tabs." },
      { name: "tabindex", on: "tab", values: "-1 on unselected tabs", default: "0 (native button)", description: "Roving tab stop written by the application so Tab enters the list once, at the selected tab." },
      { name: "hidden", on: "tabpanel", values: "boolean", default: "absent", description: "Hides inactive panels. The application toggles it with selection." },
      { name: "type", on: "tab", values: "button", default: "—", description: "Prevents tabs inside a form from submitting it." }
    ],
    hooks: {
      "ef-tabs": "Root section and motion scope.",
      "ef-tabs__list": "The tablist: a flex row with a bottom rule that scrolls horizontally when tabs overflow.",
      "ef-tabs__panel": "A tab panel with vertical padding.",
      "data-ef-motion-weight": "Presentation-only perceived mass for the underline and tab settle: light (default here), standard or heavy. Never encodes importance.",
      "data-ef-motion-entry": "Presence attribute on `.ef-tabs__panel`. When the panel is inserted or un-hidden it starts at zero opacity and 0.25rem lower, then settles into place."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Native: moves focus to and from the tab list. With application roving tabindex, only the selected tab is a stop; then Tab moves into the panel." },
      { keys: "Enter / Space", action: "Native button activation. The application selects the focused tab in response." },
      { keys: "Left / Right Arrow, Home, End", action: "Not native. The application must move focus between tabs and, for automatic activation, select on focus." }
    ],
    events: [
      { name: "click", description: "Native click on a tab button; the application updates aria-selected, tabindex, hidden and the URL." }
    ],
    form: "Does not participate in forms. Tabs are buttons with type=\"button\" so they never submit."
  },
  states: [
    { name: "Unselected", how: "aria-selected=\"false\"", description: "Transparent tab, nudged 0.08rem down, underline scaled to zero." },
    { name: "Selected", how: "aria-selected=\"true\"", description: "Secondary surface, settled position and a 3px accent underline." },
    { name: "Focus", how: ":focus-visible", description: "Foundation two-tone focus ring on the tab." },
    { name: "Panel shown", how: "hidden removed, optional data-ef-motion-entry", description: "Panel visible; with the entry hook it fades and rises into place." },
    { name: "Overflowing", how: "tabs wider than the list", description: "The list scrolls horizontally inside itself." }
  ],
  accessibility: {
    forma: [
      "Keeps tabs as native buttons so they are focusable and activate with Enter or Space.",
      "Shows selection with a positional underline plus a surface change, not color alone.",
      "Keeps 44px tab height and contains overflow in the list."
    ],
    consumer: [
      "Keep aria-selected, tabindex and panel hidden state in sync on every change.",
      "Implement arrow, Home and End navigation and choose manual or automatic activation.",
      "Make every aria-controls target exist, even for inactive panels.",
      "Sync the selected tab with the URL for deep links and restore it on load."
    ]
  },
  responsive: [
    "The tab list scrolls inline (`overflow-x: auto`, thin scrollbar) instead of wrapping.",
    "Tabs keep their intrinsic width; long labels widen the tab rather than truncating.",
    "No breakpoints; the same structure is used at every width."
  ],
  motion: [
    "The underline grows from zero width and the selected tab rises 0.08rem into place using the inertial spring timing of the light preset, so the change reads as a quick, light cue.",
    "Tab surface color uses the shared perceptual interpolation.",
    "A panel with `data-ef-motion-entry` fades in and rises 0.25rem when it appears.",
    "Selection state is set immediately by the application; motion only follows it.",
    "Under `prefers-reduced-motion: reduce` these transitions are effectively instant."
  ],
  guidance: {
    do: [
      "Use short, noun labels and keep the tab order stable.",
      "Put the most used view first."
    ],
    avoid: [
      "Using tabs as page navigation between unrelated destinations.",
      "Hiding critical warnings in a non-selected tab."
    ]
  },
  related: [
    { slug: "segmented-control", note: "Changes a value or filter in place rather than switching panels." },
    { slug: "navigation-shell", note: "For destinations that are separate pages." },
    { slug: "wizard", note: "For ordered steps that must be completed in sequence." },
    { slug: "disclosure", note: "Shows or hides one section while keeping others visible." }
  ]
};
