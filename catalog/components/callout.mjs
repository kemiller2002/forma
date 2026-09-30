export default {
  name: "Callout",
  category: "site",
  behavior: "Site content",
  summary: "Labelled note, caution, evidence, or decision inside prose; a visible label and rule pattern carry the kind without relying on color.",
  purpose: {
    description: "A callout marks supporting material inside long-form content that a reader must notice: a note, a caution, cited evidence or a recorded decision. Each callout starts with a visible `.ef-callout__label` naming its kind and is named by that label through `aria-labelledby`. `data-ef-callout` selects the kind; each kind has its own rule pattern (solid, heavy frame, dashed, double) so kinds stay distinct in grayscale, forced colors and print. Notes, cautions and decisions are `aside` elements; evidence is a `figure` holding a `blockquote` and a `figcaption`. Callouts have no state and no runtime.",
    useWhen: [
      "A reader could skip useful context and should see it is optional (note).",
      "A consequence must be weighed before acting on the surrounding text (caution).",
      "Quoting or citing source material with its source (evidence).",
      "Recording a settled outcome that later sections refer to (decision)."
    ],
    avoidWhen: [
      "Ordinary emphasis, decoration or a pull quote: use `strong`, a plain `blockquote` or a heading in [[prose]].",
      "Reporting live application status, errors or success: use [[alert]] or [[validation-message]].",
      "Asking the reader to act on the whole page: use a [[cta]]."
    ],
    characteristics: [
      "The visible label is the primary cue; the rule pattern is the second, non-color cue; color is only a third.",
      "Note (or no `data-ef-callout`) is a solid accent-width inline-start rule; caution adds a heavy block-start rule and a strong frame; evidence has a dashed frame; decision has a double inline-start rule.",
      "Callouts keep the reading measure and read in source order; nothing is floated or moved."
    ]
  },
  examples: [
    {
      id: "caution-before-upgrade",
      title: "Caution before an upgrade step",
      description: "An upgrade guide where one step has a consequence. The caution sits directly after the paragraph it qualifies, with a list inside.",
      html: `<ef-callout class="ef-component-tag">
  <div class="ef-site">
    <article class="ef-prose">
      <h3>Upgrade to 0.4.0</h3>
      <p>Edit <code>forma.lock</code> to the new version, then run the installer with <code>--update</code>.</p>
      <aside class="ef-callout" data-ef-callout="caution" aria-labelledby="callout-caution-before-upgrade-label">
        <p class="ef-callout__label" id="callout-caution-before-upgrade-label">Caution</p>
        <p>This release renames two classes. Before deploying:</p>
        <ul><li>search the site for the old class names;</li><li>run the local-CSS policy check.</li></ul>
      </aside>
      <p>Commit the lock and any markup changes as one reviewable change.</p>
    </article>
  </div>
</ef-callout>`
    },
    {
      id: "evidence-and-decision",
      title: "Evidence followed by a decision",
      description: "A design record: measured evidence as a figure with its source, then the decision it supports. Later sections can refer to the decision by its label.",
      html: `<ef-callout class="ef-component-tag">
  <div class="ef-site">
    <article class="ef-prose">
      <h3>Why the header is not sticky on phones</h3>
      <figure class="ef-callout" data-ef-callout="evidence" aria-labelledby="callout-evidence-and-decision-evidence">
        <p class="ef-callout__label" id="callout-evidence-and-decision-evidence">Evidence</p>
        <blockquote><p>At 390 by 844 pixels a sticky two-line header covered 14% of the viewport and hid focused links in 3 of 12 keyboard sweeps.</p></blockquote>
        <figcaption>Source: focus-sweep test, September 2026</figcaption>
      </figure>
      <aside class="ef-callout" data-ef-callout="decision" aria-labelledby="callout-evidence-and-decision-decision">
        <p class="ef-callout__label" id="callout-evidence-and-decision-decision">Decision</p>
        <p>The header sticks only at 40rem wide and 36rem tall or more.</p>
      </aside>
    </article>
  </div>
</ef-callout>`
    },
    {
      id: "mobile-note",
      title: "Phone note in an article",
      description: "A note inside an article at phone width, containing a long inline code value.",
      mobile: {
        height: 360,
        notes: [
          "The callout is capped at the reading measure and shrinks to the column; its padding stays compact so text keeps most of the width.",
          "Text inside wraps; long inline code values break anywhere rather than widening the page.",
          "There are no interactive targets of its own; links inside keep the shell's underline and focus ring.",
          "There are no fixed heights, so 200% text and text-spacing overrides grow the callout instead of clipping it."
        ]
      },
      html: `<ef-callout class="ef-component-tag">
  <div class="ef-site">
    <article class="ef-prose">
      <p>Sites load the theme's webfonts themselves.</p>
      <aside class="ef-callout" data-ef-callout="note" aria-labelledby="callout-mobile-note-label">
        <p class="ef-callout__label" id="callout-mobile-note-label">Note</p>
        <p>Fallback stacks are defined, so pages stay readable if <code>fonts.googleapis.com/css2?family=IBM+Plex+Mono</code> fails to load.</p>
      </aside>
    </article>
  </div>
</ef-callout>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: ".ef-callout", values: "id of .ef-callout__label", default: "—", description: "Required. Names the aside or figure by its visible label, so it is announced as, for example, a \"Caution\" complementary region." },
      { name: "id", on: ".ef-callout__label", values: "string", default: "—", description: "Referenced by the callout's aria-labelledby." }
    ],
    hooks: {
      "ef-callout": "Root (`aside`, or `figure` for evidence). Bordered block with an accent-width inline-start rule, kept to the reading measure.",
      "ef-callout__label": "Visible kind label in mono uppercase label type. Always the first child.",
      "data-ef-callout": "Kind: `note` (default styling), `caution` (heavy block-start rule and strong frame), `evidence` (dashed frame) or `decision` (double inline-start rule).",
      "--ef-callout-rule": "Color of the inline-start rule. Defaults to the tone's strong rule; caution uses the warning status color, evidence the info status color and decision the primary accent."
    },
    keyboard: [
      { keys: "—", action: "Not interactive. Links inside follow native link behavior." }
    ],
    events: []
  },
  states: [
    { name: "Note", how: "data-ef-callout=\"note\" or absent", description: "Solid inline-start rule on a hairline frame." },
    { name: "Caution", how: "data-ef-callout=\"caution\"", description: "Heavy block-start rule and full-strength frame." },
    { name: "Evidence", how: "data-ef-callout=\"evidence\" on a figure", description: "Dashed frame with a solid inline-start rule; the quotation reads as body text with a muted source caption." },
    { name: "Decision", how: "data-ef-callout=\"decision\"", description: "Double inline-start rule at twice the accent width." },
    { name: "Forced colors and print", how: "@media (forced-colors: active), print", description: "Borders become CanvasText; in print the callout is not split across pages." }
  ],
  accessibility: {
    forma: [
      "Distinguishes kinds by visible label and rule pattern, not color alone.",
      "Keeps text at primary contrast on every tone and the label at the validated label color.",
      "Keeps the frame visible in forced colors and print and avoids page breaks inside a callout."
    ],
    consumer: [
      "Start every callout with a visible label and reference it with `aria-labelledby`.",
      "Use `aside` for note, caution and decision, and `figure` with `blockquote` and `figcaption` for evidence.",
      "Place the callout next to the text it qualifies and keep callouts rare."
    ]
  },
  responsive: [
    "Capped at `--ef-layout-measure`; shrinks with its column. No breakpoints.",
    "Content wraps; there are no fixed heights."
  ],
  motion: [
    "No animation: callouts are static and declare no transitions or animations, with or without reduced motion."
  ],
  guidance: {
    do: [
      "Choose the kind by what the reader must do with it: skip, weigh, verify or refer back.",
      "Cite a source in every evidence callout."
    ],
    avoid: [
      "Using a caution for ordinary emphasis; it loses force.",
      "Nesting callouts or placing a callout inside another component."
    ]
  },
  related: [
    { slug: "prose", note: "The long-form region callouts sit inside." },
    { slug: "alert", note: "For live application messages and status." },
    { slug: "cta", note: "For closing actions, not supporting remarks." }
  ]
};
