export default {
  name: "Security state matrix",
  category: "security",
  behavior: "Aegis / application",
  summary: "Counts security results by explicit state (Verified, Violated, Unknown, Stale, N/A) so no state collapses into another or into a score.",
  purpose: {
    description: "The security state matrix shows how many invariants or evidence records Tutela places in each state: Verified, Violated, Unknown, Stale and N/A. Each state is a labelled tile with its count as large text, and every state is always shown, including zero, so Unknown and Stale are as visible as Violated. It is a count display, not a score: the tiles are never summed into a percentage or grade. To compare several scopes, repeat the matrix once per scope with the scope named in its heading. Tutela supplies the counts; Forma never computes them.",
    useWhen: [
      "A release or review page needs a quick, honest overview of evidence states for one scope.",
      "Unknown and stale counts must be shown with the same weight as violations.",
      "Several scopes need side-by-side overviews, each with its own labelled matrix."
    ],
    avoidWhen: [
      "You need a true two-dimensional table (for example boundary × state with row and column headers): use a native table through [[data-grid]] so header scope is announced.",
      "You need the posture and its blockers: use [[security-posture]].",
      "You want a single headline score or percentage: Tutela forbids a composite score as the primary representation.",
      "You need a general KPI tile: use [[metric-card]]."
    ],
    characteristics: [
      "A description list: each tile's term is the state name and its value is the count, so pairs are announced together.",
      "Tiles share one visual treatment (top border and secondary surface); the state name, not color, distinguishes them.",
      "Tiles auto-fit columns of at least 7rem and wrap to more rows as space shrinks.",
      "`data-state` on each tile carries the machine state name."
    ]
  },
  examples: [
    {
      id: "new-artifact",
      title: "New artifact with nothing verified yet",
      description: "Counts for an artifact that has just been assessed. Zero counts are shown rather than omitted, so the large Unknown count is read in context.",
      html: `<ef-security-state-matrix class="ef-component-tag">
  <section class="ef-security-state-matrix" aria-labelledby="security-state-matrix-new-artifact-title">
    <h2 id="security-state-matrix-new-artifact-title">Security evidence state for build 7f3c9a2</h2>
    <dl class="ef-security-state-matrix__grid">
      <div data-state="verified"><dt>Verified</dt><dd>0</dd></div>
      <div data-state="violated"><dt>Violated</dt><dd>0</dd></div>
      <div data-state="unknown"><dt>Unknown</dt><dd>26</dd></div>
      <div data-state="stale"><dt>Stale</dt><dd>0</dd></div>
      <div data-state="na"><dt>N/A</dt><dd>2</dd></div>
    </dl>
  </section>
</ef-security-state-matrix>`
    },
    {
      id: "per-scope",
      title: "One matrix per assessed scope",
      description: "Two scopes compared by repeating the matrix, each with the scope in its heading. The layout never implies that counts from different scopes can be added together.",
      html: `<ef-security-state-matrix class="ef-component-tag">
  <div class="ef-stack">
    <section class="ef-security-state-matrix" aria-labelledby="security-state-matrix-per-scope-auth-title">
      <h3 id="security-state-matrix-per-scope-auth-title">Authentication boundary</h3>
      <dl class="ef-security-state-matrix__grid">
        <div data-state="verified"><dt>Verified</dt><dd>9</dd></div>
        <div data-state="violated"><dt>Violated</dt><dd>0</dd></div>
        <div data-state="unknown"><dt>Unknown</dt><dd>1</dd></div>
        <div data-state="stale"><dt>Stale</dt><dd>0</dd></div>
        <div data-state="na"><dt>N/A</dt><dd>1</dd></div>
      </dl>
    </section>
    <section class="ef-security-state-matrix" aria-labelledby="security-state-matrix-per-scope-egress-title">
      <h3 id="security-state-matrix-per-scope-egress-title">Network egress boundary</h3>
      <dl class="ef-security-state-matrix__grid">
        <div data-state="verified"><dt>Verified</dt><dd>2</dd></div>
        <div data-state="violated"><dt>Violated</dt><dd>1</dd></div>
        <div data-state="unknown"><dt>Unknown</dt><dd>2</dd></div>
        <div data-state="stale"><dt>Stale</dt><dd>2</dd></div>
        <div data-state="na"><dt>N/A</dt><dd>0</dd></div>
      </dl>
    </section>
  </div>
</ef-security-state-matrix>`
    },
    {
      id: "mobile",
      title: "State counts on a phone",
      description: "The five state tiles at phone width.",
      mobile: {
        height: 420,
        notes: [
          "Tiles auto-fit columns of at least 7rem, so at 320px they form two columns and wrap onto three rows; the source order Verified, Violated, Unknown, Stale, N/A reads left to right, top to bottom.",
          "Counts use a fluid size (`clamp(1.4rem, 4vw, 2rem)`), so they shrink slightly on phones without truncation.",
          "The tiles are not interactive, so there are no touch targets to size.",
          "In landscape more tiles fit per row; order is unchanged."
        ]
      },
      html: `<ef-security-state-matrix class="ef-component-tag">
  <section class="ef-security-state-matrix" aria-labelledby="security-state-matrix-mobile-title">
    <h2 id="security-state-matrix-mobile-title">Security evidence state</h2>
    <dl class="ef-security-state-matrix__grid">
      <div data-state="verified"><dt>Verified</dt><dd>18</dd></div>
      <div data-state="violated"><dt>Violated</dt><dd>1</dd></div>
      <div data-state="unknown"><dt>Unknown</dt><dd>3</dd></div>
      <div data-state="stale"><dt>Stale</dt><dd>2</dd></div>
      <div data-state="na"><dt>N/A</dt><dd>4</dd></div>
    </dl>
  </section>
</ef-security-state-matrix>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "section.ef-security-state-matrix", values: "id of the heading", default: "—", description: "Names the region; include the scope or subject in the heading." },
      { name: "data-state", on: ".ef-security-state-matrix__grid > div", values: "verified | violated | unknown | stale | na", default: "—", description: "Machine state name for the tile. Not styled by Forma CSS; the dt text is the visible label." }
    ],
    hooks: {
      "ef-security-state-matrix": "Root section: bordered, padded primary surface.",
      "ef-security-state-matrix__grid": "Description list laid out as an auto-fit grid of tiles at least 7rem wide. Each tile has a 0.25rem top border in the current text color (CanvasText in forced colors) and a secondary surface; dt is a small bold label and dd a large fluid count."
    },
    keyboard: [
      { keys: "—", action: "Not interactive. Link to detailed lists from surrounding content if readers need to drill in." }
    ],
    events: [
      { name: "—", description: "No events." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Verified", how: "tile data-state=\"verified\"", description: "Count of verified results." },
    { name: "Violated", how: "tile data-state=\"violated\"", description: "Count of violated results." },
    { name: "Unknown", how: "tile data-state=\"unknown\"", description: "Count of results that could not be established; same visual weight as Violated." },
    { name: "Stale", how: "tile data-state=\"stale\"", description: "Count of results whose evidence is invalidated." },
    { name: "N/A", how: "tile data-state=\"na\"", description: "Count of results not applicable to the scope." }
  ],
  accessibility: {
    forma: [
      "Uses a description list so each state name is announced with its count.",
      "Gives every state the same visual treatment, so none is hidden or de-emphasized and color is never the cue.",
      "Keeps tile borders visible as CanvasText in forced-colors mode."
    ],
    consumer: [
      "Always render all five states, including zero counts.",
      "Name the scope or subject in the heading.",
      "Do not add a total, percentage or grade derived from the counts.",
      "Use a native table with row and column headers when you truly need two dimensions."
    ]
  },
  responsive: [
    "The grid auto-fits tiles of at least 7rem, reflowing from one row of five to two or three rows on phones.",
    "Counts use a fluid font size between 1.4rem and 2rem.",
    "No breakpoints; order is preserved at every width."
  ],
  motion: [
    "No animation: counts change by re-rendering. Numbers do not tick or count up, which could misrepresent the supplied values."
  ],
  guidance: {
    do: [
      "Keep the state order consistent across pages (Verified, Violated, Unknown, Stale, N/A).",
      "Pair the matrix with links to the underlying invariant or evidence lists."
    ],
    avoid: [
      "Coloring Violated red and Verified green as the only distinction.",
      "Dropping zero-count tiles."
    ]
  },
  related: [
    { slug: "security-posture", note: "The overall posture with subject, scope and blockers." },
    { slug: "data-grid", note: "A native table for true two-dimensional data with row and column header scope." },
    { slug: "metric-card", note: "A general single-metric tile, not a security state breakdown." },
    { slug: "security-trend", note: "How these counts changed compared with a previous artifact." }
  ]
};
