export default {
  name: "Relationship index",
  category: "data",
  behavior: "Application content",
  summary: "Provides a semantic non-spatial index of entity relationships and their direction.",
  purpose: {
    description: "A relationship index lists the relationships of one selected entity as text: each row names a relationship type with its direction (Depends on, Depended on by, Publishes to) and links to the related entities. It is the non-spatial equivalent of the lines in a [[diagram]] or [[spatial-canvas]], so users who cannot see or navigate the drawing still get the complete set of connections. Forma lays it out as a description list; the relationships, their direction wording and their order come from the application's model.",
    useWhen: [
      "A diagram, map or canvas shows connections and needs an accessible, text-only equivalent.",
      "Users inspect one entity and need its incoming and outgoing relationships at a glance.",
      "Related entities are navigable, and each should be a link."
    ],
    avoidWhen: [
      "An ordered route through several entities is shown: use [[path-summary]].",
      "The relationship is between a claim and its evidence: use [[evidence-relationship]].",
      "The entity's own properties (owner, status) are shown: use [[key-value-list]].",
      "The structure is a strict parent/child hierarchy: use [[hierarchy-tree]]."
    ],
    characteristics: [
      "Section grid with a header (title and selected entity) and a description list.",
      "Each row is a `div` with the relationship type as a bold `dt` (`minmax(7rem, 10rem)`) and targets in a `dd` with no indent.",
      "Direction is carried by the relationship wording, not by arrows or position.",
      "At 30rem and below each row stacks the type above its targets."
    ]
  },
  examples: [
    {
      id: "incoming-and-outgoing",
      title: "Incoming and outgoing relationships",
      description: "Both directions for the Billing service. Outgoing (Depends on) and incoming (Depended on by) are distinct relationship names, and several targets share a row as a comma-separated list of links. A relationship with no targets says None recorded.",
      html: `<ef-relationship-index class="ef-component-tag">
  <section class="ef-relationship-index" aria-labelledby="relationship-index-incoming-and-outgoing-title">
    <header><h2 id="relationship-index-incoming-and-outgoing-title">Relationships of Billing</h2><p>Direction is stated from Billing's point of view.</p></header>
    <dl class="ef-relationship-index__list">
      <div><dt>Depends on</dt><dd><a href="#relationship-index-incoming-and-outgoing-chrona">Chrona</a>, <a href="#relationship-index-incoming-and-outgoing-ledger">Ledger</a></dd></div>
      <div><dt>Depended on by</dt><dd><a href="#relationship-index-incoming-and-outgoing-summa">Summa</a>, <a href="#relationship-index-incoming-and-outgoing-portal">Customer portal</a>, <a href="#relationship-index-incoming-and-outgoing-reports">Finance reports</a></dd></div>
      <div><dt>Publishes to</dt><dd><a href="#relationship-index-incoming-and-outgoing-events">invoice.events topic</a></dd></div>
      <div><dt>Replaces</dt><dd>None recorded</dd></div>
    </dl>
  </section>
</ef-relationship-index>`
    },
    {
      id: "diagram-equivalent",
      title: "Text equivalent of a diagram selection",
      description: "The index sits under a system map and updates with the selected node. The header names the selection and states that the list mirrors the diagram's connections, including one the diagram marks as unverified.",
      html: `<ef-relationship-index class="ef-component-tag">
  <section class="ef-relationship-index" aria-labelledby="relationship-index-diagram-equivalent-title">
    <header><h2 id="relationship-index-diagram-equivalent-title">Connections of the selected node</h2><p>Selected: Payments gateway. Lists every connector drawn in the system map.</p></header>
    <dl class="ef-relationship-index__list">
      <div><dt>Sends requests to</dt><dd><a href="#relationship-index-diagram-equivalent-bank">Bank connector</a></dd></div>
      <div><dt>Receives from</dt><dd><a href="#relationship-index-diagram-equivalent-checkout">Checkout</a></dd></div>
      <div><dt>Reports to</dt><dd><a href="#relationship-index-diagram-equivalent-monitoring">Monitoring</a> (unverified: last seen 3 days ago)</dd></div>
    </dl>
  </section>
</ef-relationship-index>`
    },
    {
      id: "mobile-relationships",
      title: "Mobile relationship index",
      description: "The index at phone width, where each relationship type sits above its targets.",
      mobile: {
        height: 400,
        notes: [
          "At 30rem (480px) and below each row becomes one column with a 0.25rem gap: relationship type, then targets.",
          "Several targets in one `dd` wrap as inline links; keep link text meaningful so each is a usable tap target.",
          "Because the index is text, it is often the primary way to explore connections on a phone where a diagram would need panning.",
          "Order and wording are the same at every width."
        ]
      },
      html: `<ef-relationship-index class="ef-component-tag">
  <section class="ef-relationship-index" aria-labelledby="relationship-index-mobile-relationships-title">
    <header><h2 id="relationship-index-mobile-relationships-title">Relationships</h2><p>Selected entity: Customer record</p></header>
    <dl class="ef-relationship-index__list">
      <div><dt>Owned by</dt><dd><a href="#relationship-index-mobile-relationships-sales">Sales domain</a></dd></div>
      <div><dt>Referenced by</dt><dd><a href="#relationship-index-mobile-relationships-invoices">Invoices</a>, <a href="#relationship-index-mobile-relationships-tickets">Support tickets</a></dd></div>
    </dl>
  </section>
</ef-relationship-index>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-relationship-index", values: "id of the header heading", default: "—", description: "Names the index, ideally including the selected entity." },
      { name: "href", on: "a", values: "URL or fragment", default: "—", description: "Each related entity links to its own view or to its node." }
    ],
    hooks: {
      "ef-relationship-index": "Root section; a grid with 0.75rem gaps. Removes the trailing margin of the header's last child.",
      "ef-relationship-index__list": "The `dl`. Each `div` row is a two-column grid (`minmax(7rem, 10rem)` type, flexible targets); `dt` is semibold and `dd` has no margin. Rows stack at 30rem and below."
    },
    keyboard: [
      { keys: "Tab", action: "Moves through the links to related entities." },
      { keys: "Enter", action: "Follows the focused link (native)." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Relationship with targets", how: "dt plus dd containing links", description: "Type and linked entities." },
    { name: "No targets", how: "application text such as None recorded", description: "Stated in words so absence is explicit." },
    { name: "Stacked", how: "viewport ≤ 30rem", description: "Type above targets." }
  ],
  accessibility: {
    forma: [
      "Uses a native description list, so each relationship type is associated with its targets.",
      "Expresses direction in text, independent of any diagram geometry or arrow glyph.",
      "Keeps the same reading order at every width."
    ],
    consumer: [
      "Word each relationship with its direction from the selected entity's point of view.",
      "Include every relationship the diagram shows, including uncertain ones, with their status in text.",
      "Update the header and list when the selection changes, and announce the change if it happens without navigation.",
      "Put one `dd` per row; list several targets inside it."
    ]
  },
  responsive: [
    "Two columns above 30rem; stacked at 30rem and below.",
    "Targets wrap inside the flexible column; the type column is capped at 10rem."
  ],
  motion: [
    "No animation: the index is static and replaced by the application when the selection changes."
  ],
  guidance: {
    do: [
      "Use consistent relationship names across the product and in the diagram legend.",
      "Link every related entity."
    ],
    avoid: [
      "Arrows or symbols as the only indication of direction.",
      "Multiple `dd` elements in one row; the grid places the second one under the type."
    ]
  },
  related: [
    { slug: "path-summary", note: "One ordered route through several entities rather than all relationships of one." },
    { slug: "diagram", note: "The spatial drawing whose connections the index lists as text." },
    { slug: "key-value-list", note: "Properties of an entity rather than its relationships." },
    { slug: "hierarchy-tree", note: "Parent/child structure with expandable levels." }
  ]
};
